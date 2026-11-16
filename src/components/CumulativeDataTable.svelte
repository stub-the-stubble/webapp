<script>
    import { startOfDay, startOfMonth, subDays } from 'date-fns';
    import { getDateIST, periodTotal } from '$lib/utils';
    import { fade } from 'svelte/transition';
    import { getMonitoringSeason } from '$lib/utils/season.js';

    // Get data as a prop
    export let data,
        last_updated = undefined,
        layout,
        style;
    const season = getMonitoringSeason(getDateIST());
    const periods = ['Today', 'Yesterday', 'This month', season.label];
    export const styleClasses = {
        default: {
            table: 'w-full text-sm xs:text-base text-center',
            thead: 'flex h-12 border-b-2 border-lightest-grey',
            thead_th:
                'w-1/4 flex-none flex justify-center items-center p-1 bg-light-grey font-semibold capitalize border-r-2 last:border-r-0 border-lightest-grey',
            tbody: 'flex h-12',
            tbody_td:
                'w-1/4 flex-none flex justify-center items-center p-1 bg-light-grey font-semibold capitalize border-r-2 last:border-r-0 border-lightest-grey',
        },
        minimal: {
            table: 'w-full md:h-full text-sm xs:text-base text-center',
            thead: 'md:sr-only flex h-12',
            thead_th:
                'w-1/4 flex justify-center items-center p-1 font-normal border border-dashed border-lightish-grey capitalize',
            tbody: 'flex h-10 md:h-full',
            tbody_td:
                'w-1/4 md:flex-none flex justify-center items-center md:h-full p-1 md:py-2 text-center capitalize border-l last:border-r border-b md:border-b-0 border-dashed border-lightish-grey',
        },
    };

    const today = startOfDay(getDateIST());
    $: layout = layout ?? 'default';
    $: style = style ?? 'default';
    $: fc_today = periodTotal(data, today);
    $: fc_yesterday = periodTotal(data, subDays(today, 1));
    $: fc_this_month = periodTotal(data, startOfMonth(today), today);
    // Require every elapsed season day; missing observations must not become zero.
    $: fc_all = periodTotal(data, season.start, season.through);
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
            <span class="max-w-full break-words text-xs xs:text-base" in:fade
                >{fc_today ?? 'Unavailable'}</span
            >
        </div>
        <div class={styleClasses[style].tbody_td}>
            <span class="max-w-full break-words text-xs xs:text-base" in:fade
                >{fc_yesterday ?? 'Unavailable'}</span
            >
        </div>
        <div class={styleClasses[style].tbody_td}>
            <span class="max-w-full break-words text-xs xs:text-base" in:fade
                >{fc_this_month ?? 'Unavailable'}</span
            >
        </div>
        <div class={styleClasses[style].tbody_td}>
            <span class="max-w-full break-words text-xs xs:text-base" in:fade
                >{fc_all ?? 'Unavailable'}</span
            >
        </div>
    </div>
</div>
{#if style !== 'minimal'}
    <p class="mt-2 text-sm text-grey">
        Summary totals use today's IST date, independently of the chart date selection.
        {season.description} Totals are unavailable when days are missing.
    </p>
{/if}
{#if layout != 'narrow' && last_updated}
    <p class="mt-2 italic text-xs text-left xs:text-right text-grey">
        Last published update {#if last_updated}
            <span in:fade>{last_updated}</span>.
        {/if}
    </p>
{/if}
