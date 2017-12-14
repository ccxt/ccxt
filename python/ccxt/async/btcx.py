# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError


class btcx (Exchange):

    def describe(self):
        return self.deep_extend(super(btcx, self).describe(), {
            'id': 'btcx',
            'name': 'BTCX',
            'countries': ['IS', 'US', 'EU'],
            'rateLimit': 1500,  # support in english is very poor, unable to tell rate limits
            'version': 'v1',
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766385-9fdcc98c-5ed6-11e7-8f14-66d5e5cd47e6.jpg',
                'api': 'https://btc-x.is/api',
                'www': 'https://btc-x.is',
                'doc': 'https://btc-x.is/custom/api-document.html',
            },
            'api': {
                'public': {
                    'get': [
                        'depth/{id}/{limit}',
                        'ticker/{id}',
                        'trade/{id}/{limit}',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'cancel',
                        'history',
                        'order',
                        'redeem',
                        'trade',
                        'withdraw',
                    ],
                },
            },
            'markets': {
                'BTC/USD': {'id': 'btc/usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD'},
                'BTC/EUR': {'id': 'btc/eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR'},
            },
        })

    async def fetch_balance(self, params={}):
        balances = await self.privatePostBalance()
        result = {'info': balances}
        currencies = list(balances.keys())
        for c in range(0, len(currencies)):
            currency = currencies[c]
            uppercase = currency.upper()
            account = {
                'free': balances[currency],
                'used': 0.0,
                'total': balances[currency],
            }
            result[uppercase] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        orderbook = await self.publicGetDepthIdLimit(self.extend({
            'id': self.market_id(symbol),
            'limit': 1000,
        }, params))
        return self.parse_order_book(orderbook, None, 'bids', 'asks', 'price', 'amount')

    async def fetch_ticker(self, symbol, params={}):
        ticker = await self.publicGetTickerId(self.extend({
            'id': self.market_id(symbol),
        }, params))
        timestamp = ticker['time'] * 1000
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['sell']),
            'ask': float(ticker['buy']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float(ticker['volume']),
            'info': ticker,
        }

    def parse_trade(self, trade, market):
        timestamp = int(trade['date']) * 1000
        side = 'sell' if (trade['type'] == 'ask') else 'buy'
        return {
            'id': trade['id'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        market = self.market(symbol)
        response = await self.publicGetTradeIdLimit(self.extend({
            'id': market['id'],
            'limit': 1000,
        }, params))
        return self.parse_trades(response, market, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        response = await self.privatePostTrade(self.extend({
            'type': side.upper(),
            'market': self.market_id(symbol),
            'amount': amount,
            'price': price,
        }, params))
        return {
            'info': response,
            'id': response['order']['id'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        return await self.privatePostCancel({'order': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.version + '/'
        if api == 'public':
            url += self.implode_params(path, params)
        else:
            self.check_required_credentials()
            nonce = self.nonce()
            url += api
            body = self.urlencode(self.extend({
                'Method': path.upper(),
                'Nonce': nonce,
            }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': self.apiKey,
                'Signature': self.hmac(self.encode(body), self.encode(self.secret), hashlib.sha512),
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'error' in response:
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
