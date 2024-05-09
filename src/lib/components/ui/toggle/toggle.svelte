<script>
	import { Toggle as TogglePrimitive } from "bits-ui";
	import { toggleVariants } from "./index.js";
	import { cn } from "$lib/utils";
    import { isMenuMinimised } from '../../../../stores.js';



	let className = undefined;
	export let variant = "default";
	export let size = "default";
	export { className as class };
</script>

<TogglePrimitive.Root
	bind:pressed={$isMenuMinimised}
	class={cn(toggleVariants({ variant, size, className }))}
	{...$$restProps}
	on:click
>
	<slot />
</TogglePrimitive.Root>
