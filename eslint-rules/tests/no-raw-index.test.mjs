// node --test eslint-rules/tests/no-raw-index.test.mjs  (run with -r ./build/use-typescript6.cjs)
import { test } from 'node:test';
import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import rule from '../no-raw-index.mjs';

RuleTester.describe = (name, fn) => fn ();
RuleTester.it = (name, fn) => test (name, fn);
RuleTester.itOnly = RuleTester.it;

const ruleTester = new RuleTester ({
    'languageOptions': { 'parser': tsParser, 'ecmaVersion': 2020, 'sourceType': 'module' },
});

const wrap = (body) => 'class X { async m (params: Dict = {}, codes: Strings = undefined) {\n' + body + '\n} }';
const opts = [ { 'baseline': {} } ];

ruleTester.run ('no-raw-index', rule, {
    'valid': [
        // declared list read under its own loop bound (okx fetchStatus)
        wrap ('const data = this.safeList (response, \'data\', []) as List;\nfor (let i = 0; i < data.length; i++) { const event = data[i]; }'),
        // dict-typed local, any key (alpaca)
        wrap ('const snapshots: Dict = this.safeDict (response, \'snapshots\', {});\nconst entry = snapshots[marketId];'),
        // typed list with a literal index (apex sign)
        'class X { sign (path: string, api: string[] = [ \'public\' ]) { const apiName = api[0]; } }',
        // loop bound through a const length (gemini)
        wrap ('const symbols = this.symbols;\nconst n = symbols.length;\nfor (let i = 0; i < n; i++) { const symbol = symbols[i]; }'),
        // Exchange typed dict fields (okx handleErrors)
        wrap ('this.throwExactlyMatchedException (this.exceptions[\'exact\'], errorCode, feedback);\nconst w = this.options[\'recvWindow\'];'),
        // writes are not reads
        wrap ('const request: Dict = {};\nrequest[\'instId\'] = market;\nresponse[\'k\'] = 1;'),
        // let filled with one kind in branches (poloniex)
        wrap ('let market = undefined;\nif (symbol !== undefined) { market = this.market (symbol); }\nrequest[\'symbol\'] = market[\'id\'];'),
        // typed tuple readers (bitbank, okx)
        wrap ('const tagAndParams = this.handleParamString (params, \'tag\');\nconst tag = tagAndParams[0];\nconst until = this.handleUntilOption (\'end\', request, params)[0];'),
        // structure returned by a typed parser (hitbtc fetchTradingFees)
        wrap ('const fee = this.parseTradingFee (this.safeDict (response, i, {}));\nconst symbol = fee[\'symbol\'];'),
        // ratchet: findings at or under the baseline pass
        { 'code': wrap ('const x = response[\'data\'];'), 'filename': 'ts/src/foo.ts', 'options': [ { 'baseline': { 'ts/src/foo.ts': 1 } } ] },
        // out of scope: tests
        { 'code': wrap ('const x = response[\'data\'];'), 'filename': 'ts/src/test/foo.ts' },
    ].map ((c) => (typeof c === 'string' ? { 'code': c, 'options': opts } : { 'options': opts, ...c })),
    'invalid': [
        // untyped response indexed by a loop counter (okx fetchDepositWithdrawFees -> GetValue(response, i))
        [ wrap ('for (let i = 0; i < response.length; i++) { const feeInfo = response[i]; }'), 'dict' ],
        // untyped list from Promise.all (kucoin -> GetValue(responses, 0))
        [ wrap ('const responses = await Promise.all (promises);\nconst d = this.safeList (responses[0], \'data\', []);'), 'dict' ],
        // chained read: the inner read is native, the outer prints GetValue (binance fetchTradingLimits)
        [ wrap ('const market: Dict = this.safeDict (markets, i);\nconst a = market[\'limits\'][\'amount\'];'), 'dict' ],
        // declared list indexed by arithmetic (kraken -> GetValue(trades, length-1))
        [ wrap ('const trades = this.safeList (result, id, []);\nconst lastTrade = trades[trades.length - 1];'), 'list' ],
        // declared list indexed by a counter bound to ANOTHER list
        [ wrap ('const a: Dict[] = [];\nconst b: Dict[] = [];\nfor (let i = 0; i < a.length; i++) { const x = b[i]; }'), 'list' ],
        // let holding two kinds (dict on one path, list on the other)
        [ wrap ('let res = undefined;\nif (x) { res = this.safeDict (r, \'a\'); } else { res = this.safeList (r, \'b\'); }\nconst v = res[\'k\'];'), 'dict' ],
        // read on a call result that is not a typed tuple reader
        [ wrap ('const v = this.fetchAccounts ()[0];'), 'dict' ],
        // this.markets indexed by a variable (binance -> GetValue(this.Markets, symbol))
        [ wrap ('const m = this.markets[symbol];'), 'dict' ],
    ].map (([ code, messageId ]) => ({ code, 'options': opts, 'errors': [ { messageId } ] })),
});

test ('ratchet reports every finding once the file exceeds its baseline', () => {
    ruleTester.run ('no-raw-index', rule, {
        'valid': [],
        'invalid': [ {
            'code': wrap ('const a = response[\'x\'];\nconst b = response[\'y\'];'),
            'filename': 'ts/src/foo.ts',
            'options': [ { 'baseline': { 'ts/src/foo.ts': 1 } } ],
            'errors': [ { 'messageId': 'dict' }, { 'messageId': 'dict' } ],
        } ],
    });
});
