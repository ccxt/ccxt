"use strict";

// ---------------------------------------------------------------------------

const liqui = require ('./liqui.js')
const { ExchangeError, InsufficientFunds, DDoSProtection } = require ('./base/errors')

// ---------------------------------------------------------------------------

module.exports = class yobit extends liqui {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'yobit',
            'name': 'YoBit',
            'countries': 'RU',
            'rateLimit': 3000, // responses are cached every 2 seconds
            'version': '3',
            'hasCORS': false,
            'hasWithdraw': true,
            'hasFetchTickers': false,
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
        });
    }

    commonCurrencyCode (currency) {
        let substitutions = {
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
        };
        if (currency in substitutions)
            return substitutions[currency];
        return currency;
    }

    currencyId (commonCode) {
        let substitutions = {
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
        };
        if (commonCode in substitutions)
            return substitutions[commonCode];
        return commonCode;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetInfo ();
        let balances = response['return'];
        let result = { 'info': balances };
        let sides = { 'free': 'funds', 'total': 'funds_incl_orders' };
        let keys = Object.keys (sides);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let side = sides[key];
            if (side in balances) {
                let currencies = Object.keys (balances[side]);
                for (let j = 0; j < currencies.length; j++) {
                    let lowercase = currencies[j];
                    let uppercase = lowercase.toUpperCase ();
                    let currency = this.commonCurrencyCode (uppercase);
                    let account = undefined;
                    if (currency in result) {
                        account = result[currency];
                    } else {
                        account = this.account ();
                    }
                    account[key] = balances[side][lowercase];
                    if (account['total'] && account['free'])
                        account['used'] = account['total'] - account['free'];
                    result[currency] = account;
                }
            }
        }
        return this.parseBalance (result);
    }

    async createDepositAddress (currency, params = {}) {
        let response = await this.fetchDepositAddress (currency, this.extend (
            {'need_new': 1},
            params
        ));
        return {
            'currency': currency,
            'address': response['address'],
            'status': 'ok',
            'info': response['info'],
        };
    }

    async fetchDepositAddress (currency, params = {}) {
        let currencyId = this.currencyId (currency);
        let request = {
            'coinName': currencyId,
            'need_new': 0,
        };
        let response = await this.privatePostGetDepositAddress (this.extend (request, params));
        let address = this.safeString (response['return'], 'address');
        return {
            'currency': currency,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostWithdrawCoinsToAddress (this.extend ({
            'coinName': currency,
            'amount': amount,
            'address': address,
        }, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response) {
            if (!response['success']) {
                if (response['error'].indexOf ('Insufficient funds') >= 0) { // not enougTh is a typo inside Liqui's own API...
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
                } else if (response['error'] == 'Requests too often') {
                    throw new DDoSProtection (this.id + ' ' + this.json (response));
                } else if ((response['error'] == 'not available') || (response['error'] == 'external service unavailable')) {
                    throw new DDoSProtection (this.id + ' ' + this.json (response));
                } else {
                    throw new ExchangeError (this.id + ' ' + this.json (response));
                }
            }
        }
        return response;
    }

}
