import { addDays, differenceInCalendarDays, format, parseISO, startOfDay, subDays } from 'date-fns';
import { getDateIST } from './datetime.js';

export function isCount(value) {
    return Number.isInteger(value) && value >= 0;
}

// Local-midnight timestamps carry the year/month/day of an IST calendar date.
export function getFiresTotals(data = {}, isRangeMode, endDate, startDate) {
    return Object.fromEntries(
        get_filtered_data(Object.entries(data), isRangeMode, endDate, startDate),
    );
}

export function getFiresBreakupsByDistrict(data = {}, isRangeMode, endDate, startDate) {
    const dates = [
        ...new Set(Object.values(data).flatMap((district) => Object.keys(district.dates))),
    ];
    return Object.fromEntries(
        slice_data(
            dates.map((date) => [date]),
            isRangeMode,
            endDate,
            startDate,
        ).map(([date]) => [
            parseISO(date).getTime(),
            Object.fromEntries(
                Object.entries(data).map(([district, values]) => [
                    district,
                    values.dates[date] ?? null,
                ]),
            ),
        ]),
    );
}

export function get_filtered_data(data, isRangeMode, endDate, startDate) {
    return slice_data(data, isRangeMode, endDate, startDate).map(([date, count]) => [
        parseISO(date).getTime(),
        count,
    ]);
}

function slice_data(data, isRangeMode, endDate, startDate) {
    if (startDate == null) return [];
    const today = startOfDay(getDateIST());
    const end = isRangeMode
        ? new Date(endDate)
        : new Date(Math.min(addDays(startDate, 14).getTime(), today.getTime()));
    const start = isRangeMode ? new Date(startDate) : subDays(end, 29);
    const first = format(start, 'yyyy-MM-dd');
    const last = format(end, 'yyyy-MM-dd');
    return data
        .filter(([date]) => date >= first && date <= last)
        .sort(([a], [b]) => a.localeCompare(b));
}

export function periodTotal(data, start, end = start) {
    // A total is meaningful only when every inclusive calendar day is present.
    // Returning null keeps missing observations distinct from a measured zero.
    if (!data || start == null || end == null) return null;
    const days = differenceInCalendarDays(end, start) + 1;
    if (!Number.isFinite(days) || days < 1) return null;
    let total = 0;
    for (let offset = 0; offset < days; offset++) {
        const count = data[format(addDays(start, offset), 'yyyy-MM-dd')];
        if (!isCount(count)) return null;
        total += count;
    }
    return total;
}

export function sumDistricts(dailyCounts) {
    const days = Object.values(dailyCounts ?? {});
    const districts = [...new Set(days.flatMap((day) => Object.keys(day)))];
    return Object.fromEntries(
        districts.map((district) => {
            const counts = days.map((day) => day[district]);
            return [
                district,
                counts.every(isCount) ? counts.reduce((sum, count) => sum + count, 0) : null,
            ];
        }),
    );
}
