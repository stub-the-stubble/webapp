<script>
    import { Header, Footer, StateSummary, DistrictBreakup } from '$components';
    import { site, states } from '$lib/data/site_info.js';
    import { page } from '$app/stores';
    import { capitalize } from '$lib/utils';

    const state_name = $page.params.state_name;
    const state_code = states[state_name];
</script>

<svelte:head>
    <title>
        {capitalize(state_name)} - {site.name}
    </title>
</svelte:head>

<Header />
<div class="container my-12">
    <div class="w-full xl:w-5/6 mx-auto">
        <div class="mb-24">
            <StateSummary {state_code} />
        </div>
        <DistrictBreakup {state_code} />
    </div>
</div>
<Footer />
