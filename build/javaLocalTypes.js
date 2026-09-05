// Java local-variable typing for the ast-transpiler Java printer.
//
// The Java printer declares every body local as `Object` (VAR_TOKEN) because its
// generic INFER_VAR_TYPE branch would also type Safe*/GetValue/ternary/Add results,
// which are genuinely `Object` at runtime. This module narrows ONLY the locals whose
// initializer is a whole call to a hand-written base accessor with a known concrete
// runtime type:
//
//     Object price = this.safeString(ticker, "price");
// becomes
//     String price = (String)this.safeString(ticker, "price");
//
// `BaseExchange.safeString*` is hand-written and delegates to `SafeMethods`, whose
// bodies return a `String` or `null` on every path, but its declared return type is
// `Object`, so the cast is what lets javac accept the narrowed declaration (a
// checkcast on a String/null is free). Boxed `String`, never a primitive: an absent
// key yields null.
//
// It is applied as a monkey-patch on `transpiler.javaTranspiler` from BOTH the
// main-thread Transpiler (build/javaTranspiler.ts#setupTranspiler) and the piscina
// worker (build/java-worker.ts) — same precedent as patchJavaPropertyTypes(), and it
// keeps the ast-transpiler pin untouched. Plain ESM (not .ts) because the worker
// thread is plain JS.
//
// Uses `typescript6` — the same 6.x line that ast-transpiler bundles — so SyntaxKind
// values agree with the AST nodes the printer hands us.
import ts from 'typescript6';

// helper → Java type. Every entry MUST be a hand-written Java base method whose
// runtime value is always an instance of that type (or null). Transpiled base
// methods (safeBool/safeDict/safeList/safeNumber...) do NOT qualify: their Java
// bodies return whatever the TS default argument was, boxed as Object.
//
// SafeMethods.SafeStringTyped / safeString2 / SafeStringN coerce the found value to
// String and drop a non-String default (`instanceof String s ? s : null`), so they
// are String-or-null unconditionally.
const STRING_ACCESSORS = new Set([
    'safeString', 'safeString2', 'safeStringN',
]);

// SafeMethods.safeStringUpper* / safeStringLower* return the found value
// `.toUpperCase()`d, but hand the DEFAULT back untouched (`Object`). They classify
// only when the default is absent or provably a String; index of that argument:
const STRING_CASE_ACCESSORS = {
    'safeStringUpper': 2, 'safeStringLower': 2,
    'safeStringUpper2': 3, 'safeStringLower2': 3,
    'safeStringUpperN': 2, 'safeStringLowerN': 2,
};

// hand-written base methods declared with a String return in Java
// (BaseExchange.iso8601 / numberToString) — used only to prove a later
// reassignment keeps the local a String
const STRING_RETURNING_BASE_METHODS = new Set([
    'iso8601', 'numberToString',
]);

// Precise.string* statics are declared `public static String` in Precise.java
const PRECISE_STRING_STATICS = new Set([
    'stringAdd', 'stringSub', 'stringMul', 'stringDiv', 'stringMod', 'stringAbs',
    'stringNeg', 'stringMax', 'stringMin', 'stringOr',
]);

const ACCESSOR_DECLARATION_FILE = /[\\/]base[\\/]functions[\\/]type\.ts$/;

function isThisCall (node) {
    return node !== undefined && ts.isCallExpression (node)
        && ts.isPropertyAccessExpression (node.expression)
        && node.expression.expression.kind === ts.SyntaxKind.ThisKeyword;
}

// `this.x(...)` or `super.x(...)`: both resolve against the class hierarchy
function isThisOrSuperCall (node) {
    return node !== undefined && ts.isCallExpression (node)
        && ts.isPropertyAccessExpression (node.expression)
        && (node.expression.expression.kind === ts.SyntaxKind.ThisKeyword || node.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
}

// `this.safeString(...)` resolving to the base accessor in ts/src/base/functions/type.ts
// (an exchange override would be transpiled with an `Object` return, so it must not classify)
function isBaseStringAccessorCall (printer, node) {
    if (!isThisCall (node)) {
        return false;
    }
    const name = node.expression.name.escapedText;
    const defaultIndex = STRING_CASE_ACCESSORS[name];
    if (!STRING_ACCESSORS.has (name) && defaultIndex === undefined) {
        return false;
    }
    const declaration = printer.getChecker ().getResolvedSignature (node)?.declaration;
    if (declaration === undefined || !ACCESSOR_DECLARATION_FILE.test (declaration.getSourceFile ().fileName)) {
        return false;
    }
    if (defaultIndex !== undefined && node.arguments.length > defaultIndex) {
        return isProvablyStringExpression (printer, node.arguments[defaultIndex], undefined);
    }
    return true;
}

// true when the printed Java for `node` is statically a String (or null).
// `selfName` is the local being classified: a self-reference (`x = cond ? 'a' : x`)
// is consistent with whatever type that local ends up with.
//
// A bare base accessor call is only accepted at the TOP level (`nested` false):
// the accessor is declared `Object` in Java, and the reassignment hook below casts
// exactly that shape (`x = (String)this.safeString(...)`). Inside a ternary arm
// the same call would print uncast and javac rejects the conditional.
function isProvablyStringExpression (printer, node, selfName, nested = false) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' || node.escapedText === selfName;
        case ts.SyntaxKind.ParenthesizedExpression:
            return isProvablyStringExpression (printer, node.expression, selfName, nested);
        case ts.SyntaxKind.ConditionalExpression:
            return isProvablyStringExpression (printer, node.whenTrue, selfName, true) && isProvablyStringExpression (printer, node.whenFalse, selfName, true);
        case ts.SyntaxKind.BinaryExpression:
            // `'lit' + x` prints Helpers.add(String, Object) → String
            return node.operatorToken.kind === ts.SyntaxKind.PlusToken
                && (node.left.kind === ts.SyntaxKind.StringLiteral || node.left.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral);
        case ts.SyntaxKind.CallExpression: {
            if (isBaseStringAccessorCall (printer, node)) {
                return !nested;
            }
            const callee = node.expression;
            if (!ts.isPropertyAccessExpression (callee)) {
                return false;
            }
            const method = callee.name.escapedText;
            if (callee.expression.kind === ts.SyntaxKind.ThisKeyword) {
                return STRING_RETURNING_BASE_METHODS.has (method);
            }
            return callee.expression.kind === ts.SyntaxKind.Identifier
                && callee.expression.escapedText === 'Precise'
                && PRECISE_STRING_STATICS.has (method);
        }
        default:
            return false;
    }
}

function enclosingFunction (node) {
    let current = node?.parent;
    while (current) {
        switch (current.kind) {
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.ArrowFunction:
            case ts.SyntaxKind.Constructor:
            case ts.SyntaxKind.SourceFile:
                return current;
        }
        current = current.parent;
    }
    return undefined;
}

// every Identifier node in `scope`, by source name. Not cached: the Java printer
// renames identifiers inside object literals in place (`x` → `finalX`) while a
// function body is being printed, so the walk must read the live AST each time.
function identifierIndex (scope) {
    const index = new Map ();
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.Identifier) {
            const name = n.escapedText;
            let list = index.get (name);
            if (list === undefined) {
                list = [];
                index.set (name, list);
            }
            list.push (n);
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return index;
}

// resolves to an `async` method (or one declared to return a Promise — an overload
// signature carries the return type but not the modifier)
function isAsyncMethodCall (printer, callNode) {
    const declaration = printer.getChecker ().getResolvedSignature (callNode)?.declaration;
    if (declaration === undefined) {
        return false;
    }
    if (ts.canHaveModifiers (declaration) && (ts.getModifiers (declaration) ?? []).some ((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
        return true;
    }
    const returnType = declaration.type;
    return returnType !== undefined && ts.isTypeReferenceNode (returnType)
        && ts.isIdentifier (returnType.typeName) && returnType.typeName.escapedText === 'Promise';
}

// reject the refinement when a later use needs the local to stay `Object`
function isSafeToNarrow (printer, declaration, sourceName, isProFile) {
    const scope = enclosingFunction (declaration);
    if (scope === undefined) {
        return false;
    }
    const uses = identifierIndex (scope).get (sourceName) ?? [];
    for (const n of uses) {
        if (n === declaration.name) {
            continue;
        }
        const parent = n.parent;
        if (parent === undefined) {
            continue;
        }
        if (ts.isVariableDeclaration (parent) && parent.name === n) {
            continue; // a sibling block-scoped declaration gets its own type
        }
        if (ts.isPropertyAccessExpression (parent) && parent.name === n) {
            continue; // `obj.<name>` is a member, not this local
        }
        if (ts.isPostfixUnaryExpression (parent) || ts.isPrefixUnaryExpression (parent)) {
            const op = parent.operator;
            if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) {
                return false;
            }
        }
        if (ts.isSpreadElement (parent)) {
            return false;
        }
        if (ts.isTypeOfExpression (parent)) {
            return false; // `typeof x === 'number'` prints `x instanceof Long`: inconvertible for a String
        }
        if (ts.isArrayLiteralExpression (parent) && ts.isBinaryExpression (parent.parent)
            && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            return false; // `[x, y] = f()` prints `x = ((List) tmp).get(i)`
        }
        if (ts.isBinaryExpression (parent) && parent.left === n) {
            const op = parent.operatorToken.kind;
            if (op === ts.SyntaxKind.EqualsToken) {
                if (!isProvablyStringExpression (printer, parent.right, sourceName)) {
                    return false;
                }
            } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                return false;
            }
        }
        // A pro core extends the REST *wrapper* class, whose typed overloads
        // (`Ticker fetchTicker(String symbol)`) would win Java overload resolution
        // over the `Object...` core once an argument expression is a String. Keep
        // any local that feeds such a call `Object` (directly or nested — e.g.
        // `Helpers.add(String, String)` also returns String) so the call keeps
        // binding to the core.
        if (isProFile && feedsInheritedAsyncCall (printer, n, scope)) {
            return false;
        }
    }
    return true;
}

// is `n` an argument of a `this.<async>()` call, either directly or through the
// expression forms whose printed Java type is String whenever an operand is
// (`(x)`, `x + y` → Helpers.add(String, ..) → String, `c ? x : y`). Anything else
// in between (another call, an element access) prints as Object and breaks the chain.
function feedsInheritedAsyncCall (printer, n, scope) {
    let child = n;
    let current = n.parent;
    while (current !== undefined && current !== scope) {
        if (ts.isCallExpression (current)) {
            return current.arguments.indexOf (child) !== -1 && isThisOrSuperCall (current) && isAsyncMethodCall (printer, current);
        }
        const propagates = ts.isParenthesizedExpression (current)
            || (ts.isBinaryExpression (current) && current.operatorToken.kind === ts.SyntaxKind.PlusToken)
            || (ts.isConditionalExpression (current) && current.condition !== child);
        if (!propagates) {
            return false;
        }
        child = current;
        current = current.parent;
    }
    return false;
}

function javaLocalType (printer, declaration) {
    let initializer = declaration.initializer;
    while (initializer !== undefined && ts.isParenthesizedExpression (initializer)) {
        initializer = initializer.expression;
    }
    if (!isBaseStringAccessorCall (printer, initializer)) {
        return undefined;
    }
    if (!ts.isIdentifier (declaration.name)) {
        return undefined;
    }
    // scan by the SOURCE name: ReservedKeywordsReplacements renames the printed one
    const sourceName = declaration.name.escapedText;
    const fileName = declaration.getSourceFile ().fileName;
    const isProFile = /[\\/]pro[\\/]/.test (fileName);
    if (!isSafeToNarrow (printer, declaration, sourceName, isProFile)) {
        return undefined;
    }
    return 'String';
}

export function patchJavaLocalTypes (transpiler) {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printVariableDeclarationList !== 'function' || printer._localTypesPatched) {
        return;
    }
    // declaration node → narrowed Java type, filled as declarations are printed.
    // Java statements print in source order, so by the time a reassignment is
    // printed its declaration has already been classified.
    const narrowed = new WeakMap ();
    const original = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node, identation) {
        const printed = original (node, identation);
        const declaration = node.declarations?.[0];
        if (declaration === undefined || declaration.initializer === undefined) {
            return printed;
        }
        const javaType = javaLocalType (printer, declaration);
        if (javaType === undefined) {
            return printed;
        }
        // the original emits `<finalVars><iden>Object <name> = <value>`; retype the
        // declaration line only (finalVars above it, if any, are left untouched)
        const iden = printer.getIden (identation);
        const marker = `${iden}${printer.VAR_TOKEN} ${printer.printNode (declaration.name)} = `;
        const at = printed.lastIndexOf (marker);
        if (at === -1) {
            return printed;
        }
        const value = printed.slice (at + marker.length);
        if (!value.startsWith ('this.')) {
            return printed; // unexpected shape — leave it as the printer emitted it
        }
        narrowed.set (declaration, javaType);
        return printed.slice (0, at) + `${iden}${javaType} ${printer.printNode (declaration.name)} = (${javaType})${value}`;
    };
    // `x = this.safeString(...)` on a narrowed local: the accessor is declared
    // `Object` in Java, so the reassignment needs the same cast the declaration got
    const originalBinary = printer.printBinaryExpression.bind (printer);
    printer.printBinaryExpression = function (node, identation) {
        const printed = originalBinary (node, identation);
        if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier (node.left)) {
            return printed;
        }
        let right = node.right;
        while (ts.isParenthesizedExpression (right)) {
            right = right.expression;
        }
        if (!isBaseStringAccessorCall (printer, right)) {
            return printed;
        }
        const symbol = printer.getChecker ().getSymbolAtLocation (node.left);
        const declaration = symbol?.valueDeclaration;
        const javaType = (declaration !== undefined) ? narrowed.get (declaration) : undefined;
        if (javaType === undefined) {
            return printed;
        }
        const marker = `${printer.printNode (node.left, 0)} = this.`;
        const at = printed.indexOf (marker);
        if (at === -1) {
            return printed;
        }
        const head = at + marker.length - 'this.'.length;
        return printed.slice (0, head) + `(${javaType})` + printed.slice (head);
    };
    printer._localTypesPatched = true;
}
