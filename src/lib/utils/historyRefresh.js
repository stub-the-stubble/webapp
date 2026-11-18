import { loadFireData } from './loadFireData.js';

export function mergeHistoryUpdate(previous, update) {
    const next = {
        ...previous,
        errors: update.errors,
        pending: { ...previous.pending },
        revisions: { ...previous.revisions },
    };
    for (const state of ['PB', 'HR']) {
        const key = `${state}_historical`;
        if (Object.hasOwn(update, key)) {
            next.pending[key] = false;
            if (update[key]) {
                if (previous[key] !== update[key])
                    next.revisions[key] = (previous.revisions?.[key] ?? 0) + 1;
                next[key] = update[key];
            }
        }
    }
    return next;
}

// One refresh at a time. Returning to the tab or reconnecting can recover a
// failed request without a manual refresh button or a page reload.
export function createHistoryRefresh(
    fetcher,
    onUpdate,
    { now = Date.now, intervalMs = 300000 } = {},
) {
    let pending,
        controller,
        lastAttempt = -Infinity,
        stopped = false;
    return {
        refresh(force = false) {
            if (stopped) return Promise.resolve();
            if (pending) return pending;
            if (!force && now() - lastAttempt < intervalMs) return Promise.resolve();
            lastAttempt = now();
            controller = new AbortController();
            pending = loadFireData(fetcher, controller.signal, onUpdate, {
                includeToday: false,
            }).finally(() => {
                pending = undefined;
            });
            return pending;
        },
        stop() {
            stopped = true;
            controller?.abort();
        },
    };
}
