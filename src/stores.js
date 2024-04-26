import { writable, derived } from 'svelte/store';

// All fires data
export const fires_data = writable(null);

// Highlighted date
export const highlightedDate = writable(null);
export const hoverOut = writable(true);
export const startDate = writable(null);
export const endDate = writable(null);

//Data mode
export const rangeMode = writable(false);
