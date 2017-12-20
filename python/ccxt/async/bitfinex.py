# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import base64
import hashlib
import math
import json
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NotSupported
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import InvalidOrder
from ccxt.base.errors import OrderNotFound


class bitfinex (Exchange):

    def describe(self):
        return self.deep_extend(super(bitfinex, self).describe(), {
            'id': 'bitfinex',
            'name': 'Bitfinex',
            'countries': 'US',
            'version': 'v1',
            'rateLimit': 1500,
            'hasCORS': False,
            # old metainfo interface
            'hasFetchOrder': True,
            'hasFetchTickers': True,
            'hasDeposit': True,
            'hasWithdraw': True,
            'hasFetchOHLCV': True,
            'hasFetchOpenOrders': True,
            'hasFetchClosedOrders': True,
            # new metainfo interface
            'has': {
                'fetchOHLCV': True,
                'fetchTickers': True,
                'fetchOrder': True,
                'fetchOpenOrders': True,
                'fetchClosedOrders': True,
                'fetchMyTrades': True,
                'withdraw': True,
                'deposit': True,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': 'https://api.bitfinex.com',
                'www': 'https://www.bitfinex.com',
                'doc': [
                    'https://bitfinex.readme.io/v1/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ],
            },
            'api': {
                'v2': {
                    'get': [
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ],
                },
                'public': {
                    'get': [
                        'book/{symbol}',
                        # 'candles/{symbol}',
                        'lendbook/{currency}',
                        'lends/{currency}',
                        'pubticker/{symbol}',
                        'stats/{symbol}',
                        'symbols',
                        'symbols_details',
                        'tickers',
                        'today',
                        'trades/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'account_fees',
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
                        'mytrades_funding',
                        'offer/cancel',
                        'offer/new',
                        'offer/status',
                        'offers',
                        'offers/hist',
                        'order/cancel',
                        'order/cancel/all',
                        'order/cancel/multi',
                        'order/cancel/replace',
                        'order/new',
                        'order/new/multi',
                        'order/status',
                        'orders',
                        'orders/hist',
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
            'fees': {
                'trading': {
                    'tierBased': True,
                    'percentage': True,
                    'maker': 0.1 / 100,
                    'taker': 0.2 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.2 / 100],
                            [500000, 0.2 / 100],
                            [1000000, 0.2 / 100],
                            [2500000, 0.2 / 100],
                            [5000000, 0.2 / 100],
                            [7500000, 0.2 / 100],
                            [10000000, 0.18 / 100],
                            [15000000, 0.16 / 100],
                            [20000000, 0.14 / 100],
                            [25000000, 0.12 / 100],
                            [30000000, 0.1 / 100],
                        ],
                        'maker': [
                            [0, 0.1 / 100],
                            [500000, 0.08 / 100],
                            [1000000, 0.06 / 100],
                            [2500000, 0.04 / 100],
                            [5000000, 0.02 / 100],
                            [7500000, 0],
                            [10000000, 0],
                            [15000000, 0],
                            [20000000, 0],
                            [25000000, 0],
                            [30000000, 0],
                        ],
                    },
                },
                'funding': {
                    'tierBased': False,  # True for tier-based/progressive
                    'percentage': False,  # fixed commission
                    'deposit': {
                        'BTC': 0.0005,
                        'IOTA': 0.5,
                        'ETH': 0.01,
                        'BCH': 0.01,
                        'LTC': 0.1,
                        'EOS': 0.1,
                        'XMR': 0.04,
                        'SAN': 0.1,
                        'DASH': 0.01,
                        'ETC': 0.01,
                        'XPR': 0.02,
                        'YYW': 0.1,
                        'NEO': 0,
                        'ZEC': 0.1,
                        'BTG': 0,
                        'OMG': 0.1,
                        'DATA': 1,
                        'QASH': 1,
                        'ETP': 0.01,
                        'QTUM': 0.01,
                        'EDO': 0.5,
                        'AVT': 0.5,
                        'USDT': 0,
                    },
                    'withdraw': {
                        'BTC': 0.0005,
                        'IOTA': 0.5,
                        'ETH': 0.01,
                        'BCH': 0.01,
                        'LTC': 0.1,
                        'EOS': 0.1,
                        'XMR': 0.04,
                        'SAN': 0.1,
                        'DASH': 0.01,
                        'ETC': 0.01,
                        'XPR': 0.02,
                        'YYW': 0.1,
                        'NEO': 0,
                        'ZEC': 0.1,
                        'BTG': 0,
                        'OMG': 0.1,
                        'DATA': 1,
                        'QASH': 1,
                        'ETP': 0.01,
                        'QTUM': 0.01,
                        'EDO': 0.5,
                        'AVT': 0.5,
                        'USDT': 5,
                    },
                },
            },
        })

    def common_currency_code(self, currency):
        # issue  #4 Bitfinex names Dash as DSH, instead of DASH
        if currency == 'DSH':
            return 'DASH'
        if currency == 'QTM':
            return 'QTUM'
        if currency == 'BCC':
            return 'CST_BCC'
        if currency == 'BCU':
            return 'CST_BCU'
        # issue  #796
        if currency == 'IOT':
            return 'IOTA'
        return currency

    async def fetch_markets(self):
        markets = await self.publicGetSymbolsDetails()
        result = []
        for p in range(0, len(markets)):
            market = markets[p]
            id = market['pair'].upper()
            baseId = id[0:3]
            quoteId = id[3:6]
            base = self.common_currency_code(baseId)
            quote = self.common_currency_code(quoteId)
            symbol = base + '/' + quote
            precision = {
                'price': market['price_precision'],
                'amount': market['price_precision'],
            }
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': True,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': float(market['minimum_order_size']),
                        'max': float(market['maximum_order_size']),
                    },
                    'price': {
                        'min': math.pow(10, -precision['price']),
                        'max': math.pow(10, precision['price']),
                    },
                    'cost': {
                        'min': None,
                        'max': None,
                    },
                },
            }))
        return result

    async def fetch_balance(self, params={}):
        await self.load_markets()
        balanceType = self.safe_string(params, 'type', 'exchange')
        balances = await self.privatePostBalances()
        result = {'info': balances}
        for i in range(0, len(balances)):
            balance = balances[i]
            if balance['type'] == balanceType:
                currency = balance['currency']
                uppercase = currency.upper()
                uppercase = self.common_currency_code(uppercase)
                account = self.account()
                account['free'] = float(balance['available'])
                account['total'] = float(balance['amount'])
                account['used'] = account['total'] - account['free']
                result[uppercase] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        orderbook = await self.publicGetBookSymbol(self.extend({
            'symbol': self.market_id(symbol),
        }, params))
        return self.parse_order_book(orderbook, None, 'bids', 'asks', 'price', 'amount')

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        tickers = await self.publicGetTickers(params)
        result = {}
        for i in range(0, len(tickers)):
            ticker = tickers[i]
            if 'pair' in ticker:
                id = ticker['pair']
                if id in self.markets_by_id:
                    market = self.markets_by_id[id]
                    symbol = market['symbol']
                    result[symbol] = self.parse_ticker(ticker, market)
                else:
                    raise ExchangeError(self.id + ' fetchTickers() failed to recognize symbol ' + id + ' ' + self.json(ticker))
            else:
                raise ExchangeError(self.id + ' fetchTickers() response not recognized ' + self.json(tickers))
        return result

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        ticker = await self.publicGetPubtickerSymbol(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_ticker(ticker, market)

    def parse_ticker(self, ticker, market=None):
        timestamp = float(ticker['timestamp']) * 1000
        symbol = None
        if market:
            symbol = market['symbol']
        elif 'pair' in ticker:
            id = ticker['pair']
            if id in self.markets_by_id:
                market = self.markets_by_id[id]
                symbol = market['symbol']
            else:
                raise ExchangeError(self.id + ' unrecognized ticker symbol ' + id + ' ' + self.json(ticker))
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['bid']),
            'ask': float(ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last_price']),
            'change': None,
            'percentage': None,
            'average': float(ticker['mid']),
            'baseVolume': float(ticker['volume']),
            'quoteVolume': None,
            'info': ticker,
        }

    def parse_trade(self, trade, market):
        timestamp = int(float(trade['timestamp'])) * 1000
        side = trade['type'].lower()
        orderId = self.safe_string(trade, 'order_id')
        price = float(trade['price'])
        amount = float(trade['amount'])
        cost = price * amount
        return {
            'id': str(trade['tid']),
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'order': orderId,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': None,
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetTradesSymbol(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_trades(response, market, since, limit)

    async def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {'symbol': market['id']}
        if limit:
            request['limit_trades'] = limit
        if since:
            request['timestamp'] = int(since / 1000)
        response = await self.privatePostMytrades(self.extend(request, params))
        return self.parse_trades(response, market, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        orderType = type
        if (type == 'limit') or (type == 'market'):
            orderType = 'exchange ' + type
        # amount = self.amount_to_precision(symbol, amount)
        order = {
            'symbol': self.market_id(symbol),
            'amount': str(amount),
            'side': side,
            'type': orderType,
            'ocoorder': False,
            'buy_price_oco': 0,
            'sell_price_oco': 0,
        }
        if type == 'market':
            order['price'] = str(self.nonce())
        else:
            # price = self.price_to_precision(symbol, price)
            order['price'] = str(price)
        result = await self.privatePostOrderNew(self.extend(order, params))
        return self.parse_order(result)

    async def cancel_order(self, id, symbol=None, params={}):
        await self.load_markets()
        return await self.privatePostOrderCancel({'order_id': int(id)})

    def parse_order(self, order, market=None):
        side = order['side']
        open = order['is_live']
        canceled = order['is_cancelled']
        status = None
        if open:
            status = 'open'
        elif canceled:
            status = 'canceled'
        else:
            status = 'closed'
        symbol = None
        if not market:
            exchange = order['symbol'].upper()
            if exchange in self.markets_by_id:
                market = self.markets_by_id[exchange]
        if market:
            symbol = market['symbol']
        orderType = order['type']
        exchange = orderType.find('exchange ') >= 0
        if exchange:
            prefix, orderType = order['type'].split(' ')
        timestamp = int(float(order['timestamp']) * 1000)
        result = {
            'info': order,
            'id': str(order['id']),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': float(order['price']),
            'average': float(order['avg_execution_price']),
            'amount': float(order['original_amount']),
            'remaining': float(order['remaining_amount']),
            'filled': float(order['executed_amount']),
            'status': status,
            'fee': None,
        }
        return result

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        response = await self.privatePostOrders(params)
        orders = self.parse_orders(response, None, since, limit)
        if symbol:
            orders = self.filter_by(orders, 'symbol', symbol)
        return orders

    async def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        request = {}
        if limit:
            request['limit'] = limit
        response = await self.privatePostOrdersHist(self.extend(request, params))
        orders = self.parse_orders(response, None, since, limit)
        if symbol:
            orders = self.filter_by(orders, 'symbol', symbol)
        orders = self.filter_by(orders, 'status', 'closed')
        return orders

    async def fetch_order(self, id, symbol=None, params={}):
        await self.load_markets()
        response = await self.privatePostOrderStatus(self.extend({
            'order_id': int(id),
        }, params))
        return self.parse_order(response)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return [
            ohlcv[0],
            ohlcv[1],
            ohlcv[3],
            ohlcv[4],
            ohlcv[2],
            ohlcv[5],
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        v2id = 't' + market['id']
        request = {
            'symbol': v2id,
            'timeframe': self.timeframes[timeframe],
        }
        if limit:
            request['limit'] = limit
        if since:
            request['start'] = since
        request = self.extend(request, params)
        response = await self.v2GetCandlesTradeTimeframeSymbolHist(request)
        return self.parse_ohlcvs(response, market, timeframe, since, limit)

    def get_currency_name(self, currency):
        if currency == 'BTC':
            return 'bitcoin'
        elif currency == 'LTC':
            return 'litecoin'
        elif currency == 'ETH':
            return 'ethereum'
        elif currency == 'ETC':
            return 'ethereumc'
        elif currency == 'OMNI':
            return 'mastercoin'  # ???
        elif currency == 'ZEC':
            return 'zcash'
        elif currency == 'XMR':
            return 'monero'
        elif currency == 'USD':
            return 'wire'
        elif currency == 'DASH':
            return 'dash'
        elif currency == 'XRP':
            return 'ripple'
        elif currency == 'EOS':
            return 'eos'
        elif currency == 'BCH':
            return 'bcash'
        elif currency == 'USDT':
            return 'tetheruso'
        raise NotSupported(self.id + ' ' + currency + ' not supported for withdrawal')

    async def create_deposit_address(self, currency, params={}):
        response = await self.fetch_deposit_address(currency, self.extend({
            'renew': 1,
        }, params))
        return {
            'currency': currency,
            'address': response['address'],
            'status': 'ok',
            'info': response['info'],
        }

    async def fetch_deposit_address(self, currency, params={}):
        name = self.get_currency_name(currency)
        request = {
            'method': name,
            'wallet_name': 'exchange',
            'renew': 0,  # a value of 1 will generate a new address
        }
        response = await self.privatePostDepositNew(self.extend(request, params))
        return {
            'currency': currency,
            'address': response['address'],
            'status': 'ok',
            'info': response,
        }

    async def withdraw(self, currency, amount, address, params={}):
        name = self.get_currency_name(currency)
        request = {
            'withdraw_type': name,
            'walletselected': 'exchange',
            'amount': str(amount),
            'address': address,
        }
        responses = await self.privatePostWithdraw(self.extend(request, params))
        response = responses[0]
        return {
            'info': response,
            'id': response['withdrawal_id'],
        }

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        request = '/' + self.implode_params(path, params)
        if api == 'v2':
            request = '/' + api + request
        else:
            request = '/' + self.version + request
        query = self.omit(params, self.extract_params(path))
        url = self.urls['api'] + request
        if (api == 'public') or (path.find('/hist') >= 0):
            if query:
                suffix = '?' + self.urlencode(query)
                url += suffix
                request += suffix
        if api == 'private':
            self.check_required_credentials()
            nonce = self.nonce()
            query = self.extend({
                'nonce': str(nonce),
                'request': request,
            }, query)
            query = self.json(query)
            query = self.encode(query)
            payload = base64.b64encode(query)
            secret = self.encode(self.secret)
            signature = self.hmac(payload, secret, hashlib.sha384)
            headers = {
                'X-BFX-APIKEY': self.apiKey,
                'X-BFX-PAYLOAD': self.decode(payload),
                'X-BFX-SIGNATURE': signature,
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def handle_errors(self, code, reason, url, method, headers, body):
        if code == 400:
            if body[0] == "{":
                response = json.loads(body)
                message = response['message']
                if message.find('Key price should be a decimal number') >= 0:
                    raise InvalidOrder(self.id + ' ' + message)
                elif message.find('Invalid order: not enough exchange balance') >= 0:
                    raise InsufficientFunds(self.id + ' ' + message)
                elif message.find('Invalid order') >= 0:
                    raise InvalidOrder(self.id + ' ' + message)
                elif message.find('Order could not be cancelled.') >= 0:
                    raise OrderNotFound(self.id + ' ' + message)
            raise ExchangeError(self.id + ' ' + body)

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'message' in response:
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
