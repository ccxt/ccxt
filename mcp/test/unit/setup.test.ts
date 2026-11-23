import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { ConfigWriteError, credentialSetupHelp, isValidAccountName, loadConfig, resolveConfigPath, validateAccount, writeAccountToConfigFile } from '../../ts/config.js';
import { browserCommand, defaultLaunchRoots, launchPage } from '../../ts/setup.js';
import { ExchangePools, UnknownAccountError } from '../../ts/pools.js';

// The config-file writer behind the setup form's save, and the small pure helpers around it.
// The HTTP side (sessions, CSRF, hot-apply) is covered in test/integration/setup.test.ts.

const known = (id: string) => id === 'fakex' || id === 'otherx';
const ACCOUNT = { 'exchange': 'fakex', 'apiKey': 'FAKEKEY-unit-123456', 'secret': 'FAKESECRET-unit-123456', 'sandbox': true };
const posix = process.platform !== 'win32';

function tempDir (): string {
    return fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-setup-unit-'));
}

function mode (file: string): number {
    return fs.statSync (file).mode & 0o777;
}

function codeOf (fn: () => void): string {
    try {
        fn ();
    } catch (e: any) {
        assert.ok (e instanceof ConfigWriteError, 'expected a ConfigWriteError, got ' + String (e));
        return e.code;
    }
    return 'no error';
}

test ('writer: a missing file and its parent directory are created private (0600 / 0700)', () => {
    const file = path.join (tempDir (), 'nested', 'ccxt-mcp', 'config.json');
    const result = writeAccountToConfigFile (file, 'main', ACCOUNT, { 'isKnownExchange': known });
    assert.deepEqual ({ 'shape': result.shape, 'created': result.created, 'replaced': result.replaced }, { 'shape': 'accounts', 'created': true, 'replaced': false });
    assert.deepEqual (JSON.parse (fs.readFileSync (file, 'utf8')), { 'accounts': { 'main': ACCOUNT } });
    if (posix) {
        assert.equal (mode (file), 0o600);
        assert.equal (mode (path.dirname (file)), 0o700);
    }
    // no temp file is left next to it
    assert.deepEqual (fs.readdirSync (path.dirname (file)), [ 'config.json' ]);
});

test ('writer: {"accounts": ...} shape keeps every other account, the settings block and unknown keys', () => {
    const file = path.join (tempDir (), 'config.json');
    const before = {
        'accounts': { 'old': { 'exchange': 'otherx', 'apiKey': 'OLDKEY-123456', 'funds': 'live', 'maxTransferValue': 5, 'custom': { 'a': [ 1, 2 ] } } },
        'settings': { 'hideDisabledTools': true, 'exchangeOptions': { 'fakex': { 'x': 1 } } },
        'somethingElse': [ 'kept' ],
    };
    fs.writeFileSync (file, JSON.stringify (before, null, 2), { 'mode': 0o644 });
    const result = writeAccountToConfigFile (file, 'main', ACCOUNT, { 'isKnownExchange': known });
    assert.equal (result.shape, 'accounts');
    assert.equal (result.created, false);
    const text = fs.readFileSync (file, 'utf8');
    const after = JSON.parse (text);
    assert.deepEqual (after['accounts']['old'], before['accounts']['old']);
    assert.deepEqual (after['settings'], before['settings']);
    assert.deepEqual (after['somethingElse'], before['somethingElse']);
    assert.deepEqual (after['accounts']['main'], ACCOUNT);
    assert.deepEqual (Object.keys (after), [ 'accounts', 'settings', 'somethingElse' ]);
    // the file keeps its own 2-space indentation, and a file that now holds keys is private
    assert.match (text, /^\{\n  "accounts"/);
    if (posix) {
        assert.equal (mode (file), 0o600);
    }
});

test ('writer: a legacy {"<exchangeId>": ...} file stays in the legacy shape', () => {
    const file = path.join (tempDir (), 'keys.json');
    const before = { 'otherx': { 'apiKey': 'OLDKEY-123456', 'secret': 'OLDSECRET-123456' }, 'settings': { 'maxResults': 50 } };
    fs.writeFileSync (file, JSON.stringify (before));
    const result = writeAccountToConfigFile (file, 'fakex', ACCOUNT, { 'isKnownExchange': known });
    assert.equal (result.shape, 'legacy');
    const after = JSON.parse (fs.readFileSync (file, 'utf8'));
    assert.equal (after['accounts'], undefined, 'an "accounts" key would hide every legacy account');
    assert.deepEqual (after['otherx'], before['otherx']);
    assert.deepEqual (after['settings'], before['settings']);
    // the key is the exchange id in this shape, so "exchange" is not repeated inside
    assert.deepEqual (after['fakex'], { 'apiKey': ACCOUNT.apiKey, 'secret': ACCOUNT.secret, 'sandbox': true });
});

test ('writer: a legacy file cannot take an account named differently from its exchange', () => {
    const file = path.join (tempDir (), 'keys.json');
    const text = JSON.stringify ({ 'otherx': { 'apiKey': 'OLDKEY-123456' } });
    fs.writeFileSync (file, text);
    assert.equal (codeOf (() => writeAccountToConfigFile (file, 'my-main', ACCOUNT, { 'isKnownExchange': known })), 'LEGACY_NAME');
    assert.equal (fs.readFileSync (file, 'utf8'), text);
});

test ('writer: an empty or settings-only file gets the {"accounts": ...} shape', () => {
    const dir = tempDir ();
    const empty = path.join (dir, 'empty.json');
    fs.writeFileSync (empty, '');
    assert.equal (writeAccountToConfigFile (empty, 'main', ACCOUNT, { 'isKnownExchange': known }).shape, 'accounts');
    const settingsOnly = path.join (dir, 'settings.json');
    fs.writeFileSync (settingsOnly, '{"settings":{"loadEnvKeys":true}}');
    writeAccountToConfigFile (settingsOnly, 'main', ACCOUNT, { 'isKnownExchange': known });
    assert.deepEqual (JSON.parse (fs.readFileSync (settingsOnly, 'utf8')), { 'settings': { 'loadEnvKeys': true }, 'accounts': { 'main': ACCOUNT } });
});

test ('writer: a file that is not valid JSON (or not an object) is refused and left byte-for-byte intact', () => {
    const dir = tempDir ();
    for (const [ name, text, code ] of [
        [ 'broken.json', '{"accounts": {"old": {"exchange": "otherx", "apiKey": "OLDKEY-123456",}}}', 'INVALID_JSON' ],
        [ 'comment.json', '// my keys\n{"accounts": {}}', 'INVALID_JSON' ],
        [ 'array.json', '[1, 2]', 'INVALID_SHAPE' ],
        [ 'accounts-array.json', '{"accounts": []}', 'INVALID_SHAPE' ],
    ]) {
        const file = path.join (dir, name);
        fs.writeFileSync (file, text);
        assert.equal (codeOf (() => writeAccountToConfigFile (file, 'main', ACCOUNT, { 'isKnownExchange': known })), code, name);
        assert.equal (fs.readFileSync (file, 'utf8'), text, name + ' must be untouched');
    }
    assert.equal (fs.readdirSync (dir).length, 4, 'no temp files left behind');
});

test ('writer: an existing account is only overwritten with replace, in both shapes', () => {
    const dir = tempDir ();
    const modern = path.join (dir, 'modern.json');
    fs.writeFileSync (modern, JSON.stringify ({ 'accounts': { 'main': { 'exchange': 'otherx', 'apiKey': 'OLDKEY-123456', 'funds': 'live' }, 'keep': { 'exchange': 'otherx' } } }));
    const before = fs.readFileSync (modern, 'utf8');
    assert.equal (codeOf (() => writeAccountToConfigFile (modern, 'main', ACCOUNT, { 'isKnownExchange': known })), 'ACCOUNT_EXISTS');
    assert.equal (fs.readFileSync (modern, 'utf8'), before);
    const result = writeAccountToConfigFile (modern, 'main', ACCOUNT, { 'replace': true, 'isKnownExchange': known });
    assert.equal (result.replaced, true);
    const after = JSON.parse (fs.readFileSync (modern, 'utf8'));
    // replaced whole: nothing of the old account (here a funds tier) survives into the new one
    assert.deepEqual (after['accounts']['main'], ACCOUNT);
    assert.deepEqual (after['accounts']['keep'], { 'exchange': 'otherx' });
    const legacy = path.join (dir, 'legacy.json');
    fs.writeFileSync (legacy, JSON.stringify ({ 'fakex': { 'apiKey': 'OLDKEY-123456' } }));
    assert.equal (codeOf (() => writeAccountToConfigFile (legacy, 'fakex', ACCOUNT, { 'isKnownExchange': known })), 'ACCOUNT_EXISTS');
    assert.equal (writeAccountToConfigFile (legacy, 'fakex', ACCOUNT, { 'replace': true, 'isKnownExchange': known }).replaced, true);
    assert.equal (JSON.parse (fs.readFileSync (legacy, 'utf8'))['fakex']['apiKey'], ACCOUNT.apiKey);
});

test ('writer: account names are restricted, and prototype keys are never written', () => {
    const file = path.join (tempDir (), 'config.json');
    for (const name of [ '', 'has space', 'a/b', '../x', 'x'.repeat (41), '__proto__', 'constructor', 'prototype', 'né' ]) {
        assert.equal (isValidAccountName (name), false, name);
        assert.equal (codeOf (() => writeAccountToConfigFile (file, name, ACCOUNT, { 'isKnownExchange': known })), 'INVALID_NAME', name);
    }
    assert.equal (fs.existsSync (file), false);
    for (const name of [ 'binance', 'my-main_2', 'A', 'x'.repeat (40) ]) {
        assert.equal (isValidAccountName (name), true, name);
    }
    assert.equal (isValidAccountName (undefined), false);
});

test ('writer: a symlinked config file is written through, not replaced', { 'skip': !posix }, () => {
    const dir = tempDir ();
    const real = path.join (dir, 'real.json');
    const link = path.join (dir, 'link.json');
    fs.writeFileSync (real, '{"accounts":{}}');
    fs.symlinkSync (real, link);
    const result = writeAccountToConfigFile (link, 'main', ACCOUNT, { 'isKnownExchange': known });
    assert.equal (result.path, fs.realpathSync (real));
    assert.equal (fs.lstatSync (link).isSymbolicLink (), true);
    assert.deepEqual (JSON.parse (fs.readFileSync (real, 'utf8'))['accounts']['main'], ACCOUNT);
});

test ('validateAccount: checks against the directory it is given, with the same tier rules as startup', () => {
    const directory = { 'isKnownExchange': known, 'allExchangeIds': () => [ 'fakex', 'otherx' ], 'closestMatches': () => [ 'fakex' ] };
    let problems: string[] = [];
    const account = validateAccount ('main', { ...ACCOUNT, 'trading': true }, problems, directory);
    assert.equal (account?.name, 'main');
    assert.equal (account?.trading, true);
    assert.deepEqual (problems, []);
    problems = [];
    assert.equal (validateAccount ('main', { 'exchange': 'nope' }, problems, directory), undefined);
    assert.match (problems[0], /unknown exchange/);
    // live trading without a cap is downgraded and reported — the form refuses on any problem
    problems = [];
    const live = validateAccount ('main', { 'exchange': 'fakex', 'trading': 'live' }, problems, directory);
    assert.equal (live?.trading, false);
    assert.equal (problems.length, 1);
});

test ('resolveConfigPath: CCXT_MCP_CONFIG wins; empty and unsubstituted template values fall back to the default', () => {
    const saved = process.env['CCXT_MCP_CONFIG'];
    try {
        process.env['CCXT_MCP_CONFIG'] = '/somewhere/else.json';
        assert.deepEqual (resolveConfigPath (), { 'path': '/somewhere/else.json', 'explicit': true });
        for (const value of [ '', '   ', '${user_config.config}' ]) {
            process.env['CCXT_MCP_CONFIG'] = value;
            const resolved = resolveConfigPath ();
            assert.equal (resolved.explicit, false);
            assert.match (resolved.path, /ccxt-mcp[\\/]config\.json$/);
        }
    } finally {
        if (saved === undefined) {
            delete process.env['CCXT_MCP_CONFIG'];
        } else {
            process.env['CCXT_MCP_CONFIG'] = saved;
        }
    }
});

test ('credentialSetupHelp: the setup form comes first, the config file second, and never the chat', () => {
    const help = credentialSetupHelp ('/tmp/x/config.json');
    assert.ok (help.indexOf ('setup_account') !== -1);
    assert.ok (help.indexOf ('setup_account') < help.indexOf ('/tmp/x/config.json'), 'setup_account is offered before the config file');
    assert.match (help, /never in this chat/);
    assert.match (help, /config file/);
});

test ('browserCommand: the launch file is always one argv element and no shell is involved', () => {
    // a path with everything a shell would trip over — it is what the launcher is given; the
    // form URL itself never goes on a command line (see launchPage below)
    const url = '/tmp/ccxt-mcp-setup-a b$(x)&;"\'/open.html';
    assert.deepEqual (browserCommand ('darwin', url), { 'command': 'open', 'args': [ url ] });
    assert.deepEqual (browserCommand ('linux', url), { 'command': 'xdg-open', 'args': [ url ] });
    const windows = browserCommand ('win32', url);
    assert.equal (windows.command, 'rundll32');
    assert.deepEqual (windows.args, [ 'url.dll,FileProtocolHandler', url ]);
    for (const platform of [ 'darwin', 'linux', 'win32' ]) {
        const { command, args } = browserCommand (platform, url);
        assert.ok (![ 'cmd', 'cmd.exe', 'sh', 'bash', 'powershell' ].includes (command), platform);
        assert.equal (args.filter ((arg) => arg === url).length, 1);
    }
});

test ('launchPage: a redirect to the form with a link fallback, and nothing that leaks it onward', () => {
    const url = 'http://127.0.0.1:1234/setup/' + 'ab'.repeat (16);
    const page = launchPage (url);
    assert.ok (page.includes ('<meta http-equiv="refresh" content="0;url=' + url + '">'));
    assert.ok (page.includes ('<a rel="noreferrer" href="' + url + '">'));
    assert.ok (page.includes ('<meta name="referrer" content="no-referrer">'));
    assert.ok (!/<script|src=/.test (page), 'no script and nothing fetched');
});

test ('defaultLaunchRoots: always ends in the temp directory', () => {
    const roots = defaultLaunchRoots ();
    assert.equal (roots[roots.length - 1], os.tmpdir ());
    assert.ok (roots.every ((root) => path.isAbsolute (root)));
});

test ('pools.account: only an own property is an account — never an Object.prototype member', () => {
    const accounts: Record<string, any> = { 'main': { 'name': 'main', 'exchange': 'fakex' } };
    const pools = new ExchangePools ({ accounts, 'settings': {} as any, 'problems': [], 'configPath': undefined }, {} as any);
    assert.equal (pools.account ('main').exchange, 'fakex');
    for (const name of [ 'toString', 'valueOf', 'hasOwnProperty', 'constructor', '__proto__', 'isPrototypeOf' ]) {
        assert.throws (() => pools.account (name), UnknownAccountError, name);
    }
    accounts['toString'] = { 'name': 'toString', 'exchange': 'fakex' };
    assert.equal (pools.account ('toString').name, 'toString');
});

test ('loadConfig: a file account named __proto__/constructor/prototype is reported and ignored, never assigned', () => {
    const file = path.join (tempDir (), 'config.json');
    // written as text: an object literal would set the prototype instead of an own "__proto__" key
    fs.writeFileSync (file, '{"accounts":{"__proto__":{"exchange":"binance","apiKey":"PROTOKEY-123456"},"constructor":{"exchange":"binance"},"toString":{"exchange":"binance","apiKey":"REALKEY-123456","secret":"REALSECRET-123456"}}}', { 'mode': 0o600 });
    const saved = process.env['CCXT_MCP_CONFIG'];
    process.env['CCXT_MCP_CONFIG'] = file;
    try {
        const config = loadConfig ();
        // an ordinary Object.prototype member name is a usable account name
        assert.deepEqual (Object.keys (config.accounts), [ 'toString' ]);
        assert.equal (Object.getPrototypeOf (config.accounts), Object.prototype, 'the map\'s prototype was not replaced');
        assert.equal ((config.accounts as any)['exchange'], undefined);
        assert.ok (config.problems.some ((problem) => problem === 'account "__proto__" ignored: that name is reserved — rename it'));
        assert.ok (config.problems.some ((problem) => problem.startsWith ('account "constructor" ignored:')));
    } finally {
        if (saved === undefined) {
            delete process.env['CCXT_MCP_CONFIG'];
        } else {
            process.env['CCXT_MCP_CONFIG'] = saved;
        }
    }
});
