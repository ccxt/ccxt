# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError


class ccex (Exchange):

    def describe(self):
        return self.deep_extend(super(ccex, self).describe(), {
            'id': 'ccex',
            'name': 'C-CEX',
            'countries': ['DE', 'EU'],
            'rateLimit': 1500,
            'hasCORS': False,
            'hasFetchTickers': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766433-16881f90-5ed8-11e7-92f8-3d92cc747a6c.jpg',
                'api': {
                    'tickers': 'https://c-cex.com/t',
                    'public': 'https://c-cex.com/t/api_pub.html',
                    'private': 'https://c-cex.com/t/api.html',
                },
                'www': 'https://c-cex.com',
                'doc': 'https://c-cex.com/?id=api',
            },
            'api': {
                'tickers': {
                    'get': [
                        'coinnames',
                        '{market}',
                        'pairs',
                        'prices',
                        'volume_{coin}',
                    ],
                },
                'public': {
                    'get': [
                        'balancedistribution',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'orderbook',
                    ],
                },
                'private': {
                    'get': [
                        'buylimit',
                        'cancel',
                        'getbalance',
                        'getbalances',
                        'getopenorders',
                        'getorder',
                        'getorderhistory',
                        'mytrades',
                        'selllimit',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.2 / 100,
                    'maker': 0.2 / 100,
                },
            },
        })

    def common_currency_code(self, currency):
        if currency == 'IOT':
            return 'IoTcoin'
        if currency == 'BLC':
            return 'Cryptobullcoin'
        if currency == 'XID':
            return 'InternationalDiamond'
        return currency

    async def fetch_markets(self):
        markets = await self.publicGetMarkets()
        result = []
        for p in range(0, len(markets['result'])):
            market = markets['result'][p]
            id = market['MarketName']
            base = market['MarketCurrency']
            quote = market['BaseCurrency']
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            }))
        return result

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privateGetBalances()
        balances = response['result']
        result = {'info': balances}
        for b in range(0, len(balances)):
            balance = balances[b]
            code = balance['Currency']
            currency = self.common_currency_code(code)
            account = {
                'free': balance['Available'],
                'used': balance['Pending'],
                'total': balance['Balance'],
            }
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        response = await self.publicGetOrderbook(self.extend({
            'market': self.market_id(symbol),
            'type': 'both',
            'depth': 100,
        }, params))
        orderbook = response['result']
        return self.parse_order_book(orderbook, None, 'buy', 'sell', 'Rate', 'Quantity')

    def parse_ticker(self, ticker, market=None):
        timestamp = ticker['updated'] * 1000
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['buy']),
            'ask': float(ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['lastprice']),
            'change': None,
            'percentage': None,
            'average': float(ticker['avg']),
            'baseVolume': None,
            'quoteVolume': self.safe_float(ticker, 'buysupport'),
            'info': ticker,
        }

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        tickers = await self.tickersGetPrices(params)
        result = {'info': tickers}
        ids = list(tickers.keys())
        for i in range(0, len(ids)):
            id = ids[i]
            ticker = tickers[id]
            uppercase = id.upper()
            market = None
            symbol = None
            if uppercase in self.markets_by_id:
                market = self.markets_by_id[uppercase]
                symbol = market['symbol']
            else:
                base, quote = uppercase.split('-')
                base = self.common_currency_code(base)
                quote = self.common_currency_code(quote)
                symbol = base + '/' + quote
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.tickersGetMarket(self.extend({
            'market': market['id'].lower(),
        }, params))
        ticker = response['ticker']
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market):
        timestamp = self.parse8601(trade['TimeStamp'])
        return {
            'id': trade['Id'],
            'info': trade,
            'order': None,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': trade['OrderType'].lower(),
            'price': trade['Price'],
            'amount': trade['Quantity'],
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetMarkethistory(self.extend({
            'market': market['id'],
            'type': 'both',
            'depth': 100,
        }, params))
        return self.parse_trades(response['result'], market, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        method = 'privateGet' + self.capitalize(side) + type
        response = await getattr(self, method)(self.extend({
            'market': self.market_id(symbol),
            'quantity': amount,
            'rate': price,
        }, params))
        return {
            'info': response,
            'id': response['result']['uuid'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        await self.load_markets()
        return await self.privateGetCancel({'uuid': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        if api == 'private':
            self.check_required_credentials()
            nonce = str(self.nonce())
            query = self.keysort(self.extend({
                'a': path,
                'apikey': self.apiKey,
                'nonce': nonce,
            }, params))
            url += '?' + self.urlencode(query)
            headers = {'apisign': self.hmac(self.encode(url), self.encode(self.secret), hashlib.sha512)}
        elif api == 'public':
            url += '?' + self.urlencode(self.extend({
                'a': 'get' + path,
            }, params))
        else:
            url += '/' + self.implode_params(path, params) + '.json'
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if api == 'tickers':
            return response
        if 'success' in response:
            if response['success']:
                return response
        raise ExchangeError(self.id + ' ' + self.json(response))
