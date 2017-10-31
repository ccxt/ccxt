# -*- coding: utf-8 -*-

from ccxt import acx
import json


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
                    'taker': 0.2 / 100,
                    'maker': 0.2 / 100,
                },
            },
        })

    def handle_errors(self, code, reason, url, method, headers, body):
        if code == 400:
            data = json.loads(body)
            error = data['error']
            errorMessage = error['message']
            if errorMessage.includes('cannot lock funds'):
                raise InsufficientFunds(' '.join([self.id, method, url, code, reason, body]))

    def fetch_order_book(self, symbol, params={}):
        market = self.market(symbol)
        orderBook = self.publicGetOrderBook(self.extend({
            'market': market['id'],
        }, params))
        return self.parse_order_book(orderBook, None, 'bids', 'asks', 'price', 'volume')

    def parse_order(self, order, market):
        symbol = market['symbol']
        timestamp = self.parse8601(order['created_at'])
        return {
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'status': 'open',
            'symbol': symbol,
            'type': order['ord_type'],
            'side': order['side'],
            'price': float(order['price']),
            'amount': float(order['volume']),
            'filled': float(order['executed_volume']),
            'remaining': float(order['remaining_volume']),
            'trades': None,
            'fee': None,
            'info': order,
        }

    def fetch_open_orders(self, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOpenOrders requires a symbol argument')
        market = self.market(symbol)
        orders = self.privateGetOrders(self.extend({
            'market': market['id'],
        }, params))
        # todo emulation of fetchClosedOrders, fetchOrders, fetchOrder
        # with order cache + fetchOpenOrders
        # as in BTC-e, Liqui, Yobit, DSX, Tidex, WEX
        return self.parse_orders(orders, market)

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

    def fetch_trades(self, symbol, params={}):
        market = self.market(symbol)
        response = self.publicGetTrades(self.extend({
            'market': market['id'],
        }, params))
        return self.parse_trades(response, market)
