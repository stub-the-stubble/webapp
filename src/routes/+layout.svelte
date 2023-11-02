<script>
    import '../app.css';
    import { afterNavigate } from '$app/navigation';

    let scroll_restored = false;

    afterNavigate(() => {
        if (!scroll_restored) {
            window.scrollY = 0;
        }
        scroll_restored = false;
    });

    export const snapshot = {
        capture() {
            return window.scrollY;
        },
        restore(scroll_top) {
            window.scrollY = scroll_top;

            // Restore is not called for the first navigation to a page,
            // use this flag to track whether to reset the scroll to top or not in afterNavigate
            scroll_restored = true;
        }
    };
</script>

<slot />
