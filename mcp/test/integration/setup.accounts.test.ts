import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { redact } from '../../ts/redact.js';
import { KEY, MKEY, MSECRET, OKEY, OSECRET, SECRET, assertOnlyLastFour, bootOf, call, fileOf, harness, journalText, manage, manageFile, manageHarness, posix, post, raw, refused, saveBody } from '../helpers/setup-form.js';

// "Your accounts" (manage_accounts): the second page on the same session machinery — what it
// lists (never a secret), removing an account, changing its permissions, and the lifetime of
// its session.

test ('manage_accounts opens the accounts page and tells the model nothing that identifies it', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    assert.equal (session.envelope.ok, true);
    assert.equal (session.envelope.data.opened, true);
    assert.equal (session.envelope.data.expiresInSeconds, 600);
    assert.match (session.envelope.meta.notice, /Do NOT ask them to paste or type any key/);
    assert.match (session.url, /^http:\/\/127\.0\.0\.1:\d+\/setup\/[0-9a-f]{32}$/);
    for (const haystack of [ session.text, h.stderr () ]) {
        assert.ok (!haystack.includes (session.token) && !haystack.includes (session.nonce), 'token or nonce leaked');
        assert.ok (!/127\.0\.0\.1:\d|\/setup\//.test (haystack), 'URL leaked');
        assertOnlyLastFour (haystack, 'tool result / log', [], [ MKEY, MSECRET, OKEY, OSECRET ]);
    }
    assert.match (h.stderr (), /accounts page opened in the browser/);
    const tools = (await h.client.listTools ()).tools as any[];
    const tool = tools.find ((entry) => entry.name === 'manage_accounts');
    assert.deepEqual (tool.annotations, { 'readOnlyHint': false, 'destructiveHint': false, 'idempotentHint': false, 'openWorldHint': false });
    assert.deepEqual (Object.keys (tool.inputSchema.properties), [ 'restart' ]);
    // hosts pass tool definitions to the model under a size budget
    for (const name of [ 'manage_accounts', 'setup_account' ]) {
        assert.ok (tools.find ((entry) => entry.name === name).description.length <= 350, name + ' description must stay short');
    }
});

test ('accounts page: same strict headers as the form; lists names, modes and the last 4 of the API key — nothing else of any key', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    const page = await raw (session.url);
    assert.equal (page.status, 200);
    const csp = String (page.headers['content-security-policy']);
    assert.match (csp, /^default-src 'none'; script-src 'nonce-[A-Za-z0-9+/=]+'; style-src 'nonce-[A-Za-z0-9+/=]+'; connect-src 'self'; img-src data:; form-action 'none'; base-uri 'none'; frame-ancestors 'none'$/);
    assert.equal (page.headers['x-frame-options'], 'DENY');
    assert.equal (page.headers['cache-control'], 'no-store');
    assert.equal (page.headers['referrer-policy'], 'no-referrer');
    assert.match (page.text, /<title>Your accounts/);
    assert.ok (!/\son[a-z]+="|style="/.test (page.text), 'no inline handlers or style attributes');
    assert.ok (!/<(script|link|img|iframe)[^>]+(src|href)="(https?:)?\/\//.test (page.text), 'no external assets');
    assert.ok (!page.text.includes ('__CSP_NONCE__') && !page.text.includes ('__BOOT_JSON__') && !page.text.includes ('@include'));
    const boot = bootOf (page.text);
    assert.equal (boot.configPath, h.configFile);
    const byName = Object.fromEntries (boot.accounts.map ((entry: any) => [ entry.name, entry ]));
    assert.deepEqual (Object.keys (byName), [ 'main', 'real', 'envacct' ]);
    assert.deepEqual (byName['main'], {
        'name': 'main', 'exchange': 'fakex', 'exchangeName': 'Fakex', 'prediction': false, 'environment': 'sandbox', 'sandboxIsDemo': false, 'trading': true,
        'funds': false, 'implicitWrites': false, 'credentials': [ 'API key', 'API secret' ], 'keyEnding': MKEY.slice (-4),
        'source': 'file', 'loaded': true, 'canRemove': true, 'canEditPermissions': true, 'canReplace': true,
    });
    assert.deepEqual ([ byName['real'].environment, byName['real'].trading, byName['real'].funds, byName['real'].implicitWrites, byName['real'].keyEnding ], [ 'live', false, true, true, OKEY.slice (-4) ]);
    // an account the file does not hold is shown, read-only
    assert.deepEqual ([ byName['envacct'].source, byName['envacct'].canRemove, byName['envacct'].canEditPermissions, byName['envacct'].canReplace ], [ 'environment', false, false, false ]);
    const listed = await raw (session.url + '/accounts');
    assert.deepEqual (JSON.parse (listed.text).accounts, boot.accounts);
    for (const response of [ page, listed ]) {
        assertOnlyLastFour (response.text, 'accounts page', [ MKEY, OKEY, 'Ev5Nb2Qc8Xd1Wm6Lz3Kp' ], [ MSECRET, OSECRET, 'Ty9Uh4Gi7Fo2Aj5Sl8Dq' ]);
        assert.ok (!/"(secret|password|privateKey|apiKey)"\s*:/.test (response.text), 'no credential field is ever serialised');
        for (const header of Object.keys (response.headers)) {
            assert.ok (!header.startsWith ('access-control-'));
        }
    }
    // a key too short to show four characters of shows none
    const short = await harness ({ 'configText': JSON.stringify ({ 'accounts': { 's': { 'exchange': 'fakex', 'apiKey': 'Sh0rtKey9' } } }), 'accounts': { 's': { 'apiKey': 'Sh0rtKey9' } } });
    const shortBoot = bootOf ((await raw ((await manage (short)).url)).text);
    assert.equal (shortBoot.accounts[0].keyEnding, undefined);
});

test ('remove: needs the explicit confirm, takes the account out of the file and the running server, and touches nothing else', async () => {
    const stale = [
        'account "main": "trading": true only enables SANDBOX/DEMO trading, but this account is live',
        'env/.mcpb-form account "main" (fakex) is shadowed by a config-file account of the same name — the config-file account is used; rename one to keep both',
        'WARNING: config file /somewhere/config.json is readable by other users — run: chmod 600 "/somewhere/config.json"',
    ];
    const kept = [ 'account "real": "funds": "live" requires a "maxTransferValue"', 'settings invalid: maxResults Expected number, received string' ];
    const h = await manageHarness ({ 'problems': [ ...stale, ...kept ] });
    const { registerAccountSecrets } = await import ('../../ts/config.js');
    for (const account of Object.values (h.ctx.config.accounts)) {
        registerAccountSecrets (account as any);
    }
    const subscribe = (account: string | undefined) => call (h.client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTicker', 'symbol': 'BTC/USDT', ...(account ? { account } : {}) });
    const mine = await subscribe ('main');
    const others = await subscribe ('real');
    const publicStream = await subscribe (undefined);
    const cachedMain = (await h.ctx.pools.getAuthenticated ('main')).exchange;
    const cachedReal = (await h.ctx.pools.getAuthenticated ('real')).exchange;
    const session = await manage (h);
    const before = fs.readFileSync (h.configFile, 'utf8');
    const responses: string[] = [];
    // refusals: each leaves the file byte-for-byte and the server as it was
    for (const [ body, status, code ] of [
        [ { 'name': 'main' }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'confirm': false }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'confirm': 'yes' }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'confirm': true, 'also': 'real' }, 400, 'BAD_REQUEST' ],
        [ { 'name': [ 'main' ], 'confirm': true }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'nope', 'confirm': true }, 400, 'UNKNOWN_ACCOUNT' ],
        [ { 'name': '__proto__', 'confirm': true }, 400, 'UNKNOWN_ACCOUNT' ],
        [ { 'name': 'settings', 'confirm': true }, 400, 'UNKNOWN_ACCOUNT' ],
        [ { 'name': 'toString', 'confirm': true }, 400, 'UNKNOWN_ACCOUNT' ],
        // defined outside the file: shown, never removable here
        [ { 'name': 'envacct', 'confirm': true }, 409, 'NOT_IN_FILE' ],
    ] as [ any, number, string ][]) {
        const response = await post (session, 'remove', body);
        responses.push (response.text);
        assert.equal (response.status, status, JSON.stringify (body));
        assert.equal (JSON.parse (response.text).code, code, JSON.stringify (body));
    }
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), before);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), [ 'main', 'real', 'envacct' ]);
    assert.ok (!cachedMain.closed);
    // the removal
    const removed = await post (session, 'remove', { 'name': 'main', 'confirm': true });
    responses.push (removed.text);
    assert.equal (removed.status, 200);
    const result = JSON.parse (removed.text);
    assert.deepEqual ([ result.ok, result.removed, result.stoppedStreams, result.returnsOnRestart ], [ true, 'main', 1, true ]);
    assert.deepEqual (result.accounts.map ((entry: any) => entry.name), [ 'real', 'envacct' ]);
    const expected: any = manageFile ();
    delete expected.accounts.main;
    assert.deepEqual (fileOf (h), expected, 'only that account is gone: other accounts, settings and unknown keys are as they were');
    assert.match (fs.readFileSync (h.configFile, 'utf8'), /^\{\n  "accounts"/, 'the file keeps its own indentation');
    if (posix) {
        assert.equal (fs.statSync (h.configFile).mode & 0o777, 0o600);
    }
    assert.deepEqual (fs.readdirSync (path.dirname (h.configFile)), [ 'config.json' ], 'no temp file left behind');
    // hot-applied: gone from the running server, its stream stopped, its client closed
    assert.deepEqual (Object.keys (h.ctx.config.accounts), [ 'real', 'envacct' ]);
    assert.equal ((await call (h.client, 'get_balance', { 'account': 'main' })).error.code, 'UNKNOWN_ACCOUNT');
    assert.equal (cachedMain.closed, true);
    const streams = (await call (h.client, 'watch_list', {})).data.map ((entry: any) => entry.subscriptionId).sort ();
    assert.deepEqual (streams, [ others.data.subscriptionId, publicStream.data.subscriptionId ].sort ());
    assert.ok (mine.ok);
    // the other account on the same exchange is untouched: same client, still redacted
    assert.equal ((await h.ctx.pools.getAuthenticated ('real')).exchange, cachedReal);
    assert.ok (!cachedReal.closed);
    assert.equal (redact (OKEY + ' ' + OSECRET), '[redacted:apiKey] [redacted:secret]');
    // …and the removed account's values are forgotten once the response is out
    assert.equal (redact (MKEY + ' ' + MSECRET), MKEY + ' ' + MSECRET);
    assert.deepEqual ((await call (h.client, 'get_safety_status', {})).data.configProblems, kept);
    // recorded as names and modes; the session goes on
    const journal = journalText (h.journalDir);
    assert.match (journal, /"tool":"manage_accounts","method":"removeAccount"/);
    assert.match (journal, /"wasInUse":true,"stoppedStreams":1,"returnsOnRestart":true/);
    assert.match (h.stderr (), /account "main" on fakex removed via the accounts page — stopped 1 live stream/);
    assert.equal (h.ctx.setup.hasLiveSession (), true, 'an accounts session is not used up by an action');
    assert.equal (JSON.parse ((await post (session, 'remove', { 'name': 'main', 'confirm': true })).text).code, 'UNKNOWN_ACCOUNT', 'a second removal finds nothing');
    for (const haystack of [ ...responses, journal, h.stderr () ]) {
        assertOnlyLastFour (haystack, 'remove', [ MKEY, OKEY ], [ MSECRET, OSECRET, session.token, session.nonce ]);
    }
    await h.ctx.subscriptions.closeAll ();
});

test ('remove: a credential another account still uses stays redactable', async () => {
    const shared = { 'exchange': 'fakex', 'apiKey': MKEY, 'secret': MSECRET };
    const h = await harness ({ 'configText': JSON.stringify ({ 'accounts': { 'a': shared, 'b': { ...shared, 'sandbox': true } } }), 'accounts': { 'a': { ...shared }, 'b': { ...shared, 'sandbox': true } } });
    const { registerAccountSecrets } = await import ('../../ts/config.js');
    registerAccountSecrets (h.ctx.config.accounts['a']);
    const session = await manage (h);
    assert.equal ((await post (session, 'remove', { 'name': 'a', 'confirm': true })).status, 200);
    assert.equal (redact (MKEY + ' ' + MSECRET), '[redacted:apiKey] [redacted:secret]');
    assert.equal ((await post (session, 'remove', { 'name': 'b', 'confirm': true })).status, 200);
    assert.equal (redact (MKEY + ' ' + MSECRET), MKEY + ' ' + MSECRET);
    assert.deepEqual (fileOf (h), { 'accounts': {} });
});

test ('permissions: off needs nothing, practice needs nothing, LIVE needs the cap and the confirmation — and only "trading" is edited', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    const before = fs.readFileSync (h.configFile, 'utf8');
    const responses: string[] = [];
    const cachedReal = (await h.ctx.pools.getAuthenticated ('real')).exchange;
    for (const [ body, status, code ] of [
        // live: exactly the two conditions of the setup form
        [ { 'name': 'real', 'trading': true }, 400, 'CAP_REQUIRED' ],
        [ { 'name': 'real', 'trading': true, 'maxOrderValue': 0, 'liveConfirmed': true }, 400, 'CAP_REQUIRED' ],
        [ { 'name': 'real', 'trading': true, 'maxOrderValue': -1, 'liveConfirmed': true }, 400, 'CAP_REQUIRED' ],
        [ { 'name': 'real', 'trading': true, 'maxOrderValue': 25 }, 400, 'CONFIRM_REQUIRED' ],
        [ { 'name': 'real', 'trading': true, 'maxOrderValue': 25, 'liveConfirmed': false }, 400, 'CONFIRM_REQUIRED' ],
        // the tiers and fields this page does not own cannot be smuggled in
        [ { 'name': 'real', 'trading': 'live', 'maxOrderValue': 25, 'liveConfirmed': true }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'real', 'trading': false, 'funds': false }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'trading': true, 'funds': 'live', 'maxTransferValue': 1000 }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'trading': true, 'implicitWrites': true }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'trading': true, 'sandbox': false }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'trading': true, 'environment': 'live' }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main' }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'nope', 'trading': false }, 400, 'UNKNOWN_ACCOUNT' ],
        [ { 'name': 'envacct', 'trading': true }, 409, 'NOT_IN_FILE' ],
    ] as [ any, number, string ][]) {
        const response = await post (session, 'permissions', body);
        responses.push (response.text);
        assert.equal (response.status, status, JSON.stringify (body));
        assert.equal (JSON.parse (response.text).code, code, JSON.stringify (body));
    }
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), before, 'a refused change writes nothing');
    assert.deepEqual ([ h.ctx.config.accounts['real'].trading, h.ctx.config.accounts['main'].trading ], [ undefined, true ]);
    // practice account: off without any confirmation, then on again
    let response = await post (session, 'permissions', { 'name': 'main', 'trading': false });
    responses.push (response.text);
    assert.equal (response.status, 200);
    assert.deepEqual ([ JSON.parse (response.text).trading, JSON.parse (response.text).accounts[0].trading ], [ false, false ]);
    let expected: any = manageFile ();
    delete expected.accounts.main.trading;
    assert.deepEqual (fileOf (h), expected);
    assert.equal ((await call (h.client, 'create_order', { 'account': 'main', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'price': 10000 })).error.code, 'TIER_DISABLED', 'hot-applied: orders are refused at once');
    response = await post (session, 'permissions', { 'name': 'main', 'trading': true });
    assert.equal (response.status, 200);
    assert.deepEqual (fileOf (h), manageFile ());
    assert.equal ((await call (h.client, 'list_accounts', {})).data.find ((entry: any) => entry.name === 'main').trading, true);
    // live account: with the cap and the yes
    response = await post (session, 'permissions', { 'name': 'real', 'trading': true, 'maxOrderValue': 40, 'liveConfirmed': true });
    responses.push (response.text);
    assert.equal (response.status, 200);
    expected = manageFile ();
    // funds, its cap, implicitWrites and everything else in the record are exactly as they were
    expected.accounts.real = { ...expected.accounts.real, 'trading': 'live', 'maxOrderValue': 40, 'confirm': 'always' };
    assert.deepEqual (fileOf (h), expected);
    assert.deepEqual (Object.keys (fileOf (h).accounts.real), [ 'exchange', 'apiKey', 'secret', 'funds', 'maxTransferValue', 'implicitWrites', 'options', 'trading', 'maxOrderValue', 'confirm' ]);
    const real = (await call (h.client, 'list_accounts', {})).data.find ((entry: any) => entry.name === 'real');
    assert.deepEqual ([ real.environment, real.trading, real.maxOrderValue, real.confirm, real.funds, real.implicitWrites, real.maxTransferValue ], [ 'live', 'live', 40, 'always', 'live', true, 5 ]);
    assert.equal ((await h.ctx.pools.getAuthenticated ('real')).exchange, cachedReal, 'same keys, same environment: the client is kept');
    // off again: no confirmation, and the funds tier is still not touched
    response = await post (session, 'permissions', { 'name': 'real', 'trading': false });
    assert.equal (response.status, 200);
    assert.deepEqual ([ fileOf (h).accounts.real.trading, fileOf (h).accounts.real.funds, fileOf (h).accounts.real.implicitWrites ], [ undefined, 'live', true ]);
    assert.deepEqual ([ h.ctx.config.accounts['real'].trading, h.ctx.config.accounts['real'].funds, h.ctx.config.accounts['real'].implicitWrites ], [ false, 'live', true ]);
    const journal = journalText (h.journalDir);
    assert.match (journal, /"tool":"manage_accounts","method":"setPermissions","outcome":\{"source":"accounts page","trading":"live","maxOrderValue":40,"previousTrading":false\}/);
    assert.match (h.stderr (), /account "real" on fakex changed via the accounts page: now LIVE trading, max order 40 USD \(live\)/);
    assert.match (h.stderr (), /account "main" on fakex changed via the accounts page: now read-only \(sandbox\)/);
    for (const haystack of [ ...responses, journal, h.stderr () ]) {
        assertOnlyLastFour (haystack, 'permissions', [ MKEY, OKEY ], [ MSECRET, OSECRET, session.token, session.nonce ]);
    }
});

test ('permissions: a file edited by hand since startup is never reconciled by guessing', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    // on disk "real" became a testnet account; the running server still has it as live
    const edited: any = manageFile ();
    edited.accounts.real.sandbox = true;
    edited.accounts.later = { 'exchange': 'fakex', 'apiKey': 'Lt8Rk3Vn6Bm1Xz4Qc7Wd', 'secret': 'Gy5Hu2Ji9Ko4Lp7Ma1Nb' };
    fs.writeFileSync (h.configFile, JSON.stringify (edited));
    const before = fs.readFileSync (h.configFile, 'utf8');
    let response = await post (session, 'permissions', { 'name': 'real', 'trading': true });
    assert.deepEqual ([ response.status, JSON.parse (response.text).code ], [ 409, 'OUT_OF_SYNC' ]);
    // an account added by hand is listed as not in use; it can be removed, not switched
    const listed = JSON.parse ((await raw (session.url + '/accounts')).text).accounts.find ((entry: any) => entry.name === 'later');
    assert.deepEqual ([ listed.source, listed.loaded, listed.canRemove, listed.canEditPermissions, listed.keyEnding ], [ 'file', false, true, false, 'c7Wd' ]);
    response = await post (session, 'permissions', { 'name': 'later', 'trading': false });
    assert.deepEqual ([ response.status, JSON.parse (response.text).code ], [ 409, 'NOT_LOADED' ]);
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), before);
    assert.equal (h.ctx.config.accounts['real'].trading, undefined);
    response = await post (session, 'remove', { 'name': 'later', 'confirm': true });
    assert.equal (response.status, 200);
    assert.equal (fileOf (h).accounts.later, undefined);
    assert.match (journalText (h.journalDir), /"wasInUse":false/);
    // a file that is not valid JSON: everything is listed read-only, nothing is written
    const broken = '{"accounts": {"main": {"exchange": "fakex",}}}';
    fs.writeFileSync (h.configFile, broken);
    const list = JSON.parse ((await raw (session.url + '/accounts')).text);
    assert.match (list.fileProblem, /not valid JSON/);
    assert.ok (list.accounts.every ((entry: any) => !entry.canRemove && !entry.canEditPermissions && !entry.canReplace));
    for (const [ action, body ] of [ [ 'remove', { 'name': 'main', 'confirm': true } ], [ 'permissions', { 'name': 'main', 'trading': false } ] ] as [ string, any ][]) {
        response = await post (session, action, body);
        assert.deepEqual ([ response.status, JSON.parse (response.text).code ], [ 400, 'INVALID_JSON' ], action);
    }
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), broken);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), [ 'main', 'real', 'envacct' ]);
});

test ('legacy {"<exchangeId>": ...} file: listed, edited and removed in its own shape', async () => {
    const legacy = { 'fakex': { 'apiKey': MKEY, 'secret': MSECRET, 'sandbox': true, 'funds': true }, 'settings': { 'maxResults': 9 }, 'comment': 'kept' };
    const h = await harness ({ 'configText': JSON.stringify (legacy), 'accounts': { 'fakex': { ...legacy.fakex } } });
    const session = await manage (h);
    const entry = bootOf ((await raw (session.url)).text).accounts[0];
    assert.deepEqual ([ entry.name, entry.exchange, entry.source, entry.canRemove, entry.keyEnding, entry.funds ], [ 'fakex', 'fakex', 'file', true, MKEY.slice (-4), true ]);
    assert.equal ((await post (session, 'permissions', { 'name': 'fakex', 'trading': true })).status, 200);
    // still the legacy shape: no "accounts" key, no "exchange" repeated inside, funds untouched
    assert.deepEqual (fileOf (h), { ...legacy, 'fakex': { ...legacy.fakex, 'trading': true } });
    assert.deepEqual ([ h.ctx.config.accounts['fakex'].trading, h.ctx.config.accounts['fakex'].funds ], [ true, true ]);
    // "settings" and "comment" are not accounts in this shape either
    assert.equal (JSON.parse ((await post (session, 'remove', { 'name': 'comment', 'confirm': true })).text).code, 'UNKNOWN_ACCOUNT');
    assert.equal ((await post (session, 'remove', { 'name': 'fakex', 'confirm': true })).status, 200);
    assert.deepEqual (fileOf (h), { 'settings': legacy.settings, 'comment': 'kept' });
    assert.deepEqual (Object.keys (h.ctx.config.accounts), []);
});

test ('session lifetime: an accounts session outlives its actions and the form reached from it; "Done" ends it', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    // "Add another account": the same step-by-step form, with no account's details in it
    const add = await raw (session.url + '/wizard');
    assert.equal (add.status, 200);
    assert.match (add.text, /<title>Connect an exchange account/);
    const addBoot = bootOf (add.text);
    assert.deepEqual ([ addBoot.page, addBoot.prefill, addBoot.replace, addBoot.csrf ], [ 'accounts', { 'exchange': '', 'account': '', 'environment': 'sandbox' }, undefined, session.nonce ]);
    // "Replace key": prefilled with name, exchange and environment — never a credential
    const replace = await raw (session.url + '/wizard?account=real');
    const replaceBoot = bootOf (replace.text);
    assert.deepEqual (replaceBoot.prefill, { 'exchange': 'fakex', 'account': 'real', 'environment': 'live' });
    assert.deepEqual (replaceBoot.replace, { 'prediction': false, 'trading': false });
    assertOnlyLastFour (replace.text, 'replace form', [], [ MKEY, MSECRET, OKEY, OSECRET ]);
    // an account the file does not hold, or no such account: an ordinary empty form
    for (const name of [ 'envacct', 'nope', '__proto__' ]) {
        assert.equal (bootOf ((await raw (session.url + '/wizard?account=' + name)).text).replace, undefined, name);
    }
    // the existing replace flow: explicit replace, a fresh record (funds is NOT carried over)
    assert.equal (JSON.parse ((await post (session, 'save', saveBody ({ 'name': 'real', 'environment': 'live' }))).text).code, 'ACCOUNT_EXISTS');
    const saved = JSON.parse ((await post (session, 'save', saveBody ({ 'name': 'real', 'environment': 'live', 'replace': true }))).text);
    assert.deepEqual ([ saved.ok, saved.replaced, saved.returnTo ], [ true, true, 'accounts' ]);
    assert.deepEqual (fileOf (h).accounts.real, { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET });
    assert.match (journalText (h.journalDir), /"tool":"manage_accounts","method":"saveAccount","outcome":\{"source":"accounts page"/);
    assert.match (h.stderr (), /account "real" on fakex saved via the accounts page/);
    // the save did not end the session: the list is still there and shows the new key
    assert.equal (h.ctx.setup.hasLiveSession (), true);
    const list = JSON.parse ((await raw (session.url + '/accounts')).text).accounts;
    assert.equal (list.find ((entry: any) => entry.name === 'real').keyEnding, KEY.slice (-4));
    assert.equal ((await post (session, 'permissions', { 'name': 'main', 'trading': false })).status, 200);
    // "Done"
    const closed = await post (session, 'close', {});
    assert.deepEqual (JSON.parse (closed.text), { 'ok': true, 'closed': true });
    assert.equal (h.ctx.setup.hasLiveSession (), false);
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
    assert.match (h.stderr (), /accounts page closed by the user/);
});

test ('hideDisabledTools: switching order placement on from the accounts page lists the trading tools', async () => {
    const file = { 'accounts': { 'main': { 'exchange': 'fakex', 'apiKey': MKEY, 'secret': MSECRET, 'sandbox': true } } };
    const h = await harness ({ 'configText': JSON.stringify (file), 'accounts': { 'main': { ...file.accounts.main } }, 'settings': { 'hideDisabledTools': true } });
    const names = async () => (await h.client.listTools ()).tools.map ((tool: any) => tool.name);
    assert.ok ((await names ()).includes ('manage_accounts') && !(await names ()).includes ('create_order'));
    const session = await manage (h);
    const result = JSON.parse ((await post (session, 'permissions', { 'name': 'main', 'trading': true })).text);
    assert.deepEqual ([ result.toolsAdded, result.restartForTools ], [ true, false ]);
    assert.ok ((await names ()).includes ('create_order'));
    assert.ok (!(await names ()).includes ('withdraw'));
});
