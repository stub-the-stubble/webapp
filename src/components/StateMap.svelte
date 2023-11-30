<script>
    import { draw } from 'svelte/transition';
    import { scaleSequential } from 'd3-scale';
    import { interpolateReds } from 'd3-scale-chromatic';
    import { map_paths } from '$lib/data/map_paths';



    export let district_counts, state_code;

    const { paths, bbox } = map_paths[state_code];
    const color_scale = scaleSequential([0, 500], interpolateReds);
</script>



<svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full stroke-black" viewBox={bbox}>
    {#if district_counts}
        <g>
            {#each Object.entries(district_counts) as [district, count]}
                <path
                    fill={color_scale(count)}
                    transition:draw|global={{ duration: 1000, delay: 800 }}
                    d={paths[district]}
                />
            {/each}
        </g>
    {/if}
</svg>
