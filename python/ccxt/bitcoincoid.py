# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError


class bitcoincoid (Exchange):

    def describe(self):
        return self.deep_extend(super(bitcoincoid, self).describe(), {
            'id': 'bitcoincoid',
            'name': 'Bitcoin.co.id',
            'countries': 'ID',  # Indonesia
            'hasCORS': False,
            'version': '1.7',  # as of 6 November 2017
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766138-043c7786-5ecf-11e7-882b-809c14f38b53.jpg',
                'api': {
                    'public': 'https://vip.bitcoin.co.id/api',
                    'private': 'https://vip.bitcoin.co.id/tapi',
                },
                'www': 'https://www.bitcoin.co.id',
                'doc': [
                    'https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf',
                    'https://vip.bitcoin.co.id/trade_api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{pair}/ticker',
                        '{pair}/trades',
                        '{pair}/depth',
                    ],
                },
                'private': {
                    'post': [
                        'getInfo',
                        'transHistory',
                        'trade',
                        'tradeHistory',
                        'openOrders',
                        'cancelOrder',
                    ],
                },
            },
            'markets': {
                'BTC/IDR': {'id': 'btc_idr', 'symbol': 'BTC/IDR', 'base': 'BTC', 'quote': 'IDR', 'baseId': 'btc', 'quoteId': 'idr'},
                'BCH/IDR': {'id': 'bch_idr', 'symbol': 'BCH/IDR', 'base': 'BCH', 'quote': 'IDR', 'baseId': 'bch', 'quoteId': 'idr'},
                'BTG/IDR': {'id': 'btg_idr', 'symbol': 'BTG/IDR', 'base': 'BTG', 'quote': 'IDR', 'baseId': 'btg', 'quoteId': 'idr'},
                'ETH/IDR': {'id': 'eth_idr', 'symbol': 'ETH/IDR', 'base': 'ETH', 'quote': 'IDR', 'baseId': 'eth', 'quoteId': 'idr'},
                'ETC/IDR': {'id': 'etc_idr', 'symbol': 'ETC/IDR', 'base': 'ETC', 'quote': 'IDR', 'baseId': 'etc', 'quoteId': 'idr'},
                'LTC/IDR': {'id': 'ltc_idr', 'symbol': 'LTC/IDR', 'base': 'LTC', 'quote': 'IDR', 'baseId': 'ltc', 'quoteId': 'idr'},
                'NXT/IDR': {'id': 'nxt_idr', 'symbol': 'NXT/IDR', 'base': 'NXT', 'quote': 'IDR', 'baseId': 'nxt', 'quoteId': 'idr'},
                'WAVES/IDR': {'id': 'waves_idr', 'symbol': 'WAVES/IDR', 'base': 'WAVES', 'quote': 'IDR', 'baseId': 'waves', 'quoteId': 'idr'},
                'XRP/IDR': {'id': 'xrp_idr', 'symbol': 'XRP/IDR', 'base': 'XRP', 'quote': 'IDR', 'baseId': 'xrp', 'quoteId': 'idr'},
                'XZC/IDR': {'id': 'xzc_idr', 'symbol': 'XZC/IDR', 'base': 'XZC', 'quote': 'IDR', 'baseId': 'xzc', 'quoteId': 'idr'},
                'XLM/IDR': {'id': 'str_idr', 'symbol': 'XLM/IDR', 'base': 'XLM', 'quote': 'IDR', 'baseId': 'str', 'quoteId': 'idr'},
                'BTS/BTC': {'id': 'bts_btc', 'symbol': 'BTS/BTC', 'base': 'BTS', 'quote': 'BTC', 'baseId': 'bts', 'quoteId': 'btc'},
                'DASH/BTC': {'id': 'drk_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC', 'baseId': 'drk', 'quoteId': 'btc'},
                'DOGE/BTC': {'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC', 'baseId': 'doge', 'quoteId': 'btc'},
                'ETH/BTC': {'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'baseId': 'eth', 'quoteId': 'btc'},
                'LTC/BTC': {'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'baseId': 'ltc', 'quoteId': 'btc'},
                'NXT/BTC': {'id': 'nxt_btc', 'symbol': 'NXT/BTC', 'base': 'NXT', 'quote': 'BTC', 'baseId': 'nxt', 'quoteId': 'btc'},
                'XLM/BTC': {'id': 'str_btc', 'symbol': 'XLM/BTC', 'base': 'XLM', 'quote': 'BTC', 'baseId': 'str', 'quoteId': 'btc'},
                'XEM/BTC': {'id': 'nem_btc', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC', 'baseId': 'nem', 'quoteId': 'btc'},
                'XRP/BTC': {'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'baseId': 'xrp', 'quoteId': 'btc'},
            },
        })

    def fetch_balance(self, params={}):
        response = self.privatePostGetInfo()
        balance = response['return']
        result = {'info': balance}
        currencies = list(self.currencies.keys())
        for i in range(0, len(currencies)):
            currency = currencies[i]
            lowercase = currency.lower()
            account = self.account()
            account['free'] = self.safe_float(balance['balance'], lowercase, 0.0)
            account['used'] = self.safe_float(balance['balance_hold'], lowercase, 0.0)
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        orderbook = self.publicGetPairDepth(self.extend({
            'pair': self.market_id(symbol),
        }, params))
        return self.parse_order_book(orderbook, None, 'buy', 'sell')

    def fetch_ticker(self, symbol, params={}):
        market = self.market(symbol)
        response = self.publicGetPairTicker(self.extend({
            'pair': market['id'],
        }, params))
        ticker = response['ticker']
        timestamp = float(ticker['server_time']) * 1000
        baseVolume = 'vol_' + market['baseId'].lower()
        quoteVolume = 'vol_' + market['quoteId'].lower()
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['buy']),
            'ask': float(ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker[baseVolume]),
            'quoteVolume': float(ticker[quoteVolume]),
            'info': ticker,
        }

    def parse_trade(self, trade, market):
        timestamp = int(trade['date']) * 1000
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': trade['type'],
            'price': float(trade['price']),
            'amount': float(trade['amount']),
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        market = self.market(symbol)
        response = self.publicGetPairTrades(self.extend({
            'pair': market['id'],
        }, params))
        return self.parse_trades(response, market, since, limit)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        market = self.market(symbol)
        order = {
            'pair': market['id'],
            'type': side,
            'price': price,
        }
        base = market['baseId']
        order[base] = amount
        result = self.privatePostTrade(self.extend(order, params))
        return {
            'info': result,
            'id': str(result['return']['order_id']),
        }

    def cancel_order(self, id, symbol=None, params={}):
        return self.privatePostCancelOrder(self.extend({
            'order_id': id,
        }, params))

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        if api == 'public':
            url += '/' + self.implode_params(path, params)
        else:
            self.check_required_credentials()
            body = self.urlencode(self.extend({
                'method': path,
                'nonce': self.nonce(),
            }, params))
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': self.apiKey,
                'Sign': self.hmac(self.encode(body), self.encode(self.secret), hashlib.sha512),
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'error' in response:
            raise ExchangeError(self.id + ' ' + response['error'])
        return response
