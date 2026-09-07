import { Dict } from './types.js';
declare class OrderRouter {
    static DEFAULT_BASE_URL: string;
    static DEFAULT_TIMEOUT_MS: number;
    static DEFAULT_SLIPPAGE_BPS: number;
    static DEFAULT_RECONCILE_TOLERANCE: number;
    static DEFAULT_RETRY_DELAY_MS: number;
    static NO_CAP: number;
    static MAX_BALANCE_ENTRIES: number;
    static MAX_BALANCE_CHARS: number;
    static MAX_EXECUTED_PLAN_IDS: number;
    static TOLERANCE: number;
    apiKey: string;
    baseUrl: string;
    timeoutMs: number;
    maxNotionalUsd: number;
    executedPlanIds: string[];
    executedPlanIdSet: Dict;
    /**
     * @method
     * @name OrderRouter#constructor
     * @description creates a client for the CCXT order-router service
     * @param {object} config client configuration
     * @param {string} config.apiKey the router API key, sent as the x-api-key header (required)
     * @param {string} [config.baseUrl] router base url, defaults to https://docs.ccxt.com/router/api
     * @param {int} [config.timeoutMs] request timeout in milliseconds, defaults to 30000
     * @param {float} [config.maxNotionalUsd] optional per-trade USD notional guardrail. Omitted or 0 means NO cap and no notional check at all; any positive value is honoured exactly, never clamped
     * @returns {OrderRouter} a router client
     */
    constructor(config?: Dict);
    /**
     * @ignore
     * @method
     * @name OrderRouter#numberAt
     * @description reads a numeric field out of a container, with a default for missing, null and unparseable values
     * @param {object} container the dictionary to read from
     * @param {string} key the field name
     * @param {float} defaultValue value returned when the field is absent or not a number
     * @returns {float} the number
     */
    numberAt(container: any, key: string, defaultValue: number): number;
    /**
     * @ignore
     * @method
     * @name OrderRouter#isFiniteNumber
     * @description reports whether a double is a real number, i.e. neither NaN nor an infinity
     * @param {float} value the number to test
     * @returns {bool} true when the value is finite
     */
    isFiniteNumber(value: number): boolean;
    /**
     * @ignore
     * @method
     * @name OrderRouter#parseNumber
     * @description reads the leading numeric prefix of a string, exactly as JavaScript's parseFloat does, and returns the default when there is not one or when the result is not finite
     * @param {string} text the text to read
     * @param {float} defaultValue value returned when the text does not start with a number
     * @returns {float} the number
     */
    parseNumber(text: string, defaultValue: number): number;
    /**
     * @ignore
     * @method
     * @name OrderRouter#isRouterSpace
     * @description reports whether a character is one of the six ASCII spaces the number grammar skips
     * @param {string} character a single character
     * @returns {bool} true for space, tab, newline, carriage return, form feed and vertical tab
     */
    isRouterSpace(character: string): boolean;
    /**
     * @ignore
     * @method
     * @name OrderRouter#stringAt
     * @description reads a string field out of a container, with a default for missing and null values
     * @param {object} container the dictionary to read from
     * @param {string} key the field name
     * @param {string} defaultValue value returned when the field is absent
     * @returns {string} the string
     */
    stringAt(container: any, key: string, defaultValue: string): string;
    /**
     * @ignore
     * @method
     * @name OrderRouter#boolAt
     * @description reads a boolean field out of a container, with a default for missing and null values
     * @param {object} container the dictionary to read from
     * @param {string} key the field name
     * @param {bool} defaultValue value returned when the field is absent
     * @returns {bool} the boolean
     */
    boolAt(container: any, key: string, defaultValue: boolean): boolean;
    /**
     * @ignore
     * @method
     * @name OrderRouter#listAt
     * @description reads an array field out of a container, returning an empty array when absent
     * @param {object} container the dictionary to read from
     * @param {string} key the field name
     * @returns {object[]} the array, never undefined
     */
    listAt(container: any, key: string): any[];
    /**
     * @ignore
     * @method
     * @name OrderRouter#dictAt
     * @description reads a nested dictionary out of a container, returning an empty dictionary when absent
     * @param {object} container the dictionary to read from
     * @param {string} key the field name
     * @returns {object} the dictionary, never undefined
     */
    dictAt(container: any, key: string): Dict;
    /**
     * @ignore
     * @method
     * @name OrderRouter#formatNumber
     * @description formats a double as decimal text with no exponent, so that six languages produce the same string
     * @param {float} value the number to format
     * @returns {string} the number as fixed-point text with trailing zeros removed
     */
    formatNumber(value: number): string;
    /**
     * @method
     * @name OrderRouter#fetchRoute
     * @description asks the router how to convert one asset into another, over the venues and bridges it has live books for
     * @see https://docs.ccxt.com/router/api
     * @param {string} fromAsset the asset being spent, e.g. USDT
     * @param {string} toAsset the asset being acquired, e.g. BTC
     * @param {object} params request parameters
     * @param {float} [params.amountIn] exact amount of fromAsset to spend — supply this OR amountOut, never both
     * @param {float} [params.amountOut] exact amount of toAsset to acquire — supply this OR amountIn, never both
     * @param {string} [params.strategy] best_single, split_optimal or split_capped
     * @param {int} [params.maxVenues] per-hop venue cap for split_capped
     * @param {string|string[]} [params.exchanges] venue allowlist
     * @param {string|string[]} [params.bridges] intermediary assets to consider
     * @param {string} [params.balances] what you hold, as [exchangeId.]ASSET:amount entries
     * @param {string} [params.balanceMode] cap (default) or require
     * @param {bool} [params.includeQuotes] return the per-venue diagnostic
     * @param {bool} [params.includeFees] rank on fee-adjusted price, default true
     * @param {bool} [params.certified] restrict to CCXT-certified venues
     * @param {bool} [params.requireFullFill] refuse partial fills
     * @param {float} [params.hopPenaltyBps] how much better a bridged route must be per extra hop
     * @param {float} [params.minLegNotional] suppress legs below this quote notional
     * @returns {object} a RouteResult — an unroutable pair comes back as a RouteResult with an unroutableReason, not as an exception
     */
    fetchRoute(fromAsset: string, toAsset: string, params?: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#request
     * @description performs the authenticated GET and maps router status codes onto CCXT exceptions
     * @param {string} url the fully-formed url including the query string
     * @returns {object} the decoded JSON body
     */
    request(url: string): Promise<Dict>;
    /**
     * @method
     * @name OrderRouter#fetchRouteWithBalances
     * @description reads the live balances of the supplied venues, sends them to the router, and returns a route you can actually fund
     * @param {string} fromAsset the asset being spent
     * @param {string} toAsset the asset being acquired
     * @param {object} venues a dictionary of exchangeId to a ccxt exchange instance
     * @param {object} params the same parameters fetchRoute accepts, minus balances which this method builds
     * @param {bool} [params.requireBalancesApplied] throw when the router did not echo balancesApplied, default true
     * @returns {object} the RouteResult, with the client-side keys balancesUsed and balancesDropped added
     */
    fetchRouteWithBalances(fromAsset: string, toAsset: string, venues: Dict, params?: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#joinBalances
     * @description renders balance entries as the router's [exchangeId.]ASSET:amount comma-separated form
     * @param {object[]} entries the entries to render
     * @returns {string} the balances query value
     */
    joinBalances(entries: any[]): string;
    /**
     * @ignore
     * @method
     * @name OrderRouter#assertRouteChainIsCoherent
     * @description refuses a route whose hops do not connect, or that does not run from the asset the caller offered to the asset the caller wanted
     * @param {object} route the RouteResult being planned, carrying the client's own clientRequestedFrom/clientRequestedTo stamp
     * @param {object[]} hops the route's hops, in order
     * @returns {undefined} nothing; it throws ExchangeError when the chain does not hold
     */
    assertRouteChainIsCoherent(route: Dict, hops: Dict[]): void;
    /**
     * @method
     * @name OrderRouter#buildExecutionPlan
     * @description turns a RouteResult into an ordered list of concrete orders. PURE — no I/O
     * @param {object} route a RouteResult, ideally one fetchRoute returned so the request can be checked against the answer
     * @param {object} [options] plan options
     * @param {float} [options.slippageBps] how far the limit sits from the expected price, default 25
     * @param {float} [options.reconcileToleranceRatio] the shortfall ratio reconcileExecutionStep halts on, default 0.02
     * @returns {object} an execution plan
     */
    buildExecutionPlan(route: Dict, options?: Dict): Dict;
    /**
     * @method
     * @name OrderRouter#checkExecutionPlanSafety
     * @description checks a plan against per-venue market rules and the hard per-trade USD notional cap. PURE — no I/O. A step that cannot be valued in USD BLOCKS; it is never skipped, because a cap that silently disappears when a rate is missing is not a cap
     * @param {object} plan a plan from buildExecutionPlan
     * @param {object} markets a dictionary of exchangeId to that exchange's markets dictionary, i.e. markets[exchangeId][symbol]
     * @param {object} [options] check options
     * @param {object} [options.usdRates] a dictionary of currency code to its USD price. USD itself is 1 implicitly; nothing else is assumed
     * @param {float} [options.maxNotionalUsd] per-trade cap for this call, overriding the client's own in either direction. Omitted falls back to the client's; 0 or absent on both means no cap and no notional check
     * @param {string} [options.precisionMode] tick_size (default) or decimal_places, matching the venue's precisionMode
     * @returns {object[]} the violations, each with stepIndex, code, blocking, actual, limit and a constant message. An empty array means the plan passed
     */
    checkExecutionPlanSafety(plan: Dict, markets: Dict, options?: Dict): Dict[];
    /**
     * @ignore
     * @method
     * @name OrderRouter#violation
     * @description builds one safety violation record
     * @param {int} stepIndex the offending step, or -1 for a plan-level finding
     * @param {string} exchangeId the venue
     * @param {string} symbol the market
     * @param {string} code the violation code
     * @param {bool} blocking whether the violation forbids execution
     * @param {float} actual the observed value
     * @param {float} limit the value it was measured against
     * @returns {object} the violation
     */
    violation(stepIndex: number, exchangeId: string, symbol: string, code: string, blocking: boolean, actual: number, limit: number): Dict;
    /**
     * @ignore
     * @method
     * @name OrderRouter#notionalUsd
     * @description values a step's quote-currency notional in USD, returning 0 when it cannot be valued
     * @param {object} step the plan step, used for its base and quote currencies
     * @param {float} notionalQuote the notional in the market's quote currency
     * @param {object} usdRates a dictionary of currency code to USD price
     * @returns {float} the USD value, or 0 when no rate covers either side of the market
     */
    notionalUsd(step: Dict, notionalQuote: number, usdRates: Dict): number;
    /**
     * @ignore
     * @method
     * @name OrderRouter#usdRateFor
     * @description resolves the USD price of a currency, treating USD itself as 1 and assuming nothing about anything else
     * @param {string} code the currency code
     * @param {object} usdRates a dictionary of currency code to USD price
     * @returns {float} the rate, or 0 when unknown
     */
    usdRateFor(code: string, usdRates: Dict): number;
    /**
     * @ignore
     * @method
     * @name OrderRouter#precisionViolated
     * @description reports whether a value fails to sit on a market's precision grid
     * @param {float} value the amount or price
     * @param {float} precision the market precision, a tick size or a decimal-place count
     * @param {string} mode tick_size or decimal_places
     * @returns {bool} true when the value would have to be rounded before it could be sent
     */
    precisionViolated(value: number, precision: number, mode: string): boolean;
    /**
     * @method
     * @name OrderRouter#reconcileExecutionStep
     * @description compares what a step actually produced against what the route predicted, resizes every downstream hop, and returns the proceed-or-halt verdict. PURE — no I/O. The halt decision lives here rather than in the execution loop because it is a money decision, and six separate loops is six chances to omit it
     * @param {object} plan the plan, with any earlier resizes already applied to its steps
     * @param {int} stepIndex the step that just completed
     * @param {float} realisedOut what it actually produced, in that step's output asset — base for a buy, quote for a sell
     * @returns {object} the verdict, with expectedOut, realisedOut, shortfall, shortfallRatio, scale, verdict, reason and resizedSteps
     */
    reconcileExecutionStep(plan: Dict, stepIndex: number, realisedOut: number): Dict;
    /**
     * @ignore
     * @method
     * @name OrderRouter#stepExpectedOut
     * @description how much of its output asset a step is expected to produce, gross of fees
     * @param {object} step the plan step
     * @returns {float} base units for a buy, quote units for a sell
     */
    stepExpectedOut(step: Dict): number;
    /**
     * @method
     * @name OrderRouter#buildUnwindPlan
     * @description given a halted execution report, computes the reverse orders that sell each stranded residual back toward the original from-asset, on the venue that actually holds it. PURE — no I/O. NEVER automatic: the result carries requiresConfirmation and nothing in this class executes it
     * @param {object} report an execution report from execute
     * @returns {object} the unwind plan, with steps[] in reverse execution order and unresolved[] for residuals that cannot be reversed
     */
    buildUnwindPlan(report: Dict): Dict;
    /**
     * @ignore
     * @method
     * @name OrderRouter#addPosition
     * @description accumulates a signed amount into the (exchangeId, asset) position list, appending in first-seen order
     * @param {object[]} positions the accumulator
     * @param {string} exchangeId the venue
     * @param {string} asset the currency
     * @param {float} amount the signed amount, positive for produced and negative for consumed
     * @param {object} source the step result this amount came from
     * @param {bool} produced true when this step PRODUCED the asset, which is the only kind of step an unwind can reverse
     * @returns {undefined}
     */
    addPosition(positions: Dict[], exchangeId: string, asset: string, amount: number, source: Dict, produced: boolean): void;
    /**
     * @ignore
     * @method
     * @name OrderRouter#planIdentity
     * @description the stable identity of an execution, used for the re-execution guard. options.idempotencyKey wins, then the plan's own requestId; nothing is ever invented, because a random identity defeats the point of the guard
     * @param {object} plan the plan
     * @param {object} options the execute options
     * @returns {string} the identity, or '' when neither source carries one
     */
    planIdentity(plan: Dict, options: Dict): string;
    /**
     * @ignore
     * @method
     * @name OrderRouter#hasExecutedPlan
     * @description reports whether this instance has executed the given plan id recently enough for the bounded ledger to still remember it
     * @param {string} planId the plan identity from planIdentity
     * @returns {bool} true when the id is still in the ledger
     */
    hasExecutedPlan(planId: string): boolean;
    /**
     * @ignore
     * @method
     * @name OrderRouter#recordExecutedPlan
     * @description records one plan id in the bounded ledger, evicting the oldest entry when the cap is reached
     * @param {string} planId the plan identity from planIdentity
     * @returns {undefined}
     */
    recordExecutedPlan(planId: string): void;
    /**
     * @method
     * @name OrderRouter#execute
     * @description executes a plan against live exchange instances. THE ONLY IMPURE METHOD. dry_run is the default and options.live !== true forces dry_run regardless of the strategy requested, so a call that looks live but forgot the flag places nothing
     * @param {object} plan a plan from buildExecutionPlan, or a caller-assembled plan of the same shape — this method never assumes the plan came from the routing service
     * @param {object} venues a dictionary of exchangeId to a ccxt exchange instance
     * @param {object} [options] execution options
     * @param {string} [options.strategy] dry_run, sequential, parallel_within_hop, limit_protected, best_effort or atomic_ish
     * @param {bool} [options.live] must be exactly true for any order to be placed
     * @param {object} [options.usdRates] currency code to USD price, required when live because the notional cap cannot be enforced without it
     * @param {bool} [options.allowMarketOrders] permit a market order when the venue cannot do IOC, default false
     * @param {int} [options.maxOrders] hard order-count cap, required by best_effort
     * @param {bool} [options.acknowledgeDispersion] required by best_effort, which can leave you holding an unintended asset mix
     * @param {int} [options.orderTimeoutMs] how long limit_protected leaves an order resting, default 20000
     * @param {int} [options.pollIntervalMs] how often limit_protected checks a resting order, default 1000
     * @param {object} [options.orderParams] extra params merged into every createOrder call
     * @param {string} [options.idempotencyKey] the identity of this execution, required when the plan carries no requestId; it keys the re-execution guard, and OVERRIDES the plan's requestId when both are given
     * @param {bool} [options.allowReexecution] must be exactly true to run a plan this instance has already executed live; the DEFAULT is refusal
     * @param {int} [options.retryFailedSteps] how many times to re-place a step the venue DEFINITIVELY REJECTED, default 0. An outcome_unknown step is never retried at any setting: it may already be a live position, and re-placing it is the double-fill this class exists to prevent. Each retry carries its own client order id
     * @param {int} [options.retryDelayMs] how long to wait before a retry, default 1000
     * @param {function} [options.onStep] called after each step completes and reconciles, never mid-order, with one event object describing that step. Return 'halt' to stop the route cleanly (haltReason becomes halted_by_on_step); any other value continues. It can only STOP a route, never resume one already halted. Do NO network I/O here — it sits between orders on the money path. A hook that throws is recorded as on_step_hook_failed and the run continues, because losing the report would destroy the only account of orders that are already live
     * @returns {object} an execution report with per-step results, openOrders, errors and the halt verdict
     */
    execute(plan: Dict, venues: Dict, options?: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#hopCountOf
     * @description counts the distinct hops a step list spans, which is the only authority on whether a plan is multi-hop
     * @param {object[]} steps the working steps
     * @returns {int} the number of distinct hopIndex values
     */
    hopCountOf(steps: Dict[]): number;
    /**
     * @ignore
     * @method
     * @name OrderRouter#cloneSteps
     * @description copies a plan's steps so that execution-time resizing never mutates the caller's plan
     * @param {object} plan the plan
     * @returns {object[]} a fresh array of fresh step dictionaries
     */
    cloneSteps(plan: Dict): Dict[];
    /**
     * @ignore
     * @method
     * @name OrderRouter#emptyReport
     * @description builds the report skeleton, with every step marked planned
     * @param {object} plan the plan being executed
     * @param {string} strategy the strategy actually in force
     * @param {string} requestedStrategy the strategy asked for, which differs when live was not set
     * @param {bool} live whether orders may be placed
     * @param {object[]} steps the working copy of the plan's steps
     * @returns {object} the report
     */
    emptyReport(plan: Dict, strategy: string, requestedStrategy: string, live: boolean, steps: Dict[]): Dict;
    /**
     * @ignore
     * @method
     * @name OrderRouter#executeSequential
     * @description places one order at a time in plan order, reconciling after each and obeying the halt verdict
     * @param {object} report the report being filled in
     * @param {object[]} steps the working steps, resized in place as hops complete
     * @param {object} venues exchangeId to exchange instance
     * @param {object} options the execute options
     * @param {object} usdRates currency code to USD price
     * @param {string} strategy sequential, limit_protected or atomic_ish
     * @returns {undefined}
     */
    executeSequential(report: Dict, steps: Dict[], venues: Dict, options: Dict, usdRates: Dict, strategy: string): Promise<void>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#executeParallelWithinHop
     * @description runs the legs of one hop concurrently and the hops strictly in order
     * @param {object} report the report being filled in
     * @param {object[]} steps the working steps
     * @param {object} venues exchangeId to exchange instance
     * @param {object} options the execute options
     * @param {object} usdRates currency code to USD price
     * @returns {undefined}
     */
    executeParallelWithinHop(report: Dict, steps: Dict[], venues: Dict, options: Dict, usdRates: Dict): Promise<void>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#executeBestEffort
     * @description places what it can and never halts, on a single hop only, up to maxOrders
     * @param {object} report the report being filled in
     * @param {object[]} steps the working steps
     * @param {object} venues exchangeId to exchange instance
     * @param {object} options the execute options
     * @param {object} usdRates currency code to USD price
     * @returns {undefined}
     */
    placeVenueGroup(indices: number[], steps: Dict[], venues: Dict, options: Dict, usdRates: Dict, report: Dict, results: Dict[]): Promise<void>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#executeBestEffort
     * @description places what it can and never halts, on a single hop only, up to maxOrders
     * @param {object} report the report being filled in
     * @param {object[]} steps the working steps
     * @param {object} venues exchangeId to exchange instance
     * @param {object} options the execute options
     * @param {object} usdRates currency code to USD price
     * @returns {undefined}
     */
    executeBestEffort(report: Dict, steps: Dict[], venues: Dict, options: Dict, usdRates: Dict): Promise<void>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#placeStepWithRetry
     * @description places one step, re-placing it up to options.retryFailedSteps times when — and ONLY when — the venue definitively rejected it
     * @param {object} step the step to trade
     * @param {object} venues exchangeId to exchange instance
     * @param {object} options the execute options
     * @param {object} usdRates currency code to USD price
     * @param {string} strategy the strategy in force
     * @param {object} report the report, for openOrders and errors
     * @returns {object} the step result of the last attempt
     */
    placeStepWithRetry(step: Dict, venues: Dict, options: Dict, usdRates: Dict, strategy: string, report: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#callOnStep
     * @description hands the caller's onStep hook one finished step and returns its verdict, treating any failure of the hook as 'no opinion'
     * @param {object} options the execute options, which may carry onStep
     * @param {object} report the report so far
     * @param {object} result the finished step result
     * @param {object} reconciliation the step's reconciliation, empty when it halted before reconciling
     * @param {int} stepIndex the step's index
     * @param {int} stepsTotal how many steps the plan has
     * @returns {string} 'halt' to stop, anything else to continue
     */
    callOnStep(options: Dict, report: Dict, result: Dict, reconciliation: Dict, stepIndex: number, stepsTotal: number): string;
    /**
     * @ignore
     * @method
     * @name OrderRouter#placeStep
     * @description places one order for one step and never throws, so that a sibling leg's failure cannot abandon an in-flight order
     * @param {object} step the step to trade
     * @param {object} venues exchangeId to exchange instance
     * @param {object} options the execute options
     * @param {object} usdRates currency code to USD price
     * @param {string} strategy the strategy in force, which decides limit resting behaviour
     * @param {object} report the report, for openOrders and errors
     * @returns {object} the step result
     */
    placeStep(step: Dict, venues: Dict, options: Dict, usdRates: Dict, strategy: string, report: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#recordOpenOrder
     * @description appends one possibly-live order to the report, ignoring a blank id and never recording the same id twice
     * @param {object} report the report
     * @param {string} exchangeId the venue
     * @param {string} symbol the market
     * @param {string} orderId the venue's order id
     * @param {string} reason why the order may still be open
     * @returns {undefined}
     */
    recordUnconfirmedPlacement(report: Dict, exchangeId: string, symbol: string, reason: string): void;
    /**
     * @ignore
     * @method
     * @name OrderRouter#recordOpenOrder
     * @description appends one possibly-live order to the report, ignoring a blank id and never recording the same id twice
     * @param {object} report the report
     * @param {string} exchangeId the venue
     * @param {string} symbol the market
     * @param {string} orderId the venue's order id
     * @param {string} reason why the order may still be open
     * @returns {undefined}
     */
    recordOpenOrder(report: Dict, exchangeId: string, symbol: string, orderId: string, reason: string): void;
    /**
     * @ignore
     * @method
     * @name OrderRouter#errorCodeOf
     * @description names a caught exception by its class, which is the one label all six languages agree on
     * @param {object} e the caught exception
     * @returns {string} the exception class name, or unknown_error
     */
    hasNumberAt(container: Dict, key: string): boolean;
    /**
     * @ignore
     * @method
     * @name OrderRouter#refetchOrder
     * @description re-reads one order, returning the previous body unchanged when the venue cannot be asked
     * @param {object} venue the exchange instance
     * @param {string} orderId the venue's order id
     * @param {string} symbol the market
     * @param {object} fallback the order body to keep when the re-read is impossible or fails
     * @returns {object} the re-read order, or the fallback
     */
    refetchOrder(venue: any, orderId: string, symbol: string, fallback: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#isOutcomeUnknownError
     * @description reports whether a thrown error leaves a placement's outcome genuinely unknown
     * @param {string} errorCode the error class name
     * @returns {bool} true when the request may or may not have reached the venue
     */
    orderFeeInAsset(order: Dict, asset: string): number;
    /**
     * @ignore
     * @method
     * @name OrderRouter#isOutcomeUnknownError
     * @description reports whether a thrown error leaves a placement's outcome genuinely unknown
     * @param {string} errorCode the error class name
     * @returns {bool} true when the request may or may not have reached the venue
     */
    isOutcomeUnknownError(errorCode: string): boolean;
    /**
     * @ignore
     * @method
     * @name OrderRouter#errorCodeOf
     * @description names the class of a thrown error, for the report
     * @param {object} e the thrown value
     * @returns {string} the error class name, or unknown_error
     */
    errorCodeOf(e: any): string;
    /**
     * @ignore
     * @method
     * @name OrderRouter#placeImmediateOrder
     * @description places an immediate-or-cancel limit order, falling back to a market order only when the venue cannot do IOC and the caller explicitly allowed it
     * @param {object} venue the exchange instance
     * @param {string} symbol the market
     * @param {string} side buy or sell
     * @param {float} amount the precision-snapped amount
     * @param {float} price the precision-snapped limit price
     * @param {object} orderParams extra params for createOrder
     * @param {object} options the execute options
     * @returns {object} the order
     */
    placeImmediateOrder(venue: any, symbol: string, side: string, amount: number, price: number, orderParams: Dict, options: Dict, result: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#placeProtectedLimit
     * @description rests a limit order, then cancels it on timeout and ALWAYS re-reads it, because a cancel and a fill can cross
     * @param {object} venue the exchange instance
     * @param {object} step the step being traded
     * @param {string} symbol the market
     * @param {string} side buy or sell
     * @param {float} amount the precision-snapped amount
     * @param {float} price the precision-snapped limit price
     * @param {object} orderParams extra params for createOrder
     * @param {object} options the execute options
     * @param {object} report the report, for openOrders
     * @returns {object} the order as last observed, which is the authoritative fill
     */
    placeProtectedLimit(venue: any, step: Dict, symbol: string, side: string, amount: number, price: number, orderParams: Dict, options: Dict, report: Dict, result: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#venueSupportsIoc
     * @description reports whether a venue is known NOT to support immediate-or-cancel
     * @param {object} venue the exchange instance
     * @returns {bool} true unless the venue's features explicitly list timeInForce values without IOC
     */
    venueSupportsIoc(venue: any): boolean;
    /**
     * @ignore
     * @method
     * @name OrderRouter#assertUnderCap
     * @description throws unless a single order's USD notional is known and within the per-trade cap
     * @param {object} step the step being traded
     * @param {float} amount the snapped amount actually being sent
     * @param {float} price the snapped price actually being sent
     * @param {object} usdRates currency code to USD price
     * @param {object} options the execute options, read for maxNotionalUsd; returns without checking anything when no cap is set
     * @returns {undefined}
     */
    assertUnderCap(step: Dict, amount: number, price: number, usdRates: Dict, options: Dict): void;
    /**
     * @ignore
     * @method
     * @name OrderRouter#assertPrefunded
     * @description verifies every step's input is already sitting on its venue, which is what atomic_ish actually requires
     * @param {object[]} steps the working steps
     * @param {object} venues exchangeId to exchange instance
     * @returns {undefined}
     */
    assertPrefunded(steps: Dict[], venues: Dict): Promise<void>;
    /**
     * @ignore
     * @method
     * @name OrderRouter#applyResize
     * @description writes a reconciliation's downstream resize back into the working steps
     * @param {object[]} steps the working steps
     * @param {object} reconciliation the result of reconcileExecutionStep
     * @returns {undefined}
     */
    applyResize(steps: Dict[], reconciliation: Dict): void;
    /**
     * @ignore
     * @method
     * @name OrderRouter#markRemainingSkipped
     * @description marks every step from an index onwards as skipped after a halt
     * @param {object[]} results the report's step results
     * @param {int} start the first index to mark
     * @returns {undefined}
     */
    markRemainingSkipped(results: any[], start: number): void;
    /**
     * @ignore
     * @method
     * @name OrderRouter#recordError
     * @description appends one error to the report
     * @param {object} report the report
     * @param {int} stepIndex the step that failed
     * @param {string} exchangeId the venue
     * @param {string} symbol the market
     * @param {string} code the error class name or an internal code
     * @returns {undefined}
     */
    recordError(report: Dict, stepIndex: number, exchangeId: string, symbol: string, code: string): void;
    /**
     * @ignore
     * @method
     * @name OrderRouter#summariseReport
     * @description totals what the first hop spent and what the last hop produced
     * @param {object} report the report
     * @param {object[]} steps the working steps
     * @returns {undefined}
     */
    summariseReport(report: Dict, steps: Dict[]): void;
    /**
     * @ignore
     * @method
     * @name OrderRouter#nowMs
     * @description reads the wall clock, in milliseconds since the epoch
     * @returns {int} the current time
     */
    nowMs(): number;
    /**
     * @ignore
     * @method
     * @name OrderRouter#sleep
     * @description waits for a number of milliseconds
     * @param {int} milliseconds how long to wait
     * @returns {undefined}
     */
    sleep(milliseconds: number): Promise<unknown>;
}
export default OrderRouter;
export { OrderRouter };
