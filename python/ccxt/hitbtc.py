# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds


class hitbtc (Exchange):

    def describe(self):
        return self.deep_extend(super(hitbtc, self).describe(), {
            'id': 'hitbtc',
            'name': 'HitBTC',
            'countries': 'HK',  # Hong Kong
            'rateLimit': 1500,
            'version': '1',
            'hasCORS': False,
            'hasFetchTickers': True,
            'hasFetchOrder': True,
            'hasFetchOpenOrders': True,
            'hasFetchClosedOrders': True,
            'hasWithdraw': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'api': 'http://api.hitbtc.com',
                'www': 'https://hitbtc.com',
                'doc': [
                    'https://hitbtc.com/api',
                    'http://hitbtc-com.github.io/hitbtc-api',
                    'http://jsfiddle.net/bmknight/RqbYB',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{symbol}/orderbook',
                        '{symbol}/ticker',
                        '{symbol}/trades',
                        '{symbol}/trades/recent',
                        'symbols',
                        'ticker',
                        'time,'
                    ],
                },
                'trading': {
                    'get': [
                        'balance',
                        'orders/active',
                        'orders/recent',
                        'order',
                        'trades/by/order',
                        'trades',
                    ],
                    'post': [
                        'new_order',
                        'cancel_order',
                        'cancel_orders',
                    ],
                },
                'payment': {
                    'get': [
                        'balance',
                        'address/{currency}',
                        'transactions',
                        'transactions/{transaction}',
                    ],
                    'post': [
                        'transfer_to_trading',
                        'transfer_to_main',
                        'address/{currency}',
                        'payout',
                    ],
                },
            },
        })

    def common_currency_code(self, currency):
        if currency == 'XBT':
            return 'BTC'
        if currency == 'DRK':
            return 'DASH'
        if currency == 'CAT':
            return 'BitClave'
        return currency

    def fetch_markets(self):
        markets = self.publicGetSymbols()
        result = []
        for p in range(0, len(markets['symbols'])):
            market = markets['symbols'][p]
            id = market['symbol']
            base = market['commodity']
            quote = market['currency']
            lot = float(market['lot'])
            step = float(market['step'])
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'lot': lot,
                'step': step,
                'info': market,
            })
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        method = self.safe_string(params, 'type', 'trading')
        method += 'GetBalance'
        query = self.omit(params, 'type')
        response = getattr(self, method)(query)
        balances = response['balance']
        result = {'info': balances}
        for b in range(0, len(balances)):
            balance = balances[b]
            code = balance['currency_code']
            currency = self.common_currency_code(code)
            free = self.safe_float(balance, 'cash', 0.0)
            free = self.safe_float(balance, 'balance', free)
            used = self.safe_float(balance, 'reserved', 0.0)
            account = {
                'free': free,
                'used': used,
                'total': self.sum(free, used),
            }
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        orderbook = self.publicGetSymbolOrderbook(self.extend({
            'symbol': self.market_id(symbol),
        }, params))
        return self.parse_order_book(orderbook)

    def parse_ticker(self, ticker, market=None):
        timestamp = ticker['timestamp']
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'high'),
            'low': self.safe_float(ticker, 'low'),
            'bid': self.safe_float(ticker, 'bid'),
            'ask': self.safe_float(ticker, 'ask'),
            'vwap': None,
            'open': self.safe_float(ticker, 'open'),
            'close': None,
            'first': None,
            'last': self.safe_float(ticker, 'last'),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': self.safe_float(ticker, 'volume'),
            'quoteVolume': self.safe_float(ticker, 'volume_quote'),
            'info': ticker,
        }

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        tickers = self.publicGetTicker(params)
        ids = list(tickers.keys())
        result = {}
        for i in range(0, len(ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        ticker = self.publicGetSymbolTicker(self.extend({
            'symbol': market['id'],
        }, params))
        if 'message' in ticker:
            raise ExchangeError(self.id + ' ' + ticker['message'])
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market=None):
        return {
            'info': trade,
            'id': trade[0],
            'timestamp': trade[3],
            'datetime': self.iso8601(trade[3]),
            'symbol': market['symbol'],
            'type': None,
            'side': trade[4],
            'price': float(trade[1]),
            'amount': float(trade[2]),
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetSymbolTrades(self.extend({
            'symbol': market['id'],
            # 'from': 0,
            # 'till': 100,
            # 'by': 'ts',  # or by trade_id
            # 'sort': 'desc',  # or asc
            # 'start_index': 0,
            # 'max_results': 1000,
            # 'format_item': 'object',
            # 'format_price': 'number',
            # 'format_amount': 'number',
            # 'format_tid': 'string',
            # 'format_timestamp': 'millisecond',
            # 'format_wrap': False,
            'side': 'true',
        }, params))
        return self.parse_trades(response['trades'], market)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        # check if amount can be evenly divided into lots
        # they want integer quantity in lot units
        quantity = float(amount) / market['lot']
        wholeLots = int(round(quantity))
        difference = quantity - wholeLots
        if abs(difference) > market['step']:
            raise ExchangeError(self.id + ' order amount should be evenly divisible by lot unit size of ' + str(market['lot']))
        clientOrderId = self.milliseconds()
        order = {
            'clientOrderId': str(clientOrderId),
            'symbol': market['id'],
            'side': side,
            'quantity': str(wholeLots),  # quantity in integer lot units
            'type': type,
        }
        if type == 'limit':
            order['price'] = '{:.10f}'.format(price)
        else:
            order['timeInForce'] = 'FOK'
        response = self.tradingPostNewOrder(self.extend(order, params))
        return {
            'info': response,
            'id': response['ExecutionReport']['clientOrderId'],
        }

    def cancel_order(self, id, symbol=None, params={}):
        self.load_markets()
        return self.tradingPostCancelOrder(self.extend({
            'clientOrderId': id,
        }, params))

    def get_order_status(self, status):
        statuses = {
            'new': 'open',
            'partiallyFilled': 'partial',
            'filled': 'closed',
            'canceled': 'canceled',
            'rejected': 'rejected',
            'expired': 'expired',
        }
        return self.safe_string(statuses, status)

    def parse_order(self, order, market=None):
        timestamp = int(order['lastTimestamp'])
        symbol = None
        if not market:
            market = self.markets_by_id[order['symbol']]
        status = self.safe_string(order, 'orderStatus')
        if status:
            status = self.get_order_status(status)
        averagePrice = self.safe_float(order, 'avgPrice', 0.0)
        price = self.safe_float(order, 'orderPrice')
        amount = self.safe_float(order, 'orderQuantity')
        remaining = self.safe_float(order, 'quantityLeaves')
        filled = None
        cost = None
        if market:
            symbol = market['symbol']
            amount *= market['lot']
            remaining *= market['lot']
        if amount and remaining:
            filled = amount - remaining
            cost = averagePrice * filled
        return {
            'id': str(order['clientOrderId']),
            'info': order,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'status': status,
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': None,
        }

    def fetch_order(self, id, symbol=None, params={}):
        self.load_markets()
        response = self.tradingGetOrder(self.extend({
            'client_order_id': id,
        }, params))
        return self.parse_order(response['orders'][0])

    def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        statuses = ['new', 'partiallyFiiled']
        market = self.market(symbol)
        request = {
            'sort': 'desc',
            'statuses': ','.join(statuses),
        }
        if market:
            request['symbols'] = market['id']
        response = self.tradingGetOrdersActive(self.extend(request, params))
        return self.parse_orders(response['orders'], market)

    def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        statuses = ['filled', 'canceled', 'rejected', 'expired']
        request = {
            'sort': 'desc',
            'statuses': ','.join(statuses),
            'max_results': 1000,
        }
        if market:
            request['symbols'] = market['id']
        response = self.tradingGetOrdersRecent(self.extend(request, params))
        return self.parse_orders(response['orders'], market)

    def withdraw(self, currency, amount, address, params={}):
        self.load_markets()
        response = self.paymentPostPayout(self.extend({
            'currency_code': currency,
            'amount': amount,
            'address': address,
        }, params))
        return {
            'info': response,
            'id': response['transaction'],
        }

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = '/' + 'api' + '/' + self.version + '/' + api + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            nonce = self.nonce()
            payload = {'nonce': nonce, 'apikey': self.apiKey}
            query = self.extend(payload, query)
            if method == 'GET':
                url += '?' + self.urlencode(query)
            else:
                url += '?' + self.urlencode(payload)
            auth = url
            if method == 'POST':
                if query:
                    body = self.urlencode(query)
                    auth += body
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Signature': self.hmac(self.encode(auth), self.encode(self.secret), hashlib.sha512).lower(),
            }
        url = self.urls['api'] + url
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'code' in response:
            if 'ExecutionReport' in response:
                if response['ExecutionReport']['orderRejectReason'] == 'orderExceedsLimit':
                    raise InsufficientFunds(self.id + ' ' + self.json(response))
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
