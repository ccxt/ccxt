// node --test eslint-rules/tests/ternary-placement.test.mjs
import { test } from 'node:test';
import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import rule, { scopeKey } from '../ternary-placement.mjs';

RuleTester.describe = (name, fn) => fn ();
RuleTester.it = (name, fn) => test (name, fn);
RuleTester.itOnly = (name, fn) => test (name, { only: true }, fn);

const ruleTester = new RuleTester ({
    languageOptions: { parser: tsParser, ecmaVersion: 2020, sourceType: 'module' },
});

const F = '/repo/ts/src/okx.ts';
const opt = [ { baseline: {} } ];
const wrap = (body) => 'class X { m (status, contract, market, isSpot, optionType, ms, timestamps, i, method, since, limit, result, isDeposit) {\n' + body + '\n} }';

ruleTester.run ('ternary-placement', rule, {
    valid: [
        // if / else into a typed local, then the local in the literal (the plain shape)
        { filename: F, options: opt, code: wrap ("let optionTypeStr: Str = 'put';\nif (optionType === 'C') {\n    optionTypeStr = 'call';\n}\nreturn { 'optionType': optionTypeStr };") },
        // ternary assigned to a const (generators print a plain if / else)
        { filename: F, options: opt, code: wrap ("const baseParts: string[] = (market.indexOf ('/') > -1) ? isSpot : contract;\nreturn baseParts;") },
        // ternary assigned to an existing local
        { filename: F, options: opt, code: wrap ("let defaultType = undefined;\ndefaultType = (status === 'inverse') ? 'inverse' : 'linear';\nreturn defaultType;") },
        // return with both arms the same kind
        { filename: F, options: opt, code: wrap ("return (status === undefined) ? 'ok' : 'maintenance';") },
        // return where one arm kind is unknown (identifier) is not compared
        { filename: F, options: opt, code: wrap ('return contract ? market : undefined;') },
        // out of scope: tests and abstract are not checked
        { filename: '/repo/ts/src/test/Exchange/test.order.ts', options: opt, code: "f (a ? 1 : 2); const d = { 'k': a ? 1 : 2 };" },
        { filename: '/repo/ts/src/abstract/okx.ts', options: opt, code: "const d = { 'k': a ? 1 : 2 };" },
        // ratchet: a file at its baseline passes
        { filename: F, options: [ { baseline: { 'ts/src/okx.ts': 2 } } ], code: wrap ("const a = { 'status': (status === undefined) ? 'ok' : 'maintenance' };\nconst b = { 'type': isSpot ? 'spot' : 'swap' };\nreturn [ a, b ];") },
    ],
    invalid: [
        // hyperliquid.ts: object-literal value
        { filename: F, options: opt, code: wrap ("return { 'type': (isSpot) ? 'spotClearinghouseState' : 'clearinghouseState' };"), errors: [ { messageId: 'property' } ] },
        // okx.ts: object-literal value with undefined arm
        { filename: F, options: opt, code: wrap ("return { 'contractSize': contract ? this.safeNumber (market, 'ctVal') : undefined };"), errors: [ { messageId: 'property' } ] },
        // Exchange.ts: call argument
        { filename: '/repo/ts/src/base/Exchange.ts', options: opt, code: wrap ("return this.filterBySinceLimit (result, since, limit, (method === 'fetchOHLCV') ? 0 : 'timestamp');"), errors: [ { messageId: 'argument' } ] },
        // Exchange.ts: Math.max argument
        { filename: '/repo/ts/src/base/Exchange.ts', options: opt, code: wrap ('return Math.max ((since === undefined) ? limit : since, limit);'), errors: [ { messageId: 'argument' } ] },
        // Exchange.ts: array element
        { filename: '/repo/ts/src/base/Exchange.ts', options: opt, code: wrap ('return [ ms ? this.safeInteger (timestamps, i) : this.safeTimestamp (timestamps, i), 1 ];'), errors: [ { messageId: 'element' } ] },
        // return with mixed kinds
        { filename: F, options: opt, code: wrap ("return (status === undefined) ? undefined : 'ok';"), errors: [ { messageId: 'returnMixed' } ] },
        { filename: F, options: opt, code: wrap ('return isSpot ? {} : [];'), errors: [ { messageId: 'returnMixed' } ] },
        // nested
        { filename: F, options: opt, code: wrap ("const s = (status === 1) ? 'a' : ((status === 2) ? 'b' : 'c');\nreturn s;"), errors: [ { messageId: 'nested' } ] },
        // as-cast does not hide the placement
        { filename: '/repo/ts/src/pro/okx.ts', options: opt, code: wrap ("return { 'k': (isSpot ? 'a' : 'b') as any };"), errors: [ { messageId: 'property' } ] },
        // new expression argument, prediction tier
        { filename: '/repo/ts/src/prediction/myriad.ts', options: opt, code: wrap ("return new Error (isDeposit ? 'a' : 'b');"), errors: [ { messageId: 'argument' } ] },
        // ratchet: one above baseline reports every finding in the file
        { filename: F, options: [ { baseline: { 'ts/src/okx.ts': 1 } } ], code: wrap ("const a = { 'status': (status === undefined) ? 'ok' : 'maintenance' };\nconst b = { 'type': isSpot ? 'spot' : 'swap' };\nreturn [ a, b ];"), errors: [ { messageId: 'property' }, { messageId: 'property' } ] },
    ],
});

test ('scope', () => {
    const ok = [ 'ts/src/okx.ts', 'ts/src/pro/okx.ts', 'ts/src/prediction/myriad.ts', 'ts/src/base/Exchange.ts', 'ts/src/base/PredictionExchange.ts' ];
    const no = [ 'ts/src/abstract/okx.ts', 'ts/src/test/base/test.ts', 'ts/src/static_dependencies/x/y.ts', 'ts/src/base/functions/misc.ts' ];
    for (const p of ok) { if (scopeKey ('/r/' + p) !== p) throw new Error (p); }
    for (const p of no) { if (scopeKey ('/r/' + p) !== undefined) throw new Error (p); }
});
