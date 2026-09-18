# -*- coding: utf-8 -*-

# ---------------------------------------------------------------------------
# OrderRouter — a client for the CCXT order-router service, plus the pure
# planning / safety / reconciliation layer that sits between a routing
# recommendation and real orders.
#
# This file is HAND-WRITTEN and is NOT produced by any transpiler. Five sibling
# implementations mirror it method for method:
#
#     ts/src/base/OrderRouter.ts          (the reference)
#     php/OrderRouter.php
#     cs/ccxt/base/OrderRouter.cs
#     go/v4/exchange_order_router.go
#     rust/ccxt-base/src/order_router.rs
#
# The four pure methods — build_execution_plan, check_execution_plan_safety,
# reconcile_execution_step and build_unwind_plan — must return byte-identical
# structures in all six languages for identical input. The shared fixture at
# ts/src/test/base/fixtures/orderRouter.json is what proves it; the Python half
# of that proof lives in python/ccxt/test/base/test_order_router.py.
#
# The rules that keep the six ports honest:
#
#   - plain dictionaries and lists only, never a language-specific container
#   - NO NULLS in any returned structure. 0 means "unknown number", '' means
#     "unknown string", and a boolean companion field carries "was it known?"
#     wherever that distinction is load-bearing
#   - never iterate a hash map to produce ORDERED output. Build lists and search
#     them linearly: map iteration order differs per language
#   - all numbers are IEEE-754 doubles and every arithmetic sequence is written
#     in a fixed order, so the six ports agree bit for bit
#   - ONE number grammar, hand-rolled in all six (see parse_number). No port
#     calls its own parser: float() reads '1_000' as 1000, 'inf' as an infinity
#     and '1,234.5' not at all, while JavaScript's parseFloat reads the leading
#     numeric prefix and nothing else. A cap read as 1234.5 in one language and
#     1 in another is a cap that silently disappears
#   - NaN and +/-inf are NOT numbers here. An infinite tolerance disables the
#     halt verdict and an infinite rate disables the cap, so both fall back to
#     the caller's default — in all six, identically
#   - violation and verdict strings are CONSTANTS, never interpolated with
#     numbers: "25" and "25.0" are the same value and different text
#
# Python-specific notes, and the only three places this port differs in
# MECHANISM (never in semantics) from the TypeScript reference:
#
#   1. It is synchronous, because it lives in the synchronous ccxt package next
#      to precise.py and talks to synchronous exchange instances. Venue calls
#      are the snake_case spellings (fetch_balance, create_order, ...).
#   2. HTTP goes through `requests`, the same client python/ccxt/base/exchange.py
#      uses on the synchronous side.
#   3. parallel_within_hop runs its legs on a ThreadPoolExecutor, which is what
#      "concurrently, then wait for all" means in synchronous Python. place_step
#      still contains its own failures and never raises, so the joined result is
#      the same one the other four languages produce.
#
# Method names and attributes are snake_case, per the shared specification's
# "naming follows each language's convention". DICTIONARY KEYS stay camelCase in
# every language, because they are the cross-language data contract — and they
# match how ccxt already spells config and params in Python.
#
# This class never moves funds between venues. There is no call to any
# funds-transfer endpoint anywhere in it, deliberately and permanently.
# ---------------------------------------------------------------------------

import json
import math
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal, ROUND_HALF_UP, localcontext
from urllib.parse import quote

from requests import Session
from requests.exceptions import RequestException, Timeout

from ccxt.base.errors import ArgumentsRequired
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import BadRequest
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import NotSupported
from ccxt.base.errors import RateLimitExceeded
from ccxt.base.errors import RequestTimeout


# ---------------------------------------------------------------------------
# Static text for every violation and verdict code. Kept out of the methods so
# that a port can copy the table verbatim and a reviewer can diff two languages
# by eye. No number is ever interpolated into these.
# ---------------------------------------------------------------------------

VIOLATION_MESSAGES = {
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
}

KNOWN_STRATEGIES = ['dry_run', 'sequential', 'parallel_within_hop', 'limit_protected', 'best_effort', 'atomic_ish']

# the query keys forwarded to GET /route, in a fixed order so that two ports
# build a byte-identical URL
ROUTE_QUERY_KEYS = ['amountIn', 'amountOut', 'strategy', 'maxVenues', 'bridges', 'exchanges', 'balances', 'balanceMode', 'includeQuotes', 'includeFees', 'certified', 'requireFullFill', 'hopPenaltyBps', 'minLegNotional']

# the characters encodeURIComponent leaves alone that Python's quote() would
# escape; with these declared safe the two produce identical query strings
URL_COMPONENT_SAFE = "!*'()"


class OrderRouter:

    # defaults, mirrored as constants in every port
    DEFAULT_BASE_URL = 'https://docs.ccxt.com/router/api'
    DEFAULT_TIMEOUT_MS = 30000
    DEFAULT_SLIPPAGE_BPS = 25
    DEFAULT_RECONCILE_TOLERANCE = 0.02

    # How long retryFailedSteps waits before re-placing a step the venue rejected. A second is
    # the shortest delay that lets a transient cause clear(a rate limit window, a momentary
    # balance lag) without turning a retry budget into a burst against a venue that just said no.
    DEFAULT_RETRY_DELAY_MS = 1000

    # NO_CAP is the default: this class does not decide how much of your money you
    # may trade. `maxNotionalUsd` is an OPT-IN guardrail — set it and it is honoured
    # exactly, at whatever value you choose; leave it unset and no notional check runs
    # at all.
    #
    # It used to be a hard 25 USD ceiling that could be lowered but never raised. That
    # number came from CLAUDE.md §5.5, which governs THIS REPOSITORY'S live tests
    # against real exchanges — not the people using the library. A client that refuses
    # a 30 USD order because its own test suite is cautious is broken as a product.
    NO_CAP = 0

    # router-side caps on the `balances` query parameter; both REJECT rather
    # than truncate server-side, so the client trims before sending
    MAX_BALANCE_ENTRIES = 64
    MAX_BALANCE_CHARS = 4096

    # How many executed plan ids the in-process idempotency ledger keeps. 1024 is chosen
    # to be far more executions than any one process performs in the window where a
    # duplicate is plausible(a retry loop, an operator re-running a plan, a redelivered
    # message), while bounding the ledger to a few tens of kilobytes so a router held
    # open for the life of a daemon cannot grow without limit.
    #
    # THE TRADEOFF IS REAL AND IS NOT HIDDEN: eviction WEAKENS the guarantee. Once a plan
    # id has been pushed out by 1024 newer executions, re-executing that plan is no longer
    # refused in-process — it will be placed again, orders and all. The guard is therefore
    # "recent duplicates are refused", not "duplicates are impossible". A process that
    # needs the strong promise across restarts or beyond this window needs the durable
    # ledger the Known gaps entry calls for; until then, callers whose plans must never
    # re-execute should key idempotency at the venue themselves(a clientOrderId passed in
    # options['orderParams'], on venues that honour one) rather than rely on this instance's memory.
    MAX_EXECUTED_PLAN_IDS = 1024

    # relative tolerance for float comparisons; also the tolerance the six
    # test suites compare fixture numbers with
    TOLERANCE = 1e-9

    def __init__(self, config={}):
        """
        creates a client for the CCXT order-router service

        :param dict config: client configuration
        :param str config['apiKey']: the router API key, sent as the x-api-key header(required)
        :param str [config['baseUrl']]: router base url, defaults to https://docs.ccxt.com/router/api
        :param int [config['timeoutMs']]: request timeout in milliseconds, defaults to 30000
        :param float [config['maxNotionalUsd']]: per-trade USD notional cap, an opt-in guardrail honoured exactly at whatever value you choose; omit it, or pass 0, for no cap
        :returns OrderRouter: a router client
        """
        api_key = self.string_at(config, 'apiKey', '')
        if api_key == '':
            raise ArgumentsRequired('OrderRouter requires an apiKey')
        self.api_key = api_key
        base_url = self.string_at(config, 'baseUrl', OrderRouter.DEFAULT_BASE_URL)
        while len(base_url) > 0 and base_url[-1] == '/':
            base_url = base_url[:-1]
        self.base_url = base_url
        self.timeout_ms = self.number_at(config, 'timeoutMs', OrderRouter.DEFAULT_TIMEOUT_MS)
        max_notional_usd = self.number_at(config, 'maxNotionalUsd', OrderRouter.NO_CAP)
        if max_notional_usd < 0:
            # a negative cap is a typo, not a policy, and silently ignoring it would
            # leave the caller believing a guardrail is in place
            raise BadRequest('OrderRouter maxNotionalUsd must not be negative; omit it, or pass 0, for no cap')
        # 0 means NO CAP. Any positive value is honoured exactly — it is not clamped,
        # because the caller is the one who knows the size of their own trade.
        self.max_notional_usd = max_notional_usd
        # in-process idempotency ledger: the identity of every plan this instance has
        # already executed live. TWO structures for one ledger, in every port: a FIFO list
        # that fixes the eviction order, and a set so the membership test is a hash lookup
        # rather than a scan whose cost grows with the ledger. They are written and evicted
        # together and must never disagree.
        self.executed_plan_ids = []
        self.executed_plan_id_set = set()
        self.session = Session()
        # guards the shared report while parallel_within_hop has legs in flight;
        # the single-threaded languages need no equivalent
        self.lock = threading.RLock()

    # -----------------------------------------------------------------------
    # small container accessors. Every port has these five; they exist so the
    # six implementations read line for line and so a missing key is never a
    # language-specific crash. They read dictionaries AND objects, because a
    # venue's `markets` and `features` are attributes in Python and properties
    # in JavaScript.
    # -----------------------------------------------------------------------

    def value_at(self, container, key):
        """
        reads a raw field out of a dictionary or an object, returning None when absent

        :param dict container: the dictionary or object to read from
        :param str key: the field name
        :returns any: the value, or None
        """
        if container is None:
            return None
        if isinstance(container, dict):
            return container.get(key)
        if isinstance(container, (list, tuple, str, bytes, int, float, bool)):
            return None
        return getattr(container, key, None)

    def step_limit_price(self, step):
        """
        the price a step is sent at, derived from expectedPrice when the caller gave no limitPrice

        :param dict step: one step of an execution plan
        :returns float: the limit price to use, 0 only when the step has neither field
        """
        # buildExecutionPlan always sets limitPrice, but a HAND-BUILT plan need not: the manual
        # documents it as optional, and the "execute your own plans" path is the whole point of
        # execute() taking a plan rather than a route. Reading it as 0 made every such plan fail
        # three different ways — a blocking price_out_of_range from check_execution_plan_safety, a
        # rounded_to_zero before any strategy branch in place_step, and a buy-side balance
        # requirement of amount * 0 — so the documented example could not place one order.
        # expectedPrice is the honest fallback: it is what the caller says the step is worth, and
        # it is already guaranteed positive by the invalid_step guard.
        limit_price = self.number_at(step, 'limitPrice', 0)
        if limit_price > 0:
            return limit_price
        return self.number_at(step, 'expectedPrice', 0)

    def step_notional_quote(self, step):
        """
        the step's quote-side value, derived from amount and expectedPrice when absent

        :param dict step: one step of an execution plan
        :returns float: the notional in the market's quote currency
        """
        # Same reasoning as step_limit_price, and the same formula build_execution_plan uses. Read
        # as 0, a hand-built plan tripped the BLOCKING cost_below_minimum on every market
        # declaring a minimum cost.
        notional_quote = self.number_at(step, 'notionalQuote', 0)
        if notional_quote > 0:
            return notional_quote
        return self.number_at(step, 'amount', 0) * self.number_at(step, 'expectedPrice', 0)

    def number_at(self, container, key, default_value):
        """
        reads a numeric field out of a container, with a default for missing, None and unparseable values

        :param dict container: the dictionary to read from
        :param str key: the field name
        :param float default_value: value returned when the field is absent or not a number
        :returns float: the number
        """
        value = self.value_at(container, key)
        if value is None:
            return default_value
        if isinstance(value, bool):
            # a boolean is not a number, exactly as `typeof value === 'number'`
            # is false for one in the reference
            return default_value
        if isinstance(value, (int, float)):
            # NaN and +/-Infinity are not numbers this class will act on. An
            # infinite tolerance silently disables the halt verdict and an
            # infinite rate silently disables the cap, and "the default" is the
            # only answer six languages can agree on for either.
            if not self.is_finite_number(value):
                return default_value
            return value
        if isinstance(value, str):
            return self.parse_number(value, default_value)
        return default_value

    def is_finite_number(self, value):
        """
        reports whether a double is a real number, i.e. neither NaN nor an infinity

        :param float value: the number to test
        :returns bool: True when the value is finite
        """
        if value != value:
            # the one NaN test that needs no library in any of the six
            return False
        if value > 1.7976931348623157e308 or value < -1.7976931348623157e308:
            return False
        return True

    def parse_number(self, text, default_value):
        """
        reads the leading numeric prefix of a string, exactly as JavaScript's parseFloat does, and returns the default when there is not one or when the result is not finite

        :param str text: the text to read
        :param float default_value: value returned when the text does not start with a number
        :returns float: the number
        """
        # Hand-rolled rather than delegated to float(), because every language's
        # own parser disagrees with the other four somewhere: Python reads
        # '1_000' as 1000, 'inf' as an infinity and '1,234.5' not at all, PHP and
        # Go read '0x10' as 0 only by accident of their regex, C# trims Unicode
        # whitespace JavaScript does not. The grammar below is JavaScript's
        # StrDecimalLiteral prefix over the ASCII whitespace set, and it is the
        # SAME twenty lines in all six ports.
        if text is None:
            return default_value
        cursor = 0
        while cursor < len(text) and self.is_router_space(text[cursor]):
            cursor = cursor + 1
        start = cursor
        if cursor < len(text) and (text[cursor] == '+' or text[cursor] == '-'):
            cursor = cursor + 1
        digits = 0
        while cursor < len(text) and text[cursor] >= '0' and text[cursor] <= '9':
            cursor = cursor + 1
            digits = digits + 1
        if cursor < len(text) and text[cursor] == '.':
            cursor = cursor + 1
            while cursor < len(text) and text[cursor] >= '0' and text[cursor] <= '9':
                cursor = cursor + 1
                digits = digits + 1
        if digits == 0:
            # 'Infinity', 'inf', 'NaN', '' and '١٢' all land here, in all six
            return default_value
        end = cursor
        if cursor < len(text) and (text[cursor] == 'e' or text[cursor] == 'E'):
            exponent = cursor + 1
            if exponent < len(text) and (text[exponent] == '+' or text[exponent] == '-'):
                exponent = exponent + 1
            exponent_digits = 0
            while exponent < len(text) and text[exponent] >= '0' and text[exponent] <= '9':
                exponent = exponent + 1
                exponent_digits = exponent_digits + 1
            if exponent_digits > 0:
                # a trailing 'e' with no digits is not part of the number: JS
                # reads '1e' as 1, and so does every port here
                end = exponent
        try:
            parsed = float(text[start:end])
        except ValueError:
            return default_value
        if not self.is_finite_number(parsed):
            # '1e400' overflows to an infinity, which is not a number the cap or
            # the tolerance may be built out of
            return default_value
        return parsed

    def is_router_space(self, character):
        """
        reports whether a character is one of the six ASCII spaces the number grammar skips

        :param str character: a single character
        :returns bool: True for space, tab, newline, carriage return, form feed and vertical tab
        """
        # deliberately NOT str.isspace: Python, PHP, C# and Go each draw the
        # Unicode line in a different place, and a non-breaking space that parses
        # in one language and not the others is drift
        return character == ' ' or character == '\t' or character == '\n' or character == '\r' or character == '\f' or character == '\v'

    def string_at(self, container, key, default_value):
        """
        reads a string field out of a container, with a default for missing and None values

        :param dict container: the dictionary to read from
        :param str key: the field name
        :param str default_value: value returned when the field is absent
        :returns str: the string
        """
        value = self.value_at(container, key)
        if value is None:
            return default_value
        if isinstance(value, str):
            return value
        return default_value

    def bool_at(self, container, key, default_value):
        """
        reads a boolean field out of a container, with a default for missing and None values

        :param dict container: the dictionary to read from
        :param str key: the field name
        :param bool default_value: value returned when the field is absent
        :returns bool: the boolean
        """
        value = self.value_at(container, key)
        if value is None:
            return default_value
        if isinstance(value, bool):
            return value
        return default_value

    def list_at(self, container, key):
        """
        reads a list field out of a container, returning an empty list when absent

        :param dict container: the dictionary to read from
        :param str key: the field name
        :returns list: the list, never None
        """
        value = self.value_at(container, key)
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return []

    def dict_at(self, container, key):
        """
        reads a nested dictionary out of a container, returning an empty dictionary when absent

        :param dict container: the dictionary to read from
        :param str key: the field name
        :returns dict: the dictionary, never None
        """
        value = self.value_at(container, key)
        if value is None:
            return {}
        if isinstance(value, dict):
            return value
        return {}

    def round_half_up(self, value):
        """
        rounds half away from positive infinity, which is what JavaScript's Math.round does and what Python's round() does not

        :param float value: the number to round
        :returns float: the rounded number
        """
        if not math.isfinite(value):
            return value
        return float(math.floor(value + 0.5))

    def format_number(self, value):
        """
        formats a double as decimal text with no exponent, so that six languages produce the same string

        :param float value: the number to format
        :returns str: the number as fixed-point text with trailing zeros removed
        """
        # JavaScript prints 1e-7 where Python prints 1e-07 and Go prints 1e-07;
        # a fixed 12-decimal rendering with the trailing zeros trimmed is the
        # one spelling all six languages agree on for the magnitudes a balance
        # or an amount can take.
        if not math.isfinite(value):
            return '0'
        if abs(value) >= 1e18:
            # JavaScript's toFixed switches to exponent notation at 1e21 while
            # the other five languages never do. Rather than let one language
            # send a different string than the others, refuse — loudly, and at a
            # magnitude no real amount reaches.
            raise BadRequest('OrderRouter: a number this large cannot be rendered identically in all six languages')
        text = self.to_fixed_12(value)
        if text.find('.') >= 0:
            text = text.rstrip('0')
            if len(text) > 0 and text[-1] == '.':
                text = text[:-1]
        if text == '' or text == '-' or text == '-0':
            return '0'
        return text

    def to_fixed_12(self, value):
        """
        renders a finite float with exactly twelve decimals, from the exact binary value and
        under JavaScript's toFixed tie rule

        :param float value: the number to render
        :returns str: the number with exactly twelve decimals
        """
        # The reference is TypeScript, and TypeScript's toFixed is ECMA-262's: the sign is
        # stripped BEFORE the digits are chosen, so a tie rounds AWAY FROM ZERO on the magnitude
        # and (-0.0001220703125).toFixed(12) is -0.000122070313, not -...312. Python's '%.12f'
        # rounds half to EVEN and would answer ...312, so the balances query string this feeds
        # would differ per language on every value landing exactly on a half tick — 2^-13
        # included. Decimal(value) is the exact binary value, never a re-parse of a decimal
        # rendering of it.
        exact = Decimal(value)
        sign = ''
        if exact < 0:
            sign = '-'
            exact = -exact
        with localcontext() as context:
            # the default 28-digit context signals InvalidOperation on anything with more than
            # 28 result digits — 1e17 rendered to twelve decimals needs 30
            context.prec = 60
            context.rounding = ROUND_HALF_UP
            quantized = exact.quantize(Decimal(1).scaleb(-12))
        return sign + format(quantized, 'f')

    # -----------------------------------------------------------------------
    # I/O: the router HTTP client
    # -----------------------------------------------------------------------

    def fetch_route(self, from_asset, to_asset, params={}):
        """
        asks the router how to convert one asset into another, over the venues and bridges it has live books for

        https://docs.ccxt.com/router/api

        :param str from_asset: the asset being spent, e.g. USDT
        :param str to_asset: the asset being acquired, e.g. BTC
        :param dict params: request parameters
        :param float [params['amountIn']]: exact amount of from_asset to spend — supply this OR amountOut, never both
        :param float [params['amountOut']]: exact amount of to_asset to acquire — supply this OR amountIn, never both
        :param str [params['strategy']]: best_single, split_optimal or split_capped
        :param int [params['maxVenues']]: per-hop venue cap for split_capped
        :param str|list [params['exchanges']]: venue allowlist
        :param str|list [params['bridges']]: intermediary assets to consider
        :param str [params['balances']]: what you hold, as [exchangeId.]ASSET:amount entries
        :param str [params['balanceMode']]: cap(default) or require
        :param bool [params['includeQuotes']]: return the per-venue diagnostic
        :param bool [params['includeFees']]: rank on fee-adjusted price, default True
        :param bool [params['certified']]: restrict to CCXT-certified venues
        :param bool [params['requireFullFill']]: refuse partial fills
        :param float [params['hopPenaltyBps']]: how much better a bridged route must be per extra hop
        :param float [params['minLegNotional']]: suppress legs below this quote notional
        :returns dict: a RouteResult — an unroutable pair comes back as a RouteResult with an unroutableReason, not as an exception
        """
        if from_asset is None or to_asset is None or from_asset == '' or to_asset == '':
            raise ArgumentsRequired('fetch_route requires from_asset and to_asset')
        self.assert_route_amounts(params, 'fetch_route')
        # HOLDINGS NEVER TRAVEL IN A URL. The service scrubs balances out of its own
        # logs, but a URL does not stay inside that process: the standard deployment
        # puts a reverse proxy in front, and nginx, an ALB and a CDN all log the full
        # request line by default. So do browser history and client-side tracing, and a
        # Referer carries it off-origin. None of that is reachable from the router, and
        # no amount of in-process redaction fixes it — the fix is for the wallet not to
        # be in the URL, which is why the service exposes POST /route and its own spec
        # says to use it whenever balances are sent.
        #
        # A request carrying no holdings still goes as a GET: cacheable, linkable, and
        # what every existing caller already uses.
        sends_balances = params.get('balances') is not None
        # an audit id the caller chose, so their log and the router's decision log can be
        # joined. The service mints one when this is absent, and echoes whichever it used.
        request_id = self.string_at(params, 'requestId', '')
        if sends_balances:
            route = self.request(self.base_url + '/route', 'POST', self.route_body(from_asset, to_asset, params), request_id)
        else:
            route = self.request(self.base_url + '/route?' + self.route_query(from_asset, to_asset, params), 'GET', {}, request_id)
        if sends_balances:
            # CHECKED HERE, not only in fetch_route_with_balances. `params['balances']` is a
            # documented parameter of this method, and a caller who passes it directly was
            # getting no verification at all — the same silent failure, one call lower down.
            self.assert_balances_applied(route, params)
        # What THIS CLIENT asked for, stamped client-side so check_execution_plan_safety can
        # tell a flag that was honoured from one that was lost in transit. requireFullFill is
        # the one route parameter that fails OPEN: lose it and an explicit "refuse rather than
        # shrink" silently becomes an advisory partial_fill.
        route['clientRequestedRequireFullFill'] = self.bool_at(params, 'requireFullFill', False)
        # Stamp what THIS CLIENT asked for, client-side, so build_execution_plan can check the
        # answer against the question. Everything else in the response is the server's word for it.
        route['clientRequestedFrom'] = from_asset.upper()
        route['clientRequestedTo'] = to_asset.upper()
        return route

    def assert_route_amounts(self, params, method):
        """
        refuses neither-or-both amounts before a byte reaches the wire

        :param dict params: the route parameters
        :param str method: the caller's name, for the message
        """
        has_amount_in = params.get('amountIn') is not None
        has_amount_out = params.get('amountOut') is not None
        if has_amount_in == has_amount_out:
            # refused client-side for the same reason the router refuses it: a typo must not
            # become a confidently wrong route. Shared by fetch_route and watch_route because the
            # service runs ONE parser for both and they must not disagree about what is valid.
            raise BadRequest(method + ' requires exactly one of amountIn or amountOut')

    def assert_balances_applied(self, route, params):
        """
        throws unless the router confirmed it read the holdings that were sent

        :param dict route: the RouteResult
        :param dict params: the parameters the caller supplied
        """
        if self.bool_at(params, 'requireBalancesApplied', True) is not True:
            # the caller opted out, with their eyes open
            return
        # /route declares its query without a JSON schema, so a router that predates the
        # balances feature IGNORES them and answers byte-identically to one that never
        # received any. Executing a plan computed against a portfolio the server never saw is
        # the case worth failing on.
        if self.string_at(route, 'balancesApplied', '') != '':
            return
        # An EMPTY echo is ambiguous on its own: the spec types balancesApplied as
        # [string, null] and returns null when none were sent, so '' is also the honest answer
        # to `balances=` meaning "I hold nothing". balanceEntryCount disambiguates by
        # PRESENCE, not by value — a current server sends 0, a server that never heard of the
        # feature sends nothing at all — so it is read with a sentinel default.
        #
        # This is the case the old check skipped outright, which meant an empty-wallet caller
        # against a legacy or proxy-stripped server got a full route, no error, and no way to
        # know the balances were dropped.
        if self.number_at(route, 'balanceEntryCount', -1) >= 0:
            return
        raise ExchangeError('OrderRouter did not echo balancesApplied: the balances were ignored, so this route is not funded-aware')

    def route_param_text(self, value):
        """
        renders one route parameter as the text the service parses, in the one grammar both verbs share

        :param value: the raw parameter value
        :returns str: the rendered text
        """
        if isinstance(value, bool):
            return 'true' if value else 'false'
        if isinstance(value, (int, float)):
            return self.format_number(value)
        if isinstance(value, (list, tuple)):
            # bridges, exchanges and balances are all comma-separated on the wire, in
            # both verbs: the body is read by the same handler as the query string
            return ','.join([str(item) for item in value])
        return str(value)

    def route_query(self, from_asset, to_asset, params):
        """
        builds the GET /route query string, in a fixed key order so two ports produce a byte-identical url

        :param str from_asset: the asset being spent
        :param str to_asset: the asset being acquired
        :param dict params: the route parameters
        :returns str: the query string, without a leading question mark
        """
        query = 'from=' + quote(from_asset.upper(), safe=URL_COMPONENT_SAFE) + '&to=' + quote(to_asset.upper(), safe=URL_COMPONENT_SAFE)
        for key in ROUTE_QUERY_KEYS:
            value = params.get(key)
            if value is None:
                continue
            query = query + '&' + key + '=' + quote(self.route_param_text(value), safe=URL_COMPONENT_SAFE)
        return query

    def route_body(self, from_asset, to_asset, params):
        """
        builds the POST /route JSON body — the same fields as the query string, by the same names

        :param str from_asset: the asset being spent
        :param str to_asset: the asset being acquired
        :param dict params: the route parameters
        :returns dict: the body to send
        """
        body = {}
        body['from'] = from_asset.upper()
        body['to'] = to_asset.upper()
        for key in ROUTE_QUERY_KEYS:
            value = params.get(key)
            if value is None:
                continue
            # numbers and booleans travel as themselves — the body is JSON and the
            # service's own schema types amountIn as a number. Everything else uses the
            # same text form the query string uses, so one handler reads both verbs.
            if isinstance(value, bool) or isinstance(value, (int, float)):
                body[key] = value
            else:
                body[key] = self.route_param_text(value)
        return body

    def retry_suffix(self, retry_after):
        """
        renders a retry interval as a message suffix, empty when the service sent none

        :param str retry_after: the seconds the service asked for, already normalised to text
        :returns str: the suffix to append to an exception message
        """
        if retry_after == '':
            return ''
        return ', retry after ' + retry_after + 's'

    def cold_cache_suffix(self, body):
        """
        renders the book counts a cache_cold refusal carries, so a caller can log why it was refused

        :param dict body: the CacheColdError body
        :returns str: the suffix to append to an exception message
        """
        total = self.number_at(body, 'bookCount', 0)
        if total <= 0:
            return ''
        fresh = self.number_at(body, 'freshCount', 0)
        needed = self.number_at(body, 'minFreshBooksForReady', 0)
        return ' (' + self.format_number(fresh) + ' of ' + self.format_number(total) + ' books fresh, ' + self.format_number(needed) + ' needed)'

    def request(self, url, method='GET', request_body={}, request_id=''):
        """
        performs the authenticated call and maps router status codes onto CCXT exceptions

        :param str url: the fully-formed url, including the query string on a GET
        :param str method: GET or POST
        :param dict request_body: the JSON body, sent on a POST and ignored on a GET
        :param str request_id: an optional caller-chosen audit id, sent as x-request-id
        :returns dict: the decoded JSON body
        """
        headers = {
            'x-api-key': self.api_key,
            'Accept': 'application/json',
        }
        if request_id != '':
            # the service caps this at 200 characters and mints its own when absent, so a
            # longer one is dropped rather than sent and rejected
            if len(request_id) <= 200:
                headers['x-request-id'] = request_id
        retry_after = ''
        rate_limit_reset = ''
        try:
            if method == 'POST':
                headers['Content-Type'] = 'application/json'
                response = self.session.post(url, headers=headers, data=json.dumps(request_body), timeout=self.timeout_ms / 1000)
            else:
                response = self.session.get(url, headers=headers, timeout=self.timeout_ms / 1000)
            status = response.status_code
            # READ BEFORE THE BODY. On a 429 or a 503 this is the only number that says
            # how long to wait, and a caller told "unavailable" with no interval retries
            # blind.
            #
            # The two headers are NOT interchangeable and are kept apart on purpose.
            # retry-after answers "how long until this particular refusal clears";
            # x-ratelimit-reset answers "how long until the rate-limit window rolls
            # over", which is the same question ONLY on a 429. Using the window as a
            # fallback for a cold cache would tell a caller to wait a full minute for a
            # cache that repopulates in seconds.
            retry_header = response.headers.get('retry-after')
            if retry_header is not None:
                retry_after = str(retry_header)
            reset_header = response.headers.get('x-ratelimit-reset')
            if reset_header is not None:
                rate_limit_reset = str(reset_header)
            text = response.text
        except Timeout as e:
            raise RequestTimeout('OrderRouter request timed out after ' + str(self.timeout_ms) + 'ms') from e
        except RequestException as e:
            raise ExchangeNotAvailable('OrderRouter request failed: ' + str(e)) from e
        try:
            body = json.loads(text)
        except ValueError as e:
            raise ExchangeError('OrderRouter returned a non-JSON body') from e
        if status >= 200 and status < 300:
            return body
        # 404 and 501 carry a complete RouteResult explaining the refusal —
        # `no_market` and `exact_out_multi_hop_unsupported` are routing outcomes,
        # and turning them into exceptions would make the caller parse an error
        # string to recover a structure it already has
        if (status == 404 or status == 501) and self.string_at(body, 'unroutableReason', '') != '':
            return body
        message = self.string_at(body, 'error', 'http status ' + str(status))
        if status == 400:
            raise BadRequest('OrderRouter: ' + message)
        if status == 401 or status == 403:
            raise AuthenticationError('OrderRouter: ' + message)
        if status == 429:
            # the window rollover IS the retry interval here, so it stands in when the
            # service sent no retry-after
            limit_interval = retry_after if retry_after != '' else rate_limit_reset
            raise RateLimitExceeded('OrderRouter: ' + message + self.retry_suffix(limit_interval))
        if status == 408 or status == 504:
            raise RequestTimeout('OrderRouter: ' + message)
        if status == 503:
            # /ready answers 503 WITH ITS ANSWER: a Readiness body saying not_ready and
            # why. That is the result of the probe, not a failure of it — throwing would
            # hide the very counts the caller asked for. Distinguished by shape, exactly
            # as 404 and 501 are above.
            if self.string_at(body, 'status', '') != '':
                return body
            # Every other 503 is cache_cold: the router is alive but has too few fresh
            # books to rank on, typically for a few seconds after a restart while the
            # connectors repopulate. It is a RETRY, and the generic ExchangeError this
            # used to raise made it indistinguishable from a permanent server fault.
            raise ExchangeNotAvailable('OrderRouter: ' + message + self.cold_cache_suffix(body) + self.retry_suffix(retry_after))
        raise ExchangeError('OrderRouter: ' + message)

    def fetch_health(self):
        """
        liveness only — answers 200 from the first millisecond of boot, before a single venue has connected. Use fetch_readiness to decide whether the router can actually price anything

        :returns dict: status and uptimeSec
        """
        return self.request(self.base_url + '/health', 'GET', {})

    def fetch_readiness(self):
        """
        whether the router has enough fresh books to rank on, measured with the same staleness cutoff /route uses. NOT_READY IS A NORMAL ANSWER: the service replies 503 with the same body it returns on 200, and this method returns it rather than raising, because a caller asking "are you ready" needs the counts that say why not

        :returns dict: status(ready or not_ready), bookCount, freshCount, staleCount, minFreshBooksForReady and staleBookMs
        """
        return self.request(self.base_url + '/ready', 'GET', {})

    def fetch_version(self):
        """
        build provenance of the running process. This is what a deploy pipeline asserts against — health answers 200 from the OLD process just as happily when a deploy silently no-ops, and commit is the only field that tells the two apart

        :returns dict: version, commit, commitShort, builtAt, builtBy, startedAt and uptimeSec
        """
        return self.request(self.base_url + '/version', 'GET', {})

    def fetch_symbols(self):
        """
        the unified symbols the router currently holds a cached book for. A pair absent from this list cannot be routed no matter how it is spelled

        :returns str[]: the cached symbols
        """
        response = self.request(self.base_url + '/symbols', 'GET', {})
        return self.list_at(response, 'symbols')

    def fetch_exchanges_status(self):
        """
        per-venue connection health. A venue can hold an open socket while its subscription is silently dead, so read the per-venue update age and not only the connected flag

        :returns dict[]: one health record per venue
        """
        response = self.request(self.base_url + '/exchanges/status', 'GET', {})
        return self.list_at(response, 'exchanges')

    def fetch_cached_order_book(self, exchange_id, symbol):
        """
        the router's own cached L2 book for one venue and symbol — the exact depth a route was ranked on, which is what makes a surprising route auditable

        :param str exchange_id: the venue, e.g. binance
        :param str symbol: the unified symbol, e.g. BTC/USDT
        :returns dict: the cached book
        """
        if exchange_id is None or symbol is None or exchange_id == '' or symbol == '':
            raise ArgumentsRequired('fetch_cached_order_book requires an exchange_id and a symbol')
        # the symbol carries a slash and travels as ONE path segment, so it is encoded
        # rather than interpolated: BTC/USDT unencoded would read as two segments and
        # reach a route that does not exist
        url = self.base_url + '/orderbook/' + quote(exchange_id, safe=URL_COMPONENT_SAFE) + '/' + quote(symbol, safe=URL_COMPONENT_SAFE)
        return self.request(url, 'GET', {})

    def stream_url(self, from_asset, to_asset, params):
        """
        builds the wss url for GET /stream/route, refusing what the endpoint refuses

        :param str from_asset: the asset being spent
        :param str to_asset: the asset being acquired
        :param dict params: the route parameters
        :returns str: the fully-formed websocket url
        """
        if from_asset is None or to_asset is None or from_asset == '' or to_asset == '':
            raise ArgumentsRequired('watchRoute requires from_asset and to_asset')
        self.assert_route_amounts(params, 'watchRoute')
        # REFUSED HERE, not by the server closing the socket on us. A stream is held open for
        # minutes and carries no channel to update the holdings it was opened with, so every
        # frame after the first would price a portfolio the caller may already have traded away.
        if params.get('balances') is not None:
            raise BadRequest('OrderRouter: /stream/route does not accept balances — a socket outlives the holdings it was opened with. Use fetch_route')
        if params.get('balanceMode') is not None:
            raise BadRequest('OrderRouter: /stream/route does not accept balanceMode, because it does not accept balances. Use fetch_route')
        # includeQuotes is deliberately NOT defaulted: the service defaults it to False on this
        # endpoint and True on the REST one, and route_query omits what the caller did not set.
        query = self.route_query(from_asset, to_asset, params)
        url = self.base_url
        if url.find('https://') == 0:
            url = 'wss://' + url[8:]
        elif url.find('http://') == 0:
            url = 'ws://' + url[7:]
        return url + '/stream/route?' + query

    def watch_route(self, from_asset, to_asset, params={}, on_route=None):
        """
        NOT IMPLEMENTED IN SYNCHRONOUS PYTHON, and refused rather than approximated.

        /stream/route is a WebSocket, and this class is synchronous: it does its I/O with
        `requests`, which has no websocket support, and ccxt's own websocket client lives in
        ccxt.async_support and needs a running event loop. Polling fetch_route on a timer is NOT
        the same thing — the stream pushes on every market move that changes the answer, across
        every leg of every candidate path — so this does not silently substitute one for the
        other.

        stream_url() above IS implemented and tested, so the url grammar and the client-side
        refusals stay verified in this port and cannot drift from the other five.

        :param str from_asset: the asset being spent
        :param str to_asset: the asset being acquired
        :param dict params: the route parameters
        :param on_route: called with each RouteResult
        """
        self.stream_url(from_asset, to_asset, params)
        raise NotSupported('OrderRouter.watch_route needs a websocket, which synchronous ccxt has no client for. Use fetch_route, or consume /stream/route from ccxt.pro / a server-side proxy')

    def fetch_route_with_balances(self, from_asset, to_asset, venues, params={}):
        """
        reads the live balances of the supplied venues, sends them to the router, and returns a route you can actually fund

        :param str from_asset: the asset being spent
        :param str to_asset: the asset being acquired
        :param dict venues: a dictionary of exchangeId to a ccxt exchange instance
        :param dict params: the same parameters fetch_route accepts, minus balances which this method builds
        :param bool [params['requireBalancesApplied']]: raise when the router did not echo balancesApplied, default True
        :returns dict: the RouteResult, with the client-side keys balancesUsed and balancesDropped added
        """
        exchange_ids = sorted(venues.keys())
        entries = []
        dropped = []
        for exchange_id in exchange_ids:
            venue = venues[exchange_id]
            balance = venue.fetch_balance()
            holdings = self.dict_at(balance, 'free')
            if len(holdings) == 0:
                holdings = self.dict_at(balance, 'total')
            for code in sorted(holdings.keys()):
                amount = self.number_at(holdings, code, 0)
                if amount <= 0:
                    # a zero holding is not information, and it costs one of the
                    # router's 64 entries
                    continue
                if amount >= 1e18:
                    # beyond fixed-point rendering; reported rather than sent,
                    # because a silently reshaped amount is worse than a missing
                    # one
                    dropped.append({'exchangeId': exchange_id, 'asset': code, 'amount': amount, 'reason': 'amount_out_of_range'})
                    continue
                entries.append({'exchangeId': exchange_id, 'asset': code, 'amount': amount})
        # largest first, so trimming to the router's caps drops the smallest
        # holdings. Ties break on exchangeId then asset so six languages produce
        # the same list from the same wallet.
        entries.sort(key=lambda entry: (-entry['amount'], entry['exchangeId'], entry['asset']))
        while len(entries) > OrderRouter.MAX_BALANCE_ENTRIES:
            removed = entries.pop()
            removed['reason'] = 'entry_cap'
            dropped.append(removed)
        balances = self.join_balances(entries)
        while len(balances) > OrderRouter.MAX_BALANCE_CHARS and len(entries) > 0:
            removed = entries.pop()
            removed['reason'] = 'char_cap'
            dropped.append(removed)
            balances = self.join_balances(entries)
        route_params = {}
        for key in params:
            route_params[key] = params[key]
        route_params['balances'] = balances
        route = self.fetch_route(from_asset, to_asset, route_params)
        # The echo check itself now lives in fetch_route, which this call went through, and
        # params['requireBalancesApplied'] travelled with it — including the empty-balances
        # case, which the check that used to live here skipped outright.
        route['balancesUsed'] = balances
        route['balancesDropped'] = dropped
        return route

    def join_balances(self, entries):
        """
        renders balance entries as the router's [exchangeId.]ASSET:amount comma-separated form

        :param list entries: the entries to render
        :returns str: the balances query value
        """
        parts = []
        for entry in entries:
            parts.append(entry['exchangeId'] + '.' + entry['asset'] + ':' + self.format_number(entry['amount']))
        return ','.join(parts)

    # -----------------------------------------------------------------------
    # PURE: build_execution_plan
    # -----------------------------------------------------------------------

    def assert_route_chain_is_coherent(self, route, hops):
        """
        @ignore
        refuses a route whose hops do not connect, or that does not run from the asset the caller
        offered to the asset the caller wanted

        :param dict route: the RouteResult being planned, carrying the client's own
                           clientRequestedFrom/clientRequestedTo stamp
        :param dict[] hops: the route's hops, in order
        :returns None: nothing; it raises ExchangeError when the chain does not hold
        """
        """
        refuses a route whose hops do not connect, or that does not run from the asset the caller
        offered to the asset the caller wanted

        :param dict route: the RouteResult
        :param list hops: its hops
        :returns None:
        """
        if len(hops) == 0:
            return
        carried = ''
        for i in range(len(hops)):
            hop = hops[i]
            side = self.string_at(hop, 'side', '').lower()
            base = self.string_at(hop, 'base', '').upper()
            quote = self.string_at(hop, 'quote', '').upper()
            if base == '' or quote == '' or side not in ('buy', 'sell'):
                raise ExchangeError('OrderRouter: hop ' + str(i) + ' does not name a market and a side')
            # a buy spends the quote to acquire the base; a sell is the reverse
            spends = quote if side == 'buy' else base
            produces = base if side == 'buy' else quote
            if i > 0 and spends != carried:
                raise ExchangeError('OrderRouter: hop ' + str(i) + ' spends ' + spends + ' but the previous hop produced ' + carried)
            if i == 0:
                requested_from = self.string_at(route, 'clientRequestedFrom', '')
                if requested_from != '' and spends != requested_from:
                    raise ExchangeError('OrderRouter: the route spends ' + spends + ', not the requested ' + requested_from)
            carried = produces
        requested_to = self.string_at(route, 'clientRequestedTo', '')
        if requested_to != '' and carried != requested_to:
            raise ExchangeError('OrderRouter: the route produces ' + carried + ', not the requested ' + requested_to)

    def build_execution_plan(self, route, options={}):
        """
        flattens a RouteResult's hops and legs into a flat, ordered list of orders to place. PURE — no I/O, and the same input produces the same output in all six languages

        :param dict route: a RouteResult as returned by fetch_route
        :param dict [options]: plan options
        :param float [options['slippageBps']]: how far the limit price is set past the expected price, default 25
        :param float [options['reconcileToleranceRatio']]: the shortfall ratio reconcile_execution_step halts on, default 0.02
        :returns dict: an execution plan whose steps[] carries stepIndex, hopIndex, legIndex, exchangeId, symbol, side, amount, expectedPrice, limitPrice and notionalQuote
        """
        slippage_bps = self.number_at(options, 'slippageBps', OrderRouter.DEFAULT_SLIPPAGE_BPS)
        tolerance = self.number_at(options, 'reconcileToleranceRatio', OrderRouter.DEFAULT_RECONCILE_TOLERANCE)
        hops = self.list_at(route, 'hops')
        self.assert_route_chain_is_coherent(route, hops)
        steps = []
        step_index = 0
        for hop_index in range(len(hops)):
            hop = hops[hop_index]
            symbol = self.string_at(hop, 'pair', '')
            side = self.string_at(hop, 'side', '')
            base = self.string_at(hop, 'base', '')
            quote_currency = self.string_at(hop, 'quote', '')
            legs = self.list_at(hop, 'legs')
            for leg_index in range(len(legs)):
                leg = legs[leg_index]
                # leg amounts are always in BASE units, on both sides of the
                # market — see the router's RoutingQuote.filledAmount contract
                amount = self.number_at(leg, 'amount', 0)
                expected_price = self.number_at(leg, 'averagePrice', 0)
                effective_price = self.number_at(leg, 'effectivePrice', expected_price)
                # the limit sits on the side that costs you: above for a buy,
                # below for a sell
                if side == 'buy':
                    limit_price = expected_price * (1 + slippage_bps / 10000)
                else:
                    limit_price = expected_price * (1 - slippage_bps / 10000)
                steps.append({
                    'stepIndex': step_index,
                    'hopIndex': hop_index,
                    'legIndex': leg_index,
                    'exchangeId': self.string_at(leg, 'exchangeId', ''),
                    'symbol': symbol,
                    'side': side,
                    'base': base,
                    'quote': quote_currency,
                    'amount': amount,
                    'expectedPrice': expected_price,
                    'effectivePrice': effective_price,
                    'limitPrice': limit_price,
                    'notionalQuote': amount * expected_price,
                    # The taker fee the ROUTER predicted for this leg, always denominated in
                    # the quote currency (the service's own RouteLeg.feeCost contract).
                    # Carried so step_expected_out can measure the expectation the same way
                    # execute measures the realised amount — see the note there. 0 on a
                    # hand-built plan, which is exactly the old behaviour.
                    'expectedFeeCost': self.number_at(leg, 'feeCost', 0),
                    # This leg was cut short by the WALLET, not by the book: more was on
                    # offer, the balances just could not pay for it. Size-capped and
                    # depth-capped look identical in the numbers and need different
                    # follow-up, and the plan is the artifact every downstream report is
                    # built from — so the distinction has to survive the flattening.
                    'balanceLimited': self.bool_at(leg, 'balanceLimited', False),
                })
                step_index = step_index + 1
        return {
            'requestId': self.string_at(route, 'requestId', ''),
            'calculatedAt': self.number_at(route, 'calculatedAt', 0),
            'from': self.string_at(route, 'from', ''),
            'to': self.string_at(route, 'to', ''),
            'routingStrategy': self.string_at(route, 'strategy', ''),
            'exactSide': self.string_at(route, 'exactSide', ''),
            'amountIn': self.number_at(route, 'amountIn', 0),
            'amountOut': self.number_at(route, 'amountOut', 0),
            'fullyFillable': self.bool_at(route, 'fullyFillable', False),
            'fillRatio': self.number_at(route, 'fillRatio', 0),
            'unroutableReason': self.string_at(route, 'unroutableReason', ''),
            # WHICH hop could not be solved. -1 when the route is routable or the server did
            # not say; 0 is a real answer and must not read as "unknown", which is why the
            # default is negative rather than 0.
            'unroutableHopIndex': self.number_at(route, 'unroutableHopIndex', -1),
            # What the CALLER asked for, stamped by fetch_route — not the server's echo.
            # check_execution_plan_safety escalates on it, so reading the server's word for it
            # would let a flag lost in transit switch off the check that exists to catch
            # exactly that.
            'requireFullFill': self.bool_at(route, 'clientRequestedRequireFullFill', False),
            'hopCount': len(hops),
            'stepCount': len(steps),
            'slippageBps': slippage_bps,
            'reconcileToleranceRatio': tolerance,
            'steps': steps,
        }

    # -----------------------------------------------------------------------
    # PURE: check_execution_plan_safety
    # -----------------------------------------------------------------------

    def check_execution_plan_safety(self, plan, markets, options={}):
        """
        checks a plan against per-venue market rules and, when one is set, the per-trade USD notional cap. PURE — no I/O. A step that cannot be valued in USD BLOCKS while a cap is in force; it is never skipped, because a cap that silently disappears when a rate is missing is not a cap

        :param dict plan: a plan from build_execution_plan, or a caller-assembled plan of the same shape — this method never assumes the plan came from the routing service
        :param dict markets: a dictionary of exchangeId to that exchange's markets dictionary, i.e. markets[exchangeId][symbol]
        :param dict [options]: check options
        :param dict [options['usdRates']]: a dictionary of currency code to its USD price. USD itself is 1 implicitly; nothing else is assumed
        :param float [options['maxNotionalUsd']]: per-trade cap, honoured exactly, defaulting to the client's own; 0 or absent on both means no notional check runs
        :param str [options['precisionMode']]: tick_size(default) or decimal_places, matching the venue's precisionMode
        :returns list: the violations, each with stepIndex, code, blocking, actual, limit and a constant message. An empty list means the plan passed
        """
        violations = []
        # Honoured exactly as given, per call or per client. No clamping: a caller
        # trading thousands and a caller trading cents are both using this correctly.
        max_notional_usd = self.number_at(options, 'maxNotionalUsd', self.max_notional_usd)
        cap_in_force = max_notional_usd > 0
        usd_rates = self.dict_at(options, 'usdRates')
        precision_mode = self.string_at(options, 'precisionMode', 'tick_size')
        steps = self.list_at(plan, 'steps')
        if len(steps) == 0:
            # an empty plan passing an empty violation list would read as "safe"
            violations.append(self.violation(-1, '', '', 'empty_plan', True, 0, 0))
            return violations
        unroutable_reason = self.string_at(plan, 'unroutableReason', '')
        if unroutable_reason != '':
            violations.append(self.violation(-1, '', '', 'route_unroutable', True, 0, 0))
        if not self.bool_at(plan, 'fullyFillable', False):
            # BLOCKING when the caller asked for requireFullFill. That parameter is the one
            # route flag that fails OPEN: the service honouring it means an unfillable size
            # comes back unroutable, so a partial route in the same breath means the flag did
            # not survive the trip. Reporting that as the same advisory a caller who never set
            # it gets is exactly the silent downgrade from "refuse" to "shrink".
            required_full_fill = self.bool_at(plan, 'requireFullFill', False)
            violations.append(self.violation(-1, '', '', 'partial_fill', required_full_fill, self.number_at(plan, 'fillRatio', 0), 1))
        for i in range(len(steps)):
            step = steps[i]
            step_index = self.number_at(step, 'stepIndex', i)
            exchange_id = self.string_at(step, 'exchangeId', '')
            symbol = self.string_at(step, 'symbol', '')
            amount = self.number_at(step, 'amount', 0)
            expected_price = self.number_at(step, 'expectedPrice', 0)
            limit_price = self.step_limit_price(step)
            notional_quote = self.step_notional_quote(step)
            side = self.string_at(step, 'side', '')
            if amount <= 0 or expected_price <= 0 or (side != 'buy' and side != 'sell'):
                violations.append(self.violation(step_index, exchange_id, symbol, 'invalid_step', True, amount, 0))
                continue
            venue_markets = self.dict_at(markets, exchange_id)
            market = self.dict_at(venue_markets, symbol)
            if len(market) == 0:
                violations.append(self.violation(step_index, exchange_id, symbol, 'unknown_symbol', True, 0, 0))
                continue
            # the same symbol string on a different venue is not necessarily the
            # same pair, and the USD valuation below trusts the step's quote
            # currency — so disagreement is fatal, not cosmetic
            market_base = self.string_at(market, 'base', '')
            market_quote = self.string_at(market, 'quote', '')
            step_base = self.string_at(step, 'base', '')
            step_quote = self.string_at(step, 'quote', '')
            if (market_base != '' and step_base != '' and market_base != step_base) or (market_quote != '' and step_quote != '' and market_quote != step_quote):
                violations.append(self.violation(step_index, exchange_id, symbol, 'market_mismatch', True, 0, 0))
                continue
            limits = self.dict_at(market, 'limits')
            amount_limits = self.dict_at(limits, 'amount')
            price_limits = self.dict_at(limits, 'price')
            cost_limits = self.dict_at(limits, 'cost')
            min_amount = self.number_at(amount_limits, 'min', 0)
            max_amount = self.number_at(amount_limits, 'max', 0)
            min_price = self.number_at(price_limits, 'min', 0)
            max_price = self.number_at(price_limits, 'max', 0)
            min_cost = self.number_at(cost_limits, 'min', 0)
            if min_amount > 0 and amount < min_amount:
                violations.append(self.violation(step_index, exchange_id, symbol, 'amount_below_minimum', True, amount, min_amount))
            if max_amount > 0 and amount > max_amount:
                violations.append(self.violation(step_index, exchange_id, symbol, 'amount_above_maximum', True, amount, max_amount))
            if min_cost > 0 and notional_quote < min_cost:
                violations.append(self.violation(step_index, exchange_id, symbol, 'cost_below_minimum', True, notional_quote, min_cost))
            if (min_price > 0 and limit_price < min_price) or (max_price > 0 and limit_price > max_price):
                violations.append(self.violation(step_index, exchange_id, symbol, 'price_out_of_range', True, limit_price, min_price if limit_price < min_price else max_price))
            precision = self.dict_at(market, 'precision')
            amount_precision = self.number_at(precision, 'amount', 0)
            price_precision = self.number_at(precision, 'price', 0)
            # precision findings are advisory: execute() snaps through the
            # venue's own amount_to_precision/price_to_precision before sending
            if self.precision_violated(amount, amount_precision, precision_mode):
                violations.append(self.violation(step_index, exchange_id, symbol, 'amount_precision', False, amount, amount_precision))
            if self.precision_violated(limit_price, price_precision, precision_mode):
                violations.append(self.violation(step_index, exchange_id, symbol, 'price_precision', False, limit_price, price_precision))
            # the notional cap. The worst case is the higher of the expected and
            # the limit price, which is the buy side; a sell's limit sits below,
            # so its expected price is the one that governs.
            worst_price = expected_price
            if limit_price > worst_price:
                worst_price = limit_price
            if cap_in_force:
                # Only when a cap is actually set. With no cap there is nothing to
                # enforce, so a missing USD rate is not an error and the caller is not
                # made to supply usdRates for a check they did not ask for.
                worst_notional = amount * worst_price
                usd_value = self.notional_usd(step, worst_notional, usd_rates)
                if usd_value <= 0:
                    # BLOCKING, and deliberately so. Skipping the cap for a step whose
                    # USD value is unknown defeats the cap the caller DID ask for.
                    violations.append(self.violation(step_index, exchange_id, symbol, 'notional_unvaluable', True, worst_notional, max_notional_usd))
                elif usd_value > max_notional_usd * (1 + OrderRouter.TOLERANCE):
                    violations.append(self.violation(step_index, exchange_id, symbol, 'notional_exceeds_cap', True, usd_value, max_notional_usd))
        return violations

    def violation(self, step_index, exchange_id, symbol, code, blocking, actual, limit):
        """
        builds one safety violation record

        :param int step_index: the offending step, or -1 for a plan-level finding
        :param str exchange_id: the venue
        :param str symbol: the market
        :param str code: the violation code
        :param bool blocking: whether the violation forbids execution
        :param float actual: the observed value
        :param float limit: the value it was measured against
        :returns dict: the violation
        """
        return {
            'stepIndex': step_index,
            'exchangeId': exchange_id,
            'symbol': symbol,
            'code': code,
            'blocking': blocking,
            'actual': actual,
            'limit': limit,
            'message': self.string_at(VIOLATION_MESSAGES, code, code),
        }

    def notional_usd(self, step, notional_quote, usd_rates):
        """
        values a step's quote-currency notional in USD, returning 0 when it cannot be valued

        :param dict step: the plan step, used for its base and quote currencies
        :param float notional_quote: the notional in the market's quote currency
        :param dict usd_rates: a dictionary of currency code to USD price
        :returns float: the USD value, or 0 when no rate covers either side of the market
        """
        quote_currency = self.string_at(step, 'quote', '')
        quote_rate = self.usd_rate_for(quote_currency, usd_rates)
        if quote_rate > 0:
            return notional_quote * quote_rate
        # fall back to the base side: amount * usd(base) values the same trade
        base = self.string_at(step, 'base', '')
        base_rate = self.usd_rate_for(base, usd_rates)
        if base_rate > 0:
            return self.number_at(step, 'amount', 0) * base_rate
        return 0

    def usd_rate_for(self, code, usd_rates):
        """
        resolves the USD price of a currency, treating USD itself as 1 and assuming nothing about anything else

        :param str code: the currency code
        :param dict usd_rates: a dictionary of currency code to USD price
        :returns float: the rate, or 0 when unknown
        """
        if code == '':
            return 0
        if code == 'USD':
            return 1
        # USDT and USDC are NOT assumed to be one dollar. A stablecoin peg is an
        # empirical fact, not a definition, and the caller supplying rates is the
        # one who knows today's.
        rate = self.number_at(usd_rates, code, 0)
        if rate > 0:
            return rate
        return 0

    def precision_violated(self, value, precision, mode):
        """
        reports whether a value fails to sit on a market's precision grid

        :param float value: the amount or price
        :param float precision: the market precision, a tick size or a decimal-place count
        :param str mode: tick_size or decimal_places
        :returns bool: True when the value would have to be rounded before it could be sent
        """
        if precision <= 0:
            # unknown or unconstrained precision is not a finding
            return False
        if not math.isfinite(value):
            return False
        if mode == 'decimal_places':
            factor = math.pow(10, precision)
            rounded = self.round_half_up(value * factor) / factor
        else:
            # the rounding mode is irrelevant here: a value exactly halfway
            # between two ticks is off-grid whichever neighbour it snaps to, so
            # the six languages' differing round() semantics cannot change this
            # predicate's answer
            rounded = self.round_half_up(value / precision) * precision
        allowed = abs(value) * OrderRouter.TOLERANCE + 1e-15
        return abs(rounded - value) > allowed

    # -----------------------------------------------------------------------
    # PURE: reconcile_execution_step
    # -----------------------------------------------------------------------

    def reconcile_execution_step(self, plan, step_index, realised_out):
        """
        compares what a step actually produced against what the route predicted, resizes every downstream hop, and returns the proceed-or-halt verdict. PURE — no I/O. The halt decision lives here rather than in the execution loop because it is a money decision, and six separate loops is six chances to omit it

        :param dict plan: the plan, with any earlier resizes already applied to its steps
        :param int step_index: the step that just completed
        :param float realised_out: what it actually produced, in that step's output asset — base for a buy, quote for a sell
        :returns dict: the verdict, with expectedOut, realisedOut, shortfall, shortfallRatio, scale, verdict, reason and resizedSteps
        """
        steps = self.list_at(plan, 'steps')
        if step_index < 0 or step_index >= len(steps):
            raise BadRequest('reconcile_execution_step: step_index is out of range')
        step = steps[step_index]
        hop_index = self.number_at(step, 'hopIndex', 0)
        tolerance = self.number_at(plan, 'reconcileToleranceRatio', OrderRouter.DEFAULT_RECONCILE_TOLERANCE)
        expected_out = self.step_expected_out(step)
        resized = []
        if expected_out <= 0:
            return {
                'stepIndex': step_index,
                'hopIndex': hop_index,
                'expectedOut': 0,
                'realisedOut': realised_out,
                'shortfall': 0,
                'shortfallRatio': 0,
                'scale': 0,
                'verdict': 'halt',
                'reason': 'zero_expected_output',
                'resizedSteps': resized,
            }
        shortfall = expected_out - realised_out
        if shortfall < 0:
            shortfall = 0
        shortfall_ratio = shortfall / expected_out
        # the downstream hops lost `shortfall` out of this hop's whole output,
        # not out of this leg's, so the scale is measured against the hop
        hop_expected_out = 0
        # Shortfall already reported by this hop's OTHER legs. Each leg used to compute a scale
        # from the hop total and multiply the downstream amounts by it, so a second leg scaled an
        # already-scaled number: 80% and 60% fills produced 0.9 * 0.8 = 0.72 of the next hop
        # instead of the true 0.70. Reproduced at 144 against a true 140 before this changed.
        prior_shortfall = 0
        for other in steps:
            if self.number_at(other, 'hopIndex', 0) == hop_index:
                hop_expected_out = hop_expected_out + self.step_expected_out(other)
                if self.number_at(other, 'stepIndex', -1) != step_index and self.has_number_at(other, 'realisedOut'):
                    leg_shortfall = self.step_expected_out(other) - self.number_at(other, 'realisedOut', 0)
                    if leg_shortfall < 0:
                        leg_shortfall = 0
                    prior_shortfall = prior_shortfall + leg_shortfall
        # scale_before is what the downstream amounts have ALREADY been multiplied by, so the
        # factor applied here is the increment to the hop's true cumulative scale. With one leg
        # per hop prior_shortfall is 0 and this is identical to what it replaced.
        scale_before = 1
        scale_after = 1
        if hop_expected_out > 0:
            scale_before = (hop_expected_out - prior_shortfall) / hop_expected_out
            scale_after = (hop_expected_out - prior_shortfall - shortfall) / hop_expected_out
        if scale_before <= 0:
            scale_before = 1
            scale_after = 0
        scale = scale_after / scale_before
        if scale > 1:
            # never scale UP. An overfill is good news, but growing a downstream
            # order past the size that passed the safety check would place an
            # order nobody ever approved.
            scale = 1
        if scale < 0:
            scale = 0
        for i in range(len(steps)):
            other = steps[i]
            if self.number_at(other, 'hopIndex', 0) <= hop_index:
                continue
            previous_amount = self.number_at(other, 'amount', 0)
            amount = previous_amount * scale
            resized.append({
                'stepIndex': self.number_at(other, 'stepIndex', i),
                'previousAmount': previous_amount,
                'amount': amount,
                'notionalQuote': amount * self.number_at(other, 'expectedPrice', 0),
            })
        verdict = 'proceed'
        reason = 'within_tolerance'
        if realised_out <= 0:
            verdict = 'halt'
            reason = 'nothing_filled'
        elif shortfall_ratio > tolerance * (1 + OrderRouter.TOLERANCE):
            verdict = 'halt'
            reason = 'shortfall_exceeds_tolerance'
        return {
            'stepIndex': step_index,
            'hopIndex': hop_index,
            'expectedOut': expected_out,
            'realisedOut': realised_out,
            'shortfall': shortfall,
            'shortfallRatio': shortfall_ratio,
            'scale': scale,
            'verdict': verdict,
            'reason': reason,
            'resizedSteps': resized,
        }

    def step_expected_out(self, step):
        """
        how much of its output asset a step is expected to produce, net of the fee the router itself predicted

        :param dict step: the plan step
        :returns float: base units for a buy, quote units for a sell
        """
        amount = self.number_at(step, 'amount', 0)
        if self.string_at(step, 'side', '') == 'buy':
            # A buy produces BASE, and the router's predicted fee is quote-denominated, so
            # it does not reduce what this step hands to the next one. A venue that charges
            # its buy fee in the base asset really does deliver less, and the resize that
            # follows from it is correct.
            return amount
        # A SELL produces QUOTE, which is the currency the predicted fee is already in.
        #
        # This subtraction is what stops the fee being counted TWICE. execute() reports
        # realisedOut net of a fee charged in the asset the step produced, because that is
        # what the wallet actually receives. The router, in turn, already sized the next hop
        # from its own NET figure: in the shared fixture, hop 0 sells 500 DOGE at 0.089 for
        # 44.5 gross, reports amountOut 44.47482324238088 after a 0.025176757619121304 USDT
        # fee, and hop 1's amountIn is that net number to the last digit. Measuring the
        # expectation gross against a realised amount that is net therefore reported a
        # shortfall on a PERFECT fill and shrank the next hop by the fee a second time,
        # stranding it in the bridge asset.
        #
        # Gross stays gross where gross is right: notionalQuote is what the order is worth
        # to the venue and is untouched, as is the notional cap built on it.
        gross = amount * self.number_at(step, 'expectedPrice', 0)
        expected_fee = self.number_at(step, 'expectedFeeCost', 0)
        if expected_fee <= 0 or expected_fee >= gross:
            # a fee at or above the whole proceeds is not a fee this class will subtract: it
            # would report an expectation of zero or less and turn every fill into a halt
            return gross
        return gross - expected_fee

    # -----------------------------------------------------------------------
    # PURE: build_unwind_plan
    # -----------------------------------------------------------------------

    def build_unwind_plan(self, report):
        """
        given a halted execution report, computes the reverse orders that sell each stranded residual back toward the original from-asset, on the venue that actually holds it. PURE — no I/O. NEVER automatic: the result carries requiresConfirmation and nothing in this class executes it

        :param dict report: an execution report from execute
        :returns dict: the unwind plan, with steps[] in reverse execution order and unresolved[] for residuals that cannot be reversed
        """
        from_asset = self.string_at(report, 'from', '')
        to_asset = self.string_at(report, 'to', '')
        slippage_bps = self.number_at(report, 'slippageBps', OrderRouter.DEFAULT_SLIPPAGE_BPS)
        results = self.list_at(report, 'steps')
        # net position per (exchangeId, asset). Held in a LIST rather than a dict
        # because the output order must be identical in six languages and map
        # iteration order is not.
        positions = []
        for i in range(len(results) - 1, -1, -1):
            result = results[i]
            exchange_id = self.string_at(result, 'exchangeId', '')
            out_asset = self.string_at(result, 'outAsset', '')
            out_amount = self.number_at(result, 'outAmount', 0)
            if out_asset != '' and out_amount > 0:
                self.add_position(positions, exchange_id, out_asset, out_amount, result, True)
            in_asset = self.string_at(result, 'inAsset', '')
            in_amount = self.number_at(result, 'inAmount', 0)
            if in_asset != '' and in_amount > 0:
                # what a later hop consumed on this venue is not a residual.
                # Netting is per venue: assets sitting on a venue the route never
                # spent them on stay stranded, because this class never moves
                # funds between venues.
                self.add_position(positions, exchange_id, in_asset, -in_amount, result, False)
        steps = []
        unresolved = []
        residual_count = 0
        for position in positions:
            asset = self.string_at(position, 'asset', '')
            amount = self.number_at(position, 'amount', 0)
            exchange_id = self.string_at(position, 'exchangeId', '')
            if amount <= 0:
                continue
            if asset == from_asset:
                # already home
                continue
            residual_count = residual_count + 1
            source = self.dict_at(position, 'source')
            symbol = self.string_at(source, 'symbol', '')
            source_side = self.string_at(source, 'side', '')
            price = self.number_at(source, 'averagePrice', 0)
            if price <= 0:
                price = self.number_at(source, 'expectedPrice', 0)
            if symbol == '' or (source_side != 'buy' and source_side != 'sell'):
                unresolved.append({'exchangeId': exchange_id, 'asset': asset, 'amount': amount, 'reason': 'no_source_market'})
                continue
            if price <= 0:
                unresolved.append({'exchangeId': exchange_id, 'asset': asset, 'amount': amount, 'reason': 'no_price'})
                continue
            # reverse the order that created the residual: a buy left you holding
            # base, so sell it back; a sell left you holding quote, so buy the
            # base back with it
            # the counter asset is whatever the reversed order gives back, which
            # is exactly what the original order spent
            counter_asset = self.string_at(source, 'inAsset', '')
            if source_side == 'buy':
                side = 'sell'
                market_base = self.string_at(source, 'outAsset', '')
                market_quote = self.string_at(source, 'inAsset', '')
            else:
                side = 'buy'
                market_base = self.string_at(source, 'inAsset', '')
                market_quote = self.string_at(source, 'outAsset', '')
            # the limit price comes FIRST, because the buy below is sized on it.
            if side == 'buy':
                limit_price = price * (1 + slippage_bps / 10000)
            else:
                limit_price = price * (1 - slippage_bps / 10000)
            if side == 'buy':
                # Size the buy on the price it is actually PLACED at, not on the
                # expected price. A residual of 44.5 USDT sized at 0.089 is 500
                # DOGE, but the order goes out at 0.0892225 and would need 44.61
                # USDT to fill - 0.11 more than the venue holds. The venue rejects
                # it for insufficient funds, or fills it partially and leaves the
                # rest of the stranded money stranded. Dividing by limit_price
                # spends at most the residual.
                unwind_amount = amount / limit_price
            else:
                unwind_amount = amount
            steps.append({
                'stepIndex': len(steps),
                'exchangeId': exchange_id,
                'symbol': symbol,
                'side': side,
                # base and quote are carried so that an unwind plan can be fed
                # straight back into check_execution_plan_safety: unwinding is
                # trading, and it is subject to the same 25 USD cap
                'base': market_base,
                'quote': market_quote,
                'asset': asset,
                'counterAsset': counter_asset,
                'amount': unwind_amount,
                'expectedPrice': price,
                'limitPrice': limit_price,
                # notional at the price the order is actually placed at: this
                # plan is fed back into check_execution_plan_safety, and a cap
                # that was checked against the expected price under-counts what
                # the buy above really spends.
                'notionalQuote': unwind_amount * limit_price,
                'reachesFrom': counter_asset == from_asset,
                'isDestination': asset == to_asset,
            })
        return {
            'from': from_asset,
            'to': to_asset,
            'halted': self.bool_at(report, 'halted', False),
            'haltReason': self.string_at(report, 'haltReason', ''),
            'residualCount': residual_count,
            'requiresConfirmation': True,
            'automatic': False,
            'steps': steps,
            'unresolved': unresolved,
        }

    def add_position(self, positions, exchange_id, asset, amount, source, produced):
        """
        accumulates a signed amount into the(exchangeId, asset) position list, appending in first-seen order

        :param list positions: the accumulator
        :param str exchange_id: the venue
        :param str asset: the currency
        :param float amount: the signed amount, positive for produced and negative for consumed
        :param dict source: the step result this amount came from
        :param bool produced: True when this step PRODUCED the asset, which is the only kind of step an unwind can reverse
        :returns None:
        """
        for position in positions:
            if position['exchangeId'] == exchange_id and position['asset'] == asset:
                position['amount'] = self.number_at(position, 'amount', 0) + amount
                if produced and len(self.dict_at(position, 'source')) == 0:
                    position['source'] = source
                return
        # the source must be the step that PRODUCED the asset, never one that
        # consumed it: reversing a step that spent your USDT would sell the wrong
        # side of the wrong market. Walking the results backwards, the first
        # producing step seen is the last one that ran, which is exactly the
        # order an unwind undoes first.
        initial_source = source if produced else {}
        positions.append({'exchangeId': exchange_id, 'asset': asset, 'amount': amount, 'source': initial_source})

    def plan_identity(self, plan, options):
        """
        the stable identity of an execution, used for the re-execution guard

        :param dict plan: the plan
        :param dict options: the execute options
        :returns str: the identity, or '' when neither source carries one
        """
        # A caller-supplied idempotencyKey WINS over the plan's own requestId. Passing one is
        # a deliberate statement about what this execution is, and it is the only identity a
        # hand-assembled plan can have: execute() takes any dictionary of the plan shape, not
        # only the output of build_execution_plan, and a plan a user built themselves never
        # went through a routing request and so never had a requestId.
        idempotency_key = self.string_at(options, 'idempotencyKey', '')
        if idempotency_key != '':
            return idempotency_key
        # otherwise requestId, the one field a routed plan carries that is meant to be unique;
        # it survives JSON, storage and a hand-rebuilt tail of a halted route. Nothing is
        # invented when both are absent — a generated identity would be either random, which
        # defeats the guard that depends on it, or a fingerprint of the plan's contents,
        # which makes two plans that happen to agree indistinguishable. Absence is reported,
        # and execute refuses.
        return self.string_at(plan, 'requestId', '')

    def has_executed_plan(self, plan_id):
        """
        reports whether this instance has executed the given plan id recently enough for the bounded ledger to still remember it

        :param str plan_id: the plan identity from plan_identity
        :returns bool: True when the id is still in the ledger
        """
        # a hash lookup, not a scan: the ledger is capped but still up to
        # MAX_EXECUTED_PLAN_IDS long, and it runs on every live execution
        return plan_id in self.executed_plan_id_set

    def record_executed_plan(self, plan_id):
        """
        records one plan id in the bounded ledger, evicting the oldest entry when the cap is reached

        :param str plan_id: the plan identity from plan_identity
        :returns None:
        """
        if self.has_executed_plan(plan_id):
            # already recorded; re-recording it would move it in the FIFO order and let a
            # repeatedly re-executed plan keep other ids alive or evict them out of turn
            return
        self.executed_plan_ids.append(plan_id)
        self.executed_plan_id_set.add(plan_id)
        while len(self.executed_plan_ids) > OrderRouter.MAX_EXECUTED_PLAN_IDS:
            # FIFO: the OLDEST execution is the one whose duplicate is least likely still in
            # flight. Evicting it drops the refusal for that plan — see the comment on
            # MAX_EXECUTED_PLAN_IDS; this is a bounded memory promise, not a stronger
            # idempotency one.
            evicted = self.executed_plan_ids.pop(0)
            self.executed_plan_id_set.discard(evicted)

    # -----------------------------------------------------------------------
    # IMPURE: execute
    # -----------------------------------------------------------------------

    def execute(self, plan, venues, options={}):
        """
        executes a plan against live exchange instances. THE ONLY IMPURE METHOD. dry_run is the default and options['live'] is not True forces dry_run regardless of the strategy requested, so a call that looks live but forgot the flag places nothing

        :param dict plan: a plan from build_execution_plan, or a caller-assembled plan of the same shape — this method never assumes the plan came from the routing service
        :param dict venues: a dictionary of exchangeId to a ccxt exchange instance
        :param dict [options]: execution options
        :param str [options['strategy']]: dry_run, sequential, parallel_within_hop, limit_protected, best_effort or atomic_ish
        :param bool [options['live']]: must be exactly True for any order to be placed
        :param dict [options['usdRates']]: currency code to USD price, required when live and a notional cap is set, because the cap cannot be enforced without it
        :param bool [options['allowMarketOrders']]: permit a market order when the venue cannot do IOC, default False
        :param int [options['maxOrders']]: hard order-count cap, required by best_effort
        :param bool [options['acknowledgeDispersion']]: required by best_effort, which can leave you holding an unintended asset mix
        :param int [options['orderTimeoutMs']]: how long limit_protected leaves an order resting, default 20000
        :param int [options['pollIntervalMs']]: how often limit_protected checks a resting order, default 1000
        :param dict [options['orderParams']]: extra params merged into every create_order call
        :param str [options['idempotencyKey']]: the identity of this execution, required when the plan carries no requestId; it keys the re-execution guard, and OVERRIDES the plan's requestId when both are given
        :param bool [options['allowReexecution']]: must be exactly True to run a plan this instance has already executed live; the DEFAULT is refusal
        :param int [options['retryFailedSteps']]: how many times to re-place a step the venue DEFINITIVELY REJECTED, default 0. An outcome_unknown step is never retried at any setting: it may already be a live position, and re-placing it is the double-fill this class exists to prevent. The router sets no client order id, so a retry is a fresh order to the venue
        :param int [options['retryDelayMs']]: how long to wait before a retry, default 1000
        :param callable [options['onStep']]: called after each step completes and reconciles, never mid-order, with one event dict describing that step. Return 'halt' to stop the route cleanly(haltReason becomes halted_by_on_step); any other value continues. It can only STOP a route, never resume one already halted. Do NO network I/O here — it sits between orders on the money path. A hook that raises is recorded as on_step_hook_failed and the run continues, because losing the report would destroy the only account of orders that are already live
        :returns dict: an execution report with per-step results, openOrders, errors and the halt verdict
        """
        requested_strategy = self.string_at(options, 'strategy', 'dry_run')
        if requested_strategy not in KNOWN_STRATEGIES:
            raise BadRequest('OrderRouter: unknown execution strategy ' + requested_strategy)
        # THE default. Anything short of an explicit True is a rehearsal — and
        # `is True` is deliberate, so that 1 and 'true' are not-live too.
        live = options.get('live') is True
        strategy = requested_strategy if live else 'dry_run'
        steps = self.clone_steps(plan)
        report = self.empty_report(plan, strategy, requested_strategy, live, steps)
        # resolved from BOTH the plan and the options, so a hand-assembled plan can carry an
        # identity too; reported on every report, rehearsals included
        plan_id = self.plan_identity(plan, options)
        report['planId'] = plan_id
        # How old the prices in this plan are. ALWAYS reported, even when nothing is enforced: a plan
        # is a snapshot of a book, and how stale that snapshot is decides whether any number in it
        # means anything. -1 when the route carried no calculatedAt, which is not the same as "fresh"
        # and must not read like it. Enforced only if asked for, at whatever value is asked for — the
        # same shape as maxNotionalUsd, and for the same reason. But an age that cannot be determined
        # BLOCKS under an active limit: a freshness check that silently passes when the timestamp is
        # missing is not a freshness check.
        calculated_at = self.number_at(plan, 'calculatedAt', 0)
        plan_age_ms = (self.now_ms() - calculated_at) if calculated_at > 0 else -1
        report['planAgeMs'] = plan_age_ms
        max_plan_age_ms = self.number_at(options, 'maxPlanAgeMs', 0)
        if live and max_plan_age_ms > 0:
            if plan_age_ms < 0:
                raise ExchangeError('OrderRouter: refusing to execute, the plan carries no calculatedAt and maxPlanAgeMs was set')
            if plan_age_ms > max_plan_age_ms:
                raise ExchangeError('OrderRouter: refusing to execute a plan older than maxPlanAgeMs, recompute the route')
        if strategy == 'dry_run':
            # not one call is made against a venue on this path, not even a read
            report['wouldPlaceOrders'] = len(steps)
            return report
        if len(venues) == 0:
            raise ArgumentsRequired('OrderRouter.execute requires a venues dictionary when live')
        # IDEMPOTENCY, half one: a plan this instance has already run live is REFUSED, and
        # refused here — before a single read reaches a venue. The ledger is consulted now and
        # written only once the plan is about to be dispatched, so a caller error that placed
        # nothing does not burn the plan. dry_run never reaches this line and never consumes a
        # plan, because a rehearsal places nothing.
        if plan_id == '':
            # no identity means no idempotency: the ledger below cannot key on it, so a
            # re-run of this plan would be indistinguishable from a first run.
            raise BadRequest('OrderRouter: refusing to execute live without an identity, the plan carries no requestId — pass options.idempotencyKey')
        if options.get('allowReexecution') is not True:
            if self.has_executed_plan(plan_id):
                raise BadRequest('OrderRouter: refusing to re-execute a plan this instance already executed, pass allowReexecution to override')
        # derived from the steps about to be executed, NEVER read off the plan: a
        # plan that travelled through JSON, a persisted step list or a hand-rebuilt
        # tail of a halted route can be missing hopCount, and a refusal that a
        # missing key switches off is not a refusal
        hop_count = self.hop_count_of(steps)
        if strategy == 'best_effort':
            if hop_count > 1:
                # best-effort multi-hop is the most reliable way to strand money
                # in a bridge asset
                raise NotSupported('OrderRouter: best_effort refuses multi-hop routes')
            if options.get('acknowledgeDispersion') is not True:
                raise BadRequest('OrderRouter: best_effort requires acknowledgeDispersion')
            if self.number_at(options, 'maxOrders', 0) <= 0:
                raise BadRequest('OrderRouter: best_effort requires a positive maxOrders')
        if strategy == 'limit_protected':
            # Refused HERE, before a single order is placed, because the alternative is worse than a
            # bad interval: the poll loop advances its clock by this value, so a zero or negative one
            # never reaches the timeout. It spins on fetchOrder forever with a real order resting on a
            # real venue, and the timeout that exists to cancel that order never arrives.
            if self.has_number_at(options, 'pollIntervalMs') and self.number_at(options, 'pollIntervalMs', 0) <= 0:
                raise BadRequest('OrderRouter: pollIntervalMs must be positive, a resting order is polled on that clock')
        # markets are needed for the safety check and for precision snapping
        markets = {}
        for exchange_id in sorted(venues.keys()):
            venue = venues[exchange_id]
            if len(self.dict_at(venue, 'markets')) == 0:
                venue.load_markets()
            markets[exchange_id] = self.dict_at(venue, 'markets')
        usd_rates = self.dict_at(options, 'usdRates')
        safety_options = {
            'usdRates': usd_rates,
            'maxNotionalUsd': self.number_at(options, 'maxNotionalUsd', self.max_notional_usd),
            'precisionMode': self.string_at(options, 'precisionMode', 'tick_size'),
        }
        violations = self.check_execution_plan_safety(plan, markets, safety_options)
        blockers = ''
        for violation in violations:
            if self.bool_at(violation, 'blocking', False):
                if blockers != '':
                    blockers = blockers + ', '
                blockers = blockers + self.string_at(violation, 'code', '')
        if blockers != '':
            # raised, not reported. A refusal a caller can forget to read is not
            # a refusal.
            raise ExchangeError('OrderRouter: refusing to execute, blocking safety violations: ' + blockers)
        if strategy == 'atomic_ish':
            self.assert_prefunded(steps, venues)
        # the ledger is written BEFORE the first order goes out, never after: a run that
        # raises half way through has still placed orders, and a guard that only recorded
        # completed runs would wave through exactly the retry that double-fills.
        self.record_executed_plan(plan_id)
        if strategy == 'parallel_within_hop':
            self.execute_parallel_within_hop(report, steps, venues, options, usd_rates)
        elif strategy == 'best_effort':
            self.execute_best_effort(report, steps, venues, options, usd_rates)
        else:
            # sequential, limit_protected and atomic_ish all walk the plan one
            # order at a time; they differ in how a single order is placed and in
            # whether they lean on the previous hop's proceeds
            self.execute_sequential(report, steps, venues, options, usd_rates, strategy)
        self.summarise_report(report, steps)
        return report

    def hop_count_of(self, steps):
        """
        counts the distinct hops a step list spans, which is the only authority on whether a plan is multi-hop

        :param list steps: the working steps
        :returns int: the number of distinct hopIndex values
        """
        # a list rather than a set, so the count is the same in six languages
        # and does not depend on hash iteration order
        seen = []
        for step in steps:
            hop_index = self.number_at(step, 'hopIndex', 0)
            found = False
            for value in seen:
                if value == hop_index:
                    found = True
                    break
            if not found:
                seen.append(hop_index)
        return len(seen)

    def clone_steps(self, plan):
        """
        copies a plan's steps so that execution-time resizing never mutates the caller's plan

        :param dict plan: the plan
        :returns list: a fresh list of fresh step dictionaries
        """
        steps = self.list_at(plan, 'steps')
        copies = []
        for i in range(len(steps)):
            step = steps[i]
            copies.append({
                'stepIndex': self.number_at(step, 'stepIndex', i),
                'hopIndex': self.number_at(step, 'hopIndex', 0),
                'legIndex': self.number_at(step, 'legIndex', 0),
                'exchangeId': self.string_at(step, 'exchangeId', ''),
                'symbol': self.string_at(step, 'symbol', ''),
                'side': self.string_at(step, 'side', ''),
                'base': self.string_at(step, 'base', ''),
                'quote': self.string_at(step, 'quote', ''),
                'amount': self.number_at(step, 'amount', 0),
                'expectedPrice': self.number_at(step, 'expectedPrice', 0),
                'effectivePrice': self.number_at(step, 'effectivePrice', 0),
                'limitPrice': self.step_limit_price(step),
                'notionalQuote': self.step_notional_quote(step),
                # carried through the clone because execute() reconciles against THESE
                # steps, not the plan's: without it the fee netting would be measured
                # against a gross expectation on every live run
                'expectedFeeCost': self.number_at(step, 'expectedFeeCost', 0),
            })
        return copies

    def empty_report(self, plan, strategy, requested_strategy, live, steps):
        """
        builds the report skeleton, with every step marked planned

        :param dict plan: the plan being executed
        :param str strategy: the strategy actually in force
        :param str requested_strategy: the strategy asked for, which differs when live was not set
        :param bool live: whether orders may be placed
        :param list steps: the working copy of the plan's steps
        :returns dict: the report
        """
        results = []
        for i in range(len(steps)):
            step = steps[i]
            results.append({
                'stepIndex': self.number_at(step, 'stepIndex', i),
                'hopIndex': self.number_at(step, 'hopIndex', 0),
                'legIndex': self.number_at(step, 'legIndex', 0),
                'exchangeId': self.string_at(step, 'exchangeId', ''),
                'symbol': self.string_at(step, 'symbol', ''),
                'side': self.string_at(step, 'side', ''),
                'status': 'planned',
                'requestedAmount': self.number_at(step, 'amount', 0),
                'filledAmount': 0,
                'averagePrice': 0,
                'expectedPrice': self.number_at(step, 'expectedPrice', 0),
                'cost': 0,
                'inAsset': '',
                'inAmount': 0,
                'outAsset': '',
                'outAmount': 0,
                'orderId': '',
                'clientOrderId': '',
                'errorCode': '',
                # which retry produced this result; 0 unless retryFailedSteps re-placed it
                'attempt': 0,
            })
        return {
            # a placeholder: execute resolves the real identity from the plan AND the options
            # and overwrites it before anything reads this field
            'planId': '',
            'strategy': strategy,
            'requestedStrategy': requested_strategy,
            'dryRun': strategy == 'dry_run',
            'live': live,
            'from': self.string_at(plan, 'from', ''),
            'to': self.string_at(plan, 'to', ''),
            'slippageBps': self.number_at(plan, 'slippageBps', OrderRouter.DEFAULT_SLIPPAGE_BPS),
            'reconcileToleranceRatio': self.number_at(plan, 'reconcileToleranceRatio', OrderRouter.DEFAULT_RECONCILE_TOLERANCE),
            'stepCount': len(steps),
            'wouldPlaceOrders': 0,
            'ordersPlaced': 0,
            'halted': False,
            'haltReason': '',
            'haltStepIndex': -1,
            'filledIn': 0,
            'filledOut': 0,
            'steps': results,
            'openOrders': [],
            'errors': [],
            'reconciliations': [],
        }

    def execute_sequential(self, report, steps, venues, options, usd_rates, strategy):
        """
        places one order at a time in plan order, reconciling after each and obeying the halt verdict

        :param dict report: the report being filled in
        :param list steps: the working steps, resized in place as hops complete
        :param dict venues: exchangeId to exchange instance
        :param dict options: the execute options
        :param dict usd_rates: currency code to USD price
        :param str strategy: sequential, limit_protected or atomic_ish
        :returns None:
        """
        results = self.list_at(report, 'steps')
        for i in range(len(steps)):
            step = steps[i]
            result = self.place_step_with_retry(step, venues, options, usd_rates, strategy, report)
            results[i] = result
            status = self.string_at(result, 'status', '')
            if status in ('failed', 'outcome_unknown'):
                report['halted'] = True
                # An unknown outcome must NOT fall through to reconciliation. Reconciling reads
                # outAmount, which is 0 because nothing was observed, and reports the halt as
                # 'nothing_filled' — asserting the one thing we do not know.
                report['haltReason'] = 'order_failed' if status == 'failed' else 'outcome_unknown'
                report['haltStepIndex'] = i
                # the hook is told about a halt it did not cause, and cannot undo it
                self.call_on_step(options, report, result, {}, i, len(steps))
                self.mark_remaining_skipped(results, i + 1)
                return
            reconciliation = self.reconcile_execution_step({'steps': steps, 'reconcileToleranceRatio': self.number_at(report, 'reconcileToleranceRatio', OrderRouter.DEFAULT_RECONCILE_TOLERANCE)}, i, self.number_at(result, 'outAmount', 0))
            report['reconciliations'].append(reconciliation)
            if strategy != 'atomic_ish':
                # atomic_ish is pre-funded end to end, so a hop's shortfall does
                # not shrink the next hop's order — the money for it was already
                # there before the first order went out
                self.apply_resize(steps, reconciliation)
            if self.string_at(reconciliation, 'verdict', '') == 'halt':
                report['halted'] = True
                report['haltReason'] = self.string_at(reconciliation, 'reason', '')
                report['haltStepIndex'] = i
                self.call_on_step(options, report, result, reconciliation, i, len(steps))
                self.mark_remaining_skipped(results, i + 1)
                return
            # the caller's own verdict, consulted only once the route is otherwise sound. It can
            # stop the route; it cannot restart one the reconciliation above already stopped.
            if self.call_on_step(options, report, result, reconciliation, i, len(steps)) == 'halt':
                report['halted'] = True
                report['haltReason'] = 'halted_by_on_step'
                report['haltStepIndex'] = i
                self.mark_remaining_skipped(results, i + 1)
                return

    def execute_parallel_within_hop(self, report, steps, venues, options, usd_rates):
        """
        runs the legs of one hop concurrently and the hops strictly in order

        :param dict report: the report being filled in
        :param list steps: the working steps
        :param dict venues: exchangeId to exchange instance
        :param dict options: the execute options
        :param dict usd_rates: currency code to USD price
        :returns None:
        """
        results = self.list_at(report, 'steps')
        cursor = 0
        while cursor < len(steps):
            hop_index = self.number_at(steps[cursor], 'hopIndex', 0)
            end = cursor
            while end < len(steps) and self.number_at(steps[end], 'hopIndex', 0) == hop_index:
                end = end + 1
            # place_step contains its own failures and never raises, so "wait for
            # all" means the same thing in all six languages. Without that
            # containment JavaScript rejects fast while sibling orders are still
            # live, and Go's promiseAll waits for every one — the same source
            # abandoning in-flight orders differently per language.
            # THE CONTRACT: concurrent ACROSS venues, serialised WITHIN a venue. An ordering
            # guarantee rather than a performance promise, which is what lets six very different
            # runtimes honour the same words. This fan-out used to be one thread per LEG against
            # caller-supplied SYNC exchange instances, so two legs on one venue mutated that
            # instance's throttle and nonce state with no lock — the worst of the three meanings
            # this strategy had.
            venue_groups = []
            grouped_indices = []
            for i in range(cursor, end):
                exchange_id = self.string_at(steps[i], 'exchangeId', '')
                if exchange_id in venue_groups:
                    grouped_indices[venue_groups.index(exchange_id)].append(i)
                else:
                    venue_groups.append(exchange_id)
                    grouped_indices.append([i])
            pending = []
            with ThreadPoolExecutor(max_workers=len(grouped_indices)) as pool:
                for group in grouped_indices:
                    pending.append(pool.submit(self.place_venue_group, group, steps, venues, options, usd_rates, report, results))
                for future in pending:
                    future.result()
            for i in range(cursor, end):
                result = results[i]
                status = self.string_at(result, 'status', '')
                if status in ('failed', 'outcome_unknown'):
                    report['halted'] = True
                    report['haltReason'] = 'order_failed' if status == 'failed' else 'outcome_unknown'
                    report['haltStepIndex'] = i
                    self.call_on_step(options, report, result, {}, i, len(steps))
                    self.mark_remaining_skipped(results, end)
                    return
                reconciliation = self.reconcile_execution_step({'steps': steps, 'reconcileToleranceRatio': self.number_at(report, 'reconcileToleranceRatio', OrderRouter.DEFAULT_RECONCILE_TOLERANCE)}, i, self.number_at(result, 'outAmount', 0))
                report['reconciliations'].append(reconciliation)
                self.apply_resize(steps, reconciliation)
                if self.string_at(reconciliation, 'verdict', '') == 'halt':
                    report['halted'] = True
                    report['haltReason'] = self.string_at(reconciliation, 'reason', '')
                    report['haltStepIndex'] = i
                    self.call_on_step(options, report, result, reconciliation, i, len(steps))
                    self.mark_remaining_skipped(results, end)
                    return
                if self.call_on_step(options, report, result, reconciliation, i, len(steps)) == 'halt':
                    report['halted'] = True
                    report['haltReason'] = 'halted_by_on_step'
                    report['haltStepIndex'] = i
                    self.mark_remaining_skipped(results, end)
                    return
            cursor = end

    def place_venue_group(self, indices, steps, venues, options, usd_rates, report, results):
        """
        places one venue's legs strictly one at a time — the "serialised within a venue" half of
        the parallel_within_hop contract

        :param list indices: positions in steps that belong to this venue
        :returns None:
        """
        for position in indices:
            results[position] = self.place_step_with_retry(steps[position], venues, options, usd_rates, 'parallel_within_hop', report)

    def execute_best_effort(self, report, steps, venues, options, usd_rates):
        """
        places what it can and never halts, on a single hop only, up to maxOrders

        :param dict report: the report being filled in
        :param list steps: the working steps
        :param dict venues: exchangeId to exchange instance
        :param dict options: the execute options
        :param dict usd_rates: currency code to USD price
        :returns None:
        """
        results = self.list_at(report, 'steps')
        max_orders = self.number_at(options, 'maxOrders', 0)
        placed = 0
        for i in range(len(steps)):
            if placed >= max_orders:
                results[i]['status'] = 'skipped'
                results[i]['errorCode'] = 'max_orders_reached'
                continue
            results[i] = self.place_step_with_retry(steps[i], venues, options, usd_rates, 'best_effort', report)
            placed = placed + 1
            # no reconciliation and no halt: that is the whole point of the
            # strategy, and why it is refused on anything but a single hop. The hook is still
            # offered every step, and stopping early is the one thing it may do here — that is
            # a smaller commitment than the strategy's own contract, never a larger one.
            if self.call_on_step(options, report, results[i], {}, i, len(steps)) == 'halt':
                report['halted'] = True
                report['haltReason'] = 'halted_by_on_step'
                report['haltStepIndex'] = i
                self.mark_remaining_skipped(results, i + 1)
                return

    def place_step_with_retry(self, step, venues, options, usd_rates, strategy, report):
        """
        places one step, re-placing it up to options['retryFailedSteps'] times when — and ONLY when — the venue definitively rejected it

        :param dict step: the step to trade
        :param dict venues: exchangeId to exchange instance
        :param dict options: the execute options
        :param dict usd_rates: currency code to USD price
        :param str strategy: the strategy in force
        :param dict report: the report, for openOrders and errors
        :returns dict: the step result of the last attempt
        """
        max_retries = self.number_at(options, 'retryFailedSteps', 0)
        retry_delay_ms = self.number_at(options, 'retryDelayMs', OrderRouter.DEFAULT_RETRY_DELAY_MS)
        attempt = 0
        result = {}
        while True:
            step['attempt'] = attempt
            result = self.place_step(step, venues, options, usd_rates, strategy, report)
            status = self.string_at(result, 'status', '')
            # 'failed' is the ONLY retryable outcome, and the distinction is the whole safety
            # argument. A failed step was refused by the venue: nothing was placed, so placing
            # it again cannot double-fill. An 'outcome_unknown' step may ALREADY be a live
            # position that simply could not be read back, and re-placing that is precisely the
            # double-fill this class exists to prevent. It is never retried, at any setting.
            if status != 'failed' or attempt >= max_retries:
                return result
            attempt = attempt + 1
            if retry_delay_ms > 0:
                self.sleep(retry_delay_ms)

    def call_on_step(self, options, report, result, reconciliation, step_index, steps_total):
        """
        hands the caller's onStep hook one finished step and returns its verdict, treating any failure of the hook as 'no opinion'

        :param dict options: the execute options, which may carry onStep
        :param dict report: the report so far
        :param dict result: the finished step result
        :param dict reconciliation: the step's reconciliation, empty when it halted before reconciling
        :param int step_index: the step's index
        :param int steps_total: how many steps the plan has
        :returns str: 'halt' to stop, anything else to continue
        """
        on_step = options.get('onStep')
        if on_step is None:
            return ''
        event = {
            'planId': self.string_at(report, 'planId', ''),
            'stepIndex': step_index,
            'hopIndex': self.number_at(result, 'hopIndex', 0),
            'legIndex': self.number_at(result, 'legIndex', 0),
            'exchangeId': self.string_at(result, 'exchangeId', ''),
            'symbol': self.string_at(result, 'symbol', ''),
            'side': self.string_at(result, 'side', ''),
            'status': self.string_at(result, 'status', ''),
            'requestedAmount': self.number_at(result, 'requestedAmount', 0),
            'filledAmount': self.number_at(result, 'filledAmount', 0),
            'outAsset': self.string_at(result, 'outAsset', ''),
            'outAmount': self.number_at(result, 'outAmount', 0),
            'orderId': self.string_at(result, 'orderId', ''),
            'clientOrderId': self.string_at(result, 'clientOrderId', ''),
            'errorCode': self.string_at(result, 'errorCode', ''),
            'attempt': self.number_at(result, 'attempt', 0),
            'reconciliation': reconciliation,
            'ordersPlaced': self.number_at(report, 'ordersPlaced', 0),
            'halted': self.bool_at(report, 'halted', False),
            'haltReason': self.string_at(report, 'haltReason', ''),
            'stepsTotal': steps_total,
            'stepsRemaining': steps_total - (step_index + 1),
        }
        try:
            verdict = on_step(event)
            if verdict == 'halt':
                return 'halt'
            return ''
        except Exception as e:
            # A hook that raises must NOT take the run with it. Everything placed so far is
            # recorded in this report, and losing it to an exception raised by observability
            # code would destroy the only account of orders that are already live. The failure
            # is recorded and the run proceeds exactly as if the hook had no opinion.
            self.record_error(report, step_index, self.string_at(result, 'exchangeId', ''), self.string_at(result, 'symbol', ''), 'on_step_hook_failed:' + self.error_code_of(e))
            return ''

    def place_step(self, step, venues, options, usd_rates, strategy, report):
        """
        places one order for one step and never raises, so that a sibling leg's failure cannot abandon an in-flight order

        :param dict step: the step to trade
        :param dict venues: exchangeId to exchange instance
        :param dict options: the execute options
        :param dict usd_rates: currency code to USD price
        :param str strategy: the strategy in force, which decides limit resting behaviour
        :param dict report: the report, for openOrders and errors
        :returns dict: the step result
        """
        step_index = self.number_at(step, 'stepIndex', 0)
        exchange_id = self.string_at(step, 'exchangeId', '')
        symbol = self.string_at(step, 'symbol', '')
        side = self.string_at(step, 'side', '')
        result = {
            'stepIndex': step_index,
            'hopIndex': self.number_at(step, 'hopIndex', 0),
            'legIndex': self.number_at(step, 'legIndex', 0),
            'exchangeId': exchange_id,
            'symbol': symbol,
            'side': side,
            'status': 'failed',
            'requestedAmount': self.number_at(step, 'amount', 0),
            'filledAmount': 0,
            'averagePrice': 0,
            'expectedPrice': self.number_at(step, 'expectedPrice', 0),
            'cost': 0,
            'inAsset': '',
            'inAmount': 0,
            'outAsset': '',
            'outAmount': 0,
            'orderId': '',
            'clientOrderId': '',
            'errorCode': '',
            # False until an order is actually dispatched; see the assignment at each create_order
            'placementAttempted': False,
        }
        try:
            venue = venues.get(exchange_id)
            if venue is None:
                result['errorCode'] = 'venue_missing'
                self.record_error(report, step_index, exchange_id, symbol, 'venue_missing')
                return result
            amount = self.parse_float(venue.amount_to_precision(symbol, self.number_at(step, 'amount', 0)))
            price = self.parse_float(venue.price_to_precision(symbol, self.step_limit_price(step)))
            if not (amount > 0) or not (price > 0):
                result['errorCode'] = 'rounded_to_zero'
                self.record_error(report, step_index, exchange_id, symbol, 'rounded_to_zero')
                return result
            # CLAUDE.md: compute the notional before EVERY create_order. The
            # plan-level check already ran, but the plan can have been resized by
            # a reconciliation since, and the snapped price is not the one that
            # was checked.
            self.assert_under_cap(step, amount, price, usd_rates, options)
            order_params = {}
            extra = self.dict_at(options, 'orderParams')
            for key in extra:
                order_params[key] = extra[key]
            # No clientOrderId is set here. Whatever the caller put in options['orderParams']
            # travels as-is, and each exchange's create_order keeps sending whatever identifier
            # it generates on its own; the id the venue reports back is recorded on the result
            # once the order returns. (An id derived from the plan identity used to be forced
            # onto every step, but venues disagree on its length and charset, so it was
            # rejected exactly where it mattered.)
            attempt = self.number_at(step, 'attempt', 0)
            result['attempt'] = attempt
            if strategy == 'limit_protected':
                order = self.place_protected_limit(venue, step, symbol, side, amount, price, order_params, options, report, result)
            else:
                order = self.place_immediate_order(venue, symbol, side, amount, price, order_params, options, result)
            result['orderId'] = self.string_at(order, 'id', '')
            result['clientOrderId'] = self.string_at(order, 'clientOrderId', '')
            # "the venue said zero" and "the venue said nothing" are different facts and used to
            # produce the same number. A venue omitting `filled` yielded 0, reconciliation read
            # that as nothing_filled and halted while a real position existed. Test presence.
            if not self.has_number_at(order, 'filled') and result['orderId'] != '':
                # One re-read, exactly as place_protected_limit already does after its poll. The
                # immediate path never did, so it could only ever fabricate.
                order = self.refetch_order(venue, self.string_at(result, 'orderId', ''), symbol, order)
            # An order the venue explicitly calls open is RESTING, and on this path it must
            # not be: place_immediate_order asked for immediate-or-cancel, so a venue that
            # silently dropped the timeInForce param has left a plain limit order sitting on
            # the book. Recording it and walking on was not enough - the next hop then trades
            # on top of a position that keeps growing behind it, is sized from a fill that is
            # already out of date, and the leftover order is still live after the route has
            # ended and nobody is watching it. So it is cancelled and re-read here, exactly as
            # place_protected_limit does on its timeout path.
            resting_cancel_failed = False
            if strategy != 'limit_protected' and self.string_at(order, 'status', '') == 'open' and result['orderId'] != '':
                try:
                    venue.cancel_order(self.string_at(result, 'orderId', ''), symbol)
                    # ALWAYS re-read after a cancel: the cancel and the fill can cross, and the
                    # observed order is the only authority on what actually happened
                    order = self.refetch_order(venue, self.string_at(result, 'orderId', ''), symbol, order)
                except Exception:
                    # the order may still be live and its fill can still move, so whatever this
                    # step reports below is a snapshot that is already stale. The status is
                    # downgraded after the amounts are filled in, not here: a cost the venue DID
                    # report is a fact, and build_unwind_plan subtracts it.
                    resting_cancel_failed = True
            filled_known = self.has_number_at(order, 'filled')
            filled = self.number_at(order, 'filled', 0)
            average_known = self.has_number_at(order, 'average') or self.has_number_at(order, 'price')
            average = self.number_at(order, 'average', 0)
            if average <= 0:
                average = self.number_at(order, 'price', 0)
            if average <= 0:
                average = price
            cost_known = self.has_number_at(order, 'cost')
            cost = self.number_at(order, 'cost', 0)
            if cost <= 0:
                cost = filled * average
            result['filledKnown'] = filled_known
            result['averageKnown'] = average_known
            result['costKnown'] = cost_known
            result['filledAmount'] = filled
            result['averagePrice'] = average
            result['cost'] = cost
            if side == 'buy':
                result['inAsset'] = self.string_at(step, 'quote', '')
                result['inAmount'] = cost
                result['outAsset'] = self.string_at(step, 'base', '')
                result['outAmount'] = filled
            else:
                result['inAsset'] = self.string_at(step, 'base', '')
                result['inAmount'] = filled
                result['outAsset'] = self.string_at(step, 'quote', '')
                result['outAmount'] = cost
            # Net the taker fee out of what is CARRIED FORWARD when the venue charged it in the
            # asset this step produced: filled and cost are gross of fees, so the next hop was
            # sized on money that never arrived. Fees in any other currency come out of what was
            # already spent and are left alone.
            fee_cost = self.order_fee_in_asset(order, self.string_at(result, 'outAsset', ''))
            result['feeCost'] = fee_cost
            result['feeCurrency'] = self.string_at(result, 'outAsset', '')
            if fee_cost > 0:
                net = self.number_at(result, 'outAmount', 0) - fee_cost
                if net < 0:
                    net = 0
                result['grossOutAmount'] = self.number_at(result, 'outAmount', 0)
                result['outAmount'] = net
            if not filled_known:
                # Refuse to reconcile on a fabricated fill. Halting on an unknown quantity is
                # recoverable — an operator reads the order back and resumes; sizing the next hop
                # from an invented number is not.
                result['status'] = 'outcome_unknown'
                self.record_open_order(report, exchange_id, symbol, self.string_at(result, 'orderId', ''), 'fill_unconfirmed')
                with self.lock:
                    report['ordersPlaced'] = self.number_at(report, 'ordersPlaced', 0) + 1
                return result
            if filled <= 0:
                result['status'] = 'unfilled'
            elif filled >= amount * (1 - OrderRouter.TOLERANCE):
                result['status'] = 'filled'
            else:
                result['status'] = 'partial'
            if resting_cancel_failed:
                # a resting order this class could not cancel is the worst outcome there is:
                # it can still fill, in full, after the route has returned. Sizing the next hop
                # on the fill recorded above would trade against a position that is still
                # moving, so the step is marked unknown and execute_sequential stops here.
                result['status'] = 'outcome_unknown'
                self.record_open_order(report, exchange_id, symbol, self.string_at(result, 'orderId', ''), 'cancel_failed')
            elif self.string_at(order, 'status', '') == 'open':
                # cancelled - or on the limit_protected path, cancelled by
                # place_protected_limit - and the venue STILL calls it open. The order is
                # live whatever this class asked for, so the same rule applies: report it,
                # and refuse to size anything downstream from a fill that can still grow.
                result['status'] = 'outcome_unknown'
                self.record_open_order(report, exchange_id, symbol, self.string_at(result, 'orderId', ''), 'still_open')
            with self.lock:
                report['ordersPlaced'] = self.number_at(report, 'ordersPlaced', 0) + 1
            return result
        except Exception as e:
            # containment. A leg that raises must not take its siblings with it.
            result['status'] = 'failed'
            result['errorCode'] = self.error_code_of(e)
            self.record_error(report, step_index, exchange_id, symbol, result['errorCode'])
            # create_order may already have succeeded: every path between it and
            # the final read — a poll that times out, a network drop, a cap
            # re-check — leaves a real order on a real venue. Reporting the id is
            # the difference between an operator who can go cancel it and one who
            # never learns it exists.
            known_id = self.string_at(result, 'orderId', '')
            if known_id != '':
                #  'failed' would read as "nothing happened" while openOrders says
                #  the opposite, and one report must not carry both readings.
                #  Having an id means createOrder RETURNED — the venue accepted
                #  something — so whatever threw afterwards left a real order
                #  behind whose fill is simply unknown to us.
                result['status'] = 'outcome_unknown'
                self.record_open_order(report, exchange_id, symbol, known_id, 'outcome_unknown')
            elif self.bool_at(result, 'placementAttempted', False) and self.is_outcome_unknown_error(result['errorCode']):
                # The order was dispatched and the venue's answer never arrived. It may well have
                # been accepted; we simply never learned its id. Reporting that as a plain failure
                # asserts "nothing happened", which is the one reading that is certainly wrong, so
                # the step is marked outcome-unknown and an id-less entry goes into openOrders for
                # an operator to reconcile by symbol and timestamp.
                #
                # A DEFINITE rejection — insufficient funds, an invalid price, an unsupported order
                # type — is left as 'failed' on purpose. Those are answers, not silence.
                result['status'] = 'outcome_unknown'
                self.record_unconfirmed_placement(report, exchange_id, symbol, 'placement_unconfirmed')
            return result

    def has_number_at(self, container, key):
        """
        reports whether a container carries a usable number at key, as opposed to nothing

        :param dict container: the container
        :param str key: the field
        :returns bool: True when the venue actually answered with a finite number
        """
        if container is None:
            return False
        value = container.get(key) if isinstance(container, dict) else None
        if value is None:
            return False
        # Deliberately the same coercion number_at does, so "usable" and "present" cannot disagree.
        if isinstance(value, bool):
            return False
        if isinstance(value, (int, float)):
            return self.is_finite_number(float(value))
        if isinstance(value, str):
            return self.is_finite_number(self.parse_number(value, float('nan')))
        return False

    def refetch_order(self, venue, order_id, symbol, fallback):
        """
        re-reads one order, returning the previous body unchanged when the venue cannot be asked

        :param venue: the exchange instance
        :param str order_id: the venue's order id
        :param str symbol: the market
        :param dict fallback: the order body to keep when the re-read is impossible or fails
        :returns dict: the re-read order, or the fallback
        """
        try:
            reread = venue.fetch_order(order_id, symbol)
            if reread is None:
                return fallback
            return reread
        except Exception:
            # the caller marks the fill unknown; a raise here must not lose the placement record
            return fallback

    def order_fee_in_asset(self, order, asset):
        """
        sums the fees an order charged in one asset, ignoring fees in any other currency

        :param dict order: the order as the venue returned it
        :param str asset: the asset being carried forward
        :returns float: the fee cost in that asset, or 0
        """
        if asset == '':
            return 0
        total = 0
        # ccxt reports the same cut in up to three places, so this is a strict THREE-TIER
        # PRECEDENCE and never a sum across tiers: the `fees` list wins outright; if it named no
        # entry in this asset, the single `fee` is read; only if that named nothing either are
        # the per-trade fees totalled. `saw_in_list` is what makes each tier exclusive of the
        # ones below it — safe_order fills `fee` and `fees` from the same charge, and the
        # per-trade fees are usually that same charge again, so adding tiers together would
        # double- or triple-count. Within ONE tier every matching entry IS summed.
        saw_in_list = False
        for entry in self.list_at(order, 'fees'):
            if self.string_at(entry, 'currency', '').upper() == asset.upper():
                total = total + self.number_at(entry, 'cost', 0)
                saw_in_list = True
        if not saw_in_list:
            single = self.dict_at(order, 'fee')
            if self.string_at(single, 'currency', '').upper() == asset.upper():
                total = total + self.number_at(single, 'cost', 0)
                saw_in_list = True
        if not saw_in_list:
            # Last resort: a venue that reports its cut only per trade. The Go port has no
            # `fees` list on its typed Order at all, so this fallback is what lets all six ports
            # read the same fee off the same order — and reading NOTHING here is the dangerous
            # direction, not the safe one: an unread fee leaves out_amount GROSS, which sizes the
            # next hop on money the venue already took.
            for trade in self.list_at(order, 'trades'):
                trade_fee = self.dict_at(trade, 'fee')
                if self.string_at(trade_fee, 'currency', '').upper() == asset.upper():
                    total = total + self.number_at(trade_fee, 'cost', 0)
        if not self.is_finite_number(float(total)) or total < 0:
            return 0
        return total

    def is_outcome_unknown_error(self, error_code):
        """
        reports whether a thrown error leaves the outcome of a placement genuinely unknown

        :param str error_code: the error class name
        :returns bool: True when the request may or may not have reached the venue
        """
        # ccxt's NetworkError family: the request failed in a way that does not tell us whether the
        # venue processed it. Everything else in the hierarchy is the venue ANSWERING, which means
        # no order exists. Matched by class name so the six ports agree without depending on each
        # language's isinstance mechanics.
        return error_code in ('RequestTimeout', 'ExchangeNotAvailable', 'NetworkError', 'OnMaintenance')

    def record_unconfirmed_placement(self, report, exchange_id, symbol, reason):
        """
        appends one dispatched-but-unconfirmed placement to the report, keyed on venue/symbol/reason since there is no id

        :param dict report: the report
        :param str exchange_id: the venue
        :param str symbol: the market
        :param str reason: why the outcome is unknown
        :returns None:
        """
        with self.lock:
            open_orders = self.list_at(report, 'openOrders')
            for entry in open_orders:
                if (self.string_at(entry, 'exchangeId', '') == exchange_id
                        and self.string_at(entry, 'symbol', '') == symbol
                        and self.string_at(entry, 'reason', '') == reason):
                    return
            report['openOrders'].append({'exchangeId': exchange_id, 'symbol': symbol, 'orderId': '', 'reason': reason})

    def record_open_order(self, report, exchange_id, symbol, order_id, reason):
        """
        appends one possibly-live order to the report, ignoring a blank id and never recording the same id twice

        :param dict report: the report
        :param str exchange_id: the venue
        :param str symbol: the market
        :param str order_id: the venue's order id
        :param str reason: why the order may still be open
        :returns None:
        """
        if order_id == '':
            # nothing to point an operator at
            return
        with self.lock:
            open_orders = self.list_at(report, 'openOrders')
            for entry in open_orders:
                if self.string_at(entry, 'orderId', '') == order_id and self.string_at(entry, 'exchangeId', '') == exchange_id:
                    return
            report['openOrders'].append({'exchangeId': exchange_id, 'symbol': symbol, 'orderId': order_id, 'reason': reason})

    def parse_float(self, text):
        """
        reads a venue's precision-snapped string back as a double, yielding 0 for anything unparseable

        :param str text: the value a venue's amount_to_precision or price_to_precision returned
        :returns float: the number, or 0
        """
        if text is None:
            return 0
        if isinstance(text, bool):
            return 0
        if isinstance(text, (int, float)):
            if not self.is_finite_number(text):
                return 0
            return text
        if not isinstance(text, str):
            return 0
        return self.parse_number(text, 0)

    def error_code_of(self, e):
        """
        names a caught exception by its class, which is the one label all six languages agree on

        :param Exception e: the caught exception
        :returns str: the exception class name, or unknown_error
        """
        if e is None:
            return 'unknown_error'
        return type(e).__name__

    def place_immediate_order(self, venue, symbol, side, amount, price, order_params, options, result):
        """
        places an immediate-or-cancel limit order, falling back to a market order only when the venue cannot do IOC and the caller explicitly allowed it

        :param object venue: the exchange instance
        :param str symbol: the market
        :param str side: buy or sell
        :param float amount: the precision-snapped amount
        :param float price: the precision-snapped limit price
        :param dict order_params: extra params for create_order
        :param dict options: the execute options
        :param dict result: the step result, stamped with the order id the instant create_order returns
        :returns dict: the order
        """
        if self.venue_supports_ioc(venue):
            order_params['timeInForce'] = 'IOC'
            # Set immediately before the call that can leave a real order on a real venue, and
            # never reset. Anything that fails before this point — a missing venue, a size that
            # rounds to zero, the notional cap, a venue that cannot do IOC — dispatched nothing,
            # and recording an unconfirmed placement for it would be a false alarm.
            result['placementAttempted'] = True
            ioc_order = venue.create_order(symbol, 'limit', side, amount, price, order_params)
            result['orderId'] = self.string_at(ioc_order, 'id', '')
            return ioc_order
        if options.get('allowMarketOrders') is not True:
            # a market order is an unbounded price, and switching to one on a
            # caller's behalf is exactly the decision they did not delegate
            raise NotSupported('OrderRouter: venue cannot do IOC and allowMarketOrders was not set')
        # A market order and a notional cap cannot both be honoured. assertUnderCap valued this order
        # at the plan's LIMIT price, and the call below sends no price at all: the venue fills wherever
        # the book is, which is the one thing the cap exists to bound. Passing the check and then
        # removing the price it was computed from is a cap that silently disappears, which by this
        # file's own rule is not a cap. So the two options are refused together.
        if self.number_at(options, 'maxNotionalUsd', self.max_notional_usd) > 0:
            raise NotSupported('OrderRouter: allowMarketOrders cannot be honoured under a maxNotionalUsd cap, because a market order has no price to check')
        result['placementAttempted'] = True
        market_order = venue.create_order(symbol, 'market', side, amount, None, order_params)
        result['orderId'] = self.string_at(market_order, 'id', '')
        return market_order

    def place_protected_limit(self, venue, step, symbol, side, amount, price, order_params, options, report, result):
        """
        rests a limit order, then cancels it on timeout and ALWAYS re-reads it, because a cancel and a fill can cross

        :param object venue: the exchange instance
        :param dict step: the step being traded
        :param str symbol: the market
        :param str side: buy or sell
        :param float amount: the precision-snapped amount
        :param float price: the precision-snapped limit price
        :param dict order_params: extra params for create_order
        :param dict options: the execute options
        :param dict report: the report, for openOrders
        :param dict result: the step result, stamped with the order id the instant create_order returns
        :returns dict: the order as last observed, which is the authoritative fill
        """
        timeout_ms = self.number_at(options, 'orderTimeoutMs', 20000)
        poll_interval_ms = self.number_at(options, 'pollIntervalMs', 1000)
        result['placementAttempted'] = True
        order = venue.create_order(symbol, 'limit', side, amount, price, order_params)
        order_id = self.string_at(order, 'id', '')
        # before the first poll, the first sleep and the first thing that can go
        # wrong: from here on the caller can always name what is resting
        result['orderId'] = order_id
        waited = 0
        while waited < timeout_ms:
            status = self.string_at(order, 'status', '')
            if status == 'closed' or status == 'canceled':
                return order
            self.sleep(poll_interval_ms)
            waited = waited + poll_interval_ms
            order = venue.fetch_order(order_id, symbol)
        final_status = self.string_at(order, 'status', '')
        if final_status == 'closed' or final_status == 'canceled':
            # the venue ended it on the last poll — an expiry, a self-trade
            # prevention, a post-only rejection of the remainder. Cancelling an
            # order the venue already closed raises, and the partial fill this
            # order carries is real: dropping it would hide a live position from
            # the report AND from the unwind plan built out of it.
            return order
        try:
            venue.cancel_order(order_id, symbol)
        except Exception as e:
            # the order may still be live. Reporting a fill we did not observe
            # would be a lie, and continuing to the next hop on top of an unknown
            # position is worse.
            self.record_open_order(report, self.string_at(step, 'exchangeId', ''), symbol, order_id, 'cancel_failed')
            raise ExchangeError('OrderRouter: cancelOrder failed and an order is left OPEN, refusing to proceed') from e
        # ALWAYS re-read after a cancel: the cancel and the fill can cross, and
        # the observed order is the only authority on what actually happened
        return venue.fetch_order(order_id, symbol)

    def venue_supports_ioc(self, venue):
        """
        reports whether a venue is known NOT to support immediate-or-cancel

        :param object venue: the exchange instance
        :returns bool: True unless the venue's features explicitly list timeInForce values without IOC
        """
        # Defaults to TRUE on purpose. An unknown answer here must not fall
        # through to a market order; a rejected IOC is a loud, cheap failure and
        # an unintended market order is a silent, expensive one.
        features = self.dict_at(venue, 'features')
        spot = self.dict_at(features, 'spot')
        create_order = self.dict_at(spot, 'createOrder')
        # EVERY real ccxt exchange declares this as a dictionary of booleans —
        # {'IOC': True, 'FOK': True, 'GTC': True, ...} — and not one declares it
        # as a list. Reading it as a list only ever answered "empty", which is the
        # same answer as "the venue said nothing", so the check always said yes
        # and the market-order path below was unreachable.
        time_in_force_flags = self.dict_at(create_order, 'timeInForce')
        if len(time_in_force_flags) > 0:
            # a venue that enumerates its time-in-force values and leaves IOC out
            # has said no, exactly as one that says IOC: False has
            return self.bool_at(time_in_force_flags, 'IOC', False)
        # a list is still honoured, for a caller-built stub venue
        time_in_force = self.list_at(create_order, 'timeInForce')
        if len(time_in_force) == 0:
            return True
        for value in time_in_force:
            if value == 'IOC':
                return True
        return False

    def assert_under_cap(self, step, amount, price, usd_rates, options):
        """
        raises unless a single order's USD notional is known and within the per-trade cap

        :param dict step: the step being traded
        :param float amount: the snapped amount actually being sent
        :param float price: the snapped price actually being sent
        :param dict usd_rates: currency code to USD price
        :param dict options: the execute options, read for a per-call maxNotionalUsd
        :returns None:
        """
        cap = self.number_at(options, 'maxNotionalUsd', self.max_notional_usd)
        if cap <= 0:
            # no cap set, so there is nothing to enforce here
            return
        probe = {
            'base': self.string_at(step, 'base', ''),
            'quote': self.string_at(step, 'quote', ''),
            'amount': amount,
        }
        usd_value = self.notional_usd(probe, amount * price, usd_rates)
        if usd_value <= 0:
            raise ExchangeError('OrderRouter: refusing to place an order that cannot be valued in USD')
        if usd_value > cap * (1 + OrderRouter.TOLERANCE):
            raise ExchangeError('OrderRouter: refusing to place an order above the per-trade USD notional cap')

    def assert_prefunded(self, steps, venues):
        """
        verifies every step's input is already sitting on its venue, which is what atomic_ish actually requires

        :param list steps: the working steps
        :param dict venues: exchangeId to exchange instance
        :returns None:
        """
        # built as a list, not a dict, so the first shortfall reported is the
        # same one in all six languages
        required = []
        for step in steps:
            exchange_id = self.string_at(step, 'exchangeId', '')
            amount = self.number_at(step, 'amount', 0)
            if self.string_at(step, 'side', '') == 'buy':
                asset = self.string_at(step, 'quote', '')
                needed = amount * self.step_limit_price(step)
            else:
                asset = self.string_at(step, 'base', '')
                needed = amount
            found = False
            for entry in required:
                if entry['exchangeId'] == exchange_id and entry['asset'] == asset:
                    entry['amount'] = self.number_at(entry, 'amount', 0) + needed
                    found = True
                    break
            if not found:
                required.append({'exchangeId': exchange_id, 'asset': asset, 'amount': needed})
        balances = {}
        for entry in required:
            exchange_id = self.string_at(entry, 'exchangeId', '')
            if exchange_id not in balances:
                balances[exchange_id] = venues[exchange_id].fetch_balance()
            free = self.dict_at(balances[exchange_id], 'free')
            asset = self.string_at(entry, 'asset', '')
            available = self.number_at(free, asset, 0)
            if available < self.number_at(entry, 'amount', 0):
                # most routes fail this, and that is the correct outcome:
                # atomic_ish names its own hedge, because there is no cross-venue
                # atomicity and there cannot be
                raise InsufficientFunds('OrderRouter: atomic_ish requires the whole route pre-funded, and ' + exchange_id + ' is short of ' + asset)

    def apply_resize(self, steps, reconciliation):
        """
        writes a reconciliation's downstream resize back into the working steps

        :param list steps: the working steps
        :param dict reconciliation: the result of reconcile_execution_step
        :returns None:
        """
        # Record what this leg produced BEFORE resizing anything: reconcile_execution_step is pure
        # and cannot remember across calls, so the hop's cumulative shortfall lives on the steps.
        reconciled_step = self.number_at(reconciliation, 'stepIndex', -1)
        for step in steps:
            if self.number_at(step, 'stepIndex', -1) == reconciled_step:
                step['realisedOut'] = self.number_at(reconciliation, 'realisedOut', 0)
                break
        for entry in self.list_at(reconciliation, 'resizedSteps'):
            step_index = self.number_at(entry, 'stepIndex', -1)
            for step in steps:
                if self.number_at(step, 'stepIndex', -1) == step_index:
                    step['amount'] = self.number_at(entry, 'amount', 0)
                    step['notionalQuote'] = self.number_at(entry, 'notionalQuote', 0)
                    break

    def mark_remaining_skipped(self, results, start):
        """
        marks every step from an index onwards as skipped after a halt

        :param list results: the report's step results
        :param int start: the first index to mark
        :returns None:
        """
        for i in range(start, len(results)):
            if self.string_at(results[i], 'status', '') == 'planned':
                results[i]['status'] = 'skipped'

    def record_error(self, report, step_index, exchange_id, symbol, code):
        """
        appends one error to the report

        :param dict report: the report
        :param int step_index: the step that failed
        :param str exchange_id: the venue
        :param str symbol: the market
        :param str code: the error class name or an internal code
        :returns None:
        """
        with self.lock:
            report['errors'].append({'stepIndex': step_index, 'exchangeId': exchange_id, 'symbol': symbol, 'code': code})

    def summarise_report(self, report, steps):
        """
        totals what the first hop spent and what the last hop produced

        :param dict report: the report
        :param list steps: the working steps
        :returns None:
        """
        results = self.list_at(report, 'steps')
        last_hop = 0
        for step in steps:
            hop_index = self.number_at(step, 'hopIndex', 0)
            if hop_index > last_hop:
                last_hop = hop_index
        filled_in = 0
        filled_out = 0
        for result in results:
            hop_index = self.number_at(result, 'hopIndex', 0)
            if hop_index == 0:
                filled_in = filled_in + self.number_at(result, 'inAmount', 0)
            if hop_index == last_hop:
                filled_out = filled_out + self.number_at(result, 'outAmount', 0)
        report['filledIn'] = filled_in
        report['filledOut'] = filled_out

    def now_ms(self):
        """
        reads the wall clock, in milliseconds since the epoch

        The only clock this class reads. Isolated in one overridable method so a test can pin
        time, and so the six ports have exactly one definition of "now" each.

        :returns int: the current time
        """
        return int(time.time() * 1000)

    def sleep(self, milliseconds):
        """
        waits for a number of milliseconds

        :param int milliseconds: how long to wait
        :returns None:
        """
        time.sleep(milliseconds / 1000)
