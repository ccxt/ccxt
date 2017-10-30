# -*- coding: utf-8 -*-

from ccxt.exchanges import blinktrade

class foxbit (blinktrade):

    def describe(self):
        return self.deep_extend(super(foxbit, self).describe(), {
            'id': 'foxbit',
            'name': 'FoxBit',
            'countries': 'BR',
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991413-11b40d42-647f-11e7-91ee-78ced874dd09.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://foxbit.exchange',
                'doc': 'https://blinktrade.com/docs',
            },
            'comment': 'Blinktrade API',
            'markets': {
                'BTC/BRL': {'id': 'BTCBRL', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'brokerId': 4, 'broker': 'FoxBit'},
            },
        })
