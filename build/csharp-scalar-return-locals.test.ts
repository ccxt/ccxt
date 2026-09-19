// Emission checks for the D-23 scalar-return family in build/csharp-local-types.js:
// `const x = this.<name>(...)` names the callee's proven scalar box (`string?` / `Int64?` /
// `double?` / `bool?`) when the declaration's TS return annotation is a scalar and EVERY
// declaration of the name in the program proves that box on every return path.
// Run: npx tsx build/csharp-scalar-return-locals.test.ts
import { Transpiler } from 'ast-transpiler';
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

// ---- positives: the annotation plus the program-wide return-path proof name the box ----

// `: Str` over a safeString* result: the box is a string or null, the caller names it behind
// the exact `(string)` cast back
check ('Str annotation + safeString return',
    `type Str = string | undefined;
    class A {
        parseD23Status (status): Str {
            let statuses = { 'a': 'open' };
            return this.safeString (statuses, status, status);
        }
        f (raw) {
            let status = this.parseD23Status (raw);
            return status;
        }
    }`,
    'string? status = ((string)this.parseD23Status(raw))', 'object status = this.parseD23Status(raw)');

// `: number` over safeInteger*: every path boxes an Int64 or null -> Int64?
check ('number annotation + safeInteger return',
    `class A {
        parseD23Count (data): number {
            return this.safeInteger (data, 'count');
        }
        f (data) {
            let count = this.parseD23Count (data);
            return count;
        }
    }`,
    'Int64? count = ((Int64)this.parseD23Count(data))', 'object count = this.parseD23Count(data)');

// `: number` over safeFloat*: every path boxes a double or null -> double?
check ('number annotation + safeFloat return',
    `class A {
        parseD23Amount (data): number {
            return this.safeFloat (data, 'amount');
        }
        f (data) {
            let amount = this.parseD23Amount (data);
            return amount;
        }
    }`,
    'double? amount = ((double)this.parseD23Amount(data))', 'object amount = this.parseD23Amount(data)');

// `: Bool` over safeBool*: bool? is the box
check ('Bool annotation + safeBool return',
    `type Bool = boolean | undefined;
    class A {
        parseD23Flag (data): Bool {
            return this.safeBool (data, 'flag');
        }
        f (data) {
            let flag = this.parseD23Flag (data);
            return flag;
        }
    }`,
    'bool? flag = ((bool)this.parseD23Flag(data))', 'object flag = this.parseD23Flag(data)');

// a `+` whose LEFT operand is a proven string is a string on every path (the add(string, *)
// overload), so the `: Str` box holds
check ('Str annotation + string concat return',
    `type Str = string | undefined;
    class A {
        parseD23Id (data): Str {
            return 'px-' + this.safeString (data, 'id');
        }
        f (data) {
            let id = this.parseD23Id (data);
            return id;
        }
    }`,
    'string? id = ((string)this.parseD23Id(data))', 'object id = this.parseD23Id(data)');

// a conditional of two proven arms proves the same box
check ('Str annotation + conditional of two string arms',
    `type Str = string | undefined;
    class A {
        parseD23Code (data): Str {
            return (data === undefined) ? 'none' : this.safeString (data, 'code');
        }
        f (data) {
            let code = this.parseD23Code (data);
            return code;
        }
    }`,
    'string? code = ((string)this.parseD23Code(data))');

// ---- negatives: a box the value does not provably hold keeps the printer's `object` ----

// a numeric literal boxes an Int32, which the caller's `(Int64)` / `(double)` unbox would throw on
check ('number annotation + numeric literal return stays object',
    `class A {
        parseD23Limit (data): number {
            return 10;
        }
        f (data) {
            let limit = this.parseD23Limit (data);
            return limit;
        }
    }`,
    'object limit = this.parseD23Limit(data)', 'Int64? limit');

// a parameter handed straight back is a caller-provided box of no proven kind
check ('Str annotation + parameter passthrough stays object',
    `type Str = string | undefined;
    class A {
        parseD23Raw (code): Str {
            return code;
        }
        f (data) {
            let code = this.parseD23Raw (data);
            return code;
        }
    }`,
    'object code = this.parseD23Raw(data)', 'string? code');

// one declaration of the name boxing something else keeps the whole name object (no virtual
// dispatch may hand back another box)
check ('mixed return paths across the name stay object',
    `type Str = string | undefined;
    class A {
        parseD23Value (data): Str {
            return this.safeString (data, 'v');
        }
    }
    class B {
        parseD23Value (data): Str {
            return { 'v': 1 };
        }
    }
    class C {
        parseD23Value (data): Str {
            return this.safeString (data, 'v');
        }
        f (data) {
            let v = this.parseD23Value (data);
            return v;
        }
    }`,
    'object v = this.parseD23Value(data)', 'string? v');

// no declaration of the name in the program (a hand-written C# method only) proves nothing
check ('unknown callee stays object',
    `class A {
        f (data) {
            let value = this.parseD23Unknown (data);
            return value;
        }
    }`,
    'object value = ', 'string? value');

if (failures > 0) {
    console.log ('\n' + failures + ' failure(s)');
    process.exit (1);
}
console.log ('\nall csharp scalar-return local checks passed');