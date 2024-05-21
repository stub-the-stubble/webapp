<script>
    import { startOfToday, getTime } from 'date-fns';
    import { page } from '$app/stores';
    import { LeafletMap, StateMap, CumulativeDataTable, FireCountChart, DistrictBarchart } from '$components';
    import { states } from '$lib/data/site_info.js';
    import { endDate, fires_data, isRangeMode, startDate } from '../stores.js';
    import { IntersectionObserver } from '$lib/utils';
    import { getFiresTotals, getFiresBreakupsByDistrict } from '$lib/utils/datahelpers.js';
    import arrowRight from '$lib/assets/icons/arrow_right.svg?raw';



    export let state, layout = 'default';

    let state_code, todays_data, historical_data, isStatePage, headingLevel, subheadingLevel, isToday;

    // Variables for state map
    // TODO: Audit all variables for this component
    let totals_data, districts_data, total_count_list, district_breakups_list;

    $: updateStatePageDetails(state);

    $: if ($fires_data) {
        updateDataForComponents($fires_data, state_code, $isRangeMode, $endDate, $startDate);
        isToday = $startDate === getTime(startOfToday());
    }

    function updateDataForComponents(fires_data, state_code, isRangeMode, endDate, startDate) {
        todays_data = fires_data[state_code + '_' + 'today'];

        historical_data = fires_data[state_code + '_' + 'historical'];
        totals_data = historical_data?.total.dates;
        districts_data = historical_data?.districts;
        total_count_list = getFiresTotals(totals_data, isRangeMode, endDate, startDate);
        district_breakups_list = getFiresBreakupsByDistrict(districts_data, isRangeMode, endDate, startDate);
    }

    function updateStatePageDetails(state) {
        state_code = states[state].code;
        isStatePage = $page.params.state === state;
        headingLevel = isStatePage ? 'h1' : 'h2';
        subheadingLevel = isStatePage ? 'h2' : 'h3';
    }
</script>


{#key state}
    <div>
        <div class="my-12 xs:my-16">
            <svelte:element this={headingLevel} class="mb-6 text-5xl text-brown font-bold uppercase">
                <a href={states[state].url} class="group flex">
                    <span class="mr-2 border-b-4 border-transparent hover:border-brown transition-colors">
                        {states[state].name}
                    </span>
                    {#if !isStatePage}
                        <span class="icon-h-12 group-hover:translate-x-2 transition-transform">
                            {@html arrowRight}
                        </span>
                    {/if}
                </a>
            </svelte:element>
            <CumulativeDataTable data={historical_data?.total.dates} last_updated={todays_data?.last_update} {layout} />
        </div>
        <div class="flex flex-col {layout === 'narrow' ? '' : 'md:flex-row'} md:gap-16 mb-12 last:mb-0">
            <IntersectionObserver>
                <svelte:element this={subheadingLevel} class="mb-6 text-xl font-semibold capitalize">
                    State and District Fire Counts
                </svelte:element>
                <div class="mb-8 aspect-w-1 aspect-h-1">
                    <StateMap {state} totals_list={total_count_list} {district_breakups_list} />
                </div>
            </IntersectionObserver>
            <IntersectionObserver>
                <div class="mb-12 last:mb-0">
                    <svelte:element this={subheadingLevel} class="mb-6 text-xl font-semibold capitalize">
                        Districts with most stubble fires
                    </svelte:element>
                    <DistrictBarchart totals_list={total_count_list} {district_breakups_list} />
                </div>
                <div class="mb-12 last:mb-0">
                    <svelte:element this={subheadingLevel} class="mb-4 text-xl font-semibold capitalize">
                        Fire counts
                    </svelte:element>
                    <FireCountChart data={historical_data?.total.dates} />
                </div>
            </IntersectionObserver>
        </div>
        {#if isToday}
            <IntersectionObserver>
                <svelte:element this={subheadingLevel} class="mb-2 text-xl font-semibold capitalize">
                    Today's fire locations
                </svelte:element>
                <p class="mb-6 italic text-xs text-grey">
                    * An empty map will be shown if today's fire count is zero.
                </p>
                <LeafletMap locations_data={todays_data?.locations} {state_code} center={states[state].center} {layout} />
            </IntersectionObserver>
        {/if}
    </div>
{/key}
