<script>
    import { Header, Footer, StateSummary, DistrictBreakup } from '$components';
    import { page } from '$app/stores';
    import { site, states } from '$lib/data/site_info.js';



    export let state = $page.params.state;
</script>



<svelte:head>
    <title>
        {states[state].name} - {site.name}
    </title>
</svelte:head>



<Header />
<div class="container my-12">
    <div class="w-full xl:w-5/6 mx-auto">
        <div class="mb-24">
            <StateSummary {state} />
        </div>
        <DistrictBreakup {state} />
    </div>
</div>
<Footer />
