# -*- coding: utf-8 -*-

from ccxt.liqui import liqui


class yobit (liqui):

    def describe(self):
        return self.deep_extend(super(yobit, self).describe(), {
            'id': 'yobit',
            'name': 'YoBit',
            'countries': 'RU',
            'rateLimit': 3000,  # responses are cached every 2 seconds
            'version': '3',
            'hasCORS': False,
            'hasWithdraw': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg',
                'api': {
                    'public': 'https://yobit.net/api',
                    'private': 'https://yobit.net/tapi',
                },
                'www': 'https://www.yobit.net',
                'doc': 'https://www.yobit.net/en/api/',
            },
            'api': {
                'public': {
                    'get': [
                        'depth/{pair}',
                        'info',
                        'ticker/{pair}',
                        'trades/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'ActiveOrders',
                        'CancelOrder',
                        'GetDepositAddress',
                        'getInfo',
                        'OrderInfo',
                        'Trade',
                        'TradeHistory',
                        'WithdrawCoinsToAddress',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.002,
                    'taker': 0.002,
                },
                'funding': 0.0,
            },
        })

    def common_currency_code(self, currency):
        substitutions = {
            'AIR': 'AirCoin',
            'ANI': 'ANICoin',
            'ANT': 'AntsCoin',
            'ATM': 'Autumncoin',
            'BCC': 'BCH',
            'BTS': 'Bitshares2',
            'DCT': 'Discount',
            'DGD': 'DarkGoldCoin',
            'ICN': 'iCoin',
            'LIZI': 'LiZi',
            'LUN': 'LunarCoin',
            'NAV': 'NavajoCoin',
            'OMG': 'OMGame',
            'PAY': 'EPAY',
            'REP': 'Republicoin',
        }
        if currency in substitutions:
            return substitutions[currency]
        return currency

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privatePostGetInfo()
        balances = response['return']
        result = {'info': balances}
        sides = {'free': 'funds', 'total': 'funds_incl_orders'}
        keys = list(sides.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            side = sides[key]
            if side in balances:
                currencies = list(balances[side].keys())
                for j in range(0, len(currencies)):
                    lowercase = currencies[j]
                    uppercase = lowercase.upper()
                    currency = self.common_currency_code(uppercase)
                    account = None
                    if currency in result:
                        account = result[currency]
                    else:
                        account = self.account()
                    account[key] = balances[side][lowercase]
                    if account['total'] and account['free']:
                        account['used'] = account['total'] - account['free']
                    result[currency] = account
        return self.parse_balance(result)

    async def withdraw(self, currency, amount, address, params={}):
        await self.load_markets()
        response = await self.privatePostWithdrawCoinsToAddress(self.extend({
            'coinName': currency,
            'amount': amount,
            'address': address,
        }, params))
        return {
            'info': response,
            'id': None,
        }
