<script>
    import { onMount } from 'svelte';
    let container,
        intersecting = false;
    onMount(() => {
        const observer = new IntersectionObserver((entries) => {
            intersecting = entries[0].isIntersecting;

            if (intersecting) {
                observer.unobserve(container);
            }
        });

        observer.observe(container);
        return () => observer.unobserve(container);
    });
</script>

<div bind:this={container} class:animate-fadein-up={intersecting} class="w-full h-full">
    <slot />
</div>
