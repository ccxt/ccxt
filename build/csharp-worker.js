import { Transpiler } from 'ast-transpiler';
import ts from 'typescript6';
import log from 'ololog'

// piscina reuses worker threads across tasks — cache the Transpiler per thread
// (construction is expensive) and rebuild only if the config ever changes
let cachedTranspiler = null;
let cachedConfigKey = null;
let rawComments = [];

// mirror of NewTranspiler.setupTranspiler in csharpTranspiler.ts — keep the two in sync,
// the printer override changes emitted code and must not differ between threads
function setupTranspiler (transpiler) {
    transpiler.setVerboseMode (false);
    const csharp = transpiler.csharpTranspiler;
    // the main thread turns these into C# doc comments; collect the raw ones and let it
    // replay its own transform so the wrapper docs stay identical
    csharp.transformLeadingComment = (comment) => {
        rawComments.push (comment);
        return comment;
    };
    csharp.printElementAccessExpressionExceptionIfAny = (node) => {
        const { expression, argumentExpression } = node;
        const parent = node.parent;
        const isLeftSideOfAssignment = parent?.kind === ts.SyntaxKind.BinaryExpression
            && (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken || parent.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken)
            && parent?.left === node;
        if (isLeftSideOfAssignment && csharp.ELEMENT_ACCESS_WRAPPER_OPEN && csharp.ELEMENT_ACCESS_WRAPPER_CLOSE) {
            const type = global.checker.getTypeAtLocation (argumentExpression);
            const isUnion = ((type.flags & ts.TypeFlags.Union) !== 0) && Array.isArray (type.types);
            if (isUnion && type.types.some ((t) => csharp.isStringType (t.flags))) {
                const expressionAsString = csharp.printNode (expression, 0);
                const argumentAsString = csharp.printNode (argumentExpression, 0);
                const cast = ts.isStringLiteralLike (argumentExpression) ? '' : '(string)';
                return `((IDictionary<string,object>)${expressionAsString})[${cast}${argumentAsString}]`;
            }
        }
        return undefined;
    };
}

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

export default async ({transpilerConfig, configKey, files}) => {
    const key = configKey || JSON.stringify (transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        cachedTranspiler = new Transpiler (transpilerConfig);
        setupTranspiler (cachedTranspiler);
        cachedConfigKey = key;
    }
    const transpiler = cachedTranspiler;
    rawComments = [];
    const result = [];
    for (const filePath of files) {
        if (verbose) {
            log.blue ('[worker][csharp] Transpiling', filePath);
        }
        const transpiled = transpiler.transpileCSharpByPath (filePath);
        result.push (transpiled);
    }
    return { result, comments: rawComments };
}
