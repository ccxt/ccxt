# -*- coding: utf-8 -*-

from ccxt.async.foxbit import foxbit


class urdubit (foxbit):

    def describe(self):
        return self.deep_extend(super(urdubit, self).describe(), {
            'id': 'urdubit',
            'name': 'UrduBit',
            'countries': 'PK',
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27991453-156bf3ae-6480-11e7-82eb-7295fe1b5bb4.jpg',
                'api': {
                    'public': 'https://api.blinktrade.com/api',
                    'private': 'https://api.blinktrade.com/tapi',
                },
                'www': 'https://urdubit.com',
                'doc': 'https://blinktrade.com/docs',
            },
        })
