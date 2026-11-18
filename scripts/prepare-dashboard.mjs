// Bake a small, dated snapshot into the static HTML. Live history is refreshed
// after hydration, so visitors see real counts without waiting for that network.
import fs from 'node:fs/promises';
import { validPayload } from '../src/lib/utils/loadFireData.js';
import { getMonitoringSeason } from '../src/lib/utils/season.js';
import { latestReportedDate } from '../src/lib/utils/dashboardSummary.js';
import { format, parseISO, subDays } from 'date-fns';
async function main() {
    const base = 'https://stub-the-stubble.github.io/data-pipeline/v2';
    const data = {};
    const locations = {};
    await Promise.all(
        ['PB', 'HR'].map(async (state) => {
            const response = await fetch(`${base}/${state}/historical_data.json`, {
                signal: AbortSignal.timeout(20000),
            });
            if (!response.ok) throw Error(`History unavailable: ${state}`);
            const history = await response.json();
            if (!validPayload(history, true)) throw Error(`Invalid history: ${state}`);
            const latest = Object.keys(history.total.dates).sort().at(-1);
            // Cover the current month, rolling chart and whole monitoring season.
            // Five-year history is deliberately excluded from the first-render payload.
            const last = parseISO(latest);
            const first = format(
                new Date(
                    Math.min(
                        getMonitoringSeason(last).start.getTime(),
                        subDays(last, 45).getTime(),
                    ),
                ),
                'yyyy-MM-dd',
            );
            const trim = (series) =>
                Object.fromEntries(Object.entries(series).filter(([date]) => date >= first));
            data[`${state}_historical`] = {
                ...history,
                total: { ...history.total, dates: trim(history.total.dates) },
                districts: Object.fromEntries(
                    Object.entries(history.districts).map(([name, value]) => [
                        name,
                        { ...value, dates: trim(value.dates) },
                    ]),
                ),
                ...(history.unassigned
                    ? {
                          unassigned: {
                              ...history.unassigned,
                              dates: trim(history.unassigned.dates),
                          },
                      }
                    : {}),
            };
        }),
    );
    // The homepage starts at the latest date shared by both states. Their
    // updates can arrive separately, so fetch points for that same date too.
    const date = latestReportedDate(data);
    if (!date) throw Error('No common observation date');
    await Promise.all(
        ['PB', 'HR'].map(async (state) => {
            const dailyResponse = await fetch(`${base}/${state}/${date}.json`, {
                signal: AbortSignal.timeout(20000),
            });
            if (!dailyResponse.ok) throw Error(`Latest locations unavailable: ${state}`);
            const daily = await dailyResponse.json();
            if (
                !validPayload(daily, false) ||
                daily.total !== data[`${state}_historical`].total.dates[date]
            )
                throw Error(`Locations disagree with history: ${state}`);
            locations[`${state}/${date}`] = daily;
        }),
    );
    const output = { generatedAt: new Date().toISOString(), data, locations };
    await fs.writeFile(
        new URL('../src/lib/data/dashboardSnapshot.json', import.meta.url),
        JSON.stringify(output),
    );
    console.log(`Prepared dated dashboard snapshot (${JSON.stringify(output).length} bytes)`);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
