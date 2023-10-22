<script>
    import total_numbers from '$lib/data/total_numbers.json';

    export let total;

    const yesterday = total_numbers[total_numbers.length - 1];

    let week = 0,
        month = 0,
        all = 0;
    for (let i = total_numbers.length - 1, j = 0; i > 0; i--, j++) {
        if (j < 7) {
            week += total_numbers[i];
        }
        if (j < 30) {
            month += total_numbers[i];
        }
        all += total_numbers[i];
    }
</script>

<table class="w-full border-separate text-center">
    <caption class="caption-top mb-2">
        <span class="inline-block">Detected fire data for the season</span>
        <span class="inline-block">( 15th September onwards )</span>
    </caption>
    <thead>
        <tr class="h-12">
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Today</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Yesterday</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Last week</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Last month</th>
            <th class="bg-brand-light-grey px-2 font-semibold w-1/5">Season till date</th>
        </tr>
    </thead>
    <tbody>
        <tr class="h-12">
            <td class="bg-brand-light-grey px-2">{total}</td>
            <td class="bg-brand-light-grey px-2">{yesterday}</td>
            <td class="bg-brand-light-grey px-2">{week}</td>
            <td class="bg-brand-light-grey px-2">{month}</td>
            <td class="bg-brand-light-grey px-2">{all}</td>
        </tr>
    </tbody>
</table>
