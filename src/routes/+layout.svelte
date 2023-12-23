<script>
    import { fires_data, highlightedDate } from '../stores.js';
    import { browser } from '$app/environment';
    import '../app.css';



    export let data;

    $: if (data) {
        if (browser) {
            $fires_data = data;
            $highlightedDate = $fires_data.PB_today ? (new Date($fires_data.PB_today.last_update).setHours(0, 0, 0, 0)) : null;
        } else {
            $fires_data = null;
        }
    }
</script>



<slot />
