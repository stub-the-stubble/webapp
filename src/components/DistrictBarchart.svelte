<script>
    import { scaleBand, scaleLinear } from 'd3-scale';
    import { slide } from 'svelte/transition';
    import { getContext } from 'svelte';

    import district_names_list from '$lib/data/district_names_list.json';

    export let data_array;
    const data_state = getContext('state');

    let xDomain, xScale;

    const dimns = { width: 800, height: 1000, label_x: 200, gap_x: 15 };

    const yScale = scaleBand()
        .domain(district_names_list)
        .range([0, dimns.height])
        .paddingInner(0.5);

    $: if (data_array) {
        xDomain = data_array.map((d) => d[1]);

        // Prevent domain collapsing to midpoint if all values are zero
        if (Math.max(...xDomain) == 0) {
            xDomain.push(1);
        }
        xScale = scaleLinear()
            .domain([0, Math.max.apply(null, xDomain)])
            .range([0, dimns.width - dimns.label_x - dimns.gap_x]);
    }
</script>

<svg class="w-full h-auto fill-brand-black" viewBox={`0 0 ${dimns.width} ${dimns.height}`}>
    {#if $data_state.locations == 'loaded'}
        <g class="fill-brand-black">
            {#each data_array as d, i}
                <text
                    text-anchor="end"
                    class="text-xl"
                    x={dimns.label_x}
                    dy="0.32em"
                    y={yScale(d[0]) + yScale.bandwidth() / 2}
                >
                    {d[0]}
                </text>
                <rect
                    in:slide={{ delay: 800, axis: 'x' }}
                    x={dimns.label_x + dimns.gap_x}
                    y={yScale(d[0])}
                    width={xScale(d[1])}
                    height={yScale.bandwidth()}
                />
                {#if d[1] == 0}
                    <text
                        class="text-xl"
                        text-anchor="start"
                        x={xScale(d[1]) + dimns.label_x + dimns.gap_x}
                        dy="0.32em"
                        y={yScale(d[0]) + yScale.bandwidth() / 2}>0</text
                    >
                {:else}
                    <text
                        class="fill-brand-lightest-grey text-xl"
                        text-anchor="end"
                        x={dimns.label_x + dimns.gap_x + xScale(d[1]) - 3}
                        dy="0.32em"
                        y={yScale(d[0]) + yScale.bandwidth() / 2}
                    >
                        {d[1]}
                    </text>
                {/if}
            {/each}
        </g>
    {/if}
</svg>
