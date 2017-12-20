# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import base64
import hashlib
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NotSupported


class bithumb (Exchange):

    def describe(self):
        return self.deep_extend(super(bithumb, self).describe(), {
            'id': 'bithumb',
            'name': 'Bithumb',
            'countries': 'KR',  # South Korea
            'rateLimit': 500,
            'hasCORS': True,
            'hasFetchTickers': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg',
                'api': {
                    'public': 'https://api.bithumb.com/public',
                    'private': 'https://api.bithumb.com',
                },
                'www': 'https://www.bithumb.com',
                'doc': 'https://www.bithumb.com/u1/US127',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker/{currency}',
                        'ticker/all',
                        'orderbook/{currency}',
                        'orderbook/all',
                        'recent_transactions/{currency}',
                        'recent_transactions/all',
                    ],
                },
                'private': {
                    'post': [
                        'info/account',
                        'info/balance',
                        'info/wallet_address',
                        'info/ticker',
                        'info/orders',
                        'info/user_transactions',
                        'trade/place',
                        'info/order_detail',
                        'trade/cancel',
                        'trade/btc_withdrawal',
                        'trade/krw_deposit',
                        'trade/krw_withdrawal',
                        'trade/market_buy',
                        'trade/market_sell',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.15 / 100,
                    'taker': 0.15 / 100,
                },
            },
        })

    def fetch_markets(self):
        markets = self.publicGetTickerAll()
        currencies = list(markets['data'].keys())
        result = []
        for i in range(0, len(currencies)):
            id = currencies[i]
            if id != 'date':
                market = markets['data'][id]
                base = id
                quote = 'KRW'
                symbol = id + '/' + quote
                result.append(self.extend(self.fees['trading'], {
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'info': market,
                    'lot': None,
                    'active': True,
                    'precision': {
                        'amount': None,
                        'price': None,
                    },
                    'limits': {
                        'amount': {
                            'min': None,
                            'max': None,
                        },
                        'price': {
                            'min': None,
                            'max': None,
                        },
                        'cost': {
                            'min': None,
                            'max': None,
                        },
                    },
                }))
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        response = self.privatePostInfoBalance(self.extend({
            'currency': 'ALL',
        }, params))
        result = {'info': response}
        balances = response['data']
        currencies = list(self.currencies.keys())
        for i in range(0, len(currencies)):
            currency = currencies[i]
            account = self.account()
            lowercase = currency.lower()
            account['total'] = self.safe_float(balances, 'total_' + lowercase)
            account['used'] = self.safe_float(balances, 'in_use_' + lowercase)
            account['free'] = self.safe_float(balances, 'available_' + lowercase)
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetOrderbookCurrency(self.extend({
            'count': 50,  # max = 50
            'currency': market['base'],
        }, params))
        orderbook = response['data']
        timestamp = int(orderbook['timestamp'])
        return self.parse_order_book(orderbook, timestamp, 'bids', 'asks', 'price', 'quantity')

    def parse_ticker(self, ticker, market=None):
        timestamp = int(ticker['date'])
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'max_price'),
            'low': self.safe_float(ticker, 'min_price'),
            'bid': self.safe_float(ticker, 'buy_price'),
            'ask': self.safe_float(ticker, 'sell_price'),
            'vwap': None,
            'open': self.safe_float(ticker, 'opening_price'),
            'close': self.safe_float(ticker, 'closing_price'),
            'first': None,
            'last': self.safe_float(ticker, 'last_trade'),
            'change': None,
            'percentage': None,
            'average': self.safe_float(ticker, 'average_price'),
            'baseVolume': self.safe_float(ticker, 'volume_1day'),
            'quoteVolume': None,
            'info': ticker,
        }

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        response = self.publicGetTickerAll(params)
        result = {}
        timestamp = response['data']['date']
        tickers = self.omit(response['data'], 'date')
        ids = list(tickers.keys())
        for i in range(0, len(ids)):
            id = ids[i]
            symbol = id
            market = None
            if id in self.markets_by_id:
                market = self.markets_by_id[id]
                symbol = market['symbol']
            ticker = tickers[id]
            ticker['date'] = timestamp
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetTickerCurrency(self.extend({
            'currency': market['base'],
        }, params))
        return self.parse_ticker(response['data'], market)

    def parse_trade(self, trade, market):
        # a workaround for their bug in date format, hours are not 0-padded
        transaction_date, transaction_time = trade['transaction_date'].split(' ')
        transaction_time_short = len(transaction_time) < 8
        if transaction_time_short:
            transaction_time = '0' + transaction_time
        timestamp = self.parse8601(transaction_date + ' ' + transaction_time)
        side = 'sell' if (trade['type'] == 'ask') else 'buy'
        return {
            'id': None,
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': None,
            'type': None,
            'side': side,
            'price': float(trade['price']),
            'amount': float(trade['units_traded']),
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetRecentTransactionsCurrency(self.extend({
            'currency': market['base'],
            'count': 100,  # max = 100
        }, params))
        return self.parse_trades(response['data'], market, since, limit)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        raise NotSupported(self.id + ' private API not implemented yet')
        #     prefix = ''
        #     if type == 'market':
        #         prefix = 'market_'
        #     order = {
        #         'pair': self.market_id(symbol),
        #         'quantity': amount,
        #         'price': price or 0,
        #         'type': prefix + side,
        #     }
        #     response = self.privatePostOrderCreate(self.extend(order, params))
        #     return {
        #         'info': response,
        #         'id': str(response['order_id']),
        #     }

    def cancel_order(self, id, symbol=None, params={}):
        side = ('side' in list(params.keys()))
        if not side:
            raise ExchangeError(self.id + ' cancelOrder requires a side parameter(sell or buy)')
        side = 'purchase' if (side == 'buy') else 'sales'
        currency = ('currency' in list(params.keys()))
        if not currency:
            raise ExchangeError(self.id + ' cancelOrder requires a currency parameter')
        return self.privatePostTradeCancel({
            'order_id': id,
            'type': params['side'],
            'currency': params['currency'],
        })

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        endpoint = '/' + self.implode_params(path, params)
        url = self.urls['api'][api] + endpoint
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
            body = self.urlencode(self.extend({
                'endpoint': endpoint,
            }, query))
            nonce = str(self.nonce())
            auth = endpoint + "\0" + body + "\0" + nonce
            signature = self.hmac(self.encode(auth), self.encode(self.secret), hashlib.sha512)
            headers = {
                'Api-Key': self.apiKey,
                'Api-Sign': self.decode(base64.b64encode(self.encode(signature))),
                'Api-Nonce': nonce,
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'status' in response:
            if response['status'] == '0000':
                return response
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
