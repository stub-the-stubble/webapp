export * from './datetime';
export { default as IntersectionObserver } from './IntersectionObserver.svelte';

export function capitalize(string) {
    return string[0].toUpperCase() + string.slice(1);
}
