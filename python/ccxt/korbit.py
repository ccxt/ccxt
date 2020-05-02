from ccxt.base.exchange import Exchange
from ccxt.base.errors import NotSupported


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
                'createOrder': True,
                'cancelOrder': True,
                'cancelAllOrders': True
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
                        'user/orders',
                        'user/transactions'
                    ],
                    'post': [
                        'user/orders/buy',
                        'user/orders/sell',
                        'user/orders/cancel'
                    ],
                },
            },
        })

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.version + '/' + path
        if params:
            if method == 'GET':
                url += '?' + self.urlencode(params)
            if method == 'POST':
                nonce = str(self.nonce())
                body = self.urlencode(self.extend({'nonce': nonce}, params))
        if api == 'private':
            self.check_required_credentials()
            headers = {
                'Authorization': "Bearer " + self.apiKey
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

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
        #         "timestamp": 1383707746000,
        #         "completedAt": 1383797746000,
        #         "id": "599",
        #         "type": "sell",
        #         "fee": {"currency": "krw", "value": "1500"},
        #         "fillsDetail": {
        #             "price": {"currency": "krw", "value": "1000000"},
        #             "amount": {"currency": "btc", "value": "1"},
        #             "native_amount": {"currency": "krw", "value": "1000000"},
        #             "orderId": "1002"
        #         }
        #     }
        #
        timestamp = self.safe_string(trade, 'timestamp')
        details = self.safe_value(trade, 'fillsDetail')
        price_details = self.safe_value(details, 'price')
        amount_details = self.safe_value(details, 'price')
        base_currency = self.safe_string(market, 'base', self.safe_string(price_details, 'currency').upper())
        quote_currency = self.safe_string(market, 'quote', self.safe_string(amount_details, 'currency').upper())
        symbol = self.safe_string(market, 'symbol', base_currency + '/' + quote_currency)
        price = self.safe_float(price_details, 'value', 0)
        amount = self.safe_float(amount_details, 'value', 0)
        fee = self.safe_value(trade, 'fee')
        return {
            'info': trade,
            'id': self.safe_string(trade, 'id'),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'order': self.safe_string(details, 'orderId'),
            'type': None,
            'side': self.safe_string(trade, 'side'),
            'takerOrMaker': None,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': {
                'cost': self.safe_float(fee, 'value'),
                'currency': self.safe_string(fee, 'currency').upper()
            }
        }

    def parse_order(self, order, market=None):
        #
        #     fetch_order(private) & fetch_open_orders(private)
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
            market_id = key
            base_id, quote_id = key.split('_')
            base = base_id.upper()
            quote = quote_id.upper()
            minimum_order_size = self.safe_float(market, 'order_min_size', 0)
            maximum_order_size = self.safe_float(market, 'order_max_size', 0)
            minimum_price = self.safe_float(market, 'min_price', 0)
            maximum_price = self.safe_float(market, 'max_price', 0)
            minimum_cost = minimum_order_size * minimum_price
            maximum_cost = maximum_order_size * maximum_price

            entry = {
                'id': market_id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'baseId': base_id,
                'quoteId': quote_id,
                'active': True,
                'limits': {
                    'amount': {
                        'min': minimum_order_size,
                        'max': maximum_order_size,
                    },
                    'price': {
                        'min': minimum_price,
                        'max': maximum_price,
                    },
                    'cost': {
                        'min': minimum_cost,
                        'max': maximum_cost,
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
            'limit': limit if limit <= 40 else 40
        }
        response = self.privateGetUserTransactions(self.extend(request, params))
        #
        #     [
        #         {
        #             "timestamp": 1383707746000,
        #             "completedAt": 1383797746000,
        #             "id": "599",
        #             "type": "sell",
        #             "fee": {"currency": "krw", "value": "1500"},
        #             "fillsDetail": {
        #                 "price": {"currency": "krw", "value": "1000000"},
        #                 "amount": {"currency": "btc", "value": "1"},
        #                 "native_amount": {"currency": "krw", "value": "1000000"},
        #                 "orderId": "1002"
        #             }
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

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        price = self.price_to_precision(symbol, price) if price is not None else 0
        amount = self.amount_to_precision(symbol, amount)
        request = {
            'currency_pair': market['id'],
            'type': type,
        }
        response = None
        if side == 'buy':
            if type == 'market':
                request['fiat_amount'] = amount
            else:
                request['price'] = price
                request['coin_amount'] = amount
            response = self.privatePostUserOrdersBuy(self.extend(request, params))
        else:
            request['price'] = price
            request['coin_amount'] = amount
            response = self.privatePostUserOrdersSell(self.extend(request, params))

        #
        #     {
        #         "orderId":"12513",
        #         "status":"success",
        #         "currency_pair":"btc_krw"
        #     }
        #
        return {
            'id': self.safe_string(response, 'orderId'),
            'clientOrderId': self.safe_string(response, 'orderId'),
            'info': response,
            'timestamp': None,
            'datetime': None,
            'lastTradeTimestamp': None,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'average': None,
            'filled': None,
            'remaining': None,
            'status': None,
            'fee': None,
            'trades': None,
        }

    def cancel_all_orders(self, symbol=None, params={}):
        request = {}
        if symbol is not None:
            self.load_markets()
            market = self.market(symbol)
            request['currency_pair'] = market['id']
        return self.privatePostUserOrdersCancel(self.extend(request, params))

    def cancel_order(self, id, symbol=None, params={}):
        request = {
            'id': id
        }
        if symbol is not None:
            self.load_markets()
            market = self.market(symbol)
            request['currency_pair'] = market['id']
        return self.privatePostUserOrdersCancel(self.extend(request, params))
