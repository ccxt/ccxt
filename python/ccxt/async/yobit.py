# -*- coding: utf-8 -*-

from ccxt.async.liqui import liqui
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import DDoSProtection


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
            'hasFetchTickers': False,
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

    def currency_id(self, commonCode):
        substitutions = {
            'AirCoin': 'AIR',
            'ANICoin': 'ANI',
            'AntsCoin': 'ANT',
            'Autumncoin': 'ATM',
            'BCH': 'BCC',
            'Bitshares2': 'BTS',
            'Discount': 'DCT',
            'DarkGoldCoin': 'DGD',
            'iCoin': 'ICN',
            'LiZi': 'LIZI',
            'LunarCoin': 'LUN',
            'NavajoCoin': 'NAV',
            'OMGame': 'OMG',
            'EPAY': 'PAY',
            'Republicoin': 'REP',
        }
        if commonCode in substitutions:
            return substitutions[commonCode]
        return commonCode

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

    async def create_deposit_address(self, currency, params={}):
        response = await self.fetch_deposit_address(currency, self.extend({
            'need_new': 1,
        }, params))
        return {
            'currency': currency,
            'address': response['address'],
            'status': 'ok',
            'info': response['info'],
        }

    async def fetch_deposit_address(self, currency, params={}):
        currencyId = self.currency_id(currency)
        request = {
            'coinName': currencyId,
            'need_new': 0,
        }
        response = await self.privatePostGetDepositAddress(self.extend(request, params))
        address = self.safe_string(response['return'], 'address')
        return {
            'currency': currency,
            'address': address,
            'status': 'ok',
            'info': response,
        }

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

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'success' in response:
            if not response['success']:
                if response['error'].find('Insufficient funds') >= 0:  # not enougTh is a typo inside Liqui's own API...
                    raise InsufficientFunds(self.id + ' ' + self.json(response))
                elif response['error'] == 'Requests too often':
                    raise DDoSProtection(self.id + ' ' + self.json(response))
                elif (response['error'] == 'not available') or (response['error'] == 'external service unavailable'):
                    raise DDoSProtection(self.id + ' ' + self.json(response))
                else:
                    raise ExchangeError(self.id + ' ' + self.json(response))
        return response
