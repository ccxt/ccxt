'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, InvalidAddress, AuthenticationError, OnMaintenance, RateLimitExceeded, PermissionDenied, NotSupported, BadRequest, BadSymbol } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class b2c2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'b2c2',
            'name': 'B2C2',
            'countries': [ 'GB' ],
            'rateLimit': 500,
            'has': {
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOrders': true,
                'fetchLedger': true,
                'fetchMyTrades': true,
                'createOrder': true,
                'fetchOrder': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg',
                'api': {
                    'private': 'https://api.b2c2.net',
                },
                'test': {
                    'private': 'https://api.uat.b2c2.net',
                },
                'www': 'https://b2c2.com',
                'doc': 'https://docs.b2c2.net',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'private': {
                    'get': [
                        'account_info',
                        'balance',
                        'currency',
                        'funding_rates',
                        'instruments',
                        'ledger',
                        'order',
                        'order/{order_id_or_client_order_id}',
                        'trade',
                        'trade/{trade_id}',
                        'withdrawal',
                        'withdrawal/{withdrawal_id}',
                    ],
                    'post': [
                        'request_for_quote/',
                        'order/',
                        'withdrawal/',
                    ],
                    'delete': [
                        'order/{order_id_or_client_order_id}',
                        'withdrawal/{withdrawal_id}',
                    ],
                },
            },
            'httpExceptions': {
                '400': BadRequest, // Bad Request –- Incorrect parameters.
                '401': AuthenticationError, // Unauthorized – Wrong Token.
                '404': ExchangeNotAvailable, // Not Found – The specified endpoint could not be found.
                '405': ExchangeNotAvailable, // Method Not Allowed – You tried to access an endpoint with an invalid method.
                '406': BadRequest, // Not Acceptable – Incorrect request format.
                '429': RateLimitExceeded, // Too Many Requests – Rate limited, pause requests.
                '500': ExchangeError, // Internal Server Error – We had a problem with our server. Try again later.
                '503': OnMaintenance, // Service unavailable
            },
            'exceptions': {
                'exact': {
                    '1000': ExchangeError, // Generic –- Unknown error.
                    '1001': InvalidOrder, // Instrument not allowed – Instrument does not exist or you are not authorized to trade it.
                    '1002': PermissionDenied, // The RFQ does not belong to you.
                    '1003': InvalidOrder, // Different instrument – You tried to post a trade with a different instrument than the related RFQ.
                    '1004': InvalidOrder, // Different side – You tried to post a trade with a different side than the related RFQ.
                    '1005': InvalidOrder, // Different price – You tried to post a trade with a different price than the related RFQ.
                    '1006': InvalidOrder, // Different quantity – You tried to post a trade with a different quantity than the related RFQ.
                    '1007': InvalidOrder, // Quote is not valid – Quote may have expired.
                    '1009': InvalidOrder, // Price not valid – The price is not valid anymore. This error can occur during big market moves.
                    '1010': InvalidOrder, // Quantity too big – Max quantity per trade reached.
                    '1011': InsufficientFunds, // Not enough balance – Not enough balance.
                    '1012': InsufficientFunds, // Max risk exposure reached – Please see our FAQ for more information about the risk exposure.
                    '1013': InsufficientFunds, // Max credit exposure reached – Please see our FAQ for more information about the credit exposure.
                    '1014': InvalidAddress, // No BTC address associated – You don’t have a BTC address associated to your account.
                    '1015': InvalidOrder, // Too many decimals – We only allow four decimals in quantities.
                    '1016': OnMaintenance, // Trading is disabled – May occur after a maintenance or under exceptional circumstances.
                    '1017': BadRequest, // Illegal parameter – Wrong type or parameter.
                    '1018': OnMaintenance, // Settlement is disabled at the moment.
                    '1019': InvalidOrder, // Quantity is too small.
                    '1020': InvalidOrder, // The field valid_until is malformed.
                    '1021': OrderNotFound, // Your Order has expired.
                    '1022': BadSymbol, // Currency not allowed.
                    '1023': NotSupported, // We only support “FOK” order_type at the moment.
                    '1100': ExchangeError, // Other error.
                    '1101': BadRequest, // Field required – Field required.
                    '1102': BadRequest, // Pagination offset too big – Narrow down the data space using parameters such as ‘created*gte’, ‘created*lt’, ‘since’.
                    '1200': OnMaintenance, // API Maintenance
                },
            },
            'options': {
                'fetchMyTrades': {
                    'sort': 'timestamp,asc',
                },
                'fetchOpenOrders': {
                    'sort': 'createdAt,asc',
                },
                'fetchClosedOrders': {
                    'sort': 'createdAt,asc',
                },
                'defaultSort': 'timestamp,asc',
                'defaultSortOrders': 'createdAt,asc',
            },
            'currencies': {
                'ADA': {'id': 'ADA', 'code': 'ADA', 'name': 'Cardano', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 1, 'max': 4000000}}}, 
                'AUD': {'id': 'AUD', 'code': 'AUD', 'name': 'Australian Dollars', 'type': 'fiat', 'active': True, 'precision': 4, 'limits': {'deposit': {'min': 100, 'max': 50000}, 'withdraw': {'min': 100, 'max': 50000}, 'amount': {'min': 1, 'max': 4000000}}}, 
                'BCH': {'id': 'BCH', 'code': 'BCH', 'name': 'Bitcoin cash', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 0.01, 'max': 500}}}, 
                'BNB': {'id': 'BNB', 'code': 'BNB', 'name': 'Binance Coin', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 0.01, 'max': 1700}}}, 
                'BTC': {'id': 'BTC', 'code': 'BTC', 'name': 'Bitcoin', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 0.0005, 'max': 100}}}, 
                'DOGE': {'id': 'DOG', 'code': 'DOGE', 'name': 'Dogecoin', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 1, 'max': 1800000}}}, 
                'DOT': {'id': 'DOT', 'code': 'DOT', 'name': 'Polkadot', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 0.5, 'max': 100000}}}, 
                'EOS': {'id': 'EOS', 'code': 'EOS', 'name': 'EOS', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 1, 'max': 20000}}}, 
                'ETH': {'id': 'ETH', 'code': 'ETH', 'name': 'Ether', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 0.005, 'max': 1000}}}, 
                'LINK': {'id': 'LNK', 'code': 'LINK', 'name': 'Chainlink', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 0.1, 'max': 60000}}}, 
                'LTC': {'id': 'LTC', 'code': 'LTC', 'name': 'Litecoin', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 0.1, 'max': 4000}}}, 
                'UNI': {'id': 'UNI', 'code': 'UNI', 'name': 'Uniswap', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 0.1, 'max': 25000}}}, 
                'USDC': {'id': 'USC', 'code': 'USDC', 'name': 'USD Coin', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 0.01, 'max': 600000}}}, 
                'USDT': {'id': 'UST', 'code': 'USDT', 'name': 'Tether', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 0.01, 'max': 600000}}}, 
                'XLM': {'id': 'XLM', 'code': 'XLM', 'name': 'Stellar', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 100, 'max': 4000000}}}, 
                'XRP': {'id': 'XRP', 'code': 'XRP', 'name': 'Ripple', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 20, 'max': 200000}}}, 
                'XTZ': {'id': 'XTZ', 'code': 'XTZ', 'name': 'Tezos', 'type': 'crypto', 'active': True, 'precision': 4, 'limits': {'withdraw': {}, 'amount': {'min': 1, 'max': 170000}}},
                'USD': {'id': 'USD', 'code': 'USD', 'name': 'US Dollars', 'type': 'fiat', 'active': True, 'precision': 4, 'limits': {'deposit': {'min': 100, 'max': 50000}, 'withdraw': {'min': 100, 'max': 50000}, 'amount': {'min': 1, 'max': 4000000}}}, 
            },
            'markets': {
                'ADA/USD': {'limits': {'amount': {'min': 1, 'max': 4000000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'ADAUSD.SPOT', 'symbol': 'ADA/USD', 'base': 'ADA', 'quote': 'USD', 'baseId': 'ADA', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'BCH/USD': {'limits': {'amount': {'min': 0.01, 'max': 500}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'BCHUSD.SPOT', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD', 'baseId': 'BCH', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'BNB/USD': {'limits': {'amount': {'min': 0.01, 'max': 1700}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'BNBUSD.SPOT', 'symbol': 'BNB/USD', 'base': 'BNB', 'quote': 'USD', 'baseId': 'BNB', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'BTC/USD': {'limits': {'amount': {'min': 0.0005, 'max': 100}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'BTCUSD.SPOT', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'BTC', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'DOGE/USD': {'limits': {'amount': {'min': 1, 'max': 1800000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'DOGUSD.SPOT', 'symbol': 'DOGE/USD', 'base': 'DOGE', 'quote': 'USD', 'baseId': 'DOG', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'DOT/USD': {'limits': {'amount': {'min': 0.5, 'max': 100000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'DOTUSD.SPOT', 'symbol': 'DOT/USD', 'base': 'DOT', 'quote': 'USD', 'baseId': 'DOT', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'EOS/USD': {'limits': {'amount': {'min': 1, 'max': 20000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'EOSUSD.SPOT', 'symbol': 'EOS/USD', 'base': 'EOS', 'quote': 'USD', 'baseId': 'EOS', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'ETH/USD': {'limits': {'amount': {'min': 0.005, 'max': 1000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'ETHUSD.SPOT', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD', 'baseId': 'ETH', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'LINK/USD': {'limits': {'amount': {'min': 0.1, 'max': 60000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'LNKUSD.SPOT', 'symbol': 'LINK/USD', 'base': 'LINK', 'quote': 'USD', 'baseId': 'LNK', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'LTC/USD': {'limits': {'amount': {'min': 0.1, 'max': 4000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'LTCUSD.SPOT', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD', 'baseId': 'LTC', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'UNI/USD': {'limits': {'amount': {'min': 0.1, 'max': 25000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'UNIUSD.SPOT', 'symbol': 'UNI/USD', 'base': 'UNI', 'quote': 'USD', 'baseId': 'UNI', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'USDC/USD': {'limits': {'amount': {'min': 0.01, 'max': 600000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'USCUSD.SPOT', 'symbol': 'USDC/USD', 'base': 'USDC', 'quote': 'USD', 'baseId': 'USC', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'USDT/USD': {'limits': {'amount': {'min': 0.01, 'max': 600000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'USTUSD.SPOT', 'symbol': 'USDT/USD', 'base': 'USDT', 'quote': 'USD', 'baseId': 'UST', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'XLM/USD': {'limits': {'amount': {'min': 100, 'max': 4000000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'XLMUSD.SPOT', 'symbol': 'XLM/USD', 'base': 'XLM', 'quote': 'USD', 'baseId': 'XLM', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'XRP/USD': {'limits': {'amount': {'min': 20, 'max': 200000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'XRPUSD.SPOT', 'symbol': 'XRP/USD', 'base': 'XRP', 'quote': 'USD', 'baseId': 'XRP', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True}, 
                'XTZ/USD': {'limits': {'amount': {'min': 1, 'max': 170000}, 'price': {'min': 0.0001}, 'cost': {'min': 0.01, 'max': 750000}}, 'precision': {'base': 4, 'quote': 4, 'price': 4, 'amount': 4}, 'tierBased': False, 'percentage': True, 'taker': 0.002, 'maker': 0.002, 'id': 'XTZUSD.SPOT', 'symbol': 'XTZ/USD', 'base': 'XTZ', 'quote': 'USD', 'baseId': 'XTZ', 'quoteId': 'USD', 'type': 'SPOT', 'spot': True, 'margin': False, 'active': True},
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const ccys = await this.privateGetCurrency (params);
        const account_info = await this.privateGetAccountInfo (params);
        //
        // currencies endpoint
        // {
        //     "AUD": {
        //       "long_only": false,
        //       "minimum_trade_size": 0.01,
        //       "stable_coin": false,
        //       "currency_type": "fiat",
        //       "is_crypto": false,
        //       "readable_name": ""
        //     },
        //     "BCH": {
        //       "long_only": false,
        //       "minimum_trade_size": 0.01,
        //       "stable_coin": false,
        //       "currency_type": "crypto",
        //       "is_crypto": true,
        //       "readable_name": "Bitcoin cash"
        //     },
        // ...
        // Account info endpoint
        // {
        //     "max_risk_exposure": "500000",
        //     "risk_exposure": "74054.96",
        //     "currency": "USD",
        //     "btc_max_qty_per_trade": "100",
        //     "ust_max_qty_per_trade": "600000",
        //     "eth_max_qty_per_trade": "1000",
        //     "ltc_max_qty_per_trade": "4000",
        //     "bch_max_qty_per_trade": "500",
        //     "xrp_max_qty_per_trade": "200000",
        //     ...
        //   }
        const result = {};
        const keys = Object.keys (ccys);
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const code = this.safeCurrencyCode (id);
            const ccy = ccys[keys[i]];
            const name = this.safeString (ccy, 'readable_name');
            const currency_type = this.safeString (ccy, 'currency_type');
            const minTradeSize = this.safeNumber (ccy, 'minimum_trade_size');
            const maxTradeSizeKey = id.toLowerCase () + '_max_qty_per_trade';
            const maxTradeSize = this.safeNumber (account_info, maxTradeSizeKey);
            ccy[maxTradeSizeKey] = maxTradeSize; // update back into the raw info for debugging
            result[code] = {
                'info': ccy,
                'id': id,
                'code': code,
                'name': name,
                'type': currency_type,
                'active': true,
                'fee': undefined,
                'precision': 4,
                'limits': {
                    'withdraw': { 'min': undefined, 'max': undefined },
                    'amount': { 'min': minTradeSize, 'max': maxTradeSize },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        // FIXME hack to force reload currencies
        const currencies = await this.fetchCurrencies ();
        this.currencies = this.deepExtend (currencies, this.currencies);
        const response = await this.privateGetInstruments (params);
        //
        // [
        //     {
        //       "name": "LTCUSD.SPOT",
        //       "underlier": "LTCUSD",
        //       "type": "SPOT"
        //     },
        //     {
        //       "name": "BCHUSD.SPOT",
        //       "underlier": "BCHUSD",
        //       "type": "SPOT"
        //     },
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parseMarket (response[i]));
        }
        return result;
    }

    parseMarket (market) {
        // instruments endpoint
        // [
        //     {
        //       "name": "LTCUSD.SPOT",
        //       "underlier": "LTCUSD",
        //       "type": "SPOT"
        //     },
        //     {
        //       "name": "BCHUSD.SPOT",
        //       "underlier": "BCHUSD",
        //       "type": "SPOT"
        //     },
        // ...
        //
        //
        // currency object
        //
        //     result[code] = {
        //         'info': ccy,
        //         'id': id,
        //         'code': code,
        //         'name': name,
        //         'type': currency_type,
        //         'active': true,
        //         'fee': undefined,
        //         'precision': 4,
        //         'limits': {
        //             'withdraw': { 'min': undefined, 'max': undefined },
        //             'amount': { 'min': minTradeSize, 'max': maxTradeSize },
        //         },
        //     };
        // }
        const id = this.safeString (market, 'name');
        let underlier = this.safeString (market, 'underlier');
        underlier = underlier.toUpperCase ();
        const baseId = underlier.slice (0, 3); // left in underlier
        const quoteId = underlier.slice (3, 6); // right in underlier
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const type = this.safeString (market, 'type');
        let spot = false;
        let margin = false;
        if (type === 'SPOT') {
            spot = true;
        } else if (type === 'CFD') {
            margin = true;
        }
        const active = true;
        const ccyBase = this.currencies[base];
        const ccyQuote = this.currencies[quote];
        // const pricePrecision = ccyQuote['limits']['amount']['min'];
        // const amountPrecision = ccyBase['limits']['amount']['min'];
        // const precision = {
        //     'price': pricePrecision,
        //     'amount': amountPrecision,
        // };
        // FIXME - hard coded precisions
        const precision = {
            'base': 4,
            'quote': 4,
            'price': 4,
            'amount': 4,
        };
        const amountMin = ccyBase['limits']['amount']['min'];
        const amountMax = ccyBase['limits']['amount']['max'];
        const costMin = ccyQuote['limits']['amount']['min'];
        const costMax = ccyQuote['limits']['amount']['max'];
        const limits = {
            'amount': { 'min': amountMin, 'max': amountMax },
            'price': { 'min': 0.0001, 'max': undefined },
            'cost': { 'min': costMin, 'max': costMax },
        };
        // const taker = undefined; // no maker or taker fees for b2c2
        // const maker = undefined; // no maker or taker fees for b2c2
        return {
            'info': market,
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'type': type,
            'spot': spot,
            'margin': margin,
            'active': active,
            'precision': precision,
            'limits': limits,
            'tierBased': false,
            'percentage': true,
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        // {
        //     "USD": "0",
        //     "BTC": "0",
        //     "JPY": "0",
        //     "GBP": "0",
        //     "ETH": "0",
        //     "EUR": "0",
        //     "CAD": "0",
        //     "LTC": "0",
        //     "XRP": "0",
        //     "BCH": "0"
        // }
        const now = this.milliseconds ();
        const result = {
            'info': response,
            'timestamp': now,
            'datetime': this.iso8601 (now),
        };
        const assets = response;
        const keys = Object.keys (assets);
        for (let i = 0; i < keys.length; i++) {
            const balance = assets[keys[i]];
            const code = keys[i];
            const account = this.account ();
            account['free'] = balance;
            account['used'] = 0;
            account['total'] = balance;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createQuote (symbol, side, amount, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowercaseSide = side.toLowerCase ();
        const request = {
            'quantity': this.amountToPrecision (symbol, amount),
            'side': lowercaseSide,
            'instrument': market['id'],
        };
        const response = await this.privatePostRequestForQuote (this.extend (request, params));
        return this.parseQuote (response, market);
    }

    parseQuote (quote, market = undefined) {
        // {
        //     "created": "2021-08-23T07:20:39.670767Z",
        //     "valid_until": "2021-08-23T07:21:00.670772Z",
        //     "rfq_id": "75fdad8c-69a3-45c2-b6a8-dba3f701c759",
        //     "client_rfq_id": "43fa40fb-bfdd-4e1d-8978-d84ab103ab1f",
        //     "quantity": "1.0000000000",
        //     "side": "sell",
        //     "instrument": "BTCUSD.SPOT",
        //     "price": "50113.00000000"
        //   }
        const timestamp = this.parse8601 (this.safeString (quote, 'created'));
        const validUntilTimestamp = this.parse8601 (this.safeString (quote, 'valid_until'));
        const rfqId = this.safeString (quote, 'rfq_id');
        const clientRfqId = this.safeString (quote, 'client_rfq_id');
        const amount = this.safeNumber (quote, 'quantity');
        const amountString = this.safeString (quote, 'quantity');
        const type = 'quote';
        const side = this.safeStringLower (quote, 'side');
        const marketId = this.safeString (quote, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.safeNumber (quote, 'price');
        const priceString = this.safeString (quote, 'price');
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        let status = undefined;
        if (validUntilTimestamp > this.milliseconds ()) {
            status = 'open';
        } else {
            status = 'closed';
        }
        const fee = undefined;
        // this.calculateFee (symbol, type, side, amount, price, takerOrMaker); // no fees for B2C2
        if (fee !== undefined) {
            fee.cost = this.feeToPrecision (symbol, fee.cost);
        }
        return this.safeOrder ({
            'info': quote,
            'rfqId': rfqId,
            'clientRfqId': clientRfqId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'validUntilTimestamp': validUntilTimestamp,
            'timeInForce': this.iso8601 (validUntilTimestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'status': status,
            'fee': fee,
        });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // side: 'buy' | 'sell';
        // type: 'market' | 'limit';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const lowercaseSide = side.toLowerCase ();
        const lowercaseType = type.toLowerCase ();
        const request = {
            'quantity': this.amountToPrecision (symbol, amount),
            'side': lowercaseSide,
            'instrument': market['id'],
            'order_type': undefined,
        };
        if (lowercaseType === 'limit') {
            request['order_type'] = 'FOK';
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            request['order_type'] = 'MKT';
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // [
        //     {
        //         order_id: 'dbeb3cc2-68a9-4364-9d80-91de5f1f2133',
        //         client_order_id: 'eba0fc09-0f51-4298-ab88-42c70eb2ba39',
        //         instrument: 'BTCUSD.SPOT',
        //         price: '40498.00000000',
        //         executed_price: '40477.00000000',
        //         quantity: '1.0000000000',
        //         side: 'buy',
        //         order_type: 'MKT',
        //         created: '2021-05-21T06:56:31.519896Z',
        //         trades: [
        //           {
        //             trade_id: '8862acae-834c-42da-986c-b4d1618dc016',
        //             rfq_id: null,
        //             cfd_contract: null,
        //             order: 'dbeb3cc2-68a9-4364-9d80-91de5f1f2133',
        //             quantity: '1.0000000000',
        //             side: 'buy',
        //             instrument: 'BTCUSD.SPOT',
        //             price: '40477.00000000',
        //             created: '2021-05-21T06:56:31.548302Z',
        //             origin: 'screen:mobile',
        //             executing_unit: ''
        //           }
        //         ],
        //         executing_unit: ''
        //       }
        // ]
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = { 'order_id_or_client_order_id': id };
        const response = await this.privateGetOrderOrderIdOrClientOrderId (this.extend (request, params));
        return this.parseOrders (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = undefined;
        if (symbol !== undefined) {
            marketId = this.market (symbol)['id'];
        }
        // 'created__lt': undefined,
        // 'client_order_id': undefined,
        // 'order_type': undefined,
        // 'executing_unit': undefined,
        const request = {
            // 'limit': limit, # commented out to always use the default from b2c2, use their pagination links instead
        };
        if (marketId !== undefined) {
            request['instrument'] = marketId;
        }
        if (since !== undefined) {
            request['created__gte'] = this.iso8601 (since);
        }
        let response = await this.privateGetOrder (this.extend (request, params));
        response.extend (await this.fetchRecursively (limit, response.length));
        return this.parseOrders (response, undefined, since, limit);
    }

    // In Python in case the transpiler dies!

    // def fetch_recursively(self, limit=None, already_fetched=0):
    //     if limit is not None and already_fetched >= limit: return [] # stop at our limits
    //     next = self.__get_next_link()
    //     if next is None: return []
    //     response = self.request(path=next, type='private', method='GET') # get the next page
    //     response.extend(self.fetch_recursively(limit=limit, already_fetched=already_fetched+len(response)))
    //     return response

    // def __get_next_link(self):
    //     # ['<https://api.uat.b2c2.net/order/?cursor=cD0lNUIlMjIyMDIxLTA5LTI0KzA0JTNBMDElM0ExOC43NjQyODIlMkIwMCUzQTAwJTIyJTJDKyUyMjFhMzNjNjcwLTg2NjItNDk5My1iYTFjLWZiZjZmMmE1MGVkNSUyMiU1RA%3D%3D&instrument=ETHAUD.SPOT&limit=1>; rel="next"']
    //     links = self.safe_string(self.last_response_headers, 'Link')
    //     if links is not None:
    //         links = links.split(',')
    //         for link in links:
    //             if link.find('next') >= 0:
    //                 start = link.find('//') + 2
    //                 end = link.find('>')
    //                 next = link[start:end]
    //                 startsub = next.find('/') + 1
    //                 next = next[startsub:]
    //                 return next


    async fetchRecursively (limit, already_fetched) {
        if (limit !== undefined && already_fetched >= limit) {
                return []; // stop at our limits
        }
        let next = this.__get_link ();
        if (next === undefined) {
            return []; // nothing more to get
        }
        let response = this.request(path=next, type='private', method='GET'); // get the next page
        response.extend (await self.fetchRecursively (limit, already_fetched+response.length));
        return response;
    }

    __get_link () {
        // example: ['<https://api.uat.b2c2.net/order/?cursor=cD0lNUIlMjIyMDIxLTA5LTI0KzA0JTNBMDElM0ExOC43NjQyODIlMkIwMCUzQTAwJTIyJTJDKyUyMjFhMzNjNjcwLTg2NjItNDk5My1iYTFjLWZiZjZmMmE1MGVkNSUyMiU1RA%3D%3D&instrument=ETHAUD.SPOT&limit=1>; rel="next"']
        const link_header = this.safeString (this.last_response_headers, 'Link');
        if (link_header !== undefined) {
            const links = link_header.split(",");
            for (let i = 0; i < links.length; i++) {
                if (links[i].indexOf('next') >= 0) {
                    const start = links[i].indexOf('//') + 2;
                    const end = links[i].indexOf('>');
                    let next = links[i].slice(start, end);
                    const startsub = next.indexOf('/') + 1;
                    next = next.slice(startsub);
                    return next;
                }
            } 
        }
    }

    parseOrder (order, market = undefined) {
        // From fetchOrder(s)
        // [
        //     {
        //       "order_id": "373991c8-727d-4b55-94c2-eece7b81023c",
        //       "client_order_id": "fd76dbde-fdd5-40a9-9211-19eaa19653be",
        //       "instrument": "XRPUSD.SPOT",
        //       "price": "0.59525000",
        //       "executed_price": "0.59525000",
        //       "quantity": "1000.0000000000",
        //       "side": "buy",
        //       "order_type": "MKT",
        //       "created": "2021-07-23T13:36:24.885622Z",
        //       "executing_unit": ""
        //     },
        //
        // From a successful createOrder
        // {        order_id:   "e0bc5d5d-f285-42d3-aa85-6a1b76baf74c",
        // client_order_id:   "e21732d8-c62b-4922-841e-42c9e8ffdf40",
        //      instrument:   "ETHUSD.SPOT",
        //           price:    null,
        //  executed_price:   "3278.20000000",
        //        quantity:   "1.0000000000",
        //            side:   "buy",
        //      order_type:   "MKT",
        //         created:   "2021-09-13T04:55:38.095940Z",
        //  executing_unit:   "test1",
        //          trades: [ {       trade_id: "2ec7679f-8e52-4020-a1fd-44ad3b24c0b3",
        //                              rfq_id:  null,
        //                        cfd_contract:  null,
        //                               order: "e0bc5d5d-f285-42d3-aa85-6a1b76baf74c",
        //                            quantity: "1.0000000000",
        //                                side: "buy",
        //                          instrument: "ETHUSD.SPOT",
        //                               price: "3278.20000000",
        //                             created: "2021-09-13T04:55:38.101368Z",
        //                              origin: "rest",
        //                      executing_unit: "test1"                                 } ] }
        //
        const id = this.safeString (order, 'order_id');
        const clientOrderId = this.safeString (order, 'client_order_id');
        const customer_id = this.safeString (order, 'executing_unit');
        const marketId = this.safeString (order, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.safeNumber (order, 'price');
        const averagepxString = this.safeString (order, 'executed_price');
        const averagepx = this.safeNumber (order, 'executed_price');
        const amountString = this.safeString (order, 'quantity');
        const amount = this.safeNumber (order, 'quantity');
        const side = this.safeStringLower (order, 'side');
        let type = this.safeStringUpper (order, 'order_type');
        if (type === 'FOK') {
            type = 'limit';
        } else {
            type = 'market';
        }
        const timestamp = this.parse8601 (this.safeString (order, 'created'));
        let filled = undefined;
        let status = undefined;
        let cost = undefined;
        let remaining = undefined;
        const takerOrMaker = 'taker';
        const fee = undefined;
        if (averagepx !== undefined) {
            status = 'closed';
            filled = amount;
            cost = this.parseNumber (Precise.stringMul (averagepxString, amountString));
            // fee = this.calculateFee (symbol, type, side, filled, averagepx, takerOrMaker); // no fees for B2C2
            if (fee !== undefined) {
                fee.cost = this.feeToPrecision (symbol, fee.cost);
            }
        } else {
            status = 'canceled';
            remaining = amount;
        }
        const rawTrades = this.safeValue (order, 'trades', []);
        let trades = undefined;
        const tradeParams = {
            'clientOrderId': clientOrderId,
            'type': type,
            'takerOrMaker': takerOrMaker,
        };
        if (rawTrades !== undefined) {
            trades = this.parseTrades (rawTrades, market, undefined, undefined, tradeParams);
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'customer_id': customer_id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': averagepx,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        });
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // 'created__gte': undefined,
        // 'created__lt': undefined,
        // 'since': undefined, // need to map to markets
        // 'ordering': undefined, // asc or desc, default desc
        // 'executing_unit': undefined,
        const request = {
            // 'limit': limit, // using pagination instead
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument'] = market['id'];
        }
        if (since !== undefined) {
            request['since'] = this.iso8601 (since);
        }
        let response = await this.privateGetTrade (this.extend (request, params));
        response.extend (await this.fetchRecursively (limit, response.length));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // When returned as part of the order object
        // {        order_id:   "e0bc5d5d-f285-42d3-aa85-6a1b76baf74c",
        // client_order_id:   "e21732d8-c62b-4922-841e-42c9e8ffdf40",
        //      instrument:   "ETHUSD.SPOT",
        //           price:    null,
        //  executed_price:   "3278.20000000",
        //        quantity:   "1.0000000000",
        //            side:   "buy",
        //      order_type:   "MKT",
        //         created:   "2021-09-13T04:55:38.095940Z",
        //  executing_unit:   "test1",
        //          trades: [ {       trade_id: "2ec7679f-8e52-4020-a1fd-44ad3b24c0b3",
        //                              rfq_id:  null,
        //                        cfd_contract:  null,
        //                               order: "e0bc5d5d-f285-42d3-aa85-6a1b76baf74c",
        //                            quantity: "1.0000000000",
        //                                side: "buy",
        //                          instrument: "ETHUSD.SPOT",
        //                               price: "3278.20000000",
        //                             created: "2021-09-13T04:55:38.101368Z",
        //                              origin: "rest",
        //                      executing_unit: "test1"                                 } ] }
        //
        // When returnes from fetchmytrades
        // {"trade_id":"2ec7679f-8e52-4020-a1fd-44ad3b24c0b3",
        // "rfq_id":null,
        // "order":"e0bc5d5d-f285-42d3-aa85-6a1b76baf74c",
        // "quantity":"1.0000000000",
        // "side":"buy",
        // "instrument":"ETHUSD.SPOT",
        // "price":"3278.20000000",
        // "created":"2021-09-13T04:55:38.101368Z",
        // "end_client_id":"",
        // "client_rfq_id":null,
        // "client_order_id":"e21732d8-c62b-4922-841e-42c9e8ffdf40",
        // "user":"Demo_Leonie",
        // "origin":"rest",
        // "executing_unit":"test1"},
        //
        const id = this.safeString (trade, 'trade_id');
        const amountString = this.safeString (trade, 'quantity');
        const amount = this.parseNumber (amountString);
        const side = this.safeStringLower (trade, 'side');
        const marketId = this.safeString (trade, 'instrument');
        const symbol = this.safeSymbol (marketId, market);
        const priceString = this.safeString (trade, 'price');
        const price = this.parseNumber (priceString);
        const timestamp = this.parse8601 (this.safeString (trade, 'created'));
        const orderId = this.safeString (trade, 'order');
        const clientOrderId = this.safeString (trade, 'client_order_id'); // parent order must provide in params override
        const customer_id = this.safeString (trade, 'executing_unit');
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const type = this.safeString (trade, 'type'); // parent order must provide in params override
        const takerOrMaker = this.safeString (trade, 'takerOrMaker'); // parent order must provide in params override
        const fee = undefined;
        // this.calculateFee (symbol, type, side, amount, price, takerOrMaker); // no fees for B2C2
        if (fee !== undefined) {
            fee.cost = this.feeToPrecision (symbol, fee.cost);
        }
        return {
            'info': trade,
            'id': id,
            'customer_id': customer_id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'clientOrderId': clientOrderId,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        };
    }

    parseLedgerEntryType (type) {
        // Currently four types of ledgers are possible:
        // trade (ledger resulting of a trade, there are two ledgers per trade)
        // transfer (either you sent funds to B2C2, or B2C2 sent you funds)
        // funding (funding rate charged for your open positions if you have some, CFD only)
        // realised_pnl (Realised P&L, CFD only)
        const types = {
            'transfer': 'transaction',
            'funding': 'funding',
            'realised_pnl': 'margin',
            'trade': 'trade',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        // [
        //     {
        //       "transaction_id": "3b8c41be-1bae-45aa-a6fb-86fce3ebef85",
        //       "created": "2021-07-23T13:36:24.889949Z",
        //       "reference": "57912eaf-02dc-461f-ad0d-8c636c01c997",
        //       "currency": "USD",
        //       "amount": "-595.2500000000000000",
        //       "type": "trade",
        //       "group": "trading"
        //     },
        //     {
        //       "transaction_id": "cd92a3d5-a782-4bb2-86b2-815d76667658",
        //       "created": "2021-07-23T13:36:24.889949Z",
        //       "reference": "57912eaf-02dc-461f-ad0d-8c636c01c997",
        //       "currency": "XRP",
        //       "amount": "1000.0000000000000000",
        //       "type": "trade",
        //       "group": "trading"
        //     },
        const id = this.safeString (item, 'transaction_id');
        const timestamp = this.parse8601 (this.safeString (item, 'created'));
        const referenceId = this.safeString (item, 'reference');
        const currencyId = this.safeString (item, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency); // not sure why we need the currency param?!
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const account = this.safeString (item, 'group');
        let amount = this.safeNumber (item, 'amount');
        let direction = undefined;
        if (amount < 0) {
            direction = 'out';
            amount = Math.abs (amount);
        } else {
            direction = 'in';
        }
        // const status = this.parseTransactionStatus (this.safeString (item, 'transactStatus'));
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'status': 'settled',
            'fee': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        // We don't need to put these in request, python sends
        // 'created__lt': undefined,
        // 'type': undefined,
        const request = {
            // 'limit': limit, // using pagination instead
        };
        if (since !== undefined) {
            request['since'] = since;
            request['created__gte'] = since;
        }
        if (currency !== undefined) {
            request['currency'] = currency['code'];
        }
        let response = await this.privateGetLedger (this.extend (request, params));
        response.extend (await this.fetchRecursively (limit, response.length));
        return this.parseLedger (response, currency, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        // Request a settlement for a given amount to the given destination in a given currency.
        // Your account must exhibit a sufficient balance in the requested currency.
        // Note that for non approved addresses, the amount can only be lower than 0.1.
        // The address_protocol parameter is either “Omni” or “ERC20” and only used for UST settlement requests.
        // For other currencies, leave null. The address_suffix is the memo or the tag of the address as entered on the website.
        // post_data = {
        //     'amount': '1000',
        //     'currency': 'XRP',
        //     'destination_address': {
        //         'address_value': 'rUQngTebGgF1tCexhuPaQBr5MufweybMom',
        //         'address_suffix': 'tag0',
        //         'address_protocol': None
        //     }
        // }
        // Fiat withdrawal
        // post_data = {
        //     'amount': '1000',
        //     'currency': 'USD',
        //     'destination_bank_account': 'USD Bank Account'
        // }
        // Response:
        // {
        //     "amount": "1000.00000000",
        //     "currency": "XRP",
        //     "withdrawal_id": "5c7e90cc-a8d6-4db5-8348-44053b2dcbdf",
        //     "reference": "",
        //     "settled": false,
        //     "created": "2021-06-09T09:46:00.162599Z",
        //     "destination_address": {
        //       "address_value": "rUQngTebGgF1tCexhuPaQBr5MufweybMom",
        //       "address_suffix": "tag0",
        //       "address_protocol": null
        //     },
        //     "destination_bank_account": null
        //   }
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'amount': amount,
            'currency': currency['id'],
        };
        const dest = {
            'address_value': address,
        };
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        if (currency === 'UST') {
            request['address_protocol'] = 'ERC20';
        }
        request['destination_address'] = dest;
        const response = await this.privatePostWithdrawal (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'withdrawal_id'),
        };
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = undefined;
        const request = {
            // 'limit': limit, // using pagination instead
        };
        let response = await this.privateGetWithdrawal (this.extend (request, params));
        response.extend (await this.fetchRecursively (limit, response.length));
        return this.parseWithdrawals (response, currency, since, limit);
    }

    parseWithdrawal (transaction, currency = undefined) {
        // [
        //     {
        //       "amount": "2.00000000",
        //       "currency": "BTC",
        //       "destination_address": "0xC323E80eF4deC2195G239F4f1e830417D294F841",
        //       "destination_bank_account": null,
        //       "reference": "",
        //       "settled": false,
        //       "created": "2021-06-09T09:46:00.162599Z",
        //       "withdrawal_id": "ed846746-f7e0-4af9-85bb-36732e60d6d8"
        //     },
        //     {
        //       "amount": "10.00000000",
        //       "currency": "BTC",
        //       "destination_address": null,
        //       "destination_bank_account": "EUR BA",
        //       "reference": "",
        //       "settled": true,
        //       "created": "2021-06-09T09:46:00.162599Z",
        //       "withdrawal_id": "b4426ff2-19c6-48ca-8b07-2c344dc34ecb"
        //     }
        //   ]
        const amount = this.safeNumber (transaction, 'amount');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const address = this.safeString (transaction, 'destination_address');
        const updated = undefined;
        let tag = this.safeString (transaction, 'reference'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let status = 'pending';
        if (transaction['settled'] === true) {
            status = 'settled';
        }
        const timestamp = this.parse8601 (this.safeString (transaction, 'applyTime'));
        const id = this.safeString (transaction, 'withdrawal_id');
        return {
            'info': transaction,
            'id': id,
            'txid': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': 'withdrawal',
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'internal': false,
            'fee': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api'][api]) + '/';
        url += this.implodeParams (path, params);
        if (api === 'private') {
            if (method === 'GET') {
                headers = {
                    'Authorization': 'Token ' + this.apiKey,
                };
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (method === 'POST') {
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + this.apiKey,
                };
                if (Object.keys (params).length) {
                    body = this.json (query);
                }
            }
        }
        const r = { 'url': url, 'method': method, 'body': body, 'headers': headers };
        return r;
    }
};
