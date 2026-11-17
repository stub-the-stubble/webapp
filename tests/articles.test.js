import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const articles = JSON.parse(
    fs.readFileSync(new URL('../src/lib/data/articles.json', import.meta.url)),
);

test('recovered articles retain their identities and contain no executable archive markup', () => {
    assert.equal(articles.filter((a) => a.category === 'insights').length, 3);
    assert.equal(articles.filter((a) => a.category === 'resources').length, 1);
    assert.equal(new Set(articles.map((a) => a.slug)).size, 4);
    for (const article of articles) {
        assert.ok(article.author && /^202[34]-\d{2}-\d{2}$/.test(article.published));
        assert.doesNotMatch(
            article.body,
            /<(script|style|iframe|object|embed|svg|form)\b|\bon\w+\s*=|javascript:|data:/i,
        );
        assert.doesNotMatch(article.body, /(?:src|href)="https?:\/\/info\.stubthestubble\.com/i);
        for (const [, src] of article.body.matchAll(/src="([^"]+)"/g)) {
            assert.ok(src.startsWith('/content/recovered/'));
            assert.ok(fs.existsSync(new URL('../static' + src, import.meta.url)));
        }
    }
});

test('an incomplete archived PDF is not offered as a working download', () => {
    const resource = articles.find((a) => a.category === 'resources');
    assert.match(resource.body, /PDF currently unavailable/);
    assert.doesNotMatch(resource.body, /href="[^"]+\.pdf/);
    assert.ok(
        !fs.existsSync(
            new URL(
                '../static/content/recovered/Saroja-Earth---Theory-Of-Change.pdf',
                import.meta.url,
            ),
        ),
    );
});
