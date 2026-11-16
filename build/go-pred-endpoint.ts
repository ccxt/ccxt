// ===== G10K-pred: native optional-params bind in ccxtprediction endpoint wrappers =====
// fetch2Body re-binds slot 2 with GetArg(optionalArgs, 2, {}), which derefs and nil-collapses, so
// binding params once as a typed dict (GetArgMap, a nil map when absent) is value-identical.

// the baked endpoint body for package ccxtprediction; `call` is the printed return statement
// whose params argument is `ccxt.GetArg(args, 0, nil)`
export function goPredictionEndpointBody (body: string): string {
    const bind = 'ccxt.GetArg(args, 0, nil)';
    if (body.split (bind).length !== 2) {
        return body;
    }
    // implicit-API params are always a dict: bind it typed once with the GetArg twin (absent, nil or
    // a nil box -> nil map, which fetch2Body's GetArg collapses to {} exactly like an untyped nil)
    return [
        '\tvar params map[string]any = ccxt.GetArgMap(args, 0, nil)',
        body.replace (bind, 'params'),
    ].join ('\n');
}

// the ccxt import is needed only while some body still names package ccxt
export function goPredictionNeedsCcxtImport (methods: string[]): boolean {
    return methods.some (m => m.includes ('ccxt.'));
}

// self-check: the typed bind replaces the one GetArg and nothing else
export function goPredictionEndpointBodySelfTest (): string[] {
    const out = goPredictionEndpointBody ('\treturn ccxt.Fetch2Result[any](this, "p", ccxt.GetArg(args, 0, nil))');
    const fails: string[] = [];
    if (!out.startsWith ('\tvar params map[string]any = ccxt.GetArgMap(args, 0, nil)\n')) { fails.push ('goPredictionEndpointBody: params not typed'); }
    if (out.includes ('GetArg(') || !out.endsWith ('(this, "p", params)')) { fails.push ('goPredictionEndpointBody: bind not replaced'); }
    return fails;
}
