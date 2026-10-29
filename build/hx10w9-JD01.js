// hx10w9-JD01: a sync whole-call initialiser `Object x = this.<m>(...)` whose callee is a generated
// venue method takes the type the callee's own declaration prints, not the previous on-disk
// generation of a java file this build rewrites: the retype and its checkcast must not depend on
// the tree a build starts from.
import { ts } from './csharp-local-types.js';

const HX10W9_JD01_DECIDED = new Map([
    ['Map<String,Object>', 'java.util.Map<String, Object>'],
    ['List<Object>', 'java.util.List<Object>'],
]);

// a venue tier the generator prints (ts/src/<id>.ts, ts/src/pro/<id>.ts, ts/src/prediction/<id>.ts)
const HX10W9_JD01_VENUE_FILE = /(^|[\\/])ts[\\/]src[\\/](?:pro[\\/]|prediction[\\/])?[a-z0-9_]+\.ts$/;

function hx10w9JD01Normalize(printed) {
    if (typeof printed !== 'string') {
        return undefined;
    }
    const type = printed.replace(/\s+/g, '').replace(/^java\.util\./, '');
    return HX10W9_JD01_DECIDED.has(type) ? type : undefined;
}

// a nested proof (printFunctionType can reach back here) asks about other nodes: answer each
// node from its own computation and keep the answer, so nesting order cannot change it
const hx10w9JD01Results = new WeakMap();
// an answer is proven against the callee's printed state (javaReturnTypeCache, published locals): when a
// class body finishes printing that state is re-proven, so every memoised answer from before it is stale
let hx10w9JD01Generation = 0;
export function invalidateHx10w9JD01() {
    hx10w9JD01Generation++;
}
const hx10w9JD01InProgress = new WeakSet();

// the emitted Java type of the call, when the callee's own declaration prints it: undefined
// (fall back to the on-disk table) for every shape this rule does not decide
export function javaVenueCalleeType(printer, node) {
    if (node === undefined || node.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const memo = hx10w9JD01Results.get(node);
    if (memo !== undefined && memo.generation === hx10w9JD01Generation) {
        return memo.decided;
    }
    if (hx10w9JD01InProgress.has(node)) {
        return undefined;
    }
    hx10w9JD01InProgress.add(node);
    try {
        const decided = javaVenueCalleeTypeUncached(printer, node);
        hx10w9JD01Results.set(node, { generation: hx10w9JD01Generation, decided });
        return decided;
    } finally {
        hx10w9JD01InProgress.delete(node);
    }
}

function javaVenueCalleeTypeUncached(printer, node) {
    const callee = node.expression;
    if (callee === undefined || callee.kind !== ts.SyntaxKind.PropertyAccessExpression
        || (callee.expression.kind !== ts.SyntaxKind.ThisKeyword
            && !(callee.expression.kind === ts.SyntaxKind.Identifier && callee.expression.text === 'super'))) {
        return undefined;
    }
    let declaration;
    for (let attempt = 0; attempt < 2 && declaration === undefined; attempt++) {
        try {
            declaration = printer.getChecker().getResolvedSignature(node)?.declaration?.resolve();
        } catch (e) {
            declaration = undefined; // a transient checker failure: one retry, then the table decides
        }
    }
    if (declaration === undefined || declaration.kind !== ts.SyntaxKind.MethodDeclaration
        || declaration.body === undefined) {
        return undefined;
    }
    const fileName = (declaration.getSourceFile?.()?.fileName ?? '').replace(/\\/g, '/');
    if (!HX10W9_JD01_VENUE_FILE.test(fileName)) {
        return undefined; // a base-tier or hand-written callee keeps the on-disk proof
    }
    // the declaration's type as printMethodDefinition emits it: the annotation print, and the
    // native fallback the printer takes when that prints the boxed `Object`
    {
        let printed;
        try {
            printed = printer.printFunctionType(declaration);
        } catch (e) {
            return undefined;
        }
        const direct = hx10w9JD01Normalize(printed);
        if (direct !== undefined) {
            return { type: HX10W9_JD01_DECIDED.get(direct) };
        }
        if (printed !== 'Object' || typeof printer.javaNativeReturnType !== 'function') {
            return undefined; // a future, a DTO, a scalar: the on-disk table stays the proof
        }
        let native;
        try {
            native = printer.javaNativeReturnType(declaration);
        } catch (e) {
            return undefined;
        }
        const fallback = hx10w9JD01Normalize(native);
        return fallback === undefined ? undefined : { type: HX10W9_JD01_DECIDED.get(fallback) };
    }
}

let hx10w9JD01Installed = false;

// the printer asks for a local's emitted type while proving a return in ANOTHER file; the
// recorded tables only know the files this worker printed, so answer the rest from the same
// rule that fills them (a pure function of the declaration), keeping every worker's answer equal
export function installHx10w9JD01(printer, computeDeclaredType) {
    if (hx10w9JD01Installed) {
        return;
    }
    hx10w9JD01Installed = true;
    hx10w9JD01SelfTest();
    if (printer === undefined || typeof printer.javaDeclaredLocalTypeResolver !== 'function'
        || typeof computeDeclaredType !== 'function') {
        return;
    }
    const upstream = printer.javaDeclaredLocalTypeResolver;
    printer.javaDeclaredLocalTypeResolver = function (declaration) {
        const own = upstream(declaration);
        if (own !== undefined || declaration === undefined) {
            return own;
        }
        try {
            return computeDeclaredType(declaration);
        } catch (e) {
            return undefined;
        }
    };
}

// the decided spellings and the fail-closed ones, asserted on the pure helper
export function hx10w9JD01SelfTest() {
    const decided = [
        ['java.util.Map<String, Object>', 'java.util.Map<String, Object>'],
        ['java.util.List<Object>', 'java.util.List<Object>'],
        ['Map<String, Object>', 'java.util.Map<String, Object>'],
    ];
    for (const [printed, type] of decided) {
        const normalized = hx10w9JD01Normalize(printed);
        if (normalized === undefined || HX10W9_JD01_DECIDED.get(normalized) !== type) {
            throw new Error(`hx10w9-JD01: ${printed} must decide ${type}`);
        }
    }
    for (const printed of ['Object', 'String', 'Long', 'Boolean', 'java.util.concurrent.CompletableFuture<Object>',
        'java.util.List<Object>[]', 'io.github.ccxt.types.OrderBook', undefined, 7]) {
        if (hx10w9JD01Normalize(printed) !== undefined) {
            throw new Error(`hx10w9-JD01: ${String(printed)} must stay undecided`);
        }
    }
    for (const [file, expected] of [['ts/src/phemex.ts', true], ['ts/src/pro/phemex.ts', true], ['/root/ccxt/ts/src/prediction/kalshi.ts', true],
        ['ts/src/base/Exchange.ts', false], ['ts/src/test/base/test.orderBook.ts', false]]) {
        if (HX10W9_JD01_VENUE_FILE.test(file) !== expected) {
            throw new Error(`hx10w9-JD01: venue file test disagrees on ${file}`);
        }
    }
    return true;
}
