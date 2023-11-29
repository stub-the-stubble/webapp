<script>
    import { Header, LeafletMap, StateMap, CumulativeDataTable, FireCountChart, DistrictBarchart, Footer } from '$components';
    import { browser } from '$app/environment';
    import { IntersectionObserver, getDateISO } from '$lib/utils';

    let data_array, todays_data, historical_data;

    //TODO try using tanstack-query instead
    if (browser) {
        fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/PB/historical_data.json`)
            .then((res) => res.json())
            .then((data) => {
                historical_data = data;
            });

        //Get date string YYYY-MM-DD format in IST
        const currentDateStr = getDateISO();

        fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/PB/${currentDateStr}.json`)
            .then((res) => res.json())
            .then((data) => {
                todays_data = data;
                data_array = Object.entries(todays_data.districts);
            });
    }
</script>

<Header />
<div class="container my-12">
    <div class="w-full xl:w-5/6 mx-auto">
        <div class="mb-0">
            <div class="flex gap-2 xs:gap-4 items-end mb-4">
                <img
                    width="16"
                    height="50"
                    class="w-4 xs:w-5 sm:w-6"
                    src="stub_the_stubble_icon.svg"
                    alt="Stub the Stubble logo"
                />
                <h1 class="text-4xl xs:text-5xl sm:text-6.5xl">Stub The Stubble</h1>
            </div>
            <h2 class="text-lg xs:text-2xl max-w-prose">
                Stub the Stubble is a platform to understand the problems and solutions related to
                stubble burning in India.
            </h2>
        </div>
        <div class="hidden my-8">
            <h3>15th October 2023</h3>
        </div>
        <div class="my-12 xs:my-16">
            <CumulativeDataTable data={historical_data?.total.dates} last_updated={todays_data?.last_update} />
        </div>

        <div class="flex flex-col md:flex-row md:items-center gap-16 mb-16">
            <IntersectionObserver>
                <StateMap district_counts={todays_data?.districts} state_code="PB" />
            </IntersectionObserver>

            <IntersectionObserver>
                {#if todays_data && todays_data.total}
                    <div class="mb-12 last:mb-0">
                        <h3 class="mb-4 text-xl font-semibold capitalize">
                            Districts with the most stubble fires
                        </h3>
                        <DistrictBarchart total_count={todays_data.total} district_data={data_array} />
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
</div>
<Footer />