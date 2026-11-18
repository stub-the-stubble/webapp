import { isValid, parseISO, format, subDays } from 'date-fns';

const ROOT = '/sentinel-2/';
// A catalogue cannot approve its own scientific validity. Add a method here
// only after independent validation includes harvested and ploughed negatives
// in both states. The existing dNBR-only method failed that release review.
const RELEASED_METHODS = new Set();
export function isSentinelReleaseApproved(catalogue) {
    return (
        catalogue.release?.status === 'approved' &&
        catalogue.scenes.length > 0 &&
        catalogue.scenes.every((scene) => RELEASED_METHODS.has(scene.method))
    );
}
const day = (value) =>
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value));

// The catalogue describes processed imagery, not fire-event dates. A before/
// after pair can only be offered once the later observation has been acquired.
export function validateSentinelCatalogue(value) {
    if (value?.version !== 2 || !Array.isArray(value.scenes))
        throw new Error('Invalid Sentinel catalogue');
    const ids = new Set();
    for (const scene of value.scenes) {
        const b = scene.bounds;
        if (
            !['PB', 'HR'].includes(scene.state) ||
            typeof scene.id !== 'string' ||
            ids.has(scene.id) ||
            !day(scene.before) ||
            !day(scene.after) ||
            scene.before >= scene.after ||
            (scene.beforeEnd !== undefined &&
                (!day(scene.beforeEnd) ||
                    scene.beforeEnd < scene.before ||
                    scene.beforeEnd >= scene.after)) ||
            !Array.isArray(b) ||
            b.length !== 4 ||
            !b.every(Number.isFinite) ||
            !(b[0] < b[2] && b[1] < b[3] && b[0] >= 73 && b[2] <= 78 && b[1] >= 27 && b[3] <= 34) ||
            !/^[A-Za-z0-9_-]+$/.test(scene.tilePrefix) ||
            scene.maxNativeZoom !== 13 ||
            !Array.isArray(scene.tiles) ||
            !scene.tiles.every(validTile) ||
            new Set(scene.tiles).size !== scene.tiles.length ||
            scene.coverage !== 'state-intersections' ||
            scene.method !== 'experimental-dnbr' ||
            scene.resolutionMetres !== 20
        )
            throw new Error('Invalid Sentinel scene');
        ids.add(scene.id);
    }
    return value;
}

function validTile(key) {
    if (typeof key !== 'string' || !/^\d+\/\d+\/\d+$/.test(key)) return false;
    const [z, x, y] = key.split('/').map(Number);
    return z >= 5 && z <= 13 && x >= 0 && y >= 0 && x < 2 ** z && y < 2 ** z;
}

export function selectSentinelScenes(catalogue, state, dates) {
    const selected = new Set(dates);
    // A satellite does not observe the whole state on one calendar day. A
    // single-day view uses recent comparisons available by that date; ranges
    // select observation dates exactly. Never borrow a future acquisition.
    const earliest =
        dates.length === 1 ? format(subDays(parseISO(dates[0]), 14), 'yyyy-MM-dd') : null;
    return catalogue.scenes.filter(
        (scene) =>
            scene.state === state &&
            (earliest
                ? scene.after >= earliest && scene.after <= dates[0]
                : selected.has(scene.after)),
    );
}

export function createSentinelBurnLayer(
    L,
    map,
    { fetchImpl = fetch, onStatus, timeoutMs = 20000, releasePolicy = isSentinelReleaseApproved },
) {
    let generation = 0,
        request,
        catalogue,
        layers = [],
        disposed = false,
        timeout;
    const clear = () => {
        clearTimeout(timeout);
        layers.forEach((layer) => {
            // Leaflet's remove listener detaches map zoom/move handlers. Let
            // it run before clearing our listeners, or old tiles keep reacting
            // to zoom events after their map reference has been removed.
            map.removeLayer(layer);
            layer.off();
        });
        layers = [];
    };
    return {
        async update(enabled, state, dates) {
            const current = ++generation;
            request?.abort();
            clear();
            if (disposed) return;
            if (!enabled) {
                onStatus({ kind: 'off', scenes: [] });
                return;
            }
            if (!dates.length) {
                onStatus({ kind: 'empty', scenes: [] });
                return;
            }
            request = new AbortController();
            onStatus({ kind: 'loading', scenes: [] });
            // Both a stalled catalogue and a stalled raster must settle. Never
            // leave the map appearing to load indefinitely or imply no burning.
            timeout = setTimeout(() => {
                if (current !== generation || disposed) return;
                generation++;
                request.abort();
                clear();
                onStatus({ kind: 'error', scenes: [] });
            }, timeoutMs);
            try {
                if (!catalogue) {
                    const response = await fetchImpl(ROOT + 'catalogue.json', {
                        signal: request.signal,
                    });
                    if (!response.ok) throw new Error('Sentinel catalogue unavailable');
                    const loaded = validateSentinelCatalogue(await response.json());
                    if (current !== generation || disposed) return;
                    catalogue = loaded;
                }
                if (!releasePolicy(catalogue)) {
                    clearTimeout(timeout);
                    onStatus({ kind: 'blocked', scenes: [] });
                    return;
                }
                const scenes = selectSentinelScenes(catalogue, state, dates);
                if (!scenes.length) {
                    clearTimeout(timeout);
                    onStatus({ kind: 'empty', scenes: [] });
                    return;
                }
                const loaded = new Set();
                let failed = false;
                const coverage =
                    scenes.length ===
                    catalogue.scenes.filter((scene) => scene.state === state).length
                        ? catalogue.coverage?.[state]
                        : null;
                for (const scene of scenes) {
                    const [west, south, east, north] = scene.bounds;
                    const layer = L.tileLayer(ROOT + `tiles/${scene.tilePrefix}/{z}/{x}/{y}.png`, {
                        bounds: [
                            [south, west],
                            [north, east],
                        ],
                        pane: 'sentinelBurnScars',
                        minZoom: 5,
                        maxNativeZoom: scene.maxNativeZoom,
                        maxZoom: 19,
                        noWrap: true,
                        interactive: false,
                        opacity: 0.8,
                        attribution:
                            'Burn-scar candidates: Copernicus Sentinel-2 (2026); cropland mask: ESA WorldCover 2021',
                    });
                    // Sparse tiles are intentional: a known empty tile is
                    // transparent; a listed tile that fails is a real error.
                    // Load only the viewport, never whole-state image bitmaps.
                    const tiles = new Set(scene.tiles);
                    const originalUrl = layer.getTileUrl.bind(layer);
                    layer.getTileUrl = (coords) =>
                        tiles.has(`${coords.z}/${coords.x}/${coords.y}`)
                            ? originalUrl(coords)
                            : // Leaflet reserves Util.emptyImageUrl for aborted
                              // requests and never marks those tiles as loaded.
                              // A real transparent asset lets sparse layers settle.
                              ROOT + 'empty.png';
                    const markLoaded = () => {
                        if (current !== generation || disposed || failed) return;
                        loaded.add(scene.id);
                        if (loaded.size === scenes.length) {
                            clearTimeout(timeout);
                            onStatus({ kind: 'ready', scenes, coverage });
                        }
                    };
                    layer.on('load', markLoaded);
                    layer.on('tileerror', () => {
                        if (current !== generation || disposed || failed) return;
                        failed = true;
                        clear();
                        onStatus({ kind: 'error', scenes: [] });
                    });
                    layers.push(layer);
                    layer.addTo(map);
                    // A map panned outside the state has no visible tiles to
                    // request. That is a valid empty viewport, not a timeout.
                    if (
                        !map.getBounds().intersects([
                            [south, west],
                            [north, east],
                        ])
                    )
                        markLoaded();
                }
            } catch (error) {
                if (current !== generation || disposed || error.name === 'AbortError') return;
                clear();
                onStatus({ kind: 'error', scenes: [] });
            }
        },
        destroy() {
            disposed = true;
            generation++;
            request?.abort();
            clear();
        },
    };
}
