"use strict";

// ---------------------------------------------------------------------------

const btce = require ('./btce.js')

// ---------------------------------------------------------------------------

module.exports = class yobit extends btce {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'yobit',
            'name': 'YoBit',
            'countries': 'RU',
            'rateLimit': 3000, // responses are cached every 2 seconds
            'version': '3',
            'hasCORS': false,
            'hasWithdraw': true,
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
            }
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
}
