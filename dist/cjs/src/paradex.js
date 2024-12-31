'use strict';

var Precise = require('./base/Precise.js');
var paradex$1 = require('./abstract/paradex.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var crypto = require('./base/functions/crypto.js');
var sha3 = require('./static_dependencies/noble-hashes/sha3.js');
var secp256k1 = require('./static_dependencies/noble-curves/secp256k1.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class paradex
 * @description Paradex is a decentralized exchange built on the StarkWare layer 2 scaling solution. To access private methods you can either use the ETH public key and private key by setting (exchange.privateKey and exchange.walletAddress)
 * or alternatively you can provide the startknet private key and public key by setting exchange.options['paradexAccount'] with  add {"privateKey": A, "publicKey": B, "address": C}
 * @augments Exchange
 */
class paradex extends paradex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'paradex',
            'name': 'Paradex',
            'countries': [],
            'version': 'v1',
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createReduceOnlyOrder': false,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': true,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': 1,
                '3m': 3,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '1h': 60,
            },
            'hostname': 'paradex.trade',
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/84628770-784e-4ec4-a759-ec2fbb2244ea',
                'api': {
                    'v1': 'https://api.prod.{hostname}/v1',
                },
                'test': {
                    'v1': 'https://api.testnet.{hostname}/v1',
                },
                'www': 'https://www.paradex.trade/',
                'doc': 'https://docs.api.testnet.paradex.trade/',
                'fees': 'https://docs.paradex.trade/getting-started/trading-fees',
                'referral': 'https://app.paradex.trade/r/ccxt24',
            },
            'api': {
                'public': {
                    'get': {
                        'bbo/{market}': 1,
                        'funding/data': 1,
                        'markets': 1,
                        'markets/klines': 1,
                        'markets/summary': 1,
                        'orderbook/{market}': 1,
                        'insurance': 1,
                        'referrals/config': 1,
                        'system/config': 1,
                        'system/state': 1,
                        'system/time': 1,
                        'trades': 1,
                    },
                },
                'private': {
                    'get': {
                        'account': 1,
                        'account/profile': 1,
                        'balance': 1,
                        'fills': 1,
                        'funding/payments': 1,
                        'positions': 1,
                        'tradebusts': 1,
                        'transactions': 1,
                        'liquidations': 1,
                        'orders': 1,
                        'orders-history': 1,
                        'orders/by_client_id/{client_id}': 1,
                        'orders/{order_id}': 1,
                        'points_data/{market}/{program}': 1,
                        'referrals/summary': 1,
                        'transfers': 1,
                    },
                    'post': {
                        'account/profile/referral_code': 1,
                        'account/profile/username': 1,
                        'auth': 1,
                        'onboarding': 1,
                        'orders': 1,
                    },
                    'delete': {
                        'orders': 1,
                        'orders/by_client_id/{client_id}': 1,
                        'orders/{order_id}': 1,
                    },
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber('0.0002'),
                    'maker': this.parseNumber('0.0002'),
                },
                'spot': {
                    'taker': this.parseNumber('0.0002'),
                    'maker': this.parseNumber('0.0002'),
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'exceptions': {
                'exact': {
                    'VALIDATION_ERROR': errors.AuthenticationError,
                    'BINDING_ERROR': errors.OperationRejected,
                    'INTERNAL_ERROR': errors.ExchangeError,
                    'NOT_FOUND': errors.BadRequest,
                    'SERVICE_UNAVAILABLE': errors.ExchangeError,
                    'INVALID_REQUEST_PARAMETER': errors.BadRequest,
                    'ORDER_ID_NOT_FOUND': errors.InvalidOrder,
                    'ORDER_IS_CLOSED': errors.InvalidOrder,
                    'ORDER_IS_NOT_OPEN_YET': errors.InvalidOrder,
                    'CLIENT_ORDER_ID_NOT_FOUND': errors.InvalidOrder,
                    'DUPLICATED_CLIENT_ID': errors.InvalidOrder,
                    'INVALID_PRICE_PRECISION': errors.OperationRejected,
                    'INVALID_SYMBOL': errors.OperationRejected,
                    'INVALID_TOKEN': errors.OperationRejected,
                    'INVALID_ETHEREUM_ADDRESS': errors.OperationRejected,
                    'INVALID_ETHEREUM_SIGNATURE': errors.OperationRejected,
                    'INVALID_STARKNET_ADDRESS': errors.OperationRejected,
                    'INVALID_STARKNET_SIGNATURE': errors.OperationRejected,
                    'STARKNET_SIGNATURE_VERIFICATION_FAILED': errors.AuthenticationError,
                    'BAD_STARKNET_REQUEST': errors.BadRequest,
                    'ETHEREUM_SIGNER_MISMATCH': errors.BadRequest,
                    'ETHEREUM_HASH_MISMATCH': errors.BadRequest,
                    'NOT_ONBOARDED': errors.BadRequest,
                    'INVALID_TIMESTAMP': errors.BadRequest,
                    'INVALID_SIGNATURE_EXPIRATION': errors.AuthenticationError,
                    'ACCOUNT_NOT_FOUND': errors.AuthenticationError,
                    'INVALID_ORDER_SIGNATURE': errors.AuthenticationError,
                    'PUBLIC_KEY_INVALID': errors.BadRequest,
                    'UNAUTHORIZED_ETHEREUM_ADDRESS': errors.BadRequest,
                    'ETHEREUM_ADDRESS_ALREADY_ONBOARDED': errors.BadRequest,
                    'MARKET_NOT_FOUND': errors.BadRequest,
                    'ALLOWLIST_ENTRY_NOT_FOUND': errors.BadRequest,
                    'USERNAME_IN_USE': errors.AuthenticationError,
                    'GEO_IP_BLOCK': errors.PermissionDenied,
                    'ETHEREUM_ADDRESS_BLOCKED': errors.PermissionDenied,
                    'PROGRAM_NOT_FOUND': errors.BadRequest,
                    'INVALID_DASHBOARD': errors.OperationRejected,
                    'MARKET_NOT_OPEN': errors.BadRequest,
                    'INVALID_REFERRAL_CODE': errors.OperationRejected,
                    'PARENT_ADDRESS_ALREADY_ONBOARDED': errors.BadRequest,
                    'INVALID_PARENT_ACCOUNT': errors.OperationRejected,
                    'INVALID_VAULT_OPERATOR_CHAIN': errors.OperationRejected,
                    'VAULT_OPERATOR_ALREADY_ONBOARDED': errors.OperationRejected,
                    'VAULT_NAME_IN_USE': errors.OperationRejected,
                    'BATCH_SIZE_OUT_OF_RANGE': errors.OperationRejected,
                    'ISOLATED_MARKET_ACCOUNT_MISMATCH': errors.OperationRejected,
                    'POINTS_SUMMARY_NOT_FOUND': errors.OperationRejected,
                    '-32700': errors.BadRequest,
                    '-32600': errors.BadRequest,
                    '-32601': errors.BadRequest,
                    '-32602': errors.BadRequest,
                    '-32603': errors.ExchangeError,
                    '100': errors.BadRequest,
                    '40110': errors.AuthenticationError,
                    '40111': errors.AuthenticationError,
                    '40112': errors.PermissionDenied, // Geo IP blocked
                },
                'broad': {},
            },
            'precisionMode': number.TICK_SIZE,
            'commonCurrencies': {},
            'options': {
                'paradexAccount': undefined,
                'broker': 'CCXT',
            },
        });
    }
    /**
     * @method
     * @name paradex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.api.testnet.paradex.trade/#get-system-time-unix-milliseconds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetSystemTime(params);
        //
        //     {
        //         "server_time": "1681493415023"
        //     }
        //
        return this.safeInteger(response, 'server_time');
    }
    /**
     * @method
     * @name paradex#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.api.testnet.paradex.trade/#get-system-state
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const response = await this.publicGetSystemState(params);
        //
        //     {
        //         "status": "ok"
        //     }
        //
        const status = this.safeString(response, 'status');
        return {
            'status': (status === 'ok') ? 'ok' : 'maintenance',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name paradex#fetchMarkets
     * @description retrieves data on all markets for bitget
     * @see https://docs.api.testnet.paradex.trade/#list-available-markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.publicGetMarkets(params);
        //
        //     {
        //         "results": [
        //             {
        //                 "symbol": "BODEN-USD-PERP",
        //                 "base_currency": "BODEN",
        //                 "quote_currency": "USD",
        //                 "settlement_currency": "USDC",
        //                 "order_size_increment": "1",
        //                 "price_tick_size": "0.00001",
        //                 "min_notional": "200",
        //                 "open_at": 1717065600000,
        //                 "expiry_at": 0,
        //                 "asset_kind": "PERP",
        //                 "position_limit": "2000000",
        //                 "price_bands_width": "0.2",
        //                 "max_open_orders": 50,
        //                 "max_funding_rate": "0.05",
        //                 "delta1_cross_margin_params": {
        //                     "imf_base": "0.2",
        //                     "imf_shift": "180000",
        //                     "imf_factor": "0.00071",
        //                     "mmf_factor": "0.5"
        //                 },
        //                 "price_feed_id": "9LScEHse1ioZt2rUuhwiN6bmYnqpMqvZkQJDNUpxVHN5",
        //                 "oracle_ewma_factor": "0.14999987905913592",
        //                 "max_order_size": "520000",
        //                 "max_funding_rate_change": "0.0005",
        //                 "max_tob_spread": "0.2"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'results');
        return this.parseMarkets(data);
    }
    parseMarket(market) {
        //
        //     {
        //         "symbol": "BODEN-USD-PERP",
        //         "base_currency": "BODEN",
        //         "quote_currency": "USD",
        //         "settlement_currency": "USDC",
        //         "order_size_increment": "1",
        //         "price_tick_size": "0.00001",
        //         "min_notional": "200",
        //         "open_at": 1717065600000,
        //         "expiry_at": 0,
        //         "asset_kind": "PERP",
        //         "position_limit": "2000000",
        //         "price_bands_width": "0.2",
        //         "max_open_orders": 50,
        //         "max_funding_rate": "0.05",
        //         "delta1_cross_margin_params": {
        //             "imf_base": "0.2",
        //             "imf_shift": "180000",
        //             "imf_factor": "0.00071",
        //             "mmf_factor": "0.5"
        //         },
        //         "price_feed_id": "9LScEHse1ioZt2rUuhwiN6bmYnqpMqvZkQJDNUpxVHN5",
        //         "oracle_ewma_factor": "0.14999987905913592",
        //         "max_order_size": "520000",
        //         "max_funding_rate_change": "0.0005",
        //         "max_tob_spread": "0.2"
        //     }
        //
        const marketId = this.safeString(market, 'symbol');
        const quoteId = this.safeString(market, 'quote_currency');
        const baseId = this.safeString(market, 'base_currency');
        const quote = this.safeCurrencyCode(quoteId);
        const base = this.safeCurrencyCode(baseId);
        const settleId = this.safeString(market, 'settlement_currency');
        const settle = this.safeCurrencyCode(settleId);
        const symbol = base + '/' + quote + ':' + settle;
        const expiry = this.safeInteger(market, 'expiry_at');
        const takerFee = this.parseNumber('0.0003');
        const makerFee = this.parseNumber('-0.00005');
        return this.safeMarketStructure({
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': undefined,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeBool(market, 'enableTrading'),
            'contract': true,
            'linear': true,
            'inverse': undefined,
            'taker': takerFee,
            'maker': makerFee,
            'contractSize': this.parseNumber('1'),
            'expiry': (expiry === 0) ? undefined : expiry,
            'expiryDatetime': (expiry === 0) ? undefined : this.iso8601(expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(market, 'order_size_increment'),
                'price': this.safeNumber(market, 'price_tick_size'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': this.safeNumber(market, 'max_order_size'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber(market, 'min_notional'),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }
    /**
     * @method
     * @name paradex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.api.testnet.paradex.trade/#ohlcv-for-a-symbol
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'resolution': this.safeString(this.timeframes, timeframe, timeframe),
            'symbol': market['id'],
        };
        const now = this.milliseconds();
        const duration = this.parseTimeframe(timeframe);
        const until = this.safeInteger2(params, 'until', 'till', now);
        params = this.omit(params, ['until', 'till']);
        if (since !== undefined) {
            request['start_at'] = since;
            if (limit !== undefined) {
                request['end_at'] = this.sum(since, duration * (limit + 1) * 1000) - 1;
            }
            else {
                request['end_at'] = until;
            }
        }
        else {
            request['end_at'] = until;
            if (limit !== undefined) {
                request['start_at'] = until - duration * (limit + 1) * 1000 + 1;
            }
            else {
                request['start_at'] = until - duration * 101 * 1000 + 1;
            }
        }
        const response = await this.publicGetMarketsKlines(this.extend(request, params));
        //
        //     {
        //         "results": [
        //             [
        //                 1720071900000,
        //                 58961.3,
        //                 58961.3,
        //                 58961.3,
        //                 58961.3,
        //                 1591
        //             ]
        //         ]
        //     }
        //
        const data = this.safeList(response, 'results', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         1720071900000,
        //         58961.3,
        //         58961.3,
        //         58961.3,
        //         58961.3,
        //         1591
        //     ]
        //
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 5),
        ];
    }
    /**
     * @method
     * @name paradex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.api.testnet.paradex.trade/#list-available-markets-summary
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {};
        if (symbols !== undefined) {
            if (Array.isArray(symbols)) {
                request['market'] = this.marketId(symbols[0]);
            }
            else {
                request['market'] = this.marketId(symbols);
            }
        }
        else {
            request['market'] = 'ALL';
        }
        const response = await this.publicGetMarketsSummary(this.extend(request, params));
        //
        //     {
        //         "results": [
        //             {
        //                 "symbol": "BTC-USD-PERP",
        //                 "oracle_price": "68465.17449906",
        //                 "mark_price": "68465.17449906",
        //                 "last_traded_price": "68495.1",
        //                 "bid": "68477.6",
        //                 "ask": "69578.2",
        //                 "volume_24h": "5815541.397939004",
        //                 "total_volume": "584031465.525259686",
        //                 "created_at": 1718170156580,
        //                 "underlying_price": "67367.37268422",
        //                 "open_interest": "162.272",
        //                 "funding_rate": "0.01629574927887",
        //                 "price_change_rate_24h": "0.009032"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'results', []);
        return this.parseTickers(data, symbols);
    }
    /**
     * @method
     * @name paradex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.api.testnet.paradex.trade/#list-available-markets-summary
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketsSummary(this.extend(request, params));
        //
        //     {
        //         "results": [
        //             {
        //                 "symbol": "BTC-USD-PERP",
        //                 "oracle_price": "68465.17449906",
        //                 "mark_price": "68465.17449906",
        //                 "last_traded_price": "68495.1",
        //                 "bid": "68477.6",
        //                 "ask": "69578.2",
        //                 "volume_24h": "5815541.397939004",
        //                 "total_volume": "584031465.525259686",
        //                 "created_at": 1718170156580,
        //                 "underlying_price": "67367.37268422",
        //                 "open_interest": "162.272",
        //                 "funding_rate": "0.01629574927887",
        //                 "price_change_rate_24h": "0.009032"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'results', []);
        const ticker = this.safeDict(data, 0, {});
        return this.parseTicker(ticker, market);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "symbol": "BTC-USD-PERP",
        //         "oracle_price": "68465.17449906",
        //         "mark_price": "68465.17449906",
        //         "last_traded_price": "68495.1",
        //         "bid": "68477.6",
        //         "ask": "69578.2",
        //         "volume_24h": "5815541.397939004",
        //         "total_volume": "584031465.525259686",
        //         "created_at": 1718170156580,
        //         "underlying_price": "67367.37268422",
        //         "open_interest": "162.272",
        //         "funding_rate": "0.01629574927887",
        //         "price_change_rate_24h": "0.009032"
        //     }
        //
        let percentage = this.safeString(ticker, 'price_change_rate_24h');
        if (percentage !== undefined) {
            percentage = Precise["default"].stringMul(percentage, '100');
        }
        const last = this.safeString(ticker, 'last_traded_price');
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(ticker, 'created_at');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString(ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString(ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeString(ticker, 'volume_24h'),
            'markPrice': this.safeString(ticker, 'mark_price'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name paradex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.api.testnet.paradex.trade/#get-market-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = { 'market': market['id'] };
        const response = await this.publicGetOrderbookMarket(this.extend(request, params));
        //
        //     {
        //         "market": "BTC-USD-PERP",
        //         "seq_no": 14115975,
        //         "last_updated_at": 1718172538340,
        //         "asks": [
        //             [
        //                 "69578.2",
        //                 "3.019"
        //             ]
        //         ],
        //         "bids": [
        //             [
        //                 "68477.6",
        //                 "0.1"
        //             ]
        //         ]
        //     }
        //
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const timestamp = this.safeInteger(response, 'last_updated_at');
        const orderbook = this.parseOrderBook(response, market['symbol'], timestamp);
        orderbook['nonce'] = this.safeInteger(response, 'seq_no');
        return orderbook;
    }
    /**
     * @method
     * @name paradex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.api.testnet.paradex.trade/#trade-tape
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchTrades', symbol, since, limit, params, 'next', 'cursor', undefined, 100);
        }
        const market = this.market(symbol);
        let request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        if (since !== undefined) {
            request['start_at'] = since;
        }
        [request, params] = this.handleUntilOption('end_at', request, params);
        const response = await this.publicGetTrades(this.extend(request, params));
        //
        //     {
        //         "next": "...",
        //         "prev": "...",
        //         "results": [
        //             {
        //                 "id": "1718154353750201703989430001",
        //                 "market": "BTC-USD-PERP",
        //                 "side": "BUY",
        //                 "size": "0.026",
        //                 "price": "69578.2",
        //                 "created_at": 1718154353750,
        //                 "trade_type": "FILL"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeList(response, 'results', []);
        for (let i = 0; i < trades.length; i++) {
            trades[i]['next'] = this.safeString(response, 'next');
        }
        return this.parseTrades(trades, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id": "1718154353750201703989430001",
        //         "market": "BTC-USD-PERP",
        //         "side": "BUY",
        //         "size": "0.026",
        //         "price": "69578.2",
        //         "created_at": 1718154353750,
        //         "trade_type": "FILL"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "id": "1718947571560201703986670001",
        //         "side": "BUY",
        //         "liquidity": "TAKER",
        //         "market": "BTC-USD-PERP",
        //         "order_id": "1718947571540201703992340000",
        //         "price": "64852.9",
        //         "size": "0.01",
        //         "fee": "0.1945587",
        //         "fee_currency": "USDC",
        //         "created_at": 1718947571569,
        //         "remaining_size": "0",
        //         "client_id": "",
        //         "fill_type": "FILL"
        //     }
        //
        const marketId = this.safeString(trade, 'market');
        market = this.safeMarket(marketId, market);
        const id = this.safeString(trade, 'id');
        const timestamp = this.safeInteger(trade, 'created_at');
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString(trade, 'size');
        const side = this.safeStringLower(trade, 'side');
        const liability = this.safeStringLower(trade, 'liquidity', 'taker');
        const isTaker = liability === 'taker';
        const takerOrMaker = (isTaker) ? 'taker' : 'maker';
        const currencyId = this.safeString(trade, 'fee_currency');
        const code = this.safeCurrencyCode(currencyId);
        return this.safeTrade({
            'info': trade,
            'id': id,
            'order': this.safeString(trade, 'order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': {
                'cost': this.safeString(trade, 'fee'),
                'currency': code,
                'rate': undefined,
            },
        }, market);
    }
    /**
     * @method
     * @name paradex#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://docs.api.testnet.paradex.trade/#list-available-markets-summary
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    async fetchOpenInterest(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketsSummary(this.extend(request, params));
        //
        //     {
        //         "results": [
        //             {
        //                 "symbol": "BTC-USD-PERP",
        //                 "oracle_price": "68465.17449906",
        //                 "mark_price": "68465.17449906",
        //                 "last_traded_price": "68495.1",
        //                 "bid": "68477.6",
        //                 "ask": "69578.2",
        //                 "volume_24h": "5815541.397939004",
        //                 "total_volume": "584031465.525259686",
        //                 "created_at": 1718170156580,
        //                 "underlying_price": "67367.37268422",
        //                 "open_interest": "162.272",
        //                 "funding_rate": "0.01629574927887",
        //                 "price_change_rate_24h": "0.009032"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'results', []);
        const interest = this.safeDict(data, 0, {});
        return this.parseOpenInterest(interest, market);
    }
    parseOpenInterest(interest, market = undefined) {
        //
        //     {
        //         "symbol": "BTC-USD-PERP",
        //         "oracle_price": "68465.17449906",
        //         "mark_price": "68465.17449906",
        //         "last_traded_price": "68495.1",
        //         "bid": "68477.6",
        //         "ask": "69578.2",
        //         "volume_24h": "5815541.397939004",
        //         "total_volume": "584031465.525259686",
        //         "created_at": 1718170156580,
        //         "underlying_price": "67367.37268422",
        //         "open_interest": "162.272",
        //         "funding_rate": "0.01629574927887",
        //         "price_change_rate_24h": "0.009032"
        //     }
        //
        const timestamp = this.safeInteger(interest, 'created_at');
        const marketId = this.safeString(interest, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        return this.safeOpenInterest({
            'symbol': symbol,
            'openInterestAmount': this.safeString(interest, 'open_interest'),
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        }, market);
    }
    hashMessage(message) {
        return '0x' + this.hash(message, sha3.keccak_256, 'hex');
    }
    signHash(hash, privateKey) {
        const signature = crypto.ecdsa(hash.slice(-64), privateKey.slice(-64), secp256k1.secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        const v = this.intToBase16(this.sum(27, signature['v']));
        return '0x' + r.padStart(64, '0') + s.padStart(64, '0') + v;
    }
    signMessage(message, privateKey) {
        return this.signHash(this.hashMessage(message), privateKey.slice(-64));
    }
    async getSystemConfig() {
        const cachedConfig = this.safeDict(this.options, 'systemConfig');
        if (cachedConfig !== undefined) {
            return cachedConfig;
        }
        const response = await this.publicGetSystemConfig();
        //
        // {
        //     "starknet_gateway_url": "https://potc-testnet-sepolia.starknet.io",
        //     "starknet_fullnode_rpc_url": "https://pathfinder.api.testnet.paradex.trade/rpc/v0_7",
        //     "starknet_chain_id": "PRIVATE_SN_POTC_SEPOLIA",
        //     "block_explorer_url": "https://voyager.testnet.paradex.trade/",
        //     "paraclear_address": "0x286003f7c7bfc3f94e8f0af48b48302e7aee2fb13c23b141479ba00832ef2c6",
        //     "paraclear_decimals": 8,
        //     "paraclear_account_proxy_hash": "0x3530cc4759d78042f1b543bf797f5f3d647cde0388c33734cf91b7f7b9314a9",
        //     "paraclear_account_hash": "0x41cb0280ebadaa75f996d8d92c6f265f6d040bb3ba442e5f86a554f1765244e",
        //     "oracle_address": "0x2c6a867917ef858d6b193a0ff9e62b46d0dc760366920d631715d58baeaca1f",
        //     "bridged_tokens": [
        //         {
        //             "name": "TEST USDC",
        //             "symbol": "USDC",
        //             "decimals": 6,
        //             "l1_token_address": "0x29A873159D5e14AcBd63913D4A7E2df04570c666",
        //             "l1_bridge_address": "0x8586e05adc0C35aa11609023d4Ae6075Cb813b4C",
        //             "l2_token_address": "0x6f373b346561036d98ea10fb3e60d2f459c872b1933b50b21fe6ef4fda3b75e",
        //             "l2_bridge_address": "0x46e9237f5408b5f899e72125dd69bd55485a287aaf24663d3ebe00d237fc7ef"
        //         }
        //     ],
        //     "l1_core_contract_address": "0x582CC5d9b509391232cd544cDF9da036e55833Af",
        //     "l1_operator_address": "0x11bACdFbBcd3Febe5e8CEAa75E0Ef6444d9B45FB",
        //     "l1_chain_id": "11155111",
        //     "liquidation_fee": "0.2"
        // }
        //
        this.options['systemConfig'] = response;
        return response;
    }
    async prepareParadexDomain(l1 = false) {
        const systemConfig = await this.getSystemConfig();
        if (l1 === true) {
            return {
                'name': 'Paradex',
                'chainId': systemConfig['l1_chain_id'],
                'version': '1',
            };
        }
        return {
            'name': 'Paradex',
            'chainId': systemConfig['starknet_chain_id'],
            'version': 1,
        };
    }
    async retrieveAccount() {
        const cachedAccount = this.safeDict(this.options, 'paradexAccount');
        if (cachedAccount !== undefined) {
            return cachedAccount;
        }
        this.checkRequiredCredentials();
        const systemConfig = await this.getSystemConfig();
        const domain = await this.prepareParadexDomain(true);
        const messageTypes = {
            'Constant': [
                { 'name': 'action', 'type': 'string' },
            ],
        };
        const message = {
            'action': 'STARK Key',
        };
        const msg = this.ethEncodeStructuredData(domain, messageTypes, message);
        const signature = this.signMessage(msg, this.privateKey);
        const account = this.retrieveStarkAccount(signature, systemConfig['paraclear_account_hash'], systemConfig['paraclear_account_proxy_hash']);
        this.options['paradexAccount'] = account;
        return account;
    }
    async onboarding(params = {}) {
        const account = await this.retrieveAccount();
        const req = {
            'action': 'Onboarding',
        };
        const domain = await this.prepareParadexDomain();
        const messageTypes = {
            'Constant': [
                { 'name': 'action', 'type': 'felt' },
            ],
        };
        const msg = this.starknetEncodeStructuredData(domain, messageTypes, req, account['address']);
        const signature = this.starknetSign(msg, account['privateKey']);
        params['signature'] = signature;
        params['account'] = account['address'];
        params['public_key'] = account['publicKey'];
        const response = await this.privatePostOnboarding(params);
        return response;
    }
    async authenticateRest(params = {}) {
        const cachedToken = this.safeString(this.options, 'authToken');
        const now = this.nonce();
        if (cachedToken !== undefined) {
            const cachedExpires = this.safeInteger(this.options, 'expires');
            if (now < cachedExpires) {
                return cachedToken;
            }
        }
        const account = await this.retrieveAccount();
        const expires = now + 86400 * 7;
        const req = {
            'method': 'POST',
            'path': '/v1/auth',
            'body': '',
            'timestamp': now,
            'expiration': expires,
        };
        const domain = await this.prepareParadexDomain();
        const messageTypes = {
            'Request': [
                { 'name': 'method', 'type': 'felt' },
                { 'name': 'path', 'type': 'felt' },
                { 'name': 'body', 'type': 'felt' },
                { 'name': 'timestamp', 'type': 'felt' },
                { 'name': 'expiration', 'type': 'felt' },
            ],
        };
        const msg = this.starknetEncodeStructuredData(domain, messageTypes, req, account['address']);
        const signature = this.starknetSign(msg, account['privateKey']);
        params['signature'] = signature;
        params['account'] = account['address'];
        params['timestamp'] = req['timestamp'];
        params['expiration'] = req['expiration'];
        const response = await this.privatePostAuth(params);
        //
        // {
        //     jwt_token: "ooooccxtooootoooootheoooomoonooooo"
        // }
        //
        const token = this.safeString(response, 'jwt_token');
        this.options['authToken'] = token;
        this.options['expires'] = expires;
        return token;
    }
    parseOrder(order, market = undefined) {
        //
        // {
        //     "account": "0x4638e3041366aa71720be63e32e53e1223316c7f0d56f7aa617542ed1e7512x",
        //     "avg_fill_price": "26000",
        //     "client_id": "x1234",
        //     "cancel_reason": "NOT_ENOUGH_MARGIN",
        //     "created_at": 1681493746016,
        //     "flags": [
        //         "REDUCE_ONLY"
        //     ],
        //     "id": "123456",
        //     "instruction": "GTC",
        //     "last_updated_at": 1681493746016,
        //     "market": "BTC-USD-PERP",
        //     "price": "26000",
        //     "published_at": 1681493746016,
        //     "received_at": 1681493746016,
        //     "remaining_size": "0",
        //     "seq_no": 1681471234972000000,
        //     "side": "BUY",
        //     "size": "0.05",
        //     "status": "NEW",
        //     "stp": "EXPIRE_MAKER",
        //     "timestamp": 1681493746016,
        //     "trigger_price": "26000",
        //     "type": "MARKET"
        // }
        //
        const timestamp = this.safeInteger(order, 'created_at');
        const orderId = this.safeString(order, 'id');
        const clientOrderId = this.omitZero(this.safeString(order, 'client_id'));
        const marketId = this.safeString(order, 'market');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString(order, 'price');
        const amount = this.safeString(order, 'size');
        const orderType = this.safeString(order, 'type');
        const status = this.safeString(order, 'status');
        const side = this.safeStringLower(order, 'side');
        const average = this.omitZero(this.safeString(order, 'avg_fill_price'));
        const remaining = this.omitZero(this.safeString(order, 'remaining_size'));
        const lastUpdateTimestamp = this.safeInteger(order, 'last_updated_at');
        return this.safeOrder({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': this.parseOrderStatus(status),
            'symbol': symbol,
            'type': this.parseOrderType(orderType),
            'timeInForce': this.parseTimeInForce(this.safeString(order, 'instrunction')),
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': this.safeString(order, 'trigger_price'),
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'average': average,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'cost': undefined,
            'trades': undefined,
            'fee': {
                'cost': undefined,
                'currency': undefined,
            },
            'info': order,
        }, market);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'IOC': 'IOC',
            'GTC': 'GTC',
            'POST_ONLY': 'PO',
        };
        return this.safeString(timeInForces, timeInForce, undefined);
    }
    parseOrderStatus(status) {
        if (status !== undefined) {
            const statuses = {
                'NEW': 'open',
                'UNTRIGGERED': 'open',
                'OPEN': 'open',
                'CLOSED': 'closed',
            };
            return this.safeString(statuses, status, status);
        }
        return status;
    }
    parseOrderType(type) {
        const types = {
            'LIMIT': 'limit',
            'MARKET': 'market',
            'STOP_LIMIT': 'limit',
            'STOP_MARKET': 'market',
        };
        return this.safeStringLower(types, type, type);
    }
    convertShortString(str) {
        // TODO: add stringToBase16 in exchange
        return '0x' + this.binaryToBase16(this.base64ToBinary(this.stringToBase64(str)));
    }
    scaleNumber(num) {
        return Precise["default"].stringMul(num, '100000000');
    }
    /**
     * @method
     * @name paradex#createOrder
     * @description create a trade order
     * @see https://docs.api.prod.paradex.trade/#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopPrice] alias for triggerPrice
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {string} [params.timeInForce] "GTC", "IOC", or "POST_ONLY"
     * @param {bool} [params.postOnly] true or false
     * @param {bool} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        const market = this.market(symbol);
        const reduceOnly = this.safeBool2(params, 'reduceOnly', 'reduce_only');
        const orderType = type.toUpperCase();
        const orderSide = side.toUpperCase();
        const request = {
            'market': market['id'],
            'side': orderSide,
            'type': orderType,
            'size': this.amountToPrecision(symbol, amount),
        };
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const isMarket = orderType === 'MARKET';
        const timeInForce = this.safeStringUpper(params, 'timeInForce');
        const postOnly = this.isPostOnly(isMarket, undefined, params);
        if (!isMarket) {
            if (postOnly) {
                request['instruction'] = 'POST_ONLY';
            }
            else if (timeInForce === 'ioc') {
                request['instruction'] = 'IOC';
            }
        }
        if (reduceOnly) {
            request['flags'] = [
                'REDUCE_ONLY',
            ];
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const clientOrderId = this.safeStringN(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
        }
        if (triggerPrice !== undefined) {
            if (isMarket) {
                request['type'] = 'STOP_MARKET';
            }
            else {
                request['type'] = 'STOP_LIMIT';
            }
            request['trigger_price'] = this.priceToPrecision(symbol, triggerPrice);
        }
        params = this.omit(params, ['reduceOnly', 'reduce_only', 'clOrdID', 'clientOrderId', 'client_order_id', 'postOnly', 'timeInForce', 'stopPrice', 'triggerPrice']);
        const account = await this.retrieveAccount();
        const now = this.nonce();
        const orderReq = {
            'timestamp': now * 1000,
            'market': this.convertShortString(request['market']),
            'side': (orderSide === 'BUY') ? '1' : '2',
            'orderType': this.convertShortString(request['type']),
            'size': this.scaleNumber(request['size']),
            'price': (isMarket) ? '0' : this.scaleNumber(request['price']),
        };
        const domain = await this.prepareParadexDomain();
        const messageTypes = {
            'Order': [
                { 'name': 'timestamp', 'type': 'felt' },
                { 'name': 'market', 'type': 'felt' },
                { 'name': 'side', 'type': 'felt' },
                { 'name': 'orderType', 'type': 'felt' },
                { 'name': 'size', 'type': 'felt' },
                { 'name': 'price', 'type': 'felt' },
            ],
        };
        const msg = this.starknetEncodeStructuredData(domain, messageTypes, orderReq, account['address']);
        const signature = this.starknetSign(msg, account['privateKey']);
        request['signature'] = signature;
        request['signature_timestamp'] = orderReq['timestamp'];
        const response = await this.privatePostOrders(this.extend(request, params));
        //
        // {
        //     "account": "0x4638e3041366aa71720be63e32e53e1223316c7f0d56f7aa617542ed1e7512x",
        //     "avg_fill_price": "26000",
        //     "cancel_reason": "NOT_ENOUGH_MARGIN",
        //     "client_id": "x1234",
        //     "created_at": 1681493746016,
        //     "flags": [
        //       "REDUCE_ONLY"
        //     ],
        //     "id": "123456",
        //     "instruction": "GTC",
        //     "last_updated_at": 1681493746016,
        //     "market": "BTC-USD-PERP",
        //     "price": "26000",
        //     "published_at": 1681493746016,
        //     "received_at": 1681493746016,
        //     "remaining_size": "0",
        //     "seq_no": 1681471234972000000,
        //     "side": "BUY",
        //     "size": "0.05",
        //     "status": "NEW",
        //     "stp": "EXPIRE_MAKER",
        //     "timestamp": 1681493746016,
        //     "trigger_price": "26000",
        //     "type": "MARKET"
        // }
        //
        const order = this.parseOrder(response, market);
        return order;
    }
    /**
     * @method
     * @name paradex#cancelOrder
     * @description cancels an open order
     * @see https://docs.api.prod.paradex.trade/#cancel-order
     * @see https://docs.api.prod.paradex.trade/#cancel-open-order-by-client-order-id
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        const request = {};
        const clientOrderId = this.safeStringN(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        let response = undefined;
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
            response = await this.privateDeleteOrdersByClientIdClientId(this.extend(request, params));
        }
        else {
            request['order_id'] = id;
            response = await this.privateDeleteOrdersOrderId(this.extend(request, params));
        }
        //
        // if success, no response...
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name paradex#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://docs.api.prod.paradex.trade/#cancel-all-open-orders
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.authenticateRest();
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.privateDeleteOrders(this.extend(request, params));
        //
        // if success, no response...
        //
        return response;
    }
    /**
     * @method
     * @name paradex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.api.prod.paradex.trade/#get-order
     * @see https://docs.api.prod.paradex.trade/#get-order-by-client-id
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        const request = {};
        const clientOrderId = this.safeStringN(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        params = this.omit(params, ['clOrdID', 'clientOrderId', 'client_order_id']);
        let response = undefined;
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
            response = await this.privateGetOrdersByClientIdClientId(this.extend(request, params));
        }
        else {
            request['order_id'] = id;
            response = await this.privateGetOrdersOrderId(this.extend(request, params));
        }
        //
        //     {
        //         "id": "1718941725080201704028870000",
        //         "account": "0x49ddd7a564c978f6e4089ff8355b56a42b7e2d48ba282cb5aad60f04bea0ec3",
        //         "market": "BTC-USD-PERP",
        //         "side": "SELL",
        //         "type": "LIMIT",
        //         "size": "10.153",
        //         "remaining_size": "10.153",
        //         "price": "70784.5",
        //         "status": "CLOSED",
        //         "created_at": 1718941725082,
        //         "last_updated_at": 1718958002991,
        //         "timestamp": 1718941724678,
        //         "cancel_reason": "USER_CANCELED",
        //         "client_id": "",
        //         "seq_no": 1718958002991595738,
        //         "instruction": "GTC",
        //         "avg_fill_price": "",
        //         "stp": "EXPIRE_TAKER",
        //         "received_at": 1718958510959,
        //         "published_at": 1718958510960,
        //         "flags": [],
        //         "trigger_price": "0"
        //     }
        //
        return this.parseOrder(response);
    }
    /**
     * @method
     * @name paradex#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.api.prod.paradex.trade/#get-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @param {int} params.until timestamp in ms of the latest order to fetch
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchOrders', symbol, since, limit, params, 'next', 'cursor', undefined, 50);
        }
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['start_at'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        [request, params] = this.handleUntilOption('end_at', request, params);
        const response = await this.privateGetOrdersHistory(this.extend(request, params));
        //
        // {
        //     "next": "eyJmaWx0ZXIiMsIm1hcmtlciI6eyJtYXJrZXIiOiIxNjc1NjUwMDE3NDMxMTAxNjk5N=",
        //     "prev": "eyJmaWx0ZXIiOnsiTGltaXQiOjkwfSwidGltZSI6MTY4MTY3OTgzNzk3MTMwOTk1MywibWFya2VyIjp7Im1zMjExMD==",
        //     "results": [
        //       {
        //         "account": "0x4638e3041366aa71720be63e32e53e1223316c7f0d56f7aa617542ed1e7512x",
        //         "avg_fill_price": "26000",
        //         "cancel_reason": "NOT_ENOUGH_MARGIN",
        //         "client_id": "x1234",
        //         "created_at": 1681493746016,
        //         "flags": [
        //           "REDUCE_ONLY"
        //         ],
        //         "id": "123456",
        //         "instruction": "GTC",
        //         "last_updated_at": 1681493746016,
        //         "market": "BTC-USD-PERP",
        //         "price": "26000",
        //         "published_at": 1681493746016,
        //         "received_at": 1681493746016,
        //         "remaining_size": "0",
        //         "seq_no": 1681471234972000000,
        //         "side": "BUY",
        //         "size": "0.05",
        //         "status": "NEW",
        //         "stp": "EXPIRE_MAKER",
        //         "timestamp": 1681493746016,
        //         "trigger_price": "26000",
        //         "type": "MARKET"
        //       }
        //     ]
        //   }
        //
        const orders = this.safeList(response, 'results', []);
        const paginationCursor = this.safeString(response, 'next');
        const ordersLength = orders.length;
        if ((paginationCursor !== undefined) && (ordersLength > 0)) {
            const first = orders[0];
            first['next'] = paginationCursor;
            orders[0] = first;
        }
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name paradex#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.api.prod.paradex.trade/#paradex-rest-api-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOrders(this.extend(request, params));
        //
        //  {
        //     "results": [
        //       {
        //         "account": "0x4638e3041366aa71720be63e32e53e1223316c7f0d56f7aa617542ed1e7512x",
        //         "avg_fill_price": "26000",
        //         "client_id": "x1234",
        //         "cancel_reason": "NOT_ENOUGH_MARGIN",
        //         "created_at": 1681493746016,
        //         "flags": [
        //           "REDUCE_ONLY"
        //         ],
        //         "id": "123456",
        //         "instruction": "GTC",
        //         "last_updated_at": 1681493746016,
        //         "market": "BTC-USD-PERP",
        //         "price": "26000",
        //         "published_at": 1681493746016,
        //         "received_at": 1681493746016,
        //         "remaining_size": "0",
        //         "seq_no": 1681471234972000000,
        //         "side": "BUY",
        //         "size": "0.05",
        //         "status": "NEW",
        //         "stp": "EXPIRE_MAKER",
        //         "timestamp": 1681493746016,
        //         "trigger_price": "26000",
        //         "type": "MARKET"
        //       }
        //     ]
        //   }
        //
        const orders = this.safeList(response, 'results', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name paradex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.api.prod.paradex.trade/#list-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        const response = await this.privateGetBalance();
        //
        //     {
        //         "results": [
        //             {
        //                 "token": "USDC",
        //                 "size": "99980.2382266290601",
        //                 "last_updated_at": 1718529757240
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'results', []);
        return this.parseBalance(data);
    }
    parseBalance(response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = this.safeDict(response, i, {});
            const currencyId = this.safeString(balance, 'token');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['total'] = this.safeString(balance, 'size');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name paradex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.api.prod.paradex.trade/#list-fills
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchMyTrades', symbol, since, limit, params, 'next', 'cursor', undefined, 100);
        }
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        if (since !== undefined) {
            request['start_at'] = since;
        }
        [request, params] = this.handleUntilOption('end_at', request, params);
        const response = await this.privateGetFills(this.extend(request, params));
        //
        //     {
        //         "next": null,
        //         "prev": null,
        //         "results": [
        //             {
        //                 "id": "1718947571560201703986670001",
        //                 "side": "BUY",
        //                 "liquidity": "TAKER",
        //                 "market": "BTC-USD-PERP",
        //                 "order_id": "1718947571540201703992340000",
        //                 "price": "64852.9",
        //                 "size": "0.01",
        //                 "fee": "0.1945587",
        //                 "fee_currency": "USDC",
        //                 "created_at": 1718947571569,
        //                 "remaining_size": "0",
        //                 "client_id": "",
        //                 "fill_type": "FILL"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeList(response, 'results', []);
        for (let i = 0; i < trades.length; i++) {
            trades[i]['next'] = this.safeString(response, 'next');
        }
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name paradex#fetchPositions
     * @description fetch data on an open position
     * @see https://docs.api.prod.paradex.trade/#list-open-positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        const market = this.market(symbol);
        const positions = await this.fetchPositions([market['symbol']], params);
        return this.safeDict(positions, 0, {});
    }
    /**
     * @method
     * @name paradex#fetchPositions
     * @description fetch all open positions
     * @see https://docs.api.prod.paradex.trade/#list-open-positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.privateGetPositions();
        //
        //     {
        //         "results": [
        //             {
        //                 "id": "0x49ddd7a564c978f6e4089ff8355b56a42b7e2d48ba282cb5aad60f04bea0ec3-BTC-USD-PERP",
        //                 "market": "BTC-USD-PERP",
        //                 "status": "OPEN",
        //                 "side": "LONG",
        //                 "size": "0.01",
        //                 "average_entry_price": "64839.96053748",
        //                 "average_entry_price_usd": "64852.9",
        //                 "realized_pnl": "0",
        //                 "unrealized_pnl": "-2.39677214",
        //                 "unrealized_funding_pnl": "-0.11214013",
        //                 "cost": "648.39960537",
        //                 "cost_usd": "648.529",
        //                 "cached_funding_index": "35202.1002351",
        //                 "last_updated_at": 1718950074249,
        //                 "last_fill_id": "1718947571560201703986670001",
        //                 "seq_no": 1718950074249176253,
        //                 "liquidation_price": ""
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'results', []);
        return this.parsePositions(data, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "id": "0x49ddd7a564c978f6e4089ff8355b56a42b7e2d48ba282cb5aad60f04bea0ec3-BTC-USD-PERP",
        //         "market": "BTC-USD-PERP",
        //         "status": "OPEN",
        //         "side": "LONG",
        //         "size": "0.01",
        //         "average_entry_price": "64839.96053748",
        //         "average_entry_price_usd": "64852.9",
        //         "realized_pnl": "0",
        //         "unrealized_pnl": "-2.39677214",
        //         "unrealized_funding_pnl": "-0.11214013",
        //         "cost": "648.39960537",
        //         "cost_usd": "648.529",
        //         "cached_funding_index": "35202.1002351",
        //         "last_updated_at": 1718950074249,
        //         "last_fill_id": "1718947571560201703986670001",
        //         "seq_no": 1718950074249176253,
        //         "liquidation_price": ""
        //     }
        //
        const marketId = this.safeString(position, 'market');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const side = this.safeStringLower(position, 'side');
        let quantity = this.safeString(position, 'size');
        if (side !== 'long') {
            quantity = Precise["default"].stringMul('-1', quantity);
        }
        const timestamp = this.safeInteger(position, 'time');
        return this.safePosition({
            'info': position,
            'id': this.safeString(position, 'id'),
            'symbol': symbol,
            'entryPrice': this.safeString(position, 'average_entry_price'),
            'markPrice': undefined,
            'notional': undefined,
            'collateral': this.safeString(position, 'cost'),
            'unrealizedPnl': this.safeString(position, 'unrealized_pnl'),
            'side': side,
            'contracts': this.parseNumber(quantity),
            'contractSize': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }
    /**
     * @method
     * @name paradex#fetchLiquidations
     * @description retrieves the public liquidations of a trading pair
     * @see https://docs.api.prod.paradex.trade/#list-liquidations
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the huobi api endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    async fetchLiquidations(symbol, since = undefined, limit = undefined, params = {}) {
        await this.authenticateRest();
        let request = {};
        if (since !== undefined) {
            request['from'] = since;
        }
        else {
            request['from'] = 1;
        }
        const market = this.market(symbol);
        [request, params] = this.handleUntilOption('to', request, params);
        const response = await this.privateGetLiquidations(this.extend(request, params));
        //
        //     {
        //         "results": [
        //             {
        //                 "created_at": 1697213130097,
        //                 "id": "0x123456789"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'results', []);
        return this.parseLiquidations(data, market, since, limit);
    }
    parseLiquidation(liquidation, market = undefined) {
        //
        //     {
        //         "created_at": 1697213130097,
        //         "id": "0x123456789"
        //     }
        //
        const timestamp = this.safeInteger(liquidation, 'created_at');
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': undefined,
            'contracts': undefined,
            'contractSize': undefined,
            'price': undefined,
            'baseValue': undefined,
            'quoteValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    /**
     * @method
     * @name paradex#fetchTransfers
     * @description fetch all deposits made to an account
     * @see https://docs.api.prod.paradex.trade/#paradex-rest-api-transfers
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchDeposits', code, since, limit, params, 'next', 'cursor', undefined, 100);
        }
        let request = {};
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        if (since !== undefined) {
            request['start_at'] = since;
        }
        [request, params] = this.handleUntilOption('end_at', request, params);
        const response = await this.privateGetTransfers(this.extend(request, params));
        //
        //     {
        //         "next": null,
        //         "prev": null,
        //         "results": [
        //             {
        //                 "id": "1718940471200201703989430000",
        //                 "account": "0x49ddd7a564c978f6e4089ff8355b56a42b7e2d48ba282cb5aad60f04bea0ec3",
        //                 "kind": "DEPOSIT",
        //                 "status": "COMPLETED",
        //                 "amount": "100000",
        //                 "token": "USDC",
        //                 "created_at": 1718940471208,
        //                 "last_updated_at": 1718941455546,
        //                 "txn_hash": "0x73a415ca558a97bbdcd1c43e52b45f1e0486a0a84b3bb4958035ad6c59cb866",
        //                 "external_txn_hash": "",
        //                 "socialized_loss_factor": ""
        //             }
        //         ]
        //     }
        //
        const rows = this.safeList(response, 'results', []);
        const deposits = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row['kind'] === 'DEPOSIT') {
                deposits.push(row);
            }
        }
        return this.parseTransactions(deposits, undefined, since, limit);
    }
    /**
     * @method
     * @name paradex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.api.prod.paradex.trade/#paradex-rest-api-transfers
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch withdrawals for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.authenticateRest();
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchWithdrawals', code, since, limit, params, 'next', 'cursor', undefined, 100);
        }
        let request = {};
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        if (since !== undefined) {
            request['start_at'] = since;
        }
        [request, params] = this.handleUntilOption('end_at', request, params);
        const response = await this.privateGetTransfers(this.extend(request, params));
        //
        //     {
        //         "next": null,
        //         "prev": null,
        //         "results": [
        //             {
        //                 "id": "1718940471200201703989430000",
        //                 "account": "0x49ddd7a564c978f6e4089ff8355b56a42b7e2d48ba282cb5aad60f04bea0ec3",
        //                 "kind": "DEPOSIT",
        //                 "status": "COMPLETED",
        //                 "amount": "100000",
        //                 "token": "USDC",
        //                 "created_at": 1718940471208,
        //                 "last_updated_at": 1718941455546,
        //                 "txn_hash": "0x73a415ca558a97bbdcd1c43e52b45f1e0486a0a84b3bb4958035ad6c59cb866",
        //                 "external_txn_hash": "",
        //                 "socialized_loss_factor": ""
        //             }
        //         ]
        //     }
        //
        const rows = this.safeList(response, 'results', []);
        const deposits = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row['kind'] === 'WITHDRAWAL') {
                deposits.push(row);
            }
        }
        return this.parseTransactions(deposits, undefined, since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits & fetchWithdrawals
        //
        //     {
        //         "id": "1718940471200201703989430000",
        //         "account": "0x49ddd7a564c978f6e4089ff8355b56a42b7e2d48ba282cb5aad60f04bea0ec3",
        //         "kind": "DEPOSIT",
        //         "status": "COMPLETED",
        //         "amount": "100000",
        //         "token": "USDC",
        //         "created_at": 1718940471208,
        //         "last_updated_at": 1718941455546,
        //         "txn_hash": "0x73a415ca558a97bbdcd1c43e52b45f1e0486a0a84b3bb4958035ad6c59cb866",
        //         "external_txn_hash": "",
        //         "socialized_loss_factor": ""
        //     }
        //
        const id = this.safeString(transaction, 'id');
        const address = this.safeString(transaction, 'account');
        const txid = this.safeString(transaction, 'txn_hash');
        const currencyId = this.safeString(transaction, 'token');
        const code = this.safeCurrencyCode(currencyId, currency);
        const timestamp = this.safeInteger(transaction, 'created_at');
        const updated = this.safeInteger(transaction, 'last_updated_at');
        let type = this.safeString(transaction, 'kind');
        type = (type === 'DEPOSIT') ? 'deposit' : 'withdrawal';
        const status = this.parseTransactionStatus(this.safeString(transaction, 'status'));
        const amount = this.safeNumber(transaction, 'amount');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': undefined,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'internal': undefined,
            'comment': undefined,
            'fee': undefined,
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'PENDING': 'pending',
            'AVAILABLE': 'pending',
            'COMPLETED': 'ok',
            'FAILED': 'failed',
        };
        return this.safeString(statuses, status, status);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname(this.urls['api'][this.version]) + '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        if (api === 'public') {
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        else if (api === 'private') {
            headers = {
                'Accept': 'application/json',
                'PARADEX-PARTNER': this.safeString(this.options, 'broker', 'CCXT'),
            };
            // TODO: optimize
            if (path === 'auth') {
                headers['PARADEX-STARKNET-ACCOUNT'] = query['account'];
                headers['PARADEX-STARKNET-SIGNATURE'] = query['signature'];
                headers['PARADEX-TIMESTAMP'] = query['timestamp'].toString();
                headers['PARADEX-SIGNATURE-EXPIRATION'] = query['expiration'].toString();
            }
            else if (path === 'onboarding') {
                headers['PARADEX-ETHEREUM-ACCOUNT'] = this.walletAddress;
                headers['PARADEX-STARKNET-ACCOUNT'] = query['account'];
                headers['PARADEX-STARKNET-SIGNATURE'] = query['signature'];
                headers['PARADEX-TIMESTAMP'] = this.nonce().toString();
                headers['Content-Type'] = 'application/json';
                body = this.json({
                    'public_key': query['public_key'],
                });
            }
            else {
                const token = this.options['authToken'];
                headers['Authorization'] = 'Bearer ' + token;
                if (method === 'POST') {
                    headers['Content-Type'] = 'application/json';
                    body = this.json(query);
                }
                else {
                    url = url + '?' + this.urlencode(query);
                }
            }
            // headers = {
            //     'Accept': 'application/json',
            //     'Authorization': 'Bearer ' + this.apiKey,
            // };
            // if (method === 'POST') {
            //     body = this.json (query);
            //     headers['Content-Type'] = 'application/json';
            // } else {
            //     if (Object.keys (query).length) {
            //         url += '?' + this.urlencode (query);
            //     }
            // }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "data": null,
        //         "error": "NOT_ONBOARDED",
        //         "message": "User has never called /onboarding endpoint"
        //     }
        //
        const errorCode = this.safeString(response, 'error');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

module.exports = paradex;
