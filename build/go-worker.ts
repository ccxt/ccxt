import { Transpiler, installCcxtGoLocalTypes, installCcxtGoIndexableTypes, installCcxtGoParamTypes, installCcxtGoDictParams, installCcxtGoGb05ParamTypes, installCcxtGoGb11HandleErrorsCode, installCcxtGoSignTyping, installRfGo5OwnedTables, installFmGo5G01, installFmGo5G04, installCcxtGoTupleSlotReads, installFmGo5GP08, installFmGo5OG02 } from 'ast-transpiler';
import { getProgramBatch } from './worker-program-batch.js';
import log from 'ololog'

// task payload posted by goTranspiler.ts#webworkerTranspile (structured clone)
interface GoWorkerTask {
    transpilerConfig: any;
    configKey?: string;
    file?: string;
    files?: string[];
    roots?: string[];
}

// exchange -> method -> raw leading comment, collected while printing
type GoComments = { [exchange: string]: { [method: string]: string } };

let cachedTranspiler: Transpiler | null = null;
let cachedConfigKey: string | null = null;
let goComments: GoComments = {};
let programCache: ReturnType<typeof Transpiler.createProgramCache> | null = null;

function transformLeadingComment (comment: string): string {
    const commentNameRegex = /@name\s(\w+)#(\w+)/;
    const nameMatches = comment.match (commentNameRegex);
    const exchangeName = nameMatches ? nameMatches[1] : undefined;
    if (!exchangeName) {
        return comment;
    }
    const methodName = (nameMatches as RegExpMatchArray)[2];
    let exchangeMethods = goComments[exchangeName];
    if (!exchangeMethods) {
        exchangeMethods = goComments[exchangeName] = {};
    }
    exchangeMethods[methodName] = comment;
    return comment;
}

// `if (market['spot'])` on a local written only by `this.market (...)` / `this.safeMarket (...)`: both
// return MarketTyped rows (plain values) and the flag is a MarketInterface boolean, so `== true` is EvalTruthy
const GO_MARKET_BOOL_FLAGS = [ 'spot', 'swap', 'future', 'option', 'contract' ];
function goIsMarketRowWrite (n: any): boolean {
    if ((n === undefined) || (n.getText () === 'undefined')) {
        return true;
    }
    return /^this\.(?:market|safeMarket) \(/.test (n.getText ());
}
export function installCcxtGoMarketBoolReads (printer: any) {
    const original = printer.goNativeCondition.bind (printer);
    printer.goNativeCondition = function (node: any) {
        const native = original (node);
        while ((native === undefined) && (node?.kind !== undefined) && (node.expression !== undefined) && (node.argumentExpression === undefined) && /^\(.*\)$/s.test (node.getText ())) {
            node = node.expression;
        }
        if ((native !== undefined) || (node?.argumentExpression === undefined) || (typeof node.expression?.text !== 'string')) {
            return native;
        }
        const key = /^'(\w+)'$/.exec (node.argumentExpression.getText ())?.[1];
        if ((key === undefined) || !GO_MARKET_BOOL_FLAGS.includes (key)) {
            return native;
        }
        const receiver = node.expression;
        const declaration = this.goDeclarationOfIdentifier (receiver);
        const scope = (declaration === undefined) ? undefined : this.goEnclosingFunction (declaration);
        // the read must already print as a native map index (the local is a Go map, not an any box)
        const read = `${this.printNode (receiver, 0)}["${key}"]`;
        if ((scope === undefined) || (declaration.parent?.declarations === undefined) || (this.printNode (node, 0) !== read) || !goIsMarketRowWrite (declaration.initializer)) {
            return native;
        }
        // every later write of the local, whole or by key, must be another market row
        const name = receiver.text;
        let ok = true;
        const visit = (n: any) => {
            if (!ok) {
                return;
            }
            const isAssign = (n.operatorToken !== undefined) && (n.operatorToken.getText () === '=');
            if (isAssign && (n.left.getText () === name) && this.goIdentifierRefersToDeclaration (n.left, declaration)) {
                ok = goIsMarketRowWrite (n.right);
            } else if (isAssign && (n.left.expression?.getText () === name)) {
                ok = false;
            } else if ((n.elements !== undefined) && (n.parent?.left === n) && n.elements.some ((e: any) => e.getText () === name)) {
                ok = false;
            }
            n.forEachChild (visit);
        };
        scope.forEachChild (visit);
        return ok ? `(${read} == true)` : native;
    };
}

const verbose = !!process.env['CCXT_TRANSPILE_VERBOSE'];

export default async ({ transpilerConfig, configKey, file, files, roots }: GoWorkerTask) => {
    const key = configKey || JSON.stringify (transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        if (!programCache) {
            programCache = Transpiler.createProgramCache ();
        }
        cachedTranspiler = new Transpiler (transpilerConfig, programCache);
        cachedTranspiler.setVerboseMode (false);
        cachedTranspiler.goTranspiler.transformLeadingComment = transformLeadingComment;
        installCcxtGoLocalTypes(cachedTranspiler.goTranspiler, transpilerConfig?.go?.unifiedInt64Params);
        installCcxtGoIndexableTypes(cachedTranspiler.goTranspiler);
        installCcxtGoParamTypes(cachedTranspiler.goTranspiler);
        installCcxtGoDictParams(cachedTranspiler.goTranspiler);
        installCcxtGoGb05ParamTypes(cachedTranspiler.goTranspiler);
        installCcxtGoGb11HandleErrorsCode(cachedTranspiler.goTranspiler);
        installCcxtGoSignTyping(cachedTranspiler.goTranspiler);
        installRfGo5OwnedTables(cachedTranspiler.goTranspiler);  // RF-go-5
        installFmGo5G01(cachedTranspiler.goTranspiler);  // FM-GO5
        installFmGo5G04(cachedTranspiler.goTranspiler);  // FM-GO5
        installCcxtGoTupleSlotReads(cachedTranspiler.goTranspiler);
        installFmGo5GP08(cachedTranspiler.goTranspiler);  // FM-GO5
        installFmGo5OG02(cachedTranspiler.goTranspiler);  // FM-GO5
        installCcxtGoMarketBoolReads(cachedTranspiler.goTranspiler);
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    // accept either the legacy single-file payload or a multi-file chunk
    const filePaths: string[] = files ?? [ file as string ];

    // ts.Program roots — the FULL file list of the current stage, sent identically on
    // every task, so this thread builds the shared program once and every later
    // one-file task prints straight off its checker (see worker-program-batch.ts).
    // Every transpileGoByPath otherwise builds a program over [file, globalsShim]:
    // the SourceFile cache already makes the ~340-file import closure parse-free, but
    // the bind/check work behind getPreEmitDiagnostics is redone per root set.
    // Files that import each other (a derived exchange and its parent) are just
    // separate root files of the same program, and the emit is byte-identical to the
    // per-file path.
    const programRoots = (roots && roots.length) ? roots : filePaths;
    const batch = getProgramBatch (transpiler, programRoots, key);

    const result: any[] = [];
    for (const filePath of filePaths) {
        if (verbose) {
            log.blue ('[worker][go] Transpiling', filePath);
        }
        result.push (batch ? batch.transpileGoByPath (filePath) : transpiler.transpileGoByPath (filePath));
    }
    // the comments collected by transformLeadingComment during this task, keyed
    // exchange -> method, so one merge per task is equivalent to one per file
    const comments = goComments;
    goComments = {};
    return { files: result, file: result[0], goComments: comments };
}
