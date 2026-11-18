import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
    validateSentinelCatalogue,
    isSentinelReleaseApproved,
} from '../src/lib/utils/sentinelBurnLayer.js';

test('release contains no failed burn classification assets', () => {
    const root = new URL('../static/sentinel-2/', import.meta.url);
    const catalogue = validateSentinelCatalogue(
        JSON.parse(fs.readFileSync(new URL('catalogue.json', root))),
    );
    assert.equal(isSentinelReleaseApproved(catalogue), false);
    assert.equal(catalogue.release.status, 'blocked');
    assert.deepEqual(catalogue.scenes, []);
    // Failed tiles must not ship as publicly accessible deployment assets.
    assert.deepEqual(fs.readdirSync(root).sort(), ['catalogue.json', 'empty.png']);
});
