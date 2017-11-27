# -*- coding: utf-8 -*-

from ccxt.async.liqui import liqui


class tidex (liqui):

    def describe(self):
        return self.deep_extend(super(tidex, self).describe(), {
            'id': 'tidex',
            'name': 'Tidex',
            'countries': 'UK',
            'rateLimit': 2000,
            'version': '3',
            # 'hasCORS': False,
            # 'hasFetchTickers': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg',
                'api': {
                    'public': 'https://api.tidex.com/api',
                    'private': 'https://api.tidex.com/tapi',
                },
                'www': 'https://tidex.com',
                'doc': 'https://tidex.com/public-api',
                'fees': 'https://tidex.com/pairs-spec'
            },
        })
