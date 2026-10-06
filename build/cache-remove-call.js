import ts from 'typescript6';

// Dispatch only calls resolved to the actual side-cache API, not textual names.
export function installCacheRemoveCall (transpiler, language) {
    let printer;
    if (language === 'go') {
        printer = transpiler.goTranspiler;
    } else if (language === 'rust') {
        printer = transpiler.rustTranspiler;
    } else if (language === 'java') {
        printer = transpiler.javaTranspiler;
    } else if (language === 'csharp') {
        printer = transpiler.csharpTranspiler;
    } else {
        throw new Error(`Unsupported cache remove language: ${language}`);
    }
    if (printer.__cacheRemoveCallInstalled) {
        return;
    }
    const original = printer.printCallExpression;
    printer.printCallExpression = function (node, indentation) {
        if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'remove' && node.arguments.length === 1) {
            const declaration = this.getChecker().getResolvedSignature(node)?.getDeclaration();
            const owner = declaration?.parent;
            const file = declaration?.getSourceFile().fileName.replaceAll('\\', '/');
            if (owner && ts.isClassDeclaration(owner) && owner.name?.text === 'ArrayCacheBySymbolBySide' && file?.endsWith('/ts/src/base/ws/Cache.ts')) {
                const receiver = this.printNode(node.expression.expression, 0);
                const argument = this.printNode(node.arguments[0], 0);
                if (language === 'go') {
                    return `any(${receiver}).(*ccxt.ArrayCacheBySymbolBySide).Remove(ccxt.ToString(${argument}))`;
                }
                if (language === 'csharp') {
                    return `((ccxt.pro.ArrayCacheBySymbolBySide)${receiver}).remove((string)${argument})`;
                }
                if (language === 'rust') {
                    return `${receiver}.remove_cache_symbol(${argument})`;
                }
                if (language === 'java') {
                    // Java uses its native printer and the nested cache class.
                    return `((ArrayCache.ArrayCacheBySymbolBySide)${receiver}).remove((String)${argument})`;
                }
                throw new Error(`Unsupported cache remove language: ${language}`);
            }
        }
        return original.call(this, node, indentation);
    };
    printer.__cacheRemoveCallInstalled = true;
}
