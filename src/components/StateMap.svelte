<script>
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { draw } from 'svelte/transition';
    import { scaleSequential } from 'd3-scale';
    import { interpolateReds } from 'd3-scale-chromatic';
    import { map_paths } from '$lib/data/map_paths';
    import { states } from '$lib/data/site_info.js';
    import { highlightedDate } from '../stores';
    import { simpleKebab } from '../lib/utils/stringHelpers.js'



    export let state, totals_list, district_breakups_list;

    let state_map, total, district_breakup, district_name, district_count, initialHighlightedDate, initialCount;
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
        district_count = total;
    }

    function handleClick(e) {
        let districtEl = e.target;
        let district_name = districtEl.dataset.district;
        let fragmentDistrictEl = document.getElementById(simpleKebab(district_name));
        let toggleClass = 'bg-light-orange';

        if (fragmentDistrictEl) {
            fragmentDistrictEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the distrct's row momentarily
            fragmentDistrictEl.classList.add(toggleClass);
            setTimeout(() => {
                fragmentDistrictEl.classList.remove(toggleClass);
            }, 800);
        }
    }

    onMount(() => {
        // Store initial highlighted data
        if (!isNaN($highlightedDate)) {
            initialHighlightedDate = $highlightedDate;
            initialCount = totals_list[initialHighlightedDate];
            district_breakup = district_breakups_list[initialHighlightedDate];
        }
    });

    $: if (totals_list && district_breakup) {
        total = totals_list[$highlightedDate];
        district_count = district_count ?? total;
        district_name = district_name ?? states[state].name.toUpperCase();

        // Show total for highlighted date when mouse hovered over the past fire count chart
        if (browser) {
            if (state_map && !state_map.matches(':hover')) {
                if (initialHighlightedDate !== $highlightedDate) {
                    district_count = total;
                } else {
                    district_count = initialCount;
                }
            }
        }
    }
</script>



<div class="w-full h-full">
    {#if !isNaN(district_count)}
        <div class="absolute top-0 left-0">
            <h4 class="text-sm text-grey">
                {district_name}
            </h4>
            <h5 class="text-xl text-red font-semibold">
                {district_count}
            </h5>
        </div>
    {/if}
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <svg xmlns="http://www.w3.org/2000/svg" bind:this={state_map} class="w-full h-full stroke-black" viewBox={bbox} on:mouseout={handleMouseOut} role="presentation">
        {#if district_breakup}
            <g>
                {#each Object.entries(district_breakup) as [district, count]}
                    <path
                        on:mousemove={handleMouseMove}
                        on:click={handleClick}
                        class="hover:fill-brown transition-colors duration-150"
                        fill={color_scale(count)}
                        in:draw|global={{ duration: 1000, delay: 800 }}
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
