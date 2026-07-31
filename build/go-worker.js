import { Transpiler } from 'ast-transpiler';
import log from 'ololog'

let cachedTranspiler = null;
let cachedConfigKey = null;
let goComments = {};

function transformLeadingComment (comment) {
    const commentNameRegex = /@name\s(\w+)#(\w+)/;
    const nameMatches = comment.match(commentNameRegex);
    const exchangeName = nameMatches ? nameMatches[1] : undefined;
    if (!exchangeName) {
        return comment;
    }
    const methodName = nameMatches[2];
    let exchangeMethods = goComments[exchangeName];
    if (!exchangeMethods) {
        exchangeMethods = goComments[exchangeName] = {};
    }
    exchangeMethods[methodName] = comment;
    return comment;
}

const verbose = !!process.env.CCXT_TRANSPILE_VERBOSE;

export default async ({transpilerConfig, configKey, file}) => {
    const key = configKey || JSON.stringify(transpilerConfig);
    if (!cachedTranspiler || cachedConfigKey !== key) {
        cachedTranspiler = new Transpiler(transpilerConfig);
        cachedTranspiler.setVerboseMode(false);
        cachedTranspiler.goTranspiler.transformLeadingComment = transformLeadingComment;
        cachedConfigKey = key;
    }
    if (verbose) {
        log.blue('[worker][go] Transpiling', file);
    }
    const transpiled = cachedTranspiler.transpileGoByPath(file);
    const comments = goComments;
    goComments = {};
    return { file: transpiled, goComments: comments };
}
