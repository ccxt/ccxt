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
    'string x = (this.id + ((isTrue(c) ? a : b)));');

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

// add(object, object) answers null for a null left (no `is` branch matches), which is the
// lifted `Int64? + int`, so a nullable LEFT with a non-nullable right goes native
check ('Int64? local + int literal is the lifted native +',
    'function f () { const d = this.safeInteger (this.options, "a"); const y = d + 1; return y; }',
    '(d + 1)');

// multiply() re-boxes an integral double product as Int64, so a double operand keeps it
check ('double? local * int literal keeps multiply()',
    'function f () { const d = this.safeNumber (this.options, "a"); const y = d * 2; return y; }',
    'multiply(d, 2)');

// int / int stays: the helper normalizes to Int64 and divides truncated, while the native
// Int32 operator would box an Int32 (and JS `/` is float division — unchanged either way)
check ('int literal / int literal keeps divide()',
    'function f () { const y = 1 / 2; return y; }',
    'divide(1, 2)');

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


// ---- B-21: `this.<string field>` operands of the hand-written base -------------------------
// Exchange.Options.cs declares these `public string <name> { get; set; }`; the enclosing add()
// binds add(string, string) / add(string, object), both of which ARE C# concatenation, so the
// LEFT-operand string rule covers them exactly as it covers `this.id`.

check ('this.apiKey + literal', 
    'function f () { const x = this.apiKey + ":signature"; return x; }',
    '(this.apiKey + ":signature")');
check ('this.version + unproven param',
    'function f (o) { const x = this.version + o; return x; }',
    '(this.version + (o))');
check ('this.login + this.password (both members)',
    'function f () { const x = this.login + this.password; return x; }',
    '(this.login + this.password)');
// a member the hand-written base does NOT declare as a string keeps the helper
check ('an unproven this.<member> keeps add()',
    'function f () { const x = this.someUnknownField + "-"; return x; }',
    'add(this.someUnknownField, "-")');

// ---- B-21: `x as string` prints `((string)x)` — a statically string operand ---------------
check ('(x as string) + literal',
    'function f (o) { const x = (o as string) + "-"; return x; }',
    '(((string)o) + "-")');
// `as any` prints the bare operand and stays unproven
check ('(x as any) + literal keeps add()',
    'function f (o) { const x = (o as any) + "-"; return x; }',
    'add(((object)o), "-")');

// ---- D-22: parameters narrowed to a scalar by the emitted signature ------------------------
// The ccxt-side typeCoreArgs pass narrows the CORE_STRING_ARGS / CORE_NUMERIC_ARGS positions on
// every generated declaration of the method, so a read of such a parameter IS that C# type at
// the call site. The proof is answered by method name + position, so the snippets below use the
// real method names (fetchOHLCV: symbol/timeframe string, since/limit Int64?).

check ('string param + literal',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = symbol + ":"; return y; } }',
    '(symbol + ":")');
check ('string param + string param',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = symbol + timeframe; return y; } }',
    '(symbol + timeframe)');
// the string-left rule reaches the whole chain: the outer pair is over the native sub-chain
check ('string param chain over a literal',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = symbol + "-" + timeframe; return y; } }',
    '((symbol + "-") + timeframe)');
check ('string param of fetchDeposits (position 0)',
    'class Ex { async fetchDeposits (code, since, limit, parameters = {}) { const y = code + "-"; return y; } }',
    '(code + "-")');
// Int64? / double?: the helper's own null branch IS the lifted operator's for / and *
check ('Int64? param / int literal',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = since / 1000; return y; } }',
    '(since / 1000)');
check ('Int64? param * literal',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = limit * 2; return y; } }',
    '(limit * 2)');
// add(object, object) answers null for a null left, the lifted `Int64? + int` too
check ('Int64? param + int literal',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = since + 10000; return y; } }',
    '(since + 10000)');
check ('double? param + double literal',
    'class Ex { async createOrder (symbol, type, side, amount, price = undefined, parameters = {}) { const y = price + 1.5; return y; } }',
    '(price + 1.5)');

// ---- D-22: parameters the proof refuses keep the helper call ---------------------------------
// a params bag is in no table
check ('params-bag param keeps add()',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = parameters + "x"; return y; } }',
    'add(parameters, "x")');
// a method not in the tables: every parameter stays `object`
check ('non-core method param keeps add()',
    'class Ex { async doThing (a, b) { const y = a + "-"; return y; } }',
    'add(a, "-")');
// subtract() has no null branch where the lifted `Int64? - int` answers null
check ('Int64? param - literal keeps subtract()',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = since - 1; return y; } }',
    'subtract(since, 1)');
// a nullable RIGHT operand: the helper throws on a null right box, the operator answers null
check ('Int64? param + Int64? param keeps add()',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = since + limit; return y; } }',
    'add(since, limit)');
// a body write shadows the parameter in the emitted file (`object sinceVar = since`), so the
// narrowed type is not what the read carries
check ('written param keeps add()',
    'class Ex { async fetchTrades (symbol, since, limit, parameters = {}) { since = since + 1; const y = since + 1; return y; } }',
    'add(since, 1)');
// a literal default inserts the `??=` prologue, which the narrowing pass reads as a write
check ('literal-default param keeps add()',
    'class Ex { async fetchOHLCV (symbol, timeframe, since = 1000, limit = 10, parameters = {}) { const y = since + 5; return y; } }',
    'add(since, 5)');
// `-limit` prints `prefixUnaryNeg(ref limit)`, which the narrowing pass reads as an assignment:
// EVERY body use of that parameter is renamed to the `object limitVar` shadow, so the read is
// not the narrowed type — the sink parameter keeps the helper while its sibling stays native
check ('unsunk sibling of a ref-sunk param stays native',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = -limit; const z = since + 1; return [ y, z ]; } }',
    '(since + 1)',
    '(limit * 2)');
check ('ref-sunk param keeps its own pair boxed',
    'class Ex { async fetchOHLCV (symbol, timeframe, since, limit, parameters = {}) { const y = -limit; const z = limit * 2; return [ y, z ]; } }',
    'multiply(limit, 2)');

// ---- D-22: the composition point for typed-parameter families -------------------------------
// A family that retypes parameters publishes them through the build layer's declared-type
// resolver (the printer's csharpDeclaredLocalResolverType); parameter reads answer that type.
// Installed here by hand — no such family is in this tree yet.
const csharpPrinter: any = (transpiler as any).csharpTranspiler;
csharpPrinter.csharpDeclaredLocalTypeResolver = (declaration: any) => (declaration?.name?.escapedText === 'a2' ? 'string' : undefined);
check ('param typed by the declared-type resolver + literal',
    'class Ex { async doThing (a1, a2) { const y = a2 + "-"; return y; } }',
    '(a2 + "-")');
check ('other param stays unproven under the resolver',
    'class Ex { async doThing (a1, a2) { const y = a1 + "-"; return y; } }',
    'add(a1, "-")');
csharpPrinter.csharpDeclaredLocalTypeResolver = undefined;

console.log (failures === 0 ? 'all checks passed' : failures + ' check(s) failed');
process.exit (failures === 0 ? 0 : 1);
