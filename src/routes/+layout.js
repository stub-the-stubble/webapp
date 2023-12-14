import { browser } from '$app/environment';
import { getDateISO } from '$lib/utils';



export const prerender = true;
export const trailingSlash = 'always';

export function load({ fetch }) {
    //Get date string YYYY-MM-DD format in IST
    const currentDateStr = getDateISO();

    if (browser) {
        return {
            PB_today: fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/PB/${currentDateStr}.json`).then((res) => res.json()),
            PB_historical: fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/PB/historical_data.json`).then((res) => res.json()),
            HR_today: fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/HR/${currentDateStr}.json`).then((res) => res.json()),
            HR_historical: fetch(`https://stub-the-stubble.github.io/data-pipeline/v2/HR/historical_data.json`).then((res) => res.json()),
        };
    }
}
