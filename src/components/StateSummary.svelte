<script>
    import { LeafletMap, StateMap, CumulativeDataTable, FireCountChart, DistrictBarchart } from '$components';
    import { page } from '$app/stores';
    import { states } from '$lib/data/site_info.js';
    import { fires_data } from '../stores.js';
    import { IntersectionObserver } from '$lib/utils';



    export let state, state_code, todays_data, districts_data, historical_data, layout, isStatePage, headingLevel, subheadingLevel;

    state_code = states[state].code;
    isStatePage = $page.params.state === state;
    headingLevel = isStatePage ? 'h1' : 'h2';
    subheadingLevel = isStatePage ? 'h2' : 'h3';

    $: {
        layout = layout ?? 'default';

        if ($fires_data) {
            todays_data = $fires_data[state_code + '_' + 'today'];
            districts_data = Object.entries(todays_data.districts);
            historical_data = $fires_data[state_code + '_' + 'historical'];
        }
    }
</script>



<div>
    <div class="my-12 xs:my-16">
        <svelte:element this={headingLevel} class="mb-6 text-5xl text-brown font-bold uppercase">
            <a href={states[state].url} class="hover:underline" data-sveltekit-reload>
                {states[state].name}
            </a>
        </svelte:element>
        <CumulativeDataTable data={historical_data?.total.dates} last_updated={todays_data?.last_update} {layout} />
    </div>
    <div class="flex flex-col {layout === 'narrow' ? '' : 'md:flex-row'} md:items-center md:gap-16 mb-12 last:mb-0">
        <IntersectionObserver>
            <div class="mb-8 aspect-w-1 aspect-h-1">
                <StateMap {state} {todays_data} district_breakup={todays_data?.districts} />
            </div>
        </IntersectionObserver>
        <IntersectionObserver>
            {#if todays_data && todays_data.total}
                <div class="mb-12 last:mb-0">
                    <svelte:element this={subheadingLevel} class="mb-6 text-xl font-semibold capitalize">
                        Districts with the most stubble fires
                    </svelte:element>
                    <DistrictBarchart total_count={todays_data.total} {districts_data} />
                </div>
            {/if}
            <div class="mb-12 last:mb-0">
                <svelte:element this={subheadingLevel} class="mb-4 text-xl font-semibold capitalize">
                    Last 30 days' fire count
                </svelte:element>
                <FireCountChart data={historical_data?.total.dates} />
            </div>
        </IntersectionObserver>
    </div>
    <IntersectionObserver>
        <svelte:element this={subheadingLevel} class="mb-2 text-xl font-semibold capitalize">
            Today's fire locations
        </svelte:element>
        <p class="mb-6 italic text-xs text-grey">
            * An empty map will be shown if today's fire count is zero.
        </p>
        <LeafletMap locations_data={todays_data?.locations} {state_code} center={states[state].center} {layout} />
    </IntersectionObserver>
</div>
