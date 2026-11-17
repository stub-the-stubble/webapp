import test from 'node:test';
import assert from 'node:assert/strict';
import { locationDates, loadLocations } from '../src/lib/utils/fireLocations.js';
import { firePopupHtml } from '../src/lib/utils/firePresentation.js';
import { getDateIST } from '../src/lib/utils/datetime.js';

test('location presets have inclusive IST calendar boundaries', () => {
    const today = new Date(2026, 10, 16);
    assert.deepEqual(locationDates('yesterday', today), ['2026-11-15']);
    assert.equal(locationDates('week', today)[0], '2026-11-10');
    assert.equal(locationDates('week', today).length, 7);
    assert.equal(locationDates('month', today).length, 16);
    assert.equal(locationDates('thirty', today)[0], '2026-10-18');
    assert.equal(locationDates('season', today).length, 63);
    assert.equal(locationDates('season', new Date(2027, 0, 1)).at(-1), '2026-11-30');
});

test('location loading preserves zeros, reports missing days and rejects incomplete points', async () => {
    const dates = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'];
    const bodies = [
        { total: 1, districts: { A: 1 }, locations: [{ lat: 30, lon: 75, district: 'A' }] },
        { total: 0, districts: { A: 0 }, locations: [] },
        null,
        { total: 1, districts: { A: 1 }, locations: [] },
    ];
    let calls = 0;
    const fetcher = async (url) => {
        calls++;
        const data = bodies[dates.findIndex((d) => url.includes(d))];
        return new Response(JSON.stringify(data), {
            status: data ? 200 : 404,
            headers: { 'content-type': 'application/json' },
        });
    };
    const cache = new Map(),
        signal = new AbortController().signal;
    const result = await loadLocations(fetcher, 'PB', dates, signal, cache);
    assert.equal(result.availableDays, 2);
    assert.deepEqual(result.missing, dates.slice(2));
    assert.equal(result.locations[0].observation_date, dates[0]);
    await loadLocations(fetcher, 'PB', dates, signal, cache);
    assert.equal(calls, 6); // Successful days cached; missing days can recover on retry.
    assert.match(firePopupHtml(result.locations[0]), /2026-11-01/);
});

test('cancelled location requests do not return obsolete results', async () => {
    const controller = new AbortController();
    const task = loadLocations(
        (url, { signal }) =>
            new Promise((resolve, reject) =>
                signal.addEventListener('abort', () =>
                    reject(new DOMException('Cancelled', 'AbortError')),
                ),
            ),
        'PB',
        ['2026-11-01'],
        controller.signal,
    );
    controller.abort();
    await assert.rejects(task, { name: 'AbortError' });
});

test('today and yesterday revalidate changed observations instead of reusing cached counts', async () => {
    const today = getDateIST();
    const dates = [...locationDates('yesterday', today), ...locationDates('today', today)];
    const cache = new Map();
    const signal = new AbortController().signal;
    let total = 1,
        calls = 0;
    const fetcher = async (url, options) => {
        calls++;
        assert.equal(options.cache, 'no-cache');
        return new Response(
            JSON.stringify({
                total,
                districts: { A: total },
                locations: Array.from({ length: total }, () => ({
                    lat: 30,
                    lon: 75,
                    district: 'A',
                })),
            }),
            { headers: { 'content-type': 'application/json' } },
        );
    };
    const first = await loadLocations(fetcher, 'PB', dates, signal, cache);
    total = 2;
    const second = await loadLocations(fetcher, 'PB', dates, signal, cache);
    assert.equal(first.locations.length, 2);
    assert.equal(second.locations.length, 4);
    assert.equal(calls, 4);
    assert.equal(cache.size, 0);

    // A failed revalidation must remain missing, never fall back to an old count.
    const missing = await loadLocations(
        async () => new Response('', { status: 503 }),
        'PB',
        dates,
        signal,
        cache,
    );
    assert.equal(missing.availableDays, 0);
    assert.deepEqual(missing.missing, dates);
});
