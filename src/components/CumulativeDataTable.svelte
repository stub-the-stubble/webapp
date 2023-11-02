<script>
    import { parse, getWeek, getMonth } from 'date-fns';
    import { fade } from 'svelte/transition';

    // Get data as a prop
    export let data, data_status;

    let fc_today = 0,
        fc_yesterday = 0,
        fc_all = 0,
        fc_this_month = 0,
        fc_this_week = 0;

    const today = new Date();
    const this_week = getWeek(today, { weekStartsOn: 1 });
    const this_month = getMonth(today);

    $: if (data) {
        // Get today and yesterday's total fire count
        fc_yesterday = data.counts[data.counts.length - 2].count;
        fc_today = data.counts[data.counts.length - 1].count;

        // Calculate fire counts for this week, this month and for all season
        fc_this_week = 0;
        fc_this_month = 0;
        fc_all = 0;

        for (const { date, count } of data.counts) {
            const parsed_date = parse(date, 'yyyy-MM-dd', new Date());
            const month = getMonth(parsed_date);
            const week = getWeek(parsed_date, { weekStartsOn: 1 });

            if (month == this_month) {
                fc_this_month += count;
            }
            if (week == this_week) {
                fc_this_week += count;
            }
            fc_all += count;
            //console.log(date, month, week, count);
        }
    }
</script>

<table class="w-full border-separate text-center">
    <caption class="caption-top text-sm xs:text-base text-left xs:text-center mb-2">
        <span class="inline-block">Detected fire data for this Kharif season</span>
        <span class="inline-block">(15th September 2023 onwards)</span>
    </caption>
    <thead>
        <tr class="h-12 text-sm xs:text-base">
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Today</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Yesterday</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">This week</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">This month</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Season till date</th>
        </tr>
    </thead>
    <tbody>
        <tr class="h-12">
            <td class="bg-brand-light-grey px-2">
                {#if data_status.numbers == 'loaded'}
                    <span in:fade>{fc_today}</span>
                {/if}
            </td>
            <td class="bg-brand-light-grey px-2">
                {#if data_status.numbers == 'loaded'}
                    <span in:fade>{fc_yesterday}</span>
                {/if}
            </td>
            <td class="bg-brand-light-grey px-2">
                {#if data_status.numbers == 'loaded'}
                    <span in:fade>{fc_this_week}</span>
                {/if}
            </td>
            <td class="bg-brand-light-grey px-2">
                {#if data_status.numbers == 'loaded'}
                    <span in:fade>{fc_this_month}</span>
                {/if}
            </td>
            <td class="bg-brand-light-grey px-2">
                {#if data_status.numbers == 'loaded'}
                    <span in:fade>{fc_all}</span>
                {/if}
            </td>
        </tr>
    </tbody>
</table>
<p class="mt-2 italic text-xs text-left xs:text-right text-brand-grey">
    *New data is added to the system as soon as it is available to us. Last updated at {#if data}
        <span in:fade>{data.last_update}</span>.
    {/if}
</p>
