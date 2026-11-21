// node -r ./build/use-typescript6.cjs --test eslint-rules/tests/no-safe-value.test.mjs
import { test } from 'node:test';
import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import rule from '../no-safe-value.mjs';

process.env.CCXT_SAFE_NO_BASELINE = '1';
const ruleTester = new RuleTester ({ 'languageOptions': { 'parser': tsParser, 'ecmaVersion': 2020, 'sourceType': 'module' } });
const wrap = (body) => 'export default class x { parse (response: any) {\n' + body + '\n} }';
const err = (name) => ({ 'messageId': 'banned', 'data': { name } });

test ('no-safe-value', () => {
    ruleTester.run ('no-safe-value', rule, {
        'valid': [
            wrap ("const data = this.safeDict (response, 'data', {});"),
            wrap ("const rows = this.safeList (response, 'rows', []);"),
            wrap ("const id = this.safeString (response, 'id');"),
            wrap ("const ts = this.safeInteger2 (response, 'ts', 'time');"),
            wrap ("const ok = this.safeBool (response, 'success', false);"),
            wrap ("const v = safeValue (response, 'x');"), // free function, not the method
            wrap ("const v = other.safeValue (response, 'x');"),
            wrap ("const fee = this.safeNumber (response, 'fee'); const safeValue = 1;"),
        ],
        'invalid': [
            { 'code': wrap ("const data = this.safeValue (response, 'data', {});"), 'errors': [ err ('safeValue') ] },
            { 'code': wrap ("const rows = this.safeValue (response, 'result', []);"), 'errors': [ err ('safeValue') ] },
            { 'code': wrap ("const networks = this.safeValue2 (response, 'networks', 'chains');"), 'errors': [ err ('safeValue2') ] },
            { 'code': wrap ("const x = this.safeValueN (response, [ 'a', 'b' ]);"), 'errors': [ err ('safeValueN') ] },
            { 'code': wrap ("const options = this.safeValue (this.options, 'fetchMarkets', {});"), 'errors': [ err ('safeValue') ] },
            { 'code': wrap ("const t = this.safeInteger (this.safeValue (response, 'data'), 'ts');"), 'errors': [ err ('safeValue') ] },
            { 'code': wrap ("const f = this['safeValue'];"), 'errors': [ err ('safeValue') ] },
            { 'code': wrap ("const a = super.safeValue (response, 'a');"), 'errors': [ err ('safeValue') ] },
        ],
    });
});
