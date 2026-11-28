// node -r ./build/use-typescript6.cjs --test eslint-rules/tests/length-in-condition.test.mjs
import { test } from 'node:test';
import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import rule from '../length-in-condition.mjs';

process.env.CCXT_SAFE_NO_BASELINE = '1';
const ruleTester = new RuleTester ({ 'languageOptions': { 'parser': tsParser, 'ecmaVersion': 2020, 'sourceType': 'module' } });
const wrap = (body) => 'export default class x { m (symbols: Strings, s: string, params: Dict, list: string[]) {\n' + body + '\n} }';
const err = (name) => ({ 'messageId': 'lengthInCondition', 'data': { name } });

test ('length-in-condition', () => {
    ruleTester.run ('length-in-condition', rule, {
        'valid': [
            // pro/aster.ts watchTickers after the fix: the length goes into a plain local first
            wrap ("const symbolsNormalized = this.marketSymbols (symbols);\nlet symbolsLength = 0;\nif (symbolsNormalized !== undefined) {\n    symbolsLength = symbolsNormalized.length;\n}\nif ((symbolsNormalized === undefined) || (symbolsLength === 0)) {\n    throw new Error ('x');\n}"),
            // a loop bound is printed count () by its own PHP rule
            wrap ('for (let i = 0; i < list.length; i++) {\n}'),
            // string parameter, string reader, string literal, credentials
            wrap ("if (s.length > 0) {\n}\nconst id = this.safeString (params, 'id');\nif ((id !== undefined) && (id.length < 1)) {\n}\nif (this.secret.length > 10) {\n}"),
            // string local reassigned to undefined or another string
            wrap ("let tag = this.safeString (params, 'tag');\nif (tag.length < 1) {\n    tag = undefined;\n}"),
            wrap ("const q = this.urlencode (params);\nconst t = (q.length > 0) ? '?' + q : '';"),
            // Object.keys (x).length has its own PHP rule
            wrap ('if (Object.keys (params).length > 0) {\n}'),
            // not in a condition
            wrap ('const n = list.length;\nconst m = list.length + 1;'),
        ],
        'invalid': [
            // pro/aster.ts watchTickers before the fix: PHP printed strlen ($symbolsNormalized)
            { 'code': wrap ("const symbolsNormalized = this.marketSymbols (symbols);\nif ((symbolsNormalized === undefined) || (symbolsNormalized.length === 0)) {\n    throw new Error ('x');\n}"), 'errors': [ err ('symbolsNormalized') ] },
            // apex.ts: typed list in an if test
            { 'code': wrap ("const subAccounts: Dict[] = this.safeList (params, 'subAccounts', []);\nif (subAccounts.length > 0) {\n}"), 'errors': [ err ('subAccounts') ] },
            // while test, ternary test, && operand
            { 'code': wrap ('while (list.length > 2) {\n    list.pop ();\n}'), 'errors': [ err ('list') ] },
            { 'code': wrap ("const parts = s.split ('-');\nconst a = (parts.length > 1) ? parts[1] : '';"), 'errors': [ err ('parts') ] },
            { 'code': wrap ('const ok = (symbols !== undefined) && symbols.length > 0;'), 'errors': [ err ('symbols') ] },
            // unknown kind (a member of a list) is flagged too
            { 'code': wrap ("const parts = s.split ('-');\nif (parts[0].length === 4) {\n}"), 'errors': [ err ('parts[0]') ] },
        ],
    });
});
