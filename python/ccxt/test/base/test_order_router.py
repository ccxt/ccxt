# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------
# OrderRouter — offline tests.
#
# Run:  python3 python/ccxt/test/base/test_order_router.py
#
# Hand-written, like the class it covers. It is NOT transpiled and it is NOT
# wired into python/ccxt/test/base/tests_init.py, which is generated.
#
# Two halves, and both matter:
#
# 1. The FIXTURE half drives the four pure methods from
#    ts/src/test/base/fixtures/orderRouter.json — the SAME file the TypeScript,
#    PHP, C# and Go suites read. Nothing here restates an expected value by
#    hand, so a port that drifts fails in its own language and nowhere else,
#    which is what makes drift impossible to hide.
#
# 2. The INVARIANT half asserts the safety properties directly, in literal
#    numbers. The fixture's expectations were produced by the reference
#    implementation, so on their own they would only prove the five languages
#    agree — not that they agree on the right answer.
#
# Nothing here touches the network and nothing here places an order.
# ---------------------------------------------------------------------------

import json
import math
import os
import sys

here = os.path.dirname(os.path.abspath(__file__))
python_root = os.path.dirname(os.path.dirname(os.path.dirname(here)))
repo_root = os.path.dirname(python_root)
sys.path.insert(0, python_root)

from ccxt.base.errors import ArgumentsRequired  # noqa: E402
from ccxt.base.errors import BadRequest  # noqa: E402
from ccxt.base.errors import ExchangeError  # noqa: E402
from ccxt.base.errors import NotSupported  # noqa: E402
from ccxt.base.order_router import OrderRouter  # noqa: E402

fixture_path = os.path.join(repo_root, 'ts', 'src', 'test', 'base', 'fixtures', 'orderRouter.json')
with open(fixture_path) as handle:
    fixture = json.load(handle)

router = OrderRouter({'apiKey': 'test-key'})


# ---------------------------------------------------------------------------
# comparison helpers — the algorithm the fixture's `comparison` field describes
# and every port's test must use
# ---------------------------------------------------------------------------

TOLERANCE = 1e-9


def numbers_match(a, b):
    if a == b:
        return True
    if math.isinf(a) or math.isinf(b) or math.isnan(a) or math.isnan(b):
        # an infinity only ever matches itself. Without this the relative
        # comparison below reads inf <= inf as a match and an infinite value
        # passes against ANY expectation — which is exactly how a number grammar
        # that overflows would slip past the numberCases table
        return False
    scale = 1
    if abs(a) > scale:
        scale = abs(a)
    if abs(b) > scale:
        scale = abs(b)
    return abs(a - b) <= TOLERANCE * scale


def assert_matches(actual, expected, where):
    if isinstance(expected, list):
        assert isinstance(actual, list), where + ': expected a list, got ' + type(actual).__name__
        assert len(actual) == len(expected), where + ': list length ' + str(len(actual)) + ' != ' + str(len(expected))
        for i in range(len(expected)):
            assert_matches(actual[i], expected[i], where + '[' + str(i) + ']')
        return
    if isinstance(expected, dict):
        assert isinstance(actual, dict), where + ': expected a dict, got ' + type(actual).__name__
        # both directions: a missing field and an invented field are both drift
        assert sorted(actual.keys()) == sorted(expected.keys()), where + ': key set ' + repr(sorted(actual.keys())) + ' != ' + repr(sorted(expected.keys()))
        for key in sorted(expected.keys()):
            assert_matches(actual[key], expected[key], where + '.' + key)
        return
    if isinstance(expected, bool) or isinstance(actual, bool):
        assert actual is expected, where + ': ' + repr(actual) + ' != ' + repr(expected)
        return
    if isinstance(expected, (int, float)):
        assert isinstance(actual, (int, float)) and numbers_match(actual, expected), where + ': ' + repr(actual) + ' != ' + repr(expected)
        return
    assert actual == expected, where + ': ' + repr(actual) + ' != ' + repr(expected)


def assert_raises(exception_class, callback, message):
    try:
        callback()
    except exception_class:
        return
    except Exception as e:
        raise AssertionError(message + ': raised ' + type(e).__name__ + ' instead of ' + exception_class.__name__)
    raise AssertionError(message + ': nothing was raised, expected ' + exception_class.__name__)


TESTS = []


def test(name):
    def register(function):
        TESTS.append((name, function))
        return function
    return register


# ---------------------------------------------------------------------------
# 1. the shared fixture — the cross-language contract
# ---------------------------------------------------------------------------

@test('fixture: build_execution_plan')
def test_fixture_build_execution_plan():
    cases = fixture['planCases']
    assert len(cases) > 0, 'the fixture has plan cases'
    for case in cases:
        route = fixture['routes'][case['route']]
        plan = router.build_execution_plan(route, case['options'])
        assert_matches(plan, case['expected'], 'planCase ' + case['id'])


@test('fixture: build_execution_plan is deterministic and does not mutate its input')
def test_fixture_build_execution_plan_is_pure():
    for case in fixture['planCases']:
        route = fixture['routes'][case['route']]
        before = json.dumps(route, sort_keys=True)
        first = router.build_execution_plan(route, case['options'])
        second = router.build_execution_plan(route, case['options'])
        assert_matches(second, first, 'planCase ' + case['id'] + ' repeated')
        assert json.dumps(route, sort_keys=True) == before, 'planCase ' + case['id'] + ': the route was mutated'


@test('fixture: check_execution_plan_safety')
def test_fixture_check_execution_plan_safety():
    cases = fixture['safetyCases']
    assert len(cases) > 0, 'the fixture has safety cases'
    for case in cases:
        route = fixture['routes'][case['route']]
        markets = fixture['marketSets'][case['markets']]
        plan = router.build_execution_plan(route, case['planOptions'])
        violations = router.check_execution_plan_safety(plan, markets, case['options'])
        assert_matches(violations, case['expected'], 'safetyCase ' + case['id'])


@test('fixture: reconcile_execution_step')
def test_fixture_reconcile_execution_step():
    cases = fixture['reconcileCases']
    assert len(cases) > 0, 'the fixture has reconcile cases'
    for case in cases:
        # a case names either a route to plan from, or a plan written out in
        # full — the latter is how a plan with field types no builder produces
        # (an int hopIndex on one step and a float on the next) gets covered
        if 'plan' in case:
            plan = fixture['plans'][case['plan']]
        else:
            plan = router.build_execution_plan(fixture['routes'][case['route']], case['planOptions'])
        verdict = router.reconcile_execution_step(plan, case['stepIndex'], case['realisedOut'])
        assert_matches(verdict, case['expected'], 'reconcileCase ' + case['id'])


def refuses_plan(route, fragment, message):
    try:
        router.build_execution_plan(route, {})
    except ExchangeError as e:
        assert fragment in str(e), message + ': raised "' + str(e) + '", expected "' + fragment + '"'
        return
    raise AssertionError(message + ': nothing was raised')


@test('a route that does not run from the requested asset to the requested asset is refused')
def test_route_produces_mismatch():
    # build_execution_plan used to copy from, to, pair and side straight out of the server's JSON,
    # and the safety checks only tested internal consistency against whatever market that named.
    # So a compromised — or simply buggy — router response could steer real orders into any real
    # market and every check would pass it, under the 25 USD cap. The client now checks the answer
    # against its OWN record of the question.
    route = one_leg_route('buy', 'BTC', 'USDT', 0.1, 100)
    route['clientRequestedFrom'] = 'USDT'
    route['clientRequestedTo'] = 'ETH'   # the caller wanted ETH; the route delivers BTC
    refuses_plan(route, 'produces BTC, not the requested ETH', 'a produces mismatch')


@test('a route that spends an asset the caller never offered is refused')
def test_route_spends_mismatch():
    route = one_leg_route('buy', 'BTC', 'USDT', 0.1, 100)
    route['clientRequestedFrom'] = 'EUR'
    route['clientRequestedTo'] = 'BTC'
    refuses_plan(route, 'spends USDT, not the requested EUR', 'a spends mismatch')


@test('a bridged route whose hops do not connect is refused')
def test_route_chain_break():
    # Internal coherence, checked with or without a client stamp: hop 2 must spend exactly what
    # hop 1 produced, or the plan strands the proceeds of one order and funds the next from a
    # wallet nobody checked.
    route = two_hop_route()
    route['hops'][1]['base'] = 'DOGE'
    route['hops'][1]['quote'] = 'EUR'
    refuses_plan(route, 'spends DOGE but the previous hop produced BTC', 'a broken chain')


@test('a well-formed route still plans normally')
def test_route_well_formed_still_plans():
    route = one_leg_route('buy', 'BTC', 'USDT', 0.1, 100)
    route['clientRequestedFrom'] = 'USDT'
    route['clientRequestedTo'] = 'BTC'
    plan = router.build_execution_plan(route, {})
    assert len(plan['steps']) == 1, 'a coherent route still plans'


@test('fixture: a sequence of reconciliations on one hop')
def test_fixture_reconcile_sequence():
    # reconcile_execution_step is pure and cannot remember across calls, so a hop's cumulative
    # shortfall lives on the steps themselves — written by apply_resize. That interaction is only
    # visible across a SEQUENCE of calls, which reconcileCases (one call each) cannot express,
    # and it is exactly where the five ports could silently disagree.
    cases = fixture['reconcileSequenceCases']
    assert len(cases) > 0, 'the fixture has reconcile sequence cases'
    for case in cases:
        steps = json.loads(json.dumps(case['steps']))
        for index, call in enumerate(case['calls']):
            # the plan is rebuilt from the working steps on every call, exactly as execute() does
            # — PHP copies arrays on assignment, so a plan built once outside this loop would mean
            # five ports running five different tests
            plan = {'steps': steps, 'reconcileToleranceRatio': case['reconcileToleranceRatio']}
            reconciliation = router.reconcile_execution_step(plan, call['stepIndex'], call['realisedOut'])
            assert numbers_match(reconciliation['scale'], case['expectedScales'][index]), \
                'reconcileSequenceCase ' + case['id'] + ' call ' + str(index) + ': scale ' + str(reconciliation['scale'])
            router.apply_resize(steps, reconciliation)
        for index, step in enumerate(steps):
            assert numbers_match(step['amount'], case['expectedAmounts'][index]), \
                'reconcileSequenceCase ' + case['id'] + ' step ' + str(index) + ': amount ' + str(step['amount'])


@test('fixture: number_at reads one number grammar in all five languages')
def test_fixture_number_at():
    # Every port hand-implements JavaScript's parseFloat prefix grammar rather
    # than calling its own parser, because every language's own parser disagrees
    # with the other four somewhere: float() reads '1_000' as 1000, 'inf' as an
    # infinity and '1,234.5' not at all. These cases are the contract: a cap read
    # as 1234.5 in one language and 1 in another is a cap that silently
    # disappears, and this table is what stops that shipping green.
    cases = fixture['numberCases']
    assert len(cases) > 0, 'the fixture has number cases'
    for case in cases:
        actual = router.number_at(case['container'], case['key'], case['default'])
        assert isinstance(actual, (int, float)) and not isinstance(actual, bool), 'numberCase ' + case['id'] + ': not a number'
        assert numbers_match(actual, case['expected']), 'numberCase ' + case['id'] + ': expected ' + str(case['expected']) + ', got ' + str(actual)


@test('fixture: build_unwind_plan')
def test_fixture_build_unwind_plan():
    cases = fixture['unwindCases']
    assert len(cases) > 0, 'the fixture has unwind cases'
    for case in cases:
        report = fixture['reports'][case['report']]
        unwind = router.build_unwind_plan(report)
        assert_matches(unwind, case['expected'], 'unwindCase ' + case['id'])


# ---------------------------------------------------------------------------
# 2. invariants, asserted directly rather than through the fixture
# ---------------------------------------------------------------------------

def one_leg_route(side, base, quote, amount, price):
    return {
        'from': quote if side == 'buy' else base,
        'to': base if side == 'buy' else quote,
        'strategy': 'best_single',
        'exactSide': 'in',
        'amountIn': amount * price if side == 'buy' else amount,
        'amountOut': amount if side == 'buy' else amount * price,
        'fullyFillable': True,
        'fillRatio': 1,
        'unroutableReason': None,
        'hops': [
            {
                'pair': base + '/' + quote,
                'side': side,
                'base': base,
                'quote': quote,
                'amountIn': amount * price if side == 'buy' else amount,
                'amountOut': amount if side == 'buy' else amount * price,
                'legs': [{'exchangeId': 'stub', 'amount': amount, 'averagePrice': price, 'takerFeeRate': 0, 'feeCost': 0, 'effectivePrice': price}],
                'fullyFillable': True,
            },
        ],
    }


PERMISSIVE_STUB_MARKETS = {
    'stub': {
        'BTC/USDT': {
            'symbol': 'BTC/USDT',
            'base': 'BTC',
            'quote': 'USDT',
            'precision': {'amount': 0, 'price': 0},
            'limits': {'amount': {'min': 0, 'max': 0}, 'price': {'min': 0, 'max': 0}, 'cost': {'min': 0, 'max': 0}},
        },
    },
}


@test('constructor: apiKey is required, and maxNotionalUsd is an opt-in guardrail at any size')
def test_constructor():
    assert_raises(ArgumentsRequired, lambda: OrderRouter({}), 'an apiKey is required')
    # No ceiling. A caller trading thousands is using this correctly, and the class
    # does not get to decide otherwise — the old hard 25 USD limit came from this
    # repository's own live-test safety rule, which is not a rule about anyone's money.
    large = OrderRouter({'apiKey': 'k', 'maxNotionalUsd': 250000})
    assert large.max_notional_usd == 250000, 'honoured exactly, not clamped'
    small = OrderRouter({'apiKey': 'k', 'maxNotionalUsd': 0.05})
    assert small.max_notional_usd == 0.05, 'cents are a legitimate trade size'
    # The default is NO cap.
    standard = OrderRouter({'apiKey': 'k'})
    assert standard.max_notional_usd == OrderRouter.NO_CAP
    assert OrderRouter.NO_CAP == 0
    # 0 is the explicit spelling of "no cap"; negative is a typo, and silently
    # ignoring it would leave the caller believing a guardrail is in place.
    assert OrderRouter({'apiKey': 'k', 'maxNotionalUsd': 0}).max_notional_usd == 0
    assert_raises(BadRequest, lambda: OrderRouter({'apiKey': 'k', 'maxNotionalUsd': -1}), 'a negative cap is a typo, not a policy')


@test('the limit price sits on the side that costs you, and only there')
def test_limit_price_side():
    buy = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 1, 100), {'slippageBps': 100})
    assert buy['steps'][0]['limitPrice'] == 101, 'a buy pays up to 1% more'
    sell = router.build_execution_plan(one_leg_route('sell', 'BTC', 'USDT', 1, 100), {'slippageBps': 100})
    assert sell['steps'][0]['limitPrice'] == 99, 'a sell accepts down to 1% less'
    none = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 1, 100), {'slippageBps': 0})
    assert none['steps'][0]['limitPrice'] == 100, 'zero slippage means the expected price'


@test('a cap that IS set binds exactly, at whatever size, and includes the slippage')
def test_notional_cap():
    # amount * limitPrice is what is measured, so a 1% slippage on a 24.90 USD
    # step is what carries it over the line
    capped = {'usdRates': {'USDT': 1}, 'maxNotionalUsd': 25}
    under = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.24, 100), {'slippageBps': 0})
    assert router.check_execution_plan_safety(under, PERMISSIVE_STUB_MARKETS, capped) == [], '24 USD passes a 25 USD cap'
    at = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.25, 100), {'slippageBps': 0})
    assert router.check_execution_plan_safety(at, PERMISSIVE_STUB_MARKETS, capped) == [], 'exactly at the cap passes'
    over = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.2501, 100), {'slippageBps': 0})
    over_violations = router.check_execution_plan_safety(over, PERMISSIVE_STUB_MARKETS, capped)
    assert len(over_violations) == 1
    assert over_violations[0]['code'] == 'notional_exceeds_cap'
    assert over_violations[0]['blocking'] is True
    # and the slippage is inside the measurement, not outside it
    slipped = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.249, 100), {'slippageBps': 100})
    slipped_violations = router.check_execution_plan_safety(slipped, PERMISSIVE_STUB_MARKETS, capped)
    assert len(slipped_violations) == 1, '24.90 USD at 1% slippage is 25.15 USD of risk'
    assert slipped_violations[0]['code'] == 'notional_exceeds_cap'
    # A LARGE cap is honoured just as exactly. This is the case the old hard ceiling
    # made unreachable: 2,000 USD of BTC under a 5,000 USD guardrail is a normal trade.
    large = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 20, 100), {'slippageBps': 0})
    assert router.check_execution_plan_safety(large, PERMISSIVE_STUB_MARKETS, {'usdRates': {'USDT': 1}, 'maxNotionalUsd': 5000}) == [], '2,000 USD under a 5,000 USD cap'
    over_large = router.check_execution_plan_safety(large, PERMISSIVE_STUB_MARKETS, {'usdRates': {'USDT': 1}, 'maxNotionalUsd': 1000})
    assert over_large[0]['code'] == 'notional_exceeds_cap', 'and the same 2,000 USD trips a 1,000 USD cap'


@test('with no cap set, no notional check runs at all')
def test_no_cap_runs_no_notional_check():
    # The default. This class does not decide how much of your money you may trade —
    # the guardrail is opt-in, so a plan of any size passes untouched, and a caller who
    # never asked for a cap is not made to supply usdRates for it.
    large = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 1000, 100), {'slippageBps': 0})
    assert router.check_execution_plan_safety(large, PERMISSIVE_STUB_MARKETS, {'usdRates': {'USDT': 1}}) == [], '100,000 USD passes when no cap is set'
    assert router.check_execution_plan_safety(large, PERMISSIVE_STUB_MARKETS, {}) == [], 'and needs no usdRates at all'


@test('a step that cannot be valued in USD BLOCKS when a cap is in force — it is never skipped')
def test_unvaluable_blocks():
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.0001, 100), {'slippageBps': 0})
    # 0.01 USDT of notional: trivially under the cap, and still refused, because the
    # point is that the cap the caller ASKED FOR could not be evaluated. With no cap
    # set there is nothing to enforce and this same plan passes — see the test above.
    violations = router.check_execution_plan_safety(plan, PERMISSIVE_STUB_MARKETS, {'usdRates': {}, 'maxNotionalUsd': 25})
    assert len(violations) == 1
    assert violations[0]['code'] == 'notional_unvaluable'
    assert violations[0]['blocking'] is True, 'an unvaluable step must block, or the cap is decorative'
    # unrelated rates do not help
    still_blocked = router.check_execution_plan_safety(plan, PERMISSIVE_STUB_MARKETS, {'usdRates': {'ETH': 3000, 'DOGE': 0.09}, 'maxNotionalUsd': 25})
    assert still_blocked[0]['code'] == 'notional_unvaluable'
    # either side of the market resolves it
    assert router.check_execution_plan_safety(plan, PERMISSIVE_STUB_MARKETS, {'usdRates': {'USDT': 1}, 'maxNotionalUsd': 25}) == []
    assert router.check_execution_plan_safety(plan, PERMISSIVE_STUB_MARKETS, {'usdRates': {'BTC': 100}, 'maxNotionalUsd': 25}) == []


@test('USDT is not assumed to be one dollar; USD is')
def test_usdt_is_not_usd():
    usdt_plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.1, 100), {'slippageBps': 0})
    usdt_violations = router.check_execution_plan_safety(usdt_plan, PERMISSIVE_STUB_MARKETS, {'usdRates': {'USD': 1}, 'maxNotionalUsd': 25})
    assert len(usdt_violations) == 1
    assert usdt_violations[0]['code'] == 'notional_unvaluable', 'a stablecoin peg is an observation, not a definition'
    # a depegged rate is respected: 10 USDT at 0.40 is 4 USD
    assert router.check_execution_plan_safety(usdt_plan, PERMISSIVE_STUB_MARKETS, {'usdRates': {'USDT': 0.4}, 'maxNotionalUsd': 25}) == []


@test('an empty plan is not a safe plan')
def test_empty_plan():
    plan = router.build_execution_plan(fixture['routes']['unroutable'], {})
    assert len(plan['steps']) == 0
    violations = router.check_execution_plan_safety(plan, PERMISSIVE_STUB_MARKETS, {'usdRates': {'USDT': 1}})
    assert len(violations) == 1
    assert violations[0]['code'] == 'empty_plan'
    assert violations[0]['blocking'] is True, 'zero violations on zero steps would read as approval'


@test('reconcile_execution_step never scales a downstream order UP')
def test_never_scales_up():
    plan = router.build_execution_plan(fixture['routes']['multiHop'], {})
    overfilled = router.reconcile_execution_step(plan, 0, 1000000)
    assert overfilled['scale'] == 1, 'an overfill must not grow an order the safety check never saw'
    assert overfilled['verdict'] == 'proceed'
    downstream = overfilled['resizedSteps'][0]
    assert downstream['amount'] == downstream['previousAmount']


@test('reconcile_execution_step halts on a total miss and on an over-tolerance shortfall')
def test_reconcile_halts():
    plan = router.build_execution_plan(fixture['routes']['multiHop'], {})
    assert router.reconcile_execution_step(plan, 0, 0)['verdict'] == 'halt'
    assert router.reconcile_execution_step(plan, 0, 0)['reason'] == 'nothing_filled'
    # expectedOut of step 0 is 500 * 0.089 = 44.5; 2% of that is 0.89
    assert router.reconcile_execution_step(plan, 0, 44.5 - 0.88)['verdict'] == 'proceed'
    assert router.reconcile_execution_step(plan, 0, 44.5 - 0.9)['verdict'] == 'halt'
    assert router.reconcile_execution_step(plan, 0, 44.5 - 0.9)['reason'] == 'shortfall_exceeds_tolerance'
    assert_raises(BadRequest, lambda: router.reconcile_execution_step(plan, 7, 1), 'an out-of-range stepIndex')


@test('build_unwind_plan is never automatic and never nets across venues')
def test_unwind_never_automatic():
    unwind = router.build_unwind_plan(fixture['reports']['haltedCrossVenue'])
    assert unwind['requiresConfirmation'] is True
    assert unwind['automatic'] is False
    assert unwind['residualCount'] == 2, 'the mexc USDT and the binance SOL are separate positions'
    # the USDT sold on mexc and the USDT spent on binance are NOT the same money,
    # because this class never moves funds between venues
    venues = [unwind['steps'][0]['exchangeId'], unwind['steps'][1]['exchangeId']]
    assert venues == ['binance', 'mexc'], 'unwound in reverse execution order'
    assert unwind['steps'][1]['side'] == 'buy', 'leftover quote is spent buying the asset back'
    assert unwind['steps'][1]['reachesFrom'] is True
    assert unwind['steps'][0]['side'] == 'sell', 'leftover base is sold back'
    assert unwind['steps'][0]['reachesFrom'] is False, 'selling SOL for USDT is not yet DOGE'


@test('a buy-side unwind order never spends more quote than the residual actually holds')
def test_unwind_buy_is_fundable():
    # The residual IS the budget. Sizing the buy at the expected price and then
    # pricing it slippage above that orders more quote than the venue is holding:
    # 44.5 USDT at 0.089 is 500 DOGE, but 500 DOGE at the 0.0892225 limit costs
    # 44.61125 - the venue rejects it for insufficient funds, or partially fills
    # and leaves the rest of the stranded money stranded on a halted route.
    unwind = router.build_unwind_plan(fixture['reports']['haltedCrossVenue'])
    buy = unwind['steps'][1]
    assert buy['side'] == 'buy'
    residual = 44.5
    spend = buy['amount'] * buy['limitPrice']
    assert spend <= residual + 1e-9, 'buy spends ' + str(spend) + ' of a ' + str(residual) + ' residual'
    # and it does not leave the residual pointlessly unspent either
    assert spend >= residual - 1e-9, 'buy spends ' + str(spend) + ', short of the ' + str(residual) + ' residual'
    # the notional the safety cap sees must be that same real spend
    assert numbers_match(buy['notionalQuote'], spend), 'notionalQuote is priced at the limit the order is placed at'
    # the sell side is sized on the residual itself - there is no budget to run out of
    sell = unwind['steps'][0]
    assert sell['side'] == 'sell'
    assert sell['amount'] == 0.2, 'the whole 0.2 SOL residual is sold'
    assert numbers_match(sell['notionalQuote'], 0.2 * sell['limitPrice'])


@test('build_unwind_plan reverses the step that PRODUCED a residual, never one that consumed it')
def test_unwind_sources_the_producing_step():
    # The shared fixture has no report where one venue's asset is CONSUMED by a
    # later step and PRODUCED by an earlier one, which is the only shape that
    # tells the two candidate sources apart. This report has it: hop 0 sold DOGE
    # into 44.5 USDT on mexc and hop 1 spent 20 of that USDT on SOL, leaving
    # 24.5 USDT stranded there. The expectations below were cross-checked
    # against ts/src/base/OrderRouter.ts and agree with it exactly.
    report = {
        'from': 'DOGE',
        'to': 'SOL',
        'halted': True,
        'haltReason': 'order_failed',
        'slippageBps': 25,
        'steps': [
            {'exchangeId': 'mexc', 'symbol': 'DOGE/USDT', 'side': 'sell', 'averagePrice': 0.089, 'inAsset': 'DOGE', 'inAmount': 500, 'outAsset': 'USDT', 'outAmount': 44.5},
            {'exchangeId': 'mexc', 'symbol': 'SOL/USDT', 'side': 'buy', 'averagePrice': 200, 'inAsset': 'USDT', 'inAmount': 20, 'outAsset': 'SOL', 'outAmount': 0.1},
        ],
    }
    unwind = router.build_unwind_plan(report)
    assert unwind['residualCount'] == 2, 'the leftover USDT and the bought SOL are both stranded'
    leftover = unwind['steps'][1]
    assert leftover['asset'] == 'USDT'
    assert numbers_match(leftover['amount'], 24.5 / (0.089 * 1.0025)), '24.5 USDT at the 0.0892225 limit buys back 274.6 DOGE'
    # sourcing the CONSUMING step instead would emit sell 24.5 SOL on SOL/USDT:
    # the wrong side of the wrong market, in an asset you do not hold
    assert leftover['symbol'] == 'DOGE/USDT', 'the market that produced the residual'
    assert leftover['side'] == 'buy', 'leftover quote buys the base back'
    assert leftover['base'] == 'DOGE' and leftover['quote'] == 'USDT'
    assert leftover['counterAsset'] == 'DOGE'
    assert leftover['reachesFrom'] is True, 'one hop from the stranded USDT back to DOGE'


# ---------------------------------------------------------------------------
# 3. execute — stub venues only, and not one real order anywhere
# ---------------------------------------------------------------------------

class StubVenue:

    def __init__(self, id, fill_ratio=1, fail_create=False):
        self.id = id
        self.fill_ratio = fill_ratio
        self.fail_create = fail_create
        self.calls = []
        self.markets = PERMISSIVE_STUB_MARKETS['stub']
        self.features = {'spot': {'createOrder': {'timeInForce': ['GTC', 'IOC']}}}
        # a queue of orders fetch_order hands back, one per poll; empty means the
        # created order comes back closed on the first read
        self.fetch_order_results = []
        self.fetch_order_throws = False
        self.cancel_throws = False
        self.created_status = ''

    def fetch_order(self, id, symbol):
        self.calls.append('fetchOrder:' + id)
        if self.fetch_order_throws:
            raise ExchangeError('stub cannot read the order back')
        if len(self.fetch_order_results) > 0:
            return self.fetch_order_results.pop(0)
        return {'id': id, 'status': 'closed', 'filled': 0, 'average': 0, 'cost': 0}

    def cancel_order(self, id, symbol):
        self.calls.append('cancelOrder:' + id)
        if self.cancel_throws:
            raise ExchangeError('stub refuses to cancel')
        return {'id': id, 'status': 'canceled'}

    def load_markets(self):
        self.calls.append('loadMarkets')
        return self.markets

    def amount_to_precision(self, symbol, amount):
        return str(amount)

    def price_to_precision(self, symbol, price):
        return str(price)

    def fetch_balance(self):
        self.calls.append('fetchBalance')
        return {'free': {'USDT': 1000, 'BTC': 1, 'ZERO': 0}, 'total': {'USDT': 1000, 'BTC': 1}}

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.calls.append('createOrder:' + type + ':' + side + ':' + str(amount))
        if self.fail_create:
            raise ExchangeError('stub refuses')
        filled = amount * self.fill_ratio
        average = 100 if price is None else price
        status = 'closed' if self.created_status == '' else self.created_status
        return {'id': 'stub-order', 'status': status, 'filled': filled, 'average': average, 'cost': filled * average}


def two_hop_route():
    return {
        'from': 'USDT',
        'to': 'SOL',
        'strategy': 'best_single',
        'exactSide': 'in',
        'amountIn': 20,
        'amountOut': 0.2,
        'fullyFillable': True,
        'fillRatio': 1,
        'unroutableReason': None,
        'hops': [
            {'pair': 'BTC/USDT', 'side': 'buy', 'base': 'BTC', 'quote': 'USDT', 'amountIn': 20, 'amountOut': 0.2, 'legs': [{'exchangeId': 'stub', 'amount': 0.2, 'averagePrice': 100, 'effectivePrice': 100}]},
            {'pair': 'BTC/USDT', 'side': 'sell', 'base': 'BTC', 'quote': 'USDT', 'amountIn': 0.2, 'amountOut': 20, 'legs': [{'exchangeId': 'stub', 'amount': 0.2, 'averagePrice': 100, 'effectivePrice': 100}]},
        ],
    }


@test('dry_run is the default: a live-looking call with live unset places nothing')
def test_dry_run_is_the_default():
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), {})
    venue = StubVenue('stub')
    # everything a real call would carry, EXCEPT live
    report = router.execute(plan, {'stub': venue}, {
        'strategy': 'sequential',
        'usdRates': {'USDT': 1},
        'allowMarketOrders': True,
    })
    assert report['dryRun'] is True
    assert report['strategy'] == 'dry_run'
    assert report['requestedStrategy'] == 'sequential', 'the report says what was asked for as well as what happened'
    assert report['ordersPlaced'] == 0
    assert report['wouldPlaceOrders'] == 1
    assert report['steps'][0]['status'] == 'planned'
    assert venue.calls == [], 'not one call reached the venue — not even a read'
    # live: False, None, 'true' and 1 are all not-true
    for not_live in [False, None, 'true', 1]:
        other = StubVenue('stub')
        again = router.execute(plan, {'stub': other}, {'strategy': 'sequential', 'live': not_live, 'usdRates': {'USDT': 1}})
        assert again['dryRun'] is True, 'live must be exactly True'
        assert other.calls == []


@test('execute refuses to go live without a way to value the trade in USD — when a cap is set')
def test_live_needs_usd_rates():
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), {})
    venue = StubVenue('stub')
    assert_raises(ExchangeError, lambda: router.execute(plan, {'stub': venue}, {'strategy': 'sequential', 'live': True, 'maxNotionalUsd': 25}), 'an unvaluable plan')
    assert 'createOrder:limit:buy:0.2' not in venue.calls, 'no order was placed'
    # and with NO cap asked for, usdRates is not required: there is no cap to evaluate,
    # so demanding the inputs for one would be asking for something nobody wanted.
    uncapped = StubVenue('stub')
    report = router.execute(plan, {'stub': uncapped}, {'strategy': 'sequential', 'live': True})
    assert report['steps'][0]['status'] == 'filled'


@test('execute refuses to go live above a cap the caller set')
def test_live_refuses_above_the_cap():
    # 500 USD against a 25 USD guardrail. The refusal happens BEFORE any order goes
    # out, which is the property worth asserting — a cap checked after the fact is
    # an incident report, not a guardrail.
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 5, 100), {})
    venue = StubVenue('stub')
    assert_raises(ExchangeError, lambda: router.execute(plan, {'stub': venue}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}, 'maxNotionalUsd': 25}), 'a 500 USD step')
    for call in venue.calls:
        assert call.find('createOrder') < 0, 'no order was placed'
    # the same 500 USD trade with no cap set goes through: that is the point of the
    # guardrail being opt-in
    uncapped = StubVenue('stub')
    report = router.execute(plan, {'stub': uncapped}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}})
    assert report['steps'][0]['status'] == 'filled', '500 USD is a normal trade when nobody asked for a cap'


@test('sequential places IOC limit orders in plan order')
def test_sequential_places_ioc():
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), {'slippageBps': 100})
    venue = StubVenue('stub')
    report = router.execute(plan, {'stub': venue}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}})
    assert report['dryRun'] is False
    assert report['ordersPlaced'] == 1
    assert report['steps'][0]['status'] == 'filled'
    assert report['steps'][0]['outAsset'] == 'BTC'
    assert report['steps'][0]['outAmount'] == 0.2
    assert report['steps'][0]['inAsset'] == 'USDT'
    assert venue.calls == ['createOrder:limit:buy:0.2']
    assert report['halted'] is False


@test('sequential obeys the halt verdict and never starts the next hop')
def test_sequential_halts():
    plan = router.build_execution_plan(two_hop_route(), {})
    # hop 0 fills half: a 50% shortfall against a 2% tolerance
    venue = StubVenue('stub', 0.5)
    report = router.execute(plan, {'stub': venue}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}})
    assert report['halted'] is True
    assert report['haltReason'] == 'shortfall_exceeds_tolerance'
    assert report['haltStepIndex'] == 0
    assert report['ordersPlaced'] == 1, 'the second hop was never attempted'
    assert report['steps'][1]['status'] == 'skipped'
    assert len(venue.calls) == 1
    # and the halted report is exactly what build_unwind_plan is for
    unwind = router.build_unwind_plan(report)
    assert unwind['residualCount'] == 1
    assert unwind['steps'][0]['side'] == 'sell', 'the BTC bought on hop 0 goes back to USDT'
    assert unwind['steps'][0]['reachesFrom'] is True


@test('a market order needs BOTH a venue that cannot do IOC and an explicit opt-in')
def test_market_orders_need_two_keys():
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), {})
    # a venue that advertises GTC only
    no_ioc = StubVenue('stub')
    no_ioc.features = {'spot': {'createOrder': {'timeInForce': ['GTC']}}}
    refused = router.execute(plan, {'stub': no_ioc}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}})
    assert refused['steps'][0]['status'] == 'failed'
    assert refused['steps'][0]['errorCode'] == 'NotSupported'
    assert no_ioc.calls == [], 'defaulting to a market order is the decision the caller did not delegate'
    allowed = StubVenue('stub')
    allowed.features = {'spot': {'createOrder': {'timeInForce': ['GTC']}}}
    placed = router.execute(plan, {'stub': allowed}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}, 'allowMarketOrders': True})
    assert placed['steps'][0]['status'] == 'filled'
    assert allowed.calls == ['createOrder:market:buy:0.2']
    # ...but not under a cap. assert_under_cap values the order at the plan's LIMIT price and the
    # market call sends no price at all, so passing the check and then removing the price it was
    # computed from is a cap that silently disappears. The two options are refused together.
    capped = StubVenue('stub')
    capped.features = {'spot': {'createOrder': {'timeInForce': ['GTC']}}}
    under_cap = router.execute(plan, {'stub': capped}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}, 'allowMarketOrders': True, 'maxNotionalUsd': 1000})
    assert under_cap['steps'][0]['status'] == 'failed'
    assert under_cap['steps'][0]['errorCode'] == 'NotSupported'
    assert capped.calls == [], 'refused BEFORE dispatch: a cap checked against a price that is then discarded is worse than no cap'
    # a venue that says nothing about timeInForce is assumed to do IOC: a
    # rejected IOC is loud and cheap, an unintended market order is not
    unknown = StubVenue('stub')
    unknown.features = {}
    assumed = router.execute(plan, {'stub': unknown}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}})
    assert assumed['steps'][0]['status'] == 'filled'
    assert unknown.calls == ['createOrder:limit:buy:0.2']


@test('parallel_within_hop contains a failing leg instead of abandoning its siblings')
def test_parallel_contains_failures():
    route = one_leg_route('buy', 'BTC', 'USDT', 0.1, 100)
    route['hops'][0]['legs'] = [
        {'exchangeId': 'good', 'amount': 0.1, 'averagePrice': 100, 'effectivePrice': 100},
        {'exchangeId': 'bad', 'amount': 0.1, 'averagePrice': 100, 'effectivePrice': 100},
        {'exchangeId': 'good2', 'amount': 0.1, 'averagePrice': 100, 'effectivePrice': 100},
    ]
    plan = router.build_execution_plan(route, {})
    good = StubVenue('good')
    bad = StubVenue('bad', 1, True)
    good2 = StubVenue('good2')
    report = router.execute(plan, {'good': good, 'bad': bad, 'good2': good2}, {'strategy': 'parallel_within_hop', 'live': True, 'usdRates': {'USDT': 1}})
    assert report['steps'][0]['status'] == 'filled'
    assert report['steps'][1]['status'] == 'failed'
    assert report['steps'][2]['status'] == 'filled', 'the sibling behind the failure still ran'
    assert len(report['errors']) == 1
    assert report['errors'][0]['exchangeId'] == 'bad'
    assert report['halted'] is True, 'a failed leg still halts the route after the hop settles'
    assert report['haltReason'] == 'order_failed'


@test('best_effort refuses multi-hop and demands both of its acknowledgements')
def test_best_effort_refusals():
    multi_hop = router.build_execution_plan(two_hop_route(), {})
    venue = StubVenue('stub')
    assert_raises(NotSupported, lambda: router.execute(multi_hop, {'stub': venue}, {'strategy': 'best_effort', 'live': True, 'usdRates': {'USDT': 1}, 'acknowledgeDispersion': True, 'maxOrders': 5}), 'best_effort multi-hop')
    single_hop = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), {})
    assert_raises(BadRequest, lambda: router.execute(single_hop, {'stub': venue}, {'strategy': 'best_effort', 'live': True, 'usdRates': {'USDT': 1}, 'maxOrders': 5}), 'without acknowledgeDispersion')
    assert_raises(BadRequest, lambda: router.execute(single_hop, {'stub': venue}, {'strategy': 'best_effort', 'live': True, 'usdRates': {'USDT': 1}, 'acknowledgeDispersion': True}), 'without maxOrders')
    assert venue.calls == []


@test('best_effort stops at maxOrders and never halts')
def test_best_effort_max_orders():
    route = one_leg_route('buy', 'BTC', 'USDT', 0.1, 100)
    route['hops'][0]['legs'] = [
        {'exchangeId': 'a', 'amount': 0.1, 'averagePrice': 100, 'effectivePrice': 100},
        {'exchangeId': 'b', 'amount': 0.1, 'averagePrice': 100, 'effectivePrice': 100},
        {'exchangeId': 'c', 'amount': 0.1, 'averagePrice': 100, 'effectivePrice': 100},
    ]
    plan = router.build_execution_plan(route, {})
    venues = {'a': StubVenue('a'), 'b': StubVenue('b', 0.01), 'c': StubVenue('c')}
    report = router.execute(plan, venues, {'strategy': 'best_effort', 'live': True, 'usdRates': {'USDT': 1}, 'acknowledgeDispersion': True, 'maxOrders': 2})
    assert report['ordersPlaced'] == 2
    assert report['steps'][2]['status'] == 'skipped'
    assert report['steps'][2]['errorCode'] == 'max_orders_reached'
    assert report['halted'] is False, 'a 1% fill on leg b does not stop best_effort — that is the whole strategy'
    assert venues['c'].calls == []


@test('a per-call cap overrides the client-level one, in both directions')
def test_per_call_cap_overrides():
    # The cap is a guardrail the CALLER sets, so the per-call value wins — there is no
    # ceiling re-imposed behind their back. Both directions are asserted because the
    # old implementation clamped one way only, and a guardrail that silently refuses to
    # loosen is as surprising as one that silently refuses to tighten.
    client = OrderRouter({'apiKey': 'k', 'maxNotionalUsd': 100})
    # 0.005 BTC at 100000 USDT is 500 USD
    plan = client.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.005, 100000), {'slippageBps': 0})
    under_client_cap = client.check_execution_plan_safety(plan, PERMISSIVE_STUB_MARKETS, {'usdRates': {'USDT': 1}})
    assert under_client_cap[0]['code'] == 'notional_exceeds_cap', '500 USD trips the client cap of 100'
    assert under_client_cap[0]['limit'] == 100
    # raised for this call
    assert client.check_execution_plan_safety(plan, PERMISSIVE_STUB_MARKETS, {'usdRates': {'USDT': 1}, 'maxNotionalUsd': 1000}) == [], 'a per-call cap of 1000 lets it through'
    # lowered for this call
    tightened = client.check_execution_plan_safety(plan, PERMISSIVE_STUB_MARKETS, {'usdRates': {'USDT': 1}, 'maxNotionalUsd': 10})
    assert tightened[0]['limit'] == 10
    # and the last check before an order goes out honours the same value
    assert_raises(ExchangeError, lambda: client.assert_under_cap(plan['steps'][0], 0.005, 100000, {'USDT': 1}, {'maxNotionalUsd': 100}), 'the last check before an order goes out refuses too')
    client.assert_under_cap(plan['steps'][0], 0.005, 100000, {'USDT': 1}, {'maxNotionalUsd': 1000})


@test('best_effort derives the hop count from the steps, not from a key the plan may not carry')
def test_best_effort_derives_hop_count():
    # a plan that travelled through JSON, was rebuilt from persisted steps, or is
    # the tail of a halted route can be missing hopCount entirely
    complete = router.build_execution_plan(two_hop_route(), {})
    without_hop_count = {}
    for key in complete:
        if key != 'hopCount':
            without_hop_count[key] = complete[key]
    assert 'hopCount' not in without_hop_count, 'the plan really has no hopCount'
    assert len(without_hop_count['steps']) == 2
    venue = StubVenue('stub', 0.1)
    assert_raises(NotSupported, lambda: router.execute(without_hop_count, {'stub': venue}, {'strategy': 'best_effort', 'live': True, 'usdRates': {'USDT': 1}, 'acknowledgeDispersion': True, 'maxOrders': 5}), 'best_effort across a bridge is refused however the plan reached us')
    assert venue.calls == [], 'not one order was placed'


@test('venue_supports_ioc reads the dictionary of booleans every real exchange declares')
def test_venue_supports_ioc_dictionary():
    no_ioc = StubVenue('stub')
    # the shape ccxt actually uses: features.spot.createOrder.timeInForce is a
    # dictionary, never a list. bit2c, bitbank, bithumb and coinone all say
    # IOC: False, and reading this as a list answered "yes" for every one.
    no_ioc.features = {'spot': {'createOrder': {'timeInForce': {'IOC': False, 'FOK': False, 'PO': False, 'GTD': False, 'GTC': True}}}}
    assert router.venue_supports_ioc(no_ioc) is False
    with_ioc = StubVenue('stub')
    with_ioc.features = {'spot': {'createOrder': {'timeInForce': {'IOC': True, 'FOK': True, 'PO': True, 'GTD': False, 'GTC': True}}}}
    assert router.venue_supports_ioc(with_ioc) is True
    # a dictionary that enumerates its values and omits IOC has said no
    silent_about_ioc = StubVenue('stub')
    silent_about_ioc.features = {'spot': {'createOrder': {'timeInForce': {'GTC': True}}}}
    assert router.venue_supports_ioc(silent_about_ioc) is False
    # and a venue that says nothing at all is still assumed to do IOC
    silent = StubVenue('stub')
    silent.features = {}
    assert router.venue_supports_ioc(silent) is True
    # end to end: the documented market-order fallback is reachable again
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), {})
    refused = router.execute(plan, {'stub': no_ioc}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}})
    assert refused['steps'][0]['errorCode'] == 'NotSupported'
    assert no_ioc.calls == [], 'an IOC was never sent to a venue that cannot do one'
    allowed = StubVenue('stub')
    allowed.features = no_ioc.features
    placed = router.execute(plan, {'stub': allowed}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}, 'allowMarketOrders': True})
    assert placed['steps'][0]['status'] == 'filled'
    assert allowed.calls == ['createOrder:market:buy:0.2']


@test('limit_protected refuses a non-positive pollIntervalMs before placing anything')
def test_limit_protected_refuses_a_zero_poll_interval():
    # The poll loop advances its clock by pollIntervalMs, so 0 never reaches the timeout: it spins
    # on fetch_order forever with a real order resting on a real venue, and the timeout that exists
    # to cancel that order never arrives. Refused BEFORE create_order — refusing afterwards would
    # leave the very order the loop could not clean up.
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), {'slippageBps': 0})
    for interval in [0, -1]:
        venue = StubVenue('stub')
        venue.created_status = 'open'
        assert_raises(BadRequest, lambda: router.execute(plan, {'stub': venue}, {'strategy': 'limit_protected', 'live': True, 'usdRates': {'USDT': 1}, 'orderTimeoutMs': 4, 'pollIntervalMs': interval}), 'pollIntervalMs ' + str(interval))
        assert venue.calls == [], 'nothing may reach the venue'
    ok = StubVenue('stub')
    ok.created_status = 'open'
    ok.fetch_order_results = [{'id': 'stub-order', 'status': 'closed', 'filled': 0.0002, 'average': 100000, 'cost': 20}]
    report = router.execute(plan, {'stub': ok}, {'strategy': 'limit_protected', 'live': True, 'usdRates': {'USDT': 1}, 'orderTimeoutMs': 4, 'pollIntervalMs': 1})
    assert report['steps'][0]['status'] == 'filled'


@test('limit_protected keeps the fill from an order the venue canceled on the last poll')
def test_limit_protected_keeps_a_venue_side_cancel_fill():
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), {'slippageBps': 0})
    venue = StubVenue('stub')
    venue.created_status = 'open'
    # the venue ends the order itself between the last two polls — an expiry, a
    # self-trade prevention, a post-only rejection of the remainder — and it
    # carries a real partial fill
    venue.fetch_order_results = [
        {'id': 'stub-order', 'status': 'open', 'filled': 0, 'average': 0, 'cost': 0},
        {'id': 'stub-order', 'status': 'canceled', 'filled': 0.0001, 'average': 100000, 'cost': 10},
    ]
    venue.cancel_throws = True
    report = router.execute(plan, {'stub': venue}, {'strategy': 'limit_protected', 'live': True, 'usdRates': {'USDT': 1}, 'orderTimeoutMs': 2, 'pollIntervalMs': 1})
    assert 'cancelOrder:stub-order' not in venue.calls, 'an order the venue already closed is not cancelled again'
    assert report['steps'][0]['status'] == 'partial'
    assert report['steps'][0]['filledAmount'] == 0.0001
    assert report['steps'][0]['outAmount'] == 0.0001
    assert report['steps'][0]['orderId'] == 'stub-order'
    assert report['openOrders'] == [], 'nothing is open: the venue closed it'
    # and the 0.0001 BTC that was actually bought reaches the unwind plan
    unwind = router.build_unwind_plan(report)
    assert unwind['residualCount'] == 1, 'a real position must never be invisible to the unwind path'
    assert unwind['steps'][0]['amount'] == 0.0001


@test('a failure after create_order still reports the order id and an open order')
def test_order_id_survives_a_failure_after_create():
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), {'slippageBps': 0})
    venue = StubVenue('stub')
    venue.created_status = 'open'
    # create_order succeeded; the first poll never comes back
    venue.fetch_order_throws = True
    report = router.execute(plan, {'stub': venue}, {'strategy': 'limit_protected', 'live': True, 'usdRates': {'USDT': 1}, 'orderTimeoutMs': 4, 'pollIntervalMs': 1})
    #  NOT 'failed'. A step whose id is known had create_order RETURN, so an order exists;
    #  calling that "failed" reads as "nothing happened" while openOrders, three lines down, says
    #  the opposite. One report must not carry both readings.
    assert report['steps'][0]['status'] == 'outcome_unknown'
    assert report['haltReason'] == 'outcome_unknown', 'and the halt names the ambiguity rather than claiming an outright failure'
    assert report['steps'][0]['orderId'] == 'stub-order', 'the id is captured the instant create_order returns, not after the read'
    assert len(report['openOrders']) == 1, 'a live order the caller cannot see is the worst outcome there is'
    assert report['openOrders'][0]['orderId'] == 'stub-order'
    assert report['openOrders'][0]['exchangeId'] == 'stub'
    assert report['openOrders'][0]['reason'] == 'outcome_unknown'
    # the same holds for an immediate order, which has no poll loop at all
    other = StubVenue('stub')
    other.created_status = 'open'
    ok_report = router.execute(plan, {'stub': other}, {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}})
    assert ok_report['steps'][0]['orderId'] == 'stub-order'
    # and an "immediate" order the venue reports as STILL OPEN is a resting
    # order - which is what a venue that silently drops timeInForce leaves you.
    # It is cancelled and re-read, so nothing is left resting to report.
    assert 'cancelOrder:stub-order' in other.calls, 'a resting order is cancelled, not merely noted'
    assert len(ok_report['openOrders']) == 0, 'the cancel and the re-read settled it'


@test('a resting order on an immediate path is cancelled, and a cancel that fails halts the route')
def _():
    # A venue that silently drops timeInForce turns an immediate-or-cancel order
    # into a plain resting limit order. Recording it and continuing means the next
    # hop is sized on a fill that is still growing behind it, and the leftover
    # order stays live on a real venue after the route has returned and nobody is
    # watching it.
    for strategy in ['sequential', 'parallel_within_hop', 'best_effort']:
        options = {'strategy': strategy, 'live': True, 'usdRates': {'USDT': 1}}
        if strategy == 'best_effort':
            options['acknowledgeDispersion'] = True
            options['maxOrders'] = 4
        # 1. the cancel works: the order is gone, the re-read is what gets reported
        venue = StubVenue('stub')
        venue.created_status = 'open'
        venue.fetch_order_results = [{'id': 'stub-order', 'status': 'canceled', 'filled': 0.0001, 'average': 100000, 'cost': 10}]
        plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), {'slippageBps': 0})
        report = router.execute(plan, {'stub': venue}, options)
        assert 'cancelOrder:stub-order' in venue.calls, strategy + ': the resting order is cancelled'
        assert len(report['openOrders']) == 0, strategy + ': nothing is left resting'
        # the re-read is authoritative - the cancel and a fill crossed
        assert report['steps'][0]['filledAmount'] == 0.0001, strategy + ': the fill observed AFTER the cancel is the one reported'
        assert report['steps'][0]['status'] == 'partial', strategy + ': a real partial fill, not an unknown'
        # 2. the cancel fails: the order can still fill in full after this returns,
        #    so nothing downstream may be sized on what was observed
        stubborn = StubVenue('stub')
        stubborn.created_status = 'open'
        stubborn.cancel_throws = True
        plan2 = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), {'slippageBps': 0})
        failed = router.execute(plan2, {'stub': stubborn}, options)
        assert failed['steps'][0]['status'] == 'outcome_unknown', strategy + ': an uncancellable resting order is never a settled step'
        assert len(failed['openOrders']) == 1, strategy + ': the operator is told what is still live'
        assert failed['openOrders'][0]['orderId'] == 'stub-order'
        assert failed['openOrders'][0]['reason'] == 'cancel_failed'
        # 3. the cancel is accepted and the venue still calls it open: same rule
        ghost = StubVenue('stub')
        ghost.created_status = 'open'
        ghost.fetch_order_results = [{'id': 'stub-order', 'status': 'open', 'filled': 0, 'average': 0, 'cost': 0}]
        plan3 = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.0002, 100000), {'slippageBps': 0})
        still_open = router.execute(plan3, {'stub': ghost}, options)
        assert still_open['steps'][0]['status'] == 'outcome_unknown', strategy + ': a cancel the venue ignored leaves the outcome unknown'
        assert len(still_open['openOrders']) == 1
        assert still_open['openOrders'][0]['reason'] == 'still_open'


@test('a plan carries its age, and a stale one is refused only when asked')
def _():
    # A plan is a snapshot of a book. `calculatedAt` was carried on every plan and read by nothing,
    # so execute() would happily trade an hour-old plan at hour-old prices — and the notional cap,
    # computed from those same prices, was just as stale.
    route = one_leg_route('buy', 'BTC', 'USDT', 0.2, 100)
    route['calculatedAt'] = 1000000
    plan = router.build_execution_plan(route, {})
    pinned = OrderRouter({'apiKey': 'k'})
    pinned.now_ms = lambda: 1060000   # the plan is exactly 60s old
    opts = {'strategy': 'sequential', 'live': True, 'usdRates': {'USDT': 1}}

    # Always reported, even with nothing enforced, and nothing is refused by default: this class
    # does not decide how stale a plan the caller may trade on.
    report = pinned.execute(plan, {'stub': StubVenue('stub')}, opts)
    assert report['planAgeMs'] == 60000, 'the age is on the report whether or not it is checked'
    assert report['steps'][0]['status'] == 'filled'

    # Enforced exactly, at whatever value is asked for.
    strict = StubVenue('stub')
    try:
        pinned.execute(plan, {'stub': strict}, dict(opts, maxPlanAgeMs=30000))
        raise AssertionError('a stale plan must be refused under a limit')
    except ExchangeError as e:
        assert 'older than maxPlanAgeMs' in str(e)
    assert strict.calls == [], 'refused before anything reached the venue'
    passed = pinned.execute(plan, {'stub': StubVenue('stub')}, dict(opts, maxPlanAgeMs=120000))
    assert passed['steps'][0]['status'] == 'filled'

    # An age that cannot be determined BLOCKS under an active limit: a freshness check that
    # silently passes when the timestamp is missing is not a freshness check.
    undated = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), {})
    undated_report = pinned.execute(undated, {'stub': StubVenue('stub')}, opts)
    assert undated_report['planAgeMs'] == -1, 'unknown is -1, never 0: 0 would read as fresh'
    try:
        pinned.execute(undated, {'stub': StubVenue('stub')}, dict(opts, maxPlanAgeMs=30000))
        raise AssertionError('an undatable plan must be refused under a limit')
    except ExchangeError as e:
        assert 'carries no calculatedAt' in str(e)


@test('an unknown strategy is refused even in dry run')
def test_unknown_strategy():
    plan = router.build_execution_plan(one_leg_route('buy', 'BTC', 'USDT', 0.2, 100), {})
    assert_raises(BadRequest, lambda: router.execute(plan, {}, {'strategy': 'yolo'}), 'an unknown strategy')


@test('atomic_ish demands the whole route pre-funded')
def test_atomic_ish_prefunding():
    plan = router.build_execution_plan(two_hop_route(), {})
    poor = StubVenue('stub')
    # hop 0 needs 20 USDT and hop 1 needs 0.2 BTC, both already sitting there
    rich = router.execute(plan, {'stub': poor}, {'strategy': 'atomic_ish', 'live': True, 'usdRates': {'USDT': 1}})
    assert rich['ordersPlaced'] == 2, 'a pre-funded route runs end to end'
    broke = StubVenue('stub')
    broke.fetch_balance = lambda: {'free': {'USDT': 1, 'BTC': 0}}
    assert_raises(ExchangeError, lambda: router.execute(plan, {'stub': broke}, {'strategy': 'atomic_ish', 'live': True, 'usdRates': {'USDT': 1}}), 'an underfunded route')


# ---------------------------------------------------------------------------
# 4. fetch_route request shaping and fetch_route_with_balances, with the HTTP
#    layer stubbed out — no network
# ---------------------------------------------------------------------------

class RecordingRouter(OrderRouter):

    def __init__(self, config, body):
        super(RecordingRouter, self).__init__(config)
        self.body = body
        self.last_url = ''

    def request(self, url):
        self.last_url = url
        return self.body


@test('fetch_route refuses neither-or-both amounts before touching the network')
def test_fetch_route_amount_exclusivity():
    recorder = RecordingRouter({'apiKey': 'k'}, {})
    assert_raises(BadRequest, lambda: recorder.fetch_route('USDT', 'BTC', {}), 'neither amount')
    assert_raises(BadRequest, lambda: recorder.fetch_route('USDT', 'BTC', {'amountIn': 1, 'amountOut': 1}), 'both amounts')
    assert recorder.last_url == '', 'neither reached the wire'


@test('fetch_route builds a deterministic query')
def test_fetch_route_query():
    recorder = RecordingRouter({'apiKey': 'k', 'baseUrl': 'https://example.test/api/'}, {'hops': []})
    recorder.fetch_route('usdt', 'btc', {'amountIn': 0.001, 'strategy': 'split_capped', 'maxVenues': 3, 'exchanges': ['binance', 'kraken'], 'certified': True})
    assert recorder.last_url == 'https://example.test/api/route?from=USDT&to=BTC&amountIn=0.001&strategy=split_capped&maxVenues=3&exchanges=binance%2Ckraken&certified=true', recorder.last_url


@test('fetch_route_with_balances skips zeros, sorts largest first and reports what it dropped')
def test_fetch_route_with_balances():
    recorder = RecordingRouter({'apiKey': 'k'}, {'hops': [], 'balancesApplied': 'stub.BTC:1,stub.USDT:1000'})
    route = recorder.fetch_route_with_balances('USDT', 'BTC', {'stub': StubVenue('stub')}, {'amountIn': 10})
    assert route['balancesUsed'] == 'stub.USDT:1000,stub.BTC:1', 'largest first, and the ZERO holding is gone'
    assert route['balancesDropped'] == []
    assert recorder.last_url.find('balances=stub.USDT%3A1000%2Cstub.BTC%3A1') >= 0, recorder.last_url


@test('fetch_route_with_balances refuses a route computed against balances the router ignored')
def test_fetch_route_with_balances_requires_echo():
    silent = RecordingRouter({'apiKey': 'k'}, {'hops': []})
    assert_raises(ExchangeError, lambda: silent.fetch_route_with_balances('USDT', 'BTC', {'stub': StubVenue('stub')}, {'amountIn': 10}), 'a router that ignored the balances')
    # and the caller can opt out with their eyes open
    opted = RecordingRouter({'apiKey': 'k'}, {'hops': []})
    route = opted.fetch_route_with_balances('USDT', 'BTC', {'stub': StubVenue('stub')}, {'amountIn': 10, 'requireBalancesApplied': False})
    assert route['balancesUsed'] == 'stub.USDT:1000,stub.BTC:1'


@test('fetch_route_with_balances trims to the router 64-entry cap, dropping the smallest')
def test_fetch_route_with_balances_entry_cap():
    recorder = RecordingRouter({'apiKey': 'k'}, {'hops': [], 'balancesApplied': 'x'})
    many = StubVenue('stub')
    free = {}
    for i in range(70):
        free['C' + str(i)] = i + 1
    many.fetch_balance = lambda: {'free': free}
    route = recorder.fetch_route_with_balances('USDT', 'BTC', {'stub': many}, {'amountIn': 10})
    assert len(route['balancesDropped']) == 6
    assert len(route['balancesUsed'].split(',')) == 64
    for entry in route['balancesDropped']:
        assert entry['reason'] == 'entry_cap'
        assert entry['amount'] <= 6, 'the six smallest holdings are the ones that went'


@test('format_number never emits exponent notation')
def test_format_number():
    assert router.format_number(0.0000001) == '0.0000001'
    assert_raises(BadRequest, lambda: router.format_number(1e21), 'refused rather than rendered as 1e+21 in one language and not the others')
    assert router.format_number(0) == '0'
    assert router.format_number(1000000) == '1000000'
    assert router.format_number(0.5) == '0.5'
    assert router.format_number(1e-15) == '0'


# ---------------------------------------------------------------------------

def test_order_router():
    failures = 0
    for i in range(len(TESTS)):
        name, function = TESTS[i]
        try:
            function()
            print('ok ' + str(i + 1) + ' - ' + name)
        except Exception as e:
            failures = failures + 1
            print('not ok ' + str(i + 1) + ' - ' + name)
            print('  ' + type(e).__name__ + ': ' + str(e))
    print('1..' + str(len(TESTS)))
    if failures > 0:
        raise AssertionError(str(failures) + ' of ' + str(len(TESTS)) + ' OrderRouter tests failed')
    print('OrderRouter tests passed!')


if __name__ == '__main__':
    try:
        test_order_router()
    except AssertionError as error:
        print(str(error))
        sys.exit(1)
