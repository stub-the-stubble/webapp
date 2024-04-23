import { browser } from '$app/environment';
import { startOfToday } from 'date-fns';
import { timeFormat } from 'd3-time-format';



export const prerender = true;
export const trailingSlash = 'always';

export async function load({ fetch }) {
    //Get date string YYYY-MM-DD format in IST
    const currentDateStr = timeFormat("%Y-%m-%d")(startOfToday());

    if (browser) {
        return {
            PB_today: await fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/PB/${currentDateStr}.json`).then((res) => res.json()),
            PB_historical: await fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/PB/historical_data.json`).then((res) => res.json()),
            HR_today: await fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/HR/${currentDateStr}.json`).then((res) => res.json()),
            HR_historical: await fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/HR/historical_data.json`).then((res) => res.json()),
        };
    }
}
