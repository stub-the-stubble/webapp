<script>
    import { scaleLinear, scaleTime } from 'd3-scale';
    import { axisLeft, axisBottom } from 'd3-axis';
    import { line, curveMonotoneX } from 'd3-shape';
    import { max, extent } from 'd3-array';
    import { select } from 'd3-selection';
    
    export let data;
    
    let svg;
    const dimensions = {
        width: 600,
        height: 300,
        marginLeft: 40,
        marginRight: 40,
        marginTop: 10,
        marginBottom: 30,
    };
    
    $: if (data) {
        data = Object.keys(data).map((key) => [key, data[key]]);
        let data_filtered = data.slice(data.length - 30)
            .map((data) => [new Date(data[0]).setHours(0, 0, 0, 0), data[1]]);
        
        // Select the svg element
        let svgSelection = select(svg);
        
        let xScale = scaleTime()
            .domain(extent(data_filtered, (d) => new Date(d[0]))).nice()
            .range([dimensions.marginLeft, dimensions.width - dimensions.marginRight]);
        let yScale = scaleLinear()
            .domain([0, max(data_filtered, (d) => d[1])]).nice()
            .range([dimensions.height - dimensions.marginBottom, dimensions.marginTop]);
            
        // Add the x-axis and labels
        svgSelection.append('g')
            .attr('transform', `translate(0, ${dimensions.height - dimensions.marginBottom})`)
            .call(axisBottom(xScale).tickSizeOuter(0));
        // Add the y-axis and labels
        svgSelection.append('g')
            .attr('transform', `translate(${dimensions.marginLeft}, 0)`)
            .call(axisLeft(yScale).tickSizeOuter(0));
            
        svgSelection.selectAll('circle')
            .data(data_filtered)
            .join(
                (enter) => {
                    return enter.append('circle')
                        .attr('class', 'fill-red')
                        .attr('r', 3)
                        .attr('cx', (d) => xScale(new Date(d[0])))
                        .attr('cy', (d) => yScale(d[1]))
                }
            );
            
            svgSelection.selectAll('.stem')
            .data(data_filtered)
            .join(
                (enter) => {
                    return enter.append('line')
                        .attr('class', 'stem stroke-red')
                        .attr('stroke-width', 3)
                        .attr('x1', (d) => xScale(new Date(d[0])))
                        .attr('y1', (d) => yScale(d[1]))
                        .attr('x2', (d) => xScale(new Date(d[0])))
                        .attr('y2', (d) => yScale(0))
                }
            );
    }
</script>



<svg class="w-full h-auto fill-black" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} bind:this={svg}>
</svg>