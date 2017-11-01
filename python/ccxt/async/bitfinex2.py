# -*- coding: utf-8 -*-

from ccxt.async.bitfinex import bitfinex
import hashlib
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NotSupported
from ccxt.base.errors import InsufficientFunds


class bitfinex2 (bitfinex):

    def describe(self):
        return self.deep_extend(super(bitfinex2, self).describe(), {
            'id': 'bitfinex2',
            'name': 'Bitfinex v2',
            'countries': 'US',
            'version': 'v2',
            'hasCORS': True,
            'hasFetchTickers': False,  # True but at least one pair is required
            'hasFetchOHLCV': True,
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': 'https://api.bitfinex.com',
                'www': 'https://www.bitfinex.com',
                'doc': [
                    'https://bitfinex.readme.io/v2/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'platform/status',
                        'tickers',  # replies with an empty list :\
                        'ticker/{symbol}',
                        'trades/{symbol}/hist',
                        'book/{symbol}/{precision}',
                        'book/{symbol}/P0',
                        'book/{symbol}/P1',
                        'book/{symbol}/P2',
                        'book/{symbol}/P3',
                        'book/{symbol}/R0',
                        'symbols_details',
                        'stats1/{key}:{size}:{symbol}/{side}/{section}',
                        'stats1/{key}:{size}:{symbol}/long/last',
                        'stats1/{key}:{size}:{symbol}/long/hist',
                        'stats1/{key}:{size}:{symbol}/short/last',
                        'stats1/{key}:{size}:{symbol}/short/hist',
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ],
                    'post': [
                        'calc/trade/avg',
                    ],
                },
                'private': {
                    'post': [
                        'auth/r/wallets',
                        'auth/r/orders/{symbol}',
                        'auth/r/orders/{symbol}/new',
                        'auth/r/orders/{symbol}/hist',
                        'auth/r/order/{symbol}:{id}/trades',
                        'auth/r/trades/{symbol}/hist',
                        'auth/r/funding/offers/{symbol}',
                        'auth/r/funding/offers/{symbol}/hist',
                        'auth/r/funding/loans/{symbol}',
                        'auth/r/funding/loans/{symbol}/hist',
                        'auth/r/funding/credits/{symbol}',
                        'auth/r/funding/credits/{symbol}/hist',
                        'auth/r/funding/trades/{symbol}/hist',
                        'auth/r/info/margin/{key}',
                        'auth/r/info/funding/{key}',
                        'auth/r/movements/{currency}/hist',
                        'auth/r/stats/perf:{timeframe}/hist',
                        'auth/r/alerts',
                        'auth/w/alert/set',
                        'auth/w/alert/{type}:{symbol}:{price}/del',
                        'auth/calc/order/avail',
                    ],
                },
            },
            'markets': {
                'BCC/BTC': {'id': 'tBCCBTC', 'symbol': 'BCC/BTC', 'base': 'BCC', 'quote': 'BTC'},
                'BCC/USD': {'id': 'tBCCUSD', 'symbol': 'BCC/USD', 'base': 'BCC', 'quote': 'USD'},
                'BCH/BTC': {'id': 'tBCHBTC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC'},
                'BCH/ETH': {'id': 'tBCHETH', 'symbol': 'BCH/ETH', 'base': 'BCH', 'quote': 'ETH'},
                'BCH/USD': {'id': 'tBCHUSD', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD'},
                'BCU/BTC': {'id': 'tBCUBTC', 'symbol': 'BCU/BTC', 'base': 'BCU', 'quote': 'BTC'},
                'BCU/USD': {'id': 'tBCUUSD', 'symbol': 'BCU/USD', 'base': 'BCU', 'quote': 'USD'},
                'BTC/USD': {'id': 'tBTCUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD'},
                'DASH/BTC': {'id': 'tDSHBTC', 'symbol': 'DASH/BTC', 'base': 'DASH', 'quote': 'BTC'},
                'DASH/USD': {'id': 'tDSHUSD', 'symbol': 'DASH/USD', 'base': 'DASH', 'quote': 'USD'},
                'EOS/BTC': {'id': 'tEOSBTC', 'symbol': 'EOS/BTC', 'base': 'EOS', 'quote': 'BTC'},
                'EOS/ETH': {'id': 'tEOSETH', 'symbol': 'EOS/ETH', 'base': 'EOS', 'quote': 'ETH'},
                'EOS/USD': {'id': 'tEOSUSD', 'symbol': 'EOS/USD', 'base': 'EOS', 'quote': 'USD'},
                'ETC/BTC': {'id': 'tETCBTC', 'symbol': 'ETC/BTC', 'base': 'ETC', 'quote': 'BTC'},
                'ETC/USD': {'id': 'tETCUSD', 'symbol': 'ETC/USD', 'base': 'ETC', 'quote': 'USD'},
                'ETH/BTC': {'id': 'tETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC'},
                'ETH/USD': {'id': 'tETHUSD', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD'},
                'IOT/BTC': {'id': 'tIOTBTC', 'symbol': 'IOT/BTC', 'base': 'IOT', 'quote': 'BTC'},
                'IOT/ETH': {'id': 'tIOTETH', 'symbol': 'IOT/ETH', 'base': 'IOT', 'quote': 'ETH'},
                'IOT/USD': {'id': 'tIOTUSD', 'symbol': 'IOT/USD', 'base': 'IOT', 'quote': 'USD'},
                'LTC/BTC': {'id': 'tLTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC'},
                'LTC/USD': {'id': 'tLTCUSD', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD'},
                'OMG/BTC': {'id': 'tOMGBTC', 'symbol': 'OMG/BTC', 'base': 'OMG', 'quote': 'BTC'},
                'OMG/ETH': {'id': 'tOMGETH', 'symbol': 'OMG/ETH', 'base': 'OMG', 'quote': 'ETH'},
                'OMG/USD': {'id': 'tOMGUSD', 'symbol': 'OMG/USD', 'base': 'OMG', 'quote': 'USD'},
                'RRT/BTC': {'id': 'tRRTBTC', 'symbol': 'RRT/BTC', 'base': 'RRT', 'quote': 'BTC'},
                'RRT/USD': {'id': 'tRRTUSD', 'symbol': 'RRT/USD', 'base': 'RRT', 'quote': 'USD'},
                'SAN/BTC': {'id': 'tSANBTC', 'symbol': 'SAN/BTC', 'base': 'SAN', 'quote': 'BTC'},
                'SAN/ETH': {'id': 'tSANETH', 'symbol': 'SAN/ETH', 'base': 'SAN', 'quote': 'ETH'},
                'SAN/USD': {'id': 'tSANUSD', 'symbol': 'SAN/USD', 'base': 'SAN', 'quote': 'USD'},
                'XMR/BTC': {'id': 'tXMRBTC', 'symbol': 'XMR/BTC', 'base': 'XMR', 'quote': 'BTC'},
                'XMR/USD': {'id': 'tXMRUSD', 'symbol': 'XMR/USD', 'base': 'XMR', 'quote': 'USD'},
                'XRP/BTC': {'id': 'tXRPBTC', 'symbol': 'XRP/BTC', 'base': 'XRP', 'quote': 'BTC'},
                'XRP/USD': {'id': 'tXRPUSD', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD'},
                'ZEC/BTC': {'id': 'tZECBTC', 'symbol': 'ZEC/BTC', 'base': 'ZEC', 'quote': 'BTC'},
                'ZEC/USD': {'id': 'tZECUSD', 'symbol': 'ZEC/USD', 'base': 'ZEC', 'quote': 'USD'},
            },
        })

    def common_currency_code(self, currency):
        # issue  #4 Bitfinex names Dash as DSH, instead of DASH
        if currency == 'DSH':
            return 'DASH'
        if currency == 'QTM':
            return 'QTUM'
        return currency

    async def fetch_balance(self, params={}):
        response = await self.privatePostAuthRWallets()
        result = {'info': response}
        for b in range(0, len(response)):
            balance = response[b]
            type, currency, total, interest, available = balance
            if currency[0] == 't':
                currency = currency[1:]
            uppercase = currency.upper()
            uppercase = self.common_currency_code(uppercase)
            account = self.account()
            account['free'] = available
            account['total'] = total
            if account['free']:
                account['used'] = account['total'] - account['free']
            result[uppercase] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        orderbook = await self.publicGetBookSymbolPrecision(self.extend({
            'symbol': self.market_id(symbol),
            'precision': 'R0',
        }, params))
        timestamp = self.milliseconds()
        result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
        }
        for i in range(0, len(orderbook)):
            order = orderbook[i]
            price = order[1]
            amount = order[2]
            side = 'bids' if (amount > 0) else 'asks'
            amount = abs(amount)
            result[side].append([price, amount])
        result['bids'] = self.sort_by(result['bids'], 0, True)
        result['asks'] = self.sort_by(result['asks'], 0)
        return result

    async def fetch_ticker(self, symbol, params={}):
        ticker = await self.publicGetTickerSymbol(self.extend({
            'symbol': self.market_id(symbol),
        }, params))
        timestamp = self.milliseconds()
        bid, bidSize, ask, askSize, change, percentage, last, volume, high, low = ticker
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'ask': ask,
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': last,
            'change': change,
            'percentage': percentage,
            'average': None,
            'baseVolume': volume,
            'quoteVolume': None,
            'info': ticker,
        }

    def parse_trade(self, trade, market):
        id, timestamp, amount, price = trade
        side = 'sell' if (amount < 0) else 'buy'
        return {
            'id': str(id),
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': side,
            'price': price,
            'amount': amount,
        }

    async def fetch_trades(self, symbol, params={}):
        market = self.market(symbol)
        response = await self.publicGetTradesSymbolHist(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_trades(response, market)

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
            'timeframe': self.timeframes[timeframe],
        }
        if limit:
            request['limit'] = limit
        if since:
            request['start'] = since
        request = self.extend(request, params)
        response = await self.publicGetCandlesTradeTimeframeSymbolHist(request)
        return self.parse_ohlcvs(response, market, timeframe, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        raise NotSupported(self.id + ' createOrder not implemented yet')

    def cancel_order(self, id, symbol=None, params={}):
        raise NotSupported(self.id + ' cancelOrder not implemented yet')

    async def fetch_order(self, id, symbol=None, params={}):
        raise NotSupported(self.id + ' fetchOrder not implemented yet')

    async def withdraw(self, currency, amount, address, params={}):
        raise NotSupported(self.id + ' withdraw not implemented yet')

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        request = self.version + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        url = self.urls['api'] + '/' + request
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            nonce = str(self.nonce())
            body = self.json(query)
            auth = '/api' + '/' + request + nonce + body
            signature = self.hmac(self.encode(auth), self.encode(self.secret), hashlib.sha384)
            headers = {
                'bfx-nonce': nonce,
                'bfx-apikey': self.apiKey,
                'bfx-signature': signature,
                'Content-Type': 'application/json',
            }
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if response:
            if 'message' in response:
                if response['message'].find('not enough exchange balance') >= 0:
                    raise InsufficientFunds(self.id + ' ' + self.json(response))
                raise ExchangeError(self.id + ' ' + self.json(response))
            return response
        raise ExchangeError(self.id + ' returned empty response')
