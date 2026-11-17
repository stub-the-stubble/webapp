<script>
    import { fires_data } from '../stores.js';
    import { Header, Footer } from '$components';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { loadFireData } from '$lib/utils/loadFireData.js';
    import '../app.css';

    let mounted = false;
    let controller;
    $: isDashboard = ['/', '/punjab', '/haryana'].includes(
        $page.url.pathname.replace(/\/$/, '') || '/',
    );
    // Editorial pages render independently of the fire-data service. Load once
    // when a visitor first enters a dashboard, including client-side navigation.
    $: if (mounted && isDashboard && !controller) {
        controller = new AbortController();
        loadFireData(window.fetch.bind(window), controller.signal, (data) => {
            $fires_data = data;
        }).then((data) => {
            if (!controller.signal.aborted) $fires_data = data;
        });
    }
    onMount(() => {
        mounted = true;
        return () => controller?.abort();
    });
</script>

<Header />
<main><slot /></main>
<Footer />
