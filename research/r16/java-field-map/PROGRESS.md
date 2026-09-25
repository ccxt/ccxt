# JAVA-FIELD-MAP
Branch typed90-sub-java-field-map (dc6bb4e5d31 + merge 2eead460a71).
## Change
- BaseExchange.java: `urls`, `exceptions` Object -> Map<String, Object>.
  Writers (proof): ctor casts `(Map) safeValue(props,"urls"/"exceptions")`; ts writers are only
  `this.urls = this.omit(this.urls, k)` (base setSandboxMode/enableDemoTrading, binance, bybit enableDemoTrading) -> omit of a Map is a Map;
  no ts/test writer for exceptions; reflection setters (setExchangeProp/cli setProperty) only used for credentials/options/fetchHistoryCacheSize.
- java-local-types.js section 32 patchJavaBaseMapFieldReceiverCasts: `((Map)this.f).get(` -> `this.f.get(` when f is declared
  Map<String, Object> in the hand-written headers (parsed from BaseExchange/Exchange/PredictionExchange.java, ambiguous names dropped)
  and every TS declaration of f is a PropertyDeclaration in ts/src/base (subclass shadow -> keep cast).
- javaOmitSourceIsMap accepts such a field, so `newUrls = this.omit(this.urls, ..)` is typed Map (needed for `this.urls = newUrls`).
- Kept Object: fees (binance `(this.fees as Dict)`; fees shape varies), balance, markets, currencies, timeframes, precision, limits: not in scope / few casts.
## Replay (probe.mts): this.* casts binance 18->3, bybit 13->0, okx 4->0, pro/kucoin 6->4; all cast-only diffs.
