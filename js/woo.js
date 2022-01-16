'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, RateLimitExceeded, BadRequest, ExchangeError, InvalidOrder } = require ('./base/errors'); // Permission-Denied, Arguments-Required, OrderNot-Found
const Precise = require ('./base/Precise');
const { TICK_SIZE } = require ('./base/functions/number');
function c(o){console.log(o);} function x(o){c(o);process.exit();}
// ---------------------------------------------------------------------------

module.exports = class woo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'woo',
            'name': 'Woo',
            'countries': [ 'KY' ], // Cayman Islands
            'rateLimit': 100,
            'version': 'v1',
            'certified': false,
            'hostname': 'woo.org',
            'has': {
                'createOrder': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelAllOrders': false,
                'createMarketOrder': false,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingRateHistory': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTransfers': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'deposit': false,
                'withdraw': false, // implemented in ccxt, but exchange have that endpoint disabled atm: https://kronosresearch.github.io/wootrade-documents/#token-withdraw
                'cancelWithdraw': false, // implemented in ccxt, but exchange have that endpoint disabled atm: https://kronosresearch.github.io/wootrade-documents/#cancel-withdraw-request
                'addMargin': false,
                'reduceMargin': false,
                'setLeverage': false,
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
                'logo': '',
                'api': {
                    'public': 'https://api.woo.org',
                    'private': 'https://api.woo.org',
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
                'referral': '',
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'info': 1,
                            'info/{symbol}': 1, // TO_DO
                            'market_trades': 1,
                            'token': 1,
                            'token_network': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'client/token': 1, // implicit
                            'order/{oid}': 1, // shared with "GET: client/order/:client_order_id"
                            'client/order/{client_order_id}': 1, // shared with "GET: order/:oid"
                            'orders': 1,
                            'orderbook/{symbol}': 1,
                            'kline': 1,
                            'client/trade/{tid}': 1, // implicit
                            'order/{oid}/trades': 1,
                            'client/trades': 1,
                            'client/info': 60,
                            'asset/deposit': 120,
                            'asset/history': 60,
                            'token_interest': 60, // implicit
                            'token_interest/{token}': 60, // implicit
                            'interest/history': 60, // implicit
                            'interest/repay': 60, // implicit
                        },
                        'post': {
                            'order': 5, // Limit: 2 requests per 1 second per symbol
                            'asset/withdraw': 120,  // implemented in ccxt, but exchange have that endpoint disabled atm: https://kronosresearch.github.io/wootrade-documents/#token-withdraw
                        },
                        'delete': {
                            'order': 1, // shared with "DELETE: client/order"
                            'client/order': 1, // shared with "DELETE: order"
                            'orders': 1,
                            'asset/withdraw': 120,  // implemented in ccxt, but exchange have that endpoint disabled atm: https://kronosresearch.github.io/wootrade-documents/#cancel-withdraw-request
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
                    'maker': 0.2 / 100,
                    'taker': 0.5 / 100,
                },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'network-aliases': {
                    'ALGO': 'ALGO',
                    'AVAXC': 'AVAXC',
                    'BNB': 'BEP2',
                    'BSC': 'BEP20',
                    'EOS': 'EOS',
                    'ETH': 'ERC20',
                    'HECO': 'HRC20',
                    'MATIC': 'POLYGON',
                    'ONT': 'ONT',
                    'SOL': 'SPL',
                    'TERRA': 'TERRA',
                    'TRON': 'TRC20',
                    // from 'token_network' endpoint
                    'Algorand': 'ALGO',
                    'Avalanche C-Chain': 'AVAXC',
                    'C Chain': 'AVAXC', // need to be renamed the protocol name itself
                    'Binance Chain': 'BEP2',
                    'Binance Smart Chain': 'BEP20',
                    // EOS not needed, as matches token's protocol name
                    'Ethereum': 'ERC20',
                    'Huobi ECO Chain': 'HRC20',
                    // 'HECO': 'HRC20', // need to be renamed the protocol name itself (atm, the key is duplicate in this object, so comment it.)
                    'Polygon': 'POLYGON', // need to be renamed the protocol name itself
                    'Ontology': 'ONT',
                    'Solana': 'SPL',
                    'Terra Protocol': 'TERRA',
                    'Tron': 'TRC20',
                },
                'networks': {
                    'ERC20': 'ETH',
                    'TRC20': 'TRX',
                    'BSC20': 'BSC',
                },
                // the below can be unified approach
                'defaultNetworksPriorities': [
                    'ERC20',
                    'TRC20',
                    'BSC20',
                ],
                // if needed to change default network for specific token (as opposed to 'defaultNetworksPriorities' priorities) then list here
                'defaultNetworksForCodes': {
                    'USDT': 'TRC20',
                    'BTC': 'BTC',
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
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': false,
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
        // ### public/market_trades
        // {
        //     symbol: "SPOT_BTC_USDT",
        //     side: "SELL",
        //     executed_price: 46222.35,
        //     executed_quantity: 0.0012,
        //     executed_timestamp: "1641241162.329"
        // },
        //
        // ### fetchOrderTrades, fetchOrder->Transactions[]
        //
        // {
        //     id: '99119876',
        //     symbol: 'SPOT_WOO_USDT',
        //     fee: '0.0024',
        //     side: 'BUY',
        //     executed_timestamp: '1641481113.084',
        //     order_id: '87001234',
        //     order_tag: 'default', <-- this param only in "fetchOrderTrades"
        //     executed_price: '1',
        //     executed_quantity: '12',
        //     fee_asset: 'WOO',
        //     is_maker: '1'
        // }
        //
        const isFromFetchOrder = ('id' in trade);
        const timestamp = this.safeTimestamp (trade, 'executed_timestamp');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'executed_price');
        const amount = this.safeString (trade, 'executed_quantity');
        const order_id = this.safeString (trade, 'order_id');
        const feeValue = this.safeString (trade, 'fee');
        const feeAsset = this.safeString (trade, 'fee_asset');
        const cost = Precise.stringMul (price, amount);
        const side = this.safeStringLower (trade, 'side');
        let id = this.safeString (trade, 'id');
        if (id === undefined) { // reconstruct artificially, if it doesn't exist
            id = timestamp;
            if (id !== undefined) {
                id += '-' + market['id'] + '-' + amount;
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
            'fee': {
                'cost': feeValue,
                'currency': feeAsset,
            },
            'info': trade,
        }, market);
    }

    async fetchCurrencies (params = {}) {
        let method = undefined;
        let result = {};
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
            if (!(code in result)) {
                const networks = this.safeValue (networksByCurrencyId, id, []);
                const resultingNetworks = {};
                for (let j = 0; j < networks.length; j++) {
                    const networkEntry = networks[i];
                    const networkId = this.safeString (networkEntry, 'protocol');
                    const networkCode = this.safeNetworkCode (networkId);
                    c(networkId); 
                    c(networkCode); continue;
                    resultingNetworks[network] = {
                        'info': chain,
                        'id': networkId,
                        'network': network,
                        'limits': {
                            'withdraw': {
                                'min': minWithdraw,
                                'max': maxWithdraw,
                            },
                        },
                        'active': active,
                        'deposit': depositEnabled,
                        'withdraw': withdrawEnabled,
                        'fee': fee,
                        'precision': precision,
                    };
                }
                result[code] = {
                    // currency structure
                    // ...
                    'networks': resultingNetworks,
                    // ...
                };
            } else {
                
            }
        }
        return result;

        
                        // if (method < 34) {
                        //     const derivedCurrenciesData = {};
                        //     for (let i = 0; i < data1.length; i++) {
                        //         const item = data1[i];
                        //         const tokenCode = this.safeString (item, 'balance_token');
                        //         const code = this.safeCurrencyCode (tokenCode);
                        //         if (!(code in derivedCurrenciesData)) {
                        //             derivedCurrenciesData[code] = {
                        //                 'fullname': this.safeString (item, 'fullname'),
                        //                 'networks': {},
                        //             };
                        //         }
                        //         const chainedTokenCode = this.safeString (item, 'token');
                        //         const parts = chainedTokenCode.split ('_');
                        //         const networkId = (parts.length === 2) ? this.safeString (parts, 0) : chainedTokenCode;
                        //         const networkUnifiedSlug = this.safeString (this.options['network-aliases'], networkId, networkId);
                        //         derivedCurrenciesData[code]['networks'][networkId] = {
                        //             'chained_currency_code': chainedTokenCode,
                        //             'network_exchangeslug': networkUnifiedSlug,
                        //             'decimals': this.safeString (item, 'decimals'),
                        //             'info': { 'currencyInfo': item },
                        //         };
                        //     }
                        // }

                        
                        // if (method < 34) {
                        //     const derivedNetworksData = {};
                        //     for (let i = 0; i < tokenNetworks.length; i++) {
                        //         const item = tokenNetworks[i];
                        //         const tokenCode = this.safeString (item, 'token');
                        //         const code = this.safeCurrencyCode (tokenCode);
                        //         if (!(code in derivedNetworksData)) {
                        //             derivedNetworksData[code] = {
                        //                 'networks': {},
                        //             };
                        //         }
                        //         const protocol = this.safeString (item, 'protocol', '');
                        //         const networkUnifiedSlug = this.safeString (this.options['network-aliases'], protocol, protocol);
                        //         derivedNetworksData[code]['networks'][networkUnifiedSlug] = {
                        //             'network_title': this.safeString (item, 'name'),
                        //             'allow_deposit': this.safeString (item, 'allow_deposit'),
                        //             'allow_withdraw': this.safeString (item, 'allow_withdraw'),
                        //             'withdrawal_fee': this.safeString (item, 'withdrawal_fee'),
                        //             'minimum_withdrawal': this.safeString (item, 'minimum_withdrawal'),
                        //             'info': { 'networkInfo': item },
                        //         };
                        //     }
                        //     // combine as final step.
                        //     const keys = Object.keys (derivedCurrenciesData); // keys and items amount in derivedCurrenciesData and derivedNetworksData are same
                        //     for (let i = 0; i < keys.length; i++) {
                        //         const code = keys[i]; // keys are alraedy safeCurrencyCode-d
                        //         const currencyInfo = derivedCurrenciesData[code];
                        //         const currencyNetworks = derivedNetworksData[code];
                        //         const currencyMerged = this.deepExtend (currencyInfo, currencyNetworks);
                        //         // if tokenResponse each item contains only one child, then they are the same network . Quite bad behavior of their API for this matter, but as-is: the only solution is this as I think at this moment.
                        //         const name = this.safeString (currencyMerged, 'fullname');
                        //         const isActive = this.hasChildWithKeyValue (currencyNetworks, 'allow_deposit', 1) && this.hasChildWithKeyValue (currencyNetworks, 'allow_withdraw', 1);
                        //         const networks = this.parseTokenNetworks (code, currencyMerged['networks']);
                        //         result[code] = {
                        //             'id': code,
                        //             'name': name,
                        //             'code': code,
                        //             'precision': undefined,
                        //             'info': { 'currencyInfo': currencyInfo, 'networkInfo': currencyNetworks },
                        //             'active': isActive,
                        //             'fee': undefined, // TO_DO
                        //             'networks': networks,
                        //             'limits': {
                        //                 'deposit': {
                        //                     'min': undefined,
                        //                     'max': undefined,
                        //                 },
                        //                 'withdraw': {
                        //                     'min': undefined, // TO_DO
                        //                     'max': undefined, // TO_DO
                        //                 },
                        //             },
                        //         };
                        //     }
                        // }
                        // return result;

    }

    parseTokenNetworks (code, chains) {
        //
        // i.e. for USDT code:
        // {
        //     ALGO: {
        //       chained_currency_code: 'ALGO_USDT',
        //       network_exchangeslug: 'ALGO',
        //       decimals: '6',
        //       network_title: 'Algorand',
        //       allow_deposit: '1',
        //       allow_withdraw: '1',
        //       withdrawal_fee: '0.50000000',
        //       minimum_withdrawal: '10.00000000',
        //       info: { currencyInfo: [Object], networkInfo: [Object] },
        //     },
        //     BEP20: {
        //       chained_currency_code: 'BSC_USDT',
        //       network_exchangeslug: 'BSC',
        //       decimals: '18',
        //       network_title: 'Binance Smart Chain',
        //       allow_deposit: '1',
        //       allow_withdraw: '1',
        //       withdrawal_fee: '1.00000000',
        //       minimum_withdrawal: '15.00000000',
        //       info: { currencyInfo: [Object], networkInfo: [Object] },
        //     },
        //     ERC20: {
        //       chained_currency_code: 'ETH_USDT',
        //       network_exchangeslug: 'ETH',
        //       decimals: '6',
        //       network_title: 'Ethereum',
        //       allow_deposit: '1',
        //       allow_withdraw: '1',
        //       withdrawal_fee: '35.00000000',
        //       minimum_withdrawal: '50.00000000',
        //       info: { currencyInfo: [Object], networkInfo: [Object] },
        //     },
        //     TRC20: {
        //       chained_currency_code: 'TRON_USDT',
        //       network_exchangeslug: 'TRON',
        //       decimals: '6',
        //       network_title: 'Tron',
        //       allow_deposit: '1',
        //       allow_withdraw: '1',
        //       withdrawal_fee: '1.00000000',
        //       minimum_withdrawal: '30.00000000',
        //       info: { currencyInfo: [Object], networkInfo: [Object] },
        //     }
        // }
        const networks = {};
        const keys = Object.keys (chains);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const chain = chains[key];
            const networkId = this.safeString (chain, 'network_exchangeslug');
            const networkUnifiedSlug = this.safeString (this.options['network-aliases'], key, key);
            const withdrawAllowed = this.safeInteger (chain, 'allow_withdraw', 0) === 1;
            const depositAllowed = this.safeInteger (chain, 'allow_deposit', 0) === 1;
            networks[networkUnifiedSlug] = {
                'id': networkId,
                'network': networkUnifiedSlug,
                'limits': {
                    'withdraw': {
                        'min': this.safeNumber (chain, 'minimum_withdrawal'),
                        'max': undefined,
                    },
                },
                'active': withdrawAllowed && depositAllowed,
                'fee': this.safeNumber (chain, 'withdrawal_fee'),
                'precision': this.safeInteger (chain, 'decimals'),
                'info': chain,
            };
        }
        return networks;
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
        // TODO : is this https://docs.woo.org/#get-orders correclty implemented by me? Maybe I missed some things (like end-time handing?)
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
        if (market === undefined) {
            const marketId = this.safeString (order, 'symbol');
            market = this.safeMarket (marketId, market);
        }
        const symbol = market['symbol'];
        const price = this.safeString2 (order, 'order_price', 'price');
        const quantity = this.safeString2 (order, 'order_quantity', 'quantity'); // This is base amount
        const amount = this.safeString2 (order, 'order_amount', 'amount'); // This is quote amount
        const orderType = this.safeStringLower2 (order, 'order_type', 'type');
        const status = this.safeValue (order, 'status');
        const side = this.safeStringLower2 (order, 'side');
        const filled = this.safeValue (order, 'executed');
        const remaining = Precise.stringSub (amount, filled);
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
            'amount': quantity, // TO_DO
            'filled': filled,
            'remaining': remaining, // TO_DO
            'cost': amount, // TO_DO
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
        //         holding: '123.758485',
        //         frozen: '22.0', // i.e. withdrawal
        //         interest: '0.0',
        //         outstanding_holding: '-56.4', // whatever in pending/limit orders
        //         pending_exposure: '0.0', // this value is set when a pending order is waiting to get this token
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
            account['used'] = this.safeString (balance, 'outstanding_holding');
            account['free'] = Precise.stringAdd (account['total'], account['used']);
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const networkCode = this.safeValue (params, 'network');
        params = this.omit (params, 'network');
        const [ codeForExchange, networkId ] = this.currencyCodeWithNetwork (currency['code'], networkCode, '_', true);
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
        let tag = this.safeValue (response, 'extra');
        if (tag === '') {
            tag = undefined;
        }
        const address = this.safeValue (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': networkId,
            'info': response,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'type': 'BALANCE',
            'token_side': 'DEPOSIT',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'type': 'BALANCE',
            'token_side': 'WITHDRAW',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
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
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchTransactions', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PrivateGetAssetHistory',
        });
        const response = await this[method] (this.extend (request, query));
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
        //         balance_token: null, // TODO -write to support, that this seems broken
        //         network_name: null // TODO -write to support, that this seems broken
        //       }
        //     ],
        //     meta: { total: '1', records_per_page: '25', current_page: '1' },
        //     success: true
        // }
        const transactions = this.safeValue (response, 'rows', {});
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        // example in fetchTransactions
        const networkizedCode = this.safeString (transaction, 'token');
        if (currency === undefined) {
            currency = this.getCurrencyByNetworkizedCode (networkizedCode);
        }
        let code = undefined;
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            const parts = networkizedCode.split ('_');
            let currencyId = undefined;
            if (parts.length > 1) {
                currencyId = parts[1];
            } else {
                currencyId = parts[0];
            }
            code = this.safeCurrencyCode (currencyId);
        }
        let movementDirection = this.safeStringLower (transaction, 'token_side');
        if (movementDirection === 'withdraw') {
            movementDirection = 'withdrawal';
        }
        const feeCurrencyId = this.safeString (transaction, 'fee_token', '');
        let feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
        if (feeCurrencyCode === '') {
            feeCurrencyCode = code;
        }
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
            'fee': {
                'currency': feeCurrencyCode,
                'cost': this.safeNumber (transaction, 'fee_amount'),
                'rate': undefined,
            },
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
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request = {
            'type': 'COLLATERAL',
        };
        params = this.omit (params, 'type');
        const response = await this.v1PrivateGetAssetHistory (this.extend (request, params));
        const rows = this.safeValue (response, 'rows');
        return this.parseTransfers (rows, currency, since, limit, params);
    }

    parseTransfer (transfer, currency = undefined) {
        // example is "fetchTransactions"
        let movementDirection = this.safeStringLower (transfer, 'token_side');
        if (movementDirection === 'withdraw') {
            movementDirection = 'withdrawal';
        }
        let fromAccount = undefined;
        let toAccount = undefined;
        if (movementDirection === 'withdraw') {
            fromAccount = 'derivatives';
            toAccount = 'spot';
        } else {
            fromAccount = 'spot';
            toAccount = 'derivatives';
        }
        const timestamp = this.safeTimestamp (transfer, 'created_time');
        return {
            'id': this.safeString (transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeValue (currency, 'code'),
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

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        let networkCode = this.safeStringUpper (params, 'network');
        const networks = this.safeValue (this.options, 'networks', {});
        networkCode = this.safeStringLower (networks, networkCode, networkCode);
        if (networkCode === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a network property in params');
        } else {
            params = this.omit (params, 'network');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const currencyId = currency['id'];
        const request = {
            'amount': amount,
        };
        const method = 'v1PrivatePostAssetWithdraw';
        request['token'] = this.currencyCodeWithNetwork (currencyId, networkCode);
        request['address'] = address;
        const response = await this[method] (this.extend (request, params));
        // {
        //     "success": true,
        //     "withdraw_id": "20200119145703654"
        // }
        const id = this.safeString (response, 'withdraw_id');
        return {
            'id': id,
            'info': response,
        };
    }

    async cancelWithdraw (id, params = {}) {
        const request = {
            'id': id,
        };
        const method = 'v1PrivateDeleteAssetWithdraw';
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //     "success": true
        // }
        //
        const success = this.safeValue (response, 'success', false);
        return {
            'success': success,
            'info': response,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const versionStr = api[0];
        const privateOrPublic = api[1];
        let url = this.implodeHostname (this.urls['api'][privateOrPublic]);
        url += '/' + versionStr + '/';
        path = this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (privateOrPublic === 'public') {
            url += privateOrPublic + '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            url += path;
            const ts = this.nonce ().toString ();
            let auth = '';
            if (method === 'POST' || method === 'DELETE') {
                auth += this.urlencode (params);
                body = auth;
            } else {
                auth += this.urlencode (params);
                url += '?' + this.urlencode (params);
            }
            auth += '|' + ts;
            const signature = this.hmac (auth, this.encode (this.secret), 'sha256');
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

    getDefaultNetworkPairForCurrency (code, networkCode) {
        // at first, try to find if user or exchange has defined default networks for the specific currency
        const userChosenNetork = networkCode;
        const defaultNetworksForCodes = this.safeValue (this.options, 'defaultNetworksForCodes');
        if (defaultNetworksForCodes !== undefined) {
            const defaultNetworkCode = this.safeStringUpper (defaultNetworksForCodes, code);
            if (defaultNetworkCode !== undefined) {
                const networks = this.safeValue (this.options, 'networks');
                if (networks !== undefined) {
                    const unifiedNetworkCode = (userChosenNetork !== undefined) ? this.safeDetectChainSlug (userChosenNetork) : defaultNetworkCode;
                    const exchangeNetworkSlug = this.safeString (networks, unifiedNetworkCode, defaultNetworkCode);
                    if (exchangeNetworkSlug !== undefined) {
                        return {
                            'id': exchangeNetworkSlug,
                            'code': unifiedNetworkCode,
                        };
                    }
                }
            }
        }
        // if not found by above 'defaultNetworks' for specific currency, then try with global priorities
        const priorityNetworks = this.safeValue (this.options, 'defaultNetworksPriorities');
        const currencyItem = this.currencies[code];
        const networks = currencyItem['networks'];
        // itterate according to priority networks
        if (priorityNetworks !== undefined) {
            for (let j = 0; j < priorityNetworks.length; j++) {
                const networkId = priorityNetworks[j];
                if (networkId in networks) {
                    const networkItem = networks[networkId];
                    return {
                        'id': networkItem['network_exchangeslug'],
                        'code': networkId,
                    };
                }
            }
        }
        return undefined;
    }

    currencyCodeWithNetwork (code, networkCode, divider = '_', beforOrAfter = true) {
        // at first, try to get according to default networks
        const defaultNetworkPair = this.getDefaultNetworkPairForCurrency (code, networkCode);
        if (defaultNetworkPair !== undefined) {
            const id = defaultNetworkPair['id'];
            let networkizedCode = undefined;
            if (code === id) { // if there was no dash between pair, then its same
                networkizedCode = code;
            } else { // if there was dash, then needs to be joined
                if (beforOrAfter) {
                    networkizedCode = id + divider + code;
                } else {
                    networkizedCode = code + divider + id;
                }
            }
            const networkCode = defaultNetworkPair['code'];
            return [ networkizedCode, networkCode ];
        } else {
            // if it was not returned above according to defaults & options, then return the first network
            const currencyItem = this.currencies[code];
            const networks = currencyItem['networks'];
            const networkKeys = Object.keys (networks);
            for (let j = 0; j < networkKeys.length; j++) {
                const networkCode = networkKeys[j];
                const networkItem = networks[networkCode];
                const networkizedCode = this.safeString (networkItem, 'chained_currency_code');
                if (networkizedCode !== undefined) {
                    return [ networkizedCode, networkCode ];
                }
            }
        }
        return undefined;
    }

    getCurrencyByNetworkizedCode (chainedCode) { // This method is not needed for all exchanges, but only for those exchange classes, which has composited ids (like "ETH_USDT", "TRC_USDT" ...)
        const keys = Object.keys (this.currencies);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const currencyItem = this.currencies[key];
            const currencyCode = currencyItem['code'];
            if (chainedCode === currencyCode) {
                return chainedCode;
            } else {
                const networks = currencyItem['networks'];
                const networkKeys = Object.keys (networks);
                for (let j = 0; j < networkKeys.length; j++) {
                    const networkKey = networkKeys[j];
                    const networkItem = networks[networkKey];
                    if (networkItem['chained_currency_code'] === chainedCode) {
                        return currencyItem;
                    }
                }
            }
        }
        return undefined;
    }

    hasChildWithKeyValue (obj, targetKey, targetValue) { // TODO: This can be moved into base, because it's useful in analog cases, when you want to find if any from i.e.'3-4-5 networks children properties' of this currency has a key (i.e. 'allow_deposits') set to specific value (i.e. '1'). Please see how this method is implemented above, and lmk.
        const keys = Object.keys (obj);
        for (let i = 0; i < keys.length; i++) {
            const currentKey = keys[i];
            const childMember = obj[currentKey];
            const value = this.safeInteger (childMember, targetKey, undefined);
            if (value === targetValue) {
                return true;
            }
        }
        return false;
    }

    safeNetworkCode (networkId) {
        return this.safeString (this.options['network-aliases'], networkId, networkId);
    }
};
