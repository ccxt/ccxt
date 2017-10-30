# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange

class cryptopia (Exchange):

    def describe(self):
        return self.deep_extend(super(cryptopia, self).describe(), {
            'id': 'cryptopia',
            'name': 'Cryptopia',
            'rateLimit': 1500,
            'countries': 'NZ',  # New Zealand
            'hasFetchTickers': True,
            'hasFetchOrder': True,
            'hasFetchOrders': True,
            'hasFetchOpenOrders': True,
            'hasFetchClosedOrders': True,
            'hasFetchMyTrades': True,
            'hasCORS': False,
            'hasDeposit': True,
            'hasWithdraw': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29484394-7b4ea6e2-84c6-11e7-83e5-1fccf4b2dc81.jpg',
                'api': 'https://www.cryptopia.co.nz/api',
                'www': 'https://www.cryptopia.co.nz',
                'doc': [
                    'https://www.cryptopia.co.nz/Forum/Thread/255',
                    'https://www.cryptopia.co.nz/Forum/Thread/256',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'GetCurrencies',
                        'GetTradePairs',
                        'GetMarkets',
                        'GetMarkets/{id}',
                        'GetMarkets/{hours}',
                        'GetMarkets/{id}/{hours}',
                        'GetMarket/{id}',
                        'GetMarket/{id}/{hours}',
                        'GetMarketHistory/{id}',
                        'GetMarketHistory/{id}/{hours}',
                        'GetMarketOrders/{id}',
                        'GetMarketOrders/{id}/{count}',
                        'GetMarketOrderGroups/{ids}/{count}',
                    ],
                },
                'private': {
                    'post': [
                        'CancelTrade',
                        'GetBalance',
                        'GetDepositAddress',
                        'GetOpenOrders',
                        'GetTradeHistory',
                        'GetTransactions',
                        'SubmitTip',
                        'SubmitTrade',
                        'SubmitTransfer',
                        'SubmitWithdraw',
                    ],
                },
            },
        })

    def common_currency_code(self, currency):
        if currency == 'CC':
            return 'CCX'
        if currency == 'FCN':
            return 'Facilecoin'
        if currency == 'NET':
            return 'NetCoin'
        if currency == 'BTG':
            return 'Bitgem'
        return currency

    def fetch_markets(self):
        response = self.publicGetTradePairs()
        result = []
        markets = response['Data']
        for i in range(0, len(markets)):
            market = markets[i]
            id = market['Id']
            symbol = market['Label']
            base, quote = symbol.split('/')
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            precision = {
                'amount': 8,
                'price': 8,
            }
            amountLimits = {
                'min': market['MinimumTrade'],
                'max': market['MaximumTrade']
            }
            priceLimits = {
                'min': market['MinimumPrice'],
                'max': market['MaximumPrice'],
            }
            limits = {
                'amount': amountLimits,
                'price': priceLimits,
            }
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'maker': market['TradeFee'] / 100,
                'taker': market['TradeFee'] / 100,
                'lot': amountLimits['min'],
                'precision': precision,
                'limits': limits,
            })
        return result

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        response = self.publicGetMarketOrdersId(self.extend({
            'id': self.market_id(symbol),
        }, params))
        orderbook = response['Data']
        return self.parse_order_book(orderbook, None, 'Buy', 'Sell', 'Price', 'Volume')

    def parse_ticker(self, ticker, market=None):
        timestamp = self.milliseconds()
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'info': ticker,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['High']),
            'low': float(ticker['Low']),
            'bid': float(ticker['BidPrice']),
            'ask': float(ticker['AskPrice']),
            'vwap': None,
            'open': float(ticker['Open']),
            'close': float(ticker['Close']),
            'first': None,
            'last': float(ticker['LastPrice']),
            'change': float(ticker['Change']),
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker['Volume']),
            'quoteVolume': float(ticker['BaseVolume']),
        }

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetMarketId(self.extend({
            'id': market['id'],
        }, params))
        ticker = response['Data']
        return self.parse_ticker(ticker, market)

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        response = self.publicGetMarkets(params)
        result = {}
        tickers = response['Data']
        for i in range(0, len(tickers)):
            ticker = tickers[i]
            id = ticker['TradePairId']
            market = self.markets_by_id[id]
            symbol = market['symbol']
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    def parse_trade(self, trade, market=None):
        timestamp = None
        if 'Timestamp' in trade:
            timestamp = trade['Timestamp'] * 1000
        elif 'TimeStamp' in trade:
            timestamp = self.parse8601(trade['TimeStamp'])
        price = self.safe_float(trade, 'Price')
        if not price:
            price = self.safe_float(trade, 'Rate')
        cost = self.safe_float(trade, 'Total')
        id = self.safe_string(trade, 'TradeId')
        if not market:
            if 'TradePairId' in trade:
                if trade['TradePairId'] in self.markets_by_id:
                    market = self.markets_by_id[trade['TradePairId']]
        symbol = None
        fee = None
        if market:
            symbol = market['symbol']
            if 'Fee' in trade:
                fee = {
                    'currency': market['quote'],
                    'cost': trade['Fee'],
                }
        return {
            'id': id,
            'info': trade,
            'order': None,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': trade['Type'].lower(),
            'price': price,
            'cost': cost,
            'amount': trade['Amount'],
            'fee': fee,
        }

    def fetch_trades(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetMarketHistoryIdHours(self.extend({
            'id': market['id'],
            'hours': 24,  # default
        }, params))
        trades = response['Data']
        return self.parse_trades(trades, market)

    def fetch_my_trades(self, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchMyTrades requires a symbol')
        self.load_markets()
        market = self.market(symbol)
        response = self.privatePostGetTradeHistory(self.extend({
            # 'Market': market['id'],
            'TradePairId': market['id'],  # Cryptopia identifier(not required if 'Market' supplied)
            # 'Count': 10,  # max = 100
        }, params))
        return self.parse_trades(response['Data'], market)

    def fetch_balance(self, params={}):
        self.load_markets()
        response = self.privatePostGetBalance()
        balances = response['Data']
        result = {'info': response}
        for i in range(0, len(balances)):
            balance = balances[i]
            code = balance['Symbol']
            currency = self.common_currency_code(code)
            account = {
                'free': balance['Available'],
                'used': 0.0,
                'total': balance['Total'],
            }
            account['used'] = account['total'] - account['free']
            result[currency] = account
        return self.parse_balance(result)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        price = float(price)
        amount = float(amount)
        request = {
            'TradePairId': market['id'],
            'Type': self.capitalize(side),
            'Rate': self.price_to_precision(symbol, price),
            'Amount': self.amount_to_precision(symbol, amount),
        }
        response = self.privatePostSubmitTrade(self.extend(request, params))
        if not response:
            raise ExchangeError(self.id + ' createOrder returned unknown error: ' + self.json(response))
        if 'Data' in response:
            if 'OrderId' in response['Data']:
                if not response['Data']['OrderId']:
                    raise ExchangeError(self.id + ' createOrder returned bad OrderId: ' + self.json(response))
            else:
                raise ExchangeError(self.id + ' createOrder returned no OrderId in Data: ' + self.json(response))
        else:
            raise ExchangeError(self.id + ' createOrder returned no Data in response: ' + self.json(response))
        id = str(response['Data']['OrderId'])
        timestamp = self.milliseconds()
        order = {
            'id': id,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'status': 'open',
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'remaining': amount,
            'filled': 0.0,
            'fee': None,
            # 'trades': self.parse_trades(order['trades'], market),
        }
        self.orders[id] = order
        return self.extend({'info': response}, order)

    def cancel_order(self, id, symbol=None, params={}):
        self.load_markets()
        response = None
        try:
            response = self.privatePostCancelTrade(self.extend({
                'Type': 'Trade',
                'OrderId': id,
            }, params))
            if id in self.orders:
                self.orders[id]['status'] = 'canceled'
        except Exception as e:
            if self.last_json_response:
                message = self.safe_string(self.last_json_response, 'Error')
                if message:
                    if message.find('does not exist') >= 0:
                        raise OrderNotFound(self.id + ' cancelOrder() error: ' + self.last_http_response)
            raise e
        return response

    def parse_order(self, order, market=None):
        symbol = None
        if market:
            symbol = market['symbol']
        elif 'Market' in order:
            id = order['Market']
            if id in self.markets_by_id:
                market = self.markets_by_id[id]
                symbol = market['symbol']
        timestamp = self.parse8601(order['TimeStamp'])
        amount = self.safe_float(order, 'Amount')
        remaining = self.safe_float(order, 'Remaining')
        filled = amount - remaining
        return {
            'id': str(order['OrderId']),
            'info': self.omit(order, 'status'),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'status': order['status'],
            'symbol': symbol,
            'type': 'limit',
            'side': order['Type'].lower(),
            'price': self.safe_float(order, 'Rate'),
            'cost': self.safe_float(order, 'Total'),
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': None,
            # 'trades': self.parse_trades(order['trades'], market),
        }

    def fetch_orders(self, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOrders requires a symbol param')
        self.load_markets()
        market = self.market(symbol)
        response = self.privatePostGetOpenOrders({
            # 'Market': market['id'],
            'TradePairId': market['id'],  # Cryptopia identifier(not required if 'Market' supplied)
            # 'Count': 100,  # default = 100
        }, params)
        orders = []
        for i in range(0, len(response['Data'])):
            orders.append(self.extend(response['Data'][i], {'status': 'open'}))
        openOrders = self.parse_orders(orders, market)
        for j in range(0, len(openOrders)):
            self.orders[openOrders[j]['id']] = openOrders[j]
        openOrdersIndexedById = self.index_by(openOrders, 'id')
        cachedOrderIds = list(self.orders.keys())
        result = []
        for k in range(0, len(cachedOrderIds)):
            id = cachedOrderIds[k]
            if id in openOrdersIndexedById:
                self.orders[id] = self.extend(self.orders[id], openOrdersIndexedById[id])
            else:
                order = self.orders[id]
                if order['status'] == 'open':
                    self.orders[id] = self.extend(order, {
                        'status': 'closed',
                        'cost': order['amount'] * order['price'],
                        'filled': order['amount'],
                        'remaining': 0.0,
                    })
            order = self.orders[id]
            if order['symbol'] == symbol:
                result.append(order)
        return result

    def fetch_order(self, id, symbol=None, params={}):
        id = str(id)
        orders = self.fetch_orders(symbol, params)
        for i in range(0, len(orders)):
            if orders[i]['id'] == id:
                return orders[i]
        raise OrderNotCached(self.id + ' order ' + id + ' not found in cached .orders, fetchOrder requires .orders(de)serialization implemented for self method to work properly')

    def fetch_open_orders(self, symbol=None, params={}):
        orders = self.fetch_orders(symbol, params)
        result = []
        for i in range(0, len(orders)):
            if orders[i]['status'] == 'open':
                result.append(orders[i])
        return result

    def fetch_closed_orders(self, symbol=None, params={}):
        orders = self.fetch_orders(symbol, params)
        result = []
        for i in range(0, len(orders)):
            if orders[i]['status'] == 'closed':
                result.append(orders[i])
        return result

    def deposit(self, currency, params={}):
        self.load_markets()
        response = self.privatePostGetDepositAddress(self.extend({
            'Currency': currency
        }, params))
        address = self.safe_string(response['Data'], 'BaseAddress')
        if not address:
            address = self.safe_string(response['Data'], 'Address')
        return {
            'info': response,
            'address': address,
        }

    def withdraw(self, currency, amount, address, params={}):
        self.load_markets()
        response = self.privatePostSubmitWithdraw(self.extend({
            'Currency': currency,
            'Amount': amount,
            'Address': address,  # Address must exist in you AddressBook in security settings
        }, params))
        return {
            'info': response,
            'id': response['Data'],
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            nonce = str(self.nonce())
            body = self.json(query)
            hash = self.hash(self.encode(body), 'md5', 'base64')
            secret = base64.b64decode(self.secret)
            uri = self.encode_uri_component(url)
            lowercase = uri.lower()
            payload = self.apiKey + method + lowercase + nonce + self.binary_to_string(hash)
            signature = self.hmac(self.encode(payload), secret, hashlib.sha256, 'base64')
            auth = 'amx ' + self.apiKey + ':' + self.binary_to_string(signature) + ':' + nonce
            headers = {
                'Content-Type': 'application/json',
                'Authorization': auth,
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if response:
            if 'Success' in response:
                if response['Success']:
                    return response
                elif 'Error' in response:
                    if response['Error'] == 'Insufficient Funds.':
                        raise InsufficientFunds(self.id + ' ' + self.json(response))
        raise ExchangeError(self.id + ' ' + self.json(response))
