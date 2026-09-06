package ccxt

//  ---------------------------------------------------------------------------
//  OrderRouter — offline tests.
//
//  Run:  go -C go/v4 test -run OrderRouter
//
//  Two halves, and both matter:
//
//  1. The FIXTURE half drives the four pure methods from
//     ts/src/test/base/fixtures/orderRouter.json — the SAME file the TypeScript,
//     Python, PHP and C# suites read. Nothing here restates an expected value by
//     hand, so a port that drifts fails in its own language and nowhere else,
//     which is what makes drift impossible to hide. The comparison follows the
//     algorithm the fixture documents in its `comparison` field: key sets are
//     compared in BOTH directions, numbers at a relative tolerance of 1e-9 and
//     never as text.
//
//  2. The INVARIANT half asserts the safety properties directly. The fixture's
//     expectations were produced by the reference implementation, so on their own
//     they would only prove the five languages agree — not that they agree on the
//     right answer.
//
//  Nothing here touches the network and nothing here places a real order.
//  ---------------------------------------------------------------------------

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
)

//  ---------------------------------------------------------------------------
//  comparison helpers — the algorithm every port's test must use
//  ---------------------------------------------------------------------------

const orderRouterTestTolerance = 1e-9

func routerNumbersMatch(a float64, b float64) bool {
	if a == b {
		return true
	}
	if math.IsInf(a, 0) || math.IsInf(b, 0) || math.IsNaN(a) || math.IsNaN(b) {
		// an infinity only ever matches itself. Without this the relative
		// comparison below reads +Inf <= +Inf as a match and an infinite value
		// passes against ANY expectation — which is exactly how a number grammar
		// that overflows would slip past the numberCases table
		return false
	}
	scale := 1.0
	if math.Abs(a) > scale {
		scale = math.Abs(a)
	}
	if math.Abs(b) > scale {
		scale = math.Abs(b)
	}
	return math.Abs(a-b) <= orderRouterTestTolerance*scale
}

// routerNormalise widens the several concrete shapes this package produces into
// the shape encoding/json decodes the fixture into, so the two trees compare
// node for node.
func routerNormalise(value any) any {
	switch typed := value.(type) {
	case map[string]any:
		normalised := make(map[string]any, len(typed))
		for key, nested := range typed {
			normalised[key] = routerNormalise(nested)
		}
		return normalised
	case []map[string]any:
		normalised := make([]any, len(typed))
		for i := 0; i < len(typed); i++ {
			normalised[i] = routerNormalise(typed[i])
		}
		return normalised
	case []any:
		normalised := make([]any, len(typed))
		for i := 0; i < len(typed); i++ {
			normalised[i] = routerNormalise(typed[i])
		}
		return normalised
	case int:
		return float64(typed)
	case int64:
		return float64(typed)
	case float32:
		return float64(typed)
	}
	return value
}

func routerSortedKeys(dict map[string]any) []string {
	keys := make([]string, 0, len(dict))
	for key := range dict {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return keys
}

func routerAssertMatches(t *testing.T, actual any, expected any, where string) {
	t.Helper()
	switch typed := expected.(type) {
	case []any:
		list, ok := actual.([]any)
		if !ok {
			t.Fatalf("%s: expected an array, got %T", where, actual)
		}
		if len(list) != len(typed) {
			t.Fatalf("%s: array length %d, expected %d", where, len(list), len(typed))
		}
		for i := 0; i < len(typed); i++ {
			routerAssertMatches(t, list[i], typed[i], fmt.Sprintf("%s[%d]", where, i))
		}
	case map[string]any:
		dict, ok := actual.(map[string]any)
		if !ok {
			t.Fatalf("%s: expected an object, got %T", where, actual)
		}
		// both directions: a missing field and an invented field are both drift
		expectedKeys := routerSortedKeys(typed)
		actualKeys := routerSortedKeys(dict)
		if strings.Join(actualKeys, ",") != strings.Join(expectedKeys, ",") {
			t.Fatalf("%s: key set %v, expected %v", where, actualKeys, expectedKeys)
		}
		for i := 0; i < len(expectedKeys); i++ {
			key := expectedKeys[i]
			routerAssertMatches(t, dict[key], typed[key], where+"."+key)
		}
	case float64:
		number, ok := actual.(float64)
		if !ok {
			t.Fatalf("%s: expected the number %v, got %T %v", where, typed, actual, actual)
		}
		if !routerNumbersMatch(number, typed) {
			t.Fatalf("%s: expected %v, got %v", where, typed, number)
		}
	default:
		if actual != expected {
			t.Fatalf("%s: expected %v, got %v", where, expected, actual)
		}
	}
}

//  ---------------------------------------------------------------------------
//  the shared fixture
//  ---------------------------------------------------------------------------

func routerFixture(t *testing.T) map[string]any {
	t.Helper()
	path := filepath.Join("..", "..", "ts", "src", "test", "base", "fixtures", "orderRouter.json")
	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("the shared fixture is unreadable at %s: %v", path, err)
	}
	var fixture map[string]any
	if err := json.Unmarshal(raw, &fixture); err != nil {
		t.Fatalf("the shared fixture is not valid JSON: %v", err)
	}
	return fixture
}

func routerFixtureCases(t *testing.T, fixture map[string]any, section string) []map[string]any {
	t.Helper()
	raw := routerListAt(fixture, section)
	if len(raw) == 0 {
		t.Fatalf("the fixture has no %s", section)
	}
	cases := make([]map[string]any, 0, len(raw))
	for i := 0; i < len(raw); i++ {
		cases = append(cases, raw[i].(map[string]any))
	}
	return cases
}

func routerTestRouter(t *testing.T) *OrderRouter {
	t.Helper()
	router, err := NewOrderRouter(map[string]any{"apiKey": "test-key"})
	if err != nil {
		t.Fatalf("NewOrderRouter: %v", err)
	}
	return router
}

func TestOrderRouterFixtureBuildExecutionPlan(t *testing.T) {
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	for _, testCase := range routerFixtureCases(t, fixture, "planCases") {
		route := routerDictAt(routerDictAt(fixture, "routes"), routerStringAt(testCase, "route", ""))
		plan := routerMustPlan(router.BuildExecutionPlan(route, routerDictAt(testCase, "options")))
		routerAssertMatches(t, routerNormalise(plan), routerNormalise(testCase["expected"]), "planCase "+routerStringAt(testCase, "id", ""))
	}
}

func TestOrderRouterFixtureBuildExecutionPlanIsDeterministic(t *testing.T) {
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	for _, testCase := range routerFixtureCases(t, fixture, "planCases") {
		route := routerDictAt(routerDictAt(fixture, "routes"), routerStringAt(testCase, "route", ""))
		options := routerDictAt(testCase, "options")
		before, _ := json.Marshal(route)
		first := routerMustPlan(router.BuildExecutionPlan(route, options))
		second := routerMustPlan(router.BuildExecutionPlan(route, options))
		routerAssertMatches(t, routerNormalise(second), routerNormalise(first), "planCase "+routerStringAt(testCase, "id", "")+" repeated")
		after, _ := json.Marshal(route)
		if string(before) != string(after) {
			t.Fatalf("planCase %s: the route was mutated", routerStringAt(testCase, "id", ""))
		}
	}
}

func TestOrderRouterFixtureCheckExecutionPlanSafety(t *testing.T) {
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	for _, testCase := range routerFixtureCases(t, fixture, "safetyCases") {
		route := routerDictAt(routerDictAt(fixture, "routes"), routerStringAt(testCase, "route", ""))
		markets := routerDictAt(routerDictAt(fixture, "marketSets"), routerStringAt(testCase, "markets", ""))
		plan := routerMustPlan(router.BuildExecutionPlan(route, routerDictAt(testCase, "planOptions")))
		violations := router.CheckExecutionPlanSafety(plan, markets, routerDictAt(testCase, "options"))
		routerAssertMatches(t, routerNormalise(violations), routerNormalise(testCase["expected"]), "safetyCase "+routerStringAt(testCase, "id", ""))
	}
}

func TestOrderRouterFixtureReconcileExecutionStep(t *testing.T) {
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	for _, testCase := range routerFixtureCases(t, fixture, "reconcileCases") {
		// a case names either a route to plan from, or a plan written out in full
		// — the latter is how a plan with field types no builder produces (an int
		// hopIndex on one step and a float on the next) gets covered
		var plan map[string]any
		if named := routerStringAt(testCase, "plan", ""); named != "" {
			plan = routerDictAt(routerDictAt(fixture, "plans"), named)
		} else {
			route := routerDictAt(routerDictAt(fixture, "routes"), routerStringAt(testCase, "route", ""))
			plan = routerMustPlan(router.BuildExecutionPlan(route, routerDictAt(testCase, "planOptions")))
		}
		stepIndex := int(routerNumberAt(testCase, "stepIndex", 0))
		verdict, err := router.ReconcileExecutionStep(plan, stepIndex, routerNumberAt(testCase, "realisedOut", 0))
		if err != nil {
			t.Fatalf("reconcileCase %s: %v", routerStringAt(testCase, "id", ""), err)
		}
		routerAssertMatches(t, routerNormalise(verdict), routerNormalise(testCase["expected"]), "reconcileCase "+routerStringAt(testCase, "id", ""))
	}
}

// TestOrderRouterFixtureNumberAt asserts the ONE number grammar. Every port
// hand-implements JavaScript's parseFloat prefix rather than calling its own
// parser, because every language's own parser disagrees with the other four
// somewhere: Go's strconv.ParseFloat refuses "12abc" outright and reports an
// overflowing "1e400" as an error the other four read as an infinity. A cap read
// as 1234.5 in one language and 1 in another is a cap that silently disappears,
// and this table is what stops that shipping green.
func TestOrderRouterFixtureNumberAt(t *testing.T) {
	fixture := routerFixture(t)
	for _, testCase := range routerFixtureCases(t, fixture, "numberCases") {
		id := routerStringAt(testCase, "id", "")
		container := routerDictAt(testCase, "container")
		key := routerStringAt(testCase, "key", "")
		defaultValue := routerNumberAt(testCase, "default", 0)
		expected := routerNumberAt(testCase, "expected", 0)
		actual := routerNumberAt(container, key, defaultValue)
		if !routerNumbersMatch(actual, expected) {
			t.Fatalf("numberCase %s: expected %v, got %v", id, expected, actual)
		}
	}
}

func TestOrderRouterFixtureBuildUnwindPlan(t *testing.T) {
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	for _, testCase := range routerFixtureCases(t, fixture, "unwindCases") {
		report := routerDictAt(routerDictAt(fixture, "reports"), routerStringAt(testCase, "report", ""))
		unwind := router.BuildUnwindPlan(report)
		routerAssertMatches(t, routerNormalise(unwind), routerNormalise(testCase["expected"]), "unwindCase "+routerStringAt(testCase, "id", ""))
	}
}

func TestOrderRouterFixtureFormatNumber(t *testing.T) {
	// FormatNumber builds the balances query string. A balance spelled differently per language
	// is a DIFFERENT QUESTION asked of the router, so the tie cases here are load-bearing: every
	// port's native fixed-point formatter but JavaScript's rounds half to EVEN, and this table is
	// what pins all six to the reference's away-from-zero rule.
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	for _, testCase := range routerFixtureCases(t, fixture, "formatNumberCases") {
		id := routerStringAt(testCase, "id", "")
		expected := routerStringAt(testCase, "expected", "")
		actual, err := router.FormatNumber(routerNumberAt(testCase, "value", 0))
		if err != nil {
			t.Fatalf("formatNumberCase %s: %v", id, err)
		}
		if actual != expected {
			t.Fatalf("formatNumberCase %s: expected %s, got %s", id, expected, actual)
		}
	}
}

// routerFixtureFee reads one {cost, currency} entry off the fixture, returning a
// Fee with a nil Currency when the entry is empty — which is how a case says the
// order carries no top-level fee at all.
func routerFixtureFee(entry map[string]any) Fee {
	currency := routerStringAt(entry, "currency", "")
	if currency == "" {
		return Fee{}
	}
	cost := routerNumberAt(entry, "cost", 0)
	return Fee{Cost: &cost, Currency: &currency}
}

func TestOrderRouterFixtureFeeNetting(t *testing.T) {
	// Fee netting is the one PlaceStep behaviour that CHANGES the size of the next order, and
	// until this section existed it was asserted in TypeScript and nowhere else — a port that
	// silently stopped netting would have shipped green in its own language. Go is the port most
	// exposed to that: its typed Order has no Fees list, so per-trade fees reach it only through
	// Trades, and the last case here is what proves that path is read.
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	for _, testCase := range routerFixtureCases(t, fixture, "feeNettingCases") {
		id := routerStringAt(testCase, "id", "")
		route := routerOneLegRoute(
			routerStringAt(testCase, "side", ""),
			routerStringAt(testCase, "base", ""),
			routerStringAt(testCase, "quote", ""),
			routerNumberAt(testCase, "amount", 0),
			routerNumberAt(testCase, "price", 0),
		)
		plan := routerMustPlan(router.BuildExecutionPlan(route, routerDictAt(testCase, "planOptions")))
		venue := newOrderRouterStubVenue(1, false)
		venue.feeToCharge = routerFixtureFee(routerDictAt(testCase, "fee"))
		tradeFees := routerListAt(testCase, "tradeFees")
		for i := 0; i < len(tradeFees); i++ {
			entry, _ := tradeFees[i].(map[string]any)
			venue.tradeFeesToCharge = append(venue.tradeFeesToCharge, routerFixtureFee(entry))
		}
		report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{
			"strategy": "sequential",
			"live":     true,
			"usdRates": map[string]any{"USDT": 1.0},
		})
		if err != nil {
			t.Fatalf("feeNettingCase %s: %v", id, err)
		}
		steps := routerListAt(report, "steps")
		if len(steps) != 1 {
			t.Fatalf("feeNettingCase %s: expected one step, got %d", id, len(steps))
		}
		step, _ := steps[0].(map[string]any)
		expected := routerDictAt(testCase, "expected")
		for _, field := range []string{"filledAmount", "grossOutAmount", "outAmount", "feeCost"} {
			actual := routerNumberAt(step, field, 0)
			want := routerNumberAt(expected, field, 0)
			if !routerNumbersMatch(actual, want) {
				t.Fatalf("feeNettingCase %s: %s expected %v, got %v", id, field, want, actual)
			}
		}
	}
}

//  ---------------------------------------------------------------------------
//  invariants, asserted directly rather than through the fixture
//  ---------------------------------------------------------------------------

// every route the invariant tests build gets its own requestId: Execute derives both the
// re-execution guard key and the per-step client order ids from it, and refuses a live plan
// that carries neither a requestId nor an idempotencyKey. A counter, not a random value — the
// ids stay reproducible.
var routerTestRequestIdCounter int64

func routerNextTestRequestId() string {
	next := atomic.AddInt64(&routerTestRequestIdCounter, 1)
	return "test-req-" + strconv.FormatInt(next, 10)
}

func routerOneLegRoute(side string, base string, quote string, amount float64, price float64) map[string]any {
	from := base
	to := quote
	amountIn := amount
	amountOut := amount * price
	if side == "buy" {
		from = quote
		to = base
		amountIn = amount * price
		amountOut = amount
	}
	return map[string]any{
		"requestId":        routerNextTestRequestId(),
		"from":             from,
		"to":               to,
		"strategy":         "best_single",
		"exactSide":        "in",
		"amountIn":         amountIn,
		"amountOut":        amountOut,
		"fullyFillable":    true,
		"fillRatio":        1.0,
		"unroutableReason": nil,
		"hops": []any{
			map[string]any{
				"pair":          base + "/" + quote,
				"side":          side,
				"base":          base,
				"quote":         quote,
				"amountIn":      amountIn,
				"amountOut":     amountOut,
				"legs":          []any{map[string]any{"exchangeId": "stub", "amount": amount, "averagePrice": price, "takerFeeRate": 0.0, "feeCost": 0.0, "effectivePrice": price}},
				"fullyFillable": true,
			},
		},
	}
}

func routerTwoHopRoute() map[string]any {
	return map[string]any{
		"requestId":        routerNextTestRequestId(),
		"from":             "USDT",
		"to":               "SOL",
		"strategy":         "best_single",
		"exactSide":        "in",
		"amountIn":         20.0,
		"amountOut":        0.2,
		"fullyFillable":    true,
		"fillRatio":        1.0,
		"unroutableReason": nil,
		"hops": []any{
			map[string]any{"pair": "BTC/USDT", "side": "buy", "base": "BTC", "quote": "USDT", "amountIn": 20.0, "amountOut": 0.2, "legs": []any{map[string]any{"exchangeId": "stub", "amount": 0.2, "averagePrice": 100.0, "effectivePrice": 100.0}}},
			map[string]any{"pair": "BTC/USDT", "side": "sell", "base": "BTC", "quote": "USDT", "amountIn": 0.2, "amountOut": 20.0, "legs": []any{map[string]any{"exchangeId": "stub", "amount": 0.2, "averagePrice": 100.0, "effectivePrice": 100.0}}},
		},
	}
}

func routerStubMarket() map[string]any {
	return map[string]any{
		"symbol":    "BTC/USDT",
		"base":      "BTC",
		"quote":     "USDT",
		"precision": map[string]any{"amount": 0.0, "price": 0.0},
		"limits":    map[string]any{"amount": map[string]any{"min": 0.0, "max": 0.0}, "price": map[string]any{"min": 0.0, "max": 0.0}, "cost": map[string]any{"min": 0.0, "max": 0.0}},
	}
}

func routerPermissiveStubMarkets() map[string]any {
	return map[string]any{"stub": map[string]any{"BTC/USDT": routerStubMarket()}}
}

func routerCodes(violations []map[string]any) []string {
	codes := make([]string, 0, len(violations))
	for i := 0; i < len(violations); i++ {
		codes = append(codes, routerStringAt(violations[i], "code", ""))
	}
	return codes
}

func TestOrderRouterConstructorCapIsAnOptInGuardrailAtAnySize(t *testing.T) {
	if _, err := NewOrderRouter(map[string]any{}); routerErrorCode(err) != "ArgumentsRequired" {
		t.Fatalf("an apiKey is required, got %v", err)
	}
	// No ceiling. A caller trading thousands is using this correctly, and the type
	// does not get to decide otherwise — the old hard 25 USD limit came from this
	// repository's own live-test safety rule, which is not a rule about anyone's money.
	large, err := NewOrderRouter(map[string]any{"apiKey": "k", "maxNotionalUsd": 250000})
	if err != nil || large.MaxNotionalUsd != 250000 {
		t.Fatalf("a large cap is honoured exactly, not clamped, got %v %v", large, err)
	}
	small, err := NewOrderRouter(map[string]any{"apiKey": "k", "maxNotionalUsd": 0.05})
	if err != nil || small.MaxNotionalUsd != 0.05 {
		t.Fatalf("cents are a legitimate trade size, got %v %v", small, err)
	}
	// the default is NO cap
	standard, err := NewOrderRouter(map[string]any{"apiKey": "k"})
	if err != nil || standard.MaxNotionalUsd != OrderRouterNoCap {
		t.Fatalf("the default is no cap, got %v %v", standard, err)
	}
	if OrderRouterNoCap != 0 {
		t.Fatalf("no cap is spelled 0, got %v", OrderRouterNoCap)
	}
	// 0 is the explicit spelling of "no cap"; negative is a typo, and silently
	// ignoring it would leave the caller believing a guardrail is in place
	explicit, err := NewOrderRouter(map[string]any{"apiKey": "k", "maxNotionalUsd": 0})
	if err != nil || explicit.MaxNotionalUsd != 0 {
		t.Fatalf("0 is the explicit spelling of no cap, got %v %v", explicit, err)
	}
	if _, err := NewOrderRouter(map[string]any{"apiKey": "k", "maxNotionalUsd": -1}); routerErrorCode(err) != "BadRequest" {
		t.Fatalf("a negative cap is a typo and must be refused, got %v", err)
	}
}

func TestOrderRouterLimitPriceSitsOnTheSideThatCostsYou(t *testing.T) {
	router := routerTestRouter(t)
	buy := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 1, 100), map[string]any{"slippageBps": 100.0}))
	if got := routerNumberAt(buy["steps"].([]map[string]any)[0], "limitPrice", 0); got != 101 {
		t.Fatalf("a buy pays up to 1%% more, got %v", got)
	}
	sell := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("sell", "BTC", "USDT", 1, 100), map[string]any{"slippageBps": 100.0}))
	if got := routerNumberAt(sell["steps"].([]map[string]any)[0], "limitPrice", 0); got != 99 {
		t.Fatalf("a sell accepts down to 1%% less, got %v", got)
	}
	none := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 1, 100), map[string]any{"slippageBps": 0.0}))
	if got := routerNumberAt(none["steps"].([]map[string]any)[0], "limitPrice", 0); got != 100 {
		t.Fatalf("zero slippage means the expected price, got %v", got)
	}
}

func TestOrderRouterACapThatIsSetBindsExactlyAtWhateverSize(t *testing.T) {
	router := routerTestRouter(t)
	markets := routerPermissiveStubMarkets()
	capped := map[string]any{"usdRates": map[string]any{"USDT": 1.0}, "maxNotionalUsd": 25.0}
	// amount * limitPrice is what is measured, so a 1% slippage on a 24.90 USD
	// step is what carries it over the line
	under := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.24, 100), map[string]any{"slippageBps": 0.0}))
	if got := router.CheckExecutionPlanSafety(under, markets, capped); len(got) != 0 {
		t.Fatalf("24 USD passes a 25 USD cap, got %v", routerCodes(got))
	}
	at := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.25, 100), map[string]any{"slippageBps": 0.0}))
	if got := router.CheckExecutionPlanSafety(at, markets, capped); len(got) != 0 {
		t.Fatalf("exactly at the cap passes, got %v", routerCodes(got))
	}
	over := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2501, 100), map[string]any{"slippageBps": 0.0}))
	overViolations := router.CheckExecutionPlanSafety(over, markets, capped)
	if len(overViolations) != 1 || routerStringAt(overViolations[0], "code", "") != "notional_exceeds_cap" || !routerBoolAt(overViolations[0], "blocking", false) {
		t.Fatalf("25.01 USD blocks, got %v", routerCodes(overViolations))
	}
	// and the slippage is inside the measurement, not outside it
	slipped := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.249, 100), map[string]any{"slippageBps": 100.0}))
	slippedViolations := router.CheckExecutionPlanSafety(slipped, markets, capped)
	if len(slippedViolations) != 1 || routerStringAt(slippedViolations[0], "code", "") != "notional_exceeds_cap" {
		t.Fatalf("24.90 USD at 1%% slippage is 25.15 USD of risk, got %v", routerCodes(slippedViolations))
	}
	// A LARGE cap is honoured just as exactly. This is the case the old hard ceiling
	// made unreachable: 2,000 USD of BTC under a 5,000 USD guardrail is a normal trade.
	large := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 20, 100), map[string]any{"slippageBps": 0.0}))
	if got := router.CheckExecutionPlanSafety(large, markets, map[string]any{"usdRates": map[string]any{"USDT": 1.0}, "maxNotionalUsd": 5000.0}); len(got) != 0 {
		t.Fatalf("2,000 USD under a 5,000 USD cap passes, got %v", routerCodes(got))
	}
	overLarge := router.CheckExecutionPlanSafety(large, markets, map[string]any{"usdRates": map[string]any{"USDT": 1.0}, "maxNotionalUsd": 1000.0})
	if len(overLarge) != 1 || routerStringAt(overLarge[0], "code", "") != "notional_exceeds_cap" {
		t.Fatalf("and the same 2,000 USD trips a 1,000 USD cap, got %v", routerCodes(overLarge))
	}
	if routerNumberAt(overLarge[0], "limit", 0) != 1000 {
		t.Fatalf("the limit reported is the cap as given, got %v", overLarge[0]["limit"])
	}
}

// The default is NO cap. This type does not decide how much of your money you may
// trade — the guardrail is opt-in, so a plan of any size passes untouched, and a
// caller who never asked for a cap is not made to supply usdRates for it.
func TestOrderRouterWithNoCapSetNoNotionalCheckRunsAtAll(t *testing.T) {
	router := routerTestRouter(t)
	markets := routerPermissiveStubMarkets()
	large := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 1000, 100), map[string]any{"slippageBps": 0.0}))
	if got := router.CheckExecutionPlanSafety(large, markets, map[string]any{"usdRates": map[string]any{"USDT": 1.0}}); len(got) != 0 {
		t.Fatalf("100,000 USD passes when no cap is set, got %v", routerCodes(got))
	}
	if got := router.CheckExecutionPlanSafety(large, markets, map[string]any{}); len(got) != 0 {
		t.Fatalf("and it needs no usdRates at all, got %v", routerCodes(got))
	}
}

func TestOrderRouterUnvaluableStepBlocksWhenACapIsInForceAndIsNeverSkipped(t *testing.T) {
	router := routerTestRouter(t)
	markets := routerPermissiveStubMarkets()
	// 0.01 USDT of notional: trivially under the cap, and still refused, because the
	// point is that the cap the caller ASKED FOR could not be evaluated. With no cap
	// set there is nothing to enforce and this same plan passes — see the test above.
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.0001, 100), map[string]any{"slippageBps": 0.0}))
	violations := router.CheckExecutionPlanSafety(plan, markets, map[string]any{"usdRates": map[string]any{}, "maxNotionalUsd": 25.0})
	if len(violations) != 1 || routerStringAt(violations[0], "code", "") != "notional_unvaluable" {
		t.Fatalf("an unvaluable step must be reported, got %v", routerCodes(violations))
	}
	if !routerBoolAt(violations[0], "blocking", false) {
		t.Fatal("an unvaluable step must block, or the cap is decorative")
	}
	// unrelated rates do not help
	stillBlocked := router.CheckExecutionPlanSafety(plan, markets, map[string]any{"usdRates": map[string]any{"ETH": 3000.0, "DOGE": 0.09}, "maxNotionalUsd": 25.0})
	if routerStringAt(stillBlocked[0], "code", "") != "notional_unvaluable" {
		t.Fatalf("unrelated rates do not rescue it, got %v", routerCodes(stillBlocked))
	}
	// either side of the market resolves it
	if got := router.CheckExecutionPlanSafety(plan, markets, map[string]any{"usdRates": map[string]any{"USDT": 1.0}, "maxNotionalUsd": 25.0}); len(got) != 0 {
		t.Fatalf("a quote rate values it, got %v", routerCodes(got))
	}
	if got := router.CheckExecutionPlanSafety(plan, markets, map[string]any{"usdRates": map[string]any{"BTC": 100.0}, "maxNotionalUsd": 25.0}); len(got) != 0 {
		t.Fatalf("a base rate values it, got %v", routerCodes(got))
	}
	// and with no cap in force the very same unvaluable step is not a finding at all
	if got := router.CheckExecutionPlanSafety(plan, markets, map[string]any{"usdRates": map[string]any{}}); len(got) != 0 {
		t.Fatalf("no cap means no notional check to be unvaluable for, got %v", routerCodes(got))
	}
}

func TestOrderRouterUsdtIsNotAssumedToBeOneDollar(t *testing.T) {
	router := routerTestRouter(t)
	markets := routerPermissiveStubMarkets()
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.1, 100), map[string]any{"slippageBps": 0.0}))
	violations := router.CheckExecutionPlanSafety(plan, markets, map[string]any{"usdRates": map[string]any{"USD": 1.0}, "maxNotionalUsd": 25.0})
	if len(violations) != 1 || routerStringAt(violations[0], "code", "") != "notional_unvaluable" {
		t.Fatalf("a stablecoin peg is an observation, not a definition, got %v", routerCodes(violations))
	}
	// a depegged rate is respected: 10 USDT at 0.40 is 4 USD
	if got := router.CheckExecutionPlanSafety(plan, markets, map[string]any{"usdRates": map[string]any{"USDT": 0.4}, "maxNotionalUsd": 25.0}); len(got) != 0 {
		t.Fatalf("a depegged rate is respected, got %v", routerCodes(got))
	}
}

func TestOrderRouterEmptyPlanIsNotASafePlan(t *testing.T) {
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerDictAt(routerDictAt(fixture, "routes"), "unroutable"), nil))
	if steps := plan["steps"].([]map[string]any); len(steps) != 0 {
		t.Fatalf("an unroutable route has no steps, got %d", len(steps))
	}
	violations := router.CheckExecutionPlanSafety(plan, routerPermissiveStubMarkets(), map[string]any{"usdRates": map[string]any{"USDT": 1.0}})
	if len(violations) != 1 || routerStringAt(violations[0], "code", "") != "empty_plan" || !routerBoolAt(violations[0], "blocking", false) {
		t.Fatalf("zero violations on zero steps would read as approval, got %v", routerCodes(violations))
	}
}

func TestOrderRouterReconcileNeverScalesADownstreamOrderUp(t *testing.T) {
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerDictAt(routerDictAt(fixture, "routes"), "multiHop"), nil))
	overfilled, err := router.ReconcileExecutionStep(plan, 0, 1000000)
	if err != nil {
		t.Fatalf("reconcile: %v", err)
	}
	if routerNumberAt(overfilled, "scale", 0) != 1 {
		t.Fatal("an overfill must not grow an order the safety check never saw")
	}
	if routerStringAt(overfilled, "verdict", "") != "proceed" {
		t.Fatalf("an overfill proceeds, got %v", overfilled["verdict"])
	}
	downstream := overfilled["resizedSteps"].([]map[string]any)[0]
	if routerNumberAt(downstream, "amount", 0) != routerNumberAt(downstream, "previousAmount", -1) {
		t.Fatal("a downstream order keeps its size on an overfill")
	}
}

func TestOrderRouterReconcileHaltsOnATotalMissAndAnOverToleranceShortfall(t *testing.T) {
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerDictAt(routerDictAt(fixture, "routes"), "multiHop"), nil))
	nothing, _ := router.ReconcileExecutionStep(plan, 0, 0)
	if routerStringAt(nothing, "verdict", "") != "halt" || routerStringAt(nothing, "reason", "") != "nothing_filled" {
		t.Fatalf("nothing filled halts, got %v %v", nothing["verdict"], nothing["reason"])
	}
	// expectedOut of step 0 is 500 * 0.089 = 44.5; 2% of that is 0.89
	inside, _ := router.ReconcileExecutionStep(plan, 0, 44.5-0.88)
	if routerStringAt(inside, "verdict", "") != "proceed" {
		t.Fatalf("a shortfall inside tolerance proceeds, got %v", inside["verdict"])
	}
	outside, _ := router.ReconcileExecutionStep(plan, 0, 44.5-0.9)
	if routerStringAt(outside, "verdict", "") != "halt" || routerStringAt(outside, "reason", "") != "shortfall_exceeds_tolerance" {
		t.Fatalf("a shortfall past tolerance halts, got %v %v", outside["verdict"], outside["reason"])
	}
	if _, err := router.ReconcileExecutionStep(plan, 7, 1); routerErrorCode(err) != "BadRequest" {
		t.Fatalf("an out-of-range stepIndex is refused, got %v", err)
	}
}

func TestOrderRouterUnwindIsNeverAutomaticAndNeverNetsAcrossVenues(t *testing.T) {
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	unwind := router.BuildUnwindPlan(routerDictAt(routerDictAt(fixture, "reports"), "haltedCrossVenue"))
	if unwind["requiresConfirmation"] != true || unwind["automatic"] != false {
		t.Fatal("an unwind plan is never automatic")
	}
	if routerNumberAt(unwind, "residualCount", 0) != 2 {
		t.Fatal("the mexc USDT and the binance SOL are separate positions")
	}
	steps := unwind["steps"].([]map[string]any)
	// the USDT sold on mexc and the USDT spent on binance are NOT the same money,
	// because this class never moves funds between venues
	if routerStringAt(steps[0], "exchangeId", "") != "binance" || routerStringAt(steps[1], "exchangeId", "") != "mexc" {
		t.Fatal("residuals are unwound in reverse execution order")
	}
	if routerStringAt(steps[1], "side", "") != "buy" {
		t.Fatal("leftover quote is spent buying the asset back")
	}
	if routerBoolAt(steps[1], "reachesFrom", false) != true {
		t.Fatal("buying DOGE back reaches the from-asset")
	}
	if routerStringAt(steps[0], "side", "") != "sell" || routerBoolAt(steps[0], "reachesFrom", true) != false {
		t.Fatal("selling SOL for USDT is not yet DOGE")
	}
}

func TestOrderRouterUnwindBuyNeverSpendsMoreThanTheResidualHolds(t *testing.T) {
	// The residual IS the budget. Sizing the buy at the expected price and then
	// pricing it slippage above that orders more quote than the venue is holding:
	// 44.5 USDT at 0.089 is 500 DOGE, but 500 DOGE at the 0.0892225 limit costs
	// 44.61125 - the venue rejects it for insufficient funds, or partially fills
	// and leaves the rest of the stranded money stranded on a halted route.
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	unwind := router.BuildUnwindPlan(routerDictAt(routerDictAt(fixture, "reports"), "haltedCrossVenue"))
	steps := unwind["steps"].([]map[string]any)
	buy := steps[1]
	if routerStringAt(buy, "side", "") != "buy" {
		t.Fatal("the mexc leg is the buy")
	}
	residual := 44.5
	spend := routerNumberAt(buy, "amount", 0) * routerNumberAt(buy, "limitPrice", 0)
	if spend > residual+1e-9 {
		t.Fatalf("the buy spends %v of a %v residual", spend, residual)
	}
	// and it does not leave the residual pointlessly unspent either
	if spend < residual-1e-9 {
		t.Fatalf("the buy spends %v, short of the %v residual", spend, residual)
	}
	// the notional the safety cap sees must be that same real spend
	if !routerNumbersMatch(routerNumberAt(buy, "notionalQuote", 0), spend) {
		t.Fatal("notionalQuote is priced at the limit the order is placed at")
	}
	// the sell side is sized on the residual itself - there is no budget to run out of
	sell := steps[0]
	if routerStringAt(sell, "side", "") != "sell" {
		t.Fatal("the binance leg is the sell")
	}
	if !routerNumbersMatch(routerNumberAt(sell, "amount", 0), 0.2) {
		t.Fatal("the whole 0.2 SOL residual is sold")
	}
	if !routerNumbersMatch(routerNumberAt(sell, "notionalQuote", 0), 0.2*routerNumberAt(sell, "limitPrice", 0)) {
		t.Fatal("the sell notional is priced at its limit too")
	}
}

//  ---------------------------------------------------------------------------
//  Execute — stub venues only, and not one real order anywhere
//  ---------------------------------------------------------------------------

// orderRouterStubVenue is an IExchange whose unimplemented methods are promoted
// from a nil embedded interface: calling one that this test has not overridden
// panics, which is exactly the proof that the router never reaches for it.
type orderRouterStubVenue struct {
	IExchange
	mutex      sync.Mutex
	calls      []string
	fillRatio  float64
	failCreate bool
	features   map[string]any
	markets    *sync.Map
	balanceFn  func() (Balances, error)
	// a queue of orders FetchOrder hands back, one per poll; empty means the
	// created order comes back closed on the first read
	fetchOrderResults []Order
	fetchOrderThrows  bool
	cancelThrows      bool
	createdStatus     string
	// the fee attached to the created order, as real venues report it
	feeToCharge Fee
	// per-trade fees attached to the created order, which is the ONLY shape the Go
	// typed Order can carry a per-trade cut in — it has no Fees list
	tradeFeesToCharge []Fee
	// every params map CreateOrder was called with, in call order
	paramsSeen []map[string]any
}

func newOrderRouterStubVenue(fillRatio float64, failCreate bool) *orderRouterStubVenue {
	markets := &sync.Map{}
	markets.Store("BTC/USDT", routerStubMarket())
	return &orderRouterStubVenue{
		calls:      []string{},
		fillRatio:  fillRatio,
		failCreate: failCreate,
		features:   map[string]any{"spot": map[string]any{"createOrder": map[string]any{"timeInForce": []any{"GTC", "IOC"}}}},
		markets:    markets,
	}
}

func (this *orderRouterStubVenue) FetchOrder(id string, options ...FetchOrderOptions) (Order, error) {
	this.record("fetchOrder:" + id)
	if this.fetchOrderThrows {
		return Order{}, ExchangeError("stub cannot read the order back")
	}
	this.mutex.Lock()
	defer this.mutex.Unlock()
	if len(this.fetchOrderResults) > 0 {
		next := this.fetchOrderResults[0]
		this.fetchOrderResults = this.fetchOrderResults[1:]
		return next, nil
	}
	status := "closed"
	zero := 0.0
	return Order{Id: &id, Status: &status, Filled: &zero, Average: &zero, Cost: &zero}, nil
}

func (this *orderRouterStubVenue) CancelOrder(id string, options ...CancelOrderOptions) (Order, error) {
	this.record("cancelOrder:" + id)
	if this.cancelThrows {
		return Order{}, ExchangeError("stub refuses to cancel")
	}
	status := "canceled"
	return Order{Id: &id, Status: &status}, nil
}

func routerStubOrder(id string, status string, filled float64, average float64, cost float64) Order {
	return Order{Id: &id, Status: &status, Filled: &filled, Average: &average, Cost: &cost}
}

func (this *orderRouterStubVenue) record(call string) {
	this.mutex.Lock()
	defer this.mutex.Unlock()
	this.calls = append(this.calls, call)
}

func (this *orderRouterStubVenue) callLog() []string {
	this.mutex.Lock()
	defer this.mutex.Unlock()
	log := make([]string, len(this.calls))
	copy(log, this.calls)
	return log
}

func (this *orderRouterStubVenue) LoadMarkets(params ...any) (map[string]MarketInterface, error) {
	this.record("loadMarkets")
	return map[string]MarketInterface{}, nil
}

func (this *orderRouterStubVenue) GetMarkets() *sync.Map {
	return this.markets
}

func (this *orderRouterStubVenue) GetFeatures() map[string]any {
	return this.features
}

func (this *orderRouterStubVenue) AmountToPrecision(symbol any, amount any) any {
	return strconv.FormatFloat(routerToNumber(amount, 0), 'f', -1, 64)
}

func (this *orderRouterStubVenue) PriceToPrecision(symbol any, price any) any {
	return strconv.FormatFloat(routerToNumber(price, 0), 'f', -1, 64)
}

func (this *orderRouterStubVenue) FetchBalance(params ...any) (Balances, error) {
	this.record("fetchBalance")
	if this.balanceFn != nil {
		return this.balanceFn()
	}
	usdt := 1000.0
	btc := 1.0
	zero := 0.0
	return Balances{
		Free:  map[string]*float64{"USDT": &usdt, "BTC": &btc, "ZERO": &zero},
		Total: map[string]*float64{"USDT": &usdt, "BTC": &btc},
	}, nil
}

func (this *orderRouterStubVenue) CreateOrder(symbol string, typeVar string, side string, amount float64, options ...CreateOrderOptions) (Order, error) {
	opts := CreateOrderOptionsStruct{}
	for _, option := range options {
		option(&opts)
	}
	this.record("createOrder:" + typeVar + ":" + side + ":" + strconv.FormatFloat(amount, 'f', -1, 64))
	seen := map[string]any{}
	if opts.Params != nil {
		for key, value := range *opts.Params {
			seen[key] = value
		}
	}
	this.mutex.Lock()
	this.paramsSeen = append(this.paramsSeen, seen)
	this.mutex.Unlock()
	if this.failCreate {
		return Order{}, ExchangeError("stub refuses")
	}
	id := "stub-order"
	status := "closed"
	if this.createdStatus != "" {
		status = this.createdStatus
	}
	filled := amount * this.fillRatio
	average := 100.0
	if opts.Price != nil {
		average = *opts.Price
	}
	cost := filled * average
	order := Order{Id: &id, Status: &status, Filled: &filled, Average: &average, Cost: &cost}
	if this.feeToCharge.Currency != nil {
		order.Fee = this.feeToCharge
	}
	if len(this.tradeFeesToCharge) > 0 {
		trades := []Trade{}
		for i := 0; i < len(this.tradeFeesToCharge); i++ {
			trades = append(trades, Trade{Fee: this.tradeFeesToCharge[i]})
		}
		order.Trades = trades
	}
	return order, nil
}

func routerStubVenues(venues map[string]*orderRouterStubVenue) map[string]IExchange {
	widened := map[string]IExchange{}
	for id, venue := range venues {
		widened[id] = venue
	}
	return widened
}

func TestOrderRouterPlanAgeIsReportedAndRefusedOnlyWhenAsked(t *testing.T) {
	// A plan is a snapshot of a book. calculatedAt was carried on every plan and read by nothing,
	// so Execute would happily trade an hour-old plan at hour-old prices — and the notional cap,
	// computed from those same prices, was just as stale.
	router := routerTestRouter(t)
	route := routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100)
	route["calculatedAt"] = 1000000.0
	plan := routerMustPlan(router.BuildExecutionPlan(route, nil))
	pinned := routerTestRouter(t)
	pinned.NowMs = func() float64 { return 1060000 } // the plan is exactly 60s old
	// this test deliberately runs the same plan several times to isolate the age check,
	// which is exactly what allowReexecution is for
	opts := func() map[string]any {
		return map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "allowReexecution": true}
	}

	// Always reported, even with nothing enforced, and nothing is refused by default.
	report, err := pinned.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": newOrderRouterStubVenue(1, false)}), opts())
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if routerNumberAt(report, "planAgeMs", 0) != 60000 {
		t.Fatalf("the age is on the report whether or not it is checked, got %v", report["planAgeMs"])
	}
	if routerStringAt(report["steps"].([]map[string]any)[0], "status", "") != "filled" {
		t.Fatal("nothing is refused by default")
	}

	// Enforced exactly, at whatever value is asked for.
	strict := newOrderRouterStubVenue(1, false)
	strictOpts := opts()
	strictOpts["maxPlanAgeMs"] = 30000.0
	if _, err := pinned.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": strict}), strictOpts); err == nil {
		t.Fatal("a stale plan must be refused under a limit")
	}
	if got := strict.callLog(); len(got) != 0 {
		t.Fatalf("refused before anything reached the venue, got %v", got)
	}
	wideOpts := opts()
	wideOpts["maxPlanAgeMs"] = 120000.0
	passed, err := pinned.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": newOrderRouterStubVenue(1, false)}), wideOpts)
	if err != nil {
		t.Fatalf("a limit the plan is inside of lets it through: %v", err)
	}
	if routerStringAt(passed["steps"].([]map[string]any)[0], "status", "") != "filled" {
		t.Fatal("a fresh-enough plan executes")
	}

	// An age that cannot be determined BLOCKS under an active limit.
	undated := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	undatedReport, err := pinned.Execute(undated, routerStubVenues(map[string]*orderRouterStubVenue{"stub": newOrderRouterStubVenue(1, false)}), opts())
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if routerNumberAt(undatedReport, "planAgeMs", 0) != -1 {
		t.Fatalf("unknown is -1, never 0: 0 would read as fresh, got %v", undatedReport["planAgeMs"])
	}
	undatedOpts := opts()
	undatedOpts["maxPlanAgeMs"] = 30000.0
	if _, err := pinned.Execute(undated, routerStubVenues(map[string]*orderRouterStubVenue{"stub": newOrderRouterStubVenue(1, false)}), undatedOpts); err == nil {
		t.Fatal("an undatable plan must be refused under a limit")
	}
}

func TestOrderRouterDryRunIsTheDefault(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	venue := newOrderRouterStubVenue(1, false)
	// everything a real call would carry, EXCEPT live
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{
		"strategy":          "sequential",
		"usdRates":          map[string]any{"USDT": 1.0},
		"allowMarketOrders": true,
	})
	if err != nil {
		t.Fatalf("a dry run never fails: %v", err)
	}
	if report["dryRun"] != true || report["strategy"] != "dry_run" {
		t.Fatalf("dry_run is the default, got %v %v", report["dryRun"], report["strategy"])
	}
	if report["requestedStrategy"] != "sequential" {
		t.Fatal("the report says what was asked for as well as what happened")
	}
	if routerNumberAt(report, "ordersPlaced", -1) != 0 || routerNumberAt(report, "wouldPlaceOrders", -1) != 1 {
		t.Fatalf("a dry run places nothing, got %v %v", report["ordersPlaced"], report["wouldPlaceOrders"])
	}
	if routerStringAt(report["steps"].([]map[string]any)[0], "status", "") != "planned" {
		t.Fatal("every step stays planned in a dry run")
	}
	if len(venue.callLog()) != 0 {
		t.Fatalf("not one call reached the venue — not even a read, got %v", venue.callLog())
	}
	// live must be exactly the boolean true; "true" and 1 are not-true
	for _, notLive := range []any{false, nil, "true", 1} {
		other := newOrderRouterStubVenue(1, false)
		again, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": other}), map[string]any{"strategy": "sequential", "live": notLive, "usdRates": map[string]any{"USDT": 1.0}})
		if err != nil {
			t.Fatalf("live=%v: %v", notLive, err)
		}
		if again["dryRun"] != true {
			t.Fatalf("live=%v must not be live", notLive)
		}
		if len(other.callLog()) != 0 {
			t.Fatalf("live=%v reached the venue: %v", notLive, other.callLog())
		}
	}
}

func TestOrderRouterRefusesToGoLiveWithoutAWayToValueTheTradeWhenACapIsSet(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	venue := newOrderRouterStubVenue(1, false)
	_, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{"strategy": "sequential", "live": true, "maxNotionalUsd": 25.0})
	if routerErrorCode(err) != "ExchangeError" {
		t.Fatalf("an unvaluable plan is refused, got %v", err)
	}
	for _, call := range venue.callLog() {
		if strings.Contains(call, "createOrder") {
			t.Fatalf("no order was placed, got %v", venue.callLog())
		}
	}
	// and with NO cap asked for, usdRates is not required: there is no cap to
	// evaluate, so demanding the inputs for one would be asking for something
	// nobody wanted
	uncapped := newOrderRouterStubVenue(1, false)
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": uncapped}), map[string]any{"strategy": "sequential", "live": true})
	if err != nil {
		t.Fatalf("no cap means no usdRates are needed, got %v", err)
	}
	if got := routerStringAt(report["steps"].([]map[string]any)[0], "status", ""); got != "filled" {
		t.Fatalf("the step goes through, got %v", got)
	}
}

func TestOrderRouterRefusesToGoLiveAboveACapTheCallerSet(t *testing.T) {
	// 500 USD against a 25 USD guardrail. The refusal happens BEFORE any order goes
	// out, which is the property worth asserting — a cap checked after the fact is
	// an incident report, not a guardrail.
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 5, 100), nil))
	venue := newOrderRouterStubVenue(1, false)
	_, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "maxNotionalUsd": 25.0})
	if routerErrorCode(err) != "ExchangeError" {
		t.Fatalf("a 500 USD plan is refused under a 25 USD cap, got %v", err)
	}
	for _, call := range venue.callLog() {
		if strings.Contains(call, "createOrder") {
			t.Fatalf("no order was placed, got %v", venue.callLog())
		}
	}
	// the same 500 USD trade with no cap set goes through: that is the point of the
	// guardrail being opt-in
	uncapped := newOrderRouterStubVenue(1, false)
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": uncapped}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}})
	if err != nil {
		t.Fatalf("500 USD is a normal trade when nobody asked for a cap, got %v", err)
	}
	if got := routerStringAt(report["steps"].([]map[string]any)[0], "status", ""); got != "filled" {
		t.Fatalf("the step goes through, got %v", got)
	}
}

func TestOrderRouterSequentialPlacesIocLimitOrdersInPlanOrder(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), map[string]any{"slippageBps": 100.0}))
	venue := newOrderRouterStubVenue(1, false)
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if report["dryRun"] != false || routerNumberAt(report, "ordersPlaced", 0) != 1 {
		t.Fatalf("one order was placed, got %v %v", report["dryRun"], report["ordersPlaced"])
	}
	step := report["steps"].([]map[string]any)[0]
	if routerStringAt(step, "status", "") != "filled" || routerStringAt(step, "outAsset", "") != "BTC" || routerNumberAt(step, "outAmount", 0) != 0.2 || routerStringAt(step, "inAsset", "") != "USDT" {
		t.Fatalf("a filled buy produces base and consumes quote, got %v", step)
	}
	if got := venue.callLog(); len(got) != 1 || got[0] != "createOrder:limit:buy:0.2" {
		t.Fatalf("one IOC limit order, got %v", got)
	}
	if report["halted"] != false {
		t.Fatal("a fully filled single hop does not halt")
	}
}

func TestOrderRouterSequentialObeysTheHaltVerdict(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerTwoHopRoute(), nil))
	// hop 0 fills half: a 50% shortfall against a 2% tolerance
	venue := newOrderRouterStubVenue(0.5, false)
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if report["halted"] != true || routerStringAt(report, "haltReason", "") != "shortfall_exceeds_tolerance" || routerNumberAt(report, "haltStepIndex", -99) != 0 {
		t.Fatalf("a 50%% shortfall halts at step 0, got %v %v %v", report["halted"], report["haltReason"], report["haltStepIndex"])
	}
	if routerNumberAt(report, "ordersPlaced", 0) != 1 {
		t.Fatal("the second hop was never attempted")
	}
	if routerStringAt(report["steps"].([]map[string]any)[1], "status", "") != "skipped" {
		t.Fatal("the downstream step is marked skipped")
	}
	if len(venue.callLog()) != 1 {
		t.Fatalf("exactly one order reached the venue, got %v", venue.callLog())
	}
	// and the halted report is exactly what BuildUnwindPlan is for
	unwind := router.BuildUnwindPlan(report)
	if routerNumberAt(unwind, "residualCount", 0) != 1 {
		t.Fatalf("one residual, got %v", unwind["residualCount"])
	}
	step := unwind["steps"].([]map[string]any)[0]
	if routerStringAt(step, "side", "") != "sell" || routerBoolAt(step, "reachesFrom", false) != true {
		t.Fatal("the BTC bought on hop 0 goes back to USDT")
	}
}

func TestOrderRouterMarketOrderNeedsBothAMissingIocAndAnExplicitOptIn(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	gtcOnly := map[string]any{"spot": map[string]any{"createOrder": map[string]any{"timeInForce": []any{"GTC"}}}}
	// a venue that advertises GTC only
	noIoc := newOrderRouterStubVenue(1, false)
	noIoc.features = gtcOnly
	refused, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": noIoc}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	step := refused["steps"].([]map[string]any)[0]
	if routerStringAt(step, "status", "") != "failed" || routerStringAt(step, "errorCode", "") != "NotSupported" {
		t.Fatalf("a venue without IOC fails the step, got %v", step)
	}
	if len(noIoc.callLog()) != 0 {
		t.Fatalf("defaulting to a market order is the decision the caller did not delegate, got %v", noIoc.callLog())
	}
	allowed := newOrderRouterStubVenue(1, false)
	allowed.features = gtcOnly
	// the same plan again on purpose: this test is about the market-order opt-in, not about
	// idempotency, so the re-execution guard is explicitly waived
	placed, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": allowed}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "allowMarketOrders": true, "allowReexecution": true})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if routerStringAt(placed["steps"].([]map[string]any)[0], "status", "") != "filled" {
		t.Fatal("an explicit opt-in permits the market order")
	}
	if got := allowed.callLog(); len(got) != 1 || got[0] != "createOrder:market:buy:0.2" {
		t.Fatalf("a market order was placed, got %v", got)
	}
	// ...but not under a cap. assertUnderCap values the order at the plan's LIMIT price and the
	// market call sends no price at all, so passing the check and then removing the price it was
	// computed from is a cap that silently disappears. Refused together.
	capped := newOrderRouterStubVenue(1, false)
	capped.features = gtcOnly
	underCap, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": capped}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "allowMarketOrders": true, "maxNotionalUsd": 1000.0, "allowReexecution": true})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	cappedStep := underCap["steps"].([]map[string]any)[0]
	if routerStringAt(cappedStep, "status", "") != "failed" || routerStringAt(cappedStep, "errorCode", "") != "NotSupported" {
		t.Fatalf("a market order under a cap must be refused, got %v", cappedStep)
	}
	if got := capped.callLog(); len(got) != 0 {
		t.Fatalf("refused BEFORE dispatch: a cap checked against a price that is then discarded is worse than no cap, got %v", got)
	}
	// a venue that says nothing about timeInForce is assumed to do IOC: a
	// rejected IOC is loud and cheap, an unintended market order is not
	unknown := newOrderRouterStubVenue(1, false)
	unknown.features = map[string]any{}
	assumed, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": unknown}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "allowReexecution": true})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if routerStringAt(assumed["steps"].([]map[string]any)[0], "status", "") != "filled" {
		t.Fatal("an unknown timeInForce is assumed to do IOC")
	}
	if got := unknown.callLog(); len(got) != 1 || got[0] != "createOrder:limit:buy:0.2" {
		t.Fatalf("a limit order was placed, got %v", got)
	}
}

func TestOrderRouterParallelWithinHopContainsAFailingLeg(t *testing.T) {
	router := routerTestRouter(t)
	route := routerOneLegRoute("buy", "BTC", "USDT", 0.1, 100)
	hop := route["hops"].([]any)[0].(map[string]any)
	hop["legs"] = []any{
		map[string]any{"exchangeId": "good", "amount": 0.1, "averagePrice": 100.0, "effectivePrice": 100.0},
		map[string]any{"exchangeId": "bad", "amount": 0.1, "averagePrice": 100.0, "effectivePrice": 100.0},
		map[string]any{"exchangeId": "good2", "amount": 0.1, "averagePrice": 100.0, "effectivePrice": 100.0},
	}
	plan := routerMustPlan(router.BuildExecutionPlan(route, nil))
	good := newOrderRouterStubVenue(1, false)
	bad := newOrderRouterStubVenue(1, true)
	good2 := newOrderRouterStubVenue(1, false)
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"good": good, "bad": bad, "good2": good2}), map[string]any{"strategy": "parallel_within_hop", "live": true, "usdRates": map[string]any{"USDT": 1.0}})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	steps := report["steps"].([]map[string]any)
	if routerStringAt(steps[0], "status", "") != "filled" || routerStringAt(steps[1], "status", "") != "failed" || routerStringAt(steps[2], "status", "") != "filled" {
		t.Fatalf("the sibling behind the failure still ran, got %v %v %v", steps[0]["status"], steps[1]["status"], steps[2]["status"])
	}
	reportErrors := report["errors"].([]map[string]any)
	if len(reportErrors) != 1 || routerStringAt(reportErrors[0], "exchangeId", "") != "bad" {
		t.Fatalf("exactly one leg failed, got %v", reportErrors)
	}
	if report["halted"] != true || routerStringAt(report, "haltReason", "") != "order_failed" {
		t.Fatal("a failed leg still halts the route after the hop settles")
	}
}

func TestOrderRouterBestEffortRefusesMultiHopAndDemandsItsAcknowledgements(t *testing.T) {
	router := routerTestRouter(t)
	venue := newOrderRouterStubVenue(1, false)
	venues := routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue})
	multiHop := routerMustPlan(router.BuildExecutionPlan(routerTwoHopRoute(), nil))
	_, err := router.Execute(multiHop, venues, map[string]any{"strategy": "best_effort", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "acknowledgeDispersion": true, "maxOrders": 5.0})
	if routerErrorCode(err) != "NotSupported" {
		t.Fatalf("best_effort refuses multi-hop, got %v", err)
	}
	singleHop := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	_, err = router.Execute(singleHop, venues, map[string]any{"strategy": "best_effort", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "maxOrders": 5.0})
	if routerErrorCode(err) != "BadRequest" {
		t.Fatalf("best_effort requires acknowledgeDispersion, got %v", err)
	}
	_, err = router.Execute(singleHop, venues, map[string]any{"strategy": "best_effort", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "acknowledgeDispersion": true})
	if routerErrorCode(err) != "BadRequest" {
		t.Fatalf("best_effort requires a positive maxOrders, got %v", err)
	}
	if len(venue.callLog()) != 0 {
		t.Fatalf("none of the three refusals reached the venue, got %v", venue.callLog())
	}
}

func TestOrderRouterBestEffortStopsAtMaxOrdersAndNeverHalts(t *testing.T) {
	router := routerTestRouter(t)
	route := routerOneLegRoute("buy", "BTC", "USDT", 0.1, 100)
	hop := route["hops"].([]any)[0].(map[string]any)
	hop["legs"] = []any{
		map[string]any{"exchangeId": "a", "amount": 0.1, "averagePrice": 100.0, "effectivePrice": 100.0},
		map[string]any{"exchangeId": "b", "amount": 0.1, "averagePrice": 100.0, "effectivePrice": 100.0},
		map[string]any{"exchangeId": "c", "amount": 0.1, "averagePrice": 100.0, "effectivePrice": 100.0},
	}
	plan := routerMustPlan(router.BuildExecutionPlan(route, nil))
	c := newOrderRouterStubVenue(1, false)
	venues := routerStubVenues(map[string]*orderRouterStubVenue{"a": newOrderRouterStubVenue(1, false), "b": newOrderRouterStubVenue(0.01, false), "c": c})
	report, err := router.Execute(plan, venues, map[string]any{"strategy": "best_effort", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "acknowledgeDispersion": true, "maxOrders": 2.0})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if routerNumberAt(report, "ordersPlaced", 0) != 2 {
		t.Fatalf("maxOrders caps the order count, got %v", report["ordersPlaced"])
	}
	third := report["steps"].([]map[string]any)[2]
	if routerStringAt(third, "status", "") != "skipped" || routerStringAt(third, "errorCode", "") != "max_orders_reached" {
		t.Fatalf("the third leg is skipped, got %v", third)
	}
	if report["halted"] != false {
		t.Fatal("a 1% fill on leg b does not stop best_effort — that is the whole strategy")
	}
	if len(c.callLog()) != 0 {
		t.Fatalf("the capped leg never reached its venue, got %v", c.callLog())
	}
}

// The cap is a guardrail the CALLER sets, so the per-call value wins — there is no
// ceiling re-imposed behind their back. Both directions are asserted because the
// old implementation clamped one way only, and a guardrail that silently refuses to
// loosen is as surprising as one that silently refuses to tighten.
func TestOrderRouterPerCallCapOverridesTheClientLevelOneInBothDirections(t *testing.T) {
	client, err := NewOrderRouter(map[string]any{"apiKey": "k", "maxNotionalUsd": 100})
	if err != nil {
		t.Fatalf("NewOrderRouter: %v", err)
	}
	// 0.005 BTC at 100000 USDT is 500 USD
	plan := routerMustPlan(client.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.005, 100000), map[string]any{"slippageBps": 0.0}))
	markets := routerPermissiveStubMarkets()
	underClientCap := client.CheckExecutionPlanSafety(plan, markets, map[string]any{"usdRates": map[string]any{"USDT": 1.0}})
	if len(underClientCap) != 1 || routerStringAt(underClientCap[0], "code", "") != "notional_exceeds_cap" {
		t.Fatalf("500 USD trips the client cap of 100, got %v", routerCodes(underClientCap))
	}
	if routerNumberAt(underClientCap[0], "limit", 0) != 100 {
		t.Fatalf("the client cap is reported as given, got %v", underClientCap[0]["limit"])
	}
	// raised for this call
	if got := client.CheckExecutionPlanSafety(plan, markets, map[string]any{"usdRates": map[string]any{"USDT": 1.0}, "maxNotionalUsd": 1000.0}); len(got) != 0 {
		t.Fatalf("a per-call cap of 1000 lets it through, got %v", routerCodes(got))
	}
	// lowered for this call
	tightened := client.CheckExecutionPlanSafety(plan, markets, map[string]any{"usdRates": map[string]any{"USDT": 1.0}, "maxNotionalUsd": 10.0})
	if len(tightened) != 1 || routerNumberAt(tightened[0], "limit", 0) != 10 {
		t.Fatalf("a per-call cap of 10 binds, got %v", tightened)
	}
	// and the last check before an order goes out honours the same value
	step := routerContainer(routerListAt(plan, "steps")[0])
	if err := client.assertUnderCap(step, 0.005, 100000, map[string]any{"USDT": 1.0}, map[string]any{"maxNotionalUsd": 100.0}); err == nil {
		t.Fatal("500 USD against a 100 USD cap is refused at the last moment too")
	}
	if err := client.assertUnderCap(step, 0.005, 100000, map[string]any{"USDT": 1.0}, map[string]any{"maxNotionalUsd": 1000.0}); err != nil {
		t.Fatalf("and a per-call 1000 USD cap lets the same order out, got %v", err)
	}
	// with no cap anywhere it does not even ask for a rate
	uncapped := routerTestRouter(t)
	if err := uncapped.assertUnderCap(step, 0.005, 100000, map[string]any{}, map[string]any{}); err != nil {
		t.Fatalf("no cap means nothing to enforce, got %v", err)
	}
}

// best_effort must derive the hop count from the steps it is about to execute: a
// plan that travelled through JSON, was rebuilt from persisted steps, or is the
// tail of a halted route can be missing hopCount entirely.
func TestOrderRouterBestEffortDerivesTheHopCountFromTheSteps(t *testing.T) {
	router := routerTestRouter(t)
	complete := routerMustPlan(router.BuildExecutionPlan(routerTwoHopRoute(), nil))
	withoutHopCount := map[string]any{}
	for key, value := range complete {
		if key != "hopCount" {
			withoutHopCount[key] = value
		}
	}
	if _, present := withoutHopCount["hopCount"]; present {
		t.Fatal("the plan really has no hopCount")
	}
	if len(routerListAt(withoutHopCount, "steps")) != 2 {
		t.Fatal("and it really has two hops worth of steps")
	}
	venue := newOrderRouterStubVenue(0.1, false)
	_, err := router.Execute(withoutHopCount, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{"strategy": "best_effort", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "acknowledgeDispersion": true, "maxOrders": 5.0})
	if err == nil {
		t.Fatal("best_effort across a bridge is refused however the plan reached us")
	}
	if len(venue.callLog()) != 0 {
		t.Fatalf("not one order was placed, got %v", venue.callLog())
	}
}

// venueSupportsIoc must read the dictionary of booleans every real ccxt exchange
// declares. features.spot.createOrder.timeInForce is a dictionary, never a list:
// bit2c, bitbank, bithumb and coinone all say IOC: false, and reading it as a
// list answered "yes" for every one of them.
func TestOrderRouterVenueSupportsIocReadsADictionary(t *testing.T) {
	router := routerTestRouter(t)
	noIocFeatures := map[string]any{"spot": map[string]any{"createOrder": map[string]any{"timeInForce": map[string]any{"IOC": false, "FOK": false, "PO": false, "GTD": false, "GTC": true}}}}
	noIoc := newOrderRouterStubVenue(1, false)
	noIoc.features = noIocFeatures
	if router.venueSupportsIoc(noIoc) {
		t.Fatal("IOC: false means no")
	}
	withIoc := newOrderRouterStubVenue(1, false)
	withIoc.features = map[string]any{"spot": map[string]any{"createOrder": map[string]any{"timeInForce": map[string]any{"IOC": true, "FOK": true, "PO": true, "GTD": false, "GTC": true}}}}
	if !router.venueSupportsIoc(withIoc) {
		t.Fatal("IOC: true means yes")
	}
	// a dictionary that enumerates its values and omits IOC has said no
	silentAboutIoc := newOrderRouterStubVenue(1, false)
	silentAboutIoc.features = map[string]any{"spot": map[string]any{"createOrder": map[string]any{"timeInForce": map[string]any{"GTC": true}}}}
	if router.venueSupportsIoc(silentAboutIoc) {
		t.Fatal("a list of values without IOC means no")
	}
	// and a venue that says nothing at all is still assumed to do IOC
	silent := newOrderRouterStubVenue(1, false)
	silent.features = map[string]any{}
	if !router.venueSupportsIoc(silent) {
		t.Fatal("silence is still assumed to be yes")
	}
	// end to end: the documented market-order fallback is reachable again
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	refused, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": noIoc}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if routerStringAt(refused["steps"].([]map[string]any)[0], "errorCode", "") != "NotSupported" {
		t.Fatalf("the step refuses rather than sending an IOC, got %v", refused["steps"])
	}
	if len(noIoc.callLog()) != 0 {
		t.Fatalf("an IOC was never sent to a venue that cannot do one, got %v", noIoc.callLog())
	}
	allowed := newOrderRouterStubVenue(1, false)
	allowed.features = noIocFeatures
	// the same plan again on purpose: this test is about the market-order opt-in, not about
	// idempotency, so the re-execution guard is explicitly waived
	placed, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": allowed}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "allowMarketOrders": true, "allowReexecution": true})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if routerStringAt(placed["steps"].([]map[string]any)[0], "status", "") != "filled" {
		t.Fatal("the opt-in reaches the market order")
	}
	if got := allowed.callLog(); len(got) != 1 || got[0] != "createOrder:market:buy:0.2" {
		t.Fatalf("a market order was placed, got %v", got)
	}
}

// A venue that cancels an order itself on the last poll — expiry, self-trade
// prevention, a post-only rejection of the remainder — has ENDED it, and the
// partial fill it carries is real.
// The poll loop advances its clock by pollIntervalMs, so 0 never reaches the timeout: it spins on
// FetchOrder forever with a real order resting on a real venue, and the timeout that exists to
// cancel that order never arrives. Refused BEFORE CreateOrder — refusing afterwards would leave the
// very order the loop could not clean up.
func TestOrderRouterLimitProtectedRefusesAZeroPollInterval(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), map[string]any{"slippageBps": 0.0}))
	for _, interval := range []float64{0.0, -1.0} {
		venue := newOrderRouterStubVenue(1, false)
		venue.createdStatus = "open"
		_, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{"strategy": "limit_protected", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "orderTimeoutMs": 4.0, "pollIntervalMs": interval})
		if err == nil {
			t.Fatalf("pollIntervalMs %v must be refused", interval)
		}
		if len(venue.callLog()) != 0 {
			t.Fatalf("nothing may reach the venue, got %v", venue.callLog())
		}
	}
	ok := newOrderRouterStubVenue(1, false)
	ok.createdStatus = "open"
	ok.fetchOrderResults = []Order{routerStubOrder("stub-order", "closed", 0.0002, 100000, 20)}
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": ok}), map[string]any{"strategy": "limit_protected", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "orderTimeoutMs": 4.0, "pollIntervalMs": 1.0})
	if err != nil {
		t.Fatalf("an ordinary interval still works: %v", err)
	}
	if routerStringAt(report["steps"].([]map[string]any)[0], "status", "") != "filled" {
		t.Fatalf("an ordinary interval still fills, got %v", report["steps"])
	}
}

func TestOrderRouterLimitProtectedKeepsAVenueSideCancelFill(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), map[string]any{"slippageBps": 0.0}))
	venue := newOrderRouterStubVenue(1, false)
	venue.createdStatus = "open"
	venue.fetchOrderResults = []Order{
		routerStubOrder("stub-order", "open", 0, 0, 0),
		routerStubOrder("stub-order", "canceled", 0.0001, 100000, 10),
	}
	venue.cancelThrows = true
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{"strategy": "limit_protected", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "orderTimeoutMs": 2.0, "pollIntervalMs": 1.0})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	for _, call := range venue.callLog() {
		if call == "cancelOrder:stub-order" {
			t.Fatal("an order the venue already closed is not cancelled again")
		}
	}
	step := report["steps"].([]map[string]any)[0]
	if routerStringAt(step, "status", "") != "partial" {
		t.Fatalf("the fill is kept, got %v", step)
	}
	if !routerNumbersMatch(routerNumberAt(step, "filledAmount", 0), 0.0001) || !routerNumbersMatch(routerNumberAt(step, "outAmount", 0), 0.0001) {
		t.Fatalf("and it is the right size, got %v", step)
	}
	if routerStringAt(step, "orderId", "") != "stub-order" {
		t.Fatal("and the id is reported")
	}
	if len(report["openOrders"].([]map[string]any)) != 0 {
		t.Fatalf("nothing is open: the venue closed it, got %v", report["openOrders"])
	}
	// and the 0.0001 BTC that was actually bought reaches the unwind plan
	unwind := router.BuildUnwindPlan(report)
	if routerNumberAt(unwind, "residualCount", 0) != 1 {
		t.Fatalf("a real position must never be invisible to the unwind path, got %v", unwind["residualCount"])
	}
	if !routerNumbersMatch(routerNumberAt(routerListAt(unwind, "steps")[0], "amount", 0), 0.0001) {
		t.Fatal("the unwind sells exactly what was bought")
	}
}

// Every path between a successful CreateOrder and the final read leaves a real
// order on a real venue. The id must be captured the instant CreateOrder returns,
// and a failure after that must file an open order the caller can act on.
func TestOrderRouterOrderIdSurvivesAFailureAfterCreate(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), map[string]any{"slippageBps": 0.0}))
	venue := newOrderRouterStubVenue(1, false)
	venue.createdStatus = "open"
	venue.fetchOrderThrows = true
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{"strategy": "limit_protected", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "orderTimeoutMs": 4.0, "pollIntervalMs": 1.0})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	step := report["steps"].([]map[string]any)[0]
	// NOT "failed". A step whose id is known had CreateOrder RETURN, so an order exists; calling
	// that "failed" reads as "nothing happened" while openOrders, a few lines down, says the
	// opposite. One report must not carry both readings.
	if routerStringAt(step, "status", "") != "outcome_unknown" {
		t.Fatalf("a known id means an order exists, so the outcome is unknown rather than failed, got %v", step)
	}
	if routerStringAt(report, "haltReason", "") != "outcome_unknown" {
		t.Fatalf("the halt must name the ambiguity rather than claim an outright failure, got %v", report["haltReason"])
	}
	if routerStringAt(step, "orderId", "") != "stub-order" {
		t.Fatal("the id is captured the instant CreateOrder returns, not after the read")
	}
	openOrders := report["openOrders"].([]map[string]any)
	if len(openOrders) != 1 {
		t.Fatalf("a live order the caller cannot see is the worst outcome there is, got %v", openOrders)
	}
	if routerStringAt(openOrders[0], "orderId", "") != "stub-order" || routerStringAt(openOrders[0], "exchangeId", "") != "stub" || routerStringAt(openOrders[0], "reason", "") != "outcome_unknown" {
		t.Fatalf("and it names the order, the venue and why it may still be live, got %v", openOrders[0])
	}
	// the same holds for an immediate order, which has no poll loop at all
	other := newOrderRouterStubVenue(1, false)
	other.createdStatus = "open"
	okReport, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": other}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "allowReexecution": true})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if routerStringAt(okReport["steps"].([]map[string]any)[0], "orderId", "") != "stub-order" {
		t.Fatal("an immediate order reports its id too")
	}
	// and an "immediate" order the venue reports as STILL OPEN is a resting
	// order — which is what a venue that silently drops timeInForce leaves you.
	// It is cancelled and re-read, so nothing is left resting to report.
	if !routerCallLogHas(other.callLog(), "cancelOrder:stub-order") {
		t.Fatal("a resting order is cancelled, not merely noted")
	}
	if stillOpen := okReport["openOrders"].([]map[string]any); len(stillOpen) != 0 {
		t.Fatalf("the cancel and the re-read settled it, got %v", stillOpen)
	}
}

func routerCallLogHas(log []string, call string) bool {
	for i := 0; i < len(log); i++ {
		if log[i] == call {
			return true
		}
	}
	return false
}

func TestOrderRouterARestingOrderIsCancelled(t *testing.T) {
	// A venue that silently drops timeInForce turns an immediate-or-cancel order
	// into a plain resting limit order. Recording it and continuing means the next
	// hop is sized on a fill that is still growing behind it, and the leftover
	// order stays live on a real venue after the route has returned and nobody is
	// watching it.
	router := routerTestRouter(t)
	strategies := []string{"sequential", "parallel_within_hop", "best_effort"}
	for _, strategy := range strategies {
		options := map[string]any{"strategy": strategy, "live": true, "usdRates": map[string]any{"USDT": 1.0}}
		if strategy == "best_effort" {
			options["acknowledgeDispersion"] = true
			options["maxOrders"] = 4.0
		}
		// 1. the cancel works: the order is gone, the re-read is what gets reported
		venue := newOrderRouterStubVenue(1, false)
		venue.createdStatus = "open"
		venue.fetchOrderResults = []Order{routerStubOrder("stub-order", "canceled", 0.0001, 100000, 10)}
		plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), map[string]any{"slippageBps": 0.0}))
		report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), options)
		if err != nil {
			t.Fatalf("%s: execute: %v", strategy, err)
		}
		if !routerCallLogHas(venue.callLog(), "cancelOrder:stub-order") {
			t.Fatalf("%s: the resting order is cancelled", strategy)
		}
		if open := report["openOrders"].([]map[string]any); len(open) != 0 {
			t.Fatalf("%s: nothing is left resting, got %v", strategy, open)
		}
		step := report["steps"].([]map[string]any)[0]
		// the re-read is authoritative — the cancel and a fill crossed
		if !routerNumbersMatch(routerNumberAt(step, "filledAmount", 0), 0.0001) {
			t.Fatalf("%s: the fill observed AFTER the cancel is the one reported", strategy)
		}
		if routerStringAt(step, "status", "") != "partial" {
			t.Fatalf("%s: a real partial fill, not an unknown, got %v", strategy, routerStringAt(step, "status", ""))
		}
		// 2. the cancel fails: the order can still fill in full after this returns,
		//    so nothing downstream may be sized on what was observed
		stubborn := newOrderRouterStubVenue(1, false)
		stubborn.createdStatus = "open"
		stubborn.cancelThrows = true
		plan2 := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), map[string]any{"slippageBps": 0.0}))
		failed, err := router.Execute(plan2, routerStubVenues(map[string]*orderRouterStubVenue{"stub": stubborn}), options)
		if err != nil {
			t.Fatalf("%s: execute: %v", strategy, err)
		}
		failedStep := failed["steps"].([]map[string]any)[0]
		if routerStringAt(failedStep, "status", "") != "outcome_unknown" {
			t.Fatalf("%s: an uncancellable resting order is never a settled step, got %v", strategy, routerStringAt(failedStep, "status", ""))
		}
		open := failed["openOrders"].([]map[string]any)
		if len(open) != 1 || routerStringAt(open[0], "orderId", "") != "stub-order" || routerStringAt(open[0], "reason", "") != "cancel_failed" {
			t.Fatalf("%s: the operator is told what is still live, got %v", strategy, open)
		}
		// 3. the cancel is accepted and the venue still calls it open: same rule
		ghost := newOrderRouterStubVenue(1, false)
		ghost.createdStatus = "open"
		ghost.fetchOrderResults = []Order{routerStubOrder("stub-order", "open", 0, 0, 0)}
		plan3 := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), map[string]any{"slippageBps": 0.0}))
		ghosted, err := router.Execute(plan3, routerStubVenues(map[string]*orderRouterStubVenue{"stub": ghost}), options)
		if err != nil {
			t.Fatalf("%s: execute: %v", strategy, err)
		}
		ghostStep := ghosted["steps"].([]map[string]any)[0]
		if routerStringAt(ghostStep, "status", "") != "outcome_unknown" {
			t.Fatalf("%s: a cancel the venue ignored leaves the outcome unknown", strategy)
		}
		ghostOpen := ghosted["openOrders"].([]map[string]any)
		if len(ghostOpen) != 1 || routerStringAt(ghostOpen[0], "reason", "") != "still_open" {
			t.Fatalf("%s: and it is reported as still open, got %v", strategy, ghostOpen)
		}
	}
}

func TestOrderRouterUnknownStrategyIsRefusedEvenInDryRun(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	if _, err := router.Execute(plan, map[string]IExchange{}, map[string]any{"strategy": "yolo"}); routerErrorCode(err) != "BadRequest" {
		t.Fatalf("an unknown strategy is refused, got %v", err)
	}
}

func TestOrderRouterAtomicIshDemandsTheWholeRoutePrefunded(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerTwoHopRoute(), nil))
	// hop 0 needs 20 USDT and hop 1 needs 0.2 BTC, both already sitting there
	funded := newOrderRouterStubVenue(1, false)
	rich, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": funded}), map[string]any{"strategy": "atomic_ish", "live": true, "usdRates": map[string]any{"USDT": 1.0}})
	if err != nil {
		t.Fatalf("a pre-funded route runs end to end: %v", err)
	}
	if routerNumberAt(rich, "ordersPlaced", 0) != 2 {
		t.Fatalf("both hops ran, got %v", rich["ordersPlaced"])
	}
	broke := newOrderRouterStubVenue(1, false)
	broke.balanceFn = func() (Balances, error) {
		usdt := 1.0
		btc := 0.0
		return Balances{Free: map[string]*float64{"USDT": &usdt, "BTC": &btc}}, nil
	}
	_, err = router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": broke}), map[string]any{"strategy": "atomic_ish", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "allowReexecution": true})
	if routerErrorCode(err) != "InsufficientFunds" {
		t.Fatalf("an underfunded route is refused, got %v", err)
	}
}

//  ---------------------------------------------------------------------------
//  FetchRoute request shaping and FetchRouteWithBalances, with the transport
//  stubbed out — no network
//  ---------------------------------------------------------------------------

func routerRecordingRouter(t *testing.T, config map[string]any, body map[string]any) (*OrderRouter, *string) {
	t.Helper()
	router, err := NewOrderRouter(config)
	if err != nil {
		t.Fatalf("NewOrderRouter: %v", err)
	}
	lastUrl := new(string)
	router.Transport = func(url string) (map[string]any, error) {
		*lastUrl = url
		return body, nil
	}
	return router, lastUrl
}

func TestOrderRouterFetchRouteRefusesNeitherOrBothAmounts(t *testing.T) {
	router, lastUrl := routerRecordingRouter(t, map[string]any{"apiKey": "k"}, map[string]any{})
	if _, err := router.FetchRoute("USDT", "BTC", map[string]any{}); routerErrorCode(err) != "BadRequest" {
		t.Fatalf("neither amount is refused, got %v", err)
	}
	if _, err := router.FetchRoute("USDT", "BTC", map[string]any{"amountIn": 1.0, "amountOut": 1.0}); routerErrorCode(err) != "BadRequest" {
		t.Fatalf("both amounts are refused, got %v", err)
	}
	if *lastUrl != "" {
		t.Fatalf("neither reached the wire, got %v", *lastUrl)
	}
}

func TestOrderRouterFetchRouteBuildsADeterministicQuery(t *testing.T) {
	router, lastUrl := routerRecordingRouter(t, map[string]any{"apiKey": "k", "baseUrl": "https://example.test/api/"}, map[string]any{"hops": []any{}})
	if _, err := router.FetchRoute("usdt", "btc", map[string]any{"amountIn": 0.001, "strategy": "split_capped", "maxVenues": 3.0, "exchanges": []any{"binance", "kraken"}, "certified": true}); err != nil {
		t.Fatalf("fetchRoute: %v", err)
	}
	expected := "https://example.test/api/route?from=USDT&to=BTC&amountIn=0.001&strategy=split_capped&maxVenues=3&exchanges=binance%2Ckraken&certified=true"
	if *lastUrl != expected {
		t.Fatalf("query mismatch\n got %v\nwant %v", *lastUrl, expected)
	}
}

func TestOrderRouterFetchRouteWithBalancesSkipsZerosAndSortsLargestFirst(t *testing.T) {
	router, lastUrl := routerRecordingRouter(t, map[string]any{"apiKey": "k"}, map[string]any{"hops": []any{}, "balancesApplied": "stub.BTC:1,stub.USDT:1000"})
	venues := routerStubVenues(map[string]*orderRouterStubVenue{"stub": newOrderRouterStubVenue(1, false)})
	route, err := router.FetchRouteWithBalances("USDT", "BTC", venues, map[string]any{"amountIn": 10.0})
	if err != nil {
		t.Fatalf("fetchRouteWithBalances: %v", err)
	}
	if route["balancesUsed"] != "stub.USDT:1000,stub.BTC:1" {
		t.Fatalf("largest first, and the ZERO holding is gone, got %v", route["balancesUsed"])
	}
	if len(route["balancesDropped"].([]map[string]any)) != 0 {
		t.Fatalf("nothing was dropped, got %v", route["balancesDropped"])
	}
	if !strings.Contains(*lastUrl, "balances=stub.USDT%3A1000%2Cstub.BTC%3A1") {
		t.Fatalf("the balances reached the query, got %v", *lastUrl)
	}
}

func TestOrderRouterFetchRouteWithBalancesRefusesARouteTheRouterIgnored(t *testing.T) {
	silent, _ := routerRecordingRouter(t, map[string]any{"apiKey": "k"}, map[string]any{"hops": []any{}})
	venues := routerStubVenues(map[string]*orderRouterStubVenue{"stub": newOrderRouterStubVenue(1, false)})
	if _, err := silent.FetchRouteWithBalances("USDT", "BTC", venues, map[string]any{"amountIn": 10.0}); routerErrorCode(err) != "ExchangeError" {
		t.Fatalf("a router that never echoed balancesApplied is refused, got %v", err)
	}
	// and the caller can opt out with their eyes open
	opted, _ := routerRecordingRouter(t, map[string]any{"apiKey": "k"}, map[string]any{"hops": []any{}})
	route, err := opted.FetchRouteWithBalances("USDT", "BTC", venues, map[string]any{"amountIn": 10.0, "requireBalancesApplied": false})
	if err != nil {
		t.Fatalf("the opt-out works: %v", err)
	}
	if route["balancesUsed"] != "stub.USDT:1000,stub.BTC:1" {
		t.Fatalf("the balances were still built, got %v", route["balancesUsed"])
	}
}

func TestOrderRouterFetchRouteWithBalancesTrimsToTheEntryCap(t *testing.T) {
	router, _ := routerRecordingRouter(t, map[string]any{"apiKey": "k"}, map[string]any{"hops": []any{}, "balancesApplied": "x"})
	many := newOrderRouterStubVenue(1, false)
	many.balanceFn = func() (Balances, error) {
		free := map[string]*float64{}
		for i := 0; i < 70; i++ {
			amount := float64(i + 1)
			free["C"+strconv.Itoa(i)] = &amount
		}
		return Balances{Free: free}, nil
	}
	route, err := router.FetchRouteWithBalances("USDT", "BTC", routerStubVenues(map[string]*orderRouterStubVenue{"stub": many}), map[string]any{"amountIn": 10.0})
	if err != nil {
		t.Fatalf("fetchRouteWithBalances: %v", err)
	}
	dropped := route["balancesDropped"].([]map[string]any)
	if len(dropped) != 6 {
		t.Fatalf("70 holdings trim to 64, got %d dropped", len(dropped))
	}
	if parts := strings.Split(route["balancesUsed"].(string), ","); len(parts) != OrderRouterMaxBalanceEntries {
		t.Fatalf("64 entries survive, got %d", len(parts))
	}
	for i := 0; i < len(dropped); i++ {
		if routerStringAt(dropped[i], "reason", "") != "entry_cap" {
			t.Fatalf("dropped for the entry cap, got %v", dropped[i])
		}
		if routerNumberAt(dropped[i], "amount", 0) > 6 {
			t.Fatalf("the six smallest holdings are the ones that went, got %v", dropped[i])
		}
	}
}

func TestOrderRouterFormatNumberNeverEmitsExponentNotation(t *testing.T) {
	router := routerTestRouter(t)
	cases := []struct {
		value    float64
		expected string
	}{
		{0.0000001, "0.0000001"},
		{0, "0"},
		{1000000, "1000000"},
		{0.5, "0.5"},
		{1e-15, "0"},
	}
	for _, testCase := range cases {
		got, err := router.FormatNumber(testCase.value)
		if err != nil {
			t.Fatalf("formatNumber(%v): %v", testCase.value, err)
		}
		if got != testCase.expected {
			t.Fatalf("formatNumber(%v) = %v, want %v", testCase.value, got, testCase.expected)
		}
	}
	if _, err := router.FormatNumber(1e21); routerErrorCode(err) != "BadRequest" {
		t.Fatalf("refused rather than rendered as 1e+21 in one language and not the others, got %v", err)
	}
}

// TestOrderRouterRealVenuesCarryThePrecisionSurface is the one test that pins
// the Go-specific hazard. AmountToPrecision and PriceToPrecision are NOT declared
// on IExchange — they are promoted from the embedded Exchange — so the router
// reaches them through a type assertion. If a future regeneration broke that
// promotion, every live step would fail with NotSupported and only this test
// would say why. It constructs real exchanges and touches no network.
func TestOrderRouterRealVenuesCarryThePrecisionSurface(t *testing.T) {
	router := routerTestRouter(t)
	for _, exchangeId := range []string{"binance", "kraken", "okx", "mexc"} {
		venue := CreateExchange(exchangeId, map[string]any{})
		if venue == nil {
			t.Fatalf("%s: CreateExchange returned nil", exchangeId)
		}
		if _, ok := venue.(orderRouterPrecision); !ok {
			t.Fatalf("%s: does not satisfy orderRouterPrecision, so Execute could never snap an order", exchangeId)
		}
		// and the IOC probe reads a real features block rather than an empty one
		if !router.venueSupportsIoc(venue) {
			t.Fatalf("%s: reads as unable to do IOC, which would push Execute toward a market order", exchangeId)
		}
	}
}

// TestOrderRouterNeverWithdraws is a source-level guard, not a behavioural one:
// the class must never reach a funds-transfer endpoint, and the cheapest way to
// keep that true forever is to fail the build the moment the token appears.
func TestOrderRouterNeverWithdraws(t *testing.T) {
	source, err := os.ReadFile("exchange_order_router.go")
	if err != nil {
		t.Fatalf("the router source is unreadable: %v", err)
	}
	if strings.Contains(strings.ToLower(string(source)), "withdraw") {
		t.Fatal("OrderRouter must never call a funds-transfer endpoint, and the token must not appear at all")
	}
}

// routerMustPlan unwraps BuildExecutionPlan's (plan, error) pair for the tests that expect the
// route to be coherent. The tests that expect a refusal read the error directly instead.
// Go only allows f(g()) when g supplies every argument, so this cannot take *testing.T and must
// panic instead of calling t.Fatalf; the panic still fails the test, with the offending call in
// the stack.
func routerMustPlan(plan map[string]any, err error) map[string]any {
	if err != nil {
		panic("BuildExecutionPlan: " + err.Error())
	}
	return plan
}

// ---------------------------------------------------------------------------
// the plan is checked against the client's OWN record of the question
// ---------------------------------------------------------------------------

func TestOrderRouterRefusesRouteThatDoesNotProduceTheRequestedAsset(t *testing.T) {
	// BuildExecutionPlan used to copy from, to, pair and side straight out of the server's JSON,
	// and the safety checks only tested internal consistency against whatever market that named.
	// So a compromised — or simply buggy — router response could steer real orders into any real
	// market and every check would pass it, under the 25 USD cap.
	router := routerTestRouter(t)
	route := routerOneLegRoute("buy", "BTC", "USDT", 0.1, 100)
	route["clientRequestedFrom"] = "USDT"
	route["clientRequestedTo"] = "ETH" // the caller wanted ETH; the route delivers BTC
	_, err := router.BuildExecutionPlan(route, nil)
	if err == nil || !strings.Contains(err.Error(), "produces BTC, not the requested ETH") {
		t.Fatalf("expected a produces-mismatch refusal, got %v", err)
	}
}

func TestOrderRouterRefusesRouteThatSpendsAnAssetTheCallerNeverOffered(t *testing.T) {
	router := routerTestRouter(t)
	route := routerOneLegRoute("buy", "BTC", "USDT", 0.1, 100)
	route["clientRequestedFrom"] = "EUR"
	route["clientRequestedTo"] = "BTC"
	_, err := router.BuildExecutionPlan(route, nil)
	if err == nil || !strings.Contains(err.Error(), "spends USDT, not the requested EUR") {
		t.Fatalf("expected a spends-mismatch refusal, got %v", err)
	}
}

func TestOrderRouterRefusesBridgedRouteWhoseHopsDoNotConnect(t *testing.T) {
	// Internal coherence, checked with or without a client stamp: hop 2 must spend exactly what
	// hop 1 produced, or the plan strands the proceeds of one order and funds the next from a
	// wallet nobody checked.
	router := routerTestRouter(t)
	route := routerTwoHopRoute()
	second := routerListAt(route, "hops")[1].(map[string]any)
	second["base"] = "DOGE"
	second["quote"] = "EUR"
	_, err := router.BuildExecutionPlan(route, nil)
	if err == nil || !strings.Contains(err.Error(), "spends DOGE but the previous hop produced BTC") {
		t.Fatalf("expected a chain-break refusal, got %v", err)
	}
}

func TestOrderRouterWellFormedRouteStillPlans(t *testing.T) {
	router := routerTestRouter(t)
	route := routerOneLegRoute("buy", "BTC", "USDT", 0.1, 100)
	route["clientRequestedFrom"] = "USDT"
	route["clientRequestedTo"] = "BTC"
	plan := routerMustPlan(router.BuildExecutionPlan(route, nil))
	if steps := routerListAt(plan, "steps"); len(steps) != 1 {
		t.Fatalf("expected 1 step, got %d", len(steps))
	}
}

func TestOrderRouterFixtureReconcileSequence(t *testing.T) {
	// ReconcileExecutionStep is pure and cannot remember across calls, so a hop's cumulative
	// shortfall lives on the steps themselves — written by applyResize. That interaction is only
	// visible across a SEQUENCE of calls, which reconcileCases (one call each) cannot express,
	// and it is exactly where the five ports could silently disagree.
	router := routerTestRouter(t)
	fixture := routerFixture(t)
	for _, testCase := range routerFixtureCases(t, fixture, "reconcileSequenceCases") {
		id := routerStringAt(testCase, "id", "")
		raw := routerListAt(testCase, "steps")
		steps := make([]map[string]any, 0, len(raw))
		for i := 0; i < len(raw); i++ {
			copied := map[string]any{}
			for key, value := range routerContainer(raw[i]) {
				copied[key] = value
			}
			steps = append(steps, copied)
		}
		calls := routerListAt(testCase, "calls")
		expectedScales := routerListAt(testCase, "expectedScales")
		for c := 0; c < len(calls); c++ {
			// the plan is rebuilt from the working steps on every call, exactly as Execute does
			// — PHP copies arrays on assignment, so a plan built once outside this loop would
			// mean five ports running five different tests
			plan := map[string]any{"steps": steps, "reconcileToleranceRatio": routerNumberAt(testCase, "reconcileToleranceRatio", 0)}
			reconciliation, err := router.ReconcileExecutionStep(plan, int(routerNumberAt(calls[c], "stepIndex", 0)), routerNumberAt(calls[c], "realisedOut", 0))
			if err != nil {
				t.Fatalf("reconcileSequenceCase %s call %d: %v", id, c, err)
			}
			if !routerNumbersMatch(routerNumberAt(reconciliation, "scale", 0), routerToNumber(expectedScales[c], math.NaN())) {
				t.Fatalf("reconcileSequenceCase %s call %d: scale %v", id, c, reconciliation["scale"])
			}
			router.applyResize(steps, reconciliation)
		}
		expectedAmounts := routerListAt(testCase, "expectedAmounts")
		for s := 0; s < len(steps); s++ {
			if !routerNumbersMatch(routerNumberAt(steps[s], "amount", 0), routerToNumber(expectedAmounts[s], math.NaN())) {
				t.Fatalf("reconcileSequenceCase %s step %d: amount %v", id, s, steps[s]["amount"])
			}
		}
	}
}

// ---------------------------------------------------------------------------
// idempotency (audit finding 35): Execute used to build fresh state on every
// call and consult nothing, so running the same plan twice placed every order
// twice — including the ones that had already filled.
// ---------------------------------------------------------------------------

func TestOrderRouterLiveRequiresAnIdentity(t *testing.T) {
	router := routerTestRouter(t)
	route := routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100)
	route["requestId"] = ""
	plan := routerMustPlan(router.BuildExecutionPlan(route, nil))
	rates := map[string]any{"USDT": 1.0}
	live := map[string]any{"strategy": "sequential", "live": true, "usdRates": rates}
	venue := newOrderRouterStubVenue(1, false)
	_, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), live)
	if err == nil || !strings.Contains(err.Error(), "carries no requestId") {
		t.Fatalf("a live plan with no identity must be refused, got %v", err)
	}
	if len(venue.callLog()) != 0 {
		t.Fatalf("refused before a single call reached the venue, got %v", venue.callLog())
	}
	// a rehearsal needs no identity: it places nothing
	dry, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{"strategy": "sequential", "usdRates": rates})
	if err != nil || dry["dryRun"] != true {
		t.Fatalf("a dry run needs no identity, got %v %v", dry["dryRun"], err)
	}
	// ...and a HAND-ASSEMBLED plan is a supported input: Execute takes any map of the plan
	// shape, and such a plan never went through a routing request, so requestId is the one
	// identity it cannot have. options idempotencyKey is how it supplies one.
	supplied := newOrderRouterStubVenue(1, false)
	keyed, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": supplied}), map[string]any{"strategy": "sequential", "live": true, "usdRates": rates, "idempotencyKey": "hand-built-1"})
	if err != nil {
		t.Fatalf("a supplied idempotencyKey is an identity: %v", err)
	}
	if routerStringAt(keyed, "planId", "") != "hand-built-1" {
		t.Fatalf("the supplied key is the identity, got %v", keyed["planId"])
	}
	if routerStringAt(keyed["steps"].([]map[string]any)[0], "status", "") != "filled" {
		t.Fatal("and the plan executes")
	}
	if routerStringAt(supplied.paramsSeen[0], "clientOrderId", "") != "hand-built-1-0" {
		t.Fatalf("the client order id is seeded from it, got %v", supplied.paramsSeen[0])
	}
	// and the guard keys off it, exactly as it does off a requestId
	again := newOrderRouterStubVenue(1, false)
	_, err = router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": again}), map[string]any{"strategy": "sequential", "live": true, "usdRates": rates, "idempotencyKey": "hand-built-1"})
	if err == nil || !strings.Contains(err.Error(), "already executed") {
		t.Fatalf("the same key must be refused a second time, got %v", err)
	}
	// an explicit key OVERRIDES a plan's requestId: passing one is a deliberate statement
	// about what this execution is, and the caller is closer to that than the plan is
	routed := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	overridden := newOrderRouterStubVenue(1, false)
	report, err := router.Execute(routed, routerStubVenues(map[string]*orderRouterStubVenue{"stub": overridden}), map[string]any{"strategy": "sequential", "live": true, "usdRates": rates, "idempotencyKey": "override-1"})
	if err != nil {
		t.Fatalf("an explicit key overrides: %v", err)
	}
	if routerStringAt(report, "planId", "") != "override-1" {
		t.Fatalf("the option overrides the requestId, got %v", report["planId"])
	}
	if routerStringAt(overridden.paramsSeen[0], "clientOrderId", "") != "override-1-0" {
		t.Fatalf("and seeds the client order id, got %v", overridden.paramsSeen[0])
	}
}

func TestOrderRouterDeterministicClientOrderIds(t *testing.T) {
	router := routerTestRouter(t)
	route := routerTwoHopRoute()
	route["requestId"] = "fixed-req"
	plan := routerMustPlan(router.BuildExecutionPlan(route, nil))
	venue := newOrderRouterStubVenue(1, false)
	// a caller-supplied clientOrderId must NOT win: one id reused across every step of a
	// plan is worse than none at all
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": venue}), map[string]any{
		"strategy":    "sequential",
		"live":        true,
		"usdRates":    map[string]any{"USDT": 1.0},
		"orderParams": map[string]any{"clientOrderId": "caller-supplied", "reduceOnly": true},
	})
	if err != nil {
		t.Fatalf("execute: %v", err)
	}
	if routerStringAt(report, "planId", "") != "fixed-req" {
		t.Fatalf("the report names the plan identity, got %v", report["planId"])
	}
	if len(venue.paramsSeen) != 2 {
		t.Fatalf("expected two orders, got %d", len(venue.paramsSeen))
	}
	if routerStringAt(venue.paramsSeen[0], "clientOrderId", "") != "fixed-req-0" ||
		routerStringAt(venue.paramsSeen[1], "clientOrderId", "") != "fixed-req-1" {
		t.Fatalf("every step carries its own deterministic id, got %v", venue.paramsSeen)
	}
	if venue.paramsSeen[0]["reduceOnly"] != true {
		t.Fatal("the caller's other params still travel")
	}
	results := report["steps"].([]map[string]any)
	if routerStringAt(results[0], "clientOrderId", "") != "fixed-req-0" ||
		routerStringAt(results[1], "clientOrderId", "") != "fixed-req-1" {
		t.Fatal("and the report says what was sent")
	}
	// DETERMINISTIC: another instance, another day, the same plan — the same ids, which is
	// the whole point. A random id would be rejected by nothing.
	second := routerTestRouter(t)
	other := newOrderRouterStubVenue(1, false)
	if _, err := second.Execute(routerMustPlan(second.BuildExecutionPlan(route, nil)), routerStubVenues(map[string]*orderRouterStubVenue{"stub": other}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}}); err != nil {
		t.Fatalf("second instance: %v", err)
	}
	if routerStringAt(other.paramsSeen[0], "clientOrderId", "") != "fixed-req-0" {
		t.Fatalf("a second instance sends the same id, got %v", other.paramsSeen[0])
	}
}

func TestOrderRouterReexecutionIsRefused(t *testing.T) {
	router := routerTestRouter(t)
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	options := map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}}
	first := newOrderRouterStubVenue(1, false)
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": first}), options)
	if err != nil {
		t.Fatalf("the first run places the order: %v", err)
	}
	if routerStringAt(report["steps"].([]map[string]any)[0], "status", "") != "filled" {
		t.Fatal("the first run fills")
	}
	again := newOrderRouterStubVenue(1, false)
	_, err = router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": again}), options)
	if err == nil || !strings.Contains(err.Error(), "already executed") {
		t.Fatalf("the second run must be refused, got %v", err)
	}
	if len(again.callLog()) != 0 {
		t.Fatalf("not one order was re-placed, got %v", again.callLog())
	}
	// a plan rebuilt from the same route is the same plan: the identity travels with it
	rebuiltRoute := routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100)
	rebuiltRoute["requestId"] = routerStringAt(plan, "requestId", "")
	rebuilt := routerMustPlan(router.BuildExecutionPlan(rebuiltRoute, nil))
	third := newOrderRouterStubVenue(1, false)
	_, err = router.Execute(rebuilt, routerStubVenues(map[string]*orderRouterStubVenue{"stub": third}), options)
	if err == nil || !strings.Contains(err.Error(), "already executed") {
		t.Fatalf("a rebuilt plan with the same identity is refused too, got %v", err)
	}
	// ...and the legitimate retry path is explicit
	allowed := newOrderRouterStubVenue(1, false)
	retry, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": allowed}), map[string]any{"strategy": "sequential", "live": true, "usdRates": map[string]any{"USDT": 1.0}, "allowReexecution": true})
	if err != nil {
		t.Fatalf("an explicit opt-in runs it again: %v", err)
	}
	if routerStringAt(retry["steps"].([]map[string]any)[0], "status", "") != "filled" || len(allowed.callLog()) == 0 {
		t.Fatal("and really does place the order")
	}
}

func TestOrderRouterDryRunDoesNotConsumeAPlan(t *testing.T) {
	router := routerTestRouter(t)
	rates := map[string]any{"USDT": 1.0}
	plan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	if _, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": newOrderRouterStubVenue(1, false)}), map[string]any{"strategy": "sequential", "usdRates": rates}); err != nil {
		t.Fatalf("rehearsal: %v", err)
	}
	report, err := router.Execute(plan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": newOrderRouterStubVenue(1, false)}), map[string]any{"strategy": "sequential", "live": true, "usdRates": rates})
	if err != nil {
		t.Fatalf("the rehearsal did not burn the plan: %v", err)
	}
	if routerStringAt(report["steps"].([]map[string]any)[0], "status", "") != "filled" {
		t.Fatal("the live run after a rehearsal fills")
	}
	// a run that FAILED still placed orders — or may have — so the retry is refused just the
	// same. The ledger records the attempt, not the outcome.
	failedPlan := routerMustPlan(router.BuildExecutionPlan(routerOneLegRoute("buy", "BTC", "USDT", 0.2, 100), nil))
	broken := newOrderRouterStubVenue(1, true)
	failedReport, err := router.Execute(failedPlan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": broken}), map[string]any{"strategy": "sequential", "live": true, "usdRates": rates})
	if err != nil {
		t.Fatalf("a contained failure is reported, not returned: %v", err)
	}
	if failedReport["halted"] != true {
		t.Fatal("the run halted")
	}
	retry := newOrderRouterStubVenue(1, false)
	_, err = router.Execute(failedPlan, routerStubVenues(map[string]*orderRouterStubVenue{"stub": retry}), map[string]any{"strategy": "sequential", "live": true, "usdRates": rates})
	if err == nil || !strings.Contains(err.Error(), "already executed") {
		t.Fatalf("a failed run still consumed the plan, got %v", err)
	}
	if len(retry.callLog()) != 0 {
		t.Fatalf("and the retry placed nothing, got %v", retry.callLog())
	}
}
