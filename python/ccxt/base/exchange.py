# -*- coding: utf-8 -*-

"""Base exchange class"""

# -----------------------------------------------------------------------------

__version__ = '1.13.108'

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NotSupported
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import DDoSProtection
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import InvalidAddress

# -----------------------------------------------------------------------------

from ccxt.base.decimal_to_precision import DECIMAL_PLACES

# -----------------------------------------------------------------------------

__all__ = [
    'Exchange',
]

# -----------------------------------------------------------------------------

# Python 2 & 3
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
    import urllib.parse as _urlencode  # Python 3
except ImportError:
    import urllib as _urlencode        # Python 2

# -----------------------------------------------------------------------------

try:
    basestring  # Python 3
except NameError:
    basestring = str  # Python 2

# -----------------------------------------------------------------------------


class Exchange(object):
    """Base exchange class"""
    id = None
    version = None

    # rate limiter settings
    enableRateLimit = False
    rateLimit = 2000  # milliseconds = seconds * 1000
    timeout = 10000   # milliseconds = seconds * 1000
    asyncio_loop = None
    aiohttp_proxy = None
    session = None  # Session () by default
    logger = None  # logging.getLogger(__name__) by default
    userAgent = None
    userAgents = {
        'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'chrome39': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
    }
    verbose = False
    markets = None
    symbols = None
    fees = {
        'trading': {
            'fee_loaded': False,
            'percentage': True,  # subclasses should rarely have to redefine this
        },
        'funding': {
            'fee_loaded': False,
            'withdraw': {},
            'deposit': {},
        },
    }
    ids = None
    currencies = None
    tickers = None
    api = None
    parseJsonResponse = True
    proxy = ''
    origin = '*'  # CORS origin
    proxies = None
    apiKey = ''
    secret = ''
    password = ''
    uid = ''
    twofa = False
    marketsById = None
    markets_by_id = None
    currencies_by_id = None
    precision = None
    limits = None
    exceptions = None
    headers = None
    balance = None
    orderbooks = None
    orders = None
    trades = None
    currencies = None
    options = None  # Python does not allow to define properties in run-time with setattr

    requiredCredentials = {
        'apiKey': True,
        'secret': True,
        'uid': False,
        'login': False,
        'password': False,
        'twofa': False,  # 2-factor authentication (one-time password key)
    }

    # API method metainfo
    has = {
        'publicAPI': True,
        'privateAPI': True,
        'CORS': False,
        'cancelOrder': True,
        'cancelOrders': False,
        'createDepositAddress': False,
        'createOrder': True,
        'createMarketOrder': True,
        'createLimitOrder': True,
        'deposit': False,
        'editOrder': 'emulated',
        'fetchBalance': True,
        'fetchClosedOrders': False,
        'fetchCurrencies': False,
        'fetchDepositAddress': False,
        'fetchFundingFees': False,
        'fetchL2OrderBook': True,
        'fetchMarkets': True,
        'fetchMyTrades': False,
        'fetchOHLCV': 'emulated',
        'fetchOpenOrders': False,
        'fetchOrder': False,
        'fetchOrderBook': True,
        'fetchOrderBooks': False,
        'fetchOrders': False,
        'fetchTicker': True,
        'fetchTickers': False,
        'fetchTrades': True,
        'fetchTradingFees': False,
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
    last_http_response = None
    last_json_response = None
    last_response_headers = None

    commonCurrencies = {
        'XBT': 'BTC',
        'BCC': 'BCH',
        'DRK': 'DASH',
    }

    def __init__(self, config={}):

        self.precision = {} if self.precision is None else self.precision
        self.limits = {} if self.limits is None else self.limits
        self.exceptions = {} if self.exceptions is None else self.exceptions
        self.headers = {} if self.headers is None else self.headers
        self.balance = {} if self.balance is None else self.balance
        self.orderbooks = {} if self.orderbooks is None else self.orderbooks
        self.orders = {} if self.orders is None else self.orders
        self.trades = {} if self.trades is None else self.trades
        self.currencies = {} if self.currencies is None else self.currencies
        self.options = {} if self.options is None else self.options  # Python does not allow to define properties in run-time with setattr

        # version = '.'.join(map(str, sys.version_info[:3]))
        # self.userAgent = {
        #     'User-Agent': 'ccxt/' + __version__ + ' (+https://github.com/ccxt/ccxt) Python/' + version
        # }

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

        # format camel case
        for attr in dir(self):
            if attr[0] != '_'and attr[-1] != '_' and '_' in attr:
                conv = attr.split('_')
                camel_case = conv[0] + ''.join(i[0].upper() + i[1:] for i in conv[1:])
                setattr(self, camel_case, getattr(self, attr))

        self.tokenBucket = self.extend({
            'refillRate': 1.0 / self.rateLimit,
            'delay': 1.0,
            'capacity': 1.0,
            'defaultCost': 1.0,
        }, getattr(self, 'tokenBucket') if hasattr(self, 'tokenBucket') else {})

        self.session = self.session if self.session else Session()
        self.logger = self.logger if self.logger else logging.getLogger(__name__)

    def __del__(self):
        if self.session:
            self.session.close()

    def describe(self):
        return {}

    def define_rest_api(self, api, method_name, options={}):
        delimiters = re.compile('[^a-zA-Z0-9]')
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

                    partial = functools.partial(getattr(self, method_name), url, api_type, uppercase_method)
                    setattr(self, camelcase, partial)
                    setattr(self, underscore, partial)

    def raise_error(self, exception_type, url=None, method=None, error=None, details=None):
        if error:
            error = str(error)
        output = ' '.join([self.id] + [var for var in (url, method, error, details) if var is not None])
        raise exception_type(output)

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

    def handle_errors(self, code, reason, url, method, headers, body):
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

        response = None
        try:
            response = self.session.request(
                method,
                url,
                data=body,
                headers=request_headers,
                timeout=int(self.timeout / 1000),
                proxies=self.proxies
            )
            self.last_http_response = response.text
            self.last_response_headers = response.headers
            if self.verbose:
                print("\nResponse:", method, url, str(response.status_code), str(response.headers), self.last_http_response)
            self.logger.debug("%s %s, Response: %s %s %s", method, url, response.status_code, response.headers, self.last_http_response)
            response.raise_for_status()

        except Timeout as e:
            self.raise_error(RequestTimeout, method, url, e)

        except TooManyRedirects as e:
            self.raise_error(ExchangeError, url, method, e)

        except SSLError as e:
            self.raise_error(ExchangeError, url, method, e)

        except HTTPError as e:
            self.handle_errors(response.status_code, response.reason, url, method, self.last_response_headers, self.last_http_response)
            self.handle_rest_errors(e, response.status_code, self.last_http_response, url, method)
            self.raise_error(ExchangeError, url, method, e, self.last_http_response)

        except RequestException as e:  # base exception class
            self.raise_error(ExchangeError, url, method, e, self.last_http_response)

        self.handle_errors(response.status_code, response.reason, url, method, None, self.last_http_response)
        return self.handle_rest_response(self.last_http_response, url, method, headers, body)

    def handle_rest_errors(self, exception, http_status_code, response, url, method='GET'):
        error = None
        if http_status_code in [418, 429]:
            error = DDoSProtection
        elif http_status_code in [404, 409, 500, 501, 502, 520, 521, 522, 525]:
            error = ExchangeNotAvailable
        elif http_status_code in [422]:
            error = ExchangeError
        elif http_status_code in [400, 403, 405, 503, 530]:
            # special case to detect ddos protection
            error = ExchangeNotAvailable
            if response:
                ddos_protection = re.search('(cloudflare|incapsula)', response, flags=re.IGNORECASE)
                if ddos_protection:
                    error = DDoSProtection
        elif http_status_code in [408, 504]:
            error = RequestTimeout
        elif http_status_code in [401, 511]:
            error = AuthenticationError
        if error:
            self.raise_error(error, url, method, exception if exception else http_status_code, response)

    def handle_rest_response(self, response, url, method='GET', headers=None, body=None):
        try:
            if self.parseJsonResponse:
                self.last_json_response = json.loads(response) if len(response) > 1 else None
                return self.last_json_response
            else:
                return response
        except ValueError as e:  # ValueError == JsonDecodeError
            ddos_protection = re.search('(cloudflare|incapsula|overload|ddos)', response, flags=re.IGNORECASE)
            exchange_not_available = re.search('(offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing)', response, flags=re.IGNORECASE)
            if ddos_protection:
                self.raise_error(DDoSProtection, method, url, None, response)
            if exchange_not_available:
                message = response + ' exchange downtime, exchange closed for maintenance or offline, DDoS protection or rate-limiting in effect'
                self.raise_error(ExchangeNotAvailable, method, url, None, message)
            self.raise_error(ExchangeError, method, url, e, response)

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

    @staticmethod
    def truncate(num, precision=0):
        if precision > 0:
            decimal_precision = math.pow(10, precision)
            return math.trunc(num * decimal_precision) / decimal_precision
        return int(Exchange.truncate_to_string(num, precision))

    @staticmethod
    def truncate_to_string(num, precision=0):
        if precision > 0:
            parts = ('%f' % Decimal(num)).split('.')
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
    def extract_params(string):
        return re.findall(r'{([\w-]+)}', string)

    @staticmethod
    def implode_params(string, params):
        for key in params:
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
    def iso8601(timestamp):
        if timestamp is None:
            return timestamp
        utc = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-6] + "{:<03d}".format(int(timestamp) % 1000) + 'Z'

    @staticmethod
    def ymd(timestamp):
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime('%Y-%m-%d')

    @staticmethod
    def ymdhms(timestamp, infix=' '):
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime('%Y-%m-%d' + infix + '%H:%M:%S')

    @staticmethod
    def parse_date(timestamp):
        if timestamp is None:
            return timestamp
        if 'GMT' in timestamp:
            string = ''.join([str(value) for value in parsedate(timestamp)[:6]]) + '.000Z'
            dt = datetime.datetime.strptime(string, "%Y%m%d%H%M%S.%fZ")
            return calendar.timegm(dt.utctimetuple()) * 1000
        else:
            return Exchange.parse8601(timestamp)

    @staticmethod
    def parse8601(timestamp):
        yyyy = '([0-9]{4})-?'
        mm = '([0-9]{2})-?'
        dd = '([0-9]{2})(?:T|[\\s])?'
        h = '([0-9]{2}):?'
        m = '([0-9]{2}):?'
        s = '([0-9]{2})'
        ms = '(\\.[0-9]{1,3})?'
        tz = '(?:(\\+|\\-)([0-9]{2})\\:?([0-9]{2})|Z)?'
        regex = r'' + yyyy + mm + dd + h + m + s + ms + tz
        match = re.search(regex, timestamp, re.IGNORECASE)
        yyyy, mm, dd, h, m, s, ms, sign, hours, minutes = match.groups()
        ms = ms or '.000'
        msint = int(ms[1:])
        sign = sign or ''
        sign = int(sign + '1')
        hours = int(hours or 0) * sign
        minutes = int(minutes or 0) * sign
        offset = datetime.timedelta(hours=hours, minutes=minutes)
        string = yyyy + mm + dd + h + m + s + ms + 'Z'
        dt = datetime.datetime.strptime(string, "%Y%m%d%H%M%S.%fZ")
        dt = dt + offset
        return calendar.timegm(dt.utctimetuple()) * 1000 + msint

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
    def binary_to_string(s):
        return s.decode('ascii')

    @staticmethod
    def base64urlencode(s):
        return Exchange.decode(base64.urlsafe_b64encode(s)).replace('=', '')

    @staticmethod
    def jwt(request, secret, algorithm=hashlib.sha256, alg='HS256'):
        header = Exchange.encode(Exchange.json({
            'alg': alg,
            'typ': 'JWT',
        }))
        encodedHeader = Exchange.base64urlencode(header)
        encodedData = Exchange.base64urlencode(Exchange.encode(Exchange.json(request)))
        token = encodedHeader + '.' + encodedData
        hmac = Exchange.hmac(Exchange.encode(token), Exchange.encode(secret), algorithm, 'binary')
        signature = Exchange.base64urlencode(hmac)
        return token + '.' + signature

    @staticmethod
    def unjson(input):
        return json.loads(input)

    @staticmethod
    def json(data, params=None):
        return json.dumps(data, separators=(',', ':'))

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

    def check_required_credentials(self):
        keys = list(self.requiredCredentials.keys())
        for key in keys:
            if self.requiredCredentials[key] and not getattr(self, key):
                self.raise_error(AuthenticationError, details='requires `' + key + '`')

    def check_address(self, address):
        """Checks an address is not the same character repeated or an empty sequence"""
        if address is None:
            self.raise_error(InvalidAddress, details='address is None')
        if all(letter == address[0] for letter in address) or len(address) < self.minFundingAddressLength or ' ' in address:
            self.raise_error(InvalidAddress, details='address is invalid or has less than ' + str(self.minFundingAddressLength) + ' characters: "' + str(address) + '"')
        return address

    def account(self):
        return {
            'free': 0.0,
            'used': 0.0,
            'total': 0.0,
        }

    def common_currency_code(self, currency):
        if not self.substituteCommonCurrencyCodes:
            return currency
        return self.safe_string(self.commonCurrencies, currency, currency)

    def currency_id(self, commonCode):
        currencyIds = {v: k for k, v in self.commonCurrencies.items()}
        return self.safe_string(currencyIds, commonCode, commonCode)

    def precision_from_string(self, string):
        parts = re.sub(r'0+$', '', string).split('.')
        return len(parts[1]) if len(parts) > 1 else 0

    def cost_to_precision(self, symbol, cost):
        return ('{:.' + str(self.markets[symbol]['precision']['price']) + 'f}').format(float(cost))

    def price_to_precision(self, symbol, price):
        return ('{:.' + str(self.markets[symbol]['precision']['price']) + 'f}').format(float(price))

    def amount_to_precision(self, symbol, amount):
        return self.truncate(amount, self.markets[symbol]['precision']['amount'])

    def amount_to_string(self, symbol, amount):
        return self.truncate_to_string(amount, self.markets[symbol]['precision']['amount'])

    def amount_to_lots(self, symbol, amount):
        lot = self.markets[symbol]['lot']
        return self.amount_to_precision(symbol, math.floor(amount / lot) * lot)

    def fee_to_precision(self, symbol, fee):
        return ('{:.' + str(self.markets[symbol]['precision']['price']) + 'f}').format(float(fee))

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
                'code': market['base'],
            } for market in values if 'base' in market]
            quote_currencies = [{
                'id': market['quoteId'] if 'quoteId' in market else market['quote'],
                'code': market['quote'],
            } for market in values if 'quote' in market]
            currencies = self.sort_by(base_currencies + quote_currencies, 'code')
            self.currencies = self.deep_extend(self.index_by(currencies, 'code'), self.currencies)
        self.currencies_by_id = self.index_by(list(self.currencies.values()), 'id')
        return self.markets

    def load_markets(self, reload=False):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets(self.markets)
                return self.markets
        markets = self.fetch_markets()
        currencies = None
        if self.has['fetchCurrencies']:
            currencies = self.fetch_currencies()
        return self.set_markets(markets, currencies)

    def populate_fees(self):
        if not (hasattr(self, 'markets') or hasattr(self, 'currencies')):
            return

        for currency, data in self.currencies.items():  # try load withdrawal fees from currencies
            if 'fee' in data and data['fee'] is not None:
                self.fees['funding']['withdraw'][currency] = data['fee']
                self.fees['funding']['fee_loaded'] = True

        # find a way to populate trading fees from markets

    def load_fees(self):
        self.load_markets()
        self.populate_fees()
        if not (self.has['fetchTradingFees'] or self.has['fetchFundingFees']):
            return self.fees

        fetched_fees = self.fetch_fees()
        if fetched_fees['funding']:
            self.fees['funding']['fee_loaded'] = True
        if fetched_fees['trading']:
            self.fees['trading']['fee_loaded'] = True

        self.fees = self.deep_extend(self.fees, fetched_fees)
        return self.fees

    def fetch_markets(self):
        return self.to_array(self.markets)

    def fetch_fees(self):
        trading = {}
        funding = {}
        try:
            trading = self.fetch_trading_fees()
        except AuthenticationError:
            pass
        except AttributeError:
            pass

        try:
            funding = self.fetch_funding_fees()
        except AuthenticationError:
            pass
        except AttributeError:
            pass

        return {
            'trading': trading,
            'funding': funding,
        }

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.raise_error(NotSupported, details='create_order() not implemented yet')

    def cancel_order(self, id, symbol=None, params={}):
        self.raise_error(NotSupported, details='cancel_order() not implemented yet')

    def fetch_bids_asks(self, symbols=None, params={}):
        self.raise_error(NotSupported, details='API does not allow to fetch all prices at once with a single call to fetch_bid_asks() for now')

    def fetch_tickers(self, symbols=None, params={}):
        self.raise_error(NotSupported, details='API does not allow to fetch all tickers at once with a single call to fetch_tickers() for now')

    def fetch_order_status(self, id, market=None):
        order = self.fetch_order(id)
        return order['status']

    def purge_cached_orders(self, before):
        orders = self.to_array(self.orders)
        orders = [order for order in orders if (order['status'] == 'open') or (order['timestamp'] >= before)]
        self.orders = self.index_by(orders, 'id')
        return self.orders

    def fetch_order(self, id, symbol=None, params={}):
        self.raise_error(NotSupported, details='fetch_order() is not implemented yet')

    def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        self.raise_error(NotSupported, details='fetch_orders() is not implemented yet')

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        self.raise_error(NotSupported, details='fetch_open_orders() is not implemented yet')

    def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        self.raise_error(NotSupported, details='fetch_closed_orders() is not implemented yet')

    def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        self.raise_error(NotSupported, details='fetch_my_trades() is not implemented yet')

    def fetch_order_trades(self, id, symbol=None, params={}):
        self.raise_error(NotSupported, details='fetch_order_trades() is not implemented yet')

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
        return result

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
                self.raise_error(ExchangeError, details='unrecognized bidask format: ' + str(bidasks[0]))
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

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        if not self.has['fetchTrades']:
            self.raise_error(NotSupported, details='fetch_ohlcv() not implemented yet')
        self.load_markets()
        trades = self.fetch_trades(symbol, since, limit, params)
        return self.build_ohlcv(trades, timeframe, since, limit)

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

    def parse_timeframe(self, timeframe):
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

    def parse_trades(self, trades, market=None, since=None, limit=None):
        array = self.to_array(trades)
        array = [self.parse_trade(trade, market) for trade in array]
        array = self.sort_by(array, 'timestamp')
        symbol = market['symbol'] if market else None
        return self.filter_by_symbol_since_limit(array, symbol, since, limit)

    def parse_orders(self, orders, market=None, since=None, limit=None):
        array = self.to_array(orders)
        array = [self.parse_order(order, market) for order in array]
        array = self.sort_by(array, 'timestamp')
        symbol = market['symbol'] if market else None
        return self.filter_by_symbol_since_limit(array, symbol, since, limit)

    def filter_by_symbol_since_limit(self, array, symbol=None, since=None, limit=None):
        array = self.to_array(array)
        if symbol:
            array = [entry for entry in array if entry['symbol'] == symbol]
        if since:
            array = [entry for entry in array if entry['timestamp'] >= since]
        if limit:
            array = array[0:limit]
        return array

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
            self.raise_error(ExchangeError, details='Currencies not loaded')
        if isinstance(code, basestring) and (code in self.currencies):
            return self.currencies[code]
        self.raise_error(ExchangeError, details='Does not have currency code ' + str(code))

    def find_market(self, string):
        if not self.markets:
            self.raise_error(ExchangeError, details='Markets not loaded')
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
            self.raise_error(ExchangeError, details='Markets not loaded')
        if isinstance(symbol, basestring) and (symbol in self.markets):
            return self.markets[symbol]
        self.raise_error(ExchangeError, details='No market symbol ' + str(symbol))

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
            self.raise_error(ExchangeError, details='edit_order() requires enableRateLimit = true')
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
