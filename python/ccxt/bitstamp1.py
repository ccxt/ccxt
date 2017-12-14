# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NotSupported


class bitstamp1 (Exchange):

    def describe(self):
        return self.deep_extend(super(bitstamp1, self).describe(), {
            'id': 'bitstamp1',
            'name': 'Bitstamp v1',
            'countries': 'GB',
            'rateLimit': 1000,
            'version': 'v1',
            'hasCORS': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api': 'https://www.bitstamp.net/api',
                'www': 'https://www.bitstamp.net',
                'doc': 'https://www.bitstamp.net/api',
            },
            'requiredCredentials': {
                'apiKey': True,
                'secret': True,
                'uid': True,
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'ticker_hour',
                        'order_book',
                        'transactions',
                        'eur_usd',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'user_transactions',
                        'open_orders',
                        'order_status',
                        'cancel_order',
                        'cancel_all_orders',
                        'buy',
                        'sell',
                        'bitcoin_deposit_address',
                        'unconfirmed_btc',
                        'ripple_withdrawal',
                        'ripple_address',
                        'withdrawal_requests',
                        'bitcoin_withdrawal',
                    ],
                },
            },
            'markets': {
                'BTC/USD': {'id': 'btcusd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'maker': 0.0025, 'taker': 0.0025},
                'BTC/EUR': {'id': 'btceur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'maker': 0.0025, 'taker': 0.0025},
                'EUR/USD': {'id': 'eurusd', 'symbol': 'EUR/USD', 'base': 'EUR', 'quote': 'USD', 'maker': 0.0025, 'taker': 0.0025},
                'XRP/USD': {'id': 'xrpusd', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD', 'maker': 0.0025, 'taker': 0.0025},
                'XRP/EUR': {'id': 'xrpeur', 'symbol': 'XRP/EUR', 'base': 'XRP', 'quote': 'EUR', 'maker': 0.0025, 'taker': 0.0025},
                'XRP/BTC': {'id': 'xrpbtc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC', 'maker': 0.0025, 'taker': 0.0025},
                'LTC/USD': {'id': 'ltcusd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'maker': 0.0025, 'taker': 0.0025},
                'LTC/EUR': {'id': 'ltceur', 'symbol': 'LTC/EUR', 'base': 'LTC', 'quote': 'EUR', 'maker': 0.0025, 'taker': 0.0025},
                'LTC/BTC': {'id': 'ltcbtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'maker': 0.0025, 'taker': 0.0025},
                'ETH/USD': {'id': 'ethusd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'maker': 0.0025, 'taker': 0.0025},
                'ETH/EUR': {'id': 'etheur', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR', 'maker': 0.0025, 'taker': 0.0025},
                'ETH/BTC': {'id': 'ethbtc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'maker': 0.0025, 'taker': 0.0025},
            },
        })

    def fetch_order_book(self, symbol, params={}):
        if symbol != 'BTC/USD':
            raise ExchangeError(self.id + ' ' + self.version + " fetchOrderBook doesn't support " + symbol + ', use it for BTC/USD only')
        orderbook = self.publicGetOrderBook(params)
        timestamp = int(orderbook['timestamp']) * 1000
        return self.parse_order_book(orderbook, timestamp)

    def fetch_ticker(self, symbol, params={}):
        if symbol != 'BTC/USD':
            raise ExchangeError(self.id + ' ' + self.version + " fetchTicker doesn't support " + symbol + ', use it for BTC/USD only')
        ticker = self.publicGetTicker(params)
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

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        if symbol != 'BTC/USD':
            raise ExchangeError(self.id + ' ' + self.version + " fetchTrades doesn't support " + symbol + ', use it for BTC/USD only')
        market = self.market(symbol)
        response = self.publicGetTransactions(self.extend({
            'time': 'minute',
        }, params))
        return self.parse_trades(response, market, since, limit)

    def fetch_balance(self, params={}):
        balance = self.privatePostBalance()
        result = {'info': balance}
        currencies = list(self.currencies.keys())
        for i in range(0, len(currencies)):
            currency = currencies[i]
            lowercase = currency.lower()
            total = lowercase + '_balance'
            free = lowercase + '_available'
            used = lowercase + '_reserved'
            account = self.account()
            account['free'] = self.safe_float(balance, free, 0.0)
            account['used'] = self.safe_float(balance, used, 0.0)
            account['total'] = self.safe_float(balance, total, 0.0)
            result[currency] = account
        return self.parse_balance(result)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        if type != 'limit':
            raise ExchangeError(self.id + ' ' + self.version + ' accepts limit orders only')
        if symbol != 'BTC/USD':
            raise ExchangeError(self.id + ' v1 supports BTC/USD orders only')
        method = 'privatePost' + self.capitalize(side)
        order = {
            'amount': amount,
            'price': price,
        }
        response = getattr(self, method)(self.extend(order, params))
        return {
            'info': response,
            'id': response['id'],
        }

    def cancel_order(self, id, symbol=None, params={}):
        return self.privatePostCancelOrder({'id': id})

    def parse_order_status(self, order):
        if (order['status'] == 'Queue') or (order['status'] == 'Open'):
            return 'open'
        if order['status'] == 'Finished':
            return 'closed'
        return order['status']

    def fetch_order_status(self, id, symbol=None):
        self.load_markets()
        response = self.privatePostOrderStatus({'id': id})
        return self.parse_order_status(response)

    def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        market = None
        if symbol:
            market = self.market(symbol)
        pair = market['id'] if market else 'all'
        request = self.extend({'id': pair}, params)
        response = self.privatePostOpenOrdersId(request)
        return self.parse_trades(response, market, since, limit)

    def fetch_order(self, id, symbol=None, params={}):
        raise NotSupported(self.id + ' fetchOrder is not implemented yet')
        self.load_markets()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
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

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'status' in response:
            if response['status'] == 'error':
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
