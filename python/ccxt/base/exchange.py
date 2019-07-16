# -*- coding: utf-8 -*-

"""Base exchange class"""

# -----------------------------------------------------------------------------

__version__ = '1.18.943'

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NetworkError
from ccxt.base.errors import NotSupported
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import DDoSProtection
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import InvalidAddress

# -----------------------------------------------------------------------------

from ccxt.base.decimal_to_precision import decimal_to_precision
from ccxt.base.decimal_to_precision import DECIMAL_PLACES, TRUNCATE, ROUND
from ccxt.base.decimal_to_precision import number_to_string

# -----------------------------------------------------------------------------

# rsa jwt signing
from cryptography.hazmat import backends
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_private_key

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
    # from web3.auto import w3
    from web3 import Web3, HTTPProvider
    from web3.utils.encoding import hex_encode_abi_type
except ImportError:
    Web3 = HTTPProvider = None  # web3/0x not supported in Python 2

# -----------------------------------------------------------------------------


class Exchange(object):
    """Base exchange class"""
    id = None
    version = None
    certified = False

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
    tickers = None
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
        '429': DDoSProtection,
        '404': ExchangeNotAvailable,
        '409': ExchangeNotAvailable,
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
    trades = None
    transactions = None
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
        'withdraw': False,
    }
    precisionMode = DECIMAL_PLACES
    minFundingAddressLength = 1  # used in check_address
    substituteCommonCurrencyCodes = True
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
    web3 = None

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
        self.orders = dict() if self.orders is None else self.orders
        self.trades = dict() if self.trades is None else self.trades
        self.transactions = dict() if self.transactions is None else self.transactions
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
                camelcase = parts[0] + ''.join(self.capitalize(i) for i in parts[1:])
                attr = getattr(self, name)
                if isinstance(attr, types.MethodType):
                    setattr(cls, camelcase, getattr(cls, name))
                else:
                    setattr(self, camelcase, attr)

        self.tokenBucket = self.extend({
            'refillRate': 1.0 / self.rateLimit,
            'delay': 0.001,
            'capacity': 1.0,
            'defaultCost': 1.0,
        }, getattr(self, 'tokenBucket') if hasattr(self, 'tokenBucket') else {})

        self.session = self.session if self.session else Session()
        self.logger = self.logger if self.logger else logging.getLogger(__name__)

        if self.requiresWeb3 and Web3 and not self.web3:
            # self.web3 = w3 if w3 else Web3(HTTPProvider())
            self.web3 = Web3(HTTPProvider())

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
    def define_rest_api(cls, api, method_name, options={}):
        delimiters = re.compile('[^a-zA-Z0-9]')
        entry = getattr(cls, method_name)  # returns a function (instead of a bound method)
        for api_type, methods in api.items():
            for http_method, urls in methods.items():
                for url in urls:
                    url = url.strip()
                    split_path = delimiters.split(url)

                    uppercase_method = http_method.upper()
                    lowercase_method = http_method.lower()
                    camelcase_method = lowercase_method.capitalize()
                    camelcase_suffix = ''.join([Exchange.capitalize(x) for x in split_path])
                    lowercase_path = [x.strip().lower() for x in split_path]
                    underscore_suffix = '_'.join([k for k in lowercase_path if len(k)])

                    camelcase = api_type + camelcase_method + Exchange.capitalize(camelcase_suffix)
                    underscore = api_type + '_' + lowercase_method + '_' + underscore_suffix.lower()

                    if 'suffixes' in options:
                        if 'camelcase' in options['suffixes']:
                            camelcase += options['suffixes']['camelcase']
                        if 'underscore' in options['suffixes']:
                            underscore += options['suffixes']['underscore']

                    def partialer():
                        outer_kwargs = {'path': url, 'api': api_type, 'method': uppercase_method}

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

    def find_broadly_matched_key(self, broad, string):
        """A helper method for matching error strings exactly vs broadly"""
        keys = list(broad.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            if string.find(key) >= 0:
                return key
        return None

    def handle_errors(self, code, reason, url, method, headers, body, response):
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

    def fetch(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""
        request_headers = self.prepare_request_headers(headers)
        url = self.proxy + url

        if self.verbose:
            print("\nRequest:", method, url, request_headers, body)
        self.logger.debug("%s %s, Request: %s %s", method, url, request_headers, body)

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
                print("\nResponse:", method, url, http_status_code, headers, http_response)
            self.logger.debug("%s %s, Response: %s %s %s", method, url, http_status_code, headers, http_response)
            response.raise_for_status()

        except Timeout as e:
            raise RequestTimeout(method + ' ' + url)

        except TooManyRedirects as e:
            raise ExchangeError(method + ' ' + url)

        except SSLError as e:
            raise ExchangeError(method + ' ' + url)

        except HTTPError as e:
            self.handle_errors(http_status_code, http_status_text, url, method, headers, http_response, json_response)
            self.handle_rest_errors(http_status_code, http_status_text, http_response, url, method)
            raise ExchangeError(method + ' ' + url)

        except RequestException as e:  # base exception class
            error_string = str(e)
            if ('ECONNRESET' in error_string) or ('Connection aborted.' in error_string):
                raise NetworkError(method + ' ' + url)
            else:
                raise ExchangeError(method + ' ' + url)

        self.handle_errors(http_status_code, http_status_text, url, method, headers, http_response, json_response)
        self.handle_rest_response(http_response, json_response, url, method)
        if json_response is not None:
            return json_response
        return http_response

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

    @staticmethod
    def safe_float(dictionary, key, default_value=None):
        value = default_value
        try:
            if isinstance(dictionary, list) and isinstance(key, int) and len(dictionary) > key:
                value = float(dictionary[key])
            else:
                value = float(dictionary[key]) if (key is not None) and (key in dictionary) and (dictionary[key] is not None) else default_value
        except ValueError as e:
            value = default_value
        return value

    @staticmethod
    def safe_string(dictionary, key, default_value=None):
        return str(dictionary[key]) if key is not None and (key in dictionary) and dictionary[key] is not None else default_value

    @staticmethod
    def safe_integer(dictionary, key, default_value=None):
        if key is None or (key not in dictionary):
            return default_value
        value = dictionary[key]
        if isinstance(value, Number) or (isinstance(value, basestring) and value.isnumeric()):
            return int(value)
        return default_value

    @staticmethod
    def safe_value(dictionary, key, default_value=None):
        return dictionary[key] if key is not None and (key in dictionary) and dictionary[key] is not None else default_value

    # we're not using safe_floats with a list argument as we're trying to save some cycles here
    # we're not using safe_float_3 either because those cases are too rare to deserve their own optimization

    @staticmethod
    def safe_float_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_float, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_string_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_string, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_integer_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_integer, dictionary, key1, key2, default_value)

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
        if value:
            grouped = Exchange.group_by(array, key)
            if value in grouped:
                return grouped[value]
            return []
        return array

    @staticmethod
    def filterBy(self, array, key, value=None):
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
        for element in array:
            if (key in element) and (element[key] is not None):
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
    def url(path, params={}):
        result = Exchange.implode_params(path, params)
        query = Exchange.omit(params, Exchange.extract_params(path))
        if query:
            result += '?' + _urlencode.urlencode(query)
        return result

    @staticmethod
    def urlencode(params={}):
        if (type(params) is dict) or isinstance(params, collections.OrderedDict):
            return _urlencode.urlencode(params)
        return params

    @staticmethod
    def rawencode(params={}):
        return _urlencode.unquote(Exchange.urlencode(params))

    @staticmethod
    def encode_uri_component(uri):
        return _urlencode.quote(uri, safe="~()*!.'")

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
        for [price, volume] in bidasks:
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

    def check_required_credentials(self, error=True):
        keys = list(self.requiredCredentials.keys())
        for key in keys:
            if self.requiredCredentials[key] and not getattr(self, key):
                if error:
                    raise AuthenticationError('requires `' + key + '`')
                else:
                    return error

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
        return self.decimal_to_precision(cost, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode)

    def price_to_precision(self, symbol, price):
        return self.decimal_to_precision(price, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode)

    def amount_to_precision(self, symbol, amount):
        return self.decimal_to_precision(amount, TRUNCATE, self.markets[symbol]['precision']['amount'], self.precisionMode)

    def fee_to_precision(self, symbol, fee):
        return self.decimal_to_precision(fee, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode)

    def currency_to_precision(self, currency, fee):
        return self.decimal_to_precision(fee, ROUND, self.currencies[currency]['precision'], self.precisionMode)

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
        self.symbols = sorted(list(self.markets.keys()))
        self.ids = sorted(list(self.markets_by_id.keys()))
        if currencies:
            self.currencies = self.deep_extend(currencies, self.currencies)
        else:
            base_currencies = [{
                'id': market['baseId'] if 'baseId' in market else market['base'],
                'numericId': market['baseNumericId'] if 'baseNumericId' in market else None,
                'code': market['base'],
                'precision': (
                    market['precision']['base'] if 'base' in market['precision'] else (
                        market['precision']['amount'] if 'amount' in market['precision'] else None
                    )
                ) if 'precision' in market else 8,
            } for market in values if 'base' in market]
            quote_currencies = [{
                'id': market['quoteId'] if 'quoteId' in market else market['quote'],
                'numericId': market['quoteNumericId'] if 'quoteNumericId' in market else None,
                'code': market['quote'],
                'precision': (
                    market['precision']['quote'] if 'quote' in market['precision'] else (
                        market['precision']['price'] if 'price' in market['precision'] else None
                    )
                ) if 'precision' in market else 8,
            } for market in values if 'quote' in market]
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

    def fetch_bids_asks(self, symbols=None, params={}):
        raise NotSupported('API does not allow to fetch all prices at once with a single call to fetch_bids_asks() for now')

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

    def fetch_transactions(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_transactions() is not supported yet')

    def fetch_deposits(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_deposits() is not supported yet')

    def fetch_withdrawals(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported('fetch_withdrawals() is not supported yet')

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return ohlcv[0:6] if isinstance(ohlcv, list) else ohlcv

    def parse_ohlcvs(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        ohlcvs = self.to_array(ohlcvs)
        num_ohlcvs = len(ohlcvs)
        result = []
        i = 0
        while i < num_ohlcvs:
            if limit and (len(result) >= limit):
                break
            ohlcv = self.parse_ohlcv(ohlcvs[i], market, timeframe, since, limit)
            i = i + 1
            if since and (ohlcv[0] < since):
                continue
            result.append(ohlcv)
        return self.sort_by(result, 0)

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
        currencies = self.omit(balance, 'info').keys()

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

        for account in ['free', 'used', 'total']:
            balance[account] = {}
            for currency in currencies:
                balance[account][currency] = balance[currency][account]
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

    def convert_trading_view_to_ohlcv(self, ohlcvs):
        result = []
        for i in range(0, len(ohlcvs['t'])):
            result.append([
                ohlcvs['t'][i] * 1000,
                ohlcvs['o'][i],
                ohlcvs['h'][i],
                ohlcvs['l'][i],
                ohlcvs['c'][i],
                ohlcvs['v'][i],
            ])
        return result

    def convert_ohlcv_to_trading_view(self, ohlcvs):
        result = {
            't': [],
            'o': [],
            'h': [],
            'l': [],
            'c': [],
            'v': [],
        }
        for i in range(0, len(ohlcvs)):
            result['t'].append(int(ohlcvs[i][0] / 1000))
            result['o'].append(ohlcvs[i][1])
            result['h'].append(ohlcvs[i][2])
            result['l'].append(ohlcvs[i][3])
            result['c'].append(ohlcvs[i][4])
            result['v'].append(ohlcvs[i][5])
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
        if 'y' in unit:
            scale = 60 * 60 * 24 * 365
        elif 'M' in unit:
            scale = 60 * 60 * 24 * 30
        elif 'w' in unit:
            scale = 60 * 60 * 24 * 7
        elif 'd' in unit:
            scale = 60 * 60 * 24
        elif 'h' in unit:
            scale = 60 * 60
        else:
            scale = 60  # 1m by default
        return amount * scale

    def parse_trades(self, trades, market=None, since=None, limit=None, params={}):
        array = self.to_array(trades)
        array = [self.extend(self.parse_trade(trade, market), params) for trade in array]
        array = self.sort_by(array, 'timestamp')
        symbol = market['symbol'] if market else None
        return self.filter_by_symbol_since_limit(array, symbol, since, limit)

    def parse_ledger(self, data, currency=None, since=None, limit=None, params={}):
        array = self.to_array(data)
        array = [self.extend(self.parse_ledger_entry(item, currency), params) for item in array]
        array = self.sort_by(array, 'timestamp')
        code = currency['code'] if currency else None
        return self.filter_by_currency_since_limit(array, code, since, limit)

    def parse_transactions(self, transactions, currency=None, since=None, limit=None, params={}):
        array = self.to_array(transactions)
        array = [self.extend(self.parse_transaction(transaction, currency), params) for transaction in array]
        array = self.sort_by(array, 'timestamp')
        code = currency['code'] if currency else None
        return self.filter_by_currency_since_limit(array, code, since, limit)

    def parse_orders(self, orders, market=None, since=None, limit=None, params={}):
        array = self.to_array(orders)
        array = [self.extend(self.parse_order(order, market), params) for order in array]
        array = self.sort_by(array, 'timestamp')
        symbol = market['symbol'] if market else None
        return self.filter_by_symbol_since_limit(array, symbol, since, limit)

    def safe_currency_code(self, currency_id, currency=None):
        code = None
        if currency_id is not None:
            if self.currencies_by_id is not None and currency_id in self.currencies_by_id:
                code = self.currencies_by_id[currency_id]['code']
            else:
                code = self.common_currency_code(currency_id.upper())
        if code is None and currency is not None:
            code = currency['code']
        return code

    def filter_by_value_since_limit(self, array, field, value=None, since=None, limit=None):
        array = self.to_array(array)
        if value:
            array = [entry for entry in array if entry[field] == value]
        if since:
            array = [entry for entry in array if entry['timestamp'] >= since]
        if limit:
            array = array[0:limit]
        return array

    def filter_by_symbol_since_limit(self, array, symbol=None, since=None, limit=None):
        return self.filter_by_value_since_limit(array, 'symbol', symbol, since, limit)

    def filter_by_currency_since_limit(self, array, code=None, since=None, limit=None):
        return self.filter_by_value_since_limit(array, 'currency', code, since, limit)

    def filter_by_since_limit(self, array, since=None, limit=None):
        array = self.to_array(array)
        if since:
            array = [entry for entry in array if entry['timestamp'] >= since]
        if limit:
            array = array[0:limit]
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

    def market(self, symbol):
        if not self.markets:
            raise ExchangeError('Markets not loaded')
        if isinstance(symbol, basestring) and (symbol in self.markets):
            return self.markets[symbol]
        raise ExchangeError('No market symbol ' + str(symbol))

    def market_ids(self, symbols):
        return [self.market_id(symbol) for symbol in symbols]

    def market_id(self, symbol):
        market = self.market(symbol)
        return market['id'] if type(market) is dict else symbol

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
        if not Exchange.has_web3():
            raise NotSupported("Web3 functionality requires Python3 and web3 package installed: https://github.com/ethereum/web3.py")

    def eth_decimals(self, unit='ether'):
        units = {
            'wei': 0,          # 1
            'kwei': 3,         # 1000
            'babbage': 3,      # 1000
            'femtoether': 3,   # 1000
            'mwei': 6,         # 1000000
            'lovelace': 6,     # 1000000
            'picoether': 6,    # 1000000
            'gwei': 9,         # 1000000000
            'shannon': 9,      # 1000000000
            'nanoether': 9,    # 1000000000
            'nano': 9,         # 1000000000
            'szabo': 12,       # 1000000000000
            'microether': 12,  # 1000000000000
            'micro': 12,       # 1000000000000
            'finney': 15,      # 1000000000000000
            'milliether': 15,  # 1000000000000000
            'milli': 15,       # 1000000000000000
            'ether': 18,       # 1000000000000000000
            'kether': 21,      # 1000000000000000000000
            'grand': 21,       # 1000000000000000000000
            'mether': 24,      # 1000000000000000000000000
            'gether': 27,      # 1000000000000000000000000000
            'tether': 30,      # 1000000000000000000000000000000
        }
        return self.safe_value(units, unit)

    def eth_unit(self, decimals=18):
        units = {
            0: 'wei',      # 1000000000000000000
            3: 'kwei',     # 1000000000000000
            6: 'mwei',     # 1000000000000
            9: 'gwei',     # 1000000000
            12: 'szabo',   # 1000000
            15: 'finney',  # 1000
            18: 'ether',   # 1
            21: 'kether',  # 0.001
            24: 'mether',  # 0.000001
            27: 'gether',  # 0.000000001
            30: 'tether',  # 0.000000000001
        }
        return self.safe_value(units, decimals)

    def fromWei(self, amount, unit='ether', decimals=18):
        if Web3 is None:
            raise NotSupported("ethereum web3 methods require Python 3: https://pythonclock.org")
        if amount is None:
            return amount
        if decimals != 18:
            if decimals % 3:
                amount = int(amount) * (10 ** (18 - decimals))
            else:
                unit = self.eth_unit(decimals)
        return float(Web3.fromWei(int(amount), unit))

    def toWei(self, amount, unit='ether', decimals=18):
        if Web3 is None:
            raise NotSupported("ethereum web3 methods require Python 3: https://pythonclock.org")
        if amount is None:
            return amount
        if decimals != 18:
            if decimals % 3:
                # this case has known yet unsolved problems:
                #     toWei(1.999, 'ether', 17) == '199900000000000011'
                #     toWei(1.999, 'ether', 19) == '19989999999999999991'
                # the best solution should not involve additional dependencies
                amount = Decimal(amount) / Decimal(10 ** (18 - decimals))
            else:
                unit = self.eth_unit(decimals)
        return str(Web3.toWei(amount, unit))

    def decryptAccountFromJSON(self, value, password):
        return self.decryptAccount(json.loads(value) if isinstance(value, basestring) else value, password)

    def decryptAccount(self, key, password):
        return self.web3.eth.accounts.decrypt(key, password)

    def decryptAccountFromPrivateKey(self, privateKey):
        return self.web3.eth.accounts.privateKeyToAccount(privateKey)

    def soliditySha3(self, array):
        values = self.solidityValues(array)
        types = self.solidityTypes(values)
        return self.web3.soliditySha3(types, values).hex()

    def soliditySha256(self, values):
        types = self.solidityTypes(values)
        solidity_values = self.solidityValues(values)
        encoded_values = [hex_encode_abi_type(abi_type, value)[2:] for abi_type, value in zip(types, solidity_values)]
        hex_string = '0x' + ''.join(encoded_values)
        return '0x' + self.hash(self.encode(self.web3.toText(hex_string)), 'sha256')

    def solidityTypes(self, array):
        return ['address' if self.web3.isAddress(value) else 'uint256' for value in array]

    def solidityValues(self, array):
        return [self.web3.toChecksumAddress(value) if self.web3.isAddress(value) else int(value) for value in array]

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

    def remove_0x_prefix(self, value):
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

    def signZeroExOrder(self, order, privateKey):
        orderHash = self.getZeroExOrderHash(order)
        signature = self.signMessage(orderHash[-64:], privateKey)
        return self.extend(order, {
            'orderHash': orderHash,
            'ecSignature': signature,  # todo fix v if needed
        })

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
            "0x" +
            self.remove_0x_prefix(hex(v)) +
            self.remove_0x_prefix(signature["r"]) +
            self.remove_0x_prefix(signature["s"]) +
            "03"
        )

    def hashMessage(self, message):
        message_bytes = bytes.fromhex(message)
        return self.web3.sha3(b"\x19Ethereum Signed Message:\n" + str(len(message_bytes)).encode() + message_bytes).hex()

    def signHash(self, hash, privateKey):
        signature = self.web3.eth.account.signHash(hash[-64:], private_key=privateKey[-64:])
        return {
            'v': signature.v,  # integer
            'r': self.web3.toHex(signature.r),  # '0x'-prefixed hex string
            's': self.web3.toHex(signature.s),  # '0x'-prefixed hex string
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
    def totp(key):
        def dec_to_bytes(n):
            if n > 0:
                return dec_to_bytes(n // 256) + bytes([n % 256])
            else:
                return b''

        def hex_to_dec(n):
            return int(n, base=16)

        def base32_to_bytes(n):
            missing_padding = len(n) % 8
            padding = 8 - missing_padding if missing_padding > 0 else 0
            padded = n.upper() + ('=' * padding)
            return base64.b32decode(padded)  # throws an error if the key is invalid

        epoch = int(time.time()) // 30
        hmac_res = Exchange.hmac(dec_to_bytes(epoch).rjust(8, b'\x00'), base32_to_bytes(key.replace(' ', '')), hashlib.sha1, 'hex')
        offset = hex_to_dec(hmac_res[-1]) * 2
        otp = str(hex_to_dec(hmac_res[offset: offset + 8]) & 0x7fffffff)
        return otp[-6:]
