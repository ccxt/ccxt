import { Transpiler } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import { installCsharpLocalTypes } from './csharp-local-types.js';
import log from 'ololog'
// "typescript6" is an npm alias for typescript@6 — the last release that ships the JS compiler API
import ts from 'typescript6';

// task payload posted by csharpTranspiler.ts#webworkerTranspile (structured clone)
interface CsharpWorkerTask {
    transpilerConfig: any;
    configKey?: string;
    file?: string;
    files?: string[];
    roots?: string[];
}

// TS >= 5/6 (ast-transpiler 0.0.91) can report dictionary key types like `Str`
// (string | undefined) as a union whose first member is not the string one. The default
// printer only inspects the first union member, so dictionary assignments
// (`result[symbol] = value`) would be wrongly emitted as list index writes
// (`((List<object>)result)[Convert.ToInt32(symbol)]`). Handle unions containing a string
// member here (matches the previous TS 4.9 output).
// Used by this worker and by csharpTranspiler.ts setupTranspiler so pooled and
// main-thread files emit identical code.
export function setupCsharpPrinter (transpiler: Transpiler) {
    transpiler.setVerboseMode (false);
    const csharp = transpiler.csharpTranspiler;
    csharp.printElementAccessExpressionExceptionIfAny = (node: any) => {
        const parent = node.parent;
        const isLeftSideOfAssignment = parent?.kind === ts.SyntaxKind.BinaryExpression
            && (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken || parent.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken)
            && parent?.left === node;
        if (!isLeftSideOfAssignment || !csharp.ELEMENT_ACCESS_WRAPPER_OPEN || !csharp.ELEMENT_ACCESS_WRAPPER_CLOSE) {
            return undefined;
        }
        // Prefer the sticky batch program (createProgramBatch does not write
        // byPathOldProgram), then the by-path cache used by transpileCSharpByPath.
        // `context` is private on the Transpiler type and `byPathOldProgram` is untyped,
        // so go through `any` — same runtime access the plain-JS worker made.
        const program: ts.Program | undefined = (transpiler as any).context?.program ?? (transpiler as any).byPathOldProgram;
        const sourceFile = node.getSourceFile ();
        if (!program || program.getSourceFile (sourceFile.fileName) !== sourceFile) {
            return undefined; // in-memory program (examples/tests) — let the base printer decide
        }
        const { expression, argumentExpression } = node;
        const type = program.getTypeChecker ().getTypeAtLocation (argumentExpression);
        const isUnion = ((type.flags & ts.TypeFlags.Union) !== 0) && Array.isArray ((type as ts.UnionType).types);
        if (isUnion && (type as ts.UnionType).types.some ((t) => csharp.isStringType (t.flags))) {
            const expressionAsString = csharp.printNode (expression, 0);
            const argumentAsString = csharp.printNode (argumentExpression, 0);
            const cast = ts.isStringLiteralLike (argumentExpression) ? '' : '(string)';
            return `((IDictionary<string,object>)${expressionAsString})[${cast}${argumentAsString}]`;
        }
        return undefined;
    };
    // concrete types for generated locals (see build/csharp-local-types.js); installed here
    // so the pooled workers and the main-thread transpiler emit identical declarations
    installCsharpLocalTypes (transpiler);
}

// piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive) and rebuild only if the config ever changes
let cachedTranspiler: Transpiler | null = null;
let cachedConfigKey: string | null = null;
let rawComments: string[] = [];

const verbose = !!process.env['CCXT_TRANSPILE_VERBOSE'];

export default async ({ transpilerConfig, configKey, file, files, roots }: CsharpWorkerTask) => {
    const key = configKey || JSON.stringify (transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        cachedTranspiler = new Transpiler (transpilerConfig);
        setupCsharpPrinter (cachedTranspiler);
        // the main thread turns these into C# doc comments — collect the raw ones and let
        // it replay its own transform so the wrapper docs stay identical
        cachedTranspiler.csharpTranspiler.transformLeadingComment = (comment: string) => {
            rawComments.push (comment);
            return comment;
        };
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    rawComments = [];

    // work set for THIS task — one file by default
    const filePaths: string[] = files ?? [ file as string ];
    // ts.Program roots — the whole stage, identical on every task, so the batch this
    // thread builds on its first task is reused for all the rest (see
    // worker-program-batch.ts). Falls back to the task's own files when the driver
    // did not send roots (older payload shape).
    const programRoots = (roots && roots.length) ? roots : filePaths;
    const batch = getProgramBatch (transpiler, programRoots, key);

    const result: any[] = [];
    for (const filePath of filePaths) {
        if (verbose) {
            log.blue ('[worker][csharp] Transpiling', filePath);
        }
        const transpiled = batch
            ? batch.transpileCSharpByPath (filePath)
            : transpiler.transpileCSharpByPath (filePath);
        result.push (transpiled);
    }
    return { result, comments: rawComments };
}
