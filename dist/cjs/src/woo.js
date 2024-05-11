'use strict';

var woo$1 = require('./abstract/woo.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
/**
 * @class woo
 * @augments Exchange
 */
class woo extends woo$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'woo',
            'name': 'WOO X',
            'countries': ['KY'],
            'rateLimit': 100,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'hostname': 'woo.org',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelWithdraw': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopLossOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': true,
                'createTrailingAmountOrder': true,
                'createTrailingPercentOrder': true,
                'createTriggerOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': true,
                'fetchConvertQuote': true,
                'fetchConvertTrade': true,
                'fetchConvertTradeHistory': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransactions': 'emulated',
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': false,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': true, // exchange have that endpoint disabled atm, but was once implemented in ccxt per old docs: https://kronosresearch.github.io/wootrade-documents/#token-withdraw
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
                    'pub': 'https://api-pub.woo.org',
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'pub': 'https://api-pub.staging.woo.org',
                    'public': 'https://api.staging.woo.org',
                    'private': 'https://api.staging.woo.org',
                },
                'www': 'https://woo.org/',
                'doc': [
                    'https://docs.woo.org/',
                ],
                'fees': [
                    'https://support.woo.org/hc/en-001/articles/4404611795353--Trading-Fees',
                ],
                'referral': {
                    'url': 'https://x.woo.org/register?ref=YWOWC96B',
                    'discount': 0.35,
                },
            },
            'api': {
                'v1': {
                    'pub': {
                        'get': {
                            'hist/kline': 10,
                            'hist/trades': 1,
                        },
                    },
                    'public': {
                        'get': {
                            'info': 1,
                            'info/{symbol}': 1,
                            'system_info': 1,
                            'market_trades': 1,
                            'token': 1,
                            'token_network': 1,
                            'funding_rates': 1,
                            'funding_rate/{symbol}': 1,
                            'funding_rate_history': 1,
                            'futures': 1,
                            'futures/{symbol}': 1,
                            'orderbook/{symbol}': 1,
                            'kline': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'client/token': 1,
                            'order/{oid}': 1,
                            'client/order/{client_order_id}': 1,
                            'orders': 1,
                            'client/trade/{tid}': 1,
                            'order/{oid}/trades': 1,
                            'client/trades': 1,
                            'client/hist_trades': 1,
                            'staking/yield_history': 1,
                            'client/holding': 1,
                            'asset/deposit': 10,
                            'asset/history': 60,
                            'sub_account/all': 60,
                            'sub_account/assets': 60,
                            'sub_account/asset_detail': 60,
                            'sub_account/ip_restriction': 10,
                            'asset/main_sub_transfer_history': 30,
                            'token_interest': 60,
                            'token_interest/{token}': 60,
                            'interest/history': 60,
                            'interest/repay': 60,
                            'funding_fee/history': 30,
                            'positions': 3.33,
                            'position/{symbol}': 3.33,
                            'client/transaction_history': 60,
                        },
                        'post': {
                            'order': 5,
                            'order/cancel_all_after': 1,
                            'asset/main_sub_transfer': 30,
                            'asset/ltv': 30,
                            'asset/withdraw': 30,
                            'asset/internal_withdraw': 30,
                            'interest/repay': 60,
                            'client/account_mode': 120,
                            'client/position_mode': 5,
                            'client/leverage': 120,
                        },
                        'delete': {
                            'order': 1,
                            'client/order': 1,
                            'orders': 1,
                            'asset/withdraw': 120, // implemented in ccxt, disabled on the exchange side https://kronosresearch.github.io/wootrade-documents/#cancel-withdraw-request
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
                'v3': {
                    'public': {
                        'get': {
                            'insuranceFund': 3,
                        },
                    },
                    'private': {
                        'get': {
                            'algo/order/{oid}': 1,
                            'algo/orders': 1,
                            'balances': 1,
                            'accountinfo': 60,
                            'positions': 3.33,
                            'buypower': 1,
                            'referrals': 60,
                            'referral_rewards': 60,
                            'convert/exchangeInfo': 1,
                            'convert/assetInfo': 1,
                            'convert/rfq': 60,
                            'convert/trade': 1,
                            'convert/trades': 1,
                        },
                        'post': {
                            'algo/order': 5,
                            'convert/rft': 60,
                        },
                        'put': {
                            'order/{oid}': 2,
                            'order/client/{client_order_id}': 2,
                            'algo/order/{oid}': 2,
                            'algo/order/client/{client_order_id}': 2,
                        },
                        'delete': {
                            'algo/order/{order_id}': 1,
                            'algo/orders/pending': 1,
                            'algo/orders/pending/{symbol}': 1,
                            'orders/pending': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber('0.0002'),
                    'taker': this.parseNumber('0.0005'),
                },
            },
            'options': {
                'sandboxMode': false,
                'createMarketBuyOrderRequiresPrice': true,
                // these network aliases require manual mapping here
                'network-aliases-for-tokens': {
                    'HT': 'ERC20',
                    'OMG': 'ERC20',
                    'UATOM': 'ATOM',
                    'ZRX': 'ZRX',
                },
                'networks': {
                    'TRX': 'TRON',
                    'TRC20': 'TRON',
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                },
                // override defaultNetworkCodePriorities for a specific currency
                'defaultNetworkCodeForCurrencies': {
                // 'USDT': 'TRC20',
                // 'BTC': 'BTC',
                },
                'transfer': {
                    'fillResponseFromRequest': true,
                },
                'brokerId': 'bc830de7-50f3-460b-9ee0-f430f83f9dad',
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    '-1000': errors.ExchangeError,
                    '-1001': errors.AuthenticationError,
                    '-1002': errors.AuthenticationError,
                    '-1003': errors.RateLimitExceeded,
                    '-1004': errors.BadRequest,
                    '-1005': errors.BadRequest,
                    '-1006': errors.BadRequest,
                    '-1007': errors.BadRequest,
                    '-1008': errors.InvalidOrder,
                    '-1009': errors.BadRequest,
                    '-1012': errors.BadRequest,
                    '-1101': errors.InvalidOrder,
                    '-1102': errors.InvalidOrder,
                    '-1103': errors.InvalidOrder,
                    '-1104': errors.InvalidOrder,
                    '-1105': errors.InvalidOrder, // { "code": -1105,  "message": "Price is X% too high or X% too low from the mid price." }
                },
                'broad': {
                    'Can not place': errors.ExchangeError,
                    'maintenance': errors.OnMaintenance,
                    'symbol must not be blank': errors.BadRequest,
                    'The token is not supported': errors.BadRequest,
                    'Your order and symbol are not valid or already canceled': errors.BadRequest,
                    'Insufficient WOO. Please enable margin trading for leverage trading': errors.BadRequest, // when selling insufficent token [-1012]
                },
            },
            'precisionMode': number.TICK_SIZE,
        });
    }
    async fetchStatus(params = {}) {
        /**
         * @method
         * @name woo#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://docs.woo.org/#get-system-maintenance-status-public
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.v1PublicGetSystemInfo(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": "0",
        //             "msg": "System is functioning properly."
        //         },
        //         "timestamp": "1709274106602"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        let status = this.safeString(data, 'status');
        if (status === undefined) {
            status = 'error';
        }
        else if (status === '0') {
            status = 'ok';
        }
        else {
            status = 'maintenance';
        }
        return {
            'status': status,
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    async fetchTime(params = {}) {
        /**
         * @method
         * @name woo#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://docs.woo.org/#get-system-maintenance-status-public
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.v1PublicGetSystemInfo(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "status": "0",
        //             "msg": "System is functioning properly."
        //         },
        //         "timestamp": "1709274106602"
        //     }
        //
        return this.safeInteger(response, 'timestamp');
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name woo#fetchMarkets
         * @description retrieves data on all markets for woo
         * @see https://docs.woo.org/#exchange-information
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.v1PublicGetInfo(params);
        //
        // {
        //     "rows": [
        //         {
        //             "symbol": "SPOT_AAVE_USDT",
        //             "quote_min": 0,
        //             "quote_max": 100000,
        //             "quote_tick": 0.01,
        //             "base_min": 0.01,
        //             "base_max": 7284,
        //             "base_tick": 0.0001,
        //             "min_notional": 10,
        //             "price_range": 0.1,
        //             "created_time": "0",
        //             "updated_time": "1639107647.988",
        //             "is_stable": 0
        //         },
        //         ...
        //     "success": true
        // }
        //
        const data = this.safeList(response, 'rows', []);
        return this.parseMarkets(data);
    }
    parseMarket(market) {
        const marketId = this.safeString(market, 'symbol');
        const parts = marketId.split('_');
        const first = this.safeString(parts, 0);
        let marketType;
        let spot = false;
        let swap = false;
        if (first === 'SPOT') {
            spot = true;
            marketType = 'spot';
        }
        else if (first === 'PERP') {
            swap = true;
            marketType = 'swap';
        }
        const baseId = this.safeString(parts, 1);
        const quoteId = this.safeString(parts, 2);
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        let settleId = undefined;
        let settle = undefined;
        let symbol = base + '/' + quote;
        let contractSize = undefined;
        let linear = undefined;
        let margin = true;
        const contract = swap;
        if (contract) {
            margin = false;
            settleId = this.safeString(parts, 2);
            settle = this.safeCurrencyCode(settleId);
            symbol = base + '/' + quote + ':' + settle;
            contractSize = this.parseNumber('1');
            linear = true;
        }
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': spot,
            'margin': margin,
            'swap': swap,
            'future': false,
            'option': false,
            'active': undefined,
            'contract': contract,
            'linear': linear,
            'inverse': undefined,
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(market, 'base_tick'),
                'price': this.safeNumber(market, 'quote_tick'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'base_min'),
                    'max': this.safeNumber(market, 'base_max'),
                },
                'price': {
                    'min': this.safeNumber(market, 'quote_min'),
                    'max': this.safeNumber(market, 'quote_max'),
                },
                'cost': {
                    'min': this.safeNumber(market, 'min_notional'),
                    'max': undefined,
                },
            },
            'created': this.safeTimestamp(market, 'created_time'),
            'info': market,
        };
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.woo.org/#market-trades-public
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PublicGetMarketTrades(this.extend(request, params));
        //
        // {
        //     "success": true,
        //     "rows": [
        //         {
        //             "symbol": "SPOT_BTC_USDT",
        //             "side": "SELL",
        //             "executed_price": 46222.35,
        //             "executed_quantity": 0.0012,
        //             "executed_timestamp": "1641241162.329"
        //         },
        //         {
        //             "symbol": "SPOT_BTC_USDT",
        //             "side": "SELL",
        //             "executed_price": 46222.35,
        //             "executed_quantity": 0.0012,
        //             "executed_timestamp": "1641241162.329"
        //         },
        //         {
        //             "symbol": "SPOT_BTC_USDT",
        //             "side": "BUY",
        //             "executed_price": 46224.32,
        //             "executed_quantity": 0.00039,
        //             "executed_timestamp": "1641241162.287"
        //         },
        //         ...
        //      ]
        // }
        //
        const resultResponse = this.safeList(response, 'rows', []);
        return this.parseTrades(resultResponse, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // public/market_trades
        //
        //     {
        //         "symbol": "SPOT_BTC_USDT",
        //         "side": "SELL",
        //         "executed_price": 46222.35,
        //         "executed_quantity": 0.0012,
        //         "executed_timestamp": "1641241162.329"
        //     }
        //
        // fetchOrderTrades, fetchOrder
        //
        //     {
        //         "id": "99119876",
        //         "symbol": "SPOT_WOO_USDT",
        //         "fee": "0.0024",
        //         "side": "BUY",
        //         "executed_timestamp": "1641481113.084",
        //         "order_id": "87001234",
        //         "order_tag": "default", <-- this param only in "fetchOrderTrades"
        //         "executed_price": "1",
        //         "executed_quantity": "12",
        //         "fee_asset": "WOO",
        //         "is_maker": "1"
        //     }
        //
        const isFromFetchOrder = ('id' in trade);
        const timestamp = this.safeTimestamp(trade, 'executed_timestamp');
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString(trade, 'executed_price');
        const amount = this.safeString(trade, 'executed_quantity');
        const order_id = this.safeString(trade, 'order_id');
        const fee = this.parseTokenAndFeeTemp(trade, 'fee_asset', 'fee');
        const cost = Precise["default"].stringMul(price, amount);
        const side = this.safeStringLower(trade, 'side');
        const id = this.safeString(trade, 'id');
        let takerOrMaker = undefined;
        if (isFromFetchOrder) {
            const isMaker = this.safeString(trade, 'is_maker') === '1';
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        return this.safeTrade({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
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
    parseTokenAndFeeTemp(item, feeTokenKey, feeAmountKey) {
        const feeCost = this.safeString(item, feeAmountKey);
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString(item, feeTokenKey);
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return fee;
    }
    async fetchTradingFees(params = {}) {
        /**
         * @method
         * @name woo#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @see https://docs.woo.org/#get-account-information-new
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const response = await this.v3PrivateGetAccountinfo(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "applicationId": "dsa",
        //             "account": "dsa",
        //             "alias": "haha",
        //             "accountMode": "MARGIN",
        //             "leverage": 1,
        //             "takerFeeRate": 1,
        //             "makerFeeRate": 1,
        //             "interestRate": 1,
        //             "futuresTakerFeeRate": 1,
        //             "futuresMakerFeeRate": 1,
        //             "otpauth": true,
        //             "marginRatio": 1,
        //             "openMarginRatio": 1,
        //             "initialMarginRatio": 1,
        //             "maintenanceMarginRatio": 1,
        //             "totalCollateral": 1,
        //             "freeCollateral": 1,
        //             "totalAccountValue": 1,
        //             "totalVaultValue": 1,
        //             "totalStakingValue": 1
        //         },
        //         "timestamp": 1673323685109
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const maker = this.safeString(data, 'makerFeeRate');
        const taker = this.safeString(data, 'takerFeeRate');
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
                'maker': this.parseNumber(Precise["default"].stringDiv(maker, '10000')),
                'taker': this.parseNumber(Precise["default"].stringDiv(taker, '10000')),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name woo#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.woo.org/#available-token-public
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const result = {};
        const tokenResponse = await this.v1PublicGetToken(params);
        //
        // {
        //     "rows": [
        //         {
        //             "token": "ETH_USDT",
        //             "fullname": "Tether",
        //             "decimals": 6,
        //             "balance_token": "USDT",
        //             "created_time": "0",
        //             "updated_time": "0"
        //         },
        //         {
        //             "token": "BSC_USDT",
        //             "fullname": "Tether",
        //             "decimals": 18,
        //             "balance_token": "USDT",
        //             "created_time": "0",
        //             "updated_time": "0"
        //         },
        //         {
        //             "token": "ZEC",
        //             "fullname": "ZCash",
        //             "decimals": 8,
        //             "balance_token": "ZEC",
        //             "created_time": "0",
        //             "updated_time": "0"
        //         },
        //         ...
        //     ],
        //     "success": true
        // }
        //
        // only make one request for currrencies...
        // const tokenNetworkResponse = await this.v1PublicGetTokenNetwork (params);
        //
        // {
        //     "rows": [
        //         {
        //             "protocol": "ERC20",
        //             "token": "USDT",
        //             "name": "Ethereum",
        //             "minimum_withdrawal": 30,
        //             "withdrawal_fee": 25,
        //             "allow_deposit": 1,
        //             "allow_withdraw": 1
        //         },
        //         {
        //             "protocol": "TRC20",
        //             "token": "USDT",
        //             "name": "Tron",
        //             "minimum_withdrawal": 30,
        //             "withdrawal_fee": 1,
        //             "allow_deposit": 1,
        //             "allow_withdraw": 1
        //         },
        //         ...
        //     ],
        //     "success": true
        // }
        //
        const tokenRows = this.safeList(tokenResponse, 'rows', []);
        const networksByCurrencyId = this.groupBy(tokenRows, 'balance_token');
        const currencyIds = Object.keys(networksByCurrencyId);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const networks = networksByCurrencyId[currencyId];
            const code = this.safeCurrencyCode(currencyId);
            let name = undefined;
            let minPrecision = undefined;
            const resultingNetworks = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                name = this.safeString(network, 'fullname');
                const networkId = this.safeString(network, 'token');
                const splitted = networkId.split('_');
                const unifiedNetwork = splitted[0];
                const precision = this.parsePrecision(this.safeString(network, 'decimals'));
                if (precision !== undefined) {
                    minPrecision = (minPrecision === undefined) ? precision : Precise["default"].stringMin(precision, minPrecision);
                }
                resultingNetworks[unifiedNetwork] = {
                    'id': networkId,
                    'network': unifiedNetwork,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'active': undefined,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': undefined,
                    'precision': this.parseNumber(precision),
                    'info': network,
                };
            }
            result[code] = {
                'id': currencyId,
                'name': name,
                'code': code,
                'precision': this.parseNumber(minPrecision),
                'active': undefined,
                'fee': undefined,
                'networks': resultingNetworks,
                'deposit': undefined,
                'withdraw': undefined,
                'limits': {
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': networks,
            };
        }
        return result;
    }
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        /**
         * @method
         * @name woo#createMarketBuyOrderWithCost
         * @description create a market buy order by providing the symbol and cost
         * @see https://docs.woo.org/#send-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        params['createMarketBuyOrderRequiresPrice'] = false;
        return await this.createOrder(symbol, 'market', 'buy', cost, undefined, params);
    }
    async createTrailingAmountOrder(symbol, type, side, amount, price = undefined, trailingAmount = undefined, trailingTriggerPrice = undefined, params = {}) {
        /**
         * @method
         * @name woo#createTrailingAmountOrder
         * @description create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
         * @see https://docs.woo.org/#send-algo-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
         * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
         * @param {float} trailingAmount the quote amount to trail away from the current market price
         * @param {float} trailingTriggerPrice the price to activate a trailing order, default uses the price argument
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (trailingAmount === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createTrailingAmountOrder() requires a trailingAmount argument');
        }
        if (trailingTriggerPrice === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createTrailingAmountOrder() requires a trailingTriggerPrice argument');
        }
        params['trailingAmount'] = trailingAmount;
        params['trailingTriggerPrice'] = trailingTriggerPrice;
        return await this.createOrder(symbol, type, side, amount, price, params);
    }
    async createTrailingPercentOrder(symbol, type, side, amount, price = undefined, trailingPercent = undefined, trailingTriggerPrice = undefined, params = {}) {
        /**
         * @method
         * @name woo#createTrailingPercentOrder
         * @description create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
         * @see https://docs.woo.org/#send-algo-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
         * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
         * @param {float} trailingPercent the percent to trail away from the current market price
         * @param {float} trailingTriggerPrice the price to activate a trailing order, default uses the price argument
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (trailingPercent === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createTrailingPercentOrder() requires a trailingPercent argument');
        }
        if (trailingTriggerPrice === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createTrailingPercentOrder() requires a trailingTriggerPrice argument');
        }
        params['trailingPercent'] = trailingPercent;
        params['trailingTriggerPrice'] = trailingTriggerPrice;
        return await this.createOrder(symbol, type, side, amount, price, params);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name woo#createOrder
         * @description create a trade order
         * @see https://docs.woo.org/#send-order
         * @see https://docs.woo.org/#send-algo-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] The price a trigger order is triggered at
         * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
         * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
         * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
         * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
         * @param {float} [params.algoType] 'STOP'or 'TRAILING_STOP' or 'OCO' or 'CLOSE_POSITION'
         * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
         * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
         * @param {string} [params.trailingPercent] the percent to trail away from the current market price
         * @param {string} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const reduceOnly = this.safeBool2(params, 'reduceOnly', 'reduce_only');
        params = this.omit(params, ['reduceOnly', 'reduce_only']);
        const orderType = type.toUpperCase();
        await this.loadMarkets();
        const market = this.market(symbol);
        const orderSide = side.toUpperCase();
        const request = {
            'symbol': market['id'],
            'side': orderSide,
        };
        const stopPrice = this.safeNumber2(params, 'triggerPrice', 'stopPrice');
        const stopLoss = this.safeValue(params, 'stopLoss');
        const takeProfit = this.safeValue(params, 'takeProfit');
        const algoType = this.safeString(params, 'algoType');
        const trailingTriggerPrice = this.safeString2(params, 'trailingTriggerPrice', 'activatedPrice', this.numberToString(price));
        const trailingAmount = this.safeString2(params, 'trailingAmount', 'callbackValue');
        const trailingPercent = this.safeString2(params, 'trailingPercent', 'callbackRate');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isTrailing = isTrailingAmountOrder || isTrailingPercentOrder;
        const isStop = isTrailing || stopPrice !== undefined || stopLoss !== undefined || takeProfit !== undefined || (this.safeValue(params, 'childOrders') !== undefined);
        const isMarket = orderType === 'MARKET';
        const timeInForce = this.safeStringLower(params, 'timeInForce');
        const postOnly = this.isPostOnly(isMarket, undefined, params);
        const reduceOnlyKey = isStop ? 'reduceOnly' : 'reduce_only';
        const clientOrderIdKey = isStop ? 'clientOrderId' : 'client_order_id';
        const orderQtyKey = isStop ? 'quantity' : 'order_quantity';
        const priceKey = isStop ? 'price' : 'order_price';
        const typeKey = isStop ? 'type' : 'order_type';
        request[typeKey] = orderType; // LIMIT/MARKET/IOC/FOK/POST_ONLY/ASK/BID
        if (!isStop) {
            if (postOnly) {
                request['order_type'] = 'POST_ONLY';
            }
            else if (timeInForce === 'fok') {
                request['order_type'] = 'FOK';
            }
            else if (timeInForce === 'ioc') {
                request['order_type'] = 'IOC';
            }
        }
        if (reduceOnly) {
            request[reduceOnlyKey] = reduceOnly;
        }
        if (price !== undefined) {
            request[priceKey] = this.priceToPrecision(symbol, price);
        }
        if (isMarket && !isStop) {
            // for market buy it requires the amount of quote currency to spend
            if (market['spot'] && orderSide === 'BUY') {
                let quoteAmount = undefined;
                let createMarketBuyOrderRequiresPrice = true;
                [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                const cost = this.safeNumber2(params, 'cost', 'order_amount');
                params = this.omit(params, ['cost', 'order_amount']);
                if (cost !== undefined) {
                    quoteAmount = this.costToPrecision(symbol, cost);
                }
                else if (createMarketBuyOrderRequiresPrice) {
                    if (price === undefined) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend (quote quantity) in the amount argument');
                    }
                    else {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        const costRequest = Precise["default"].stringMul(amountString, priceString);
                        quoteAmount = this.costToPrecision(symbol, costRequest);
                    }
                }
                else {
                    quoteAmount = this.costToPrecision(symbol, amount);
                }
                request['order_amount'] = quoteAmount;
            }
            else {
                request['order_quantity'] = this.amountToPrecision(symbol, amount);
            }
        }
        else if (algoType !== 'POSITIONAL_TP_SL') {
            request[orderQtyKey] = this.amountToPrecision(symbol, amount);
        }
        const clientOrderId = this.safeStringN(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        if (clientOrderId !== undefined) {
            request[clientOrderIdKey] = clientOrderId;
        }
        if (isTrailing) {
            if (trailingTriggerPrice === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a trailingTriggerPrice parameter for trailing orders');
            }
            request['activatedPrice'] = this.priceToPrecision(symbol, trailingTriggerPrice);
            request['algoType'] = 'TRAILING_STOP';
            if (isTrailingAmountOrder) {
                request['callbackValue'] = trailingAmount;
            }
            else if (isTrailingPercentOrder) {
                const convertedTrailingPercent = Precise["default"].stringDiv(trailingPercent, '100');
                request['callbackRate'] = convertedTrailingPercent;
            }
        }
        else if (stopPrice !== undefined) {
            if (algoType !== 'TRAILING_STOP') {
                request['triggerPrice'] = this.priceToPrecision(symbol, stopPrice);
                request['algoType'] = 'STOP';
            }
        }
        else if ((stopLoss !== undefined) || (takeProfit !== undefined)) {
            request['algoType'] = 'BRACKET';
            const outterOrder = {
                'symbol': market['id'],
                'reduceOnly': false,
                'algoType': 'POSITIONAL_TP_SL',
                'childOrders': [],
            };
            const closeSide = (orderSide === 'BUY') ? 'SELL' : 'BUY';
            if (stopLoss !== undefined) {
                const stopLossPrice = this.safeNumber2(stopLoss, 'triggerPrice', 'price', stopLoss);
                const stopLossOrder = {
                    'side': closeSide,
                    'algoType': 'STOP_LOSS',
                    'triggerPrice': this.priceToPrecision(symbol, stopLossPrice),
                    'type': 'CLOSE_POSITION',
                    'reduceOnly': true,
                };
                outterOrder['childOrders'].push(stopLossOrder);
            }
            if (takeProfit !== undefined) {
                const takeProfitPrice = this.safeNumber2(takeProfit, 'triggerPrice', 'price', takeProfit);
                const takeProfitOrder = {
                    'side': closeSide,
                    'algoType': 'TAKE_PROFIT',
                    'triggerPrice': this.priceToPrecision(symbol, takeProfitPrice),
                    'type': 'CLOSE_POSITION',
                    'reduceOnly': true,
                };
                outterOrder['childOrders'].push(takeProfitOrder);
            }
            request['childOrders'] = [outterOrder];
        }
        params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id', 'postOnly', 'timeInForce', 'stopPrice', 'triggerPrice', 'stopLoss', 'takeProfit', 'trailingPercent', 'trailingAmount', 'trailingTriggerPrice']);
        let response = undefined;
        if (isStop) {
            response = await this.v3PrivatePostAlgoOrder(this.extend(request, params));
        }
        else {
            response = await this.v1PrivatePostOrder(this.extend(request, params));
        }
        // {
        //     "success": true,
        //     "timestamp": "1641383206.489",
        //     "order_id": "86980774",
        //     "order_type": "LIMIT",
        //     "order_price": "1", // null for "MARKET" order
        //     "order_quantity": "12", // null for "MARKET" order
        //     "order_amount": null, // NOT-null for "MARKET" order
        //     "client_order_id": "0"
        // }
        // stop orders
        // {
        //     "success": true,
        //     "data": {
        //       "rows": [
        //         {
        //           "orderId": "1578938",
        //           "clientOrderId": "0",
        //           "algoType": "STOP_LOSS",
        //           "quantity": "0.1"
        //         }
        //       ]
        //     },
        //     "timestamp": "1686149372216"
        // }
        const data = this.safeDict(response, 'data');
        if (data !== undefined) {
            const rows = this.safeList(data, 'rows', []);
            return this.parseOrder(rows[0], market);
        }
        const order = this.parseOrder(response, market);
        order['type'] = type;
        return order;
    }
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name woo#editOrder
         * @description edit a trade order
         * @see https://docs.woo.org/#edit-order
         * @see https://docs.woo.org/#edit-order-by-client_order_id
         * @see https://docs.woo.org/#edit-algo-order
         * @see https://docs.woo.org/#edit-algo-order-by-client_order_id
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] The price a trigger order is triggered at
         * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
         * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
         * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
         * @param {string} [params.trailingPercent] the percent to trail away from the current market price
         * @param {string} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
        // 'quantity': this.amountToPrecision (symbol, amount),
        // 'price': this.priceToPrecision (symbol, price),
        };
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if (amount !== undefined) {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        const clientOrderIdUnified = this.safeString2(params, 'clOrdID', 'clientOrderId');
        const clientOrderIdExchangeSpecific = this.safeString(params, 'client_order_id', clientOrderIdUnified);
        const isByClientOrder = clientOrderIdExchangeSpecific !== undefined;
        const stopPrice = this.safeNumberN(params, ['triggerPrice', 'stopPrice', 'takeProfitPrice', 'stopLossPrice']);
        if (stopPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision(symbol, stopPrice);
        }
        const trailingTriggerPrice = this.safeString2(params, 'trailingTriggerPrice', 'activatedPrice', this.numberToString(price));
        const trailingAmount = this.safeString2(params, 'trailingAmount', 'callbackValue');
        const trailingPercent = this.safeString2(params, 'trailingPercent', 'callbackRate');
        const isTrailingAmountOrder = trailingAmount !== undefined;
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const isTrailing = isTrailingAmountOrder || isTrailingPercentOrder;
        if (isTrailing) {
            if (trailingTriggerPrice !== undefined) {
                request['activatedPrice'] = this.priceToPrecision(symbol, trailingTriggerPrice);
            }
            if (isTrailingAmountOrder) {
                request['callbackValue'] = trailingAmount;
            }
            else if (isTrailingPercentOrder) {
                const convertedTrailingPercent = Precise["default"].stringDiv(trailingPercent, '100');
                request['callbackRate'] = convertedTrailingPercent;
            }
        }
        params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id', 'stopPrice', 'triggerPrice', 'takeProfitPrice', 'stopLossPrice', 'trailingTriggerPrice', 'trailingAmount', 'trailingPercent']);
        const isStop = isTrailing || (stopPrice !== undefined) || (this.safeValue(params, 'childOrders') !== undefined);
        let response = undefined;
        if (isByClientOrder) {
            request['client_order_id'] = clientOrderIdExchangeSpecific;
            if (isStop) {
                response = await this.v3PrivatePutAlgoOrderClientClientOrderId(this.extend(request, params));
            }
            else {
                response = await this.v3PrivatePutOrderClientClientOrderId(this.extend(request, params));
            }
        }
        else {
            request['oid'] = id;
            if (isStop) {
                response = await this.v3PrivatePutAlgoOrderOid(this.extend(request, params));
            }
            else {
                response = await this.v3PrivatePutOrderOid(this.extend(request, params));
            }
        }
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "status": "string",
        //             "success": true
        //         },
        //         "message": "string",
        //         "success": true,
        //         "timestamp": 0
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name woo#cancelOrder
         * @see https://docs.woo.org/#cancel-algo-order
         * @see https://docs.woo.org/#cancel-order
         * @see https://docs.woo.org/#cancel-order-by-client_order_id
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.stop] whether the order is a stop/algo order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const stop = this.safeBool(params, 'stop', false);
        params = this.omit(params, 'stop');
        if (!stop && (symbol === undefined)) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        const clientOrderIdUnified = this.safeString2(params, 'clOrdID', 'clientOrderId');
        const clientOrderIdExchangeSpecific = this.safeString(params, 'client_order_id', clientOrderIdUnified);
        const isByClientOrder = clientOrderIdExchangeSpecific !== undefined;
        let response = undefined;
        if (stop) {
            request['order_id'] = id;
            response = await this.v3PrivateDeleteAlgoOrderOrderId(this.extend(request, params));
        }
        else {
            request['symbol'] = market['id'];
            if (isByClientOrder) {
                request['client_order_id'] = clientOrderIdExchangeSpecific;
                params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
                response = await this.v1PrivateDeleteClientOrder(this.extend(request, params));
            }
            else {
                request['order_id'] = id;
                response = await this.v1PrivateDeleteOrder(this.extend(request, params));
            }
        }
        //
        // { success: true, status: "CANCEL_SENT" }
        //
        const extendParams = { 'symbol': symbol };
        if (isByClientOrder) {
            extendParams['client_order_id'] = clientOrderIdExchangeSpecific;
        }
        else {
            extendParams['id'] = id;
        }
        return this.extend(this.parseOrder(response), extendParams);
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name woo#cancelAllOrders
         * @see https://docs.woo.org/#cancel-all-pending-orders
         * @see https://docs.woo.org/#cancel-orders
         * @see https://docs.woo.org/#cancel-all-pending-algo-orders
         * @description cancel all open orders in a market
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.stop] whether the order is a stop/algo order
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const stop = this.safeBool2(params, 'stop', 'trigger');
        params = this.omit(params, ['stop', 'trigger']);
        if (stop) {
            return await this.v3PrivateDeleteAlgoOrdersPending(params);
        }
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument');
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PrivateDeleteOrders(this.extend(request, params));
        //
        //     {
        //         "success":true,
        //         "status":"CANCEL_ALL_SENT"
        //     }
        //
        return response;
    }
    async cancelAllOrdersAfter(timeout, params = {}) {
        /**
         * @method
         * @name woo#cancelAllOrdersAfter
         * @description dead man's switch, cancel all orders after the given timeout
         * @see https://docs.woo.org/#cancel-all-after
         * @param {number} timeout time in milliseconds, 0 represents cancel the timer
         * @param {boolean} activated countdown
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} the api result
         */
        await this.loadMarkets();
        const request = {
            'trigger_after': (timeout > 0) ? timeout : 0,
        };
        const response = await this.v1PrivatePostOrderCancelAllAfter(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "expected_trigger_time": 1711534302938
        //         },
        //         "timestamp": 1711534302943
        //     }
        //
        return response;
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOrder
         * @see https://docs.woo.org/#get-algo-order
         * @see https://docs.woo.org/#get-order
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.stop] whether the order is a stop/algo order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = (symbol !== undefined) ? this.market(symbol) : undefined;
        const stop = this.safeBool2(params, 'stop', 'trigger');
        params = this.omit(params, ['stop', 'trigger']);
        const request = {};
        const clientOrderId = this.safeString2(params, 'clOrdID', 'clientOrderId');
        let response = undefined;
        if (stop) {
            request['oid'] = id;
            response = await this.v3PrivateGetAlgoOrderOid(this.extend(request, params));
        }
        else if (clientOrderId) {
            request['client_order_id'] = clientOrderId;
            response = await this.v1PrivateGetClientOrderClientOrderId(this.extend(request, params));
        }
        else {
            request['oid'] = id;
            response = await this.v1PrivateGetOrderOid(this.extend(request, params));
        }
        //
        // {
        //     "success": true,
        //     "symbol": "SPOT_WOO_USDT",
        //     "status": "FILLED", // FILLED, NEW
        //     "side": "BUY",
        //     "created_time": "1641480933.000",
        //     "order_id": "87541111",
        //     "order_tag": "default",
        //     "price": "1",
        //     "type": "LIMIT",
        //     "quantity": "12",
        //     "amount": null,
        //     "visible": "12",
        //     "executed": "12", // or any partial amount
        //     "total_fee": "0.0024",
        //     "fee_asset": "WOO",
        //     "client_order_id": null,
        //     "average_executed_price": "1",
        //     "Transactions": [
        //       {
        //         "id": "99111647",
        //         "symbol": "SPOT_WOO_USDT",
        //         "fee": "0.0024",
        //         "side": "BUY",
        //         "executed_timestamp": "1641482113.084",
        //         "order_id": "87541111",
        //         "executed_price": "1",
        //         "executed_quantity": "12",
        //         "fee_asset": "WOO",
        //         "is_maker": "1"
        //       }
        //     ]
        // }
        //
        const orders = this.safeDict(response, 'data', response);
        return this.parseOrder(orders, market);
    }
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://docs.woo.org/#get-orders
         * @see https://docs.woo.org/#get-algo-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.stop] whether the order is a stop/algo order
         * @param {boolean} [params.isTriggered] whether the order has been triggered (false by default)
         * @param {string} [params.side] 'buy' or 'sell'
         * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
         * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchOrders', symbol, since, limit, params, 'page', 500);
        }
        const request = {};
        let market = undefined;
        const stop = this.safeBool2(params, 'stop', 'trigger');
        const trailing = this.safeBool(params, 'trailing', false);
        params = this.omit(params, ['stop', 'trailing', 'trigger']);
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            if (stop || trailing) {
                request['createdTimeStart'] = since;
            }
            else {
                request['start_t'] = since;
            }
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        else {
            request['size'] = 500;
        }
        if (stop) {
            request['algoType'] = 'stop';
        }
        else if (trailing) {
            request['algoType'] = 'TRAILING_STOP';
        }
        let response = undefined;
        if (stop || trailing) {
            response = await this.v3PrivateGetAlgoOrders(this.extend(request, params));
        }
        else {
            response = await this.v1PrivateGetOrders(this.extend(request, params));
        }
        //
        //     {
        //         "success":true,
        //         "meta":{
        //             "total":1,
        //             "records_per_page":100,
        //             "current_page":1
        //         },
        //         "rows":[
        //             {
        //                 "symbol":"PERP_BTC_USDT",
        //                 "status":"FILLED",
        //                 "side":"SELL",
        //                 "created_time":"1611617776.000",
        //                 "updated_time":"1611617776.000",
        //                 "order_id":52121167,
        //                 "order_tag":"default",
        //                 "price":null,
        //                 "type":"MARKET",
        //                 "quantity":0.002,
        //                 "amount":null,
        //                 "visible":0,
        //                 "executed":0.002,
        //                 "total_fee":0.01732885,
        //                 "fee_asset":"USDT",
        //                 "client_order_id":null,
        //                 "average_executed_price":28881.41
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', response);
        const orders = this.safeList(data, 'rows');
        return this.parseOrders(orders, market, since, limit);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOpenOrders
         * @description fetches information on multiple orders made by the user
         * @see https://docs.woo.org/#get-orders
         * @see https://docs.woo.org/#get-algo-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.stop] whether the order is a stop/algo order
         * @param {boolean} [params.isTriggered] whether the order has been triggered (false by default)
         * @param {string} [params.side] 'buy' or 'sell'
         * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
         * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const extendedParams = this.extend(params, { 'status': 'INCOMPLETE' });
        return await this.fetchOrders(symbol, since, limit, extendedParams);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchClosedOrders
         * @description fetches information on multiple orders made by the user
         * @see https://docs.woo.org/#get-orders
         * @see https://docs.woo.org/#get-algo-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.stop] whether the order is a stop/algo order
         * @param {boolean} [params.isTriggered] whether the order has been triggered (false by default)
         * @param {string} [params.side] 'buy' or 'sell'
         * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
         * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const extendedParams = this.extend(params, { 'status': 'COMPLETED' });
        return await this.fetchOrders(symbol, since, limit, extendedParams);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'ioc': 'IOC',
            'fok': 'FOK',
            'post_only': 'PO',
        };
        return this.safeString(timeInForces, timeInForce, undefined);
    }
    parseOrder(order, market = undefined) {
        //
        // Possible input functions:
        // * createOrder
        // * cancelOrder
        // * fetchOrder
        // * fetchOrders
        // const isFromFetchOrder = ('order_tag' in order); TO_DO
        //
        // stop order after creating it:
        //   {
        //     "orderId": "1578938",
        //     "clientOrderId": "0",
        //     "algoType": "STOP_LOSS",
        //     "quantity": "0.1"
        //   }
        // stop order after fetching it:
        //   {
        //       "algoOrderId": "1578958",
        //       "clientOrderId": "0",
        //       "rootAlgoOrderId": "1578958",
        //       "parentAlgoOrderId": "0",
        //       "symbol": "SPOT_LTC_USDT",
        //       "orderTag": "default",
        //       "algoType": "STOP_LOSS",
        //       "side": "BUY",
        //       "quantity": "0.1",
        //       "isTriggered": false,
        //       "triggerPrice": "100",
        //       "triggerStatus": "USELESS",
        //       "type": "LIMIT",
        //       "rootAlgoStatus": "CANCELLED",
        //       "algoStatus": "CANCELLED",
        //       "triggerPriceType": "MARKET_PRICE",
        //       "price": "75",
        //       "triggerTime": "0",
        //       "totalExecutedQuantity": "0",
        //       "averageExecutedPrice": "0",
        //       "totalFee": "0",
        //       "feeAsset": '',
        //       "reduceOnly": false,
        //       "createdTime": "1686149609.744",
        //       "updatedTime": "1686149903.362"
        //   }
        //
        const timestamp = this.safeTimestampN(order, ['timestamp', 'created_time', 'createdTime']);
        const orderId = this.safeStringN(order, ['order_id', 'orderId', 'algoOrderId']);
        const clientOrderId = this.omitZero(this.safeString2(order, 'client_order_id', 'clientOrderId')); // Somehow, this always returns 0 for limit order
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString2(order, 'order_price', 'price');
        const amount = this.safeString2(order, 'order_quantity', 'quantity'); // This is base amount
        const cost = this.safeString2(order, 'order_amount', 'amount'); // This is quote amount
        const orderType = this.safeStringLower2(order, 'order_type', 'type');
        const status = this.safeValue2(order, 'status', 'algoStatus');
        const side = this.safeStringLower(order, 'side');
        const filled = this.omitZero(this.safeValue2(order, 'executed', 'totalExecutedQuantity'));
        const average = this.omitZero(this.safeString2(order, 'average_executed_price', 'averageExecutedPrice'));
        const remaining = Precise["default"].stringSub(cost, filled);
        const fee = this.safeValue2(order, 'total_fee', 'totalFee');
        const feeCurrency = this.safeString2(order, 'fee_asset', 'feeAsset');
        const transactions = this.safeValue(order, 'Transactions');
        const stopPrice = this.safeNumber(order, 'triggerPrice');
        let takeProfitPrice = undefined;
        let stopLossPrice = undefined;
        const childOrders = this.safeValue(order, 'childOrders');
        if (childOrders !== undefined) {
            const first = this.safeValue(childOrders, 0);
            const innerChildOrders = this.safeValue(first, 'childOrders', []);
            const innerChildOrdersLength = innerChildOrders.length;
            if (innerChildOrdersLength > 0) {
                const takeProfitOrder = this.safeValue(innerChildOrders, 0);
                const stopLossOrder = this.safeValue(innerChildOrders, 1);
                takeProfitPrice = this.safeNumber(takeProfitOrder, 'triggerPrice');
                stopLossPrice = this.safeNumber(stopLossOrder, 'triggerPrice');
            }
        }
        const lastUpdateTimestamp = this.safeTimestamp2(order, 'updatedTime', 'updated_time');
        return this.safeOrder({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': this.parseOrderStatus(status),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': this.parseTimeInForce(orderType),
            'postOnly': undefined,
            'reduceOnly': this.safeBool(order, 'reduce_only'),
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': transactions,
            'fee': {
                'cost': fee,
                'currency': feeCurrency,
            },
            'info': order,
        }, market);
    }
    parseOrderStatus(status) {
        if (status !== undefined) {
            const statuses = {
                'NEW': 'open',
                'FILLED': 'closed',
                'CANCEL_SENT': 'canceled',
                'CANCEL_ALL_SENT': 'canceled',
                'CANCELLED': 'canceled',
                'PARTIAL_FILLED': 'open',
                'REJECTED': 'rejected',
                'INCOMPLETE': 'open',
                'COMPLETED': 'closed',
            };
            return this.safeString(statuses, status, status);
        }
        return status;
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.woo.org/#orderbook-snapshot-public
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            limit = Math.min(limit, 1000);
            request['max_level'] = limit;
        }
        const response = await this.v1PublicGetOrderbookSymbol(this.extend(request, params));
        //
        // {
        //   "success": true,
        //   "timestamp": "1641562961192",
        //   "asks": [
        //     { price: '0.921', quantity: "76.01" },
        //     { price: '0.933', quantity: "477.10" },
        //     ...
        //   ],
        //   "bids": [
        //     { price: '0.940', quantity: "13502.47" },
        //     { price: '0.932', quantity: "43.91" },
        //     ...
        //   ]
        // }
        //
        const timestamp = this.safeInteger(response, 'timestamp');
        return this.parseOrderBook(response, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOHLCV
         * @see https://docs.woo.org/#kline-public
         * @see https://docs.woo.org/#kline-historical-data-public
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'type': this.safeString(this.timeframes, timeframe, timeframe),
        };
        let useHistEndpoint = since !== undefined;
        if ((limit !== undefined) && (since !== undefined)) {
            const oneThousandCandles = this.parseTimeframe(timeframe) * 1000 * 999; // 999 because there will be delay between this and the request, causing the latest candle to be excluded sometimes
            const startWithLimit = this.milliseconds() - oneThousandCandles;
            useHistEndpoint = since < startWithLimit;
        }
        if (useHistEndpoint) {
            request['start_time'] = since;
        }
        else if (limit !== undefined) { // the hist endpoint does not accept limit
            request['limit'] = Math.min(limit, 1000);
        }
        let response = undefined;
        if (!useHistEndpoint) {
            response = await this.v1PublicGetKline(this.extend(request, params));
            //
            //    {
            //        "success": true,
            //        "rows": [
            //            {
            //                "open": "0.94238",
            //                "close": "0.94271",
            //                "low": "0.94238",
            //                "high": "0.94296",
            //                "volume": "73.55",
            //                "amount": "69.32040520",
            //                "symbol": "SPOT_WOO_USDT",
            //                "type": "1m",
            //                "start_timestamp": "1641584700000",
            //                "end_timestamp": "1641584760000"
            //            },
            //            ...
            //        ]
            //    }
            //
        }
        else {
            response = await this.v1PubGetHistKline(this.extend(request, params));
            response = this.safeDict(response, 'data');
            //
            //    {
            //        "success": true,
            //        "data": {
            //            "rows": [
            //                {
            //                    "symbol": "SPOT_BTC_USDT",
            //                    "open": 44181.40000000,
            //                    "close": 44174.29000000,
            //                    "high": 44193.44000000,
            //                    "low": 44148.34000000,
            //                    "volume": 110.11930100,
            //                    "amount": 4863796.24318878,
            //                    "type": "1m",
            //                    "start_timestamp": 1704153600000,
            //                    "end_timestamp": 1704153660000
            //                },
            //                ...
            //            ]
            //        }
            //    }
            //
        }
        const rows = this.safeList(response, 'rows', []);
        return this.parseOHLCVs(rows, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        // example response in fetchOHLCV
        return [
            this.safeInteger(ohlcv, 'start_timestamp'),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'volume'),
        ];
    }
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://docs.woo.org/#get-trades
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'oid': id,
        };
        const response = await this.v1PrivateGetOrderOidTrades(this.extend(request, params));
        // {
        //     "success": true,
        //     "rows": [
        //       {
        //         "id": "99111647",
        //         "symbol": "SPOT_WOO_USDT",
        //         "fee": "0.0024",
        //         "side": "BUY",
        //         "executed_timestamp": "1641482113.084",
        //         "order_id": "87541111",
        //         "order_tag": "default",
        //         "executed_price": "1",
        //         "executed_quantity": "12",
        //         "fee_asset": "WOO",
        //         "is_maker": "1"
        //       }
        //     ]
        // }
        const trades = this.safeList(response, 'rows', []);
        return this.parseTrades(trades, market, since, limit, params);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://docs.woo.org/#get-trades
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] set to true if you want to fetch trades with pagination
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchMyTrades', symbol, since, limit, params, 'page', 500);
        }
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        else {
            request['size'] = 500;
        }
        const response = await this.v1PrivateGetClientTrades(this.extend(request, params));
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
        const trades = this.safeList(response, 'rows', []);
        return this.parseTrades(trades, market, since, limit, params);
    }
    async fetchAccounts(params = {}) {
        /**
         * @method
         * @name woo#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @see https://docs.woo.org/#get-assets-of-subaccounts
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
         */
        const response = await this.v1PrivateGetSubAccountAssets(params);
        //
        //     {
        //         "rows": [{
        //                 "application_id": "13e4fc34-e2ff-4cb7-b1e4-4c22fee7d365",
        //                 "account": "Main",
        //                 "usdt_balance": "4.0"
        //             },
        //             {
        //                 "application_id": "432952aa-a401-4e26-aff6-972920aebba3",
        //                 "account": "subaccount",
        //                 "usdt_balance": "1.0"
        //             }
        //         ],
        //         "success": true
        //     }
        //
        const rows = this.safeList(response, 'rows', []);
        return this.parseAccounts(rows, params);
    }
    parseAccount(account) {
        //
        //     {
        //         "application_id": "336952aa-a401-4e26-aff6-972920aebba3",
        //         "account": "subaccount",
        //         "usdt_balance": "1.0",
        //     }
        //
        const accountId = this.safeString(account, 'account');
        return {
            'info': account,
            'id': this.safeString(account, 'application_id'),
            'name': accountId,
            'code': undefined,
            'type': accountId === 'Main' ? 'main' : 'subaccount',
        };
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name woo#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.woo.org/#get-current-holding-get-balance-new
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        const response = await this.v3PrivateGetBalances(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "holding": [
        //                 {
        //                     "token": "0_token",
        //                     "holding": 1,
        //                     "frozen": 0,
        //                     "staked": 0,
        //                     "unbonding": 0,
        //                     "vault": 0,
        //                     "interest": 0,
        //                     "pendingShortQty": 0,
        //                     "pendingLongQty": 0,
        //                     "availableBalance": 0,
        //                     "updatedTime": 312321.121
        //                 }
        //             ]
        //         },
        //         "timestamp": 1673323746259
        //     }
        //
        const data = this.safeDict(response, 'data');
        return this.parseBalance(data);
    }
    parseBalance(response) {
        const result = {
            'info': response,
        };
        const balances = this.safeList(response, 'holding', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode(this.safeString(balance, 'token'));
            const account = this.account();
            account['total'] = this.safeString(balance, 'holding');
            account['free'] = this.safeString(balance, 'availableBalance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name woo#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://docs.woo.org/#get-token-deposit-address
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        // this method is TODO because of networks unification
        await this.loadMarkets();
        const currency = this.currency(code);
        const networkCodeDefault = this.defaultNetworkCodeForCurrency(code);
        const networkCode = this.safeString(params, 'network', networkCodeDefault);
        params = this.omit(params, 'network');
        const codeForExchange = networkCode + '_' + currency['code'];
        const request = {
            'token': codeForExchange,
        };
        const response = await this.v1PrivateGetAssetDeposit(this.extend(request, params));
        // {
        //     "success": true,
        //     "address": "3Jmtjx5544T4smrit9Eroe4PCrRkpDeKjP",
        //     "extra": ''
        // }
        const tag = this.safeString(response, 'extra');
        const address = this.safeString(response, 'address');
        this.checkAddress(address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': networkCode,
            'info': response,
        };
    }
    async getAssetHistoryRows(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['balance_token'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const transactionType = this.safeString(params, 'type');
        params = this.omit(params, 'type');
        if (transactionType !== undefined) {
            request['type'] = transactionType;
        }
        const response = await this.v1PrivateGetAssetHistory(this.extend(request, params));
        // {
        //     "rows": [
        //       {
        //         "id": "22010508193900165",
        //         "token": "TRON_USDT",
        //         "extra": '',
        //         "amount": "13.75848500",
        //         "status": "COMPLETED",
        //         "account": null,
        //         "description": null,
        //         "user_id": "42222",
        //         "application_id": "6ad2b303-f354-45c0-8105-9f5f19d0e335",
        //         "external_id": "220105081900134",
        //         "target_address": "TXnyFSnAYad3YCaqtwMw9jvXKkeU39NLnK",
        //         "source_address": "TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6",
        //         "type": "BALANCE",
        //         "token_side": "DEPOSIT",
        //         "tx_id": "35b0004022f6b3ad07f39a0b7af199f6b258c2c3e2c7cdc93c67efa74fd625ee",
        //         "fee_token": '',
        //         "fee_amount": "0.00000000",
        //         "created_time": "1641370779.442",
        //         "updated_time": "1641370779.465",
        //         "is_new_target_address": null,
        //         "confirmed_number": "29",
        //         "confirming_threshold": "27",
        //         "audit_tag": "1",
        //         "audit_result": "0",
        //         "balance_token": null, // TODO -write to support, that this seems broken. here should be the token id
        //         "network_name": null // TODO -write to support, that this seems broken. here should be the network id
        //       }
        //     ],
        //     "meta": { total: '1', records_per_page: "25", current_page: "1" },
        //     "success": true
        // }
        return [currency, this.safeList(response, 'rows', [])];
    }
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://docs.woo.org/#get-asset-history
         * @param {string} code unified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        const [currency, rows] = await this.getAssetHistoryRows(code, since, limit, params);
        return this.parseLedger(rows, currency, since, limit, params);
    }
    parseLedgerEntry(item, currency = undefined) {
        const networkizedCode = this.safeString(item, 'token');
        const currencyDefined = this.getCurrencyFromChaincode(networkizedCode, currency);
        const code = currencyDefined['code'];
        const amount = this.safeNumber(item, 'amount');
        const side = this.safeString(item, 'token_side');
        const direction = (side === 'DEPOSIT') ? 'in' : 'out';
        const timestamp = this.safeTimestamp(item, 'created_time');
        const fee = this.parseTokenAndFeeTemp(item, 'fee_token', 'fee_amount');
        return {
            'id': this.safeString(item, 'id'),
            'currency': code,
            'account': this.safeString(item, 'account'),
            'referenceAccount': undefined,
            'referenceId': this.safeString(item, 'tx_id'),
            'status': this.parseTransactionStatus(this.safeString(item, 'status')),
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'fee': fee,
            'direction': direction,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'type': this.parseLedgerEntryType(this.safeString(item, 'type')),
            'info': item,
        };
    }
    parseLedgerEntryType(type) {
        const types = {
            'BALANCE': 'transaction',
            'COLLATERAL': 'transfer', // Funds moved between portfolios
        };
        return this.safeString(types, type, type);
    }
    getCurrencyFromChaincode(networkizedCode, currency) {
        if (currency !== undefined) {
            return currency;
        }
        else {
            const parts = networkizedCode.split('_');
            const partsLength = parts.length;
            const firstPart = this.safeString(parts, 0);
            let currencyId = this.safeString(parts, 1, firstPart);
            if (partsLength > 2) {
                currencyId += '_' + this.safeString(parts, 2);
            }
            currency = this.safeCurrency(currencyId);
        }
        return currency;
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://docs.woo.org/#get-asset-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const request = {
            'token_side': 'DEPOSIT',
        };
        return await this.fetchDepositsWithdrawals(code, since, limit, this.extend(request, params));
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://docs.woo.org/#get-asset-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const request = {
            'token_side': 'WITHDRAW',
        };
        return await this.fetchDepositsWithdrawals(code, since, limit, this.extend(request, params));
    }
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchDepositsWithdrawals
         * @description fetch history of deposits and withdrawals
         * @see https://docs.woo.org/#get-asset-history
         * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
         * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const request = {
            'type': 'BALANCE',
        };
        const [currency, rows] = await this.getAssetHistoryRows(code, since, limit, this.extend(request, params));
        //
        //     {
        //         "rows":[],
        //         "meta":{
        //             "total":0,
        //             "records_per_page":25,
        //             "current_page":1
        //         },
        //         "success":true
        //     }
        //
        return this.parseTransactions(rows, currency, since, limit, params);
    }
    parseTransaction(transaction, currency = undefined) {
        // example in fetchLedger
        const networkizedCode = this.safeString(transaction, 'token');
        const currencyDefined = this.getCurrencyFromChaincode(networkizedCode, currency);
        const code = currencyDefined['code'];
        let movementDirection = this.safeStringLower(transaction, 'token_side');
        if (movementDirection === 'withdraw') {
            movementDirection = 'withdrawal';
        }
        const fee = this.parseTokenAndFeeTemp(transaction, 'fee_token', 'fee_amount');
        const addressTo = this.safeString(transaction, 'target_address');
        const addressFrom = this.safeString(transaction, 'source_address');
        const timestamp = this.safeTimestamp(transaction, 'created_time');
        return {
            'info': transaction,
            'id': this.safeString2(transaction, 'id', 'withdraw_id'),
            'txid': this.safeString(transaction, 'tx_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'address': undefined,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': this.safeString(transaction, 'extra'),
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': movementDirection,
            'amount': this.safeNumber(transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus(this.safeString(transaction, 'status')),
            'updated': this.safeTimestamp(transaction, 'updated_time'),
            'comment': undefined,
            'internal': undefined,
            'fee': fee,
            'network': undefined,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'NEW': 'pending',
            'CONFIRMING': 'pending',
            'PROCESSING': 'pending',
            'COMPLETED': 'ok',
            'CANCELED': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name woo#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://docs.woo.org/#get-transfer-history
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'token': currency['id'],
            'amount': this.parseToNumeric(amount),
            'from_application_id': fromAccount,
            'to_application_id': toAccount,
        };
        const response = await this.v1PrivatePostAssetMainSubTransfer(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "id": 200
        //     }
        //
        const transfer = this.parseTransfer(response, currency);
        const transferOptions = this.safeDict(this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeBool(transferOptions, 'fillResponseFromRequest', true);
        if (fillResponseFromRequest) {
            transfer['amount'] = amount;
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
        }
        return transfer;
    }
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @see https://docs.woo.org/#get-transfer-history
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for
         * @param {int} [limit] the maximum number of  transfers structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        const request = {};
        if (limit !== undefined) {
            request['size'] = limit;
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        params = this.omit(params, ['until']);
        if (until !== undefined) {
            request['end_t'] = until;
        }
        const response = await this.v1PrivateGetAssetMainSubTransferHistory(this.extend(request, params));
        //
        //     {
        //         "rows": [
        //             {
        //                 "id": 46704,
        //                 "token": "USDT",
        //                 "amount": 30000.00000000,
        //                 "status": "COMPLETED",
        //                 "from_application_id": "0f1bd3cd-dba2-4563-b8bb-0adb1bfb83a3",
        //                 "to_application_id": "c01e6940-a735-4022-9b6c-9d3971cdfdfa",
        //                 "from_user": "LeverageLow",
        //                 "to_user": "dev",
        //                 "created_time": "1709022325.427",
        //                 "updated_time": "1709022325.542"
        //             }
        //         ],
        //         "meta": {
        //             "total": 50,
        //             "records_per_page": 25,
        //             "current_page": 1
        //         },
        //         "success": true
        //     }
        //
        const data = this.safeList(response, 'rows', []);
        return this.parseTransfers(data, undefined, since, limit, params);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        //    fetchTransfers
        //     {
        //         "id": 46704,
        //         "token": "USDT",
        //         "amount": 30000.00000000,
        //         "status": "COMPLETED",
        //         "from_application_id": "0f1bd3cd-dba2-4563-b8bb-0adb1bfb83a3",
        //         "to_application_id": "c01e6940-a735-4022-9b6c-9d3971cdfdfa",
        //         "from_user": "LeverageLow",
        //         "to_user": "dev",
        //         "created_time": "1709022325.427",
        //         "updated_time": "1709022325.542"
        //     }
        //
        //    transfer
        //        {
        //            "success": true,
        //            "id": 200
        //        }
        //
        const networkizedCode = this.safeString(transfer, 'token');
        const currencyDefined = this.getCurrencyFromChaincode(networkizedCode, currency);
        const code = currencyDefined['code'];
        const timestamp = this.safeTimestamp(transfer, 'created_time');
        const success = this.safeBool(transfer, 'success');
        let status = undefined;
        if (success !== undefined) {
            status = success ? 'ok' : 'failed';
        }
        return {
            'id': this.safeString(transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': code,
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': this.safeString(transfer, 'from_application_id'),
            'toAccount': this.safeString(transfer, 'to_application_id'),
            'status': this.parseTransferStatus(this.safeString(transfer, 'status', status)),
            'info': transfer,
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            'NEW': 'pending',
            'CONFIRMING': 'pending',
            'PROCESSING': 'pending',
            'COMPLETED': 'ok',
            'CANCELED': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name woo#withdraw
         * @description make a withdrawal
         * @see https://docs.woo.org/#token-withdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        this.checkAddress(address);
        const currency = this.currency(code);
        const request = {
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['extra'] = tag;
        }
        const networks = this.safeDict(this.options, 'networks', {});
        const currencyNetworks = this.safeDict(currency, 'networks', {});
        const network = this.safeStringUpper(params, 'network');
        const networkId = this.safeString(networks, network, network);
        const coinNetwork = this.safeDict(currencyNetworks, networkId, {});
        const coinNetworkId = this.safeString(coinNetwork, 'id');
        if (coinNetworkId === undefined) {
            throw new errors.BadRequest(this.id + ' withdraw() require network parameter');
        }
        request['token'] = coinNetworkId;
        const response = await this.v1PrivatePostAssetWithdraw(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "withdraw_id": "20200119145703654"
        //     }
        //
        return this.parseTransaction(response, currency);
    }
    async repayMargin(code, amount, symbol = undefined, params = {}) {
        /**
         * @method
         * @name woo#repayMargin
         * @description repay borrowed margin and interest
         * @see https://docs.woo.org/#repay-interest
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {string} symbol not used by woo.repayMargin ()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        const currency = this.currency(code);
        const request = {
            'token': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        const response = await this.v1PrivatePostInterestRepay(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //     }
        //
        const transaction = this.parseMarginLoan(response, currency);
        return this.extend(transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }
    parseMarginLoan(info, currency = undefined) {
        //
        //     {
        //         "success": true,
        //     }
        //
        return {
            'id': undefined,
            'currency': this.safeCurrencyCode(undefined, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = section[0];
        const access = section[1];
        const pathWithParams = this.implodeParams(path, params);
        let url = this.implodeHostname(this.urls['api'][access]);
        url += '/' + version + '/';
        params = this.omit(params, this.extractParams(path));
        params = this.keysort(params);
        if (access === 'public') {
            url += access + '/' + pathWithParams;
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }
        else {
            this.checkRequiredCredentials();
            if (method === 'POST' && (path === 'algo/order' || path === 'order')) {
                const isSandboxMode = this.safeBool(this.options, 'sandboxMode', false);
                if (!isSandboxMode) {
                    const applicationId = 'bc830de7-50f3-460b-9ee0-f430f83f9dad';
                    const brokerId = this.safeString(this.options, 'brokerId', applicationId);
                    const isStop = path.indexOf('algo') > -1;
                    if (isStop) {
                        params['brokerId'] = brokerId;
                    }
                    else {
                        params['broker_id'] = brokerId;
                    }
                }
                params = this.keysort(params);
            }
            let auth = '';
            const ts = this.nonce().toString();
            url += pathWithParams;
            headers = {
                'x-api-key': this.apiKey,
                'x-api-timestamp': ts,
            };
            if (version === 'v3') {
                auth = ts + method + '/' + version + '/' + pathWithParams;
                if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                    body = this.json(params);
                    auth += body;
                }
                else {
                    if (Object.keys(params).length) {
                        const query = this.urlencode(params);
                        url += '?' + query;
                        auth += '?' + query;
                    }
                }
                headers['content-type'] = 'application/json';
            }
            else {
                auth = this.urlencode(params);
                if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                    body = auth;
                }
                else {
                    if (Object.keys(params).length) {
                        url += '?' + auth;
                    }
                }
                auth += '|' + ts;
                headers['content-type'] = 'application/x-www-form-urlencoded';
            }
            headers['x-api-signature'] = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     400 Bad Request {"success":false,"code":-1012,"message":"Amount is required for buy market orders when margin disabled."}
        //                     {"code":"-1011","message":"The system is under maintenance.","success":false}
        //
        const success = this.safeBool(response, 'success');
        const errorCode = this.safeString(response, 'code');
        if (!success) {
            const feedback = this.id + ' ' + this.json(response);
            this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
        }
        return undefined;
    }
    parseIncome(income, market = undefined) {
        //
        //     {
        //         "id":666666,
        //         "symbol":"PERP_BTC_USDT",
        //         "funding_rate":0.00001198,
        //         "mark_price":28941.04000000,
        //         "funding_fee":0.00069343,
        //         "payment_type":"Pay",
        //         "status":"COMPLETED",
        //         "created_time":"1653616000.666",
        //         "updated_time":"1653616000.605"
        //     }
        //
        const marketId = this.safeString(income, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const amount = this.safeNumber(income, 'funding_fee');
        const code = this.safeCurrencyCode('USD');
        const id = this.safeString(income, 'id');
        const timestamp = this.safeTimestamp(income, 'updated_time');
        const rate = this.safeNumber(income, 'funding_rate');
        return {
            'info': income,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': id,
            'amount': amount,
            'rate': rate,
        };
    }
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = since;
        }
        const response = await this.v1PrivateGetFundingFeeHistory(this.extend(request, params));
        //
        //     {
        //         "rows":[
        //             {
        //                 "id":666666,
        //                 "symbol":"PERP_BTC_USDT",
        //                 "funding_rate":0.00001198,
        //                 "mark_price":28941.04000000,
        //                 "funding_fee":0.00069343,
        //                 "payment_type":"Pay",
        //                 "status":"COMPLETED",
        //                 "created_time":"1653616000.666",
        //                 "updated_time":"1653616000.605"
        //             }
        //         ],
        //         "meta":{
        //             "total":235,
        //             "records_per_page":25,
        //             "current_page":1
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeList(response, 'rows', []);
        return this.parseIncomes(result, market, since, limit);
    }
    parseFundingRate(fundingRate, market = undefined) {
        //
        //         {
        //             "symbol":"PERP_AAVE_USDT",
        //             "est_funding_rate":-0.00003447,
        //             "est_funding_rate_timestamp":1653633959001,
        //             "last_funding_rate":-0.00002094,
        //             "last_funding_rate_timestamp":1653631200000,
        //             "next_funding_time":1653634800000
        //         }
        //
        //
        const symbol = this.safeString(fundingRate, 'symbol');
        market = this.market(symbol);
        const nextFundingTimestamp = this.safeInteger(fundingRate, 'next_funding_time');
        const estFundingRateTimestamp = this.safeInteger(fundingRate, 'est_funding_rate_timestamp');
        const lastFundingRateTimestamp = this.safeInteger(fundingRate, 'last_funding_rate_timestamp');
        return {
            'info': fundingRate,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': estFundingRateTimestamp,
            'datetime': this.iso8601(estFundingRateTimestamp),
            'fundingRate': this.safeNumber(fundingRate, 'est_funding_rate'),
            'fundingTimestamp': nextFundingTimestamp,
            'fundingDatetime': this.iso8601(nextFundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': this.safeNumber(fundingRate, 'last_funding_rate'),
            'previousFundingTimestamp': lastFundingRateTimestamp,
            'previousFundingDatetime': this.iso8601(lastFundingRateTimestamp),
        };
    }
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetFundingRateSymbol(this.extend(request, params));
        //
        //     {
        //         "success":true,
        //         "timestamp":1653640572711,
        //         "symbol":"PERP_BTC_USDT",
        //         "est_funding_rate":0.00000738,
        //         "est_funding_rate_timestamp":1653640559003,
        //         "last_funding_rate":0.00000629,
        //         "last_funding_rate_timestamp":1653638400000,
        //         "next_funding_time":1653642000000
        //     }
        //
        return this.parseFundingRate(response, market);
    }
    async fetchFundingRates(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.v1PublicGetFundingRates(params);
        //
        //     {
        //         "success":true,
        //         "rows":[
        //             {
        //                 "symbol":"PERP_AAVE_USDT",
        //                 "est_funding_rate":-0.00003447,
        //                 "est_funding_rate_timestamp":1653633959001,
        //                 "last_funding_rate":-0.00002094,
        //                 "last_funding_rate_timestamp":1653631200000,
        //                 "next_funding_time":1653634800000
        //             }
        //         ],
        //         "timestamp":1653633985646
        //     }
        //
        const rows = this.safeList(response, 'rows', []);
        const result = this.parseFundingRates(rows);
        return this.filterByArray(result, 'symbol', symbols);
    }
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://docs.woo.org/#get-funding-rate-history-for-one-market-public
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest funding rate
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallIncremental('fetchFundingRateHistory', symbol, since, limit, params, 'page', 25);
        }
        let request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            symbol = market['symbol'];
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_t'] = this.parseToInt(since / 1000);
        }
        [request, params] = this.handleUntilOption('end_t', request, params, 0.001);
        const response = await this.v1PublicGetFundingRateHistory(this.extend(request, params));
        //
        //     {
        //         "success":true,
        //         "meta":{
        //             "total":2464,
        //             "records_per_page":25,
        //             "current_page":1
        //         },
        //         "rows":[
        //             {
        //                 "symbol":"PERP_BTC_USDT",
        //                 "funding_rate":0.00000629,
        //                 "funding_rate_timestamp":1653638400000,
        //                 "next_funding_time":1653642000000
        //             }
        //         ],
        //         "timestamp":1653640814885
        //     }
        //
        const result = this.safeList(response, 'rows');
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString(entry, 'symbol');
            const timestamp = this.safeInteger(entry, 'funding_rate_timestamp');
            rates.push({
                'info': entry,
                'symbol': this.safeSymbol(marketId),
                'fundingRate': this.safeNumber(entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        /**
         * @method
         * @name woo#setPositionMode
         * @description set hedged to true or false for a market
         * @see https://docs.woo.org/#update-position-mode
         * @param {bool} hedged set to true to use HEDGE_MODE, false for ONE_WAY
         * @param {string} symbol not used by woo setPositionMode
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         */
        let hedgeMode = undefined;
        if (hedged) {
            hedgeMode = 'HEDGE_MODE';
        }
        else {
            hedgeMode = 'ONE_WAY';
        }
        const request = {
            'position_mode': hedgeMode,
        };
        const response = await this.v1PrivatePostClientPositionMode(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {},
        //         "timestamp": "1709195608551"
        //     }
        //
        return response;
    }
    async fetchLeverage(symbol, params = {}) {
        /**
         * @method
         * @name woo#fetchLeverage
         * @description fetch the set leverage for a market
         * @see https://docs.woo.org/#get-account-information-new
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const response = await this.v3PrivateGetAccountinfo(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "applicationId": "dsa",
        //             "account": "dsa",
        //             "alias": "haha",
        //             "accountMode": "MARGIN",
        //             "leverage": 1,
        //             "takerFeeRate": 1,
        //             "makerFeeRate": 1,
        //             "interestRate": 1,
        //             "futuresTakerFeeRate": 1,
        //             "futuresMakerFeeRate": 1,
        //             "otpauth": true,
        //             "marginRatio": 1,
        //             "openMarginRatio": 1,
        //             "initialMarginRatio": 1,
        //             "maintenanceMarginRatio": 1,
        //             "totalCollateral": 1,
        //             "freeCollateral": 1,
        //             "totalAccountValue": 1,
        //             "totalVaultValue": 1,
        //             "totalStakingValue": 1
        //         },
        //         "timestamp": 1673323685109
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseLeverage(data, market);
    }
    parseLeverage(leverage, market = undefined) {
        const leverageValue = this.safeInteger(leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': market['symbol'],
            'marginMode': undefined,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        };
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        await this.loadMarkets();
        if ((leverage < 1) || (leverage > 20)) {
            throw new errors.BadRequest(this.id + ' leverage should be between 1 and 20');
        }
        const request = {
            'leverage': leverage,
        };
        return await this.v1PrivatePostClientLeverage(this.extend(request, params));
    }
    async fetchPosition(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PrivateGetPositionSymbol(this.extend(request, params));
        //
        //     {
        //         "symbol":"PERP_ETC_USDT",
        //         "holding":0.0,
        //         "pnl_24_h":0,
        //         "settle_price":0.0,
        //         "average_open_price":0,
        //         "success":true,
        //         "mark_price":22.6955,
        //         "pending_short_qty":0.0,
        //         "pending_long_qty":0.0,
        //         "fee_24_h":0,
        //         "timestamp":"1652231044.920"
        //     }
        //
        return this.parsePosition(response, market);
    }
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.v3PrivateGetPositions(params);
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "positions": [
        //                 {
        //                     "symbol": "0_symbol",
        //                     "holding": 1,
        //                     "pendingLongQty": 0,
        //                     "pendingShortQty": 1,
        //                     "settlePrice": 1,
        //                     "averageOpenPrice": 1,
        //                     "pnl24H": 1,
        //                     "fee24H": 1,
        //                     "markPrice": 1,
        //                     "estLiqPrice": 1,
        //                     "timestamp": 12321321
        //                 }
        //             ]
        //         },
        //         "timestamp": 1673323880342
        //     }
        //
        const result = this.safeDict(response, 'data', {});
        const positions = this.safeList(result, 'positions', []);
        return this.parsePositions(positions, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "symbol": "0_symbol",
        //         "holding": 1,
        //         "pendingLongQty": 0,
        //         "pendingShortQty": 1,
        //         "settlePrice": 1,
        //         "averageOpenPrice": 1,
        //         "pnl24H": 1,
        //         "fee24H": 1,
        //         "markPrice": 1,
        //         "estLiqPrice": 1,
        //         "timestamp": 12321321
        //     }
        //
        const contract = this.safeString(position, 'symbol');
        market = this.safeMarket(contract, market);
        let size = this.safeString(position, 'holding');
        let side = undefined;
        if (Precise["default"].stringGt(size, '0')) {
            side = 'long';
        }
        else {
            side = 'short';
        }
        const contractSize = this.safeString(market, 'contractSize');
        const markPrice = this.safeString(position, 'markPrice');
        const timestamp = this.safeTimestamp(position, 'timestamp');
        const entryPrice = this.safeString(position, 'averageOpenPrice');
        const priceDifference = Precise["default"].stringSub(markPrice, entryPrice);
        const unrealisedPnl = Precise["default"].stringMul(priceDifference, size);
        size = Precise["default"].stringAbs(size);
        const notional = Precise["default"].stringMul(size, markPrice);
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeString(market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber(entryPrice),
            'notional': this.parseNumber(notional),
            'leverage': undefined,
            'unrealizedPnl': this.parseNumber(unrealisedPnl),
            'contracts': this.parseNumber(size),
            'contractSize': this.parseNumber(contractSize),
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber(position, 'estLiqPrice'),
            'markPrice': this.parseNumber(markPrice),
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': 'cross',
            'marginType': undefined,
            'side': side,
            'percentage': undefined,
            'hedged': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    async fetchConvertQuote(fromCode, toCode, amount = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchConvertQuote
         * @description fetch a quote for converting from one currency to another
         * @see https://docs.woo.org/#get-quote-rfq
         * @param {string} fromCode the currency that you want to sell and convert from
         * @param {string} toCode the currency that you want to buy and convert into
         * @param {float} [amount] how much you want to trade in units of the from currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
         */
        await this.loadMarkets();
        const request = {
            'sellToken': fromCode.toUpperCase(),
            'buyToken': toCode.toUpperCase(),
            'sellQuantity': this.numberToString(amount),
        };
        const response = await this.v3PrivateGetConvertRfq(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "quoteId": 123123123,
        //             "counterPartyId": "",
        //             "sellToken": "ETH",
        //             "sellQuantity": "0.0445",
        //             "buyToken": "USDT",
        //             "buyQuantity": "33.45",
        //             "buyPrice": "6.77",
        //             "expireTimestamp": 1659084466000,
        //             "message": 1659084466000
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const fromCurrencyId = this.safeString(data, 'sellToken', fromCode);
        const fromCurrency = this.currency(fromCurrencyId);
        const toCurrencyId = this.safeString(data, 'buyToken', toCode);
        const toCurrency = this.currency(toCurrencyId);
        return this.parseConversion(data, fromCurrency, toCurrency);
    }
    async createConvertTrade(id, fromCode, toCode, amount = undefined, params = {}) {
        /**
         * @method
         * @name woo#createConvertTrade
         * @description convert from one currency to another
         * @see https://docs.woo.org/#send-quote-rft
         * @param {string} id the id of the trade that you want to make
         * @param {string} fromCode the currency that you want to sell and convert from
         * @param {string} toCode the currency that you want to buy and convert into
         * @param {float} [amount] how much you want to trade in units of the from currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
         */
        await this.loadMarkets();
        const request = {
            'quoteId': id,
        };
        const response = await this.v3PrivatePostConvertRft(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "quoteId": 123123123,
        //             "counterPartyId": "",
        //             "rftAccepted": 1 // 1 -> success; 2 -> processing; 3 -> fail
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseConversion(data);
    }
    async fetchConvertTrade(id, code = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchConvertTrade
         * @description fetch the data for a conversion trade
         * @see https://docs.woo.org/#get-quote-trade
         * @param {string} id the id of the trade that you want to fetch
         * @param {string} [code] the unified currency code of the conversion trade
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
         */
        await this.loadMarkets();
        const request = {
            'quoteId': id,
        };
        const response = await this.v3PrivateGetConvertTrade(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "quoteId": 12,
        //             "buyAsset": "",
        //             "sellAsset": "",
        //             "buyAmount": 12.11,
        //             "sellAmount": 12.11,
        //             "tradeStatus": 12,
        //             "createdTime": ""
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const fromCurrencyId = this.safeString(data, 'sellAsset');
        const toCurrencyId = this.safeString(data, 'buyAsset');
        let fromCurrency = undefined;
        let toCurrency = undefined;
        if (fromCurrencyId !== undefined) {
            fromCurrency = this.currency(fromCurrencyId);
        }
        if (toCurrencyId !== undefined) {
            toCurrency = this.currency(toCurrencyId);
        }
        return this.parseConversion(data, fromCurrency, toCurrency);
    }
    async fetchConvertTradeHistory(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name woo#fetchConvertTradeHistory
         * @description fetch the users history of conversion trades
         * @see https://docs.woo.org/#get-quote-trades
         * @param {string} [code] the unified currency code
         * @param {int} [since] the earliest time in ms to fetch conversions for
         * @param {int} [limit] the maximum number of conversion structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest conversion to fetch
         * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
         */
        await this.loadMarkets();
        let request = {};
        [request, params] = this.handleUntilOption('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['size'] = limit;
        }
        const response = await this.v3PrivateGetConvertTrades(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "count": 12,
        //             "tradeVos":[
        //                 {
        //                     "quoteId": 12,
        //                     "buyAsset": "",
        //                     "sellAsset": "",
        //                     "buyAmount": 12.11,
        //                     "sellAmount": 12.11,
        //                     "tradeStatus": 12,
        //                     "createdTime": ""
        //                 }
        //                 ...
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'tradeVos', []);
        return this.parseConversions(rows, code, 'sellAsset', 'buyAsset', since, limit);
    }
    parseConversion(conversion, fromCurrency = undefined, toCurrency = undefined) {
        //
        // fetchConvertQuote
        //
        //     {
        //         "quoteId": 123123123,
        //         "counterPartyId": "",
        //         "sellToken": "ETH",
        //         "sellQuantity": "0.0445",
        //         "buyToken": "USDT",
        //         "buyQuantity": "33.45",
        //         "buyPrice": "6.77",
        //         "expireTimestamp": 1659084466000,
        //         "message": 1659084466000
        //     }
        //
        // createConvertTrade
        //
        //     {
        //         "quoteId": 123123123,
        //         "counterPartyId": "",
        //         "rftAccepted": 1 // 1 -> success; 2 -> processing; 3 -> fail
        //     }
        //
        // fetchConvertTrade, fetchConvertTradeHistory
        //
        //     {
        //         "quoteId": 12,
        //         "buyAsset": "",
        //         "sellAsset": "",
        //         "buyAmount": 12.11,
        //         "sellAmount": 12.11,
        //         "tradeStatus": 12,
        //         "createdTime": ""
        //     }
        //
        const timestamp = this.safeInteger2(conversion, 'expireTimestamp', 'createdTime');
        const fromCurr = this.safeString2(conversion, 'sellToken', 'buyAsset');
        const fromCode = this.safeCurrencyCode(fromCurr, fromCurrency);
        const to = this.safeString2(conversion, 'buyToken', 'sellAsset');
        const toCode = this.safeCurrencyCode(to, toCurrency);
        return {
            'info': conversion,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(conversion, 'quoteId'),
            'fromCurrency': fromCode,
            'fromAmount': this.safeNumber2(conversion, 'sellQuantity', 'sellAmount'),
            'toCurrency': toCode,
            'toAmount': this.safeNumber2(conversion, 'buyQuantity', 'buyAmount'),
            'price': this.safeNumber(conversion, 'buyPrice'),
            'fee': undefined,
        };
    }
    async fetchConvertCurrencies(params = {}) {
        /**
         * @method
         * @name woo#fetchConvertCurrencies
         * @description fetches all available currencies that can be converted
         * @see https://docs.woo.org/#get-quote-asset-info
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        await this.loadMarkets();
        const response = await this.v3PrivateGetConvertAssetInfo(params);
        //
        //     {
        //         "success": true,
        //         "rows": [
        //             {
        //                 "token": "BTC",
        //                 "tick": 0.0001,
        //                 "createdTime": "1575014248.99", // Unix epoch time in seconds
        //                 "updatedTime": "1575014248.99"  // Unix epoch time in seconds
        //             },
        //         ]
        //     }
        //
        const result = {};
        const data = this.safeList(response, 'rows', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString(entry, 'token');
            const code = this.safeCurrencyCode(id);
            result[code] = {
                'info': entry,
                'id': id,
                'code': code,
                'networks': undefined,
                'type': undefined,
                'name': undefined,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': this.safeNumber(entry, 'tick'),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': this.safeTimestamp(entry, 'createdTime'),
            };
        }
        return result;
    }
    defaultNetworkCodeForCurrency(code) {
        const currencyItem = this.currency(code);
        const networks = currencyItem['networks'];
        const networkKeys = Object.keys(networks);
        for (let i = 0; i < networkKeys.length; i++) {
            const network = networkKeys[i];
            if (network === 'ETH') {
                return network;
            }
        }
        // if it was not returned according to above options, then return the first network of currency
        return this.safeValue(networkKeys, 0);
    }
    setSandboxMode(enable) {
        super.setSandboxMode(enable);
        this.options['sandboxMode'] = enable;
    }
}

module.exports = woo;
