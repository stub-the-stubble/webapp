<script>
    import { onMount } from 'svelte';
    import 'leaflet/dist/leaflet.css';
    import 'leaflet.markercluster/dist/MarkerCluster.css';
    import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
    import map_marker from '$lib/assets/icons/fire_map_marker.png';



    export let locations_data, state_code, center, layout;

    let mapElement, L, L_M, l_map, fire_icon, markers;

    onMount(async () => {
        L = await import('leaflet');
        L_M = await import('leaflet.markercluster/dist/leaflet.markercluster.js');

        l_map = L.map(mapElement, { preferCanvas: true });
        l_map.setView(center, 8);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            minZoom: 6,
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            preferCanvas: true,
        }).addTo(l_map);

        fire_icon = L.icon({
            iconUrl: map_marker,
            iconSize: [30, 30], // size of the icon
            iconAnchor: [7.5, 7.5], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -7.5], // point from which the popup should open relative to the iconAnchor
        });

        markers = new L_M.MarkerClusterGroup({ chunkedLoading: true, showCoverageOnHover: false });
    });

    // Update map config and markers whenever L is available and we get new data
    $: if (l_map && locations_data) {
        layout = layout ?? 'default';

        // Change zoom level on narrow layouts
        if (layout === 'narrow') {
            l_map.setView(center, 7);
        }

        locations_data.forEach((element) => {
            const marker_html = `District : ${element.district} <br>
                           Time : ${element.acqtime} <br>
                           FRP : ${element.radiative_} <br>`;
            const marker = L.marker([element.lat, element.lon], { icon: fire_icon }).bindPopup(
                marker_html,
                { closeButton: false },
            );
            markers.addLayer(marker);
        });
        l_map.addLayer(markers);
    }
</script>



<div id={`map-${state_code}`} class="w-full aspect-w-16 aspect-h-9 mx-auto" bind:this={mapElement} />
