<script>
    import { draw } from 'svelte/transition';
    import { scaleSequential } from 'd3-scale';
    import { interpolateReds } from 'd3-scale-chromatic';
    import { map_paths } from '$lib/data/map_paths';
    import { states } from '$lib/data/site_info.js';



    export let state, todays_data, district_breakup, district_name, district_count;

    const state_code = states[state].code;
    const { paths, bbox } = map_paths[state_code];
    const color_scale = scaleSequential([0, 500], interpolateReds);

    function handleMouseMove(e) {
        let districtEl = e.target;
        district_name = districtEl.dataset.district;
        district_count = districtEl.dataset.fireCount;
    }
    function handleMouseOut(e) {
        district_name = states[state].name.toUpperCase();
        district_count = todays_data.total;
    }

    $: if (todays_data) {
        district_count = district_count ?? todays_data.total;
        district_name = district_name ?? states[state].name.toUpperCase();
        district_breakup = todays_data.districts;
    }
</script>



<div class="w-full h-full">
    {#if !isNaN(district_count)}
        <div class="md:absolute top-0 left-0">
            <h4 class="text-xs text-grey">
                {district_name}
            </h4>
            <h5 class="text-xl text-red font-semibold">
                {district_count}
            </h5>
        </div>
    {/if}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full stroke-black" viewBox={bbox} on:mouseout={handleMouseOut} role="presentation">
        {#if district_breakup}
            <g>
                {#each Object.entries(district_breakup) as [district, count]}
                    <path
                        on:mousemove={handleMouseMove}
                        class="hover:fill-brown transition-colors duration-150"
                        fill={color_scale(count)}
                        transition:draw|global={{ duration: 1000, delay: 800 }}
                        d={paths[district]}
                        role="presentation"
                        data-district={district}
                        data-fire-count={count}
                    />
                {/each}
            </g>
        {/if}
    </svg>
</div>
