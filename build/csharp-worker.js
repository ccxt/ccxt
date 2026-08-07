import { Transpiler } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import log from 'ololog'
// "typescript6" is an npm alias for typescript@6 — the last release that ships the JS compiler API
import ts from 'typescript6';

// TS >= 5/6 (ast-transpiler 0.0.91) can report dictionary key types like `Str`
// (string | undefined) as a union whose first member is not the string one. The default
// printer only inspects the first union member, so dictionary assignments
// (`result[symbol] = value`) would be wrongly emitted as list index writes
// (`((List<object>)result)[Convert.ToInt32(symbol)]`). Handle unions containing a string
// member here (matches the previous TS 4.9 output).
// Used by this worker and by csharpTranspiler.ts setupTranspiler so pooled and
// main-thread files emit identical code.
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
        // Prefer the sticky batch program (createProgramBatch does not write
        // byPathOldProgram), then the by-path cache used by transpileCSharpByPath.
        const program = transpiler.context?.program ?? transpiler.byPathOldProgram;
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

// ast-transpiler's BaseTranspiler.getType() returns the raw TypeScript type name verbatim for a
// TypeReference (`Dict`, `Str`, `Num`, ...). CSharpTranspiler calls it only from
// printPropertyAccessModifiers(), so a TS class field `x: Dict = {}` was emitted as
// `public Dict x = ...` → CS0246. Resolve ccxt TS aliases in FIELD position to DEFAULT_TYPE
// (`object`) — the dynamic type all generated C# already uses. A narrower
// `Dictionary<string, object>` instead breaks on assignment from safeValue(), which returns
// `object` and does not implicitly downcast (CS0266).
// Exported and consumed by BOTH csharpTranspiler.ts (main thread) and this worker, so the pooled
// path CI uses cannot drift from the main-thread emit.
export function patchCsharpPropertyTypes (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.getType !== 'function' || csharp._propertyTypesPatched) {
        return;
    }
    const originalGetType = csharp.getType.bind (csharp);
    csharp.getType = (node) => {
        const type = originalGetType (node);
        // Only rewrite genuine TypeReference annotations (`x: Dict`). Keyword types
        // (`x: boolean`, `x: string`, `x: any`, `x: string[]`) carry no `typeName` and are already
        // resolved to real C# types by SupportedKindNames — `boolean` is also a key of
        // VariableTypeReplacements, so matching on the name alone would wrongly demote
        // `public bool verbose` to `public object verbose`.
        const isTypeReference = node?.type?.typeName !== undefined;
        const tsAliases = csharp.VariableTypeReplacements ?? {};
        if (isTypeReference && (typeof type === 'string') && Object.prototype.hasOwnProperty.call (tsAliases, type)) {
            return csharp.DEFAULT_TYPE ?? 'object';
        }
        return type;
    };
    csharp._propertyTypesPatched = true;
}

// piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive) and rebuild only if the config ever changes
let cachedTranspiler = null;
let cachedConfigKey = null;
let rawComments = [];

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

export default async ({transpilerConfig, configKey, file, files, roots}) => {
    const key = configKey || JSON.stringify(transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        cachedTranspiler = new Transpiler(transpilerConfig);
        setupCsharpPrinter(cachedTranspiler);
        patchCsharpPropertyTypes(cachedTranspiler);
        // the main thread turns these into C# doc comments — collect the raw ones and let
        // it replay its own transform so the wrapper docs stay identical
        cachedTranspiler.csharpTranspiler.transformLeadingComment = (comment) => {
            rawComments.push(comment);
            return comment;
        };
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    rawComments = [];

    // work set for THIS task — one file by default
    const filePaths = files ?? [file];
    // ts.Program roots — the whole stage, identical on every task, so the batch this
    // thread builds on its first task is reused for all the rest (see
    // worker-program-batch.js). Falls back to the task's own files when the driver
    // did not send roots (older payload shape).
    const programRoots = (roots && roots.length) ? roots : filePaths;
    const batch = getProgramBatch (transpiler, programRoots, key);

    const result = [];
    for (const filePath of filePaths) {
        if (verbose) {
            log.blue('[worker][csharp] Transpiling', filePath);
        }
        const transpiled = batch
            ? batch.transpileCSharpByPath(filePath)
            : transpiler.transpileCSharpByPath(filePath);
        result.push(transpiled);
    }
    return { result, comments: rawComments };
}
