<script>
    let primaryNavItems = [{
        text: 'Home',
        url: '/',
    },{
        text: 'Punjab',
        url: '/punjab',
    },{
        text: 'Haryana',
        url: '/haryana',
    },{
        text: 'Insights',
        url: 'https://info.stubthestubble.com/insights/',
    },{
        text: 'Resources',
        url: 'https://info.stubthestubble.com/resources/',
    }];
    let secondaryNavItems = [{
        text: 'About Saroja Earth',
        url: 'https://www.saroja.earth/about/',
    }];
</script>



<div class="container my-4">
    <div class="w-full xl:w-5/6 mx-auto">
        <nav class="flex justify-between pb-2 border-b border-light-grey overflow-x-auto">
            {#if primaryNavItems.length}
                <ul class="flex">
                    {#each primaryNavItems as item}
                        <li class="mr-4 last:mr-0">
                            <a href="{item.url}" class="hover:text-brown">
                                {item.text}
                            </a>
                        </li>
                    {/each}
                </ul>
            {/if}
            {#if secondaryNavItems.length}
                <ul class="hidden sm:flex">
                    {#each secondaryNavItems as item}
                        <li class="mr-4 last:mr-0">
                            <a href="{item.url}" class="hover:text-brown">
                                {item.text}
                            </a>
                        </li>
                    {/each}
                </ul>
            {/if}
        </nav>
    </div>
</div>