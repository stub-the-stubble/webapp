import { format, parseISO } from 'date-fns';
import { getDateISO } from './datetime.js';
import { isCount } from './datahelpers.js';

const baseURL = 'https://stub-the-stubble.github.io/data-pipeline/v2';
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const validDate = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parseISO(value).getTime()) &&
    format(parseISO(value), 'yyyy-MM-dd') === value;
const validSeries = (value, dates) =>
    isObject(value) &&
    Object.entries(value).every(([date, count]) => {
        // Every district repeats the same calendar keys. Parse each date once
        // per payload instead of tens of thousands of times on the main thread.
        if (!dates.has(date)) dates.set(date, validDate(date));
        return dates.get(date) && isCount(count);
    });

export function validPayload(data, historical) {
    if (!isObject(data) || !isObject(data.districts)) return false;
    if (historical) {
        const dates = new Map();
        return (
            isObject(data.total) &&
            validSeries(data.total.dates, dates) &&
            (data.unassigned === undefined ||
                (isObject(data.unassigned) &&
                    validSeries(data.unassigned.dates, dates) &&
                    Object.entries(data.unassigned.dates).every(
                        ([date, count]) => count <= data.total.dates[date],
                    ))) &&
            Object.values(data.districts).every(
                (district) => isObject(district) && validSeries(district.dates, dates),
            )
        );
    }
    if (data.source?.series === 'iari-creams-paddy-v1') {
        // Official totals and displayed points must come from the same accepted
        // records. Keep the looser legacy schema below for older NRSC snapshots.
        if (!Array.isArray(data.locations) || data.total !== data.locations.length) return false;
        const ids = new Set();
        const counts = {};
        for (const point of data.locations) {
            if (
                !isObject(point) ||
                typeof point.event_id !== 'string' ||
                !point.event_id ||
                ids.has(point.event_id)
            )
                return false;
            if (
                !Number.isFinite(point.lat) ||
                point.lat < -90 ||
                point.lat > 90 ||
                !Number.isFinite(point.lon) ||
                point.lon < -180 ||
                point.lon > 180 ||
                !Object.hasOwn(data.districts, point.district)
            )
                return false;
            ids.add(point.event_id);
            counts[point.district] = (counts[point.district] ?? 0) + 1;
        }
        if (
            data.unassigned_total !== 0 ||
            Object.entries(data.districts).some(([name, count]) => (counts[name] ?? 0) !== count)
        )
            return false;
    }
    return (
        isCount(data.total) &&
        (data.unassigned_total === undefined ||
            (isCount(data.unassigned_total) &&
                data.unassigned_total +
                    Object.values(data.districts).reduce((sum, count) => sum + count, 0) ===
                    data.total)) &&
        Object.values(data.districts).every(isCount) &&
        Array.isArray(data.locations) &&
        data.locations.every(
            (point) => isObject(point) && Number.isFinite(point.lat) && Number.isFinite(point.lon),
        )
    );
}

export async function loadFireData(fetcher, signal, onUpdate, { includeToday = true } = {}) {
    // Fetch each state/history independently: a missing current-day file must not
    // hide historical charts or the other state's available observations.
    const date = getDateISO();
    const errors = {};
    const settled = {};
    const entries = await Promise.all(
        (includeToday
            ? ['PB_today', 'PB_historical', 'HR_today', 'HR_historical']
            : ['PB_historical', 'HR_historical']
        )
            .map(async (key) => {
                const [state, kind] = key.split('_');
                const historical = kind === 'historical';
                const controller = new AbortController();
                // Bound each request and also cancel it when the owning component unmounts.
                const abort = () => controller.abort();
                signal?.addEventListener('abort', abort, { once: true });
                if (signal?.aborted) controller.abort();
                const timeout = setTimeout(abort, 12000);
                try {
                    const response = await fetcher(
                        `${baseURL}/${state}/${historical ? 'historical_data' : date}.json`,
                        // Refresh dashboard must revalidate summaries as well as map files.
                        { signal: controller.signal, cache: 'no-cache' },
                    );
                    if (!response.ok)
                        throw new Error(response.status === 404 ? 'missing' : 'request');
                    if (
                        !response.headers
                            .get('content-type')
                            ?.toLowerCase()
                            .includes('application/json')
                    )
                        throw new Error('format');
                    const data = await response.json();
                    if (!validPayload(data, historical)) throw new Error('schema');
                    return [key, data];
                } catch (error) {
                    errors[key] = ['missing', 'request', 'format', 'schema'].includes(error.message)
                        ? error.message
                        : 'request';
                    return [key, null];
                } finally {
                    clearTimeout(timeout);
                    signal?.removeEventListener('abort', abort);
                }
            })
            .map((request) =>
                request.then(([key, data]) => {
                    settled[key] = data;
                    // Render each history immediately; a slow/missing daily file must
                    // not keep already validated summary numbers behind a loading screen.
                    if (!signal?.aborted) onUpdate?.({ ...settled, errors: { ...errors } });
                    return [key, data];
                }),
            ),
    );
    return { ...Object.fromEntries(entries), errors };
}
