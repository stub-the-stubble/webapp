<script>
    import { onMount } from 'svelte';
    import { firePopupHtml } from '$lib/utils/firePresentation.js';
    import 'leaflet/dist/leaflet.css';
    import 'leaflet.markercluster/dist/MarkerCluster.css';
    import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
    import map_marker from '$lib/assets/icons/fire_map_marker.png';

    export let locations_data, state_code, center, layout;
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

<div class="mb-2 flex flex-wrap items-center gap-3">
    <button
        type="button"
        class="rounded border border-light-brown bg-white px-3 py-2 text-sm disabled:opacity-50"
        disabled={!ready || !locations_data?.length}
        aria-controls={`map-${state_code}`}
        on:click={showAllFires}>Show all fires</button
    >
    <p class="text-xs text-grey">
        Zoom is preserved when changing periods. Show all fires resets the view.
    </p>
</div>
{#if initError}<p role="alert">The map could not load. Please refresh to retry.</p>{/if}
{#if tileError}<p role="status" class="text-sm text-grey">
        Some background tiles could not load. Fire detections are shown independently.
    </p>{/if}
<div
    id={`map-${state_code}`}
    class="w-full rounded min-h-[320px] h-[420px] md:h-[500px]"
    bind:this={mapElement}
/>
