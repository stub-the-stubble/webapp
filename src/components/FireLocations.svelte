<script>
    import { onMount, onDestroy } from 'svelte';
    import LeafletMap from './LeafletMap.svelte';
    import { getDateIST } from '$lib/utils/datetime.js';
    import { locationDates, loadLocations } from '$lib/utils/fireLocations.js';
    import { getMonitoringSeason } from '$lib/utils/season.js';
    export let state_code,
        center,
        layout,
        headingLevel = 'h2';
    let period = 'today',
        mounted = false,
        loading = false,
        result = null,
        dates = [];
    let request;
    const cache = new Map();
    const season = getMonitoringSeason(getDateIST());
    onMount(() => {
        mounted = true;
    });
    onDestroy(() => request?.abort());
    $: if (mounted) refresh(period, state_code);
    async function refresh(selected, state) {
        request?.abort();
        const current = new AbortController();
        request = current;
        dates = locationDates(selected, getDateIST());
        loading = true;
        result = null;
        try {
            const loaded = await loadLocations(fetch, state, dates, current.signal, cache);
            // A slow previous selection must never replace a newer selection's markers.
            if (request === current) result = loaded;
        } catch (error) {
            if (error.name !== 'AbortError' && request === current)
                result = { locations: [], missing: dates, availableDays: 0 };
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
        <label class="text-sm"
            >Show
            <select
                aria-label={`${state_code} fire location period`}
                bind:value={period}
                class="ml-2 rounded border border-light-brown bg-white px-3 py-2"
            >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 days</option>
                <option value="month">This month</option>
                <option value="thirty">Last 30 days</option>
                <option value="season">{season.label} ({season.crop.toLowerCase()})</option>
            </select>
        </label>
    </div>
    <p class="text-sm text-grey mb-2">
        {dates[0] ?? ''} – {dates.at(-1) ?? ''} (IST). This filter controls only the location map.
    </p>
    <div role="status" aria-live="polite" class="text-sm mb-3">
        {#if loading}Loading fire locations…
        {:else if result}
            {#if result.availableDays === 0}Location data unavailable for this period.
            {:else}
                {result.locations.length.toLocaleString()} satellite fire detections across {result.availableDays}
                of {dates.length} days.
                {#if result.missing.length}
                    Partial coverage; missing days are not counted as zero.
                {:else if !result.locations.length}
                    No fire detections reported for this period.{/if}
            {/if}
            {#if result.missing.length}<details class="mt-1">
                    <summary>Missing location dates ({result.missing.length})</summary
                    >{result.missing.join(', ')}
                </details>{/if}
        {/if}
    </div>
    <LeafletMap locations_data={result?.locations ?? []} {state_code} {center} {layout} />
    <p class="mt-2 text-xs text-grey">
        Satellite imagery is background reference, not an image of the fire date. Detections may
        include repeated observations; they do not identify individual farms. Zoom in to inspect the
        landscape.
    </p>
</section>
