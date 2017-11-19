# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError


class deribit (Exchange):

    def describe(self):
        return self.deep_extend(super(deribit, self).describe(), {
            'id': 'deribit',
            'name': 'Deribit',
            'countries': 'NL',
            'rateLimit': 1000,
            'hasCORS': False,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31803491-b7c0c29c-b55c-11e7-91c9-11328fc3e0f7.jpg',
                'www': 'https://www.deribit.com',
                'api': 'https://www.deribit.com/api',
                'doc': [
                    'https://www.deribit.com/docs/api',
                    'https://github.com/deribit',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'test',
                        'getinstruments',
                        'index',
                        'getcurrencies',
                        'getorderbook',
                        'getlasttrades',
                        'getsummary',
                        'stats',
                        'getannouncements',
                    ],
                },
                'private': {
                    'post': [
                        'account',
                        'buy',
                        'cancel',
                        'cancelall',
                        'edit',
                        'getopenorders',
                        'newannouncements',
                        'orderhistory',
                        'orderstate',
                        'positions',
                        'sell',
                        'tradehistory',
                    ],
                },
            },
        })

    async def fetch_markets(self):
        response = await self.publicGetInstruments()
        markets = response['result']
        result = []
        for i in range(0, len(markets)):
            market = markets[i]
            id = market['instrumentName']
            symbol = id
            base = market['baseCurrency']
            quote = market['quoteCurreny']
            precision = {
                'amount': None,
                'price': market['pricePrecision'],
            }
            amountLimits = {
                'min': market['minTradeSize'],
                'max': None,
            }
            priceLimits = {'min': None, 'max': None}
            limits = {
                'amount': amountLimits,
                'price': priceLimits,
            }
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'precision': precision,
                'limits': limits,
            }))
        return result

    def parse_ticker(self, ticker, market=None):
        created = ticker['created'][0:19]
        timestamp = self.parse8601(created)
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['bidPrice']),
            'ask': float(ticker['askPrice']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': float(ticker['midPrice']),
            'baseVolume': float(ticker['volume']),
            'quoteVolume': None,
            'info': ticker,
        }

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        response = await self.publicGetTicker(params)
        result = {}
        ids = list(response.keys())
        for i in range(0, len(ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = response[id]
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetSummary(self.extend({
            'instrument': market['id'],
        }, params))
        return self.parse_ticker(response['result'], market)

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.version + '/' + api + '/' + path
        if api == 'public':
            if params:
                url += '?' + self.urlencode(params)
        else:
            nonce = self.nonce()
            body = self.urlencode(self.extend({'nonce': nonce}, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': self.apiKey,
                'Sign': self.hmac(self.encode(body), self.encode(self.secret), hashlib.sha512),
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'success' in response:
            if response['success']:
                return response
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
