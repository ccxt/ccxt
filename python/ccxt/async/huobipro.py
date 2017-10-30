# -*- coding: utf-8 -*-

from ccxt.exchanges import huobi1

class huobipro (huobi1):

    def describe(self):
        return self.deep_extend(super(huobipro, self).describe(), {
            'id': 'huobipro',
            'name': 'Huobi Pro',
            'hostname': 'api.huobi.pro',
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api': 'https://api.huobi.pro',
                'www': 'https://www.huobi.pro',
                'doc': 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
            },
        })
