<script>
    import { onMount, onDestroy } from 'svelte';
    import { format, parseISO } from 'date-fns';
    import LeafletMap from './LeafletMap.svelte';
    import { getDateIST } from '$lib/utils/datetime.js';
    import {
        locationViewDates,
        selectedLocationDates,
        loadLocations,
        summarizeLocations,
    } from '$lib/utils/fireLocations.js';
    import { startDate, endDate, isRangeMode } from '../stores.js';
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
    const cache = new Map();
    let lastSelection;
    $: selection = `${$startDate}/${$endDate}/${$isRangeMode}`;
    $: if (selection !== lastSelection) {
        lastSelection = selection;
        period = 'selected';
    }
    $: dates =
        period === 'selected'
            ? selectedLocationDates($startDate, $endDate, $isRangeMode)
            : locationViewDates(period, latestDate, getDateIST());
    $: season = getMonitoringSeason(latestDate ? parseISO(latestDate) : getDateIST());
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
    $: if (mounted) refresh(dates, state_code, initialLocations);
    async function refresh(requestedDates, state, savedLocations) {
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
            const loaded = await loadLocations(fetch, state, requestedDates, current.signal, cache);
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
        {#if loading || dataPending}Loading locations…
        {:else if result?.availableDays > 0}
            <span class="font-medium text-black"
                >{result.locations.length.toLocaleString()} fires</span
            >
            · {rangeLabel}
            {#if result.saved} · Saved locations{/if}
            {#if result.missing.length} · {result.availableDays}/{dates.length} days reported{/if}
        {:else if !dates.length && $startDate != null}Choose a period of one year or less to view
            locations.
        {:else}No report{rangeLabel ? ` · ${rangeLabel}` : ''}{/if}
    </div>
    {#if result?.missing.length}
        <details class="text-xs text-grey mb-3">
            <summary class="cursor-pointer">Missing dates ({result.missing.length})</summary>
            <p class="mt-1">{result.missing.join(', ')}</p>
        </details>
    {/if}
    <LeafletMap locations_data={result?.locations ?? []} {state_code} {dates} />
</section>
