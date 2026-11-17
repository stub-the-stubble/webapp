<script>
    import { slide } from 'svelte/transition';
    import { DatePicker } from '$components';
    import { isMenuMinimised } from '../stores.js';
    import { page } from '$app/stores';
    import logo from '$lib/assets/logo/stub_the_stubble_icon.svg';
    $: isDashboard = ['/', '/punjab', '/haryana'].includes(
        $page.url.pathname.replace(/\/$/, '') || '/',
    );

    let primaryNavItems = [
        {
            text: 'Home (All Data)',
            url: '/',
        },
        {
            text: 'Punjab',
            url: '/punjab',
        },
        {
            text: 'Haryana',
            url: '/haryana',
        },
    ];
    let secondaryNavItems = [
        {
            text: 'Insights',
            url: '/insights/',
        },
        {
            text: 'Resources',
            url: '/resources/',
        },
    ];
</script>

{#if !isDashboard}
    <header class="publication-header">
        <nav aria-label="Main navigation">
            <a class="publication-brand" href="/"
                ><img src={logo} alt="" width="16" height="40" /><span>Stub the Stubble</span></a
            >
            <div>
                <a href="/">Dashboard</a><a
                    href="/insights/"
                    aria-current={$page.url.pathname === '/insights/' ? 'page' : undefined}
                    >Insights</a
                ><a
                    href="/resources/"
                    aria-current={$page.url.pathname === '/resources/' ? 'page' : undefined}
                    >Resources</a
                >
            </div>
        </nav>
    </header>
{:else}
    <div class="container pt-4 sticky top-0 bg-lightest-grey/90 z-50 backdrop-blur">
        <div class="w-full xl:w-5/6 mx-auto">
            {#if !$isMenuMinimised || !isDashboard}
                <nav class="flex justify-between pb-2 border-b border-light-grey" transition:slide>
                    {#if primaryNavItems.length}
                        <ul class="flex">
                            {#each primaryNavItems as item}
                                <li class="flex-none mr-4 last:mr-0 hidden sm:block first:block">
                                    <a href={item.url} class="hover:text-brown">
                                        {item.text}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                    {#if secondaryNavItems.length}
                        <ul class="flex">
                            {#each secondaryNavItems as item}
                                <li class="flex-none mr-4 last:mr-0">
                                    <a
                                        href={item.url}
                                        class="hover:text-brown"
                                        aria-current={$page.url.pathname === item.url
                                            ? 'page'
                                            : undefined}
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </nav>
            {/if}
            {#if isDashboard}<DatePicker />{/if}
        </div>
    </div>
{/if}

<style>
    .publication-header {
        background: #fff;
        border-bottom: 1px solid #e0e5e2;
        position: sticky;
        top: 0;
        z-index: 50;
    }
    .publication-header nav {
        width: min(1120px, calc(100% - 64px));
        margin: auto;
        min-height: 76px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
        color: #182d32;
    }
    .publication-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 19px;
        font-weight: 650;
        letter-spacing: -0.025em;
    }
    .publication-header nav > div {
        display: flex;
        gap: 28px;
        font-size: 14px;
        font-weight: 550;
    }
    .publication-header a:hover,
    .publication-header a[aria-current] {
        color: #8a582c;
    }
    @media (max-width: 640px) {
        .publication-header nav {
            width: calc(100% - 40px);
            flex-wrap: wrap;
            gap: 12px;
            padding: 16px 0;
        }
        .publication-brand {
            font-size: 17px;
        }
        .publication-brand img {
            height: 28px;
            width: auto;
        }
        .publication-header nav > div {
            width: 100%;
            gap: 24px;
            font-size: 13px;
        }
    }
</style>
