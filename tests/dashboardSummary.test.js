import test from 'node:test';
import assert from 'node:assert/strict';
import { latestReportedDate, summaryPeriods } from '../src/lib/utils/dashboardSummary.js';
import { loadFireData } from '../src/lib/utils/loadFireData.js';
import { locationViewDates } from '../src/lib/utils/fireLocations.js';

test('map windows end on the report date while Today and Yesterday stay literal', () => {
    const now = new Date(2026, 10, 17);
    assert.deepEqual(locationViewDates('latest', '2026-11-15', now), ['2026-11-15']);
    assert.deepEqual(locationViewDates('latest', undefined, now), []);
    assert.deepEqual(locationViewDates('today', '2026-11-15', now), ['2026-11-17']);
    assert.deepEqual(locationViewDates('yesterday', '2026-11-15', now), ['2026-11-16']);
    const week = locationViewDates('week', '2026-11-15', now);
    assert.equal(week.length, 7);
    assert.equal(week[0], '2026-11-09');
    assert.equal(week.at(-1), '2026-11-15');
    assert.equal(locationViewDates('season', '2026-11-15', now).length, 62);
});

const history = (dates) => ({ total: { dates }, districts: { A: { dates } } });

test('default date is the latest reported date shared by loaded states', () => {
    assert.equal(latestReportedDate(null), null);
    const data = { PB_historical: history({ '2026-11-14': 8, '2026-11-15': 0 }) };
    assert.equal(latestReportedDate(data), '2026-11-15');
    data.HR_historical = history({ '2026-11-14': 2 });
    assert.equal(latestReportedDate(data), '2026-11-14');
    data.HR_historical = history({ '2026-11-13': 2 });
    assert.equal(latestReportedDate(data), null);
});

test('cards follow the selected date, retaining missing reports and real zeros', () => {
    const dates = { '2026-09-15': 0, '2026-09-16': 7 };
    const result = summaryPeriods(dates, new Date(2026, 8, 16));
    assert.deepEqual(
        result.map((p) => p.label),
        ['16 Sep', '15 Sep', 'Sep to date', 'Paddy season'],
    );
    assert.deepEqual(
        result.map((p) => p.value),
        [7, 0, null, 7],
    );
    assert.deepEqual(
        summaryPeriods(dates, new Date(2026, 8, 17)).map((p) => p.value),
        [null, 7, null, null],
    );
    assert.deepEqual(summaryPeriods(dates, null), []);
});

test('history numbers are delivered before a slow daily request settles', async () => {
    let finishDaily;
    const dailyGate = new Promise((resolve) => {
        finishDaily = resolve;
    });
    let historyReady;
    const earlyHistory = new Promise((resolve) => {
        historyReady = resolve;
    });
    let completed = false;
    const pending = loadFireData(
        async (url) => {
            if (url.endsWith('historical_data.json'))
                return Response.json(history({ '2026-11-15': 137 }));
            await dailyGate;
            return new Response('', { status: 404 });
        },
        undefined,
        (data) => {
            if (data.PB_historical) historyReady(data);
        },
    ).then((result) => {
        completed = true;
        return result;
    });
    const early = await earlyHistory;
    assert.equal(early.PB_historical.total.dates['2026-11-15'], 137);
    assert.equal(completed, false);
    finishDaily();
    const result = await pending;
    assert.equal(result.PB_today, null);
    assert.equal(result.PB_historical.total.dates['2026-11-15'], 137);
});
