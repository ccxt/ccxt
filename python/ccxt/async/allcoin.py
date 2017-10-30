# -*- coding: utf-8 -*-

from ccxt import okcoin

class allcoin (okcoin):

    def describe(self):
        return self.deep_extend(super(allcoin, self).describe(), {
            'id': 'allcoin',
            'name': 'Allcoin',
            'countries': 'CA',
            'hasCORS': False,
            'extension': '',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31561809-c316b37c-b061-11e7-8d5a-b547b4d730eb.jpg',
                'api': {
                    'web': 'https://allcoin.com',
                    'public': 'https://api.allcoin.com/api',
                    'private': 'https://api.allcoin.com/api',
                },
                'www': 'https://allcoin.com',
                'doc': 'https://allcoin.com/About/APIReference',
            },
            'api': {
                'web': {
                    'get': [
                        'marketoverviews/',
                    ],
                },
                'public': {
                    'get': [
                        'depth',
                        'kline',
                        'ticker',
                        'trades',
                    ],
                },
                'private': {
                    'post': [
                        'batch_trade',
                        'cancel_order',
                        'order_history',
                        'order_info',
                        'orders_info',
                        'repayment',
                        'trade',
                        'trade_history',
                        'userinfo',
                    ],
                },
            },
        })

    async def fetch_markets(self):
        currencies = ['BTC', 'ETH', 'USD', 'QTUM']
        result = []
        for i in range(0, len(currencies)):
            currency = currencies[i]
            response = await self.webGetMarketoverviews({
                'type': 'full',
                'secondary': currency,
            })
            markets = response['Markets']
            for k in range(0, len(markets)):
                market = markets[k]
                base = market['Primary']
                quote = market['Secondary']
                id = base.lower() + '_' + quote.lower()
                symbol = base + '/' + quote
                result.append({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'type': 'spot',
                    'spot': True,
                    'future': False,
                    'info': market,
                })
        return result

    def get_order_status(self, status):
        if status == -1:
            return 'canceled'
        if status == 0:
            return 'open'
        if status == 1:
            return 'partial'
        if status == 2:
            return 'closed'
        if status == 10:
            return 'canceled'
        return status
