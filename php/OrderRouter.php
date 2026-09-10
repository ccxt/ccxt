<?php

//  ---------------------------------------------------------------------------
//  OrderRouter — a client for the CCXT order-router service, plus the pure
//  planning / safety / reconciliation layer that sits between a routing
//  recommendation and real orders.
//
//  This file is HAND-WRITTEN and is NOT produced by any transpiler. Five sibling
//  implementations mirror it method for method:
//
//      ts/src/base/OrderRouter.ts          (the reference implementation)
//      python/ccxt/base/order_router.py
//      cs/ccxt/base/OrderRouter.cs
//      go/v4/exchange_order_router.go
//      rust/ccxt-base/src/order_router.rs
//
//  Every construct below is deliberately one that TypeScript, Python, C#, Go and Rust
//  can express the same way. The rules that keep the six ports honest:
//
//    - plain dictionaries and arrays only, never a language-specific container
//    - NO NULLS in any returned structure. 0 means "unknown number", '' means
//      "unknown string", and a boolean companion field carries "was it known?"
//      wherever that distinction is load-bearing
//    - never iterate a hash map to produce ORDERED output. Build arrays and
//      search them linearly: map iteration order differs per language
//    - all numbers are IEEE-754 doubles and every arithmetic sequence is written
//      in a fixed order, so the six ports agree bit for bit
//    - ONE number grammar, hand-rolled in all six (see parseNumber). No port
//      calls its own parser: floatval answers 0 for 'abc' and PCRE's \s is not
//      JavaScript's whitespace set, while parseFloat reads the leading numeric
//      prefix and nothing else. A cap read as 1234.5 in one language and 1 in
//      another is a cap that silently disappears
//    - NaN and +/-INF are NOT numbers here. An infinite tolerance disables the
//      halt verdict and an infinite rate disables the cap, so both fall back to
//      the caller's default — in all six, identically
//    - NEVER compare two numbers with ===. It compares type as well as value, so
//      an int 0 and a float 0.0 — which the same JSON produces on different keys
//      — would not match, and whole legs would drop out of a hop total
//    - violation and verdict strings are CONSTANTS, never interpolated with
//      numbers: "25" and "25.0" are the same value and different text
//
//  PHP notes, and the only two places this port reads differently from the
//  TypeScript:
//
//    - PHP arrays are values, not references. Every helper that MUTATES a report,
//      a step list or a position list therefore takes it by reference (&$report).
//      The TypeScript relies on object identity for exactly the same effect.
//    - this is the SYNCHRONOUS port, alongside php/Precise.php. parallel_within_hop
//      therefore places a hop's legs one after another rather than concurrently.
//      The report it produces is identical, because placeStep contains its own
//      failures and never throws — which is the property "wait for all" rests on
//      in every language.
//
//  This class never moves funds between venues. There is no call to any
//  funds-transfer endpoint anywhere in it, deliberately and permanently.
//  ---------------------------------------------------------------------------

namespace ccxt;

class OrderRouter {

    //  defaults, mirrored as constants in every port
    const DEFAULT_BASE_URL = 'https://docs.ccxt.com/router/api';
    const DEFAULT_TIMEOUT_MS = 30000;
    const DEFAULT_SLIPPAGE_BPS = 25;
    const DEFAULT_RECONCILE_TOLERANCE = 0.02;

    //  How long retryFailedSteps waits before re-placing a step the venue rejected. A second is
    //  the shortest delay that lets a transient cause clear (a rate limit window, a momentary
    //  balance lag) without turning a retry budget into a burst against a venue that just said no.
    const DEFAULT_RETRY_DELAY_MS = 1000;

    //  NO_CAP is the default: this class does not decide how much of your money you
    //  may trade. $maxNotionalUsd is an OPT-IN guardrail — set it and it is honoured
    //  exactly, at whatever value you choose; leave it unset and no notional check runs
    //  at all.
    //
    //  It used to be a hard 25 USD ceiling that could be lowered but never raised. That
    //  number came from CLAUDE.md §5.5, which governs THIS REPOSITORY'S live tests
    //  against real exchanges — not the people using the library. A client that refuses
    //  a 30 USD order because its own test suite is cautious is broken as a product.
    const NO_CAP = 0;

    //  router-side caps on the `balances` query parameter; both REJECT rather
    //  than truncate server-side, so the client trims before sending
    const MAX_BALANCE_ENTRIES = 64;
    const MAX_BALANCE_CHARS = 4096;

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
    const MAX_EXECUTED_PLAN_IDS = 1024;

    //  relative tolerance for float comparisons; also the tolerance the six
    //  test suites compare fixture numbers with
    const TOLERANCE = 1e-9;

    //  Static text for every violation code. Kept out of the methods so that a
    //  port can copy the table verbatim and a reviewer can diff two languages by
    //  eye. No number is ever interpolated into these.
    const VIOLATION_MESSAGES = array(
        'empty_plan' => 'the plan contains no steps',
        'route_unroutable' => 'the route carries an unroutableReason and must not be executed',
        'partial_fill' => 'the route does not fill completely at the requested size',
        'unknown_symbol' => 'the symbol is not listed on that venue',
        'market_mismatch' => 'the venue market trades a different pair than the route hop says it does',
        'invalid_step' => 'the step has a non-positive amount or price, or a side that is neither buy nor sell',
        'amount_below_minimum' => 'the amount is below the market minimum',
        'amount_above_maximum' => 'the amount is above the market maximum',
        'cost_below_minimum' => 'the notional is below the market minimum cost',
        'price_out_of_range' => 'the limit price falls outside the market price limits',
        'notional_unvaluable' => 'the step cannot be valued in USD, so the notional cap cannot be enforced',
        'notional_exceeds_cap' => 'the notional exceeds the per-trade USD cap',
        'amount_precision' => 'the amount does not sit on the market amount precision',
        'price_precision' => 'the limit price does not sit on the market price precision',
    );

    const KNOWN_STRATEGIES = array('dry_run', 'sequential', 'parallel_within_hop', 'limit_protected', 'best_effort', 'atomic_ish');

    //  the query keys forwarded to GET /route, in a fixed order so that two ports
    //  build a byte-identical URL
    const ROUTE_QUERY_KEYS = array('amountIn', 'amountOut', 'strategy', 'maxVenues', 'bridges', 'exchanges', 'balances', 'balanceMode', 'includeQuotes', 'includeFees', 'certified', 'requireFullFill', 'hopPenaltyBps', 'minLegNotional');

    public $apiKey;
    public $baseUrl;
    public $timeoutMs;
    public $maxNotionalUsd;
    //  in-process idempotency ledger: the identity of every plan this instance has
    //  already executed live. TWO structures for one ledger, in every port: a FIFO list
    //  that fixes the eviction order, and an array keyed by plan id so the membership
    //  test is a key lookup rather than a scan whose cost grows with the ledger. They
    //  are written and evicted together and must never disagree.
    public $executedPlanIds;
    public $executedPlanIdSet;

    /**
     * creates a client for the CCXT order-router service
     * @param array $config client configuration
     *     string  apiKey          the router API key, sent as the x-api-key header (required)
     *     string  baseUrl         router base url, defaults to https://docs.ccxt.com/router/api
     *     int     timeoutMs       request timeout in milliseconds, defaults to 30000
     *     float   maxNotionalUsd  per-trade USD notional cap, an OPT-IN guardrail; defaults to 0, which is NO CAP
     */
    public function __construct($config = array()) {
        $apiKey = $this->stringAt($config, 'apiKey', '');
        if ($apiKey === '') {
            throw new ArgumentsRequired('OrderRouter requires an apiKey');
        }
        $this->apiKey = $apiKey;
        $baseUrl = $this->stringAt($config, 'baseUrl', self::DEFAULT_BASE_URL);
        while ((strlen($baseUrl) > 0) && (substr($baseUrl, -1) === '/')) {
            $baseUrl = substr($baseUrl, 0, strlen($baseUrl) - 1);
        }
        $this->baseUrl = $baseUrl;
        $this->timeoutMs = $this->numberAt($config, 'timeoutMs', self::DEFAULT_TIMEOUT_MS);
        $maxNotionalUsd = $this->numberAt($config, 'maxNotionalUsd', self::NO_CAP);
        if ($maxNotionalUsd < 0) {
            //  a negative cap is a typo, not a policy, and silently ignoring it would
            //  leave the caller believing a guardrail is in place
            throw new BadRequest('OrderRouter maxNotionalUsd must not be negative; omit it, or pass 0, for no cap');
        }
        //  0 means NO CAP. Any positive value is honoured exactly — it is not clamped,
        //  because the caller is the one who knows the size of their own trade.
        $this->maxNotionalUsd = $maxNotionalUsd;
        $this->executedPlanIds = array();
        $this->executedPlanIdSet = array();
    }

    //  -----------------------------------------------------------------------
    //  small container accessors. Every port has these; they exist so the six
    //  implementations read line for line and so a missing key is never a
    //  language-specific crash.
    //  -----------------------------------------------------------------------

    /**
     * @ignore
     * reads one raw field out of an array, an ArrayAccess or a plain object
     * @param mixed $container the container to read from
     * @param string $key the field name
     * @return mixed the value, or null when absent
     */
    public function fieldAt($container, $key) {
        if ($container === null) {
            return null;
        }
        if (is_array($container)) {
            return array_key_exists($key, $container) ? $container[$key] : null;
        }
        if ($container instanceof \ArrayAccess) {
            return $container->offsetExists($key) ? $container[$key] : null;
        }
        if (is_object($container)) {
            //  an exchange instance is an object; its markets and features are
            //  plain public properties
            return isset($container->$key) ? $container->$key : null;
        }
        return null;
    }

    /**
     * @ignore
     * the price a step is sent at, derived from expectedPrice when the caller gave no limitPrice
     * @param array $step one step of an execution plan
     * @return float the limit price to use, 0 only when the step has neither field
     */
    public function stepLimitPrice($step) {
        //  buildExecutionPlan always sets limitPrice, but a HAND-BUILT plan need not: the manual
        //  documents it as optional, and the "execute your own plans" path is the whole point of
        //  execute() taking a plan rather than a route. Reading it as 0 made every such plan fail
        //  three different ways - a blocking price_out_of_range from checkExecutionPlanSafety, a
        //  rounded_to_zero before any strategy branch in placeStep, and a buy-side balance
        //  requirement of amount * 0 - so the documented example could not place one order.
        //  expectedPrice is the honest fallback: it is what the caller says the step is worth, and
        //  it is already guaranteed positive by the invalid_step guard. A caller wanting a tighter
        //  or looser bound sets limitPrice explicitly.
        $limitPrice = $this->numberAt($step, 'limitPrice', 0);
        if ($limitPrice > 0) {
            return $limitPrice;
        }
        return $this->numberAt($step, 'expectedPrice', 0);
    }

    /**
     * @ignore
     * the step's quote-side value, derived from amount and expectedPrice when absent
     * @param array $step one step of an execution plan
     * @return float the notional in the market's quote currency
     */
    public function stepNotionalQuote($step) {
        //  Same reasoning as stepLimitPrice, and the same formula buildExecutionPlan uses. Read as
        //  0, a hand-built plan tripped the BLOCKING cost_below_minimum on every market declaring
        //  a minimum cost.
        $notionalQuote = $this->numberAt($step, 'notionalQuote', 0);
        if ($notionalQuote > 0) {
            return $notionalQuote;
        }
        return $this->numberAt($step, 'amount', 0) * $this->numberAt($step, 'expectedPrice', 0);
    }

    /**
     * @ignore
     * reads a numeric field out of a container, with a default for missing, null and unparseable values
     * @param mixed $container the container to read from
     * @param string $key the field name
     * @param float $defaultValue value returned when the field is absent or not a number
     * @return float the number
     */
    public function numberAt($container, $key, $defaultValue) {
        $value = $this->fieldAt($container, $key);
        if ($value === null) {
            return $defaultValue;
        }
        if (is_bool($value)) {
            //  a boolean is not a number, exactly as `typeof value === 'number'`
            //  is false for one in the reference
            return $defaultValue;
        }
        if (is_int($value)) {
            //  the int stays an int, so a PHP report json_encodes to the same text
            //  the other four ports produce. What must NEVER happen is comparing
            //  one of these with === against a float that means the same number —
            //  see the == comparisons in reconcileExecutionStep and below.
            return $value;
        }
        if (is_float($value)) {
            //  NaN and +/-INF are not numbers this class will act on. An infinite
            //  tolerance silently disables the halt verdict and an infinite rate
            //  silently disables the cap, and "the default" is the only answer
            //  six languages can agree on for either.
            if (!$this->isFiniteNumber($value)) {
                return $defaultValue;
            }
            return $value;
        }
        if (is_string($value)) {
            return $this->parseNumber($value, $defaultValue);
        }
        return $defaultValue;
    }

    /**
     * @ignore
     * reports whether a double is a real number, i.e. neither NaN nor an infinity
     * @param float $value the number to test
     * @return bool true when the value is finite
     */
    public function isFiniteNumber($value) {
        if ($value != $value) {
            //  the one NaN test that needs no library in any of the six
            return false;
        }
        if (($value > 1.7976931348623157e308) || ($value < -1.7976931348623157e308)) {
            return false;
        }
        return true;
    }

    /**
     * @ignore
     * reads the leading numeric prefix of a string, exactly as JavaScript's parseFloat does, and returns the default when there is not one or when the result is not finite
     * @param string $text the text to read
     * @param float $defaultValue value returned when the text does not start with a number
     * @return float the number
     */
    public function parseNumber($text, $defaultValue) {
        //  Hand-rolled rather than delegated to floatval or a regex, because
        //  every language's own parser disagrees with the other four somewhere:
        //  Python reads '1_000' as 1000 and '1,234.5' not at all, PCRE's \s is
        //  not JavaScript's whitespace set, C# trims Unicode whitespace
        //  JavaScript does not. The grammar below is JavaScript's
        //  StrDecimalLiteral prefix over the ASCII whitespace set, and it is the
        //  SAME twenty lines in all six ports.
        if ($text === null) {
            return $defaultValue;
        }
        $length = strlen($text);
        $cursor = 0;
        while (($cursor < $length) && $this->isRouterSpace($text[$cursor])) {
            $cursor = $cursor + 1;
        }
        $start = $cursor;
        if (($cursor < $length) && (($text[$cursor] === '+') || ($text[$cursor] === '-'))) {
            $cursor = $cursor + 1;
        }
        $digits = 0;
        while (($cursor < $length) && ($text[$cursor] >= '0') && ($text[$cursor] <= '9')) {
            $cursor = $cursor + 1;
            $digits = $digits + 1;
        }
        if (($cursor < $length) && ($text[$cursor] === '.')) {
            $cursor = $cursor + 1;
            while (($cursor < $length) && ($text[$cursor] >= '0') && ($text[$cursor] <= '9')) {
                $cursor = $cursor + 1;
                $digits = $digits + 1;
            }
        }
        if ($digits === 0) {
            //  'Infinity', 'inf', 'NaN', '' and a string of Arabic-Indic digits
            //  all land here, in all six
            return $defaultValue;
        }
        $end = $cursor;
        if (($cursor < $length) && (($text[$cursor] === 'e') || ($text[$cursor] === 'E'))) {
            $exponent = $cursor + 1;
            if (($exponent < $length) && (($text[$exponent] === '+') || ($text[$exponent] === '-'))) {
                $exponent = $exponent + 1;
            }
            $exponentDigits = 0;
            while (($exponent < $length) && ($text[$exponent] >= '0') && ($text[$exponent] <= '9')) {
                $exponent = $exponent + 1;
                $exponentDigits = $exponentDigits + 1;
            }
            if ($exponentDigits > 0) {
                //  a trailing 'e' with no digits is not part of the number: JS
                //  reads '1e' as 1, and so does every port here
                $end = $exponent;
            }
        }
        $parsed = floatval(substr($text, $start, $end - $start));
        if (!$this->isFiniteNumber($parsed)) {
            //  '1e400' overflows to an infinity, which is not a number the cap or
            //  the tolerance may be built out of
            return $defaultValue;
        }
        return $parsed;
    }

    /**
     * @ignore
     * reports whether a character is one of the six ASCII spaces the number grammar skips
     * @param string $character a single character
     * @return bool true for space, tab, newline, carriage return, form feed and vertical tab
     */
    public function isRouterSpace($character) {
        //  deliberately NOT PCRE's \s: Python, PHP, C# and Go each draw the
        //  Unicode line in a different place, and a non-breaking space that
        //  parses in one language and not the others is drift
        return ($character === ' ') || ($character === "\t") || ($character === "\n") || ($character === "\r") || ($character === "\f") || ($character === "\v");
    }

    /**
     * @ignore
     * reads a string field out of a container, with a default for missing and null values
     * @param mixed $container the container to read from
     * @param string $key the field name
     * @param string $defaultValue value returned when the field is absent
     * @return string the string
     */
    public function stringAt($container, $key, $defaultValue) {
        $value = $this->fieldAt($container, $key);
        if ($value === null) {
            return $defaultValue;
        }
        if (is_string($value)) {
            return $value;
        }
        return $defaultValue;
    }

    /**
     * @ignore
     * reads a boolean field out of a container, with a default for missing and null values
     * @param mixed $container the container to read from
     * @param string $key the field name
     * @param bool $defaultValue value returned when the field is absent
     * @return bool the boolean
     */
    public function boolAt($container, $key, $defaultValue) {
        $value = $this->fieldAt($container, $key);
        if ($value === null) {
            return $defaultValue;
        }
        if (is_bool($value)) {
            return $value;
        }
        return $defaultValue;
    }

    /**
     * @ignore
     * reads an array field out of a container, returning an empty array when absent
     * @param mixed $container the container to read from
     * @param string $key the field name
     * @return array the list, never null
     */
    public function listAt($container, $key) {
        $value = $this->fieldAt($container, $key);
        if ($value === null) {
            return array();
        }
        //  a JSON array decodes to a PHP list; a JSON object decodes to a PHP
        //  associative array, and is not a list
        if (is_array($value) && array_is_list($value)) {
            return $value;
        }
        return array();
    }

    /**
     * @ignore
     * reads a nested dictionary out of a container, returning an empty dictionary when absent
     * @param mixed $container the container to read from
     * @param string $key the field name
     * @return array the dictionary, never null
     */
    public function dictAt($container, $key) {
        $value = $this->fieldAt($container, $key);
        if ($value === null) {
            return array();
        }
        if (is_array($value)) {
            if ((count($value) > 0) && array_is_list($value)) {
                //  a populated JSON array is not a dictionary
                return array();
            }
            return $value;
        }
        if (is_object($value)) {
            return get_object_vars($value);
        }
        return array();
    }

    /**
     * @ignore
     * formats a double as decimal text with no exponent, so that six languages produce the same string
     * @param float $value the number to format
     * @return string the number as fixed-point text with trailing zeros removed
     */
    public function formatNumber($value) {
        //  JavaScript prints 1e-7 where PHP prints 1.0E-7 and Go prints 1e-07;
        //  a fixed 12-decimal rendering with the trailing zeros trimmed is the
        //  one spelling all six languages agree on for the magnitudes a
        //  balance or an amount can take.
        $number = floatval($value);
        if (!is_finite($number)) {
            return '0';
        }
        if (abs($number) >= 1e18) {
            //  JavaScript's toFixed switches to exponent notation at 1e21 while
            //  the other five languages never do. Rather than let one language
            //  send a different string than the others, refuse — loudly, and at
            //  a magnitude no real amount reaches.
            throw new BadRequest('OrderRouter: a number this large cannot be rendered identically in all six languages');
        }
        $text = $this->toFixed12($number);
        if (strpos($text, '.') !== false) {
            $text = rtrim($text, '0');
            $text = rtrim($text, '.');
        }
        if (($text === '') || ($text === '-') || ($text === '-0')) {
            return '0';
        }
        return $text;
    }

    /**
     * @ignore
     * renders a finite double with exactly twelve decimals, from the exact binary value and
     * under JavaScript's toFixed tie rule
     * @param float $value the number to render
     * @return string the number with exactly twelve decimals
     */
    public function toFixed12($value) {
        //  The reference is TypeScript, and TypeScript's toFixed is ECMA-262's: the sign is
        //  stripped BEFORE the digits are chosen, so a tie rounds AWAY FROM ZERO on the
        //  magnitude and (-0.0001220703125).toFixed(12) is -0.000122070313, not -...312.
        //  PHP's '%.12F' rounds half to EVEN and would answer ...312, so the balances query
        //  string this feeds would differ per language on every value landing exactly on a
        //  half tick — 2^-13 included.
        //
        //  %F rather than %f: %f is locale-aware and would emit a comma in a de_DE process.
        //  53 decimals is PHP's maximum and is EXACT for every double whose expansion reaches
        //  the twelfth decimal: a double is m * 2^-k and its expansion terminates at digit k,
        //  so k <= 53 (|value| >= 2^-53) renders with no rounding at all, and anything smaller
        //  is below 1e-16 — its digits 13 and 14 are both 0, so no carry from digit 53 can
        //  reach the digit this rounds on.
        $negative = ($value < 0);
        //  abs() rather than a negation, so a negative zero renders WITHOUT a sign: the digit
        //  walk below assumes every byte it reads is a digit
        $magnitude = abs($value);
        $rendered = sprintf('%.53F', $magnitude);
        $dot = strpos($rendered, '.');
        $digits = substr($rendered, 0, $dot) . substr($rendered, $dot + 1);
        $integerLength = $dot;
        //  round half UP on the magnitude, reading the thirteenth decimal exactly
        $keep = $integerLength + 12;
        $roundUp = (ord($digits[$keep]) - 48) >= 5;
        $kept = substr($digits, 0, $keep);
        if ($roundUp) {
            $carry = 1;
            for ($i = strlen($kept) - 1; $i >= 0; $i--) {
                if ($carry === 0) {
                    break;
                }
                $digit = (ord($kept[$i]) - 48) + $carry;
                $carry = ($digit >= 10) ? 1 : 0;
                $kept[$i] = chr(($digit % 10) + 48);
            }
            if ($carry === 1) {
                $kept = '1' . $kept;
                $integerLength = $integerLength + 1;
            }
        }
        $sign = $negative ? '-' : '';
        return $sign . substr($kept, 0, $integerLength) . '.' . substr($kept, $integerLength);
    }

    /**
     * @ignore
     * percent-encodes a query value exactly as JavaScript's encodeURIComponent does
     * @param string $text the value to encode
     * @return string the encoded value
     */
    public function encodeUriComponent($text) {
        //  rawurlencode follows RFC 3986 and escapes ! * ' ( ), which
        //  encodeURIComponent leaves alone; put those five back so the six
        //  ports send a byte-identical url
        $encoded = rawurlencode($text);
        return str_replace(array('%21', '%2A', '%27', '%28', '%29'), array('!', '*', "'", '(', ')'), $encoded);
    }

    //  -----------------------------------------------------------------------
    //  I/O: the router HTTP client
    //  -----------------------------------------------------------------------

    /**
     * asks the router how to convert one asset into another, over the venues and bridges it has live books for
     * @see https://docs.ccxt.com/router/api
     * @param string $fromAsset the asset being spent, e.g. USDT
     * @param string $toAsset the asset being acquired, e.g. BTC
     * @param array $params request parameters
     *     float        amountIn        exact amount of fromAsset to spend — supply this OR amountOut, never both
     *     float        amountOut       exact amount of toAsset to acquire — supply this OR amountIn, never both
     *     string       strategy        best_single, split_optimal or split_capped
     *     int          maxVenues       per-hop venue cap for split_capped
     *     string|array exchanges       venue allowlist
     *     string|array bridges         intermediary assets to consider
     *     string       balances        what you hold, as [exchangeId.]ASSET:amount entries
     *     string       balanceMode     cap (default) or require
     *     bool         includeQuotes   return the per-venue diagnostic
     *     bool         includeFees     rank on fee-adjusted price, default true
     *     bool         certified       restrict to CCXT-certified venues
     *     bool         requireFullFill refuse partial fills
     *     float        hopPenaltyBps   how much better a bridged route must be per extra hop
     *     float        minLegNotional  suppress legs below this quote notional
     * @return array a RouteResult — an unroutable pair comes back as a RouteResult with an unroutableReason, not as an exception
     */
    public function fetchRoute($fromAsset, $toAsset, $params = array()) {
        if (($fromAsset === null) || ($toAsset === null) || ($fromAsset === '') || ($toAsset === '')) {
            throw new ArgumentsRequired('fetchRoute requires fromAsset and toAsset');
        }
        $hasAmountIn = isset($params['amountIn']);
        $hasAmountOut = isset($params['amountOut']);
        if ($hasAmountIn === $hasAmountOut) {
            //  refused client-side for the same reason the router refuses it: a
            //  typo must not become a confidently wrong route
            throw new BadRequest('fetchRoute requires exactly one of amountIn or amountOut');
        }
        $query = 'from=' . $this->encodeUriComponent(strtoupper($fromAsset)) . '&to=' . $this->encodeUriComponent(strtoupper($toAsset));
        $keys = self::ROUTE_QUERY_KEYS;
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            $value = $this->fieldAt($params, $key);
            if ($value === null) {
                continue;
            }
            $text = '';
            if (is_bool($value)) {
                $text = $value ? 'true' : 'false';
            } elseif (is_int($value) || is_float($value)) {
                $text = $this->formatNumber($value);
            } elseif (is_array($value)) {
                $text = implode(',', $value);
            } else {
                $text = strval($value);
            }
            $query = $query . '&' . $key . '=' . $this->encodeUriComponent($text);
        }
        $url = $this->baseUrl . '/route?' . $query;
        $route = $this->request($url);
        //  Stamp the client's OWN record of the question onto the answer, so buildExecutionPlan
        //  can check that the route it is about to turn into real orders runs from the asset the
        //  caller offered to the asset the caller wanted — rather than trusting the server's echo.
        $route['clientRequestedFrom'] = strtoupper($fromAsset);
        $route['clientRequestedTo'] = strtoupper($toAsset);
        return $route;
    }

    /**
     * @ignore
     * performs the authenticated GET and maps router status codes onto CCXT exceptions
     * @param string $url the fully-formed url including the query string
     * @return array the decoded JSON body
     */
    public function request($url) {
        $headers = array(
            'x-api-key: ' . $this->apiKey,
            'Accept: application/json',
        );
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPGET, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_TIMEOUT_MS, intval($this->timeoutMs));
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT_MS, intval($this->timeoutMs));
        $text = curl_exec($curl);
        $errorNumber = curl_errno($curl);
        $errorMessage = curl_error($curl);
        $status = intval(curl_getinfo($curl, CURLINFO_RESPONSE_CODE));
        curl_close($curl);
        if ($errorNumber !== 0) {
            if (($errorNumber === CURLE_OPERATION_TIMEOUTED) || ($errorNumber === 28)) {
                throw new RequestTimeout('OrderRouter request timed out after ' . $this->timeoutMs . 'ms');
            }
            throw new ExchangeNotAvailable('OrderRouter request failed: ' . $errorMessage);
        }
        $body = json_decode($text, true);
        if (!is_array($body)) {
            throw new ExchangeError('OrderRouter returned a non-JSON body');
        }
        if (($status >= 200) && ($status < 300)) {
            return $body;
        }
        //  404 and 501 carry a complete RouteResult explaining the refusal —
        //  `no_market` and `exact_out_multi_hop_unsupported` are routing
        //  outcomes, and turning them into exceptions would make the caller
        //  parse an error string to recover a structure it already has
        if ((($status === 404) || ($status === 501)) && ($this->stringAt($body, 'unroutableReason', '') !== '')) {
            return $body;
        }
        $message = $this->stringAt($body, 'error', 'http status ' . $status);
        if ($status === 400) {
            throw new BadRequest('OrderRouter: ' . $message);
        }
        if (($status === 401) || ($status === 403)) {
            throw new AuthenticationError('OrderRouter: ' . $message);
        }
        if ($status === 429) {
            throw new RateLimitExceeded('OrderRouter: ' . $message);
        }
        if (($status === 408) || ($status === 504)) {
            throw new RequestTimeout('OrderRouter: ' . $message);
        }
        throw new ExchangeError('OrderRouter: ' . $message);
    }

    /**
     * reads the live balances of the supplied venues, sends them to the router, and returns a route you can actually fund
     * @param string $fromAsset the asset being spent
     * @param string $toAsset the asset being acquired
     * @param array $venues a dictionary of exchangeId to a ccxt exchange instance
     * @param array $params the same parameters fetchRoute accepts, minus balances which this method builds
     *     bool requireBalancesApplied throw when the router did not echo balancesApplied, default true
     * @return array the RouteResult, with the client-side keys balancesUsed and balancesDropped added
     */
    public function fetchRouteWithBalances($fromAsset, $toAsset, $venues, $params = array()) {
        $this->assertSyncVenues($venues);
        $requireApplied = $this->boolAt($params, 'requireBalancesApplied', true);
        $exchangeIds = array_keys($venues);
        sort($exchangeIds, SORT_STRING);
        $entries = array();
        $dropped = array();
        for ($i = 0; $i < count($exchangeIds); $i++) {
            $exchangeId = $exchangeIds[$i];
            $venue = $venues[$exchangeId];
            $balance = $venue->fetchBalance();
            $holdings = $this->dictAt($balance, 'free');
            if (count($holdings) === 0) {
                $holdings = $this->dictAt($balance, 'total');
            }
            $codes = array_keys($holdings);
            sort($codes, SORT_STRING);
            for ($j = 0; $j < count($codes); $j++) {
                $code = $codes[$j];
                $amount = floatval($this->numberAt($holdings, $code, 0));
                if ($amount <= 0) {
                    //  a zero holding is not information, and it costs one of
                    //  the router's 64 entries
                    continue;
                }
                if ($amount >= 1e18) {
                    //  beyond fixed-point rendering; reported rather than sent,
                    //  because a silently reshaped amount is worse than a
                    //  missing one
                    $dropped[] = array('exchangeId' => $exchangeId, 'asset' => $code, 'amount' => $amount, 'reason' => 'amount_out_of_range');
                    continue;
                }
                $entries[] = array('exchangeId' => $exchangeId, 'asset' => $code, 'amount' => $amount);
            }
        }
        //  largest first, so trimming to the router's caps drops the smallest
        //  holdings. Ties break on exchangeId then asset so six languages
        //  produce the same list from the same wallet.
        usort($entries, function ($a, $b) {
            $amountA = floatval($a['amount']);
            $amountB = floatval($b['amount']);
            if ($amountA !== $amountB) {
                return ($amountA > $amountB) ? -1 : 1;
            }
            if ($a['exchangeId'] !== $b['exchangeId']) {
                return ($a['exchangeId'] < $b['exchangeId']) ? -1 : 1;
            }
            return ($a['asset'] < $b['asset']) ? -1 : 1;
        });
        while (count($entries) > self::MAX_BALANCE_ENTRIES) {
            $removed = array_pop($entries);
            $removed['reason'] = 'entry_cap';
            $dropped[] = $removed;
        }
        $balances = $this->joinBalances($entries);
        while ((strlen($balances) > self::MAX_BALANCE_CHARS) && (count($entries) > 0)) {
            $removed = array_pop($entries);
            $removed['reason'] = 'char_cap';
            $dropped[] = $removed;
            $balances = $this->joinBalances($entries);
        }
        $routeParams = array();
        $keys = array_keys($params);
        for ($i = 0; $i < count($keys); $i++) {
            $routeParams[$keys[$i]] = $params[$keys[$i]];
        }
        $routeParams['balances'] = $balances;
        $route = $this->fetchRoute($fromAsset, $toAsset, $routeParams);
        if ($requireApplied && ($balances !== '')) {
            //  /route declares its query without a JSON schema, so a router that
            //  predates the balances feature answers byte-identically to one
            //  that never received it. Executing a plan computed against a
            //  portfolio the server never saw is the case worth failing on.
            if ($this->stringAt($route, 'balancesApplied', '') === '') {
                throw new ExchangeError('OrderRouter did not echo balancesApplied: the balances were ignored, so this route is not funded-aware');
            }
        }
        $route['balancesUsed'] = $balances;
        $route['balancesDropped'] = $dropped;
        return $route;
    }

    /**
     * @ignore
     * renders balance entries as the router's [exchangeId.]ASSET:amount comma-separated form
     * @param array $entries the entries to render
     * @return string the balances query value
     */
    public function joinBalances($entries) {
        $text = '';
        for ($i = 0; $i < count($entries); $i++) {
            $entry = $entries[$i];
            if ($i > 0) {
                $text = $text . ',';
            }
            $text = $text . $entry['exchangeId'] . '.' . $entry['asset'] . ':' . $this->formatNumber($entry['amount']);
        }
        return $text;
    }

    //  -----------------------------------------------------------------------
    //  PURE: buildExecutionPlan
    //  -----------------------------------------------------------------------

    /**
     * flattens a RouteResult's hops and legs into a flat, ordered list of orders to place. PURE — no I/O, and the same input produces the same output in all six languages
     * @param array $route a RouteResult as returned by fetchRoute
     * @param array $options plan options
     *     float slippageBps             how far the limit price is set past the expected price, default 25
     *     float reconcileToleranceRatio the shortfall ratio reconcileExecutionStep halts on, default 0.02
     * @return array an execution plan whose steps carry stepIndex, hopIndex, legIndex, exchangeId, symbol, side, amount, expectedPrice, limitPrice and notionalQuote
     */
    /**
     * @ignore
     * refuses a route whose hops do not connect, or that does not run from the asset the caller
     * offered to the asset the caller wanted. buildExecutionPlan used to copy from, to, pair and
     * side straight out of the server's JSON, and the safety checks only tested internal
     * consistency against whatever market that named — so a compromised or simply buggy router
     * response could steer real orders into any real market and every check would pass it
     * @param array $route the route to check
     * @param array $hops the route's hops
     * @return void
     */
    /**
     * @ignore
     * sums the fees an order charged in one asset, ignoring any other currency
     * @param array $order the order as the venue returned it
     * @param string $asset the asset to count fees in
     * @return float the total charged in that asset, 0 when there is none
     */
    public function orderFeeInAsset($order, $asset) {
        if ($asset === '') {
            return 0;
        }
        $total = 0;
        //  ccxt reports the same cut in up to three places, so this is a strict THREE-TIER
        //  PRECEDENCE and never a sum across tiers: the `fees` list wins outright; if it named
        //  no entry in this asset, the single `fee` is read; only if that named nothing either
        //  are the per-trade fees totalled. `sawInList` is what makes each tier exclusive of
        //  the ones below it — safeOrder fills `fee` and `fees` from the same charge, and the
        //  per-trade fees are usually that same charge again, so adding tiers together would
        //  double- or triple-count. Within ONE tier every matching entry IS summed.
        $fees = $this->listAt($order, 'fees');
        $sawInList = false;
        for ($i = 0; $i < count($fees); $i++) {
            $entry = $fees[$i];
            if (strtoupper($this->stringAt($entry, 'currency', '')) === strtoupper($asset)) {
                $total = $total + $this->numberAt($entry, 'cost', 0);
                $sawInList = true;
            }
        }
        if (!$sawInList) {
            $single = $this->dictAt($order, 'fee');
            if (strtoupper($this->stringAt($single, 'currency', '')) === strtoupper($asset)) {
                $total = $total + $this->numberAt($single, 'cost', 0);
                $sawInList = true;
            }
        }
        if (!$sawInList) {
            //  Last resort: a venue that reports its cut only per trade. The Go port has no
            //  `fees` list on its typed Order at all, so this fallback is what lets all six
            //  ports read the same fee off the same order — and reading NOTHING here is the
            //  dangerous direction, not the safe one: an unread fee leaves outAmount GROSS,
            //  which sizes the next hop on money the venue already took.
            $trades = $this->listAt($order, 'trades');
            for ($i = 0; $i < count($trades); $i++) {
                $tradeFee = $this->dictAt($trades[$i], 'fee');
                if (strtoupper($this->stringAt($tradeFee, 'currency', '')) === strtoupper($asset)) {
                    $total = $total + $this->numberAt($tradeFee, 'cost', 0);
                }
            }
        }
        if (!$this->isFiniteNumber($total) || $total < 0) {
            return 0;
        }
        return $total;
    }

    public function assertRouteChainIsCoherent($route, $hops) {
        if (count($hops) === 0) {
            return;
        }
        $carried = '';
        for ($i = 0; $i < count($hops); $i++) {
            $hop = $hops[$i];
            $side = strtolower($this->stringAt($hop, 'side', ''));
            $baseCode = strtoupper($this->stringAt($hop, 'base', ''));
            $quote = strtoupper($this->stringAt($hop, 'quote', ''));
            if ($baseCode === '' || $quote === '' || ($side !== 'buy' && $side !== 'sell')) {
                throw new ExchangeError('OrderRouter: hop ' . strval($i) . ' does not name a market and a side');
            }
            //  a buy spends the quote to acquire the base; a sell is the reverse
            $spends = ($side === 'buy') ? $quote : $baseCode;
            $produces = ($side === 'buy') ? $baseCode : $quote;
            if ($i > 0 && $spends !== $carried) {
                //  hop N+1 must spend exactly what hop N produced, or the plan strands the
                //  proceeds of one order and funds the next from a wallet nobody checked
                throw new ExchangeError('OrderRouter: hop ' . strval($i) . ' spends ' . $spends . ' but the previous hop produced ' . $carried);
            }
            if ($i === 0) {
                $requestedFrom = $this->stringAt($route, 'clientRequestedFrom', '');
                if ($requestedFrom !== '' && $spends !== $requestedFrom) {
                    throw new ExchangeError('OrderRouter: the route spends ' . $spends . ', not the requested ' . $requestedFrom);
                }
            }
            $carried = $produces;
        }
        $requestedTo = $this->stringAt($route, 'clientRequestedTo', '');
        if ($requestedTo !== '' && $carried !== $requestedTo) {
            throw new ExchangeError('OrderRouter: the route produces ' . $carried . ', not the requested ' . $requestedTo);
        }
    }

    public function buildExecutionPlan($route, $options = array()) {
        $slippageBps = $this->numberAt($options, 'slippageBps', self::DEFAULT_SLIPPAGE_BPS);
        $tolerance = $this->numberAt($options, 'reconcileToleranceRatio', self::DEFAULT_RECONCILE_TOLERANCE);
        $hops = $this->listAt($route, 'hops');
        $this->assertRouteChainIsCoherent($route, $hops);
        $steps = array();
        $stepIndex = 0;
        for ($hopIndex = 0; $hopIndex < count($hops); $hopIndex++) {
            $hop = $hops[$hopIndex];
            $symbol = $this->stringAt($hop, 'pair', '');
            $side = $this->stringAt($hop, 'side', '');
            $base = $this->stringAt($hop, 'base', '');
            $quote = $this->stringAt($hop, 'quote', '');
            $legs = $this->listAt($hop, 'legs');
            for ($legIndex = 0; $legIndex < count($legs); $legIndex++) {
                $leg = $legs[$legIndex];
                //  leg amounts are always in BASE units, on both sides of the
                //  market — see the router's RoutingQuote.filledAmount contract
                $amount = $this->numberAt($leg, 'amount', 0);
                $expectedPrice = $this->numberAt($leg, 'averagePrice', 0);
                $effectivePrice = $this->numberAt($leg, 'effectivePrice', $expectedPrice);
                //  the limit sits on the side that costs you: above for a buy,
                //  below for a sell
                $limitPrice = 0;
                if ($side === 'buy') {
                    $limitPrice = $expectedPrice * (1 + $slippageBps / 10000);
                } else {
                    $limitPrice = $expectedPrice * (1 - $slippageBps / 10000);
                }
                $steps[] = array(
                    'stepIndex' => $stepIndex,
                    'hopIndex' => $hopIndex,
                    'legIndex' => $legIndex,
                    'exchangeId' => $this->stringAt($leg, 'exchangeId', ''),
                    'symbol' => $symbol,
                    'side' => $side,
                    'base' => $base,
                    'quote' => $quote,
                    'amount' => $amount,
                    'expectedPrice' => $expectedPrice,
                    'effectivePrice' => $effectivePrice,
                    'limitPrice' => $limitPrice,
                    'notionalQuote' => $amount * $expectedPrice,
                );
                $stepIndex = $stepIndex + 1;
            }
        }
        return array(
            'requestId' => $this->stringAt($route, 'requestId', ''),
            'calculatedAt' => $this->numberAt($route, 'calculatedAt', 0),
            'from' => $this->stringAt($route, 'from', ''),
            'to' => $this->stringAt($route, 'to', ''),
            'routingStrategy' => $this->stringAt($route, 'strategy', ''),
            'exactSide' => $this->stringAt($route, 'exactSide', ''),
            'amountIn' => $this->numberAt($route, 'amountIn', 0),
            'amountOut' => $this->numberAt($route, 'amountOut', 0),
            'fullyFillable' => $this->boolAt($route, 'fullyFillable', false),
            'fillRatio' => $this->numberAt($route, 'fillRatio', 0),
            'unroutableReason' => $this->stringAt($route, 'unroutableReason', ''),
            'hopCount' => count($hops),
            'stepCount' => count($steps),
            'slippageBps' => $slippageBps,
            'reconcileToleranceRatio' => $tolerance,
            'steps' => $steps,
        );
    }

    //  -----------------------------------------------------------------------
    //  PURE: checkExecutionPlanSafety
    //  -----------------------------------------------------------------------

    /**
     * checks a plan against per-venue market rules and, when one is set, the opt-in per-trade USD notional cap. PURE — no I/O. A step that cannot be valued in USD BLOCKS; it is never skipped, because a cap that silently disappears when a rate is missing is not a cap
     * @param array $plan a plan from buildExecutionPlan, or a caller-assembled plan of the same shape — this method never assumes the plan came from the routing service
     * @param array $markets a dictionary of exchangeId to that exchange's markets dictionary, i.e. markets[exchangeId][symbol]
     * @param array $options check options
     *     array  usdRates       a dictionary of currency code to its USD price. USD itself is 1 implicitly; nothing else is assumed
     *     float  maxNotionalUsd per-trade cap, honoured exactly; 0 — the default — means no notional check runs at all
     *     string precisionMode  tick_size (default) or decimal_places, matching the venue's precisionMode
     * @return array the violations, each with stepIndex, code, blocking, actual, limit and a constant message. An empty array means the plan passed
     */
    public function checkExecutionPlanSafety($plan, $markets, $options = array()) {
        $violations = array();
        //  Honoured exactly as given, per call or per client. No clamping: a caller
        //  trading thousands and a caller trading cents are both using this correctly.
        $maxNotionalUsd = $this->numberAt($options, 'maxNotionalUsd', $this->maxNotionalUsd);
        $capInForce = $maxNotionalUsd > 0;
        $usdRates = $this->dictAt($options, 'usdRates');
        $precisionMode = $this->stringAt($options, 'precisionMode', 'tick_size');
        $steps = $this->listAt($plan, 'steps');
        if (count($steps) === 0) {
            //  an empty plan passing an empty violation list would read as "safe"
            $violations[] = $this->violation(-1, '', '', 'empty_plan', true, 0, 0);
            return $violations;
        }
        $unroutableReason = $this->stringAt($plan, 'unroutableReason', '');
        if ($unroutableReason !== '') {
            $violations[] = $this->violation(-1, '', '', 'route_unroutable', true, 0, 0);
        }
        if (!$this->boolAt($plan, 'fullyFillable', false)) {
            $violations[] = $this->violation(-1, '', '', 'partial_fill', false, $this->numberAt($plan, 'fillRatio', 0), 1);
        }
        for ($i = 0; $i < count($steps); $i++) {
            $step = $steps[$i];
            $stepIndex = $this->numberAt($step, 'stepIndex', $i);
            $exchangeId = $this->stringAt($step, 'exchangeId', '');
            $symbol = $this->stringAt($step, 'symbol', '');
            $amount = $this->numberAt($step, 'amount', 0);
            $expectedPrice = $this->numberAt($step, 'expectedPrice', 0);
            $limitPrice = $this->stepLimitPrice($step);
            $notionalQuote = $this->stepNotionalQuote($step);
            $side = $this->stringAt($step, 'side', '');
            if (($amount <= 0) || ($expectedPrice <= 0) || (($side !== 'buy') && ($side !== 'sell'))) {
                $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'invalid_step', true, $amount, 0);
                continue;
            }
            $venueMarkets = $this->dictAt($markets, $exchangeId);
            $market = $this->dictAt($venueMarkets, $symbol);
            if (count($market) === 0) {
                $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'unknown_symbol', true, 0, 0);
                continue;
            }
            //  the same symbol string on a different venue is not necessarily
            //  the same pair, and the USD valuation below trusts the step's
            //  quote currency — so disagreement is fatal, not cosmetic
            $marketBase = $this->stringAt($market, 'base', '');
            $marketQuote = $this->stringAt($market, 'quote', '');
            $stepBase = $this->stringAt($step, 'base', '');
            $stepQuote = $this->stringAt($step, 'quote', '');
            if ((($marketBase !== '') && ($stepBase !== '') && ($marketBase !== $stepBase)) || (($marketQuote !== '') && ($stepQuote !== '') && ($marketQuote !== $stepQuote))) {
                $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'market_mismatch', true, 0, 0);
                continue;
            }
            $limits = $this->dictAt($market, 'limits');
            $amountLimits = $this->dictAt($limits, 'amount');
            $priceLimits = $this->dictAt($limits, 'price');
            $costLimits = $this->dictAt($limits, 'cost');
            $minAmount = $this->numberAt($amountLimits, 'min', 0);
            $maxAmount = $this->numberAt($amountLimits, 'max', 0);
            $minPrice = $this->numberAt($priceLimits, 'min', 0);
            $maxPrice = $this->numberAt($priceLimits, 'max', 0);
            $minCost = $this->numberAt($costLimits, 'min', 0);
            if (($minAmount > 0) && ($amount < $minAmount)) {
                $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'amount_below_minimum', true, $amount, $minAmount);
            }
            if (($maxAmount > 0) && ($amount > $maxAmount)) {
                $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'amount_above_maximum', true, $amount, $maxAmount);
            }
            if (($minCost > 0) && ($notionalQuote < $minCost)) {
                $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'cost_below_minimum', true, $notionalQuote, $minCost);
            }
            if ((($minPrice > 0) && ($limitPrice < $minPrice)) || (($maxPrice > 0) && ($limitPrice > $maxPrice))) {
                $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'price_out_of_range', true, $limitPrice, ($limitPrice < $minPrice) ? $minPrice : $maxPrice);
            }
            $precision = $this->dictAt($market, 'precision');
            $amountPrecision = $this->numberAt($precision, 'amount', 0);
            $pricePrecision = $this->numberAt($precision, 'price', 0);
            //  precision findings are advisory: execute() snaps through the
            //  venue's own amountToPrecision/priceToPrecision before sending
            if ($this->precisionViolated($amount, $amountPrecision, $precisionMode)) {
                $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'amount_precision', false, $amount, $amountPrecision);
            }
            if ($this->precisionViolated($limitPrice, $pricePrecision, $precisionMode)) {
                $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'price_precision', false, $limitPrice, $pricePrecision);
            }
            //  the notional cap. The worst case is the higher of the expected
            //  and the limit price, which is the buy side; a sell's limit sits
            //  below, so its expected price is the one that governs.
            $worstPrice = $expectedPrice;
            if ($limitPrice > $worstPrice) {
                $worstPrice = $limitPrice;
            }
            if ($capInForce) {
                //  Only when a cap is actually set. With no cap there is nothing to
                //  enforce, so a missing USD rate is not an error and the caller is not
                //  made to supply usdRates for a check they did not ask for.
                $worstNotional = $amount * $worstPrice;
                $usdValue = $this->notionalUsd($step, $worstNotional, $usdRates);
                if ($usdValue <= 0) {
                    //  BLOCKING, and deliberately so. Skipping the cap for a step whose
                    //  USD value is unknown defeats the cap the caller DID ask for.
                    $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'notional_unvaluable', true, $worstNotional, $maxNotionalUsd);
                } elseif ($usdValue > $maxNotionalUsd * (1 + self::TOLERANCE)) {
                    $violations[] = $this->violation($stepIndex, $exchangeId, $symbol, 'notional_exceeds_cap', true, $usdValue, $maxNotionalUsd);
                }
            }
        }
        return $violations;
    }

    /**
     * @ignore
     * builds one safety violation record
     * @param int $stepIndex the offending step, or -1 for a plan-level finding
     * @param string $exchangeId the venue
     * @param string $symbol the market
     * @param string $code the violation code
     * @param bool $blocking whether the violation forbids execution
     * @param float $actual the observed value
     * @param float $limit the value it was measured against
     * @return array the violation
     */
    public function violation($stepIndex, $exchangeId, $symbol, $code, $blocking, $actual, $limit) {
        return array(
            'stepIndex' => $stepIndex,
            'exchangeId' => $exchangeId,
            'symbol' => $symbol,
            'code' => $code,
            'blocking' => $blocking,
            'actual' => $actual,
            'limit' => $limit,
            'message' => $this->stringAt(self::VIOLATION_MESSAGES, $code, $code),
        );
    }

    /**
     * @ignore
     * values a step's quote-currency notional in USD, returning 0 when it cannot be valued
     * @param array $step the plan step, used for its base and quote currencies
     * @param float $notionalQuote the notional in the market's quote currency
     * @param array $usdRates a dictionary of currency code to USD price
     * @return float the USD value, or 0 when no rate covers either side of the market
     */
    public function notionalUsd($step, $notionalQuote, $usdRates) {
        $quote = $this->stringAt($step, 'quote', '');
        $quoteRate = $this->usdRateFor($quote, $usdRates);
        if ($quoteRate > 0) {
            return $notionalQuote * $quoteRate;
        }
        //  fall back to the base side: amount * usd(base) values the same trade
        $base = $this->stringAt($step, 'base', '');
        $baseRate = $this->usdRateFor($base, $usdRates);
        if ($baseRate > 0) {
            return $this->numberAt($step, 'amount', 0) * $baseRate;
        }
        return 0;
    }

    /**
     * @ignore
     * resolves the USD price of a currency, treating USD itself as 1 and assuming nothing about anything else
     * @param string $code the currency code
     * @param array $usdRates a dictionary of currency code to USD price
     * @return float the rate, or 0 when unknown
     */
    public function usdRateFor($code, $usdRates) {
        if ($code === '') {
            return 0;
        }
        if ($code === 'USD') {
            return 1;
        }
        //  USDT and USDC are NOT assumed to be one dollar. A stablecoin peg is
        //  an empirical fact, not a definition, and the caller supplying rates
        //  is the one who knows today's.
        $rate = $this->numberAt($usdRates, $code, 0);
        if ($rate > 0) {
            return $rate;
        }
        return 0;
    }

    /**
     * @ignore
     * reports whether a value fails to sit on a market's precision grid
     * @param float $value the amount or price
     * @param float $precision the market precision, a tick size or a decimal-place count
     * @param string $mode tick_size or decimal_places
     * @return bool true when the value would have to be rounded before it could be sent
     */
    public function precisionViolated($value, $precision, $mode) {
        if ($precision <= 0) {
            //  unknown or unconstrained precision is not a finding
            return false;
        }
        $rounded = 0;
        if ($mode === 'decimal_places') {
            $factor = pow(10, $precision);
            $rounded = round($value * $factor) / $factor;
        } else {
            //  the rounding mode is irrelevant here: a value exactly halfway
            //  between two ticks is off-grid whichever neighbour it snaps to,
            //  so the six languages' differing round() semantics cannot change
            //  this predicate's answer
            $rounded = round($value / $precision) * $precision;
        }
        $allowed = abs($value) * self::TOLERANCE + 1e-15;
        return abs($rounded - $value) > $allowed;
    }

    //  -----------------------------------------------------------------------
    //  PURE: reconcileExecutionStep
    //  -----------------------------------------------------------------------

    /**
     * compares what a step actually produced against what the route predicted, resizes every downstream hop, and returns the proceed-or-halt verdict. PURE — no I/O. The halt decision lives here rather than in the execution loop because it is a money decision, and six separate loops is six chances to omit it
     * @param array $plan the plan, with any earlier resizes already applied to its steps
     * @param int $stepIndex the step that just completed
     * @param float $realisedOut what it actually produced, in that step's output asset — base for a buy, quote for a sell
     * @return array the verdict, with expectedOut, realisedOut, shortfall, shortfallRatio, scale, verdict, reason and resizedSteps
     */
    public function reconcileExecutionStep($plan, $stepIndex, $realisedOut) {
        $steps = $this->listAt($plan, 'steps');
        if (($stepIndex < 0) || ($stepIndex >= count($steps))) {
            throw new BadRequest('reconcileExecutionStep: stepIndex is out of range');
        }
        $step = $steps[$stepIndex];
        $hopIndex = $this->numberAt($step, 'hopIndex', 0);
        $tolerance = $this->numberAt($plan, 'reconcileToleranceRatio', self::DEFAULT_RECONCILE_TOLERANCE);
        $expectedOut = $this->stepExpectedOut($step);
        $resized = array();
        if ($expectedOut <= 0) {
            return array(
                'stepIndex' => $stepIndex,
                'hopIndex' => $hopIndex,
                'expectedOut' => 0,
                'realisedOut' => $realisedOut,
                'shortfall' => 0,
                'shortfallRatio' => 0,
                'scale' => 0,
                'verdict' => 'halt',
                'reason' => 'zero_expected_output',
                'resizedSteps' => $resized,
            );
        }
        $shortfall = $expectedOut - $realisedOut;
        if ($shortfall < 0) {
            $shortfall = 0;
        }
        $shortfallRatio = $shortfall / $expectedOut;
        //  the downstream hops lost `shortfall` out of this hop's whole output,
        //  not out of this leg's, so the scale is measured against the hop
        $hopExpectedOut = 0;
        //  Shortfall already reported by this hop's OTHER legs. Each leg used to compute a scale
        //  from the hop total and multiply the downstream amounts by it, so a second leg scaled an
        //  already-scaled number: 80% and 60% fills produced 0.9 x 0.8 = 0.72 of the next hop
        //  instead of the true 0.70, sizing it for more than the wallet actually received and
        //  inviting a spurious insufficient-funds halt on exactly the bridged routes this class
        //  exists for. Reproduced at 144 against a true 140 before this changed.
        $priorShortfall = 0;
        for ($i = 0; $i < count($steps); $i++) {
            //  == and not ===: these are NUMBERS, and PHP's === also compares
            //  their type, so an int 0 and a float 0.0 — which the same JSON
            //  produces on different keys — would not match and whole legs would
            //  drop out of the hop total, resizing every downstream order wrong
            if ($this->numberAt($steps[$i], 'hopIndex', 0) == $hopIndex) {
                $hopExpectedOut = $hopExpectedOut + $this->stepExpectedOut($steps[$i]);
                if ($this->numberAt($steps[$i], 'stepIndex', -1) != $stepIndex && $this->hasNumberAt($steps[$i], 'realisedOut')) {
                    $legShortfall = $this->stepExpectedOut($steps[$i]) - $this->numberAt($steps[$i], 'realisedOut', 0);
                    if ($legShortfall < 0) {
                        $legShortfall = 0;
                    }
                    $priorShortfall = $priorShortfall + $legShortfall;
                }
            }
        }
        //  scaleBefore is what the downstream amounts have ALREADY been multiplied by, so the
        //  factor applied here is the increment that takes them from that to the hop's true
        //  cumulative scale. With one leg per hop $priorShortfall is 0, $scaleBefore is 1, and
        //  this is arithmetically identical to what it replaced.
        $scaleBefore = 1;
        $scaleAfter = 1;
        if ($hopExpectedOut > 0) {
            $scaleBefore = ($hopExpectedOut - $priorShortfall) / $hopExpectedOut;
            $scaleAfter = ($hopExpectedOut - $priorShortfall - $shortfall) / $hopExpectedOut;
        }
        if ($scaleBefore <= 0) {
            //  the hop already produced nothing; there is nothing left to scale down
            $scaleBefore = 1;
            $scaleAfter = 0;
        }
        $scale = $scaleAfter / $scaleBefore;
        if ($scale > 1) {
            //  never scale UP. An overfill is good news, but growing a
            //  downstream order past the size that passed the safety check
            //  would place an order nobody ever approved.
            $scale = 1;
        }
        if ($scale < 0) {
            $scale = 0;
        }
        for ($i = 0; $i < count($steps); $i++) {
            $other = $steps[$i];
            if ($this->numberAt($other, 'hopIndex', 0) <= $hopIndex) {
                continue;
            }
            $previousAmount = $this->numberAt($other, 'amount', 0);
            $amount = $previousAmount * $scale;
            $resized[] = array(
                'stepIndex' => $this->numberAt($other, 'stepIndex', $i),
                'previousAmount' => $previousAmount,
                'amount' => $amount,
                'notionalQuote' => $amount * $this->numberAt($other, 'expectedPrice', 0),
            );
        }
        $verdict = 'proceed';
        $reason = 'within_tolerance';
        if ($realisedOut <= 0) {
            $verdict = 'halt';
            $reason = 'nothing_filled';
        } elseif ($shortfallRatio > $tolerance * (1 + self::TOLERANCE)) {
            $verdict = 'halt';
            $reason = 'shortfall_exceeds_tolerance';
        }
        return array(
            'stepIndex' => $stepIndex,
            'hopIndex' => $hopIndex,
            'expectedOut' => $expectedOut,
            'realisedOut' => $realisedOut,
            'shortfall' => $shortfall,
            'shortfallRatio' => $shortfallRatio,
            'scale' => $scale,
            'verdict' => $verdict,
            'reason' => $reason,
            'resizedSteps' => $resized,
        );
    }

    /**
     * @ignore
     * how much of its output asset a step is expected to produce, gross of fees
     * @param array $step the plan step
     * @return float base units for a buy, quote units for a sell
     */
    public function stepExpectedOut($step) {
        $amount = $this->numberAt($step, 'amount', 0);
        if ($this->stringAt($step, 'side', '') === 'buy') {
            return $amount;
        }
        return $amount * $this->numberAt($step, 'expectedPrice', 0);
    }

    //  -----------------------------------------------------------------------
    //  PURE: buildUnwindPlan
    //  -----------------------------------------------------------------------

    /**
     * given a halted execution report, computes the reverse orders that sell each stranded residual back toward the original from-asset, on the venue that actually holds it. PURE — no I/O. NEVER automatic: the result carries requiresConfirmation and nothing in this class executes it
     * @param array $report an execution report from execute
     * @return array the unwind plan, with steps in reverse execution order and unresolved for residuals that cannot be reversed
     */
    public function buildUnwindPlan($report) {
        $fromAsset = $this->stringAt($report, 'from', '');
        $toAsset = $this->stringAt($report, 'to', '');
        $slippageBps = $this->numberAt($report, 'slippageBps', self::DEFAULT_SLIPPAGE_BPS);
        $results = $this->listAt($report, 'steps');
        //  net position per (exchangeId, asset). Held in an ARRAY rather than a
        //  map because the output order must be identical in six languages and
        //  map iteration order is not.
        $positions = array();
        for ($i = count($results) - 1; $i >= 0; $i--) {
            $result = $results[$i];
            $exchangeId = $this->stringAt($result, 'exchangeId', '');
            $outAsset = $this->stringAt($result, 'outAsset', '');
            $outAmount = $this->numberAt($result, 'outAmount', 0);
            if (($outAsset !== '') && ($outAmount > 0)) {
                $this->addPosition($positions, $exchangeId, $outAsset, $outAmount, $result, true);
            }
            $inAsset = $this->stringAt($result, 'inAsset', '');
            $inAmount = $this->numberAt($result, 'inAmount', 0);
            if (($inAsset !== '') && ($inAmount > 0)) {
                //  what a later hop consumed on this venue is not a residual.
                //  Netting is per venue: assets sitting on a venue the route
                //  never spent them on stay stranded, because this class never
                //  moves funds between venues.
                $this->addPosition($positions, $exchangeId, $inAsset, -$inAmount, $result, false);
            }
        }
        $steps = array();
        $unresolved = array();
        $residualCount = 0;
        for ($i = 0; $i < count($positions); $i++) {
            $position = $positions[$i];
            $asset = $this->stringAt($position, 'asset', '');
            $amount = $this->numberAt($position, 'amount', 0);
            $exchangeId = $this->stringAt($position, 'exchangeId', '');
            if ($amount <= 0) {
                continue;
            }
            if ($asset === $fromAsset) {
                //  already home
                continue;
            }
            $residualCount = $residualCount + 1;
            $source = $this->dictAt($position, 'source');
            $symbol = $this->stringAt($source, 'symbol', '');
            $sourceSide = $this->stringAt($source, 'side', '');
            $price = $this->numberAt($source, 'averagePrice', 0);
            if ($price <= 0) {
                $price = $this->numberAt($source, 'expectedPrice', 0);
            }
            if (($symbol === '') || (($sourceSide !== 'buy') && ($sourceSide !== 'sell'))) {
                $unresolved[] = array('exchangeId' => $exchangeId, 'asset' => $asset, 'amount' => $amount, 'reason' => 'no_source_market');
                continue;
            }
            if ($price <= 0) {
                $unresolved[] = array('exchangeId' => $exchangeId, 'asset' => $asset, 'amount' => $amount, 'reason' => 'no_price');
                continue;
            }
            //  reverse the order that created the residual: a buy left you
            //  holding base, so sell it back; a sell left you holding quote, so
            //  buy the base back with it
            $side = '';
            $unwindAmount = 0;
            $marketBase = '';
            $marketQuote = '';
            //  the counter asset is whatever the reversed order gives back,
            //  which is exactly what the original order spent
            $counterAsset = $this->stringAt($source, 'inAsset', '');
            if ($sourceSide === 'buy') {
                $side = 'sell';
                $marketBase = $this->stringAt($source, 'outAsset', '');
                $marketQuote = $this->stringAt($source, 'inAsset', '');
            } else {
                $side = 'buy';
                $marketBase = $this->stringAt($source, 'inAsset', '');
                $marketQuote = $this->stringAt($source, 'outAsset', '');
            }
            //  the limit price comes FIRST, because the buy below is sized on it.
            $limitPrice = 0;
            if ($side === 'buy') {
                $limitPrice = $price * (1 + $slippageBps / 10000);
            } else {
                $limitPrice = $price * (1 - $slippageBps / 10000);
            }
            if ($side === 'buy') {
                //  Size the buy on the price it is actually PLACED at, not on the
                //  expected price. A residual of 44.5 USDT sized at 0.089 is 500
                //  DOGE, but the order goes out at 0.0892225 and would need 44.61
                //  USDT to fill - 0.11 more than the venue holds. The venue rejects
                //  it for insufficient funds, or fills it partially and leaves the
                //  rest of the stranded money stranded. Dividing by limitPrice
                //  spends at most the residual.
                $unwindAmount = $amount / $limitPrice;
            } else {
                $unwindAmount = $amount;
            }
            $steps[] = array(
                'stepIndex' => count($steps),
                'exchangeId' => $exchangeId,
                'symbol' => $symbol,
                'side' => $side,
                //  base and quote are carried so that an unwind plan can be fed
                //  straight back into checkExecutionPlanSafety: unwinding is
                //  trading, and it is subject to the same 25 USD cap
                'base' => $marketBase,
                'quote' => $marketQuote,
                'asset' => $asset,
                'counterAsset' => $counterAsset,
                'amount' => $unwindAmount,
                'expectedPrice' => $price,
                'limitPrice' => $limitPrice,
                //  notional at the price the order is actually placed at: this
                //  plan is fed back into checkExecutionPlanSafety, and a cap that
                //  was checked against the expected price under-counts what the
                //  buy above really spends.
                'notionalQuote' => $unwindAmount * $limitPrice,
                'reachesFrom' => ($counterAsset === $fromAsset),
                'isDestination' => ($asset === $toAsset),
            );
        }
        return array(
            'from' => $fromAsset,
            'to' => $toAsset,
            'halted' => $this->boolAt($report, 'halted', false),
            'haltReason' => $this->stringAt($report, 'haltReason', ''),
            'residualCount' => $residualCount,
            'requiresConfirmation' => true,
            'automatic' => false,
            'steps' => $steps,
            'unresolved' => $unresolved,
        );
    }

    /**
     * @ignore
     * accumulates a signed amount into the (exchangeId, asset) position list, appending in first-seen order
     * @param array $positions the accumulator, taken by reference because PHP arrays are values
     * @param string $exchangeId the venue
     * @param string $asset the currency
     * @param float $amount the signed amount, positive for produced and negative for consumed
     * @param array $source the step result this amount came from
     * @param bool $produced true when this step PRODUCED the asset, which is the only kind of step an unwind can reverse
     * @return void
     */
    public function addPosition(&$positions, $exchangeId, $asset, $amount, $source, $produced) {
        for ($i = 0; $i < count($positions); $i++) {
            if (($positions[$i]['exchangeId'] === $exchangeId) && ($positions[$i]['asset'] === $asset)) {
                $positions[$i]['amount'] = $this->numberAt($positions[$i], 'amount', 0) + $amount;
                if ($produced && (count($this->dictAt($positions[$i], 'source')) === 0)) {
                    $positions[$i]['source'] = $source;
                }
                return;
            }
        }
        //  the source must be the step that PRODUCED the asset, never one that
        //  consumed it: reversing a step that spent your USDT would sell the
        //  wrong side of the wrong market. Walking the results backwards, the
        //  first producing step seen is the last one that ran, which is exactly
        //  the order an unwind undoes first.
        $initialSource = $produced ? $source : array();
        $positions[] = array('exchangeId' => $exchangeId, 'asset' => $asset, 'amount' => $amount, 'source' => $initialSource);
    }

    /**
     * the stable identity of an execution, used for the re-execution guard
     * @param array $plan the plan
     * @param array $options the execute options
     * @return string the identity, or '' when neither source carries one
     */
    public function planIdentity($plan, $options) {
        //  A caller-supplied idempotencyKey WINS over the plan's own requestId. Passing one is
        //  a deliberate statement about what this execution is, and it is the only identity a
        //  hand-assembled plan can have: execute() takes any dictionary of the plan shape, not
        //  only the output of buildExecutionPlan, and a plan a user built themselves never went
        //  through a routing request and so never had a requestId.
        $idempotencyKey = $this->stringAt($options, 'idempotencyKey', '');
        if ($idempotencyKey !== '') {
            return $idempotencyKey;
        }
        //  otherwise requestId, the one field a routed plan carries that is meant to be unique;
        //  it survives JSON, storage and a hand-rebuilt tail of a halted route. Nothing is
        //  invented when both are absent — a generated identity would be either random, which
        //  defeats the guard that depends on it, or a fingerprint of the plan's contents,
        //  which makes two plans that happen to agree indistinguishable. Absence is reported,
        //  and execute refuses.
        return $this->stringAt($plan, 'requestId', '');
    }

    /**
     * @ignore
     * reports whether this instance has executed the given plan id recently enough for the
     * bounded ledger to still remember it
     * @param string $planId the plan identity from planIdentity
     * @return bool true when the id is still in the ledger
     */
    public function hasExecutedPlan($planId) {
        //  a key lookup, not a scan: the ledger is capped but still up to
        //  MAX_EXECUTED_PLAN_IDS long, and this runs on every live execution
        return array_key_exists($planId, $this->executedPlanIdSet);
    }

    /**
     * @ignore
     * records one plan id in the bounded ledger, evicting the oldest entry when the cap is reached
     * @param string $planId the plan identity from planIdentity
     * @return void
     */
    public function recordExecutedPlan($planId) {
        if ($this->hasExecutedPlan($planId)) {
            //  already recorded; re-recording it would move it in the FIFO order and let a
            //  repeatedly re-executed plan keep other ids alive or evict them out of turn
            return;
        }
        $this->executedPlanIds[] = $planId;
        $this->executedPlanIdSet[$planId] = true;
        while (count($this->executedPlanIds) > self::MAX_EXECUTED_PLAN_IDS) {
            //  FIFO: the OLDEST execution is the one whose duplicate is least likely still
            //  in flight. Evicting it drops the refusal for that plan — see the comment on
            //  MAX_EXECUTED_PLAN_IDS; this is a bounded memory promise, not a stronger
            //  idempotency one.
            $evicted = array_shift($this->executedPlanIds);
            unset($this->executedPlanIdSet[$evicted]);
        }
    }

    //  -----------------------------------------------------------------------
    //  IMPURE: execute
    //  -----------------------------------------------------------------------

    /**
     * executes a plan against live exchange instances. THE ONLY IMPURE METHOD. dry_run is the default and options.live !== true forces dry_run regardless of the strategy requested, so a call that looks live but forgot the flag places nothing
     * @param array $plan a plan from buildExecutionPlan, or a caller-assembled plan of the same shape — this method never assumes the plan came from the routing service
     * @param array $venues a dictionary of exchangeId to a ccxt exchange instance
     * @param array $options execution options
     *     string strategy               dry_run, sequential, parallel_within_hop, limit_protected, best_effort or atomic_ish
     *     bool   live                   must be exactly true for any order to be placed
     *     array  usdRates               currency code to USD price, required when live because the notional cap cannot be enforced without it
     *     bool   allowMarketOrders      permit a market order when the venue cannot do IOC, default false
     *     int    maxOrders              hard order-count cap, required by best_effort
     *     bool   acknowledgeDispersion  required by best_effort, which can leave you holding an unintended asset mix
     *     int    orderTimeoutMs         how long limit_protected leaves an order resting, default 20000
     *     int    pollIntervalMs         how often limit_protected checks a resting order, default 1000
     *     array  orderParams            extra params merged into every createOrder call
     *     string idempotencyKey         the identity of this execution, required when the plan carries no requestId; it keys the re-execution guard, and OVERRIDES the plan's requestId when both are given
     *     bool   allowReexecution       must be exactly true to run a plan this instance has already executed live; the DEFAULT is refusal
     * @return array an execution report with per-step results, openOrders, errors and the halt verdict
     */
    public function assertSyncVenues($venues) {
        // OrderRouter lives in the SYNC ccxt namespace and reads results directly off the return
        // value. Handed a ccxt\async\* instance, createOrder returns a ReactPHP promise: reading
        // id or filled off it yields null, every accessor falls back to its default, and execute()
        // returns a clean-looking report with every step unfilled and NO errors — while the fiber
        // has already dispatched the real order. A silent wrong answer about money that has moved
        // is the worst outcome this class can produce, so it refuses up front.
        //
        // ccxt\async\Exchange extends BaseExchange rather than ccxt\Exchange, so it is a sibling
        // and no instanceof against the sync class can be used positively; the namespace is the
        // discriminator. Test stubs live outside both namespaces and are unaffected.
        if (!is_array($venues)) {
            return;
        }
        foreach ($venues as $exchangeId => $venue) {
            if (!is_object($venue)) {
                continue;
            }
            $class = get_class($venue);
            if (strpos($class, 'ccxt\\async\\') === 0 || strpos($class, 'ccxt\\pro\\') === 0) {
                throw new NotSupported('OrderRouter is synchronous: ' . $exchangeId . ' is ' . $class
                    . '. Pass a ccxt\\<id> instance, not an async or pro one.');
            }
        }
    }

    public function assertNotPromise($value, $what) {
        if (is_object($value) && (
            $value instanceof \React\Promise\PromiseInterface
            || method_exists($value, 'then')
        )) {
            throw new NotSupported('OrderRouter: ' . $what . ' returned a promise, so this venue is '
                . 'asynchronous. OrderRouter is synchronous and cannot read a result off a promise.');
        }
        return $value;
    }

    public function execute($plan, $venues, $options = array()) {
        $this->assertSyncVenues($venues);
        $requestedStrategy = $this->stringAt($options, 'strategy', 'dry_run');
        if (!in_array($requestedStrategy, self::KNOWN_STRATEGIES, true)) {
            throw new BadRequest('OrderRouter: unknown execution strategy ' . $requestedStrategy);
        }
        $live = ($this->fieldAt($options, 'live') === true);
        //  THE default. Anything short of an explicit true is a rehearsal.
        $strategy = $live ? $requestedStrategy : 'dry_run';
        $steps = $this->cloneSteps($plan);
        $report = $this->emptyReport($plan, $strategy, $requestedStrategy, $live, $steps);
        //  resolved from BOTH the plan and the options, so a hand-assembled plan can carry an
        //  identity too; reported on every report, rehearsals included
        $planId = $this->planIdentity($plan, $options);
        $report['planId'] = $planId;
        // How old the prices in this plan are. ALWAYS reported, even when nothing is enforced: a plan
        // is a snapshot of a book, and how stale that snapshot is decides whether any number in it
        // means anything. -1 when the route carried no calculatedAt, which is not the same as "fresh"
        // and must not read like it. Enforced only if asked for, at whatever value is asked for — the
        // same shape as maxNotionalUsd, and for the same reason. But an age that cannot be determined
        // BLOCKS under an active limit: a freshness check that silently passes when the timestamp is
        // missing is not a freshness check.
        $calculatedAt = $this->numberAt($plan, 'calculatedAt', 0);
        $planAgeMs = ($calculatedAt > 0) ? ($this->nowMs() - $calculatedAt) : -1;
        $report['planAgeMs'] = $planAgeMs;
        $maxPlanAgeMs = $this->numberAt($options, 'maxPlanAgeMs', 0);
        if ($live && $maxPlanAgeMs > 0) {
            if ($planAgeMs < 0) {
                throw new ExchangeError('OrderRouter: refusing to execute, the plan carries no calculatedAt and maxPlanAgeMs was set');
            }
            if ($planAgeMs > $maxPlanAgeMs) {
                throw new ExchangeError('OrderRouter: refusing to execute a plan older than maxPlanAgeMs, recompute the route');
            }
        }
        if ($strategy === 'dry_run') {
            //  not one call is made against a venue on this path, not even a read
            $report['wouldPlaceOrders'] = count($steps);
            return $report;
        }
        if (count($venues) === 0) {
            throw new ArgumentsRequired('OrderRouter.execute requires a venues dictionary when live');
        }
        //  IDEMPOTENCY, half one: a plan this instance has already run live is REFUSED, and
        //  refused here — before a single read reaches a venue. The ledger is consulted now and
        //  written only once the plan is about to be dispatched, so a caller error that placed
        //  nothing does not burn the plan. dry_run never reaches this line and never consumes a
        //  plan, because a rehearsal places nothing.
        if ($planId === '') {
            //  no identity means no idempotency: the ledger below cannot key on it, so a
            //  re-run of this plan would be indistinguishable from a first run.
            throw new BadRequest('OrderRouter: refusing to execute live without an identity, the plan carries no requestId — pass options.idempotencyKey');
        }
        if ($this->fieldAt($options, 'allowReexecution') !== true) {
            if ($this->hasExecutedPlan($planId)) {
                throw new BadRequest('OrderRouter: refusing to re-execute a plan this instance already executed, pass allowReexecution to override');
            }
        }
        //  derived from the steps about to be executed, NEVER read off the plan:
        //  a plan that travelled through JSON, a persisted step list or a
        //  hand-rebuilt tail of a halted route can be missing hopCount, and a
        //  refusal that a missing key switches off is not a refusal
        $hopCount = $this->hopCountOf($steps);
        if ($strategy === 'best_effort') {
            if ($hopCount > 1) {
                //  best-effort multi-hop is the most reliable way to strand
                //  money in a bridge asset
                throw new NotSupported('OrderRouter: best_effort refuses multi-hop routes');
            }
            if ($this->fieldAt($options, 'acknowledgeDispersion') !== true) {
                throw new BadRequest('OrderRouter: best_effort requires acknowledgeDispersion');
            }
            if ($this->numberAt($options, 'maxOrders', 0) <= 0) {
                throw new BadRequest('OrderRouter: best_effort requires a positive maxOrders');
            }
        }
        if ($strategy === 'limit_protected') {
            //  Refused HERE, before a single order is placed, because the alternative is worse than a
            //  bad interval: the poll loop advances its clock by this value, so a zero or negative one
            //  never reaches the timeout. It spins on fetchOrder forever with a real order resting on a
            //  real venue, and the timeout that exists to cancel that order never arrives.
            if ($this->hasNumberAt($options, 'pollIntervalMs') && $this->numberAt($options, 'pollIntervalMs', 0) <= 0) {
                throw new BadRequest('OrderRouter: pollIntervalMs must be positive, a resting order is polled on that clock');
            }
        }
        //  markets are needed for the safety check and for precision snapping
        $markets = array();
        $exchangeIds = array_keys($venues);
        sort($exchangeIds, SORT_STRING);
        for ($i = 0; $i < count($exchangeIds); $i++) {
            $exchangeId = $exchangeIds[$i];
            $venue = $venues[$exchangeId];
            if (count($this->dictAt($venue, 'markets')) === 0) {
                $venue->loadMarkets();
            }
            $markets[$exchangeId] = $this->dictAt($venue, 'markets');
        }
        $usdRates = $this->dictAt($options, 'usdRates');
        $safetyOptions = array(
            'usdRates' => $usdRates,
            'maxNotionalUsd' => $this->numberAt($options, 'maxNotionalUsd', $this->maxNotionalUsd),
            'precisionMode' => $this->stringAt($options, 'precisionMode', 'tick_size'),
        );
        $violations = $this->checkExecutionPlanSafety($plan, $markets, $safetyOptions);
        $blockers = '';
        for ($i = 0; $i < count($violations); $i++) {
            if ($this->boolAt($violations[$i], 'blocking', false)) {
                if ($blockers !== '') {
                    $blockers = $blockers . ', ';
                }
                $blockers = $blockers . $this->stringAt($violations[$i], 'code', '');
            }
        }
        if ($blockers !== '') {
            //  thrown, not reported. A refusal a caller can forget to read is
            //  not a refusal.
            throw new ExchangeError('OrderRouter: refusing to execute, blocking safety violations: ' . $blockers);
        }
        if ($strategy === 'atomic_ish') {
            $this->assertPrefunded($steps, $venues);
        }
        //  the ledger is written BEFORE the first order goes out, never after: a run that
        //  throws half way through has still placed orders, and a guard that only recorded
        //  completed runs would wave through exactly the retry that double-fills.
        $this->recordExecutedPlan($planId);
        if ($strategy === 'parallel_within_hop') {
            $this->executeParallelWithinHop($report, $steps, $venues, $options, $usdRates);
        } elseif ($strategy === 'best_effort') {
            $this->executeBestEffort($report, $steps, $venues, $options, $usdRates);
        } else {
            //  sequential, limit_protected and atomic_ish all walk the plan one
            //  order at a time; they differ in how a single order is placed and
            //  in whether they lean on the previous hop's proceeds
            $this->executeSequential($report, $steps, $venues, $options, $usdRates, $strategy);
        }
        $this->summariseReport($report, $steps);
        return $report;
    }

    /**
     * @ignore
     * counts the distinct hops a step list spans, which is the only authority on whether a plan is multi-hop
     * @param array $steps the working steps
     * @return int the number of distinct hopIndex values
     */
    public function hopCountOf($steps) {
        //  an array rather than a map, so the count is the same in six languages
        //  and does not depend on hash iteration order
        $seen = array();
        for ($i = 0; $i < count($steps); $i++) {
            $hopIndex = $this->numberAt($steps[$i], 'hopIndex', 0);
            $found = false;
            for ($j = 0; $j < count($seen); $j++) {
                if ($seen[$j] == $hopIndex) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $seen[] = $hopIndex;
            }
        }
        return count($seen);
    }

    /**
     * @ignore
     * copies a plan's steps so that execution-time resizing never mutates the caller's plan
     * @param array $plan the plan
     * @return array a fresh array of fresh step arrays
     */
    public function cloneSteps($plan) {
        $steps = $this->listAt($plan, 'steps');
        $copies = array();
        for ($i = 0; $i < count($steps); $i++) {
            $step = $steps[$i];
            $copies[] = array(
                'stepIndex' => $this->numberAt($step, 'stepIndex', $i),
                'hopIndex' => $this->numberAt($step, 'hopIndex', 0),
                'legIndex' => $this->numberAt($step, 'legIndex', 0),
                'exchangeId' => $this->stringAt($step, 'exchangeId', ''),
                'symbol' => $this->stringAt($step, 'symbol', ''),
                'side' => $this->stringAt($step, 'side', ''),
                'base' => $this->stringAt($step, 'base', ''),
                'quote' => $this->stringAt($step, 'quote', ''),
                'amount' => $this->numberAt($step, 'amount', 0),
                'expectedPrice' => $this->numberAt($step, 'expectedPrice', 0),
                'effectivePrice' => $this->numberAt($step, 'effectivePrice', 0),
                'limitPrice' => $this->stepLimitPrice($step),
                'notionalQuote' => $this->stepNotionalQuote($step),
            );
        }
        return $copies;
    }

    /**
     * @ignore
     * builds the report skeleton, with every step marked planned
     * @param array $plan the plan being executed
     * @param string $strategy the strategy actually in force
     * @param string $requestedStrategy the strategy asked for, which differs when live was not set
     * @param bool $live whether orders may be placed
     * @param array $steps the working copy of the plan's steps
     * @return array the report
     */
    public function emptyReport($plan, $strategy, $requestedStrategy, $live, $steps) {
        $results = array();
        for ($i = 0; $i < count($steps); $i++) {
            $step = $steps[$i];
            $results[] = array(
                'stepIndex' => $this->numberAt($step, 'stepIndex', $i),
                'hopIndex' => $this->numberAt($step, 'hopIndex', 0),
                'legIndex' => $this->numberAt($step, 'legIndex', 0),
                'exchangeId' => $this->stringAt($step, 'exchangeId', ''),
                'symbol' => $this->stringAt($step, 'symbol', ''),
                'side' => $this->stringAt($step, 'side', ''),
                'status' => 'planned',
                'requestedAmount' => $this->numberAt($step, 'amount', 0),
                'filledAmount' => 0,
                'averagePrice' => 0,
                'expectedPrice' => $this->numberAt($step, 'expectedPrice', 0),
                'cost' => 0,
                'inAsset' => '',
                'inAmount' => 0,
                'outAsset' => '',
                'outAmount' => 0,
                'orderId' => '',
                'clientOrderId' => '',
                'errorCode' => '',
                //  which retry produced this result; 0 unless retryFailedSteps re-placed it
                'attempt' => 0,
            );
        }
        return array(
            //  a placeholder: execute resolves the real identity from the plan AND the
            //  options and overwrites it before anything reads this field
            'planId' => '',
            'strategy' => $strategy,
            'requestedStrategy' => $requestedStrategy,
            'dryRun' => ($strategy === 'dry_run'),
            'live' => $live,
            'from' => $this->stringAt($plan, 'from', ''),
            'to' => $this->stringAt($plan, 'to', ''),
            'slippageBps' => $this->numberAt($plan, 'slippageBps', self::DEFAULT_SLIPPAGE_BPS),
            'reconcileToleranceRatio' => $this->numberAt($plan, 'reconcileToleranceRatio', self::DEFAULT_RECONCILE_TOLERANCE),
            'stepCount' => count($steps),
            'wouldPlaceOrders' => 0,
            'ordersPlaced' => 0,
            'halted' => false,
            'haltReason' => '',
            'haltStepIndex' => -1,
            'filledIn' => 0,
            'filledOut' => 0,
            'steps' => $results,
            'openOrders' => array(),
            'errors' => array(),
            'reconciliations' => array(),
        );
    }

    /**
     * @ignore
     * places one order at a time in plan order, reconciling after each and obeying the halt verdict
     * @param array $report the report being filled in, by reference
     * @param array $steps the working steps, resized in place as hops complete, by reference
     * @param array $venues exchangeId to exchange instance
     * @param array $options the execute options
     * @param array $usdRates currency code to USD price
     * @param string $strategy sequential, limit_protected or atomic_ish
     * @return void
     */
    public function executeSequential(&$report, &$steps, $venues, $options, $usdRates, $strategy) {
        for ($i = 0; $i < count($steps); $i++) {
            $step = $steps[$i];
            $result = $this->placeStepWithRetry($step, $venues, $options, $usdRates, $strategy, $report);
            $report['steps'][$i] = $result;
            $status = $this->stringAt($result, 'status', '');
            if ($status === 'failed' || $status === 'outcome_unknown') {
                $report['halted'] = true;
                // An unknown outcome must NOT fall through to reconciliation: reconciling reads
                // outAmount, which is 0 because nothing was observed, and reports the halt as
                // 'nothing_filled' — asserting the one thing we do not know.
                $report['haltReason'] = ($status === 'failed') ? 'order_failed' : 'outcome_unknown';
                $report['haltStepIndex'] = $i;
                //  the hook is told about a halt it did not cause, and cannot undo it
                $this->callOnStep($options, $report, $result, array(), $i, count($steps));
                $this->markRemainingSkipped($report['steps'], $i + 1);
                return;
            }
            $reconciliation = $this->reconcileExecutionStep(array('steps' => $steps, 'reconcileToleranceRatio' => $this->numberAt($report, 'reconcileToleranceRatio', self::DEFAULT_RECONCILE_TOLERANCE)), $i, $this->numberAt($result, 'outAmount', 0));
            $report['reconciliations'][] = $reconciliation;
            if ($strategy !== 'atomic_ish') {
                //  atomic_ish is pre-funded end to end, so a hop's shortfall
                //  does not shrink the next hop's order — the money for it was
                //  already there before the first order went out
                $this->applyResize($steps, $reconciliation);
            }
            if ($this->stringAt($reconciliation, 'verdict', '') === 'halt') {
                $report['halted'] = true;
                $report['haltReason'] = $this->stringAt($reconciliation, 'reason', '');
                $report['haltStepIndex'] = $i;
                $this->callOnStep($options, $report, $result, $reconciliation, $i, count($steps));
                $this->markRemainingSkipped($report['steps'], $i + 1);
                return;
            }
            //  the caller's own verdict, consulted only once the route is otherwise sound. It
            //  can stop the route; it cannot restart one the reconciliation above already
            //  stopped.
            if ($this->callOnStep($options, $report, $result, $reconciliation, $i, count($steps)) === 'halt') {
                $report['halted'] = true;
                $report['haltReason'] = 'halted_by_on_step';
                $report['haltStepIndex'] = $i;
                $this->markRemainingSkipped($report['steps'], $i + 1);
                return;
            }
        }
    }

    /**
     * @ignore
     * runs the legs of one hop as a unit and the hops strictly in order. THE CONTRACT is concurrent ACROSS venues, serialised WITHIN a venue — an ordering guarantee, not a performance promise, which is what lets six very different runtimes honour the same words. The other four ports group a hop's legs by exchangeId so no venue ever has two orders in flight; this synchronous port satisfies the same guarantee more strongly by placing every leg one after another, so it needs no grouping. placeStep contains its own failures either way, so the report is identical
     * @param array $report the report being filled in, by reference
     * @param array $steps the working steps, by reference
     * @param array $venues exchangeId to exchange instance
     * @param array $options the execute options
     * @param array $usdRates currency code to USD price
     * @return void
     */
    public function executeParallelWithinHop(&$report, &$steps, $venues, $options, $usdRates) {
        $cursor = 0;
        while ($cursor < count($steps)) {
            $hopIndex = $this->numberAt($steps[$cursor], 'hopIndex', 0);
            $end = $cursor;
            while (($end < count($steps)) && ($this->numberAt($steps[$end], 'hopIndex', 0) == $hopIndex)) {
                $end = $end + 1;
            }
            for ($i = $cursor; $i < $end; $i++) {
                //  placeStep contains its own failures and never throws, so
                //  "wait for all" means the same thing in all six languages.
                //  Without that containment JavaScript rejects fast while
                //  sibling orders are still live, and Go's promiseAll waits for
                //  every one — the same source abandoning in-flight orders
                //  differently per language.
                $legResult = $this->placeStepWithRetry($steps[$i], $venues, $options, $usdRates, 'parallel_within_hop', $report);
                $report['steps'][$i] = $legResult;
            }
            for ($i = $cursor; $i < $end; $i++) {
                $result = $report['steps'][$i];
                $status = $this->stringAt($result, 'status', '');
                if ($status === 'failed' || $status === 'outcome_unknown') {
                    $report['halted'] = true;
                    $report['haltReason'] = ($status === 'failed') ? 'order_failed' : 'outcome_unknown';
                    $report['haltStepIndex'] = $i;
                    $this->callOnStep($options, $report, $result, array(), $i, count($steps));
                    $this->markRemainingSkipped($report['steps'], $end);
                    return;
                }
                $reconciliation = $this->reconcileExecutionStep(array('steps' => $steps, 'reconcileToleranceRatio' => $this->numberAt($report, 'reconcileToleranceRatio', self::DEFAULT_RECONCILE_TOLERANCE)), $i, $this->numberAt($result, 'outAmount', 0));
                $report['reconciliations'][] = $reconciliation;
                $this->applyResize($steps, $reconciliation);
                if ($this->stringAt($reconciliation, 'verdict', '') === 'halt') {
                    $report['halted'] = true;
                    $report['haltReason'] = $this->stringAt($reconciliation, 'reason', '');
                    $report['haltStepIndex'] = $i;
                    $this->callOnStep($options, $report, $result, $reconciliation, $i, count($steps));
                    $this->markRemainingSkipped($report['steps'], $end);
                    return;
                }
                if ($this->callOnStep($options, $report, $result, $reconciliation, $i, count($steps)) === 'halt') {
                    $report['halted'] = true;
                    $report['haltReason'] = 'halted_by_on_step';
                    $report['haltStepIndex'] = $i;
                    $this->markRemainingSkipped($report['steps'], $end);
                    return;
                }
            }
            $cursor = $end;
        }
    }

    /**
     * @ignore
     * places what it can and never halts, on a single hop only, up to maxOrders
     * @param array $report the report being filled in, by reference
     * @param array $steps the working steps, by reference
     * @param array $venues exchangeId to exchange instance
     * @param array $options the execute options
     * @param array $usdRates currency code to USD price
     * @return void
     */
    public function executeBestEffort(&$report, &$steps, $venues, $options, $usdRates) {
        $maxOrders = $this->numberAt($options, 'maxOrders', 0);
        $placed = 0;
        for ($i = 0; $i < count($steps); $i++) {
            if ($placed >= $maxOrders) {
                $report['steps'][$i]['status'] = 'skipped';
                $report['steps'][$i]['errorCode'] = 'max_orders_reached';
                continue;
            }
            $stepResult = $this->placeStepWithRetry($steps[$i], $venues, $options, $usdRates, 'best_effort', $report);
            $report['steps'][$i] = $stepResult;
            $placed = $placed + 1;
            //  no reconciliation and no halt: that is the whole point of the
            //  strategy, and why it is refused on anything but a single hop. The hook is still
            //  offered every step, and stopping early is the one thing it may do here — that is
            //  a smaller commitment than the strategy's own contract, never a larger one.
            if ($this->callOnStep($options, $report, $stepResult, array(), $i, count($steps)) === 'halt') {
                $report['halted'] = true;
                $report['haltReason'] = 'halted_by_on_step';
                $report['haltStepIndex'] = $i;
                $this->markRemainingSkipped($report['steps'], $i + 1);
                return;
            }
        }
    }

    /**
     * @ignore
     * places one step, re-placing it up to $options['retryFailedSteps'] times when — and ONLY when — the venue definitively rejected it
     * @param array $step the step to trade
     * @param array $venues exchangeId to exchange instance
     * @param array $options the execute options
     * @param array $usdRates currency code to USD price
     * @param string $strategy the strategy in force
     * @param array $report the report, for openOrders and errors, by reference
     * @return array the step result of the last attempt
     */
    public function placeStepWithRetry($step, $venues, $options, $usdRates, $strategy, &$report) {
        $maxRetries = $this->numberAt($options, 'retryFailedSteps', 0);
        $retryDelayMs = $this->numberAt($options, 'retryDelayMs', self::DEFAULT_RETRY_DELAY_MS);
        $attempt = 0;
        $result = array();
        while (true) {
            $step['attempt'] = $attempt;
            $result = $this->placeStep($step, $venues, $options, $usdRates, $strategy, $report);
            $status = $this->stringAt($result, 'status', '');
            //  'failed' is the ONLY retryable outcome, and the distinction is the whole safety
            //  argument. A failed step was refused by the venue: nothing was placed, so placing
            //  it again cannot double-fill. An 'outcome_unknown' step may ALREADY be a live
            //  position that simply could not be read back, and re-placing that is precisely the
            //  double-fill this class exists to prevent. It is never retried, at any setting.
            if ($status !== 'failed' || $attempt >= $maxRetries) {
                return $result;
            }
            $attempt = $attempt + 1;
            if ($retryDelayMs > 0) {
                $this->sleep($retryDelayMs);
            }
        }
    }

    /**
     * @ignore
     * hands the caller's onStep hook one finished step and returns its verdict, treating any failure of the hook as 'no opinion'
     * @param array $options the execute options, which may carry onStep
     * @param array $report the report so far, by reference
     * @param array $result the finished step result
     * @param array $reconciliation the step's reconciliation, empty when it halted before reconciling
     * @param int $stepIndex the step's index
     * @param int $stepsTotal how many steps the plan has
     * @return string 'halt' to stop, anything else to continue
     */
    public function callOnStep($options, &$report, $result, $reconciliation, $stepIndex, $stepsTotal) {
        if (!isset($options['onStep'])) {
            return '';
        }
        $onStep = $options['onStep'];
        $event = array(
            'planId' => $this->stringAt($report, 'planId', ''),
            'stepIndex' => $stepIndex,
            'hopIndex' => $this->numberAt($result, 'hopIndex', 0),
            'legIndex' => $this->numberAt($result, 'legIndex', 0),
            'exchangeId' => $this->stringAt($result, 'exchangeId', ''),
            'symbol' => $this->stringAt($result, 'symbol', ''),
            'side' => $this->stringAt($result, 'side', ''),
            'status' => $this->stringAt($result, 'status', ''),
            'requestedAmount' => $this->numberAt($result, 'requestedAmount', 0),
            'filledAmount' => $this->numberAt($result, 'filledAmount', 0),
            'outAsset' => $this->stringAt($result, 'outAsset', ''),
            'outAmount' => $this->numberAt($result, 'outAmount', 0),
            'orderId' => $this->stringAt($result, 'orderId', ''),
            'clientOrderId' => $this->stringAt($result, 'clientOrderId', ''),
            'errorCode' => $this->stringAt($result, 'errorCode', ''),
            'attempt' => $this->numberAt($result, 'attempt', 0),
            'reconciliation' => $reconciliation,
            'ordersPlaced' => $this->numberAt($report, 'ordersPlaced', 0),
            'halted' => $this->boolAt($report, 'halted', false),
            'haltReason' => $this->stringAt($report, 'haltReason', ''),
            'stepsTotal' => $stepsTotal,
            'stepsRemaining' => $stepsTotal - ($stepIndex + 1),
        );
        try {
            $verdict = call_user_func($onStep, $event);
            if ($verdict === 'halt') {
                return 'halt';
            }
            return '';
        } catch (\Throwable $e) {
            //  A hook that throws must NOT take the run with it. Everything placed so far is
            //  recorded in this report, and losing it to an exception raised by observability
            //  code would destroy the only account of orders that are already live. The failure
            //  is recorded and the run proceeds exactly as if the hook had no opinion.
            $this->recordError($report, $stepIndex, $this->stringAt($result, 'exchangeId', ''), $this->stringAt($result, 'symbol', ''), 'on_step_hook_failed:' . $this->errorCodeOf($e));
            return '';
        }
    }

    /**
     * @ignore
     * places one order for one step and never throws, so that a sibling leg's failure cannot abandon an in-flight order
     * @param array $step the step to trade
     * @param array $venues exchangeId to exchange instance
     * @param array $options the execute options
     * @param array $usdRates currency code to USD price
     * @param string $strategy the strategy in force, which decides limit resting behaviour
     * @param array $report the report, for openOrders and errors, by reference
     * @return array the step result
     */
    public function placeStep($step, $venues, $options, $usdRates, $strategy, &$report) {
        $stepIndex = $this->numberAt($step, 'stepIndex', 0);
        $exchangeId = $this->stringAt($step, 'exchangeId', '');
        $symbol = $this->stringAt($step, 'symbol', '');
        $side = $this->stringAt($step, 'side', '');
        $result = array(
            'stepIndex' => $stepIndex,
            'hopIndex' => $this->numberAt($step, 'hopIndex', 0),
            'legIndex' => $this->numberAt($step, 'legIndex', 0),
            'exchangeId' => $exchangeId,
            'symbol' => $symbol,
            'side' => $side,
            'status' => 'failed',
            'requestedAmount' => $this->numberAt($step, 'amount', 0),
            'filledAmount' => 0,
            'averagePrice' => 0,
            'expectedPrice' => $this->numberAt($step, 'expectedPrice', 0),
            'cost' => 0,
            'inAsset' => '',
            'inAmount' => 0,
            'outAsset' => '',
            'outAmount' => 0,
            'orderId' => '',
            'clientOrderId' => '',
            'errorCode' => '',
            // false until an order is actually dispatched; see the assignment at each createOrder
            'placementAttempted' => false,
        );
        try {
            $venue = $this->fieldAt($venues, $exchangeId);
            if ($venue === null) {
                $result['errorCode'] = 'venue_missing';
                $this->recordError($report, $stepIndex, $exchangeId, $symbol, 'venue_missing');
                return $result;
            }
            $amount = $this->parseNumber(strval($venue->amountToPrecision($symbol, $this->numberAt($step, 'amount', 0))), 0);
            $price = $this->parseNumber(strval($venue->priceToPrecision($symbol, $this->stepLimitPrice($step))), 0);
            if (!($amount > 0) || !($price > 0)) {
                $result['errorCode'] = 'rounded_to_zero';
                $this->recordError($report, $stepIndex, $exchangeId, $symbol, 'rounded_to_zero');
                return $result;
            }
            //  CLAUDE.md: compute the notional before EVERY createOrder. The
            //  plan-level check already ran, but the plan can have been resized
            //  by a reconciliation since, and the snapped price is not the one
            //  that was checked.
            $this->assertUnderCap($step, $amount, $price, $usdRates, $options);
            $orderParams = array();
            $extra = $this->dictAt($options, 'orderParams');
            $extraKeys = array_keys($extra);
            for ($i = 0; $i < count($extraKeys); $i++) {
                $orderParams[$extraKeys[$i]] = $extra[$extraKeys[$i]];
            }
            //  No clientOrderId is set here. Whatever the caller put in options orderParams
            //  travels as-is, and each exchange's createOrder keeps sending whatever identifier
            //  it generates on its own; the id the venue reports back is recorded on the result
            //  once the order returns. (An id derived from the plan identity used to be forced
            //  onto every step, but venues disagree on its length and charset, so it was
            //  rejected exactly where it mattered.)
            $attempt = $this->numberAt($step, 'attempt', 0);
            $result['attempt'] = $attempt;
            $order = array();
            if ($strategy === 'limit_protected') {
                $order = $this->placeProtectedLimit($venue, $step, $symbol, $side, $amount, $price, $orderParams, $options, $report, $result);
            } else {
                $order = $this->placeImmediateOrder($venue, $symbol, $side, $amount, $price, $orderParams, $options, $result);
            }
            $result['orderId'] = $this->stringAt($order, 'id', '');
            $result['clientOrderId'] = $this->stringAt($order, 'clientOrderId', '');
            // "the venue said zero" and "the venue said nothing" are different facts that used to
            // produce the same number: a venue omitting filled yielded 0, reconciliation read that
            // as nothing_filled and halted while a real position existed. Test presence.
            if (!$this->hasNumberAt($order, 'filled') && $result['orderId'] !== '') {
                // One re-read, exactly as placeProtectedLimit already does after its poll.
                $order = $this->refetchOrder($venue, $this->stringAt($result, 'orderId', ''), $symbol, $order);
            }
            //  An order the venue explicitly calls open is RESTING, and on this path it must
            //  not be: placeImmediateOrder asked for immediate-or-cancel, so a venue that
            //  silently dropped the timeInForce param has left a plain limit order sitting on
            //  the book. Recording it and walking on was not enough - the next hop then trades
            //  on top of a position that keeps growing behind it, is sized from a fill that is
            //  already out of date, and the leftover order is still live after the route has
            //  ended and nobody is watching it. So it is cancelled and re-read here, exactly as
            //  placeProtectedLimit does on its timeout path.
            $restingCancelFailed = false;
            if ($strategy !== 'limit_protected' && $this->stringAt($order, 'status', '') === 'open' && $result['orderId'] !== '') {
                try {
                    $venue->cancelOrder($this->stringAt($result, 'orderId', ''), $symbol);
                    //  ALWAYS re-read after a cancel: the cancel and the fill can cross, and the
                    //  observed order is the only authority on what actually happened
                    $order = $this->refetchOrder($venue, $this->stringAt($result, 'orderId', ''), $symbol, $order);
                } catch (\Throwable $e) {
                    //  the order may still be live and its fill can still move, so whatever this
                    //  step reports below is a snapshot that is already stale. The status is
                    //  downgraded after the amounts are filled in, not here: a cost the venue DID
                    //  report is a fact, and buildUnwindPlan subtracts it.
                    $restingCancelFailed = true;
                }
            }
            $filledKnown = $this->hasNumberAt($order, 'filled');
            $filled = $this->numberAt($order, 'filled', 0);
            $averageKnown = $this->hasNumberAt($order, 'average') || $this->hasNumberAt($order, 'price');
            $average = $this->numberAt($order, 'average', 0);
            if ($average <= 0) {
                $average = $this->numberAt($order, 'price', 0);
            }
            if ($average <= 0) {
                $average = $price;
            }
            $costKnown = $this->hasNumberAt($order, 'cost');
            $cost = $this->numberAt($order, 'cost', 0);
            if ($cost <= 0) {
                $cost = $filled * $average;
            }
            $result['filledKnown'] = $filledKnown;
            $result['averageKnown'] = $averageKnown;
            $result['costKnown'] = $costKnown;
            $result['filledAmount'] = $filled;
            $result['averagePrice'] = $average;
            $result['cost'] = $cost;
            if ($side === 'buy') {
                $result['inAsset'] = $this->stringAt($step, 'quote', '');
                $result['inAmount'] = $cost;
                $result['outAsset'] = $this->stringAt($step, 'base', '');
                $result['outAmount'] = $filled;
            } else {
                $result['inAsset'] = $this->stringAt($step, 'base', '');
                $result['inAmount'] = $filled;
                $result['outAsset'] = $this->stringAt($step, 'quote', '');
                $result['outAmount'] = $cost;
            }
            //  Net the taker fee out of what is actually CARRIED FORWARD, when the venue charged
            //  it in the asset this step produced. filled and cost are gross of fees — the manual
            //  says so — so a venue taking its cut in the acquired asset credits less than
            //  `filled`, and sizing the next hop (or an unwind) on the gross figure orders more
            //  than the wallet holds. Fees in any OTHER currency are left alone: they do not
            //  reduce what this hop hands to the next one.
            $feeCost = $this->orderFeeInAsset($order, $this->stringAt($result, 'outAsset', ''));
            $result['feeCost'] = $feeCost;
            $result['feeCurrency'] = $this->stringAt($result, 'outAsset', '');
            if ($feeCost > 0) {
                $net = $this->numberAt($result, 'outAmount', 0) - $feeCost;
                if ($net < 0) {
                    $net = 0;
                }
                $result['grossOutAmount'] = $this->numberAt($result, 'outAmount', 0);
                $result['outAmount'] = $net;
            }
            if (!$filledKnown) {
                // Refuse to reconcile on a fabricated fill: halting on an unknown quantity is
                // recoverable, sizing the next hop from an invented number is not.
                $result['status'] = 'outcome_unknown';
                $this->recordOpenOrder($report, $exchangeId, $symbol, $this->stringAt($result, 'orderId', ''), 'fill_unconfirmed');
                $report['ordersPlaced'] = $this->numberAt($report, 'ordersPlaced', 0) + 1;
                return $result;
            }
            if ($filled <= 0) {
                $result['status'] = 'unfilled';
            } elseif ($filled >= $amount * (1 - self::TOLERANCE)) {
                $result['status'] = 'filled';
            } else {
                $result['status'] = 'partial';
            }
            if ($restingCancelFailed) {
                //  a resting order this class could not cancel is the worst outcome there is:
                //  it can still fill, in full, after the route has returned. Sizing the next hop
                //  on the fill recorded above would trade against a position that is still
                //  moving, so the step is marked unknown and executeSequential stops here.
                $result['status'] = 'outcome_unknown';
                $this->recordOpenOrder($report, $exchangeId, $symbol, $this->stringAt($result, 'orderId', ''), 'cancel_failed');
            } elseif ($this->stringAt($order, 'status', '') === 'open') {
                //  cancelled - or on the limit_protected path, cancelled by
                //  placeProtectedLimit - and the venue STILL calls it open. The order is
                //  live whatever this class asked for, so the same rule applies: report it,
                //  and refuse to size anything downstream from a fill that can still grow.
                $result['status'] = 'outcome_unknown';
                $this->recordOpenOrder($report, $exchangeId, $symbol, $this->stringAt($result, 'orderId', ''), 'still_open');
            }
            $report['ordersPlaced'] = $this->numberAt($report, 'ordersPlaced', 0) + 1;
            return $result;
        } catch (\Throwable $e) {
            //  containment. A leg that throws must not take its siblings with it.
            $result['status'] = 'failed';
            $result['errorCode'] = $this->errorCodeOf($e);
            $this->recordError($report, $stepIndex, $exchangeId, $symbol, $result['errorCode']);
            //  createOrder may already have succeeded: every path between it and
            //  the final read — a poll that times out, a network drop, a cap
            //  re-check — leaves a real order on a real venue. Reporting the id
            //  is the difference between an operator who can go cancel it and one
            //  who never learns it exists.
            $knownId = $this->stringAt($result, 'orderId', '');
            if ($knownId !== '') {
                //  'failed' would read as "nothing happened" while openOrders says
                //  the opposite, and one report must not carry both readings.
                //  Having an id means createOrder RETURNED — the venue accepted
                //  something — so whatever threw afterwards left a real order
                //  behind whose fill is simply unknown to us.
                $result['status'] = 'outcome_unknown';
                $this->recordOpenOrder($report, $exchangeId, $symbol, $knownId, 'outcome_unknown');
            } elseif ($this->boolAt($result, 'placementAttempted', false) && $this->isOutcomeUnknownError($result['errorCode'])) {
                // The order was dispatched and the venue's answer never arrived. It may well have
                // been accepted; we simply never learned its id. Reporting that as a plain failure
                // asserts "nothing happened", which is the one reading that is certainly wrong.
                // A DEFINITE rejection is left as 'failed' on purpose: those are answers, not
                // silence, and flagging every rejection would bury the genuinely ambiguous ones.
                $result['status'] = 'outcome_unknown';
                $this->recordUnconfirmedPlacement($report, $exchangeId, $symbol, 'placement_unconfirmed');
            }
            return $result;
        }
    }

    /**
     * @ignore
     * appends one possibly-live order to the report, ignoring a blank id and never recording the same id twice
     * @param array $report the report, by reference
     * @param string $exchangeId the venue
     * @param string $symbol the market
     * @param string $orderId the venue's order id
     * @param string $reason why the order may still be open
     * @return void
     */
    public function hasNumberAt($container, $key) {
        if ($container === null || !is_array($container) || !array_key_exists($key, $container)) {
            return false;
        }
        $value = $container[$key];
        if ($value === null || is_bool($value)) {
            return false;
        }
        // deliberately the same coercion numberAt does, so "usable" and "present" cannot disagree
        if (is_int($value) || is_float($value)) {
            return $this->isFiniteNumber((float) $value);
        }
        if (is_string($value)) {
            return $this->isFiniteNumber($this->parseNumber($value, NAN));
        }
        return false;
    }

    public function refetchOrder($venue, $orderId, $symbol, $fallback) {
        try {
            $reread = $venue->fetchOrder($orderId, $symbol);
            if ($reread === null) {
                return $fallback;
            }
            return $reread;
        } catch (\Throwable $e) {
            // the caller marks the fill unknown; a throw here must not lose the placement record
            return $fallback;
        }
    }

    public function isOutcomeUnknownError($errorCode) {
        // ccxt's NetworkError family: the request failed in a way that does not tell us whether
        // the venue processed it. Everything else in the hierarchy is the venue ANSWERING.
        return $errorCode === 'RequestTimeout' || $errorCode === 'ExchangeNotAvailable'
            || $errorCode === 'NetworkError' || $errorCode === 'OnMaintenance';
    }

    public function recordUnconfirmedPlacement(&$report, $exchangeId, $symbol, $reason) {
        $openOrders = $this->listAt($report, 'openOrders');
        foreach ($openOrders as $entry) {
            if ($this->stringAt($entry, 'exchangeId', '') === $exchangeId
                && $this->stringAt($entry, 'symbol', '') === $symbol
                && $this->stringAt($entry, 'reason', '') === $reason) {
                return;
            }
        }
        $report['openOrders'][] = array('exchangeId' => $exchangeId, 'symbol' => $symbol, 'orderId' => '', 'reason' => $reason);
    }

    public function recordOpenOrder(&$report, $exchangeId, $symbol, $orderId, $reason) {
        if ($orderId === '') {
            //  nothing to point an operator at
            return;
        }
        $openOrders = $this->listAt($report, 'openOrders');
        for ($i = 0; $i < count($openOrders); $i++) {
            if (($this->stringAt($openOrders[$i], 'orderId', '') === $orderId) && ($this->stringAt($openOrders[$i], 'exchangeId', '') === $exchangeId)) {
                return;
            }
        }
        $report['openOrders'][] = array('exchangeId' => $exchangeId, 'symbol' => $symbol, 'orderId' => $orderId, 'reason' => $reason);
    }

    /**
     * @ignore
     * names a caught exception by its class, which is the one label all six languages agree on
     * @param mixed $e the caught exception
     * @return string the exception class name without its namespace, or unknown_error
     */
    public function errorCodeOf($e) {
        if ($e === null) {
            return 'unknown_error';
        }
        if (!is_object($e)) {
            return 'unknown_error';
        }
        $className = get_class($e);
        $separator = strrpos($className, '\\');
        if ($separator === false) {
            return $className;
        }
        return substr($className, $separator + 1);
    }

    /**
     * @ignore
     * places an immediate-or-cancel limit order, falling back to a market order only when the venue cannot do IOC and the caller explicitly allowed it
     * @param mixed $venue the exchange instance
     * @param string $symbol the market
     * @param string $side buy or sell
     * @param float $amount the precision-snapped amount
     * @param float $price the precision-snapped limit price
     * @param array $orderParams extra params for createOrder
     * @param array $options the execute options
     * @param array $result the step result, stamped with the order id the instant createOrder returns, by reference
     * @return array the order
     */
    public function placeImmediateOrder($venue, $symbol, $side, $amount, $price, $orderParams, $options, &$result) {
        if ($this->venueSupportsIoc($venue)) {
            $orderParams['timeInForce'] = 'IOC';
            // Set immediately before the call that can leave a real order on a real venue, and
            // never reset. Anything that fails before this point — a missing venue, a size that
            // rounds to zero, the notional cap, a venue that cannot do IOC — dispatched nothing.
            $result['placementAttempted'] = true;
            $iocOrder = $this->assertNotPromise($venue->createOrder($symbol, 'limit', $side, $amount, $price, $orderParams), 'createOrder');
            $result['orderId'] = $this->stringAt($iocOrder, 'id', '');
            return $iocOrder;
        }
        if ($this->fieldAt($options, 'allowMarketOrders') !== true) {
            //  a market order is an unbounded price, and switching to one on a
            //  caller's behalf is exactly the decision they did not delegate
            throw new NotSupported('OrderRouter: venue cannot do IOC and allowMarketOrders was not set');
        }
        // A market order and a notional cap cannot both be honoured. assertUnderCap valued this order
        // at the plan's LIMIT price, and the call below sends no price at all: the venue fills wherever
        // the book is, which is the one thing the cap exists to bound. Passing the check and then
        // removing the price it was computed from is a cap that silently disappears, which by this
        // file's own rule is not a cap. So the two options are refused together.
        if ($this->numberAt($options, 'maxNotionalUsd', $this->maxNotionalUsd) > 0) {
            throw new NotSupported('OrderRouter: allowMarketOrders cannot be honoured under a maxNotionalUsd cap, because a market order has no price to check');
        }
        $result['placementAttempted'] = true;
        $marketOrder = $this->assertNotPromise($venue->createOrder($symbol, 'market', $side, $amount, null, $orderParams), 'createOrder');
        $result['orderId'] = $this->stringAt($marketOrder, 'id', '');
        return $marketOrder;
    }

    /**
     * @ignore
     * rests a limit order, then cancels it on timeout and ALWAYS re-reads it, because a cancel and a fill can cross
     * @param mixed $venue the exchange instance
     * @param array $step the step being traded
     * @param string $symbol the market
     * @param string $side buy or sell
     * @param float $amount the precision-snapped amount
     * @param float $price the precision-snapped limit price
     * @param array $orderParams extra params for createOrder
     * @param array $options the execute options
     * @param array $report the report, for openOrders, by reference
     * @param array $result the step result, stamped with the order id the instant createOrder returns, by reference
     * @return array the order as last observed, which is the authoritative fill
     */
    public function placeProtectedLimit($venue, $step, $symbol, $side, $amount, $price, $orderParams, $options, &$report, &$result) {
        $timeoutMs = $this->numberAt($options, 'orderTimeoutMs', 20000);
        $pollIntervalMs = $this->numberAt($options, 'pollIntervalMs', 1000);
        $result['placementAttempted'] = true;
        $order = $this->assertNotPromise($venue->createOrder($symbol, 'limit', $side, $amount, $price, $orderParams), 'createOrder');
        $orderId = $this->stringAt($order, 'id', '');
        //  before the first poll, the first sleep and the first thing that can go
        //  wrong: from here on the caller can always name what is resting
        $result['orderId'] = $orderId;
        $waited = 0;
        while ($waited < $timeoutMs) {
            if (($this->stringAt($order, 'status', '') === 'closed') || ($this->stringAt($order, 'status', '') === 'canceled')) {
                return $order;
            }
            $this->sleep($pollIntervalMs);
            $waited = $waited + $pollIntervalMs;
            $order = $venue->fetchOrder($orderId, $symbol);
        }
        $finalStatus = $this->stringAt($order, 'status', '');
        if (($finalStatus === 'closed') || ($finalStatus === 'canceled')) {
            //  the venue ended it on the last poll — an expiry, a self-trade
            //  prevention, a post-only rejection of the remainder. Cancelling an
            //  order the venue already closed throws, and the partial fill this
            //  order carries is real: dropping it would hide a live position from
            //  the report AND from the unwind plan built out of it.
            return $order;
        }
        try {
            $venue->cancelOrder($orderId, $symbol);
        } catch (\Throwable $e) {
            //  the order may still be live. Reporting a fill we did not observe
            //  would be a lie, and continuing to the next hop on top of an
            //  unknown position is worse.
            $this->recordOpenOrder($report, $this->stringAt($step, 'exchangeId', ''), $symbol, $orderId, 'cancel_failed');
            throw new ExchangeError('OrderRouter: cancelOrder failed and an order is left OPEN, refusing to proceed');
        }
        //  ALWAYS re-read after a cancel: the cancel and the fill can cross, and
        //  the observed order is the only authority on what actually happened
        return $venue->fetchOrder($orderId, $symbol);
    }

    /**
     * @ignore
     * reports whether a venue is known NOT to support immediate-or-cancel
     * @param mixed $venue the exchange instance
     * @return bool true unless the venue's features explicitly list timeInForce values without IOC
     */
    public function venueSupportsIoc($venue) {
        //  Defaults to TRUE on purpose. An unknown answer here must not fall
        //  through to a market order; a rejected IOC is a loud, cheap failure
        //  and an unintended market order is a silent, expensive one.
        $features = $this->dictAt($venue, 'features');
        $spot = $this->dictAt($features, 'spot');
        $createOrder = $this->dictAt($spot, 'createOrder');
        //  EVERY real ccxt exchange declares this as a dictionary of booleans —
        //  array('IOC' => true, 'FOK' => true, 'GTC' => true, ...) — and not one
        //  declares it as a list. Reading it as a list only ever answered
        //  "empty", which is the same answer as "the venue said nothing", so the
        //  check always said yes and the market-order path below was unreachable.
        $timeInForceFlags = $this->dictAt($createOrder, 'timeInForce');
        if (count($timeInForceFlags) > 0) {
            //  a venue that enumerates its time-in-force values and leaves IOC
            //  out has said no, exactly as one that says IOC => false has
            return $this->boolAt($timeInForceFlags, 'IOC', false);
        }
        //  a list is still honoured, for a caller-built stub venue
        $timeInForce = $this->listAt($createOrder, 'timeInForce');
        if (count($timeInForce) === 0) {
            return true;
        }
        for ($i = 0; $i < count($timeInForce); $i++) {
            if ($timeInForce[$i] === 'IOC') {
                return true;
            }
        }
        return false;
    }

    /**
     * @ignore
     * throws unless a single order's USD notional is known and within the per-trade cap
     * @param array $step the step being traded
     * @param float $amount the snapped amount actually being sent
     * @param float $price the snapped price actually being sent
     * @param array $usdRates currency code to USD price
     * @param array $options the execute options, read for a per-call maxNotionalUsd
     * @return void
     */
    public function assertUnderCap($step, $amount, $price, $usdRates, $options) {
        $cap = $this->numberAt($options, 'maxNotionalUsd', $this->maxNotionalUsd);
        if ($cap <= 0) {
            //  no cap set, so there is nothing to enforce here
            return;
        }
        $probe = array(
            'base' => $this->stringAt($step, 'base', ''),
            'quote' => $this->stringAt($step, 'quote', ''),
            'amount' => $amount,
        );
        $usdValue = $this->notionalUsd($probe, $amount * $price, $usdRates);
        if ($usdValue <= 0) {
            throw new ExchangeError('OrderRouter: refusing to place an order that cannot be valued in USD');
        }
        if ($usdValue > $cap * (1 + self::TOLERANCE)) {
            throw new ExchangeError('OrderRouter: refusing to place an order above the per-trade USD notional cap');
        }
    }

    /**
     * @ignore
     * verifies every step's input is already sitting on its venue, which is what atomic_ish actually requires
     * @param array $steps the working steps
     * @param array $venues exchangeId to exchange instance
     * @return void
     */
    public function assertPrefunded($steps, $venues) {
        $this->assertSyncVenues($venues);
        //  built as an array, not a map, so the first shortfall reported is the
        //  same one in all six languages
        $required = array();
        for ($i = 0; $i < count($steps); $i++) {
            $step = $steps[$i];
            $exchangeId = $this->stringAt($step, 'exchangeId', '');
            $amount = $this->numberAt($step, 'amount', 0);
            $asset = '';
            $needed = 0;
            if ($this->stringAt($step, 'side', '') === 'buy') {
                $asset = $this->stringAt($step, 'quote', '');
                $needed = $amount * $this->stepLimitPrice($step);
            } else {
                $asset = $this->stringAt($step, 'base', '');
                $needed = $amount;
            }
            $found = false;
            for ($j = 0; $j < count($required); $j++) {
                if (($required[$j]['exchangeId'] === $exchangeId) && ($required[$j]['asset'] === $asset)) {
                    $required[$j]['amount'] = $this->numberAt($required[$j], 'amount', 0) + $needed;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $required[] = array('exchangeId' => $exchangeId, 'asset' => $asset, 'amount' => $needed);
            }
        }
        $balances = array();
        for ($i = 0; $i < count($required); $i++) {
            $exchangeId = $this->stringAt($required[$i], 'exchangeId', '');
            if (!array_key_exists($exchangeId, $balances)) {
                $balances[$exchangeId] = $venues[$exchangeId]->fetchBalance();
            }
            $free = $this->dictAt($balances[$exchangeId], 'free');
            $asset = $this->stringAt($required[$i], 'asset', '');
            $available = $this->numberAt($free, $asset, 0);
            if ($available < $this->numberAt($required[$i], 'amount', 0)) {
                //  most routes fail this, and that is the correct outcome:
                //  atomic_ish names its own hedge, because there is no
                //  cross-venue atomicity and there cannot be
                throw new InsufficientFunds('OrderRouter: atomic_ish requires the whole route pre-funded, and ' . $exchangeId . ' is short of ' . $asset);
            }
        }
    }

    /**
     * @ignore
     * writes a reconciliation's downstream resize back into the working steps
     * @param array $steps the working steps, by reference
     * @param array $reconciliation the result of reconcileExecutionStep
     * @return void
     */
    public function applyResize(&$steps, $reconciliation) {
        //  Record what this leg actually produced BEFORE resizing anything. reconcileExecutionStep
        //  is pure and cannot remember across calls, so the hop's cumulative shortfall has to live
        //  on the steps themselves — this is what stops the next leg of the same hop compounding
        //  its scale onto an already-scaled amount.
        $reconciledStep = $this->numberAt($reconciliation, 'stepIndex', -1);
        for ($i = 0; $i < count($steps); $i++) {
            if ($this->numberAt($steps[$i], 'stepIndex', -1) == $reconciledStep) {
                $steps[$i]['realisedOut'] = $this->numberAt($reconciliation, 'realisedOut', 0);
                break;
            }
        }
        $resized = $this->listAt($reconciliation, 'resizedSteps');
        for ($i = 0; $i < count($resized); $i++) {
            $entry = $resized[$i];
            $stepIndex = $this->numberAt($entry, 'stepIndex', -1);
            for ($j = 0; $j < count($steps); $j++) {
                if ($this->numberAt($steps[$j], 'stepIndex', -1) == $stepIndex) {
                    $steps[$j]['amount'] = $this->numberAt($entry, 'amount', 0);
                    $steps[$j]['notionalQuote'] = $this->numberAt($entry, 'notionalQuote', 0);
                    break;
                }
            }
        }
    }

    /**
     * @ignore
     * marks every step from an index onwards as skipped after a halt
     * @param array $results the report's step results, by reference
     * @param int $start the first index to mark
     * @return void
     */
    public function markRemainingSkipped(&$results, $start) {
        for ($i = $start; $i < count($results); $i++) {
            if ($this->stringAt($results[$i], 'status', '') === 'planned') {
                $results[$i]['status'] = 'skipped';
            }
        }
    }

    /**
     * @ignore
     * appends one error to the report
     * @param array $report the report, by reference
     * @param int $stepIndex the step that failed
     * @param string $exchangeId the venue
     * @param string $symbol the market
     * @param string $code the error class name or an internal code
     * @return void
     */
    public function recordError(&$report, $stepIndex, $exchangeId, $symbol, $code) {
        $report['errors'][] = array('stepIndex' => $stepIndex, 'exchangeId' => $exchangeId, 'symbol' => $symbol, 'code' => $code);
    }

    /**
     * @ignore
     * totals what the first hop spent and what the last hop produced
     * @param array $report the report, by reference
     * @param array $steps the working steps
     * @return void
     */
    public function summariseReport(&$report, $steps) {
        $results = $this->listAt($report, 'steps');
        $lastHop = 0;
        for ($i = 0; $i < count($steps); $i++) {
            $hopIndex = $this->numberAt($steps[$i], 'hopIndex', 0);
            if ($hopIndex > $lastHop) {
                $lastHop = $hopIndex;
            }
        }
        $filledIn = 0;
        $filledOut = 0;
        for ($i = 0; $i < count($results); $i++) {
            $hopIndex = $this->numberAt($results[$i], 'hopIndex', 0);
            if ($hopIndex == 0) {
                $filledIn = $filledIn + $this->numberAt($results[$i], 'inAmount', 0);
            }
            if ($hopIndex == $lastHop) {
                $filledOut = $filledOut + $this->numberAt($results[$i], 'outAmount', 0);
            }
        }
        $report['filledIn'] = $filledIn;
        $report['filledOut'] = $filledOut;
    }

    /**
     * @ignore
     * waits for a number of milliseconds
     * @param int $milliseconds how long to wait
     * @return void
     */
    /**
     * Reads the wall clock, in milliseconds since the epoch. The only clock this class reads,
     * isolated in one overridable method so a test can pin time.
     *
     * @return float
     */
    public function nowMs() {
        return floor(microtime(true) * 1000);
    }

    public function sleep($milliseconds) {
        usleep(intval($milliseconds * 1000));
    }
}
