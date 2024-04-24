<script>
    import { onMount } from 'svelte';
    import { scaleLinear, scaleTime } from 'd3-scale';
    import { axisRight, axisBottom } from 'd3-axis';
    import { max, extent, bisector } from 'd3-array';
    import { timeMonday } from 'd3-time';
    import { timeFormat } from 'd3-time-format';
    import { format } from 'd3-format';
    import { select, pointer } from 'd3-selection';
    import { highlightedDate, endDate, startDate, rangeMode } from '../stores.js';
    import {get_filtered_data} from '$lib/utils'
    import { addDays, differenceInDays, isBefore, startOfDay, startOfToday } from 'date-fns';

    export let data,
        height = 300;

    let svg,
        svgSelection,
        highlightedCount,
        data_filtered,
        data_filtered_object;
    let xScale, yMax, yScale;
    let dimensions = {
        width: 600,
        height: height,
        marginLeft: 15,
        marginRight: 36,
        marginTop: 10,
        marginBottom: 30,
    };

    //console.log('component load');

    onMount(() => {

        // svg dom element is only available after mount
        svgSelection = select(svg);
        addEventListeners();

        // we already have data, show it
        updateGraph(data_filtered);
        updateHighlightedDate($highlightedDate)
    });

    $: {
        //This data block will run whenever any of the variables present here change (like startdate, end date, rangemode etc)

        if (data) {
            //console.log('reactive data block');
            let data_tuple = Object.entries(data);
            data_filtered = get_filtered_data(data_tuple,$rangeMode, $endDate, $startDate)
            data_filtered_object = Object.fromEntries(data_filtered);
        }
    }

    $: {
        // when data_filtered changes, we update the graph and its axes accordingly
        if (data_filtered) {
            updateGraph(data_filtered);
            //console.log('data_filtered changed', data_filtered);
        }
    }

    $: {
        // this block will run whenever highlighted date or data_filtered changes
        if ($highlightedDate && data_filtered) {
            updateHighlightedDate($highlightedDate);
        }
    }

    /*function findMissingDates(a) {

        const sd = startOfDay(new Date(2021,8,3))
        let c = 0
        for(let nd =sd; isBefore(nd,startOfToday()); ) {
            nd = addDays(nd,1)
            let s = timeFormat("%Y-%m-%d")(nd)

            if(isNaN(data[s])) {
                console.log(s)
                c++;
            }
            
        }
        console.log(c)
    }*/

    function updateHighlightedDate(highlightedDate) {
        if (!svgSelection) return;

        // Set default highlighted date if not already set
        // Don't assume that the latest date will be today's date eg. in case API fails
        //if (isNaN(highlightedDate)) {
        //    highlightedDate = data_filtered[data_filtered.length - 1][0];
        //}
        highlightedCount = data_filtered_object[highlightedDate];

        // Highlight circle on bar corresponding to highlighted date
        const r = getRange()
        let s = r > 360 ? 1 : r > 180 ? 2 : r > 90 ? 3 : 4
        svgSelection.selectAll('circle').attr('r', (d) => (d[0] === highlightedDate ? 6 : s));
    }

    function updateGraph(data_filtered) {
        if (!svgSelection) return;
        svgSelection.selectAll("*").remove();

        const range = getRange()
        const stroke  = range > 360 ? 1 : range > 180 ? 2 : range > 90 ? 3 : 6
        xScale = scaleTime()
            .domain(extent(data_filtered, (d) => new Date(d[0])))
            .range([dimensions.marginLeft, dimensions.width - dimensions.marginRight]);

        yMax = max(data_filtered, (d) => d[1]);
        // Prevent 0 tick to show up in the middle of y axis and add two extra ticks if all values are zero
        yScale = scaleLinear()
            .domain([0, yMax + Math.max(Math.ceil(0.4 * yMax), 2)])
            .nice()
            .range([dimensions.height - dimensions.marginBottom, dimensions.marginTop]);

        svgSelection
            .selectAll('circle')
            .data(data_filtered)
            .join((enter) => {
                return enter
                    .append('circle')
                    .attr('class', 'fill-red')
                    .attr('r', 3)
                    .attr('cx', (d) => xScale(new Date(d[0])))
                    .attr('cy', (d) => yScale(d[1]));
            });

        svgSelection
            .selectAll('.stem')
            .data(data_filtered)
            .join((enter) => {
                return enter
                    .append('line')
                    .attr('class', 'stem stroke-red/50')
                    .attr('stroke-width', stroke)
                    .attr('x1', (d) => xScale(new Date(d[0])))
                    .attr('y1', (d) => yScale(d[1]))
                    .attr('x2', (d) => xScale(new Date(d[0])))
                    .attr('y2', (d) => yScale(0));
            });


        // Add the x-axis and labels
        svgSelection
            .append('g')
            .attr('transform', `translate(0, ${dimensions.height - dimensions.marginBottom})`)
            .attr('data-part', 'axis')
            .call(
                axisBottom(xScale)
                    .tickSizeOuter(0)
                    .ticks(5)
            );
        // Add the y-axis and labels
        svgSelection
            .append('g')
            .attr('transform', `translate(${dimensions.width - dimensions.marginRight}, 0)`)
            .attr('data-part', 'axis')
            .call(axisRight(yScale).tickSizeOuter(0).ticks(5).tickFormat(format('.0f')))
            .selectAll('.tick')
            .filter((d) => !Number.isInteger(d))
            .attr('class', 'hidden');
    }

    function addEventListeners() {
        //console.log('added events');
        //console.log(svgSelection);
        svgSelection
            .on('mousemove', handleMouseMove)
            .on('touchmove', (e) => handleMouseMove(e.touches[0]))
            .on('mouseout', handleMouseOut)
            .on('touchend', handleMouseOut);
    }

    // Mouse event handlers
    function handleMouseMove(e) {
        const xMousePos = pointer(e)[0];
        const barDate = xScale.invert(xMousePos);
        if (!isNaN(barDate)) {
            const barIndex = bisector((d) => d[0]).left(data_filtered, barDate, 1, getRange());
            const barDateLeft = data_filtered[barIndex - 1][0];
            const barDateRight = data_filtered[barIndex][0];
            const highlightedBarIndex =
                barDateRight - barDate > barDate - barDateLeft ? barIndex - 1 : barIndex;
            $highlightedDate = data_filtered[highlightedBarIndex][0];
        }
    }

    function handleMouseOut(e) {
            $highlightedDate = $endDate || $startDate;
    }

    function getRange() {
        return $rangeMode ? differenceInDays($endDate,$startDate) : 29
    }

</script>

<div class="relative">
    <div class="md:absolute top-0 left-0">
        <h4 class="text-xs text-grey">
            {timeFormat('%d %B %G')($highlightedDate)}
        </h4>
        <h5 class="text-xl text-red font-semibold">
            {highlightedCount}
        </h5>
    </div>
    <svg
        class="w-full h-auto fill-black"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        bind:this={svg}
    />
</div>
