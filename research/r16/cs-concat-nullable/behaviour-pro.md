# cs-concat-nullable — ts/src/pro sites (base 49447fc25f5)

In every `return;` row below, the old code resolved a hash containing `undefined` (for example `undefined:BTC/USDT`). No watcher subscribes to such a hash, so returning early only drops a resolve that could never match anything.

file:line (TS, pre-edit) | local | class | before | after | behaviour change
---|---|---|---|---|---
aster.ts:654 | marketId | a | `undefined@aggTrade` subscription arg | `continue` | market without an id is skipped from the subscribe args
bitfinex.ts:254 (C#271,274) | channel, interval | b | hash `undefined:…` | `return` | unroutable candle update dropped
bitfinex.ts:434 | channel | b | hash `undefined:…` | `return` | unroutable trade dropped
bitopro.ts:120,181,400 | event | b | hash `undefined:SYM` | `return` | unroutable frame dropped
bitopro.ts:273 | messageHash | b | resolve `undefined` + `undefined:SYM` | `return` | none reachable (the event routed the message here)
bitvavo.ts:180 | event | b | resolves `undefined@id`/`undefined` | `return` before the ticker loop | tickers are no longer cached when the frame has no event (unreachable: dispatch is keyed by event)
bitvavo.ts:796 | event | b | hash `undefined@id` | `return` | none reachable
blofin.ts:140,227,306,589,642 | channelName | b | hash `undefined:SYM` | `return` after arg read | trades/tickers/orders/positions not cached when arg.channel is missing (dispatch is keyed by channel)
coinbase.ts:462 | channel | b | hash `undefined::SYM` | `return` | none reachable (dispatch is keyed by channel)
coinbaseinternational.ts:302,413,520,589,711,786 | channel/messageHash | b | resolve `undefined::SYM` | `return` (`return message` in handleTrade) | the plain-channel resolve is also skipped; unreachable because dispatch is keyed by channel
deribit.ts:653 | group | b | descriptor `undefined.d.i` | `return` | none: a 5-part channel always has part 2
derive.ts:609,698 | topic | b | hash `undefined:SYM` | `return` | none reachable (dispatch is keyed by channel)
extended.ts:822 | timeframe | b | cacheKey `undefined:type` | `return` | a subscription without a timeframe no longer creates an `undefined` cache
gate.ts:1533 | symbol | a | cache key `undefinedlong` | `continue` | a side-less position without a symbol is skipped
hitbtc.ts:979 | messageHash | b | resolve `undefined::SYM` | `return` | none: split()[0] always exists
hollaex.ts:123,184,270,399 | channel | b | hash `undefined:id` | `return` | none reachable (dispatch is keyed by topic)
htx.ts:915 (C#1011) | orderMessageHash | b | hash `undefined:trade` | the assignment now runs only when orderMessageHash is defined | none: the helper always returns a defined hash
htx.ts:1300 (C#1363) | messageHash | b | `messageHash === 'orders'` check | extra `messageHash !== undefined` conjunct | none
hyperliquid.ts:1126 | topic | b | hash `undefined::balance` | `return` | none reachable
kraken.ts:1050 | integer | c | `safeString (parts, 0)` | `safeString (parts, 0, '')` | none: split()[0] always exists (not a fallback that hides a missing value)
kucoin.ts:156 (C#142) | endpoint | b | url `undefined?token…` | `throw ExchangeError` inside the existing try, which rejects the url future | a bad bullet response now fails through the existing reject path instead of opening a bogus url
okx.ts:347,635,2115,2228 | channel | b | hash `undefined:…` | `return` | none reachable (dispatch is keyed by channel)
okx.ts:1558 (C#1713) | channel | b | hash `undefined:SYM` | `return message` | none reachable
p2b.ts:296,406 | channel/messageHashStart | b | hash `undefined::SYM` | `return message` | none: split()[0] always exists
paradex.ts:440,546 | channel | b | hash `undefined.SYM` | `return` | the plain-channel resolve is also skipped; unreachable
poloniex.ts:637 | channel | b | hash `undefined::SYM` | `return message` | none reachable (dispatch is keyed by channel)
xt.ts:744,911,1078,1134 | event | b | hash `undefined::…` | `return message` | none reachable (handleMessage only dispatches when event is defined)

## Left (4)
- bullish.ts:98 wsUrl (C#101): the code already has `if (wsUrl === undefined) throw` immediately before the concat. The TS side is already correct, so this is a generator-side proof gap and needs no TS change.
- kucoin.ts:2643 uniformType (C#2928): `safeString (accountsByType, type, type)`. Here `type` is proven non-null only through the options/params default chain, and there is no existing error to raise, so an added guard would invent a throw.
- xt.ts:328 / 351 method (C#364, 390): `safeString (params, 'method', defaultMethod)`, where `defaultMethod` defaults to 'ticker'. The default is non-null in practice, but the generator does not prove it through the nested default. A guard would only add dead code.
