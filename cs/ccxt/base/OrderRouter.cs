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
//      go/v4/exchange_order_router.go
//      rust/ccxt-base/src/order_router.rs
//
//  Every construct below is deliberately one that TypeScript, Python, PHP, Go and
//  Rust can express the same way. The rules that keep the six ports honest:
//
//    - plain dictionaries and arrays only, never a language-specific container.
//      Dictionary<string, object> and List<object> everywhere, no generics of
//      our own, no tuples, no records
//    - NO NULLS in any returned structure. 0 means "unknown number", "" means
//      "unknown string", and a boolean companion field carries "was it known?"
//      wherever that distinction is load-bearing. C# value types and Go structs
//      have no natural null, and a null that only exists in three of six
//      languages is a divergence waiting to happen
//    - never iterate a hash map to produce ORDERED output. Build lists and
//      search them linearly: map iteration order differs per language
//    - all numbers are IEEE-754 doubles and every arithmetic sequence is written
//      in a fixed order, so the six ports agree bit for bit
//    - ONE number grammar, hand-rolled in all six (see ParseNumber). No port
//      calls its own parser: string.Trim() eats Unicode whitespace JavaScript's
//      parseFloat does not, and double.TryParse has no notion of a numeric
//      PREFIX. A cap read as 1234.5 in one language and 1 in another is a cap
//      that silently disappears
//    - NaN and +/-Infinity are NOT numbers here. An infinite tolerance disables
//      the halt verdict and an infinite rate disables the cap, so both fall back
//      to the caller's default — in all six, identically
//    - violation and verdict strings are CONSTANTS, never interpolated with
//      numbers: "25" and "25.0" are the same value and different text
//    - no closures escape a method, no LINQ over the money paths, no exceptions
//      as control flow
//
//  Three places where C# genuinely differs from JavaScript are handled
//  explicitly rather than papered over, and each is commented where it happens:
//  JS Math.round is round-half-up while Math.Round is banker's rounding
//  (RoundHalfUp below); Uri.EscapeDataString escapes characters that
//  encodeURIComponent leaves alone (EncodeUriComponent below); and JavaScript's
//  single thread makes concurrent report mutation free, where parallel legs here
//  really do run on several threads (reportLock below).
//
//  This class never moves funds between venues. There is no call to any
//  funds-transfer endpoint anywhere in it, deliberately and permanently.
//  ---------------------------------------------------------------------------

using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Numerics;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace ccxt;

using dict = Dictionary<string, object>;
using list = List<object>;

/// <summary>
/// A client for the CCXT order-router service and the pure planning, safety,
/// reconciliation and unwind layer that sits between a routing recommendation
/// and real orders.
/// </summary>
public class OrderRouter
{
    //  -----------------------------------------------------------------------
    //  Static text for every violation and verdict code. Kept out of the methods
    //  so that a port can copy the table verbatim and a reviewer can diff two
    //  languages by eye. No number is ever interpolated into these.
    //  -----------------------------------------------------------------------

    private static readonly dict VIOLATION_MESSAGES = new dict()
    {
        { "empty_plan", "the plan contains no steps" },
        { "route_unroutable", "the route carries an unroutableReason and must not be executed" },
        { "partial_fill", "the route does not fill completely at the requested size" },
        { "unknown_symbol", "the symbol is not listed on that venue" },
        { "market_mismatch", "the venue market trades a different pair than the route hop says it does" },
        { "invalid_step", "the step has a non-positive amount or price, or a side that is neither buy nor sell" },
        { "amount_below_minimum", "the amount is below the market minimum" },
        { "amount_above_maximum", "the amount is above the market maximum" },
        { "cost_below_minimum", "the notional is below the market minimum cost" },
        { "price_out_of_range", "the limit price falls outside the market price limits" },
        { "notional_unvaluable", "the step cannot be valued in USD, so the notional cap cannot be enforced" },
        { "notional_exceeds_cap", "the notional exceeds the per-trade USD cap" },
        { "amount_precision", "the amount does not sit on the market amount precision" },
        { "price_precision", "the limit price does not sit on the market price precision" },
    };

    private static readonly List<string> KNOWN_STRATEGIES = new List<string>() { "dry_run", "sequential", "parallel_within_hop", "limit_protected", "best_effort", "atomic_ish" };

    //  the query keys forwarded to GET /route, in a fixed order so that two
    //  ports build a byte-identical URL
    private static readonly List<string> ROUTE_QUERY_KEYS = new List<string>() { "amountIn", "amountOut", "strategy", "maxVenues", "bridges", "exchanges", "balances", "balanceMode", "includeQuotes", "includeFees", "certified", "requireFullFill", "hopPenaltyBps", "minLegNotional" };

    //  defaults, mirrored as constants in every port
    public const string DefaultBaseUrl = "https://docs.ccxt.com/router/api";

    public const double DefaultTimeoutMs = 30000;

    public const double DefaultSlippageBps = 25;

    public const double DefaultReconcileTolerance = 0.02;

    //  How long retryFailedSteps waits before re-placing a step the venue rejected. A second
    //  is the shortest delay that lets a transient cause clear (a rate limit window, a
    //  momentary balance lag) without turning a retry budget into a burst against a venue that
    //  just said no.
    public const double DefaultRetryDelayMs = 1000;

    //  NoCap is the default: this class does not decide how much of your money you
    //  may trade. `maxNotionalUsd` is an OPT-IN guardrail — set it and it is honoured
    //  exactly, at whatever value you choose; leave it unset and no notional check runs
    //  at all.
    //
    //  It used to be a hard 25 USD ceiling that could be lowered but never raised. That
    //  number came from CLAUDE.md §5.5, which governs THIS REPOSITORY'S live tests
    //  against real exchanges — not the people using the library. A client that refuses
    //  a 30 USD order because its own test suite is cautious is broken as a product.
    public const double NoCap = 0;

    //  router-side caps on the `balances` query parameter; both REJECT rather
    //  than truncate server-side, so the client trims before sending
    public const int MaxBalanceEntries = 64;

    public const int MaxBalanceChars = 4096;

    //  How many executed plan ids the in-process idempotency ledger keeps. 1024 is
    //  chosen to be far more executions than any one process performs in the window
    //  where a duplicate is plausible (a retry loop, an operator re-running a plan, a
    //  redelivered message), while bounding the ledger to a few tens of kilobytes so a
    //  router held open for the life of a daemon cannot grow without limit.
    //
    //  THE TRADEOFF IS REAL AND IS NOT HIDDEN: eviction WEAKENS the guarantee. Once a
    //  plan id has been pushed out by 1024 newer executions, re-executing that plan is
    //  no longer refused in-process — it will be placed again, orders and all. The guard
    //  is therefore "recent duplicates are refused", not "duplicates are impossible". A
    //  process that needs the strong promise across restarts or beyond this window needs
    //  the durable ledger the Known gaps entry calls for; until then, callers whose plans
    //  must never re-execute should key idempotency at the venue themselves (a clientOrderId
    //  passed in options orderParams, on venues that honour one) rather than rely on this
    //  instance's memory.
    public const int MaxExecutedPlanIds = 1024;

    //  relative tolerance for float comparisons; also the tolerance the six
    //  test suites compare fixture numbers with
    public const double Tolerance = 1e-9;

    //  instance state, named the way the neighbouring hand-written Exchange
    //  properties are named
    public string apiKey { get; private set; }

    public string baseUrl { get; private set; }

    public double timeoutMs { get; private set; }

    public double maxNotionalUsd { get; private set; }

    //  in-process idempotency ledger: the identity of every plan this instance has
    //  already executed live. TWO structures for one ledger, in every port: a FIFO
    //  queue that fixes the eviction order, and a HashSet so the membership test is a
    //  hash lookup rather than a scan whose cost grows with the ledger. They are
    //  written and evicted together and must never disagree.
    public Queue<string> executedPlanIds { get; private set; }

    private HashSet<string> executedPlanIdSet { get; set; }

    private readonly HttpClient httpClient = new HttpClient();

    //  JavaScript is single threaded, so the reference mutates its report from
    //  concurrently pending legs for free. Parallel legs here really do resume
    //  on several thread-pool threads, so every write to the shared report goes
    //  through this lock.
    private readonly object reportLock = new object();

    /// <summary>
    /// Creates a client for the CCXT order-router service.
    /// </summary>
    /// <param name="config">
    /// apiKey (required, sent as the x-api-key header), baseUrl (defaults to
    /// https://docs.ccxt.com/router/api), timeoutMs (defaults to 30000) and
    /// maxNotionalUsd (an opt-in guardrail honoured exactly at whatever value
    /// you choose; omit it, or pass 0, for no cap).
    /// </param>
    public OrderRouter(dict config = null)
    {
        var key = this.StringAt(config, "apiKey", "");
        if (key == "")
        {
            throw new ArgumentsRequired("OrderRouter requires an apiKey");
        }
        this.apiKey = key;
        var url = this.StringAt(config, "baseUrl", DefaultBaseUrl);
        while (url.Length > 0 && url[url.Length - 1] == '/')
        {
            url = url.Substring(0, url.Length - 1);
        }
        this.baseUrl = url;
        this.timeoutMs = this.NumberAt(config, "timeoutMs", DefaultTimeoutMs);
        var configuredCap = this.NumberAt(config, "maxNotionalUsd", NoCap);
        if (configuredCap < 0)
        {
            //  a negative cap is a typo, not a policy, and silently ignoring it would
            //  leave the caller believing a guardrail is in place
            throw new BadRequest("OrderRouter maxNotionalUsd must not be negative; omit it, or pass 0, for no cap");
        }
        //  0 means NO CAP. Any positive value is honoured exactly — it is not clamped,
        //  because the caller is the one who knows the size of their own trade.
        this.maxNotionalUsd = configuredCap;
        this.executedPlanIds = new Queue<string>();
        this.executedPlanIdSet = new HashSet<string>();
    }

    //  -----------------------------------------------------------------------
    //  small container accessors. Every port has these; they exist so the six
    //  implementations read line for line and so a missing key is never a
    //  language-specific crash.
    //  -----------------------------------------------------------------------

    /// <summary>
    /// The price a step is sent at, derived from expectedPrice when the caller
    /// gave no limitPrice.
    /// </summary>
    public double StepLimitPrice(object step)
    {
        //  BuildExecutionPlan always sets limitPrice, but a HAND-BUILT plan need not: the manual
        //  documents it as optional, and the "execute your own plans" path is the whole point of
        //  Execute() taking a plan rather than a route. Reading it as 0 made every such plan fail
        //  three different ways - a blocking price_out_of_range from CheckExecutionPlanSafety, a
        //  rounded_to_zero before any strategy branch in PlaceStep, and a buy-side balance
        //  requirement of amount * 0 - so the documented example could not place one order.
        //  expectedPrice is the honest fallback: it is what the caller says the step is worth, and
        //  it is already guaranteed positive by the invalid_step guard. A caller wanting a tighter
        //  or looser bound sets limitPrice explicitly.
        var limitPrice = this.NumberAt(step, "limitPrice", 0);
        if (limitPrice > 0)
        {
            return limitPrice;
        }
        return this.NumberAt(step, "expectedPrice", 0);
    }

    /// <summary>
    /// The step's quote-side value, derived from amount and expectedPrice when
    /// absent.
    /// </summary>
    public double StepNotionalQuote(object step)
    {
        //  Same reasoning as StepLimitPrice, and the same formula BuildExecutionPlan uses. Read as
        //  0, a hand-built plan tripped the BLOCKING cost_below_minimum on every market declaring
        //  a minimum cost.
        var notionalQuote = this.NumberAt(step, "notionalQuote", 0);
        if (notionalQuote > 0)
        {
            return notionalQuote;
        }
        return this.NumberAt(step, "amount", 0) * this.NumberAt(step, "expectedPrice", 0);
    }

    /// <summary>Reads a raw field out of a container, or null when it is absent.</summary>
    public object ValueAt(object container, string key)
    {
        var mapping = this.AsDict(container);
        if (mapping == null)
        {
            return null;
        }
        object value = null;
        if (!mapping.TryGetValue(key, out value))
        {
            return null;
        }
        return value;
    }

    /// <summary>
    /// Reads a numeric field out of a container, with a default for missing,
    /// null and unparseable values.
    /// </summary>
    public double NumberAt(object container, string key, double defaultValue)
    {
        var value = this.ValueAt(container, key);
        if (value == null)
        {
            return defaultValue;
        }
        //  a boolean is NOT a number here, exactly as in the reference
        if (value is bool)
        {
            return defaultValue;
        }
        if (value is string)
        {
            return this.ParseNumber((string)value, defaultValue);
        }
        if (value is double || value is float || value is decimal || value is int || value is long || value is short || value is uint || value is ulong || value is ushort || value is byte || value is sbyte)
        {
            var number = Convert.ToDouble(value, CultureInfo.InvariantCulture);
            //  NaN and +/-Infinity are not numbers this class will act on. An
            //  infinite tolerance silently disables the halt verdict and an
            //  infinite rate silently disables the cap, and "the default" is the
            //  only answer six languages can agree on for either.
            if (!this.IsFiniteNumber(number))
            {
                return defaultValue;
            }
            return number;
        }
        return defaultValue;
    }

    /// <summary>
    /// Reports whether a double is a real number, i.e. neither NaN nor an
    /// infinity.
    /// </summary>
    public bool IsFiniteNumber(double value)
    {
        if (double.IsNaN(value))
        {
            //  the same test the other four ports spell `value != value`; C#
            //  warns on that form (CS1718), so it is spelled out here
            return false;
        }
        if (value > 1.7976931348623157e308 || value < -1.7976931348623157e308)
        {
            return false;
        }
        return true;
    }

    /// <summary>
    /// Reads a string field out of a container, with a default for missing and
    /// null values.
    /// </summary>
    public string StringAt(object container, string key, string defaultValue)
    {
        var value = this.ValueAt(container, key);
        if (value == null)
        {
            return defaultValue;
        }
        if (value is string)
        {
            return (string)value;
        }
        return defaultValue;
    }

    /// <summary>
    /// Reads a boolean field out of a container, with a default for missing and
    /// null values.
    /// </summary>
    public bool BoolAt(object container, string key, bool defaultValue)
    {
        var value = this.ValueAt(container, key);
        if (value == null)
        {
            return defaultValue;
        }
        if (value is bool)
        {
            return (bool)value;
        }
        return defaultValue;
    }

    /// <summary>
    /// Reads whether a field holds the boolean true and nothing else. The string
    /// "true" and the number 1 are NOT true — that distinction is what keeps a
    /// dry run a dry run.
    /// </summary>
    public bool IsExactlyTrue(object container, string key)
    {
        var value = this.ValueAt(container, key);
        return (value is bool) && ((bool)value);
    }

    /// <summary>
    /// Reads a list field out of a container, returning an empty list when
    /// absent. A list already stored as List&lt;object&gt; comes back BY
    /// REFERENCE, so writing through the result writes through to the container.
    /// </summary>
    public list ListAt(object container, string key)
    {
        return this.AsList(this.ValueAt(container, key));
    }

    /// <summary>
    /// Reads a nested dictionary out of a container, returning an empty
    /// dictionary when absent. A dictionary already stored as
    /// Dictionary&lt;string, object&gt; comes back BY REFERENCE.
    /// </summary>
    public dict DictAt(object container, string key)
    {
        var nested = this.AsDict(this.ValueAt(container, key));
        if (nested == null)
        {
            return new dict();
        }
        return nested;
    }

    /// <summary>
    /// Views a value as a dictionary, or null when it is not one. Returns the
    /// same instance whenever it already is a Dictionary&lt;string, object&gt;.
    /// </summary>
    public dict AsDict(object value)
    {
        if (value == null)
        {
            return null;
        }
        if (value is dict)
        {
            return (dict)value;
        }
        if (value is IDictionary<string, object>)
        {
            var copy = new dict();
            foreach (var entry in (IDictionary<string, object>)value)
            {
                copy[entry.Key] = entry.Value;
            }
            return copy;
        }
        return null;
    }

    /// <summary>
    /// Views a value as a list, or an empty list when it is not one. Returns the
    /// same instance whenever it already is a List&lt;object&gt;.
    /// </summary>
    public list AsList(object value)
    {
        if (value == null)
        {
            return new list();
        }
        if (value is list)
        {
            return (list)value;
        }
        if ((value is IEnumerable) && !(value is string) && !(value is IDictionary<string, object>))
        {
            var copy = new list();
            foreach (var item in (IEnumerable)value)
            {
                copy.Add(item);
            }
            return copy;
        }
        return new list();
    }

    /// <summary>
    /// Parses a number the way JavaScript's parseFloat does: the longest numeric
    /// prefix of the trimmed text, and the default when there is not one.
    /// </summary>
    public double ParseNumber(string text, double defaultValue)
    {
        //  Hand-rolled rather than delegated to double.TryParse alone, because
        //  every language's own parser disagrees with the other four somewhere:
        //  Python reads '1_000' as 1000 and '1,234.5' not at all, PHP's and Go's
        //  \s is not JavaScript's whitespace set, string.Trim() removes Unicode
        //  whitespace JavaScript's parseFloat does not. The grammar below is
        //  JavaScript's StrDecimalLiteral prefix over the ASCII whitespace set,
        //  and it is the SAME twenty lines in all six ports.
        if (text == null)
        {
            return defaultValue;
        }
        var cursor = 0;
        while (cursor < text.Length && this.IsRouterSpace(text[cursor]))
        {
            cursor = cursor + 1;
        }
        var start = cursor;
        if (cursor < text.Length && (text[cursor] == '+' || text[cursor] == '-'))
        {
            cursor = cursor + 1;
        }
        var digits = 0;
        while (cursor < text.Length && text[cursor] >= '0' && text[cursor] <= '9')
        {
            cursor = cursor + 1;
            digits = digits + 1;
        }
        if (cursor < text.Length && text[cursor] == '.')
        {
            cursor = cursor + 1;
            while (cursor < text.Length && text[cursor] >= '0' && text[cursor] <= '9')
            {
                cursor = cursor + 1;
                digits = digits + 1;
            }
        }
        if (digits == 0)
        {
            //  "Infinity", "inf", "NaN", "" and a string of Arabic-Indic digits
            //  all land here, in all six
            return defaultValue;
        }
        var end = cursor;
        if (cursor < text.Length && (text[cursor] == 'e' || text[cursor] == 'E'))
        {
            var exponent = cursor + 1;
            if (exponent < text.Length && (text[exponent] == '+' || text[exponent] == '-'))
            {
                exponent = exponent + 1;
            }
            var exponentDigits = 0;
            while (exponent < text.Length && text[exponent] >= '0' && text[exponent] <= '9')
            {
                exponent = exponent + 1;
                exponentDigits = exponentDigits + 1;
            }
            if (exponentDigits > 0)
            {
                //  a trailing 'e' with no digits is not part of the number: JS
                //  reads "1e" as 1, and so does every port here
                end = exponent;
            }
        }
        double parsed = 0;
        if (!double.TryParse(text.Substring(start, end - start), NumberStyles.Float, CultureInfo.InvariantCulture, out parsed))
        {
            return defaultValue;
        }
        if (!this.IsFiniteNumber(parsed))
        {
            //  "1e400" overflows to an infinity, which is not a number the cap or
            //  the tolerance may be built out of
            return defaultValue;
        }
        return parsed;
    }

    /// <summary>
    /// Reports whether a character is one of the six ASCII spaces the number
    /// grammar skips. Deliberately NOT char.IsWhiteSpace: Python, PHP, C# and Go
    /// each draw the Unicode line in a different place, and a non-breaking space
    /// that parses in one language and not the others is drift.
    /// </summary>
    public bool IsRouterSpace(char character)
    {
        return (character == ' ') || (character == '\t') || (character == '\n') || (character == '\r') || (character == '\f') || (character == '\v');
    }

    /// <summary>
    /// Formats a double as decimal text with no exponent, so that six languages
    /// produce the same string.
    /// </summary>
    public string FormatNumber(double value)
    {
        //  JavaScript prints 1e-7 where Python prints 1e-07 and Go prints 1e-07;
        //  a fixed 12-decimal rendering with the trailing zeros trimmed is the
        //  one spelling all six languages agree on for the magnitudes a balance
        //  or an amount can take.
        if (double.IsNaN(value) || double.IsInfinity(value))
        {
            return "0";
        }
        if (Math.Abs(value) >= 1e18)
        {
            //  JavaScript's toFixed switches to exponent notation at 1e21 while
            //  the other five languages never do. Rather than let one language
            //  send a different string than the others, refuse — loudly, and at
            //  a magnitude no real amount reaches.
            throw new BadRequest("OrderRouter: a number this large cannot be rendered identically in all six languages");
        }
        var text = ToFixed12(value);
        if (text.IndexOf('.') >= 0)
        {
            while (text.Length > 0 && text[text.Length - 1] == '0')
            {
                text = text.Substring(0, text.Length - 1);
            }
            if (text.Length > 0 && text[text.Length - 1] == '.')
            {
                text = text.Substring(0, text.Length - 1);
            }
        }
        if (text == "" || text == "-" || text == "-0")
        {
            return "0";
        }
        return text;
    }

    /// <summary>
    /// Renders a finite double with exactly twelve decimals, from the exact binary value and
    /// under JavaScript's toFixed tie rule.
    ///
    /// The reference is TypeScript, and TypeScript's toFixed is ECMA-262's: the sign is
    /// stripped BEFORE the digits are chosen, so a tie rounds AWAY FROM ZERO on the magnitude
    /// and (-0.0001220703125).toFixed(12) is -0.000122070313, not -...312. ToString("F12")
    /// rounds half to EVEN and would answer ...312, so the balances query string this feeds
    /// would differ per language on every value landing exactly on a half tick — 2^-13
    /// included. The bits are read directly rather than through any ToString, because on .NET
    /// Framework a high-precision "F" format is capped at fifteen significant digits and would
    /// not carry the exact expansion this decides on.
    /// </summary>
    public static string ToFixed12(double value)
    {
        var bits = BitConverter.DoubleToInt64Bits(value);
        var negative = bits < 0;
        var exponent = (int)((bits >> 52) & 0x7FFL);
        var mantissa = bits & 0xFFFFFFFFFFFFFL;
        if (exponent == 0)
        {
            //  subnormal: no implicit leading bit, and the exponent is the same as 1
            exponent = 1;
        }
        else
        {
            mantissa = mantissa | (1L << 52);
        }
        //  |value| == mantissa * 2^(exponent - 1075)
        exponent = exponent - 1075;
        var numerator = new BigInteger(mantissa) * BigInteger.Pow(10, 12);
        var denominator = BigInteger.One;
        if (exponent > 0)
        {
            numerator = numerator << exponent;
        }
        else
        {
            denominator = BigInteger.One << (-exponent);
        }
        BigInteger remainder;
        var quotient = BigInteger.DivRem(numerator, denominator, out remainder);
        if (remainder * 2 >= denominator)
        {
            quotient = quotient + BigInteger.One;
        }
        var digits = quotient.ToString(CultureInfo.InvariantCulture);
        while (digits.Length < 13)
        {
            digits = "0" + digits;
        }
        var sign = negative ? "-" : "";
        return sign + digits.Substring(0, digits.Length - 12) + "." + digits.Substring(digits.Length - 12);
    }

    /// <summary>
    /// Percent-encodes exactly the characters JavaScript's encodeURIComponent
    /// encodes. Uri.EscapeDataString also escapes ! ' ( ) *, which would make
    /// this port send a different URL than the other four.
    /// </summary>
    public static string EncodeUriComponent(string value)
    {
        if (value == null)
        {
            return "";
        }
        var builder = new StringBuilder();
        var bytes = Encoding.UTF8.GetBytes(value);
        for (var i = 0; i < bytes.Length; i++)
        {
            var b = bytes[i];
            var c = (char)b;
            var unreserved = (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-' || c == '_' || c == '.' || c == '!' || c == '~' || c == '*' || c == '\'' || c == '(' || c == ')';
            if (unreserved)
            {
                builder.Append(c);
            }
            else
            {
                builder.Append('%');
                builder.Append(b.ToString("X2", CultureInfo.InvariantCulture));
            }
        }
        return builder.ToString();
    }

    /// <summary>
    /// Renders one query value: booleans as true/false, numbers through
    /// FormatNumber, lists comma-joined, everything else as its own text.
    /// </summary>
    public string QueryText(object value)
    {
        if (value == null)
        {
            return "";
        }
        if (value is bool)
        {
            return ((bool)value) ? "true" : "false";
        }
        if (value is string)
        {
            return (string)value;
        }
        if ((value is IEnumerable) && !(value is IDictionary<string, object>))
        {
            var items = this.AsList(value);
            var text = "";
            for (var i = 0; i < items.Count; i++)
            {
                if (i > 0)
                {
                    text = text + ",";
                }
                text = text + this.QueryText(items[i]);
            }
            return text;
        }
        if (value is double || value is float || value is decimal || value is int || value is long || value is short || value is uint || value is ulong || value is ushort || value is byte || value is sbyte)
        {
            return this.FormatNumber(Convert.ToDouble(value, CultureInfo.InvariantCulture));
        }
        return Convert.ToString(value, CultureInfo.InvariantCulture);
    }

    //  -----------------------------------------------------------------------
    //  I/O: the router HTTP client
    //  -----------------------------------------------------------------------

    /// <summary>
    /// Asks the router how to convert one asset into another, over the venues
    /// and bridges it has live books for.
    /// </summary>
    /// <param name="fromAsset">the asset being spent, e.g. USDT</param>
    /// <param name="toAsset">the asset being acquired, e.g. BTC</param>
    /// <param name="parameters">
    /// exactly one of amountIn or amountOut, plus any of strategy, maxVenues,
    /// exchanges, bridges, balances, balanceMode, includeQuotes, includeFees,
    /// certified, requireFullFill, hopPenaltyBps and minLegNotional.
    /// </param>
    /// <returns>
    /// a RouteResult — an unroutable pair comes back as a RouteResult with an
    /// unroutableReason, not as an exception.
    /// </returns>
    public async Task<dict> FetchRoute(string fromAsset, string toAsset, dict parameters = null)
    {
        if (fromAsset == null || toAsset == null || fromAsset == "" || toAsset == "")
        {
            throw new ArgumentsRequired("fetchRoute requires fromAsset and toAsset");
        }
        var hasAmountIn = this.ValueAt(parameters, "amountIn") != null;
        var hasAmountOut = this.ValueAt(parameters, "amountOut") != null;
        if (hasAmountIn == hasAmountOut)
        {
            //  refused client-side for the same reason the router refuses it: a
            //  typo must not become a confidently wrong route
            throw new BadRequest("fetchRoute requires exactly one of amountIn or amountOut");
        }
        var query = "from=" + EncodeUriComponent(fromAsset.ToUpperInvariant()) + "&to=" + EncodeUriComponent(toAsset.ToUpperInvariant());
        for (var i = 0; i < ROUTE_QUERY_KEYS.Count; i++)
        {
            var key = ROUTE_QUERY_KEYS[i];
            var value = this.ValueAt(parameters, key);
            if (value == null)
            {
                continue;
            }
            query = query + "&" + key + "=" + EncodeUriComponent(this.QueryText(value));
        }
        var url = this.baseUrl + "/route?" + query;
        var route = await this.Request(url);
        //  Stamp the client's OWN record of the question onto the answer, so BuildExecutionPlan
        //  can check that the route it is about to turn into real orders runs from the asset the
        //  caller offered to the asset the caller wanted — rather than trusting the server's echo.
        route["clientRequestedFrom"] = fromAsset.ToUpperInvariant();
        route["clientRequestedTo"] = toAsset.ToUpperInvariant();
        return route;
    }

    /// <summary>
    /// Performs the authenticated GET and maps router status codes onto CCXT
    /// exceptions. Virtual so a test can drive the parsing without a network.
    /// </summary>
    /// <param name="url">the fully-formed url including the query string</param>
    /// <returns>the decoded JSON body</returns>
    public virtual async Task<dict> Request(string url)
    {
        var status = 0;
        var text = "";
        try
        {
            using (var cancellation = new CancellationTokenSource(TimeSpan.FromMilliseconds(this.timeoutMs)))
            {
                using (var message = new HttpRequestMessage(HttpMethod.Get, url))
                {
                    message.Headers.TryAddWithoutValidation("x-api-key", this.apiKey);
                    message.Headers.TryAddWithoutValidation("Accept", "application/json");
                    var response = await this.httpClient.SendAsync(message, cancellation.Token);
                    status = (int)response.StatusCode;
                    text = await response.Content.ReadAsStringAsync();
                }
            }
        }
        catch (OperationCanceledException)
        {
            //  a cancelled HttpClient send surfaces as TaskCanceledException,
            //  which derives from OperationCanceledException in every runtime
            throw new RequestTimeout("OrderRouter request timed out after " + this.FormatNumber(this.timeoutMs) + "ms");
        }
        catch (Exception e)
        {
            throw new ExchangeNotAvailable("OrderRouter request failed: " + e.Message);
        }
        dict body = null;
        try
        {
            body = this.AsDict(JsonHelper.Deserialize(text));
        }
        catch (Exception)
        {
            body = null;
        }
        if (body == null)
        {
            throw new ExchangeError("OrderRouter returned a non-JSON body");
        }
        if (status >= 200 && status < 300)
        {
            return body;
        }
        //  404 and 501 carry a complete RouteResult explaining the refusal —
        //  `no_market` and `exact_out_multi_hop_unsupported` are routing
        //  outcomes, and turning them into exceptions would make the caller
        //  parse an error string to recover a structure it already has
        if ((status == 404 || status == 501) && (this.StringAt(body, "unroutableReason", "") != ""))
        {
            return body;
        }
        var message2 = this.StringAt(body, "error", "http status " + status.ToString(CultureInfo.InvariantCulture));
        if (status == 400)
        {
            throw new BadRequest("OrderRouter: " + message2);
        }
        if (status == 401 || status == 403)
        {
            throw new AuthenticationError("OrderRouter: " + message2);
        }
        if (status == 429)
        {
            throw new RateLimitExceeded("OrderRouter: " + message2);
        }
        if (status == 408 || status == 504)
        {
            throw new RequestTimeout("OrderRouter: " + message2);
        }
        throw new ExchangeError("OrderRouter: " + message2);
    }

    /// <summary>
    /// Reads the live balances of the supplied venues, sends them to the router,
    /// and returns a route you can actually fund.
    /// </summary>
    /// <param name="fromAsset">the asset being spent</param>
    /// <param name="toAsset">the asset being acquired</param>
    /// <param name="venues">exchangeId to a ccxt exchange instance</param>
    /// <param name="parameters">
    /// the same parameters FetchRoute accepts, minus balances which this method
    /// builds. requireBalancesApplied (default true) throws when the router did
    /// not echo balancesApplied.
    /// </param>
    /// <returns>
    /// the RouteResult, with the client-side keys balancesUsed and
    /// balancesDropped added.
    /// </returns>
    // FetchBalance returns the TYPED Balances, not the raw dictionary every other port gets from
    // its own fetchBalance. Reading it with AsDict yields an empty dictionary — the venue looks
    // like it holds nothing, silently, and balance-aware routing quietly stops working. The
    // conversion lives here so both callers share one shape and one place to update if the typed
    // model gains a field.
    public dict BalancesAsDict(ccxt.Balances balances)
    {
        var free = new dict();
        if (balances.free != null)
        {
            foreach (var entry in balances.free)
            {
                if (entry.Value != null)
                {
                    free[entry.Key] = entry.Value;
                }
            }
        }
        var total = new dict();
        if (balances.total != null)
        {
            foreach (var entry in balances.total)
            {
                if (entry.Value != null)
                {
                    total[entry.Key] = entry.Value;
                }
            }
        }
        return new dict() { { "free", free }, { "total", total } };
    }

    public async Task<dict> FetchRouteWithBalances(string fromAsset, string toAsset, Dictionary<string, Exchange> venues, dict parameters = null)
    {
        var requireApplied = this.BoolAt(parameters, "requireBalancesApplied", true);
        var exchangeIds = this.SortedKeys(venues);
        var entries = new list();
        var dropped = new list();
        for (var i = 0; i < exchangeIds.Count; i++)
        {
            var exchangeId = exchangeIds[i];
            var venue = venues[exchangeId];
            var balance = this.BalancesAsDict(await venue.FetchBalance());
            var holdings = this.DictAt(balance, "free");
            if (holdings.Count == 0)
            {
                holdings = this.DictAt(balance, "total");
            }
            var codes = this.SortedKeys(holdings);
            for (var j = 0; j < codes.Count; j++)
            {
                var code = codes[j];
                var amount = this.NumberAt(holdings, code, 0);
                if (amount <= 0)
                {
                    //  a zero holding is not information, and it costs one of
                    //  the router's 64 entries
                    continue;
                }
                if (amount >= 1e18)
                {
                    //  beyond fixed-point rendering; reported rather than sent,
                    //  because a silently reshaped amount is worse than a
                    //  missing one
                    dropped.Add(new dict() { { "exchangeId", exchangeId }, { "asset", code }, { "amount", amount }, { "reason", "amount_out_of_range" } });
                    continue;
                }
                entries.Add(new dict() { { "exchangeId", exchangeId }, { "asset", code }, { "amount", amount } });
            }
        }
        //  largest first, so trimming to the router's caps drops the smallest
        //  holdings. Ties break on exchangeId then asset so six languages
        //  produce the same list from the same wallet.
        entries.Sort(this.CompareBalanceEntries);
        while (entries.Count > MaxBalanceEntries)
        {
            var removed = this.AsDict(entries[entries.Count - 1]);
            entries.RemoveAt(entries.Count - 1);
            removed["reason"] = "entry_cap";
            dropped.Add(removed);
        }
        var balances = this.JoinBalances(entries);
        while (balances.Length > MaxBalanceChars && entries.Count > 0)
        {
            var removed = this.AsDict(entries[entries.Count - 1]);
            entries.RemoveAt(entries.Count - 1);
            removed["reason"] = "char_cap";
            dropped.Add(removed);
            balances = this.JoinBalances(entries);
        }
        var routeParams = new dict();
        if (parameters != null)
        {
            foreach (var entry in parameters)
            {
                routeParams[entry.Key] = entry.Value;
            }
        }
        routeParams["balances"] = balances;
        var route = await this.FetchRoute(fromAsset, toAsset, routeParams);
        if (requireApplied && (balances != ""))
        {
            //  /route declares its query without a JSON schema, so a router that
            //  predates the balances feature answers byte-identically to one
            //  that never received it. Executing a plan computed against a
            //  portfolio the server never saw is the case worth failing on.
            if (this.StringAt(route, "balancesApplied", "") == "")
            {
                throw new ExchangeError("OrderRouter did not echo balancesApplied: the balances were ignored, so this route is not funded-aware");
            }
        }
        route["balancesUsed"] = balances;
        route["balancesDropped"] = dropped;
        return route;
    }

    /// <summary>
    /// Orders balance entries largest first, then by exchangeId, then by asset,
    /// comparing strings by code unit so six languages agree on the order.
    /// </summary>
    public int CompareBalanceEntries(object first, object second)
    {
        var a = this.AsDict(first);
        var b = this.AsDict(second);
        var amountA = this.NumberAt(a, "amount", 0);
        var amountB = this.NumberAt(b, "amount", 0);
        if (amountA != amountB)
        {
            return (amountA > amountB) ? -1 : 1;
        }
        var byExchange = string.CompareOrdinal(this.StringAt(a, "exchangeId", ""), this.StringAt(b, "exchangeId", ""));
        if (byExchange != 0)
        {
            return byExchange;
        }
        return string.CompareOrdinal(this.StringAt(a, "asset", ""), this.StringAt(b, "asset", ""));
    }

    /// <summary>
    /// Renders balance entries as the router's [exchangeId.]ASSET:amount
    /// comma-separated form.
    /// </summary>
    public string JoinBalances(list entries)
    {
        var text = "";
        for (var i = 0; i < entries.Count; i++)
        {
            var entry = this.AsDict(entries[i]);
            if (i > 0)
            {
                text = text + ",";
            }
            text = text + this.StringAt(entry, "exchangeId", "") + "." + this.StringAt(entry, "asset", "") + ":" + this.FormatNumber(this.NumberAt(entry, "amount", 0));
        }
        return text;
    }

    //  -----------------------------------------------------------------------
    //  PURE: BuildExecutionPlan
    //  -----------------------------------------------------------------------

    /// <summary>
    /// Flattens a RouteResult's hops and legs into a flat, ordered list of
    /// orders to place. PURE — no I/O, and the same input produces the same
    /// output in all six languages.
    /// </summary>
    /// <param name="route">a RouteResult as returned by FetchRoute</param>
    /// <param name="options">
    /// slippageBps (default 25) sets how far the limit price is placed past the
    /// expected price; reconcileToleranceRatio (default 0.02) is the shortfall
    /// ratio ReconcileExecutionStep halts on.
    /// </param>
    /// <returns>
    /// an execution plan whose steps carry stepIndex, hopIndex, legIndex,
    /// exchangeId, symbol, side, amount, expectedPrice, limitPrice and
    /// notionalQuote.
    /// </returns>
    /// <summary>
    /// Refuses a route whose hops do not connect, or that does not run from the asset the caller
    /// offered to the asset the caller wanted. BuildExecutionPlan used to copy from, to, pair and
    /// side straight out of the server's JSON, and the safety checks only tested internal
    /// consistency against whatever market that named — so a compromised or simply buggy router
    /// response could steer real orders into any real market and every check would pass it.
    /// </summary>
    public void AssertRouteChainIsCoherent(dict route, list hops)
    {
        if (hops.Count == 0)
        {
            return;
        }
        var carried = "";
        for (var i = 0; i < hops.Count; i++)
        {
            var hop = this.AsDict(hops[i]);
            var side = this.StringAt(hop, "side", "").ToLower();
            var baseCode = this.StringAt(hop, "base", "").ToUpper();
            var quote = this.StringAt(hop, "quote", "").ToUpper();
            if (baseCode == "" || quote == "" || (side != "buy" && side != "sell"))
            {
                throw new ExchangeError("OrderRouter: hop " + i.ToString() + " does not name a market and a side");
            }
            //  a buy spends the quote to acquire the base; a sell is the reverse
            var spends = (side == "buy") ? quote : baseCode;
            var produces = (side == "buy") ? baseCode : quote;
            if (i > 0 && spends != carried)
            {
                //  hop N+1 must spend exactly what hop N produced, or the plan strands the
                //  proceeds of one order and funds the next from a wallet nobody checked
                throw new ExchangeError("OrderRouter: hop " + i.ToString() + " spends " + spends + " but the previous hop produced " + carried);
            }
            if (i == 0)
            {
                var requestedFrom = this.StringAt(route, "clientRequestedFrom", "");
                if (requestedFrom != "" && spends != requestedFrom)
                {
                    throw new ExchangeError("OrderRouter: the route spends " + spends + ", not the requested " + requestedFrom);
                }
            }
            carried = produces;
        }
        var requestedTo = this.StringAt(route, "clientRequestedTo", "");
        if (requestedTo != "" && carried != requestedTo)
        {
            throw new ExchangeError("OrderRouter: the route produces " + carried + ", not the requested " + requestedTo);
        }
    }

    /// <summary>
    /// Sums the fees an order charged in one asset, ignoring any other currency. ccxt reports the
    /// same cut in up to three places, so this is a strict THREE-TIER PRECEDENCE and never a sum
    /// across tiers: the `fees` list wins outright; if it named no entry in this asset, the single
    /// `fee` is read; only if that named nothing either are the per-trade fees totalled. `sawInList`
    /// is what makes each tier exclusive of the ones below it — safeOrder fills `fee` and `fees`
    /// from the same charge, and the per-trade fees are usually that same charge again, so adding
    /// tiers together would double- or triple-count. Within ONE tier every matching entry IS summed.
    /// </summary>
    public double OrderFeeInAsset(dict order, string asset)
    {
        if (asset == "")
        {
            return 0;
        }
        double total = 0;
        var fees = this.ListAt(order, "fees");
        var sawInList = false;
        for (var i = 0; i < fees.Count; i++)
        {
            var entry = this.AsDict(fees[i]);
            if (this.StringAt(entry, "currency", "").ToUpper() == asset.ToUpper())
            {
                total = total + this.NumberAt(entry, "cost", 0);
                sawInList = true;
            }
        }
        if (!sawInList)
        {
            var single = this.DictAt(order, "fee");
            if (this.StringAt(single, "currency", "").ToUpper() == asset.ToUpper())
            {
                total = total + this.NumberAt(single, "cost", 0);
                sawInList = true;
            }
        }
        if (!sawInList)
        {
            //  Last resort: a venue that reports its cut only per trade. The Go port has no
            //  `fees` list on its typed Order at all, so this fallback is what lets all six
            //  ports read the same fee off the same order — and reading NOTHING here is the
            //  dangerous direction, not the safe one: an unread fee leaves outAmount GROSS,
            //  which sizes the next hop on money the venue already took.
            var trades = this.ListAt(order, "trades");
            for (var i = 0; i < trades.Count; i++)
            {
                var tradeFee = this.DictAt(trades[i], "fee");
                if (this.StringAt(tradeFee, "currency", "").ToUpper() == asset.ToUpper())
                {
                    total = total + this.NumberAt(tradeFee, "cost", 0);
                }
            }
        }
        if (!this.IsFiniteNumber(total) || total < 0)
        {
            return 0;
        }
        return total;
    }

    public dict BuildExecutionPlan(dict route, dict options = null)
    {
        var slippageBps = this.NumberAt(options, "slippageBps", DefaultSlippageBps);
        var tolerance = this.NumberAt(options, "reconcileToleranceRatio", DefaultReconcileTolerance);
        var hops = this.ListAt(route, "hops");
        this.AssertRouteChainIsCoherent(route, hops);
        var steps = new list();
        var stepIndex = 0;
        for (var hopIndex = 0; hopIndex < hops.Count; hopIndex++)
        {
            var hop = this.AsDict(hops[hopIndex]);
            var symbol = this.StringAt(hop, "pair", "");
            var side = this.StringAt(hop, "side", "");
            var baseCode = this.StringAt(hop, "base", "");
            var quote = this.StringAt(hop, "quote", "");
            var legs = this.ListAt(hop, "legs");
            for (var legIndex = 0; legIndex < legs.Count; legIndex++)
            {
                var leg = this.AsDict(legs[legIndex]);
                //  leg amounts are always in BASE units, on both sides of the
                //  market — see the router's RoutingQuote.filledAmount contract
                var amount = this.NumberAt(leg, "amount", 0);
                var expectedPrice = this.NumberAt(leg, "averagePrice", 0);
                var effectivePrice = this.NumberAt(leg, "effectivePrice", expectedPrice);
                //  the limit sits on the side that costs you: above for a buy,
                //  below for a sell
                double limitPrice = 0;
                if (side == "buy")
                {
                    limitPrice = expectedPrice * (1 + slippageBps / 10000);
                }
                else
                {
                    limitPrice = expectedPrice * (1 - slippageBps / 10000);
                }
                steps.Add(new dict()
                {
                    { "stepIndex", stepIndex },
                    { "hopIndex", hopIndex },
                    { "legIndex", legIndex },
                    { "exchangeId", this.StringAt(leg, "exchangeId", "") },
                    { "symbol", symbol },
                    { "side", side },
                    { "base", baseCode },
                    { "quote", quote },
                    { "amount", amount },
                    { "expectedPrice", expectedPrice },
                    { "effectivePrice", effectivePrice },
                    { "limitPrice", limitPrice },
                    { "notionalQuote", amount * expectedPrice },
                });
                stepIndex = stepIndex + 1;
            }
        }
        return new dict()
        {
            { "requestId", this.StringAt(route, "requestId", "") },
            { "calculatedAt", this.NumberAt(route, "calculatedAt", 0) },
            { "from", this.StringAt(route, "from", "") },
            { "to", this.StringAt(route, "to", "") },
            { "routingStrategy", this.StringAt(route, "strategy", "") },
            { "exactSide", this.StringAt(route, "exactSide", "") },
            { "amountIn", this.NumberAt(route, "amountIn", 0) },
            { "amountOut", this.NumberAt(route, "amountOut", 0) },
            { "fullyFillable", this.BoolAt(route, "fullyFillable", false) },
            { "fillRatio", this.NumberAt(route, "fillRatio", 0) },
            { "unroutableReason", this.StringAt(route, "unroutableReason", "") },
            { "hopCount", hops.Count },
            { "stepCount", steps.Count },
            { "slippageBps", slippageBps },
            { "reconcileToleranceRatio", tolerance },
            { "steps", steps },
        };
    }

    //  -----------------------------------------------------------------------
    //  PURE: CheckExecutionPlanSafety
    //  -----------------------------------------------------------------------

    /// <summary>
    /// Checks a plan against per-venue market rules and, when one is set, the
    /// per-trade USD notional cap. PURE — no I/O. A step that cannot be valued
    /// in USD BLOCKS while a cap is in force; it is never skipped, because a cap
    /// that silently disappears when a rate is missing is not a cap.
    /// </summary>
    /// <param name="plan">a plan from BuildExecutionPlan, or a caller-assembled plan of the same shape — this method never assumes the plan came from the routing service</param>
    /// <param name="markets">exchangeId to that exchange's markets, i.e. markets[exchangeId][symbol]</param>
    /// <param name="options">
    /// usdRates maps a currency code to its USD price (USD itself is 1
    /// implicitly and nothing else is assumed); maxNotionalUsd is the per-trade
    /// cap, honoured exactly as given and 0 for no cap; precisionMode is
    /// tick_size (default) or decimal_places.
    /// </param>
    /// <returns>
    /// the violations, each with stepIndex, code, blocking, actual, limit and a
    /// constant message. An empty list means the plan passed.
    /// </returns>
    public List<dict> CheckExecutionPlanSafety(dict plan, dict markets, dict options = null)
    {
        var violations = new List<dict>();
        //  Honoured exactly as given, per call or per client. No clamping: a caller
        //  trading thousands and a caller trading cents are both using this correctly.
        var cap = this.NumberAt(options, "maxNotionalUsd", this.maxNotionalUsd);
        var capInForce = cap > 0;
        var usdRates = this.DictAt(options, "usdRates");
        var precisionMode = this.StringAt(options, "precisionMode", "tick_size");
        var steps = this.ListAt(plan, "steps");
        if (steps.Count == 0)
        {
            //  an empty plan passing an empty violation list would read as "safe"
            violations.Add(this.Violation(-1, "", "", "empty_plan", true, 0, 0));
            return violations;
        }
        var unroutableReason = this.StringAt(plan, "unroutableReason", "");
        if (unroutableReason != "")
        {
            violations.Add(this.Violation(-1, "", "", "route_unroutable", true, 0, 0));
        }
        if (!this.BoolAt(plan, "fullyFillable", false))
        {
            violations.Add(this.Violation(-1, "", "", "partial_fill", false, this.NumberAt(plan, "fillRatio", 0), 1));
        }
        for (var i = 0; i < steps.Count; i++)
        {
            var step = this.AsDict(steps[i]);
            var stepIndex = this.NumberAt(step, "stepIndex", i);
            var exchangeId = this.StringAt(step, "exchangeId", "");
            var symbol = this.StringAt(step, "symbol", "");
            var amount = this.NumberAt(step, "amount", 0);
            var expectedPrice = this.NumberAt(step, "expectedPrice", 0);
            var limitPrice = this.StepLimitPrice(step);
            var notionalQuote = this.StepNotionalQuote(step);
            var side = this.StringAt(step, "side", "");
            if (amount <= 0 || expectedPrice <= 0 || (side != "buy" && side != "sell"))
            {
                violations.Add(this.Violation(stepIndex, exchangeId, symbol, "invalid_step", true, amount, 0));
                continue;
            }
            var venueMarkets = this.DictAt(markets, exchangeId);
            var market = this.DictAt(venueMarkets, symbol);
            if (market.Count == 0)
            {
                violations.Add(this.Violation(stepIndex, exchangeId, symbol, "unknown_symbol", true, 0, 0));
                continue;
            }
            //  the same symbol string on a different venue is not necessarily
            //  the same pair, and the USD valuation below trusts the step's
            //  quote currency — so disagreement is fatal, not cosmetic
            var marketBase = this.StringAt(market, "base", "");
            var marketQuote = this.StringAt(market, "quote", "");
            var stepBase = this.StringAt(step, "base", "");
            var stepQuote = this.StringAt(step, "quote", "");
            if ((marketBase != "" && stepBase != "" && marketBase != stepBase) || (marketQuote != "" && stepQuote != "" && marketQuote != stepQuote))
            {
                violations.Add(this.Violation(stepIndex, exchangeId, symbol, "market_mismatch", true, 0, 0));
                continue;
            }
            var limits = this.DictAt(market, "limits");
            var amountLimits = this.DictAt(limits, "amount");
            var priceLimits = this.DictAt(limits, "price");
            var costLimits = this.DictAt(limits, "cost");
            var minAmount = this.NumberAt(amountLimits, "min", 0);
            var maxAmount = this.NumberAt(amountLimits, "max", 0);
            var minPrice = this.NumberAt(priceLimits, "min", 0);
            var maxPrice = this.NumberAt(priceLimits, "max", 0);
            var minCost = this.NumberAt(costLimits, "min", 0);
            if (minAmount > 0 && amount < minAmount)
            {
                violations.Add(this.Violation(stepIndex, exchangeId, symbol, "amount_below_minimum", true, amount, minAmount));
            }
            if (maxAmount > 0 && amount > maxAmount)
            {
                violations.Add(this.Violation(stepIndex, exchangeId, symbol, "amount_above_maximum", true, amount, maxAmount));
            }
            if (minCost > 0 && notionalQuote < minCost)
            {
                violations.Add(this.Violation(stepIndex, exchangeId, symbol, "cost_below_minimum", true, notionalQuote, minCost));
            }
            if ((minPrice > 0 && limitPrice < minPrice) || (maxPrice > 0 && limitPrice > maxPrice))
            {
                violations.Add(this.Violation(stepIndex, exchangeId, symbol, "price_out_of_range", true, limitPrice, (limitPrice < minPrice) ? minPrice : maxPrice));
            }
            var precision = this.DictAt(market, "precision");
            var amountPrecision = this.NumberAt(precision, "amount", 0);
            var pricePrecision = this.NumberAt(precision, "price", 0);
            //  precision findings are advisory: Execute snaps through the
            //  venue's own amountToPrecision/priceToPrecision before sending
            if (this.PrecisionViolated(amount, amountPrecision, precisionMode))
            {
                violations.Add(this.Violation(stepIndex, exchangeId, symbol, "amount_precision", false, amount, amountPrecision));
            }
            if (this.PrecisionViolated(limitPrice, pricePrecision, precisionMode))
            {
                violations.Add(this.Violation(stepIndex, exchangeId, symbol, "price_precision", false, limitPrice, pricePrecision));
            }
            //  the notional cap. The worst case is the higher of the expected
            //  and the limit price, which is the buy side; a sell's limit sits
            //  below, so its expected price is the one that governs.
            var worstPrice = expectedPrice;
            if (limitPrice > worstPrice)
            {
                worstPrice = limitPrice;
            }
            if (capInForce)
            {
                //  Only when a cap is actually set. With no cap there is nothing to
                //  enforce, so a missing USD rate is not an error and the caller is
                //  not made to supply usdRates for a check they did not ask for.
                var worstNotional = amount * worstPrice;
                var usdValue = this.NotionalUsd(step, worstNotional, usdRates);
                if (usdValue <= 0)
                {
                    //  BLOCKING, and deliberately so. Skipping the cap for a step
                    //  whose USD value is unknown defeats the cap the caller DID
                    //  ask for.
                    violations.Add(this.Violation(stepIndex, exchangeId, symbol, "notional_unvaluable", true, worstNotional, cap));
                }
                else if (usdValue > cap * (1 + Tolerance))
                {
                    violations.Add(this.Violation(stepIndex, exchangeId, symbol, "notional_exceeds_cap", true, usdValue, cap));
                }
            }
        }
        return violations;
    }

    /// <summary>Builds one safety violation record.</summary>
    /// <param name="stepIndex">the offending step, or -1 for a plan-level finding</param>
    /// <param name="exchangeId">the venue</param>
    /// <param name="symbol">the market</param>
    /// <param name="code">the violation code</param>
    /// <param name="blocking">whether the violation forbids execution</param>
    /// <param name="actual">the observed value</param>
    /// <param name="limit">the value it was measured against</param>
    public dict Violation(double stepIndex, string exchangeId, string symbol, string code, bool blocking, double actual, double limit)
    {
        return new dict()
        {
            { "stepIndex", stepIndex },
            { "exchangeId", exchangeId },
            { "symbol", symbol },
            { "code", code },
            { "blocking", blocking },
            { "actual", actual },
            { "limit", limit },
            { "message", this.StringAt(VIOLATION_MESSAGES, code, code) },
        };
    }

    /// <summary>
    /// Values a step's quote-currency notional in USD, returning 0 when it
    /// cannot be valued.
    /// </summary>
    public double NotionalUsd(dict step, double notionalQuote, dict usdRates)
    {
        var quote = this.StringAt(step, "quote", "");
        var quoteRate = this.UsdRateFor(quote, usdRates);
        if (quoteRate > 0)
        {
            return notionalQuote * quoteRate;
        }
        //  fall back to the base side: amount * usd(base) values the same trade
        var baseCode = this.StringAt(step, "base", "");
        var baseRate = this.UsdRateFor(baseCode, usdRates);
        if (baseRate > 0)
        {
            return this.NumberAt(step, "amount", 0) * baseRate;
        }
        return 0;
    }

    /// <summary>
    /// Resolves the USD price of a currency, treating USD itself as 1 and
    /// assuming nothing about anything else.
    /// </summary>
    public double UsdRateFor(string code, dict usdRates)
    {
        if (code == "")
        {
            return 0;
        }
        if (code == "USD")
        {
            return 1;
        }
        //  USDT and USDC are NOT assumed to be one dollar. A stablecoin peg is
        //  an empirical fact, not a definition, and the caller supplying rates
        //  is the one who knows today's.
        var rate = this.NumberAt(usdRates, code, 0);
        if (rate > 0)
        {
            return rate;
        }
        return 0;
    }

    /// <summary>
    /// Reports whether a value fails to sit on a market's precision grid.
    /// </summary>
    /// <param name="value">the amount or price</param>
    /// <param name="precision">the market precision, a tick size or a decimal-place count</param>
    /// <param name="mode">tick_size or decimal_places</param>
    public bool PrecisionViolated(double value, double precision, string mode)
    {
        if (precision <= 0)
        {
            //  unknown or unconstrained precision is not a finding
            return false;
        }
        double rounded = 0;
        if (mode == "decimal_places")
        {
            var factor = Math.Pow(10, precision);
            rounded = RoundHalfUp(value * factor) / factor;
        }
        else
        {
            //  the rounding mode is irrelevant here: a value exactly halfway
            //  between two ticks is off-grid whichever neighbour it snaps to,
            //  so the six languages' differing round() semantics cannot change
            //  this predicate's answer
            rounded = RoundHalfUp(value / precision) * precision;
        }
        var allowed = Math.Abs(value) * Tolerance + 1e-15;
        return Math.Abs(rounded - value) > allowed;
    }

    /// <summary>
    /// Rounds the way JavaScript's Math.round does — halves go up, towards
    /// positive infinity. Math.Round would use banker's rounding and disagree
    /// with the other four ports on every exact half.
    /// </summary>
    public static double RoundHalfUp(double value)
    {
        return Math.Floor(value + 0.5);
    }

    //  -----------------------------------------------------------------------
    //  PURE: ReconcileExecutionStep
    //  -----------------------------------------------------------------------

    /// <summary>
    /// Compares what a step actually produced against what the route predicted,
    /// resizes every downstream hop, and returns the proceed-or-halt verdict.
    /// PURE — no I/O. The halt decision lives here rather than in the execution
    /// loop because it is a money decision, and six separate loops is six
    /// chances to omit it.
    /// </summary>
    /// <param name="plan">the plan, with any earlier resizes already applied to its steps</param>
    /// <param name="stepIndex">the step that just completed</param>
    /// <param name="realisedOut">
    /// what it actually produced, in that step's output asset — base for a buy,
    /// quote for a sell.
    /// </param>
    /// <returns>
    /// the verdict, with expectedOut, realisedOut, shortfall, shortfallRatio,
    /// scale, verdict, reason and resizedSteps.
    /// </returns>
    public dict ReconcileExecutionStep(dict plan, int stepIndex, double realisedOut)
    {
        var steps = this.ListAt(plan, "steps");
        if (stepIndex < 0 || stepIndex >= steps.Count)
        {
            throw new BadRequest("reconcileExecutionStep: stepIndex is out of range");
        }
        var step = this.AsDict(steps[stepIndex]);
        var hopIndex = this.NumberAt(step, "hopIndex", 0);
        var tolerance = this.NumberAt(plan, "reconcileToleranceRatio", DefaultReconcileTolerance);
        var expectedOut = this.StepExpectedOut(step);
        var resized = new list();
        if (expectedOut <= 0)
        {
            return new dict()
            {
                { "stepIndex", stepIndex },
                { "hopIndex", hopIndex },
                { "expectedOut", 0.0 },
                { "realisedOut", realisedOut },
                { "shortfall", 0.0 },
                { "shortfallRatio", 0.0 },
                { "scale", 0.0 },
                { "verdict", "halt" },
                { "reason", "zero_expected_output" },
                { "resizedSteps", resized },
            };
        }
        var shortfall = expectedOut - realisedOut;
        if (shortfall < 0)
        {
            shortfall = 0;
        }
        var shortfallRatio = shortfall / expectedOut;
        //  the downstream hops lost `shortfall` out of this hop's whole output,
        //  not out of this leg's, so the scale is measured against the hop
        double hopExpectedOut = 0;
        //  Shortfall already reported by this hop's OTHER legs. Each leg used to compute a scale
        //  from the hop total and multiply the downstream amounts by it, so a second leg scaled an
        //  already-scaled number: 80% and 60% fills produced 0.9 x 0.8 = 0.72 of the next hop
        //  instead of the true 0.70, sizing it for more than the wallet actually received and
        //  inviting a spurious insufficient-funds halt on exactly the bridged routes this class
        //  exists for. Reproduced at 144 against a true 140 before this changed.
        double priorShortfall = 0;
        for (var i = 0; i < steps.Count; i++)
        {
            if (this.NumberAt(steps[i], "hopIndex", 0) == hopIndex)
            {
                hopExpectedOut = hopExpectedOut + this.StepExpectedOut(this.AsDict(steps[i]));
                if (this.NumberAt(steps[i], "stepIndex", -1) != stepIndex && this.HasNumberAt(this.AsDict(steps[i]), "realisedOut"))
                {
                    var legShortfall = this.StepExpectedOut(this.AsDict(steps[i])) - this.NumberAt(steps[i], "realisedOut", 0);
                    if (legShortfall < 0)
                    {
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
        double scaleBefore = 1;
        double scaleAfter = 1;
        if (hopExpectedOut > 0)
        {
            scaleBefore = (hopExpectedOut - priorShortfall) / hopExpectedOut;
            scaleAfter = (hopExpectedOut - priorShortfall - shortfall) / hopExpectedOut;
        }
        if (scaleBefore <= 0)
        {
            //  the hop already produced nothing; there is nothing left to scale down
            scaleBefore = 1;
            scaleAfter = 0;
        }
        double scale = scaleAfter / scaleBefore;
        if (scale > 1)
        {
            //  never scale UP. An overfill is good news, but growing a
            //  downstream order past the size that passed the safety check
            //  would place an order nobody ever approved.
            scale = 1;
        }
        if (scale < 0)
        {
            scale = 0;
        }
        for (var i = 0; i < steps.Count; i++)
        {
            var other = this.AsDict(steps[i]);
            if (this.NumberAt(other, "hopIndex", 0) <= hopIndex)
            {
                continue;
            }
            var previousAmount = this.NumberAt(other, "amount", 0);
            var amount = previousAmount * scale;
            resized.Add(new dict()
            {
                { "stepIndex", this.NumberAt(other, "stepIndex", i) },
                { "previousAmount", previousAmount },
                { "amount", amount },
                { "notionalQuote", amount * this.NumberAt(other, "expectedPrice", 0) },
            });
        }
        var verdict = "proceed";
        var reason = "within_tolerance";
        if (realisedOut <= 0)
        {
            verdict = "halt";
            reason = "nothing_filled";
        }
        else if (shortfallRatio > tolerance * (1 + Tolerance))
        {
            verdict = "halt";
            reason = "shortfall_exceeds_tolerance";
        }
        return new dict()
        {
            { "stepIndex", stepIndex },
            { "hopIndex", hopIndex },
            { "expectedOut", expectedOut },
            { "realisedOut", realisedOut },
            { "shortfall", shortfall },
            { "shortfallRatio", shortfallRatio },
            { "scale", scale },
            { "verdict", verdict },
            { "reason", reason },
            { "resizedSteps", resized },
        };
    }

    /// <summary>
    /// How much of its output asset a step is expected to produce, gross of
    /// fees: base units for a buy, quote units for a sell.
    /// </summary>
    public double StepExpectedOut(dict step)
    {
        var amount = this.NumberAt(step, "amount", 0);
        if (this.StringAt(step, "side", "") == "buy")
        {
            return amount;
        }
        return amount * this.NumberAt(step, "expectedPrice", 0);
    }

    //  -----------------------------------------------------------------------
    //  PURE: BuildUnwindPlan
    //  -----------------------------------------------------------------------

    /// <summary>
    /// Given a halted execution report, computes the reverse orders that sell
    /// each stranded residual back toward the original from-asset, on the venue
    /// that actually holds it. PURE — no I/O. NEVER automatic: the result
    /// carries requiresConfirmation and nothing in this class executes it.
    /// </summary>
    /// <param name="report">an execution report from Execute</param>
    /// <returns>
    /// the unwind plan, with steps in reverse execution order and unresolved for
    /// residuals that cannot be reversed.
    /// </returns>
    public dict BuildUnwindPlan(dict report)
    {
        var fromAsset = this.StringAt(report, "from", "");
        var toAsset = this.StringAt(report, "to", "");
        var slippageBps = this.NumberAt(report, "slippageBps", DefaultSlippageBps);
        var results = this.ListAt(report, "steps");
        //  net position per (exchangeId, asset). Held in a LIST rather than a
        //  map because the output order must be identical in six languages and
        //  map iteration order is not.
        var positions = new list();
        for (var i = results.Count - 1; i >= 0; i--)
        {
            var result = this.AsDict(results[i]);
            var exchangeId = this.StringAt(result, "exchangeId", "");
            var outAsset = this.StringAt(result, "outAsset", "");
            var outAmount = this.NumberAt(result, "outAmount", 0);
            if (outAsset != "" && outAmount > 0)
            {
                this.AddPosition(positions, exchangeId, outAsset, outAmount, result, true);
            }
            var inAsset = this.StringAt(result, "inAsset", "");
            var inAmount = this.NumberAt(result, "inAmount", 0);
            if (inAsset != "" && inAmount > 0)
            {
                //  what a later hop consumed on this venue is not a residual.
                //  Netting is per venue: assets sitting on a venue the route
                //  never spent them on stay stranded, because this class never
                //  moves funds between venues.
                this.AddPosition(positions, exchangeId, inAsset, -inAmount, result, false);
            }
        }
        var steps = new list();
        var unresolved = new list();
        var residualCount = 0;
        for (var i = 0; i < positions.Count; i++)
        {
            var position = this.AsDict(positions[i]);
            var asset = this.StringAt(position, "asset", "");
            var amount = this.NumberAt(position, "amount", 0);
            var exchangeId = this.StringAt(position, "exchangeId", "");
            if (amount <= 0)
            {
                continue;
            }
            if (asset == fromAsset)
            {
                //  already home
                continue;
            }
            residualCount = residualCount + 1;
            var source = this.DictAt(position, "source");
            var symbol = this.StringAt(source, "symbol", "");
            var sourceSide = this.StringAt(source, "side", "");
            var price = this.NumberAt(source, "averagePrice", 0);
            if (price <= 0)
            {
                price = this.NumberAt(source, "expectedPrice", 0);
            }
            if (symbol == "" || (sourceSide != "buy" && sourceSide != "sell"))
            {
                unresolved.Add(new dict() { { "exchangeId", exchangeId }, { "asset", asset }, { "amount", amount }, { "reason", "no_source_market" } });
                continue;
            }
            if (price <= 0)
            {
                unresolved.Add(new dict() { { "exchangeId", exchangeId }, { "asset", asset }, { "amount", amount }, { "reason", "no_price" } });
                continue;
            }
            //  reverse the order that created the residual: a buy left you
            //  holding base, so sell it back; a sell left you holding quote, so
            //  buy the base back with it
            var side = "";
            double unwindAmount = 0;
            var marketBase = "";
            var marketQuote = "";
            //  the counter asset is whatever the reversed order gives back,
            //  which is exactly what the original order spent
            var counterAsset = this.StringAt(source, "inAsset", "");
            if (sourceSide == "buy")
            {
                side = "sell";
                marketBase = this.StringAt(source, "outAsset", "");
                marketQuote = this.StringAt(source, "inAsset", "");
            }
            else
            {
                side = "buy";
                marketBase = this.StringAt(source, "inAsset", "");
                marketQuote = this.StringAt(source, "outAsset", "");
            }
            //  the limit price comes FIRST, because the buy below is sized on it.
            double limitPrice = 0;
            if (side == "buy")
            {
                limitPrice = price * (1 + slippageBps / 10000);
            }
            else
            {
                limitPrice = price * (1 - slippageBps / 10000);
            }
            if (side == "buy")
            {
                //  Size the buy on the price it is actually PLACED at, not on the
                //  expected price. A residual of 44.5 USDT sized at 0.089 is 500
                //  DOGE, but the order goes out at 0.0892225 and would need 44.61
                //  USDT to fill - 0.11 more than the venue holds. The venue rejects
                //  it for insufficient funds, or fills it partially and leaves the
                //  rest of the stranded money stranded. Dividing by limitPrice
                //  spends at most the residual.
                unwindAmount = amount / limitPrice;
            }
            else
            {
                unwindAmount = amount;
            }
            steps.Add(new dict()
            {
                { "stepIndex", steps.Count },
                { "exchangeId", exchangeId },
                { "symbol", symbol },
                { "side", side },
                //  base and quote are carried so that an unwind plan can be fed
                //  straight back into CheckExecutionPlanSafety: unwinding is
                //  trading, and it is subject to the same 25 USD cap
                { "base", marketBase },
                { "quote", marketQuote },
                { "asset", asset },
                { "counterAsset", counterAsset },
                { "amount", unwindAmount },
                { "expectedPrice", price },
                { "limitPrice", limitPrice },
                //  notional at the price the order is actually placed at: this
                //  plan is fed back into CheckExecutionPlanSafety, and a cap that
                //  was checked against the expected price under-counts what the
                //  buy above really spends.
                { "notionalQuote", unwindAmount * limitPrice },
                { "reachesFrom", counterAsset == fromAsset },
                { "isDestination", asset == toAsset },
            });
        }
        return new dict()
        {
            { "from", fromAsset },
            { "to", toAsset },
            { "halted", this.BoolAt(report, "halted", false) },
            { "haltReason", this.StringAt(report, "haltReason", "") },
            { "residualCount", residualCount },
            { "requiresConfirmation", true },
            { "automatic", false },
            { "steps", steps },
            { "unresolved", unresolved },
        };
    }

    /// <summary>
    /// Accumulates a signed amount into the (exchangeId, asset) position list,
    /// appending in first-seen order.
    /// </summary>
    /// <param name="produced">
    /// true when this step PRODUCED the asset, which is the only kind of step an
    /// unwind can reverse.
    /// </param>
    public void AddPosition(list positions, string exchangeId, string asset, double amount, dict source, bool produced)
    {
        for (var i = 0; i < positions.Count; i++)
        {
            var position = this.AsDict(positions[i]);
            if (this.StringAt(position, "exchangeId", "") == exchangeId && this.StringAt(position, "asset", "") == asset)
            {
                position["amount"] = this.NumberAt(position, "amount", 0) + amount;
                if (produced && this.DictAt(position, "source").Count == 0)
                {
                    position["source"] = source;
                }
                return;
            }
        }
        //  the source must be the step that PRODUCED the asset, never one that
        //  consumed it: reversing a step that spent your USDT would sell the
        //  wrong side of the wrong market. Walking the results backwards, the
        //  first producing step seen is the last one that ran, which is exactly
        //  the order an unwind undoes first.
        object initialSource = produced ? (object)source : (object)(new dict());
        positions.Add(new dict() { { "exchangeId", exchangeId }, { "asset", asset }, { "amount", amount }, { "source", initialSource } });
    }

    //  -----------------------------------------------------------------------
    //  IMPURE: Execute
    //  -----------------------------------------------------------------------

    /// <summary>
    /// The stable identity of an execution, used for the re-execution guard. A
    /// caller-supplied idempotencyKey WINS over the plan's own requestId: passing
    /// one is a deliberate statement
    /// about what this execution is, and it is the only identity a hand-assembled
    /// plan can have — Execute takes any dictionary of the plan shape, not only the
    /// output of BuildExecutionPlan, and a plan a user built themselves never went
    /// through a routing request and so never had a requestId. Nothing is invented
    /// when both are absent: a generated identity would be either random, which
    /// defeats the guard that depends on it, or a fingerprint of the plan's
    /// contents, which makes two plans that happen to agree indistinguishable.
    /// </summary>
    public string PlanIdentity(dict plan, dict options)
    {
        var idempotencyKey = this.StringAt(options, "idempotencyKey", "");
        if (idempotencyKey != "")
        {
            return idempotencyKey;
        }
        return this.StringAt(plan, "requestId", "");
    }

    /// <summary>
    /// Reports whether this instance has executed the given plan id recently enough for the
    /// bounded ledger to still remember it.
    /// </summary>
    public bool HasExecutedPlan(string planId)
    {
        //  a hash lookup, not a scan: the ledger is capped but still up to
        //  MaxExecutedPlanIds long, and this runs on every live execution
        return this.executedPlanIdSet.Contains(planId);
    }

    /// <summary>
    /// Records one plan id in the bounded ledger, evicting the oldest entry when the cap is
    /// reached.
    /// </summary>
    public void RecordExecutedPlan(string planId)
    {
        if (this.HasExecutedPlan(planId))
        {
            //  already recorded; re-recording it would move it in the FIFO order and let a
            //  repeatedly re-executed plan keep other ids alive or evict them out of turn
            return;
        }
        this.executedPlanIds.Enqueue(planId);
        this.executedPlanIdSet.Add(planId);
        while (this.executedPlanIds.Count > MaxExecutedPlanIds)
        {
            //  FIFO: the OLDEST execution is the one whose duplicate is least likely still in
            //  flight. Evicting it drops the refusal for that plan — see the comment on
            //  MaxExecutedPlanIds; this is a bounded memory promise, not a stronger
            //  idempotency one.
            var evicted = this.executedPlanIds.Dequeue();
            this.executedPlanIdSet.Remove(evicted);
        }
    }

    /// <summary>
    /// Executes a plan against live exchange instances. THE ONLY IMPURE METHOD.
    /// dry_run is the default and anything other than options["live"] == true
    /// forces dry_run regardless of the strategy requested, so a call that looks
    /// live but forgot the flag places nothing.
    /// </summary>
    /// <param name="plan">a plan from BuildExecutionPlan, or a caller-assembled plan of the same shape — this method never assumes the plan came from the routing service</param>
    /// <param name="venues">exchangeId to a ccxt exchange instance</param>
    /// <param name="options">
    /// strategy (dry_run, sequential, parallel_within_hop, limit_protected,
    /// best_effort or atomic_ish), live (must be exactly true for any order to
    /// be placed), usdRates (required when live, because the notional cap cannot
    /// be enforced without it), allowMarketOrders, maxOrders,
    /// acknowledgeDispersion, orderTimeoutMs, pollIntervalMs, orderParams,
    /// idempotencyKey (the identity of this execution, required when the plan
    /// carries no requestId; it keys the re-execution guard, and OVERRIDES the
    /// plan's requestId when both are given),
    /// allowReexecution (must be exactly true to run a plan this instance has
    /// already executed live; the DEFAULT is refusal),
    /// retryFailedSteps (how many times to re-place a step the venue DEFINITIVELY
    /// REJECTED, default 0 — an outcome_unknown step is never retried at any
    /// setting: it may already be a live position, and re-placing it is the
    /// double-fill this class exists to prevent), retryDelayMs (how long to wait
    /// before a retry, default 1000) and onStep (a Func&lt;dict, string&gt; called
    /// after each step completes and reconciles, never mid-order, with one event
    /// dictionary describing that step; return "halt" to stop the route cleanly —
    /// haltReason becomes halted_by_on_step — and any other value continues. It
    /// can only STOP a route, never resume one already halted. Do NO network I/O
    /// here: it sits between orders on the money path. A hook that throws is
    /// recorded as on_step_hook_failed and the run continues, because losing the
    /// report would destroy the only account of orders that are already live).
    /// </param>
    /// <returns>
    /// an execution report with per-step results, openOrders, errors and the
    /// halt verdict.
    /// </returns>
    public async Task<dict> Execute(dict plan, Dictionary<string, Exchange> venues, dict options = null)
    {
        var requestedStrategy = this.StringAt(options, "strategy", "dry_run");
        if (!KNOWN_STRATEGIES.Contains(requestedStrategy))
        {
            throw new BadRequest("OrderRouter: unknown execution strategy " + requestedStrategy);
        }
        var live = this.IsExactlyTrue(options, "live");
        //  THE default. Anything short of an explicit true is a rehearsal.
        var strategy = live ? requestedStrategy : "dry_run";
        var steps = this.CloneSteps(plan);
        var report = this.EmptyReport(plan, strategy, requestedStrategy, live, steps);
        //  resolved from BOTH the plan and the options, so a hand-assembled plan can
        //  carry an identity too; reported on every report, rehearsals included
        var planId = this.PlanIdentity(plan, options);
        report["planId"] = planId;
        // How old the prices in this plan are. ALWAYS reported, even when nothing is enforced: a plan
        // is a snapshot of a book, and how stale that snapshot is decides whether any number in it
        // means anything. -1 when the route carried no calculatedAt, which is not the same as "fresh"
        // and must not read like it. Enforced only if asked for, at whatever value is asked for — the
        // same shape as maxNotionalUsd, and for the same reason. But an age that cannot be determined
        // BLOCKS under an active limit: a freshness check that silently passes when the timestamp is
        // missing is not a freshness check.
        var calculatedAt = this.NumberAt(plan, "calculatedAt", 0);
        var planAgeMs = (calculatedAt > 0) ? (this.NowMs() - calculatedAt) : -1;
        report["planAgeMs"] = planAgeMs;
        var maxPlanAgeMs = this.NumberAt(options, "maxPlanAgeMs", 0);
        if (live && maxPlanAgeMs > 0)
        {
            if (planAgeMs < 0)
            {
                throw new ExchangeError("OrderRouter: refusing to execute, the plan carries no calculatedAt and maxPlanAgeMs was set");
            }
            if (planAgeMs > maxPlanAgeMs)
            {
                throw new ExchangeError("OrderRouter: refusing to execute a plan older than maxPlanAgeMs, recompute the route");
            }
        }
        if (strategy == "dry_run")
        {
            //  not one call is made against a venue on this path, not even a read
            report["wouldPlaceOrders"] = steps.Count;
            return report;
        }
        if (venues == null || venues.Count == 0)
        {
            throw new ArgumentsRequired("OrderRouter.execute requires a venues dictionary when live");
        }
        //  IDEMPOTENCY, half one: a plan this instance has already run live is REFUSED,
        //  and refused here — before a single read reaches a venue. The ledger is
        //  consulted now and written only once the plan is about to be dispatched, so a
        //  caller error that placed nothing does not burn the plan. dry_run never reaches
        //  this line and never consumes a plan, because a rehearsal places nothing.
        if (planId == "")
        {
            //  no identity means no idempotency: the ledger below cannot key on it, so a
            //  re-run of this plan would be indistinguishable from a first run.
            throw new BadRequest("OrderRouter: refusing to execute live without an identity, the plan carries no requestId — pass options.idempotencyKey");
        }
        if (!this.IsExactlyTrue(options, "allowReexecution"))
        {
            if (this.HasExecutedPlan(planId))
            {
                throw new BadRequest("OrderRouter: refusing to re-execute a plan this instance already executed, pass allowReexecution to override");
            }
        }
        //  derived from the steps about to be executed, NEVER read off the plan:
        //  a plan that travelled through JSON, a persisted step list or a
        //  hand-rebuilt tail of a halted route can be missing hopCount, and a
        //  refusal that a missing key switches off is not a refusal
        var hopCount = this.HopCountOf(steps);
        if (strategy == "best_effort")
        {
            if (hopCount > 1)
            {
                //  best-effort multi-hop is the most reliable way to strand
                //  money in a bridge asset
                throw new NotSupported("OrderRouter: best_effort refuses multi-hop routes");
            }
            if (!this.IsExactlyTrue(options, "acknowledgeDispersion"))
            {
                throw new BadRequest("OrderRouter: best_effort requires acknowledgeDispersion");
            }
            if (this.NumberAt(options, "maxOrders", 0) <= 0)
            {
                throw new BadRequest("OrderRouter: best_effort requires a positive maxOrders");
            }
        }
        if (strategy == "limit_protected")
        {
            //  Refused HERE, before a single order is placed, because the alternative is worse than a
            //  bad interval: the poll loop advances its clock by this value, so a zero or negative one
            //  never reaches the timeout. It spins on fetchOrder forever with a real order resting on a
            //  real venue, and the timeout that exists to cancel that order never arrives.
            if (this.HasNumberAt(options, "pollIntervalMs") && this.NumberAt(options, "pollIntervalMs", 0) <= 0)
            {
                throw new BadRequest("OrderRouter: pollIntervalMs must be positive, a resting order is polled on that clock");
            }
        }
        //  markets are needed for the safety check and for precision snapping
        var markets = new dict();
        var exchangeIds = this.SortedKeys(venues);
        for (var i = 0; i < exchangeIds.Count; i++)
        {
            var exchangeId = exchangeIds[i];
            var venue = venues[exchangeId];
            var venueMarkets = this.AsDict(venue.markets);
            if (venueMarkets == null || venueMarkets.Count == 0)
            {
                await venue.loadMarkets();
            }
            markets[exchangeId] = this.AsDict(venue.markets);
        }
        var usdRates = this.DictAt(options, "usdRates");
        var safetyOptions = new dict()
        {
            { "usdRates", usdRates },
            { "maxNotionalUsd", this.NumberAt(options, "maxNotionalUsd", this.maxNotionalUsd) },
            { "precisionMode", this.StringAt(options, "precisionMode", "tick_size") },
        };
        var violations = this.CheckExecutionPlanSafety(plan, markets, safetyOptions);
        var blockers = "";
        for (var i = 0; i < violations.Count; i++)
        {
            if (this.BoolAt(violations[i], "blocking", false))
            {
                if (blockers != "")
                {
                    blockers = blockers + ", ";
                }
                blockers = blockers + this.StringAt(violations[i], "code", "");
            }
        }
        if (blockers != "")
        {
            //  thrown, not reported. A refusal a caller can forget to read is
            //  not a refusal.
            throw new ExchangeError("OrderRouter: refusing to execute, blocking safety violations: " + blockers);
        }
        if (strategy == "atomic_ish")
        {
            await this.AssertPrefunded(steps, venues);
        }
        //  the ledger is written BEFORE the first order goes out, never after: a run
        //  that throws half way through has still placed orders, and a guard that only
        //  recorded completed runs would wave through exactly the retry that
        //  double-fills.
        this.RecordExecutedPlan(planId);
        if (strategy == "parallel_within_hop")
        {
            await this.ExecuteParallelWithinHop(report, steps, venues, options, usdRates);
        }
        else if (strategy == "best_effort")
        {
            await this.ExecuteBestEffort(report, steps, venues, options, usdRates);
        }
        else
        {
            //  sequential, limit_protected and atomic_ish all walk the plan one
            //  order at a time; they differ in how a single order is placed and
            //  in whether they lean on the previous hop's proceeds
            await this.ExecuteSequential(report, steps, venues, options, usdRates, strategy);
        }
        this.SummariseReport(report, steps);
        return report;
    }

    /// <summary>
    /// Counts the distinct hops a step list spans, which is the only authority on
    /// whether a plan is multi-hop.
    /// </summary>
    public double HopCountOf(list steps)
    {
        //  a list rather than a set, so the count is the same in six languages
        //  and does not depend on hash iteration order
        var seen = new List<double>();
        for (var i = 0; i < steps.Count; i++)
        {
            var hopIndex = this.NumberAt(steps[i], "hopIndex", 0);
            var found = false;
            for (var j = 0; j < seen.Count; j++)
            {
                if (seen[j] == hopIndex)
                {
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                seen.Add(hopIndex);
            }
        }
        return seen.Count;
    }

    /// <summary>
    /// Copies a plan's steps so that execution-time resizing never mutates the
    /// caller's plan.
    /// </summary>
    public list CloneSteps(dict plan)
    {
        var steps = this.ListAt(plan, "steps");
        var copies = new list();
        for (var i = 0; i < steps.Count; i++)
        {
            var step = this.AsDict(steps[i]);
            copies.Add(new dict()
            {
                { "stepIndex", this.NumberAt(step, "stepIndex", i) },
                { "hopIndex", this.NumberAt(step, "hopIndex", 0) },
                { "legIndex", this.NumberAt(step, "legIndex", 0) },
                { "exchangeId", this.StringAt(step, "exchangeId", "") },
                { "symbol", this.StringAt(step, "symbol", "") },
                { "side", this.StringAt(step, "side", "") },
                { "base", this.StringAt(step, "base", "") },
                { "quote", this.StringAt(step, "quote", "") },
                { "amount", this.NumberAt(step, "amount", 0) },
                { "expectedPrice", this.NumberAt(step, "expectedPrice", 0) },
                { "effectivePrice", this.NumberAt(step, "effectivePrice", 0) },
                { "limitPrice", this.StepLimitPrice(step) },
                { "notionalQuote", this.StepNotionalQuote(step) },
            });
        }
        return copies;
    }

    /// <summary>
    /// Builds the report skeleton, with every step marked planned.
    /// </summary>
    public dict EmptyReport(dict plan, string strategy, string requestedStrategy, bool live, list steps)
    {
        var results = new list();
        for (var i = 0; i < steps.Count; i++)
        {
            var step = this.AsDict(steps[i]);
            results.Add(new dict()
            {
                { "stepIndex", this.NumberAt(step, "stepIndex", i) },
                { "hopIndex", this.NumberAt(step, "hopIndex", 0) },
                { "legIndex", this.NumberAt(step, "legIndex", 0) },
                { "exchangeId", this.StringAt(step, "exchangeId", "") },
                { "symbol", this.StringAt(step, "symbol", "") },
                { "side", this.StringAt(step, "side", "") },
                { "status", "planned" },
                { "requestedAmount", this.NumberAt(step, "amount", 0) },
                { "filledAmount", 0.0 },
                { "averagePrice", 0.0 },
                { "expectedPrice", this.NumberAt(step, "expectedPrice", 0) },
                { "cost", 0.0 },
                { "inAsset", "" },
                { "inAmount", 0.0 },
                { "outAsset", "" },
                { "outAmount", 0.0 },
                { "orderId", "" },
                { "clientOrderId", "" },
                { "errorCode", "" },
                //  which retry produced this result; 0 unless retryFailedSteps re-placed it
                { "attempt", 0.0 },
            });
        }
        return new dict()
        {
            //  a placeholder: Execute resolves the real identity from the plan AND the
            //  options and overwrites it before anything reads this field
            { "planId", "" },
            { "strategy", strategy },
            { "requestedStrategy", requestedStrategy },
            { "dryRun", strategy == "dry_run" },
            { "live", live },
            { "from", this.StringAt(plan, "from", "") },
            { "to", this.StringAt(plan, "to", "") },
            { "slippageBps", this.NumberAt(plan, "slippageBps", DefaultSlippageBps) },
            { "reconcileToleranceRatio", this.NumberAt(plan, "reconcileToleranceRatio", DefaultReconcileTolerance) },
            { "stepCount", steps.Count },
            { "wouldPlaceOrders", 0 },
            { "ordersPlaced", 0 },
            { "halted", false },
            { "haltReason", "" },
            { "haltStepIndex", -1 },
            { "filledIn", 0.0 },
            { "filledOut", 0.0 },
            { "steps", results },
            { "openOrders", new list() },
            { "errors", new list() },
            { "reconciliations", new list() },
        };
    }

    /// <summary>
    /// Places one order at a time in plan order, reconciling after each and
    /// obeying the halt verdict.
    /// </summary>
    public async Task ExecuteSequential(dict report, list steps, Dictionary<string, Exchange> venues, dict options, dict usdRates, string strategy)
    {
        var results = this.ListAt(report, "steps");
        for (var i = 0; i < steps.Count; i++)
        {
            var step = this.AsDict(steps[i]);
            var result = await this.PlaceStepWithRetry(step, venues, options, usdRates, strategy, report);
            results[i] = result;
            var stepStatus = this.StringAt(result, "status", "");
            if (stepStatus == "failed" || stepStatus == "outcome_unknown")
            {
                report["halted"] = true;
                //  An unknown outcome must NOT fall through to reconciliation: reconciling reads
                //  outAmount, which is 0 because nothing was observed, and reports the halt as
                //  "nothing_filled" — asserting the one thing we do not know.
                report["haltReason"] = (stepStatus == "failed") ? "order_failed" : "outcome_unknown";
                report["haltStepIndex"] = i;
                //  the hook is told about a halt it did not cause, and cannot undo it
                this.CallOnStep(options, report, result, new dict(), i, steps.Count);
                this.MarkRemainingSkipped(results, i + 1);
                return;
            }
            var reconcilePlan = new dict() { { "steps", steps }, { "reconcileToleranceRatio", this.NumberAt(report, "reconcileToleranceRatio", DefaultReconcileTolerance) } };
            var reconciliation = this.ReconcileExecutionStep(reconcilePlan, i, this.NumberAt(result, "outAmount", 0));
            this.ListAt(report, "reconciliations").Add(reconciliation);
            if (strategy != "atomic_ish")
            {
                //  atomic_ish is pre-funded end to end, so a hop's shortfall
                //  does not shrink the next hop's order — the money for it was
                //  already there before the first order went out
                this.ApplyResize(steps, reconciliation);
            }
            if (this.StringAt(reconciliation, "verdict", "") == "halt")
            {
                report["halted"] = true;
                report["haltReason"] = this.StringAt(reconciliation, "reason", "");
                report["haltStepIndex"] = i;
                this.CallOnStep(options, report, result, reconciliation, i, steps.Count);
                this.MarkRemainingSkipped(results, i + 1);
                return;
            }
            //  the caller's own verdict, consulted only once the route is otherwise sound. It
            //  can stop the route; it cannot restart one the reconciliation above already
            //  stopped.
            if (this.CallOnStep(options, report, result, reconciliation, i, steps.Count) == "halt")
            {
                report["halted"] = true;
                report["haltReason"] = "halted_by_on_step";
                report["haltStepIndex"] = i;
                this.MarkRemainingSkipped(results, i + 1);
                return;
            }
        }
    }

    /// <summary>
    /// Runs the legs of one hop concurrently and the hops strictly in order.
    /// </summary>
    public async Task ExecuteParallelWithinHop(dict report, list steps, Dictionary<string, Exchange> venues, dict options, dict usdRates)
    {
        var results = this.ListAt(report, "steps");
        var cursor = 0;
        while (cursor < steps.Count)
        {
            var hopIndex = this.NumberAt(steps[cursor], "hopIndex", 0);
            var end = cursor;
            while (end < steps.Count && this.NumberAt(steps[end], "hopIndex", 0) == hopIndex)
            {
                end = end + 1;
            }
            //  THE CONTRACT: concurrent ACROSS venues, serialised WITHIN a venue. It is an
            //  ordering guarantee, not a performance promise, which is what lets six very
            //  different runtimes honour the same words. Two legs of one hop that land on the
            //  SAME exchange instance used to run concurrently against that instance's throttle
            //  and nonce state; grouping by exchangeId means nobody ever has two orders in
            //  flight on one instance.
            var venueGroups = new List<string>();
            var groupedIndices = new List<List<int>>();
            for (var i = cursor; i < end; i++)
            {
                var groupExchangeId = this.StringAt(steps[i], "exchangeId", "");
                var groupIndex = -1;
                for (var g = 0; g < venueGroups.Count; g++)
                {
                    if (venueGroups[g] == groupExchangeId)
                    {
                        groupIndex = g;
                        break;
                    }
                }
                if (groupIndex == -1)
                {
                    venueGroups.Add(groupExchangeId);
                    groupedIndices.Add(new List<int>() { i });
                }
                else
                {
                    groupedIndices[groupIndex].Add(i);
                }
            }
            var pending = new List<Task>();
            for (var g = 0; g < groupedIndices.Count; g++)
            {
                //  PlaceStep contains its own failures and never throws, so
                //  "wait for all" means the same thing in all six languages.
                //  Without that containment JavaScript rejects fast while
                //  sibling orders are still live, and Go's promiseAll waits for
                //  every one — the same source abandoning in-flight orders
                //  differently per language.
                pending.Add(this.PlaceVenueGroup(groupedIndices[g], steps, venues, options, usdRates, report, results));
            }
            for (var i = 0; i < pending.Count; i++)
            {
                await pending[i];
            }
            for (var i = cursor; i < end; i++)
            {
                var result = this.AsDict(results[i]);
                var legStatus = this.StringAt(result, "status", "");
                if (legStatus == "failed" || legStatus == "outcome_unknown")
                {
                    report["halted"] = true;
                    report["haltReason"] = (legStatus == "failed") ? "order_failed" : "outcome_unknown";
                    report["haltStepIndex"] = i;
                    this.CallOnStep(options, report, result, new dict(), i, steps.Count);
                    this.MarkRemainingSkipped(results, end);
                    return;
                }
                var reconcilePlan = new dict() { { "steps", steps }, { "reconcileToleranceRatio", this.NumberAt(report, "reconcileToleranceRatio", DefaultReconcileTolerance) } };
                var reconciliation = this.ReconcileExecutionStep(reconcilePlan, i, this.NumberAt(result, "outAmount", 0));
                this.ListAt(report, "reconciliations").Add(reconciliation);
                this.ApplyResize(steps, reconciliation);
                if (this.StringAt(reconciliation, "verdict", "") == "halt")
                {
                    report["halted"] = true;
                    report["haltReason"] = this.StringAt(reconciliation, "reason", "");
                    report["haltStepIndex"] = i;
                    this.CallOnStep(options, report, result, reconciliation, i, steps.Count);
                    this.MarkRemainingSkipped(results, end);
                    return;
                }
                if (this.CallOnStep(options, report, result, reconciliation, i, steps.Count) == "halt")
                {
                    report["halted"] = true;
                    report["haltReason"] = "halted_by_on_step";
                    report["haltStepIndex"] = i;
                    this.MarkRemainingSkipped(results, end);
                    return;
                }
            }
            cursor = end;
        }
    }

    /// <summary>
    /// Places every step of one venue group, strictly one at a time — the "serialised within a
    /// venue" half of the concurrency contract.
    /// </summary>
    public async Task PlaceVenueGroup(List<int> indices, list steps, Dictionary<string, Exchange> venues, dict options, dict usdRates, dict report, list results)
    {
        for (var i = 0; i < indices.Count; i++)
        {
            var stepPosition = indices[i];
            results[stepPosition] = await this.PlaceStepWithRetry(this.AsDict(steps[stepPosition]), venues, options, usdRates, "parallel_within_hop", report);
        }
    }

    /// <summary>
    /// Places what it can and never halts, on a single hop only, up to
    /// maxOrders.
    /// </summary>
    public async Task ExecuteBestEffort(dict report, list steps, Dictionary<string, Exchange> venues, dict options, dict usdRates)
    {
        var results = this.ListAt(report, "steps");
        var maxOrders = this.NumberAt(options, "maxOrders", 0);
        double placed = 0;
        for (var i = 0; i < steps.Count; i++)
        {
            if (placed >= maxOrders)
            {
                var skipped = this.AsDict(results[i]);
                skipped["status"] = "skipped";
                skipped["errorCode"] = "max_orders_reached";
                continue;
            }
            results[i] = await this.PlaceStepWithRetry(this.AsDict(steps[i]), venues, options, usdRates, "best_effort", report);
            placed = placed + 1;
            //  no reconciliation and no halt: that is the whole point of the strategy, and why
            //  it is refused on anything but a single hop. The hook is still offered every
            //  step, and stopping early is the one thing it may do here — that is a smaller
            //  commitment than the strategy's own contract, never a larger one.
            if (this.CallOnStep(options, report, this.AsDict(results[i]), new dict(), i, steps.Count) == "halt")
            {
                report["halted"] = true;
                report["haltReason"] = "halted_by_on_step";
                report["haltStepIndex"] = i;
                this.MarkRemainingSkipped(results, i + 1);
                return;
            }
        }
    }

    /// <summary>
    /// Places one step, re-placing it up to options["retryFailedSteps"] times when — and ONLY
    /// when — the venue definitively rejected it.
    /// </summary>
    public async Task<dict> PlaceStepWithRetry(dict step, Dictionary<string, Exchange> venues, dict options, dict usdRates, string strategy, dict report)
    {
        var maxRetries = this.NumberAt(options, "retryFailedSteps", 0);
        var retryDelayMs = this.NumberAt(options, "retryDelayMs", DefaultRetryDelayMs);
        double attempt = 0;
        while (true)
        {
            step["attempt"] = attempt;
            var result = await this.PlaceStep(step, venues, options, usdRates, strategy, report);
            var status = this.StringAt(result, "status", "");
            //  "failed" is the ONLY retryable outcome, and the distinction is the whole safety
            //  argument. A failed step was refused by the venue: nothing was placed, so placing
            //  it again cannot double-fill. An "outcome_unknown" step may ALREADY be a live
            //  position that simply could not be read back, and re-placing that is precisely
            //  the double-fill this class exists to prevent. It is never retried, at any
            //  setting.
            if (status != "failed" || attempt >= maxRetries)
            {
                return result;
            }
            attempt = attempt + 1;
            if (retryDelayMs > 0)
            {
                await this.Sleep(retryDelayMs);
            }
        }
    }

    /// <summary>
    /// Hands the caller's onStep hook one finished step and returns its verdict, treating any
    /// failure of the hook as "no opinion".
    /// </summary>
    public string CallOnStep(dict options, dict report, dict result, dict reconciliation, int stepIndex, int stepsTotal)
    {
        if (options == null || !options.ContainsKey("onStep") || options["onStep"] == null)
        {
            return "";
        }
        var hook = options["onStep"] as Func<dict, string>;
        if (hook == null)
        {
            //  an options value of any other shape is not a hook at all. Refusing the whole
            //  execution over an observability callback would be the larger failure, so a
            //  value that cannot be called is treated exactly like no hook.
            return "";
        }
        var payload = new dict()
        {
            { "planId", this.StringAt(report, "planId", "") },
            { "stepIndex", (double)stepIndex },
            { "hopIndex", this.NumberAt(result, "hopIndex", 0) },
            { "legIndex", this.NumberAt(result, "legIndex", 0) },
            { "exchangeId", this.StringAt(result, "exchangeId", "") },
            { "symbol", this.StringAt(result, "symbol", "") },
            { "side", this.StringAt(result, "side", "") },
            { "status", this.StringAt(result, "status", "") },
            { "requestedAmount", this.NumberAt(result, "requestedAmount", 0) },
            { "filledAmount", this.NumberAt(result, "filledAmount", 0) },
            { "outAsset", this.StringAt(result, "outAsset", "") },
            { "outAmount", this.NumberAt(result, "outAmount", 0) },
            { "orderId", this.StringAt(result, "orderId", "") },
            { "clientOrderId", this.StringAt(result, "clientOrderId", "") },
            { "errorCode", this.StringAt(result, "errorCode", "") },
            { "attempt", this.NumberAt(result, "attempt", 0) },
            { "reconciliation", reconciliation },
            { "ordersPlaced", this.NumberAt(report, "ordersPlaced", 0) },
            { "halted", this.BoolAt(report, "halted", false) },
            { "haltReason", this.StringAt(report, "haltReason", "") },
            { "stepsTotal", (double)stepsTotal },
            { "stepsRemaining", (double)(stepsTotal - (stepIndex + 1)) },
        };
        try
        {
            if (hook(payload) == "halt")
            {
                return "halt";
            }
            return "";
        }
        catch (Exception e)
        {
            //  A hook that throws must NOT take the run with it. Everything placed so far is
            //  recorded in this report, and losing it to an exception raised by observability
            //  code would destroy the only account of orders that are already live. The failure
            //  is recorded and the run proceeds exactly as if the hook had no opinion.
            this.RecordError(report, stepIndex, this.StringAt(result, "exchangeId", ""), this.StringAt(result, "symbol", ""), "on_step_hook_failed:" + this.ErrorCodeOf(e));
            return "";
        }
    }

    /// <summary>
    /// Places one order for one step and NEVER throws, so that a sibling leg's
    /// failure cannot abandon an in-flight order.
    /// </summary>
    public async Task<dict> PlaceStep(dict step, Dictionary<string, Exchange> venues, dict options, dict usdRates, string strategy, dict report)
    {
        var stepIndex = this.NumberAt(step, "stepIndex", 0);
        var exchangeId = this.StringAt(step, "exchangeId", "");
        var symbol = this.StringAt(step, "symbol", "");
        var side = this.StringAt(step, "side", "");
        var result = new dict()
        {
            { "stepIndex", stepIndex },
            { "hopIndex", this.NumberAt(step, "hopIndex", 0) },
            { "legIndex", this.NumberAt(step, "legIndex", 0) },
            { "exchangeId", exchangeId },
            { "symbol", symbol },
            { "side", side },
            { "status", "failed" },
            { "requestedAmount", this.NumberAt(step, "amount", 0) },
            { "filledAmount", 0.0 },
            { "averagePrice", 0.0 },
            { "expectedPrice", this.NumberAt(step, "expectedPrice", 0) },
            { "cost", 0.0 },
            { "inAsset", "" },
            { "inAmount", 0.0 },
            { "outAsset", "" },
            { "outAmount", 0.0 },
            { "orderId", "" },
            { "clientOrderId", "" },
            { "errorCode", "" },
            // false until an order is actually dispatched; set at each CreateOrder below
            { "placementAttempted", false },
        };
        try
        {
            Exchange venue = null;
            if (!venues.TryGetValue(exchangeId, out venue) || venue == null)
            {
                result["errorCode"] = "venue_missing";
                this.RecordError(report, stepIndex, exchangeId, symbol, "venue_missing");
                return result;
            }
            var amount = this.ParseNumber(Convert.ToString(venue.amountToPrecision(symbol, this.NumberAt(step, "amount", 0)), CultureInfo.InvariantCulture), 0);
            var price = this.ParseNumber(Convert.ToString(venue.priceToPrecision(symbol, this.StepLimitPrice(step)), CultureInfo.InvariantCulture), 0);
            if (!(amount > 0) || !(price > 0))
            {
                result["errorCode"] = "rounded_to_zero";
                this.RecordError(report, stepIndex, exchangeId, symbol, "rounded_to_zero");
                return result;
            }
            //  CLAUDE.md: compute the notional before EVERY createOrder. The
            //  plan-level check already ran, but the plan can have been resized
            //  by a reconciliation since, and the snapped price is not the one
            //  that was checked.
            this.AssertUnderCap(step, amount, price, usdRates, options);
            var orderParams = new dict();
            var extra = this.DictAt(options, "orderParams");
            foreach (var entry in extra)
            {
                orderParams[entry.Key] = entry.Value;
            }
            //  No clientOrderId is set here. Whatever the caller put in options orderParams
            //  travels as-is, and each exchange's CreateOrder keeps sending whatever
            //  identifier it generates on its own; the id the venue reports back is
            //  recorded on the result once the order returns. (An id derived from the plan
            //  identity used to be forced onto every step, but venues disagree on its
            //  length and charset, so it was rejected exactly where it mattered.)
            //  The attempt is still recorded: retryFailedSteps re-places a step the venue
            //  definitively rejected, and the report should say which try produced the result.
            var attempt = this.NumberAt(step, "attempt", 0);
            result["attempt"] = attempt;
            dict order = null;
            if (strategy == "limit_protected")
            {
                order = await this.PlaceProtectedLimit(venue, step, symbol, side, amount, price, orderParams, options, report, result);
            }
            else
            {
                order = await this.PlaceImmediateOrder(venue, symbol, side, amount, price, orderParams, options, result);
            }
            result["orderId"] = this.StringAt(order, "id", "");
            result["clientOrderId"] = this.StringAt(order, "clientOrderId", "");
            //  "the venue said zero" and "the venue said nothing" are different facts that used to
            //  produce the same number: a venue omitting filled yielded 0, reconciliation read that
            //  as nothing_filled and halted the route while a real position existed.
            if (!this.HasNumberAt(order, "filled") && this.StringAt(result, "orderId", "") != "")
            {
                //  One re-read, exactly as PlaceProtectedLimit already does after its poll. The
                //  immediate path never did, so it could only ever fabricate.
                order = await this.RefetchOrder(venue, this.StringAt(result, "orderId", ""), symbol, order);
            }
            //  An order the venue explicitly calls open is RESTING, and on this path it must
            //  not be: PlaceImmediateOrder asked for immediate-or-cancel, so a venue that
            //  silently dropped the timeInForce param has left a plain limit order sitting on
            //  the book. Recording it and walking on was not enough — the next hop then trades
            //  on top of a position that keeps growing behind it, is sized from a fill that is
            //  already out of date, and the leftover order is still live after the route has
            //  ended and nobody is watching it. So it is cancelled and re-read here, exactly as
            //  PlaceProtectedLimit does on its timeout path.
            var restingCancelFailed = false;
            if (strategy != "limit_protected" && this.StringAt(order, "status", "") == "open" && this.StringAt(result, "orderId", "") != "")
            {
                try
                {
                    await venue.CancelOrder(this.StringAt(result, "orderId", ""), symbol);
                    //  ALWAYS re-read after a cancel: the cancel and the fill can cross, and the
                    //  observed order is the only authority on what actually happened
                    order = await this.RefetchOrder(venue, this.StringAt(result, "orderId", ""), symbol, order);
                }
                catch (Exception)
                {
                    //  the order may still be live and its fill can still move, so whatever this
                    //  step reports below is a snapshot that is already stale. The status is
                    //  downgraded after the amounts are filled in, not here: a cost the venue DID
                    //  report is a fact, and BuildUnwindPlan subtracts it.
                    restingCancelFailed = true;
                }
            }
            var filledKnown = this.HasNumberAt(order, "filled");
            var filled = this.NumberAt(order, "filled", 0);
            var averageKnown = this.HasNumberAt(order, "average") || this.HasNumberAt(order, "price");
            var average = this.NumberAt(order, "average", 0);
            if (average <= 0)
            {
                average = this.NumberAt(order, "price", 0);
            }
            if (average <= 0)
            {
                average = price;
            }
            var costKnown = this.HasNumberAt(order, "cost");
            var cost = this.NumberAt(order, "cost", 0);
            if (cost <= 0)
            {
                cost = filled * average;
            }
            result["filledKnown"] = filledKnown;
            result["averageKnown"] = averageKnown;
            result["costKnown"] = costKnown;
            result["filledAmount"] = filled;
            result["averagePrice"] = average;
            result["cost"] = cost;
            if (side == "buy")
            {
                result["inAsset"] = this.StringAt(step, "quote", "");
                result["inAmount"] = cost;
                result["outAsset"] = this.StringAt(step, "base", "");
                result["outAmount"] = filled;
            }
            else
            {
                result["inAsset"] = this.StringAt(step, "base", "");
                result["inAmount"] = filled;
                result["outAsset"] = this.StringAt(step, "quote", "");
                result["outAmount"] = cost;
            }
            //  Net the taker fee out of what is actually CARRIED FORWARD, when the venue charged
            //  it in the asset this step produced. filled and cost are gross of fees — the manual
            //  says so — so a venue taking its cut in the acquired asset credits less than
            //  `filled`, and sizing the next hop (or an unwind) on the gross figure orders more
            //  than the wallet holds. Fees in any OTHER currency are left alone: they do not
            //  reduce what this hop hands to the next one.
            var feeCost = this.OrderFeeInAsset(order, this.StringAt(result, "outAsset", ""));
            result["feeCost"] = feeCost;
            result["feeCurrency"] = this.StringAt(result, "outAsset", "");
            if (feeCost > 0)
            {
                var net = this.NumberAt(result, "outAmount", 0) - feeCost;
                if (net < 0)
                {
                    net = 0;
                }
                result["grossOutAmount"] = this.NumberAt(result, "outAmount", 0);
                result["outAmount"] = net;
            }
            if (!filledKnown)
            {
                //  Refuse to reconcile on a fabricated fill: halting on an unknown quantity is
                //  recoverable, sizing the next hop from an invented number is not.
                result["status"] = "outcome_unknown";
                this.RecordOpenOrder(report, exchangeId, symbol, this.StringAt(result, "orderId", ""), "fill_unconfirmed");
                //  Read-modify-write on the shared report. The sibling increment on the success
                //  path below takes the lock; this one did not, so two parallel legs finishing on
                //  different thread-pool threads could both read the same count and both write
                //  back one more than it — losing a placement from the tally on exactly the path
                //  where an order is known to exist and its fill is not.
                lock (this.reportLock)
                {
                    report["ordersPlaced"] = this.NumberAt(report, "ordersPlaced", 0) + 1;
                }
                return result;
            }
            if (filled <= 0)
            {
                result["status"] = "unfilled";
            }
            else if (filled >= amount * (1 - Tolerance))
            {
                result["status"] = "filled";
            }
            else
            {
                result["status"] = "partial";
            }
            if (restingCancelFailed)
            {
                //  a resting order this class could not cancel is the worst outcome there is:
                //  it can still fill, in full, after the route has returned. Sizing the next hop
                //  on the fill recorded above would trade against a position that is still
                //  moving, so the step is marked unknown and ExecuteSequential stops here.
                result["status"] = "outcome_unknown";
                this.RecordOpenOrder(report, exchangeId, symbol, this.StringAt(result, "orderId", ""), "cancel_failed");
            }
            else if (this.StringAt(order, "status", "") == "open")
            {
                //  cancelled — or on the limit_protected path, cancelled by
                //  PlaceProtectedLimit — and the venue STILL calls it open. The order is
                //  live whatever this class asked for, so the same rule applies: report it,
                //  and refuse to size anything downstream from a fill that can still grow.
                result["status"] = "outcome_unknown";
                this.RecordOpenOrder(report, exchangeId, symbol, this.StringAt(result, "orderId", ""), "still_open");
            }
            lock (this.reportLock)
            {
                report["ordersPlaced"] = this.NumberAt(report, "ordersPlaced", 0) + 1;
            }
            return result;
        }
        catch (Exception e)
        {
            //  containment. A leg that throws must not take its siblings with it.
            result["status"] = "failed";
            result["errorCode"] = this.ErrorCodeOf(e);
            this.RecordError(report, stepIndex, exchangeId, symbol, this.StringAt(result, "errorCode", ""));
            //  createOrder may already have succeeded: every path between it and
            //  the final read — a poll that times out, a network drop, a cap
            //  re-check — leaves a real order on a real venue. Reporting the id is
            //  the difference between an operator who can go cancel it and one who
            //  never learns it exists.
            var knownId = this.StringAt(result, "orderId", "");
            if (knownId != "")
            {
                //  "failed" would read as "nothing happened" while openOrders says the opposite,
                //  and one report must not carry both readings. Having an id means CreateOrder
                //  RETURNED — the venue accepted something — so whatever threw afterwards left a
                //  real order behind whose fill is simply unknown to us.
                result["status"] = "outcome_unknown";
                this.RecordOpenOrder(report, exchangeId, symbol, knownId, "outcome_unknown");
            }
            else if (this.BoolAt(result, "placementAttempted", false) && this.IsOutcomeUnknownError(this.StringAt(result, "errorCode", "")))
            {
                //  The order was dispatched and the venue's answer never arrived. It may well have
                //  been accepted; we simply never learned its id. Reporting that as a plain failure
                //  asserts "nothing happened", which is the one reading that is certainly wrong.
                //  A DEFINITE rejection stays 'failed' on purpose: those are answers, not silence.
                result["status"] = "outcome_unknown";
                this.RecordUnconfirmedPlacement(report, exchangeId, symbol, "placement_unconfirmed");
            }
            return result;
        }
    }

    /// <summary>
    /// Appends one possibly-live order to the report, ignoring a blank id and
    /// never recording the same id twice.
    /// </summary>
    /// <summary>
    /// Reports whether a thrown error leaves a placement's outcome genuinely unknown. ccxt's
    /// NetworkError family means the request failed without telling us whether the venue processed
    /// it; everything else is the venue ANSWERING. Matched by class name so the six ports agree
    /// without depending on each language's type-test mechanics.
    /// </summary>
    /// <summary>
    /// Reports whether a container carries a usable number at key, as opposed to nothing.
    /// Deliberately the same coercion NumberAt does, so "usable" and "present" cannot disagree.
    /// </summary>
    public bool HasNumberAt(dict container, string key)
    {
        if (container == null || !container.ContainsKey(key))
        {
            return false;
        }
        var value = container[key];
        if (value == null || value is bool)
        {
            return false;
        }
        if (value is string text)
        {
            return this.IsFiniteNumber(this.ParseNumber(text, double.NaN));
        }
        try
        {
            return this.IsFiniteNumber(Convert.ToDouble(value, CultureInfo.InvariantCulture));
        }
        catch (Exception)
        {
            return false;
        }
    }

    /// <summary>
    /// Re-reads one order, keeping the previous body when the venue cannot be asked.
    /// </summary>
    public async Task<dict> RefetchOrder(Exchange venue, string orderId, string symbol, dict fallback)
    {
        try
        {
            var reread = this.OrderToDict(await venue.FetchOrder(orderId, symbol));
            if (reread == null)
            {
                return fallback;
            }
            return reread;
        }
        catch (Exception)
        {
            //  the caller marks the fill unknown; a throw here must not lose the placement record
            return fallback;
        }
    }

    public bool IsOutcomeUnknownError(string errorCode)
    {
        return errorCode == "RequestTimeout" || errorCode == "ExchangeNotAvailable"
            || errorCode == "NetworkError" || errorCode == "OnMaintenance";
    }

    /// <summary>
    /// Appends one dispatched-but-unconfirmed placement, keyed on venue/symbol/reason since there
    /// is no id to key on — the call that would have returned it is the call that died.
    /// </summary>
    public void RecordUnconfirmedPlacement(dict report, string exchangeId, string symbol, string reason)
    {
        //  Same list, same lock as RecordOpenOrder. This one was writing to report["openOrders"]
        //  without it: List<T>.Add is a resize plus a Count increment, so two parallel legs
        //  appending at once can lose an entry outright or throw out of List's own internals. The
        //  scan and the append must also be ATOMIC together, or the duplicate check races the
        //  append it is meant to guard.
        lock (this.reportLock)
        {
            var openOrders = this.ListAt(report, "openOrders");
            foreach (var entryObject in openOrders)
            {
                var entry = this.AsDict(entryObject);
                if (this.StringAt(entry, "exchangeId", "") == exchangeId
                    && this.StringAt(entry, "symbol", "") == symbol
                    && this.StringAt(entry, "reason", "") == reason)
                {
                    return;
                }
            }
            ((list)report["openOrders"]).Add(new dict() {
                { "exchangeId", exchangeId }, { "symbol", symbol }, { "orderId", "" }, { "reason", reason },
            });
        }
    }

    public void RecordOpenOrder(dict report, string exchangeId, string symbol, string orderId, string reason)
    {
        if (orderId == "")
        {
            //  nothing to point an operator at
            return;
        }
        lock (this.reportLock)
        {
            var openOrders = this.ListAt(report, "openOrders");
            for (var i = 0; i < openOrders.Count; i++)
            {
                if (this.StringAt(openOrders[i], "orderId", "") == orderId && this.StringAt(openOrders[i], "exchangeId", "") == exchangeId)
                {
                    return;
                }
            }
            openOrders.Add(new dict() { { "exchangeId", exchangeId }, { "symbol", symbol }, { "orderId", orderId }, { "reason", reason } });
        }
    }

    /// <summary>
    /// Names a caught exception by its class, which is the one label all six
    /// languages agree on.
    /// </summary>
    public string ErrorCodeOf(Exception e)
    {
        if (e == null)
        {
            return "unknown_error";
        }
        return e.GetType().Name;
    }

    /// <summary>
    /// Places an immediate-or-cancel limit order, falling back to a market order
    /// only when the venue cannot do IOC and the caller explicitly allowed it.
    /// </summary>
    /// <summary>
    /// Views a typed ccxt.Order as the plain dict the rest of this class reads.
    /// C# is the only one of the six implementations whose Exchange returns a
    /// typed order rather than the unified dict; mapping it here keeps every
    /// call site below identical to its TypeScript, Python, PHP and Go siblings,
    /// which is what the shared fixture checks. Only the fields the router
    /// actually reads are carried across — adding more would invent parity that
    /// is not tested.
    /// </summary>
    public dict OrderToDict(ccxt.Order order)
    {
        var mapped = new dict();
        mapped["id"] = order.id;
        //  the id the venue recorded for the order, so the report can say what it actually carries
        mapped["clientOrderId"] = order.clientOrderId;
        mapped["status"] = order.status;
        mapped["filled"] = order.filled;
        mapped["average"] = order.average;
        mapped["cost"] = order.cost;
        mapped["price"] = order.price;
        //  The fee fields are read by OrderFeeInAsset, which nets a fee charged in the acquired
        //  asset out of what this hop carries FORWARD. Omitting them here did not make C# fee-blind
        //  in some harmless way: OrderFeeInAsset simply always returned 0, so C# alone sized the
        //  next hop — and any unwind — on the gross figure, ordering more than the wallet holds.
        //  ccxt.Order carries both the single `fee` and the `fees` list safeOrder fills in, and
        //  OrderFeeInAsset needs both to avoid under-counting per-trade fees.
        if (order.fee != null)
        {
            mapped["fee"] = FeeToDict(order.fee.Value);
        }
        if (order.fees != null)
        {
            var feeList = new list();
            foreach (var entry in order.fees)
            {
                feeList.Add(FeeToDict(entry));
            }
            mapped["fees"] = feeList;
        }
        if (order.trades != null)
        {
            //  Per-trade fees are OrderFeeInAsset's last resort, and the only shape the Go port
            //  can carry a per-trade cut in at all. Dropping them here would make C# fee-blind on
            //  exactly the venues that report their cut per trade — which leaves outAmount GROSS
            //  and sizes the next hop on money the venue has already taken.
            var tradeList = new list();
            foreach (var trade in order.trades)
            {
                var mappedTrade = new dict();
                if (trade.fee != null)
                {
                    mappedTrade["fee"] = FeeToDict(trade.fee.Value);
                }
                tradeList.Add(mappedTrade);
            }
            mapped["trades"] = tradeList;
        }
        return mapped;
    }

    /// <summary>
    /// Views a typed ccxt.Fee as the plain dict OrderFeeInAsset reads. `cost` is left ABSENT
    /// rather than coerced to 0 when the venue did not report one: NumberAt then falls back to its
    /// own default, and a missing fee stays distinguishable from a zero one.
    /// </summary>
    public dict FeeToDict(ccxt.Fee fee)
    {
        var mapped = new dict();
        mapped["currency"] = fee.currency;
        if (fee.cost != null)
        {
            mapped["cost"] = fee.cost.Value;
        }
        if (fee.rate != null)
        {
            mapped["rate"] = fee.rate.Value;
        }
        return mapped;
    }

    public async Task<dict> PlaceImmediateOrder(Exchange venue, string symbol, string side, double amount, double price, dict orderParams, dict options, dict result)
    {
        if (this.VenueSupportsIoc(venue))
        {
            orderParams["timeInForce"] = "IOC";
            //  Set immediately before the call that can leave a real order on a real venue, and
            //  never reset. Anything failing before this point dispatched nothing.
            result["placementAttempted"] = true;
            var iocOrder = this.OrderToDict(await venue.CreateOrder(symbol, "limit", side, amount, price, orderParams));
            result["orderId"] = this.StringAt(iocOrder, "id", "");
            return iocOrder;
        }
        if (!this.IsExactlyTrue(options, "allowMarketOrders"))
        {
            //  a market order is an unbounded price, and switching to one on a
            //  caller's behalf is exactly the decision they did not delegate
            throw new NotSupported("OrderRouter: venue cannot do IOC and allowMarketOrders was not set");
        }
        // A market order and a notional cap cannot both be honoured. assertUnderCap valued this order
        // at the plan's LIMIT price, and the call below sends no price at all: the venue fills wherever
        // the book is, which is the one thing the cap exists to bound. Passing the check and then
        // removing the price it was computed from is a cap that silently disappears, which by this
        // file's own rule is not a cap. So the two options are refused together.
        if (this.NumberAt(options, "maxNotionalUsd", this.maxNotionalUsd) > 0)
        {
            throw new NotSupported("OrderRouter: allowMarketOrders cannot be honoured under a maxNotionalUsd cap, because a market order has no price to check");
        }
        result["placementAttempted"] = true;
        var marketOrder = this.OrderToDict(await venue.CreateOrder(symbol, "market", side, amount, null, orderParams));
        result["orderId"] = this.StringAt(marketOrder, "id", "");
        return marketOrder;
    }

    /// <summary>
    /// Rests a limit order, then cancels it on timeout and ALWAYS re-reads it,
    /// because a cancel and a fill can cross.
    /// </summary>
    /// <returns>the order as last observed, which is the authoritative fill</returns>
    public async Task<dict> PlaceProtectedLimit(Exchange venue, dict step, string symbol, string side, double amount, double price, dict orderParams, dict options, dict report, dict result)
    {
        var timeoutMs = this.NumberAt(options, "orderTimeoutMs", 20000);
        var pollIntervalMs = this.NumberAt(options, "pollIntervalMs", 1000);
        result["placementAttempted"] = true;
        var order = this.OrderToDict(await venue.CreateOrder(symbol, "limit", side, amount, price, orderParams));
        var orderId = this.StringAt(order, "id", "");
        //  before the first poll, the first sleep and the first thing that can go
        //  wrong: from here on the caller can always name what is resting
        result["orderId"] = orderId;
        double waited = 0;
        while (waited < timeoutMs)
        {
            if (this.StringAt(order, "status", "") == "closed" || this.StringAt(order, "status", "") == "canceled")
            {
                return order;
            }
            await this.Sleep(pollIntervalMs);
            waited = waited + pollIntervalMs;
            order = this.OrderToDict(await venue.FetchOrder(orderId, symbol));
        }
        var finalStatus = this.StringAt(order, "status", "");
        if (finalStatus == "closed" || finalStatus == "canceled")
        {
            //  the venue ended it on the last poll — an expiry, a self-trade
            //  prevention, a post-only rejection of the remainder. Cancelling an
            //  order the venue already closed throws, and the partial fill this
            //  order carries is real: dropping it would hide a live position from
            //  the report AND from the unwind plan built out of it.
            return order;
        }
        try
        {
            await venue.CancelOrder(orderId, symbol);
        }
        catch (Exception)
        {
            //  the order may still be live. Reporting a fill we did not observe
            //  would be a lie, and continuing to the next hop on top of an
            //  unknown position is worse.
            this.RecordOpenOrder(report, this.StringAt(step, "exchangeId", ""), symbol, orderId, "cancel_failed");
            throw new ExchangeError("OrderRouter: cancelOrder failed and an order is left OPEN, refusing to proceed");
        }
        //  ALWAYS re-read after a cancel: the cancel and the fill can cross, and
        //  the observed order is the only authority on what actually happened
        return this.OrderToDict(await venue.FetchOrder(orderId, symbol));
    }

    /// <summary>
    /// Reports whether a venue is known NOT to support immediate-or-cancel.
    /// Defaults to TRUE on purpose: an unknown answer here must not fall through
    /// to a market order, because a rejected IOC is a loud, cheap failure and an
    /// unintended market order is a silent, expensive one.
    /// </summary>
    public bool VenueSupportsIoc(Exchange venue)
    {
        var features = this.AsDict(venue.features);
        var spot = this.DictAt(features, "spot");
        var createOrder = this.DictAt(spot, "createOrder");
        //  EVERY real ccxt exchange declares this as a dictionary of booleans —
        //  { "IOC": true, "FOK": true, "GTC": true, ... } — and not one declares
        //  it as a list. Reading it as a list only ever answered "empty", which is
        //  the same answer as "the venue said nothing", so the check always said
        //  yes and the market-order path below was unreachable.
        var timeInForceFlags = this.DictAt(createOrder, "timeInForce");
        if (timeInForceFlags.Count > 0)
        {
            //  a venue that enumerates its time-in-force values and leaves IOC out
            //  has said no, exactly as one that says IOC: false has
            return this.BoolAt(timeInForceFlags, "IOC", false);
        }
        //  a list is still honoured, for a caller-built stub venue
        var timeInForce = this.ListAt(createOrder, "timeInForce");
        if (timeInForce.Count == 0)
        {
            return true;
        }
        for (var i = 0; i < timeInForce.Count; i++)
        {
            if ((timeInForce[i] is string) && ((string)timeInForce[i]) == "IOC")
            {
                return true;
            }
        }
        return false;
    }

    /// <summary>
    /// Throws unless a single order's USD notional is known and within the
    /// per-trade cap.
    /// </summary>
    public void AssertUnderCap(dict step, double amount, double price, dict usdRates, dict options)
    {
        var cap = this.NumberAt(options, "maxNotionalUsd", this.maxNotionalUsd);
        if (cap <= 0)
        {
            //  no cap set, so there is nothing to enforce here
            return;
        }
        var probe = new dict()
        {
            { "base", this.StringAt(step, "base", "") },
            { "quote", this.StringAt(step, "quote", "") },
            { "amount", amount },
        };
        var usdValue = this.NotionalUsd(probe, amount * price, usdRates);
        if (usdValue <= 0)
        {
            throw new ExchangeError("OrderRouter: refusing to place an order that cannot be valued in USD");
        }
        if (usdValue > cap * (1 + Tolerance))
        {
            throw new ExchangeError("OrderRouter: refusing to place an order above the per-trade USD notional cap");
        }
    }

    /// <summary>
    /// Verifies every step's input is already sitting on its venue, which is
    /// what atomic_ish actually requires.
    /// </summary>
    public async Task AssertPrefunded(list steps, Dictionary<string, Exchange> venues)
    {
        //  built as a list, not a map, so the first shortfall reported is the
        //  same one in all six languages
        var required = new list();
        for (var i = 0; i < steps.Count; i++)
        {
            var step = this.AsDict(steps[i]);
            var exchangeId = this.StringAt(step, "exchangeId", "");
            var amount = this.NumberAt(step, "amount", 0);
            var asset = "";
            double needed = 0;
            if (this.StringAt(step, "side", "") == "buy")
            {
                asset = this.StringAt(step, "quote", "");
                needed = amount * this.StepLimitPrice(step);
            }
            else
            {
                asset = this.StringAt(step, "base", "");
                needed = amount;
            }
            var found = false;
            for (var j = 0; j < required.Count; j++)
            {
                var entry = this.AsDict(required[j]);
                if (this.StringAt(entry, "exchangeId", "") == exchangeId && this.StringAt(entry, "asset", "") == asset)
                {
                    entry["amount"] = this.NumberAt(entry, "amount", 0) + needed;
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                required.Add(new dict() { { "exchangeId", exchangeId }, { "asset", asset }, { "amount", needed } });
            }
        }
        var balances = new dict();
        for (var i = 0; i < required.Count; i++)
        {
            var entry = this.AsDict(required[i]);
            var exchangeId = this.StringAt(entry, "exchangeId", "");
            if (this.ValueAt(balances, exchangeId) == null)
            {
                balances[exchangeId] = this.BalancesAsDict(await venues[exchangeId].FetchBalance());
            }
            var free = this.DictAt(this.DictAt(balances, exchangeId), "free");
            var asset = this.StringAt(entry, "asset", "");
            var available = this.NumberAt(free, asset, 0);
            if (available < this.NumberAt(entry, "amount", 0))
            {
                //  most routes fail this, and that is the correct outcome:
                //  atomic_ish names its own hedge, because there is no
                //  cross-venue atomicity and there cannot be
                throw new InsufficientFunds("OrderRouter: atomic_ish requires the whole route pre-funded, and " + exchangeId + " is short of " + asset);
            }
        }
    }

    /// <summary>
    /// Writes a reconciliation's downstream resize back into the working steps.
    /// </summary>
    public void ApplyResize(list steps, dict reconciliation)
    {
        //  Record what this leg actually produced BEFORE resizing anything. ReconcileExecutionStep
        //  is pure and cannot remember across calls, so the hop's cumulative shortfall has to live
        //  on the steps themselves — this is what stops the next leg of the same hop compounding
        //  its scale onto an already-scaled amount.
        var reconciledStep = this.NumberAt(reconciliation, "stepIndex", -1);
        for (var i = 0; i < steps.Count; i++)
        {
            var candidate = this.AsDict(steps[i]);
            if (this.NumberAt(candidate, "stepIndex", -1) == reconciledStep)
            {
                candidate["realisedOut"] = this.NumberAt(reconciliation, "realisedOut", 0);
                break;
            }
        }
        var resized = this.ListAt(reconciliation, "resizedSteps");
        for (var i = 0; i < resized.Count; i++)
        {
            var entry = this.AsDict(resized[i]);
            var stepIndex = this.NumberAt(entry, "stepIndex", -1);
            for (var j = 0; j < steps.Count; j++)
            {
                var step = this.AsDict(steps[j]);
                if (this.NumberAt(step, "stepIndex", -1) == stepIndex)
                {
                    step["amount"] = this.NumberAt(entry, "amount", 0);
                    step["notionalQuote"] = this.NumberAt(entry, "notionalQuote", 0);
                    break;
                }
            }
        }
    }

    /// <summary>
    /// Marks every step from an index onwards as skipped after a halt.
    /// </summary>
    public void MarkRemainingSkipped(list results, int start)
    {
        for (var i = start; i < results.Count; i++)
        {
            var result = this.AsDict(results[i]);
            if (this.StringAt(result, "status", "") == "planned")
            {
                result["status"] = "skipped";
            }
        }
    }

    /// <summary>Appends one error to the report.</summary>
    public void RecordError(dict report, double stepIndex, string exchangeId, string symbol, string code)
    {
        lock (this.reportLock)
        {
            this.ListAt(report, "errors").Add(new dict() { { "stepIndex", stepIndex }, { "exchangeId", exchangeId }, { "symbol", symbol }, { "code", code } });
        }
    }

    /// <summary>
    /// Totals what the first hop spent and what the last hop produced.
    /// </summary>
    public void SummariseReport(dict report, list steps)
    {
        var results = this.ListAt(report, "steps");
        double lastHop = 0;
        for (var i = 0; i < steps.Count; i++)
        {
            var hopIndex = this.NumberAt(steps[i], "hopIndex", 0);
            if (hopIndex > lastHop)
            {
                lastHop = hopIndex;
            }
        }
        double filledIn = 0;
        double filledOut = 0;
        for (var i = 0; i < results.Count; i++)
        {
            var hopIndex = this.NumberAt(results[i], "hopIndex", 0);
            if (hopIndex == 0)
            {
                filledIn = filledIn + this.NumberAt(results[i], "inAmount", 0);
            }
            if (hopIndex == lastHop)
            {
                filledOut = filledOut + this.NumberAt(results[i], "outAmount", 0);
            }
        }
        report["filledIn"] = filledIn;
        report["filledOut"] = filledOut;
    }

    /// <summary>
    /// Reads the wall clock, in milliseconds since the epoch. The only clock this class reads,
    /// isolated in one overridable method so a test can pin time.
    /// </summary>
    public virtual double NowMs()
    {
        return (double)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    /// <summary>Waits for a number of milliseconds.</summary>
    public async Task Sleep(double milliseconds)
    {
        await Task.Delay((int)milliseconds);
    }

    /// <summary>
    /// The keys of a dictionary in ascending code-unit order, which is the order
    /// JavaScript's Array.prototype.sort produces for strings.
    /// </summary>
    public List<string> SortedKeys<T>(Dictionary<string, T> container)
    {
        var keys = new List<string>();
        if (container == null)
        {
            return keys;
        }
        foreach (var entry in container)
        {
            keys.Add(entry.Key);
        }
        keys.Sort(string.CompareOrdinal);
        return keys;
    }
}
