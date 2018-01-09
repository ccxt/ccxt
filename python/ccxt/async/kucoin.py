# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import base64
import hashlib
import math
import json
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import InvalidNonce
from ccxt.base.errors import InvalidOrder


class kucoin (Exchange):

    def describe(self):
        return self.deep_extend(super(kucoin, self).describe(), {
            'id': 'kucoin',
            'name': 'Kucoin',
            'countries': 'HK',  # Hong Kong
            'version': 'v1',
            'rateLimit': 2000,
            'hasCORS': False,
            'userAgent': self.userAgents['chrome'],
            # obsolete metainfo interface
            'hasFetchTickers': True,
            'hasFetchOHLCV': True,
            'hasFetchOrder': True,
            'hasFetchOrders': True,
            'hasFetchClosedOrders': True,
            'hasFetchOpenOrders': True,
            'hasFetchMyTrades': False,
            'hasFetchCurrencies': True,
            'hasWithdraw': True,
            # new metainfo interface
            'has': {
                'fetchTickers': True,
                'fetchOHLCV': True,  # see the method implementation below
                'fetchOrder': True,
                'fetchOrders': True,
                'fetchClosedOrders': True,
                'fetchOpenOrders': True,
                'fetchMyTrades': False,
                'fetchCurrencies': True,
                'withdraw': True,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '8h': '480',
                '1d': 'D',
                '1w': 'W',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/33795655-b3c46e48-dcf6-11e7-8abe-dc4588ba7901.jpg',
                'api': 'https://api.kucoin.com',
                'www': 'https://kucoin.com',
                'doc': 'https://kucoinapidocs.docs.apiary.io',
                'fees': 'https://news.kucoin.com/en/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'open/chart/config',
                        'open/chart/history',
                        'open/chart/symbol',
                        'open/currencies',
                        'open/deal-orders',
                        'open/kline',
                        'open/lang-list',
                        'open/orders',
                        'open/orders-buy',
                        'open/orders-sell',
                        'open/tick',
                        'market/open/coin-info',
                        'market/open/coins',
                        'market/open/coins-trending',
                        'market/open/symbols',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'account/{coin}/wallet/address',
                        'account/{coin}/wallet/records',
                        'account/{coin}/balance',
                        'account/promotion/info',
                        'account/promotion/sum',
                        'deal-orders',
                        'order/active',
                        'order/active-map',
                        'order/dealt',
                        'referrer/descendant/count',
                        'user/info',
                    ],
                    'post': [
                        'account/{coin}/withdraw/apply',
                        'account/{coin}/withdraw/cancel',
                        'cancel-order',
                        'order',
                        'user/change-lang',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0010,
                    'taker': 0.0010,
                },
                'funding': {
                    'tierBased': False,
                    'percentage': False,
                    'withdraw': {
                        'KCS': 2.0,
                        'BTC': 0.0005,
                        'USDT': 10.0,
                        'ETH': 0.01,
                        'LTC': 0.001,
                        'NEO': 0.0,
                        'GAS': 0.0,
                        'KNC': 0.5,
                        'BTM': 5.0,
                        'QTUM': 0.1,
                        'EOS': 0.5,
                        'CVC': 3.0,
                        'OMG': 0.1,
                        'PAY': 0.5,
                        'SNT': 20.0,
                        'BHC': 1.0,
                        'HSR': 0.01,
                        'WTC': 0.1,
                        'VEN': 2.0,
                        'MTH': 10.0,
                        'RPX': 1.0,
                        'REQ': 20.0,
                        'EVX': 0.5,
                        'MOD': 0.5,
                        'NEBL': 0.1,
                        'DGB': 0.5,
                        'CAG': 2.0,
                        'CFD': 0.5,
                        'RDN': 0.5,
                        'UKG': 5.0,
                        'BCPT': 5.0,
                        'PPT': 0.1,
                        'BCH': 0.0005,
                        'STX': 2.0,
                        'NULS': 1.0,
                        'GVT': 0.1,
                        'HST': 2.0,
                        'PURA': 0.5,
                        'SUB': 2.0,
                        'QSP': 5.0,
                        'POWR': 1.0,
                        'FLIXX': 10.0,
                        'LEND': 20.0,
                        'AMB': 3.0,
                        'RHOC': 2.0,
                        'R': 2.0,
                        'DENT': 50.0,
                        'DRGN': 1.0,
                        'ACT': 0.1,
                    },
                    'deposit': 0.00,
                },
            },
        })

    async def fetch_markets(self):
        response = await self.publicGetMarketOpenSymbols()
        markets = response['data']
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = market['symbol']
            base = market['coinType']
            quote = market['coinTypePair']
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            precision = {
                'amount': 8,
                'price': 8,
            }
            active = market['trading']
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'info': market,
                'lot': math.pow(10, -precision['amount']),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': math.pow(10, -precision['amount']),
                        'max': None,
                    },
                    'price': {
                        'min': None,
                        'max': None,
                    },
                },
            }))
        return result

    async def fetch_currencies(self, params={}):
        response = await self.publicGetMarketOpenCoins(params)
        currencies = response['data']
        result = {}
        for i in range(0, len(currencies)):
            currency = currencies[i]
            id = currency['coin']
            # todo: will need to rethink the fees
            # to add support for multiple withdrawal/deposit methods and
            # differentiated fees for each particular method
            code = self.common_currency_code(id)
            precision = currency['tradePrecision']
            deposit = currency['enableDeposit']
            withdraw = currency['enableWithdraw']
            active = (deposit and withdraw)
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'status': 'ok',
                'fee': currency['withdrawFeeRate'],  # todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': math.pow(10, -precision),
                        'max': math.pow(10, precision),
                    },
                    'price': {
                        'min': math.pow(10, -precision),
                        'max': math.pow(10, precision),
                    },
                    'cost': {
                        'min': None,
                        'max': None,
                    },
                    'withdraw': {
                        'min': currency['withdrawMinAmount'],
                        'max': math.pow(10, precision),
                    },
                },
            }
        return result

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privateGetAccountBalance(self.extend({
            'limit': 20,  # default 12, max 20
            'page': 1,
        }, params))
        balances = response['data']
        result = {'info': balances}
        indexed = self.index_by(balances, 'coinType')
        keys = list(indexed.keys())
        for i in range(0, len(keys)):
            id = keys[i]
            currency = self.common_currency_code(id)
            account = self.account()
            balance = indexed[id]
            used = float(balance['freezeBalance'])
            free = float(balance['balance'])
            total = self.sum(free, used)
            account['free'] = free
            account['used'] = used
            account['total'] = total
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetOpenOrders(self.extend({
            'symbol': market['id'],
        }, params))
        orderbook = response['data']
        return self.parse_order_book(orderbook, None, 'BUY', 'SELL')

    def parse_order(self, order, market=None):
        symbol = None
        if market:
            symbol = market['symbol']
        else:
            symbol = order['coinType'] + '/' + order['coinTypePair']
        timestamp = order['createdAt']
        price = order['price']
        filled = order['dealAmount']
        remaining = order['pendingAmount']
        amount = self.sum(filled, remaining)
        side = order['direction'].lower()
        result = {
            'info': order,
            'id': self.safe_string(order, 'oid'),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * filled,
            'filled': filled,
            'remaining': remaining,
            'status': None,
            'fee': self.safe_float(order, 'fee'),
        }
        return result

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOpenOrders requires a symbol param')
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
        }
        response = await self.privateGetOrderActiveMap(self.extend(request, params))
        orders = self.array_concat(response['data']['SELL'], response['data']['BUY'])
        return self.parse_orders(orders, market, since, limit)

    async def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        request = {}
        await self.load_markets()
        market = None
        if symbol:
            market = self.market(symbol)
            request['symbol'] = market['id']
        if since:
            request['since'] = since
        if limit:
            request['limit'] = limit
        response = await self.privateGetOrderDealt(self.extend(request, params))
        return self.parse_orders(response['data']['datas'], market, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        if type != 'limit':
            raise ExchangeError(self.id + ' allows limit orders only')
        await self.load_markets()
        market = self.market(symbol)
        base = market['base']
        order = {
            'symbol': market['id'],
            'type': side.upper(),
            'price': self.price_to_precision(symbol, price),
            'amount': self.truncate(amount, self.currencies[base]['precision']),
        }
        response = await self.privatePostOrder(self.extend(order, params))
        return {
            'info': response,
            'id': self.safe_string(response['data'], 'orderOid'),
        }

    async def cancel_order(self, id, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' cancelOrder requires symbol argument')
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
            'orderOid': id,
        }
        if 'type' in params:
            request['type'] = params['type'].upper()
        else:
            raise ExchangeError(self.id + ' cancelOrder requires type(BUY or SELL) param')
        response = await self.privatePostCancelOrder(self.extend(request, params))
        return response

    def parse_ticker(self, ticker, market=None):
        timestamp = ticker['datetime']
        symbol = None
        if market:
            symbol = market['symbol']
        else:
            symbol = ticker['coinType'] + '/' + ticker['coinTypePair']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'high'),
            'low': self.safe_float(ticker, 'low'),
            'bid': self.safe_float(ticker, 'buy'),
            'ask': self.safe_float(ticker, 'sell'),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': self.safe_float(ticker, 'lastDealPrice'),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': self.safe_float(ticker, 'vol'),
            'quoteVolume': self.safe_float(ticker, 'volValue'),
            'info': ticker,
        }

    async def fetch_tickers(self, symbols=None, params={}):
        response = await self.publicGetMarketOpenSymbols(params)
        tickers = response['data']
        result = {}
        for t in range(0, len(tickers)):
            ticker = self.parse_ticker(tickers[t])
            symbol = ticker['symbol']
            result[symbol] = ticker
        return result

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetOpenTick(self.extend({
            'symbol': market['id'],
        }, params))
        ticker = response['data']
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market=None):
        timestamp = trade[0]
        side = None
        if trade[1] == 'BUY':
            side = 'buy'
        elif trade[1] == 'SELL':
            side = 'sell'
        return {
            'id': None,
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': trade[2],
            'amount': trade[3],
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetOpenDealOrders(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_trades(response['data'], market, since, limit)

    def parse_trading_view_ohlcvs(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        result = []
        for i in range(0, len(ohlcvs['t'])):
            result.append([
                ohlcvs['t'][i],
                ohlcvs['o'][i],
                ohlcvs['h'][i],
                ohlcvs['l'][i],
                ohlcvs['c'][i],
                ohlcvs['v'][i],
            ])
        return self.parse_ohlcvs(result, market, timeframe, since, limit)

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        end = self.seconds()
        resolution = self.timeframes[timeframe]
        # convert 'resolution' to minutes in order to calculate 'from' later
        minutes = resolution
        if minutes == 'D':
            if not limit:
                limit = 30  # 30 days, 1 month
            minutes = 1440
        elif minutes == 'W':
            if not limit:
                limit = 52  # 52 weeks, 1 year
            minutes = 10080
        elif not limit:
            limit = 1440
            minutes = 1440
        start = end - minutes * 60 * limit
        if since:
            start = int(since / 1000)
            end = self.sum(start, minutes * 60 * limit)
        request = {
            'symbol': market['id'],
            'type': self.timeframes[timeframe],
            'resolution': resolution,
            'from': start,
            'to': end,
        }
        response = await self.publicGetOpenChartHistory(self.extend(request, params))
        return self.parse_trading_view_ohlcvs(response, market, timeframe, since, limit)

    async def withdraw(self, code, amount, address, params={}):
        await self.load_markets()
        currency = self.currency(code)
        response = await self.privatePostAccountWithdrawApply(self.extend({
            'coin': currency['id'],
            'amount': amount,
            'address': address,
        }, params))
        return {
            'info': response,
            'id': None,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        endpoint = '/' + self.version + '/' + self.implode_params(path, params)
        url = self.urls['api'] + endpoint
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
            # their nonce is always a calibrated synched milliseconds-timestamp
            nonce = self.milliseconds()
            queryString = ''
            nonce = str(nonce)
            if query:
                queryString = self.rawencode(self.keysort(query))
                url += '?' + queryString
                if method != 'GET':
                    body = queryString
            auth = endpoint + '/' + nonce + '/' + queryString
            payload = base64.b64encode(self.encode(auth))
            # payload should be "encoded" as returned from stringToBase64
            signature = self.hmac(payload, self.encode(self.secret), hashlib.sha256)
            headers = {
                'KC-API-KEY': self.apiKey,
                'KC-API-NONCE': nonce,
                'KC-API-SIGNATURE': signature,
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def throw_exception_or_error_code(self, response):
        if 'success' in response:
            if not response['success']:
                if 'code' in response:
                    message = self.safe_string(response, 'msg')
                    if response['code'] == 'UNAUTH':
                        if message == 'Invalid nonce':
                            raise InvalidNonce(self.id + ' ' + message)
                        raise AuthenticationError(self.id + ' ' + self.json(response))
                    elif response['code'] == 'ERROR':
                        if message.find('precision of amount') >= 0:
                            raise InvalidOrder(self.id + ' ' + message)
                raise ExchangeError(self.id + ' ' + self.json(response))

    def handle_errors(self, code, reason, url, method, headers, body):
        if body and(body[0] == "{"):
            response = json.loads(body)
            self.throw_exception_or_error_code(response)
        if code >= 400:
            raise ExchangeError(self.id + ' ' + str(code) + ' ' + reason)

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        self.throw_exception_or_error_code(response)
        return response
