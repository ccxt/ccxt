# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import InvalidOrder
from ccxt.base.errors import OrderNotFound


class binance (Exchange):

    def describe(self):
        return self.deep_extend(super(binance, self).describe(), {
            'id': 'binance',
            'name': 'Binance',
            'countries': 'CN',  # China
            'rateLimit': 500,
            'version': 'v1',
            'hasCORS': False,
            # obsolete metainfo interface
            'hasFetchTickers': True,
            'hasFetchOHLCV': True,
            'hasFetchMyTrades': True,
            'hasFetchOrder': True,
            'hasFetchOrders': True,
            'hasFetchOpenOrders': True,
            'hasWithdraw': True,
            # new metainfo interface
            'has': {
                'fetchTickers': True,
                'fetchOHLCV': True,
                'fetchMyTrades': True,
                'fetchOrder': True,
                'fetchOrders': True,
                'fetchOpenOrders': True,
                'withdraw': True,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'web': 'https://www.binance.com',
                    'wapi': 'https://www.binance.com/wapi',
                    'public': 'https://api.binance.com/api',
                    'private': 'https://api.binance.com/api',
                },
                'www': 'https://www.binance.com',
                'doc': 'https://www.binance.com/restapipub.html',
                'fees': 'https://binance.zendesk.com/hc/en-us/articles/115000429332',
            },
            'api': {
                'web': {
                    'get': [
                        'exchange/public/product',
                    ],
                },
                'wapi': {
                    'post': [
                        'withdraw',
                        'getDepositHistory',
                        'getWithdrawHistory',
                    ],
                },
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'depth',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/allPrices',
                        'ticker/allBookTickers',
                    ],
                },
                'private': {
                    'get': [
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades',
                    ],
                    'post': [
                        'order',
                        'order/test',
                        'userDataStream',
                    ],
                    'put': [
                        'userDataStream'
                    ],
                    'delete': [
                        'order',
                        'userDataStream',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.001,
                    'maker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BNB': 1.0,
                        'BTC': 0.0005,
                        'ETH': 0.005,
                        'LTC': 0.001,
                        'NEO': 0.0,
                        'QTUM': 0.01,
                        'SNT': 50.0,
                        'BNT': 0.6,
                        'EOS': 2.0,
                        'BCH': 0.0005,
                        'GAS': 0.0,
                        'USDT': 5.0,
                        'OAX': 2.0,
                        'DNT': 30.0,
                        'MCO': 0.15,
                        'ICN': 0.5,
                        'WTC': 0.2,
                        'OMG': 0.1,
                        'ZRX': 5.0,
                        'STRAT': 0.1,
                        'SNGLS': 8.0,
                        'BQX': 2.0,
                        'KNC': 1.0,
                        'FUN': 50.0,
                        'SNM': 10.0,
                        'LINK': 5.0,
                        'XVG': 0.1,
                        'CTR': 1.0,
                        'SALT': 0.3,
                        'IOTA': 0.0,
                        'MDA': 0.5,
                        'MTL': 0.15,
                        'SUB': 10.0,
                        'ETC': 0.01,
                        'MTH': 10.0,
                        'ENG': 2.0,
                        'AST': 4.0,
                        'BTG': None,
                        'DASH': 0.002,
                        'EVX': 1.0,
                        'REQ': 30.0,
                        'LRC': 7.0,
                        'VIB': 7.0,
                        'HSR': 0.0001,
                        'TRX': 500.0,
                        'POWR': 15.0,
                        'ARK': 0.1,
                        'YOYO': 30.0,
                        'XRP': 0.15,
                        'MOD': 1.0,
                        'ENJ': 1.0,
                        'STORJ': 2.0,
                    },
                },
            },
        })

    async def fetch_markets(self):
        response = await self.webGetExchangePublicProduct()
        markets = response['data']
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = market['symbol']
            base = self.common_currency_code(market['baseAsset'])
            quote = self.common_currency_code(market['quoteAsset'])
            symbol = base + '/' + quote
            lot = float(market['minTrade'])
            tickSize = float(market['tickSize'])
            precision = {
                'amount': self.precision_from_string(market['tickSize']),
                'price': self.precision_from_string(market['tickSize']),
            }
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'lot': lot,
                'active': market['active'],
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': None,
                    },
                    'price': {
                        'min': tickSize,
                        'max': None,
                    },
                    'cost': {
                        'min': lot,
                        'max': None,
                    },
                },
            }))
        return result

    def calculate_fee(self, symbol, type, side, amount, price, takerOrMaker='taker', params={}):
        market = self.markets[symbol]
        key = 'quote'
        rate = market[takerOrMaker]
        cost = float(self.cost_to_precision(symbol, amount * rate))
        if side == 'sell':
            cost *= price
        else:
            key = 'base'
        return {
            'currency': market[key],
            'rate': rate,
            'cost': float(self.fee_to_precision(symbol, cost)),
        }

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privateGetAccount(params)
        result = {'info': response}
        balances = response['balances']
        for i in range(0, len(balances)):
            balance = balances[i]
            asset = balance['asset']
            currency = self.common_currency_code(asset)
            account = {
                'free': float(balance['free']),
                'used': float(balance['locked']),
                'total': 0.0,
            }
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        orderbook = await self.publicGetDepth(self.extend({
            'symbol': market['id'],
            'limit': 100,  # default = maximum = 100
        }, params))
        return self.parse_order_book(orderbook)

    def parse_ticker(self, ticker, market):
        timestamp = self.safe_integer(ticker, 'closeTime')
        if timestamp is None:
            timestamp = self.milliseconds()
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'highPrice'),
            'low': self.safe_float(ticker, 'lowPrice'),
            'bid': self.safe_float(ticker, 'bidPrice'),
            'ask': self.safe_float(ticker, 'askPrice'),
            'vwap': self.safe_float(ticker, 'weightedAvgPrice'),
            'open': self.safe_float(ticker, 'openPrice'),
            'close': self.safe_float(ticker, 'prevClosePrice'),
            'first': None,
            'last': self.safe_float(ticker, 'lastPrice'),
            'change': self.safe_float(ticker, 'priceChangePercent'),
            'percentage': None,
            'average': None,
            'baseVolume': self.safe_float(ticker, 'volume'),
            'quoteVolume': self.safe_float(ticker, 'quoteVolume'),
            'info': ticker,
        }

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetTicker24hr(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_ticker(response, market)

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        tickers = await self.publicGetTickerAllBookTickers(params)
        result = {}
        for i in range(0, len(tickers)):
            ticker = tickers[i]
            id = ticker['symbol']
            if id in self.markets_by_id:
                market = self.markets_by_id[id]
                symbol = market['symbol']
                result[symbol] = self.parse_ticker(ticker, market)
        return result

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return [
            ohlcv[0],
            float(ohlcv[1]),
            float(ohlcv[2]),
            float(ohlcv[3]),
            float(ohlcv[4]),
            float(ohlcv[5]),
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
            'interval': self.timeframes[timeframe],
        }
        request['limit'] = limit if (limit) else 500  # default == max == 500
        if since:
            request['startTime'] = since
        response = await self.publicGetKlines(self.extend(request, params))
        return self.parse_ohlcvs(response, market, timeframe, since, limit)

    def parse_trade(self, trade, market=None):
        timestampField = 'T' if ('T' in list(trade.keys())) else 'time'
        timestamp = trade[timestampField]
        priceField = 'p' if ('p' in list(trade.keys())) else 'price'
        price = float(trade[priceField])
        amountField = 'q' if ('q' in list(trade.keys())) else 'qty'
        amount = float(trade[amountField])
        idField = 'a' if ('a' in list(trade.keys())) else 'id'
        id = str(trade[idField])
        side = None
        order = None
        if 'orderId' in trade:
            order = str(trade['orderId'])
        if 'm' in trade:
            side = 'sell' if trade['m'] else 'buy'  # self is reversed intentionally
        else:
            side = 'buy' if (trade['isBuyer']) else 'sell'  # self is a True side
        fee = None
        if 'commission' in trade:
            fee = {
                'cost': float(trade['commission']),
                'currency': self.common_currency_code(trade['commissionAsset']),
            }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': order,
            'type': None,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'fee': fee,
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
        }
        if since:
            request['startTime'] = since
        if limit:
            request['limit'] = limit
        # 'fromId': 123,    # ID to get aggregate trades from INCLUSIVE.
        # 'startTime': 456,  # Timestamp in ms to get aggregate trades from INCLUSIVE.
        # 'endTime': 789,   # Timestamp in ms to get aggregate trades until INCLUSIVE.
        # 'limit': 500,     # default = maximum = 500
        response = await self.publicGetAggTrades(self.extend(request, params))
        return self.parse_trades(response, market)

    def parse_order_status(self, status):
        if status == 'NEW':
            return 'open'
        if status == 'PARTIALLY_FILLED':
            return 'partial'
        if status == 'FILLED':
            return 'closed'
        if status == 'CANCELED':
            return 'canceled'
        return status.lower()

    def parse_order(self, order, market=None):
        status = self.parse_order_status(order['status'])
        symbol = None
        if market:
            symbol = market['symbol']
        else:
            id = order['symbol']
            if id in self.markets_by_id:
                market = self.markets_by_id[id]
                symbol = market['symbol']
        timestamp = order['time']
        price = float(order['price'])
        amount = float(order['origQty'])
        filled = self.safe_float(order, 'executedQty', 0.0)
        remaining = max(amount - filled, 0.0)
        result = {
            'info': order,
            'id': str(order['orderId']),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': order['type'].lower(),
            'side': order['side'].lower(),
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': None,
        }
        return result

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        order = {
            'symbol': market['id'],
            'quantity': self.amount_to_precision(symbol, amount),
            'type': type.upper(),
            'side': side.upper(),
        }
        if type == 'limit':
            order = self.extend(order, {
                'price': self.price_to_precision(symbol, price),
                'timeInForce': 'GTC',  # 'GTC' = Good To Cancel(default), 'IOC' = Immediate Or Cancel
            })
        response = await self.privatePostOrder(self.extend(order, params))
        return {
            'info': response,
            'id': str(response['orderId']),
        }

    async def fetch_order(self, id, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOrder requires a symbol param')
        await self.load_markets()
        market = self.market(symbol)
        response = await self.privateGetOrder(self.extend({
            'symbol': market['id'],
            'orderId': int(id),
        }, params))
        return self.parse_order(response, market)

    async def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOrders requires a symbol param')
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
        }
        if limit:
            request['limit'] = limit
        response = await self.privateGetAllOrders(self.extend(request, params))
        return self.parse_orders(response, market)

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOpenOrders requires a symbol param')
        await self.load_markets()
        market = self.market(symbol)
        response = await self.privateGetOpenOrders(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_orders(response, market)

    async def cancel_order(self, id, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' cancelOrder requires a symbol param')
        market = self.market(symbol)
        response = None
        try:
            response = await self.privateDeleteOrder(self.extend({
                'symbol': market['id'],
                'orderId': int(id),
                # 'origClientOrderId': id,
            }, params))
        except Exception as e:
            if self.last_http_response.find('UNKNOWN_ORDER') >= 0:
                raise OrderNotFound(self.id + ' cancelOrder() error: ' + self.last_http_response)
            raise e
        return response

    def nonce(self):
        return self.milliseconds()

    async def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchMyTrades requires a symbol')
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
        }
        if limit:
            request['limit'] = limit
        response = await self.privateGetMyTrades(self.extend(request, params))
        return self.parse_trades(response, market)

    def common_currency_code(self, currency):
        if currency == 'BCC':
            return 'BCH'
        return currency

    def currency_id(self, currency):
        if currency == 'BCH':
            return 'BCC'
        return currency

    async def withdraw(self, currency, amount, address, params={}):
        response = await self.wapiPostWithdraw(self.extend({
            'asset': self.currency_id(currency),
            'address': address,
            'amount': float(amount),
            'recvWindow': 10000000,
        }, params))
        return {
            'info': response,
            'id': None,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        if api != 'web':
            url += '/' + self.version
        url += '/' + path
        if api == 'wapi':
            url += '.html'
        if (api == 'private') or (api == 'wapi'):
            self.check_required_credentials()
            nonce = self.nonce()
            query = self.urlencode(self.extend({'timestamp': nonce}, params))
            signature = None
            if api != 'wapi':
                auth = self.secret + '|' + query
                signature = self.hash(self.encode(auth), 'sha256')  # v1
            else:
                signature = self.hmac(self.encode(query), self.encode(self.secret))  # v3
            query += '&' + 'signature=' + signature
            headers = {
                'X-MBX-APIKEY': self.apiKey,
            }
            if (method == 'GET') or (api == 'wapi'):
                url += '?' + query
            else:
                body = query
                headers['Content-Type'] = 'application/x-www-form-urlencoded'
        else:
            if params:
                url += '?' + self.urlencode(params)
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def handle_errors(self, code, reason, url, method, headers, body):
        if body.find('MIN_NOTIONAL') >= 0:
            raise InvalidOrder(self.id + ' order cost = amount * price should be > 0.001 BTC ' + body)
        if body.find('LOT_SIZE') >= 0:
            raise InvalidOrder(self.id + ' order amount should be evenly divisible by lot size, use self.amount_to_lots(symbol, amount) ' + body)

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'code' in response:
            if response['code'] < 0:
                if response['code'] == -2010:
                    raise InsufficientFunds(self.id + ' ' + self.json(response))
                if response['code'] == -2011:
                    raise OrderNotFound(self.id + ' ' + self.json(response))
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
