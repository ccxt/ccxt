"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InsufficientFunds, OrderNotFound } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class binance extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binance',
            'name': 'Binance',
            'countries': 'CN', // China
            'rateLimit': 1000,
            'version': 'v1',
            'hasCORS': false,
            // obsolete metainfo interface
            'hasFetchOHLCV': true,
            'hasFetchMyTrades': true,
            'hasFetchOrder': true,
            'hasFetchOrders': true,
            'hasFetchOpenOrders': true,
            'hasWithdraw': true,
            // new metainfo interface
            'has': {
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'web': 'https://www.binance.com',
                    'wapi': 'https://www.binance.com/wapi',
                    'public': 'https://www.binance.com/api',
                    'private': 'https://www.binance.com/api',
                },
                'www': 'https://www.binance.com',
                'doc': 'https://www.binance.com/restapipub.html',
                'fees': 'https://binance.zendesk.com/hc/en-us/articles/115000429332',
            },
            'api': {
                'web': {
                    'get': [
                        'exchange/public/product',
                    ],
                },
                'wapi': {
                    'post': [
                        'withdraw',
                        'getDepositHistory',
                        'getWithdrawHistory',
                    ],
                },
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'depth',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/allPrices',
                        'ticker/allBookTickers',
                    ],
                },
                'private': {
                    'get': [
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades',
                    ],
                    'post': [
                        'order',
                        'order/test',
                        'userDataStream',
                    ],
                    'put': [
                        'userDataStream'
                    ],
                    'delete': [
                        'order',
                        'userDataStream',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.001,
                    'maker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BNB': 1.0,
                        'BTC': 0.0005,
                        'ETH': 0.005,
                        'LTC': 0.001,
                        'NEO': 0.0,
                        'QTUM': 0.01,
                        'SNT': 50.0,
                        'BNT': 0.6,
                        'EOS': 2.0,
                        'BCH': 0.0005,
                        'GAS': 0.0,
                        'USDT': 5.0,
                        'OAX': 2.0,
                        'DNT': 30.0,
                        'MCO': 0.15,
                        'ICN': 0.5,
                        'WTC': 0.2,
                        'OMG': 0.1,
                        'ZRX': 5.0,
                        'STRAT': 0.1,
                        'SNGLS': 8.0,
                        'BQX': 2.0,
                        'KNC': 1.0,
                        'FUN': 50.0,
                        'SNM': 10.0,
                        'LINK': 5.0,
                        'XVG': 0.1,
                        'CTR': 1.0,
                        'SALT': 0.3,
                        'IOTA': 0.0,
                        'MDA': 0.5,
                        'MTL': 0.15,
                        'SUB': 10.0,
                        'ETC': 0.01,
                        'MTH': 10.0,
                        'ENG': 2.0,
                        'AST': 4.0,
                        'BTG': undefined,
                        'DASH': 0.002,
                        'EVX': 1.0,
                        'REQ': 30.0,
                        'LRC': 7.0,
                        'VIB': 7.0,
                        'HSR': 0.0001,
                        'TRX': 500.0,
                        'POWR': 15.0,
                        'ARK': 0.1,
                        'YOYO': 30.0,
                        'XRP': 0.15,
                        'MOD': 1.0,
                        'ENJ': 1.0,
                        'STORJ': 2.0,
                    },
                },
            },
            'precision': {
                'amount': 6,
                'price': 6,
            },
            'markets': {
                'ETH/BTC': { 'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'lot': 0.001, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'LTC/BTC': { 'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'BNB/BTC': { 'id': 'BNBBTC', 'symbol': 'BNB/BTC', 'base': 'BNB', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'NEO/BTC': { 'id': 'NEOBTC', 'symbol': 'NEO/BTC', 'base': 'NEO', 'quote': 'BTC', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'GAS/BTC': { 'id': 'GASBTC', 'symbol': 'GAS/BTC', 'base': 'GAS', 'quote': 'BTC', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'BCH/BTC': { 'id': 'BCCBTC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'lot': 0.001, 'limits': { 'amount': { 'min': 0.001, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'MCO/BTC': { 'id': 'MCOBTC', 'symbol': 'MCO/BTC', 'base': 'MCO', 'quote': 'BTC', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'WTC/BTC': { 'id': 'WTCBTC', 'symbol': 'WTC/BTC', 'base': 'WTC', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'OMG/BTC': { 'id': 'OMGBTC', 'symbol': 'OMG/BTC', 'base': 'OMG', 'quote': 'BTC', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'ZRX/BTC': { 'id': 'ZRXBTC', 'symbol': 'ZRX/BTC', 'base': 'ZRX', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'BQX/BTC': { 'id': 'BQXBTC', 'symbol': 'BQX/BTC', 'base': 'BQX', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'KNC/BTC': { 'id': 'KNCBTC', 'symbol': 'KNC/BTC', 'base': 'KNC', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'FUN/BTC': { 'id': 'FUNBTC', 'symbol': 'FUN/BTC', 'base': 'FUN', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'SNM/BTC': { 'id': 'SNMBTC', 'symbol': 'SNM/BTC', 'base': 'SNM', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'XVG/BTC': { 'id': 'XVGBTC', 'symbol': 'XVG/BTC', 'base': 'XVG', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'CTR/BTC': { 'id': 'CTRBTC', 'symbol': 'CTR/BTC', 'base': 'CTR', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'BNB/ETH': { 'id': 'BNBETH', 'symbol': 'BNB/ETH', 'base': 'BNB', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'SNT/ETH': { 'id': 'SNTETH', 'symbol': 'SNT/ETH', 'base': 'SNT', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'BNT/ETH': { 'id': 'BNTETH', 'symbol': 'BNT/ETH', 'base': 'BNT', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'EOS/ETH': { 'id': 'EOSETH', 'symbol': 'EOS/ETH', 'base': 'EOS', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'OAX/ETH': { 'id': 'OAXETH', 'symbol': 'OAX/ETH', 'base': 'OAX', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'DNT/ETH': { 'id': 'DNTETH', 'symbol': 'DNT/ETH', 'base': 'DNT', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'MCO/ETH': { 'id': 'MCOETH', 'symbol': 'MCO/ETH', 'base': 'MCO', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'ICN/ETH': { 'id': 'ICNETH', 'symbol': 'ICN/ETH', 'base': 'ICN', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'WTC/ETH': { 'id': 'WTCETH', 'symbol': 'WTC/ETH', 'base': 'WTC', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'OMG/ETH': { 'id': 'OMGETH', 'symbol': 'OMG/ETH', 'base': 'OMG', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'ZRX/ETH': { 'id': 'ZRXETH', 'symbol': 'ZRX/ETH', 'base': 'ZRX', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'BQX/ETH': { 'id': 'BQXETH', 'symbol': 'BQX/ETH', 'base': 'BQX', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.0000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'KNC/ETH': { 'id': 'KNCETH', 'symbol': 'KNC/ETH', 'base': 'KNC', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.0000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'FUN/ETH': { 'id': 'FUNETH', 'symbol': 'FUN/ETH', 'base': 'FUN', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'SNM/ETH': { 'id': 'SNMETH', 'symbol': 'SNM/ETH', 'base': 'SNM', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'NEO/ETH': { 'id': 'NEOETH', 'symbol': 'NEO/ETH', 'base': 'NEO', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'XVG/ETH': { 'id': 'XVGETH', 'symbol': 'XVG/ETH', 'base': 'XVG', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'CTR/ETH': { 'id': 'CTRETH', 'symbol': 'CTR/ETH', 'base': 'CTR', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.0000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'QTUM/BTC': { 'id': 'QTUMBTC', 'symbol': 'QTUM/BTC', 'base': 'QTUM', 'quote': 'BTC', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'LINK/BTC': { 'id': 'LINKBTC', 'symbol': 'LINK/BTC', 'base': 'LINK', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'SALT/BTC': { 'id': 'SALTBTC', 'symbol': 'SALT/BTC', 'base': 'SALT', 'quote': 'BTC', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'IOTA/BTC': { 'id': 'IOTABTC', 'symbol': 'IOTA/BTC', 'base': 'IOTA', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'QTUM/ETH': { 'id': 'QTUMETH', 'symbol': 'QTUM/ETH', 'base': 'QTUM', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'LINK/ETH': { 'id': 'LINKETH', 'symbol': 'LINK/ETH', 'base': 'LINK', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'SALT/ETH': { 'id': 'SALTETH', 'symbol': 'SALT/ETH', 'base': 'SALT', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'IOTA/ETH': { 'id': 'IOTAETH', 'symbol': 'IOTA/ETH', 'base': 'IOTA', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'BTC/USDT': { 'id': 'BTCUSDT', 'symbol': 'BTC/USDT', 'base': 'BTC', 'quote': 'USDT', 'lot': 0.000001, 'limits': { 'amount': { 'min': 0.000001, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }, 'cost': { 'min': 1, 'max': undefined }}},
                'ETH/USDT': { 'id': 'ETHUSDT', 'symbol': 'ETH/USDT', 'base': 'ETH', 'quote': 'USDT', 'lot': 0.00001, 'limits': { 'amount': { 'min': 0.00001, 'max': undefined }, 'price': { 'min': 0.01, 'max': undefined }, 'cost': { 'min': 1, 'max': undefined }}},
                'STRAT/ETH': { 'id': 'STRATETH', 'symbol': 'STRAT/ETH', 'base': 'STRAT', 'quote': 'ETH', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'SNGLS/ETH': { 'id': 'SNGLSETH', 'symbol': 'SNGLS/ETH', 'base': 'SNGLS', 'quote': 'ETH', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.01, 'max': undefined }}},
                'STRAT/BTC': { 'id': 'STRATBTC', 'symbol': 'STRAT/BTC', 'base': 'STRAT', 'quote': 'BTC', 'lot': 0.01, 'limits': { 'amount': { 'min': 0.01, 'max': undefined }, 'price': { 'min': 0.000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
                'SNGLS/BTC': { 'id': 'SNGLSBTC', 'symbol': 'SNGLS/BTC', 'base': 'SNGLS', 'quote': 'BTC', 'lot': 1, 'limits': { 'amount': { 'min': 1, 'max': undefined }, 'price': { 'min': 0.00000001, 'max': undefined }, 'cost': { 'min': 0.001, 'max': undefined }}},
            },
        });
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = parseFloat (this.costToPrecision (symbol, amount * rate));
        if (side == 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (symbol, cost)),
        };
    }

    async fetchBalance (params = {}) {
        let response = await this.privateGetAccount (params);
        let result = { 'info': response };
        let balances = response['balances'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let asset = balance['asset'];
            let currency = this.commonCurrencyCode (asset);
            let account = {
                'free': parseFloat (balance['free']),
                'used': parseFloat (balance['locked']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.publicGetDepth (this.extend ({
            'symbol': market['id'],
            'limit': 100, // default = maximum = 100
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market) {
        let timestamp = ticker['closeTime'];
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['highPrice']),
            'low': parseFloat (ticker['lowPrice']),
            'bid': parseFloat (ticker['bidPrice']),
            'ask': parseFloat (ticker['askPrice']),
            'vwap': parseFloat (ticker['weightedAvgPrice']),
            'open': parseFloat (ticker['openPrice']),
            'close': parseFloat (ticker['prevClosePrice']),
            'first': undefined,
            'last': parseFloat (ticker['lastPrice']),
            'change': parseFloat (ticker['priceChangePercent']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['volume']),
            'quoteVolume': parseFloat (ticker['quoteVolume']),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetTicker24hr (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (response, market);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        request['limit'] = (limit) ? limit : 500; // default == max == 500
        if (since)
            request['startTime'] = since;
        let response = await this.publicGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestampField = ('T' in trade) ? 'T' : 'time';
        let timestamp = trade[timestampField];
        let priceField = ('p' in trade) ? 'p' : 'price';
        let price = parseFloat (trade[priceField]);
        let amountField = ('q' in trade) ? 'q' : 'qty';
        let amount = parseFloat (trade[amountField]);
        let idField = ('a' in trade) ? 'a' : 'id';
        let id = trade[idField].toString ();
        let side = undefined;
        let order = undefined;
        if ('orderId' in trade)
            order = trade['orderId'].toString ();
        if ('m' in trade) {
            side = 'sell';
            if (trade['m'])
                side = 'buy';
        } else {
            side = (trade['isBuyer']) ? 'buy' : 'sell';
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': parseFloat (trade['commission']),
                'currency': trade['commissionAsset'],
            };
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': order,
            'type': undefined,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since)
            request['startTime'] = since;
        if (limit)
            request['limit'] = limit;
        // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
        // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
        // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
        // 'limit': 500,     // default = maximum = 500
        let response = await this.publicGetAggTrades (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    parseOrderStatus (status) {
        if (status == 'NEW')
            return 'open';
        if (status == 'PARTIALLY_FILLED')
            return 'partial';
        if (status == 'FILLED')
            return 'closed';
        if (status == 'CANCELED')
            return 'canceled';
        return status.toLowerCase ();
    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (order['status']);
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else {
            let id = order['symbol'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
        }
        let timestamp = order['time'];
        let price = parseFloat (order['price']);
        let amount = parseFloat (order['origQty']);
        let filled = this.safeFloat (order, 'executedQty', 0.0);
        let remaining = Math.max (amount - filled, 0.0);
        let result = {
            'info': order,
            'id': order['orderId'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': order['type'].toLowerCase (),
            'side': order['side'].toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let market = this.market (symbol);
        let order = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'type': type.toUpperCase (),
            'side': side.toUpperCase (),
        };
        if (type == 'limit') {
            order = this.extend (order, {
                'price': this.priceToPrecision (symbol, price),
                'timeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
            });
        }
        let response = await this.privatePostOrder (this.extend (order, params));
        return {
            'info': response,
            'id': response['orderId'].toString (),
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrder requires a symbol param');
        let market = this.market (symbol);
        let response = await this.privateGetOrder (this.extend ({
            'symbol': market['id'],
            'orderId': parseInt (id),
        }, params));
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOrders requires a symbol param');
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetAllOrders (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchOpenOrders requires a symbol param');
        let market = this.market (symbol);
        let response = await this.privateGetOpenOrders (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseOrders (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' cancelOrder requires a symbol param');
        let market = this.market (symbol);
        let response = undefined;
        try {
            response = await this.privateDeleteOrder (this.extend ({
                'symbol': market['id'],
                'orderId': parseInt (id),
                // 'origClientOrderId': id,
            }, params));
        } catch (e) {
            if (this.last_http_response.indexOf ('UNKNOWN_ORDER') >= 0)
                throw new OrderNotFound (this.id + ' cancelOrder() error: ' + this.last_http_response);
            throw e;
        }
        return response;
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + ' fetchMyTrades requires a symbol');
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetMyTrades (this.extend (request, params));
        return this.parseTrades (response, market);
    }

    async withdraw (currency, amount, address, params = {}) {
        let response = await this.wapiPostWithdraw (this.extend ({
            'asset': currency,
            'address': address,
            'amount': parseFloat (amount),
            'recvWindow': 10000000,
        }, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api != 'web')
            url += '/' + this.version;
        url += '/' + path;
        if (api == 'wapi')
            url += '.html';
        if ((api == 'private') || (api == 'wapi')) {
            let nonce = this.nonce ();
            let query = this.urlencode (this.extend ({ 'timestamp': nonce }, params));
            let signature = undefined;
            if (api != 'wapi') {
                let auth = this.secret + '|' + query;
                signature = this.hash (this.encode (auth), 'sha256'); // v1
            } else {
                signature = this.hmac (this.encode (query), this.encode (this.secret)); // v3
            }
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method == 'GET') || (api == 'wapi')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('code' in response) {
            if (response['code'] < 0) {
                if (response['code'] == -2010)
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
                if (response['code'] == -2011)
                    throw new OrderNotFound (this.id + ' ' + this.json (response));
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
        return response;
    }
}
