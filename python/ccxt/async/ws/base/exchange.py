# -*- coding: utf-8 -*-

"""Base websocket exchange class"""

# -----------------------------------------------------------------------------

__version__ = '1.10.63'

# -----------------------------------------------------------------------------

import asyncio
import aiohttp
import hashlib
import sys
import collections
import ujson
from copy import deepcopy
import time
import datetime

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import RequestTimeout

# -----------------------------------------------------------------------------

try:
    basestring  # Python 3
except NameError:
    basestring = str  # Python 2

# -----------------------------------------------------------------------------


class Exchange(object):
    """Base websocket exchange class"""
    id = None
    version = None

    # rate limiter settings
    enableRateLimit = False
    rateLimit = 2000  # milliseconds = seconds * 1000
    timeout = 10000   # milliseconds = seconds * 1000
    asyncio_loop = None
    aiohttp_session = None
    aiohttp_proxy = None
    userAgent = False
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
    balance = {}
    orderbooks = {}
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
    queue_request = None
    queue_response = None
    queues = {}
    channel_mapping = {}

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

    # API method metainfo
    has = {
        'deposit': False,
        'fetchBalance': True,
        'fetchClosedOrders': False,
        'fetchCurrencies': False,
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

        version = '.'.join(map(str, sys.version_info[:3]))
        self.userAgent = {
            'User-Agent': 'ccxt/' + __version__ + ' (+https://github.com/ccxt-dev/ccxt) Python/' + version
        }

        settings = self.deep_extend(self.describe(), config)

        for key in settings:
            setattr(self, key, settings[key])

        if self.markets:
            self.set_markets(self.markets)

        self.asyncio_loop = self.asyncio_loop or asyncio.get_event_loop()
        self.aiohttp_session = self.aiohttp_session or aiohttp.ClientSession(loop=self.asyncio_loop)
        self.queue_request = self.queue_request or asyncio.Queue(maxsize=1000)
        self.queue_response = self.queue_response or asyncio.Queue(maxsize=1000)
        asyncio.ensure_future(self.websocket_handler())

    def __del__(self):
        if self.aiohttp_session:
            self.aiohttp_session.close()

    def describe(self):
        return {}

    async def websocket_handler(self):
        async with self.aiohttp_session.ws_connect(self.urls['ws']) as ws:
            while 1:
                if self.queue_request.qsize() > 0:
                    request_packet = await self.queue_request.get()
                    await ws.send_json(request_packet)
                    print('sending packet {0}'.format(request_packet))
                    self.queue_request.task_done()

                response = await ws.receive()
                await self.event_handler(response)

    async def event_handler(self, response):
        """ Handles the incoming responses"""
        data = ujson.loads(response.data)
        if isinstance(data, dict):
            if data['event'] == 'subscribed':
                print('Subscribed to channel: {0}, for pair: {1}, on channel ID: {2}'.format(data['channel'], data['pair'], data['chanId']))
                self.channel_mapping[data['chanId']] = (data['channel'], data['pair'])
            elif data['event'] == 'info':
                print('Exchange: {0} Websocket version: {1}'.format(self.id, data['version']))
        elif isinstance(data, list):
            if isinstance(data[1], str):
                print('Heartbeat on channel {0}'.format(data[0]))
            else:
                # Published data, time stamp and send to appropriate queue
                timestamp = self.microseconds() / 1000
                datetime = self.iso8601(timestamp)
                if self.channel_mapping[data[0]][0] == 'book':
                    pair_id = self.channel_mapping[data[0]][1]
                    await self.queues['orderbooks'][pair_id].put((data, timestamp, datetime))

    async def subscribe_order_book(self, symbol, status_queue=None):
        """ Subscribes for order books updates, and fetches updates """
        if self.verbose:
            print('Subscribing to order book for pair: {0}'.format(symbol))
        pair_id = self.market_id(symbol)
        request_packet = deepcopy(self.api['public']['request']['order_book'])
        request_packet.update({'pair': pair_id})

        if not 'orderbooks' in self.queues:
            self.queues['orderbooks'] = {}
        if not pair_id in self.queues['orderbooks']:
            self.queues['orderbooks'][pair_id] = asyncio.Queue(maxsize=1000)

        # Subscribe to the order book
        await self.queue_request.put(request_packet)
        asyncio.ensure_future(self.build_order_book(symbol, status_queue))

    async def build_order_book(self, symbol, status_queue):
        pair_id = self.market_id(symbol)
        while 1:
            (data, timestamp, datetime) = await self.queues['orderbooks'][pair_id].get()
            if not symbol in self.orderbooks:
                self.orderbooks[symbol] = {}

            if isinstance(data[1], list):
                data = data[1]
                # Price, Count, Amount
                bids = {
                    str(level[0]): [str(level[1]), str(level[2])]
                    for level in data if level[2] > 0
                }
                asks = {
                    str(level[0]): [str(level[1]), str(abs(level[2]))]
                    for level in data if level[2] < 0
                }
                self.orderbooks[symbol].update({'bids': bids})
                self.orderbooks[symbol].update({'asks': asks})
                self.orderbooks[symbol].update({'timestamp': timestamp})
                self.orderbooks[symbol].update({'datetime': datetime})

            else:
                # Example update message structure [1765.2, 0, 1] where we have [price, count, amount].
                # Update algorithm pseudocode from Bitfinex documentation:
                # 1. - When count > 0 then you have to add or update the price level.
                #   1.1- If amount > 0 then add/update bids.
                #   1.2- If amount < 0 then add/update asks.
                # 2. - When count = 0 then you have to delete the price level.
                #   2.1- If amount = 1 then remove from bids
                #   2.2- If amount = -1 then remove from asks
                data = data[1:]
                data = [str(data[0]), str(data[1]), str(data[2])]
                if int(data[1]) > 0:  # 1.

                    if float(data[2]) > 0:  # 1.1
                        self.orderbooks[symbol]['bids'].update({data[0]: [data[1], data[2]]})

                    elif float(data[2]) < 0:  # 1.2
                        self.orderbooks[symbol]['asks'].update({data[0]: [data[1], str(abs(float(data[2])))]})

                elif data[1] == '0':  # 2.

                    if data[2] == '1':  # 2.1
                        if self.orderbooks[symbol]['bids'].get(data[0]):
                            del self.orderbooks[symbol]['bids'][data[0]]

                    elif data[2] == '-1':  # 2.2
                        if self.orderbooks[symbol]['asks'].get(data[0]):
                            del self.orderbooks[symbol]['asks'][data[0]]
            self.queues['orderbooks'][pair_id].task_done()
            if status_queue:
                await status_queue.put({
                    'timestamp': timestamp,
                    'datetime': datetime,
                    'exchange': self.id,
                    'stream': 'orderbooks',
                    'symbol': symbol,
                })

    def order_book(self, symbol):
        if symbol in list(self.orderbooks):
            orderbook = self.orderbooks[symbol]
            asks = [[float(price), float(stats[0]) * float(stats[1])] for price, stats in orderbook['asks'].items()]
            bids = [[float(price), float(stats[0]) * float(stats[1])] for price, stats in orderbook['bids'].items()]
            return {'asks': asks,
                    'bids': bids,
                    'timestamp': orderbook['timestamp'],
                    'datetime': orderbook['datetime']}

    @staticmethod
    def decimal(number):
        return str(decimal.Decimal(str(number)))

    @staticmethod
    def safe_float(dictionary, key, default_value=None):
        return float(dictionary[key]) if (key in dictionary) and dictionary[key] else default_value

    @staticmethod
    def safe_string(dictionary, key, default_value=None):
        return str(dictionary[key]) if (key in dictionary) and dictionary[key] else default_value

    @staticmethod
    def safe_integer(dictionary, key, default_value=None):
        return int(dictionary[key]) if (key in dictionary) and dictionary[key] else default_value

    @staticmethod
    def safe_value(dictionary, key, default_value=None):
        return dictionary[key] if (key in dictionary) and dictionary[key] else default_value

    @staticmethod
    def truncate(num, precision=0):
        decimal_precision = math.pow(10, precision)
        return math.trunc(num * decimal_precision) / decimal_precision

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

    def set_markets(self, markets):
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
        base = self.pluck([market for market in values if 'base' in market], 'base')
        quote = self.pluck([market for market in values if 'quote' in market], 'quote')
        self.currencies = sorted(self.unique(base + quote))
        return self.markets

    def load_markets(self, reload=False):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets(self.markets)
                return self.markets
        markets = self.fetch_markets()
        return self.set_markets(markets)

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
        array = self.to_array(ohlcvs)
        return [self.parse_ohlcv(ohlcv, market, timeframe, since, limit) for ohlcv in array]

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
            'bids': self.parse_bids_asks(orderbook[bids_key], price_key, amount_key) if bids_key in orderbook else [],
            'asks': self.parse_bids_asks(orderbook[asks_key], price_key, amount_key) if asks_key in orderbook else [],
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

    def parse_trades(self, trades, market=None):
        array = self.to_array(trades)
        return [self.parse_trade(trade, market) for trade in array]

    def parse_orders(self, orders, market=None):
        return [self.parse_order(order, market) for order in orders]

    def filter_orders_by_symbol(self, orders, symbol=None):
        if symbol:
            grouped = self.group_by(orders, 'symbol')
            if symbol in grouped:
                return grouped[symbol]
            return []
        return orders

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

    def calculate_fee_rate(self, symbol, type, side, amount, price, fee='taker', params={}):
        return {
            'base': 0.0,
            'quote': self.markets[symbol][fee],
        }

    def calculate_fee(self, symbol, type, side, amount, price, fee='taker', params={}):
        rate = self.calculateFeeRate(symbol, type, side, amount, price, fee, params)
        return {
            'rate': rate,
            'cost': {
                'base': amount * rate['base'],
                'quote': amount * price * rate['quote'],
            },
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
