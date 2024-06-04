// Documentation:
// https://www.bits-ui.com/docs/components/toggle



import { tv } from 'tailwind-variants';
import Root from './toggle.svelte';



export const toggleVariants = tv({
    base: 'inline-flex items-center justify-center rounded-md text-sm ring-offset-background transition-colors hover:bg-light-orange hover:text-light-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-light-orange data-[state=on]:text-brown',
    variants: {
        variant: {
            default: 'bg-transparent',
            outline:
                'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
        },
        size: {
            default: 'p-1.5',
            sm: 'h-9 px-2.5',
            lg: 'h-11 px-5',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});

export {
    Root,
    Root as Toggle,
};
