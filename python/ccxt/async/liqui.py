# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import OrderNotFound
from ccxt.base.errors import DDoSProtection


class liqui (Exchange):

    def describe(self):
        return self.deep_extend(super(liqui, self).describe(), {
            'id': 'liqui',
            'name': 'Liqui',
            'countries': 'UA',
            'rateLimit': 2500,
            'version': '3',
            'hasCORS': False,
            # obsolete metainfo interface
            'hasFetchOrder': True,
            'hasFetchOrders': True,
            'hasFetchOpenOrders': True,
            'hasFetchClosedOrders': True,
            'hasFetchTickers': True,
            'hasFetchMyTrades': True,
            'hasWithdraw': True,
            # new metainfo interface
            'has': {
                'fetchOrder': True,
                'fetchOrders': 'emulated',
                'fetchOpenOrders': True,
                'fetchClosedOrders': 'emulated',
                'fetchTickers': True,
                'fetchMyTrades': True,
                'withdraw': True,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
                'api': {
                    'public': 'https://api.liqui.io/api',
                    'private': 'https://api.liqui.io/tapi',
                },
                'www': 'https://liqui.io',
                'doc': 'https://liqui.io/api',
                'fees': 'https://liqui.io/fee',
            },
            'api': {
                'public': {
                    'get': [
                        'info',
                        'ticker/{pair}',
                        'depth/{pair}',
                        'trades/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'Trade',
                        'ActiveOrders',
                        'OrderInfo',
                        'CancelOrder',
                        'TradeHistory',
                        'TransHistory',
                        'CoinDepositAddress',
                        'WithdrawCoin',
                        'CreateCoupon',
                        'RedeemCoupon',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.0025,
                },
                'funding': 0.0,
            },
        })

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
            'cost': cost,
        }

    def common_currency_code(self, currency):
        if not self.substituteCommonCurrencyCodes:
            return currency
        if currency == 'XBT':
            return 'BTC'
        if currency == 'BCC':
            return 'BCH'
        if currency == 'DRK':
            return 'DASH'
        # they misspell DASH as dsh :/
        if currency == 'DSH':
            return 'DASH'
        return currency

    def get_base_quote_from_market_id(self, id):
        uppercase = id.upper()
        base, quote = uppercase.split('_')
        base = self.common_currency_code(base)
        quote = self.common_currency_code(quote)
        return [base, quote]

    async def fetch_markets(self):
        response = await self.publicGetInfo()
        markets = response['pairs']
        keys = list(markets.keys())
        result = []
        for p in range(0, len(keys)):
            id = keys[p]
            market = markets[id]
            base, quote = self.get_base_quote_from_market_id(id)
            symbol = base + '/' + quote
            precision = {
                'amount': self.safe_integer(market, 'decimal_places'),
                'price': self.safe_integer(market, 'decimal_places'),
            }
            amountLimits = {
                'min': self.safe_float(market, 'min_amount'),
                'max': self.safe_float(market, 'max_amount'),
            }
            priceLimits = {
                'min': self.safe_float(market, 'min_price'),
                'max': self.safe_float(market, 'max_price'),
            }
            costLimits = {
                'min': self.safe_float(market, 'min_total'),
            }
            limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            }
            active = (market['hidden'] == 0)
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'taker': market['fee'] / 100,
                'lot': amountLimits['min'],
                'precision': precision,
                'limits': limits,
                'info': market,
            }))
        return result

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privatePostGetInfo()
        balances = response['return']
        result = {'info': balances}
        funds = balances['funds']
        currencies = list(funds.keys())
        for c in range(0, len(currencies)):
            currency = currencies[c]
            uppercase = currency.upper()
            uppercase = self.common_currency_code(uppercase)
            total = None
            used = None
            if balances['open_orders'] == 0:
                total = funds[currency]
                used = 0.0
            account = {
                'free': funds[currency],
                'used': used,
                'total': total,
            }
            result[uppercase] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetDepthPair(self.extend({
            'pair': market['id'],
        }, params))
        market_id_in_reponse = (market['id'] in list(response.keys()))
        if not market_id_in_reponse:
            raise ExchangeError(self.id + ' ' + market['symbol'] + ' order book is empty or not available')
        orderbook = response[market['id']]
        result = self.parse_order_book(orderbook)
        result['bids'] = self.sort_by(result['bids'], 0, True)
        result['asks'] = self.sort_by(result['asks'], 0)
        return result

    def parse_ticker(self, ticker, market=None):
        timestamp = ticker['updated'] * 1000
        symbol = None
        if market:
            symbol = market['symbol']
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
            'percentage': None,
            'average': self.safe_float(ticker, 'avg'),
            'baseVolume': self.safe_float(ticker, 'vol_cur'),
            'quoteVolume': self.safe_float(ticker, 'vol'),
            'info': ticker,
        }

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        ids = None
        if not symbols:
            numIds = len(self.ids)
            if numIds > 256:
                raise ExchangeError(self.id + ' fetchTickers() requires symbols argument')
            ids = self.ids
        else:
            ids = self.market_ids(symbols)
        tickers = await self.publicGetTickerPair(self.extend({
            'pair': '-'.join(ids),
        }, params))
        result = {}
        keys = list(tickers.keys())
        for k in range(0, len(keys)):
            id = keys[k]
            ticker = tickers[id]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    async def fetch_ticker(self, symbol, params={}):
        tickers = await self.fetch_tickers([symbol], params)
        return tickers[symbol]

    def parse_trade(self, trade, market=None):
        timestamp = trade['timestamp'] * 1000
        side = trade['type']
        if side == 'ask':
            side = 'sell'
        if side == 'bid':
            side = 'buy'
        price = self.safe_float(trade, 'price')
        if 'rate' in trade:
            price = self.safe_float(trade, 'rate')
        id = self.safe_string(trade, 'tid')
        if 'trade_id' in trade:
            id = self.safe_string(trade, 'trade_id')
        order = self.safe_string(trade, self.get_order_id_key())
        if 'pair' in trade:
            marketId = trade['pair']
            market = self.markets_by_id[marketId]
        symbol = None
        if market:
            symbol = market['symbol']
        amount = trade['amount']
        type = 'limit'  # all trades are still limit trades
        fee = None
        # self is filled by fetchMyTrades() only
        # is_your_order is always False :\
        # isYourOrder = self.safe_value(trade, 'is_your_order')
        # takerOrMaker = 'taker'
        # if isYourOrder:
        #     takerOrMaker = 'maker'
        # fee = self.calculate_fee(symbol, type, side, amount, price, takerOrMaker)
        return {
            'id': id,
            'order': order,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'fee': fee,
            'info': trade,
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'pair': market['id'],
        }
        if limit:
            request['limit'] = limit
        response = await self.publicGetTradesPair(self.extend(request, params))
        return self.parse_trades(response[market['id']], market, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        if type == 'market':
            raise ExchangeError(self.id + ' allows limit orders only')
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'pair': market['id'],
            'type': side,
            'amount': self.amount_to_precision(symbol, amount),
            'rate': self.price_to_precision(symbol, price),
        }
        response = await self.privatePostTrade(self.extend(request, params))
        id = self.safe_string(response['return'], self.get_order_id_key())
        if not id:
            id = self.safe_string(response['return'], 'init_order_id')
        timestamp = self.milliseconds()
        price = float(price)
        amount = float(amount)
        order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'status': 'open',
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'remaining': amount,
            'filled': 0.0,
            'fee': None,
            # 'trades': self.parse_trades(order['trades'], market),
        }
        self.orders[id] = order
        return self.extend({'info': response}, order)

    def get_order_id_key(self):
        return 'order_id'

    async def cancel_order(self, id, symbol=None, params={}):
        await self.load_markets()
        response = None
        try:
            request = {}
            idKey = self.get_order_id_key()
            request[idKey] = id
            response = await self.privatePostCancelOrder(self.extend(request, params))
            if id in self.orders:
                self.orders[id]['status'] = 'canceled'
        except Exception as e:
            if self.last_json_response:
                message = self.safe_string(self.last_json_response, 'error')
                if message:
                    if message.find('not found') >= 0:
                        raise OrderNotFound(self.id + ' cancelOrder() error: ' + self.last_http_response)
            raise e
        return response

    def parse_order(self, order, market=None):
        id = str(order['id'])
        status = order['status']
        if status == 0:
            status = 'open'
        elif status == 1:
            status = 'closed'
        elif (status == 2) or (status == 3):
            status = 'canceled'
        timestamp = int(order['timestamp_created']) * 1000
        symbol = None
        if not market:
            market = self.markets_by_id[order['pair']]
        if market:
            symbol = market['symbol']
        remaining = self.safe_float(order, 'amount')
        amount = self.safe_float(order, 'start_amount', remaining)
        if amount is None:
            if id in self.orders:
                amount = self.safe_float(self.orders[id], 'amount')
        price = self.safe_float(order, 'rate')
        filled = None
        cost = None
        if amount is not None:
            if remaining is not None:
                filled = amount - remaining
                cost = price * filled
        fee = None
        result = {
            'info': order,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'status': status,
            'fee': fee,
        }
        return result

    def parse_orders(self, orders, market=None, since=None, limit=None):
        ids = list(orders.keys())
        result = []
        for i in range(0, len(ids)):
            id = ids[i]
            order = orders[id]
            extended = self.extend(order, {'id': id})
            result.append(self.parse_order(extended, market))
        return self.filter_by_since_limit(result, since, limit)

    async def fetch_order(self, id, symbol=None, params={}):
        await self.load_markets()
        response = await self.privatePostOrderInfo(self.extend({
            'order_id': int(id),
        }, params))
        id = str(id)
        newOrder = self.parse_order(self.extend({'id': id}, response['return'][id]))
        oldOrder = self.orders[id] if (id in list(self.orders.keys())) else {}
        self.orders[id] = self.extend(oldOrder, newOrder)
        return self.orders[id]

    async def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOrders requires a symbol')
        await self.load_markets()
        market = self.market(symbol)
        request = {'pair': market['id']}
        response = await self.privatePostActiveOrders(self.extend(request, params))
        openOrders = []
        if 'return' in response:
            openOrders = self.parse_orders(response['return'], market)
        for j in range(0, len(openOrders)):
            self.orders[openOrders[j]['id']] = openOrders[j]
        openOrdersIndexedById = self.index_by(openOrders, 'id')
        cachedOrderIds = list(self.orders.keys())
        result = []
        for k in range(0, len(cachedOrderIds)):
            id = cachedOrderIds[k]
            if id in openOrdersIndexedById:
                self.orders[id] = self.extend(self.orders[id], openOrdersIndexedById[id])
            else:
                order = self.orders[id]
                if order['status'] == 'open':
                    self.orders[id] = self.extend(order, {
                        'status': 'closed',
                        'cost': order['amount'] * order['price'],
                        'filled': order['amount'],
                        'remaining': 0.0,
                    })
            order = self.orders[id]
            if order['symbol'] == symbol:
                result.append(order)
        return self.filter_by_since_limit(result, since, limit)

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        orders = await self.fetch_orders(symbol, since, limit, params)
        result = []
        for i in range(0, len(orders)):
            if orders[i]['status'] == 'open':
                result.append(orders[i])
        return result

    async def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        orders = await self.fetch_orders(symbol, since, limit, params)
        result = []
        for i in range(0, len(orders)):
            if orders[i]['status'] == 'closed':
                result.append(orders[i])
        return result

    async def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        market = None
        request = {
            # 'from': 123456789,  # trade ID, from which the display starts numerical 0
            # 'count': 1000,  # the number of trades for display numerical, default = 1000
            # 'from_id': trade ID, from which the display starts numerical 0
            # 'end_id': trade ID on which the display ends numerical ∞
            # 'order': 'ASC',  # sorting, default = DESC
            # 'since': 1234567890,  # UTC start time, default = 0
            # 'end': 1234567890,  # UTC end time, default = ∞
            # 'pair': 'eth_btc',  # default = all markets
        }
        if symbol:
            market = self.market(symbol)
            request['pair'] = market['id']
        if limit:
            request['count'] = int(limit)
        if since:
            request['since'] = int(since / 1000)
        response = await self.privatePostTradeHistory(self.extend(request, params))
        trades = []
        if 'return' in response:
            trades = response['return']
        return self.parse_trades(trades, market, since, limit)

    async def withdraw(self, currency, amount, address, params={}):
        await self.load_markets()
        response = await self.privatePostWithdrawCoin(self.extend({
            'coinName': currency,
            'amount': float(amount),
            'address': address,
        }, params))
        return {
            'info': response,
            'id': response['return']['tId'],
        }

    def sign_body_with_secret(self, body):
        return self.hmac(self.encode(body), self.encode(self.secret), hashlib.sha512)

    def get_version_string(self):
        return '/' + self.version

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        query = self.omit(params, self.extract_params(path))
        if api == 'private':
            self.check_required_credentials()
            nonce = self.nonce()
            body = self.urlencode(self.extend({
                'nonce': nonce,
                'method': path,
            }, query))
            signature = self.sign_body_with_secret(body)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': self.apiKey,
                'Sign': signature,
            }
        else:
            url += self.get_version_string() + '/' + self.implode_params(path, params)
            if query:
                url += '?' + self.urlencode(query)
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'success' in response:
            if not response['success']:
                if response['error'].find('Not enougth') >= 0:  # not enougTh is a typo inside Liqui's own API...
                    raise InsufficientFunds(self.id + ' ' + self.json(response))
                elif response['error'] == 'Requests too often':
                    raise DDoSProtection(self.id + ' ' + self.json(response))
                elif (response['error'] == 'not available') or (response['error'] == 'external service unavailable'):
                    raise DDoSProtection(self.id + ' ' + self.json(response))
                else:
                    raise ExchangeError(self.id + ' ' + self.json(response))
        return response
