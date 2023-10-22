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

    const district_data = {};
    district_names_list.forEach((d) => {
        district_data[d] = 0;
    });

    firedata.forEach((element) => {
        const district_name = element['district'];
        district_data[district_name] += 1;
    });

    const data_array = Object.entries(district_data);
    const total = data_array.reduce((total, value, index, array) => {
        return total + array[index][1];
    },0);

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
            <CumulativeDataTable {total} />
        </div>
        <div class="flex flex-col md:flex-row gap-16 mb-16">
            <PunjabMap {data_array} />
            <DistrictBarchart {data_array} />
        </div>
        <LeafletMap {locations} />
    </div>
</div>
