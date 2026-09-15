import ts from 'typescript6';

// Dispatch only calls resolved to the actual side-cache API, not textual names.
export function installCacheRemoveCall (transpiler, language) {
    const printer = language === 'go' ? transpiler.goTranspiler : transpiler.csharpTranspiler;
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
                    return `any(${receiver}).(interface{ Remove(string) }).Remove(ccxt.ToString(${argument}))`;
                }
                // Java is emitted through the C# printer before its conversion pass.
                return `callDynamically(${receiver}, "remove", new object[] {${argument}})`;
            }
        }
        return original.call(this, node, indentation);
    };
    printer.__cacheRemoveCallInstalled = true;
}
