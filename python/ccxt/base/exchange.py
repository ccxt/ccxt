# -*- coding: utf-8 -*-

"""Base exchange class"""

# -----------------------------------------------------------------------------

__version__ = '1.10.451'

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NotSupported
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import DDoSProtection
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import ExchangeNotAvailable

# -----------------------------------------------------------------------------

__all__ = [
    'Exchange',
]

# -----------------------------------------------------------------------------

# Python 2 & 3
import base64
import calendar
import collections
import datetime
import functools
import gzip
import hashlib
import hmac
import io
import json
import math
import re
from requests import Session
from requests.exceptions import ConnectionError, HTTPError, Timeout, TooManyRedirects, RequestException
import socket
import ssl
# import sys
import time
import uuid
import zlib
import decimal

# -----------------------------------------------------------------------------

try:
    import urllib.parse as _urlencode  # Python 3
    import urllib.request as _urllib
    import http.client as httplib
except ImportError:
    import urllib as _urlencode        # Python 2
    import urllib2 as _urllib
    import httplib

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
    aiohttp_session = None
    aiohttp_proxy = None
    session = None  # Session ()
    userAgent = None
    userAgents = {
        'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'chrome39': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
    }
    verbose = False
    markets = None
    symbols = None
    precision = {}
    limits = {}
    fees = {'trading': {}, 'funding': {}}
    ids = None
    currencies = None
    tickers = None
    api = None
    parseJsonResponse = True
    headers = {}
    balance = {}
    orderbooks = {}
    orders = {}
    trades = {}
    currencies = {}
    proxy = ''
    proxies = None
    apiKey = ''
    secret = ''
    password = ''
    uid = ''
    twofa = False
    marketsById = None
    markets_by_id = None

    hasPublicAPI = True
    hasPrivateAPI = True
    hasCORS = False
    hasFetchTicker = True
    hasFetchOrderBook = True
    hasFetchTrades = True
    hasFetchTickers = False
    hasFetchOHLCV = False
    hasDeposit = False
    hasWithdraw = False
    hasFetchBalance = True
    hasFetchOrder = False
    hasFetchOrders = False
    hasFetchOpenOrders = False
    hasFetchClosedOrders = False
    hasFetchMyTrades = False
    hasFetchCurrencies = False
    hasCreateOrder = hasPrivateAPI
    hasCancelOrder = hasPrivateAPI

    requiredCredentials = {
        'apiKey': True,
        'secret': True,
        'uid': False,
        'login': False,
        'password': False,
    }

    # API method metainfo
    has = {
        'cancelOrder': hasPrivateAPI,
        'createDepositAddress': False,
        'createOrder': hasPrivateAPI,
        'deposit': False,
        'fetchBalance': True,
        'fetchClosedOrders': False,
        'fetchCurrencies': False,
        'fetchDepositAddress': False,
        'fetchMarkets': True,
        'fetchMyTrades': False,
        'fetchOHLCV': False,
        'fetchOpenOrders': False,
        'fetchOrder': False,
        'fetchOrderBook': True,
        'fetchOrders': False,
        'fetchTicker': True,
        'fetchTickers': False,
        'fetchTrades': True,
        'withdraw': False,
    }

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

    def __init__(self, config={}):

        # version = '.'.join(map(str, sys.version_info[:3]))
        # self.userAgent = {
        #     'User-Agent': 'ccxt/' + __version__ + ' (+https://github.com/ccxt/ccxt) Python/' + version
        # }

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
            'maxCapacity': 1000,
        }, getattr(self, 'tokenBucket') if hasattr(self, 'tokenBucket') else {})

        self.session = self.session if self.session else Session()

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

                    if camelcase_suffix.find(camelcase_method) == 0:
                        camelcase_suffix = camelcase_suffix[len(camelcase_method):]

                    if underscore_suffix.find(lowercase_method) == 0:
                        underscore_suffix = underscore_suffix[len(lowercase_method):]

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

    def raise_error(self, exception_type, url, method='GET', error=None, details=None):
        details = details if details else ''
        if error:
            if type(error) is _urllib.HTTPError:
                details = ' '.join([
                    str(error.code),
                    error.msg,
                    error.read().decode('utf-8'),
                    details,
                ])
            else:
                details = ' '.join([
                    str(error),
                    details,
                ])
            raise exception_type(' '.join([
                self.id,
                method,
                url,
                details,
            ]))
        else:
            raise exception_type(' '.join([self.id, method, url, details]))

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
        return self.fetch_requests(request['url'], request['method'], request['headers'], request['body'])

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

    def fetch_requests(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""
        headers = headers or {}
        headers.update(self.headers)
        if self.userAgent:
            if type(self.userAgent) is str:
                headers.update({'User-Agent': self.userAgent})
            elif (type(self.userAgent) is dict) and ('User-Agent' in self.userAgent):
                headers.update(self.userAgent)
        if self.proxy:
            headers.update({'Origin': '*'})
        headers.update({'Accept-Encoding': 'gzip, deflate'})
        url = self.proxy + url
        if self.verbose:
            print(method, url, "\nRequest:", headers, body)
        if body:
            body = body.encode()

        self.session.cookies.clear()

        # do something with prepped.body
        # prepped.body = 'Seriously, send exactly these bytes.'

        # do something with prepped.headers
        # prepped.headers['Keep-Dead'] = 'parrot'

        response = None
        try:
            response = self.session.request(
                method,
                url,
                data=body,
                headers=headers,
                timeout=int(self.timeout / 1000),
                proxies=self.proxies
            )
            self.last_http_response = response.text
            response.raise_for_status()

        except Timeout as e:
            raise RequestTimeout(' '.join([self.id, method, url, 'request timeout']))

        except ConnectionError as e:
            self.raise_error(ExchangeNotAvailable, url, method, e)

        except TooManyRedirects as e:
            self.raise_error(ExchangeError, url, method, e)

        except HTTPError as e:
            self.handle_errors(response.status_code, response.reason, url, method, None, self.last_http_response)
            self.handle_rest_errors(e, response.status_code, self.last_http_response, url, method)
            self.raise_error(ExchangeError, url, method, e, self.last_http_response)

        except RequestException as e:
            self.raise_error(ExchangeError, url, method, e)

        if self.verbose:
            print(method, url, "\nResponse:", str(response.headers), self.last_http_response)

        return self.handle_rest_response(self.last_http_response, url, method, headers, body)

    def fetch(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""
        headers = headers or {}
        headers.update(self.headers)
        if self.userAgent:
            if type(self.userAgent) is str:
                headers.update({'User-Agent': self.userAgent})
            elif (type(self.userAgent) is dict) and ('User-Agent' in self.userAgent):
                headers.update(self.userAgent)
        if self.proxy:
            headers.update({'Origin': '*'})
        headers.update({'Accept-Encoding': 'gzip, deflate'})
        url = self.proxy + url
        if self.verbose:
            print(method, url, "\nRequest:", headers, body)
        if body:
            body = body.encode()
        request = _urllib.Request(url, body, headers)
        request.get_method = lambda: method
        response = None
        text = None
        try:  # send request and load response
            handler = _urllib.HTTPHandler if url.startswith('http://') else _urllib.HTTPSHandler
            opener = _urllib.build_opener(handler)
            response = opener.open(request, timeout=int(self.timeout / 1000))
            text = response.read()
            text = self.gzip_deflate(response, text)
            text = text.decode('utf-8')
            self.last_http_response = text
        except socket.timeout as e:
            raise RequestTimeout(' '.join([self.id, method, url, 'request timeout']))
        except ssl.SSLError as e:
            self.raise_error(ExchangeNotAvailable, url, method, e)
        except _urllib.HTTPError as e:
            message = self.gzip_deflate(e, e.read())
            try:
                message = message.decode('utf-8')
            except UnicodeError:
                pass
            self.handle_errors(e.code, e.reason, url, method, None, message if message else text)
            self.handle_rest_errors(e, e.code, message if message else text, url, method)
            self.raise_error(ExchangeError, url, method, e, message if message else text)
        except _urllib.URLError as e:
            self.raise_error(ExchangeNotAvailable, url, method, e)
        except httplib.BadStatusLine as e:
            self.raise_error(ExchangeNotAvailable, url, method, e)
        if self.verbose:
            print(method, url, "\nResponse:", str(response.info()), text)
        return self.handle_rest_response(text, url, method, headers, body)

    def handle_rest_errors(self, exception, http_status_code, response, url, method='GET'):
        error = None
        if http_status_code == 429:
            error = DDoSProtection
        elif http_status_code in [404, 409, 422, 500, 501, 502, 520, 521, 522, 525]:
            error = ExchangeNotAvailable
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
        except Exception as e:
            ddos_protection = re.search('(cloudflare|incapsula)', response, flags=re.IGNORECASE)
            exchange_not_available = re.search('(offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing)', response, flags=re.IGNORECASE)
            if ddos_protection:
                raise DDoSProtection(' '.join([self.id, method, url, response]))
            if exchange_not_available:
                message = 'exchange downtime, exchange closed for maintenance or offline, DDoS protection or rate-limiting in effect'
                raise ExchangeNotAvailable(' '.join([
                    self.id,
                    method,
                    url,
                    response,
                    message,
                ]))
            if isinstance(e, ValueError):
                raise ExchangeError(' '.join([self.id, method, url, response, str(e)]))
            raise

    @staticmethod
    def decimal(number):
        return str(decimal.Decimal(str(number)))

    @staticmethod
    def safe_float(dictionary, key, default_value=None):
        return float(dictionary[key]) if key is not None and (key in dictionary) and dictionary[key] else default_value

    @staticmethod
    def safe_string(dictionary, key, default_value=None):
        return str(dictionary[key]) if key is not None and (key in dictionary) and dictionary[key] else default_value

    @staticmethod
    def safe_integer(dictionary, key, default_value=None):
        return int(dictionary[key]) if key is not None and (key in dictionary) and dictionary[key] else default_value

    @staticmethod
    def safe_value(dictionary, key, default_value=None):
        return dictionary[key] if key is not None and (key in dictionary) and dictionary[key] else default_value

    @staticmethod
    def truncate(num, precision=0):
        decimal_precision = math.pow(10, precision)
        return math.trunc(num * decimal_precision) / decimal_precision

    @staticmethod
    def uuid():
        return str(uuid.uuid4())

    @staticmethod
    def capitalize(string):  # first character only, rest characters unchanged
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
        if type(array) is dict:
            array = list(Exchange.keysort(array).items())
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
            array = list(Exchange.keysort(array).items())
        for element in array:
            if (key in element) and (element[key] is not None):
                k = element[key]
                result[k] = element
        return result

    @staticmethod
    def sort_by(array, key, descending=False):
        return sorted(array, key=lambda k: k[key], reverse=descending)

    @staticmethod
    def array_concat(a, b):
        return a + b

    @staticmethod
    def extract_params(string):
        return re.findall(r'{([a-zA-Z0-9_]+?)}', string)

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
        utc = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-6] + "{:<03d}".format(int(timestamp) % 1000) + 'Z'

    @staticmethod
    def Ymd(timestamp):
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime('%Y-%m-%d')

    @staticmethod
    def YmdHMS(timestamp, infix=' '):
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime('%Y-%m-%d' + infix + '%H:%M:%S')

    @staticmethod
    def parse8601(timestamp):
        yyyy = '([0-9]{4})-?'
        mm = '([0-9]{2})-?'
        dd = '([0-9]{2})(?:T|[\s])?'
        h = '([0-9]{2}):?'
        m = '([0-9]{2}):?'
        s = '([0-9]{2})'
        ms = '(\.[0-9]{1,3})?'
        tz = '(?:(\+|\-)([0-9]{2})\:?([0-9]{2})|Z)?'
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
    def json(input):
        return json.dumps(input, separators=(',', ':'))

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
                raise AuthenticationError(self.id + ' requires `' + key + '`')

    def account(self):
        return {
            'free': 0.0,
            'used': 0.0,
            'total': 0.0,
        }

    def common_currency_code(self, currency):
        if not self.substituteCommonCurrencyCodes:
            return currency
        if currency == 'XBT':
            return 'BTC'
        if currency == 'BCC':
            return 'BCH'
        if currency == 'DRK':
            return 'DASH'
        return currency

    def precision_from_string(self, string):
        parts = re.sub(r'0+$', '', string).split('.')
        return len(parts[1]) if len(parts) > 1 else 0

    def cost_to_precision(self, symbol, cost):
        return ('{:.' + str(self.markets[symbol]['precision']['price']) + 'f}').format(float(cost))

    def price_to_precision(self, symbol, price):
        return ('{:.' + str(self.markets[symbol]['precision']['price']) + 'f}').format(float(price))

    def amount_to_precision(self, symbol, amount):
        return self.truncate(amount, self.markets[symbol]['precision']['amount'])

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

    def fetch_markets(self):
        return self.markets

    def fetch_tickers(self, symbols=None, params={}):
        raise NotSupported(self.id + ' API does not allow to fetch all tickers at once with a single call to fetch_tickers () for now')

    def fetch_order_status(self, id, market=None):
        order = self.fetch_order(id)
        return order['status']

    def fetch_order(self, id, symbol=None, params={}):
        raise NotSupported(self.id + ' fetch_order() is not implemented yet')

    def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetch_orders() is not implemented yet')

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetch_open_orders() not implemented yet')

    def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetch_closed_orders() not implemented yet')

    def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetch_my_trades() not implemented yet')

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return ohlcv

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
        return [self.parse_bid_ask(bidask, price_key, amount_key) for bidask in bidasks]

    def fetch_l2_order_book(self, symbol, params={}):
        orderbook = self.fetch_order_book(symbol, params)
        return self.extend(orderbook, {
            'bids': self.sort_by(self.aggregate(orderbook['bids']), 0, True),
            'asks': self.sort_by(self.aggregate(orderbook['asks']), 0),
        })

    def parse_order_book(self, orderbook, timestamp=None, bids_key='bids', asks_key='asks', price_key=0, amount_key=1):
        timestamp = timestamp or self.milliseconds()
        return {
            'bids': self.parse_bids_asks(orderbook[bids_key], price_key, amount_key) if (bids_key in orderbook) and isinstance(orderbook[bids_key], list) else [],
            'asks': self.parse_bids_asks(orderbook[asks_key], price_key, amount_key) if (asks_key in orderbook) and isinstance(orderbook[asks_key], list) else [],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
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
        raise NotSupported(self.id + ' API does not allow to fetch OHLCV series for now')

    def parse_trades(self, trades, market=None, since=None, limit=None):
        array = self.to_array(trades)
        array = [self.parse_trade(trade, market) for trade in array]
        return self.filter_by_since_limit(array, since, limit)

    def parse_orders(self, orders, market=None, since=None, limit=None):
        array = self.to_array(orders)
        array = [self.parse_order(order, market) for order in array]
        return self.filter_by_since_limit(array, since, limit)

    def filter_by_since_limit(self, array, since=None, limit=None):
        if since:
            array = [entry for entry in array if entry['timestamp'] > since]
        if limit:
            array = array[0:limit]
        return array

    def filter_orders_by_symbol(self, orders, symbol=None):
        if symbol:
            grouped = self.group_by(orders, 'symbol')
            if symbol in grouped:
                return grouped[symbol]
            return []
        return orders

    def currency(self, code):
        if not self.currencies:
            raise ExchangeError(self.id + ' currencies not loaded')
        if isinstance(code, basestring) and (code in self.currencies):
            return self.currencies[code]
        raise ExchangeError(self.id + ' does not have currency code ' + str(code))

    def market(self, symbol):
        if not self.markets:
            raise ExchangeError(self.id + ' markets not loaded')
        if isinstance(symbol, basestring) and (symbol in self.markets):
            return self.markets[symbol]
        raise ExchangeError(self.id + ' does not have market symbol ' + str(symbol))

    def market_ids(self, symbols):
        return [self.marketId(symbol) for symbol in symbols]

    def market_id(self, symbol):
        market = self.market(symbol)
        return market['id'] if type(market) is dict else symbol

    def calculate_fee(self, symbol, type, side, amount, price, taker_or_maker='taker', params={}):
        market = self.markets[symbol]
        rate = market[taker_or_maker]
        cost = float(self.cost_to_precision(symbol, amount * price))
        return {
            'rate': rate,
            'type': taker_or_maker,
            'currency': market['quote'],
            'cost': float(self.fee_to_precision(symbol, rate * cost)),
        }

    def edit_limit_buy_order(self, id, symbol, *args):
        return self.edit_limit_order(symbol, 'buy', *args)

    def edit_limit_sell_order(self, id, symbol, *args):
        return self.edit_limit_order(symbol, 'sell', *args)

    def edit_limit_order(self, id, symbol, *args):
        return self.edit_order(id, symbol, 'limit', *args)

    def edit_order(self, id, symbol, *args):
        if not self.enableRateLimit:
            raise ExchangeError(self.id + ' edit_order() requires enableRateLimit = true')
        self.cancel_order(id, symbol)
        return self.create_order(symbol, *args)

    def create_limit_buy_order(self, symbol, *args):
        return self.create_order(symbol, 'limit', 'buy', *args)

    def create_limit_sell_order(self, symbol, *args):
        return self.create_order(symbol, 'limit', 'sell', *args)

    def create_market_buy_order(self, symbol, amount, params={}):
        return self.create_order(symbol, 'market', 'buy', amount, None, params)

    def create_market_sell_order(self, symbol, amount, params={}):
        return self.create_order(symbol, 'market', 'sell', amount, None, params)

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        raise NotImplemented(self.id + ' sign() pure method must be redefined in derived classes')
