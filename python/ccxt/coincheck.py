# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NotSupported


class coincheck (Exchange):

    def describe(self):
        return self.deep_extend(super(coincheck, self).describe(), {
            'id': 'coincheck',
            'name': 'coincheck',
            'countries': ['JP', 'ID'],
            'rateLimit': 1500,
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg',
                'api': 'https://coincheck.com/api',
                'www': 'https://coincheck.com',
                'doc': 'https://coincheck.com/documents/exchange/api',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/orders/rate',
                        'order_books',
                        'rate/{pair}',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/balance',
                        'accounts/leverage_balance',
                        'bank_accounts',
                        'deposit_money',
                        'exchange/orders/opens',
                        'exchange/orders/transactions',
                        'exchange/orders/transactions_pagination',
                        'exchange/leverage/positions',
                        'lending/borrows/matches',
                        'send_money',
                        'withdraws',
                    ],
                    'post': [
                        'bank_accounts',
                        'deposit_money/{id}/fast',
                        'exchange/orders',
                        'exchange/transfers/to_leverage',
                        'exchange/transfers/from_leverage',
                        'lending/borrows',
                        'lending/borrows/{id}/repay',
                        'send_money',
                        'withdraws',
                    ],
                    'delete': [
                        'bank_accounts/{id}',
                        'exchange/orders/{id}',
                        'withdraws/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/JPY': {'id': 'btc_jpy', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY'},  # the only real pair
                # 'ETH/JPY': {'id': 'eth_jpy', 'symbol': 'ETH/JPY', 'base': 'ETH', 'quote': 'JPY'},
                # 'ETC/JPY': {'id': 'etc_jpy', 'symbol': 'ETC/JPY', 'base': 'ETC', 'quote': 'JPY'},
                # 'DAO/JPY': {'id': 'dao_jpy', 'symbol': 'DAO/JPY', 'base': 'DAO', 'quote': 'JPY'},
                # 'LSK/JPY': {'id': 'lsk_jpy', 'symbol': 'LSK/JPY', 'base': 'LSK', 'quote': 'JPY'},
                # 'FCT/JPY': {'id': 'fct_jpy', 'symbol': 'FCT/JPY', 'base': 'FCT', 'quote': 'JPY'},
                # 'XMR/JPY': {'id': 'xmr_jpy', 'symbol': 'XMR/JPY', 'base': 'XMR', 'quote': 'JPY'},
                # 'REP/JPY': {'id': 'rep_jpy', 'symbol': 'REP/JPY', 'base': 'REP', 'quote': 'JPY'},
                # 'XRP/JPY': {'id': 'xrp_jpy', 'symbol': 'XRP/JPY', 'base': 'XRP', 'quote': 'JPY'},
                # 'ZEC/JPY': {'id': 'zec_jpy', 'symbol': 'ZEC/JPY', 'base': 'ZEC', 'quote': 'JPY'},
                # 'XEM/JPY': {'id': 'xem_jpy', 'symbol': 'XEM/JPY', 'base': 'XEM', 'quote': 'JPY'},
                # 'LTC/JPY': {'id': 'ltc_jpy', 'symbol': 'LTC/JPY', 'base': 'LTC', 'quote': 'JPY'},
                # 'DASH/JPY': {'id': 'dash_jpy', 'symbol': 'DASH/JPY', 'base': 'DASH', 'quote': 'JPY'},
                # 'ETH/BTC': {'id': 'eth_btc', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC'},
                # 'ETC/BTC': {'id': 'etc_btc', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC'},
                # 'LSK/BTC': {'id': 'lsk_btc', 'symbol': 'LSK/BTC', 'base': 'LSK', 'quote': 'BTC'},
                # 'FCT/BTC': {'id': 'fct_btc', 'symbol': 'FCT/BTC', 'base': 'FCT', 'quote': 'BTC'},
                # 'XMR/BTC': {'id': 'xmr_btc', 'symbol': 'XMR/BTC', 'base': 'XMR', 'quote': 'BTC'},
                # 'REP/BTC': {'id': 'rep_btc', 'symbol': 'REP/BTC', 'base': 'REP', 'quote': 'BTC'},
                # 'XRP/BTC': {'id': 'xrp_btc', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC'},
                # 'ZEC/BTC': {'id': 'zec_btc', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC'},
                # 'XEM/BTC': {'id': 'xem_btc', 'symbol': 'XEM/BTC', 'base': 'XEM', 'quote': 'BTC'},
                # 'LTC/BTC': {'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                # 'DASH/BTC': {'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC'},
            },
        })

    def fetch_balance(self, params={}):
        balances = self.privateGetAccountsBalance()
        result = {'info': balances}
        currencies = list(self.currencies.keys())
        for i in range(0, len(currencies)):
            currency = currencies[i]
            lowercase = currency.lower()
            account = self.account()
            if lowercase in balances:
                account['free'] = float(balances[lowercase])
            reserved = lowercase + '_reserved'
            if reserved in balances:
                account['used'] = float(balances[reserved])
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        if symbol != 'BTC/JPY':
            raise NotSupported(self.id + ' fetchOrderBook() supports BTC/JPY only')
        orderbook = self.publicGetOrderBooks(params)
        return self.parse_order_book(orderbook)

    def fetch_ticker(self, symbol, params={}):
        if symbol != 'BTC/JPY':
            raise NotSupported(self.id + ' fetchTicker() supports BTC/JPY only')
        ticker = self.publicGetTicker(params)
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
            'baseVolume': float(ticker['volume']),
            'quoteVolume': None,
            'info': ticker,
        }

    def parse_trade(self, trade, market):
        timestamp = self.parse8601(trade['created_at'])
        return {
            'id': str(trade['id']),
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': trade['order_type'],
            'price': float(trade['rate']),
            'amount': float(trade['amount']),
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        if symbol != 'BTC/JPY':
            raise NotSupported(self.id + ' fetchTrades() supports BTC/JPY only')
        market = self.market(symbol)
        response = self.publicGetTrades(params)
        return self.parse_trades(response, market, since, limit)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        prefix = ''
        order = {
            'pair': self.market_id(symbol),
        }
        if type == 'market':
            order_type = type + '_' + side
            order['order_type'] = order_type
            prefix = (order_type + '_') if (side == 'buy') else ''
            order[prefix + 'amount'] = amount
        else:
            order['order_type'] = side
            order['rate'] = price
            order['amount'] = amount
        response = self.privatePostExchangeOrders(self.extend(order, params))
        return {
            'info': response,
            'id': str(response['id']),
        }

    def cancel_order(self, id, symbol=None, params={}):
        return self.privateDeleteExchangeOrdersId({'id': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
            nonce = str(self.nonce())
            queryString = ''
            if method == 'GET':
                if query:
                    url += '?' + self.urlencode(self.keysort(query))
            else:
                if query:
                    body = self.urlencode(self.keysort(query))
                    queryString = body
            auth = nonce + url + queryString
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'ACCESS-KEY': self.apiKey,
                'ACCESS-NONCE': nonce,
                'ACCESS-SIGNATURE': self.hmac(self.encode(auth), self.encode(self.secret)),
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if api == 'public':
            return response
        if 'success' in response:
            if response['success']:
                return response
        raise ExchangeError(self.id + ' ' + self.json(response))
