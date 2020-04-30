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
                'fetchOrder': True,
                'fetchOpenOrders': True,
                'fetchMyTrades': True,
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
                        'user/orders'
                    ],
                    'post': [
                        'user/orders/buy',
                        'user/orders/cancel'
                    ],
                },
            },
        })

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

    def parse_trade(self, trade, market=None):
        #
        #     fetch_my_trades(private)
        #     {
        #         "id": "89999",
        #         "currency_pair": "btc_krw",
        #         "side": "bid",
        #         "avg_price": "2900000",
        #         "price": "3000000",
        #         "order_amount": "0.81140000",
        #         "filled_amount": "0.33122200",
        #         "order_total": "2434200",
        #         "filled_total": "960543",
        #         "created_at": "1500033942638",
        #         "last_filled_at": "1500533946947",
        #         "status": "partially_filled",
        #         "fee": "0.00000500"
        #     },
        #
        timestamp = self.safe_string(trade, 'created_at')
        symbol = self.safe_string(market, 'symbol', self.safe_string(trade, 'currency_pair').upper().replace('_', '/'))
        base_currency, quote_currency = symbol.split('/')
        trade_type = 'limit' if self.safe_string(trade, 'filled_total') is not None else 'market'
        side = self.safe_string(trade, 'side')
        price = self.safe_float(trade, 'price')
        amount = self.safe_float(trade, 'order_amount')
        fee = {
            'cost': self.safe_float(trade, 'fee'),
            'currency': base_currency if side == 'buy' else quote_currency if side == 'ask' else None
        }
        return {
            'info': trade,
            'id': self.safe_string(trade, 'id'),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'order': None,
            'type': trade_type,
            'side': side,
            'takerOrMaker': None,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': fee,
        }

    def parse_order(self, order, market=None):
        #
        #     fetch_order(private)
        #     {
        #         "id": "89999",
        #         "currency_pair": "btc_krw",
        #         "side": "bid",
        #         "avg_price": "2900000",
        #         "price": "3000000",
        #         "order_amount": "0.81140000",
        #         "filled_amount": "0.33122200",
        #         "order_total": "2434200",
        #         "filled_total": "960543",
        #         "created_at": "1500033942638",
        #         "last_filled_at": "1500533946947",
        #         "status": "partially_filled",
        #         "fee": "0.00000500"
        #     },
        #
        timestamp = self.safe_string(order, 'created_at')
        status = 'closed' if self.safe_string(order, 'status') == 'filled' else 'open'
        symbol = self.safe_string(market, 'symbol', self.safe_string(order, 'currency_pair').upper().replace('_', '/'))
        base_currency, quote_currency = symbol.split('/')
        order_type = 'limit' if self.safe_string(order, 'filled_total') is not None else 'market'
        side = self.safe_string(order, 'side')
        price = self.safe_float(order, 'price', 0)
        order_amount = self.safe_float(order, 'order_amount', 0)
        filled_amount = self.safe_float(order, 'filled_amount', 0)
        fee = {
            'cost': self.safe_float(order, 'fee'),
            'currency': base_currency if side == 'buy' else quote_currency if side == 'ask' else None
        }
        return {
            'id': self.safe_string(order, 'id'),
            'datetime': self.iso8601(timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': self.safe_string(order, 'last_filled_at'),
            'status': status,
            'symbol': symbol,
            'type': order_type,
            'side': side,
            'price': price,
            'amount': order_amount,
            'filled': filled_amount,
            'remaining': filled_amount - order_amount,
            'cost': filled_amount * price,
            'trades': None,
            'fee': fee,
            'info': order,
        }

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
            minimumOrderSize = self.safe_float(market, 'order_min_size', 0)
            maximumOrderSize = self.safe_float(market, 'order_max_size', 0)
            minimumPrice = self.safe_float(market, 'min_price', 0)
            maximumPrice = self.safe_float(market, 'max_price', 0)
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

            free = self.safe_float(balance, 'available', 0)
            trade_in_use = self.safe_float(balance, 'trade_in_use', 0)
            withdrawal_in_use = self.safe_float(balance, 'withdrawal_in_use', 0)
            used = trade_in_use + withdrawal_in_use
            total = free + used

            account = self.account()
            account['free'] = free
            account['used'] = used
            account['total'] = total
            result[currency_code] = account
        return self.parse_balance(result)

    def fetch_my_trades(self, symbol=None, since=None, limit=10, params={}):
        self.load_markets()
        market = self.market(symbol) if symbol is not None else None
        request = {
            'currency_pair': market['id'] if market is not None else None,
            'status': 'filled',
            'limit': limit if limit <= 40 else 40
        }
        response = self.privateGetUserOrders(self.extend(request, params))
        #
        #     [
        #         {
        #             "id": "89999",
        #             "currency_pair": "btc_krw",
        #             "side": "bid",
        #             "avg_price": "2900000",
        #             "price": "3000000",
        #             "order_amount": "0.81140000",
        #             "filled_amount": "0.33122200",
        #             "order_total": "2434200",
        #             "filled_total": "960543",
        #             "created_at": "1500033942638",
        #             "last_filled_at": "1500533946947",
        #             "status": "partially_filled",
        #             "fee": "0.00000500"
        #         },
        #         ...
        #     ]
        #
        return self.parse_trades(response, market, since, limit)

    def fetch_order(self, id, symbol=None, params={}):
        self.load_markets()
        market = self.market(symbol) if symbol is not None else None
        request = {
            'currency_pair': market['id'] if market is not None else None,
            'id': id,
        }
        response = self.privateGetUserOrders(self.extend(request, params))
        #
        #     [
        #         {
        #             "id": "89999",
        #             "currency_pair": "btc_krw",
        #             "side": "bid",
        #             "avg_price": "2900000",
        #             "price": "3000000",
        #             "order_amount": "0.81140000",
        #             "filled_amount": "0.33122200",
        #             "order_total": "2434200",
        #             "filled_total": "960543",
        #             "created_at": "1500033942638",
        #             "last_filled_at": "1500533946947",
        #             "status": "partially_filled",
        #             "fee": "0.00000500"
        #         },
        #         ...
        #     ]
        #
        return self.parse_order(response[0], market)

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol) if symbol is not None else None
        request = {
            'currency_pair': market['id'] if market is not None else None,
            'status': 'unfilled&status=partially_filled',
            'limit': limit if limit <= 40 else 40
        }
        response = self.privateGetUserOrders(self.extend(request, params))
        #
        #     [
        #         {
        #             "id": "89999",
        #             "currency_pair": "btc_krw",
        #             "side": "bid",
        #             "avg_price": "2900000",
        #             "price": "3000000",
        #             "order_amount": "0.81140000",
        #             "filled_amount": "0.33122200",
        #             "order_total": "2434200",
        #             "filled_total": "960543",
        #             "created_at": "1500033942638",
        #             "last_filled_at": "1500533946947",
        #             "status": "partially_filled",
        #             "fee": "0.00000500"
        #         },
        #         ...
        #     ]
        #
        return self.parse_orders(response, market, since, limit)

