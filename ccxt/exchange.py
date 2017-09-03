# -*- coding: utf-8 -*-

"""
MIT License

Copyright (c) 2017 Igor Kroitor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

#------------------------------------------------------------------------------

from ccxt.version import __version__

#------------------------------------------------------------------------------

from ccxt.errors import CCXTError
from ccxt.errors import ExchangeError
from ccxt.errors import NotSupported
from ccxt.errors import AuthenticationError
from ccxt.errors import InsufficientFunds
from ccxt.errors import NetworkError
from ccxt.errors import DDoSProtection
from ccxt.errors import RequestTimeout
from ccxt.errors import ExchangeNotAvailable

#------------------------------------------------------------------------------

__all__ = [
    'Exchange',
]

#------------------------------------------------------------------------------

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
import socket
import ssl
import sys
import time
import zlib
import decimal

#------------------------------------------------------------------------------

try:
    import urllib.parse   as _urlencode # Python 3
    import urllib.request as _urllib
    import http.client as httplib
except ImportError:
    import urllib  as _urlencode        # Python 2
    import urllib2 as _urllib
    import httplib

#------------------------------------------------------------------------------

try:
    basestring # Python 3
except NameError:
    basestring = str # Python 2

#------------------------------------------------------------------------------

class Exchange (object):

    id = None
    version = None
    rateLimit = 2000 # milliseconds = seconds * 1000
    timeout = 10000 # milliseconds = seconds * 1000
    asyncio_loop = None
    aiohttp_session = None
    userAgent = False
    verbose = False
    markets = None
    symbols = None
    ids = None
    currencies = None
    tickers = None
    orders = {}
    trades = {}
    proxy = ''
    apiKey = ''
    secret = ''
    password = ''
    uid = ''
    twofa = False
    marketsById = None
    markets_by_id = None
    hasFetchTickers = False
    hasFetchOHLCV = False
    substituteCommonCurrencyCodes = True

    def __init__(self, config={}):

        version = '.'.join(map(str, sys.version_info[:3]))
        self.userAgent = {
            'User-Agent': 'ccxt/' + __version__ + ' (+https://github.com/kroitor/ccxt) Python/' + version
        }

        for key in config:
            setattr(self, key, config[key])

        if self.api:
            self.define_rest_api(self.api, 'request')

        if self.markets:
            self.set_markets(self.markets)

    def define_rest_api(self, api, method_name, options={}):
        for apiType, methods in api.items():
            for http_method, urls in methods.items():
                for url in urls:
                    url = url.strip()
                    splitPath = re.compile('[^a-zA-Z0-9]').split(url)

                    uppercaseMethod = http_method.upper()
                    lowercaseMethod = http_method.lower()
                    camelcaseMethod = lowercaseMethod.capitalize()
                    camelcaseSuffix = ''.join([Exchange.capitalize(x) for x in splitPath])
                    lowercasePath = [x.strip().lower() for x in splitPath]
                    underscoreSuffix = '_'.join([k for k in lowercasePath if len(k)])

                    if camelcaseSuffix.find(camelcaseMethod) == 0:
                        camelcaseSuffix = camelcaseSuffix[len(camelcaseMethod):]

                    if underscoreSuffix.find(lowercaseMethod) == 0:
                        underscoreSuffix = underscoreSuffix[len(lowercaseMethod):]

                    camelcase = apiType + camelcaseMethod + Exchange.capitalize(camelcaseSuffix)
                    underscore = apiType + '_' + lowercaseMethod + '_' + underscoreSuffix.lower()

                    if 'suffixes' in options:
                        if 'camelcase' in options['suffixes']:
                            camelcase += options['suffixes']['camelcase']
                        if 'underscore' in options['suffixes']:
                            underscore += options['suffixes']['underscore']

                    partial = functools.partial(getattr(self, method_name), url, apiType, uppercaseMethod)
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
                details = str(error)
            raise exception_type(' '.join([
                self.id,
                method,
                url,
                details,
            ]))
        else:
            raise exception_type(' '.join([self.id, method, url, details]))

    def fetch(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""
        headers = headers or {}
        if self.userAgent:
            if type(self.userAgent) is str:
                headers.update({'User-Agent': self.userAgent})
            elif (type(self.userAgent) is dict) and ('User-Agent' in self.userAgent):
                headers.update(self.userAgent)
        if len(self.proxy):
            headers.update({'Origin': '*'})
        headers.update({'Accept-Encoding': 'gzip, deflate'})
        url = self.proxy + url
        if self.verbose:
            print(url, method, url, "\nRequest:", headers, body)
        if body:
            body = body.encode()
        request = _urllib.Request(url, body, headers)
        request.get_method = lambda: method
        response = None
        text = None
        try: # send request and load response
            handler = _urllib.HTTPHandler if url.startswith('http://') else _urllib.HTTPSHandler
            opener = _urllib.build_opener(handler)
            response = opener.open(request, timeout=int(self.timeout / 1000))
            text = response.read()
        except socket.timeout as e:
            raise RequestTimeout(' '.join([self.id, method, url, 'request timeout']))
        except ssl.SSLError as e:
            self.raise_error(ExchangeNotAvailable, url, method, e)
        except _urllib.HTTPError as e:
            error = None
            details = text if text else None
            if e.code == 429:
                error = DDoSProtection
            elif e.code in [404, 409, 422, 500, 501, 502, 520, 521, 522, 525]:
                details = e.read().decode('utf-8', 'ignore') if e else None
                error = ExchangeNotAvailable
            elif e.code in [400, 403, 405, 503]:
                # special case to detect ddos protection
                reason = e.read().decode('utf-8', 'ignore')
                ddos_protection = re.search('(cloudflare|incapsula)', reason, flags=re.IGNORECASE)
                if ddos_protection:
                    error = DDoSProtection
                else:
                    error = ExchangeNotAvailable
                    details = '(possible reasons: ' + ', '.join([
                        'invalid API keys',
                        'bad or old nonce',
                        'exchange is down or offline',
                        'on maintenance',
                        'DDoS protection',
                        'rate-limiting',
                        reason,
                    ]) + ')'
            elif e.code in [408, 504]:
                error = RequestTimeout
            elif e.code in [401, 511]:
                error = AuthenticationError
            else:
                error = ExchangeError
            self.raise_error(error, url, method, e, details)
        except _urllib.URLError as e:
            self.raise_error(ExchangeNotAvailable, url, method, e)
        except httplib.BadStatusLine as e:
            self.raise_error(ExchangeNotAvailable, url, method, e)
        encoding = response.info().get('Content-Encoding')
        if encoding in ('gzip', 'x-gzip', 'deflate'):
            if encoding == 'deflate':
                text = zlib.decompress(text, -zlib.MAX_WBITS)
            else:
                data = gzip.GzipFile('', 'rb', 9, io.BytesIO(text))
                text = data.read()
        body = text.decode('utf-8')
        if self.verbose:
            print(method, url, "\nResponse:", headers, body)
        return self.handle_response(url, method, headers, body)

    def handle_response(self, url, method='GET', headers=None, body=None):
        try:
            if (len(body) < 2):
                raise ExchangeError(''.join([self.id, method, url, 'returned empty response']))
            return json.loads(body)
        except Exception as e:
            ddos_protection = re.search('(cloudflare|incapsula)', body, flags=re.IGNORECASE)
            exchange_not_available = re.search('(offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing)', body, flags=re.IGNORECASE)
            if ddos_protection:
                raise DDoSProtection(' '.join([self.id, method, url, body]))
            if exchange_not_available:
                message = 'exchange downtime, exchange closed for maintenance or offline, DDoS protection or rate-limiting in effect'
                raise ExchangeNotAvailable(' '.join([
                    self.id,
                    method,
                    url,
                    body,
                    message,
                ]))
            if isinstance(e, ValueError):
                raise ExchangeError(' '.join([self.id, method, url, body, str(e)]))
            raise

    @staticmethod
    def decimal(number):
        return str(decimal.Decimal(str(number)))

    @staticmethod
    def capitalize(string): # first character only, rest characters unchanged
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
    def indexBy(l, key):
        return Exchange.index_by(l, key)

    @staticmethod
    def sort_by(l, key, descending=False):
        return sorted(l, key=lambda k: k[key], reverse=descending)

    @staticmethod
    def sortBy(l, key, descending=False):
        return Exchange.sort_by(l, key, descending)

    @staticmethod
    def extract_params(string):
        return re.findall(r'{([a-zA-Z0-9_]+?)}', string)

    @staticmethod
    def implode_params(string, params):
        for key in params:
            string = string.replace('{' + key + '}', str(params[key]))
        return string

    @staticmethod
    def extractParams(string):
        return Exchange.extract_params(string)

    @staticmethod
    def implodeParams(string, params):
        return Exchange.implode_params(string, params)

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
    def encode_uri_component(uri):
        return _urlencode.quote(uri, safe="~()*!.'")

    @staticmethod
    def omit(d, *args):
        result = d.copy()
        for arg in args:
            if type(arg) is list:
                for key in arg:
                    if key in result: del result[key]
            else:
                if arg in result: del result[arg]
        return result

    @staticmethod
    def unique(array):
        return list(set(array))

    @staticmethod
    def pluck(array, key):
        return [element[key] for element in array if (key in element) and (element[key] is not None)]

    @staticmethod
    def sum(*args):
        return sum([arg for arg in args if isinstance(arg, int) or isinstance(arg, float)])

    @staticmethod
    def ordered(array):
        return collections.OrderedDict(array)

    @staticmethod
    def s():
        return Exchange.seconds()

    @staticmethod
    def sec():
        return Exchange.seconds()

    @staticmethod
    def ms():
        return Exchange.milliseconds()

    @staticmethod
    def msec():
        return Exchange.milliseconds()

    @staticmethod
    def us():
        return Exchange.microseconds()

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
        return (utc.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z')

    @staticmethod
    def yyyymmddhhmmss(timestamp):
        return datetime.datetime.fromtimestamp(int(round(timestamp / 1000))).strftime('%Y-%m-%d %H:%M:%S')

    @staticmethod
    def parse8601(timestamp):
        yyyy = '([0-9]{4})-?'
        mm = '([0-9]{2})-?'
        dd = '([0-9]{2})(?:T|[\s])?'
        h = '([0-9]{2}):?'
        m = '([0-9]{2}):?'
        s = '([0-9]{2})'
        ms = '(\.[0-9]{3})?'
        tz = '(?:(\+|\-)([0-9]{2})\:?([0-9]{2})|Z)?'
        regex = r'' + yyyy + mm + dd + h + m + s + ms + tz
        match = re.search(regex, timestamp, re.IGNORECASE)
        yyyy, mm, dd, h, m, s, ms, sign, hours, minutes = match.groups()
        ms = ms or '.000'
        sign = sign or ''
        sign = int(sign + '1')
        hours = int(hours or 0) * sign
        minutes = int(minutes or 0) * sign
        offset = datetime.timedelta(hours=hours, minutes=minutes)
        string = yyyy + mm + dd + h + m + s + ms + 'Z'
        dt = datetime.datetime.strptime(string, "%Y%m%d%H%M%S.%fZ")
        dt = dt + offset
        return calendar.timegm(dt.utctimetuple()) * 1000

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
    def json(input):
        return json.dumps(input, separators=(',', ':'))

    @staticmethod
    def encode(string):
        return string.encode()

    @staticmethod
    def decode(string):
        return string.decode()

    def nonce(self):
        return Exchange.seconds()

    def account(self):
        return {
            'free': 0.0,
            'used': 0.0,
            'total': 0.0,
        }

    def commonCurrencyCode(self, currency):
        if not self.substituteCommonCurrencyCodes:
            return currency
        if currency == 'XBT':
            return 'BTC'
        if currency == 'BCC':
            return 'BCH'
        if currency == 'DRK':
            return 'DASH'
        return currency

    def set_markets(self, markets):
        values = markets
        if type(values) is dict:
            values = list(markets.values())
        self.markets = self.indexBy(values, 'symbol')
        self.markets_by_id = Exchange.indexBy(values, 'id')
        self.marketsById = self.markets_by_id
        self.symbols = sorted(list(self.markets.keys()))
        self.ids = sorted(list(self.markets_by_id.keys()))
        base = self.pluck([market for market in values if 'base' in market], 'base')
        quote = self.pluck([market for market in values if 'quote' in market], 'quote')
        self.currencies = sorted(self.unique(base + quote))
        return self.markets

    def setMarkets(self, markets):
        return self.set_markets(markets)

    def load_markets(self, reload=False):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets(self.markets)
                return self.markets
        markets = self.fetch_markets()
        return self.set_markets(markets)

    def loadMarkets(self, reload=False):
        return self.load_markets()

    def fetch_markets(self):
        return self.markets

    def fetchMarkets(self):
        return self.fetch_markets()

    def fetch_tickers(self, symbols=None):
        raise NotSupported(self.id + ' API does not allow to fetch all tickers at once with a single call to fetch_tickers () for now')

    def fetchTickers(self, symbols=None):
        return self.fetch_tickers(symbols)

    def fetchOrderStatus(self, id, market=None):
        return self.fetch_order_status(id, market)

    def fetch_order_status(self, id, market=None):
        order = self.fetch_order(id)
        return order['status']

    def fetch_open_orders(self, market=None, params={}):
        raise NotSupported(self.id + ' fetch_open_orders() not implemented yet')

    def fetchOpenOrders(self, market=None, params={}):
        return self.fetch_open_orders(market, params)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return ohlcv

    def parse_ohlcvs(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        result = []
        for t in range(0, len(ohlcvs)):
            result.append(self.parse_ohlcv(ohlcvs[t], market, timeframe, since, limit))
        return result

    def parseOHLCVs(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        return self.parse_ohlcvs(self, ohlcvs, market, timeframe, since, limit)

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        raise NotSupported(self.id + ' API does not allow to fetch OHLCV series for now')

    def fetchOHLCV(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        return self.fetch_ohlcv(self, timeframe, since, limit, params)

    def parse_trades(self, trades, market=None):
        result = []
        for t in range(0, len(trades)):
            result.append(self.parse_trade(trades[t], market))
        return result

    def parseTrades(self, trades, market=None):
        return self.parse_trades(trades, market)

    def parse_orders(self, orders, market=None):
        result = []
        for t in range(0, len(orders)):
            result.append(self.parse_order(orders[t], market))
        return result

    def parseOrders(self, orders, market=None):
        return self.parse_orders(orders, market)

    def market(self, symbol):
        isString = isinstance(symbol, basestring)
        if isString and self.markets and (symbol in self.markets):
            return self.markets[symbol]
        return symbol

    def market_ids(self, symbols):
        return [self.marketId(symbol) for symbol in symbols]

    def marketIds(self, symbols):
        return self.market_ids(symbols)

    def market_id(self, symbol):
        market = self.market(symbol)
        return market['id'] if type(market) is dict else symbol

    def marketId(self, symbol):
        return self.market_id(symbol)

    def fetchBalance(self, params={}):
        return self.fetch_balance(params)

    def fetchOrderBook(self, symbol):
        return self.fetch_order_book(symbol)

    def fetchTicker(self, symbol):
        return self.fetch_ticker(symbol)

    def fetchTrades(self, symbol):
        return self.fetch_trades(symbol)

    def create_limit_buy_order(self, symbol, amount, price, params={}):
        return self.create_order(symbol, 'limit', 'buy', amount, price, params)

    def create_limit_sell_order(self, symbol, amount, price, params={}):
        return self.create_order(symbol, 'limit', 'sell', amount, price, params)

    def create_market_buy_order(self, symbol, amount, params={}):
        return self.create_order(symbol, 'market', 'buy', amount, None, params)

    def create_market_sell_order(self, symbol, amount, params={}):
        return self.create_order(symbol, 'market', 'sell', amount, None, params)

    def createLimitBuyOrder(self, symbol, amount, price, params={}):
        return self.create_limit_buy_order(symbol, amount, price, params)

    def createLimitSellOrder(self, symbol, amount, price, params={}):
        return self.create_limit_sell_order(symbol, amount, price, params)

    def createMarketBuyOrder(self, symbol, amount, params={}):
        return self.create_market_buy_order(symbol, amount, params)

    def createMarketSellOrder(self, symbol, amount, params={}):
        return self.create_market_sell_order(symbol, amount, params)

#==============================================================================

# This comment is a placeholder for transpiled derived exchange implementations
# See https://github.com/kroitor/ccxt/blob/master/CONTRIBUTING.md for details
