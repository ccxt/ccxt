# WS-CACHE-FIELDS (C# + Go)
- base a6586c19b56, merged PR head c5c1856bd04.
- C#: Exchange.Options.cs balance/tickers/fundingRates/bidsasks/trades/orderbooks/ohlcvs -> `IDictionary<string, object>` field, still initialised with CustomConcurrentDictionary (concurrency kept; every writer stores createSafeDictionary/Dictionary).
- C# build: csharp-local-types CSHARP_DICT_WRITE_MEMBER_TYPES += those fields except orderbooks (drops `((IDictionary<string,object>)this.x)[k] = v` casts);
  csharpTranspiler nativeDeclaredHelperCalls: getValue/inOp on this.<field> (not orderbooks/positions) -> `(this.f != null [&& key != null] && this.f.ContainsKey(k) ? this.f[k] : null)`; only string / string? keys (same null semantics as GetValue/InOp).
- Go: Ohlcvs, FundingRates `any` -> `*sync.Map` (all writers store &sync.Map / CreateSafeDictionary). Balance (map[string]any writes), Trades (polymarket map literal), Positions stay any. No Go printer change: GetValue on *sync.Map already Load-based; native Load would drop derefScalar -> kept helper (fail closed).
- Probe (offline replay of nativeDeclaredHelperCalls): research/r16/ws-cache-fields/probe.mjs.
