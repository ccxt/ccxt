# -*- coding: utf-8 -*-

from ccxt.exchange import Exchange

class poloniex (Exchange):

    def describe(self):
        return self.deep_extend(super(poloniex, self).describe(), {
            'id': 'poloniex',
            'name': 'Poloniex',
            'countries': 'US',
            'rateLimit': 1000,  # up to 6 calls per second
            'hasCORS': True,
            'hasFetchMyTrades': True,
            'hasFetchOrder': True,
            'hasFetchOrders': True,
            'hasFetchOpenOrders': True,
            'hasFetchClosedOrders': True,
            'hasFetchTickers': True,
            'hasWithdraw': True,
            'hasFetchOHLCV': True,
            'timeframes': {
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg',
                'api': {
                    'public': 'https://poloniex.com/public',
                    'private': 'https://poloniex.com/tradingApi',
                },
                'www': 'https://poloniex.com',
                'doc': [
                    'https://poloniex.com/support/api/',
                    'http://pastebin.com/dMX7mZE0',
                ],
                'fees': 'https://poloniex.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'return24hVolume',
                        'returnChartData',
                        'returnCurrencies',
                        'returnLoanOrders',
                        'returnOrderBook',
                        'returnTicker',
                        'returnTradeHistory',
                    ],
                },
                'private': {
                    'post': [
                        'buy',
                        'cancelLoanOffer',
                        'cancelOrder',
                        'closeMarginPosition',
                        'createLoanOffer',
                        'generateNewAddress',
                        'getMarginPosition',
                        'marginBuy',
                        'marginSell',
                        'moveOrder',
                        'returnActiveLoans',
                        'returnAvailableAccountBalances',
                        'returnBalances',
                        'returnCompleteBalances',
                        'returnDepositAddresses',
                        'returnDepositsWithdrawals',
                        'returnFeeInfo',
                        'returnLendingHistory',
                        'returnMarginAccountSummary',
                        'returnOpenLoanOffers',
                        'returnOpenOrders',
                        'returnOrderTrades',
                        'returnTradableBalances',
                        'returnTradeHistory',
                        'sell',
                        'toggleAutoRenew',
                        'transferBalance',
                        'withdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0015,
                    'taker': 0.0025,
                },
                'funding': 0.0,
            },
            'limits': {
                'amount': {
                    'min': 0.00000001,
                    'max': 1000000000,
                },
                'price': {
                    'min': 0.00000001,
                    'max': 1000000000,
                },
                'cost': {
                    'min': 0.00000000,
                    'max': 1000000000,
            },
            'precision': {
                'amount': 8,
                'price': 8,
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
            'currency': market[key],
            'rate': rate,
            'cost': float(self.fee_to_precision(symbol, cost)),
        }

    def common_currency_code(self, currency):
        if currency == 'BTM':
            return 'Bitmark'
        return currency

    def parse_ohlcv(self, ohlcv, market=None, timeframe='5m', since=None, limit=None):
        return [
            ohlcv['date'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['volume'],
        ]

    async def fetch_ohlcv(self, symbol, timeframe='5m', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        if not since:
            since = 0
        request = {
            'currencyPair': market['id'],
            'period': self.timeframes[timeframe],
            'start': int(since / 1000),
        }
        if limit:
            request['end'] = self.sum(request['start'], limit * self.timeframes[timeframe])
        response = await self.publicGetReturnChartData(self.extend(request, params))
        return self.parse_ohlcvs(response, market, timeframe, since, limit)

    async def fetch_markets(self):
        markets = await self.publicGetReturnTicker()
        keys = list(markets.keys())
        result = []
        for p in range(0, len(keys)):
            id = keys[p]
            market = markets[id]
            quote, base = id.split('_')
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'lot': self.limits['amount']['min'],
                'info': market,
            }))
        return result

    async def fetch_balance(self, params={}):
        await self.load_markets()
        balances = await self.privatePostReturnCompleteBalances({
            'account': 'all',
        })
        result = {'info': balances}
        currencies = list(balances.keys())
        for c in range(0, len(currencies)):
            id = currencies[c]
            balance = balances[id]
            currency = self.common_currency_code(id)
            account = {
                'free': float(balance['available']),
                'used': float(balance['onOrders']),
                'total': 0.0,
            }
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_fees(self, params={}):
        await self.load_markets()
        fees = await self.privatePostReturnFeeInfo()
        return {
            'info': fees,
            'maker': float(fees['makerFee']),
            'taker': float(fees['takerFee']),
            'withdraw': 0.0,
        }

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        orderbook = await self.publicGetReturnOrderBook(self.extend({
            'currencyPair': self.market_id(symbol),
        }, params))
        return self.parse_order_book(orderbook)

    def parse_ticker(self, ticker, market=None):
        timestamp = self.milliseconds()
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high24hr']),
            'low': float(ticker['low24hr']),
            'bid': float(ticker['highestBid']),
            'ask': float(ticker['lowestAsk']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': float(ticker['percentChange']),
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker['quoteVolume']),
            'quoteVolume': float(ticker['baseVolume']),
            'info': ticker,
        }

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        tickers = await self.publicGetReturnTicker(params)
        ids = list(tickers.keys())
        result = {}
        for i in range(0, len(ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        tickers = await self.publicGetReturnTicker(params)
        ticker = tickers[market['id']]
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market=None):
        timestamp = self.parse8601(trade['date'])
        symbol = None
        if (not market) and('currencyPair' in list(trade.keys())):
            market = self.markets_by_id[trade['currencyPair']]['symbol']
        if market:
            symbol = market['symbol']
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'id': self.safe_string(trade, 'tradeID'),
            'order': self.safe_string(trade, 'orderNumber'),
            'type': 'limit',
            'side': trade['type'],
            'price': float(trade['rate']),
            'amount': float(trade['amount']),
        }

    async def fetch_trades(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        trades = await self.publicGetReturnTradeHistory(self.extend({
            'currencyPair': market['id'],
            'end': self.seconds(),  # last 50000 trades by default
        }, params))
        return self.parse_trades(trades, market)

    async def fetch_my_trades(self, symbol=None, params={}):
        await self.load_markets()
        market = None
        if symbol:
            market = self.market(symbol)
        pair = market['id'] if market else 'all'
        request = self.extend({
            'currencyPair': pair,
            # 'start': self.seconds() - 86400,  # last 24 hours by default
            # 'end': self.seconds(),  # last 50000 trades by default
        }, params)
        response = await self.privatePostReturnTradeHistory(request)
        result = []
        if market:
            result = self.parse_trades(response, market)
        else:
            if response:
                ids = list(response.keys())
                for i in range(0, len(ids)):
                    id = ids[i]
                    market = self.markets_by_id[id]
                    symbol = market['symbol']
                    trades = self.parse_trades(response[id], market)
                    for j in range(0, len(trades)):
                        result.append(trades[j])
        return result

    def parse_order(self, order, market=None):
        timestamp = self.safe_integer(order, 'timestamp')
        if not timestamp:
            timestamp = self.parse8601(order['date'])
        trades = None
        if 'resultingTrades' in order:
            trades = self.parse_trades(order['resultingTrades'], market)
        symbol = None
        if market:
            symbol = market['symbol']
        price = float(order['price'])
        cost = self.safe_float(order, 'total', 0.0)
        remaining = self.safe_float(order, 'amount')
        amount = self.safe_float(order, 'startingAmount', remaining)
        filled = amount - remaining
        return {
            'info': order,
            'id': order['orderNumber'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'status': order['status'],
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': None,
        }

    def parse_open_orders(self, orders, market, result=[]):
        for i in range(0, len(orders)):
            order = orders[i]
            extended = self.extend(order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            })
            result.append(self.parse_order(extended, market))
        return result

    async def fetch_orders(self, symbol=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        pair = market['id'] if market else 'all'
        response = await self.privatePostReturnOpenOrders(self.extend({
            'currencyPair': pair,
        }))
        openOrders = []
        if market:
            openOrders = self.parseOpenOrders(response, market, openOrders)
        else:
            marketIds = list(response.keys())
            for i in range(0, len(marketIds)):
                marketId = marketIds[i]
                orders = response[marketId]
                market = self.markets_by_id[marketId]
                openOrders = self.parseOpenOrders(orders, market, openOrders)
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
            if market:
                if order['symbol'] == symbol:
                    result.append(order)
            else:
                result.append(order)
        return result

    async def fetch_order(self, id, symbol=None, params={}):
        orders = await self.fetch_orders(symbol, params)
        for i in range(0, len(orders)):
            if orders[i]['id'] == id:
                return orders[i]
        return None

    def filter_orders_by_status(self, orders, status):
        result = []
        for i in range(0, len(orders)):
            if orders[i]['status'] == status:
                result.append(orders[i])
        return result

    async def fetch_open_orders(self, symbol=None, params={}):
        orders = await self.fetch_orders(symbol, params)
        return self.filterOrdersByStatus(orders, 'open')

    async def fetch_closed_orders(self, symbol=None, params={}):
        orders = await self.fetch_orders(symbol, params)
        return self.filterOrdersByStatus(orders, 'closed')

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        if type == 'market':
            raise ExchangeError(self.id + ' allows limit orders only')
        await self.load_markets()
        method = 'privatePost' + self.capitalize(side)
        market = self.market(symbol)
        price = float(price)
        amount = float(amount)
        response = await getattr(self, method)(self.extend({
            'currencyPair': market['id'],
            'rate': self.price_to_precision(symbol, price),
            'amount': self.amount_to_precision(symbol, amount),
        }, params))
        timestamp = self.milliseconds()
        order = self.parse_order(self.extend({
            'timestamp': timestamp,
            'status': 'open',
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
        }, response), market)
        id = order['id']
        self.orders[id] = order
        return self.extend({'info': response}, order)

    async def edit_order(self, id, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        price = float(price)
        amount = float(amount)
        request = {
            'orderNumber': id,
            'rate': self.price_to_precision(symbol, price),
            'amount': self.amount_to_precision(symbol, amount),
        }
        response = await self.privatePostMoveOrder(self.extend(request, params))
        result = None
        if id in self.orders:
            self.orders[id] = self.extend(self.orders[id], {
                'price': price,
                'amount': amount,
            })
            result = self.extend(self.orders[id], {'info': response})
        else:
            result = {
                'info': response,
                'id': response['orderNumber'],
            }
        return result

    async def cancel_order(self, id, symbol=None, params={}):
        await self.load_markets()
        response = None
        try:
            response = await self.privatePostCancelOrder(self.extend({
                'orderNumber': id,
            }, params))
            if id in self.orders:
                self.orders[id]['status'] = 'canceled'
        except Exception as e:
            if self.last_json_response:
                message = self.safe_string(self.last_json_response, 'error')
                if message.find('Invalid order') >= 0:
                    raise OrderNotFound(self.id + ' cancelOrder() error: ' + self.last_http_response)
            raise e
        return response

    async def fetch_order_status(self, id, symbol=None):
        await self.load_markets()
        orders = await self.fetch_open_orders(symbol)
        indexed = self.index_by(orders, 'id')
        return 'open' if (id in list(indexed.keys())) else 'closed'

    async def fetch_order_trades(self, id, symbol=None, params={}):
        await self.load_markets()
        trades = await self.privatePostReturnOrderTrades(self.extend({
            'orderNumber': id,
        }, params))
        return self.parse_trades(trades)

    async def withdraw(self, currency, amount, address, params={}):
        await self.load_markets()
        result = await self.privatePostWithdraw(self.extend({
            'currency': currency,
            'amount': amount,
            'address': address,
        }, params))
        return {
            'info': result,
            'id': result['response'],
        }

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        query = self.extend({'command': path}, params)
        if api == 'public':
            url += '?' + self.urlencode(query)
        else:
            query['nonce'] = self.nonce()
            body = self.urlencode(query)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': self.apiKey,
                'Sign': self.hmac(self.encode(body), self.encode(self.secret), hashlib.sha512),
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'error' in response:
            error = self.id + ' ' + self.json(response)
            failed = response['error'].find('Not enough') >= 0
            if failed:
                raise InsufficientFunds(error)
            raise ExchangeError(error)
        return response
