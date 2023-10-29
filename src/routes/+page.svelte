<script>
    import LeafletMap from '$components/LeafletMap.svelte';
    import PunjabMap from '$components/PunjabMap.svelte';
    import CumulativeDataTable from '$components/CumulativeDataTable.svelte';
    import DistrictBarchart from '$components/DistrictBarchart.svelte';
    import district_names_list from '$lib/data/district_names_list.json';
    import { onMount } from 'svelte';

    let numbers_data, locations_data, data_array;

    // Initialize each district fire count with 0
    const district_data = {};
        district_names_list.forEach((d) => {
            district_data[d] = 0;
        });

    // Convert district fire count data to array
    $: data_array = Object.entries(district_data);

    onMount(async () => {
        const res = await fetch(`https://stub-the-stubble.github.io/data-pipeline/total_numbers.json`);

        const currentDate = new Date();
        const currentDateStr = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        const res2 = await fetch(
            `https://stub-the-stubble.github.io/data-pipeline/${currentDateStr}.json`
        );
        if (res2.ok) {
            locations_data = await res2.json();
        } else {
            locations_data = []
        }
        numbers_data = await res.json();

        // Count all the fire counts for each district
        locations_data.forEach((element) => {
            const district_name = element['district'];
            district_data[district_name] += 1;
        });

    });
</script>

<div class="container my-20">
    <div class="w-full md:w-3/4 mx-auto">
        <div class="mb-0">
            <div class="flex gap-2 xs:gap-4 items-end mb-4">
                <img
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
            <PunjabMap {data_array}/>
            <DistrictBarchart {data_array} />
        </div>
        {#if locations_data}
            <LeafletMap {locations_data} />
        {/if}
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
