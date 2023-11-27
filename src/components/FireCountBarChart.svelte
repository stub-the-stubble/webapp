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
        marginTop: 30,
        marginBottom: 30,
    };
    
    $: if (data) {
        data = Object.keys(data).map((key) => [key, data[key]]);
        let data_filtered = data.slice(data.length - 12).map((data) => [new Date(data[0]).setHours(0, 0, 0, 0), data[1]]);
        
        // Select the svg element
        let svgSelection = select(svg);
        
        let xScale = scaleTime()
            .domain(extent(data_filtered, (d) => new Date(d[0]))).nice()
            .range([dimensions.marginLeft, dimensions.width - dimensions.marginRight]);
        
        let yScale = scaleLinear()
            .domain([0, max(data_filtered, (d) => d[1])]).nice()
            .range([dimensions.height - dimensions.marginBottom, dimensions.marginTop]);
            
        // Create the line generator
        const linePath = line()
            .curve(curveMonotoneX)
            .x((d, i, data) => {
                console.log('x', d[0], ' - ', i, '-', data);
                return xScale(new Date(d[0]))
            })
            .y((d, i, data) => {
                console.log('y', d[1], ' - ', i, '-', data);
                return yScale(d[1])
            });
            
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
                        .attr('fill', 'red')
                        .attr('r', 3)
                        .attr('cx', (d) => xScale(new Date(d[0])))
                        .attr('cy', (d) => yScale(d[1]))
                }
            );
    }
</script>



<svg class="w-full h-auto fill-black" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} bind:this={svg}>
</svg>