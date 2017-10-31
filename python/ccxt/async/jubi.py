# -*- coding: utf-8 -*-

from ccxt.async.btcbox import btcbox


class jubi (btcbox):

    def describe(self):
        return self.deep_extend(super(jubi, self).describe(), {
            'id': 'jubi',
            'name': 'jubi.com',
            'countries': 'CN',
            'rateLimit': 1500,
            'version': 'v1',
            'hasCORS': False,
            'hasFetchTickers': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg',
                'api': 'https://www.jubi.com/api',
                'www': 'https://www.jubi.com',
                'doc': 'https://www.jubi.com/help/api.html',
            },
        })

    async def fetch_markets(self):
        markets = await self.publicGetAllticker()
        keys = list(markets.keys())
        result = []
        for p in range(0, len(keys)):
            id = keys[p]
            base = id.upper()
            quote = 'CNY'  # todo
            symbol = base + '/' + quote
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': id,
            })
        return result
