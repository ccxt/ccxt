# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import base64
from ccxt.base.errors import ExchangeError


class luno (Exchange):

    def describe(self):
        return self.deep_extend(super(luno, self).describe(), {
            'id': 'luno',
            'name': 'luno',
            'countries': ['GB', 'SG', 'ZA'],
            'rateLimit': 10000,
            'version': '1',
            'hasCORS': False,
            'hasFetchTickers': True,
            'hasFetchOrder': True,
            'has': {
                'fetchTickers': True,
                'fetchOrder': True,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg',
                'api': 'https://api.mybitx.com/api',
                'www': 'https://www.luno.com',
                'doc': [
                    'https://www.luno.com/en/api',
                    'https://npmjs.org/package/bitx',
                    'https://github.com/bausmeier/node-bitx',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook',
                        'ticker',
                        'tickers',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/{id}/pending',
                        'accounts/{id}/transactions',
                        'balance',
                        'fee_info',
                        'funding_address',
                        'listorders',
                        'listtrades',
                        'orders/{id}',
                        'quotes/{id}',
                        'withdrawals',
                        'withdrawals/{id}',
                    ],
                    'post': [
                        'accounts',
                        'postorder',
                        'marketorder',
                        'stoporder',
                        'funding_address',
                        'withdrawals',
                        'send',
                        'quotes',
                        'oauth2/grant',
                    ],
                    'put': [
                        'quotes/{id}',
                    ],
                    'delete': [
                        'quotes/{id}',
                        'withdrawals/{id}',
                    ],
                },
            },
        })

    async def fetch_markets(self):
        markets = await self.publicGetTickers()
        result = []
        for p in range(0, len(markets['tickers'])):
            market = markets['tickers'][p]
            id = market['pair']
            base = id[0:3]
            quote = id[3:6]
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
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
        response = await self.privateGetBalance()
        balances = response['balance']
        result = {'info': response}
        for b in range(0, len(balances)):
            balance = balances[b]
            currency = self.common_currency_code(balance['asset'])
            reserved = float(balance['reserved'])
            unconfirmed = float(balance['unconfirmed'])
            account = {
                'free': float(balance['balance']),
                'used': self.sum(reserved, unconfirmed),
                'total': 0.0,
            }
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        orderbook = await self.publicGetOrderbook(self.extend({
            'pair': self.market_id(symbol),
        }, params))
        timestamp = orderbook['timestamp']
        return self.parse_order_book(orderbook, timestamp, 'bids', 'asks', 'price', 'volume')

    def parse_order(self, order, market=None):
        timestamp = order['creation_timestamp']
        status = 'open' if (order['state'] == 'PENDING') else 'closed'
        side = 'sell' if (order['type'] == 'ASK') else 'buy'
        symbol = None
        if market:
            symbol = market['symbol']
        price = self.safe_float(order, 'limit_price')
        amount = self.safe_float(order, 'limit_volume')
        quoteFee = self.safe_float(order, 'fee_counter')
        baseFee = self.safe_float(order, 'fee_base')
        fee = {'currency': None}
        if quoteFee:
            fee['side'] = 'quote'
            fee['cost'] = quoteFee
        else:
            fee['side'] = 'base'
            fee['cost'] = baseFee
        return {
            'id': order['order_id'],
            'datetime': self.iso8601(timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': None,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': None,
            'remaining': None,
            'trades': None,
            'fee': fee,
            'info': order,
        }

    async def fetch_order(self, id, symbol=None, params={}):
        await self.load_markets()
        response = await self.privateGetOrders(self.extend({
            'id': str(id),
        }, params))
        return self.parse_order(response)

    def parse_ticker(self, ticker, market=None):
        timestamp = ticker['timestamp']
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': None,
            'low': None,
            'bid': float(ticker['bid']),
            'ask': float(ticker['ask']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last_trade']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker['rolling_24_hour_volume']),
            'quoteVolume': None,
            'info': ticker,
        }

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        response = await self.publicGetTickers(params)
        tickers = self.index_by(response['tickers'], 'pair')
        ids = list(tickers.keys())
        result = {}
        for i in range(0, len(ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        ticker = await self.publicGetTicker(self.extend({
            'pair': market['id'],
        }, params))
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market):
        side = 'buy' if (trade['is_buy']) else 'sell'
        return {
            'info': trade,
            'id': None,
            'order': None,
            'timestamp': trade['timestamp'],
            'datetime': self.iso8601(trade['timestamp']),
            'symbol': market['symbol'],
            'type': None,
            'side': side,
            'price': float(trade['price']),
            'amount': float(trade['volume']),
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetTrades(self.extend({
            'pair': market['id'],
        }, params))
        return self.parse_trades(response['trades'], market, since, limit)

    async def create_order(self, market, type, side, amount, price=None, params={}):
        await self.load_markets()
        method = 'privatePost'
        order = {'pair': self.market_id(market)}
        if type == 'market':
            method += 'Marketorder'
            order['type'] = side.upper()
            if side == 'buy':
                order['counter_volume'] = amount
            else:
                order['base_volume'] = amount
        else:
            method += 'Order'
            order['volume'] = amount
            order['price'] = price
            if side == 'buy':
                order['type'] = 'BID'
            else:
                order['type'] = 'ASK'
        response = await getattr(self, method)(self.extend(order, params))
        return {
            'info': response,
            'id': response['order_id'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        await self.load_markets()
        return await self.privatePostStoporder({'order_id': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.version + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if query:
            url += '?' + self.urlencode(query)
        if api == 'private':
            self.check_required_credentials()
            auth = self.encode(self.apiKey + ':' + self.secret)
            auth = base64.b64encode(auth)
            headers = {'Authorization': 'Basic ' + self.decode(auth)}
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'error' in response:
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
