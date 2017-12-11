# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
from ccxt.base.errors import ExchangeError


class bitso (Exchange):

    def describe(self):
        return self.deep_extend(super(bitso, self).describe(), {
            'id': 'bitso',
            'name': 'Bitso',
            'countries': 'MX',  # Mexico
            'rateLimit': 2000,  # 30 requests per minute
            'version': 'v3',
            'hasCORS': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg',
                'api': 'https://api.bitso.com',
                'www': 'https://bitso.com',
                'doc': 'https://bitso.com/api_info',
            },
            'api': {
                'public': {
                    'get': [
                        'available_books',
                        'ticker',
                        'order_book',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'account_status',
                        'balance',
                        'fees',
                        'fundings',
                        'fundings/{fid}',
                        'funding_destination',
                        'kyc_documents',
                        'ledger',
                        'ledger/trades',
                        'ledger/fees',
                        'ledger/fundings',
                        'ledger/withdrawals',
                        'mx_bank_codes',
                        'open_orders',
                        'order_trades/{oid}',
                        'orders/{oid}',
                        'user_trades',
                        'user_trades/{tid}',
                        'withdrawals/',
                        'withdrawals/{wid}',
                    ],
                    'post': [
                        'bitcoin_withdrawal',
                        'debit_card_withdrawal',
                        'ether_withdrawal',
                        'orders',
                        'phone_number',
                        'phone_verification',
                        'phone_withdrawal',
                        'spei_withdrawal',
                    ],
                    'delete': [
                        'orders/{oid}',
                        'orders/all',
                    ],
                },
            },
        })

    def fetch_markets(self):
        markets = self.publicGetAvailableBooks()
        result = []
        for i in range(0, len(markets['payload'])):
            market = markets['payload'][i]
            id = market['book']
            symbol = id.upper().replace('_', '/')
            base, quote = symbol.split('/')
            limits = {
                'amount': {
                    'min': float(market['minimum_amount']),
                    'max': float(market['maximum_amount']),
                },
                'price': {
                    'min': float(market['minimum_price']),
                    'max': float(market['maximum_price']),
                },
                'cost': {
                    'min': float(market['minimum_value']),
                    'max': float(market['maximum_value']),
                },
            }
            precision = {
                'amount': self.precision_from_string(market['minimum_amount']),
                'price': self.precision_from_string(market['minimum_price']),
            }
            lot = limits['amount']['min']
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'lot': lot,
                'limits': limits,
                'precision': precision,
            })
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        response = self.privateGetBalance()
        balances = response['payload']['balances']
        result = {'info': response}
        for b in range(0, len(balances)):
            balance = balances[b]
            currency = balance['currency'].upper()
            account = {
                'free': float(balance['available']),
                'used': float(balance['locked']),
                'total': float(balance['total']),
            }
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        response = self.publicGetOrderBook(self.extend({
            'book': self.market_id(symbol),
        }, params))
        orderbook = response['payload']
        timestamp = self.parse8601(orderbook['updated_at'])
        return self.parse_order_book(orderbook, timestamp, 'bids', 'asks', 'price', 'amount')

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        response = self.publicGetTicker(self.extend({
            'book': self.market_id(symbol),
        }, params))
        ticker = response['payload']
        timestamp = self.parse8601(ticker['created_at'])
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
            'open': None,
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
        timestamp = self.parse8601(trade['created_at'])
        symbol = None
        if not market:
            if 'book' in trade:
                market = self.markets_by_id[trade['book']]
        if market:
            symbol = market['symbol']
        return {
            'id': str(trade['tid']),
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'order': None,
            'type': None,
            'side': trade['maker_side'],
            'price': float(trade['price']),
            'amount': float(trade['amount']),
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetTrades(self.extend({
            'book': market['id'],
        }, params))
        return self.parse_trades(response['payload'], market, since, limit)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        order = {
            'book': self.market_id(symbol),
            'side': side,
            'type': type,
            'major': self.amount_to_precision(symbol, amount),
        }
        if type == 'limit':
            order['price'] = self.price_to_precision(symbol, price)
        response = self.privatePostOrders(self.extend(order, params))
        return {
            'info': response,
            'id': response['payload']['oid'],
        }

    def cancel_order(self, id, symbol=None, params={}):
        self.load_markets()
        return self.privateDeleteOrders({'oid': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        query = '/' + self.version + '/' + self.implode_params(path, params)
        url = self.urls['api'] + query
        if api == 'public':
            if params:
                url += '?' + self.urlencode(params)
        else:
            self.check_required_credentials()
            nonce = str(self.nonce())
            request = ''.join([nonce, method, query])
            if params:
                body = self.json(params)
                request += body
            signature = self.hmac(self.encode(request), self.encode(self.secret))
            auth = self.apiKey + ':' + nonce + ':' + signature
            headers = {
                'Authorization': "Bitso " + auth,
                'Content-Type': 'application/json',
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'success' in response:
            if response['success']:
                return response
        raise ExchangeError(self.id + ' ' + self.json(response))
