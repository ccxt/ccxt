import ts from 'typescript6';

// ===== G10K-pred: native optional-params bind in ccxtprediction endpoint wrappers =====
// fetch2Body re-binds slot 2 with GetArg(optionalArgs, 2, {}), which derefs and nil-collapses, so
// binding params once as a typed dict (GetArgMap, a nil map when absent) is value-identical.

// the baked endpoint body for package ccxtprediction; `call` is the printed return statement
// whose params argument is `ccxt.GetArg(args, 0, nil)`. `listArg` = some prediction source passes
// this endpoint an array (polymarket's bare-array bodies): that params stays the untyped box.
export function goPredictionEndpointBody (body: string, listArg = false): string {
    const bind = 'ccxt.GetArg(args, 0, nil)';
    if (body.split (bind).length !== 2) {
        return body;
    }
    if (listArg) {
        return [
            '\tvar params any',
            '\tif len(args) > 0 {',
            '\t\tparams = args[0]',
            '\t}',
            body.replace (bind, 'params'),
        ].join ('\n');
    }
    // every other implicit-API params is a dict: bind it typed once with the GetArg twin (absent, nil
    // or a nil box -> nil map, which fetch2Body's GetArg collapses to {} exactly like an untyped nil)
    return [
        '\tvar params map[string]any = ccxt.GetArgMap(args, 0, nil)',
        body.replace (bind, 'params'),
    ].join ('\n');
}

// implicit endpoint names (camelCase, as `this.<name> (..)` in ts/src/prediction) that some call site
// passes an array-typed first argument, read from the TypeScript checker over the prediction sources
export function goPredictionListArgEndpoints (files: string[]): Set<string> {
    const out = new Set<string> ();
    const program = ts.createProgram (files, { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, noEmit: true, skipLibCheck: true });
    const checker = program.getTypeChecker ();
    const visit = (node: ts.Node) => {
        if (ts.isCallExpression (node) && ts.isPropertyAccessExpression (node.expression) && (node.expression.expression.kind === ts.SyntaxKind.ThisKeyword) && (node.arguments.length > 0)) {
            const type = checker.getTypeAtLocation (node.arguments[0]);
            const parts = type.isUnion () ? type.types : [ type ];
            if (parts.some ((t) => checker.isArrayType (t) || checker.isTupleType (t))) {
                out.add (node.expression.name.text);
            }
        }
        ts.forEachChild (node, visit);
    };
    for (const file of files) {
        const source = program.getSourceFile (file);
        if (source !== undefined) {
            visit (source);
        }
    }
    return out;
}

// the ccxt import is needed only while some body still names package ccxt
export function goPredictionNeedsCcxtImport (methods: string[]): boolean {
    return methods.some (m => m.includes ('ccxt.'));
}

// self-check: the typed bind replaces the one GetArg and nothing else; a list-fed endpoint keeps the box
export function goPredictionEndpointBodySelfTest (): string[] {
    const body = '\treturn ccxt.RequestResult[any](this, "p", ccxt.GetArg(args, 0, nil))';
    const out = goPredictionEndpointBody (body);
    const boxed = goPredictionEndpointBody (body, true);
    const fails: string[] = [];
    if (!out.startsWith ('\tvar params map[string]any = ccxt.GetArgMap(args, 0, nil)\n')) { fails.push ('goPredictionEndpointBody: params not typed'); }
    if (out.includes ('GetArg(') || !out.endsWith ('(this, "p", params)')) { fails.push ('goPredictionEndpointBody: bind not replaced'); }
    if (!boxed.startsWith ('\tvar params any\n') || boxed.includes ('GetArgMap')) { fails.push ('goPredictionEndpointBody: list-fed endpoint typed'); }
    return fails;
}
