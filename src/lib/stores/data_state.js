import { writable } from 'svelte/store';

export const data_state = writable({ numbers: 'loading', locations: 'loading' });
