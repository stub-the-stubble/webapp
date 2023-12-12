<script>
    import { CumulativeDataTable, FireCountChart } from '$components';
    import { fires_data } from '../stores/fires_data.js';



    export let state_code, historical_data, districts_data;
    export const periods = [
        'Today',
        'Yesterday',
        'This week',
        'This month',
        'This season',
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
        <div class="flex justify-between items-center gap-4 border-b border-dashed border-lightish-grey">
            <div class="basis-1/6 flex-none"></div>
            <table class="hidden md:table basis-2/5 flex-none border-separate table-fixed">
                <thead>
                    <tr class="flex">
                        {#each periods as period}
                            <th class="basis-1/5 w-1/5 flex-none flex justify-center items-center px-2 py-4 text-center capitalize border-l last:border-r border-dashed border-lightish-grey">
                                <span class="font-normal break-words">
                                    {period}
                                </span>
                            </th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                    </tr>
                </tbody>
            </table>
            <div class="basis-2/5 flex-none"></div>
        </div>
        {#each districts_data as district }
            <div class="flex flex-col md:flex-row md:justify-between md:gap-4 border-b last:border-none border-dashed border-lightish-grey">
                <h4 class="md:basis-1/6 md:flex-none">
                    {district[0]}
                </h4>
                <div class="md:basis-2/5 md:flex-none">
                    <CumulativeDataTable data={historical_data?.districts[district[0]].dates} style="minimal" />
                </div>
                <div class="md:basis-2/5 md:flex-none pt-4 pb-2">
                    <FireCountChart data={district[1].dates} height=200 />
                </div>
            </div>
        {/each}
    {/if}
</div>
