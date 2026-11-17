import test from 'node:test';
import assert from 'node:assert/strict';
import { map_paths } from '../src/lib/data/map_paths.js';
import { validPayload } from '../src/lib/utils/loadFireData.js';
import { loadLocations } from '../src/lib/utils/fireLocations.js';
import { firePopupHtml } from '../src/lib/utils/firePresentation.js';

const point = {
    event_id: 'day:1',
    lat: 29.28933,
    lon: 75.94373,
    district: 'HANSI',
    district_assignment: 'publisher',
    sat: 'JPSS-1',
    acqtime: '13:36:12',
};
const daily = {
    source: { series: 'iari-creams-paddy-v1' },
    total: 1,
    unassigned_total: 0,
    districts: { HANSI: 1 },
    locations: [point],
};

test('current maps contain 23 distinct district outlines for each state', () => {
    for (const map of Object.values(map_paths)) {
        assert.equal(Object.keys(map.paths).length, 23);
        assert.equal(new Set(Object.values(map.paths)).size, 23);
        for (const path of Object.values(map.paths)) {
            assert.match(path, /^M /);
            assert.doesNotMatch(path, /NaN|Infinity/);
            const coordinates = path.match(/-?\d+(?:\.\d+)?/g).map(Number);
            assert.ok(coordinates.every((n) => n >= 19 && n <= 781));
        }
    }
    assert.ok(map_paths.PB.paths.MALERKOTLA);
    assert.ok(map_paths.HR.paths.HANSI);
    assert.notEqual(map_paths.HR.paths.HANSI, map_paths.HR.paths.HISAR);
});

test('official payload rejects counts or identities that disagree with map records', () => {
    assert.equal(validPayload(daily, false), true);
    assert.equal(validPayload({ ...daily, locations: [] }, false), false);
    assert.equal(validPayload({ ...daily, districts: { HANSI: 0 } }, false), false);
    assert.equal(
        validPayload(
            { ...daily, total: 2, districts: { HANSI: 2 }, locations: [point, point] },
            false,
        ),
        false,
    );
    assert.equal(validPayload({ ...daily, locations: [{ ...point, lat: 91 }] }, false), false);
});

test('official map records retain source and cross-state overlap metadata', async () => {
    const overlap = { ...point, shared_observation_states: ['PB', 'HR'] };
    const result = await loadLocations(
        async () =>
            new Response(JSON.stringify({ ...daily, locations: [overlap] }), {
                headers: { 'content-type': 'application/json' },
            }),
        'HR',
        ['2026-11-01'],
        new AbortController().signal,
    );
    assert.deepEqual(result.sources, ['iari-creams-paddy-v1']);
    assert.equal(result.sharedObservations, 1);
    assert.equal(result.locations.length, 1);
    const popup = firePopupHtml(result.locations[0]);
    assert.match(popup, /13:36:12 \(publisher time; timezone unspecified\)/);
    assert.match(popup, /Satellite: JPSS-1/);
    assert.match(popup, /Also counted in the other state/);
});
