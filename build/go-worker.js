import { Transpiler } from 'ast-transpiler';
import log from 'ololog'

const goComments = {};

function transformLeadingComment(comment) {
    const commentNameRegex = /@name\s(\w+)#(\w+)/;
    const nameMatches = comment.match(commentNameRegex);
    const exchangeName = nameMatches ? nameMatches[1] : undefined;
    if (!exchangeName) {
        return comment;
    }
    const methodName = nameMatches[2];
    let exchangeData = goComments[exchangeName];
    if (!exchangeData) {
        exchangeData = goComments[exchangeName] = {};
    }
    let exchangeMethods = goComments[exchangeName];
    if (!exchangeMethods) {
        exchangeMethods = {};
    }
    exchangeMethods[methodName] = comment;
    goComments[exchangeName] = exchangeMethods;
    return comment;
}

export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);
    transpiler.goTranspiler.transformLeadingComment = transformLeadingComment;

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][go] Transpiling', filePath);
        const transpiled = transpiler.transpileGoByPath(filePath);
        result.push(transpiled);
    }
    return { result, goComments };
}
