import { writable } from 'svelte/store';
import snapshot from './lib/data/dashboardSnapshot.json';
import { latestReportedDate } from './lib/utils/dashboardSummary.js';
import { parseISO } from 'date-fns';
import { getDateISO } from './lib/utils/datetime.js';
const initialDate = parseISO(latestReportedDate(snapshot.data)).getTime();

// All fires data
export const fires_data = writable({
    ...snapshot.data,
    pending: { PB_historical: true, HR_historical: true },
});
export const calendarDay = writable(getDateISO());
export const datePreset = writable('latest');

// Highlighted date
export const highlightedDate = writable(initialDate);
export const hoverOut = writable(true);
export const startDate = writable(initialDate);
export const endDate = writable(null);

//Data mode
export const isRangeMode = writable(false);

// UI options
export const isMenuMinimised = writable(false);
