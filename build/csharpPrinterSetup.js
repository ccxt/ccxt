// "typescript6" is an npm alias for typescript@6 — the last release that ships the JS compiler API
import ts from 'typescript6';

// TS >= 5/6 (ast-transpiler 0.0.91) can report dictionary key types like `Str`
// (string | undefined) as a union whose first member is not the string one. The default
// printer only inspects the first union member, so dictionary assignments
// (`result[symbol] = value`) would be wrongly emitted as list index writes
// (`((List<object>)result)[Convert.ToInt32(symbol)]`). Handle unions containing a string
// member here (matches the previous TS 4.9 output).
// Shared by csharpTranspiler.ts and csharp-worker.js so pooled and main-thread files emit
// identical code.
export function setupCsharpPrinter (transpiler) {
    transpiler.setVerboseMode (false);
    const csharp = transpiler.csharpTranspiler;
    csharp.printElementAccessExpressionExceptionIfAny = (node) => {
        const parent = node.parent;
        const isLeftSideOfAssignment = parent?.kind === ts.SyntaxKind.BinaryExpression
            && (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken || parent.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken)
            && parent?.left === node;
        if (!isLeftSideOfAssignment || !csharp.ELEMENT_ACCESS_WRAPPER_OPEN || !csharp.ELEMENT_ACCESS_WRAPPER_CLOSE) {
            return undefined;
        }
        // read the checker off the program this instance built for the file rather than the
        // library's `global.checker`, so parallel instances never observe each other's state
        const program = transpiler.byPathOldProgram;
        const sourceFile = node.getSourceFile ();
        if (!program || program.getSourceFile (sourceFile.fileName) !== sourceFile) {
            return undefined; // in-memory program (examples/tests) — let the base printer decide
        }
        const { expression, argumentExpression } = node;
        const type = program.getTypeChecker ().getTypeAtLocation (argumentExpression);
        const isUnion = ((type.flags & ts.TypeFlags.Union) !== 0) && Array.isArray (type.types);
        if (isUnion && type.types.some ((t) => csharp.isStringType (t.flags))) {
            const expressionAsString = csharp.printNode (expression, 0);
            const argumentAsString = csharp.printNode (argumentExpression, 0);
            const cast = ts.isStringLiteralLike (argumentExpression) ? '' : '(string)';
            return `((IDictionary<string,object>)${expressionAsString})[${cast}${argumentAsString}]`;
        }
        return undefined;
    };
}
