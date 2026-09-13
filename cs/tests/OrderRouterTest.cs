// NO_AUTO_TRANSPILE
//  ---------------------------------------------------------------------------
//  OrderRouter — offline tests, C# port.
//
//  Two halves, and both matter:
//
//  1. The FIXTURE half drives the four pure methods from
//     ts/src/test/base/fixtures/orderRouter.json — the SAME file the
//     TypeScript, Python, PHP and Go suites read. Nothing here restates an
//     expected value by hand: every expectation is read out of that file, so a
//     port that drifts fails in its own language and nowhere else, which is
//     what makes drift impossible to hide. The comparison follows the algorithm
//     the fixture's own `comparison` field documents: key sets compared in BOTH
//     directions, numbers at a 1e-9 relative tolerance, strings/booleans and
//     array lengths exactly.
//
//  2. The INVARIANT half asserts the safety properties directly, in literal
//     numbers written by hand. The fixture's expectations were produced by the
//     reference implementation, so on their own they would only prove the six
//     languages agree — not that they agree on the right answer. These are the
//     tests that would fail if the implementation itself were wrong.
//
//  Nothing here touches the network and nothing here places an order. The only
//  venues are the StubVenue below, which records every call it receives so that
//  "the dry run reached the venue zero times" is an assertion and not a hope.
//  ---------------------------------------------------------------------------

using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Threading.Tasks;

using ccxt;

namespace Tests;

using dict = Dictionary<string, object>;
using list = List<object>;

/// <summary>
/// The offline OrderRouter suite. Call <see cref="RunAll"/>; it returns the
/// number of failed tests and prints one line per test.
/// </summary>
public class OrderRouterTest
{
    private const double Tolerance = 1e-9;

    private static dict fixture = null;

    private static int failures = 0;

    private static int passes = 0;

    //  -----------------------------------------------------------------------
    //  entry point
    //  -----------------------------------------------------------------------

    public static int RunAll()
    {
        failures = 0;
        passes = 0;
        fixture = LoadFixture();
        //  1. the shared fixture — the cross-language contract
        Run("fixture: buildExecutionPlan", FixtureBuildExecutionPlan);
        Run("fixture: buildExecutionPlan is deterministic and does not mutate its input", FixtureBuildExecutionPlanIsPure);
        Run("fixture: checkExecutionPlanSafety", FixtureCheckExecutionPlanSafety);
        Run("fixture: reconcileExecutionStep", FixtureReconcileExecutionStep);
        Run("fixture: a sequence of reconciliations on one hop", FixtureReconcileSequence);
        Run("fixture: buildUnwindPlan", FixtureBuildUnwindPlan);
        Run("fixture: numberAt reads one number grammar in all six languages", FixtureNumberAt);
        Run("fixture: formatNumber spells one number one way in all six languages", FixtureFormatNumber);
        RunAsync("fixture: a fee in the acquired asset resizes what the next hop is sized on", FixtureFeeNetting);
        Run("a route that does not run from the requested asset to the requested asset is refused", RouteProducesMismatch);
        Run("a route that spends an asset the caller never offered is refused", RouteSpendsMismatch);
        Run("a bridged route whose hops do not connect is refused", RouteChainBreak);
        Run("a well-formed route still plans normally", RouteWellFormedStillPlans);
        //  2. invariants, asserted directly rather than through the fixture
        Run("constructor: apiKey is required, and maxNotionalUsd is an opt-in guardrail at any size", ConstructorGuards);
        Run("a hand-built plan carrying only the required fields is executable", HandBuiltPlanIsExecutable);
        Run("the derived limit price and notional follow amount and expectedPrice", DerivedLimitPriceAndNotional);
        Run("the limit price sits on the side that costs you, and only there", LimitPriceSide);
        Run("a cap that IS set binds exactly, at whatever size, and includes the slippage", NotionalCap);
        Run("with no cap set, no notional check runs at all", NoCapMeansNoNotionalCheck);
        Run("a step that cannot be valued in USD BLOCKS when a cap is in force — it is never skipped", UnvaluableBlocks);
        Run("USDT is not assumed to be one dollar; USD is", UsdtIsNotADollar);
        Run("an empty plan is not a safe plan", EmptyPlanIsNotSafe);
        Run("reconcileExecutionStep never scales a downstream order UP", ReconcileNeverScalesUp);
        Run("reconcileExecutionStep halts on a total miss and on an over-tolerance shortfall", ReconcileHalts);
        Run("a fee the router already subtracted is not subtracted a second time", FeeIsNotDoubleSubtracted);
        RunAsync("a router that ignored the balances is caught, including when the wallet is empty", BalancesEchoIsVerified);
        RunAsync("a caller-chosen audit id travels as x-request-id", RequestIdHeader);
        Run("buildUnwindPlan is never automatic and never nets across venues", UnwindNeverNetsAcrossVenues);
        Run("a buy-side unwind order never spends more quote than the residual actually holds", UnwindBuyIsFundable);
        //  3. execute — stub venues only, and not one real order anywhere
        RunAsync("dry_run is the default: a live-looking call with live unset places nothing", DryRunIsTheDefault);
        RunAsync("execute refuses to go live without a way to value the trade in USD — when a cap is set", RefusesLiveWithoutRates);
        RunAsync("execute refuses to go live above a cap the caller set", RefusesLiveAboveTheCap);
        RunAsync("sequential places IOC limit orders in plan order", SequentialPlacesIoc);
        RunAsync("sequential obeys the halt verdict and never starts the next hop", SequentialObeysHalt);
        RunAsync("a market order needs BOTH a venue that cannot do IOC and an explicit opt-in", MarketOrdersNeedBoth);
        RunAsync("a resting order on an immediate path is cancelled, and a cancel that fails halts the route", ARestingOrderIsCancelled);
        RunAsync("parallel_within_hop contains a failing leg instead of abandoning its siblings", ParallelContainsFailure);
        RunAsync("best_effort refuses multi-hop and demands both of its acknowledgements", BestEffortRefusals);
        RunAsync("best_effort stops at maxOrders and never halts", BestEffortMaxOrders);
        Run("a per-call cap overrides the client-level one, in both directions", PerCallCapOverrides);
        RunAsync("best_effort derives the hop count from the steps, not from a key the plan may not carry", BestEffortDerivesHopCount);
        RunAsync("venueSupportsIoc reads the dictionary of booleans every real exchange declares", VenueSupportsIocReadsADictionary);
        RunAsync("limit_protected keeps the fill from an order the venue canceled on the last poll", LimitProtectedKeepsAVenueSideCancelFill);
        RunAsync("limit_protected refuses a non-positive pollIntervalMs before placing anything", LimitProtectedRefusesAZeroPollInterval);
        RunAsync("a failure after createOrder still reports the order id and an open order", OrderIdSurvivesAFailureAfterCreate);
        RunAsync("an unknown strategy is refused even in dry run", UnknownStrategyRefused);
        RunAsync("a live plan with no identity is refused, and an idempotencyKey supplies one", LiveRequiresAnIdentity);
        RunAsync("execute never sets a clientOrderId: the venue keeps its own, and a caller-supplied one travels untouched", ClientOrderIdIsNeverInjected);
        RunAsync("the same plan is refused on a second live execution, and only an explicit opt-in overrides it", ReexecutionIsRefused);
        RunAsync("a dry run never consumes a plan, and a halted live run always does", DryRunDoesNotConsumeAPlan);
        RunAsync("the re-execution ledger is bounded, evicts oldest-first, and says so by re-allowing an evicted plan", LedgerIsBounded);
        RunAsync("a plan carries its age, and a stale one is refused only when asked", PlanAgeIsReportedAndRefusedOnlyWhenAsked);
        RunAsync("atomic_ish demands the whole route pre-funded", AtomicIshDemandsPrefunding);
        RunAsync("a fee charged in the acquired asset is netted out of what the hop carries forward", FeeInAcquiredAssetIsNetted);
        //  4. fetchRoute request shaping, with the HTTP layer stubbed out
        RunAsync("fetchRoute refuses neither-or-both amounts before touching the network", FetchRouteRefusesAmbiguousAmounts);
        RunAsync("fetchRoute builds a deterministic query", FetchRouteQuery);
        RunAsync("a route carrying balances is POSTed, and the holdings never appear in the url", FetchRouteBalancesArePosted);
        RunAsync("an empty-string balances value is still holdings, and still goes by POST", FetchRouteEmptyBalancesStillPosted);
        RunAsync("the read-only endpoints each hit their own path and unwrap their own envelope", ReadOnlyEndpointsHitTheirOwnPaths);
        RunAsync("fetchRouteWithBalances skips zeros, sorts largest first and reports what it dropped", BalancesSkipsAndSorts);
        RunAsync("fetchRouteWithBalances refuses a route computed against balances the router ignored", BalancesMustBeEchoed);
        RunAsync("fetchRouteWithBalances trims to the router 64-entry cap, dropping the smallest", BalancesEntryCap);
        RunAsync("onStep sees every step and can stop the route", OnStepSeesEveryStepAndCanStop);
        RunAsync("an onStep that throws is recorded, and does not take the run down with it", OnStepThatThrowsIsRecorded);
        RunAsync("onStep can only narrow: it cannot resume a route the reconciliation already halted", OnStepCanOnlyNarrow);
        RunAsync("retryFailedSteps re-places a rejected step as a fresh order, and never retries an unknown outcome", RetryPlacesAFreshOrder);
        Run("formatNumber never emits exponent notation", FormatNumberIsPlain);
        Console.WriteLine("[C#] OrderRouter: " + passes.ToString(CultureInfo.InvariantCulture) + " passed, " + failures.ToString(CultureInfo.InvariantCulture) + " failed");
        return failures;
    }

    private static void Run(string name, Action body)
    {
        try
        {
            body();
            passes = passes + 1;
            Console.WriteLine("  ok   " + name);
        }
        catch (Exception e)
        {
            failures = failures + 1;
            Console.WriteLine("  FAIL " + name + "\n       " + e.Message);
        }
    }

    private static void RunAsync(string name, Func<Task> body)
    {
        Run(name, () => body().GetAwaiter().GetResult());
    }

    //  -----------------------------------------------------------------------
    //  assertions
    //  -----------------------------------------------------------------------

    private class AssertionError : Exception
    {
        public AssertionError(string message) : base(message) { }
    }

    private static void Ok(bool condition, string message)
    {
        if (!condition)
        {
            throw new AssertionError(message);
        }
    }

    private static void EqualString(string actual, string expected, string message)
    {
        if (actual != expected)
        {
            throw new AssertionError(message + ": expected \"" + expected + "\", got \"" + actual + "\"");
        }
    }

    private static void EqualNumber(double actual, double expected, string message)
    {
        if (!NumbersMatch(actual, expected))
        {
            throw new AssertionError(message + ": expected " + Describe(expected) + ", got " + Describe(actual));
        }
    }

    private static void EqualBool(bool actual, bool expected, string message)
    {
        if (actual != expected)
        {
            throw new AssertionError(message + ": expected " + (expected ? "true" : "false") + ", got " + (actual ? "true" : "false"));
        }
    }

    private static void Throws<T>(Action body, string message) where T : Exception
    {
        try
        {
            body();
        }
        catch (Exception e)
        {
            if (e is T)
            {
                return;
            }
            throw new AssertionError(message + ": expected " + typeof(T).Name + ", got " + e.GetType().Name + " (" + e.Message + ")");
        }
        throw new AssertionError(message + ": expected " + typeof(T).Name + ", nothing was thrown");
    }

    private static async Task Rejects<T>(Func<Task> body, string message) where T : Exception
    {
        try
        {
            await body();
        }
        catch (Exception e)
        {
            if (e is T)
            {
                return;
            }
            throw new AssertionError(message + ": expected " + typeof(T).Name + ", got " + e.GetType().Name + " (" + e.Message + ")");
        }
        throw new AssertionError(message + ": expected " + typeof(T).Name + ", nothing was thrown");
    }

    private static bool NumbersMatch(double a, double b)
    {
        if (a == b)
        {
            return true;
        }
        if (double.IsInfinity(a) || double.IsInfinity(b) || double.IsNaN(a) || double.IsNaN(b))
        {
            //  an infinity only ever matches itself. Without this the relative
            //  comparison below reads Infinity <= Infinity as a match and an
            //  infinite value passes against ANY expectation — which is exactly
            //  how a number grammar that overflows would slip past numberCases
            return false;
        }
        double scale = 1;
        if (Math.Abs(a) > scale)
        {
            scale = Math.Abs(a);
        }
        if (Math.Abs(b) > scale)
        {
            scale = Math.Abs(b);
        }
        return Math.Abs(a - b) <= Tolerance * scale;
    }

    /// <summary>
    /// The comparison algorithm the fixture documents, and the one every port's
    /// test must use: arrays element by element with the same length, objects
    /// with the key sets compared in BOTH directions so that a missing field and
    /// an invented field are both drift, numbers at a 1e-9 relative tolerance,
    /// and everything else exactly.
    /// </summary>
    private static void AssertMatches(object actual, object expected, string where)
    {
        if (IsList(expected))
        {
            Ok(IsList(actual), where + ": expected an array");
            var expectedItems = ToList(expected);
            var actualItems = ToList(actual);
            EqualNumber(actualItems.Count, expectedItems.Count, where + ": array length");
            for (var i = 0; i < expectedItems.Count; i++)
            {
                AssertMatches(actualItems[i], expectedItems[i], where + "[" + i.ToString(CultureInfo.InvariantCulture) + "]");
            }
            return;
        }
        if (IsDict(expected))
        {
            Ok(IsDict(actual) && !IsList(actual), where + ": expected an object, got " + Describe(actual));
            var expectedMap = ToDict(expected);
            var actualMap = ToDict(actual);
            foreach (var entry in expectedMap)
            {
                Ok(actualMap.ContainsKey(entry.Key), where + ": missing key " + entry.Key);
            }
            foreach (var entry in actualMap)
            {
                Ok(expectedMap.ContainsKey(entry.Key), where + ": unexpected key " + entry.Key);
            }
            foreach (var entry in expectedMap)
            {
                AssertMatches(actualMap[entry.Key], entry.Value, where + "." + entry.Key);
            }
            return;
        }
        if (IsNumber(expected))
        {
            Ok(IsNumber(actual), where + ": expected a number, got " + Describe(actual));
            EqualNumber(ToDouble(actual), ToDouble(expected), where);
            return;
        }
        if (expected is bool)
        {
            Ok(actual is bool, where + ": expected a boolean, got " + Describe(actual));
            EqualBool((bool)actual, (bool)expected, where);
            return;
        }
        if (expected is string)
        {
            Ok(actual is string, where + ": expected a string, got " + Describe(actual));
            EqualString((string)actual, (string)expected, where);
            return;
        }
        Ok(actual == null && expected == null, where + ": expected " + Describe(expected) + ", got " + Describe(actual));
    }

    //  -----------------------------------------------------------------------
    //  value helpers — the fixture arrives as Dictionary<string, object>,
    //  List<object>, double, long, string, bool and null
    //  -----------------------------------------------------------------------

    private static bool IsList(object value)
    {
        return (value is IList) && !(value is string);
    }

    private static bool IsDict(object value)
    {
        return value is IDictionary<string, object>;
    }

    private static bool IsNumber(object value)
    {
        if (value is bool)
        {
            return false;
        }
        return (value is double) || (value is float) || (value is decimal) || (value is int) || (value is long) || (value is short) || (value is uint) || (value is ulong) || (value is ushort) || (value is byte) || (value is sbyte);
    }

    private static list ToList(object value)
    {
        var items = new list();
        if (value is IList)
        {
            foreach (var item in (IList)value)
            {
                items.Add(item);
            }
        }
        return items;
    }

    private static dict ToDict(object value)
    {
        var map = new dict();
        if (value is IDictionary<string, object>)
        {
            foreach (var entry in (IDictionary<string, object>)value)
            {
                map[entry.Key] = entry.Value;
            }
        }
        return map;
    }

    private static double ToDouble(object value)
    {
        return Convert.ToDouble(value, CultureInfo.InvariantCulture);
    }

    private static int ToInt(object value)
    {
        return Convert.ToInt32(value, CultureInfo.InvariantCulture);
    }

    private static string Describe(object value)
    {
        if (value == null)
        {
            return "null";
        }
        if (value is bool)
        {
            return ((bool)value) ? "true" : "false";
        }
        if (value is string)
        {
            return "\"" + (string)value + "\"";
        }
        if (IsNumber(value))
        {
            return ToDouble(value).ToString("R", CultureInfo.InvariantCulture);
        }
        if (IsList(value))
        {
            return "an array of " + ToList(value).Count.ToString(CultureInfo.InvariantCulture);
        }
        if (IsDict(value))
        {
            var keys = "";
            foreach (var entry in ToDict(value))
            {
                if (keys != "")
                {
                    keys = keys + ", ";
                }
                keys = keys + entry.Key;
            }
            return "an object {" + keys + "}";
        }
        return value.GetType().Name;
    }

    /// <summary>
    /// A stable textual rendering, used only to prove that a pure method did not
    /// mutate the structure it was handed.
    /// </summary>
    private static string Stringify(object value)
    {
        if (value == null)
        {
            return "null";
        }
        if (value is bool)
        {
            return ((bool)value) ? "true" : "false";
        }
        if (value is string)
        {
            return "\"" + (string)value + "\"";
        }
        if (IsNumber(value))
        {
            return ToDouble(value).ToString("R", CultureInfo.InvariantCulture);
        }
        if (IsList(value))
        {
            var items = ToList(value);
            var text = "[";
            for (var i = 0; i < items.Count; i++)
            {
                if (i > 0)
                {
                    text = text + ",";
                }
                text = text + Stringify(items[i]);
            }
            return text + "]";
        }
        if (IsDict(value))
        {
            var map = ToDict(value);
            var keys = new List<string>();
            foreach (var entry in map)
            {
                keys.Add(entry.Key);
            }
            keys.Sort(string.CompareOrdinal);
            var text = "{";
            for (var i = 0; i < keys.Count; i++)
            {
                if (i > 0)
                {
                    text = text + ",";
                }
                text = text + "\"" + keys[i] + "\":" + Stringify(map[keys[i]]);
            }
            return text + "}";
        }
        return value.ToString();
    }

    //  -----------------------------------------------------------------------
    //  the shared fixture
    //  -----------------------------------------------------------------------

    /// <summary>
    /// Finds and reads ts/src/test/base/fixtures/orderRouter.json by walking up
    /// from the test assembly and then from the working directory, so the same
    /// file drives all six languages no matter where the runner was launched.
    /// </summary>
    public static dict LoadFixture()
    {
        var relative = Path.Combine("ts", "src", "test", "base", "fixtures", "orderRouter.json");
        var path = FindUpwards(AppContext.BaseDirectory, relative);
        if (path == "")
        {
            path = FindUpwards(Directory.GetCurrentDirectory(), relative);
        }
        if (path == "")
        {
            throw new AssertionError("could not find " + relative + " above " + AppContext.BaseDirectory + " or " + Directory.GetCurrentDirectory());
        }
        var parsed = JsonHelper.Deserialize(File.ReadAllText(path)) as dict;
        if (parsed == null)
        {
            throw new AssertionError("the OrderRouter fixture is not a JSON object: " + path);
        }
        return parsed;
    }

    private static string FindUpwards(string start, string relative)
    {
        var directory = new DirectoryInfo(start);
        while (directory != null)
        {
            var candidate = Path.Combine(directory.FullName, relative);
            if (File.Exists(candidate))
            {
                return candidate;
            }
            directory = directory.Parent;
        }
        return "";
    }

    private static dict FixtureSection(string name)
    {
        var section = fixture[name] as dict;
        Ok(section != null, "the fixture has a " + name + " section");
        return section;
    }

    private static list FixtureCases(string name)
    {
        var cases = ToList(fixture[name]);
        Ok(cases.Count > 0, "the fixture has " + name);
        return cases;
    }

    private static dict RouteNamed(string name)
    {
        return FixtureSection("routes")[name] as dict;
    }

    private static OrderRouter NewRouter()
    {
        return new OrderRouter(new dict() { { "apiKey", "test-key" } });
    }

    /// <summary>
    /// The only clock the class reads, pinned so a plan's age is deterministic.
    /// </summary>
    private class PinnedClockRouter : OrderRouter
    {
        public double pinned;
        public PinnedClockRouter(dict config) : base(config) { }
        public override double NowMs() { return this.pinned; }
    }

    //  -----------------------------------------------------------------------
    //  1. the shared fixture — the cross-language contract
    //  -----------------------------------------------------------------------

    private static void FixtureBuildExecutionPlan()
    {
        var router = NewRouter();
        var cases = FixtureCases("planCases");
        for (var i = 0; i < cases.Count; i++)
        {
            var testCase = ToDict(cases[i]);
            var route = RouteNamed((string)testCase["route"]);
            var plan = router.BuildExecutionPlan(route, testCase["options"] as dict);
            AssertMatches(plan, testCase["expected"], "planCase " + (string)testCase["id"]);
        }
    }

    private static void FixtureBuildExecutionPlanIsPure()
    {
        var router = NewRouter();
        var cases = FixtureCases("planCases");
        for (var i = 0; i < cases.Count; i++)
        {
            var testCase = ToDict(cases[i]);
            var route = RouteNamed((string)testCase["route"]);
            var before = Stringify(route);
            var first = router.BuildExecutionPlan(route, testCase["options"] as dict);
            var second = router.BuildExecutionPlan(route, testCase["options"] as dict);
            AssertMatches(second, first, "planCase " + (string)testCase["id"] + " repeated");
            EqualString(Stringify(route), before, "planCase " + (string)testCase["id"] + ": the route was mutated");
        }
    }

    private static void FixtureCheckExecutionPlanSafety()
    {
        var router = NewRouter();
        var cases = FixtureCases("safetyCases");
        for (var i = 0; i < cases.Count; i++)
        {
            var testCase = ToDict(cases[i]);
            var route = RouteNamed((string)testCase["route"]);
            var markets = FixtureSection("marketSets")[(string)testCase["markets"]] as dict;
            var plan = router.BuildExecutionPlan(route, testCase["planOptions"] as dict);
            var violations = router.CheckExecutionPlanSafety(plan, markets, testCase["options"] as dict);
            AssertMatches(AsPlainList(violations), testCase["expected"], "safetyCase " + (string)testCase["id"]);
        }
    }

    private static void RefusesPlan(dict route, string fragment, string message)
    {
        var router = NewRouter();
        try
        {
            router.BuildExecutionPlan(route, new dict());
        }
        catch (Exception e)
        {
            if (e.Message.IndexOf(fragment) == -1)
            {
                throw new Exception(message + ": threw \"" + e.Message + "\", expected \"" + fragment + "\"");
            }
            return;
        }
        throw new Exception(message + ": nothing was thrown");
    }

    private static void RouteProducesMismatch()
    {
        //  BuildExecutionPlan used to copy from, to, pair and side straight out of the server's
        //  JSON, and the safety checks only tested internal consistency against whatever market
        //  that named. So a compromised — or simply buggy — router response could steer real
        //  orders into any real market and every check would pass it, under the 25 USD cap.
        var route = OneLegRoute("buy", "BTC", "USDT", 0.1, 100);
        route["clientRequestedFrom"] = "USDT";
        route["clientRequestedTo"] = "ETH";   //  the caller wanted ETH; the route delivers BTC
        RefusesPlan(route, "produces BTC, not the requested ETH", "a produces mismatch");
    }

    private static void RouteSpendsMismatch()
    {
        var route = OneLegRoute("buy", "BTC", "USDT", 0.1, 100);
        route["clientRequestedFrom"] = "EUR";
        route["clientRequestedTo"] = "BTC";
        RefusesPlan(route, "spends USDT, not the requested EUR", "a spends mismatch");
    }

    private static void RouteChainBreak()
    {
        //  Internal coherence, checked with or without a client stamp: hop 2 must spend exactly
        //  what hop 1 produced, or the plan strands the proceeds of one order and funds the next
        //  from a wallet nobody checked.
        var route = TwoHopRoute();
        //  cast, not ToDict: ToDict COPIES, so mutating its result would leave the route untouched
        //  and the test would silently assert nothing
        var second = (dict)ToList(route["hops"])[1];
        second["base"] = "DOGE";
        second["quote"] = "EUR";
        RefusesPlan(route, "spends DOGE but the previous hop produced BTC", "a broken chain");
    }

    private static void RouteWellFormedStillPlans()
    {
        var router = NewRouter();
        var route = OneLegRoute("buy", "BTC", "USDT", 0.1, 100);
        route["clientRequestedFrom"] = "USDT";
        route["clientRequestedTo"] = "BTC";
        var plan = router.BuildExecutionPlan(route, new dict());
        if (ToList(plan["steps"]).Count != 1)
        {
            throw new Exception("a coherent route still plans");
        }
    }

    private static void FixtureReconcileSequence()
    {
        //  ReconcileExecutionStep is pure and cannot remember across calls, so a hop's cumulative
        //  shortfall lives on the steps themselves — written by ApplyResize. That interaction is
        //  only visible across a SEQUENCE of calls, which reconcileCases (one call each) cannot
        //  express, and it is exactly where the six ports could silently disagree.
        var router = NewRouter();
        var cases = FixtureCases("reconcileSequenceCases");
        for (var i = 0; i < cases.Count; i++)
        {
            var testCase = ToDict(cases[i]);
            var id = (string)testCase["id"];
            var raw = ToList(testCase["steps"]);
            var steps = new list();
            for (var s = 0; s < raw.Count; s++)
            {
                var copied = new dict();
                foreach (var pair in ToDict(raw[s]))
                {
                    copied[pair.Key] = pair.Value;
                }
                steps.Add(copied);
            }
            var calls = ToList(testCase["calls"]);
            var expectedScales = ToList(testCase["expectedScales"]);
            for (var c = 0; c < calls.Count; c++)
            {
                //  the plan is rebuilt from the working steps on every call, exactly as Execute
                //  does — PHP copies arrays on assignment, so a plan built once outside this loop
                //  would mean six ports running six different tests
                var plan = new dict() { { "steps", steps }, { "reconcileToleranceRatio", testCase["reconcileToleranceRatio"] } };
                var call = ToDict(calls[c]);
                var reconciliation = router.ReconcileExecutionStep(plan, ToInt(call["stepIndex"]), ToDouble(call["realisedOut"]));
                if (!NumbersMatch(ToDouble(reconciliation["scale"]), ToDouble(expectedScales[c])))
                {
                    throw new Exception("reconcileSequenceCase " + id + " call " + c.ToString(CultureInfo.InvariantCulture) + ": scale " + Describe(reconciliation["scale"]));
                }
                router.ApplyResize(steps, reconciliation);
            }
            var expectedAmounts = ToList(testCase["expectedAmounts"]);
            for (var s = 0; s < steps.Count; s++)
            {
                if (!NumbersMatch(ToDouble(ToDict(steps[s])["amount"]), ToDouble(expectedAmounts[s])))
                {
                    throw new Exception("reconcileSequenceCase " + id + " step " + s.ToString(CultureInfo.InvariantCulture) + ": amount " + Describe(ToDict(steps[s])["amount"]));
                }
            }
        }
    }

    private static void FixtureReconcileExecutionStep()
    {
        var router = NewRouter();
        var cases = FixtureCases("reconcileCases");
        for (var i = 0; i < cases.Count; i++)
        {
            var testCase = ToDict(cases[i]);
            //  a case names either a route to plan from, or a plan written out in
            //  full — the latter is how a plan with field types no builder
            //  produces (an int hopIndex on one step and a float on the next)
            //  gets covered
            dict plan = null;
            if (testCase.ContainsKey("plan"))
            {
                plan = FixtureSection("plans")[(string)testCase["plan"]] as dict;
            }
            else
            {
                plan = router.BuildExecutionPlan(RouteNamed((string)testCase["route"]), testCase["planOptions"] as dict);
            }
            var verdict = router.ReconcileExecutionStep(plan, ToInt(testCase["stepIndex"]), ToDouble(testCase["realisedOut"]));
            AssertMatches(verdict, testCase["expected"], "reconcileCase " + (string)testCase["id"]);
        }
    }

    /// <summary>
    /// The ONE number grammar. Every port hand-implements JavaScript's parseFloat
    /// prefix rather than calling its own parser, because every language's own
    /// parser disagrees with the other four somewhere. A cap read as 1234.5 in
    /// one language and 1 in another is a cap that silently disappears, and this
    /// table is what stops that shipping green.
    /// </summary>
    private static void FixtureNumberAt()
    {
        var router = NewRouter();
        var cases = FixtureCases("numberCases");
        for (var i = 0; i < cases.Count; i++)
        {
            var testCase = ToDict(cases[i]);
            var actual = router.NumberAt(testCase["container"], (string)testCase["key"], ToDouble(testCase["default"]));
            EqualNumber(actual, ToDouble(testCase["expected"]), "numberCase " + (string)testCase["id"]);
        }
    }

    private static void FixtureFormatNumber()
    {
        //  FormatNumber builds the balances query string. A balance spelled differently per
        //  language is a DIFFERENT QUESTION asked of the router, so the tie cases here are
        //  load-bearing: ToString("F12") rounds half to EVEN and answered ...312 where the
        //  TypeScript reference answers ...313.
        var router = NewRouter();
        var cases = FixtureCases("formatNumberCases");
        for (var i = 0; i < cases.Count; i++)
        {
            var testCase = ToDict(cases[i]);
            var actual = router.FormatNumber(ToDouble(testCase["value"]));
            EqualString(actual, (string)testCase["expected"], "formatNumberCase " + (string)testCase["id"]);
        }
    }

    private static async Task FixtureFeeNetting()
    {
        //  Fee netting is the one PlaceStep behaviour that CHANGES the size of the next order.
        //  The hand-written invariant below covers the single-fee case; this drives the same
        //  behaviour off the shared fixture, so the six ports are pinned to one answer — the
        //  per-trade cases included.
        var router = NewRouter();
        var cases = FixtureCases("feeNettingCases");
        for (var i = 0; i < cases.Count; i++)
        {
            var testCase = ToDict(cases[i]);
            var id = (string)testCase["id"];
            var route = OneLegRoute((string)testCase["side"], (string)testCase["base"], (string)testCase["quote"], ToDouble(testCase["amount"]), ToDouble(testCase["price"]));
            var plan = router.BuildExecutionPlan(route, ToDict(testCase["planOptions"]));
            var venue = new StubVenue("stub");
            var fee = ToDict(testCase["fee"]);
            if (fee.Count > 0)
            {
                venue.feeOverride = fee;
            }
            var tradeFees = ToList(testCase["tradeFees"]);
            if (tradeFees.Count > 0)
            {
                venue.tradeFeesOverride = tradeFees;
            }
            var report = await router.Execute(plan, Venues(venue), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } } });
            var step = ToDict(ToList(report["steps"])[0]);
            var expected = ToDict(testCase["expected"]);
            EqualNumber(step.ContainsKey("filledAmount") ? ToDouble(step["filledAmount"]) : 0, ToDouble(expected["filledAmount"]), "feeNettingCase " + id + ": filledAmount");
            EqualNumber(router.NumberAt(step, "grossOutAmount", 0), ToDouble(expected["grossOutAmount"]), "feeNettingCase " + id + ": grossOutAmount");
            EqualNumber(ToDouble(step["outAmount"]), ToDouble(expected["outAmount"]), "feeNettingCase " + id + ": outAmount");
            EqualNumber(ToDouble(step["feeCost"]), ToDouble(expected["feeCost"]), "feeNettingCase " + id + ": feeCost");
        }
    }

    private static void FixtureBuildUnwindPlan()
    {
        var router = NewRouter();
        var cases = FixtureCases("unwindCases");
        for (var i = 0; i < cases.Count; i++)
        {
            var testCase = ToDict(cases[i]);
            var report = FixtureSection("reports")[(string)testCase["report"]] as dict;
            var unwind = router.BuildUnwindPlan(report);
            AssertMatches(unwind, testCase["expected"], "unwindCase " + (string)testCase["id"]);
        }
    }

    private static list AsPlainList(List<dict> values)
    {
        var items = new list();
        for (var i = 0; i < values.Count; i++)
        {
            items.Add(values[i]);
        }
        return items;
    }

    //  -----------------------------------------------------------------------
    //  2. invariants
    //  -----------------------------------------------------------------------

    //  every route the invariant tests build gets its own requestId: Execute derives the
    //  re-execution guard key from it, and refuses a live plan that carries neither a
    //  requestId nor an idempotencyKey. A counter, not a random value — the ids stay
    //  reproducible.
    private static int testRequestIdCounter = 0;

    private static string NextTestRequestId()
    {
        testRequestIdCounter = testRequestIdCounter + 1;
        return "test-req-" + testRequestIdCounter.ToString(CultureInfo.InvariantCulture);
    }

    private static dict OneLegRoute(string side, string baseCode, string quote, double amount, double price)
    {
        return new dict()
        {
            { "requestId", NextTestRequestId() },
            { "from", (side == "buy") ? quote : baseCode },
            { "to", (side == "buy") ? baseCode : quote },
            { "strategy", "best_single" },
            { "exactSide", "in" },
            { "amountIn", (side == "buy") ? amount * price : amount },
            { "amountOut", (side == "buy") ? amount : amount * price },
            { "fullyFillable", true },
            { "fillRatio", 1.0 },
            { "unroutableReason", null },
            {
                "hops", new list()
                {
                    new dict()
                    {
                        { "pair", baseCode + "/" + quote },
                        { "side", side },
                        { "base", baseCode },
                        { "quote", quote },
                        { "amountIn", (side == "buy") ? amount * price : amount },
                        { "amountOut", (side == "buy") ? amount : amount * price },
                        { "legs", new list() { new dict() { { "exchangeId", "stub" }, { "amount", amount }, { "averagePrice", price }, { "takerFeeRate", 0.0 }, { "feeCost", 0.0 }, { "effectivePrice", price } } } },
                        { "fullyFillable", true },
                    },
                }
            },
        };
    }

    private static dict TwoHopRoute()
    {
        return new dict()
        {
            { "requestId", NextTestRequestId() },
            { "from", "USDT" },
            { "to", "SOL" },
            { "strategy", "best_single" },
            { "exactSide", "in" },
            { "amountIn", 20.0 },
            { "amountOut", 0.2 },
            { "fullyFillable", true },
            { "fillRatio", 1.0 },
            { "unroutableReason", null },
            {
                "hops", new list()
                {
                    new dict() { { "pair", "BTC/USDT" }, { "side", "buy" }, { "base", "BTC" }, { "quote", "USDT" }, { "amountIn", 20.0 }, { "amountOut", 0.2 }, { "legs", new list() { new dict() { { "exchangeId", "stub" }, { "amount", 0.2 }, { "averagePrice", 100.0 }, { "effectivePrice", 100.0 } } } } },
                    new dict() { { "pair", "BTC/USDT" }, { "side", "sell" }, { "base", "BTC" }, { "quote", "USDT" }, { "amountIn", 0.2 }, { "amountOut", 20.0 }, { "legs", new list() { new dict() { { "exchangeId", "stub" }, { "amount", 0.2 }, { "averagePrice", 100.0 }, { "effectivePrice", 100.0 } } } } },
                }
            },
        };
    }

    private static dict StubMarket()
    {
        return new dict()
        {
            {
                "BTC/USDT", new dict()
                {
                    { "symbol", "BTC/USDT" },
                    { "base", "BTC" },
                    { "quote", "USDT" },
                    { "precision", new dict() { { "amount", 0.0 }, { "price", 0.0 } } },
                    { "limits", new dict() { { "amount", new dict() { { "min", 0.0 }, { "max", 0.0 } } }, { "price", new dict() { { "min", 0.0 }, { "max", 0.0 } } }, { "cost", new dict() { { "min", 0.0 }, { "max", 0.0 } } } } },
                }
            },
        };
    }

    private static dict PermissiveStubMarkets()
    {
        return new dict() { { "stub", StubMarket() } };
    }

    //  A market that actually declares limits, unlike PermissiveStubMarkets(). A hand-built plan
    //  has to clear these the same way a routed one does.
    private static dict BoundedStubMarkets()
    {
        return new dict()
        {
            {
                "stub", new dict()
                {
                    {
                        "BTC/USDT", new dict()
                        {
                            { "symbol", "BTC/USDT" },
                            { "base", "BTC" },
                            { "quote", "USDT" },
                            { "precision", new dict() { { "amount", 0.0 }, { "price", 0.0 } } },
                            { "limits", new dict() { { "amount", new dict() { { "min", 0.0001 }, { "max", 0.0 } } }, { "price", new dict() { { "min", 1.0 }, { "max", 1000000.0 } } }, { "cost", new dict() { { "min", 10.0 }, { "max", 0.0 } } } } },
                        }
                    },
                }
            },
        };
    }

    private static void HandBuiltPlanIsExecutable()
    {
        //  The manual documents limitPrice and notionalQuote as OPTIONAL, and its own worked
        //  example omits both. Read as 0 they broke the "execute your own plans" path three ways
        //  at once: a blocking cost_below_minimum (0 < any minimum cost), a blocking
        //  price_out_of_range (0 < minPrice), and — before any strategy branch, so on every
        //  strategy — a rounded_to_zero when PlaceStep snapped a price of 0. The documented
        //  example could not place a single order.
        var router = NewRouter();
        var plan = new dict()
        {
            { "requestId", "hand-built-0001" },
            { "calculatedAt", 1700000000000.0 },
            {
                "steps", new list()
                {
                    new dict() { { "exchangeId", "stub" }, { "symbol", "BTC/USDT" }, { "side", "buy" }, { "amount", 1.0 }, { "base", "BTC" }, { "quote", "USDT" }, { "hopIndex", 0.0 }, { "expectedPrice", 100.0 } },
                }
            },
        };
        var violations = router.CheckExecutionPlanSafety(plan, BoundedStubMarkets(), new dict() { { "usdRates", new dict() { { "USDT", 1.0 } } } });
        var blocking = new List<string>();
        for (var i = 0; i < violations.Count; i++)
        {
            if ((bool)violations[i]["blocking"])
            {
                blocking.Add((string)violations[i]["code"]);
            }
        }
        Ok(blocking.Count == 0, "the manual's own minimal plan must not be refused: " + string.Join(", ", blocking));
    }

    private static void DerivedLimitPriceAndNotional()
    {
        var router = NewRouter();
        var step = new dict() { { "amount", 2.0 }, { "expectedPrice", 100.0 } };
        EqualNumber(router.StepLimitPrice(step), 100, "no limitPrice falls back to expectedPrice");
        EqualNumber(router.StepNotionalQuote(step), 200, "no notionalQuote is amount * expectedPrice");
        //  An explicit value always wins, including one tighter than the expected price.
        var explicitStep = new dict() { { "amount", 2.0 }, { "expectedPrice", 100.0 }, { "limitPrice", 99.0 }, { "notionalQuote", 1.0 } };
        EqualNumber(router.StepLimitPrice(explicitStep), 99, "an explicit limitPrice wins");
        EqualNumber(router.StepNotionalQuote(explicitStep), 1, "an explicit notionalQuote wins");
    }

    private static void ConstructorGuards()
    {
        Throws<ArgumentsRequired>(() => new OrderRouter(new dict()), "an apiKey is required");
        //  No ceiling. A caller trading thousands is using this correctly, and the
        //  class does not get to decide otherwise — the old hard 25 USD limit came
        //  from this repository's own live-test safety rule, which is not a rule
        //  about anyone's money.
        var large = new OrderRouter(new dict() { { "apiKey", "k" }, { "maxNotionalUsd", 250000.0 } });
        EqualNumber(large.maxNotionalUsd, 250000, "honoured exactly, not clamped");
        var small = new OrderRouter(new dict() { { "apiKey", "k" }, { "maxNotionalUsd", 0.05 } });
        EqualNumber(small.maxNotionalUsd, 0.05, "cents are a legitimate trade size");
        //  The default is NO cap.
        var standard = new OrderRouter(new dict() { { "apiKey", "k" } });
        EqualNumber(standard.maxNotionalUsd, OrderRouter.NoCap, "the default is no cap");
        EqualNumber(OrderRouter.NoCap, 0, "and no cap is spelled 0");
        //  0 is the explicit spelling of "no cap"; negative is a typo, and silently
        //  ignoring it would leave the caller believing a guardrail is in place.
        EqualNumber(new OrderRouter(new dict() { { "apiKey", "k" }, { "maxNotionalUsd", 0.0 } }).maxNotionalUsd, 0, "0 is no cap, not a refusal");
        Throws<BadRequest>(() => new OrderRouter(new dict() { { "apiKey", "k" }, { "maxNotionalUsd", -1.0 } }), "a negative cap is a typo, not a policy");
    }

    private static void LimitPriceSide()
    {
        var router = NewRouter();
        var buy = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 1, 100), new dict() { { "slippageBps", 100.0 } });
        EqualNumber(StepNumber(buy, 0, "limitPrice"), 101, "a buy pays up to 1% more");
        var sell = router.BuildExecutionPlan(OneLegRoute("sell", "BTC", "USDT", 1, 100), new dict() { { "slippageBps", 100.0 } });
        EqualNumber(StepNumber(sell, 0, "limitPrice"), 99, "a sell accepts down to 1% less");
        var none = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 1, 100), new dict() { { "slippageBps", 0.0 } });
        EqualNumber(StepNumber(none, 0, "limitPrice"), 100, "zero slippage means the expected price");
    }

    private static double StepNumber(dict plan, int index, string key)
    {
        var steps = ToList(plan["steps"]);
        return ToDouble(ToDict(steps[index])[key]);
    }

    private static void NotionalCap()
    {
        var router = NewRouter();
        var capped = new dict() { { "usdRates", new dict() { { "USDT", 1.0 } } }, { "maxNotionalUsd", 25.0 } };
        //  amount * limitPrice is what is measured, so a 1% slippage on a 24.90
        //  USD step is what carries it over the line
        var under = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.24, 100), new dict() { { "slippageBps", 0.0 } });
        EqualNumber(router.CheckExecutionPlanSafety(under, PermissiveStubMarkets(), capped).Count, 0, "24 USD passes a 25 USD cap");
        var at = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.25, 100), new dict() { { "slippageBps", 0.0 } });
        EqualNumber(router.CheckExecutionPlanSafety(at, PermissiveStubMarkets(), capped).Count, 0, "exactly at the cap passes");
        var over = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2501, 100), new dict() { { "slippageBps", 0.0 } });
        var overViolations = router.CheckExecutionPlanSafety(over, PermissiveStubMarkets(), capped);
        EqualNumber(overViolations.Count, 1, "25.01 USD is one violation");
        EqualString((string)overViolations[0]["code"], "notional_exceeds_cap", "the code");
        EqualBool((bool)overViolations[0]["blocking"], true, "the cap blocks");
        //  and the slippage is inside the measurement, not outside it
        var slipped = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.249, 100), new dict() { { "slippageBps", 100.0 } });
        var slippedViolations = router.CheckExecutionPlanSafety(slipped, PermissiveStubMarkets(), capped);
        EqualNumber(slippedViolations.Count, 1, "24.90 USD at 1% slippage is 25.15 USD of risk");
        EqualString((string)slippedViolations[0]["code"], "notional_exceeds_cap", "the code");
        //  A LARGE cap is honoured just as exactly. This is the case the old hard
        //  ceiling made unreachable: 2,000 USD of BTC under a 5,000 USD guardrail
        //  is a normal trade.
        var large = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 20, 100), new dict() { { "slippageBps", 0.0 } });
        EqualNumber(router.CheckExecutionPlanSafety(large, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "USDT", 1.0 } } }, { "maxNotionalUsd", 5000.0 } }).Count, 0, "2,000 USD under a 5,000 USD cap");
        var overLarge = router.CheckExecutionPlanSafety(large, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "USDT", 1.0 } } }, { "maxNotionalUsd", 1000.0 } });
        EqualString((string)overLarge[0]["code"], "notional_exceeds_cap", "and the same 2,000 USD trips a 1,000 USD cap");
    }

    /// <summary>
    /// The default. This class does not decide how much of your money you may
    /// trade — the guardrail is opt-in, so a plan of any size passes untouched,
    /// and a caller who never asked for a cap is not made to supply usdRates
    /// for it.
    /// </summary>
    private static void NoCapMeansNoNotionalCheck()
    {
        var router = NewRouter();
        var large = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 1000, 100), new dict() { { "slippageBps", 0.0 } });
        EqualNumber(router.CheckExecutionPlanSafety(large, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "USDT", 1.0 } } } }).Count, 0, "100,000 USD passes when no cap is set");
        EqualNumber(router.CheckExecutionPlanSafety(large, PermissiveStubMarkets(), new dict()).Count, 0, "and needs no usdRates at all");
    }

    private static void UnvaluableBlocks()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.0001, 100), new dict() { { "slippageBps", 0.0 } });
        //  0.01 USDT of notional: trivially under the cap, and still refused,
        //  because the point is that the cap the caller ASKED FOR could not be
        //  evaluated. With no cap set there is nothing to enforce and this same
        //  plan passes — see the test above.
        var violations = router.CheckExecutionPlanSafety(plan, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() }, { "maxNotionalUsd", 25.0 } });
        EqualNumber(violations.Count, 1, "one violation");
        EqualString((string)violations[0]["code"], "notional_unvaluable", "the code");
        EqualBool((bool)violations[0]["blocking"], true, "an unvaluable step must block, or the cap is decorative");
        //  unrelated rates do not help
        var stillBlocked = router.CheckExecutionPlanSafety(plan, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "ETH", 3000.0 }, { "DOGE", 0.09 } } }, { "maxNotionalUsd", 25.0 } });
        EqualString((string)stillBlocked[0]["code"], "notional_unvaluable", "unrelated rates do not rescue it");
        //  either side of the market resolves it
        EqualNumber(router.CheckExecutionPlanSafety(plan, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "USDT", 1.0 } } }, { "maxNotionalUsd", 25.0 } }).Count, 0, "the quote rate resolves it");
        EqualNumber(router.CheckExecutionPlanSafety(plan, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "BTC", 100.0 } } }, { "maxNotionalUsd", 25.0 } }).Count, 0, "the base rate resolves it");
    }

    private static void UsdtIsNotADollar()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.1, 100), new dict() { { "slippageBps", 0.0 } });
        var violations = router.CheckExecutionPlanSafety(plan, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "USD", 1.0 } } }, { "maxNotionalUsd", 25.0 } });
        EqualNumber(violations.Count, 1, "one violation");
        EqualString((string)violations[0]["code"], "notional_unvaluable", "a stablecoin peg is an observation, not a definition");
        //  a depegged rate is respected: 10 USDT at 0.40 is 4 USD
        var depegged = router.CheckExecutionPlanSafety(plan, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "USDT", 0.4 } } }, { "maxNotionalUsd", 25.0 } });
        EqualNumber(depegged.Count, 0, "a depegged rate is respected");
    }

    private static void EmptyPlanIsNotSafe()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(RouteNamed("unroutable"), new dict());
        EqualNumber(ToList(plan["steps"]).Count, 0, "an unroutable route has no steps");
        var violations = router.CheckExecutionPlanSafety(plan, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "USDT", 1.0 } } } });
        EqualNumber(violations.Count, 1, "one violation");
        EqualString((string)violations[0]["code"], "empty_plan", "the code");
        EqualBool((bool)violations[0]["blocking"], true, "zero violations on zero steps would read as approval");
    }

    private static void ReconcileNeverScalesUp()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(RouteNamed("multiHop"), new dict());
        var overfilled = router.ReconcileExecutionStep(plan, 0, 1000000);
        EqualNumber(ToDouble(overfilled["scale"]), 1, "an overfill must not grow an order the safety check never saw");
        EqualString((string)overfilled["verdict"], "proceed", "an overfill still proceeds");
        var downstream = ToDict(ToList(overfilled["resizedSteps"])[0]);
        EqualNumber(ToDouble(downstream["amount"]), ToDouble(downstream["previousAmount"]), "the downstream order is untouched");
    }

    private static void ReconcileHalts()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(RouteNamed("multiHop"), new dict());
        EqualString((string)router.ReconcileExecutionStep(plan, 0, 0)["verdict"], "halt", "a total miss halts");
        EqualString((string)router.ReconcileExecutionStep(plan, 0, 0)["reason"], "nothing_filled", "and says why");
        //  expectedOut of step 0 is 500 * 0.089 = 44.5 GROSS, less the 0.025176757619121304
        //  USDT fee the router itself predicted = 44.47482324238088. 2% of that is
        //  0.8894964648476176.
        var expectedOut = 44.47482324238088;
        EqualString((string)router.ReconcileExecutionStep(plan, 0, expectedOut - 0.88)["verdict"], "proceed", "inside the tolerance");
        EqualString((string)router.ReconcileExecutionStep(plan, 0, expectedOut - 0.9)["verdict"], "halt", "outside the tolerance");
        EqualString((string)router.ReconcileExecutionStep(plan, 0, expectedOut - 0.9)["reason"], "shortfall_exceeds_tolerance", "and says why");
        Throws<BadRequest>(() => router.ReconcileExecutionStep(plan, 7, 1), "an out-of-range step index is refused");
    }

    private static async Task BalancesEchoIsVerified()
    {
        //  /route declares its query without a JSON schema, so a server that predates the
        //  balances feature answers byte-identically to one that never received any. It is the
        //  EMPTY wallet that used to slip through, because the old check skipped itself
        //  whenever the balances string was "".
        var legacy = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict() { { "hops", new list() } });
        await Rejects<ExchangeError>(async () => await legacy.FetchRoute("USDT", "BTC", new dict() { { "amountIn", 10.0 }, { "balances", "binance.USDT:1000" } }), "a non-empty wallet the server ignored");
        var legacyEmpty = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict() { { "hops", new list() } });
        await Rejects<ExchangeError>(async () => await legacyEmpty.FetchRoute("USDT", "BTC", new dict() { { "amountIn", 10.0 }, { "balances", "" } }), "an EMPTY wallet the server ignored");
        //  a current server answering the empty wallet honestly is NOT an error
        var current = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict() { { "hops", new list() }, { "balanceEntryCount", 0 } });
        var route = await current.FetchRoute("USDT", "BTC", new dict() { { "amountIn", 10.0 }, { "balances", "" } });
        EqualString((string)route["clientRequestedTo"], "BTC", "the empty wallet routes");
        //  and a caller can still opt out with their eyes open
        var opted = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict() { { "hops", new list() } });
        await opted.FetchRoute("USDT", "BTC", new dict() { { "amountIn", 10.0 }, { "balances", "" }, { "requireBalancesApplied", false } });
        //  a route with NO balances is never subject to the check
        var noBalances = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict() { { "hops", new list() } });
        await noBalances.FetchRoute("USDT", "BTC", new dict() { { "amountIn", 10.0 } });
        EqualString(noBalances.lastMethod, "GET", "a route with no holdings stays a GET");
    }

    private static async Task RequestIdHeader()
    {
        //  the service mints one when absent; supplying one is what lets a caller join their
        //  own log to the router's decision log for a request that never returned a body
        var recorder = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict() { { "hops", new list() } });
        await recorder.FetchRoute("USDT", "BTC", new dict() { { "amountIn", 10.0 }, { "requestId", "caller-chosen-id" } });
        EqualString(recorder.lastRequestId, "caller-chosen-id", "the audit id reaches Request");
        Ok(recorder.lastUrl.IndexOf("requestId", StringComparison.Ordinal) < 0, "and is not a query parameter");
    }

    private static void FeeIsNotDoubleSubtracted()
    {
        //  THE REGRESSION THIS EXISTS FOR. Execute reports realisedOut NET of a fee charged in
        //  the asset the step produced, because that is what the wallet receives. The router
        //  had already done the same: hop 0 sells 500 DOGE at 0.089 for 44.5 gross, reports
        //  amountOut 44.47482324238088 after a 0.025176757619121304 USDT fee, and hop 1's
        //  amountIn is that net figure to the last digit. Measuring the expectation GROSS
        //  against a NET realised amount reported a shortfall on a perfect fill and shrank
        //  hop 1 by the fee all over again, stranding it in the bridge asset.
        var router = NewRouter();
        var route = RouteNamed("multiHop");
        var hops = router.ListAt(route, "hops");
        var hopZero = router.AsDict(hops[0]);
        var hopOne = router.AsDict(hops[1]);
        var plan = router.BuildExecutionPlan(route, new dict());
        var steps = router.ListAt(plan, "steps");
        var stepZero = router.AsDict(steps[0]);
        var stepOne = router.AsDict(steps[1]);
        var hopZeroFee = router.NumberAt(hopZero, "feeCost", 0);
        var hopZeroOut = router.NumberAt(hopZero, "amountOut", 0);
        //  the premise, asserted rather than assumed: the router's own numbers really are net
        EqualNumber(hopZeroOut, 500 * 0.089 - hopZeroFee, "the hop amountOut is net of its fee");
        EqualNumber(router.NumberAt(hopOne, "amountIn", 0), hopZeroOut, "hop 1 was sized from the NET proceeds of hop 0");
        EqualNumber(router.NumberAt(stepZero, "expectedFeeCost", 0), router.NumberAt(router.AsDict(router.ListAt(hopZero, "legs")[0]), "feeCost", 0), "the step carries the predicted fee");
        var verdict = router.ReconcileExecutionStep(plan, 0, hopZeroOut);
        EqualNumber(router.NumberAt(verdict, "expectedOut", 0), hopZeroOut, "expected equals what the router said the hop produces");
        EqualNumber(router.NumberAt(verdict, "shortfall", -1), 0, "a perfect fill is not a shortfall");
        EqualNumber(router.NumberAt(verdict, "scale", 0), 1, "and does not resize anything");
        EqualString((string)verdict["verdict"], "proceed", "and proceeds");
        var resized = router.ListAt(verdict, "resizedSteps");
        for (var i = 0; i < resized.Count; i++)
        {
            var entry = router.AsDict(resized[i]);
            EqualNumber(router.NumberAt(entry, "amount", 0), router.NumberAt(entry, "previousAmount", 0), "hop 1 keeps the size the router gave it");
        }
        //  notionalQuote is what the order is worth to the VENUE and stays gross
        EqualNumber(router.NumberAt(stepZero, "notionalQuote", 0), 44.5, "the order notional stays gross");
        //  a BUY produces base, and the predicted fee is quote-denominated
        EqualNumber(router.StepExpectedOut(stepOne), router.NumberAt(hopOne, "amountOut", 0), "a buy is unaffected");
        //  a hand-built plan carries no expectedFeeCost, and behaves exactly as before
        var handBuilt = new dict() { { "side", "sell" }, { "amount", 10.0 }, { "expectedPrice", 2.0 } };
        EqualNumber(router.StepExpectedOut(handBuilt), 20, "a hand-built plan is unchanged");
    }

    private static void UnwindNeverNetsAcrossVenues()
    {
        var router = NewRouter();
        var unwind = router.BuildUnwindPlan(FixtureSection("reports")["haltedCrossVenue"] as dict);
        EqualBool((bool)unwind["requiresConfirmation"], true, "an unwind is never automatic");
        EqualBool((bool)unwind["automatic"], false, "an unwind is never automatic");
        EqualNumber(ToDouble(unwind["residualCount"]), 2, "the mexc USDT and the binance SOL are separate positions");
        //  the USDT sold on mexc and the USDT spent on binance are NOT the same
        //  money, because this class never moves funds between venues
        var steps = ToList(unwind["steps"]);
        EqualString((string)ToDict(steps[0])["exchangeId"], "binance", "unwound in reverse execution order");
        EqualString((string)ToDict(steps[1])["exchangeId"], "mexc", "unwound in reverse execution order");
        EqualString((string)ToDict(steps[1])["side"], "buy", "leftover quote is spent buying the asset back");
        EqualBool((bool)ToDict(steps[1])["reachesFrom"], true, "that hop gets you home");
        EqualString((string)ToDict(steps[0])["side"], "sell", "leftover base is sold back");
        EqualBool((bool)ToDict(steps[0])["reachesFrom"], false, "selling SOL for USDT is not yet DOGE");
    }

    private static void UnwindBuyIsFundable()
    {
        //  The residual IS the budget. Sizing the buy at the expected price and
        //  then pricing it slippage above that orders more quote than the venue
        //  is holding: 44.5 USDT at 0.089 is 500 DOGE, but 500 DOGE at the
        //  0.0892225 limit costs 44.61125 — the venue rejects it for insufficient
        //  funds, or partially fills and leaves the rest of the stranded money
        //  stranded on a halted route.
        var router = NewRouter();
        var unwind = router.BuildUnwindPlan(FixtureSection("reports")["haltedCrossVenue"] as dict);
        var steps = ToList(unwind["steps"]);
        var buy = ToDict(steps[1]);
        EqualString((string)buy["side"], "buy", "the mexc leg is the buy");
        var residual = 44.5;
        var spend = ToDouble(buy["amount"]) * ToDouble(buy["limitPrice"]);
        Ok(spend <= residual + 1e-9, "the buy spends no more than the residual holds");
        //  and it does not leave the residual pointlessly unspent either
        Ok(spend >= residual - 1e-9, "the buy spends the whole residual");
        //  the notional the safety cap sees must be that same real spend
        Ok(NumbersMatch(ToDouble(buy["notionalQuote"]), spend), "notionalQuote is priced at the limit the order is placed at");
        //  the sell side is sized on the residual itself — there is no budget to run out of
        var sell = ToDict(steps[0]);
        EqualString((string)sell["side"], "sell", "the binance leg is the sell");
        EqualNumber(ToDouble(sell["amount"]), 0.2, "the whole 0.2 SOL residual is sold");
        Ok(NumbersMatch(ToDouble(sell["notionalQuote"]), 0.2 * ToDouble(sell["limitPrice"])), "the sell notional is priced at its limit too");
    }

    //  -----------------------------------------------------------------------
    //  3. execute — stub venues only
    //  -----------------------------------------------------------------------

    /// <summary>
    /// A venue that records every call it receives, so "the dry run reached the
    /// venue zero times" can be asserted rather than assumed. It places nothing
    /// anywhere: createOrder returns a fabricated order and never leaves the
    /// process.
    /// </summary>

    //  -----------------------------------------------------------------------
    //  onStep and the retry policy
    //  -----------------------------------------------------------------------

    private static async Task OnStepSeesEveryStepAndCanStop()
    {
        //  The one thing a caller cannot do from outside Execute(): look at what just happened
        //  and decide not to continue. Before this hook the method was opaque from call to
        //  return.
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(TwoHopRoute(), new dict());
        var stepsTotal = ToList(plan["steps"]).Count;
        var venue = new StubVenue("stub");
        var seen = new List<dict>();
        Func<dict, string> hook = (dict evt) =>
        {
            seen.Add(evt);
            return (ToDouble(evt["stepIndex"]) == 0) ? "halt" : "";
        };
        var report = await router.Execute(plan, Venues(venue), new dict()
        {
            { "strategy", "sequential" },
            { "live", true },
            { "usdRates", new dict() { { "USDT", 1.0 } } },
            { "onStep", hook },
        });
        EqualNumber(seen.Count, 1, "the hook is not called for steps that never ran");
        EqualNumber(ToDouble(seen[0]["stepIndex"]), 0, "the event names the step");
        EqualString((string)seen[0]["status"], "filled", "the event carries the outcome");
        EqualNumber(ToDouble(seen[0]["stepsRemaining"]), stepsTotal - 1, "and how much of the route is left");
        Ok(seen[0].ContainsKey("reconciliation"), "the verdict it is judging is in the event");
        EqualBool((bool)report["halted"], true, "the hook stopped the route");
        EqualString((string)report["haltReason"], "halted_by_on_step", "the halt names the hook");
        EqualNumber(ToDouble(report["haltStepIndex"]), 0, "and the step it halted at");
        EqualString((string)ToDict(ToList(report["steps"])[1])["status"], "skipped", "the rest is skipped");
        EqualNumber(ToDouble(report["ordersPlaced"]), 1, "the step after the halt was never placed");
        EqualNumber(venue.paramsSeen.Count, 1, "and the venue saw exactly one order");
    }

    private static async Task OnStepThatThrowsIsRecorded()
    {
        //  The report is the ONLY account of orders that are already live. An exception raised
        //  by observability code must never destroy it — trigger.dev logs and ignores hook
        //  errors for the same reason.
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100.0), new dict());
        var venue = new StubVenue("stub");
        Func<dict, string> hook = (dict evt) => throw new ExchangeError("hook is broken");
        var report = await router.Execute(plan, Venues(venue), new dict()
        {
            { "strategy", "sequential" },
            { "live", true },
            { "usdRates", new dict() { { "USDT", 1.0 } } },
            { "onStep", hook },
        });
        EqualBool((bool)report["halted"], false, "the route finished");
        EqualString((string)ToDict(ToList(report["steps"])[0])["status"], "filled", "and the order it placed is still reported");
        var errors = ToList(report["errors"]);
        var found = false;
        for (var i = 0; i < errors.Count; i++)
        {
            if (((string)ToDict(errors[i])["code"]).IndexOf("on_step_hook_failed", StringComparison.Ordinal) == 0)
            {
                found = true;
            }
        }
        Ok(found, "the broken hook is reported rather than swallowed");
    }

    private static async Task OnStepCanOnlyNarrow()
    {
        //  The halt is a money decision made in one pure place precisely so it cannot be
        //  omitted. A hook that could wave it through would be a way to omit it.
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(TwoHopRoute(), new dict());
        //  hop 0 fills a tenth: a shortfall far past the 2% tolerance
        var starved = new StubVenue("stub", 0.1);
        Func<dict, string> hook = (dict evt) => "continue";
        var report = await router.Execute(plan, Venues(starved), new dict()
        {
            { "strategy", "sequential" },
            { "live", true },
            { "usdRates", new dict() { { "USDT", 1.0 } } },
            { "onStep", hook },
        });
        EqualBool((bool)report["halted"], true, "the reconciliation halt stands");
        EqualString((string)report["haltReason"], "shortfall_exceeds_tolerance", "the reconciliation reason survives, it is not replaced by the hook");
        EqualNumber(ToDouble(report["ordersPlaced"]), 1, "the hook did not wave the route onward");
        EqualString((string)ToDict(ToList(report["steps"])[1])["status"], "skipped", "the second hop never ran");
    }

    private static async Task RetryPlacesAFreshOrder()
    {
        //  A rejected order was not placed, so re-placing it cannot double-fill. Re-sending the
        //  original client order id would have the venue reject the retry as a duplicate of the
        //  very order it just refused, so each attempt carries its own.
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100.0), new dict());
        var relents = new StubVenue("stub");
        relents.failCreateTimes = 1;
        var report = await router.Execute(plan, Venues(relents), new dict()
        {
            { "strategy", "sequential" },
            { "live", true },
            { "usdRates", new dict() { { "USDT", 1.0 } } },
            { "retryFailedSteps", 2.0 },
            { "retryDelayMs", 0.0 },
        });
        var first = ToDict(ToList(report["steps"])[0]);
        EqualString((string)first["status"], "filled", "the retry succeeded");
        EqualNumber(ToDouble(first["attempt"]), 1, "the report says which attempt won");
        EqualNumber(relents.paramsSeen.Count, 2, "two placements went out");
        //  The router injects NO client order id, on the first try or the retry: venues disagree
        //  on length and charset, and the derived <planId>-<stepIndex> scheme was rejected by the
        //  ones where idempotency mattered most. This assertion is the inverse of what it used to
        //  be; the C# suite kept the old one only because it never compiled to run.
        Ok(!relents.paramsSeen[0].ContainsKey("clientOrderId"), "no client order id is injected on the first try");
        Ok(!relents.paramsSeen[1].ContainsKey("clientOrderId"), "nor on the retry");

        //  the outcome the policy must NEVER touch
        var unknown = new StubVenue("stub");
        unknown.timeoutCreate = true;
        var second = await router.Execute(
            router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100.0), new dict()),
            Venues(unknown),
            new dict()
            {
                { "strategy", "sequential" },
                { "live", true },
                { "usdRates", new dict() { { "USDT", 1.0 } } },
                { "retryFailedSteps", 5.0 },
                { "retryDelayMs", 0.0 },
            });
        EqualString((string)ToDict(ToList(second["steps"])[0])["status"], "outcome_unknown", "a timed-out placement stays outcome_unknown");
        EqualNumber(unknown.paramsSeen.Count, 1, "an order whose outcome is unknown may already be live; it is never re-placed");
    }

    public class StubVenue : Exchange
    {
        public List<string> calls = new List<string>();

        //  every params dictionary CreateOrder was called with, in call order
        public List<dict> paramsSeen = new List<dict>();

        public double fillRatio = 1;

        public bool failCreate = false;

        //  refuse this many CreateOrder calls, then behave: a venue that rejects and then
        //  relents, which is the only shape a retry can be tested against
        public int failCreateTimes = 0;

        //  CreateOrder times out instead of answering — the outcome the retry policy must
        //  never touch, because the order may already be live
        public bool timeoutCreate = false;

        public dict balanceOverride = null;

        //  a queue of orders fetchOrder hands back, one per poll; empty means the
        //  created order comes back closed on the first read
        public List<dict> fetchOrderResults = new List<dict>();

        public bool fetchOrderThrows = false;

        public bool cancelThrows = false;

        public string createdStatus = "";

        //  When set, the created order carries this fee — currency, cost — in both the single
        //  `fee` and the `fees` list, exactly as safeOrder fills them in.
        public dict feeOverride = null;

        //  When set, the created order carries these as per-trade fees under `trades`, and no
        //  top-level fee at all — the shape a venue that reports a fill as a list of trades sends.
        public list tradeFeesOverride = null;

        public StubVenue(string id, double fillRatio = 1, bool failCreate = false) : base(null)
        {
            this.id = id;
            this.fillRatio = fillRatio;
            this.failCreate = failCreate;
            this.markets = StubMarket();
            this.features = new dict() { { "spot", new dict() { { "createOrder", new dict() { { "timeInForce", new list() { "GTC", "IOC" } } } } } } };
        }

        public override async Task<ccxt.Order> FetchOrder(string id, string symbol = null, object parameters = null)
        {
            this.calls.Add("fetchOrder:" + id);
            await Task.CompletedTask;
            if (this.fetchOrderThrows)
            {
                throw new ExchangeError("stub cannot read the order back");
            }
            if (this.fetchOrderResults.Count > 0)
            {
                var next = this.fetchOrderResults[0];
                this.fetchOrderResults.RemoveAt(0);
                return new ccxt.Order(next);
            }
            return new ccxt.Order(new dict() { { "id", id }, { "status", "closed" }, { "filled", 0.0 }, { "average", 0.0 }, { "cost", 0.0 } });
        }

        public override async Task<ccxt.Order> CancelOrder(string id, string symbol = null, object parameters = null)
        {
            this.calls.Add("cancelOrder:" + id);
            await Task.CompletedTask;
            if (this.cancelThrows)
            {
                throw new ExchangeError("stub refuses to cancel");
            }
            return new ccxt.Order(new dict() { { "id", id }, { "status", "canceled" } });
        }

        public override Task<object> loadMarkets(object reload2 = null, object parameters2 = null)
        {
            this.calls.Add("loadMarkets");
            return Task.FromResult((object)this.markets);
        }

        public override object amountToPrecision(object symbol, object amount)
        {
            return Convert.ToString(amount, CultureInfo.InvariantCulture);
        }

        public override object priceToPrecision(object symbol, object price)
        {
            return Convert.ToString(price, CultureInfo.InvariantCulture);
        }

        // Overrides the REAL signature: Exchange exposes FetchBalance returning the typed
        // Balances, not a camelCase method returning object. The stub used to declare the latter,
        // so it overrode nothing that exists and the library did not compile at all.
        public override async Task<ccxt.Balances> FetchBalance(object parameters = null)
        {
            this.calls.Add("fetchBalance");
            await Task.CompletedTask;
            if (this.balanceOverride != null)
            {
                return new ccxt.Balances(this.balanceOverride);
            }
            return new ccxt.Balances(new dict()
            {
                { "free", new dict() { { "USDT", 1000.0 }, { "BTC", 1.0 }, { "ZERO", 0.0 } } },
                { "total", new dict() { { "USDT", 1000.0 }, { "BTC", 1.0 } } },
            });
        }

        public override async Task<ccxt.Order> CreateOrder(string symbol, string type, string side, double amount, double? price = null, object parameters = null)
        {
            var size = amount;
            this.calls.Add("createOrder:" + type + ":" + side + ":" + size.ToString(CultureInfo.InvariantCulture));
            var seen = (parameters as dict) ?? new dict();
            this.paramsSeen.Add(seen);
            await Task.CompletedTask;
            if (this.timeoutCreate)
            {
                throw new RequestTimeout("stub timed out");
            }
            if (this.failCreateTimes > 0)
            {
                this.failCreateTimes = this.failCreateTimes - 1;
                throw new ExchangeError("stub refuses, for now");
            }
            if (this.failCreate)
            {
                throw new ExchangeError("stub refuses");
            }
            var filled = size * this.fillRatio;
            var average = (price == null) ? 100.0 : (double)price;
            var status = (this.createdStatus == "") ? "closed" : this.createdStatus;
            var payload = new dict() { { "id", "stub-order" }, { "status", status }, { "filled", filled }, { "average", average }, { "cost", filled * average } };
            if (seen.ContainsKey("clientOrderId"))
            {
                //  a real venue echoes the client order id it was given
                payload["clientOrderId"] = seen["clientOrderId"];
            }
            if (this.feeOverride != null)
            {
                payload["fee"] = this.feeOverride;
                payload["fees"] = new list() { this.feeOverride };
            }
            if (this.tradeFeesOverride != null)
            {
                var trades = new list();
                for (var i = 0; i < this.tradeFeesOverride.Count; i++)
                {
                    trades.Add(new dict() { { "fee", this.tradeFeesOverride[i] } });
                }
                payload["trades"] = trades;
            }
            return new ccxt.Order(payload);
        }
    }

    private static Dictionary<string, Exchange> Venues(params Exchange[] instances)
    {
        var venues = new Dictionary<string, Exchange>();
        for (var i = 0; i < instances.Length; i++)
        {
            venues[(string)instances[i].id] = instances[i];
        }
        return venues;
    }

    private static void EqualCalls(List<string> actual, List<string> expected, string message)
    {
        EqualNumber(actual.Count, expected.Count, message + ": call count (" + string.Join(", ", actual) + ")");
        for (var i = 0; i < expected.Count; i++)
        {
            EqualString(actual[i], expected[i], message + ": call " + i.ToString(CultureInfo.InvariantCulture));
        }
    }

    private static async Task DryRunIsTheDefault()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        var venue = new StubVenue("stub");
        //  everything a real call would carry, EXCEPT live
        var report = await router.Execute(plan, Venues(venue), new dict()
        {
            { "strategy", "sequential" },
            { "usdRates", new dict() { { "USDT", 1.0 } } },
            { "allowMarketOrders", true },
        });
        EqualBool((bool)report["dryRun"], true, "dry run");
        EqualString((string)report["strategy"], "dry_run", "the strategy in force");
        EqualString((string)report["requestedStrategy"], "sequential", "the report says what was asked for as well as what happened");
        EqualNumber(ToDouble(report["ordersPlaced"]), 0, "nothing was placed");
        EqualNumber(ToDouble(report["wouldPlaceOrders"]), 1, "one order would have been placed");
        EqualString((string)ToDict(ToList(report["steps"])[0])["status"], "planned", "the step stayed planned");
        EqualCalls(venue.calls, new List<string>(), "not one call reached the venue — not even a read");
        //  live: false, absent, "true" and 1 are all not-true
        var notLive = new list() { false, null, "true", 1 };
        for (var i = 0; i < notLive.Count; i++)
        {
            var other = new StubVenue("stub");
            var again = await router.Execute(plan, Venues(other), new dict() { { "strategy", "sequential" }, { "live", notLive[i] }, { "usdRates", new dict() { { "USDT", 1.0 } } } });
            EqualBool((bool)again["dryRun"], true, "live must be exactly true");
            EqualCalls(other.calls, new List<string>(), "not one call reached the venue");
        }
    }

    private static async Task RefusesLiveWithoutRates()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        var venue = new StubVenue("stub");
        await Rejects<ExchangeError>(async () => await router.Execute(plan, Venues(venue), new dict() { { "strategy", "sequential" }, { "live", true }, { "maxNotionalUsd", 25.0 } }), "an unvaluable plan is refused");
        for (var i = 0; i < venue.calls.Count; i++)
        {
            Ok(venue.calls[i].IndexOf("createOrder", StringComparison.Ordinal) < 0, "no order was placed");
        }
        //  and with NO cap asked for, usdRates is not required: there is no cap to
        //  evaluate, so demanding the inputs for one would be asking for something
        //  nobody wanted.
        var uncapped = new StubVenue("stub");
        var report = await router.Execute(plan, Venues(uncapped), new dict() { { "strategy", "sequential" }, { "live", true } });
        EqualString((string)ToDict(ToList(report["steps"])[0])["status"], "filled", "no cap, no valuation demanded");
    }

    private static async Task RefusesLiveAboveTheCap()
    {
        //  500 USD against a 25 USD guardrail. The refusal happens BEFORE any order
        //  goes out, which is the property worth asserting — a cap checked after the
        //  fact is an incident report, not a guardrail.
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 5, 100), new dict());
        var venue = new StubVenue("stub");
        await Rejects<ExchangeError>(async () => await router.Execute(plan, Venues(venue), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } }, { "maxNotionalUsd", 25.0 } }), "500 USD is refused");
        for (var i = 0; i < venue.calls.Count; i++)
        {
            Ok(venue.calls[i].IndexOf("createOrder", StringComparison.Ordinal) < 0, "no order was placed");
        }
        //  the same 500 USD trade with no cap set goes through: that is the point of
        //  the guardrail being opt-in
        var uncapped = new StubVenue("stub");
        var report = await router.Execute(plan, Venues(uncapped), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } } });
        EqualString((string)ToDict(ToList(report["steps"])[0])["status"], "filled", "500 USD is a normal trade when nobody asked for a cap");
    }

    private static async Task SequentialPlacesIoc()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict() { { "slippageBps", 100.0 } });
        var venue = new StubVenue("stub");
        var report = await router.Execute(plan, Venues(venue), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } } });
        EqualBool((bool)report["dryRun"], false, "this one is live");
        EqualNumber(ToDouble(report["ordersPlaced"]), 1, "one order");
        var first = ToDict(ToList(report["steps"])[0]);
        EqualString((string)first["status"], "filled", "it filled");
        EqualString((string)first["outAsset"], "BTC", "a buy produces base");
        EqualNumber(ToDouble(first["outAmount"]), 0.2, "0.2 BTC");
        EqualString((string)first["inAsset"], "USDT", "a buy spends quote");
        EqualCalls(venue.calls, new List<string>() { "createOrder:limit:buy:0.2" }, "one IOC limit order");
        EqualBool((bool)report["halted"], false, "nothing halted");
    }

    private static async Task SequentialObeysHalt()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(TwoHopRoute(), new dict());
        //  hop 0 fills half: a 50% shortfall against a 2% tolerance
        var venue = new StubVenue("stub", 0.5);
        var report = await router.Execute(plan, Venues(venue), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } } });
        EqualBool((bool)report["halted"], true, "it halted");
        EqualString((string)report["haltReason"], "shortfall_exceeds_tolerance", "and said why");
        EqualNumber(ToDouble(report["haltStepIndex"]), 0, "at step 0");
        EqualNumber(ToDouble(report["ordersPlaced"]), 1, "the second hop was never attempted");
        EqualString((string)ToDict(ToList(report["steps"])[1])["status"], "skipped", "the second step is skipped");
        EqualNumber(venue.calls.Count, 1, "one venue call");
        //  and the halted report is exactly what BuildUnwindPlan is for
        var unwind = router.BuildUnwindPlan(report);
        EqualNumber(ToDouble(unwind["residualCount"]), 1, "one residual");
        var step = ToDict(ToList(unwind["steps"])[0]);
        EqualString((string)step["side"], "sell", "the BTC bought on hop 0 goes back to USDT");
        EqualBool((bool)step["reachesFrom"], true, "and that gets you home");
    }

    /// <summary>
    /// The cap is a guardrail the CALLER sets, so the per-call value wins — there
    /// is no ceiling re-imposed behind their back. Both directions are asserted
    /// because the old implementation clamped one way only, and a guardrail that
    /// silently refuses to loosen is as surprising as one that silently refuses
    /// to tighten.
    /// </summary>
    private static void PerCallCapOverrides()
    {
        var client = new OrderRouter(new dict() { { "apiKey", "k" }, { "maxNotionalUsd", 100.0 } });
        //  0.005 BTC at 100000 USDT is 500 USD
        var plan = client.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.005, 100000), new dict() { { "slippageBps", 0.0 } });
        var underClientCap = client.CheckExecutionPlanSafety(plan, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "USDT", 1.0 } } } });
        EqualString((string)underClientCap[0]["code"], "notional_exceeds_cap", "500 USD trips the client cap of 100");
        EqualNumber(ToDouble(underClientCap[0]["limit"]), 100, "and the limit reported is the client's own");
        //  raised for this call
        EqualNumber(client.CheckExecutionPlanSafety(plan, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "USDT", 1.0 } } }, { "maxNotionalUsd", 1000.0 } }).Count, 0, "a per-call cap of 1000 lets it through");
        //  lowered for this call
        var tightened = client.CheckExecutionPlanSafety(plan, PermissiveStubMarkets(), new dict() { { "usdRates", new dict() { { "USDT", 1.0 } } }, { "maxNotionalUsd", 10.0 } });
        EqualNumber(ToDouble(tightened[0]["limit"]), 10, "and a per-call cap of 10 tightens it");
        //  and the last check before an order goes out honours the same value
        var step = ToDict(ToList(plan["steps"])[0]);
        Throws<ExchangeError>(() => client.AssertUnderCap(step, 0.005, 100000, new dict() { { "USDT", 1.0 } }, new dict() { { "maxNotionalUsd", 100.0 } }), "the last check before an order goes out refuses too");
        client.AssertUnderCap(step, 0.005, 100000, new dict() { { "USDT", 1.0 } }, new dict() { { "maxNotionalUsd", 1000.0 } });
    }

    /// <summary>
    /// best_effort must derive the hop count from the steps it is about to
    /// execute: a plan that travelled through JSON, was rebuilt from persisted
    /// steps, or is the tail of a halted route can be missing hopCount entirely.
    /// </summary>
    private static async Task BestEffortDerivesHopCount()
    {
        var router = NewRouter();
        var complete = router.BuildExecutionPlan(TwoHopRoute(), new dict());
        var withoutHopCount = new dict();
        foreach (var entry in complete)
        {
            if (entry.Key != "hopCount")
            {
                withoutHopCount[entry.Key] = entry.Value;
            }
        }
        Ok(!withoutHopCount.ContainsKey("hopCount"), "the plan really has no hopCount");
        EqualNumber(ToList(withoutHopCount["steps"]).Count, 2, "and it really has two hops worth of steps");
        var venue = new StubVenue("stub", 0.1);
        await Rejects<NotSupported>(async () => await router.Execute(withoutHopCount, Venues(venue), new dict() { { "strategy", "best_effort" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } }, { "acknowledgeDispersion", true }, { "maxOrders", 5.0 } }), "best_effort across a bridge is refused however the plan reached us");
        EqualCalls(venue.calls, new List<string>(), "not one order was placed");
    }

    /// <summary>
    /// features.spot.createOrder.timeInForce is a dictionary of booleans on every
    /// real ccxt exchange and a list on none of them. bit2c, bitbank, bithumb and
    /// coinone all say IOC: false, and reading it as a list answered "yes" for
    /// every one of them.
    /// </summary>
    private static async Task VenueSupportsIocReadsADictionary()
    {
        var router = NewRouter();
        var noIocFeatures = new dict() { { "spot", new dict() { { "createOrder", new dict() { { "timeInForce", new dict() { { "IOC", false }, { "FOK", false }, { "PO", false }, { "GTD", false }, { "GTC", true } } } } } } } };
        var noIoc = new StubVenue("stub");
        noIoc.features = noIocFeatures;
        EqualBool(router.VenueSupportsIoc(noIoc), false, "IOC: false means no");
        var withIoc = new StubVenue("stub");
        withIoc.features = new dict() { { "spot", new dict() { { "createOrder", new dict() { { "timeInForce", new dict() { { "IOC", true }, { "FOK", true }, { "PO", true }, { "GTD", false }, { "GTC", true } } } } } } } };
        EqualBool(router.VenueSupportsIoc(withIoc), true, "IOC: true means yes");
        //  a dictionary that enumerates its values and omits IOC has said no
        var silentAboutIoc = new StubVenue("stub");
        silentAboutIoc.features = new dict() { { "spot", new dict() { { "createOrder", new dict() { { "timeInForce", new dict() { { "GTC", true } } } } } } } };
        EqualBool(router.VenueSupportsIoc(silentAboutIoc), false, "a list of values without IOC means no");
        //  and a venue that says nothing at all is still assumed to do IOC
        var silent = new StubVenue("stub");
        silent.features = new dict();
        EqualBool(router.VenueSupportsIoc(silent), true, "silence is still assumed to be yes");
        //  end to end: the documented market-order fallback is reachable again
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        var rates = new dict() { { "USDT", 1.0 } };
        var refused = await router.Execute(plan, Venues(noIoc), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates } });
        EqualString((string)ToDict(ToList(refused["steps"])[0])["errorCode"], "NotSupported", "the step refuses rather than sending an IOC");
        EqualCalls(noIoc.calls, new List<string>(), "an IOC was never sent to a venue that cannot do one");
        var allowed = new StubVenue("stub");
        allowed.features = noIocFeatures;
        //  the same plan again on purpose: this test is about the market-order opt-in, not
        //  about idempotency, so the re-execution guard is explicitly waived
        var placed = await router.Execute(plan, Venues(allowed), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates }, { "allowMarketOrders", true }, { "allowReexecution", true } });
        EqualString((string)ToDict(ToList(placed["steps"])[0])["status"], "filled", "the opt-in reaches the market order");
        EqualCalls(allowed.calls, new List<string>() { "createOrder:market:buy:0.2" }, "and it is a market order");
        //  ...but not under a cap. AssertUnderCap values the order at the plan's LIMIT price and
        //  the market call sends no price at all, so passing the check and then removing the price
        //  it was computed from is a cap that silently disappears. Refused together.
        var capped = new StubVenue("stub");
        capped.features = noIocFeatures;
        var underCap = await router.Execute(plan, Venues(capped), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates }, { "allowMarketOrders", true }, { "maxNotionalUsd", 1000.0 }, { "allowReexecution", true } });
        EqualString((string)ToDict(ToList(underCap["steps"])[0])["status"], "failed", "a market order under a cap is refused");
        EqualString((string)ToDict(ToList(underCap["steps"])[0])["errorCode"], "NotSupported", "and names the refusal");
        EqualCalls(capped.calls, new List<string>(), "refused BEFORE dispatch: a cap checked against a price that is then discarded is worse than no cap");
    }

    /// <summary>
    /// A venue that cancels an order itself on the last poll — expiry, self-trade
    /// prevention, a post-only rejection of the remainder — has ENDED it, and the
    /// partial fill it carries is real.
    /// </summary>
    private static async Task LimitProtectedRefusesAZeroPollInterval()
    {
        //  The poll loop advances its clock by pollIntervalMs, so 0 never reaches the timeout: it
        //  spins on FetchOrder forever with a real order resting on a real venue, and the timeout
        //  that exists to cancel that order never arrives. Refused BEFORE CreateOrder — refusing
        //  afterwards would leave the very order the loop could not clean up.
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), new dict() { { "slippageBps", 0.0 } });
        foreach (var interval in new double[] { 0.0, -1.0 })
        {
            var venue = new StubVenue("stub");
            venue.createdStatus = "open";
            await Rejects<BadRequest>(async () => await router.Execute(plan, Venues(venue), new dict() {
                { "strategy", "limit_protected" }, { "live", true },
                { "usdRates", new dict() { { "USDT", 1.0 } } },
                { "orderTimeoutMs", 4.0 }, { "pollIntervalMs", interval },
            }), "pollIntervalMs " + interval.ToString() + " must be refused");
            Ok(venue.calls.Count == 0, "nothing may reach the venue");
        }
        var ok = new StubVenue("stub");
        ok.createdStatus = "open";
        ok.fetchOrderResults = new List<dict>() {
            new dict() { { "id", "stub-order" }, { "status", "closed" }, { "filled", 0.0002 }, { "average", 100000.0 }, { "cost", 20.0 } },
        };
        var report = await router.Execute(plan, Venues(ok), new dict() {
            { "strategy", "limit_protected" }, { "live", true },
            { "usdRates", new dict() { { "USDT", 1.0 } } },
            { "orderTimeoutMs", 4.0 }, { "pollIntervalMs", 1.0 },
        });
        EqualString((string)ToDict(ToList(report["steps"])[0])["status"], "filled", "an ordinary interval still works");
    }

    private static async Task LimitProtectedKeepsAVenueSideCancelFill()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), new dict() { { "slippageBps", 0.0 } });
        var venue = new StubVenue("stub");
        venue.createdStatus = "open";
        venue.fetchOrderResults.Add(new dict() { { "id", "stub-order" }, { "status", "open" }, { "filled", 0.0 }, { "average", 0.0 }, { "cost", 0.0 } });
        venue.fetchOrderResults.Add(new dict() { { "id", "stub-order" }, { "status", "canceled" }, { "filled", 0.0001 }, { "average", 100000.0 }, { "cost", 10.0 } });
        venue.cancelThrows = true;
        var report = await router.Execute(plan, Venues(venue), new dict() { { "strategy", "limit_protected" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } }, { "orderTimeoutMs", 2.0 }, { "pollIntervalMs", 1.0 } });
        Ok(!venue.calls.Contains("cancelOrder:stub-order"), "an order the venue already closed is not cancelled again");
        var step = ToDict(ToList(report["steps"])[0]);
        EqualString((string)step["status"], "partial", "the fill is kept");
        EqualNumber(ToDouble(step["filledAmount"]), 0.0001, "and it is the right size");
        EqualNumber(ToDouble(step["outAmount"]), 0.0001, "and it reaches outAmount");
        EqualString((string)step["orderId"], "stub-order", "and the id is reported");
        EqualNumber(ToList(report["openOrders"]).Count, 0, "nothing is open: the venue closed it");
        //  and the 0.0001 BTC that was actually bought reaches the unwind plan
        var unwind = router.BuildUnwindPlan(report);
        EqualNumber(ToDouble(unwind["residualCount"]), 1, "a real position must never be invisible to the unwind path");
        EqualNumber(ToDouble(ToDict(ToList(unwind["steps"])[0])["amount"]), 0.0001, "the unwind sells exactly what was bought");
    }

    /// <summary>
    /// Every path between a successful createOrder and the final read leaves a
    /// real order on a real venue. The id must be captured the instant
    /// createOrder returns, and a failure after that must file an open order.
    /// </summary>
    private static async Task OrderIdSurvivesAFailureAfterCreate()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), new dict() { { "slippageBps", 0.0 } });
        var venue = new StubVenue("stub");
        venue.createdStatus = "open";
        venue.fetchOrderThrows = true;
        var report = await router.Execute(plan, Venues(venue), new dict() { { "strategy", "limit_protected" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } }, { "orderTimeoutMs", 4.0 }, { "pollIntervalMs", 1.0 } });
        var step = ToDict(ToList(report["steps"])[0]);
        //  NOT "failed". A step whose id is known had CreateOrder RETURN, so an order exists;
        //  calling that "failed" reads as "nothing happened" while openOrders, a few lines down,
        //  says the opposite. One report must not carry both readings.
        EqualString((string)step["status"], "outcome_unknown", "a known id means an order exists, so the outcome is unknown rather than failed");
        EqualString((string)report["haltReason"], "outcome_unknown", "and the halt names the ambiguity rather than claiming an outright failure");
        EqualString((string)step["orderId"], "stub-order", "the id is captured the instant createOrder returns, not after the read");
        var openOrders = ToList(report["openOrders"]);
        EqualNumber(openOrders.Count, 1, "a live order the caller cannot see is the worst outcome there is");
        var open = ToDict(openOrders[0]);
        EqualString((string)open["orderId"], "stub-order", "and it names the order");
        EqualString((string)open["exchangeId"], "stub", "and the venue it is on");
        EqualString((string)open["reason"], "outcome_unknown", "and why it may still be live");
        //  the same holds for an immediate order, which has no poll loop at all
        var other = new StubVenue("stub");
        other.createdStatus = "open";
        var okReport = await router.Execute(plan, Venues(other), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } }, { "allowReexecution", true } });
        EqualString((string)ToDict(ToList(okReport["steps"])[0])["orderId"], "stub-order", "an immediate order reports its id too");
        //  and an "immediate" order the venue reports as STILL OPEN is a resting
        //  order — which is what a venue that silently drops timeInForce leaves you.
        //  It is cancelled and re-read, so nothing is left resting to report.
        Ok(other.calls.Contains("cancelOrder:stub-order"), "a resting order is cancelled, not merely noted");
        EqualNumber(ToList(okReport["openOrders"]).Count, 0, "the cancel and the re-read settled it");
    }

    private static async Task ARestingOrderIsCancelled()
    {
        //  A venue that silently drops timeInForce turns an immediate-or-cancel
        //  order into a plain resting limit order. Recording it and continuing
        //  means the next hop is sized on a fill that is still growing behind it,
        //  and the leftover order stays live on a real venue after the route has
        //  returned and nobody is watching it.
        var router = NewRouter();
        var strategies = new List<string>() { "sequential", "parallel_within_hop", "best_effort" };
        for (var i = 0; i < strategies.Count; i++)
        {
            var strategy = strategies[i];
            var options = new dict() { { "strategy", strategy }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } } };
            if (strategy == "best_effort")
            {
                options["acknowledgeDispersion"] = true;
                options["maxOrders"] = 4.0;
            }
            //  1. the cancel works: the order is gone, the re-read is what gets reported
            var venue = new StubVenue("stub");
            venue.createdStatus = "open";
            venue.fetchOrderResults.Add(new dict() { { "id", "stub-order" }, { "status", "canceled" }, { "filled", 0.0001 }, { "average", 100000.0 }, { "cost", 10.0 } });
            var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), new dict() { { "slippageBps", 0.0 } });
            var report = await router.Execute(plan, Venues(venue), options);
            Ok(venue.calls.Contains("cancelOrder:stub-order"), strategy + ": the resting order is cancelled");
            EqualNumber(ToList(report["openOrders"]).Count, 0, strategy + ": nothing is left resting");
            var step = ToDict(ToList(report["steps"])[0]);
            //  the re-read is authoritative — the cancel and a fill crossed
            EqualNumber(ToDouble(step["filledAmount"]), 0.0001, strategy + ": the fill observed AFTER the cancel is the one reported");
            EqualString((string)step["status"], "partial", strategy + ": a real partial fill, not an unknown");
            //  2. the cancel fails: the order can still fill in full after this returns,
            //     so nothing downstream may be sized on what was observed
            var stubborn = new StubVenue("stub");
            stubborn.createdStatus = "open";
            stubborn.cancelThrows = true;
            var plan2 = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), new dict() { { "slippageBps", 0.0 } });
            var failed = await router.Execute(plan2, Venues(stubborn), options);
            var failedStep = ToDict(ToList(failed["steps"])[0]);
            EqualString((string)failedStep["status"], "outcome_unknown", strategy + ": an uncancellable resting order is never a settled step");
            var stillLive = ToList(failed["openOrders"]);
            EqualNumber(stillLive.Count, 1, strategy + ": the operator is told what is still live");
            EqualString((string)ToDict(stillLive[0])["orderId"], "stub-order", strategy + ": and it names the order");
            EqualString((string)ToDict(stillLive[0])["reason"], "cancel_failed", strategy + ": and says the cancel failed");
            //  3. the cancel is accepted and the venue still calls it open: same rule
            var ghost = new StubVenue("stub");
            ghost.createdStatus = "open";
            ghost.fetchOrderResults.Add(new dict() { { "id", "stub-order" }, { "status", "open" }, { "filled", 0.0 }, { "average", 0.0 }, { "cost", 0.0 } });
            var plan3 = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.0002, 100000), new dict() { { "slippageBps", 0.0 } });
            var ghosted = await router.Execute(plan3, Venues(ghost), options);
            var ghostStep = ToDict(ToList(ghosted["steps"])[0]);
            EqualString((string)ghostStep["status"], "outcome_unknown", strategy + ": a cancel the venue ignored leaves the outcome unknown");
            var ghostOpen = ToList(ghosted["openOrders"]);
            EqualNumber(ghostOpen.Count, 1, strategy + ": and it is reported");
            EqualString((string)ToDict(ghostOpen[0])["reason"], "still_open", strategy + ": as still open");
        }
    }

    private static async Task MarketOrdersNeedBoth()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        var rates = new dict() { { "USDT", 1.0 } };
        //  a venue that advertises GTC only
        var noIoc = new StubVenue("stub");
        noIoc.features = new dict() { { "spot", new dict() { { "createOrder", new dict() { { "timeInForce", new list() { "GTC" } } } } } } };
        var refused = await router.Execute(plan, Venues(noIoc), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates } });
        var refusedStep = ToDict(ToList(refused["steps"])[0]);
        EqualString((string)refusedStep["status"], "failed", "the leg failed");
        EqualString((string)refusedStep["errorCode"], "NotSupported", "with the class name of the refusal");
        EqualCalls(noIoc.calls, new List<string>(), "defaulting to a market order is the decision the caller did not delegate");
        var allowed = new StubVenue("stub");
        allowed.features = new dict() { { "spot", new dict() { { "createOrder", new dict() { { "timeInForce", new list() { "GTC" } } } } } } };
        //  the same plan again on purpose: this test is about the market-order opt-in, not
        //  about idempotency, so the re-execution guard is explicitly waived
        var placed = await router.Execute(plan, Venues(allowed), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates }, { "allowMarketOrders", true }, { "allowReexecution", true } });
        EqualString((string)ToDict(ToList(placed["steps"])[0])["status"], "filled", "the market order went through");
        EqualCalls(allowed.calls, new List<string>() { "createOrder:market:buy:0.2" }, "a market order");
        //  a venue that says nothing about timeInForce is assumed to do IOC: a
        //  rejected IOC is loud and cheap, an unintended market order is not
        var unknown = new StubVenue("stub");
        unknown.features = new dict();
        var assumed = await router.Execute(plan, Venues(unknown), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates }, { "allowReexecution", true } });
        EqualString((string)ToDict(ToList(assumed["steps"])[0])["status"], "filled", "it filled");
        EqualCalls(unknown.calls, new List<string>() { "createOrder:limit:buy:0.2" }, "an IOC limit order");
    }

    private static async Task ParallelContainsFailure()
    {
        var router = NewRouter();
        var route = OneLegRoute("buy", "BTC", "USDT", 0.1, 100);
        //  ToDict copies, so reach the hop through a cast: this must rewrite
        //  the route itself, not a snapshot of it
        ((dict)((list)route["hops"])[0])["legs"] = new list()
        {
            new dict() { { "exchangeId", "good" }, { "amount", 0.1 }, { "averagePrice", 100.0 }, { "effectivePrice", 100.0 } },
            new dict() { { "exchangeId", "bad" }, { "amount", 0.1 }, { "averagePrice", 100.0 }, { "effectivePrice", 100.0 } },
            new dict() { { "exchangeId", "good2" }, { "amount", 0.1 }, { "averagePrice", 100.0 }, { "effectivePrice", 100.0 } },
        };
        var plan = router.BuildExecutionPlan(route, new dict());
        var good = new StubVenue("good");
        var bad = new StubVenue("bad", 1, true);
        var good2 = new StubVenue("good2");
        var report = await router.Execute(plan, Venues(good, bad, good2), new dict() { { "strategy", "parallel_within_hop" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } } });
        var steps = ToList(report["steps"]);
        EqualString((string)ToDict(steps[0])["status"], "filled", "the first leg filled");
        EqualString((string)ToDict(steps[1])["status"], "failed", "the second leg failed");
        EqualString((string)ToDict(steps[2])["status"], "filled", "the sibling behind the failure still ran");
        var errors = ToList(report["errors"]);
        EqualNumber(errors.Count, 1, "one error");
        EqualString((string)ToDict(errors[0])["exchangeId"], "bad", "and it names the venue");
        EqualBool((bool)report["halted"], true, "a failed leg still halts the route after the hop settles");
        EqualString((string)report["haltReason"], "order_failed", "and says why");
    }

    private static async Task BestEffortRefusals()
    {
        var router = NewRouter();
        var rates = new dict() { { "USDT", 1.0 } };
        var multiHop = router.BuildExecutionPlan(TwoHopRoute(), new dict());
        var venue = new StubVenue("stub");
        await Rejects<NotSupported>(async () => await router.Execute(multiHop, Venues(venue), new dict() { { "strategy", "best_effort" }, { "live", true }, { "usdRates", rates }, { "acknowledgeDispersion", true }, { "maxOrders", 5 } }), "best_effort refuses multi-hop");
        var singleHop = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        await Rejects<BadRequest>(async () => await router.Execute(singleHop, Venues(venue), new dict() { { "strategy", "best_effort" }, { "live", true }, { "usdRates", rates }, { "maxOrders", 5 } }), "best_effort demands acknowledgeDispersion");
        await Rejects<BadRequest>(async () => await router.Execute(singleHop, Venues(venue), new dict() { { "strategy", "best_effort" }, { "live", true }, { "usdRates", rates }, { "acknowledgeDispersion", true } }), "best_effort demands maxOrders");
        EqualCalls(venue.calls, new List<string>(), "nothing reached the venue");
    }

    private static async Task BestEffortMaxOrders()
    {
        var router = NewRouter();
        var route = OneLegRoute("buy", "BTC", "USDT", 0.1, 100);
        //  ToDict copies, so reach the hop through a cast: this must rewrite
        //  the route itself, not a snapshot of it
        ((dict)((list)route["hops"])[0])["legs"] = new list()
        {
            new dict() { { "exchangeId", "a" }, { "amount", 0.1 }, { "averagePrice", 100.0 }, { "effectivePrice", 100.0 } },
            new dict() { { "exchangeId", "b" }, { "amount", 0.1 }, { "averagePrice", 100.0 }, { "effectivePrice", 100.0 } },
            new dict() { { "exchangeId", "c" }, { "amount", 0.1 }, { "averagePrice", 100.0 }, { "effectivePrice", 100.0 } },
        };
        var plan = router.BuildExecutionPlan(route, new dict());
        var a = new StubVenue("a");
        var b = new StubVenue("b", 0.01);
        var c = new StubVenue("c");
        var report = await router.Execute(plan, Venues(a, b, c), new dict() { { "strategy", "best_effort" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } }, { "acknowledgeDispersion", true }, { "maxOrders", 2 } });
        EqualNumber(ToDouble(report["ordersPlaced"]), 2, "two orders");
        var third = ToDict(ToList(report["steps"])[2]);
        EqualString((string)third["status"], "skipped", "the third was skipped");
        EqualString((string)third["errorCode"], "max_orders_reached", "and said why");
        EqualBool((bool)report["halted"], false, "a 1% fill on leg b does not stop best_effort — that is the whole strategy");
        EqualCalls(c.calls, new List<string>(), "the third venue was never called");
    }

    //  -----------------------------------------------------------------------
    //  idempotency (audit finding 35): Execute used to build fresh state on every
    //  call and consult nothing, so running the same plan twice placed every order
    //  twice — including the ones that had already filled.
    //  -----------------------------------------------------------------------

    private static async Task LiveRequiresAnIdentity()
    {
        var router = NewRouter();
        var route = OneLegRoute("buy", "BTC", "USDT", 0.2, 100);
        route["requestId"] = "";
        var plan = router.BuildExecutionPlan(route, new dict());
        var rates = new dict() { { "USDT", 1.0 } };
        var venue = new StubVenue("stub");
        await Rejects<BadRequest>(async () => await router.Execute(plan, Venues(venue), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates } }), "a live plan with no identity is refused");
        EqualCalls(venue.calls, new List<string>(), "refused before a single call reached the venue");
        //  a rehearsal needs no identity: it places nothing
        var dry = await router.Execute(plan, Venues(venue), new dict() { { "strategy", "sequential" }, { "usdRates", rates } });
        EqualBool((bool)dry["dryRun"], true, "a dry run needs no identity");
        //  ...and a HAND-ASSEMBLED plan is a supported input: Execute takes any dictionary of
        //  the plan shape, and such a plan never went through a routing request, so requestId
        //  is the one identity it cannot have. options idempotencyKey is how it supplies one.
        var supplied = new StubVenue("stub");
        var keyed = await router.Execute(plan, Venues(supplied), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates }, { "idempotencyKey", "hand-built-1" } });
        EqualString((string)keyed["planId"], "hand-built-1", "the supplied key is the identity");
        EqualString((string)ToDict(ToList(keyed["steps"])[0])["status"], "filled", "and the plan executes");
        EqualBool(supplied.paramsSeen[0].ContainsKey("clientOrderId"), false, "and no client order id is injected");
        //  and the guard keys off it, exactly as it does off a requestId
        var again = new StubVenue("stub");
        await Rejects<BadRequest>(async () => await router.Execute(plan, Venues(again), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates }, { "idempotencyKey", "hand-built-1" } }), "the same key is refused a second time");
        EqualCalls(again.calls, new List<string>(), "and places nothing");
        //  an explicit key OVERRIDES a plan's requestId: passing one is a deliberate statement
        //  about what this execution is, and the caller is closer to that than the plan is
        var routed = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        var overridden = new StubVenue("stub");
        var report = await router.Execute(routed, Venues(overridden), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates }, { "idempotencyKey", "override-1" } });
        EqualString((string)report["planId"], "override-1", "the option overrides the requestId");
        EqualBool(overridden.paramsSeen[0].ContainsKey("clientOrderId"), false, "and no client order id is injected");
    }

    private static async Task ClientOrderIdIsNeverInjected()
    {
        var router = NewRouter();
        var route = TwoHopRoute();
        route["requestId"] = "fixed-req";
        var plan = router.BuildExecutionPlan(route, new dict());
        //  by default nothing is injected: each exchange's CreateOrder sends whatever identifier
        //  it generates on its own
        var bare = new StubVenue("stub");
        var report = await router.Execute(plan, Venues(bare), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } } });
        EqualString((string)report["planId"], "fixed-req", "the report names the plan identity");
        EqualNumber(bare.paramsSeen.Count, 2, "two orders were placed");
        EqualBool(bare.paramsSeen[0].ContainsKey("clientOrderId"), false, "no client order id is forced onto the order");
        EqualBool(bare.paramsSeen[1].ContainsKey("clientOrderId"), false, "for any step");
        EqualString((string)ToDict(ToList(report["steps"])[0])["clientOrderId"], "", "and the report carries what the venue reported, which is nothing");
        //  a caller-supplied clientOrderId is forwarded as-is, alongside the caller's other params
        var second = NewRouter();
        var venue = new StubVenue("stub");
        var supplied = await second.Execute(router.BuildExecutionPlan(route, new dict()), Venues(venue), new dict()
        {
            { "strategy", "sequential" },
            { "live", true },
            { "usdRates", new dict() { { "USDT", 1.0 } } },
            { "orderParams", new dict() { { "clientOrderId", "caller-supplied" }, { "reduceOnly", true } } },
        });
        EqualString((string)venue.paramsSeen[0]["clientOrderId"], "caller-supplied", "the caller's id travels untouched");
        EqualString((string)venue.paramsSeen[1]["clientOrderId"], "caller-supplied", "orderParams apply to every step alike");
        EqualBool((bool)venue.paramsSeen[0]["reduceOnly"], true, "the caller's other params still travel");
        EqualString((string)ToDict(ToList(supplied["steps"])[0])["clientOrderId"], "caller-supplied", "and the report says what the venue recorded");
    }

    private static async Task ReexecutionIsRefused()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        var rates = new dict() { { "USDT", 1.0 } };
        var first = new StubVenue("stub");
        var report = await router.Execute(plan, Venues(first), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates } });
        EqualString((string)ToDict(ToList(report["steps"])[0])["status"], "filled", "the first run places the order");
        var again = new StubVenue("stub");
        await Rejects<BadRequest>(async () => await router.Execute(plan, Venues(again), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates } }), "the second run is refused");
        EqualCalls(again.calls, new List<string>(), "not one order was re-placed");
        //  a plan rebuilt from the same route is the same plan: the identity travels with it
        var rebuiltRoute = OneLegRoute("buy", "BTC", "USDT", 0.2, 100);
        rebuiltRoute["requestId"] = plan["requestId"];
        var rebuilt = router.BuildExecutionPlan(rebuiltRoute, new dict());
        var third = new StubVenue("stub");
        await Rejects<BadRequest>(async () => await router.Execute(rebuilt, Venues(third), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates } }), "a rebuilt plan with the same identity is refused too");
        EqualCalls(third.calls, new List<string>(), "and places nothing");
        //  ...and the legitimate retry path is explicit
        var allowed = new StubVenue("stub");
        var retry = await router.Execute(plan, Venues(allowed), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates }, { "allowReexecution", true } });
        EqualString((string)ToDict(ToList(retry["steps"])[0])["status"], "filled", "an explicit opt-in runs it again");
        EqualCalls(allowed.calls, new List<string>() { "createOrder:limit:buy:0.2" }, "and really does place the order");
    }

    private static async Task DryRunDoesNotConsumeAPlan()
    {
        var router = NewRouter();
        var rates = new dict() { { "USDT", 1.0 } };
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        await router.Execute(plan, Venues(new StubVenue("stub")), new dict() { { "strategy", "sequential" }, { "usdRates", rates } });
        var real = new StubVenue("stub");
        var report = await router.Execute(plan, Venues(real), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates } });
        EqualString((string)ToDict(ToList(report["steps"])[0])["status"], "filled", "the rehearsal did not burn the plan");
        //  a run that FAILED still placed orders — or may have — so the retry is refused just
        //  the same. The ledger records the attempt, not the outcome.
        var failedPlan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        var broken = new StubVenue("stub");
        broken.failCreate = true;
        var failedReport = await router.Execute(failedPlan, Venues(broken), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates } });
        EqualBool((bool)failedReport["halted"], true, "the run halted");
        var retry = new StubVenue("stub");
        await Rejects<BadRequest>(async () => await router.Execute(failedPlan, Venues(retry), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates } }), "a failed run still consumed the plan");
        EqualCalls(retry.calls, new List<string>(), "and the retry placed nothing");
    }

    private static async Task LedgerIsBounded()
    {
        var bounded = NewRouter();
        var capacity = OrderRouter.MaxExecutedPlanIds;
        for (var i = 0; i < capacity; i++)
        {
            bounded.RecordExecutedPlan("plan-" + i.ToString(CultureInfo.InvariantCulture));
        }
        EqualNumber(bounded.executedPlanIds.Count, capacity, "the ledger fills to exactly the cap");
        EqualBool(bounded.HasExecutedPlan("plan-0"), true, "nothing is evicted before it is full");
        //  the cap holds no matter how far past it the process runs
        for (var i = capacity; i < capacity + 100; i++)
        {
            bounded.RecordExecutedPlan("plan-" + i.ToString(CultureInfo.InvariantCulture));
        }
        EqualNumber(bounded.executedPlanIds.Count, capacity, "the ledger never grows past the cap");
        //  FIFO: the OLDEST 100 are the ones that went
        for (var i = 0; i < 100; i++)
        {
            EqualBool(bounded.HasExecutedPlan("plan-" + i.ToString(CultureInfo.InvariantCulture)), false, "the oldest entries are evicted first");
        }
        EqualBool(bounded.HasExecutedPlan("plan-100"), true, "nothing newer than the evicted window went with them");
        EqualBool(bounded.HasExecutedPlan("plan-" + (capacity + 99).ToString(CultureInfo.InvariantCulture)), true, "the newest entry is present");
        EqualString(bounded.executedPlanIds.Peek(), "plan-100", "the queue is still in insertion order");
        //  re-recording an id already held must not shuffle the eviction order, or a plan
        //  re-executed in a loop could keep itself alive forever while newer ids fall out
        bounded.RecordExecutedPlan("plan-100");
        EqualNumber(bounded.executedPlanIds.Count, capacity, "a duplicate record adds nothing");
        EqualString(bounded.executedPlanIds.Peek(), "plan-100", "and does not move the entry in the queue");
        //  AND THE TRADEOFF, STATED AS A TEST: an evicted plan is no longer refused. This is
        //  the documented weakening at the cap, not an accident — if this assertion ever has
        //  to change, the comment on MaxExecutedPlanIds has to change with it.
        var rates = new dict() { { "USDT", 1.0 } };
        var options = new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates } };
        var plan = bounded.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        await bounded.Execute(plan, Venues(new StubVenue("stub")), options);
        var refused = new StubVenue("stub");
        await Rejects<BadRequest>(async () => await bounded.Execute(plan, Venues(refused), options), "while remembered, the duplicate is refused");
        EqualCalls(refused.calls, new List<string>(), "and it placed nothing");
        for (var i = 0; i < capacity; i++)
        {
            bounded.RecordExecutedPlan("flush-" + i.ToString(CultureInfo.InvariantCulture));
        }
        EqualBool(bounded.HasExecutedPlan(bounded.StringAt(plan, "requestId", "")), false, "the plan has aged out of the ledger");
        var reexecuted = new StubVenue("stub");
        var report = await bounded.Execute(plan, Venues(reexecuted), options);
        EqualString((string)ToDict(ToList(report["steps"])[0])["status"], "filled", "an aged-out plan re-executes without the opt-in");
        Ok(reexecuted.calls.Count > 0, "which means real orders — the bound costs a guarantee");
    }

    private static async Task UnknownStrategyRefused()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        await Rejects<BadRequest>(async () => await router.Execute(plan, new Dictionary<string, Exchange>(), new dict() { { "strategy", "yolo" } }), "an unknown strategy is refused even in dry run");
    }

    private static async Task FeeInAcquiredAssetIsNetted()
    {
        //  OrderToDict carried only id/status/filled/average/cost, so OrderFeeInAsset — which is
        //  itself correct — was handed an order with no fee fields at all and always returned 0.
        //  C# alone therefore reported outAmount GROSS of fees, and the next hop (and any unwind
        //  built from the report) was sized on base the wallet does not hold.
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict() { { "slippageBps", 0.0 } });
        var venue = new StubVenue("stub");
        //  0.2 BTC bought, 0.0002 BTC taken as the taker fee — charged in the asset acquired
        venue.feeOverride = new dict() { { "currency", "BTC" }, { "cost", 0.0002 } };
        var report = await router.Execute(plan, Venues(venue), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } } });
        var step = ToDict(ToList(report["steps"])[0]);
        EqualNumber(ToDouble(step["feeCost"]), 0.0002, "the fee reaches the report at all");
        EqualString((string)step["feeCurrency"], "BTC", "and names the asset it was taken in");
        EqualNumber(ToDouble(step["grossOutAmount"]), 0.2, "the gross figure is kept for the audit trail");
        EqualNumber(ToDouble(step["outAmount"]), 0.1998, "and what is carried forward is net of it");

        //  A fee in any OTHER currency does not reduce what this hop hands to the next one. This
        //  is the SAME plan a second time, deliberately, to isolate the fee currency as the only
        //  variable — which is exactly what allowReexecution is for. Without it the idempotency
        //  ledger refuses the second run, as it should.
        var other = new StubVenue("stub");
        other.feeOverride = new dict() { { "currency", "USDT" }, { "cost", 0.02 } };
        var quoteFeeReport = await router.Execute(plan, Venues(other), new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } }, { "allowReexecution", true } });
        var quoteFeeStep = ToDict(ToList(quoteFeeReport["steps"])[0]);
        EqualNumber(ToDouble(quoteFeeStep["outAmount"]), 0.2, "a fee in the spent asset leaves the acquired amount alone");
    }

    private static async Task PlanAgeIsReportedAndRefusedOnlyWhenAsked()
    {
        //  A plan is a snapshot of a book. `calculatedAt` was carried on every plan and read by
        //  nothing, so Execute() would happily trade an hour-old plan at hour-old prices — and the
        //  notional cap, computed from those same prices, was just as stale.
        var router = NewRouter();
        var route = OneLegRoute("buy", "BTC", "USDT", 0.2, 100);
        route["calculatedAt"] = 1000000.0;
        var plan = router.BuildExecutionPlan(route, new dict());
        var pinned = new PinnedClockRouter(new dict() { { "apiKey", "test-key" } });
        pinned.pinned = 1060000.0;   //  the plan is exactly 60s old
        var rates = new dict() { { "USDT", 1.0 } };
        //  this test deliberately runs the same plan several times to isolate the age check,
        //  which is exactly what allowReexecution is for
        Func<dict> opts = () => new dict() { { "strategy", "sequential" }, { "live", true }, { "usdRates", rates }, { "allowReexecution", true } };

        //  Always reported, even with nothing enforced, and nothing is refused by default.
        var report = await pinned.Execute(plan, Venues(new StubVenue("stub")), opts());
        EqualNumber(ToDouble(report["planAgeMs"]), 60000, "the age is on the report whether or not it is checked");
        EqualString((string)ToDict(ToList(report["steps"])[0])["status"], "filled", "and nothing is refused by default");

        //  Enforced exactly, at whatever value is asked for.
        var strict = new StubVenue("stub");
        var strictOpts = opts();
        strictOpts["maxPlanAgeMs"] = 30000.0;
        await Rejects<ExchangeError>(async () => await pinned.Execute(plan, Venues(strict), strictOpts), "a stale plan is refused under a limit");
        EqualCalls(strict.calls, new List<string>(), "refused before anything reached the venue");
        var wideOpts = opts();
        wideOpts["maxPlanAgeMs"] = 120000.0;
        var passed = await pinned.Execute(plan, Venues(new StubVenue("stub")), wideOpts);
        EqualString((string)ToDict(ToList(passed["steps"])[0])["status"], "filled", "a limit the plan is inside of lets it through");

        //  An age that cannot be determined BLOCKS under an active limit.
        var undated = router.BuildExecutionPlan(OneLegRoute("buy", "BTC", "USDT", 0.2, 100), new dict());
        var undatedReport = await pinned.Execute(undated, Venues(new StubVenue("stub")), opts());
        EqualNumber(ToDouble(undatedReport["planAgeMs"]), -1, "unknown is -1, never 0: 0 would read as fresh");
        var undatedOpts = opts();
        undatedOpts["maxPlanAgeMs"] = 30000.0;
        await Rejects<ExchangeError>(async () => await pinned.Execute(undated, Venues(new StubVenue("stub")), undatedOpts), "an undatable plan is refused under a limit");
    }

    private static async Task AtomicIshDemandsPrefunding()
    {
        var router = NewRouter();
        var plan = router.BuildExecutionPlan(TwoHopRoute(), new dict());
        //  hop 0 needs 20 USDT and hop 1 needs 0.2 BTC, both already sitting there
        var funded = new StubVenue("stub");
        var rich = await router.Execute(plan, Venues(funded), new dict() { { "strategy", "atomic_ish" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } } });
        EqualNumber(ToDouble(rich["ordersPlaced"]), 2, "a pre-funded route runs end to end");
        var broke = new StubVenue("stub");
        broke.balanceOverride = new dict() { { "free", new dict() { { "USDT", 1.0 }, { "BTC", 0.0 } } } };
        await Rejects<ExchangeError>(async () => await router.Execute(plan, Venues(broke), new dict() { { "strategy", "atomic_ish" }, { "live", true }, { "usdRates", new dict() { { "USDT", 1.0 } } } }), "an underfunded route is refused");
    }

    //  -----------------------------------------------------------------------
    //  4. fetchRoute request shaping, with the HTTP layer stubbed out
    //  -----------------------------------------------------------------------

    /// <summary>
    /// An OrderRouter whose only change is that Request never leaves the
    /// process: it records the url it was handed and answers with a canned body.
    /// </summary>
    public class RecordingRouter : OrderRouter
    {
        public string lastUrl = "";

        public string lastMethod = "";

        public dict lastBody = null;

        public dict body = null;

        public RecordingRouter(dict config, dict body) : base(config)
        {
            this.body = body;
        }

        public string lastRequestId = "";

        public override Task<dict> Request(string url, string method = "GET", dict requestBody = null, string requestId = "")
        {
            this.lastUrl = url;
            this.lastMethod = method;
            this.lastBody = requestBody;
            this.lastRequestId = requestId;
            return Task.FromResult(this.body);
        }
    }

    private static async Task FetchRouteRefusesAmbiguousAmounts()
    {
        var recorder = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict());
        await Rejects<BadRequest>(async () => await recorder.FetchRoute("USDT", "BTC", new dict()), "neither amount is refused");
        await Rejects<BadRequest>(async () => await recorder.FetchRoute("USDT", "BTC", new dict() { { "amountIn", 1.0 }, { "amountOut", 1.0 } }), "both amounts are refused");
        EqualString(recorder.lastUrl, "", "neither reached the wire");
    }

    private static async Task FetchRouteQuery()
    {
        var recorder = new RecordingRouter(new dict() { { "apiKey", "k" }, { "baseUrl", "https://example.test/api/" } }, new dict() { { "hops", new list() } });
        await recorder.FetchRoute("usdt", "btc", new dict()
        {
            { "amountIn", 0.001 },
            { "strategy", "split_capped" },
            { "maxVenues", 3 },
            { "exchanges", new list() { "binance", "kraken" } },
            { "certified", true },
        });
        EqualString(recorder.lastUrl, "https://example.test/api/route?from=USDT&to=BTC&amountIn=0.001&strategy=split_capped&maxVenues=3&exchanges=binance%2Ckraken&certified=true", "the query is deterministic");
        EqualString(recorder.lastMethod, "GET", "a request carrying no holdings stays a cacheable, linkable GET");
    }

    private static async Task FetchRouteBalancesArePosted()
    {
        //  The service scrubs balances from its own logs, but the URL leaves the process: a
        //  reverse proxy, an ALB and a CDN all log the full request line, as do browser
        //  history and client-side tracing. This is the assertion that keeps the wallet
        //  out of them.
        var recorder = new RecordingRouter(new dict() { { "apiKey", "k" }, { "baseUrl", "https://example.test/api" } }, new dict() { { "hops", new list() }, { "balancesApplied", "binance.BTC:1,binance.USDT:1000" } });
        await recorder.FetchRoute("usdt", "btc", new dict()
        {
            { "amountIn", 10.0 },
            { "balances", "binance.USDT:1000,binance.BTC:1" },
            { "certified", true },
            { "maxVenues", 2 },
        });
        EqualString(recorder.lastMethod, "POST", "a route carrying holdings is POSTed");
        EqualString(recorder.lastUrl, "https://example.test/api/route", "no query string at all");
        Ok(recorder.lastUrl.IndexOf("balances", StringComparison.Ordinal) < 0, "the holdings are not in the url");
        Ok(recorder.lastUrl.IndexOf("1000", StringComparison.Ordinal) < 0, "nor is any amount from them");
        EqualString((string)recorder.lastBody["from"], "USDT", "the body carries from");
        EqualString((string)recorder.lastBody["to"], "BTC", "the body carries to");
        EqualString((string)recorder.lastBody["balances"], "binance.USDT:1000,binance.BTC:1", "the body carries the holdings");
        //  numbers and booleans travel as themselves: the body is JSON, and the service's
        //  own schema types amountIn as a number
        Ok(recorder.lastBody["amountIn"] is double, "amountIn stays a number");
        Ok(recorder.lastBody["certified"] is bool, "certified stays a bool");
        Ok(recorder.lastBody["maxVenues"] is int, "maxVenues stays a number");
    }

    private static async Task FetchRouteEmptyBalancesStillPosted()
    {
        //  "" is what a caller gets from a venue with nothing in it. It is not "no balances
        //  parameter" — the router reads it, and a check that treated it as absent would
        //  put the NEXT non-empty value on the same code path back into the url.
        var recorder = new RecordingRouter(new dict() { { "apiKey", "k" }, { "baseUrl", "https://example.test/api" } }, new dict() { { "hops", new list() }, { "balanceEntryCount", 0 } });
        await recorder.FetchRoute("usdt", "btc", new dict() { { "amountIn", 10.0 }, { "balances", "" } });
        EqualString(recorder.lastMethod, "POST", "an empty holdings string is still holdings");
        EqualString((string)recorder.lastBody["balances"], "", "and it reaches the body");
    }

    private static async Task ReadOnlyEndpointsHitTheirOwnPaths()
    {
        var config = new dict() { { "apiKey", "k" }, { "baseUrl", "https://example.test/api" } };
        var canned = new dict() { { "status", "ok" }, { "symbols", new list() { "BTC/USDT" } }, { "exchanges", new list() { new dict() { { "exchangeId", "binance" } } } } };
        var recorder = new RecordingRouter(config, canned);
        await recorder.FetchHealth();
        EqualString(recorder.lastUrl, "https://example.test/api/health", "FetchHealth path");
        await recorder.FetchReadiness();
        EqualString(recorder.lastUrl, "https://example.test/api/ready", "FetchReadiness path");
        await recorder.FetchVersion();
        EqualString(recorder.lastUrl, "https://example.test/api/version", "FetchVersion path");
        var symbols = await recorder.FetchSymbols();
        EqualNumber(symbols.Count, 1, "the symbols envelope is unwrapped");
        EqualString(recorder.lastUrl, "https://example.test/api/symbols", "FetchSymbols path");
        var venues = await recorder.FetchExchangesStatus();
        EqualNumber(venues.Count, 1, "the exchanges envelope is unwrapped");
        EqualString(recorder.lastUrl, "https://example.test/api/exchanges/status", "FetchExchangesStatus path");
        //  BTC/USDT unencoded reads as two segments and reaches a route that does not exist
        await recorder.FetchCachedOrderBook("binance", "BTC/USDT");
        EqualString(recorder.lastUrl, "https://example.test/api/orderbook/binance/BTC%2FUSDT", "the symbol is ONE path segment");
        await Rejects<ArgumentsRequired>(async () => await recorder.FetchCachedOrderBook("binance", ""), "an empty symbol is refused");
    }

    private static async Task BalancesSkipsAndSorts()
    {
        var recorder = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict() { { "hops", new list() }, { "balancesApplied", "stub.BTC:1,stub.USDT:1000" } });
        var route = await recorder.FetchRouteWithBalances("USDT", "BTC", Venues(new StubVenue("stub")), new dict() { { "amountIn", 10.0 } });
        EqualString((string)route["balancesUsed"], "stub.USDT:1000,stub.BTC:1", "largest first, and the ZERO holding is gone");
        EqualNumber(ToList(route["balancesDropped"]).Count, 0, "nothing was dropped");
        //  the holdings reach the service in the BODY — never in the url. See the dedicated
        //  test above for why that distinction is the whole point.
        EqualString(recorder.lastMethod, "POST", "the balances request is a POST");
        EqualString((string)recorder.lastBody["balances"], "stub.USDT:1000,stub.BTC:1", "the balances reached the body");
        Ok(recorder.lastUrl.IndexOf("balances", StringComparison.Ordinal) < 0, "and never the url");
    }

    private static async Task BalancesMustBeEchoed()
    {
        var silent = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict() { { "hops", new list() } });
        await Rejects<ExchangeError>(async () => await silent.FetchRouteWithBalances("USDT", "BTC", Venues(new StubVenue("stub")), new dict() { { "amountIn", 10.0 } }), "a router that ignored the balances is refused");
        //  and the caller can opt out with their eyes open
        var opted = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict() { { "hops", new list() } });
        var route = await opted.FetchRouteWithBalances("USDT", "BTC", Venues(new StubVenue("stub")), new dict() { { "amountIn", 10.0 }, { "requireBalancesApplied", false } });
        EqualString((string)route["balancesUsed"], "stub.USDT:1000,stub.BTC:1", "the balances were still built");
    }

    private static async Task BalancesEntryCap()
    {
        var recorder = new RecordingRouter(new dict() { { "apiKey", "k" } }, new dict() { { "hops", new list() }, { "balancesApplied", "x" } });
        var many = new StubVenue("stub");
        var free = new dict();
        for (var i = 0; i < 70; i++)
        {
            free["C" + i.ToString(CultureInfo.InvariantCulture)] = (double)(i + 1);
        }
        many.balanceOverride = new dict() { { "free", free } };
        var route = await recorder.FetchRouteWithBalances("USDT", "BTC", Venues(many), new dict() { { "amountIn", 10.0 } });
        var dropped = ToList(route["balancesDropped"]);
        EqualNumber(dropped.Count, 6, "six holdings went");
        EqualNumber(((string)route["balancesUsed"]).Split(',').Length, 64, "sixty-four entries survive");
        for (var i = 0; i < dropped.Count; i++)
        {
            var entry = ToDict(dropped[i]);
            EqualString((string)entry["reason"], "entry_cap", "dropped for the entry cap");
            Ok(ToDouble(entry["amount"]) <= 6, "the six smallest holdings are the ones that went");
        }
    }

    private static void FormatNumberIsPlain()
    {
        var router = NewRouter();
        EqualString(router.FormatNumber(0.0000001), "0.0000001", "no exponent for a small number");
        Throws<BadRequest>(() => router.FormatNumber(1e21), "refused rather than rendered as 1e+21 in one language and not the others");
        EqualString(router.FormatNumber(0), "0", "zero");
        EqualString(router.FormatNumber(1000000), "1000000", "a round million");
        EqualString(router.FormatNumber(0.5), "0.5", "a half");
        EqualString(router.FormatNumber(1e-15), "0", "below the twelfth decimal");
    }
}
