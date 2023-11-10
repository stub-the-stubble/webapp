<script>
    import { LeafletMap, PunjabMap, CumulativeDataTable, DistrictBarchart } from '$components';
    import { setContext } from 'svelte';
    import { data_state } from '$lib/stores/data_state.js';
    import { browser } from '$app/environment';
    import IntersectionObserver from '$lib/utils/IntersectionObserver.svelte';

    setContext('state', data_state);

    //TODO use svelte-persisted-store for incoming data
    let numbers_data, locations_data, data_array, todays_data, historical_data, last_updated;

    //TODO try using tanstack-query instead
    if (browser) {
        fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/historical_data.json`)
            .then((res) => res.json())
            .then((data) => {
                historical_data = data['PB'];
                numbers_data = Object.entries(historical_data.total.dates);
                $data_state.numbers = 'loaded';
            });

        const currentDate = new Date();

        //Get date string YYYY-MM-DD format in IST
        const currentDateStr = new Date(
            currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
        )
            .toISOString()
            .split('T')[0];

        fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/${currentDateStr}.json`)
            .then((res) => res.json())
            .then((data) => {
                todays_data = data['PB'];

                data_array = Object.entries(todays_data.districts);
                locations_data = todays_data.locations;
                last_updated = data.last_update
                $data_state.locations = 'loaded';
            });
    }
</script>

<div class="container my-20">
    <div class="w-full xl:w-3/4 mx-auto">
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
            <CumulativeDataTable data={numbers_data} {last_updated} />
        </div>

        <div class="flex flex-col md:flex-row gap-16 mb-16">
            <IntersectionObserver>
                <PunjabMap {data_array} />
            </IntersectionObserver>

            <IntersectionObserver>
                <DistrictBarchart {data_array} />
            </IntersectionObserver>
        </div>
        <IntersectionObserver>
            <LeafletMap {locations_data} />
        </IntersectionObserver>
    </div>
</div>
<footer class="mb-8">
    <p class="text-sm xs:text-base px-6 text-left xs:text-center text-grey">
        Stub the Stubble is a public interest project by <a
            class="underline underline-offset-4"
            href="https://www.saroja.earth"
        >
            Saroja Earth
        </a>
    </p>
</footer>
