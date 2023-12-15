<script>
    import { LeafletMap, StateMap, CumulativeDataTable, FireCountChart, DistrictBarchart } from '$components';
    import { states } from '$lib/data/site_info.js';
    import { fires_data } from '../stores/fires_data.js';
    import { IntersectionObserver } from '$lib/utils';



    export let state_code, todays_data, districts_data, historical_data, layout;

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
        <h2 class="mb-6 text-5xl text-brown font-bold uppercase">
            <a href="{states[state_code].url}" class="hover:underline">
                {states[state_code].name}
            </a>
        </h2>
        <CumulativeDataTable data={historical_data?.total.dates} last_updated={todays_data?.last_update} {layout} />
    </div>
    <div class="flex flex-col {layout === 'narrow' ? '' : 'md:flex-row'} md:items-center md:gap-16 mb-12 last:mb-0">
        <IntersectionObserver>
            <div class="mb-8 aspect-w-1 aspect-h-1">
                <StateMap district_counts={todays_data?.districts} state_code={state_code} />
            </div>
        </IntersectionObserver>
        <IntersectionObserver>
            {#if todays_data && todays_data.total}
                <div class="mb-12 last:mb-0">
                    <h3 class="mb-6 text-xl font-semibold capitalize">
                        Districts with the most stubble fires
                    </h3>
                    <DistrictBarchart total_count={todays_data.total} {districts_data} />
                </div>
            {/if}
            <div class="mb-12 last:mb-0">
                <h3 class="mb-4 text-xl font-semibold capitalize">
                    Last 30 days' fire count
                </h3>
                <FireCountChart data={historical_data?.total.dates} />
            </div>
        </IntersectionObserver>
    </div>
    <IntersectionObserver>
        <LeafletMap locations_data={todays_data?.locations} center={states[state_code].coordinates} />
    </IntersectionObserver>
</div>
