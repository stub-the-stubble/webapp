<script>
    import { slide } from 'svelte/transition';
    import { DatePicker } from '$components';
    import { isMenuMinimised } from '../stores.js';



    let primaryNavItems = [{
        text: 'Home (All Data)',
        url: '/',
    },{
        text: 'Punjab',
        url: '/punjab',
    },{
        text: 'Haryana',
        url: '/haryana',
    }];
    let secondaryNavItems = [{
        text: 'Insights',
        url: 'https://info.stubthestubble.com/insights/',
    },{
        text: 'Resources',
        url: 'https://info.stubthestubble.com/resources/',
    }];
</script>



<div class="container pt-4 sticky top-0 bg-lightest-grey/90 z-50 backdrop-blur">
    <div class="w-full xl:w-5/6 mx-auto">
        {#if !$isMenuMinimised}
            <nav class="flex justify-between pb-2 border-b border-light-grey" transition:slide>
                {#if primaryNavItems.length}
                    <ul class="flex">
                        {#each primaryNavItems as item}
                            <li class="flex-none mr-4 last:mr-0 hidden sm:block first:block">
                                <a href="{item.url}" class="hover:text-brown">
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
                                <a href="{item.url}" class="hover:text-brown" rel="external">
                                    {item.text}
                                </a>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </nav>
        {/if}
        <DatePicker/>
    </div>
</div>
