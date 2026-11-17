import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SourceConfig, VenueConfig } from '../src/types.ts';
import { commitsApiUrl, commitsPageUrl, githubHeaders, NOISE } from '../src/adapters/ghcommits.ts';
import { collect, requestHeaders } from '../src/collect.ts';
import { FetchError } from '../src/fetch.ts';
import { makeRegistry, validateVenue } from '../src/registry.ts';
import { Store } from '../src/store.ts';
import { fixture, parse } from './helpers.ts';

const SRC: SourceConfig = { id: 'example-docs-commits', type: 'gh-commits', url: '', repo: 'example/api-docs', ref: 'main', path: 'docs/changelog' };
const VENUE: VenueConfig = { id: 'example', kind: 'exchange', name: 'Example', domains: [ 'example.com', 'github.com' ], sources: [ SRC ] };

test ('urls are built from repo/ref/path', () => {
    assert.equal (commitsApiUrl (SRC), 'https://api.github.com/repos/example/api-docs/commits?sha=main&path=docs%2Fchangelog&per_page=30');
    assert.equal (commitsApiUrl ({ repo: 'example/api-docs' }), 'https://api.github.com/repos/example/api-docs/commits?per_page=30');
    assert.equal (commitsPageUrl (SRC), 'https://github.com/example/api-docs/commits/main/docs/changelog');
    assert.equal (commitsPageUrl ({ repo: 'example/api-docs', path: '/openapi.yaml' }), 'https://github.com/example/api-docs/commits/HEAD/openapi.yaml');
    assert.equal (commitsPageUrl ({ repo: 'example/api-docs' }), 'https://github.com/example/api-docs/commits');
    const [ venue ] = makeRegistry ([ VENUE ]).venues;
    assert.equal (venue.sources[0].url, commitsApiUrl (SRC), 'makeRegistry fills the derived url');
    assert.equal (venue.sources[0].link, commitsPageUrl (SRC));
});

test ('Authorization only with GITHUB_TOKEN and only for api.github.com', () => {
    const url = commitsApiUrl (SRC);
    assert.equal (githubHeaders (url, {})['Authorization'], undefined);
    assert.equal (githubHeaders (url, { GITHUB_TOKEN: 'ghs_x' })['Authorization'], 'Bearer ghs_x');
    assert.equal (githubHeaders ('https://raw.githubusercontent.com/a/b/main/x.md', { GITHUB_TOKEN: 'ghs_x' })['Authorization'], undefined);
    assert.equal (githubHeaders (url, {})['Accept'], 'application/vnd.github+json');
    assert.equal (requestHeaders ({ id: 'a-b', type: 'md', url: 'https://example.com/a.md' }, 'https://example.com/a.md'), undefined, 'other types: registry headers only');
});

test ('commits become entries: first line title, trailers dropped, committer date, commit link, sha guid; noise skipped', async () => {
    const out = await parse ({ ...SRC, url: commitsApiUrl (SRC) }, fixture ('gh-commits.json'));
    assert.deepEqual (out.entries.map ((e) => e.title), [
        'Add GET /api/v1/fundingRate/history endpoint',
        'Deprecate the v1 order cancel endpoint, removed on 2026-12-01',
    ]);
    const [ first ] = out.entries;
    assert.equal (first.body, 'New endpoint returning the funding rate history.\nRate limit weight 5.');
    assert.equal (first.dateText, '2026-11-07T10:00:01Z');
    assert.equal (first.link, 'https://github.com/example/api-docs/commit/9f2c1e0b7a6d5c4b3a291807f6e5d4c3b2a19087');
    assert.equal (first.guid, '9f2c1e0b7a6d5c4b3a291807f6e5d4c3b2a19087');
    const filtered = await parse ({ ...SRC, titleFilter: '.' }, fixture ('gh-commits.json'));
    assert.equal (filtered.entries.length, 5, 'a titleFilter replaces the noise filter');
    for (const t of [ 'Fix typo', 'Merge pull request #1 from a/b', 'Merge branch \'main\' into x', 'Update README.md', 'Formatting', 'reformatted tables' ]) {
        assert.ok (NOISE.test (t), t);
    }
    for (const t of [ 'Update rate limit information', 'Add order type parameter docs', 'Merge margin endpoints into one page' ]) {
        assert.ok (!NOISE.test (t), t);
    }
});

test ('API errors are parse errors (rate limit message)', async () => {
    await assert.rejects (async () => parse (SRC, '{"message":"API rate limit exceeded for 1.2.3.4."}'), /GitHub API: API rate limit exceeded/);
});

test ('collect: api.github.com unreachable -> the source fails, the run does not crash; then entries', async () => {
    const store = new Store (await mkdtemp (join (tmpdir (), 'changelog-gh-')));
    const registry = makeRegistry ([ VENUE ]);
    const seen: Record<string, string>[] = [];
    let rows = await collect ({ store, registry, now: new Date ('2026-11-08T05:00:00Z'), venues: [], sources: [], fetcher: async (_url, opts) => {
        seen.push (opts.headers ?? {});
        throw new FetchError ('blocked: HTTP 403 Forbidden', 403);
    } });
    assert.equal (rows[0].status, 'failed');
    assert.equal (rows[0].error, 'blocked: HTTP 403 Forbidden');
    assert.equal (seen[0]['Accept'], 'application/vnd.github+json');
    rows = await collect ({ store, registry, now: new Date ('2026-11-08T06:00:00Z'), venues: [], sources: [], fetcher: async (url) => {
        assert.equal (url, 'https://api.github.com/repos/example/api-docs/commits?sha=main&path=docs%2Fchangelog&per_page=30');
        return { status: 'ok', httpStatus: 200, body: fixture ('gh-commits.json'), contentType: 'application/json' };
    } });
    assert.equal (rows[0].status, 'ok', rows[0].error ?? '');
    const entries = [ ...(await store.loadEntries ('exchange', 'example')).values () ];
    assert.deepEqual (entries.map ((e) => [ e.publishedAt, e.dateKind, e.url.slice (-8) ]), [
        [ '2026-11-07', 'published', 'b2a19087' ],
        [ '2026-11-03', 'published', '3c4d5e6f' ],
    ]);
    assert.ok (entries[1].tags.includes ('deprecation'));
    assert.equal (entries[0].sourceLink, 'https://github.com/example/api-docs/commits/main/docs/changelog');
});

test ('registry: gh-commits fields', () => {
    const base = { id: 'example', kind: 'exchange', name: 'Example', domains: [ 'example.com', 'github.com' ] };
    const ok = { ...base, sources: [ { id: 'example-commits', type: 'gh-commits', repo: 'example/api-docs', path: 'openapi.yaml' } ] };
    assert.deepEqual (validateVenue (ok, 'exchange/example.json', 'exchange'), []);
    const bad = {
        ...base,
        domains: [ 'example.com' ],
        sources: [
            { id: 'example-a', type: 'gh-commits', url: 'https://api.github.com/x', repo: 'nope', ref: 'a b', path: '../x' },
            { id: 'example-b', type: 'md', url: 'https://example.com/a.md', repo: 'example/api-docs' },
        ],
    };
    const errors = validateVenue (bad, 'exchange/example.json', 'exchange').join ('\n');
    for (const expected of [ 'gh-commits sources have no "url"', 'repo must be "owner/name"', 'ref must be a branch', 'path must be a file or directory', 'repo is only used by gh-commits' ]) {
        assert.ok (errors.includes (expected), `missing error: ${expected}\n${errors}`);
    }
    const noGithub = { ...ok, domains: [ 'example.com' ] };
    assert.match (validateVenue (noGithub, 'exchange/example.json', 'exchange').join (), /\(github\.com\) must be in the venue "domains"/);
});
