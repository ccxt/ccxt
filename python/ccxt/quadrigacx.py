# -*- coding: utf-8 -*-

from ccxt.base import Exchange


class quadrigacx (Exchange):

    def describe(self):
        return self.deep_extend(super(quadrigacx, self).describe(), {
            'id': 'quadrigacx',
            'name': 'QuadrigaCX',
            'countries': 'CA',
            'rateLimit': 1000,
            'version': 'v2',
            'hasCORS': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766825-98a6d0de-5ee7-11e7-9fa4-38e11a2c6f52.jpg',
                'api': 'https://api.quadrigacx.com',
                'www': 'https://www.quadrigacx.com',
                'doc': 'https://www.quadrigacx.com/api_info',
            },
            'api': {
                'public': {
                    'get': [
                        'order_book',
                        'ticker',
                        'transactions',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'bitcoin_deposit_address',
                        'bitcoin_withdrawal',
                        'buy',
                        'cancel_order',
                        'ether_deposit_address',
                        'ether_withdrawal',
                        'lookup_order',
                        'open_orders',
                        'sell',
                        'user_transactions',
                    ],
                },
            },
            'markets': {
                'BTC/CAD': {'id': 'btc_cad', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD'},
                'BTC/USD': {'id': 'btc_usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD'},
                'ETH/BTC': {'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC'},
                'ETH/CAD': {'id': 'eth_cad', 'symbol': 'ETH/CAD', 'base': 'ETH', 'quote': 'CAD'},
            },
        })

    def fetch_balance(self, params={}):
        balances = self.privatePostBalance()
        result = {'info': balances}
        for c in range(0, len(self.currencies)):
            currency = self.currencies[c]
            lowercase = currency.lower()
            account = {
                'free': float(balances[lowercase + '_available']),
                'used': float(balances[lowercase + '_reserved']),
                'total': float(balances[lowercase + '_balance']),
            }
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        orderbook = self.publicGetOrderBook(self.extend({
            'book': self.market_id(symbol),
        }, params))
        timestamp = int(orderbook['timestamp']) * 1000
        return self.parse_order_book(orderbook, timestamp)

    def fetch_ticker(self, symbol, params={}):
        ticker = self.publicGetTicker(self.extend({
            'book': self.market_id(symbol),
        }, params))
        timestamp = int(ticker['timestamp']) * 1000
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

    def parse_trade(self, trade, market):
        timestamp = int(trade['date']) * 1000
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'id': str(trade['tid']),
            'order': None,
            'type': None,
            'side': trade['side'],
            'price': float(trade['price']),
            'amount': float(trade['amount']),
        }

    def fetch_trades(self, symbol, params={}):
        market = self.market(symbol)
        response = self.publicGetTransactions(self.extend({
            'book': market['id'],
        }, params))
        return self.parse_trades(response, market)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        method = 'privatePost' + self.capitalize(side)
        order = {
            'amount': amount,
            'book': self.market_id(symbol),
        }
        if type == 'limit':
            order['price'] = price
        response = getattr(self, method)(self.extend(order, params))
        return {
            'info': response,
            'id': str(response['id']),
        }

    def cancel_order(self, id, symbol=None, params={}):
        return self.privatePostCancelOrder(self.extend({
            'id': id,
        }, params))

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.version + '/' + path
        if api == 'public':
            url += '?' + self.urlencode(params)
        else:
            if not self.uid:
                raise AuthenticationError(self.id + ' requires `' + self.id + '.uid` property for authentication')
            nonce = self.nonce()
            request = ''.join([str(nonce), self.uid, self.apiKey])
            signature = self.hmac(self.encode(request), self.encode(self.secret))
            query = self.extend({
                'key': self.apiKey,
                'nonce': nonce,
                'signature': signature,
            }, params)
            body = self.json(query)
            headers = {
                'Content-Type': 'application/json',
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'error' in response:
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
