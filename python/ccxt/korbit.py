# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange

class korbit(Exchange):

    def describe(self):
        return self.deep_extend(super(korbit, self).describe(), {
            'id': 'korbit',
            'name': 'korbit',
            'countries': ['KR'],
            'rateLimit': 1000,
            'version': 'v1',
            'urls': {
                'logo': 'https://www.korbit.co.kr/images/resources/desktop/common/korbit-logo-horizontal-white.png?0febcbd025e0eee5cc8766a5f4d9bf50',
                'www': 'https://www.korbit.co.kr/',
                'api': 'https://api.korbit.co.kr',
                'doc': 'https://apidocs.korbit.co.kr/',
            },
            'has': {
                'createLimitOrder': False,
                'createMarketOrder': False,
                'fetchL2OrderBook': False,
                'fetchTrades': False,
                'fetchMarkets': True,
                'fetchOrderBook': True,
                'fetchTicker': True,
                'fetchBalance': True,
                'fetchOrder': False,  # TODO: '/user/orders' with id param
                'fetchOpenOrders': False,  # TODO: 'user/orders/open'
                'fetchMyTrades': False,  # TODO: '/user/orders'
                'createOrder': False,  # TODO: 'user/orders/buy'
                'cancelOrder': False,  # TODO: 'user/orders/cancel' with id param
                'cancelAllOrders': False,  # TODO: 'user/orders/cancel'
            },
            'api': {
                'public': {
                    'get': [
                        'constants',
                        'orderbook',
                        'ticker/detailed',
                    ],
                },
                'private': {
                    'get': [
                        'user/balances',
                        'user/orders/open',
                        'user/orders'
                    ],
                    'post': [
                        'user/orders/buy',
                        'user/orders/cancel'
                    ],
                },
            },
        })

    def fetch_markets(self, params={}):
        response = self.publicGetConstants(params)
        #
        #     {
        #         "exchange": {
        #             "btc_krw": {
        #                 "tick_size": 500,
        #                 "min_price": 1000,
        #                 "max_price": 100000000,
        #                 "order_min_size": 0.00100000,
        #                 "order_max_size": 100.00000000
        #             },
        #             "eth_krw": {
        #                 "tick_size": 50,
        #                 "min_price": 1000,
        #                 "max_price": 100000000,
        #                 "order_min_size": 0.01000000,
        #                 "order_max_size": 1000.00000000
        #             },
        #             ...
        #         }
        #     }
        #
        result = []
        markets = self.safe_value(response, 'exchange', {})
        keys = list(markets.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            market = markets[key]
            id = key
            baseId, quoteId = key.split('_')
            base = baseId.upper()
            quote = quoteId.upper()
            minimumOrderSize = self.safe_float(market, 'order_min_size')
            maximumOrderSize = self.safe_float(market, 'order_max_size')
            minimumPrice = self.safe_float(market, 'min_price')
            maximumPrice = self.safe_float(market, 'max_price')
            minimumCost = minimumOrderSize * minimumPrice
            maximumCost = maximumOrderSize * maximumPrice

            entry = {
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': True,
                'limits': {
                    'amount': {
                        'min': minimumOrderSize,
                        'max': maximumOrderSize,
                    },
                    'price': {
                        'min': minimumPrice,
                        'max': maximumPrice,
                    },
                    'cost': {
                        'min': minimumCost,
                        'max': maximumCost,
                    },
                },
                'info': market,
            }
            result.append(entry)
        return result

    def fetch_order_book(self, symbol='BTC/KRW', params={}):
        self.load_markets()
        market = self.market(symbol)
        request = {
            'currency_pair': market['id'],
        }
        response = self.publicGetOrderbook(self.extend(request, params))
        #
        #     {
        #         "timestamp": 1386135077000,
        #         "bids": [["1100000", "0.0103918", "1"], ["1000000", "0.01000000", "1"], ...],
        #         "asks": [["569000", "0.50000000", "1"], ["568500", "2.00000000", "1"], ...]
        #     }
        #
        return self.parse_order_book(response)

    def parse_ticker(self, ticker, symbol=None):
        #
        #     {
        #         "timestamp": 1558590089274,
        #         "last": "9198500",
        #         "open": "9500000",
        #         "bid": "9192500",
        #         "ask": "9198000",
        #         "low": "9171500",
        #         "high": "9599000",
        #         "volume": "1539.18571988",
        #         "change": "-301500",
        #         "changePercent": "-3.17"
        #     }
        #
        timestamp = self.safe_integer(ticker, 'timestamp')
        opening_price = self.safe_float(ticker, 'open')
        closing_price = self.safe_float(ticker, 'last')
        average_price = (closing_price + opening_price) / 2
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'high'),
            'low': self.safe_float(ticker, 'low'),
            'bid': self.safe_float(ticker, 'bid'),
            'bidVolume': None,
            'ask': self.safe_float(ticker, 'ask'),
            'askVolume': None,
            'vwap': None,
            'open': opening_price,
            'close': closing_price,
            'last': closing_price,
            'previousClose': None,
            'change': self.safe_float(ticker, 'change'),
            'percentage': self.safe_float(ticker, 'changePercent'),
            'average': average_price,
            'baseVolume': self.safe_float(ticker, 'volume'),
            'quoteVolume': self.safe_float(ticker, 'volume'),
        }

    def fetch_ticker(self, symbol='BTC/KRW', params={}):
        self.load_markets()
        market = self.market(symbol)
        request = {
            'currency_pair': market['id'],
        }
        response = self.publicGetTickerDetailed(self.extend(request, params))
        #
        #     {
        #         "timestamp": 1558590089274,
        #         "last": "9198500",
        #         "open": "9500000",
        #         "bid": "9192500",
        #         "ask": "9198000",
        #         "low": "9171500",
        #         "high": "9599000",
        #         "volume": "1539.18571988",
        #         "change": "-301500",
        #         "changePercent": "-3.17"
        #     }
        #
        return self.parse_ticker(response, symbol)

    def fetch_balance(self, params={}):
        self.load_markets()
        response = self.privateGetUserBalances(params)
        #
        #     {
        #         "krw": {
        #             "available": "123000",
        #             "trade_in_use": "13000",
        #             "withdrawal_in_use": "0"
        #         },
        #         "btc": {
        #             "available": "1.50200000",
        #             "trade_in_use": "0.42000000",
        #             "withdrawal_in_use": "0.50280000",
        #             "avg_price": "7115500",
        #             "avg_price_updated_at": 1528944850000
        #         },
        #         ...
        #     }
        #
        result = {
            'info': response,
        }
        balances = list(response.keys())
        for i in range(0, len(balances)):
            key = balances[i]
            balance = balances[key]
            currency_code = self.safe_currency_code(balances[i].upper())

            free = self.safe_float(balance, 'available')
            trade_in_use = self.safe_float(balance, 'trade_in_use')
            withdrawal_in_use = self.safe_float(balance, 'withdrawal_in_use')
            used = trade_in_use + withdrawal_in_use
            total = free + used

            account = self.account()
            account['free'] = free
            account['used'] = used
            account['total'] = total
            result[currency_code] = account
        return self.parse_balance(result)
