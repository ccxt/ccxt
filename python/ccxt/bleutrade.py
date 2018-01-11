# -*- coding: utf-8 -*-

from ccxt.bittrex import bittrex
import math


class bleutrade (bittrex):

    def describe(self):
        return self.deep_extend(super(bleutrade, self).describe(), {
            'id': 'bleutrade',
            'name': 'Bleutrade',
            'countries': 'BR',  # Brazil
            'rateLimit': 1000,
            'version': 'v2',
            'hasCORS': True,
            'hasFetchTickers': True,
            'hasFetchOHLCV': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg',
                'api': {
                    'public': 'https://bleutrade.com/api',
                    'account': 'https://bleutrade.com/api',
                    'market': 'https://bleutrade.com/api',
                },
                'www': 'https://bleutrade.com',
                'doc': 'https://bleutrade.com/help/API',
                'fees': 'https://bleutrade.com/help/fees_and_deadlines',
            },
            'fees': {
                'funding': {
                    'ADC': 0.1,
                    'BTA': 0.1,
                    'BITB': 0.1,
                    'BTC': 0.001,
                    'BCH': 0.001,
                    'BTCD': 0.001,
                    'BTG': 0.001,
                    'BLK': 0.1,
                    'CDN': 0.1,
                    'CLAM': 0.01,
                    'DASH': 0.001,
                    'DCR': 0.05,
                    'DGC': 0.1,
                    'DP': 0.1,
                    'DPC': 0.1,
                    'DOGE': 0.0,
                    'EFL': 0.1,
                    'ETH': 0.01,
                    'EXP': 0.1,
                    'FJC': 0.1,
                    'BSTY': 0.001,
                    'GB': 0.1,
                    'NLG': 0.1,
                    'HTML': 1.0,
                    'LTC': 0.001,
                    'MONA': 0.01,
                    'MOON': 1.0,
                    'NMC': 0.015,
                    'NEOS': 0.1,
                    'NVC': 0.05,
                    'OK': 0.1,
                    'PPC': 0.1,
                    'POT': 0.1,
                    'XPM': 0.001,
                    'QTUM': 0.1,
                    'RDD': 0.1,
                    'SLR': 0.1,
                    'START': 0.1,
                    'SLG': 0.1,
                    'TROLL': 0.1,
                    'UNO': 0.01,
                    'VRC': 0.1,
                    'VTC': 0.1,
                    'XVP': 0.1,
                    'WDC': 0.001,
                    'ZET': 0.1,
                },
            },
        })

    def fetch_markets(self):
        markets = self.publicGetMarkets()
        result = []
        for p in range(0, len(markets['result'])):
            market = markets['result'][p]
            id = market['MarketName']
            base = market['MarketCurrency']
            quote = market['BaseCurrency']
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            symbol = base + '/' + quote
            precision = {
                'amount': 8,
                'price': 8,
            }
            active = market['IsActive']
            result.append(self.extend(self.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'info': market,
                'lot': math.pow(10, -precision['amount']),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': market['MinTradeSize'],
                        'max': None,
                    },
                    'price': {
                        'min': None,
                        'max': None,
                    },
                    'cost': {
                        'min': 0,
                        'max': None,
                    },
                },
            }))
        return result

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        response = self.publicGetOrderbook(self.extend({
            'market': self.market_id(symbol),
            'type': 'ALL',
            'depth': 50,
        }, params))
        orderbook = response['result']
        return self.parse_order_book(orderbook, None, 'buy', 'sell', 'Rate', 'Quantity')
