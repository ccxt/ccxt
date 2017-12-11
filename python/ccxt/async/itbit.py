# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError


class itbit (Exchange):

    def describe(self):
        return self.deep_extend(super(itbit, self).describe(), {
            'id': 'itbit',
            'name': 'itBit',
            'countries': 'US',
            'rateLimit': 2000,
            'version': 'v1',
            'hasCORS': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg',
                'api': 'https://api.itbit.com',
                'www': 'https://www.itbit.com',
                'doc': [
                    'https://api.itbit.com/docs',
                    'https://www.itbit.com/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'markets/{symbol}/ticker',
                        'markets/{symbol}/order_book',
                        'markets/{symbol}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'wallets',
                        'wallets/{walletId}',
                        'wallets/{walletId}/balances/{currencyCode}',
                        'wallets/{walletId}/funding_history',
                        'wallets/{walletId}/trades',
                        'wallets/{walletId}/orders/{id}',
                    ],
                    'post': [
                        'wallet_transfers',
                        'wallets',
                        'wallets/{walletId}/cryptocurrency_deposits',
                        'wallets/{walletId}/cryptocurrency_withdrawals',
                        'wallets/{walletId}/orders',
                        'wire_withdrawal',
                    ],
                    'delete': [
                        'wallets/{walletId}/orders/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/USD': {'id': 'XBTUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD'},
                'BTC/SGD': {'id': 'XBTSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD'},
                'BTC/EUR': {'id': 'XBTEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR'},
            },
            'fees': {
                'trading': {
                    'maker': 0,
                    'taker': 0.2 / 100,
                },
            },
        })

    async def fetch_order_book(self, symbol, params={}):
        orderbook = await self.publicGetMarketsSymbolOrderBook(self.extend({
            'symbol': self.market_id(symbol),
        }, params))
        return self.parse_order_book(orderbook)

    async def fetch_ticker(self, symbol, params={}):
        ticker = await self.publicGetMarketsSymbolTicker(self.extend({
            'symbol': self.market_id(symbol),
        }, params))
        serverTimeUTC = ('serverTimeUTC' in list(ticker.keys()))
        if not serverTimeUTC:
            raise ExchangeError(self.id + ' fetchTicker returned a bad response: ' + self.json(ticker))
        timestamp = self.parse8601(ticker['serverTimeUTC'])
        vwap = float(ticker['vwap24h'])
        baseVolume = float(ticker['volume24h'])
        quoteVolume = baseVolume * vwap
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high24h']),
            'low': float(ticker['low24h']),
            'bid': self.safe_float(ticker, 'bid'),
            'ask': self.safe_float(ticker, 'ask'),
            'vwap': vwap,
            'open': float(ticker['openToday']),
            'close': None,
            'first': None,
            'last': float(ticker['lastPrice']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }

    def parse_trade(self, trade, market):
        timestamp = self.parse8601(trade['timestamp'])
        id = str(trade['matchNumber'])
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': id,
            'type': None,
            'side': None,
            'price': float(trade['price']),
            'amount': float(trade['amount']),
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        market = self.market(symbol)
        response = await self.publicGetMarketsSymbolTrades(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_trades(response['recentTrades'], market, since, limit)

    async def fetch_balance(self, params={}):
        response = await self.privateGetBalances()
        balances = response['balances']
        result = {'info': response}
        for b in range(0, len(balances)):
            balance = balances[b]
            currency = balance['currency']
            account = {
                'free': float(balance['availableBalance']),
                'used': 0.0,
                'total': float(balance['totalBalance']),
            }
            account['used'] = account['total'] - account['free']
            result[currency] = account
        return self.parse_balance(result)

    def fetch_wallets(self):
        return self.privateGetWallets()

    def nonce(self):
        return self.milliseconds()

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        if type == 'market':
            raise ExchangeError(self.id + ' allows limit orders only')
        walletIdInParams = ('walletId' in list(params.keys()))
        if not walletIdInParams:
            raise ExchangeError(self.id + ' createOrder requires a walletId parameter')
        amount = str(amount)
        price = str(price)
        market = self.market(symbol)
        order = {
            'side': side,
            'type': type,
            'currency': market['base'],
            'amount': amount,
            'display': amount,
            'price': price,
            'instrument': market['id'],
        }
        response = await self.privatePostTradeAdd(self.extend(order, params))
        return {
            'info': response,
            'id': response['id'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        walletIdInParams = ('walletId' in list(params.keys()))
        if not walletIdInParams:
            raise ExchangeError(self.id + ' cancelOrder requires a walletId parameter')
        return await self.privateDeleteWalletsWalletIdOrdersId(self.extend({
            'id': id,
        }, params))

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.version + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
            if query:
                body = self.json(query)
            else:
                body = ''
            nonce = str(self.nonce())
            timestamp = nonce
            auth = [method, url, body, nonce, timestamp]
            message = nonce + self.json(auth)
            hash = self.hash(self.encode(message), 'sha256', 'binary')
            binhash = self.binary_concat(url, hash)
            signature = self.hmac(binhash, self.encode(self.secret), hashlib.sha512, 'base64')
            headers = {
                'Authorization': self.apiKey + ':' + signature,
                'Content-Type': 'application/json',
                'X-Auth-Timestamp': timestamp,
                'X-Auth-Nonce': nonce,
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'code' in response:
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
