package ccxt

//  ---------------------------------------------------------------------------
//  OrderRouter — a client for the CCXT order-router service, plus the pure
//  planning / safety / reconciliation layer that sits between a routing
//  recommendation and real orders.
//
//  This file is HAND-WRITTEN and is NOT produced by any transpiler. Five sibling
//  implementations mirror it method for method:
//
//      ts/src/base/OrderRouter.ts          (the reference)
//      python/ccxt/base/order_router.py
//      php/OrderRouter.php
//      cs/ccxt/base/OrderRouter.cs
//      rust/ccxt-base/src/order_router.rs
//
//  The rules that keep the six ports honest, all of them observed here:
//
//    - plain dictionaries and arrays only (map[string]any / []map[string]any),
//      never a language-specific container
//    - NO NULLS in any returned structure. 0 means "unknown number", "" means
//      "unknown string". Go has no natural null for a float64 or a string, and
//      a null that only exists in three of six languages is a divergence
//      waiting to happen
//    - never iterate a hash map to produce ORDERED output. Build slices and
//      search them linearly: Go randomises map iteration on purpose
//    - all numbers are IEEE-754 float64 and every arithmetic sequence is written
//      in a fixed order, so the six ports agree bit for bit
//    - ONE number grammar, hand-rolled in all six (see routerParseFloat). No
//      port calls its own parser: strconv.ParseFloat refuses "12abc" outright
//      where JavaScript's parseFloat reads 12, and it reports an overflowing
//      "1e400" as an error rather than a value. A cap read as 1234.5 in one
//      language and 1 in another is a cap that silently disappears
//    - NaN and +/-Inf are NOT numbers here. An infinite tolerance disables the
//      halt verdict and an infinite rate disables the cap, so both fall back to
//      the caller's default — in all six, identically
//    - violation and verdict strings are CONSTANTS, never interpolated with
//      numbers: "25" and "25.0" are the same value and different text
//
//  It talks to live venues through IExchange (exchange_typed_interface.go) and
//  never through *Exchange: on the untyped layer CreateOrder is a NotSupported
//  stub that compiles clean and panics.
//
//  This type never moves funds between venues. There is no call to any
//  funds-transfer endpoint anywhere in it, deliberately and permanently.
//  ---------------------------------------------------------------------------

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"math/big"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

//  ---------------------------------------------------------------------------
//  Static text for every violation and verdict code. Kept out of the methods so
//  that a port can copy the table verbatim and a reviewer can diff two languages
//  by eye. No number is ever interpolated into these.
//  ---------------------------------------------------------------------------

var orderRouterViolationMessages = map[string]string{
	"empty_plan":           "the plan contains no steps",
	"route_unroutable":     "the route carries an unroutableReason and must not be executed",
	"partial_fill":         "the route does not fill completely at the requested size",
	"unknown_symbol":       "the symbol is not listed on that venue",
	"market_mismatch":      "the venue market trades a different pair than the route hop says it does",
	"invalid_step":         "the step has a non-positive amount or price, or a side that is neither buy nor sell",
	"amount_below_minimum": "the amount is below the market minimum",
	"amount_above_maximum": "the amount is above the market maximum",
	"cost_below_minimum":   "the notional is below the market minimum cost",
	"price_out_of_range":   "the limit price falls outside the market price limits",
	"notional_unvaluable":  "the step cannot be valued in USD, so the notional cap cannot be enforced",
	"notional_exceeds_cap": "the notional exceeds the per-trade USD cap",
	"amount_precision":     "the amount does not sit on the market amount precision",
	"price_precision":      "the limit price does not sit on the market price precision",
}

var orderRouterKnownStrategies = []string{"dry_run", "sequential", "parallel_within_hop", "limit_protected", "best_effort", "atomic_ish"}

// the query keys forwarded to GET /route, in a fixed order so that two ports
// build a byte-identical URL
var orderRouterQueryKeys = []string{"amountIn", "amountOut", "strategy", "maxVenues", "bridges", "exchanges", "balances", "balanceMode", "includeQuotes", "includeFees", "certified", "requireFullFill", "hopPenaltyBps", "minLegNotional"}

// defaults, mirrored as constants in every port
const (
	OrderRouterDefaultBaseUrl = "https://docs.ccxt.com/router/api"

	OrderRouterDefaultTimeoutMs = 30000.0

	OrderRouterDefaultSlippageBps = 25.0

	OrderRouterDefaultReconcileTolerance = 0.02

	// OrderRouterDefaultRetryDelayMs is how long retryFailedSteps waits before re-placing a
	// step the venue rejected. A second is the shortest delay that lets a transient cause
	// clear (a rate limit window, a momentary balance lag) without turning a retry budget
	// into a burst against a venue that just said no.
	OrderRouterDefaultRetryDelayMs = 1000.0

	// OrderRouterNoCap is the default: this type does not decide how much of your
	// money you may trade. MaxNotionalUsd is an OPT-IN guardrail — set it and it is
	// honoured exactly, at whatever value you choose; leave it unset and no
	// notional check runs at all.
	//
	// It used to be a hard 25 USD ceiling that could be lowered but never raised.
	// That number came from CLAUDE.md §5.5, which governs THIS REPOSITORY'S live
	// tests against real exchanges — not the people using the library. A client
	// that refuses a 30 USD order because its own test suite is cautious is broken
	// as a product.
	OrderRouterNoCap = 0.0

	// router-side caps on the `balances` query parameter; both REJECT rather
	// than truncate server-side, so the client trims before sending
	OrderRouterMaxBalanceEntries = 64

	OrderRouterMaxBalanceChars = 4096

	// OrderRouterMaxExecutedPlanIds is how many executed plan ids the in-process
	// idempotency ledger keeps. 1024 is chosen to be far more executions than any one
	// process performs in the window where a duplicate is plausible (a retry loop, an
	// operator re-running a plan, a redelivered message), while bounding the ledger to
	// a few tens of kilobytes so a router held open for the life of a daemon cannot
	// grow without limit.
	//
	// THE TRADEOFF IS REAL AND IS NOT HIDDEN: eviction WEAKENS the guarantee. Once a
	// plan id has been pushed out by 1024 newer executions, re-executing that plan is
	// no longer refused in-process — it will be placed again, orders and all. The guard
	// is therefore "recent duplicates are refused", not "duplicates are impossible". A
	// process that needs the strong promise across restarts or beyond this window needs
	// the durable ledger the Known gaps entry calls for; until then, callers whose plans
	// must never re-execute should key idempotency at the venue themselves (a clientOrderId
	// passed in options orderParams, on venues that honour one) rather than rely on this
	// instance's memory.
	OrderRouterMaxExecutedPlanIds = 1024

	// relative tolerance for float comparisons; also the tolerance the six
	// test suites compare fixture numbers with
	OrderRouterTolerance = 1e-9

	// how long a limit_protected order is left resting, and how often it is
	// re-read while it rests
	OrderRouterDefaultOrderTimeoutMs = 20000.0

	OrderRouterDefaultPollIntervalMs = 1000.0
)

// OrderRouter is a client for the CCXT order-router service and the pure
// planning layer around it. It is NOT an Exchange and NOT an Exchange subclass:
// it calls CreateOrder on many venues at once, so a single this.Id, this.Markets
// or this.Options would refer to one arbitrary venue that need not appear in the
// route at all.
type OrderRouter struct {
	ApiKey         string
	BaseUrl        string
	TimeoutMs      float64
	MaxNotionalUsd float64

	// ExecutedPlanIds is the in-process idempotency ledger: the identity of every
	// plan this instance has already executed live. TWO structures for one ledger,
	// in every port: a FIFO slice that fixes the eviction order, and a map used as a
	// set so the membership test is a key lookup rather than a scan whose cost grows
	// with the ledger. They are written and evicted together and must never disagree.
	ExecutedPlanIds []string

	executedPlanIdSet map[string]bool

	// Transport performs the authenticated GET behind FetchRoute. It defaults
	// to (*OrderRouter).Request; Go has no method overriding, so this field is
	// how the offline test suite keeps itself off the network.
	Transport func(url string) (map[string]any, error)

	// NowMs is the only clock this class reads. A field for the same reason
	// Transport is one — Go has no method overriding — so a test can pin time.
	// nil means time.Now().
	NowMs func() float64

	httpClient *http.Client
}

// NewOrderRouter creates a client for the CCXT order-router service.
//
// config keys:
//
//	apiKey         string  the router API key, sent as the x-api-key header (required)
//	baseUrl        string  router base url, defaults to https://docs.ccxt.com/router/api
//	timeoutMs      float   request timeout in milliseconds, defaults to 30000
//	maxNotionalUsd float   per-trade USD notional cap, an opt-in guardrail; 0 (the default) means NO CAP
func NewOrderRouter(config map[string]any) (*OrderRouter, error) {
	apiKey := routerStringAt(config, "apiKey", "")
	if apiKey == "" {
		return nil, ArgumentsRequired("OrderRouter requires an apiKey")
	}
	baseUrl := routerStringAt(config, "baseUrl", OrderRouterDefaultBaseUrl)
	for len(baseUrl) > 0 && baseUrl[len(baseUrl)-1] == '/' {
		baseUrl = baseUrl[:len(baseUrl)-1]
	}
	maxNotionalUsd := routerNumberAt(config, "maxNotionalUsd", OrderRouterNoCap)
	if maxNotionalUsd < 0 {
		// a negative cap is a typo, not a policy, and silently ignoring it would
		// leave the caller believing a guardrail is in place
		return nil, BadRequest("OrderRouter maxNotionalUsd must not be negative; omit it, or pass 0, for no cap")
	}
	// 0 means NO CAP. Any positive value is honoured exactly — it is not clamped,
	// because the caller is the one who knows the size of their own trade.
	timeoutMs := routerNumberAt(config, "timeoutMs", OrderRouterDefaultTimeoutMs)
	router := &OrderRouter{
		ApiKey:          apiKey,
		BaseUrl:         baseUrl,
		TimeoutMs:       timeoutMs,
		MaxNotionalUsd:  maxNotionalUsd,
		ExecutedPlanIds: []string{},

		executedPlanIdSet: map[string]bool{},

		httpClient: &http.Client{},
	}
	router.Transport = router.Request
	router.NowMs = func() float64 { return float64(time.Now().UnixMilli()) }
	return router, nil
}

//  ---------------------------------------------------------------------------
//  small container accessors. Every port has these five; they exist so the six
//  implementations read line for line and so a missing key is never a
//  language-specific crash.
//  ---------------------------------------------------------------------------

// routerContainer narrows an untyped container to a dictionary, or nil.
func routerContainer(container any) map[string]any {
	if dict, ok := container.(map[string]any); ok {
		return dict
	}
	return nil
}

// routerNumberAt reads a numeric field out of a container, with a default for
// missing, nil and unparseable values.
func routerNumberAt(container any, key string, defaultValue float64) float64 {
	dict := routerContainer(container)
	if dict == nil {
		return defaultValue
	}
	value, present := dict[key]
	if !present || value == nil {
		return defaultValue
	}
	return routerToNumber(value, defaultValue)
}

// routerToNumber converts one untyped value to a float64, mirroring the
// reference's "a number stays, a string is parsed, anything else is the default".
func routerToNumber(value any, defaultValue float64) float64 {
	switch typed := value.(type) {
	case float64:
		// NaN and +/-Inf are not numbers this class will act on. An infinite
		// tolerance silently disables the halt verdict and an infinite rate
		// silently disables the cap, and "the default" is the only answer six
		// languages can agree on for either.
		if !routerIsFiniteNumber(typed) {
			return defaultValue
		}
		return typed
	case float32:
		if !routerIsFiniteNumber(float64(typed)) {
			return defaultValue
		}
		return float64(typed)
	case int:
		return float64(typed)
	case int8:
		return float64(typed)
	case int16:
		return float64(typed)
	case int32:
		return float64(typed)
	case int64:
		return float64(typed)
	case uint:
		return float64(typed)
	case uint8:
		return float64(typed)
	case uint16:
		return float64(typed)
	case uint32:
		return float64(typed)
	case uint64:
		return float64(typed)
	case json.Number:
		parsed, ok := routerParseFloat(typed.String())
		if !ok {
			return defaultValue
		}
		return parsed
	case string:
		parsed, ok := routerParseFloat(typed)
		if !ok {
			return defaultValue
		}
		return parsed
	}
	return defaultValue
}

// routerIsFiniteNumber reports whether a double is a real number, i.e. neither
// NaN nor an infinity.
func routerIsFiniteNumber(value float64) bool {
	if value != value {
		// the one NaN test that needs no library in any of the six
		return false
	}
	if value > 1.7976931348623157e308 || value < -1.7976931348623157e308 {
		return false
	}
	return true
}

// routerParseFloat parses the longest numeric prefix of a string, which is what
// JavaScript's parseFloat does and therefore what the reference does. Go's own
// ParseFloat refuses "12abc" where the other four languages read 12. The
// whitespace set is the six ASCII spaces and nothing else, deliberately: Python,
// PHP, C# and Go each draw the Unicode line in a different place, and a
// non-breaking space that parses in one language and not the others is drift.
func routerParseFloat(text string) (float64, bool) {
	trimmed := strings.TrimLeft(text, " \t\n\r\f\v")
	cursor := 0
	if cursor < len(trimmed) && (trimmed[cursor] == '+' || trimmed[cursor] == '-') {
		cursor = cursor + 1
	}
	digits := 0
	for cursor < len(trimmed) && trimmed[cursor] >= '0' && trimmed[cursor] <= '9' {
		cursor = cursor + 1
		digits = digits + 1
	}
	if cursor < len(trimmed) && trimmed[cursor] == '.' {
		cursor = cursor + 1
		for cursor < len(trimmed) && trimmed[cursor] >= '0' && trimmed[cursor] <= '9' {
			cursor = cursor + 1
			digits = digits + 1
		}
	}
	if digits == 0 {
		// "Infinity", "inf", "NaN", "" and a string of Arabic-Indic digits all
		// land here, in all six
		return 0, false
	}
	end := cursor
	if cursor < len(trimmed) && (trimmed[cursor] == 'e' || trimmed[cursor] == 'E') {
		exponent := cursor + 1
		if exponent < len(trimmed) && (trimmed[exponent] == '+' || trimmed[exponent] == '-') {
			exponent = exponent + 1
		}
		exponentDigits := 0
		for exponent < len(trimmed) && trimmed[exponent] >= '0' && trimmed[exponent] <= '9' {
			exponent = exponent + 1
			exponentDigits = exponentDigits + 1
		}
		if exponentDigits > 0 {
			end = exponent
		}
	}
	parsed, err := strconv.ParseFloat(trimmed[:end], 64)
	if err != nil {
		// ErrRange is NOT a parse failure. Today Go reports it only on overflow,
		// where the finite check below rejects the +/-Inf anyway; if it ever
		// reported it on underflow, discarding the value here would answer the
		// default where the other four answer a legitimate 0. Only the VALUE
		// decides whether a number came back, never the error alone.
		if !errors.Is(err, strconv.ErrRange) {
			return 0, false
		}
	}
	if !routerIsFiniteNumber(parsed) {
		// "1e400" overflows to an infinity, which is not a number the cap or the
		// tolerance may be built out of
		return 0, false
	}
	return parsed, true
}

// routerStringAt reads a string field out of a container, with a default for
// missing and nil values.
func routerStringAt(container any, key string, defaultValue string) string {
	dict := routerContainer(container)
	if dict == nil {
		return defaultValue
	}
	value, present := dict[key]
	if !present || value == nil {
		return defaultValue
	}
	if text, ok := value.(string); ok {
		return text
	}
	return defaultValue
}

// routerBoolAt reads a boolean field out of a container, with a default for
// missing and nil values.
func routerBoolAt(container any, key string, defaultValue bool) bool {
	dict := routerContainer(container)
	if dict == nil {
		return defaultValue
	}
	value, present := dict[key]
	if !present || value == nil {
		return defaultValue
	}
	if flag, ok := value.(bool); ok {
		return flag
	}
	return defaultValue
}

// routerListAt reads an array field out of a container, returning an empty slice
// when absent. It accepts both the []any a JSON decode produces and the
// []map[string]any this file produces.
func routerListAt(container any, key string) []any {
	dict := routerContainer(container)
	if dict == nil {
		return []any{}
	}
	switch value := dict[key].(type) {
	case []any:
		return value
	case []map[string]any:
		widened := make([]any, len(value))
		for i := 0; i < len(value); i++ {
			widened[i] = value[i]
		}
		return widened
	}
	return []any{}
}

// routerDictAt reads a nested dictionary out of a container, returning an empty
// dictionary when absent.
func routerDictAt(container any, key string) map[string]any {
	dict := routerContainer(container)
	if dict == nil {
		return map[string]any{}
	}
	if nested := routerContainer(dict[key]); nested != nil {
		return nested
	}
	return map[string]any{}
}

// FormatNumber renders a float64 as decimal text with no exponent, so that six
// languages produce the same string.
func (this *OrderRouter) FormatNumber(value float64) (string, error) {
	// JavaScript prints 1e-7 where Python prints 1e-07 and Go prints 1e-07;
	// a fixed 12-decimal rendering with the trailing zeros trimmed is the one
	// spelling all six languages agree on for the magnitudes a balance or an
	// amount can take.
	if math.IsNaN(value) || math.IsInf(value, 0) {
		return "0", nil
	}
	if math.Abs(value) >= 1e18 {
		// JavaScript's toFixed switches to exponent notation at 1e21 while the
		// other five languages never do. Rather than let one language send a
		// different string than the others, refuse — loudly, and at a magnitude
		// no real amount reaches.
		return "", BadRequest("OrderRouter: a number this large cannot be rendered identically in all six languages")
	}
	text := routerToFixed12(value)
	if strings.IndexByte(text, '.') >= 0 {
		for len(text) > 0 && text[len(text)-1] == '0' {
			text = text[:len(text)-1]
		}
		if len(text) > 0 && text[len(text)-1] == '.' {
			text = text[:len(text)-1]
		}
	}
	if text == "" || text == "-" || text == "-0" {
		return "0", nil
	}
	return text, nil
}

// routerToFixed12 renders a finite float64 with exactly twelve decimals, from
// the exact binary value and under JavaScript's toFixed tie rule. ECMA-262
// strips the sign BEFORE choosing n, so a tie rounds AWAY FROM ZERO on the
// magnitude: (-0.0001220703125).toFixed(12) is -0.000122070313, not -…312.
// strconv would round half to even here and disagree with the reference on every
// value that lands exactly on a half tick, 2^-13 included. The other four ports
// now implement this same rule — Python through Decimal, PHP and Rust by rounding
// an exact 53-decimal rendering, C# through BigInteger — so all six agree and the
// balances query string really is byte-identical.
func routerToFixed12(value float64) string {
	exact := new(big.Rat).SetFloat64(value)
	if exact == nil {
		return "0.000000000000"
	}
	sign := ""
	if exact.Sign() < 0 {
		sign = "-"
		exact.Neg(exact)
	}
	scale := new(big.Int).Exp(big.NewInt(10), big.NewInt(12), nil)
	scaled := new(big.Rat).Mul(exact, new(big.Rat).SetInt(scale))
	quotient, remainder := new(big.Int).QuoRem(scaled.Num(), scaled.Denom(), new(big.Int))
	twiceRemainder := new(big.Int).Lsh(remainder, 1)
	if twiceRemainder.Cmp(scaled.Denom()) >= 0 {
		quotient.Add(quotient, big.NewInt(1))
	}
	digits := quotient.String()
	for len(digits) < 13 {
		digits = "0" + digits
	}
	return sign + digits[:len(digits)-12] + "." + digits[len(digits)-12:]
}

// routerEncodeURIComponent percent-encodes exactly the bytes JavaScript's
// encodeURIComponent encodes. Go's url.QueryEscape differs (it renders a space
// as "+" and escapes "!*'()"), and a query string that differs per language
// defeats the point of a shared client.
func routerEncodeURIComponent(text string) string {
	const unreserved = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'()"
	var builder strings.Builder
	for i := 0; i < len(text); i++ {
		character := text[i]
		if strings.IndexByte(unreserved, character) >= 0 {
			builder.WriteByte(character)
		} else {
			builder.WriteString(fmt.Sprintf("%%%02X", character))
		}
	}
	return builder.String()
}

//  ---------------------------------------------------------------------------
//  I/O: the router HTTP client
//  ---------------------------------------------------------------------------

// FetchRoute asks the router how to convert one asset into another, over the
// venues and bridges it has live books for.
//
// See https://docs.ccxt.com/router/api
//
// params carries exactly one of amountIn or amountOut, plus any of strategy,
// maxVenues, exchanges, bridges, balances, balanceMode, includeQuotes,
// includeFees, certified, requireFullFill, hopPenaltyBps and minLegNotional.
//
// An unroutable pair comes back as a RouteResult carrying an unroutableReason,
// not as an error.
func (this *OrderRouter) FetchRoute(fromAsset string, toAsset string, params map[string]any) (map[string]any, error) {
	if fromAsset == "" || toAsset == "" {
		return nil, ArgumentsRequired("fetchRoute requires fromAsset and toAsset")
	}
	amountIn, hasAmountIn := params["amountIn"]
	amountOut, hasAmountOut := params["amountOut"]
	hasAmountIn = hasAmountIn && amountIn != nil
	hasAmountOut = hasAmountOut && amountOut != nil
	if hasAmountIn == hasAmountOut {
		// refused client-side for the same reason the router refuses it: a typo
		// must not become a confidently wrong route
		return nil, BadRequest("fetchRoute requires exactly one of amountIn or amountOut")
	}
	query := "from=" + routerEncodeURIComponent(strings.ToUpper(fromAsset)) + "&to=" + routerEncodeURIComponent(strings.ToUpper(toAsset))
	for i := 0; i < len(orderRouterQueryKeys); i++ {
		key := orderRouterQueryKeys[i]
		value, present := params[key]
		if !present || value == nil {
			continue
		}
		text, err := this.routerQueryValue(value)
		if err != nil {
			return nil, err
		}
		query = query + "&" + key + "=" + routerEncodeURIComponent(text)
	}
	url := this.BaseUrl + "/route?" + query
	route, err := this.Transport(url)
	if err != nil {
		return nil, err
	}
	// Stamp what THIS CLIENT asked for, client-side, so BuildExecutionPlan can check the answer
	// against the question. Everything else in the response is the server's word for it.
	route["clientRequestedFrom"] = strings.ToUpper(fromAsset)
	route["clientRequestedTo"] = strings.ToUpper(toAsset)
	return route, nil
}

// routerQueryValue renders one query parameter the way the reference does:
// booleans as true/false, numbers through FormatNumber, lists comma-joined and
// everything else through the package's own ToString.
func (this *OrderRouter) routerQueryValue(value any) (string, error) {
	switch typed := value.(type) {
	case bool:
		if typed {
			return "true", nil
		}
		return "false", nil
	case string:
		return typed, nil
	case []any:
		parts := make([]string, len(typed))
		for i := 0; i < len(typed); i++ {
			parts[i] = ToString(typed[i])
		}
		return strings.Join(parts, ","), nil
	case []string:
		return strings.Join(typed, ","), nil
	}
	number := routerToNumber(value, math.NaN())
	if !math.IsNaN(number) {
		return this.FormatNumber(number)
	}
	return ToString(value), nil
}

// Request performs the authenticated GET and maps router status codes onto CCXT
// errors. FetchRoute reaches it through the Transport field.
func (this *OrderRouter) Request(url string) (map[string]any, error) {
	timeout := time.Duration(this.TimeoutMs) * time.Millisecond
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, ExchangeNotAvailable("OrderRouter request failed: " + err.Error())
	}
	request.Header.Set("x-api-key", this.ApiKey)
	request.Header.Set("Accept", "application/json")
	response, err := this.httpClient.Do(request)
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return nil, RequestTimeout("OrderRouter request timed out after " + strconv.FormatFloat(this.TimeoutMs, 'f', -1, 64) + "ms")
		}
		return nil, ExchangeNotAvailable("OrderRouter request failed: " + err.Error())
	}
	defer response.Body.Close()
	status := response.StatusCode
	text, err := io.ReadAll(response.Body)
	if err != nil {
		if errors.Is(err, context.DeadlineExceeded) {
			return nil, RequestTimeout("OrderRouter request timed out after " + strconv.FormatFloat(this.TimeoutMs, 'f', -1, 64) + "ms")
		}
		return nil, ExchangeNotAvailable("OrderRouter request failed: " + err.Error())
	}
	var decoded any
	if err := json.Unmarshal(text, &decoded); err != nil {
		return nil, ExchangeError("OrderRouter returned a non-JSON body")
	}
	body := routerContainer(decoded)
	if body == nil {
		body = map[string]any{}
	}
	if status >= 200 && status < 300 {
		return body, nil
	}
	// 404 and 501 carry a complete RouteResult explaining the refusal —
	// `no_market` and `exact_out_multi_hop_unsupported` are routing outcomes,
	// and turning them into errors would make the caller parse an error string
	// to recover a structure it already has
	if (status == 404 || status == 501) && routerStringAt(body, "unroutableReason", "") != "" {
		return body, nil
	}
	message := routerStringAt(body, "error", "http status "+strconv.Itoa(status))
	if status == 400 {
		return nil, BadRequest("OrderRouter: " + message)
	}
	if status == 401 || status == 403 {
		return nil, AuthenticationError("OrderRouter: " + message)
	}
	if status == 429 {
		return nil, RateLimitExceeded("OrderRouter: " + message)
	}
	if status == 408 || status == 504 {
		return nil, RequestTimeout("OrderRouter: " + message)
	}
	return nil, ExchangeError("OrderRouter: " + message)
}

// FetchRouteWithBalances reads the live balances of the supplied venues, sends
// them to the router, and returns a route you can actually fund. This is the ONE
// method that needs live exchange objects for a READ.
//
// params accepts everything FetchRoute accepts minus balances, which this method
// builds, plus requireBalancesApplied (default true) which decides whether a
// router that silently ignored the balances is an error.
//
// The returned route carries the client-side keys balancesUsed and
// balancesDropped.
func (this *OrderRouter) FetchRouteWithBalances(fromAsset string, toAsset string, venues map[string]IExchange, params map[string]any) (map[string]any, error) {
	requireApplied := routerBoolAt(params, "requireBalancesApplied", true)
	exchangeIds := routerSortedVenueIds(venues)
	entries := make([]map[string]any, 0)
	dropped := make([]map[string]any, 0)
	for i := 0; i < len(exchangeIds); i++ {
		exchangeId := exchangeIds[i]
		venue := venues[exchangeId]
		balance, err := venue.FetchBalance()
		if err != nil {
			return nil, err
		}
		holdings := balance.Free
		if len(holdings) == 0 {
			holdings = balance.Total
		}
		codes := make([]string, 0, len(holdings))
		for code := range holdings {
			codes = append(codes, code)
		}
		sort.Strings(codes)
		for j := 0; j < len(codes); j++ {
			code := codes[j]
			amount := 0.0
			if holdings[code] != nil {
				amount = *holdings[code]
			}
			if amount <= 0 {
				// a zero holding is not information, and it costs one of the
				// router's 64 entries
				continue
			}
			if amount >= 1e18 {
				// beyond fixed-point rendering; reported rather than sent,
				// because a silently reshaped amount is worse than a missing one
				dropped = append(dropped, map[string]any{"exchangeId": exchangeId, "asset": code, "amount": amount, "reason": "amount_out_of_range"})
				continue
			}
			entries = append(entries, map[string]any{"exchangeId": exchangeId, "asset": code, "amount": amount})
		}
	}
	// largest first, so trimming to the router's caps drops the smallest
	// holdings. Ties break on exchangeId then asset so six languages produce
	// the same list from the same wallet.
	sort.SliceStable(entries, func(a int, b int) bool {
		amountA := routerNumberAt(entries[a], "amount", 0)
		amountB := routerNumberAt(entries[b], "amount", 0)
		if amountA != amountB {
			return amountA > amountB
		}
		exchangeA := routerStringAt(entries[a], "exchangeId", "")
		exchangeB := routerStringAt(entries[b], "exchangeId", "")
		if exchangeA != exchangeB {
			return exchangeA < exchangeB
		}
		return routerStringAt(entries[a], "asset", "") < routerStringAt(entries[b], "asset", "")
	})
	for len(entries) > OrderRouterMaxBalanceEntries {
		removed := entries[len(entries)-1]
		entries = entries[:len(entries)-1]
		removed["reason"] = "entry_cap"
		dropped = append(dropped, removed)
	}
	balances, err := this.joinBalances(entries)
	if err != nil {
		return nil, err
	}
	for len(balances) > OrderRouterMaxBalanceChars && len(entries) > 0 {
		removed := entries[len(entries)-1]
		entries = entries[:len(entries)-1]
		removed["reason"] = "char_cap"
		dropped = append(dropped, removed)
		balances, err = this.joinBalances(entries)
		if err != nil {
			return nil, err
		}
	}
	routeParams := map[string]any{}
	for key, value := range params {
		routeParams[key] = value
	}
	routeParams["balances"] = balances
	route, err := this.FetchRoute(fromAsset, toAsset, routeParams)
	if err != nil {
		return nil, err
	}
	if requireApplied && balances != "" {
		// /route declares its query without a JSON schema, so a router that
		// predates the balances feature answers byte-identically to one that
		// never received it. Executing a plan computed against a portfolio the
		// server never saw is the case worth failing on.
		if routerStringAt(route, "balancesApplied", "") == "" {
			return nil, ExchangeError("OrderRouter did not echo balancesApplied: the balances were ignored, so this route is not funded-aware")
		}
	}
	route["balancesUsed"] = balances
	route["balancesDropped"] = dropped
	return route, nil
}

// joinBalances renders balance entries as the router's [exchangeId.]ASSET:amount
// comma-separated form.
func (this *OrderRouter) joinBalances(entries []map[string]any) (string, error) {
	var builder strings.Builder
	for i := 0; i < len(entries); i++ {
		entry := entries[i]
		if i > 0 {
			builder.WriteString(",")
		}
		amount, err := this.FormatNumber(routerNumberAt(entry, "amount", 0))
		if err != nil {
			return "", err
		}
		builder.WriteString(routerStringAt(entry, "exchangeId", ""))
		builder.WriteString(".")
		builder.WriteString(routerStringAt(entry, "asset", ""))
		builder.WriteString(":")
		builder.WriteString(amount)
	}
	return builder.String(), nil
}

// routerSortedVenueIds lists the venue ids in a fixed order. Go randomises map
// iteration, so nothing that reaches a returned structure may walk a map.
func routerSortedVenueIds(venues map[string]IExchange) []string {
	ids := make([]string, 0, len(venues))
	for id := range venues {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	return ids
}

//  ---------------------------------------------------------------------------
//  PURE: BuildExecutionPlan
//  ---------------------------------------------------------------------------

// BuildExecutionPlan flattens a RouteResult's hops and legs into a flat, ordered
// list of orders to place. PURE — no I/O, no error, and the same input produces
// the same output in all six languages.
//
// options keys:
//
//	slippageBps              float  how far the limit price is set past the expected price, default 25
//	reconcileToleranceRatio  float  the shortfall ratio ReconcileExecutionStep halts on, default 0.02
//
// The returned plan's steps carry stepIndex, hopIndex, legIndex, exchangeId,
// symbol, side, base, quote, amount, expectedPrice, effectivePrice, limitPrice
// and notionalQuote.
// It returns an error when the route's hops do not connect, or when the route does not run from
// the asset the caller offered to the asset the caller wanted — the four sibling ports throw on
// exactly those conditions, and silently planning orders against a route that fails them is how a
// compromised or buggy router response reaches a real venue.
func (this *OrderRouter) BuildExecutionPlan(route map[string]any, options map[string]any) (map[string]any, error) {
	slippageBps := routerNumberAt(options, "slippageBps", OrderRouterDefaultSlippageBps)
	tolerance := routerNumberAt(options, "reconcileToleranceRatio", OrderRouterDefaultReconcileTolerance)
	hops := routerListAt(route, "hops")
	if err := routerAssertChainCoherent(route, hops); err != nil {
		return nil, err
	}
	steps := make([]map[string]any, 0)
	stepIndex := 0
	for hopIndex := 0; hopIndex < len(hops); hopIndex++ {
		hop := hops[hopIndex]
		symbol := routerStringAt(hop, "pair", "")
		side := routerStringAt(hop, "side", "")
		base := routerStringAt(hop, "base", "")
		quote := routerStringAt(hop, "quote", "")
		legs := routerListAt(hop, "legs")
		for legIndex := 0; legIndex < len(legs); legIndex++ {
			leg := legs[legIndex]
			// leg amounts are always in BASE units, on both sides of the market
			// — see the router's RoutingQuote.filledAmount contract
			amount := routerNumberAt(leg, "amount", 0)
			expectedPrice := routerNumberAt(leg, "averagePrice", 0)
			effectivePrice := routerNumberAt(leg, "effectivePrice", expectedPrice)
			// the limit sits on the side that costs you: above for a buy, below
			// for a sell
			limitPrice := 0.0
			if side == "buy" {
				limitPrice = expectedPrice * (1 + slippageBps/10000)
			} else {
				limitPrice = expectedPrice * (1 - slippageBps/10000)
			}
			steps = append(steps, map[string]any{
				"stepIndex":      float64(stepIndex),
				"hopIndex":       float64(hopIndex),
				"legIndex":       float64(legIndex),
				"exchangeId":     routerStringAt(leg, "exchangeId", ""),
				"symbol":         symbol,
				"side":           side,
				"base":           base,
				"quote":          quote,
				"amount":         amount,
				"expectedPrice":  expectedPrice,
				"effectivePrice": effectivePrice,
				"limitPrice":     limitPrice,
				"notionalQuote":  amount * expectedPrice,
			})
			stepIndex = stepIndex + 1
		}
	}
	return map[string]any{
		"requestId":               routerStringAt(route, "requestId", ""),
		"calculatedAt":            routerNumberAt(route, "calculatedAt", 0),
		"from":                    routerStringAt(route, "from", ""),
		"to":                      routerStringAt(route, "to", ""),
		"routingStrategy":         routerStringAt(route, "strategy", ""),
		"exactSide":               routerStringAt(route, "exactSide", ""),
		"amountIn":                routerNumberAt(route, "amountIn", 0),
		"amountOut":               routerNumberAt(route, "amountOut", 0),
		"fullyFillable":           routerBoolAt(route, "fullyFillable", false),
		"fillRatio":               routerNumberAt(route, "fillRatio", 0),
		"unroutableReason":        routerStringAt(route, "unroutableReason", ""),
		"hopCount":                float64(len(hops)),
		"stepCount":               float64(len(steps)),
		"slippageBps":             slippageBps,
		"reconcileToleranceRatio": tolerance,
		"steps":                   steps,
	}, nil
}

//  ---------------------------------------------------------------------------
//  PURE: CheckExecutionPlanSafety
//  ---------------------------------------------------------------------------

// CheckExecutionPlanSafety checks a plan against per-venue market rules and, when
// one is set, the per-trade USD notional cap. PURE — no I/O. A step that cannot be
// valued in USD BLOCKS while a cap is in force; it is never skipped, because a cap
// that silently disappears when a rate is missing is not a cap. With no cap there
// is nothing to enforce and the check does not run at all.
//
// markets is markets[exchangeId][symbol].
//
// options keys:
//
//	usdRates        dict    currency code to its USD price. USD itself is 1 implicitly; nothing else is assumed
//	maxNotionalUsd  float   per-trade cap, honoured exactly; 0 or absent means no cap and no notional check
//	precisionMode   string  tick_size (default) or decimal_places, matching the venue's precisionMode
//
// Each violation carries stepIndex, exchangeId, symbol, code, blocking, actual,
// limit and a constant message. An empty slice means the plan passed.
func (this *OrderRouter) CheckExecutionPlanSafety(plan map[string]any, markets map[string]any, options map[string]any) []map[string]any {
	violations := make([]map[string]any, 0)
	// Honoured exactly as given, per call or per client. No clamping: a caller
	// trading thousands and a caller trading cents are both using this correctly.
	maxNotionalUsd := routerNumberAt(options, "maxNotionalUsd", this.MaxNotionalUsd)
	capInForce := maxNotionalUsd > 0
	usdRates := routerDictAt(options, "usdRates")
	precisionMode := routerStringAt(options, "precisionMode", "tick_size")
	steps := routerListAt(plan, "steps")
	if len(steps) == 0 {
		// an empty plan passing an empty violation list would read as "safe"
		violations = append(violations, this.violation(-1, "", "", "empty_plan", true, 0, 0))
		return violations
	}
	unroutableReason := routerStringAt(plan, "unroutableReason", "")
	if unroutableReason != "" {
		violations = append(violations, this.violation(-1, "", "", "route_unroutable", true, 0, 0))
	}
	if !routerBoolAt(plan, "fullyFillable", false) {
		violations = append(violations, this.violation(-1, "", "", "partial_fill", false, routerNumberAt(plan, "fillRatio", 0), 1))
	}
	for i := 0; i < len(steps); i++ {
		step := steps[i]
		stepIndex := routerNumberAt(step, "stepIndex", float64(i))
		exchangeId := routerStringAt(step, "exchangeId", "")
		symbol := routerStringAt(step, "symbol", "")
		amount := routerNumberAt(step, "amount", 0)
		expectedPrice := routerNumberAt(step, "expectedPrice", 0)
		limitPrice := routerNumberAt(step, "limitPrice", 0)
		notionalQuote := routerNumberAt(step, "notionalQuote", 0)
		side := routerStringAt(step, "side", "")
		if amount <= 0 || expectedPrice <= 0 || (side != "buy" && side != "sell") {
			violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "invalid_step", true, amount, 0))
			continue
		}
		venueMarkets := routerDictAt(markets, exchangeId)
		market := routerDictAt(venueMarkets, symbol)
		if len(market) == 0 {
			violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "unknown_symbol", true, 0, 0))
			continue
		}
		// the same symbol string on a different venue is not necessarily the
		// same pair, and the USD valuation below trusts the step's quote
		// currency — so disagreement is fatal, not cosmetic
		marketBase := routerStringAt(market, "base", "")
		marketQuote := routerStringAt(market, "quote", "")
		stepBase := routerStringAt(step, "base", "")
		stepQuote := routerStringAt(step, "quote", "")
		if (marketBase != "" && stepBase != "" && marketBase != stepBase) || (marketQuote != "" && stepQuote != "" && marketQuote != stepQuote) {
			violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "market_mismatch", true, 0, 0))
			continue
		}
		limits := routerDictAt(market, "limits")
		amountLimits := routerDictAt(limits, "amount")
		priceLimits := routerDictAt(limits, "price")
		costLimits := routerDictAt(limits, "cost")
		minAmount := routerNumberAt(amountLimits, "min", 0)
		maxAmount := routerNumberAt(amountLimits, "max", 0)
		minPrice := routerNumberAt(priceLimits, "min", 0)
		maxPrice := routerNumberAt(priceLimits, "max", 0)
		minCost := routerNumberAt(costLimits, "min", 0)
		if minAmount > 0 && amount < minAmount {
			violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "amount_below_minimum", true, amount, minAmount))
		}
		if maxAmount > 0 && amount > maxAmount {
			violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "amount_above_maximum", true, amount, maxAmount))
		}
		if minCost > 0 && notionalQuote < minCost {
			violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "cost_below_minimum", true, notionalQuote, minCost))
		}
		if (minPrice > 0 && limitPrice < minPrice) || (maxPrice > 0 && limitPrice > maxPrice) {
			breached := maxPrice
			if limitPrice < minPrice {
				breached = minPrice
			}
			violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "price_out_of_range", true, limitPrice, breached))
		}
		precision := routerDictAt(market, "precision")
		amountPrecision := routerNumberAt(precision, "amount", 0)
		pricePrecision := routerNumberAt(precision, "price", 0)
		// precision findings are advisory: Execute snaps through the venue's own
		// AmountToPrecision/PriceToPrecision before sending
		if this.precisionViolated(amount, amountPrecision, precisionMode) {
			violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "amount_precision", false, amount, amountPrecision))
		}
		if this.precisionViolated(limitPrice, pricePrecision, precisionMode) {
			violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "price_precision", false, limitPrice, pricePrecision))
		}
		// the notional cap. The worst case is the higher of the expected and the
		// limit price, which is the buy side; a sell's limit sits below, so its
		// expected price is the one that governs.
		worstPrice := expectedPrice
		if limitPrice > worstPrice {
			worstPrice = limitPrice
		}
		if capInForce {
			// Only when a cap is actually set. With no cap there is nothing to
			// enforce, so a missing USD rate is not an error and the caller is not
			// made to supply usdRates for a check they did not ask for.
			worstNotional := amount * worstPrice
			usdValue := this.notionalUsd(step, worstNotional, usdRates)
			if usdValue <= 0 {
				// BLOCKING, and deliberately so. Skipping the cap for a step whose
				// USD value is unknown defeats the cap the caller DID ask for.
				violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "notional_unvaluable", true, worstNotional, maxNotionalUsd))
			} else if usdValue > maxNotionalUsd*(1+OrderRouterTolerance) {
				violations = append(violations, this.violation(stepIndex, exchangeId, symbol, "notional_exceeds_cap", true, usdValue, maxNotionalUsd))
			}
		}
	}
	return violations
}

// violation builds one safety violation record. stepIndex is -1 for a
// plan-level finding.
func (this *OrderRouter) violation(stepIndex float64, exchangeId string, symbol string, code string, blocking bool, actual float64, limit float64) map[string]any {
	message, known := orderRouterViolationMessages[code]
	if !known {
		message = code
	}
	return map[string]any{
		"stepIndex":  stepIndex,
		"exchangeId": exchangeId,
		"symbol":     symbol,
		"code":       code,
		"blocking":   blocking,
		"actual":     actual,
		"limit":      limit,
		"message":    message,
	}
}

// notionalUsd values a step's quote-currency notional in USD, returning 0 when
// it cannot be valued.
func (this *OrderRouter) notionalUsd(step any, notionalQuote float64, usdRates map[string]any) float64 {
	quote := routerStringAt(step, "quote", "")
	quoteRate := this.usdRateFor(quote, usdRates)
	if quoteRate > 0 {
		return notionalQuote * quoteRate
	}
	// fall back to the base side: amount * usd(base) values the same trade
	base := routerStringAt(step, "base", "")
	baseRate := this.usdRateFor(base, usdRates)
	if baseRate > 0 {
		return routerNumberAt(step, "amount", 0) * baseRate
	}
	return 0
}

// usdRateFor resolves the USD price of a currency, treating USD itself as 1 and
// assuming nothing about anything else.
func (this *OrderRouter) usdRateFor(code string, usdRates map[string]any) float64 {
	if code == "" {
		return 0
	}
	if code == "USD" {
		return 1
	}
	// USDT and USDC are NOT assumed to be one dollar. A stablecoin peg is an
	// empirical fact, not a definition, and the caller supplying rates is the
	// one who knows today's.
	rate := routerNumberAt(usdRates, code, 0)
	if rate > 0 {
		return rate
	}
	return 0
}

// precisionViolated reports whether a value fails to sit on a market's precision
// grid, i.e. whether it would have to be rounded before it could be sent.
func (this *OrderRouter) precisionViolated(value float64, precision float64, mode string) bool {
	if precision <= 0 {
		// unknown or unconstrained precision is not a finding
		return false
	}
	rounded := 0.0
	if mode == "decimal_places" {
		factor := math.Pow(10, precision)
		rounded = math.Round(value*factor) / factor
	} else {
		// the rounding mode is irrelevant here: a value exactly halfway between
		// two ticks is off-grid whichever neighbour it snaps to, so Go's
		// round-half-away-from-zero and JavaScript's round-half-up cannot
		// disagree on this predicate's answer
		rounded = math.Round(value/precision) * precision
	}
	allowed := math.Abs(value)*OrderRouterTolerance + 1e-15
	return math.Abs(rounded-value) > allowed
}

//  ---------------------------------------------------------------------------
//  PURE: ReconcileExecutionStep
//  ---------------------------------------------------------------------------

// ReconcileExecutionStep compares what a step actually produced against what the
// route predicted, resizes every downstream hop, and returns the proceed-or-halt
// verdict. PURE — no I/O. The halt decision lives here rather than in the
// execution loop because it is a money decision, and six separate loops is six
// chances to omit it.
//
// realisedOut is measured in that step's output asset — base for a buy, quote
// for a sell. The returned verdict carries expectedOut, realisedOut, shortfall,
// shortfallRatio, scale, verdict, reason and resizedSteps.
func (this *OrderRouter) ReconcileExecutionStep(plan map[string]any, stepIndex int, realisedOut float64) (map[string]any, error) {
	steps := routerListAt(plan, "steps")
	if stepIndex < 0 || stepIndex >= len(steps) {
		return nil, BadRequest("reconcileExecutionStep: stepIndex is out of range")
	}
	step := steps[stepIndex]
	hopIndex := routerNumberAt(step, "hopIndex", 0)
	tolerance := routerNumberAt(plan, "reconcileToleranceRatio", OrderRouterDefaultReconcileTolerance)
	expectedOut := this.stepExpectedOut(step)
	resized := make([]map[string]any, 0)
	if expectedOut <= 0 {
		return map[string]any{
			"stepIndex":      float64(stepIndex),
			"hopIndex":       hopIndex,
			"expectedOut":    0.0,
			"realisedOut":    realisedOut,
			"shortfall":      0.0,
			"shortfallRatio": 0.0,
			"scale":          0.0,
			"verdict":        "halt",
			"reason":         "zero_expected_output",
			"resizedSteps":   resized,
		}, nil
	}
	shortfall := expectedOut - realisedOut
	if shortfall < 0 {
		shortfall = 0
	}
	shortfallRatio := shortfall / expectedOut
	// the downstream hops lost `shortfall` out of this hop's whole output, not
	// out of this leg's, so the scale is measured against the hop
	hopExpectedOut := 0.0
	// Shortfall already reported by this hop's OTHER legs. Each leg used to compute a scale from
	// the hop total and multiply the downstream amounts by it, so a second leg scaled an
	// already-scaled number: 80% and 60% fills produced 0.9 * 0.8 = 0.72 of the next hop instead
	// of the true 0.70. Reproduced at 144 against a true 140 before this changed.
	priorShortfall := 0.0
	for i := 0; i < len(steps); i++ {
		if routerNumberAt(steps[i], "hopIndex", 0) == hopIndex {
			hopExpectedOut = hopExpectedOut + this.stepExpectedOut(steps[i])
			if routerNumberAt(steps[i], "stepIndex", -1) != float64(stepIndex) && routerHasNumberAt(steps[i], "realisedOut") {
				legShortfall := this.stepExpectedOut(steps[i]) - routerNumberAt(steps[i], "realisedOut", 0)
				if legShortfall < 0 {
					legShortfall = 0
				}
				priorShortfall = priorShortfall + legShortfall
			}
		}
	}
	// scaleBefore is what the downstream amounts have ALREADY been multiplied by, so the factor
	// applied here is the increment to the hop's true cumulative scale. With one leg per hop
	// priorShortfall is 0 and this is identical to what it replaced.
	scaleBefore := 1.0
	scaleAfter := 1.0
	if hopExpectedOut > 0 {
		scaleBefore = (hopExpectedOut - priorShortfall) / hopExpectedOut
		scaleAfter = (hopExpectedOut - priorShortfall - shortfall) / hopExpectedOut
	}
	if scaleBefore <= 0 {
		scaleBefore = 1
		scaleAfter = 0
	}
	scale := scaleAfter / scaleBefore
	if scale > 1 {
		// never scale UP. An overfill is good news, but growing a downstream
		// order past the size that passed the safety check would place an order
		// nobody ever approved.
		scale = 1
	}
	if scale < 0 {
		scale = 0
	}
	for i := 0; i < len(steps); i++ {
		other := steps[i]
		if routerNumberAt(other, "hopIndex", 0) <= hopIndex {
			continue
		}
		previousAmount := routerNumberAt(other, "amount", 0)
		amount := previousAmount * scale
		resized = append(resized, map[string]any{
			"stepIndex":      routerNumberAt(other, "stepIndex", float64(i)),
			"previousAmount": previousAmount,
			"amount":         amount,
			"notionalQuote":  amount * routerNumberAt(other, "expectedPrice", 0),
		})
	}
	verdict := "proceed"
	reason := "within_tolerance"
	if realisedOut <= 0 {
		verdict = "halt"
		reason = "nothing_filled"
	} else if shortfallRatio > tolerance*(1+OrderRouterTolerance) {
		verdict = "halt"
		reason = "shortfall_exceeds_tolerance"
	}
	return map[string]any{
		"stepIndex":      float64(stepIndex),
		"hopIndex":       hopIndex,
		"expectedOut":    expectedOut,
		"realisedOut":    realisedOut,
		"shortfall":      shortfall,
		"shortfallRatio": shortfallRatio,
		"scale":          scale,
		"verdict":        verdict,
		"reason":         reason,
		"resizedSteps":   resized,
	}, nil
}

// stepExpectedOut is how much of its output asset a step is expected to produce,
// gross of fees: base units for a buy, quote units for a sell.
func (this *OrderRouter) stepExpectedOut(step any) float64 {
	amount := routerNumberAt(step, "amount", 0)
	if routerStringAt(step, "side", "") == "buy" {
		return amount
	}
	return amount * routerNumberAt(step, "expectedPrice", 0)
}

//  ---------------------------------------------------------------------------
//  PURE: BuildUnwindPlan
//  ---------------------------------------------------------------------------

// BuildUnwindPlan takes a halted execution report and computes the reverse
// orders that sell each stranded residual back toward the original from-asset,
// on the venue that actually holds it. PURE — no I/O. NEVER automatic: the
// result carries requiresConfirmation and nothing in this type executes it.
//
// steps come back in reverse execution order; unresolved carries the residuals
// that cannot be reversed.
func (this *OrderRouter) BuildUnwindPlan(report map[string]any) map[string]any {
	fromAsset := routerStringAt(report, "from", "")
	toAsset := routerStringAt(report, "to", "")
	slippageBps := routerNumberAt(report, "slippageBps", OrderRouterDefaultSlippageBps)
	results := routerListAt(report, "steps")
	// net position per (exchangeId, asset). Held in a SLICE rather than a map
	// because the output order must be identical in six languages and Go
	// randomises map iteration on purpose.
	positions := make([]map[string]any, 0)
	for i := len(results) - 1; i >= 0; i-- {
		result := results[i]
		exchangeId := routerStringAt(result, "exchangeId", "")
		outAsset := routerStringAt(result, "outAsset", "")
		outAmount := routerNumberAt(result, "outAmount", 0)
		if outAsset != "" && outAmount > 0 {
			positions = this.addPosition(positions, exchangeId, outAsset, outAmount, result, true)
		}
		inAsset := routerStringAt(result, "inAsset", "")
		inAmount := routerNumberAt(result, "inAmount", 0)
		if inAsset != "" && inAmount > 0 {
			// what a later hop consumed on this venue is not a residual.
			// Netting is per venue: assets sitting on a venue the route never
			// spent them on stay stranded, because this type never moves funds
			// between venues.
			positions = this.addPosition(positions, exchangeId, inAsset, -inAmount, result, false)
		}
	}
	steps := make([]map[string]any, 0)
	unresolved := make([]map[string]any, 0)
	residualCount := 0
	for i := 0; i < len(positions); i++ {
		position := positions[i]
		asset := routerStringAt(position, "asset", "")
		amount := routerNumberAt(position, "amount", 0)
		exchangeId := routerStringAt(position, "exchangeId", "")
		if amount <= 0 {
			continue
		}
		if asset == fromAsset {
			// already home
			continue
		}
		residualCount = residualCount + 1
		source := routerDictAt(position, "source")
		symbol := routerStringAt(source, "symbol", "")
		sourceSide := routerStringAt(source, "side", "")
		price := routerNumberAt(source, "averagePrice", 0)
		if price <= 0 {
			price = routerNumberAt(source, "expectedPrice", 0)
		}
		if symbol == "" || (sourceSide != "buy" && sourceSide != "sell") {
			unresolved = append(unresolved, map[string]any{"exchangeId": exchangeId, "asset": asset, "amount": amount, "reason": "no_source_market"})
			continue
		}
		if price <= 0 {
			unresolved = append(unresolved, map[string]any{"exchangeId": exchangeId, "asset": asset, "amount": amount, "reason": "no_price"})
			continue
		}
		// reverse the order that created the residual: a buy left you holding
		// base, so sell it back; a sell left you holding quote, so buy the base
		// back with it
		side := ""
		unwindAmount := 0.0
		marketBase := ""
		marketQuote := ""
		// the counter asset is whatever the reversed order gives back, which is
		// exactly what the original order spent
		counterAsset := routerStringAt(source, "inAsset", "")
		if sourceSide == "buy" {
			side = "sell"
			marketBase = routerStringAt(source, "outAsset", "")
			marketQuote = routerStringAt(source, "inAsset", "")
		} else {
			side = "buy"
			marketBase = routerStringAt(source, "inAsset", "")
			marketQuote = routerStringAt(source, "outAsset", "")
		}
		// the limit price comes FIRST, because the buy below is sized on it.
		limitPrice := 0.0
		if side == "buy" {
			limitPrice = price * (1 + slippageBps/10000)
		} else {
			limitPrice = price * (1 - slippageBps/10000)
		}
		if side == "buy" {
			// Size the buy on the price it is actually PLACED at, not on the
			// expected price. A residual of 44.5 USDT sized at 0.089 is 500 DOGE,
			// but the order goes out at 0.0892225 and would need 44.61 USDT to
			// fill - 0.11 more than the venue holds. The venue rejects it for
			// insufficient funds, or fills it partially and leaves the rest of the
			// stranded money stranded. Dividing by limitPrice spends at most the
			// residual.
			unwindAmount = amount / limitPrice
		} else {
			unwindAmount = amount
		}
		steps = append(steps, map[string]any{
			"stepIndex":  float64(len(steps)),
			"exchangeId": exchangeId,
			"symbol":     symbol,
			"side":       side,
			// base and quote are carried so that an unwind plan can be fed
			// straight back into CheckExecutionPlanSafety: unwinding is trading,
			// and it is subject to the same notional cap
			"base":          marketBase,
			"quote":         marketQuote,
			"asset":         asset,
			"counterAsset":  counterAsset,
			"amount":        unwindAmount,
			"expectedPrice": price,
			"limitPrice":    limitPrice,
			// notional at the price the order is actually placed at: this plan is
			// fed back into CheckExecutionPlanSafety, and a cap that was checked
			// against the expected price under-counts what the buy above really
			// spends.
			"notionalQuote": unwindAmount * limitPrice,
			"reachesFrom":   counterAsset == fromAsset,
			"isDestination": asset == toAsset,
		})
	}
	return map[string]any{
		"from":                 fromAsset,
		"to":                   toAsset,
		"halted":               routerBoolAt(report, "halted", false),
		"haltReason":           routerStringAt(report, "haltReason", ""),
		"residualCount":        float64(residualCount),
		"requiresConfirmation": true,
		"automatic":            false,
		"steps":                steps,
		"unresolved":           unresolved,
	}
}

// addPosition accumulates a signed amount into the (exchangeId, asset) position
// list, appending in first-seen order. amount is positive for produced and
// negative for consumed; produced marks the only kind of step an unwind can
// reverse.
func (this *OrderRouter) addPosition(positions []map[string]any, exchangeId string, asset string, amount float64, source any, produced bool) []map[string]any {
	for i := 0; i < len(positions); i++ {
		position := positions[i]
		if routerStringAt(position, "exchangeId", "") == exchangeId && routerStringAt(position, "asset", "") == asset {
			position["amount"] = routerNumberAt(position, "amount", 0) + amount
			if produced && len(routerDictAt(position, "source")) == 0 {
				position["source"] = source
			}
			return positions
		}
	}
	// the source must be the step that PRODUCED the asset, never one that
	// consumed it: reversing a step that spent your USDT would sell the wrong
	// side of the wrong market. Walking the results backwards, the first
	// producing step seen is the last one that ran, which is exactly the order
	// an unwind undoes first.
	var initialSource any = map[string]any{}
	if produced {
		initialSource = source
	}
	return append(positions, map[string]any{"exchangeId": exchangeId, "asset": asset, "amount": amount, "source": initialSource})
}

//  ---------------------------------------------------------------------------
//  IMPURE: Execute
//  ---------------------------------------------------------------------------

// orderRouterPrecision is the slice of the exchange surface that snaps an amount
// or a price onto a market's grid. It is not declared on IExchange, but every
// concrete ccxt exchange embeds Exchange and therefore carries both methods.
type orderRouterPrecision interface {
	AmountToPrecision(symbol any, amount any) any
	PriceToPrecision(symbol any, price any) any
}

// orderRouterSink collects everything one step wants to write into the shared
// report. Legs of a hop run concurrently, so nothing writes to the report
// directly: the caller merges the sinks back in step order, which keeps the
// report byte-identical however the goroutines happen to be scheduled.
type orderRouterSink struct {
	errors     []map[string]any
	openOrders []map[string]any
	placed     int
	// the resolved identity of the plan being executed. Go's placeStep is handed a
	// sink rather than the report the other ports read this off, so it travels here.
	planId string
}

// PlanIdentity is the stable identity of an execution, used for the
// re-execution guard. A caller-supplied
// idempotencyKey WINS over the plan's own requestId: passing one is a deliberate
// statement about what this execution is, and it is the only identity a
// hand-assembled plan can have — Execute takes any dictionary of the plan shape,
// not only the output of BuildExecutionPlan, and a plan a user built themselves
// never went through a routing request and so never had a requestId. Nothing is
// invented when both are absent: a generated identity would be either random,
// which defeats the guard that depends on it, or a fingerprint of the plan's
// contents, which makes two plans that happen to agree indistinguishable.
func (this *OrderRouter) PlanIdentity(plan map[string]any, options map[string]any) string {
	idempotencyKey := routerStringAt(options, "idempotencyKey", "")
	if idempotencyKey != "" {
		return idempotencyKey
	}
	return routerStringAt(plan, "requestId", "")
}

// Execute runs a plan against live exchange instances. THE ONLY IMPURE METHOD.
// dry_run is the default and options["live"] must be exactly the boolean true
// for any order to be placed, so a call that looks live but forgot the flag
// places nothing.
//
// options keys:
//
//	strategy               string  dry_run, sequential, parallel_within_hop, limit_protected, best_effort or atomic_ish
//	live                   bool    must be exactly true for any order to be placed
//	usdRates               dict    currency code to USD price, required when live because the notional cap cannot be enforced without it
//	allowMarketOrders      bool    permit a market order when the venue cannot do IOC, default false
//	maxOrders              float   hard order-count cap, required by best_effort
//	acknowledgeDispersion  bool    required by best_effort, which can leave you holding an unintended asset mix
//	orderTimeoutMs         float   how long limit_protected leaves an order resting, default 20000
//	pollIntervalMs         float   how often limit_protected checks a resting order, default 1000
//	orderParams            dict    extra params merged into every CreateOrder call
//	idempotencyKey         string  the identity of this execution, required when the plan carries no requestId; it keys the re-execution guard, and OVERRIDES the plan's requestId when both are given
//	allowReexecution       bool    must be exactly true to run a plan this instance has already executed live; the DEFAULT is refusal
//	retryFailedSteps       float   how many times to re-place a step the venue DEFINITIVELY REJECTED, default 0. An outcome_unknown step is never retried at any setting: it may already be a live position, and re-placing it is the double-fill this class exists to prevent. The router sets no client order id, so a retry is a fresh order to the venue
//	retryDelayMs           float   how long to wait before a retry, default 1000
//	onStep                 func    an OrderRouterOnStep called after each step completes and reconciles, never mid-order, with one event map describing that step. Return "halt" to stop the route cleanly (haltReason becomes halted_by_on_step); any other value continues. It can only STOP a route, never resume one already halted. Do NO network I/O here — it sits between orders on the money path. A hook that panics is recorded as on_step_hook_failed and the run continues, because losing the report would destroy the only account of orders that are already live
//
// plan is a plan from BuildExecutionPlan, or a caller-assembled plan of the same
// shape — this method never assumes the plan came from the routing service.
// HasExecutedPlan reports whether this instance has executed the given plan id recently
// enough for the bounded ledger to still remember it.
func (this *OrderRouter) HasExecutedPlan(planId string) bool {
	// a key lookup, not a scan: the ledger is capped but still up to
	// OrderRouterMaxExecutedPlanIds long, and this runs on every live execution
	return this.executedPlanIdSet[planId]
}

// RecordExecutedPlan records one plan id in the bounded ledger, evicting the oldest entry
// when the cap is reached.
func (this *OrderRouter) RecordExecutedPlan(planId string) {
	if this.executedPlanIdSet == nil {
		// a router built as a bare struct literal rather than through NewOrderRouter
		this.executedPlanIdSet = map[string]bool{}
	}
	if this.executedPlanIdSet[planId] {
		// already recorded; re-recording it would move it in the FIFO order and let a
		// repeatedly re-executed plan keep other ids alive or evict them out of turn
		return
	}
	this.ExecutedPlanIds = append(this.ExecutedPlanIds, planId)
	this.executedPlanIdSet[planId] = true
	for len(this.ExecutedPlanIds) > OrderRouterMaxExecutedPlanIds {
		// FIFO: the OLDEST execution is the one whose duplicate is least likely still in
		// flight. Evicting it drops the refusal for that plan — see the comment on
		// OrderRouterMaxExecutedPlanIds; this is a bounded memory promise, not a stronger
		// idempotency one.
		evicted := this.ExecutedPlanIds[0]
		this.ExecutedPlanIds = this.ExecutedPlanIds[1:]
		delete(this.executedPlanIdSet, evicted)
	}
}

func (this *OrderRouter) Execute(plan map[string]any, venues map[string]IExchange, options map[string]any) (map[string]any, error) {
	requestedStrategy := routerStringAt(options, "strategy", "dry_run")
	known := false
	for i := 0; i < len(orderRouterKnownStrategies); i++ {
		if orderRouterKnownStrategies[i] == requestedStrategy {
			known = true
		}
	}
	if !known {
		return nil, BadRequest("OrderRouter: unknown execution strategy " + requestedStrategy)
	}
	live := routerBoolAt(options, "live", false)
	// THE default. Anything short of an explicit true is a rehearsal.
	strategy := "dry_run"
	if live {
		strategy = requestedStrategy
	}
	steps := this.cloneSteps(plan)
	report, results := this.emptyReport(plan, strategy, requestedStrategy, live, steps)
	// resolved from BOTH the plan and the options, so a hand-assembled plan can carry
	// an identity too; reported on every report, rehearsals included
	planId := this.PlanIdentity(plan, options)
	report["planId"] = planId
	// How old the prices in this plan are. ALWAYS reported, even when nothing is enforced: a plan
	// is a snapshot of a book, and how stale that snapshot is decides whether any number in it
	// means anything. -1 when the route carried no calculatedAt, which is not the same as "fresh"
	// and must not read like it. Enforced only if asked for, at whatever value is asked for — the
	// same shape as maxNotionalUsd, and for the same reason. But an age that cannot be determined
	// BLOCKS under an active limit: a freshness check that silently passes when the timestamp is
	// missing is not a freshness check.
	calculatedAt := routerNumberAt(plan, "calculatedAt", 0)
	planAgeMs := float64(-1)
	if calculatedAt > 0 {
		planAgeMs = this.NowMs() - calculatedAt
	}
	report["planAgeMs"] = planAgeMs
	maxPlanAgeMs := routerNumberAt(options, "maxPlanAgeMs", 0)
	if live && maxPlanAgeMs > 0 {
		if planAgeMs < 0 {
			return nil, ExchangeError("OrderRouter: refusing to execute, the plan carries no calculatedAt and maxPlanAgeMs was set")
		}
		if planAgeMs > maxPlanAgeMs {
			return nil, ExchangeError("OrderRouter: refusing to execute a plan older than maxPlanAgeMs, recompute the route")
		}
	}
	if strategy == "dry_run" {
		// not one call is made against a venue on this path, not even a read
		report["wouldPlaceOrders"] = float64(len(steps))
		return report, nil
	}
	if len(venues) == 0 {
		return nil, ArgumentsRequired("OrderRouter.Execute requires a venues dictionary when live")
	}
	// IDEMPOTENCY, half one: a plan this instance has already run live is REFUSED, and
	// refused here — before a single read reaches a venue. The ledger is consulted now
	// and written only once the plan is about to be dispatched, so a caller error that
	// placed nothing does not burn the plan. dry_run never reaches this line and never
	// consumes a plan, because a rehearsal places nothing.
	if planId == "" {
		// no identity means no idempotency: the ledger below cannot key on it, so a
		// re-run of this plan would be indistinguishable from a first run.
		return nil, BadRequest("OrderRouter: refusing to execute live without an identity, the plan carries no requestId — pass options.idempotencyKey")
	}
	if !routerBoolAt(options, "allowReexecution", false) {
		if this.HasExecutedPlan(planId) {
			return nil, BadRequest("OrderRouter: refusing to re-execute a plan this instance already executed, pass allowReexecution to override")
		}
	}
	// derived from the steps about to be executed, NEVER read off the plan: a plan
	// that travelled through JSON, a persisted step list or a hand-rebuilt tail of
	// a halted route can be missing hopCount, and a refusal that a missing key
	// switches off is not a refusal
	hopCount := routerHopCountOf(steps)
	if strategy == "best_effort" {
		if hopCount > 1 {
			// best-effort multi-hop is the most reliable way to strand money in
			// a bridge asset
			return nil, NotSupported("OrderRouter: best_effort refuses multi-hop routes")
		}
		if !routerBoolAt(options, "acknowledgeDispersion", false) {
			return nil, BadRequest("OrderRouter: best_effort requires acknowledgeDispersion")
		}
		if routerNumberAt(options, "maxOrders", 0) <= 0 {
			return nil, BadRequest("OrderRouter: best_effort requires a positive maxOrders")
		}
	}
	if strategy == "limit_protected" {
		// Refused HERE, before a single order is placed, because the alternative is worse than a
		// bad interval: the poll loop advances its clock by this value, so a zero or negative one
		// never reaches the timeout. It spins on fetchOrder forever with a real order resting on a
		// real venue, and the timeout that exists to cancel that order never arrives.
		if routerHasNumberAt(options, "pollIntervalMs") && routerNumberAt(options, "pollIntervalMs", 0) <= 0 {
			return nil, BadRequest("OrderRouter: pollIntervalMs must be positive, a resting order is polled on that clock")
		}
	}
	// markets are needed for the safety check and for precision snapping
	markets := map[string]any{}
	exchangeIds := routerSortedVenueIds(venues)
	for i := 0; i < len(exchangeIds); i++ {
		exchangeId := exchangeIds[i]
		venue := venues[exchangeId]
		venueMarkets := routerVenueMarkets(venue)
		if len(venueMarkets) == 0 {
			if _, err := venue.LoadMarkets(); err != nil {
				return nil, err
			}
			venueMarkets = routerVenueMarkets(venue)
		}
		markets[exchangeId] = venueMarkets
	}
	usdRates := routerDictAt(options, "usdRates")
	safetyOptions := map[string]any{
		"usdRates":       usdRates,
		"maxNotionalUsd": routerNumberAt(options, "maxNotionalUsd", this.MaxNotionalUsd),
		"precisionMode":  routerStringAt(options, "precisionMode", "tick_size"),
	}
	violations := this.CheckExecutionPlanSafety(plan, markets, safetyOptions)
	blockers := ""
	for i := 0; i < len(violations); i++ {
		if routerBoolAt(violations[i], "blocking", false) {
			if blockers != "" {
				blockers = blockers + ", "
			}
			blockers = blockers + routerStringAt(violations[i], "code", "")
		}
	}
	if blockers != "" {
		// returned as an error, not reported. A refusal a caller can forget to
		// read is not a refusal.
		return nil, ExchangeError("OrderRouter: refusing to execute, blocking safety violations: " + blockers)
	}
	if strategy == "atomic_ish" {
		if err := this.assertPrefunded(steps, venues); err != nil {
			return nil, err
		}
	}
	// the ledger is written BEFORE the first order goes out, never after: a run that
	// fails half way through has still placed orders, and a guard that only recorded
	// completed runs would wave through exactly the retry that double-fills.
	this.RecordExecutedPlan(planId)
	var err error
	if strategy == "parallel_within_hop" {
		err = this.executeParallelWithinHop(report, results, steps, venues, options, usdRates)
	} else if strategy == "best_effort" {
		err = this.executeBestEffort(report, results, steps, venues, options, usdRates)
	} else {
		// sequential, limit_protected and atomic_ish all walk the plan one order
		// at a time; they differ in how a single order is placed and in whether
		// they lean on the previous hop's proceeds
		err = this.executeSequential(report, results, steps, venues, options, usdRates, strategy)
	}
	if err != nil {
		return nil, err
	}
	this.summariseReport(report, results, steps)
	return report, nil
}

// routerVenueMarkets copies a venue's loaded markets into the plain
// symbol -> market dictionary the pure layer speaks.
func routerVenueMarkets(venue IExchange) map[string]any {
	markets := map[string]any{}
	loaded := venue.GetMarkets()
	if loaded == nil {
		return markets
	}
	loaded.Range(func(key any, value any) bool {
		markets[ToString(key)] = value
		return true
	})
	return markets
}

// cloneSteps copies a plan's steps so that execution-time resizing never mutates
// the caller's plan.
// routerHopCountOf counts the distinct hops a step list spans, which is the only
// authority on whether a plan is multi-hop.
func routerHopCountOf(steps []map[string]any) float64 {
	// a slice rather than a map, so the count is the same in six languages and
	// does not depend on hash iteration order
	seen := make([]float64, 0)
	for i := 0; i < len(steps); i++ {
		hopIndex := routerNumberAt(steps[i], "hopIndex", 0)
		found := false
		for j := 0; j < len(seen); j++ {
			if seen[j] == hopIndex {
				found = true
				break
			}
		}
		if !found {
			seen = append(seen, hopIndex)
		}
	}
	return float64(len(seen))
}

func (this *OrderRouter) cloneSteps(plan map[string]any) []map[string]any {
	steps := routerListAt(plan, "steps")
	copies := make([]map[string]any, 0, len(steps))
	for i := 0; i < len(steps); i++ {
		step := steps[i]
		copies = append(copies, map[string]any{
			"stepIndex":      routerNumberAt(step, "stepIndex", float64(i)),
			"hopIndex":       routerNumberAt(step, "hopIndex", 0),
			"legIndex":       routerNumberAt(step, "legIndex", 0),
			"exchangeId":     routerStringAt(step, "exchangeId", ""),
			"symbol":         routerStringAt(step, "symbol", ""),
			"side":           routerStringAt(step, "side", ""),
			"base":           routerStringAt(step, "base", ""),
			"quote":          routerStringAt(step, "quote", ""),
			"amount":         routerNumberAt(step, "amount", 0),
			"expectedPrice":  routerNumberAt(step, "expectedPrice", 0),
			"effectivePrice": routerNumberAt(step, "effectivePrice", 0),
			"limitPrice":     routerNumberAt(step, "limitPrice", 0),
			"notionalQuote":  routerNumberAt(step, "notionalQuote", 0),
		})
	}
	return copies
}

// emptyReport builds the report skeleton with every step marked planned, and
// hands back the results slice the strategies write into. The slice is the same
// one stored under report["steps"], so an element written here is visible there.
func (this *OrderRouter) emptyReport(plan map[string]any, strategy string, requestedStrategy string, live bool, steps []map[string]any) (map[string]any, []map[string]any) {
	results := make([]map[string]any, 0, len(steps))
	for i := 0; i < len(steps); i++ {
		step := steps[i]
		results = append(results, map[string]any{
			"stepIndex":       routerNumberAt(step, "stepIndex", float64(i)),
			"hopIndex":        routerNumberAt(step, "hopIndex", 0),
			"legIndex":        routerNumberAt(step, "legIndex", 0),
			"exchangeId":      routerStringAt(step, "exchangeId", ""),
			"symbol":          routerStringAt(step, "symbol", ""),
			"side":            routerStringAt(step, "side", ""),
			"status":          "planned",
			"requestedAmount": routerNumberAt(step, "amount", 0),
			"filledAmount":    0.0,
			"averagePrice":    0.0,
			"expectedPrice":   routerNumberAt(step, "expectedPrice", 0),
			"cost":            0.0,
			"inAsset":         "",
			"inAmount":        0.0,
			"outAsset":        "",
			"outAmount":       0.0,
			"orderId":         "",
			"clientOrderId":   "",
			"errorCode":       "",
			// which retry produced this result; 0 unless retryFailedSteps re-placed it
			"attempt": 0.0,
		})
	}
	report := map[string]any{
		// a placeholder: Execute resolves the real identity from the plan AND the
		// options and overwrites it before anything reads this field
		"planId":                  "",
		"strategy":                strategy,
		"requestedStrategy":       requestedStrategy,
		"dryRun":                  strategy == "dry_run",
		"live":                    live,
		"from":                    routerStringAt(plan, "from", ""),
		"to":                      routerStringAt(plan, "to", ""),
		"slippageBps":             routerNumberAt(plan, "slippageBps", OrderRouterDefaultSlippageBps),
		"reconcileToleranceRatio": routerNumberAt(plan, "reconcileToleranceRatio", OrderRouterDefaultReconcileTolerance),
		"stepCount":               float64(len(steps)),
		"wouldPlaceOrders":        0.0,
		"ordersPlaced":            0.0,
		"halted":                  false,
		"haltReason":              "",
		"haltStepIndex":           -1.0,
		"filledIn":                0.0,
		"filledOut":               0.0,
		"steps":                   results,
		"openOrders":              make([]map[string]any, 0),
		"errors":                  make([]map[string]any, 0),
		"reconciliations":         make([]map[string]any, 0),
	}
	return report, results
}

// mergeSink folds one step's collected errors, open orders and order count into
// the shared report. Always called from the goroutine that owns the report.
func (this *OrderRouter) mergeSink(report map[string]any, sink *orderRouterSink) {
	for i := 0; i < len(sink.errors); i++ {
		routerAppendDict(report, "errors", sink.errors[i])
	}
	for i := 0; i < len(sink.openOrders); i++ {
		routerAppendDict(report, "openOrders", sink.openOrders[i])
	}
	report["ordersPlaced"] = routerNumberAt(report, "ordersPlaced", 0) + float64(sink.placed)
}

// routerAppendDict appends one record to a report list, writing the grown slice
// back so that the report always holds the current backing array.
func routerAppendDict(report map[string]any, key string, item map[string]any) {
	list, _ := report[key].([]map[string]any)
	report[key] = append(list, item)
}

// executeSequential places one order at a time in plan order, reconciling after
// each and obeying the halt verdict.
func (this *OrderRouter) executeSequential(report map[string]any, results []map[string]any, steps []map[string]any, venues map[string]IExchange, options map[string]any, usdRates map[string]any, strategy string) error {
	for i := 0; i < len(steps); i++ {
		sink := &orderRouterSink{planId: routerStringAt(report, "planId", "")}
		result := this.placeStepWithRetry(steps[i], venues, options, usdRates, strategy, sink)
		results[i] = result
		this.mergeSink(report, sink)
		if status := routerStringAt(result, "status", ""); status == "failed" || status == "outcome_unknown" {
			report["halted"] = true
			// An unknown outcome must NOT fall through to reconciliation: reconciling reads
			// outAmount, which is 0 because nothing was observed, and reports the halt as
			// "nothing_filled" — asserting the one thing we do not know.
			report["haltReason"] = "order_failed"
			if status == "outcome_unknown" {
				report["haltReason"] = "outcome_unknown"
			}
			report["haltStepIndex"] = float64(i)
			// the hook is told about a halt it did not cause, and cannot undo it
			this.callOnStep(options, report, result, map[string]any{}, i, len(steps))
			this.markRemainingSkipped(results, i+1)
			return nil
		}
		reconciliation, err := this.ReconcileExecutionStep(map[string]any{"steps": steps, "reconcileToleranceRatio": routerNumberAt(report, "reconcileToleranceRatio", OrderRouterDefaultReconcileTolerance)}, i, routerNumberAt(result, "outAmount", 0))
		if err != nil {
			return err
		}
		routerAppendDict(report, "reconciliations", reconciliation)
		if strategy != "atomic_ish" {
			// atomic_ish is pre-funded end to end, so a hop's shortfall does not
			// shrink the next hop's order — the money for it was already there
			// before the first order went out
			this.applyResize(steps, reconciliation)
		}
		if routerStringAt(reconciliation, "verdict", "") == "halt" {
			report["halted"] = true
			report["haltReason"] = routerStringAt(reconciliation, "reason", "")
			report["haltStepIndex"] = float64(i)
			this.callOnStep(options, report, result, reconciliation, i, len(steps))
			this.markRemainingSkipped(results, i+1)
			return nil
		}
		// the caller's own verdict, consulted only once the route is otherwise sound. It can
		// stop the route; it cannot restart one the reconciliation above already stopped.
		if this.callOnStep(options, report, result, reconciliation, i, len(steps)) == "halt" {
			report["halted"] = true
			report["haltReason"] = "halted_by_on_step"
			report["haltStepIndex"] = float64(i)
			this.markRemainingSkipped(results, i+1)
			return nil
		}
	}
	return nil
}

// executeParallelWithinHop runs the legs of one hop concurrently and the hops
// strictly in order.
func (this *OrderRouter) executeParallelWithinHop(report map[string]any, results []map[string]any, steps []map[string]any, venues map[string]IExchange, options map[string]any, usdRates map[string]any) error {
	cursor := 0
	for cursor < len(steps) {
		hopIndex := routerNumberAt(steps[cursor], "hopIndex", 0)
		end := cursor
		for end < len(steps) && routerNumberAt(steps[end], "hopIndex", 0) == hopIndex {
			end = end + 1
		}
		// THE CONTRACT: concurrent ACROSS venues, serialised WITHIN a venue. An ordering guarantee
		// rather than a performance promise, which is what lets six very different runtimes
		// honour the same words. One goroutine per LEG would put two orders in flight on a single
		// exchange instance, whose concurrency-safety is the instance's business and not
		// something this class can assume.
		venueOrder := make([]string, 0)
		grouped := make([][]int, 0)
		for i := cursor; i < end; i++ {
			exchangeId := routerStringAt(steps[i], "exchangeId", "")
			groupIndex := -1
			for g := 0; g < len(venueOrder); g++ {
				if venueOrder[g] == exchangeId {
					groupIndex = g
					break
				}
			}
			if groupIndex == -1 {
				venueOrder = append(venueOrder, exchangeId)
				grouped = append(grouped, []int{i})
			} else {
				grouped[groupIndex] = append(grouped[groupIndex], i)
			}
		}
		sinks := make([]*orderRouterSink, len(grouped))
		var waitGroup sync.WaitGroup
		for g := 0; g < len(grouped); g++ {
			// placeStep contains its own failures and never returns an error, so "wait for all"
			// means the same thing in all six languages. Without that containment JavaScript
			// rejects fast while sibling orders are still live and Go's WaitGroup waits for every
			// one — the same source abandoning in-flight orders differently per language.
			sink := &orderRouterSink{planId: routerStringAt(report, "planId", "")}
			sinks[g] = sink
			waitGroup.Add(1)
			go func(indices []int, sink *orderRouterSink) {
				defer waitGroup.Done()
				// strictly one at a time within this venue
				for _, index := range indices {
					results[index] = this.placeStepWithRetry(steps[index], venues, options, usdRates, "parallel_within_hop", sink)
				}
			}(grouped[g], sink)
		}
		waitGroup.Wait()
		for i := 0; i < len(sinks); i++ {
			this.mergeSink(report, sinks[i])
		}
		for i := cursor; i < end; i++ {
			result := results[i]
			if status := routerStringAt(result, "status", ""); status == "failed" || status == "outcome_unknown" {
				report["halted"] = true
				report["haltReason"] = "order_failed"
				if status == "outcome_unknown" {
					report["haltReason"] = "outcome_unknown"
				}
				report["haltStepIndex"] = float64(i)
				this.callOnStep(options, report, result, map[string]any{}, i, len(steps))
				this.markRemainingSkipped(results, end)
				return nil
			}
			reconciliation, err := this.ReconcileExecutionStep(map[string]any{"steps": steps, "reconcileToleranceRatio": routerNumberAt(report, "reconcileToleranceRatio", OrderRouterDefaultReconcileTolerance)}, i, routerNumberAt(result, "outAmount", 0))
			if err != nil {
				return err
			}
			routerAppendDict(report, "reconciliations", reconciliation)
			this.applyResize(steps, reconciliation)
			if routerStringAt(reconciliation, "verdict", "") == "halt" {
				report["halted"] = true
				report["haltReason"] = routerStringAt(reconciliation, "reason", "")
				report["haltStepIndex"] = float64(i)
				this.callOnStep(options, report, result, reconciliation, i, len(steps))
				this.markRemainingSkipped(results, end)
				return nil
			}
			if this.callOnStep(options, report, result, reconciliation, i, len(steps)) == "halt" {
				report["halted"] = true
				report["haltReason"] = "halted_by_on_step"
				report["haltStepIndex"] = float64(i)
				this.markRemainingSkipped(results, end)
				return nil
			}
		}
		cursor = end
	}
	return nil
}

// executeBestEffort places what it can and never halts, on a single hop only, up
// to maxOrders.
func (this *OrderRouter) executeBestEffort(report map[string]any, results []map[string]any, steps []map[string]any, venues map[string]IExchange, options map[string]any, usdRates map[string]any) error {
	maxOrders := routerNumberAt(options, "maxOrders", 0)
	placed := 0
	for i := 0; i < len(steps); i++ {
		if float64(placed) >= maxOrders {
			results[i]["status"] = "skipped"
			results[i]["errorCode"] = "max_orders_reached"
			continue
		}
		sink := &orderRouterSink{planId: routerStringAt(report, "planId", "")}
		results[i] = this.placeStepWithRetry(steps[i], venues, options, usdRates, "best_effort", sink)
		this.mergeSink(report, sink)
		placed = placed + 1
		// no reconciliation and no halt: that is the whole point of the strategy, and why it
		// is refused on anything but a single hop. The hook is still offered every step, and
		// stopping early is the one thing it may do here — that is a smaller commitment than
		// the strategy's own contract, never a larger one.
		if this.callOnStep(options, report, results[i], map[string]any{}, i, len(steps)) == "halt" {
			report["halted"] = true
			report["haltReason"] = "halted_by_on_step"
			report["haltStepIndex"] = float64(i)
			this.markRemainingSkipped(results, i+1)
			return nil
		}
	}
	return nil
}

// OrderRouterOnStep is the shape of the options["onStep"] callback: it is handed
// one event describing a finished step and returns "halt" to stop the route.
// SYNCHRONOUS by design — it sits between orders on the money path, so do no
// network I/O in it.
type OrderRouterOnStep func(event map[string]any) string

// placeStepWithRetry places one step, re-placing it up to
// options["retryFailedSteps"] times when — and ONLY when — the venue definitively
// rejected it.
func (this *OrderRouter) placeStepWithRetry(step map[string]any, venues map[string]IExchange, options map[string]any, usdRates map[string]any, strategy string, sink *orderRouterSink) map[string]any {
	maxRetries := routerNumberAt(options, "retryFailedSteps", 0)
	retryDelayMs := routerNumberAt(options, "retryDelayMs", OrderRouterDefaultRetryDelayMs)
	attempt := 0.0
	for {
		step["attempt"] = attempt
		result := this.placeStep(step, venues, options, usdRates, strategy, sink)
		status := routerStringAt(result, "status", "")
		// "failed" is the ONLY retryable outcome, and the distinction is the whole safety
		// argument. A failed step was refused by the venue: nothing was placed, so placing
		// it again cannot double-fill. An "outcome_unknown" step may ALREADY be a live
		// position that simply could not be read back, and re-placing that is precisely the
		// double-fill this class exists to prevent. It is never retried, at any setting.
		if status != "failed" || attempt >= maxRetries {
			return result
		}
		attempt = attempt + 1
		if retryDelayMs > 0 {
			time.Sleep(time.Duration(retryDelayMs) * time.Millisecond)
		}
	}
}

// callOnStep hands the caller's onStep hook one finished step and returns its
// verdict, treating any failure of the hook as "no opinion".
func (this *OrderRouter) callOnStep(options map[string]any, report map[string]any, result map[string]any, reconciliation map[string]any, stepIndex int, stepsTotal int) (verdict string) {
	raw, present := options["onStep"]
	if !present || raw == nil {
		return ""
	}
	var hook OrderRouterOnStep
	switch typed := raw.(type) {
	case OrderRouterOnStep:
		hook = typed
	case func(map[string]any) string:
		hook = typed
	default:
		// an options value of any other shape is not a hook at all. Refusing the whole
		// execution over an observability callback would be the larger failure, so a value
		// that cannot be called is treated exactly like no hook.
		return ""
	}
	event := map[string]any{
		"planId":          routerStringAt(report, "planId", ""),
		"stepIndex":       float64(stepIndex),
		"hopIndex":        routerNumberAt(result, "hopIndex", 0),
		"legIndex":        routerNumberAt(result, "legIndex", 0),
		"exchangeId":      routerStringAt(result, "exchangeId", ""),
		"symbol":          routerStringAt(result, "symbol", ""),
		"side":            routerStringAt(result, "side", ""),
		"status":          routerStringAt(result, "status", ""),
		"requestedAmount": routerNumberAt(result, "requestedAmount", 0),
		"filledAmount":    routerNumberAt(result, "filledAmount", 0),
		"outAsset":        routerStringAt(result, "outAsset", ""),
		"outAmount":       routerNumberAt(result, "outAmount", 0),
		"orderId":         routerStringAt(result, "orderId", ""),
		"clientOrderId":   routerStringAt(result, "clientOrderId", ""),
		"errorCode":       routerStringAt(result, "errorCode", ""),
		"attempt":         routerNumberAt(result, "attempt", 0),
		"reconciliation":  reconciliation,
		"ordersPlaced":    routerNumberAt(report, "ordersPlaced", 0),
		"halted":          routerBoolAt(report, "halted", false),
		"haltReason":      routerStringAt(report, "haltReason", ""),
		"stepsTotal":      float64(stepsTotal),
		"stepsRemaining":  float64(stepsTotal - (stepIndex + 1)),
	}
	// A hook that PANICS must NOT take the run with it — the Go form of the try/catch the
	// other ports use. Everything placed so far is recorded in this report, and losing it to
	// a panic raised by observability code would destroy the only account of orders that are
	// already live. The failure is recorded and the run proceeds as if the hook had no
	// opinion.
	defer func() {
		if recovered := recover(); recovered != nil {
			code := routerErrorCode(routerRecoveredError(recovered))
			routerAppendDict(report, "errors", routerErrorRecord(float64(stepIndex), routerStringAt(result, "exchangeId", ""), routerStringAt(result, "symbol", ""), "on_step_hook_failed:"+code))
			verdict = ""
		}
	}()
	if hook(event) == "halt" {
		return "halt"
	}
	return ""
}

// placeStep places one order for one step and NEVER returns an error and never
// propagates a panic, so that a sibling leg's failure cannot abandon an
// in-flight order.
func (this *OrderRouter) placeStep(step map[string]any, venues map[string]IExchange, options map[string]any, usdRates map[string]any, strategy string, sink *orderRouterSink) (result map[string]any) {
	stepIndex := routerNumberAt(step, "stepIndex", 0)
	exchangeId := routerStringAt(step, "exchangeId", "")
	symbol := routerStringAt(step, "symbol", "")
	side := routerStringAt(step, "side", "")
	result = map[string]any{
		"stepIndex":       stepIndex,
		"hopIndex":        routerNumberAt(step, "hopIndex", 0),
		"legIndex":        routerNumberAt(step, "legIndex", 0),
		"exchangeId":      exchangeId,
		"symbol":          symbol,
		"side":            side,
		"status":          "failed",
		"requestedAmount": routerNumberAt(step, "amount", 0),
		"filledAmount":    0.0,
		"averagePrice":    0.0,
		"expectedPrice":   routerNumberAt(step, "expectedPrice", 0),
		"cost":            0.0,
		"inAsset":         "",
		"inAmount":        0.0,
		"outAsset":        "",
		"outAmount":       0.0,
		"orderId":         "",
		"clientOrderId":   "",
		"errorCode":       "",
		// false until an order is actually dispatched; set at each CreateOrder below
		"placementAttempted": false,
	}
	// containment, part one. The ccxt Go base signals failure by panicking —
	// AmountToPrecision does — and a leg that panics must not take its siblings
	// with it.
	defer func() {
		if recovered := recover(); recovered != nil {
			code := routerErrorCode(routerRecoveredError(recovered))
			result["status"] = "failed"
			result["errorCode"] = code
			sink.errors = append(sink.errors, routerErrorRecord(stepIndex, exchangeId, symbol, code))
			// CreateOrder may already have succeeded: every path between it and
			// the final read leaves a real order on a real venue, and reporting
			// the id is the difference between an operator who can go cancel it
			// and one who never learns it exists.
			routerNoteUnconfirmed(sink, result, exchangeId, symbol)
		}
	}()
	// containment, part two: every ordinary failure comes back as an error and
	// is turned into the same failed result.
	if err := this.placeStepInner(result, step, venues, options, usdRates, strategy, sink); err != nil {
		code := routerErrorCode(err)
		result["status"] = "failed"
		result["errorCode"] = code
		sink.errors = append(sink.errors, routerErrorRecord(stepIndex, exchangeId, symbol, code))
		routerNoteUnconfirmed(sink, result, exchangeId, symbol)
	}
	return result
}

// routerNoteUnconfirmed records what is known about an order that may exist. With an id, the entry
// is id-keyed as usual. Without one — CreateOrder itself failed, so the call that would have
// returned the id is the call that died — an id-less entry is recorded ONLY when the error leaves
// the outcome genuinely unknown. Reporting a network failure as a plain failure asserts "nothing
// happened", which is the one reading that is certainly wrong; reporting a definite rejection that
// way would bury the ambiguous ones among answers the venue actually gave.
func routerNoteUnconfirmed(sink *orderRouterSink, result map[string]any, exchangeId string, symbol string) {
	if knownId := routerStringAt(result, "orderId", ""); knownId != "" {
		// "failed" would read as "nothing happened" while openOrders says the opposite, and one
		// report must not carry both readings. Having an id means CreateOrder RETURNED — the venue
		// accepted something — so whatever threw afterwards left a real order behind whose fill is
		// simply unknown to us.
		result["status"] = "outcome_unknown"
		routerRecordOpenOrder(sink, exchangeId, symbol, knownId, "outcome_unknown")
		return
	}
	if !routerBoolAt(result, "placementAttempted", false) {
		return
	}
	if !routerIsOutcomeUnknownError(routerStringAt(result, "errorCode", "")) {
		return
	}
	result["status"] = "outcome_unknown"
	for _, entry := range sink.openOrders {
		if routerStringAt(entry, "exchangeId", "") == exchangeId &&
			routerStringAt(entry, "symbol", "") == symbol &&
			routerStringAt(entry, "reason", "") == "placement_unconfirmed" {
			return
		}
	}
	sink.openOrders = append(sink.openOrders, map[string]any{
		"exchangeId": exchangeId, "symbol": symbol, "orderId": "", "reason": "placement_unconfirmed",
	})
}

// routerIsOutcomeUnknownError reports whether an error leaves a placement's outcome unknown.
// ccxt's NetworkError family means the request failed without telling us whether the venue
// processed it; everything else is the venue ANSWERING. Matched by class name so the six ports
// agree without depending on each language's type-assertion mechanics.
func routerIsOutcomeUnknownError(errorCode string) bool {
	return errorCode == "RequestTimeout" || errorCode == "ExchangeNotAvailable" ||
		errorCode == "NetworkError" || errorCode == "OnMaintenance"
}

// placeStepInner does the work of one order and fills in result on success.
func (this *OrderRouter) placeStepInner(result map[string]any, step map[string]any, venues map[string]IExchange, options map[string]any, usdRates map[string]any, strategy string, sink *orderRouterSink) error {
	exchangeId := routerStringAt(step, "exchangeId", "")
	symbol := routerStringAt(step, "symbol", "")
	side := routerStringAt(step, "side", "")
	venue, present := venues[exchangeId]
	if !present || venue == nil {
		return NewError("venue_missing", "OrderRouter: no venue instance for "+exchangeId)
	}
	snapper, ok := venue.(orderRouterPrecision)
	if !ok {
		return NotSupported("OrderRouter: " + exchangeId + " cannot snap an amount onto its market precision")
	}
	amount, amountOk := routerParseFloat(ToString(snapper.AmountToPrecision(symbol, routerNumberAt(step, "amount", 0))))
	price, priceOk := routerParseFloat(ToString(snapper.PriceToPrecision(symbol, routerNumberAt(step, "limitPrice", 0))))
	if !amountOk || !priceOk || !(amount > 0) || !(price > 0) {
		return NewError("rounded_to_zero", "OrderRouter: the snapped amount or price is not positive")
	}
	// CLAUDE.md: compute the notional before EVERY CreateOrder. The plan-level
	// check already ran, but the plan can have been resized by a reconciliation
	// since, and the snapped price is not the one that was checked.
	if err := this.assertUnderCap(step, amount, price, usdRates, options); err != nil {
		return err
	}
	orderParams := map[string]any{}
	extra := routerDictAt(options, "orderParams")
	for key, value := range extra {
		orderParams[key] = value
	}
	// No clientOrderId is set here. Whatever the caller put in options orderParams travels
	// as-is, and each exchange's CreateOrder keeps sending whatever identifier it generates
	// on its own; the id the venue reports back is recorded on the result once the order
	// returns. (An id derived from the plan identity used to be forced onto every step, but
	// venues disagree on its length and charset, so it was rejected exactly where it
	// mattered.)
	attempt := routerNumberAt(step, "attempt", 0)
	result["attempt"] = attempt
	var order Order
	var err error
	if strategy == "limit_protected" {
		order, err = this.placeProtectedLimit(venue, step, symbol, side, amount, price, orderParams, options, sink, result)
	} else {
		order, err = this.placeImmediateOrder(venue, symbol, side, amount, price, orderParams, options, result)
	}
	if err != nil {
		return err
	}
	result["orderId"] = routerDerefString(order.Id)
	result["clientOrderId"] = routerDerefString(order.ClientOrderId)
	// "the venue said zero" and "the venue said nothing" are different facts that used to produce
	// the same number: a nil Filled read as 0, reconciliation called that nothing_filled and
	// halted the route while a real position existed. Test presence — and finiteness too, since a
	// NaN reaching the report makes json.Marshal of the whole thing fail.
	if !routerHasFloat(order.Filled) && routerStringAt(result, "orderId", "") != "" {
		// One re-read, exactly as placeProtectedLimit already does after its poll. The immediate
		// path never did, so it could only ever fabricate.
		order = routerRefetchOrder(venue, routerStringAt(result, "orderId", ""), symbol, order)
	}
	// An order the venue explicitly calls open is RESTING, and on this path it must not be:
	// placeImmediateOrder asked for immediate-or-cancel, so a venue that silently dropped the
	// timeInForce param has left a plain limit order sitting on the book. Recording it and
	// walking on was not enough — the next hop then trades on top of a position that keeps
	// growing behind it, is sized from a fill that is already out of date, and the leftover
	// order is still live after the route has ended and nobody is watching it. So it is
	// cancelled and re-read here, exactly as placeProtectedLimit does on its timeout path.
	restingCancelFailed := false
	if strategy != "limit_protected" && routerDerefString(order.Status) == "open" && routerStringAt(result, "orderId", "") != "" {
		if _, cancelErr := venue.CancelOrder(routerStringAt(result, "orderId", ""), WithCancelOrderSymbol(symbol)); cancelErr != nil {
			// the order may still be live and its fill can still move, so whatever this step
			// reports below is a snapshot that is already stale. The status is downgraded after
			// the amounts are filled in, not here: a cost the venue DID report is a fact, and
			// BuildUnwindPlan subtracts it.
			restingCancelFailed = true
		} else {
			// ALWAYS re-read after a cancel: the cancel and the fill can cross, and the observed
			// order is the only authority on what actually happened
			order = routerRefetchOrder(venue, routerStringAt(result, "orderId", ""), symbol, order)
		}
	}
	filledKnown := routerHasFloat(order.Filled)
	filled := routerDerefFloat(order.Filled)
	averageKnown := routerHasFloat(order.Average) || routerHasFloat(order.Price)
	average := routerDerefFloat(order.Average)
	if average <= 0 {
		average = routerDerefFloat(order.Price)
	}
	if average <= 0 {
		average = price
	}
	costKnown := routerHasFloat(order.Cost)
	cost := routerDerefFloat(order.Cost)
	if cost <= 0 {
		cost = filled * average
	}
	result["filledKnown"] = filledKnown
	result["averageKnown"] = averageKnown
	result["costKnown"] = costKnown
	result["filledAmount"] = filled
	result["averagePrice"] = average
	result["cost"] = cost
	if side == "buy" {
		result["inAsset"] = routerStringAt(step, "quote", "")
		result["inAmount"] = cost
		result["outAsset"] = routerStringAt(step, "base", "")
		result["outAmount"] = filled
	} else {
		result["inAsset"] = routerStringAt(step, "base", "")
		result["inAmount"] = filled
		result["outAsset"] = routerStringAt(step, "quote", "")
		result["outAmount"] = cost
	}
	// Net the taker fee out of what is CARRIED FORWARD when the venue charged it in the asset this
	// step produced: filled and cost are gross of fees, so the next hop was sized on money that
	// never arrived. Fees in any other currency come out of what was already spent.
	feeCost := routerOrderFeeInAsset(order, routerStringAt(result, "outAsset", ""))
	result["feeCost"] = feeCost
	result["feeCurrency"] = routerStringAt(result, "outAsset", "")
	if feeCost > 0 {
		net := routerNumberAt(result, "outAmount", 0) - feeCost
		if net < 0 {
			net = 0
		}
		result["grossOutAmount"] = routerNumberAt(result, "outAmount", 0)
		result["outAmount"] = net
	}
	if !filledKnown {
		// Refuse to reconcile on a fabricated fill: halting on an unknown quantity is recoverable,
		// sizing the next hop from an invented number is not.
		result["status"] = "outcome_unknown"
		routerRecordOpenOrder(sink, exchangeId, symbol, routerStringAt(result, "orderId", ""), "fill_unconfirmed")
		sink.placed++
		return nil
	}
	if filled <= 0 {
		result["status"] = "unfilled"
	} else if filled >= amount*(1-OrderRouterTolerance) {
		result["status"] = "filled"
	} else {
		result["status"] = "partial"
	}
	if restingCancelFailed {
		// a resting order this class could not cancel is the worst outcome there is: it can
		// still fill, in full, after the route has returned. Sizing the next hop on the fill
		// recorded above would trade against a position that is still moving, so the step is
		// marked unknown and executeSequential stops here.
		result["status"] = "outcome_unknown"
		routerRecordOpenOrder(sink, exchangeId, symbol, routerStringAt(result, "orderId", ""), "cancel_failed")
	} else if routerDerefString(order.Status) == "open" {
		// cancelled — or on the limit_protected path, cancelled by placeProtectedLimit — and
		// the venue STILL calls it open. The order is live whatever this class asked for, so
		// the same rule applies: report it, and refuse to size anything downstream from a fill
		// that can still grow.
		result["status"] = "outcome_unknown"
		routerRecordOpenOrder(sink, exchangeId, symbol, routerStringAt(result, "orderId", ""), "still_open")
	}
	sink.placed = sink.placed + 1
	return nil
}

// routerErrorCode names an error by its ccxt class, which is the one label all
// six languages agree on.
func routerErrorCode(err error) string {
	if err == nil {
		return "unknown_error"
	}
	var ccxtError *Error
	if errors.As(err, &ccxtError) {
		code := string(ccxtError.Type)
		if code != "" {
			return code
		}
	}
	return "unknown_error"
}

// routerRecoveredError turns whatever a panic carried into an error, preserving
// a ccxt error class when the panic value has one.
func routerRecoveredError(recovered any) error {
	if err, ok := recovered.(error); ok {
		return err
	}
	if text, ok := recovered.(string); ok {
		if IsError(text) {
			return CreateReturnError(text)
		}
		return NewError("unknown_error", text)
	}
	return NewError("unknown_error", ToString(recovered))
}

// routerErrorRecord builds one report error entry.
// routerRecordOpenOrder appends one possibly-live order to a step's sink,
// ignoring a blank id and never recording the same id twice.
func routerRecordOpenOrder(sink *orderRouterSink, exchangeId string, symbol string, orderId string, reason string) {
	if orderId == "" {
		// nothing to point an operator at
		return
	}
	for i := 0; i < len(sink.openOrders); i++ {
		if routerStringAt(sink.openOrders[i], "orderId", "") == orderId && routerStringAt(sink.openOrders[i], "exchangeId", "") == exchangeId {
			return
		}
	}
	sink.openOrders = append(sink.openOrders, map[string]any{"exchangeId": exchangeId, "symbol": symbol, "orderId": orderId, "reason": reason})
}

func routerErrorRecord(stepIndex float64, exchangeId string, symbol string, code string) map[string]any {
	return map[string]any{"stepIndex": stepIndex, "exchangeId": exchangeId, "symbol": symbol, "code": code}
}

// routerDerefFloat reads an optional float64 as 0 when absent — the class emits
// no nulls, and 0 is its "unknown number".
// routerHasFloat reports whether an optional number is an ANSWER: present and finite. A nil
// pointer is the venue saying nothing, and a NaN is worse than nothing — it fails every
// comparison, so it is neither filtered nor ordered, and it makes json.Marshal of the report fail.
// routerHasNumberAt reports whether a map carries a usable number at key, mirroring
// routerNumberAt's coercion so "usable" and "present" cannot disagree.
func routerHasNumberAt(container any, key string) bool {
	m, ok := container.(map[string]any)
	if !ok {
		return false
	}
	value, present := m[key]
	if !present || value == nil {
		return false
	}
	// Reuse routerToNumber rather than re-deriving the coercion: "the value is usable" and "the
	// value is present" must never disagree, and two copies of that rule is how they would.
	return routerIsFiniteNumber(routerToNumber(value, math.NaN()))
}

// routerAssertChainCoherent refuses a route whose hops do not connect, or that does not run from
// the asset the caller offered to the asset the caller wanted. BuildExecutionPlan used to copy
// from, to, pair and side straight out of the server's JSON.
func routerAssertChainCoherent(route map[string]any, hops []any) error {
	if len(hops) == 0 {
		return nil
	}
	carried := ""
	for i := 0; i < len(hops); i++ {
		hop := hops[i]
		side := strings.ToLower(routerStringAt(hop, "side", ""))
		base := strings.ToUpper(routerStringAt(hop, "base", ""))
		quote := strings.ToUpper(routerStringAt(hop, "quote", ""))
		if base == "" || quote == "" || (side != "buy" && side != "sell") {
			return ExchangeError("OrderRouter: hop " + strconv.Itoa(i) + " does not name a market and a side")
		}
		// a buy spends the quote to acquire the base; a sell is the reverse
		spends := base
		produces := quote
		if side == "buy" {
			spends = quote
			produces = base
		}
		if i > 0 && spends != carried {
			return ExchangeError("OrderRouter: hop " + strconv.Itoa(i) + " spends " + spends + " but the previous hop produced " + carried)
		}
		if i == 0 {
			requestedFrom := routerStringAt(route, "clientRequestedFrom", "")
			if requestedFrom != "" && spends != requestedFrom {
				return ExchangeError("OrderRouter: the route spends " + spends + ", not the requested " + requestedFrom)
			}
		}
		carried = produces
	}
	requestedTo := routerStringAt(route, "clientRequestedTo", "")
	if requestedTo != "" && carried != requestedTo {
		return ExchangeError("OrderRouter: the route produces " + carried + ", not the requested " + requestedTo)
	}
	return nil
}

// routerOrderFeeInAsset sums the fees an order charged in one asset, ignoring any other currency.
// ccxt reports the same cut in more than one place, so this is a strict TIERED PRECEDENCE and
// never a sum across tiers: the reference port reads the `fees` list first, then the single
// `fee`, and only then the per-trade fees. This port has no `fees` list on its typed Order, so
// its two tiers are `Fee` and then, only if that named nothing in this asset, Trades — `sawFee`
// is what makes the first tier exclusive of the second. Adding them together would double-count
// the same charge. Within ONE tier every matching entry IS summed.
func routerOrderFeeInAsset(order Order, asset string) float64 {
	if asset == "" {
		return 0
	}
	total := 0.0
	// The Go typed Order carries a single Fee and no Fees list, so the `fees` branch the other
	// five ports read first has no counterpart here. What it has instead is Trades, and the
	// reference reads per-trade fees as its own last resort, so the two agree on any order that
	// reports its cut per trade.
	//
	// Reading NOTHING here is the DANGEROUS direction, not a conservative one — an earlier
	// comment on this function had it exactly backwards. An unread fee leaves outAmount GROSS,
	// and the next hop is then sized on money the venue has already taken: the order is too big
	// and fails, or fills against a balance that is not there. Under-stating what arrived is the
	// safe error; over-stating it is not.
	sawFee := false
	fee := order.Fee
	if fee.Currency != nil && strings.EqualFold(*fee.Currency, asset) && fee.Cost != nil {
		total = total + *fee.Cost
		sawFee = true
	}
	if !sawFee {
		for i := 0; i < len(order.Trades); i++ {
			tradeFee := order.Trades[i].Fee
			if tradeFee.Currency != nil && strings.EqualFold(*tradeFee.Currency, asset) && tradeFee.Cost != nil {
				total = total + *tradeFee.Cost
			}
		}
	}
	if !routerIsFiniteNumber(total) || total < 0 {
		return 0
	}
	return total
}

func routerHasFloat(value *float64) bool {
	return value != nil && routerIsFiniteNumber(*value)
}

// routerRefetchOrder re-reads one order, keeping the previous body when the venue cannot be asked.
func routerRefetchOrder(venue IExchange, orderId string, symbol string, fallback Order) Order {
	reread, err := venue.FetchOrder(orderId, WithFetchOrderSymbol(symbol))
	if err != nil {
		// the caller marks the fill unknown; an error here must not lose the placement record
		return fallback
	}
	return reread
}

func routerDerefFloat(value *float64) float64 {
	if value == nil {
		return 0
	}
	return *value
}

// routerDerefString reads an optional string as "" when absent.
func routerDerefString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

// placeImmediateOrder places an immediate-or-cancel limit order, falling back to
// a market order only when the venue cannot do IOC and the caller explicitly
// allowed it.
func (this *OrderRouter) placeImmediateOrder(venue IExchange, symbol string, side string, amount float64, price float64, orderParams map[string]any, options map[string]any, result map[string]any) (Order, error) {
	if this.venueSupportsIoc(venue) {
		orderParams["timeInForce"] = "IOC"
		// set immediately before the call that can leave a real order on a real venue
		result["placementAttempted"] = true
		iocOrder, err := venue.CreateOrder(symbol, "limit", side, amount, WithCreateOrderPrice(price), WithCreateOrderParams(orderParams))
		result["orderId"] = routerDerefString(iocOrder.Id)
		return iocOrder, err
	}
	if !routerBoolAt(options, "allowMarketOrders", false) {
		// a market order is an unbounded price, and switching to one on a
		// caller's behalf is exactly the decision they did not delegate
		return Order{}, NotSupported("OrderRouter: venue cannot do IOC and allowMarketOrders was not set")
	}
	// A market order and a notional cap cannot both be honoured. assertUnderCap valued this order
	// at the plan's LIMIT price, and the call below sends no price at all: the venue fills wherever
	// the book is, which is the one thing the cap exists to bound. Passing the check and then
	// removing the price it was computed from is a cap that silently disappears, which by this
	// file's own rule is not a cap. So the two options are refused together.
	if routerNumberAt(options, "maxNotionalUsd", this.MaxNotionalUsd) > 0 {
		return Order{}, NotSupported("OrderRouter: allowMarketOrders cannot be honoured under a maxNotionalUsd cap, because a market order has no price to check")
	}
	result["placementAttempted"] = true
	marketOrder, err := venue.CreateOrder(symbol, "market", side, amount, WithCreateOrderParams(orderParams))
	result["orderId"] = routerDerefString(marketOrder.Id)
	return marketOrder, err
}

// placeProtectedLimit rests a limit order, then cancels it on timeout and ALWAYS
// re-reads it, because a cancel and a fill can cross. The order as last observed
// is the authoritative fill.
func (this *OrderRouter) placeProtectedLimit(venue IExchange, step map[string]any, symbol string, side string, amount float64, price float64, orderParams map[string]any, options map[string]any, sink *orderRouterSink, result map[string]any) (Order, error) {
	timeoutMs := routerNumberAt(options, "orderTimeoutMs", OrderRouterDefaultOrderTimeoutMs)
	pollIntervalMs := routerNumberAt(options, "pollIntervalMs", OrderRouterDefaultPollIntervalMs)
	result["placementAttempted"] = true
	order, err := venue.CreateOrder(symbol, "limit", side, amount, WithCreateOrderPrice(price), WithCreateOrderParams(orderParams))
	if err != nil {
		return Order{}, err
	}
	orderId := routerDerefString(order.Id)
	// before the first poll, the first sleep and the first thing that can go
	// wrong: from here on the caller can always name what is resting
	result["orderId"] = orderId
	waited := 0.0
	for waited < timeoutMs {
		status := routerDerefString(order.Status)
		if status == "closed" || status == "canceled" {
			return order, nil
		}
		time.Sleep(time.Duration(pollIntervalMs) * time.Millisecond)
		waited = waited + pollIntervalMs
		order, err = venue.FetchOrder(orderId, WithFetchOrderSymbol(symbol))
		if err != nil {
			return Order{}, err
		}
	}
	finalStatus := routerDerefString(order.Status)
	if finalStatus == "closed" || finalStatus == "canceled" {
		// the venue ended it on the last poll — an expiry, a self-trade
		// prevention, a post-only rejection of the remainder. Cancelling an order
		// the venue already closed errors, and the partial fill this order carries
		// is real: dropping it would hide a live position from the report AND from
		// the unwind plan built out of it.
		return order, nil
	}
	if _, err := venue.CancelOrder(orderId, WithCancelOrderSymbol(symbol)); err != nil {
		// the order may still be live. Reporting a fill we did not observe would
		// be a lie, and continuing to the next hop on top of an unknown position
		// is worse.
		routerRecordOpenOrder(sink, routerStringAt(step, "exchangeId", ""), symbol, orderId, "cancel_failed")
		return Order{}, ExchangeError("OrderRouter: cancelOrder failed and an order is left OPEN, refusing to proceed")
	}
	// ALWAYS re-read after a cancel: the cancel and the fill can cross, and the
	// observed order is the only authority on what actually happened
	return venue.FetchOrder(orderId, WithFetchOrderSymbol(symbol))
}

// venueSupportsIoc reports whether a venue is known NOT to support
// immediate-or-cancel.
func (this *OrderRouter) venueSupportsIoc(venue IExchange) bool {
	// Defaults to TRUE on purpose. An unknown answer here must not fall through
	// to a market order; a rejected IOC is a loud, cheap failure and an
	// unintended market order is a silent, expensive one.
	features := venue.GetFeatures()
	spot := routerDictAt(features, "spot")
	createOrder := routerDictAt(spot, "createOrder")
	// EVERY real ccxt exchange declares this as a dictionary of booleans —
	// {"IOC": true, "FOK": true, "GTC": true, ...} — and not one declares it as a
	// list. Reading it as a list only ever answered "empty", which is the same
	// answer as "the venue said nothing", so the check always said yes and the
	// market-order path below was unreachable.
	timeInForceFlags := routerDictAt(createOrder, "timeInForce")
	if len(timeInForceFlags) > 0 {
		// a venue that enumerates its time-in-force values and leaves IOC out has
		// said no, exactly as one that says IOC: false has
		return routerBoolAt(timeInForceFlags, "IOC", false)
	}
	// a list is still honoured, for a caller-built stub venue
	timeInForce := routerListAt(createOrder, "timeInForce")
	if len(timeInForce) == 0 {
		return true
	}
	for i := 0; i < len(timeInForce); i++ {
		if text, ok := timeInForce[i].(string); ok && text == "IOC" {
			return true
		}
	}
	return false
}

// assertUnderCap refuses unless a single order's USD notional is known and
// within the per-trade cap. With no cap set it has nothing to enforce and returns
// immediately.
func (this *OrderRouter) assertUnderCap(step map[string]any, amount float64, price float64, usdRates map[string]any, options map[string]any) error {
	notionalCap := routerNumberAt(options, "maxNotionalUsd", this.MaxNotionalUsd)
	if notionalCap <= 0 {
		// no cap set, so there is nothing to enforce here
		return nil
	}
	probe := map[string]any{
		"base":   routerStringAt(step, "base", ""),
		"quote":  routerStringAt(step, "quote", ""),
		"amount": amount,
	}
	usdValue := this.notionalUsd(probe, amount*price, usdRates)
	if usdValue <= 0 {
		return ExchangeError("OrderRouter: refusing to place an order that cannot be valued in USD")
	}
	if usdValue > notionalCap*(1+OrderRouterTolerance) {
		return ExchangeError("OrderRouter: refusing to place an order above the per-trade USD notional cap")
	}
	return nil
}

// assertPrefunded verifies every step's input is already sitting on its venue,
// which is what atomic_ish actually requires.
func (this *OrderRouter) assertPrefunded(steps []map[string]any, venues map[string]IExchange) error {
	// built as a slice, not a map, so the first shortfall reported is the same
	// one in all six languages
	required := make([]map[string]any, 0)
	for i := 0; i < len(steps); i++ {
		step := steps[i]
		exchangeId := routerStringAt(step, "exchangeId", "")
		amount := routerNumberAt(step, "amount", 0)
		asset := ""
		needed := 0.0
		if routerStringAt(step, "side", "") == "buy" {
			asset = routerStringAt(step, "quote", "")
			needed = amount * routerNumberAt(step, "limitPrice", 0)
		} else {
			asset = routerStringAt(step, "base", "")
			needed = amount
		}
		found := false
		for j := 0; j < len(required); j++ {
			if routerStringAt(required[j], "exchangeId", "") == exchangeId && routerStringAt(required[j], "asset", "") == asset {
				required[j]["amount"] = routerNumberAt(required[j], "amount", 0) + needed
				found = true
				break
			}
		}
		if !found {
			required = append(required, map[string]any{"exchangeId": exchangeId, "asset": asset, "amount": needed})
		}
	}
	balances := map[string]Balances{}
	for i := 0; i < len(required); i++ {
		exchangeId := routerStringAt(required[i], "exchangeId", "")
		if _, cached := balances[exchangeId]; !cached {
			venue, present := venues[exchangeId]
			if !present || venue == nil {
				return ArgumentsRequired("OrderRouter: atomic_ish needs a venue instance for " + exchangeId)
			}
			balance, err := venue.FetchBalance()
			if err != nil {
				return err
			}
			balances[exchangeId] = balance
		}
		free := balances[exchangeId].Free
		asset := routerStringAt(required[i], "asset", "")
		available := 0.0
		if free != nil && free[asset] != nil {
			available = *free[asset]
		}
		if available < routerNumberAt(required[i], "amount", 0) {
			// most routes fail this, and that is the correct outcome: atomic_ish
			// names its own hedge, because there is no cross-venue atomicity and
			// there cannot be
			return InsufficientFunds("OrderRouter: atomic_ish requires the whole route pre-funded, and " + exchangeId + " is short of " + asset)
		}
	}
	return nil
}

// applyResize writes a reconciliation's downstream resize back into the working
// steps.
func (this *OrderRouter) applyResize(steps []map[string]any, reconciliation map[string]any) {
	// Record what this leg produced BEFORE resizing anything: ReconcileExecutionStep is pure and
	// cannot remember across calls, so the hop's cumulative shortfall lives on the steps.
	reconciledStep := routerNumberAt(reconciliation, "stepIndex", -1)
	for j := 0; j < len(steps); j++ {
		if routerNumberAt(steps[j], "stepIndex", -1) == reconciledStep {
			steps[j]["realisedOut"] = routerNumberAt(reconciliation, "realisedOut", 0)
			break
		}
	}
	resized := routerListAt(reconciliation, "resizedSteps")
	for i := 0; i < len(resized); i++ {
		entry := resized[i]
		stepIndex := routerNumberAt(entry, "stepIndex", -1)
		for j := 0; j < len(steps); j++ {
			if routerNumberAt(steps[j], "stepIndex", -1) == stepIndex {
				steps[j]["amount"] = routerNumberAt(entry, "amount", 0)
				steps[j]["notionalQuote"] = routerNumberAt(entry, "notionalQuote", 0)
				break
			}
		}
	}
}

// markRemainingSkipped marks every step from an index onwards as skipped after a
// halt.
func (this *OrderRouter) markRemainingSkipped(results []map[string]any, start int) {
	for i := start; i < len(results); i++ {
		if routerStringAt(results[i], "status", "") == "planned" {
			results[i]["status"] = "skipped"
		}
	}
}

// summariseReport totals what the first hop spent and what the last hop produced.
func (this *OrderRouter) summariseReport(report map[string]any, results []map[string]any, steps []map[string]any) {
	lastHop := 0.0
	for i := 0; i < len(steps); i++ {
		hopIndex := routerNumberAt(steps[i], "hopIndex", 0)
		if hopIndex > lastHop {
			lastHop = hopIndex
		}
	}
	filledIn := 0.0
	filledOut := 0.0
	for i := 0; i < len(results); i++ {
		hopIndex := routerNumberAt(results[i], "hopIndex", 0)
		if hopIndex == 0 {
			filledIn = filledIn + routerNumberAt(results[i], "inAmount", 0)
		}
		if hopIndex == lastHop {
			filledOut = filledOut + routerNumberAt(results[i], "outAmount", 0)
		}
	}
	report["filledIn"] = filledIn
	report["filledOut"] = filledOut
}
