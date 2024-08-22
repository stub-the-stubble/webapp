<script>
    import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
    import { ChevronRight } from 'lucide-svelte';
    import { buttonVariants } from '../button';
    import { cn } from '$lib/utils';



    let className = undefined;
    export { className as class };
</script>



<RangeCalendarPrimitive.NextButton
    on:click
    class={cn(
        buttonVariants({ variant: 'outline', size: 'icon' }),
        'h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 disabled:opacity-20',
        className
    )}
    {...$$restProps}
    let:builder
>
    <slot {builder}>
        <ChevronRight class="h-4 w-4" />
    </slot>
</RangeCalendarPrimitive.NextButton>
