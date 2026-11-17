# Stub the Stubble

Stub the Stubble is a platform to understand the problems and solutions related to stubble burning in India.

## Developing

Once you've created a project and installed dependencies with `npm install` , start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## IARI candidate verification

Run `node --test tests/*.test.js` for offline frontend checks. For a frozen IARI
candidate prepared by the data pipeline, run:

```sh
node tests/replay_iari.mjs ../release/iari-candidate
```

This checks all manifest hashes, frontend payload schemas, map/location counts,
district totals and cross-state overlap metadata without network access or writes.
IARI's state-assigned records are not unique physical fires. Older NRSC data uses
a different method; source labels must remain visible. District paths are generated
by `data-pipeline/tools/build_iari_maps.py`; Hansi's derived boundary and provenance
are documented in that repository's `geojson/iari-2026/README.md`.

## Formatting

Run `npm run format` before committing to format using recommended settings. This ensures there are no unnecessary diffs due to spacing and other inconsistencies from personal editor configuration and os line ending differences.
