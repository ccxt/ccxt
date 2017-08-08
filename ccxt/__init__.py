# coding=utf-8

exchanges = [
    '_1broker',
    '_1btcxe',
    'anxpro',
    'bit2c',
    'bitbay',
    'bitbays',
    'bitcoincoid',
    'bitfinex',
    'bitflyer',
    'bitlish',
    'bitmarket',
    'bitmex',
    'bitso',
    'bitstamp',
    'bittrex',
    'bl3p',
    'btcchina',
    'btce',
    'btcexchange',
    'btctradeua',
    'btcturk',
    'btcx',
    'bter',
    'bxinth',
    'ccex',
    'cex',
    'chbtc',
    'chilebit',
    'coincheck',
    'coingi',
    'coinmarketcap',
    'coinmate',
    'coinsecure',
    'coinspot',
    'dsx',
    'exmo',
    'flowbtc',
    'foxbit',
    'fybse',
    'fybsg',
    'gatecoin',
    'gdax',
    'gemini',
    'hitbtc',
    'huobi',
    'itbit',
    'jubi',
    'kraken',
    'lakebtc',
    'livecoin',
    'liqui',
    'luno',
    'mercado',
    'okcoincny',
    'okcoinusd',
    'paymium',
    'poloniex',
    'quadrigacx',
    'quoine',
    'southxchange',
    'surbitcoin',
    'therock',
    'urdubit',
    'vaultoro',
    'vbtc',
    'virwox',
    'xbtce',
    'yobit',
    'yunbi',
    'zaif',
]

__all__ = exchanges + [
    'exchanges',
    'Exchange',
    'CCXTError',
    'ExchangeError',
    'AuthenticationError',
    'NetworkError',
    'DDoSProtectionError',
    'TimeoutError',
    'ExchangeNotAvailableError',
]

__version__ = '1.3.1'

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

try: 
    import urllib.parse   as _urlencode  # Python 3
    import urllib.request as _urllib
except ImportError: 
    import urllib  as _urlencode         # Python 2
    import urllib2 as _urllib

try:
  basestring # Python 3
except NameError:
  basestring = str # Python 2

class CCXTError (Exception):
    pass

class ExchangeError (CCXTError):
    pass

class AuthenticationError (CCXTError):
    pass

class NetworkError (CCXTError):
    pass

class DDoSProtectionError (NetworkError):
    pass

class TimeoutError (NetworkError):
    pass

class ExchangeNotAvailableError (NetworkError):
    pass

class Exchange (object):

    id         = None
    rateLimit  = 2000  # milliseconds = seconds * 1000
    timeout    = 10000 # milliseconds = seconds * 1000
    userAgent  = False
    verbose    = False
    markets   = None
    symbols    = None
    currencies = None
    tickers    = None
    proxy      = ''
    apiKey     = ''
    secret     = ''
    password   = ''
    uid        = ''
    twofa      = False
    marketsById = None
    markets_by_id = None
    substituteCommonCurrencyCodes = True

    def __init__ (self, config = {}):

        version = '.'.join (map (str, sys.version_info[:3]))
        self.userAgent = {
            'User-Agent': 'ccxt/' + __version__ + ' (+https://github.com/kroitor/ccxt) Python/' + version
        }

        for key in config:
            setattr (self, key, config[key])

        if self.api:
            for apiType, methods in self.api.items ():
                for method, urls in methods.items ():
                    for url in urls:
                        url = url.strip ()
                        splitPath = re.compile ('[^a-zA-Z0-9]').split (url)

                        uppercaseMethod  = method.upper ()
                        lowercaseMethod  = method.lower ()
                        camelcaseMethod  = lowercaseMethod.capitalize ()
                        camelcaseSuffix  = ''.join ([ Exchange.capitalize (x) for x in splitPath ])
                        lowercasePath    = [ x.strip ().lower () for x in splitPath ]
                        underscoreSuffix = '_'.join ([ k for k in lowercasePath if len (k) ])

                        if camelcaseSuffix.find (camelcaseMethod) == 0:
                            camelcaseSuffix = camelcaseSuffix[len (camelcaseMethod):]

                        if underscoreSuffix.find (lowercaseMethod) == 0:
                            underscoreSuffix = underscoreSuffix[len (lowercaseMethod):]

                        camelcase  = apiType + camelcaseMethod + Exchange.capitalize (camelcaseSuffix)
                        underscore = apiType + '_' + lowercaseMethod + '_' + underscoreSuffix.lower ()

                        f = functools.partial (self.request, url, apiType, uppercaseMethod)
                        setattr (self, camelcase,  f)
                        setattr (self, underscore, f)

        if self.markets:
            self.set_markets (self.markets)

    def raise_error (self, exception_type, url, method = 'GET', error = None, details = None):
        details = details if details else ''
        if error:
            if type (error) is _urllib.HTTPError:
                details = ' '.join ([
                    str (error.code),
                    error.msg,
                    error.read ().decode ('utf-8'),
                    details,
                ])
            else:
                details = str (error)
            raise exception_type (' '.join ([ 
                self.id, 
                method,
                url,
                details,
            ]))
        else:
            raise exception_type (' '.join ([ self.id, method, url, details ]))   
    
    def fetch (self, url, method = 'GET', headers = None, body = None):
        """Perform a HTTP request and return decoded JSON data"""
        headers = headers or {}
        if self.userAgent:
            if type (self.userAgent) is str:
                headers.update ({ 'User-Agent': self.userAgent })
            elif (type (self.userAgent) is dict) and ('User-Agent' in self.userAgent):
                headers.update (self.userAgent)
        if len (self.proxy):
            headers.update ({ 'Origin': '*' })
        headers.update ({ 'Accept-Encoding': 'gzip, deflate' })
        url = self.proxy + url
        if self.verbose:
            print (url, method, url, "\nRequest:", headers, body)
        if body:
            body = body.encode ()
        request = _urllib.Request (url, body, headers)
        request.get_method = lambda: method
        response = None
        text = None
        try: # send request and load response
            handler = _urllib.HTTPHandler if url.startswith ('http://') else _urllib.HTTPSHandler
            opener = _urllib.build_opener (handler)
            response = opener.open (request, timeout = int (self.timeout / 1000))
            text = response.read ()
        except socket.timeout as e:
            raise TimeoutError (' '.join ([ self.id, method, url, 'request timeout' ]))
        except ssl.SSLError as e:
            self.raise_error (ExchangeNotAvailableError, url, method, e)
        except _urllib.HTTPError as e:
            error = None
            details = text if text else None
            if e.code == 429:
                error = DDoSProtectionError
            elif e.code in [500, 501, 502, 404, 525]:
                details = e.read ().decode ('utf-8', 'ignore') if e else None
                error = ExchangeNotAvailableError
            elif e.code in [400, 403, 405, 503]:
                # special case to detect ddos protection
                reason = e.read ().decode ('utf-8', 'ignore')
                ddos_protection = re.search ('(cloudflare|incapsula)', reason, flags = re.IGNORECASE)
                if ddos_protection:
                    error = DDoSProtectionError
                else:
                    error = ExchangeNotAvailableError
                    details = '(possible reasons: ' + ', '.join ([
                        'invalid API keys',
                        'bad or old nonce',
                        'exchange is down or offline', 
                        'on maintenance',
                        'DDoS protection',
                        'rate-limiting',
                        reason,
                    ]) + ')'
            elif e.code in [408, 504]:
                error = TimeoutError
            elif e.code in [401, 422, 511]:
                error = AuthenticationError
            self.raise_error (error, url, method, e, details)
        except _urllib.URLError as e:
            self.raise_error (ExchangeNotAvailableError, url, method, e)        
        encoding = response.info ().get ('Content-Encoding')
        if encoding in ('gzip', 'x-gzip', 'deflate'):
            if encoding == 'deflate':
                text = zlib.decompress (text, -zlib.MAX_WBITS)
            else:
                data = gzip.GzipFile ('', 'rb', 9, io.BytesIO (text))
                text = data.read ()
        body = text.decode ('utf-8')
        if self.verbose:
            print (method, url, "\nResponse:", headers, body)
        return self.handle_response (url, method, headers, body)

    def handle_response (self, url, method = 'GET', headers = None, body = None):
        try:
            return json.loads (body)
        except Exception as e:
            ddos_protection = re.search ('(cloudflare|incapsula)', body, flags = re.IGNORECASE)
            exchange_not_available = re.search ('(offline|unavailable|busy|maintenance|maintenancing)', body, flags = re.IGNORECASE)
            if ddos_protection:
                raise DDoSProtectionError (' '.join ([ self.id, method, url, body ]))
            if exchange_not_available:
                message = 'exchange downtime, exchange closed for maintenance or offline, DDoS protection or rate-limiting in effect'
                raise ExchangeNotAvailableError (' '.join ([
                    self.id,
                    method,
                    url,                
                    body,
                    message,
                ]))
            raise

    @staticmethod
    def decimal (number):
        return str (decimal.Decimal (str (number)))

    @staticmethod
    def capitalize (string): # first character only, rest characters unchanged
        if len (string) > 1:
            return "%s%s" % (string[0].upper (), string[1:])
        return string.upper ()

    @staticmethod 
    def keysort (dictionary):
        return collections.OrderedDict (sorted (dictionary.items (), key = lambda t: t[0]))

    @staticmethod
    def extend (*args):
        result = {}
        if args is not None:
            for arg in args:
                result.update (arg)
        return result

    @staticmethod
    def index_by (array, key):
        result = {}    
        if type (array) is dict:
            array = list (Exchange.keysort (array).items ())
        for element in array:
            if (key in element) and (element[key] is not None):
                k = element[key]
                result[k] = element
        return result

    @staticmethod
    def indexBy (l, key):
        return Exchange.index_by (l, key)

    @staticmethod
    def sort_by (l, key, descending = False):
        return sorted (l, key = lambda k: k[key], reverse = descending)

    @staticmethod
    def sortBy (l, key, descending = False):
        return Exchange.sort_by (l, key, descending)

    @staticmethod
    def extract_params (string):
        return re.findall (r'{([a-zA-Z0-9_]+?)}', string)

    @staticmethod
    def implode_params (string, params):
        for key in params:
            string = string.replace ('{' + key + '}', str (params[key]))
        return string

    @staticmethod
    def extractParams (string):
        return Exchange.extract_params (string)

    @staticmethod
    def implodeParams (string, params):
        return Exchange.implode_params (string, params)

    @staticmethod
    def omit (d, *args):
        result = d.copy ()
        for arg in args:
            if type (arg) is list:
                for key in arg:
                    if key in result: del result[key]
            else:
                if arg in result: del result[arg]
        return result

    @staticmethod
    def unique (array):
        return list (set (array))

    @staticmethod
    def pluck (array, key):
        return [element[key] for element in array if (key in element) and (element[key] is not None)]

    @staticmethod
    def sum (*args):
        return sum ([arg for arg in args if isinstance (arg, int) or isinstance (arg, float)])

    @staticmethod
    def s ():
        return Exchange.seconds ()
    
    @staticmethod
    def sec ():
        return Exchange.seconds ()
    
    @staticmethod
    def ms ():
        return Exchange.milliseconds ()
    
    @staticmethod
    def msec ():
        return Exchange.milliseconds ()
    
    @staticmethod
    def us ():
        return Exchange.microseconds ()
    
    @staticmethod
    def usec ():
        return Exchange.microseconds ()
    
    @staticmethod
    def seconds ():
        return int (time.time ())
    
    @staticmethod
    def milliseconds ():
        return int (time.time () * 1000)
    
    @staticmethod
    def microseconds ():
        return int (time.time () * 1000000)

    @staticmethod
    def iso8601 (timestamp):
        return (datetime
            .datetime
            .utcfromtimestamp (int (round (timestamp / 1000)))
            .strftime ('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z')

    @staticmethod
    def yyyymmddhhmmss (timestamp):
        return datetime.datetime.fromtimestamp (int (round (timestamp / 1000))).strftime ('%Y-%m-%d %H:%M:%S')

    @staticmethod
    def parse8601 (timestamp):
        yyyy = '([0-9]{4})-?'
        mm   = '([0-9]{2})-?'
        dd   = '([0-9]{2})(?:T|[\s])?'
        h    = '([0-9]{2}):?'
        m    = '([0-9]{2}):?'
        s    = '([0-9]{2})'
        ms   = '(\.[0-9]{3})?'
        tz = '(?:(\+|\-)([0-9]{2})\:?([0-9]{2})|Z)?'
        regex = r'' + yyyy + mm + dd + h + m + s + ms + tz
        match = re.search (regex, timestamp, re.IGNORECASE)
        yyyy, mm, dd, h, m, s, ms, sign, hours, minutes = match.groups ()
        ms = ms or '.000'
        sign = sign or ''
        sign = int (sign + '1')
        hours = int (hours or 0) * sign
        minutes = int (minutes or 0) * sign
        offset = datetime.timedelta (hours = hours, minutes = minutes)
        string = yyyy + mm + dd + h + m + s + ms + 'Z'
        dt = datetime.datetime.strptime (string, "%Y%m%d%H%M%S.%fZ")
        dt = dt + offset
        return calendar.timegm (dt.utctimetuple ()) * 1000

    @staticmethod
    def hash (request, algorithm = 'md5', digest = 'hex'):
        h = hashlib.new (algorithm, request)
        if digest == 'hex':
            return h.hexdigest ()
        elif digest == 'base64':
            return base64.b64encode (h.digest ())
        return h.digest ()

    @staticmethod
    def hmac (request, secret, algorithm = hashlib.sha256, digest = 'hex'):
        h = hmac.new (secret, request, algorithm)
        if digest == 'hex':
            return h.hexdigest ()
        elif digest == 'base64':
            return base64.b64encode (h.digest ())
        return h.digest ()

    @staticmethod
    def binary_concat (*args):
        result = bytes ()
        for arg in args:
            result = result + arg
        return result

    @staticmethod
    def binary_to_string (s):
        return s.decode ('ascii')

    @staticmethod
    def base64urlencode (s):
        return Exchange.decode (base64.urlsafe_b64encode (s)).replace ('=', '')

    @staticmethod
    def jwt (request, secret, algorithm = hashlib.sha256, alg = 'HS256'):
        header = Exchange.encode (Exchange.json ({ 'alg': alg, 'typ': 'JWT' }))
        encodedHeader = Exchange.base64urlencode (header)
        encodedData = Exchange.base64urlencode (Exchange.encode (Exchange.json (request)))
        token = encodedHeader + '.' + encodedData
        hmac = Exchange.hmac (Exchange.encode (token), Exchange.encode (secret), algorithm, 'binary')
        signature = Exchange.base64urlencode (hmac)
        return token + '.' + signature

    @staticmethod
    def json (input):
        return json.dumps (input, separators = (',', ':'))

    @staticmethod
    def encode (string):
        return string.encode ()

    @staticmethod
    def decode (string):
        return string.decode ()

    def nonce (self):
        return Exchange.seconds ()

    def commonCurrencyCode (self, currency):
        if not self.substituteCommonCurrencyCodes:
            return currency
        if currency == 'XBT':
            return 'BTC'
        if currency == 'BCC':
            return 'BCH'
        if currency == 'DRK':
            return 'DASH'
        return currency

    def set_markets (self, markets):
        values = markets
        if type (values) is dict:
            values = list (markets.values ())
        self.markets = self.indexBy (values, 'symbol')
        self.markets_by_id = Exchange.indexBy (values, 'id')
        self.marketsById = self.markets_by_id
        self.symbols = sorted (list (self.markets.keys ()))
        base = self.pluck ([market for market in values if 'base' in market], 'base')
        quote = self.pluck ([market for market in values if 'quote' in market], 'quote')
        self.currencies = sorted (self.unique (base + quote))
        return self.markets

    def setMarkets (self, markets):
        return self.set_markets  (markets)

    def load_markets (self, reload = False):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets (self.markets)
                return self.markets
        markets = self.fetch_markets ()
        return self.set_markets (markets)

    def loadMarkets  (self, reload = False):
        return self.load_markets  ()

    def fetch_markets (self):
        return self.markets
    
    def fetchMarkets (self):
        return self.fetch_markets ()

    def fetch_tickers (self):
        raise ExchangeError (self.id + ' API does not allow to fetch all tickers at once with a single call to fetch_tickers () for now')

    def fetchTickers (self):
        return self.fetch_tickers ()

    def market (self, market):
        isString = isinstance (market, basestring)
        if isString and self.markets and (market in self.markets):
            return self.markets [market]
        return market

    def market_id (self, market):
        p = self.market (market)
        return p['id'] if type (p) is dict else market

    def marketId  (self, market):
        return self.market_id (market)

    def symbol (self, market):
        p = self.market (market)
        return p['symbol'] if type (p) is dict else market

    def fetchBalance (self):
        return self.fetch_balance ()
    
    def fetchOrderBook (self, market): 
        return self.fetch_order_book (market)
    
    def fetchTicker (self, market):
        return self.fetch_ticker (market)
    
    def fetchTrades (self, market): 
        return self.fetch_trades (market)

    def create_limit_buy_order (self, market, amount, price, params = {}):
        return self.create_order (market, 'limit', 'buy', amount, price, params)

    def create_limit_sell_order (self, market, amount, price, params = {}):
        return self.create_order (market, 'limit', 'sell', amount, price, params)

    def create_market_buy_order (self, market, amount, params = {}):
        return self.create_order (market, 'market', 'buy', amount, None, params)

    def create_market_sell_order (self, market, amount, params = {}):
        return self.create_order (market, 'market', 'sell', amount, None, params)

    def createLimitBuyOrder (self, market, amount, price, params = {}):
        return self.create_limit_buy_order (market, amount, price, params)

    def createLimitSellOrder (self, market, amount, price, params = {}):
        return self.create_limit_sell_order (market, amount, price, params)

    def createMarketBuyOrder (self, market, amount, params = {}): 
        return self.create_market_buy_order (market, amount, params)

    def createMarketSellOrder (self, market, amount, params = {}):
        return self.create_market_sell_order (market, amount, params)

#==============================================================================

class _1broker (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': '_1broker',
            'name': '1Broker',
            'countries': 'US',
            'rateLimit': 1500,
            'version': 'v2',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766021-420bd9fc-5ecb-11e7-8ed6-56d0081efed2.jpg',
                'api': 'https://1broker.com/api',
                'www': 'https://1broker.com',
                'doc': 'https://1broker.com/?c=en/content/api-documentation',
            },
            'api': {
                'private': {
                    'get': [
                        'market/bars',
                        'market/categories',
                        'market/details',
                        'market/list',
                        'market/quotes',
                        'market/ticks',
                        'order/cancel',
                        'order/create',
                        'order/open',
                        'position/close',
                        'position/close_cancel',
                        'position/edit',
                        'position/history',
                        'position/open',
                        'position/shared/get',
                        'social/profile_statistics',
                        'social/profile_trades',
                        'user/bitcoin_deposit_address',
                        'user/details',
                        'user/overview',
                        'user/quota_status',
                        'user/transaction_log',
                    ],
                },
            },
        }
        params.update (config)
        super (_1broker, self).__init__ (params)

    def fetchCategories (self):
        categories = self.privateGetMarketCategories ()
        return categories['response']

    def fetch_markets (self):
        self_ = self # workaround for Babel bug (not passing `self` to _recursive() call)
        categories = self.fetchCategories ()
        result = []
        for c in range (0, len (categories)):
            category = categories[c]
            markets = self_.privateGetMarketList ({
                'category': category.lower (),
            })
            for p in range (0, len (markets['response'])):
                market = markets['response'][p]
                id = market['symbol']
                symbol = None
                base = None
                quote = None
                if (category == 'FOREX') or (category == 'CRYPTO'):
                    symbol = market['name']
                    parts = symbol.split ('/')
                    base = parts[0]
                    quote = parts[1]
                else:
                    base = id
                    quote = 'USD'
                    symbol = base + '/' + quote
                base = self_.commonCurrencyCode (base)
                quote = self_.commonCurrencyCode (quote)
                result.append ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'info': market,
                })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        balance = self.privateGetUserOverview ()
        response = balance['response']
        result = { 'info': response }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            result[currency] = {
                'free': None,
                'used': None,
                'total': None,
            }
        result['BTC']['free'] = float (response['balance'])
        result['BTC']['total'] = result['BTC']['free']
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        response = self.privateGetMarketQuotes (self.extend ({
            'symbols': self.market_id (market),
        }, params))
        orderbook = response['response'][0]
        timestamp = self.parse8601 (orderbook['updated'])
        bidPrice = float (orderbook['bid'])
        askPrice = float (orderbook['ask'])
        bid = [ bidPrice, None ]
        ask = [ askPrice, None ]
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'bids': [ bid ],
            'asks': [ ask ],
        }

    def fetch_ticker (self, market):
        self.loadMarkets ()
        result = self.privateGetMarketBars ({
            'symbol': self.market_id (market),
            'resolution': 60,
            'limit': 1,
        })
        orderbook = self.fetchOrderBook (market)
        ticker = result['response'][0]
        timestamp = self.parse8601 (ticker['date'])
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['h']),
            'low': float (ticker['l']),
            'bid': orderbook['bids'][0][0],
            'ask': orderbook['asks'][0][0],
            'vwap': None,
            'open': float (ticker['o']),
            'close': float (ticker['c']),
            'first': None,
            'last': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': None,
        }

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'symbol': self.market_id (market),
            'margin': amount,
            'direction': 'short' if (side == 'sell') else 'long',
            'leverage': 1,
            'type': side,
        }
        if type == 'limit':
            order['price'] = price
        else:
            order['type'] += '_market'
        return self.privateGetOrderCreate (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostOrderCancel ({ 'order_id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        if not self.apiKey:
            raise AuthenticationError (self.id + ' requires apiKey for all requests')
        url = self.urls['api'] + '/' + self.version + '/' + path + '.php'
        query = self.extend ({ 'token': self.apiKey }, params)
        url += '?' + _urlencode.urlencode (query)
        response = self.fetch (url, method)
        if 'warning' in response:
            if response['warning']:
                raise ExchangeError (self.id + ' Warning: ' + response['warning_message'])
        if 'error' in response:
            if response['error']:
                raise ExchangeError (self.id + ' Error: ' + response['error_code'] + response['error_message'])
        return response

#------------------------------------------------------------------------------

class cryptocapital (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'cryptocapital',
            'name': 'Crypto Capital',
            'comment': 'Crypto Capital API',
            'countries': 'PA', # Panama
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27993158-7a13f140-64ac-11e7-89cc-a3b441f0b0f8.jpg',
                'www': 'https://cryptocapital.co',
                'doc': 'https://github.com/cryptocap',
            },
            'api': {
                'public': {
                    'get': [
                        'stats',
                        'historical-prices',
                        'order-book',
                        'transactions',
                    ],
                },
                'private': {
                    'post': [
                        'balances-and-info',
                        'open-orders',
                        'user-transactions',
                        'btc-deposit-address/get',
                        'btc-deposit-address/new',
                        'deposits/get',
                        'withdrawals/get',
                        'orders/new',
                        'orders/edit',
                        'orders/cancel',
                        'orders/status',
                        'withdrawals/new',
                    ],
                },
            },
        }
        params.update (config)
        super (cryptocapital, self).__init__ (params)

    def fetch_balance (self):
        response = self.privatePostBalancesAndInfo ()
        balance = response['balances-and-info']
        result = { 'info': balance }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balance['available']:
                account['free'] = float (balance['available'][currency])
            if currency in balance['on_hold']:
                account['used'] = float (balance['on_hold'][currency])
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        response = self.publicGetOrderBook (self.extend ({
            'currency': self.market_id (market),
        }, params))
        orderbook = response['order-book']
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = { 'bids': 'bid', 'asks': 'ask' }
        keys = list (sides.keys ())
        for k in range (0, len (keys)):
            key = keys[k]
            side = sides[key]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                timestamp = int (order['timestamp']) * 1000
                price = float (order['price'])
                amount = float (order['order_amount'])
                result[key].append ([ price, amount, timestamp ])
        return result

    def fetch_ticker (self, market):
        response = self.publicGetStats ({
            'currency': self.market_id (market),
        })
        ticker = response['stats']
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['max']),
            'low': float (ticker['min']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': float (ticker['open']),
            'close': None,
            'first': None,
            'last': float (ticker['last_price']),
            'change': float (ticker['daily_change']),
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['total_btc_traded']),
        }

    def fetch_trades (self, market):
        return self.publicGetTransactions ({
            'currency': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        order = {
            'side': side,
            'type': type,
            'currency': self.market_id (market),
            'amount': amount,
        }
        if type == 'limit':
            order['limit_price'] = price
        return self.privatePostOrdersNew (self.extend (order, params))

    def cancel_order (self, id):
        return self.privatePostOrdersCancel ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        if self.id == 'cryptocapital':
            raise ExchangeError (self.id + ' is an abstract base API for _1btcxe')
        url = self.urls['api'] + '/' + path
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            query = self.extend ({
                'api_key': self.apiKey,
                'nonce': self.nonce (),
            }, params)
            request = self.json (query)
            query['signature'] = self.hmac (self.encode (request), self.encode (self.secret))
            body = self.json (query)
            headers = { 'Content-Type': 'application/json' }
        response = self.fetch (url, method, headers, body)
        if 'errors' in response:
            errors = []
            for e in range (0, len (response['errors'])):
                error = response['errors'][e]
                errors.append (error['code'] + ': ' + error['message'])
            errors = ' '.join (errors)
            raise ExchangeError (self.id + ' ' + errors)
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class _1btcxe (cryptocapital):

    def __init__ (self, config = {}):
        params = {
            'id': '_1btcxe',
            'name': '1BTCXE',
            'countries': 'PA', # Panama
            'comment': 'Crypto Capital API',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg',
                'api': 'https://1btcxe.com/api',
                'www': 'https://1btcxe.com',
                'doc': 'https://1btcxe.com/api-docs.php',
            },
            'markets': {
                'BTC/USD': { 'id': 'USD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', },
                'BTC/EUR': { 'id': 'EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', },
                'BTC/CNY': { 'id': 'CNY', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', },
                'BTC/RUB': { 'id': 'RUB', 'symbol': 'BTC/RUB', 'base': 'BTC', 'quote': 'RUB', },
                'BTC/CHF': { 'id': 'CHF', 'symbol': 'BTC/CHF', 'base': 'BTC', 'quote': 'CHF', },
                'BTC/JPY': { 'id': 'JPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY', },
                'BTC/GBP': { 'id': 'GBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP', },
                'BTC/CAD': { 'id': 'CAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD', },
                'BTC/AUD': { 'id': 'AUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', },
                'BTC/AED': { 'id': 'AED', 'symbol': 'BTC/AED', 'base': 'BTC', 'quote': 'AED', },
                'BTC/BGN': { 'id': 'BGN', 'symbol': 'BTC/BGN', 'base': 'BTC', 'quote': 'BGN', },
                'BTC/CZK': { 'id': 'CZK', 'symbol': 'BTC/CZK', 'base': 'BTC', 'quote': 'CZK', },
                'BTC/DKK': { 'id': 'DKK', 'symbol': 'BTC/DKK', 'base': 'BTC', 'quote': 'DKK', },
                'BTC/HKD': { 'id': 'HKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD', },
                'BTC/HRK': { 'id': 'HRK', 'symbol': 'BTC/HRK', 'base': 'BTC', 'quote': 'HRK', },
                'BTC/HUF': { 'id': 'HUF', 'symbol': 'BTC/HUF', 'base': 'BTC', 'quote': 'HUF', },
                'BTC/ILS': { 'id': 'ILS', 'symbol': 'BTC/ILS', 'base': 'BTC', 'quote': 'ILS', },
                'BTC/INR': { 'id': 'INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR', },
                'BTC/MUR': { 'id': 'MUR', 'symbol': 'BTC/MUR', 'base': 'BTC', 'quote': 'MUR', },
                'BTC/MXN': { 'id': 'MXN', 'symbol': 'BTC/MXN', 'base': 'BTC', 'quote': 'MXN', },
                'BTC/NOK': { 'id': 'NOK', 'symbol': 'BTC/NOK', 'base': 'BTC', 'quote': 'NOK', },
                'BTC/NZD': { 'id': 'NZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD', },
                'BTC/PLN': { 'id': 'PLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN', },
                'BTC/RON': { 'id': 'RON', 'symbol': 'BTC/RON', 'base': 'BTC', 'quote': 'RON', },
                'BTC/SEK': { 'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK', },
                'BTC/SGD': { 'id': 'SGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD', },
                'BTC/THB': { 'id': 'THB', 'symbol': 'BTC/THB', 'base': 'BTC', 'quote': 'THB', },
                'BTC/TRY': { 'id': 'TRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY', },
                'BTC/ZAR': { 'id': 'ZAR', 'symbol': 'BTC/ZAR', 'base': 'BTC', 'quote': 'ZAR', },
            },
        }
        params.update (config)
        super (_1btcxe, self).__init__ (params)

#------------------------------------------------------------------------------

class anxpro (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'anxpro',
            'name': 'ANXPro',
            'countries': [ 'JP', 'SG', 'HK', 'NZ', ],
            'version': '2',
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
                'api': 'https://anxpro.com/api',
                'www': 'https://anxpro.com',
                'doc': [
                    'http://docs.anxv2.apiary.io',
                    'https://anxpro.com/pages/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{currency_pair}/money/ticker',
                        '{currency_pair}/money/depth/full',
                        '{currency_pair}/money/trade/fetch', # disabled by ANXPro
                    ],
                },
                'private': {
                    'post': [
                        '{currency_pair}/money/order/add',
                        '{currency_pair}/money/order/cancel',
                        '{currency_pair}/money/order/quote',
                        '{currency_pair}/money/order/result',
                        '{currency_pair}/money/orders',
                        'money/{currency}/address',
                        'money/{currency}/send_simple',
                        'money/info',
                        'money/trade/list',
                        'money/wallet/history',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'BTC/HKD': { 'id': 'BTCHKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD' },
                'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
                'BTC/CAD': { 'id': 'BTCCAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD' },
                'BTC/AUD': { 'id': 'BTCAUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD' },
                'BTC/SGD': { 'id': 'BTCSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
                'BTC/JPY': { 'id': 'BTCJPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY' },
                'BTC/GBP': { 'id': 'BTCGBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP' },
                'BTC/NZD': { 'id': 'BTCNZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD' },
                'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
                'DOGE/BTC': { 'id': 'DOGEBTC', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC' },
                'STR/BTC': { 'id': 'STRBTC', 'symbol': 'STR/BTC', 'base': 'STR', 'quote': 'BTC' },
                'XRP/BTC': { 'id': 'XRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
            },
        }
        params.update (config)
        super (anxpro, self).__init__ (params)

    def fetch_balance (self):
        response = self.privatePostMoneyInfo ()
        balance = response['data']
        currencies = list (balance['Wallets'].keys ())
        result = { 'info': balance }
        for c in range (0, len (currencies)):
            currency = currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balance['Wallets']:
                wallet = balance['Wallets'][currency]
                account['free'] = float (wallet['Available_Balance']['value'])
                account['total'] = float (wallet['Balance']['value'])
                account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        response = self.publicGetCurrencyPairMoneyDepthFull (self.extend ({
            'currency_pair': self.market_id (market),
        }, params))
        orderbook = response['data']
        t = int (orderbook['dataUpdateTime'])
        timestamp = int (t / 1000)
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['amount'])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        response = self.publicGetCurrencyPairMoneyTicker ({
            'currency_pair': self.market_id (market),
        })
        ticker = response['data']
        t = int (ticker['dataUpdateTime'])
        timestamp = int (t / 1000)
        bid = None
        ask = None
        if ticker['buy']['value']:
            bid = float (ticker['buy']['value'])
        if ticker['sell']['value']:
            ask = float (ticker['sell']['value'])
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']['value']),
            'low': float (ticker['low']['value']),
            'bid': bid,
            'ask': ask,
            'vwap': float (ticker['vwap']['value']),
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']['value']),
            'change': None,
            'percentage': None,
            'average': float (ticker['avg']['value']),
            'baseVolume': None,
            'quoteVolume': float (ticker['vol']['value']),
        }

    def fetch_trades (self, market):
        error = self.id + ' switched off the trades endpoint, see their docs at http://docs.anxv2.apiary.io/reference/market-data/currencypairmoneytradefetch-disabled'
        raise ExchangeError (error)
        return self.publicGetCurrencyPairMoneyTradeFetch ({
            'currency_pair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        order = {
            'currency_pair': self.market_id (market),
            'amount_int': amount,
            'type': side,
        }
        if type == 'limit':
            order['price_int'] = price
        return self.privatePostCurrencyPairOrderAdd (self.extend (order, params))

    def cancel_order (self, id):
        return self.privatePostCurrencyPairOrderCancel ({ 'oid': id })

    def nonce (self):
        return self.milliseconds ()

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        request = self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        url = self.urls['api'] + '/' + self.version + '/' + request
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            body = _urlencode.urlencode (self.extend ({ 'nonce': nonce }, query))
            secret = base64.b64decode (self.secret)
            auth = request + "\0" + body
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': self.apiKey,
                'Rest-Sign': self.hmac (self.encode (auth), secret, hashlib.sha512, 'base64'),
            }
        response = self.fetch (url, method, headers, body)
        if 'result' in response:
            if response['result'] == 'success':
                return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class bit2c (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bit2c',
            'name': 'Bit2C',
            'countries': 'IL', # Israel
            'rateLimit': 3000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg',
                'api': 'https://www.bit2c.co.il',
                'www': 'https://www.bit2c.co.il',
                'doc': [
                    'https://www.bit2c.co.il/home/api',
                    'https://github.com/OferE/bit2c',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'Exchanges/{pair}/Ticker',
                        'Exchanges/{pair}/orderbook',
                        'Exchanges/{pair}/trades',
                    ],
                },
                'private': {
                    'post': [
                        'Account/Balance',
                        'Account/Balance/v2',
                        'Merchant/CreateCheckout',
                        'Order/AccountHistory',
                        'Order/AddCoinFundsRequest',
                        'Order/AddFund',
                        'Order/AddOrder',
                        'Order/AddOrderMarketPriceBuy',
                        'Order/AddOrderMarketPriceSell',
                        'Order/CancelOrder',
                        'Order/MyOrders',
                        'Payment/GetMyId',
                        'Payment/Send',
                    ],
                },
            },
            'markets': {
                'BTC/NIS': { 'id': 'BtcNis', 'symbol': 'BTC/NIS', 'base': 'BTC', 'quote': 'NIS' },
                'LTC/BTC': { 'id': 'LtcBtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
                'LTC/NIS': { 'id': 'LtcNis', 'symbol': 'LTC/NIS', 'base': 'LTC', 'quote': 'NIS' },
            },
        }
        params.update (config)
        super (bit2c, self).__init__ (params)

    def fetch_balance (self):
        balance = self.privatePostAccountBalanceV2 ()
        result = { 'info': balance }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balance:
                available = 'AVAILABLE_' + currency
                account['free'] = balance[available]
                account['total'] = balance[currency]
                account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetExchangesPairOrderbook (self.extend ({
            'pair': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = order[0]
                amount = order[1]
                timestamp = order[2] * 1000
                result[side].append ([ price, amount, timestamp ])
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetExchangesPairTicker ({
            'pair': self.market_id (market),
        })
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['h']),
            'low': float (ticker['l']),
            'bid': None,
            'ask': None,
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['ll']),
            'change': None,
            'percentage': None,
            'average': float (ticker['av']),
            'baseVolume': None,
            'quoteVolume': float (ticker['a']),
        }

    def fetch_trades (self, market):
        return self.publicGetExchangesPairTrades ({
            'pair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        method = 'privatePostOrderAddOrder'
        order = {
            'Amount': amount,
            'Pair': self.market_id (market),
        }
        if type == 'market':
            method += 'MarketPrice' + self.capitalize (side)
        else:
            order['Price'] = price
            order['Total'] = amount * price
            order['IsBid'] = (side == 'buy')
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        return self.privatePostOrderCancelOrder ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.implode_params (path, params)
        if api == 'public':
            url += '.json'
        else:
            nonce = self.nonce ()
            query = self.extend ({ 'nonce': nonce }, params)
            body = _urlencode.urlencode (query)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
                'key': self.apiKey,
                'sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512, 'base64'),
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class bitbay (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bitbay',
            'name': 'BitBay',
            'countries': [ 'PL', 'EU', ], # Poland
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg',
                'www': 'https://bitbay.net',
                'api': {
                    'public': 'https://bitbay.net/API/Public',
                    'private': 'https://bitbay.net/API/Trading/tradingApi.php',
                },
                'doc': [
                    'https://bitbay.net/public-api',
                    'https://bitbay.net/account/tab-api',
                    'https://github.com/BitBayNet/API',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{id}/all',
                        '{id}/market',
                        '{id}/orderbook',
                        '{id}/ticker',
                        '{id}/trades',
                    ],
                },
                'private': {
                    'post': [
                        'info',
                        'trade',
                        'cancel',
                        'orderbook',
                        'orders',
                        'transfer',
                        'withdraw',
                        'history',
                        'transactions',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
                'BTC/PLN': { 'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
                'LTC/USD': { 'id': 'LTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
                'LTC/EUR': { 'id': 'LTCEUR', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR' },
                'LTC/PLN': { 'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN' },
                'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
                'ETH/USD': { 'id': 'ETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD' },
                'ETH/EUR': { 'id': 'ETHEUR', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR' },
                'ETH/PLN': { 'id': 'ETHPLN', 'symbol': 'ETH/PLN', 'base': 'ETH', 'quote': 'PLN' },
                'ETH/BTC': { 'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
                'LSK/USD': { 'id': 'LSKUSD', 'symbol': 'LSK/USD', 'base': 'LSK', 'quote': 'USD' },
                'LSK/EUR': { 'id': 'LSKEUR', 'symbol': 'LSK/EUR', 'base': 'LSK', 'quote': 'EUR' },
                'LSK/PLN': { 'id': 'LSKPLN', 'symbol': 'LSK/PLN', 'base': 'LSK', 'quote': 'PLN' },
                'LSK/BTC': { 'id': 'LSKBTC', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC' },
            },
        }
        params.update (config)
        super (bitbay, self).__init__ (params)

    def fetch_balance (self):
        response = self.privatePostInfo ()
        balance = response['balances']
        result = { 'info': balance }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balance:
                account['free'] = float (balance[currency]['available'])
                account['used'] = float (balance[currency]['locked'])
                account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetIdOrderbook (self.extend ({
            'id': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetIdTicker ({
            'id': self.market_id (market),
        })
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['max']),
            'low': float (ticker['min']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': float (ticker['vwap']),
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': float (ticker['average']),
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetIdTrades ({
            'id': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        p = self.market (market)
        return self.privatePostTrade (self.extend ({
            'type': side,
            'currency': p['base'],
            'amount': amount,
            'payment_currency': p['quote'],
            'rate': price,
        }, params))

    def cancel_order (self, id):
        return self.privatePostCancel ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api]
        if api == 'public':
            url += '/' + self.implode_params (path, params) + '.json'
        else:
            body = _urlencode.urlencode (self.extend ({
                'method': path,
                'moment': self.nonce (),
            }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
                'API-Key': self.apiKey,
                'API-Hash': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class bitbays (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bitbays',
            'name': 'BitBays',
            'countries': [ 'CN', 'GB', 'HK', 'AU', 'CA' ],
            'rateLimit': 1500,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27808599-983687d2-6051-11e7-8d95-80dfcbe5cbb4.jpg',
                'api': 'https://bitbays.com/api',
                'www': 'https://bitbays.com',
                'doc': 'https://bitbays.com/help/api/',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'trades',
                        'depth',
                    ],
                },
                'private': {
                    'post': [
                        'cancel',
                        'info',
                        'orders',
                        'order',
                        'transactions',
                        'trade',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
                'ODS/BTC': { 'id': 'ods_btc', 'symbol': 'ODS/BTC', 'base': 'ODS', 'quote': 'BTC' },
                'LSK/BTC': { 'id': 'lsk_btc', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC' },
                'LSK/CNY': { 'id': 'lsk_cny', 'symbol': 'LSK/CNY', 'base': 'LSK', 'quote': 'CNY' },
            },
        }
        params.update (config)
        super (bitbays, self).__init__ (params)

    def fetch_balance (self):
        response = self.privatePostInfo ()
        balance = response['result']['wallet']
        result = { 'info': balance }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if lowercase in balance:
                account['free'] = float (balance[lowercase]['avail'])
                account['used'] = float (balance[lowercase]['lock'])
                account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        response = self.publicGetDepth (self.extend ({
            'market': self.market_id (market),
        }, params))
        orderbook = response['result']
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        response = self.publicGetTicker ({
            'market': self.market_id (market),
        })
        ticker = response['result']
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['vol']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetTrades ({
            'market': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        order = {
            'market': self.market_id (market),
            'op': side,
            'amount': amount,
        }
        if type == 'market':
            order['order_type'] = 1
            order['price'] = price
        else:
            order['order_type'] = 0
        return self.privatePostTrade (self.extend (order, params))

    def cancel_order (self, id):
        return self.privatePostCancel ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + path
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            nonce = self.nonce ()
            body = _urlencode.urlencode (self.extend ({
                'nonce': nonce,
            }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
                'Key': self.apiKey,
                'Sign': self.hmac (self.encode (body), self.secret, hashlib.sha512),
            }
        response = self.fetch (url, method, headers, body)
        if 'status' in response:
            if response['status'] == 200:
                return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class bitcoincoid (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bitcoincoid',
            'name': 'Bitcoin.co.id',
            'countries': 'ID', # Indonesia
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766138-043c7786-5ecf-11e7-882b-809c14f38b53.jpg',
                'api': {
                    'public': 'https://vip.bitcoin.co.id/api',
                    'private': 'https://vip.bitcoin.co.id/tapi',
                },
                'www': 'https://www.bitcoin.co.id',
                'doc': [
                    'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
                    'https://vip.bitcoin.co.id/trade_api',            
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{pair}/ticker',
                        '{pair}/trades',
                        '{pair}/depth',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'transHistory',
                        'trade',
                        'tradeHistory',
                        'openOrders',
                        'cancelOrder',
                    ],
                },
            },
            'markets': {
                'BTC/IDR':  { 'id': 'btc_idr', 'symbol': 'BTC/IDR', 'base': 'BTC', 'quote': 'IDR', 'baseId': 'btc', 'quoteId': 'idr' },
                'BTS/BTC':  { 'id': 'bts_btc', 'symbol': 'BTS/BTC', 'base': 'BTS', 'quote': 'BTC', 'baseId': 'bts', 'quoteId': 'btc' },
                'DASH/BTC': { 'id': 'drk_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'drk', 'quoteId': 'btc' },
                'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'baseId': 'doge', 'quoteId': 'btc' },
                'ETH/BTC':  { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc' },
                'LTC/BTC':  { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc' },
                'NXT/BTC':  { 'id': 'nxt_btc', 'symbol': 'NXT/BTC', 'base': 'NXT', 'quote': 'BTC', 'baseId': 'nxt', 'quoteId': 'btc' },
                'STR/BTC':  { 'id': 'str_btc', 'symbol': 'STR/BTC', 'base': 'STR', 'quote': 'BTC', 'baseId': 'str', 'quoteId': 'btc' },
                'NEM/BTC':  { 'id': 'nem_btc', 'symbol': 'NEM/BTC', 'base': 'NEM', 'quote': 'BTC', 'baseId': 'nem', 'quoteId': 'btc' },
                'XRP/BTC':  { 'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc' },
            },
        }
        params.update (config)
        super (bitcoincoid, self).__init__ (params)

    def fetch_balance (self):
        response = self.privatePostGetInfo ()
        balance = response['return']['balance']
        frozen = response['return']['balance_hold']
        result = { 'info': balance }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if lowercase in balance:
                account['free'] = float (balance[lowercase])
            if lowercase in frozen:
                account['used'] = float (frozen[lowercase])
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetPairDepth (self.extend ({
            'pair': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = { 'bids': 'buy', 'asks': 'sell' }
        keys = list (sides.keys ())
        for k in range (0, len (keys)):
            key = keys[k]
            side = sides[key]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[key].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        pair = self.market (market)
        response = self.publicGetPairTicker ({
            'pair': pair['id'],
        })
        ticker = response['ticker']
        timestamp = float (ticker['server_time']) * 1000
        baseVolume = 'vol_' + pair['baseId'].lower ()
        quoteVolume = 'vol_' + pair['quoteId'].lower ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker[baseVolume]),
            'quoteVolume': float (ticker[quoteVolume]),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetPairTrades ({
            'pair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        p = self.market (market)
        order = {
            'pair': p['id'],
            'type': side,
            'price': price,
        }
        base = p['base'].lower ()
        order[base] = amount
        return self.privatePostTrade (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        return self.privatePostCancelOrder (self.extend ({
            'id': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api]
        if api == 'public':
            url += '/' + self.implode_params (path, params)
        else:
            body = _urlencode.urlencode (self.extend ({
                'method': path,
                'nonce': self.nonce (),
            }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
                'Key': self.apiKey,
                'Sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            raise ExchangeError (self.id + ' ' + response['error'])
        return response        

#------------------------------------------------------------------------------

class bitfinex (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bitfinex',
            'name': 'Bitfinex',
            'countries': 'US',
            'version': 'v1',
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': 'https://api.bitfinex.com',
                'www': 'https://www.bitfinex.com',
                'doc': [
                    'https://bitfinex.readme.io/v1/docs',
                    'https://bitfinex.readme.io/v2/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'book/{symbol}',
                        'candles/{symbol}',
                        'lendbook/{currency}',
                        'lends/{currency}',
                        'pubticker/{symbol}',
                        'stats/{symbol}',
                        'symbols',
                        'symbols_details',
                        'today',
                        'trades/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'account_infos',
                        'balances',
                        'basket_manage',
                        'credits',
                        'deposit/new',
                        'funding/close',
                        'history',
                        'history/movements',
                        'key_info',
                        'margin_infos',
                        'mytrades',
                        'offer/cancel',
                        'offer/new',
                        'offer/status',
                        'offers',
                        'order/cancel',
                        'order/cancel/all',
                        'order/cancel/multi',
                        'order/cancel/replace',
                        'order/new',
                        'order/new/multi',
                        'order/status',
                        'orders',
                        'position/claim',
                        'positions',
                        'summary',
                        'taken_funds',
                        'total_taken_funds',
                        'transfer',
                        'unused_taken_funds',
                        'withdraw',
                    ],
                },
            },
        }
        params.update (config)
        super (bitfinex, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetSymbolsDetails ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['pair'].upper ()
            baseId = id[0:3]
            quoteId = id[3:6]
            base = baseId
            quote = quoteId
            # issue #4 Bitfinex names Dash as DSH, instead of DASH
            if base == 'DSH':
                base = 'DASH'
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostBalances ()
        balances = {}
        for b in range (0, len (response)):
            account = response[b]
            if account['type'] == 'exchange':
                currency = account['currency']
                # issue #4 Bitfinex names Dash as DSH, instead of DASH
                if currency == 'DSH':
                    currency = 'DASH'
                uppercase = currency.upper ()
                balances[uppercase] = account
        result = { 'info': response }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balances:
                account['free'] = float (balances[currency]['available'])
                account['total'] = float (balances[currency]['amount'])
                account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetBookSymbol (self.extend ({
            'symbol': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['amount'])
                timestamp = int (float (order['timestamp']))
                result[side].append ([ price, amount, timestamp ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        ticker = self.publicGetPubtickerSymbol ({
            'symbol': self.market_id (market),
        })
        timestamp = float (ticker['timestamp']) * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last_price']),
            'change': None,
            'percentage': None,
            'average': float (ticker['mid']),
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTradesSymbol ({
            'symbol': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'symbol': self.market_id (market),
            'amount': str (amount),
            'side': side,
            'type': 'exchange ' + type,
            'ocoorder': False,
            'buy_price_oco': 0,
            'sell_price_oco': 0,
        }
        if type == 'market':
            order['price'] = str (self.nonce ())
        else:
            order['price'] = price
        return self.privatePostOrderNew (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostOrderCancel ({ 'order_id': id })

    def nonce (self):
        return self.milliseconds ()

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        request = '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        url = self.urls['api'] + request
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            query = self.extend ({
                'nonce': str (nonce),
                'request': request,
            }, query)
            query = self.json (query)
            query = self.encode (query)
            payload = base64.b64encode (query)
            secret = self.encode (self.secret)
            headers = {
                'X-BFX-APIKEY': self.apiKey,
                'X-BFX-PAYLOAD': payload,
                'X-BFX-SIGNATURE': self.hmac (payload, secret, hashlib.sha384),
            }
        response = self.fetch (url, method, headers, body)
        if 'message' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class bitflyer (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bitflyer',
            'name': 'bitFlyer',
            'countries': 'JP',
            'version': 'v1',
            'rateLimit': 500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg',
                'api': 'https://api.bitflyer.jp',
                'www': 'https://bitflyer.jp',
                'doc': 'https://bitflyer.jp/API',
            },
            'api': {
                'public': {
                    'get': [
                        'getmarkets',    # or 'markets'
                        'getboard',      # or 'board'
                        'getticker',     # or 'ticker'
                        'getexecutions', # or 'executions'
                        'gethealth',
                        'getchats',
                    ],
                },
                'private': {
                    'get': [
                        'getpermissions',
                        'getbalance',
                        'getcollateral',
                        'getcollateralaccounts',
                        'getaddresses',
                        'getcoinins',
                        'getcoinouts',
                        'getbankaccounts',
                        'getdeposits',
                        'getwithdrawals',
                        'getchildorders',
                        'getparentorders',
                        'getparentorder',
                        'getexecutions',
                        'getpositions',
                        'gettradingcommission',
                    ],
                    'post': [
                        'sendcoin',
                        'withdraw',
                        'sendchildorder',
                        'cancelchildorder',
                        'sendparentorder',
                        'cancelparentorder',
                        'cancelallchildorders',
                    ],
                },
            },
        }
        params.update (config)
        super (bitflyer, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetMarkets ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['product_code']
            currencies = id.split ('_')
            base = None
            quote = None
            symbol = id
            numCurrencies = len (currencies)
            if numCurrencies == 2:
                base = currencies[0]
                quote = currencies[1]
                symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privateGetBalance ()
        balances = {}
        for b in range (0, len (response)):
            account = response[b]
            currency = account['currency_code']
            balances[currency] = account
        result = { 'info': response }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balances:
                account['total'] = balances[currency]['amount']
                account['free'] = balances[currency]['available']                
                account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetBoard (self.extend ({
            'product_code': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['size'])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        ticker = self.publicGetTicker ({
            'product_code': self.market_id (market),
        })
        timestamp = self.parse8601 (ticker['timestamp'])
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': None,
            'low': None,
            'bid': float (ticker['best_bid']),
            'ask': float (ticker['best_ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['ltp']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['volume_by_product']),
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetExecutions ({
            'product_code': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'product_code': self.market_id (market),
            'child_order_type': type.upper (),
            'side': side.upper (),
            'price': price,
            'size': amount,
        }
        return self.privatePostSendparentorder (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.privatePostCancelparentorder (self.extend ({
            'parent_order_id': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        request = '/' + self.version + '/' + path
        if api == 'private':
            request = '/me' + request
        url = self.urls['api'] + request
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            nonce = str (self.nonce ())
            body = self.json (params)
            auth = ''.join ([ nonce, method, request, body ])
            headers = {
                'ACCESS-KEY': self.apiKey,
                'ACCESS-TIMESTAMP': nonce,
                'ACCESS-SIGN': self.hmac (self.encode (auth), self.secret),
                'Content-Type': 'application/json',
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class bitlish (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bitlish',
            'name': 'bitlish',
            'countries': [ 'GB', 'EU', 'RU', ],
            'rateLimit': 1500,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg',
                'api': 'https://bitlish.com/api',
                'www': 'https://bitlish.com',
                'doc': 'https://bitlish.com/api',
            },
            'api': {
                'public': {
                    'get': [
                        'instruments',
                        'ohlcv',
                        'pairs',
                        'tickers',
                        'trades_depth',
                        'trades_history',
                    ],
                },
                'private': {
                    'post': [
                        'accounts_operations',
                        'balance',
                        'cancel_trade',
                        'cancel_trades_by_ids',
                        'cancel_all_trades',
                        'create_bcode',
                        'create_template_wallet',
                        'create_trade',
                        'deposit',
                        'list_accounts_operations_from_ts',
                        'list_active_trades',
                        'list_bcodes',
                        'list_my_matches_from_ts',
                        'list_my_trades',
                        'list_my_trads_from_ts',
                        'list_payment_methods',
                        'list_payments',
                        'redeem_code',
                        'resign',
                        'signin',
                        'signout',
                        'trade_details',
                        'trade_options',
                        'withdraw',
                        'withdraw_by_id',
                    ],
                },
            },
        }
        params.update (config)
        super (bitlish, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetPairs ()
        result = []
        keys = list (markets.keys ())
        for p in range (0, len (keys)):
            market = markets[keys[p]]
            id = market['id']
            symbol = market['name']
            base, quote = symbol.split ('/')
            # issue #4 bitlish names Dash as DSH, instead of DASH
            if base == 'DSH':
                base = 'DASH'
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def parse_ticker (self, ticker, market):
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['max']),
            'low': float (ticker['min']),
            'bid': None,
            'ask': None,
            'vwap': None,
            'open': None,
            'close': None,
            'first': float (ticker['first']),
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': None,
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        tickers = self.publicGetTickers ()
        ids = list (tickers.keys ())
        result = {}
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        tickers = self.publicGetTickers ()
        ticker = tickers[p['id']]
        return self.parse_ticker (ticker, p)

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetTradesDepth (self.extend ({
            'pair_id': self.market_id (market),
        }, params))
        timestamp = int (int (orderbook['last']) / 1000)
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = { 'bids': 'bid', 'asks': 'ask' }
        keys = list (sides.keys ())
        for k in range (0, len (keys)):
            key = keys[k]
            side = sides[key]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['volume'])
                result[key].append ([ price, amount ])
        return result

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTradesHistory ({
            'pair_id': self.market_id (market),
        })

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostBalance ()
        result = { 'info': response }
        currencies = list (response.keys ())
        balance = {}
        for c in range (0, len (currencies)):
            currency = currencies[c]
            account = response[currency]
            currency = currency.upper ()
            # issue #4 bitlish names Dash as DSH, instead of DASH
            if currency == 'DSH':
                currency = 'DASH'
            balance[currency] = account
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balance:
                account['free'] = float (balance[currency]['funds'])
                account['used'] = float (balance[currency]['holded'])                
                account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def sign_in (self):
        return self.privatePostSignin ({
            'login': self.login,
            'passwd': self.password,
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'pair_id': self.market_id (market),
            'dir': 'bid' if (side == 'buy') else 'ask',
            'amount': amount,
        }
        if type == 'limit':
            order['price'] = price
        return self.privatePostCreateTrade (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostCancelTrade ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + path
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            body = self.json (self.extend ({ 'token': self.apiKey }, params))
            headers = { 'Content-Type': 'application/json' }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class bitmarket (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bitmarket',
            'name': 'BitMarket',
            'countries': [ 'PL', 'EU', ],
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg',
                'api': {
                    'public': 'https://www.bitmarket.net',
                    'private': 'https://www.bitmarket.pl/api2/', # last slash is critical
                },
                'www': [
                    'https://www.bitmarket.pl',
                    'https://www.bitmarket.net',
                ],
                'doc': [
                    'https://www.bitmarket.net/docs.php?file=api_public.html',
                    'https://www.bitmarket.net/docs.php?file=api_private.html',
                    'https://github.com/bitmarket-net/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'json/{market}/ticker',
                        'json/{market}/orderbook',
                        'json/{market}/trades',
                        'json/ctransfer',
                        'graphs/{market}/90m',
                        'graphs/{market}/6h',
                        'graphs/{market}/1d',
                        'graphs/{market}/7d',
                        'graphs/{market}/1m',
                        'graphs/{market}/3m',
                        'graphs/{market}/6m',
                        'graphs/{market}/1y',
                    ],
                },
                'private': {
                    'post': [
                        'info',
                        'trade',
                        'cancel',
                        'orders',
                        'trades',
                        'history',
                        'withdrawals',
                        'tradingdesk',
                        'tradingdeskStatus',
                        'tradingdeskConfirm',
                        'cryptotradingdesk',
                        'cryptotradingdeskStatus',
                        'cryptotradingdeskConfirm',
                        'withdraw',
                        'withdrawFiat',
                        'withdrawPLNPP',
                        'withdrawFiatFast',
                        'deposit',
                        'transfer',
                        'transfers',
                        'marginList',
                        'marginOpen',
                        'marginClose',
                        'marginCancel',
                        'marginModify',
                        'marginBalanceAdd',
                        'marginBalanceRemove',
                        'swapList',
                        'swapOpen',
                        'swapClose',
                    ],
                },
            },
            'markets': {
                'BTC/PLN': { 'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN' },
                'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
                'LTC/PLN': { 'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN' },
                'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
                'LiteMineX/BTC': { 'id': 'LiteMineXBTC', 'symbol': 'LiteMineX/BTC', 'base': 'LiteMineX', 'quote': 'BTC' },
                'PlnX/BTC': { 'id': 'PlnxBTC', 'symbol': 'PlnX/BTC', 'base': 'PlnX', 'quote': 'BTC' },
            },
        }
        params.update (config)
        super (bitmarket, self).__init__ (params)

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostInfo ()
        data = response['data']
        balance = data['balances']
        result = { 'info': data }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balance['available']:
                account['free'] = balance['available'][currency]
            if currency in balance['blocked']:
                account['used'] = balance['blocked'][currency]
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetJsonMarketOrderbook (self.extend ({
            'market': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        return result


    def fetch_ticker (self, market):
        ticker = self.publicGetJsonMarketTicker ({
            'market': self.market_id (market),
        })
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': float (ticker['vwap']),
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetJsonMarketTrades ({
            'market': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        return self.privatePostTrade (self.extend ({
            'market': self.market_id (market),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params))

    def cancel_order (self, id):
        return self.privatePostCancel ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api]
        if api == 'public':
            url += '/' + self.implode_params (path + '.json', params)
        else:
            nonce = self.nonce ()
            query = self.extend ({
                'tonce': nonce,
                'method': path,
            }, params)
            body = _urlencode.urlencode (query)
            headers = {
                'API-Key': self.apiKey,
                'API-Hash': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class bitmex (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bitmex',
            'name': 'BitMEX',
            'countries': 'SC', # Seychelles
            'version': 'v1',
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg',
                'api': 'https://www.bitmex.com',
                'www': 'https://www.bitmex.com',
                'doc': [
                    'https://www.bitmex.com/app/apiOverview',
                    'https://github.com/BitMEX/api-connectors/tree/master/official-http',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'announcement',
                        'announcement/urgent',
                        'funding',
                        'instrument',
                        'instrument/active',
                        'instrument/activeAndIndices',
                        'instrument/activeIntervals',
                        'instrument/compositeIndex',
                        'instrument/indices',
                        'insurance',
                        'leaderboard',
                        'liquidation',
                        'orderBook',
                        'orderBook/L2',
                        'quote',
                        'quote/bucketed',
                        'schema',
                        'schema/websocketHelp',
                        'settlement',
                        'stats',
                        'stats/history',
                        'trade',
                        'trade/bucketed',
                    ],
                },
                'private': {
                    'get': [
                        'apiKey',
                        'chat',
                        'chat/channels',
                        'chat/connected',
                        'execution',
                        'execution/tradeHistory',
                        'notification',
                        'order',
                        'position',
                        'user',
                        'user/affiliateStatus',
                        'user/checkReferralCode',
                        'user/commission',
                        'user/depositAddress',
                        'user/margin',
                        'user/minWithdrawalFee',
                        'user/wallet',
                        'user/walletHistory',
                        'user/walletSummary',
                    ],
                    'post': [
                        'apiKey',
                        'apiKey/disable',
                        'apiKey/enable',
                        'chat',
                        'order',
                        'order/bulk',
                        'order/cancelAllAfter',
                        'order/closePosition',
                        'position/isolate',
                        'position/leverage',
                        'position/riskLimit',
                        'position/transferMargin',
                        'user/cancelWithdrawal',
                        'user/confirmEmail',
                        'user/confirmEnableTFA',
                        'user/confirmWithdrawal',
                        'user/disableTFA',
                        'user/logout',
                        'user/logoutAll',
                        'user/preferences',
                        'user/requestEnableTFA',
                        'user/requestWithdrawal',
                    ],
                    'put': [
                        'order',
                        'order/bulk',
                        'user',
                    ],
                    'delete': [
                        'apiKey',
                        'order',
                        'order/all',
                    ],
                }
            },
        }
        params.update (config)
        super (bitmex, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetInstrumentActive ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['symbol']
            base = market['underlying']
            quote = market['quoteCurrency']
            isFuturesContract = id != (base + quote)
            base = self.commonCurrencyCode (base)
            quote = self.commonCurrencyCode (quote)
            symbol = id if isFuturesContract else (base + '/' + quote)
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privateGetUserMargin ({ 'currency': 'all' })
        result = { 'info': response }
        for b in range (0, len (response)):
            balance = response[b]
            currency = balance['currency'].upper ()
            currency = self.commonCurrencyCode (currency)
            account = {
                'free': balance['availableMargin'],
                'used': None,
                'total': balance['amount'],
            }
            if currency == 'BTC':
                account['free'] = account['free'] * 0.00000001
                account['total'] = account['total'] * 0.00000001
            account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetOrderBookL2 (self.extend ({
            'symbol': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        for o in range (0, len (orderbook)):
            order = orderbook[o]
            side = 'asks' if (order['side'] == 'Sell') else 'bids'
            amount = order['size']
            price = order['price']
            result[side].append ([ price, amount ])
        result['bids'] = self.sort_by (result['bids'], 0, True)
        result['asks'] = self.sort_by (result['asks'], 0)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        request = {
            'symbol': self.market_id (market),
            'binSize': '1d',
            'partial': True,
            'count': 1,
            'reverse': True,
        }
        quotes = self.publicGetQuoteBucketed (request)
        quotesLength = len (quotes)
        quote = quotes[quotesLength - 1]
        tickers = self.publicGetTradeBucketed (request)
        ticker = tickers[0]
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (quote['bidPrice']),
            'ask': float (quote['askPrice']),
            'vwap': float (ticker['vwap']),
            'open': None,
            'close': float (ticker['close']),
            'first': None,
            'last': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['homeNotional']),
            'quoteVolume': float (ticker['foreignNotional']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTrade ({
            'symbol': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'symbol': self.market_id (market),
            'side': self.capitalize (side),
            'orderQty': amount,
            'ordType': self.capitalize (type),
        }
        if type == 'limit':
            order['rate'] = price
        return self.privatePostOrder (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privateDeleteOrder ({ 'orderID': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        query = '/api/' + self.version + '/' + path
        if params:
            query += '?' + _urlencode.urlencode (params)
        url = self.urls['api'] + query
        if api == 'private':
            nonce = str (self.nonce ())
            if method == 'POST':
                if params:
                    body = self.json (params)
            request = ''.join ([ method, query, nonce, body or ''])
            headers = {
                'Content-Type': 'application/json',
                'api-nonce': nonce,
                'api-key': self.apiKey,
                'api-signature': self.hmac (self.encode (request), self.encode (self.secret)),
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class bitso (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bitso',
            'name': 'Bitso',
            'countries': 'MX', # Mexico
            'rateLimit': 2000, # 30 requests per minute
            'version': 'v3',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg',
                'api': 'https://api.bitso.com',
                'www': 'https://bitso.com',
                'doc': 'https://bitso.com/api_info',
            },
            'api': {
                'public': {
                    'get': [
                        'available_books',
                        'ticker',
                        'order_book',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'account_status',
                        'balance',
                        'fees',
                        'fundings',
                        'fundings/{fid}',
                        'funding_destination',
                        'kyc_documents',
                        'ledger',
                        'ledger/trades',
                        'ledger/fees',
                        'ledger/fundings',
                        'ledger/withdrawals',
                        'mx_bank_codes',
                        'open_orders',
                        'order_trades/{oid}',
                        'orders/{oid}',
                        'user_trades',
                        'user_trades/{tid}',
                        'withdrawals/',
                        'withdrawals/{wid}',
                    ],
                    'post': [
                        'bitcoin_withdrawal',
                        'debit_card_withdrawal',
                        'ether_withdrawal',
                        'orders',
                        'phone_number',
                        'phone_verification',
                        'phone_withdrawal',
                        'spei_withdrawal',
                    ],
                    'delete': [
                        'orders/{oid}',
                        'orders/all',
                    ],
                }
            },
        }
        params.update (config)
        super (bitso, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetAvailableBooks ()
        result = []
        for p in range (0, len (markets['payload'])):
            market = markets['payload'][p]
            id = market['book']
            symbol = id.upper ().replace ('_', '/')
            base, quote = symbol.split ('/')
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privateGetBalance ()
        balances = response['payload']['balances']
        result = { 'info': response }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = balance['currency'].upper ()
            account = {
                'free': float (balance['available']),
                'used': float (balance['locked']),
                'total': float (balance['total']),
            }
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        response = self.publicGetOrderBook (self.extend ({
            'book': self.market_id (market),
        }, params))
        orderbook = response['payload']
        timestamp = self.parse8601 (orderbook['updated_at'])
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['amount'])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        response = self.publicGetTicker ({
            'book': self.market_id (market),
        })
        ticker = response['payload']
        timestamp = self.parse8601 (ticker['created_at'])
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': float (ticker['vwap']),
            'open': None,
            'close': None,
            'first': None,
            'last': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTrades ({
            'book': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'book': self.market_id (market),
            'side': side,
            'type': type,
            'major': amount,
        }
        if type == 'limit':
            order['price'] = price
        return self.privatePostOrders (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privateDeleteOrders ({ 'oid': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        query = '/' + self.version + '/' + self.implode_params (path, params)
        url = self.urls['api'] + query
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            if params:
                body = self.json (params)
            nonce = str (self.nonce ())
            request = ''.join ([ nonce, method, query, body or '' ])
            signature = self.hmac (self.encode (request), self.encode (self.secret))
            auth = self.apiKey + ':' + nonce + ':' + signature
            headers = { 'Authorization': "Bitso " + auth }
        response = self.fetch (url, method, headers, body)
        if 'success' in response:
            if response['success']:
                return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class bitstamp (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bitstamp',
            'name': 'Bitstamp',
            'countries': 'GB',
            'rateLimit': 1000,
            'version': 'v2',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api': 'https://www.bitstamp.net/api',
                'www': 'https://www.bitstamp.net',
                'doc': 'https://www.bitstamp.net/api',
            },
            'api': {
                'public': {
                    'get': [
                        'order_book/{id}/',
                        'ticker_hour/{id}/',
                        'ticker/{id}/',
                        'transactions/{id}/',
                    ],
                },
                'private': {
                    'post': [
                        'balance/',
                        'balance/{id}/',
                        'buy/{id}/',
                        'buy/market/{id}/',
                        'cancel_order/',
                        'liquidation_address/info/',
                        'liquidation_address/new/',
                        'open_orders/all/',
                        'open_orders/{id}/',
                        'sell/{id}/',
                        'sell/market/{id}/',
                        'transfer-from-main/',
                        'transfer-to-main/',
                        'user_transactions/',
                        'user_transactions/{id}/',
                        'withdrawal/cancel/',
                        'withdrawal/open/',
                        'withdrawal/status/',
                        'xrp_address/',
                        'xrp_withdrawal/',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'btcusd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'BTC/EUR': { 'id': 'btceur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
                'EUR/USD': { 'id': 'eurusd', 'symbol': 'EUR/USD', 'base': 'EUR', 'quote': 'USD' },
                'XRP/USD': { 'id': 'xrpusd', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD' },
                'XRP/EUR': { 'id': 'xrpeur', 'symbol': 'XRP/EUR', 'base': 'XRP', 'quote': 'EUR' },
                'XRP/BTC': { 'id': 'xrpbtc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC' },
                'LTC/USD': { 'id': 'ltcusd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
                'LTC/EUR': { 'id': 'ltceur', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR' },
                'LTC/BTC': { 'id': 'ltcbtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
            },
        }
        params.update (config)
        super (bitstamp, self).__init__ (params)

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetOrderBookId (self.extend ({
            'id': self.market_id (market),
        }, params))
        timestamp = int (orderbook['timestamp']) * 1000
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetTickerId ({
            'id': self.market_id (market),
        })
        timestamp = int (ticker['timestamp']) * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': float (ticker['vwap']),
            'open': float (ticker['open']),
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetTransactionsId ({
            'id': self.market_id (market),
        })

    def fetch_balance (self):
        balance = self.privatePostBalance ()
        result = { 'info': balance }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            total = lowercase + '_balance'
            free = lowercase + '_available'
            used = lowercase + '_reserved'
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if free in balance:
                account['free'] = float (balance[free])
            if used in balance:
                account['used'] = float (balance[used])
            if total in balance:
                account['total'] = float (balance[total])
            result[currency] = account
        return result

    def create_order (self, market, type, side, amount, price = None, params = {}):
        method = 'privatePost' + self.capitalize (side)
        order = {
            'id': self.market_id (market),
            'amount': amount,
        }
        if type == 'market':
            method += 'Market'
        else:
            order['price'] = price
        method += 'Id'
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        return self.privatePostCancelOrder ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            if not self.uid:
                raise AuthenticationError (self.id + ' requires `' + self.id + '.uid` property for authentication')
            nonce = str (self.nonce ())
            auth = nonce + self.uid + self.apiKey
            signature = self.hmac (self.encode (auth), self.encode (self.secret))
            query = self.extend ({
                'key': self.apiKey,
                'signature': signature.upper (),
                'nonce': nonce,
            }, query)
            body = _urlencode.urlencode (query)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class bittrex (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bittrex',
            'name': 'Bittrex',
            'countries': 'US',
            'version': 'v1.1',
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api': 'https://bittrex.com/api',
                'www': 'https://bittrex.com',
                'doc': [
                    'https://bittrex.com/Home/Api',
                    'https://www.npmjs.org/package/node.bittrex.api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'marketsummary',
                        'orderbook',
                        'ticker',
                    ],
                },
                'account': {
                    'get': [
                        'balance',
                        'balances',
                        'depositaddress',
                        'deposithistory',
                        'order',
                        'orderhistory',
                        'withdrawalhistory',
                        'withdraw',
                    ],
                },
                'market': {
                    'get': [
                        'buylimit',
                        'buymarket',
                        'cancel',
                        'openorders',
                        'selllimit',
                        'sellmarket',
                    ],
                },
            },
        }
        params.update (config)
        super (bittrex, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetMarkets ()
        result = []
        for p in range (0, len (markets['result'])):
            market = markets['result'][p]
            id = market['MarketName']
            base = market['MarketCurrency']
            quote = market['BaseCurrency']
            base = self.commonCurrencyCode (base)
            quote = self.commonCurrencyCode (quote)
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.accountGetBalances ()
        balances = response['result']
        result = { 'info': balances }
        indexed = self.index_by (balances, 'Currency')
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in indexed:
                balance = indexed[currency]
                account['free'] = balance['Available']
                account['used'] = balance['Pending']
                account['total'] = balance['Balance']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        response = self.publicGetOrderbook (self.extend ({
            'market': self.market_id (market),
            'type': 'both',
            'depth': 50,
        }, params))
        orderbook = response['result']
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = { 'bids': 'buy', 'asks': 'sell' }
        keys = list (sides.keys ())
        for k in range (0, len (keys)):
            key = keys[k]
            side = sides[key]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['Rate'])
                amount = float (order['Quantity'])
                result[key].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        response = self.publicGetMarketsummary ({
            'market': self.market_id (market),
        })
        ticker = response['result'][0]
        timestamp = self.parse8601 (ticker['TimeStamp'])
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['High']),
            'low': float (ticker['Low']),
            'bid': float (ticker['Bid']),
            'ask': float (ticker['Ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['Last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['Volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetMarkethistory ({
            'market': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        method = 'marketGet' + self.capitalize (side) + type
        order = {
            'market': self.market_id (market),
            'quantity': amount,
        }
        if type == 'limit':
            order['rate'] = price
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.marketGetCancel ({ 'uuid': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/'
        if api == 'public':
            url += api + '/' + method.lower () + path
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            nonce = self.nonce ()
            url += api + '/'
            if ((api == 'account') and (path != 'withdraw')) or (path == 'openorders'):
                url += method.lower ()
            url += path + '?' + _urlencode.urlencode (self.extend ({
                'nonce': nonce,
                'apikey': self.apiKey,
            }, params))
            signature = self.hmac (self.encode (url), self.encode (self.secret), hashlib.sha512)
            headers = { 'apisign': signature }
        response = self.fetch (url, method, headers, body)
        if 'success' in response:
            if response['success']:
                return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class blinktrade (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'blinktrade',
            'name': 'BlinkTrade',
            'countries': [ 'US', 'VE', 'VN', 'BR', 'PK', 'CL' ],
            'rateLimit': 1000,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27990968-75d9c884-6470-11e7-9073-46756c8e7e8c.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://blinktrade.com',
                'doc': 'https://blinktrade.com/docs',
            },
            'api': {
                'public': {
                    'get': [
                        '{currency}/ticker',    # ?crypto_currency=BTC
                        '{currency}/orderbook', # ?crypto_currency=BTC
                        '{currency}/trades',    # ?crypto_currency=BTC&since=<TIMESTAMP>&limit=<NUMBER>
                    ],
                },
                'private': {
                    'post': [
                        'D',   # order
                        'F',   # cancel order
                        'U2',  # balance
                        'U4',  # my orders
                        'U6',  # withdraw
                        'U18', # deposit
                        'U24', # confirm withdrawal
                        'U26', # list withdrawals
                        'U30', # list deposits
                        'U34', # ledger
                        'U70', # cancel withdrawal
                    ],
                },
            },
            'markets': {
                'BTC/VEF': { 'id': 'BTCVEF', 'symbol': 'BTC/VEF', 'base': 'BTC', 'quote': 'VEF', 'brokerId': 1, 'broker': 'SurBitcoin', },
                'BTC/VND': { 'id': 'BTCVND', 'symbol': 'BTC/VND', 'base': 'BTC', 'quote': 'VND', 'brokerId': 3, 'broker': 'VBTC', },
                'BTC/BRL': { 'id': 'BTCBRL', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'brokerId': 4, 'broker': 'FoxBit', },
                'BTC/PKR': { 'id': 'BTCPKR', 'symbol': 'BTC/PKR', 'base': 'BTC', 'quote': 'PKR', 'brokerId': 8, 'broker': 'UrduBit', },
                'BTC/CLP': { 'id': 'BTCCLP', 'symbol': 'BTC/CLP', 'base': 'BTC', 'quote': 'CLP', 'brokerId': 9, 'broker': 'ChileBit', },
            },
        }
        params.update (config)
        super (blinktrade, self).__init__ (params)

    def fetch_balance (self):
        return self.privatePostU2 ({
            'BalanceReqID': self.nonce (),
        })

    def fetch_order_book (self, market, params = {}):
        p = self.market (market)
        orderbook = self.publicGetCurrencyOrderbook (self.extend ({
            'currency': p['quote'],
            'crypto_currency': p['base'],
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        p = self.market (market)
        ticker = self.publicGetCurrencyTicker ({
            'currency': p['quote'],
            'crypto_currency': p['base'],
        })
        timestamp = self.milliseconds ()
        lowercaseQuote = p['quote'].lower ()
        quoteVolume = 'vol_' + lowercaseQuote
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['vol']),
            'quoteVolume': float (ticker[quoteVolume]),
            'info': ticker,
        }

    def fetch_trades (self, market):
        p = self.market (market)
        return self.publicGetCurrencyTrades ({
            'currency': p['quote'],
            'crypto_currency': p['base'],
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        p = self.market (market)
        order = {
            'ClOrdID': self.nonce (),
            'Symbol': p['id'],
            'Side': self.capitalize (side),
            'OrdType': 2,
            'Price': price,
            'OrderQty': amount,
            'BrokerID': p['brokerId'],
        }
        return self.privatePostD (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        return self.privatePostF (self.extend ({
            'ClOrdID': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api] + '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = str (self.nonce ())
            request = self.extend ({ 'MsgType': path }, query)
            body = self.json (request)
            headers = {
                'APIKey': self.apiKey,
                'Nonce': nonce,
                'Signature': self.hmac (self.encode (nonce), self.encode (self.secret)),
                'Content-Type': 'application/json',
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class bl3p (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bl3p',
            'name': 'BL3P',
            'countries': [ 'NL', 'EU' ], # Netherlands, EU
            'rateLimit': 1000,
            'version': '1',
            'comment': 'An exchange market by BitonicNL',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg',
                'api': 'https://api.bl3p.eu',
                'www': [
                    'https://bl3p.eu',
                    'https://bitonic.nl',
                ],
                'doc': [
                    'https://github.com/BitonicNL/bl3p-api/tree/master/docs',
                    'https://bl3p.eu/api',
                    'https://bitonic.nl/en/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{market}/ticker',
                        '{market}/orderbook',
                        '{market}/trades',
                    ],
                },
                'private': {
                    'post': [
                        '{market}/money/depth/full',
                        '{market}/money/order/add',
                        '{market}/money/order/cancel',
                        '{market}/money/order/result',
                        '{market}/money/orders',
                        '{market}/money/orders/history',
                        '{market}/money/trades/fetch',
                        'GENMKT/money/info',
                        'GENMKT/money/deposit_address',
                        'GENMKT/money/new_deposit_address',
                        'GENMKT/money/wallet/history',
                        'GENMKT/money/withdraw',
                    ],
                },
            },
            'markets': {
                'BTC/EUR': { 'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
                'LTC/EUR': { 'id': 'LTCEUR', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR' },
            },
        }
        params.update (config)
        super (bl3p, self).__init__ (params)

    def fetch_balance (self):
        response = self.privatePostGENMKTMoneyInfo ()
        data = response['data']
        balance = data['wallets']
        result = { 'info': data }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balance:
                if 'available' in balance[currency]:
                    account['free'] = float (balance[currency]['available']['value'])
            if currency in balance:
                if 'balance' in balance[currency]:
                    account['total'] = float (balance[currency]['balance']['value'])
            if account['total']:
                if account['free']:
                    account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        p = self.market (market)
        response = self.publicGetMarketOrderbook (self.extend ({
            'market': p['id'],
        }, params))
        orderbook = response['data']
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = order['price_int'] / 100000
                amount = order['amount_int'] / 100000000
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetMarketTicker ({
            'market': self.market_id (market),
        })        
        timestamp = ticker['timestamp'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']['24h']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetMarketTrades ({
            'market': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        p = self.market (market)
        order = {
            'market': p['id'],
            'amount_int': amount,
            'fee_currency': p['quote'],
            'type': 'bid' if (side == 'buy') else 'ask',
        }
        if type == 'limit':
            order['price_int'] = price
        return self.privatePostMarketMoneyOrderAdd (self.extend (order, params))

    def cancel_order (self, id):
        return self.privatePostMarketMoneyOrderCancel ({ 'order_id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        request = self.implode_params (path, params)
        url = self.urls['api'] + '/' + self.version + '/' + request
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            body = _urlencode.urlencode (self.extend ({ 'nonce': nonce }, query))
            secret = base64.b64decode (self.secret)
            auth = request + "\0" + body
            signature = self.hmac (self.encode (auth), secret, hashlib.sha512, 'base64')
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
                'Rest-Key': self.apiKey,
                'Rest-Sign': signature,
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class btcchina (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'btcchina',
            'name': 'BTCChina',
            'countries': 'CN',
            'rateLimit': 1500,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg',
                'api': {
                    'public': 'https://data.btcchina.com/data',
                    'private': 'https://api.btcchina.com/api_trade_v1.php',
                },
                'www': 'https://www.btcchina.com',
                'doc': 'https://www.btcchina.com/apidocs'
            },
            'api': {
                'public': {
                    'get': [
                        'historydata',
                        'orderbook',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'BuyIcebergOrder',
                        'BuyOrder',
                        'BuyOrder2',
                        'BuyStopOrder',
                        'CancelIcebergOrder',
                        'CancelOrder',
                        'CancelStopOrder',
                        'GetAccountInfo',
                        'getArchivedOrder',
                        'getArchivedOrders',
                        'GetDeposits',
                        'GetIcebergOrder',
                        'GetIcebergOrders',
                        'GetMarketDepth',
                        'GetMarketDepth2',
                        'GetOrder',
                        'GetOrders',
                        'GetStopOrder',
                        'GetStopOrders',
                        'GetTransactions',
                        'GetWithdrawal',
                        'GetWithdrawals',
                        'RequestWithdrawal',
                        'SellIcebergOrder',
                        'SellOrder',
                        'SellOrder2',
                        'SellStopOrder',
                    ],
                },
            },
        }
        params.update (config)
        super (btcchina, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetTicker ({
            'market': 'all',
        })
        result = []
        keys = list (markets.keys ())
        for p in range (0, len (keys)):
            key = keys[p]
            market = markets[key]
            parts = key.split ('_')
            id = parts[1]
            base = id[0:3]
            quote = id[3:6]
            base = base.upper ()
            quote = quote.upper ()
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostGetAccountInfo ()
        balances = response['result']
        result = { 'info': balances }

        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if lowercase in balances['balance']:
                account['total'] = float (balances['balance'][lowercase]['amount'])
            if lowercase in balances['frozen']:
                account['used'] = float (balances['frozen'][lowercase]['amount'])
            account['free'] = account['total'] - account['used']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetOrderbook (self.extend ({
            'market': self.market_id (market),
        }, params))
        timestamp = orderbook['date'] * 1000
        result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        result['asks'] = self.sort_by (result['asks'], 0)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        tickers = self.publicGetTicker ({
            'market': p['id'],
        })
        ticker = tickers['ticker']
        timestamp = ticker['date'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': float (ticker['vwap']),
            'open': float (ticker['open']),
            'close': float (ticker['prev_close']),
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['vol']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTrades ({
            'market': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        method = 'privatePost' + self.capitalize (side) + 'Order2'
        order = {}
        id = p['id'].upper ()
        if type == 'market':
            order['params'] = [ None, amount, id ]
        else:
            order['params'] = [ price, amount, id ]
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        market = params['market'] # TODO fixme
        return self.privatePostCancelOrder (self.extend ({
            'params': [ id, market ], 
        }, params))

    def nonce (self):
        return self.microseconds ()

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api] + '/' + path
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            if not self.apiKey:
                raise AuthenticationError (self.id + ' requires `' + self.id + '.apiKey` property for authentication')
            if not self.secret:
                raise AuthenticationError (self.id + ' requires `' + self.id + '.secret` property for authentication')
            p = []
            if 'params' in params:
                p = params['params']
            nonce = self.nonce ()
            request = {
                'method': path,
                'id': nonce,
                'params': p,
            }
            p = ','.join (p)
            body = self.json (request)
            query = (
                'tonce=' + nonce +
                '&accesskey=' + self.apiKey +
                '&requestmethod=' + method.lower () +
                '&id=' + nonce +
                '&method=' + path +
                '&params=' + p
            )
            signature = self.hmac (self.encode (query), self.encode (self.secret), hashlib.sha1)
            auth = self.apiKey + ':' + signature
            headers = {
                'Content-Length': len (body),
                'Authorization': 'Basic ' + base64.b64encode (auth),
                'Json-Rpc-Tonce': nonce,
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class btce (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'btce',
            'name': 'BTC-e',
            'countries': [ 'BG', 'RU' ], # Bulgaria, Russia
            'version': '3',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27843225-1b571514-611a-11e7-9208-2641a560b561.jpg',
                'api': {
                    'public': 'https://btc-e.com/api',
                    'private': 'https://btc-e.com/tapi',
                },
                'www': 'https://btc-e.com',
                'doc': [
                    'https://btc-e.com/api/3/docs',
                    'https://btc-e.com/tapi/docs',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ],
                }
            },
        }
        params.update (config)
        super (btce, self).__init__ (params)

    def fetch_markets (self):
        response = self.publicGetInfo ()
        markets = response['pairs']
        keys = list (markets.keys ())
        result = []
        for p in range (0, len (keys)):
            id = keys[p]
            market = markets[id]
            base, quote = id.split ('_')
            base = base.upper ()
            quote = quote.upper ()
            if base == 'DSH':
                base = 'DASH'
            base = self.commonCurrencyCode (base)
            quote = self.commonCurrencyCode (quote)
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostGetInfo ()
        balances = response['return']
        result = { 'info': balances }
        funds = balances['funds']
        currencies = list (funds.keys ())
        for c in range (0, len (currencies)):
            currency = currencies[c]
            uppercase = currency.upper ()
            # they misspell DASH as dsh :/
            if uppercase == 'DSH':
                uppercase = 'DASH'
            account = {
                'free': funds[currency],
                'used': None,
                'total': funds[currency],
            }
            result[uppercase] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        response = self.publicGetDepthPair (self.extend ({
            'pair': p['id'],
        }, params))
        if p['id'] in response:
            orderbook = response[p['id']]
            timestamp = self.milliseconds ()
            result = {
                'bids': orderbook['bids'],
                'asks': orderbook['asks'],
                'timestamp': timestamp,
                'datetime': self.iso8601 (timestamp),
            }
            result['bids'] = self.sort_by (result['bids'], 0, True)
            result['asks'] = self.sort_by (result['asks'], 0)
            return result
        raise ExchangeError (self.id + ' ' + p['symbol'] + ' order book is empty or not available')

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        tickers = self.publicGetTickerPair ({
            'pair': p['id'],
        })
        ticker = tickers[p['id']]
        timestamp = ticker['updated'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': ticker['high'] if ticker['high'] else None,
            'low': ticker['low'] if ticker['low'] else None,
            'bid': ticker['buy'] if ticker['sell'] else None,
            'ask': ticker['sell'] if ticker['buy'] else None,
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': ticker['last'] if ticker['last'] else None,
            'change': None,
            'percentage': None,
            'average': ticker['avg'] if ticker['avg'] else None,
            'baseVolume': ticker['vol_cur'] if ticker['vol_cur'] else None,
            'quoteVolume': ticker['vol'] if ticker['vol'] else None,
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTradesPair ({
            'pair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'pair': self.market_id (market),
            'type': side,
            'amount': amount,
            'rate': price,
        }
        return self.privatePostTrade (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostCancelOrder ({ 'order_id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api] + '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            body = _urlencode.urlencode (self.extend ({
                'nonce': nonce,
                'method': path,
            }, query))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
                'Key': self.apiKey,
                'Sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class btctrader (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'btctrader',
            'name': 'BTCTrader',
            'countries': [ 'TR', 'GR', 'PH' ], # Turkey, Greece, Philippines
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27992404-cda1e386-649c-11e7-8dc1-40bbd2897768.jpg',
                'api': 'https://www.btctrader.com/api',
                'www': 'https://www.btctrader.com',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'api': {
                'public': {
                    'get': [
                        'ohlcdata', # ?last=COUNT
                        'orderbook',
                        'ticker',
                        'trades',   # ?last=COUNT (max 50)
        
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'openOrders',
                        'userTransactions', # ?offset=0&limit=25&sort=asc
        
                    ],
                    'post': [
                        'buy',
                        'cancelOrder',
                        'sell',
                    ],
                },
            },
        }
        params.update (config)
        super (btctrader, self).__init__ (params)

    def fetch_balance (self):
        response = self.privateGetBalance ()
        result = { 'info': response }
        base = { 
            'free': response['bitcoin_available'],
            'used': response['bitcoin_reserved'],
            'total': response['bitcoin_balance'],
        }
        quote = {
            'free': response['money_available'],
            'used': response['money_reserved'],
            'total': response['money_balance'],
        }
        symbol = self.symbols[0]
        market = self.markets[symbol]
        result[market['base']] = base
        result[market['quote']] = quote
        return result

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetOrderbook (params)
        timestamp = int (orderbook['timestamp'] * 1000)
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetTicker ()
        timestamp = int (ticker['timestamp'] * 1000)
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': float (ticker['open']),
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': float (ticker['average']),
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        maxCount = 50
        return self.publicGetTrades ()

    def create_order (self, market, type, side, amount, price = None, params = {}):
        method = 'privatePost' + self.capitalize (side)
        order = {
            'Type': 'BuyBtc' if (side == 'buy') else 'SelBtc',
            'IsMarketOrder': 1 if (type == 'market') else 0,
        }
        if type == 'market':
            if side == 'buy':
                order['Total'] = amount
            else:
                order['Amount'] = amount
        else:
            order['Price'] = price
            order['Amount'] = amount
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        return self.privatePostCancelOrder ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        if self.id == 'btctrader':
            raise ExchangeError (self.id + ' is an abstract base API for BTCExchange, BTCTurk')
        url = self.urls['api'] + '/' + path
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            nonce = self.nonce ().toString
            body = _urlencode.urlencode (params)
            secret = self.base64ToString (self.secret)
            auth = self.apiKey + nonce
            headers = {
                'X-PCK': self.apiKey,
                'X-Stamp': str (nonce),
                'X-Signature': self.hmac (self.encode (auth), secret, hashlib.sha256, 'base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class btcexchange (btctrader):

    def __init__ (self, config = {}):
        params = {
            'id': 'btcexchange',
            'name': 'BTCExchange',
            'countries': 'PH', # Philippines
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg',
                'api': 'https://www.btcexchange.ph/api',
                'www': 'https://www.btcexchange.ph',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'markets': {
                'BTC/PHP': { 'id': 'BTC/PHP', 'symbol': 'BTC/PHP', 'base': 'BTC', 'quote': 'PHP' },
            },
        }
        params.update (config)
        super (btcexchange, self).__init__ (params)

#------------------------------------------------------------------------------

class btctradeua (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'btctradeua',
            'name': 'BTC Trade UA',
            'countries': 'UA', # Ukraine,
            'rateLimit': 3000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg',
                'api': 'https://btc-trade.com.ua/api',
                'www': 'https://btc-trade.com.ua',
                'doc': 'https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit',
            },
            'api': {
                'public': {
                    'get': [
                        'deals/{symbol}',
                        'trades/sell/{symbol}',
                        'trades/buy/{symbol}',
                        'japan_stat/high/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'auth',
                        'ask/{symbol}',
                        'balance',
                        'bid/{symbol}',
                        'buy/{symbol}',
                        'my_orders/{symbol}',
                        'order/status/{id}',
                        'remove/order/{id}',
                        'sell/{symbol}',
                    ],
                },
            },
            'markets': {
                'BTC/UAH': { 'id': 'btc_uah', 'symbol': 'BTC/UAH', 'base': 'BTC', 'quote': 'UAH' },
                'ETH/UAH': { 'id': 'eth_uah', 'symbol': 'ETH/UAH', 'base': 'ETH', 'quote': 'UAH' },
                'LTC/UAH': { 'id': 'ltc_uah', 'symbol': 'LTC/UAH', 'base': 'LTC', 'quote': 'UAH' },
                'DOGE/UAH': { 'id': 'doge_uah', 'symbol': 'DOGE/UAH', 'base': 'DOGE', 'quote': 'UAH' },
                'DASH/UAH': { 'id': 'dash_uah', 'symbol': 'DASH/UAH', 'base': 'DASH', 'quote': 'UAH' },
                'SIB/UAH': { 'id': 'sib_uah', 'symbol': 'SIB/UAH', 'base': 'SIB', 'quote': 'UAH' },
                'KRB/UAH': { 'id': 'krb_uah', 'symbol': 'KRB/UAH', 'base': 'KRB', 'quote': 'UAH' },
                'NVC/UAH': { 'id': 'nvc_uah', 'symbol': 'NVC/UAH', 'base': 'NVC', 'quote': 'UAH' },
                'LTC/BTC': { 'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
                'NVC/BTC': { 'id': 'nvc_btc', 'symbol': 'NVC/BTC', 'base': 'NVC', 'quote': 'BTC' },
                'ITI/UAH': { 'id': 'iti_uah', 'symbol': 'ITI/UAH', 'base': 'ITI', 'quote': 'UAH' },
                'DOGE/BTC': { 'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC' },
                'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
            },
        }
        params.update (config)
        super (btctradeua, self).__init__ (params)

    def sign_in (self):
        return self.privatePostAuth ()

    def fetch_balance (self):
        response = self.privatePostBalance ()
        accounts = response['accounts']
        result = { 'info': response }
        for b in range (0, len (accounts)):
            account = accounts[b]
            currency = account['currency']
            balance = float (account['balance'])
            result[currency] = {
                'free': balance,
                'used': None,
                'total': balance,
            }
        return result

    def fetch_order_book (self, market, params = {}):
        p = self.market (market)
        bids = self.publicGetTradesBuySymbol (self.extend ({
            'symbol': p['id'],
        }, params))
        asks = self.publicGetTradesSellSymbol (self.extend ({
            'symbol': p['id'],
        }, params))
        orderbook = {
            'bids': [],
            'asks': [],
        }
        if bids:
            if 'list' in bids:
                orderbook['bids'] = bids['list']
        if asks:
            if 'list' in asks:
                orderbook['asks'] = asks['list']
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['currency_trade'])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        response = self.publicGetJapanStatHighSymbol ({
            'symbol': self.market_id (market),
        })
        ticker = response['trades']
        timestamp = self.milliseconds ()
        result = {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': None,
            'low': None,
            'bid': None,
            'ask': None,
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': None,
            'info': ticker,
        }
        tickerLength = len (ticker)
        if tickerLength > 0:
            start = max (tickerLength - 48, 0)
            for t in range (start, len (ticker)):
                candle = ticker[t]
                if result['open'] is None:
                    result['open'] = candle[1]
                if (result['high'] is None) or (result['high'] < candle[2]):
                    result['high'] = candle[2]
                if (result['low'] is None) or (result['low'] > candle[3]):
                    result['low'] = candle[3]
                if result['quoteVolume'] is None:
                    result['quoteVolume'] = -candle[5]
                else:
                    result['quoteVolume'] -= candle[5]
            last = tickerLength - 1
            result['close'] = ticker[last][4]
            result['quoteVolume'] = -1 * result['quoteVolume']
        return result

    def fetch_trades (self, market):
        return self.publicGetDealsSymbol ({
            'symbol': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        p = self.market (market)
        method = 'privatePost' + self.capitalize (side) + 'Id'
        order = {
            'count': amount,
            'currency1': p['quote'],
            'currency': p['base'],
            'price': price,
        }
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        return self.privatePostRemoveOrderId ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += self.implode_params (path, query)
        else:
            nonce = self.nonce ()
            body = _urlencode.urlencode (self.extend ({
                'out_order_id': nonce,
                'nonce': nonce,
            }, query))
            auth = body + self.secret
            headers = {
                'public-key': self.apiKey,
                'api-sign': self.hash (self.encode (auth), 'sha256'),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class btcturk (btctrader):

    def __init__ (self, config = {}):
        params = {
            'id': 'btcturk',
            'name': 'BTCTurk',
            'countries': 'TR', # Turkey
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg',
                'api': 'https://www.btcturk.com/api',
                'www': 'https://www.btcturk.com',
                'doc': 'https://github.com/BTCTrader/broker-api-docs',
            },
            'markets': {
                'BTC/TRY': { 'id': 'BTC/TRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY' },
            },
        }
        params.update (config)
        super (btcturk, self).__init__ (params)

#------------------------------------------------------------------------------

class btcx (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'btcx',
            'name': 'BTCX',
            'countries': [ 'IS', 'US', 'EU', ],
            'rateLimit': 1500, # support in english is very poor, unable to tell rate limits
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766385-9fdcc98c-5ed6-11e7-8f14-66d5e5cd47e6.jpg',
                'api': 'https://btc-x.is/api',
                'www': 'https://btc-x.is',
                'doc': 'https://btc-x.is/custom/api-document.html',
            },
            'api': {
                'public': {
                    'get': [
                        'depth/{id}/{limit}',
                        'ticker/{id}',
                        'trade/{id}/{limit}',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'cancel',
                        'history',
                        'order',
                        'redeem',
                        'trade',
                        'withdraw',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'btc/usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'BTC/EUR': { 'id': 'btc/eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            },
        }
        params.update (config)
        super (btcx, self).__init__ (params)

    def fetch_balance (self):
        balances = self.privatePostBalance ()
        result = { 'info': balances }
        currencies = list (balances.keys ())
        for c in range (0, len (currencies)):
            currency = currencies[c]
            uppercase = currency.upper ()
            account = {
                'free': balances[currency],
                'used': None,
                'total': balances[currency],
            }
            result[uppercase] = account
        return result

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetDepthIdLimit (self.extend ({
            'id': self.market_id (market),
            'limit': 1000,
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = order['price']
                amount = order['amount']
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetTickerId ({
            'id': self.market_id (market),
        })
        timestamp = ticker['time'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['sell']),
            'ask': float (ticker['buy']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetTradeIdLimit ({
            'id': self.market_id (market),
            'limit': 100,
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        return self.privatePostTrade (self.extend ({
            'type': side.upper (),
            'market': self.market_id (market),
            'amount': amount,
            'price': price,
        }, params))

    def cancel_order (self, id):
        return self.privatePostCancel ({ 'order': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/'
        if api == 'public':
            url += self.implode_params (path, params)
        else:
            nonce = self.nonce ()
            url += api
            body = _urlencode.urlencode (self.extend ({
                'Method': path.upper (),
                'Nonce': nonce,
            }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': self.apiKey,
                'Signature': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            raise ExchangeError (self.id + ' ' + self.json (response['error']))
        return response

#------------------------------------------------------------------------------

class bter (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bter',
            'name': 'Bter',
            'countries': [ 'VG', 'CN' ], # British Virgin Islands, China
            'version': '2',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27980479-cfa3188c-6387-11e7-8191-93fc4184ba5c.jpg',
                'api': {
                    'public': 'https://data.bter.com/api',
                    'private': 'https://api.bter.com/api',
                },
                'www': 'https://bter.com',
                'doc': 'https://bter.com/api2',
            },
            'api': {
                'public': {
                    'get': [
                        'pairs',
                        'marketinfo',
                        'marketlist',
                        'tickers',
                        'ticker/{id}',
                        'orderBook/{id}',
                        'trade/{id}',
                        'tradeHistory/{id}',
                        'tradeHistory/{id}/{tid}',
                    ],
                },
                'private': {
                    'post': [
                        'balances',
                        'depositAddress',
                        'newAddress',
                        'depositsWithdrawals',
                        'buy',
                        'sell',
                        'cancelOrder',
                        'cancelAllOrders',
                        'getOrder',
                        'openOrders',
                        'tradeHistory',
                        'withdraw',
                    ],
                },
            },
        }
        params.update (config)
        super (bter, self).__init__ (params)

    def fetch_markets (self):
        response = self.publicGetMarketlist ()
        markets = response['data']
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['pair']
            base = market['curr_a']
            quote = market['curr_b']
            base = self.commonCurrencyCode (base)
            quote = self.commonCurrencyCode (quote)
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        balance = self.privatePostBalances ()
        result = { 'info': balance }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if 'available' in balance:
                if currency in balance['available']:
                    account['free'] = float (balance['available'][currency])
            if 'locked' in balance:
                if currency in balance['locked']:
                    account['used'] = float (balance['locked'][currency])
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetOrderBookId (self.extend ({
            'id': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        result['asks'] = self.sort_by (result['asks'], 0)
        return result

    def parse_ticker (self, ticker, market):
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high24hr']),
            'low': float (ticker['low24hr']),
            'bid': float (ticker['highestBid']),
            'ask': float (ticker['lowestAsk']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': float (ticker['percentChange']),
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['baseVolume']),
            'quoteVolume': float (ticker['quoteVolume']),
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        tickers = self.publicGetTickers ()
        result = {}
        ids = list (tickers.keys ())
        for i in range (0, len (ids)):
            id = ids[i]
            baseId, quoteId = id.split ('_')
            base = baseId.upper ()
            quote = quoteId.upper ()
            symbol = base + '/' + quote
            ticker = tickers[id]
            market = self.markets[symbol]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetTickerId ({
            'id': p['id'],
        })
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTradeHistoryId ({
            'id': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        method = 'privatePost' + self.capitalize (side)
        order = {
            'currencyPair': self.symbol (market),
            'rate': price,
            'amount': amount,
        }
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostCancelOrder ({ 'orderNumber': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        prefix = (api + '/') if (api == 'private') else ''
        url = self.urls['api'][api] + self.version + '/1/' + prefix + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            request = { 'nonce': nonce }
            body = _urlencode.urlencode (self.extend (request, query))
            headers = {
                'Key': self.apiKey,
                'Sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
            }
        response = self.fetch (url, method, headers, body)
        if 'result' in response:
            if response['result'] != 'true':
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response        

#------------------------------------------------------------------------------

class bxinth (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'bxinth',
            'name': 'BX.in.th',
            'countries': 'TH', # Thailand
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766412-567b1eb4-5ed7-11e7-94a8-ff6a3884f6c5.jpg',
                'api': 'https://bx.in.th/api',
                'www': 'https://bx.in.th',
                'doc': 'https://bx.in.th/info/api',
            },
            'api': {
                'public': {
                    'get': [
                        '', # ticker
                        'options',
                        'optionbook',
                        'orderbook',
                        'pairing',
                        'trade',
                        'tradehistory',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'biller',
                        'billgroup',
                        'billpay',
                        'cancel',
                        'deposit',
                        'getorders',
                        'history',
                        'option-issue',
                        'option-bid',
                        'option-sell',
                        'option-myissue',
                        'option-mybid',
                        'option-myoptions',
                        'option-exercise',
                        'option-cancel',
                        'option-history',
                        'order',
                        'withdrawal',
                        'withdrawal-history',
                    ],
                },
            },
        }
        params.update (config)
        super (bxinth, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetPairing ()
        keys = list (markets.keys ())
        result = []
        for p in range (0, len (keys)):
            market = markets[keys[p]]
            id = market['pairing_id']
            base = market['primary_currency']
            quote = market['secondary_currency']
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def commonCurrencyCode (self, currency):
        # why would they use three letters instead of four for currency codes
        if currency == 'DAS':
            return 'DASH'
        if currency == 'DOG':
            return 'DOGE'
        return currency

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostBalance ()
        balance = response['balance']
        result = { 'info': balance }
        currencies = list (balance.keys ())
        for c in range (0, len (currencies)):
            currency = currencies[c]
            code = self.commonCurrencyCode (currency)
            account = {
                'free': float (balance[currency]['available']),
                'used': None,
                'total': float (balance[currency]['total']),
            }
            account['used'] = account['total'] - account['free']
            result[code] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetOrderbook (self.extend ({
            'pairing': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': None,
            'low': None,
            'bid': float (ticker['orderbook']['bids']['highbid']),
            'ask': float (ticker['orderbook']['asks']['highbid']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last_price']),
            'change': float (ticker['change']),
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume_24hours']),
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        tickers = self.publicGet ()
        result = {}
        ids = list (tickers.keys ())
        for i in range (0, len (ids)):
            id = ids[i]
            ticker = tickers[id]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        tickers = self.publicGet ({ 'pairing': p['id'] })
        id = str (p['id'])
        ticker = tickers[id]
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTrade ({
            'pairing': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        return self.privatePostOrder (self.extend ({
            'pairing': self.market_id (market),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        pairing = None # TODO fixme
        return self.privatePostCancel ({
            'order_id': id,
            'pairing': pairing,
        })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/'
        if path:
            url += path + '/'
        if params:
            url += '?' + _urlencode.urlencode (params)
        if api == 'private':
            nonce = self.nonce ()
            auth = self.apiKey + str (nonce) + self.secret
            signature = self.hash (self.encode (auth), 'sha256')
            body = _urlencode.urlencode (self.extend ({
                'key': self.apiKey,
                'nonce': nonce,
                'signature': signature,
                # twofa: self.twofa,
            }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
            }
        response = self.fetch (url, method, headers, body)
        if api == 'public':
            return response
        if 'success' in response:
            if response['success']:
                return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class ccex (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'ccex',
            'name': 'C-CEX',
            'countries': [ 'DE', 'EU', ],
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766433-16881f90-5ed8-11e7-92f8-3d92cc747a6c.jpg',
                'api': {
                    'tickers': 'https://c-cex.com/t',
                    'public': 'https://c-cex.com/t/api_pub.html',
                    'private': 'https://c-cex.com/t/api.html',
                },
                'www': 'https://c-cex.com',
                'doc': 'https://c-cex.com/?id=api',
            },
            'api': {
                'tickers': {
                    'get': [
                        'coinnames',
                        '{market}',
                        'pairs',
                        'prices',
                        'volume_{coin}',
                    ],
                },
                'public': {
                    'get': [
                        'balancedistribution',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'orderbook',
                    ],
                },
                'private': {
                    'get': [
                        'buylimit',
                        'cancel',
                        'getbalance',
                        'getbalances',
                        'getopenorders',
                        'getorder',
                        'getorderhistory',
                        'mytrades',
                        'selllimit',
                    ],
                },
            },
        }
        params.update (config)
        super (ccex, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetMarkets ()
        result = []
        for p in range (0, len (markets['result'])):
            market = markets['result'][p]
            id = market['MarketName']
            base = market['MarketCurrency']
            quote = market['BaseCurrency']
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privateGetBalances ()
        balances = response['result']
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = balance['Currency']
            account = {
                'free': balance['Available'],
                'used': balance['Pending'],
                'total': balance['Balance'],
            }
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        response = self.publicGetOrderbook (self.extend ({
            'market': self.market_id (market),
            'type': 'both',
            'depth': 100,
        }, params))
        orderbook = response['result']
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = { 'bids': 'buy', 'asks': 'sell' }
        keys = list (sides.keys ())
        for k in range (0, len (keys)):
            key = keys[k]
            side = sides[key]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['Rate'])
                amount = float (order['Quantity'])
                result[key].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = ticker['updated'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['lastprice']),
            'change': None,
            'percentage': None,
            'average': float (ticker['avg']),
            'baseVolume': None,
            'quoteVolume': float (ticker['buysupport']),
            'info': ticker,
        }

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        response = self.tickersGetMarket ({
            'market': p['id'].lower (),
        })
        ticker = response['ticker']
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetMarkethistory ({
            'market': self.market_id (market),
            'type': 'both',
            'depth': 100,
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        method = 'privateGet' + self.capitalize (side) + type
        return getattr (self, method) (self.extend ({
            'market': self.market_id (market),
            'quantity': amount,
            'rate': price,
        }, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privateGetCancel ({ 'uuid': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api]
        if api == 'private':
            nonce = str (self.nonce ())
            query = self.keysort (self.extend ({
                'a': path,
                'apikey': self.apiKey,
                'nonce': nonce,
            }, params))
            url += '?' + _urlencode.urlencode (query)
            headers = { 'apisign': self.hmac (self.encode (url), self.encode (self.secret), hashlib.sha512) }
        elif api == 'public':
            url += '?' + _urlencode.urlencode (self.extend ({
                'a': 'get' + path,
            }, params))
        else:
            url += '/' + self.implode_params (path, params) + '.json'
        response = self.fetch (url, method, headers, body)
        if api == 'tickers':
            return response
        if 'success' in response:
            if response['success']:
                return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class cex (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'cex',
            'name': 'CEX.IO',
            'countries': [ 'GB', 'EU', 'CY', 'RU', ],
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
                'api': 'https://cex.io/api',
                'www': 'https://cex.io',
                'doc': 'https://cex.io/cex-api',
            },
            'api': {
                'public': {
                    'get': [
                        'currency_limits',
                        'last_price/{pair}',
                        'last_prices/{currencies}',
                        'ohlcv/hd/{yyyymmdd}/{pair}',
                        'order_book/{pair}',
                        'ticker/{pair}',
                        'tickers/{currencies}',
                        'trade_history/{pair}',
                    ],
                    'post': [
                        'convert/{pair}',
                        'price_stats/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'active_orders_status/',
                        'archived_orders/{pair}',
                        'balance/',
                        'cancel_order/',
                        'cancel_orders/{pair}',
                        'cancel_replace_order/{pair}',
                        'close_position/{pair}',
                        'get_address/',
                        'get_myfee/',
                        'get_order/',
                        'get_order_tx/',
                        'open_orders/{pair}',
                        'open_orders/',
                        'open_position/{pair}',
                        'open_positions/{pair}',
                        'place_order/{pair}',
                        'place_order/{pair}',
                    ],
                }
            },
        }
        params.update (config)
        super (cex, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetCurrencyLimits ()
        result = []
        for p in range (0, len (markets['data']['pairs'])):
            market = markets['data']['pairs'][p]
            id = market['symbol1'] + '/' + market['symbol2']
            symbol = id
            base, quote = symbol.split ('/')
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        balances = self.privatePostBalance ()
        result = { 'info': balances }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': float (balances[currency]['available']),
                'used': float (balances[currency]['orders']),
                'total': None,
            }
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook =  self.publicGetOrderBookPair (self.extend ({
            'pair': self.market_id (market),
        }, params))
        timestamp = orderbook['timestamp'] * 1000
        result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        return result

    def parse_ticker (self, ticker, market):
        timestamp = int (ticker['timestamp']) * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        currencies = '/'.join (self.currencies)
        response = self.publicGetTickersCurrencies ({
            'currencies': currencies,
        })
        tickers = response['data']
        result = {}
        for t in range (0, len (tickers)):
            ticker = tickers[t]
            symbol = ticker['pair'].replace (':', '/')
            market = self.markets[symbol]            
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetTickerPair ({
            'pair': p['id'],
        })
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTradeHistoryPair ({
            'pair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'pair': self.market_id (market),
            'type': side,
            'amount': amount,
        }
        if type == 'limit':
            order['price'] = price
        else:
            order['order_type'] = type
        return self.privatePostPlaceOrderPair (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostCancelOrder ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            if not self.uid:
                raise AuthenticationError (self.id + ' requires `' + self.id + '.uid` property for authentication')
            nonce = str (self.nonce ())
            auth = nonce + self.uid + self.apiKey
            signature = self.hmac (self.encode (auth), self.encode (self.secret))
            body = _urlencode.urlencode (self.extend ({
                'key': self.apiKey,
                'signature': signature.upper (),
                'nonce': nonce,
            }, query))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
            }
        response = self.fetch (url, method, headers, body)
        if 'e' in response:
            if 'ok' in response:
                if response['ok'] == 'ok':
                    return response
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class chbtc (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'chbtc',
            'name': 'CHBTC',
            'countries': 'CN',
            'rateLimit': 1000,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg',
                'api': {
                    'public': 'http://api.chbtc.com/data', # no https for public API
                    'private': 'https://trade.chbtc.com/api',
                },
                'www': 'https://trade.chbtc.com/api',
                'doc': 'https://www.chbtc.com/i/developer',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                    ],
                },
                'private': {
                    'post': [
                        'order',
                        'cancelOrder',
                        'getOrder',
                        'getOrders',
                        'getOrdersNew',
                        'getOrdersIgnoreTradeType',
                        'getUnfinishedOrdersIgnoreTradeType',
                        'getAccountInfo',
                        'getUserAddress',
                        'getWithdrawAddress',
                        'getWithdrawRecord',
                        'getChargeRecord',
                        'getCnyWithdrawRecord',
                        'getCnyChargeRecord',
                        'withdraw',
                    ],
                },
            },
            'markets': {
                'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', },
                'LTC/CNY': { 'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', },
                'ETH/CNY': { 'id': 'eth_cny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY', },
                'ETC/CNY': { 'id': 'etc_cny', 'symbol': 'ETC/CNY', 'base': 'ETC', 'quote': 'CNY', },
                'BTS/CNY': { 'id': 'bts_cny', 'symbol': 'BTS/CNY', 'base': 'BTS', 'quote': 'CNY', },
                'EOS/CNY': { 'id': 'eos_cny', 'symbol': 'EOS/CNY', 'base': 'EOS', 'quote': 'CNY', },
            },
        }
        params.update (config)
        super (chbtc, self).__init__ (params)

    def fetch_balance (self):
        response = self.privatePostGetAccountInfo ()
        balances = response['result']
        result = { 'info': balances }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balances['balance']:
                account['free'] = balances['balance'][currency]['amount']
            if currency in balances['frozen']:
                account['used'] = balances['frozen'][currency]['amount']
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        p = self.market (market)
        orderbook = self.publicGetDepth (self.extend ({
            'currency': p['id'],
        }, params))
        timestamp = self.milliseconds ()
        bids = None
        asks = None
        if 'bids' in orderbook:
            bids = orderbook['bids']
        if 'asks' in orderbook:
            asks = orderbook['asks']
        result = {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        if result['bids']:
            result['bids'] = self.sort_by (result['bids'], 0, True)
        if result['asks']:
            result['asks'] = self.sort_by (result['asks'], 0)
        return result

    def fetch_ticker (self, market):
        response = self.publicGetTicker ({
            'currency': self.market_id (market),
        })
        ticker = response['ticker']
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['vol']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetTrades ({
            'currency': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        paramString = '&price=' + str (price)
        paramString += '&amount=' + str (amount)
        tradeType = '1' if (side == 'buy') else '0'
        paramString += '&tradeType=' + tradeType
        paramString += '&currency=' + self.market_id (market)
        return self.privatePostOrder (paramString)

    def cancel_order (self, id, params = {}):
        paramString = '&id=' + str (id)
        if 'currency' in params:
            paramString += '&currency=' + params['currency']
        return self.privatePostCancelOrder (paramString)

    def fetchOrder (self, id, params = {}):
        paramString = '&id=' + str (id)
        if 'currency' in params:
            paramString += '&currency=' + params['currency']
        return self.privatePostGetOrder (paramString)

    def nonce (self):
        return self.milliseconds ()

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api] 
        if api == 'public':
            url += '/' + self.version + '/' + path
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            paramsLength = len (params) # params should be a string herenot 
            nonce = self.nonce ()            
            auth = 'method=' + path            
            auth += '&accesskey=' + self.apiKey            
            auth += params if paramsLength else ''
            secret = self.hash (self.encode (self.secret), 'sha1')
            signature = self.hmac (self.encode (auth), self.encode (secret), hashlib.md5)
            suffix = 'sign=' + signature + '&reqTime=' + str (nonce)
            url += '/' + path + '?' + auth + '&' + suffix
        response = self.fetch (url, method, headers, body)
        if api == 'private':
            if 'code' in response:
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class chilebit (blinktrade):

    def __init__ (self, config = {}):
        params = {
            'id': 'chilebit',
            'name': 'ChileBit',
            'countries': 'CL',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://chilebit.net',
                'doc': 'https://blinktrade.com/docs',
            },
            'comment': 'Blinktrade API',
            'markets': {
                'BTC/CLP': { 'id': 'BTCCLP', 'symbol': 'BTC/CLP', 'base': 'BTC', 'quote': 'CLP', 'brokerId': 9, 'broker': 'ChileBit', },
            },
        }
        params.update (config)
        super (chilebit, self).__init__ (params)

#------------------------------------------------------------------------------

class coincheck (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'coincheck',
            'name': 'coincheck',
            'countries': [ 'JP', 'ID', ],
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg',
                'api': 'https://coincheck.com/api',
                'www': 'https://coincheck.com',
                'doc': 'https://coincheck.com/documents/exchange/api',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/orders/rate',
                        'order_books',
                        'rate/{pair}',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/balance',
                        'accounts/leverage_balance',
                        'bank_accounts',
                        'deposit_money',
                        'exchange/orders/opens',
                        'exchange/orders/transactions',
                        'exchange/orders/transactions_pagination',
                        'exchange/leverage/positions',
                        'lending/borrows/matches',
                        'send_money',
                        'withdraws',
                    ],
                    'post': [
                        'bank_accounts',
                        'deposit_money/{id}/fast',
                        'exchange/orders',
                        'exchange/transfers/to_leverage',
                        'exchange/transfers/from_leverage',
                        'lending/borrows',
                        'lending/borrows/{id}/repay',
                        'send_money',
                        'withdraws',
                    ],
                    'delete': [
                        'bank_accounts/{id}',
                        'exchange/orders/{id}',
                        'withdraws/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/JPY':  { 'id': 'btc_jpy',  'symbol': 'BTC/JPY',  'base': 'BTC',  'quote': 'JPY' }, # the only real pair
                'ETH/JPY':  { 'id': 'eth_jpy',  'symbol': 'ETH/JPY',  'base': 'ETH',  'quote': 'JPY' },
                'ETC/JPY':  { 'id': 'etc_jpy',  'symbol': 'ETC/JPY',  'base': 'ETC',  'quote': 'JPY' },
                'DAO/JPY':  { 'id': 'dao_jpy',  'symbol': 'DAO/JPY',  'base': 'DAO',  'quote': 'JPY' },
                'LSK/JPY':  { 'id': 'lsk_jpy',  'symbol': 'LSK/JPY',  'base': 'LSK',  'quote': 'JPY' },
                'FCT/JPY':  { 'id': 'fct_jpy',  'symbol': 'FCT/JPY',  'base': 'FCT',  'quote': 'JPY' },
                'XMR/JPY':  { 'id': 'xmr_jpy',  'symbol': 'XMR/JPY',  'base': 'XMR',  'quote': 'JPY' },
                'REP/JPY':  { 'id': 'rep_jpy',  'symbol': 'REP/JPY',  'base': 'REP',  'quote': 'JPY' },
                'XRP/JPY':  { 'id': 'xrp_jpy',  'symbol': 'XRP/JPY',  'base': 'XRP',  'quote': 'JPY' },
                'ZEC/JPY':  { 'id': 'zec_jpy',  'symbol': 'ZEC/JPY',  'base': 'ZEC',  'quote': 'JPY' },
                'XEM/JPY':  { 'id': 'xem_jpy',  'symbol': 'XEM/JPY',  'base': 'XEM',  'quote': 'JPY' },
                'LTC/JPY':  { 'id': 'ltc_jpy',  'symbol': 'LTC/JPY',  'base': 'LTC',  'quote': 'JPY' },
                'DASH/JPY': { 'id': 'dash_jpy', 'symbol': 'DASH/JPY', 'base': 'DASH', 'quote': 'JPY' },
                'ETH/BTC':  { 'id': 'eth_btc',  'symbol': 'ETH/BTC',  'base': 'ETH',  'quote': 'BTC' },
                'ETC/BTC':  { 'id': 'etc_btc',  'symbol': 'ETC/BTC',  'base': 'ETC',  'quote': 'BTC' },
                'LSK/BTC':  { 'id': 'lsk_btc',  'symbol': 'LSK/BTC',  'base': 'LSK',  'quote': 'BTC' },
                'FCT/BTC':  { 'id': 'fct_btc',  'symbol': 'FCT/BTC',  'base': 'FCT',  'quote': 'BTC' },
                'XMR/BTC':  { 'id': 'xmr_btc',  'symbol': 'XMR/BTC',  'base': 'XMR',  'quote': 'BTC' },
                'REP/BTC':  { 'id': 'rep_btc',  'symbol': 'REP/BTC',  'base': 'REP',  'quote': 'BTC' },
                'XRP/BTC':  { 'id': 'xrp_btc',  'symbol': 'XRP/BTC',  'base': 'XRP',  'quote': 'BTC' },
                'ZEC/BTC':  { 'id': 'zec_btc',  'symbol': 'ZEC/BTC',  'base': 'ZEC',  'quote': 'BTC' },
                'XEM/BTC':  { 'id': 'xem_btc',  'symbol': 'XEM/BTC',  'base': 'XEM',  'quote': 'BTC' },
                'LTC/BTC':  { 'id': 'ltc_btc',  'symbol': 'LTC/BTC',  'base': 'LTC',  'quote': 'BTC' },
                'DASH/BTC': { 'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
            },
        }
        params.update (config)
        super (coincheck, self).__init__ (params)

    def fetch_balance (self):
        balances = self.privateGetAccountsBalance ()
        result = { 'info': balances }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if lowercase in balances:
                account['free'] = float (balances[lowercase])
            reserved = lowercase + '_reserved'
            if reserved in balances:
                account['used'] = float (balances[reserved])
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        orderbook =  self.publicGetOrderBooks (params)
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetTicker ()
        timestamp = ticker['timestamp'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetTrades ()

    def create_order (self, market, type, side, amount, price = None, params = {}):
        prefix = ''
        order = {
            'pair': self.market_id (market),
        }
        if type == 'market':
            order_type = type + '_' + side
            order['order_type'] = order_type
            prefix = (order_type + '_') if (side == buy) else ''
            order[prefix + 'amount'] = amount
        else:
            order['order_type'] = side
            order['rate'] = price
            order['amount'] = amount
        return self.privatePostExchangeOrders (self.extend (order, params))

    def cancel_order (self, id):
        return self.privateDeleteExchangeOrdersId ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = str (self.nonce ())
            length = 0
            if query:
                body = _urlencode.urlencode (self.keysort (query))
                length = len (body)
            auth = nonce + url + (body or '')
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': length,
                'ACCESS-KEY': self.apiKey,
                'ACCESS-NONCE': nonce,
                'ACCESS-SIGNATURE': self.hmac (self.encode (auth), self.encode (self.secret)),
            }
        response = self.fetch (url, method, headers, body)
        if api == 'public':
            return response
        if 'success' in response:
            if response['success']:
                return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class coingi (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'coingi',
            'name': 'Coingi',
            'rateLimit': 1000,
            'countries': [ 'PA', 'BG', 'CN', 'US' ], # Panama, Bulgaria, China, US
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg',
                'api': 'https://api.coingi.com',
                'www': 'https://coingi.com',
                'doc': 'http://docs.coingi.apiary.io/',
            },
            'api': {
                'current': {
                    'get': [
                        'order-book/{pair}/{askCount}/{bidCount}/{depth}',
                        'transactions/{pair}/{maxCount}',
                        '24hour-rolling-aggregation',
                    ],
                },
                'user': {
                    'post': [
                        'balance',
                        'add-order',
                        'cancel-order',
                        'orders',
                        'transactions',
                        'create-crypto-withdrawal',
                    ],
                },
            },
            'markets': {
                'LTC/BTC': { 'id': 'ltc-btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC' },
                'PPC/BTC': { 'id': 'ppc-btc', 'symbol': 'PPC/BTC', 'base': 'PPC', 'quote': 'BTC' },
                'DOGE/BTC': { 'id': 'doge-btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC' },
                'VTC/BTC': { 'id': 'vtc-btc', 'symbol': 'VTC/BTC', 'base': 'VTC', 'quote': 'BTC' },
                'FTC/BTC': { 'id': 'ftc-btc', 'symbol': 'FTC/BTC', 'base': 'FTC', 'quote': 'BTC' },
                'NMC/BTC': { 'id': 'nmc-btc', 'symbol': 'NMC/BTC', 'base': 'NMC', 'quote': 'BTC' },
                'DASH/BTC': { 'id': 'dash-btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC' },
            },
        }
        params.update (config)
        super (coingi, self).__init__ (params)

    def fetch_balance (self):
        currencies = []
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c].lower ()
            currencies.append (currency)
        balances = self.userPostBalance ({
            'currencies': ','.join (currencies)
        })
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = balance['currency']['name']
            currency = currency.upper ()
            account = {
                'free': balance['available'],
                'used': balance['blocked'] + balance['inOrders'] + balance['withdrawing'],
                'total': None,
            }
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        p = self.market (market)
        orderbook = self.currentGetOrderBookPairAskCountBidCountDepth (self.extend ({
            'pair': p['id'],
            'askCount': 512, # maximum returned number of asks 1-512
            'bidCount': 512, # maximum returned number of bids 1-512
            'depth': 32, # maximum number of depth range steps 1-32
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = order['price']
                amount = order['baseAmount']
                result[side].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['highestBid'],
            'ask': ticker['lowestAsk'],
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': ticker['baseVolume'],
            'quoteVolume': ticker['counterVolume'],
            'info': ticker,
        }
        return ticker

    def fetch_tickers (self):
        response = self.currentGet24hourRollingAggregation ()
        result = {}
        for t in range (0, len (response)):
            ticker = response[t]
            base = ticker['currencyPair']['base'].upper ()
            quote = ticker['currencyPair']['counter'].upper ()
            symbol = base + '/' + quote
            market = self.markets[symbol]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        response = self.currentGet24hourRollingAggregation ()
        tickers = {}
        for t in range (0, len (response)):
            ticker = response[t]
            base = ticker['currencyPair']['base'].upper ()
            quote = ticker['currencyPair']['counter'].upper ()
            symbol = base + '/' + quote
            tickers[symbol] = ticker
        p = self.market (market)
        symbol = p['symbol']
        if symbol in tickers:
            ticker = tickers[symbol]
            return self.parse_ticker (ticker, p)
        raise ExchangeError (self.id + ' ' + symbol + ' ticker not found')

    def fetch_trades (self, market):
        return self.publicGetTransactionsPairMaxCount ({
            'pair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        order = {
            'currencyPair': self.market_id (market),
            'volume': amount,
            'price': price,
            'orderType': 0 if (side == 'buy') else 1,
        }
        return self.userPostAddOrder (self.extend (order, params))

    def cancel_order (self, id):
        return self.userPostCancelOrder ({ 'orderId': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + api + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'current':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            request = self.extend ({
                'token': self.apiKey,
                'nonce': nonce,
            }, query)
            auth = str (nonce) + '$' + self.apiKey
            request['signature'] = self.hmac (self.encode (auth), self.encode (self.secret))
            body = self.json (request)            
            headers = {
                'Content-Type': 'application/json',
                'Content-Length': len (body),
            }
        response = self.fetch (url, method, headers, body)
        if 'errors' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class coinmarketcap (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'coinmarketcap',
            'name': 'CoinMarketCap',
            'rateLimit': 10000,
            'version': 'v1',
            'countries': 'US',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg',
                'api': 'https://api.coinmarketcap.com',
                'www': 'https://coinmarketcap.com',
                'doc': 'https://coinmarketcap.com/api',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker/',
                        'ticker/{id}/',
                        'global/',
                    ],
                },
            },
            'currencies': [
                'AUD',
                'BRL',
                'CAD',
                'CHF',
                'CNY',
                'EUR',
                'GBP',
                'HKD',
                'IDR',
                'INR',
                'JPY',
                'KRW',
                'MXN',
                'RUB',
                'USD',
            ],
        }
        params.update (config)
        super (coinmarketcap, self).__init__ (params)

    def fetch_order_book (self, market, params = {}):
        raise ExchangeError ('Fetching order books is not supported by the API of ' + self.id)

    def fetch_markets (self):
        markets = self.publicGetTicker ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            for c in range (0, len (self.currencies)):
                base = market['symbol']                
                baseId = market['id']
                quote = self.currencies[c]
                quoteId = quote.lower ()
                symbol = base + '/' + quote
                id = baseId + '/' + quote
                result.append ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'info': market,
                })
        return result

    def fetchGlobal (self, currency = 'USD'):
        self.loadMarkets ()
        request = {}
        if currency:
            request['convert'] = currency
        return self.publicGetGlobal (request)

    def parse_ticker (self, ticker, market):
        timestamp = int (ticker['last_updated']) * 1000
        volume = None
        volumeKey = '24h_volume_' + market['quoteId']
        if ticker[volumeKey]:
            volume = float (ticker[volumeKey])
        price = 'price_' + market['quoteId']
        change = None
        changeKey = 'percent_change_24h'
        if ticker[changeKey]:
            change = float (ticker[changeKey])
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': None,
            'low': None,
            'bid': None,
            'ask': None,
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker[price]),
            'change': change,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': volume,
            'info': ticker,
        }

    def fetch_tickers (self, currency = 'USD'):
        self.loadMarkets ()
        request = {}
        if currency:
            request['convert'] = currency
        response = self.publicGetTicker (request)
        tickers = {}
        for t in range (0, len (response)):
            ticker = response[t]
            id = ticker['id'] + '/' + currency
            market = self.markets_by_id[id]
            symbol = market['symbol']
            tickers[symbol] = self.parse_ticker (ticker, market)
        return tickers

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        request = {
            'convert': p['quote'],
            'id': p['baseId'],
        }
        response = self.publicGetTickerId (request)
        ticker = response[0]
        return self.parse_ticker (ticker, p)

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if query:
            url += '?' + _urlencode.urlencode (query)
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class coinmate (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'coinmate',
            'name': 'CoinMate',
            'countries': [ 'GB', 'CZ' ], # UK, Czech Republic
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27811229-c1efb510-606c-11e7-9a36-84ba2ce412d8.jpg',
                'api': 'https://coinmate.io/api',
                'www': 'https://coinmate.io',
                'doc': [
                    'http://docs.coinmate.apiary.io',
                    'https://coinmate.io/developers',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'orderBook',
                        'ticker',
                        'transactions',
                    ],
                },
                'private': {
                    'post': [
                        'balances',
                        'bitcoinWithdrawal',
                        'bitcoinDepositAddresses',
                        'buyInstant',
                        'buyLimit',
                        'cancelOrder',
                        'cancelOrderWithInfo',
                        'createVoucher',
                        'openOrders',
                        'redeemVoucher',
                        'sellInstant',
                        'sellLimit',
                        'transactionHistory',
                        'unconfirmedBitcoinDeposits',
                    ],
                },
            },
            'markets': {
                'BTC/EUR': { 'id': 'BTC_EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR'  },
                'BTC/CZK': { 'id': 'BTC_CZK', 'symbol': 'BTC/CZK', 'base': 'BTC', 'quote': 'CZK'  },
            },
        }
        params.update (config)
        super (coinmate, self).__init__ (params)

    def fetch_balance (self):
        response = self.privatePostBalances ()
        balances = response['data']
        result = { 'info': balances }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in balances:
                account['free'] = balances[currency]['available']
                account['used'] = balances[currency]['reserved']
                account['total'] = balances[currency]['balance']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        response = self.publicGetOrderBook (self.extend ({
            'currencyPair': self.market_id (market),
            'groupByPriceLimit': 'False',
        }, params))
        orderbook = response['data']
        timestamp = orderbook['timestamp'] * 1000
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = order['price']
                amount = order['amount']
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        response = self.publicGetTicker ({
            'currencyPair': self.market_id (market),
        })
        ticker = response['data']
        timestamp = ticker['timestamp'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['amount']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetTransactions ({
            'currencyPair': self.market_id (market),
            'minutesIntoHistory': 10,
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        method = 'privatePost' + self.capitalize (side)
        order = {
            'currencyPair': self.market_id (market),
        }
        if type == 'market':
            if side == 'buy':
                order['total'] = amount # amount in fiat
            else:
                order['amount'] = amount # amount in fiat
            method += 'Instant'
        else:
            order['amount'] = amount # amount in crypto
            order['price'] = price
            method += self.capitalize (type)
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        return self.privatePostCancelOrder ({ 'orderId': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + path
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            if not self.uid:
                raise AuthenticationError (self.id + ' requires `' + self.id + '.uid` property for authentication')
            nonce = str (self.nonce ())
            auth = nonce + self.uid + self.apiKey
            signature = self.hmac (self.encode (auth), self.encode (self.secret))
            body = _urlencode.urlencode (self.extend ({
                'clientId': self.uid,
                'nonce': nonce,
                'publicKey': self.apiKey,
                'signature': signature.upper (),
            }, params))
            headers = {
                'Content-Type':  'application/x-www-form-urlencoded',
            }
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            if response['error']:
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class coinsecure (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'coinsecure',
            'name': 'Coinsecure',
            'countries': 'IN', # India
            'rateLimit': 1000,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766472-9cbd200a-5ed9-11e7-9551-2267ad7bac08.jpg',
                'api': 'https://api.coinsecure.in',
                'www': 'https://coinsecure.in',
                'doc': [
                    'https://api.coinsecure.in',
                    'https://github.com/coinsecure/plugins',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'bitcoin/search/confirmation/{txid}',
                        'exchange/ask/low',
                        'exchange/ask/orders',
                        'exchange/bid/high',
                        'exchange/bid/orders',
                        'exchange/lastTrade',
                        'exchange/max24Hr',
                        'exchange/min24Hr',
                        'exchange/ticker',
                        'exchange/trades',
                    ],
                },
                'private': {
                    'get': [
                        'mfa/authy/call',
                        'mfa/authy/sms',
                        'netki/search/{netkiName}',
                        'user/bank/otp/{number}',
                        'user/kyc/otp/{number}',
                        'user/profile/phone/otp/{number}',
                        'user/wallet/coin/address/{id}',
                        'user/wallet/coin/deposit/confirmed/all',
                        'user/wallet/coin/deposit/confirmed/{id}',
                        'user/wallet/coin/deposit/unconfirmed/all',
                        'user/wallet/coin/deposit/unconfirmed/{id}',
                        'user/wallet/coin/wallets',
                        'user/exchange/bank/fiat/accounts',
                        'user/exchange/bank/fiat/balance/available',
                        'user/exchange/bank/fiat/balance/pending',
                        'user/exchange/bank/fiat/balance/total',
                        'user/exchange/bank/fiat/deposit/cancelled',
                        'user/exchange/bank/fiat/deposit/unverified',
                        'user/exchange/bank/fiat/deposit/verified',
                        'user/exchange/bank/fiat/withdraw/cancelled',
                        'user/exchange/bank/fiat/withdraw/completed',
                        'user/exchange/bank/fiat/withdraw/unverified',
                        'user/exchange/bank/fiat/withdraw/verified',
                        'user/exchange/ask/cancelled',
                        'user/exchange/ask/completed',
                        'user/exchange/ask/pending',
                        'user/exchange/bid/cancelled',
                        'user/exchange/bid/completed',
                        'user/exchange/bid/pending',
                        'user/exchange/bank/coin/addresses',
                        'user/exchange/bank/coin/balance/available',
                        'user/exchange/bank/coin/balance/pending',
                        'user/exchange/bank/coin/balance/total',
                        'user/exchange/bank/coin/deposit/cancelled',
                        'user/exchange/bank/coin/deposit/unverified',
                        'user/exchange/bank/coin/deposit/verified',
                        'user/exchange/bank/coin/withdraw/cancelled',
                        'user/exchange/bank/coin/withdraw/completed',
                        'user/exchange/bank/coin/withdraw/unverified',
                        'user/exchange/bank/coin/withdraw/verified',
                        'user/exchange/bank/summary',
                        'user/exchange/coin/fee',
                        'user/exchange/fiat/fee',
                        'user/exchange/kycs',
                        'user/exchange/referral/coin/paid',
                        'user/exchange/referral/coin/successful',
                        'user/exchange/referral/fiat/paid',
                        'user/exchange/referrals',
                        'user/exchange/trade/summary',
                        'user/login/token/{token}',
                        'user/summary',
                        'user/wallet/summary',
                        'wallet/coin/withdraw/cancelled',
                        'wallet/coin/withdraw/completed',
                        'wallet/coin/withdraw/unverified',
                        'wallet/coin/withdraw/verified',
                    ],
                    'post': [
                        'login',
                        'login/initiate',
                        'login/password/forgot',
                        'mfa/authy/initiate',
                        'mfa/ga/initiate',
                        'signup',
                        'user/netki/update',
                        'user/profile/image/update',
                        'user/exchange/bank/coin/withdraw/initiate',
                        'user/exchange/bank/coin/withdraw/newVerifycode',
                        'user/exchange/bank/fiat/withdraw/initiate',
                        'user/exchange/bank/fiat/withdraw/newVerifycode',
                        'user/password/change',
                        'user/password/reset',
                        'user/wallet/coin/withdraw/initiate',
                        'wallet/coin/withdraw/newVerifycode',
                    ],
                    'put': [
                        'signup/verify/{token}',
                        'user/exchange/kyc',
                        'user/exchange/bank/fiat/deposit/new',
                        'user/exchange/ask/new',
                        'user/exchange/bid/new',
                        'user/exchange/instant/buy',
                        'user/exchange/instant/sell',
                        'user/exchange/bank/coin/withdraw/verify',
                        'user/exchange/bank/fiat/account/new',
                        'user/exchange/bank/fiat/withdraw/verify',
                        'user/mfa/authy/initiate/enable',
                        'user/mfa/ga/initiate/enable',
                        'user/netki/create',
                        'user/profile/phone/new',
                        'user/wallet/coin/address/new',
                        'user/wallet/coin/new',
                        'user/wallet/coin/withdraw/sendToExchange',
                        'user/wallet/coin/withdraw/verify',
                    ],
                    'delete': [
                        'user/gcm/{code}',
                        'user/logout',
                        'user/exchange/bank/coin/withdraw/unverified/cancel/{withdrawID}',
                        'user/exchange/bank/fiat/deposit/cancel/{depositID}',
                        'user/exchange/ask/cancel/{orderID}',
                        'user/exchange/bid/cancel/{orderID}',
                        'user/exchange/bank/fiat/withdraw/unverified/cancel/{withdrawID}',
                        'user/mfa/authy/disable/{code}',
                        'user/mfa/ga/disable/{code}',
                        'user/profile/phone/delete',
                        'user/profile/image/delete/{netkiName}',
                        'user/wallet/coin/withdraw/unverified/cancel/{withdrawID}',
                    ],
                },
            },
            'markets': {
                'BTC/INR': { 'id': 'BTC/INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR' },
            },
        }
        params.update (config)
        super (coinsecure, self).__init__ (params)

    def fetch_balance (self):
        response = self.privateGetUserExchangeBankSummary ()
        balance = response['message']
        coin = {
            'free': balance['availableCoinBalance'],
            'used': balance['pendingCoinBalance'],
            'total': balance['totalCoinBalance'],
        }
        fiat = {
            'free': balance['availableFiatBalance'],
            'used': balance['pendingFiatBalance'],
            'total': balance['totalFiatBalance'],
        }
        result = {
            'info': balance,
            'BTC': coin,
            'INR': fiat,
        }
        return result

    def fetch_order_book (self, market, params = {}):
        bids = self.publicGetExchangeBidOrders (params)
        asks = self.publicGetExchangeAskOrders (params)
        orderbook = {
            'bids': bids['message'],
            'asks': asks['message'],
        }
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = order['rate']
                amount = order['vol']
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        response = self.publicGetExchangeTicker ()
        ticker = response['message']
        timestamp = ticker['timestamp']
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': float (ticker['open']),
            'close': None,
            'first': None,
            'last': float (ticker['lastPrice']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['coinvolume']),
            'quoteVolume': float (ticker['fiatvolume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetExchangeTrades ()

    def create_order (self, market, type, side, amount, price = None, params = {}):
        method = 'privatePutUserExchange'
        order = {}
        if api == 'market':
            method += 'Instant' + self.capitalize (side)
            if side == 'buy':
                order['maxFiat'] = amount
            else:
                order['maxVol'] = amount
        else:
            direction = 'Bid' if (side == 'buy') else 'Ask'
            method += direction + 'New'
            order['rate'] = price
            order['vol'] = amount
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        raise ExchangeError (self.id + ' cancelOrder () is not fully implemented yet')
        method = 'privateDeleteUserExchangeAskCancelOrderId' # TODO fixme, have to specify order side here
        return getattr (self, method) ({ 'orderID': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'private':
            headers = { 'Authorization': self.apiKey }
            if query:
                body = self.json (query)
                headers['Content-Type'] = 'application/json'
        response = self.fetch (url, method, headers, body)
        if 'success' in response:
            if response['success']:
                return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class coinspot (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'coinspot',
            'name': 'CoinSpot',
            'countries': 'AU', # Australia
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg',
                'api': {
                    'public': 'https://www.coinspot.com.au/pubapi',
                    'private': 'https://www.coinspot.com.au/api',
                },
                'www': 'https://www.coinspot.com.au',
                'doc': 'https://www.coinspot.com.au/api',
            },
            'api': {
                'public': {
                    'get': [
                        'latest',
                    ],
                },
                'private': {
                    'post': [
                        'orders',
                        'orders/history',
                        'my/coin/deposit',
                        'my/coin/send',
                        'quote/buy',
                        'quote/sell',
                        'my/balances',
                        'my/orders',
                        'my/buy',
                        'my/sell',
                        'my/buy/cancel',
                        'my/sell/cancel',
                    ],
                },
            },
            'markets': {
                'BTC/AUD': { 'id': 'BTC', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD', },
                'LTC/AUD': { 'id': 'LTC', 'symbol': 'LTC/AUD', 'base': 'LTC', 'quote': 'AUD', },
                'DOGE/AUD': { 'id': 'DOGE', 'symbol': 'DOGE/AUD', 'base': 'DOGE', 'quote': 'AUD', },
            },
        }
        params.update (config)
        super (coinspot, self).__init__ (params)

    def fetch_balance (self):
        response = self.privatePostMyBalances ()
        result = { 'info': response }
        if 'balance' in response:
            balances = response['balance']
            currencies = list (balances.keys ())
            for c in range (0, len (currencies)):
                currency = currencies[c]
                uppercase = currency.upper ()
                account = {
                    'free': balances[currency],
                    'used': None,
                    'total': balances[currency],
                }
                if uppercase == 'DRK':
                    uppercase = 'DASH'
                result[uppercase] = account
        return result

    def fetch_order_book (self, market, params = {}):
        p = self.market (market)
        orderbook = self.privatePostOrders (self.extend ({
            'cointype': p['id'],
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = { 'bids': 'buyorders', 'asks': 'sellorders' }
        keys = list (sides.keys ())
        for k in range (0, len (keys)):
            key = keys[k]
            side = sides[key]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['rate'])
                amount = float (order['amount'])
                result[key].append ([ price, amount ])
        result['bids'] = self.sort_by (result['bids'], 0, True)
        result['asks'] = self.sort_by (result['asks'], 0)
        return result

    def fetch_ticker (self, market):
        response = self.publicGetLatest ()
        id = self.market_id (market)
        id = id.lower ()
        ticker = response['prices'][id]
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': None,
            'low': None,
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': None,
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.privatePostOrdersHistory ({
            'cointype': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        method = 'privatePostMy' + self.capitalize (side)
        if type =='market':
            raise ExchangeError (self.id + ' allows limit orders only')
        order = {
            'cointype': self.market_id (market),
            'amount': amount,
            'rate': price,
        }
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        raise ExchangeError (self.id + ' cancelOrder () is not fully implemented yet')
        method = 'privatePostMyBuy'
        return getattr (self, method) ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        if not self.apiKey:
            raise AuthenticationError (self.id + ' requires apiKey for all requests')
        url = self.urls['api'][api] + '/' + path
        if api == 'private':
            nonce = self.nonce ()
            body = self.json (self.extend ({ 'nonce': nonce }, params))
            headers = {
                'Content-Type': 'application/json',
                'Content-Length': len (body),
                'key': self.apiKey,
                'sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class dsx (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'dsx',
            'name': 'DSX',
            'countries': 'UK',
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27990275-1413158a-645a-11e7-931c-94717f7510e3.jpg',
                'api': {
                    'mapi': 'https://dsx.uk/mapi',  # market data
                    'tapi': 'https://dsx.uk/tapi',  # trading
                    'dwapi': 'https://dsx.uk/dwapi', # deposit/withdraw
                },
                'www': 'https://dsx.uk',
                'doc': [
                    'https://api.dsx.uk',
                    'https://dsx.uk/api_docs/public',
                    'https://dsx.uk/api_docs/private',
                    '',
                ],
            },
            'api': {
                'mapi': { # market data (public)
                    'get': [
                        'barsFromMoment/{id}/{period}/{start}', # empty reply :\
                        'depth/{id}',
                        'info',
                        'lastBars/{id}/{period}/{amount}', # period is (m, h or d)
                        'periodBars/{id}/{period}/{start}/{end}',
                        'ticker/{id}',
                        'trades/{id}',
                    ],
                },
                'tapi': { # trading (private)
                    'post': [
                        'getInfo',
                        'TransHistory',
                        'TradeHistory',
                        'OrderHistory',
                        'ActiveOrders',
                        'Trade',
                        'CancelOrder',
                    ],
                },
                'dwapi': { # deposit / withdraw (private)
                    'post': [
                        'getCryptoDepositAddress',
                        'cryptoWithdraw',
                        'fiatWithdraw',
                        'getTransactionStatus',
                        'getTransactions',
                    ],
                },
            },
        }
        params.update (config)
        super (dsx, self).__init__ (params)

    def fetch_markets (self):
        response = self.mapiGetInfo ()
        keys = list (response['pairs'].keys ())
        result = []
        for p in range (0, len (keys)):
            id = keys[p]
            market = response['pairs'][id]
            base = id[0:3]
            quote = id[3:6]
            base = base.upper ()
            quote = quote.upper ()
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.tapiPostGetInfo ()
        balances = response['return']
        result = { 'info': balances }
        currencies = list (balances['total'].keys ())
        for c in range (0, len (currencies)):
            currency = currencies[c]
            account = {
                'free': balances['funds'][currency],
                'used': None,
                'total': balances['total'][currency],
            }
            account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        response = self.mapiGetDepthId (self.extend ({
            'id': p['id'],
        }, params))
        orderbook = response[p['id']]
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = order[0]
                amount = order[1]
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        response = self.mapiGetTickerId ({
            'id': p['id'],
        })
        ticker = response[p['id']]
        timestamp = ticker['updated'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': float (ticker['avg']),
            'baseVolume': float (ticker['vol']),
            'quoteVolume': float (ticker['vol_cur']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.mapiGetTradesId ({
            'id': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        order = {
            'pair': self.market_id (market),
            'type': side,
            'rate': price,
            'amount': amount,
        }
        return self.tapiPostTrade (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.tapiPostCancelOrder ({ 'orderId': id })

    def request (self, path, api = 'mapi', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api]
        if (api == 'mapi') or (api == 'dwapi'):
            url += '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'mapi':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            method = path
            body = _urlencode.urlencode (self.extend ({
                'method': path,
                'nonce': nonce,
            }, query))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
                'Key': self.apiKey,
                'Sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512, 'base64'),
            }
        response = self.fetch (url, method, headers, body)
        if api == 'mapi':
            return response
        if 'success' in response:
            if response['success']:
                return response
        raise ExchangeError (self.id + ' ' + self.json (response)) 

#------------------------------------------------------------------------------

class exmo (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'exmo',
            'name': 'EXMO',
            'countries': [ 'ES', 'RU', ], # Spain, Russia
            'rateLimit': 1000, # once every 350 ms ≈ 180 requests per minute ≈ 3 requests per second
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg',
                'api': 'https://api.exmo.com',
                'www': 'https://exmo.me',
                'doc': [
                    'https://exmo.me/ru/api_doc',
                    'https://github.com/exmo-dev/exmo_api_lib/tree/master/nodejs',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'currency',
                        'order_book',
                        'pair_settings',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'user_info',
                        'order_create',
                        'order_cancel',
                        'user_open_orders',
                        'user_trades',
                        'user_cancelled_orders',
                        'order_trades',
                        'required_amount',
                        'deposit_address',
                        'withdraw_crypt',
                        'withdraw_get_txid',
                        'excode_create',
                        'excode_load',
                        'wallet_history',
                    ],
                },
            },
        }
        params.update (config)
        super (exmo, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetPairSettings ()
        keys = list (markets.keys ())
        result = []
        for p in range (0, len (keys)):
            id = keys[p]
            market = markets[id]
            symbol = id.replace ('_', '/')
            base, quote = symbol.split ('/')
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostUserInfo ()
        result = { 'info': response }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if currency in response['balances']:
                account['free'] = float (response['balances'][currency])
            if currency in response['reserved']:
                account['used'] = float (response['reserved'][currency])
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        response = self.publicGetOrderBook (self.extend ({
            'pair': p['id'],
        }, params))
        orderbook = response[p['id']]
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = { 'bids': 'bid', 'asks': 'ask' }
        keys = list (sides.keys ())
        for k in range (0, len (keys)):
            key = keys[k]
            side = sides[key]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[key].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = ticker['updated'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy_price']),
            'ask': float (ticker['sell_price']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last_trade']),
            'change': None,
            'percentage': None,
            'average': float (ticker['avg']),
            'baseVolume': float (ticker['vol']),
            'quoteVolume': float (ticker['vol_curr']),
            'info': ticker,
        }

    def fetch_tickers (self, currency = 'USD'):
        self.loadMarkets ()
        response = self.publicGetTicker ()
        result = {}
        ids = list (response.keys ())
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = response[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        response = self.publicGetTicker ()
        p = self.market (market)
        return self.parse_ticker (response[p['id']], p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTrades ({
            'pair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        prefix = ''
        if type =='market':
            prefix = 'market_'
        order = {
            'pair': self.market_id (market),
            'quantity': amount,
            'price': price or 0,
            'type': prefix + side,
        }
        return self.privatePostOrderCreate (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostOrderCancel ({ 'order_id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + path
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            nonce = self.nonce ()
            body = _urlencode.urlencode (self.extend ({ 'nonce': nonce }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
                'Key': self.apiKey,
                'Sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        response = self.fetch (url, method, headers, body)
        if api == 'public':
            return response
        if 'result' in response:
            if response['result']:
                return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class flowbtc (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'flowbtc',
            'name': 'flowBTC',
            'countries': 'BR', # Brazil
            'version': 'v1',
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg',
                'api': 'https://api.flowbtc.com:8400/ajax',
                'www': 'https://trader.flowbtc.com',
                'doc': 'http://www.flowbtc.com.br/api/',
            },
            'api': {
                'public': {
                    'post': [
                        'GetTicker',
                        'GetTrades',
                        'GetTradesByDate',
                        'GetOrderBook',
                        'GetProductPairs',
                        'GetProducts',
                    ],
                },
                'private': {
                    'post': [
                        'CreateAccount',
                        'GetUserInfo',
                        'SetUserInfo',
                        'GetAccountInfo',
                        'GetAccountTrades',
                        'GetDepositAddresses',
                        'Withdraw',
                        'CreateOrder',
                        'ModifyOrder',
                        'CancelOrder',
                        'CancelAllOrders',
                        'GetAccountOpenOrders',
                        'GetOrderFee',
                    ],
                },
            },
        }
        params.update (config)
        super (flowbtc, self).__init__ (params)

    def fetch_markets (self):
        response = self.publicPostGetProductPairs ()
        markets = response['productPairs']
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['name']
            base = market['product1Label']
            quote = market['product2Label']
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostGetAccountInfo ()
        balances = response['currencies']
        result = { 'info': response }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = balance['name']
            account = {
                'free': balance['balance'],
                'used': balance['hold'],
                'total': None,
            }
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        orderbook = self.publicPostGetOrderBook (self.extend ({
            'productPair': p['id'],
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['px'])
                amount = float (order['qty'])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicPostGetTicker ({
            'productPair': p['id'],
        })
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['volume24hr']),
            'quoteVolume': float (ticker['volume24hrProduct2']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicPostGetTrades ({
            'productPair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        orderType = 1 if (type == 'market') else 0
        order = {
            'ins': self.market_id (market),
            'side': side,
            'orderType': orderType,
            'qty': amount,
            'px': price,
        }
        return self.privatePostCreateOrder (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        if 'ins' in params:
            return self.privatePostCancelOrder (self.extend ({
                'serverOrderId': id,
            }, params))            
        raise ExchangeError (self.id + ' requires `ins` symbol parameter for cancelling an order')

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + path
        if api == 'public':
            if params:
                body = self.json (params)
        else:
            if not self.uid:
                raise AuthenticationError (self.id + ' requires `' + self.id + '.uid` property for authentication')
            nonce = self.nonce ()
            auth = str (nonce) + self.uid + self.apiKey
            signature = self.hmac (self.encode (auth), self.encode (self.secret))
            body = self.json (self.extend ({
                'apiKey': self.apiKey,
                'apiNonce': nonce,
                'apiSig': signature.upper (),
            }, params))
            headers = {
                'Content-Type': 'application/json',
                'Content-Length': len (body),
            }
        response = self.fetch (url, method, headers, body)
        if 'isAccepted' in response:
            if response['isAccepted']:
                return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class foxbit (blinktrade):

    def __init__ (self, config = {}):
        params = {
            'id': 'foxbit',
            'name': 'FoxBit',
            'countries': 'BR',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991413-11b40d42-647f-11e7-91ee-78ced874dd09.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://foxbit.exchange',
                'doc': 'https://blinktrade.com/docs',
            },
            'comment': 'Blinktrade API',
            'markets': {
                'BTC/BRL': { 'id': 'BTCBRL', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'brokerId': 4, 'broker': 'FoxBit', },
            },
        }
        params.update (config)
        super (foxbit, self).__init__ (params)

#------------------------------------------------------------------------------

class fyb (Exchange):

    def __init__ (self, config = {}):
        params = {
            'rateLimit': 1500,
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'tickerdetailed',
                        'orderbook',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'test',
                        'getaccinfo',
                        'getpendingorders',
                        'getorderhistory',
                        'cancelpendingorder',
                        'placeorder',
                        'withdraw',
                    ],
                },
            },
        }
        params.update (config)
        super (fyb, self).__init__ (params)

    def fetch_balance (self):
        balance = self.privatePostGetaccinfo ()
        btc = float (balance['btcBal'])
        symbol = self.symbols[0]
        quote = self.markets[symbol]['quote']
        lowercase = quote.lower () + 'Bal'
        fiat = float (balance[lowercase])
        crypto = {
            'free': btc,
            'used': None,
            'total': btc,
        }
        accounts = { 'BTC': crypto }
        accounts[quote] = {
            'free': fiat,
            'used': None,
            'total': fiat,
        }
        accounts['info'] = balance
        return accounts

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetOrderbook (params)
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetTickerdetailed ()
        timestamp = self.milliseconds ()
        last = None
        volume = None
        if 'last' in ticker:
            last = float (ticker['last'])
        if 'vol' in ticker:
            volume = float (ticker['vol'])
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': None,
            'low': None,
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': last,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': volume,
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetTrades ()

    def create_order (self, market, type, side, amount, price = None, params = {}):
        return self.privatePostPlaceorder (self.extend ({
            'qty': amount,
            'price': price,
            'type': side[0].upper ()
        }, params))

    def cancel_order (self, id):
        return self.privatePostCancelpendingorder ({ 'orderNo': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + path
        if api == 'public':
            url += '.json'
        else:
            nonce = self.nonce ()
            body = _urlencode.urlencode (self.extend ({ 'timestamp': nonce }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'key': self.apiKey,
                'sig': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha1)
            }
        response = self.fetch (url, method, headers, body)
        if api == 'private':
            if 'error' in response:
                if response['error']:
                    raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class fybse (fyb):

    def __init__ (self, config = {}):
        params = {
            'id': 'fybse',
            'name': 'FYB-SE',
            'countries': 'SE', # Sweden
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg',
                'api': 'https://www.fybse.se/api/SEK',
                'www': 'https://www.fybse.se',
                'doc': 'http://docs.fyb.apiary.io',
            },
            'markets': {
                'BTC/SEK': { 'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK' },
            },
        }
        params.update (config)
        super (fybse, self).__init__ (params)

#------------------------------------------------------------------------------

class fybsg (fyb):

    def __init__ (self, config = {}):
        params = {
            'id': 'fybsg',
            'name': 'FYB-SG',
            'countries': 'SG', # Singapore
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg',
                'api': 'https://www.fybsg.com/api/SGD',
                'www': 'https://www.fybsg.com',
                'doc': 'http://docs.fyb.apiary.io',
            },
            'markets': {
                'BTC/SGD': { 'id': 'SGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
            },
        }
        params.update (config)
        super (fybsg, self).__init__ (params)

#------------------------------------------------------------------------------

class gatecoin (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'gatecoin',
            'name': 'Gatecoin',
            'rateLimit': 2000,
            'countries': 'HK', # Hong Kong
            'comment': 'a regulated/licensed exchange',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28646817-508457f2-726c-11e7-9eeb-3528d2413a58.jpg',
                'api': 'https://api.gatecoin.com',
                'www': 'https://gatecoin.com',
                'doc': [
                    'https://gatecoin.com/api',
                    'https://github.com/Gatecoin/RESTful-API-Implementation',
                    'https://api.gatecoin.com/swagger-ui/index.html',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'Public/ExchangeRate', # Get the exchange rates
                        'Public/LiveTicker', # Get live ticker for all currency
                        'Public/LiveTicker/{CurrencyPair}', # Get live ticker by currency
                        'Public/LiveTickers', # Get live ticker for all currency
                        'Public/MarketDepth/{CurrencyPair}', # Gets prices and market depth for the currency pair.
                        'Public/NetworkStatistics/{DigiCurrency}', # Get the network status of a specific digital currency
                        'Public/StatisticHistory/{DigiCurrency}/{Typeofdata}', # Get the historical data of a specific digital currency
                        'Public/TickerHistory/{CurrencyPair}/{Timeframe}', # Get ticker history
                        'Public/Transactions/{CurrencyPair}', # Gets recent transactions
                        'Public/TransactionsHistory/{CurrencyPair}', # Gets all transactions
                        'Reference/BusinessNatureList', # Get the business nature list.
                        'Reference/Countries', # Get the country list.
                        'Reference/Currencies', # Get the currency list.
                        'Reference/CurrencyPairs', # Get the currency pair list.
                        'Reference/CurrentStatusList', # Get the current status list.
                        'Reference/IdentydocumentTypes', # Get the different types of identity documents possible.
                        'Reference/IncomeRangeList', # Get the income range list.
                        'Reference/IncomeSourceList', # Get the income source list.
                        'Reference/VerificationLevelList', # Get the verif level list.
                        'Stream/PublicChannel', # Get the public pubnub channel list
                    ],
                    'post': [
                        'Export/Transactions', # Request a export of all trades from based on currencypair, start date and end date
                        'Ping', # Post a string, then get it back.
                        'Public/Unsubscribe/{EmailCode}', # Lets the user unsubscribe from emails
                        'RegisterUser', # Initial trader registration.
                    ],
                },
                'private': {
                    'get': [
                        'Account/CorporateData', # Get corporate account data
                        'Account/DocumentAddress', # Check if residence proof uploaded
                        'Account/DocumentCorporation', # Check if registered document uploaded
                        'Account/DocumentID', # Check if ID document copy uploaded
                        'Account/DocumentInformation', # Get Step3 Data
                        'Account/Email', # Get user email
                        'Account/FeeRate', # Get fee rate of logged in user
                        'Account/Level', # Get verif level of logged in user
                        'Account/PersonalInformation', # Get Step1 Data
                        'Account/Phone', # Get user phone number
                        'Account/Profile', # Get trader profile
                        'Account/Questionnaire', # Fill the questionnaire
                        'Account/Referral', # Get referral information
                        'Account/ReferralCode', # Get the referral code of the logged in user
                        'Account/ReferralNames', # Get names of referred traders
                        'Account/ReferralReward', # Get referral reward information
                        'Account/ReferredCode', # Get referral code
                        'Account/ResidentInformation', # Get Step2 Data
                        'Account/SecuritySettings', # Get verif details of logged in user
                        'Account/User', # Get all user info
                        'APIKey/APIKey', # Get API Key for logged in user
                        'Auth/ConnectionHistory', # Gets connection history of logged in user
                        'Balance/Balances', # Gets the available balance for each currency for the logged in account.
                        'Balance/Balances/{Currency}', # Gets the available balance for s currency for the logged in account.
                        'Balance/Deposits', # Get all account deposits, including wire and digital currency, of the logged in user
                        'Balance/Withdrawals', # Get all account withdrawals, including wire and digital currency, of the logged in user
                        'Bank/Accounts/{Currency}/{Location}', # Get internal bank account for deposit
                        'Bank/Transactions', # Get all account transactions of the logged in user
                        'Bank/UserAccounts', # Gets all the bank accounts related to the logged in user.
                        'Bank/UserAccounts/{Currency}', # Gets all the bank accounts related to the logged in user.
                        'ElectronicWallet/DepositWallets', # Gets all crypto currency addresses related deposits to the logged in user.
                        'ElectronicWallet/DepositWallets/{DigiCurrency}', # Gets all crypto currency addresses related deposits to the logged in user by currency.
                        'ElectronicWallet/Transactions', # Get all digital currency transactions of the logged in user
                        'ElectronicWallet/Transactions/{DigiCurrency}', # Get all digital currency transactions of the logged in user
                        'ElectronicWallet/UserWallets', # Gets all external digital currency addresses related to the logged in user.
                        'ElectronicWallet/UserWallets/{DigiCurrency}', # Gets all external digital currency addresses related to the logged in user by currency.
                        'Info/ReferenceCurrency', # Get user's reference currency
                        'Info/ReferenceLanguage', # Get user's reference language
                        'Notification/Messages', # Get from oldest unread + 3 read message to newest messages
                        'Trade/Orders', # Gets open orders for the logged in trader.
                        'Trade/Orders/{OrderID}', # Gets an order for the logged in trader.
                        'Trade/StopOrders', # Gets all stop orders for the logged in trader. Max 1000 record.
                        'Trade/StopOrdersHistory', # Gets all stop orders for the logged in trader. Max 1000 record.
                        'Trade/Trades', # Gets all transactions of logged in user
                        'Trade/UserTrades', # Gets all transactions of logged in user            
                    ],
                    'post': [
                        'Account/DocumentAddress', # Upload address proof document
                        'Account/DocumentCorporation', # Upload registered document document
                        'Account/DocumentID', # Upload ID document copy
                        'Account/Email/RequestVerify', # Request for verification email
                        'Account/Email/Verify', # Verification email
                        'Account/GoogleAuth', # Enable google auth
                        'Account/Level', # Request verif level of logged in user
                        'Account/Questionnaire', # Fill the questionnaire
                        'Account/Referral', # Post a referral email
                        'APIKey/APIKey', # Create a new API key for logged in user
                        'Auth/ChangePassword', # Change password.
                        'Auth/ForgotPassword', # Request reset password
                        'Auth/ForgotUserID', # Request user id
                        'Auth/Login', # Trader session log in.
                        'Auth/Logout', # Logout from the current session.
                        'Auth/LogoutOtherSessions', # Logout other sessions.
                        'Auth/ResetPassword', # Reset password
                        'Bank/Transactions', # Request a transfer from the traders account of the logged in user. This is only available for bank account
                        'Bank/UserAccounts', # Add an account the logged in user
                        'ElectronicWallet/DepositWallets/{DigiCurrency}', # Add an digital currency addresses to the logged in user.
                        'ElectronicWallet/Transactions/Deposits/{DigiCurrency}', # Get all internal digital currency transactions of the logged in user
                        'ElectronicWallet/Transactions/Withdrawals/{DigiCurrency}', # Get all external digital currency transactions of the logged in user
                        'ElectronicWallet/UserWallets/{DigiCurrency}', # Add an external digital currency addresses to the logged in user.
                        'ElectronicWallet/Withdrawals/{DigiCurrency}', # Request a transfer from the traders account to an external address. This is only available for crypto currencies.
                        'Notification/Messages', # Mark all as read
                        'Notification/Messages/{ID}', # Mark as read
                        'Trade/Orders', # Place an order at the exchange.
                        'Trade/StopOrders', # Place a stop order at the exchange.
                    ],
                    'put': [
                        'Account/CorporateData', # Update user company data for corporate account
                        'Account/DocumentID', # Update ID document meta data
                        'Account/DocumentInformation', # Update Step3 Data
                        'Account/Email', # Update user email
                        'Account/PersonalInformation', # Update Step1 Data
                        'Account/Phone', # Update user phone number
                        'Account/Questionnaire', # update the questionnaire
                        'Account/ReferredCode', # Update referral code
                        'Account/ResidentInformation', # Update Step2 Data
                        'Account/SecuritySettings', # Update verif details of logged in user
                        'Account/User', # Update all user info
                        'Bank/UserAccounts', # Update the label of existing user bank accounnt
                        'ElectronicWallet/DepositWallets/{DigiCurrency}/{AddressName}', # Update the name of an address
                        'ElectronicWallet/UserWallets/{DigiCurrency}', # Update the name of an external address
                        'Info/ReferenceCurrency', # User's reference currency
                        'Info/ReferenceLanguage', # Update user's reference language
                    ],
                    'delete': [
                        'APIKey/APIKey/{PublicKey}', # Remove an API key
                        'Bank/Transactions/{RequestID}', # Delete pending account withdraw of the logged in user
                        'Bank/UserAccounts/{Currency}/{Label}', # Delete an account of the logged in user
                        'ElectronicWallet/DepositWallets/{DigiCurrency}/{AddressName}', # Delete an digital currency addresses related to the logged in user.
                        'ElectronicWallet/UserWallets/{DigiCurrency}/{AddressName}', # Delete an external digital currency addresses related to the logged in user.
                        'Trade/Orders', # Cancels all existing order
                        'Trade/Orders/{OrderID}', # Cancels an existing order
                        'Trade/StopOrders', # Cancels all existing stop orders
                        'Trade/StopOrders/{ID}', # Cancels an existing stop order
                    ],
                },
            },
        }
        params.update (config)
        super (gatecoin, self).__init__ (params)

    def fetch_markets (self):
        response = self.publicGetPublicLiveTickers ()
        markets = response['tickers']
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['currencyPair']
            base = id[0:3]
            quote = id[3:6]
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privateGetBalanceBalances ()
        balances = response['balances']
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = balance['currency']
            account = {
                'free': balance['availableBalance'],
                'used': self.sum (
                    balance['pendingIncoming'], 
                    balance['pendingOutgoing'],
                    balance['openOrder']),
                'total': balance['balance'],
            }
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        orderbook = self.publicGetPublicMarketDepthCurrencyPair (self.extend ({
            'CurrencyPair': p['id'],
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['volume'])
                result[side].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = int (ticker['createDateTime']) * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': float (ticker['vwap']),
            'open': float (ticker['open']),
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        response = self.publicGetPublicLiveTickers ()
        tickers = response['tickers']
        result = {}
        for t in range (0, len (tickers)):
            ticker = tickers[t]
            id = ticker['currencyPair']
            market = self.markets_by_id[id]
            symbol = market['symbol']
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        response = self.publicGetPublicLiveTickerCurrencyPair ({
            'CurrencyPair': p['id'],
        })
        ticker = response['ticker']
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetPublicTransactionsCurrencyPair ({
            'CurrencyPair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'Code': self.market_id (market),
            'Way': 'Bid' if (side == 'buy') else 'Ask',
            'Amount': amount,
        }
        if type == 'limit':
            order['Price'] = price
        if self.twofa:
            if 'ValidationCode' in params:
                order['ValidationCode'] = params['ValidationCode']
            else:
                raise AuthenticationError (self.id + ' two-factor authentication requires a missing ValidationCode parameter')
        return self.privatePostTradeOrders (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privateDeleteTradeOrdersOrderID ({ 'OrderID': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            contentType = '' if (method == 'GET') else 'application/json'
            auth = method + url + contentType + str (nonce)
            auth = auth.lower ()
            signature = self.hmac (self.encode (auth), self.encode (self.secret), hashlib.sha256, 'base64')
            headers = {
                'API_PUBLIC_KEY': self.apiKey,
                'API_REQUEST_SIGNATURE': signature,
                'API_REQUEST_DATE': nonce,
            }
            if method != 'GET':
                headers['Content-Type'] = contentType
                body = self.json (self.extend ({ 'nonce': nonce }, params))
        response = self.fetch (url, method, headers, body)
        if 'responseStatus' in response:
            if 'message' in response['responseStatus']:
                if response['responseStatus']['message'] == 'OK':
                    return response
        raise ExchangeError (self.id + ' ' + self.json (response))

#------------------------------------------------------------------------------

class gdax (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'gdax',
            'name': 'GDAX',
            'countries': 'US',
            'rateLimit': 1000,
            'urls': {
                'test': 'https://api-public.sandbox.gdax.com',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg',
                'api': 'https://api.gdax.com',
                'www': 'https://www.gdax.com',
                'doc': 'https://docs.gdax.com',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'products',
                        'products/{id}/book',
                        'products/{id}/candles',
                        'products/{id}/stats',
                        'products/{id}/ticker',
                        'products/{id}/trades',
                        'time',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/{id}',
                        'accounts/{id}/holds',
                        'accounts/{id}/ledger',
                        'coinbase-accounts',
                        'fills',
                        'funding',
                        'orders',
                        'orders/{id}',
                        'payment-methods',
                        'position',
                        'reports/{id}',
                        'users/self/trailing-volume',
                    ],
                    'post': [
                        'deposits/coinbase-account',
                        'deposits/payment-method',
                        'funding/repay',
                        'orders',
                        'position/close',
                        'profiles/margin-transfer',
                        'reports',
                        'withdrawals/coinbase',
                        'withdrawals/crypto',
                        'withdrawals/payment-method',
                    ],
                    'delete': [
                        'orders',
                        'orders/{id}',
                    ],
                },
            },
        }
        params.update (config)
        super (gdax, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetProducts ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['id']
            base = market['base_currency']
            quote = market['quote_currency']
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        balances = self.privateGetAccounts ()
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = balance['currency']
            account = {
                'free': float (balance['available']),
                'used': float (balance['hold']),
                'total': float (balance['balance']),
            }
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetProductsIdBook (self.extend ({
            'id': self.market_id (market),
            'level': 2, # 1 best bidask, 2 aggregated, 3 full
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetProductsIdTicker ({
            'id': p['id'],
        })
        quote = self.publicGetProductsIdStats ({
            'id': p['id'],
        })
        timestamp = self.parse8601 (ticker['time'])
        bid = None
        ask = None
        if 'bid' in ticker:
            bid = float (ticker['bid'])
        if 'ask' in ticker:
            ask = float (ticker['ask'])
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (quote['high']),
            'low': float (quote['low']),
            'bid': bid,
            'ask': ask,
            'vwap': None,
            'open': float (quote['open']),
            'close': None,
            'first': None,
            'last': float (quote['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetProductsIdTrades ({
            'id': self.market_id (market), # fixes issue #2
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        oid = str (self.nonce ())
        order = {
            'product_id': self.market_id (market),
            'side': side,
            'size': amount,
            'type': type,
        }
        if type == 'limit':
            order['price'] = price
        return self.privatePostOrders (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privateDeleteOrdersId ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        request = '/' + self.implode_params (path, params)
        url = self.urls['api'] + request
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            if not self.apiKey:
                raise AuthenticationError (self.id + ' requires apiKey property for authentication and trading')
            if not self.secret:
                raise AuthenticationError (self.id + ' requires secret property for authentication and trading')
            if not self.password:
                raise AuthenticationError (self.id + ' requires password property for authentication and trading')
            nonce = str (self.nonce ())
            if query:
                body = self.json (query)
            what = nonce + method + request + (body or '')
            secret = base64.b64decode (self.secret)
            signature = self.hmac (self.encode (what), secret, hashlib.sha256, 'base64')
            headers = {
                'CB-ACCESS-KEY': self.apiKey,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-TIMESTAMP': nonce,
                'CB-ACCESS-PASSPHRASE': self.password,
                'Content-Type': 'application/json',
            }
        response = self.fetch (url, method, headers, body)
        if 'message' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class gemini (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'gemini',
            'name': 'Gemini',
            'countries': 'US',
            'rateLimit': 1500, # 200 for private API
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg',
                'api': 'https://api.gemini.com',
                'www': 'https://gemini.com',
                'doc': 'https://docs.gemini.com/rest-api',
            },
            'api': {
                'public': {
                    'get': [
                        'symbols',
                        'pubticker/{symbol}',
                        'book/{symbol}',
                        'trades/{symbol}',
                        'auction/{symbol}',
                        'auction/{symbol}/history',
                    ],
                },
                'private': {
                    'post': [
                        'order/new',
                        'order/cancel',
                        'order/cancel/session',
                        'order/cancel/all',
                        'order/status',
                        'orders',
                        'mytrades',
                        'tradevolume',
                        'balances',
                        'deposit/{currency}/newAddress',
                        'withdraw/{currency}',
                        'heartbeat',
                    ],
                },
            },
        }
        params.update (config)
        super (gemini, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetSymbols ()
        result = []
        for p in range (0, len (markets)):
            id = markets[p]
            market = id
            uppercase = market.upper ()
            base = uppercase[0:3]
            quote = uppercase[3:6]
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetBookSymbol (self.extend ({
            'symbol': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['amount'])
                timestamp = int (order['timestamp']) * 1000
                result[side].append ([ price, amount, timestamp ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetPubtickerSymbol ({
            'symbol': p['id'],
        })
        timestamp = ticker['volume']['timestamp']
        baseVolume = p['base']
        quoteVolume = p['quote']
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': None,
            'low': None,
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['volume'][baseVolume]),
            'quoteVolume': float (ticker['volume'][quoteVolume]),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTradesSymbol ({
            'symbol': self.market_id (market),
        })

    def fetch_balance (self):
        self.loadMarkets ()
        balances = self.privatePostBalances ()
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = balance['currency']
            account = {
                'free': float (balance['available']),
                'used': None,
                'total': float (balance['amount']),
            }
            account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        order = {
            'client_order_id': self.nonce (),
            'symbol': self.market_id (market),
            'amount': str (amount),
            'price': str (price),
            'side': side,
            'type': 'exchange limit', # gemini allows limit orders only
        }
        return self.privatePostOrderNew (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostCancelOrder ({ 'order_id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            request = self.extend ({
                'request': url,
                'nonce': nonce,
            }, query)
            payload = self.json (request)
            payload = base64.b64encode (payload)
            payload = self.encode (payload)
            signature = self.hmac (payload, self.encode (self.secret), hashlib.sha384)
            headers = {
                'Content-Type': 'text/plain',
                'Content-Length': 0,
                'X-GEMINI-APIKEY': self.apiKey,
                'X-GEMINI-PAYLOAD': payload,
                'X-GEMINI-SIGNATURE': signature,
            }
        url = self.urls['api'] + url
        response = self.fetch (url, method, headers, body)
        if 'result' in response:
            if response['result'] == 'error':
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class hitbtc (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'hitbtc',
            'name': 'HitBTC',
            'countries': 'HK', # Hong Kong
            'rateLimit': 1500,
            'version': '1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api': 'http://api.hitbtc.com',
                'www': 'https://hitbtc.com',
                'doc': [
                    'https://hitbtc.com/api',
                    'http://hitbtc-com.github.io/hitbtc-api',
                    'http://jsfiddle.net/bmknight/RqbYB',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{symbol}/orderbook',
                        '{symbol}/ticker',
                        '{symbol}/trades',
                        '{symbol}/trades/recent',
                        'symbols',
                        'ticker',
                        'time,'
                    ],
                },
                'trading': {
                    'get': [
                        'balance',
                        'orders/active',
                        'orders/recent',
                        'order',
                        'trades/by/order',
                        'trades',
                    ],
                    'post': [
                        'new_order',
                        'cancel_order',
                        'cancel_orders',
                    ],
                },
                'payment': {
                    'get': [
                        'balance',
                        'address/{currency}',
                        'transactions',
                        'transactions/{transaction}',
                    ],
                    'post': [
                        'transfer_to_trading',
                        'transfer_to_main',
                        'address/{currency}',
                        'payout',
                    ],
                }
            },
        }
        params.update (config)
        super (hitbtc, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetSymbols ()
        result = []
        for p in range (0, len (markets['symbols'])):
            market = markets['symbols'][p]
            id = market['symbol']
            base = market['commodity']
            quote = market['currency']
            lot = float (market['lot'])
            step = float (market['step'])
            base = self.commonCurrencyCode (base)
            quote = self.commonCurrencyCode (quote)
            # looks like they now have it correct
            # if base == 'DSH':
            #     base = 'DASH'
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'lot': lot,
                'step': step,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.tradingGetBalance ()
        balances = response['balance']
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = balance['currency_code']
            account = {
                'free': float (balance['cash']),
                'used': float (balance['reserved']),
                'total': None,
            }
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetSymbolOrderbook (self.extend ({
            'symbol': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = ticker['timestamp']
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': float (ticker['open']),
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['volume']),
            'quoteVolume': float (ticker['volume_quote']),
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        tickers = self.publicGetTicker ()
        ids = list (tickers.keys ())
        result = {}
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetSymbolTicker ({
            'symbol': p['id'],
        })
        if 'message' in ticker:
            raise ExchangeError (self.id + ' ' + ticker['message'])
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetSymbolTrades ({
            'symbol': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        # check if amount can be evenly divided into lots
        # they want integer quantity in lot units
        quantity = float (amount) / p['lot']
        wholeLots = int (round (quantity))
        difference = quantity - wholeLots
        if abs (difference) > p['step']:
            raise ExchangeError (self.id + ' order amount should be evenly divisible by lot unit size of ' + str (p['lot']))
        order = {
            'clientOrderId': self.nonce (),
            'symbol': p['id'],
            'side': side,
            'quantity': str (wholeLots), # quantity in integer lot units
            'type': type,
        }
        if type == 'limit':
            order['price'] = self.decimal (price)
        return self.tradingPostNewOrder (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.tradingPostCancelOrder ({ 'clientOrderId': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = '/' + 'api' + '/' + self.version + '/' + api + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            query = self.extend ({ 'nonce': nonce, 'apikey': self.apiKey }, query)
            if method == 'POST':
                if query:
                    body = _urlencode.urlencode (query)
            if query:
                url += '?' + _urlencode.urlencode (query)
            auth = url + (body or '')
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Signature': self.hmac (self.encode (auth), self.encode (self.secret), hashlib.sha512).lower (),
            }
        url = self.urls['api'] + url
        response = self.fetch (url, method, headers, body)
        if 'code' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class huobi (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'huobi',
            'name': 'Huobi',
            'countries': 'CN',
            'rateLimit': 2000,
            'version': 'v3',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api': 'http://api.huobi.com',
                'www': 'https://www.huobi.com',
                'doc': 'https://github.com/huobiapi/API_Docs_en/wiki',
            },
            'api': {
                'staticmarket': {
                    'get': [
                        '{id}_kline_{period}',
                        'ticker_{id}',
                        'depth_{id}',
                        'depth_{id}_{length}',
                        'detail_{id}',
                    ],
                },
                'usdmarket': {
                    'get': [
                        '{id}_kline_{period}',
                        'ticker_{id}',
                        'depth_{id}',
                        'depth_{id}_{length}',
                        'detail_{id}',
                    ],
                },
                'trade': {
                    'post': [
                        'get_account_info',
                        'get_orders',
                        'order_info',
                        'buy',
                        'sell',
                        'buy_market',
                        'sell_market',
                        'cancel_order',
                        'get_new_deal_orders',
                        'get_order_id_by_trade_id',
                        'withdraw_coin',
                        'cancel_withdraw_coin',
                        'get_withdraw_coin_result',
                        'transfer',
                        'loan',
                        'repayment',
                        'get_loan_available',
                        'get_loans',
                    ],
                },
            },
            'markets': {
                'BTC/CNY': { 'id': 'btc', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 1, },
                'LTC/CNY': { 'id': 'ltc', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 2, },
                'BTC/USD': { 'id': 'btc', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'usdmarket',    'coinType': 1, },
            },
        }
        params.update (config)
        super (huobi, self).__init__ (params)

    def fetch_balance (self):
        balances = self.tradePostGetAccountInfo ()
        result = { 'info': balances }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            available = 'available_' + lowercase + '_display'
            frozen = 'frozen_' + lowercase + '_display'
            loan = 'loan_' + lowercase + '_display'
            if available in balances:
                account['free'] = float (balances[available])
            if frozen in balances:
                account['used'] = float (balances[frozen])
            if loan in balances:
                account['used'] = self.sum (account['used'], float (balances[loan]))
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        p = self.market (market)
        method = p['type'] + 'GetDepthId'
        orderbook = getattr (self, method) (self.extend ({ 'id': p['id'] }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        return result

    def fetch_ticker (self, market):
        p = self.market (market)
        method = p['type'] + 'GetTickerId'
        response = getattr (self, method) ({ 'id': p['id'] })
        ticker = response['ticker']
        timestamp = int (response['time']) * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': float (ticker['open']),
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['vol']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        p = self.market (market)
        method = p['type'] + 'GetDetailId'
        return getattr (self, method) ({ 'id': p['id'] })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        p = self.market (market)
        method = 'tradePost' + self.capitalize (side)
        order = {
            'coin_type': p['coinType'],
            'amount': amount,
            'market': p['quote'].lower (),
        }
        if type == 'limit':
            order['price'] = price
        else:
            method += self.capitalize (type)
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        return self.tradePostCancelOrder ({ 'id': id })

    def request (self, path, api = 'trade', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api']
        if api == 'trade':
            url += '/api' + self.version
            query = self.keysort (self.extend ({
                'method': path,
                'access_key': self.apiKey,
                'created': self.nonce (),
            }, params))
            queryString = _urlencode.urlencode (self.omit (query, 'market'))
            # secret key must be at the end of query to be signed
            queryString += '&secret_key=' + self.secret
            query['sign'] = self.hash (self.encode (queryString))
            body = _urlencode.urlencode (query)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
            }
        else:
            url += '/' + api + '/' + self.implode_params (path, params) + '_json.js'
            query = self.omit (params, self.extract_params (path))
            if query:
                url += '?' + _urlencode.urlencode (query)
        response = self.fetch (url, method, headers, body)
        if 'status' in response:
            if response['status'] == 'error':
                raise ExchangeError (self.id + ' ' + self.json (response))
        if 'code' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class itbit (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'itbit',
            'name': 'itBit',
            'countries': 'US',
            'rateLimit': 2000,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg',
                'api': 'https://api.itbit.com',
                'www': 'https://www.itbit.com',
                'doc': [
                    'https://api.itbit.com/docs',
                    'https://www.itbit.com/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'markets/{symbol}/ticker',
                        'markets/{symbol}/order_book',
                        'markets/{symbol}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'wallets',
                        'wallets/{walletId}',
                        'wallets/{walletId}/balances/{currencyCode}',
                        'wallets/{walletId}/funding_history',
                        'wallets/{walletId}/trades',
                        'wallets/{walletId}/orders/{id}',
                    ],
                    'post': [
                        'wallet_transfers',
                        'wallets',
                        'wallets/{walletId}/cryptocurrency_deposits',
                        'wallets/{walletId}/cryptocurrency_withdrawals',
                        'wallets/{walletId}/orders',
                        'wire_withdrawal',
                    ],
                    'delete': [
                        'wallets/{walletId}/orders/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'XBTUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'BTC/SGD': { 'id': 'XBTSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD' },
                'BTC/EUR': { 'id': 'XBTEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            },
        }
        params.update (config)
        super (itbit, self).__init__ (params)

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetMarketsSymbolOrderBook (self.extend ({
            'symbol': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetMarketsSymbolTicker ({
            'symbol': self.market_id (market),
        })
        timestamp = self.parse8601 (ticker['serverTimeUTC'])
        bid = None
        ask = None
        if 'bid' in ticker:
            if ticker['bid']:
                bid = float (ticker['bid'])
        if 'ask' in ticker:
            if ticker['ask']:
                ask = float (ticker['ask'])
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high24h']),
            'low': float (ticker['low24h']),
            'bid': bid,
            'ask': ask,
            'vwap': float (ticker['vwap24h']),
            'open': float (ticker['openToday']),
            'close': None,
            'first': None,
            'last': float (ticker['lastPrice']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume24h']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetMarketsSymbolTrades ({
            'symbol': self.market_id (market),
        })

    def fetch_balance (self):
        response = self.privateGetBalances ()
        balances = response['balances']
        result = { 'info': response }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = balance['currency']
            account = {
                'free': float (balance['availableBalance']),
                'used': None,
                'total': float (balance['totalBalance']),
            }
            account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def fetchWallets (self):
        return self.privateGetWallets ()

    def nonce (self):
        return self.milliseconds ()

    def create_order (self, market, type, side, amount, price = None, params = {}):
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        amount = str (amount)
        price = str (price)
        p = self.market (market)
        order = {
            'side': side,
            'type': type,
            'currency': p['base'],
            'amount': amount,
            'display': amount,
            'price': price,
            'instrument': p['id'],
        }
        return self.privatePostTradeAdd (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        return self.privateDeleteWalletsWalletIdOrdersId (self.extend ({
            'id': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            if query:
                body = self.json (query)
            else:
                body = ''
            nonce = str (self.nonce ())
            timestamp = nonce
            auth = [ method, url, body, nonce, timestamp ]
            message = nonce + self.json (auth)
            hash = self.hash (self.encode (message), 'sha256', 'binary')
            binhash = self.binary_concat (url, hash)
            signature = self.hmac (binhash, self.encode (self.secret), hashlib.sha512, 'base64')
            headers = {
                'Authorization': self.apiKey + ':' + signature,
                'Content-Type': 'application/json',
                'X-Auth-Timestamp': timestamp,
                'X-Auth-Nonce': nonce,
            }
        response = self.fetch (url, method, headers, body)
        if 'code' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class jubi (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'jubi',
            'name': 'jubi.com',
            'countries': 'CN',
            'rateLimit': 1500,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg',
                'api': 'https://www.jubi.com/api',
                'www': 'https://www.jubi.com',
                'doc': 'https://www.jubi.com/help/api.html',
            },
            'api': {
                'public': {
                    'get': [
                        'depth',
                        'orders',
                        'ticker',
                        'allticker',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'trade_add',
                        'trade_cancel',
                        'trade_list',
                        'trade_view',
                        'wallet',
                    ],
                },
            },
        }
        params.update (config)
        super (jubi, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetAllticker ()
        keys = list (markets.keys ())
        result = []
        for p in range (0, len (keys)):
            id = keys[p]
            base = id.upper ()
            quote = 'CNY'
            symbol = base + '/' + quote
            base = self.commonCurrencyCode (base)
            quote = self.commonCurrencyCode (quote)
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': id,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        balances = self.privatePostBalance ()
        result = { 'info': balances }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            if lowercase == 'dash':
                lowercase = 'drk'
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            free = lowercase + '_balance'
            used = lowercase + '_lock'
            if free in balances:
                account['free'] = float (balances[free])
            if used in balances:
                account['used'] = float (balances[used])
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetDepth (self.extend ({
            'coin': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        result['asks'] = self.sort_by (result['asks'], 0)
        return result

    def parse_ticker (self, ticker, market):
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['vol']),
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        tickers = self.publicGetAllticker ()
        ids = list (tickers.keys ())
        result = {}
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetTicker ({
            'coin': p['id'],
        })
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetOrders ({
            'coin': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        return self.privatePostTradeAdd (self.extend ({
            'amount': amount,
            'price': price,
            'type': side,
            'coin': self.market_id (market),
        }, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.privateDeleteWalletsWalletIdOrdersId (self.extend ({
            'id': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + path
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            nonce = str (self.nonce ())
            query = self.extend ({
                'key': self.apiKey,
                'nonce': nonce,
            }, params)
            request = _urlencode.urlencode (query)
            secret = self.hash (self.encode (self.secret))
            query['signature'] = self.hmac (self.encode (request), self.encode (secret))
            body = _urlencode.urlencode (query)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
            }
        response = self.fetch (url, method, headers, body)
        if 'result' in response:
            if not response['result']:
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class kraken (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'kraken',
            'name': 'Kraken',
            'countries': 'US',
            'version': '0',
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
                'api': 'https://api.kraken.com',
                'www': 'https://www.kraken.com',
                'doc': [
                    'https://www.kraken.com/en-us/help/api',
                    'https://github.com/nothingisdead/npm-kraken-api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'Assets',
                        'AssetPairs',
                        'Depth',
                        'OHLC',
                        'Spread',
                        'Ticker',
                        'Time',
                        'Trades',
                    ],
                },
                'private': {
                    'post': [
                        'AddOrder',
                        'Balance',
                        'CancelOrder',
                        'ClosedOrders',
                        'DepositAddresses',
                        'DepositMethods',
                        'DepositStatus',
                        'Ledgers',
                        'OpenOrders',
                        'OpenPositions',
                        'QueryLedgers',
                        'QueryOrders',
                        'QueryTrades',
                        'TradeBalance',
                        'TradesHistory',
                        'TradeVolume',
                        'Withdraw',
                        'WithdrawCancel',
                        'WithdrawInfo',
                        'WithdrawStatus',
                    ],
                },
            },
        }
        params.update (config)
        super (kraken, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetAssetPairs ()
        keys = list (markets['result'].keys ())
        result = []
        for p in range (0, len (keys)):
            id = keys[p]
            market = markets['result'][id]
            base = market['base']
            quote = market['quote']
            if (base[0] == 'X') or (base[0] == 'Z'):
                base = base[1:]
            if (quote[0] == 'X') or (quote[0] == 'Z'):
                quote = quote[1:]
            base = self.commonCurrencyCode (base)
            quote = self.commonCurrencyCode (quote)
            darkpool = id.find ('.d') >= 0
            symbol = market['altname'] if darkpool else (base + '/' + quote)
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'darkpool': darkpool,
                'info': market,
            })
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        darkpool = market.find ('.d') >= 0
        if darkpool:
            raise ExchangeError (self.id + ' does not provide an order book for darkpool symbol ' + market)
        p = self.market (market)
        response = self.publicGetDepth  (self.extend ({
            'pair': p['id'],
        }, params))
        orderbook = response['result'][p['id']]
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                timestamp = order[2] * 1000
                result[side].append ([ price, amount, timestamp ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['h'][1]),
            'low': float (ticker['l'][1]),
            'bid': float (ticker['b'][0]),
            'ask': float (ticker['a'][0]),
            'vwap': float (ticker['p'][1]),
            'open': float (ticker['o']),
            'close': None,
            'first': None,
            'last': float (ticker['c'][0]),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['v'][1]),
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        pairs = []
        for s in range (0, len (self.symbols)):
            symbol = self.symbols[s]
            market = self.markets[symbol]
            if not market['darkpool']:
                pairs.append (market['id'])
        filter = ','.join (pairs)
        response = self.publicGetTicker ({
            'pair': filter,
        })
        tickers = response['result']
        ids = list (tickers.keys ())
        result = {}
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        darkpool = market.find ('.d') >= 0
        if darkpool:
            raise ExchangeError (self.id + ' does not provide a ticker for darkpool symbol ' + market)
        p = self.market (market)
        response = self.publicGetTicker ({
            'pair': p['id'],
        })
        ticker = response['result'][p['id']]
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTrades ({
            'pair': self.market_id (market),
        })

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostBalance ()
        balances = response['result']
        result = { 'info': balances }
        currencies = list (balances.keys ())
        for c in range (0, len (currencies)):
            currency = currencies[c]
            code = currency
            # X-ISO4217-A3 standard currency codes
            if code[0] == 'X':
                code = code[1:]
            elif code[0] == 'Z':
                code = code[1:]
            code = self.commonCurrencyCode (code)
            balance = float (balances[currency])
            account = {
                'free': balance,
                'used': None,
                'total': balance,
            }
            result[code] = account
        return result

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'pair': self.market_id (market),
            'type': side,
            'ordertype': type,
            'volume': amount,
        }
        if type == 'limit':
            order['price'] = price
        return self.privatePostAddOrder (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostCancelOrder ({ 'txid': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = '/' + self.version + '/' + api + '/' + path
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            nonce = str (self.nonce ())
            body = _urlencode.urlencode (self.extend ({ 'nonce': nonce }, params))
            auth = self.encode (nonce + body)
            hash = self.hash (auth, 'sha256', 'binary')
            binary = self.encode (url)
            binhash = self.binary_concat (binary, hash)
            secret = base64.b64decode (self.secret)
            signature = self.hmac (binhash, secret, hashlib.sha512, 'base64')
            headers = {
                'API-Key': self.apiKey,
                'API-Sign': signature,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        url = self.urls['api'] + url
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            numErrors = len (response['error'])
            if numErrors:
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class lakebtc (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'lakebtc',
            'name': 'LakeBTC',
            'countries': 'US',
            'version': 'api_v2',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg',
                'api': 'https://api.lakebtc.com',
                'www': 'https://www.lakebtc.com',
                'doc': [
                    'https://www.lakebtc.com/s/api',
                    'https://www.lakebtc.com/s/api_v2',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'bcorderbook',
                        'bctrades',
                        'ticker',
                    ],
                },
                'private': {
                    'post': [
                        'buyOrder',
                        'cancelOrders',
                        'getAccountInfo',
                        'getExternalAccounts',
                        'getOrders',
                        'getTrades',
                        'openOrders',
                        'sellOrder',
                    ],
                },
            },
        }
        params.update (config)
        super (lakebtc, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetTicker ()
        result = []
        keys = list (markets.keys ())
        for k in range (0, len (keys)):
            id = keys[k]
            market = markets[id]
            base = id[0:3]
            quote = id[3:6]
            base = base.upper ()
            quote = quote.upper ()
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostGetAccountInfo ()
        balances = response['balance']
        result = { 'info': response }
        currencies = list (balances.keys ())
        for c in range (0, len (currencies)):
            currency = currencies[c]
            balance = float (balances[currency])
            account = {
                'free': balance,
                'used': None,
                'total': balance,
            }
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetBcorderbook (self.extend ({
            'symbol': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        tickers = self.publicGetTicker ({
            'symbol': p['id'],
        })
        ticker = tickers[p['id']]
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetBctrades ({
            'symbol': self.market_id (market)
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        method = 'privatePost' + self.capitalize (side) + 'Order'
        marketId = self.market_id (market)
        order = {
            'params': [ price, amount, marketId ],
        }
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostCancelOrder ({ 'params': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version
        if api == 'public':
            url += '/' + path
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            nonce = self.nonce ()
            if params:
                params = ','.join (params)
            else:
                params = ''
            query = _urlencode.urlencode ({
                'tonce': nonce,
                'accesskey': self.apiKey,
                'requestmethod': method.lower (),
                'id': nonce,
                'method': path,
                'params': params,
            })
            body = self.json ({
                'method': path,
                'params': params,
                'id': nonce,
            })
            signature = self.hmac (self.encode (query), self.secret, hashlib.sha1, 'base64')
            headers = {
                'Json-Rpc-Tonce': nonce,
                'Authorization': "Basic " + self.apiKey + ':' + signature,
                'Content-Length': len (body),
                'Content-Type': 'application/json',
            }
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class livecoin (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'livecoin',
            'name': 'LiveCoin',
            'countries': [ 'US', 'UK', 'RU' ],
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27980768-f22fc424-638a-11e7-89c9-6010a54ff9be.jpg',
                'api': 'https://api.livecoin.net',
                'www': 'https://www.livecoin.net',
                'doc': 'https://www.livecoin.net/api?lang=en',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/all/order_book',
                        'exchange/last_trades',
                        'exchange/maxbid_minask',
                        'exchange/order_book',
                        'exchange/restrictions',
                        'exchange/ticker', # omit params to get all tickers at once
                        'info/coinInfo',
                    ],
                },
                'private': {
                    'get': [
                        'exchange/client_orders',
                        'exchange/order',
                        'exchange/trades',
                        'exchange/commission',
                        'exchange/commissionCommonInfo',
                        'payment/balances',
                        'payment/balance',
                        'payment/get/address',
                        'payment/history/size',
                        'payment/history/transactions',
                    ],
                    'post': [
                        'exchange/buylimit',
                        'exchange/buymarket',
                        'exchange/cancellimit',
                        'exchange/selllimit',
                        'exchange/sellmarket',
                        'payment/out/capitalist',
                        'payment/out/card',
                        'payment/out/coin',
                        'payment/out/okpay',
                        'payment/out/payeer',
                        'payment/out/perfectmoney',
                        'payment/voucher/amount',
                        'payment/voucher/make',
                        'payment/voucher/redeem',
                    ],
                },
            },
        }
        params.update (config)
        super (livecoin, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetExchangeTicker ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['symbol']
            symbol = id
            base, quote = symbol.split ('/')
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        balances = self.privateGetPaymentBalances ()
        result = { 'info': balances }
        for b in range (0, len (self.currencies)):
            balance = balances[b]
            currency = balance['currency']
            account = None
            if currency in result:
                account = result[currency]
            else:
                account = {
                    'free': None,
                    'used': None,
                    'total': None,
                }
            if balance['type'] == 'total':
                account['total'] = float (balance['value'])
            if balance['type'] == 'available':
                account['free'] = float (balance['value'])
            if balance['type'] == 'trade':
                account['used'] = float (balance['value'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetExchangeOrderBook (self.extend ({
            'currencyPair': self.market_id (market),
            'groupByPrice': 'false',
            'depth': 100,
        }, params))
        timestamp = orderbook['timestamp']
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['best_bid']),
            'ask': float (ticker['best_ask']),
            'vwap': float (ticker['vwap']),
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        response = self.publicGetExchangeTicker ()
        tickers = self.index_by (response, 'symbol')
        ids = list (tickers.keys ())
        result = {}
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetExchangeTicker ({
            'currencyPair': p['id'],
        })
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetExchangeLastTrades ({
            'currencyPair': self.market_id (market)
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        method = 'privatePostExchange' + self.capitalize (side) + type
        order = {
            'currencyPair': self.market_id (market),
            'quantity': amount,
        }
        if type == 'limit':
            order['price'] = price
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.privatePostExchangeCancellimit (self.extend ({
            'orderId': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + path
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            query = _urlencode.urlencode (self.keysort (params))
            if method == 'GET':
                if query:
                    url += '?' + query
            else:
                if query:
                    body = query
            signature = self.hmac (self.encode (query), self.encode (self.secret), hashlib.sha256)            
            headers = {
                'Api-Key': self.apiKey,
                'Sign': signature.upper (),
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        response = self.fetch (url, method, headers, body)
        if 'success' in response:
            if not response['success']:
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class liqui (btce):

    def __init__ (self, config = {}):
        params = {
            'id': 'liqui',
            'name': 'Liqui',
            'countries': [ 'UA', ],
            'rateLimit': 1000,
            'version': '3',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
                'api': {
                    'public': 'https://api.liqui.io/api',
                    'private': 'https://api.liqui.io/tapi',
                },
                'www': 'https://liqui.io',
                'doc': 'https://liqui.io/api',
            },
        }
        params.update (config)
        super (liqui, self).__init__ (params)

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api]
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            url +=  '/' + self.version + '/' + self.implode_params (path, params)
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            body = _urlencode.urlencode (self.extend ({
                'nonce': nonce,
                'method': path,
            }, query))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
                'Key': self.apiKey,
                'Sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        response = self.fetch (url, method, headers, body)
        if 'success' in response:
            if not response['success']:
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class luno (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'luno',
            'name': 'luno',
            'countries': [ 'GB', 'SG', 'ZA', ],
            'rateLimit': 3000,
            'version': '1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg',
                'api': 'https://api.mybitx.com/api',
                'www': 'https://www.luno.com',
                'doc': [
                    'https://www.luno.com/en/api',
                    'https://npmjs.org/package/bitx',
                    'https://github.com/bausmeier/node-bitx',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook',
                        'ticker',
                        'tickers',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/{id}/pending',
                        'accounts/{id}/transactions',
                        'balance',
                        'fee_info',
                        'funding_address',
                        'listorders',
                        'listtrades',
                        'orders/{id}',
                        'quotes/{id}',
                        'withdrawals',
                        'withdrawals/{id}',
                    ],
                    'post': [
                        'accounts',
                        'postorder',
                        'marketorder',
                        'stoporder',
                        'funding_address',
                        'withdrawals',
                        'send',
                        'quotes',
                        'oauth2/grant',
                    ],
                    'put': [
                        'quotes/{id}',
                    ],
                    'delete': [
                        'quotes/{id}',
                        'withdrawals/{id}',
                    ],
                },
            },
        }
        params.update (config)
        super (luno, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetTickers ()
        result = []
        for p in range (0, len (markets['tickers'])):
            market = markets['tickers'][p]
            id = market['pair']
            base = id[0:3]
            quote = id[3:6]
            base = self.commonCurrencyCode (base)
            quote = self.commonCurrencyCode (quote)
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privateGetBalance ()
        balances = response['balance']
        result = { 'info': response }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = self.commonCurrencyCode (balance['asset'])
            reserved = float (balance['reserved'])
            unconfirmed = float (balance['unconfirmed'])
            account = {
                'free': float (balance['balance']),
                'used': self.sum (reserved, unconfirmed),
                'total': None,
            }
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetOrderbook (self.extend ({
            'pair': self.market_id (market),
        }, params))
        timestamp = orderbook['timestamp']
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['volume'])
                # timestamp = order[2] * 1000
                result[side].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = ticker['timestamp']
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': None,
            'low': None,
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last_trade']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['rolling_24_hour_volume']),
            'info': ticker,
        }        

    def fetch_tickers (self):
        self.loadMarkets ()
        response = self.publicGetTickers ()
        tickers = self.index_by (response['tickers'], 'pair')
        ids = list (tickers.keys ())
        result = {}
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetTicker ({
            'pair': p['id'],
        })
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTrades ({
            'pair': self.market_id (market)
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        method = 'privatePost'
        order = { 'pair': self.market_id (market) }
        if type == 'market':
            method += 'Marketorder'
            order['type'] = side.upper ()
            if side == 'buy':
                order['counter_volume'] = amount
            else:
                order['base_volume'] = amount
        else:
            method += 'Order'
            order['volume'] = amount
            order['price'] = price
            if side == 'buy':
                order['type'] = 'BID'
            else:
                order['type'] = 'ASK'
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostStoporder ({ 'order_id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if query:
            url += '?' + _urlencode.urlencode (query)
        if api == 'private':
            auth = self.encode (self.apiKey + ':' + self.secret)
            auth = base64.b64encode (auth)
            headers = { 'Authorization': 'Basic ' + self.decode (auth) }
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class mercado (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'mercado',
            'name': 'Mercado Bitcoin',
            'countries': 'BR', # Brazil
            'rateLimit': 1000,
            'version': 'v3',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg',
                'api': {
                    'public': 'https://www.mercadobitcoin.net/api',
                    'private': 'https://www.mercadobitcoin.net/tapi',
                },
                'www': 'https://www.mercadobitcoin.com.br',
                'doc': [
                    'https://www.mercadobitcoin.com.br/api-doc',
                    'https://www.mercadobitcoin.com.br/trade-api',
                ],
            },
            'api': {
                'public': {
                    'get': [ # last slash critical
                        'orderbook/',
                        'orderbook_litecoin/',
                        'ticker/',
                        'ticker_litecoin/',
                        'trades/',
                        'trades_litecoin/',
                        'v2/ticker/',
                        'v2/ticker_litecoin/',
                    ],
                },
                'private': {
                    'post': [
                        'cancel_order',
                        'get_account_info',
                        'get_order',
                        'get_withdrawal',
                        'list_system_messages',
                        'list_orders',
                        'list_orderbook',
                        'place_buy_order',
                        'place_sell_order',
                        'withdraw_coin',
                    ],
                },
            },
            'markets': {
                'BTC/BRL': { 'id': 'BRLBTC', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'suffix': '' },
                'LTC/BRL': { 'id': 'BRLLTC', 'symbol': 'LTC/BRL', 'base': 'LTC', 'quote': 'BRL', 'suffix': 'Litecoin' },
            },
        }
        params.update (config)
        super (mercado, self).__init__ (params)

    def fetch_order_book (self, market, params = {}):
        p = self.market (market)
        method = 'publicGetOrderbook' + self.capitalize (p['suffix'])
        orderbook = getattr (self, method) (params)
        timestamp = self.milliseconds ()
        result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        return result

    def fetch_ticker (self, market):
        p = self.market (market)
        method = 'publicGetV2Ticker' + self.capitalize (p['suffix'])
        response = getattr (self, method) ()
        ticker = response['ticker']
        timestamp = int (ticker['date']) * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['vol']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        p = self.market (market)
        method = 'publicGetTrades' + self.capitalize (p['suffix'])
        return getattr (self, method) ()

    def fetch_balance (self):
        response = self.privatePostGetAccountInfo ()
        balances = response['balance']
        result = { 'info': response }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if lowercase in balances:
                account['free'] = float (balances[lowercase]['available'])
                account['total'] = float (balances[lowercase]['total'])
                account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def create_order (self, market, type, side, amount, price = None, params = {}):
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        method = 'privatePostPlace' + self.capitalize (side) + 'Order'
        order = {
            'coin_pair': self.market_id (market),
            'quantity': amount,
            'limit_price': price,
        }
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        return self.privatePostCancelOrder (self.extend ({
            'order_id': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api] + '/'
        if api == 'public':
            url += path
        else:
            url += self.version + '/'
            nonce = self.nonce ()
            body = _urlencode.urlencode (self.extend ({
                'tapi_method': path,
                'tapi_nonce': nonce,
            }, params))
            auth = '/tapi/' + self.version  + '/' + '?' + body
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'TAPI-ID': self.apiKey,
                'TAPI-MAC': self.hmac (self.encode (auth), self.secret, hashlib.sha512),
            }
        response = self.fetch (url, method, headers, body)
        if 'error_message' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class okcoin (Exchange):

    def __init__ (self, config = {}):
        params = {
            'version': 'v1',
            'rateLimit': 1000, # up to 3000 requests per 5 minutes ≈ 600 requests per minute ≈ 10 requests per second ≈ 100 ms
            'api': {
                'public': {
                    'get': [
                        'depth',
                        'exchange_rate',
                        'future_depth',
                        'future_estimated_price',
                        'future_hold_amount',
                        'future_index',
                        'future_kline',
                        'future_price_limit',
                        'future_ticker',
                        'future_trades',
                        'kline',
                        'otcs',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'account_records',
                        'batch_trade',
                        'borrow_money',
                        'borrow_order_info',
                        'borrows_info',
                        'cancel_borrow',
                        'cancel_order',
                        'cancel_otc_order',
                        'cancel_withdraw',
                        'future_batch_trade',
                        'future_cancel',
                        'future_devolve',
                        'future_explosive',
                        'future_order_info',
                        'future_orders_info',
                        'future_position',
                        'future_position_4fix',
                        'future_trade',
                        'future_trades_history',
                        'future_userinfo',
                        'future_userinfo_4fix',
                        'lend_depth',
                        'order_fee',
                        'order_history',
                        'order_info',
                        'orders_info',
                        'otc_order_history',
                        'otc_order_info',
                        'repayment',
                        'submit_otc_order',
                        'trade',
                        'trade_history',
                        'trade_otc_order',
                        'withdraw',
                        'withdraw_info',
                        'unrepayments_info',
                        'userinfo',
                    ],
                },
            },
        }
        params.update (config)
        super (okcoin, self).__init__ (params)

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetDepth (self.extend ({
            'symbol': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': orderbook['bids'],
            'asks': self.sort_by (orderbook['asks'], 0),
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        return result

    def fetch_ticker (self, market):
        response = self.publicGetTicker ({
            'symbol': self.market_id (market),
        })
        ticker = response['ticker']
        timestamp = int (response['date']) * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['vol']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetTrades ({
            'symbol': self.market_id (market),
        })

    def fetch_balance (self):
        response = self.privatePostUserinfo ()
        balances = response['info']['funds']
        result = { 'info': response }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if lowercase in balances['free']:
                account['free'] = float (balances['free'][lowercase])
            if lowercase in balances['freezed']:
                account['used'] = float (balances['freezed'][lowercase])
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def create_order (self, market, type, side, amount, price = None, params = {}):
        order = {
            'symbol': self.market_id (market),
            'type': side,
            'amount': amount,
        }
        if type == 'limit':
            order['price'] = price
        else:
            order['type'] += '_market'
        return self.privatePostTrade (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        return self.privatePostCancelOrder (self.extend ({
            'order_id': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = '/api/' + self.version + '/' + path + '.do'
        if api == 'public':
            if params:
                url += '?' + _urlencode.urlencode (params)
        else:
            query = self.keysort (self.extend ({
                'api_key': self.apiKey,
            }, params))
            # secret key must be at the end of query
            queryString = _urlencode.urlencode (query) + '&secret_key=' + self.secret
            query['sign'] = self.hash (self.encode (queryString)).upper ()
            body = _urlencode.urlencode (query)
            headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
        url = self.urls['api'] + url
        response = self.fetch (url, method, headers, body)
        if 'result' in response:
            if not response['result']:
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class okcoincny (okcoin):

    def __init__ (self, config = {}):
        params = {
            'id': 'okcoincny',
            'name': 'OKCoin CNY',
            'countries': 'CN',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg',
                'api': 'https://www.okcoin.cn',
                'www': 'https://www.okcoin.cn',
                'doc': 'https://www.okcoin.cn/rest_getStarted.html',
            },
            'markets': {
                'BTC/CNY': { 'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY' },
                'LTC/CNY': { 'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY' },
            },
        }
        params.update (config)
        super (okcoincny, self).__init__ (params)

#------------------------------------------------------------------------------

class okcoinusd (okcoin):

    def __init__ (self, config = {}):
        params = {
            'id': 'okcoinusd',
            'name': 'OKCoin USD',
            'countries': [ 'CN', 'US' ],
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api': 'https://www.okcoin.com',
                'www': 'https://www.okcoin.com',
                'doc': [
                    'https://www.okcoin.com/rest_getStarted.html',
                    'https://www.npmjs.com/package/okcoin.com',
                ],
            },
            'markets': {
                'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'LTC/USD': { 'id': 'ltc_usd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
            },
        }
        params.update (config)
        super (okcoinusd, self).__init__ (params)

#------------------------------------------------------------------------------

class paymium (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'paymium',
            'name': 'Paymium',
            'countries': [ 'FR', 'EU', ],
            'rateLimit': 2000,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg',
                'api': 'https://paymium.com/api',
                'www': 'https://www.paymium.com',
                'doc': [
                    'https://github.com/Paymium/api-documentation',
                    'https://www.paymium.com/page/developers',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'countries',
                        'data/{id}/ticker',
                        'data/{id}/trades',
                        'data/{id}/depth',
                        'bitcoin_charts/{id}/trades',
                        'bitcoin_charts/{id}/depth',
                    ],
                },
                'private': {
                    'get': [
                        'merchant/get_payment/{UUID}',
                        'user',
                        'user/addresses',
                        'user/addresses/{btc_address}',
                        'user/orders',
                        'user/orders/{UUID}',
                        'user/price_alerts',
                    ],
                    'post': [
                        'user/orders',
                        'user/addresses',
                        'user/payment_requests',
                        'user/price_alerts',
                        'merchant/create_payment',
                    ],
                    'delete': [
                        'user/orders/{UUID}/cancel',
                        'user/price_alerts/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/EUR': { 'id': 'eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR' },
            },
        }
        params.update (config)
        super (paymium, self).__init__ (params)

    def fetch_balance (self):
        balances = self.privateGetUser ()
        result = { 'info': balances }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            balance = 'balance_' + lowercase
            locked = 'locked_' + lowercase
            if balance in balances:
                account['free'] = balances[balance]
            if locked in balances:
                account['used'] = balances[locked]
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetDataIdDepth  (self.extend ({
            'id': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = order['price']
                amount = order['amount']
                timestamp = order['timestamp'] * 1000
                result[side].append ([ price, amount, timestamp ])
        result['bids'] = self.sort_by (result['bids'], 0, True)
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetDataIdTicker ({
            'id': self.market_id (market),
        })
        timestamp = ticker['at'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': float (ticker['vwap']),
            'open': float (ticker['open']),
            'close': None,
            'first': None,
            'last': float (ticker['price']),
            'change': None,
            'percentage': float (ticker['variation']),
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetDataIdTrades ({
            'id': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        order = {
            'type': self.capitalize (type) + 'Order',
            'currency': self.market_id (market),
            'direction': side,
            'amount': amount,
        }
        if type == 'market':
            order['price'] = price
        return self.privatePostUserOrders (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        return self.privatePostCancelOrder (self.extend ({
            'orderNumber': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            body = self.json (params)
            nonce = str (self.nonce ())
            auth = nonce + url + body
            headers = {
                'Api-Key': self.apiKey,
                'Api-Signature': self.hmac (self.encode (auth), self.secret),
                'Api-Nonce': nonce,
                'Content-Type': 'application/json',
            }
        response = self.fetch (url, method, headers, body)
        if 'errors' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class poloniex (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'poloniex',
            'name': 'Poloniex',
            'countries': 'US',
            'rateLimit': 500, # 6 calls per second
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'public': 'https://poloniex.com/public',
                    'private': 'https://poloniex.com/tradingApi',
                },
                'www': 'https://poloniex.com',
                'doc': [
                    'https://poloniex.com/support/api/',
                    'http://pastebin.com/dMX7mZE0',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'return24hVolume',
                        'returnChartData',
                        'returnCurrencies',
                        'returnLoanOrders',
                        'returnOrderBook',
                        'returnTicker',
                        'returnTradeHistory',
                    ],
                },
                'private': {
                    'post': [
                        'buy',
                        'cancelLoanOffer',
                        'cancelOrder',
                        'closeMarginPosition',
                        'createLoanOffer',
                        'generateNewAddress',
                        'getMarginPosition',
                        'marginBuy',
                        'marginSell',
                        'moveOrder',
                        'returnActiveLoans',
                        'returnAvailableAccountBalances',
                        'returnBalances',
                        'returnCompleteBalances',
                        'returnDepositAddresses',
                        'returnDepositsWithdrawals',
                        'returnFeeInfo',
                        'returnLendingHistory',
                        'returnMarginAccountSummary',
                        'returnOpenLoanOffers',
                        'returnOpenOrders',
                        'returnOrderTrades',
                        'returnTradableBalances',
                        'returnTradeHistory',
                        'sell',
                        'toggleAutoRenew',
                        'transferBalance',
                        'withdraw',
                    ],
                },
            },
        }
        params.update (config)
        super (poloniex, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetReturnTicker ()
        keys = list (markets.keys ())
        result = []
        for p in range (0, len (keys)):
            id = keys[p]
            market = markets[id]
            quote, base = id.split ('_')
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        balances = self.privatePostReturnCompleteBalances ({
            'account': 'all',
        })
        result = { 'info': balances }
        currencies = list (balances.keys ())
        for c in range (0, len (currencies)):
            currency = currencies[c]
            balance = balances[currency]
            account = {
                'free': float (balance['available']),
                'used': float (balance['onOrders']),
                'total': None,
            }
            account['total'] = self.sum (account['free'], account['used'])
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetReturnOrderBook (self.extend ({
            'currencyPair': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        tickers = self.publicGetReturnTicker ()
        ticker = tickers[p['id']]
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high24hr']),
            'low': float (ticker['low24hr']),
            'bid': float (ticker['highestBid']),
            'ask': float (ticker['lowestAsk']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': float (ticker['percentChange']),
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['baseVolume']),
            'quoteVolume': float (ticker['quoteVolume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetReturnTradeHistory ({
            'currencyPair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        method = 'privatePost' + self.capitalize (side)
        return getattr (self, method) (self.extend ({
            'currencyPair': self.market_id (market),
            'rate': price,
            'amount': amount,
        }, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.privatePostCancelOrder (self.extend ({
            'orderNumber': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api]
        query = self.extend ({ 'command': path }, params)
        if api == 'public':
            url += '?' + _urlencode.urlencode (query)
        else:
            query['nonce'] = self.nonce ()
            body = _urlencode.urlencode (query)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': self.apiKey,
                'Sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class quadrigacx (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'quadrigacx',
            'name': 'QuadrigaCX',
            'countries': 'CA',
            'rateLimit': 1000,
            'version': 'v2',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766825-98a6d0de-5ee7-11e7-9fa4-38e11a2c6f52.jpg',
                'api': 'https://api.quadrigacx.com',
                'www': 'https://www.quadrigacx.com',
                'doc': 'https://www.quadrigacx.com/api_info',
            },
            'api': {
                'public': {
                    'get': [
                        'order_book',
                        'ticker',
                        'transactions',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'bitcoin_deposit_address',
                        'bitcoin_withdrawal',
                        'buy',
                        'cancel_order',
                        'ether_deposit_address',
                        'ether_withdrawal',
                        'lookup_order',
                        'open_orders',
                        'sell',
                        'user_transactions',
                    ],
                },
            },
            'markets': {
                'BTC/CAD': { 'id': 'btc_cad', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD' },
                'BTC/USD': { 'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'ETH/BTC': { 'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC' },
                'ETH/CAD': { 'id': 'eth_cad', 'symbol': 'ETH/CAD', 'base': 'ETH', 'quote': 'CAD' },
            },
        }
        params.update (config)
        super (quadrigacx, self).__init__ (params)

    def fetch_balance (self):
        balances = self.privatePostBalance ()
        result = { 'info': balances }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': float (balances[lowercase + '_available']),
                'used': float (balances[lowercase + '_reserved']),
                'total': float (balances[lowercase + '_balance']),
            }
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        orderbook = self.publicGetOrderBook (self.extend ({
            'book': self.market_id (market),
        }, params))
        timestamp = int (orderbook['timestamp']) * 1000
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        ticker = self.publicGetTicker ({
            'book': self.market_id (market),
        })
        timestamp = int (ticker['timestamp']) * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': float (ticker['vwap']),
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        return self.publicGetTransactions ({
            'book': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        method = 'privatePost' + self.capitalize (side)
        order = {
            'amount': amount,
            'book': self.market_id (market),
        }
        if type == 'limit':
            order['price'] = price
        return getattr (self, method) (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        return self.privatePostCancelOrder (self.extend ({
            'id': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + path
        if api == 'public':
            url += '?' + _urlencode.urlencode (params)
        else:
            if not self.uid:
                raise AuthenticationError (self.id + ' requires `' + self.id + '.uid` property for authentication')
            nonce = self.nonce ()
            request = ''.join ([ str (nonce), self.uid, self.apiKey ])
            signature = self.hmac (self.encode (request), self.encode (self.secret))
            query = self.extend ({
                'key': self.apiKey,
                'nonce': nonce,
                'signature': signature,
            }, params)
            body = self.json (query)
            headers = {
                'Content-Type': 'application/json',
                'Content-Length': len (body),
            }
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class quoine (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'quoine',
            'name': 'QUOINE',
            'countries': [ 'JP', 'SG', 'VN' ],
            'version': '2',
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766844-9615a4e8-5ee8-11e7-8814-fcd004db8cdd.jpg',
                'api': 'https://api.quoine.com',
                'www': 'https://www.quoine.com',
                'doc': 'https://developers.quoine.com',
            },
            'api': {
                'public': {
                    'get': [
                        'products',
                        'products/{id}',
                        'products/{id}/price_levels',
                        'executions',
                        'ir_ladders/{currency}',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/balance',
                        'crypto_accounts',
                        'executions/me',
                        'fiat_accounts',
                        'loan_bids',
                        'loans',
                        'orders',
                        'orders/{id}',
                        'orders/{id}/trades',
                        'trades',
                        'trades/{id}/loans',
                        'trading_accounts',
                        'trading_accounts/{id}',
                    ],
                    'post': [
                        'fiat_accounts',
                        'loan_bids',
                        'orders',
                    ],
                    'put': [
                        'loan_bids/{id}/close',
                        'loans/{id}',
                        'orders/{id}',
                        'orders/{id}/cancel',
                        'trades/{id}',
                        'trades/{id}/close',
                        'trades/close_all',
                        'trading_accounts/{id}',
                    ],
                },
            },
        }
        params.update (config)
        super (quoine, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetProducts ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['id']
            base = market['base_currency']
            quote = market['quoted_currency']
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        balances = self.privateGetAccountsBalance ()
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]            
            currency = balance['currency']
            total = float (balance['balance'])
            account = {
                'free': total,
                'used': None,
                'total': total,
            }
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetProductsIdPriceLevels (self.extend ({
            'id': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = { 'bids': 'buy_price_levels', 'asks': 'sell_price_levels' }
        keys = list (sides.keys ())
        for k in range (0, len (keys)):
            key = keys[k]
            side = sides[key]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[key].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high_market_ask']),
            'low': float (ticker['low_market_bid']),
            'bid': float (ticker['market_bid']),
            'ask': float (ticker['market_ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last_traded_price']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['volume_24h']),
            'quoteVolume': None,
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        tickers = self.publicGetProducts ()
        result = {}
        for t in range (0, len (tickers)):
            ticker = tickers[t]
            base = ticker['base_currency']
            quote = ticker['quoted_currency']
            symbol = base + '/' + quote
            market = self.markets[symbol]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetProductsId ({
            'id': p['id'],
        })
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetExecutions ({
            'market_id': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'order_type': type,
            'product_id': self.market_id (market),
            'side': side,
            'quantity': amount,
        }
        if type == 'limit':
            order['price'] = price
        return self.privatePostOrders (self.extend ({
            'order': order,
        }, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.privatePutOrdersIdCancel (self.extend ({
            'id': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        headers = {
            'X-Quoine-API-Version': self.version,
            'Content-Type': 'application/json',
        }
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            request = {
                'path': url,
                'nonce': nonce,
                'token_id': self.apiKey,
                'iat': int (math.floor (nonce / 1000)), # issued at
            }
            if query:
                body = self.json (query)
            headers['X-Quoine-Auth'] = self.jwt (request, self.secret)
        response = self.fetch (self.urls['api'] + url, method, headers, body)
        if 'message' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class southxchange (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'southxchange',
            'name': 'SouthXchange',
            'countries': 'AR', # Argentina
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg',
                'api': 'https://www.southxchange.com/api',
                'www': 'https://www.southxchange.com',
                'doc': 'https://www.southxchange.com/Home/Api',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'price/{symbol}',
                        'prices',
                        'book/{symbol}',
                        'trades/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'cancelMarketOrders',
                        'cancelOrder',
                        'generatenewaddress',
                        'listOrders',
                        'listBalances',
                        'placeOrder',
                        'withdraw',
                    ],
                },
            },
        }
        params.update (config)
        super (southxchange, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetMarkets ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            base = market[0]
            quote = market[1]
            symbol = base + '/' + quote
            id = symbol
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        balances = self.privatePostListBalances ()
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]            
            currency = balance['Currency']
            uppercase = currency.uppercase
            free = float (balance['Available'])
            used = float (balance['Unconfirmed'])
            total = self.sum (free, used)
            account = {
                'free': free,
                'used': used,
                'total': total,
            }
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetBookSymbol (self.extend ({
            'symbol': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = { 'bids': 'BuyOrders', 'asks': 'SellOrders' }
        keys = list (sides.keys ())
        for k in range (0, len (keys)):
            key = keys[k]
            side = sides[key]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['Price'])
                amount = float (order['Amount'])
                result[key].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': None,
            'low': None,
            'bid': float (ticker['Bid']),
            'ask': float (ticker['Ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['Last']),
            'change': float (ticker['Variation24Hr']),
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['Volume24Hr']),
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        response = self.publicGetPrices ()
        tickers = self.index_by (response, 'Market')
        ids = list (tickers.keys ())
        result = {}
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetPriceSymbol ({
            'symbol': self.market_id (market),
        })
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTradesSymbol ({
            'symbol': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        order = {
            'listingCurrency': p['base'],
            'referenceCurrency': p['quote'],
            'type': side,
            'amount': amount,
        }
        if type == 'limit':
            order['limitPrice'] = price
        return self.privatePostPlaceOrder (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.privatePostCancelOrder (self.extend ({
            'orderCode': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'private':
            nonce = self.nonce ()
            query = self.extend ({
                'key': self.apiKey,
                'nonce': nonce,
            }, query)
            body = self.json (query)
            headers = {
                'Content-Type': 'application/json',
                'Hash': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        response = self.fetch (url, method, headers, body)
        if not response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class surbitcoin (blinktrade):

    def __init__ (self, config = {}):
        params = {
            'id': 'surbitcoin',
            'name': 'SurBitcoin',
            'countries': 'VE',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://surbitcoin.com',
                'doc': 'https://blinktrade.com/docs',
            },
            'comment': 'Blinktrade API',
            'markets': {
                'BTC/VEF': { 'id': 'BTCVEF', 'symbol': 'BTC/VEF', 'base': 'BTC', 'quote': 'VEF', 'brokerId': 1, 'broker': 'SurBitcoin', },
            },
        }
        params.update (config)
        super (surbitcoin, self).__init__ (params)

#------------------------------------------------------------------------------

class therock (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'therock',
            'name': 'TheRockTrading',
            'countries': 'MT',
            'rateLimit': 1000,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg',
                'api': 'https://api.therocktrading.com',
                'www': 'https://therocktrading.com',
                'doc': [
                    'https://api.therocktrading.com/doc/v1/index.html',
                    'https://api.therocktrading.com/doc/',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'funds/{id}/orderbook',
                        'funds/{id}/ticker',
                        'funds/{id}/trades',
                        'funds/tickers',
                    ],
                },
                'private': {
                    'get': [
                        'balances',
                        'balances/{id}',
                        'discounts',
                        'discounts/{id}',
                        'funds',
                        'funds/{id}',
                        'funds/{id}/trades',
                        'funds/{fund_id}/orders',
                        'funds/{fund_id}/orders/{id}',
                        'funds/{fund_id}/position_balances',
                        'funds/{fund_id}/positions',
                        'funds/{fund_id}/positions/{id}',
                        'transactions',
                        'transactions/{id}',
                        'withdraw_limits/{id}',
                        'withdraw_limits',
                    ],
                    'post': [
                        'atms/withdraw',
                        'funds/{fund_id}/orders',
                    ],
                    'delete': [
                        'funds/{fund_id}/orders/{id}',
                        'funds/{fund_id}/orders/remove_all',
                    ],
                },
            },
        }
        params.update (config)
        super (therock, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetFundsTickers ()
        result = []
        for p in range (0, len (markets['tickers'])):
            market = markets['tickers'][p]
            id = market['fund_id']
            base = id[0:3]
            quote = id[3:6]
            symbol = base + '/' + quote
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privateGetBalances ()
        balances = response['balances']
        result = { 'info': response }
        for b in range (0, len (balances)):
            balance = balances[b]            
            currency = balance['currency']
            free = balance['trading_balance']
            total = balance['balance']
            used = total - free            
            account = {
                'free': free,
                'used': used,
                'total': total,
            }
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.publicGetFundsIdOrderbook (self.extend ({
            'id': self.market_id (market),
        }, params))
        timestamp = self.parse8601 (orderbook['date'])
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['amount'])
                result[side].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = self.parse8601 (ticker['date'])
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['bid']),
            'ask': float (ticker['ask']),
            'vwap': None,
            'open': float (ticker['open']),
            'close': float (ticker['close']),
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['volume_traded']),
            'quoteVolume': float (ticker['volume']),
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        response = self.publicGetFundsTickers ()
        tickers = self.index_by (response['tickers'], 'fund_id')
        ids = list (tickers.keys ())
        result = {}
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        ticker = self.publicGetFundsIdTicker ({
            'id': p['id'],
        })
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetFundsIdTrades ({
            'id': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        return self.privatePostFundsFundIdOrders (self.extend ({
            'fund_id': self.market_id (market),
            'side': side,
            'amount': amount,
            'price': price,
        }, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.privateDeleteFundsFundIdOrdersId (self.extend ({
            'id': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + self.version + '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'private':
            nonce = str (self.nonce ())
            auth = nonce + url
            headers = {
                'X-TRT-KEY': self.apiKey,
                'X-TRT-NONCE': nonce,
                'X-TRT-SIGN': self.hmac (self.encode (auth), self.encode (self.secret), hashlib.sha512),
            }
            if query:
                body = self.json (query)
                headers['Content-Type'] = 'application/json'
        response = self.fetch (url, method, headers, body)
        if 'errors' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class urdubit (blinktrade):

    def __init__ (self, config = {}):
        params = {
            'id': 'urdubit',
            'name': 'UrduBit',
            'countries': 'PK',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991453-156bf3ae-6480-11e7-82eb-7295fe1b5bb4.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://urdubit.com',
                'doc': 'https://blinktrade.com/docs',
            },
            'comment': 'Blinktrade API',
            'markets': {
                'BTC/PKR': { 'id': 'BTCPKR', 'symbol': 'BTC/PKR', 'base': 'BTC', 'quote': 'PKR', 'brokerId': 8, 'broker': 'UrduBit', },
            },
        }
        params.update (config)
        super (urdubit, self).__init__ (params)

#------------------------------------------------------------------------------

class vaultoro (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'vaultoro',
            'name': 'Vaultoro',
            'countries': 'CH',
            'rateLimit': 1000,
            'version': '1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg',
                'api': 'https://api.vaultoro.com',
                'www': 'https://www.vaultoro.com',
                'doc': 'https://api.vaultoro.com',
            },
            'api': {
                'public': {
                    'get': [
                        'bidandask',
                        'buyorders',
                        'latest',
                        'latesttrades',
                        'markets',
                        'orderbook',
                        'sellorders',
                        'transactions/day',
                        'transactions/hour',
                        'transactions/month',
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'mytrades',
                        'orders',
                    ],
                    'post': [
                        'buy/{symbol}/{type}',
                        'cancel/{id}',
                        'sell/{symbol}/{type}',
                        'withdraw',
                    ],
                },
            },
        }
        params.update (config)
        super (vaultoro, self).__init__ (params)

    def fetch_markets (self):
        result = []
        markets = self.publicGetMarkets ()
        market = markets['data']
        base = market['BaseCurrency']
        quote = market['MarketCurrency']
        symbol = base + '/' + quote
        baseId = base
        quoteId = quote
        id = market['MarketName']
        result.append ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'info': market,
        })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privateGetBalance ()
        balances = response['data']
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]            
            currency = balance['currency_code']
            uppercase = currency.upper ()
            free = balance['cash']
            used = balance['reserved']
            total = self.sum (free, used)
            account = {
                'free': free,
                'used': used,
                'total': total,
            }
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        response = self.publicGetOrderbook (params)
        orderbook = {
            'bids': response['data'][0]['b'],
            'asks': response['data'][1]['s'],
        }
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = order['Gold_Price']
                amount = order['Gold_Amount']
                result[side].append ([ price, amount ])
        result['bids'] = self.sort_by (result['bids'], 0, True)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        quote = self.publicGetBidandask ()
        bidsLength = len (quote['bids'])
        bid = quote['bids'][bidsLength - 1]
        ask = quote['asks'][0]
        response = self.publicGetMarkets ()
        ticker = response['data']
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['24hHigh']),
            'low': float (ticker['24hLow']),
            'bid': bid[0],
            'ask': ask[0],
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['LastPrice']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['24hVolume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTransactionsDay ()

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        method = 'privatePost' + self.capitalize (side) + 'SymbolType'
        return getattr (self, method) (self.extend ({
            'symbol': p['quoteId'].lower (),
            'type': type,
            'gld': amount,
            'price': price or 1,
        }, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.privatePostCancelId (self.extend ({
            'id': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/'
        if api == 'public':
            url += path
        else:
            nonce = self.nonce ()
            url += self.version + '/' + self.implode_params (path, params)
            query = self.extend ({
                'nonce': nonce,
                'apikey': self.apiKey,
            }, self.omit (params, self.extract_params (path)))
            url += '?' + _urlencode.urlencode (query)
            headers = {
                'Content-Type': 'application/json',
                'X-Signature': self.hmac (self.encode (url), self.encode (self.secret))
            }
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class vbtc (blinktrade):

    def __init__ (self, config = {}):
        params = {
            'id': 'vbtc',
            'name': 'VBTC',
            'countries': 'VN',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://vbtc.exchange',
                'doc': 'https://blinktrade.com/docs',
            },
            'comment': 'Blinktrade API',
            'markets': {
                'BTC/VND': { 'id': 'BTCVND', 'symbol': 'BTC/VND', 'base': 'BTC', 'quote': 'VND', 'brokerId': 3, 'broker': 'VBTC', },
            },
        }
        params.update (config)
        super (vbtc, self).__init__ (params)

#------------------------------------------------------------------------------

class virwox (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'virwox',
            'name': 'VirWoX',
            'countries': 'AT',
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766894-6da9d360-5eea-11e7-90aa-41f2711b7405.jpg',
                'api': {
                    'public': 'http://api.virwox.com/api/json.php',
                    'private': 'https://www.virwox.com/api/trading.php',
                },
                'www': 'https://www.virwox.com',
                'doc': 'https://www.virwox.com/developers.php',
            },
            'api': {
                'public': {
                    'get': [
                        'getInstruments',
                        'getBestPrices',
                        'getMarketDepth',
                        'estimateMarketOrder',
                        'getTradedPriceVolume',
                        'getRawTradeData',
                        'getStatistics',
                        'getTerminalList',
                        'getGridList',
                        'getGridStatistics',
                    ],
                    'post': [
                        'getInstruments',
                        'getBestPrices',
                        'getMarketDepth',
                        'estimateMarketOrder',
                        'getTradedPriceVolume',
                        'getRawTradeData',
                        'getStatistics',
                        'getTerminalList',
                        'getGridList',
                        'getGridStatistics',
                    ],
                },
                'private': {
                    'get': [
                        'cancelOrder',
                        'getBalances',
                        'getCommissionDiscount',
                        'getOrders',
                        'getTransactions',
                        'placeOrder',
                    ],
                    'post': [
                        'cancelOrder',
                        'getBalances',
                        'getCommissionDiscount',
                        'getOrders',
                        'getTransactions',
                        'placeOrder',
                    ],
                },
            },
        }
        params.update (config)
        super (virwox, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetInstruments ()
        keys = list (markets['result'].keys ())
        result = []
        for p in range (0, len (keys)):
            market = markets['result'][keys[p]]
            id = market['instrumentID']
            symbol = market['symbol']
            base = market['longCurrency']
            quote = market['shortCurrency']
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privatePostGetBalances ()
        balances = response['result']['accountList']
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]            
            currency = balance['currency']
            total = balance['balance']
            account = {
                'free': total,
                'used': None,
                'total': total,
            }
            result[currency] = account
        return result

    def fetchBestPrices (self, market):
        self.loadMarkets ()
        return self.publicPostGetBestPrices ({
            'symbols': [ self.symbol (market) ],
        })

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        response = self.publicPostGetMarketDepth (self.extend ({
            'symbols': [ self.symbol (market) ],
            'buyDepth': 100,
            'sellDepth': 100,
        }, params))
        orderbook = response['result'][0]
        timestamp = self.milliseconds ()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = { 'bids': 'buy', 'asks': 'sell' }
        keys = list (sides.keys ())
        for k in range (0, len (keys)):
            key = keys[k]
            side = sides[key]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['price'])
                amount = float (order['volume'])
                result[key].append ([ price, amount ])
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        end = self.milliseconds ()
        start = end - 86400000
        response = self.publicGetTradedPriceVolume ({
            'instrument': self.symbol (market),
            'endDate': self.yyyymmddhhmmss (end),
            'startDate': self.yyyymmddhhmmss (start),
            'HLOC': 1,
        })
        tickers = response['result']['priceVolumeList']
        keys = list (tickers.keys ())
        length = len (keys)
        lastKey = keys[length - 1]
        ticker = tickers[lastKey]
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': None,
            'ask': None,
            'vwap': None,
            'open': float (ticker['open']),
            'close': float (ticker['close']),
            'first': None,
            'last': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float (ticker['longVolume']),
            'quoteVolume': float (ticker['shortVolume']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetRawTradeData ({
            'instrument': self.symbol (market),
            'timespan': 3600,
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'instrument': self.symbol (market),
            'orderType': side.upper (),
            'amount': amount,
        }
        if type == 'limit':
            order['price'] = price
        return self.privatePostPlaceOrder (self.extend (order, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.privatePostCancelOrder (self.extend ({
            'orderID': id,
        }, params))

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'][api]
        auth = {}
        if api == 'private':
            auth['key'] = self.apiKey
            auth['user'] = self.login
            auth['pass'] = self.password
        nonce = self.nonce ()
        if method == 'GET':
            url += '?' + _urlencode.urlencode (self.extend ({
                'method': path,
                'id': nonce,
            }, auth, params))
        else:
            headers = { 'Content-Type': 'application/json' }
            body = self.json ({
                'method': path,
                'params': self.extend (auth, params),
                'id': nonce,
            })
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            if response['error']:
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class xbtce (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'xbtce',
            'name': 'xBTCe',
            'countries': 'RU',
            'rateLimit': 2000, # responses are cached every 2 seconds
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg',
                'api': 'https://cryptottlivewebapi.xbtce.net:8443/api',
                'www': 'https://www.xbtce.com',
                'doc': [
                    'https://www.xbtce.com/tradeapi',
                    'https://support.xbtce.info/Knowledgebase/Article/View/52/25/xbtce-exchange-api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'currency',
                        'currency/{filter}',
                        'level2',
                        'level2/{filter}',
                        'quotehistory/{symbol}/{periodicity}/bars/ask',
                        'quotehistory/{symbol}/{periodicity}/bars/bid',
                        'quotehistory/{symbol}/level2',
                        'quotehistory/{symbol}/ticks',
                        'symbol',
                        'symbol/{filter}',
                        'tick',
                        'tick/{filter}',
                        'ticker',
                        'ticker/{filter}',
                        'tradesession',
                    ],
                },
                'private': {
                    'get': [
                        'tradeserverinfo',
                        'tradesession',
                        'currency',
                        'currency/{filter}',
                        'level2',
                        'level2/{filter}',
                        'symbol',
                        'symbol/{filter}',
                        'tick',
                        'tick/{filter}',
                        'account',
                        'asset',
                        'asset/{id}',
                        'position',
                        'position/{id}',
                        'trade',
                        'trade/{id}',
                        'quotehistory/{symbol}/{periodicity}/bars/ask',
                        'quotehistory/{symbol}/{periodicity}/bars/ask/info',
                        'quotehistory/{symbol}/{periodicity}/bars/bid',
                        'quotehistory/{symbol}/{periodicity}/bars/bid/info',
                        'quotehistory/{symbol}/level2',
                        'quotehistory/{symbol}/level2/info',
                        'quotehistory/{symbol}/periodicities',
                        'quotehistory/{symbol}/ticks',
                        'quotehistory/{symbol}/ticks/info',
                        'quotehistory/cache/{symbol}/{periodicity}/bars/ask',
                        'quotehistory/cache/{symbol}/{periodicity}/bars/bid',
                        'quotehistory/cache/{symbol}/level2',
                        'quotehistory/cache/{symbol}/ticks',
                        'quotehistory/symbols',
                        'quotehistory/version',
                    ],
                    'post': [
                        'trade',
                        'tradehistory',
                    ],
                    'put': [
                        'trade',
                    ],
                    'delete': [
                        'trade',
                    ],
                },
            },
        }
        params.update (config)
        super (xbtce, self).__init__ (params)

    def fetch_markets (self):
        markets = self.privateGetSymbol ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['Symbol']
            base = market['MarginCurrency']
            quote = market['ProfitCurrency']
            if base == 'DSH':
                base = 'DASH'
            symbol = base + '/' + quote
            symbol = symbol if market['IsTradeAllowed'] else id
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        balances = self.privateGetAsset ()
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]            
            currency = balance['Currency']
            uppercase = currency.upper ()
            # xbtce names DASH incorrectly as DSH
            if uppercase == 'DSH':
                uppercase = 'DASH'
            total = balance['balance']
            account = {
                'free': balance['FreeAmount'],
                'used': balance['LockedAmount'],
                'total': balance['Amount'],
            }
            result[uppercase] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        orderbook = self.privateGetLevel2Filter (self.extend ({
            'filter': p['id'],
        }, params))
        orderbook = orderbook[0]
        timestamp = orderbook['Timestamp']
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            Side = self.capitalize (side)
            orders = orderbook[Side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order['Price'])
                amount = float (order['Volume'])
                result[side].append ([ price, amount ])
        return result

    def parse_ticker (self, ticker, market):
        timestamp = 0
        last = None
        if 'LastBuyTimestamp' in ticker:
            if timestamp < ticker['LastBuyTimestamp']:
                timestamp = ticker['LastBuyTimestamp']
                last = ticker['LastBuyPrice']
        if 'LastSellTimestamp' in ticker:
            if timestamp < ticker['LastSellTimestamp']:
                timestamp = ticker['LastSellTimestamp']
                last = ticker['LastSellPrice']
        if not timestamp:
            timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': ticker['DailyBestBuyPrice'],
            'low': ticker['DailyBestSellPrice'],
            'bid': ticker['BestBid'],
            'ask': ticker['BestAsk'],
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': last,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': ticker['DailyTradedTotalVolume'],
            'info': ticker,
        }

    def fetch_tickers (self):
        self.loadMarkets ()
        tickers = self.publicGetTicker ()
        tickers = self.index_by (tickers, 'Symbol')
        ids = list (tickers.keys ())
        result = {}
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        tickers = self.publicGetTickerFilter ({
            'filter': p['id'],
        })
        tickers = self.index_by (tickers, 'Symbol')
        ticker = tickers[p['id']]
        return self.parse_ticker (ticker, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        # no method for trades?
        return self.privateGetTrade ()

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        return self.tapiPostTrade (self.extend ({
            'pair': self.market_id (market),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.privateDeleteTrade (self.extend ({
            'Type': 'Cancel',
            'Id': id,
        }, params))

    def nonce (self):
        return self.milliseconds ()

    def request (self, path, api = 'api', method = 'GET', params = {}, headers = None, body = None):
        if not self.apiKey:
            raise AuthenticationError (self.id + ' requires apiKey for all requests, their public API is always busy')
        if not self.uid:
            raise AuthenticationError (self.id + ' requires uid property for authentication and trading')
        url = self.urls['api'] + '/' + self.version
        if api == 'public':
            url += '/' + api
        url += '/' + self.implode_params (path, params)
        query = self.omit (params, self.extract_params (path))
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            headers = { 'Accept-Encoding': 'gzip, deflate' }
            nonce = str (self.nonce ())
            if method == 'POST':
                if query:
                    headers['Content-Type'] = 'application/json'
                    body = self.json (query)
                else:
                    url += '?' + _urlencode.urlencode (query)                
            auth = nonce + self.uid + self.apiKey + method + url
            if body:
                auth += body
            signature = self.hmac (self.encode (auth), self.encode (self.secret), hashlib.sha256, 'base64')
            credentials = self.uid + ':' + self.apiKey + ':' + nonce + ':' + self.binary_to_string (signature)
            headers['Authorization'] = 'HMAC ' + credentials
        return self.fetch (url, method, headers, body)

#------------------------------------------------------------------------------

class yobit (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'yobit',
            'name': 'YoBit',
            'countries': 'RU',
            'rateLimit': 2000, # responses are cached every 2 seconds
            'version': '3',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg',
                'api': 'https://yobit.net',
                'www': 'https://www.yobit.net',
                'doc': 'https://www.yobit.net/en/api/',
            },
            'api': {
                'api': {
                    'get': [
                        'depth/{pairs}',
                        'info',
                        'ticker/{pairs}',
                        'trades/{pairs}',
                    ],
                },
                'tapi': {
                    'post': [
                        'ActiveOrders',
                        'CancelOrder',
                        'GetDepositAddress',
                        'getInfo',
                        'OrderInfo',
                        'Trade',
                        'TradeHistory',
                        'WithdrawCoinsToAddress',
                    ],
                },
            },
        }
        params.update (config)
        super (yobit, self).__init__ (params)

    def fetch_markets (self):
        markets = self.apiGetInfo ()
        keys = list (markets['pairs'].keys ())
        result = []
        for p in range (0, len (keys)):
            id = keys[p]
            market = markets['pairs'][id]
            symbol = id.upper ().replace ('_', '/')
            base, quote = symbol.split ('/')
            base = self.commonCurrencyCode (base)
            quote = self.commonCurrencyCode (quote)
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.tapiPostGetInfo ()
        balances = response['return']
        result = { 'info': balances }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if 'funds' in balances:
                if lowercase in balances['funds']:
                    account['free'] = balances['funds'][lowercase]
            if 'funds_incl_orders' in balances:
                if lowercase in balances['funds_incl_orders']:
                    account['total'] = balances['funds_incl_orders'][lowercase]
            if account['total'] and account['free']:
                account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        response = self.apiGetDepthPairs (self.extend ({
            'pairs': p['id'],
        }, params))
        orderbook = response[p['id']]
        timestamp = self.milliseconds ()
        bids = orderbook['bids'] if ('bids' in list (orderbook.keys ())) else []
        asks = orderbook['asks'] if ('asks' in list (orderbook.keys ())) else []
        result = {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        tickers = self.apiGetTickerPairs ({
            'pairs': p['id'],
        })
        ticker = tickers[p['id']]
        timestamp = ticker['updated'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': float (ticker['avg']),
            'baseVolume': float (ticker['vol_cur']),
            'quoteVolume': float (ticker['vol']),
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.apiGetTradesPairs ({
            'pairs': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        return self.tapiPostTrade (self.extend ({
            'pair': self.market_id (market),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.tapiPostCancelOrder (self.extend ({
            'order_id': id,
        }, params))

    def request (self, path, api = 'api', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + api
        if api == 'api':
            url += '/' + self.version + '/' + self.implode_params (path, params)
            query = self.omit (params, self.extract_params (path))
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = self.nonce ()
            query = self.extend ({ 'method': path, 'nonce': nonce }, params)
            body = _urlencode.urlencode (query)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'key': self.apiKey,
                'sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class yunbi (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'yunbi',
            'name': 'YUNBI',
            'countries': 'CN',
            'rateLimit': 1000,
            'version': 'v2',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28570548-4d646c40-7147-11e7-9cf6-839b93e6d622.jpg',
                'api': 'https://yunbi.com',
                'www': 'https://yunbi.com',
                'doc': [
                    'https://yunbi.com/documents/api/guide',
                    'https://yunbi.com/swagger/',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'tickers',
                        'tickers/{market}',
                        'markets',
                        'order_book',
                        'k',
                        'depth',
                        'trades',
                        'k_with_pending_trades',
                        'timestamp',
                        'addresses/{address}',
                        'partners/orders/{id}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'deposits',
                        'members/me',
                        'deposit',
                        'deposit_address',
                        'order',
                        'orders',
                        'trades/my',
                    ],
                    'post': [
                        'order/delete',
                        'orders',
                        'orders/multi',
                        'orders/clear',
                    ],
                },
            },
        }
        params.update (config)
        super (yunbi, self).__init__ (params)

    def fetch_markets (self):
        markets = self.publicGetMarkets ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['id']
            symbol = market['name']
            base, quote = symbol.split ('/')
            base = self.commonCurrencyCode (base)
            quote = self.commonCurrencyCode (quote)
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.privateGetMembersMe ()
        balances = response['accounts']
        result = { 'info': balances }
        for b in range (0, len (balances)):
            balance = balances[b]
            currency = balance['currency']
            uppercase = currency.upper ()
            account = {
                'free': float (balance['balance']),
                'used': float (balance['locked']),
                'total': None,
            }
            account['total'] = self.sum (account['free'], account['used'])
            result[uppercase] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        p = self.market (market)
        orderbook = self.publicGetDepth (self.extend ({
            'market': p['id'],
            'limit': 300,
        }, params))
        timestamp = orderbook['timestamp'] * 1000
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        sides = [ 'bids', 'asks' ]
        for s in range (0, len (sides)):
            side = sides[s]
            orders = orderbook[side]
            for i in range (0, len (orders)):
                order = orders[i]
                price = float (order[0])
                amount = float (order[1])
                result[side].append ([ price, amount ])
        result['bids'] = self.sort_by (result['bids'], 0, True)
        result['asks'] = self.sort_by (result['asks'], 0)
        return result

    def parse_ticker (self, ticker, market):
        timestamp = ticker['at'] * 1000
        ticker = ticker['ticker']
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': float (ticker['high']),
            'low': float (ticker['low']),
            'bid': float (ticker['buy']),
            'ask': float (ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float (ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float (ticker['vol']),
            'info': ticker,
        }        

    def fetch_tickers (self):
        self.loadMarkets ()
        tickers = self.publicGetTickers ()
        ids = list (tickers.keys ())
        result = {}
        for i in range (0, len (ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker (ticker, market)
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        p = self.market (market)
        response = self.publicGetTickersMarket ({
            'market': p['id'],
        })
        return self.parse_ticker (response, p)

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.publicGetTrades ({
            'pair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        order = {
            'market': self.market_id (market),
            'side': side,
            'volume': str (amount),
            'ord_type': type,
        }
        if type == 'limit':
            order['price'] = str (price)
        return self.privatePostOrders (self.extend (order, params))

    def cancel_order (self, id):
        self.loadMarkets ()
        return self.privatePostOrderDelete ({ 'id': id })

    def request (self, path, api = 'public', method = 'GET', params = {}, headers = None, body = None):
        request = '/api/' + self.version + '/' + self.implode_params (path, params) + '.json'
        query = self.omit (params, self.extract_params (path))
        url = self.urls['api'] + request
        if api == 'public':
            if query:
                url += '?' + _urlencode.urlencode (query)
        else:
            nonce = str (self.nonce ())
            query = _urlencode.urlencode (self.keysort (self.extend ({
                'access_key': self.apiKey,
                'tonce': nonce,
            }, params)))
            auth = method + '|' + request + '|' + query
            signature = self.hmac (self.encode (auth), self.encode (self.secret))
            suffix = query + '&signature=' + signature
            if method == 'GET':
                url += '?' + suffix
            else:
                body = suffix
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': len (body),
                }
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            raise ExchangeError (self.id + ' ' + self.json (response))
        return response

#------------------------------------------------------------------------------

class zaif (Exchange):

    def __init__ (self, config = {}):
        params = {
            'id': 'zaif',
            'name': 'Zaif',
            'countries': 'JP',
            'rateLimit': 2000,
            'version': '1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg',
                'api': 'https://api.zaif.jp',
                'www': 'https://zaif.jp',
                'doc': [
                    'http://techbureau-api-document.readthedocs.io/ja/latest/index.html',
                    'https://corp.zaif.jp/api-docs',
                    'https://corp.zaif.jp/api-docs/api_links',
                    'https://www.npmjs.com/package/zaif.jp',
                    'https://github.com/you21979/node-zaif',
                ],
            },
            'api': {
                'api': {
                    'get': [
                        'depth/{pair}',
                        'currencies/{pair}',
                        'currencies/all',
                        'currency_pairs/{pair}',
                        'currency_pairs/all',
                        'last_price/{pair}',
                        'ticker/{pair}',
                        'trades/{pair}',
                    ],
                },
                'tapi': {
                    'post': [
                        'active_orders',
                        'cancel_order',
                        'deposit_history',
                        'get_id_info',
                        'get_info',
                        'get_info2',
                        'get_personal_info',
                        'trade',
                        'trade_history',
                        'withdraw',
                        'withdraw_history',
                    ],
                },
                'ecapi': {
                    'post': [
                        'createInvoice',
                        'getInvoice',
                        'getInvoiceIdsByOrderNumber',
                        'cancelInvoice',
                    ],
                },
            },
        }
        params.update (config)
        super (zaif, self).__init__ (params)

    def fetch_markets (self):
        markets = self.apiGetCurrencyPairsAll ()
        result = []
        for p in range (0, len (markets)):
            market = markets[p]
            id = market['currency_pair']
            symbol = market['name']
            base, quote = symbol.split ('/')
            result.append ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance (self):
        self.loadMarkets ()
        response = self.tapiPostGetInfo ()
        balances = response['return']
        result = { 'info': balances }
        for c in range (0, len (self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower ()
            account = {
                'free': None,
                'used': None,
                'total': None,
            }
            if 'funds' in balances:
                if lowercase in balances['funds']:
                    account['free'] = balances['funds'][lowercase]
            if 'funds_incl_orders' in balances:
                if lowercase in balances['funds_incl_orders']:
                    account['total'] = balances['funds_incl_orders'][lowercase]
            if account['total'] and account['free']:
                account['used'] = account['total'] - account['free']
            result[currency] = account
        return result

    def fetch_order_book (self, market, params = {}):
        self.loadMarkets ()
        orderbook = self.apiGetDepthPair  (self.extend ({
            'pair': self.market_id (market),
        }, params))
        timestamp = self.milliseconds ()
        result = {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
        }
        return result

    def fetch_ticker (self, market):
        self.loadMarkets ()
        ticker = self.apiGetTickerPair ({
            'pair': self.market_id (market),
        })
        timestamp = self.milliseconds ()
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601 (timestamp),
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['bid'],
            'ask': ticker['ask'],
            'vwap': ticker['vwap'],
            'open': None,
            'close': None,
            'first': None,
            'last': ticker['last'],
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': ticker['volume'],
            'info': ticker,
        }

    def fetch_trades (self, market):
        self.loadMarkets ()
        return self.apiGetTradesPair ({
            'pair': self.market_id (market),
        })

    def create_order (self, market, type, side, amount, price = None, params = {}):
        self.loadMarkets ()
        if type == 'market':
            raise ExchangeError (self.id + ' allows limit orders only')
        return self.tapiPostTrade (self.extend ({
            'currency_pair': self.market_id (market),
            'action': 'bid' if (side == 'buy') else 'ask',
            'amount': amount,
            'price': price,
        }, params))

    def cancel_order (self, id, params = {}):
        self.loadMarkets ()
        return self.tapiPostCancelOrder (self.extend ({
            'order_id': id,
        }, params))

    def request (self, path, api = 'api', method = 'GET', params = {}, headers = None, body = None):
        url = self.urls['api'] + '/' + api
        if api == 'api':
            url += '/' + self.version + '/' + self.implode_params (path, params)
        else:
            nonce = self.nonce ()
            body = _urlencode.urlencode (self.extend ({
                'method': path,
                'nonce': nonce,
            }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len (body),
                'Key': self.apiKey,
                'Sign': self.hmac (self.encode (body), self.encode (self.secret), hashlib.sha512),
            }
        response = self.fetch (url, method, headers, body)
        if 'error' in response:
            raise ExchangeError (self.id + ' ' + response['error'])
        if 'success' in response:
            if not response['success']:
                raise ExchangeError (self.id + ' ' + self.json (response))
        return response
