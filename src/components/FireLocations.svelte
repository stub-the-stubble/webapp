<script>
    import { onMount, onDestroy } from 'svelte';
    import { format, parseISO } from 'date-fns';
    import LeafletMap from './LeafletMap.svelte';
    import {
        locationViewDates,
        selectedLocationDates,
        loadLocations,
        summarizeLocations,
    } from '$lib/utils/fireLocations.js';
    import { startDate, endDate, isRangeMode, calendarDay, fires_data } from '../stores.js';
    import { locationCache } from '$lib/utils/locationCache.js';
    import snapshot from '$lib/data/dashboardSnapshot.json';
    import { getMonitoringSeason } from '$lib/utils/season.js';
    export let state_code,
        latestDate,
        dataPending = false,
        headingLevel = 'h2';
    let period = 'selected',
        mounted = false,
        loading = false,
        result = null;
    let request;
    $: totals = $fires_data?.[`${state_code}_historical`]?.total.dates ?? {};
    // A response for the other state must not cancel this map's downloads.
    $: revision = $fires_data?.revisions?.[`${state_code}_historical`] ?? 0;
    let lastSelection;
    $: selection = `${$startDate}/${$endDate}/${$isRangeMode}`;
    $: if (selection !== lastSelection) {
        lastSelection = selection;
        period = 'selected';
    }
    $: dates =
        period === 'selected'
            ? selectedLocationDates($startDate, $endDate, $isRangeMode)
            : locationViewDates(period, latestDate, parseISO($calendarDay));
    $: season = getMonitoringSeason(parseISO(latestDate || $calendarDay));
    $: initialFiles = dates.map((date) => snapshot.locations[`${state_code}/${date}`]);
    $: initialLocations =
        initialFiles.length && initialFiles.every(Boolean)
            ? summarizeLocations(initialFiles, dates)
            : null;
    $: if (!mounted) result = initialLocations;
    $: rangeLabel = dates.length
        ? dates.length === 1
            ? format(parseISO(dates[0]), 'd MMM yyyy')
            : `${format(parseISO(dates[0]), 'd MMM')} – ${format(
                  parseISO(dates.at(-1)),
                  'd MMM yyyy',
              )}`
        : '';
    onMount(() => {
        mounted = true;
    });
    onDestroy(() => request?.abort());
    let lastRequestKey;
    $: requestKey = JSON.stringify([dates, state_code, revision]);
    $: if (mounted && requestKey !== lastRequestKey) {
        lastRequestKey = requestKey;
        refresh(dates, state_code, initialLocations, totals);
    }
    async function refresh(requestedDates, state, savedLocations, reportedTotals) {
        request?.abort();
        if (!requestedDates.length) {
            request = null;
            result = null;
            loading = false;
            return;
        }
        const current = new AbortController();
        request = current;
        loading = !savedLocations;
        result = savedLocations;
        try {
            const loaded = await loadLocations(
                fetch,
                state,
                requestedDates,
                current.signal,
                locationCache,
                {
                    totals: reportedTotals,
                    onProgress: (partial) => {
                        if (request !== current) return;
                        if (partial.availableDays) result = partial;
                        loading = partial.pending.length > 0;
                    },
                },
            );
            if (request === current)
                result = loaded.availableDays
                    ? loaded
                    : savedLocations
                    ? { ...savedLocations, saved: true }
                    : loaded;
        } catch (error) {
            if (error.name !== 'AbortError' && request === current)
                result = savedLocations
                    ? { ...savedLocations, saved: true }
                    : {
                          locations: [],
                          missing: requestedDates,
                          availableDays: 0,
                      };
        } finally {
            if (request === current) loading = false;
        }
    }
</script>

<section class="mb-8">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
        <svelte:element this={headingLevel} class="text-xl font-semibold"
            >Fire locations</svelte:element
        >
        <select
            aria-label={`${state_code} fire location period`}
            bind:value={period}
            class="max-w-full rounded border border-light-brown bg-white px-3 py-2 text-sm"
        >
            <option value="selected">Dashboard dates</option>
            <option value="latest">Latest reported</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">7 days</option>
            <option value="month">Month</option>
            <option value="thirty">30 days</option>
            <option value="season">{season.crop} season</option>
        </select>
    </div>
    <div role="status" aria-live="polite" class="text-sm text-grey mb-3 min-h-[20px]">
        {#if result?.availableDays > 0}
            <span class="font-medium text-black"
                >{result.locations.length.toLocaleString()} fires{loading ? ' so far' : ''}</span
            >
            · {rangeLabel}
            {#if result.saved} · Saved locations{/if}
            {#if loading}
                · Loading {result.availableDays}/{dates.length} days…
            {:else if result.missing.length}
                · {result.availableDays}/{dates.length} days reported{/if}
        {:else if loading || dataPending}Loading locations…
        {:else if !dates.length && $startDate != null}Choose a period of one year or less to view
            locations.
        {:else}No report{rangeLabel ? ` · ${rangeLabel}` : ''}{/if}
    </div>
    {#if result?.timedOut}<p class="text-xs text-grey mb-3" role="status">
            Some dates took too long to load.
        </p>{/if}
    {#if result?.missing.length}
        <details class="text-xs text-grey mb-3">
            <summary class="cursor-pointer">Missing dates ({result.missing.length})</summary>
            <p class="mt-1">{result.missing.join(', ')}</p>
        </details>
    {/if}
    <LeafletMap locations_data={result?.locations ?? []} {state_code} />
</section>
