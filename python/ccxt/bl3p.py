# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import base64
import hashlib


class bl3p (Exchange):

    def describe(self):
        return self.deep_extend(super(bl3p, self).describe(), {
            'id': 'bl3p',
            'name': 'BL3P',
            'countries': ['NL', 'EU'],  # Netherlands, EU
            'rateLimit': 1000,
            'version': '1',
            'comment': 'An exchange market by BitonicNL',
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg',
                'api': 'https://api.bl3p.eu',
                'www': [
                    'https://bl3p.eu',
                    'https://bitonic.nl',
                ],
                'doc': [
                    'https://github.com/BitonicNL/bl3p-api/tree/master/docs',
                    'https://bl3p.eu/api',
                    'https://bitonic.nl/en/api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{market}/ticker',
                        '{market}/orderbook',
                        '{market}/trades',
                    ],
                },
                'private': {
                    'post': [
                        '{market}/money/depth/full',
                        '{market}/money/order/add',
                        '{market}/money/order/cancel',
                        '{market}/money/order/result',
                        '{market}/money/orders',
                        '{market}/money/orders/history',
                        '{market}/money/trades/fetch',
                        'GENMKT/money/info',
                        'GENMKT/money/deposit_address',
                        'GENMKT/money/new_deposit_address',
                        'GENMKT/money/wallet/history',
                        'GENMKT/money/withdraw',
                    ],
                },
            },
            'markets': {
                'BTC/EUR': {'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'maker': 0.0025, 'taker': 0.0025},
                # 'LTC/EUR': {'id': 'LTCEUR', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR'},
            },
        })

    def fetch_balance(self, params={}):
        response = self.privatePostGENMKTMoneyInfo()
        data = response['data']
        balance = data['wallets']
        result = {'info': data}
        currencies = list(self.currencies.keys())
        for i in range(0, len(currencies)):
            currency = currencies[i]
            account = self.account()
            if currency in balance:
                if 'available' in balance[currency]:
                    account['free'] = float(balance[currency]['available']['value'])
            if currency in balance:
                if 'balance' in balance[currency]:
                    account['total'] = float(balance[currency]['balance']['value'])
            if account['total']:
                if account['free']:
                    account['used'] = account['total'] - account['free']
            result[currency] = account
        return self.parse_balance(result)

    def parse_bid_ask(self, bidask, priceKey=0, amountKey=0):
        return [
            bidask['price_int'] / 100000.0,
            bidask['amount_int'] / 100000000.0,
        ]

    def fetch_order_book(self, symbol, params={}):
        market = self.market(symbol)
        response = self.publicGetMarketOrderbook(self.extend({
            'market': market['id'],
        }, params))
        orderbook = response['data']
        return self.parse_order_book(orderbook)

    def fetch_ticker(self, symbol, params={}):
        ticker = self.publicGetMarketTicker(self.extend({
            'market': self.market_id(symbol),
        }, params))
        timestamp = ticker['timestamp'] * 1000
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['bid']),
            'ask': float(ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker['volume']['24h']),
            'quoteVolume': None,
            'info': ticker,
        }

    def parse_trade(self, trade, market):
        return {
            'id': trade['trade_id'],
            'info': trade,
            'timestamp': trade['date'],
            'datetime': self.iso8601(trade['date']),
            'symbol': market['symbol'],
            'type': None,
            'side': None,
            'price': trade['price_int'] / 100000.0,
            'amount': trade['amount_int'] / 100000000.0,
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        market = self.market(symbol)
        response = self.publicGetMarketTrades(self.extend({
            'market': market['id'],
        }, params))
        result = self.parse_trades(response['data']['trades'], market, since, limit)
        return result

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        market = self.market(symbol)
        order = {
            'market': market['id'],
            'amount_int': amount,
            'fee_currency': market['quote'],
            'type': 'bid' if (side == 'buy') else 'ask',
        }
        if type == 'limit':
            order['price_int'] = price
        response = self.privatePostMarketMoneyOrderAdd(self.extend(order, params))
        return {
            'info': response,
            'id': str(response['order_id']),
        }

    def cancel_order(self, id, symbol=None, params={}):
        return self.privatePostMarketMoneyOrderCancel({'order_id': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        request = self.implode_params(path, params)
        url = self.urls['api'] + '/' + self.version + '/' + request
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
            nonce = self.nonce()
            body = self.urlencode(self.extend({'nonce': nonce}, query))
            secret = base64.b64decode(self.secret)
            auth = request + "\0" + body
            signature = self.hmac(self.encode(auth), secret, hashlib.sha512, 'base64')
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Rest-Key': self.apiKey,
                'Rest-Sign': signature,
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}
