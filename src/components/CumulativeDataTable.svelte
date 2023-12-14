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
            table: 'w-full text-sm xs:text-base text-center',
            thead: 'flex h-12 border-b-2 border-lightest-grey',
            thead_th: 'w-1/5 flex-none flex justify-center items-center px-1 py-1 bg-light-grey font-semibold capitalize border-r-2 last:border-r-0 border-lightest-grey',
            tbody: 'flex h-12',
            tbody_td: 'w-1/5 flex-none flex justify-center items-center px-1 py-1 bg-light-grey font-semibold capitalize border-r-2 last:border-r-0 border-lightest-grey',
        },
        minimal: {
            table: 'w-full md:h-full text-sm xs:text-base text-center',
            thead: 'md:sr-only flex h-12',
            thead_th: 'w-1/5 flex justify-center items-center font-normal border border-dashed border-lightish-grey capitalize',
            tbody: 'flex h-10 md:h-full',
            tbody_td: 'w-1/5 md:flex-none flex justify-center items-center md:h-full px-1 md:py-2 text-center capitalize border-l last:border-r border-b md:border-b-0 border-dashed border-lightish-grey',
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



<div class={styleClasses[style].table}>
    <div class={styleClasses[style].thead}>
            {#each periods as period}
                <div class={styleClasses[style].thead_th}>
                    {period}
                </div>
            {/each}
    </div>
    <div class={styleClasses[style].tbody}>
            <div class={styleClasses[style].tbody_td}>
                {#if data}
                    <span in:fade>{fc_today}</span>
                {/if}
            </div>
            <div class={styleClasses[style].tbody_td}>
                {#if data}
                    <span in:fade>{fc_yesterday}</span>
                {/if}
            </div>
            <div class={styleClasses[style].tbody_td}>
                {#if data}
                    <span in:fade>{fc_this_week}</span>
                {/if}
            </div>
            <div class={styleClasses[style].tbody_td}>
                {#if data}
                    <span in:fade>{fc_this_month}</span>
                {/if}
            </div>
            <div class={styleClasses[style].tbody_td}>
                {#if data}
                    <span in:fade>{fc_all}</span>
                {/if}
            </div>
    </div>
</div>
{#if layout != 'narrow' && last_updated}
    <p class="mt-2 italic text-xs text-left xs:text-right text-grey">
        * The current Kharif season started on 15th September 2023. New data is added to the system as soon as it is available to us. Last updated at {#if last_updated}
            <span in:fade>{last_updated}</span>.
        {/if}
    </p>
{/if}
