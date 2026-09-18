// Emission checks for the safeDict*/safeList* family's self-ternary write join in
// build/csharp-local-types.js: `x = (x === undefined) ? <default> : x` now types the local where
// the C# conditional's natural type is the declaration's. Run: npx tsx build/csharp-safe-collection-locals.test.ts
import { Transpiler } from 'ast-transpiler';
import ts from 'typescript6';
import { setupCsharpPrinter } from './csharp-worker.js';

const config: any = {
    verbose: false,
    csharp: {
        parser: {
            NUM_LINES_END_FILE: 0,
            'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(',
            'ELEMENT_ACCESS_WRAPPER_CLOSE': ')',
        },
    },
};

const transpiler = new Transpiler (config);
setupCsharpPrinter (transpiler);

let failures = 0;
const check = (name: string, source: string, expected: string, forbidden?: string) => {
    const output: string = (transpiler as any).transpileCSharp (source).content;
    const ok = output.includes (expected) && (forbidden === undefined || !output.includes (forbidden));
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + expected + (forbidden ? '  (and not: ' + forbidden + ')' : ''));
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 400));
    }
};

// ---- positives: the self arm makes the write contribute the candidate type ----

// `{}` default beside the self arm: the conditional's natural type is the IDictionary the
// declaration already carries (Dictionary -> IDictionary is the implicit conversion)
check ('safeDict + self-ternary',
    `function f (params) {
        let close = this.safeDict (params, 'close');
        close = (close === undefined) ? {} : close;
        return close;
    }`,
    'IDictionary<string, object> close = ', 'object close = ');

// mirrored arm order (`? close : {}`) proves the same natural type
check ('safeDict + mirrored self-ternary',
    `function f (params) {
        let close = this.safeDict (params, 'close');
        close = (close === undefined) ? close : {};
        return close;
    }`,
    'IDictionary<string, object> close = ', 'object close = ');

check ('safeList + self-ternary',
    `function f (params) {
        let fees = this.safeList (params, 'fees');
        fees = (fees === undefined) ? [] : fees;
        return fees;
    }`,
    'List<object> fees = ', 'object fees = ');

// the suffixed family names (safeDictN / safeList2) are the same family
check ('safeDictN + self-ternary',
    `function f (params) {
        let entry = this.safeDictN (params, ['order', 'resting']);
        entry = (entry === undefined) ? {} : entry;
        return entry;
    }`,
    'IDictionary<string, object> entry = ', 'object entry = ');
check ('safeList2 + self-ternary',
    `function f (params) {
        let rawOrders = this.safeList2 (params, 'data', 'orders');
        rawOrders = (rawOrders === undefined) ? [] : rawOrders;
        return rawOrders;
    }`,
    'List<object> rawOrders = ', 'object rawOrders = ');

// the other arm is a DECLARED collection local: only the self arm is unprovable, so the write
// still contributes the candidate (Dictionary -> IDictionary is one-way, which is the way the
// C# conditional resolves it)
check ('safeDict + self-ternary over a declared Dictionary local',
    `function f (params) {
        const other = this.extend ({}, params);
        let close = this.safeDict (params, 'close');
        close = (close === undefined) ? other : close;
        return close;
    }`,
    'IDictionary<string, object> close = ', 'object close = ');

// the kraken shape (ts/src/kraken.ts, the only whole-language site): a later this.extend write
// and dictionary reads around the ternary; only the declaration line may move
check ('safeDict + extend write + self-ternary + reads',
    `function f (params) {
        let close = this.safeDict (params, 'close');
        if (close !== undefined) {
            close = this.extend ({}, close);
            close = (close === undefined) ? {} : close;
            const closePrice = this.safeValue (close, 'price');
            if (closePrice !== undefined) {
                close['price'] = this.priceToPrecision ('BTC/USDT', closePrice);
            }
        }
        return close;
    }`,
    'IDictionary<string, object> close = ');
check ('...its ternary line prints unchanged',
    `function f (params) {
        let close = this.safeDict (params, 'close');
        if (close !== undefined) {
            close = this.extend ({}, close);
            close = (close === undefined) ? {} : close;
        }
        return close;
    }`,
    'close = ((bool) ((close == null))) ? new Dictionary<string, object>() {} : close;');

// ---- negatives: every shape that must keep the printer's `object` ----

// D2: a later write of a different printed type keeps the box even beside a self-ternary write
check ('safeDict + self-ternary + foreign write stays object',
    `function f (params, raw) {
        let data = this.safeDict (params, 'data');
        data = (data === undefined) ? {} : data;
        data = getValue (raw, 0);
        return data;
    }`,
    'object data = ', 'IDictionary<string, object> data = ');

// a foreign write alone still keeps the box (the family rule as it stood before this change)
check ('safeDict + foreign write stays object',
    `function f (params, raw) {
        let data = this.safeDict (params, 'data');
        data = getValue (raw, 0);
        return data;
    }`,
    'object data = ', 'IDictionary<string, object> data = ');

// family gate: a safeValue local with the identical write shape is not this family
check ('non-family self-ternary stays object',
    `function f (params) {
        let data = this.safeValue (params, 'data');
        data = (data === undefined) ? {} : data;
        return data;
    }`,
    'object data = ', 'IDictionary<string, object> data = ');

// the default arm must convert INTO the candidate type: `[]` cannot become an IDictionary
check ('safeDict + list default stays object',
    `function f (params) {
        let data = this.safeDict (params, 'data');
        data = (data === undefined) ? [] : data;
        return data;
    }`,
    'object data = ', 'IDictionary<string, object> data = ');

// both arms reading the local prove nothing
check ('both arms self reads stays object',
    `function f (params) {
        let data = this.safeDict (params, 'data');
        data = (data === undefined) ? data : data;
        return data;
    }`,
    'object data = ', 'IDictionary<string, object> data = ');

// a null default arm: the same declaration already receives a plain `data = null` write today
// (control below), so the arm stores the same null into the same collection declaration; the
// nullable warnings it could raise are NoWarn'd in cs/ccxt/ccxt.csproj
check ('safeDict + null default arm',
    `function f (params) {
        let data = this.safeDict (params, 'data');
        data = (data === undefined) ? undefined : data;
        return data;
    }`,
    'IDictionary<string, object> data = ');

// control: a plain null write (pre-existing behaviour of the family)
check ('safeDict + plain null write',
    `function f (params) {
        let data = this.safeDict (params, 'data');
        data = null;
        return data;
    }`,
    'IDictionary<string, object> data = ');

// the other arm is an untyped local of another family (no proven C# type)
check ('safeDict + untyped other arm stays object',
    `function f (params) {
        let other = this.safeValue (params, 'other');
        let data = this.safeDict (params, 'data');
        data = (data === undefined) ? other : data;
        return data;
    }`,
    'object data = ', 'IDictionary<string, object> data = ');

// ---- controls: the family's plain cases (already typed before this change) ----
check ('safeDict plain', `function f (params) { let d = this.safeDict (params, 'data', {}); return d; }`, 'IDictionary<string, object> d = ');
check ('safeList plain', `function f (params) { let d = this.safeList (params, 'data'); return d; }`, 'List<object> d = ');

console.log (failures === 0 ? 'all checks passed' : failures + ' check(s) failed');
process.exit (failures === 0 ? 0 : 1);
