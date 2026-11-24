import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { ToolListChangedNotificationSchema } from '@modelcontextprotocol/sdk/types.js';
import { redact } from '../../ts/redact.js';
import { FakeExchange } from '../helpers/fake-ccxt.js';
import { AuthenticationError, HangingExchange, KEY, RejectingExchange, SECRET, call, harness, journalText, posix, post, raw, refused, saveBody } from '../helpers/setup-form.js';

// setup_account end to end, behind the checks: the connection test, the save into the config
// file, what the server enforces about live trading, and the hot-apply into the running
// server (clients, streams, confirm tokens, tool tiers, redaction).

test ('setup_account validates its prefill arguments', async () => {
    const h = await harness ();
    const unknown = await h.open ({ 'exchange': 'nope' });
    assert.equal (unknown.envelope.error.code, 'UNKNOWN_EXCHANGE');
    const badName = await h.open ({ 'account': 'has space' });
    assert.equal (badName.envelope.error.code, 'BAD_REQUEST');
    assert.equal (h.launches.length, 0, 'nothing was opened');
    assert.equal (h.ctx.setup.isListening (), false);
});

test ('happy path (sandbox): test, save, private file, hot-applied without a restart, session dead', async () => {
    const h = await harness ();
    assert.equal ((await call (h.client, 'list_accounts', {})).data.length, 0);
    assert.equal ((await call (h.client, 'get_balance', { 'account': 'main' })).error.code, 'UNKNOWN_ACCOUNT');
    const session = await h.open ({ 'exchange': 'fakex' });
    const tested = await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox' });
    assert.deepEqual (JSON.parse (tested.text), { 'ok': true, 'tested': true });
    assert.equal (fs.existsSync (h.configFile), false, 'a test saves nothing');
    const saved = await post (session, 'save', saveBody ({ 'trading': true }));
    assert.equal (saved.status, 200);
    assert.deepEqual (JSON.parse (saved.text), { 'ok': true, 'account': 'main', 'exchange': 'fakex', 'environment': 'sandbox', 'trading': true, 'replaced': false, 'stoppedStreams': 0, 'toolsAdded': false, 'restartForTools': false });
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8')), { 'accounts': { 'main': { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET, 'sandbox': true, 'trading': true } } });
    if (posix) {
        assert.equal (fs.statSync (h.configFile).mode & 0o777, 0o600);
        assert.equal (fs.statSync (path.dirname (h.configFile)).mode & 0o777, 0o700);
    }
    // hot-apply: the same running server now knows the account
    const accounts = await call (h.client, 'list_accounts', {});
    assert.equal (accounts.data.length, 1);
    assert.equal (accounts.data[0].name, 'main');
    assert.equal (accounts.data[0].environment, 'sandbox');
    assert.equal (accounts.data[0].trading, true);
    assert.deepEqual (accounts.data[0].credentials, [ 'apiKey', 'secret' ]);
    const balance = await call (h.client, 'get_balance', { 'account': 'main' });
    assert.equal (balance.ok, true);
    const { exchange } = await h.ctx.pools.getAuthenticated ('main');
    assert.equal (exchange.config.apiKey, KEY);
    assert.equal (exchange.sandboxMode, true);
    assert.equal ((await call (h.client, 'get_safety_status', {})).data.configPath, h.configFile);
    // single use: the session and its listener are gone
    assert.equal (h.ctx.setup.hasLiveSession (), false);
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
    // what was recorded: names and modes, never values, never the URL
    const journal = journalText (h.journalDir);
    assert.match (journal, /"tool":"setup_account"/);
    assert.match (h.stderr (), /account "main" on fakex saved via setup form \(sandbox, trading\)/);
    for (const haystack of [ journal, h.stderr (), saved.text, tested.text, JSON.stringify (accounts), JSON.stringify (balance) ]) {
        for (const forbidden of [ KEY, SECRET, session.token, session.nonce ]) {
            assert.ok (!haystack.includes (forbidden), 'leaked: ' + forbidden.slice (0, 8));
        }
    }
});

test ('live trading needs a positive cap and the explicit confirmation — enforced by the server', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const live = { 'environment': 'live', 'trading': true };
    for (const [ extra, code ] of [
        [ { ...live }, 'CAP_REQUIRED' ],
        [ { ...live, 'maxOrderValue': 0, 'liveConfirmed': true }, 'CAP_REQUIRED' ],
        [ { ...live, 'maxOrderValue': -5, 'liveConfirmed': true }, 'CAP_REQUIRED' ],
        [ { ...live, 'maxOrderValue': 25 }, 'CONFIRM_REQUIRED' ],
        [ { ...live, 'maxOrderValue': 25, 'liveConfirmed': false }, 'CONFIRM_REQUIRED' ],
        // the tiers the form does not offer cannot be smuggled in either
        [ { 'funds': 'live', 'maxTransferValue': 1000 }, 'BAD_REQUEST' ],
        [ { 'implicitWrites': true }, 'BAD_REQUEST' ],
        [ { 'trading': 'live' }, 'BAD_REQUEST' ],
        [ { 'environment': 'demo' }, 'NO_DEMO' ],
        [ { 'credentials': { 'apiKey': KEY } }, 'MISSING_CREDENTIALS' ],
        [ { 'credentials': { 'apiKey': KEY, 'secret': SECRET, 'privateKey': 'x'.repeat (20) } }, 'BAD_REQUEST' ],
        [ { 'exchange': 'nope' }, 'UNKNOWN_EXCHANGE' ],
        [ { 'name': '__proto__' }, 'INVALID_NAME' ],
        [ { 'name': 'has space' }, 'INVALID_NAME' ],
    ] as [ any, string ][]) {
        const response = await post (session, 'save', saveBody (extra));
        assert.equal (response.status, 400, JSON.stringify (extra));
        assert.equal (JSON.parse (response.text).code, code, JSON.stringify (extra));
    }
    assert.equal (fs.existsSync (h.configFile), false);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), []);
    assert.equal (h.ctx.setup.hasLiveSession (), true, 'a refused save does not use the session up');
    const saved = await post (session, 'save', saveBody ({ ...live, 'maxOrderValue': 25, 'liveConfirmed': true }));
    assert.equal (saved.status, 200);
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8'))['accounts']['main'], { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET, 'trading': 'live', 'maxOrderValue': 25, 'confirm': 'always' });
    const account = (await call (h.client, 'list_accounts', {})).data[0];
    assert.deepEqual ([ account.environment, account.trading, account.maxOrderValue, account.confirm, account.funds, account.implicitWrites ], [ 'live', 'live', 25, 'always', false, false ]);
    assert.match (h.stderr (), /saved via setup form \(live, LIVE trading, max order 25 USD\)/);
});

test ('live without trading is a plain read-only account (no cap, no confirmation needed)', async () => {
    const h = await harness ();
    const session = await h.open ({});
    assert.equal ((await post (session, 'save', saveBody ({ 'environment': 'live' }))).status, 200);
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8'))['accounts']['main'], { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET });
    assert.equal ((await call (h.client, 'list_accounts', {})).data[0].trading, false);
});

test ('replace flow: an existing name needs an explicit replace, and the cached client is dropped', async () => {
    const before = { 'accounts': { 'main': { 'exchange': 'fakex', 'apiKey': 'OLDKEY-0123456789', 'secret': 'OLDSECRET-0123456789', 'sandbox': true, 'trading': true }, 'other': { 'exchange': 'fakex', 'apiKey': 'OTHERKEY-0123456789', 'secret': 'OTHERSECRET-0123456789' } } };
    const h = await harness ({ 'configText': JSON.stringify (before), 'accounts': { 'main': { ...before.accounts.main }, 'other': { ...before.accounts.other } } });
    const cached = (await h.ctx.pools.getAuthenticated ('main')).exchange;
    assert.equal (cached.config.apiKey, 'OLDKEY-0123456789');
    const session = await h.open ({});
    const conflict = await post (session, 'save', saveBody ());
    assert.equal (conflict.status, 409);
    assert.equal (JSON.parse (conflict.text).code, 'ACCOUNT_EXISTS');
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8')), before);
    assert.equal ((await h.ctx.pools.getAuthenticated ('main')).exchange, cached, 'nothing changed yet');
    const replaced = await post (session, 'save', saveBody ({ 'replace': true }));
    assert.equal (replaced.status, 200);
    assert.equal (JSON.parse (replaced.text).replaced, true);
    const after = JSON.parse (fs.readFileSync (h.configFile, 'utf8'));
    assert.deepEqual (after['accounts']['other'], before.accounts.other);
    assert.deepEqual (after['accounts']['main'], { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET, 'sandbox': true });
    const fresh = (await h.ctx.pools.getAuthenticated ('main')).exchange;
    assert.notEqual (fresh, cached);
    assert.equal (fresh.config.apiKey, KEY);
    assert.equal (cached.closed, true, 'the instance holding the old keys was closed');
    assert.equal ((await call (h.client, 'list_accounts', {})).data.find ((entry: any) => entry.name === 'main').trading, false);
});

// The name survives a replacement, the account does not: a preview the user was shown for
// the old record must not execute on whatever now carries its name.
test ('a confirm token issued before an account is replaced, re-permissioned or removed cannot be redeemed after', async () => {
    const main = { 'exchange': 'fakex', 'apiKey': 'OLDKEY-0123456789', 'secret': 'OLDSECRET-0123456789', 'sandbox': true, 'trading': true, 'confirm': 'always' };
    const other = { 'exchange': 'fakex', 'apiKey': 'OTHERKEY-0123456789', 'secret': 'OTHERSECRET-0123456789', 'sandbox': true, 'trading': true, 'confirm': 'always' };
    const h = await harness ({ 'configText': JSON.stringify ({ 'accounts': { main, other } }), 'accounts': { 'main': { ...main }, 'other': { ...other } } });
    const order = (account: string) => ({ account, 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'price': 10000 });
    const preview = async (account: string): Promise<string> => {
        const envelope = await call (h.client, 'create_order', order (account));
        assert.equal (envelope.meta?.confirmationRequired, true, JSON.stringify (envelope));
        return envelope.meta.confirmToken;
    };
    const redeem = (account: string, confirm: string) => call (h.client, 'create_order', { ...order (account), confirm });
    // the case that matters: previewed on the practice account, then "main" becomes a LIVE
    // account through the setup form. CONFIRM_INVALID (not CONFIRM_MISMATCH, which the
    // payload binding alone would give — see test/unit/safety.test.ts) shows the token
    // itself was withdrawn.
    let token = await preview ('main');
    const untouched = await preview ('other');
    const session = await h.open ({});
    assert.equal ((await post (session, 'save', saveBody ({ 'replace': true, 'environment': 'live', 'trading': true, 'maxOrderValue': 25, 'liveConfirmed': true }))).status, 200);
    assert.equal (h.ctx.config.accounts['main'].trading, 'live');
    assert.equal ((await redeem ('main', token)).error.code, 'CONFIRM_INVALID');
    assert.equal ((await redeem ('other', untouched)).ok, true, 'another account\'s preview is not affected');
    // re-permissioned on the accounts page (off and on again: the end state is the same)
    token = await preview ('other');
    const accountsPage = await h.open ({}, { 'tool': 'manage_accounts' });
    assert.equal ((await post (accountsPage, 'permissions', { 'name': 'other', 'trading': false })).status, 200);
    assert.equal ((await post (accountsPage, 'permissions', { 'name': 'other', 'trading': true })).status, 200);
    assert.equal ((await redeem ('other', token)).error.code, 'CONFIRM_INVALID');
    // removed: the token is gone with it (the Map entry itself, not just the account)
    token = await preview ('other');
    assert.equal ((await post (accountsPage, 'remove', { 'name': 'other', 'confirm': true })).status, 200);
    assert.throws (() => h.ctx.safety.redeemConfirmToken (token, {}), (e: any) => e.code === 'CONFIRM_INVALID');
});

test ('an account that only exists in memory (env-defined) also needs replace before it is shadowed', async () => {
    const h = await harness ({ 'accounts': { 'main': { 'apiKey': 'ENVKEY-0123456789', 'secret': 'ENVSECRET-0123456789' } } });
    const session = await h.open ({});
    assert.equal (JSON.parse ((await post (session, 'save', saveBody ())).text).code, 'ACCOUNT_EXISTS');
    assert.equal (fs.existsSync (h.configFile), false);
    const saved = JSON.parse ((await post (session, 'save', saveBody ({ 'replace': true }))).text);
    assert.equal (saved.ok, true);
    assert.equal (h.ctx.config.accounts['main'].apiKey, KEY);
    // the file never held it, but the running server's account WAS replaced — the page, the
    // log and the journal all say so
    assert.equal (saved.replaced, true);
    assert.match (h.stderr (), /replaced the previous account of that name/);
    assert.match (journalText (h.journalDir), /"replaced":true,"previousEnvironment":"live"/);
});

test ('both config shapes are extended in place; untouched accounts, settings and unknown keys survive', async () => {
    const modern = {
        'accounts': { 'old': { 'exchange': 'fakex', 'apiKey': 'OLDKEY-0123456789', 'funds': 'live', 'maxTransferValue': 5, 'options': { 'a': [ 1, { 'b': null } ] } } },
        'settings': { 'maxResults': 7, 'exchangeOptions': { 'fakex': { 'x': 1 } } },
        'notes': 'mine',
    };
    let h = await harness ({ 'configText': JSON.stringify (modern, null, 2) });
    let session = await h.open ({});
    assert.equal ((await post (session, 'save', saveBody ())).status, 200);
    let after = JSON.parse (fs.readFileSync (h.configFile, 'utf8'));
    assert.deepEqual ({ ...after, 'accounts': { 'old': after.accounts.old } }, modern);
    assert.deepEqual (after.accounts.main, { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET, 'sandbox': true });
    // legacy keys.json shape: {"<exchangeId>": {...}} — here the file already has a non-account key
    const legacy = { 'fakex': { 'apiKey': 'OLDKEY-0123456789', 'secret': 'OLDSECRET-0123456789' }, 'settings': { 'maxResults': 9 }, 'comment': 'kept' };
    h = await harness ({ 'configText': JSON.stringify (legacy) });
    session = await h.open ({});
    const wrongName = await post (session, 'save', saveBody ({ 'name': 'main', 'replace': true }));
    assert.equal (JSON.parse (wrongName.text).code, 'LEGACY_NAME');
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8')), legacy);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), [], 'a refused write applies nothing in memory');
    assert.equal (JSON.parse ((await post (session, 'save', saveBody ({ 'name': 'fakex' }))).text).code, 'ACCOUNT_EXISTS');
    assert.equal ((await post (session, 'save', saveBody ({ 'name': 'fakex', 'replace': true }))).status, 200);
    after = JSON.parse (fs.readFileSync (h.configFile, 'utf8'));
    assert.deepEqual (after, { 'fakex': { 'apiKey': KEY, 'secret': SECRET, 'sandbox': true }, 'settings': legacy.settings, 'comment': 'kept' });
    assert.equal (h.ctx.config.accounts['fakex'].exchange, 'fakex');
});

test ('a config file that is not valid JSON is refused on the page and left byte-for-byte intact', async () => {
    const broken = '{"accounts": {"old": {"exchange": "fakex", "apiKey": "OLDKEY-0123456789",}}}\n';
    const h = await harness ({ 'configText': broken });
    const session = await h.open ({});
    const response = await post (session, 'save', saveBody ());
    assert.equal (response.status, 400);
    const body = JSON.parse (response.text);
    assert.equal (body.code, 'INVALID_JSON');
    assert.match (body.error, /not valid JSON.*left untouched/);
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), broken);
    assert.deepEqual (fs.readdirSync (path.dirname (h.configFile)), [ 'config.json' ]);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), []);
});

test ('a failed connection test warns with a redacted error and does not block the save', async () => {
    const h = await harness ({ 'exchangeClass': RejectingExchange });
    const session = await h.open ({});
    const tested = await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox' });
    assert.equal (tested.status, 200);
    const body = JSON.parse (tested.text);
    assert.equal (body.ok, false);
    assert.equal (body.kind, 'AuthenticationError');
    assert.match (body.error, /Invalid API-key/);
    assert.match (body.error, /\[redacted:apiKey\].*\[redacted:secret\]/);
    assert.ok (!tested.text.includes (KEY) && !tested.text.includes (SECRET), 'submitted secrets must never be echoed');
    assert.ok (!h.stderr ().includes (KEY) && !h.stderr ().includes (SECRET));
    assert.match (h.stderr (), /connection test on fakex failed \(AuthenticationError\)/);
    assert.equal ((await post (session, 'save', saveBody ())).status, 200);
    assert.equal (h.ctx.config.accounts['main'].apiKey, KEY);
});

test ('a connection test that never answers times out instead of hanging the form', async () => {
    const h = await harness ({ 'exchangeClass': HangingExchange });
    const session = await h.open ({});
    const body = JSON.parse ((await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox' })).text);
    assert.deepEqual ([ body.ok, body.kind ], [ false, 'RequestTimeout' ]);
});

test ('hideDisabledTools with no account: saving one adds its tools to the running server (list_changed)', async () => {
    const h = await harness ({ 'settings': { 'hideDisabledTools': true } });
    let changed = 0;
    h.client.setNotificationHandler (ToolListChangedNotificationSchema, async () => {
        changed += 1;
    });
    const namesBefore = (await h.client.listTools ()).tools.map ((tool: any) => tool.name);
    assert.ok (!namesBefore.includes ('list_accounts') && !namesBefore.includes ('create_order'));
    let session = await h.open ({});
    assert.match (session.envelope.meta.notice, /added to this server's tool list the moment the account is saved/);
    assert.match (session.envelope.meta.notice, /restart the assistant app once/);
    // a view-only account lists the read tier, and only that
    let saved = JSON.parse ((await post (session, 'save', saveBody ())).text);
    assert.deepEqual ([ saved.toolsAdded, saved.restartForTools ], [ true, false ]);
    let names = (await h.client.listTools ()).tools.map ((tool: any) => tool.name);
    for (const name of [ 'list_accounts', 'get_balance', 'show_balance' ]) {
        assert.ok (names.includes (name), name + ' is listed after the save');
    }
    assert.ok (!names.includes ('create_order'), 'the trade tier stays hidden for a view-only account');
    assert.ok (!names.includes ('withdraw'));
    assert.equal ((await call (h.client, 'list_accounts', {})).data[0].name, 'main');
    assert.equal ((await call (h.client, 'get_balance', { 'account': 'main' })).ok, true);
    await new Promise ((resolve) => setTimeout (resolve, 20));
    assert.ok (changed >= 1, 'the host was told the tool list changed');
    assert.match (h.stderr (), /now listing the read tools/);
    // turning order placement on for it lists the trade tier
    session = await h.open ({});
    assert.match (session.envelope.meta.notice, /hides disabled tool tiers/);
    saved = JSON.parse ((await post (session, 'save', saveBody ({ 'trading': true, 'replace': true }))).text);
    assert.deepEqual ([ saved.toolsAdded, saved.restartForTools ], [ true, false ]);
    names = (await h.client.listTools ()).tools.map ((tool: any) => tool.name);
    assert.ok (names.includes ('create_order') && names.includes ('execute_route'));
    assert.ok (!names.includes ('withdraw') && !names.includes ('call_implicit_write'), 'funds and raw writes are never listed by the form');
    // and a further save has nothing left to add
    session = await h.open ({});
    saved = JSON.parse ((await post (session, 'save', saveBody ({ 'name': 'second', 'trading': true }))).text);
    assert.deepEqual ([ saved.toolsAdded, saved.restartForTools ], [ false, false ]);
});

test ('without hideDisabledTools a save adds no tools and asks for no restart', async () => {
    const h = await harness ();
    const session = await h.open ({});
    assert.match (session.envelope.meta.notice, /usable immediately, no restart\.$/);
    const before = (await h.client.listTools ()).tools.length;
    const saved = JSON.parse ((await post (session, 'save', saveBody ({ 'trading': true }))).text);
    assert.deepEqual ([ saved.toolsAdded, saved.restartForTools ], [ false, false ]);
    assert.equal ((await h.client.listTools ()).tools.length, before);
});

test ('an unconfigured account error now points at setup_account first, the config file second', async () => {
    const h = await harness ();
    const result = await call (h.client, 'get_balance', { 'account': 'binance' });
    assert.equal (result.error.code, 'UNKNOWN_ACCOUNT');
    assert.match (result.error.hint, /^To fix: call setup_account/);
    assert.ok (result.error.hint.includes (h.configFile));
    assert.match (result.error.hint, /never in this chat/);
});

test ('secrets: exactly the values put to use are redactable, and a value that was only tested is not kept', async () => {
    // an exchange that echoes the key it was given, as real ones do in their error text
    class Echo extends FakeExchange {
        async fetchBalance (): Promise<any> {
            throw new AuthenticationError ('bad apiKey=' + this.config['apiKey'] + ' sec=' + this.config['secret']);
        }
    }
    const h = await harness ({ 'exchangeClass': Echo });
    const session = await h.open ({});
    // pasted with stray whitespace: the exchange is sent — and echoes — the trimmed value
    const padded = await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': '  PADKEY-0123456789\n', 'secret': '\tPADSECRET-9876543210 ' }, 'environment': 'sandbox' });
    const body = JSON.parse (padded.text);
    assert.equal (body.error, 'bad apiKey=[redacted:apiKey] sec=[redacted:secret]');
    assert.ok (!padded.text.includes ('PADKEY') && !padded.text.includes ('PADSECRET') && !h.stderr ().includes ('PADKEY'));
    // …and once the test is over nothing of it stays registered
    assert.equal (redact ('PADKEY-0123456789 PADSECRET-9876543210'), 'PADKEY-0123456789 PADSECRET-9876543210');
    // the wrong thing pasted into a key box must not rewrite every later result that contains it
    await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': 'BTC/USDT', 'secret': 'sandbox' }, 'environment': 'sandbox' });
    assert.equal (redact ('{"symbol":"BTC/USDT","environment":"sandbox"}'), '{"symbol":"BTC/USDT","environment":"sandbox"}');
    // a field this exchange does not take is refused before anything is registered
    assert.equal ((await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET, 'somethingElse': 'NOTASECRET-123456' }, 'environment': 'sandbox' })).status, 400);
    assert.equal (redact ('NOTASECRET-123456 ' + KEY), 'NOTASECRET-123456 ' + KEY);
    // a refused save keeps nothing either
    assert.equal ((await post (session, 'save', saveBody ({ 'name': 'has space' }))).status, 400);
    assert.equal ((await post (session, 'save', saveBody ({ 'environment': 'live', 'trading': true }))).status, 400);
    assert.equal (redact (KEY + ' ' + SECRET), KEY + ' ' + SECRET);
    // a save does: the saved (trimmed) values stay redactable for the life of the server
    const saved = await post (session, 'save', saveBody ({ 'credentials': { 'apiKey': ' ' + KEY + ' ', 'secret': SECRET + '\n' } }));
    assert.equal (saved.status, 200);
    assert.equal (JSON.parse (saved.text).environment, 'sandbox', 'the response itself is not mangled');
    assert.equal (h.ctx.config.accounts['main'].apiKey, KEY);
    assert.equal (redact (KEY + ' ' + SECRET), '[redacted:apiKey] [redacted:secret]');
});

test ('secrets: testing keys an existing account already uses does not unregister that account\'s secrets', async () => {
    const h = await harness ({ 'accounts': { 'main': { 'apiKey': KEY, 'secret': SECRET } } });
    // makeConfig does not go through loadConfig, which is what registers them at startup
    await h.ctx.pools.getAuthenticated ('main');
    const { registerAccountSecrets } = await import ('../../ts/config.js');
    registerAccountSecrets (h.ctx.config.accounts['main']);
    const session = await h.open ({});
    assert.equal (JSON.parse ((await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox' })).text).ok, true);
    assert.equal (redact (KEY + ' ' + SECRET), '[redacted:apiKey] [redacted:secret]');
});

test ('account names: Object.prototype members are ordinary names, the three reserved ones are refused clearly', async () => {
    const h = await harness ();
    // before: such a name is simply an unknown account, not a function off the prototype
    for (const name of [ 'toString', 'valueOf', 'hasOwnProperty', 'constructor', '__proto__' ]) {
        assert.equal ((await call (h.client, 'get_balance', { 'account': name })).error.code, 'UNKNOWN_ACCOUNT', name);
    }
    const session = await h.open ({});
    for (const name of [ '__proto__', 'constructor', 'prototype' ]) {
        const response = await post (session, 'save', saveBody ({ name, 'replace': true }));
        assert.equal (response.status, 400, name);
        const body = JSON.parse (response.text);
        assert.equal (body.code, 'INVALID_NAME');
        assert.equal (body.error, '"' + name + '" cannot be used as an account name — choose a different one');
    }
    assert.equal (fs.existsSync (h.configFile), false);
    // "toString" does not "already exist" just because every object has one
    const saved = await post (session, 'save', saveBody ({ 'name': 'toString' }));
    assert.equal (saved.status, 200);
    assert.equal (JSON.parse (saved.text).replaced, false);
    assert.deepEqual (Object.keys (JSON.parse (fs.readFileSync (h.configFile, 'utf8'))['accounts']), [ 'toString' ]);
    assert.equal ((await call (h.client, 'get_balance', { 'account': 'toString' })).ok, true);
    // and now that it does exist, it needs the explicit replace like any other
    const again = await h.open ({});
    assert.equal (JSON.parse ((await post (again, 'save', saveBody ({ 'name': 'toString' }))).text).code, 'ACCOUNT_EXISTS');
    assert.equal (JSON.parse ((await post (again, 'save', saveBody ({ 'name': 'valueOf' }))).text).ok, true);
});

test ('replacing an account stops the private streams that ran on its old keys and environment', async () => {
    const before = { 'accounts': { 'main': { 'exchange': 'fakex', 'apiKey': 'OLDKEY-0123456789', 'secret': 'OLDSECRET-0123456789' }, 'other': { 'exchange': 'fakex', 'apiKey': 'OTHERKEY-0123456789', 'secret': 'OTHERSECRET-0123456789' } } };
    const h = await harness ({ 'configText': JSON.stringify (before), 'accounts': { 'main': { ...before.accounts.main }, 'other': { ...before.accounts.other } } });
    const subscribe = (account: string | undefined, method = 'watchTicker') => call (h.client, 'watch_subscribe', { 'exchange': 'fakex', method, 'symbol': 'BTC/USDT', ...(account ? { account } : {}) });
    const mine = await subscribe ('main');
    const mineTrades = await subscribe ('main', 'watchTrades');
    const others = await subscribe ('other');
    const publicStream = await subscribe (undefined);
    assert.deepEqual ([ mine.ok, mineTrades.ok, others.ok, publicStream.ok ], [ true, true, true, true ]);
    assert.equal (mine.data.environment, 'live');
    const oldInstance = (await h.ctx.pools.getAuthenticated ('main')).exchange;
    // the account is replaced through the form: new key, and testnet instead of live
    const session = await h.open ({});
    const saved = JSON.parse ((await post (session, 'save', saveBody ({ 'replace': true }))).text);
    assert.equal (saved.ok, true);
    assert.equal (saved.stoppedStreams, 2);
    assert.match (h.stderr (), /stopped 2 live stream\(s\) that ran on its old keys/);
    assert.match (journalText (h.journalDir), /"stoppedStreams":2/);
    // long enough for a stream that was merely disconnected to have reconnected
    await new Promise ((resolve) => setTimeout (resolve, 1300));
    const listed = (await call (h.client, 'watch_list', {})).data.map ((entry: any) => entry.subscriptionId).sort ();
    assert.deepEqual (listed, [ others.data.subscriptionId, publicStream.data.subscriptionId ].sort (), 'only the replaced account\'s streams are gone');
    assert.equal (oldInstance.closed, true);
    const read = await call (h.client, 'watch_read', { 'subscriptionId': mine.data.subscriptionId });
    assert.equal (read.ok, false, 'the old stream cannot be read as if it were still running');
    // a new subscription is a new stream on the new keys and environment, not the old one handed back
    const fresh = await subscribe ('main');
    assert.equal (fresh.ok, true);
    assert.notEqual (fresh.data.subscriptionId, mine.data.subscriptionId);
    assert.equal (fresh.data.reused, undefined);
    assert.equal (fresh.data.environment, 'sandbox');
    assert.equal ((await h.ctx.pools.getAuthenticated ('main')).exchange.config.apiKey, KEY);
    await h.ctx.subscriptions.closeAll ();
});

test ('get_safety_status: startup problems a save made untrue are cleared, the ones still true stay', async () => {
    const stale = [
        'account "main": "trading": true only enables SANDBOX/DEMO trading, but this account is live — set "trading": "live" to explicitly enable live trading (and author a "maxOrderValue" cap), or add "sandbox": true',
        'account "main" invalid: apiKey Expected string, received number',
        'WARNING: config file /somewhere/config.json is readable by other users — run: chmod 600 "/somewhere/config.json"',
        'CCXT_MCP_CONFIG points to a missing file: /somewhere/config.json',
    ];
    const kept = [
        'account "main2": "funds": "live" requires a "maxTransferValue" (per-transfer value cap in USD) — set a number, or explicitly null to opt out of the cap',
        'env/.mcpb-form account "main" (fakex) is shadowed by a config-file account of the same name — the config-file account is used; rename one to keep both',
        'settings invalid: maxResults Expected number, received string',
    ];
    const h = await harness ({ 'accounts': { 'main': { 'apiKey': 'OLDKEY-0123456789', 'secret': 'OLDSECRET-0123456789' } }, 'problems': [ ...stale, ...kept ] });
    assert.equal ((await call (h.client, 'get_safety_status', {})).data.configProblems.length, 7);
    const session = await h.open ({});
    assert.equal ((await post (session, 'save', saveBody ({ 'replace': true, 'trading': true }))).status, 200);
    const status = (await call (h.client, 'get_safety_status', {})).data;
    assert.deepEqual (status.configProblems, kept);
    assert.deepEqual ([ status.accounts[0].environment, status.accounts[0].trading ], [ 'sandbox', true ]);
    assert.equal (status.configPath, h.configFile);
});

test ('hints: order placement and a missing account point at setup_account; funds and raw writes stay file-only', async () => {
    const h = await harness ({ 'accounts': { 'ro': { 'apiKey': KEY, 'secret': SECRET, 'sandbox': true } } });
    const order = await call (h.client, 'create_order', { 'account': 'ro', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'price': 10000 });
    assert.equal (order.error.code, 'TIER_DISABLED');
    assert.match (order.error.hint, /^Call setup_account and have the user save this account again/);
    assert.match (order.error.hint, /Alternative: the user edits the ccxt-mcp config file/);
    assert.ok (!/No tool can enable it/.test (order.error.hint));
    assert.match (order.error.message, /setup form \(setup_account\) or in the ccxt-mcp config file/);
    const withdraw = await call (h.client, 'withdraw', { 'account': 'ro', 'code': 'USDT', 'amount': 1, 'address': 'x' });
    assert.equal (withdraw.error.code, 'TIER_DISABLED');
    assert.ok (!/setup_account/.test (withdraw.error.hint + withdraw.error.message), 'the form cannot enable fund movements, so the hint must not suggest it');
    assert.match (withdraw.error.message, /must edit the ccxt-mcp config file/);
    const empty = await harness ();
    const accounts = await call (empty.client, 'list_accounts', {});
    assert.match (accounts.meta.notice, /^no accounts configured — call setup_account/);
    const status = (await call (empty.client, 'get_safety_status', {})).data;
    assert.ok (status.configPath.includes ('setup_account') && status.configPath.includes (empty.configFile), 'names the form and where it would create the file');
});

test ('real catalogue: what the form offers follows the exchange — demo-as-sandbox, wallet keys, prediction accounts, config-file-only', async () => {
    const h = await harness ({ 'real': true });
    const session = await h.open ({});
    const describe = async (query: string) => JSON.parse ((await raw (session.url + '/credentials?exchange=' + query)).text);
    const names = (info: any) => info.fields.map ((field: any) => field.name);
    // OKX has no separate testnet: ccxt's sandbox there is OKX demo trading
    for (const id of [ 'okx', 'myokx', 'okxus' ]) {
        const info = await describe (id);
        assert.deepEqual ([ info.environments.sandbox, info.environments.demo, info.sandboxIsDemo ], [ true, false, true ], id);
    }
    // a real testnet on its own host, and an exchange with both, are not relabelled
    assert.equal ((await describe ('bybit')).sandboxIsDemo, false);
    const binance = await describe ('binance');
    assert.deepEqual ([ binance.environments.sandbox, binance.environments.demo, binance.sandboxIsDemo ], [ true, true, false ]);
    assert.deepEqual ([ binance.predictionVariant, binance.prediction, binance.configFileOnly, binance.walletKey ], [ true, false, false, false ]);
    assert.equal ((await describe ('kraken')).predictionVariant, false);
    // wallet-signing venues ask for the pair they need
    const hyperliquid = await describe ('hyperliquid');
    assert.deepEqual (names (hyperliquid), [ 'walletAddress', 'privateKey' ]);
    assert.deepEqual ([ hyperliquid.walletKey, hyperliquid.predictionVariant ], [ true, true ]);
    // ids that exist twice: the prediction account is its own class, described as such
    const binancePrediction = await describe ('binance&prediction=1');
    assert.equal (binancePrediction.prediction, true);
    assert.deepEqual (names (binancePrediction), [ 'apiKey', 'secret' ]);
    assert.match (binancePrediction.website, /prediction/);
    const polymarket = await describe ('polymarket');
    assert.deepEqual ([ polymarket.predictionVariant, polymarket.configFileOnly ], [ true, false ]);
    assert.deepEqual (names (polymarket), [ 'privateKey' ]);
    // venues ccxt declares no credential for cannot be configured here, and say so
    const polymarketPrediction = await describe ('polymarket&prediction=1');
    assert.deepEqual ([ polymarketPrediction.configFileOnly, names (polymarketPrediction).length ], [ true, 0 ]);
    assert.equal ((await describe ('dydx')).configFileOnly, true);
    assert.equal ((await describe ('kraken&prediction=1')).code, 'NO_PREDICTION');
    for (const body of [
        { 'name': 'd', 'exchange': 'dydx', 'credentials': {}, 'environment': 'live', 'trading': false },
        { 'name': 'p', 'exchange': 'polymarket', 'prediction': true, 'credentials': {}, 'environment': 'live', 'trading': false },
    ]) {
        const response = await post (session, 'save', body);
        assert.equal (response.status, 400);
        assert.equal (JSON.parse (response.text).code, 'CONFIG_FILE_ONLY');
        assert.match (JSON.parse (response.text).error, /add the account to the config file instead/);
        assert.equal (JSON.parse ((await post (session, 'test', { 'exchange': body.exchange, 'prediction': body.prediction, 'credentials': {}, 'environment': 'live' })).text).code, 'CONFIG_FILE_ONLY');
    }
    assert.equal (fs.existsSync (h.configFile), false, 'no credential-less account was written');
    assert.equal (JSON.parse ((await post (session, 'save', { 'name': 'k', 'exchange': 'kraken', 'prediction': true, 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'live', 'trading': false })).text).code, 'NO_PREDICTION');
    // an exchange with no balance endpoint is "not tested", never "failed" (and no request is made)
    const untestable = JSON.parse ((await post (session, 'test', { 'exchange': 'predictfun', 'credentials': { 'apiKey': KEY }, 'environment': 'live' })).text);
    assert.deepEqual (untestable, { 'ok': true, 'tested': false, 'code': 'NOT_TESTABLE' });
    assert.match (h.stderr (), /connection test on predictfun was skipped/);
    // a prediction account on a two-sided id is saved as one
    const saved = JSON.parse ((await post (session, 'save', { 'name': 'bpred', 'exchange': 'binance', 'prediction': true, 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'live', 'trading': false })).text);
    assert.equal (saved.ok, true);
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8'))['accounts']['bpred'], { 'exchange': 'binance', 'prediction': true, 'apiKey': KEY, 'secret': SECRET });
    const account = (await call (h.client, 'list_accounts', {})).data[0];
    assert.deepEqual ([ account.name, account.exchange, account.prediction ], [ 'bpred', 'binance', true ]);
    // setup_account says up front when the preselected exchange cannot be done in the form
    const dydx = await h.open ({ 'exchange': 'dydx' });
    assert.ok (dydx.envelope.data.asksFor.some ((line: string) => /dydx takes its credentials in a way the form cannot collect/.test (line)));
});
