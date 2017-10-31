# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import AuthenticationError


class bitstamp (Exchange):

    def describe(self):
        return self.deep_extend(super(bitstamp, self).describe(), {
            'id': 'bitstamp',
            'name': 'Bitstamp',
            'countries': 'GB',
            'rateLimit': 1000,
            'version': 'v2',
            'hasCORS': False,
            'hasFetchOrder': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api': 'https://www.bitstamp.net/api',
                'www': 'https://www.bitstamp.net',
                'doc': 'https://www.bitstamp.net/api',
            },
            'api': {
                'public': {
                    'get': [
                        'order_book/{pair}/',
                        'ticker_hour/{pair}/',
                        'ticker/{pair}/',
                        'transactions/{pair}/',
                    ],
                },
                'private': {
                    'post': [
                        'balance/',
                        'balance/{pair}/',
                        'user_transactions/',
                        'user_transactions/{pair}/',
                        'open_orders/all/',
                        'open_orders/{pair}',
                        'order_status/',
                        'cancel_order/',
                        'buy/{pair}/',
                        'buy/market/{pair}/',
                        'sell/{pair}/',
                        'sell/market/{pair}/',
                        'ltc_withdrawal/',
                        'ltc_address/',
                        'eth_withdrawal/',
                        'eth_address/',
                        'transfer-to-main/',
                        'transfer-from-main/',
                        'xrp_withdrawal/',
                        'xrp_address/',
                        'withdrawal/open/',
                        'withdrawal/status/',
                        'withdrawal/cancel/',
                        'liquidation_address/new/',
                        'liquidation_address/info/',
                    ],
                },
                'v1': {
                    'post': [
                        'bitcoin_deposit_address/',
                        'unconfirmed_btc/',
                        'bitcoin_withdrawal/',
                    ],
                },
            },
            'markets': {
                'BTC/USD': {'id': 'btcusd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD'},
                'BTC/EUR': {'id': 'btceur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR'},
                'EUR/USD': {'id': 'eurusd', 'symbol': 'EUR/USD', 'base': 'EUR', 'quote': 'USD'},
                'XRP/USD': {'id': 'xrpusd', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD'},
                'XRP/EUR': {'id': 'xrpeur', 'symbol': 'XRP/EUR', 'base': 'XRP', 'quote': 'EUR'},
                'XRP/BTC': {'id': 'xrpbtc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC'},
                'LTC/USD': {'id': 'ltcusd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD'},
                'LTC/EUR': {'id': 'ltceur', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR'},
                'LTC/BTC': {'id': 'ltcbtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                'ETH/USD': {'id': 'ethusd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD'},
                'ETH/EUR': {'id': 'etheur', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR'},
                'ETH/BTC': {'id': 'ethbtc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC'},
            },
        })

    async def fetch_order_book(self, symbol, params={}):
        orderbook = await self.publicGetOrderBookPair(self.extend({
            'pair': self.market_id(symbol),
        }, params))
        timestamp = int(orderbook['timestamp']) * 1000
        return self.parse_order_book(orderbook, timestamp)

    async def fetch_ticker(self, symbol, params={}):
        ticker = await self.publicGetTickerPair(self.extend({
            'pair': self.market_id(symbol),
        }, params))
        timestamp = int(ticker['timestamp']) * 1000
        vwap = float(ticker['vwap'])
        baseVolume = float(ticker['volume'])
        quoteVolume = baseVolume * vwap
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['bid']),
            'ask': float(ticker['ask']),
            'vwap': vwap,
            'open': float(ticker['open']),
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }

    def parse_trade(self, trade, market=None):
        timestamp = None
        if 'date' in trade:
            timestamp = int(trade['date']) * 1000
        elif 'datetime' in trade:
            # timestamp = self.parse8601(trade['datetime'])
            timestamp = int(trade['datetime']) * 1000
        side = 'buy' if (trade['type'] == 0) else 'sell'
        order = None
        if 'order_id' in trade:
            order = str(trade['order_id'])
        if 'currency_pair' in trade:
            if trade['currency_pair'] in self.markets_by_id:
                market = self.markets_by_id[trade['currency_pair']]
        return {
            'id': str(trade['tid']),
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': order,
            'type': None,
            'side': side,
            'price': float(trade['price']),
            'amount': float(trade['amount']),
        }

    async def fetch_trades(self, symbol, params={}):
        market = self.market(symbol)
        response = await self.publicGetTransactionsPair(self.extend({
            'pair': market['id'],
            'time': 'minute',
        }, params))
        return self.parse_trades(response, market)

    async def fetch_balance(self, params={}):
        balance = await self.privatePostBalance()
        result = {'info': balance}
        for c in range(0, len(self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower()
            total = lowercase + '_balance'
            free = lowercase + '_available'
            used = lowercase + '_reserved'
            account = self.account()
            if free in balance:
                account['free'] = float(balance[free])
            if used in balance:
                account['used'] = float(balance[used])
            if total in balance:
                account['total'] = float(balance[total])
            result[currency] = account
        return self.parse_balance(result)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        method = 'privatePost' + self.capitalize(side)
        order = {
            'pair': self.market_id(symbol),
            'amount': amount,
        }
        if type == 'market':
            method += 'Market'
        else:
            order['price'] = price
        method += 'Pair'
        response = await getattr(self, method)(self.extend(order, params))
        return {
            'info': response,
            'id': response['id'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        return await self.privatePostCancelOrder({'id': id})

    def parse_order_status(self, order):
        if (order['status'] == 'Queue') or (order['status'] == 'Open'):
            return 'open'
        if order['status'] == 'Finished':
            return 'closed'
        return order['status']

    async def fetch_order_status(self, id, symbol=None):
        await self.load_markets()
        response = await self.privatePostOrderStatus({'id': id})
        return self.parse_order_status(response)

    async def fetch_my_trades(self, symbol=None, params={}):
        await self.load_markets()
        market = None
        if symbol:
            market = self.market(symbol)
        pair = market['id'] if market else 'all'
        request = self.extend({'pair': pair}, params)
        response = await self.privatePostOpenOrdersPair(request)
        return self.parse_trades(response, market)

    async def fetch_order(self, id, symbol=None, params={}):
        await self.load_markets()
        return await self.privatePostOrderStatus({'id': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/'
        if api != 'v1':
            url += self.version + '/'
        url += self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            if not self.uid:
                raise AuthenticationError(self.id + ' requires `' + self.id + '.uid` property for authentication')
            nonce = str(self.nonce())
            auth = nonce + self.uid + self.apiKey
            signature = self.encode(self.hmac(self.encode(auth), self.encode(self.secret)))
            query = self.extend({
                'key': self.apiKey,
                'signature': signature.upper(),
                'nonce': nonce,
            }, query)
            body = self.urlencode(query)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'status' in response:
            if response['status'] == 'error':
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
