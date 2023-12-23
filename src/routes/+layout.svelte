<script>
    import { fires_data } from '../stores.js';
    import { browser } from '$app/environment';
    import '../app.css';



    export let data;

    $: if (data) {
        if (browser) {
            $fires_data = data;
        } else {
            $fires_data = null;
        }
    }
</script>



<slot />
