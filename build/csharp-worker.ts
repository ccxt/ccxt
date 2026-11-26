import { Transpiler } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import { ts, csharpTypeOfValue, installCsharpAsyncCoreReturns, installCsharpCollectionReturns, installCsharpConditionOperands, installCsharpLocalTypes, installCsharpNativeArithmetic, installCsharpNumericComparisons, installCsharpNumericReturns, installCsharpParameterDeclarations, installCsharpBooleanParams, installCsharpGuardedMinMax, installCsharpDictIdentKeyReads, installCsharpNativeComparisons, installCsharpNativeIntProducts, installCsharpOrderBookSideReads, installCsharpStringParams, installCsharpParameterTypes, installCsharpReceiverTypes, installCsharpStringReceivers, installCsharpStringReturns, installCsharpDeclaredCollectionLocals, installCsharpNativeInt64Add, installCsharpNonNullConcat, installCsharpProPresenceFlags } from './csharp-local-types.js';
import log from 'ololog'
// task payload posted by csharpTranspiler.ts#webworkerTranspile (structured clone)
interface CsharpWorkerTask {
    transpilerConfig: any;
    configKey?: string;
    file?: string;
    files?: string[];
    roots?: string[];
}
// TS >= 5/6 (ast-transpiler 0.0.91) can report dictionary key types like `Str` (string | undefined) as a union whose first member is not the string one. The default printer only i...
export function setupCsharpPrinter (transpiler: Transpiler) {
    transpiler.setVerboseMode (false);
    const csharp = transpiler.csharpTranspiler;
    // the printer (config typedCores) renames every `Promise<int|Int>` core to its `Task<Int64> <Name>` public declaration: the printer binds the awaited calls to that name, so the In...
    (csharp as any).csharpPascalInt64TaskCalls = true;
    csharp.printElementAccessExpressionExceptionIfAny = (node: any) => {
        const parent = node.parent;
        const isLeftSideOfAssignment = parent?.kind === ts.SyntaxKind.BinaryExpression
            && (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken || parent.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken)
            && parent?.left === node;
        if (!isLeftSideOfAssignment || !csharp.ELEMENT_ACCESS_WRAPPER_OPEN || !csharp.ELEMENT_ACCESS_WRAPPER_CLOSE) { return undefined; }
        // Prefer the sticky batch program (createProgramBatch does not write byPathOldProgram), then the by-path cache used by transpileCSharpByPath. `context` is private on the Transpile...
        const program = (transpiler as any).context?.program ?? (transpiler as any).byPathOldProgram;
        const sourceFile = node.getSourceFile ();
        if (!program || program.getSourceFile (sourceFile.fileName) !== sourceFile) {
            return undefined; // in-memory program (examples/tests) — let the base printer decide
        }
        const { expression, argumentExpression } = node;
        const type = csharp.getChecker ().getTypeAtLocation (argumentExpression);
        const parts: any[] | undefined = ts.typeParts (type);
        if (type.isUnionType () && parts !== undefined && parts.some ((t) => csharp.isStringType (t.flags))) {
            const expressionAsString = csharp.printNode (expression, 0);
            const argumentAsString = csharp.printNode (argumentExpression, 0);
            const cast = ts.isStringLiteralLike (argumentExpression) ? '' : '(string)';
            return `((IDictionary<string,object>)${expressionAsString})[${cast}${argumentAsString}]`;
        }
        return undefined;
    };
    // concrete types for generated locals (see build/csharp-local-types.js); installed here so the pooled workers and the main-thread transpiler emit identical declarations
    installCsharpLocalTypes (transpiler);
    // `((string)x).Split/.ToUpper/...` receivers: the printer's cast is redundant once the declaration's emitted type is a string — the local-types tables above name those
    installCsharpStringReceivers (transpiler);
    // the printer's receiver-type hook: an element WRITE into a dict-typed local drops the interface cast (`request["k"] = v`) — see the receiver-declared-types section of the same file
    installCsharpReceiverTypes (transpiler);
    // `isTrue (x)` condition operands the local-types pass retypes to bool/bool? print natively (`x` / `x == true`, see the ast printer's csharpConditionOperandType); the printer's ow...
    installCsharpConditionOperands (transpiler);
    // the numeric-literal / call-result locals this module retypes are printable as native comparisons once the printer can ask for their read type (build/csharp-local-types.js)
    installCsharpNumericComparisons (transpiler);
    // concrete return types for the numeric base helpers whose C# signature was `object` (see the numeric-returns section of build/csharp-local-types.js) — the locals map registers th...
    installCsharpNumericReturns (transpiler);
    // concrete return types for the async base cores whose C# signature was `Task<object>` while every declaration's runtime value already is the markets/currencies dictionary (see th...
    installCsharpAsyncCoreReturns (transpiler);
    // `async <name> (...): Promise<boolean>` methods print `Task<bool>` / `Task<bool?>` instead of `Task<object>`: the annotation names the exact value the method returns (its body on...
    const asyncBooleanValueType = (node: any): string | undefined => {
        if (node?.kind !== ts.SyntaxKind.MethodDeclaration || !csharp.isAsyncFunction (node)) { return undefined; }
        if (!node.type) {
            const override = typeof csharp.getMethodOverride === 'function' ? csharp.getMethodOverride (node) : undefined;
            return (override === undefined || override === node) ? undefined : asyncBooleanValueType (override);
        }
        const typeNode = node.type.typeArguments?.[0];
        if (typeNode === undefined) {
            return undefined; // `Promise` with no type argument
        }
        const type = csharp.getChecker ().getTypeFromTypeNode (typeNode);
        const members = type.isUnionType () ? ts.typeParts (type) : [ type ];
        let nullable = false;
        let sawBoolean = false;
        let sawOther = false;
        for (const member of members) {
            if (member.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) { nullable = true; } else if (member.flags & ts.TypeFlags.BooleanLike) { sawBoolean = true; } else { sawOther = true; }
        }
        if (!sawBoolean || sawOther) { return undefined; }
        return nullable ? csharp.BOOLEAN_KEYWORD + '?' : csharp.BOOLEAN_KEYWORD;
    };
    const originalBooleanReturnType = csharp.csharpBooleanReturnType.bind (csharp);
    csharp.csharpBooleanReturnType = (node: any) => (asyncBooleanValueType (node) ?? originalBooleanReturnType (node));
    // the package's printFunctionType returns the plain bool for a bool-typed method and `Task<object>` for an async one, so the async spelling needs the Task<> wrapper here; printRet...
    const originalPrintFunctionType = csharp.printFunctionType.bind (csharp);
    csharp.printFunctionType = (node: any) => { const result = originalPrintFunctionType (node); if (csharp.isAsyncFunction (node) && (result === 'bool' || result === 'bool?')) { return 'Task<' + result + '>'; } return result; };
    // concrete return types for generated non-async string-returning methods (see the string-returns section of build/csharp-local-types.js); installed after the local-types hook so b...
    installCsharpStringReturns (transpiler);
    // native arithmetic in place of the add / subtract / multiply / divide helpers where both operands' C# static types are proven (see the native-arithmetic section of build/csharp-l...
    installCsharpNativeArithmetic (transpiler);
    // `<`/`>`/`<=`/`>=` and null-guarded `-` on proven numeric operands (same section)
    installCsharpNativeComparisons (transpiler);
    // `int * <int literal>` as the Int64 product (literal printed with `L`, same section)
    installCsharpNativeIntProducts (transpiler);
    // `book['asks' | 'bids']` on a proven ws order book local reads the typed side property
    installCsharpOrderBookSideReads (transpiler);
    // concrete return types for generated non-async dict/list-returning methods (see the dict/list-returns section of build/csharp-local-types.js) — their returns carry the same bound...
    installCsharpCollectionReturns (transpiler);
    // the C# type the emitted signature carries for a narrowed core argument (see the parameter-type section of build/csharp-local-types.js); installed last so it wraps the read-type ...
    installCsharpParameterTypes (transpiler);
    // native parameter declarations for the annotated internal methods (see the typed-parameter section of build/csharp-local-types.js) -- installed after every other hook so the call...
    installCsharpParameterDeclarations (transpiler);
    // `boolean` parameters of the names CSHARP_BOOLEAN_PARAMS lists print bool / bool?
    installCsharpBooleanParams (transpiler);
    // `Str`/`string` parameters of the names CSHARP_STRING_PARAMS lists print string / string?
    installCsharpStringParams (transpiler);
    // Math.Min/Max on a null-guarded Int64? parameter (see build/csharp-local-types.js)
    installCsharpGuardedMinMax (transpiler);
    // `getValue (d, k)` on a never-null dictionary local with a string key prints the indexer read
    installCsharpDictIdentKeyReads (transpiler);
    // `return ((bool)((object)(x))!)` in a bool / bool? method is an identity box + unbox. Drop it when the returned expression's own C# static type already IS the method's boolean ty...
    installCsharpBooleanReturnCasts (csharp);
    // emitted collection declarations answer the printer's indexer-read resolver
    installCsharpDeclaredCollectionLocals (transpiler);
    installCsharpNativeInt64Add (transpiler); // proven non-null Int64 add prints native
    installCsharpNonNullConcat (transpiler); // proven non-null string concat prints native
    installCsharpProPresenceFlags (transpiler); // pro locals only ever null-tested print a bool flag
}
// bare helper calls whose hand-written C# signature returns `bool` and whose printed form IS that call: `static bool isEqual / isTrue` (Exchange.TranspileHelpers.cs), `bool inOp` ...
const CSHARP_BOOLEAN_RETURN_CALLS = new Set ([ 'isEqual', 'isTrue', 'inOp' ]);
// The C# static type of a returned expression, with the same authority that types the local declarations (csharpTypeOfValue resolves locals through csharpLocalType). Undefined whe...
function booleanReturnValueType (csharp: any, node: any, scope: any): string | undefined {
    let value = node;
    while (value?.kind === ts.SyntaxKind.ParenthesizedExpression) { value = value.expression; }
    if (value?.kind === ts.SyntaxKind.CallExpression && value.expression?.kind === ts.SyntaxKind.Identifier && CSHARP_BOOLEAN_RETURN_CALLS.has (value.expression.text)) { return csharp.BOOLEAN_KEYWORD; }
    return csharpTypeOfValue (csharp, node, { scope, stack: new Set (), depth: 0 });
}
function installCsharpBooleanReturnCasts (csharp: any) {
    if (!csharp || typeof csharp.printReturnStatement !== 'function' || csharp._localBooleanReturnCastsPatched) { return; }
    const upstream = csharp.printReturnStatement.bind (csharp);
    csharp.printReturnStatement = (node: any, identation: any) => {
        const printed = upstream (node, identation);
        if (typeof printed !== 'string' || !node.expression) { return printed; }
        const booleanType = csharp.csharpBooleanReturnType (ts.findAncestor (node.parent, ts.isFunctionLike));
        if (booleanType === undefined) { return printed; }
        if (booleanReturnValueType (csharp, node.expression, csharp.csharpEnclosingFunction (node)) !== booleanType) { return printed; }
        // rebuild the wrapper exactly as the printer emitted it, then splice the bare value in
        const value = csharp.printNode (node.expression, identation).trim ();
        const forgiving = booleanType.endsWith ('?') ? '' : '!';
        const wrapper = `((${booleanType})((object)(${value}))${forgiving})`;
        const at = printed.indexOf (wrapper);
        if (at < 0) { return printed; }
        return printed.slice (0, at) + value + printed.slice (at + wrapper.length);
    };
    csharp._localBooleanReturnCastsPatched = true;
}
// piscina reuses worker threads across tasks — cache the Transpiler per thread (construction is expensive) and rebuild only if the config ever changes
let cachedTranspiler: Transpiler | null = null;
let cachedConfigKey: string | null = null;
let rawComments: string[] = [];
let programCache: ReturnType<typeof Transpiler.createProgramCache> | null = null;
const verbose = !!process.env['CCXT_TRANSPILE_VERBOSE'];
export default async ({ transpilerConfig, configKey, file, files, roots }: CsharpWorkerTask) => {
    const key = configKey || JSON.stringify (transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        if (!programCache) { programCache = Transpiler.createProgramCache (); }
        cachedTranspiler = new Transpiler (transpilerConfig, programCache);
        setupCsharpPrinter (cachedTranspiler);
        // the main thread turns these into C# doc comments — collect the raw ones and let it replay its own transform so the wrapper docs stay identical
        cachedTranspiler.csharpTranspiler.transformLeadingComment = (comment: string) => { rawComments.push (comment); return comment; };
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    rawComments = [];
    // work set for THIS task — one file by default
    const filePaths: string[] = files ?? [ file as string ];
    // ts.Program roots — the whole stage, identical on every task, so the batch this thread builds on its first task is reused for all the rest (see worker-program-batch.ts). Falls ba...
    const programRoots = (roots && roots.length) ? roots : filePaths;
    const batch = getProgramBatch (transpiler, programRoots, key);
    const result: any[] = [];
    for (const filePath of filePaths) {
        if (verbose) { log.blue ('[worker][csharp] Transpiling', filePath); }
        const transpiled = batch ? batch.transpileCSharpByPath (filePath) : transpiler.transpileCSharpByPath (filePath);
        result.push (transpiled);
    }
    return { result, comments: rawComments };
}
