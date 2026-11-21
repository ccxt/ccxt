// node -r ./build/use-typescript6.cjs --test eslint-rules/tests/safe-reader-default.test.mjs
import { test } from 'node:test';
import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import rule from '../safe-reader-default.mjs';

process.env.CCXT_SAFE_NO_BASELINE = '1';
const ruleTester = new RuleTester ({ 'languageOptions': { 'parser': tsParser, 'ecmaVersion': 2020, 'sourceType': 'module' } });
const wrap = (body) => 'export default class x { handle (client: any, message: any, market: any) {\n' + body + '\n} }';
const err = (reader, use) => ({ 'messageId': 'noDefault', 'data': { reader, use } });

test ('safe-reader-default', () => {
    ruleTester.run ('safe-reader-default', rule, {
        'valid': [
            // pro/bitvavo.ts handleOrder
            wrap ("const symbol = this.safeString (market, 'symbol', '');\nconst messageHash = 'order:' + symbol;"),
            // pro/weex.ts handleBidAsk
            wrap ("const symbol = this.safeString (market, 'symbol');\nif (symbol !== undefined) {\n    const messageHash = 'bidask::' + symbol;\n}"),
            // base/Exchange.ts priceToPrecision
            wrap ("const marketSymbol = this.safeString (market, 'symbol', '');\nthrow new Error (this.id + ' price of ' + marketSymbol);"),
            // a guard that exits first
            wrap ("const marketId = this.safeString (message, 'market');\nif (marketId === undefined) {\n    return;\n}\nconst parts = marketId.split ('-');"),
            // && chain and ternary guards
            wrap ("const ts = this.safeInteger (message, 'timestamp');\nconst late = (ts !== undefined) && (ts < 1000);\nconst t2 = (ts === undefined) ? 0 : ts + 1;"),
            // no operator use: passed on, compared for equality, stored
            wrap ("const id = this.safeString (message, 'id');\nconst same = (id === 'abc');\nthis.orders[id] = message;\nconst order = this.parseOrder (message, market);"),
            // safeNumber with a default used in arithmetic
            wrap ("const amount = this.safeNumber (message, 'amount', 0);\nconst total = amount + 1;"),
            // reassigned local is not judged
            wrap ("let side = this.safeString (message, 'side');\nside = 'buy';\nconst upper = side.toUpperCase ();"),
        ],
        'invalid': [
            // pro/bitvavo.ts handleOrder before this unit
            { 'code': wrap ("const symbol = this.safeString (market, 'symbol');\nconst messageHash = 'order:' + symbol;"), 'errors': [ err ('safeString', '+') ] },
            // pro/weex.ts handleBidAsk before this unit: the concat is outside the test
            { 'code': wrap ("const symbol = this.safeString (market, 'symbol');\nif (symbol !== undefined) {\n    this.bidsasks[symbol] = 1;\n}\nconst messageHash = 'bidask::' + symbol;"), 'errors': [ err ('safeString', '+') ] },
            // inline read in a concat
            { 'code': wrap ("const messageHash = 'myTrades:' + this.safeString (market, 'symbol');"), 'errors': [ err ('safeString', '+') ] },
            // ordering compare
            { 'code': wrap ("const ts = this.safeInteger (message, 'timestamp');\nif (ts > 1000) {\n    return;\n}"), 'errors': [ err ('safeInteger', '>') ] },
            // string method
            { 'code': wrap ("const marketId = this.safeString (message, 'market');\nconst parts = marketId.split ('-');"), 'errors': [ err ('safeString', '.split ()') ] },
            // safeNumber arithmetic
            { 'code': wrap ("const amount = this.safeNumber (message, 'amount');\nlet total = 0;\ntotal += amount;"), 'errors': [ err ('safeNumber', '+=') ] },
            // wrong polarity of the test
            { 'code': wrap ("const status = this.safeString (message, 'status');\nif (status === undefined) {\n    const s = status.toLowerCase ();\n}"), 'errors': [ err ('safeString', '.toLowerCase ()') ] },
        ],
    });
});
