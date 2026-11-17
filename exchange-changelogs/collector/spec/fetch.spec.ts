import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { detectChallenge, fetchSource, Semaphore, USER_AGENT } from '../src/fetch.ts';

let hits: Record<string, number> = {};
const seenHeaders: Record<string, IncomingMessage['headers']> = {};
const server = createServer ((req: IncomingMessage, res: ServerResponse) => {
    const path = req.url ?? '/';
    hits[path] = (hits[path] ?? 0) + 1;
    seenHeaders[path] = req.headers;
    if (path === '/page') {
        if (req.headers['if-none-match'] === '"v1"') {
            res.writeHead (304).end ();
            return;
        }
        res.writeHead (200, { 'content-type': 'text/html', 'etag': '"v1"', 'last-modified': 'Fri, 06 Nov 2026 10:00:00 GMT' }).end ('<h2>2026-11-05</h2>');
    } else if (path === '/flaky') {
        if (hits[path] === 1) {
            res.writeHead (503, { 'retry-after': '0' }).end ('busy');
        } else {
            res.writeHead (200).end ('ok now');
        }
    } else if (path === '/cf') {
        res.writeHead (403, { 'content-type': 'text/html' }).end ('<html><head><title>Just a moment...</title></head><body><script>window._cf_chl_opt={}</script></body></html>');
    } else if (path === '/empty202') {
        res.writeHead (202).end ();
    } else if (path === '/geo') {
        res.writeHead (451).end ('not here');
    } else if (path === '/missing') {
        res.writeHead (404).end ('nope');
    } else {
        res.writeHead (500).end ();
    }
});
await new Promise<void> ((resolve) => server.listen (0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${(server.address () as AddressInfo).port}`;
after (() => server.close ());

const fast = { backoffMs: 1, timeoutMs: 5000 };

test ('sends the bot User-Agent and returns validators', async () => {
    const r = await fetchSource (`${base}/page`, fast);
    assert.equal (r.status, 'ok');
    assert.equal (seenHeaders['/page']['user-agent'], USER_AGENT);
    if (r.status === 'ok') {
        assert.equal (r.etag, '"v1"');
        assert.equal (r.lastModified, 'Fri, 06 Nov 2026 10:00:00 GMT');
    }
});

test ('conditional GET: 304 => unchanged', async () => {
    const r = await fetchSource (`${base}/page`, { ...fast, etag: '"v1"' });
    assert.equal (r.status, 'unchanged');
});

test ('retries 5xx honoring Retry-After', async () => {
    hits = {};
    const r = await fetchSource (`${base}/flaky`, fast);
    assert.equal (r.status, 'ok');
    assert.equal (hits['/flaky'], 2);
});

test ('challenges and blocks are failures, not content (and are not retried)', async () => {
    hits = {};
    await assert.rejects (fetchSource (`${base}/cf`, fast), /challenge: Cloudflare challenge \(HTTP 403\)/);
    assert.equal (hits['/cf'], 1);
    await assert.rejects (fetchSource (`${base}/empty202`, fast), /HTTP 202 with empty body/);
    await assert.rejects (fetchSource (`${base}/geo`, fast), /HTTP 451/);
    await assert.rejects (fetchSource (`${base}/missing`, fast), /HTTP 404/);
    hits = {};
    await assert.rejects (fetchSource (`${base}/boom`, fast), /HTTP 500/);
    assert.equal (hits['/boom'], 3, '1 try + 2 retries');
});

test ('detectChallenge markers', () => {
    const h = new Headers ();
    assert.equal (detectChallenge (200, h, '<html>normal docs mentioning captcha and /cdn-cgi/challenge-platform/scripts/jsd/main.js</html>'), null);
    assert.match (detectChallenge (200, new Headers ({ 'cf-mitigated': 'challenge' }), '') ?? '', /Cloudflare/);
    assert.match (detectChallenge (202, new Headers ({ 'x-amzn-waf-action': 'challenge' }), '') ?? '', /AWS WAF/);
    assert.match (detectChallenge (200, h, '<script>window.gokuProps = {}</script>') ?? '', /AWS WAF/);
    assert.match (detectChallenge (403, h, '<title>Access Denied</title> Reference&#32;&#35;18.abc errors.edgesuite.net') ?? '', /Akamai/);
    assert.match (detectChallenge (429, h, 'slow down') ?? '', /429/);
});

test ('detectChallenge: 2xx pages are only checked for interstitial markers, and only when small', () => {
    const h = new Headers ();
    assert.equal (detectChallenge (200, h, '<html><script>window.awsWafCookieDomainList = []</script><h1>Changelog</h1></html>'), null);
    assert.equal (detectChallenge (200, h, '<p>Send the aws-waf-token cookie with every request.</p>'), null);
    assert.equal (detectChallenge (200, h, '<script>window.gokuProps = {}</script>' + 'x'.repeat (30_000)), null, 'large 2xx pages are content');
    assert.match (detectChallenge (405, h, '<script>window.awsWafCookieDomainList = []</script>') ?? '', /AWS WAF/, 'error statuses check every marker');
    assert.match (detectChallenge (200, h, '<html><head><title>Just a moment...</title></head></html>') ?? '', /Cloudflare/);
});

test ('Semaphore hands a released slot to the next waiter (never over the limit)', async () => {
    const s = new Semaphore (1);
    let inside = 0;
    let max = 0;
    const enter = () => {
        inside++;
        max = Math.max (max, inside);
    };
    await s.acquire ();
    enter ();
    const w = s.acquire ().then (enter);
    s.release ();
    inside--;
    const c = s.acquire ().then (enter);
    await w;
    assert.equal (max, 1);
    s.release ();
    inside--;
    await c;
    assert.equal (max, 1);
    s.release ();
    assert.equal (s.inUse, 0);
});
