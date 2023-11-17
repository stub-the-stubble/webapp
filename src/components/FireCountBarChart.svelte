<script>
    import { scaleLinear, scaleTime, scaleBand } from 'd3-scale';
    import { axisLeft, axisBottom } from 'd3-axis';
    import { max, extent } from 'd3-array';
    import { select } from 'd3-selection';
    
    export let data;
    
    let svg;
    const dimensions = {
        width: 1200,
        height: 600,
        marginLeft: 40,
        marginRight: 40,
        marginTop: 30,
        marginBottom: 30,
    };
    
    $: if (data) {
        data = Object.keys(data).map((key) => [key, data[key]]);
        // console.log(data);
        
        let data_filtered = data.slice(data.length - 5);
        
        console.log(data_filtered);
        
        let xScale = scaleTime()
            .domain(extent(data_filtered, (d) => new Date(d[0])))
            .range([dimensions.marginLeft, dimensions.width - dimensions.marginRight]);
        
        let yScale = scaleLinear()
            .domain([0, max(data_filtered, (d) => d[1])])
            .range([dimensions.height - dimensions.marginBottom, dimensions.marginTop]);
            
        let xBand = scaleBand()
            .domain(data_filtered.map((d) => d[0]))
            .range([dimensions.marginLeft, dimensions.width - dimensions.marginRight])
            .paddingInner(0.1);
            
        
        // Select the svg element
        let svgSelection = select(svg);
            
        // Add the x-axis and labels
        svgSelection.append('g')
            .attr('transform', `translate(0, ${dimensions.height - dimensions.marginBottom})`)
            .call(axisBottom(xScale).tickSizeOuter(0));
    
        // Add the y-axis and labels
        svgSelection.append('g')
            .attr('transform', `translate(${dimensions.marginLeft}, 0)`)
            .call(axisLeft(yScale).tickSizeOuter(0));
            
        svgSelection.append('g')
                .attr('fill', 'steelblue')
            .selectAll()
            .data(data_filtered)
            .join('rect')
                .attr('x', (d) => xScale(new Date(d[0]) - xBand.bandwidth()/2))
                .attr('y', (d) => yScale(d[1]))
                .attr('width', (d) => xBand.bandwidth())
                .attr('height', (d) => yScale(0) - yScale(d[1]))
                .attr('data-count', (d) => d[1]);
        
    }
</script>

<svg class="w-full h-auto fill-black" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} bind:this={svg}>
</svg>