# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
from ccxt.base.errors import ExchangeError


class huobi (Exchange):

    def describe(self):
        return self.deep_extend(super(huobi, self).describe(), {
            'id': 'huobi',
            'name': 'Huobi',
            'countries': 'CN',
            'rateLimit': 2000,
            'version': 'v3',
            'hasCORS': False,
            'hasFetchOHLCV': True,
            'timeframes': {
                '1m': '001',
                '5m': '005',
                '15m': '015',
                '30m': '030',
                '1h': '060',
                '1d': '100',
                '1w': '200',
                '1M': '300',
                '1y': '400',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api': 'http://api.huobi.com',
                'www': 'https://www.huobi.com',
                'doc': 'https://github.com/huobiapi/API_Docs_en/wiki',
            },
            'api': {
                'staticmarket': {
                    'get': [
                        '{id}_kline_{period}',
                        'ticker_{id}',
                        'depth_{id}',
                        'depth_{id}_{length}',
                        'detail_{id}',
                    ],
                },
                'usdmarket': {
                    'get': [
                        '{id}_kline_{period}',
                        'ticker_{id}',
                        'depth_{id}',
                        'depth_{id}_{length}',
                        'detail_{id}',
                    ],
                },
                'trade': {
                    'post': [
                        'get_account_info',
                        'get_orders',
                        'order_info',
                        'buy',
                        'sell',
                        'buy_market',
                        'sell_market',
                        'cancel_order',
                        'get_new_deal_orders',
                        'get_order_id_by_trade_id',
                        'withdraw_coin',
                        'cancel_withdraw_coin',
                        'get_withdraw_coin_result',
                        'transfer',
                        'loan',
                        'repayment',
                        'get_loan_available',
                        'get_loans',
                    ],
                },
            },
            'markets': {
                'BTC/CNY': {'id': 'btc', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 1},
                'LTC/CNY': {'id': 'ltc', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY', 'type': 'staticmarket', 'coinType': 2},
                # 'BTC/USD': {'id': 'btc', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'type': 'usdmarket',    'coinType': 1},
            },
        })

    async def fetch_balance(self, params={}):
        balances = await self.tradePostGetAccountInfo()
        result = {'info': balances}
        currencies = list(self.currencies.keys())
        for i in range(0, len(currencies)):
            currency = currencies[i]
            lowercase = currency.lower()
            account = self.account()
            available = 'available_' + lowercase + '_display'
            frozen = 'frozen_' + lowercase + '_display'
            loan = 'loan_' + lowercase + '_display'
            if available in balances:
                account['free'] = float(balances[available])
            if frozen in balances:
                account['used'] = float(balances[frozen])
            if loan in balances:
                account['used'] = self.sum(account['used'], float(balances[loan]))
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        market = self.market(symbol)
        method = market['type'] + 'GetDepthId'
        orderbook = await getattr(self, method)(self.extend({'id': market['id']}, params))
        return self.parse_order_book(orderbook)

    async def fetch_ticker(self, symbol, params={}):
        market = self.market(symbol)
        method = market['type'] + 'GetTickerId'
        response = await getattr(self, method)(self.extend({
            'id': market['id'],
        }, params))
        ticker = response['ticker']
        timestamp = int(response['time']) * 1000
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': self.safe_float(ticker, 'high'),
            'low': self.safe_float(ticker, 'low'),
            'bid': self.safe_float(ticker, 'buy'),
            'ask': self.safe_float(ticker, 'sell'),
            'vwap': None,
            'open': self.safe_float(ticker, 'open'),
            'close': None,
            'first': None,
            'last': self.safe_float(ticker, 'last'),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': self.safe_float(ticker, 'vol'),
            'info': ticker,
        }

    def parse_trade(self, trade, market):
        timestamp = trade['ts']
        return {
            'info': trade,
            'id': str(trade['id']),
            'order': None,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': trade['direction'],
            'price': trade['price'],
            'amount': trade['amount'],
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        market = self.market(symbol)
        method = market['type'] + 'GetDetailId'
        response = await getattr(self, method)(self.extend({
            'id': market['id'],
        }, params))
        return self.parse_trades(response['trades'], market, since, limit)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        # not implemented yet
        return [
            ohlcv[0],
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[6],
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        market = self.market(symbol)
        method = market['type'] + 'GetIdKlinePeriod'
        ohlcvs = await getattr(self, method)(self.extend({
            'id': market['id'],
            'period': self.timeframes[timeframe],
        }, params))
        return ohlcvs
        # return self.parse_ohlcvs(ohlcvs, market, timeframe, since, limit)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        market = self.market(symbol)
        method = 'tradePost' + self.capitalize(side)
        order = {
            'coin_type': market['coinType'],
            'amount': amount,
            'market': market['quote'].lower(),
        }
        if type == 'limit':
            order['price'] = price
        else:
            method += self.capitalize(type)
        response = getattr(self, method)(self.extend(order, params))
        return {
            'info': response,
            'id': response['id'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        return await self.tradePostCancelOrder({'id': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api']
        if api == 'trade':
            self.check_required_credentials()
            url += '/api' + self.version
            query = self.keysort(self.extend({
                'method': path,
                'access_key': self.apiKey,
                'created': self.nonce(),
            }, params))
            queryString = self.urlencode(self.omit(query, 'market'))
            # secret key must be appended to the query before signing
            queryString += '&secret_key=' + self.secret
            query['sign'] = self.hash(self.encode(queryString))
            body = self.urlencode(query)
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        else:
            url += '/' + api + '/' + self.implode_params(path, params) + '_json.js'
            query = self.omit(params, self.extract_params(path))
            if query:
                url += '?' + self.urlencode(query)
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='trade', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'status' in response:
            if response['status'] == 'error':
                raise ExchangeError(self.id + ' ' + self.json(response))
        if 'code' in response:
            raise ExchangeError(self.id + ' ' + self.json(response))
        return response
