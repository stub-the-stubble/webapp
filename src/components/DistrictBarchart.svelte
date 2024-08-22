<script>
    import { scaleBand, scaleLinear } from 'd3-scale';
    import { highlightedDate, hoverOut, isRangeMode } from '../stores';



    export let totals_list, district_breakups_list;

    let xDomain, xScale, yScale, total_count, districts_data, districts_data_tuple, districts_data_filtered;
    const dimns = { width: 800, height: 300, label_x: 220, gap_x: 10 };

    $: {
        if (district_breakups_list && totals_list) {
            updateGraphData();
        }
    }

    $: if ($hoverOut === false && $highlightedDate) {
        updateGraphData();
    }

    $: if ($hoverOut === true) {
        updateGraphData();
    }

    function updateGraphData() {
        if ($hoverOut) {
            if ($isRangeMode) {
                getRangeData();
            } else {
                getSingleDateData();
            }
        } else {
            getSingleDateData();
        }

        updateGraph();
    }

    function getRangeData() {
        let combined = {};
        let ks = Object.keys(district_breakups_list);
        ks.forEach((k) => {
            let ds = Object.keys(district_breakups_list[k]);
            ds.forEach((d) => {
                if (combined[d] !== undefined) combined[d] += district_breakups_list[k][d];
                else combined[d] = 0;
            });
        });
        districts_data_tuple = Object.entries(combined);
        districts_data_tuple.sort((a, b) => b[1] - a[1]);
        districts_data_filtered = districts_data_tuple.slice(0, 5);
        total_count = Object.values(totals_list).reduce((acc, value) => acc + value, 0);
    }

    function getSingleDateData() {
        if (!district_breakups_list && !totals_list) return;

        total_count = totals_list[$highlightedDate];
        districts_data = district_breakups_list[$highlightedDate];

        if (districts_data) {
            districts_data_tuple = Object.entries(districts_data);
            districts_data_tuple.sort((a, b) => b[1] - a[1]);
            districts_data_filtered = districts_data_tuple.slice(0, 5);
        }
    }

    function updateGraph() {
        if (total_count > 0) {
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
    }
</script>



    <svg class="w-full h-auto fill-black" viewBox={`0 0 ${dimns.width} ${dimns.height}`}>
        {#if total_count > 0}
            <g class="fill-red">
                {#each districts_data_filtered as d}
                    <text
                        text-anchor="start"
                        class={d[1] == 0 ? 'invisible' : 'text-3xl sm:text-xl fill-dark-grey stroke-none'}
                        x="0"
                        dy="0.32em"
                        y={yScale(d[0]) + yScale.bandwidth() / 2}
                    >
                        {d[0]}
                    </text>
                    <rect
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
                            y={yScale(d[0]) + yScale.bandwidth() / 2}
                        >
                            0
                        </text>
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
        {:else}
            <text
                class="fill-dark-grey stroke-none text-4xl sm:text-2xl"
                text-anchor="start"
                y="2ex"
            >
                No fires for the duration selected.
            </text>
        {/if}
    </svg>
