// Concrete C# return types for base methods whose C# signature was `object` while the
// value every return path already produces is a concrete type (the transpiler has no
// way to name it: `number` maps to `object` for return types, and these methods carry
// no usable annotation — `nonce ()` has none at all).
//
//   nonce()               -> Int64    returns this.seconds() / this.milliseconds(),
//                                     or subtract(...) whose Int64 left operand keeps
//                                     the Int64 box (49 definitions: base + overrides)
//   parseToInt()          -> Int64?   parseInt() box: Int64 or null
//   safeNumber()          -> double?  parseNumber() box: double or null
//   safeNumber2()         -> double?
//   safeNumberN()         -> double?
//   safeNumberOmitZero()  -> double?  defaultValue only ever flows out as null here
//
// Every other return path that is not already the declared type is unboxed through
// `object` exactly like the `: boolean` handling in the pinned ast-transpiler: the
// printed expression keeps its upstream shape and the cast happens at the boundary.
// The nullable spellings are the point: a missing value stays null, never 0.
//
// Deliberately NOT here (proved mixed-box in the runtime, see the PR notes):
//   parseToNumeric()  -> parseInt path boxes Int64, parseFloat path boxes double
//   sum()             -> Convert.ToInt64 box for integer-valued sums, double otherwise
//
// The local-typing map in build/csharp-local-types.js registers the SAME names with
// the same C# types; keep the two in sync (its scan rejects a typed local wherever
// the declared type would re-bind an overload or a ref sink).
//
// IMPORTANT: like installCsharpLocalTypes, this must be installed before the printer
// emits anything (setupCsharpPrinter installs both, pooled worker and main thread).

import ts from 'typescript6';

export const CSHARP_METHOD_RETURN_TYPES = {
    // Exchange.BaseMethods.cs (transpiled from ts/src/base/Exchange.ts)
    'nonce': 'Int64',
    'parseToInt': 'Int64?',
    'safeNumber': 'double?',
    'safeNumber2': 'double?',
    'safeNumberN': 'double?',
    'safeNumberOmitZero': 'double?',
};

// the mapped C# return type for a method declaration, or undefined to leave the
// printer's own decision (annotated methods, async methods, every other name)
function csharpMethodReturnType (csharp, node) {
    if (node?.kind !== ts.SyntaxKind.MethodDeclaration) {
        return undefined;
    }
    const mapped = CSHARP_METHOD_RETURN_TYPES[node.name?.escapedText];
    if (mapped === undefined) {
        return undefined;
    }
    if (typeof csharp.isAsyncFunction === 'function' && csharp.isAsyncFunction (node)) {
        return undefined;
    }
    return mapped;
}

// `return <expr>;` inside a mapped method — wrap unless the expression already carries
// the declared type (this.seconds() IS Int64) or converts to it without a box change
// (an integer literal reaches Int64?/Int64 through the implicit numeric conversion; a
// hard unbox would throw on its Int32 box, so those must NOT be wrapped)
function needsUnboxingWrap (csharp, expression, mapped) {
    if (expression === undefined) {
        return false;
    }
    if (expression.kind === ts.SyntaxKind.NullKeyword) {
        return false;
    }
    let expression2 = expression;
    if (expression2.kind === ts.SyntaxKind.PrefixUnaryExpression && expression2.operator === ts.SyntaxKind.MinusToken) {
        expression2 = expression2.operand;
    }
    if (expression2?.kind === ts.SyntaxKind.NumericLiteral && /^\d+$/.test (expression2.text)) {
        return false;
    }
    if (typeof csharp.csharpTypeOfInitializer === 'function' && csharp.csharpTypeOfInitializer (expression) === mapped) {
        return false;
    }
    return true;
}

export function installCsharpMethodReturnTypes (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.printFunctionType !== 'function' || csharp._methodReturnTypesPatched) {
        return;
    }
    const upstreamFunctionType = csharp.printFunctionType.bind (csharp);
    csharp.printFunctionType = (node, ...rest) => {
        const mapped = csharpMethodReturnType (csharp, node);
        if (mapped !== undefined) {
            return mapped;
        }
        return upstreamFunctionType (node, ...rest);
    };
    const upstreamReturnStatement = csharp.printReturnStatement.bind (csharp);
    csharp.printReturnStatement = (node, identation) => {
        // nearest function-like: a `return` inside an arrow/function expression belongs
        // to that callback, never to the enclosing mapped method
        const mapped = csharpMethodReturnType (csharp, ts.findAncestor (node.parent, ts.isFunctionLike));
        if (mapped === undefined || !needsUnboxingWrap (csharp, node.expression, mapped)) {
            return upstreamReturnStatement (node, identation);
        }
        const leadingComment = csharp.printLeadingComments (node, identation);
        let trailingComment = csharp.printTraillingComment (node, identation);
        trailingComment = trailingComment ? ' ' + trailingComment : trailingComment;
        const value = csharp.printNode (node.expression, identation).trim ();
        const forgiving = mapped.endsWith ('?') ? '' : '!';
        return leadingComment + csharp.getIden (identation) + csharp.RETURN_TOKEN + ` ((${mapped})((object)(${value}))${forgiving})` + csharp.LINE_TERMINATOR + trailingComment;
    };
    csharp._methodReturnTypesPatched = true;
}

export default installCsharpMethodReturnTypes;
