<script>
    import { CumulativeDataTable, FireCountChart } from '$components';
    import { fires_data } from '../stores/fires_data.js';



    export let state_code, historical_data, districts_data;
    export const periods = [
        'Today',
        'Yesterday',
        'This week',
        'This month',
        'Season till date',
    ];

    $: if ($fires_data) {
        historical_data = $fires_data[state_code + '_' + 'historical'];
        districts_data = Object.entries(historical_data.districts);
    }
</script>



<h2 class="mb-6 text-2xl font-semibold capitalize">
    District-Wise Data Breakup
</h2>
<div class="mb-12 last:mb-0">
    {#if $fires_data }
        <div class="flex justify-between items-center gap-16">
            <div class="basis-1/6 flex-none"></div>
            <div class="basis-5/12 flex-none flex">
                {#each periods as period}
                    <div class="basis-1/5 flex-none px-1 text-center capitalize">
                        {period}
                    </div>
                {/each}
            </div>
            <div class="basis-5/12 flex-none"></div>
        </div>
        {#each districts_data as district }
            <div class="mb-8 last:mb-0 flex flex-col md:flex-row md:justify-between md:items-center md:gap-16">
                <h4 class="md:basis-1/6 md:flex-none">
                    {district[0]}
                </h4>
                <div class="md:basis-5/12 md:flex-none">
                    <CumulativeDataTable data={historical_data?.districts[district[0]].dates} style="minimal" />
                </div>
                <div class="md:basis-5/12">
                    <FireCountChart data={district[1].dates} height=200 />
                </div>
            </div>
        {/each}
    {/if}
</div>
