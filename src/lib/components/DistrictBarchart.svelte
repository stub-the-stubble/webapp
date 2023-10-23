<script>
    import { scaleBand, scaleLinear } from 'd3-scale';
    import { slide } from 'svelte/transition';
    import { onMount } from 'svelte';
    import district_names_list from '$lib/data/district_names_list.json';


    export let data_array;

    let width = 800;
    let height = 1000;

    const xDomain = data_array.map((d) => d[1]);

    // Prevent domain collapsing to midpoint if all values are zero
    if (Math.max(...xDomain) == 0) {
        xDomain.push(1)
    }
    const yScale = scaleBand().domain(district_names_list).range([0, height]).paddingInner(0.5);
    const xScale = scaleLinear()
        .domain([0, Math.max.apply(null, xDomain)])
        .range([0, width - 150]);

    let show = false;

    onMount(() => {
        show = true;
    });
</script>

<div class=" basis-1/2">
    <svg class="w-full h-auto overflow-visible fill-brand-black" viewBox={`0 0 ${width} ${height}`}>
        <g class="fill-brand-black">
            {#each data_array as d, i}
                <text
                    text-anchor="end"
                    x="130"
                    dy="0.32em"
                    y={yScale(d[0]) + yScale.bandwidth() / 2}
                >
                    {d[0]}
                </text>
                {#if show}
                    <rect
                        in:slide={{ duration: 1000, axis: 'x' }}
                        x={150}
                        y={yScale(d[0])}
                        width={xScale(d[1])}
                        height={yScale.bandwidth()}
                    />
                {/if}
                {#if d[1] == 0}
                    <text
                        text-anchor="end"
                        x={xScale(d[1]) + 160}
                        dy="0.32em"
                        y={yScale(d[0]) + yScale.bandwidth() / 2}>0</text
                    >
                {:else}
                    <text
                        class="fill-brand-lightest-grey"
                        text-anchor="end"
                        x={xScale(d[1]) + 145}
                        dy="0.32em"
                        y={yScale(d[0]) + yScale.bandwidth() / 2}
                    >
                        {d[1]}
                    </text>
                {/if}
            {/each}
        </g>
    </svg>
</div>
