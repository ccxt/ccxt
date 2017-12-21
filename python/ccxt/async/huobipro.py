# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import hashlib
import math
from ccxt.base.errors import ExchangeError


class huobipro (Exchange):

    def describe(self):
        return self.deep_extend(super(huobipro, self).describe(), {
            'id': 'huobipro',
            'name': 'Huobi Pro',
            'countries': 'CN',
            'rateLimit': 2000,
            'userAgent': self.userAgents['chrome39'],
            'version': 'v1',
            'accounts': None,
            'accountsById': None,
            'hostname': 'api.huobi.pro',
            'hasCORS': False,
            # obsolete metainfo structure
            'hasFetchOHLCV': True,
            'hasFetchOrders': True,
            'hasFetchOpenOrders': True,
            # new metainfo structure
            'has': {
                'fetchOHCLV': True,
                'fetchOrders': True,
                'fetchOpenOrders': True,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '60min',
                '1d': '1day',
                '1w': '1week',
                '1M': '1mon',
                '1y': '1year',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api': 'https://api.huobi.pro',
                'www': 'https://www.huobi.pro',
                'doc': 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
            },
            'api': {
                'market': {
                    'get': [
                        'history/kline',  # 获取K线数据
                        'detail/merged',  # 获取聚合行情(Ticker)
                        'depth',  # 获取 Market Depth 数据
                        'trade',  # 获取 Trade Detail 数据
                        'history/trade',  # 批量获取最近的交易记录
                        'detail',  # 获取 Market Detail 24小时成交量数据
                    ],
                },
                'public': {
                    'get': [
                        'common/symbols',  # 查询系统支持的所有交易对
                        'common/currencys',  # 查询系统支持的所有币种
                        'common/timestamp',  # 查询系统当前时间
                    ],
                },
                'private': {
                    'get': [
                        'account/accounts',  # 查询当前用户的所有账户(即account-id)
                        'account/accounts/{id}/balance',  # 查询指定账户的余额
                        'order/orders/{id}',  # 查询某个订单详情
                        'order/orders/{id}/matchresults',  # 查询某个订单的成交明细
                        'order/orders',  # 查询当前委托、历史委托
                        'order/matchresults',  # 查询当前成交、历史成交
                        'dw/withdraw-virtual/addresses',  # 查询虚拟币提现地址
                    ],
                    'post': [
                        'order/orders/place',  # 创建并执行一个新订单(一步下单， 推荐使用)
                        'order/orders',  # 创建一个新的订单请求 （仅创建订单，不执行下单）
                        'order/orders/{id}/place',  # 执行一个订单 （仅执行已创建的订单）
                        'order/orders/{id}/submitcancel',  # 申请撤销一个订单请求
                        'order/orders/batchcancel',  # 批量撤销订单
                        'dw/balance/transfer',  # 资产划转
                        'dw/withdraw-virtual/create',  # 申请提现虚拟币
                        'dw/withdraw-virtual/{id}/place',  # 确认申请虚拟币提现
                        'dw/withdraw-virtual/{id}/cancel',  # 申请取消提现虚拟币
                    ],
                },
            },
        })

    async def fetch_markets(self):
        response = await self.publicGetCommonSymbols()
        markets = response['data']
        numMarkets = len(markets)
        if numMarkets < 1:
            raise ExchangeError(self.id + ' publicGetCommonSymbols returned empty response: ' + self.json(response))
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            baseId = market['base-currency']
            quoteId = market['quote-currency']
            base = baseId.upper()
            quote = quoteId.upper()
            id = baseId + quoteId
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            precision = {
                'amount': market['amount-precision'],
                'price': market['price-precision'],
            }
            lot = math.pow(10, -precision['amount'])
            maker = 0 if (base == 'OMG') else 0.2 / 100
            taker = 0 if (base == 'OMG') else 0.2 / 100
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'lot': lot,
                'precision': precision,
                'taker': taker,
                'maker': maker,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': math.pow(10, precision['amount']),
                    },
                    'price': {
                        'min': math.pow(10, -precision['price']),
                        'max': None,
                    },
                    'cost': {
                        'min': 0,
                        'max': None,
                    },
                },
                'info': market,
            })
        return result

    def parse_ticker(self, ticker, market=None):
        symbol = None
        if market:
            symbol = market['symbol']
        last = None
        if 'last' in ticker:
            last = ticker['last']
        timestamp = self.milliseconds()
        if 'ts' in ticker:
            timestamp = ticker['ts']
        bid = None
        ask = None
        if 'bid' in ticker:
            if ticker['bid']:
                bid = self.safe_float(ticker['bid'], 0)
        if 'ask' in ticker:
            if ticker['ask']:
                ask = self.safe_float(ticker['ask'], 0)
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': bid,
            'ask': ask,
            'vwap': None,
            'open': ticker['open'],
            'close': ticker['close'],
            'first': None,
            'last': last,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker['amount']),
            'quoteVolume': ticker['vol'],
            'info': ticker,
        }

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.marketGetDepth(self.extend({
            'symbol': market['id'],
            'type': 'step0',
        }, params))
        if 'tick' in response:
            if not response['tick']:
                raise ExchangeError(self.id + ' fetchOrderBook() returned empty response: ' + self.json(response))
            return self.parse_order_book(response['tick'], response['tick']['ts'])
        raise ExchangeError(self.id + ' fetchOrderBook() returned unrecognized response: ' + self.json(response))

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.marketGetDetailMerged(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_ticker(response['tick'], market)

    def parse_trade(self, trade, market):
        timestamp = trade['ts']
        return {
            'info': trade,
            'id': str(trade['id']),
            'order': None,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': trade['direction'],
            'price': trade['price'],
            'amount': trade['amount'],
        }

    def parse_trades_data(self, data, market, since=None, limit=None):
        result = []
        for i in range(0, len(data)):
            trades = self.parse_trades(data[i]['data'], market, since, limit)
            for k in range(0, len(trades)):
                result.append(trades[k])
        return result

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.marketGetHistoryTrade(self.extend({
            'symbol': market['id'],
            'size': 2000,
        }, params))
        return self.parse_trades_data(response['data'], market, since, limit)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return [
            ohlcv['id'] * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['vol'],
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.marketGetHistoryKline(self.extend({
            'symbol': market['id'],
            'period': self.timeframes[timeframe],
            'size': 2000,  # max = 2000
        }, params))
        return self.parse_ohlcvs(response['data'], market, timeframe, since, limit)

    async def load_accounts(self, reload=False):
        if reload:
            self.accounts = await self.fetch_accounts()
        else:
            if self.accounts:
                return self.accounts
            else:
                self.accounts = await self.fetch_accounts()
                self.accountsById = self.index_by(self.accounts, 'id')
        return self.accounts

    async def fetch_accounts(self):
        await self.load_markets()
        response = await self.privateGetAccountAccounts()
        return response['data']

    async def fetch_balance(self, params={}):
        await self.load_markets()
        await self.load_accounts()
        response = await self.privateGetAccountAccountsIdBalance(self.extend({
            'id': self.accounts[0]['id'],
        }, params))
        balances = response['data']['list']
        result = {'info': response}
        for i in range(0, len(balances)):
            balance = balances[i]
            uppercase = balance['currency'].upper()
            currency = self.common_currency_code(uppercase)
            account = None
            if currency in result:
                account = result[currency]
            else:
                account = self.account()
            if balance['type'] == 'trade':
                account['free'] = float(balance['balance'])
            if balance['type'] == 'frozen':
                account['used'] = float(balance['balance'])
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOrders() requires a symbol parameter')
        self.load_markets()
        market = self.market(symbol)
        status = None
        if 'type' in params:
            status = params['type']
        elif 'status' in params:
            status = params['status']
        else:
            raise ExchangeError(self.id + ' fetchOrders() requires type param or status param for spot market ' + symbol + '(0 or "open" for unfilled or partial filled orders, 1 or "closed" for filled orders)')
        if (status == 0) or (status == 'open'):
            status = 'submitted,partial-filled'
        elif (status == 1) or (status == 'closed'):
            status = 'filled,partial-canceled'
        else:
            raise ExchangeError(self.id + ' fetchOrders() wrong type param or status param for spot market ' + symbol + '(0 or "open" for unfilled or partial filled orders, 1 or "closed" for filled orders)')
        response = await self.privateGetOrderOrders(self.extend({
            'symbol': market['id'],
            'states': status,
        }))
        return self.parse_orders(response['data'], market, since, limit)

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        open = 0  # 0 for unfilled orders, 1 for filled orders
        return self.fetch_orders(symbol, None, None, self.extend({
            'status': open,
        }, params))

    def parse_order_status(self, status):
        if status == 'partial-filled':
            return 'open'
        elif status == 'filled':
            return 'closed'
        elif status == 'canceled':
            return 'canceled'
        elif status == 'submitted':
            return 'open'
        return status

    def parse_order(self, order, market=None):
        side = None
        type = None
        status = None
        if 'type' in order:
            orderType = order['type'].split('-')
            side = orderType[0]
            type = orderType[1]
            status = self.parse_order_status(order['state'])
        symbol = None
        if not market:
            if 'symbol' in order:
                if order['symbol'] in self.markets_by_id:
                    marketId = order['symbol']
                    market = self.markets_by_id[marketId]
        if market:
            symbol = market['symbol']
        timestamp = order['created-at']
        amount = float(order['amount'])
        filled = float(order['field-amount'])
        remaining = amount - filled
        price = float(order['price'])
        cost = float(order['field-cash-amount'])
        average = 0
        if filled:
            average = float(cost / filled)
        result = {
            'info': order,
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': None,
        }
        return result

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        await self.load_accounts()
        market = self.market(symbol)
        order = {
            'account-id': self.accounts[0]['id'],
            'amount': self.amount_to_precision(symbol, amount),
            'symbol': market['id'],
            'type': side + '-' + type,
        }
        if type == 'limit':
            order['price'] = self.price_to_precision(symbol, price)
        response = await self.privatePostOrderOrdersPlace(self.extend(order, params))
        return {
            'info': response,
            'id': response['data'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        return await self.privatePostOrderOrdersIdSubmitcancel({'id': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = '/'
        if api == 'market':
            url += api
        else:
            url += self.version
        url += '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'private':
            self.check_required_credentials()
            timestamp = self.YmdHMS(self.milliseconds(), 'T')
            request = self.keysort(self.extend({
                'SignatureMethod': 'HmacSHA256',
                'SignatureVersion': '2',
                'AccessKeyId': self.apiKey,
                'Timestamp': timestamp,
            }, query))
            auth = self.urlencode(request)
            payload = "\n".join([method, self.hostname, url, auth])
            signature = self.hmac(self.encode(payload), self.encode(self.secret), hashlib.sha256, 'base64')
            auth += '&' + self.urlencode({'Signature': signature})
            url += '?' + auth
            if method == 'POST':
                body = self.json(query)
                headers = {
                    'Content-Type': 'application/json',
                }
        else:
            if params:
                url += '?' + self.urlencode(params)
        url = self.urls['api'] + url
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'status' in response:
            if response['status'] == 'error':
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
