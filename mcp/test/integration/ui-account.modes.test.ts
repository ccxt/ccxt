import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerSecret, clearSecrets } from '../../ts/redact.js';
import { AccountExchange } from '../helpers/fake-ccxt.js';
import { ACCOUNT_CALLS, callRaw, connectAccount as connect, withUiMode } from '../helpers/ui-client.js';

// The account views, over a real client <-> server pair (see test/helpers/ui-client.ts). Same
// contract as the market views (ui.*.test.ts): a compact envelope for the model, the dataset
// for the view — and only for a host that renders it. This file: where the view payload
// goes (CCXT_MCP_UI, hosts without MCP Apps), errors, and redaction.

test ('account views: a host without the MCP Apps extension gets the text summary only — no structuredContent', async () => {
    const client = await connect ({ 'ui': false });
    for (const [ name, args, fallback ] of ACCOUNT_CALLS) {
        const { result, envelope } = await callRaw (client, name, args);
        assert.equal (envelope.ok, true, name);
        assert.equal (envelope.meta.ui, 'unsupported', name);
        assert.match (envelope.meta.notice, /did not advertise MCP Apps/, name);
        assert.ok (envelope.meta.notice.includes (fallback), name + ' names its fallback tool');
        assert.deepEqual (Object.keys (result), [ 'content' ], name + ' is a plain text result');
    }
    await client.close ();
});

test ('account views: CCXT_MCP_UI=always attaches the payload for any host, =off never does and drops the ui:// link', async () => {
    await withUiMode ('always', async () => {
        const client = await connect ({ 'ui': false });
        for (const [ name, args, fallback ] of ACCOUNT_CALLS) {
            const { result, envelope } = await callRaw (client, name, args);
            assert.equal (envelope.meta.ui, 'displayed', name);
            assert.ok (!envelope.meta.notice.includes (fallback), name);
            assert.equal (result.structuredContent.view, name.replace ('show_', ''), name);
        }
        await client.close ();
    });
    await withUiMode ('off', async () => {
        const client = await connect ();
        for (const [ name, args, fallback ] of ACCOUNT_CALLS) {
            const { result, envelope } = await callRaw (client, name, args);
            assert.equal (envelope.ok, true, name);
            assert.equal (envelope.meta.ui, 'off', name);
            assert.match (envelope.meta.notice, /CCXT_MCP_UI=off/, name);
            assert.ok (envelope.meta.notice.includes (fallback), name);
            assert.ok (!('structuredContent' in result), name + ' must not carry a view payload');
        }
        const { tools } = await client.listTools ();
        for (const [ name ] of ACCOUNT_CALLS) {
            const tool: any = tools.find ((entry: any) => entry.name === name);
            assert.ok (tool !== undefined, name + ' must stay listed');
            assert.ok (tool._meta === undefined || !('ui' in tool._meta), name + ' must not advertise a view');
        }
        await client.close ();
    });
});

test ('account views: an unknown account is UNKNOWN_ACCOUNT, plain text, no view payload', async () => {
    const client = await connect ();
    const calls: [ string, any ][] = [
        ...ACCOUNT_CALLS.map (([ name ]) => [ name, { 'account': 'nope' } ] as [ string, any ]),
        [ 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'nope' } ],
    ];
    for (const [ name, args ] of calls) {
        const { result, envelope } = await callRaw (client, name, args);
        assert.equal (result.isError, true, name);
        assert.equal (envelope.ok, false, name);
        assert.equal (envelope.error.code, 'UNKNOWN_ACCOUNT', name);
        assert.match (envelope.error.message, /configured accounts: main, paper, demo/, name);
        assert.ok (!('structuredContent' in result), name);
    }
    await client.close ();
});

test ('account views: an exchange failure takes the normal error path (text only)', async () => {
    class Failing extends AccountExchange {
        async fetchBalance (): Promise<any> {
            throw new Error ('fakex down for maintenance');
        }

        async fetchOpenOrders (): Promise<any> {
            throw new Error ('fakex down for maintenance');
        }

        async fetchPositions (): Promise<any> {
            throw new Error ('fakex down for maintenance');
        }
    }
    const client = await connect ({ 'exchangeClass': Failing });
    for (const [ name, args ] of ACCOUNT_CALLS) {
        const { result, envelope } = await callRaw (client, name, args);
        assert.equal (result.isError, true, name);
        assert.equal (envelope.ok, false, name);
        assert.match (envelope.error.message, /down for maintenance/, name);
        assert.ok (!('structuredContent' in result), name);
    }
    await client.close ();
});

test ('account views: with hideDisabledTools and no account they are not listed; show_chart still is', async () => {
    const client = await connect ({ 'accounts': {}, 'settings': { 'hideDisabledTools': true } });
    const names = (await client.listTools ()).tools.map ((tool: any) => tool.name);
    for (const [ name ] of ACCOUNT_CALLS) {
        assert.ok (!names.includes (name), name);
    }
    assert.ok (names.includes ('show_chart'));
    await client.close ();
});

test ('secrets: a credential echoed by account data is redacted in text AND in the view payload', async () => {
    const SECRET = 'LEAKEDKEY99887766';
    class Leaky extends AccountExchange {
        async fetchOpenOrders (symbol?: string, since?: number, limit?: number, params: any = {}): Promise<any> {
            const orders = await super.fetchOpenOrders (symbol, since, limit, params);
            orders[0].clientOrderId = 'cid-' + SECRET;
            orders[0].id = SECRET;
            return orders;
        }
    }
    registerSecret (SECRET);
    try {
        const client = await connect ({ 'exchangeClass': Leaky });
        const orders = await callRaw (client, 'show_orders', { 'account': 'main' });
        assert.equal (orders.view.orders.length, 5);
        assert.ok (!JSON.stringify (orders.result).includes (SECRET), 'show_orders leaked a registered secret');
        const chart = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
        assert.equal (chart.view.orders.length, 3);
        assert.ok (!JSON.stringify (chart.result).includes (SECRET), 'show_chart leaked a registered secret');
        await client.close ();
    } finally {
        clearSecrets ();
    }
});
