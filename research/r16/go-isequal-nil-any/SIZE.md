# GO-ISEQUAL-NIL-ANY size (checked-in go/v4 at 7f231e56209 = cf978ef7994 = 6cbceb9803e Go output)
size.py HEAD: IsEqual( 3956 (per-exchange + pro + prediction + exchange_generated); IsEqual(ident, nil) by declaration:
local any 1233 | param any 408 | other/undeclared 187 | local []string 150 | local map[string]any 68 | local []any 27
Offline replay (replay.ts, all generated files incl. exchange_generated.go): IsEqual( 4333 -> 4036 (-297), 93 files.
diffcheck.py: converted 297, anomalies 0 (every changed line = IsEqual(x,nil)->(x == nil) / !IsEqual->(x != nil)).
Write sources of converted locals (audit.py): SafeDict 126, DerefScalar(Safe*scalar) 75, SafeList 46, nil 33, Add 18, ...
Residual any-local rejects: SafeValue 342, func( IIFE 133, GetValue 71, DerefScalar of any 186-75, ArrayCache NewX (ws), unknown calls.

## Typed []string / map / []any IsEqual(x, nil) (measure only, no change)
Current runtime derefScalar ALREADY folds typed-nil map[string]any / []any / []string to nil
(exchange_helpers.go derefScalar `case map[string]any / []any / []string: if p == nil return nil`),
so IsEqual(typedNil, nil) == true == native `x == nil`: the latent nil-box bug the brief feared is NOT present.
Sites: []string 150 (MarketSymbols 145, this.Symbols 5), map 68 (SafeMapTyped 37, nil+writes 28, MapTyped 3),
[]any 27 (SafeListTyped 22, SafeListTypedDefault 5). All could print native with identical semantics
(goTypedNativeNilCompares already does map/[]any when single-declared; []string left out of GO_NIL_COMPARABLE_TYPES).
