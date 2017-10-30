# -*- coding: utf-8 -*-

from ccxt.exchanges import cryptocapital

class _1btcxe (cryptocapital):

    def describe(self):
        return self.deep_extend(super(_1btcxe, self).describe(), {
            'id': '_1btcxe',
            'name': '1BTCXE',
            'countries': 'PA',  # Panama
            'comment': 'Crypto Capital API',
            'hasCORS': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg',
                'api': 'https://1btcxe.com/api',
                'www': 'https://1btcxe.com',
                'doc': 'https://1btcxe.com/api-docs.php',
            },
            'markets': {
                'BTC/USD': {'id': 'USD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD'},
                'BTC/EUR': {'id': 'EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR'},
                'BTC/CNY': {'id': 'CNY', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY'},
                'BTC/RUB': {'id': 'RUB', 'symbol': 'BTC/RUB', 'base': 'BTC', 'quote': 'RUB'},
                'BTC/CHF': {'id': 'CHF', 'symbol': 'BTC/CHF', 'base': 'BTC', 'quote': 'CHF'},
                'BTC/JPY': {'id': 'JPY', 'symbol': 'BTC/JPY', 'base': 'BTC', 'quote': 'JPY'},
                'BTC/GBP': {'id': 'GBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP'},
                'BTC/CAD': {'id': 'CAD', 'symbol': 'BTC/CAD', 'base': 'BTC', 'quote': 'CAD'},
                'BTC/AUD': {'id': 'AUD', 'symbol': 'BTC/AUD', 'base': 'BTC', 'quote': 'AUD'},
                'BTC/AED': {'id': 'AED', 'symbol': 'BTC/AED', 'base': 'BTC', 'quote': 'AED'},
                'BTC/BGN': {'id': 'BGN', 'symbol': 'BTC/BGN', 'base': 'BTC', 'quote': 'BGN'},
                'BTC/CZK': {'id': 'CZK', 'symbol': 'BTC/CZK', 'base': 'BTC', 'quote': 'CZK'},
                'BTC/DKK': {'id': 'DKK', 'symbol': 'BTC/DKK', 'base': 'BTC', 'quote': 'DKK'},
                'BTC/HKD': {'id': 'HKD', 'symbol': 'BTC/HKD', 'base': 'BTC', 'quote': 'HKD'},
                'BTC/HRK': {'id': 'HRK', 'symbol': 'BTC/HRK', 'base': 'BTC', 'quote': 'HRK'},
                'BTC/HUF': {'id': 'HUF', 'symbol': 'BTC/HUF', 'base': 'BTC', 'quote': 'HUF'},
                'BTC/ILS': {'id': 'ILS', 'symbol': 'BTC/ILS', 'base': 'BTC', 'quote': 'ILS'},
                'BTC/INR': {'id': 'INR', 'symbol': 'BTC/INR', 'base': 'BTC', 'quote': 'INR'},
                'BTC/MUR': {'id': 'MUR', 'symbol': 'BTC/MUR', 'base': 'BTC', 'quote': 'MUR'},
                'BTC/MXN': {'id': 'MXN', 'symbol': 'BTC/MXN', 'base': 'BTC', 'quote': 'MXN'},
                'BTC/NOK': {'id': 'NOK', 'symbol': 'BTC/NOK', 'base': 'BTC', 'quote': 'NOK'},
                'BTC/NZD': {'id': 'NZD', 'symbol': 'BTC/NZD', 'base': 'BTC', 'quote': 'NZD'},
                'BTC/PLN': {'id': 'PLN', 'symbol': 'BTC/PLN', 'base': 'BTC', 'quote': 'PLN'},
                'BTC/RON': {'id': 'RON', 'symbol': 'BTC/RON', 'base': 'BTC', 'quote': 'RON'},
                'BTC/SEK': {'id': 'SEK', 'symbol': 'BTC/SEK', 'base': 'BTC', 'quote': 'SEK'},
                'BTC/SGD': {'id': 'SGD', 'symbol': 'BTC/SGD', 'base': 'BTC', 'quote': 'SGD'},
                'BTC/THB': {'id': 'THB', 'symbol': 'BTC/THB', 'base': 'BTC', 'quote': 'THB'},
                'BTC/TRY': {'id': 'TRY', 'symbol': 'BTC/TRY', 'base': 'BTC', 'quote': 'TRY'},
                'BTC/ZAR': {'id': 'ZAR', 'symbol': 'BTC/ZAR', 'base': 'BTC', 'quote': 'ZAR'},
            },
        })
