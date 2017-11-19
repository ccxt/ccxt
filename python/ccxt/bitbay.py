# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError


class bitbay (Exchange):

    def describe(self):
        return self.deep_extend(super(bitbay, self).describe(), {
            'id': 'bitbay',
            'name': 'BitBay',
            'countries': ['PL', 'EU'],  # Poland
            'rateLimit': 1000,
            'hasCORS': True,
            'hasWithdraw': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg',
                'www': 'https://bitbay.net',
                'api': {
                    'public': 'https://bitbay.net/API/Public',
                    'private': 'https://bitbay.net/API/Trading/tradingApi.php',
                },
                'doc': [
                    'https://bitbay.net/public-api',
                    'https://bitbay.net/account/tab-api',
                    'https://github.com/BitBayNet/API',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{id}/all',
                        '{id}/market',
                        '{id}/orderbook',
                        '{id}/ticker',
                        '{id}/trades',
                    ],
                },
                'private': {
                    'post': [
                        'info',
                        'trade',
                        'cancel',
                        'orderbook',
                        'orders',
                        'transfer',
                        'withdraw',
                        'history',
                        'transactions',
                    ],
                },
            },
            'markets': {
                'BTC/USD': {'id': 'BTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD'},
                'BTC/EUR': {'id': 'BTCEUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR'},
                'BTC/PLN': {'id': 'BTCPLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN'},
                'LTC/USD': {'id': 'LTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD'},
                'LTC/EUR': {'id': 'LTCEUR', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR'},
                'LTC/PLN': {'id': 'LTCPLN', 'symbol': 'LTC/PLN', 'base': 'LTC', 'quote': 'PLN'},
                'LTC/BTC': {'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                'ETH/USD': {'id': 'ETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD'},
                'ETH/EUR': {'id': 'ETHEUR', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR'},
                'ETH/PLN': {'id': 'ETHPLN', 'symbol': 'ETH/PLN', 'base': 'ETH', 'quote': 'PLN'},
                'ETH/BTC': {'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC'},
                'LSK/USD': {'id': 'LSKUSD', 'symbol': 'LSK/USD', 'base': 'LSK', 'quote': 'USD'},
                'LSK/EUR': {'id': 'LSKEUR', 'symbol': 'LSK/EUR', 'base': 'LSK', 'quote': 'EUR'},
                'LSK/PLN': {'id': 'LSKPLN', 'symbol': 'LSK/PLN', 'base': 'LSK', 'quote': 'PLN'},
                'LSK/BTC': {'id': 'LSKBTC', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC'},
            },
            'fees': {
                'trading': {
                    'maker': 0.3 / 100,
                    'taker': 0.0043,
                },
            },
        })

    def fetch_balance(self, params={}):
        response = self.privatePostInfo()
        if 'balances' in response:
            balance = response['balances']
            result = {'info': balance}
            for c in range(0, len(self.currencies)):
                currency = self.currencies[c]
                account = self.account()
                if currency in balance:
                    account['free'] = float(balance[currency]['available'])
                    account['used'] = float(balance[currency]['locked'])
                    account['total'] = self.sum(account['free'], account['used'])
                result[currency] = account
            return self.parse_balance(result)
        raise ExchangeError(self.id + ' empty balance response ' + self.json(response))

    def fetch_order_book(self, symbol, params={}):
        orderbook = self.publicGetIdOrderbook(self.extend({
            'id': self.market_id(symbol),
        }, params))
        return self.parse_order_book(orderbook)

    def fetch_ticker(self, symbol, params={}):
        ticker = self.publicGetIdTicker(self.extend({
            'id': self.market_id(symbol),
        }, params))
        timestamp = self.milliseconds()
        baseVolume = self.safe_float(ticker, 'volume')
        vwap = self.safe_float(ticker, 'vwap')
        quoteVolume = baseVolume * vwap
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'max'),
            'low': self.safe_float(ticker, 'min'),
            'bid': self.safe_float(ticker, 'bid'),
            'ask': self.safe_float(ticker, 'ask'),
            'vwap': vwap,
            'open': None,
            'close': None,
            'first': None,
            'last': self.safe_float(ticker, 'last'),
            'change': None,
            'percentage': None,
            'average': self.safe_float(ticker, 'average'),
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }

    def parse_trade(self, trade, market):
        timestamp = trade['date'] * 1000
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': trade['type'],
            'price': trade['price'],
            'amount': trade['amount'],
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        market = self.market(symbol)
        response = self.publicGetIdTrades(self.extend({
            'id': market['id'],
        }, params))
        return self.parse_trades(response, market)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        market = self.market(symbol)
        return self.privatePostTrade(self.extend({
            'type': side,
            'currency': market['base'],
            'amount': amount,
            'payment_currency': market['quote'],
            'rate': price,
        }, params))

    def cancel_order(self, id, symbol=None, params={}):
        return self.privatePostCancel({'id': id})

    def is_fiat(self, currency):
        fiatCurrencies = {
            'USD': True,
            'EUR': True,
            'PLN': True,
        }
        if currency in fiatCurrencies:
            return True
        return False

    def withdraw(self, currency, amount, address, params={}):
        self.load_markets()
        method = None
        request = {
            'currency': currency,
            'quantity': amount,
        }
        if self.is_fiat(currency):
            method = 'privatePostWithdraw'
            # request['account'] = params['account']  # they demand an account number
            # request['express'] = params['express']  # whatever it means, they don't explain
            # request['bic'] = ''
        else:
            method = 'privatePostTransfer'
            request['address'] = address
        response = getattr(self, method)(self.extend(request, params))
        return {
            'info': response,
            'id': None,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        if api == 'public':
            url += '/' + self.implode_params(path, params) + '.json'
        else:
            self.check_required_credentials()
            body = self.urlencode(self.extend({
                'method': path,
                'moment': self.nonce(),
            }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'API-Key': self.apiKey,
                'API-Hash': self.hmac(self.encode(body), self.encode(self.secret), hashlib.sha512),
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}
