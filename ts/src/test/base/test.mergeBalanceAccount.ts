import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testMergeBalanceAccount () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // isolated margin hands one account per market; the same code across two
    // markets is summed into a single flat entry, missing fields stay undefined.
    // the helper returns the merged dict and callers reassign it: PHP arrays are
    // passed by value, so mutating the argument alone is invisible there
    // `any` (not Dict): mergeBalanceAccount returns `any` in the Go port, and a
    // map[string]any local cannot take it without a type assertion
    let result: any = {};
    const btcAccount = exchange.account ();
    btcAccount['free'] = '1';
    btcAccount['used'] = '0.5';
    btcAccount['debt'] = '0.1';
    result = exchange.mergeBalanceAccount (result, 'BTC', btcAccount);
    assert (exchange.safeString (result['BTC'], 'free') === '1');
    const btcAccount2 = exchange.account ();
    btcAccount2['free'] = '2';
    btcAccount2['used'] = '0.25';
    btcAccount2['total'] = '2.25';
    result = exchange.mergeBalanceAccount (result, 'BTC', btcAccount2);
    assert (exchange.safeString (result['BTC'], 'free') === '3');
    assert (exchange.safeString (result['BTC'], 'used') === '0.75');
    assert (exchange.safeString (result['BTC'], 'total') === '2.25');
    assert (exchange.safeString (result['BTC'], 'debt') === '0.1');
    const usdtAccount = exchange.account ();
    usdtAccount['free'] = '5';
    result = exchange.mergeBalanceAccount (result, 'USDT', usdtAccount);
    assert (exchange.safeString (result['USDT'], 'free') === '5');
    assert (exchange.safeString (result['USDT'], 'used') === undefined);
    const keys = Object.keys (result);
    assert (keys.length === 2);
    // the merged dict is a regular safeBalance input. safeBalance parses to a number,
    // and each port spells that number differently (JS "3", PHP "3.0"), so assert on
    // the parsed value rather than on its string form
    const balance = exchange.safeBalance (result);
    assert (exchange.safeNumber (balance['BTC'], 'free') === exchange.parseNumber ('3'));
    assert (exchange.safeNumber (balance['free'], 'USDT') === exchange.parseNumber ('5'));
    assert (exchange.safeNumber (balance['debt'], 'BTC') === exchange.parseNumber ('0.1'));
}

export default testMergeBalanceAccount;
