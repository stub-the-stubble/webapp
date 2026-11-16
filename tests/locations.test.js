import test from 'node:test';
import assert from 'node:assert/strict';
import { locationDates, loadLocations } from '../src/lib/utils/fireLocations.js';
import { firePopupHtml } from '../src/lib/utils/firePresentation.js';

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
