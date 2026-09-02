


import assert from 'assert';
import ccxt from '../../../ccxt.js';
import type { Dict } from '../../base/types.js';

function testMergeBalanceAccount () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // isolated margin hands one account per market; the same code across two
    // markets is summed into a single flat entry, missing fields stay undefined
    const result: Dict = {};
    const btcAccount = exchange.account ();
    btcAccount['free'] = '1';
    btcAccount['used'] = '0.5';
    btcAccount['debt'] = '0.1';
    exchange.mergeBalanceAccount (result, 'BTC', btcAccount);
    assert (exchange.safeString (result['BTC'], 'free') === '1');
    const btcAccount2 = exchange.account ();
    btcAccount2['free'] = '2';
    btcAccount2['used'] = '0.25';
    btcAccount2['total'] = '2.25';
    exchange.mergeBalanceAccount (result, 'BTC', btcAccount2);
    assert (exchange.safeString (result['BTC'], 'free') === '3');
    assert (exchange.safeString (result['BTC'], 'used') === '0.75');
    assert (exchange.safeString (result['BTC'], 'total') === '2.25');
    assert (exchange.safeString (result['BTC'], 'debt') === '0.1');
    const usdtAccount = exchange.account ();
    usdtAccount['free'] = '5';
    exchange.mergeBalanceAccount (result, 'USDT', usdtAccount);
    assert (exchange.safeString (result['USDT'], 'free') === '5');
    assert (exchange.safeString (result['USDT'], 'used') === undefined);
    const keys = Object.keys (result);
    assert (keys.length === 2);
    // the merged dict is a regular safeBalance input
    const balance = exchange.safeBalance (result);
    assert (balance['BTC']['free'] === 3);
    assert (exchange.safeNumber (balance['free'], 'USDT') === 5);
    assert (exchange.safeNumber (balance['debt'], 'BTC') === 0.1);
}

export default testMergeBalanceAccount;
