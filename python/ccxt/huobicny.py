# -*- coding: utf-8 -*-

from ccxt.huobipro import huobipro


class huobicny (huobipro):

    def describe(self):
        return self.deep_extend(super(huobicny, self).describe(), {
            'id': 'huobicny',
            'name': 'Huobi CNY',
            'hostname': 'be.huobi.com',
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg',
                'api': 'https://be.huobi.com',
                'www': 'https://www.huobi.com',
                'doc': 'https://github.com/huobiapi/API_Docs/wiki/REST_api_reference',
            },
        })
