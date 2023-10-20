<script>
    export let cumulative_numbers;
</script>

<table class="w-full border-separate text-center">
    <caption class="caption-top mb-2">
        Detected fire data for the season ( 15th September onwards )
    </caption>
    <thead>
        <tr class="h-12">
            <th class="bg-brand-light-grey px-4 font-semibold w-1/4">Today</th>
            <th class="bg-brand-light-grey px-4 font-semibold w-1/4">Last week</th>
            <th class="bg-brand-light-grey px-4 font-semibold w-1/4">Last month</th>
            <th class="bg-brand-light-grey px-4 font-semibold w-1/4">Season till date</th>
        </tr>
    </thead>
    <tbody>
        <tr class="h-12">
            <td class="bg-brand-light-grey px-4">{cumulative_numbers[0]}</td>
            <td class="bg-brand-light-grey px-4">{cumulative_numbers[1]}</td>
            <td class="bg-brand-light-grey px-4">{cumulative_numbers[2]}</td>
            <td class="bg-brand-light-grey px-4">{cumulative_numbers[3]}</td>
        </tr>
    </tbody>
</table>
