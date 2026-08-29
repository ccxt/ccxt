import assert from 'assert';
import { Exchange } from "../../../../ccxt.js";
import Precise from '../../../base/Precise.js';
import testSharedMethods from './test.sharedMethods.js';
import type { Dict } from '../../../base/types.js';

function testBalance (exchange: Exchange, skippedProperties: object, method: string, entry: object) {
    const format = {
        'free': {},
        'used': {},
        'total': {},
        'info': {},
    };
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format);
    const logText = testSharedMethods.logTemplate (exchange, method, entry);
    //
    const codesTotal = Object.keys ((entry as Dict)['total']);
    const codesFree = Object.keys ((entry as Dict)['free']);
    const codesUsed = Object.keys ((entry as Dict)['used']);
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, codesTotal, 'total');
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, codesFree, 'free');
    testSharedMethods.assertNonEmtpyArray (exchange, skippedProperties, method, codesUsed, 'used');
    let allCodes = exchange.arrayConcat (codesTotal, codesFree);
    allCodes =  exchange.arrayConcat (allCodes, codesUsed);
    const codesLength = codesTotal.length;
    const freeLength = codesFree.length;
    const usedLength = codesUsed.length;
    assert ((codesLength === freeLength) || (codesLength === usedLength), 'free and total and used codes have different lengths' + logText);
    for (let i = 0; i < allCodes.length; i++) {
        const code = allCodes[i];
        // testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, code);
        assert (code in (entry as Dict)['total'], 'code ' + code + ' not in total' + logText);
        assert (code in (entry as Dict)['free'], 'code ' + code + ' not in free' + logText);
        assert (code in (entry as Dict)['used'], 'code ' + code + ' not in used' + logText);
        const total = exchange.safeString ((entry as Dict)['total'], code);
        const free = exchange.safeString ((entry as Dict)['free'], code);
        const used = exchange.safeString ((entry as Dict)['used'], code);
        assert (total !== undefined, 'total is undefined' + logText);
        assert (free !== undefined, 'free is undefined' + logText);
        assert (used !== undefined, 'used is undefined' + logText);
        assert (Precise.stringGe (total, '0'), 'total is not positive' + logText);
        assert (Precise.stringGe (free, '0'), 'free is not positive' + logText);
        assert (Precise.stringGe (used, '0'), 'used is not positive' + logText);
        const sumFreeUsed = Precise.stringAdd (free, used);
        assert (Precise.stringEq (total, sumFreeUsed), 'free and used do not sum to total' + logText);
    }
}

export default testBalance;
