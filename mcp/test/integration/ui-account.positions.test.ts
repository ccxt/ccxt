import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POSITION_FIELDS } from '../../ts/format.js';
import { AccountExchange, FakeExchange } from '../helpers/fake-ccxt.js';
import { assertNoInfo, callRaw, callsTo, connectAccount as connect } from '../helpers/ui-client.js';

// The account views, over a real client <-> server pair (see test/helpers/ui-client.ts). Same
// contract as the market views (ui.*.test.ts): a compact envelope for the model, the dataset
// for the view — and only for a host that renders it. This file: show_positions.

test ('show_positions: open positions for the view; count, total PnL and compact rows for the model', async () => {
    const client = await connect ();
    const { result, envelope, view } = await callRaw (client, 'show_positions', { 'account': 'paper' });
    assert.equal (envelope.ok, true);
    assert.deepEqual (Object.keys (view), [ 'view', 'account', 'exchange', 'exchangeName', 'environment', 'positions', 'pnlTotals' ]);
    assert.deepEqual (view.pnlTotals, [ { 'currency': 'USDT', 'positions': 3, 'unrealizedPnl': -9.25 } ]);
    assert.equal (view.view, 'positions');
    assert.equal (view.account, 'paper');
    assert.equal (view.environment, 'sandbox');
    // zero contracts, zero notional and the null row are not open positions
    assert.deepEqual (view.positions.map ((position: any) => position.symbol), [ 'BTC/USDT:USDT', 'ETH/USDT:USDT', 'DOGE/USDT:USDT' ]);
    for (const position of view.positions) {
        for (const key of Object.keys (position)) {
            assert.ok (POSITION_FIELDS.includes (key), 'unexpected position field ' + key);
        }
    }
    assert.deepEqual (envelope.data, {
        'count': 3,
        'unrealizedPnl': -9.25,
        'unrealizedPnlCurrency': 'USDT',
        'positions': [
            { 'symbol': 'BTC/USDT:USDT', 'side': 'long', 'contracts': 2, 'entryPrice': 100, 'markPrice': 110, 'unrealizedPnl': 20.5, 'leverage': 5 },
            { 'symbol': 'ETH/USDT:USDT', 'side': 'short', 'contracts': 3, 'entryPrice': 100, 'markPrice': 110, 'unrealizedPnl': -30.25, 'leverage': 5 },
            { 'symbol': 'DOGE/USDT:USDT', 'side': 'long', 'contracts': '7', 'entryPrice': 100, 'markPrice': 110, 'unrealizedPnl': 0.5, 'leverage': 5 },
        ],
    });
    assert.equal (envelope.meta.account, 'paper');
    assert.equal (envelope.meta.environment, 'sandbox');
    assert.equal (envelope.meta.ui, 'displayed');
    assertNoInfo (result, 'show_positions');
    await client.close ();
});

test ('show_positions: symbols, marketType and params reach fetchPositions; a missing PnL leaves the total out', async () => {
    class PartialPnl extends AccountExchange {
        async fetchPositions (symbols?: string[], params: any = {}): Promise<any> {
            const positions = await super.fetchPositions (symbols, params);
            for (const position of positions) {
                if (position !== null && position.symbol === 'ETH/USDT:USDT') {
                    position.unrealizedPnl = undefined;
                }
            }
            return positions;
        }
    }
    const client = await connect ({ 'exchangeClass': PartialPnl });
    const { envelope, view } = await callRaw (client, 'show_positions', { 'account': 'main', 'symbols': [ 'BTC/USDT:USDT', 'ETH/USDT:USDT' ], 'marketType': 'swap', 'params': { 'settle': 'USDT' } });
    assert.deepEqual (callsTo ('fetchPositions'), [ [ 'fetchPositions', [ [ 'BTC/USDT:USDT', 'ETH/USDT:USDT' ], { 'settle': 'USDT', 'type': 'swap' } ] ] ]);
    assert.equal (view.positions.length, 2);
    assert.equal (envelope.data.count, 2);
    assert.ok (!('unrealizedPnl' in envelope.data), 'a partial sum must not be reported as the total');
    assert.ok (!('unrealizedPnlCurrency' in envelope.data) && !('unrealizedPnlByCurrency' in envelope.data));
    assert.deepEqual (view.pnlTotals, [ { 'currency': 'USDT', 'positions': 2 } ]);
    assert.match (envelope.meta.notice, /no unrealized PnL total for USDT: not every position reports it/);
    await client.close ();
});

test ('show_positions: PnL in different settle currencies is totalled per currency, never added up', async () => {
    class MixedSettle extends AccountExchange {
        constructor (config: Record<string, any> = {}) {
            super (config);
            // the inverse contract is a loaded market (settle BTC); the USDC one is not, and
            // is read from its symbol
            this.markets = { ...this.markets, 'BTC/USD:BTC': { ...this.markets['BTC/USDT'], 'symbol': 'BTC/USD:BTC', 'type': 'swap', 'base': 'BTC', 'quote': 'USD', 'settle': 'BTC', 'inverse': true } };
        }

        async fetchPositions (): Promise<any> {
            const position = (symbol: string, side: string, unrealizedPnl: any) => ({ symbol, side, 'contracts': 1, unrealizedPnl, 'info': { 'raw': 'position-payload' } });
            return [ position ('BTC/USDT:USDT', 'long', 150), position ('BTC/USD:BTC', 'short', -0.02), position ('ETH/USDT:USDT', 'long', 25.5), position ('SOL/USDC:USDC', 'long', undefined) ];
        }
    }
    const client = await connect ({ 'exchangeClass': MixedSettle });
    const { result, envelope, view } = await callRaw (client, 'show_positions', { 'account': 'main' });
    assert.equal (envelope.data.count, 4);
    // 150 USDT and -0.02 BTC are not 149.98 of anything
    assert.ok (!('unrealizedPnl' in envelope.data) && !('unrealizedPnlCurrency' in envelope.data));
    assert.deepEqual (envelope.data.unrealizedPnlByCurrency, { 'USDT': 175.5, 'BTC': -0.02 });
    assert.deepEqual (view.pnlTotals, [
        { 'currency': 'USDT', 'positions': 2, 'unrealizedPnl': 175.5 },
        { 'currency': 'BTC', 'positions': 1, 'unrealizedPnl': -0.02 },
        { 'currency': 'USDC', 'positions': 1 },
    ]);
    assert.match (envelope.meta.notice, /positions settle in 3 currencies \(USDT, BTC, USDC\): unrealized PnL is totalled per currency in unrealizedPnlByCurrency and must not be added across them/);
    assert.match (envelope.meta.notice, /no unrealized PnL total for USDC: not every position reports it/);
    assertNoInfo (result, 'show_positions');
    await client.close ();
});

test ('show_positions: no positions is an ok, empty view without a PnL total', async () => {
    const client = await connect ();
    const { envelope, view } = await callRaw (client, 'show_positions', { 'account': 'main', 'symbols': [ 'SOL/USDT:USDT' ] });
    assert.deepEqual (view.positions, []);
    assert.deepEqual (view.pnlTotals, []);
    assert.deepEqual (envelope.data, { 'count': 0, 'positions': [] });
    await client.close ();
});

test ('get_positions and show_positions return the same rows — and the same NOT_SUPPORTED on a spot-only exchange', async () => {
    const client = await connect ();
    for (const args of [ { 'account': 'main' }, { 'account': 'main', 'symbols': [ 'ETH/USDT:USDT' ] } ]) {
        const data = await callRaw (client, 'get_positions', args);
        const shown = await callRaw (client, 'show_positions', args);
        assert.deepEqual (shown.view.positions, data.envelope.data, JSON.stringify (args));
        assert.equal (shown.envelope.data.count, data.envelope.meta.count);
    }
    await client.close ();
    const plain = await connect ({ 'exchangeClass': FakeExchange });
    const data = await callRaw (plain, 'get_positions', { 'account': 'main' });
    const shown = await callRaw (plain, 'show_positions', { 'account': 'main' });
    assert.equal (shown.envelope.error.code, 'NOT_SUPPORTED');
    assert.deepEqual (shown.envelope, data.envelope);
    assert.ok (!('structuredContent' in shown.result));
    await plain.close ();
});
