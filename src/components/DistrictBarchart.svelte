<script>
    import { scaleBand, scaleLinear } from 'd3-scale';
    import { slide } from 'svelte/transition';



    export let total_count, districts_data, districts_data_filtered;

    let xDomain, xScale, yScale;
    const dimns = { width: 800, height: 300, label_x: 180, gap_x: 10 };

    $: if (total_count != 0 && districts_data) {
        districts_data.sort((a, b) => b[1] - a[1]);
        districts_data_filtered = districts_data.slice(0, 5);

        xDomain = districts_data_filtered.map((d) => d[1]);
        // Prevent domain collapsing to midpoint if all values are zero
        if (Math.max(...xDomain) == 0) {
            xDomain.push(1);
        }

        xScale = scaleLinear()
            .domain([0, Math.max.apply(null, xDomain)])
            .range([0, dimns.width - dimns.label_x - dimns.gap_x]);

        yScale = scaleBand()
            .domain(districts_data_filtered.map((d) => d[0]))
            .range([0, dimns.height])
            .paddingInner(0.5);
    }
</script>



<svg class="w-full h-auto fill-black" viewBox={`0 0 ${dimns.width} ${dimns.height}`}>
    {#if districts_data_filtered}
        <g class="fill-red">
            {#each districts_data_filtered as d}
                <text
                    text-anchor="start"
                    class={d[1] == 0 ? 'invisible' : 'text-xl fill-black'}
                    x="0"
                    dy="0.32em"
                    y={yScale(d[0]) + yScale.bandwidth() / 2}
                >
                    {d[0]}
                </text>
                <rect
                    in:slide|global={{ delay: 800, axis: 'x' }}
                    x={dimns.label_x + dimns.gap_x}
                    y={yScale(d[0])}
                    width={xScale(d[1])}
                    height={yScale.bandwidth()}
                    class={d[1] == 0 ? 'invisible' : ''}
                />
                {#if d[1] == 0}
                    <text
                        class="invisible text-xl"
                        text-anchor="start"
                        x={xScale(d[1]) + dimns.label_x + dimns.gap_x}
                        dy="0.32em"
                        y={yScale(d[0]) + yScale.bandwidth() / 2}>0</text
                    >
                {:else}
                    <text
                        class="fill-lightest-grey text-xl"
                        text-anchor="end"
                        x={dimns.label_x + dimns.gap_x + xScale(d[1]) - 8}
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
