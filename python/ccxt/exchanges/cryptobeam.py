import ccxt.base.exchange
import ccxt.base.errors
import hashlib
import hmac
import json
import time
from urllib.parse import urlencode

class cryptobeam(ccxt.base.exchange.Exchange):

    def __init__(self, config={}):
        super().__init__(config)
        self.id = 'cryptobeam'
        self.name = 'Cryptobeam'
        self.version = '1.0.0'
        self.rateLimit = 1000
        self.hostname = 'api.cryptobeam.us'
        self.urls = {
            'logo': 'https://cryptobeam.com/logo.png',
            'api': 'https://api.cryptobeam.us',
            'www': 'https://cryptobeam.com',
            'doc': 'https://docs.cryptobeam.com',
            'fees': 'https://cryptobeam.com/fees',
        }

    def describe(self):
        return self.deepExtend(super().describe(), {
            'id': self.id,
            'name': self.name,
            'version': self.version,
            'countries': ['US'],
            'rateLimit': 1000,
            'has': {
                'fetchMarkets': True,
                'fetchCurrencies': True,
                'fetchTicker': True,
                'fetchTickers': True,
                'fetchOrderBook': True,
                'fetchTrades': True,
                'fetchOHLCV': True,
                'fetchBalance': True,
                'createOrder': True,
                'cancelOrder': True,
                'fetchOrder': True,
                'fetchOpenOrders': True,
                'fetchClosedOrders': True,
                'fetchMyTrades': True,
                'fetchDepositAddress': True,
                'fetchDeposits': True,
                'fetchWithdrawals': True,
                'withdraw': True,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'api': {
                'public': {
                    'get': [
                        'api/ccxt/exchange',
                        'api/ccxt/markets',
                        'api/ccxt/currencies',
                        'api/ccxt/ticker',
                        'api/ccxt/tickers',
                        'api/ccxt/orderbook',
                        'api/ccxt/trades',
                        'api/ccxt/ohlcv',
                    ],
                },
                'private': {
                    'get': [
                        'api/ccxt/balance',
                        'api/ccxt/order',
                        'api/ccxt/orders',
                        'api/ccxt/myTrades',
                        'api/ccxt/deposit',
                        'api/ccxt/deposits',
                        'api/ccxt/withdrawals',
                    ],
                    'post': [
                        'api/ccxt/createOrder',
                        'api/ccxt/cancelOrder',
                        'api/ccxt/withdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.001,
                },
            },
        })

    def fetchMarkets(self, params={}):
        response = self.publicGetApiCcxtMarkets(params)

        markets = []
        for market in response['data']:
            base = market['base']
            quote = market['quote']
            symbol = f"{base}/{quote}"

            markets.append({
                'id': market['id'],
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': None,
                'baseId': market.get('baseId', base.lower()),
                'quoteId': market.get('quoteId', quote.lower()),
                'settleId': None,
                'type': 'spot',
                'spot': True,
                'margin': False,
                'swap': False,
                'future': False,
                'option': False,
                'active': market.get('active', True),
                'contract': False,
                'linear': None,
                'inverse': None,
                'contractSize': None,
                'expiry': None,
                'expiryDatetime': None,
                'strike': None,
                'optionType': None,
                'precision': {
                    'amount': market.get('amount_precision', 8),
                    'price': market.get('price_precision', 8),
                    'cost': None,
                },
                'limits': {
                    'amount': {
                        'min': market.get('amount_min'),
                        'max': market.get('amount_max'),
                    },
                    'price': {
                        'min': market.get('price_min'),
                        'max': market.get('price_max'),
                    },
                    'cost': {
                        'min': None,
                        'max': None,
                    },
                },
                'info': market,
            })

        return markets

    def fetchCurrencies(self, params={}):
        response = self.publicGetApiCcxtCurrencies(params)
        currencies = {}

        for currency in response['data']:
            code = currency['id'].upper()
            currencies[code] = {
                'id': currency['id'],
                'code': code,
                'name': currency.get('name'),
                'active': currency.get('active', True),
                'fee': currency.get('fee'),
                'precision': currency.get('precision', 8),
                'limits': {
                    'deposit': {
                        'min': currency.get('deposit_min'),
                        'max': currency.get('deposit_max'),
                    },
                    'withdraw': {
                        'min': currency.get('withdraw_min'),
                        'max': currency.get('withdraw_max'),
                    },
                },
                'info': currency,
            }

        return currencies

    def fetchTicker(self, symbol, params={}):
        self.loadMarkets()
        market = self.market(symbol)
        response = self.publicGetApiCcxtTicker({
            'symbol': market['id']
        })
        ticker = response['data']

        return {
            'symbol': symbol,
            'timestamp': ticker.get('timestamp'),
            'datetime': self.iso8601(ticker['timestamp']) if ticker.get('timestamp') else None,
            'high': ticker.get('high'),
            'low': ticker.get('low'),
            'bid': ticker.get('bid'),
            'bidVolume': ticker.get('bidVolume'),
            'ask': ticker.get('ask'),
            'askVolume': ticker.get('askVolume'),
            'vwap': ticker.get('vwap'),
            'open': ticker.get('open'),
            'close': ticker.get('close'),
            'last': ticker.get('last'),
            'previousClose': ticker.get('previousClose'),
            'change': ticker.get('change'),
            'percentage': ticker.get('percentage'),
            'average': ticker.get('average'),
            'baseVolume': ticker.get('baseVolume'),
            'quoteVolume': ticker.get('quoteVolume'),
            'info': ticker,
        }

    def fetchTickers(self, symbols=None, params={}):
        self.loadMarkets()
        response = self.publicGetApiCcxtTickers(params)

        tickers = {}
        for ticker_data in response['data'].values():
            symbol = self.safe_symbol(ticker_data.get('symbol'))
            if symbols is None or symbol in symbols:
                ticker = {
                    'symbol': symbol,
                    'timestamp': ticker_data.get('timestamp'),
                    'datetime': self.iso8601(ticker_data['timestamp']) if ticker_data.get('timestamp') else None,
                    'high': ticker_data.get('high'),
                    'low': ticker_data.get('low'),
                    'bid': ticker_data.get('bid'),
                    'bidVolume': ticker_data.get('bidVolume'),
                    'ask': ticker_data.get('ask'),
                    'askVolume': ticker_data.get('askVolume'),
                    'vwap': ticker_data.get('vwap'),
                    'open': ticker_data.get('open'),
                    'close': ticker_data.get('close'),
                    'last': ticker_data.get('last'),
                    'previousClose': ticker_data.get('previousClose'),
                    'change': ticker_data.get('change'),
                    'percentage': ticker_data.get('percentage'),
                    'average': ticker_data.get('average'),
                    'baseVolume': ticker_data.get('baseVolume'),
                    'quoteVolume': ticker_data.get('quoteVolume'),
                    'info': ticker_data,
                }
                tickers[symbol] = ticker

        return tickers

    def fetchOrderBook(self, symbol, limit=None, params={}):
        self.loadMarkets()
        market = self.market(symbol)
        request = {
            'symbol': market['id']
        }
        if limit is not None:
            request['limit'] = limit

        response = self.publicGetApiCcxtOrderbook(self.extend(request, params))

        orderbook = response['data']

        timestamp = orderbook.get('timestamp')
        return {
            'symbol': symbol,
            'bids': orderbook.get('bids', []),
            'asks': orderbook.get('asks', []),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp) if timestamp else None,
            'nonce': orderbook.get('nonce'),
        }

    def fetchTrades(self, symbol, since=None, limit=None, params={}):
        self.loadMarkets()
        market = self.market(symbol)
        request = {
            'symbol': market['id']
        }
        if since is not None:
            request['since'] = since
        if limit is not None:
            request['limit'] = limit

        response = self.publicGetApiCcxtTrades(self.extend(request, params))

        trades = []
        for trade in response['data']:
            trades.append({
                'id': trade.get('id'),
                'info': trade,
                'timestamp': trade.get('timestamp'),
                'datetime': self.iso8601(trade['timestamp']) if trade.get('timestamp') else None,
                'symbol': symbol,
                'type': None,
                'side': trade.get('side'),
                'takerOrMaker': trade.get('takerOrMaker'),
                'price': float(trade['price']),
                'amount': float(trade['amount']),
                'cost': float(trade.get('cost', 0)),
                'fee': {
                    'cost': trade.get('fee', {}).get('cost'),
                    'currency': trade.get('fee', {}).get('currency'),
                } if trade.get('fee') else None,
            })

        return self.filter_by_since_limit(trades, since, limit)

    def fetchOHLCV(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        self.loadMarkets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
            'timeframe': timeframe
        }
        if since is not None:
            request['since'] = since
        if limit is not None:
            request['limit'] = limit

        response = self.publicGetApiCcxtOhlcv(self.extend(request, params))

        ohlcv = []
        for candle in response['data']:
            ohlcv.append([
                candle['timestamp'],
                float(candle['open']),
                float(candle['high']),
                float(candle['low']),
                float(candle['close']),
                float(candle.get('volume', 0)),
            ])

        return self.filter_by_since_limit(ohlcv, since, limit)

    def fetchBalance(self, params={}):
        response = self.privateGetApiCcxtBalance(params)
        balances = response['data']

        result = {'info': balances}
        for currency_id, balance in balances.items():
            if isinstance(balance, dict):
                currency_code = self.safe_currency_code(currency_id)
                result[currency_code] = {
                    'free': self.safe_number(balance, 'free', 0.0),
                    'used': self.safe_number(balance, 'used', 0.0),
                    'total': self.safe_number(balance, 'total', 0.0),
                }

        return result

    def createOrder(self, symbol, type, side, amount, price=None, params={}):
        self.loadMarkets()
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
            'type': type,
            'side': side,
            'amount': amount,
        }
        if price is not None:
            request['price'] = price

        response = self.privatePostApiCcxtCreateOrder(self.extend(request, params))
        order = response['data']

        return {
            'id': order.get('id'),
            'info': order,
            'timestamp': order.get('timestamp'),
            'datetime': self.iso8601(order.get('timestamp')) if order.get('timestamp') else None,
            'lastTradeTimestamp': None,
            'status': order.get('status'),
            'symbol': symbol,
            'type': order.get('type'),
            'side': order.get('side'),
            'price': order.get('price'),
            'cost': order.get('cost'),
            'amount': order.get('amount'),
            'filled': order.get('filled'),
            'remaining': order.get('remaining'),
            'fee': order.get('fee'),
            'trades': [],
            'clientOrderId': order.get('clientOrderId'),
        }

    def cancelOrder(self, id, symbol=None, params={}):
        if symbol is not None:
            self.loadMarkets()
            market = self.market(symbol)
            request = {
                'id': id,
                'symbol': market['id']
            }
        else:
            request = {'id': id}

        response = self.privatePostApiCcxtCancelOrder(self.extend(request, params))
        order = response['data']

        return {
            'id': order.get('id'),
            'info': order,
            'timestamp': order.get('timestamp'),
            'datetime': self.iso8601(order.get('timestamp')) if order.get('timestamp') else None,
            'lastTradeTimestamp': None,
            'status': order.get('status'),
            'symbol': symbol,
            'type': order.get('type'),
            'side': order.get('side'),
            'price': order.get('price'),
            'cost': order.get('cost'),
            'amount': order.get('amount'),
            'filled': order.get('filled'),
            'remaining': order.get('remaining'),
            'fee': order.get('fee'),
            'trades': [],
            'clientOrderId': order.get('clientOrderId'),
        }

    def fetchOrder(self, id, symbol=None, params={}):
        request = {'id': id}
        if symbol is not None:
            self.loadMarkets()
            market = self.market(symbol)
            request['symbol'] = market['id']

        response = self.privateGetApiCcxtOrder(self.extend(request, params))
        order = response['data']

        return {
            'id': order.get('id'),
            'info': order,
            'timestamp': order.get('timestamp'),
            'datetime': self.iso8601(order.get('timestamp')) if order.get('timestamp') else None,
            'lastTradeTimestamp': None,
            'status': order.get('status'),
            'symbol': symbol,
            'type': order.get('type'),
            'side': order.get('side'),
            'price': order.get('price'),
            'cost': order.get('cost'),
            'amount': order.get('amount'),
            'filled': order.get('filled'),
            'remaining': order.get('remaining'),
            'fee': order.get('fee'),
            'trades': [],
            'clientOrderId': order.get('clientOrderId'),
        }

    def fetchOpenOrders(self, symbol=None, since=None, limit=None, params={}):
        request = {}
        if symbol is not None:
            self.loadMarkets()
            market = self.market(symbol)
            request['symbol'] = market['id']
        if since is not None:
            request['since'] = since
        if limit is not None:
            request['limit'] = limit

        response = self.privateGetApiCcxtOrders(self.extend(request, {'status': 'open'}, params))
        orders = response['data']

        return self.parse_orders(orders)

    def fetchClosedOrders(self, symbol=None, since=None, limit=None, params={}):
        request = {}
        if symbol is not None:
            self.loadMarkets()
            market = self.market(symbol)
            request['symbol'] = market['id']
        if since is not None:
            request['since'] = since
        if limit is not None:
            request['limit'] = limit

        response = self.privateGetApiCcxtOrders(self.extend(request, {'status': 'closed'}, params))
        orders = response['data']

        return self.parse_orders(orders)

    def fetchMyTrades(self, symbol=None, since=None, limit=None, params={}):
        request = {}
        if symbol is not None:
            self.loadMarkets()
            market = self.market(symbol)
            request['symbol'] = market['id']
        if since is not None:
            request['since'] = since
        if limit is not None:
            request['limit'] = limit

        response = self.privateGetApiCcxtMyTrades(self.extend(request, params))
        trades = response['data']

        result = []
        for trade in trades:
            result.append({
                'id': trade.get('id'),
                'info': trade,
                'timestamp': trade.get('timestamp'),
                'datetime': self.iso8601(trade['timestamp']) if trade.get('timestamp') else None,
                'symbol': symbol,
                'type': trade.get('type'),
                'side': trade.get('side'),
                'takerOrMaker': trade.get('takerOrMaker'),
                'price': float(trade['price']),
                'amount': float(trade['amount']),
                'cost': float(trade.get('cost', 0)),
                'fee': {
                    'cost': trade.get('fee', {}).get('cost'),
                    'currency': trade.get('fee', {}).get('currency'),
                } if trade.get('fee') else None,
            })

        return self.filter_by_since_limit(result, since, limit)

    def withdraw(self, code, amount, address, tag=None, params={}):
        self.loadMarkets()
        currency = self.currency(code)
        request = {
            'code': currency['id'],
            'amount': amount,
            'address': address,
        }
        if tag is not None:
            request['tag'] = tag

        response = self.privatePostApiCcxtWithdraw(self.extend(request, params))
        withdrawal = response['data']

        return {
            'id': withdrawal.get('id'),
            'info': withdrawal,
            'timestamp': withdrawal.get('timestamp'),
            'datetime': self.iso8601(withdrawal.get('timestamp')) if withdrawal.get('timestamp') else None,
            'amount': withdrawal.get('amount'),
            'fee': withdrawal.get('fee'),
            'address': withdrawal.get('address'),
            'tag': withdrawal.get('tag'),
            'status': withdrawal.get('status'),
        }

    def fetchDepositAddress(self, code, params={}):
        self.loadMarkets()
        currency = self.currency(code)
        request = {'code': currency['id']}

        response = self.privateGetApiCcxtDeposit(self.extend(request, params))
        deposit_address = response['data']

        return {
            'currency': code,
            'address': deposit_address.get('address'),
            'tag': deposit_address.get('tag'),
            'network': deposit_address.get('network'),
            'info': deposit_address,
        }

    def fetchDeposits(self, code=None, since=None, limit=None, params={}):
        request = {}
        if code is not None:
            self.loadMarkets()
            currency = self.currency(code)
            request['code'] = currency['id']
        if since is not None:
            request['since'] = since
        if limit is not None:
            request['limit'] = limit

        response = self.privateGetApiCcxtDeposits(self.extend(request, params))
        deposits = response['data']

        result = []
        for deposit in deposits:
            result.append({
                'info': deposit,
                'id': deposit.get('id'),
                'timestamp': deposit.get('timestamp'),
                'datetime': self.iso8601(deposit['timestamp']) if deposit.get('timestamp') else None,
                'amount': deposit.get('amount'),
                'fee': deposit.get('fee'),
                'status': deposit.get('status'),
                'address': deposit.get('address'),
                'txid': deposit.get('txid'),
                'currency': code,
                'network': deposit.get('network'),
                'tag': deposit.get('tag'),
            })

        return self.filter_by_since_limit(result, since, limit)

    def fetchWithdrawals(self, code=None, since=None, limit=None, params={}):
        request = {}
        if code is not None:
            self.loadMarkets()
            currency = self.currency(code)
            request['code'] = currency['id']
        if since is not None:
            request['since'] = since
        if limit is not None:
            request['limit'] = limit

        response = self.privateGetApiCcxtWithdrawals(self.extend(request, params))
        withdrawals = response['data']

        result = []
        for withdrawal in withdrawals:
            result.append({
                'info': withdrawal,
                'id': withdrawal.get('id'),
                'timestamp': withdrawal.get('timestamp'),
                'datetime': self.iso8601(withdrawal['timestamp']) if withdrawal.get('timestamp') else None,
                'amount': withdrawal.get('amount'),
                'fee': withdrawal.get('fee'),
                'status': withdrawal.get('status'),
                'address': withdrawal.get('address'),
                'txid': withdrawal.get('txid'),
                'currency': code,
                'network': withdrawal.get('network'),
                'tag': withdrawal.get('tag'),
            })

        return self.filter_by_since_limit(result, since, limit)

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = '/' + path.lstrip('/')

        if params:
            url += '?' + urlencode(params)

        if api == 'private':
            headers = headers or {}
            headers['X-API-KEY'] = self.apiKey
            headers['X-API-SECRET'] = self.secret

        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def parse_orders(self, orders):
        result = []
        for order in orders:
            parsed = {
                'id': order.get('id'),
                'info': order,
                'timestamp': order.get('timestamp'),
                'datetime': self.iso8601(order.get('timestamp')) if order.get('timestamp') else None,
                'lastTradeTimestamp': None,
                'status': order.get('status'),
                'symbol': self.safe_symbol(order.get('symbol')),
                'type': order.get('type'),
                'side': order.get('side'),
                'price': order.get('price'),
                'cost': order.get('cost'),
                'amount': order.get('amount'),
                'filled': order.get('filled'),
                'remaining': order.get('remaining'),
                'fee': order.get('fee'),
                'trades': [],
                'clientOrderId': order.get('clientOrderId'),
            }
            result.append(parsed)
        return result
