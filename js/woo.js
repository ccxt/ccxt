'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, RateLimitExceeded, BadRequest, ExchangeError, InvalidOrder } = require ('./base/errors'); // Permission-Denied, Arguments-Required, OrderNot-Found
const Precise = require ('./base/Precise');

// eslint-disable-next-line padding-line-between-statements
function c (o) {
    console.log (o);
}
// ---------------------------------------------------------------------------

module.exports = class woo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'woo',
            'name': 'Woo',
            'countries': [ 'KY' ], // Cayman Islands
            'rateLimit': 1000, // No defaults known
            'version': 'v1',
            'certified': false,
            'hostname': 'woo.org',
            'has': {
                'createOrder': undefined,
                'cancelOrder': undefined,
                'cancelAllOrders': undefined,
                'createMarketOrder': undefined,
                'fetchBalance': true,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': true,
                'fetchDepositAddress': undefined,
                'fetchDeposits': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchMarkets': true,
                'fetchMyTrades': undefined,
                'fetchOrderTrades': undefined,
                'fetchOHLCV': undefined,
                'fetchOrder': undefined,
                'fetchOrders': undefined,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrderBook': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchStatus': undefined,
                'fetchTicker': undefined,
                'fetchTickers': undefined,
                'fetchTime': undefined,
                'fetchTrades': true,
                'fetchWithdrawals': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'addMargin': undefined,
                'reduceMargin': undefined,
                'setLeverage': undefined,
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
                'logo': '  <<<TODO>>>    ',
                'api': {
                    'public': 'https://api.woo.org',
                    'private': 'https://api.woo.org',
                    // API_TESTNET_URL = "http://api.staging.woo.network" as said https://github.com/wanth1997/python-wootrade/blob/main/wootrade/client.py |TODO
                },
                'www': 'https://woo.org/',
                'doc': [
                    'https://docs.woo.org/',
                ],
                'fees': [
                    'https://support.woo.org/hc/en-001/articles/4404611795353--Trading-Fees',
                ],
                'referral': '  <<<TODO>>>   ',
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'info': 1,
                            'info/:symbol': 1, // TODO
                            'market_trades': 1,
                            'token': 1, // TODO
                            'token_network': 1, // TODO
                            'orderbook/:symbol': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'client/token': 1, // TODO
                            'order/:oid': 1, // shared with "GET: client/order/:client_order_id" |TODO
                            'client/order/:client_order_id': 1, // shared with "GET: order/:oid" |TODO
                        },
                        'post': {
                            'order': 1, // Limit: 2 requests per 1 second per symbol |TODO
                        },
                        'delete': {
                            'order': 1, // shared with "DELETE: client/order" |TODO
                            'client/order': 1, // shared with "DELETE: order"  |TODO
                            'orders': 1, // TODO
                        },
                    },
                },
                'v2': {
                    'public': {
                        'get': {
                        },
                    },
                    'private': {
                        'get': {
                            'client/holding': 1,
                        },
                        'post': {
                        },
                        'delete': {
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
                    '-1012': ExchangeError, // { "code": -1012,  "message": "The place/cancel order request is rejected by internal module, it may because the account is in liquidation or other internal errors. Please try again in a few seconds." }
                    '-1101': InvalidOrder, // { "code": -1101,  "message": "The risk exposure for client is too high, it may cause by sending too big order or the leverage is too low. please refer to client info to check the current exposure." }
                    '-1102': InvalidOrder, // { "code": -1102,  "message": "The order value (price * size) is too small." }
                    '-1103': InvalidOrder, // { "code": -1103,  "message": "The order price is not following the tick size rule for the symbol." }
                    '-1104': InvalidOrder, // { "code": -1104,  "message": "The order quantity is not following the step size rule for the symbol." }
                    '-1105': InvalidOrder, // { "code": -1105,  "message": "Price is X% too high or X% too low from the mid price." }
                },
                'broad': {
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchMarkets', undefined, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'v1PublicGetInfo',
        });
        let data = undefined;
        if (marketType === 'spot') {
            const response = await this[method] (query);
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
            data = this.safeValue (response, 'rows', []);
        }
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const marketId = this.safeString (market, 'symbol');
            const parts = marketId.split ('_');
            const baseId = parts[1];
            const quoteId = parts[2];
            const marketTypeVal = parts[0].toLowerCase ();
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const minQuoteAmount = this.safeNumber (market, 'quote_min');
            const maxQuoteAmount = this.safeNumber (market, 'quote_max');
            const minBaseAmount = this.safeNumber (market, 'base_min');
            const maxBaseAmount = this.safeNumber (market, 'base_max');
            const priceScale = this.safeInteger (market, 'quote_tick');
            const quantityScale = this.safeInteger (market, 'base_tick');
            const pricePrecision = priceScale;
            const quantityPrecision = quantityScale;
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
                // Fee is in %, so divide by 100
                'taker': undefined,
                'maker': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': quantityPrecision,
                    'price': pricePrecision,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minBaseAmount,
                        'max': maxBaseAmount,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': minQuoteAmount,
                        'max': maxQuoteAmount,
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
        const timestamp = this.safeTimestamp (trade, 'executed_timestamp');
        const marketId = this.safeString (trade, 'symbol');
        if (market === undefined) {
            market = this.safeMarket (marketId, market, '_');
        }
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'executed_price');
        const amount = this.safeString (trade, 'executed_quantity');
        let side = this.safeString (trade, 'side');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        let id = timestamp;
        if (id !== undefined) {
            id += '-' + market['id'] + '-' + amount;
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'order': undefined,
            'takerOrMaker': 'taker',
            'type': undefined,
            'fee': undefined,
        }, market);
    }

    // TODO: we need to write them to merge 'token' and 'token_network' objects from API, as it's horrificly bad atm.
    async fetchCurrencies (params = {}) {
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchCurrencies', undefined, params);
        const method1 = this.getSupportedMapping (marketType, {
            'spot': 'v1PublicGetToken',
        });
        const response1 = await this[method1] (query);
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
        const result = {};
        const data1 = this.safeValue (response1, 'rows', []);
        const derivedData1 = {}; // TODO: here needs to be initialized as object, otherwise extra check will be needed inside loop cycles
        for (let i = 0; i < data1.length; i++) {
            const item = data1[i];
            const code = this.safeCurrencyCode (this.safeString (item, 'balance_token'));
            const pairId = this.safeString (item, 'token');
            const networkId = pairId.split ('_')[0];
            const networkSlug = this.genericChainTitleToUnifiedName (networkId);
            if (!(code in derivedData1)) {
                derivedData1[code] = {};
            }
            if (!(networkSlug in derivedData1[code])) {
                derivedData1[code][networkSlug] = undefined;
            }
            derivedData1[code][networkSlug] = {
                'fullname': this.safeString (item, 'fullname'),
                'decimals': this.safeString (item, 'decimals'),
                'info': item,
            };
        }
        const method2 = this.getSupportedMapping (marketType, {
            'spot': 'v1PublicGetTokenNetwork',
        });
        const response2 = await this[method2] (query);
        const data2 = this.safeValue (response2, 'rows', []);
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
        const derivedData2 = {};
        for (let i = 0; i < data2.length; i++) {
            const item = data2[i];
            const code = this.safeCurrencyCode (this.safeString (item, 'token'));
            const networkId = this.safeString (item, 'protocol');
            const networkSlug = this.genericChainTitleToUnifiedName (networkId);
            if (!(code in derivedData2)) {
                derivedData2[code] = {};
            }
            if (!(networkSlug in derivedData2[code])) {
                derivedData2[code][networkSlug] = undefined;
            }
            derivedData2[code][networkSlug] = {
                // 'network_title': this.safeString (item, 'name'), // We don't need this much, as we already have network-slug
                'allow_deposit': this.safeString (item, 'allow_deposit'),
                'allow_withdraw': this.safeString (item, 'allow_withdraw'),
                'withdrawal_fee': this.safeString (item, 'withdrawal_fee'),
                'minimum_withdrawal': this.safeString (item, 'minimum_withdrawal'),
                'info': item,
            };
        }
        // combine as final step.
        const keys = Object.keys (derivedData1); //  keys and items amount in derivedData1 and derivedData2 are same
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const item1 = derivedData1[key];
            const item2 = derivedData2[key];
            // TODO: if response1 each item contains only one child, then they are the same network . Quite bad behavior of their API for this matter, but as-is: the only solution is this as I think at this moment.
            const id = key;
            const networks = Object.keys (item1);
            const tokenNetwork = item1[networks[0]];
            const name = this.safeString (tokenNetwork, 'fullname');
            const code = this.safeCurrencyCode (id);
            const precision = this.safeNumber (tokenNetwork, 'decimals');
            let deposits_allowed_somewhere = undefined;
            let withdrawals_allowed_somewhere = undefined;
            // eslint-disable-next-line no-restricted-syntax, no-unused-vars
            for (const [chainName, chainBlock] of Object.entries (item2)) {
                if (chainBlock.allow_deposit === '1') {
                    deposits_allowed_somewhere = true;
                }
                if (chainBlock.allow_withdraw === '1') {
                    withdrawals_allowed_somewhere = true;
                }
            }
            const active = deposits_allowed_somewhere && withdrawals_allowed_somewhere;
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': precision,
                'info': [item1.info, item2.info],
                'active': active,
                'fee': undefined, // TODO
                'network': undefined, // TODO
                'limits': {
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined, // TODO
                        'max': undefined, // TODO
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.v2PrivateGetClientHolding (params);
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
        //   }
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

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const versionStr = api[0];
        const privateOrPublic = api[1];
        let url = this.implodeHostname (this.urls['api'][privateOrPublic]);
        url += '/' + versionStr + '/';
        params = this.omit (params, this.extractParams (path));
        if (privateOrPublic === 'public') {
            url += privateOrPublic + '/' + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            url += path;
            const ts = this.nonce ().toString ();
            let auth = this.urlencode (params);
            auth += '|' + ts;
            const signature = this.hmac (auth, this.encode (this.secret), 'sha256').toUpperCase ();
            if (method === 'POST') {
                body = auth;
            }
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
            // fallback to default error handler
        }
    }

    // ######### CAN BE MOVED IN BASE #########
    // the block for unification titles
    sanitize_str (str) {
        return str.replace (/[\W_]+/g, '-').toLowerCase ();
    }

    genericChainTitleToUnifiedName (type) {
        const type_S = this.sanitize_str (type);
        const chainsSlugs = {};
        chainsSlugs['bep-20'] = ['bep', 'bep20', 'bep-20', 'bep_20', 'bsc', 'bsc20', 'bsc-20', 'bsc_20', 'binance', 'binance-network', 'binance-smart-chain', 'binance_smart_chain', 'bep20_bsc_', 'bep20-bsc', 'bep20bsc']; // lbank has 'bep20(bsc)'
        chainsSlugs['bep-2'] = ['bep2', 'bep_2', 'bep-20', 'bep_20', 'bnb', 'binance-chain', 'binance-network'];
        chainsSlugs['erc-20'] = ['erc', 'erc20', 'erc-20', 'erc_20', 'eth', 'eth20', 'eth-20', 'eth_20', 'ethereum', 'ethereum-network', 'ethereum-chain'];
        chainsSlugs['hrc-20'] = ['heco', 'hrc', 'hrc20', 'hrc_20', 'hrc-20', 'huobi', 'huobi-network', 'huobi-chain', 'huobi-eco-chain', 'huobi_eco_chain', 'huobi-chain', 'huobi_chain', 'eco-chain', 'eco_chain'];
        chainsSlugs['trc-20'] = ['trc', 'trc20', 'trc-20', 'trc_20', 'trx', 'trx20', 'trx-20', 'trx_20', 'tron', 'tron-network', 'tron-chain', 'trx-network'];
        chainsSlugs['sol'] = ['sol', 'solana', 'sol-chain', 'solana-chain'];
        chainsSlugs['matic'] = ['matic', 'polygon'];
        // eslint-disable-next-line no-restricted-syntax
        for (const [key, chainList] of Object.entries (chainsSlugs)) {
            if (chainList.includes (type_S)) {
                return key;
            }
        }
        return type.toLowerCase ();
    }
};
