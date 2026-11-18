<script>
    import { page } from '$app/stores';
    import { StateMap, CumulativeDataTable, FireCountChart, DistrictBarchart } from '$components';
    import { states } from '$lib/data/site_info.js';
    import { endDate, fires_data, isRangeMode, startDate } from '../stores.js';
    import { IntersectionObserver } from '$lib/utils';
    import {
        getFiresTotals,
        getFiresBreakupsByDistrict,
        periodTotal,
    } from '$lib/utils/datahelpers.js';
    import arrowRight from '$lib/assets/icons/arrow_right.svg?raw';
    import FireLocations from './FireLocations.svelte';

    export let state,
        layout = 'default';

    let state_code, historical_data, isStatePage, headingLevel, subheadingLevel;

    // Variables for state map
    // TODO: Audit all variables for this component
    let totals_data, districts_data, total_count_list, district_breakups_list;

    let selectionTotal, selectionComplete;
    $: unassignedCount = periodTotal(
        historical_data?.unassigned?.dates,
        $startDate,
        $isRangeMode ? $endDate : $startDate,
    );
    $: selectionTotal = periodTotal(
        historical_data?.total.dates,
        $startDate,
        $isRangeMode ? $endDate : $startDate,
    );
    $: selectionComplete =
        selectionTotal !== null &&
        Object.values(historical_data?.districts ?? {}).every(
            (district) =>
                periodTotal(district.dates, $startDate, $isRangeMode ? $endDate : $startDate) !==
                null,
        );
    $: state_code = states[state].code;
    $: isStatePage = $page.params.state === state;
    $: headingLevel = isStatePage ? 'h1' : 'h2';
    $: subheadingLevel = isStatePage ? 'h2' : 'h3';

    $: historical_data = $fires_data?.[state_code + '_historical'];
    $: totals_data = historical_data?.total.dates;
    $: districts_data = historical_data?.districts;
    $: total_count_list = getFiresTotals(totals_data, $isRangeMode, $endDate, $startDate);
    $: district_breakups_list = getFiresBreakupsByDistrict(
        districts_data,
        $isRangeMode,
        $endDate,
        $startDate,
    );
</script>

{#key state}
    <div>
        <div class="my-12 xs:my-16">
            <svelte:element
                this={headingLevel}
                class="mb-6 text-5xl text-brown font-bold uppercase"
            >
                <a href={states[state].url} class="group flex">
                    <span
                        class="mr-2 border-b-4 border-transparent hover:border-brown transition-colors"
                    >
                        {states[state].name}
                    </span>
                    {#if !isStatePage}
                        <span class="icon-h-12 group-hover:translate-x-2 transition-transform">
                            <!-- Imported static SVG, never remote content. -->
                            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                            {@html arrowRight}
                        </span>
                    {/if}
                </a>
            </svelte:element>
            {#if $fires_data?.errors?.[state_code + '_historical']}
                <p role="status" class="mb-3 text-sm text-grey">
                    {historical_data
                        ? 'Update unavailable. Showing saved observations.'
                        : 'Could not load counts. Please refresh.'}
                </p>
            {:else if historical_data && !selectionComplete}
                <p role="status" class="mb-3 text-sm text-grey">
                    {$isRangeMode
                        ? 'Some dates are missing; shown totals are partial.'
                        : 'No report for this date.'}
                </p>
            {/if}
            {#if unassignedCount > 0}
                <p class="mb-3 text-sm text-grey">
                    {unassignedCount} fires have no district assignment.
                </p>
            {/if}
            <CumulativeDataTable
                data={historical_data?.total.dates}
                loading={!historical_data && !$fires_data?.errors?.[state_code + '_historical']}
            />
        </div>
        {#if historical_data}
            <div
                class="flex flex-col {layout === 'narrow'
                    ? ''
                    : 'md:flex-row'} md:gap-16 mb-12 last:mb-0"
            >
                <IntersectionObserver>
                    <svelte:element
                        this={subheadingLevel}
                        class="mb-6 text-xl font-semibold capitalize"
                    >
                        State and District Fire Counts
                    </svelte:element>
                    <div class="mb-8">
                        <!-- New districts lack older history. Keep known districts visible;
                             their missing neighbours remain grey instead of hiding the state. -->
                        <StateMap
                            complete={$isRangeMode
                                ? Object.keys(total_count_list).length > 0
                                : selectionTotal !== null}
                            {state}
                            totals_list={total_count_list}
                            {district_breakups_list}
                        />
                    </div>
                </IntersectionObserver>
                <IntersectionObserver>
                    <div class="mb-12 last:mb-0">
                        <svelte:element
                            this={subheadingLevel}
                            class="mb-6 text-xl font-semibold capitalize"
                        >
                            Districts with most stubble fires
                        </svelte:element>
                        <DistrictBarchart
                            complete={selectionComplete}
                            totals_list={total_count_list}
                            {district_breakups_list}
                        />
                    </div>
                    <div class="mb-12 last:mb-0">
                        <svelte:element
                            this={subheadingLevel}
                            class="mb-4 text-xl font-semibold capitalize"
                        >
                            Fire counts
                        </svelte:element>
                        <FireCountChart data={historical_data?.total.dates} />
                    </div>
                </IntersectionObserver>
            </div>
        {/if}
        <IntersectionObserver>
            <FireLocations
                dataPending={!historical_data && !$fires_data?.errors?.[state_code + '_historical']}
                latestDate={Object.keys(historical_data?.total.dates ?? {})
                    .sort()
                    .at(-1)}
                headingLevel={subheadingLevel}
                {state_code}
            />
        </IntersectionObserver>
    </div>
{/key}
