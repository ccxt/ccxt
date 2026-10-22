
<a name="OrderRouter" id="orderrouter"></a>

## OrderRouter{docsify-ignore}
**Kind**: global class  

* [constructor](#constructor)
* [fetchRoute](#fetchroute)
* [fetchHealth](#fetchhealth)
* [fetchReadiness](#fetchreadiness)
* [fetchVersion](#fetchversion)
* [fetchSymbols](#fetchsymbols)
* [fetchExchangesStatus](#fetchexchangesstatus)
* [fetchCachedOrderBook](#fetchcachedorderbook)
* [watchRoute](#watchroute)
* [fetchRouteWithBalances](#fetchroutewithbalances)
* [loadBalances](#loadbalances)
* [invalidateBalances](#invalidatebalances)
* [marketsOf](#marketsof)
* [renderBalances](#renderbalances)
* [buildExecutionPlan](#buildexecutionplan)
* [checkExecutionPlanSafety](#checkexecutionplansafety)
* [reconcileExecutionStep](#reconcileexecutionstep)
* [buildUnwindPlan](#buildunwindplan)
* [execute](#execute)

<a name="OrderRouter" id="orderrouter"></a>

### OrderRouter{docsify-ignore}
a client for the ccxt order-routing service and a multi-venue execution engine for plans you build yourself. NOT an exchange: it does not extend Exchange, has no unified methods, and is constructed directly. The whole pipeline is two calls — fetchRoute, then execute



```javascript
OrderRouter.OrderRouter ()
```


<a name="constructor" id="constructor"></a>

### constructor{docsify-ignore}
creates a client for the CCXT order-router service

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: [<code>OrderRouter</code>](#OrderRouter) - a router client


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| config | <code>object</code> | Yes | client configuration |
| config.apiKey | <code>string</code> | No | optional. The router service is public and rate-limits by IP, so no key is needed; one supplied here is still sent as the x-api-key header, which a keyless server ignores |
| config.baseUrl | <code>string</code> | No | router base url, defaults to https://docs.ccxt.com/router/api |
| config.venues | <code>object</code> | No | exchangeId to a ccxt exchange instance. Routes are filtered to these, and execute sends orders to them |
| config.trackBalances | <code>bool</code> | No | read those venues' wallets and route on what you can actually fund, default false. Off, fetchRoute never touches a venue and stays a single HTTP request |
| config.timeoutMs | <code>int</code> | No | request timeout in milliseconds, defaults to 30000 |
| config.maxNotionalUsd | <code>float</code> | No | optional per-trade USD notional guardrail. Omitted or 0 means NO cap and no notional check at all; any positive value is honoured exactly, never clamped |


```javascript
OrderRouter.constructor (config)
```


<a name="fetchRoute" id="fetchroute"></a>

### fetchRoute{docsify-ignore}
asks the router how to convert one asset into another, over the venues and bridges it has live books for

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - a RouteResult — an unroutable pair comes back as a RouteResult with an unroutableReason, not as an exception

**See**: https://docs.ccxt.com/router/api  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromAsset | <code>string</code> | Yes | the asset being spent, e.g. USDT |
| toAsset | <code>string</code> | Yes | the asset being acquired, e.g. BTC |
| params | <code>object</code> | Yes | request parameters |
| params.amountIn | <code>float</code> | No | exact amount of fromAsset to spend — supply this OR amountOut, never both |
| params.amountOut | <code>float</code> | No | exact amount of toAsset to acquire — supply this OR amountIn, never both |
| params.strategy | <code>string</code> | No | best_single, split_optimal or split_capped |
| params.maxVenues | <code>int</code> | No | per-hop venue cap for split_capped |
| params.exchanges | <code>string</code>, <code>Array&lt;string&gt;</code> | No | venue allowlist |
| params.bridges | <code>string</code>, <code>Array&lt;string&gt;</code> | No | intermediary assets to consider |
| params.balances | <code>string</code> | No | what you hold, as [exchangeId.]ASSET:amount entries |
| params.balanceMode | <code>string</code> | No | cap (default) or require |
| params.includeQuotes | <code>bool</code> | No | return the per-venue diagnostic |
| params.includeFees | <code>bool</code> | No | rank on fee-adjusted price, default true |
| params.certified | <code>bool</code> | No | restrict to CCXT-certified venues |
| params.requireFullFill | <code>bool</code> | No | refuse partial fills |
| params.hopPenaltyBps | <code>float</code> | No | how much better a bridged route must be per extra hop |
| params.minLegNotional | <code>float</code> | No | suppress legs below this quote notional |
| params.requestId | <code>string</code> | No | a caller-chosen audit id, sent as the x-request-id header so your log and the router's decision log can be joined. The service mints one when this is absent, and caps it at 200 characters |
| params.requireBalancesApplied | <code>bool</code> | No | when balances are sent, throw unless the router echoed that it read them. Default true — a server that predates the feature IGNORES balances and answers byte-identically to one that never received any |


```javascript
OrderRouter.fetchRoute (fromAsset, toAsset, params)
```


<a name="fetchHealth" id="fetchhealth"></a>

### fetchHealth{docsify-ignore}
liveness only — answers 200 from the first millisecond of boot, before a single venue has connected. Use fetchReadiness to decide whether the router can actually price anything

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - status and uptimeSec

**See**: https://docs.ccxt.com/router/openapi.yaml  // GET /health  

```javascript
OrderRouter.fetchHealth ()
```


<a name="fetchReadiness" id="fetchreadiness"></a>

### fetchReadiness{docsify-ignore}
whether the router has enough fresh books to rank on, measured with the same staleness cutoff /route uses. NOT_READY IS A NORMAL ANSWER: the service replies 503 with the same body it returns on 200, and this method returns it rather than throwing, because a caller asking "are you ready" needs the counts that say why not

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - status (ready or not_ready), bookCount, freshCount, staleCount, minFreshBooksForReady and staleBookMs

**See**: https://docs.ccxt.com/router/openapi.yaml  // GET /ready  

```javascript
OrderRouter.fetchReadiness ()
```


<a name="fetchVersion" id="fetchversion"></a>

### fetchVersion{docsify-ignore}
build provenance of the running process. This is what a deploy pipeline asserts against — health answers 200 from the OLD process just as happily when a deploy silently no-ops, and commit is the only field that tells the two apart

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - version, commit, commitShort, builtAt, builtBy, startedAt and uptimeSec

**See**: https://docs.ccxt.com/router/openapi.yaml  // GET /version  

```javascript
OrderRouter.fetchVersion ()
```


<a name="fetchSymbols" id="fetchsymbols"></a>

### fetchSymbols{docsify-ignore}
the unified symbols the router currently holds a cached book for. A pair absent from this list cannot be routed no matter how it is spelled

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>Array&lt;string&gt;</code> - the cached symbols

**See**: https://docs.ccxt.com/router/openapi.yaml  // GET /symbols  

```javascript
OrderRouter.fetchSymbols ()
```


<a name="fetchExchangesStatus" id="fetchexchangesstatus"></a>

### fetchExchangesStatus{docsify-ignore}
per-venue connection health. A venue can hold an open socket while its subscription is silently dead, so read the per-venue update age and not only the connected flag

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>Array&lt;object&gt;</code> - one health record per venue

**See**: https://docs.ccxt.com/router/openapi.yaml  // GET /exchanges/status  

```javascript
OrderRouter.fetchExchangesStatus ()
```


<a name="fetchCachedOrderBook" id="fetchcachedorderbook"></a>

### fetchCachedOrderBook{docsify-ignore}
the router's own cached L2 book for one venue and symbol — the exact depth a route was ranked on, which is what makes a surprising route auditable

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - the cached book

**See**: https://docs.ccxt.com/router/openapi.yaml  // GET /orderbook/{exchange}/{symbol}  

| Param | Type | Description |
| --- | --- | --- |
| exchangeId | <code>string</code> | the venue, e.g. binance |
| symbol | <code>string</code> | the unified symbol, e.g. BTC/USDT |


```javascript
OrderRouter.fetchCachedOrderBook (exchangeId, symbol)
```


<a name="watchRoute" id="watchroute"></a>

### watchRoute{docsify-ignore}
the same route as fetchRoute, pushed over a websocket whenever any market it depends on moves. Every leg of every candidate path is watched, so a bridged route does not miss half the price changes that alter its answer. BLOCKS until the stream ends: the hook is how you read it

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - the last route seen, or an empty dict if the stream ended before any frame

**See**: https://docs.ccxt.com/router/openapi.yaml  // GET /stream/route  

| Param | Type | Description |
| --- | --- | --- |
| fromAsset | <code>string</code> | the asset being spent, e.g. USDT |
| toAsset | <code>string</code> | the asset being acquired, e.g. BTC |
| params | <code>object</code> | the same parameters fetchRoute accepts, EXCEPT balances and balanceMode, which this endpoint refuses — a socket outlives the holdings it was opened with |
| onRoute | <code>function</code> | called with each RouteResult as it arrives, stamped with the client-side keys fetchRoute stamps. Return 'stop' to close the socket cleanly and return; any other value keeps watching. It runs between frames, so do no slow work in it — the service pushes up to ten times a second |


```javascript
OrderRouter.watchRoute (fromAsset, toAsset, params, onRoute)
```


<a name="fetchRouteWithBalances" id="fetchroutewithbalances"></a>

### fetchRouteWithBalances{docsify-ignore}
reads the live balances of the supplied venues, sends them to the router, and returns a route you can actually fund

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - the RouteResult, with the client-side keys balancesUsed and balancesDropped added


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromAsset | <code>string</code> | Yes | the asset being spent |
| toAsset | <code>string</code> | Yes | the asset being acquired |
| venues | <code>object</code> | No | a dictionary of exchangeId to a ccxt exchange instance; defaults to the venues the router was constructed with |
| params | <code>object</code> | Yes | the same parameters fetchRoute accepts, minus balances which this method builds |
| params.requireBalancesApplied | <code>bool</code> | No | throw when the router did not echo balancesApplied, default true |


```javascript
OrderRouter.fetchRouteWithBalances (fromAsset, toAsset, venues?, params)
```


<a name="loadBalances" id="loadbalances"></a>

### loadBalances{docsify-ignore}
reads the venues' wallets once and caches the result, so a quote stays a single HTTP request. Called for you by fetchRoute; call it yourself to prime the cache at start-up, or with reload to refresh it

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>string</code> - the rendered balances string, empty when the router holds no venues


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| reload | <code>bool</code> | No | true re-reads the wallets even when they are already cached |


```javascript
OrderRouter.loadBalances (reload?)
```


<a name="invalidateBalances" id="invalidatebalances"></a>

### invalidateBalances{docsify-ignore}
drops the cached balances, so the next quote re-reads the wallets. Called for you after any run that reached a venue

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  


```javascript
OrderRouter.invalidateBalances ()
```


<a name="marketsOf" id="marketsof"></a>

### marketsOf{docsify-ignore}
loads each venue's markets and keys them by exchange id, which is the shape checkExecutionPlanSafety wants. execute does this for you; this is for calling the check yourself

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - exchangeId to that venue's markets


| Param | Type | Description |
| --- | --- | --- |
| venues | <code>object</code> | a dictionary of exchangeId to a ccxt exchange instance |


```javascript
OrderRouter.marketsOf (venues)
```


<a name="renderBalances" id="renderbalances"></a>

### renderBalances{docsify-ignore}
turns whatever a caller wrote for `balances` into the router's wire form. Accepts the rendered string itself, a list of entries, a per-venue wallet ({ mexc: { USDT: 100 } }) and a flat single-venue wallet ({ USDT: 100 })

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>string</code> - the `[exchangeId.]ASSET:amount` string the service reads


| Param | Type | Description |
| --- | --- | --- |
| value | <code>object</code>, <code>string</code> | the holdings, in any accepted shape |


```javascript
OrderRouter.renderBalances (value)
```


<a name="buildExecutionPlan" id="buildexecutionplan"></a>

### buildExecutionPlan{docsify-ignore}
turns a RouteResult into an ordered list of concrete orders. PURE — no I/O

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - an execution plan


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| route | <code>object</code> | Yes | a RouteResult, ideally one fetchRoute returned so the request can be checked against the answer |
| options | <code>object</code> | No | plan options |
| options.slippageBps | <code>float</code> | No | how far the limit sits from the expected price, default 25 |
| options.reconcileToleranceRatio | <code>float</code> | No | the shortfall ratio reconcileExecutionStep halts on, default 0.02 |


```javascript
OrderRouter.buildExecutionPlan (route, options?)
```


<a name="checkExecutionPlanSafety" id="checkexecutionplansafety"></a>

### checkExecutionPlanSafety{docsify-ignore}
checks a plan against per-venue market rules and the hard per-trade USD notional cap. PURE — no I/O. A step that cannot be valued in USD BLOCKS; it is never skipped, because a cap that silently disappears when a rate is missing is not a cap

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>Array&lt;object&gt;</code> - the violations, each with stepIndex, code, blocking, actual, limit and a constant message. An empty array means the plan passed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| plan | <code>object</code> | Yes | a plan from buildExecutionPlan |
| markets | <code>object</code> | Yes | a dictionary of exchangeId to that exchange's markets dictionary, i.e. markets[exchangeId][symbol] |
| options | <code>object</code> | No | check options |
| options.usdRates | <code>object</code> | No | a dictionary of currency code to its USD price. USD itself is 1 implicitly; nothing else is assumed |
| options.maxNotionalUsd | <code>float</code> | No | per-trade cap for this call, overriding the client's own in either direction. Omitted falls back to the client's; 0 or absent on both means no cap and no notional check |
| options.precisionMode | <code>string</code> | No | tick_size (default) or decimal_places, matching the venue's precisionMode |


```javascript
OrderRouter.checkExecutionPlanSafety (plan, markets, options?)
```


<a name="reconcileExecutionStep" id="reconcileexecutionstep"></a>

### reconcileExecutionStep{docsify-ignore}
compares what a step actually produced against what the route predicted, resizes every downstream hop, and returns the proceed-or-halt verdict. PURE — no I/O. The halt decision lives here rather than in the execution loop because it is a money decision, and six separate loops is six chances to omit it

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - the verdict, with expectedOut, realisedOut, shortfall, shortfallRatio, scale, verdict, reason and resizedSteps


| Param | Type | Description |
| --- | --- | --- |
| plan | <code>object</code> | the plan, with any earlier resizes already applied to its steps |
| stepIndex | <code>int</code> | the step that just completed |
| realisedOut | <code>float</code> | what it actually produced, in that step's output asset — base for a buy, quote for a sell |


```javascript
OrderRouter.reconcileExecutionStep (plan, stepIndex, realisedOut)
```


<a name="buildUnwindPlan" id="buildunwindplan"></a>

### buildUnwindPlan{docsify-ignore}
given a halted execution report, computes the reverse orders that sell each stranded residual back toward the original from-asset, on the venue that actually holds it. PURE — no I/O. NEVER automatic: the result carries requiresConfirmation and nothing in this class executes it

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - the unwind plan, with steps[] in reverse execution order and unresolved[] for residuals that cannot be reversed


| Param | Type | Description |
| --- | --- | --- |
| report | <code>object</code> | an execution report from execute |


```javascript
OrderRouter.buildUnwindPlan (report)
```


<a name="execute" id="execute"></a>

### execute{docsify-ignore}
executes a plan against live exchange instances. THE ONLY IMPURE METHOD, and IT PLACES ORDERS: calling it is the instruction, there is no permission flag beside it. Pass options.dryRun true to rehearse instead, which makes not one call against a venue

**Kind**: instance method of [<code>OrderRouter</code>](#OrderRouter)  
**Returns**: <code>object</code> - an execution report with per-step results, openOrders, errors and the halt verdict


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| plan | <code>object</code> | Yes | a RouteResult from fetchRoute, a plan from buildExecutionPlan, or a caller-assembled plan of the same shape — this method never assumes it came from the routing service. A route is turned into a plan here, so the simple path is fetchRoute then execute; build the plan yourself when you want to inspect or change it first |
| venues | <code>object</code> | Yes | a dictionary of exchangeId to a ccxt exchange instance |
| options | <code>object</code> | No | execution options |
| options.strategy | <code>string</code> | No | HOW the orders go out: sequential (the default), parallel_within_hop, limit_protected, best_effort or atomic_ish. Whether they go out at all is options.dryRun |
| options.slippageBps | <code>float</code> | No | only when a route is passed: how far the limit sits from the expected price, default 25 |
| options.reconcileToleranceRatio | <code>float</code> | No | only when a route is passed: the shortfall ratio reconcileExecutionStep halts on, default 0.02 |
| options.dryRun | <code>bool</code> | No | exactly true rehearses: the plan is built, checked and reported on, and not one call is made against a venue. Anything else, including absent, PLACES ORDERS |
| options.usdRates | <code>object</code> | No | currency code to USD price, required when live because the notional cap cannot be enforced without it |
| options.allowMarketOrders | <code>bool</code> | No | permit a market order when the venue cannot do IOC, default false |
| options.maxOrders | <code>int</code> | No | hard order-count cap, required by best_effort |
| options.acknowledgeDispersion | <code>bool</code> | No | required by best_effort, which can leave you holding an unintended asset mix |
| options.orderTimeoutMs | <code>int</code> | No | how long limit_protected leaves an order resting, default 20000 |
| options.pollIntervalMs | <code>int</code> | No | how often limit_protected checks a resting order, default 1000 |
| options.orderParams | <code>object</code> | No | extra params merged into every createOrder call |
| options.idempotencyKey | <code>string</code> | No | the identity of this execution, required when the plan carries no requestId; it keys the re-execution guard, and OVERRIDES the plan's requestId when both are given |
| options.allowReexecution | <code>bool</code> | No | must be exactly true to run a plan this instance has already executed live; the DEFAULT is refusal |
| options.retryFailedSteps | <code>int</code> | No | how many times to re-place a step the venue DEFINITIVELY REJECTED, default 0. An outcome_unknown step is never retried at any setting: it may already be a live position, and re-placing it is the double-fill this class exists to prevent. The router sets no client order id, so a retry is a fresh order to the venue |
| options.retryDelayMs | <code>int</code> | No | how long to wait before a retry, default 1000 |
| options.onStep | <code>function</code> | No | called after each step completes and reconciles, never mid-order, with one event object describing that step. Return 'halt' to stop the route cleanly (haltReason becomes halted_by_on_step); any other value continues. It can only STOP a route, never resume one already halted. Do NO network I/O here — it sits between orders on the money path. A hook that throws is recorded as on_step_hook_failed and the run continues, because losing the report would destroy the only account of orders that are already live |


```javascript
OrderRouter.execute (plan, venues, options?)
```

