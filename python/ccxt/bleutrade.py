# -*- coding: utf-8 -*-

from ccxt import bittrex


class bleutrade (bittrex):

    def describe(self):
        return self.deep_extend(super(bleutrade, self).describe(), {
            'id': 'bleutrade',
            'name': 'Bleutrade',
            'countries': 'BR',  # Brazil
            'rateLimit': 1000,
            'version': 'v2',
            'hasCORS': True,
            'hasFetchTickers': True,
            'hasFetchOHLCV': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg',
                'api': {
                    'public': 'https://bleutrade.com/api',
                    'account': 'https://bleutrade.com/api',
                    'market': 'https://bleutrade.com/api',
                },
                'www': 'https://bleutrade.com',
                'doc': 'https://bleutrade.com/help/API',
            },
        })

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        response = self.publicGetOrderbook(self.extend({
            'market': self.market_id(symbol),
            'type': 'ALL',
            'depth': 50,
        }, params))
        orderbook = response['result']
        return self.parse_order_book(orderbook, None, 'buy', 'sell', 'Rate', 'Quantity')
