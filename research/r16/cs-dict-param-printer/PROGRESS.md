# CS-DICT-PARAM-PRINTER
base 8391de343c9, merged cf978ef7994 and 71554d5011c.
ROOT CAUSE: csharpParameterCallSitesProve compared `site.declarations` (MethodDeclarations) with the
ParameterDeclaration -> no site ever resolved; any method with >=1 call site failed the final
`resolved >= occurrences` check. Only uncalled methods were ever typed.
FIX (build/csharp-local-types.js D-17 section): match sites against the owner method; since that
widens the rule, admit only Dict targets through call sites (other aliases keep previous result), and
reject a name also declared in base tier or an importing/imported module (override/base guard).
Async admitted for Dict (paradex signOrderRequest still object: caller `let request = createOrderRequest(..)` untyped).
Single-file probes (probe.mts): new IDictionary params kraken orderRequestWs request, myriad/polymarket
signClobOrder message, bitfinex parseCurrencies/CurrencyCustom indexed+indexedNetworks, grvt
eipMessageForOrder order, createSignedRequest request; myriad also signCancelAll/signOrderbookTypedData/orderToTrade.
calculateRateLimiterCost config: not changed (base untyped + 8 overrides, fetch2 object caller).
