<script>
    import { parse, getWeek, getMonth, isAfter, getYear, isToday, isYesterday } from 'date-fns';
    import { getDateIST } from '$lib/utils';
    import { fade } from 'svelte/transition';
    import { th } from 'date-fns/locale';

    // Get data as a prop
    export let data, last_updated, layout, style;
    export const periods = [
        'Today',
        'Yesterday',
        'This week',
        'This month',
        'This season',
    ];
    export const styleClasses = {
        default: {
            table: 'w-full border-separate text-center',
            thead: '',
            thead_tr: 'h-12 text-sm xs:text-base',
            thead_th: 'bg-light-grey px-1 py-1 font-semibold w-1/5 capitalize',
            tbody: '',
            tbody_tr: 'h-12',
            tbody_td: 'bg-light-grey px-2',
        },
        minimal: {
            table: 'w-full md:h-full text-center table-fixed',
            thead: 'md:sr-only',
            thead_tr: 'h-12 text-sm xs:text-base',
            thead_th: 'w-1/5 font-normal border border-dashed border-lightish-grey capitalize',
            tbody: 'md:h-full',
            tbody_tr: 'md:flex',
            tbody_td: 'md:basis-1/5 md:flex-none md:flex md:justify-center md:items-center h-12 md:h-full px-1 md:py-2 text-center capitalize border-l last:border-r border-b md:border-b-0 border-dashed border-lightish-grey',
        },
    };

    let fc_today = 0,
        fc_yesterday = 0,
        fc_all = 0,
        fc_this_month = 0,
        fc_this_week = 0;

    const today = getDateIST();
    const this_week = getWeek(today, { weekStartsOn: 1 });
    const this_month = getMonth(today);
    const this_year = getYear(today);

    $: {
        layout = layout ?? 'default';
        style = style ?? 'default';

        if (data) {
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
    }
</script>

<table class={styleClasses[style].table}>
    <thead class={styleClasses[style].thead}>
        <tr class={styleClasses[style].thead_tr}>
            {#each periods as period}
                <th class={styleClasses[style].thead_th}>
                    {period}
                </th>
            {/each}
        </tr>
    </thead>
    <tbody class={styleClasses[style].tbody}>
        <tr class={styleClasses[style].tbody_tr}>
            <td class={styleClasses[style].tbody_td}>
                {#if data}
                    <span in:fade>{fc_today}</span>
                {/if}
            </td>
            <td class={styleClasses[style].tbody_td}>
                {#if data}
                    <span in:fade>{fc_yesterday}</span>
                {/if}
            </td>
            <td class={styleClasses[style].tbody_td}>
                {#if data}
                    <span in:fade>{fc_this_week}</span>
                {/if}
            </td>
            <td class={styleClasses[style].tbody_td}>
                {#if data}
                    <span in:fade>{fc_this_month}</span>
                {/if}
            </td>
            <td class={styleClasses[style].tbody_td}>
                {#if data}
                    <span in:fade>{fc_all}</span>
                {/if}
            </td>
        </tr>
    </tbody>
</table>
{#if layout != 'narrow' && last_updated}
    <p class="mt-2 italic text-xs text-left xs:text-right text-grey">
        * The current Kharif season started on 15th September 2023. New data is added to the system as soon as it is available to us. Last updated at {#if last_updated}
            <span in:fade>{last_updated}</span>.
        {/if}
    </p>
{/if}
