# -*- coding: utf-8 -*-

from ccxt.base import Exchange


class coingi (Exchange):

    def describe(self):
        return self.deep_extend(super(coingi, self).describe(), {
            'id': 'coingi',
            'name': 'Coingi',
            'rateLimit': 1000,
            'countries': ['PA', 'BG', 'CN', 'US'],  # Panama, Bulgaria, China, US
            'hasFetchTickers': True,
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg',
                'api': 'https://api.coingi.com',
                'www': 'https://coingi.com',
                'doc': 'http://docs.coingi.apiary.io/',
            },
            'api': {
                'current': {
                    'get': [
                        'order-book/{pair}/{askCount}/{bidCount}/{depth}',
                        'transactions/{pair}/{maxCount}',
                        '24hour-rolling-aggregation',
                    ],
                },
                'user': {
                    'post': [
                        'balance',
                        'add-order',
                        'cancel-order',
                        'orders',
                        'transactions',
                        'create-crypto-withdrawal',
                    ],
                },
            },
            'markets': {
                'LTC/BTC': {'id': 'ltc-btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                'PPC/BTC': {'id': 'ppc-btc', 'symbol': 'PPC/BTC', 'base': 'PPC', 'quote': 'BTC'},
                'DOGE/BTC': {'id': 'doge-btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC'},
                'VTC/BTC': {'id': 'vtc-btc', 'symbol': 'VTC/BTC', 'base': 'VTC', 'quote': 'BTC'},
                'FTC/BTC': {'id': 'ftc-btc', 'symbol': 'FTC/BTC', 'base': 'FTC', 'quote': 'BTC'},
                'NMC/BTC': {'id': 'nmc-btc', 'symbol': 'NMC/BTC', 'base': 'NMC', 'quote': 'BTC'},
                'DASH/BTC': {'id': 'dash-btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC'},
            },
        })

    async def fetch_balance(self, params={}):
        currencies = []
        for c in range(0, len(self.currencies)):
            currency = self.currencies[c].lower()
            currencies.append(currency)
        balances = await self.userPostBalance({
            'currencies': ','.join(currencies)
        })
        result = {'info': balances}
        for b in range(0, len(balances)):
            balance = balances[b]
            currency = balance['currency']['name']
            currency = currency.upper()
            account = {
                'free': balance['available'],
                'used': balance['blocked'] + balance['inOrders'] + balance['withdrawing'],
                'total': 0.0,
            }
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        market = self.market(symbol)
        orderbook = await self.currentGetOrderBookPairAskCountBidCountDepth(self.extend({
            'pair': market['id'],
            'askCount': 512,  # maximum returned number of asks 1-512
            'bidCount': 512,  # maximum returned number of bids 1-512
            'depth': 32,  # maximum number of depth range steps 1-32
        }, params))
        return self.parse_order_book(orderbook, None, 'bids', 'asks', 'price', 'baseAmount')

    def parse_ticker(self, ticker, market=None):
        timestamp = self.milliseconds()
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['highestBid'],
            'ask': ticker['lowestAsk'],
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': ticker['baseVolume'],
            'quoteVolume': ticker['counterVolume'],
            'info': ticker,
        }
        return ticker

    async def fetch_tickers(self, symbols=None, params={}):
        response = await self.currentGet24hourRollingAggregation(params)
        result = {}
        for t in range(0, len(response)):
            ticker = response[t]
            base = ticker['currencyPair']['base'].upper()
            quote = ticker['currencyPair']['counter'].upper()
            symbol = base + '/' + quote
            market = self.markets[symbol]
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    async def fetch_ticker(self, symbol, params={}):
        tickers = await self.fetch_tickers(None, params)
        if symbol in tickers:
            return tickers[symbol]
        raise ExchangeError(self.id + ' return did not contain ' + symbol)

    def parse_trade(self, trade, market=None):
        if not market:
            market = self.markets_by_id[trade['currencyPair']]
        return {
            'id': trade['id'],
            'info': trade,
            'timestamp': trade['timestamp'],
            'datetime': self.iso8601(trade['timestamp']),
            'symbol': market['symbol'],
            'type': None,
            'side': None,  # type
            'price': trade['price'],
            'amount': trade['amount'],
        }

    async def fetch_trades(self, symbol, params={}):
        market = self.market(symbol)
        response = await self.currentGetTransactionsPairMaxCount(self.extend({
            'pair': market['id'],
            'maxCount': 128,
        }, params))
        return self.parse_trades(response, market)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        order = {
            'currencyPair': self.market_id(symbol),
            'volume': amount,
            'price': price,
            'orderType': 0 if (side == 'buy') else 1,
        }
        response = await self.userPostAddOrder(self.extend(order, params))
        return {
            'info': response,
            'id': response['result'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        return await self.userPostCancelOrder({'orderId': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + api + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'current':
            if query:
                url += '?' + self.urlencode(query)
        else:
            nonce = self.nonce()
            request = self.extend({
                'token': self.apiKey,
                'nonce': nonce,
            }, query)
            auth = str(nonce) + '$' + self.apiKey
            request['signature'] = self.hmac(self.encode(auth), self.encode(self.secret))
            body = self.json(request)
            headers = {
                'Content-Type': 'application/json',
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'errors' in response:
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
