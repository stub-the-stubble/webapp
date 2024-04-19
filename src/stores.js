import { writable } from 'svelte/store';



// All fires data
export const fires_data = writable(null);

// Dates for filtering data
export const startDate = writable(null);
export const endDate = writable(null);
export const highlightedDate = writable(null);
