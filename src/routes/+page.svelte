<script>
    import LeafletMap from '$lib/components/LeafletMap.svelte';
    import PunjabMap from '$lib/components/PunjabMap.svelte';
    import CumulativeDataTable from '$lib/components/CumulativeDataTable.svelte';
    import DistrictBarchart from '$lib/components/DistrictBarchart.svelte';

    import firedata from '$lib/data/data.json';
    import district_names_list from '$lib/data/district_names_list.json';

    const locations = firedata.map((value) => {
        return {
            lat: value['lat'],
            long: value['lon'],
            time: value['acqtime'],
            dist: value['district'],
            frp: value['radiative_']
        };
    });

    // Initialize each district fire count with 0
    const district_data = {};
    district_names_list.forEach((d) => {
        district_data[d] = 0;
    });

    // Count all the fire counts for each district
    firedata.forEach((element) => {
        const district_name = element['district'];
        district_data[district_name] += 1;
    });

    // Convert district fire count data to array
    const data_array = Object.entries(district_data);

    // Get total value of all fire counts
    const fc_today = data_array.reduce((fc_today, value, index, array) => {
        return fc_today + array[index][1];
    }, 0);
</script>

<div class="container my-16">
    <div class="w-full md:w-3/4 mx-auto">
        <div class="mb-16">
            <h1 class="text-5xl mb-8">Stub The Stubble</h1>
            <h2 class="text-2xl max-w-prose">
                Stub the Stubble is a platform to understand the problems and solutions related to
                stubble burning in India.
            </h2>
        </div>
        <div class="hidden my-8">
            <h3>15th October 2023</h3>
        </div>
        <div class="my-16">
            <CumulativeDataTable {fc_today} />
        </div>
        <div class="flex flex-col md:flex-row gap-16 mb-16">
            <PunjabMap {data_array} />
            <DistrictBarchart {data_array} />
        </div>
        <LeafletMap {locations} />
    </div>
</div>
<footer class="mb-8">
    <p class="text-center text-brand-grey">
        Stub the Stubble is a public interest project by <a
            class="underline underline-offset-4"
            href="https://www.saroja.earth">
            Saroja Earth
        </a>
    </p>
</footer>
