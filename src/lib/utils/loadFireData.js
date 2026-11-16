import { format, parseISO } from 'date-fns';
import { getDateISO } from './datetime.js';
import { isCount } from './datahelpers.js';

const baseURL = 'https://stub-the-stubble.github.io/data-pipeline/v2';
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const validDate = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parseISO(value).getTime()) &&
    format(parseISO(value), 'yyyy-MM-dd') === value;
const validSeries = (value) =>
    isObject(value) &&
    Object.entries(value).every(([date, count]) => validDate(date) && isCount(count));

export function validPayload(data, historical) {
    if (!isObject(data) || !isObject(data.districts)) return false;
    if (historical) {
        return (
            isObject(data.total) &&
            validSeries(data.total.dates) &&
            (data.unassigned === undefined ||
                (isObject(data.unassigned) &&
                    validSeries(data.unassigned.dates) &&
                    Object.entries(data.unassigned.dates).every(
                        ([date, count]) => count <= data.total.dates[date],
                    ))) &&
            Object.values(data.districts).every(
                (district) => isObject(district) && validSeries(district.dates),
            )
        );
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

export async function loadFireData(fetcher, signal) {
    // Fetch each state/history independently: a missing current-day file must not
    // hide historical charts or the other state's available observations.
    const date = getDateISO();
    const errors = {};
    const entries = await Promise.all(
        ['PB_today', 'PB_historical', 'HR_today', 'HR_historical'].map(async (key) => {
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
                    { signal: controller.signal },
                );
                if (!response.ok) throw new Error(response.status === 404 ? 'missing' : 'request');
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
        }),
    );
    return { ...Object.fromEntries(entries), errors };
}
