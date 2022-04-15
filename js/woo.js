'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, RateLimitExceeded, BadRequest, ExchangeError, InvalidOrder } = require ('./base/errors');
const Precise = require ('./base/Precise');
const { TICK_SIZE } = require ('./base/functions/number');

// ---------------------------------------------------------------------------

module.exports = class woo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'woo',
            'name': 'WOO X',
            'countries': [ 'KY' ], // Cayman Islands
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
            'hostname': 'woo.org',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelWithdraw': false, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/wootrade-documents/#cancel-withdraw-request
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': true,
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'withdraw': false, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/wootrade-documents/#token-withdraw
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1mon',
                '1y': '1y',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg',
                'api': {
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                // TEST (stating) api ( https://support.woo.org/hc/en-001/articles/4406352945305--Institutional-Account-Welcome-Packet-V-2) doesn't work at this moment, even thou
                // 'test': {
                //     'public': 'http://api.staging.woo.org',
                //     'private': 'http://api.staging.woo.org',
                // },
                'www': 'https://woo.org/',
                'doc': [
                    'https://docs.woo.org/',
                ],
                'fees': [
                    'https://support.woo.org/hc/en-001/articles/4404611795353--Trading-Fees',
                ],
                'referral': 'https://referral.woo.org/BAJS6oNmZb3vi3RGA',
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'info': 1,
                            'info/{symbol}': 1,
                            'market_trades': 1,
                            'token': 1,
                            'token_network': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'client/token': 1,
                            'order/{oid}': 1,
                            'client/order/{client_order_id}': 1,
                            'orders': 1,
                            'orderbook/{symbol}': 1,
                            'kline': 1,
                            'client/trade/{tid}': 1,
                            'order/{oid}/trades': 1,
                            'client/trades': 1,
                            'client/info': 60,
                            'asset/deposit': 120,
                            'asset/history': 60,
                            'token_interest': 60,
                            'token_interest/{token}': 60,
                            'interest/history': 60,
                            'interest/repay': 60,
                        },
                        'post': {
                            'order': 5, // 2 requests per 1 second per symbol
                            'asset/withdraw': 120,  // implemented in ccxt, disabled on the exchange side https://kronosresearch.github.io/wootrade-documents/#token-withdraw
                        },
                        'delete': {
                            'order': 1,
                            'client/order': 1,
                            'orders': 1,
                            'asset/withdraw': 120,  // implemented in ccxt, disabled on the exchange side https://kronosresearch.github.io/wootrade-documents/#cancel-withdraw-request
                        },
                    },
                },
                'v2': {
                    'private': {
                        'get': {
                            'client/holding': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0005'),
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'network-aliases': {
                    'ALGO': 'ALGO',
                    'ATOM': 'ATOM',
                    'AVAXC': 'AVAXC',
                    'BNB': 'BEP2',
                    'BSC': 'BEP20',
                    'BTC': 'BTC',
                    'BCHSV': 'BSV',
                    'EOS': 'EOS',
                    'ETH': 'ERC20',
                    'HECO': 'HRC20',
                    'MATIC': 'POLYGON',
                    'ONT': 'ONT',
                    'SOL': 'SPL',
                    'TERRA': 'TERRA',
                    'TRON': 'TRC20',
                },
                // network-aliases for titles are removed (just in case, if needed: pastebin.com/raw/BvgKViPN )
                'network-aliases-for-protocol': {
                    'ALGO': 'ALGO',
                    'ATOM': 'ATOM',
                    'C Chain': 'AVAXC',
                    'BEP2': 'BEP2',
                    'BEP20': 'BEP20',
                    'BTC': 'BTC',
                    'BSV': 'BSV',
                    'EOS': 'EOS',
                    'ERC20': 'ERC20',
                    'HECO': 'HRC20',
                    'Polygon': 'POLYGON',
                    'ONT': 'ONT',
                    'SOL': 'SPL',
                    'TERRA': 'TERRA',
                    'TRON': 'TRC20',
                },
                // these network aliases require manual mapping here
                'network-aliases-for-tokens': {
                    'HT': 'ERC20',
                    'OMG': 'ERC20',
                    'UATOM': 'ATOM',
                    'ZRX': 'ZRX',
                },
                'defaultNetworkCodePriorities': [
                    'TRC20',
                    'ERC20',
                    'BSC20',
                ],
                // override defaultNetworkCodePriorities for a specific currency
                'defaultNetworkCodeForCurrencies': {
                    // 'USDT': 'TRC20',
                    // 'BTC': 'BTC',
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    '-1000': ExchangeError, // { "code": -1000,  "message": "An unknown error occurred while processing the request" }
                    '-1001': AuthenticationError, // { "code": -1001,  "message": "The api key or secret is in wrong format" }
                    '-1002': AuthenticationError, // { "code": -1002,  "message": "API key or secret is invalid, it may because key have insufficient permission or the key is expired/revoked." }
                    '-1003': RateLimitExceeded, // { "code": -1003,  "message": "Rate limit exceed." }
                    '-1004': BadRequest, // { "code": -1004,  "message": "An unknown parameter was sent." }
                    '-1005': BadRequest, // { "code": -1005,  "message": "Some parameters are in wrong format for api." }
                    '-1006': BadRequest, // { "code": -1006,  "message": "The data is not found in server." }
                    '-1007': BadRequest, // { "code": -1007,  "message": "The data is already exists or your request is duplicated." }
                    '-1008': InvalidOrder, // { "code": -1008,  "message": "The quantity of settlement is too high than you can request." }
                    '-1009': BadRequest, // { "code": -1009,  "message": "Can not request withdrawal settlement, you need to deposit other arrears first." }
                    '-1011': ExchangeError, // { "code": -1011,  "message": "Can not place/cancel orders, it may because internal network error. Please try again in a few seconds." }
                    '-1012': BadRequest, // { "code": -1012,  "message": "Amount is required for buy market orders when margin disabled."}  The place/cancel order request is rejected by internal module, it may because the account is in liquidation or other internal errors. Please try again in a few seconds." }
                    '-1101': InvalidOrder, // { "code": -1101,  "message": "The risk exposure for client is too high, it may cause by sending too big order or the leverage is too low. please refer to client info to check the current exposure." }
                    '-1102': InvalidOrder, // { "code": -1102,  "message": "The order value (price * size) is too small." }
                    '-1103': InvalidOrder, // { "code": -1103,  "message": "The order price is not following the tick size rule for the symbol." }
                    '-1104': InvalidOrder, // { "code": -1104,  "message": "The order quantity is not following the step size rule for the symbol." }
                    '-1105': InvalidOrder, // { "code": -1105,  "message": "Price is X% too high or X% too low from the mid price." }
                },
                'broad': {
                    'symbol must not be blank': BadRequest, // when sending 'cancelOrder' without symbol [-1005]
                    'The token is not supported': BadRequest, // when getting incorrect token's deposit address [-1005]
                    'Your order and symbol are not valid or already canceled': BadRequest, // actual response whensending 'cancelOrder' for already canceled id [-1006]
                    'Insufficient WOO. Please enable margin trading for leverage trading': BadRequest, // when selling insufficent token [-1012]
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchMarkets', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PublicGetInfo',
        });
        const response = await this[method] (query);
        //
        // {
        //     rows: [
        //         {
        //             symbol: "SPOT_AAVE_USDT",
        //             quote_min: 0,
        //             quote_max: 100000,
        //             quote_tick: 0.01,
        //             base_min: 0.01,
        //             base_max: 7284,
        //             base_tick: 0.0001,
        //             min_notional: 10,
        //             price_range: 0.1,
        //             created_time: "0",
        //             updated_time: "1639107647.988",
        //             is_stable: 0
        //         },
        //         ...
        //     success: true
        // }
        //
        const data = this.safeValue (response, 'rows', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const marketId = this.safeString (market, 'symbol');
            const parts = marketId.split ('_');
            const marketTypeVal = this.safeStringLower (parts, 0);
            const isSpot = marketTypeVal === 'spot';
            const isSwap = false;
            const isFuture = false;
            const isOption = false;
            const baseId = this.safeString (parts, 1);
            const quoteId = this.safeString (parts, 2);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const minQuote = this.safeNumber (market, 'quote_min');
            const maxQuote = this.safeNumber (market, 'quote_max');
            const minBase = this.safeNumber (market, 'base_min');
            const maxBase = this.safeNumber (market, 'base_max');
            const priceScale = this.safeNumber (market, 'quote_tick');
            const quantityScale = this.safeNumber (market, 'base_tick');
            const minCost = this.safeNumber (market, 'min_notional');
            result.push ({
                'id': marketId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': marketTypeVal,
                'spot': isSpot,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': isSwap || isFuture || isOption,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': quantityScale,
                    'price': priceScale,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minBase,
                        'max': maxBase,
                    },
                    'price': {
                        'min': minQuote,
                        'max': maxQuote,
                    },
                    'cost': {
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTrades', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PublicGetMarketTrades',
        });
        const response = await this[method] (this.extend (request, query));
        //
        // {
        //     success: true,
        //     rows: [
        //         {
        //             symbol: "SPOT_BTC_USDT",
        //             side: "SELL",
        //             executed_price: 46222.35,
        //             executed_quantity: 0.0012,
        //             executed_timestamp: "1641241162.329"
        //         },
        //         {
        //             symbol: "SPOT_BTC_USDT",
        //             side: "SELL",
        //             executed_price: 46222.35,
        //             executed_quantity: 0.0012,
        //             executed_timestamp: "1641241162.329"
        //         },
        //         {
        //             symbol: "SPOT_BTC_USDT",
        //             side: "BUY",
        //             executed_price: 46224.32,
        //             executed_quantity: 0.00039,
        //             executed_timestamp: "1641241162.287"
        //         },
        //         ...
        //      ]
        // }
        //
        const resultResponse = this.safeValue (response, 'rows', {});
        return this.parseTrades (resultResponse, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public/market_trades
        //
        //     {
        //         symbol: "SPOT_BTC_USDT",
        //         side: "SELL",
        //         executed_price: 46222.35,
        //         executed_quantity: 0.0012,
        //         executed_timestamp: "1641241162.329"
        //     }
        //
        // fetchOrderTrades, fetchOrder
        //
        //     {
        //         id: '99119876',
        //         symbol: 'SPOT_WOO_USDT',
        //         fee: '0.0024',
        //         side: 'BUY',
        //         executed_timestamp: '1641481113.084',
        //         order_id: '87001234',
        //         order_tag: 'default', <-- this param only in "fetchOrderTrades"
        //         executed_price: '1',
        //         executed_quantity: '12',
        //         fee_asset: 'WOO',
        //         is_maker: '1'
        //     }
        //
        const isFromFetchOrder = ('id' in trade);
        const timestamp = this.safeTimestamp (trade, 'executed_timestamp');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'executed_price');
        const amount = this.safeString (trade, 'executed_quantity');
        const order_id = this.safeString (trade, 'order_id');
        const fee = this.parseTokenAndFeeTemp (trade, 'fee_asset', 'fee');
        const cost = Precise.stringMul (price, amount);
        const side = this.safeStringLower (trade, 'side');
        let id = this.safeString (trade, 'id');
        if (id === undefined) { // reconstruct artificially, if it doesn't exist
            if (timestamp !== undefined) {
                const amountStr = (amount === undefined) ? '' : amount;
                const sideStr = (side === undefined) ? '' : side;
                const priceStr = (price === undefined) ? '' : price;
                const marketIdStr = this.safeString (market, 'id', '');
                id = this.numberToString (timestamp) + '-' + marketIdStr + '-' + sideStr + '-' + amountStr + '-' + priceStr;
            }
        }
        let takerOrMaker = undefined;
        if (isFromFetchOrder) {
            const isMaker = this.safeString (trade, 'is_maker') === '1';
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': order_id,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    parseTokenAndFeeTemp (item, feeTokenKey, feeAmountKey) {
        const feeCost = this.safeString (item, feeAmountKey);
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (item, feeTokenKey);
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return fee;
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.v1PrivateGetClientInfo (params);
        //
        //     {
        //         "application":{
        //             "id":45585,
        //             "leverage":3.00,
        //             "otpauth":false,
        //             "alias":"email@address.com",
        //             "application_id":"c2cc4d74-c8cb-4e10-84db-af2089b8c68a",
        //             "account":"email@address.com",
        //             "account_mode":"PURE_SPOT",
        //             "taker_fee_rate":5.00,
        //             "maker_fee_rate":2.00,
        //             "interest_rate":0.00,
        //             "futures_leverage":1.00,
        //             "futures_taker_fee_rate":5.00,
        //             "futures_maker_fee_rate":2.00
        //         },
        //         "margin_rate":1000,
        //         "success":true
        //     }
        //
        const application = this.safeValue (response, 'application', {});
        const maker = this.safeString (application, 'maker_fee_rate');
        const taker = this.safeString (application, 'taker_fee_rate');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': this.parseNumber (Precise.stringDiv (maker, '10000')),
                'taker': this.parseNumber (Precise.stringDiv (taker, '10000')),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let method = undefined;
        const result = {};
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchCurrencies', undefined, params);
        method = this.getSupportedMapping (marketType, {
            'spot': 'v1PublicGetToken',
        });
        const tokenResponse = await this[method] (query);
        //
        // {
        //     rows: [
        //         {
        //             token: "ETH_USDT",
        //             fullname: "Tether",
        //             decimals: 6,
        //             balance_token: "USDT",
        //             created_time: "0",
        //             updated_time: "0"
        //         },
        //         {
        //             token: "BSC_USDT",
        //             fullname: "Tether",
        //             decimals: 18,
        //             balance_token: "USDT",
        //             created_time: "0",
        //             updated_time: "0"
        //         },
        //         {
        //             token: "ZEC",
        //             fullname: "ZCash",
        //             decimals: 8,
        //             balance_token: "ZEC",
        //             created_time: "0",
        //             updated_time: "0"
        //         },
        //         ...
        //     ],
        //     success: true
        // }
        //
        method = this.getSupportedMapping (marketType, {
            'spot': 'v1PublicGetTokenNetwork',
        });
        const tokenNetworkResponse = await this[method] (query);
        //
        // {
        //     rows: [
        //         {
        //             protocol: "ERC20",
        //             token: "USDT",
        //             name: "Ethereum",
        //             minimum_withdrawal: 30,
        //             withdrawal_fee: 25,
        //             allow_deposit: 1,
        //             allow_withdraw: 1
        //         },
        //         {
        //             protocol: "TRC20",
        //             token: "USDT",
        //             name: "Tron",
        //             minimum_withdrawal: 30,
        //             withdrawal_fee: 1,
        //             allow_deposit: 1,
        //             allow_withdraw: 1
        //         },
        //         ...
        //     ],
        //     success: true
        // }
        //
        const tokenRows = this.safeValue (tokenResponse, 'rows', []);
        const tokenNetworkRows = this.safeValue (tokenNetworkResponse, 'rows', []);
        const networksByCurrencyId = this.groupBy (tokenNetworkRows, 'token');
        for (let i = 0; i < tokenRows.length; i++) {
            const currency = tokenRows[i];
            const id = this.safeString (currency, 'balance_token');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'fullname');
            const decimals = this.safeInteger (currency, 'decimals');
            const chainedTokenCode = this.safeString (currency, 'token');
            const parts = chainedTokenCode.split ('_');
            const chainNameId = this.safeString (parts, 0, chainedTokenCode);
            const chainCode = this.safeString (this.options['network-aliases'], chainNameId, chainNameId);
            if (!(code in result)) {
                const networks = this.safeValue (networksByCurrencyId, id, []);
                const resultingNetworks = {};
                for (let j = 0; j < networks.length; j++) {
                    const networkEntry = networks[j];
                    const networkId = this.safeString (networkEntry, 'protocol');
                    const networkIdManualMatched = this.safeString (this.options['network-aliases-for-tokens'], networkId, networkId);
                    const networkCode = this.safeString2 (this.options['network-aliases-for-protocol'], chainNameId, chainNameId, networkIdManualMatched);
                    const depositEnabled = this.safeInteger (networkEntry, 'allow_deposit', 0);
                    const withdrawEnabled = this.safeInteger (networkEntry, 'allow_withdraw', 0);
                    resultingNetworks[networkCode] = {
                        'id': networkId,
                        'network': networkCode,
                        'limits': {
                            'withdraw': {
                                'min': this.safeNumber (networkEntry, 'minimum_withdrawal'),
                                'max': undefined,
                            },
                            'deposit': {
                                'min': undefined,
                                'max': undefined,
                            },
                        },
                        'active': undefined,
                        'deposit': depositEnabled,
                        'withdraw': withdrawEnabled,
                        'fee': this.safeNumber (networkEntry, 'withdrawal_fee'),
                        'precision': undefined, // will be filled down below
                        'info': networkEntry,
                    };
                }
                const networksKeys = Object.keys (resultingNetworks);
                const firstNetworkKey = networksKeys[0];
                const networkLength = networksKeys.length;
                result[code] = {
                    'id': id,
                    'name': name,
                    'code': code,
                    'precision': (networkLength === 1) ? decimals : undefined, // will be filled down below
                    'active': undefined,
                    'fee': (networkLength === 1) ? resultingNetworks[firstNetworkKey]['fee'] : undefined,
                    'networks': resultingNetworks,
                    'limits': {
                        'deposit': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': (networkLength === 1) ? resultingNetworks[firstNetworkKey]['limits']['withdraw']['min'] : undefined,
                            'max': undefined,
                        },
                    },
                    'info': {}, // will be filled down below
                };
            }
            const networkKeys = Object.keys (result[code]['networks']);
            const firstNetworkKey = this.safeString (networkKeys, 0);
            // now add the precision info from token-object
            if (chainCode in result[code]['networks']) {
                result[code]['networks'][chainCode]['precision'] = decimals;
            } else {
                // else chainCode will be the only token slug, which has only 1 supported network
                result[code]['networks'][firstNetworkKey]['precision'] = decimals;
            }
            // now add the info object specifically for the item
            result[code]['info'][chainedTokenCode] = currency;
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'order_type': type.toUpperCase (),
            'side': side.toUpperCase (),
        };
        if (price !== undefined) {
            request['order_price'] = this.priceToPrecision (symbol, price);
        }
        if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                const cost = this.safeNumber (params, 'cost');
                if (this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true)) {
                    if (cost === undefined) {
                        if (price === undefined) {
                            throw new InvalidOrder (this.id + " createOrder() requires the price argument for market buy orders to calculate total order cost. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or alternatively, supply the total cost value in the 'order_amount' in  exchange-specific parameters");
                        } else {
                            request['order_amount'] = this.costToPrecision (symbol, amount * price);
                        }
                    } else {
                        request['order_amount'] = this.costToPrecision (symbol, cost);
                    }
                }
            } else {
                request['order_quantity'] = this.amountToPrecision (symbol, amount);
            }
        } else {
            request['order_quantity'] = this.amountToPrecision (symbol, amount);
        }
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        params = this.omit (params, [ 'clOrdID', 'clientOrderId' ]);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PrivatePostOrder',
        });
        const response = await this[method] (this.extend (request, query));
        // {
        //     success: true,
        //     timestamp: '1641383206.489',
        //     order_id: '86980774',
        //     order_type: 'LIMIT',
        //     order_price: '1', // null for 'MARKET' order
        //     order_quantity: '12', // null for 'MARKET' order
        //     order_amount: null, // NOT-null for 'MARKET' order
        //     client_order_id: '0'
        // }
        return this.extend (
            this.parseOrder (response, market),
            { 'type': type }
        );
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request = undefined;
        const clientOrderIdUnified = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        const clientOrderIdExchangeSpecific = this.safeString2 (params, 'client_order_id', clientOrderIdUnified);
        const isByClientOrder = clientOrderIdExchangeSpecific !== undefined;
        if (isByClientOrder) {
            request['client_order_id'] = clientOrderIdExchangeSpecific;
            params = this.omit (params, [ 'clOrdID', 'clientOrderId', 'client_order_id' ]);
        } else {
            request['order_id'] = id;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        request['symbol'] = market['id'];
        const [ marketType, query ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PrivateDeleteOrder',
        });
        const response = await this[method] (this.extend (request, query));
        //
        // { success: true, status: 'CANCEL_SENT' }
        //
        const extendParams = { 'symbol': symbol };
        if (isByClientOrder) {
            extendParams['client_order_id'] = clientOrderIdExchangeSpecific;
        } else {
            extendParams['id'] = id;
        }
        return this.extend (this.parseOrder (response), extendParams);
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' canelOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('cancelOrders', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PrivateDeleteOrders',
        });
        const response = await this[method] (this.extend (request, query));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const request = {};
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        let chosenSpotMethod = undefined;
        if (clientOrderId) {
            chosenSpotMethod = 'v1PrivateGetClientOrderClientOrderId';
            request['client_order_id'] = clientOrderId;
        } else {
            chosenSpotMethod = 'v1PrivateGetOrderOid';
            request['oid'] = id;
        }
        const method = this.getSupportedMapping (marketType, {
            'spot': chosenSpotMethod,
        });
        const response = await this[method] (this.extend (request, query));
        //
        // {
        //     success: true,
        //     symbol: 'SPOT_WOO_USDT',
        //     status: 'FILLED', // FILLED, NEW
        //     side: 'BUY',
        //     created_time: '1641480933.000',
        //     order_id: '87541111',
        //     order_tag: 'default',
        //     price: '1',
        //     type: 'LIMIT',
        //     quantity: '12',
        //     amount: null,
        //     visible: '12',
        //     executed: '12', // or any partial amount
        //     total_fee: '0.0024',
        //     fee_asset: 'WOO',
        //     client_order_id: null,
        //     average_executed_price: '1',
        //     Transactions: [
        //       {
        //         id: '99111647',
        //         symbol: 'SPOT_WOO_USDT',
        //         fee: '0.0024',
        //         side: 'BUY',
        //         executed_timestamp: '1641482113.084',
        //         order_id: '87541111',
        //         executed_price: '1',
        //         executed_quantity: '12',
        //         fee_asset: 'WOO',
        //         is_maker: '1'
        //       }
        //     ]
        // }
        //
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PrivateGetOrders',
        });
        const response = await this[method] (this.extend (request, query));
        const data = this.safeValue (response, 'rows');
        return this.parseOrders (data, market, since, limit, params);
    }

    parseOrder (order, market = undefined) {
        //
        // Possible input functions:
        // * createOrder
        // * cancelOrder
        // * fetchOrder
        // * fetchOrders
        // const isFromFetchOrder = ('order_tag' in order); TO_DO
        const timestamp = this.safeTimestamp2 (order, 'timestamp', 'created_time');
        const orderId = this.safeInteger (order, 'order_id');
        const clientOrderId = this.safeTimestamp (order, 'client_order_id'); // Somehow, this always returns 0 for limit order
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString2 (order, 'order_price', 'price');
        const amount = this.safeString2 (order, 'order_quantity', 'quantity'); // This is base amount
        const cost = this.safeString2 (order, 'order_amount', 'amount'); // This is quote amount
        const orderType = this.safeStringLower2 (order, 'order_type', 'type');
        const status = this.safeValue (order, 'status');
        const side = this.safeStringLower2 (order, 'side');
        const filled = this.safeValue (order, 'executed');
        const remaining = Precise.stringSub (cost, filled);
        const fee = this.safeValue (order, 'total_fee');
        const feeCurrency = this.safeString (order, 'fee_asset');
        const transactions = this.safeValue (order, 'Transactions');
        return this.safeOrder ({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus (status),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined, // TO_DO
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining, // TO_DO
            'cost': cost,
            'trades': transactions,
            'fee': {
                'cost': fee,
                'currency': feeCurrency,
            },
            'info': order,
        }, market);
    }

    parseOrderStatus (status) {
        if (status !== undefined) {
            const statuses = {
                'NEW': 'open',
                'FILLED': 'closed',
                'CANCEL_SENT': 'canceled',
                'CANCEL_ALL_SENT': 'canceled',
            };
            return this.safeString (statuses, status, status);
        }
        return status;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            limit = Math.min (limit, 1000);
            request['max_level'] = limit;
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrderBook', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PrivateGetOrderbookSymbol',
        });
        const response = await this[method] (this.extend (request, query));
        //
        // {
        //   success: true,
        //   timestamp: '1641562961192',
        //   asks: [
        //     { price: '0.921', quantity: '76.01' },
        //     { price: '0.933', quantity: '477.10' },
        //     ...
        //   ],
        //   bids: [
        //     { price: '0.940', quantity: '13502.47' },
        //     { price: '0.932', quantity: '43.91' },
        //     ...
        //   ]
        // }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOHLCV', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PrivateGetKline',
        });
        const response = await this[method] (this.extend (request, query));
        // {
        //     success: true,
        //     rows: [
        //       {
        //         open: '0.94238',
        //         close: '0.94271',
        //         low: '0.94238',
        //         high: '0.94296',
        //         volume: '73.55',
        //         amount: '69.32040520',
        //         symbol: 'SPOT_WOO_USDT',
        //         type: '1m',
        //         start_timestamp: '1641584700000',
        //         end_timestamp: '1641584760000'
        //       },
        //       {
        //         open: '0.94186',
        //         close: '0.94186',
        //         low: '0.94186',
        //         high: '0.94186',
        //         volume: '64.00',
        //         amount: '60.27904000',
        //         symbol: 'SPOT_WOO_USDT',
        //         type: '1m',
        //         start_timestamp: '1641584640000',
        //         end_timestamp: '1641584700000'
        //       },
        //       ...
        //     ]
        // }
        const data = this.safeValue (response, 'rows', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        // example response in fetchOHLCV
        return [
            this.safeInteger (ohlcv, 'start_timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'oid': id,
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrderTrades', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PrivateGetOrderOidTrades',
        });
        const response = await this[method] (this.extend (request, query));
        // {
        //     success: true,
        //     rows: [
        //       {
        //         id: '99111647',
        //         symbol: 'SPOT_WOO_USDT',
        //         fee: '0.0024',
        //         side: 'BUY',
        //         executed_timestamp: '1641482113.084',
        //         order_id: '87541111',
        //         order_tag: 'default',
        //         executed_price: '1',
        //         executed_quantity: '12',
        //         fee_asset: 'WOO',
        //         is_maker: '1'
        //       }
        //     ]
        // }
        const trades = this.safeValue (response, 'rows', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PrivateGetClientTrades',
        });
        const response = await this[method] (this.extend (request, query));
        // {
        //     "success": true,
        //     "meta": {
        //         "records_per_page": 25,
        //         "current_page": 1
        //     },
        //     "rows": [
        //         {
        //             "id": 5,
        //             "symbol": "SPOT_BTC_USDT",
        //             "order_id": 211,
        //             "order_tag": "default",
        //             "executed_price": 10892.84,
        //             "executed_quantity": 0.002,
        //             "is_maker": 0,
        //             "side": "SELL",
        //             "fee": 0,
        //             "fee_asset": "USDT",
        //             "executed_timestamp": "1566264290.250"
        //         },
        //         ...
        //     ]
        // }
        const trades = this.safeValue (response, 'rows', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v2PrivateGetClientHolding',
        });
        const response = await this[method] (query);
        //
        // {
        //     holding: [
        //       {
        //         token: 'USDT',
        //         holding: '23.56', // free balance
        //         frozen: '888.0', // i.e. if in processing withdrawal
        //         interest: '0.0',
        //         outstanding_holding: '-56.7', // this value is set (negative number) if there is an open limit order, and this is QUOTE currency of order
        //         pending_exposure: '333.45', //  this value is set  (positive number) if there is an open limit order, and this is BASE currency of order
        //         opening_cost: '0.00000000',
        //         holding_cost: '0.00000000',
        //         realised_pnl: '0.00000000',
        //         settled_pnl: '0.00000000',
        //         fee_24_h: '0',
        //         settled_pnl_24_h: '0',
        //         updated_time: '1641370779'
        //       },
        //       ...
        //     ],
        //     success: true
        // }
        //
        return this.parseBalance (response);
    }

    parseBalance (response) {
        const result = {
            'info': response,
        };
        const balances = this.safeValue (response, 'holding', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'token'));
            const account = this.account ();
            account['total'] = this.safeString (balance, 'holding');
            const used = this.safeString (balance, 'outstanding_holding');
            account['used'] = Precise.stringNeg (used);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchDepositAddress (code, params = {}) {
        // this method is TODO because of networks unification
        await this.loadMarkets ();
        const currency = this.currency (code);
        const networkCodeDefault = this.defaultNetworkCodeForCurrency (code);
        const networkCode = this.safeValue (params, 'network', networkCodeDefault);
        params = this.omit (params, 'network');
        const networkAliases = this.safeValue (this.options, 'network-aliases', {});
        const networkId = this.getKeyByValue (networkAliases, networkCode);
        const codeForExchange = networkId + '_' + currency['code'];
        const request = {
            'token': codeForExchange,
        };
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchDepositAddress', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PrivateGetAssetDeposit',
        });
        const response = await this[method] (this.extend (request, query));
        // {
        //     success: true,
        //     address: '3Jmtjx5544T4smrit9Eroe4PCrRkpDeKjP',
        //     extra: ''
        // }
        let tag = this.safeString (response, 'extra');
        if (tag === '') {
            tag = undefined;
        }
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': networkCode,
            'info': response,
        };
    }

    async getAssetHistoryRows (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['balance_token'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const transactionType = this.safeString (params, 'type');
        params = this.omit (params, 'type');
        if (transactionType !== undefined) {
            request['type'] = transactionType;
        }
        const response = await this.v1PrivateGetAssetHistory (this.extend (request, params));
        // {
        //     rows: [
        //       {
        //         id: '22010508193900165',
        //         token: 'TRON_USDT',
        //         extra: '',
        //         amount: '13.75848500',
        //         status: 'COMPLETED',
        //         account: null,
        //         description: null,
        //         user_id: '42222',
        //         application_id: '6ad2b303-f354-45c0-8105-9f5f19d0e335',
        //         external_id: '220105081900134',
        //         target_address: 'TXnyFSnAYad3YCaqtwMw9jvXKkeU39NLnK',
        //         source_address: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6',
        //         type: 'BALANCE',
        //         token_side: 'DEPOSIT',
        //         tx_id: '35b0004022f6b3ad07f39a0b7af199f6b258c2c3e2c7cdc93c67efa74fd625ee',
        //         fee_token: '',
        //         fee_amount: '0.00000000',
        //         created_time: '1641370779.442',
        //         updated_time: '1641370779.465',
        //         is_new_target_address: null,
        //         confirmed_number: '29',
        //         confirming_threshold: '27',
        //         audit_tag: '1',
        //         audit_result: '0',
        //         balance_token: null, // TODO -write to support, that this seems broken. here should be the token id
        //         network_name: null // TODO -write to support, that this seems broken. here should be the network id
        //       }
        //     ],
        //     meta: { total: '1', records_per_page: '25', current_page: '1' },
        //     success: true
        // }
        return [ currency, this.safeValue (response, 'rows', {}) ];
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        const [ currency, rows ] = await this.getAssetHistoryRows (code, since, limit, params);
        return this.parseLedger (rows, currency, since, limit, params);
    }

    parseLedgerEntry (item, currency = undefined) {
        const networkizedCode = this.safeString (item, 'token');
        const currencyDefined = this.getCurrencyFromChaincode (networkizedCode, currency);
        const code = currencyDefined['code'];
        const amount = this.safeNumber (item, 'amount');
        const side = this.safeNumber (item, 'token_side');
        const direction = (side === 'DEPOSIT') ? 'in' : 'out';
        const timestamp = this.safeTimestamp (item, 'created_time');
        const fee = this.parseTokenAndFeeTemp (item, 'fee_token', 'fee_amount');
        return {
            'id': this.safeString (item, 'id'),
            'currency': code,
            'account': this.safeString (item, 'account'),
            'referenceAccount': undefined,
            'referenceId': this.safeString (item, 'tx_id'),
            'status': this.parseTransactionStatus (item, 'status'),
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'fee': fee,
            'direction': direction,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': this.parseLedgerEntryType (this.safeString (item, 'type')),
            'info': item,
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            'BALANCE': 'transaction', // Funds moved in/out wallet
            'COLLATERAL': 'transfer', // Funds moved between portfolios
        };
        return this.safeString (types, type, type);
    }

    getCurrencyFromChaincode (networkizedCode, currency) {
        if (currency !== undefined) {
            return currency;
        } else {
            const parts = networkizedCode.split ('_');
            const partsLength = parts.length;
            const firstPart = this.safeString (parts, 0);
            let currencyId = this.safeString (parts, 1, firstPart);
            if (partsLength > 2) {
                currencyId += '_' + this.safeString (parts, 2);
            }
            currency = this.safeCurrency (currencyId);
        }
        return currency;
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'token_side': 'DEPOSIT',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'token_side': 'WITHDRAW',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'type': 'BALANCE',
        };
        const [ currency, rows ] = await this.getAssetHistoryRows (code, since, limit, this.extend (request, params));
        return this.parseTransactions (rows, currency, since, limit, params);
    }

    parseTransaction (transaction, currency = undefined) {
        // example in fetchLedger
        const networkizedCode = this.safeString (transaction, 'token');
        const currencyDefined = this.getCurrencyFromChaincode (networkizedCode, currency);
        const code = currencyDefined['code'];
        let movementDirection = this.safeStringLower (transaction, 'token_side');
        if (movementDirection === 'withdraw') {
            movementDirection = 'withdrawal';
        }
        const fee = this.parseTokenAndFeeTemp (transaction, 'fee_token', 'fee_amount');
        fee['rate'] = undefined;
        const addressTo = this.safeString (transaction, 'target_address');
        const addressFrom = this.safeString (transaction, 'source_address');
        const timestamp = this.safeTimestamp (transaction, 'created_time');
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'tx_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': this.safeString (transaction, 'extra'),
            'type': movementDirection,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': this.safeTimestamp (transaction, 'updated_time'),
            'fee': fee,
            'info': transaction,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'NEW': 'pending',
            'CONFIRMING': 'pending',
            'PROCESSING': 'pending',
            'COMPLETED': 'ok',
            'CANCELED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'type': 'COLLATERAL',
        };
        const [ currency, rows ] = await this.getAssetHistoryRows (code, since, limit, this.extend (request, params));
        return this.parseTransfers (rows, currency, since, limit, params);
    }

    parseTransfer (transfer, currency = undefined) {
        // example is "fetchTransactions"
        const networkizedCode = this.safeString (transfer, 'token');
        const currencyDefined = this.getCurrencyFromChaincode (networkizedCode, currency);
        const code = currencyDefined['code'];
        let movementDirection = this.safeStringLower (transfer, 'token_side');
        if (movementDirection === 'withdraw') {
            movementDirection = 'withdrawal';
        }
        let fromAccount = undefined;
        let toAccount = undefined;
        if (movementDirection === 'withdraw') {
            fromAccount = undefined;
            toAccount = 'spot';
        } else {
            fromAccount = 'spot';
            toAccount = undefined;
        }
        const timestamp = this.safeTimestamp (transfer, 'created_time');
        return {
            'id': this.safeString (transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.parseTransferStatus (this.safeString (transfer, 'status')),
            'info': transfer,
        };
    }

    parseTransferStatus (status) {
        return this.parseTransactionStatus (status);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = section[0];
        const access = section[1];
        let url = this.implodeHostname (this.urls['api'][access]);
        url += '/' + version + '/';
        path = this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (access === 'public') {
            url += access + '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            url += path;
            const ts = this.nonce ().toString ();
            let auth = this.urlencode (params);
            if (method === 'POST' || method === 'DELETE') {
                body = auth;
            } else {
                url += '?' + auth;
            }
            auth += '|' + ts;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers = {
                'x-api-key': this.apiKey,
                'x-api-signature': signature,
                'x-api-timestamp': ts,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fallback to default error handler
        }
        //
        //     400 Bad Request {"success":false,"code":-1012,"message":"Amount is required for buy market orders when margin disabled."}
        //
        const success = this.safeValue (response, 'success');
        const errorCode = this.safeString (response, 'code');
        if (!success) {
            const feedback = this.id + ' ' + this.json (response);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
    }

    defaultNetworkCodeForCurrency (code) { // TODO: can be moved into base as an unified method
        // at first, try to find if user or exchange has defined default networks for the specific currency
        const defaultNetworkCodeForCurrencies = this.safeValue (this.options, 'defaultNetworkCodeForCurrencies');
        if (defaultNetworkCodeForCurrencies !== undefined) {
            const defaultNetworkCode = this.safeStringUpper (defaultNetworkCodeForCurrencies, code);
            if (defaultNetworkCode !== undefined) {
                return defaultNetworkCode;
            }
        }
        // if not found by above 'defaultNetworkCodeForCurrencies' for specific currency, then try with `defaultNetworkCodePriorities`
        const currencyItem = this.currency (code);
        const networks = currencyItem['networks'];
        const defaultNetworkCodePriorities = this.safeValue (this.options, 'defaultNetworkCodePriorities');
        if (defaultNetworkCodePriorities !== undefined) {
            // itterate according to priority networks
            const networksKeys = Object.keys (networks);
            const networksKeysLength = networksKeys.length;
            if (networksKeysLength > 0) {
                for (let i = 0; i < defaultNetworkCodePriorities.length; i++) {
                    const networkCode = defaultNetworkCodePriorities[i];
                    if (networkCode in networks) {
                        return networkCode;
                    }
                }
            }
        }
        // if it was not returned according to above options, then return the first network of currency
        const networkKeys = Object.keys (networks);
        return this.safeValue (networkKeys, 0);
    }
};
