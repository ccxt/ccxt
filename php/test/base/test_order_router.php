<?php

// NO_AUTO_TRANSPILE
//  ---------------------------------------------------------------------------
//  OrderRouter — offline tests, PHP port.
//
//  Run:  php php/test/base/test_order_router.php
//
//  Two halves, and both matter:
//
//  1. The FIXTURE half drives the four pure methods from
//     ts/src/test/base/fixtures/orderRouter.json — the SAME file the TypeScript,
//     Python, C# and Go suites read. Nothing here restates an expected value by
//     hand, so a PHP implementation that drifts from the reference fails here
//     and nowhere else, which is what makes drift impossible to hide. The
//     comparison algorithm is the one documented in the fixture's `comparison`
//     field: key sets compared BOTH directions, numbers at 1e-9 relative.
//
//  2. The INVARIANT half asserts the safety properties directly, in literal
//     numbers written by hand. The fixture's expectations were produced by the
//     reference implementation, so on their own they would only prove the six
//     languages agree — not that they agree on the right answer.
//
//  Nothing here touches the network and nothing here places an order.
//  ---------------------------------------------------------------------------

namespace ccxt;

namespace ccxt\async;

// Declared here rather than in a fixture file so the suite stays one file, as its five siblings do.
class OrderRouterFakeAsyncVenue {
    public $id = 'stub';
    public function amountToPrecision($symbol, $amount) { return (string) $amount; }
    public function priceToPrecision($symbol, $price) { return (string) $price; }
    public function loadMarkets($reload = false, $params = array()) { return array(); }
    public function createOrder($symbol, $type, $side, $amount, $price = null, $params = array()) {
        throw new \Exception('the guard must fire before any order is dispatched');
    }
}

namespace ccxt;


if (!defined('PATH_TO_CCXT')) {
    define('PATH_TO_CCXT', __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR);
}

require_once PATH_TO_CCXT . 'ArgumentsRequired.php';
require_once PATH_TO_CCXT . 'BadRequest.php';
require_once PATH_TO_CCXT . 'NotSupported.php';
require_once PATH_TO_CCXT . 'InsufficientFunds.php';
require_once PATH_TO_CCXT . 'AuthenticationError.php';
require_once PATH_TO_CCXT . 'RateLimitExceeded.php';
require_once PATH_TO_CCXT . 'RequestTimeout.php';
require_once PATH_TO_CCXT . 'ExchangeNotAvailable.php';
require_once PATH_TO_CCXT . 'OrderRouter.php';

//  ---------------------------------------------------------------------------
//  a very small harness — no phpunit, so this file runs anywhere php does
//  ---------------------------------------------------------------------------

class OrderRouterTestFailure extends \Exception {
}

function order_router_assert($condition, $message) {
    if (!$condition) {
        throw new OrderRouterTestFailure($message);
    }
}

function order_router_assert_throws($callable, $className, $message) {
    try {
        $callable();
    } catch (\Throwable $e) {
        order_router_assert($e instanceof $className, $message . ': expected ' . $className . ', got ' . get_class($e) . ' (' . $e->getMessage() . ')');
        return;
    }
    order_router_assert(false, $message . ': expected ' . $className . ', nothing was thrown');
}

function order_router_text($value) {
    if (is_bool($value)) {
        return $value ? 'true' : 'false';
    }
    if ($value === null) {
        return 'null';
    }
    if (is_array($value)) {
        return json_encode($value);
    }
    return strval($value);
}

//  ---------------------------------------------------------------------------
//  comparison helpers — the algorithm every port's test must use
//  ---------------------------------------------------------------------------

const ORDER_ROUTER_TEST_TOLERANCE = 1e-9;

function order_router_numbers_match($a, $b) {
    if ($a === $b) {
        return true;
    }
    if (!is_finite($a) || !is_finite($b)) {
        //  an infinity only ever matches itself. Without this the relative
        //  comparison below reads INF <= INF as a match and an infinite value
        //  passes against ANY expectation — which is exactly how a number
        //  grammar that overflows would slip past the numberCases table
        return false;
    }
    $scale = 1;
    if (abs($a) > $scale) {
        $scale = abs($a);
    }
    if (abs($b) > $scale) {
        $scale = abs($b);
    }
    return abs($a - $b) <= ORDER_ROUTER_TEST_TOLERANCE * $scale;
}

function order_router_assert_matches($actual, $expected, $where) {
    //  a JSON array decodes to a PHP list, a JSON object to an associative array
    if (is_array($expected) && array_is_list($expected)) {
        order_router_assert(is_array($actual) && array_is_list($actual), $where . ': expected a list, got ' . order_router_text($actual));
        order_router_assert(count($actual) === count($expected), $where . ': array length, expected ' . count($expected) . ', got ' . count($actual));
        for ($i = 0; $i < count($expected); $i++) {
            order_router_assert_matches($actual[$i], $expected[$i], $where . '[' . $i . ']');
        }
        return;
    }
    if (is_array($expected)) {
        order_router_assert(is_array($actual), $where . ': expected a dictionary, got ' . order_router_text($actual));
        $expectedKeys = array_keys($expected);
        sort($expectedKeys, SORT_STRING);
        $actualKeys = array_keys($actual);
        sort($actualKeys, SORT_STRING);
        //  both directions: a missing field and an invented field are both drift
        order_router_assert($expectedKeys === $actualKeys, $where . ': key set, expected [' . implode(',', $expectedKeys) . '], got [' . implode(',', $actualKeys) . ']');
        for ($i = 0; $i < count($expectedKeys); $i++) {
            $key = $expectedKeys[$i];
            order_router_assert_matches($actual[$key], $expected[$key], $where . '.' . $key);
        }
        return;
    }
    if (is_bool($expected)) {
        order_router_assert($actual === $expected, $where . ': expected ' . order_router_text($expected) . ', got ' . order_router_text($actual));
        return;
    }
    if (is_int($expected) || is_float($expected)) {
        order_router_assert(is_int($actual) || is_float($actual), $where . ': expected a number, got ' . order_router_text($actual));
        order_router_assert(order_router_numbers_match(floatval($actual), floatval($expected)), $where . ': expected ' . order_router_text($expected) . ', got ' . order_router_text($actual));
        return;
    }
    order_router_assert($actual === $expected, $where . ': expected ' . order_router_text($expected) . ', got ' . order_router_text($actual));
}

//  ---------------------------------------------------------------------------
//  fixtures and stubs
//  ---------------------------------------------------------------------------

function order_router_fixture() {
    static $fixture = null;
    if ($fixture === null) {
        $path = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'ts' . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . 'test' . DIRECTORY_SEPARATOR . 'base' . DIRECTORY_SEPARATOR . 'fixtures' . DIRECTORY_SEPARATOR . 'orderRouter.json';
        $fixture = json_decode(file_get_contents($path), true);
        order_router_assert(is_array($fixture), 'the shared fixture could not be read from ' . $path);
    }
    return $fixture;
}

function order_router_permissive_markets() {
    return array(
        'stub' => array(
            'BTC/USDT' => array(
                'symbol' => 'BTC/USDT',
                'base' => 'BTC',
                'quote' => 'USDT',
                'precision' => array('amount' => 0, 'price' => 0),
                'limits' => array(
                    'amount' => array('min' => 0, 'max' => 0),
                    'price' => array('min' => 0, 'max' => 0),
                    'cost' => array('min' => 0, 'max' => 0),
                ),
            ),
        ),
    );
}

//  A market that actually declares limits, unlike order_router_permissive_markets(). A hand-built
//  plan has to clear these the same way a routed one does.
function order_router_bounded_markets() {
    return array(
        'stub' => array(
            'BTC/USDT' => array(
                'symbol' => 'BTC/USDT',
                'base' => 'BTC',
                'quote' => 'USDT',
                'precision' => array('amount' => 0, 'price' => 0),
                'limits' => array(
                    'amount' => array('min' => 0.0001, 'max' => 0),
                    'price' => array('min' => 1, 'max' => 1000000),
                    'cost' => array('min' => 10, 'max' => 0),
                ),
            ),
        ),
    );
}

//  every route the invariant tests build gets its own requestId: execute() derives the
//  re-execution guard key from it, and refuses a live plan that carries none. A counter, not
//  a random value — the ids stay reproducible.
function order_router_next_request_id() {
    static $counter = 0;
    $counter = $counter + 1;
    return 'test-req-' . strval($counter);
}

function order_router_one_leg_route($side, $base, $quote, $amount, $price) {
    return array(
        'requestId' => order_router_next_request_id(),
        'from' => ($side === 'buy') ? $quote : $base,
        'to' => ($side === 'buy') ? $base : $quote,
        'strategy' => 'best_single',
        'exactSide' => 'in',
        'amountIn' => ($side === 'buy') ? $amount * $price : $amount,
        'amountOut' => ($side === 'buy') ? $amount : $amount * $price,
        'fullyFillable' => true,
        'fillRatio' => 1,
        'unroutableReason' => null,
        'hops' => array(
            array(
                'pair' => $base . '/' . $quote,
                'side' => $side,
                'base' => $base,
                'quote' => $quote,
                'amountIn' => ($side === 'buy') ? $amount * $price : $amount,
                'amountOut' => ($side === 'buy') ? $amount : $amount * $price,
                'legs' => array(array('exchangeId' => 'stub', 'amount' => $amount, 'averagePrice' => $price, 'takerFeeRate' => 0, 'feeCost' => 0, 'effectivePrice' => $price)),
                'fullyFillable' => true,
            ),
        ),
    );
}

function order_router_two_hop_route() {
    return array(
        'requestId' => order_router_next_request_id(),
        'from' => 'USDT',
        'to' => 'SOL',
        'strategy' => 'best_single',
        'exactSide' => 'in',
        'amountIn' => 20,
        'amountOut' => 0.2,
        'fullyFillable' => true,
        'fillRatio' => 1,
        'unroutableReason' => null,
        'hops' => array(
            array('pair' => 'BTC/USDT', 'side' => 'buy', 'base' => 'BTC', 'quote' => 'USDT', 'amountIn' => 20, 'amountOut' => 0.2, 'legs' => array(array('exchangeId' => 'stub', 'amount' => 0.2, 'averagePrice' => 100, 'effectivePrice' => 100))),
            array('pair' => 'BTC/USDT', 'side' => 'sell', 'base' => 'BTC', 'quote' => 'USDT', 'amountIn' => 0.2, 'amountOut' => 20, 'legs' => array(array('exchangeId' => 'stub', 'amount' => 0.2, 'averagePrice' => 100, 'effectivePrice' => 100))),
        ),
    );
}

/**
 * renders a double the way JavaScript's Number.prototype.toString does — the
 * shortest text that round-trips — so the stub venue's precision helpers and
 * its call log read the same in both languages
 */
function order_router_number_text($value) {
    return json_encode($value);
}

class OrderRouterStubVenue {

    public $id;
    public $markets;
    public $features;
    public $calls;
    public $fillRatio;
    public $failCreate;
    public $balance;
    //  a queue of orders fetchOrder hands back, one per poll; empty means the
    //  created order comes back closed on the first read
    public $fetchOrderResults;
    public $fetchOrderThrows;
    public $cancelThrows;
    public $createdStatus;
    //  array('cost' => , 'currency' => ) attached to the created order, as real venues do
    public $feeToCharge;
    //  a list of array('cost' => , 'currency' => ) attached as per-trade fees, as
    //  venues that report a fill as a list of trades do
    public $tradeFeesToCharge;
    //  every params array createOrder was called with, in call order
    public $paramsSeen;
    //  createOrder never answers: the outcome is unknown, not a rejection
    public $timeoutCreate;
    //  refuse this many createOrder calls, then behave: a venue that rejects and then relents
    public $failCreateTimes;

    public function __construct($id, $fillRatio = 1, $failCreate = false) {
        $this->id = $id;
        $this->fillRatio = $fillRatio;
        $this->failCreate = $failCreate;
        $this->calls = array();
        $permissive = order_router_permissive_markets();
        $this->markets = $permissive['stub'];
        $this->features = array('spot' => array('createOrder' => array('timeInForce' => array('GTC', 'IOC'))));
        $this->balance = array(
            'free' => array('USDT' => 1000, 'BTC' => 1, 'ZERO' => 0),
            'total' => array('USDT' => 1000, 'BTC' => 1),
        );
        $this->fetchOrderResults = array();
        $this->fetchOrderThrows = false;
        $this->cancelThrows = false;
        $this->createdStatus = '';
        $this->feeToCharge = null;
        $this->tradeFeesToCharge = array();
        $this->paramsSeen = array();
        $this->timeoutCreate = false;
        $this->failCreateTimes = 0;
    }

    public function fetchOrder($id, $symbol) {
        $this->calls[] = 'fetchOrder:' . $id;
        if ($this->fetchOrderThrows) {
            throw new ExchangeError('stub cannot read the order back');
        }
        if (count($this->fetchOrderResults) > 0) {
            return array_shift($this->fetchOrderResults);
        }
        return array('id' => $id, 'status' => 'closed', 'filled' => 0, 'average' => 0, 'cost' => 0);
    }

    public function cancelOrder($id, $symbol) {
        $this->calls[] = 'cancelOrder:' . $id;
        if ($this->cancelThrows) {
            throw new ExchangeError('stub refuses to cancel');
        }
        return array('id' => $id, 'status' => 'canceled');
    }

    public function loadMarkets() {
        $this->calls[] = 'loadMarkets';
        return $this->markets;
    }

    public function amountToPrecision($symbol, $amount) {
        return order_router_number_text($amount);
    }

    public function priceToPrecision($symbol, $price) {
        return order_router_number_text($price);
    }

    public function fetchBalance() {
        $this->calls[] = 'fetchBalance';
        return $this->balance;
    }

    public function createOrder($symbol, $type, $side, $amount, $price = null, $params = array()) {
        $this->calls[] = 'createOrder:' . $type . ':' . $side . ':' . order_router_number_text($amount);
        $this->paramsSeen[] = $params;
        if ($this->timeoutCreate) {
            throw new RequestTimeout('stub timed out');
        }
        if ($this->failCreateTimes > 0) {
            $this->failCreateTimes = $this->failCreateTimes - 1;
            throw new ExchangeError('stub refuses, for now');
        }
        if ($this->failCreate) {
            throw new ExchangeError('stub refuses');
        }
        $filled = $amount * $this->fillRatio;
        $average = ($price === null) ? 100 : $price;
        $status = ($this->createdStatus === '') ? 'closed' : $this->createdStatus;
        $body = array('id' => 'stub-order', 'status' => $status, 'filled' => $filled, 'average' => $average, 'cost' => $filled * $average);
        if (array_key_exists('clientOrderId', $params)) {
            //  a real venue echoes the client order id it was given
            $body['clientOrderId'] = $params['clientOrderId'];
        }
        if ($this->feeToCharge !== null) {
            $body['fee'] = $this->feeToCharge;
        }
        if (count($this->tradeFeesToCharge) > 0) {
            $trades = array();
            for ($i = 0; $i < count($this->tradeFeesToCharge); $i++) {
                $trades[] = array('fee' => $this->tradeFeesToCharge[$i]);
            }
            $body['trades'] = $trades;
        }
        return $body;
    }
}

class OrderRouterRecorder extends OrderRouter {

    public $lastUrl;
    public $body;

    public function __construct($config, $body) {
        parent::__construct($config);
        $this->body = $body;
        $this->lastUrl = '';
    }

    public function request($url) {
        $this->lastUrl = $url;
        return $this->body;
    }
}

//  ---------------------------------------------------------------------------
//  1. the shared fixture — the cross-language contract
//  ---------------------------------------------------------------------------

function order_router_test_fixture_build_execution_plan($router) {
    $fixture = order_router_fixture();
    $cases = $fixture['planCases'];
    order_router_assert(count($cases) > 0, 'the fixture has plan cases');
    for ($i = 0; $i < count($cases); $i++) {
        $testCase = $cases[$i];
        $route = $fixture['routes'][$testCase['route']];
        $plan = $router->buildExecutionPlan($route, $testCase['options']);
        order_router_assert_matches($plan, $testCase['expected'], 'planCase ' . $testCase['id']);
    }
}

function order_router_test_fixture_plan_is_deterministic($router) {
    $fixture = order_router_fixture();
    $cases = $fixture['planCases'];
    for ($i = 0; $i < count($cases); $i++) {
        $testCase = $cases[$i];
        $route = $fixture['routes'][$testCase['route']];
        $before = json_encode($route);
        $first = $router->buildExecutionPlan($route, $testCase['options']);
        $second = $router->buildExecutionPlan($route, $testCase['options']);
        order_router_assert_matches($second, $first, 'planCase ' . $testCase['id'] . ' repeated');
        order_router_assert(json_encode($route) === $before, 'planCase ' . $testCase['id'] . ': the route was mutated');
    }
}

function order_router_test_fixture_check_execution_plan_safety($router) {
    $fixture = order_router_fixture();
    $cases = $fixture['safetyCases'];
    order_router_assert(count($cases) > 0, 'the fixture has safety cases');
    for ($i = 0; $i < count($cases); $i++) {
        $testCase = $cases[$i];
        $route = $fixture['routes'][$testCase['route']];
        $markets = $fixture['marketSets'][$testCase['markets']];
        $plan = $router->buildExecutionPlan($route, $testCase['planOptions']);
        $violations = $router->checkExecutionPlanSafety($plan, $markets, $testCase['options']);
        order_router_assert_matches($violations, $testCase['expected'], 'safetyCase ' . $testCase['id']);
    }
}

function order_router_test_fixture_reconcile_execution_step($router) {
    $fixture = order_router_fixture();
    $cases = $fixture['reconcileCases'];
    order_router_assert(count($cases) > 0, 'the fixture has reconcile cases');
    for ($i = 0; $i < count($cases); $i++) {
        $testCase = $cases[$i];
        //  a case names either a route to plan from, or a plan written out in
        //  full — the latter is how a plan with field types no builder produces
        //  (an int hopIndex on one step and a float on the next) gets covered.
        //  PHP is where that distinction bites: === compares type as well.
        if (isset($testCase['plan'])) {
            $plan = $fixture['plans'][$testCase['plan']];
        } else {
            $plan = $router->buildExecutionPlan($fixture['routes'][$testCase['route']], $testCase['planOptions']);
        }
        $verdict = $router->reconcileExecutionStep($plan, $testCase['stepIndex'], $testCase['realisedOut']);
        order_router_assert_matches($verdict, $testCase['expected'], 'reconcileCase ' . $testCase['id']);
    }
}

function order_router_refuses_plan($router, $route, $fragment, $message) {
    try {
        $router->buildExecutionPlan($route, array());
    } catch (\Throwable $e) {
        order_router_assert(strpos($e->getMessage(), $fragment) !== false, $message . ': threw "' . $e->getMessage() . '", expected "' . $fragment . '"');
        return;
    }
    order_router_assert(false, $message . ': nothing was thrown');
}

function order_router_test_route_produces_mismatch($router) {
    //  buildExecutionPlan used to copy from, to, pair and side straight out of the server's JSON,
    //  and the safety checks only tested internal consistency against whatever market that named.
    //  So a compromised — or simply buggy — router response could steer real orders into any real
    //  market and every check would pass it, under the 25 USD cap. The client now checks the
    //  answer against its OWN record of the question.
    $route = order_router_one_leg_route('buy', 'BTC', 'USDT', 0.1, 100);
    $route['clientRequestedFrom'] = 'USDT';
    $route['clientRequestedTo'] = 'ETH';   //  the caller wanted ETH; the route delivers BTC
    order_router_refuses_plan($router, $route, 'produces BTC, not the requested ETH', 'a produces mismatch');
}

function order_router_test_route_spends_mismatch($router) {
    $route = order_router_one_leg_route('buy', 'BTC', 'USDT', 0.1, 100);
    $route['clientRequestedFrom'] = 'EUR';
    $route['clientRequestedTo'] = 'BTC';
    order_router_refuses_plan($router, $route, 'spends USDT, not the requested EUR', 'a spends mismatch');
}

function order_router_test_route_chain_break($router) {
    //  Internal coherence, checked with or without a client stamp: hop 2 must spend exactly what
    //  hop 1 produced, or the plan strands the proceeds of one order and funds the next from a
    //  wallet nobody checked.
    $route = order_router_two_hop_route();
    $route['hops'][1]['base'] = 'DOGE';
    $route['hops'][1]['quote'] = 'EUR';
    order_router_refuses_plan($router, $route, 'spends DOGE but the previous hop produced BTC', 'a broken chain');
}

function order_router_test_route_well_formed_still_plans($router) {
    $route = order_router_one_leg_route('buy', 'BTC', 'USDT', 0.1, 100);
    $route['clientRequestedFrom'] = 'USDT';
    $route['clientRequestedTo'] = 'BTC';
    $plan = $router->buildExecutionPlan($route, array());
    order_router_assert(count($plan['steps']) === 1, 'a coherent route still plans');
}

function order_router_test_fixture_reconcile_sequence($router) {
    //  reconcileExecutionStep is pure and cannot remember across calls, so a hop's cumulative
    //  shortfall lives on the steps themselves — written by applyResize. That interaction is only
    //  visible across a SEQUENCE of calls, which reconcileCases (one call each) cannot express,
    //  and it is exactly where the six ports could silently disagree.
    $fixture = order_router_fixture();
    $cases = $fixture['reconcileSequenceCases'];
    order_router_assert(count($cases) > 0, 'the fixture has reconcile sequence cases');
    for ($i = 0; $i < count($cases); $i++) {
        $testCase = $cases[$i];
        $steps = json_decode(json_encode($testCase['steps']), true);
        $calls = $testCase['calls'];
        for ($c = 0; $c < count($calls); $c++) {
            //  the plan is rebuilt from the working steps on every call, exactly as execute()
            //  does — PHP copies arrays on assignment, so a plan built once outside this loop
            //  would never see what applyResize wrote
            $plan = array('steps' => $steps, 'reconcileToleranceRatio' => $testCase['reconcileToleranceRatio']);
            $reconciliation = $router->reconcileExecutionStep($plan, $calls[$c]['stepIndex'], $calls[$c]['realisedOut']);
            order_router_assert(order_router_numbers_match($reconciliation['scale'], $testCase['expectedScales'][$c]), 'reconcileSequenceCase ' . $testCase['id'] . ' call ' . strval($c) . ': scale ' . strval($reconciliation['scale']));
            $router->applyResize($steps, $reconciliation);
        }
        for ($sIndex = 0; $sIndex < count($steps); $sIndex++) {
            order_router_assert(order_router_numbers_match($steps[$sIndex]['amount'], $testCase['expectedAmounts'][$sIndex]), 'reconcileSequenceCase ' . $testCase['id'] . ' step ' . strval($sIndex) . ': amount ' . strval($steps[$sIndex]['amount']));
        }
    }
}

function order_router_test_fixture_number_at($router) {
    //  Every port hand-implements JavaScript's parseFloat prefix grammar rather
    //  than calling its own parser, because every language's own parser disagrees
    //  with the other four somewhere. These cases are the contract: a cap read as
    //  1234.5 in one language and 1 in another is a cap that silently disappears,
    //  and this table is what stops that shipping green.
    $fixture = order_router_fixture();
    $cases = $fixture['numberCases'];
    order_router_assert(count($cases) > 0, 'the fixture has number cases');
    for ($i = 0; $i < count($cases); $i++) {
        $testCase = $cases[$i];
        $actual = $router->numberAt($testCase['container'], $testCase['key'], $testCase['default']);
        order_router_assert(is_int($actual) || is_float($actual), 'numberCase ' . $testCase['id'] . ': not a number');
        order_router_assert(order_router_numbers_match(floatval($actual), floatval($testCase['expected'])), 'numberCase ' . $testCase['id'] . ': expected ' . order_router_text($testCase['expected']) . ', got ' . order_router_text($actual));
    }
}

function order_router_test_fixture_format_number($router) {
    //  formatNumber builds the balances query string. A balance spelled differently per language
    //  is a DIFFERENT QUESTION asked of the router, so the tie cases here are load-bearing:
    //  PHP's '%.12F' rounds half to EVEN and answered ...312 where the TypeScript reference
    //  answers ...313, and this table is what stops that coming back.
    $fixture = order_router_fixture();
    $cases = $fixture['formatNumberCases'];
    order_router_assert(count($cases) > 0, 'the fixture has formatNumber cases');
    for ($i = 0; $i < count($cases); $i++) {
        $testCase = $cases[$i];
        $actual = $router->formatNumber($testCase['value']);
        order_router_assert($actual === $testCase['expected'], 'formatNumberCase ' . $testCase['id'] . ': expected ' . $testCase['expected'] . ', got ' . $actual);
    }
}

function order_router_test_fixture_fee_netting($router) {
    //  Fee netting is the one placeStep behaviour that CHANGES the size of the next order, and
    //  until this section existed it was asserted in TypeScript and nowhere else — a port that
    //  silently stopped netting would have shipped green in its own language.
    $fixture = order_router_fixture();
    $cases = $fixture['feeNettingCases'];
    order_router_assert(count($cases) > 0, 'the fixture has fee netting cases');
    for ($i = 0; $i < count($cases); $i++) {
        $testCase = $cases[$i];
        $route = order_router_one_leg_route($testCase['side'], $testCase['base'], $testCase['quote'], $testCase['amount'], $testCase['price']);
        $plan = $router->buildExecutionPlan($route, $testCase['planOptions']);
        $venue = new OrderRouterStubVenue('stub');
        if (count($testCase['fee']) > 0) {
            $venue->feeToCharge = $testCase['fee'];
        }
        $venue->tradeFeesToCharge = $testCase['tradeFees'];
        $report = $router->execute($plan, array('stub' => $venue), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
        $step = $report['steps'][0];
        $expected = $testCase['expected'];
        $where = 'feeNettingCase ' . $testCase['id'];
        order_router_assert(order_router_numbers_match($step['filledAmount'], $expected['filledAmount']), $where . ': filledAmount ' . order_router_number_text($step['filledAmount']));
        order_router_assert(order_router_numbers_match($router->numberAt($step, 'grossOutAmount', 0), $expected['grossOutAmount']), $where . ': grossOutAmount ' . order_router_number_text($router->numberAt($step, 'grossOutAmount', 0)));
        order_router_assert(order_router_numbers_match($step['outAmount'], $expected['outAmount']), $where . ': outAmount ' . order_router_number_text($step['outAmount']));
        order_router_assert(order_router_numbers_match($step['feeCost'], $expected['feeCost']), $where . ': feeCost ' . order_router_number_text($step['feeCost']));
    }
}

function order_router_test_fixture_build_unwind_plan($router) {
    $fixture = order_router_fixture();
    $cases = $fixture['unwindCases'];
    order_router_assert(count($cases) > 0, 'the fixture has unwind cases');
    for ($i = 0; $i < count($cases); $i++) {
        $testCase = $cases[$i];
        $report = $fixture['reports'][$testCase['report']];
        $unwind = $router->buildUnwindPlan($report);
        order_router_assert_matches($unwind, $testCase['expected'], 'unwindCase ' . $testCase['id']);
    }
}

//  ---------------------------------------------------------------------------
//  2. invariants, asserted directly rather than through the fixture
//  ---------------------------------------------------------------------------

function order_router_test_constructor_cap($router) {
    order_router_assert_throws(function () {
        new OrderRouter(array());
    }, ArgumentsRequired::class, 'an apiKey is required');
    //  No ceiling. A caller trading thousands is using this correctly, and the class
    //  does not get to decide otherwise — the old hard 25 USD limit came from this
    //  repository's own live-test safety rule, which is not a rule about anyone's money.
    $large = new OrderRouter(array('apiKey' => 'k', 'maxNotionalUsd' => 250000));
    order_router_assert($large->maxNotionalUsd === 250000, 'honoured exactly, not clamped');
    $small = new OrderRouter(array('apiKey' => 'k', 'maxNotionalUsd' => 0.05));
    order_router_assert($small->maxNotionalUsd === 0.05, 'cents are a legitimate trade size');
    //  The default is NO cap.
    $standard = new OrderRouter(array('apiKey' => 'k'));
    order_router_assert($standard->maxNotionalUsd === OrderRouter::NO_CAP, 'the default is no cap');
    order_router_assert(OrderRouter::NO_CAP === 0, 'and no cap is spelled 0');
    //  0 is the explicit spelling of "no cap"; negative is a typo, and silently
    //  ignoring it would leave the caller believing a guardrail is in place.
    $explicit = new OrderRouter(array('apiKey' => 'k', 'maxNotionalUsd' => 0));
    order_router_assert($explicit->maxNotionalUsd === 0, '0 is the explicit spelling of no cap');
    order_router_assert_throws(function () {
        new OrderRouter(array('apiKey' => 'k', 'maxNotionalUsd' => -1));
    }, BadRequest::class, 'a negative cap is a typo, not a policy');
}

function order_router_test_hand_built_plan_is_executable($router) {
    //  The manual documents limitPrice and notionalQuote as OPTIONAL, and its own worked example
    //  omits both. Read as 0 they broke the "execute your own plans" path three ways at once: a
    //  blocking cost_below_minimum (0 < any minimum cost), a blocking price_out_of_range (0 <
    //  minPrice), and — before any strategy branch, so on every strategy — a rounded_to_zero when
    //  placeStep snapped a price of 0. The documented example could not place a single order.
    $plan = array(
        'requestId' => 'hand-built-0001',
        'calculatedAt' => 1700000000000,
        'steps' => array(
            array(
                'exchangeId' => 'stub',
                'symbol' => 'BTC/USDT',
                'side' => 'buy',
                'amount' => 1,
                'base' => 'BTC',
                'quote' => 'USDT',
                'hopIndex' => 0,
                'expectedPrice' => 100,
            ),
        ),
    );
    $violations = $router->checkExecutionPlanSafety($plan, order_router_bounded_markets(), array('usdRates' => array('USDT' => 1)));
    $blocking = array();
    for ($i = 0; $i < count($violations); $i++) {
        if ($violations[$i]['blocking']) {
            $blocking[] = $violations[$i]['code'];
        }
    }
    order_router_assert(count($blocking) === 0, 'the manual\'s own minimal plan must not be refused: ' . implode(', ', $blocking));
}

function order_router_test_derived_limit_price_and_notional($router) {
    $step = array('amount' => 2, 'expectedPrice' => 100);
    order_router_assert(order_router_numbers_match($router->stepLimitPrice($step), 100), 'no limitPrice falls back to expectedPrice');
    order_router_assert(order_router_numbers_match($router->stepNotionalQuote($step), 200), 'no notionalQuote is amount * expectedPrice');
    //  An explicit value always wins, including one tighter than the expected price.
    $explicit = array('amount' => 2, 'expectedPrice' => 100, 'limitPrice' => 99, 'notionalQuote' => 1);
    order_router_assert(order_router_numbers_match($router->stepLimitPrice($explicit), 99), 'an explicit limitPrice wins');
    order_router_assert(order_router_numbers_match($router->stepNotionalQuote($explicit), 1), 'an explicit notionalQuote wins');
}

function order_router_test_limit_price_side($router) {
    $buy = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 1, 100), array('slippageBps' => 100));
    order_router_assert($buy['steps'][0]['limitPrice'] === 101.0, 'a buy pays up to 1% more');
    $sell = $router->buildExecutionPlan(order_router_one_leg_route('sell', 'BTC', 'USDT', 1, 100), array('slippageBps' => 100));
    order_router_assert($sell['steps'][0]['limitPrice'] === 99.0, 'a sell accepts down to 1% less');
    $none = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 1, 100), array('slippageBps' => 0));
    order_router_assert(order_router_numbers_match($none['steps'][0]['limitPrice'], 100), 'zero slippage means the expected price');
}

function order_router_test_notional_cap($router) {
    $markets = order_router_permissive_markets();
    $capped = array('usdRates' => array('USDT' => 1), 'maxNotionalUsd' => 25);
    //  amount * limitPrice is what is measured, so a 1% slippage on a 24.90 USD
    //  step is what carries it over the line
    $under = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.24, 100), array('slippageBps' => 0));
    order_router_assert(count($router->checkExecutionPlanSafety($under, $markets, $capped)) === 0, '24 USD passes a 25 USD cap');
    $at = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.25, 100), array('slippageBps' => 0));
    order_router_assert(count($router->checkExecutionPlanSafety($at, $markets, $capped)) === 0, 'exactly at the cap passes');
    $over = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2501, 100), array('slippageBps' => 0));
    $overViolations = $router->checkExecutionPlanSafety($over, $markets, $capped);
    order_router_assert(count($overViolations) === 1, 'one violation above the cap');
    order_router_assert($overViolations[0]['code'] === 'notional_exceeds_cap', 'the code names the cap');
    order_router_assert($overViolations[0]['blocking'] === true, 'the cap blocks');
    //  the slippage is inside the measurement, not outside it
    $slipped = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.249, 100), array('slippageBps' => 100));
    $slippedViolations = $router->checkExecutionPlanSafety($slipped, $markets, $capped);
    order_router_assert(count($slippedViolations) === 1, '24.90 USD at 1% slippage is 25.15 USD of risk');
    order_router_assert($slippedViolations[0]['code'] === 'notional_exceeds_cap', 'the slipped step exceeds the cap');
    //  A LARGE cap is honoured just as exactly. This is the case the old hard ceiling
    //  made unreachable: 2,000 USD of BTC under a 5,000 USD guardrail is a normal trade.
    $large = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 20, 100), array('slippageBps' => 0));
    order_router_assert(count($router->checkExecutionPlanSafety($large, $markets, array('usdRates' => array('USDT' => 1), 'maxNotionalUsd' => 5000))) === 0, '2,000 USD under a 5,000 USD cap');
    $overLarge = $router->checkExecutionPlanSafety($large, $markets, array('usdRates' => array('USDT' => 1), 'maxNotionalUsd' => 1000));
    order_router_assert($overLarge[0]['code'] === 'notional_exceeds_cap', 'and the same 2,000 USD trips a 1,000 USD cap');
}

function order_router_test_no_cap_means_no_check($router) {
    //  The default. This class does not decide how much of your money you may trade —
    //  the guardrail is opt-in, so a plan of any size passes untouched, and a caller who
    //  never asked for a cap is not made to supply usdRates for it.
    $markets = order_router_permissive_markets();
    $large = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 1000, 100), array('slippageBps' => 0));
    order_router_assert(count($router->checkExecutionPlanSafety($large, $markets, array('usdRates' => array('USDT' => 1)))) === 0, '100,000 USD passes when no cap is set');
    order_router_assert(count($router->checkExecutionPlanSafety($large, $markets, array())) === 0, 'and needs no usdRates at all');
}

function order_router_test_unvaluable_blocks($router) {
    $markets = order_router_permissive_markets();
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.0001, 100), array('slippageBps' => 0));
    //  0.01 USDT of notional: trivially under the cap, and still refused, because the
    //  point is that the cap the caller ASKED FOR could not be evaluated. With no cap
    //  set there is nothing to enforce and this same plan passes — see the test above.
    $violations = $router->checkExecutionPlanSafety($plan, $markets, array('usdRates' => array(), 'maxNotionalUsd' => 25));
    order_router_assert(count($violations) === 1, 'one violation');
    order_router_assert($violations[0]['code'] === 'notional_unvaluable', 'the step cannot be valued');
    order_router_assert($violations[0]['blocking'] === true, 'an unvaluable step must block, or the cap is decorative');
    //  unrelated rates do not help
    $stillBlocked = $router->checkExecutionPlanSafety($plan, $markets, array('usdRates' => array('ETH' => 3000, 'DOGE' => 0.09), 'maxNotionalUsd' => 25));
    order_router_assert($stillBlocked[0]['code'] === 'notional_unvaluable', 'unrelated rates do not rescue it');
    //  either side of the market resolves it
    order_router_assert(count($router->checkExecutionPlanSafety($plan, $markets, array('usdRates' => array('USDT' => 1), 'maxNotionalUsd' => 25))) === 0, 'the quote rate values it');
    order_router_assert(count($router->checkExecutionPlanSafety($plan, $markets, array('usdRates' => array('BTC' => 100), 'maxNotionalUsd' => 25))) === 0, 'the base rate values it');
}

function order_router_test_usdt_is_not_a_dollar($router) {
    $markets = order_router_permissive_markets();
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.1, 100), array('slippageBps' => 0));
    $violations = $router->checkExecutionPlanSafety($plan, $markets, array('usdRates' => array('USD' => 1), 'maxNotionalUsd' => 25));
    order_router_assert(count($violations) === 1, 'USDT is not USD');
    order_router_assert($violations[0]['code'] === 'notional_unvaluable', 'a stablecoin peg is an observation, not a definition');
    //  a depegged rate is respected: 10 USDT at 0.40 is 4 USD
    $depegged = $router->checkExecutionPlanSafety($plan, $markets, array('usdRates' => array('USDT' => 0.4), 'maxNotionalUsd' => 25));
    order_router_assert(count($depegged) === 0, 'a depegged rate is respected');
}

function order_router_test_empty_plan_is_not_safe($router) {
    $fixture = order_router_fixture();
    $plan = $router->buildExecutionPlan($fixture['routes']['unroutable'], array());
    order_router_assert(count($plan['steps']) === 0, 'an unroutable route has no steps');
    $violations = $router->checkExecutionPlanSafety($plan, order_router_permissive_markets(), array('usdRates' => array('USDT' => 1)));
    order_router_assert(count($violations) === 1, 'one violation');
    order_router_assert($violations[0]['code'] === 'empty_plan', 'the plan is empty');
    order_router_assert($violations[0]['blocking'] === true, 'zero violations on zero steps would read as approval');
}

function order_router_test_reconcile_never_scales_up($router) {
    $fixture = order_router_fixture();
    $plan = $router->buildExecutionPlan($fixture['routes']['multiHop'], array());
    $overfilled = $router->reconcileExecutionStep($plan, 0, 1000000);
    //  1 exactly, compared numerically: PHP distinguishes int 1 from float 1.0
    //  and the fixture's comparison rule is numeric, never textual
    order_router_assert(order_router_numbers_match(floatval($overfilled['scale']), 1), 'an overfill must not grow an order the safety check never saw');
    order_router_assert($overfilled['verdict'] === 'proceed', 'an overfill proceeds');
    $downstream = $overfilled['resizedSteps'][0];
    order_router_assert(order_router_numbers_match(floatval($downstream['amount']), floatval($downstream['previousAmount'])), 'the downstream order is untouched');
}

function order_router_test_reconcile_halts($router) {
    $fixture = order_router_fixture();
    $plan = $router->buildExecutionPlan($fixture['routes']['multiHop'], array());
    $nothing = $router->reconcileExecutionStep($plan, 0, 0);
    order_router_assert($nothing['verdict'] === 'halt', 'a total miss halts');
    order_router_assert($nothing['reason'] === 'nothing_filled', 'and says why');
    //  expectedOut of step 0 is 500 * 0.089 = 44.5; 2% of that is 0.89
    order_router_assert($router->reconcileExecutionStep($plan, 0, 44.5 - 0.88)['verdict'] === 'proceed', 'a shortfall inside the tolerance proceeds');
    $over = $router->reconcileExecutionStep($plan, 0, 44.5 - 0.9);
    order_router_assert($over['verdict'] === 'halt', 'a shortfall past the tolerance halts');
    order_router_assert($over['reason'] === 'shortfall_exceeds_tolerance', 'and says why');
    order_router_assert_throws(function () use ($router, $plan) {
        $router->reconcileExecutionStep($plan, 7, 1);
    }, BadRequest::class, 'an out-of-range stepIndex is refused');
}

function order_router_test_unwind_is_never_automatic($router) {
    $fixture = order_router_fixture();
    $unwind = $router->buildUnwindPlan($fixture['reports']['haltedCrossVenue']);
    order_router_assert($unwind['requiresConfirmation'] === true, 'an unwind needs confirmation');
    order_router_assert($unwind['automatic'] === false, 'an unwind is never automatic');
    order_router_assert($unwind['residualCount'] === 2, 'the mexc USDT and the binance SOL are separate positions');
    //  the USDT sold on mexc and the USDT spent on binance are NOT the same
    //  money, because this class never moves funds between venues
    order_router_assert($unwind['steps'][0]['exchangeId'] === 'binance', 'unwound in reverse execution order');
    order_router_assert($unwind['steps'][1]['exchangeId'] === 'mexc', 'unwound in reverse execution order');
    order_router_assert($unwind['steps'][1]['side'] === 'buy', 'leftover quote is spent buying the asset back');
    order_router_assert($unwind['steps'][1]['reachesFrom'] === true, 'buying DOGE back gets you home');
    order_router_assert($unwind['steps'][0]['side'] === 'sell', 'leftover base is sold back');
    order_router_assert($unwind['steps'][0]['reachesFrom'] === false, 'selling SOL for USDT is not yet DOGE');
}

function order_router_test_unwind_buy_is_fundable($router) {
    //  The residual IS the budget. Sizing the buy at the expected price and then
    //  pricing it slippage above that orders more quote than the venue is holding:
    //  44.5 USDT at 0.089 is 500 DOGE, but 500 DOGE at the 0.0892225 limit costs
    //  44.61125 - the venue rejects it for insufficient funds, or partially fills
    //  and leaves the rest of the stranded money stranded on a halted route.
    $fixture = order_router_fixture();
    $unwind = $router->buildUnwindPlan($fixture['reports']['haltedCrossVenue']);
    $buy = $unwind['steps'][1];
    order_router_assert($buy['side'] === 'buy', 'the mexc leg is the buy');
    $residual = 44.5;
    $spend = $buy['amount'] * $buy['limitPrice'];
    order_router_assert($spend <= $residual + 1e-9, 'the buy spends no more than the residual holds');
    //  and it does not leave the residual pointlessly unspent either
    order_router_assert($spend >= $residual - 1e-9, 'the buy spends the whole residual');
    //  the notional the safety cap sees must be that same real spend
    order_router_assert(order_router_numbers_match($buy['notionalQuote'], $spend), 'notionalQuote is priced at the limit the order is placed at');
    //  the sell side is sized on the residual itself - there is no budget to run out of
    $sell = $unwind['steps'][0];
    order_router_assert($sell['side'] === 'sell', 'the binance leg is the sell');
    order_router_assert(order_router_numbers_match($sell['amount'], 0.2), 'the whole 0.2 SOL residual is sold');
    order_router_assert(order_router_numbers_match($sell['notionalQuote'], 0.2 * $sell['limitPrice']), 'the sell notional is priced at its limit too');
}

//  ---------------------------------------------------------------------------
//  3. execute — stub venues only, and not one real order anywhere
//  ---------------------------------------------------------------------------

function order_router_test_dry_run_is_the_default($router) {
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $venue = new OrderRouterStubVenue('stub');
    //  everything a real call would carry, EXCEPT live
    $report = $router->execute($plan, array('stub' => $venue), array(
        'strategy' => 'sequential',
        'usdRates' => array('USDT' => 1),
        'allowMarketOrders' => true,
    ));
    order_router_assert($report['dryRun'] === true, 'dry run by default');
    order_router_assert($report['strategy'] === 'dry_run', 'the strategy in force is dry_run');
    order_router_assert($report['requestedStrategy'] === 'sequential', 'the report says what was asked for as well as what happened');
    order_router_assert($report['ordersPlaced'] === 0, 'nothing was placed');
    order_router_assert($report['wouldPlaceOrders'] === 1, 'one order would have been placed');
    order_router_assert($report['steps'][0]['status'] === 'planned', 'the step is still only planned');
    order_router_assert(count($venue->calls) === 0, 'not one call reached the venue — not even a read');
    //  live: false, absent, 'true' and 1 are all not-true
    $notLiveValues = array(false, null, 'true', 1);
    for ($i = 0; $i < count($notLiveValues); $i++) {
        $other = new OrderRouterStubVenue('stub');
        $again = $router->execute($plan, array('stub' => $other), array('strategy' => 'sequential', 'live' => $notLiveValues[$i], 'usdRates' => array('USDT' => 1)));
        order_router_assert($again['dryRun'] === true, 'live must be exactly true');
        order_router_assert(count($other->calls) === 0, 'no call reached the venue');
    }
}

function order_router_test_execute_refuses_unvaluable($router) {
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $venue = new OrderRouterStubVenue('stub');
    order_router_assert_throws(function () use ($router, $plan, $venue) {
        $router->execute($plan, array('stub' => $venue), array('strategy' => 'sequential', 'live' => true, 'maxNotionalUsd' => 25));
    }, ExchangeError::class, 'a live run under a cap it cannot evaluate is refused');
    for ($i = 0; $i < count($venue->calls); $i++) {
        order_router_assert(strpos($venue->calls[$i], 'createOrder') === false, 'no order was placed');
    }
    //  and with NO cap asked for, usdRates is not required: there is no cap to evaluate,
    //  so demanding the inputs for one would be asking for something nobody wanted.
    $uncapped = new OrderRouterStubVenue('stub');
    $report = $router->execute($plan, array('stub' => $uncapped), array('strategy' => 'sequential', 'live' => true));
    order_router_assert($report['steps'][0]['status'] === 'filled', 'no cap asked for, no usdRates needed');
}

function order_router_test_execute_refuses_above_cap($router) {
    //  500 USD against a 25 USD guardrail. The refusal happens BEFORE any order goes
    //  out, which is the property worth asserting — a cap checked after the fact is
    //  an incident report, not a guardrail.
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 5, 100), array());
    $venue = new OrderRouterStubVenue('stub');
    order_router_assert_throws(function () use ($router, $plan, $venue) {
        $router->execute($plan, array('stub' => $venue), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'maxNotionalUsd' => 25));
    }, ExchangeError::class, 'a 500 USD step is refused');
    for ($i = 0; $i < count($venue->calls); $i++) {
        order_router_assert(strpos($venue->calls[$i], 'createOrder') === false, 'no order was placed');
    }
    //  the same 500 USD trade with no cap set goes through: that is the point of the
    //  guardrail being opt-in
    $uncapped = new OrderRouterStubVenue('stub');
    $report = $router->execute($plan, array('stub' => $uncapped), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    order_router_assert($report['steps'][0]['status'] === 'filled', '500 USD is a normal trade when nobody asked for a cap');
}

function order_router_test_sequential_places_ioc($router) {
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array('slippageBps' => 100));
    $venue = new OrderRouterStubVenue('stub');
    $report = $router->execute($plan, array('stub' => $venue), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    order_router_assert($report['dryRun'] === false, 'a live run is not a dry run');
    order_router_assert($report['ordersPlaced'] === 1, 'one order placed');
    order_router_assert($report['steps'][0]['status'] === 'filled', 'the step filled');
    order_router_assert($report['steps'][0]['outAsset'] === 'BTC', 'a buy produces the base');
    order_router_assert(order_router_numbers_match($report['steps'][0]['outAmount'], 0.2), 'it produced the whole amount');
    order_router_assert($report['steps'][0]['inAsset'] === 'USDT', 'a buy spends the quote');
    order_router_assert($venue->calls === array('createOrder:limit:buy:0.2'), 'one IOC limit order, in plan order');
    order_router_assert($report['halted'] === false, 'nothing halted');
}

function order_router_test_sequential_obeys_halt($router) {
    $plan = $router->buildExecutionPlan(order_router_two_hop_route(), array());
    //  hop 0 fills half: a 50% shortfall against a 2% tolerance
    $venue = new OrderRouterStubVenue('stub', 0.5);
    $report = $router->execute($plan, array('stub' => $venue), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    order_router_assert($report['halted'] === true, 'the route halted');
    order_router_assert($report['haltReason'] === 'shortfall_exceeds_tolerance', 'and says why');
    order_router_assert($report['haltStepIndex'] === 0, 'at the first step');
    order_router_assert($report['ordersPlaced'] === 1, 'the second hop was never attempted');
    order_router_assert($report['steps'][1]['status'] === 'skipped', 'the second step was skipped');
    order_router_assert(count($venue->calls) === 1, 'exactly one venue call');
    //  and the halted report is exactly what buildUnwindPlan is for
    $unwind = $router->buildUnwindPlan($report);
    order_router_assert($unwind['residualCount'] === 1, 'one residual');
    order_router_assert($unwind['steps'][0]['side'] === 'sell', 'the BTC bought on hop 0 goes back to USDT');
    order_router_assert($unwind['steps'][0]['reachesFrom'] === true, 'selling it reaches the from-asset');
}

function order_router_test_market_orders_need_both($router) {
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    //  a venue that advertises GTC only
    $noIoc = new OrderRouterStubVenue('stub');
    $noIoc->features = array('spot' => array('createOrder' => array('timeInForce' => array('GTC'))));
    $refused = $router->execute($plan, array('stub' => $noIoc), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    order_router_assert($refused['steps'][0]['status'] === 'failed', 'the step failed rather than falling back');
    order_router_assert($refused['steps'][0]['errorCode'] === 'NotSupported', 'and names the refusal');
    order_router_assert(count($noIoc->calls) === 0, 'defaulting to a market order is the decision the caller did not delegate');
    $allowed = new OrderRouterStubVenue('stub');
    $allowed->features = array('spot' => array('createOrder' => array('timeInForce' => array('GTC'))));
    $placed = $router->execute($plan, array('stub' => $allowed), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'allowReexecution' => true, 'allowMarketOrders' => true));
    order_router_assert($placed['steps'][0]['status'] === 'filled', 'with the opt-in the market order goes out');
    order_router_assert($allowed->calls === array('createOrder:market:buy:0.2'), 'and it is a market order');
    //  ...but not under a cap. assertUnderCap values the order at the plan's LIMIT price and the
    //  market call sends no price at all, so passing the check and then removing the price it was
    //  computed from is a cap that silently disappears. The two options are refused together.
    $capped = new OrderRouterStubVenue('stub');
    $capped->features = array('spot' => array('createOrder' => array('timeInForce' => array('GTC'))));
    $underCap = $router->execute($plan, array('stub' => $capped), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'allowReexecution' => true, 'allowMarketOrders' => true, 'maxNotionalUsd' => 1000));
    order_router_assert($underCap['steps'][0]['status'] === 'failed', 'a market order under a cap is refused');
    order_router_assert($underCap['steps'][0]['errorCode'] === 'NotSupported', 'and names the refusal');
    order_router_assert(count($capped->calls) === 0, 'refused BEFORE dispatch: a cap checked against a price that is then discarded is worse than no cap');
    //  a venue that says nothing about timeInForce is assumed to do IOC: a
    //  rejected IOC is loud and cheap, an unintended market order is not
    $unknown = new OrderRouterStubVenue('stub');
    $unknown->features = array();
    $assumed = $router->execute($plan, array('stub' => $unknown), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'allowReexecution' => true));
    order_router_assert($assumed['steps'][0]['status'] === 'filled', 'an unknown venue is assumed to do IOC');
    order_router_assert($unknown->calls === array('createOrder:limit:buy:0.2'), 'and gets a limit order');
}

function order_router_test_parallel_contains_a_failing_leg($router) {
    $route = order_router_one_leg_route('buy', 'BTC', 'USDT', 0.1, 100);
    $route['hops'][0]['legs'] = array(
        array('exchangeId' => 'good', 'amount' => 0.1, 'averagePrice' => 100, 'effectivePrice' => 100),
        array('exchangeId' => 'bad', 'amount' => 0.1, 'averagePrice' => 100, 'effectivePrice' => 100),
        array('exchangeId' => 'good2', 'amount' => 0.1, 'averagePrice' => 100, 'effectivePrice' => 100),
    );
    $plan = $router->buildExecutionPlan($route, array());
    $good = new OrderRouterStubVenue('good');
    $bad = new OrderRouterStubVenue('bad', 1, true);
    $good2 = new OrderRouterStubVenue('good2');
    $report = $router->execute($plan, array('good' => $good, 'bad' => $bad, 'good2' => $good2), array('strategy' => 'parallel_within_hop', 'live' => true, 'usdRates' => array('USDT' => 1)));
    order_router_assert($report['steps'][0]['status'] === 'filled', 'the first leg filled');
    order_router_assert($report['steps'][1]['status'] === 'failed', 'the second leg failed');
    order_router_assert($report['steps'][2]['status'] === 'filled', 'the sibling behind the failure still ran');
    order_router_assert(count($report['errors']) === 1, 'one error recorded');
    order_router_assert($report['errors'][0]['exchangeId'] === 'bad', 'and it names the venue');
    order_router_assert($report['halted'] === true, 'a failed leg still halts the route after the hop settles');
    order_router_assert($report['haltReason'] === 'order_failed', 'and says why');
}

function order_router_test_best_effort_refuses_multi_hop($router) {
    $multiHop = $router->buildExecutionPlan(order_router_two_hop_route(), array());
    $venue = new OrderRouterStubVenue('stub');
    order_router_assert_throws(function () use ($router, $multiHop, $venue) {
        $router->execute($multiHop, array('stub' => $venue), array('strategy' => 'best_effort', 'live' => true, 'usdRates' => array('USDT' => 1), 'acknowledgeDispersion' => true, 'maxOrders' => 5));
    }, NotSupported::class, 'best_effort refuses multi-hop');
    $singleHop = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    order_router_assert_throws(function () use ($router, $singleHop, $venue) {
        $router->execute($singleHop, array('stub' => $venue), array('strategy' => 'best_effort', 'live' => true, 'usdRates' => array('USDT' => 1), 'maxOrders' => 5));
    }, BadRequest::class, 'best_effort demands acknowledgeDispersion');
    order_router_assert_throws(function () use ($router, $singleHop, $venue) {
        $router->execute($singleHop, array('stub' => $venue), array('strategy' => 'best_effort', 'live' => true, 'usdRates' => array('USDT' => 1), 'acknowledgeDispersion' => true));
    }, BadRequest::class, 'best_effort demands maxOrders');
    order_router_assert(count($venue->calls) === 0, 'nothing reached the venue');
}

function order_router_test_best_effort_stops_at_max_orders($router) {
    $route = order_router_one_leg_route('buy', 'BTC', 'USDT', 0.1, 100);
    $route['hops'][0]['legs'] = array(
        array('exchangeId' => 'a', 'amount' => 0.1, 'averagePrice' => 100, 'effectivePrice' => 100),
        array('exchangeId' => 'b', 'amount' => 0.1, 'averagePrice' => 100, 'effectivePrice' => 100),
        array('exchangeId' => 'c', 'amount' => 0.1, 'averagePrice' => 100, 'effectivePrice' => 100),
    );
    $plan = $router->buildExecutionPlan($route, array());
    $venues = array('a' => new OrderRouterStubVenue('a'), 'b' => new OrderRouterStubVenue('b', 0.01), 'c' => new OrderRouterStubVenue('c'));
    $report = $router->execute($plan, $venues, array('strategy' => 'best_effort', 'live' => true, 'usdRates' => array('USDT' => 1), 'acknowledgeDispersion' => true, 'maxOrders' => 2));
    order_router_assert($report['ordersPlaced'] === 2, 'two orders placed');
    order_router_assert($report['steps'][2]['status'] === 'skipped', 'the third was skipped');
    order_router_assert($report['steps'][2]['errorCode'] === 'max_orders_reached', 'and says why');
    order_router_assert($report['halted'] === false, 'a 1% fill on leg b does not stop best_effort — that is the whole strategy');
    order_router_assert(count($venues['c']->calls) === 0, 'the third venue was never called');
}

class OrderRouterPinnedClock extends OrderRouter {
    //  The only clock the class reads, pinned so a plan's age is deterministic.
    public $pinnedNowMs = 0;
    public function nowMs() {
        return $this->pinnedNowMs;
    }
}

function order_router_test_unknown_strategy_is_refused($router) {
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    order_router_assert_throws(function () use ($router, $plan) {
        $router->execute($plan, array(), array('strategy' => 'yolo'));
    }, BadRequest::class, 'an unknown strategy is refused even in dry run');
}

function order_router_test_plan_age_is_reported_and_refused_only_when_asked($router) {
    //  A plan is a snapshot of a book. `calculatedAt` was carried on every plan and read by
    //  nothing, so execute() would happily trade an hour-old plan at hour-old prices — and the
    //  notional cap, computed from those same prices, was just as stale.
    $route = order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100);
    $route['calculatedAt'] = 1000000;
    $plan = $router->buildExecutionPlan($route, array());
    $pinned = new OrderRouterPinnedClock(array('apiKey' => 'k'));
    $pinned->pinnedNowMs = 1060000;   //  the plan is exactly 60s old
    $opts = array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'allowReexecution' => true);

    //  Always reported, even with nothing enforced, and nothing is refused by default.
    $report = $pinned->execute($plan, array('stub' => new OrderRouterStubVenue('stub')), $opts);
    order_router_assert($report['planAgeMs'] === 60000.0 || $report['planAgeMs'] === 60000, 'the age is on the report whether or not it is checked');
    order_router_assert($report['steps'][0]['status'] === 'filled', 'and nothing is refused by default');

    //  Enforced exactly, at whatever value is asked for.
    $strict = new OrderRouterStubVenue('stub');
    order_router_assert_throws(function () use ($pinned, $plan, $strict, $opts) {
        $pinned->execute($plan, array('stub' => $strict), array_merge($opts, array('maxPlanAgeMs' => 30000)));
    }, ExchangeError::class, 'a stale plan is refused under a limit');
    order_router_assert(count($strict->calls) === 0, 'refused before anything reached the venue');
    $passed = $pinned->execute($plan, array('stub' => new OrderRouterStubVenue('stub')), array_merge($opts, array('maxPlanAgeMs' => 120000)));
    order_router_assert($passed['steps'][0]['status'] === 'filled', 'a limit the plan is inside of lets it through');

    //  An age that cannot be determined BLOCKS under an active limit.
    $undated = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $undatedReport = $pinned->execute($undated, array('stub' => new OrderRouterStubVenue('stub')), $opts);
    order_router_assert($undatedReport['planAgeMs'] === -1 || $undatedReport['planAgeMs'] === -1.0, 'unknown is -1, never 0: 0 would read as fresh');
    order_router_assert_throws(function () use ($pinned, $undated, $opts) {
        $pinned->execute($undated, array('stub' => new OrderRouterStubVenue('stub')), array_merge($opts, array('maxPlanAgeMs' => 30000)));
    }, ExchangeError::class, 'an undatable plan is refused under a limit');
}

function order_router_test_atomic_ish_demands_prefunding($router) {
    $plan = $router->buildExecutionPlan(order_router_two_hop_route(), array());
    //  hop 0 needs 20 USDT and hop 1 needs 0.2 BTC, both already sitting there
    $rich = new OrderRouterStubVenue('stub');
    $report = $router->execute($plan, array('stub' => $rich), array('strategy' => 'atomic_ish', 'live' => true, 'usdRates' => array('USDT' => 1)));
    order_router_assert($report['ordersPlaced'] === 2, 'a pre-funded route runs end to end');
    $broke = new OrderRouterStubVenue('stub');
    $broke->balance = array('free' => array('USDT' => 1, 'BTC' => 0));
    order_router_assert_throws(function () use ($router, $plan, $broke) {
        $router->execute($plan, array('stub' => $broke), array('strategy' => 'atomic_ish', 'live' => true, 'usdRates' => array('USDT' => 1)));
    }, ExchangeError::class, 'an underfunded route is refused');
}

//  ---------------------------------------------------------------------------
//  4. fetchRoute request shaping and fetchRouteWithBalances, with the HTTP
//     layer stubbed out — no network
//  ---------------------------------------------------------------------------

function order_router_test_fetch_route_refuses_ambiguous_amounts($router) {
    $recorder = new OrderRouterRecorder(array('apiKey' => 'k'), array());
    order_router_assert_throws(function () use ($recorder) {
        $recorder->fetchRoute('USDT', 'BTC', array());
    }, BadRequest::class, 'neither amount is refused');
    order_router_assert_throws(function () use ($recorder) {
        $recorder->fetchRoute('USDT', 'BTC', array('amountIn' => 1, 'amountOut' => 1));
    }, BadRequest::class, 'both amounts are refused');
    order_router_assert($recorder->lastUrl === '', 'neither reached the wire');
}

function order_router_test_fetch_route_query($router) {
    $recorder = new OrderRouterRecorder(array('apiKey' => 'k', 'baseUrl' => 'https://example.test/api/'), array('hops' => array()));
    $recorder->fetchRoute('usdt', 'btc', array('amountIn' => 0.001, 'strategy' => 'split_capped', 'maxVenues' => 3, 'exchanges' => array('binance', 'kraken'), 'certified' => true));
    order_router_assert($recorder->lastUrl === 'https://example.test/api/route?from=USDT&to=BTC&amountIn=0.001&strategy=split_capped&maxVenues=3&exchanges=binance%2Ckraken&certified=true', 'the query is deterministic, got ' . $recorder->lastUrl);
}

function order_router_test_fetch_route_with_balances($router) {
    $recorder = new OrderRouterRecorder(array('apiKey' => 'k'), array('hops' => array(), 'balancesApplied' => 'stub.BTC:1,stub.USDT:1000'));
    $route = $recorder->fetchRouteWithBalances('USDT', 'BTC', array('stub' => new OrderRouterStubVenue('stub')), array('amountIn' => 10));
    order_router_assert($route['balancesUsed'] === 'stub.USDT:1000,stub.BTC:1', 'largest first, and the ZERO holding is gone, got ' . $route['balancesUsed']);
    order_router_assert(count($route['balancesDropped']) === 0, 'nothing was dropped');
    order_router_assert(strpos($recorder->lastUrl, 'balances=stub.USDT%3A1000%2Cstub.BTC%3A1') !== false, 'the balances reached the query');
}

function order_router_test_fetch_route_with_balances_requires_echo($router) {
    $silent = new OrderRouterRecorder(array('apiKey' => 'k'), array('hops' => array()));
    order_router_assert_throws(function () use ($silent) {
        $silent->fetchRouteWithBalances('USDT', 'BTC', array('stub' => new OrderRouterStubVenue('stub')), array('amountIn' => 10));
    }, ExchangeError::class, 'a route computed against ignored balances is refused');
    //  and the caller can opt out with their eyes open
    $opted = new OrderRouterRecorder(array('apiKey' => 'k'), array('hops' => array()));
    $route = $opted->fetchRouteWithBalances('USDT', 'BTC', array('stub' => new OrderRouterStubVenue('stub')), array('amountIn' => 10, 'requireBalancesApplied' => false));
    order_router_assert($route['balancesUsed'] === 'stub.USDT:1000,stub.BTC:1', 'the opt-out still reports what it sent');
}

function order_router_test_fetch_route_with_balances_entry_cap($router) {
    $recorder = new OrderRouterRecorder(array('apiKey' => 'k'), array('hops' => array(), 'balancesApplied' => 'x'));
    $many = new OrderRouterStubVenue('stub');
    $free = array();
    for ($i = 0; $i < 70; $i++) {
        $free['C' . $i] = $i + 1;
    }
    $many->balance = array('free' => $free);
    $route = $recorder->fetchRouteWithBalances('USDT', 'BTC', array('stub' => $many), array('amountIn' => 10));
    order_router_assert(count($route['balancesDropped']) === 6, 'six entries were dropped');
    order_router_assert(count(explode(',', $route['balancesUsed'])) === 64, 'sixty-four survived');
    for ($i = 0; $i < count($route['balancesDropped']); $i++) {
        order_router_assert($route['balancesDropped'][$i]['reason'] === 'entry_cap', 'dropped for the entry cap');
        order_router_assert($route['balancesDropped'][$i]['amount'] <= 6, 'the six smallest holdings are the ones that went');
    }
}

function order_router_test_format_number($router) {
    order_router_assert($router->formatNumber(0.0000001) === '0.0000001', 'no exponent for a small number');
    order_router_assert_throws(function () use ($router) {
        $router->formatNumber(1e21);
    }, BadRequest::class, 'refused rather than rendered as 1e+21 in one language and not the others');
    order_router_assert($router->formatNumber(0) === '0', 'zero');
    order_router_assert($router->formatNumber(1000000) === '1000000', 'a round million');
    order_router_assert($router->formatNumber(0.5) === '0.5', 'a half');
    order_router_assert($router->formatNumber(1e-15) === '0', 'below the twelfth decimal is zero');
}

//  ---------------------------------------------------------------------------
//  the runner
//  ---------------------------------------------------------------------------

function order_router_test_per_call_cap_overrides($router) {
    //  The cap is a guardrail the CALLER sets, so the per-call value wins — there is no
    //  ceiling re-imposed behind their back. Both directions are asserted because the
    //  old implementation clamped one way only, and a guardrail that silently refuses to
    //  loosen is as surprising as one that silently refuses to tighten.
    $client = new OrderRouter(array('apiKey' => 'k', 'maxNotionalUsd' => 100));
    $markets = order_router_permissive_markets();
    //  0.005 BTC at 100000 USDT is 500 USD
    $plan = $client->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.005, 100000), array('slippageBps' => 0));
    $underClientCap = $client->checkExecutionPlanSafety($plan, $markets, array('usdRates' => array('USDT' => 1)));
    order_router_assert(count($underClientCap) === 1, '500 USD trips the client cap of 100');
    order_router_assert($underClientCap[0]['code'] === 'notional_exceeds_cap', 'and refused for the right reason');
    order_router_assert(order_router_numbers_match(floatval($underClientCap[0]['limit']), 100), 'the limit reported is the client cap');
    //  raised for this call
    order_router_assert(count($client->checkExecutionPlanSafety($plan, $markets, array('usdRates' => array('USDT' => 1), 'maxNotionalUsd' => 1000))) === 0, 'a per-call cap of 1000 lets it through');
    //  lowered for this call
    $tightened = $client->checkExecutionPlanSafety($plan, $markets, array('usdRates' => array('USDT' => 1), 'maxNotionalUsd' => 10));
    order_router_assert(order_router_numbers_match(floatval($tightened[0]['limit']), 10), 'and a per-call cap of 10 tightens it');
    //  and the last check before an order goes out honours the same value
    order_router_assert_throws(function () use ($client, $plan) {
        $client->assertUnderCap($plan['steps'][0], 0.005, 100000, array('USDT' => 1), array('maxNotionalUsd' => 100));
    }, ExchangeError::class, 'assertUnderCap refuses 500 USD against a cap of 100');
    $client->assertUnderCap($plan['steps'][0], 0.005, 100000, array('USDT' => 1), array('maxNotionalUsd' => 1000));
}

function order_router_test_best_effort_derives_hop_count($router) {
    //  a plan that travelled through JSON, was rebuilt from persisted steps, or
    //  is the tail of a halted route can be missing hopCount entirely
    $complete = $router->buildExecutionPlan(order_router_two_hop_route(), array());
    $withoutHopCount = array();
    foreach ($complete as $key => $value) {
        if ($key !== 'hopCount') {
            $withoutHopCount[$key] = $value;
        }
    }
    order_router_assert(!isset($withoutHopCount['hopCount']), 'the plan really has no hopCount');
    order_router_assert(count($withoutHopCount['steps']) === 2, 'and it really has two hops worth of steps');
    $venue = new OrderRouterStubVenue('stub', 0.1);
    order_router_assert_throws(function () use ($router, $withoutHopCount, $venue) {
        $router->execute($withoutHopCount, array('stub' => $venue), array('strategy' => 'best_effort', 'live' => true, 'usdRates' => array('USDT' => 1), 'acknowledgeDispersion' => true, 'maxOrders' => 5));
    }, NotSupported::class, 'best_effort across a bridge is refused however the plan reached us');
    order_router_assert(count($venue->calls) === 0, 'not one order was placed');
}

function order_router_test_venue_supports_ioc_dictionary($router) {
    $noIoc = new OrderRouterStubVenue('stub');
    //  the shape ccxt actually uses: features.spot.createOrder.timeInForce is a
    //  dictionary, never a list. bit2c, bitbank, bithumb and coinone all say
    //  IOC => false, and reading this as a list answered "yes" for every one.
    $noIoc->features = array('spot' => array('createOrder' => array('timeInForce' => array('IOC' => false, 'FOK' => false, 'PO' => false, 'GTD' => false, 'GTC' => true))));
    order_router_assert($router->venueSupportsIoc($noIoc) === false, 'IOC => false means no');
    $withIoc = new OrderRouterStubVenue('stub');
    $withIoc->features = array('spot' => array('createOrder' => array('timeInForce' => array('IOC' => true, 'FOK' => true, 'PO' => true, 'GTD' => false, 'GTC' => true))));
    order_router_assert($router->venueSupportsIoc($withIoc) === true, 'IOC => true means yes');
    //  a dictionary that enumerates its values and omits IOC has said no
    $silentAboutIoc = new OrderRouterStubVenue('stub');
    $silentAboutIoc->features = array('spot' => array('createOrder' => array('timeInForce' => array('GTC' => true))));
    order_router_assert($router->venueSupportsIoc($silentAboutIoc) === false, 'a list of values without IOC means no');
    //  and a venue that says nothing at all is still assumed to do IOC
    $silent = new OrderRouterStubVenue('stub');
    $silent->features = array();
    order_router_assert($router->venueSupportsIoc($silent) === true, 'silence is still assumed to be yes');
    //  end to end: the documented market-order fallback is reachable again
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $refused = $router->execute($plan, array('stub' => $noIoc), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    order_router_assert($refused['steps'][0]['errorCode'] === 'NotSupported', 'the step refuses rather than sending an IOC');
    order_router_assert(count($noIoc->calls) === 0, 'an IOC was never sent to a venue that cannot do one');
    $allowed = new OrderRouterStubVenue('stub');
    $allowed->features = $noIoc->features;
    $placed = $router->execute($plan, array('stub' => $allowed), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'allowReexecution' => true, 'allowMarketOrders' => true));
    order_router_assert($placed['steps'][0]['status'] === 'filled', 'the opt-in reaches the market order');
    order_router_assert($allowed->calls === array('createOrder:market:buy:0.2'), 'and it is a market order');
}

function order_router_test_limit_protected_refuses_a_zero_poll_interval($router) {
    //  The poll loop advances its clock by pollIntervalMs, so 0 never reaches the timeout: it
    //  spins on fetchOrder forever with a real order resting on a real venue, and the timeout
    //  that exists to cancel that order never arrives. Refused BEFORE createOrder — refusing
    //  afterwards would leave the very order the loop could not clean up.
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), array('slippageBps' => 0));
    foreach (array(0, -1) as $interval) {
        $venue = new OrderRouterStubVenue('stub');
        $venue->createdStatus = 'open';
        order_router_assert_throws(function () use ($router, $plan, $venue, $interval) {
            $router->execute($plan, array('stub' => $venue), array('strategy' => 'limit_protected', 'live' => true, 'usdRates' => array('USDT' => 1), 'orderTimeoutMs' => 4, 'pollIntervalMs' => $interval));
        }, BadRequest::class, 'pollIntervalMs ' . $interval . ' must be refused');
        order_router_assert(count($venue->calls) === 0, 'nothing may reach the venue');
    }
    $ok = new OrderRouterStubVenue('stub');
    $ok->createdStatus = 'open';
    $ok->fetchOrderResults = array(
        array('id' => 'stub-order', 'status' => 'closed', 'filled' => 0.0002, 'average' => 100000, 'cost' => 20),
    );
    $report = $router->execute($plan, array('stub' => $ok), array('strategy' => 'limit_protected', 'live' => true, 'usdRates' => array('USDT' => 1), 'orderTimeoutMs' => 4, 'pollIntervalMs' => 1));
    order_router_assert($report['steps'][0]['status'] === 'filled', 'an ordinary interval still works');
}

function order_router_test_limit_protected_keeps_a_venue_side_cancel_fill($router) {
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), array('slippageBps' => 0));
    $venue = new OrderRouterStubVenue('stub');
    $venue->createdStatus = 'open';
    //  the venue ends the order itself between the last two polls — an expiry, a
    //  self-trade prevention, a post-only rejection of the remainder — and it
    //  carries a real partial fill
    $venue->fetchOrderResults = array(
        array('id' => 'stub-order', 'status' => 'open', 'filled' => 0, 'average' => 0, 'cost' => 0),
        array('id' => 'stub-order', 'status' => 'canceled', 'filled' => 0.0001, 'average' => 100000, 'cost' => 10),
    );
    $venue->cancelThrows = true;
    $report = $router->execute($plan, array('stub' => $venue), array('strategy' => 'limit_protected', 'live' => true, 'usdRates' => array('USDT' => 1), 'orderTimeoutMs' => 2, 'pollIntervalMs' => 1));
    order_router_assert(!in_array('cancelOrder:stub-order', $venue->calls, true), 'an order the venue already closed is not cancelled again');
    order_router_assert($report['steps'][0]['status'] === 'partial', 'the fill is kept');
    order_router_assert(order_router_numbers_match(floatval($report['steps'][0]['filledAmount']), 0.0001), 'and it is the right size');
    order_router_assert(order_router_numbers_match(floatval($report['steps'][0]['outAmount']), 0.0001), 'and it reaches outAmount');
    order_router_assert($report['steps'][0]['orderId'] === 'stub-order', 'and the id is reported');
    order_router_assert(count($report['openOrders']) === 0, 'nothing is open: the venue closed it');
    //  and the 0.0001 BTC that was actually bought reaches the unwind plan
    $unwind = $router->buildUnwindPlan($report);
    order_router_assert($unwind['residualCount'] === 1, 'a real position must never be invisible to the unwind path');
    order_router_assert(order_router_numbers_match(floatval($unwind['steps'][0]['amount']), 0.0001), 'the unwind sells exactly what was bought');
}

function order_router_test_order_id_survives_a_failure_after_create($router) {
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), array('slippageBps' => 0));
    $venue = new OrderRouterStubVenue('stub');
    $venue->createdStatus = 'open';
    //  createOrder succeeded; the first poll never comes back
    $venue->fetchOrderThrows = true;
    $report = $router->execute($plan, array('stub' => $venue), array('strategy' => 'limit_protected', 'live' => true, 'usdRates' => array('USDT' => 1), 'orderTimeoutMs' => 4, 'pollIntervalMs' => 1));
    //  NOT 'failed'. A step whose id is known had createOrder RETURN, so an order exists;
    //  calling that "failed" reads as "nothing happened" while openOrders, three lines down, says
    //  the opposite. One report must not carry both readings.
    order_router_assert($report['steps'][0]['status'] === 'outcome_unknown', 'a known id means an order exists, so the outcome is unknown rather than failed');
    order_router_assert($report['haltReason'] === 'outcome_unknown', 'and the halt names the ambiguity rather than claiming an outright failure');
    order_router_assert($report['steps'][0]['orderId'] === 'stub-order', 'the id is captured the instant createOrder returns, not after the read');
    order_router_assert(count($report['openOrders']) === 1, 'a live order the caller cannot see is the worst outcome there is');
    order_router_assert($report['openOrders'][0]['orderId'] === 'stub-order', 'and it names the order');
    order_router_assert($report['openOrders'][0]['exchangeId'] === 'stub', 'and the venue it is on');
    order_router_assert($report['openOrders'][0]['reason'] === 'outcome_unknown', 'and why it may still be live');
    //  the same holds for an immediate order, which has no poll loop at all
    $other = new OrderRouterStubVenue('stub');
    $other->createdStatus = 'open';
    $okReport = $router->execute($plan, array('stub' => $other), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'allowReexecution' => true));
    order_router_assert($okReport['steps'][0]['orderId'] === 'stub-order', 'an immediate order reports its id too');
    //  and an "immediate" order the venue reports as STILL OPEN is a resting
    //  order, which is what a venue that silently drops timeInForce leaves you
    //  It is cancelled and re-read, so nothing is left resting to report.
    order_router_assert(in_array('cancelOrder:stub-order', $other->calls, true), 'a resting order is cancelled, not merely noted');
    order_router_assert(count($okReport['openOrders']) === 0, 'the cancel and the re-read settled it');
}

function order_router_test_a_resting_order_is_cancelled($router) {
    //  A venue that silently drops timeInForce turns an immediate-or-cancel order
    //  into a plain resting limit order. Recording it and continuing means the next
    //  hop is sized on a fill that is still growing behind it, and the leftover
    //  order stays live on a real venue after the route has returned and nobody is
    //  watching it.
    $strategies = array('sequential', 'parallel_within_hop', 'best_effort');
    for ($i = 0; $i < count($strategies); $i++) {
        $strategy = $strategies[$i];
        $options = array('strategy' => $strategy, 'live' => true, 'usdRates' => array('USDT' => 1));
        if ($strategy === 'best_effort') {
            $options['acknowledgeDispersion'] = true;
            $options['maxOrders'] = 4;
        }
        //  1. the cancel works: the order is gone, the re-read is what gets reported
        $venue = new OrderRouterStubVenue('stub');
        $venue->createdStatus = 'open';
        $venue->fetchOrderResults = array(array('id' => 'stub-order', 'status' => 'canceled', 'filled' => 0.0001, 'average' => 100000, 'cost' => 10));
        $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), array('slippageBps' => 0));
        $report = $router->execute($plan, array('stub' => $venue), $options);
        order_router_assert(in_array('cancelOrder:stub-order', $venue->calls, true), $strategy . ': the resting order is cancelled');
        order_router_assert(count($report['openOrders']) === 0, $strategy . ': nothing is left resting');
        //  the re-read is authoritative - the cancel and a fill crossed
        order_router_assert(order_router_numbers_match($report['steps'][0]['filledAmount'], 0.0001), $strategy . ': the fill observed AFTER the cancel is the one reported');
        order_router_assert($report['steps'][0]['status'] === 'partial', $strategy . ': a real partial fill, not an unknown');
        //  2. the cancel fails: the order can still fill in full after this returns,
        //     so nothing downstream may be sized on what was observed
        $stubborn = new OrderRouterStubVenue('stub');
        $stubborn->createdStatus = 'open';
        $stubborn->cancelThrows = true;
        $plan2 = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), array('slippageBps' => 0));
        $failed = $router->execute($plan2, array('stub' => $stubborn), $options);
        order_router_assert($failed['steps'][0]['status'] === 'outcome_unknown', $strategy . ': an uncancellable resting order is never a settled step');
        order_router_assert(count($failed['openOrders']) === 1, $strategy . ': the operator is told what is still live');
        order_router_assert($failed['openOrders'][0]['orderId'] === 'stub-order', $strategy . ': and it names the order');
        order_router_assert($failed['openOrders'][0]['reason'] === 'cancel_failed', $strategy . ': and says the cancel failed');
        //  3. the cancel is accepted and the venue still calls it open: same rule
        $ghost = new OrderRouterStubVenue('stub');
        $ghost->createdStatus = 'open';
        $ghost->fetchOrderResults = array(array('id' => 'stub-order', 'status' => 'open', 'filled' => 0, 'average' => 0, 'cost' => 0));
        $plan3 = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), array('slippageBps' => 0));
        $stillOpen = $router->execute($plan3, array('stub' => $ghost), $options);
        order_router_assert($stillOpen['steps'][0]['status'] === 'outcome_unknown', $strategy . ': a cancel the venue ignored leaves the outcome unknown');
        order_router_assert(count($stillOpen['openOrders']) === 1, $strategy . ': and it is reported');
        order_router_assert($stillOpen['openOrders'][0]['reason'] === 'still_open', $strategy . ': as still open');
    }
}


// A venue whose class sits in the async namespace, which is the discriminator the guard uses.
// ccxt\async\Exchange extends BaseExchange rather than ccxt\Exchange, so it is a SIBLING of the
// sync class and no positive instanceof against it is possible.
function order_router_test_refuses_async_venues($router) {
    $venue = new \ccxt\async\OrderRouterFakeAsyncVenue();
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.1, 100), array());
    $threw = false;
    try {
        $router->execute($plan, array('stub' => $venue), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    } catch (\ccxt\NotSupported $e) {
        $threw = true;
    }
    if (!$threw) {
        // Handed an async instance this used to return a clean report with every step unfilled and
        // NO errors, while the fiber had already dispatched the real orders.
        throw new \Exception('an async venue must be refused, not silently mis-read');
    }
}

//  ---------------------------------------------------------------------------
//  idempotency (audit finding 35): execute() used to build fresh state on every
//  call and consult nothing, so running the same plan twice placed every order
//  twice — including the ones that had already filled.
//  ---------------------------------------------------------------------------

function order_router_test_live_requires_an_identity($router) {
    $route = order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100);
    $route['requestId'] = '';
    $plan = $router->buildExecutionPlan($route, array());
    $venue = new OrderRouterStubVenue('stub');
    order_router_assert_throws(function () use ($router, $plan, $venue) {
        $router->execute($plan, array('stub' => $venue), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    }, BadRequest::class, 'a live plan with no identity is refused');
    order_router_assert(count($venue->calls) === 0, 'refused before a single call reached the venue');
    //  a rehearsal needs no identity: it places nothing
    $dry = $router->execute($plan, array('stub' => $venue), array('strategy' => 'sequential', 'usdRates' => array('USDT' => 1)));
    order_router_assert($dry['dryRun'] === true, 'a dry run needs no identity');
    //  ...and a HAND-ASSEMBLED plan is a supported input: execute() takes any array of the
    //  plan shape, and such a plan never went through a routing request, so requestId is the
    //  one identity it cannot have. options idempotencyKey is how it supplies one.
    $supplied = new OrderRouterStubVenue('stub');
    $keyed = $router->execute($plan, array('stub' => $supplied), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'idempotencyKey' => 'hand-built-1'));
    order_router_assert($keyed['planId'] === 'hand-built-1', 'the supplied key is the identity');
    order_router_assert($keyed['steps'][0]['status'] === 'filled', 'and the plan executes');
    order_router_assert(!array_key_exists('clientOrderId', $supplied->paramsSeen[0]), 'and no client order id is injected');
    //  and the guard keys off it, exactly as it does off a requestId
    order_router_assert_throws(function () use ($router, $plan) {
        $router->execute($plan, array('stub' => new OrderRouterStubVenue('stub')), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'idempotencyKey' => 'hand-built-1'));
    }, BadRequest::class, 'the same key is refused a second time');
    //  an explicit key OVERRIDES a plan's requestId: passing one is a deliberate statement
    //  about what this execution is, and the caller is closer to that than the plan is
    $routed = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $overridden = new OrderRouterStubVenue('stub');
    $report = $router->execute($routed, array('stub' => $overridden), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'idempotencyKey' => 'override-1'));
    order_router_assert($report['planId'] === 'override-1', 'the option overrides the requestId');
    order_router_assert(!array_key_exists('clientOrderId', $overridden->paramsSeen[0]), 'and no client order id is injected');
}

function order_router_test_client_order_id_is_never_injected($router) {
    $route = order_router_two_hop_route();
    $route['requestId'] = 'fixed-req';
    $plan = $router->buildExecutionPlan($route, array());
    //  by default nothing is injected: each exchange's createOrder sends whatever identifier
    //  it generates on its own
    $bare = new OrderRouterStubVenue('stub');
    $report = $router->execute($plan, array('stub' => $bare), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    order_router_assert($report['planId'] === 'fixed-req', 'the report names the plan identity');
    order_router_assert(count($bare->paramsSeen) === 2, 'two orders were placed');
    order_router_assert(!array_key_exists('clientOrderId', $bare->paramsSeen[0]), 'no client order id is forced onto the order');
    order_router_assert(!array_key_exists('clientOrderId', $bare->paramsSeen[1]), 'for any step');
    order_router_assert($report['steps'][0]['clientOrderId'] === '', 'and the report carries what the venue reported, which is nothing');
    //  a caller-supplied clientOrderId is forwarded as-is, alongside the caller's other params
    $second = new OrderRouter(array('apiKey' => 'test-key'));
    $venue = new OrderRouterStubVenue('stub');
    $supplied = $second->execute($router->buildExecutionPlan($route, array()), array('stub' => $venue), array(
        'strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1),
        'orderParams' => array('clientOrderId' => 'caller-supplied', 'reduceOnly' => true),
    ));
    order_router_assert($venue->paramsSeen[0]['clientOrderId'] === 'caller-supplied', 'the caller\'s id travels untouched');
    order_router_assert($venue->paramsSeen[1]['clientOrderId'] === 'caller-supplied', 'orderParams apply to every step alike');
    order_router_assert($venue->paramsSeen[0]['reduceOnly'] === true, "the caller's other params still travel");
    order_router_assert($supplied['steps'][0]['clientOrderId'] === 'caller-supplied', 'and the report says what the venue recorded');
}

function order_router_test_reexecution_is_refused($router) {
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $opts = array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1));
    $first = new OrderRouterStubVenue('stub');
    $report = $router->execute($plan, array('stub' => $first), $opts);
    order_router_assert($report['steps'][0]['status'] === 'filled', 'the first run places the order');
    $again = new OrderRouterStubVenue('stub');
    order_router_assert_throws(function () use ($router, $plan, $again, $opts) {
        $router->execute($plan, array('stub' => $again), $opts);
    }, BadRequest::class, 'the second run is refused');
    order_router_assert(count($again->calls) === 0, 'not one order was re-placed');
    //  a plan rebuilt from the same route is the same plan: the identity travels with it
    $rebuiltRoute = order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100);
    $rebuiltRoute['requestId'] = $plan['requestId'];
    $rebuilt = $router->buildExecutionPlan($rebuiltRoute, array());
    $third = new OrderRouterStubVenue('stub');
    order_router_assert_throws(function () use ($router, $rebuilt, $third, $opts) {
        $router->execute($rebuilt, array('stub' => $third), $opts);
    }, BadRequest::class, 'a rebuilt plan with the same identity is refused too');
    order_router_assert(count($third->calls) === 0, 'and places nothing');
    //  ...and the legitimate retry path is explicit
    $allowed = new OrderRouterStubVenue('stub');
    $retry = $router->execute($plan, array('stub' => $allowed), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1), 'allowReexecution' => true));
    order_router_assert($retry['steps'][0]['status'] === 'filled', 'an explicit opt-in runs it again');
    order_router_assert(count($allowed->calls) > 0, 'and really does place the order');
}

function order_router_test_dry_run_does_not_consume_a_plan($router) {
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $rehearsal = new OrderRouterStubVenue('stub');
    $router->execute($plan, array('stub' => $rehearsal), array('strategy' => 'sequential', 'usdRates' => array('USDT' => 1)));
    $real = new OrderRouterStubVenue('stub');
    $report = $router->execute($plan, array('stub' => $real), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    order_router_assert($report['steps'][0]['status'] === 'filled', 'the rehearsal did not burn the plan');
    //  a run that FAILED still placed orders — or may have — so the retry is refused just the
    //  same. The ledger records the attempt, not the outcome.
    $failedPlan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $broken = new OrderRouterStubVenue('stub', 1, true);
    $failedReport = $router->execute($failedPlan, array('stub' => $broken), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    order_router_assert($failedReport['halted'] === true, 'the run halted');
    $retry = new OrderRouterStubVenue('stub');
    order_router_assert_throws(function () use ($router, $failedPlan, $retry) {
        $router->execute($failedPlan, array('stub' => $retry), array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1)));
    }, BadRequest::class, 'a failed run still consumed the plan');
    order_router_assert(count($retry->calls) === 0, 'and the retry placed nothing');
}

//  the stub records reads and cancels in the same list, so orders are counted by prefix —
//  the TypeScript reference counts the whole list, which there contains only createOrder
function order_router_count_create_calls($venue) {
    $total = 0;
    for ($i = 0; $i < count($venue->calls); $i++) {
        if (strpos($venue->calls[$i], 'createOrder') === 0) {
            $total = $total + 1;
        }
    }
    return $total;
}

function order_router_test_on_step_sees_every_step($router) {
    //  The one thing a caller cannot do from outside execute(): look at what just happened and
    //  decide not to continue. Before this hook the method was opaque from call to return.
    $plan = $router->buildExecutionPlan(order_router_two_hop_route(), array());
    $venue = new OrderRouterStubVenue('stub');
    $seen = array();
    $onStep = function ($event) use (&$seen) {
        $seen[] = $event;
        return ($event['stepIndex'] === 0) ? 'halt' : '';
    };
    $report = $router->execute($plan, array('stub' => $venue), array(
        'strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1),
        'onStep' => $onStep,
    ));
    order_router_assert(count($seen) === 1, 'the hook is not called for steps that never ran');
    order_router_assert($seen[0]['stepIndex'] === 0, 'the first step is the one it saw');
    order_router_assert($seen[0]['status'] === 'filled', 'and it saw the outcome');
    order_router_assert($seen[0]['stepsRemaining'] === count($plan['steps']) - 1, 'it is told how much is left');
    order_router_assert(is_array($seen[0]['reconciliation']), 'the verdict it is judging is in the event');
    order_router_assert($report['halted'] === true, 'the route stopped');
    order_router_assert($report['haltReason'] === 'halted_by_on_step', 'and says who stopped it');
    order_router_assert($report['haltStepIndex'] === 0, 'at the step the hook judged');
    order_router_assert($report['steps'][1]['status'] === 'skipped', 'the rest is skipped');
    order_router_assert($report['ordersPlaced'] === 1, 'the step after the halt was never placed');
    order_router_assert(order_router_count_create_calls($venue) === 1, 'exactly one order reached the venue');
}

function order_router_test_on_step_that_throws_is_recorded($router) {
    //  The report is the ONLY account of orders that are already live. An exception raised by
    //  observability code must never destroy it — trigger.dev logs and ignores hook errors for
    //  the same reason.
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $venue = new OrderRouterStubVenue('stub');
    $onStep = function ($event) {
        throw new \RuntimeException('hook is broken');
    };
    $report = $router->execute($plan, array('stub' => $venue), array(
        'strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1),
        'onStep' => $onStep,
    ));
    order_router_assert($report['halted'] === false, 'the route finished');
    order_router_assert($report['steps'][0]['status'] === 'filled', 'and the step is reported');
    $found = false;
    $codes = array();
    for ($i = 0; $i < count($report['errors']); $i++) {
        $codes[] = $report['errors'][$i]['code'];
        if (strpos($report['errors'][$i]['code'], 'on_step_hook_failed') === 0) {
            $found = true;
        }
    }
    order_router_assert($found, 'the broken hook is reported rather than swallowed, got ' . json_encode($codes));
}

function order_router_test_on_step_can_only_narrow($router) {
    //  The halt is a money decision made in one pure place precisely so it cannot be omitted.
    //  A hook that could wave it through would be a way to omit it.
    $plan = $router->buildExecutionPlan(order_router_two_hop_route(), array());
    $starved = new OrderRouterStubVenue('stub', 0.1);
    $onStep = function ($event) {
        return 'continue';
    };
    $report = $router->execute($plan, array('stub' => $starved), array(
        'strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1),
        'onStep' => $onStep,
    ));
    order_router_assert($report['halted'] === true, 'the route still halted');
    order_router_assert($report['haltReason'] === 'shortfall_exceeds_tolerance', 'the reconciliation reason survives, it is not replaced by the hook');
    order_router_assert($report['ordersPlaced'] === 1, 'the hook did not wave the route onward');
    order_router_assert($report['steps'][1]['status'] === 'skipped', 'and the rest is skipped');
}

function order_router_test_retry_failed_steps($router) {
    //  A rejected order was not placed, so re-placing it cannot double-fill. No client order id
    //  is injected on either attempt, so the venue's own identifier generation applies to the
    //  retry exactly as it did to the first try.
    $plan = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $relents = new OrderRouterStubVenue('stub');
    $relents->failCreateTimes = 1;
    $report = $router->execute($plan, array('stub' => $relents), array(
        'strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1),
        'retryFailedSteps' => 2, 'retryDelayMs' => 0,
    ));
    order_router_assert($report['steps'][0]['status'] === 'filled', 'the retry succeeded');
    order_router_assert($report['steps'][0]['attempt'] === 1, 'the report says which attempt won');
    order_router_assert(count($relents->paramsSeen) === 2, 'two placements went out');
    order_router_assert(!array_key_exists('clientOrderId', $relents->paramsSeen[0]), 'no client order id is injected on the first try');
    order_router_assert(!array_key_exists('clientOrderId', $relents->paramsSeen[1]), 'nor on the retry');
    //  the outcome the policy must NEVER touch
    $unknown = new OrderRouterStubVenue('stub');
    $unknown->timeoutCreate = true;
    $plan2 = $router->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $second = $router->execute($plan2, array('stub' => $unknown), array(
        'strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1),
        'retryFailedSteps' => 5, 'retryDelayMs' => 0,
    ));
    order_router_assert($second['steps'][0]['status'] === 'outcome_unknown', 'the outcome is unknown, not failed');
    order_router_assert(order_router_count_create_calls($unknown) === 1, 'an order whose outcome is unknown may already be live; it is never re-placed');
}

function order_router_test_ledger_is_bounded($router) {
    $bounded = new OrderRouter(array('apiKey' => 'k'));
    $cap = OrderRouter::MAX_EXECUTED_PLAN_IDS;
    for ($i = 0; $i < $cap; $i++) {
        $bounded->recordExecutedPlan('plan-' . $i);
    }
    order_router_assert(count($bounded->executedPlanIds) === $cap, 'the ledger fills to exactly the cap');
    order_router_assert($bounded->hasExecutedPlan('plan-0') === true, 'nothing is evicted before it is full');
    //  the cap holds no matter how far past it the process runs
    for ($i = $cap; $i < $cap + 100; $i++) {
        $bounded->recordExecutedPlan('plan-' . $i);
    }
    order_router_assert(count($bounded->executedPlanIds) === $cap, 'the ledger never grows past the cap');
    order_router_assert(count($bounded->executedPlanIdSet) === $cap, 'and the set never diverges from the list');
    //  FIFO: the OLDEST 100 are the ones that went
    for ($i = 0; $i < 100; $i++) {
        order_router_assert($bounded->hasExecutedPlan('plan-' . $i) === false, 'the oldest entries are evicted first');
    }
    order_router_assert($bounded->hasExecutedPlan('plan-100') === true, 'nothing newer went with them');
    order_router_assert($bounded->hasExecutedPlan('plan-' . ($cap + 99)) === true, 'the newest entry is present');
    order_router_assert($bounded->executedPlanIds[0] === 'plan-100', 'the list is still in insertion order');
    //  re-recording an id already held must not shuffle the eviction order, or a plan
    //  re-executed in a loop could keep itself alive forever while newer ids fall out
    $bounded->recordExecutedPlan('plan-100');
    order_router_assert(count($bounded->executedPlanIds) === $cap, 'a duplicate record adds nothing');
    order_router_assert($bounded->executedPlanIds[0] === 'plan-100', 'and does not move the entry in the queue');
    //  AND THE TRADEOFF, STATED AS A TEST: an evicted plan is no longer refused. This is the
    //  documented weakening at the cap, not an accident — if this assertion ever has to
    //  change, the comment on MAX_EXECUTED_PLAN_IDS has to change with it.
    $opts = array('strategy' => 'sequential', 'live' => true, 'usdRates' => array('USDT' => 1));
    $plan = $bounded->buildExecutionPlan(order_router_one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), array());
    $first = new OrderRouterStubVenue('stub');
    $bounded->execute($plan, array('stub' => $first), $opts);
    $refused = new OrderRouterStubVenue('stub');
    order_router_assert_throws(function () use ($bounded, $plan, $refused, $opts) {
        $bounded->execute($plan, array('stub' => $refused), $opts);
    }, BadRequest::class, 'while remembered, the duplicate is refused');
    order_router_assert(count($refused->calls) === 0, 'and it placed nothing');
    for ($i = 0; $i < $cap; $i++) {
        $bounded->recordExecutedPlan('flush-' . $i);
    }
    order_router_assert($bounded->hasExecutedPlan($plan['requestId']) === false, 'the plan has aged out of the ledger');
    $reexecuted = new OrderRouterStubVenue('stub');
    $report = $bounded->execute($plan, array('stub' => $reexecuted), $opts);
    order_router_assert($report['steps'][0]['status'] === 'filled', 'an aged-out plan re-executes without the opt-in');
    order_router_assert(count($reexecuted->calls) > 0, 'which means real orders — the bound costs a guarantee');
}

function test_order_router() {
    $router = new OrderRouter(array('apiKey' => 'test-key'));
    $tests = array(
        'fixture: buildExecutionPlan' => 'ccxt\order_router_test_fixture_build_execution_plan',
        'fixture: buildExecutionPlan is deterministic and does not mutate its input' => 'ccxt\order_router_test_fixture_plan_is_deterministic',
        'fixture: checkExecutionPlanSafety' => 'ccxt\order_router_test_fixture_check_execution_plan_safety',
        'fixture: reconcileExecutionStep' => 'ccxt\order_router_test_fixture_reconcile_execution_step',
        'fixture: a sequence of reconciliations on one hop' => 'ccxt\order_router_test_fixture_reconcile_sequence',
        'a route that does not run from the requested asset to the requested asset is refused' => 'ccxt\order_router_test_route_produces_mismatch',
        'a route that spends an asset the caller never offered is refused' => 'ccxt\order_router_test_route_spends_mismatch',
        'a bridged route whose hops do not connect is refused' => 'ccxt\order_router_test_route_chain_break',
        'a well-formed route still plans normally' => 'ccxt\order_router_test_route_well_formed_still_plans',
        'fixture: buildUnwindPlan' => 'ccxt\order_router_test_fixture_build_unwind_plan',
        'fixture: formatNumber spells one number one way in all six languages' => 'ccxt\order_router_test_fixture_format_number',
        'fixture: a fee in the acquired asset resizes what the next hop is sized on' => 'ccxt\order_router_test_fixture_fee_netting',
        'fixture: numberAt reads one number grammar in all six languages' => 'ccxt\order_router_test_fixture_number_at',
        'constructor: apiKey is required, and maxNotionalUsd is an opt-in guardrail at any size' => 'ccxt\order_router_test_constructor_cap',
        'a hand-built plan carrying only the required fields is executable' => 'ccxt\order_router_test_hand_built_plan_is_executable',
        'the derived limit price and notional follow amount and expectedPrice' => 'ccxt\order_router_test_derived_limit_price_and_notional',
        'the limit price sits on the side that costs you, and only there' => 'ccxt\order_router_test_limit_price_side',
        'a cap that IS set binds exactly, at whatever size, and includes the slippage' => 'ccxt\order_router_test_notional_cap',
        'with no cap set, no notional check runs at all' => 'ccxt\order_router_test_no_cap_means_no_check',
        'a step that cannot be valued in USD BLOCKS when a cap is in force — it is never skipped' => 'ccxt\order_router_test_unvaluable_blocks',
        'USDT is not assumed to be one dollar; USD is' => 'ccxt\order_router_test_usdt_is_not_a_dollar',
        'an empty plan is not a safe plan' => 'ccxt\order_router_test_empty_plan_is_not_safe',
        'reconcileExecutionStep never scales a downstream order UP' => 'ccxt\order_router_test_reconcile_never_scales_up',
        'reconcileExecutionStep halts on a total miss and on an over-tolerance shortfall' => 'ccxt\order_router_test_reconcile_halts',
        'buildUnwindPlan is never automatic and never nets across venues' => 'ccxt\order_router_test_unwind_is_never_automatic',
        'a buy-side unwind order never spends more quote than the residual actually holds' => 'ccxt\order_router_test_unwind_buy_is_fundable',
        'dry_run is the default: a live-looking call with live unset places nothing' => 'ccxt\order_router_test_dry_run_is_the_default',
        'execute refuses to go live without a way to value the trade in USD — when a cap is set' => 'ccxt\order_router_test_execute_refuses_unvaluable',
        'execute refuses to go live above a cap the caller set' => 'ccxt\order_router_test_execute_refuses_above_cap',
        'sequential places IOC limit orders in plan order' => 'ccxt\order_router_test_sequential_places_ioc',
        'sequential obeys the halt verdict and never starts the next hop' => 'ccxt\order_router_test_sequential_obeys_halt',
        'a market order needs BOTH a venue that cannot do IOC and an explicit opt-in' => 'ccxt\order_router_test_market_orders_need_both',
        'parallel_within_hop contains a failing leg instead of abandoning its siblings' => 'ccxt\order_router_test_parallel_contains_a_failing_leg',
        'best_effort refuses multi-hop and demands both of its acknowledgements' => 'ccxt\order_router_test_best_effort_refuses_multi_hop',
        'best_effort stops at maxOrders and never halts' => 'ccxt\order_router_test_best_effort_stops_at_max_orders',
        'a per-call cap overrides the client-level one, in both directions' => 'ccxt\order_router_test_per_call_cap_overrides',
        'best_effort derives the hop count from the steps, not from a key the plan may not carry' => 'ccxt\order_router_test_best_effort_derives_hop_count',
        'venueSupportsIoc reads the dictionary of booleans every real exchange declares' => 'ccxt\order_router_test_venue_supports_ioc_dictionary',
        'limit_protected refuses a non-positive pollIntervalMs before placing anything' => 'ccxt\order_router_test_limit_protected_refuses_a_zero_poll_interval',
        'limit_protected keeps the fill from an order the venue canceled on the last poll' => 'ccxt\order_router_test_limit_protected_keeps_a_venue_side_cancel_fill',
        'a failure after createOrder still reports the order id and an open order' => 'ccxt\order_router_test_order_id_survives_a_failure_after_create',
        'a resting order on an immediate path is cancelled, and a cancel that fails halts the route' => 'ccxt\order_router_test_a_resting_order_is_cancelled',
        'an unknown strategy is refused even in dry run' => 'ccxt\order_router_test_unknown_strategy_is_refused',
        'a plan carries its age, and a stale one is refused only when asked' => 'ccxt\order_router_test_plan_age_is_reported_and_refused_only_when_asked',
        'atomic_ish demands the whole route pre-funded' => 'ccxt\order_router_test_atomic_ish_demands_prefunding',
        'fetchRoute refuses neither-or-both amounts before touching the network' => 'ccxt\order_router_test_fetch_route_refuses_ambiguous_amounts',
        'fetchRoute builds a deterministic query' => 'ccxt\order_router_test_fetch_route_query',
        'fetchRouteWithBalances skips zeros, sorts largest first and reports what it dropped' => 'ccxt\order_router_test_fetch_route_with_balances',
        'fetchRouteWithBalances refuses a route computed against balances the router ignored' => 'ccxt\order_router_test_fetch_route_with_balances_requires_echo',
        'fetchRouteWithBalances trims to the router 64-entry cap, dropping the smallest' => 'ccxt\order_router_test_fetch_route_with_balances_entry_cap',
        'formatNumber never emits exponent notation' => 'ccxt\order_router_test_format_number',
        'an async venue is refused instead of silently mis-read' => 'ccxt\order_router_test_refuses_async_venues',
        'a live plan with no identity is refused, and an idempotencyKey supplies one' => 'ccxt\order_router_test_live_requires_an_identity',
        'execute never sets a clientOrderId: the venue keeps its own, and a caller-supplied one travels untouched' => 'ccxt\order_router_test_client_order_id_is_never_injected',
        'the same plan is refused on a second live execution, and only an explicit opt-in overrides it' => 'ccxt\order_router_test_reexecution_is_refused',
        'a dry run never consumes a plan, and a halted live run always does' => 'ccxt\order_router_test_dry_run_does_not_consume_a_plan',
        'the re-execution ledger is bounded, evicts oldest-first, and says so by re-allowing an evicted plan' => 'ccxt\order_router_test_ledger_is_bounded',
        'onStep sees every step and can stop the route' => 'ccxt\order_router_test_on_step_sees_every_step',
        'an onStep that throws is recorded, and does not take the run down with it' => 'ccxt\order_router_test_on_step_that_throws_is_recorded',
        'onStep can only narrow: it cannot resume a route the reconciliation already halted' => 'ccxt\order_router_test_on_step_can_only_narrow',
        'retryFailedSteps re-places a rejected step as a fresh order, and never retries an unknown outcome' => 'ccxt\order_router_test_retry_failed_steps',
    );
    $passed = 0;
    $failures = array();
    foreach ($tests as $name => $callable) {
        try {
            $callable($router);
            $passed = $passed + 1;
            echo 'ok   ' . $name . "\n";
        } catch (\Throwable $e) {
            $failures[] = $name . ' — ' . $e->getMessage();
            echo 'FAIL ' . $name . ' — ' . $e->getMessage() . "\n";
        }
    }
    echo "\n" . $passed . ' passed, ' . count($failures) . ' failed, ' . count($tests) . " total\n";
    if (count($failures) > 0) {
        throw new OrderRouterTestFailure(implode("\n", $failures));
    }
    //  the last invariant, and the cheapest one to check: this class must never
    //  contain a call to a funds-transfer endpoint
    $source = file_get_contents(PATH_TO_CCXT . 'OrderRouter.php');
    if (strpos($source, 'withdraw') !== false) {
        throw new OrderRouterTestFailure('OrderRouter.php mentions withdraw');
    }
    echo "withdraw appears nowhere in php/OrderRouter.php\n";
}

if (isset($_SERVER['SCRIPT_FILENAME']) && (realpath($_SERVER['SCRIPT_FILENAME']) === realpath(__FILE__))) {
    try {
        test_order_router();
    } catch (\Throwable $e) {
        exit(1);
    }
    exit(0);
}
