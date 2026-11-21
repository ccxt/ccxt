// node -r ./build/use-typescript6.cjs --test eslint-rules/tests/no-untyped.test.mjs
import { describe, it } from 'node:test';
import { RuleTester } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import rule from '../no-untyped.mjs';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester ({
    'languageOptions': { 'parser': tsParser, 'ecmaVersion': 2020, 'sourceType': 'module' },
});

const file = 'ts/src/sample.ts';
const none = [ { 'baseline': {} } ];
const wrap = (body) => 'export default class sample extends Exchange {\n' + body + '\n}\n';

tester.run ('no-untyped', rule, {
    'valid': [
        // typed request dict and typed reads (okx fetchTrades)
        { 'filename': file, 'options': none, 'code': wrap ('async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {\n    const request: Dict = { \'instId\': symbol };\n    const data = this.safeList (request, \'data\', []);\n    return this.parseTrades (data, undefined, since, limit);\n}') },
        // typed let seeded undefined (binance isInverse style)
        { 'filename': file, 'options': none, 'code': wrap ('isInverse (type: string, subType: Str = undefined): boolean {\n    let result: boolean = undefined;\n    result = subType === \'inverse\';\n    return result;\n}') },
        // overrides inherit the base signature: untyped params allowed, return type still required
        { 'filename': file, 'options': none, 'code': wrap ('override sign (path, api = \'public\', method = \'GET\', params = {}, headers = undefined, body = undefined): Dict {\n    return { \'url\': path };\n}') },
        // constructor and setter need no return type; catch (e: any) is the only legal catch annotation
        { 'filename': file, 'options': none, 'code': wrap ('constructor (userConfig: Dict = {}) {\n    super ();\n}\nset rateLimit (v: Num) {\n    this.x = v;\n}\nhandle (v: Str): void {\n    try {\n        this.y (v);\n    } catch (e: any) {\n        throw e;\n    }\n}') },
        // let with a real initial value and for-of heads are not seeded-undefined locals
        { 'filename': file, 'options': none, 'code': wrap ('loop (rows: Dict[]): Int {\n    let total = 0;\n    for (let i = 0; i < rows.length; i++) {\n        total = total + 1;\n    }\n    for (let row of rows) {\n        total += 1;\n    }\n    return total;\n}') },
        // ratchet: a file at its baseline count passes
        { 'filename': file, 'options': [ { 'baseline': { 'ts/src/sample.ts': 2 } } ], 'code': wrap ('parseX (raw: any): Dict {\n    let response = undefined;\n    return raw;\n}') },
        // unknown is not any
        { 'filename': file, 'options': none, 'code': wrap ('parseY (raw: Dict): Dict {\n    const v = this.safeDict (raw, \'data\', {});\n    return v;\n}') },
    ],
    'invalid': [
        // any parameter type (handleErrors response: any)
        { 'filename': file, 'options': none, 'code': wrap ('handleErrors (code: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: any): void {\n}'), 'errors': [ { 'messageId': 'anyType' } ] },
        // any return type (binance mintTokenizedAsset)
        { 'filename': file, 'options': none, 'code': wrap ('mintTokenizedAsset (asset: string, params: Dict = {}): any {\n    return params;\n}'), 'errors': [ { 'messageId': 'anyType' } ] },
        // as any cast
        { 'filename': file, 'options': none, 'code': wrap ('parseZ (raw: Dict): Dict {\n    const m = (raw as any).markets;\n    return m;\n}'), 'errors': [ { 'messageId': 'asAny' } ] },
        // untyped let seeded undefined (okx fetchTrades let response = undefined)
        { 'filename': file, 'options': none, 'code': wrap ('async fetchT (symbol: string): Promise<Dict> {\n    let response = undefined;\n    response = await this.publicGetTrades ({});\n    return response;\n}'), 'errors': [ { 'messageId': 'letUndefined' } ] },
        // bare let without initializer
        { 'filename': file, 'options': none, 'code': wrap ('pick (a: Str): Str {\n    let side;\n    side = a;\n    return side;\n}'), 'errors': [ { 'messageId': 'letUndefined' } ] },
        // untyped parameter of an internal helper
        { 'filename': file, 'options': none, 'code': wrap ('checkNoStockSymbols (symbols, methodName: string): void {\n}'), 'errors': [ { 'messageId': 'untypedParam' } ] },
        // venue method without return type (binance setSandboxMode)
        { 'filename': file, 'options': none, 'code': wrap ('setSandboxMode (enable: boolean) {\n    this.x = enable;\n}'), 'errors': [ { 'messageId': 'noReturnType' } ] },
        // override without return type is still reported
        { 'filename': file, 'options': none, 'code': wrap ('override async fetchTransactionFees (codes: Strings = undefined, params: Dict = {}) {\n    return {};\n}'), 'errors': [ { 'messageId': 'noReturnType' } ] },
        // ratchet: one more than the baseline reports every finding of the file
        { 'filename': file, 'options': [ { 'baseline': { 'ts/src/sample.ts': 1 } } ], 'code': wrap ('parseX (raw: any): Dict {\n    let response = undefined;\n    return raw;\n}'), 'errors': [ { 'messageId': 'anyType' }, { 'messageId': 'letUndefined' } ] },
    ],
});
