# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange

class anxpro (Exchange):

    def describe(self):
        return self.deep_extend(super(anxpro, self).describe(), {
            'id': 'anxpro',
            'name': 'ANXPro',
            'countries': ['JP', 'SG', 'HK', 'NZ'],
            'version': '2',
            'rateLimit': 1500,
            'hasCORS': False,
            'hasFetchTrades': False,
            'hasWithdraw': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg',
                'api': 'https://anxpro.com/api',
                'www': 'https://anxpro.com',
                'doc': [
                    'http://docs.anxv2.apiary.io',
                    'https://anxpro.com/pages/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{currency_pair}/money/ticker',
                        '{currency_pair}/money/depth/full',
                        '{currency_pair}/money/trade/fetch',  # disabled by ANXPro
                    ],
                },
                'private': {
                    'post': [
                        '{currency_pair}/money/order/add',
                        '{currency_pair}/money/order/cancel',
                        '{currency_pair}/money/order/quote',
                        '{currency_pair}/money/order/result',
                        '{currency_pair}/money/orders',
                        'money/{currency}/address',
                        'money/{currency}/send_simple',
                        'money/info',
                        'money/trade/list',
                        'money/wallet/history',
                    ],
                },
            },
            'markets': {
                'BTC/USD': {'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD'},
                'BTC/HKD': {'id': 'BTCHKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD'},
                'BTC/EUR': {'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR'},
                'BTC/CAD': {'id': 'BTCCAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD'},
                'BTC/AUD': {'id': 'BTCAUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD'},
                'BTC/SGD': {'id': 'BTCSGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD'},
                'BTC/JPY': {'id': 'BTCJPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY'},
                'BTC/GBP': {'id': 'BTCGBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP'},
                'BTC/NZD': {'id': 'BTCNZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD'},
                'LTC/BTC': {'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                'DOGE/BTC': {'id': 'DOGEBTC', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC'},
                'STR/BTC': {'id': 'STRBTC', 'symbol': 'STR/BTC', 'base': 'STR', 'quote': 'BTC'},
                'XRP/BTC': {'id': 'XRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC'},
            },
        })

    async def fetch_balance(self, params={}):
        response = await self.privatePostMoneyInfo()
        balance = response['data']
        currencies = list(balance['Wallets'].keys())
        result = {'info': balance}
        for c in range(0, len(currencies)):
            currency = currencies[c]
            account = self.account()
            if currency in balance['Wallets']:
                wallet = balance['Wallets'][currency]
                account['free'] = float(wallet['Available_Balance']['value'])
                account['total'] = float(wallet['Balance']['value'])
                account['used'] = account['total'] - account['free']
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        response = await self.publicGetCurrencyPairMoneyDepthFull(self.extend({
            'currency_pair': self.market_id(symbol),
        }, params))
        orderbook = response['data']
        t = int(orderbook['dataUpdateTime'])
        timestamp = int(t / 1000)
        return self.parse_order_book(orderbook, timestamp, 'bids', 'asks', 'price', 'amount')

    async def fetch_ticker(self, symbol, params={}):
        response = await self.publicGetCurrencyPairMoneyTicker(self.extend({
            'currency_pair': self.market_id(symbol),
        }, params))
        ticker = response['data']
        t = int(ticker['dataUpdateTime'])
        timestamp = int(t / 1000)
        bid = self.safe_float(ticker['buy'], 'value')
        ask = self.safe_float(ticker['sell'], 'value')
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']['value']),
            'low': float(ticker['low']['value']),
            'bid': bid,
            'ask': ask,
            'vwap': float(ticker['vwap']['value']),
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last']['value']),
            'change': None,
            'percentage': None,
            'average': float(ticker['avg']['value']),
            'baseVolume': None,
            'quoteVolume': float(ticker['vol']['value']),
        }

    async def fetch_trades(self, market, params={}):
        raise ExchangeError(self.id + ' switched off the trades endpoint, see their docs at http://docs.anxv2.apiary.io/reference/market-data/currencypairmoneytradefetch-disabled')
        return self.publicGetCurrencyPairMoneyTradeFetch(self.extend({
            'currency_pair': self.market_id(market),
        }, params))

    async def create_order(self, market, type, side, amount, price=None, params={}):
        order = {
            'currency_pair': self.market_id(market),
            'amount_int': int(amount * 100000000),  # 10^8
            'type': side,
        }
        if type == 'limit':
            order['price_int'] = int(price * 100000)  # 10^5
        result = await self.privatePostCurrencyPairOrderAdd(self.extend(order, params))
        return {
            'info': result,
            'id': result['data']
        }

    async def cancel_order(self, id, symbol=None, params={}):
        return await self.privatePostCurrencyPairOrderCancel({'oid': id})

    async def withdraw(self, currency, amount, address, params={}):
        await self.load_markets()
        response = await self.privatePostMoneyCurrencySendSimple(self.extend({
            'currency': currency,
            'amount_int': int(amount * 100000000),  # 10^8
            'address': address,
        }, params))
        return {
            'info': response,
            'id': response['data']['transactionId'],
        }

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        request = self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        url = self.urls['api'] + '/' + self.version + '/' + request
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            nonce = self.nonce()
            body = self.urlencode(self.extend({'nonce': nonce}, query))
            secret = base64.b64decode(self.secret)
            auth = request + "\0" + body
            signature = self.hmac(self.encode(auth), secret, hashlib.sha512, 'base64')
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': self.apiKey,
                'Rest-Sign': self.decode(signature),
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'result' in response:
            if response['result'] == 'success':
                return response
        raise ExchangeError(self.id + ' ' + self.json(response))
