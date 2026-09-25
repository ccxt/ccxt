# CS-GETVALUE-PARAM-DICT
base 7dac08e0706. Census tree = git archive cs examples/cs (scratch gvpd/tree).
## Step 1 (build-only): PARSE_MARKET_PARAM_DICTS += 15 names
U51 market-census4 + admission-verdict on the 7dac tree: 15/40 remaining `object market` names ADMIT
(fromEp/Er/Ev, getOutcomeBySlugAndLabel, outcomeForToken, parseContractTicker, parseContractTrade,
parseDustTrade, parseMyUtaTrade, parseOHLCV (80 decls), parseSpotOrUtaTrade, parseTrade (95 decls),
parseTrades, parseTradesHelper, resolveMarketByAltnameOrId); 0 body writes, 0 override renames.
REJECT (kept object): parseTicker (hyperliquid FetchTickers passes object getValue(response,i) local),
parseWs{Trade,Ticker,OHLCV} (pro/bitrue findSwapMarketByWsBaseQuote object local), parseMarket (getValue(markets,i),
alpaca rename), parsePrediction* (outcomeObj rename / ((object)x) casts), safe{Market,Order,Symbol,Ticker,Trade}
(object marketResolved locals), parseOHLCVs/parseTradeQuote/parseTradeTx (myriad/kalshi ((object)outcomeObj)).
## Step 2 candidates (ts/src `Dict` already; D-17 csharpParameterDecision still prints object) - measure only
kraken orderRequestWs request, myriad/polymarket signClobOrder message, paradex signOrderRequest (async: D-17 excludes async),
bitfinex parseCurrenciesCustom/parseCurrencyCustom indexed, grvt eipMessageForOrder order (caller passes `request: any` of createSignedRequest).
grvt createSignedRequest `request: any` -> Dict is OPTION 3 (callers: 4x Dictionary request + orderRequest Dictionary).
calculateRateLimiterCost config: base `config = {}` + 8 overrides `config: any = {}` -> needs base+overrides+PHP check.
handleDelta bookside/orderbook: measure only (36 reads; declared object in base void handleDelta(object bookside, object delta)).
