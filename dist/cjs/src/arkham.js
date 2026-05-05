'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var arkham$1 = require('./abstract/arkham.js');
var Precise = require('./base/Precise.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
/**
 * @class arkham
 * @augments Exchange
 */
class arkham extends arkham$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'arkham',
            'name': 'ARKHAM',
            'countries': ['US'],
            'version': 'v1',
            'rateLimit': 20 / 3,
            'certified': false,
            'pro': true,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'fetchAccounts': true,
                'fetchAllGreeks': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchGreeks': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': true,
                'fetchLeverageTiers': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchVolatilityHistory': false,
                'fetchWithdrawals': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false,
                'setLeverage': true,
                'withdraw': true,
            },
            'timeframes': {
                // enums are wrong in DOCS, these string values need to be in request
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '1d': '24h',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/5cefdcfb-2c10-445b-835c-fa21317bf5ac',
                'api': {
                    'v1': 'https://arkm.com/api',
                },
                'www': 'https://arkm.com/',
                'referral': {
                    'url': 'https://arkm.com/register?ref=ccxt',
                    'discount': 0,
                },
                'doc': [
                    'https://arkm.com/limits-api',
                    'https://info.arkm.com/api-platform',
                ],
                'fees': 'https://arkm.com/fees',
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'alerts': 1,
                            'announcements': 1,
                            'assets': 1,
                            'book': 1,
                            'candles': 1,
                            'chains': 1,
                            'contracts': 1,
                            'index-price': 1,
                            'index-prices': 1,
                            'margin-schedules': 1,
                            'marketcapchart': 1,
                            'marketcaps': 1,
                            'pair': 1,
                            'pairs': 1,
                            'server-time': 1,
                            'ticker': 1,
                            'tickers': 1,
                            'trades': 1,
                        },
                    },
                    'private': {
                        // for orders: spot 20/s, todo: perp 40/s
                        'get': {
                            'user': 7.5,
                            'orders': 7.5,
                            'orders/by-client-order-id': 7.5,
                            'orders/history': 7.5,
                            'orders/history/by-client-order-id': 7.5,
                            'orders/history_offset': 7.5,
                            'orders/{id}': 7.5,
                            'trades': 7.5,
                            'trades/history': 7.5,
                            'trades/time': 7.5,
                            'trigger-orders': 7.5,
                            'account/airdrops': 7.5,
                            'account/balance-updates': 7.5,
                            'account/balances': 7.5,
                            'account/balances/ll': 7.5,
                            'account/balances/history': 7.5,
                            'account/balances/commissions': 7.5,
                            'account/deposit/addresses': 7.5,
                            'account/deposits': 7.5,
                            'account/fees': 7.5,
                            'account/funding-rate-payments': 7.5,
                            'account/leverage': 7.5,
                            'account/lsp-assignments': 7.5,
                            'account/margin': 7.5,
                            'account/margin/all': 7.5,
                            'account/notifications': 7.5,
                            'account/position-updates': 7.5,
                            'account/positions': 7.5,
                            'account/realized-pnl': 7.5,
                            'account/rebates': 7.5,
                            'account/referral-links': 7.5,
                            'account/sessions': 7.5,
                            'account/settings': 7.5,
                            'account/settings/price-alert': 7.5,
                            'account/transfers': 7.5,
                            'account/unsubscribe': 7.5,
                            'account/watchlist': 7.5,
                            'account/withdrawal/addresses': 7.5,
                            'account/withdrawal/addresses/{id}': 7.5,
                            'account/withdrawals': 7.5,
                            'subaccounts': 7.5,
                            'airdrop': 7.5,
                            'airdrop/claim': 7.5,
                            'affiliate-dashboard/commission-earned': 7.5,
                            'affiliate-dashboard/min-arkm-last-30d': 7.5,
                            'affiliate-dashboard/points': 7.5,
                            'affiliate-dashboard/points-season-1': 7.5,
                            'affiliate-dashboard/points-season-2': 7.5,
                            'affiliate-dashboard/realized-pnl': 7.5,
                            'affiliate-dashboard/rebate-balance': 7.5,
                            'affiliate-dashboard/referral-count': 7.5,
                            'affiliate-dashboard/referrals-season-1': 7.5,
                            'affiliate-dashboard/referrals-season-2': 7.5,
                            'affiliate-dashboard/trading-volume-stats': 7.5,
                            'affiliate-dashboard/volume-season-1': 7.5,
                            'affiliate-dashboard/volume-season-2': 7.5,
                            'affiliate-dashboard/api-key': 7.5,
                            'competitions/opt-in-status': 7.5,
                            'rewards/info': 7.5,
                            'rewards/vouchers': 7.5,
                        },
                        'post': {
                            'orders/new': 7.5,
                            'trigger-orders/new': 7.5,
                            'orders/cancel': 7.5,
                            'trigger-orders/cancel': 7.5,
                            'orders/cancel/all': 7.5,
                            'trigger-orders/cancel/all': 7.5,
                            'orders/new/simple': 7.5,
                            'account/deposit/addresses/new': 7.5,
                            'account/leverage': 7.5,
                            'account/notifications/read': 7.5,
                            'account/referral-links': 7.5,
                            'account/sessions/delete': 7.5,
                            'account/sessions/terminate-all': 7.5,
                            'account/settings/update': 7.5,
                            'account/watchlist/add': 7.5,
                            'account/watchlist/remove': 7.5,
                            'account/withdraw': 7.5,
                            'account/withdrawal/addresses/confirm': 7.5,
                            'subaccounts': 7.5,
                            'subaccounts/transfer': 7.5,
                            'subaccounts/perp-transfer': 7.5,
                            'subaccounts/update-settings': 7.5,
                            'airdrop': 7.5,
                            'api-key/create': 7.5,
                            'authenticate': 7.5,
                            'competitions/opt-in': 7.5,
                            'rewards/vouchers/claim': 7.5,
                        },
                        'put': {
                            'account/referral-links/{id}/slug': 7.5,
                            'account/settings/price-alert': 7.5,
                            'account/withdrawal/addresses/{id}': 7.5,
                            'subaccounts': 7.5,
                            'api-key/update/{id}': 7.5,
                        },
                        'delete': {
                            'account/settings/price-alert': 7.5,
                            'account/withdrawal/addresses/{id}': 7.5,
                            'subaccounts/{subaccountId}': 7.5,
                            'api-key/{id}': 7.5,
                        },
                    },
                },
            },
            'options': {
                'networks': {
                    'ETH': 'ETH',
                    'ERC20': 'ETH',
                    'BTC': 'BTC',
                    'SOL': 'SOL',
                    'TON': 'TON',
                    'DOGE': 'DOGE',
                    'SUI': 'SUI',
                    'XRP': 'XRP',
                    'OP': 'OP',
                    'AVAXC': 'AVAX',
                    'ARBONE': 'ARB',
                },
                'networksById': {
                    'ETH': 'ERC20',
                    'ERC20': 'ERC20',
                },
                'requestExpiration': 5000,
                'timeframeDurations': {
                    '1m': 60000000,
                    '5m': 300000000,
                    '15m': 900000000,
                    '30m': 1800000000,
                    '1h': 3600000000,
                    '6h': 21600000000,
                    '1d': 86400000000,
                },
            },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'mark': true,
                            'index': true,
                            'last': true,
                        },
                        'triggerDirection': true,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'iceberg': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': 1,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 365,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    // 1XXXX General Errors
                    // These errors can occur for a variety of reasons and may be returned by the API or Websocket on any endpoint.
                    '10000': errors.OperationFailed,
                    '10001': errors.BadRequest,
                    '10002': errors.AuthenticationError,
                    '10003': errors.BadSymbol,
                    '10004': errors.ArgumentsRequired,
                    '10005': errors.RateLimitExceeded,
                    '10006': errors.PermissionDenied,
                    '10007': errors.PermissionDenied,
                    '10008': errors.RateLimitExceeded,
                    '10009': errors.PermissionDenied,
                    '10010': errors.PermissionDenied,
                    '10011': errors.AuthenticationError,
                    '10012': errors.PermissionDenied,
                    '10013': errors.PermissionDenied,
                    '10014': errors.AuthenticationError,
                    '10015': errors.PermissionDenied,
                    '10016': errors.PermissionDenied,
                    '10017': errors.PermissionDenied,
                    '10018': errors.AuthenticationError,
                    '10019': errors.AuthenticationError,
                    '10020': errors.PermissionDenied,
                    '10021': errors.PermissionDenied,
                    '10022': errors.ExchangeError,
                    '10023': errors.BadRequest,
                    '10024': errors.ExchangeError,
                    '10025': errors.BadRequest,
                    // #2XXXX General Websocket Errors
                    '20001': errors.BadRequest,
                    '20002': errors.ArgumentsRequired,
                    '20003': errors.BadRequest,
                    '20004': errors.ArgumentsRequired,
                    '20005': errors.BadRequest,
                    // #3XXXX Trading Errors
                    '30001': errors.InvalidOrder,
                    '30002': errors.InvalidOrder,
                    '30003': errors.InvalidOrder,
                    '30004': errors.InvalidOrder,
                    '30005': errors.InvalidOrder,
                    '30006': errors.InvalidOrder,
                    '30007': errors.BadSymbol,
                    '30008': errors.OperationRejected,
                    '30009': errors.OperationRejected,
                    '30010': errors.InsufficientFunds,
                    '30011': errors.BadSymbol,
                    '30012': errors.OperationRejected,
                    '30013': errors.OperationRejected,
                    '30014': errors.InvalidOrder,
                    '30015': errors.OrderNotFound,
                    '30016': errors.InvalidOrder,
                    '30017': errors.InvalidOrder,
                    '30018': errors.InvalidOrder,
                    '30019': errors.OperationRejected,
                    '30020': errors.InvalidOrder,
                    '30021': errors.InvalidOrder,
                    '30022': errors.InvalidOrder,
                    '30023': errors.InvalidOrder,
                    '30024': errors.InvalidOrder,
                    '30025': errors.BadRequest,
                    '30026': errors.PermissionDenied,
                    '30027': errors.PermissionDenied,
                    '30028': errors.OrderNotFound,
                    // #4XXXX Funding Errors
                    '40001': errors.OperationRejected,
                    '40002': errors.BadRequest,
                    '40003': errors.InvalidAddress,
                    '40004': errors.OperationRejected,
                    '40005': errors.BadRequest,
                    '40006': errors.PermissionDenied,
                    '40007': errors.OperationRejected,
                    '40008': errors.OperationRejected,
                    '40009': errors.OperationRejected,
                    '40010': errors.BadRequest,
                    '40011': errors.OperationRejected,
                    '40012': errors.BadRequest,
                    '40013': errors.BadRequest,
                    // #9XXXX Other Errors
                    '90001': errors.BadRequest,
                    '90002': errors.BadRequest,
                    '90003': errors.OperationRejected,
                    '90004': errors.BadRequest,
                    '90005': errors.BadRequest,
                    '90006': errors.RateLimitExceeded,
                    '90007': errors.AuthenticationError,
                    '90008': errors.RateLimitExceeded,
                    '90009': errors.PermissionDenied,
                    '90010': errors.BadRequest,
                    '90011': errors.RateLimitExceeded,
                },
                'broad': {
                    'less than min withdrawal ': errors.OperationRejected, // {"message":"amount 1 less than min withdrawal 5"}
                },
            },
        });
    }
    /**
     * @method
     * @name arkham#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://arkm.com/docs#get/public/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.v1PublicGetAssets(params);
        //
        //    [
        //        {
        //            "symbol": "USDT",
        //            "name": "Tether",
        //            "imageUrl": "https://static.arkhamintelligence.com/tokens/tether.png",
        //            "stablecoin": true,
        //            "featuredPair": "BTC_USDT",
        //            "chains": [
        //                {
        //                    "symbol": "ETH",
        //                    "assetSymbol": "ETH",
        //                    "name": "Ethereum",
        //                    "type": "1",
        //                    "confirmations": "6",
        //                    "blockTime": "12000000"
        //                }
        //            ],
        //            "status": "listed",
        //            "minDeposit": "5",
        //            "minWithdrawal": "5",
        //            "withdrawalFee": "2"
        //        },
        //        ...
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString(currency, 'symbol');
            const code = this.safeCurrencyCode(id);
            const networks = {};
            const chains = this.safeList(currency, 'chains', []);
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString(chain, 'symbol');
                const network = this.networkIdToCode(networkId);
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'title': this.safeString(chain, 'name'),
                    'active': undefined,
                    'deposit': undefined,
                    'withdraw': undefined,
                    'fee': undefined,
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = this.safeCurrencyStructure({
                'info': currency,
                'id': id,
                'code': code,
                'name': this.safeString(currency, 'name'),
                'active': this.safeString(currency, 'status') === 'listed',
                'deposit': undefined,
                'withdraw': undefined,
                'fee': this.safeNumber(currency, 'withdrawalFee'),
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber(currency, 'minWithdrawal'),
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.safeNumber(currency, 'minDeposit'),
                        'max': undefined,
                    },
                },
                'type': 'crypto',
                'networks': networks,
            });
        }
        return result;
    }
    /**
     * @method
     * @name arkham#fetchMarkets
     * @see https://arkm.com/docs#get/public/pairs
     * @description retrieves data on all markets for arkm
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.v1PublicGetPairs(params);
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT",
        //            "baseSymbol": "BTC",
        //            "baseImageUrl": "https://static.arkhamintelligence.com/tokens/bitcoin.png",
        //            "baseIsStablecoin": false,
        //            "baseName": "Bitcoin",
        //            "quoteSymbol": "USDT",
        //            "quoteImageUrl": "https://static.arkhamintelligence.com/tokens/tether.png",
        //            "quoteIsStablecoin": true,
        //            "quoteName": "Tether",
        //            "minTickPrice": "0.01",
        //            "minLotSize": "0.00001",
        //            "minSize": "0.00001",
        //            "maxSize": "9000",
        //            "minPrice": "0.01",
        //            "maxPrice": "1000000",
        //            "minNotional": "5",
        //            "maxPriceScalarUp": "1.8",
        //            "maxPriceScalarDown": "0.2",
        //            "pairType": "spot", // atm, always 'spot' value
        //            "maxLeverage": "0",
        //            "status": "listed"
        //        },
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "baseSymbol": "BTC.P",
        //            "baseImageUrl": "https://static.arkhamintelligence.com/tokens/bitcoin.png",
        //            "baseIsStablecoin": false,
        //            "baseName": "Bitcoin Perpetual",
        //            "quoteSymbol": "USDT",
        //            "quoteImageUrl": "https://static.arkhamintelligence.com/tokens/tether.png",
        //            "quoteIsStablecoin": true,
        //            "quoteName": "Tether",
        //            "minTickPrice": "0.01",
        //            "minLotSize": "0.00001",
        //            "minSize": "0.00001",
        //            "maxSize": "9000",
        //            "minPrice": "0.01",
        //            "maxPrice": "1000000",
        //            "minNotional": "5",
        //            "maxPriceScalarUp": "1.5",
        //            "maxPriceScalarDown": "0.5",
        //            "pairType": "perpetual",
        //            "marginSchedule": "C",
        //            "maxLeverage": "25",
        //            "status": "listed"
        //        },
        //        ...
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'baseSymbol');
            const quoteId = this.safeString(market, 'quoteSymbol');
            let base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            let marketType = undefined;
            let symbol = undefined;
            const pairType = this.safeString(market, 'pairType');
            const isSpot = pairType === 'spot';
            const isPerpetual = pairType === 'perpetual';
            let settle = undefined;
            let settleId = undefined;
            if (isSpot) {
                marketType = 'spot';
                symbol = base + '/' + quote;
            }
            else if (isPerpetual) {
                marketType = 'swap';
                base = base.replace('.P', '');
                settle = quote;
                settleId = quoteId;
                symbol = base + '/' + quote + ':' + settle;
            }
            result.push({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': marketType,
                'spot': isSpot,
                'margin': undefined,
                'swap': isPerpetual,
                'future': false,
                'option': false,
                'active': this.safeString(market, 'status') === 'listed',
                'contract': isPerpetual,
                'linear': isPerpetual ? true : undefined,
                'inverse': isPerpetual ? false : undefined,
                'contractSize': isSpot ? undefined : 1,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'price': this.safeNumber(market, 'minTickPrice'),
                    'amount': this.safeNumber(market, 'minLotSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'minSize'),
                        'max': this.safeNumber(market, 'maxSize'),
                    },
                    'price': {
                        'min': this.safeNumber(market, 'minPrice'),
                        'max': this.safeNumber(market, 'maxPrice'),
                    },
                    'cost': {
                        'min': this.safeNumber(market, 'minNotional'),
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }
    /**
     * @method
     * @name arkham#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://arkm.com/docs#get/public/server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.v1PublicGetServerTime(params);
        //
        //    {
        //        "serverTime": "1753465832770820"
        //    }
        //
        return this.safeIntegerProduct(response, 'serverTime', 0.001);
    }
    /**
     * @method
     * @name arkham#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://arkm.com/docs#get/public/book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the number of order book entries to return, max 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PublicGetBook(this.extend(request, params));
        //
        //    {
        //        "symbol": "BTC_USDT",
        //        "group": "0.01",
        //        "asks": [
        //            {
        //                "price": "122900.43",
        //                "size": "0.0243"
        //            },
        //            {
        //                "price": "121885.53",
        //                "size": "0.00116"
        //            },
        //            ...
        //        ],
        //        "bids": [
        //            {
        //                "price": "20400",
        //                "size": "0.00316"
        //            },
        //            {
        //                "price": "30000",
        //                "size": "0.00116"
        //            },
        //            ...
        //        ],
        //        "lastTime": "1753419275604353"
        //    }
        //
        const timestamp = this.safeIntegerProduct(response, 'lastTime', 0.001);
        const marketId = this.safeString(response, 'symbol');
        return this.parseOrderBook(response, this.safeSymbol(marketId, market), timestamp, 'bids', 'asks', 'price', 'size');
    }
    /**
     * @method
     * @name arkham#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://arkm.com/docs#get/public/candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const maxLimit = 365;
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'duration': this.safeString(this.timeframes, timeframe, timeframe),
        };
        const durationMs = this.parseTimeframe(timeframe) * 1000;
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['until']);
        const selectedLimit = (limit !== undefined) ? Math.min(limit, maxLimit) : maxLimit;
        if (since !== undefined) {
            request['start'] = since;
            request['end'] = this.sum(since, selectedLimit * durationMs);
        }
        else {
            const now = this.milliseconds();
            request['end'] = (until !== undefined) ? until : now;
            request['start'] = request['end'] - selectedLimit * durationMs;
        }
        // exchange needs microseconds
        request['start'] = request['start'] * 1000;
        request['end'] = request['end'] * 1000;
        const response = await this.v1PublicGetCandles(this.extend(request, params));
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "time": "1753464720000000",
        //            "duration": "60000000",
        //            "open": "116051.35",
        //            "high": "116060.27",
        //            "low": "116051.35",
        //            "close": "116060.27",
        //            "volume": "0.0257",
        //            "quoteVolume": "2982.6724054"
        //        },
        //        ...
        //    ]
        //
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "time": "1753464720000000",
        //            "duration": "60000000",
        //            "open": "116051.35",
        //            "high": "116060.27",
        //            "low": "116051.35",
        //            "close": "116060.27",
        //            "volume": "0.0257",
        //            "quoteVolume": "2982.6724054"
        //        }
        //
        return [
            this.safeIntegerProduct(ohlcv, 'time', 0.001),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'volume'),
        ];
    }
    async fetchTickers(symbols = undefined, params = {}) {
        const response = await this.v1PublicGetTickers(params);
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "baseSymbol": "BTC.P",
        //            "quoteSymbol": "USDT",
        //            "indexCurrency": "USDT",
        //            "price": "118806.89",
        //            "price24hAgo": "118212.29",
        //            "high24h": "119468.05",
        //            "low24h": "117104.44",
        //            "volume24h": "180.99438",
        //            "quoteVolume24h": "21430157.5928827",
        //            "markPrice": "118814.71",
        //            "indexPrice": "118804.222610343",
        //            "fundingRate": "0.000007",
        //            "nextFundingRate": "0.000006",
        //            "nextFundingTime": "1753390800000000",
        //            "productType": "perpetual",
        //            "openInterest": "2.55847",
        //            "usdVolume24h": "21430157.5928827",
        //            "openInterestUSD": "303963.8638583"
        //        },
        //        ...
        //
        return this.parseTickers(response, symbols);
    }
    /**
     * @method
     * @name arkham#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.v1PublicGetTicker(this.extend(request, params));
        //
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "baseSymbol": "BTC.P",
        //            "quoteSymbol": "USDT",
        //            "indexCurrency": "USDT",
        //            "price": "118806.89",
        //            "price24hAgo": "118212.29",
        //            "high24h": "119468.05",
        //            "low24h": "117104.44",
        //            "volume24h": "180.99438",
        //            "quoteVolume24h": "21430157.5928827",
        //            "markPrice": "118814.71",
        //            "indexPrice": "118804.222610343",
        //            "fundingRate": "0.000007",
        //            "nextFundingRate": "0.000006",
        //            "nextFundingTime": "1753390800000000",
        //            "productType": "perpetual",
        //            "openInterest": "2.55847",
        //            "usdVolume24h": "21430157.5928827",
        //            "openInterestUSD": "303963.8638583"
        //        }
        //
        return this.parseTicker(response, market);
    }
    parseTicker(ticker, market = undefined) {
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market);
        return this.safeTicker({
            'info': ticker,
            'symbol': this.safeSymbol(marketId, market),
            'high': this.safeNumber(ticker, 'high24h'),
            'low': this.safeNumber(ticker, 'low24h'),
            'bid': this.safeNumber(ticker, 'bid'),
            'last': this.safeNumber(ticker, 'price'),
            'open': this.safeNumber(ticker, 'price24hAgo'),
            'change': this.safeNumber(ticker, 'priceChange'),
            'percentage': this.safeNumber(ticker, 'priceChangePercent'),
            'baseVolume': this.safeNumber(ticker, 'volume24h'),
            'quoteVolume': this.safeNumber(ticker, 'usdVolume24h'),
            'markPrice': this.safeNumber(ticker, 'markPrice'),
            'indexPrice': this.safeNumber(ticker, 'indexPrice'),
            'vwap': undefined,
            'average': undefined,
            'previousClose': undefined,
            'askVolume': undefined,
            'bidVolume': undefined,
        });
    }
    /**
     * @method
     * @name arkham#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://arkm.com/docs#get/public/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @param {string} [params.method] method, default: marketPublicGetV1beta3CryptoLocTrades
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const marketId = market['id'];
        const request = {
            'symbol': marketId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PublicGetTrades(this.extend(request, params));
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "revisionId": "1130514101",
        //            "size": "0.01668",
        //            "price": "116309.57",
        //            "takerSide": "sell",
        //            "time": "1753439710374047"
        //        },
        //        ...
        //    ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "revisionId": "1130514101",
        //            "size": "0.01668",
        //            "price": "116309.57",
        //            "takerSide": "sell",
        //            "time": "1753439710374047"
        //        }
        //
        // fetchMyTrades
        //
        //        {
        //            "symbol": "SOL_USDT",
        //            "revisionId": "891839406",
        //            "size": "0.042",
        //            "price": "185.06",
        //            "takerSide": "sell",
        //            "time": "1753773952039342",
        //            "orderId": "3717304929194",
        //            "userSide": "sell",
        //            "quoteFee": "0.00777252",
        //            "arkmFee": "0",
        //            "clientOrderId": ""
        //        }
        //
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeIntegerProduct(trade, 'time', 0.001);
        const quoteFee = this.safeNumber(trade, 'quoteFee');
        const arkmFee = this.safeNumber(trade, 'arkmFee');
        let fee = undefined;
        if (quoteFee !== undefined) {
            fee = {
                'cost': quoteFee,
                'currency': market['quote'],
            };
        }
        else if (arkmFee !== undefined) {
            fee = {
                'cost': arkmFee,
                'currency': 'ARKM',
            };
        }
        return this.safeTrade({
            'info': trade,
            'id': this.safeString(trade, 'revisionId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': this.safeString2(trade, 'userSide', 'takerSide'),
            'takerOrMaker': undefined,
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'size'),
            'cost': undefined,
            'fee': fee,
            'order': this.safeString(trade, 'orderId'),
        }, market);
    }
    /**
     * @method
     * @name arkmm#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://arkm.com/docs#get/orders/by-client-order-id
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        const request = {
            'id': parseInt(id),
        };
        const response = await this.v1PrivateGetOrdersId(this.extend(request, params));
        //
        //    {
        //        "orderId": "3690478767430",
        //        "userId": "2959123",
        //        "subaccountId": "0",
        //        "symbol": "SOL_USDT",
        //        "time": "1753696843913970",
        //        "side": "sell",
        //        "type": "limitGtc",
        //        "size": "0.066",
        //        "price": "293.2",
        //        "postOnly": false,
        //        "reduceOnly": false,
        //        "executedSize": "0",
        //        "status": "booked",
        //        "avgPrice": "0",
        //        "executedNotional": "0",
        //        "creditFeePaid": "0",
        //        "marginBonusFeePaid": "0",
        //        "quoteFeePaid": "0",
        //        "arkmFeePaid": "0",
        //        "revisionId": "887956326",
        //        "lastTime": "1753696843914830",
        //        "clientOrderId": "",
        //        "lastSize": "0",
        //        "lastPrice": "0",
        //        "lastCreditFee": "0",
        //        "lastMarginBonusFee": "0",
        //        "lastQuoteFee": "0",
        //        "lastArkmFee": "0"
        //    }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name arkham#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://arkm.com/docs#get/orders/history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // note, API does not work for this param
        }
        const response = await this.v1PrivateGetOrdersHistory(this.extend(request, params));
        //
        //     [
        //        {
        //            "orderId": "3690478767430",
        //            "userId": "2959123",
        //            "subaccountId": "0",
        //            "symbol": "SOL_USDT",
        //            "time": "1753696843913970",
        //            "side": "sell",
        //            "type": "limitGtc",
        //            "size": "0.066",
        //            "price": "293.2",
        //            "postOnly": false,
        //            "reduceOnly": false,
        //            "executedSize": "0",
        //            "status": "closed",
        //            "avgPrice": "0",
        //            "executedNotional": "0",
        //            "creditFeePaid": "0",
        //            "marginBonusFeePaid": "0",
        //            "quoteFeePaid": "0",
        //            "arkmFeePaid": "0",
        //            "revisionId": "888084076",
        //            "lastTime": "1753701350088305",
        //            "clientOrderId": "",
        //            "lastSize": "0",
        //            "lastPrice": "0",
        //            "lastCreditFee": "0",
        //            "lastMarginBonusFee": "0",
        //            "lastQuoteFee": "0",
        //            "lastArkmFee": "0"
        //        }
        //    ]
        //
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name arkham#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://arkm.com/docs#get/orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const isTriggerOrder = this.safeBool(params, 'trigger');
        params = this.omit(params, 'trigger');
        let response = undefined;
        if (isTriggerOrder) {
            response = await this.v1PrivateGetTriggerOrders(this.extend({}, params));
            //
            //    [
            //        {
            //            "subaccountId": "0",
            //            "symbol": "SOL_USDT",
            //            "side": "sell",
            //            "type": "market",
            //            "size": "0.045",
            //            "price": "99.9",
            //            "postOnly": false,
            //            "reduceOnly": false,
            //            "time": "1753768103780063",
            //            "triggerOrderId": "3715847222127",
            //            "triggerType": "stopLoss",
            //            "triggerPriceType": "last",
            //            "triggerPrice": "111",
            //            "clientOrderId": "",
            //            "status": "staged"
            //        },
            //    ]
            //
        }
        else {
            response = await this.v1PrivateGetOrders(this.extend({}, params));
            //
            // [
            //    {
            //        "orderId": "3690478767430",
            //        "userId": "2959123",
            //        "subaccountId": "0",
            //        "symbol": "SOL_USDT",
            //        "time": "1753696843913970",
            //        "side": "sell",
            //        "type": "limitGtc",
            //        "size": "0.066",
            //        "price": "293.2",
            //        "postOnly": false,
            //        "reduceOnly": false,
            //        "executedSize": "0",
            //        "status": "booked",
            //        "avgPrice": "0",
            //        "executedNotional": "0",
            //        "creditFeePaid": "0",
            //        "marginBonusFeePaid": "0",
            //        "quoteFeePaid": "0",
            //        "arkmFeePaid": "0",
            //        "revisionId": "887956326",
            //        "lastTime": "1753696843914830",
            //        "clientOrderId": "",
            //        "lastSize": "0",
            //        "lastPrice": "0",
            //        "lastCreditFee": "0",
            //        "lastMarginBonusFee": "0",
            //        "lastQuoteFee": "0",
            //        "lastArkmFee": "0"
            //    }
            // ]
            //
        }
        return this.parseOrders(response, market, since, limit);
    }
    /**
     * @method
     * @name arkham#cancelOrder
     * @description cancels an open order
     * @see https://arkm.com/docs#post/orders/cancel
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        const isTriggerOrder = this.safeBool(params, 'trigger');
        params = this.omit(params, 'trigger');
        let response = undefined;
        const request = {};
        const clientOrderId = this.safeInteger(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params = this.omit(params, 'clientOrderId');
            request['clientOrderId'] = clientOrderId;
        }
        else {
            if (isTriggerOrder) {
                request['triggerOrderId'] = parseInt(id);
            }
            else {
                request['orderId'] = parseInt(id);
            }
        }
        if (isTriggerOrder) {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument for trigger orders');
            }
            const market = this.market(symbol);
            request['symbol'] = market['id'];
            response = await this.v1PrivatePostTriggerOrdersCancel(this.extend(request, params));
        }
        else {
            response = await this.v1PrivatePostOrdersCancel(this.extend(request, params));
        }
        //
        // {"orderId":3691703758327}
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name arkham#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://arkm.com/docs#post/orders/cancel/all
     * @param {string} symbol cancel alls open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        if (symbol !== undefined) {
            throw new errors.BadRequest(this.id + ' cancelAllOrders() does not support a symbol argument, use cancelOrder() or fetchOpenOrders() instead');
        }
        const isTriggerOrder = this.safeBool(params, 'trigger');
        params = this.omit(params, 'trigger');
        let response = undefined;
        if (isTriggerOrder) {
            response = await this.v1PrivatePostTriggerOrdersCancelAll(params);
        }
        else {
            response = await this.v1PrivatePostOrdersCancelAll(params);
        }
        //
        // []  returns an empty array, even when successfully cancels orders
        //
        return this.parseOrders(response, undefined);
    }
    /**
     * @method
     * @name arkham#createOrder
     * @description create a trade order on the exchange
     * @see https://arkm.com/docs#post/orders/new
     * @param {string} symbol unified CCXT market symbol
     * @param {string} type "limit" or "market"
     * @param {string} side "buy" or "sell"
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
     * @param {float} [params.triggerPrice] price for a trigger (conditional) order
     * @param {float} [params.stopLossPrice] price for a stoploss order
     * @param {float} [params.takeProfitPrice] price for a takeprofit order
     * @param {string} [params.triggerDirection] the direction for trigger orders, 'ascending' or 'descending'
     * @param {string} [params.triggerPriceType] mark, index or last
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @returns [An order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const isTriggerOrder = this.safeNumberN(params, ['triggerPrice', 'stopLossPrice', 'takeProfitPrice']) !== undefined;
        const request = this.createOrderRequest(symbol, type, side, amount, price, params);
        let response = undefined;
        if (isTriggerOrder) {
            response = await this.v1PrivatePostTriggerOrdersNew(request);
            //
            //    {
            //        "triggerOrderId": "3716436645573",
            //        "symbol": "SOL_USDT_PERP",
            //        "side": "buy",
            //        "type": "limitGtc",
            //        "size": "0.05",
            //        "price": "150"
            //    }
            //
        }
        else {
            response = await this.v1PrivatePostOrdersNew(request);
            //
            //    {
            //        "orderId": "3694872060678",
            //        "clientOrderId": "test123",
            //        "symbol": "SOL_USDT",
            //        "subaccountId": "0",
            //        "side": "buy",
            //        "type": "limitGtc",
            //        "size": "0.05",
            //        "price": "170",
            //        "time": "1753710501474043"
            //    }
            //
        }
        return this.parseOrder(response, market);
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        symbol = market['symbol'];
        const request = {
            'symbol': market['id'],
            'side': side,
            'size': this.amountToPrecision(symbol, amount),
        };
        const isBuy = (side === 'buy');
        const stopLossPrice = this.safeNumber(params, 'stopLossPrice');
        const takeProfitPrice = this.safeNumber(params, 'takeProfitPrice');
        const triggerPriceAny = this.safeStringN(params, ['triggerPrice', 'stopLossPrice', 'takeProfitPrice']);
        if (triggerPriceAny !== undefined) {
            request['triggerPrice'] = this.priceToPrecision(symbol, triggerPriceAny);
            if (stopLossPrice !== undefined) {
                request['triggerType'] = isBuy ? 'stopLoss' : 'takeProfit';
            }
            else if (takeProfitPrice !== undefined) {
                request['triggerType'] = isBuy ? 'takeProfit' : 'stopLoss';
            }
            else {
                const triggerDirection = this.safeString(params, 'triggerDirection');
                if (triggerDirection === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a triggerDirection parameter when triggerPrice is specified, must be "ascending" or "descending"');
                }
                if (triggerDirection !== undefined) {
                    if (triggerDirection === 'ascending') {
                        request['triggerType'] = isBuy ? 'stopLoss' : 'takeProfit';
                    }
                    else if (triggerDirection === 'descending') {
                        request['triggerType'] = isBuy ? 'takeProfit' : 'stopLoss';
                    }
                }
            }
            // mandatory triggerPriceType
            if (this.safeString(params, 'triggerPriceType') === undefined) {
                request['triggerPriceType'] = 'last'; // default
            }
        }
        const isMarketOrder = (type === 'market');
        const isLimitOrder = (type === 'limit');
        const isLimitExchangeSpecific = this.inArray(type, ['limitGtc', 'limitIoc', 'limitFok']);
        const postOnly = this.isPostOnly(isMarketOrder, false, params);
        const timeInForce = this.safeString(params, 'timeInForce');
        params = this.omit(params, ['postOnly', 'timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'triggerDirection']);
        if (postOnly) {
            request['postOnly'] = true;
        }
        if (isLimitOrder || isLimitExchangeSpecific) {
            request['price'] = this.priceToPrecision(symbol, price);
            //
            if (timeInForce === 'IOC') {
                request['type'] = 'limitIoc';
            }
            else if (timeInForce === 'FOK') {
                request['type'] = 'limitFok';
            }
            else {
                request['type'] = 'limitGtc';
            }
        }
        else if (isMarketOrder) {
            request['type'] = 'market';
        }
        // we don't need to manually handle `reduceOnly`, `clientOrderId`, `triggerPriceType` here as exchange-specific keyname & values matches
        return this.extend(request, params);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //
        //    {
        //        "orderId": "3694872060678",
        //        "clientOrderId": "test123",
        //        "symbol": "SOL_USDT",
        //        "subaccountId": "0",
        //        "side": "buy",
        //        "type": "limitGtc",
        //        "size": "0.05",
        //        "price": "170",
        //        "time": "1753710501474043"
        //    }
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //    {
        //        "orderId": "3690478767430",
        //        "userId": "2959123",
        //        "subaccountId": "0",
        //        "symbol": "SOL_USDT",
        //        "time": "1753696843913970",
        //        "side": "sell",
        //        "type": "limitGtc",
        //        "size": "0.066",
        //        "price": "293.2",
        //        "postOnly": false,
        //        "reduceOnly": false,
        //        "executedSize": "0",
        //        "status": "booked",
        //        "avgPrice": "0",
        //        "executedNotional": "0",
        //        "creditFeePaid": "0",
        //        "marginBonusFeePaid": "0",
        //        "quoteFeePaid": "0",
        //        "arkmFeePaid": "0",
        //        "revisionId": "887956326",
        //        "lastTime": "1753696843914830",
        //        "clientOrderId": "",
        //        "lastSize": "0",
        //        "lastPrice": "0",
        //        "lastCreditFee": "0",
        //        "lastMarginBonusFee": "0",
        //        "lastQuoteFee": "0",
        //        "lastArkmFee": "0"
        //    }
        //
        // trigger-orders: createOrder
        //
        //    {
        //        "triggerOrderId": "3716436645573",
        //        "symbol": "SOL_USDT_PERP",
        //        "side": "buy",
        //        "type": "limitGtc",
        //        "size": "0.05",
        //        "price": "150"
        //    }
        //
        // trigger-orders: fetchOpenOrders
        //
        //    {
        //            "subaccountId": "0",
        //            "symbol": "SOL_USDT",
        //            "side": "sell",
        //            "type": "market",
        //            "size": "0.045",
        //            "price": "99.9",
        //            "postOnly": false,
        //            "reduceOnly": false,
        //            "time": "1753768103780063",
        //            "triggerOrderId": "3715847222127",
        //            "triggerType": "stopLoss",
        //            "triggerPriceType": "last",
        //            "triggerPrice": "111",
        //            "clientOrderId": "",
        //            "status": "staged"
        //    }
        //
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const isPostOnly = this.safeBool(order, 'postOnly');
        const typeRaw = this.safeString(order, 'type');
        const orderType = isPostOnly ? 'limit' : this.parseOrderType(typeRaw);
        const timeInForce = isPostOnly ? 'PO' : this.parseTimeInForce(typeRaw);
        const quoteFeePaid = this.safeString(order, 'quoteFeePaid');
        const arkmFeePaid = this.safeString(order, 'arkmFeePaid');
        const fees = [];
        if (quoteFeePaid !== undefined) {
            fees.push({
                'cost': quoteFeePaid,
                'currency': this.safeString(market, 'quote'),
            });
        }
        if (arkmFeePaid !== undefined) {
            fees.push({
                'cost': arkmFeePaid,
                'currency': 'ARKM',
            });
        }
        const timestamp = this.safeIntegerProduct(order, 'time', 0.001);
        return this.safeOrder({
            'id': this.safeString2(order, 'orderId', 'triggerOrderId'),
            'clientOrderId': this.safeString(order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimeStamp': undefined,
            'lastUpdateTimestamp': this.safeIntegerProduct(order, 'lastTime', 0.001),
            'status': this.parseOrderStatus(this.safeString(order, 'status')),
            'symbol': market['symbol'],
            'type': orderType,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': this.safeString(order, 'side'),
            'price': this.safeNumber(order, 'price'),
            'triggerPrice': undefined,
            'cost': this.safeNumber(order, 'executedNotional'),
            'average': this.safeNumberOmitZero(order, 'avgPrice'),
            'amount': this.safeNumber(order, 'size'),
            'filled': this.safeNumber(order, ''),
            'remaining': undefined,
            'trades': undefined,
            'fees': fees,
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
            'info': order,
        }, market);
    }
    parseOrderType(type) {
        const types = {
            'limitGtc': 'limit',
            'limitIoc': 'limit',
            'limitFok': 'limit',
            'market': 'market',
        };
        return this.safeStringUpper(types, type, type);
    }
    parseTimeInForce(type) {
        const types = {
            'limitGtc': 'GTC',
            'limitIoc': 'IOC',
            'limitFok': 'FOK',
            'market': 'IOC',
        };
        return this.safeStringUpper(types, type, type);
    }
    parseOrderStatus(status) {
        const statuses = {
            'new': 'pending',
            'staged': 'open',
            'booked': 'open',
            'taker': 'closed',
            'maker': 'closed',
            'cancelled': 'canceled',
            'closed': 'closed',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name arkham#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://arkm.com/docs#get/trades/time
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {string} [params.page_token] page_token - used for paging
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // exchange needs to obtain some `from & to` values, otherwise it does not return any result
        const defaultRange = 24 * 60 * 60 * 1000; // default to last 24 hours
        if (since !== undefined) {
            request['from'] = since * 1000; // convert ms to microseconds
        }
        else {
            request['from'] = (this.milliseconds() - defaultRange) * 1000; // default to last 24 hours
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            params = this.omit(params, 'until');
            request['to'] = until * 1000; // convert ms to microseconds
        }
        else {
            request['to'] = this.sum(request['from'], defaultRange * 1000);
        }
        [request, params] = this.handleUntilOption('until', request, params);
        const response = await this.v1PrivateGetTradesTime(this.extend(request, params));
        //
        //    [
        //        {
        //            "symbol": "SOL_USDT",
        //            "revisionId": "891839406",
        //            "size": "0.042",
        //            "price": "185.06",
        //            "takerSide": "sell",
        //            "time": "1753773952039342",
        //            "orderId": "3717304929194",
        //            "userSide": "sell",
        //            "quoteFee": "0.00777252",
        //            "arkmFee": "0",
        //            "clientOrderId": ""
        //        },
        //        ...
        //
        return this.parseTrades(response, undefined, since, limit);
    }
    /**
     * @method
     * @name arkham#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://arkm.com/docs#get/user
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
     */
    async fetchAccounts(params = {}) {
        await this.loadMarkets();
        const request = {};
        let accountId = undefined;
        [accountId, params] = this.handleOptionAndParams(params, 'fetchAccounts', 'accountId');
        if (accountId !== undefined) {
            request['subAccountId'] = accountId;
        }
        const response = await this.v1PrivateGetUser(this.extend(request, params));
        //
        //    {
        //        "id": "2959123",
        //        "email": "xyz@gmail.com",
        //        "username": "t.123",
        //        "requireMFA": true,
        //        "kycVerifiedAt": "1753434515850673",
        //        "pmm": false,
        //        "dmm": false,
        //        "becameVipAt": "0",
        //        "subaccounts": [
        //            {
        //                "id": "0",
        //                "name": "Primary",
        //                "pinned": true,
        //                "isLsp": false,
        //                "futuresEnabled": true,
        //                "payFeesInArkm": false,
        //                "lspSettings": []
        //            }
        //        ],
        //        "settings": {
        //            "autogenDepositAddresses": false,
        //            "hideBalances": false,
        //            "confirmBeforePlaceOrder": false,
        //            "tickerTapeScroll": true,
        //            "updatesFlash": true,
        //            "notifyOrderFills": false,
        //            "notifyAnnouncements": false,
        //            "notifyMarginUsage": false,
        //            "marginUsageThreshold": "0.5",
        //            "notifyWithdrawals": true,
        //            "notifyDeposits": true,
        //            "notifySendEmail": true,
        //            "notifyRebates": true,
        //            "notifyCommissions": true,
        //            "allowSequenceEmails": true,
        //            "language": "en"
        //        },
        //        "airdropKycAt": null
        //    }
        //
        const subAccounts = this.safeList(response, 'subaccounts', []);
        return this.parseAccounts(subAccounts, params);
    }
    parseAccount(account) {
        //
        //            {
        //                "id": "0",
        //                "name": "Primary",
        //                "pinned": true,
        //                "isLsp": false,
        //                "futuresEnabled": true,
        //                "payFeesInArkm": false,
        //                "lspSettings": []
        //            }
        //
        return {
            'id': this.safeString(account, 'id'),
            'type': undefined,
            'code': undefined,
            'info': account,
        };
    }
    /**
     * @method
     * @name arkham#fetchBalance
     * @description query for account info
     * @see https://arkm.com/docs#get/account/balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v1PrivateGetAccountBalances(params);
        //
        //    [
        //        {
        //            "subaccountId": "0",
        //            "symbol": "USDT",
        //            "balance": "19.66494694",
        //            "free": "19.66494694",
        //            "priceUSDT": "1",
        //            "balanceUSDT": "19.66494694",
        //            "freeUSDT": "19.66494694",
        //            "lastUpdateReason": "orderFill",
        //            "lastUpdateTime": "1753773952039342",
        //            "lastUpdateId": "248507437",
        //            "lastUpdateAmount": "7.77252"
        //        },
        //        {
        //            "subaccountId": "0",
        //            "symbol": "SOL",
        //            "balance": "0",
        //            "free": "0",
        //            "priceUSDT": "186.025584673",
        //            "balanceUSDT": "0",
        //            "freeUSDT": "0",
        //            "lastUpdateReason": "orderFill",
        //            "lastUpdateTime": "1753773952039342",
        //            "lastUpdateId": "248507435",
        //            "lastUpdateAmount": "-0.042"
        //        }
        //    ]
        //
        return this.parseBalance(response);
    }
    parseBalance(response) {
        const timestamp = this.safeIntegerProduct(response, 'lastUpdateTime', 0.001);
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const symbol = this.safeString(balance, 'symbol');
            const code = this.safeCurrencyCode(symbol);
            const account = this.account();
            account['total'] = this.safeString(balance, 'balance');
            account['free'] = this.safeString(balance, 'free');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name arkham#createDepositAddress
     * @description create a currency deposit address
     * @see https://arkm.com/docs#post/account/deposit/addresses/new
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async createDepositAddress(code, params = {}) {
        await this.loadMarkets();
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createDepositAddress() requires a "network" param');
        }
        const request = {
            'chain': networkCode,
        };
        const response = await this.v1PrivatePostAccountDepositAddressesNew(this.extend(request, params));
        //
        //    {
        //        "addresses": "12NauJ26TUT9aYkpId7YdePJJDRMGbAsEMVoTVUvBErV"
        //    }
        //
        const address = this.safeString(response, 'addresses');
        return this.parseDepositAddress(address, this.currency(code));
    }
    /**
     * @method
     * @name arkham#fetchDepositAddressesByNetwork
     * @description fetch the deposit addresses for a currency associated with this account
     * @see https://arkm.com/docs#get/account/deposit/addresses
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary [address structures]{@link https://docs.ccxt.com/?id=address-structure}, indexed by the network
     */
    async fetchDepositAddressesByNetwork(code, params = {}) {
        await this.loadMarkets();
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDepositAddressesByNetwork() requires a "network" param');
        }
        const request = {
            'chain': this.networkCodeToId(networkCode),
        };
        const response = await this.v1PrivateGetAccountDepositAddresses(this.extend(request, params));
        //
        //    {
        //        "addresses": [
        //            "12NauJ26TUT9aYkpId7YdePJJDRMGbAsEMVoTVUvBErV"
        //        ]
        //    }
        //
        const data = this.safeList(response, 'addresses');
        const parsed = this.parseDepositAddresses(data, undefined, false, { 'network': networkCode });
        return this.indexBy(parsed, 'network');
    }
    parseDepositAddress(entry, currency = undefined) {
        //
        //     "12NauJ26TUT9aYkpId7YdePJJDRMGbAsEMVoTVUvBErV"
        //
        return {
            'info': entry,
            'currency': this.safeString(currency, 'code'),
            'network': undefined,
            'address': entry,
            'tag': undefined,
        };
    }
    /**
     * @method
     * @name arkham#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://arkm.com/docs#get/account/deposit/addresses
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const networkCodeAndParams = this.handleNetworkCodeAndParams(params);
        const networkCode = networkCodeAndParams[0];
        const indexedAddresses = await this.fetchDepositAddressesByNetwork(code, params);
        const selectedNetworkCode = this.selectNetworkCodeFromUnifiedNetworks(currency['code'], networkCode, indexedAddresses);
        const address = this.safeDict(indexedAddresses, selectedNetworkCode);
        if (address === undefined) {
            throw new errors.InvalidAddress(this.id + ' fetchDepositAddress() could not find a deposit address for ' + code);
        }
        return address;
    }
    /**
     * @method
     * @name arkham#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://arkm.com/docs#get/account/deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetAccountDeposits(this.extend(request, params));
        //
        //    [
        //        {
        //            "id": "238644",
        //            "symbol": "SOL",
        //            "amount": "0.104",
        //            "time": "1753436404000000",
        //            "confirmed": true,
        //            "transactionHash": "1DRxbbyePTsMuB82SDf2fG5gLXH5iYnY8TQDstDPLULpLtjMJtF1ug1T4Mf8B6DSb8fp2sb5YtdbyqieZ2tkE1Ve",
        //            "chain": "Solana",
        //            "depositAddress": "12NauJ26TUT9aYkpId7YdePJJDRMGbAsEMVoTVUvBErV",
        //            "price": "180.322010164"
        //        }
        //    ]
        //
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        return this.parseTransactions(response, currency, since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //        {
        //            "id": "238644",
        //            "symbol": "SOL",
        //            "amount": "0.104",
        //            "time": "1753436404000000",
        //            "confirmed": true,
        //            "transactionHash": "1DRxbbyePTsMuB82SDf2fG5gLXH5iYnY8TQDstDPLULpLtjMJtF1ug1T4Mf8B6DSb8fp2sb5YtdbyqieZ2tkE1Ve",
        //            "chain": "Solana",
        //            "depositAddress": "12NauJ26TUT9aYkpId7YdePJJDRMGbAsEMVoTVUvBErV",
        //            "price": "180.322010164"
        //        }
        //
        const address = this.safeString(transaction, 'depositAddress');
        const timestamp = this.safeIntegerProduct(transaction, 'time', 0.001);
        const confirmd = this.safeBool(transaction, 'confirmed');
        let status = undefined;
        if (confirmd) {
            status = 'ok';
        }
        const currencyId = this.safeString(transaction, 'symbol');
        const code = this.safeCurrencyCode(currencyId, currency);
        return {
            'info': transaction,
            'id': this.safeString(transaction, 'id'),
            'txid': this.safeString(transaction, 'transactionHash'),
            'type': undefined,
            'currency': code,
            'network': this.networkIdToCode(this.safeString(transaction, 'chain')),
            'amount': this.safeNumber(transaction, 'amount'),
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'address': address,
            'addressFrom': undefined,
            'addressTo': address,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'updated': undefined,
            'comment': undefined,
            'fee': undefined,
            'internal': false,
        };
    }
    /**
     * @method
     * @name arkham#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://arkm.com/docs#get/account/fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        const response = await this.v1PrivateGetAccountFees(params);
        //
        // {
        //   "perpMakerFee": "1.23",
        //   "perpTakerFee": "1.23",
        //   "spotMakerFee": "1.23",
        //   "spotTakerFee": "1.23"
        // }
        //
        const symbols = Object.keys(this.markets);
        const result = {};
        const spotMaker = this.safeNumber(response, 'spotMakerFee');
        const spotTaker = this.safeNumber(response, 'spotTakerFee');
        const perpMaker = this.safeNumber(response, 'perpMakerFee');
        const perpTaker = this.safeNumber(response, 'perpTakerFee');
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.markets[symbol];
            result[symbol] = {
                'info': response,
                'symbol': symbol,
            };
            if (market['spot']) {
                result[symbol]['maker'] = spotMaker;
                result[symbol]['taker'] = spotTaker;
            }
            else if (market['swap'] || market['future']) {
                result[symbol]['maker'] = perpMaker;
                result[symbol]['taker'] = perpTaker;
            }
        }
        return result;
    }
    /**
     * @method
     * @name arkham#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://arkm.com/docs#get/account/funding-rate-payments
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v1PrivateGetAccountFundingRatePayments(this.extend(request, params));
        //
        //     [
        //         {
        //             "amount": "20.1",
        //             "assetSymbol": "BTC",
        //             "indexPrice": "1.23",
        //             "pairSymbol": "BTC_USDT",
        //             "time": 1704067200000000,
        //             "id": 1,
        //             "subaccountId": 1,
        //             "userId": 1
        //         },
        //         ...
        //     ]
        //
        return this.parseIncomes(response, market, since, limit);
    }
    parseIncome(income, market = undefined) {
        //
        //         {
        //             "amount": "20.1",
        //             "assetSymbol": "BTC",
        //             "indexPrice": "1.23",
        //             "pairSymbol": "BTC_USDT",
        //             "time": 1704067200000000,
        //             "id": 1,
        //             "subaccountId": 1,
        //             "userId": 1
        //         }
        //
        const marketId = this.safeString(income, 'pairSymbol');
        const currencyId = this.safeString(income, 'assetSymbol');
        const timestamp = this.safeIntegerProduct(income, 'time', 0.001);
        return {
            'info': income,
            'symbol': this.safeSymbol(marketId, market),
            'code': this.safeCurrencyCode(currencyId),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(income, 'id'),
            'amount': this.safeNumber(income, 'amount'),
        };
    }
    /**
     * @method
     * @name arkham#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://arkm.com/docs#get/account/leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const marketId = this.safeString(market, 'id');
        const request = {
            'symbol': marketId,
        };
        const response = await this.v1PrivateGetAccountLeverage(this.extend(request, params));
        //
        // might be empty if not changed from default value (which is 1x)
        //
        //    [
        //        {
        //            "symbol": "BTC_USDT_PERP",
        //            "leverage": "7"
        //        },
        //        {
        //            "symbol": "ETH_USDT_PERP",
        //            "leverage": "5"
        //        }
        //    ]
        //
        const indexed = this.indexBy(response, 'symbol');
        const data = this.safeDict(indexed, marketId, {});
        return this.parseLeverage(data, market);
    }
    parseLeverage(leverage, market = undefined) {
        //
        //        {
        //            "symbol": "ETH_USDT_PERP",
        //            "leverage": "5"
        //        }
        //
        const marketId = this.safeString(leverage, 'symbol');
        const leverageNum = this.safeNumber(leverage, 'leverage'); // default leverage is 1 typically
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': undefined,
            'longLeverage': leverageNum,
            'shortLeverage': leverageNum,
        };
    }
    /**
     * @method
     * @name arkham#setLeverage
     * @description set the level of leverage for a market
     * @see https://arkm.com/docs#post/account/leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const leverageString = this.numberToString(leverage);
        const marketId = this.safeString(market, 'id');
        const request = {
            'symbol': marketId,
            'leverage': leverageString,
        };
        const response = await this.v1PrivatePostAccountLeverage(this.extend(request, params));
        //
        // response is just empty string
        //
        return this.parseLeverage(response, market);
    }
    /**
     * @method
     * @name arkkm#fetchPositions
     * @description fetch all open positions
     * @see https://arkm.com/docs#get/account/positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.standard] whether to fetch standard contract positions
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.v1PrivateGetAccountPositions(params);
        //
        //    [
        //        {
        //            "subaccountId": "0",
        //            "symbol": "SOL_USDT_PERP",
        //            "base": "0.037",
        //            "quote": "-6.44614",
        //            "openBuySize": "0",
        //            "openSellSize": "0",
        //            "openBuyNotional": "0",
        //            "openSellNotional": "0",
        //            "lastUpdateReason": "orderFill",
        //            "lastUpdateTime": "1753903829389966",
        //            "lastUpdateId": "250434684",
        //            "lastUpdateBaseDelta": "0.037",
        //            "lastUpdateQuoteDelta": "-6.44614",
        //            "breakEvenPrice": "174.22",
        //            "markPrice": "174.33",
        //            "value": "6.45021",
        //            "pnl": "0.00407",
        //            "initialMargin": "0.645021",
        //            "maintenanceMargin": "0.3870126",
        //            "averageEntryPrice": "174.22"
        //        }
        //    ]
        //
        return this.parsePositions(response, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        //        {
        //            "subaccountId": "0",
        //            "symbol": "SOL_USDT_PERP",
        //            "base": "0.037",                             // negative for short position
        //            "quote": "-6.44614",                         // negative for long position
        //            "openBuySize": "0",
        //            "openSellSize": "0",
        //            "openBuyNotional": "0",
        //            "openSellNotional": "0",
        //            "lastUpdateReason": "orderFill",
        //            "lastUpdateTime": "1753903829389966",
        //            "lastUpdateId": "250434684",
        //            "lastUpdateBaseDelta": "0.037",
        //            "lastUpdateQuoteDelta": "-6.44614",
        //            "breakEvenPrice": "174.22",
        //            "markPrice": "174.33",
        //            "value": "6.45021",
        //            "pnl": "0.00407",
        //            "initialMargin": "0.645021",
        //            "maintenanceMargin": "0.3870126",
        //            "averageEntryPrice": "174.22"
        //        }
        //
        const base = this.safeString(position, 'base');
        const baseAbs = Precise["default"].stringAbs(base);
        const isLong = Precise["default"].stringGe(base, '0');
        const side = isLong ? 'long' : 'short';
        const marketId = this.safeString(position, 'symbol');
        const notional = this.safeString(position, 'value');
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': this.safeSymbol(marketId, market),
            'notional': this.parseNumber(Precise["default"].stringAbs(notional)),
            'marginMode': undefined,
            'liquidationPrice': undefined,
            'entryPrice': this.safeNumber(position, 'averageEntryPrice'),
            'unrealizedPnl': this.safeNumber(position, 'pnl'),
            'realizedPnl': undefined,
            'percentage': undefined,
            'contracts': this.parseNumber(baseAbs),
            'contractSize': undefined,
            'markPrice': this.safeNumber(position, 'markPrice'),
            'lastPrice': undefined,
            'side': side,
            'hedged': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': this.safeInteger(position, 'lastUpdateTime'),
            'maintenanceMargin': this.safeNumber(position, 'maintenanceMargin'),
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': this.safeNumber(position, 'initialMargin'),
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name arkkm#withdraw
     * @description make a withdrawal
     * @see https://arkm.com/docs#post/account/withdraw
     * @see https://arkm.com/docs#get/account/withdrawal/addresses
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        const withdrawalAddresses = await this.v1PrivateGetAccountWithdrawalAddresses();
        //
        //    [
        //        {
        //            "id": "12345",
        //            "chain": "ETH",
        //            "address": "0x743f79D65EA07AA222F4a83c10dee4210A920a6e",
        //            "label": "my_binance",
        //            "createdAt": "1753905200074355",
        //            "updatedAt": "1753905213464278",
        //            "confirmed": true
        //        }
        //    ]
        //
        const currency = this.currency(code);
        const request = {
            'symbol': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
            'subaccountId': this.safeInteger(params, 'subAccountId', 0),
        };
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' withdraw() requires a "network" param');
        }
        const indexedList = this.groupBy(withdrawalAddresses, 'address');
        if (!(address in indexedList)) {
            throw new errors.InvalidAddress(this.id + ' withdraw() requires an address that has been previously added to the whitelisted addresses');
        }
        const withdrawalObjects = indexedList[address];
        let foundWithdrawalObject = undefined;
        for (let i = 0; i < withdrawalObjects.length; i++) {
            const withdrawalObject = withdrawalObjects[i];
            if (withdrawalObject['chain'] === networkCode) {
                foundWithdrawalObject = withdrawalObject;
                break;
            }
        }
        if (foundWithdrawalObject === undefined) {
            throw new errors.InvalidAddress(this.id + ' withdraw() can not find whitelisted withdrawal address for ' + address + ' with network ' + networkCode);
        }
        request['addressId'] = this.safeInteger(foundWithdrawalObject, 'id');
        const response = await this.v1PrivatePostAccountWithdraw(this.extend(request, params));
        //
        // response is a weird string like:
        //
        //    "1234709779980\\n"
        //
        const responseString = response.replace('\n', '');
        const data = { 'id': responseString };
        return this.parseTransaction(data, currency);
    }
    /**
     * @method
     * @name arkham#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://arkm.com/docs#get/public/margin-schedules
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
     */
    async fetchLeverageTiers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        if (symbols === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchLeverageTiers() requires a symbols argument');
        }
        symbols = this.marketSymbols(symbols);
        const response = await this.v1PublicGetMarginSchedules(params);
        //
        //    [
        //        {
        //            "name": "A",
        //            "bands": [
        //                {
        //                    "positionLimit": "1000000",
        //                    "leverageRate": "50",
        //                    "marginRate": "0.02",
        //                    "rebate": "0"
        //                },
        //                {
        //                    "positionLimit": "2000000",
        //                    "leverageRate": "25",
        //                    "marginRate": "0.04",
        //                    "rebate": "20000"
        //                },
        //                {
        //                    "positionLimit": "5000000",
        //                    "leverageRate": "20",
        //                    "marginRate": "0.05",
        //                    "rebate": "40000"
        //                }
        //            ]
        //        },
        //        {
        //            "name": "B",
        //            ...
        //
        return this.parseLeverageTiers(response, symbols);
    }
    parseLeverageTiers(response, symbols = undefined, marketIdKey = undefined) {
        // overloaded method
        const indexed = this.indexBy(response, 'name');
        symbols = this.marketSymbols(symbols);
        const tiers = {};
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const marginSchedule = this.safeString(market['info'], 'marginSchedule');
            if (marginSchedule === undefined) {
                throw new errors.BadSymbol(this.id + ' fetchLeverageTiers() could not find marginSchedule for ' + symbol);
            }
            const selectedDict = this.safeDict(indexed, marginSchedule, {});
            const bands = this.safeList(selectedDict, 'bands', []);
            tiers[symbol] = this.parseMarketLeverageTiers(bands, market);
        }
        return tiers;
    }
    parseMarketLeverageTiers(info, market = undefined) {
        const tiers = [];
        const brackets = info;
        let minNotional = 0;
        for (let i = 0; i < brackets.length; i++) {
            const tier = brackets[i];
            const marketId = this.safeString(info, 'market');
            market = this.safeMarket(marketId, market, undefined, 'swap');
            const maxNotional = this.safeNumber(tier, 'positionLimit');
            tiers.push({
                'tier': this.sum(i, 1),
                'symbol': this.safeSymbol(marketId, market, undefined, 'swap'),
                'currency': market['linear'] ? market['base'] : market['quote'],
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeNumber(tier, 'marginRate'),
                'maxLeverage': this.safeInteger(tier, 'leverageRate'),
                'info': tier,
            });
            minNotional = maxNotional;
        }
        return tiers;
    }
    findTimeframeByDuration(duration) {
        // this method is used to find the timeframe by duration in seconds
        const timeframes = this.safeDict(this.options, 'timeframeDurations', {});
        const keys = Object.keys(timeframes);
        for (let i = 0; i < keys.length; i++) {
            const timeframe = keys[i];
            const durationInMicroseconds = this.safeInteger(timeframes, timeframe);
            if (durationInMicroseconds === duration) {
                return timeframe;
            }
        }
        return undefined;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const type = this.safeString(api, 0);
        const access = this.safeString(api, 1);
        const accessPart = (access === 'public') ? access + '/' : '';
        const query = this.omit(params, this.extractParams(path));
        path = this.implodeParams(path, params);
        let url = this.urls['api'][type] + '/' + accessPart + path;
        let queryString = '';
        if (method === 'GET') {
            if (Object.keys(query).length) {
                queryString = this.urlencode(query);
                url += '?' + queryString;
            }
        }
        if (access === 'private') {
            this.checkRequiredCredentials();
            const expires = (this.milliseconds() + this.safeInteger(this.options, 'requestExpiration', 5000)) * 1000; // need macroseconds
            if (method === 'POST') {
                body = this.json(params);
            }
            if (queryString !== '') {
                path = path + '?' + queryString;
            }
            const bodyStr = (body !== undefined) ? body : '';
            const payload = this.apiKey + expires.toString() + method.toUpperCase() + '/' + path + bodyStr;
            const decodedSecret = this.base64ToBinary(this.secret);
            const signature = this.hmac(this.encode(payload), decodedSecret, sha256.sha256, 'base64');
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Arkham-Api-Key': this.apiKey,
                'Arkham-Expires': expires.toString(),
                'Arkham-Signature': signature,
                'Arkham-Broker-Id': '1001',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        // error example:
        //
        //    {
        //        "id": "30005",
        //        "name": "InvalidNotional",
        //        "message": "order validation failed: invalid notional: notional 0.25 is less than min notional 1"
        //    }
        //
        const message = this.safeString(response, 'message');
        if (message !== undefined) {
            const errorCode = this.safeString(response, 'id');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(this.id + ' ' + body);
        }
        return undefined;
    }
}

exports["default"] = arkham;
