// Native `-` on a null-guarded Int64? / double? operand instead of subtract(a, b)
// (installCsharpGuardedNullableSubtract in build/csharp-local-types.js).
// Run: npx tsx build/csharp-guarded-subtract.test.ts
import { Transpiler } from 'ast-transpiler';
import { setupCsharpPrinter } from './csharp-worker.js';

const transpiler = new Transpiler ({ 'verbose': false, 'csharp': { 'parser': { 'ELEMENT_ACCESS_WRAPPER_OPEN': 'getValue(', 'ELEMENT_ACCESS_WRAPPER_CLOSE': ')' } } });
setupCsharpPrinter (transpiler);

let failures = 0;
function check (name: string, body: string, expected: string[], forbidden: string[]) {
    const source = `
type Int = number | undefined;
type Num = number | undefined;
class Test {
    safeInteger (o, k, d = undefined): Int { return 1; }
    safeNumber (o, k, d = undefined): Num { return 1; }
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        const request = {};
${body}
        return request;
    }
}`;
    const out = transpiler.transpileCSharp (source).content as string;
    for (const needle of expected) {
        if (!out.includes (needle)) {
            failures++;
            console.error ('FAIL', name, '- missing', JSON.stringify (needle), '\n', out);
            return;
        }
    }
    for (const needle of forbidden) {
        if (out.includes (needle)) {
            failures++;
            console.error ('FAIL', name, '- unexpected', JSON.stringify (needle), '\n', out);
            return;
        }
    }
    console.log ('ok:', name);
}

// positives
check ('Int64? param in the then-branch of its own null test',
    `        if (since !== undefined) { request['before'] = since - 1; }`,
    [ 'request)["before"] = (since - 1);' ], [ 'subtract(' ]);

check ('Int64? param on the right of && with its null test on the left',
    `        request['a'] = (since !== undefined) && ((since - 1) > 0);`,
    [ '(since - 1)' ], [ 'subtract(' ]);

check ('Int64? param after a dominating early exit',
    `        if (since === undefined) { return request; }
        request['b'] = since - 1000;`,
    [ '(since - 1000)' ], [ 'subtract(' ]);

check ('two guarded Int64? operands',
    `        if (since !== undefined && limit !== undefined) { request['c'] = since - limit; }`,
    [ '(since - limit)' ], [ 'subtract(' ]);

check ('Int64? local from safeInteger under its guard',
    `        const until = this.safeInteger (params, 'until');
        if (until !== undefined) { request['d'] = until - 1; }`,
    [ 'Int64? until = ', '(until - 1)' ], [ 'subtract(' ]);

check ('double? local minus int literal under its guard',
    `        const fee = this.safeNumber (params, 'fee');
        if (fee !== undefined) { request['e'] = fee - 1; }`,
    [ 'double? fee = ', '(fee - 1)' ], [ 'subtract(' ]);

check ('non-nullable left, guarded Int64? right',
    `        if (since !== undefined) { request['f'] = 5 - since; }`,
    [ '(5 - since)' ], [ 'subtract(' ]);

// negatives
check ('unguarded Int64? keeps the helper',
    `        request['g'] = since - 1;`,
    [ 'subtract(since, 1)' ], [ '(since - 1)' ]);

check ('guard on a different binding keeps the helper',
    `        if (limit !== undefined) { request['h'] = since - 1; }`,
    [ 'subtract(since, 1)' ], [ '(since - 1)' ]);

check ('a write to the binding anywhere in the function keeps the helper',
    `        const until = this.safeInteger (params, 'until');
        if (until !== undefined) { request['i'] = until - 1; }
        until = 5;`,
    [ 'subtract(until, 1)' ], [ '(until - 1)' ]);

check ('one guarded and one unguarded nullable keeps the helper',
    `        if (since !== undefined) { request['j'] = since - limit; }`,
    [ 'subtract(since, limit)' ], [ '(since - limit)' ]);

check ('Int64? minus a double keeps the helper (helper throws InvalidCast, `-` would compute)',
    `        if (since !== undefined) { request['k'] = since - 1.5; }`,
    [ 'subtract(since, 1.5)' ], [ '(since - 1.5)' ]);

check ('guard inside a lambda does not admit the outer read',
    `        const f = () => { if (since !== undefined) { return 1; } return 2; };
        request['l'] = since - 1;`,
    [ 'subtract(since, 1)' ], [ '(since - 1)' ]);

check ('`==` null test only admits the else-branch',
    `        if (since === undefined) { request['m'] = since - 1; } else { request['n'] = since - 2; }`,
    [ 'subtract(since, 1)', '(since - 2)' ], [ '(since - 1)' ]);

check ('a throw argument keeps the helper (hard (string) cast)',
    `        if (since !== undefined) { throw new Error (since - 1); }`,
    [ 'subtract(since, 1)' ], [ '(since - 1)' ]);

if (failures > 0) {
    console.error (failures + ' failure(s)');
    process.exit (1);
}
console.log ('all passed');
