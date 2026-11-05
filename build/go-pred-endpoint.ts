// ===== G10K-pred: native optional-params bind in ccxtprediction endpoint wrappers =====
// fetch2Body re-binds slot 2 with GetArg(optionalArgs, 2, {}), which derefs and nil-collapses like
// GetArg(args, 0, nil) does, so passing args[0] (or nil when absent) raw is value-identical.

// the baked endpoint body for package ccxtprediction; `call` is the printed return statement
// whose params argument is `ccxt.GetArg(args, 0, nil)`
export function goPredictionEndpointBody (body: string): string {
    const bind = 'ccxt.GetArg(args, 0, nil)';
    if (body.split (bind).length !== 2) {
        return body;
    }
    return [
        '\tvar params any',
        '\tif len(args) > 0 {',
        '\t\tparams = args[0]',
        '\t}',
        body.replace (bind, 'params'),
    ].join ('\n');
}

// the ccxt import is needed only while some body still names package ccxt
export function goPredictionNeedsCcxtImport (methods: string[]): boolean {
    return methods.some (m => m.includes ('ccxt.'));
}
