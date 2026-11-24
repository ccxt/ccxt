import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { MAX_BODY_BYTES, SESSION_TTL_MS, browserCommand } from '../../ts/setup.js';
import { KEY, SECRET, bootOf, fileOf, harness, manage, manageFile, manageHarness, posix, post, raw, refused, saveBody, urlInLaunchFile } from '../helpers/setup-form.js';

// The account pages' security properties, against the real loopback server: what a request
// must prove before it is served (token, Host, Origin, nonce, cookie), what the model and a
// command line never see (the URL), and how a session begins and ends. The same rules are
// then checked on the accounts page, which shares that machinery (ts/setup/session.ts).

test ('setup_account opens the form in the browser and tells the model nothing that identifies it', async () => {
    const h = await harness ();
    const session = await h.open ({ 'exchange': 'fakex' });
    assert.equal (session.envelope.ok, true);
    assert.equal (session.envelope.data.opened, true);
    assert.equal (session.envelope.data.expiresInSeconds, 600);
    assert.match (session.envelope.meta.notice, /Do NOT ask them to paste or type any key/);
    assert.match (session.envelope.meta.notice, /expires in 10 minutes/);
    assert.ok (session.envelope.data.asksFor.some ((line: string) => /apiKey, secret/.test (line)), 'names the credential fields the exchange needs');
    assert.equal (session.envelope.data.savesTo, h.configFile);
    // the opener got the path of a local file, the file led to a loopback URL with a 128-bit
    // token…
    assert.equal (h.launches.length, 1);
    assert.equal (path.basename (h.launches[0]), 'open.html');
    assert.match (session.url, /^http:\/\/127\.0\.0\.1:\d+\/setup\/[0-9a-f]{32}$/);
    // …and neither the token, the port nor any URL reached the model or the log
    for (const haystack of [ session.text, h.stderr () ]) {
        assert.ok (!haystack.includes (session.token), 'token leaked');
        assert.ok (!haystack.includes (session.nonce), 'nonce leaked');
        assert.ok (!/127\.0\.0\.1:\d|\/setup\//.test (haystack), 'URL leaked');
    }
});

test ('a browser that cannot be launched yields a config-file hint, no listener and still no token', async () => {
    let seen = '';
    let file = '';
    const h = await harness ({ 'opener': async (launchFile: string) => {
        file = launchFile;
        seen = urlInLaunchFile (launchFile);
        throw new Error ('spawn xdg-open ENOENT ' + launchFile + ' ' + seen);
    } });
    const session = await h.open ({});
    assert.equal (session.envelope.ok, false);
    assert.equal (session.envelope.error.code, 'SETUP_FORM_UNAVAILABLE');
    assert.ok (session.envelope.error.hint.includes (h.configFile));
    assert.match (session.envelope.error.hint, /never in this chat/);
    const token = seen.split ('/').pop () as string;
    assert.equal (token.length, 32);
    assert.ok (!session.text.includes (token) && !h.stderr ().includes (token), 'the opener error must not carry the URL out');
    assert.ok (!session.text.includes (file) && !h.stderr ().includes (file), 'nor the launch file path');
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (seen));
    assert.deepEqual (fs.readdirSync (h.launchRoot), [], 'the launch file does not outlive the failed launch');
});

test ('the page: strict headers, no CORS, session data only as JSON, prefill escaped', async () => {
    const h = await harness ();
    const session = await h.open ({ 'exchange': 'fakex', 'account': 'my-acct', 'sandbox': false });
    const page = await raw (session.url);
    assert.equal (page.status, 200);
    assert.match (String (page.headers['content-type']), /^text\/html/);
    const csp = String (page.headers['content-security-policy']);
    assert.match (csp, /^default-src 'none'; script-src 'nonce-[A-Za-z0-9+/=]+'; style-src 'nonce-[A-Za-z0-9+/=]+'; connect-src 'self'; img-src data:; form-action 'none'; base-uri 'none'; frame-ancestors 'none'$/);
    assert.ok (!/unsafe-inline|unsafe-eval|https?:|\*/.test (csp));
    assert.equal (page.headers['x-frame-options'], 'DENY');
    assert.equal (page.headers['referrer-policy'], 'no-referrer');
    assert.equal (page.headers['cache-control'], 'no-store');
    assert.equal (page.headers['x-content-type-options'], 'nosniff');
    // every inline block carries this response's nonce, and nothing loads from elsewhere
    const nonce = /script-src 'nonce-([^']+)'/.exec (csp)![1];
    assert.ok (page.text.includes ('<style nonce="' + nonce + '">') && page.text.includes ('<script nonce="' + nonce + '">'));
    assert.ok (!/<(script|link|img|iframe)[^>]+(src|href)="(https?:)?\/\//.test (page.text), 'no external assets');
    assert.ok (!/\son[a-z]+="|style="/.test (page.text), 'no inline handlers or style attributes');
    assert.ok (!page.text.includes ('__CSP_NONCE__') && !page.text.includes ('__BOOT_JSON__') && !page.text.includes ('@include'));
    const boot = bootOf (page.text);
    assert.deepEqual (boot.exchanges, [ 'fakex' ]);
    assert.deepEqual (boot.prefill, { 'exchange': 'fakex', 'account': 'my-acct', 'environment': 'live' });
    assert.equal (boot.configPath, h.configFile);
    assert.equal (boot.expiresInMs, SESSION_TTL_MS);
    // the form offers no funds / withdraw / implicit-write switch at all
    assert.ok (!/name="(funds|withdraw|implicitWrites)"|id="(funds|withdraw|implicitWrites)"/.test (page.text));
    assert.match (page.text, /Withdrawals and transfers cannot be switched on from this page/);
    assert.match (page.text, /Withdrawals: keep them DISABLED/);
    // a second load gets a different nonce
    const again = await raw (session.url);
    assert.notEqual (again.headers['content-security-policy'], csp);
    // the credentials endpoint
    const fields = await raw (session.url + '/credentials?exchange=fakex');
    assert.equal (fields.status, 200);
    const info = JSON.parse (fields.text);
    assert.deepEqual (info.fields, [ { 'name': 'apiKey', 'label': 'API key' }, { 'name': 'secret', 'label': 'API secret' } ]);
    assert.deepEqual (info.environments, { 'sandbox': true, 'demo': false, 'live': true });
    assert.deepEqual ([ info.configFileOnly, info.predictionVariant, info.sandboxIsDemo, info.walletKey ], [ false, false, false, false ]);
    assert.equal (JSON.parse ((await raw (session.url + '/credentials?exchange=%3Cscript%3E')).text).ok, false);
    for (const response of [ page, fields, await post (session, 'test', { 'bad': true }) ]) {
        for (const header of Object.keys (response.headers)) {
            assert.ok (!header.startsWith ('access-control-'), 'no CORS header may ever be sent: ' + header);
        }
    }
});

test ('security: a request without the session token gets an empty 404, whatever else it carries', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const origin = 'http://127.0.0.1:' + session.port;
    const wrongToken = session.token.replace (/^./, (c) => ((c === '0') ? '1' : '0'));
    const targets = [ '/', '/setup', '/setup/', '/setup/' + wrongToken, '/setup/' + wrongToken + '/save', '/setup/' + session.token.toUpperCase (), '/setup/' + session.token + '/', '/setup/' + session.token + '/unknown', '/setup/' + session.token + '/../x', '/setup/' + session.token.slice (0, 31) ];
    // GET everywhere; the write-shaped and preflight-shaped requests on the interesting ones
    const requests: [ string, string ][] = targets.map ((target) => [ 'GET', target ] as [ string, string ]);
    for (const target of [ '/setup/' + wrongToken + '/save', '/setup/' + session.token + '/unknown', '/setup/' + wrongToken ]) {
        requests.push ([ 'POST', target ], [ 'OPTIONS', target ]);
    }
    for (const [ method, target ] of requests) {
        const response = await raw (origin + target, { method, 'headers': (method === 'POST') ? { 'Content-Type': 'application/json', 'Origin': origin, 'X-Setup-Nonce': session.nonce } : {}, 'body': (method === 'POST') ? JSON.stringify (saveBody ()) : undefined });
        assert.equal (response.status, 404, method + ' ' + target);
        assert.equal (response.text, '', 'no detail');
        assert.deepEqual (Object.keys (response.headers).filter ((header) => header.startsWith ('access-control-')), []);
    }
    assert.equal (h.ctx.setup.isListening (), true);
    assert.equal ((await raw (session.url)).status, 200, 'the real session is unaffected');
    assert.equal (fs.existsSync (h.configFile), false);
});

test ('security: only Host 127.0.0.1:<port> or localhost:<port> is served (DNS rebinding)', async () => {
    const h = await harness ();
    const session = await h.open ({});
    for (const host of [ 'evil.example:' + session.port, 'evil.example', '127.0.0.1', '127.0.0.1:1', 'localhost', '[::1]:' + session.port, '127.0.0.1.evil.example:' + session.port, '127.0.0.1:' + session.port + '.evil.example' ]) {
        const page = await raw (session.url, { 'headers': { 'Host': host } });
        assert.equal (page.status, 404, host);
        assert.equal (page.text, '');
        const save = await post (session, 'save', saveBody (), { 'Host': host, 'Origin': 'http://' + host });
        assert.equal (save.status, 404, host);
    }
    assert.equal (fs.existsSync (h.configFile), false);
    const local = await raw (session.url, { 'headers': { 'Host': 'localhost:' + session.port } });
    assert.equal (local.status, 200);
    assert.equal ((await post (session, 'save', saveBody (), { 'Host': 'localhost:' + session.port, 'Origin': 'http://localhost:' + session.port })).status, 200);
});

test ('security: a write must be a same-origin JSON POST carrying the page nonce', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const cases: [ string, Record<string, string | undefined>, number, string? ][] = [
        [ 'missing Origin', { 'Origin': undefined }, 403 ],
        [ 'foreign Origin', { 'Origin': 'https://evil.example' }, 403 ],
        [ 'null Origin', { 'Origin': 'null' }, 403 ],
        [ 'same host, other port', { 'Origin': 'http://127.0.0.1:1' }, 403 ],
        [ 'localhost Origin on a 127.0.0.1 page', { 'Origin': 'http://localhost:' + session.port }, 403 ],
        [ 'https Origin', { 'Origin': 'https://127.0.0.1:' + session.port }, 403 ],
        [ 'cross-site fetch metadata', { 'Sec-Fetch-Site': 'cross-site' }, 403 ],
        [ 'form content type', { 'Content-Type': 'application/x-www-form-urlencoded' }, 415 ],
        [ 'text/plain', { 'Content-Type': 'text/plain' }, 415 ],
        [ 'no content type', { 'Content-Type': undefined }, 415 ],
        [ 'missing nonce', { 'X-Setup-Nonce': undefined }, 403 ],
        [ 'wrong nonce', { 'X-Setup-Nonce': '0'.repeat (32) }, 403 ],
        [ 'the token is not the nonce', { 'X-Setup-Nonce': session.token }, 403 ],
    ];
    for (const action of [ 'save', 'test' ]) {
        for (const [ label, overrides, status ] of cases) {
            const response = await post (session, action, saveBody (), overrides);
            assert.equal (response.status, status, action + ': ' + label);
            assert.ok (!response.text.includes (KEY) && !response.text.includes (SECRET));
        }
        for (const method of [ 'GET', 'PUT', 'DELETE', 'PATCH' ]) {
            const response = await post (session, action, (method === 'GET') ? '' : saveBody (), {}, method);
            assert.equal (response.status, 405, method + ' ' + action);
            assert.equal (response.headers['allow'], 'POST');
        }
    }
    assert.equal ((await post (session, 'save', '{not json')).status, 400);
    assert.equal (fs.existsSync (h.configFile), false, 'none of the rejected requests saved anything');
    assert.deepEqual (Object.keys (h.ctx.config.accounts), []);
    assert.equal ((await raw (session.url, { 'method': 'POST' })).status, 405);
    // and the well-formed one still works afterwards
    assert.equal ((await post (session, 'save', saveBody (), { 'Content-Type': 'application/json; charset=utf-8', 'Sec-Fetch-Site': 'same-origin' })).status, 200);
});

test ('security: an oversized body is refused (declared or streamed) and saves nothing', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const big = JSON.stringify (saveBody ({ 'padding': 'x'.repeat (MAX_BODY_BYTES) }));
    const declared = await post (session, 'save', big, { 'Content-Length': String (Buffer.byteLength (big)) });
    assert.equal (declared.status, 413);
    const chunked = await post (session, 'save', big, { 'Transfer-Encoding': 'chunked' });
    assert.equal (chunked.status, 413);
    assert.equal (fs.existsSync (h.configFile), false);
    const fits = JSON.stringify (saveBody ());
    assert.ok (Buffer.byteLength (fits) < MAX_BODY_BYTES);
    assert.equal ((await post (session, 'save', fits)).status, 200);
});

test ('security: the session expires after 10 minutes and takes the listener with it', async () => {
    const h = await harness ();
    const session = await h.open ({});
    h.clock.now += SESSION_TTL_MS - 1;
    assert.equal ((await raw (session.url)).status, 200);
    h.clock.now += 1;
    const expired = await post (session, 'save', saveBody ());
    assert.equal (expired.status, 404);
    assert.equal (expired.text, '');
    assert.equal (fs.existsSync (h.configFile), false);
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
});

test ('security: a session is single-use — after a save its token opens nothing', async () => {
    const h = await harness ();
    const first = await h.open ({});
    assert.equal ((await post (first, 'save', saveBody ())).status, 200);
    assert.ok (await refused (first.url));
    // a new form reuses nothing of the old one, and the old token is not accepted by it
    const second = await h.open ({});
    assert.notEqual (second.token, first.token);
    assert.notEqual (second.nonce, first.nonce);
    const stale = await raw ('http://127.0.0.1:' + second.port + '/setup/' + first.token);
    assert.equal (stale.status, 404);
    const replay = await post ({ 'base': 'http://127.0.0.1:' + second.port + '/setup/' + first.token, 'port': second.port, 'nonce': first.nonce }, 'save', saveBody ({ 'name': 'again' }));
    assert.equal (replay.status, 404);
    assert.equal (h.ctx.config.accounts['again'], undefined);
});

test ('a repeat setup_account call leaves the open form alone: no new window, typed input stays valid', async () => {
    const h = await harness ();
    const first = await h.open ({ 'exchange': 'fakex' });
    // the model calls again while the user is typing — with different prefill, even
    const second = await h.open ({ 'exchange': 'fakex', 'account': 'other', 'sandbox': false });
    assert.equal (second.envelope.ok, true);
    assert.deepEqual ([ second.envelope.data.opened, second.envelope.data.alreadyOpen ], [ false, true ]);
    assert.match (second.envelope.meta.notice, /still open in the user's browser/);
    assert.match (second.envelope.meta.notice, /restart: true/);
    assert.equal (h.launches.length, 1, 'no second browser window');
    assert.ok (!second.text.includes (first.token) && !/127\.0\.0\.1:\d|\/setup\//.test (second.text));
    // the form the user has open is untouched: same prefill on a reload, and it still saves
    assert.deepEqual (bootOf ((await raw (first.url)).text).prefill, { 'exchange': 'fakex', 'account': '', 'environment': 'sandbox' });
    assert.equal ((await post (first, 'save', saveBody ())).status, 200);
    assert.equal (h.ctx.config.accounts['main'].apiKey, KEY);
});

test ('a form no browser has loaded yet is launched again as the same session, with the new prefill', async () => {
    const h = await harness ();
    const first = await h.open ({ 'exchange': 'fakex' }, { 'load': false });
    const second = await h.open ({ 'account': 'again' });
    assert.equal (second.envelope.data.opened, true);
    assert.equal (h.launches.length, 2);
    assert.equal (second.token, first.token, 'the same session, not a new one');
    assert.equal (fs.existsSync (first.launchFile), false, 'the earlier launch file was replaced, not left behind');
    assert.equal (fs.readdirSync (h.launchRoot).length, 0, 'and the new one went with the first page load');
    assert.deepEqual (bootOf ((await raw (second.url)).text).prefill, { 'exchange': '', 'account': 'again', 'environment': 'sandbox' });
});

test ('restart: true is the only way a live form is retired, and it is retired completely', async () => {
    const h = await harness ();
    const first = await h.open ({});
    const second = await h.open ({ 'restart': true });
    assert.equal (second.envelope.data.opened, true);
    assert.equal (second.port, first.port, 'the listener is reused');
    assert.notEqual (second.token, first.token);
    assert.equal ((await raw (first.url)).status, 404);
    assert.equal ((await post (first, 'save', saveBody ())).status, 404);
    assert.equal (fs.existsSync (h.configFile), false);
    // the old page's nonce and cookie are useless against the new session too
    assert.equal ((await post ({ ...second, 'nonce': first.nonce }, 'save', saveBody ())).status, 403);
    assert.equal ((await raw (second.url + '/credentials?exchange=fakex', { 'cookie': false, 'headers': { 'Cookie': first.cookie } })).status, 404);
    assert.equal ((await post (second, 'save', saveBody ())).status, 200);
});

// The listener exists only while one of the two tools has been called. A deployment that
// must never open a port on the machine therefore has a switch: a tool list without them.
test ('a tool profile without setup_account and manage_accounts can never start the listener', async () => {
    const h = await harness ({ 'settings': { 'tools': 'get_tickers,list_accounts' } });
    for (const name of [ 'setup_account', 'manage_accounts' ]) {
        const result: any = await h.client.callTool ({ name, 'arguments': {} }).catch ((e: any) => ({ 'isError': true, 'content': [ { 'text': String (e?.message ?? e) } ] }));
        assert.equal (result.isError, true, name);
        assert.match (result.content[0].text, /not found/i, name);
    }
    assert.equal (h.ctx.setup.isListening (), false);
    assert.deepEqual (h.launches, []);
    assert.deepEqual (fs.readdirSync (h.launchRoot), []);
});

test ('setup_account is not annotated read-only: it opens a window and can discard a form', async () => {
    const h = await harness ();
    const tool = (await h.client.listTools ()).tools.find ((entry: any) => entry.name === 'setup_account') as any;
    assert.deepEqual (tool.annotations, { 'readOnlyHint': false, 'destructiveHint': false, 'idempotentHint': false, 'openWorldHint': false });
    assert.ok ('restart' in tool.inputSchema.properties);
});

test ('security: the token never reaches a command line — the browser is launched on a private file', async () => {
    const h = await harness ();
    const session = await h.open ({}, { 'load': false });
    // what the opener was given, and what it would put on a command line on every platform
    assert.equal (h.launches.length, 1);
    const file = h.launches[0];
    assert.ok (path.isAbsolute (file) && file.startsWith (h.launchRoot + path.sep));
    for (const platform of [ 'linux', 'darwin', 'win32' ]) {
        const { command, args } = browserCommand (platform, file);
        const commandLine = [ command, ...args ].join (' ');
        assert.ok (!commandLine.includes (session.token), platform + ': token in argv');
        assert.ok (!/127\.0\.0\.1|\/setup\/|https?:/.test (commandLine), platform + ': URL in argv');
    }
    // the file is readable by its owner only, inside a directory only the owner can enter
    assert.match (fs.readFileSync (file, 'utf8'), /<meta name="referrer" content="no-referrer">/);
    assert.ok (fs.readFileSync (file, 'utf8').includes ('<a rel="noreferrer" href="' + session.url + '">'), 'a link for browsers that do not follow the refresh');
    if (posix) {
        assert.equal (fs.statSync (file).mode & 0o777, 0o600);
        assert.equal (fs.statSync (path.dirname (file)).mode & 0o777, 0o700);
    }
    assert.deepEqual (fs.readdirSync (path.dirname (file)), [ 'open.html' ]);
    // nothing but the page is served before a browser is bound to the session
    assert.equal ((await raw (session.url + '/credentials?exchange=fakex')).status, 404);
    assert.equal (fs.existsSync (file), true, 'a refused request does not consume the launch file');
    // the first page load removes the file and its directory
    assert.equal ((await raw (session.url)).status, 200);
    assert.equal (fs.existsSync (path.dirname (file)), false);
    assert.deepEqual (fs.readdirSync (h.launchRoot), []);
});

test ('security: the launch file is gone after expiry and after close() even if no browser ever loaded it', async () => {
    let h = await harness ();
    let session = await h.open ({}, { 'load': false });
    assert.equal (fs.existsSync (session.launchFile), true);
    h.clock.now += SESSION_TTL_MS;
    assert.equal ((await raw (session.url)).status, 404);
    assert.deepEqual (fs.readdirSync (h.launchRoot), [], 'expiry');
    h = await harness ();
    session = await h.open ({}, { 'load': false });
    assert.equal (fs.existsSync (session.launchFile), true);
    await h.ctx.setup.close ();
    assert.deepEqual (fs.readdirSync (h.launchRoot), [], 'close()');
});

test ('security: the first page load binds the session to that browser — the URL alone then opens nothing', async () => {
    const h = await harness ();
    const session = await h.open ({});
    // what the first load set
    assert.match (session.cookie, /^ccxt_setup=[0-9a-f]{32}$/);
    assert.notEqual (session.cookie.split ('=')[1], session.token);
    assert.notEqual (session.cookie.split ('=')[1], session.nonce);
    const first = await raw (session.url, { 'cookie': false, 'headers': { 'Cookie': session.cookie } });
    assert.equal (first.status, 200, 'a reload by the same browser works');
    assert.equal (first.headers['set-cookie'], undefined, 'and is not handed a new cookie');
    assert.equal (bootOf (first.text).csrf, session.nonce);
    // a second client that learned the URL (argv of old, the address bar, the launch file)
    const stranger = await raw (session.url, { 'cookie': false });
    assert.equal (stranger.status, 404);
    assert.equal (stranger.text, '');
    assert.equal (stranger.headers['set-cookie'], undefined);
    for (const cookie of [ 'ccxt_setup=' + '0'.repeat (32), 'ccxt_setup=' + session.token, 'ccxt_setup=', 'other=' + session.cookie.split ('=')[1] ]) {
        assert.equal ((await raw (session.url, { 'cookie': false, 'headers': { 'Cookie': cookie } })).status, 404, cookie.slice (0, 16));
    }
    // every other endpoint needs the cookie too — even with the right nonce and Origin
    assert.equal ((await raw (session.url + '/credentials?exchange=fakex', { 'cookie': false })).status, 404);
    for (const action of [ 'test', 'save' ]) {
        const response = await post (session, action, saveBody (), {}, 'POST', false);
        assert.equal (response.status, 404, action);
        assert.equal (response.text, '');
    }
    assert.equal (fs.existsSync (h.configFile), false);
    assert.equal (h.ctx.setup.hasLiveSession (), true, 'none of that cost the real session anything');
    // the cookie rides along with other cookies the browser holds for 127.0.0.1
    assert.equal ((await raw (session.url + '/credentials?exchange=fakex', { 'cookie': false, 'headers': { 'Cookie': 'a=b; ' + session.cookie + '; c=d' } })).status, 200);
    assert.equal ((await post (session, 'save', saveBody ())).status, 200);
    // the cookie's own attributes
    const h2 = await harness ();
    const fresh = await h2.open ({}, { 'load': false });
    const setCookie = String (((await raw (fresh.url)).headers['set-cookie'] ?? [])[0]);
    // Lax, not Strict: a reload of a page first reached from the launch file is a cross-site
    // navigation to Chromium, and a Strict cookie would not come back with it
    assert.match (setCookie, /^ccxt_setup=[0-9a-f]{32}; HttpOnly; SameSite=Lax; Path=\/setup\/[0-9a-f]{32}$/);
    assert.ok (setCookie.endsWith ('Path=/setup/' + fresh.token), 'scoped to this form, so it is sent to no other loopback service');
});

test ('security: no number of blind requests closes the form (a hostile web page can send them)', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const origin = 'http://127.0.0.1:' + session.port;
    // what any page in the user's browser can fire at a loopback port without knowing anything
    const blind: Record<string, string>[] = [
        { 'Sec-Fetch-Site': 'cross-site', 'Sec-Fetch-Mode': 'no-cors' },
        { 'Origin': 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' },
        { 'Host': 'evil.example:' + session.port },
        {}, // an old browser, or curl: no fetch metadata at all
    ];
    for (let i = 0; i < 60; i++) {
        const target = [ '/x', '/favicon.ico', '/setup/' + i.toString (16).padStart (32, '0'), '/setup/' + 'f'.repeat (32) + '/save' ][i % 4];
        const response = await raw (origin + target, { 'method': (i % 5 === 0) ? 'POST' : 'GET', 'headers': blind[i % blind.length] });
        assert.equal (response.status, 404);
        assert.equal (response.text, '');
    }
    assert.equal (h.ctx.setup.isListening (), true);
    assert.equal (h.ctx.setup.hasLiveSession (), true);
    assert.equal ((await raw (session.url)).status, 200, 'the form is still there');
    assert.equal ((await post (session, 'save', saveBody ())).status, 200, 'and still saves');
    assert.ok (!h.stderr ().includes (session.token));
});

test ('close() (server shutdown) drops the session and the listener', async () => {
    const h = await harness ();
    const session = await h.open ({});
    await h.ctx.setup.close ();
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
});

test ('accounts page security: every rule of the setup form holds — token, Host, Origin, nonce, content type, cookie, expiry', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    const origin = 'http://127.0.0.1:' + session.port;
    const before = fs.readFileSync (h.configFile, 'utf8');
    const removal = { 'name': 'main', 'confirm': true };
    const bodies: Record<string, any> = { 'remove': removal, 'permissions': { 'name': 'main', 'trading': false }, 'close': {} };
    // wrong token
    const wrongToken = session.token.replace (/^./, (c) => ((c === '0') ? '1' : '0'));
    for (const action of [ '', '/accounts', '/wizard', '/remove', '/permissions', '/close' ]) {
        for (const method of [ 'GET', 'POST' ]) {
            const response = await raw (origin + '/setup/' + wrongToken + action, { method, 'headers': (method === 'POST') ? { 'Content-Type': 'application/json', 'Origin': origin, 'X-Setup-Nonce': session.nonce } : {}, 'body': (method === 'POST') ? JSON.stringify (removal) : undefined });
            assert.equal (response.status, 404, method + ' ' + action);
            assert.equal (response.text, '');
        }
    }
    // Host (DNS rebinding)
    for (const host of [ 'evil.example:' + session.port, '127.0.0.1', '127.0.0.1.evil.example:' + session.port ]) {
        assert.equal ((await raw (session.url, { 'headers': { 'Host': host } })).status, 404, host);
        assert.equal ((await raw (session.url + '/accounts', { 'headers': { 'Host': host } })).status, 404, host);
        assert.equal ((await post (session, 'remove', removal, { 'Host': host, 'Origin': 'http://' + host })).status, 404, host);
    }
    // Origin, fetch metadata, content type, nonce — on every write of the page
    const cases: [ string, Record<string, string | undefined>, number ][] = [
        [ 'missing Origin', { 'Origin': undefined }, 403 ],
        [ 'foreign Origin', { 'Origin': 'https://evil.example' }, 403 ],
        [ 'null Origin', { 'Origin': 'null' }, 403 ],
        [ 'localhost Origin on a 127.0.0.1 page', { 'Origin': 'http://localhost:' + session.port }, 403 ],
        [ 'cross-site fetch metadata', { 'Sec-Fetch-Site': 'cross-site' }, 403 ],
        [ 'form content type', { 'Content-Type': 'application/x-www-form-urlencoded' }, 415 ],
        [ 'no content type', { 'Content-Type': undefined }, 415 ],
        [ 'missing nonce', { 'X-Setup-Nonce': undefined }, 403 ],
        [ 'wrong nonce', { 'X-Setup-Nonce': '0'.repeat (32) }, 403 ],
        [ 'the token is not the nonce', { 'X-Setup-Nonce': session.token }, 403 ],
    ];
    for (const action of Object.keys (bodies)) {
        for (const [ label, overrides, status ] of cases) {
            assert.equal ((await post (session, action, bodies[action], overrides)).status, status, action + ': ' + label);
        }
        for (const method of [ 'GET', 'PUT', 'DELETE' ]) {
            const response = await post (session, action, (method === 'GET') ? '' : bodies[action], {}, method);
            assert.equal (response.status, 405, method + ' ' + action);
            assert.equal (response.headers['allow'], 'POST');
        }
        assert.equal ((await post (session, action, '{not json')).status, 400);
        // cookie binding: the right URL, Origin and nonce without the browser's cookie
        const stranger = await post (session, action, bodies[action], {}, 'POST', false);
        assert.equal (stranger.status, 404, action);
        assert.equal (stranger.text, '');
    }
    for (const read of [ '', '/accounts', '/wizard', '/credentials?exchange=fakex' ]) {
        assert.equal ((await raw (session.url + read, { 'cookie': false })).status, 404, 'no cookie: ' + read);
        assert.equal ((await raw (session.url + read, { 'cookie': false, 'headers': { 'Cookie': 'ccxt_setup=' + session.token } })).status, 404);
    }
    assert.equal ((await raw (session.url + '/accounts', { 'method': 'POST' })).status, 405);
    assert.equal ((await raw (session.url + '/wizard', { 'method': 'POST' })).status, 405);
    assert.equal ((await raw (session.url + '/unknown')).status, 404);
    assert.equal ((await post (session, 'remove', JSON.stringify ({ ...removal, 'padding': 'x'.repeat (MAX_BODY_BYTES) }))).status, 413);
    // none of that changed anything or cost the session anything
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), before);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), [ 'main', 'real', 'envacct' ]);
    assert.equal (h.ctx.setup.hasLiveSession (), true);
    assert.match (session.cookie, /^ccxt_setup=[0-9a-f]{32}$/);
    // expiry: fixed, not extended by the activity above
    h.clock.now += SESSION_TTL_MS - 1;
    assert.equal ((await raw (session.url + '/accounts')).status, 200);
    h.clock.now += 1;
    const expired = await post (session, 'remove', removal);
    assert.equal (expired.status, 404);
    assert.equal (expired.text, '');
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), before);
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
});

test ('accounts page security: the launch file, the first-load binding and the two page kinds stay apart', async () => {
    const h = await manageHarness ();
    const unloaded = await manage (h, {}, { 'load': false });
    assert.equal (path.basename (unloaded.launchFile), 'open.html');
    if (posix) {
        assert.equal (fs.statSync (unloaded.launchFile).mode & 0o777, 0o600);
    }
    // nothing but the page before a browser is bound
    assert.equal ((await raw (unloaded.url + '/accounts')).status, 404);
    assert.equal ((await raw (unloaded.url + '/wizard')).status, 404);
    const first = await raw (unloaded.url);
    assert.equal (first.status, 200);
    assert.match (String ((first.headers['set-cookie'] ?? [])[0]), /^ccxt_setup=[0-9a-f]{32}; HttpOnly; SameSite=Lax; Path=\/setup\/[0-9a-f]{32}$/);
    assert.deepEqual (fs.readdirSync (h.launchRoot), [], 'the launch file went with the first page load');
    assert.equal ((await raw (unloaded.url, { 'cookie': false })).status, 404, 'the URL alone now opens nothing');
    await h.ctx.setup.close ();
    // a SETUP session knows nothing of the account list or of changing accounts
    const h2 = await manageHarness ();
    const form = await h2.open ({});
    for (const read of [ '/accounts', '/wizard', '/wizard?account=main' ]) {
        const response = await raw (form.url + read);
        assert.equal (response.status, 404, read);
        assert.equal (response.text, '');
    }
    for (const [ action, body ] of [ [ 'remove', { 'name': 'main', 'confirm': true } ], [ 'permissions', { 'name': 'main', 'trading': false } ], [ 'close', {} ] ] as [ string, any ][]) {
        const response = await post (form, action, body);
        assert.equal (response.status, 404, action);
        assert.equal (response.text, '');
    }
    assert.deepEqual (fileOf (h2), manageFile ());
    assert.equal (bootOf ((await raw (form.url)).text).accounts, undefined, 'the setup form is told nothing about existing accounts');
    // a page the user has open is not replaced by the other tool
    const blocked = await manage (h2);
    assert.deepEqual ([ blocked.envelope.data.opened, blocked.envelope.data.alreadyOpen, blocked.envelope.data.openPage ], [ false, true, 'setup' ]);
    assert.match (blocked.envelope.meta.notice, /setup form from an earlier setup_account call is still open/);
    assert.equal (h2.launches.length, 1);
    assert.match ((await raw (form.url)).text, /<title>Connect an exchange account/);
    const restarted = await manage (h2, { 'restart': true });
    assert.equal (restarted.envelope.data.opened, true);
    assert.equal ((await raw (form.url)).status, 404, 'restart retires the form completely');
    assert.match ((await raw (restarted.url)).text, /<title>Your accounts/);
    const other = await h2.open ({ 'exchange': 'fakex' });
    assert.deepEqual ([ other.envelope.data.opened, other.envelope.data.openPage ], [ false, 'accounts' ]);
    assert.match (other.envelope.meta.notice, /press "Add another account" there/);
    const again = await manage (h2);
    assert.deepEqual ([ again.envelope.data.opened, again.envelope.data.openPage ], [ false, 'accounts' ]);
    assert.equal (h2.launches.length, 2);
    for (const text of [ blocked.text, other.text, again.text ]) {
        assert.ok (!text.includes (restarted.token) && !/127\.0\.0\.1:\d|\/setup\//.test (text));
    }
});
