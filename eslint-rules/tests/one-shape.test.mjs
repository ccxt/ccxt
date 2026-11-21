import { test } from 'node:test';
import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import rule from '../one-shape.mjs';

const tester = new RuleTester ({ languageOptions: { parser: tsParser, ecmaVersion: 2020, sourceType: 'module' } });
const wrap = (body) => 'class X { async m (symbol: string, params = {}) {\n' + body + '\n} }';
const opts = [ { baseline: {} } ];
const ok = (body) => ({ code: wrap (body), options: opts });
const bad = (body, messageId) => ({ code: wrap (body), options: opts, errors: [ { messageId } ] });

test ('one-shape', () => {
    tester.run ('one-shape', rule, {
        valid: [
            ok ("const request: Dict = {};\nrequest['symbol'] = symbol;\nconst response = await this.publicGetTicker (this.extend (request, params));\nconst data = this.safeDict (response, 'data', {});\nreturn data;"),
            ok ("if (symbol !== undefined) {\n    const response = await this.privateGetOrders (params);\n    return this.safeList (response, 'data', []);\n}\nconst response = await this.privateGetAllOrders (params);\nreturn this.safeList (response, 'data', []);"),
            ok ("const rows: Dict[] = [];\nfor (let i = 0; i < 3; i++) {\n    rows.push ({ 'i': i });\n}\nreturn rows;"),
            ok ("let since: Int = undefined;\nsince = this.safeInteger (params, 'since');\nreturn since;"),
            ok ("if (Array.isArray (params)) {\n    return params;\n}\nreturn undefined;"),
            ok ("let url = '/api/' + symbol;\nurl = url + '?x=1';\nreturn url;"),
            ok ("const query = this.omit (params, 'type');\nif (typeof query === 'object') {\n    return query;\n}\nreturn undefined;"),
            { code: wrap ("let response = undefined;\nif (symbol) {\n    response = await this.a ();\n}\nreturn response;"), options: [ { baseline: { 'file.ts': 1 } } ], filename: 'file.ts' },
        ],
        invalid: [
            bad ("let response = undefined;\nif (symbol !== undefined) {\n    response = await this.privateGetOrder (params);\n} else {\n    response = await this.privateGetOrders (params);\n}\nreturn response;", 'seededEndpoint'),
            bad ("let response: Dict = {};\nif (symbol === 'x') {\n    response = await this.publicGetA (params);\n}\nreturn response;", 'mixedKinds'),
            bad ("let trades: List = [];\ntrades = await this.publicGetTrades (params);\nreturn trades;", 'mixedKinds'),
            bad ("let response: Dict;\nif (symbol) {\n    response = await this.privateGetA (params);\n} else {\n    response = await this.privateGetB (params);\n}\nreturn response;", 'seededEndpoint'),
            bad ("const response = await this.privateGetActivities (params);\nif (Array.isArray (response)) {\n    return response;\n}\nreturn [ response ];", 'shapeTest'),
            bad ("const data = this.safeValue (params, 'data');\nif (typeof data === 'string') {\n    return data;\n}\nreturn undefined;", 'shapeTest'),
            bad ("let result = {};\nresult = 'none';\nreturn result;", 'mixedKinds'),
            bad ("const response = await this.publicGetTime (params);\nconst isList = Array.isArray (response);\nreturn isList;", 'shapeTest'),
            { code: wrap ("let response = undefined;\nif (symbol) {\n    response = await this.a ();\n}\nreturn response;"), options: [ { baseline: {} } ], filename: 'file.ts', errors: [ { messageId: 'seededEndpoint' } ] },
        ],
    });
});
