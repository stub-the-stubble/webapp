<script>
    import { Header, Footer, StateSummary } from '$components';
    import { site } from '$lib/data/site_info.js';
</script>



<svelte:head>
    <title>
        Haryana - {site.name}
    </title>
</svelte:head>



<Header />
<div class="container my-12">
    <div class="w-full xl:w-5/6 mx-auto">
        <StateSummary state_code="HR" />
    </div>
</div>
<Footer />
