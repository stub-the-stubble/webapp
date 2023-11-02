/** @type {import('./$types').PageLoad} */
export function load({ fetch }) {

    const total = fetch(`https://stub-the-stubble.github.io/data-pipeline/total_numbers.json`);
    const currentDate = new Date();

    //Get date string YYYY-MM-DD format in IST
    const currentDateStr = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
    const locations = fetch(
        `https://stub-the-stubble.github.io/data-pipeline/${currentDateStr}.json`
    );
    return {
        total_promise: total,
        locations_promise: locations
    };
}
