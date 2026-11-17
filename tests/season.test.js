import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, format } from 'date-fns';
import { getMonitoringSeason } from '../src/lib/utils/season.js';
import { periodTotal } from '../src/lib/utils/datahelpers.js';

const day = (value) => new Date(`${value}T00:00:00`);
test('monitoring windows roll over at inclusive boundaries and across years', () => {
    for (const [date, crop, start, through, active] of [
        ['2026-03-31', 'Paddy', '2025-09-15', '2025-11-30', false],
        ['2026-04-01', 'Wheat', '2026-04-01', '2026-04-01', true],
        ['2026-05-31', 'Wheat', '2026-04-01', '2026-05-31', true],
        ['2026-06-01', 'Wheat', '2026-04-01', '2026-05-31', false],
        ['2026-09-14', 'Wheat', '2026-04-01', '2026-05-31', false],
        ['2026-09-15', 'Paddy', '2026-09-15', '2026-09-15', true],
        ['2026-11-16', 'Paddy', '2026-09-15', '2026-11-16', true],
        ['2026-11-30', 'Paddy', '2026-09-15', '2026-11-30', true],
        ['2026-12-01', 'Paddy', '2026-09-15', '2026-11-30', false],
        ['2027-01-01', 'Paddy', '2026-09-15', '2026-11-30', false],
    ]) {
        const season = getMonitoringSeason(day(date));
        assert.deepEqual(
            [
                season.crop,
                format(season.start, 'yyyy-MM-dd'),
                format(season.through, 'yyyy-MM-dd'),
                season.active,
            ],
            [crop, start, through, active],
            date,
        );
        assert.equal(season.label, active ? 'This season' : 'Last season');
    }
});

test('season totals exclude other years and future days without hiding missing observations', () => {
    const season = getMonitoringSeason(day('2026-11-16'));
    const dates = { '2025-09-15': 999, '2026-09-14': 999, '2026-11-17': 999 };
    for (let d = season.start; d <= season.through; d = addDays(d, 1)) {
        dates[format(d, 'yyyy-MM-dd')] = 1;
    }
    assert.equal(periodTotal(dates, season.start, season.through), 63);
    dates['2026-09-15'] = 0;
    assert.equal(periodTotal(dates, season.start, season.through), 62);
    delete dates['2026-09-16'];
    assert.equal(periodTotal(dates, season.start, season.through), null);
    assert.throws(() => getMonitoringSeason(new Date(NaN)), RangeError);
});
