import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerSecret, clearSecrets } from '../../ts/redact.js';
import { FakeExchange } from '../helpers/fake-ccxt.js';
import { callRaw, connect, connectUi, T0, UI_CAPABILITIES } from '../helpers/ui-client.js';

// MCP Apps UI (io.modelcontextprotocol/ui), over a real client <-> server pair (see
// test/helpers/ui-client.ts). Secrets: a credential echoed by exchange data is
// redacted in the text AND in the view payload.

const SECRET_KEY = 'FAKEKEY-UI-9f3c1e77a0';

// an exchange whose public payloads echo a credential back (signed-URL echoes and
// account-tagged labels are the real-world shape of this)
class LeakyExchange extends FakeExchange {
    name = 'Fakex [' + SECRET_KEY + ']';

    async fetchOrderBook (symbol: string): Promise<any> {
        return { 'symbol': symbol + '?key=' + SECRET_KEY, 'timestamp': T0, 'datetime': 'sig ' + SECRET_KEY, 'bids': [ [ 49999, 1 ] ], 'asks': [ [ 50001, 1 ] ] };
    }

    async fetchTicker (symbol: string): Promise<any> {
        return { symbol, 'last': 50000, 'datetime': 'sig ' + SECRET_KEY, 'info': { 'key': SECRET_KEY } };
    }
}

// makeConfig builds a ResolvedConfig directly, so the secret registration that loadConfig
// performs for every account credential (ts/config.ts registerAccountSecrets) is mirrored
// here with registerSecret — the same call, on the same process-wide redactor that
// test/unit/redact.test.ts drives. Everything after that (tool -> run -> toUiContent ->
// redact) is the production path.
async function withRegisteredSecret (fn: () => Promise<void>): Promise<void> {
    clearSecrets ();
    registerSecret (SECRET_KEY, 'apiKey');
    try {
        await fn ();
    } finally {
        clearSecrets ();
    }
}

test ('secrets: a credential echoed by exchange data is redacted in text AND structuredContent', async () => {
    await withRegisteredSecret (async () => {
        const client = await connect ({ 'exchangeClass': LeakyExchange, 'capabilities': UI_CAPABILITIES });
        const calls: [ string, any ][] = [
            [ 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 } ],
            [ 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' } ],
            [ 'show_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] } ],
        ];
        for (const [ name, args ] of calls) {
            const { result, envelope } = await callRaw (client, name, args);
            assert.equal (envelope.ok, true, name);
            assert.ok (!JSON.stringify (result).includes (SECRET_KEY), name + ' leaked the apiKey');
            assert.equal (result.structuredContent.exchangeName, 'Fakex [[redacted:apiKey]]', name);
        }
        const book = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
        assert.equal (book.result.structuredContent.symbol, 'BTC/USDT?key=[redacted:apiKey]');
        assert.equal (book.result.structuredContent.datetime, 'sig [redacted:apiKey]');
        assert.equal (book.envelope.meta.symbol, 'BTC/USDT?key=[redacted:apiKey]');
        // the numeric payload around the redacted strings is untouched
        assert.deepEqual (book.result.structuredContent.bids, [ [ 49999, 1 ] ]);
        const tickers = await callRaw (client, 'show_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
        assert.equal (tickers.result.structuredContent.tickers[0].datetime, 'sig [redacted:apiKey]');
        // a secret passed in by the caller is not echoed back either
        const echoed = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': SECRET_KEY, 'limit': 3 });
        assert.ok (!JSON.stringify (echoed.result).includes (SECRET_KEY));
        assert.equal (echoed.result.structuredContent.symbol, '[redacted:apiKey]');
        await client.close ();
    });
});

test ('secrets: the view payload passes through untouched when nothing is registered', async () => {
    clearSecrets ();
    const client = await connectUi ({ 'exchangeClass': LeakyExchange });
    const { result } = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (result.structuredContent.exchangeName, 'Fakex [' + SECRET_KEY + ']');
    await client.close ();
});

// Regression: a credential made only of digits (exchange `uid`s usually are) must never be
// replaced inside a NUMBER. Redacting the serialized view turned the timestamp 1700000000000
// into 1[redacted:uid]0000 — no longer JSON — so every show_* call failed for that user;
// toUiContent now redacts string leaves only.
test ('secrets: a numeric credential that collides with a number must not break the view payload', async () => {
    clearSecrets ();
    registerSecret ('70000000', 'uid'); // substring of the fake candle timestamps 1700000000000…
    try {
        const client = await connectUi ();
        const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 });
        await client.close ();
        assert.equal (envelope.ok, true, 'show_chart failed: ' + JSON.stringify (envelope.error));
        assert.equal (result.structuredContent?.view, 'chart');
        assert.equal (result.structuredContent.candles.length, 3);
    } finally {
        clearSecrets ();
    }
});
