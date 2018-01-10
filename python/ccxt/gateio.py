# -*- coding: utf-8 -*-

from ccxt.bter import bter


class gateio (bter):

    def describe(self):
        return self.deep_extend(super(gateio, self).describe(), {
            'id': 'gateio',
            'name': 'Gate.io',
            'countries': 'CN',
            'rateLimit': 1000,
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg',
                'api': {
                    'public': 'https://data.gate.io/api',
                    'private': 'https://data.gate.io/api',
                },
                'www': 'https://gate.io/',
                'doc': 'https://gate.io/api2',
                'fees': 'https://gate.io/fee',
            },
        })

    def parse_trade(self, trade, market):
        # exchange reports local time(UTC+8)
        timestamp = self.parse8601(trade['date']) - 8 * 60 * 60 * 1000
        return {
            'id': trade['tradeID'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': trade['type'],
            'price': trade['rate'],
            'amount': self.safe_float(trade, 'amount'),
        }
