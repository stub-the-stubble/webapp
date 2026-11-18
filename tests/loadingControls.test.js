import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLocations } from '../src/lib/utils/fireLocations.js';
import { createLocationCache } from '../src/lib/utils/locationCache.js';
import { createHistoryRefresh, mergeHistoryUpdate } from '../src/lib/utils/historyRefresh.js';

const daily = (total = 1) => ({
    total,
    districts: { A: total },
    locations: Array.from({ length: total }, () => ({ lat: 30, lon: 75, district: 'A' })),
});
const signal = () => new AbortController().signal;
const stall = (url, { signal }) =>
    new Promise((resolve, reject) => {
        if (signal.aborted) reject(new DOMException('Cancelled', 'AbortError'));
        else
            signal.addEventListener(
                'abort',
                () => reject(new DOMException('Cancelled', 'AbortError')),
                { once: true },
            );
    });

test('progress exposes completed days before a stalled day and a batch deadline bounds the whole range', async () => {
    const dates = Array.from({ length: 15 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
    const updates = [];
    const result = await loadLocations(
        (url, options) =>
            url.includes(dates[0]) ? Promise.resolve(Response.json(daily())) : stall(url, options),
        'PB',
        dates,
        signal(),
        new Map(),
        {
            requestTimeoutMs: 2000,
            totalTimeoutMs: 220,
            onProgress: (data) => updates.push(data),
        },
    );
    assert.ok(
        updates.some(
            (u) => u.availableDays === 1 && u.pending.length === 14 && u.missing.length === 0,
        ),
    );
    assert.equal(result.locations.length, 1);
    assert.equal(result.missing.length, 14);
    assert.equal(result.pending.length, 0);
    assert.equal(result.timedOut, true);
});

test('reported zeros need no daily download; missing days stay missing and mismatched totals are rejected', async () => {
    const dates = ['2026-10-01', '2026-10-02', '2026-10-03'];
    const calls = [];
    const result = await loadLocations(
        async (url) => {
            calls.push(url);
            return url.includes(dates[1])
                ? new Response('', { status: 404 })
                : Response.json(daily(2));
        },
        'HR',
        dates,
        signal(),
        new Map(),
        { totals: { [dates[0]]: 0, [dates[2]]: 1 } },
    );
    assert.equal(calls.length, 2);
    assert.equal(result.availableDays, 1);
    assert.deepEqual(result.missing, dates.slice(1));
    assert.equal(result.locations.length, 0);
});

test('cache is reused across loads, expires, and cannot retain counts changed by a backfill', async () => {
    let time = 0,
        calls = 0,
        count = 1;
    const cache = createLocationCache({ ttlMs: 10, now: () => time });
    const fetcher = async () => {
        calls++;
        return Response.json(daily(count));
    };
    const dates = ['2026-10-01'];
    const load = () =>
        loadLocations(fetcher, 'PB', dates, signal(), cache, { totals: { [dates[0]]: count } });
    await load();
    await load();
    assert.equal(calls, 1);
    count = 2;
    assert.equal((await load()).locations.length, 2);
    assert.equal(calls, 2);
    time = 11;
    await load();
    assert.equal(calls, 3);
});

test('cache enforces entry and point limits with least-recently-used eviction', () => {
    const cache = createLocationCache({ maxEntries: 2, maxPoints: 3 });
    cache.set('a', daily());
    cache.set('b', daily());
    cache.get('a');
    cache.set('c', daily());
    assert.equal(cache.get('b'), undefined);
    cache.set('d', daily(3));
    assert.equal(cache.size, 1);
    cache.set('huge', daily(4));
    assert.equal(cache.get('huge'), undefined);
});

test('partial history refresh preserves saved counts and tracks pending states independently', () => {
    const before = {
        PB_historical: { saved: 'PB' },
        HR_historical: { saved: 'HR' },
        pending: { PB_historical: true, HR_historical: true },
    };
    const next = mergeHistoryUpdate(before, {
        PB_historical: null,
        errors: { PB_historical: 'request' },
    });
    assert.deepEqual(next.PB_historical, before.PB_historical);
    assert.equal(next.pending.PB_historical, false);
    assert.equal(next.pending.HR_historical, true);
});

test('history refresh coalesces requests, respects freshness and retries on reconnect', async () => {
    let calls = 0,
        clock = 0;
    const updates = [];
    const manager = createHistoryRefresh(
        async () => {
            calls++;
            return new Response('', { status: 503 });
        },
        (data) => updates.push(data),
        { now: () => clock, intervalMs: 100 },
    );
    const first = manager.refresh();
    assert.equal(manager.refresh(), first);
    await first;
    assert.equal(calls, 2);
    await manager.refresh();
    assert.equal(calls, 2);
    await manager.refresh(true);
    assert.equal(calls, 4);
    clock = 101;
    await manager.refresh();
    assert.equal(calls, 6);
    manager.stop();
    await manager.refresh(true);
    assert.equal(calls, 6);
    assert.equal(updates.length, 6);
});

test('the second state response does not retrigger the first state location load', () => {
    const pb = { total: { dates: { '2026-10-01': 1 } } };
    const first = mergeHistoryUpdate({}, { PB_historical: pb, errors: {} });
    const second = mergeHistoryUpdate(first, {
        PB_historical: pb,
        HR_historical: { total: { dates: {} } },
        errors: {},
    });
    assert.equal(first.revisions.PB_historical, 1);
    assert.equal(second.revisions.PB_historical, 1);
    assert.equal(second.revisions.HR_historical, 1);
    const refreshed = mergeHistoryUpdate(second, {
        PB_historical: structuredClone(pb),
        errors: {},
    });
    assert.equal(refreshed.revisions.PB_historical, 2);
});

test('a pre-cancelled range cannot fetch or publish partial results', async () => {
    const controller = new AbortController();
    controller.abort();
    let calls = 0,
        updates = 0;
    await assert.rejects(
        loadLocations(
            async () => {
                calls++;
                return Response.json(daily());
            },
            'PB',
            ['2026-10-01'],
            controller.signal,
            new Map(),
            { onProgress: () => updates++ },
        ),
        { name: 'AbortError' },
    );
    assert.equal(calls, 0);
    assert.equal(updates, 0);
});
