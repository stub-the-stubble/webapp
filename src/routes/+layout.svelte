<script>
    import { fires_data, calendarDay } from '../stores.js';
    import { Header, Footer } from '$components';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { createHistoryRefresh, mergeHistoryUpdate } from '$lib/utils/historyRefresh.js';
    import { getDateISO } from '$lib/utils/datetime.js';
    import '../app.css';

    let mounted = false;
    let refresher;
    $: isDashboard = ['/', '/punjab', '/haryana'].includes(
        $page.url.pathname.replace(/\/$/, '') || '/',
    );
    $: if (mounted && isDashboard) refresher?.refresh();
    onMount(() => {
        refresher = createHistoryRefresh(window.fetch.bind(window), (data) => {
            $fires_data = mergeHistoryUpdate($fires_data, data);
        });
        const tick = (force = false) => {
            $calendarDay = getDateISO();
            if (isDashboard && document.visibilityState === 'visible') refresher.refresh(force);
        };
        const online = () => tick(true);
        const visible = () => tick();
        window.addEventListener('online', online);
        document.addEventListener('visibilitychange', visible);
        const timer = setInterval(visible, 60000);
        mounted = true;
        return () => {
            clearInterval(timer);
            window.removeEventListener('online', online);
            document.removeEventListener('visibilitychange', visible);
            refresher.stop();
        };
    });
</script>

<Header />
<main><slot /></main>
<Footer />
