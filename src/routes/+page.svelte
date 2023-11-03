<script>
    import { LeafletMap, PunjabMap, CumulativeDataTable, DistrictBarchart } from '$components';
    import { setContext } from 'svelte';
    import { data_state } from '$lib/stores/data_state.js';
    import IntersectionObserver from '$lib/utils/IntersectionObserver.svelte';

    import district_names_list from '$lib/data/district_names_list.json';

    export let data;

    setContext('state', data_state);
    let numbers_data, locations_data, data_array;

    // Initialize each district fire count with 0
    const district_data = {};
    district_names_list.forEach((d) => {
        district_data[d] = 0;
    });

    // Convert district fire count data to array, update any time district_data changes
    $: {
        data_array = Object.entries(district_data);
    }

    data.total_promise.json().then((res) => {
        numbers_data = res;
        $data_state.numbers = 'loaded';
    });

    if (data.locations_promise.status == 200) {
        data.locations_promise.json().then((res) => {
            locations_data = res;

            // Count all the fire counts for each district
            // TODO : get this pre-calculated from the API

            locations_data.forEach((element) => {
                const district_name = element['district'];
                district_data[district_name] += 1;
            });

            $data_state.locations = 'loaded';
        });
    } else {
        // If data is not loaded (file doesn't exist for today's date), load empty dataset
        locations_data = [];
        $data_state.locations = 'loaded';
    }
</script>

<div class="container my-20">
    <div class="w-full md:w-3/4 mx-auto">
        <div class="mb-0">
            <div class="flex gap-2 xs:gap-4 items-end mb-4">
                <img width="16" height="50"
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
            <CumulativeDataTable data={numbers_data} />
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
    <p class="text-sm xs:text-base px-6 text-left xs:text-center text-brand-grey">
        Stub the Stubble is a public interest project by <a
            class="underline underline-offset-4"
            href="https://www.saroja.earth"
        >
            Saroja Earth
        </a>
    </p>
</footer>
