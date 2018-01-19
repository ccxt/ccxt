# -*- coding: utf-8 -*-

from ccxt.qryptos import qryptos


class quoinex (qryptos):

    def describe(self):
        return self.deep_extend(super(quoinex, self).describe(), {
            'id': 'quoinex',
            'name': 'QUOINEX',
            'countries': ['JP', 'SG', 'VN'],
            'version': '2',
            'rateLimit': 1000,
            'hasFetchTickers': True,
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/35047114-0e24ad4a-fbaa-11e7-96a9-69c1a756083b.jpg',
                'api': 'https://api.quoine.com',
                'www': 'https://quoinex.com/',
                'doc': [
                    'https://developers.quoine.com',
                    'https://developers.quoine.com/v2',
                ],
                'fees': 'https://quoine.zendesk.com/hc/en-us/articles/115011281488-Fees',
            },
        })
