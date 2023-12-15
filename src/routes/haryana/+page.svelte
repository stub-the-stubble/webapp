<script>
    import { Header, Footer, StateSummary, DistrictBreakup } from '$components';
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
        <div class="mb-24">
            <StateSummary state_code="HR" />
        </div>
        <DistrictBreakup state_code="HR" />
    </div>
</div>
<Footer />
