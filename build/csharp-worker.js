import { Transpiler } from 'ast-transpiler';
import log from 'ololog'

function createSee(link) {
    return `/// See <see href="${link}"/>  <br/>`
}

function createParam(param) {
    return`/// <item>
    /// <term>${param.name}</term>
    /// <description>
    /// ${param.type} : ${param.description}
    /// </description>
    /// </item>`
}

function createCsharpCommentTemplate(name, desc, see, params, returnType, returnDesc) {
    const comment = `
    /// <summary>
    /// ${desc}
    /// </summary>
    /// <remarks>
    ${see.map( l => createSee(l)).join("\n    ")}
    /// <list type="table">
    ${params.map( p => createParam(p)).join("\n    ")}
    /// </list>
    /// </remarks>
    /// <returns> <term>${returnType}</term> ${returnDesc}.</returns>`
    const commentWithoutEmptyLines = comment.replace(/^\s*[\r\n]/gm, "");
    return commentWithoutEmptyLines;
}

function transformLeadingComment(comment, csharpComments) {
    const commentNameRegex = /@name\s(\w+)#(\w+)/;
    const nameMatches = comment.match(commentNameRegex);
    const exchangeName = nameMatches ? nameMatches[1] : undefined;
    if (!exchangeName) {
        return comment;
    }
    const methodName = nameMatches[2];
    const commentDescriptionRegex = /@description\s(.+)/;
    const descriptionMatches = comment.match(commentDescriptionRegex);
    const description = descriptionMatches ? descriptionMatches[1] : undefined;
    const seeRegex = /@see\s(.+)/g;
    const seeMatches = comment.match(seeRegex);
    const sees = [];
    if (seeMatches) {
        seeMatches.forEach((match) => {
            const [, link] = match.split(' ');
            sees.push(link);
        });
    }
    const paramRegex = /@param\s{(\w+[?]?)}\s\[(\w+\.?\w+?)]\s(.+)/g;
    const params = [];
    let paramMatch;
    while ((paramMatch = paramRegex.exec(comment)) !== null) {
        const [, type, name, description] = paramMatch;
        params.push({type, name, description});
    }
    const returnRegex = /@returns\s{(\w+\[?\]?\[?\]?)}\s(.+)/;
    const returnMatch = comment.match(returnRegex);
    const returnType = returnMatch ? returnMatch[1] : undefined;
    const returnDescription =  returnMatch && returnMatch.length > 1 ? returnMatch[2]: undefined;
    let exchangeData = csharpComments[exchangeName];
    if (!exchangeData) {
        exchangeData = csharpComments[exchangeName] = {}
    }
    let exchangeMethods = csharpComments[exchangeName];
    if (!exchangeMethods) {
        exchangeMethods = {}
    }
    const transformedComment = createCsharpCommentTemplate(methodName, description, sees, params, returnType, returnDescription);
    exchangeMethods[methodName] = transformedComment;
    csharpComments[exchangeName] = exchangeMethods
    return comment;
}

export default async ({transpilerConfig, files}) => {
    const transpiler = new Transpiler(transpilerConfig);
    const csharpComments = {};
    transpiler.csharpTranspiler.transformLeadingComment = (comment) => transformLeadingComment(comment, csharpComments);

    const result = [];
    for (const filePath of files) {
        log.blue('[worker][csharp] Transpiling', filePath);
        const transpiled = transpiler.transpileCSharpByPath(filePath);
        result.push(transpiled);
    }
    return { result, csharpComments };
}
