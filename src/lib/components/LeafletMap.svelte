<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    export let locations;

    onMount(() => {
        if (browser) {
            const map = L.map('map').setView([31.0, 76.5000], 8);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                minZoom: 8,
                attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            const fire_icon = L.icon({
                iconUrl: 'red_dot.png',
                iconSize: [15, 15], // size of the icon
                iconAnchor: [7.5, 7.5], // point of the icon which will correspond to marker's location
                popupAnchor: [0, -7.5] // point from which the popup should open relative to the iconAnchor
            });

            locations.forEach((element) => {
                const marker = L.marker([element.lat, element.long], { icon: fire_icon }).addTo(
                    map
                );
                const marker_html = `District : ${element.dist} <br>
                           Tehsil/Block : ${element.tb}  <br>
                           Time : ${element.time} <br>`;
                marker.bindPopup(marker_html, { closeButton: false }).openPopup();
            });
        }
    });
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""
    />
    <script
        defer
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""
    ></script>
</svelte:head>

<div id="map" class="w-full aspect-video mx-auto" />
