<script>
    import total_numbers from '$lib/data/total_numbers.json';
    import { parse, getWeek, getMonth } from 'date-fns';

    // Get today total count as a prop
    export let fc_today;

    // Get yesterday's total fire count
    const fc_yesterday = total_numbers[total_numbers.length - 1].count;

    // Calculate fire counts for this week, this month and for all season
    let fc_this_week = 0,
        fc_this_month = 0,
        fc_all = 0;

    const today = new Date();
    const this_week = getWeek(today, { weekStartsOn: 1 });
    const this_month = getMonth(today);
    for (const { date, count } of total_numbers) {
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
        //console.log(date, month, week);
    }
</script>

<table class="w-full border-separate text-center">
    <caption class="caption-top text-sm xs:text-base mb-2">
        <span class="inline-block">Detected fire data for this Kharif season</span>
        <span class="inline-block">(15th September 2023 onwards)</span>
    </caption>
    <thead>
        <tr class="h-12">
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Today</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Yesterday</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">This week</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">This month</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Season till date</th>
        </tr>
    </thead>
    <tbody>
        <tr class="h-12">
            <td class="bg-brand-light-grey px-2">{fc_today}</td>
            <td class="bg-brand-light-grey px-2">{fc_yesterday}</td>
            <td class="bg-brand-light-grey px-2">{fc_this_week}</td>
            <td class="bg-brand-light-grey px-2">{fc_this_month}</td>
            <td class="bg-brand-light-grey px-2">{fc_all}</td>
        </tr>
    </tbody>
</table>
<p class="mt-2 italic text-xs text-right">
    *New data is added to the system as soon as it is available to us.<br />
    Last updated at 1:10 PM
</p>
