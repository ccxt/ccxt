# -*- coding: utf-8 -*-

from ccxt.base import Exchange
import hashlib


class bitmarket (Exchange):

    def describe(self):
        return self.deep_extend(super(bitmarket, self).describe(), {
            'id': 'bitmarket',
            'name': 'BitMarket',
            'countries': ['PL', 'EU'],
            'rateLimit': 1500,
            'hasCORS': False,
            'hasFetchOHLCV': True,
            'hasWithdraw': True,
            'timeframes': {
                '90m': '90m',
                '6h': '6h',
                '1d': '1d',
                '1w': '7d',
                '1M': '1m',
                '3M': '3m',
                '6M': '6m',
                '1y': '1y',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg',
                'api': {
                    'public': 'https://www.bitmarket.net',
                    'private': 'https://www.bitmarket.pl/api2/',  # last slash is critical
                },
                'www': [
                    'https://www.bitmarket.pl',
                    'https://www.bitmarket.net',
                ],
                'doc': [
                    'https://www.bitmarket.net/docs.php?file=api_public.html',
                    'https://www.bitmarket.net/docs.php?file=api_private.html',
                    'https://github.com/bitmarket-net/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'json/{market}/ticker',
                        'json/{market}/orderbook',
                        'json/{market}/trades',
                        'json/ctransfer',
                        'graphs/{market}/90m',
                        'graphs/{market}/6h',
                        'graphs/{market}/1d',
                        'graphs/{market}/7d',
                        'graphs/{market}/1m',
                        'graphs/{market}/3m',
                        'graphs/{market}/6m',
                        'graphs/{market}/1y',
                    ],
                },
                'private': {
                    'post': [
                        'info',
                        'trade',
                        'cancel',
                        'orders',
                        'trades',
                        'history',
                        'withdrawals',
                        'tradingdesk',
                        'tradingdeskStatus',
                        'tradingdeskConfirm',
                        'cryptotradingdesk',
                        'cryptotradingdeskStatus',
                        'cryptotradingdeskConfirm',
                        'withdraw',
                        'withdrawFiat',
                        'withdrawPLNPP',
                        'withdrawFiatFast',
                        'deposit',
                        'transfer',
                        'transfers',
                        'marginList',
                        'marginOpen',
                        'marginClose',
                        'marginCancel',
                        'marginModify',
                        'marginBalanceAdd',
                        'marginBalanceRemove',
                        'swapList',
                        'swapOpen',
                        'swapClose',
                    ],
                },
            },
            'markets': {
                'BTC/PLN': {'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN'},
                'BTC/EUR': {'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR'},
                'LTC/PLN': {'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN'},
                'LTC/BTC': {'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                'LiteMineX/BTC': {'id': 'LiteMineXBTC', 'symbol': 'LiteMineX/BTC', 'base': 'LiteMineX', 'quote': 'BTC'},
                'PlnX/BTC': {'id': 'PlnxBTC', 'symbol': 'PlnX/BTC', 'base': 'PlnX', 'quote': 'BTC'},
            },
        })

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privatePostInfo()
        data = response['data']
        balance = data['balances']
        result = {'info': data}
        for c in range(0, len(self.currencies)):
            currency = self.currencies[c]
            account = self.account()
            if currency in balance['available']:
                account['free'] = balance['available'][currency]
            if currency in balance['blocked']:
                account['used'] = balance['blocked'][currency]
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        orderbook = await self.publicGetJsonMarketOrderbook(self.extend({
            'market': self.market_id(symbol),
        }, params))
        timestamp = self.milliseconds()
        return {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
        }

    async def fetch_ticker(self, symbol, params={}):
        ticker = await self.publicGetJsonMarketTicker(self.extend({
            'market': self.market_id(symbol),
        }, params))
        timestamp = self.milliseconds()
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['bid']),
            'ask': float(ticker['ask']),
            'vwap': float(ticker['vwap']),
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

    def parse_trade(self, trade, market=None):
        side = 'buy' if (trade['type'] == 'bid') else 'sell'
        timestamp = trade['date'] * 1000
        return {
            'id': str(trade['tid']),
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': None,
            'type': None,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        }

    async def fetch_trades(self, symbol, params={}):
        market = self.market(symbol)
        response = await self.publicGetJsonMarketTrades(self.extend({
            'market': market['id'],
        }, params))
        return self.parse_trades(response, market)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='90m', since=None, limit=None):
        return [
            ohlcv['time'] * 1000,
            float(ohlcv['open']),
            float(ohlcv['high']),
            float(ohlcv['low']),
            float(ohlcv['close']),
            float(ohlcv['vol']),
        ]

    async def fetch_ohlcv(self, symbol, timeframe='90m', since=None, limit=None, params={}):
        await self.load_markets()
        method = 'publicGetGraphsMarket' + self.timeframes[timeframe]
        market = self.market(symbol)
        response = await getattr(self, method)(self.extend({
            'market': market['id'],
        }, params))
        return self.parse_ohlcvs(response, market, timeframe, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        response = await self.privatePostTrade(self.extend({
            'market': self.market_id(symbol),
            'type': side,
            'amount': amount,
            'rate': price,
        }, params))
        result = {
            'info': response,
        }
        if 'id' in response['order']:
            result['id'] = response['id']
        return result

    async def cancel_order(self, id, symbol=None, params={}):
        return await self.privatePostCancel({'id': id})

    def is_fiat(self, currency):
        if currency == 'EUR':
            return True
        if currency == 'PLN':
            return True
        return False

    async def withdraw(self, currency, amount, address, params={}):
        await self.load_markets()
        method = None
        request = {
            'currency': currency,
            'quantity': amount,
        }
        if self.isFiat(currency):
            method = 'privatePostWithdrawFiat'
            if 'account' in params:
                request['account'] = params['account']  # bank account code for withdrawal
            else:
                raise ExchangeError(self.id + ' requires account parameter to withdraw fiat currency')
            if 'account2' in params:
                request['account2'] = params['account2']  # bank SWIFT code(EUR only)
            else:
                if currency == 'EUR':
                    raise ExchangeError(self.id + ' requires account2 parameter to withdraw EUR')
            if 'withdrawal_note' in params:
                request['withdrawal_note'] = params['withdrawal_note']  # a 10-character user-specified withdrawal note(PLN only)
            else:
                if currency == 'PLN':
                    raise ExchangeError(self.id + ' requires withdrawal_note parameter to withdraw PLN')
        else:
            method = 'privatePostWithdraw'
            request['address'] = address
        response = await getattr(self, method)(self.extend(request, params))
        return {
            'info': response,
            'id': response,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        if api == 'public':
            url += '/' + self.implode_params(path + '.json', params)
        else:
            nonce = self.nonce()
            query = self.extend({
                'tonce': nonce,
                'method': path,
            }, params)
            body = self.urlencode(query)
            headers = {
                'API-Key': self.apiKey,
                'API-Hash': self.hmac(self.encode(body), self.encode(self.secret), hashlib.sha512),
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}
