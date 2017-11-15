# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError


class zb (Exchange):

    def describe(self):
        return self.deep_extend(super(zb, self).describe(), {
            'id': 'zb',
            'name': 'ZB',
            'countries': 'CN',
            'rateLimit': 1000,
            'version': 'v1',
            'hasCORS': False,
            'hasFetchOrder': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg',
                'api': {
                    'public': 'http://api.zb.com/data',  # no https for public API
                    'private': 'https://trade.zb.com/api',
                },
                'www': 'https://trade.zb.com/api',
                'doc': 'https://www.zb.com/i/developer',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                    ],
                },
                'private': {
                    'post': [
                        'order',
                        'cancelOrder',
                        'getOrder',
                        'getOrders',
                        'getOrdersNew',
                        'getOrdersIgnoreTradeType',
                        'getUnfinishedOrdersIgnoreTradeType',
                        'getAccountInfo',
                        'getUserAddress',
                        'getWithdrawAddress',
                        'getWithdrawRecord',
                        'getChargeRecord',
                        'getCnyWithdrawRecord',
                        'getCnyChargeRecord',
                        'withdraw',
                    ],
                },
            },
        })

    async def fetch_markets(self):
        return {
            'BTC/USDT': {'id': 'btc_usdt', 'symbol': 'BTC/USDT', 'base': 'BTC', 'quote': 'USDT'},
            'LTC/USDT': {'id': 'ltc_usdt', 'symbol': 'LTC/USDT', 'base': 'LTC', 'quote': 'USDT'},
            'ETH/USDT': {'id': 'eth_usdt', 'symbol': 'ETH/USDT', 'base': 'ETH', 'quote': 'USDT'},
            'ETC/USDT': {'id': 'etc_usdt', 'symbol': 'ETC/USDT', 'base': 'ETC', 'quote': 'USDT'},
            'BTS/USDT': {'id': 'bts_usdt', 'symbol': 'BTS/USDT', 'base': 'BTS', 'quote': 'USDT'},
            'EOS/USDT': {'id': 'eos_usdt', 'symbol': 'EOS/USDT', 'base': 'EOS', 'quote': 'USDT'},
            'BCH/USDT': {'id': 'bcc_usdt', 'symbol': 'BCH/USDT', 'base': 'BCH', 'quote': 'USDT'},
            'HSR/USDT': {'id': 'hsr_usdt', 'symbol': 'HSR/USDT', 'base': 'HSR', 'quote': 'USDT'},
            'QTUM/USDT': {'id': 'qtum_usdt', 'symbol': 'QTUM/USDT', 'base': 'QTUM', 'quote': 'USDT'},
        }

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privatePostGetAccountInfo()
        balances = response['result']
        result = {'info': balances}
        for c in range(0, len(self.currencies)):
            currency = self.currencies[c]
            account = self.account()
            if currency in balances['balance']:
                account['free'] = float(balances['balance'][currency]['amount'])
            if currency in balances['frozen']:
                account['used'] = float(balances['frozen'][currency]['amount'])
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    def get_market_field_name(self):
        return 'market'

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        marketFieldName = self.get_market_field_name()
        request = {}
        request[marketFieldName] = market['id']
        orderbook = await self.publicGetDepth(self.extend(request, params))
        timestamp = self.milliseconds()
        bids = None
        asks = None
        if 'bids' in orderbook:
            bids = orderbook['bids']
        if 'asks' in orderbook:
            asks = orderbook['asks']
        result = {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
        }
        if result['bids']:
            result['bids'] = self.sort_by(result['bids'], 0, True)
        if result['asks']:
            result['asks'] = self.sort_by(result['asks'], 0)
        return result

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        marketFieldName = self.get_market_field_name()
        request = {}
        request[marketFieldName] = market['id']
        response = await self.publicGetTicker(self.extend(request, params))
        ticker = response['ticker']
        timestamp = self.milliseconds()
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['buy']),
            'ask': float(ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float(ticker['vol']),
            'info': ticker,
        }

    def parse_trade(self, trade, market=None):
        timestamp = trade['date'] * 1000
        side = 'buy' if (trade['trade_type'] == 'bid') else 'sell'
        return {
            'info': trade,
            'id': str(trade['tid']),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        marketFieldName = self.get_market_field_name()
        request = {}
        request[marketFieldName] = market['id']
        response = await self.publicGetTrades(self.extend(request, params))
        return self.parse_trades(response, market)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        paramString = '&price=' + str(price)
        paramString += '&amount=' + str(amount)
        tradeType = '1' if (side == 'buy') else '0'
        paramString += '&tradeType=' + tradeType
        paramString += '&currency=' + self.market_id(symbol)
        response = await self.privatePostOrder(paramString)
        return {
            'info': response,
            'id': response['id'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        await self.load_markets()
        paramString = '&id=' + str(id)
        if 'currency' in params:
            paramString += '&currency=' + params['currency']
        return await self.privatePostCancelOrder(paramString)

    async def fetch_order(self, id, symbol=None, params={}):
        await self.load_markets()
        paramString = '&id=' + str(id)
        if 'currency' in params:
            paramString += '&currency=' + params['currency']
        return await self.privatePostGetOrder(paramString)

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        if api == 'public':
            url += '/' + self.version + '/' + path
            if params:
                url += '?' + self.urlencode(params)
        else:
            paramsLength = len(params)  # params should be a string here
            nonce = self.nonce()
            auth = 'method=' + path
            auth += '&accesskey=' + self.apiKey
            auth += params if paramsLength else ''
            secret = self.hash(self.encode(self.secret), 'sha1')
            signature = self.hmac(self.encode(auth), self.encode(secret), hashlib.md5)
            suffix = 'sign=' + signature + '&reqTime=' + str(nonce)
            url += '/' + path + '?' + auth + '&' + suffix
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if api == 'private':
            if 'code' in response:
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
