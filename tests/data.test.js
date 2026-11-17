import test from 'node:test';
import assert from 'node:assert/strict';
import {
    getFiresTotals,
    getFiresBreakupsByDistrict,
    periodTotal,
    sumDistricts,
} from '../src/lib/utils/datahelpers.js';
import { loadFireData, validPayload } from '../src/lib/utils/loadFireData.js';
import { getDateISO } from '../src/lib/utils/datetime.js';

const day = (value) => new Date(`${value}T00:00:00`);
const history = {
    total: { dates: { '2026-11-16': 7 } },
    districts: { AMRITSAR: { dates: { '2026-11-16': 7 } } },
};
const daily = { total: 7, districts: { AMRITSAR: 7 }, locations: [] };

test('range totals include the first date and preserve missing districts', () => {
    assert.deepEqual(sumDistricts({ a: { A: 5, B: 0 }, b: { A: 7 } }), { A: 12, B: null });
});

test('date ranges filter actual keys inclusively, regardless of order or gaps', () => {
    const counts = { '2026-11-16': 7, '2026-11-14': 5, '2026-11-13': 3 };
    assert.deepEqual(getFiresTotals(counts, true, day('2026-11-16'), day('2026-11-15')), {
        [day('2026-11-16').getTime()]: 7,
    });
    assert.deepEqual(getFiresTotals(counts, true, day('2026-11-18'), day('2026-11-17')), {});
    assert.deepEqual(
        Object.values(getFiresTotals(counts, true, day('2026-11-16'), day('2026-11-13'))),
        [3, 5, 7],
    );
});

test('unavailable observations differ from valid zero and complete periods', () => {
    assert.equal(periodTotal({ '2026-11-16': 0 }, day('2026-11-16')), 0);
    assert.equal(periodTotal({}, day('2026-11-16')), null);
    assert.equal(periodTotal({ '2026-11-16': 7 }, day('2026-11-15'), day('2026-11-16')), null);
    assert.equal(
        periodTotal({ '2026-11-15': 5, '2026-11-16': 7 }, day('2026-11-15'), day('2026-11-16')),
        12,
    );
});

test('district date union includes dates absent in the first district', () => {
    const result = getFiresBreakupsByDistrict(
        { A: { dates: {} }, B: { dates: { '2026-11-16': 7 } } },
        true,
        day('2026-11-16'),
        day('2026-11-16'),
    );
    assert.deepEqual(result[day('2026-11-16').getTime()], { A: null, B: 7 });
    assert.deepEqual(
        getFiresBreakupsByDistrict({}, true, day('2026-11-16'), day('2026-11-16')),
        {},
    );
});

test('schema rejects invalid counts, dates and malformed locations', () => {
    assert.equal(validPayload(history, true), true);
    assert.equal(validPayload(daily, false), true);
    assert.equal(validPayload({ ...daily, total: '7' }, false), false);
    assert.equal(validPayload({ ...daily, locations: [null] }, false), false);
    assert.equal(validPayload({ ...history, total: { dates: { '2026-02-30': 4 } } }, true), false);
    assert.equal(validPayload({ ...history, total: { dates: { '2026-11-16': -1 } } }, true), false);
});

test('failed daily requests do not discard valid history or the other state', async () => {
    const requests = [];
    const result = await loadFireData(async (url, options) => {
        assert.equal(options.cache, 'no-cache');
        requests.push(url);
        if (url.includes('/PB/') && !url.endsWith('historical_data.json'))
            return new Response('<!DOCTYPE html>', { status: 404 });
        return Response.json(url.endsWith('historical_data.json') ? history : daily);
    });
    assert.equal(requests.length, 4);
    assert.equal(result.PB_today, null);
    assert.equal(result.errors.PB_today, 'missing');
    assert.deepEqual(result.PB_historical, history);
    assert.deepEqual(result.HR_today, daily);
    assert.ok(requests.some((url) => url.endsWith(`/${getDateISO()}.json`)));
});

test('HTML 200, malformed JSON, schema errors and network failures settle safely', async () => {
    const result = await loadFireData(async (url) => {
        if (url.includes('/PB/') && !url.endsWith('historical_data.json'))
            return new Response('<html>', { headers: { 'Content-Type': 'text/html' } });
        if (url.includes('/PB/'))
            return new Response('{', { headers: { 'Content-Type': 'application/json' } });
        if (!url.endsWith('historical_data.json')) return Response.json({});
        throw new Error('network failure');
    });
    assert.equal(result.errors.PB_today, 'format');
    assert.equal(result.errors.HR_today, 'schema');
    assert.equal(Object.keys(result.errors).length, 4);
    assert.equal(result.HR_historical, null);
});

test('request cancellation aborts all outstanding requests', async () => {
    const controller = new AbortController();
    const pending = loadFireData(
        (url, { signal }) =>
            new Promise((resolve, reject) => {
                signal.addEventListener('abort', () => reject(new Error('aborted')), {
                    once: true,
                });
            }),
        controller.signal,
    );
    controller.abort();
    const result = await pending;
    assert.equal(Object.keys(result.errors).length, 4);
});

test('calendar totals include leap day, year boundaries and DST days', () => {
    for (const dates of [
        ['2024-02-28', '2024-02-29', '2024-03-01'],
        ['2025-12-31', '2026-01-01', '2026-01-02'],
        ['2026-03-07', '2026-03-08', '2026-03-09'],
        ['2026-10-31', '2026-11-01', '2026-11-02'],
    ]) {
        const counts = Object.fromEntries(dates.map((date) => [date, 5]));
        assert.equal(periodTotal(counts, day(dates[0]), day(dates[2])), 15);
        assert.equal(
            Object.keys(getFiresTotals(counts, true, day(dates[2]), day(dates[0]))).length,
            3,
        );
    }
    assert.equal(periodTotal({}, new Date(NaN)), null);
});

test('unassigned metadata reconciles totals and retains unknown older coverage', () => {
    const value = { ...daily, total: 8, unassigned_total: 1 };
    assert.equal(validPayload(value, false), true);
    assert.equal(validPayload({ ...value, unassigned_total: 2 }, false), false);
    assert.equal(
        validPayload({ ...history, unassigned: { dates: { '2026-11-16': 1 } } }, true),
        true,
    );
    assert.equal(
        validPayload({ ...history, unassigned: { dates: { '2026-11-16': 8 } } }, true),
        false,
    );
    assert.equal(periodTotal({ '2026-11-16': 1 }, day('2026-11-15'), day('2026-11-16')), null);
});

import { firePopupHtml } from '../src/lib/utils/firePresentation.js';
test('map popup handles absent times and escapes district text', () => {
    assert.equal(
        firePopupHtml({ district: null }),
        'District: Unassigned (source state retained)<br>Time: unavailable',
    );
    assert.equal(
        firePopupHtml({ district: 'A', acqtime: '1200' }),
        'District: A<br>Time: unavailable',
    );
    assert.ok(!firePopupHtml({ district: '<script>' }).includes('<script>'));
});

import fs from 'node:fs';
import vm from 'node:vm';
test('district component excludes zero bars when all fires are unassigned', () => {
    const source = fs.readFileSync(
        new URL('../src/components/DistrictBarchart.svelte', import.meta.url),
        'utf8',
    );
    const fn = source.slice(
        source.indexOf('function getRangeData()'),
        source.indexOf('function getSingleDateData('),
    );
    const context = {
        sumDistricts,
        isCount: (value) => Number.isInteger(value) && value >= 0,
        district_breakups_list: { day1: { A: 0 }, day2: { A: 0 } },
        totals_list: { day1: 2, day2: 3 },
    };
    vm.createContext(context);
    vm.runInContext(fn + '\ngetRangeData();', context);
    assert.equal(context.total_count, 5);
    assert.equal(context.districts_data_filtered.length, 0);
});
