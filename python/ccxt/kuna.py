# -*- coding: utf-8 -*-

from ccxt.acx import acx
import json
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import OrderNotFound


class kuna (acx):

    def describe(self):
        return self.deep_extend(super(kuna, self).describe(), {
            'id': 'kuna',
            'name': 'Kuna',
            'countries': 'UA',
            'rateLimit': 1000,
            'version': 'v2',
            'hasCORS': False,
            'hasFetchTickers': False,
            'hasFetchOHLCV': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg',
                'api': 'https://kuna.io',
                'www': 'https://kuna.io',
                'doc': 'https://kuna.io/documents/api',
            },
            'api': {
                'public': {
                    'get': [
                        'tickers/{market}',
                        'order_book',
                        'order_book/{market}',
                        'trades',
                        'trades/{market}',
                        'timestamp',
                    ],
                },
                'private': {
                    'get': [
                        'members/me',
                        'orders',
                        'trades/my',
                    ],
                    'post': [
                        'orders',
                        'order/delete',
                    ],
                },
            },
            'markets': {
                'BTC/UAH': {'id': 'btcuah', 'symbol': 'BTC/UAH', 'base': 'BTC', 'quote': 'UAH', 'precision': {'amount': 6, 'price': 0}, 'lot': 0.000001, 'limits': {'amount': {'min': 0.000001, 'max': None}, 'price': {'min': 1, 'max': None}}},
                'ETH/UAH': {'id': 'ethuah', 'symbol': 'ETH/UAH', 'base': 'ETH', 'quote': 'UAH', 'precision': {'amount': 6, 'price': 0}, 'lot': 0.000001, 'limits': {'amount': {'min': 0.000001, 'max': None}, 'price': {'min': 1, 'max': None}}},
                'GBG/UAH': {'id': 'gbguah', 'symbol': 'GBG/UAH', 'base': 'GBG', 'quote': 'UAH', 'precision': {'amount': 3, 'price': 2}, 'lot': 0.001, 'limits': {'amount': {'min': 0.000001, 'max': None}, 'price': {'min': 0.01, 'max': None}}},  # Golos Gold(GBG != GOLOS)
                'KUN/BTC': {'id': 'kunbtc', 'symbol': 'KUN/BTC', 'base': 'KUN', 'quote': 'BTC', 'precision': {'amount': 6, 'price': 6}, 'lot': 0.000001, 'limits': {'amount': {'min': 0.000001, 'max': None}, 'price': {'min': 0.000001, 'max': None}}},
                'BCH/BTC': {'id': 'bchbtc', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'precision': {'amount': 6, 'price': 6}, 'lot': 0.000001, 'limits': {'amount': {'min': 0.000001, 'max': None}, 'price': {'min': 0.000001, 'max': None}}},
                'WAVES/UAH': {'id': 'wavesuah', 'symbol': 'WAVES/UAH', 'base': 'WAVES', 'quote': 'UAH', 'precision': {'amount': 6, 'price': 0}, 'lot': 0.000001, 'limits': {'amount': {'min': 0.000001, 'max': None}, 'price': {'min': 1, 'max': None}}},
            },
            'fees': {
                'trading': {
                    'taker': 0.25 / 100,
                    'maker': 0.25 / 100,
                },
            },
        })

    def handle_errors(self, code, reason, url, method, headers, body):
        if code == 400:
            data = json.loads(body)
            error = data['error']
            errorCode = error['code']
            if errorCode == 2002:
                raise InsufficientFunds(' '.join([self.id, method, url, code, reason, body]))
            elif errorCode == 2003:
                raise OrderNotFound(' '.join([self.id, method, url, code, reason, body]))

    def fetch_order_book(self, symbol, params={}):
        market = self.market(symbol)
        orderBook = self.publicGetOrderBook(self.extend({
            'market': market['id'],
        }, params))
        return self.parse_order_book(orderBook, None, 'bids', 'asks', 'price', 'remaining_volume')

    def fetch_l3_order_book(self, symbol, params):
        return self.fetch_order_book(symbol, params)

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOpenOrders requires a symbol argument')
        market = self.market(symbol)
        orders = self.privateGetOrders(self.extend({
            'market': market['id'],
        }, params))
        # todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        # with order cache + fetchOpenOrders
        # as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return self.parse_orders(orders, market, since, limit)

    def parse_trade(self, trade, market=None):
        timestamp = self.parse8601(trade['created_at'])
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'id': trade['id'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': None,
            'side': None,
            'price': float(trade['price']),
            'amount': float(trade['volume']),
            'info': trade,
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        market = self.market(symbol)
        response = self.publicGetTrades(self.extend({
            'market': market['id'],
        }, params))
        return self.parse_trades(response, market, since, limit)

    def parse_my_trade(self, trade, market):
        timestamp = self.parse8601(trade['created_at'])
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'id': trade['id'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'price': trade['price'],
            'amount': trade['volume'],
            'cost': trade['funds'],
            'symbol': symbol,
            'side': trade['side'],
            'order': trade['order_id'],
        }

    def parse_my_trades(self, trades, market=None):
        parsedTrades = []
        for i in range(0, len(trades)):
            trade = trades[i]
            parsedTrade = self.parse_my_trade(trade, market)
            parsedTrades.append(parsedTrade)
        return parsedTrades

    def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOpenOrders requires a symbol argument')
        market = self.market(symbol)
        response = self.privateGetTradesMy({'market': market['id']})
        return self.parse_my_trades(response, market)
