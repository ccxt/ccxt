// node -r ./build/use-typescript6.cjs --test eslint-rules/tests/no-untyped-enumeration.test.mjs
import { test } from 'node:test';
import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import rule from '../no-untyped-enumeration.mjs';

process.env.CCXT_SAFE_NO_BASELINE = '1';
const ruleTester = new RuleTester ({ 'languageOptions': { 'parser': tsParser, 'ecmaVersion': 2020, 'sourceType': 'module' } });
const wrap = (body, sig = 'parse (response: any, params: Dict = {}, symbols: Strings = undefined)') => 'export default class x {\n' + sig + ' {\n' + body + '\n}\n}';
const err = (messageId, data = undefined) => (data === undefined ? { messageId } : { messageId, data });

test ('no-untyped-enumeration', () => {
    ruleTester.run ('no-untyped-enumeration', rule, {
        'valid': [
            // bybit parseOrder: safeDict then Object.keys
            wrap ("const cumFeeDetail = this.safeDict (response, 'cumFeeDetail', {});\nconst feeCoins = Object.keys (cumFeeDetail);"),
            // typed parameter with a default
            wrap ('if (Object.keys (params).length > 0) { return; }'),
            // bybit addPaginationCursorToResult: declared list
            wrap ("const result = this.safeDict (response, 'result', {});\nconst data: Dict[] = this.safeListN (result, [ 'list', 'rows' ], []);\nconst dataLength = data.length;"),
            // declared Strings parameter, string reader, split result
            wrap ("const n = symbols.length;\nconst id = this.safeString (response, 'id', '');\nconst m = id.length;\nconst parts = id.split ('_');\nconst k = parts.length;"),
            // literal locals and a typed let
            wrap ('const request: Dict = {};\nconst keys = Object.keys (request);\nconst rows: List = [];\nfor (let i = 0; i < rows.length; i++) { }\nconst ks = Object.keys (request).length;'),
            // declared tuple return (bybit getBybitType)
            wrap ('const type = this.safeString (params, \'type\');\nreturn [ type, params ];', 'getBybitType (method: string, params: Dict = {}): [Str, Dict]'),
            // homogeneous array return and async declared tuple
            wrap ("return [ this.safeString (response, 'a'), this.safeString (response, 'b') ];", 'ids (response: Dict)'),
            wrap ("return [ this.safeBool (response, 'a'), this.safeBool (response, 'b') ];", 'async isUnifiedEnabled (response: Dict): Promise<[boolean, boolean]>'),
        ],
        'invalid': [
            // okx fetchDepositAddress: Object.keys on an untyped response
            { 'code': wrap ('const keys = Object.keys (response);'), 'errors': [ err ('enumerate', { 'name': 'keys' }) ] },
            // Object.values on a safeValue read
            { 'code': wrap ("const balances = this.safeValue (response, 'data');\nconst list = Object.values (balances);"), 'errors': [ err ('enumerate', { 'name': 'values' }) ] },
            // cast at the read site is not a typed value (okx parseCurrency)
            { 'code': wrap ('const chainsLength = (response as List).length;'), 'errors': [ err ('length') ] },
            // untyped let filled later (binance)
            { 'code': wrap ("let rows = undefined;\nrows = this.safeList (response, 'rows', []);\nfor (let i = 0; i < rows.length; i++) { }"), 'errors': [ err ('length') ] },
            // element of an untyped request (Exchange lighterSignCreateGroupedOrders)
            { 'code': wrap ("const orders = response['orders'];\nfor (let i = 0; i < orders.length; i++) { }"), 'errors': [ err ('length') ] },
            // property chain on this.options
            { 'code': wrap ("const length = this.options['crossMarginPairsData'].length;"), 'errors': [ err ('length') ] },
            // hashkey parseOrderSideAndReduceOnly: mixed tuple with no declared return type
            { 'code': wrap ("const side = this.safeString (response, 'side');\nreturn [ side, false ];", 'parseOrderSideAndReduceOnly (response: any)'), 'errors': [ err ('tuple') ] },
            // poloniex: dict + unknown values, no declared return type
            { 'code': wrap ("const request: Dict = {};\nreturn [ request, params, response ];", 'prepareRequest (response: any, params: Dict = {})'), 'errors': [ err ('tuple') ] },
        ],
    });
});
