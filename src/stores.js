import { writable } from 'svelte/store';

// All fires data
export const fires_data = writable(null);

// Highlighted date
export const highlightedDate = writable(null);
export const startDate = writable(new Date(2024, 3, 1));
export const endDate = writable(new Date(2024, 4, 1));
export const selectedDate = writable(new Date(2024, 4, 20));


//Data mode
export const rangeMode = writable(true);
