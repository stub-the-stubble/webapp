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
        loadFireData(
            window.fetch.bind(window),
            controller.signal,
            (data) => {
                // Keep the dated first-render counts while refreshing. One state's
                // response must not erase the other's already rendered snapshot.
                const updated = { ...$fires_data, errors: data.errors };
                for (const state of ['PB', 'HR']) {
                    const key = `${state}_historical`;
                    if (data[key]) updated[key] = data[key];
                }
                $fires_data = updated;
            },
            { includeToday: false },
        );
    }
    onMount(() => {
        mounted = true;
        return () => controller?.abort();
    });
</script>

<Header />
<main><slot /></main>
<Footer />
