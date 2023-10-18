<script>
    import district_names_list from '$lib/data/district_names_list.json';
    export let firedata;
    const district_data = {};

    district_names_list.forEach((d) => {
        district_data[d] = 0;
    });

    firedata.forEach((element) => {
        const district_name = element['District'];
        district_data[district_name] += 1;
    });
</script>

<div class="basis-1/3">
    <table class="border-separate">
        <thead>
            <tr class="h-12">
                <td class="bg-brand-light-grey px-4 font-semibold">District</td>
                <td class="bg-brand-light-grey px-4 font-semibold">No of fires detected</td>
            </tr>
        </thead>
        <tbody>
            {#each Object.entries(district_data) as dist}
                <tr class="h-8 text-sm">
                    <td class="bg-brand-light-grey px-4">{dist[0]}</td>
                    <td class="bg-brand-light-grey px-4">{dist[1]}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
</style>
