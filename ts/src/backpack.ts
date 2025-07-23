
// ---------------------------------------------------------------------------

import Exchange from './abstract/backpack.js';
import { ArgumentsRequired, BadRequest } from './base/errors.js';
import type { Account, Bool, Currencies, Dict, FundingRate, FundingRateHistory, Int, Market, MarketType, Num, OHLCV, OrderBook, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';
import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';
import { eddsa } from './base/functions/crypto.js';

// ---------------------------------------------------------------------------

/**
 * @class backpack
 * @augments Exchange
 */
export default class backpack extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'backpack',
            'name': 'Backpack',
            'countries': [ 'JP' ], // Japan
            'rateLimit': 50, // 20 times per second
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': false,
                'createLimitSellOrder': false,
                'createMarketBuyOrder': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15': '15m',
                '30': '30m',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '6h': '6H',
                '8h': '8H',
                '12h': '12H',
                '1d': '1D',
                '3d': '3D',
                '1w': '1W',
                '1month': '1M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.backpack.exchange',
                    'private': 'https://api.backpack.exchange',
                },
                'www': 'https://backpack.exchange/',
                'doc': 'https://docs.backpack.exchange/',
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1/assets': 1, // done
                        'api/v1/collateral': 1, // not used
                        'api/v1/borrowLend/markets': 1,
                        'api/v1/borrowLend/markets/history': 1,
                        'api/v1/markets': 1, // done
                        'api/v1/market': 1, // not used
                        'api/v1/ticker': 1, // done
                        'api/v1/tickers': 1, // done
                        'api/v1/depth': 1, // done
                        'api/v1/klines': 1, // done
                        'api/v1/markPrices': 1, // done
                        'api/v1/openInterest': 1, // done
                        'api/v1/fundingRates': 1, // done
                        'api/v1/status': 1, // done
                        'api/v1/ping': 1,
                        'api/v1/time': 1, // done
                        'api/v1/wallets': 1,
                        'api/v1/trades': 1, // done
                        'api/v1/trades/history': 1, // done
                    },
                },
                'private': {
                    'get': {
                        'api/v1/account': 1,
                        'api/v1/account/limits/borrow': 1,
                        'api/v1/account/limits/order': 1,
                        'api/v1/account/limits/withdrawal': 1,
                        'api/v1/borrowLend/positions': 1,
                        'api/v1/capital': 1,
                        'api/v1/capital/collateral': 1,
                        'wapi/v1/capital/deposits': 1,
                        'wapi/v1/capital/deposit/address': 1,
                        'wapi/v1/capital/withdrawals': 1,
                        'api/v1/position': 1,
                        'wapi/v1/history/borrowLend': 1,
                        'wapi/v1/history/interest': 1,
                        'wapi/v1/history/borrowLend/positions': 1,
                        'wapi/v1/history/dust': 1,
                        'wapi/v1/history/fills': 1,
                        'wapi/v1/history/funding': 1,
                        'wapi/v1/history/orders': 1,
                        'wapi/v1/history/pnl': 1,
                        'wapi/v1/history/rfq': 1,
                        'wapi/v1/history/quote': 1,
                        'wapi/v1/history/settlement': 1,
                        'wapi/v1/history/strategies': 1,
                        'api/v1/order': 1,
                        'api/v1/orders': 1,
                    },
                    'post': {
                        'api/v1/account/convertDust': 1,
                        'api/v1/borrowLend': 1,
                        'wapi/v1/capital/withdrawals': 1,
                        'api/v1/order': 1,
                        'api/v1/orders': 1,
                        'api/v1/rfq': 1,
                        'api/v1/rfq/accept': 1,
                        'api/v1/rfq/refresh': 1,
                        'api/v1/rfq/cancel': 1,
                        'api/v1/rfq/quote': 1,
                    },
                    'delete': {
                        'api/v1/order': 1,
                        'api/v1/orders': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {
                'recvWindow': 5000, // default is 5000, max is 60000
                'brokerId': '',
                'currencyIdsListForParseMarket': undefined,
                'broker': '',
                'networks': {
                    'Solana': 'SOL',
                    'Sui': 'SUI',
                    'Ethereum': 'ERC20',
                    'Story': 'STORY',
                    'Eclipse': 'ECLIPSE',
                    'Arbitrum': 'ARB',
                    'Base': 'BASE',
                    'Optimism': 'OPTIMISM',
                    'Polygon': 'MATIC',
                    'XRP': 'XRP',
                    'Cardano': 'ADA',
                    'Hyperliquid': 'HYP',
                    'Tron': 'TRC20',
                    'Dogecoin': 'DOGE',
                    'Bitcoin': 'BTC',
                    'Berachain': 'BERA',
                    'BSC': 'BSC',
                },
                'networksById': {},
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {},
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name backpack#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.backpack.exchange/#tag/Assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetApiV1Assets (params);
        //
        //     [
        //         {
        //             "coingeckoId": "jito-governance-token",
        //             "displayName": "Jito",
        //             "symbol": "JTO",
        //             "tokens": [
        //                 {
        //                     "blockchain": "Solana",
        //                     "contractAddress": "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
        //                     "depositEnabled": true,
        //                     "displayName": "Jito",
        //                     "maximumWithdrawal": null,
        //                     "minimumDeposit": "0.29",
        //                     "minimumWithdrawal": "0.58",
        //                     "withdrawEnabled": true,
        //                     "withdrawalFee": "0.29"
        //                 }
        //             ]
        //         }
        //         ...
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currecy = response[i];
            const currencyId = this.safeString (currecy, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const networks = this.safeList (currecy, 'tokens', []);
            const parsedNetworks: Dict = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                const networkId = this.safeString (network, 'blockchain');
                const networkCode = this.networkCodeToId (networkId);
                parsedNetworks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (network, 'minimumWithdrawal'),
                            'max': this.parseNumber (this.omitZero (this.safeString (network, 'maximumWithdrawal'))),
                        },
                        'deposit': {
                            'min': this.safeNumber (network, 'minimumDeposit'),
                            'max': undefined,
                        },
                    },
                    'active': undefined,
                    'deposit': this.safeBool (network, 'depositEnabled'),
                    'withdraw': this.safeBool (network, 'withdrawEnabled'),
                    'fee': this.safeNumber (network, 'withdrawalFee'),
                    'precision': undefined,
                    'info': network,
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'id': currencyId,
                'code': code,
                'precision': undefined,
                'type': undefined,
                'name': this.safeString (currecy, 'displayName'),
                'active': undefined,
                'deposit': this.safeBool (networks, 'depositEnabled'),
                'withdraw': this.safeBool (networks, 'withdrawEnabled'),
                'fee': undefined,
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
                'networks': parsedNetworks,
                'info': currecy,
            });
        }
        return result;
    }

    /**
     * @method
     * @name backpack#fetchMarkets
     * @description retrieves data on all markets for bitbank
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetApiV1Markets (params);
        return this.parseMarkets (response);
    }

    parseMarket (market: Dict): Market {
        //
        //     [
        //         {
        //             "baseSymbol": "SOL",
        //             "createdAt": "2025-01-21T06:34:54.691858",
        //             "filters": {
        //                 "price": {
        //                     "borrowmarketFeeMaxMultiplier": null,
        //                     "borrowmarketFeeMinMultiplier": null,
        //                     "maxImpactMultiplier": "1.03",
        //                     "maxMultiplier": "1.25",
        //                     "maxPrice": null,
        //                     "meanMarkPriceBand": {
        //                         "maxMultiplier": "1.15",
        //                         "minMultiplier": "0.9"
        //                     },
        //                     "meanPremiumBand": null,
        //                     "minImpactMultiplier": "0.97",
        //                     "minMultiplier": "0.75",
        //                     "minPrice": "0.01",
        //                     "tickSize": "0.01"
        //                 },
        //                 "quantity": {
        //                     "maxQuantity": null,
        //                     "minQuantity": "0.01",
        //                     "stepSize": "0.01"
        //                 }
        //             },
        //             "fundingInterval": 28800000,
        //             "fundingRateLowerBound": null,
        //             "fundingRateUpperBound": null,
        //             "imfFunction": null,
        //             "marketType": "SPOT",
        //             "mmfFunction": null,
        //             "openInterestLimit": "0",
        //             "orderBookState": "Open",
        //             "quoteSymbol": "USDC",
        //             "symbol": "SOL_USDC"
        //         },
        //         {
        //             "baseSymbol": "SOL",
        //             "createdAt": "2025-01-21T06:34:54.691858",
        //             "filters": {
        //                 "price": {
        //                     "borrowEntryFeeMaxMultiplier": null,
        //                     "borrowEntryFeeMinMultiplier": null,
        //                     "maxImpactMultiplier": "1.03",
        //                     "maxMultiplier": "1.25",
        //                     "maxPrice": "1000",
        //                     "meanMarkPriceBand": {
        //                         "maxMultiplier": "1.1",
        //                         "minMultiplier": "0.9"
        //                     },
        //                     "meanPremiumBand": {
        //                         "tolerancePct": "0.05"
        //                     },
        //                     "minImpactMultiplier": "0.97",
        //                     "minMultiplier": "0.75",
        //                     "minPrice": "0.01",
        //                     "tickSize": "0.01"
        //                 },
        //                 "quantity": {
        //                     "maxQuantity": null,
        //                     "minQuantity": "0.01",
        //                     "stepSize": "0.01"
        //                 }
        //             },
        //             "fundingInterval": "28800000",
        //             "fundingRateLowerBound": "-100",
        //             "fundingRateUpperBound": "100",
        //             "imfFunction": {
        //                 "base": "0.02",
        //                 "factor": "0.0001275",
        //                 "type": "sqrt"
        //             },
        //             "marketType": "PERP",
        //             "mmfFunction": {
        //                 "base": "0.0125",
        //                 "factor": "0.0000765",
        //                 "type": "sqrt"
        //             },
        //             "openInterestLimit": "4000000",
        //             "orderBookState": "Open",
        //             "quoteSymbol": "USDC",
        //             "symbol": "SOL_USDC_PERP"
        //         }
        //     ]
        //
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseSymbol');
        const quoteId = this.safeString (market, 'quoteSymbol');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        const filters = this.safeDict (market, 'filters', {});
        const priceFilter = this.safeDict (filters, 'price', {});
        const maxPrice = this.safeNumber (priceFilter, 'maxPrice');
        const minPrice = this.safeNumber (priceFilter, 'minPrice');
        const pricePrecision = this.parseNumber (this.parsePrecision (this.safeString (priceFilter, 'tickSize')));
        const quantityFilter = this.safeDict (filters, 'quantity', {});
        const maxQuantity = this.safeNumber (quantityFilter, 'maxQuantity');
        const minQuantity = this.safeNumber (quantityFilter, 'minQuantity');
        const amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (quantityFilter, 'stepSize')));
        let type: MarketType;
        const typeOfMarket = this.parseMarketType (this.safeString (market, 'marketType'));
        let linear: Bool = undefined;
        let inverse: Bool = undefined;
        let settle: Str = undefined;
        let settleId: Str = undefined;
        let contractSize: Num = undefined;
        if (typeOfMarket === 'spot') {
            type = 'spot';
        } else if (typeOfMarket === 'swap') {
            type = 'swap';
            linear = true;
            inverse = false;
            settleId = this.safeString (market, 'quoteSymbol');
            settle = this.safeCurrencyCode (settleId);
            symbol += ':' + settle;
            contractSize = 1; // todo check contract size
        }
        const orderBookState = this.safeString (market, 'orderBookState');
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': type === 'spot',
            'margin': false,
            'swap': type === 'swap',
            'future': false,
            'option': false,
            'active': orderBookState === 'Open',
            'contract': type !== 'spot',
            'linear': linear,
            'inverse': inverse,
            'taker': undefined, // todo check commission
            'maker': undefined, // todo check commission
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amountPrecision,
                'price': pricePrecision,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': minQuantity,
                    'max': maxQuantity,
                },
                'price': {
                    'min': minPrice,
                    'max': maxPrice,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': this.parse8601 (this.safeString (market, 'createdAt')),
            'info': market,
        };
    }

    parseMarketType (type) {
        const types = {
            'SPOT': 'spot',
            'PERP': 'swap',
            // current types are described in the docs, but the exchange returns only 'SPOT' and 'PERP'
            // 'IPERP': 'swap',
            // 'DATED': 'swap',
            // 'PREDICTION': 'swap',
            // 'RFQ': 'swap',
        };
        return this.safeString (types, type, type);
    }

    /**
     * @method
     * @name backpack#fetchTickers
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_tickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request: Dict = {};
        const response = await this.publicGetApiV1Tickers (this.extend (request, params));
        return this.parseTickers (response);
    }

    /**
     * @method
     * @name bigone#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://open.big.one/docs/spot_tickers.html
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1Ticker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        // fetchTicker/fetchTickers
        //
        //     {
        //         "firstPrice": "327.38",
        //         "high": "337.99",
        //         "lastPrice": "317.14",
        //         "low": "300.01",
        //         "priceChange": "-10.24",
        //         "priceChangePercent": "-0.031279",
        //         "quoteVolume": "21584.32278",
        //         "symbol": "AAVE_USDC",
        //         "trades": "245",
        //         "volume": "65.823"
        //     }, ...
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'lastPrice');
        const high = this.safeString (ticker, 'high');
        const low = this.safeString (ticker, 'low');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = this.safeString (ticker, 'quoteVolume');
        const percentage = this.safeString (ticker, 'priceChangePercent');
        const change = this.safeString (ticker, 'priceChange');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': undefined,
            'indexPrice': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name backpack#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1Depth (this.extend (request, params));
        //
        //     {
        //         "asks": [
        //             ["118318.3","0.00633"],
        //             ["118567.2","0.08450"]
        //         ],
        //         "bids": [
        //             ["1.0","0.38647"],
        //             ["12.9","1.00000"]
        //         ],
        //         "lastUpdateId":"1504999670",
        //         "timestamp":1753102447307501
        //     }
        //
        const timestamp = this.safeInteger (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, symbol, timestamp);
        return orderbook;
    }

    /**
     * @method
     * @name backpack#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'symbol': market['id'],
            'interval': interval,
        };
        if (since === undefined) {
            throw new BadRequest (this.id + ' fetchOHLCV() requires a since argument');
        } else {
            request['startTime'] = since;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.publicGetApiV1Klines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         {
        //             "close": "118294.6",
        //             "end": "2025-07-19 13:12:00",
        //             "high": "118297.6",
        //             "low": "118237.5",
        //             "open": "118238",
        //             "quoteVolume": "4106.558156",
        //             "start": "2025-07-19 13:09:00",
        //             "trades": "12",
        //             "volume": "0.03473"
        //         },
        //         ...
        //     ]
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'start')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name backpack#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_mark_prices
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            throw new BadRequest (this.id + ' fetchFundingRate() symbol does not support market ' + symbol);
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1MarkPrices (this.extend (request, params));
        const data = this.safeDict (response, 0, {});
        return this.parseFundingRate (data, market);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        //
        //     {
        //         "fundingRate": "0.0001",
        //         "indexPrice": "118333.18643195",
        //         "markPrice": "118343.51853741",
        //         "nextFundingTimestamp": 1753113600000,
        //         "symbol": "BTC_USDC_PERP"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const nextFundingTimestamp = this.safeInteger (contract, 'nextFundingTimestamp');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.safeNumber (contract, 'markPrice'),
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name backpack#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_open_interest
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=interest-history-structure}
     */
    async fetchOpenInterest (symbol: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() symbol does not support market ' + symbol);
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiV1OpenInterest (this.extend (request, params));
        const interest = this.safeDict (response, 0, {});
        return this.parseOpenInterest (interest, market);
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        //     [
        //         {
        //             "openInterest": "1273.85214",
        //             "symbol": "BTC_USDC_PERP",
        //             "timestamp":1753105735301
        //         }
        //     ]
        //
        const timestamp = this.safeInteger (interest, 'timestamp');
        const openInterest = this.safeNumber (interest, 'openInterest');
        return this.safeOpenInterest ({
            'symbol': market['symbol'],
            'openInterestAmount': undefined,
            'openInterestValue': openInterest,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        }, market);
    }

    /**
     * @method
     * @name backpack#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_funding_interval_rates
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000); // api maximum 1000
        }
        const response = await this.publicGetApiV1FundingRates (this.extend (request, params));
        //
        //     [
        //         {
        //             "fundingRate": "0.0001",
        //             "intervalEndTimestamp": "2025-07-22T00:00:00",
        //             "symbol": "BTC_USDC_PERP"
        //         }
        //     ]
        //
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const rate = response[i];
            const datetime = this.safeString (rate, 'intervalEndTimestamp');
            const timestamp = this.parse8601 (datetime);
            rates.push ({
                'info': rate,
                'symbol': market['symbol'],
                'fundingRate': this.safeNumber (rate, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': datetime,
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit) as FundingRateHistory[];
    }

    /**
     * @method
     * @name backpack#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.backpack.exchange/#tag/Trades/operation/get_recent_trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.offset] the number of trades to skip, default is 0
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000); // api maximum 1000
        }
        let response = undefined;
        const offset = this.safeInteger (params, 'offset', 0);
        params = this.omit (params, 'offset');
        if (offset > 0) {
            request['offset'] = offset;
            response = await this.publicGetApiV1TradesHistory (this.extend (request, params));
        } else {
            response = await this.publicGetApiV1Trades (this.extend (request, params));
        }
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     [
        //         {
        //             "id": 8721564,
        //             "isBuyerMaker": false,
        //             "price": "117427.6",
        //             "quantity": "0.00016",
        //             "quoteQuantity": "18.788416",
        //             "timestamp": 1753123916818
        //         }, ...
        //     ]
        //
        const timestamp = this.safeInteger (trade, 'timestamp');
        const id = this.safeInteger (trade, 'id');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'quantity');
        const isBuyerMaker = this.safeBool (trade, 'isBuyerMaker');
        const takerOrMaker = isBuyerMaker ? 'maker' : 'taker';
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': undefined,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name backpack#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.backpack.exchange/#tag/System/operation/get_status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus (params = {}) {
        const response = await this.publicGetApiV1Status (params);
        //
        //     {
        //         "message":null,
        //         "status":"Ok"
        //     }
        //
        const status = this.safeString (response, 'status');
        return {
            'status': status.toLowerCase (),
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name bitmart#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://developer-pro.bitmart.com/en/spot/#get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetApiV1Time (params);
        //
        //     1753131712992
        //
        return this.safeInteger (response, 0, this.milliseconds ());
    }

    /**
     * @method
     * @name backpack#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.backpack.exchange/#tag/Account/operation/get_account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    async fetchAccounts (params = {}): Promise<Account[]> {
        await this.loadMarkets ();
        const response = await this.privateGetApiV1Account (params);
        //
        //
        return this.parseAccounts (response, params);
    }

    parseAccount (account) {
        //
        //     {
        //         "id": "4aac9c60-cbda-4396-9da4-4aa71e95fba0",
        //         "currency": "BTC",
        //         "balance": "0.0000000000000000",
        //         "available": "0",
        //         "hold": "0.0000000000000000",
        //         "profile_id": "b709263e-f42a-4c7d-949a-a95c83d065da"
        //     }
        //
        const currencyId = this.safeString (account, 'currency');
        return {
            'id': this.safeString (account, 'id'),
            'type': undefined,
            'code': this.safeCurrencyCode (currencyId),
            'info': account,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + path;
        let url = this.urls['api'][api];
        const sortedParams = this.keysort (params);
        const query = this.urlencode (sortedParams);
        if (method === 'GET') {
            if (query.length !== 0) {
                endpoint += '?' + query;
            }
        }
        if (api === 'private') {
            const ts = this.milliseconds ().toString ();
            const recvWindow = this.safeString2 (this.options, 'recvWindow', 'X-Window', '5000');
            const instruction = this.getInstruction (path, method);
            let queryString = query;
            if (queryString.length > 0) {
                queryString += '&';
            }
            const payload = 'instruction=' + instruction + '&' + queryString + 'timestamp=' + ts + '&window=' + recvWindow;
            const secretBytes = this.base64ToBinary (this.secret);
            const seed = this.arraySlice (secretBytes, 0, 32);
            const signature = eddsa (this.encode (payload), seed, ed25519);
            headers = {
                'X-Timestamp': ts,
                'X-Window': recvWindow,
                'X-API-Key': this.apiKey,
                'X-Signature': signature,
            };
            if (method !== 'GET') {
                body = this.json (sortedParams);
            }
        }
        url += endpoint;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    getInstruction (path, method) {
        const instructions = {
            'api/v1/account': {
                'GET': 'accountQuery',
            },
            'api/v1/capital': {
                'GET': 'balanceQuery',
            },
            'api/v1/borrowLend': {
                'GET': 'borrowLendExecute',
            },
            'wapi/v1/history/borrowLend': {
                'GET': 'borrowHistoryQueryAll',
            },
            'api/v1/capital/collateral': {
                'GET': 'collateralQuery',
            },
            'wapi/v1/capital/deposit/address': {
                'GET': 'depositAddressQuery',
            },
            'wapi/v1/capital/deposits': {
                'GET': 'depositQueryAll',
            },
            'wapi/v1/history/fills': {
                'GET': 'fillHistoryQueryAll',
            },
            'wapi/v1/history/funding': {
                'GET': 'fundingHistoryQueryAll',
            },
            'wapi/v1/history/interest': {
                'GET': 'interestHistoryQueryAll',
            },
            'api/v1/order': {
                'GET': 'orderQuery',
                'POST': 'orderExecute',
                'DELETE': 'orderCancel',
            },
            'api/v1/orders': {
                'GET': 'orderQueryAll',
                'DELETE': 'orderCancelAll',
            },
            'wapi/v1/history/orders': {
                'GET': 'orderHistoryQueryAll',
            },
            'wapi/v1/history/pnl': {
                'GET': 'pnlHistoryQueryAll',
            },
            'api/v1/position': {
                'GET': 'positionQuery',
            },
            'api/v1/rfq/quote': {
                'POST': 'quoteSubmit',
            },
            'wapi/v1/history/strategies': {
                'GET': 'strategyHistoryQueryAll',
            },
            'wapi/v1/capital/withdrawals': {
                'GET': 'withdrawalQueryAll',
                'POST': 'withdraw',
            },
        };
        const pathInstructions = this.safeDict (instructions, path, {});
        let instruction = this.safeString (pathInstructions, method);
        if (instruction === undefined) {
            const optionInstructions = this.safeDict (this.options, 'instructions', {});
            const optionPathInstructions = this.safeDict (optionInstructions, path, {});
            instruction = this.safeString (optionPathInstructions, method, '');
        }
        return instruction;
    }
}
