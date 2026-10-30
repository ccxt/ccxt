// ===== hx10 wave9 GP14: the Go delegate wrapper prints the parameter type of the method it calls =====
// An async venue method is emitted as a pair: the core (`FetchXAsync`, the trampoline plus its Body)
// and a public wrapper (`FetchX`) that receives the channel result. The core's parameter types come
// from the printer's own proof (ast `goNativeParameterType`: every call site passes the type, the
// body never writes another one, no nil compare, no `??` default); the wrapper's came from the TS
// annotation alone (`jsTypeToGo`), so a parameter whose required TS type is `any`/`Dict`/`Str` was
// printed `any`/`string` in the wrapper and `map[string]any`/`*string` in the core:
//
//	func (this *Bybit) FetchOptionMarkets(params any) ([]MarketInterface, error) {
//	    r := <-this.FetchOptionMarketsAsync(params)     // core takes map[string]any
//
// The ast printer reports the decided type on the method record it hands back (`parameters[i].goType`,
// required positional parameters only: an optional or variadic parameter rides the options struct,
// whose field stays `any`, and the call site passes `opts.X` into an `any` slot). The wrapper prints
// that type, so both halves of the pair, and the typed interface record built from the same string,
// carry one signature.

// the printed Go type the core gave this positional parameter, or undefined (annotation only)
export function gp14ParamGoType (param: any): string | undefined {
    const goType = param?.goType;
    // the typed wrapper keeps `[]OrderRequest` (it converts to the core's []any); only the core is retyped
    if ((goType === '[]any') && /OrderRequest\[\]$/.test (String (param?.type ?? ''))) { return undefined; }
    return ((typeof goType === 'string') && (goType.length > 0)) ? goType : undefined;
}

// ---- self-test: the record field is the only input, and an absent one keeps the annotation --------
export function gp14SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10 GP14: ' + message); } };
    ok (gp14ParamGoType ({ 'name': 'params', 'type': 'any', 'goType': 'map[string]any' }) === 'map[string]any', 'the decided type is read off the record');
    ok (gp14ParamGoType ({ 'name': 'code', 'type': 'Str' }) === undefined, 'a record without the field keeps the annotation path');
    ok (gp14ParamGoType ({ 'name': 'code', 'type': 'Str', 'goType': '' }) === undefined, 'an empty field is not a type');
    ok (gp14ParamGoType (undefined) === undefined, 'a missing record answers undefined');
    return problems;
}
