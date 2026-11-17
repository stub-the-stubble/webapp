<script>
    import { sumDistricts, isCount } from '$lib/utils/datahelpers.js';
    export let complete = true;
    import { scaleSequential } from 'd3-scale';
    import { interpolateReds } from 'd3-scale-chromatic';
    import { map_paths } from '$lib/data/map_paths';
    import { states } from '$lib/data/site_info.js';
    import { highlightedDate, isRangeMode, hoverOut } from '../stores';
    import { simpleKebab } from '../lib/utils/stringHelpers.js';

    export let state, totals_list, district_breakups_list;

    let state_map, total, district_breakup, district_name, district_count;
    const state_code = states[state].code;
    const { paths, bbox } = map_paths[state_code];
    const color_scale = scaleSequential([0, 15], interpolateReds);

    // Declare every selection dependency here: Svelte cannot see store reads
    // hidden inside a function, so a date change otherwise retains old counts.
    $: updateMap(district_breakups_list, totals_list, $isRangeMode, $hoverOut, $highlightedDate);

    function updateMap(districts, totals, rangeMode, outsideChart, date) {
        if (!districts || !totals) return;
        if (rangeMode && outsideChart) getRangeData();
        else getSingleDateData(date);
    }

    function getRangeData() {
        const combined = sumDistricts(district_breakups_list);
        district_breakup = combined;
        total = Object.values(totals_list).reduce((acc, value) => acc + value, 0);
        updateDistrictNameAndCount();
    }

    function getSingleDateData(date) {
        if (!district_breakups_list || !totals_list) return;

        district_breakup = district_breakups_list[date];
        total = totals_list[date];
        updateDistrictNameAndCount();
    }

    function updateDistrictNameAndCount() {
        district_count = total;
        district_name = states[state].name.toUpperCase();
    }

    function handleMouseMove(e) {
        let districtEl = e.target;
        district_name = districtEl.dataset.district;
        district_count =
            districtEl.dataset.fireCount === 'null' ? null : districtEl.dataset.fireCount;
    }
    function handleMouseOut() {
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
</script>

<div class="w-full">
    <div class="mb-3 min-h-[48px]">
        <h4 class="text-sm text-grey">
            {district_name ?? states[state].name.toUpperCase()}
        </h4>
        <h5 class="text-xl text-red font-semibold">
            {complete && district_count != null && isCount(Number(district_count))
                ? district_count
                : '—'}
        </h5>
    </div>
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <svg
        xmlns="http://www.w3.org/2000/svg"
        bind:this={state_map}
        class="w-full h-auto stroke-black"
        viewBox={bbox}
        preserveAspectRatio="xMidYMid meet"
        on:mouseout={handleMouseOut}
        role="presentation"
    >
        <g>
            <!-- Geography is independent of observations. Drawing only districts in
                     the response leaves a tiny fragment when coverage is incomplete. -->
            {#each Object.entries(paths) as [district, path]}
                {@const count = complete ? district_breakup?.[district] : null}
                <path
                    on:mouseenter={handleMouseMove}
                    on:click={handleClick}
                    class="hover:fill-brown transition-colors duration-150"
                    fill={isCount(count) ? color_scale(Math.log2(Math.max(count, 1))) : '#d1d5db'}
                    fill-rule="evenodd"
                    d={path}
                    role="presentation"
                    data-district={district}
                    data-fire-count={isCount(count) ? count : 'null'}
                    ><title>{district}: {isCount(count) ? count : 'Unavailable'}</title></path
                >
            {/each}
        </g>
    </svg>
</div>
