<script>
    import Brush from './Brush.svelte';
    import { scaleTime } from 'd3-scale';
    import { timeFormat } from 'd3-time-format';
    import { getDateISO } from '$lib/utils';
    import { startDate, endDate } from '../../stores.js';

    let start, end, w;
    const timeScale = scaleTime().domain([new Date('2020,8,1'), new Date(getDateISO())]);

    const formatDate = timeFormat('%Y-%m-%d');
    const timeTicks = timeScale.ticks(5);
    const f = timeScale.tickFormat();

    $: $startDate = formatDate(timeScale.invert(start));
    $: $endDate = formatDate(timeScale.invert(end));
</script>

<div class="w-full h-10 bg-light-grey" bind:clientWidth={w}>
    <Brush bind:min={start} bind:max={end} />
    <svg class="w-full h-full" >
        {#each timeTicks as x}
            <g transform="translate({timeScale(x) * w},0)">
                <line class="stroke-black" y2="6" />
                <text class="text-xs" text-anchor="middle" y="9" dy="0.71em">
                    {f(x)}
                </text>
            </g>
        {/each}
    </svg>
</div>
