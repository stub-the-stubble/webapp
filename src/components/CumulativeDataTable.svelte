<script>
    import { parse, getWeek, getMonth, isAfter, getYear, isToday, isYesterday } from 'date-fns';
    import { getDateIST } from '$lib/utils';
    import { fade } from 'svelte/transition';

    // Get data as a prop
    export let data, last_updated;

    let fc_today = 0,
        fc_yesterday = 0,
        fc_all = 0,
        fc_this_month = 0,
        fc_this_week = 0;

    const today = getDateIST();
    const this_week = getWeek(today, { weekStartsOn: 1 });
    const this_month = getMonth(today);
    const this_year = getYear(today);

    $: if (data) {
        // Calculate fire counts for this week, this month and for all season
        fc_this_week = 0;
        fc_this_month = 0;
        fc_all = 0;
        for (const [date, count] of Object.entries(data)) {
            const parsed_date = parse(date, 'yyyy-MM-dd', today);
            const month = getMonth(parsed_date);
            const year = getYear(parsed_date);
            const week = getWeek(parsed_date, { weekStartsOn: 1 });

            if (isToday(parsed_date)) {
                fc_today = count;
            } else if (isYesterday(parsed_date)) {
                fc_yesterday = count;
            }
            if (month == this_month && year == this_year) {
                fc_this_month += count;
            }
            if (week == this_week && year == this_year) {
                fc_this_week += count;
            }
            if (isAfter(parsed_date, new Date(2023, 8, 15))) {
                fc_all += count;
            }
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
            <th class="bg-light-grey px-1 py-1 font-semibold w-1/5 capitalize">Today</th>
            <th class="bg-light-grey px-1 py-1 font-semibold w-1/5 capitalize">Yesterday</th>
            <th class="bg-light-grey px-1 py-1 font-semibold w-1/5 capitalize">This week</th>
            <th class="bg-light-grey px-1 py-1 font-semibold w-1/5 capitalize">This month</th>
            <th class="bg-light-grey px-1 py-1 font-semibold w-1/5 capitalize">Season till date</th>
        </tr>
    </thead>
    <tbody>
        <tr class="h-12">
            <td class="bg-light-grey px-2">
                {#if data}
                    <span in:fade>{fc_today}</span>
                {/if}
            </td>
            <td class="bg-light-grey px-2">
                {#if data}
                    <span in:fade>{fc_yesterday}</span>
                {/if}
            </td>
            <td class="bg-light-grey px-2">
                {#if data}
                    <span in:fade>{fc_this_week}</span>
                {/if}
            </td>
            <td class="bg-light-grey px-2">
                {#if data}
                    <span in:fade>{fc_this_month}</span>
                {/if}
            </td>
            <td class="bg-light-grey px-2">
                {#if data}
                    <span in:fade>{fc_all}</span>
                {/if}
            </td>
        </tr>
    </tbody>
</table>
<p class="mt-2 italic text-xs text-left xs:text-right text-grey">
    *New data is added to the system as soon as it is available to us. Last updated at {#if last_updated}
        <span in:fade>{last_updated}</span>.
    {/if}
</p>
