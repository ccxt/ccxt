'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidNonce, OrderNotFound, InvalidOrder, InsufficientFunds, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class liquid extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'liquid',
            'name': 'Liquid',
            'countries': [ 'JP', 'CN', 'TW' ],
            'version': '2',
            'rateLimit': 1000,
            'parseJsonResponse': false,
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/45798859-1a872600-bcb4-11e8-8746-69291ce87b04.jpg',
                'api': 'https://api.liquid.com',
                'www': 'https://www.liquid.com',
                'doc': [
                    'https://developers.quoine.com',
                    'https://developers.quoine.com/v2',
                ],
                'fees': 'https://help.liquid.com/getting-started-with-liquid/the-platform/fee-structure',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'products',
                        'products/{id}',
                        'products/{id}/price_levels',
                        'executions',
                        'ir_ladders/{currency}',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/balance',
                        'accounts/main_asset',
                        'crypto_accounts',
                        'executions/me',
                        'fiat_accounts',
                        'loan_bids',
                        'loans',
                        'orders',
                        'orders/{id}',
                        'orders/{id}/trades',
                        'orders/{id}/executions',
                        'trades',
                        'trades/{id}/loans',
                        'trading_accounts',
                        'trading_accounts/{id}',
                        'transactions',
                    ],
                    'post': [
                        'fiat_accounts',
                        'loan_bids',
                        'orders',
                    ],
                    'put': [
                        'loan_bids/{id}/close',
                        'loans/{id}',
                        'orders/{id}',
                        'orders/{id}/cancel',
                        'trades/{id}',
                        'trades/{id}/close',
                        'trades/close_all',
                        'trading_accounts/{id}',
                    ],
                },
            },
            'skipJsonOnStatusCodes': [401],
            'exceptions': {
                'messages': {
                    'API Authentication failed': AuthenticationError,
                    'Nonce is too small': InvalidNonce,
                    'Order not found': OrderNotFound,
                    'Can not update partially filled order': OrderNotFound,
                    'Can not update non-live order': OrderNotFound,
                    'user': {
                        'not_enough_free_balance': InsufficientFunds,
                    },
                    'price': {
                        'must_be_positive': InvalidOrder,
                    },
                    'quantity': {
                        'less_than_order_size': InvalidOrder,
                    },
                },
            },
            'commonCurrencies': {
                'WIN': 'WCOIN',
            },
        });
    }

    async fetchMinOrderAmounts () {
        let currencies = await this.fetchCurrencies ();
        let currenciesByCode = this.indexBy (currencies, 'code');
        let codes = Object.keys (currenciesByCode);
        let result = {};
        for (let i = 0; i < codes.length; i++) {
            let code = codes[i];
            let currency = currenciesByCode[code];
            let info = this.safeValue (currency, 'info', {});
            let minOrderAmount = this.safeFloat (info, 'minimum_order_quantity');
            if (minOrderAmount !== undefined) {
                result[code] = minOrderAmount;
            }
        }
        return result;
    }

    async fetchCurrencies () {
        let response = await this.publicGetCurrencies ();
        //
        //     [
        //         {
        //             currency_type: 'fiat',
        //             currency: 'USD',
        //             symbol: '$',
        //             assets_precision: 2,
        //             quoting_precision: 5,
        //             minimum_withdrawal: '15.0',
        //             withdrawal_fee: 5,
        //             minimum_fee: null,
        //             minimum_order_quantity: null,
        //             display_precision: 2,
        //             depositable: true,
        //             withdrawable: true,
        //             discount_fee: 0.5,
        //         },
        //     ]
        //
        let result = {};
        for (let i = 0; i < response.length; i++) {
            let currency = response[i];
            let id = this.safeString (currency, 'currency');
            let code = this.commonCurrencyCode (id);
            let active = currency['depositable'] && currency['withdrawable'];
            let amountPrecision = this.safeInteger (currency, 'assets_precision');
            let pricePrecision = this.safeInteger (currency, 'quoting_precision');
            let precision = Math.max (amountPrecision, pricePrecision);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'active': active,
                'fee': this.safeFloat (currency, 'withdrawal_fee'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -amountPrecision),
                        'max': Math.pow (10, amountPrecision),
                    },
                    'price': {
                        'min': Math.pow (10, -pricePrecision),
                        'max': Math.pow (10, pricePrecision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minimum_withdrawal'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets () {
        let markets = await this.publicGetProducts ();
        let minOrderAmounts = await this.fetchMinOrderAmounts ();
        let result = [];
        // will rewrite this very shortly
        let defaultPrecisions = { 'price': 8, 'amount': 8 };
        let precisions = {
            '1WO/BTC': defaultPrecisions,
            '1WO/ETH': defaultPrecisions,
            '1WO/QASH': defaultPrecisions,
            'ADH/BTC': defaultPrecisions,
            'ADH/ETH': defaultPrecisions,
            'ADH/QASH': defaultPrecisions,
            'ALX/BTC': defaultPrecisions,
            'ALX/ETH': defaultPrecisions,
            'ALX/QASH': defaultPrecisions,
            'AMLT/BTC': defaultPrecisions,
            'AMLT/ETH': defaultPrecisions,
            'AMLT/QASH': defaultPrecisions,
            'BCH/BTC': defaultPrecisions,
            'BCH/JPY': { 'price': 5, 'amount': 8 },
            'BCH/SGD': { 'price': 5, 'amount': 8 },
            'BCH/USD': { 'price': 5, 'amount': 8 },
            'BMC/BTC': defaultPrecisions,
            'BMC/ETH': defaultPrecisions,
            'BMC/QASH': defaultPrecisions,
            'BRC/BCH': { 'price': 8, 'amount': 0 },
            'BRC/BTC': defaultPrecisions,
            'BRC/ETH': defaultPrecisions,
            'BRC/QASH': defaultPrecisions,
            'BTC/AUD': { 'price': 5, 'amount': 8 },
            'BTC/CNY': { 'price': 5, 'amount': 6 },
            'BTC/EUR': { 'price': 5, 'amount': 8 },
            'BTC/HKD': { 'price': 5, 'amount': 8 },
            'BTC/IDR': { 'price': 5, 'amount': 8 },
            'BTC/INR': { 'price': 5, 'amount': 8 },
            'BTC/JPY': { 'price': 5, 'amount': 8 },
            'BTC/PHP': { 'price': 5, 'amount': 8 },
            'BTC/SGD': { 'price': 5, 'amount': 8 },
            'BTC/USD': { 'price': 5, 'amount': 8 },
            'BTRN/BTC': defaultPrecisions,
            'BTRN/ETH': defaultPrecisions,
            'BTRN/QASH': defaultPrecisions,
            'CAN/BTC': defaultPrecisions,
            'CAN/ETH': defaultPrecisions,
            'CAN/QASH': { 'price': 8, 'amount': 5 },
            'CMCT/BTC': defaultPrecisions,
            'CMCT/ETH': defaultPrecisions,
            'CMCT/QASH': defaultPrecisions,
            'CRPT/BTC': defaultPrecisions,
            'CRPT/ETH': defaultPrecisions,
            'CRPT/QASH': defaultPrecisions,
            'DACS/BTC': defaultPrecisions,
            'DACS/ETH': defaultPrecisions,
            'DACS/QASH': defaultPrecisions,
            'DASH/BTC': defaultPrecisions,
            'DASH/EUR': { 'price': 5, 'amount': 8 },
            'DASH/JPY': { 'price': 3, 'amount': 8 },
            'DASH/SGD': { 'price': 4, 'amount': 8 },
            'DASH/USD': { 'price': 4, 'amount': 8 },
            'DENT/BTC': defaultPrecisions,
            'DENT/ETH': defaultPrecisions,
            'DENT/QASH': defaultPrecisions,
            'DRG/BTC': defaultPrecisions,
            'DRG/ETH': defaultPrecisions,
            'DRG/QASH': defaultPrecisions,
            'EARTH/BTC': defaultPrecisions,
            'EARTH/ETH': defaultPrecisions,
            'EARTH/QASH': defaultPrecisions,
            'ECH/BTC': defaultPrecisions,
            'ECH/ETH': defaultPrecisions,
            'ECH/QASH': defaultPrecisions,
            'ELY/BTC': defaultPrecisions,
            'ELY/ETH': defaultPrecisions,
            'ELY/QASH': defaultPrecisions,
            'ENJ/BTC': defaultPrecisions,
            'ENJ/ETH': defaultPrecisions,
            'ENJ/QASH': defaultPrecisions,
            'ETC/BTC': defaultPrecisions,
            'ETH/AUD': { 'price': 5, 'amount': 8 },
            'ETH/BTC': defaultPrecisions,
            'ETH/EUR': { 'price': 5, 'amount': 8 },
            'ETH/HKD': { 'price': 5, 'amount': 8 },
            'ETH/IDR': { 'price': 5, 'amount': 8 },
            'ETH/JPY': { 'price': 5, 'amount': 8 },
            'ETH/PHP': { 'price': 5, 'amount': 8 },
            'ETH/SGD': { 'price': 5, 'amount': 8 },
            'ETH/USD': { 'price': 5, 'amount': 8 },
            'ETN/BTC': { 'price': 8, 'amount': 2 },
            'ETN/ETH': { 'price': 8, 'amount': 2 },
            'ETN/QASH': { 'price': 8, 'amount': 2 },
            'EZT/BTC': defaultPrecisions,
            'EZT/ETH': defaultPrecisions,
            'EZT/QASH': defaultPrecisions,
            'FCT/BTC': defaultPrecisions,
            'FCT/ETH': defaultPrecisions,
            'FDX/BTC': defaultPrecisions,
            'FDX/ETH': defaultPrecisions,
            'FDX/QASH': defaultPrecisions,
            'FLIXX/BTC': defaultPrecisions,
            'FLIXX/ETH': defaultPrecisions,
            'FLIXX/QASH': defaultPrecisions,
            'FLP/BTC': defaultPrecisions,
            'FLP/ETH': defaultPrecisions,
            'FLP/QASH': defaultPrecisions,
            'FLUZ/BTC': defaultPrecisions,
            'FLUZ/ETH': defaultPrecisions,
            'FLUZ/QASH': defaultPrecisions,
            'FSN/BTC': defaultPrecisions,
            'FSN/ETH': defaultPrecisions,
            'FSN/QASH': defaultPrecisions,
            'FTT/BTC': defaultPrecisions,
            'FTT/ETH': defaultPrecisions,
            'FTT/QASH': defaultPrecisions,
            'FTX/BTC': defaultPrecisions,
            'FTX/ETH': defaultPrecisions,
            'FTX/QASH': defaultPrecisions,
            'GAT/BTC': defaultPrecisions,
            'GAT/ETH': defaultPrecisions,
            'GAT/QASH': defaultPrecisions,
            'GET/BTC': defaultPrecisions,
            'GET/ETH': defaultPrecisions,
            'GET/QASH': defaultPrecisions,
            'GZE/BTC': defaultPrecisions,
            'GZE/ETH': defaultPrecisions,
            'GZE/QASH': defaultPrecisions,
            'HAV/BTC': defaultPrecisions,
            'HAV/ETH': defaultPrecisions,
            'HAV/QASH': defaultPrecisions,
            'HERO/BTC': defaultPrecisions,
            'HERO/ETH': defaultPrecisions,
            'HERO/QASH': defaultPrecisions,
            'IDH/BTC': defaultPrecisions,
            'IDH/ETH': defaultPrecisions,
            'IDH/QASH': defaultPrecisions,
            'IHF/BTC': defaultPrecisions,
            'IHF/ETH': defaultPrecisions,
            'IND/BTC': defaultPrecisions,
            'IND/ETH': defaultPrecisions,
            'IPSX/BTC': defaultPrecisions,
            'IPSX/ETH': defaultPrecisions,
            'IPSX/QASH': defaultPrecisions,
            'IXT/BTC': defaultPrecisions,
            'IXT/ETH': defaultPrecisions,
            'IXT/QASH': defaultPrecisions,
            'KRL/BTC': defaultPrecisions,
            'KRL/ETH': defaultPrecisions,
            'KRL/QASH': defaultPrecisions,
            'LALA/BTC': defaultPrecisions,
            'LALA/ETH': defaultPrecisions,
            'LALA/QASH': defaultPrecisions,
            'LDC/BTC': defaultPrecisions,
            'LDC/ETH': defaultPrecisions,
            'LDC/QASH': defaultPrecisions,
            'LIKE/BTC': defaultPrecisions,
            'LIKE/ETH': defaultPrecisions,
            'LIKE/QASH': defaultPrecisions,
            'LND/BTC': defaultPrecisions,
            'LND/ETH': defaultPrecisions,
            'LND/QASH': { 'price': 6, 'amount': 8 },
            'LTC/BTC': defaultPrecisions,
            'MCO/BTC': defaultPrecisions,
            'MCO/ETH': defaultPrecisions,
            'MCO/QASH': defaultPrecisions,
            'MGO/BTC': defaultPrecisions,
            'MGO/ETH': defaultPrecisions,
            'MGO/QASH': defaultPrecisions,
            'MITH/BTC': defaultPrecisions,
            'MITH/ETH': defaultPrecisions,
            'MITX/BTC': defaultPrecisions,
            'MITX/ETH': defaultPrecisions,
            'MITX/QASH': defaultPrecisions,
            'MRK/BTC': defaultPrecisions,
            'MRK/ETH': defaultPrecisions,
            'MRK/QASH': defaultPrecisions,
            'MT/BTC': defaultPrecisions,
            'MT/ETH': { 'price': 7, 'amount': 0 },
            'MT/QASH': defaultPrecisions,
            'MTN/BTC': defaultPrecisions,
            'MTN/ETH': defaultPrecisions,
            'MTN/QASH': defaultPrecisions,
            'NEO/BTC': defaultPrecisions,
            'NEO/ETH': defaultPrecisions,
            'NEO/EUR': { 'price': 4, 'amount': 8 },
            'NEO/JPY': { 'price': 5, 'amount': 8 },
            'NEO/SGD': { 'price': 5, 'amount': 8 },
            'NEO/USD': { 'price': 4, 'amount': 8 },
            'OAX/BTC': defaultPrecisions,
            'OAX/ETH': defaultPrecisions,
            'ONG/BTC': defaultPrecisions,
            'ONG/ETH': defaultPrecisions,
            'ONG/QASH': defaultPrecisions,
            'PAL/BTC': defaultPrecisions,
            'PAL/ETH': defaultPrecisions,
            'PAL/QASH': { 'price': 8, 'amount': 7 },
            'PLC/BTC': defaultPrecisions,
            'PLC/ETH': defaultPrecisions,
            'PLC/QASH': defaultPrecisions,
            'PWV/BTC': defaultPrecisions,
            'PWV/ETH': { 'price': 8, 'amount': 0 },
            'PWV/QASH': { 'price': 6, 'amount': 4 },
            'QASH/AUD': { 'price': 5, 'amount': 8 },
            'QASH/BTC': defaultPrecisions,
            'QASH/ETH': defaultPrecisions,
            'QASH/EUR': { 'price': 5, 'amount': 8 },
            'QASH/IDR': { 'price': 2, 'amount': 8 },
            'QASH/JPY': { 'price': 5, 'amount': 8 },
            'QASH/SGD': { 'price': 5, 'amount': 8 },
            'QASH/USD': { 'price': 5, 'amount': 8 },
            'QTUM/BTC': defaultPrecisions,
            'QTUM/ETH': defaultPrecisions,
            'QTUM/EUR': { 'price': 5, 'amount': 8 },
            'QTUM/JPY': { 'price': 5, 'amount': 8 },
            'QTUM/SGD': { 'price': 5, 'amount': 8 },
            'QTUM/USD': { 'price': 5, 'amount': 8 },
            'RBLX/BTC': defaultPrecisions,
            'RBLX/ETH': defaultPrecisions,
            'RBLX/QASH': defaultPrecisions,
            'REP/BTC': defaultPrecisions,
            'RKT/AUD': { 'price': 5, 'amount': 0 },
            'RKT/BTC': defaultPrecisions,
            'RKT/ETH': defaultPrecisions,
            'RKT/EUR': { 'price': 5, 'amount': 8 },
            'RKT/JPY': { 'price': 5, 'amount': 8 },
            'RKT/QASH': defaultPrecisions,
            'RKT/SGD': { 'price': 5, 'amount': 8 },
            'RKT/USD': { 'price': 5, 'amount': 8 },
            'SAL/BTC': defaultPrecisions,
            'SAL/ETH': defaultPrecisions,
            'SAL/QASH': defaultPrecisions,
            'SER/BTC': defaultPrecisions,
            'SER/ETH': defaultPrecisions,
            'SER/QASH': defaultPrecisions,
            'SGN/BTC': defaultPrecisions,
            'SGN/ETH': defaultPrecisions,
            'SGN/QASH': defaultPrecisions,
            'SHP/BTC': defaultPrecisions,
            'SHP/ETH': defaultPrecisions,
            'SHP/QASH': defaultPrecisions,
            'SIX/BTC': { 'price': 8, 'amount': 7 },
            'SNIP/BTC': defaultPrecisions,
            'SNIP/ETH': defaultPrecisions,
            'SNIP/QASH': defaultPrecisions,
            'SPHTX/BTC': defaultPrecisions,
            'SPHTX/ETH': defaultPrecisions,
            'SPHTX/QASH': defaultPrecisions,
            'STAC/BTC': { 'price': 8, 'amount': 0 },
            'STAC/ETH': defaultPrecisions,
            'STAC/QASH': defaultPrecisions,
            'STORJ/BTC': defaultPrecisions,
            'STORJ/ETH': defaultPrecisions,
            'STU/BTC': defaultPrecisions,
            'STU/ETH': defaultPrecisions,
            'STU/QASH': { 'price': 8, 'amount': 2 },
            'STX/BTC': defaultPrecisions,
            'STX/ETH': defaultPrecisions,
            'THRT/BTC': defaultPrecisions,
            'THRT/ETH': defaultPrecisions,
            'THRT/QASH': defaultPrecisions,
            'TPAY/BTC': defaultPrecisions,
            'TPAY/ETH': defaultPrecisions,
            'TPAY/QASH': defaultPrecisions,
            'TPT/BTC': defaultPrecisions,
            'TPT/ETH': defaultPrecisions,
            'TPT/QASH': defaultPrecisions,
            'TRX/BTC': { 'price': 8, 'amount': 6 },
            'TRX/ETH': { 'price': 8, 'amount': 6 },
            'UBT/BTC': defaultPrecisions,
            'UBT/ETH': defaultPrecisions,
            'UBT/QASH': defaultPrecisions,
            'UBTC/BTC': { 'price': 8, 'amount': 7 },
            'UBTC/ETH': defaultPrecisions,
            'UBTC/JPY': { 'price': 4, 'amount': 0 },
            'UBTC/QASH': defaultPrecisions,
            'UBTC/SGD': { 'price': 5, 'amount': 0 },
            'UBTC/USD': { 'price': 5, 'amount': 8 },
            'UKG/BTC': defaultPrecisions,
            'UKG/ETH': defaultPrecisions,
            'UKG/QASH': defaultPrecisions,
            'VET/BTC': defaultPrecisions,
            'VET/ETH': defaultPrecisions,
            'VIO/BTC': defaultPrecisions,
            'VIO/ETH': defaultPrecisions,
            'VIO/QASH': defaultPrecisions,
            'VUU/BTC': defaultPrecisions,
            'VUU/ETH': defaultPrecisions,
            'VUU/QASH': defaultPrecisions,
            'VZT/BTC': defaultPrecisions,
            'VZT/ETH': defaultPrecisions,
            'VZT/QASH': defaultPrecisions,
            'WCOIN/BTC': defaultPrecisions,
            'WCOIN/ETH': defaultPrecisions,
            'WCOIN/QASH': defaultPrecisions,
            'XEM/BTC': { 'price': 8, 'amount': 6 },
            'XES/BTC': defaultPrecisions,
            'XES/ETH': defaultPrecisions,
            'XES/QASH': defaultPrecisions,
            'XLM/BTC': defaultPrecisions,
            'XLM/ETH': defaultPrecisions,
            'XMR/BTC': defaultPrecisions,
            'XNK/BTC': defaultPrecisions,
            'XNK/ETH': defaultPrecisions,
            'XNK/QASH': defaultPrecisions,
            'XRP/BTC': { 'price': 8, 'amount': 6 },
            'XRP/EUR': { 'price': 5, 'amount': 6 },
            'XRP/IDR': { 'price': 5, 'amount': 0 },
            'XRP/JPY': { 'price': 5, 'amount': 6 },
            'XRP/QASH': { 'price': 8, 'amount': 6 },
            'XRP/SGD': { 'price': 5, 'amount': 6 },
            'XRP/USD': { 'price': 5, 'amount': 6 },
            'ZCO/BTC': defaultPrecisions,
            'ZCO/ETH': defaultPrecisions,
            'ZCO/QASH': defaultPrecisions,
            'ZEC/BTC': defaultPrecisions,
            'ZPR/BTC': defaultPrecisions,
            'ZPR/ETH': defaultPrecisions,
            'ZPR/QASH': defaultPrecisions,
        };
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['id'].toString ();
            let baseId = market['base_currency'];
            let quoteId = market['quoted_currency'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let maker = this.safeFloat (market, 'maker_fee');
            let taker = this.safeFloat (market, 'taker_fee');
            let active = !market['disabled'];
            let minAmount = undefined;
            if (baseId in minOrderAmounts)
                minAmount = minOrderAmounts[baseId];
            let minPrice = undefined;
            if (quote === 'BTC') {
                minPrice = 0.00000001;
            } else if (quote === 'ETH' || quote === 'USD' || quote === 'JPY') {
                minPrice = 0.00001;
            }
            let limits = {
                'amount': { 'min': minAmount },
                'price': { 'min': minPrice },
                'cost': { 'min': undefined },
            };
            if (minPrice !== undefined)
                if (minAmount !== undefined)
                    limits['cost']['min'] = minPrice * minAmount;
            let precision = {
                'amount': undefined,
                'price': undefined,
            };
            if (symbol in precisions) {
                precision = precisions[symbol];
            } else {
                if (minAmount !== undefined)
                    precision['amount'] = -Math.log10 (minAmount);
                if (minPrice !== undefined)
                    precision['price'] = -Math.log10 (minPrice);
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'maker': maker,
                'taker': taker,
                'limits': limits,
                'precision': precision,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetAccountsBalance (params);
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currencyId = balance['currency'];
            let code = currencyId;
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            }
            let total = parseFloat (balance['balance']);
            let account = {
                'free': total,
                'used': undefined,
                'total': total,
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetProductsIdPriceLevels (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'buy_price_levels', 'sell_price_levels');
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let last = undefined;
        if ('last_traded_price' in ticker) {
            if (ticker['last_traded_price']) {
                let length = ticker['last_traded_price'].length;
                if (length > 0)
                    last = this.safeFloat (ticker, 'last_traded_price');
            }
        }
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (ticker, 'id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                let baseId = this.safeString (ticker, 'base_currency');
                let quoteId = this.safeString (ticker, 'quoted_currency');
                if (symbol in this.markets) {
                    market = this.markets[symbol];
                } else {
                    symbol = this.commonCurrencyCode (baseId) + '/' + this.commonCurrencyCode (quoteId);
                }
            }
        }
        if (market !== undefined)
            symbol = market['symbol'];
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        let open = this.safeFloat (ticker, 'last_price_24h');
        if (open !== undefined && last !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
            if (open > 0) {
                percentage = change / open * 100;
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high_market_ask'),
            'low': this.safeFloat (ticker, 'low_market_bid'),
            'bid': this.safeFloat (ticker, 'market_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'market_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'volume_24h'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetProducts (params);
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
        let ticker = await this.publicGetProductsId (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        // {             id:  12345,
        //         quantity: "6.789",
        //            price: "98765.4321",
        //       taker_side: "sell",
        //       created_at:  1512345678,
        //          my_side: "buy"           }
        let timestamp = trade['created_at'] * 1000;
        let orderId = this.safeString (trade, 'order_id');
        // 'taker_side' gets filled for both fetchTrades and fetchMyTrades
        let takerSide = this.safeString (trade, 'taker_side');
        // 'my_side' gets filled for fetchMyTrades only and may differ from 'taker_side'
        let mySide = this.safeString (trade, 'my_side');
        let side = (mySide !== undefined) ? mySide : takerSide;
        let takerOrMaker = undefined;
        if (mySide !== undefined)
            takerOrMaker = (takerSide === mySide) ? 'taker' : 'maker';
        return {
            'info': trade,
            'id': trade['id'].toString (),
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'quantity'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'product_id': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit;
        if (since !== undefined) {
            // timestamp should be in seconds, whereas we use milliseconds in since and everywhere
            request['timestamp'] = parseInt (since / 1000);
        }
        let response = await this.publicGetExecutions (this.extend (request, params));
        let result = (since !== undefined) ? response : response['models'];
        return this.parseTrades (result, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        // the `with_details` param is undocumented - it adds the order_id to the results
        let request = {
            'product_id': market['id'],
            'with_details': true,
        };
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetExecutionsMe (this.extend (request, params));
        return this.parseTrades (response['models'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'order_type': type,
            'product_id': this.marketId (symbol),
            'side': side,
            'quantity': amount,
        };
        if (type === 'limit')
            order['price'] = price;
        let response = await this.privatePostOrders (this.extend (order, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let result = await this.privatePutOrdersIdCancel (this.extend ({
            'id': id,
        }, params));
        let order = this.parseOrder (result);
        if (order['status'] === 'closed')
            throw new OrderNotFound (this.id + ' ' + this.json (order));
        return order;
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'order': {
                'quantity': amount,
                'price': price,
            },
        };
        let result = await this.privatePutOrdersId (this.extend ({
            'id': id,
        }), order);
        return this.parseOrder (result);
    }

    parseOrder (order, market = undefined) {
        let timestamp = order['created_at'] * 1000;
        let marketId = this.safeString (order, 'product_id');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        let status = undefined;
        if ('status' in order) {
            if (order['status'] === 'live') {
                status = 'open';
            } else if (order['status'] === 'filled') {
                status = 'closed';
            } else if (order['status'] === 'cancelled') { // 'll' intended
                status = 'canceled';
            }
        }
        let amount = this.safeFloat (order, 'quantity');
        let filled = this.safeFloat (order, 'filled_quantity');
        let price = this.safeFloat (order, 'price');
        let symbol = undefined;
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = market.quote;
        }
        let averagePrice = this.safeFloat (order, 'average_price');
        let cost = filled * averagePrice;
        return {
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': order['order_type'],
            'status': status,
            'symbol': symbol,
            'side': order['side'],
            'price': price,
            'amount': amount,
            'filled': filled,
            'cost': cost,
            'remaining': amount - filled,
            'trades': undefined,
            'fee': {
                'currency': feeCurrency,
                'cost': this.safeFloat (order, 'order_fee'),
            },
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = await this.privateGetOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        let status = this.safeValue (params, 'status');
        if (status) {
            params = this.omit (params, 'status');
            if (status === 'open') {
                request['status'] = 'live';
            } else if (status === 'closed') {
                request['status'] = 'filled';
            } else if (status === 'canceled') {
                request['status'] = 'cancelled';
            }
        }
        if (limit !== undefined)
            request['limit'] = limit;
        let result = await this.privateGetOrders (this.extend (request, params));
        let orders = result['models'];
        return this.parseOrders (orders, market, since, limit);
    }

    fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({ 'status': 'open' }, params));
    }

    fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchOrders (symbol, since, limit, this.extend ({ 'status': 'closed' }, params));
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        headers = {
            'X-Quoine-API-Version': this.version,
            'Content-Type': 'application/json',
        };
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
            let nonce = this.nonce ();
            let request = {
                'path': url,
                'nonce': nonce,
                'token_id': this.apiKey,
                'iat': Math.floor (nonce / 1000), // issued at
            };
            headers['X-Quoine-Auth'] = this.jwt (request, this.secret);
        } else {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response = undefined) {
        if (code >= 200 && code <= 299)
            return;
        const messages = this.exceptions['messages'];
        if (code === 401) {
            // expected non-json response
            if (body in messages)
                throw new messages[body] (this.id + ' ' + body);
            else
                return;
        }
        if (response === undefined)
            if ((body[0] === '{') || (body[0] === '['))
                response = JSON.parse (body);
            else
                return;
        const feedback = this.id + ' ' + this.json (response);
        if (code === 404) {
            // { "message": "Order not found" }
            const message = this.safeString (response, 'message');
            if (message in messages)
                throw new messages[message] (feedback);
        } else if (code === 422) {
            // array of error messages is returned in 'user' or 'quantity' property of 'errors' object, e.g.:
            // { "errors": { "user": ["not_enough_free_balance"] }}
            // { "errors": { "quantity": ["less_than_order_size"] }}
            if ('errors' in response) {
                const errors = response['errors'];
                const errorTypes = ['user', 'quantity', 'price'];
                for (let i = 0; i < errorTypes.length; i++) {
                    const errorType = errorTypes[i];
                    if (errorType in errors) {
                        const errorMessages = errors[errorType];
                        for (let j = 0; j < errorMessages.length; j++) {
                            const message = errorMessages[j];
                            if (message in messages[errorType])
                                throw new messages[errorType][message] (feedback);
                        }
                    }
                }
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        return this.parseIfJsonEncodedObject (response);
    }
};
