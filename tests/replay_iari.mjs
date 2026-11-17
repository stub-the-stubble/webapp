// Offline contract replay against a frozen candidate; no HTTP requests or writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseISO } from 'date-fns';
import { validPayload } from '../src/lib/utils/loadFireData.js';
import { loadLocations } from '../src/lib/utils/fireLocations.js';
import { periodTotal } from '../src/lib/utils/datahelpers.js';
import { map_paths } from '../src/lib/data/map_paths.js';

async function main() {
    const root = path.resolve(process.argv[2]);
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json')));
    assert.equal(manifest.status, 'validated-local-candidate');
    assert.equal(manifest.series, 'iari-creams-paddy-v1');
    let checked = 0;
    for (const [file, hash] of Object.entries(manifest.output_sha256)) {
        const bytes = fs.readFileSync(path.join(root, file));
        assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, file);
        assert.ok(validPayload(JSON.parse(bytes), file.endsWith('historical_data.json')), file);
        checked++;
    }
    const days = Object.keys(manifest.daily_sources).sort();
    for (const state of ['PB', 'HR']) {
        const history = JSON.parse(fs.readFileSync(path.join(root, state, 'historical_data.json')));
        assert.equal(
            periodTotal(history.total.dates, parseISO(days[0]), parseISO(days.at(-1))),
            manifest.totals[state],
        );
        const result = await loadLocations(
            async (url) => {
                const file = new URL(url).pathname.split('/').at(-1);
                return new Response(fs.readFileSync(path.join(root, state, file)), {
                    headers: { 'content-type': 'application/json' },
                });
            },
            state,
            days,
            new AbortController().signal,
        );
        assert.equal(result.locations.length, manifest.totals[state]);
        assert.equal(result.sharedObservations, manifest.overlapping_observations);
        assert.deepEqual(result.sources, [manifest.series]);
        const counts = {};
        for (const point of result.locations) {
            assert.ok(map_paths[state].paths[point.district]);
            counts[point.district] = (counts[point.district] ?? 0) + 1;
        }
        for (const district of Object.keys(map_paths[state].paths)) {
            assert.equal(
                periodTotal(
                    history.districts[district].dates,
                    parseISO(days[0]),
                    parseISO(days.at(-1)),
                ),
                counts[district] ?? 0,
            );
        }
    }
    console.log(
        JSON.stringify({
            checked_files: checked,
            state_day_checks: days.length * 2,
            district_checks: 46,
            totals: manifest.totals,
            overlaps: manifest.overlapping_observations,
        }),
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
