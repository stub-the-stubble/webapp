// Reuse completed downloads across state navigation, with finite memory and
// freshness. Old days can be corrected by a backfill, so they also expire.
export function createLocationCache({
    maxEntries = 128,
    maxPoints = 100000,
    ttlMs = 300000,
    now = Date.now,
} = {}) {
    const entries = new Map();
    let points = 0;
    const remove = (key) => {
        const entry = entries.get(key);
        if (entry) points -= entry.data.locations.length;
        entries.delete(key);
    };
    return {
        get size() {
            return entries.size;
        },
        get(key) {
            const entry = entries.get(key);
            if (!entry) return undefined;
            if (now() - entry.savedAt >= ttlMs) {
                remove(key);
                return undefined;
            }
            entries.delete(key);
            entries.set(key, entry);
            return entry.data;
        },
        has(key) {
            return this.get(key) !== undefined;
        },
        set(key, data) {
            remove(key);
            if (data.locations.length > maxPoints) return;
            entries.set(key, { data, savedAt: now() });
            points += data.locations.length;
            while (entries.size > maxEntries || points > maxPoints)
                remove(entries.keys().next().value);
        },
        delete: remove,
    };
}

// Populated only by browser requests, never by prerendering.
export const locationCache = createLocationCache();
