// Native-arithmetic emission checks for build/csharp-local-types.js#installCsharpNativeArithmetic.
//
//   npx tsx build/csharp-native-arithmetic.test.ts
//
// Transpiles small TS snippets through the real printer with the real C# classifier hooks
// installed (the same setupCsharpPrinter the driver and the pooled workers use) and asserts
// which operand pairs drop the add/subtract/multiply/divide helper call. The "helper" cases
// fail on a tree where the emission is not installed (add(...) instead of the operator).
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
        console.log ('  actual:   ' + output.trim ().replace (/\s+/g, ' ').slice (0, 300));
    }
};

// string + string: add(string, string) IS `a + b`
check ('string literal + literal',
    'function f () { const x = "a" + "b"; return x; }',
    'string x = ("a" + "b");');

// this.id is a `string` member of the hand-written base
check ('this.id + literal',
    'function f () { const x = this.id + " does not support "; return x; }',
    '(this.id + " does not support ")');

// a nested `+` whose own left is provably string keeps its string type, so the outer call
// still drops: `(X + " market")` where X is the remaining add(string, object) call
check ('outer + over an add(string, object) call',
    'function f (type) { const x = this.id + " does not support " + type + " market"; return x; }',
    ' + " market"');

// Int64 (this.milliseconds) - uint literal: add/subtract normalize both to Int64
check ('milliseconds - large literal',
    'function f () { const x = this.milliseconds () - 2592000000; return x; }',
    ' - 2592000000)');

// Int64 * Int64
check ('milliseconds * literal',
    'function f () { const x = this.milliseconds () * 1000; return x; }',
    ' * 1000)');

// double + int: `add`'s double branch converts the right operand, same as the implicit
// conversion; the reverse order throws inside add and must keep the call
check ('double literal + int literal',
    'function f () { const x = 1.5 + 2; return x; }',
    '(1.5 + 2)');
check ('int literal + double literal stays add()',
    'function f () { const x = 2 + 1.5; return x; }',
    'add(2, 1.5)');

// divide(Int64, Int64) truncates exactly like the native operator
check ('milliseconds / literal',
    'function f () { const x = this.milliseconds () / 1000; return x; }',
    ' / 1000)');

// ---- pairs that must keep the helper call ----

// an unproven (object) operand
check ('object operand keeps add()',
    'function f (x) { const y = x + "a"; return y; }',
    'add(x, "a")');

// int + int: the helper normalizes to Int64, the native Int32 box/overflow would differ
check ('int literal + int literal keeps add()',
    'function f () { const x = 1 + 2; return x; }',
    'add(1, 2)');

// int - int is subtract(int, int) -> the native operator
check ('int literal - int literal',
    'function f () { const x = 5 - 2; return x; }',
    '(5 - 2)');

// int * int: multiply has no (int, int) overload — the Int64 twin keeps the helper
check ('int literal * int literal keeps multiply()',
    'function f () { const x = 5 * 2; return x; }',
    'multiply(5, 2)');

// `%` : mod(object, object) converts both operands to double and truncates back to Int64
check ('modulo keeps mod()',
    'function f (a) { const x = a % 2; return x; }',
    'mod(a, 2)');

// a string + a number is not a same-kind pair
check ('string + number keeps add()',
    'function f () { const x = "a" + 5; return x; }',
    'add("a", 5)');

// ---- nullable numeric declarations (`Int64?` / `double?` locals) ----
// this.safeInteger narrows `const since = ...` to `Int64?`; the helper's null branch IS the
// lifted operator's for / and * (null in -> null out), so the pair prints natively
check ('Int64? local / int literal',
    'function f () { const since = this.safeInteger (this.options, "a"); const y = since / 1000; return y; }',
    '(since / 1000)');

check ('Int64? local * int literal',
    'function f () { const d = this.safeInteger (this.options, "a"); const y = d * 1000; return y; }',
    '(d * 1000)');

check ('double? local / int literal',
    'function f () { const d = this.safeNumber (this.options, "a"); const y = d / 2; return y; }',
    '(d / 2)');

check ('Int64? local / Int64? local',
    'function f () { const a = this.safeInteger (this.options, "a"); const b = this.safeInteger (this.options, "b"); const y = a / b; return y; }',
    '(a / b)');

check ('Int64? local * Int64? local',
    'function f () { const a = this.safeInteger (this.options, "a"); const b = this.safeInteger (this.options, "b"); const y = a * b; return y; }',
    '(a * b)');

// assert(x as number) prints the bare operand, so the operand kind is the inner expression's
check ('as number over an int literal (bare print)',
    'function f () { const y = (5 as number) - 1; return y; }',
    '(5 - 1)');

// ---- nullable pairs that must keep the helper call ----
// subtract() has no null branch: a.GetType() throws on a null left operand and the (Int64)b
// unboxing throws on a null right, where the lifted `T? - T` answers null
check ('Int64? local - int literal keeps subtract()',
    'function f () { const d = this.safeInteger (this.options, "a"); const y = d - 1; return y; }',
    'subtract(d, 1)');

// add(object, object) returns the other operand for a null one, not null (the add family)
check ('Int64? local + int literal keeps add()',
    'function f () { const d = this.safeInteger (this.options, "a"); const y = d + 1; return y; }',
    'add(d, 1)');

// multiply() re-boxes an integral double product as Int64, so a double operand keeps it
check ('double? local * int literal keeps multiply()',
    'function f () { const d = this.safeNumber (this.options, "a"); const y = d * 2; return y; }',
    'multiply(d, 2)');

// int / int stays: the helper normalizes to Int64 and divides truncated, while the native
// Int32 operator would box an Int32 (and JS `/` is float division — unchanged either way)
check ('int literal / int literal keeps divide()',
    'function f () { const y = 1 / 2; return y; }',
    'divide(1, 2)');

console.log (failures === 0 ? 'all checks passed' : failures + ' check(s) failed');
process.exit (failures === 0 ? 0 : 1);
