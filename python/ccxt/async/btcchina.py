# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import base64
import hashlib


class btcchina (Exchange):

    def describe(self):
        return self.deep_extend(super(btcchina, self).describe(), {
            'id': 'btcchina',
            'name': 'BTCChina',
            'countries': 'CN',
            'rateLimit': 1500,
            'version': 'v1',
            'hasCORS': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg',
                'api': {
                    'plus': 'https://plus-api.btcchina.com/market',
                    'public': 'https://data.btcchina.com/data',
                    'private': 'https://api.btcchina.com/api_trade_v1.php',
                },
                'www': 'https://www.btcchina.com',
                'doc': 'https://www.btcchina.com/apidocs'
            },
            'api': {
                'plus': {
                    'get': [
                        'orderbook',
                        'ticker',
                        'trade',
                    ],
                },
                'public': {
                    'get': [
                        'historydata',
                        'orderbook',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'BuyIcebergOrder',
                        'BuyOrder',
                        'BuyOrder2',
                        'BuyStopOrder',
                        'CancelIcebergOrder',
                        'CancelOrder',
                        'CancelStopOrder',
                        'GetAccountInfo',
                        'getArchivedOrder',
                        'getArchivedOrders',
                        'GetDeposits',
                        'GetIcebergOrder',
                        'GetIcebergOrders',
                        'GetMarketDepth',
                        'GetMarketDepth2',
                        'GetOrder',
                        'GetOrders',
                        'GetStopOrder',
                        'GetStopOrders',
                        'GetTransactions',
                        'GetWithdrawal',
                        'GetWithdrawals',
                        'RequestWithdrawal',
                        'SellIcebergOrder',
                        'SellOrder',
                        'SellOrder2',
                        'SellStopOrder',
                    ],
                },
            },
            'markets': {
                'BTC/CNY': {'id': 'btccny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'api': 'public', 'plus': False},
                'LTC/CNY': {'id': 'ltccny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'api': 'public', 'plus': False},
                'LTC/BTC': {'id': 'ltcbtc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'api': 'public', 'plus': False},
                'BCH/CNY': {'id': 'bcccny', 'symbol': 'BCH/CNY', 'base': 'BCH', 'quote': 'CNY', 'api': 'plus', 'plus': True},
                'ETH/CNY': {'id': 'ethcny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY', 'api': 'plus', 'plus': True},
            },
        })

    async def fetch_markets(self):
        markets = await self.publicGetTicker({
            'market': 'all',
        })
        result = []
        keys = list(markets.keys())
        for p in range(0, len(keys)):
            key = keys[p]
            market = markets[key]
            parts = key.split('_')
            id = parts[1]
            base = id[0:3]
            quote = id[3:6]
            base = base.upper()
            quote = quote.upper()
            symbol = base + '/' + quote
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privatePostGetAccountInfo()
        balances = response['result']
        result = {'info': balances}
        currencies = list(self.currencies.keys())
        for i in range(0, len(currencies)):
            currency = currencies[i]
            lowercase = currency.lower()
            account = self.account()
            if lowercase in balances['balance']:
                account['total'] = float(balances['balance'][lowercase]['amount'])
            if lowercase in balances['frozen']:
                account['used'] = float(balances['frozen'][lowercase]['amount'])
            account['free'] = account['total'] - account['used']
            result[currency] = account
        return self.parse_balance(result)

    def create_market_request(self, market):
        request = {}
        field = 'symbol' if (market['plus']) else 'market'
        request[field] = market['id']
        return request

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        method = market['api'] + 'GetOrderbook'
        request = self.create_market_request(market)
        orderbook = await getattr(self, method)(self.extend(request, params))
        timestamp = orderbook['date'] * 1000
        result = self.parse_order_book(orderbook, timestamp)
        result['asks'] = self.sort_by(result['asks'], 0)
        return result

    def parse_ticker(self, ticker, market):
        timestamp = ticker['date'] * 1000
        return {
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['buy']),
            'ask': float(ticker['sell']),
            'vwap': float(ticker['vwap']),
            'open': float(ticker['open']),
            'close': float(ticker['prev_close']),
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker['vol']),
            'quoteVolume': None,
            'info': ticker,
        }

    def parse_ticker_plus(self, ticker, market):
        timestamp = ticker['Timestamp']
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['High']),
            'low': float(ticker['Low']),
            'bid': float(ticker['BidPrice']),
            'ask': float(ticker['AskPrice']),
            'vwap': None,
            'open': float(ticker['Open']),
            'close': float(ticker['PrevCls']),
            'first': None,
            'last': float(ticker['Last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker['Volume24H']),
            'quoteVolume': None,
            'info': ticker,
        }

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        method = market['api'] + 'GetTicker'
        request = self.create_market_request(market)
        tickers = await getattr(self, method)(self.extend(request, params))
        ticker = tickers['ticker']
        if market['plus']:
            return self.parse_ticker_plus(ticker, market)
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market):
        timestamp = int(trade['date']) * 1000
        return {
            'id': trade['tid'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': None,
            'price': trade['price'],
            'amount': trade['amount'],
        }

    def parse_trade_plus(self, trade, market):
        timestamp = self.parse8601(trade['timestamp'])
        return {
            'id': None,
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': trade['side'].lower(),
            'price': trade['price'],
            'amount': trade['size'],
        }

    def parse_trades_plus(self, trades, market=None):
        result = []
        for i in range(0, len(trades)):
            result.append(self.parse_trade_plus(trades[i], market))
        return result

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        method = market['api'] + 'GetTrade'
        request = self.create_market_request(market)
        if market['plus']:
            now = self.milliseconds()
            request['start_time'] = now - 86400 * 1000
            request['end_time'] = now
        else:
            method += 's'  # trades vs trade
        response = await getattr(self, method)(self.extend(request, params))
        if market['plus']:
            return self.parse_trades_plus(response['trades'], market)
        return self.parse_trades(response, market, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        method = 'privatePost' + self.capitalize(side) + 'Order2'
        order = {}
        id = market['id'].upper()
        if type == 'market':
            order['params'] = [None, amount, id]
        else:
            order['params'] = [price, amount, id]
        response = await getattr(self, method)(self.extend(order, params))
        return {
            'info': response,
            'id': response['id'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        await self.load_markets()
        market = params['market']  # TODO fixme
        return await self.privatePostCancelOrder(self.extend({
            'params': [id, market],
        }, params))

    def nonce(self):
        return self.microseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api] + '/' + path
        if api == 'private':
            self.check_required_credentials()
            p = []
            if 'params' in params:
                p = params['params']
            nonce = self.nonce()
            request = {
                'method': path,
                'id': nonce,
                'params': p,
            }
            p = ','.join(p)
            body = self.json(request)
            query = (
                'tonce=' + nonce +
                '&accesskey=' + self.apiKey +
                '&requestmethod=' + method.lower() +
                '&id=' + nonce +
                '&method=' + path +
                '&params=' + p
            )
            signature = self.hmac(self.encode(query), self.encode(self.secret), hashlib.sha1)
            auth = self.encode(self.apiKey + ':' + signature)
            headers = {
                'Authorization': 'Basic ' + base64.b64encode(auth),
                'Json-Rpc-Tonce': nonce,
            }
        else:
            if params:
                url += '?' + self.urlencode(params)
        return {'url': url, 'method': method, 'body': body, 'headers': headers}
