# -*- coding: utf-8 -*-

from ccxt.base import Exchange

class cryptocapital (Exchange):

    def describe(self):
        return self.deep_extend(super(cryptocapital, self).describe(), {
            'id': 'cryptocapital',
            'name': 'Crypto Capital',
            'comment': 'Crypto Capital API',
            'countries': 'PA',  # Panama
            'hasFetchOHLCV': True,
            'hasWithdraw': True,
            'timeframes': {
                '1d': '1year',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27993158-7a13f140-64ac-11e7-89cc-a3b441f0b0f8.jpg',
                'www': 'https://cryptocapital.co',
                'doc': 'https://github.com/cryptocap',
            },
            'api': {
                'public': {
                    'get': [
                        'stats',
                        'historical-prices',
                        'order-book',
                        'transactions',
                    ],
                },
                'private': {
                    'post': [
                        'balances-and-info',
                        'open-orders',
                        'user-transactions',
                        'btc-deposit-address/get',
                        'btc-deposit-address/new',
                        'deposits/get',
                        'withdrawals/get',
                        'orders/new',
                        'orders/edit',
                        'orders/cancel',
                        'orders/status',
                        'withdrawals/new',
                    ],
                },
            },
        })

    async def fetch_balance(self, params={}):
        response = await self.privatePostBalancesAndInfo()
        balance = response['balances-and-info']
        result = {'info': balance}
        for c in range(0, len(self.currencies)):
            currency = self.currencies[c]
            account = self.account()
            account['free'] = self.safe_float(balance['available'], currency, 0.0)
            account['used'] = self.safe_float(balance['on_hold'], currency, 0.0)
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        response = await self.publicGetOrderBook(self.extend({
            'currency': self.market_id(symbol),
        }, params))
        return self.parse_order_book(response['order-book'], None, 'bid', 'ask', 'price', 'order_amount')

    async def fetch_ticker(self, symbol, params={}):
        response = await self.publicGetStats(self.extend({
            'currency': self.market_id(symbol),
        }, params))
        ticker = response['stats']
        timestamp = self.milliseconds()
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['max']),
            'low': float(ticker['min']),
            'bid': float(ticker['bid']),
            'ask': float(ticker['ask']),
            'vwap': None,
            'open': float(ticker['open']),
            'close': None,
            'first': None,
            'last': float(ticker['last_price']),
            'change': float(ticker['daily_change']),
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float(ticker['total_btc_traded']),
        }

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1d', since=None, limit=None):
        return [
            self.parse8601(ohlcv['date'] + ' 00:00:00'),
            None,
            None,
            None,
            float(ohlcv['price']),
            None,
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1d', since=None, limit=None, params={}):
        market = self.market(symbol)
        response = await self.publicGetHistoricalPrices(self.extend({
            'currency': market['id'],
            'timeframe': self.timeframes[timeframe],
        }, params))
        ohlcvs = self.omit(response['historical-prices'], 'request_currency')
        return self.parse_ohlcvs(ohlcvs, market, timeframe, since, limit)

    def parse_trade(self, trade, market):
        timestamp = int(trade['timestamp']) * 1000
        return {
            'id': trade['id'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': None,
            'type': None,
            'side': trade['maker_type'],
            'price': float(trade['price']),
            'amount': float(trade['amount']),
        }

    async def fetch_trades(self, symbol, params={}):
        market = self.market(symbol)
        response = await self.publicGetTransactions(self.extend({
            'currency': market['id'],
        }, params))
        trades = self.omit(response['transactions'], 'request_currency')
        return self.parse_trades(trades, market)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        order = {
            'side': side,
            'type': type,
            'currency': self.market_id(symbol),
            'amount': amount,
        }
        if type == 'limit':
            order['limit_price'] = price
        result = await self.privatePostOrdersNew(self.extend(order, params))
        return {
            'info': result,
            'id': result,
        }

    async def cancel_order(self, id, symbol=None, params={}):
        return await self.privatePostOrdersCancel({'id': id})

    async def withdraw(self, currency, amount, address, params={}):
        await self.load_markets()
        response = await self.privatePostWithdrawalsNew(self.extend({
            'currency': currency,
            'amount': float(amount),
            'address': address,
        }, params))
        return {
            'info': response,
            'id': response['result']['uuid'],
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        if self.id == 'cryptocapital':
            raise ExchangeError(self.id + ' is an abstract base API for _1btcxe')
        url = self.urls['api'] + '/' + path
        if api == 'public':
            if params:
                url += '?' + self.urlencode(params)
        else:
            query = self.extend({
                'api_key': self.apiKey,
                'nonce': self.nonce(),
            }, params)
            request = self.json(query)
            query['signature'] = self.hmac(self.encode(request), self.encode(self.secret))
            body = self.json(query)
            headers = {'Content-Type': 'application/json'}
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'errors' in response:
            errors = []
            for e in range(0, len(response['errors'])):
                error = response['errors'][e]
                errors.append(error['code'] + ': ' + error['message'])
            errors = ' '.join(errors)
            raise ExchangeError(self.id + ' ' + errors)
        return response
