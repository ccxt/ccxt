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

// ---- a provably-string LEFT operand drops the helper for ANY right operand ----
// the call site binds add(string, object) / add(string, string), and both overloads ARE
// C# concatenation (`add(string a, object b)` is `add(a, b?.ToString())`), so `+` is the
// same call for a proven, an unproven or a boxed right operand

// the whole chain is native: this.id is a string member, `o` an unproven parameter
check ('this.id + unproven param',
    'function f (o) { const x = this.id + o; return x; }',
    'string x = (this.id + (o));');

check ('this.id + getValue(...) call',
    'function f (m, k) { const x = this.id + getValue (m, "type"); return x; }',
    '(this.id + (getValue(m, "type")))');

check ('this.id + unproven param + literal (whole chain native)',
    'function f (o) { const x = this.id + " not " + o + " here"; return x; }',
    'string x = (((this.id + " not ") + (o)) + " here");');

check ('string literal + unproven param',
    'function f (o) { const x = "a" + o; return x; }',
    'string x = ("a" + (o));');

check ('literal chain over an unproven param',
    'function f (o) { const x = "&" + "signature=" + o; return x; }',
    'string x = (("&" + "signature=") + (o));');

check ('toString() + unproven param',
    'function f (o, m) { const x = o.toString () + m; return x; }',
    'string x = (((object)o).ToString() + (m));');

// a conditional right operand is printed parenthesised by the printer, so the native `+`
// keeps it as one operand. `x += c ? a : b` prints that ternary with no parentheses of its
// own, so an unnamed right operand is wrapped (CS0029 on the farm without the wrap)
check ('this.id + conditional right',
    'function f (c, a, b) { const x = this.id + (c ? a : b); return x; }',
    'string x = (this.id + ((((bool) isTrue(c)) ? a : b)));');

// an object literal right operand: add(string, object) calls b.ToString() exactly like
// String.Concat does
check ('this.id + object literal right',
    'function f (v) { const x = this.id + { "k": v }; return x; }',
    'string x = (this.id + (new Dictionary<string, object>() {');

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

// a string + a number: the LEFT operand is a string literal, so the call site binds
// add(string, object) — `add(a, b?.ToString())` — which IS `a + b` for every box
check ('string literal + number literal',
    'function f () { const x = "a" + 5; return x; }',
    'string x = ("a" + 5);');

// the reverse order keeps the helper: add(5, "a") binds add(object, object), whose Int64
// branch casts the right operand instead of concatenating it
check ('number literal + string literal stays add()',
    'function f () { const x = 5 + "a"; return x; }',
    'add(5, "a")');

console.log (failures === 0 ? 'all checks passed' : failures + ' check(s) failed');
process.exit (failures === 0 ? 0 : 1);
