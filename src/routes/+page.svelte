<script>
    import LeafletMap from '$lib/components/LeafletMap.svelte';
    import PunjabMap from '$lib/components/PunjabMap.svelte';
    import Table from '$lib/components/Table.svelte';

    import firedata from '$lib/data/15_Oct_Punjab.json';

    const locations = firedata.map((value) => {
        return {
            lat: value['Latitude'],
            long: value['Longitude'],
            time: value['ACQ_TIME'],
            dist: value['District'],
            tb: value['Tehsil'],
            frp: value['FRP']
        };
    });
</script>

<div class="container my-16">
    <div class="w-3/4 mx-auto">
        <div class="mb-16">
            <h1 class="text-5xl mb-8">Stub The Stubble</h1>
            <h2 class="text-2xl max-w-prose">
                Stub the Stubble is a platform to understand the problems and solutions related to
                stubble burning in India.
            </h2>
        </div>
        <div class="my-8">
            <p>Data as on 15th October 2023</p>
        </div>
        <div class="flex flex-col-reverse md:flex-row gap-16 mb-16">
            <Table {firedata} />
            <PunjabMap />
        </div>
        <LeafletMap {locations} />
    </div>
</div>
