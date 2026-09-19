// Emission checks for build/csharpTranspiler.ts#nativeDeclaredWsCalls — the ws text-pass rule that
// turns `callDynamically(x, "resolve"/"reject", ...)` into a direct call when the file itself
// declares the receiver's class (Future / WebSocketClient, or a read of the ws client's `futures`
// map, `IDictionary<string, Future>` in cs/ccxt/ws/Client.cs).
//
//   npx tsx build/csharp-declared-ws-calls.test.ts
//
// The positive cases fail on a tree where the rule is not installed (the callDynamically line is
// returned unchanged); the negative cases must pass on both.
import { nativeDeclaredWsCalls } from './csharpTranspiler.js';

let failures = 0;
const check = (name: string, source: string, expected: string) => {
    const output: string = nativeDeclaredWsCalls (source);
    const ok = output === expected;
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  expected: ' + JSON.stringify (expected));
        console.log ('  actual:   ' + JSON.stringify (output));
    }
};

// the two shapes that exist in the generated tree today: the ws promise local read out of
// `client.futures` (pro/alpaca.cs, pro/htx.cs)
check ('futures-read receiver, resolve',
    'object promise = getValue(client.futures, "authenticated");\ncallDynamically(promise, "resolve", new object[] {message});',
    'object promise = getValue(client.futures, "authenticated");\n(promise as Future).resolve(message);');

check ('safeValue futures-read receiver, resolve',
    'var future = this.safeValue((client as WebSocketClient).futures, "authenticated");\ncallDynamically(future, "resolve", new object[] {true});',
    'var future = this.safeValue((client as WebSocketClient).futures, "authenticated");\n(future as Future).resolve(true);');

// a receiver the file declares as the class itself needs no cast
check ('declared Future local, reject',
    'Future promise = this.future("auth");\ncallDynamically(promise, "reject", new object[] {error});',
    'Future promise = this.future("auth");\npromise.reject(error);');

// the phase-1 `as` receiver shape, now for the other literal target
check ('as WebSocketClient receiver, reject',
    'callDynamically(client as WebSocketClient, "reject", new object[] {error, messageHash});',
    '(client as WebSocketClient).reject(error, messageHash);');

check ('as WebSocketClient receiver, resolve (2 args)',
    'callDynamically(client as WebSocketClient, "resolve", new object[] {this.balance, messageHash});',
    '(client as WebSocketClient).resolve(this.balance, messageHash);');

// argument scanning: a nested call and a comma inside a string literal are one argument each
check ('nested call argument',
    'object promise = getValue(client.futures, "auth");\ncallDynamically(promise, "resolve", new object[] {this.safeValue(m, "a", this.x)});',
    'object promise = getValue(client.futures, "auth");\n(promise as Future).resolve(this.safeValue(m, "a", this.x));');

check ('comma inside a string argument',
    'object promise = getValue(client.futures, "auth");\ncallDynamically(promise, "resolve", new object[] {"a,b"});',
    'object promise = getValue(client.futures, "auth");\n(promise as Future).resolve("a,b");');

check ('two sites in one file',
    'object promise = getValue(client.futures, "a");\ncallDynamically(promise, "resolve", new object[] {m});\nobject promise2 = getValue(client.futures, "b");\ncallDynamically(promise2, "resolve", new object[] {n});',
    'object promise = getValue(client.futures, "a");\n(promise as Future).resolve(m);\nobject promise2 = getValue(client.futures, "b");\n(promise2 as Future).resolve(n);');

// negatives: every one must stay a helper call
check ('receiver not declared (object local)',
    'object stored = this.safeValue(this.something, "x");\ncallDynamically(stored, "resolve", new object[] {message});',
    'object stored = this.safeValue(this.something, "x");\ncallDynamically(stored, "resolve", new object[] {message});');

check ('a `future` local that is not a futures read',
    'object future = this.safeValue(this.rejections, "x");\ncallDynamically(future, "resolve", new object[] {message});',
    'object future = this.safeValue(this.rejections, "x");\ncallDynamically(future, "resolve", new object[] {message});');

check ('Future.resolve with two arguments cannot bind',
    'object promise = getValue(client.futures, "auth");\ncallDynamically(promise, "resolve", new object[] {message, other});',
    'object promise = getValue(client.futures, "auth");\ncallDynamically(promise, "resolve", new object[] {message, other});');

check ('WebSocketClient.resolve needs exactly two arguments',
    'callDynamically(client as WebSocketClient, "resolve", new object[] {message});',
    'callDynamically(client as WebSocketClient, "resolve", new object[] {message});');

check ('empty argument list (the helper passes {null})',
    'object promise = getValue(client.futures, "auth");\ncallDynamically(promise, "resolve", new object[] {});',
    'object promise = getValue(client.futures, "auth");\ncallDynamically(promise, "resolve", new object[] {});');

check ('receiver rebound later (D2)',
    'object promise = getValue(client.futures, "auth");\npromise = this.safeValue(message, "x");\ncallDynamically(promise, "resolve", new object[] {message});',
    'object promise = getValue(client.futures, "auth");\npromise = this.safeValue(message, "x");\ncallDynamically(promise, "resolve", new object[] {message});');

check ('method name outside the two classes',
    'object promise = getValue(client.futures, "auth");\ncallDynamically(promise, "append", new object[] {message});',
    'object promise = getValue(client.futures, "auth");\ncallDynamically(promise, "append", new object[] {message});');

check ('ArrayCache receivers stay (sibling family)',
    'callDynamically(stored, "append", new object[] {order});\ncallDynamically(orders, "getLimit", new object[] {symbol, limit, params});',
    'callDynamically(stored, "append", new object[] {order});\ncallDynamically(orders, "getLimit", new object[] {symbol, limit, params});');

check ('this-receiver literals stay (delegate properties)',
    'proxyUrl = callDynamically(this, "proxyUrlCallback", new object[] { url, method, headers, body });',
    'proxyUrl = callDynamically(this, "proxyUrlCallback", new object[] { url, method, headers, body });');

check ('non-literal method name stays',
    'object response = await ((Task<object>)callDynamically(this, method, new object[] { symbol, limit, parameters }));',
    'object response = await ((Task<object>)callDynamically(this, method, new object[] { symbol, limit, parameters }));');

check ('value position stays (resolve/reject return void)',
    'object promise = getValue(client.futures, "auth");\nvar x = callDynamically(promise, "resolve", new object[] {message});',
    'object promise = getValue(client.futures, "auth");\nvar x = callDynamically(promise, "resolve", new object[] {message});');

check ('return position stays',
    'object promise = getValue(client.futures, "auth");\nreturn callDynamically(promise, "resolve", new object[] {message});',
    'object promise = getValue(client.futures, "auth");\nreturn callDynamically(promise, "resolve", new object[] {message});');

check ('initializer on another line proves nothing',
    'object promise = this.safeValue(\n    client.futures, "auth");\ncallDynamically(promise, "resolve", new object[] {message});',
    'object promise = this.safeValue(\n    client.futures, "auth");\ncallDynamically(promise, "resolve", new object[] {message});');

console.log (failures === 0 ? '\nall cases passed' : '\n' + failures + ' case(s) failed');
process.exit (failures === 0 ? 0 : 1);