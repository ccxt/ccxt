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

// ---- nullable LEFT operand: the helper returns null for a null left and otherwise the same
// Int64 / double sum the lifted operator computes (differential harness) ----

// Int64? + int literal
check ('Int64? + int literal',
    'function f (t) { const x = this.safeInteger (t, \'k\'); const y = x + 1; return y; }',
    '(x + 1)');
// Int64? + uint literal (2592000000 is typed uint by the C# compiler)
check ('Int64? + uint literal',
    'function f (t) { const x = this.safeInteger (t, \'k\'); const y = x + 2592000000; return y; }',
    '(x + 2592000000)');
// double? + double literal / + int literal: the helper's double branch is the same sum
check ('double? + double literal',
    'function f (t) { const x = this.safeFloat (t, \'k\'); const y = x + 1.5; return y; }',
    '(x + 1.5)');
check ('double? + int literal',
    'function f (t) { const x = this.safeFloat (t, \'k\'); const y = x + 2; return y; }',
    '(x + 2)');
// a nested native `+` keeps the nullable kind, so the outer pair is the nullable-left one too
check ('nested nullable +',
    'function f (t) { const x = this.safeInteger (t, \'k\'); const y = x + 1 + 2; return y; }',
    '((x + 1) + 2)');

// ---- nullable shapes that must keep the helper call ----

// Int64? + Int64?: the helper throws on a null RIGHT box where the operator yields null
check ('Int64? + Int64? keeps add()',
    'function f (t) { const x = this.safeInteger (t, \'k\'); const z = this.safeInteger (t, \'j\'); const y = x + z; return y; }',
    'add(x, z)');
// a literal LEFT with a nullable right: the helper normalizes the int left and then throws
check ('int literal + Int64? keeps add()',
    'function f (t) { const x = this.safeInteger (t, \'k\'); const y = 1 + x; return y; }',
    'add(1, x)');
// a nullable local with a later write is demoted to object, so the += target stays a helper
check ('nullable += target demoted by the later write keeps add()',
    'function f (t) { const x = this.safeInteger (t, \'k\'); x += 1; return x; }',
    'x = add(x, 1)');

console.log (failures === 0 ? 'all checks passed' : failures + ' check(s) failed');
process.exit (failures === 0 ? 0 : 1);
