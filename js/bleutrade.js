"use strict";

// ---------------------------------------------------------------------------

const bittrex = require ('./bittrex.js');
const { AuthenticationError, InvalidOrder, InsufficientFunds, DDoSProtection } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class bleutrade extends bittrex {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bleutrade',
            'name': 'Bleutrade',
            'countries': 'BR', // Brazil
            'rateLimit': 1000,
            'version': 'v2',
            'hasCORS': true,
            'hasFetchTickers': true,
            'hasFetchOHLCV': false,
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
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let result = [];
        for (let p = 0; p < markets['result'].length; p++) {
            let market = markets['result'][p];
            let id = market['MarketName'];
            let base = market['MarketCurrency'];
            let quote = market['BaseCurrency'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let active = market['IsActive'];
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'info': market,
                'lot': Math.pow (10, -precision['amount']),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': market['MinTradeSize'],
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
            }));
        }
        return result;
    }

    getOrderIdField () {
        return 'orderid';
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetOrderbook (this.extend ({
            'market': this.marketId (symbol),
            'type': 'ALL',
            'depth': 50,
        }, params));
        let orderbook = response['result'];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'Rate', 'Quantity');
    }

    throwExceptionOnError (response) {
        if ('message' in response) {
            if (response['message'] === 'Insufficient funds!')
                throw new InsufficientFunds (this.id + ' ' + this.json (response));
            if (response['message'] === 'MIN_TRADE_REQUIREMENT_NOT_MET')
                throw new InvalidOrder (this.id + ' ' + this.json (response));
            if (response['message'] === 'APIKEY_INVALID') {
                if (this.hasAlreadyAuthenticatedSuccessfully) {
                    throw new DDoSProtection (this.id + ' ' + this.json (response));
                } else {
                    throw new AuthenticationError (this.id + ' ' + this.json (response));
                }
            }
            if (response['message'] === 'DUST_TRADE_DISALLOWED_MIN_VALUE_50K_SAT')
                throw new InvalidOrder (this.id + ' order cost should be over 50k satoshi ' + this.json (response));
        }
    }
}
