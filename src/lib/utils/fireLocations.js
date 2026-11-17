import {
    addDays,
    differenceInCalendarDays,
    format,
    parseISO,
    startOfDay,
    startOfMonth,
    subDays,
} from 'date-fns';
import { getMonitoringSeason } from './season.js';
import { validPayload } from './loadFireData.js';
import { getDateIST } from './datetime.js';

export function selectedLocationDates(start, end, range) {
    if (start == null) return [];
    const through = range ? end : start;
    if (through == null) return [];
    const count = differenceInCalendarDays(through, start) + 1;
    // The point map downloads daily files; multi-year history belongs in the
    // aggregate charts until a tiled historical location service is available.
    if (!Number.isFinite(count) || count < 1 || count > 366) return [];
    return Array.from({ length: count }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
}

export function locationViewDates(period, latestDate, istDate) {
    if (period === 'latest') return latestDate ? [latestDate] : [];
    // Calendar-day options stay literal. Longer windows end at the most recent
    // report and always display that date range beside the location count.
    const anchor =
        latestDate && !['today', 'yesterday'].includes(period) ? parseISO(latestDate) : istDate;
    return locationDates(period, anchor);
}

export function locationDates(period, istDate) {
    const today = startOfDay(istDate);
    let start = today,
        end = today;
    switch (period) {
        case 'today':
            break;
        case 'yesterday':
            start = end = subDays(today, 1);
            break;
        case 'week':
            start = subDays(today, 6);
            break;
        case 'month':
            start = startOfMonth(today);
            break;
        case 'thirty':
            start = subDays(today, 29);
            break;
        case 'season': {
            const season = getMonitoringSeason(today);
            start = season.start;
            end = season.through;
            break;
        }
        default:
            throw new RangeError('Unknown location period');
    }
    const dates = [];
    for (let day = start; day <= end; day = addDays(day, 1)) dates.push(format(day, 'yyyy-MM-dd'));
    return dates;
}

export async function loadLocations(fetcher, state, dates, signal, cache = new Map()) {
    if (!['PB', 'HR'].includes(state)) throw new RangeError('Unknown state');
    const results = new Array(dates.length);
    // Recent observations can still change. Never reuse today's or yesterday's
    // in-memory snapshot, including when a page stays open across midnight IST.
    const mutableFrom = format(subDays(getDateIST(), 1), 'yyyy-MM-dd');
    let next = 0;
    // Bound simultaneous downloads; season views must not burst dozens of requests.
    async function worker() {
        while (next < dates.length && !signal.aborted) {
            const index = next++,
                date = dates[index],
                key = `${state}/${date}`;
            const mutable = date >= mutableFrom;
            if (!mutable && cache.has(key)) {
                results[index] = cache.get(key);
                continue;
            }
            const controller = new AbortController();
            const abort = () => controller.abort();
            signal.addEventListener('abort', abort, { once: true });
            const timeout = setTimeout(abort, 12000);
            try {
                const response = await fetcher(
                    `https://stub-the-stubble.github.io/data-pipeline/v2/${key}.json`,
                    // Ask the browser to revalidate its HTTP cache as well.
                    { signal: controller.signal, cache: 'no-cache' },
                );
                if (
                    !response.ok ||
                    !response.headers.get('content-type')?.includes('application/json')
                )
                    throw new Error('Unavailable');
                const data = await response.json();
                if (!validPayload(data, false) || data.total !== data.locations.length)
                    throw new Error('Incomplete locations');
                results[index] = data;
                if (!mutable) cache.set(key, data);
            } catch {
                // Failed days remain missing; a successful zero-fire file is different.
                results[index] = null;
            } finally {
                clearTimeout(timeout);
                signal.removeEventListener('abort', abort);
            }
        }
    }
    await Promise.all(Array.from({ length: Math.min(4, dates.length) }, worker));
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
    return {
        sources: [
            ...new Set(results.filter(Boolean).map((data) => data.source?.series ?? 'nrsc-legacy')),
        ],
        sharedObservations: results
            .flatMap((data) => data?.locations ?? [])
            .filter((point) => point.shared_observation_states?.length > 1).length,
        locations: results.flatMap(
            (data, i) =>
                data?.locations.map((point) => ({ ...point, observation_date: dates[i] })) ?? [],
        ),
        missing: dates.filter((_, i) => !results[i]),
        availableDays: results.filter(Boolean).length,
    };
}
