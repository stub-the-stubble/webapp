<script>
    import { scaleLinear, scaleTime } from 'd3-scale';
    import { axisRight, axisBottom } from 'd3-axis';
    import { max, extent, bisector } from 'd3-array';
    import { timeMonday } from 'd3-time';
    import { timeFormat } from 'd3-time-format';
    import { format } from 'd3-format';
    import { select, pointer } from 'd3-selection';
    import { highlightedDate } from '../stores.js';



    export let data, height = 300, highlightedCount;

    let svg;
    let dimensions = {
        width: 600,
        height: height,
        marginLeft: 20,
        marginRight: 36,
        marginTop: 10,
        marginBottom: 30,
    };

    $: if (data) {
        let data_tuple = Object.entries(data);
        let data_filtered = data_tuple.slice(data_tuple.length - 30).map((data) => [new Date(data[0]).setHours(0, 0, 0, 0), data[1]]);
        let data_filtered_object = Object.fromEntries(data_filtered);

        // Calculate count based on highlighted date
        highlightedCount = data_filtered_object[$highlightedDate]

        // Select the svg element
        let svgSelection = select(svg);

        let xScale = scaleTime()
            .domain(extent(data_filtered, (d) => new Date(d[0])))
            .range([dimensions.marginLeft, dimensions.width - dimensions.marginRight]);
        let yMax = max(data_filtered, (d) => d[1]);
        // Prevent 0 tick to show up in the middle of y axis and add two extra ticks if all values are zero
        let yScale = scaleLinear()
            .domain([0, yMax + Math.max(Math.ceil(0.4 * yMax), 2)]).nice()
            .range([dimensions.height - dimensions.marginBottom, dimensions.marginTop]);

        // Mouse event handlers
        function handleMouseMove(e) {
            const xMousePos = pointer(e)[0];
            const barDate = xScale.invert(xMousePos);
            if (!isNaN(barDate)) {
                const barIndex = bisector((d) => d[0]).left(data_filtered, barDate, 1, 29);
                const barDateLeft = data_filtered[barIndex - 1][0];
                const barDateRight = data_filtered[barIndex][0];
                let highlightedBarIndex = (barDateRight - barDate) > (barDate - barDateLeft) ? barIndex - 1 : barIndex;
                $highlightedDate = data_filtered[highlightedBarIndex][0];
            }
        }
        function handleMouseOut(e) {
            // Highlight today's count on mouse out
            $highlightedDate = data_filtered[data_filtered.length - 1][0];
        }

        // Prevent extra axes from getting added every time the reactive block runs
        if (svg?.querySelectorAll('[data-part="axis"]').length < 2) {
            // Add the x-axis and labels
            svgSelection.append('g')
                .attr('transform', `translate(0, ${dimensions.height - dimensions.marginBottom})`)
                .attr('data-part', 'axis')
                .call(axisBottom(xScale).tickSizeOuter(0).ticks(timeMonday).tickFormat(timeFormat("%d %b")));
            // Add the y-axis and labels
            svgSelection.append('g')
                .attr('transform', `translate(${dimensions.width - dimensions.marginRight}, 0)`)
                .attr('data-part', 'axis')
                .call(axisRight(yScale).tickSizeOuter(0).ticks(5).tickFormat(format('.0f')))
                .selectAll('.tick')
                .filter((d) => !Number.isInteger(d))
                .attr('class', 'hidden');
        }

        svgSelection.selectAll('circle')
            .data(data_filtered)
            .join(
                (enter) => {
                    return enter.append('circle')
                        .attr('class', 'fill-red')
                        .attr('r', 4)
                        .attr('cx', (d) => xScale(new Date(d[0])))
                        .attr('cy', (d) => yScale(d[1]))
                }
            );

        svgSelection.selectAll('.stem')
            .data(data_filtered)
            .join(
                (enter) => {
                    return enter.append('line')
                        .attr('class', 'stem stroke-red/50')
                        .attr('stroke-width', 6)
                        .attr('x1', (d) => xScale(new Date(d[0])))
                        .attr('y1', (d) => yScale(d[1]))
                        .attr('x2', (d) => xScale(new Date(d[0])))
                        .attr('y2', (d) => yScale(0))
                }
            );

        // Prevent SVG child nodes from triggering mouse/touch based events
        svgSelection.selectAll('*').attr('pointer-events', 'none');
        svgSelection
            .on('mousemove', handleMouseMove)
            .on('touchmove', (e) => handleMouseMove(e.touches[0]))
            .on('mouseout touchend', handleMouseOut);
    }
</script>



<div class="relative">
    <div class="absolute top-0 left-3">
        <h4 class="text-xs text-grey">
            {timeFormat('%d %b')($highlightedDate)}
        </h4>
        <h5 class="text-xl text-red font-semibold">
            {highlightedCount}
        </h5>
    </div>
    <svg class="w-full h-auto fill-black" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} bind:this={svg}>
    </svg>
</div>
