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

test ('the accounts map holds multiple exchanges', () => {
    withConfig ({ 'accounts': {
        'binance-test': { 'exchange': 'binance', 'apiKey': 'FAKEKEY111111', 'secret': 'FAKESECRET111111', 'sandbox': true, 'trading': true },
        'kraken-main': { 'exchange': 'kraken', 'apiKey': 'FAKEKEY222222', 'secret': 'FAKESECRET222222' },
        'okx-main': { 'exchange': 'okx', 'apiKey': 'FAKEKEY333333', 'secret': 'FAKESECRET333333', 'password': 'FAKEPASS' },
    } }, {}, () => {
        const config = loadConfig ();
        assert.deepEqual (Object.keys (config.accounts).sort (), [ 'binance-test', 'kraken-main', 'okx-main' ]);
        assert.equal (config.accounts['okx-main'].exchange, 'okx');
        assert.equal (config.problems.length, 0);
    });
});

test ('an unsubstituted/empty CCXT_MCP_CONFIG is ignored, not treated as a missing file', () => {
    withConfig ({}, { 'CCXT_MCP_CONFIG': '${user_config.config_file}' }, () => {
        const config = loadConfig ();
        assert.ok (!config.problems.some ((p) => p.includes ('CCXT_MCP_CONFIG')));
    });
});

test ('settings maxSubscriptions:0 (the documented default sentinel) validates and preserves sibling settings', () => {
    withConfig ({ 'settings': { 'maxSubscriptions': 0, 'maxResults': 42 }, 'accounts': {} }, {}, () => {
        const config = loadConfig ();
        assert.equal (config.settings.maxSubscriptions, 0);
        assert.equal (config.settings.maxResults, 42, 'a valid sibling setting is not discarded by the 0 sentinel');
        assert.ok (!config.problems.some ((p) => p.includes ('settings invalid')));
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

test ('CCXT_MCP_*_2 / _3 env slots define several accounts (the .mcpb multi-exchange form)', () => {
    withConfig ({}, {
        'CCXT_MCP_EXCHANGE': 'binance',
        'CCXT_MCP_APIKEY': 'FAKEKEY111111',
        'CCXT_MCP_SECRET': 'FAKESECRET111111',
        'CCXT_MCP_EXCHANGE_2': 'kraken',
        'CCXT_MCP_APIKEY_2': 'FAKEKEY222222',
        'CCXT_MCP_SECRET_2': 'FAKESECRET222222',
        'CCXT_MCP_EXCHANGE_3': 'okx',
        'CCXT_MCP_APIKEY_3': 'FAKEKEY333333',
        'CCXT_MCP_SECRET_3': 'FAKESECRET333333',
        'CCXT_MCP_PASSWORD_3': 'FAKEPASS',
        'CCXT_MCP_SANDBOX': 'true',
    }, () => {
        const config = loadConfig ();
        // slot 1 keeps the name "default"; extra slots are named after their exchange id
        assert.equal (config.accounts['default'].exchange, 'binance');
        assert.equal (config.accounts['kraken'].exchange, 'kraken');
        assert.equal (config.accounts['okx'].exchange, 'okx');
        assert.equal (config.accounts['okx'].password, 'FAKEPASS');
        // one global sandbox toggle applies to every slot
        assert.equal (config.accounts['default'].sandbox, true);
        assert.equal (config.accounts['kraken'].sandbox, true);
        assert.equal (config.accounts['okx'].sandbox, true);
        assert.equal (config.problems.length, 0);
    });
});

test ('a config-file account wins over an env-var account of the same name', () => {
    withConfig ({ 'accounts': { 'default': { 'exchange': 'kraken', 'apiKey': 'FAKEKEYCFG1234', 'secret': 'FAKESECRETCFG1234' } } }, {
        'CCXT_MCP_EXCHANGE': 'binance',
        'CCXT_MCP_APIKEY': 'FAKEKEYENV1234',
        'CCXT_MCP_SECRET': 'FAKESECRETENV1234',
    }, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['default'].exchange, 'kraken');
    });
});

test ('a global CCXT_MCP_TRADING=live does NOT arm live trading on extra env slots', () => {
    withConfig ({}, {
        'CCXT_MCP_EXCHANGE': 'binance', 'CCXT_MCP_APIKEY': 'FAKEKEY111111', 'CCXT_MCP_SECRET': 'FAKESECRET111111',
        'CCXT_MCP_EXCHANGE_2': 'kraken', 'CCXT_MCP_APIKEY_2': 'FAKEKEY222222', 'CCXT_MCP_SECRET_2': 'FAKESECRET222222',
        'CCXT_MCP_TRADING': 'live', 'CCXT_MCP_MAX_ORDER_VALUE': '1000000',
    }, () => {
        const config = loadConfig ();
        // slot 1 (the account the globals were set for) is armed as intended
        assert.equal (config.accounts['default'].trading, 'live');
        assert.equal (config.accounts['default'].maxOrderValue, 1000000);
        // the extra exchange must NOT inherit live trading or the per-order cap
        assert.notEqual (config.accounts['kraken'].trading, 'live');
        assert.equal (config.accounts['kraken'].maxOrderValue, undefined);
    });
});

test ('an unsubstituted ${...} exchange slot is ignored, not a spurious unknown-exchange warning', () => {
    withConfig ({}, {
        'CCXT_MCP_EXCHANGE': 'binance', 'CCXT_MCP_APIKEY': 'FAKEKEY111111', 'CCXT_MCP_SECRET': 'FAKESECRET111111',
        'CCXT_MCP_EXCHANGE_2': '${user_config.exchange_2}',
    }, () => {
        const config = loadConfig ();
        assert.deepEqual (Object.keys (config.accounts), [ 'default' ]);
        assert.ok (!config.problems.some ((p) => p.includes ('${') || p.includes ('binanec') || p.includes ('unknown')));
    });
});

test ('an env slot shadowed by a config-file account is surfaced, not silently dropped', () => {
    withConfig ({ 'accounts': { 'kraken': { 'exchange': 'kraken', 'apiKey': 'FAKEKEYCFG1234', 'secret': 'FAKESECRETCFG1234' } } }, {
        'CCXT_MCP_EXCHANGE': 'binance', 'CCXT_MCP_APIKEY': 'FAKEKEY111111', 'CCXT_MCP_SECRET': 'FAKESECRET111111',
        'CCXT_MCP_EXCHANGE_2': 'kraken', 'CCXT_MCP_APIKEY_2': 'FAKEKEYENV1234', 'CCXT_MCP_SECRET_2': 'FAKESECRETENV1234',
    }, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['kraken'].apiKey, 'FAKEKEYCFG1234', 'the config-file kraken wins');
        assert.ok (config.problems.some ((p) => p.includes ('shadowed')), 'the dropped form account is reported, not silent');
    });
});

test ('loadEnvKeys off (default): ambient <EXCHANGEID>_<CRED> vars do NOT create accounts', () => {
    withConfig ({}, {
        'CCXT_MCP_LOAD_ENV_KEYS': undefined,
        'BINANCE_APIKEY': 'FAKEKEY111111',
        'BINANCE_SECRET': 'FAKESECRET111111',
    }, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['binance'], undefined);
    });
});

test ('loadEnvKeys via settings: <EXCHANGEID>_<CRED> vars auto-register read-only accounts (ccxt --loadKeys parity)', () => {
    withConfig ({ 'settings': { 'loadEnvKeys': true } }, {
        'CCXT_MCP_TRADING': undefined, 'CCXT_MCP_SANDBOX': undefined,
        'BINANCE_APIKEY': 'FAKEKEY111111', 'BINANCE_SECRET': 'FAKESECRET111111',
        'KRAKEN_APIKEY': 'FAKEKEY222222', 'KRAKEN_SECRET': 'FAKESECRET222222',
    }, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['binance'].exchange, 'binance');
        assert.equal (config.accounts['kraken'].exchange, 'kraken');
        // read-only by default — no global CCXT_MCP_TRADING set
        assert.equal (config.accounts['binance'].trading ?? false, false);
    });
});

test ('loadEnvKeys via CCXT_MCP_LOAD_ENV_KEYS: works with no config file; global sandbox+trading toggles apply, live is never auto-armed', () => {
    withConfig ({}, {
        'CCXT_MCP_LOAD_ENV_KEYS': 'true',
        'OKX_APIKEY': 'FAKEKEY333333', 'OKX_SECRET': 'FAKESECRET333333', 'OKX_PASSWORD': 'FAKEPASS',
        'CCXT_MCP_SANDBOX': 'true', 'CCXT_MCP_TRADING': 'sandbox',
    }, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['okx'].exchange, 'okx');
        assert.equal (config.accounts['okx'].sandbox, true);
        assert.equal (config.accounts['okx'].trading, true);
    });
});

test ('loadEnvKeys never auto-arms LIVE trading from a global flag (safety)', () => {
    withConfig ({}, {
        'CCXT_MCP_LOAD_ENV_KEYS': 'true',
        'BINANCE_APIKEY': 'FAKEKEY444444', 'BINANCE_SECRET': 'FAKESECRET444444',
        'CCXT_MCP_TRADING': 'live',
    }, () => {
        const config = loadConfig ();
        // an env-detected account is live (no sandbox) + trading was NOT set to "live" for it,
        // so trading stays off — live orders require an explicit config-file account
        assert.equal (config.accounts['binance'].trading ?? false, false);
    });
});

test ('unsubstituted ${...} credential templates count as unset, not as credential values', () => {
    withConfig ({}, {
        'CCXT_MCP_EXCHANGE': 'okx',
        'CCXT_MCP_APIKEY': 'FAKEKEY111111',
        'CCXT_MCP_SECRET': 'FAKESECRET111111',
        'CCXT_MCP_API_KEY': '${user_config.api_key}',
        'CCXT_MCP_PASSWORD': '${user_config.password}',
        'CCXT_MCP_UID': '${user_config.uid}',
        'CCXT_MCP_WALLETADDRESS': '${user_config.wallet_address}',
        'CCXT_MCP_PRIVATEKEY': '${user_config.private_key}',
    }, () => {
        const account: any = loadConfig ().accounts['default'];
        assert.equal (account.exchange, 'okx');
        // the alias (API_KEY) is read after APIKEY — its template must not overwrite the real key
        assert.equal (account.apiKey, 'FAKEKEY111111');
        assert.equal (account.secret, 'FAKESECRET111111');
        for (const field of [ 'password', 'uid', 'walletAddress', 'privateKey' ]) {
            assert.equal (account[field], undefined, field + ' must stay unset');
        }
        assert.ok (!JSON.stringify (account).includes ('${'));
    });
});

// Regression: any value merely CONTAINING "${" was discarded, so a real passphrase holding
// those two characters was silently dropped and every private call failed authentication.
test ('a credential that merely contains "${" is a real value, not an unsubstituted template', () => {
    const passwords = [ 'Pa${word}!9zz', '${not}atemplate', 'prefix${user_config.password}', '${a}${b}', '${unterminated', 'x ${user_config.password}' ];
    for (const password of passwords) {
        withConfig ({}, {
            'CCXT_MCP_EXCHANGE': 'okx',
            'CCXT_MCP_APIKEY': 'FAKEKEY111111',
            'CCXT_MCP_SECRET': 'FAKESECRET111111',
            'CCXT_MCP_PASSWORD': password,
        }, () => {
            const config = loadConfig ();
            const account: any = config.accounts['default'];
            assert.equal (account.password, password, JSON.stringify (password));
            assert.deepEqual (config.problems, []);
        });
    }
});

test ('a whole-value ${...} template is unset, with or without surrounding whitespace', () => {
    for (const password of [ '${user_config.password}', ' ${user_config.password} ', '${}', '${user_config.password}\n' ]) {
        withConfig ({}, {
            'CCXT_MCP_EXCHANGE': 'okx',
            'CCXT_MCP_APIKEY': 'FAKEKEY111111',
            'CCXT_MCP_SECRET': 'FAKESECRET111111',
            'CCXT_MCP_PASSWORD': password,
        }, () => {
            const account: any = loadConfig ().accounts['default'];
            assert.equal (account.password, undefined, JSON.stringify (password));
            assert.equal (account.apiKey, 'FAKEKEY111111');
        });
    }
});

test ('an account whose every credential is an unsubstituted template loads as keyless', () => {
    withConfig ({}, {
        'CCXT_MCP_EXCHANGE': 'binance',
        'CCXT_MCP_APIKEY': '${user_config.api_key}',
        'CCXT_MCP_SECRET': '${user_config.secret}',
    }, () => {
        const account: any = loadConfig ().accounts['default'];
        assert.equal (account.exchange, 'binance');
        assert.equal (account.apiKey, undefined);
        assert.equal (account.secret, undefined);
    });
});

test ('an unsubstituted ${...} per-slot flag falls back to the global toggle like an empty one', () => {
    withConfig ({}, {
        'CCXT_MCP_EXCHANGE': 'binance', 'CCXT_MCP_APIKEY': 'FAKEKEY111111', 'CCXT_MCP_SECRET': 'FAKESECRET111111',
        'CCXT_MCP_SANDBOX': 'true',
        'CCXT_MCP_TRADING': 'sandbox',
        'CCXT_MCP_EXCHANGE_2': 'kraken', 'CCXT_MCP_APIKEY_2': 'FAKEKEY222222', 'CCXT_MCP_SECRET_2': 'FAKESECRET222222',
        'CCXT_MCP_SANDBOX_2': '${user_config.sandbox_2}',
        'CCXT_MCP_TRADING_2': '${user_config.trading_2}',
        'CCXT_MCP_DEMO_2': '${user_config.demo_2}',
        'CCXT_MCP_PREDICTION_2': '${user_config.prediction_2}',
    }, () => {
        const config = loadConfig ();
        const kraken: any = config.accounts['kraken'];
        assert.equal (kraken.sandbox, true);
        assert.equal (kraken.trading, true);
        assert.equal (kraken.demo ?? false, false);
        assert.equal (kraken.prediction ?? false, false);
        assert.equal (config.problems.length, 0, config.problems.join ('; '));
    });
});

test ('unsubstituted ${...} global flags and cap are ignored (no mode, no NaN cap)', () => {
    withConfig ({}, {
        'CCXT_MCP_EXCHANGE': 'binance', 'CCXT_MCP_APIKEY': 'FAKEKEY111111', 'CCXT_MCP_SECRET': 'FAKESECRET111111',
        'CCXT_MCP_SANDBOX': '${user_config.sandbox}',
        'CCXT_MCP_DEMO': '${user_config.demo}',
        'CCXT_MCP_PREDICTION': '${user_config.prediction}',
        'CCXT_MCP_TRADING': '${user_config.trading}',
        'CCXT_MCP_MAX_ORDER_VALUE': '${user_config.max_order_value}',
    }, () => {
        const config = loadConfig ();
        const account: any = config.accounts['default'];
        assert.equal (account.exchange, 'binance');
        assert.equal (account.sandbox ?? false, false);
        assert.equal (account.demo ?? false, false);
        assert.equal (account.prediction ?? false, false);
        assert.equal (account.trading ?? false, false);
        // before the hardening this was Number ('${...}') === NaN
        assert.ok (!Number.isNaN (account.maxOrderValue), 'maxOrderValue must not be NaN');
        assert.ok (!config.problems.some ((problem) => problem.includes ('${') || problem.includes ('maxOrderValue')), config.problems.join ('; '));
    });
});

test ('real per-slot values still win over the global after the template hardening', () => {
    withConfig ({}, {
        'CCXT_MCP_EXCHANGE': 'binance', 'CCXT_MCP_APIKEY': 'FAKEKEY111111', 'CCXT_MCP_SECRET': 'FAKESECRET111111',
        'CCXT_MCP_SANDBOX': 'true',
        'CCXT_MCP_EXCHANGE_2': 'kraken', 'CCXT_MCP_APIKEY_2': 'FAKEKEY222222', 'CCXT_MCP_SECRET_2': 'FAKESECRET222222',
        'CCXT_MCP_SANDBOX_2': 'false',
        'CCXT_MCP_MAX_ORDER_VALUE_2': '25',
    }, () => {
        const config = loadConfig ();
        assert.equal (config.accounts['default'].sandbox, true);
        assert.equal (config.accounts['kraken'].sandbox ?? false, false);
        assert.equal ((config.accounts['kraken'] as any).maxOrderValue, 25);
    });
});

test ('tool profile: settings.tools is read as a string or a list, CCXT_MCP_TOOLS wins, and a blank variable is "not set"', () => {
    const tools = (settings: any, env: string | undefined): string => {
        let value = '';
        withConfig ({ settings }, { 'CCXT_MCP_TOOLS': env }, () => {
            const config = loadConfig ();
            assert.equal (config.problems.length, 0);
            value = config.settings.tools;
        });
        return value;
    };
    assert.equal (tools ({}, undefined), 'all');
    assert.equal (tools ({ 'tools': 'core' }, undefined), 'core');
    assert.equal (tools ({ 'tools': [ 'core', 'describe_method' ] }, undefined), 'core,describe_method');
    assert.equal (tools ({ 'tools': 'core' }, 'all'), 'all');
    assert.equal (tools ({}, ' get_tickers,get_ohlcv '), 'get_tickers,get_ohlcv');
    // a host that passes an unfilled form field as an empty variable must not change the profile
    assert.equal (tools ({ 'tools': 'core' }, ''), 'core');
    assert.equal (tools ({}, '   '), 'all');
});
