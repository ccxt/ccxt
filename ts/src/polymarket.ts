
//  ---------------------------------------------------------------------------

import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import Exchange from './abstract/polymarket.js';
import { ExchangeError, AuthenticationError, BadRequest, BadSymbol, RateLimitExceeded, ExchangeNotAvailable, ArgumentsRequired, InsufficientFunds, InvalidOrder, OrderNotFound, NotSupported, OperationFailed, OnMaintenance, RequestTimeout, InvalidNonce } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { ecdsa } from './base/functions/crypto.js';
import { Precise } from './base/Precise.js';
import type { Dict, Int, Str, Strings, Num, Market, Currencies, Currency, NullableDict, Ticker, Tickers, OrderBook, Trade, OHLCV, FundingRate, FundingRates, FundingRateHistory, OpenInterest, OpenInterests, TradingFees, Status, List, Endpoint, int, Order, OrderType, OrderSide, OrderRequest, Balances, Position, Transaction, FundingHistory, Leverage, MarginMode, MarginModification } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class polymarket
 * @description Polymarket perpetual futures - a hybrid dex with an off-chain order book and on-chain settlement of collateral. The venue trades linear perpetual contracts on crypto, indices, equities and commodities, quoted using USD and collateralized exclusively with pUSD. The prediction-market CLOB is a separate product, integrated separately under ccxt.prediction.polymarket
 * @augments Exchange
 */
export default class polymarket extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'polymarket',
            'name': 'Polymarket',
            'countries': [ 'US' ],
            'version': 'v1',
            // 1000 weighted tokens per minute per IP -> 60ms per weight unit
            'rateLimit': 60,
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
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createOrder': true,
                'createOrders': true,
                'createReduceOnlyOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchLedger': false,
                'fetchLeverage': true,
                'fetchMarginMode': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterests': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'sandbox': false,
                'setLeverage': true,
                'setMarginMode': true,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1s': '1s',
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/89e1a2c4-a682-44e7-ad50-9fb15b534437',
                'api': {
                    'public': 'https://api.perpetuals.polymarket.com/v1',
                    'private': 'https://api.perpetuals.polymarket.com/v1',
                    'trade': 'https://api.perpetuals.polymarket.com/v1',
                },
                'www': 'https://polymarket.com/perps',
                'doc': [
                    'https://docs.polymarket.com/perps/overview',
                    'https://docs.polymarket.com/api-reference/perps/overview',
                ],
                'fees': 'https://docs.polymarket.com/perps/learn-about-trading/fees',
            },
            'api': {
                'public': {
                    'get': {
                        'info/ping': { 'cost': 1 } as Endpoint<Dict>,
                        'info/time': { 'cost': 1 } as Endpoint<Dict>,
                        'info/exchange': { 'cost': 2 } as Endpoint<Dict>,
                        'info/assets': { 'cost': 2 } as Endpoint<List>,
                        'info/instruments': { 'cost': 2 } as Endpoint<List>,
                        'info/tickers': { 'cost': 2 } as Endpoint<List>,
                        'info/statistics': { 'cost': 2 } as Endpoint<List>,
                        'info/klines': { 'cost': 5 } as Endpoint<Dict>,
                        'info/mark-history': { 'cost': 5 } as Endpoint<Dict>,
                        'info/bbo': { 'cost': 2 } as Endpoint<List>,
                        'info/book': { 'cost': 5 } as Endpoint<Dict>,
                        'info/index': { 'cost': 2 } as Endpoint<Dict>,
                        'info/trades': { 'cost': 10 } as Endpoint<Dict>,
                        'info/portfolio': { 'cost': 5 } as Endpoint<Dict>,
                        'info/position-fills': { 'cost': 10 } as Endpoint<Dict>,
                        'info/funding': { 'cost': 10 } as Endpoint<Dict>,
                        'info/fees': { 'cost': 2 } as Endpoint<Dict>,
                        'info/limit-tiers': { 'cost': 2 } as Endpoint<List>,
                        'info/invite': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'private': {
                    'get': {
                        'account/credentials': { 'cost': 2 } as Endpoint<Dict>,
                        'account/orders': { 'cost': 10 } as Endpoint<List>,
                        'account/open-orders': { 'cost': 20 } as Endpoint<List>,
                        'account/balances': { 'cost': 2 } as Endpoint<List>,
                        'account/portfolio': { 'cost': 2 } as Endpoint<Dict>,
                        'account/fills': { 'cost': 10 } as Endpoint<Dict>,
                        'account/equity': { 'cost': 10 } as Endpoint<Dict>,
                        'account/pnl': { 'cost': 10 } as Endpoint<Dict>,
                        'account/funding': { 'cost': 10 } as Endpoint<Dict>,
                        'account/deposits': { 'cost': 10 } as Endpoint<Dict>,
                        'account/withdrawals': { 'cost': 10 } as Endpoint<Dict>,
                        'account/config': { 'cost': 2 } as Endpoint<List>,
                        'account/limits': { 'cost': 1 } as Endpoint<Dict>,
                        'account/auto-cancel': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
                'trade': {
                    'post': {
                        'trade/orders': { 'cost': 1 } as Endpoint<List>,
                        'account/proxy': { 'cost': 1 } as Endpoint<Dict>,
                        'account/withdraw': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'patch': {
                        'trade/orders': { 'cost': 1 } as Endpoint<List>,
                        'trade/orders-coid': { 'cost': 1 } as Endpoint<List>,
                        'trade/leverage': { 'cost': 1 } as Endpoint<Dict>,
                        'trade/margin': { 'cost': 1 } as Endpoint<Dict>,
                        'trade/auto-cancel': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'trade/orders': { 'cost': 1 } as Endpoint<List>,
                        'trade/orders-coid': { 'cost': 1 } as Endpoint<List>,
                        'trade/orders/all': { 'cost': 1 } as Endpoint<Dict>,
                        'account/proxy': { 'cost': 1 } as Endpoint<Dict>,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                // the account address derives from the private key, so a
                // wallet address never needs to be supplied separately
                'walletAddress': false,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    // tier-0 rates from GET /v1/info/fees, shared by every category
                    'taker': this.parseNumber ('0.0004'),
                    'maker': this.parseNumber ('0.000125'),
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'chainId': 137,
                // the session credentials issued by POST /v1/account/proxy - a
                // dict of proxy, privateKey, secret and expires - users can
                // persist a session across processes by supplying it here
                'proxyCredentials': undefined,
                // requested proxy session lifetime, one week by default
                'proxyExpiry': 604800000,
                // re-provision this long before the session expires
                'proxyRefreshMargin': 3600000,
            },
            'exceptions': {
                'exact': {
                    'unauthorized': AuthenticationError,
                    'ip_rate_limited': RateLimitExceeded,
                    'action_rate_limited': RateLimitExceeded,
                    'message_rate_limited': RateLimitExceeded,
                    'service_unavailable': ExchangeNotAvailable,
                    'insufficient_margin': InsufficientFunds,
                    'insufficient_balance': InsufficientFunds,
                    'order_not_found': OrderNotFound,
                    'order_not_in_orderbook': OrderNotFound,
                    'reduce_only_invalid': InvalidOrder,
                    'price_outside_bounds': InvalidOrder,
                    'position_not_found': BadRequest,
                    'invalid_margin_mode': BadRequest,
                    'invalid_margin_amount': BadRequest,
                    // resting-order capacity cap, waiting does not help
                    'open_orders_limit': InvalidOrder,
                    'margin_below_required_initial': InsufficientFunds,
                    'account_liquidating': InvalidOrder,
                    'invalid_margin_signature_timestamp': InvalidNonce,
                    'signature_already_used': InvalidNonce,
                    'order_already_terminal': OrderNotFound,
                    'order_unknown': OrderNotFound,
                    'order_in_flight': OperationFailed,
                    'order_not_pending_risk': OperationFailed,
                    'order_not_pending_engine': OperationFailed,
                    'order_not_modifiable': InvalidOrder,
                    'order_has_tpsl': InvalidOrder,
                    'modify_already_pending': OperationFailed,
                    'modify_no_op': InvalidOrder,
                    'modify_limit_reached': InvalidOrder,
                    'modify_would_cross': InvalidOrder,
                    'modify_quantity_not_above_filled': InvalidOrder,
                    'duplicate_order_in_batch': InvalidOrder,
                    'invalid_command': InvalidOrder,
                    'auto_cancel_deadline_too_soon': BadRequest,
                    'auto_cancel_daily_limit_reached': RateLimitExceeded,
                    'auto_cancel_in_flight': OperationFailed,
                    'cancel_only_mode': OnMaintenance,
                    'blp_leverage_locked': BadRequest,
                    'request_body_timeout': RequestTimeout,
                    'payload_too_large': BadRequest,
                    // internal_error stays unmapped on purpose, the http 500
                    // fall-through classifies it retryable
                    'not_found': NotSupported,
                },
                'broad': {
                    'invalid query parameters': BadRequest,
                    'invalid path parameters': BadRequest,
                    'invalid instrument': BadRequest,
                    'invalid signature': AuthenticationError,
                    'signature expired': AuthenticationError,
                    'account not found for proxy': AuthenticationError,
                    'command expired': InvalidOrder,
                    'command expiry too far in future': InvalidOrder,
                },
            },
            'features': {
                'spot': undefined,
                'forPerps': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerDirection': false,
                        'triggerPriceType': undefined,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': undefined,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forPerps',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
        });
    }

    /**
     * @method
     * @name polymarket#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    override async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetInfoTime (params);
        //
        //     { "time": 1788524530209 }
        //
        return this.safeInteger (response, 'time');
    }

    /**
     * @method
     * @name polymarket#fetchStatus
     * @description the latest known information on the availability of the exchange api
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    override async fetchStatus (params = {}): Promise<Status> {
        const response = await this.publicGetInfoExchange (params);
        //
        //     {
        //         "name": "Polymarket",
        //         "version": "1",
        //         "chain_id": 137,
        //         "contract": "0xDCa4af75705dbB50f62437045afF9921947917d2",
        //         "cancel_only": false,
        //         "engine_version": "0.0.69"
        //     }
        //
        const cancelOnly = this.safeBool (response, 'cancel_only', false);
        return {
            'status': (cancelOnly === true) ? 'maintenance' : 'ok',
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name polymarket#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetInfoAssets (params);
        //
        //     [
        //         {
        //             "asset": "pUSD",
        //             "address": "0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB",
        //             "decimals": 6,
        //             "collateral_ratio": "1.00",
        //             "withdrawal_fee": "0.000000"
        //         }
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const currencyId = this.safeString (currency, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            result[code as string] = this.safeCurrencyStructure ({
                'id': currencyId,
                'code': code,
                'name': currencyId,
                'info': currency,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': this.safeNumber (currency, 'withdrawal_fee'),
                'precision': this.parseNumber (this.parsePrecision (this.safeString (currency, 'decimals'))),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'type': 'crypto',
                'networks': {},
            });
        }
        return result;
    }

    /**
     * @method
     * @name polymarket#fetchMarkets
     * @description retrieves data on all markets for polymarket perps
     * @see https://docs.polymarket.com/perps/market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetInfoInstruments (params);
        //
        //     [
        //         {
        //             "instrument_id": 1,
        //             "instrument_type": "perpetual",
        //             "category": "index",
        //             "isolated_only": false,
        //             "symbol": "SP500-USD",
        //             "base_asset": "SP500",
        //             "quote_asset": "pUSD",
        //             "funding_interval": "1h",
        //             "quantity_decimals": 5,
        //             "price_decimals": 1,
        //             "price_bounds": "0.05",
        //             "liquidation_fee": "0.005",
        //             "max_order_count": 200,
        //             "min_notional": "10",
        //             "max_market_notional": "1000000",
        //             "max_limit_notional": "5000000",
        //             "max_leverage": 20,
        //             "risk_tiers": [ { "lower_bound": "0", "max_leverage": 20 } ],
        //             "ui_live_time": 1785542400000
        //         }
        //     ]
        //
        return this.parseMarkets (response);
    }

    override parseMarket (market: Dict): Market {
        const numericId = this.safeString (market, 'instrument_id');
        const venueSymbol = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'base_asset');
        // prices are denominated using USD while pUSD is the 1:1 collateral and settlement token
        const settleId = this.safeString (market, 'quote_asset');
        const parts = (venueSymbol as string).split ('-');
        const quoteId = this.safeString (parts, 1, 'USD');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        const crossAllowed = !(this.safeBool (market, 'isolated_only', false));
        return this.safeMarketStructure ({
            'id': numericId,
            'symbol': base + '/' + quote + ':' + settle,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': undefined,
            'contract': true,
            'linear': true,
            'inverse': false,
            // tier-0 rates from GET /v1/info/fees, shared by every category
            'taker': this.parseNumber ('0.0004'),
            'maker': this.parseNumber ('0.000125'),
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'marginModes': {
                'cross': crossAllowed,
                'isolated': true,
            },
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'quantity_decimals'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'price_decimals'))),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': this.safeNumber (market, 'max_leverage'),
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_notional'),
                    'max': this.safeNumber (market, 'max_limit_notional'),
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name polymarket#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market, merging the ticker, statistics and best bid and ask endpoints
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        // the tickers and statistics endpoints ignore the documented
        // instrument_id filter and always answer with every instrument, so
        // the single-market call reuses the bulk fetch and selects one row
        const tickers = await this.fetchTickers ([ symbol ], params);
        const ticker = this.safeDict (tickers, symbol);
        if (ticker === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() could not find a ticker for ' + symbol);
        }
        return ticker as Ticker;
    }

    /**
     * @method
     * @name polymarket#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market, merging the ticker, statistics and best bid and ask endpoints
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const promises = [
            this.publicGetInfoTickers (params),
            this.publicGetInfoStatistics (params),
            this.publicGetInfoBbo (params),
        ];
        const responses = await Promise.all (promises);
        //
        // tickers
        //
        //     [
        //         {
        //             "instrument_id": 1,
        //             "symbol": "SP500-USD",
        //             "index_price": "7713.1",
        //             "mark_price": "7715",
        //             "last_price": "7714",
        //             "mid_price": "7715",
        //             "open_interest": "1101.82729",
        //             "funding_rate": "0.00000625",
        //             "next_funding": 1788548400000,
        //             "timestamp": 1788546972857
        //         }
        //     ]
        //
        // statistics
        //
        //     [
        //         {
        //             "instrument_id": 1,
        //             "symbol": "SP500-USD",
        //             "volume": "2087643.9565559996",
        //             "open_price": "7754.5",
        //             "klines": [ [ 1788458400000, "7754.5", "7754.5", "7751.4", "7751.4", "0.39184", 3 ] ]
        //         }
        //     ]
        //
        // bbo
        //
        //     [
        //         {
        //             "instrument_id": 1,
        //             "bid_price": "7715",
        //             "bid_quantity": "22.63803",
        //             "ask_price": "7715.1",
        //             "ask_quantity": "0.95534",
        //             "timestamp": 1788546975038
        //         }
        //     ]
        //
        const merged: Dict = {};
        const statistics = responses[1];
        for (let i = 0; i < statistics.length; i++) {
            const entry = statistics[i];
            const instrumentId = this.safeString (entry, 'instrument_id');
            // the 24 hourly kline rows are dropped from the merged payload to keep tickers light, candles are served by fetchOHLCV
            merged[instrumentId as string] = this.omit (entry, 'klines');
        }
        const bbos = responses[2];
        for (let i = 0; i < bbos.length; i++) {
            const entry = bbos[i];
            const instrumentId = this.safeString (entry, 'instrument_id');
            const previous = this.safeDict (merged, instrumentId, {});
            // the tickers endpoint timestamp wins the merge below because most unified fields come from it - bbo rows carry a slightly newer sampling time
            merged[instrumentId as string] = this.extend (previous, entry);
        }
        const tickers = responses[0];
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            const entry = tickers[i];
            const instrumentId = this.safeString (entry, 'instrument_id');
            const previous = this.safeDict (merged, instrumentId, {});
            result.push (this.extend (previous, entry));
        }
        return this.parseTickers (result, symbols);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // merged row assembled by fetchTickers from the tickers, statistics and bbo endpoints
        //
        //     {
        //         "instrument_id": 1,
        //         "symbol": "SP500-USD",
        //         "volume": "2087643.9565559996",
        //         "open_price": "7754.5",
        //         "bid_price": "7715",
        //         "bid_quantity": "22.63803",
        //         "ask_price": "7715.1",
        //         "ask_quantity": "0.95534",
        //         "index_price": "7713.1",
        //         "mark_price": "7715",
        //         "last_price": "7714",
        //         "mid_price": "7715",
        //         "open_interest": "1101.82729",
        //         "funding_rate": "0.00000625",
        //         "next_funding": 1788548400000,
        //         "timestamp": 1788546972857
        //     }
        //
        const marketId = this.safeString (ticker, 'instrument_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeString (ticker, 'bid_price'),
            'bidVolume': this.safeString (ticker, 'bid_quantity'),
            'ask': this.safeString (ticker, 'ask_price'),
            'askVolume': this.safeString (ticker, 'ask_quantity'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'open_price'),
            'close': this.safeString (ticker, 'last_price'),
            'last': this.safeString (ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            // the statistics volume is denominated using pUSD, verified against the sum of hourly candle base volumes
            'quoteVolume': this.safeString (ticker, 'volume'),
            'markPrice': this.safeString (ticker, 'mark_price'),
            'indexPrice': this.safeString (ticker, 'index_price'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name polymarket#fetchBidsAsks
     * @description fetches the best bid and ask price and volume for multiple markets
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetInfoBbo (params);
        //
        //     [
        //         {
        //             "instrument_id": 1,
        //             "bid_price": "7715",
        //             "bid_quantity": "22.63803",
        //             "ask_price": "7715.1",
        //             "ask_quantity": "0.95534",
        //             "timestamp": 1788546975038
        //         }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    /**
     * @method
     * @name polymarket#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return, must be one of 10, 100, 500 or 1000, the default is 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_id': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetInfoBook (this.extend (request, params));
        //
        //     {
        //         "instrument_id": 1,
        //         "bids": [ [ "7745.1", "0.319" ] ],
        //         "asks": [ [ "7745.2", "53.36141" ] ],
        //         "timestamp": 1788524545112,
        //         "sequence": 35631219797
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, market['symbol'], timestamp);
        orderbook['nonce'] = this.safeInteger (response, 'sequence');
        return orderbook;
    }

    /**
     * @method
     * @name polymarket#fetchTrades
     * @description get the list of the most recent trades for a particular symbol
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch, the venue serves at most 100 per request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_id': market['id'],
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.publicGetInfoTrades (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "trade_id": 3738280849593744,
        //                 "instrument_id": 1,
        //                 "side": "long",
        //                 "price": "7714",
        //                 "quantity": "0.00136",
        //                 "timestamp": 1788546565789,
        //                 "hash": "0x"
        //             }
        //         ],
        //         "more": true
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "trade_id": 3738280849593744,
        //         "instrument_id": 1,
        //         "side": "long",
        //         "price": "7714",
        //         "quantity": "0.00136",
        //         "timestamp": 1788546565789,
        //         "hash": "0x"
        //     }
        //
        const marketId = this.safeString2 (trade, 'instrument_id', 'iid');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (trade, 'timestamp', 'ts');
        let side = this.safeStringLower (trade, 'side');
        if (side === 'long') {
            side = 'buy';
        } else if (side === 'short') {
            side = 'sell';
        }
        const isTaker = this.safeBool (trade, 'taker');
        let takerOrMaker: Str = undefined;
        if (isTaker !== undefined) {
            takerOrMaker = (isTaker === true) ? 'taker' : 'maker';
        }
        const feeCost = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString2 (trade, 'fee_asset', 'fea');
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (feeCurrencyId),
            };
        }
        return this.safeTrade ({
            'id': this.safeString2 (trade, 'trade_id', 'tid'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': this.safeString2 (trade, 'order_id', 'oid'),
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeString2 (trade, 'price', 'p'),
            'amount': this.safeString2 (trade, 'quantity', 'qty'),
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name polymarket#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, the venue serves at most 1000 per request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling the endpoint multiple times
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, 1000) as OHLCV[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_id': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const duration = this.parseTimeframe (timeframe) * 1000;
        if (since !== undefined) {
            request['start_timestamp'] = since;
        } else {
            // the venue requires an explicit range start - the window covers
            // exactly the requested number of candle bins including the
            // current one, so the newest candle never falls off the range
            const end = (until !== undefined) ? until : this.milliseconds ();
            const requestedLimit = (limit !== undefined) ? limit : 100;
            request['start_timestamp'] = end - (requestedLimit - 1) * duration;
        }
        const response = await this.publicGetInfoKlines (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             [ 1788458400000, "7754.5", "7754.5", "7751.4", "7751.4", "0.39184", 3 ]
        //         ],
        //         "more": false
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        //
        // rows carry the timestamp, open, high, low, close, base volume and the trade count
        //
        //     [ 1788458400000, "7754.5", "7754.5", "7751.4", "7751.4", "0.39184", 3 ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    /**
     * @method
     * @name polymarket#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        // the tickers endpoint ignores the documented instrument_id filter
        // and always answers with every instrument, so the single-market call
        // reuses the bulk fetch and selects the requested row
        const fundingRates = await this.fetchFundingRates ([ symbol ], params);
        const fundingRate = this.safeDict (fundingRates, symbol);
        if (fundingRate === undefined) {
            throw new BadSymbol (this.id + ' fetchFundingRate() could not find the funding rate for ' + symbol);
        }
        return fundingRate as FundingRate;
    }

    /**
     * @method
     * @name polymarket#fetchFundingRates
     * @description fetches the current funding rates for multiple markets
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetInfoTickers (params);
        const result = this.parseFundingRates (response);
        return this.filterByArray (result, 'symbol', symbols);
    }

    override parseFundingRate (contract: any, market: Market = undefined): FundingRate {
        //
        //     {
        //         "instrument_id": 1,
        //         "symbol": "SP500-USD",
        //         "index_price": "7713.1",
        //         "mark_price": "7715",
        //         "last_price": "7714",
        //         "mid_price": "7715",
        //         "open_interest": "1101.82729",
        //         "funding_rate": "0.00000625",
        //         "next_funding": 1788548400000,
        //         "timestamp": 1788546972857
        //     }
        //
        const marketId = this.safeString (contract, 'instrument_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (contract, 'timestamp');
        const nextFundingTimestamp = this.safeInteger (contract, 'next_funding');
        const interval = this.safeString (market['info'], 'funding_interval');
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': this.safeNumber (contract, 'mark_price'),
            'indexPrice': this.safeNumber (contract, 'index_price'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (contract, 'funding_rate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': interval,
        } as FundingRate;
    }

    /**
     * @method
     * @name polymarket#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures to fetch, the venue serves at most 100 per request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling the endpoint multiple times
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    override async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingRateHistory[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchFundingRateHistory', symbol, since, limit, '1h', params, 100) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_id': market['id'],
        };
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.publicGetInfoFunding (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             { "funding_rate": "0.00000625", "timestamp": 1788544800063 }
        //         ],
        //         "more": false
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const timestamp = this.safeInteger (entry, 'timestamp');
            rates.push ({
                'info': entry,
                'symbol': market['symbol'],
                'fundingRate': this.safeNumber (entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit) as FundingRateHistory[];
    }

    /**
     * @method
     * @name polymarket#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    override async fetchOpenInterest (symbol: string, params = {}): Promise<OpenInterest> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        // the tickers endpoint ignores the documented instrument_id filter
        // and always answers with every instrument, so the single-market call
        // reuses the bulk fetch and selects the requested row
        const openInterests = await this.fetchOpenInterests ([ symbol ], params);
        const openInterest = this.safeDict (openInterests, symbol);
        if (openInterest === undefined) {
            throw new BadSymbol (this.id + ' fetchOpenInterest() could not find the open interest for ' + symbol);
        }
        return openInterest as OpenInterest;
    }

    /**
     * @method
     * @name polymarket#fetchOpenInterests
     * @description retrieves the open interest of multiple contract trading pairs
     * @see https://docs.polymarket.com/perps/market-data
     * @param {string[]} [symbols] unified market symbols, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    override async fetchOpenInterests (symbols: Strings = undefined, params = {}): Promise<OpenInterests> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetInfoTickers (params);
        const result = this.parseOpenInterests (response);
        return this.filterByArray (result, 'symbol', symbols);
    }

    override parseOpenInterest (interest: any, market: Market = undefined) {
        //
        //     {
        //         "instrument_id": 1,
        //         "symbol": "SP500-USD",
        //         "index_price": "7713.1",
        //         "mark_price": "7715",
        //         "last_price": "7714",
        //         "mid_price": "7715",
        //         "open_interest": "1101.82729",
        //         "funding_rate": "0.00000625",
        //         "next_funding": 1788548400000,
        //         "timestamp": 1788546972857
        //     }
        //
        const marketId = this.safeString (interest, 'instrument_id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (interest, 'timestamp');
        return this.safeOpenInterest ({
            'symbol': market['symbol'],
            'openInterestAmount': this.safeString (interest, 'open_interest'),
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    /**
     * @method
     * @name polymarket#fetchTradingFees
     * @description fetches the default trading fees for multiple markets
     * @see https://docs.polymarket.com/perps/learn-about-trading/fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    override async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const response = await this.publicGetInfoFees (params);
        //
        //     {
        //         "fee_schedule": [
        //             {
        //                 "instrument_type": "perpetual",
        //                 "category": "equity",
        //                 "taker_fee_rate": "0.0004",
        //                 "maker_fee_rate": "0.000125",
        //                 "tiers": [ { "min_volume_30d": "0", "taker_fee_rate": "0.0004", "maker_fee_rate": "0.000125" } ]
        //             }
        //         ]
        //     }
        //
        const schedule = this.safeList (response, 'fee_schedule', []);
        const byCategory: Dict = {};
        for (let i = 0; i < schedule.length; i++) {
            const entry = schedule[i];
            const category = this.safeString (entry, 'category');
            byCategory[category as string] = entry;
        }
        const fallback = this.safeDict (schedule, 0, {});
        const result: Dict = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            const category = this.safeString (market['info'], 'category');
            const entry = this.safeDict (byCategory, category, fallback);
            result[symbol] = {
                'info': entry,
                'symbol': symbol,
                'maker': this.safeNumber (entry, 'maker_fee_rate'),
                'taker': this.safeNumber (entry, 'taker_fee_rate'),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    /**
     * @method
     * @ignore
     * @name polymarket#createOrderRequest
     * @description builds one order for the createOrders operation, returning the compact signable row next to the structured body entry
     * @param {object} market the market the order targets
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price to fulfill the order at, a market order can carry one to act like a protective bound
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dict with the signable row and the body entry
     */
    createOrderRequest (market: Market, type: OrderType, side: OrderSide, amount: any, price: any = undefined, params = {}): Dict {
        const triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'trailingPercent', 'trailingAmount' ]);
        const attached = this.safeValueN (params, [ 'stopLoss', 'takeProfit' ]);
        if ((triggerPrice !== undefined) || (attached !== undefined)) {
            throw new NotSupported (this.id + ' createOrder() does not support trigger or attached stop orders yet');
        }
        const symbol = this.safeString (market, 'symbol');
        const isMarketOrder = (type === 'market');
        let timeInForce = this.safeStringUpper (params, 'timeInForce');
        const isPostOnlyTimeInForce = (timeInForce === 'PO');
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, isPostOnlyTimeInForce, params);
        if (isMarketOrder) {
            if ((timeInForce === 'GTC') || (timeInForce === 'PO')) {
                throw new NotSupported (this.id + ' createOrder() does not support the ' + timeInForce + ' timeInForce on market orders');
            }
            if (timeInForce === undefined) {
                timeInForce = 'IOC';
            }
        } else {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
            }
            if ((timeInForce === undefined) || (timeInForce === 'PO')) {
                timeInForce = 'GTC';
            }
        }
        const tif = timeInForce.toLowerCase ();
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'c');
        params = this.omit (params, [ 'timeInForce', 'reduceOnly', 'clientOrderId' ]);
        const instrumentId = this.parseToInt ((market as Dict)['id']);
        const isBuy = (side === 'buy');
        const quantity = this.amountToPrecision (symbol, amount);
        let priceString: Str = undefined;
        if (price !== undefined) {
            priceString = this.priceToPrecision (symbol, price);
        }
        const reduceOnlyValue = (reduceOnly === true) ? true : undefined;
        // the signable row is positional - iid, buy, p, qty, tif, po, ro, c,
        // trigger - undefined entries are removed and later entries shift left,
        // the venue rebuilds the same compact array from the body to verify
        const row = [ instrumentId, isBuy, priceString, quantity, tif, postOnly, reduceOnlyValue, clientOrderId ];
        const signable = this.compactSignable (row);
        const entry: Dict = {
            'iid': instrumentId,
            'buy': isBuy,
            'po': postOnly,
            'qty': quantity,
            'tif': tif,
        };
        if (priceString !== undefined) {
            entry['p'] = priceString;
        }
        if (reduceOnlyValue !== undefined) {
            entry['ro'] = reduceOnlyValue;
        }
        if (clientOrderId !== undefined) {
            entry['c'] = clientOrderId;
        }
        return {
            'signable': signable,
            'entry': entry,
            'params': params,
        };
    }

    /**
     * @method
     * @name polymarket#createOrder
     * @description create a trade order
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit', a market order executes like an immediate-or-cancel order without a price
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price to fulfill the order at, a market order accepts one to act like a protective bound
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK' or 'PO'
     * @param {bool} [params.postOnly] true to place a maker only order
     * @param {bool} [params.reduceOnly] true to reduce an open position only
     * @param {string} [params.clientOrderId] a client order id, exactly 32 lowercase hex characters
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const order: Dict = {
            'symbol': symbol,
            'type': type,
            'side': side,
            'amount': amount,
            'price': price,
            'params': params,
        };
        const orders = await this.createOrders ([ order as OrderRequest ]);
        const first = orders[0];
        if (first['status'] === 'rejected') {
            const errorId = this.safeString (first['info'], 'error');
            const feedback = this.id + ' createOrder() rejected: ' + this.json (first['info']);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorId, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorId, feedback);
            throw new InvalidOrder (feedback);
        }
        return first;
    }

    /**
     * @method
     * @name polymarket#createOrders
     * @description create a list of trade orders in one signed batch
     * @see https://docs.polymarket.com/perps/trading
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrders (orders: OrderRequest[], params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const rows = [];
        const entries = [];
        const ordersMarkets = [];
        const ordersEntries = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const symbol = this.safeString (rawOrder, 'symbol');
            const market = this.market (symbol);
            const type = this.safeStringLower (rawOrder, 'type');
            const side = this.safeStringLower (rawOrder, 'side');
            const amount = this.safeString (rawOrder, 'amount');
            const price = this.safeString (rawOrder, 'price');
            const orderParams = this.safeDict (rawOrder, 'params', {});
            const request = this.createOrderRequest (market, type as OrderType, side as OrderSide, amount, price, orderParams);
            rows.push (request['signable']);
            entries.push (request['entry']);
            ordersMarkets.push (market);
            ordersEntries.push (request['entry']);
        }
        const signable = [ 'createOrders', rows ];
        const bodyOp: Dict = {
            'type': 'createOrders',
            'args': entries,
        };
        const signed = await this.signPerpsOp (signable, bodyOp, params);
        const response = await this.tradePostTradeOrders (signed);
        //
        //     [
        //         { "status": "ok", "oid": 1234567890, "coid": "aabbccdd..." }
        //     ]
        //
        const results = [];
        for (let i = 0; i < response.length; i++) {
            const ack = response[i];
            const marketInner = ordersMarkets[i];
            const echo = ordersEntries[i];
            const status = this.safeString (ack, 'status');
            const merged = this.extend (echo, {
                'oid': this.safeInteger (ack, 'oid'),
                'coid': this.safeString2 (ack, 'coid', 'c'),
            });
            if (status === 'err') {
                merged['status'] = 'rejected';
            } else {
                merged['status'] = undefined;
            }
            const parsed = this.parseOrder (merged, marketInner);
            parsed['info'] = ack;
            results.push (parsed);
        }
        return results;
    }

    /**
     * @method
     * @name polymarket#cancelOrder
     * @description cancels an open order
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} id order id
     * @param {string} [symbol] not used by polymarket cancelOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel by the client order id instead of the exchange order id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        const orders = await this.cancelOrders ([ id ], symbol, params);
        return this.safeValue (orders, 0) as Order;
    }

    /**
     * @method
     * @name polymarket#cancelOrders
     * @description cancel multiple orders in one signed batch
     * @see https://docs.polymarket.com/perps/trading
     * @param {string[]} ids order ids
     * @param {string} [symbol] not used by polymarket cancelOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] cancel by client order ids instead of the exchange order ids
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrders (ids: string[], symbol: Str = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let clientOrderIds = this.safeList2 (params, 'clientOrderIds', 'clientOrderId');
        if (clientOrderIds === undefined) {
            const clientOrderId = this.safeString (params, 'clientOrderId');
            if (clientOrderId !== undefined) {
                clientOrderIds = [ clientOrderId ];
            }
        }
        params = this.omit (params, [ 'clientOrderIds', 'clientOrderId' ]);
        let signable = undefined;
        let bodyOp = undefined;
        let response = undefined;
        if (clientOrderIds !== undefined) {
            signable = [ 'cancelOrdersCOID', clientOrderIds ];
            bodyOp = {
                'type': 'cancelOrdersCOID',
                'args': clientOrderIds,
            };
            const signed = await this.signPerpsOp (signable, bodyOp, params);
            response = await this.tradeDeleteTradeOrdersCoid (signed);
        } else {
            const numericIds = [];
            for (let i = 0; i < ids.length; i++) {
                numericIds.push (this.parseToInt (ids[i]));
            }
            signable = [ 'cancelOrders', numericIds ];
            bodyOp = {
                'type': 'cancelOrders',
                'args': numericIds,
            };
            const signed = await this.signPerpsOp (signable, bodyOp, params);
            response = await this.tradeDeleteTradeOrders (signed);
        }
        //
        //     [
        //         { "status": "ok", "oid": 1234567890, "ts": 1788546565789 }
        //     ]
        //
        const results = [];
        for (let i = 0; i < response.length; i++) {
            const ack = response[i];
            const status = this.safeString (ack, 'status');
            const unified = (status === 'err') ? 'rejected' : 'canceled';
            const merged: Dict = {
                'oid': this.safeInteger (ack, 'oid'),
                'coid': this.safeString (ack, 'coid'),
                'uts': this.safeInteger (ack, 'ts'),
                'status': unified,
            };
            const parsed = this.parseOrder (merged);
            parsed['info'] = ack;
            results.push (parsed);
        }
        return results;
    }

    /**
     * @method
     * @name polymarket#cancelAllOrders
     * @description cancel all open orders, optionally scoped to a single market
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} [symbol] unified market symbol, cancels the orders of every market when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list with the raw acknowledgement of the venue
     */
    override async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        const args: Dict = {};
        let signableArgs: any[] = [];
        if (symbol !== undefined) {
            const market = this.market (symbol);
            const instrumentId = this.parseToInt (market['id']);
            args['iid'] = instrumentId;
            signableArgs = [ instrumentId ];
        }
        const signable = [ 'cancelAll', signableArgs ];
        const bodyOp: Dict = {
            'type': 'cancelAll',
            'args': args,
        };
        const signed = await this.signPerpsOp (signable, bodyOp);
        const response = await this.tradeDeleteTradeOrdersAll (signed);
        //
        //     { "status": "ok" }
        //
        return [ this.safeOrder ({ 'info': response }) ];
    }

    /**
     * @method
     * @name polymarket#cancelAllOrdersAfter
     * @description arms or clears a dead man's switch that cancels every open order once the deadline passes
     * @see https://docs.polymarket.com/perps/trading
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer, the venue requires at least 5 seconds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw acknowledgement of the venue
     */
    override async cancelAllOrdersAfter (timeout: Int, params = {}): Promise<any> {
        await this.loadMarkets ();
        let deadline = 0;
        if ((timeout !== undefined) && (timeout > 0)) {
            deadline = this.sum (this.milliseconds (), timeout);
        }
        const signable = [ 'autoCancel', [ deadline ] ];
        const bodyOp: Dict = {
            'type': 'autoCancel',
            'args': {
                'time': deadline,
            },
        };
        const signed = await this.signPerpsOp (signable, bodyOp);
        const response = await this.tradePatchTradeAutoCancel (signed);
        //
        //     { "status": "ok", "deadline": 1788546570789 }
        //
        return response;
    }

    /**
     * @method
     * @name polymarket#editOrder
     * @description edit a resting standalone gtc limit order, only the price and the total quantity can change
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {string} type not used by polymarket editOrder
     * @param {string} side not used by polymarket editOrder
     * @param {float} amount the new total order quantity, it must exceed the already filled quantity
     * @param {float} price the new order price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if ((amount === undefined) || (price === undefined)) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires both the amount and the price arguments');
        }
        const orderId = this.parseToInt (id);
        const priceString = this.priceToPrecision (market['symbol'], price);
        const quantity = this.amountToPrecision (market['symbol'], amount);
        const signable = [ 'modifyOrders', [ [ orderId, priceString, quantity ] ] ];
        const bodyOp: Dict = {
            'type': 'modifyOrders',
            'args': [
                {
                    'oid': orderId,
                    'p': priceString,
                    'qty': quantity,
                },
            ],
        };
        const signed = await this.signPerpsOp (signable, bodyOp, params);
        const response = await this.tradePatchTradeOrders (signed);
        //
        //     [
        //         {
        //             "status": "ok",
        //             "order": { "oid": 1, "iid": 1, "buy": true, "p": "7700", "qty": "0.001", "tif": "gtc", "po": false, "ro": false, "rest": "0.001", "fill": "0", "cts": 1788546565789, "uts": 1788546565789, "status": "open" }
        //         }
        //     ]
        //
        const first = this.safeDict (response, 0, {});
        const status = this.safeString (first, 'status');
        if (status === 'err') {
            const merged: Dict = {
                'oid': this.safeInteger (first, 'oid'),
                'coid': this.safeString (first, 'coid'),
                'status': 'rejected',
            };
            const rejected = this.parseOrder (merged, market);
            rejected['info'] = first;
            return rejected;
        }
        const order = this.safeDict (first, 'order', {});
        return this.parseOrder (order, market);
    }

    parseOrderStatus (status: Str): Str {
        const statuses: Dict = {
            'accepted': 'open',
            'open': 'open',
            'partial': 'open',
            'untriggered': 'open',
            'armed': 'open',
            'triggered': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'auto_cancelled': 'canceled',
            'fok_unfilled': 'canceled',
            'ioc_no_fill': 'canceled',
            'ioc_expired': 'canceled',
            'stp_cancelled': 'canceled',
            'reduce_only_expired': 'canceled',
            'parent_cancelled': 'canceled',
            'position_closed': 'canceled',
            'position_flipped': 'canceled',
            'reduce_only_invalid_at_trigger': 'canceled',
            'order_expired': 'expired',
            'expired': 'expired',
            'post_only_rejected': 'rejected',
            'zero_quantity': 'rejected',
            'duplicate_order': 'rejected',
            'order_not_found': 'rejected',
            'reduce_only_invalid': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // GET /v1/account/orders and /v1/account/open-orders use long names
        //
        //     {
        //         "order_id": 1234567890,
        //         "instrument_id": 1,
        //         "buy": true,
        //         "price": "7700.0",
        //         "quantity": "0.001",
        //         "tif": "gtc",
        //         "post_only": false,
        //         "ro": false,
        //         "resting_quantity": "0.001",
        //         "filled_quantity": "0",
        //         "status": "open",
        //         "created_timestamp": 1788546565789,
        //         "updated_timestamp": 1788546565789,
        //         "client_order_id": "aabbccddaabbccddaabbccddaabbccdd"
        //     }
        //
        // the modify acknowledgement and the ws orders channel use short names
        //
        //     {
        //         "oid": 1234567890,
        //         "iid": 1,
        //         "buy": true,
        //         "p": "7700.0",
        //         "qty": "0.001",
        //         "tif": "gtc",
        //         "po": false,
        //         "ro": false,
        //         "rest": "0.001",
        //         "fill": "0",
        //         "cts": 1788546565789,
        //         "uts": 1788546565789,
        //         "status": "open"
        //     }
        //
        const marketId = this.safeString2 (order, 'instrument_id', 'iid');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (order, 'created_timestamp', 'cts');
        const lastUpdateTimestamp = this.safeInteger2 (order, 'updated_timestamp', 'uts');
        const isBuy = this.safeBool (order, 'buy');
        let side: Str = undefined;
        if (isBuy !== undefined) {
            side = (isBuy === true) ? 'buy' : 'sell';
        }
        const price = this.omitZero (this.safeString2 (order, 'price', 'p'));
        let type: Str = undefined;
        const tif = this.safeString (order, 'tif');
        if (tif !== undefined) {
            type = (price === undefined) ? 'market' : 'limit';
        }
        const tpsl = this.safeDict (order, 'tpsl');
        let stopLossPrice: Str = undefined;
        let takeProfitPrice: Str = undefined;
        if (tpsl !== undefined) {
            const kind = this.safeString (tpsl, 'kind');
            const triggerValue = this.safeString (tpsl, 'trp');
            if (kind === 'sl') {
                stopLossPrice = triggerValue;
            } else if (kind === 'tp') {
                takeProfitPrice = triggerValue;
            }
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'order_id', 'oid'),
            'clientOrderId': this.safeString2 (order, 'client_order_id', 'coid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': this.safeStringUpper (order, 'tif'),
            'postOnly': this.safeBool2 (order, 'post_only', 'po'),
            'reduceOnly': this.safeBool (order, 'ro'),
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'stopLossPrice': stopLossPrice,
            'takeProfitPrice': takeProfitPrice,
            'amount': this.safeString2 (order, 'quantity', 'qty'),
            'cost': undefined,
            'average': undefined,
            'filled': this.safeString2 (order, 'filled_quantity', 'fill'),
            'remaining': this.safeString2 (order, 'resting_quantity', 'rest'),
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name polymarket#fetchBalance
     * @description query for the account equity, the free order margin and the used initial margin
     * @see https://docs.polymarket.com/perps/trading
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        await this.loadProxyCredentials ();
        const response = await this.privateGetAccountPortfolio (params);
        //
        //     {
        //         "positions": [],
        //         "margin": {
        //             "total_account_value": "100.00",
        //             "available_order_margin": "90.00",
        //             "total_initial_margin": "10.00",
        //             "total_maintenance_margin": "5.00",
        //             "total_position_value": "50.00"
        //         },
        //         "withdrawable": "90.00",
        //         "in_liquidation": false,
        //         "timestamp": 1788546565789
        //     }
        //
        const margin = this.safeDict (response, 'margin', {});
        const timestamp = this.safeInteger (response, 'timestamp');
        const result: Dict = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const account = this.account ();
        account['total'] = this.safeString (margin, 'total_account_value');
        account['free'] = this.safeString (margin, 'available_order_margin');
        account['used'] = this.safeString (margin, 'total_initial_margin');
        // pUSD is the only collateral asset on the venue
        result['PUSD'] = account;
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name polymarket#fetchPositions
     * @description fetch all open positions
     * @see https://docs.polymarket.com/perps/trading
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        await this.loadProxyCredentials ();
        symbols = this.marketSymbols (symbols);
        const response = await this.privateGetAccountPortfolio (params);
        const timestamp = this.safeInteger (response, 'timestamp');
        const rows = this.safeList (response, 'positions', []);
        const positions = [];
        for (let i = 0; i < rows.length; i++) {
            // the wrapper timestamp flows into the parser through the merged input
            const extended = this.extend (rows[i], { 'timestamp': timestamp });
            positions.push (this.parsePosition (extended));
        }
        return this.filterByArrayPositions (positions, 'symbol', symbols, false);
    }

    /**
     * @method
     * @name polymarket#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPosition (symbol: string, params = {}): Promise<Position> {
        const positions = await this.fetchPositions ([ symbol ], params);
        return this.safeValue (positions, 0) as Position;
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        //
        //     {
        //         "instrument_id": 6,
        //         "symbol": "BTC-USD",
        //         "size": "-0.001",
        //         "entry_price": "79650.0",
        //         "leverage": 10,
        //         "cross": true,
        //         "initial_margin": "7.97",
        //         "maintenance_margin": "3.99",
        //         "position_value": "79.65",
        //         "liquidation_price": "85000.0",
        //         "unrealized_pnl": "-0.10",
        //         "return_on_equity": "-0.0125",
        //         "cumulative_funding": "0.01",
        //         "timestamp": 1788546565789
        //     }
        //
        const marketId = this.safeString (position, 'instrument_id');
        market = this.safeMarket (marketId, market);
        const size = this.safeString (position, 'size');
        let side: Str = undefined;
        if (size !== undefined) {
            side = Precise.stringGt (size, '0') ? 'long' : 'short';
        }
        const isCross = this.safeBool (position, 'cross');
        let marginMode: Str = undefined;
        if (isCross !== undefined) {
            marginMode = (isCross === true) ? 'cross' : 'isolated';
        }
        const timestamp = this.safeInteger (position, 'timestamp');
        const roe = this.safeString (position, 'return_on_equity');
        let percentage = undefined;
        if (roe !== undefined) {
            percentage = this.parseNumber (Precise.stringMul (roe, '100'));
        }
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': undefined,
            'initialMargin': this.safeNumber (position, 'initial_margin'),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': this.safeNumber (position, 'maintenance_margin'),
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.safeNumber (position, 'entry_price'),
            'notional': this.safeNumber (position, 'position_value'),
            'leverage': this.safeInteger (position, 'leverage'),
            'unrealizedPnl': this.safeNumber (position, 'unrealized_pnl'),
            'realizedPnl': undefined,
            'contracts': this.parseNumber (Precise.stringAbs (size)),
            'contractSize': market['contractSize'],
            'marginRatio': undefined,
            'liquidationPrice': this.parseNumber (this.omitZero (this.safeString (position, 'liquidation_price'))),
            'markPrice': undefined,
            'lastPrice': undefined,
            'collateral': this.safeNumber (position, 'initial_margin'),
            'marginMode': marginMode,
            'side': side,
            'percentage': percentage,
            'hedged': false,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    /**
     * @method
     * @name polymarket#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] not sent to the venue, applied client-side
     * @param {int} [limit] the maximum number of open order structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        await this.loadProxyCredentials ();
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_id'] = market['id'];
        }
        const response = await this.privateGetAccountOpenOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name polymarket#fetchOrders
     * @description fetches the latest known snapshot of up to one hundred orders
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] not sent to the venue, applied client-side
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order
     * @param {string} [params.clientOrderId] fetch the order with this client order id only
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        await this.loadProxyCredentials ();
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_id'] = market['id'];
        }
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params = this.omit (params, 'clientOrderId');
            request['client_order_id'] = clientOrderId;
        }
        const response = await this.privateGetAccountOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name polymarket#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} id the order id
     * @param {string} [symbol] not used by polymarket fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        await this.loadProxyCredentials ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'order_id': id,
        };
        const response = await this.privateGetAccountOrders (this.extend (request, params));
        // select the requested row explicitly in case the documented
        // order_id filter is ever ignored the way the tickers one is
        for (let i = 0; i < response.length; i++) {
            const row = response[i];
            const rowId = this.safeString (row, 'order_id');
            if (rowId === id) {
                return this.parseOrder (row, market);
            }
        }
        throw new OrderNotFound (this.id + ' fetchOrder() could not find the order ' + id);
    }

    /**
     * @method
     * @name polymarket#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} [symbol] unified market symbol, the venue serves fills of every market, filtered client-side
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trade structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade
     * @param {string} [params.cursor] opaque pagination cursor returned by the previous page
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        await this.loadProxyCredentials ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {};
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.privateGetAccountFills (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "trade_id": 3738280849593744,
        //                 "order_id": 1234567890,
        //                 "instrument_id": 6,
        //                 "side": "long",
        //                 "price": "79650.0",
        //                 "quantity": "0.001",
        //                 "taker": true,
        //                 "fee": "0.03",
        //                 "fee_asset": "USDC",
        //                 "previous_size": "0",
        //                 "previous_entry_price": "0",
        //                 "pnl": "0",
        //                 "liquidation": false,
        //                 "adl": false,
        //                 "timestamp": 1788546565789,
        //                 "hash": "0x"
        //             }
        //         ],
        //         "more": false,
        //         "cursor": "..."
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    /**
     * @method
     * @name polymarket#fetchFundingHistory
     * @description fetch the funding payments paid and received on the open positions of the account
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest funding payment
     * @param {int} [limit] the maximum number of funding payment structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding payment
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    override async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingHistory[]> {
        await this.loadMarkets ();
        await this.loadProxyCredentials ();
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['instrument_id'] = market['id'];
        }
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.privateGetAccountFunding (this.extend (request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "id": 123,
        //                 "instrument_id": 6,
        //                 "size": "0.001",
        //                 "funding_rate": "0.0000125",
        //                 "funding_asset": "USDC",
        //                 "funding": "-0.01",
        //                 "timestamp": 1788546565789
        //             }
        //         ],
        //         "more": false
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'instrument_id');
            const timestamp = this.safeInteger (entry, 'timestamp');
            result.push ({
                'info': entry,
                'symbol': this.safeSymbol (marketId, market),
                'code': this.safeCurrencyCode (this.safeString (entry, 'funding_asset')),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'id': this.safeString (entry, 'id'),
                'amount': this.safeNumber (entry, 'funding'),
            });
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit) as FundingHistory[];
    }

    parseTransactionStatus (status: Str): Str {
        const statuses: Dict = {
            'pending': 'pending',
            'confirmed': 'ok',
            'removed': 'failed',
            'failed': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    override parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // deposit row
        //
        //     {
        //         "hash": "0x...",
        //         "asset": "USDC",
        //         "amount": "100",
        //         "from": "0x...",
        //         "to": "0x...",
        //         "status": "confirmed",
        //         "confirmations": 10,
        //         "required_confirmations": 10,
        //         "created_timestamp": 1788546565789,
        //         "confirmed_timestamp": 1788546570789
        //     }
        //
        // withdrawal row
        //
        //     {
        //         "withdraw_id": 123,
        //         "asset": "USDC",
        //         "amount": "100",
        //         "to": "0x...",
        //         "fee": "0.1",
        //         "status": "pending",
        //         "hash": "0x",
        //         "confirmations": 0,
        //         "required_confirmations": 10,
        //         "created_timestamp": 1788546565789
        //     }
        //
        const withdrawId = this.safeString (transaction, 'withdraw_id');
        const type = (withdrawId !== undefined) ? 'withdrawal' : 'deposit';
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'created_timestamp');
        const rawHash = this.safeString (transaction, 'hash');
        // the venue reports the literal 0x prefix while the transaction is unmined
        const txid = (rawHash === '0x') ? undefined : rawHash;
        const feeCost = this.safeString (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': this.parseNumber (feeCost),
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': withdrawId,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': undefined,
            'addressTo': this.safeString (transaction, 'to'),
            'addressFrom': this.safeString (transaction, 'from'),
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'updated': this.safeInteger (transaction, 'confirmed_timestamp'),
            'comment': undefined,
            'internal': false,
            'fee': fee,
        } as Transaction;
    }

    /**
     * @method
     * @name polymarket#fetchDeposits
     * @description fetch all deposits made to the account
     * @see https://docs.polymarket.com/perps/fund-your-account
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest deposit
     * @param {int} [limit] the maximum number of transaction structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest deposit
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        await this.loadProxyCredentials ();
        const request: Dict = {};
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.privateGetAccountDeposits (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (data, currency, since, limit);
    }

    /**
     * @method
     * @name polymarket#fetchWithdrawals
     * @description fetch all withdrawals made from the account
     * @see https://docs.polymarket.com/perps/fund-your-account
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest withdrawal
     * @param {int} [limit] the maximum number of transaction structures to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest withdrawal
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        await this.loadProxyCredentials ();
        const request: Dict = {};
        if (since !== undefined) {
            request['start_timestamp'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['end_timestamp'] = until;
        }
        const response = await this.privateGetAccountWithdrawals (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (data, currency, since, limit);
    }

    /**
     * @method
     * @name polymarket#withdraw
     * @description withdraw the collateral asset to the polymarket wallet of the account, the request is signed by the wallet key with the withdraw struct of the deposit contract
     * @see https://docs.polymarket.com/perps/fund-your-account
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag] not used by polymarket withdraw
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    override async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const currency = this.currency (code);
        const owner = this.ethGetAddressFromPrivateKey (this.privateKey);
        const tokenAddress = this.safeString (currency['info'], 'address');
        // the signed amount is denominated using raw base units of the token
        const precised = this.currencyToPrecision (code, amount);
        const baseUnits = Precise.stringDiv (precised, this.numberToString (currency['precision']));
        const ts = this.seconds ();
        const salt = this.randNumber (9);
        const chainId = this.safeInteger (this.options, 'chainId', 137);
        const contract = this.safeString (this.options, 'depositContract', '0xDCa4af75705dbB50f62437045afF9921947917d2');
        const domain: Dict = {
            'name': 'Polymarket',
            'version': '1',
            'chainId': chainId,
            'verifyingContract': contract,
        };
        const messageTypes: Dict = {
            'Withdraw': [
                { 'name': 'account', 'type': 'address' },
                { 'name': 'token', 'type': 'address' },
                { 'name': 'amount', 'type': 'uint256' },
                { 'name': 'fee', 'type': 'uint256' },
                { 'name': 'to', 'type': 'address' },
                { 'name': 'salt', 'type': 'uint64' },
                { 'name': 'ts', 'type': 'uint64' },
            ],
        };
        const message: Dict = {
            'account': owner,
            'token': tokenAddress,
            'amount': this.parseToInt (baseUnits),
            'fee': 0,
            'to': address,
            'salt': salt,
            'ts': ts,
        };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, message);
        const signature = this.signMessage (encoded, this.privateKey);
        const request: Dict = {
            'op': {
                'type': 'withdraw',
                'args': {
                    'account': owner,
                    'token': tokenAddress,
                    'amount': baseUnits,
                    'to': address,
                },
            },
            'salt': salt,
            'sig': signature,
            'ts': ts,
        };
        const response = await this.tradePostAccountWithdraw (this.extend (request, params));
        //
        //     { "status": "ok", "withdraw_id": 123 }
        //
        // the ack status is the request discriminator, the accepted
        // withdrawal itself starts out pending
        const stripped = this.omit (response, 'status');
        const transaction = this.parseTransaction (stripped, currency);
        transaction['status'] = 'pending';
        return transaction;
    }

    /**
     * @method
     * @name polymarket#fetchLeverage
     * @description fetch the leverage and the margin mode configured for a market
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    override async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        await this.loadProxyCredentials ();
        const market = this.market (symbol);
        const request: Dict = {
            'instrument_id': market['id'],
        };
        const response = await this.privateGetAccountConfig (this.extend (request, params));
        //
        //     [ { "instrument_id": 1, "leverage": 10, "cross": true } ]
        //
        // select the requested row explicitly in case the documented
        // instrument_id filter is ever ignored the way the tickers one is
        for (let i = 0; i < response.length; i++) {
            const row = response[i];
            const rowId = this.safeString (row, 'instrument_id');
            if (rowId === market['id']) {
                return this.parseLeverage (row, market);
            }
        }
        throw new BadSymbol (this.id + ' fetchLeverage() could not find the configuration for ' + symbol);
    }

    override parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const marketId = this.safeString (leverage, 'instrument_id');
        market = this.safeMarket (marketId, market);
        const isCross = this.safeBool (leverage, 'cross');
        let marginMode: Str = undefined;
        if (isCross !== undefined) {
            marginMode = (isCross === true) ? 'cross' : 'isolated';
        }
        const value = this.safeInteger (leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': market['symbol'],
            'marginMode': marginMode,
            'longLeverage': value,
            'shortLeverage': value,
        } as Leverage;
    }

    /**
     * @method
     * @name polymarket#fetchMarginMode
     * @description fetches the margin mode configured for a market
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    override async fetchMarginMode (symbol: string, params = {}): Promise<MarginMode> {
        const leverage = await this.fetchLeverage (symbol, params);
        return {
            'info': leverage['info'],
            'symbol': leverage['symbol'],
            'marginMode': leverage['marginMode'],
        } as MarginMode;
    }

    /**
     * @method
     * @name polymarket#setLeverage
     * @description set the level of leverage for a market, optionally switching the margin mode at the same time
     * @see https://docs.polymarket.com/perps/trading
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', the venue keeps the current mode when omitted is not supported - the default is cross
     * @returns {object} the raw acknowledgement of the venue
     */
    override async setLeverage (leverage: Int, symbol: Str = undefined, params = {}): Promise<any> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let marginMode: Str = undefined;
        [ marginMode, params ] = this.handleMarginModeAndParams ('setLeverage', params, 'cross');
        const isCross = (marginMode !== 'isolated');
        const instrumentId = this.parseToInt (market['id']);
        const leverageInt = this.parseToInt (leverage);
        const signable = [ 'updateLeverage', [ instrumentId, leverageInt, isCross ] ];
        const bodyOp: Dict = {
            'type': 'updateLeverage',
            'args': {
                'cross': isCross,
                'iid': instrumentId,
                'lev': leverageInt,
            },
        };
        const signed = await this.signPerpsOp (signable, bodyOp);
        const response = await this.tradePatchTradeLeverage (signed);
        //
        //     { "status": "ok", "instrument_id": 1, "leverage": 10, "cross": true }
        //
        return response;
    }

    /**
     * @method
     * @name polymarket#setMarginMode
     * @description set the margin mode of a market, the venue updates the mode and the leverage together
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} params.leverage the rate of leverage to set together with the mode
     * @returns {object} the raw acknowledgement of the venue
     */
    override async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}): Promise<any> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a symbol argument');
        }
        const leverage = this.safeInteger (params, 'leverage');
        if (leverage === undefined) {
            throw new ArgumentsRequired (this.id + ' setMarginMode() requires a params.leverage argument, the venue updates the mode and the leverage in one operation');
        }
        params = this.omit (params, 'leverage');
        const request: Dict = {
            'marginMode': marginMode,
        };
        return await this.setLeverage (leverage, symbol, this.extend (request, params));
    }

    /**
     * @method
     * @ignore
     * @name polymarket#modifyMarginHelper
     * @description adds margin to an isolated position or removes some, the amount is a signed decimal in the collateral asset
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to move
     * @param {string} type 'add' or 'reduce'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async modifyMarginHelper (symbol: string, amount: any, type: string, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const instrumentId = this.parseToInt (market['id']);
        let amountString = this.currencyToPrecision (market['settle'], amount);
        if (type === 'reduce') {
            amountString = '-' + amountString;
        }
        const signable = [ 'updateMargin', [ instrumentId, amountString ] ];
        const bodyOp: Dict = {
            'type': 'updateMargin',
            'args': {
                'amt': amountString,
                'iid': instrumentId,
            },
        };
        const signed = await this.signPerpsOp (signable, bodyOp);
        const response = await this.tradePatchTradeMargin (signed);
        //
        //     { "status": "ok" }
        //
        return {
            'info': response,
            'symbol': market['symbol'],
            'type': type,
            'marginMode': 'isolated',
            'amount': this.parseNumber (amountString),
            'total': undefined,
            'code': market['settle'],
            'status': 'ok',
            'timestamp': undefined,
            'datetime': undefined,
        } as MarginModification;
    }

    /**
     * @method
     * @name polymarket#addMargin
     * @description add margin to an isolated position
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    override async addMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    /**
     * @method
     * @name polymarket#reduceMargin
     * @description remove margin from an isolated position
     * @see https://docs.polymarket.com/perps/trading
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    override async reduceMargin (symbol: string, amount: number, params = {}): Promise<MarginModification> {
        return await this.modifyMarginHelper (symbol, amount, 'reduce', params);
    }

    hashMessage (message: any) {
        return '0x' + this.hash (message, keccak, 'hex');
    }

    signHash (hash: any, privateKey: any) {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        const r = signature['r'];
        const sVal = signature['s'];
        const v = this.intToBase16 (this.sum (27, signature['v']));
        return '0x' + r.padStart (64, '0') + sVal.padStart (64, '0') + v;
    }

    signMessage (message: any, privateKey: any) {
        return this.signHash (this.hashMessage (message), privateKey);
    }

    /**
     * @method
     * @name polymarket#createProxyCredentials
     * @description provisions fresh trading session credentials - generates a proxy keypair, registers it with an EIP-712 CreateProxy message signed by the wallet key and caches the returned secret, the venue keeps the session valid for the requested lifetime
     * @see https://docs.polymarket.com/perps/authenticated-sessions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the session credentials, holding the proxy address, the proxy private key, the secret and the expiry timestamp
     */
    async createProxyCredentials (params = {}): Promise<Dict> {
        this.checkRequiredCredentials ();
        const proxyPrivateKey = this.randomBytes (32);
        const proxyAddress = this.ethGetAddressFromPrivateKey (proxyPrivateKey);
        const owner = this.ethGetAddressFromPrivateKey (this.privateKey);
        const ts = this.milliseconds ();
        const lifetime = this.safeInteger (this.options, 'proxyExpiry', 604800000);
        const expiry = this.sum (ts, lifetime);
        const salt = this.randNumber (9);
        const chainId = this.safeInteger (this.options, 'chainId', 137);
        const domain: Dict = {
            'name': 'Polymarket',
            'version': '1',
            'chainId': chainId,
        };
        const messageTypes: Dict = {
            'CreateProxy': [
                { 'name': 'addr', 'type': 'address' },
                { 'name': 'exp', 'type': 'uint64' },
                { 'name': 'salt', 'type': 'uint64' },
                { 'name': 'ts', 'type': 'uint64' },
            ],
        };
        const message: Dict = {
            'addr': proxyAddress,
            'exp': expiry,
            'salt': salt,
            'ts': ts,
        };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, message);
        const signature = this.signMessage (encoded, this.privateKey);
        const request: Dict = {
            'op': {
                'type': 'createProxy',
                'args': {
                    'expiry': expiry,
                    'owner': owner,
                    'proxy': proxyAddress,
                },
            },
            'salt': salt,
            'sig': signature,
            'ts': ts,
        };
        const response = await this.tradePostAccountProxy (this.extend (request, params));
        //
        //     { "secret": "..." }
        //
        const credentials: Dict = {
            'proxy': proxyAddress,
            'privateKey': proxyPrivateKey,
            'secret': this.safeString (response, 'secret'),
            'expires': expiry,
        };
        this.options['proxyCredentials'] = credentials;
        return credentials;
    }

    /**
     * @method
     * @ignore
     * @name polymarket#loadProxyCredentials
     * @description returns the cached trading session credentials, provisioning fresh ones when none are cached or the cached session is close to its expiry
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the session credentials, holding the proxy address, the proxy private key, the secret and the expiry timestamp
     */
    async loadProxyCredentials (params = {}): Promise<Dict> {
        const credentials = this.safeDict (this.options, 'proxyCredentials');
        if (credentials !== undefined) {
            const expires = this.safeInteger (credentials, 'expires');
            const margin = this.safeInteger (this.options, 'proxyRefreshMargin', 3600000);
            if (expires === undefined) {
                return credentials;
            }
            const refreshAfter = expires - margin;
            if (this.milliseconds () < refreshAfter) {
                return credentials;
            }
        }
        return await this.createProxyCredentials (params);
    }

    /**
     * @method
     * @ignore
     * @name polymarket#signPerpsOp
     * @description signs a trading operation with the session proxy key - the compact signable array is msgpack-encoded and keccak-hashed, the hash is signed inside an EIP-712 Op struct and the structured operation travels next to the signature
     * @param {any[]} signable the compact positional operation array, undefined entries already removed
     * @param {object} bodyOp the structured operation object transmitted to the venue
     * @returns {object} the signed request body with the op, sig, salt and ts fields
     */
    async signPerpsOp (signable: any, bodyOp: any, params = {}): Promise<Dict> {
        const credentials = await this.loadProxyCredentials ();
        const packed = this.packb (signable);
        const dataHash = this.hashMessage (packed);
        const ts = this.milliseconds ();
        const salt = this.randNumber (9);
        const chainId = this.safeInteger (this.options, 'chainId', 137);
        const domain: Dict = {
            'name': 'Polymarket',
            'version': '1',
            'chainId': chainId,
        };
        const messageTypes: Dict = {
            'Op': [
                { 'name': 'data', 'type': 'bytes32' },
                { 'name': 'salt', 'type': 'uint64' },
                { 'name': 'ts', 'type': 'uint64' },
            ],
        };
        const message: Dict = {
            'data': dataHash,
            'salt': salt,
            'ts': ts,
        };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, message);
        const proxyPrivateKey = this.safeString (credentials, 'privateKey');
        const signature = this.signMessage (encoded, proxyPrivateKey);
        const envelope: Dict = {
            'op': bodyOp,
            'sig': signature,
            'salt': salt,
            'ts': ts,
        };
        // the optional command expiry travels next to the signature and is
        // not part of the signed payload
        const exp = this.safeInteger (params, 'exp');
        if (exp !== undefined) {
            envelope['exp'] = exp;
        }
        return envelope;
    }

    /**
     * @method
     * @ignore
     * @name polymarket#compactSignable
     * @description removes undefined entries from a positional signable array, later entries shift left exactly like the official sdk does before hashing
     * @param {any[]} row the positional array to compact
     * @returns {any[]} the compacted array
     */
    compactSignable (row: any[]) {
        const result = [];
        for (let i = 0; i < row.length; i++) {
            if (row[i] !== undefined) {
                result.push (row[i]);
            }
        }
        return result;
    }

    override calculateRateLimiterCost (api: any, method: any, path: any, params: any, config = {}) {
        if (path === 'account/orders') {
            return ('order_id' in params) ? 1 : 10;
        }
        if (path === 'account/open-orders') {
            return ('instrument_id' in params) ? 1 : 20;
        }
        if ((path === 'trade/orders') || (path === 'trade/orders-coid')) {
            const op = this.safeDict (params, 'op', {});
            const args = this.safeList (op, 'args', []);
            const argsLength = args.length;
            return this.sum (1, this.parseToInt (argsLength / 20));
        }
        if (path === 'info/book') {
            const depth = this.safeInteger (params, 'depth', 100);
            if (depth <= 10) {
                return 2;
            } else if (depth <= 100) {
                return 5;
            } else if (depth <= 500) {
                return 10;
            }
            return 20;
        }
        return this.safeValue (config, 'cost', 1);
    }

    override sign (path: any, api: any = 'public', method = 'GET', params = {}, headers: NullableDict = undefined, body: Str = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        headers = {
            'Accept': 'application/json',
        };
        if (api === 'trade') {
            // the params hold the signed operation envelope assembled by the
            // calling method, the signature authenticates so no headers apply
            body = this.json (query);
            headers['Content-Type'] = 'application/json';
        } else {
            if (method === 'GET') {
                const keys = Object.keys (query);
                const keysLength = keys.length;
                if (keysLength > 0) {
                    url += '?' + this.urlencode (query);
                }
            }
            if (api === 'private') {
                const credentials = this.safeDict (this.options, 'proxyCredentials', {});
                headers['POLYMARKET-PROXY'] = this.safeString (credentials, 'proxy');
                headers['POLYMARKET-SECRET'] = this.safeString (credentials, 'secret');
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        //
        //     {
        //         "status": "err",
        //         "error": "invalid query parameters: missing field `interval`",
        //         "arts": 1788524547131,
        //         "ts": 1788524547131,
        //         "ref": "g-164de39df348d7"
        //     }
        //
        let source = response;
        if (Array.isArray (response) && (code >= 400)) {
            // request-level failures of the batch trade endpoints arrive
            // wrapped into a single-element array of the same error shape
            source = this.safeDict (response, 0, {});
        }
        const status = this.safeString (source, 'status');
        const error = this.safeString (source, 'error');
        if ((status === 'err') || (error !== undefined)) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            if (code === 400) {
                // an unmapped 400 is a permanent validation failure with
                // free-form wording, never retryable
                throw new BadRequest (feedback);
            }
            // an unmapped error on a 4xx or 5xx response falls through so the
            // http status fallback can apply a retryable classification, while
            // covering statuses the base table does not know
            const codeAsString = code.toString ();
            if ((code < 400) || !(codeAsString in this.httpExceptions)) {
                throw new ExchangeError (feedback);
            }
        }
        return undefined;
    }
}
