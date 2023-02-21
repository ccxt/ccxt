'use strict'

const assert = require ('assert');
const sharedMethods = require ('./test.sharedMethods.js');
const Precise = require ('../../base/Precise');

function testBalance (exchange, entry, method) {
    const format = {
        'free': {},
        'used': {},
        'total': {},
        'info': {},
    };
    const emptyNotAllowedFor = [ 'free', 'used', 'total' ];
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    const logText = sharedMethods.logTemplate (exchange, method, entry);
    //
    const codes = Object.keys (entry['total']);
    for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        sharedMethods.reviseCurrencyCode (exchange, method, entry, code);
        const total = exchange.safeString (entry['total'], code);
        const free = exchange.safeString (entry['free'], code);
        const used = exchange.safeString (entry['used'], code);
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