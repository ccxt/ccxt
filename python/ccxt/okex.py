# -*- coding: utf-8 -*-

from ccxt.okcoinusd import okcoinusd


class okex (okcoinusd):

    def describe(self):
        return self.deep_extend(super(okex, self).describe(), {
            'id': 'okex',
            'name': 'OKEX',
            'countries': ['CN', 'US'],
            'hasCORS': False,
            'hasFutureMarkets': True,
            'hasFetchTickers': True,
            'has': {
                'fetchTickers': True,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg',
                'api': {
                    'web': 'https://www.okex.com/v2',
                    'public': 'https://www.okex.com/api',
                    'private': 'https://www.okex.com/api',
                },
                'www': 'https://www.okex.com',
                'doc': 'https://www.okex.com/rest_getStarted.html',
                'fees': 'https://www.okex.com/fees.html',
            },
        })

    def common_currency_code(self, currency):
        currencies = {
            'FAIR': 'FairGame',
        }
        if currency in currencies:
            return currencies[currency]
        return currency

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        request = {}
        response = self.publicGetTickers(self.extend(request, params))
        tickers = response['tickers']
        timestamp = int(response['date']) * 1000
        result = {}
        for i in range(0, len(tickers)):
            ticker = tickers[i]
            market = None
            if 'symbol' in ticker:
                marketId = ticker['symbol']
                if marketId in self.markets_by_id:
                    market = self.markets_by_id[marketId]
            ticker = self.parse_ticker(self.extend(tickers[i], {'timestamp': timestamp}), market)
            symbol = ticker['symbol']
            result[symbol] = ticker
        return result
