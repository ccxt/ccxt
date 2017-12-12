# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError


class livecoin (Exchange):

    def describe(self):
        return self.deep_extend(super(livecoin, self).describe(), {
            'id': 'livecoin',
            'name': 'LiveCoin',
            'countries': ['US', 'UK', 'RU'],
            'rateLimit': 1000,
            'hasCORS': False,
            'hasFetchTickers': True,
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
                        'exchange/ticker',  # omit params to get all tickers at once
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
        })

    def fetch_markets(self):
        markets = self.publicGetExchangeTicker()
        restrictions = self.publicGetExchangeRestrictions()
        restrictionsById = self.index_by(restrictions['restrictions'], 'currencyPair')
        result = []
        for p in range(0, len(markets)):
            market = markets[p]
            id = market['symbol']
            symbol = id
            base, quote = symbol.split('/')
            commission = 0.18 / 100
            coinRestrictions = self.safe_value(restrictionsById, symbol)
            pricePrecision = None
            amountMin = None
            if coinRestrictions:
                pricePrecision = self.safe_integer(coinRestrictions, 'priceScale', 5)
                amountMin = self.safe_float(coinRestrictions, 'minLimitQuantity', 0.00000001)
                amountMin *= (1 + commission)
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'precision': {
                    'price': pricePrecision,
                    'amount': 8,
                    'cost': 8,
                },
                'limits': {
                    'amount': {
                        'min': amountMin,
                        'max': 1000000000,
                    },
                    'price': {
                        'min': 0.00000001,
                        'max': 1000000000,
                    },
                },
                'maker': commission,
                'taker': commission,
                'info': market,
            })
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        balances = self.privateGetPaymentBalances()
        result = {'info': balances}
        for b in range(0, len(balances)):
            balance = balances[b]
            currency = balance['currency']
            account = None
            if currency in result:
                account = result[currency]
            else:
                account = self.account()
            if balance['type'] == 'total':
                account['total'] = float(balance['value'])
            if balance['type'] == 'available':
                account['free'] = float(balance['value'])
            if balance['type'] == 'trade':
                account['used'] = float(balance['value'])
            result[currency] = account
        return self.parse_balance(result)

    def fetch_fees(self, params={}):
        self.load_markets()
        commissionInfo = self.privateGetExchangeCommissionCommonInfo()
        commission = self.safe_float(commissionInfo, 'commission')
        return {
            'info': commissionInfo,
            'maker': commission,
            'taker': commission,
            'withdraw': 0.0,
        }

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        orderbook = self.publicGetExchangeOrderBook(self.extend({
            'currencyPair': self.market_id(symbol),
            'groupByPrice': 'false',
            'depth': 100,
        }, params))
        timestamp = orderbook['timestamp']
        return self.parse_order_book(orderbook, timestamp)

    def parse_ticker(self, ticker, market=None):
        timestamp = self.milliseconds()
        symbol = None
        if market:
            symbol = market['symbol']
        vwap = float(ticker['vwap'])
        baseVolume = float(ticker['volume'])
        quoteVolume = baseVolume * vwap
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['best_bid']),
            'ask': float(ticker['best_ask']),
            'vwap': float(ticker['vwap']),
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        response = self.publicGetExchangeTicker(params)
        tickers = self.index_by(response, 'symbol')
        ids = list(tickers.keys())
        result = {}
        for i in range(0, len(ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        ticker = self.publicGetExchangeTicker(self.extend({
            'currencyPair': market['id'],
        }, params))
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market):
        timestamp = trade['time'] * 1000
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'id': str(trade['id']),
            'order': None,
            'type': None,
            'side': trade['type'].lower(),
            'price': trade['price'],
            'amount': trade['quantity'],
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetExchangeLastTrades(self.extend({
            'currencyPair': market['id'],
        }, params))
        return self.parse_trades(response, market, since, limit)

    def parse_order(self, order, market=None):
        timestamp = self.safe_integer(order, 'lastModificationTime')
        if not timestamp:
            timestamp = self.parse8601(order['lastModificationTime'])
        trades = None
        if 'trades' in order:
            # TODO currently not supported by livecoin
            # trades = self.parse_trades(order['trades'], market, since, limit)
            trades = None
        status = None
        if order['orderStatus'] == 'OPEN' or order['orderStatus'] == 'PARTIALLY_FILLED':
            status = 'open'
        elif order['orderStatus'] == 'EXECUTED' or order['orderStatus'] == 'PARTIALLY_FILLED_AND_CANCELLED':
            status = 'closed'
        else:
            status = 'canceled'
        symbol = order['currencyPair']
        base, quote = symbol.split('/')
        type = None
        side = None
        if order['type'].find('MARKET') >= 0:
            type = 'market'
        else:
            type = 'limit'
        if order['type'].find('SELL') >= 0:
            side = 'sell'
        else:
            side = 'buy'
        price = self.safe_float(order, 'price', 0.0)
        cost = self.safe_float(order, 'commissionByTrade', 0.0)
        remaining = self.safe_float(order, 'remainingQuantity', 0.0)
        amount = self.safe_float(order, 'quantity', remaining)
        filled = amount - remaining
        return {
            'info': order,
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': {
                'cost': cost,
                'currency': quote,
            },
        }

    def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        market = None
        if symbol:
            market = self.market(symbol)
        pair = market['id'] if market else None
        request = {}
        if pair:
            request['currencyPair'] = pair
        if since:
            request['issuedFrom'] = int(since)
        if limit:
            request['endRow'] = limit - 1
        response = self.privateGetExchangeClientOrders(self.extend(request, params))
        result = []
        rawOrders = []
        if response['data']:
            rawOrders = response['data']
        for i in range(0, len(rawOrders)):
            order = rawOrders[i]
            result.append(self.parse_order(order, market))
        return result

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        result = self.fetch_orders(symbol, since, limit, self.extend({
            'openClosed': 'OPEN',
        }, params))
        return result

    def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        result = self.fetch_orders(symbol, since, limit, self.extend({
            'openClosed': 'CLOSED',
        }, params))
        return result

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        method = 'privatePostExchange' + self.capitalize(side) + type
        market = self.market(symbol)
        order = {
            'quantity': amount,
            'currencyPair': market['id'],
        }
        if type == 'limit':
            order['price'] = price
        response = getattr(self, method)(self.extend(order, params))
        return {
            'info': response,
            'id': str(response['orderId']),
        }

    def cancel_order(self, id, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' cancelOrder requires a symbol argument')
        self.load_markets()
        market = self.market(symbol)
        return self.privatePostExchangeCancellimit(self.extend({
            'orderId': id,
            'currencyPair': market['id'],
        }, params))

    def fetch_deposit_address(self, currency, params={}):
        request = {
            'currency': currency,
        }
        response = self.privateGetPaymentGetAddress(self.extend(request, params))
        address = self.safe_string(response, 'wallet')
        return {
            'currency': currency,
            'address': address,
            'status': 'ok',
            'info': response,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + path
        query = self.urlencode(self.keysort(params))
        if method == 'GET':
            if params:
                url += '?' + query
        if api == 'private':
            self.check_required_credentials()
            if method == 'POST':
                body = query
            signature = self.hmac(self.encode(query), self.encode(self.secret), hashlib.sha256)
            headers = {
                'Api-Key': self.apiKey,
                'Sign': signature.upper(),
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'success' in response:
            if not response['success']:
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
