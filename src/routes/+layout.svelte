<script>
    import '../app.css';
    import { afterNavigate } from '$app/navigation';

    afterNavigate(() => {
        if (!scroll_restored) {
            main_el.scrollTop = 0;
        }
        scroll_restored = false;
    });

    export const snapshot = {
        capture() {
            return main_el.scrollTop;
        },
        restore(scroll_top) {
            main_el.scrollTop = scroll_top;

            // Restore is not called for the first navigation to a page,
            // use this flag to track whether to reset the scroll to top or not in afterNavigate
            scroll_restored = true;
        }
    };
</script>

<slot />
