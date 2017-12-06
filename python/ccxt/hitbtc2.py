# -*- coding: utf-8 -*-

from ccxt.hitbtc import hitbtc
import base64
import math
import json
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import OrderNotFound


class hitbtc2 (hitbtc):

    def describe(self):
        return self.deep_extend(super(hitbtc2, self).describe(), {
            'id': 'hitbtc2',
            'name': 'HitBTC v2',
            'countries': 'HK',  # Hong Kong
            'rateLimit': 1500,
            'version': '2',
            'hasCORS': True,
            # older metainfo interface
            'hasFetchOHLCV': True,
            'hasFetchTickers': True,
            'hasFetchOrder': True,
            'hasFetchOrders': False,
            'hasFetchOpenOrders': True,
            'hasFetchClosedOrders': True,
            'hasFetchMyTrades': True,
            'hasWithdraw': True,
            'hasFetchCurrencies': True,
            # new metainfo interface
            'has': {
                'fetchCurrencies': True,
                'fetchOHLCV': True,
                'fetchTickers': True,
                'fetchOrder': True,
                'fetchOrders': False,
                'fetchOpenOrders': True,
                'fetchClosedOrders': True,
                'fetchMyTrades': True,
                'withdraw': True,
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',  # default
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api': 'https://api.hitbtc.com',
                'www': 'https://hitbtc.com',
                'doc': 'https://api.hitbtc.com',
            },
            'api': {
                'public': {
                    'get': [
                        'symbol',  # Available Currency Symbols
                        'symbol/{symbol}',  # Get symbol info
                        'currency',  # Available Currencies
                        'currency/{currency}',  # Get currency info
                        'ticker',  # Ticker list for all symbols
                        'ticker/{symbol}',  # Ticker for symbol
                        'trades/{symbol}',  # Trades
                        'orderbook/{symbol}',  # Orderbook
                        'candles/{symbol}',  # Candles
                    ],
                },
                'private': {
                    'get': [
                        'order',  # List your current open orders
                        'order/{clientOrderId}',  # Get a single order by clientOrderId
                        'trading/balance',  # Get trading balance
                        'trading/fee/{symbol}',  # Get trading fee rate
                        'history/trades',  # Get historical trades
                        'history/order',  # Get historical orders
                        'history/order/{id}/trades',  # Get historical trades by specified order
                        'account/balance',  # Get main acccount balance
                        'account/transactions',  # Get account transactions
                        'account/transactions/{id}',  # Get account transaction by id
                        'account/crypto/address/{currency}',  # Get deposit crypro address
                    ],
                    'post': [
                        'order',  # Create new order
                        'account/crypto/withdraw',  # Withdraw crypro
                        'account/crypto/address/{currency}',  # Create new deposit crypro address
                        'account/transfer',  # Transfer amount to trading
                    ],
                    'put': [
                        'order/{clientOrderId}',  # Create new order
                        'account/crypto/withdraw/{id}',  # Commit withdraw crypro
                    ],
                    'delete': [
                        'order',  # Cancel all open orders
                        'order/{clientOrderId}',  # Cancel order
                        'account/crypto/withdraw/{id}',  # Rollback withdraw crypro
                    ],
                    'patch': [
                        'order/{clientOrderId}',  # Cancel Replace order
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': -0.01 / 100,
                    'taker': 0.1 / 100,
                },
            },
        })

    def common_currency_code(self, currency):
        if currency == 'CAT':
            return 'BitClave'
        return currency

    def currency_id(self, currency):
        if currency == 'BitClave':
            return 'CAT'
        return currency

    def fee_to_precision(self, symbol, fee):
        return self.truncate(fee, 8)

    def fetch_markets(self):
        markets = self.publicGetSymbol()
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = market['id']
            base = market['baseCurrency']
            quote = market['quoteCurrency']
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            lot = float(market['quantityIncrement'])
            step = float(market['tickSize'])
            precision = {
                'price': self.precision_from_string(market['tickSize']),
                'amount': self.precision_from_string(market['quantityIncrement']),
            }
            taker = float(market['takeLiquidityRate'])
            maker = float(market['provideLiquidityRate'])
            result.append(self.extend(self.fees['trading'], {
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': True,
                'lot': lot,
                'step': step,
                'taker': taker,
                'maker': maker,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': None,
                    },
                    'price': {
                        'min': step,
                        'max': None,
                    },
                    'cost': {
                        'min': lot * step,
                        'max': None,
                    },
                },
            }))
        return result

    def fetch_currencies(self, params={}):
        self.verbose = True
        currencies = self.publicGetCurrency(params)
        result = {}
        for i in range(0, len(currencies)):
            currency = currencies[i]
            id = currency['id']
            # todo: will need to rethink the fees
            # to add support for multiple withdrawal/deposit methods and
            # differentiated fees for each particular method
            precision = {
                'amount': 8,  # default precision, todo: fix "magic constants"
                'price': 8,
            }
            code = self.common_currency_code(id)
            payin = currency['payinEnabled']
            payout = currency['payoutEnabled']
            transfer = currency['transferEnabled']
            active = payin and payout and transfer
            status = 'disabled' if (currency['disabled']) else 'ok'
            type = 'crypto' if (currency['crypto']) else 'fiat'
            result[code] = {
                'id': id,
                'code': code,
                'type': type,
                'payin': payin,
                'payout': payout,
                'transfer': transfer,
                'info': currency,
                'name': currency['fullName'],
                'active': active,
                'status': status,
                'fee': None,  # todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': math.pow(10, -precision['amount']),
                        'max': math.pow(10, precision['amount']),
                    },
                    'price': {
                        'min': math.pow(10, -precision['price']),
                        'max': math.pow(10, precision['price']),
                    },
                    'cost': {
                        'min': None,
                        'max': None,
                    },
                    'withdraw': {
                        'min': None,
                        'max': math.pow(10, precision['amount']),
                    },
                },
            }
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        type = self.safe_string(params, 'type', 'trading')
        method = 'privateGet' + self.capitalize(type) + 'Balance'
        balances = getattr(self, method)()
        result = {'info': balances}
        for b in range(0, len(balances)):
            balance = balances[b]
            code = balance['currency']
            currency = self.common_currency_code(code)
            account = {
                'free': float(balance['available']),
                'used': float(balance['reserved']),
                'total': 0.0,
            }
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1d', since=None, limit=None):
        timestamp = self.parse8601(ohlcv['timestamp'])
        return [
            timestamp,
            float(ohlcv['open']),
            float(ohlcv['max']),
            float(ohlcv['min']),
            float(ohlcv['close']),
            float(ohlcv['volumeQuote']),
        ]

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
            'period': self.timeframes[timeframe],
        }
        if limit:
            request['limit'] = limit
        response = self.publicGetCandlesSymbol(self.extend(request, params))
        return self.parse_ohlcvs(response, market, timeframe, since, limit)

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        orderbook = self.publicGetOrderbookSymbol(self.extend({
            'symbol': self.market_id(symbol),
        }, params))
        return self.parse_order_book(orderbook, None, 'bid', 'ask', 'price', 'size')

    def parse_ticker(self, ticker, market=None):
        timestamp = self.parse8601(ticker['timestamp'])
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'high'),
            'low': self.safe_float(ticker, 'low'),
            'bid': self.safe_float(ticker, 'bid'),
            'ask': self.safe_float(ticker, 'ask'),
            'vwap': None,
            'open': self.safe_float(ticker, 'open'),
            'close': self.safe_float(ticker, 'close'),
            'first': None,
            'last': self.safe_float(ticker, 'last'),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': self.safe_float(ticker, 'volume'),
            'quoteVolume': self.safe_float(ticker, 'volumeQuote'),
            'info': ticker,
        }

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        tickers = self.publicGetTicker(params)
        result = {}
        for i in range(0, len(tickers)):
            ticker = tickers[i]
            id = ticker['symbol']
            market = self.markets_by_id[id]
            symbol = market['symbol']
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        ticker = self.publicGetTickerSymbol(self.extend({
            'symbol': market['id'],
        }, params))
        if 'message' in ticker:
            raise ExchangeError(self.id + ' ' + ticker['message'])
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market=None):
        timestamp = self.parse8601(trade['timestamp'])
        symbol = None
        if market:
            symbol = market['symbol']
        else:
            id = trade['symbol']
            if id in self.markets_by_id:
                market = self.markets_by_id[id]
                symbol = market['symbol']
            else:
                symbol = id
        fee = None
        if 'fee' in trade:
            currency = market['quote'] if market else None
            fee = {
                'cost': float(trade['fee']),
                'currency': currency,
            }
        orderId = None
        if 'clientOrderId' in trade:
            orderId = trade['clientOrderId']
        price = float(trade['price'])
        amount = float(trade['quantity'])
        cost = price * amount
        return {
            'info': trade,
            'id': str(trade['id']),
            'order': orderId,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': None,
            'side': trade['side'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetTradesSymbol(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_trades(response, market)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        clientOrderId = self.uuid()
        # their max accepted length is 32 characters
        clientOrderId = clientOrderId.replace('-', '')
        clientOrderId = clientOrderId[0:32]
        amount = float(amount)
        request = {
            'clientOrderId': clientOrderId,
            'symbol': market['id'],
            'side': side,
            'quantity': self.amount_to_precision(symbol, amount),
            'type': type,
        }
        if type == 'limit':
            request['price'] = self.price_to_precision(symbol, price)
        else:
            request['timeInForce'] = 'FOK'
        response = self.privatePostOrder(self.extend(request, params))
        order = self.parse_order(response)
        id = order['id']
        self.orders[id] = order
        return order

    def cancel_order(self, id, symbol=None, params={}):
        self.load_markets()
        return self.privateDeleteOrderClientOrderId(self.extend({
            'clientOrderId': id,
        }, params))

    def parse_order(self, order, market=None):
        created = None
        if 'createdAt' in order:
            created = self.parse8601(order['createdAt'])
        updated = None
        if 'updatedAt' in order:
            updated = self.parse8601(order['updatedAt'])
        if not market:
            market = self.markets_by_id[order['symbol']]
        symbol = market['symbol']
        amount = self.safe_float(order, 'quantity')
        filled = self.safe_float(order, 'cumQuantity')
        status = order['status']
        if status == 'new':
            status = 'open'
        elif status == 'suspended':
            status = 'open'
        elif status == 'partiallyFilled':
            status = 'open'
        elif status == 'filled':
            status = 'closed'
        id = str(order['clientOrderId'])
        price = self.safe_float(order, 'price')
        if price is None:
            if id in self.orders:
                price = self.orders[id].price
        remaining = None
        cost = None
        if amount is not None:
            if filled is not None:
                remaining = amount - filled
                if price is not None:
                    cost = filled * price
        return {
            'id': id,
            'timestamp': created,
            'datetime': self.iso8601(created),
            'created': created,
            'updated': updated,
            'status': status,
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'fee': None,
            'info': order,
        }

    def fetch_order(self, id, symbol=None, params={}):
        self.load_markets()
        response = self.privateGetHistoryOrder(self.extend({
            'clientOrderId': id,
        }, params))
        numOrders = len(response)
        if numOrders > 0:
            return self.parse_order(response[0])
        raise OrderNotFound(self.id + ' order ' + id + ' not found')

    def fetch_active_order(self, id, symbol=None, params={}):
        self.load_markets()
        response = self.privateGetOrderClientOrderId(self.extend({
            'clientOrderId': id,
        }, params))
        return self.parse_order(response)

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        market = None
        request = {}
        if symbol:
            market = self.market(symbol)
            request['symbol'] = market['id']
        response = self.privateGetOrder(self.extend(request, params))
        return self.parse_orders(response, market)

    def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        market = None
        request = {}
        if symbol:
            market = self.market(symbol)
            request['symbol'] = market['id']
        if limit:
            request['limit'] = limit
        if since:
            request['from'] = self.iso8601(since)
        response = self.privateGetHistoryOrder(self.extend(request, params))
        return self.parse_orders(response, market)

    def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        request = {
            # 'symbol': 'BTC/USD',  # optional
            # 'sort': 'DESC',  # or 'ASC'
            # 'by': 'timestamp',  # or 'id'	String	timestamp by default, or id
            # 'from':	'Datetime or Number',  # ISO 8601
            # 'till':	'Datetime or Number',
            # 'limit': 100,
            # 'offset': 0,
        }
        market = None
        if symbol:
            market = self.market(symbol)
            request['symbol'] = market['id']
        if since:
            request['from'] = self.iso8601(since)
        if limit:
            request['limit'] = limit
        response = self.privateGetHistoryTrades(self.extend(request, params))
        return self.parse_trades(response, market)

    def create_deposit_address(self, currency, params={}):
        currencyId = self.currency_id(currency)
        response = self.privatePostAccountCryptoAddressCurrency({
            'currency': currencyId,
        })
        address = response['address']
        return {
            'currency': currency,
            'address': address,
            'status': 'ok',
            'info': response,
        }

    def fetch_deposit_address(self, currency, params={}):
        currencyId = self.currency_id(currency)
        response = self.privateGetAccountCryptoAddressCurrency({
            'currency': currencyId,
        })
        address = response['address']
        return {
            'currency': currency,
            'address': address,
            'status': 'ok',
            'info': response,
        }

    def withdraw(self, currency, amount, address, params={}):
        currencyId = self.currency_id(currency)
        amount = float(amount)
        response = self.privatePostAccountCryptoWithdraw(self.extend({
            'currency': currencyId,
            'amount': amount,
            'address': address,
        }, params))
        return {
            'info': response,
            'id': response['id'],
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = '/api' + '/' + self.version + '/'
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            url += api + '/' + self.implode_params(path, params)
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
            url += self.implode_params(path, params)
            if method == 'GET':
                if query:
                    url += '?' + self.urlencode(query)
            else:
                if query:
                    body = self.json(query)
            payload = self.encode(self.apiKey + ':' + self.secret)
            auth = base64.b64encode(payload)
            headers = {
                'Authorization': "Basic " + self.decode(auth),
                'Content-Type': 'application/json',
            }
        url = self.urls['api'] + url
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def handle_errors(self, code, reason, url, method, headers, body):
        if code == 400:
            if body[0] == "{":
                response = json.loads(body)
                if 'error' in response:
                    if 'message' in response['error']:
                        message = response['error']['message']
                        if message == 'Order not found':
                            raise OrderNotFound(self.id + ' order not found in active orders')
                        elif message == 'Insufficient funds':
                            raise InsufficientFunds(self.id + ' ' + message)
            raise ExchangeError(self.id + ' ' + body)

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'error' in response:
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
