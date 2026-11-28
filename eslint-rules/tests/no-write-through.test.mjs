// run: node --test eslint-rules/tests/no-write-through.test.mjs
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { RuleTester } from 'eslint';
import rule from '../no-write-through.mjs';

// @typescript-eslint needs the JS compiler API (typescript@6), see build/use-typescript6.cjs
const require = createRequire (import.meta.url);
require ('../../build/use-typescript6.cjs');
const tsParser = require ('@typescript-eslint/parser');

RuleTester.describe = (name, fn) => fn ();
RuleTester.it = (name, fn) => test (name, fn);
RuleTester.itOnly = (name, fn) => test (name, { only: true }, fn);

const ruleTester = new RuleTester ({
    languageOptions: { parser: tsParser, ecmaVersion: 2020, sourceType: 'module' },
});

const options = [ { ratchet: false } ];
const wrap = (body) => `class X { async m (symbol: string, params: Dict = {}, response: any = undefined) {\n${body}\n} }`;
const valid = (body) => ({ code: wrap (body), options });
const invalid = (body, messageIds) => ({ code: wrap (body), options, errors: messageIds.map ((messageId) => ({ messageId })) });

ruleTester.run ('no-write-through', rule, {
    valid: [
        valid ("const request: Dict = { 'symbol': symbol };\nrequest['limit'] = 100;"),
        valid ("params['type'] = 'spot';"),
        valid ("const rows: Dict[] = [];\nrows[0] = {};"),
        valid ("const ids: string[] = [];\nids[ids.length] = symbol;"),
        valid ("const result: Dict = {};\nif ('BTC' in result) { return result['BTC']; }"),
        valid ("const inner: Dict = {};\ninner['free'] = 1;\nconst outer: Dict = {};\nouter['BTC'] = inner;"),
        valid ("const data = this.safeDict (response, 'data', {});\nconst id = this.safeString (data, 'id');\nreturn this.omit (params, 'type');"),
        valid ("let counter: Dict = {};\ncounter['n'] = 1;"),
    ],
    invalid: [
        // binance fetchBalance: account[code]['free'] style nested write
        invalid ("const result: Dict = {};\nresult['BTC']['free'] = 1;", [ 'nested' ]),
        invalid ("this.options['fetchMarkets']['types'] = [ 'spot' ];", [ 'nested' ]),
        invalid ("const book: Dict = {};\nbook['bids'][0][1] = 0;", [ 'nested' ]),
        // ws: client.subscriptions[messageHash] = ...
        invalid ("const client = this.client ('url');\nclient.subscriptions[symbol] = true;", [ 'untypedWrite' ]),
        // untyped local request
        invalid ("const request = { 'symbol': symbol };\nrequest['limit'] = 100;", [ 'untypedWrite' ]),
        invalid ("const account = this.account ();\naccount['free'] = this.safeString (response, 'free');", [ 'untypedWrite' ]),
        invalid ("this.orders[symbol] = response;", [ 'untypedWrite' ]),
        invalid ("const orderbook = this.orderbooks[symbol];\norderbook['nonce'] = 1;", [ 'untypedWrite' ]),
        // `in`
        invalid ("if (symbol in this.markets) { return 1; }", [ 'untypedIn' ]),
        invalid ("if ('code' in response) { return 1; }", [ 'untypedIn' ]),
        invalid ("const client = this.client ('url');\nif (symbol in client.subscriptions) { return 1; }", [ 'untypedIn' ]),
        // delete
        invalid ("delete params['type'];", [ 'deleteOp' ]),
        invalid ("const client = this.client ('url');\ndelete client.subscriptions[symbol];", [ 'deleteOp' ]),
        invalid ("const r: Dict = {};\nr['a']['n'] += 1;", [ 'nested' ]),
    ],
});
