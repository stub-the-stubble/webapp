<script>
    import { onMount } from 'svelte';
    import { firePopupHtml } from '$lib/utils/firePresentation.js';
    import { burntAreaPeriod, BURNT_AREA_SOURCE } from '$lib/utils/burntArea.js';
    import { createBurntAreaLayer } from '$lib/utils/burntAreaLayer.js';
    import 'leaflet/dist/leaflet.css';
    import 'leaflet.markercluster/dist/MarkerCluster.css';
    import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
    import map_marker from '$lib/assets/icons/fire_map_marker.png';

    export let locations_data, state_code, center, layout;
    export let dates = [];
    let showBurntArea = false,
        burntLayer,
        boundary,
        burntLoading = false,
        burntError = false,
        burntRequest = 0;
    $: burntPeriod = burntAreaPeriod(dates);
    $: if (ready) updateBurntArea(showBurntArea, burntPeriod);

    async function updateBurntArea(enabled, period) {
        const request = ++burntRequest;
        if (burntLayer) map.removeLayer(burntLayer);
        burntLayer = null;
        burntError = false;
        burntLoading = false;
        if (!enabled || !period) return;
        burntLoading = true;
        try {
            if (!boundary) {
                const response = await fetch(`/boundaries/${state_code}.geojson`, {
                    signal: AbortSignal.timeout(15000),
                });
                if (!response.ok) throw new Error('State boundary unavailable');
                const loadedBoundary = await response.json();
                if (loadedBoundary.properties?.state !== state_code)
                    throw new Error('Wrong state boundary');
                boundary = loadedBoundary;
            }
            if (request !== burntRequest || !ready) return;
            const layer = createBurntAreaLayer(L, boundary, period);
            burntLayer = layer;
            layer.on('loading', () => {
                if (burntLayer === layer) burntLoading = true;
            });
            layer.on('load', () => {
                if (burntLayer === layer) burntLoading = false;
            });
            layer.on('tileerror', () => {
                if (burntLayer === layer) burntError = true;
            });
            layer.addTo(map);
        } catch {
            if (request === burntRequest) {
                burntError = true;
                burntLoading = false;
            }
        }
    }
    let fitted = false;
    function showAllFires() {
        if (!ready || !locations_data?.length) return;
        map.fitBounds(markers.getBounds(), { padding: [30, 30], maxZoom: 12 });
        fitted = true;
    }
    let mapElement,
        map,
        markers,
        L,
        icon,
        ready = false,
        tileError = false,
        initError = false;
    onMount(() => {
        let disposed = false,
            observer;
        async function initialize() {
            try {
                L = await import('leaflet');
                const cluster = await import('leaflet.markercluster/dist/leaflet.markercluster.js');
                if (disposed) return;
                map = L.map(mapElement, { preferCanvas: true, minZoom: 5, maxZoom: 19 });
                map.setView(center, layout === 'narrow' ? 7 : 8);
                map.createPane('burntArea');
                map.getPane('burntArea').style.zIndex = 430;
                map.getPane('burntArea').style.pointerEvents = 'none';
                // Imagery has no baked-in place names. Keep labels in a separate pane
                // above imagery and below markers so they cannot intercept clicks.
                const imagery = L.tileLayer(
                    'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    {
                        maxZoom: 19,
                        attribution:
                            'Imagery &copy; Esri, Vantor, Earthstar Geographics, GIS User Community',
                    },
                ).addTo(map);
                map.createPane('englishLabels');
                map.getPane('englishLabels').style.zIndex = 450;
                map.getPane('englishLabels').style.pointerEvents = 'none';
                const labels = L.tileLayer(
                    'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
                    {
                        pane: 'englishLabels',
                        maxNativeZoom: 18,
                        maxZoom: 19,
                        attribution:
                            'Labels &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
                    },
                ).addTo(map);
                imagery.on('tileerror', () => {
                    tileError = true;
                });
                labels.on('tileerror', () => {
                    tileError = true;
                });
                icon = L.icon({
                    iconUrl: map_marker,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                    popupAnchor: [0, -15],
                });
                // Synchronous marker updates avoid a cancelled selection's chunked
                // queue adding obsolete markers after the next selection has loaded.
                markers = new cluster.MarkerClusterGroup({ showCoverageOnHover: false });
                map.addLayer(markers);
                observer = new ResizeObserver(() => map.invalidateSize());
                observer.observe(mapElement);
                ready = true;
            } catch {
                if (!disposed) initError = true;
            }
        }
        initialize();
        return () => {
            disposed = true;
            ready = false;
            ++burntRequest;
            observer?.disconnect();
            map?.remove();
        };
    });
    $: if (ready && locations_data) {
        markers.clearLayers();
        markers.addLayers(
            locations_data.map((point) =>
                L.marker([point.lat, point.lon], { icon }).bindPopup(firePopupHtml(point)),
            ),
        );
        // Start over the observed fires, not a hard-coded centre in neighbouring
        // hills. Later filter changes preserve the user's chosen farm-level zoom.
        if (!fitted && locations_data.length) {
            showAllFires();
        }
    }
</script>

{#if initError}<p role="alert" class="mb-2 text-sm">The map could not load. Please refresh.</p>{/if}
{#if tileError}<p role="status" class="mb-2 text-sm text-grey">
        Some satellite tiles could not load.
    </p>{/if}
<div class="burnt-controls">
    <label
        ><input
            type="checkbox"
            bind:checked={showBurntArea}
            disabled={!ready || !burntPeriod}
            aria-label={`${state_code} estimated burnt area`}
        />
        Burnt area <span>(estimated)</span></label
    >
    {#if showBurntArea}
        <span class="burnt-status" role="status" aria-live="polite">
            {#if burntError}Burnt-area layer could not load.
            {:else if burntLoading}Loading burnt areas…
            {:else}<span class="burnt-key" aria-hidden="true" /> GWIS · MODIS / VIIRS{/if}
        </span>
    {/if}
</div>
{#if showBurntArea}
    <details class="text-xs text-grey mb-3">
        <summary class="cursor-pointer">About this layer</summary>
        <p class="mt-2">
            Estimated burnt areas for the selected map dates, clipped to {state_code === 'PB'
                ? 'Punjab'
                : 'Haryana'}. Zoom in for estimated boundaries. These are derived from satellite
            fire detections, not surveyed farm boundaries or confirmed stubble-burning footprints.
            No shading does not prove that land was unburnt.
            <a class="underline" href={BURNT_AREA_SOURCE} target="_blank" rel="noreferrer"
                >Source and method</a
            >.
        </p>
    </details>
{/if}
<div class="relative">
    <button
        type="button"
        class="absolute top-3 right-3 z-[1000] rounded bg-white px-3 py-2 text-sm shadow disabled:opacity-50"
        disabled={!ready || !locations_data?.length}
        aria-label="Fit all fire locations"
        aria-controls={`map-${state_code}`}
        on:click={showAllFires}>Fit map</button
    >
    <div
        id={`map-${state_code}`}
        class="w-full rounded min-h-[320px] h-[420px] md:h-[500px]"
        bind:this={mapElement}
    />
</div>

<style>
    .burnt-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 18px;
        margin-bottom: 12px;
        font-size: 14px;
    }
    .burnt-controls label {
        display: flex;
        align-items: center;
        gap: 7px;
        cursor: pointer;
    }
    .burnt-controls input {
        accent-color: #976334;
        width: 16px;
        height: 16px;
    }
    .burnt-controls label span,
    .burnt-status {
        color: #777;
        font-size: 12px;
    }
    .burnt-key {
        display: inline-block;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #b32424;
        margin-right: 3px;
    }
</style>
