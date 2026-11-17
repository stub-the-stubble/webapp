<script>
    import DataNotes from './DataNotes.svelte';
    import { page } from '$app/stores';
    $: isDashboard = ['/', '/punjab', '/haryana'].includes(
        $page.url.pathname.replace(/\/$/, '') || '/',
    );
</script>

<footer class="mb-8 container">
    {#if isDashboard}<div class="w-full xl:w-5/6 mx-auto"><DataNotes /></div>{/if}
    <p class="text-sm xs:text-base px-6 text-left xs:text-center text-grey">
        Stub the Stubble is a public interest project by <a
            class="underline underline-offset-4 hover:text-brown"
            href="https://www.saroja.earth"
            rel="external"
        >
            Saroja Earth
        </a>
    </p>
</footer>
