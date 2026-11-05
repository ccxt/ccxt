import assert from 'node:assert/strict';
import test from 'node:test';

const { fetchReleasedTags } = await import('../utils/released-tags.ts');

const perPage = 100;
const maxPages = 50;

// Serves `total` releases, 100 per page, and records every URL it was asked for.
function paginated (total, { short = true } = {}) {
    const calls = [];
    const fetchImpl = async (url) => {
        calls.push(url);
        const page = Number(new URL(url).searchParams.get('page'));
        const from = (page - 1) * perPage;
        const body = [];
        for (let i = from; i < Math.min(from + perPage, total); i++) {
            body.push({ tag_name: `v4.5.${i}` });
        }
        // A server that never reports a short page (always exactly perPage) is the overflow case.
        return { ok: true, status: 200, json: async () => (short ? body : Array.from({ length: perPage }, (_, i) => ({ tag_name: `v4.5.${from + i}` }))) };
    };
    return { calls, fetchImpl };
}

test('collects tag names across pages', async () => {
    const { calls, fetchImpl } = paginated(257);
    const tags = await fetchReleasedTags({ env: {}, fetchImpl });
    assert.equal(tags.size, 257);
    assert.ok(tags.has('v4.5.0'));
    assert.ok(tags.has('v4.5.256'));
    assert.equal(calls.length, 3);
});

test('stops on a short page without spending another request', async () => {
    const { calls, fetchImpl } = paginated(150);
    const tags = await fetchReleasedTags({ env: {}, fetchImpl });
    assert.equal(tags.size, 150);
    assert.equal(calls.length, 2);
});

test('handles an exact page boundary', async () => {
    const { calls, fetchImpl } = paginated(200);
    const tags = await fetchReleasedTags({ env: {}, fetchImpl });
    assert.equal(tags.size, 200);
    // 200 releases is two full pages, so a third request is needed to learn there is no more
    assert.equal(calls.length, 3);
});

// The review case: on overflow the old loop returned a partial set and the caller then pruned
// the tags it had never fetched - exactly the orphaning this guard exists to prevent.
test('throws rather than returning a partial set when the release list overflows', async () => {
    const { calls, fetchImpl } = paginated(Infinity, { short: false });
    await assert.rejects(
        () => fetchReleasedTags({ env: {}, fetchImpl }),
        /refusing to prune tags from an incomplete release list/,
    );
    assert.equal(calls.length, maxPages);
});

test('throws on an API error instead of reporting no releases', async () => {
    const fetchImpl = async () => ({ ok: false, status: 403, json: async () => ({}) });
    await assert.rejects(() => fetchReleasedTags({ env: {}, fetchImpl }), /HTTP 403/);
});

test('skips releases that carry no tag name', async () => {
    const fetchImpl = async () => ({ ok: true, status: 200, json: async () => [ { tag_name: 'v4.5.82' }, {}, { tag_name: '' } ] });
    const tags = await fetchReleasedTags({ env: {}, fetchImpl });
    assert.deepEqual([ ...tags ], [ 'v4.5.82' ]);
});

test('authenticates with GH_TOKEN or GITHUB_TOKEN and stays anonymous without one', async () => {
    const seen = [];
    const fetchImpl = async (url, options) => {
        seen.push({ url, auth: options.headers['Authorization'] });
        return { ok: true, status: 200, json: async () => [] };
    };
    await fetchReleasedTags({ env: { GH_TOKEN: 'aaa' }, fetchImpl });
    await fetchReleasedTags({ env: { GITHUB_TOKEN: 'bbb' }, fetchImpl });
    await fetchReleasedTags({ env: {}, fetchImpl });
    assert.deepEqual(seen.map(s => s.auth), [ 'Bearer aaa', 'Bearer bbb', undefined ]);
});

test('defaults to ccxt/ccxt and honours GITHUB_REPOSITORY', async () => {
    const seen = [];
    const fetchImpl = async (url) => {
        seen.push(url);
        return { ok: true, status: 200, json: async () => [] };
    };
    await fetchReleasedTags({ env: {}, fetchImpl });
    await fetchReleasedTags({ env: { GITHUB_REPOSITORY: 'someone/fork' }, fetchImpl });
    assert.match(seen[0], /repos\/ccxt\/ccxt\/releases\?per_page=100&page=1$/);
    assert.match(seen[1], /repos\/someone\/fork\/releases/);
});
