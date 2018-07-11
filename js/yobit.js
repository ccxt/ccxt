'use strict';

// ---------------------------------------------------------------------------

const liqui = require ('./liqui.js');
const { ExchangeError, InsufficientFunds, InvalidOrder, DDoSProtection } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class yobit extends liqui {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'yobit',
            'name': 'YoBit',
            'countries': [ 'RU' ],
            'rateLimit': 3000, // responses are cached every 2 seconds
            'version': '3',
            'has': {
                'createDepositAddress': true,
                'fetchDepositAddress': true,
                'CORS': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg',
                'api': {
                    'public': 'https://yobit.net/api',
                    'private': 'https://yobit.net/tapi',
                },
                'www': 'https://www.yobit.net',
                'doc': 'https://www.yobit.net/en/api/',
                'fees': 'https://www.yobit.net/en/fees/',
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
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'AIR': 'AirCoin',
                'ANI': 'ANICoin',
                'ANT': 'AntsCoin',  // what is this, a coin for ants?
                'ATMCHA': 'ATM',
                'ASN': 'Ascension',
                'AST': 'Astral',
                'ATM': 'Autumncoin',
                'BCC': 'BCH',
                'BCS': 'BitcoinStake',
                'BLN': 'Bulleon',
                'BOT': 'BOTcoin',
                'BON': 'BONES',
                'BPC': 'BitcoinPremium',
                'BTS': 'Bitshares2',
                'CAT': 'BitClave',
                'CMT': 'CometCoin',
                'COV': 'Coven Coin',
                'COVX': 'COV',
                'CPC': 'Capricoin',
                'CRC': 'CryCash',
                'CS': 'CryptoSpots',
                'DCT': 'Discount',
                'DGD': 'DarkGoldCoin',
                'DIRT': 'DIRTY',
                'DROP': 'FaucetCoin',
                'EKO': 'EkoCoin',
                'ENTER': 'ENTRC',
                'EPC': 'ExperienceCoin',
                'ERT': 'Eristica Token',
                'ESC': 'EdwardSnowden',
                'EUROPE': 'EUROP',
                'EXT': 'LifeExtension',
                'FUNK': 'FUNKCoin',
                'GCC': 'GlobalCryptocurrency',
                'GEN': 'Genstake',
                'GENE': 'Genesiscoin',
                'GOLD': 'GoldMint',
                'HTML5': 'HTML',
                'HYPERX': 'HYPER',
                'ICN': 'iCoin',
                'INSANE': 'INSN',
                'JNT': 'JointCoin',
                'JPC': 'JupiterCoin',
                'KNC': 'KingN Coin',
                'LBTCX': 'LiteBitcoin',
                'LIZI': 'LiZi',
                'LOC': 'LocoCoin',
                'LOCX': 'LOC',
                'LUNYR': 'LUN',
                'LUN': 'LunarCoin',  // they just change the ticker if it is already taken
                'MDT': 'Midnight',
                'NAV': 'NavajoCoin',
                'NBT': 'NiceBytes',
                'OMG': 'OMGame',
                'PAC': '$PAC',
                'PLAY': 'PlayCoin',
                'PIVX': 'Darknet',
                'PRS': 'PRE',
                'PUTIN': 'PUT',
                'STK': 'StakeCoin',
                'SUB': 'Subscriptio',
                'PAY': 'EPAY',
                'PLC': 'Platin Coin',
                'RCN': 'RCoin',
                'REP': 'Republicoin',
                'RUR': 'RUB',
                'XIN': 'XINCoin',
            },
            'options': {
                'fetchOrdersRequiresSymbol': true,
            },
        });
    }

    parseOrderStatus (status) {
        let statuses = {
            '0': 'open',
            '1': 'closed',
            '2': 'canceled',
            '3': 'open', // or partially-filled and closed? https://github.com/ccxt/ccxt/issues/1594
        };
        if (status in statuses)
            return statuses[status];
        return status;
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
                    if ((typeof account['total'] !== 'undefined') && (typeof account['free'] !== 'undefined'))
                        account['used'] = account['total'] - account['free'];
                    result[currency] = account;
                }
            }
        }
        return this.parseBalance (result);
    }

    async createDepositAddress (code, params = {}) {
        let response = await this.fetchDepositAddress (code, this.extend ({
            'need_new': 1,
        }, params));
        let address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response['info'],
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'coinName': currency['id'],
            'need_new': 0,
        };
        let response = await this.privatePostGetDepositAddress (this.extend (request, params));
        let address = this.safeString (response['return'], 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostWithdrawCoinsToAddress (this.extend ({
            'coinName': currency['id'],
            'amount': amount,
            'address': address,
        }, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (body[0] === '{') {
            let response = JSON.parse (body);
            if ('success' in response) {
                if (!response['success']) {
                    if ('error_log' in response) {
                        if (response['error_log'].indexOf ('Insufficient funds') >= 0) { // not enougTh is a typo inside Liqui's own API...
                            throw new InsufficientFunds (this.id + ' ' + this.json (response));
                        } else if (response['error_log'] === 'Requests too often') {
                            throw new DDoSProtection (this.id + ' ' + this.json (response));
                        } else if ((response['error_log'] === 'not available') || (response['error_log'] === 'external service unavailable')) {
                            throw new DDoSProtection (this.id + ' ' + this.json (response));
                        } else if (response['error_log'] === 'Total transaction amount') {
                            // eg {"success":0,"error":"Total transaction amount is less than minimal total: 0.00010000"}
                            throw new InvalidOrder (this.id + ' ' + this.json (response));
                        }
                    }
                    throw new ExchangeError (this.id + ' ' + this.json (response));
                }
            }
        }
    }
};
