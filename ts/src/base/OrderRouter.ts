//  ---------------------------------------------------------------------------
//  OrderRouter — a client for the CCXT order-router service, plus the pure
//  planning / safety / reconciliation layer that sits between a routing
//  recommendation and real orders.
//
//  This file is HAND-WRITTEN and is NOT produced by any transpiler. Five sibling
//  implementations mirror it method for method:
//
//      python/ccxt/base/order_router.py
//      php/OrderRouter.php
//      cs/ccxt/base/OrderRouter.cs
//      go/v4/exchange_order_router.go
//      rust/ccxt-base/src/order_router.rs
//
//  Every construct below is deliberately one that Python, PHP, C#, Go and Rust
//  can express the same way. The rules that keep the six ports honest:
//
//    - plain dictionaries and arrays only, never a language-specific container
//    - NO NULLS in any returned structure. 0 means "unknown number", '' means
//      "unknown string", and a boolean companion field carries "was it known?"
//      wherever that distinction is load-bearing. Go structs and C# value types
//      have no natural null, and a null that only exists in three of six
//      languages is a divergence waiting to happen
//    - never iterate a hash map to produce ORDERED output. Build arrays and
//      search them linearly: map iteration order differs per language
//    - all numbers are IEEE-754 doubles and every arithmetic sequence is written
//      in a fixed order, so the six ports agree bit for bit
//    - ONE number grammar, hand-rolled in all six (see parseNumber). No port
//      calls its own parser: float() reads '1_000' as 1000 and '1,234.5' not at
//      all, PCRE's \s is not JavaScript's whitespace set, strconv refuses
//      '12abc' outright, string.Trim() eats Unicode spaces parseFloat does not.
//      A cap read as 1234.5 in one language and 1 in another is a cap that
//      silently disappears
//    - NaN and +/-Infinity are NOT numbers here. An infinite tolerance disables
//      the halt verdict and an infinite rate disables the cap, so both fall back
//      to the caller's default — in all six, identically
//    - violation and verdict strings are CONSTANTS, never interpolated with
//      numbers: "25" and "25.0" are the same value and different text
//    - no closures escape a method, no generics, no exceptions as control flow
//
//  This class never moves funds between venues. There is no call to any
//  funds-transfer endpoint anywhere in it, deliberately and permanently.
//  ---------------------------------------------------------------------------

import { ArgumentsRequired, AuthenticationError, BadRequest, ExchangeError, ExchangeNotAvailable, InsufficientFunds, NotSupported, RateLimitExceeded, RequestTimeout } from './errors.js';
import { Dict } from './types.js';

//  ---------------------------------------------------------------------------
//  Static text for every violation and verdict code. Kept out of the methods so
//  that a port can copy the table verbatim and a reviewer can diff two languages
//  by eye. No number is ever interpolated into these.
//  ---------------------------------------------------------------------------

const VIOLATION_MESSAGES: Dict = {
    'empty_plan': 'the plan contains no steps',
    'route_unroutable': 'the route carries an unroutableReason and must not be executed',
    'partial_fill': 'the route does not fill completely at the requested size',
    'unknown_symbol': 'the symbol is not listed on that venue',
    'market_mismatch': 'the venue market trades a different pair than the route hop says it does',
    'invalid_step': 'the step has a non-positive amount or price, or a side that is neither buy nor sell',
    'amount_below_minimum': 'the amount is below the market minimum',
    'amount_above_maximum': 'the amount is above the market maximum',
    'cost_below_minimum': 'the notional is below the market minimum cost',
    'price_out_of_range': 'the limit price falls outside the market price limits',
    'notional_unvaluable': 'the step cannot be valued in USD, so the notional cap cannot be enforced',
    'notional_exceeds_cap': 'the notional exceeds the per-trade USD cap',
    'amount_precision': 'the amount does not sit on the market amount precision',
    'price_precision': 'the limit price does not sit on the market price precision',
};
const KNOWN_STRATEGIES = [ 'dry_run', 'sequential', 'parallel_within_hop', 'limit_protected', 'best_effort', 'atomic_ish' ];
//  the query keys forwarded to GET /route, in a fixed order so that two ports
//  build a byte-identical URL
const ROUTE_QUERY_KEYS = [ 'amountIn', 'amountOut', 'strategy', 'maxVenues', 'bridges', 'exchanges', 'balances', 'balanceMode', 'includeQuotes', 'includeFees', 'certified', 'requireFullFill', 'hopPenaltyBps', 'minLegNotional' ];
class OrderRouter {
    //  defaults, mirrored as constants in every port
    static DEFAULT_BASE_URL = 'https://docs.ccxt.com/router/api';

    static DEFAULT_TIMEOUT_MS = 30000;

    static DEFAULT_SLIPPAGE_BPS = 25;

    static DEFAULT_RECONCILE_TOLERANCE = 0.02;

    //  How long retryFailedSteps waits before re-placing a step the venue rejected. A second is
    //  the shortest delay that lets a transient cause clear (a rate limit window, a momentary
    //  balance lag) without turning a retry budget into a burst against a venue that just said no.
    static DEFAULT_RETRY_DELAY_MS = 1000;

    //  NO_CAP is the default: this class does not decide how much of your money you
    //  may trade. `maxNotionalUsd` is an OPT-IN guardrail — set it and it is honoured
    //  exactly, at whatever value you choose; leave it unset and no notional check runs
    //  at all.
    //
    //  It used to be a hard 25 USD ceiling that could be lowered but never raised. That
    //  number came from CLAUDE.md §5.5, which governs THIS REPOSITORY'S live tests
    //  against real exchanges — not the people using the library. A client that refuses
    //  a 30 USD order because its own test suite is cautious is broken as a product.
    static NO_CAP = 0;

    //  router-side caps on the `balances` query parameter; both REJECT rather
    //  than truncate server-side, so the client trims before sending
    static MAX_BALANCE_ENTRIES = 64;

    static MAX_BALANCE_CHARS = 4096;

    //  How many executed plan ids the in-process idempotency ledger keeps. 1024 is
    //  chosen to be far more executions than any one process performs in the window
    //  where a duplicate is plausible (a retry loop, an operator re-running a plan,
    //  a redelivered message), while bounding the ledger to a few tens of kilobytes
    //  so a router held open for the life of a daemon cannot grow without limit.
    //
    //  THE TRADEOFF IS REAL AND IS NOT HIDDEN: eviction WEAKENS the guarantee. Once a
    //  plan id has been pushed out by 1024 newer executions, re-executing that plan is
    //  no longer refused in-process — it will be placed again, orders and all. The
    //  guard is therefore "recent duplicates are refused", not "duplicates are
    //  impossible". A process that needs the strong promise across restarts or beyond
    //  this window needs the durable ledger the Known gaps entry calls for; until then,
    //  callers whose plans must never re-execute should key idempotency at the venue
    //  themselves (a clientOrderId passed in options.orderParams, on venues that honour
    //  one) rather than rely on this instance's memory.
    static MAX_EXECUTED_PLAN_IDS = 1024;

    //  relative tolerance for float comparisons; also the tolerance the six
    //  test suites compare fixture numbers with
    static TOLERANCE = 1e-9;

    apiKey: string;

    baseUrl: string;

    timeoutMs: number;

    maxNotionalUsd: number;

    //  in-process idempotency ledger: the identity of every plan this instance has
    //  already executed live. TWO structures for one ledger, in every port: a FIFO
    //  list that fixes the eviction order, and a dictionary used as a set so the
    //  membership test is a key lookup rather than a scan whose cost grows with the
    //  ledger. They are written and evicted together and must never disagree.
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
    constructor (config: Dict = {}) {
        const apiKey = this.stringAt (config, 'apiKey', '');
        if (apiKey === '') {
            throw new ArgumentsRequired ('OrderRouter requires an apiKey');
        }
        this.apiKey = apiKey;
        let baseUrl = this.stringAt (config, 'baseUrl', OrderRouter.DEFAULT_BASE_URL);
        while (baseUrl.length > 0 && baseUrl[baseUrl.length - 1] === '/') {
            baseUrl = baseUrl.slice (0, baseUrl.length - 1);
        }
        this.baseUrl = baseUrl;
        this.timeoutMs = this.numberAt (config, 'timeoutMs', OrderRouter.DEFAULT_TIMEOUT_MS);
        const maxNotionalUsd = this.numberAt (config, 'maxNotionalUsd', OrderRouter.NO_CAP);
        if (maxNotionalUsd < 0) {
            //  a negative cap is a typo, not a policy, and silently ignoring it would
            //  leave the caller believing a guardrail is in place
            throw new BadRequest ('OrderRouter maxNotionalUsd must not be negative; omit it, or pass 0, for no cap');
        }
        //  0 means NO CAP. Any positive value is honoured exactly — it is not clamped,
        //  because the caller is the one who knows the size of their own trade.
        this.maxNotionalUsd = maxNotionalUsd;
        this.executedPlanIds = [];
        this.executedPlanIdSet = {};
    }

    //  -----------------------------------------------------------------------
    //  small container accessors. Every port has these four; they exist so the
    //  six implementations read line for line and so a missing key is never a
    //  language-specific crash.
    //  -----------------------------------------------------------------------

    /**
     * @ignore
     * @method
     * @name OrderRouter#stepLimitPrice
     * @description the price a step is sent at, derived from expectedPrice when the caller gave no limitPrice
     * @param {object} step one step of an execution plan
     * @returns {float} the limit price to use, 0 only when the step has neither field
     */
    stepLimitPrice (step: Dict): number {
        //  buildExecutionPlan always sets limitPrice, but a HAND-BUILT plan need not: the manual
        //  documents it as optional, and the "execute your own plans" path is the whole point of
        //  execute() taking a plan rather than a route. Reading it as 0 made every such plan fail
        //  three different ways — a blocking price_out_of_range from checkExecutionPlanSafety, a
        //  rounded_to_zero before any strategy branch in placeStep, and a buy-side balance
        //  requirement of amount * 0 — so the documented example could not place one order.
        //  expectedPrice is the honest fallback: it is what the caller says the step is worth, and
        //  it is already guaranteed positive by the invalid_step guard. A caller wanting a tighter
        //  or looser bound sets limitPrice explicitly.
        const limitPrice = this.numberAt (step, 'limitPrice', 0);
        if (limitPrice > 0) {
            return limitPrice;
        }
        return this.numberAt (step, 'expectedPrice', 0);
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#stepNotionalQuote
     * @description the step's quote-side value, derived from amount and expectedPrice when absent
     * @param {object} step one step of an execution plan
     * @returns {float} the notional in the market's quote currency
     */
    stepNotionalQuote (step: Dict): number {
        //  Same reasoning as stepLimitPrice, and the same formula buildExecutionPlan uses. Read as
        //  0, a hand-built plan tripped the BLOCKING cost_below_minimum on every market declaring
        //  a minimum cost.
        const notionalQuote = this.numberAt (step, 'notionalQuote', 0);
        if (notionalQuote > 0) {
            return notionalQuote;
        }
        return this.numberAt (step, 'amount', 0) * this.numberAt (step, 'expectedPrice', 0);
    }

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
    numberAt (container: any, key: string, defaultValue: number): number {
        if (container === undefined || container === null) {
            return defaultValue;
        }
        const value = container[key];
        if (value === undefined || value === null) {
            return defaultValue;
        }
        if (typeof value === 'number') {
            //  NaN and +/-Infinity are not numbers this class will act on. An
            //  infinite tolerance silently disables the halt verdict and an
            //  infinite rate silently disables the cap, and "the default" is
            //  the only answer six languages can agree on for either.
            if (!this.isFiniteNumber (value)) {
                return defaultValue;
            }
            return value;
        }
        if (typeof value === 'string') {
            return this.parseNumber (value, defaultValue);
        }
        return defaultValue;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#isFiniteNumber
     * @description reports whether a double is a real number, i.e. neither NaN nor an infinity
     * @param {float} value the number to test
     * @returns {bool} true when the value is finite
     */
    isFiniteNumber (value: number): boolean {
        if (value !== value) {
            //  the one NaN test that needs no library in any of the six
            return false;
        }
        if (value > 1.7976931348623157e308 || value < -1.7976931348623157e308) {
            return false;
        }
        return true;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#parseNumber
     * @description reads the leading numeric prefix of a string, exactly as JavaScript's parseFloat does, and returns the default when there is not one or when the result is not finite
     * @param {string} text the text to read
     * @param {float} defaultValue value returned when the text does not start with a number
     * @returns {float} the number
     */
    parseNumber (text: string, defaultValue: number): number {
        //  Hand-rolled rather than delegated to the language's own parser,
        //  because every language's own parser disagrees with the other four
        //  somewhere: Python reads '1_000' as 1000 and '1,234.5' not at all, PHP
        //  and Go read '0x10' as 0 only by accident of their regex, C# trims
        //  Unicode whitespace JavaScript does not. The grammar below is
        //  JavaScript's StrDecimalLiteral prefix over the ASCII whitespace set,
        //  and it is the SAME twenty lines in all six ports.
        if (text === undefined || text === null) {
            return defaultValue;
        }
        let cursor = 0;
        while (cursor < text.length && this.isRouterSpace (text[cursor])) {
            cursor = cursor + 1;
        }
        const start = cursor;
        if (cursor < text.length && (text[cursor] === '+' || text[cursor] === '-')) {
            cursor = cursor + 1;
        }
        let digits = 0;
        while (cursor < text.length && text[cursor] >= '0' && text[cursor] <= '9') {
            cursor = cursor + 1;
            digits = digits + 1;
        }
        if (cursor < text.length && text[cursor] === '.') {
            cursor = cursor + 1;
            while (cursor < text.length && text[cursor] >= '0' && text[cursor] <= '9') {
                cursor = cursor + 1;
                digits = digits + 1;
            }
        }
        if (digits === 0) {
            //  'Infinity', 'inf', 'NaN', '' and '٠١' all land here, in all six
            return defaultValue;
        }
        let end = cursor;
        if (cursor < text.length && (text[cursor] === 'e' || text[cursor] === 'E')) {
            let exponent = cursor + 1;
            if (exponent < text.length && (text[exponent] === '+' || text[exponent] === '-')) {
                exponent = exponent + 1;
            }
            let exponentDigits = 0;
            while (exponent < text.length && text[exponent] >= '0' && text[exponent] <= '9') {
                exponent = exponent + 1;
                exponentDigits = exponentDigits + 1;
            }
            if (exponentDigits > 0) {
                //  a trailing 'e' with no digits is not part of the number: JS
                //  reads '1e' as 1, and so does every port here
                end = exponent;
            }
        }
        const parsed = Number (text.slice (start, end));
        if (!this.isFiniteNumber (parsed)) {
            //  '1e400' overflows to an infinity, which is not a number the cap
            //  or the tolerance may be built out of
            return defaultValue;
        }
        return parsed;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#isRouterSpace
     * @description reports whether a character is one of the six ASCII spaces the number grammar skips
     * @param {string} character a single character
     * @returns {bool} true for space, tab, newline, carriage return, form feed and vertical tab
     */
    isRouterSpace (character: string): boolean {
        //  deliberately NOT the language's own isspace: Python, PHP, C# and Go
        //  each draw the Unicode line in a different place, and a non-breaking
        //  space that parses in one language and not the others is drift
        return (character === ' ') || (character === '\t') || (character === '\n') || (character === '\r') || (character === '\f') || (character === '\v');
    }

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
    stringAt (container: any, key: string, defaultValue: string): string {
        if (container === undefined || container === null) {
            return defaultValue;
        }
        const value = container[key];
        if (value === undefined || value === null) {
            return defaultValue;
        }
        if (typeof value === 'string') {
            return value;
        }
        return defaultValue;
    }

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
    boolAt (container: any, key: string, defaultValue: boolean): boolean {
        if (container === undefined || container === null) {
            return defaultValue;
        }
        const value = container[key];
        if (value === undefined || value === null) {
            return defaultValue;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        return defaultValue;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#listAt
     * @description reads an array field out of a container, returning an empty array when absent
     * @param {object} container the dictionary to read from
     * @param {string} key the field name
     * @returns {object[]} the array, never undefined
     */
    listAt (container: any, key: string): any[] {
        if (container === undefined || container === null) {
            return [];
        }
        const value = container[key];
        if (value === undefined || value === null) {
            return [];
        }
        if (Array.isArray (value)) {
            return value;
        }
        return [];
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#dictAt
     * @description reads a nested dictionary out of a container, returning an empty dictionary when absent
     * @param {object} container the dictionary to read from
     * @param {string} key the field name
     * @returns {object} the dictionary, never undefined
     */
    dictAt (container: any, key: string): Dict {
        if (container === undefined || container === null) {
            return {};
        }
        const value = container[key];
        if (value === undefined || value === null) {
            return {};
        }
        if (typeof value !== 'object' || Array.isArray (value)) {
            return {};
        }
        return value;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#formatNumber
     * @description formats a double as decimal text with no exponent, so that six languages produce the same string
     * @param {float} value the number to format
     * @returns {string} the number as fixed-point text with trailing zeros removed
     */
    formatNumber (value: number): string {
        //  JavaScript prints 1e-7 where Python prints 1e-07 and Go prints 1e-07;
        //  a fixed 12-decimal rendering with the trailing zeros trimmed is the
        //  one spelling all six languages agree on for the magnitudes a
        //  balance or an amount can take.
        if (!isFinite (value)) {
            return '0';
        }
        if (Math.abs (value) >= 1e18) {
            //  JavaScript's toFixed switches to exponent notation at 1e21 while
            //  the other five languages never do. Rather than let one language
            //  send a different string than the others, refuse — loudly, and at
            //  a magnitude no real amount reaches.
            throw new BadRequest ('OrderRouter: a number this large cannot be rendered identically in all six languages');
        }
        let text = value.toFixed (12);
        if (text.indexOf ('.') >= 0) {
            while (text.length > 0 && text[text.length - 1] === '0') {
                text = text.slice (0, text.length - 1);
            }
            if (text.length > 0 && text[text.length - 1] === '.') {
                text = text.slice (0, text.length - 1);
            }
        }
        if (text === '' || text === '-' || text === '-0') {
            return '0';
        }
        return text;
    }

    //  -----------------------------------------------------------------------
    //  I/O: the router HTTP client
    //  -----------------------------------------------------------------------

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
    async fetchRoute (fromAsset: string, toAsset: string, params: Dict = {}): Promise<Dict> {
        if (fromAsset === undefined || toAsset === undefined || fromAsset === '' || toAsset === '') {
            throw new ArgumentsRequired ('fetchRoute requires fromAsset and toAsset');
        }
        const hasAmountIn = (params['amountIn'] !== undefined) && (params['amountIn'] !== null);
        const hasAmountOut = (params['amountOut'] !== undefined) && (params['amountOut'] !== null);
        if (hasAmountIn === hasAmountOut) {
            //  refused client-side for the same reason the router refuses it: a
            //  typo must not become a confidently wrong route
            throw new BadRequest ('fetchRoute requires exactly one of amountIn or amountOut');
        }
        let query = 'from=' + encodeURIComponent (fromAsset.toUpperCase ()) + '&to=' + encodeURIComponent (toAsset.toUpperCase ());
        for (let i = 0; i < ROUTE_QUERY_KEYS.length; i++) {
            const key = ROUTE_QUERY_KEYS[i];
            const value = params[key];
            if (value === undefined || value === null) {
                continue;
            }
            let text = '';
            if (typeof value === 'boolean') {
                text = value ? 'true' : 'false';
            } else if (typeof value === 'number') {
                text = this.formatNumber (value);
            } else if (Array.isArray (value)) {
                text = value.join (',');
            } else {
                text = value.toString ();
            }
            query = query + '&' + key + '=' + encodeURIComponent (text);
        }
        const url = this.baseUrl + '/route?' + query;
        const route = await this.request (url);
        //  Stamp what THIS CLIENT asked for, client-side, so buildExecutionPlan can check the
        //  answer against the question. Everything else in the response — from, to, pair, side —
        //  is the server's word for it, and the plan used to trust all of it: a compromised or
        //  simply buggy router could name any real market and the safety checks, which only test
        //  internal consistency against that market, would pass it under the 25 USD cap.
        route['clientRequestedFrom'] = fromAsset.toUpperCase ();
        route['clientRequestedTo'] = toAsset.toUpperCase ();
        return route;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#request
     * @description performs the authenticated GET and maps router status codes onto CCXT exceptions
     * @param {string} url the fully-formed url including the query string
     * @returns {object} the decoded JSON body
     */
    async request (url: string): Promise<Dict> {
        const headers = {
            'x-api-key': this.apiKey,
            'Accept': 'application/json',
        };
        const controller = new AbortController ();
        const timer = setTimeout (() => controller.abort (), this.timeoutMs);
        let status = 0;
        let text = '';
        try {
            const response = await fetch (url, { 'method': 'GET', 'headers': headers, 'signal': controller.signal });
            status = response.status;
            text = await response.text ();
        } catch (e) {
            //  an aborted fetch reports its reason through `name`, not through
            //  the class: the thrown object is a DOMException in Node and in
            //  browsers alike
            const name = this.stringAt (e, 'name', this.errorCodeOf (e));
            if (name === 'AbortError' || name === 'TimeoutError') {
                throw new RequestTimeout ('OrderRouter request timed out after ' + this.timeoutMs.toString () + 'ms');
            }
            throw new ExchangeNotAvailable ('OrderRouter request failed: ' + (e as Error).message);
        } finally {
            clearTimeout (timer);
        }
        let body: Dict = {};
        try {
            body = JSON.parse (text);
        } catch (e) {
            throw new ExchangeError ('OrderRouter returned a non-JSON body');
        }
        if (status >= 200 && status < 300) {
            return body;
        }
        //  404 and 501 carry a complete RouteResult explaining the refusal —
        //  `no_market` and `exact_out_multi_hop_unsupported` are routing
        //  outcomes, and turning them into exceptions would make the caller
        //  parse an error string to recover a structure it already has
        if ((status === 404 || status === 501) && (this.stringAt (body, 'unroutableReason', '') !== '')) {
            return body;
        }
        const message = this.stringAt (body, 'error', 'http status ' + status.toString ());
        if (status === 400) {
            throw new BadRequest ('OrderRouter: ' + message);
        }
        if (status === 401 || status === 403) {
            throw new AuthenticationError ('OrderRouter: ' + message);
        }
        if (status === 429) {
            throw new RateLimitExceeded ('OrderRouter: ' + message);
        }
        if (status === 408 || status === 504) {
            throw new RequestTimeout ('OrderRouter: ' + message);
        }
        throw new ExchangeError ('OrderRouter: ' + message);
    }

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
    async fetchRouteWithBalances (fromAsset: string, toAsset: string, venues: Dict, params: Dict = {}): Promise<Dict> {
        const requireApplied = this.boolAt (params, 'requireBalancesApplied', true);
        const exchangeIds = Object.keys (venues);
        exchangeIds.sort ();
        const entries: Dict[] = [];
        const dropped: Dict[] = [];
        for (let i = 0; i < exchangeIds.length; i++) {
            const exchangeId = exchangeIds[i];
            const venue = venues[exchangeId];
            const balance = await venue.fetchBalance ();
            let holdings = this.dictAt (balance, 'free');
            if (Object.keys (holdings).length === 0) {
                holdings = this.dictAt (balance, 'total');
            }
            const codes = Object.keys (holdings);
            codes.sort ();
            for (let j = 0; j < codes.length; j++) {
                const code = codes[j];
                const amount = this.numberAt (holdings, code, 0);
                if (amount <= 0) {
                    //  a zero holding is not information, and it costs one of
                    //  the router's 64 entries
                    continue;
                }
                if (amount >= 1e18) {
                    //  beyond fixed-point rendering; reported rather than sent,
                    //  because a silently reshaped amount is worse than a
                    //  missing one
                    dropped.push ({ 'exchangeId': exchangeId, 'asset': code, 'amount': amount, 'reason': 'amount_out_of_range' });
                    continue;
                }
                entries.push ({ 'exchangeId': exchangeId, 'asset': code, 'amount': amount });
            }
        }
        //  largest first, so trimming to the router's caps drops the smallest
        //  holdings. Ties break on exchangeId then asset so six languages
        //  produce the same list from the same wallet.
        entries.sort ((a, b) => {
            if (a['amount'] !== b['amount']) {
                return (a['amount'] > b['amount']) ? -1 : 1;
            }
            if (a['exchangeId'] !== b['exchangeId']) {
                return (a['exchangeId'] < b['exchangeId']) ? -1 : 1;
            }
            return (a['asset'] < b['asset']) ? -1 : 1;
        });
        while (entries.length > OrderRouter.MAX_BALANCE_ENTRIES) {
            const removed = entries.pop () as Dict;
            removed['reason'] = 'entry_cap';
            dropped.push (removed);
        }
        let balances = this.joinBalances (entries);
        while (balances.length > OrderRouter.MAX_BALANCE_CHARS && entries.length > 0) {
            const removed = entries.pop () as Dict;
            removed['reason'] = 'char_cap';
            dropped.push (removed);
            balances = this.joinBalances (entries);
        }
        const routeParams: Dict = {};
        const keys = Object.keys (params);
        for (let i = 0; i < keys.length; i++) {
            routeParams[keys[i]] = params[keys[i]];
        }
        routeParams['balances'] = balances;
        const route = await this.fetchRoute (fromAsset, toAsset, routeParams);
        if (requireApplied && (balances !== '')) {
            //  /route declares its query without a JSON schema, so a router that
            //  predates the balances feature answers byte-identically to one
            //  that never received it. Executing a plan computed against a
            //  portfolio the server never saw is the case worth failing on.
            if (this.stringAt (route, 'balancesApplied', '') === '') {
                throw new ExchangeError ('OrderRouter did not echo balancesApplied: the balances were ignored, so this route is not funded-aware');
            }
        }
        route['balancesUsed'] = balances;
        route['balancesDropped'] = dropped;
        return route;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#joinBalances
     * @description renders balance entries as the router's [exchangeId.]ASSET:amount comma-separated form
     * @param {object[]} entries the entries to render
     * @returns {string} the balances query value
     */
    joinBalances (entries: any[]): string {
        let text = '';
        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (i > 0) {
                text = text + ',';
            }
            text = text + entry['exchangeId'] + '.' + entry['asset'] + ':' + this.formatNumber (entry['amount']);
        }
        return text;
    }

    //  -----------------------------------------------------------------------
    //  PURE: buildExecutionPlan
    //  -----------------------------------------------------------------------

    /**
     * @ignore
     * @method
     * @name OrderRouter#assertRouteChainIsCoherent
     * @description refuses a route whose hops do not connect, or that does not run from the asset the caller offered to the asset the caller wanted
     * @param {object} route the RouteResult being planned, carrying the client's own clientRequestedFrom/clientRequestedTo stamp
     * @param {object[]} hops the route's hops, in order
     * @returns {undefined} nothing; it throws ExchangeError when the chain does not hold
     */
    assertRouteChainIsCoherent (route: Dict, hops: Dict[]) {
        if (hops.length === 0) {
            return;
        }
        let carried = '';
        for (let i = 0; i < hops.length; i++) {
            const hop = hops[i];
            const side = this.stringAt (hop, 'side', '').toLowerCase ();
            const base = this.stringAt (hop, 'base', '').toUpperCase ();
            const quote = this.stringAt (hop, 'quote', '').toUpperCase ();
            if (base === '' || quote === '' || (side !== 'buy' && side !== 'sell')) {
                throw new ExchangeError ('OrderRouter: hop ' + i.toString () + ' does not name a market and a side');
            }
            //  a buy spends the quote to acquire the base; a sell is the reverse
            const spends = (side === 'buy') ? quote : base;
            const produces = (side === 'buy') ? base : quote;
            if (i > 0 && spends !== carried) {
                //  hop N+1 must spend exactly what hop N produced, or the plan strands the
                //  proceeds of one order and funds the next from a wallet nobody checked
                throw new ExchangeError ('OrderRouter: hop ' + i.toString () + ' spends ' + spends + ' but the previous hop produced ' + carried);
            }
            if (i === 0) {
                carried = spends;
                const requestedFrom = this.stringAt (route, 'clientRequestedFrom', '');
                if (requestedFrom !== '' && spends !== requestedFrom) {
                    throw new ExchangeError ('OrderRouter: the route spends ' + spends + ', not the requested ' + requestedFrom);
                }
            }
            carried = produces;
        }
        const requestedTo = this.stringAt (route, 'clientRequestedTo', '');
        if (requestedTo !== '' && carried !== requestedTo) {
            throw new ExchangeError ('OrderRouter: the route produces ' + carried + ', not the requested ' + requestedTo);
        }
    }

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
    buildExecutionPlan (route: Dict, options: Dict = {}): Dict {
        const slippageBps = this.numberAt (options, 'slippageBps', OrderRouter.DEFAULT_SLIPPAGE_BPS);
        const tolerance = this.numberAt (options, 'reconcileToleranceRatio', OrderRouter.DEFAULT_RECONCILE_TOLERANCE);
        const hops = this.listAt (route, 'hops');
        this.assertRouteChainIsCoherent (route, hops);
        const steps = [];
        let stepIndex = 0;
        for (let hopIndex = 0; hopIndex < hops.length; hopIndex++) {
            const hop = hops[hopIndex];
            const symbol = this.stringAt (hop, 'pair', '');
            const side = this.stringAt (hop, 'side', '');
            const base = this.stringAt (hop, 'base', '');
            const quote = this.stringAt (hop, 'quote', '');
            const legs = this.listAt (hop, 'legs');
            for (let legIndex = 0; legIndex < legs.length; legIndex++) {
                const leg = legs[legIndex];
                //  leg amounts are always in BASE units, on both sides of the
                //  market — see the router's RoutingQuote.filledAmount contract
                const amount = this.numberAt (leg, 'amount', 0);
                const expectedPrice = this.numberAt (leg, 'averagePrice', 0);
                const effectivePrice = this.numberAt (leg, 'effectivePrice', expectedPrice);
                //  the limit sits on the side that costs you: above for a buy,
                //  below for a sell
                let limitPrice = 0;
                if (side === 'buy') {
                    limitPrice = expectedPrice * (1 + slippageBps / 10000);
                } else {
                    limitPrice = expectedPrice * (1 - slippageBps / 10000);
                }
                steps.push ({
                    'stepIndex': stepIndex,
                    'hopIndex': hopIndex,
                    'legIndex': legIndex,
                    'exchangeId': this.stringAt (leg, 'exchangeId', ''),
                    'symbol': symbol,
                    'side': side,
                    'base': base,
                    'quote': quote,
                    'amount': amount,
                    'expectedPrice': expectedPrice,
                    'effectivePrice': effectivePrice,
                    'limitPrice': limitPrice,
                    'notionalQuote': amount * expectedPrice,
                });
                stepIndex = stepIndex + 1;
            }
        }
        return {
            'requestId': this.stringAt (route, 'requestId', ''),
            'calculatedAt': this.numberAt (route, 'calculatedAt', 0),
            'from': this.stringAt (route, 'from', ''),
            'to': this.stringAt (route, 'to', ''),
            'routingStrategy': this.stringAt (route, 'strategy', ''),
            'exactSide': this.stringAt (route, 'exactSide', ''),
            'amountIn': this.numberAt (route, 'amountIn', 0),
            'amountOut': this.numberAt (route, 'amountOut', 0),
            'fullyFillable': this.boolAt (route, 'fullyFillable', false),
            'fillRatio': this.numberAt (route, 'fillRatio', 0),
            'unroutableReason': this.stringAt (route, 'unroutableReason', ''),
            'hopCount': hops.length,
            'stepCount': steps.length,
            'slippageBps': slippageBps,
            'reconcileToleranceRatio': tolerance,
            'steps': steps,
        };
    }

    //  -----------------------------------------------------------------------
    //  PURE: checkExecutionPlanSafety
    //  -----------------------------------------------------------------------

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
    checkExecutionPlanSafety (plan: Dict, markets: Dict, options: Dict = {}): Dict[] {
        const violations: Dict[] = [];
        //  Honoured exactly as given, per call or per client. No clamping: a caller
        //  trading thousands and a caller trading cents are both using this correctly.
        const maxNotionalUsd = this.numberAt (options, 'maxNotionalUsd', this.maxNotionalUsd);
        const capInForce = maxNotionalUsd > 0;
        const usdRates = this.dictAt (options, 'usdRates');
        const precisionMode = this.stringAt (options, 'precisionMode', 'tick_size');
        const steps = this.listAt (plan, 'steps');
        if (steps.length === 0) {
            //  an empty plan passing an empty violation list would read as "safe"
            violations.push (this.violation (-1, '', '', 'empty_plan', true, 0, 0));
            return violations;
        }
        const unroutableReason = this.stringAt (plan, 'unroutableReason', '');
        if (unroutableReason !== '') {
            violations.push (this.violation (-1, '', '', 'route_unroutable', true, 0, 0));
        }
        if (!this.boolAt (plan, 'fullyFillable', false)) {
            violations.push (this.violation (-1, '', '', 'partial_fill', false, this.numberAt (plan, 'fillRatio', 0), 1));
        }
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const stepIndex = this.numberAt (step, 'stepIndex', i);
            const exchangeId = this.stringAt (step, 'exchangeId', '');
            const symbol = this.stringAt (step, 'symbol', '');
            const amount = this.numberAt (step, 'amount', 0);
            const expectedPrice = this.numberAt (step, 'expectedPrice', 0);
            const limitPrice = this.stepLimitPrice (step);
            const notionalQuote = this.stepNotionalQuote (step);
            const side = this.stringAt (step, 'side', '');
            if (amount <= 0 || expectedPrice <= 0 || (side !== 'buy' && side !== 'sell')) {
                violations.push (this.violation (stepIndex, exchangeId, symbol, 'invalid_step', true, amount, 0));
                continue;
            }
            const venueMarkets = this.dictAt (markets, exchangeId);
            const market = this.dictAt (venueMarkets, symbol);
            if (Object.keys (market).length === 0) {
                violations.push (this.violation (stepIndex, exchangeId, symbol, 'unknown_symbol', true, 0, 0));
                continue;
            }
            //  the same symbol string on a different venue is not necessarily
            //  the same pair, and the USD valuation below trusts the step's
            //  quote currency — so disagreement is fatal, not cosmetic
            const marketBase = this.stringAt (market, 'base', '');
            const marketQuote = this.stringAt (market, 'quote', '');
            const stepBase = this.stringAt (step, 'base', '');
            const stepQuote = this.stringAt (step, 'quote', '');
            if ((marketBase !== '' && stepBase !== '' && marketBase !== stepBase) || (marketQuote !== '' && stepQuote !== '' && marketQuote !== stepQuote)) {
                violations.push (this.violation (stepIndex, exchangeId, symbol, 'market_mismatch', true, 0, 0));
                continue;
            }
            const limits = this.dictAt (market, 'limits');
            const amountLimits = this.dictAt (limits, 'amount');
            const priceLimits = this.dictAt (limits, 'price');
            const costLimits = this.dictAt (limits, 'cost');
            const minAmount = this.numberAt (amountLimits, 'min', 0);
            const maxAmount = this.numberAt (amountLimits, 'max', 0);
            const minPrice = this.numberAt (priceLimits, 'min', 0);
            const maxPrice = this.numberAt (priceLimits, 'max', 0);
            const minCost = this.numberAt (costLimits, 'min', 0);
            if (minAmount > 0 && amount < minAmount) {
                violations.push (this.violation (stepIndex, exchangeId, symbol, 'amount_below_minimum', true, amount, minAmount));
            }
            if (maxAmount > 0 && amount > maxAmount) {
                violations.push (this.violation (stepIndex, exchangeId, symbol, 'amount_above_maximum', true, amount, maxAmount));
            }
            if (minCost > 0 && notionalQuote < minCost) {
                violations.push (this.violation (stepIndex, exchangeId, symbol, 'cost_below_minimum', true, notionalQuote, minCost));
            }
            if ((minPrice > 0 && limitPrice < minPrice) || (maxPrice > 0 && limitPrice > maxPrice)) {
                violations.push (this.violation (stepIndex, exchangeId, symbol, 'price_out_of_range', true, limitPrice, (limitPrice < minPrice) ? minPrice : maxPrice));
            }
            const precision = this.dictAt (market, 'precision');
            const amountPrecision = this.numberAt (precision, 'amount', 0);
            const pricePrecision = this.numberAt (precision, 'price', 0);
            //  precision findings are advisory: execute() snaps through the
            //  venue's own amountToPrecision/priceToPrecision before sending
            if (this.precisionViolated (amount, amountPrecision, precisionMode)) {
                violations.push (this.violation (stepIndex, exchangeId, symbol, 'amount_precision', false, amount, amountPrecision));
            }
            if (this.precisionViolated (limitPrice, pricePrecision, precisionMode)) {
                violations.push (this.violation (stepIndex, exchangeId, symbol, 'price_precision', false, limitPrice, pricePrecision));
            }
            //  the notional cap. The worst case is the higher of the expected
            //  and the limit price, which is the buy side; a sell's limit sits
            //  below, so its expected price is the one that governs.
            let worstPrice = expectedPrice;
            if (limitPrice > worstPrice) {
                worstPrice = limitPrice;
            }
            if (capInForce) {
                //  Only when a cap is actually set. With no cap there is nothing to
                //  enforce, so a missing USD rate is not an error and the caller is not
                //  made to supply usdRates for a check they did not ask for.
                const worstNotional = amount * worstPrice;
                const usdValue = this.notionalUsd (step, worstNotional, usdRates);
                if (usdValue <= 0) {
                    //  BLOCKING, and deliberately so. Skipping the cap for a step whose
                    //  USD value is unknown defeats the cap the caller DID ask for.
                    violations.push (this.violation (stepIndex, exchangeId, symbol, 'notional_unvaluable', true, worstNotional, maxNotionalUsd));
                } else if (usdValue > maxNotionalUsd * (1 + OrderRouter.TOLERANCE)) {
                    violations.push (this.violation (stepIndex, exchangeId, symbol, 'notional_exceeds_cap', true, usdValue, maxNotionalUsd));
                }
            }
        }
        return violations;
    }

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
    violation (stepIndex: number, exchangeId: string, symbol: string, code: string, blocking: boolean, actual: number, limit: number): Dict {
        return {
            'stepIndex': stepIndex,
            'exchangeId': exchangeId,
            'symbol': symbol,
            'code': code,
            'blocking': blocking,
            'actual': actual,
            'limit': limit,
            'message': this.stringAt (VIOLATION_MESSAGES, code, code),
        };
    }

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
    notionalUsd (step: Dict, notionalQuote: number, usdRates: Dict): number {
        const quote = this.stringAt (step, 'quote', '');
        const quoteRate = this.usdRateFor (quote, usdRates);
        if (quoteRate > 0) {
            return notionalQuote * quoteRate;
        }
        //  fall back to the base side: amount * usd(base) values the same trade
        const base = this.stringAt (step, 'base', '');
        const baseRate = this.usdRateFor (base, usdRates);
        if (baseRate > 0) {
            return this.numberAt (step, 'amount', 0) * baseRate;
        }
        return 0;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#usdRateFor
     * @description resolves the USD price of a currency, treating USD itself as 1 and assuming nothing about anything else
     * @param {string} code the currency code
     * @param {object} usdRates a dictionary of currency code to USD price
     * @returns {float} the rate, or 0 when unknown
     */
    usdRateFor (code: string, usdRates: Dict): number {
        if (code === '') {
            return 0;
        }
        if (code === 'USD') {
            return 1;
        }
        //  USDT and USDC are NOT assumed to be one dollar. A stablecoin peg is
        //  an empirical fact, not a definition, and the caller supplying rates
        //  is the one who knows today's.
        const rate = this.numberAt (usdRates, code, 0);
        if (rate > 0) {
            return rate;
        }
        return 0;
    }

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
    precisionViolated (value: number, precision: number, mode: string): boolean {
        if (precision <= 0) {
            //  unknown or unconstrained precision is not a finding
            return false;
        }
        let rounded = 0;
        if (mode === 'decimal_places') {
            const factor = Math.pow (10, precision);
            rounded = Math.round (value * factor) / factor;
        } else {
            //  the rounding mode is irrelevant here: a value exactly halfway
            //  between two ticks is off-grid whichever neighbour it snaps to,
            //  so the six languages' differing round() semantics cannot change
            //  this predicate's answer
            rounded = Math.round (value / precision) * precision;
        }
        const allowed = Math.abs (value) * OrderRouter.TOLERANCE + 1e-15;
        return Math.abs (rounded - value) > allowed;
    }

    //  -----------------------------------------------------------------------
    //  PURE: reconcileExecutionStep
    //  -----------------------------------------------------------------------

    /**
     * @method
     * @name OrderRouter#reconcileExecutionStep
     * @description compares what a step actually produced against what the route predicted, resizes every downstream hop, and returns the proceed-or-halt verdict. PURE — no I/O. The halt decision lives here rather than in the execution loop because it is a money decision, and six separate loops is six chances to omit it
     * @param {object} plan the plan, with any earlier resizes already applied to its steps
     * @param {int} stepIndex the step that just completed
     * @param {float} realisedOut what it actually produced, in that step's output asset — base for a buy, quote for a sell
     * @returns {object} the verdict, with expectedOut, realisedOut, shortfall, shortfallRatio, scale, verdict, reason and resizedSteps
     */
    reconcileExecutionStep (plan: Dict, stepIndex: number, realisedOut: number): Dict {
        const steps = this.listAt (plan, 'steps');
        if (stepIndex < 0 || stepIndex >= steps.length) {
            throw new BadRequest ('reconcileExecutionStep: stepIndex is out of range');
        }
        const step = steps[stepIndex];
        const hopIndex = this.numberAt (step, 'hopIndex', 0);
        const tolerance = this.numberAt (plan, 'reconcileToleranceRatio', OrderRouter.DEFAULT_RECONCILE_TOLERANCE);
        const expectedOut = this.stepExpectedOut (step);
        const resized: Dict[] = [];
        if (expectedOut <= 0) {
            return {
                'stepIndex': stepIndex,
                'hopIndex': hopIndex,
                'expectedOut': 0,
                'realisedOut': realisedOut,
                'shortfall': 0,
                'shortfallRatio': 0,
                'scale': 0,
                'verdict': 'halt',
                'reason': 'zero_expected_output',
                'resizedSteps': resized,
            };
        }
        let shortfall = expectedOut - realisedOut;
        if (shortfall < 0) {
            shortfall = 0;
        }
        const shortfallRatio = shortfall / expectedOut;
        //  the downstream hops lost `shortfall` out of this hop's whole output,
        //  not out of this leg's, so the scale is measured against the hop
        let hopExpectedOut = 0;
        //  Shortfall already reported by this hop's OTHER legs. Each leg used to compute a scale
        //  from the hop total and multiply the downstream amounts by it, so a second leg scaled an
        //  already-scaled number: 80% and 60% fills produced 0.9 x 0.8 = 0.72 of the next hop
        //  instead of the true 0.70, sizing it for more than the wallet actually received and
        //  inviting a spurious insufficient-funds halt on exactly the bridged routes this class
        //  exists for. Reproduced at 144 against a true 140 before this changed.
        let priorShortfall = 0;
        for (let i = 0; i < steps.length; i++) {
            if (this.numberAt (steps[i], 'hopIndex', 0) === hopIndex) {
                hopExpectedOut = hopExpectedOut + this.stepExpectedOut (steps[i]);
                if (this.numberAt (steps[i], 'stepIndex', -1) !== stepIndex && this.hasNumberAt (steps[i], 'realisedOut')) {
                    let legShortfall = this.stepExpectedOut (steps[i]) - this.numberAt (steps[i], 'realisedOut', 0);
                    if (legShortfall < 0) {
                        legShortfall = 0;
                    }
                    priorShortfall = priorShortfall + legShortfall;
                }
            }
        }
        //  scaleBefore is what the downstream amounts have ALREADY been multiplied by, so the
        //  factor applied here is the increment that takes them from that to the hop's true
        //  cumulative scale. With one leg per hop priorShortfall is 0, scaleBefore is 1, and this
        //  is arithmetically identical to what it replaced.
        let scaleBefore = 1;
        let scaleAfter = 1;
        if (hopExpectedOut > 0) {
            scaleBefore = (hopExpectedOut - priorShortfall) / hopExpectedOut;
            scaleAfter = (hopExpectedOut - priorShortfall - shortfall) / hopExpectedOut;
        }
        if (scaleBefore <= 0) {
            //  the hop already produced nothing; there is nothing left to scale down
            scaleBefore = 1;
            scaleAfter = 0;
        }
        let scale = scaleAfter / scaleBefore;
        if (scale > 1) {
            //  never scale UP. An overfill is good news, but growing a
            //  downstream order past the size that passed the safety check
            //  would place an order nobody ever approved.
            scale = 1;
        }
        if (scale < 0) {
            scale = 0;
        }
        for (let i = 0; i < steps.length; i++) {
            const other = steps[i];
            if (this.numberAt (other, 'hopIndex', 0) <= hopIndex) {
                continue;
            }
            const previousAmount = this.numberAt (other, 'amount', 0);
            const amount = previousAmount * scale;
            resized.push ({
                'stepIndex': this.numberAt (other, 'stepIndex', i),
                'previousAmount': previousAmount,
                'amount': amount,
                'notionalQuote': amount * this.numberAt (other, 'expectedPrice', 0),
            });
        }
        let verdict = 'proceed';
        let reason = 'within_tolerance';
        if (realisedOut <= 0) {
            verdict = 'halt';
            reason = 'nothing_filled';
        } else if (shortfallRatio > tolerance * (1 + OrderRouter.TOLERANCE)) {
            verdict = 'halt';
            reason = 'shortfall_exceeds_tolerance';
        }
        return {
            'stepIndex': stepIndex,
            'hopIndex': hopIndex,
            'expectedOut': expectedOut,
            'realisedOut': realisedOut,
            'shortfall': shortfall,
            'shortfallRatio': shortfallRatio,
            'scale': scale,
            'verdict': verdict,
            'reason': reason,
            'resizedSteps': resized,
        };
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#stepExpectedOut
     * @description how much of its output asset a step is expected to produce, gross of fees
     * @param {object} step the plan step
     * @returns {float} base units for a buy, quote units for a sell
     */
    stepExpectedOut (step: Dict): number {
        const amount = this.numberAt (step, 'amount', 0);
        if (this.stringAt (step, 'side', '') === 'buy') {
            return amount;
        }
        return amount * this.numberAt (step, 'expectedPrice', 0);
    }

    //  -----------------------------------------------------------------------
    //  PURE: buildUnwindPlan
    //  -----------------------------------------------------------------------

    /**
     * @method
     * @name OrderRouter#buildUnwindPlan
     * @description given a halted execution report, computes the reverse orders that sell each stranded residual back toward the original from-asset, on the venue that actually holds it. PURE — no I/O. NEVER automatic: the result carries requiresConfirmation and nothing in this class executes it
     * @param {object} report an execution report from execute
     * @returns {object} the unwind plan, with steps[] in reverse execution order and unresolved[] for residuals that cannot be reversed
     */
    buildUnwindPlan (report: Dict): Dict {
        const fromAsset = this.stringAt (report, 'from', '');
        const toAsset = this.stringAt (report, 'to', '');
        const slippageBps = this.numberAt (report, 'slippageBps', OrderRouter.DEFAULT_SLIPPAGE_BPS);
        const results = this.listAt (report, 'steps');
        //  net position per (exchangeId, asset). Held in an ARRAY rather than a
        //  map because the output order must be identical in six languages and
        //  map iteration order is not.
        const positions: Dict[] = [];
        for (let i = results.length - 1; i >= 0; i--) {
            const result = results[i];
            const exchangeId = this.stringAt (result, 'exchangeId', '');
            const outAsset = this.stringAt (result, 'outAsset', '');
            const outAmount = this.numberAt (result, 'outAmount', 0);
            if (outAsset !== '' && outAmount > 0) {
                this.addPosition (positions, exchangeId, outAsset, outAmount, result, true);
            }
            const inAsset = this.stringAt (result, 'inAsset', '');
            const inAmount = this.numberAt (result, 'inAmount', 0);
            if (inAsset !== '' && inAmount > 0) {
                //  what a later hop consumed on this venue is not a residual.
                //  Netting is per venue: assets sitting on a venue the route
                //  never spent them on stay stranded, because this class never
                //  moves funds between venues.
                this.addPosition (positions, exchangeId, inAsset, -inAmount, result, false);
            }
        }
        const steps: Dict[] = [];
        const unresolved: Dict[] = [];
        let residualCount = 0;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const asset = this.stringAt (position, 'asset', '');
            const amount = this.numberAt (position, 'amount', 0);
            const exchangeId = this.stringAt (position, 'exchangeId', '');
            if (amount <= 0) {
                continue;
            }
            if (asset === fromAsset) {
                //  already home
                continue;
            }
            residualCount = residualCount + 1;
            const source = this.dictAt (position, 'source');
            const symbol = this.stringAt (source, 'symbol', '');
            const sourceSide = this.stringAt (source, 'side', '');
            let price = this.numberAt (source, 'averagePrice', 0);
            if (price <= 0) {
                price = this.numberAt (source, 'expectedPrice', 0);
            }
            if (symbol === '' || (sourceSide !== 'buy' && sourceSide !== 'sell')) {
                unresolved.push ({ 'exchangeId': exchangeId, 'asset': asset, 'amount': amount, 'reason': 'no_source_market' });
                continue;
            }
            if (price <= 0) {
                unresolved.push ({ 'exchangeId': exchangeId, 'asset': asset, 'amount': amount, 'reason': 'no_price' });
                continue;
            }
            //  reverse the order that created the residual: a buy left you
            //  holding base, so sell it back; a sell left you holding quote, so
            //  buy the base back with it
            let side = '';
            let unwindAmount = 0;
            let marketBase = '';
            let marketQuote = '';
            //  the counter asset is whatever the reversed order gives back,
            //  which is exactly what the original order spent
            const counterAsset = this.stringAt (source, 'inAsset', '');
            if (sourceSide === 'buy') {
                side = 'sell';
                marketBase = this.stringAt (source, 'outAsset', '');
                marketQuote = this.stringAt (source, 'inAsset', '');
            } else {
                side = 'buy';
                marketBase = this.stringAt (source, 'inAsset', '');
                marketQuote = this.stringAt (source, 'outAsset', '');
            }
            //  the limit price comes FIRST, because the buy below is sized on it.
            let limitPrice = 0;
            if (side === 'buy') {
                limitPrice = price * (1 + slippageBps / 10000);
            } else {
                limitPrice = price * (1 - slippageBps / 10000);
            }
            if (side === 'buy') {
                //  Size the buy on the price it is actually PLACED at, not on the
                //  expected price. A residual of 44.5 USDT sized at 0.089 is 500
                //  DOGE, but the order goes out at 0.0892225 and would need 44.61
                //  USDT to fill — 0.11 more than the venue holds. The venue rejects
                //  it for insufficient funds, or fills it partially and leaves the
                //  rest of the stranded money stranded. Dividing by limitPrice
                //  spends at most the residual.
                unwindAmount = amount / limitPrice;
            } else {
                unwindAmount = amount;
            }
            steps.push ({
                'stepIndex': steps.length,
                'exchangeId': exchangeId,
                'symbol': symbol,
                'side': side,
                //  base and quote are carried so that an unwind plan can be fed
                //  straight back into checkExecutionPlanSafety: unwinding is
                //  trading, and it is subject to whatever cap the caller set
                'base': marketBase,
                'quote': marketQuote,
                'asset': asset,
                'counterAsset': counterAsset,
                'amount': unwindAmount,
                'expectedPrice': price,
                'limitPrice': limitPrice,
                //  notional at the price the order is actually placed at: this
                //  plan is fed back into checkExecutionPlanSafety, and a cap that
                //  was checked against the expected price under-counts what the
                //  buy above really spends.
                'notionalQuote': unwindAmount * limitPrice,
                'reachesFrom': (counterAsset === fromAsset),
                'isDestination': (asset === toAsset),
            });
        }
        return {
            'from': fromAsset,
            'to': toAsset,
            'halted': this.boolAt (report, 'halted', false),
            'haltReason': this.stringAt (report, 'haltReason', ''),
            'residualCount': residualCount,
            'requiresConfirmation': true,
            'automatic': false,
            'steps': steps,
            'unresolved': unresolved,
        };
    }

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
    addPosition (positions: Dict[], exchangeId: string, asset: string, amount: number, source: Dict, produced: boolean) {
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            if (position['exchangeId'] === exchangeId && position['asset'] === asset) {
                position['amount'] = this.numberAt (position, 'amount', 0) + amount;
                if (produced && Object.keys (this.dictAt (position, 'source')).length === 0) {
                    position['source'] = source;
                }
                return;
            }
        }
        //  the source must be the step that PRODUCED the asset, never one that
        //  consumed it: reversing a step that spent your USDT would sell the
        //  wrong side of the wrong market. Walking the results backwards, the
        //  first producing step seen is the last one that ran, which is exactly
        //  the order an unwind undoes first.
        const initialSource = produced ? source : {};
        positions.push ({ 'exchangeId': exchangeId, 'asset': asset, 'amount': amount, 'source': initialSource });
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#planIdentity
     * @description the stable identity of an execution, used for the re-execution guard. options.idempotencyKey wins, then the plan's own requestId; nothing is ever invented, because a random identity defeats the point of the guard
     * @param {object} plan the plan
     * @param {object} options the execute options
     * @returns {string} the identity, or '' when neither source carries one
     */
    planIdentity (plan: Dict, options: Dict): string {
        //  A caller-supplied idempotencyKey WINS over the plan's own requestId. Passing one is
        //  a deliberate statement about what this execution is, and it is the only identity a
        //  hand-assembled plan can have: execute() takes any dictionary of the plan shape, not
        //  only the output of buildExecutionPlan, and a plan a user built themselves never went
        //  through a routing request and so never had a requestId.
        const idempotencyKey = this.stringAt (options, 'idempotencyKey', '');
        if (idempotencyKey !== '') {
            return idempotencyKey;
        }
        //  otherwise requestId, the one field a routed plan carries that is meant to be unique;
        //  it survives JSON, storage and a hand-rebuilt tail of a halted route. Nothing is
        //  invented when both are absent — a generated identity would be either random, which
        //  defeats the guard that depends on it, or a fingerprint of the plan's contents,
        //  which makes two plans that happen to agree indistinguishable. Absence is reported,
        //  and execute refuses.
        return this.stringAt (plan, 'requestId', '');
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#hasExecutedPlan
     * @description reports whether this instance has executed the given plan id recently enough for the bounded ledger to still remember it
     * @param {string} planId the plan identity from planIdentity
     * @returns {bool} true when the id is still in the ledger
     */
    hasExecutedPlan (planId: string): boolean {
        //  a key lookup, not a scan: the ledger is capped but still up to
        //  MAX_EXECUTED_PLAN_IDS long, and this runs on every live execution
        return this.executedPlanIdSet[planId] !== undefined;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#recordExecutedPlan
     * @description records one plan id in the bounded ledger, evicting the oldest entry when the cap is reached
     * @param {string} planId the plan identity from planIdentity
     * @returns {undefined}
     */
    recordExecutedPlan (planId: string) {
        if (this.hasExecutedPlan (planId)) {
            //  already recorded; re-recording it would move it in the FIFO order and let a
            //  repeatedly re-executed plan keep other ids alive or evict them out of turn
            return;
        }
        this.executedPlanIds.push (planId);
        this.executedPlanIdSet[planId] = true;
        while (this.executedPlanIds.length > OrderRouter.MAX_EXECUTED_PLAN_IDS) {
            //  FIFO: the OLDEST execution is the one whose duplicate is least likely still
            //  in flight. Evicting it drops the refusal for that plan — see the comment on
            //  MAX_EXECUTED_PLAN_IDS; this is a bounded memory promise, not a stronger
            //  idempotency one.
            const evicted = this.executedPlanIds[0];
            this.executedPlanIds = this.executedPlanIds.slice (1);
            delete this.executedPlanIdSet[evicted];
        }
    }

    //  -----------------------------------------------------------------------
    //  IMPURE: execute
    //  -----------------------------------------------------------------------

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
     * @param {int} [options.retryFailedSteps] how many times to re-place a step the venue DEFINITIVELY REJECTED, default 0. An outcome_unknown step is never retried at any setting: it may already be a live position, and re-placing it is the double-fill this class exists to prevent. The router sets no client order id, so a retry is a fresh order to the venue
     * @param {int} [options.retryDelayMs] how long to wait before a retry, default 1000
     * @param {function} [options.onStep] called after each step completes and reconciles, never mid-order, with one event object describing that step. Return 'halt' to stop the route cleanly (haltReason becomes halted_by_on_step); any other value continues. It can only STOP a route, never resume one already halted. Do NO network I/O here — it sits between orders on the money path. A hook that throws is recorded as on_step_hook_failed and the run continues, because losing the report would destroy the only account of orders that are already live
     * @returns {object} an execution report with per-step results, openOrders, errors and the halt verdict
     */
    async execute (plan: Dict, venues: Dict, options: Dict = {}): Promise<Dict> {
        const requestedStrategy = this.stringAt (options, 'strategy', 'dry_run');
        if (KNOWN_STRATEGIES.indexOf (requestedStrategy) < 0) {
            throw new BadRequest ('OrderRouter: unknown execution strategy ' + requestedStrategy);
        }
        const live = (options['live'] === true);
        //  THE default. Anything short of an explicit true is a rehearsal.
        const strategy = live ? requestedStrategy : 'dry_run';
        const steps = this.cloneSteps (plan);
        const report = this.emptyReport (plan, strategy, requestedStrategy, live, steps);
        //  resolved from BOTH the plan and the options, so a hand-assembled plan can carry an
        //  identity too; reported on every report, rehearsals included
        const planId = this.planIdentity (plan, options);
        report['planId'] = planId;
        //  How old the prices in this plan are. ALWAYS reported, even when nothing is enforced:
        //  a plan is a snapshot of a book, and how stale that snapshot is decides whether any
        //  number in it means anything. -1 when the route carried no calculatedAt, which is not
        //  the same as "fresh" and must not read like it.
        const calculatedAt = this.numberAt (plan, 'calculatedAt', 0);
        const planAgeMs = (calculatedAt > 0) ? (this.nowMs () - calculatedAt) : -1;
        report['planAgeMs'] = planAgeMs;
        //  Enforced only if asked for, at whatever value is asked for — the same shape as
        //  maxNotionalUsd, and for the same reason: this class does not decide how stale a plan
        //  the caller may trade on. But an age that cannot be determined BLOCKS under an active
        //  limit, because a freshness check that silently passes when the timestamp is missing is
        //  not a freshness check.
        const maxPlanAgeMs = this.numberAt (options, 'maxPlanAgeMs', 0);
        if (live && maxPlanAgeMs > 0) {
            if (planAgeMs < 0) {
                throw new ExchangeError ('OrderRouter: refusing to execute, the plan carries no calculatedAt and maxPlanAgeMs was set');
            }
            if (planAgeMs > maxPlanAgeMs) {
                throw new ExchangeError ('OrderRouter: refusing to execute a plan older than maxPlanAgeMs, recompute the route');
            }
        }
        if (strategy === 'dry_run') {
            //  not one call is made against a venue on this path, not even a read
            report['wouldPlaceOrders'] = steps.length;
            return report;
        }
        if (Object.keys (venues).length === 0) {
            throw new ArgumentsRequired ('OrderRouter.execute requires a venues dictionary when live');
        }
        //  IDEMPOTENCY, half one: a plan this instance has already run live is REFUSED, and
        //  refused here — before a single read reaches a venue. The ledger is consulted now and
        //  written only once the plan is about to be dispatched, so a caller error that placed
        //  nothing does not burn the plan. dry_run never reaches this line and never consumes a
        //  plan, because a rehearsal places nothing.
        if (planId === '') {
            //  no identity means no idempotency: the ledger below cannot key on it, so a
            //  re-run of this plan would be indistinguishable from a first run. Refused
            //  rather than papered over with an invented id.
            throw new BadRequest ('OrderRouter: refusing to execute live without an identity, the plan carries no requestId — pass options.idempotencyKey');
        }
        if (options['allowReexecution'] !== true) {
            if (this.hasExecutedPlan (planId)) {
                throw new BadRequest ('OrderRouter: refusing to re-execute a plan this instance already executed, pass allowReexecution to override');
            }
        }
        //  derived from the steps about to be executed, NEVER read off the
        //  plan: a plan that travelled through JSON, a persisted step list or a
        //  hand-rebuilt tail of a halted route can be missing hopCount, and a
        //  refusal that a missing key switches off is not a refusal
        const hopCount = this.hopCountOf (steps);
        if (strategy === 'best_effort') {
            if (hopCount > 1) {
                //  best-effort multi-hop is the most reliable way to strand
                //  money in a bridge asset
                throw new NotSupported ('OrderRouter: best_effort refuses multi-hop routes');
            }
            if (options['acknowledgeDispersion'] !== true) {
                throw new BadRequest ('OrderRouter: best_effort requires acknowledgeDispersion');
            }
            if (this.numberAt (options, 'maxOrders', 0) <= 0) {
                throw new BadRequest ('OrderRouter: best_effort requires a positive maxOrders');
            }
        }
        if (strategy === 'limit_protected') {
            //  Refused HERE, before a single order is placed, because the alternative is worse
            //  than a bad interval: the poll loop advances its clock by this value, so a zero or
            //  negative one never reaches the timeout. It spins on fetchOrder forever with a real
            //  order resting on a real venue, and the timeout that exists to cancel that order
            //  never arrives.
            if (this.hasNumberAt (options, 'pollIntervalMs') && this.numberAt (options, 'pollIntervalMs', 0) <= 0) {
                throw new BadRequest ('OrderRouter: pollIntervalMs must be positive, a resting order is polled on that clock');
            }
        }
        //  markets are needed for the safety check and for precision snapping
        const markets: Dict = {};
        const exchangeIds = Object.keys (venues);
        exchangeIds.sort ();
        for (let i = 0; i < exchangeIds.length; i++) {
            const exchangeId = exchangeIds[i];
            const venue = venues[exchangeId];
            if (Object.keys (this.dictAt (venue, 'markets')).length === 0) {
                await venue.loadMarkets ();
            }
            markets[exchangeId] = this.dictAt (venue, 'markets');
        }
        const usdRates = this.dictAt (options, 'usdRates');
        const safetyOptions: Dict = {
            'usdRates': usdRates,
            'maxNotionalUsd': this.numberAt (options, 'maxNotionalUsd', this.maxNotionalUsd),
            'precisionMode': this.stringAt (options, 'precisionMode', 'tick_size'),
        };
        const violations = this.checkExecutionPlanSafety (plan, markets, safetyOptions);
        let blockers = '';
        for (let i = 0; i < violations.length; i++) {
            if (this.boolAt (violations[i], 'blocking', false)) {
                if (blockers !== '') {
                    blockers = blockers + ', ';
                }
                blockers = blockers + this.stringAt (violations[i], 'code', '');
            }
        }
        if (blockers !== '') {
            //  thrown, not reported. A refusal a caller can forget to read is
            //  not a refusal.
            throw new ExchangeError ('OrderRouter: refusing to execute, blocking safety violations: ' + blockers);
        }
        if (strategy === 'atomic_ish') {
            await this.assertPrefunded (steps, venues);
        }
        //  the ledger is written BEFORE the first order goes out, never after: a run that
        //  throws half way through has still placed orders, and a guard that only records
        //  completed runs would wave through exactly the retry that double-fills.
        this.recordExecutedPlan (planId);
        if (strategy === 'parallel_within_hop') {
            await this.executeParallelWithinHop (report, steps, venues, options, usdRates);
        } else if (strategy === 'best_effort') {
            await this.executeBestEffort (report, steps, venues, options, usdRates);
        } else {
            //  sequential, limit_protected and atomic_ish all walk the plan one
            //  order at a time; they differ in how a single order is placed and
            //  in whether they lean on the previous hop's proceeds
            await this.executeSequential (report, steps, venues, options, usdRates, strategy);
        }
        this.summariseReport (report, steps);
        return report;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#hopCountOf
     * @description counts the distinct hops a step list spans, which is the only authority on whether a plan is multi-hop
     * @param {object[]} steps the working steps
     * @returns {int} the number of distinct hopIndex values
     */
    hopCountOf (steps: Dict[]): number {
        //  an array rather than a map, so the count is the same in six
        //  languages and does not depend on hash iteration order
        const seen: number[] = [];
        for (let i = 0; i < steps.length; i++) {
            const hopIndex = this.numberAt (steps[i], 'hopIndex', 0);
            let found = false;
            for (let j = 0; j < seen.length; j++) {
                if (seen[j] === hopIndex) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                seen.push (hopIndex);
            }
        }
        return seen.length;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#cloneSteps
     * @description copies a plan's steps so that execution-time resizing never mutates the caller's plan
     * @param {object} plan the plan
     * @returns {object[]} a fresh array of fresh step dictionaries
     */
    cloneSteps (plan: Dict): Dict[] {
        const steps = this.listAt (plan, 'steps');
        const copies: Dict[] = [];
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            copies.push ({
                'stepIndex': this.numberAt (step, 'stepIndex', i),
                'hopIndex': this.numberAt (step, 'hopIndex', 0),
                'legIndex': this.numberAt (step, 'legIndex', 0),
                'exchangeId': this.stringAt (step, 'exchangeId', ''),
                'symbol': this.stringAt (step, 'symbol', ''),
                'side': this.stringAt (step, 'side', ''),
                'base': this.stringAt (step, 'base', ''),
                'quote': this.stringAt (step, 'quote', ''),
                'amount': this.numberAt (step, 'amount', 0),
                'expectedPrice': this.numberAt (step, 'expectedPrice', 0),
                'effectivePrice': this.numberAt (step, 'effectivePrice', 0),
                'limitPrice': this.stepLimitPrice (step),
                'notionalQuote': this.stepNotionalQuote (step),
            });
        }
        return copies;
    }

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
    emptyReport (plan: Dict, strategy: string, requestedStrategy: string, live: boolean, steps: Dict[]): Dict {
        const results: Dict[] = [];
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            results.push ({
                'stepIndex': this.numberAt (step, 'stepIndex', i),
                'hopIndex': this.numberAt (step, 'hopIndex', 0),
                'legIndex': this.numberAt (step, 'legIndex', 0),
                'exchangeId': this.stringAt (step, 'exchangeId', ''),
                'symbol': this.stringAt (step, 'symbol', ''),
                'side': this.stringAt (step, 'side', ''),
                'status': 'planned',
                'requestedAmount': this.numberAt (step, 'amount', 0),
                'filledAmount': 0,
                'averagePrice': 0,
                'expectedPrice': this.numberAt (step, 'expectedPrice', 0),
                'cost': 0,
                'inAsset': '',
                'inAmount': 0,
                'outAsset': '',
                'outAmount': 0,
                'orderId': '',
                'clientOrderId': '',
                'errorCode': '',
                //  which retry produced this result; 0 unless retryFailedSteps re-placed it
                'attempt': 0,
            });
        }
        return {
            //  a placeholder: execute resolves the real identity from the plan AND the
            //  options and overwrites it before anything reads this field
            'planId': '',
            'strategy': strategy,
            'requestedStrategy': requestedStrategy,
            'dryRun': (strategy === 'dry_run'),
            'live': live,
            'from': this.stringAt (plan, 'from', ''),
            'to': this.stringAt (plan, 'to', ''),
            'slippageBps': this.numberAt (plan, 'slippageBps', OrderRouter.DEFAULT_SLIPPAGE_BPS),
            'reconcileToleranceRatio': this.numberAt (plan, 'reconcileToleranceRatio', OrderRouter.DEFAULT_RECONCILE_TOLERANCE),
            'stepCount': steps.length,
            'wouldPlaceOrders': 0,
            'ordersPlaced': 0,
            'halted': false,
            'haltReason': '',
            'haltStepIndex': -1,
            'filledIn': 0,
            'filledOut': 0,
            'steps': results,
            'openOrders': [],
            'errors': [],
            'reconciliations': [],
        };
    }

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
    async executeSequential (report: Dict, steps: Dict[], venues: Dict, options: Dict, usdRates: Dict, strategy: string) {
        const results = this.listAt (report, 'steps');
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const result = await this.placeStepWithRetry (step, venues, options, usdRates, strategy, report);
            results[i] = result;
            const status = this.stringAt (result, 'status', '');
            if (status === 'failed' || status === 'outcome_unknown') {
                report['halted'] = true;
                //  An unknown outcome must NOT fall through to reconciliation. Reconciling reads
                //  outAmount, which is 0 because nothing was observed, and reports the halt as
                //  'nothing_filled' — asserting the one thing we do not know. The route stops
                //  either way; the difference is whether the operator is told a position may exist.
                report['haltReason'] = (status === 'failed') ? 'order_failed' : 'outcome_unknown';
                report['haltStepIndex'] = i;
                //  the hook is told about a halt it did not cause, and cannot undo it
                this.callOnStep (options, report, result, {}, i, steps.length);
                this.markRemainingSkipped (results, i + 1);
                return;
            }
            const reconciliation = this.reconcileExecutionStep ({ 'steps': steps, 'reconcileToleranceRatio': this.numberAt (report, 'reconcileToleranceRatio', OrderRouter.DEFAULT_RECONCILE_TOLERANCE) }, i, this.numberAt (result, 'outAmount', 0));
            report['reconciliations'].push (reconciliation);
            if (strategy !== 'atomic_ish') {
                //  atomic_ish is pre-funded end to end, so a hop's shortfall
                //  does not shrink the next hop's order — the money for it was
                //  already there before the first order went out
                this.applyResize (steps, reconciliation);
            }
            if (this.stringAt (reconciliation, 'verdict', '') === 'halt') {
                report['halted'] = true;
                report['haltReason'] = this.stringAt (reconciliation, 'reason', '');
                report['haltStepIndex'] = i;
                this.callOnStep (options, report, result, reconciliation, i, steps.length);
                this.markRemainingSkipped (results, i + 1);
                return;
            }
            //  the caller's own verdict, consulted only once the route is otherwise sound. It can
            //  stop the route; it cannot restart one the reconciliation above already stopped.
            if (this.callOnStep (options, report, result, reconciliation, i, steps.length) === 'halt') {
                report['halted'] = true;
                report['haltReason'] = 'halted_by_on_step';
                report['haltStepIndex'] = i;
                this.markRemainingSkipped (results, i + 1);
                return;
            }
        }
    }

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
    async executeParallelWithinHop (report: Dict, steps: Dict[], venues: Dict, options: Dict, usdRates: Dict) {
        const results = this.listAt (report, 'steps');
        let cursor = 0;
        while (cursor < steps.length) {
            const hopIndex = this.numberAt (steps[cursor], 'hopIndex', 0);
            let end = cursor;
            while (end < steps.length && this.numberAt (steps[end], 'hopIndex', 0) === hopIndex) {
                end = end + 1;
            }
            const pending = [];
            //  THE CONTRACT: concurrent ACROSS venues, serialised WITHIN a venue. It is an
            //  ordering guarantee, not a performance promise, which is what lets six very
            //  different runtimes honour the same words. It used to mean three different things:
            //  TypeScript overlapped every leg on one event loop, PHP ran them in a plain
            //  sequential loop with a comment rationalising it, and Python fanned out one thread
            //  per LEG against caller-supplied sync exchange instances — so two legs on the same
            //  venue mutated that instance's throttle and nonce state with no lock.
            //
            //  Grouping by exchangeId fixes all three at once: nobody ever has two orders in
            //  flight on one instance, and a language with no concurrency (PHP) satisfies the
            //  contract by running the groups one after another.
            const venueGroups: string[] = [];
            const groupedIndices: number[][] = [];
            for (let i = cursor; i < end; i++) {
                const exchangeId = this.stringAt (steps[i], 'exchangeId', '');
                let groupIndex = -1;
                for (let g = 0; g < venueGroups.length; g++) {
                    if (venueGroups[g] === exchangeId) {
                        groupIndex = g;
                        break;
                    }
                }
                if (groupIndex === -1) {
                    venueGroups.push (exchangeId);
                    groupedIndices.push ([ i ]);
                } else {
                    groupedIndices[groupIndex].push (i);
                }
            }
            for (let g = 0; g < groupedIndices.length; g++) {
                //  placeStep contains its own failures and never rejects, so "wait for all" means
                //  the same thing in all six languages. Without that containment JavaScript
                //  rejects fast while sibling orders are still live, and Go's promiseAll waits for
                //  every one — the same source abandoning in-flight orders differently per
                //  language.
                pending.push (this.placeVenueGroup (groupedIndices[g], steps, venues, options, usdRates, report, results));
            }
            for (let g = 0; g < pending.length; g++) {
                await pending[g];
            }
            for (let i = cursor; i < end; i++) {
                const result = results[i];
                const status = this.stringAt (result, 'status', '');
                if (status === 'failed' || status === 'outcome_unknown') {
                    report['halted'] = true;
                    report['haltReason'] = (status === 'failed') ? 'order_failed' : 'outcome_unknown';
                    report['haltStepIndex'] = i;
                    this.callOnStep (options, report, result, {}, i, steps.length);
                    this.markRemainingSkipped (results, end);
                    return;
                }
                const reconciliation = this.reconcileExecutionStep ({ 'steps': steps, 'reconcileToleranceRatio': this.numberAt (report, 'reconcileToleranceRatio', OrderRouter.DEFAULT_RECONCILE_TOLERANCE) }, i, this.numberAt (result, 'outAmount', 0));
                report['reconciliations'].push (reconciliation);
                this.applyResize (steps, reconciliation);
                if (this.stringAt (reconciliation, 'verdict', '') === 'halt') {
                    report['halted'] = true;
                    report['haltReason'] = this.stringAt (reconciliation, 'reason', '');
                    report['haltStepIndex'] = i;
                    this.callOnStep (options, report, result, reconciliation, i, steps.length);
                    this.markRemainingSkipped (results, end);
                    return;
                }
                if (this.callOnStep (options, report, result, reconciliation, i, steps.length) === 'halt') {
                    report['halted'] = true;
                    report['haltReason'] = 'halted_by_on_step';
                    report['haltStepIndex'] = i;
                    this.markRemainingSkipped (results, end);
                    return;
                }
            }
            cursor = end;
        }
    }

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
    async placeVenueGroup (indices: number[], steps: Dict[], venues: Dict, options: Dict, usdRates: Dict, report: Dict, results: Dict[]) {
        //  strictly one at a time: this is the "serialised within a venue" half of the contract
        for (let i = 0; i < indices.length; i++) {
            const stepPosition = indices[i];
            results[stepPosition] = await this.placeStepWithRetry (steps[stepPosition], venues, options, usdRates, 'parallel_within_hop', report);
        }
    }

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
    async executeBestEffort (report: Dict, steps: Dict[], venues: Dict, options: Dict, usdRates: Dict) {
        const results = this.listAt (report, 'steps');
        const maxOrders = this.numberAt (options, 'maxOrders', 0);
        let placed = 0;
        for (let i = 0; i < steps.length; i++) {
            if (placed >= maxOrders) {
                results[i]['status'] = 'skipped';
                results[i]['errorCode'] = 'max_orders_reached';
                continue;
            }
            results[i] = await this.placeStepWithRetry (steps[i], venues, options, usdRates, 'best_effort', report);
            placed = placed + 1;
            //  no reconciliation and no halt: that is the whole point of the
            //  strategy, and why it is refused on anything but a single hop. The hook is still
            //  offered every step, and stopping early is the one thing it may do here — that is
            //  a smaller commitment than the strategy's own contract, never a larger one.
            if (this.callOnStep (options, report, results[i], {}, i, steps.length) === 'halt') {
                report['halted'] = true;
                report['haltReason'] = 'halted_by_on_step';
                report['haltStepIndex'] = i;
                this.markRemainingSkipped (results, i + 1);
                return;
            }
        }
    }

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
    async placeStepWithRetry (step: Dict, venues: Dict, options: Dict, usdRates: Dict, strategy: string, report: Dict): Promise<Dict> {
        const maxRetries = this.numberAt (options, 'retryFailedSteps', 0);
        const retryDelayMs = this.numberAt (options, 'retryDelayMs', OrderRouter.DEFAULT_RETRY_DELAY_MS);
        let attempt = 0;
        let result: Dict = {};
        for (;;) {
            step['attempt'] = attempt;
            result = await this.placeStep (step, venues, options, usdRates, strategy, report);
            const status = this.stringAt (result, 'status', '');
            //  'failed' is the ONLY retryable outcome, and the distinction is the whole safety
            //  argument. A failed step was refused by the venue: nothing was placed, so placing
            //  it again cannot double-fill. An 'outcome_unknown' step may ALREADY be a live
            //  position that simply could not be read back, and re-placing that is precisely the
            //  double-fill this class exists to prevent. It is never retried, at any setting.
            if (status !== 'failed' || attempt >= maxRetries) {
                return result;
            }
            attempt = attempt + 1;
            if (retryDelayMs > 0) {
                await this.sleep (retryDelayMs);
            }
        }
    }

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
    callOnStep (options: Dict, report: Dict, result: Dict, reconciliation: Dict, stepIndex: number, stepsTotal: number): string {
        if (options['onStep'] === undefined) {
            return '';
        }
        const event: Dict = {
            'planId': this.stringAt (report, 'planId', ''),
            'stepIndex': stepIndex,
            'hopIndex': this.numberAt (result, 'hopIndex', 0),
            'legIndex': this.numberAt (result, 'legIndex', 0),
            'exchangeId': this.stringAt (result, 'exchangeId', ''),
            'symbol': this.stringAt (result, 'symbol', ''),
            'side': this.stringAt (result, 'side', ''),
            'status': this.stringAt (result, 'status', ''),
            'requestedAmount': this.numberAt (result, 'requestedAmount', 0),
            'filledAmount': this.numberAt (result, 'filledAmount', 0),
            'outAsset': this.stringAt (result, 'outAsset', ''),
            'outAmount': this.numberAt (result, 'outAmount', 0),
            'orderId': this.stringAt (result, 'orderId', ''),
            'clientOrderId': this.stringAt (result, 'clientOrderId', ''),
            'errorCode': this.stringAt (result, 'errorCode', ''),
            'attempt': this.numberAt (result, 'attempt', 0),
            'reconciliation': reconciliation,
            'ordersPlaced': this.numberAt (report, 'ordersPlaced', 0),
            'halted': this.boolAt (report, 'halted', false),
            'haltReason': this.stringAt (report, 'haltReason', ''),
            'stepsTotal': stepsTotal,
            'stepsRemaining': stepsTotal - (stepIndex + 1),
        };
        try {
            const verdict = options['onStep'] (event);
            if (verdict === 'halt') {
                return 'halt';
            }
            return '';
        } catch (e) {
            //  A hook that throws must NOT take the run with it. Everything placed so far is
            //  recorded in this report, and losing it to an exception raised by observability
            //  code would destroy the only account of orders that are already live. The failure
            //  is recorded and the run proceeds exactly as if the hook had no opinion.
            this.recordError (report, stepIndex, this.stringAt (result, 'exchangeId', ''), this.stringAt (result, 'symbol', ''), 'on_step_hook_failed:' + this.errorCodeOf (e));
            return '';
        }
    }

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
    async placeStep (step: Dict, venues: Dict, options: Dict, usdRates: Dict, strategy: string, report: Dict): Promise<Dict> {
        const stepIndex = this.numberAt (step, 'stepIndex', 0);
        const exchangeId = this.stringAt (step, 'exchangeId', '');
        const symbol = this.stringAt (step, 'symbol', '');
        const side = this.stringAt (step, 'side', '');
        const result: Dict = {
            'stepIndex': stepIndex,
            'hopIndex': this.numberAt (step, 'hopIndex', 0),
            'legIndex': this.numberAt (step, 'legIndex', 0),
            'exchangeId': exchangeId,
            'symbol': symbol,
            'side': side,
            'status': 'failed',
            'requestedAmount': this.numberAt (step, 'amount', 0),
            'filledAmount': 0,
            'averagePrice': 0,
            'expectedPrice': this.numberAt (step, 'expectedPrice', 0),
            'cost': 0,
            'inAsset': '',
            'inAmount': 0,
            'outAsset': '',
            'outAmount': 0,
            'orderId': '',
            'clientOrderId': '',
            'errorCode': '',
            //  false until an order is actually dispatched; see the assignment in the try below
            'placementAttempted': false,
        };
        try {
            const venue = venues[exchangeId];
            if (venue === undefined || venue === null) {
                result['errorCode'] = 'venue_missing';
                this.recordError (report, stepIndex, exchangeId, symbol, 'venue_missing');
                return result;
            }
            const amount = this.parseNumber (venue.amountToPrecision (symbol, this.numberAt (step, 'amount', 0)), 0);
            const price = this.parseNumber (venue.priceToPrecision (symbol, this.stepLimitPrice (step)), 0);
            if (!(amount > 0) || !(price > 0)) {
                result['errorCode'] = 'rounded_to_zero';
                this.recordError (report, stepIndex, exchangeId, symbol, 'rounded_to_zero');
                return result;
            }
            //  CLAUDE.md: compute the notional before EVERY createOrder. The
            //  plan-level check already ran, but the plan can have been resized
            //  by a reconciliation since, and the snapped price is not the one
            //  that was checked.
            this.assertUnderCap (step, amount, price, usdRates, options);
            const orderParams: Dict = {};
            const extra = this.dictAt (options, 'orderParams');
            const extraKeys = Object.keys (extra);
            for (let i = 0; i < extraKeys.length; i++) {
                orderParams[extraKeys[i]] = extra[extraKeys[i]];
            }
            //  No clientOrderId is set here. Whatever the caller put in options.orderParams
            //  travels as-is, and each exchange's createOrder keeps sending whatever identifier
            //  it generates on its own; the id the venue reports back is recorded on the result
            //  once the order returns. (An id derived from the plan identity used to be forced
            //  onto every step, but venues disagree on its length and charset, so it was
            //  rejected exactly where it mattered.)
            const attempt = this.numberAt (step, 'attempt', 0);
            result['attempt'] = attempt;
            let order: Dict = {};
            if (strategy === 'limit_protected') {
                order = await this.placeProtectedLimit (venue, step, symbol, side, amount, price, orderParams, options, report, result);
            } else {
                order = await this.placeImmediateOrder (venue, symbol, side, amount, price, orderParams, options, result);
            }
            result['orderId'] = this.stringAt (order, 'id', '');
            result['clientOrderId'] = this.stringAt (order, 'clientOrderId', '');
            //  "the venue said zero" and "the venue said nothing" are different facts and used to
            //  produce the same number. A venue that omits `filled` yielded 0, reconciliation read
            //  that as nothing_filled and halted the route — while a real position sat on a real
            //  venue. So presence is tested, not the value.
            if (!this.hasNumberAt (order, 'filled') && result['orderId'] !== '') {
                //  One re-read, exactly as placeProtectedLimit already does after its poll. The
                //  immediate path never did, so it could only ever fabricate. Costs one call and
                //  only on venues that answered incompletely.
                order = await this.refetchOrder (venue, this.stringAt (result, 'orderId', ''), symbol, order);
            }
            //  An order the venue explicitly calls open is RESTING, and on this path it must
            //  not be: placeImmediateOrder asked for immediate-or-cancel, so a venue that
            //  silently dropped the timeInForce param has left a plain limit order sitting on
            //  the book. Recording it and walking on was not enough — the next hop then trades
            //  on top of a position that keeps growing behind it, is sized from a fill that is
            //  already out of date, and the leftover order is still live after the route has
            //  ended and nobody is watching it. So it is cancelled and re-read here, exactly as
            //  placeProtectedLimit does on its timeout path.
            let restingCancelFailed = false;
            if (strategy !== 'limit_protected' && this.stringAt (order, 'status', '') === 'open' && result['orderId'] !== '') {
                try {
                    await venue.cancelOrder (this.stringAt (result, 'orderId', ''), symbol);
                    //  ALWAYS re-read after a cancel: the cancel and the fill can cross, and the
                    //  observed order is the only authority on what actually happened
                    order = await this.refetchOrder (venue, this.stringAt (result, 'orderId', ''), symbol, order);
                } catch (e) {
                    //  the order may still be live and its fill can still move, so whatever this
                    //  step reports below is a snapshot that is already stale. The status is
                    //  downgraded after the amounts are filled in, not here: a cost the venue DID
                    //  report is a fact, and buildUnwindPlan subtracts it.
                    restingCancelFailed = true;
                }
            }
            const filledKnown = this.hasNumberAt (order, 'filled');
            const filled = this.numberAt (order, 'filled', 0);
            const averageKnown = this.hasNumberAt (order, 'average') || this.hasNumberAt (order, 'price');
            let average = this.numberAt (order, 'average', 0);
            if (average <= 0) {
                average = this.numberAt (order, 'price', 0);
            }
            if (average <= 0) {
                average = price;
            }
            const costKnown = this.hasNumberAt (order, 'cost');
            let cost = this.numberAt (order, 'cost', 0);
            if (cost <= 0) {
                cost = filled * average;
            }
            result['filledAmount'] = filled;
            result['averagePrice'] = average;
            result['cost'] = cost;
            //  Companion flags, per the file's own "was it known" rule. A false here means the
            //  number beside it is this class's best guess, not the venue's answer.
            result['filledKnown'] = filledKnown;
            result['averageKnown'] = averageKnown;
            result['costKnown'] = costKnown;
            if (side === 'buy') {
                result['inAsset'] = this.stringAt (step, 'quote', '');
                result['inAmount'] = cost;
                result['outAsset'] = this.stringAt (step, 'base', '');
                result['outAmount'] = filled;
            } else {
                result['inAsset'] = this.stringAt (step, 'base', '');
                result['inAmount'] = filled;
                result['outAsset'] = this.stringAt (step, 'quote', '');
                result['outAmount'] = cost;
            }
            //  Net the taker fee out of what is actually CARRIED FORWARD, when the venue charged
            //  it in the asset this step produced. filled and cost are gross of fees — the manual
            //  says so — so a venue taking its cut in the acquired asset credits less than
            //  `filled`, and sizing the next hop (or an unwind) on the gross figure orders more
            //  than the wallet holds. Fees in any OTHER currency are left alone: they do not
            //  reduce what this hop hands to the next one.
            const feeCost = this.orderFeeInAsset (order, this.stringAt (result, 'outAsset', ''));
            result['feeCost'] = feeCost;
            result['feeCurrency'] = this.stringAt (result, 'outAsset', '');
            if (feeCost > 0) {
                let net = this.numberAt (result, 'outAmount', 0) - feeCost;
                if (net < 0) {
                    net = 0;
                }
                result['grossOutAmount'] = this.numberAt (result, 'outAmount', 0);
                result['outAmount'] = net;
            }
            if (!filledKnown) {
                //  Refuse to reconcile on a fabricated fill. Halting on an unknown quantity is
                //  recoverable — an operator reads the order back and resumes; sizing the next hop
                //  from an invented number is not. The halt is what prevents that, not this
                //  return: executeSequential stops on an outcome_unknown status, so nothing
                //  downstream is ever sized from what is recorded here.
                //
                //  Which is why the assets and amounts above are filled in FIRST. This block used
                //  to return before them, leaving inAsset/inAmount empty — and inAmount is what
                //  buildUnwindPlan SUBTRACTS. A buy whose venue reported a `cost` but no `filled`
                //  spent that quote for certain; dropping it left the unwind plan believing the
                //  money was still sitting on the venue and planning to route it home. "The venue
                //  said zero" and "the venue said nothing" are different facts — the same rule the
                //  refetch above exists for — and a cost the venue DID report is a fact.
                result['status'] = 'outcome_unknown';
                this.recordOpenOrder (report, exchangeId, symbol, this.stringAt (result, 'orderId', ''), 'fill_unconfirmed');
                report['ordersPlaced'] = this.numberAt (report, 'ordersPlaced', 0) + 1;
                return result;
            }
            if (filled <= 0) {
                result['status'] = 'unfilled';
            } else if (filled >= amount * (1 - OrderRouter.TOLERANCE)) {
                result['status'] = 'filled';
            } else {
                result['status'] = 'partial';
            }
            if (restingCancelFailed) {
                //  a resting order this class could not cancel is the worst outcome there is:
                //  it can still fill, in full, after the route has returned. Sizing the next hop
                //  on the fill recorded above would trade against a position that is still
                //  moving, so the step is marked unknown and executeSequential stops here.
                result['status'] = 'outcome_unknown';
                this.recordOpenOrder (report, exchangeId, symbol, this.stringAt (result, 'orderId', ''), 'cancel_failed');
            } else if (this.stringAt (order, 'status', '') === 'open') {
                //  cancelled — or on the limit_protected path, cancelled by
                //  placeProtectedLimit — and the venue STILL calls it open. The order is
                //  live whatever this class asked for, so the same rule applies: report it,
                //  and refuse to size anything downstream from a fill that can still grow.
                result['status'] = 'outcome_unknown';
                this.recordOpenOrder (report, exchangeId, symbol, this.stringAt (result, 'orderId', ''), 'still_open');
            }
            report['ordersPlaced'] = this.numberAt (report, 'ordersPlaced', 0) + 1;
            return result;
        } catch (e) {
            //  containment. A leg that throws must not take its siblings with it.
            result['status'] = 'failed';
            result['errorCode'] = this.errorCodeOf (e);
            this.recordError (report, stepIndex, exchangeId, symbol, result['errorCode']);
            //  createOrder may already have succeeded: every path between it and
            //  the final read — a poll that times out, a network drop, a cap
            //  re-check — leaves a real order on a real venue. Reporting the id
            //  is the difference between an operator who can go cancel it and
            //  one who never learns it exists.
            const knownId = this.stringAt (result, 'orderId', '');
            if (knownId !== '') {
                //  'failed' would read as "nothing happened" while openOrders says
                //  the opposite, and one report must not carry both readings.
                //  Having an id means createOrder RETURNED — the venue accepted
                //  something — so whatever threw afterwards left a real order
                //  behind whose fill is simply unknown to us.
                result['status'] = 'outcome_unknown';
                this.recordOpenOrder (report, exchangeId, symbol, knownId, 'outcome_unknown');
            } else if (this.boolAt (result, 'placementAttempted', false)
                && this.isOutcomeUnknownError (result['errorCode'])) {
                //  The order was dispatched and the venue's answer never arrived. It may well have
                //  been accepted; we simply never learned its id. Reporting that as a plain
                //  failure asserts "nothing happened", which is the one reading that is certainly
                //  wrong, so the step is marked outcome-unknown and an id-less entry goes into
                //  openOrders for an operator to reconcile by symbol and timestamp.
                //
                //  A DEFINITE rejection — insufficient funds, an invalid price, an unsupported
                //  order type — is left as 'failed' on purpose. Those are answers, not silence,
                //  and flagging every rejection as a possibly-live order would bury the ones that
                //  really are ambiguous.
                result['status'] = 'outcome_unknown';
                this.recordUnconfirmedPlacement (report, exchangeId, symbol, 'placement_unconfirmed');
            }
            return result;
        }
    }

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
    recordUnconfirmedPlacement (report: Dict, exchangeId: string, symbol: string, reason: string) {
        const openOrders = this.listAt (report, 'openOrders');
        for (let i = 0; i < openOrders.length; i++) {
            if (this.stringAt (openOrders[i], 'exchangeId', '') === exchangeId
                && this.stringAt (openOrders[i], 'symbol', '') === symbol
                && this.stringAt (openOrders[i], 'reason', '') === reason) {
                return;
            }
        }
        report['openOrders'].push ({ 'exchangeId': exchangeId, 'symbol': symbol, 'orderId': '', 'reason': reason });
    }

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
    recordOpenOrder (report: Dict, exchangeId: string, symbol: string, orderId: string, reason: string) {
        if (orderId === '') {
            //  nothing to point an operator at
            return;
        }
        const openOrders = this.listAt (report, 'openOrders');
        for (let i = 0; i < openOrders.length; i++) {
            if (this.stringAt (openOrders[i], 'orderId', '') === orderId && this.stringAt (openOrders[i], 'exchangeId', '') === exchangeId) {
                return;
            }
        }
        report['openOrders'].push ({ 'exchangeId': exchangeId, 'symbol': symbol, 'orderId': orderId, 'reason': reason });
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#errorCodeOf
     * @description names a caught exception by its class, which is the one label all six languages agree on
     * @param {object} e the caught exception
     * @returns {string} the exception class name, or unknown_error
     */
    hasNumberAt (container: Dict, key: string): boolean {
        if (container === undefined || container === null) {
            return false;
        }
        const value = container[key];
        if (value === undefined || value === null) {
            return false;
        }
        //  Deliberately the same coercion numberAt does, so "the value is usable" and "the value
        //  is present" can never disagree: a venue reporting filled as the string "0.5" has
        //  answered, and one reporting NaN or a word has not.
        if (typeof value === 'number') {
            return this.isFiniteNumber (value);
        }
        if (typeof value === 'string') {
            return this.isFiniteNumber (this.parseNumber (value, Number.NaN));
        }
        return false;
    }

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
    async refetchOrder (venue: any, orderId: string, symbol: string, fallback: Dict): Promise<Dict> {
        try {
            const reread = await venue.fetchOrder (orderId, symbol);
            if (reread === undefined || reread === null) {
                return fallback;
            }
            return reread;
        } catch (e) {
            //  the caller marks the fill unknown; a throw here must not lose the placement record
            return fallback;
        }
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#isOutcomeUnknownError
     * @description reports whether a thrown error leaves a placement's outcome genuinely unknown
     * @param {string} errorCode the error class name
     * @returns {bool} true when the request may or may not have reached the venue
     */
    orderFeeInAsset (order: Dict, asset: string): number {
        if (asset === '') {
            return 0;
        }
        let total = 0;
        //  ccxt reports the same cut in up to three places, so this is a strict THREE-TIER
        //  PRECEDENCE and never a sum across tiers: the `fees` list wins outright; if it named
        //  no entry in this asset, the single `fee` is read; only if that named nothing either
        //  are the per-trade fees totalled. `sawInList` is what makes each tier exclusive of
        //  the ones below it — safeOrder fills `fee` and `fees` from the same charge, and the
        //  per-trade fees are usually that same charge again, so adding tiers together would
        //  double- or triple-count. Within ONE tier every matching entry IS summed.
        const fees = this.listAt (order, 'fees');
        let sawInList = false;
        for (let i = 0; i < fees.length; i++) {
            const entry = fees[i];
            if (this.stringAt (entry, 'currency', '').toUpperCase () === asset.toUpperCase ()) {
                total = total + this.numberAt (entry, 'cost', 0);
                sawInList = true;
            }
        }
        if (!sawInList) {
            const single = this.dictAt (order, 'fee');
            if (this.stringAt (single, 'currency', '').toUpperCase () === asset.toUpperCase ()) {
                total = total + this.numberAt (single, 'cost', 0);
                sawInList = true;
            }
        }
        if (!sawInList) {
            //  Last resort: a venue that reports its cut only per trade. The Go port has no
            //  `fees` list on its typed Order at all, so this fallback is what lets all six
            //  ports read the same fee off the same order — and reading NOTHING here is the
            //  dangerous direction, not the safe one: an unread fee leaves outAmount GROSS,
            //  which sizes the next hop on money the venue already took.
            const trades = this.listAt (order, 'trades');
            for (let i = 0; i < trades.length; i++) {
                const tradeFee = this.dictAt (trades[i], 'fee');
                if (this.stringAt (tradeFee, 'currency', '').toUpperCase () === asset.toUpperCase ()) {
                    total = total + this.numberAt (tradeFee, 'cost', 0);
                }
            }
        }
        if (!this.isFiniteNumber (total) || total < 0) {
            return 0;
        }
        return total;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#isOutcomeUnknownError
     * @description reports whether a thrown error leaves a placement's outcome genuinely unknown
     * @param {string} errorCode the error class name
     * @returns {bool} true when the request may or may not have reached the venue
     */
    isOutcomeUnknownError (errorCode: string): boolean {
        //  ccxt's NetworkError family: the request failed in a way that does not tell us whether
        //  the venue processed it. Everything else in the hierarchy is the venue ANSWERING, which
        //  means no order exists. Matched by class name so the six ports agree without depending
        //  on each language's instanceof/isa mechanics.
        return errorCode === 'RequestTimeout'
            || errorCode === 'ExchangeNotAvailable'
            || errorCode === 'NetworkError'
            || errorCode === 'OnMaintenance';
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#errorCodeOf
     * @description names the class of a thrown error, for the report
     * @param {object} e the thrown value
     * @returns {string} the error class name, or unknown_error
     */
    errorCodeOf (e: any): string {
        if (e === undefined || e === null) {
            return 'unknown_error';
        }
        if (e.constructor !== undefined && e.constructor !== null && typeof e.constructor.name === 'string') {
            return e.constructor.name;
        }
        return 'unknown_error';
    }

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
    async placeImmediateOrder (venue: any, symbol: string, side: string, amount: number, price: number, orderParams: Dict, options: Dict, result: Dict): Promise<Dict> {
        if (this.venueSupportsIoc (venue)) {
            orderParams['timeInForce'] = 'IOC';
            // Set immediately before the call that can leave a real order on a real venue, and
            // never reset. Anything that fails before this point — a missing venue, a size that
            // rounds to zero, the notional cap, a venue that cannot do IOC — dispatched nothing,
            // and recording an unconfirmed placement for it would be a false alarm.
            result['placementAttempted'] = true;
            const iocOrder = await venue.createOrder (symbol, 'limit', side, amount, price, orderParams);
            result['orderId'] = this.stringAt (iocOrder, 'id', '');
            return iocOrder;
        }
        if (options['allowMarketOrders'] !== true) {
            //  a market order is an unbounded price, and switching to one on a
            //  caller's behalf is exactly the decision they did not delegate
            throw new NotSupported ('OrderRouter: venue cannot do IOC and allowMarketOrders was not set');
        }
        //  A market order and a notional cap cannot both be honoured. assertUnderCap valued this
        //  order at the plan's LIMIT price, and the call below sends no price at all: the venue
        //  fills wherever the book is, which is the one thing the cap exists to bound. Passing the
        //  check and then removing the price it was computed from is a cap that silently
        //  disappears, which by this file's own rule is not a cap. So the two options are refused
        //  together — lift maxNotionalUsd, or drop allowMarketOrders.
        if (this.numberAt (options, 'maxNotionalUsd', this.maxNotionalUsd) > 0) {
            throw new NotSupported ('OrderRouter: allowMarketOrders cannot be honoured under a maxNotionalUsd cap, because a market order has no price to check');
        }
        result['placementAttempted'] = true;
        const marketOrder = await venue.createOrder (symbol, 'market', side, amount, undefined, orderParams);
        result['orderId'] = this.stringAt (marketOrder, 'id', '');
        return marketOrder;
    }

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
    async placeProtectedLimit (venue: any, step: Dict, symbol: string, side: string, amount: number, price: number, orderParams: Dict, options: Dict, report: Dict, result: Dict): Promise<Dict> {
        const timeoutMs = this.numberAt (options, 'orderTimeoutMs', 20000);
        const pollIntervalMs = this.numberAt (options, 'pollIntervalMs', 1000);
        result['placementAttempted'] = true;
        let order = await venue.createOrder (symbol, 'limit', side, amount, price, orderParams);
        const orderId = this.stringAt (order, 'id', '');
        //  before the first poll, the first sleep and the first thing that can
        //  go wrong: from here on the caller can always name what is resting
        result['orderId'] = orderId;
        let waited = 0;
        while (waited < timeoutMs) {
            if (this.stringAt (order, 'status', '') === 'closed' || this.stringAt (order, 'status', '') === 'canceled') {
                return order;
            }
            await this.sleep (pollIntervalMs);
            waited = waited + pollIntervalMs;
            order = await venue.fetchOrder (orderId, symbol);
        }
        const finalStatus = this.stringAt (order, 'status', '');
        if (finalStatus === 'closed' || finalStatus === 'canceled') {
            //  the venue ended it on the last poll — an expiry, a self-trade
            //  prevention, a post-only rejection of the remainder. Cancelling an
            //  order the venue already closed throws, and the partial fill this
            //  order carries is real: dropping it would hide a live position
            //  from the report AND from the unwind plan built out of it.
            return order;
        }
        try {
            await venue.cancelOrder (orderId, symbol);
        } catch (e) {
            //  the order may still be live. Reporting a fill we did not observe
            //  would be a lie, and continuing to the next hop on top of an
            //  unknown position is worse.
            this.recordOpenOrder (report, this.stringAt (step, 'exchangeId', ''), symbol, orderId, 'cancel_failed');
            throw new ExchangeError ('OrderRouter: cancelOrder failed and an order is left OPEN, refusing to proceed');
        }
        //  ALWAYS re-read after a cancel: the cancel and the fill can cross, and
        //  the observed order is the only authority on what actually happened
        return await venue.fetchOrder (orderId, symbol);
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#venueSupportsIoc
     * @description reports whether a venue is known NOT to support immediate-or-cancel
     * @param {object} venue the exchange instance
     * @returns {bool} true unless the venue's features explicitly list timeInForce values without IOC
     */
    venueSupportsIoc (venue: any): boolean {
        //  Defaults to TRUE on purpose. An unknown answer here must not fall
        //  through to a market order; a rejected IOC is a loud, cheap failure
        //  and an unintended market order is a silent, expensive one.
        const features = this.dictAt (venue, 'features');
        const spot = this.dictAt (features, 'spot');
        const createOrder = this.dictAt (spot, 'createOrder');
        //  EVERY real ccxt exchange declares this as a dictionary of booleans —
        //  { 'IOC': true, 'FOK': true, 'GTC': true, ... } — and not one declares
        //  it as a list. Reading it as a list only ever answered "empty", which
        //  is the same answer as "the venue said nothing", so the check always
        //  said yes and the market-order path below was unreachable.
        const timeInForceFlags = this.dictAt (createOrder, 'timeInForce');
        const flagKeys = Object.keys (timeInForceFlags);
        if (flagKeys.length > 0) {
            //  a venue that enumerates its time-in-force values and leaves IOC
            //  out has said no, exactly as one that says IOC: false has
            return this.boolAt (timeInForceFlags, 'IOC', false);
        }
        //  a list is still honoured, for a caller-built stub venue
        const timeInForce = this.listAt (createOrder, 'timeInForce');
        if (timeInForce.length === 0) {
            return true;
        }
        for (let i = 0; i < timeInForce.length; i++) {
            if (timeInForce[i] === 'IOC') {
                return true;
            }
        }
        return false;
    }

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
    assertUnderCap (step: Dict, amount: number, price: number, usdRates: Dict, options: Dict) {
        const cap = this.numberAt (options, 'maxNotionalUsd', this.maxNotionalUsd);
        if (cap <= 0) {
            //  no cap set, so there is nothing to enforce here
            return;
        }
        const probe: Dict = {
            'base': this.stringAt (step, 'base', ''),
            'quote': this.stringAt (step, 'quote', ''),
            'amount': amount,
        };
        const usdValue = this.notionalUsd (probe, amount * price, usdRates);
        if (usdValue <= 0) {
            throw new ExchangeError ('OrderRouter: refusing to place an order that cannot be valued in USD');
        }
        if (usdValue > cap * (1 + OrderRouter.TOLERANCE)) {
            throw new ExchangeError ('OrderRouter: refusing to place an order above the per-trade USD notional cap');
        }
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#assertPrefunded
     * @description verifies every step's input is already sitting on its venue, which is what atomic_ish actually requires
     * @param {object[]} steps the working steps
     * @param {object} venues exchangeId to exchange instance
     * @returns {undefined}
     */
    async assertPrefunded (steps: Dict[], venues: Dict) {
        //  built as an array, not a map, so the first shortfall reported is the
        //  same one in all six languages
        const required: Dict[] = [];
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const exchangeId = this.stringAt (step, 'exchangeId', '');
            const amount = this.numberAt (step, 'amount', 0);
            let asset = '';
            let needed = 0;
            if (this.stringAt (step, 'side', '') === 'buy') {
                asset = this.stringAt (step, 'quote', '');
                needed = amount * this.stepLimitPrice (step);
            } else {
                asset = this.stringAt (step, 'base', '');
                needed = amount;
            }
            let found = false;
            for (let j = 0; j < required.length; j++) {
                if (required[j]['exchangeId'] === exchangeId && required[j]['asset'] === asset) {
                    required[j]['amount'] = this.numberAt (required[j], 'amount', 0) + needed;
                    found = true;
                    break;
                }
            }
            if (!found) {
                required.push ({ 'exchangeId': exchangeId, 'asset': asset, 'amount': needed });
            }
        }
        const balances: Dict = {};
        for (let i = 0; i < required.length; i++) {
            const exchangeId = this.stringAt (required[i], 'exchangeId', '');
            if (balances[exchangeId] === undefined) {
                balances[exchangeId] = await venues[exchangeId].fetchBalance ();
            }
            const free = this.dictAt (balances[exchangeId], 'free');
            const asset = this.stringAt (required[i], 'asset', '');
            const available = this.numberAt (free, asset, 0);
            if (available < this.numberAt (required[i], 'amount', 0)) {
                //  most routes fail this, and that is the correct outcome:
                //  atomic_ish names its own hedge, because there is no
                //  cross-venue atomicity and there cannot be
                throw new InsufficientFunds ('OrderRouter: atomic_ish requires the whole route pre-funded, and ' + exchangeId + ' is short of ' + asset);
            }
        }
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#applyResize
     * @description writes a reconciliation's downstream resize back into the working steps
     * @param {object[]} steps the working steps
     * @param {object} reconciliation the result of reconcileExecutionStep
     * @returns {undefined}
     */
    applyResize (steps: Dict[], reconciliation: Dict) {
        //  Record what this leg actually produced BEFORE resizing anything. reconcileExecutionStep
        //  is pure and cannot remember across calls, so the hop's cumulative shortfall has to live
        //  on the steps themselves — this is what stops the next leg of the same hop compounding
        //  its scale onto an already-scaled amount.
        const reconciledStep = this.numberAt (reconciliation, 'stepIndex', -1);
        for (let i = 0; i < steps.length; i++) {
            if (this.numberAt (steps[i], 'stepIndex', -1) === reconciledStep) {
                steps[i]['realisedOut'] = this.numberAt (reconciliation, 'realisedOut', 0);
                break;
            }
        }
        const resized = this.listAt (reconciliation, 'resizedSteps');
        for (let i = 0; i < resized.length; i++) {
            const entry = resized[i];
            const stepIndex = this.numberAt (entry, 'stepIndex', -1);
            for (let j = 0; j < steps.length; j++) {
                if (this.numberAt (steps[j], 'stepIndex', -1) === stepIndex) {
                    steps[j]['amount'] = this.numberAt (entry, 'amount', 0);
                    steps[j]['notionalQuote'] = this.numberAt (entry, 'notionalQuote', 0);
                    break;
                }
            }
        }
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#markRemainingSkipped
     * @description marks every step from an index onwards as skipped after a halt
     * @param {object[]} results the report's step results
     * @param {int} start the first index to mark
     * @returns {undefined}
     */
    markRemainingSkipped (results: any[], start: number) {
        for (let i = start; i < results.length; i++) {
            if (this.stringAt (results[i], 'status', '') === 'planned') {
                results[i]['status'] = 'skipped';
            }
        }
    }

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
    recordError (report: Dict, stepIndex: number, exchangeId: string, symbol: string, code: string) {
        report['errors'].push ({ 'stepIndex': stepIndex, 'exchangeId': exchangeId, 'symbol': symbol, 'code': code });
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#summariseReport
     * @description totals what the first hop spent and what the last hop produced
     * @param {object} report the report
     * @param {object[]} steps the working steps
     * @returns {undefined}
     */
    summariseReport (report: Dict, steps: Dict[]) {
        const results = this.listAt (report, 'steps');
        let lastHop = 0;
        for (let i = 0; i < steps.length; i++) {
            const hopIndex = this.numberAt (steps[i], 'hopIndex', 0);
            if (hopIndex > lastHop) {
                lastHop = hopIndex;
            }
        }
        let filledIn = 0;
        let filledOut = 0;
        for (let i = 0; i < results.length; i++) {
            const hopIndex = this.numberAt (results[i], 'hopIndex', 0);
            if (hopIndex === 0) {
                filledIn = filledIn + this.numberAt (results[i], 'inAmount', 0);
            }
            if (hopIndex === lastHop) {
                filledOut = filledOut + this.numberAt (results[i], 'outAmount', 0);
            }
        }
        report['filledIn'] = filledIn;
        report['filledOut'] = filledOut;
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#nowMs
     * @description reads the wall clock, in milliseconds since the epoch
     * @returns {int} the current time
     */
    nowMs (): number {
        //  The only clock this class reads. Isolated in one overridable method so a test can pin
        //  time, and so the six ports have exactly one place each where "now" is defined.
        return Date.now ();
    }

    /**
     * @ignore
     * @method
     * @name OrderRouter#sleep
     * @description waits for a number of milliseconds
     * @param {int} milliseconds how long to wait
     * @returns {undefined}
     */
    sleep (milliseconds: number) {
        return new Promise ((resolve) => setTimeout (resolve, milliseconds));
    }
}

export default OrderRouter;

export { OrderRouter };
