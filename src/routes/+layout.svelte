<script>
    import { fires_data } from '../stores.js';
    import { Header, Footer } from '$components';
    import { onMount } from 'svelte';
    import { loadFireData } from '$lib/utils/loadFireData.js';
    import '../app.css';

    onMount(() => {
        const controller = new AbortController();
        loadFireData(window.fetch.bind(window), controller.signal).then((data) => {
            if (!controller.signal.aborted) $fires_data = data;
        });
        return () => controller.abort();
    });
</script>

<Header />
<main><slot /></main>
<Footer />
