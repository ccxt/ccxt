# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import hashlib
import math
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import DDoSProtection


class bibox (Exchange):

    def describe(self):
        return self.deep_extend(super(bibox, self).describe(), {
            'id': 'bibox',
            'name': 'Bibox',
            'countries': ['CN', 'US', 'KR'],
            'version': 'v1',
            'hasCORS': False,
            'hasPublicAPI': False,
            'hasFetchBalance': True,
            'hasFetchCurrencies': True,
            'hasFetchTickers': True,
            'hasFetchOrders': True,
            'hasFetchMyTrades': True,
            'hasFetchOHLCV': True,
            'hasWithdraw': True,
            'has': {
                'fetchBalance': True,
                'fetchCurrencies': True,
                'fetchTickers': True,
                'fetchOrders': True,
                'fetchMyTrades': True,
                'fetchOHLCV': True,
                'withdraw': True,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '8h': '12hour',
                '1d': 'day',
                '1w': 'week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/34902611-2be8bf1a-f830-11e7-91a2-11b2f292e750.jpg',
                'api': 'https://api.bibox.com',
                'www': 'https://www.bibox.com',
                'doc': 'https://github.com/Biboxcom/api_reference/wiki/home_en',
                'fees': 'https://bibox.zendesk.com/hc/en-us/articles/115004417013-Fee-Structure-on-Bibox',
            },
            'api': {
                'public': {
                    'post': [
                        # TODO: rework for full endpoint/cmd paths here
                        'mdata',
                    ],
                },
                'private': {
                    'post': [
                        'user',
                        'orderpending',
                        'transfer',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': False,
                    'percentage': True,
                    'taker': 0.001,
                    'maker': 0.0,
                },
                'funding': {
                    'tierBased': False,
                    'percentage': False,
                    'withdraw': {
                    },
                    'deposit': 0.0,
                },
            },
        })

    async def fetch_markets(self):
        response = await self.publicPostMdata({
            'cmd': 'api/marketAll',
            'body': {},
        })
        markets = response['result']
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            base = market['coin_symbol']
            quote = market['currency_symbol']
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            id = base + '_' + quote
            precision = {
                'amount': 8,
                'price': 8,
            }
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': None,
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

    def parse_ticker(self, ticker, market=None):
        timestamp = self.safe_integer(ticker, 'timestamp', self.seconds())
        symbol = None
        if market:
            symbol = market['symbol']
        else:
            symbol = ticker['coin_symbol'] + '/' + ticker['currency_symbol']
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
            'last': self.safe_float(ticker, 'last'),
            'change': None,
            'percentage': self.safe_string(ticker, 'percent'),
            'average': None,
            'baseVolume': self.safe_float(ticker, 'vol'),
            'quoteVolume': None,
            'info': ticker,
        }

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicPostMdata({
            'cmd': 'api/ticker',
            'body': self.extend({
                'pair': market['id'],
            }, params),
        })
        return self.parse_ticker(response['result'], market)

    async def fetch_tickers(self, symbols=None, params={}):
        response = await self.publicPostMdata({
            'cmd': 'api/marketAll',
            'body': {},
        })
        tickers = response['result']
        result = {}
        for t in range(0, len(tickers)):
            ticker = self.parse_ticker(tickers[t])
            symbol = ticker['symbol']
            if symbols and(not(symbol in list(symbols.keys()))):
                continue
            result[symbol] = ticker
        return result

    def parse_trade(self, trade, market=None):
        timestamp = trade['time']
        side = 'buy' if (trade['side'] == '1') else 'sell'
        return {
            'id': None,
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': float(trade['price']),
            'amount': float(trade['amount']),
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        size = limit if (limit) else 200
        response = await self.publicPostMdata({
            'cmd': 'api/deals',
            'body': self.extend({
                'pair': market['id'],
                'size': size,
            }, params),
        })
        return self.parse_trades(response['result'], market, since, limit)

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicPostMdata({
            'cmd': 'api/depth',
            'body': self.extend({
                'pair': market['id'],
            }, params),
        })
        return self.parse_order_book(response['result'], self.safe_float(response['result'], 'update_time'), 'bids', 'asks', 'price', 'amount')

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return [
            ohlcv['time'],
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['vol'],
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        size = limit if (limit) else 1000
        response = await self.publicPostMdata({
            'cmd': 'api/kline',
            'body': self.extend({
                'pair': market['id'],
                'period': self.timeframes[timeframe],
                'size': size,
            }, params),
        })
        return self.parse_ohlcvs(response['result'], market, timeframe, since, limit)

    async def fetch_currencies(self, params={}):
        response = await self.privatePostTransfer({
            'cmd': 'transfer/coinList',
            'body': {},
        })
        currencies = response['result']
        result = {}
        for i in range(0, len(currencies)):
            currency = currencies[i]
            id = currency['symbol']
            code = self.common_currency_code(id)
            precision = 8
            deposit = currency['enable_deposit']
            withdraw = currency['enable_withdraw']
            active = (deposit and withdraw)
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'status': 'ok',
                'fee': None,
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
                        'min': None,
                        'max': math.pow(10, precision),
                    },
                },
            }
        return result

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privatePostTransfer({
            'cmd': 'transfer/assets',
            'body': self.extend({
                'select': 1,
            }, params),
        })
        balances = response['result']
        result = {'info': balances}
        indexed = None
        if 'assets_list' in balances:
            indexed = self.index_by(balances['assets_list'], 'coin_symbol')
        else:
            indexed = {}
        keys = list(indexed.keys())
        for i in range(0, len(keys)):
            id = keys[i]
            currency = self.common_currency_code(id)
            account = self.account()
            balance = indexed[id]
            used = float(balance['freeze'])
            free = float(balance['balance'])
            total = self.sum(free, used)
            account['free'] = free
            account['used'] = used
            account['total'] = total
            result[currency] = account
        return self.parse_balance(result)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        orderType = 2 if (type == 'limit') else 1
        response = await self.privatePostOrder({
            'cmd': 'orderpending/trade',
            'body': self.extend({
                'pair': market['id'],
                'account_type': 0,
                'order_type': orderType,
                'order_side': side,
                'pay_bix': 0,
                'amount': amount,
                'price': price,
            }, params),
        })
        return {
            'info': response,
            'id': self.safe_string(response, 'result'),
        }

    async def cancel_order(self, id, symbol=None, params={}):
        response = await self.privatePostCancelOrder({
            'cmd': 'orderpending/cancelTrade',
            'body': self.extend({
                'orders_id': id,
            }, params),
        })
        return response

    def parse_order(self, order, market=None):
        symbol = None
        if market:
            symbol = market['symbol']
        else:
            symbol = order['coin_symbol'] + '/' + order['currency_symbol']
        type = 'market' if (order['order_type'] == 1) else 'limit'
        timestamp = order['createdAt']
        price = order['price']
        filled = order['amount']
        amount = self.safe_integer(order, 'deal_amount')
        remaining = amount - filled
        side = 'buy' if (order['order_side'] == 1) else 'sell'
        status = None
        if 'status' in order:
            status = self.parse_order_status(order['status'])
        result = {
            'info': order,
            'id': self.safe_string(order, 'id'),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * filled,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': self.safe_float(order, 'fee'),
        }
        return result

    def parse_order_status(self, status):
        statuses = {
            '1': 'pending',
            '2': 'open',
            '3': 'closed',
            '4': 'canceled',
            '5': 'canceled',
            '6': 'canceled',
        }
        return self.safe_string(statuses, status, status.lower())

    async def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOrders requires a symbol param')
        await self.load_markets()
        market = self.market(symbol)
        size = limit if (limit) else 200
        response = await self.privatePostOrderpending({
            'cmd': 'orderpending/orderPendingList',
            'body': self.extend({
                'pair': market['id'],
                'account_type': 0,  # 0 - regular, 1 - margin
                'page': 1,
                'size': size,
            }, params),
        })
        orders = response['items'] if ('items' in list(response.keys())) else []
        return self.parse_orders(orders, market, since, limit)

    async def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchMyTrades requires a symbol param')
        await self.load_markets()
        market = self.market(symbol)
        size = limit if (limit) else 200
        response = await self.privatePostOrderpending({
            'cmd': 'orderpending/orderHistoryList',
            'body': self.extend({
                'pair': market['id'],
                'account_type': 0,  # 0 - regular, 1 - margin
                'page': 1,
                'size': size,
            }, params),
        })
        orders = response['items'] if ('items' in list(response.keys())) else []
        return self.parse_orders(orders, market, since, limit)

    async def fetch_deposit_address(self, code, params={}):
        await self.load_markets()
        currency = self.currency(code)
        response = await self.privatePostTransfer({
            'cmd': 'transfer/transferOutInfo',
            'body': self.extend({
                'coin_symbol': currency['id'],
            }, params),
        })
        result = {
            'info': response,
            'address': None,
        }
        return result

    async def withdraw(self, code, amount, address, tag=None, params={}):
        await self.load_markets()
        currency = self.currency(code)
        response = await self.privatePostTransfer({
            'cmd': 'transfer/transferOut',
            'body': self.extend({
                'coin_symbol': currency,
                'amount': amount,
                'addr': address,
                'addr_remark': '',
            }, params),
        })
        return {
            'info': response,
            'id': None,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.version + '/' + path
        cmds = self.json([params])
        if api == 'public':
            body = {
                'cmds': cmds,
            }
        else:
            self.check_required_credentials()
            body = {
                'cmds': cmds,
                'apikey': self.apiKey,
                'sign': self.hmac(self.encode(cmds), self.encode(self.secret), hashlib.md5),
            }
        headers = {'Content-Type': 'application/json'}
        return {'url': url, 'method': method, 'body': self.json(body), 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        message = self.id + ' ' + self.json(response)
        if 'error' in response:
            if 'code' in response['error']:
                code = response['error']['code']
                if code == '3012':
                    raise AuthenticationError(message)  # invalid api key
                elif code == '3025':
                    raise AuthenticationError(message)  # signature failed
                elif code == '4003':
                    raise DDoSProtection(message)  # server is busy, try again later
            raise ExchangeError(message)
        if not('result' in list(response.keys())):
            raise ExchangeError(message)
        return response['result'][0]
