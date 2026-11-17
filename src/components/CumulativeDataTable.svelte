<script>
    import { endDate, startDate, isRangeMode } from '../stores.js';
    import { summaryPeriods } from '$lib/utils/dashboardSummary.js';
    export let data,
        loading = false,
        style = 'default';
    $: periods = summaryPeriods(data, $isRangeMode ? $endDate : $startDate);
    $: cells = periods.length
        ? periods
        : ['Day', 'Previous day', 'Month', 'Season'].map((label) => ({ label, value: null }));
</script>

<div
    class="grid grid-cols-4 w-full text-center {style === 'minimal'
        ? 'h-full text-sm'
        : 'bg-light-grey text-sm xs:text-base'}"
    aria-busy={loading}
>
    {#each cells as cell}
        <div class="min-w-0 border-r border-lightest-grey last:border-r-0">
            <div
                class="px-1 py-3 font-medium {style === 'minimal'
                    ? 'md:sr-only'
                    : 'border-b border-lightest-grey'}"
            >
                {cell.label}
            </div>
            <div
                class="px-1 py-3 font-semibold tabular-nums"
                title={loading
                    ? 'Loading data'
                    : cell.value === null
                    ? 'Not reported for this period'
                    : undefined}
            >
                {#if loading}<span class="animate-pulse" aria-label="Loading data">…</span>
                {:else if cell.value === null}<span aria-label="Not reported">—</span>
                {:else}{cell.value.toLocaleString()}{/if}
            </div>
        </div>
    {/each}
</div>
