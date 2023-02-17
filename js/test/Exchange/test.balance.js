'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');
const Precise = require ('../../base/Precise');

function testBalance (exchange, balance, method) {
    const format = {
        'free': {},
        'used': {},
        'total': {},
        'info': {},
    };
    const neededValues = [ 'free', 'used', 'total', 'info' ];
    testCommonItems.testStructureKeys (exchange, method, balance, format, neededValues);
    const logText = testCommonItems.logTemplate (exchange, method, balance);
    //
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
            assert (Precise.stringEq (total, freeAndUsed), 'free and used do not sum to total' + logText);
        } else {
            assert (!totalDefined && freeDefined && usedDefined, 'value of "total" is missing from balance calculations' + logText);
            assert (totalDefined && !freeDefined && usedDefined, 'value of "free" is missing from balance calculations' + logText);
            assert (totalDefined && freeDefined && !usedDefined, 'value of "used" is missing from balance calculations' + logText);
        }
    }
}

module.exports = testBalance;