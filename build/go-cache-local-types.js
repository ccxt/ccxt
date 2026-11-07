import { SyntaxKind, installCcxtGoLocalTypes as installUpstreamGoLocalTypes } from 'ast-transpiler';

// Cache-local support stays here while the general Go typing hooks live upstream.
function goSourceIsWsTree (node) {
    try {
        let current = node;
        while (current !== undefined && current.parent !== undefined) {
            current = current.parent;
        }
        const fileName = (current !== undefined && current.fileName !== undefined) ? String (current.fileName) : '';
        // the main-thread transpile registers the file relative to the repo root
        // (ts/src/pro/<x>.ts) while the Piscina batch registers it absolute, so accept both
        return /(^|[\\/])ts[\\/]src[\\/]pro[\\/]/.test (fileName);
    } catch (e) {
        return false; // cannot prove the tree → stay `any`
    }
}

const CCXT_GO_CACHE_TYPES = [ 'ArrayCacheByTimestamp', 'ArrayCacheBySymbolById', 'ArrayCacheBySymbolBySide' ];

// Exchange cache fields are boxed in Go. Honor an explicit cache assertion on a
// local used only for cache methods, without depending on the local's name.
function ccxtGoCacheLocalType (goTranspiler, initializer) {
    const declaration = initializer?.parent;
    if (!goSourceIsWsTree (initializer) || (initializer?.kind !== SyntaxKind.AsExpression)
        || (declaration?.kind !== SyntaxKind.VariableDeclaration)
        || (declaration.name?.kind !== SyntaxKind.Identifier)
        || (initializer.expression?.kind !== SyntaxKind.PropertyAccessExpression)
        || (initializer.expression.expression?.kind !== SyntaxKind.ThisKeyword)
        || (initializer.type?.kind !== SyntaxKind.TypeReference)
        || (initializer.type.typeName?.kind !== SyntaxKind.Identifier)) {
        return undefined;
    }
    const name = initializer.type.typeName.text;
    let source = initializer;
    while (source.parent !== undefined) {
        source = source.parent;
    }
    const imported = source.statements?.flatMap ((s) => {
        if ((s.kind !== SyntaxKind.ImportDeclaration) || (s.moduleSpecifier?.text !== '../base/ws/Cache.js')) {
            return [];
        }
        return s.importClause?.namedBindings?.elements ?? [];
    }).find ((s) => s.name.text === name);
    const cacheType = imported?.propertyName?.text ?? imported?.name?.text;
    const scope = goTranspiler.goEnclosingFunction (declaration);
    if (!CCXT_GO_CACHE_TYPES.includes (cacheType) || (scope === undefined)) {
        return undefined;
    }
    const typeShadowed = goTranspiler.hasNodeWhere (scope, (n) =>
        [ SyntaxKind.VariableDeclaration, SyntaxKind.Parameter ].includes (n.kind) && (n.name?.text === cacheType));
    if (typeShadowed) {
        return undefined;
    }
    return goTranspiler.goDeclaredLocalTypeIfSafe (declaration, '*' + cacheType, (n) => {
        const access = n.parent;
        const call = access?.parent;
        return (access?.kind === SyntaxKind.PropertyAccessExpression) && (access.expression === n)
            && [ 'clear', 'append' ].includes (access.name.text)
            && (call?.kind === SyntaxKind.CallExpression) && (call.expression === access)
            && (access.questionDotToken === undefined) && (call.questionDotToken === undefined);
    });
}

function installCcxtGoCacheLocals (goTranspiler) {
    const print = goTranspiler.printVariableDeclarationList;
    goTranspiler.printVariableDeclarationList = function (node, identation) {
        const printed = print.call (this, node, identation);
        const declaration = node.declarations?.[0];
        const goType = ccxtGoCacheLocalType (this, declaration?.initializer);
        if (goType === undefined) {
            return printed;
        }
        const name = this.printNode (declaration.name, 0);
        // Only unbox if the printer accepted the local type; reject filters may
        // still have kept it as any.
        if (!printed.includes ('var ' + name + ' ' + goType + ' = ')) {
            return printed;
        }
        if (goType === '*ArrayCacheBySymbolById') {
            const valueAt = printed.lastIndexOf (' = ') + 3;
            return printed.slice (0, valueAt) + 'AsArrayCacheBySymbolById(' + printed.slice (valueAt) + ')';
        }
        return printed + '.(' + goType + ')';
    };
}

export function installCcxtGoLocalTypes (goTranspiler, unifiedInt64Params = undefined) {
    installUpstreamGoLocalTypes (goTranspiler, unifiedInt64Params);
    if (goTranspiler === undefined || goTranspiler.__ccxtGoCacheLocalsInstalled
        || typeof goTranspiler.goTypeOfInitializer !== 'function') {
        return;
    }
    const upstream = goTranspiler.goTypeOfInitializer;
    goTranspiler.goTypeOfInitializer = function (initializer, printedValue) {
        // An explicitly asserted concrete cache is narrower than the upstream
        // WsArrayCache field interface, which intentionally has no Clear method.
        return ccxtGoCacheLocalType (this, initializer) ?? upstream.call (this, initializer, printedValue);
    };
    installCcxtGoCacheLocals (goTranspiler);
    goTranspiler.__ccxtGoCacheLocalsInstalled = true;
}
