# -*- coding: utf-8 -*-

"""Base exchange class"""

# -----------------------------------------------------------------------------

__version__ = '4.0.106.26'

# -----------------------------------------------------------------------------
import random
from typing import Optional, List

from ccxt.base.errors import ExchangeError, InvalidOrder, NullResponse
from ccxt.base.errors import NetworkError
from ccxt.base.errors import NotSupported
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import DDoSProtection
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import InvalidAddress
from ccxt.base.errors import ArgumentsRequired
from ccxt.base.errors import BadSymbol
from ccxt.base.errors import RateLimitExceeded

# -----------------------------------------------------------------------------

from ccxt.base.decimal_to_precision import decimal_to_precision
from ccxt.base.decimal_to_precision import DECIMAL_PLACES, TRUNCATE, ROUND, ROUND_UP, ROUND_DOWN
from ccxt.base.decimal_to_precision import number_to_string
from ccxt.base.precise import Precise

# -----------------------------------------------------------------------------

# rsa jwt signing
from cryptography.hazmat import backends
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_private_key

from ccxt.base.types import IndexType
# -----------------------------------------------------------------------------

# ecdsa signing
from ccxt.static_dependencies import ecdsa
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

# Python 2 & 3
import types
import logging
import base64
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
from numbers import Number
import re
from requests import Session
from requests.utils import default_user_agent
from requests.exceptions import HTTPError, Timeout, TooManyRedirects, RequestException
# import socket
from ssl import SSLError
# import sys
import time
import uuid
import zlib
from decimal import Decimal
from time import mktime
from wsgiref.handlers import format_date_time

# -----------------------------------------------------------------------------

try:
    basestring  # basestring was removed in Python 3
except NameError:
    basestring = str

try:
    long  # long integer was removed in Python 3
except NameError:
    long = int

# -----------------------------------------------------------------------------

try:
    import urllib.parse as _urlencode    # Python 3
except ImportError:
    import urllib as _urlencode          # Python 2

# -----------------------------------------------------------------------------
# web3/0x imports

try:
    from web3 import Web3, HTTPProvider
except ImportError:
    Web3 = HTTPProvider = None  # web3/0x not supported in Python 2

# -----------------------------------------------------------------------------

from http.cookiejar import DefaultCookiePolicy
from collections import defaultdict

def get_session():
    session = Session()
    session.cookies.set_policy(DefaultCookiePolicy(allowed_domains=[]))
    return session
GLOBAL_SESSION = defaultdict(get_session)

class Exchange(object):
    """Base exchange class"""
    id = None
    name = None
    version = None
    certified = False
    pro = False

    # rate limiter settings
    enableRateLimit = False
    rateLimit = 2000  # milliseconds = seconds * 1000
    timeout = 10000   # milliseconds = seconds * 1000
    asyncio_loop = None
    aiohttp_proxy = None
    aiohttp_trust_env = False
    session = None  # Session () by default
    verify = True  # SSL verification
    logger = None  # logging.getLogger(__name__) by default
    userAgent = None
    userAgents = {
        'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'chrome39': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
    }
    verbose = False
    markets = None
    symbols = None
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
    partner_private_key = ''
    partner_api_key = ''
    partner_name = ''
    broker_id = ''
    walletAddress = ''  # the wallet address "0x"-prefixed hexstring
    token = ''  # reserved for HTTP auth in some cases
    twofa = None
    marketsById = None
    markets_by_id = None
    currencies_by_id = None
    precision = None
    exceptions = None
    limits = {
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
        'loadMarkets': True,
        'cancelAllOrders': False,
        'cancelOrder': True,
        'cancelOrders': False,
        'CORS': False,
        'createDepositAddress': False,
        'createLimitOrder': True,
        'createMarketOrder': True,
        'createOrder': True,
        'deposit': False,
        'editOrder': 'emulated',
        'fetchBalance': True,
        'fetchClosedOrders': False,
        'fetchCurrencies': False,
        'fetchDepositAddress': False,
        'fetchDeposits': False,
        'fetchL2OrderBook': True,
        'fetchLedger': False,
        'fetchMarkets': True,
        'fetchMyTrades': False,
        'fetchOHLCV': 'emulated',
        'fetchOpenOrders': False,
        'fetchOrder': False,
        'fetchOrderBook': True,
        'fetchOrderBooks': False,
        'fetchOrders': False,
        'fetchOrderTrades': False,
        'fetchStatus': 'emulated',
        'fetchTicker': True,
        'fetchTickers': False,
        'fetchTime': False,
        'fetchTrades': True,
        'fetchTradingFee': False,
        'fetchTradingFees': False,
        'fetchFundingFee': False,
        'fetchFundingFees': False,
        'fetchTradingLimits': False,
        'fetchTransactions': False,
        'fetchWithdrawals': False,
        'privateAPI': True,
        'publicAPI': True,
        'signIn': False,
        'withdraw': False,
    }
    precisionMode = DECIMAL_PLACES
    number = float  # or str (a pointer to a class)
    minFundingAddressLength = 1  # used in check_address
    substituteCommonCurrencyCodes = True
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

    requiresWeb3 = False
    requiresEddsa = False
    web3 = None
    base58_encoder = None
    base58_decoder = None
    # no lower case l or upper case I, O
    base58_alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

    commonCurrencies = {
        'XBT': 'BTC',
        'BCC': 'BCH',
        'DRK': 'DASH',
        'BCHABC': 'BCH',
        'BCHSV': 'BSV'
    }
    supportedReversedCurrencies = {}

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
        self.ohlcvs = dict() if self.ohlcvs is None else self.ohlcvs
        self.currencies = dict() if self.currencies is None else self.currencies
        self.options = dict() if self.options is None else self.options  # Python does not allow to define properties in run-time with setattr
        self.accounts_by_type = dict()
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

        self.session = self.session if self.session or self.asyncio_loop else None
        self.logger = self.logger if self.logger else logging.getLogger(__name__)

        if self.requiresWeb3 and Web3 and not self.web3:
            self.web3 = Web3(HTTPProvider())

        self.reversed_commonCurrencies = {v: k for k, v in self.commonCurrencies.items()
                                          if v in self.supportedReversedCurrencies}

    def __del__(self):
        if self.session:
            self.session.close()

    def __repr__(self):
        return 'ccxt.' + ('async_support.' if self.asyncio_loop else '') + self.id + '()'

    def __str__(self):
        return self.name

    def describe(self):
        return {}

    def set_sandbox_mode(self, enabled):
        if enabled:
            if 'test' in self.urls:
                self.urls['api_backup'] = self.urls['api']
                self.urls['api'] = self.urls['test']
            else:
                raise NotSupported(self.id + ' does not have a sandbox URL')
        elif 'api_backup' in self.urls:
            self.urls['api'] = self.urls['api_backup']
            del self.urls['api_backup']

    @classmethod
    def define_rest_api(cls, api, method_name, paths=[]):
        delimiters = re.compile('[^a-zA-Z0-9]')
        entry = getattr(cls, method_name)  # returns a function (instead of a bound method)
        for key, value in api.items():
            if isinstance(value, list):
                uppercase_method = key.upper()
                lowercase_method = key.lower()
                camelcase_method = lowercase_method.capitalize()
                for path in value:
                    path = path.strip()
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
                        outer_kwargs = {'path': path, 'api': api_argument, 'method': uppercase_method}

                        @functools.wraps(entry)
                        def inner(_self, params=None):
                            """
                            Inner is called when a generated method (publicGetX) is called.
                            _self is a reference to self created by function.__get__(exchange, type(exchange))
                            https://en.wikipedia.org/wiki/Closure_(computer_programming) equivalent to functools.partial
                            """
                            inner_kwargs = dict(outer_kwargs)  # avoid mutation
                            if params is not None:
                                inner_kwargs['params'] = params
                            return entry(_self, **inner_kwargs)
                        return inner
                    to_bind = partialer()
                    setattr(cls, camelcase, to_bind)
                    setattr(cls, underscore, to_bind)
            else:
                cls.define_rest_api(value, method_name, paths + [key])

    def throttle(self):
        now = float(self.milliseconds())
        elapsed = now - self.lastRestRequestTimestamp
        if elapsed < self.rateLimit:
            delay = self.rateLimit - elapsed
            time.sleep(delay / 1000.0)

    def fetch2(self, path, api='public', method='GET', params={}, headers=None, body=None):
        """A better wrapper over request for deferred signing"""
        if self.enableRateLimit:
            self.throttle()
        self.lastRestRequestTimestamp = self.milliseconds()
        request = self.sign(path, api, method, params, headers, body)
        return self.fetch(request['url'], request['method'], request['headers'], request['body'])

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        """Exchange.request is the entry point for all generated methods"""
        return self.fetch2(path, api, method, params, headers, body)

    @staticmethod
    def gzip_deflate(response, text):
        encoding = response.info().get('Content-Encoding')
        if encoding in ('gzip', 'x-gzip', 'deflate'):
            if encoding == 'deflate':
                return zlib.decompress(text, -zlib.MAX_WBITS)
            else:
                return gzip.GzipFile('', 'rb', 9, io.BytesIO(text)).read()
        return text

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

    def handle_sub_type_and_params(self, methodName, market=None, params={}, defaultValue=None):
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
                if self.is_linear():
                    subType = 'linear'
                elif self.is_inverse():
                    subType = 'inverse'
            # if it was not defined in market object
            if subType is None:
                values = self.handle_option_and_params(None, methodName, 'subType', defaultValue)  # no need to re-test params here
                subType = values[0]
        return [subType, params]

    def throw_exactly_matched_exception(self, exact, string, message):
        if string in exact:
            raise exact[string](message)

    def throw_broadly_matched_exception(self, broad, string, message):
        broad_key = self.find_broadly_matched_key(broad, string)
        if broad_key is not None:
            raise broad[broad_key](message)

    def find_broadly_matched_key(self, broad, string):
        """A helper method for matching error strings exactly vs broadly"""
        keys = list(broad.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            if string and string.find(key) >= 0:
                return key
        return None

    def find_market(self, string):
        if not self.markets:
            raise ExchangeError('Markets not loaded')
        if isinstance(string, basestring):
            if string in self.markets_by_id:
                return self.markets_by_id[string]
            if string in self.markets:
                return self.markets[string]
        return string

    def find_symbol(self, string, market=None):
        if market is None:
            market = self.find_market(string)
        if isinstance(market, dict):
            return market['symbol']
        return string

    def handle_errors(self, code, reason, url, method, headers, body, response, request_headers, request_body):
        pass

    def prepare_request_headers(self, headers=None):
        headers = headers or {}
        headers.update(self.headers)
        if self.userAgent:
            if type(self.userAgent) is str:
                headers.update({'User-Agent': self.userAgent})
            elif (type(self.userAgent) is dict) and ('User-Agent' in self.userAgent):
                headers.update(self.userAgent)
        if self.proxy:
            headers.update({'Origin': self.origin})
        headers.update({'Accept-Encoding': 'gzip, deflate'})
        return headers

    def print(self, *args):
        print(*args)

    def fetch(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""
        request_headers = self.prepare_request_headers(headers)
        url = self.proxy + url

        if self.verbose:
            self.print("\nRequest:", method, url, request_headers, body)
        self.logger.debug("%s %s, Request: %s %s", method, url, request_headers, body)

        request_body = body
        if body:
            body = body.encode()

        proxy_key = self.proxies.get('https', '') if self.proxies else ''
        session = GLOBAL_SESSION[proxy_key]
        session.cookies.clear()

        http_response = None
        http_status_code = None
        http_status_text = None
        json_response = None
        try:
            response = session.request(
                method,
                url,
                data=body,
                headers=request_headers,
                timeout=int(self.timeout / 1000),
                proxies=self.proxies,
                verify=self.verify
            )
            # does not try to detect encoding
            response.encoding = 'utf-8'
            http_response = response.text
            http_status_code = response.status_code
            http_status_text = response.reason
            json_response = self.parse_json(http_response)
            headers = response.headers
            # FIXME remove last_x_responses from subclasses
            if self.enableLastHttpResponse:
                self.last_http_response = http_response
            if self.enableLastJsonResponse:
                self.last_json_response = json_response
            if self.enableLastResponseHeaders:
                self.last_response_headers = headers
            if self.verbose:
                self.print("\nResponse:", method, url, http_status_code, headers, http_response)
            self.logger.debug("%s %s, Response: %s %s %s", method, url, http_status_code, headers, http_response)
            response.raise_for_status()

        except Timeout as e:
            raise RequestTimeout(method + ' ' + url)

        except TooManyRedirects as e:
            raise ExchangeError(method + ' ' + url)

        except SSLError as e:
            raise ExchangeError(method + ' ' + url)

        except HTTPError as e:
            self.handle_errors(http_status_code, http_status_text, url, method, headers, http_response, json_response, request_headers, request_body)
            self.handle_rest_errors(http_status_code, http_status_text, http_response, url, method)
            raise ExchangeError(method + ' ' + url)

        except RequestException as e:  # base exception class
            error_string = str(e)
            if ('ECONNRESET' in error_string) or ('Connection aborted.' in error_string):
                raise NetworkError(method + ' ' + url + ' ' + error_string)
            else:
                raise ExchangeError(method + ' ' + url + ' ' + error_string)

        self.handle_errors(http_status_code, http_status_text, url, method, headers, http_response, json_response, request_headers, request_body)
        self.handle_rest_response(http_response, json_response, url, method)
        if json_response is not None:
            return json_response
        if self.is_text_response(headers):
            return http_response
        return response.content

    def handle_rest_errors(self, http_status_code, http_status_text, body, url, method):
        error = None
        string_code = str(http_status_code)
        if string_code in self.httpExceptions:
            error = self.httpExceptions[string_code]
            if error == ExchangeNotAvailable:
                if re.search('(cloudflare|incapsula|overload|ddos)', body, flags=re.IGNORECASE):
                    error = DDoSProtection
        if error:
            raise error(' '.join([method, url, string_code, http_status_text, body]))

    def handle_rest_response(self, response, json_response, url, method):
        if self.is_json_encoded_object(response) and json_response is None:
            ddos_protection = re.search('(cloudflare|incapsula|overload|ddos)', response, flags=re.IGNORECASE)
            exchange_not_available = re.search('(offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing)', response, flags=re.IGNORECASE)
            if ddos_protection:
                raise DDoSProtection(' '.join([method, url, response]))
            if exchange_not_available:
                message = response + ' exchange downtime, exchange closed for maintenance or offline, DDoS protection or rate-limiting in effect'
                raise ExchangeNotAvailable(' '.join([method, url, response, message]))
            raise ExchangeError(' '.join([method, url, response]))

    def parse_json(self, http_response):
        try:
            if Exchange.is_json_encoded_object(http_response):
                return json.loads(http_response)
        except ValueError:  # superclass of JsonDecodeError (python2)
            pass

    def is_text_response(self, headers):
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
            return dictionary[key] is not None
        return False

    def safe_position(self, position):
        # simplified version of: /pull/12765/
        unrealizedPnlString = self.safe_string(position, 'unrealisedPnl')
        initialMarginString = self.safe_string(position, 'initialMargin')
        #
        # PERCENTAGE
        #
        percentage = self.safe_value(position, 'percentage')
        if (percentage is None) and (unrealizedPnlString is not None) and (initialMarginString is not None):
            # was done in all implementations( aax, btcex, bybit, deribit, ftx, gate, kucoinfutures, phemex )
            percentageString = Precise.string_mul(Precise.string_div(unrealizedPnlString, initialMarginString, 4), '100')
            position['percentage'] = self.parse_number(percentageString)
        return position

    def parse_positions(self, positions, symbols: Optional[List[str]] = None, params={}):
        symbols = self.market_symbols(symbols)
        positions = self.to_array(positions)
        result = []
        for i in range(0, len(positions)):
            position = self.extend(self.parse_position(positions[i], None), params)
            result.append(position)
        return self.filter_by_array_positions(result, 'symbol', symbols, False)

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

    def safe_currency(self, currencyId, currency=None):
        if (currencyId is None) and (currency is not None):
            return currency
        if (self.currencies_by_id is not None) and (currencyId in self.currencies_by_id):
            return self.currencies_by_id[currencyId]
        code = currencyId
        if currencyId is not None:
            code = self.common_currency_code(currencyId.upper())
        return {
            'id': currencyId,
            'code': code,
        }

    @staticmethod
    def safe_value_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        return value if value is not None else default_value

    @staticmethod
    def safe_string_lower_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        return str(value).lower() if value is not None else default_value

    @staticmethod
    def safe_string_upper_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        return str(value).upper() if value is not None else default_value

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
    def safe_float(dictionary, key, default_value=None):
        value = default_value
        try:
            if Exchange.key_exists(dictionary, key):
                value = float(dictionary[key])
        except ValueError as e:
            value = default_value
        return value

    @staticmethod
    def validate_float(_str):
        if _str is None:
            return
        try:
            return float(_str)
        except ValueError:
            return

    @staticmethod
    def is_int_format(_float):
        if type(_float) is int:
            return _float
        return int(_float) if _float.is_integer() else _float

    @staticmethod
    def convert_to_real_value(value):
        import ast
        if type(value) not in {str, bytes}:
            return value
        try:
            return ast.literal_eval(value)
        except (ValueError, SyntaxError):
            return value

    @staticmethod
    def safe_string(dictionary, key, default_value=None):
        return str(dictionary[key]) if Exchange.key_exists(dictionary, key) else default_value

    @staticmethod
    def safe_string_lower(dictionary, key, default_value=None):
        return str(dictionary[key]).lower() if Exchange.key_exists(dictionary, key) else default_value

    @staticmethod
    def safe_string_upper(dictionary, key, default_value=None):
        return str(dictionary[key]).upper() if Exchange.key_exists(dictionary, key) else default_value

    @staticmethod
    def safe_integer(dictionary, key, default_value=None):
        if not Exchange.key_exists(dictionary, key):
            return default_value
        value = dictionary[key]
        if isinstance(value, Number) or (isinstance(value, basestring) and value.isnumeric()):
            return int(value)
        return default_value

    @staticmethod
    def safe_integer_product(dictionary, key, factor, default_value=None):
        if not Exchange.key_exists(dictionary, key):
            return default_value
        value = dictionary[key]
        if isinstance(value, Number):
            return int(value * factor)
        elif isinstance(value, basestring):
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

    def implode_hostname(self, url):
        return Exchange.implode_params(url, {'hostname': self.hostname})

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
        if not isinstance(timestamp, (int, long)):
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
        h = hashlib.new(algorithm, request)
        if digest == 'hex':
            return h.hexdigest()
        elif digest == 'base64':
            return base64.b64encode(h.digest())
        return h.digest()

    @staticmethod
    def hmac(request, secret, algorithm=hashlib.sha256, digest='hex'):
        h = hmac.new(secret, request, algorithm)
        if digest == 'hex':
            return h.hexdigest()
        elif digest == 'base64':
            return base64.b64encode(h.digest())
        return h.digest()

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
    def unjson(input):
        return json.loads(input)

    @staticmethod
    def json(data, params=None):
        return json.dumps(data, separators=(',', ':'))

    @staticmethod
    def is_json_encoded_object(input):
        return (isinstance(input, basestring) and
                (len(input) >= 2) and
                ((input[0] == '{') or (input[0] == '[')))

    @staticmethod
    def encode(string):
        return string.encode()

    @staticmethod
    def decode(string):
        return string.decode()

    @staticmethod
    def to_array(value):
        return list(value.values()) if type(value) is dict else value

    def nonce(self):
        return Exchange.seconds()

    def safe_market(self, marketId=None, market=None, delimiter=None, marketType=None):
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
        for key in keys:
            if self.requiredCredentials[key] and not getattr(self, key):
                if error:
                    raise AuthenticationError('requires `' + key + '`')
                else:
                    return error
        return True

    def check_address(self, address):
        """Checks an address is not the same character repeated or an empty sequence"""
        if address is None:
            raise InvalidAddress('address is None')
        if all(letter == address[0] for letter in address) or len(address) < self.minFundingAddressLength or ' ' in address:
            raise InvalidAddress('address is invalid or has less than ' + str(self.minFundingAddressLength) + ' characters: "' + str(address) + '"')
        return address

    def account(self):
        return {
            'free': None,
            'used': None,
            'total': None,
        }

    def get_api_account_details(self):
        raise NotSupported('get_api_account_details() is not supported yet')

    def extract_trading_permissions(self, permission_mapping, response=None, permissions_list=None):
        assert response or permissions_list

        permissions = list()
        for trading_permission, required_permissions in permission_mapping.items():
            has_permissions = True
            for required_permission in required_permissions:
                if response:
                    value = self.safe_value(response, required_permission)
                    if value:
                        if isinstance(required_permissions, dict):
                            expected_value = required_permissions[required_permission]
                            if expected_value and isinstance(expected_value, list):
                                has_permissions &= set(value) == set(expected_value)
                            elif expected_value:
                                has_permissions &= value == expected_value
                    else:
                        has_permissions = False
                if permissions_list and required_permission not in permissions_list:
                    has_permissions = False
            if has_permissions:
                permissions.append(trading_permission)
        return permissions

    def common_currency_code(self, currency):
        if not self.substituteCommonCurrencyCodes:
            return currency
        return self.safe_string(self.commonCurrencies, currency, currency)

    def currency_id(self, commonCode):

        if self.currencies:
            if commonCode in self.currencies:
                return self.currencies[commonCode]['id']

        currencyIds = {v: k for k, v in self.commonCurrencies.items()}
        return self.safe_string(currencyIds, commonCode, commonCode)

    def precision_from_string(self, string):
        parts = re.sub(r'0+$', '', string).split('.')
        return len(parts[1]) if len(parts) > 1 else 0

    def cost_to_precision(self, symbol, cost):
        return self.decimal_to_precision(cost, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode)

    def price_to_precision(self, symbol, price):
        return self.decimal_to_precision(price, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode)

    def amount_to_precision(self, symbol, amount):
        return self.decimal_to_precision(amount, TRUNCATE, self.markets[symbol]['precision']['amount'], self.precisionMode)

    def fee_to_precision(self, symbol, fee):
        return self.decimal_to_precision(fee, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode)

    def currency_to_precision(self, currency, fee):
        return self.decimal_to_precision(fee, ROUND, self.currencies[currency]['precision'], self.precisionMode)

    def float_to_str(self, number, num_digits=8, should_strip_zeros=False):
        if isinstance(number, (int, float)):
            num_digits = int(num_digits)
            number = float(number)
            if number >= 1:
                return ('{0:#.%sf}' % num_digits).format(number).rstrip('0').rstrip('.')
            else:
                number_str = ('{0:#.%sf}' % num_digits).format(number)
                if should_strip_zeros:
                    return number_str.rstrip('0').rstrip('.')
                else:
                    return number_str.rstrip('.')
        return number

    def str_float_params(self, all_params, to_float_params):
        return {k: self.float_to_str(v, num_digits=16) if k in to_float_params else v for k, v in all_params.items()}

    def convert_amount_into_digit_precision(self, amount):
        if 0 < amount < 1:
            precision = len(self.float_to_str(amount, num_digits=16).rstrip("0").split(".")[1])
        elif amount >= 1:
            precision = 0
        else:
            raise NotImplemented
        return precision

    def convert_amount_into_tick_size_precision(self, amount):
        digit_precision = self.convert_amount_into_digit_precision(amount)
        return 1 / (10 ** digit_precision)

    def set_markets(self, markets, currencies=None):
        values = list(markets.values()) if type(markets) is dict else markets
        for i in range(0, len(values)):
            values[i] = self.extend(
                self.fees['trading'],
                {'precision': self.precision, 'limits': self.limits},
                values[i]
            )
        self.markets = self.index_by(values, 'symbol')
        self.markets_by_id = self.index_by(values, 'id')
        self.marketsById = self.markets_by_id
        self.symbols = sorted(self.markets.keys())
        self.ids = sorted(self.markets_by_id.keys())
        if currencies:
            self.currencies = self.deep_extend(currencies, self.currencies)
        else:
            base_currencies = [{
                'id': market['baseId'] if (('baseId' in market) and (market['baseId'] is not None)) else market['base'],
                'numericId': market['baseNumericId'] if 'baseNumericId' in market else None,
                'code': market['base'],
                'precision': (
                    market['precision']['base'] if 'base' in market['precision'] else (
                        market['precision']['amount'] if 'amount' in market['precision'] else None
                    )
                ) if 'precision' in market else 8,
            } for market in values if 'base' in market]
            quote_currencies = [{
                'id': market['quoteId'] if (('quoteId' in market) and (market['quoteId'] is not None)) else market['quote'],
                'numericId': market['quoteNumericId'] if 'quoteNumericId' in market else None,
                'code': market['quote'],
                'precision': (
                    market['precision']['quote'] if 'quote' in market['precision'] else (
                        market['precision']['price'] if 'price' in market['precision'] else None
                    )
                ) if 'precision' in market else 8,
            } for market in values if 'quote' in market]
            base_currencies = self.sort_by(base_currencies, 'code')
            quote_currencies = self.sort_by(quote_currencies, 'code')
            self.base_currencies = self.index_by(base_currencies, 'code')
            self.quote_currencies = self.index_by(quote_currencies, 'code')
            currencies = self.sort_by(base_currencies + quote_currencies, 'code')
            self.currencies = self.deep_extend(self.index_by(currencies, 'code'), self.currencies)
        self.currencies_by_id = self.index_by(list(self.currencies.values()), 'id')
        return self.markets

    def load_markets(self, reload=False, params={}):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets(self.markets)
                return self.markets
        currencies = None
        if self.has['fetchCurrencies']:
            currencies = self.fetch_currencies()
        markets = self.fetch_markets(params)
        return self.set_markets(markets, currencies)

    def load_accounts(self, reload=False, params={}):
        if reload:
            self.accounts = self.fetch_accounts(params)
        else:
            if self.accounts:
                return self.accounts
            else:
                self.accounts = self.fetch_accounts(params)
        self.accountsById = self.index_by(self.accounts, 'id')
        self.accounts_by_type = self.index_by(self.accounts, 'type')
        return self.accounts

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

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        raise NotSupported('create_order() not supported yet')

    def cancel_order(self, id, symbol=None, params={}):
        raise NotSupported('cancel_order() not supported yet')

    def cancel_unified_order(self, order, params={}):
        return self.cancel_order(self.safe_value(order, 'id'), self.safe_value(order, 'symbol'), params)

    def fetch_bids_asks(self, symbols=None, params={}):
        raise NotSupported('API does not allow to fetch all prices at once with a single call to fetch_bids_asks() for now')

    def fetch_ticker(self, symbol, params={}):
        raise NotSupported('fetch_ticker() not supported yet')

    def fetch_tickers(self, symbols=None, params={}):
        raise NotSupported('API does not allow to fetch all tickers at once with a single call to fetch_tickers() for now')

    def fetch_order_status(self, id, symbol=None, params={}):
        order = self.fetch_order(id, symbol, params)
        return order['status']

    def purge_cached_orders(self, before):
        orders = self.to_array(self.orders)
        orders = [order for order in orders if (order['status'] == 'open') or (order['timestamp'] >= before)]
        self.orders = self.index_by(orders, 'id')
        return self.orders

    def fetch_order(self, id, symbol=None, params={}):
        raise NotSupported('fetch_order() is not supported yet')

    def fetch_unified_order(self, order, params={}):
        return self.fetch_order(self.safe_value(order, 'id'), self.safe_value(order, 'symbol'), params)

    def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_orders() is not supported yet')

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_open_orders() is not supported yet')

    def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_closed_orders() is not supported yet')

    def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_my_trades() is not supported yet')

    def fetch_order_trades(self, id, symbol=None, params={}):
        raise NotSupported('fetch_order_trades() is not supported yet')

    def fetch_transactions(self, code=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_transactions() is not supported yet')

    def filter_by_array_positions(self, objects, key: IndexType, values=None, indexed=True):
        """
         * @ignore
        Typed wrapper for filterByArray that returns a list of positions
        """
        return self.filter_by_array(objects, key, values, indexed)

    def fetch_deposits(self, code=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_deposits() is not supported yet')

    def fetch_withdrawals(self, code=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_withdrawals() is not supported yet')

    def fetch_deposit_address(self, code=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_deposit_address() is not supported yet')

    def fetch_accounts(self, params={}):
        raise NotSupported(self.id + ' fetchAccounts() is not supported yet')

    def parse_position(self, position, market=None):
        raise NotSupported(self.id + ' parsePosition() is not supported yet')

    def parse_ohlcv(self, ohlcv, market=None):
        return ohlcv[0:6] if isinstance(ohlcv, list) else ohlcv

    def parse_ohlcvs(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        ohlcvs = self.to_array(ohlcvs)
        num_ohlcvs = len(ohlcvs)
        result = []
        i = 0
        while i < num_ohlcvs:
            if limit and (len(result) >= limit):
                break
            ohlcv = self.parse_ohlcv(ohlcvs[i], market)
            i = i + 1
            if since and (ohlcv[0] < since):
                continue
            result.append(ohlcv)
        return self.sort_by(result, 0)

    def network_code_to_id(self, networkCode, currencyCode=None):
        """
         * @ignore
        tries to convert the provided networkCode(which is expected to be an unified network code) to a network id. In order to achieve self, derived class needs to have 'options->networks' defined.
        :param str networkCode: unified network code
        :param str currencyCode: unified currency code, but self argument is not required by default, unless there is an exchange(like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
        :returns str|None: exchange-specific network id
        """
        networkIdsByCodes = self.safe_value(self.options, 'networks', {})
        networkId = self.safe_string(networkIdsByCodes, networkCode)
        # for example, if 'ETH' is passed for networkCode, but 'ETH' key not defined in `options->networks` object
        if networkId is None:
            if currencyCode is None:
                # if currencyCode was not provided, then we just set passed value to networkId
                networkId = networkCode
            else:
                # if currencyCode was provided, then we try to find if that currencyCode has a replacement(i.e. ERC20 for ETH)
                defaultNetworkCodeReplacements = self.safe_value(self.options, 'defaultNetworkCodeReplacements', {})
                if currencyCode in defaultNetworkCodeReplacements:
                    # if there is a replacement for the passed networkCode, then we use it to find network-id in `options->networks` object
                    replacementObject = defaultNetworkCodeReplacements[currencyCode]  # i.e. {'ERC20': 'ETH'}
                    keys = list(replacementObject.keys())
                    for i in range(0, len(keys)):
                        key = keys[i]
                        value = replacementObject[key]
                        # if value matches to provided unified networkCode, then we use it's key to find network-id in `options->networks` object
                        if value == networkCode:
                            networkId = self.safe_string(networkIdsByCodes, key)
                            break
                # if it wasn't found, we just set the provided value to network-id
                if networkId is None:
                    networkId = networkCode
        return networkId

    def network_id_to_code(self, networkId, currencyCode=None):
        """
         * @ignore
        tries to convert the provided exchange-specific networkId to an unified network Code. In order to achieve self, derived class needs to have "options['networksById']" defined.
        :param str networkId: exchange specific network id/title, like: TRON, Trc-20, usdt-erc20, etc
        :param str|None currencyCode: unified currency code, but self argument is not required by default, unless there is an exchange(like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
        :returns str|None: unified network code
        """
        networkCodesByIds = self.safe_value(self.options, 'networksById', {})
        networkCode = self.safe_string(networkCodesByIds, networkId, networkId)
        # replace mainnet network-codes(i.e. ERC20->ETH)
        if currencyCode is not None:
            defaultNetworkCodeReplacements = self.safe_value(self.options, 'defaultNetworkCodeReplacements', {})
            if currencyCode in defaultNetworkCodeReplacements:
                replacementObject = self.safe_value(defaultNetworkCodeReplacements, currencyCode, {})
                networkCode = self.safe_string(replacementObject, networkCode, networkCode)
        return networkCode

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

    def select_network_code_from_unified_networks(self, currencyCode, networkCode, indexedNetworkEntries):
        return self.select_network_key_from_networks(currencyCode, networkCode, indexedNetworkEntries, True)

    def select_network_id_from_raw_networks(self, currencyCode, networkCode, indexedNetworkEntries):
        return self.select_network_key_from_networks(currencyCode, networkCode, indexedNetworkEntries, False)

    def select_network_key_from_networks(self, currencyCode, networkCode, indexedNetworkEntries,
                                         isIndexedByUnifiedNetworkCode=False):
        # self method is used against raw & unparse network entries, which are just indexed by network id
        chosenNetworkId = None
        availableNetworkIds = list(indexedNetworkEntries.keys())
        responseNetworksLength = len(availableNetworkIds)
        if networkCode is not None:
            if responseNetworksLength == 0:
                raise NotSupported(
                    self.id + ' - ' + networkCode + ' network did not return any result for ' + currencyCode)
            else:
                # if networkCode was provided by user, we should check it after response, referenced exchange doesn't support network-code during request
                networkId = networkCode if isIndexedByUnifiedNetworkCode else self.network_code_to_id(networkCode,
                                                                                                      currencyCode)
                if networkId in indexedNetworkEntries:
                    chosenNetworkId = networkId
                else:
                    raise NotSupported(
                        self.id + ' - ' + networkId + ' network was not found for ' + currencyCode + ', use one of ' + ', '.join(
                            availableNetworkIds))
        else:
            if responseNetworksLength == 0:
                raise NotSupported(self.id + ' - no networks were returned for ' + currencyCode)
            else:
                # if networkCode was not provided by user, then we try to use the default network(if it was defined in "defaultNetworks"), otherwise, we just return the first network entry
                defaultNetworkCode = self.default_network_code(currencyCode)
                defaultNetworkId = defaultNetworkCode if isIndexedByUnifiedNetworkCode else self.network_code_to_id(
                    defaultNetworkCode, currencyCode)
                chosenNetworkId = defaultNetworkId if (defaultNetworkId in indexedNetworkEntries) else \
                availableNetworkIds[0]
        return chosenNetworkId

    def parse_bid_ask(self, bidask, price_key=0, amount_key=0):
        return [float(bidask[price_key]), float(bidask[amount_key])]

    def parse_bids_asks(self, bidasks, price_key=0, amount_key=1):
        result = []
        if len(bidasks):
            if type(bidasks[0]) is list:
                for bidask in bidasks:
                    if bidask[price_key] and bidask[amount_key]:
                        result.append(self.parse_bid_ask(bidask, price_key, amount_key))
            elif type(bidasks[0]) is dict:
                for bidask in bidasks:
                    if (price_key in bidask) and (amount_key in bidask) and (bidask[price_key] and bidask[amount_key]):
                        result.append(self.parse_bid_ask(bidask, price_key, amount_key))
            else:
                raise ExchangeError('unrecognized bidask format: ' + str(bidasks[0]))
        return result

    def fetch_l2_order_book(self, symbol, limit=None, params={}):
        orderbook = self.fetch_order_book(symbol, limit, params)
        return self.extend(orderbook, {
            'bids': self.sort_by(self.aggregate(orderbook['bids']), 0, True),
            'asks': self.sort_by(self.aggregate(orderbook['asks']), 0),
        })

    def parse_order_book(self, orderbook, timestamp=None, bids_key='bids', asks_key='asks', price_key=0, amount_key=1):
        return {
            'bids': self.sort_by(self.parse_bids_asks(orderbook[bids_key], price_key, amount_key) if (bids_key in orderbook) and isinstance(orderbook[bids_key], list) else [], 0, True),
            'asks': self.sort_by(self.parse_bids_asks(orderbook[asks_key], price_key, amount_key) if (asks_key in orderbook) and isinstance(orderbook[asks_key], list) else [], 0),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp) if timestamp is not None else None,
            'nonce': None,
        }

    def parse_balance(self, balance):
        currencies = self.omit(balance, ['info', 'free', 'used', 'total']).keys()
        balance['free'] = {}
        balance['used'] = {}
        balance['total'] = {}
        for currency in currencies:
            if balance[currency].get('total') is None:
                if balance[currency].get('free') is not None and balance[currency].get('used') is not None:
                    balance[currency]['total'] = self.sum(balance[currency].get('free'), balance[currency].get('used'))
            if balance[currency].get('free') is None:
                if balance[currency].get('total') is not None and balance[currency].get('used') is not None:
                    balance[currency]['free'] = self.sum(balance[currency]['total'], -balance[currency]['used'])
            if balance[currency].get('used') is None:
                if balance[currency].get('total') is not None and balance[currency].get('free') is not None:
                    balance[currency]['used'] = self.sum(balance[currency]['total'], -balance[currency]['free'])
            balance['free'][currency] = balance[currency]['free']
            balance['used'][currency] = balance[currency]['used']
            balance['total'][currency] = balance[currency]['total']
        return balance

    def fetch_partial_balance(self, part, params={}):
        balance = self.fetch_balance(params)
        if balance and balance.get('total'):
            return balance.get(part, {'total': 0., 'free': 0., 'used': 0.})
        return balance[part]

    def fetch_free_balance(self, params={}):
        return self.fetch_partial_balance('free', params)

    def fetch_used_balance(self, params={}):
        return self.fetch_partial_balance('used', params)

    def fetch_total_balance(self, params={}):
        return self.fetch_partial_balance('total', params)

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

    def handle_post_only(self, isMarketOrder: bool, exchangeSpecificPostOnlyOption: bool, params={}):
        """
         * @ignore
        :param str type: Order type
        :param boolean exchangeSpecificBoolean: exchange specific postOnly
        :param dict params: exchange specific params
        :returns [boolean, params]:
        """
        timeInForce = self.safe_string_upper(params, 'timeInForce')
        postOnly = self.safe_value(params, 'postOnly', False)
        ioc = timeInForce == 'IOC'
        fok = timeInForce == 'FOK'
        po = timeInForce == 'PO'
        postOnly = postOnly or po or exchangeSpecificPostOnlyOption
        if postOnly:
            if ioc or fok:
                raise InvalidOrder(self.id + ' postOnly orders cannot have timeInForce equal to ' + timeInForce)
            elif isMarketOrder:
                raise InvalidOrder(self.id + ' market orders cannot be postOnly')
            else:
                if po:
                    params = self.omit(params, 'timeInForce')
                params = self.omit(params, 'postOnly')
                return [True, params]
        return [False, params]

    def fetch_trading_fees(self, symbol, params={}):
        raise NotSupported('fetch_trading_fees() not supported yet')

    def fetch_trading_fee(self, symbol, params={}):
        if not self.has['fetchTradingFees']:
            raise NotSupported('fetch_trading_fee() not supported yet')
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

    def parse_borrow_interests(self, response, market=None):
        interests = []
        for i in range(0, len(response)):
            row = response[i]
            interests.append(self.parse_borrow_interest(row, market))
        return interests

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

    def check_required_argument(self, methodName, argument, argumentName, options=[]):
        """
         * @ignore
        :param str methodName: the name of the method that the argument is being checked for
        :param str argument: the argument's actual value provided
        :param str argumentName: the name of the argument being checked(for logging purposes)
        :param str[] options: a list of options that the argument can be
        :returns None:
        """
        optionsLength = len(options)
        if (argument is None) or ((optionsLength > 0) and (not(self.in_array(argument, options)))):
            messageOptions = ', '.join(options)
            message = self.id + ' ' + methodName + '() requires a ' + argumentName + ' argument'
            if messageOptions != '':
                message += ', one of ' + '(' + messageOptions + ')'
            raise ArgumentsRequired(message)

    def check_required_symbol(self, methodName: str, symbol: str):
        """
         * @ignore
        :param str symbol: unified symbol of the market
        :param str methodName: name of the method that requires a symbol
        """
        self.check_required_argument(methodName, symbol, 'symbol')

    def fetch_funding_fees(self, params={}):
        raise NotSupported('fetch_funding_fees() not supported yet')

    def fetch_funding_fee(self, code, params={}):
        if not self.has['fetchFundingFees']:
            raise NotSupported('fetch_funding_fee() not supported yet')
        return self.fetch_funding_fees(params)

    def handle_option_and_params(self, params, methodName, optionName, defaultValue=None):
        # This method can be used to obtain method specific properties, i.e: self.handle_option_and_params(params, 'fetchPosition', 'marginMode', 'isolated')
        defaultOptionName = 'default' + self.capitalize(optionName)  # we also need to check the 'defaultXyzWhatever'
        # check if params contain the key
        value = self.safe_value_2(params, optionName, defaultOptionName)
        if value is not None:
            params = self.omit(params, [optionName, defaultOptionName])
        else:
            # check if exchange has properties for self method
            exchangeWideMethodOptions = self.safe_value(self.options, methodName)
            if exchangeWideMethodOptions is not None:
                # check if the option is defined inside self method's props
                value = self.safe_value_2(exchangeWideMethodOptions, optionName, defaultOptionName)
            if value is None:
                # if it's still None, check if global exchange-wide option exists
                value = self.safe_value_2(self.options, optionName, defaultOptionName)
            # if it's still None, use the default value
            value = value if (value is not None) else defaultValue
        return [value, params]

    def load_trading_limits(self, symbols=None, reload=False, params={}):
        if self.has['fetchTradingLimits']:
            if reload or not('limitsLoaded' in list(self.options.keys())):
                response = self.fetch_trading_limits(symbols)
                for i in range(0, len(symbols)):
                    symbol = symbols[i]
                    self.markets[symbol] = self.deep_extend(self.markets[symbol], response[symbol])
                self.options['limitsLoaded'] = self.milliseconds()
        return self.markets

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        if not self.has['fetchTrades']:
            raise NotSupported('fetch_ohlcv() not supported yet')
        self.load_markets()
        trades = self.fetch_trades(symbol, since, limit, params)
        return self.build_ohlcv(trades, timeframe, since, limit)

    def fetch_status(self, params={}):
        if self.has['fetchTime']:
            updated = self.fetch_time(params)
            self.status['updated'] = updated
        return self.status

    def fetchOHLCV(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        return self.fetch_ohlcv(symbol, timeframe, since, limit, params)

    def parse_trading_view_ohlcv(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        result = self.convert_trading_view_to_ohlcv(ohlcvs)
        return self.parse_ohlcvs(result, market, timeframe, since, limit)

    def convert_trading_view_to_ohlcv(self, ohlcvs, t='t', o='o', h='h', l='l', c='c', v='v', ms=False):  # noqa E741
        result = []
        for i in range(0, len(ohlcvs[t])):
            result.append([
                ohlcvs[t][i] if ms else (ohlcvs[t][i] * 1000),
                ohlcvs[o][i],
                ohlcvs[h][i],
                ohlcvs[l][i],
                ohlcvs[c][i],
                ohlcvs[v][i],
            ])
        return result

    def convert_ohlcv_to_trading_view(self, ohlcvs, t='t', o='o', h='h', l='l', c='c', v='v', ms=False):  # noqa E741
        result = {}
        result[t] = []
        result[o] = []
        result[h] = []
        result[l] = []
        result[c] = []
        result[v] = []
        for i in range(0, len(ohlcvs)):
            result[t].append(ohlcvs[i][0] if ms else int(ohlcvs[i][0] / 1000))
            result[o].append(ohlcvs[i][1])
            result[h].append(ohlcvs[i][2])
            result[l].append(ohlcvs[i][3])
            result[c].append(ohlcvs[i][4])
            result[v].append(ohlcvs[i][5])
        return result

    def build_ohlcv(self, trades, timeframe='1m', since=None, limit=None):
        ms = self.parse_timeframe(timeframe) * 1000
        ohlcvs = []
        (high, low, close, volume) = (2, 3, 4, 5)
        num_trades = len(trades)
        oldest = (num_trades - 1) if limit is None else min(num_trades - 1, limit)
        for i in range(0, oldest):
            trade = trades[i]
            if (since is not None) and (trade['timestamp'] < since):
                continue
            opening_time = int(math.floor(trade['timestamp'] / ms) * ms)  # Shift the edge of the m/h/d (but not M)
            j = len(ohlcvs)
            if (j == 0) or opening_time >= ohlcvs[j - 1][0] + ms:
                # moved to a new timeframe -> create a new candle from opening trade
                ohlcvs.append([
                    opening_time,
                    trade['price'],
                    trade['price'],
                    trade['price'],
                    trade['price'],
                    trade['amount'],
                ])
            else:
                # still processing the same timeframe -> update opening trade
                ohlcvs[j - 1][high] = max(ohlcvs[j - 1][high], trade['price'])
                ohlcvs[j - 1][low] = min(ohlcvs[j - 1][low], trade['price'])
                ohlcvs[j - 1][close] = trade['price']
                ohlcvs[j - 1][volume] += trade['amount']
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

    def parse_deposit_addresses(self, addresses, codes=None, indexed=True, params={}):
        result = []
        for i in range(0, len(addresses)):
            address = self.extend(self.parse_deposit_address(addresses[i]), params)
            result.append(address)
        if codes is not None:
            result = self.filter_by_array(result, 'currency', codes, False)
        result = self.index_by(result, 'currency') if indexed else result
        return result

    def parse_market(self, market):
        raise NotSupported(self.id + ' parseMarket() is not supported yet')

    def parse_markets(self, markets):
        result = []
        for i in range(0, len(markets)):
            result.append(self.parse_market(markets[i]))
        return result

    def parse_tickers(self, tickers, symbols=None, params={}):
        result = []
        values = self.to_array(tickers)
        for i in range(0, len(values)):
            result.append(self.extend(self.parse_ticker(values[i]), params))
        return self.filter_by_array(result, 'symbol', symbols)

    def parse_trades(self, trades, market=None, since=None, limit=None, params={}):
        array = self.to_array(trades)
        array = [self.extend(self.parse_trade(trade, market), params) for trade in array]
        array = self.sort_by(array, 'timestamp')
        symbol = market['symbol'] if market else None
        return self.filter_by_symbol_since_limit(array, symbol, since, limit)

    def parse_to_int(self, number):
        # Solve Common intmisuse ex: int((since / str(1000)))
        # using a number which is not valid in ts
        stringifiedNumber = str(number)
        convertedNumber = float(stringifiedNumber)
        return int(convertedNumber)

    def parse_ledger(self, data, currency=None, since=None, limit=None, params={}):
        array = self.to_array(data)
        result = []
        for item in array:
            entry = self.parse_ledger_entry(item, currency)
            if isinstance(entry, list):
                result += [self.extend(i, params) for i in entry]
            else:
                result.append(self.extend(entry, params))
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if currency else None
        return self.filter_by_currency_since_limit(result, code, since, limit)

    def parse_trades(self, trades, market: Optional[object] = None, since: Optional[int] = None, limit: Optional[int] = None, params={}):
        trades = self.to_array(trades)
        result = []
        for i in range(0, len(trades)):
            trade = self.extend(self.parse_trade(trades[i], market), params)
            result.append(trade)
        result = self.sort_by_2(result, 'timestamp', 'id')
        symbol = market['symbol'] if (market is not None) else None
        return self.filter_by_symbol_since_limit(result, symbol, since, limit)

    def parse_transactions(self, transactions, currency=None, since=None, limit=None, params={}):
        array = self.to_array(transactions)
        array = [self.extend(self.parse_transaction(transaction, currency), params) for transaction in array]
        array = self.sort_by(array, 'timestamp')
        code = currency['code'] if currency else None
        return self.filter_by_currency_since_limit(array, code, since, limit)

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

    def safe_balance(self, balance):
        balances = self.omit(balance, ['info', 'timestamp', 'datetime', 'free', 'used', 'total'])
        codes = list(balances.keys())
        balance['free'] = {}
        balance['used'] = {}
        balance['total'] = {}
        for i in range(0, len(codes)):
            code = codes[i]
            total = self.safe_string(balance[code], 'total')
            free = self.safe_string(balance[code], 'free')
            used = self.safe_string(balance[code], 'used')
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
        array = self.to_array(orders)
        array = [self.extend(self.parse_order(order, market), params) for order in array]
        array = self.sort_by(array, 'timestamp')
        symbol = market['symbol'] if market else None
        return self.filter_by_symbol_since_limit(array, symbol, since, limit)

    def safe_currency_code(self, currency_id, currency=None):
        code = None
        if currency_id is not None:
            currency_id = str(currency_id)
            if self.currencies_by_id is not None and currency_id in self.currencies_by_id:
                code = self.currencies_by_id[currency_id]['code']
            else:
                code = self.common_currency_code(currency_id.upper())
        if code is None and currency is not None:
            code = currency['code']
        return code

    def filter_by_value_since_limit(self, array, field, value=None, since=None, limit=None, key='timestamp', tail=False):
        array = self.to_array(array)
        if value is not None:
            array = [entry for entry in array if entry[field] == value]
        if since is not None:
            array = [entry for entry in array if entry[key] >= since]
        if limit is not None:
            array = array[-limit:] if tail and (since is None) else array[:limit]
        return array

    def filter_by_symbol_since_limit(self, array, symbol=None, since=None, limit=None):
        return self.filter_by_value_since_limit(array, 'symbol', symbol, since, limit)

    def filter_by_currency_since_limit(self, array, code=None, since=None, limit=None):
        return self.filter_by_value_since_limit(array, 'currency', code, since, limit)

    def filter_by_since_limit(self, array, since=None, limit=None, key='timestamp', tail=False):
        array = self.to_array(array)
        if since is not None:
            array = [entry for entry in array if entry[key] >= since]
        if limit is not None:
            array = array[-limit:] if tail and (since is None) else array[:limit]
        return array

    def filter_by_symbol(self, array, symbol=None):
        array = self.to_array(array)
        if symbol:
            return [entry for entry in array if entry['symbol'] == symbol]
        return array

    def filter_by_array(self, objects, key, values=None, indexed=True):

        objects = self.to_array(objects)

        # return all of them if no values were passed in
        if values is None:
            return self.index_by(objects, key) if indexed else objects

        result = []
        for i in range(0, len(objects)):
            value = objects[i][key] if key in objects[i] else None
            if value in values:
                result.append(objects[i])

        return self.index_by(result, key) if indexed else result

    def currency(self, code):
        if not self.currencies:
            raise ExchangeError('Currencies not loaded')
        if isinstance(code, basestring) and (code in self.currencies):
            return self.currencies[code]
        raise ExchangeError('Does not have currency code ' + str(code))

    def handle_withdraw_tag_and_params(self, tag, params):
        if isinstance(tag, dict):
            params = self.extend(tag, params)
            tag = None
        if tag is None:
            tag = self.safe_string(params, 'tag')
            if tag is not None:
                params = self.omit(params, 'tag')
        return [tag, params]

    def market(self, symbol):
        if not self.markets:
            raise ExchangeError('Markets not loaded')
        if isinstance(symbol, basestring) and (symbol in self.markets):
            return self.markets[symbol]
        raise BadSymbol('{} does not have market symbol {}'.format(self.id, symbol))

    def market_ids(self, symbols):
        return [self.market_id(symbol) for symbol in symbols]

    def market_symbols(self, symbols):
        if symbols is None:
            return symbols
        result = []
        for i in range(0, len(symbols)):
            result.append(self.symbol(symbols[i]))
        return result

    def market_id(self, symbol):
        market = self.market(symbol)
        return market['id'] if type(market) is dict else symbol

    def symbol(self, symbol):
        market = self.market(symbol)
        return self.safe_string(market, 'symbol', symbol)

    def calculate_fee(self, symbol, type, side, amount, price, takerOrMaker='taker', params={}):
        market = self.markets[symbol]
        rate = market[takerOrMaker]
        cost = float(self.cost_to_precision(symbol, amount * price))
        return {
            'rate': rate,
            'type': takerOrMaker,
            'currency': market['quote'],
            'cost': float(self.fee_to_precision(symbol, rate * cost)),
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

    def safe_symbol(self, marketId, market=None, delimiter=None, marketType=None):
        market = self.safe_market(marketId, market, delimiter, marketType)
        return market['symbol']

    def edit_limit_buy_order(self, id, symbol, *args):
        return self.edit_limit_order(id, symbol, 'buy', *args)

    def edit_limit_sell_order(self, id, symbol, *args):
        return self.edit_limit_order(id, symbol, 'sell', *args)

    def edit_limit_order(self, id, symbol, *args):
        return self.edit_order(id, symbol, 'limit', *args)

    def edit_order(self, id, symbol, *args, **kwargs):
        if not self.enableRateLimit:
            raise ExchangeError('edit_order() requires enableRateLimit = true')
        self.cancel_order(id, symbol)
        return self.create_order(symbol, *args)

    def create_limit_order(self, symbol, *args):
        return self.create_order(symbol, 'limit', *args)

    def create_market_order(self, symbol, *args):
        return self.create_order(symbol, 'market', *args)

    def create_limit_buy_order(self, symbol, *args):
        return self.create_order(symbol, 'limit', 'buy', *args)

    def create_limit_sell_order(self, symbol, *args):
        return self.create_order(symbol, 'limit', 'sell', *args)

    def create_market_buy_order(self, symbol, amount, params={}):
        return self.create_order(symbol, 'market', 'buy', amount, None, params)

    def create_market_sell_order(self, symbol, amount, params={}):
        return self.create_order(symbol, 'market', 'sell', amount, None, params)

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        raise NotSupported(self.id + ' sign() pure method must be redefined in derived classes')

    # -------------------------------------------------------------------------
    # web3 / 0x methods

    @staticmethod
    def has_web3():
        return Web3 is not None

    def check_required_dependencies(self):
        if self.requiresWeb3 and not Exchange.has_web3():
            raise NotSupported("Web3 functionality requires Python3 and web3 package installed: https://github.com/ethereum/web3.py")
        if self.requiresEddsa and eddsa is None:
            raise NotSupported('Eddsa functionality requires python-axolotl-curve25519, install with `pip install python-axolotl-curve25519==0.4.1.post2`: https://github.com/tgalal/python-axolotl-curve25519')

    @staticmethod
    def from_wei(amount, decimals=18):
        if amount is None:
            return None
        amount_float = float(amount)
        exponential = '{:.14e}'.format(amount_float)
        n, exponent = exponential.split('e')
        new_exponent = int(exponent) - decimals
        return float(n + 'e' + str(new_exponent))

    @staticmethod
    def to_wei(amount, decimals=18):
        if amount is None:
            return None
        amount_float = float(amount)
        exponential = '{:.14e}'.format(amount_float)
        n, exponent = exponential.split('e')
        new_exponent = int(exponent) + decimals
        return number_to_string(n + 'e' + str(new_exponent))

    def privateKeyToAddress(self, privateKey):
        private_key_bytes = base64.b16decode(Exchange.encode(privateKey), True)
        public_key_bytes = ecdsa.SigningKey.from_string(private_key_bytes, curve=ecdsa.SECP256k1).verifying_key.to_string()
        public_key_hash = self.web3.sha3(public_key_bytes)
        return '0x' + Exchange.decode(base64.b16encode(public_key_hash))[-40:].lower()

    def soliditySha3(self, array):
        values = self.solidityValues(array)
        types = self.solidityTypes(values)
        return self.web3.soliditySha3(types, values).hex()

    def solidityTypes(self, array):
        return ['address' if self.web3.isAddress(value) else 'uint256' for value in array]

    def solidityValues(self, array):
        return [self.web3.toChecksumAddress(value) if self.web3.isAddress(value) else (int(value, 16) if str(value)[:2] == '0x' else int(value)) for value in array]

    def getZeroExOrderHash2(self, order):
        return self.soliditySha3([
            order['exchangeContractAddress'],  # address
            order['maker'],  # address
            order['taker'],  # address
            order['makerTokenAddress'],  # address
            order['takerTokenAddress'],  # address
            order['feeRecipient'],  # address
            order['makerTokenAmount'],  # uint256
            order['takerTokenAmount'],  # uint256
            order['makerFee'],  # uint256
            order['takerFee'],  # uint256
            order['expirationUnixTimestampSec'],  # uint256
            order['salt'],  # uint256
        ])

    def getZeroExOrderHash(self, order):
        unpacked = [
            self.web3.toChecksumAddress(order['exchangeContractAddress']),  # { value: order.exchangeContractAddress, type: types_1.SolidityTypes.Address },
            self.web3.toChecksumAddress(order['maker']),                    # { value: order.maker, type: types_1.SolidityTypes.Address },
            self.web3.toChecksumAddress(order['taker']),                    # { value: order.taker, type: types_1.SolidityTypes.Address },
            self.web3.toChecksumAddress(order['makerTokenAddress']),        # { value: order.makerTokenAddress, type: types_1.SolidityTypes.Address },
            self.web3.toChecksumAddress(order['takerTokenAddress']),        # { value: order.takerTokenAddress, type: types_1.SolidityTypes.Address },
            self.web3.toChecksumAddress(order['feeRecipient']),             # { value: order.feeRecipient, type: types_1.SolidityTypes.Address },
            int(order['makerTokenAmount']),             # { value: bigNumberToBN(order.makerTokenAmount), type: types_1.SolidityTypes.Uint256, },
            int(order['takerTokenAmount']),             # { value: bigNumberToBN(order.takerTokenAmount), type: types_1.SolidityTypes.Uint256, },
            int(order['makerFee']),                     # { value: bigNumberToBN(order.makerFee), type: types_1.SolidityTypes.Uint256, },
            int(order['takerFee']),                     # { value: bigNumberToBN(order.takerFee), type: types_1.SolidityTypes.Uint256, },
            int(order['expirationUnixTimestampSec']),   # { value: bigNumberToBN(order.expirationUnixTimestampSec), type: types_1.SolidityTypes.Uint256, },
            int(order['salt']),                         # { value: bigNumberToBN(order.salt), type: types_1.SolidityTypes.Uint256 },
        ]
        types = [
            'address',  # { value: order.exchangeContractAddress, type: types_1.SolidityTypes.Address },
            'address',  # { value: order.maker, type: types_1.SolidityTypes.Address },
            'address',  # { value: order.taker, type: types_1.SolidityTypes.Address },
            'address',  # { value: order.makerTokenAddress, type: types_1.SolidityTypes.Address },
            'address',  # { value: order.takerTokenAddress, type: types_1.SolidityTypes.Address },
            'address',  # { value: order.feeRecipient, type: types_1.SolidityTypes.Address },
            'uint256',  # { value: bigNumberToBN(order.makerTokenAmount), type: types_1.SolidityTypes.Uint256, },
            'uint256',  # { value: bigNumberToBN(order.takerTokenAmount), type: types_1.SolidityTypes.Uint256, },
            'uint256',  # { value: bigNumberToBN(order.makerFee), type: types_1.SolidityTypes.Uint256, },
            'uint256',  # { value: bigNumberToBN(order.takerFee), type: types_1.SolidityTypes.Uint256, },
            'uint256',  # { value: bigNumberToBN(order.expirationUnixTimestampSec), type: types_1.SolidityTypes.Uint256, },
            'uint256',  # { value: bigNumberToBN(order.salt), type: types_1.SolidityTypes.Uint256 },
        ]
        return self.web3.soliditySha3(types, unpacked).hex()

    @staticmethod
    def remove_0x_prefix(value):
        if value[:2] == '0x':
            return value[2:]
        return value

    def getZeroExOrderHashV2(self, order):
        # https://github.com/0xProject/0x-monorepo/blob/development/python-packages/order_utils/src/zero_ex/order_utils/__init__.py
        def pad_20_bytes_to_32(twenty_bytes):
            return bytes(12) + twenty_bytes

        def int_to_32_big_endian_bytes(i):
            return i.to_bytes(32, byteorder="big")

        def to_bytes(value):
            if not isinstance(value, str):
                raise TypeError("Value must be an instance of str")
            if len(value) % 2:
                value = "0x0" + self.remove_0x_prefix(value)
            return base64.b16decode(self.remove_0x_prefix(value), casefold=True)

        domain_struct_header = b"\x91\xab=\x17\xe3\xa5\n\x9d\x89\xe6?\xd3\x0b\x92\xbe\x7fS6\xb0;({\xb9Fxz\x83\xa9\xd6*'f\xf0\xf2F\x18\xf4\xc4\xbe\x1eb\xe0&\xfb\x03\x9a \xef\x96\xf4IR\x94\x81}\x10'\xff\xaam\x1fp\xe6\x1e\xad|[\xef\x02x\x16\xa8\x00\xda\x176DO\xb5\x8a\x80~\xf4\xc9`;xHg?~:h\xeb\x14\xa5"
        order_schema_hash = b'w\x05\x01\xf8\x8a&\xed\xe5\xc0J \xef\x87yi\xe9a\xeb\x11\xfc\x13\xb7\x8a\xafAKc=\xa0\xd4\xf8o'
        header = b"\x19\x01"

        domain_struct_hash = self.web3.sha3(
            domain_struct_header +
            pad_20_bytes_to_32(to_bytes(order["exchangeAddress"]))
        )

        order_struct_hash = self.web3.sha3(
            order_schema_hash +
            pad_20_bytes_to_32(to_bytes(order["makerAddress"])) +
            pad_20_bytes_to_32(to_bytes(order["takerAddress"])) +
            pad_20_bytes_to_32(to_bytes(order["feeRecipientAddress"])) +
            pad_20_bytes_to_32(to_bytes(order["senderAddress"])) +
            int_to_32_big_endian_bytes(int(order["makerAssetAmount"])) +
            int_to_32_big_endian_bytes(int(order["takerAssetAmount"])) +
            int_to_32_big_endian_bytes(int(order["makerFee"])) +
            int_to_32_big_endian_bytes(int(order["takerFee"])) +
            int_to_32_big_endian_bytes(int(order["expirationTimeSeconds"])) +
            int_to_32_big_endian_bytes(int(order["salt"])) +
            self.web3.sha3(to_bytes(order["makerAssetData"])) +
            self.web3.sha3(to_bytes(order["takerAssetData"]))
        )

        sha3 = self.web3.sha3(
            header +
            domain_struct_hash +
            order_struct_hash
        )
        return '0x' + base64.b16encode(sha3).decode('ascii').lower()

    def get_pair(self, symbol):
        symbol_parts = symbol.split("/")
        pair = symbol_parts[1].split("-")
        return pair[0]

    def get_currency(self, symbol):
        symbol_parts = symbol.split("/")
        currency = symbol_parts[0].split("-")
        return currency[0]

    def get_currencies(self):
        symbols = self.load_markets().keys()
        return {self.get_currency(symbol) for symbol in symbols}

    def signZeroExOrderV2(self, order, privateKey):
        orderHash = self.getZeroExOrderHashV2(order)
        signature = self.signMessage(orderHash[-64:], privateKey)
        return self.extend(order, {
            'orderHash': orderHash,
            'signature': self._convertECSignatureToSignatureHex(signature),
        })

    def _convertECSignatureToSignatureHex(self, signature):
        # https://github.com/0xProject/0x-monorepo/blob/development/packages/order-utils/src/signature_utils.ts
        v = signature["v"]
        if v != 27 and v != 28:
            v = v + 27
        return (
            hex(v) +
            signature["r"][-64:] +
            signature["s"][-64:] +
            "03"
        )

    def hashMessage(self, message):
        message_bytes = base64.b16decode(Exchange.encode(Exchange.remove_0x_prefix(message)), True)
        hash_bytes = self.web3.sha3(b"\x19Ethereum Signed Message:\n" + Exchange.encode(str(len(message_bytes))) + message_bytes)
        return '0x' + Exchange.decode(base64.b16encode(hash_bytes)).lower()

    @staticmethod
    def signHash(hash, privateKey):
        signature = Exchange.ecdsa(hash[-64:], privateKey, 'secp256k1', None)
        return {
            'r': '0x' + signature['r'],
            's': '0x' + signature['s'],
            'v': 27 + signature['v'],
        }

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

    def oath(self):
        if self.twofa is not None:
            return self.totp(self.twofa)
        else:
            raise ExchangeError(self.id + ' set .twofa to use this feature')

    @staticmethod
    def decimal_to_bytes(n, endian='big'):
        """int.from_bytes and int.to_bytes don't work in python2"""
        if n > 0:
            next_byte = Exchange.decimal_to_bytes(n // 0x100, endian)
            remainder = bytes([n % 0x100])
            return next_byte + remainder if endian == 'big' else remainder + next_byte
        else:
            return b''

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
        hmac_res = Exchange.hmac(Exchange.decimal_to_bytes(epoch, 'big'), base32_to_bytes(key.replace(' ', '')), hashlib.sha1, 'hex')
        offset = hex_to_dec(hmac_res[-1]) * 2
        otp = str(hex_to_dec(hmac_res[offset: offset + 8]) & 0x7fffffff)
        return otp[-6:]

    @staticmethod
    def number_to_le(n, size):
        return Exchange.decimal_to_bytes(int(n), 'little').ljust(size, b'\x00')

    @staticmethod
    def number_to_be(n, size):
        return Exchange.decimal_to_bytes(int(n), 'big').rjust(size, b'\x00')

    @staticmethod
    def base16_to_binary(s):
        return base64.b16decode(s, True)

    # python supports arbitrarily big integers
    @staticmethod
    def integer_divide(a, b):
        return int(a) // int(b)

    @staticmethod
    def integer_pow(a, b):
        return int(a) ** int(b)

    @staticmethod
    def integer_modulo(a, b):
        return int(a) % int(b)

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
        return Exchange.decimal_to_bytes(result)

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

    def parse_to_int(self, number):
        # Solve Common intmisuse ex: int((since / str(1000)))
        # using a number which is not valid in ts
        stringifiedNumber = str(number)
        convertedNumber = float(stringifiedNumber)
        return int(convertedNumber)

    def parse_number(self, value, default=None):
        if value is None:
            return default
        else:
            try:
                return self.number(value)
            except Exception:
                return default

    def safe_number(self, dictionary, key, default=None):
        value = self.safe_string(dictionary, key)
        return self.parse_number(value, default)

    def safe_number_2(self, dictionary, key1, key2, default=None):
        value = self.safe_string_2(dictionary, key1, key2)
        return self.parse_number(value, default)

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

    def omit_zero(self, string_number):
        if string_number is None or string_number == '':
            return
        if float(string_number) == 0:
            return
        return string_number

    def handle_margin_mode_and_params(self, methodName, params={}):
        """
         * @ignore
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns [str|None, dict]: the marginMode in lowercase as specified by params["marginMode"], params["defaultMarginMode"] self.options["marginMode"] or self.options["defaultMarginMode"]
        """
        defaultMarginMode = self.safe_string_2(self.options, 'marginMode', 'defaultMarginMode')
        methodOptions = self.safe_value(self.options, methodName, {})
        methodMarginMode = self.safe_string_2(methodOptions, 'marginMode', 'defaultMarginMode', defaultMarginMode)
        marginMode = self.safe_string_lower_2(params, 'marginMode', 'defaultMarginMode', methodMarginMode)
        if marginMode is not None:
            params = self.omit(params, ['marginMode', 'defaultMarginMode'])
        return [marginMode, params]

    def handle_until_option(self, key, request, params, multiplier=1):
        until = self.safe_value_2(params, 'until', 'till')
        if until is not None:
            request[key] = self.parseToInt(until * multiplier)
            params = self.omit(params, ['until', 'till'])
        return [request, params]
