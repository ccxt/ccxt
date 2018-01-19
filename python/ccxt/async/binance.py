# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import math
import json
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import InvalidOrder
from ccxt.base.errors import OrderNotFound
from ccxt.base.errors import DDoSProtection


class binance (Exchange):

    def describe(self):
        return self.deep_extend(super(binance, self).describe(), {
            'id': 'binance',
            'name': 'Binance',
            'countries': 'JP',  # Japan
            'rateLimit': 500,
            'hasCORS': False,
            # obsolete metainfo interface
            'hasFetchBidsAsks': True,
            'hasFetchTickers': True,
            'hasFetchOHLCV': True,
            'hasFetchMyTrades': True,
            'hasFetchOrder': True,
            'hasFetchOrders': True,
            'hasFetchOpenOrders': True,
            'hasWithdraw': True,
            # new metainfo interface
            'has': {
                'fetchBidsAsks': True,
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
                    'wapi': 'https://api.binance.com/wapi/v3',
                    'public': 'https://api.binance.com/api/v1',
                    'private': 'https://api.binance.com/api/v3',
                    'v3': 'https://api.binance.com/api/v3',
                    'v1': 'https://api.binance.com/api/v1',
                },
                'www': 'https://www.binance.com',
                'doc': 'https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md',
                'fees': [
                    'https://binance.zendesk.com/hc/en-us/articles/115000429332',
                    'https://support.binance.com/hc/en-us/articles/115000583311',
                ],
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
                    ],
                    'get': [
                        'depositHistory',
                        'withdrawHistory',
                        'depositAddress',
                    ],
                },
                'v3': {
                    'get': [
                        'ticker/price',
                        'ticker/bookTicker',
                    ],
                },
                'public': {
                    'get': [
                        'exchangeInfo',
                        'ping',
                        'time',
                        'depth',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/allPrices',
                        'ticker/allBookTickers',
                        'ticker/price',
                        'ticker/bookTicker',
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
                    ],
                    'delete': [
                        'order',
                    ],
                },
                'v1': {
                    'put': ['userDataStream'],
                    'post': ['userDataStream'],
                    'delete': ['userDataStream'],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': False,
                    'percentage': True,
                    'taker': 0.001,
                    'maker': 0.001,
                },
                'funding': {
                    'tierBased': False,
                    'percentage': False,
                    'withdraw': {
                        'BNB': 1.0,
                        'BTC': 0.001,
                        'ETH': 0.01,
                        'LTC': 0.01,
                        'NEO': 0.0,
                        'QTUM': 0.01,
                        'SNT': 10.0,
                        'BNT': 1.2,
                        'EOS': 0.7,
                        'BCH': 0.0005,
                        'GAS': 0.0,
                        'USDT': 25.0,
                        'OAX': 6.0,
                        'DNT': 60.0,
                        'MCO': 0.3,
                        'ICN': 2.0,
                        'WTC': 0.4,
                        'OMG': 0.3,
                        'ZRX': 10.0,
                        'STRAT': 0.1,
                        'SNGLS': 20.0,
                        'BQX': 2.0,
                        'KNC': 2.0,
                        'FUN': 80.0,
                        'SNM': 20.0,
                        'LINK': 10.0,
                        'XVG': 0.1,
                        'CTR': 7.0,
                        'SALT': 0.4,
                        'IOTA': 0.5,
                        'MDA': 2.0,
                        'MTL': 0.5,
                        'SUB': 4.0,
                        'ETC': 0.01,
                        'MTH': 35.0,
                        'ENG': 5.0,
                        'AST': 10.0,
                        'BTG': None,
                        'DASH': 0.002,
                        'EVX': 2.5,
                        'REQ': 15.0,
                        'LRC': 12.0,
                        'VIB': 20.0,
                        'HSR': 0.0001,
                        'TRX': 30.0,
                        'POWR': 5.0,
                        'ARK': 0.1,
                        'YOYO': 10.0,
                        'XRP': 0.15,
                        'MOD': 2.0,
                        'ENJ': 80.0,
                        'STORJ': 3.0,
                        'VEN': 5.0,
                        'KMD': 1.0,
                        'NULS': 4.0,
                        'RCN': 20.0,
                        'RDN': 0.3,
                        'XMR': 0.04,
                        'DLT': 15.0,
                        'AMB': 10.0,
                        'BAT': 15.0,
                        'ZEC': 0.005,
                        'BCPT': 14.0,
                        'ARN': 7.0,
                        'GVT': 0.5,
                        'CDT': 35.0,
                        'GXS': 0.3,
                        'POE': 50.0,
                        'QSP': 30.0,
                        'BTS': 1.0,
                        'XZC': 0.02,
                        'LSK': 0.1,
                        'TNT': 35.0,
                        'FUEL': 60.0,
                        'MANA': 30.0,
                        'BCD': 0.0005,
                        'DGD': 0.03,
                        'ADX': 2.0,
                        'ADA': 1.0,
                        'PPT': 0.1,
                        'CMT': 15.0,
                        'XLM': 0.01,
                        'CND': 180.0,
                        'LEND': 50.0,
                        'WABI': 4.0,
                        'TNB': 70.0,
                        'WAVES': 0.002,
                        'ICX': 1.5,
                        'GTO': 30.0,
                        'OST': 15.0,
                        'ELF': 2.0,
                        'AION': 1.0,
                        'NEBL': 0.01,
                        'BRD': 3.0,
                        'EDO': 1.5,
                        'WINGS': 3.0,
                        'NAV': 0.2,
                        'LUN': 0.3,
                        'TRIG': 5.0,
                    },
                    'deposit': {
                        'BNB': 0,
                        'BTC': 0,
                        'ETH': 0,
                        'LTC': 0,
                        'NEO': 0,
                        'QTUM': 0,
                        'SNT': 0,
                        'BNT': 0,
                        'EOS': 0,
                        'BCH': 0,
                        'GAS': 0,
                        'USDT': 0,
                        'OAX': 0,
                        'DNT': 0,
                        'MCO': 0,
                        'ICN': 0,
                        'WTC': 0,
                        'OMG': 0,
                        'ZRX': 0,
                        'STRAT': 0,
                        'SNGLS': 0,
                        'BQX': 0,
                        'KNC': 0,
                        'FUN': 0,
                        'SNM': 0,
                        'LINK': 0,
                        'XVG': 0,
                        'CTR': 0,
                        'SALT': 0,
                        'IOTA': 0,
                        'MDA': 0,
                        'MTL': 0,
                        'SUB': 0,
                        'ETC': 0,
                        'MTH': 0,
                        'ENG': 0,
                        'AST': 0,
                        'BTG': 0,
                        'DASH': 0,
                        'EVX': 0,
                        'REQ': 0,
                        'LRC': 0,
                        'VIB': 0,
                        'HSR': 0,
                        'TRX': 0,
                        'POWR': 0,
                        'ARK': 0,
                        'YOYO': 0,
                        'XRP': 0,
                        'MOD': 0,
                        'ENJ': 0,
                        'STORJ': 0,
                    },
                },
            },
        })

    async def fetch_markets(self):
        response = await self.publicGetExchangeInfo()
        markets = response['symbols']
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = market['symbol']
            if id == '123456':
                continue
            baseId = market['baseAsset']
            quoteId = market['quoteAsset']
            base = self.common_currency_code(baseId)
            quote = self.common_currency_code(quoteId)
            symbol = base + '/' + quote
            filters = self.index_by(market['filters'], 'filterType')
            precision = {
                'base': market['baseAssetPrecision'],
                'quote': market['quotePrecision'],
                'amount': market['baseAssetPrecision'],
                'price': market['quotePrecision'],
            }
            active = (market['status'] == 'TRADING')
            lot = -1 * math.log10(precision['amount'])
            entry = self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'lot': lot,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': None,
                    },
                    'price': {
                        'min': -1 * math.log10(precision['price']),
                        'max': None,
                    },
                    'cost': {
                        'min': lot,
                        'max': None,
                    },
                },
            })
            if 'PRICE_FILTER' in filters:
                filter = filters['PRICE_FILTER']
                entry['precision']['price'] = self.precision_from_string(filter['tickSize'])
                entry['limits']['price'] = {
                    'min': float(filter['minPrice']),
                    'max': float(filter['maxPrice']),
                }
            if 'LOT_SIZE' in filters:
                filter = filters['LOT_SIZE']
                entry['precision']['amount'] = self.precision_from_string(filter['stepSize'])
                entry['lot'] = float(filter['stepSize'])
                entry['limits']['amount'] = {
                    'min': float(filter['minQty']),
                    'max': float(filter['maxQty']),
                }
            if 'MIN_NOTIONAL' in filters:
                entry['limits']['cost']['min'] = float(filters['MIN_NOTIONAL']['minNotional'])
            result.append(entry)
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
            'type': takerOrMaker,
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

    def parse_ticker(self, ticker, market=None):
        timestamp = self.safe_integer(ticker, 'closeTime')
        if timestamp is None:
            timestamp = self.milliseconds()
        symbol = ticker['symbol']
        if not market:
            if symbol in self.markets_by_id:
                market = self.markets_by_id[symbol]
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'highPrice'),
            'low': self.safe_float(ticker, 'lowPrice'),
            'bid': self.safe_float(ticker, 'bidPrice'),
            'bidVolume': self.safe_float(ticker, 'bidQty'),
            'ask': self.safe_float(ticker, 'askPrice'),
            'askVolume': self.safe_float(ticker, 'askQty'),
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

    def parse_tickers(self, rawTickers, symbols=None):
        tickers = []
        for i in range(0, len(rawTickers)):
            tickers.append(self.parse_ticker(rawTickers[i]))
        tickersBySymbol = self.index_by(tickers, 'symbol')
        # return all of them if no symbols were passed in the first argument
        if symbols is None:
            return tickersBySymbol
        # otherwise filter by symbol
        result = {}
        for i in range(0, len(symbols)):
            symbol = symbols[i]
            if symbol in tickersBySymbol:
                result[symbol] = tickersBySymbol[symbol]
        return result

    async def fetch_bid_asks(self, symbols=None, params={}):
        await self.load_markets()
        rawTickers = await self.publicGetTickerBookTicker(params)
        return self.parse_tickers(rawTickers, symbols)

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        rawTickers = await self.publicGetTicker24hr(params)
        return self.parse_tickers(rawTickers, symbols)

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
            request['endTime'] = since + 3600000
        if limit:
            request['limit'] = limit
        # 'fromId': 123,    # ID to get aggregate trades from INCLUSIVE.
        # 'startTime': 456,  # Timestamp in ms to get aggregate trades from INCLUSIVE.
        # 'endTime': 789,   # Timestamp in ms to get aggregate trades until INCLUSIVE.
        # 'limit': 500,     # default = maximum = 500
        response = await self.publicGetAggTrades(self.extend(request, params))
        return self.parse_trades(response, market, since, limit)

    def parse_order_status(self, status):
        if status == 'NEW':
            return 'open'
        if status == 'PARTIALLY_FILLED':
            return 'open'
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
        timestamp = None
        if 'time' in order:
            timestamp = order['time']
        elif 'transactTime' in order:
            timestamp = order['transactTime']
        else:
            raise ExchangeError(self.id + ' malformed order: ' + self.json(order))
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
            'quantity': self.amount_to_string(symbol, amount),
            'type': type.upper(),
            'side': side.upper(),
        }
        if type == 'limit':
            order = self.extend(order, {
                'price': self.price_to_precision(symbol, price),
                'timeInForce': 'GTC',  # 'GTC' = Good To Cancel(default), 'IOC' = Immediate Or Cancel
            })
        response = await self.privatePostOrder(self.extend(order, params))
        return self.parse_order(response)

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
        return self.parse_orders(response, market, since, limit)

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOpenOrders requires a symbol param')
        await self.load_markets()
        market = self.market(symbol)
        response = await self.privateGetOpenOrders(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_orders(response, market, since, limit)

    async def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        orders = await self.fetch_orders(symbol, since, limit, params)
        return self.filter_by(orders, 'status', 'closed')

    async def cancel_order(self, id, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' cancelOrder requires a symbol argument')
        await self.load_markets()
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
            raise ExchangeError(self.id + ' fetchMyTrades requires a symbol argument')
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
        }
        if limit:
            request['limit'] = limit
        response = await self.privateGetMyTrades(self.extend(request, params))
        return self.parse_trades(response, market, since, limit)

    def common_currency_code(self, currency):
        if currency == 'BCC':
            return 'BCH'
        return currency

    def currency_id(self, currency):
        if currency == 'BCH':
            return 'BCC'
        return currency

    async def fetch_deposit_address(self, currency, params={}):
        response = await self.wapiGetDepositAddress(self.extend({
            'asset': self.currency_id(currency),
        }, params))
        if 'success' in response:
            if response['success']:
                address = self.safe_string(response, 'address')
                tag = self.safe_string(response, 'addressTag')
                return {
                    'currency': currency,
                    'address': address,
                    'tag': tag,
                    'status': 'ok',
                    'info': response,
                }
        raise ExchangeError(self.id + ' fetchDepositAddress failed: ' + self.last_http_response)

    async def withdraw(self, currency, amount, address, tag=None, params={}):
        request = {
            'asset': self.currency_id(currency),
            'address': address,
            'amount': float(amount),
            'name': address,
        }
        if tag:
            request['addressTag'] = tag
        response = await self.wapiPostWithdraw(self.extend(request, params))
        return {
            'info': response,
            'id': self.safe_string(response, 'id'),
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        url += '/' + path
        if api == 'wapi':
            url += '.html'
        # v1 special case for userDataStream
        if path == 'userDataStream':
            body = self.urlencode(params)
            headers = {
                'X-MBX-APIKEY': self.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        elif (api == 'private') or (api == 'wapi'):
            self.check_required_credentials()
            nonce = self.milliseconds()
            query = self.urlencode(self.extend({
                'timestamp': nonce,
                'recvWindow': 100000,
            }, params))
            signature = self.hmac(self.encode(query), self.encode(self.secret))
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
        if code >= 400:
            if code == 418:
                raise DDoSProtection(self.id + ' ' + str(code) + ' ' + reason + ' ' + body)
            if body.find('Price * QTY is zero or less') >= 0:
                raise InvalidOrder(self.id + ' order cost = amount * price is zero or less ' + body)
            if body.find('MIN_NOTIONAL') >= 0:
                raise InvalidOrder(self.id + ' order cost = amount * price is too small ' + body)
            if body.find('LOT_SIZE') >= 0:
                raise InvalidOrder(self.id + ' order amount should be evenly divisible by lot size, use self.amount_to_lots(symbol, amount) ' + body)
            if body.find('PRICE_FILTER') >= 0:
                raise InvalidOrder(self.id + ' order price exceeds allowed price precision or invalid, use self.price_to_precision(symbol, amount) ' + body)
            if body.find('Order does not exist') >= 0:
                raise OrderNotFound(self.id + ' ' + body)
        if body[0] == '{':
            response = json.loads(body)
            error = self.safe_value(response, 'code')
            if error is not None:
                if error == -2010:
                    raise InsufficientFunds(self.id + ' ' + self.json(response))
                elif error == -2011:
                    raise OrderNotFound(self.id + ' ' + self.json(response))
                elif error == -1013:  # Invalid quantity
                    raise InvalidOrder(self.id + ' ' + self.json(response))
