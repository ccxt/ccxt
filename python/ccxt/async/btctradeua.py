# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
from ccxt.base.errors import ExchangeError


class btctradeua (Exchange):

    def describe(self):
        return self.deep_extend(super(btctradeua, self).describe(), {
            'id': 'btctradeua',
            'name': 'BTC Trade UA',
            'countries': 'UA',  # Ukraine,
            'rateLimit': 3000,
            'hasCORS': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg',
                'api': 'https://btc-trade.com.ua/api',
                'www': 'https://btc-trade.com.ua',
                'doc': 'https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit',
            },
            'api': {
                'public': {
                    'get': [
                        'deals/{symbol}',
                        'trades/sell/{symbol}',
                        'trades/buy/{symbol}',
                        'japan_stat/high/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'auth',
                        'ask/{symbol}',
                        'balance',
                        'bid/{symbol}',
                        'buy/{symbol}',
                        'my_orders/{symbol}',
                        'order/status/{id}',
                        'remove/order/{id}',
                        'sell/{symbol}',
                    ],
                },
            },
            'markets': {
                'BTC/UAH': {'id': 'btc_uah', 'symbol': 'BTC/UAH', 'base': 'BTC', 'quote': 'UAH', 'precision': {'price': 1}, 'limits': {'amount': {'min': 0.0000000001}}},
                'ETH/UAH': {'id': 'eth_uah', 'symbol': 'ETH/UAH', 'base': 'ETH', 'quote': 'UAH'},
                'LTC/UAH': {'id': 'ltc_uah', 'symbol': 'LTC/UAH', 'base': 'LTC', 'quote': 'UAH'},
                'DOGE/UAH': {'id': 'doge_uah', 'symbol': 'DOGE/UAH', 'base': 'DOGE', 'quote': 'UAH'},
                'DASH/UAH': {'id': 'dash_uah', 'symbol': 'DASH/UAH', 'base': 'DASH', 'quote': 'UAH'},
                'SIB/UAH': {'id': 'sib_uah', 'symbol': 'SIB/UAH', 'base': 'SIB', 'quote': 'UAH'},
                'KRB/UAH': {'id': 'krb_uah', 'symbol': 'KRB/UAH', 'base': 'KRB', 'quote': 'UAH'},
                'NVC/UAH': {'id': 'nvc_uah', 'symbol': 'NVC/UAH', 'base': 'NVC', 'quote': 'UAH'},
                'LTC/BTC': {'id': 'ltc_btc', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                'NVC/BTC': {'id': 'nvc_btc', 'symbol': 'NVC/BTC', 'base': 'NVC', 'quote': 'BTC'},
                'ITI/UAH': {'id': 'iti_uah', 'symbol': 'ITI/UAH', 'base': 'ITI', 'quote': 'UAH'},
                'DOGE/BTC': {'id': 'doge_btc', 'symbol': 'DOGE/BTC', 'base': 'DOGE', 'quote': 'BTC'},
                'DASH/BTC': {'id': 'dash_btc', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC'},
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.1 / 100,
                },
            },
        })

    def sign_in(self):
        return self.privatePostAuth()

    async def fetch_balance(self, params={}):
        response = await self.privatePostBalance()
        result = {'info': response}
        if 'accounts' in response:
            accounts = response['accounts']
            for b in range(0, len(accounts)):
                account = accounts[b]
                currency = account['currency']
                balance = float(account['balance'])
                result[currency] = {
                    'free': balance,
                    'used': 0.0,
                    'total': balance,
                }
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        market = self.market(symbol)
        bids = await self.publicGetTradesBuySymbol(self.extend({
            'symbol': market['id'],
        }, params))
        asks = await self.publicGetTradesSellSymbol(self.extend({
            'symbol': market['id'],
        }, params))
        orderbook = {
            'bids': [],
            'asks': [],
        }
        if bids:
            if 'list' in bids:
                orderbook['bids'] = bids['list']
        if asks:
            if 'list' in asks:
                orderbook['asks'] = asks['list']
        return self.parse_order_book(orderbook, None, 'bids', 'asks', 'price', 'currency_trade')

    async def fetch_ticker(self, symbol, params={}):
        response = await self.publicGetJapanStatHighSymbol(self.extend({
            'symbol': self.market_id(symbol),
        }, params))
        orderbook = await self.fetch_order_book(symbol)
        bid = None
        numBids = len(orderbook['bids'])
        if numBids > 0:
            bid = orderbook['bids'][0][0]
        ask = None
        numAsks = len(orderbook['asks'])
        if numAsks > 0:
            ask = orderbook['asks'][0][0]
        ticker = response['trades']
        timestamp = self.milliseconds()
        result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': None,
            'low': None,
            'bid': bid,
            'ask': ask,
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': None,
            'info': ticker,
        }
        tickerLength = len(ticker)
        if tickerLength > 0:
            start = max(tickerLength - 48, 0)
            for t in range(start, len(ticker)):
                candle = ticker[t]
                if result['open'] is None:
                    result['open'] = candle[1]
                if (result['high'] is None) or (result['high'] < candle[2]):
                    result['high'] = candle[2]
                if (result['low'] is None) or (result['low'] > candle[3]):
                    result['low'] = candle[3]
                if result['baseVolume'] is None:
                    result['baseVolume'] = -candle[5]
                else:
                    result['baseVolume'] -= candle[5]
            last = tickerLength - 1
            result['close'] = ticker[last][4]
            result['baseVolume'] = -1 * result['baseVolume']
        return result

    def convert_cyrillic_month_name_to_string(self, cyrillic):
        months = [
            u'января',
            u'февраля',
            u'марта',
            u'апреля',
            u'мая',
            u'июня',
            u'июля',
            u'августа',
            u'сентября',
            u'октября',
            u'ноября',
            u'декабря',
        ]
        month = None
        for i in range(0, len(months)):
            if cyrillic == months[i]:
                month = i + 1
                month = str(month)
                if i < 9:
                    month = '0' + month
        return month

    def parse_cyrillic_datetime(self, cyrillic):
        parts = cyrillic.split(' ')
        day = parts[0]
        month = self.convert_cyrillic_month_name_to_string(parts[1])
        if not month:
            raise ExchangeError(self.id + ' parseTrade() None month name: ' + cyrillic)
        year = parts[2]
        hms = parts[4]
        hmsLength = len(hms)
        if hmsLength == 7:
            hms = '0' + hms
        ymd = '-'.join([year, month, day])
        ymdhms = ymd + 'T' + hms
        timestamp = self.parse8601(ymdhms)
        timestamp = timestamp - 10800000  # server reports local GMT+3 time, adjust to UTC
        return timestamp

    def parse_trade(self, trade, market):
        timestamp = self.parse_cyrillic_datetime(trade['pub_date'])
        return {
            'id': str(trade['id']),
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': None,
            'price': float(trade['price']),
            'amount': float(trade['amnt_trade']),
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        market = self.market(symbol)
        response = await self.publicGetDealsSymbol(self.extend({
            'symbol': market['id'],
        }, params))
        trades = []
        for i in range(0, len(response)):
            if response[i]['id'] % 2:
                trades.append(response[i])
        return self.parse_trades(trades, market, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        if type == 'market':
            raise ExchangeError(self.id + ' allows limit orders only')
        market = self.market(symbol)
        method = 'privatePost' + self.capitalize(side) + 'Id'
        order = {
            'count': amount,
            'currency1': market['quote'],
            'currency': market['base'],
            'price': price,
        }
        return getattr(self, method)(self.extend(order, params))

    async def cancel_order(self, id, symbol=None, params={}):
        return await self.privatePostRemoveOrderId({'id': id})

    def parse_order(self, trade, market):
        timestamp = self.milliseconds
        return {
            'id': trade['id'],
            'timestamp': timestamp,  # until they fix their timestamp
            'datetime': self.iso8601(timestamp),
            'status': 'open',
            'symbol': market['symbol'],
            'type': None,
            'side': trade['type'],
            'price': trade['price'],
            'amount': trade['amnt_trade'],
            'filled': 0,
            'remaining': trade['amnt_trade'],
            'trades': None,
            'info': trade,
        }

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOpenOrders requires a symbol param')
        market = self.market(symbol)
        response = await self.privatePostMyOrdersSymbol(self.extend({
            'symbol': market['id'],
        }, params))
        orders = response['your_open_orders']
        return self.parse_orders(orders, market, since, limit)

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += self.implode_params(path, query)
        else:
            self.check_required_credentials()
            nonce = self.nonce()
            body = self.urlencode(self.extend({
                'out_order_id': nonce,
                'nonce': nonce,
            }, query))
            auth = body + self.secret
            headers = {
                'public-key': self.apiKey,
                'api-sign': self.hash(self.encode(auth), 'sha256'),
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}
