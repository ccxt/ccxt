# CS-INOP-NATIVE (base 2eead460a71)
- Pass: build/csharpTranspiler.ts nativeDeclaredHelperCalls inOp arm gains `csharpInOpReceiverType`: hand-written base
  dict fields (orderbooks, markets_by_id, timeframes, has, options, clients, markets, currencies_by_id) and
  `client.subscriptions|futures` (client = WebSocketClient param never rebound, or single `var client = this.client(..)`).
  Emission `(recv != null [&& key != null] && recv.ContainsKey(key))`; key must be literal / `string` / `string?` (guarded).
  ContainsKey on the non-generic-IDictionary branch (futures/clients) = helper's ConvertToDictionaryOfStringObject path.
- OPTION 3: Exchange.Options.cs `markets` / `currencies_by_id` object -> IDictionary<string, object>. Writers audited:
  null, mapToSafeMap (IDictionary), `as dict`, createSafeDictionary, indexBySafe (Dictionary), sourceExchange.<same field>,
  OrderRouterTest StubMarket() (dict). No reflection SetValue on these names.
- Replay (research/.../replay.mts on committed output): before.txt -> after-replay.txt (482 -> 305 incl. base files).
