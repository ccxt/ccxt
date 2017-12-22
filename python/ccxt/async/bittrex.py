# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import hashlib
import math
import json
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import InvalidOrder
from ccxt.base.errors import OrderNotFound


class bittrex (Exchange):

    def describe(self):
        return self.deep_extend(super(bittrex, self).describe(), {
            'id': 'bittrex',
            'name': 'Bittrex',
            'countries': 'US',
            'version': 'v1.1',
            'rateLimit': 1500,
            'hasCORS': False,
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
                'fetchOHLCV': True,
                'fetchOrder': True,
                'fetchOrders': True,
                'fetchClosedOrders': 'emulated',
                'fetchOpenOrders': True,
                'fetchMyTrades': False,
                'fetchCurrencies': True,
                'withdraw': True,
            },
            'timeframes': {
                '1m': 'oneMin',
                '5m': 'fiveMin',
                '30m': 'thirtyMin',
                '1h': 'hour',
                '1d': 'day',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg',
                'api': {
                    'public': 'https://bittrex.com/api',
                    'account': 'https://bittrex.com/api',
                    'market': 'https://bittrex.com/api',
                    'v2': 'https://bittrex.com/api/v2.0/pub',
                },
                'www': 'https://bittrex.com',
                'doc': [
                    'https://bittrex.com/Home/Api',
                    'https://www.npmjs.org/package/node.bittrex.api',
                ],
                'fees': [
                    'https://bittrex.com/Fees',
                    'https://support.bittrex.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-',
                ],
            },
            'api': {
                'v2': {
                    'get': [
                        'currencies/GetBTCPrice',
                        'market/GetTicks',
                        'market/GetLatestTick',
                        'Markets/GetMarketSummaries',
                        'market/GetLatestTick',
                    ],
                },
                'public': {
                    'get': [
                        'currencies',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'marketsummary',
                        'orderbook',
                        'ticker',
                    ],
                },
                'account': {
                    'get': [
                        'balance',
                        'balances',
                        'depositaddress',
                        'deposithistory',
                        'order',
                        'orderhistory',
                        'withdrawalhistory',
                        'withdraw',
                    ],
                },
                'market': {
                    'get': [
                        'buylimit',
                        'buymarket',
                        'cancel',
                        'openorders',
                        'selllimit',
                        'sellmarket',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': False,
                    'percentage': True,
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
                'funding': {
                    'tierBased': False,
                    'percentage': False,
                    'withdraw': {
                        'BTC': 0.001,
                        'LTC': 0.01,
                        'DOGE': 2,
                        'VTC': 0.02,
                        'PPC': 0.02,
                        'FTC': 0.2,
                        'RDD': 2,
                        'NXT': 2,
                        'DASH': 0.002,
                        'POT': 0.002,
                    },
                    'deposit': {
                        'BTC': 0,
                        'LTC': 0,
                        'DOGE': 0,
                        'VTC': 0,
                        'PPC': 0,
                        'FTC': 0,
                        'RDD': 0,
                        'NXT': 0,
                        'DASH': 0,
                        'POT': 0,
                    },
                },
            },
        })

    def cost_to_precision(self, symbol, cost):
        return self.truncate(float(cost), self.markets[symbol]['precision']['price'])

    def fee_to_precision(self, symbol, fee):
        return self.truncate(float(fee), self.markets[symbol]['precision']['price'])

    async def fetch_markets(self):
        response = await self.v2GetMarketsGetMarketSummaries()
        result = []
        for i in range(0, len(response['result'])):
            market = response['result'][i]['Market']
            id = market['MarketName']
            base = market['MarketCurrency']
            quote = market['BaseCurrency']
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            precision = {
                'amount': 8,
                'price': 8,
            }
            active = market['IsActive']
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
                        'min': market['MinTradeSize'],
                        'max': None,
                    },
                    'price': {
                        'min': None,
                        'max': None,
                    },
                },
            }))
        return result

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.accountGetBalances()
        balances = response['result']
        result = {'info': balances}
        indexed = self.index_by(balances, 'Currency')
        keys = list(indexed.keys())
        for i in range(0, len(keys)):
            id = keys[i]
            currency = self.common_currency_code(id)
            account = self.account()
            balance = indexed[id]
            free = float(balance['Available'])
            total = float(balance['Balance'])
            used = total - free
            account['free'] = free
            account['used'] = used
            account['total'] = total
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        response = await self.publicGetOrderbook(self.extend({
            'market': self.market_id(symbol),
            'type': 'both',
        }, params))
        orderbook = response['result']
        if 'type' in params:
            if params['type'] == 'buy':
                orderbook = {
                    'buy': response['result'],
                    'sell': [],
                }
            elif params['type'] == 'sell':
                orderbook = {
                    'buy': [],
                    'sell': response['result'],
                }
        return self.parse_order_book(orderbook, None, 'buy', 'sell', 'Rate', 'Quantity')

    def parse_ticker(self, ticker, market=None):
        timestamp = self.parse8601(ticker['TimeStamp'])
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'High'),
            'low': self.safe_float(ticker, 'Low'),
            'bid': self.safe_float(ticker, 'Bid'),
            'ask': self.safe_float(ticker, 'Ask'),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': self.safe_float(ticker, 'Last'),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': self.safe_float(ticker, 'Volume'),
            'quoteVolume': self.safe_float(ticker, 'BaseVolume'),
            'info': ticker,
        }

    async def fetch_currencies(self, params={}):
        response = await self.publicGetCurrencies(params)
        currencies = response['result']
        result = {}
        for i in range(0, len(currencies)):
            currency = currencies[i]
            id = currency['Currency']
            # todo: will need to rethink the fees
            # to add support for multiple withdrawal/deposit methods and
            # differentiated fees for each particular method
            code = self.common_currency_code(id)
            precision = 8  # default precision, todo: fix "magic constants"
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['CurrencyLong'],
                'active': currency['IsActive'],
                'status': 'ok',
                'fee': currency['TxFee'],  # todo: redesign
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
                        'min': currency['TxFee'],
                        'max': math.pow(10, precision),
                    },
                },
            }
        return result

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        response = await self.publicGetMarketsummaries(params)
        tickers = response['result']
        result = {}
        for t in range(0, len(tickers)):
            ticker = tickers[t]
            id = ticker['MarketName']
            market = None
            symbol = id
            if id in self.markets_by_id:
                market = self.markets_by_id[id]
                symbol = market['symbol']
            else:
                quote, base = id.split('-')
                base = self.common_currency_code(base)
                quote = self.common_currency_code(quote)
                symbol = base + '/' + quote
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetMarketsummary(self.extend({
            'market': market['id'],
        }, params))
        ticker = response['result'][0]
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market=None):
        timestamp = self.parse8601(trade['TimeStamp'])
        side = None
        if trade['OrderType'] == 'BUY':
            side = 'buy'
        elif trade['OrderType'] == 'SELL':
            side = 'sell'
        id = None
        if 'Id' in trade:
            id = str(trade['Id'])
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': 'limit',
            'side': side,
            'price': float(trade['Price']),
            'amount': float(trade['Quantity']),
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetMarkethistory(self.extend({
            'market': market['id'],
        }, params))
        if 'result' in response:
            if response['result'] is not None:
                return self.parse_trades(response['result'], market, since, limit)
        raise ExchangeError(self.id + ' fetchTrades() returned None response')

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1d', since=None, limit=None):
        timestamp = self.parse8601(ohlcv['T'])
        return [
            timestamp,
            ohlcv['O'],
            ohlcv['H'],
            ohlcv['L'],
            ohlcv['C'],
            ohlcv['V'],
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'tickInterval': self.timeframes[timeframe],
            'marketName': market['id'],
        }
        response = await self.v2GetMarketGetTicks(self.extend(request, params))
        return self.parse_ohlcvs(response['result'], market, timeframe, since, limit)

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        request = {}
        market = None
        if symbol:
            market = self.market(symbol)
            request['market'] = market['id']
        response = await self.marketGetOpenorders(self.extend(request, params))
        orders = self.parse_orders(response['result'], market, since, limit)
        return self.filter_orders_by_symbol(orders, symbol)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        method = 'marketGet' + self.capitalize(side) + type
        order = {
            'market': market['id'],
            'quantity': self.amount_to_precision(symbol, amount),
        }
        if type == 'limit':
            order['rate'] = self.price_to_precision(symbol, price)
        response = await getattr(self, method)(self.extend(order, params))
        result = {
            'info': response,
            'id': response['result']['uuid'],
        }
        return result

    async def cancel_order(self, id, symbol=None, params={}):
        await self.load_markets()
        response = None
        try:
            response = await self.marketGetCancel(self.extend({
                'uuid': id,
            }, params))
        except Exception as e:
            if self.last_json_response:
                message = self.safe_string(self.last_json_response, 'message')
                if message == 'ORDER_NOT_OPEN':
                    raise InvalidOrder(self.id + ' cancelOrder() error: ' + self.last_http_response)
                if message == 'UUID_INVALID':
                    raise OrderNotFound(self.id + ' cancelOrder() error: ' + self.last_http_response)
            raise e
        return response

    def parse_order(self, order, market=None):
        side = None
        if 'OrderType' in order:
            side = 'buy' if (order['OrderType'] == 'LIMIT_BUY') else 'sell'
        if 'Type' in order:
            side = 'buy' if (order['Type'] == 'LIMIT_BUY') else 'sell'
        status = 'open'
        if order['Closed']:
            status = 'closed'
        elif order['CancelInitiated']:
            status = 'canceled'
        symbol = None
        if not market:
            if 'Exchange' in order:
                if order['Exchange'] in self.markets_by_id:
                    market = self.markets_by_id[order['Exchange']]
        if market:
            symbol = market['symbol']
        timestamp = None
        if 'Opened' in order:
            timestamp = self.parse8601(order['Opened'])
        if 'TimeStamp' in order:
            timestamp = self.parse8601(order['TimeStamp'])
        fee = None
        commission = None
        if 'Commission' in order:
            commission = 'Commission'
        elif 'CommissionPaid' in order:
            commission = 'CommissionPaid'
        if commission:
            fee = {
                'cost': float(order[commission]),
                'currency': market['quote'],
            }
        price = self.safe_float(order, 'Limit')
        cost = self.safe_float(order, 'Price')
        amount = self.safe_float(order, 'Quantity')
        remaining = self.safe_float(order, 'QuantityRemaining', 0.0)
        filled = amount - remaining
        if not cost:
            if price and amount:
                cost = price * amount
        if not price:
            if cost and filled:
                price = cost / filled
        average = self.safe_float(order, 'PricePerUnit')
        result = {
            'info': order,
            'id': order['OrderUuid'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        }
        return result

    async def fetch_order(self, id, symbol=None, params={}):
        await self.load_markets()
        response = None
        try:
            response = await self.accountGetOrder(self.extend({'uuid': id}, params))
        except Exception as e:
            if self.last_json_response:
                message = self.safe_string(self.last_json_response, 'message')
                if message == 'UUID_INVALID':
                    raise OrderNotFound(self.id + ' fetchOrder() error: ' + self.last_http_response)
            raise e
        return self.parse_order(response['result'])

    async def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        request = {}
        market = None
        if symbol:
            market = self.market(symbol)
            request['market'] = market['id']
        response = await self.accountGetOrderhistory(self.extend(request, params))
        orders = self.parse_orders(response['result'], market, since, limit)
        return self.filter_orders_by_symbol(orders, symbol)

    async def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        orders = await self.fetch_orders(symbol, params)
        return self.filter_by(orders, 'status', 'closed')

    def currency_id(self, currency):
        if currency == 'BCH':
            return 'BCC'
        return currency

    async def fetch_deposit_address(self, currency, params={}):
        currencyId = self.currency_id(currency)
        response = await self.accountGetDepositaddress(self.extend({
            'currency': currencyId,
        }, params))
        address = self.safe_string(response['result'], 'Address')
        message = self.safe_string(response, 'message')
        status = 'ok'
        if not address or message == 'ADDRESS_GENERATING':
            status = 'pending'
        return {
            'currency': currency,
            'address': address,
            'status': status,
            'info': response,
        }

    async def withdraw(self, currency, amount, address, params={}):
        currencyId = self.currency_id(currency)
        response = await self.accountGetWithdraw(self.extend({
            'currency': currencyId,
            'quantity': amount,
            'address': address,
        }, params))
        id = None
        if 'result' in response:
            if 'uuid' in response['result']:
                id = response['result']['uuid']
        return {
            'info': response,
            'id': id,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api] + '/'
        if api != 'v2':
            url += self.version + '/'
        if api == 'public':
            url += api + '/' + method.lower() + path
            if params:
                url += '?' + self.urlencode(params)
        elif api == 'v2':
            url += path
            if params:
                url += '?' + self.urlencode(params)
        else:
            self.check_required_credentials()
            nonce = self.nonce()
            url += api + '/'
            if ((api == 'account') and(path != 'withdraw')) or (path == 'openorders'):
                url += method.lower()
            url += path + '?' + self.urlencode(self.extend({
                'nonce': nonce,
                'apikey': self.apiKey,
            }, params))
            signature = self.hmac(self.encode(url), self.encode(self.secret), hashlib.sha512)
            headers = {'apisign': signature}
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def handle_errors(self, code, reason, url, method, headers, body):
        if code >= 400:
            if body[0] == "{":
                response = json.loads(body)
                if 'success' in response:
                    if not response['success']:
                        if 'message' in response:
                            if response['message'] == 'MIN_TRADE_REQUIREMENT_NOT_MET':
                                raise InvalidOrder(self.id + ' ' + self.json(response))
                            if response['message'] == 'APIKEY_INVALID':
                                raise AuthenticationError(self.id + ' ' + self.json(response))
                            if response['message'] == 'DUST_TRADE_DISALLOWED_MIN_VALUE_50K_SAT':
                                raise InvalidOrder(self.id + ' order cost should be over 50k satoshi ' + self.json(response))
                        raise ExchangeError(self.id + ' ' + self.json(response))

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'success' in response:
            if response['success']:
                return response
        if 'message' in response:
            if response['message'] == 'ADDRESS_GENERATING':
                return response
            if response['message'] == "INSUFFICIENT_FUNDS":
                raise InsufficientFunds(self.id + ' ' + self.json(response))
        raise ExchangeError(self.id + ' ' + self.json(response))
