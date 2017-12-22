# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import math
import json
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InvalidOrder


class cex (Exchange):

    def describe(self):
        return self.deep_extend(super(cex, self).describe(), {
            'id': 'cex',
            'name': 'CEX.IO',
            'countries': ['GB', 'EU', 'CY', 'RU'],
            'rateLimit': 1500,
            'hasCORS': True,
            'hasFetchTickers': True,
            'hasFetchOHLCV': True,
            'hasFetchOpenOrders': True,
            'timeframes': {
                '1m': '1m',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
                'api': 'https://cex.io/api',
                'www': 'https://cex.io',
                'doc': 'https://cex.io/cex-api',
            },
            'requiredCredentials': {
                'apiKey': True,
                'secret': True,
                'uid': True,
            },
            'api': {
                'public': {
                    'get': [
                        'currency_limits/',
                        'last_price/{pair}/',
                        'last_prices/{currencies}/',
                        'ohlcv/hd/{yyyymmdd}/{pair}',
                        'order_book/{pair}/',
                        'ticker/{pair}/',
                        'tickers/{currencies}/',
                        'trade_history/{pair}/',
                    ],
                    'post': [
                        'convert/{pair}',
                        'price_stats/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'active_orders_status/',
                        'archived_orders/{pair}/',
                        'balance/',
                        'cancel_order/',
                        'cancel_orders/{pair}/',
                        'cancel_replace_order/{pair}/',
                        'close_position/{pair}/',
                        'get_address/',
                        'get_myfee/',
                        'get_order/',
                        'get_order_tx/',
                        'open_orders/{pair}/',
                        'open_orders/',
                        'open_position/{pair}/',
                        'open_positions/{pair}/',
                        'place_order/{pair}/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0,
                    'taker': 0.2 / 100,
                },
            },
        })

    async def fetch_markets(self):
        markets = await self.publicGetCurrencyLimits()
        result = []
        for p in range(0, len(markets['data']['pairs'])):
            market = markets['data']['pairs'][p]
            id = market['symbol1'] + '/' + market['symbol2']
            symbol = id
            base, quote = symbol.split('/')
            result.append({
                'id': id,
                'info': market,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'precision': {
                    'price': self.precision_from_string(market['minPrice']),
                    'amount': -1 * math.log10(market['minLotSize']),
                },
                'limits': {
                    'amount': {
                        'min': market['minLotSize'],
                        'max': market['maxLotSize'],
                    },
                    'price': {
                        'min': float(market['minPrice']),
                        'max': float(market['maxPrice']),
                    },
                    'cost': {
                        'min': market['minLotSizeS2'],
                        'max': None,
                    },
                },
            })
        return result

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privatePostBalance()
        result = {'info': response}
        ommited = ['username', 'timestamp']
        balances = self.omit(response, ommited)
        currencies = list(balances.keys())
        for i in range(0, len(currencies)):
            currency = currencies[i]
            if currency in balances:
                account = {
                    'free': self.safe_float(balances[currency], 'available', 0.0),
                    'used': self.safe_float(balances[currency], 'orders', 0.0),
                    'total': 0.0,
                }
                account['total'] = self.sum(account['free'], account['used'])
                result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        orderbook = await self.publicGetOrderBookPair(self.extend({
            'pair': self.market_id(symbol),
        }, params))
        timestamp = orderbook['timestamp'] * 1000
        return self.parse_order_book(orderbook, timestamp)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return [
            ohlcv[0] * 1000,
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[5],
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        if not since:
            since = self.milliseconds() - 86400000  # yesterday
        ymd = self.Ymd(since)
        ymd = ymd.split('-')
        ymd = ''.join(ymd)
        request = {
            'pair': market['id'],
            'yyyymmdd': ymd,
        }
        response = await self.publicGetOhlcvHdYyyymmddPair(self.extend(request, params))
        key = 'data' + self.timeframes[timeframe]
        ohlcvs = json.loads(response[key])
        return self.parse_ohlcvs(ohlcvs, market, timeframe, since, limit)

    def parse_ticker(self, ticker, market=None):
        timestamp = None
        iso8601 = None
        if 'timestamp' in ticker:
            timestamp = int(ticker['timestamp']) * 1000
            iso8601 = self.iso8601(timestamp)
        volume = self.safe_float(ticker, 'volume')
        high = self.safe_float(ticker, 'high')
        low = self.safe_float(ticker, 'low')
        bid = self.safe_float(ticker, 'bid')
        ask = self.safe_float(ticker, 'ask')
        last = self.safe_float(ticker, 'last')
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': iso8601,
            'high': high,
            'low': low,
            'bid': bid,
            'ask': ask,
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': last,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': volume,
            'quoteVolume': None,
            'info': ticker,
        }

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        currencies = list(self.currencies.keys())
        response = await self.publicGetTickersCurrencies(self.extend({
            'currencies': '/'.join(currencies),
        }, params))
        tickers = response['data']
        result = {}
        for t in range(0, len(tickers)):
            ticker = tickers[t]
            symbol = ticker['pair'].replace(':', '/')
            market = self.markets[symbol]
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        ticker = await self.publicGetTickerPair(self.extend({
            'pair': market['id'],
        }, params))
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market=None):
        timestamp = int(trade['date']) * 1000
        return {
            'info': trade,
            'id': trade['tid'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': trade['type'],
            'price': float(trade['price']),
            'amount': float(trade['amount']),
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetTradeHistoryPair(self.extend({
            'pair': market['id'],
        }, params))
        return self.parse_trades(response, market, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        order = {
            'pair': self.market_id(symbol),
            'type': side,
            'amount': amount,
        }
        if type == 'limit':
            order['price'] = price
        else:
            # for market buy CEX.io requires the amount of quote currency to spend
            if side == 'buy':
                if not price:
                    raise InvalidOrder('For market buy orders ' + self.id + " requires the amount of quote currency to spend, to calculate proper costs call createOrder(symbol, 'market', 'buy', amount, price)")
                order['amount'] = amount * price
            order['order_type'] = type
        response = await self.privatePostPlaceOrderPair(self.extend(order, params))
        return {
            'info': response,
            'id': response['id'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        await self.load_markets()
        return await self.privatePostCancelOrder({'id': id})

    def parse_order(self, order, market=None):
        timestamp = int(order['time'])
        symbol = None
        if not market:
            symbol = order['symbol1'] + '/' + order['symbol2']
            if symbol in self.markets:
                market = self.market(symbol)
        status = order['status']
        if status == 'a':
            status = 'open'  # the unified status
        elif status == 'cd':
            status = 'canceled'
        elif status == 'c':
            status = 'canceled'
        elif status == 'd':
            status = 'closed'
        price = self.safe_float(order, 'price')
        amount = self.safe_float(order, 'amount')
        remaining = self.safe_float(order, 'pending')
        if not remaining:
            remaining = self.safe_float(order, 'remains')
        filled = amount - remaining
        fee = None
        cost = None
        if market:
            symbol = market['symbol']
            cost = self.safe_float(order, 'ta:' + market['quote'])
            baseFee = 'fa:' + market['base']
            quoteFee = 'fa:' + market['quote']
            feeRate = self.safe_float(order, 'tradingFeeMaker')
            if not feeRate:
                feeRate = self.safe_float(order, 'tradingFeeTaker', feeRate)
            if feeRate:
                feeRate /= 100.0  # convert to mathematically-correct percentage coefficients: 1.0 = 100%
            if baseFee in order:
                fee = {
                    'currency': market['base'],
                    'rate': feeRate,
                    'cost': self.safe_float(order, baseFee),
                }
            elif quoteFee in order:
                fee = {
                    'currency': market['quote'],
                    'rate': feeRate,
                    'cost': self.safe_float(order, quoteFee),
                }
        if not cost:
            cost = price * filled
        return {
            'id': order['id'],
            'datetime': self.iso8601(timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': None,
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': None,
            'fee': fee,
            'info': order,
        }

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        request = {}
        method = 'privatePostOpenOrders'
        market = None
        if symbol:
            market = self.market(symbol)
            request['pair'] = market['id']
            method += 'Pair'
        orders = await getattr(self, method)(self.extend(request, params))
        for i in range(0, len(orders)):
            orders[i] = self.extend(orders[i], {'status': 'open'})
        return self.parse_orders(orders, market, since, limit)

    async def fetch_order(self, id, symbol=None, params={}):
        await self.load_markets()
        response = await self.privatePostGetOrder(self.extend({
            'id': str(id),
        }, params))
        return self.parse_order(response)

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
            nonce = str(self.nonce())
            auth = nonce + self.uid + self.apiKey
            signature = self.hmac(self.encode(auth), self.encode(self.secret))
            body = self.urlencode(self.extend({
                'key': self.apiKey,
                'signature': signature.upper(),
                'nonce': nonce,
            }, query))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if not response:
            raise ExchangeError(self.id + ' returned ' + self.json(response))
        elif response is True:
            return response
        elif 'e' in response:
            if 'ok' in response:
                if response['ok'] == 'ok':
                    return response
            raise ExchangeError(self.id + ' ' + self.json(response))
        elif 'error' in response:
            if response['error']:
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
