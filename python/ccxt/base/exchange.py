# -*- coding: utf-8 -*-

"""Base exchange class"""

# -----------------------------------------------------------------------------

__version__ = '1.50.13'

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
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
from ccxt.base.decimal_to_precision import DECIMAL_PLACES, NO_PADDING, TRUNCATE, ROUND, ROUND_UP, ROUND_DOWN
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


class Exchange(object):
    """Base exchange class"""
    id = None
    name = None
    version = None
    certified = False
    pro = False

    # rate limiter settings
    enableRateLimit = True
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
    paddingMode = NO_PADDING
    minFundingAddressLength = 1  # used in check_address
    substituteCommonCurrencyCodes = True
    quoteJsonNumbers = True
    number = float  # or str (a pointer to a class)
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
        'DRK': 'DASH',
        'BCHABC': 'BCH',
        'BCHSV': 'BSV',
    }

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

        self.session = self.session if self.session or self.asyncio_loop else Session()
        self.logger = self.logger if self.logger else logging.getLogger(__name__)

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
                self.urls['apiBackup'] = self.urls['api']
                self.urls['api'] = self.urls['test']
            else:
                raise NotSupported(self.id + ' does not have a sandbox URL')
        elif 'apiBackup' in self.urls:
            self.urls['api'] = self.urls['apiBackup']
            del self.urls['apiBackup']

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
            if string.find(key) >= 0:
                return key
        return None

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
        return self.set_headers(headers)

    def print(self, *args):
        print(*args)

    def set_headers(self, headers):
        return headers

    def handle_errors(self, code, reason, url, method, headers, body, response, request_headers, request_body):
        pass

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
            self.print("\nRequest:", method, url, request_headers, body)
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
                verify=self.verify
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
                self.print("\nResponse:", method, url, http_status_code, headers, http_response)
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
            self.handle_errors(http_status_code, http_status_text, url, method, headers, http_response, json_response, request_headers, request_body)
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

    def handle_http_status_code(self, http_status_code, http_status_text, url, method, body):
        string_code = str(http_status_code)
        if string_code in self.httpExceptions:
            Exception = self.httpExceptions[string_code]
            raise Exception(' '.join([self.id, method, url, string_code, http_status_text, body]))

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
            return dictionary[key] is not None
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
        return str(dictionary[key]).lower() if Exchange.key_exists(dictionary, key) else default_value

    @staticmethod
    def safe_string_upper(dictionary, key, default_value=None):
        return str(dictionary[key]).upper() if Exchange.key_exists(dictionary, key) else default_value

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
    def ymd(timestamp, infix='-'):
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime('%Y' + infix + '%m' + infix + '%d')

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
        return (isinstance(input, basestring) and
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

    def nonce(self):
        return Exchange.seconds()

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
        return self.decimal_to_precision(cost, TRUNCATE, self.markets[symbol]['precision']['price'], self.precisionMode, self.paddingMode)

    def price_to_precision(self, symbol, price):
        return self.decimal_to_precision(price, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode, self.paddingMode)

    def amount_to_precision(self, symbol, amount):
        return self.decimal_to_precision(amount, TRUNCATE, self.markets[symbol]['precision']['amount'], self.precisionMode, self.paddingMode)

    def fee_to_precision(self, symbol, fee):
        return self.decimal_to_precision(fee, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode, self.paddingMode)

    def currency_to_precision(self, currency, fee):
        return self.decimal_to_precision(fee, ROUND, self.currencies[currency]['precision'], self.precisionMode, self.paddingMode)

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

    def fetch_bids_asks(self, symbols=None, params={}) -> dict:
        raise NotSupported('API does not allow to fetch all prices at once with a single call to fetch_bids_asks() for now')

    def fetch_ticker(self, symbol, params={}):
        if self.has['fetchTickers']:
            tickers = self.fetch_tickers([symbol], params)
            ticker = self.safe_value(tickers, symbol)
            if ticker is None:
                raise BadSymbol(self.id + ' fetchTickers could not find a ticker for ' + symbol)
            else:
                return ticker
        else:
            raise NotSupported(self.id + ' fetchTicker not supported yet')

    def fetch_tickers(self, symbols=None, params={}):
        raise NotSupported('API does not allow to fetch all tickers at once with a single call to fetch_tickers() for now')

    def fetch_order_status(self, id, symbol=None, params={}):
        order = self.fetch_order(id, symbol, params)
        return order['status']

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

    def fetch_deposits(self, code=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_deposits() is not supported yet')

    def fetch_withdrawals(self, code=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_withdrawals() is not supported yet')

    # def fetch_deposit_addresses(self, codes=None, params={}):
    #     raise NotSupported('fetch_deposit_addresses() is not supported yet')

    def fetch_deposit_address(self, code, params={}):
        if self.has['fetchDepositAddresses']:
            deposit_addresses = self.fetch_deposit_addresses([code], params)
            deposit_address = self.safe_value(deposit_addresses, code)
            if deposit_address is None:
                raise NotSupported(self.id + ' fetch_deposit_address could not find a deposit address for ' + code + ', make sure you have created a corresponding deposit address in your wallet on the exchange website')
            else:
                return deposit_address
        else:
            raise NotSupported(self.id + ' fetchDepositAddress not supported yet')

    def parse_ohlcv(self, ohlcv, market=None):
        if isinstance(ohlcv, list):
            return [
                self.safe_integer(ohlcv, 0),
                self.safe_float(ohlcv, 1),
                self.safe_float(ohlcv, 2),
                self.safe_float(ohlcv, 3),
                self.safe_float(ohlcv, 4),
                self.safe_float(ohlcv, 5),
            ]
        else:
            return ohlcv

    def parse_ohlcvs(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        parsed = [self.parse_ohlcv(ohlcv, market) for ohlcv in ohlcvs]
        sorted = self.sort_by(parsed, 0)
        tail = since is None
        return self.filter_by_since_limit(sorted, since, limit, 0, tail)

    def parse_bid_ask(self, bidask, price_key=0, amount_key=0):
        return [self.safe_number(bidask, price_key), self.safe_number(bidask, amount_key)]

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

    def parse_order_book(self, orderbook, symbol, timestamp=None, bids_key='bids', asks_key='asks', price_key=0, amount_key=1):
        return {
            'symbol': symbol,
            'bids': self.sort_by(self.parse_bids_asks(orderbook[bids_key], price_key, amount_key) if (bids_key in orderbook) and isinstance(orderbook[bids_key], list) else [], 0, True),
            'asks': self.sort_by(self.parse_bids_asks(orderbook[asks_key], price_key, amount_key) if (asks_key in orderbook) and isinstance(orderbook[asks_key], list) else [], 0),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp) if timestamp is not None else None,
            'nonce': None,
        }

    def parse_balance(self, balance, legacy=True):
        currencies = self.omit(balance, ['info', 'timestamp', 'datetime', 'free', 'used', 'total']).keys()
        balance['free'] = {}
        balance['used'] = {}
        balance['total'] = {}
        for currency in currencies:
            if balance[currency].get('total') is None:
                if balance[currency].get('free') is not None and balance[currency].get('used') is not None:
                    if legacy:
                        balance[currency]['total'] = self.sum(balance[currency].get('free'), balance[currency].get('used'))
                    else:
                        balance[currency]['total'] = Precise.string_add(balance[currency]['free'], balance[currency]['used'])
            if balance[currency].get('free') is None:
                if balance[currency].get('total') is not None and balance[currency].get('used') is not None:
                    if legacy:
                        balance[currency]['free'] = self.sum(balance[currency]['total'], -balance[currency]['used'])
                    else:
                        balance[currency]['free'] = Precise.string_sub(balance[currency]['total'], balance[currency]['used'])
            if balance[currency].get('used') is None:
                if balance[currency].get('total') is not None and balance[currency].get('free') is not None:
                    if legacy:
                        balance[currency]['used'] = self.sum(balance[currency]['total'], -balance[currency]['free'])
                    else:
                        balance[currency]['used'] = Precise.string_sub(balance[currency]['total'], balance[currency]['free'])
            balance[currency]['free'] = self.parse_number(balance[currency]['free'])
            balance[currency]['used'] = self.parse_number(balance[currency]['used'])
            balance[currency]['total'] = self.parse_number(balance[currency]['total'])
            balance['free'][currency] = balance[currency]['free']
            balance['used'][currency] = balance[currency]['used']
            balance['total'][currency] = balance[currency]['total']
        return balance

    def fetch_partial_balance(self, part, params={}):
        balance = self.fetch_balance(params)
        return balance[part]

    def fetch_free_balance(self, params={}):
        return self.fetch_partial_balance('free', params)

    def fetch_used_balance(self, params={}):
        return self.fetch_partial_balance('used', params)

    def fetch_total_balance(self, params={}):
        return self.fetch_partial_balance('total', params)

    def fetch_trading_fees(self, symbol, params={}):
        raise NotSupported('fetch_trading_fees() not supported yet')

    def fetch_trading_fee(self, symbol, params={}):
        if not self.has['fetchTradingFees']:
            raise NotSupported('fetch_trading_fee() not supported yet')
        return self.fetch_trading_fees(params)

    def fetch_funding_fees(self, params={}):
        raise NotSupported('fetch_funding_fees() not supported yet')

    def fetch_funding_fee(self, code, params={}):
        if not self.has['fetchFundingFees']:
            raise NotSupported('fetch_funding_fee() not supported yet')
        return self.fetch_funding_fees(params)

    def load_trading_limits(self, symbols=None, reload=False, params={}):
        if self.has['fetchTradingLimits']:
            if reload or not('limitsLoaded' in list(self.options.keys())):
                response = self.fetch_trading_limits(symbols)
                for i in range(0, len(symbols)):
                    symbol = symbols[i]
                    self.markets[symbol] = self.deep_extend(self.markets[symbol], response[symbol])
                self.options['limitsLoaded'] = self.milliseconds()
        return self.markets

    def fetch_ohlcvc(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        if not self.has['fetchTrades']:
            raise NotSupported('fetch_ohlcv() not supported yet')
        self.load_markets()
        trades = self.fetch_trades(symbol, since, limit, params)
        return self.build_ohlcvc(trades, timeframe, since, limit)

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        ohlcvs = self.fetch_ohlcvc(symbol, timeframe, since, limit, params)
        return [ohlcv[0:-1] for ohlcv in ohlcvs]

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
            opening_time = int(math.floor(trade['timestamp'] / ms) * ms)  # Shift the edge of the m/h/d (but not M)
            j = len(ohlcvs)
            candle = j - 1
            if (j == 0) or opening_time >= ohlcvs[candle][timestamp] + ms:
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

    def safe_ticker(self, ticker, market=None):
        symbol = self.safe_value(ticker, 'symbol')
        if symbol is None:
            ticker['symbol'] = self.safe_symbol(None, market)
        timestamp = self.safe_integer(ticker, 'timestamp')
        if timestamp is not None:
            ticker['timestamp'] = timestamp
            ticker['datetime'] = self.iso8601(timestamp)
        baseVolume = self.safe_value(ticker, 'baseVolume')
        quoteVolume = self.safe_value(ticker, 'quoteVolume')
        vwap = self.safe_value(ticker, 'vwap')
        if vwap is None:
            ticker['vwap'] = self.vwap(baseVolume, quoteVolume)
        close = self.safe_value(ticker, 'close')
        last = self.safe_value(ticker, 'last')
        if (close is None) and (last is not None):
            ticker['close'] = last
        elif (last is None) and (close is not None):
            ticker['last'] = close
        return ticker

    def parse_tickers(self, tickers, symbols=None, params={}):
        result = []
        values = self.to_array(tickers)
        for i in range(0, len(values)):
            result.append(self.extend(self.parse_ticker(values[i]), params))
        return self.filter_by_array(result, 'symbol', symbols)

    def parse_deposit_addresses(self, addresses, codes=None):
        result = []
        for i in range(0, len(addresses)):
            address = self.parse_deposit_address(addresses[i])
            result.append(address)
        if codes:
            result = self.filter_by_array(result, 'currency', codes)
        return self.index_by(result, 'currency')

    def parse_trades(self, trades, market=None, since=None, limit=None, params={}):
        array = self.to_array(trades)
        array = [self.extend(self.parse_trade(trade, market), params) for trade in array]
        array = self.sort_by(array, 'timestamp')
        symbol = market['symbol'] if market else None
        tail = since is None
        return self.filter_by_symbol_since_limit(array, symbol, since, limit, tail)

    def parse_transactions(self, transactions, currency=None, since=None, limit=None, params={}):
        array = self.to_array(transactions)
        array = [self.extend(self.parse_transaction(transaction, currency), params) for transaction in array]
        array = self.sort_by(array, 'timestamp')
        code = currency['code'] if currency else None
        tail = since is None
        return self.filter_by_currency_since_limit(array, code, since, limit, tail)

    def parse_transfers(self, transfers, currency=None, since=None, limit=None, params={}):
        array = self.to_array(transfers)
        array = [self.extend(self.parse_transfer(transfer, currency), params) for transfer in array]
        array = self.sort_by(array, 'timestamp')
        code = currency['code'] if currency else None
        tail = since is None
        return self.filter_by_currency_since_limit(array, code, since, limit, tail)

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
        tail = since is None
        return self.filter_by_currency_since_limit(result, code, since, limit, tail)

    def parse_orders(self, orders, market=None, since=None, limit=None, params={}):
        if isinstance(orders, list):
            array = [self.extend(self.parse_order(order, market), params) for order in orders]
        else:
            array = [self.extend(self.parse_order(self.extend({'id': id}, order), market), params) for id, order in orders.items()]
        array = self.sort_by(array, 'timestamp')
        symbol = market['symbol'] if market else None
        tail = since is None
        return self.filter_by_symbol_since_limit(array, symbol, since, limit, tail)

    def safe_market(self, marketId, market=None, delimiter=None):
        if marketId is not None:
            if self.markets_by_id is not None and marketId in self.markets_by_id:
                market = self.markets_by_id[marketId]
            elif delimiter is not None:
                baseId, quoteId = marketId.split(delimiter)
                base = self.safe_currency_code(baseId)
                quote = self.safe_currency_code(quoteId)
                symbol = base + '/' + quote
                return {
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                }
        if market is not None:
            return market
        return {
            'symbol': marketId,
            'base': None,
            'quote': None,
            'baseId': None,
            'quoteId': None,
        }

    def safe_symbol(self, marketId, market=None, delimiter=None):
        market = self.safe_market(marketId, market, delimiter)
        return market['symbol']

    def safe_currency(self, currency_id, currency=None):
        if currency_id is None and currency is not None:
            return currency
        if (self.currencies_by_id is not None) and (currency_id in self.currencies_by_id):
            return self.currencies_by_id[currency_id]
        return {
            'id': currency_id,
            'code': self.common_currency_code(currency_id.upper()) if currency_id is not None else currency_id
        }

    def safe_currency_code(self, currency_id, currency=None):
        currency = self.safe_currency(currency_id, currency)
        return currency['code']

    def filter_by_value_since_limit(self, array, field, value=None, since=None, limit=None, key='timestamp', tail=False):
        array = self.to_array(array)
        if value is not None:
            array = [entry for entry in array if entry[field] == value]
        if since is not None:
            array = [entry for entry in array if entry[key] >= since]
        if limit is not None:
            array = array[-limit:] if tail else array[:limit]
        return array

    def filter_by_symbol_since_limit(self, array, symbol=None, since=None, limit=None, tail=False):
        return self.filter_by_value_since_limit(array, 'symbol', symbol, since, limit, 'timestamp', tail)

    def filter_by_currency_since_limit(self, array, code=None, since=None, limit=None, tail=False):
        return self.filter_by_value_since_limit(array, 'currency', code, since, limit, 'timestamp', tail)

    def filter_by_since_limit(self, array, since=None, limit=None, key='timestamp', tail=False):
        array = self.to_array(array)
        if since is not None:
            array = [entry for entry in array if entry[key] >= since]
        if limit is not None:
            array = array[-limit:] if tail else array[:limit]
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

    def market(self, symbol):
        if not self.markets:
            raise ExchangeError('Markets not loaded')
        if isinstance(symbol, basestring) and (symbol in self.markets):
            return self.markets[symbol]
        raise BadSymbol('{} does not have market symbol {}'.format(self.id, symbol))

    def currency_ids(self, codes):
        return [self.currency_id(code) for code in codes]

    def market_ids(self, symbols):
        return [self.market_id(symbol) for symbol in symbols]

    def market_id(self, symbol):
        market = self.market(symbol)
        return market['id'] if type(market) is dict else symbol

    def calculate_fee(self, symbol, type, side, amount, price, takerOrMaker='taker', params={}):
        market = self.markets[symbol]
        feeSide = self.safe_string(market, 'feeSide', 'quote')
        key = 'quote'
        cost = None
        if feeSide == 'quote':
            # the fee is always in quote currency
            cost = amount * price
        elif feeSide == 'base':
            # the fee is always in base currency
            cost = amount
        elif feeSide == 'get':
            # the fee is always in the currency you get
            cost = amount
            if side == 'sell':
                cost *= price
            else:
                key = 'base'
        elif feeSide == 'give':
            # the fee is always in the currency you give
            cost = amount
            if side == 'buy':
                cost *= price
            else:
                key = 'base'
        rate = market[takerOrMaker]
        if cost is not None:
            cost *= rate
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': cost,
        }

    def edit_limit_buy_order(self, id, symbol, *args):
        return self.edit_limit_order(id, symbol, 'buy', *args)

    def edit_limit_sell_order(self, id, symbol, *args):
        return self.edit_limit_order(id, symbol, 'sell', *args)

    def edit_limit_order(self, id, symbol, *args):
        return self.edit_order(id, symbol, 'limit', *args)

    def edit_order(self, id, symbol, *args):
        if not self.enableRateLimit:
            raise ExchangeError('edit_order() requires enableRateLimit = true')
        self.cancel_order(id, symbol)
        return self.create_order(symbol, *args)

    def create_limit_order(self, symbol, side, amount, price, params={}) -> dict:
        return self.create_order(symbol, 'limit', side, amount, price, params)

    def create_market_order(self, symbol, side, amount, price=None, params={}) -> dict:
        return self.create_order(symbol, 'market', side, amount, price, params)

    def create_limit_buy_order(self, symbol, amount, price, params={}) -> dict:
        return self.create_order(symbol, 'limit', 'buy', amount, price, params)

    def create_limit_sell_order(self, symbol, amount, price, params={}) -> dict:
        return self.create_order(symbol, 'limit', 'sell', amount, price, params)

    def create_market_buy_order(self, symbol, amount, params={}) -> dict:
        return self.create_order(symbol, 'market', 'buy', amount, None, params)

    def create_market_sell_order(self, symbol, amount, params={}) -> dict:
        return self.create_order(symbol, 'market', 'sell', amount, None, params)

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        raise NotSupported(self.id + ' sign() pure method must be redefined in derived classes')

    def vwap(self, baseVolume, quoteVolume):
        return (quoteVolume / baseVolume) if (quoteVolume is not None) and (baseVolume is not None) and (baseVolume > 0) else None

    # -------------------------------------------------------------------------

    def check_required_dependencies(self):
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

    @staticmethod
    def binary_to_base16(s):
        return Exchange.decode(base64.b16encode(s)).lower()

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

    def reduce_fees_by_currency(self, fees):
        reduced = {}
        for i in range(0, len(fees)):
            fee = fees[i]
            feeCurrencyCode = self.safe_value(fee, 'currency')
            if feeCurrencyCode is not None:
                if feeCurrencyCode in reduced:
                    reduced[feeCurrencyCode]['cost'] = self.sum(reduced[feeCurrencyCode]['cost'], fee['cost'])
                else:
                    reduced[feeCurrencyCode] = {
                        'cost': fee['cost'],
                        'currency': feeCurrencyCode,
                    }
        return list(reduced.values())

    def safe_order(self, order):
        # Cost
        # Remaining
        # Average
        # Price
        # Amount
        # Filled
        #
        # first we try to calculate the order fields from the trades
        amount = self.safe_value(order, 'amount')
        remaining = self.safe_value(order, 'remaining')
        filled = self.safe_value(order, 'filled')
        cost = self.safe_value(order, 'cost')
        average = self.safe_value(order, 'average')
        price = self.safe_value(order, 'price')
        lastTradeTimeTimestamp = self.safe_integer(order, 'lastTradeTimestamp')
        parseFilled = (filled is None)
        parseCost = (cost is None)
        parseLastTradeTimeTimestamp = (lastTradeTimeTimestamp is None)
        parseFee = self.safe_value(order, 'fee') is None
        parseFees = self.safe_value(order, 'fees') is None
        shouldParseFees = parseFee or parseFees
        fees = self.safe_value(order, 'fees', [])
        if parseFilled or parseCost or shouldParseFees:
            trades = self.safe_value(order, 'trades')
            if isinstance(trades, list):
                if parseFilled:
                    filled = 0
                if parseCost:
                    cost = 0
                for i in range(0, len(trades)):
                    trade = trades[i]
                    tradeAmount = self.safe_value(trade, 'amount')
                    if parseFilled and (tradeAmount is not None):
                        filled = self.sum(filled, tradeAmount)
                    tradeCost = self.safe_value(trade, 'cost')
                    if parseCost and (tradeCost is not None):
                        cost = self.sum(cost, tradeCost)
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
            if not parseFee and (reducedLength == 0):
                reducedFees.append(order['fee'])
            if parseFees:
                order['fees'] = reducedFees
            if parseFee and (reducedLength == 1):
                order['fee'] = reducedFees[0]
        if amount is None:
            # ensure amount = filled + remaining
            if filled is not None and remaining is not None:
                amount = self.sum(filled, remaining)
            elif self.safe_string(order, 'status') == 'closed':
                amount = filled
        if filled is None:
            if amount is not None and remaining is not None:
                filled = max(self.sum(amount, -remaining), 0)
        if remaining is None:
            if amount is not None and filled is not None:
                remaining = max(self.sum(amount, -filled), 0)
        # ensure that the average field is calculated correctly
        if average is None:
            if (filled is not None) and (cost is not None) and (filled > 0):
                average = cost / filled
        # also ensure the cost field is calculated correctly
        costPriceExists = (average is not None) or (price is not None)
        if parseCost and (filled is not None) and costPriceExists:
            cost = (price * filled) if (average is None) else (average * filled)
        # support for market orders
        orderType = self.safe_value(order, 'type')
        emptyPrice = price is None or price == 0.0
        if emptyPrice and (orderType == 'market'):
            price = average
        return self.extend(order, {
            'lastTradeTimestamp': lastTradeTimeTimestamp,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
        })

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

    def parse_precision(self, precision):
        if precision is None:
            return None
        return '1e' + Precise.string_neg(precision)
