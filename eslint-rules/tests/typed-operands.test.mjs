// node --test eslint-rules/tests/typed-operands.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkFixtures } from '../checks/typed-operands.mjs';

// minimal stand-ins for the ts/src/base/types.ts aliases and Exchange readers
const PRELUDE = `
type Str = string | undefined; type Int = number | undefined; type Num = number | undefined;
type Dict = { [key: string]: any };
declare class Ex {
    id: string; version: Str; options: Dict;
    safeString (o: any, k: any, d?: string): Str;
    safeStringD (o: any, k: any, d: string): string;
    safeInteger (o: any, k: any, d?: number): Int;
    safeIntegerD (o: any, k: any, d: number): number;
    safeValue (o: any, k: any, d?: any): any;
    handleOption (m: string, k: string, d?: any): any;
}
declare const self: Ex; declare const response: Dict; declare const rows: Dict[];
`;

function run (body) {
    const out = checkFixtures ({ 'fixture.ts': PRELUDE + '\nexport function f () {\n' + body + '\n}\n' });
    return out['fixture.ts'];
}

const invalid = [
    // name, source, expected family
    [ 'Str + Str concat', `const base = self.safeString (response, 'base'); const quote = self.safeString (response, 'quote'); return base + '/' + quote;`, 'Add' ],
    [ 'Int arithmetic', `const ts = self.safeInteger (response, 'ts'); return ts - 1;`, 'Subtract' ],
    [ 'Int ordering compare', `const amount = self.safeInteger (response, 'amount'); if (amount > 0) { return 1; } return 0;`, 'IsGreaterThan' ],
    [ 'any (safeValue) compared with literal', `const status = self.safeValue (response, 'status'); return status === 'ok';`, 'IsEqual' ],
    [ 'any (options index) ordering', `const limit = self.options['limit']; return limit < 100;`, 'IsLessThan' ],
    [ 'Str receiver of split', `const symbol = self.safeString (response, 'symbol'); return symbol.split ('/');`, 'Split' ],
    [ 'any receiver of toLowerCase', `const t = response['type']; return t.toLowerCase ();`, 'ToLowerCase' ],
    [ 'any row index * number', `const row = rows[0]; return row['price'] * 2;`, 'Multiply' ],
    [ 'Str += concat', `let hash: Str = self.safeString (response, 'h'); hash += ':linear'; return hash;`, 'Add' ],
    [ 'any receiver of indexOf', `const v = self.safeValue (response, 'url'); return v.indexOf ('ws');`, 'IndexOf' ],
];

const valid = [
    [ 'defaulted string concat', `const base = self.safeStringD (response, 'base', ''); return base + '/USDT';` ],
    [ 'Str compared with literal prints natively', `const type = self.safeString (response, 'type'); return type === 'limit';` ],
    [ 'presence test then use in branch', `const id = self.safeString (response, 'id'); if (id !== undefined) { return id + ':x'; } return '';` ],
    [ 'loop over declared list length', `let n = 0; for (let i = 0; i < rows.length; i++) { n = n + 1; } return n;` ],
    [ 'defaulted integer maths', `const n = self.safeIntegerD (response, 'n', 0); return (n * 2) > 10;` ],
    [ 'typeof test against literal', `const v = self.safeValue (response, 'v'); return typeof v === 'string';` ],
    [ 'this-field concat (Str struct field)', `return 'ccxt/' + self.id;` ],
    [ 'compare with undefined is not a literal compare', `const v = self.safeValue (response, 'v'); return v === undefined;` ],
    [ 'typed boolean local compared with true', `const q: boolean = self.handleOption ('createOrder', 'q', true); return q === true;` ],
    [ 'string method on a plain string', `const s: string = 'a/b'; return s.split ('/');` ],
];

for (const [ name, src, family ] of invalid) {
    test ('invalid: ' + name, () => {
        const found = run (src);
        assert.ok (found.length >= 1, 'expected a finding');
        assert.ok (found.some ((x) => x.family === family), `expected family ${family}, got ${found.map ((x) => x.family).join (',')}`);
        assert.ok (found.every ((x) => x.message.includes (';')), 'message must say what to write instead');
    });
}

for (const [ name, src ] of valid) {
    test ('valid: ' + name, () => {
        const found = run (src);
        assert.deepEqual (found.map ((x) => x.message), []);
    });
}
