import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validPayload, loadFireData } from '../src/lib/utils/loadFireData.js';
import { latestReportedDate, summaryPeriods } from '../src/lib/utils/dashboardSummary.js';
import { parseISO } from 'date-fns';

const snapshot = JSON.parse(
    fs.readFileSync(new URL('../src/lib/data/dashboardSnapshot.json', import.meta.url)),
);

test('initial snapshot has real, reconciling counts and locations for both states', () => {
    const date = latestReportedDate(snapshot.data);
    assert.ok(date);
    for (const state of ['PB', 'HR']) {
        const history = snapshot.data[`${state}_historical`];
        const daily = snapshot.locations[`${state}/${date}`];
        assert.equal(validPayload(history, true), true);
        assert.equal(validPayload(daily, false), true);
        assert.equal(history.total.dates[date], daily.total);
        assert.ok(
            summaryPeriods(history.total.dates, parseISO(date)).every(
                (cell) => cell.value !== null,
            ),
        );
    }
});

test('initial dashboard refresh does not wait for unused current-day files', async () => {
    const urls = [];
    const result = await loadFireData(
        async (url) => {
            urls.push(url);
            return Response.json(
                snapshot.data[url.includes('/PB/') ? 'PB_historical' : 'HR_historical'],
            );
        },
        undefined,
        undefined,
        { includeToday: false },
    );
    assert.equal(urls.length, 2);
    assert.ok(urls.every((url) => url.endsWith('/historical_data.json')));
    assert.equal(
        result.PB_historical.total.dates[latestReportedDate(result)],
        snapshot.locations[`PB/${latestReportedDate(result)}`].total,
    );
});

test('cached date validation still rejects an impossible date in any district', () => {
    const history = structuredClone(snapshot.data.PB_historical);
    const district = Object.values(history.districts).at(-1);
    district.dates['2026-02-30'] = 0;
    assert.equal(validPayload(history, true), false);
});

test('map framing bounds contain every coordinate in the full state boundaries', () => {
    const extents = JSON.parse(
        fs.readFileSync(new URL('../src/lib/data/stateExtents.json', import.meta.url)),
    );
    const walk = (coords, check) =>
        typeof coords[0] === 'number' ? check(coords) : coords.forEach((c) => walk(c, check));
    for (const state of ['PB', 'HR']) {
        const boundary = JSON.parse(
            fs.readFileSync(new URL(`../static/boundaries/${state}.geojson`, import.meta.url)),
        );
        const [[south, west], [north, east]] = extents[state].bounds;
        walk(boundary.geometry.coordinates, ([lon, lat]) => {
            assert.ok(lon >= west && lon <= east && lat >= south && lat <= north);
        });
    }
});
