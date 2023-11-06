<script>
    import { onMount } from 'svelte';
    import { getContext } from 'svelte';
    import 'leaflet/dist/leaflet.css';

    export let locations_data;
    const data_state = getContext('state');

    let mapElement, L, l_map, fire_icon;

    onMount(async () => {
        L = await import('leaflet');

        l_map = L.map(mapElement, { preferCanvas: true }).setView([31.0, 76.5], 8);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            minZoom: 8,
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            preferCanvas: true
        }).addTo(l_map);

        fire_icon = L.icon({
            iconUrl: 'red_dot.png',
            iconSize: [15, 15], // size of the icon
            iconAnchor: [7.5, 7.5], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -7.5] // point from which the popup should open relative to the iconAnchor
        });
    });

    // Update markers whenever L is available and we get new data
    // TODO : use markers cluster to speed up performance
    $: if (L && locations_data && $data_state.locations == 'loaded') {
        locations_data.forEach((element) => {
            const marker_html = `District : ${element.district} <br>
                           Time : ${element.acqtime} <br>
                           FRP : ${element.radiative_} <br>`;
            L.marker([element.lat, element.lon], { icon: fire_icon })
                .bindPopup(marker_html, { closeButton: false })
                .addTo(l_map);
        });
    }
</script>

<div id="map" class="w-full aspect-square sm:aspect-video mx-auto" bind:this={mapElement} />
