import { format, parseISO, startOfMonth, subDays } from 'date-fns';
import { periodTotal, isCount } from './datahelpers.js';
import { getMonitoringSeason } from './season.js';

// Start on a date with observations, rather than an unpublished calendar day.
// As states arrive independently, use the most recent date shared by those loaded.
export function latestReportedDate(data) {
    const series = ['PB', 'HR']
        .map((state) => data?.[`${state}_historical`]?.total?.dates)
        .filter(Boolean);
    if (!series.length) return null;
    return (
        Object.keys(series[0])
            .filter((day) => series.every((dates) => isCount(dates[day])))
            .sort()
            .at(-1) ?? null
    );
}

export function summaryPeriods(data, selectedDate) {
    if (selectedDate == null || !Number.isFinite(new Date(selectedDate).getTime())) return [];
    const end = new Date(selectedDate);
    const previous = subDays(end, 1);
    const season = getMonitoringSeason(end);
    return [
        { label: format(end, 'd MMM'), value: periodTotal(data, end) },
        { label: format(previous, 'd MMM'), value: periodTotal(data, previous) },
        {
            label: format(end, 'MMM') + ' to date',
            value: periodTotal(data, startOfMonth(end), end),
        },
        { label: season.crop + ' season', value: periodTotal(data, season.start, season.through) },
    ];
}

export function reportedDate(value) {
    return value ? parseISO(value) : null;
}
