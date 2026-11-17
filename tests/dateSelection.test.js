import test from 'node:test';
import assert from 'node:assert/strict';
import { format } from 'date-fns';
import { dashboardPresetRange } from '../src/lib/utils/dashboardSummary.js';
import { selectedLocationDates } from '../src/lib/utils/fireLocations.js';

test('header presets use the latest report for rolling ranges and literal dates for Today', () => {
    const today = new Date(2026, 10, 17);
    for (const [preset, first, last] of [
        ['latest', '2026-11-16', '2026-11-16'],
        ['today', '2026-11-17', '2026-11-17'],
        ['yesterday', '2026-11-16', '2026-11-16'],
        ['month', '2026-11-01', '2026-11-16'],
        ['thirty_days', '2026-10-18', '2026-11-16'],
    ]) {
        const r = dashboardPresetRange(preset, '2026-11-16', today);
        const dates = selectedLocationDates(r.start, r.end, r.end !== null);
        assert.equal(dates[0], first, preset);
        assert.equal(dates.at(-1), last, preset);
    }
    assert.equal(dashboardPresetRange('latest', null, today).start, null);
    assert.equal(
        format(dashboardPresetRange('all_time', '2026-11-16', today).end, 'yyyy-MM-dd'),
        '2026-11-16',
    );
});
test('selected map dates retain custom missing days, leap days and inclusive endpoints', () => {
    assert.deepEqual(selectedLocationDates(new Date(2024, 1, 28), new Date(2024, 2, 1), true), [
        '2024-02-28',
        '2024-02-29',
        '2024-03-01',
    ]);
    assert.deepEqual(selectedLocationDates(new Date(2026, 10, 16), new Date(2026, 10, 17), true), [
        '2026-11-16',
        '2026-11-17',
    ]);
    assert.deepEqual(selectedLocationDates(null, null, false), []);
    assert.deepEqual(selectedLocationDates(new Date(2021, 8, 3), new Date(2026, 10, 16), true), []);
});
