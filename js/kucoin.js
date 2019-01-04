'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, InvalidNonce, InvalidOrder, AuthenticationError, InsufficientFunds, OrderNotFound } = require ('./base/errors');
const { TRUNCATE, ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class kucoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kucoin',
            'name': 'Kucoin',
            'countries': [ 'HK' ], // Hong Kong
            'version': 'v1',
            'rateLimit': 2000,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': false,
                'cancelOrders': true,
                'createMarketOrder': false,
                'fetchDepositAddress': true,
                'fetchTickers': true,
                'fetchOHLCV': true, // see the method implementation below
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': 'emulated', // this method is to be deleted, see implementation and comments below
                'fetchCurrencies': true,
                'withdraw': true,
                'fetchTransactions': true,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
                '8h': 480,
                '1d': 'D',
                '1w': 'W',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/33795655-b3c46e48-dcf6-11e7-8abe-dc4588ba7901.jpg',
                'api': {
                    'public': 'https://api.kucoin.com',
                    'private': 'https://api.kucoin.com',
                    'kitchen': 'https://kitchen.kucoin.com',
                    'kitchen-2': 'https://kitchen-2.kucoin.com',
                },
                'www': 'https://www.kucoin.com',
                'referral': 'https://www.kucoin.com/?r=E5wkqe',
                'doc': 'https://kucoinapidocs.docs.apiary.io',
                'fees': 'https://news.kucoin.com/en/fee',
            },
            'api': {
                'kitchen': {
                    'get': [
                        'open/chart/history',
                    ],
                },
                'public': {
                    'get': [
                        'open/chart/config',
                        'open/chart/history',
                        'open/chart/symbol',
                        'open/currencies',
                        'open/deal-orders',
                        'open/kline',
                        'open/lang-list',
                        'open/orders',
                        'open/orders-buy',
                        'open/orders-sell',
                        'open/tick',
                        'market/open/coin-info',
                        'market/open/coins',
                        'market/open/coins-trending',
                        'market/open/symbols',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'account/{coin}/wallet/address',
                        'account/{coin}/wallet/records',
                        'account/{coin}/balance',
                        'account/promotion/info',
                        'account/promotion/sum',
                        'account/transfer-records',
                        'deal-orders',
                        'order/active',
                        'order/active-map',
                        'order/dealt',
                        'order/detail',
                        'referrer/descendant/count',
                        'user/info',
                    ],
                    'post': [
                        'account/{coin}/withdraw/apply',
                        'account/{coin}/withdraw/cancel',
                        'account/promotion/draw',
                        'cancel-order',
                        'order',
                        'order/cancel-all',
                        'user/change-lang',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.001,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'ABT': 2.0,
                        'ACAT': 10.0,
                        'ACT': 1.0,
                        'ADB': 10.0,
                        'AGI': 40.0,
                        'AION': 3.5,
                        'AIX': 2.0,
                        'AMB': 10.0,
                        'AOA': 20.0,
                        'APH': 3.0,
                        'ARN': 6.0,
                        'ARY': 10.0,
                        'AXP': 25.0,
                        'BAX': 1000.0,
                        'BCD': 1.0,
                        'BCH': 0.0005,
                        'BCPT': 20.0,
                        'BHC': 1.0,
                        'BNTY': 50.0,
                        'BOS': 1.0,
                        'BPT': 5.0,
                        'BRD': 3.0,
                        'BTC': 0.0005,
                        'BTG': 0.01,
                        'BTM': 5.0,
                        'BU': 0.5,
                        'CAG': 2.0,
                        'CAN': 1.0,
                        'CAPP': 20.0,
                        'CAT': 20.0,
                        'CBC': 5.0,
                        'CHP': 25.0,
                        'CHSB': 70.0,
                        'COFI': 5.0,
                        'COSM': 50.0,
                        'COV': 3.0,
                        'CPC': 10.0,
                        'CS': 3.0,
                        'CV': 30.0,
                        'CVC': 12.0,
                        'CXO': 30.0,
                        'DACC': 800.0,
                        'DADI': 6.0,
                        'DAG': 80.0,
                        'DASH': 0.002,
                        'DAT': 20.0,
                        'DATX': 70.0,
                        'DBC': 1.0,
                        'DCC': 60.0,
                        'DCR': 0.01,
                        'DEB': 7.0,
                        'DENT': 700.0,
                        'DGB': 0.5,
                        'DNA': 3.0,
                        'DOCK': 100.0,
                        'DRGN': 1.0,
                        'DTA': 100.0,
                        'EBTC': 3.0,
                        'EDR': 20.0,
                        'EGT': 200.0,
                        'ELA': 0.1,
                        'ELEC': 32.0,
                        'ELF': 4.0,
                        'ELIX': 3.0,
                        'ENJ': 40.0,
                        'EOS': 0.5,
                        'ETC': 0.01,
                        'ETH': 0.01,
                        'ETN': 50.0,
                        'EXY': 3.0,
                        'FLIXX': 10.0,
                        'FOTA': 1.0,
                        'GAS': 0.0,
                        'GAT': 140.0,
                        'GLA': 4.0,
                        'GO': 1.0,
                        'GVT': 0.3,
                        'HAT': 0.5,
                        'HAV': 5.0,
                        'HKN': 0.5,
                        'HPB': 0.5,
                        'HSR': 0.01,
                        'HST': 2.0,
                        'IHT': 20.0,
                        'ING': 3.0,
                        'INS': 5.0,
                        'IOST': 100.0,
                        'IOTX': 150.0,
                        'ITC': 1.0,
                        'J8T': 30.0,
                        'JNT': 5.0,
                        'KCS': 0.5,
                        'KEY': 200.0,
                        'KICK': 35.0,
                        'KNC': 3.5,
                        'LA': 5.0,
                        'LALA': 50.0,
                        'LEND': 130.0,
                        'LOC': 3.0,
                        'LOCI': 4.0,
                        'LOOM': 10.0,
                        'LTC': 0.001,
                        'LYM': 20.0,
                        'MAN': 2.0,
                        'MANA': 15.0,
                        'MOBI': 30.0,
                        'MOD': 2.0,
                        'MTH': 75.0,
                        'MTN': 10.0,
                        'MVP': 100.0,
                        'MWAT': 20.0,
                        'NEBL': 0.1,
                        'NEO': 0.0,
                        'NULS': 1.0,
                        'NUSD': 2.0,
                        'OCN': 100.0,
                        'OLT': 3.0,
                        'OMG': 0.4,
                        'OMX': 50.0,
                        'ONION': 0.1,
                        'ONT': 1.0,
                        'OPEN': 15.0,
                        'PARETO': 40.0,
                        'PAY': 0.5,
                        'PBL': 5.0,
                        'PLAY': 40.0,
                        'POLL': 0.5,
                        'POLY': 10.0,
                        'POWR': 8.0,
                        'PPT': 0.3,
                        'PRL': 1.0,
                        'PURA': 0.5,
                        'QKC': 50.0,
                        'QLC': 1.0,
                        'QSP': 45.0,
                        'QTUM': 0.1,
                        'R': 2.0,
                        'RDN': 5.0,
                        'REQ': 40.0,
                        'RHOC': 2.0,
                        'RPX': 1.0,
                        'SHL': 4.0,
                        'SNC': 10.0,
                        'SNM': 30.0,
                        'SNOV': 20.0,
                        'SNT': 20.0,
                        'SOUL': 4.0,
                        'SPF': 10.0,
                        'SPHTX': 8.0,
                        'SRN': 5.0,
                        'STK': 20.0,
                        'SUB': 12.0,
                        'TEL': 500.0,
                        'TFL': 1.0,
                        'TIME': 0.1,
                        'TIO': 5.0,
                        'TKY': 10.0,
                        'TMT': 50.0,
                        'TNC': 1.0,
                        'TOMO': 1.0,
                        'TRAC': 14.0,
                        'TRX': 1.0,
                        'UKG': 5.0,
                        'USDT': 3.2,
                        'USE': 900.0,
                        'UT': 0.1,
                        'UTK': 10.0,
                        'VEN': 2.0,
                        'WAN': 0.7,
                        'WAX': 8.0,
                        'WPR': 80.0,
                        'WTC': 0.5,
                        'XAS': 0.5,
                        'XLM': 0.01,
                        'XLR': 0.1,
                        'XRB': 0.05,
                        'ZIL': 50.0,
                        'ZINC': 30.0,
                        'ZPT': 1.0,
                        'ZRX': 2.0,
                        'ePRX': 1000,
                    },
                    'deposit': {},
                },
            },
            // exchange-specific options
            'options': {
                'fetchOrderBookWarning': true, // raises a warning on null response in fetchOrderBook
                'timeDifference': 0, // the difference between system clock and Kucoin clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'limits': {
                    'amount': {
                        'min': {
                            'ABT': 1,
                            'ACAT': 1,
                            'ACT': 1,
                            'ADB': 1,
                            'AGI': 10,
                            'AION': 1,
                            'AIX': 1,
                            'AMB': 1,
                            'AOA': 1,
                            'APH': 1,
                            'ARN': 1,
                            'ARY': 1,
                            'AXPR': 1,
                            'BAX': 1,
                            'BCD': 0.001,
                            'BCH': 0.00001,
                            'BCPT': 1,
                            'BNTY': 1,
                            'BOS': 1,
                            'BPT': 1,
                            'BRD': 1,
                            'BTC': 0.00001,
                            'BTG': 0.001,
                            'BTM': 1,
                            'CAG': 1,
                            'CanYaCoin': 1,
                            'CAPP': 1,
                            'CAT': 1,
                            'CBC': 1,
                            'CHP': 1,
                            'CHSB': 1,
                            'COFI': 1,
                            'COV': 1,
                            'CPC': 1,
                            'CS': 1,
                            'CV': 10,
                            'CVC': 0.1,
                            'CXO': 1,
                            'DACC': 1,
                            'DADI': 1,
                            'DAG': 1,
                            'DASH': 0.01,
                            'DAT': 1,
                            'DATX': 1,
                            'DBC': 1,
                            'DCC': 1,
                            'DEB': 1,
                            'DENT': 1,
                            'DGB': 1,
                            'DNA': 1,
                            'DOCK': 1,
                            'DRGN': 1,
                            'DTA': 1,
                            'EBTC': 1,
                            'EDR': 1,
                            'EGT': 1,
                            'ELA': 1,
                            'ELEC': 1,
                            'ELF': 1,
                            'ELIX': 1,
                            'ENJ': 1,
                            'EOS': 0.1,
                            'ETC': 0.1,
                            'ETH': 0.00001,
                            'ETN': 1,
                            'EXY': 1,
                            'FLIXX': 0.1,
                            'FOTA': 1,
                            'GAS': 0.1,
                            'GAT': 1,
                            'GLA': 1,
                            'GO': 1,
                            'GVT': 0.1,
                            'HAV': 1,
                            'HKN': 1,
                            'HPB': 1,
                            'HSR': 0.0001,
                            'HST': 0.1,
                            'IHT': 1,
                            'ING': 1,
                            'INS': 1,
                            'IOST': 1,
                            'IOTX': 1,
                            'ITC': 1,
                            'J8T': 1,
                            'JNT': 1,
                            'KCS': 1,
                            'KEY': 1,
                            'KICK': 1,
                            'KNC': 0.001,
                            'LA': 1,
                            'LALA': 1,
                            'LEND': 1,
                            'LOCI': 1,
                            'LOOM': 1,
                            'LTC': 1,
                            'LYM': 1,
                            'MAN': 1,
                            'MANA': 1,
                            'MOBI': 1,
                            'MOD': 0.1,
                            'MTH': 1,
                            'MTN': 1,
                            'MWAT': 1,
                            'NANO': 0.1,
                            'NEBL': 0.1,
                            'NEO': 0.01,
                            'NULS': 0.1,
                            'NUSD': 1,
                            'OCN': 10,
                            'OLT': 1,
                            'OMG': 0.1,
                            'OMX': 1,
                            'ONION': 1,
                            'ONT': 1,
                            'OPEN': 1,
                            'PARETO': 1,
                            'PAY': 0.1,
                            'PBL': 1,
                            'PHX': 1,
                            'PLAY': 1,
                            'POLL': 1,
                            'POLY': 1,
                            'POWR': 0.1,
                            'PPT': 0.1,
                            'PRL': 1,
                            'PURA': 0.1,
                            'QKC': 1,
                            'QLC': 1,
                            'QSP': 0.1,
                            'QTUM': 0.1,
                            'R': 1,
                            'RDN': 1,
                            'REQ': 1,
                            'RHOC': 1,
                            'RPX': 1,
                            'SHL': 1,
                            'SNC': 1,
                            'SNM': 1,
                            'SNOV': 1,
                            'SNT': 0.1,
                            'SOUL': 1,
                            'SPF': 1,
                            'SPHTX': 1,
                            'SRN': 1,
                            'STK': 1,
                            'SUB': 0.1,
                            'TEL': 10,
                            'TFD': 1,
                            'TFL': 1,
                            'TIME': 1,
                            'TIO': 1,
                            'TKY': 1,
                            'TMT': 1,
                            'TNC': 1,
                            'TOMO': 1,
                            'TRAC': 1,
                            'UKG': 1,
                            'UTK': 1,
                            'WAN': 1,
                            'WAX': 1,
                            'WPR': 1,
                            'WTC': 0.1,
                            'XAS': 0.1,
                            'XLM': 1,
                            'XLR': 1,
                            'ZIL': 1,
                            'ZINC': 1,
                            'ZPT': 1,
                        },
                    },
                },
            },
            'commonCurrencies': {
                'CAN': 'CanYaCoin',
                'XRB': 'NANO',
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadTimeDifference () {
        const response = await this.publicGetOpenTick ();
        const after = this.milliseconds ();
        this.options['timeDifference'] = parseInt (after - response['timestamp']);
        return this.options['timeDifference'];
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetMarketOpenSymbols ();
        if (this.options['adjustForTimeDifference'])
            await this.loadTimeDifference ();
        let markets = response['data'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['symbol'];
            let baseId = market['coinType'];
            let quoteId = market['coinTypePair'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let defaultMinAmount = Math.pow (10, -precision['amount']);
            let minAmount = this.safeFloat (this.options['limits']['amount']['min'], base, defaultMinAmount);
            let active = market['trading'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'taker': this.safeFloat (market, 'feeRate'),
                'maker': this.safeFloat (market, 'feeRate'),
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privateGetAccountCoinWalletAddress (this.extend ({
            'coin': currency['id'],
        }, params));
        let data = response['data'];
        let address = this.safeString (data, 'address');
        this.checkAddress (address);
        let tag = this.safeString (data, 'userOid');
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        // https://kucoinapidocs.docs.apiary.io/#reference/0/assets-operation/list-deposit-&-withdrawal-records
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.privateGetAccountCoinWalletRecords (this.extend (request, params));
        return this.parseTransactions (response['data']['datas'], currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         'coinType': 'ETH',
        //         'createdAt': 1516134636000,
        //         'amount': 2.5,
        //         'address': '0x4cd00e7983e54add886442d3b866f95243cf9b30',
        //         'fee': 0.0,
        //         'outerWalletTxid': '0x820cde65b1fab0a9527a5c2466b3e7807fee45c6a81691486bf954114b12c873@0x4cd00e7983e54add886442d3b866f95243cf9b30@eth',
        //         'remark': None,
        //         'oid': '5a5e60ecaf2c5807eda65443',
        //         'confirmation': 14,
        //         'type': 'DEPOSIT',
        //         'status': 'SUCCESS',
        //         'updatedAt': 1516134827000
        //     }
        //
        //     {
        //         'coinType':'POLY',
        //         'createdAt':1520696078000,
        //         'amount':838.2247,
        //         'address':'0x54fc433e95549e68fa362eb85c235177d94a8745',
        //         'fee':3.0,
        //         'outerWalletTxid':'0x055da84b7557498785d6acecf2b71d0158fec32fce246e51f5c49b79826a8481',
        //         'remark':None,
        //         'oid':'5aa3fb0d7bd394763bde55c1',
        //         'confirmation':0,
        //         'type':'WITHDRAW',
        //         'status':'SUCCESS',
        //         'updatedAt':1520696196000
        //     }
        //
        const id = this.safeString (transaction, 'oid');
        let txid = this.safeString (transaction, 'outerWalletTxid');
        if (txid !== undefined) {
            if (txid.indexOf ('@') >= 0) {
                const parts = txid.split ('@');
                txid = parts[0];
            }
        }
        const timestamp = this.safeInteger (transaction, 'createdAt');
        let code = undefined;
        const currencyId = this.safeString (transaction, 'coinType');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'remark');
        const amount = this.safeFloat (transaction, 'amount');
        const status = this.safeString (transaction, 'status');
        let type = this.safeString (transaction, 'type');
        if (type !== undefined) {
            // they return 'DEPOSIT' or 'WITHDRAW', ccxt used 'deposit' or 'withdrawal'
            type = (type === 'DEPOSIT') ? 'deposit' : 'withdrawal';
        }
        const feeCost = this.safeFloat (transaction, 'fee');
        const updated = this.safeInteger (transaction, 'updatedAt');
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': tag,
            'status': status,
            'type': type,
            'updated': updated,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetMarketOpenCoins (params);
        let currencies = response['data'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['coin'];
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            let code = this.commonCurrencyCode (id);
            let precision = currency['tradePrecision'];
            let deposit = currency['enableDeposit'];
            let withdraw = currency['enableWithdraw'];
            let active = (deposit && withdraw);
            let defaultMinAmount = Math.pow (10, -precision);
            let minAmount = this.safeFloat (this.options['limits']['amount']['min'], code, defaultMinAmount);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'fee': currency['withdrawMinFee'], // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': currency['withdrawMinAmount'],
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetAccountBalance (this.extend ({
        }, params));
        let balances = response['data'];
        let result = { 'info': balances };
        let indexed = this.indexBy (balances, 'coinType');
        let keys = Object.keys (indexed);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let balance = indexed[id];
            let used = parseFloat (balance['freezeBalance']);
            let free = parseFloat (balance['balance']);
            let total = this.sum (free, used);
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.publicGetOpenOrders (this.extend (request, params));
        let orderbook = undefined;
        let timestamp = undefined;
        // sometimes kucoin returns this:
        // {"success":true,"code":"OK","msg":"Operation succeeded.","timestamp":xxxxxxxxxxxxx,"data":null}
        if (!('data' in response) || !response['data']) {
            if (this.options['fetchOrderBookWarning'])
                throw new ExchangeError (this.id + " fetchOrderBook returned an null reply. Set exchange.options['fetchOrderBookWarning'] = false to silence this warning");
            orderbook = {
                'BUY': [],
                'SELL': [],
            };
        } else {
            orderbook = response['data'];
            timestamp = this.safeInteger (response, 'timestamp');
            timestamp = this.safeInteger (response['data'], 'timestamp', timestamp);
        }
        return this.parseOrderBook (orderbook, timestamp, 'BUY', 'SELL');
    }

    parseOrder (order, market = undefined) {
        let side = this.safeValue (order, 'direction');
        if (side === undefined)
            side = order['type'];
        if (side !== undefined)
            side = side.toLowerCase ();
        let orderId = this.safeString2 (order, 'orderOid', 'oid');
        // do not confuse trades with orders
        let trades = undefined;
        if ('dealOrders' in order)
            trades = this.safeValue (order['dealOrders'], 'datas');
        if (trades !== undefined) {
            trades = this.parseTrades (trades, market);
            for (let i = 0; i < trades.length; i++) {
                trades[i]['side'] = side;
                trades[i]['order'] = orderId;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            symbol = order['coinType'] + '/' + order['coinTypePair'];
        }
        let timestamp = this.safeValue (order, 'createdAt');
        let remaining = this.safeFloat (order, 'pendingAmount');
        let status = undefined;
        if ('status' in order) {
            status = order['status'];
        } else {
            if (this.safeValue (order, 'isActive', true)) {
                status = 'open';
            } else {
                status = 'closed';
            }
        }
        let filled = this.safeFloat (order, 'dealAmount');
        let amount = this.safeFloat (order, 'amount');
        let cost = this.safeFloat (order, 'dealValue');
        if (cost === undefined)
            cost = this.safeFloat (order, 'dealValueTotal');
        if (status === undefined) {
            if (remaining !== undefined)
                if (remaining > 0)
                    status = 'open';
                else
                    status = 'closed';
        }
        if (filled === undefined) {
            if (status !== undefined)
                if (status === 'closed')
                    filled = this.safeFloat (order, 'amount');
        } else if (filled === 0.0) {
            if (trades !== undefined) {
                cost = 0;
                for (let i = 0; i < trades.length; i++) {
                    filled += trades[i]['amount'];
                    cost += trades[i]['cost'];
                }
            }
        }
        // kucoin price and amount fields have varying names
        // thus the convoluted spaghetti code below
        let price = undefined;
        if (filled !== undefined) {
            // if the order was filled at least for some part
            if (filled > 0.0) {
                price = this.safeFloat (order, 'price');
                if (price === undefined)
                    price = this.safeFloat (order, 'dealPrice');
                if (price === undefined)
                    price = this.safeFloat (order, 'dealPriceAverage');
            } else {
                // it's an open order, not filled yet, use the initial price
                price = this.safeFloat (order, 'orderPrice');
                if (price === undefined)
                    price = this.safeFloat (order, 'price');
            }
            if (price !== undefined) {
                if (cost === undefined)
                    cost = price * filled;
            }
            if (amount === undefined) {
                if (remaining !== undefined)
                    amount = this.sum (filled, remaining);
            } else if (remaining === undefined) {
                remaining = amount - filled;
            }
        }
        if (status === 'open') {
            if ((cost === undefined) || (cost === 0.0))
                if (price !== undefined)
                    if (amount !== undefined)
                        cost = amount * price;
        }
        let feeCurrency = undefined;
        if (market !== undefined) {
            feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
        } else {
            let feeCurrencyField = (side === 'sell') ? 'coinTypePair' : 'coinType';
            let feeCurrency = this.safeString (order, feeCurrencyField);
            if (feeCurrency !== undefined) {
                if (feeCurrency in this.currencies_by_id)
                    feeCurrency = this.currencies_by_id[feeCurrency]['code'];
            }
        }
        let feeCost = this.safeFloat (order, 'fee');
        let fee = {
            'cost': this.safeFloat (order, 'feeTotal', feeCost),
            'rate': this.safeFloat (order, 'feeRate'),
            'currency': feeCurrency,
        };
        let result = {
            'info': order,
            'id': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        let orderType = this.safeValue (params, 'type');
        if (orderType === undefined)
            throw new ExchangeError (this.id + ' fetchOrder requires a type parameter ("BUY" or "SELL")');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'type': orderType,
            'orderOid': id,
        };
        let response = await this.privateGetOrderDetail (this.extend (request, params));
        if (!response['data'])
            throw new OrderNotFound (this.id + ' ' + this.json (response));
        //
        // the caching part to be removed
        //
        //     let order = this.parseOrder (response['data'], market);
        //     let orderId = order['id'];
        //     if (orderId in this.orders)
        //         order['status'] = this.orders[orderId]['status'];
        //     this.orders[orderId] = order;
        //
        return this.parseOrder (response['data'], market);
    }

    parseOrdersByStatus (orders, market, since, limit, status) {
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            let order = this.parseOrder (this.extend (orders[i], {
                'status': status,
            }), market);
            result.push (order);
        }
        let symbol = (market !== undefined) ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = undefined;
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            marketId = market['id'];
        } else {
            marketId = '';
        }
        let request = {
            'symbol': marketId,
        };
        let response = await this.privateGetOrderActiveMap (this.extend (request, params));
        let sell = this.safeValue (response['data'], 'SELL');
        if (sell === undefined)
            sell = [];
        let buy = this.safeValue (response['data'], 'BUY');
        if (buy === undefined)
            buy = [];
        let orders = this.arrayConcat (sell, buy);
        //
        // the caching part to be removed
        //
        //     for (let i = 0; i < orders.length; i++) {
        //         let order = this.parseOrder (this.extend (orders[i], {
        //             'status': 'open',
        //         }), market);
        //         let orderId = order['id'];
        //         if (orderId in this.orders)
        //             if (this.orders[orderId]['status'] !== 'open')
        //                 order['status'] = this.orders[orderId]['status'];
        //         this.orders[order['id']] = order;
        //     }
        //     let openOrders = this.filterBy (this.orders, 'status', 'open');
        //     return this.filterBySymbolSinceLimit (openOrders, symbol, since, limit);
        //
        return this.parseOrdersByStatus (orders, market, since, limit, 'open');
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 20, params = {}) {
        let request = {};
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined)
            request['since'] = since;
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetOrderDealt (this.extend (request, params));
        let orders = response['data']['datas'];
        //
        // the caching part to be removed
        //
        //     for (let i = 0; i < orders.length; i++) {
        //         let order = this.parseOrder (this.extend (orders[i], {
        //             'status': 'closed',
        //         }), market);
        //         let orderId = order['id'];
        //         if (orderId in this.orders)
        //             if (this.orders[orderId]['status'] === 'canceled')
        //                 order['status'] = this.orders[orderId]['status'];
        //         this.orders[order['id']] = order;
        //     }
        //     let closedOrders = this.filterBy (this.orders, 'status', 'closed');
        //     return this.filterBySymbolSinceLimit (closedOrders, symbol, since, limit);
        //
        return this.parseOrdersByStatus (orders, market, since, limit, 'closed');
    }

    priceToPrecision (symbol, price) {
        const market = this.market (symbol);
        const code = market['quote'];
        return this.decimalToPrecision (price, ROUND, this.currencies[code]['precision'], this.precisionMode);
    }

    amountToPrecision (symbol, amount) {
        const market = this.market (symbol);
        const code = market['base'];
        return this.decimalToPrecision (amount, TRUNCATE, this.currencies[code]['precision'], this.precisionMode);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'type': side.toUpperCase (),
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
        };
        price = parseFloat (price);
        amount = parseFloat (amount);
        let cost = price * amount;
        let response = await this.privatePostOrder (this.extend (request, params));
        let orderId = this.safeString (response['data'], 'orderOid');
        let timestamp = this.safeInteger (response, 'timestamp');
        let order = {
            'info': response,
            'id': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'price': price,
            'cost': cost,
            'status': 'open',
            'fee': undefined,
            'trades': undefined,
        };
        this.orders[orderId] = order;
        return order;
    }

    async cancelOrders (symbol = undefined, params = {}) {
        // https://kucoinapidocs.docs.apiary.io/#reference/0/trading/cancel-all-orders
        // docs say symbol is required, but it seems to be optional
        // you can cancel all orders, or filter by symbol or type or both
        let request = {};
        if (symbol !== undefined) {
            await this.loadMarkets ();
            let market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if ('type' in params) {
            request['type'] = params['type'].toUpperCase ();
            params = this.omit (params, 'type');
        }
        //
        // the caching part to be removed
        //
        //     let response = await this.privatePostOrderCancelAll (this.extend (request, params));
        //     let openOrders = this.filterBy (this.orders, 'status', 'open');
        //     for (let i = 0; i < openOrders.length; i++) {
        //         let order = openOrders[i];
        //         let orderId = order['id'];
        //         this.orders[orderId]['status'] = 'canceled';
        //     }
        //     return response;
        //
        return await this.privatePostOrderCancelAll (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'orderOid': id,
        };
        if ('type' in params) {
            request['type'] = params['type'].toUpperCase ();
            params = this.omit (params, 'type');
        } else {
            throw new ExchangeError (this.id + ' cancelOrder requires parameter type=["BUY"|"SELL"]');
        }
        //
        // the caching part to be removed
        //
        //     let response = await this.privatePostCancelOrder (this.extend (request, params));
        //     if (id in this.orders) {
        //         this.orders[id]['status'] = 'canceled';
        //     } else {
        //         // store it in cache for further references
        //         let timestamp = this.milliseconds ();
        //         let side = request['type'].toLowerCase ();
        //         this.orders[id] = {
        //             'id': id,
        //             'timestamp': timestamp,
        //             'datetime': this.iso8601 (timestamp),
        //             'type': undefined,
        //             'side': side,
        //             'symbol': symbol,
        //             'status': 'canceled',
        //         };
        //     }
        //     return response;
        //
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['datetime'];
        let symbol = undefined;
        if (market === undefined) {
            let marketId = ticker['coinType'] + '-' + ticker['coinTypePair'];
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        // TNC coin doesn't have changerate for some reason
        let change = this.safeFloat (ticker, 'change');
        let last = this.safeFloat (ticker, 'lastDealPrice');
        let open = undefined;
        if (last !== undefined)
            if (change !== undefined)
                open = last - change;
        let changePercentage = this.safeFloat (ticker, 'changeRate');
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': changePercentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': this.safeFloat (ticker, 'volValue'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketOpenSymbols (params);
        let tickers = response['data'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = this.parseTicker (tickers[t]);
            let symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetOpenTick (this.extend ({
            'symbol': market['id'],
        }, params));
        let ticker = response['data'];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let id = undefined;
        let order = undefined;
        let info = trade;
        let timestamp = undefined;
        let type = undefined;
        let side = undefined;
        let price = undefined;
        let cost = undefined;
        let amount = undefined;
        let fee = undefined;
        if (Array.isArray (trade)) {
            timestamp = trade[0];
            type = 'limit';
            if (trade[1] === 'BUY') {
                side = 'buy';
            } else if (trade[1] === 'SELL') {
                side = 'sell';
            }
            price = this.safeFloat (trade, 2);
            amount = this.safeFloat (trade, 3);
            id = trade[5];
        } else {
            timestamp = this.safeValue (trade, 'createdAt');
            order = this.safeString (trade, 'orderOid');
            id = this.safeString (trade, 'oid');
            side = this.safeString (trade, 'direction');
            if (side !== undefined)
                side = side.toLowerCase ();
            price = this.safeFloat (trade, 'dealPrice');
            amount = this.safeFloat (trade, 'amount');
            cost = this.safeFloat (trade, 'dealValue');
            let feeCurrency = undefined;
            if (side !== undefined) {
                if (market !== undefined) {
                    feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
                } else {
                    let feeCurrencyField = (side === 'sell') ? 'coinTypePair' : 'coinType';
                    let feeCurrency = this.safeString (order, feeCurrencyField);
                    if (feeCurrency !== undefined) {
                        if (feeCurrency in this.currencies_by_id)
                            feeCurrency = this.currencies_by_id[feeCurrency]['code'];
                    }
                }
            }
            fee = {
                'rate': this.safeFloat (trade, 'feeRate'),
                'cost': this.safeFloat (trade, 'fee'),
                'currency': feeCurrency,
            };
        }
        let symbol = undefined;
        if (market !== undefined)
            symbol = market['symbol'];
        return {
            'id': id,
            'order': order,
            'info': info,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100; // default to 100 even if it was explicitly set to undefined by the user
        }
        let market = this.market (symbol);
        let response = await this.publicGetOpenDealOrders (this.extend ({
            'symbol': market['id'],
            'limit': limit,
        }, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // todo: this method is deprecated and to be deleted shortly
        // it improperly mimics fetchMyTrades with closed orders
        // kucoin does not have any means of fetching personal trades at all
        // this will effectively simplify current convoluted implementations of parseOrder and parseTrade
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchMyTrades is deprecated and requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetDealOrders (this.extend (request, params));
        return this.parseTrades (response['data']['datas'], market, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let end = this.seconds ();
        let resolution = this.timeframes[timeframe];
        // convert 'resolution' to minutes in order to calculate 'from' later
        let minutes = resolution;
        if (minutes === 'D') {
            if (limit === undefined)
                limit = 30; // 30 days, 1 month
            minutes = 1440;
        } else if (minutes === 'W') {
            if (limit === undefined)
                limit = 52; // 52 weeks, 1 year
            minutes = 10080;
        } else if (limit === undefined) {
            // last 1440 periods, whatever the duration of the period is
            // for 1m it equals 1 day (24 hours)
            // for 5m it equals 5 days
            // ...
            limit = 1440;
        }
        let start = end - limit * minutes * 60;
        // if 'since' has been supplied by user
        if (since !== undefined) {
            start = parseInt (since / 1000); // convert milliseconds to seconds
            end = Math.min (end, this.sum (start, limit * minutes * 60));
        }
        let request = {
            'symbol': market['id'],
            'resolution': resolution,
            'from': start,
            'to': end,
        };
        let response = await this.publicGetOpenChartHistory (this.extend (request, params));
        return this.parseTradingViewOHLCV (response, market, timeframe, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        this.checkAddress (address);
        const request = {
            'coin': currency['id'],
            'amount': amount,
            'address': address,
        };
        // they don't have the tag properly documented for currencies that require it (XLM, XRP, ...)
        // https://www.reddit.com/r/kucoin/comments/93o92b/withdraw_of_xlm_through_api/
        if (tag !== undefined) {
            request['address'] += '@' + tag;
        }
        let response = await this.privatePostAccountCoinWithdrawApply (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            // their nonce is always a calibrated synched milliseconds-timestamp
            let nonce = this.nonce ();
            let queryString = '';
            nonce = nonce.toString ();
            if (Object.keys (query).length) {
                queryString = this.rawencode (this.keysort (query));
                url += '?' + queryString;
                if (method !== 'GET') {
                    body = queryString;
                }
            }
            let auth = endpoint + '/' + nonce + '/' + queryString;
            let payload = this.stringToBase64 (this.encode (auth));
            // payload should be "encoded" as returned from stringToBase64
            let signature = this.hmac (payload, this.encode (this.secret), 'sha256');
            headers = {
                'KC-API-KEY': this.apiKey,
                'KC-API-NONCE': nonce,
                'KC-API-SIGNATURE': signature,
            };
        } else {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    throwExceptionOnError (response) {
        //
        // API endpoints return the following formats
        //     { success: false, code: "ERROR", msg: "Min price:100.0" }
        //     { success: true,  code: "OK",    msg: "Operation succeeded." }
        //
        // Web OHLCV endpoint returns this:
        //     { s: "ok", o: [], h: [], l: [], c: [], v: [] }
        //
        // This particular method handles API responses only
        //
        if (!('success' in response))
            return;
        if (response['success'] === true)
            return; // not an error
        if (!('code' in response) || !('msg' in response))
            throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        const feedback = this.id + ' ' + this.json (response);
        if (code === 'UNAUTH') {
            if (message === 'Invalid nonce')
                throw new InvalidNonce (feedback);
            throw new AuthenticationError (feedback);
        } else if (code === 'ERROR') {
            if (message.indexOf ('The precision of amount') >= 0)
                throw new InvalidOrder (feedback); // amount violates precision.amount
            if (message.indexOf ('Min amount each order') >= 0)
                throw new InvalidOrder (feedback); // amount < limits.amount.min
            if (message.indexOf ('Min price:') >= 0)
                throw new InvalidOrder (feedback); // price < limits.price.min
            if (message.indexOf ('Max price:') >= 0)
                throw new InvalidOrder (feedback); // price > limits.price.max
            if (message.indexOf ('The precision of price') >= 0)
                throw new InvalidOrder (feedback); // price violates precision.price
        } else if (code === 'NO_BALANCE') {
            if (message.indexOf ('Insufficient balance') >= 0)
                throw new InsufficientFunds (feedback);
        }
        throw new ExchangeError (this.id + ': unknown response: ' + this.json (response));
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response !== undefined) {
            // JS callchain parses body beforehand
            this.throwExceptionOnError (response);
        } else if (body && (body[0] === '{')) {
            // Python/PHP callchains don't have json available at this step
            this.throwExceptionOnError (JSON.parse (body));
        }
    }
};
