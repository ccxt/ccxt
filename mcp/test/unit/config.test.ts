import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadConfig } from '../../ts/config.js';

function withConfig (config: any, env: Record<string, string | undefined>, fn: () => void): void {
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-config-'));
    const file = path.join (dir, 'config.json');
    fs.writeFileSync (file, JSON.stringify (config), { 'mode': 0o600 });
    const saved: Record<string, string | undefined> = { 'CCXT_MCP_CONFIG': process.env['CCXT_MCP_CONFIG'] };
    process.env['CCXT_MCP_CONFIG'] = file;
    for (const [ key, value ] of Object.entries (env)) {
        saved[key] = process.env[key];
        if (value === undefined) {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    }
    try {
        fn ();
    } finally {
        for (const [ key, value ] of Object.entries (saved)) {
            if (value === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        }
    }
}

test ('accounts shape loads and validates', () => {
    withConfig ({ 'accounts': { 'main': { 'exchange': 'binance', 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true } } }, {}, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['main'].exchange, 'binance');
        assert.equal (config.accounts['main'].trading, true);
        assert.equal (config.problems.length, 0);
    });
});

test ('legacy per-exchange shape maps to accounts named by exchange id', () => {
    withConfig ({ 'binance': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' } }, {}, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['binance'].exchange, 'binance');
    });
});

test ('trading:true on a live account downgrades with a problem', () => {
    withConfig ({ 'accounts': { 'live': { 'exchange': 'kraken', 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'trading': true } } }, {}, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['live'].trading, false);
        assert.ok (config.problems.some ((problem) => problem.includes ('SANDBOX/DEMO')));
    });
});

test ('trading:"live" without a maxOrderValue decision downgrades', () => {
    withConfig ({ 'accounts': { 'live': { 'exchange': 'kraken', 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'trading': 'live' } } }, {}, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['live'].trading, false);
        assert.ok (config.problems.some ((problem) => problem.includes ('maxOrderValue')));
    });
});

test ('trading:"live" with an explicit null cap opt-out is honored', () => {
    withConfig ({ 'accounts': { 'live': { 'exchange': 'kraken', 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'trading': 'live', 'maxOrderValue': null } } }, {}, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['live'].trading, 'live');
    });
});

test ('sandbox and demo are mutually exclusive', () => {
    withConfig ({ 'accounts': { 'x': { 'exchange': 'binance', 'sandbox': true, 'demo': true } } }, {}, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['x'], undefined);
        assert.ok (config.problems.some ((problem) => problem.includes ('mutually exclusive')));
    });
});

test ('unknown exchange id is rejected with suggestions', () => {
    withConfig ({ 'accounts': { 'x': { 'exchange': 'binanec' } } }, {}, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['x'], undefined);
        assert.ok (config.problems.some ((problem) => problem.includes ('binance')));
    });
});

test ('CCXT_MCP_* env defines the implicit default account', () => {
    withConfig ({}, {
        'CCXT_MCP_EXCHANGE': 'binance',
        'CCXT_MCP_APIKEY': 'FAKEKEY123456',
        'CCXT_MCP_SECRET': 'FAKESECRET123456',
        'CCXT_MCP_SANDBOX': 'true',
        'CCXT_MCP_TRADING': 'sandbox',
    }, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['default'].exchange, 'binance');
        assert.equal (config.accounts['default'].sandbox, true);
        assert.equal (config.accounts['default'].trading, true);
    });
});
