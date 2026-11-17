import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
    burntAreaPeriod,
    polygonCoordinates,
    projectCoordinate,
    tileRequest,
} from '../src/lib/utils/burntArea.js';

// Independent ray casting verifies the shipping masks against named places,
// including neighbouring countries and states that must never be painted.
function inRing([x, y], ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i],
            [xj, yj] = ring[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}
function contains(point, polygons) {
    return polygons.some(
        ([outer, ...holes]) => inRing(point, outer) && !holes.some((ring) => inRing(point, ring)),
    );
}
test('burnt area masks include each state and exclude Pakistan, Delhi and neighbouring states', () => {
    for (const [state, inside, other] of [
        ['PB', [75.8573, 30.901], [76.9905, 29.3909]],
        ['HR', [76.9905, 29.3909], [75.8573, 30.901]],
    ]) {
        const boundary = JSON.parse(
            fs.readFileSync(new URL(`../static/boundaries/${state}.geojson`, import.meta.url)),
        );
        assert.equal(boundary.properties.state, state);
        const polygons = polygonCoordinates(boundary.geometry);
        assert.equal(contains(inside, polygons), true);
        for (const point of [
            other,
            [74.3587, 31.5204],
            [73.0479, 33.6844],
            [77.209, 28.6139],
            [75.7873, 26.9124],
        ]) {
            assert.equal(contains(point, polygons), false, `${state}: ${point}`);
        }
        for (const polygon of polygons)
            for (const ring of polygon) {
                assert.deepEqual(ring[0], ring.at(-1));
                assert.ok(ring.every((p) => p.every(Number.isFinite)));
            }
    }
});
test('WMS requests carry the selected dates and correct tile extent, without credentials', () => {
    assert.equal(burntAreaPeriod([]), null);
    assert.equal(burntAreaPeriod(['bad']), null);
    const period = burntAreaPeriod(['2026-09-15', '2026-11-16']);
    const url = new URL(tileRequest({ x: 0, y: 0, z: 1 }, period));
    assert.equal(url.searchParams.get('time'), '2026-09-15/2026-11-16');
    assert.equal(url.searchParams.get('layers'), 'nrt.ba');
    assert.equal(url.searchParams.get('bbox'), '-20037508.342789244,0,0,20037508.342789244');
    assert.deepEqual(projectCoordinate([0, 0], 1), [256, 256]);
    const [x, y] = projectCoordinate([75, 30], 13);
    assert.ok(x > 1480000 && x < 1490000 && y > 860000 && y < 870000);
    assert.throws(() => polygonCoordinates({ type: 'Point', coordinates: [0, 0] }));
});
