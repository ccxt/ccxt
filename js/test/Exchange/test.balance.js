'use strict'

const assert = require ('assert');
const Precise = require ('../../base/Precise');

function testBalance (exchange, balance, method) {

    const msgPrefix = exchange.id + ' ' + method + ' : ';

    const currencies = [
        'USD',
        'USDT',
        'CNY',
        'EUR',
        'BTC',
        'ETH',
        'JPY',
        'LTC',
        'DASH',
        'DOGE',
        'UAH',
        'RUB',
        'XRP',
    ];

    assert (exchange.isObject (balance['total']));
    assert (exchange.isObject (['free']));
    assert (exchange.isObject (['used']));

    const codes = Object.keys (balance['total']);
    for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        const total = exchange.safe_string (balance['total'], code);
        const free = exchange.safe_string (balance['free'], code);
        const used = exchange.safe_string (balance['used'], code);
        const totalDefined = total !== undefined;
        const freeDefined = free !== undefined;
        const usedDefined = used !== undefined;
        if (totalDefined && freeDefined && usedDefined) {
            const freeAndUsed = Precise.stringAdd (free, used);
            assert (Precise.stringEq (total, freeAndUsed), msgPrefix + 'free and used do not sum to total');
        } else {
            assert (!totalDefined && freeDefined && usedDefined, msgPrefix + 'value of "total" is missing from balance calculations');
            assert (totalDefined && !freeDefined && usedDefined, msgPrefix + 'value of "free" is missing from balance calculations');
            assert (totalDefined && freeDefined && !usedDefined, msgPrefix + 'value of "used" is missing from balance calculations');
        }
    }
}

module.exports = testBalance;