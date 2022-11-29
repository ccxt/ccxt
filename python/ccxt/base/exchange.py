# -*- coding: utf-8 -*-

"""Base exchange class"""

# -----------------------------------------------------------------------------

__version__ = '2.2.41'

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NetworkError
from ccxt.base.errors import NotSupported
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import DDoSProtection
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import InvalidAddress
from ccxt.base.errors import InvalidOrder
from ccxt.base.errors import ArgumentsRequired
from ccxt.base.errors import BadSymbol
from ccxt.base.errors import NullResponse
from ccxt.base.errors import RateLimitExceeded

# -----------------------------------------------------------------------------

from ccxt.base.decimal_to_precision import decimal_to_precision
from ccxt.base.decimal_to_precision import DECIMAL_PLACES, TICK_SIZE, NO_PADDING, TRUNCATE, ROUND, ROUND_UP, ROUND_DOWN
from ccxt.base.decimal_to_precision import number_to_string
from ccxt.base.precise import Precise

# -----------------------------------------------------------------------------

# rsa jwt signing
from cryptography.hazmat import backends
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_private_key

# -----------------------------------------------------------------------------

# ecdsa signing
from ccxt.static_dependencies import ecdsa
from ccxt.static_dependencies import keccak

# eddsa signing
try:
    import axolotl_curve25519 as eddsa
except ImportError:
    eddsa = None

# -----------------------------------------------------------------------------

__all__ = [
    'Exchange',
]

# -----------------------------------------------------------------------------

import types
import logging
import base64
import binascii
import calendar
import collections
import datetime
from email.utils import parsedate
import functools
import gzip
import hashlib
import hmac
import io
import json
import math
import random
from numbers import Number
import re
from requests import Session
from requests.utils import default_user_agent
from requests.exceptions import HTTPError, Timeout, TooManyRedirects, RequestException, ConnectionError as requestsConnectionError
# import socket
from ssl import SSLError
# import sys
import time
import uuid
import zlib
from decimal import Decimal
from time import mktime
from wsgiref.handlers import format_date_time
import urllib.parse as _urlencode

# -----------------------------------------------------------------------------


class Exchange(object):
    """Base exchange class"""
    id = None
    name = None
    version = None
    certified = False  # if certified by the CCXT dev team
    pro = False  # if it is integrated with CCXT Pro for WebSocket support
    alias = False  # whether this exchange is an alias to another exchange
    # rate limiter settings
    enableRateLimit = True
    rateLimit = 2000  # milliseconds = seconds * 1000
    timeout = 10000   # milliseconds = seconds * 1000
    asyncio_loop = None
    aiohttp_proxy = None
    aiohttp_trust_env = False
    requests_trust_env = False
    session = None  # Session () by default
    verify = True  # SSL verification
    validateServerSsl = True
    validateClientSsl = False
    logger = None  # logging.getLogger(__name__) by default
    userAgent = None
    userAgents = {
        'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'chrome39': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        'chrome100': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
    }
    verbose = False
    markets = None
    symbols = None
    codes = None
    timeframes = None
    fees = {
        'trading': {
            'percentage': True,  # subclasses should rarely have to redefine this
        },
        'funding': {
            'withdraw': {},
            'deposit': {},
        },
    }
    loaded_fees = {
        'trading': {
            'percentage': True,
        },
        'funding': {
            'withdraw': {},
            'deposit': {},
        },
    }
    ids = None
    urls = None
    api = None
    parseJsonResponse = True
    proxy = ''
    origin = '*'  # CORS origin
    proxies = None
    hostname = None  # in case of inaccessibility of the "main" domain
    apiKey = ''
    secret = ''
    password = ''
    uid = ''
    privateKey = ''  # a "0x"-prefixed hexstring private key for a wallet
    walletAddress = ''  # the wallet address "0x"-prefixed hexstring
    token = ''  # reserved for HTTP auth in some cases
    twofa = None
    markets_by_id = None
    currencies_by_id = None
    precision = None
    exceptions = None
    limits = {
        'leverage': {
            'min': None,
            'max': None,
        },
        'amount': {
            'min': None,
            'max': None,
        },
        'price': {
            'min': None,
            'max': None,
        },
        'cost': {
            'min': None,
            'max': None,
        },
    }
    httpExceptions = {
        '422': ExchangeError,
        '418': DDoSProtection,
        '429': RateLimitExceeded,
        '404': ExchangeNotAvailable,
        '409': ExchangeNotAvailable,
        '410': ExchangeNotAvailable,
        '500': ExchangeNotAvailable,
        '501': ExchangeNotAvailable,
        '502': ExchangeNotAvailable,
        '520': ExchangeNotAvailable,
        '521': ExchangeNotAvailable,
        '522': ExchangeNotAvailable,
        '525': ExchangeNotAvailable,
        '526': ExchangeNotAvailable,
        '400': ExchangeNotAvailable,
        '403': ExchangeNotAvailable,
        '405': ExchangeNotAvailable,
        '503': ExchangeNotAvailable,
        '530': ExchangeNotAvailable,
        '408': RequestTimeout,
        '504': RequestTimeout,
        '401': AuthenticationError,
        '511': AuthenticationError,
    }
    headers = None
    balance = None
    orderbooks = None
    orders = None
    myTrades = None
    trades = None
    transactions = None
    ohlcvs = None
    tickers = None
    base_currencies = None
    quote_currencies = None
    currencies = None
    options = None  # Python does not allow to define properties in run-time with setattr
    accounts = None
    positions = None

    status = {
        'status': 'ok',
        'updated': None,
        'eta': None,
        'url': None,
    }

    requiredCredentials = {
        'apiKey': True,
        'secret': True,
        'uid': False,
        'login': False,
        'password': False,
        'twofa': False,  # 2-factor authentication (one-time password key)
        'privateKey': False,  # a "0x"-prefixed hexstring private key for a wallet
        'walletAddress': False,  # the wallet address "0x"-prefixed hexstring
        'token': False,  # reserved for HTTP auth in some cases
    }

    # API method metainfo
    has = {
        'publxicAPI': True,
        'privateAPI': True,
        'CORS': None,
        'spot': None,
        'margin': None,
        'swap': None,
        'future': None,
        'option': None,
        'addMargin': None,
        'cancelAllOrders': None,
        'cancelOrder': True,
        'cancelOrders': None,
        'createDepositAddress': None,
        'createLimitOrder': True,
        'createMarketOrder': True,
        'createOrder': True,
        'createPostOnlyOrder': None,
        'createReduceOnlyOrder': None,
        'createStopOrder': None,
        'createStopLimitOrder': None,
        'createStopMarketOrder': None,
        'editOrder': 'emulated',
        'fetchAccounts': None,
        'fetchBalance': True,
        'fetchBidsAsks': None,
        'fetchBorrowInterest': None,
        'fetchBorrowRate': None,
        'fetchBorrowRateHistory': None,
        'fetchBorrowRatesPerSymbol': None,
        'fetchBorrowRates': None,
        'fetchCanceledOrders': None,
        'fetchClosedOrder': None,
        'fetchClosedOrders': None,
        'fetchCurrencies': 'emulated',
        'fetchDeposit': None,
        'fetchDepositAddress': None,
        'fetchDepositAddresses': None,
        'fetchDepositAddressesByNetwork': None,
        'fetchDeposits': None,
        'fetchFundingFee': None,
        'fetchFundingFees': None,
        'fetchFundingHistory': None,
        'fetchFundingRate': None,
        'fetchFundingRateHistory': None,
        'fetchFundingRates': None,
        'fetchIndexOHLCV': None,
        'fetchL2OrderBook': True,
        'fetchLedger': None,
        'fetchLedgerEntry': None,
        'fetchLeverageTiers': None,
        'fetchMarketLeverageTiers': None,
        'fetchMarkets': True,
        'fetchMarkOHLCV': None,
        'fetchMyTrades': None,
        'fetchOHLCV': 'emulated',
        'fetchOpenOrder': None,
        'fetchOpenOrders': None,
        'fetchOrder': None,
        'fetchOrderBook': True,
        'fetchOrderBooks': None,
        'fetchOrders': None,
        'fetchOrderTrades': None,
        'fetchPermissions': None,
        'fetchPosition': None,
        'fetchPositions': None,
        'fetchPositionsRisk': None,
        'fetchPremiumIndexOHLCV': None,
        'fetchStatus': 'emulated',
        'fetchTicker': True,
        'fetchTickers': None,
        'fetchTime': None,
        'fetchTrades': True,
        'fetchTradingFee': None,
        'fetchTradingFees': None,
        'fetchTradingLimits': None,
        'fetchTransactions': None,
        'fetchTransfers': None,
        'fetchWithdrawal': None,
        'fetchWithdrawals': None,
        'reduceMargin': None,
        'setLeverage': None,
        'setMargin': None,
        'setMarginMode': None,
        'setPositionMode': None,
        'signIn': None,
        'transfer': None,
        'withdraw': None,
    }
    precisionMode = DECIMAL_PLACES
    paddingMode = NO_PADDING
    minFundingAddressLength = 1  # used in check_address
    substituteCommonCurrencyCodes = True
    quoteJsonNumbers = True
    number = float  # or str (a pointer to a class)
    handleContentTypeApplicationZip = False
    # whether fees should be summed by currency code
    reduceFees = True
    lastRestRequestTimestamp = 0
    lastRestPollTimestamp = 0
    restRequestQueue = None
    restPollerLoopIsRunning = False
    rateLimitTokens = 16
    rateLimitMaxTokens = 16
    rateLimitUpdateTime = 0
    enableLastHttpResponse = True
    enableLastJsonResponse = True
    enableLastResponseHeaders = True
    last_http_response = None
    last_json_response = None
    last_response_headers = None

    requiresEddsa = False
    base58_encoder = None
    base58_decoder = None
    # no lower case l or upper case I, O
    base58_alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

    commonCurrencies = {
        'XBT': 'BTC',
        'BCC': 'BCH',
        'BCHABC': 'BCH',
        'BCHSV': 'BSV',
    }
    synchronous = True

    def __init__(self, config={}):

        self.precision = dict() if self.precision is None else self.precision
        self.limits = dict() if self.limits is None else self.limits
        self.exceptions = dict() if self.exceptions is None else self.exceptions
        self.headers = dict() if self.headers is None else self.headers
        self.balance = dict() if self.balance is None else self.balance
        self.orderbooks = dict() if self.orderbooks is None else self.orderbooks
        self.tickers = dict() if self.tickers is None else self.tickers
        self.trades = dict() if self.trades is None else self.trades
        self.transactions = dict() if self.transactions is None else self.transactions
        self.positions = dict() if self.positions is None else self.positions
        self.ohlcvs = dict() if self.ohlcvs is None else self.ohlcvs
        self.currencies = dict() if self.currencies is None else self.currencies
        self.options = dict() if self.options is None else self.options  # Python does not allow to define properties in run-time with setattr
        self.decimal_to_precision = decimal_to_precision
        self.number_to_string = number_to_string

        # version = '.'.join(map(str, sys.version_info[:3]))
        # self.userAgent = {
        #     'User-Agent': 'ccxt/' + __version__ + ' (+https://github.com/ccxt/ccxt) Python/' + version
        # }

        self.origin = self.uuid()
        self.userAgent = default_user_agent()

        settings = self.deep_extend(self.describe(), config)

        for key in settings:
            if hasattr(self, key) and isinstance(getattr(self, key), dict):
                setattr(self, key, self.deep_extend(getattr(self, key), settings[key]))
            else:
                setattr(self, key, settings[key])

        if self.api:
            self.define_rest_api(self.api, 'request')

        if self.markets:
            self.set_markets(self.markets)

        # convert all properties from underscore notation foo_bar to camelcase notation fooBar
        cls = type(self)
        for name in dir(self):
            if name[0] != '_' and name[-1] != '_' and '_' in name:
                parts = name.split('_')
                # fetch_ohlcv → fetchOHLCV (not fetchOhlcv!)
                exceptions = {'ohlcv': 'OHLCV', 'le': 'LE', 'be': 'BE'}
                camelcase = parts[0] + ''.join(exceptions.get(i, self.capitalize(i)) for i in parts[1:])
                attr = getattr(self, name)
                if isinstance(attr, types.MethodType):
                    setattr(cls, camelcase, getattr(cls, name))
                else:
                    setattr(self, camelcase, attr)

        self.tokenBucket = self.extend({
            'refillRate': 1.0 / self.rateLimit if self.rateLimit > 0 else float('inf'),
            'delay': 0.001,
            'capacity': 1.0,
            'defaultCost': 1.0,
        }, getattr(self, 'tokenBucket', {}))

        if not self.session and self.synchronous:
            self.session = Session()
            self.session.trust_env = self.requests_trust_env
        self.logger = self.logger if self.logger else logging.getLogger(__name__)

    def __del__(self):
        if self.session:
            try:
                self.session.close()
            except Exception as e:
                pass

    def __repr__(self):
        return 'ccxt.' + ('async_support.' if self.asyncio_loop else '') + self.id + '()'

    def __str__(self):
        return self.name

    def describe(self):
        return {}

    def set_sandbox_mode(self, enabled):
        if enabled:
            if 'test' in self.urls:
                self.urls['apiBackup'] = self.urls['api']
                self.urls['api'] = self.urls['test']
            else:
                raise NotSupported(self.id + ' does not have a sandbox URL')
        elif 'apiBackup' in self.urls:
            self.urls['api'] = self.urls['apiBackup']
            del self.urls['apiBackup']

    def define_rest_api_endpoint(self, method_name, uppercase_method, lowercase_method, camelcase_method, path, paths, config={}):
        cls = type(self)
        entry = getattr(cls, method_name)  # returns a function (instead of a bound method)
        delimiters = re.compile('[^a-zA-Z0-9]')
        split_path = delimiters.split(path)
        lowercase_path = [x.strip().lower() for x in split_path]
        camelcase_suffix = ''.join([Exchange.capitalize(x) for x in split_path])
        underscore_suffix = '_'.join([x for x in lowercase_path if len(x)])
        camelcase_prefix = ''
        underscore_prefix = ''
        if len(paths):
            camelcase_prefix = paths[0]
            underscore_prefix = paths[0]
            if len(paths) > 1:
                camelcase_prefix += ''.join([Exchange.capitalize(x) for x in paths[1:]])
                underscore_prefix += '_' + '_'.join([x.strip() for p in paths[1:] for x in delimiters.split(p)])
                api_argument = paths
            else:
                api_argument = paths[0]
        camelcase = camelcase_prefix + camelcase_method + Exchange.capitalize(camelcase_suffix)
        underscore = underscore_prefix + '_' + lowercase_method + '_' + underscore_suffix.lower()

        def partialer():
            outer_kwargs = {'path': path, 'api': api_argument, 'method': uppercase_method, 'config': config}

            @functools.wraps(entry)
            def inner(_self, params=None, context=None):
                """
                Inner is called when a generated method (publicGetX) is called.
                _self is a reference to self created by function.__get__(exchange, type(exchange))
                https://en.wikipedia.org/wiki/Closure_(computer_programming) equivalent to functools.partial
                """
                inner_kwargs = dict(outer_kwargs)  # avoid mutation
                if params is not None:
                    inner_kwargs['params'] = params
                if context is not None:
                    inner_kwargs['context'] = params
                return entry(_self, **inner_kwargs)
            return inner
        to_bind = partialer()
        setattr(cls, camelcase, to_bind)
        setattr(cls, underscore, to_bind)

    def define_rest_api(self, api, method_name, paths=[]):
        for key, value in api.items():
            uppercase_method = key.upper()
            lowercase_method = key.lower()
            camelcase_method = lowercase_method.capitalize()
            if isinstance(value, list):
                for path in value:
                    self.define_rest_api_endpoint(method_name, uppercase_method, lowercase_method, camelcase_method, path, paths)
            # the options HTTP method conflicts with the 'options' API url path
            # elif re.search(r'^(?:get|post|put|delete|options|head|patch)$', key, re.IGNORECASE) is not None:
            elif re.search(r'^(?:get|post|put|delete|head|patch)$', key, re.IGNORECASE) is not None:
                for [endpoint, config] in value.items():
                    path = endpoint.strip()
                    if isinstance(config, dict):
                        self.define_rest_api_endpoint(method_name, uppercase_method, lowercase_method, camelcase_method, path, paths, config)
                    elif isinstance(config, Number):
                        self.define_rest_api_endpoint(method_name, uppercase_method, lowercase_method, camelcase_method, path, paths, {'cost': config})
                    else:
                        raise NotSupported(self.id + ' define_rest_api() API format not supported, API leafs must strings, objects or numbers')
            else:
                self.define_rest_api(value, method_name, paths + [key])

    def throttle(self, cost=None):
        now = float(self.milliseconds())
        elapsed = now - self.lastRestRequestTimestamp
        cost = 1 if cost is None else cost
        sleep_time = self.rateLimit * cost
        if elapsed < sleep_time:
            delay = sleep_time - elapsed
            time.sleep(delay / 1000.0)

    @staticmethod
    def gzip_deflate(response, text):
        encoding = response.info().get('Content-Encoding')
        if encoding in ('gzip', 'x-gzip', 'deflate'):
            if encoding == 'deflate':
                return zlib.decompress(text, -zlib.MAX_WBITS)
            else:
                return gzip.GzipFile('', 'rb', 9, io.BytesIO(text)).read()
        return text

    def prepare_request_headers(self, headers=None):
        headers = headers or {}
        if self.session:
            headers.update(self.session.headers)
        headers.update(self.headers)
        if self.userAgent:
            if type(self.userAgent) is str:
                headers.update({'User-Agent': self.userAgent})
            elif (type(self.userAgent) is dict) and ('User-Agent' in self.userAgent):
                headers.update(self.userAgent)
        if self.proxy:
            headers.update({'Origin': self.origin})
        headers.update({'Accept-Encoding': 'gzip, deflate'})
        return self.set_headers(headers)

    def log(self, *args):
        print(*args)

    def on_rest_response(self, code, reason, url, method, response_headers, response_body, request_headers, request_body):
        return response_body.strip()

    def on_json_response(self, response_body):
        if self.quoteJsonNumbers:
            return json.loads(response_body, parse_float=str, parse_int=str)
        else:
            return json.loads(response_body)

    def fetch(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""
        request_headers = self.prepare_request_headers(headers)
        url = self.proxy + url

        if self.verbose:
            self.log("\nfetch Request:", self.id, method, url, "RequestHeaders:", request_headers, "RequestBody:", body)
        self.logger.debug("%s %s, Request: %s %s", method, url, request_headers, body)

        request_body = body
        if body:
            body = body.encode()

        self.session.cookies.clear()

        http_response = None
        http_status_code = None
        http_status_text = None
        json_response = None
        try:
            response = self.session.request(
                method,
                url,
                data=body,
                headers=request_headers,
                timeout=int(self.timeout / 1000),
                proxies=self.proxies,
                verify=self.verify and self.validateServerSsl
            )
            # does not try to detect encoding
            response.encoding = 'utf-8'
            headers = response.headers
            http_status_code = response.status_code
            http_status_text = response.reason
            http_response = self.on_rest_response(http_status_code, http_status_text, url, method, headers, response.text, request_headers, request_body)
            json_response = self.parse_json(http_response)
            # FIXME remove last_x_responses from subclasses
            if self.enableLastHttpResponse:
                self.last_http_response = http_response
            if self.enableLastJsonResponse:
                self.last_json_response = json_response
            if self.enableLastResponseHeaders:
                self.last_response_headers = headers
            if self.verbose:
                self.log("\nfetch Response:", self.id, method, url, http_status_code, "ResponseHeaders:", headers, "ResponseBody:", http_response)
            self.logger.debug("%s %s, Response: %s %s %s", method, url, http_status_code, headers, http_response)
            response.raise_for_status()

        except Timeout as e:
            details = ' '.join([self.id, method, url])
            raise RequestTimeout(details) from e

        except TooManyRedirects as e:
            details = ' '.join([self.id, method, url])
            raise ExchangeError(details) from e

        except SSLError as e:
            details = ' '.join([self.id, method, url])
            raise ExchangeError(details) from e

        except HTTPError as e:
            details = ' '.join([self.id, method, url])
            skip_further_error_handling = self.handle_errors(http_status_code, http_status_text, url, method, headers, http_response, json_response, request_headers, request_body)
            if not skip_further_error_handling:
                self.handle_http_status_code(http_status_code, http_status_text, url, method, http_response)
            raise ExchangeError(details) from e

        except requestsConnectionError as e:
            error_string = str(e)
            details = ' '.join([self.id, method, url])
            if 'Read timed out' in error_string:
                raise RequestTimeout(details) from e
            else:
                raise NetworkError(details) from e

        except ConnectionResetError as e:
            error_string = str(e)
            details = ' '.join([self.id, method, url])
            raise NetworkError(details) from e

        except RequestException as e:  # base exception class
            error_string = str(e)
            details = ' '.join([self.id, method, url])
            if any(x in error_string for x in ['ECONNRESET', 'Connection aborted.', 'Connection broken:']):
                raise NetworkError(details) from e
            else:
                raise ExchangeError(details) from e

        self.handle_errors(http_status_code, http_status_text, url, method, headers, http_response, json_response, request_headers, request_body)
        if json_response is not None:
            return json_response
        elif self.is_text_response(headers):
            return http_response
        else:
            return response.content

    def parse_json(self, http_response):
        try:
            if Exchange.is_json_encoded_object(http_response):
                return self.on_json_response(http_response)
        except ValueError:  # superclass of JsonDecodeError (python2)
            pass

    def is_text_response(self, headers):
        # https://github.com/ccxt/ccxt/issues/5302
        content_type = headers.get('Content-Type', '')
        return content_type.startswith('application/json') or content_type.startswith('text/')

    @staticmethod
    def key_exists(dictionary, key):
        if dictionary is None or key is None:
            return False
        if isinstance(dictionary, list):
            if isinstance(key, int) and 0 <= key and key < len(dictionary):
                return dictionary[key] is not None
            else:
                return False
        if key in dictionary:
            return dictionary[key] is not None and dictionary[key] != ''
        return False

    @staticmethod
    def safe_float(dictionary, key, default_value=None):
        value = default_value
        try:
            if Exchange.key_exists(dictionary, key):
                value = float(dictionary[key])
        except ValueError as e:
            value = default_value
        return value

    @staticmethod
    def safe_string(dictionary, key, default_value=None):
        return str(dictionary[key]) if Exchange.key_exists(dictionary, key) else default_value

    @staticmethod
    def safe_string_lower(dictionary, key, default_value=None):
        if Exchange.key_exists(dictionary, key):
            return str(dictionary[key]).lower()
        else:
            return default_value.lower() if default_value is not None else default_value

    @staticmethod
    def safe_string_upper(dictionary, key, default_value=None):
        if Exchange.key_exists(dictionary, key):
            return str(dictionary[key]).upper()
        else:
            return default_value.upper() if default_value is not None else default_value

    @staticmethod
    def safe_integer(dictionary, key, default_value=None):
        if not Exchange.key_exists(dictionary, key):
            return default_value
        value = dictionary[key]
        try:
            # needed to avoid breaking on "100.0"
            # https://stackoverflow.com/questions/1094717/convert-a-string-to-integer-with-decimal-in-python#1094721
            return int(float(value))
        except ValueError:
            return default_value
        except TypeError:
            return default_value

    @staticmethod
    def safe_integer_product(dictionary, key, factor, default_value=None):
        if not Exchange.key_exists(dictionary, key):
            return default_value
        value = dictionary[key]
        if isinstance(value, Number):
            return int(value * factor)
        elif isinstance(value, str):
            try:
                return int(float(value) * factor)
            except ValueError:
                pass
        return default_value

    @staticmethod
    def safe_timestamp(dictionary, key, default_value=None):
        return Exchange.safe_integer_product(dictionary, key, 1000, default_value)

    @staticmethod
    def safe_value(dictionary, key, default_value=None):
        return dictionary[key] if Exchange.key_exists(dictionary, key) else default_value

    # we're not using safe_floats with a list argument as we're trying to save some cycles here
    # we're not using safe_float_3 either because those cases are too rare to deserve their own optimization

    @staticmethod
    def safe_float_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_float, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_string_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_string, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_string_lower_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_string_lower, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_string_upper_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_string_upper, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_integer_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_integer, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_integer_product_2(dictionary, key1, key2, factor, default_value=None):
        value = Exchange.safe_integer_product(dictionary, key1, factor)
        return value if value is not None else Exchange.safe_integer_product(dictionary, key2, factor, default_value)

    @staticmethod
    def safe_timestamp_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_integer_product_2(dictionary, key1, key2, 1000, default_value)

    @staticmethod
    def safe_value_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_value, dictionary, key1, key2, default_value)

    # safe_method_n methods family

    @staticmethod
    def safe_float_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        if value is None:
            return default_value
        try:
            value = float(value)
        except ValueError as e:
            value = default_value
        return value

    @staticmethod
    def safe_string_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        return str(value) if value is not None else default_value

    @staticmethod
    def safe_string_lower_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        if value is not None:
            return str(value).lower()
        elif default_value is None:
            return default_value
        else:
            return default_value.lower()

    @staticmethod
    def safe_string_upper_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        if value is not None:
            return str(value).upper()
        elif default_value is None:
            return default_value
        else:
            return default_value.upper()

    @staticmethod
    def safe_integer_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        if value is None:
            return default_value
        try:
            # needed to avoid breaking on "100.0"
            # https://stackoverflow.com/questions/1094717/convert-a-string-to-integer-with-decimal-in-python#1094721
            return int(float(value))
        except ValueError:
            return default_value
        except TypeError:
            return default_value

    @staticmethod
    def safe_integer_product_n(dictionary, key_list, factor, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        if value is None:
            return default_value
        if isinstance(value, Number):
            return int(value * factor)
        elif isinstance(value, str):
            try:
                return int(float(value) * factor)
            except ValueError:
                pass
        return default_value

    @staticmethod
    def safe_timestamp_n(dictionary, key_list, default_value=None):
        return Exchange.safe_integer_product_n(dictionary, key_list, 1000, default_value)

    @staticmethod
    def safe_value_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        return value if value is not None else default_value

    @staticmethod
    def get_object_value_from_key_list(dictionary, key_list):
        filtered_list = list(filter(lambda el: el in dictionary, key_list))
        if (len(filtered_list) == 0):
            return None
        return dictionary[filtered_list[0]]

    @staticmethod
    def safe_either(method, dictionary, key1, key2, default_value=None):
        """A helper-wrapper for the safe_value_2() family."""
        value = method(dictionary, key1)
        return value if value is not None else method(dictionary, key2, default_value)

    @staticmethod
    def truncate(num, precision=0):
        """Deprecated, use decimal_to_precision instead"""
        if precision > 0:
            decimal_precision = math.pow(10, precision)
            return math.trunc(num * decimal_precision) / decimal_precision
        return int(Exchange.truncate_to_string(num, precision))

    @staticmethod
    def truncate_to_string(num, precision=0):
        """Deprecated, todo: remove references from subclasses"""
        if precision > 0:
            parts = ('{0:.%df}' % precision).format(Decimal(num)).split('.')
            decimal_digits = parts[1][:precision].rstrip('0')
            decimal_digits = decimal_digits if len(decimal_digits) else '0'
            return parts[0] + '.' + decimal_digits
        return ('%d' % num)

    @staticmethod
    def uuid22(length=22):
        return format(random.getrandbits(length * 4), 'x')

    @staticmethod
    def uuid16(length=16):
        return format(random.getrandbits(length * 4), 'x')

    @staticmethod
    def uuid():
        return str(uuid.uuid4())

    @staticmethod
    def uuidv1():
        return str(uuid.uuid1()).replace('-', '')

    @staticmethod
    def capitalize(string):  # first character only, rest characters unchanged
        # the native pythonic .capitalize() method lowercases all other characters
        # which is an unwanted behaviour, therefore we use this custom implementation
        # check it yourself: print('foobar'.capitalize(), 'fooBar'.capitalize())
        if len(string) > 1:
            return "%s%s" % (string[0].upper(), string[1:])
        return string.upper()

    @staticmethod
    def strip(string):
        return string.strip()

    @staticmethod
    def keysort(dictionary):
        return collections.OrderedDict(sorted(dictionary.items(), key=lambda t: t[0]))

    @staticmethod
    def extend(*args):
        if args is not None:
            result = None
            if type(args[0]) is collections.OrderedDict:
                result = collections.OrderedDict()
            else:
                result = {}
            for arg in args:
                result.update(arg)
            return result
        return {}

    @staticmethod
    def deep_extend(*args):
        result = None
        for arg in args:
            if isinstance(arg, dict):
                if not isinstance(result, dict):
                    result = {}
                for key in arg:
                    result[key] = Exchange.deep_extend(result[key] if key in result else None, arg[key])
            else:
                result = arg
        return result

    @staticmethod
    def filter_by(array, key, value=None):
        array = Exchange.to_array(array)
        return list(filter(lambda x: x[key] == value, array))

    @staticmethod
    def filterBy(array, key, value=None):
        return Exchange.filter_by(array, key, value)

    @staticmethod
    def group_by(array, key):
        result = {}
        array = Exchange.to_array(array)
        array = [entry for entry in array if (key in entry) and (entry[key] is not None)]
        for entry in array:
            if entry[key] not in result:
                result[entry[key]] = []
            result[entry[key]].append(entry)
        return result

    @staticmethod
    def groupBy(array, key):
        return Exchange.group_by(array, key)

    @staticmethod
    def index_by(array, key):
        result = {}
        if type(array) is dict:
            array = Exchange.keysort(array).values()
        is_int_key = isinstance(key, int)
        for element in array:
            if ((is_int_key and (key < len(element))) or (key in element)) and (element[key] is not None):
                k = element[key]
                result[k] = element
        return result

    @staticmethod
    def sort_by(array, key, descending=False):
        return sorted(array, key=lambda k: k[key] if k[key] is not None else "", reverse=descending)

    @staticmethod
    def sort_by_2(array, key1, key2, descending=False):
        return sorted(array, key=lambda k: (k[key1] if k[key1] is not None else "", k[key2] if k[key2] is not None else ""), reverse=descending)

    @staticmethod
    def array_concat(a, b):
        return a + b

    @staticmethod
    def in_array(needle, haystack):
        return needle in haystack

    @staticmethod
    def is_empty(object):
        return not object

    @staticmethod
    def extract_params(string):
        return re.findall(r'{([\w-]+)}', string)

    @staticmethod
    def implode_params(string, params):
        if isinstance(params, dict):
            for key in params:
                if not isinstance(params[key], list):
                    string = string.replace('{' + key + '}', str(params[key]))
        return string

    @staticmethod
    def urlencode(params={}, doseq=False):
        for key, value in params.items():
            if isinstance(value, bool):
                params[key] = 'true' if value else 'false'
        return _urlencode.urlencode(params, doseq)

    @staticmethod
    def urlencode_with_array_repeat(params={}):
        return re.sub(r'%5B\d*%5D', '', Exchange.urlencode(params, True))

    @staticmethod
    def urlencode_nested(params):
        result = {}

        def _encode_params(params, p_key=None):
            encode_params = {}
            if isinstance(params, dict):
                for key in params:
                    encode_key = '{}[{}]'.format(p_key, key)
                    encode_params[encode_key] = params[key]
            elif isinstance(params, (list, tuple)):
                for offset, value in enumerate(params):
                    encode_key = '{}[{}]'.format(p_key, offset)
                    encode_params[encode_key] = value
            else:
                result[p_key] = params
            for key in encode_params:
                value = encode_params[key]
                _encode_params(value, key)
        if isinstance(params, dict):
            for key in params:
                _encode_params(params[key], key)
        return _urlencode.urlencode(result)

    @staticmethod
    def rawencode(params={}):
        return _urlencode.unquote(Exchange.urlencode(params))

    @staticmethod
    def encode_uri_component(uri, safe="~()*!.'"):
        return _urlencode.quote(uri, safe=safe)

    @staticmethod
    def omit(d, *args):
        if isinstance(d, dict):
            result = d.copy()
            for arg in args:
                if type(arg) is list:
                    for key in arg:
                        if key in result:
                            del result[key]
                else:
                    if arg in result:
                        del result[arg]
            return result
        return d

    @staticmethod
    def unique(array):
        return list(set(array))

    @staticmethod
    def pluck(array, key):
        return [
            element[key]
            for element in array
            if (key in element) and (element[key] is not None)
        ]

    @staticmethod
    def sum(*args):
        return sum([arg for arg in args if isinstance(arg, (float, int))])

    @staticmethod
    def ordered(array):
        return collections.OrderedDict(array)

    @staticmethod
    def aggregate(bidasks):
        ordered = Exchange.ordered({})
        for [price, volume, *_] in bidasks:
            if volume > 0:
                ordered[price] = (ordered[price] if price in ordered else 0) + volume
        result = []
        items = list(ordered.items())
        for price, volume in items:
            result.append([price, volume])
        return result

    @staticmethod
    def sec():
        return Exchange.seconds()

    @staticmethod
    def msec():
        return Exchange.milliseconds()

    @staticmethod
    def usec():
        return Exchange.microseconds()

    @staticmethod
    def seconds():
        return int(time.time())

    @staticmethod
    def milliseconds():
        return int(time.time() * 1000)

    @staticmethod
    def microseconds():
        return int(time.time() * 1000000)

    @staticmethod
    def iso8601(timestamp=None):
        if timestamp is None:
            return timestamp
        if not isinstance(timestamp, int):
            return None
        if int(timestamp) < 0:
            return None

        try:
            utc = datetime.datetime.utcfromtimestamp(timestamp // 1000)
            return utc.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-6] + "{:03d}".format(int(timestamp) % 1000) + 'Z'
        except (TypeError, OverflowError, OSError):
            return None

    @staticmethod
    def rfc2616(self, timestamp=None):
        if timestamp is None:
            ts = datetime.datetime.now()
        else:
            ts = timestamp
        stamp = mktime(ts.timetuple())
        return format_date_time(stamp)

    @staticmethod
    def dmy(timestamp, infix='-'):
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime('%m' + infix + '%d' + infix + '%Y')

    @staticmethod
    def ymd(timestamp, infix='-', fullYear=True):
        year_format = '%Y' if fullYear else '%y'
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime(year_format + infix + '%m' + infix + '%d')

    @staticmethod
    def yymmdd(timestamp, infix=''):
        return Exchange.ymd(timestamp, infix, False)

    @staticmethod
    def yyyymmdd(timestamp, infix='-'):
        return Exchange.ymd(timestamp, infix, True)

    @staticmethod
    def ymdhms(timestamp, infix=' '):
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime('%Y-%m-%d' + infix + '%H:%M:%S')

    @staticmethod
    def parse_date(timestamp=None):
        if timestamp is None:
            return timestamp
        if not isinstance(timestamp, str):
            return None
        if 'GMT' in timestamp:
            try:
                string = ''.join([str(value) for value in parsedate(timestamp)[:6]]) + '.000Z'
                dt = datetime.datetime.strptime(string, "%Y%m%d%H%M%S.%fZ")
                return calendar.timegm(dt.utctimetuple()) * 1000
            except (TypeError, OverflowError, OSError):
                return None
        else:
            return Exchange.parse8601(timestamp)

    @staticmethod
    def parse8601(timestamp=None):
        if timestamp is None:
            return timestamp
        yyyy = '([0-9]{4})-?'
        mm = '([0-9]{2})-?'
        dd = '([0-9]{2})(?:T|[\\s])?'
        h = '([0-9]{2}):?'
        m = '([0-9]{2}):?'
        s = '([0-9]{2})'
        ms = '(\\.[0-9]{1,3})?'
        tz = '(?:(\\+|\\-)([0-9]{2})\\:?([0-9]{2})|Z)?'
        regex = r'' + yyyy + mm + dd + h + m + s + ms + tz
        try:
            match = re.search(regex, timestamp, re.IGNORECASE)
            if match is None:
                return None
            yyyy, mm, dd, h, m, s, ms, sign, hours, minutes = match.groups()
            ms = ms or '.000'
            ms = (ms + '00')[0:4]
            msint = int(ms[1:])
            sign = sign or ''
            sign = int(sign + '1') * -1
            hours = int(hours or 0) * sign
            minutes = int(minutes or 0) * sign
            offset = datetime.timedelta(hours=hours, minutes=minutes)
            string = yyyy + mm + dd + h + m + s + ms + 'Z'
            dt = datetime.datetime.strptime(string, "%Y%m%d%H%M%S.%fZ")
            dt = dt + offset
            return calendar.timegm(dt.utctimetuple()) * 1000 + msint
        except (TypeError, OverflowError, OSError, ValueError):
            return None

    @staticmethod
    def hash(request, algorithm='md5', digest='hex'):
        if algorithm == 'keccak':
            binary = bytes(keccak.SHA3(request))
        else:
            h = hashlib.new(algorithm, request)
            binary = h.digest()
        if digest == 'base64':
            return Exchange.binary_to_base64(binary)
        elif digest == 'hex':
            return Exchange.binary_to_base16(binary)
        return binary

    @staticmethod
    def hmac(request, secret, algorithm=hashlib.sha256, digest='hex'):
        h = hmac.new(secret, request, algorithm)
        binary = h.digest()
        if digest == 'hex':
            return Exchange.binary_to_base16(binary)
        elif digest == 'base64':
            return Exchange.binary_to_base64(binary)
        return binary

    @staticmethod
    def binary_concat(*args):
        result = bytes()
        for arg in args:
            result = result + arg
        return result

    @staticmethod
    def binary_concat_array(array):
        result = bytes()
        for element in array:
            result = result + element
        return result

    @staticmethod
    def base64urlencode(s):
        return Exchange.decode(base64.urlsafe_b64encode(s)).replace('=', '')

    @staticmethod
    def binary_to_base64(s):
        return Exchange.decode(base64.standard_b64encode(s))

    @staticmethod
    def base64_to_binary(s):
        return base64.standard_b64decode(s)

    @staticmethod
    def string_to_base64(s):
        # will return string in the future
        binary = Exchange.encode(s) if isinstance(s, str) else s
        return Exchange.encode(Exchange.binary_to_base64(binary))

    @staticmethod
    def base64_to_string(s):
        return base64.b64decode(s).decode('utf-8')

    @staticmethod
    def jwt(request, secret, alg='HS256'):
        algos = {
            'HS256': hashlib.sha256,
            'HS384': hashlib.sha384,
            'HS512': hashlib.sha512,
        }
        header = Exchange.encode(Exchange.json({
            'alg': alg,
            'typ': 'JWT',
        }))
        encoded_header = Exchange.base64urlencode(header)
        encoded_data = Exchange.base64urlencode(Exchange.encode(Exchange.json(request)))
        token = encoded_header + '.' + encoded_data
        if alg[:2] == 'RS':
            signature = Exchange.rsa(token, secret, alg)
        else:
            algorithm = algos[alg]
            signature = Exchange.hmac(Exchange.encode(token), secret, algorithm, 'binary')
        return token + '.' + Exchange.base64urlencode(signature)

    @staticmethod
    def rsa(request, secret, alg='RS256'):
        algorithms = {
            "RS256": hashes.SHA256(),
            "RS384": hashes.SHA384(),
            "RS512": hashes.SHA512(),
        }
        algorithm = algorithms[alg]
        priv_key = load_pem_private_key(secret, None, backends.default_backend())
        return priv_key.sign(Exchange.encode(request), padding.PKCS1v15(), algorithm)

    @staticmethod
    def ecdsa(request, secret, algorithm='p256', hash=None, fixed_length=False):
        # your welcome - frosty00
        algorithms = {
            'p192': [ecdsa.NIST192p, 'sha256'],
            'p224': [ecdsa.NIST224p, 'sha256'],
            'p256': [ecdsa.NIST256p, 'sha256'],
            'p384': [ecdsa.NIST384p, 'sha384'],
            'p521': [ecdsa.NIST521p, 'sha512'],
            'secp256k1': [ecdsa.SECP256k1, 'sha256'],
        }
        if algorithm not in algorithms:
            raise ArgumentsRequired(algorithm + ' is not a supported algorithm')
        curve_info = algorithms[algorithm]
        hash_function = getattr(hashlib, curve_info[1])
        encoded_request = Exchange.encode(request)
        if hash is not None:
            digest = Exchange.hash(encoded_request, hash, 'binary')
        else:
            digest = base64.b16decode(encoded_request, casefold=True)
        key = ecdsa.SigningKey.from_string(base64.b16decode(Exchange.encode(secret),
                                                            casefold=True), curve=curve_info[0])
        r_binary, s_binary, v = key.sign_digest_deterministic(digest, hashfunc=hash_function,
                                                              sigencode=ecdsa.util.sigencode_strings_canonize)
        r_int, s_int = ecdsa.util.sigdecode_strings((r_binary, s_binary), key.privkey.order)
        counter = 0
        minimum_size = (1 << (8 * 31)) - 1
        half_order = key.privkey.order / 2
        while fixed_length and (r_int > half_order or r_int <= minimum_size or s_int <= minimum_size):
            r_binary, s_binary, v = key.sign_digest_deterministic(digest, hashfunc=hash_function,
                                                                  sigencode=ecdsa.util.sigencode_strings_canonize,
                                                                  extra_entropy=Exchange.number_to_le(counter, 32))
            r_int, s_int = ecdsa.util.sigdecode_strings((r_binary, s_binary), key.privkey.order)
            counter += 1
        r, s = Exchange.decode(base64.b16encode(r_binary)).lower(), Exchange.decode(base64.b16encode(s_binary)).lower()
        return {
            'r': r,
            's': s,
            'v': v,
        }

    @staticmethod
    def eddsa(request, secret, curve='ed25519'):
        random = b'\x00' * 64
        request = base64.b16decode(request, casefold=True)
        secret = base64.b16decode(secret, casefold=True)
        signature = eddsa.calculateSignature(random, secret, request)
        return Exchange.binary_to_base58(signature)

    @staticmethod
    def json(data, params=None):
        return json.dumps(data, separators=(',', ':'))

    @staticmethod
    def is_json_encoded_object(input):
        return (isinstance(input, str) and
                (len(input) >= 2) and
                ((input[0] == '{') or (input[0] == '[')))

    @staticmethod
    def encode(string):
        return string.encode('latin-1')

    @staticmethod
    def decode(string):
        return string.decode('latin-1')

    @staticmethod
    def to_array(value):
        return list(value.values()) if type(value) is dict else value

    @staticmethod
    def check_required_version(required_version, error=True):
        result = True
        [major1, minor1, patch1] = required_version.split('.')
        [major2, minor2, patch2] = __version__.split('.')
        int_major1 = int(major1)
        int_minor1 = int(minor1)
        int_patch1 = int(patch1)
        int_major2 = int(major2)
        int_minor2 = int(minor2)
        int_patch2 = int(patch2)
        if int_major1 > int_major2:
            result = False
        if int_major1 == int_major2:
            if int_minor1 > int_minor2:
                result = False
            elif int_minor1 == int_minor2 and int_patch1 > int_patch2:
                result = False
        if not result:
            if error:
                raise NotSupported('Your current version of CCXT is ' + __version__ + ', a newer version ' + required_version + ' is required, please, upgrade your version of CCXT')
            else:
                return error
        return result

    def check_address(self, address):
        """Checks an address is not the same character repeated or an empty sequence"""
        if address is None:
            raise InvalidAddress(self.id + ' address is None')
        if all(letter == address[0] for letter in address) or len(address) < self.minFundingAddressLength or ' ' in address:
            raise InvalidAddress(self.id + ' address is invalid or has less than ' + str(self.minFundingAddressLength) + ' characters: "' + str(address) + '"')
        return address

    def precision_from_string(self, string):
        parts = re.sub(r'0+$', '', string).split('.')
        return len(parts[1]) if len(parts) > 1 else 0

    def load_markets(self, reload=False, params={}):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets(self.markets)
                return self.markets
        currencies = None
        if self.has['fetchCurrencies'] is True:
            currencies = self.fetch_currencies()
        markets = self.fetch_markets(params)
        return self.set_markets(markets, currencies)

    def load_fees(self, reload=False):
        if not reload:
            if self.loaded_fees != Exchange.loaded_fees:
                return self.loaded_fees
        self.loaded_fees = self.deep_extend(self.loaded_fees, self.fetch_fees())
        return self.loaded_fees

    def fetch_markets(self, params={}):
        # markets are returned as a list
        # currencies are returned as a dict
        # this is for historical reasons
        # and may be changed for consistency later
        return self.to_array(self.markets)

    def fetch_currencies(self, params={}):
        # markets are returned as a list
        # currencies are returned as a dict
        # this is for historical reasons
        # and may be changed for consistency later
        return self.currencies

    def fetch_fees(self):
        trading = {}
        funding = {}
        if self.has['fetchTradingFees']:
            trading = self.fetch_trading_fees()
        if self.has['fetchFundingFees']:
            funding = self.fetch_funding_fees()
        return {
            'trading': trading,
            'funding': funding,
        }

    def fetch_order_trades(self, id, symbol=None, params={}):
        raise NotSupported(self.id + ' fetch_order_trades() is not supported yet')

    def build_ohlcvc(self, trades, timeframe='1m', since=None, limit=None):
        ms = self.parse_timeframe(timeframe) * 1000
        ohlcvs = []
        (timestamp, open, high, low, close, volume, count) = (0, 1, 2, 3, 4, 5, 6)
        num_trades = len(trades)
        oldest = (num_trades - 1) if limit is None else min(num_trades - 1, limit)
        for i in range(0, oldest):
            trade = trades[i]
            if (since is not None) and (trade['timestamp'] < since):
                continue
            opening_time = None
            if trade['timestamp']:
                opening_time = int(math.floor(trade['timestamp'] / ms) * ms)  # Shift the edge of the m/h/d (but not M)
            j = len(ohlcvs)
            candle = j - 1
            if (j == 0) or (opening_time and opening_time >= ohlcvs[candle][timestamp] + ms):
                # moved to a new timeframe -> create a new candle from opening trade
                ohlcvs.append([
                    opening_time,
                    trade['price'],
                    trade['price'],
                    trade['price'],
                    trade['price'],
                    trade['amount'],
                    1,  # count
                ])
            else:
                # still processing the same timeframe -> update opening trade
                ohlcvs[candle][high] = max(ohlcvs[candle][high], trade['price'])
                ohlcvs[candle][low] = min(ohlcvs[candle][low], trade['price'])
                ohlcvs[candle][close] = trade['price']
                ohlcvs[candle][volume] += trade['amount']
                ohlcvs[candle][count] += 1
        return ohlcvs

    @staticmethod
    def parse_timeframe(timeframe):
        amount = int(timeframe[0:-1])
        unit = timeframe[-1]
        if 'y' == unit:
            scale = 60 * 60 * 24 * 365
        elif 'M' == unit:
            scale = 60 * 60 * 24 * 30
        elif 'w' == unit:
            scale = 60 * 60 * 24 * 7
        elif 'd' == unit:
            scale = 60 * 60 * 24
        elif 'h' == unit:
            scale = 60 * 60
        elif 'm' == unit:
            scale = 60
        elif 's' == unit:
            scale = 1
        else:
            raise NotSupported('timeframe unit {} is not supported'.format(unit))
        return amount * scale

    @staticmethod
    def round_timeframe(timeframe, timestamp, direction=ROUND_DOWN):
        ms = Exchange.parse_timeframe(timeframe) * 1000
        # Get offset based on timeframe in milliseconds
        offset = timestamp % ms
        return timestamp - offset + (ms if direction == ROUND_UP else 0)

    def filter_by_value_since_limit(self, array, field, value=None, since=None, limit=None, key='timestamp', tail=False):
        array = self.to_array(array)
        if value is not None:
            array = [entry for entry in array if entry[field] == value]
        if since is not None:
            array = [entry for entry in array if entry[key] >= since]
        if limit is not None:
            array = array[-limit:] if tail else array[:limit]
        return array

    def filter_by_since_limit(self, array, since=None, limit=None, key='timestamp', tail=False):
        array = self.to_array(array)
        if since is not None:
            array = [entry for entry in array if entry[key] >= since]
        if limit is not None:
            array = array[-limit:] if tail else array[:limit]
        return array

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        raise NotSupported(self.id + ' sign() pure method must be redefined in derived classes')

    def vwap(self, baseVolume, quoteVolume):
        return (quoteVolume / baseVolume) if (quoteVolume is not None) and (baseVolume is not None) and (baseVolume > 0) else None

    def check_required_dependencies(self):
        if self.requiresEddsa and eddsa is None:
            raise NotSupported(self.id + ' Eddsa functionality requires python-axolotl-curve25519, install with `pip install python-axolotl-curve25519==0.4.1.post2`: https://github.com/tgalal/python-axolotl-curve25519')

    def privateKeyToAddress(self, privateKey):
        private_key_bytes = base64.b16decode(Exchange.encode(privateKey), True)
        public_key_bytes = ecdsa.SigningKey.from_string(private_key_bytes, curve=ecdsa.SECP256k1).verifying_key.to_string()
        public_key_hash = keccak.SHA3(public_key_bytes)
        return '0x' + Exchange.decode(base64.b16encode(public_key_hash))[-40:].lower()

    @staticmethod
    def remove0x_prefix(value):
        if value[:2] == '0x':
            return value[2:]
        return value

    def hashMessage(self, message):
        message_bytes = base64.b16decode(Exchange.encode(Exchange.remove0x_prefix(message)), True)
        hash_bytes = keccak.SHA3(b"\x19Ethereum Signed Message:\n" + Exchange.encode(str(len(message_bytes))) + message_bytes)
        return '0x' + Exchange.decode(base64.b16encode(hash_bytes)).lower()

    @staticmethod
    def signHash(hash, privateKey):
        signature = Exchange.ecdsa(hash[-64:], privateKey, 'secp256k1', None)
        return {
            'r': '0x' + signature['r'],
            's': '0x' + signature['s'],
            'v': 27 + signature['v'],
        }

    def sign_message_string(self, message, privateKey):
        signature = self.signMessage(message, privateKey)
        return signature['r'] + Exchange.remove0x_prefix(signature['s']) + Exchange.binary_to_base16(Exchange.number_to_be(signature['v'], 1))

    def signMessage(self, message, privateKey):
        #
        # The following comment is related to MetaMask, we use the upper type of signature prefix:
        #
        # z.ecSignOrderHashAsync ('0xcfdb0a485324ff37699b4c8557f6858f25916fc6fce5993b32fe018aea510b9f',
        #                         '0x731fc101bbe102221c91c31ed0489f1ddfc439a3', {
        #                              prefixType: 'ETH_SIGN',
        #                              shouldAddPrefixBeforeCallingEthSign: true
        #                          }).then ((e, r) => console.log (e,r))
        #
        #     {                            ↓
        #         v: 28,
        #         r: "0xea7a68268b47c48d5d7a4c900e6f9af0015bf70951b3db2f1d835c5d544aaec2",
        #         s: "0x5d1db2a060c955c1fde4c967237b995c2361097405407b33c6046c8aeb3ccbdf"
        #     }
        #
        # --------------------------------------------------------------------
        #
        # z.ecSignOrderHashAsync ('0xcfdb0a485324ff37699b4c8557f6858f25916fc6fce5993b32fe018aea510b9f',
        #                         '0x731fc101bbe102221c91c31ed0489f1ddfc439a3', {
        #                              prefixType: 'NONE',
        #                              shouldAddPrefixBeforeCallingEthSign: true
        #                          }).then ((e, r) => console.log (e,r))
        #
        #     {                            ↓
        #         v: 27,
        #         r: "0xc8c710022c57de4f529d448e9b40517dd9bfb49ff1eb245f5856664b865d14a6",
        #         s: "0x0740bb21f4f094fbbdbafa903bb8f057f82e0c6e4fe65d19a1daed4ed97cd394"
        #     }
        #
        message_hash = self.hashMessage(message)
        signature = self.signHash(message_hash[-64:], privateKey[-64:])
        return signature

    @staticmethod
    def totp(key):
        def hex_to_dec(n):
            return int(n, base=16)

        def base32_to_bytes(n):
            missing_padding = len(n) % 8
            padding = 8 - missing_padding if missing_padding > 0 else 0
            padded = n.upper() + ('=' * padding)
            return base64.b32decode(padded)  # throws an error if the key is invalid

        epoch = int(time.time()) // 30
        hmac_res = Exchange.hmac(epoch.to_bytes(8, 'big'), base32_to_bytes(key.replace(' ', '')), hashlib.sha1, 'hex')
        offset = hex_to_dec(hmac_res[-1]) * 2
        otp = str(hex_to_dec(hmac_res[offset: offset + 8]) & 0x7fffffff)
        return otp[-6:]

    @staticmethod
    def number_to_le(n, size):
        return int(n).to_bytes(size, 'little')

    @staticmethod
    def number_to_be(n, size):
        return int(n).to_bytes(size, 'big')

    @staticmethod
    def base16_to_binary(s):
        return base64.b16decode(s, True)

    @staticmethod
    def binary_to_base16(s):
        return Exchange.decode(base64.b16encode(s)).lower()

    def sleep(self, milliseconds):
        return time.sleep(milliseconds / 1000)

    @staticmethod
    def base58_to_binary(s):
        """encodes a base58 string to as a big endian integer"""
        if Exchange.base58_decoder is None:
            Exchange.base58_decoder = {}
            Exchange.base58_encoder = {}
            for i, c in enumerate(Exchange.base58_alphabet):
                Exchange.base58_decoder[c] = i
                Exchange.base58_encoder[i] = c
        result = 0
        for i in range(len(s)):
            result *= 58
            result += Exchange.base58_decoder[s[i]]
        return result.to_bytes((result.bit_length() + 7) // 8, 'big')

    @staticmethod
    def binary_to_base58(b):
        if Exchange.base58_encoder is None:
            Exchange.base58_decoder = {}
            Exchange.base58_encoder = {}
            for i, c in enumerate(Exchange.base58_alphabet):
                Exchange.base58_decoder[c] = i
                Exchange.base58_encoder[i] = c
        result = 0
        # undo decimal_to_bytes
        for byte in b:
            result *= 0x100
            result += byte
        string = []
        while result > 0:
            result, next_character = divmod(result, 58)
            string.append(Exchange.base58_encoder[next_character])
        string.reverse()
        return ''.join(string)

    def parse_number(self, value, default=None):
        if value is None:
            return default
        else:
            try:
                return self.number(value)
            except Exception:
                return default

    def omit_zero(self, string_number):
        if string_number is None or string_number == '':
            return None
        if float(string_number) == 0:
            return None
        return string_number

    def check_order_arguments(self, market, type, side, amount, price, params):
        if price is None:
            if type == 'limit':
                raise ArgumentsRequired(self.id + ' create_order() requires a price argument for a limit order')
        if amount <= 0:
            raise ArgumentsRequired(self.id + ' create_order() amount should be above 0')

    def handle_http_status_code(self, code, reason, url, method, body):
        codeAsString = str(code)
        if codeAsString in self.httpExceptions:
            ErrorClass = self.httpExceptions[codeAsString]
            raise ErrorClass(self.id + ' ' + method + ' ' + url + ' ' + codeAsString + ' ' + reason + ' ' + body)

    @staticmethod
    def crc32(string, signed=False):
        unsigned = binascii.crc32(string.encode('utf8'))
        if signed and (unsigned >= 0x80000000):
            return unsigned - 0x100000000
        else:
            return unsigned

    # ########################################################################
    # ########################################################################
    # ########################################################################
    # ########################################################################
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########        ########################        ########################
    # ########        ########################        ########################
    # ########        ########################        ########################
    # ########        ########################        ########################
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########################################################################
    # ########################################################################
    # ########################################################################
    # ########################################################################
    # ########        ########        ########                        ########
    # ########        ########        ########                        ########
    # ########        ########        ########                        ########
    # ########        ########        ########                        ########
    # ################        ########################        ################
    # ################        ########################        ################
    # ################        ########################        ################
    # ################        ########################        ################
    # ########        ########        ################        ################
    # ########        ########        ################        ################
    # ########        ########        ################        ################
    # ########        ########        ################        ################
    # ########################################################################
    # ########################################################################
    # ########################################################################
    # ########################################################################

    # METHODS BELOW THIS LINE ARE TRANSPILED FROM JAVASCRIPT TO PYTHON AND PHP

    def safe_ledger_entry(self, entry, currency=None):
        currency = self.safe_currency(None, currency)
        direction = self.safe_string(entry, 'direction')
        before = self.safe_string(entry, 'before')
        after = self.safe_string(entry, 'after')
        amount = self.safe_string(entry, 'amount')
        if amount is not None:
            if before is None and after is not None:
                before = Precise.string_sub(after, amount)
            elif before is not None and after is None:
                after = Precise.string_add(before, amount)
        if before is not None and after is not None:
            if direction is None:
                if Precise.string_gt(before, after):
                    direction = 'out'
                if Precise.string_gt(after, before):
                    direction = 'in'
        fee = self.safe_value(entry, 'fee')
        if fee is not None:
            fee['cost'] = self.safe_number(fee, 'cost')
        timestamp = self.safe_integer(entry, 'timestamp')
        return {
            'id': self.safe_string(entry, 'id'),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'direction': direction,
            'account': self.safe_string(entry, 'account'),
            'referenceId': self.safe_string(entry, 'referenceId'),
            'referenceAccount': self.safe_string(entry, 'referenceAccount'),
            'type': self.safe_string(entry, 'type'),
            'currency': currency['code'],
            'amount': self.parse_number(amount),
            'before': self.parse_number(before),
            'after': self.parse_number(after),
            'status': self.safe_string(entry, 'status'),
            'fee': fee,
            'info': entry,
        }

    def set_markets(self, markets, currencies=None):
        values = []
        marketValues = self.to_array(markets)
        for i in range(0, len(marketValues)):
            market = self.deep_extend(self.safe_market(), {
                'precision': self.precision,
                'limits': self.limits,
            }, self.fees['trading'], marketValues[i])
            values.append(market)
        self.markets = self.index_by(values, 'symbol')
        self.markets_by_id = self.index_by(markets, 'id')
        marketsSortedBySymbol = self.keysort(self.markets)
        marketsSortedById = self.keysort(self.markets_by_id)
        self.symbols = list(marketsSortedBySymbol.keys())
        self.ids = list(marketsSortedById.keys())
        if currencies is not None:
            self.currencies = self.deep_extend(self.currencies, currencies)
        else:
            baseCurrencies = []
            quoteCurrencies = []
            for i in range(0, len(values)):
                market = values[i]
                defaultCurrencyPrecision = 8 if (self.precisionMode == DECIMAL_PLACES) else self.parse_number('0.00000001')
                marketPrecision = self.safe_value(market, 'precision', {})
                if 'base' in market:
                    currencyPrecision = self.safe_value_2(marketPrecision, 'base', 'amount', defaultCurrencyPrecision)
                    currency = {
                        'id': self.safe_string_2(market, 'baseId', 'base'),
                        'numericId': self.safe_string(market, 'baseNumericId'),
                        'code': self.safe_string(market, 'base'),
                        'precision': currencyPrecision,
                    }
                    baseCurrencies.append(currency)
                if 'quote' in market:
                    currencyPrecision = self.safe_value_2(marketPrecision, 'quote', 'price', defaultCurrencyPrecision)
                    currency = {
                        'id': self.safe_string_2(market, 'quoteId', 'quote'),
                        'numericId': self.safe_string(market, 'quoteNumericId'),
                        'code': self.safe_string(market, 'quote'),
                        'precision': currencyPrecision,
                    }
                    quoteCurrencies.append(currency)
            baseCurrencies = self.sort_by(baseCurrencies, 'code')
            quoteCurrencies = self.sort_by(quoteCurrencies, 'code')
            self.baseCurrencies = self.index_by(baseCurrencies, 'code')
            self.quoteCurrencies = self.index_by(quoteCurrencies, 'code')
            allCurrencies = self.array_concat(baseCurrencies, quoteCurrencies)
            groupedCurrencies = self.group_by(allCurrencies, 'code')
            codes = list(groupedCurrencies.keys())
            resultingCurrencies = []
            for i in range(0, len(codes)):
                code = codes[i]
                groupedCurrenciesCode = self.safe_value(groupedCurrencies, code, [])
                highestPrecisionCurrency = self.safe_value(groupedCurrenciesCode, 0)
                for j in range(1, len(groupedCurrenciesCode)):
                    currentCurrency = groupedCurrenciesCode[j]
                    if self.precisionMode == TICK_SIZE:
                        highestPrecisionCurrency = currentCurrency if (currentCurrency['precision'] < highestPrecisionCurrency['precision']) else highestPrecisionCurrency
                    else:
                        highestPrecisionCurrency = currentCurrency if (currentCurrency['precision'] > highestPrecisionCurrency['precision']) else highestPrecisionCurrency
                resultingCurrencies.append(highestPrecisionCurrency)
            sortedCurrencies = self.sort_by(resultingCurrencies, 'code')
            self.currencies = self.deep_extend(self.currencies, self.index_by(sortedCurrencies, 'code'))
        self.currencies_by_id = self.index_by(self.currencies, 'id')
        currenciesSortedByCode = self.keysort(self.currencies)
        self.codes = list(currenciesSortedByCode.keys())
        return self.markets

    def safe_balance(self, balance):
        balances = self.omit(balance, ['info', 'timestamp', 'datetime', 'free', 'used', 'total'])
        codes = list(balances.keys())
        balance['free'] = {}
        balance['used'] = {}
        balance['total'] = {}
        debtBalance = {}
        for i in range(0, len(codes)):
            code = codes[i]
            total = self.safe_string(balance[code], 'total')
            free = self.safe_string(balance[code], 'free')
            used = self.safe_string(balance[code], 'used')
            debt = self.safe_string(balance[code], 'debt')
            if (total is None) and (free is not None) and (used is not None):
                total = Precise.string_add(free, used)
            if (free is None) and (total is not None) and (used is not None):
                free = Precise.string_sub(total, used)
            if (used is None) and (total is not None) and (free is not None):
                used = Precise.string_sub(total, free)
            balance[code]['free'] = self.parse_number(free)
            balance[code]['used'] = self.parse_number(used)
            balance[code]['total'] = self.parse_number(total)
            balance['free'][code] = balance[code]['free']
            balance['used'][code] = balance[code]['used']
            balance['total'][code] = balance[code]['total']
            if debt is not None:
                balance[code]['debt'] = self.parse_number(debt)
                debtBalance[code] = balance[code]['debt']
        debtBalanceArray = list(debtBalance.keys())
        length = len(debtBalanceArray)
        if length:
            balance['debt'] = debtBalance
        return balance

    def safe_order(self, order, market=None):
        # parses numbers as strings
        # it is important pass the trades as unparsed rawTrades
        amount = self.omit_zero(self.safe_string(order, 'amount'))
        remaining = self.safe_string(order, 'remaining')
        filled = self.safe_string(order, 'filled')
        cost = self.safe_string(order, 'cost')
        average = self.omit_zero(self.safe_string(order, 'average'))
        price = self.omit_zero(self.safe_string(order, 'price'))
        lastTradeTimeTimestamp = self.safe_integer(order, 'lastTradeTimestamp')
        parseFilled = (filled is None)
        parseCost = (cost is None)
        parseLastTradeTimeTimestamp = (lastTradeTimeTimestamp is None)
        fee = self.safe_value(order, 'fee')
        parseFee = (fee is None)
        parseFees = self.safe_value(order, 'fees') is None
        shouldParseFees = parseFee or parseFees
        fees = self.safe_value(order, 'fees', [])
        trades = []
        if parseFilled or parseCost or shouldParseFees:
            rawTrades = self.safe_value(order, 'trades', trades)
            oldNumber = self.number
            # we parse trades as strings here!
            self.number = str
            trades = self.parse_trades(rawTrades, market, None, None, {
                'symbol': order['symbol'],
                'side': order['side'],
                'type': order['type'],
                'order': order['id'],
            })
            self.number = oldNumber
            tradesLength = 0
            isArray = isinstance(trades, list)
            if isArray:
                tradesLength = len(trades)
            if isArray and (tradesLength > 0):
                # move properties that are defined in trades up into the order
                if order['symbol'] is None:
                    order['symbol'] = trades[0]['symbol']
                if order['side'] is None:
                    order['side'] = trades[0]['side']
                if order['type'] is None:
                    order['type'] = trades[0]['type']
                if order['id'] is None:
                    order['id'] = trades[0]['order']
                if parseFilled:
                    filled = '0'
                if parseCost:
                    cost = '0'
                for i in range(0, len(trades)):
                    trade = trades[i]
                    tradeAmount = self.safe_string(trade, 'amount')
                    if parseFilled and (tradeAmount is not None):
                        filled = Precise.string_add(filled, tradeAmount)
                    tradeCost = self.safe_string(trade, 'cost')
                    if parseCost and (tradeCost is not None):
                        cost = Precise.string_add(cost, tradeCost)
                    tradeTimestamp = self.safe_value(trade, 'timestamp')
                    if parseLastTradeTimeTimestamp and (tradeTimestamp is not None):
                        if lastTradeTimeTimestamp is None:
                            lastTradeTimeTimestamp = tradeTimestamp
                        else:
                            lastTradeTimeTimestamp = max(lastTradeTimeTimestamp, tradeTimestamp)
                    if shouldParseFees:
                        tradeFees = self.safe_value(trade, 'fees')
                        if tradeFees is not None:
                            for j in range(0, len(tradeFees)):
                                tradeFee = tradeFees[j]
                                fees.append(self.extend({}, tradeFee))
                        else:
                            tradeFee = self.safe_value(trade, 'fee')
                            if tradeFee is not None:
                                fees.append(self.extend({}, tradeFee))
        if shouldParseFees:
            reducedFees = self.reduce_fees_by_currency(fees) if self.reduceFees else fees
            reducedLength = len(reducedFees)
            for i in range(0, reducedLength):
                reducedFees[i]['cost'] = self.safe_number(reducedFees[i], 'cost')
                if 'rate' in reducedFees[i]:
                    reducedFees[i]['rate'] = self.safe_number(reducedFees[i], 'rate')
            if not parseFee and (reducedLength == 0):
                fee['cost'] = self.safe_number(fee, 'cost')
                if 'rate' in fee:
                    fee['rate'] = self.safe_number(fee, 'rate')
                reducedFees.append(fee)
            order['fees'] = reducedFees
            if parseFee and (reducedLength == 1):
                order['fee'] = reducedFees[0]
        if amount is None:
            # ensure amount = filled + remaining
            if filled is not None and remaining is not None:
                amount = Precise.string_add(filled, remaining)
            elif self.safe_string(order, 'status') == 'closed':
                amount = filled
        if filled is None:
            if amount is not None and remaining is not None:
                filled = Precise.string_sub(amount, remaining)
        if remaining is None:
            if amount is not None and filled is not None:
                remaining = Precise.string_sub(amount, filled)
        # ensure that the average field is calculated correctly
        if average is None:
            if (filled is not None) and (cost is not None) and Precise.string_gt(filled, '0'):
                average = Precise.string_div(cost, filled)
        # also ensure the cost field is calculated correctly
        costPriceExists = (average is not None) or (price is not None)
        if parseCost and (filled is not None) and costPriceExists:
            multiplyPrice = None
            if average is None:
                multiplyPrice = price
            else:
                multiplyPrice = average
            # contract trading
            contractSize = self.safe_string(market, 'contractSize')
            if contractSize is not None:
                inverse = self.safe_value(market, 'inverse', False)
                if inverse:
                    multiplyPrice = Precise.string_div('1', multiplyPrice)
                multiplyPrice = Precise.string_mul(multiplyPrice, contractSize)
            cost = Precise.string_mul(multiplyPrice, filled)
        # support for market orders
        orderType = self.safe_value(order, 'type')
        emptyPrice = (price is None) or Precise.string_equals(price, '0')
        if emptyPrice and (orderType == 'market'):
            price = average
        # we have trades with string values at self point so we will mutate them
        for i in range(0, len(trades)):
            entry = trades[i]
            entry['amount'] = self.safe_number(entry, 'amount')
            entry['price'] = self.safe_number(entry, 'price')
            entry['cost'] = self.safe_number(entry, 'cost')
            fee = self.safe_value(entry, 'fee', {})
            fee['cost'] = self.safe_number(fee, 'cost')
            if 'rate' in fee:
                fee['rate'] = self.safe_number(fee, 'rate')
            entry['fee'] = fee
        # timeInForceHandling
        timeInForce = self.safe_string(order, 'timeInForce')
        if timeInForce is None:
            if self.safe_string(order, 'type') == 'market':
                timeInForce = 'IOC'
            # allow postOnly override
            if self.safe_value(order, 'postOnly', False):
                timeInForce = 'PO'
        return self.extend(order, {
            'lastTradeTimestamp': lastTradeTimeTimestamp,
            'price': self.parse_number(price),
            'amount': self.parse_number(amount),
            'cost': self.parse_number(cost),
            'average': self.parse_number(average),
            'filled': self.parse_number(filled),
            'remaining': self.parse_number(remaining),
            'timeInForce': timeInForce,
            'trades': trades,
        })

    def parse_orders(self, orders, market=None, since=None, limit=None, params={}):
        #
        # the value of orders is either a dict or a list
        #
        # dict
        #
        #     {
        #         'id1': {...},
        #         'id2': {...},
        #         'id3': {...},
        #         ...
        #     }
        #
        # list
        #
        #     [
        #         {'id': 'id1', ...},
        #         {'id': 'id2', ...},
        #         {'id': 'id3', ...},
        #         ...
        #     ]
        #
        results = []
        if isinstance(orders, list):
            for i in range(0, len(orders)):
                order = self.extend(self.parse_order(orders[i], market), params)
                results.append(order)
        else:
            ids = list(orders.keys())
            for i in range(0, len(ids)):
                id = ids[i]
                order = self.extend(self.parse_order(self.extend({'id': id}, orders[id]), market), params)
                results.append(order)
        results = self.sort_by(results, 'timestamp')
        symbol = market['symbol'] if (market is not None) else None
        tail = since is None
        return self.filter_by_symbol_since_limit(results, symbol, since, limit, tail)

    def calculate_fee(self, symbol, type, side, amount, price, takerOrMaker='taker', params={}):
        if type == 'market' and takerOrMaker == 'maker':
            raise ArgumentsRequired(self.id + ' calculateFee() - you have provided incompatible arguments - "market" type order can not be "maker". Change either the "type" or the "takerOrMaker" argument to calculate the fee.')
        market = self.markets[symbol]
        feeSide = self.safe_string(market, 'feeSide', 'quote')
        key = 'quote'
        cost = None
        amountString = self.number_to_string(amount)
        priceString = self.number_to_string(price)
        if feeSide == 'quote':
            # the fee is always in quote currency
            cost = Precise.string_mul(amountString, priceString)
        elif feeSide == 'base':
            # the fee is always in base currency
            cost = amountString
        elif feeSide == 'get':
            # the fee is always in the currency you get
            cost = amountString
            if side == 'sell':
                cost = Precise.string_mul(cost, priceString)
            else:
                key = 'base'
        elif feeSide == 'give':
            # the fee is always in the currency you give
            cost = amountString
            if side == 'buy':
                cost = Precise.string_mul(cost, priceString)
            else:
                key = 'base'
        # for derivatives, the fee is in 'settle' currency
        if not market['spot']:
            key = 'settle'
        # even if `takerOrMaker` argument was set to 'maker', for 'market' orders we should forcefully override it to 'taker'
        if type == 'market':
            takerOrMaker = 'taker'
        rate = self.safe_string(market, takerOrMaker)
        if cost is not None:
            cost = Precise.string_mul(cost, rate)
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': self.parse_number(rate),
            'cost': self.parse_number(cost),
        }

    def safe_trade(self, trade, market=None):
        amount = self.safe_string(trade, 'amount')
        price = self.safe_string(trade, 'price')
        cost = self.safe_string(trade, 'cost')
        if cost is None:
            # contract trading
            contractSize = self.safe_string(market, 'contractSize')
            multiplyPrice = price
            if contractSize is not None:
                inverse = self.safe_value(market, 'inverse', False)
                if inverse:
                    multiplyPrice = Precise.string_div('1', price)
                multiplyPrice = Precise.string_mul(multiplyPrice, contractSize)
            cost = Precise.string_mul(multiplyPrice, amount)
        parseFee = self.safe_value(trade, 'fee') is None
        parseFees = self.safe_value(trade, 'fees') is None
        shouldParseFees = parseFee or parseFees
        fees = []
        if shouldParseFees:
            tradeFees = self.safe_value(trade, 'fees')
            if tradeFees is not None:
                for j in range(0, len(tradeFees)):
                    tradeFee = tradeFees[j]
                    fees.append(self.extend({}, tradeFee))
            else:
                tradeFee = self.safe_value(trade, 'fee')
                if tradeFee is not None:
                    fees.append(self.extend({}, tradeFee))
        fee = self.safe_value(trade, 'fee')
        if shouldParseFees:
            reducedFees = self.reduce_fees_by_currency(fees) if self.reduceFees else fees
            reducedLength = len(reducedFees)
            for i in range(0, reducedLength):
                reducedFees[i]['cost'] = self.safe_number(reducedFees[i], 'cost')
                if 'rate' in reducedFees[i]:
                    reducedFees[i]['rate'] = self.safe_number(reducedFees[i], 'rate')
            if not parseFee and (reducedLength == 0):
                fee['cost'] = self.safe_number(fee, 'cost')
                if 'rate' in fee:
                    fee['rate'] = self.safe_number(fee, 'rate')
                reducedFees.append(fee)
            if parseFees:
                trade['fees'] = reducedFees
            if parseFee and (reducedLength == 1):
                trade['fee'] = reducedFees[0]
            tradeFee = self.safe_value(trade, 'fee')
            if tradeFee is not None:
                tradeFee['cost'] = self.safe_number(tradeFee, 'cost')
                if 'rate' in tradeFee:
                    tradeFee['rate'] = self.safe_number(tradeFee, 'rate')
                trade['fee'] = tradeFee
        trade['amount'] = self.parse_number(amount)
        trade['price'] = self.parse_number(price)
        trade['cost'] = self.parse_number(cost)
        return trade

    def reduce_fees_by_currency(self, fees):
        #
        # self function takes a list of fee structures having the following format
        #
        #     string = True
        #
        #     [
        #         {'currency': 'BTC', 'cost': '0.1'},
        #         {'currency': 'BTC', 'cost': '0.2'  },
        #         {'currency': 'BTC', 'cost': '0.2', 'rate': '0.00123'},
        #         {'currency': 'BTC', 'cost': '0.4', 'rate': '0.00123'},
        #         {'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456'},
        #         {'currency': 'USDT', 'cost': '12.3456'},
        #     ]
        #
        #     string = False
        #
        #     [
        #         {'currency': 'BTC', 'cost': 0.1},
        #         {'currency': 'BTC', 'cost': 0.2},
        #         {'currency': 'BTC', 'cost': 0.2, 'rate': 0.00123},
        #         {'currency': 'BTC', 'cost': 0.4, 'rate': 0.00123},
        #         {'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456},
        #         {'currency': 'USDT', 'cost': 12.3456},
        #     ]
        #
        # and returns a reduced fee list, where fees are summed per currency and rate(if any)
        #
        #     string = True
        #
        #     [
        #         {'currency': 'BTC', 'cost': '0.3'  },
        #         {'currency': 'BTC', 'cost': '0.6', 'rate': '0.00123'},
        #         {'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456'},
        #         {'currency': 'USDT', 'cost': '12.3456'},
        #     ]
        #
        #     string  = False
        #
        #     [
        #         {'currency': 'BTC', 'cost': 0.3  },
        #         {'currency': 'BTC', 'cost': 0.6, 'rate': 0.00123},
        #         {'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456},
        #         {'currency': 'USDT', 'cost': 12.3456},
        #     ]
        #
        reduced = {}
        for i in range(0, len(fees)):
            fee = fees[i]
            feeCurrencyCode = self.safe_string(fee, 'currency')
            if feeCurrencyCode is not None:
                rate = self.safe_string(fee, 'rate')
                cost = self.safe_value(fee, 'cost')
                if Precise.string_eq(cost, '0'):
                    # omit zero cost fees
                    continue
                if not (feeCurrencyCode in reduced):
                    reduced[feeCurrencyCode] = {}
                rateKey = '' if (rate is None) else rate
                if rateKey in reduced[feeCurrencyCode]:
                    reduced[feeCurrencyCode][rateKey]['cost'] = Precise.string_add(reduced[feeCurrencyCode][rateKey]['cost'], cost)
                else:
                    reduced[feeCurrencyCode][rateKey] = {
                        'currency': feeCurrencyCode,
                        'cost': cost,
                    }
                    if rate is not None:
                        reduced[feeCurrencyCode][rateKey]['rate'] = rate
        result = []
        feeValues = list(reduced.values())
        for i in range(0, len(feeValues)):
            reducedFeeValues = list(feeValues[i].values())
            result = self.array_concat(result, reducedFeeValues)
        return result

    def safe_ticker(self, ticker, market=None):
        open = self.safe_value(ticker, 'open')
        close = self.safe_value(ticker, 'close')
        last = self.safe_value(ticker, 'last')
        change = self.safe_value(ticker, 'change')
        percentage = self.safe_value(ticker, 'percentage')
        average = self.safe_value(ticker, 'average')
        vwap = self.safe_value(ticker, 'vwap')
        baseVolume = self.safe_value(ticker, 'baseVolume')
        quoteVolume = self.safe_value(ticker, 'quoteVolume')
        if vwap is None:
            vwap = Precise.string_div(quoteVolume, baseVolume)
        if (last is not None) and (close is None):
            close = last
        elif (last is None) and (close is not None):
            last = close
        if (last is not None) and (open is not None):
            if change is None:
                change = Precise.string_sub(last, open)
            if average is None:
                average = Precise.string_div(Precise.string_add(last, open), '2')
        if (percentage is None) and (change is not None) and (open is not None) and Precise.string_gt(open, '0'):
            percentage = Precise.string_mul(Precise.string_div(change, open), '100')
        if (change is None) and (percentage is not None) and (open is not None):
            change = Precise.string_div(Precise.string_mul(percentage, open), '100')
        if (open is None) and (last is not None) and (change is not None):
            open = Precise.string_sub(last, change)
        # timestamp and symbol operations don't belong in safeTicker
        # they should be done in the derived classes
        return self.extend(ticker, {
            'bid': self.safe_number(ticker, 'bid'),
            'bidVolume': self.safe_number(ticker, 'bidVolume'),
            'ask': self.safe_number(ticker, 'ask'),
            'askVolume': self.safe_number(ticker, 'askVolume'),
            'high': self.safe_number(ticker, 'high'),
            'low': self.safe_number(ticker, 'low'),
            'open': self.parse_number(open),
            'close': self.parse_number(close),
            'last': self.parse_number(last),
            'change': self.parse_number(change),
            'percentage': self.parse_number(percentage),
            'average': self.parse_number(average),
            'vwap': self.parse_number(vwap),
            'baseVolume': self.parse_number(baseVolume),
            'quoteVolume': self.parse_number(quoteVolume),
            'previousClose': self.safe_number(ticker, 'previousClose'),
        })

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        if not self.has['fetchTrades']:
            raise NotSupported(self.id + ' fetchOHLCV() is not supported yet')
        self.load_markets()
        trades = self.fetchTrades(symbol, since, limit, params)
        ohlcvc = self.build_ohlcvc(trades, timeframe, since, limit)
        result = []
        for i in range(0, len(ohlcvc)):
            result.append([
                self.safe_integer(ohlcvc[i], 0),
                self.safe_number(ohlcvc[i], 1),
                self.safe_number(ohlcvc[i], 2),
                self.safe_number(ohlcvc[i], 3),
                self.safe_number(ohlcvc[i], 4),
                self.safe_number(ohlcvc[i], 5),
            ])
        return result

    def convert_trading_view_to_ohlcv(self, ohlcvs, timestamp='t', open='o', high='h', low='l', close='c', volume='v', ms=False):
        result = []
        timestamps = self.safe_value(ohlcvs, timestamp, [])
        opens = self.safe_value(ohlcvs, open, [])
        highs = self.safe_value(ohlcvs, high, [])
        lows = self.safe_value(ohlcvs, low, [])
        closes = self.safe_value(ohlcvs, close, [])
        volumes = self.safe_value(ohlcvs, volume, [])
        for i in range(0, len(timestamps)):
            result.append([
                self.safe_integer(timestamps, i) if ms else self.safe_timestamp(timestamps, i),
                self.safe_value(opens, i),
                self.safe_value(highs, i),
                self.safe_value(lows, i),
                self.safe_value(closes, i),
                self.safe_value(volumes, i),
            ])
        return result

    def convert_ohlcv_to_trading_view(self, ohlcvs, timestamp='t', open='o', high='h', low='l', close='c', volume='v', ms=False):
        result = {}
        result[timestamp] = []
        result[open] = []
        result[high] = []
        result[low] = []
        result[close] = []
        result[volume] = []
        for i in range(0, len(ohlcvs)):
            ts = ohlcvs[i][0] if ms else int(ohlcvs[i][0] / 1000)
            result[timestamp].append(ts)
            result[open].append(ohlcvs[i][1])
            result[high].append(ohlcvs[i][2])
            result[low].append(ohlcvs[i][3])
            result[close].append(ohlcvs[i][4])
            result[volume].append(ohlcvs[i][5])
        return result

    def market_ids(self, symbols):
        result = []
        for i in range(0, len(symbols)):
            result.append(self.market_id(symbols[i]))
        return result

    def market_symbols(self, symbols):
        if symbols is None:
            return symbols
        result = []
        for i in range(0, len(symbols)):
            result.append(self.symbol(symbols[i]))
        return result

    def market_codes(self, codes):
        if codes is None:
            return codes
        result = []
        for i in range(0, len(codes)):
            result.append(self.common_currency_code(codes[i]))
        return result

    def parse_bids_asks(self, bidasks, priceKey=0, amountKey=1):
        bidasks = self.to_array(bidasks)
        result = []
        for i in range(0, len(bidasks)):
            result.append(self.parse_bid_ask(bidasks[i], priceKey, amountKey))
        return result

    def fetch_l2_order_book(self, symbol, limit=None, params={}):
        orderbook = self.fetch_order_book(symbol, limit, params)
        return self.extend(orderbook, {
            'asks': self.sort_by(self.aggregate(orderbook['asks']), 0),
            'bids': self.sort_by(self.aggregate(orderbook['bids']), 0, True),
        })

    def filter_by_symbol(self, objects, symbol=None):
        if symbol is None:
            return objects
        result = []
        for i in range(0, len(objects)):
            objectSymbol = self.safe_string(objects[i], 'symbol')
            if objectSymbol == symbol:
                result.append(objects[i])
        return result

    def parse_ohlcv(self, ohlcv, market=None):
        if isinstance(ohlcv, list):
            return [
                self.safe_integer(ohlcv, 0),  # timestamp
                self.safe_number(ohlcv, 1),  # open
                self.safe_number(ohlcv, 2),  # high
                self.safe_number(ohlcv, 3),  # low
                self.safe_number(ohlcv, 4),  # close
                self.safe_number(ohlcv, 5),  # volume
            ]
        return ohlcv

    def get_network(self, network, code):
        network = network.upper()
        aliases = {
            'ETHEREUM': 'ETH',
            'ETHER': 'ETH',
            'ERC20': 'ETH',
            'ETH': 'ETH',
            'TRC20': 'TRX',
            'TRON': 'TRX',
            'TRX': 'TRX',
            'BEP20': 'BSC',
            'BSC': 'BSC',
            'HRC20': 'HT',
            'HECO': 'HT',
            'SPL': 'SOL',
            'SOL': 'SOL',
            'TERRA': 'LUNA',
            'LUNA': 'LUNA',
            'POLYGON': 'MATIC',
            'MATIC': 'MATIC',
            'EOS': 'EOS',
            'WAVES': 'WAVES',
            'AVALANCHE': 'AVAX',
            'AVAX': 'AVAX',
            'QTUM': 'QTUM',
            'CHZ': 'CHZ',
            'NEO': 'NEO',
            'ONT': 'ONT',
            'RON': 'RON',
        }
        if network == code:
            return network
        elif network in aliases:
            return aliases[network]
        else:
            raise NotSupported(self.id + ' network ' + network + ' is not yet supported')

    def network_code_to_id(self, networkCode, currencyCode=None):
        """
         * @ignore
        tries to convert the provided networkCode(which is expected to be an unified network code) to a network id. In order to achieve self, derived class needs to have 'options->networks' defined.
        :param str networkCode: unified network code
        :param str|None currencyCode: unified currency code, but self argument is not required by default, unless there is an exchange(like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
        :returns [str|None]: exchange-specific network id
        """
        networkIdsByCodes = self.safe_value(self.options, 'networks', {})
        return self.safe_string(networkIdsByCodes, networkCode, networkCode)

    def network_id_to_code(self, networkId, currencyCode=None):
        """
         * @ignore
        tries to convert the provided exchange-specific networkId to an unified network Code. In order to achieve self, derived class needs to have 'options->networksById' defined.
        :param str networkId: unified network code
        :param str|None currencyCode: unified currency code, but self argument is not required by default, unless there is an exchange(like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
        :returns [str|None]: unified network code
        """
        networkCodesByIds = self.safe_value(self.options, 'networksById', {})
        return self.safe_string(networkCodesByIds, networkId, networkId)

    def handle_network_code_and_params(self, params):
        networkCodeInParams = self.safe_string_2(params, 'networkCode', 'network')
        if networkCodeInParams is not None:
            params = self.omit(params, ['networkCode', 'network'])
        # if it was not defined by user, we should not set it from 'defaultNetworks', because handleNetworkCodeAndParams is for only request-side and thus we do not fill it with anything. We can only use 'defaultNetworks' after parsing response-side
        return [networkCodeInParams, params]

    def default_network_code(self, currencyCode):
        defaultNetworkCode = None
        defaultNetworks = self.safe_value(self.options, 'defaultNetworks', {})
        if currencyCode in defaultNetworks:
            # if currency had set its network in "defaultNetworks", use it
            defaultNetworkCode = defaultNetworks[currencyCode]
        else:
            # otherwise, try to use the global-scope 'defaultNetwork' value(even if that network is not supported by currency, it doesn't make any problem, self will be just used "at first" if currency supports self network at all)
            defaultNetwork = self.safe_value(self.options, 'defaultNetwork')
            if defaultNetwork is not None:
                defaultNetworkCode = defaultNetwork
        return defaultNetworkCode

    def select_network_id_from_available_networks(self, currencyCode, networkCode, networkEntriesIndexed):
        # self method is used against raw & unparse network entries, which are just indexed by network id
        chosenNetworkId = None
        availableNetworkIds = list(networkEntriesIndexed.keys())
        responseNetworksLength = len(availableNetworkIds)
        if networkCode is not None:
            # if networkCode was provided by user, we should check it after response, as the referenced exchange doesn't support network-code during request
            networkId = self.networkCodeToId(networkCode, currencyCode)
            if responseNetworksLength == 0:
                raise NotSupported(self.id + ' - ' + networkCode + ' network did not return any result for ' + currencyCode)
            else:
                if networkId in networkEntriesIndexed:
                    chosenNetworkId = networkId
                else:
                    raise NotSupported(self.id + ' - ' + networkId + ' network was not found for ' + currencyCode + ', use one of ' + ', '.join(availableNetworkIds))
        else:
            if responseNetworksLength == 0:
                raise NotSupported(self.id + ' - no networks were returned for' + currencyCode)
            else:
                # if networkCode was not provided by user, then we try to use the default network(if it was defined in "defaultNetworks"), otherwise, we just return the first network entry
                defaultNetworkCode = self.defaultNetworkCode(currencyCode)
                defaultNetworkId = self.networkCodeToId(defaultNetworkCode, currencyCode)
                chosenNetworkId = defaultNetworkId if (defaultNetworkId in networkEntriesIndexed) else availableNetworkIds[0]
        return chosenNetworkId

    def safe_number_2(self, dictionary, key1, key2, d=None):
        value = self.safe_string_2(dictionary, key1, key2)
        return self.parse_number(value, d)

    def parse_order_book(self, orderbook, symbol, timestamp=None, bidsKey='bids', asksKey='asks', priceKey=0, amountKey=1):
        bids = self.parse_bids_asks(self.safe_value(orderbook, bidsKey, []), priceKey, amountKey)
        asks = self.parse_bids_asks(self.safe_value(orderbook, asksKey, []), priceKey, amountKey)
        return {
            'symbol': symbol,
            'bids': self.sort_by(bids, 0, True),
            'asks': self.sort_by(asks, 0),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'nonce': None,
        }

    def parse_ohlcvs(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        results = []
        for i in range(0, len(ohlcvs)):
            results.append(self.parse_ohlcv(ohlcvs[i], market))
        sorted = self.sort_by(results, 0)
        tail = (since is None)
        return self.filter_by_since_limit(sorted, since, limit, 0, tail)

    def parse_leverage_tiers(self, response, symbols=None, marketIdKey=None):
        # marketIdKey should only be None when response is a dictionary
        symbols = self.market_symbols(symbols)
        tiers = {}
        for i in range(0, len(response)):
            item = response[i]
            id = self.safe_string(item, marketIdKey)
            market = self.safe_market(id)
            symbol = market['symbol']
            contract = self.safe_value(market, 'contract', False)
            if contract and ((symbols is None) or self.in_array(symbol, symbols)):
                tiers[symbol] = self.parse_market_leverage_tiers(item, market)
        return tiers

    def load_trading_limits(self, symbols=None, reload=False, params={}):
        if self.has['fetchTradingLimits']:
            if reload or not ('limitsLoaded' in self.options):
                response = self.fetch_trading_limits(symbols)
                for i in range(0, len(symbols)):
                    symbol = symbols[i]
                    self.markets[symbol] = self.deep_extend(self.markets[symbol], response[symbol])
                self.options['limitsLoaded'] = self.milliseconds()
        return self.markets

    def parse_positions(self, positions, symbols=None, params={}):
        symbols = self.market_symbols(symbols)
        positions = self.to_array(positions)
        result = []
        for i in range(0, len(positions)):
            position = self.extend(self.parse_position(positions[i], None), params)
            result.append(position)
        return self.filter_by_array(result, 'symbol', symbols, False)

    def parse_accounts(self, accounts, params={}):
        accounts = self.to_array(accounts)
        result = []
        for i in range(0, len(accounts)):
            account = self.extend(self.parse_account(accounts[i]), params)
            result.append(account)
        return result

    def parse_trades(self, trades, market=None, since=None, limit=None, params={}):
        trades = self.to_array(trades)
        result = []
        for i in range(0, len(trades)):
            trade = self.extend(self.parse_trade(trades[i], market), params)
            result.append(trade)
        result = self.sort_by_2(result, 'timestamp', 'id')
        symbol = market['symbol'] if (market is not None) else None
        tail = (since is None)
        return self.filter_by_symbol_since_limit(result, symbol, since, limit, tail)

    def parse_transactions(self, transactions, currency=None, since=None, limit=None, params={}):
        transactions = self.to_array(transactions)
        result = []
        for i in range(0, len(transactions)):
            transaction = self.extend(self.parse_transaction(transactions[i], currency), params)
            result.append(transaction)
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        tail = (since is None)
        return self.filter_by_currency_since_limit(result, code, since, limit, tail)

    def parse_transfers(self, transfers, currency=None, since=None, limit=None, params={}):
        transfers = self.to_array(transfers)
        result = []
        for i in range(0, len(transfers)):
            transfer = self.extend(self.parse_transfer(transfers[i], currency), params)
            result.append(transfer)
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        tail = (since is None)
        return self.filter_by_currency_since_limit(result, code, since, limit, tail)

    def parse_ledger(self, data, currency=None, since=None, limit=None, params={}):
        result = []
        arrayData = self.to_array(data)
        for i in range(0, len(arrayData)):
            itemOrItems = self.parse_ledger_entry(arrayData[i], currency)
            if isinstance(itemOrItems, list):
                for j in range(0, len(itemOrItems)):
                    result.append(self.extend(itemOrItems[j], params))
            else:
                result.append(self.extend(itemOrItems, params))
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        tail = (since is None)
        return self.filter_by_currency_since_limit(result, code, since, limit, tail)

    def nonce(self):
        return self.seconds()

    def set_headers(self, headers):
        return headers

    def market_id(self, symbol):
        market = self.market(symbol)
        if market is not None:
            return market['id']
        return symbol

    def symbol(self, symbol):
        market = self.market(symbol)
        return self.safe_string(market, 'symbol', symbol)

    def resolve_path(self, path, params):
        return [
            self.implode_params(path, params),
            self.omit(params, self.extract_params(path)),
        ]

    def filter_by_array(self, objects, key, values=None, indexed=True):
        objects = self.to_array(objects)
        # return all of them if no values were passed
        if values is None or not values:
            return self.index_by(objects, key) if indexed else objects
        results = []
        for i in range(0, len(objects)):
            if self.in_array(objects[i][key], values):
                results.append(objects[i])
        return self.index_by(results, key) if indexed else results

    def fetch2(self, path, api='public', method='GET', params={}, headers=None, body=None, config={}, context={}):
        if self.enableRateLimit:
            cost = self.calculate_rate_limiter_cost(api, method, path, params, config, context)
            self.throttle(cost)
        self.lastRestRequestTimestamp = self.milliseconds()
        request = self.sign(path, api, method, params, headers, body)
        return self.fetch(request['url'], request['method'], request['headers'], request['body'])

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None, config={}, context={}):
        return self.fetch2(path, api, method, params, headers, body, config, context)

    def load_accounts(self, reload=False, params={}):
        if reload:
            self.accounts = self.fetch_accounts(params)
        else:
            if self.accounts:
                return self.accounts
            else:
                self.accounts = self.fetch_accounts(params)
        self.accountsById = self.index_by(self.accounts, 'id')
        return self.accounts

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchTrades() is not supported yet')

    def fetch_ohlcvc(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        if not self.has['fetchTrades']:
            raise NotSupported(self.id + ' fetchOHLCV() is not supported yet')
        self.load_markets()
        trades = self.fetchTrades(symbol, since, limit, params)
        return self.build_ohlcvc(trades, timeframe, since, limit)

    def parse_trading_view_ohlcv(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        result = self.convert_trading_view_to_ohlcv(ohlcvs)
        return self.parse_ohlcvs(result, market, timeframe, since, limit)

    def edit_limit_buy_order(self, id, symbol, amount, price=None, params={}):
        return self.edit_limit_order(id, symbol, 'buy', amount, price, params)

    def edit_limit_sell_order(self, id, symbol, amount, price=None, params={}):
        return self.edit_limit_order(id, symbol, 'sell', amount, price, params)

    def edit_limit_order(self, id, symbol, side, amount, price=None, params={}):
        return self.edit_order(id, symbol, 'limit', side, amount, price, params)

    def edit_order(self, id, symbol, type, side, amount, price=None, params={}):
        self.cancelOrder(id, symbol)
        return self.create_order(symbol, type, side, amount, price, params)

    def fetch_permissions(self, params={}):
        raise NotSupported(self.id + ' fetchPermissions() is not supported yet')

    def fetch_position(self, symbol, params={}):
        raise NotSupported(self.id + ' fetchPosition() is not supported yet')

    def fetch_positions(self, symbols=None, params={}):
        raise NotSupported(self.id + ' fetchPositions() is not supported yet')

    def fetch_positions_risk(self, symbols=None, params={}):
        raise NotSupported(self.id + ' fetchPositionsRisk() is not supported yet')

    def fetch_bids_asks(self, symbols=None, params={}):
        raise NotSupported(self.id + ' fetchBidsAsks() is not supported yet')

    def parse_bid_ask(self, bidask, priceKey=0, amountKey=1):
        price = self.safe_number(bidask, priceKey)
        amount = self.safe_number(bidask, amountKey)
        return [price, amount]

    def safe_currency(self, currencyId, currency=None):
        if (currencyId is None) and (currency is not None):
            return currency
        if (self.currencies_by_id is not None) and (currencyId in self.currencies_by_id) and (self.currencies_by_id[currencyId] is not None):
            return self.currencies_by_id[currencyId]
        code = currencyId
        if currencyId is not None:
            code = self.common_currency_code(currencyId.upper())
        return {
            'id': currencyId,
            'code': code,
        }

    def safe_market(self, marketId=None, market=None, delimiter=None):
        result = {
            'id': marketId,
            'symbol': marketId,
            'base': None,
            'quote': None,
            'baseId': None,
            'quoteId': None,
            'active': None,
            'type': None,
            'linear': None,
            'inverse': None,
            'spot': False,
            'swap': False,
            'future': False,
            'option': False,
            'margin': False,
            'contract': False,
            'contractSize': None,
            'expiry': None,
            'expiryDatetime': None,
            'optionType': None,
            'strike': None,
            'settle': None,
            'settleId': None,
            'precision': {
                'amount': None,
                'price': None,
            },
            'limits': {
                'amount': {
                    'min': None,
                    'max': None,
                },
                'price': {
                    'min': None,
                    'max': None,
                },
                'cost': {
                    'min': None,
                    'max': None,
                },
            },
            'info': None,
        }
        if marketId is not None:
            if (self.markets_by_id is not None) and (marketId in self.markets_by_id):
                market = self.markets_by_id[marketId]
            elif delimiter is not None:
                parts = marketId.split(delimiter)
                partsLength = len(parts)
                if partsLength == 2:
                    result['baseId'] = self.safe_string(parts, 0)
                    result['quoteId'] = self.safe_string(parts, 1)
                    result['base'] = self.safe_currency_code(result['baseId'])
                    result['quote'] = self.safe_currency_code(result['quoteId'])
                    result['symbol'] = result['base'] + '/' + result['quote']
                    return result
                else:
                    return result
        if market is not None:
            return market
        return result

    def check_required_credentials(self, error=True):
        keys = list(self.requiredCredentials.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            if self.requiredCredentials[key] and not getattr(self, key):
                if error:
                    raise AuthenticationError(self.id + ' requires "' + key + '" credential')
                else:
                    return False
        return True

    def oath(self):
        if self.twofa is not None:
            return self.totp(self.twofa)
        else:
            raise ExchangeError(self.id + ' exchange.twofa has not been set for 2FA Two-Factor Authentication')

    def fetch_balance(self, params={}):
        raise NotSupported(self.id + ' fetchBalance() is not supported yet')

    def fetch_partial_balance(self, part, params={}):
        balance = self.fetch_balance(params)
        return balance[part]

    def fetch_free_balance(self, params={}):
        return self.fetch_partial_balance('free', params)

    def fetch_used_balance(self, params={}):
        return self.fetch_partial_balance('used', params)

    def fetch_total_balance(self, params={}):
        return self.fetch_partial_balance('total', params)

    def fetch_status(self, params={}):
        if self.has['fetchTime']:
            time = self.fetchTime(params)
            self.status = self.extend(self.status, {
                'updated': time,
            })
        return self.status

    def fetch_funding_fee(self, code, params={}):
        warnOnFetchFundingFee = self.safe_value(self.options, 'warnOnFetchFundingFee', True)
        if warnOnFetchFundingFee:
            raise NotSupported(self.id + ' fetchFundingFee() method is deprecated, it will be removed in July 2022, please, use fetchTransactionFee() or set exchange.options["warnOnFetchFundingFee"] = False to suppress self warning')
        return self.fetch_transaction_fee(code, params)

    def fetch_funding_fees(self, codes=None, params={}):
        warnOnFetchFundingFees = self.safe_value(self.options, 'warnOnFetchFundingFees', True)
        if warnOnFetchFundingFees:
            raise NotSupported(self.id + ' fetchFundingFees() method is deprecated, it will be removed in July 2022. Please, use fetchTransactionFees() or set exchange.options["warnOnFetchFundingFees"] = False to suppress self warning')
        return self.fetch_transaction_fees(codes, params)

    def fetch_transaction_fee(self, code, params={}):
        if not self.has['fetchTransactionFees']:
            raise NotSupported(self.id + ' fetchTransactionFee() is not supported yet')
        return self.fetch_transaction_fees([code], params)

    def fetch_transaction_fees(self, codes=None, params={}):
        raise NotSupported(self.id + ' fetchTransactionFees() is not supported yet')

    def fetch_deposit_withdraw_fee(self, code, params={}):
        if not self.has['fetchDepositWithdrawFees']:
            raise NotSupported(self.id + ' fetchDepositWithdrawFee() is not supported yet')
        fees = self.fetchDepositWithdrawFees([code], params)
        return self.safe_value(fees, code)

    def get_supported_mapping(self, key, mapping={}):
        if key in mapping:
            return mapping[key]
        else:
            raise NotSupported(self.id + ' ' + key + ' does not have a value in mapping')

    def fetch_borrow_rate(self, code, params={}):
        self.load_markets()
        if not self.has['fetchBorrowRates']:
            raise NotSupported(self.id + ' fetchBorrowRate() is not supported yet')
        borrowRates = self.fetch_borrow_rates(params)
        rate = self.safe_value(borrowRates, code)
        if rate is None:
            raise ExchangeError(self.id + ' fetchBorrowRate() could not find the borrow rate for currency code ' + code)
        return rate

    def handle_option_and_params(self, params, methodName, optionName, defaultValue=None):
        # This method can be used to obtain method specific properties, i.e: self.handleOptionAndParams(params, 'fetchPosition', 'marginMode', 'isolated')
        defaultOptionName = 'default' + self.capitalize(optionName)  # we also need to check the 'defaultXyzWhatever'
        # check if params contain the key
        value = self.safe_string_2(params, optionName, defaultOptionName)
        if value is not None:
            params = self.omit(params, [optionName, defaultOptionName])
        if value is None:
            # check if exchange-wide method options contain the key
            exchangeWideMethodOptions = self.safe_value(self.options, methodName)
            if exchangeWideMethodOptions is not None:
                value = self.safe_string_2(exchangeWideMethodOptions, optionName, defaultOptionName)
        if value is None:
            # check if exchange-wide options contain the key
            value = self.safe_string_2(self.options, optionName, defaultOptionName)
        value = value if (value is not None) else defaultValue
        return [value, params]

    def handle_market_type_and_params(self, methodName, market=None, params={}):
        defaultType = self.safe_string_2(self.options, 'defaultType', 'type', 'spot')
        methodOptions = self.safe_value(self.options, methodName)
        methodType = defaultType
        if methodOptions is not None:
            if isinstance(methodOptions, str):
                methodType = methodOptions
            else:
                methodType = self.safe_string_2(methodOptions, 'defaultType', 'type', methodType)
        marketType = methodType if (market is None) else market['type']
        type = self.safe_string_2(params, 'defaultType', 'type', marketType)
        params = self.omit(params, ['defaultType', 'type'])
        return [type, params]

    def handle_sub_type_and_params(self, methodName, market=None, params={}, defaultValue='linear'):
        subType = None
        # if set in params, it takes precedence
        subTypeInParams = self.safe_string_2(params, 'subType', 'defaultSubType')
        # avoid omitting if it's not present
        if subTypeInParams is not None:
            subType = subTypeInParams
            params = self.omit(params, ['subType', 'defaultSubType'])
        else:
            # at first, check from market object
            if market is not None:
                if market['linear']:
                    subType = 'linear'
                elif market['inverse']:
                    subType = 'inverse'
            # if it was not defined in market object
            if subType is None:
                values = self.handleOptionAndParams(None, methodName, 'subType', defaultValue)  # no need to re-test params here
                subType = values[0]
        return [subType, params]

    def handle_margin_mode_and_params(self, methodName, params={}, defaultValue=None):
        """
         * @ignore
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns [str|None, dict]: the marginMode in lowercase as specified by params["marginMode"], params["defaultMarginMode"] self.options["marginMode"] or self.options["defaultMarginMode"]
        """
        return self.handleOptionAndParams(params, methodName, 'marginMode', defaultValue)

    def throw_exactly_matched_exception(self, exact, string, message):
        if string in exact:
            raise exact[string](message)

    def throw_broadly_matched_exception(self, broad, string, message):
        broadKey = self.find_broadly_matched_key(broad, string)
        if broadKey is not None:
            raise broad[broadKey](message)

    def find_broadly_matched_key(self, broad, string):
        # a helper for matching error strings exactly vs broadly
        keys = list(broad.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            if string is not None:  # #issues/12698
                if string.find(key) >= 0:
                    return key
        return None

    def handle_errors(self, statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody):
        # it is a stub method that must be overrided in the derived exchange classes
        # raise NotSupported(self.id + ' handleErrors() not implemented yet')
        pass

    def calculate_rate_limiter_cost(self, api, method, path, params, config={}, context={}):
        return self.safe_value(config, 'cost', 1)

    def fetch_ticker(self, symbol, params={}):
        if self.has['fetchTickers']:
            tickers = self.fetch_tickers([symbol], params)
            ticker = self.safe_value(tickers, symbol)
            if ticker is None:
                raise NullResponse(self.id + ' fetchTickers() could not find a ticker for ' + symbol)
            else:
                return ticker
        else:
            raise NotSupported(self.id + ' fetchTicker() is not supported yet')

    def fetch_tickers(self, symbols=None, params={}):
        raise NotSupported(self.id + ' fetchTickers() is not supported yet')

    def fetch_order(self, id, symbol=None, params={}):
        raise NotSupported(self.id + ' fetchOrder() is not supported yet')

    def fetch_order_status(self, id, symbol=None, params={}):
        order = self.fetch_order(id, symbol, params)
        return order['status']

    def fetch_unified_order(self, order, params={}):
        return self.fetch_order(self.safe_value(order, 'id'), self.safe_value(order, 'symbol'), params)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        raise NotSupported(self.id + ' createOrder() is not supported yet')

    def cancel_order(self, id, symbol=None, params={}):
        raise NotSupported(self.id + ' cancelOrder() is not supported yet')

    def cancel_unified_order(self, order, params={}):
        return self.cancelOrder(self.safe_value(order, 'id'), self.safe_value(order, 'symbol'), params)

    def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchOrders() is not supported yet')

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchOpenOrders() is not supported yet')

    def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchClosedOrders() is not supported yet')

    def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchMyTrades() is not supported yet')

    def fetch_transactions(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchTransactions() is not supported yet')

    def fetch_deposits(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchDeposits() is not supported yet')

    def fetch_withdrawals(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchWithdrawals() is not supported yet')

    def fetch_deposit_address(self, code, params={}):
        if self.has['fetchDepositAddresses']:
            depositAddresses = self.fetchDepositAddresses([code], params)
            depositAddress = self.safe_value(depositAddresses, code)
            if depositAddress is None:
                raise InvalidAddress(self.id + ' fetchDepositAddress() could not find a deposit address for ' + code + ', make sure you have created a corresponding deposit address in your wallet on the exchange website')
            else:
                return depositAddress
        else:
            raise NotSupported(self.id + ' fetchDepositAddress() is not supported yet')

    def account(self):
        return {
            'free': None,
            'used': None,
            'total': None,
        }

    def common_currency_code(self, currency):
        if not self.substituteCommonCurrencyCodes:
            return currency
        return self.safe_string(self.commonCurrencies, currency, currency)

    def currency(self, code):
        if self.currencies is None:
            raise ExchangeError(self.id + ' currencies not loaded')
        if isinstance(code, str):
            if code in self.currencies:
                return self.currencies[code]
            elif code in self.currencies_by_id:
                return self.currencies_by_id[code]
        raise ExchangeError(self.id + ' does not have currency code ' + code)

    def market(self, symbol):
        if self.markets is None:
            raise ExchangeError(self.id + ' markets not loaded')
        if self.markets_by_id is None:
            raise ExchangeError(self.id + ' markets not loaded')
        if isinstance(symbol, str):
            if symbol in self.markets:
                return self.markets[symbol]
            elif symbol in self.markets_by_id:
                return self.markets_by_id[symbol]
        raise BadSymbol(self.id + ' does not have market symbol ' + symbol)

    def handle_withdraw_tag_and_params(self, tag, params):
        if isinstance(tag, dict):
            params = self.extend(tag, params)
            tag = None
        if tag is None:
            tag = self.safe_string(params, 'tag')
            if tag is not None:
                params = self.omit(params, 'tag')
        return [tag, params]

    def create_limit_order(self, symbol, side, amount, price, params={}):
        return self.create_order(symbol, 'limit', side, amount, price, params)

    def create_market_order(self, symbol, side, amount, price=None, params={}):
        return self.create_order(symbol, 'market', side, amount, price, params)

    def create_limit_buy_order(self, symbol, amount, price, params={}):
        return self.create_order(symbol, 'limit', 'buy', amount, price, params)

    def create_limit_sell_order(self, symbol, amount, price, params={}):
        return self.create_order(symbol, 'limit', 'sell', amount, price, params)

    def create_market_buy_order(self, symbol, amount, params={}):
        return self.create_order(symbol, 'market', 'buy', amount, None, params)

    def create_market_sell_order(self, symbol, amount, params={}):
        return self.create_order(symbol, 'market', 'sell', amount, None, params)

    def cost_to_precision(self, symbol, cost):
        market = self.market(symbol)
        return self.decimal_to_precision(cost, TRUNCATE, market['precision']['price'], self.precisionMode, self.paddingMode)

    def price_to_precision(self, symbol, price):
        market = self.market(symbol)
        return self.decimal_to_precision(price, ROUND, market['precision']['price'], self.precisionMode, self.paddingMode)

    def amount_to_precision(self, symbol, amount):
        market = self.market(symbol)
        return self.decimal_to_precision(amount, TRUNCATE, market['precision']['amount'], self.precisionMode, self.paddingMode)

    def fee_to_precision(self, symbol, fee):
        market = self.market(symbol)
        return self.decimal_to_precision(fee, ROUND, market['precision']['price'], self.precisionMode, self.paddingMode)

    def currency_to_precision(self, code, fee, networkCode=None):
        currency = self.currencies[code]
        precision = self.safe_value(currency, 'precision')
        if networkCode is not None:
            networks = self.safe_value(currency, 'networks', {})
            networkItem = self.safe_value(networks, networkCode, {})
            precision = self.safe_value(networkItem, 'precision', precision)
        if precision is None:
            return fee
        else:
            return self.decimal_to_precision(fee, ROUND, precision, self.precisionMode, self.paddingMode)

    def safe_number(self, object, key, d=None):
        value = self.safe_string(object, key)
        return self.parse_number(value, d)

    def safe_number_n(self, object, arr, d=None):
        value = self.safe_string_n(object, arr)
        return self.parse_number(value, d)

    def parse_precision(self, precision):
        if precision is None:
            return None
        return '1e' + Precise.string_neg(precision)

    def load_time_difference(self, params={}):
        serverTime = self.fetchTime(params)
        after = self.milliseconds()
        self.options['timeDifference'] = after - serverTime
        return self.options['timeDifference']

    def implode_hostname(self, url):
        return self.implode_params(url, {'hostname': self.hostname})

    def fetch_market_leverage_tiers(self, symbol, params={}):
        if self.has['fetchLeverageTiers']:
            market = self.market(symbol)
            if not market['contract']:
                raise BadSymbol(self.id + ' fetchMarketLeverageTiers() supports contract markets only')
            tiers = self.fetch_leverage_tiers([symbol])
            return self.safe_value(tiers, symbol)
        else:
            raise NotSupported(self.id + ' fetchMarketLeverageTiers() is not supported yet')

    def create_post_only_order(self, symbol, type, side, amount, price, params={}):
        if not self.has['createPostOnlyOrder']:
            raise NotSupported(self.id + 'createPostOnlyOrder() is not supported yet')
        query = self.extend(params, {'postOnly': True})
        return self.create_order(symbol, type, side, amount, price, query)

    def create_reduce_only_order(self, symbol, type, side, amount, price, params={}):
        if not self.has['createReduceOnlyOrder']:
            raise NotSupported(self.id + 'createReduceOnlyOrder() is not supported yet')
        query = self.extend(params, {'reduceOnly': True})
        return self.create_order(symbol, type, side, amount, price, query)

    def create_stop_order(self, symbol, type, side, amount, price=None, stopPrice=None, params={}):
        if not self.has['createStopOrder']:
            raise NotSupported(self.id + ' createStopOrder() is not supported yet')
        if stopPrice is None:
            raise ArgumentsRequired(self.id + ' create_stop_order() requires a stopPrice argument')
        query = self.extend(params, {'stopPrice': stopPrice})
        return self.create_order(symbol, type, side, amount, price, query)

    def create_stop_limit_order(self, symbol, side, amount, price, stopPrice, params={}):
        if not self.has['createStopLimitOrder']:
            raise NotSupported(self.id + ' createStopLimitOrder() is not supported yet')
        query = self.extend(params, {'stopPrice': stopPrice})
        return self.create_order(symbol, 'limit', side, amount, price, query)

    def create_stop_market_order(self, symbol, side, amount, stopPrice, params={}):
        if not self.has['createStopMarketOrder']:
            raise NotSupported(self.id + ' createStopMarketOrder() is not supported yet')
        query = self.extend(params, {'stopPrice': stopPrice})
        return self.create_order(symbol, 'market', side, amount, None, query)

    def safe_currency_code(self, currencyId, currency=None):
        currency = self.safe_currency(currencyId, currency)
        return currency['code']

    def filter_by_symbol_since_limit(self, array, symbol=None, since=None, limit=None, tail=False):
        return self.filter_by_value_since_limit(array, 'symbol', symbol, since, limit, 'timestamp', tail)

    def filter_by_currency_since_limit(self, array, code=None, since=None, limit=None, tail=False):
        return self.filter_by_value_since_limit(array, 'currency', code, since, limit, 'timestamp', tail)

    def parse_tickers(self, tickers, symbols=None, params={}):
        #
        # the value of tickers is either a dict or a list
        #
        # dict
        #
        #     {
        #         'marketId1': {...},
        #         'marketId2': {...},
        #         'marketId3': {...},
        #         ...
        #     }
        #
        # list
        #
        #     [
        #         {'market': 'marketId1', ...},
        #         {'market': 'marketId2', ...},
        #         {'market': 'marketId3', ...},
        #         ...
        #     ]
        #
        results = []
        if isinstance(tickers, list):
            for i in range(0, len(tickers)):
                ticker = self.extend(self.parse_ticker(tickers[i]), params)
                results.append(ticker)
        else:
            marketIds = list(tickers.keys())
            for i in range(0, len(marketIds)):
                marketId = marketIds[i]
                market = self.safe_market(marketId)
                ticker = self.extend(self.parse_ticker(tickers[marketId], market), params)
                results.append(ticker)
        symbols = self.market_symbols(symbols)
        return self.filter_by_array(results, 'symbol', symbols)

    def parse_deposit_addresses(self, addresses, codes=None, indexed=True, params={}):
        result = []
        for i in range(0, len(addresses)):
            address = self.extend(self.parse_deposit_address(addresses[i]), params)
            result.append(address)
        if codes is not None:
            result = self.filter_by_array(result, 'currency', codes, False)
        result = self.index_by(result, 'currency') if indexed else result
        return result

    def parse_borrow_interests(self, response, market=None):
        interests = []
        for i in range(0, len(response)):
            row = response[i]
            interests.append(self.parse_borrow_interest(row, market))
        return interests

    def parse_funding_rate_histories(self, response, market=None, since=None, limit=None):
        rates = []
        for i in range(0, len(response)):
            entry = response[i]
            rates.append(self.parse_funding_rate_history(entry, market))
        sorted = self.sort_by(rates, 'timestamp')
        symbol = None if (market is None) else market['symbol']
        return self.filter_by_symbol_since_limit(sorted, symbol, since, limit)

    def safe_symbol(self, marketId, market=None, delimiter=None):
        market = self.safe_market(marketId, market, delimiter)
        return market['symbol']

    def parse_funding_rate(self, contract, market=None):
        raise NotSupported(self.id + ' parseFundingRate() is not supported yet')

    def parse_funding_rates(self, response, market=None):
        result = {}
        for i in range(0, len(response)):
            parsed = self.parse_funding_rate(response[i], market)
            result[parsed['symbol']] = parsed
        return result

    def is_trigger_order(self, params):
        isTrigger = self.safe_value_2(params, 'trigger', 'stop')
        if isTrigger:
            params = self.omit(params, ['trigger', 'stop'])
        return [isTrigger, params]

    def is_post_only(self, isMarketOrder, exchangeSpecificParam, params={}):
        """
         * @ignore
        :param str type: Order type
        :param boolean exchangeSpecificParam: exchange specific postOnly
        :param dict params: exchange specific params
        :returns boolean: True if a post only order, False otherwise
        """
        timeInForce = self.safe_string_upper(params, 'timeInForce')
        postOnly = self.safe_value_2(params, 'postOnly', 'post_only', False)
        # we assume timeInForce is uppercase from safeStringUpper(params, 'timeInForce')
        ioc = timeInForce == 'IOC'
        fok = timeInForce == 'FOK'
        timeInForcePostOnly = timeInForce == 'PO'
        postOnly = postOnly or timeInForcePostOnly or exchangeSpecificParam
        if postOnly:
            if ioc or fok:
                raise InvalidOrder(self.id + ' postOnly orders cannot have timeInForce equal to ' + timeInForce)
            elif isMarketOrder:
                raise InvalidOrder(self.id + ' market orders cannot be postOnly')
            else:
                return True
        else:
            return False

    def fetch_trading_fees(self, params={}):
        raise NotSupported(self.id + ' fetchTradingFees() is not supported yet')

    def fetch_trading_fee(self, symbol, params={}):
        if not self.has['fetchTradingFees']:
            raise NotSupported(self.id + ' fetchTradingFee() is not supported yet')
        return self.fetch_trading_fees(params)

    def parse_open_interest(self, interest, market=None):
        raise NotSupported(self.id + ' parseOpenInterest() is not supported yet')

    def parse_open_interests(self, response, market=None, since=None, limit=None):
        interests = []
        for i in range(0, len(response)):
            entry = response[i]
            interest = self.parse_open_interest(entry, market)
            interests.append(interest)
        sorted = self.sort_by(interests, 'timestamp')
        symbol = self.safe_string(market, 'symbol')
        return self.filter_by_symbol_since_limit(sorted, symbol, since, limit)

    def fetch_funding_rate(self, symbol, params={}):
        if self.has['fetchFundingRates']:
            self.load_markets()
            market = self.market(symbol)
            if not market['contract']:
                raise BadSymbol(self.id + ' fetchFundingRate() supports contract markets only')
            rates = self.fetchFundingRates([symbol], params)
            rate = self.safe_value(rates, symbol)
            if rate is None:
                raise NullResponse(self.id + ' fetchFundingRate() returned no data for ' + symbol)
            else:
                return rate
        else:
            raise NotSupported(self.id + ' fetchFundingRate() is not supported yet')

    def fetch_mark_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        """
        fetches historical mark price candlestick data containing the open, high, low, and close price of a market
        :param str symbol: unified symbol of the market to fetch OHLCV data for
        :param str timeframe: the length of time each candle represents
        :param int|None since: timestamp in ms of the earliest candle to fetch
        :param int|None limit: the maximum amount of candles to fetch
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns [[int|float]]: A list of candles ordered as timestamp, open, high, low, close, None
        """
        if self.has['fetchMarkOHLCV']:
            request = {
                'price': 'mark',
            }
            return self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchMarkOHLCV() is not supported yet')

    def fetch_index_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        """
        fetches historical index price candlestick data containing the open, high, low, and close price of a market
        :param str symbol: unified symbol of the market to fetch OHLCV data for
        :param str timeframe: the length of time each candle represents
        :param int|None since: timestamp in ms of the earliest candle to fetch
        :param int|None limit: the maximum amount of candles to fetch
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns [[int|float]]: A list of candles ordered as timestamp, open, high, low, close, None
        """
        if self.has['fetchIndexOHLCV']:
            request = {
                'price': 'index',
            }
            return self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchIndexOHLCV() is not supported yet')

    def fetch_premium_index_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        """
        fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
        :param str symbol: unified symbol of the market to fetch OHLCV data for
        :param str timeframe: the length of time each candle represents
        :param int|None since: timestamp in ms of the earliest candle to fetch
        :param int|None limit: the maximum amount of candles to fetch
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns [[int|float]]: A list of candles ordered as timestamp, open, high, low, close, None
        """
        if self.has['fetchPremiumIndexOHLCV']:
            request = {
                'price': 'premiumIndex',
            }
            return self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchPremiumIndexOHLCV() is not supported yet')

    def handle_time_in_force(self, params={}):
        """
         * @ignore
         * * Must add timeInForce to self.options to use self method
        :return string returns: the exchange specific value for timeInForce
        """
        timeInForce = self.safe_string_upper(params, 'timeInForce')  # supported values GTC, IOC, PO
        if timeInForce is not None:
            exchangeValue = self.safe_string(self.options['timeInForce'], timeInForce)
            if exchangeValue is None:
                raise ExchangeError(self.id + ' does not support timeInForce "' + timeInForce + '"')
            return exchangeValue
        return None

    def convert_type_to_account(self, account):
        """
         * @ignore
         * * Must add accountsByType to self.options to use self method
        :param str account: key for account name in self.options['accountsByType']
        :returns: the exchange specific account name or the isolated margin id for transfers
        """
        accountsByType = self.safe_value(self.options, 'accountsByType', {})
        lowercaseAccount = account.lower()
        if lowercaseAccount in accountsByType:
            return accountsByType[lowercaseAccount]
        elif (account in self.markets) or (account in self.markets_by_id):
            market = self.market(account)
            return market['id']
        else:
            return account

    def check_required_argument(self, methodName, argument, argumentName, options=[]):
        """
         * @ignore
        :param str argument: the argument to check
        :param str argumentName: the name of the argument to check
        :param str methodName: the name of the method that the argument is being checked for
        :param [str] options: a list of options that the argument can be
        :returns None:
        """
        if (argument is None) or ((len(options) > 0) and (not(self.in_array(argument, options)))):
            messageOptions = ', '.join(options)
            message = self.id + ' ' + methodName + '() requires a ' + argumentName + ' argument'
            if messageOptions != '':
                message += ', one of ' + '(' + messageOptions + ')'
            raise ArgumentsRequired(message)

    def check_required_margin_argument(self, methodName, symbol, marginMode):
        """
         * @ignore
        :param str symbol: unified symbol of the market
        :param str methodName: name of the method that requires a symbol
        :param str marginMode: is either 'isolated' or 'cross'
        """
        if (marginMode == 'isolated') and (symbol is None):
            raise ArgumentsRequired(self.id + ' ' + methodName + '() requires a symbol argument for isolated margin')
        elif (marginMode == 'cross') and (symbol is not None):
            raise ArgumentsRequired(self.id + ' ' + methodName + '() cannot have a symbol argument for cross margin')

    def check_required_symbol(self, methodName, symbol):
        """
         * @ignore
        :param str symbol: unified symbol of the market
        :param str methodName: name of the method that requires a symbol
        """
        self.checkRequiredArgument(methodName, symbol, 'symbol')

    def parse_deposit_withdraw_fees(self, response, codes=None, currencyIdKey=None):
        """
         * @ignore
        :param [object]|dict response: unparsed response from the exchange
        :param [str]|None codes: the unified currency codes to fetch transactions fees for, returns all currencies when None
        :param str|None currencyIdKey: *should only be None when response is a dictionary* the object key that corresponds to the currency id
        :returns dict: objects with withdraw and deposit fees, indexed by currency codes
        """
        depositWithdrawFees = {}
        codes = self.marketCodes(codes)
        isArray = isinstance(response, list)
        responseKeys = response
        if not isArray:
            responseKeys = list(response.keys())
        for i in range(0, len(responseKeys)):
            entry = responseKeys[i]
            dictionary = entry if isArray else response[entry]
            currencyId = self.safe_string(dictionary, currencyIdKey) if isArray else entry
            currency = self.safe_value(self.currencies_by_id, currencyId)
            code = self.safe_string(currency, 'code', currencyId)
            if (codes is None) or (self.in_array(code, codes)):
                depositWithdrawFees[code] = self.parseDepositWithdrawFee(dictionary, currency)
        return depositWithdrawFees

    def deposit_withdraw_fee(self, info):
        return {
            'info': info,
            'withdraw': {
                'fee': None,
                'percentage': None,
            },
            'deposit': {
                'fee': None,
                'percentage': None,
            },
            'networks': {},
        }
