import test from 'node:test';
import assert from 'node:assert/strict';
import {
    validateSentinelCatalogue,
    selectSentinelScenes,
    createSentinelBurnLayer,
    isSentinelReleaseApproved,
} from '../src/lib/utils/sentinelBurnLayer.js';

const catalogue = {
    version: 2,
    scenes: ['PB', 'HR'].map((state, index) => ({
        id: state,
        state,
        before: '2026-11-04',
        after: index ? '2026-11-11' : '2026-11-17',
        bounds: [73.8, 27.6, 77.7, 32.6],
        tilePrefix: state,
        maxNativeZoom: 13,
        tiles: ['7/90/50'],
        coverage: 'state-intersections',
        method: 'experimental-dnbr',
        resolutionMetres: 20,
    })),
};
const dates = ['2026-11-11', '2026-11-17'];

test('Sentinel observations respect state and acquisition dates, never future observations', () => {
    validateSentinelCatalogue(catalogue);
    assert.equal(selectSentinelScenes(catalogue, 'PB', dates).length, 1);
    assert.equal(selectSentinelScenes(catalogue, 'HR', dates).length, 1);
    assert.equal(selectSentinelScenes(catalogue, 'PB', ['2026-11-16']).length, 0);
    assert.equal(selectSentinelScenes(catalogue, 'HR', ['2026-11-17']).length, 1);
    assert.equal(selectSentinelScenes(catalogue, 'HR', ['2026-11-26']).length, 0);
    assert.equal(selectSentinelScenes(catalogue, 'HR', ['2026-11-16', '2026-11-17']).length, 0);
    assert.equal(selectSentinelScenes(catalogue, 'PB', []).length, 0);
});

test('catalogue rejects external imagery, invalid dates, unsupported methods and malformed bounds', () => {
    for (const patch of [
        { tilePrefix: 'https://example.com/a.png' },
        { tilePrefix: '../a.png' },
        { after: '2026-02-30' },
        { before: '2026-12-01' },
        { state: 'OTHER' },
        { bounds: [75, 31, 74, 30] },
        { method: 'VIIRS' },
        { coverage: 'sample' },
        { tiles: ['13/8192/0'] },
        { tiles: ['4/0/0'] },
        { tiles: ['7/90/50', '7/90/50'] },
    ]) {
        const broken = structuredClone(catalogue);
        Object.assign(broken.scenes[0], patch);
        assert.throws(() => validateSentinelCatalogue(broken));
    }
    const duplicate = structuredClone(catalogue);
    duplicate.scenes.push(duplicate.scenes[0]);
    assert.throws(() => validateSentinelCatalogue(duplicate));
});

function harness(
    fetchImpl = async () => ({ ok: true, json: async () => catalogue }),
    timeoutMs = 20000,
    releasePolicy = () => true,
) {
    const images = [],
        statuses = [],
        active = new Set(),
        zoomHandlers = new Set(),
        fits = [];
    const map = {
        removeLayer: (layer) => {
            active.delete(layer);
            // Leaflet detaches map event handlers through its remove event.
            if (layer.removeListener) zoomHandlers.delete(layer);
        },
        fitBounds: (...args) => fits.push(args),
        getBounds: () => ({ intersects: () => true }),
    };
    const L = {
        Util: { emptyImageUrl: 'empty' },
        tileLayer(url, options) {
            const events = {};
            const layer = {
                url,
                bounds: options.bounds,
                getTileUrl: ({ z, x, y }) => `${url}/${z}/${x}/${y}`,
                options,
                events,
                on(name, fn) {
                    events[name] = fn;
                    return this;
                },
                off() {
                    this.removeListener = false;
                    return this;
                }, // Retain callbacks to simulate a late browser event.
                addTo() {
                    active.add(this);
                    this.removeListener = true;
                    zoomHandlers.add(this);
                    return this;
                },
            };
            images.push(layer);
            return layer;
        },
    };
    const layer = createSentinelBurnLayer(L, map, {
        fetchImpl,
        onStatus: (s) => statuses.push(s),
        timeoutMs,
        releasePolicy,
    });
    return { layer, images, statuses, active, fits, zoomHandlers };
}

test('production blocks unvalidated imagery even if a catalogue claims approval', async () => {
    for (const release of [undefined, { status: 'blocked' }, { status: 'approved' }]) {
        const data = { ...catalogue, release };
        assert.equal(isSentinelReleaseApproved(data), false);
        const h = harness(
            async () => ({ ok: true, json: async () => data }),
            20000,
            isSentinelReleaseApproved,
        );
        await h.layer.update(true, 'PB', dates);
        assert.equal(h.statuses.at(-1).kind, 'blocked');
        assert.equal(h.images.length, 0);
        assert.equal(h.active.size, 0);
        h.layer.destroy();
    }
});

test('toggling and date changes remove only the overlay and preserve map position', async () => {
    const h = harness();
    await h.layer.update(true, 'PB', dates);
    assert.equal(h.active.size, 1);
    assert.deepEqual(h.images[0].bounds, [
        [27.6, 73.8],
        [32.6, 77.7],
    ]);
    assert.equal(h.images[0].options.interactive, false);
    h.images[0].events.load();
    assert.equal(h.statuses.at(-1).kind, 'ready');
    assert.equal(h.fits.length, 0);
    assert.equal(h.images[0].getTileUrl({ z: 7, x: 90, y: 50 }).includes('/PB/'), true);
    assert.equal(h.images[0].getTileUrl({ z: 7, x: 91, y: 50 }), '/sentinel-2/empty.png');
    await h.layer.update(true, 'PB', ['2026-11-16']);
    assert.equal(h.active.size, 0);
    assert.equal(h.zoomHandlers.size, 0);
    assert.equal(h.statuses.at(-1).kind, 'empty');
    await h.layer.update(true, 'HR', dates);
    await h.layer.update(false, 'HR', dates);
    h.images.at(-1).events.load();
    assert.equal(h.statuses.at(-1).kind, 'off');
    assert.equal(h.active.size, 0);
});

test('stalled raster requests settle as an error and remove unfinished imagery', async () => {
    const h = harness(undefined, 5);
    await h.layer.update(true, 'PB', dates);
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(h.statuses.at(-1).kind, 'error');
    assert.equal(h.active.size, 0);
    h.images[0].events.load();
    assert.equal(h.statuses.at(-1).kind, 'error');
    h.layer.destroy();
});

test('a cancelled catalogue response cannot restore old imagery', async () => {
    let resolve;
    const h = harness(() => new Promise((r) => (resolve = r)));
    const pending = h.layer.update(true, 'PB', dates);
    await h.layer.update(false, 'PB', dates);
    resolve({ ok: true, json: async () => catalogue });
    await pending;
    assert.equal(h.images.length, 0);
    assert.equal(h.statuses.at(-1).kind, 'off');
});

test('failed catalogue and image requests are errors, not no-burn observations', async () => {
    const unavailable = harness(async () => ({ ok: false }));
    await unavailable.layer.update(true, 'PB', dates);
    assert.equal(unavailable.statuses.at(-1).kind, 'error');
    const h = harness();
    await h.layer.update(true, 'HR', dates);
    h.images[0].events.tileerror();
    assert.equal(h.statuses.at(-1).kind, 'error');
    assert.equal(h.active.size, 0);
    await h.layer.update(true, 'HR', dates);
    h.layer.destroy();
    h.images.at(-1).events.load();
    assert.equal(h.active.size, 0);
    assert.notEqual(h.statuses.at(-1).kind, 'ready');
});
