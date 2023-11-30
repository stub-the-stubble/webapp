<script>
    import { LeafletMap, StateMap, CumulativeDataTable, FireCountChart, DistrictBarchart } from '$components';
    import { state_info } from '$lib/data/state_info';
    import { browser } from '$app/environment';
    import { getDateISO, IntersectionObserver } from '$lib/utils';



    export let state_code, todays_data, district_data, historical_data, layout;

    //TODO try using tanstack-query instead
    if (browser) {
        fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/${state_code}/historical_data.json`)
            .then((res) => res.json())
            .then((data) => {
                historical_data = data;
            });

        //Get date string YYYY-MM-DD format in IST
        const currentDateStr = getDateISO();

        fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/${state_code}/${currentDateStr}.json`)
            .then((res) => res.json())
            .then((data) => {
                todays_data = data;
                district_data = Object.entries(todays_data.districts);
            });
    }
</script>



<div>
    <div class="my-12 xs:my-16">
        <h2 class="mb-6 text-5xl text-brown font-bold uppercase">
            <a href="{state_info[state_code].url}" class="hover:underline">
                {state_info[state_code].name}
            </a>
        </h2>
        <CumulativeDataTable data={historical_data?.total.dates} last_updated={todays_data?.last_update} {layout} />
    </div>
    <div class="flex flex-col {layout === 'narrow' ? '' : 'md:flex-row'} md:items-center gap-x-16">
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
                    <DistrictBarchart total_count={todays_data.total} {district_data} />
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
        <LeafletMap locations_data={todays_data?.locations} />
    </IntersectionObserver>
</div>
