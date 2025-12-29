//  ---------------------------------------------------------------------------
import Exchange from './abstract/bydfi.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { MarketInterface, Dict, Market, Ticker, int, Str, FundingRate, Int, LastPrice, Trade, OHLCV, TransferEntry, Currency, Leverage, List, Strings, MarginMode, OrderSide, OrderType, Num, Order, FundingRateHistory, Position, Transaction, Balances, OrderBook } from './base/types.js';
import { BadRequest, ExchangeError, InvalidOrder, RateLimitExceeded } from './base/errors.js';

//  ---------------------------------------------------------------------------

/**
 * @class bydfi
 * @augments Exchange
 */
export default class bydfi extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bydfi',
            'name': 'Bydfi',
            'countries': [],
            'version': 'v1',
            'rateLimit': 20, // 600 requests per minute, 10 request per second
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
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createStopOrder': false,
                'createTriggerOrder': false,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': false,
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
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': true,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsForSymbol': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': true,
                'transfer': true,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'hostname': 'api.bydfi.com',
            'urls': {
                'logo': 'https://www.bydfi.com/static/images/header/media/app-logo.svg',
                'api': {
                    'public': 'https://{hostname}/api',
                    'private': 'https://{hostname}/api',
                },
                'test': {
                    'public': 'https://api.bydtms.com/api',
                    'private': 'https://api.bydtms.com/api',
                },
                'www': 'https://bydfi.com/',
                'doc': 'https://developers.bydfi.com/',
                'referral': 'https://www.bydfi.com/zh/swap/btc-usdt',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/public/api_limit': 1,
                        'v1/swap/market/exchange_info': 1,
                        'v1/swap/market/ticker/24hr': 1,
                        'v1/swap/market/depth': 1,
                        'v1/swap/market/trades': 1,
                        'v1/swap/market/klines': 1,
                        'v1/swap/market/ticker/price': 1,
                        'v1/swap/market/mark_price': 1,
                        'v1/swap/market/funding_rate': 1,
                        'v1/swap/market/funding_rate_history': 1,
                        'v1/swap/market/risk_limit': 1,
                    },
                },
                'private': {
                    'get': {
                        'v1/account/assets': 1,
                        'v1/account/transfer_records': 1,
                        'v1/spot/deposit_records': 1,
                        'v1/spot/withdraw_records': 1,
                        'v1/swap/account/balance': 1,
                        'v1/swap/user_data/assets_margin': 1,
                        'v1/swap/user_data/position_side/dual': 1,
                        'v1/swap/trade/leverage': 1,
                        'v1/swap/trade/open_order': 1,
                        'v1/swap/trade/plan_order': 1,
                        'v1/swap/trade/history_order': 1,
                        'v1/swap/trade/history_trade': 1,
                        'v1/swap/trade/position_history': 1,
                        'v1/swap/trade/positions': 1,
                        'v1/agent/teams': 1,
                        'v1/agent/agent_links': 1,
                        'v1/agent/regular_overview': 1,
                        'v1/agent/agent_sub_overview': 1,
                        'v1/agent/partener_user_deposit': 1,
                        'v1/agent/partener_users_data': 1,
                        'v1/agent/affiliate_uids': 1,
                        'v1/agent/affiliate_commission': 1,
                        'v1/agent/internal_withdrawal_status': 1,
                    },
                    'post': {
                        'v1/account/transfer': 1,
                        'v1/swap/user_data/margin_type': 1,
                        'v1/swap/user_data/position_side/dual': 1,
                        'v1/swap/trade/place_order': 1,
                        'v1/swap/trade/leverage': 1,
                        'v1/swap/trade/batch_leverage': 1,
                        'v1/swap/trade/cancel_order': 1,
                        'v1/swap/trade/edit_order': 1,
                        'v1/swap/trade/cancel_all_order': 1,
                        'v1/swap/trade/batch_cancel_order': 1,
                        'v1/swap/trade/batch_edit_order': 1,
                        'v1/swap/trade/batch_leverage_margin': 1,
                        'v1/agent/internal_withdrawal': 1,
                    },
                },
            },
            'httpExceptions': {
                '403': RateLimitExceeded, // Forbidden -- You request too many times
            },
            'exceptions': {
                // Uncodumented explanation of error strings:
                // - oc_diff: order cost needed to place this order
                // - new_oc: total order cost of open orders including the order you are trying to open
                // - ob: order balance - the total cost of current open orders
                // - ab: available balance
                'exact': {
                    '20006': 'apikey sign error', // apikey sign error
                    '20016': 'request para error', // apikey sign error
                    '10001': BadRequest,
                },
                'broad': {
                    'ORDER_PRICE_MUST_GREETER_ZERO': InvalidOrder,
                    'ORDER_POSSIBLE_LEAD_TO_ACCOUNT_LIQUIDATED': InvalidOrder,
                    'ORDER_WITH_THIS_PRICE_CANNOT_REDUCE_POSITION_ONLY': InvalidOrder,
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber ('0.0005'),
                    'maker': this.parseNumber ('0.0002'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {},
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrders': undefined,
                    'fetchMyTrades': undefined,
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 200,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
            },
        });
    }

    /**
     * @method
     * @name bydfi#fetchApiLimit
     * @description Examine the rate limit configurations for all API interfaces
     * @see https://developers.bydfi.com/en/public#inquiry-into-api-rate-limit-configuration
     * @returns {object[]} an array of API limit objects
     */
    async fetchApiLimit () {
        const response = await this.publicGetV1PublicApiLimit ();
        const data = this.safeList (response, 'data', []);
        return data;
    }

    /**
     * @method
     * @name bydfi#fetchMarkets
     * @description Obtaining trading rules and pairs
     * @see https://developers.bydfi.com/en/swap/market#fetching-trading-rules-and-pairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV1SwapMarketExchangeInfo (params);
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quoteAsset');
        const baseId = this.safeString (market, 'baseAsset');
        const quote = this.safeString (market, 'quoteAsset');
        const base = this.safeCurrencyCode (baseId);
        const symbol = baseId + '/' + quote;
        const takerFee = this.safeNumber (market, 'feeRateTaker');
        const makerFee = this.safeNumber (market, 'feeRateMaker');
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': quoteId,
            'type': 'swap',
            'spot': false,
            'margin': undefined,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeString (market, 'status') === 'NORMAL',
            'contract': true,
            'linear': true,
            'inverse': false,
            'taker': takerFee,
            'maker': makerFee,
            'contractSize': this.safeNumber (market, 'minOrderSize'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'volumePrecision'),
                'price': this.safeNumber (market, 'pricePrecision'),
            },
            'limits': {
                'leverage': {
                    'min': 1,
                    'max': this.safeNumber (market, 'maxLeverageLevel'),
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
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    /**
     * @method
     * @name bydfi#fetchTicker
     * @description Please note that without the symbol parameter, it will return data for all trading pairs, which not only has a large volume of data but also carries a very high weight.
     * @see https://developers.bydfi.com/en/swap/market#24hr-price-change-statistics
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (!symbol) {
            throw new BadRequest (this.id + ' fetchTicker symbol is required');
        }
        const market = this.market (symbol);
        request['symbol'] = market['id'];
        const response = await this.publicGetV1SwapMarketTicker24hr (this.extend (request, params));
        const tickers = this.safeList (response, 'data', []);
        if (tickers.length === 0) {
            return null;
        }
        const rawTicker = this.safeDict (tickers, 0, {});
        return this.parseSwapTicker (rawTicker);
    }

    parseSwapTicker (ticker: Dict): Ticker {
        const symbol = this.safeString (ticker, 'symbol');
        const market = this.market (symbol);
        const baseVolume = this.safeString (ticker, 'vol');
        const open = this.safeString (ticker, 'open');
        const close = this.safeString (ticker, 'close');
        const last = this.safeString (ticker, 'last');
        const high = this.safeString (ticker, 'high');
        const low = this.safeString (ticker, 'low');
        const bid = this.safeString (ticker, 'buy');
        const ask = this.safeString (ticker, 'sell');
        const markPrice = this.safeString (ticker, 'markPrice');
        const indexPrice = this.safeString (ticker, 'indexPrice');
        return this.safeTicker ({
            'symbol': symbol,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'info': ticker,
        }, market);
    }

    parseSwapFundingRate (funding: any): FundingRate {
        const fundingRate = this.safeNumber (funding, 'lastFundingRate');
        const nextFundingTime = this.safeInteger (funding, 'nextFundingTime');
        const timestamp = this.safeInteger (funding, 'time');
        return {
            'info': funding,
            'symbol': funding.symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': fundingRate,
            'fundingTimestamp': nextFundingTime,
            'fundingDatetime': this.iso8601 (nextFundingTime),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': nextFundingTime,
            'nextFundingDatetime': this.iso8601 (nextFundingTime),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': '8h',
        };
    }

    /**
     * @method
     * @name bydfi#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://developers.bydfi.com/en/swap/market#recent-funding-rate
     * @param {string} symbol trading pair
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        if (!symbol) {
            throw new BadRequest (this.id + ' fetchFundingRate symbol is required');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {};
        request['symbol'] = market['id'];
        const response = await this.publicGetV1SwapMarketFundingRate (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return this.parseSwapFundingRate (data);
    }

    /**
     * @method
     * @name bydfi#fetchFundingRateHistory
     * @description fetch funding rate history
     * @see https://developers.bydfi.com/en/swap/market#historical-funding-rates
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number is 1000, default 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.endTime] end time, ms
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = 100, params = {}): Promise<FundingRateHistory[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since) {
            request['startTime'] = since;
        }
        if (limit) {
            request['limit'] = limit;
        }
        const endTime = this.safeIntegerN (params, [ 'endTime' ]);
        if (endTime) {
            params = this.omit (params, [ 'endTime' ]);
            request['endTime'] = endTime;
        }
        const response = await this.publicGetV1SwapMarketFundingRateHistory (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parseSwapFundingHistory (data);
    }

    parseSwapFundingHistory (list): FundingRateHistory[] {
        const result = [];
        for (let i = 0; i < list.length; i++) {
            const income = list[i];
            const timestamp = this.safeInteger (income, 'fundingTime');
            result.push ({
                'info': income,
                'symbol': this.safeString (income, 'symbol'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'fundingRate': this.safeNumber (income, 'fundingRate'),
            });
        }
        return result;
    }

    /**
     * @method
     * @name bydfi#fetchOrderBook
     * @description Trading pair depth information.
     * @see https://developers.bydfi.com/en/swap/market#depth-information
     * @param {string} symbol unified symbol of the market to fetch the market depth for
     * @param {int} [limit] the maximum number of market depth entries to fetch, default 500, available values:[5, 10, 20, 50, 100, 500, 1000]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} [order book structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (!symbol) {
            throw new BadRequest (this.id + ' fetchOrderBook symbol is required');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'limit': limit,
        };
        if (symbol) {
            request['symbol'] = market['id'];
        }
        if (limit) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1SwapMarketDepth (request);
        const data = this.safeDict (response, 'data', {});
        return this.parseOrderBook (data, data.symbol, this.milliseconds (), 'bids', 'asks', 'price', 'amount');
    }

    /**
     * @method
     * @name bydfi#fetchTrades
     * @description Retrieve recent order book trades.
     * @see https://developers.bydfi.com/en/swap/market#recent-trades
     * @param {string} symbol unified symbol of the market to fetch the trades for
     * @param {int} [since] from which transaction id is returned. Pre-set return the latest transaction record
     * @param {int} [limit] the maximum number of trades to fetch, default 500
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.fromId] start returning trades from this trade ID. By default returns most recent trades
     * @returns {object[]} a list of trade structures
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (!symbol) {
            throw new BadRequest (this.id + ' fetchTrades symbol is required');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'limit': limit,
        };
        if (symbol) {
            request['symbol'] = market['id'];
        }
        if (since) {
            request['fromId'] = since;
        }
        if (limit) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1SwapMarketTrades (request);
        const trades = this.safeList (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        // [
        //     {
        //       "id": 28457,
        //       "symbol": "BTC-USDT",
        //       "price": "4.00000100",
        //       "qty": "12.00000000",
        //       "side": "BUY",
        //       "time": 1499865549590
        //     }
        //   ]
        const marketId = this.safeStringN (trade, [ 'symbol' ]);
        market = this.safeMarket (marketId, market);
        const id = this.safeStringN (trade, [ 'id' ]);
        const timestamp = this.safeIntegerN (trade, [ 'time' ]);
        const priceString = this.safeStringN (trade, [ 'price' ]);
        const amountString = this.safeStringN (trade, [ 'qty' ]);
        const side = this.safeStringLowerN (trade, [ 'side' ]);
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name bydfi#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.bydfi.com/en/swap/market#candlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.endTime] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        if (!symbol) {
            throw new BadRequest (this.id + ' fetchOHLCV symbol is required');
        }
        if (!timeframe) {
            throw new BadRequest (this.id + ' fetchOHLCV timeframe is required');
        }
        if (!since) {
            throw new BadRequest (this.id + ' fetchOHLCV since is required');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'interval': timeframe,
            'symbol': market['id'],
            'startTime': since,
        };
        if (!limit) {
            request['limit'] = 500;
        }
        const endTime = this.safeInteger (params, 'endTime');
        if (endTime) {
            request['endTime'] = endTime;
        } else {
            throw new BadRequest (this.id + ' fetchOHLCV endTime is required');
        }
        const response = await this.publicGetV1SwapMarketKlines (this.extend (request, params));
        const OHLCVs = this.safeList (response, 'data', []);
        return this.parseOHLCVs (OHLCVs, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //  {
        //     "start": 1647511440000,
        //     "symbol": "BTC-USD",
        //     "interval": "1",
        //     "low": "40000",
        //     "high": "45000",
        //     "open": "45000",
        //     "close": "40000",
        //     "volume": "1.002",
        //     "turnover": "3"
        //  } {"s":"BTCUSDT","i":"1","t":1741265880000,"c":"90235","h":"90235","l":"90156","o":"90156","v":"0.052","tr":"4690.4466"}
        //
        return [
            this.safeIntegerN (ohlcv, [ 'timestamp', 't' ]),
            this.safeNumberN (ohlcv, [ 'open', 'o' ]),
            this.safeNumberN (ohlcv, [ 'high', 'h' ]),
            this.safeNumberN (ohlcv, [ 'low', 'l' ]),
            this.safeNumberN (ohlcv, [ 'close', 'c' ]),
            this.safeNumberN (ohlcv, [ 'volume', 'v' ]),
        ];
    }

    /**
     * @method
     * @name bydfi#fetchLastPrice
     * @description fetches mark price for the market
     * @see https://developers.bydfi.com/en/swap/market#latest-price
     * @param {string|undefined} symbol unified symbol of the market to fetch the last price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of lastprice structures
     */
    async fetchSwapLastPrice (symbol = undefined, params = {}): Promise<LastPrice[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (symbol) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.publicGetV1SwapMarketTickerPrice (this.extend (request, params));
        const data = this.safeList (response, 'data', []);
        return this.parsePrice (data);
    }

    parsePrice (entry) {
        const timestamp = this.milliseconds ();
        const result = [];
        for (let i = 0; i < entry.length; i++) {
            const data = entry[i];
            const symbol = this.safeString (data, 'symbol');
            result.push ({
                'symbol': symbol,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'price': this.safeNumberOmitZero (data, 'price'),
                'side': undefined,
                'info': entry,
            });
        }
        return result;
    }

    /**
     * @method
     * @name bydfi#fetchMarkPrice
     * @description fetches mark price for the market
     * @see https://developers.bydfi.com/en/swap/market#mark-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of mark price structures
     */
    async fetchMarkPrice (symbol: string, params = {}): Promise<Ticker> {
        if (!symbol) {
            throw new BadRequest (this.id + ' fetchMarkPrice symbol is required');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1SwapMarketMarkPrice (this.extend (request, params));
        const data = this.safeDict (response, 'data', {});
        return this.parseSwapTicker (data);
    }

    safeMarket (marketId: Str = undefined, market: Market = undefined, delimiter: Str = undefined, marketType: Str = undefined): MarketInterface {
        if (market === undefined && marketId) {
            if (marketId in this.markets) {
                market = this.markets[marketId];
            } else if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const newMarketId = this.addHyphenBeforeUsdt (marketId);
                if (newMarketId in this.markets_by_id) {
                    const markets = this.markets_by_id[newMarketId];
                    const numMarkets = markets.length;
                    if (numMarkets > 0) {
                        if (this.markets_by_id[newMarketId][0]['id2'] === marketId) {
                            market = this.markets_by_id[newMarketId][0];
                        }
                    }
                }
            }
        }
        return super.safeMarket (marketId, market, delimiter, marketType);
    }

    addHyphenBeforeUsdt (symbol: string) {
        const uppercaseSymbol = symbol.toUpperCase ();
        const index = uppercaseSymbol.indexOf ('USDT');
        const symbolChar = this.safeString (symbol, index - 1);
        if (index > 0 && symbolChar !== '-') {
            return symbol.slice (0, index) + '-' + symbol.slice (index);
        }
        return symbol;
    }

    /**
     * @method
     * @name bydfi#fetchAccountAssets
     * @description Get account asset information
     * @see https://developers.bydfi.com/account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.walletType] wallet type: spot / fund
     * @param {string} [params.asset] asset currency, such as BTC, USDT
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchAccountAssets (params = {}) {
        const request = {};
        const walletType = this.safeString (params, 'walletType');
        const asset = this.safeString (params, 'asset');
        if (walletType) {
            request['walletType'] = walletType;
        }
        if (asset) {
            request['asset'] = asset;
        }
        const response = await this.privateGetV1AccountAssets (this.extend (request, params));
        return this.safeList (response, 'data', []);
    }

    /**
     * @method
     * @name bydfi#parseAccountAssets
     * @description Parse account balance response
     * @param {object} response API response data
     * @returns {object} standardized balance structure
     */
    parseAccountAssets (response) {
        const data = this.safeList (response, 'data', []);
        const result = {
            'info': data,
            'timestamp': this.milliseconds (),
            'datetime': this.iso8601 (this.milliseconds ()),
        };
        for (let i = 0; i < data.length; i++) {
            const asset = data[i];
            const walletType = this.safeString (asset, 'walletType'); // spot / fund
            const currencyId = this.safeString (asset, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            // Create different accounts for different wallet types
            const accountKey = walletType === 'spot' ? code : code + '_' + walletType;
            const account = this.account ();
            account['free'] = this.safeString (asset, 'available');    // Available balance
            account['used'] = this.safeString (asset, 'frozen');       // Frozen balance
            account['total'] = this.safeString (asset, 'total');       // Total balance
            result[accountKey] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name bydfi#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://developers.bydfi.com/en/account#asset-transfer-between-accounts
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from, source wallet type SPOT / SWAP / FUND
     * @param {string} toAccount account to transfer to, target wallet type SPOT / SWAP / FUND
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> {
        if (!code) {
            throw new BadRequest (this.id + ' transfer() requires a code parameter');
        }
        if (!amount) {
            throw new BadRequest (this.id + ' transfer() requires an amount parameter');
        }
        if (!fromAccount) {
            throw new BadRequest (this.id + ' transfer() requires a fromAccount parameter');
        }
        if (!toAccount) {
            throw new BadRequest (this.id + ' transfer() requires a toAccount parameter');
        }
        const request: Dict = {
            'asset': code,
            'fromType': fromAccount,
            'toType': toAccount,
            'amount': amount,
        };
        const response = await this.privatePostV1AccountTransfer (request);
        const currentTime = this.milliseconds ();
        return this.parseTransfer (this.extend (response, {
            'timestamp': currentTime,
            'datetime': this.iso8601 (currentTime),
            'amount': this.parseNumber (amount),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'code': code,
        }));
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
        const timestamp = this.safeInteger (transfer, 'timestamp');
        const fromAccount = this.safeString (transfer, 'fromAccount');
        const toAccount = this.safeString (transfer, 'toAccount');
        const code = this.safeString (transfer, 'code');
        return {
            'info': transfer,
            'id': this.safeStringN (transfer, [ 'transferId', 'id' ]),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': code,
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.safeBool (transfer, 'success') ? 'success' : 'error',
        };
    }

    /**
     * @method
     * @name bydfi#fetchTransfers
     * @description fetch transfer records
     * @see https://developers.bydfi.com/en/account#query-wallet-transfer-records
     * @param {string} code asset currency, e.g. BTC, USDT
     * @param {number} since start timestamp (milliseconds)
     * @param {int} limit not supported
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.endTime] end timestamp (milliseconds)
     * @param {number} [params.page] page number, starting from 1, default is 1
     * @param {number} [params.rows] number of records per page, default is 10
     * @returns {object[]} list of transfer records
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        if (!code) {
            throw new BadRequest (this.id + ' fetchTransfers() requires a code parameter');
        }
        if (!since) {
            throw new BadRequest (this.id + ' fetchTransfers() requires a since parameter');
        }
        const request = {
            'asset': code,
            'startTime': since,
        };
        const endTime = this.safeInteger (params, 'endTime');
        if (endTime) {
            request['endTime'] = endTime;
        } else {
            throw new BadRequest (this.id + ' fetchTransfers() requires an endTime parameter');
        }
        const page = this.safeInteger (params, 'page');
        if (page) {
            request['page'] = page;
        }
        const rows = this.safeInteger (params, 'rows');
        if (rows) {
            request['rows'] = rows;
        }
        const response = await this.privateGetV1AccountTransferRecords (request);
        return this.safeList (response, 'data', []);
    }

    /**
     * @method
     * @name bydfi#fetchDeposits
     * @description fetch spot deposit records
     * @see https://developers.bydfi.com/en/spot/account#query-deposit-records
     * @param {string} symbol asset currency, e.g. BTC, USDT
     * @param {number} since start timestamp (milliseconds)
     * @param {number} [limit] number of records to return, default is 500, maximum is 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.endTime] end timestamp (milliseconds)
     * @returns {object[]} list of deposit records
     */
    async fetchDeposits (symbol: Str = undefined, since: Int = undefined, limit: Int = 500, params = {}): Promise<Transaction[]> {
        if (!symbol) {
            throw new BadRequest (this.id + ' fetchDeposits() requires a symbol parameter');
        }
        if (!since) {
            throw new BadRequest (this.id + ' fetchDeposits() requires a since parameter');
        }
        const request = {
            'asset': symbol,
            'startTime': since,
            'limit': limit,
        };
        const endTime = this.safeInteger (params, 'endTime');
        if (endTime) {
            request['endTime'] = endTime;
        } else {
            throw new BadRequest (this.id + ' fetchDeposits() requires an endTime parameter');
        }
        // Check if time range exceeds 7 days
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // milliseconds in 7 days
        if ((endTime - since) > sevenDays) {
            throw new BadRequest (this.id + ' fetchDeposits() time range cannot exceed 7 days');
        }
        // Check if time range exceeds 6 months
        const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000; // milliseconds in 6 months
        if ((endTime - since) > sixMonths) {
            throw new BadRequest (this.id + ' fetchDeposits() time range cannot exceed 6 months');
        }
        const response = await this.privateGetV1SpotDepositRecords (request);
        return this.safeList (response, 'data', []);
    }

    /**
     * @method
     * @name bydfi#fetchWithdrawals
     * @description fetch spot withdraw records
     * @see https://developers.bydfi.com/en/spot/account#query-withdrawal-records
     * @param {string} symbol asset currency, e.g. BTC, USDT
     * @param {number} since start timestamp (milliseconds)
     * @param {number} [limit] number of records to return, default is 500, maximum is 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.endTime] end timestamp (milliseconds)
     * @returns {object[]} list of deposit records
     */
    async fetchWithdrawals (symbol: Str = undefined, since: Int = undefined, limit: Int = 500, params = {}): Promise<Transaction[]> {
        if (!symbol) {
            throw new BadRequest (this.id + ' fetchWithdrawals() requires a symbol parameter');
        }
        if (!since) {
            throw new BadRequest (this.id + ' fetchWithdrawals() requires a since parameter');
        }
        const request = {
            'asset': symbol,
            'startTime': since,
            'limit': limit,
        };
        const endTime = this.safeInteger (params, 'endTime');
        if (endTime) {
            request['endTime'] = endTime;
        } else {
            throw new BadRequest (this.id + ' fetchWithdrawals() requires an endTime parameter');
        }
        // Check if time range exceeds 7 days
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // milliseconds in 7 days
        if ((endTime - since) > sevenDays) {
            throw new BadRequest (this.id + ' fetchWithdrawals() time range cannot exceed 7 days');
        }
        // Check if time range exceeds 6 months
        const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000; // milliseconds in 6 months
        if ((endTime - since) > sixMonths) {
            throw new BadRequest (this.id + ' fetchWithdrawals() time range cannot exceed 6 months');
        }
        const response = await this.privateGetV1SpotWithdrawRecords (request);
        return this.safeList (response, 'data', []);
    }

    /**
     * @method
     * @name bydfi#fetchBalance
     * @description fetch account balance information
     * @see https://developers.bydfi.com/en/account#asset-inquiry
     * @see https://developers.bydfi.com/en/swap/user#asset-query
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] wallet type, ['spot', 'funding', 'W001]
     * @param {string} [params.asset] asset currency, e.g. BTC, USDT
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        const type = this.safeString (params, 'type');
        if (!type) {
            throw new BadRequest (this.id + ' fetchBalance() requires a type parameter');
        }
        if (type === 'spot' || type === 'fund') {
            const request = {
                'walletType': type,
            };
            const asset = this.safeString (params, 'asset');
            if (asset) {
                request['asset'] = asset;
            }
            const response = await this.privateGetV1AccountAssets (request);
            return this.parseSpotBalance (response);
        } else {
            const request = {
                'wallet': type,
            };
            const asset = this.safeString (params, 'asset');
            if (asset) {
                request['asset'] = asset;
            }
            const response = await this.privateGetV1SwapAccountBalance (request);
            return this.parseSwapBalance (response);
        }
    }

    parseSpotBalance (response): Balances {
        const list = this.safeList (response, 'data', []);
        const timestamp = this.milliseconds ();
        const result: Dict = {
            'info': list,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const currency = this.safeString (item, 'asset');
            const free = this.safeNumber (item, 'available');
            const used = this.safeNumber (item, 'frozen');
            const total = this.safeNumber (item, 'total');
            result[currency] = {
                'free': free,
                'used': used,
                'total': total,
            };
        }
        return result as Balances;
    }

    parseSwapBalance (response): Balances {
        const list = this.safeList (response, 'data', []);
        const timestamp = this.milliseconds ();
        const result: Dict = {
            'info': list,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const currency = this.safeString (item, 'asset');
            const free = this.safeNumber (item, 'availableBalance');
            const used = this.safeNumber (item, 'frozen');
            const total = this.safeNumber (item, 'balance');
            result[currency] = {
                'free': free,
                'used': used,
                'total': total,
            };
        }
        return result as Balances;
    }

    /**
     * @method
     * @name bydfi#fetchMarginMode
     * @description fetch swap margin type
     * @see https://developers.bydfi.com/en/swap/user#margin-mode-query
     * @param {string} symbol symbol, e.g. 'BTC-USDT'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] contract type, value can be FUTURE or DELIVERY
     * @param {string} [params.wallet] wallet identifier, e.g. 'W001'
     * @returns {object} an [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    async fetchMarginMode (symbol: string, params = {}): Promise<MarginMode> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const contractType = this.safeString (params, 'contractType');
        if (contractType) {
            request['contractType'] = contractType;
        } else {
            throw new BadRequest (this.id + ' fetchMarginMode() requires a contractType parameter');
        }
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet;
        } else {
            throw new BadRequest (this.id + ' fetchMarginMode() requires a wallet parameter');
        }
        const response = await this.privateGetV1SwapUserDataAssetsMargin (request);
        const res = this.safeDict (response, 'data', {});
        return {
            'info': res,
            'symbol': this.safeString (res, 'symbol'),
            'marginMode': this.safeString (res, 'marginType'),
        };
    }

    /**
     * @method
     * @name bydfi#setMarginMode
     * @description set margin mode
     * @see https://developers.bydfi.com/en/swap/user#change-margin-type-cross-margin
     * @param {string} marginMode margin mode, value can be ISOLATED or CROSS
     * @param {string} symbol symbol, e.g. 'BTC-USDT'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] contract type, value can be FUTURE or DELIVERY
     * @param {string} [params.wallet] wallet identifier, e.g. 'W001'
     * @returns {boolean} true if success, false if failed
     */
    async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}): Promise<boolean> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'marginType': marginMode,
        };
        const contractType = this.safeString (params, 'contractType');
        if (contractType) {
            request['contractType'] = contractType;
        } else {
            throw new BadRequest (this.id + ' setMarginMode() requires a contractType parameter');
        }
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet;
        } else {
            throw new BadRequest (this.id + ' setMarginMode() requires a wallet parameter');
        }
        const response = await this.privatePostV1SwapUserDataMarginType (request);
        return this.safeBool (response, 'success');
    }

    /**
     * @method
     * @name bydfi#fetchPositionMode
     * @description fetch swap position mode
     * @see https://developers.bydfi.com/en/swap/user#get-position-mode
     * @param {string} symbol symbol, e.g. 'BTC-USDT'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] contract type, value can be FUTURE or DELIVERY
     * @param {string} [params.wallet] wallet identifier, e.g. 'W001'
     * @param {string} [params.settleCoin] settle coin, e.g. 'USDT/USDC/USD'
     * @returns {object} object of position mode information
     */
    async fetchPositionMode (symbol: Str = undefined, params = {}) {
        const request = {};
        const contractType = this.safeString (params, 'contractType');
        if (contractType) {
            request['contractType'] = contractType;
        } else {
            throw new BadRequest (this.id + ' fetchPositionMode() requires a contractType parameter');
        }
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet;
        } else {
            throw new BadRequest (this.id + ' fetchPositionMode() requires a wallet parameter');
        }
        const settleCoin = this.safeString (params, 'settleCoin');
        if (wallet) {
            request['settleCoin'] = settleCoin;
        } else {
            throw new BadRequest (this.id + ' fetchPositionMode() requires a settleCoin parameter');
        }
        const response = await this.privateGetV1SwapUserDataPositionSideDual (request);
        return this.safeDict (response, 'data', {});
    }

    /**
     * @method
     * @name bydfi#setPositionMode
     * @description convert position side dual
     * @see https://developers.bydfi.com/en/swap/user#change-position-mode-dual
     * @param {boolean} hedged true, false; in dual position mode, true for hedge mode, false for one-way position mode
     * @param {string} symbol symbol, e.g. 'BTC-USDT'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] contract type, value can be FUTURE or DELIVERY
     * @param {string} [params.wallet] wallet identifier, e.g. 'W001'
     * @param {string} [params.positionType] position type, value can be HEDGE or ONEWAY
     * @returns {boolean} true if success, false if failed
     */
    async setPositionMode (hedged: boolean, symbol: Str = undefined, params = {}): Promise<boolean> {
        const request = {
            'positionType': hedged ? 'HEDGE' : 'ONEWAY',
        };
        const contractType = this.safeString (params, 'contractType');
        if (contractType) {
            request['contractType'] = contractType;
        } else {
            throw new BadRequest (this.id + ' setPositionMode() requires a contractType parameter');
        }
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet;
        } else {
            throw new BadRequest (this.id + ' setPositionMode() requires a wallet parameter');
        }
        const settleCoin = this.safeString (params, 'settleCoin');
        if (wallet) {
            request['settleCoin'] = settleCoin;
        } else {
            throw new BadRequest (this.id + ' fetchPositionMode() requires a settleCoin parameter');
        }
        const response = await this.privatePostV1SwapUserDataPositionSideDual (request);
        return this.safeBool (response, 'success');
    }

    /**
     * @method
     * @name bydfi#fetchLeverage
     * @description fetch leverage for single trading pair
     * @see https://developers.bydfi.com/en/swap/trade#get-leverage-for-single-trading-pair
     * @param {string} symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] string
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        if (!symbol) {
            throw new BadRequest (this.id + ' fetchLeverage() requires a symbol parameter');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        } else {
            throw new BadRequest (this.id + ' fetchLeverage() requires a wallet parameter');
        }
        const response = await this.privateGetV1SwapTradeLeverage (request);
        const res = this.safeDict (response, 'data', {});
        return {
            'info': res,
            'symbol': this.safeString (res, 'symbol'),
            'marginMode': '',
            'longLeverage': this.safeNumber (res, 'leverage'),
            'shortLeverage': this.safeNumber (res, 'leverage'),
        };
    }

    /**
     * @method
     * @name bydfi#setLeverage
     * @description set leverage for single trading pair
     * @see https://developers.bydfi.com/en/swap/trade#set-leverage-for-single-trading-pair
     * @param {number} leverage
     * @param {string} [symbol]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] string
     * @returns {boolean} true if success, false if failed
     */
    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}): Promise<boolean> {
        if (!leverage) {
            throw new BadRequest (this.id + ' setLeverage() requires a leverage parameter');
        }
        if (!symbol) {
            throw new BadRequest (this.id + ' setLeverage() requires a symbol parameter');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        } else {
            throw new BadRequest (this.id + ' setLeverage() requires a wallet parameter');
        }
        const response = await this.privatePostV1SwapTradeLeverage (request);
        return this.safeBool (response, 'success');
    }

    /**
     * @method
     * @name bydfi#createOrder
     * @description create an order on the exchange
     * @see https://developers.bydfi.com/swap/trade#placing-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be full filled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] string
     * @param {string} [params.positionSide] position direction, not required in one-way position mode, default and only can be BOTH; required in hedge mode, only LONG or SHORT
     * @param {boolean} [params.reduceOnly] true, false; default false in non-hedge mode; not accepted in hedge mode; not supported when using closePosition
     * @param {float} [params.quantity] order quantity, not supported when using closePosition
     * @param {string} [params.clientOrderId] user-defined order ID, cannot be repeated in pending orders. If empty, system will auto-assign
     * @param {float} [params.stopPrice] trigger price, only required for STOP, STOP_MARKET, TAKE_PROFIT, TAKE_PROFIT_MARKET orders
     * @param {boolean} [params.closePosition] true, false; close all positions after trigger, only supports STOP_MARKET and TAKE_PROFIT_MARKET; cannot be used with quantity; has built-in reduce-only effect, cannot be used with reduceOnly
     * @param {float} [params.activationPrice] trailing stop activation price, only required for TRAILING_STOP_MARKET, defaults to current market price when placing order (supports different workingType)
     * @param {float} [params.callbackRate] trailing stop callback rate, range [0.1, 5], where 1 represents 1%, only required for TRAILING_STOP_MARKET
     * @param {string} [params.timeInForce] 'GTC', 'FOK', 'POST_ONLY', 'IOC', 'TRAILING_STOP'
     * @param {string} [params.workingType] stopPrice trigger type: MARK_PRICE (mark price), CONTRACT_PRICE (latest contract price). Default CONTRACT_PRICE
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // 验证必需参数
        if (!symbol) {
            throw new BadRequest (this.id + ' createOrder() requires a symbol parameter');
        }
        if (!type) {
            throw new BadRequest (this.id + ' createOrder() requires a type parameter');
        }
        if (!side) {
            throw new BadRequest (this.id + ' createOrder() requires a side parameter');
        }
        // 验证价格参数
        if (type === 'limit' && !price) {
            throw new BadRequest (this.id + ' createOrder() requires a price parameter for limit orders');
        }
        if (type === 'limit' && price <= 0) {
            throw new BadRequest (this.id + ' createOrder() price must be greater than 0 for limit orders');
        }
        const request: Dict = {
            'symbol': market['id'],
            'type': type.toUpperCase (),
            'side': side.toUpperCase (),
        };
        if (price) {
            request['price'] = price;
        }
        if (amount) {
            request['quantity'] = amount;
        }
        // 处理额外参数
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        }
        const positionSide = this.safeString (params, 'positionSide');
        if (positionSide) {
            request['positionSide'] = positionSide.toUpperCase ();
        }
        const reduceOnly = this.safeBool (params, 'reduceOnly');
        if (reduceOnly) {
            request['reduceOnly'] = reduceOnly;
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId) {
            request['clientOrderId'] = clientOrderId;
        }
        const stopPrice = this.safeNumber (params, 'stopPrice');
        if (stopPrice) {
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
        }
        const closePosition = this.safeBool (params, 'closePosition');
        if (closePosition) {
            request['closePosition'] = closePosition;
        }
        const activationPrice = this.safeNumber (params, 'activationPrice');
        if (activationPrice) {
            request['activationPrice'] = this.priceToPrecision (symbol, activationPrice);
        }
        const callbackRate = this.safeNumber (params, 'callbackRate');
        if (callbackRate) {
            request['callbackRate'] = callbackRate;
        }
        const timeInForce = this.safeString (params, 'timeInForce');
        if (timeInForce) {
            request['timeInForce'] = timeInForce.toUpperCase ();
        }
        const workingType = this.safeString (params, 'workingType');
        if (workingType) {
            request['workingType'] = workingType.toUpperCase ();
        }
        const response = await this.privatePostV1SwapTradePlaceOrder (request);
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        return {
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'datetime': this.iso8601 (this.safeInteger (order, 'createTime')),
            'timestamp': this.safeInteger (order, 'createTime'),
            'lastTradeTimestamp': this.safeInteger (order, 'updateTime'),
            'lastUpdateTimestamp': this.safeInteger (order, 'updateTime'),
            'status': this.safeString (order, 'status'),
            'symbol': this.safeString (order, 'symbol'),
            'type': this.safeString (order, 'orderType'),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'side': this.safeString (order, 'side'),
            'price': this.safeNumber (order, 'price'),
            'average': this.safeNumber (order, 'avgPrice'),
            'amount': this.safeNumber (order, 'origQty'),
            'filled': this.safeNumber (order, 'executedQty'),
            'remaining': this.safeNumber (order, 'origQty') - this.safeNumber (order, 'executedQty'),
            'stopPrice': this.safeNumber (order, 'stopPrice'),
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'cost': this.safeNumber (order, 'cost'),
            'trades': [],
            'fee': {
                'cost': 0,
                'currency': this.safeString (order, 'quoteAsset'),
                'rate': 0,
            },
            'postOnly': this.safeBool (order, 'postOnly'),
            'info': order,
        };
    }

    /**
     * @method
     * @name bydfi#cancelOrder
     * @description cancel an order on the exchange
     * @see https://developers.bydfi.com/en/swap/trade#canceling-an-order
     * @param {string} id
     * @param {string} [symbol]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] string
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'clientOrderId': id,
            'symbol': market['id'],
        };
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        } else {
            throw new BadRequest (this.id + ' cancelOrder() requires a wallet parameter');
        }
        const response = await this.privatePostV1SwapTradeCancelOrder (request);
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data);
    }

    /**
     * @method
     * @name bydfi#editOrder
     * @description edit an order on the exchange
     * @see https://developers.bydfi.com/en/swap/trade#editing-an-order
     * @param {string} id
     * @param {string} symbol
     * @param {string} type
     * @param {string} side
     * @param {number} amount
     * @param {number} price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] string
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'clientOrderId': id,
            'symbol': market['id'],
            'side': side.toUpperCase (),
        };
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        } else {
            throw new BadRequest (this.id + ' editOrder() requires a wallet parameter');
        }
        if (price) {
            request['price'] = price;
        }
        if (amount) {
            request['quantity'] = amount;
        }
        const response = await this.privatePostV1SwapTradeEditOrder (request);
        const data = this.safeDict (response, 'data', {});
        return this.parseOrder (data);
    }

    /**
     * @method
     * @name bydfi#cancelBatchOrders
     * @description cancel multiple orders on the exchange
     * @see https://developers.bydfi.com/en/swap/trade#canceling-multiple-orders
     * @param {string} [symbol]
     * @param {string} [wallet]
     * @param {string[]} [ids]
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelBatchOrders (symbol: Str = undefined, wallet: string = undefined, ids: Strings = undefined) {
        if (!symbol) {
            throw new BadRequest (this.id + ' cancelBatchOrders() requires a symbol parameter');
        }
        if (!wallet) {
            throw new BadRequest (this.id + ' cancelBatchOrders() requires a wallet parameter');
        }
        if (!ids) {
            throw new BadRequest (this.id + ' cancelBatchOrders() requires an ids parameter');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'wallet': wallet,
            'clientOrderIds': ids,
        };
        const response = await this.privatePostV1SwapTradeBatchCancelOrder (request);
        return this.parseOrderList (response);
    }

    /**
     * @method
     * @name bydfi#cancelAllOrders
     * @description cancel all orders on the exchange
     * @see https://developers.bydfi.com/en/swap/trade#canceling-all-orders
     * @param {string} [symbol]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] string
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        if (!symbol) {
            throw new BadRequest (this.id + ' cancelAllOrders() requires a symbol parameter');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        }
        const response = await this.privatePostV1SwapTradeCancelAllOrder (request);
        const data = this.safeList (response, 'data', []);
        return this.parseOrderList (data);
    }

    parseOrderList (data) {
        const orders = [];
        for (let i = 0; i < data.length; i++) {
            orders.push (this.parseOrder (data[i]));
        }
        return orders;
    }

    /**
     * @method
     * @name bydfi#editBatchOrders
     * @description edit multiple orders on the exchange
     * @see https://developers.bydfi.com/en/swap/trade#editing-multiple-orders
     * @param {string} wallet
     * @param {object[]} orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editBatchOrders (wallet: string, orders: List[]) {
        if (!wallet) {
            throw new BadRequest (this.id + ' editBatchOrders() requires a wallet parameter');
        }
        if (!orders) {
            throw new BadRequest (this.id + ' editBatchOrders() requires an orders parameter');
        }
        if (orders.length > 5) {
            throw new BadRequest (this.id + ' editBatchOrders() requires at most 5 orders');
        }
        await this.loadMarkets ();
        for (let i = 0; i < orders.length; i++) {
            const market = this.market (orders[i]['symbol']);
            orders[i]['symbol'] = market['id'];
            const clientOrderId = this.safeString (orders[i], 'clientOrderId');
            if (!clientOrderId) {
                throw new BadRequest (this.id + ' editBatchOrders() requires a clientOrderId parameter');
            }
            const symbol = this.safeString (orders[i], 'symbol');
            if (!symbol) {
                throw new BadRequest (this.id + ' editBatchOrders() requires a symbol parameter');
            }
            const side = this.safeString (orders[i], 'side');
            if (!side) {
                throw new BadRequest (this.id + ' editBatchOrders() requires a side parameter');
            }
        }
        const request: Dict = {
            'wallet': wallet,
            'editOrders': orders,
        };
        const response = await this.privatePostV1SwapTradeBatchEditOrder (request);
        const data = this.safeList (response, 'data', []);
        return this.parseOrderList (data);
    }

    /**
     * @method
     * @name bydfi#fetchOpenOrders
     * @description fetch all open orders
     * @see https://developers.bydfi.com/en/swap/trade#pending-order-query
     * @param {string} symbol unified market symbol
     * @param {int} [since] not supported
     * @param {int} [limit] not supported
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] wallet
     * @param {string} [params.clientOrderId] clientOrderId
     * @param {string} [params.orderId] orderId
     * @returns {object[]} a list of [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        } else {
            throw new BadRequest (this.id + ' fetchOpenOrders() requires a symbol parameter');
        }
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        } else {
            throw new BadRequest (this.id + ' fetchOpenOrders() requires a wallet parameter');
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId) {
            request['clientOrderId'] = clientOrderId;
        }
        const orderId = this.safeString (params, 'orderId');
        if (orderId) {
            request['orderId'] = orderId;
        }
        const response = await this.privateGetV1SwapTradeOpenOrder (request);
        const data = this.safeList (response, 'data', []);
        const orders = [];
        for (let i = 0; i < data.length; i++) {
            orders.push (this.parseOrder (data[i]));
        }
        return orders;
    }

    /**
     * @method
     * @name bydfi#fetchPlanOrders
     * @description fetch all plan orders
     * @see https://developers.bydfi.com/en/swap/trade#planned-order-query
     * @param {string} symbol unified market symbol
     * @param {int} [since] not supported
     * @param {int} [limit] not supported
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] wallet
     * @param {string} [params.clientOrderId] clientOrderId
     * @param {string} [params.orderId] orderId
     * @returns {object[]} a list of [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchPlanOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        } else {
            throw new BadRequest (this.id + ' fetchPlanOrders() requires a symbol parameter');
        }
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        } else {
            throw new BadRequest (this.id + ' fetchPlanOrders() requires a wallet parameter');
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId) {
            request['clientOrderId'] = clientOrderId;
        }
        const orderId = this.safeString (params, 'orderId');
        if (orderId) {
            request['orderId'] = orderId;
        }
        const response = await this.privateGetV1SwapTradePlanOrder (request);
        const data = this.safeList (response, 'data', []);
        const orders = [];
        for (let i = 0; i < data.length; i++) {
            orders.push (this.parseOrder (data[i]));
        }
        return orders;
    }

    /**
     * @method
     * @name bydfi#fetchOrders
     * @description fetch all orders
     * @see https://developers.bydfi.com/en/swap/trade#historical-orders-query
     * @param {string} symbol unified market symbol
     * @param {int} [since] startTime, query time range cannot exceed 7 days, only supports querying data from the last 6 months
     * @param {int} [limit] limit, default 500, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] wallet
     * @param {string} [params.contractType] contract type, value can be FUTURE or DELIVERY
     * @param {string} [params.type] order type, LIMIT/MARKET/LIQ/LIMIT_CLOSE/MARKET_CLOSE/STOP/TAKE_PROFIT/STOP_MARKET/TAKE_PROFIT_MARKET/TRAILING_STOP_MARKET
     * @param {int} [params.endTime] endTime
     * @returns {object[]} a list of [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = 500, params = {}): Promise<Order[]> {
        const request: Dict = {};
        const contractType = this.safeString (params, 'contractType');
        if (contractType) {
            request['contractType'] = contractType;
        } else {
            throw new BadRequest (this.id + ' fetchOrders() requires a contractType parameter');
        }
        await this.loadMarkets ();
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since) {
            request['startTime'] = since;
        }
        if (limit) {
            request['limit'] = limit;
        }
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        }
        const type = this.safeString (params, 'type');
        if (type) {
            request['type'] = type;
        }
        const endTime = this.safeInteger (params, 'endTime');
        if (endTime) {
            request['endTime'] = endTime;
        }
        const response = await this.privateGetV1SwapTradeHistoryOrder (request);
        const data = this.safeList (response, 'data', []);
        const orders = [];
        for (let i = 0; i < data.length; i++) {
            orders.push (this.parseOrder (data[i]));
        }
        return orders;
    }

    /**
     * @method
     * @name bydfi#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://developers.bydfi.com/en/swap/trade#historical-trades-query
     * @param {string} symbol unified market symbol
     * @param {int} [since] startTime, query time range cannot exceed 7 days, only supports querying data from the last 6 months
     * @param {int} [limit] limit, default 500, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] wallet
     * @param {string} [params.contractType] contract type, value can be FUTURE or DELIVERY
     * @param {string} [params.type] order type, LIMIT/MARKET/LIQ/LIMIT_CLOSE/MARKET_CLOSE/STOP/TAKE_PROFIT/STOP_MARKET/TAKE_PROFIT_MARKET/TRAILING_STOP_MARKET
     * @param {int} [params.endTime] endTime
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const request: Dict = {};
        const contractType = this.safeString (params, 'contractType');
        if (contractType) {
            request['contractType'] = contractType;
        } else {
            throw new BadRequest (this.id + ' fetchOrders() requires a contractType parameter');
        }
        await this.loadMarkets ();
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since) {
            request['startTime'] = since;
        }
        if (limit) {
            request['limit'] = limit;
        }
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        }
        const type = this.safeString (params, 'type');
        if (type) {
            request['type'] = type;
        }
        const endTime = this.safeInteger (params, 'endTime');
        if (endTime) {
            request['endTime'] = endTime;
        }
        const response = await this.privateGetV1SwapTradeHistoryTrade (request);
        const data = this.safeList (response, 'data', []);
        const trades = [];
        for (let i = 0; i < data.length; i++) {
            trades.push (this.parseTrade (data[i]));
        }
        return trades;
    }

    /**
     * @method
     * @name bydfi#fetchPositionHistory
     * @description fetch historical position profit and loss records for all trading pairs
     * @see https://developers.bydfi.com/en/swap/trade#query-historical-position-profit-and-loss-records
     * @param {string} symbol unified market symbol
     * @param {int} [since] startTime
     * @param {int} [limit] limit, default 500, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] wallet
     * @param {string} [params.contractType] contract type, value can be FUTURE or DELIVERY
     * @param {string} [params.type] order type, LIMIT/MARKET/LIQ/LIMIT_CLOSE/MARKET_CLOSE/STOP/TAKE_PROFIT/STOP_MARKET/TAKE_PROFIT_MARKET/TRAILING_STOP_MARKET
     * @param {int} [params.endTime] endTime
     * @returns {object[]} a list of [trade structure]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchPositionHistory (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        const request: Dict = {};
        const contractType = this.safeString (params, 'contractType');
        if (contractType) {
            request['contractType'] = contractType;
        } else {
            throw new BadRequest (this.id + ' fetchPositionHistory() requires a contractType parameter');
        }
        await this.loadMarkets ();
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since) {
            request['startTime'] = since;
        }
        if (limit) {
            request['limit'] = limit;
        }
        const wallet = this.safeString (params, 'wallet');
        if (wallet) {
            request['wallet'] = wallet.toUpperCase ();
        }
        const type = this.safeString (params, 'type');
        if (type) {
            request['type'] = type;
        }
        const endTime = this.safeInteger (params, 'endTime');
        if (endTime) {
            request['endTime'] = endTime;
        }
        const response = await this.privateGetV1SwapTradePositionHistory (request);
        const data = this.safeList (response, 'data', []);
        const positions = [];
        for (let i = 0; i < data.length; i++) {
            positions.push (this.parsePosition (data[i]));
        }
        return positions;
    }

    /**
     * @method
     * @name bydfi#editLeverageMargin
     * @description modify leverage and margin type with one click
     * @see https://developers.bydfi.com/en/swap/trade#modify-leverage-and-margin-type-with-one-click
     * @param {string} wallet
     * @param {string} contractType
     * @param {string} settleCoin
     * @param {number} leverage
     * @param {string} marginType
     * @returns {boolean} true if successful
     */
    async editLeverageMargin (wallet: string, contractType: string, settleCoin: string, leverage: number, marginType: string): Promise<boolean> {
        if (!wallet) {
            throw new BadRequest (this.id + ' editLeverageMargin() requires a wallet parameter');
        }
        if (!contractType) {
            throw new BadRequest (this.id + ' editLeverageMargin() requires a contractType parameter');
        }
        if (!settleCoin) {
            throw new BadRequest (this.id + ' editLeverageMargin() requires a settleCoin parameter');
        }
        if (!leverage) {
            throw new BadRequest (this.id + ' editLeverageMargin() requires a leverage parameter');
        }
        if (!marginType) {
            throw new BadRequest (this.id + ' editLeverageMargin() requires a marginType parameter');
        }
        const request: Dict = {
            'wallet': wallet.toUpperCase (),
            'contractType': contractType,
            'settleCoin': settleCoin,
            'leverage': leverage,
            'marginType': marginType,
        };
        const response = await this.privatePostV1SwapTradeBatchLeverageMargin (request);
        return response['success'];
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        return {
            'symbol': position['symbol'],
            'id': position['id'],
            'info': position,
            'timestamp': position['createTime'],
            'datetime': this.iso8601 (position['createTime']),
            'side': position['side'],
        };
    }

    /**
     * @method
     * @name bydfi#fetchPositionsForSymbol
     * @description fetch position list for a symbol
     * @see https://developers.bydfi.com/en/swap/trade#query-position-information
     * @param {string} symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] contract type, value can be FUTURE or DELIVERY
     * @param {string} [params.settleCoin] settleCoin
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositionsForSymbol (symbol: string, params = {}): Promise<Position[]> {
        const request: Dict = {};
        const contractType = this.safeString (params, 'contractType');
        if (contractType) {
            request['contractType'] = contractType;
        } else {
            throw new BadRequest (this.id + ' fetchPosition() requires a contractType parameter');
        }
        const settleCoin = this.safeString (params, 'settleCoin');
        if (settleCoin) {
            request['settleCoin'] = settleCoin;
        }
        await this.loadMarkets ();
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetV1SwapTradePositions (request);
        const data = this.safeList (response, 'data');
        return this.parsePositionList (data);
    }

    parsePositionList (positions: Dict[]): Position[] {
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            result.push ({
                'symbol': positions[i]['symbol'],
                'side': positions[i]['side'],
                'info': positions[i],
                'volume': positions[i]['volume'],
                'avgPrice': positions[i]['avgPrice'],
                'liqPrice': positions[i]['liqPrice'],
                'markPrice': positions[i]['markPrice'],
                'unPnl': positions[i]['unPnl'],
                'positionMargin': positions[i]['positionMargin'],
                'settleCoin': positions[i]['settleCoin'],
                'im': positions[i]['im'],
                'mm': positions[i]['mm'],
            });
        }
        return result;
    }

    /**
     * @method
     * @name bydfi#fetchAgentTeams
     * @description Query information about the KOL's subordinate team
     * @see https://developers.bydfi.com/en/agent/#query-agent-subordinate-team-information
     * @returns {object} an object of team structure
     */
    async fetchAgentTeams () {
        const response = await this.privateGetV1AgentTeams ();
        const data = this.safeDict (response, 'data');
        return data;
    }

    /**
     * @method
     * @name bydfi#fetchAgentInvitationCodeLinks
     * @description Query KOL Invitation Code List
     * @see https://developers.bydfi.com/en/agent/#query-agent-invitation-code-list
     * @returns {object[]} a list of agent link structure
     */
    async fetchAgentInvitationCodeLinks () {
        const response = await this.privateGetV1AgentAgentLinks ();
        const data = this.safeList (response, 'data');
        return data;
    }

    /**
     * @method
     * @name bydfi#fetchAgentRegularOverview
     * @description Query KOL Direct Client Data List
     * @see https://developers.bydfi.com/en/agent/#query-agent-direct-client-data-list
     * @param {number} page page number, default 1
     * @param {number} rows rows per page, default 10
     * @returns {object} an object of regular overview structure
     */
    async fetchAgentRegularOverview (page: number, rows: number) {
        const request: Dict = {};
        if (page) {
            request['page'] = page;
        } else {
            request['page'] = 1;
        }
        if (rows) {
            request['rows'] = rows;
        } else {
            request['rows'] = 10;
        }
        const response = await this.privateGetV1AgentRegularOverview (request);
        const data = this.safeDict (response, 'data');
        return data;
    }

    /**
     * @method
     * @name bydfi#fetchAgentSubOverview
     * @description Query KOL Subordinate Affiliate List
     * @see https://developers.bydfi.com/en/agent/#query-kol-subordinate-affiliate-list
     * @param {number} page page number, default 1
     * @param {number} rows rows per page, default 10
     * @returns {object} an object of subordinate overview structure
     */
    async fetchAgentSubOverview (page: number, rows: number) {
        const request: Dict = {};
        if (page) {
            request['page'] = page;
        } else {
            request['page'] = 1;
        }
        if (rows) {
            request['rows'] = rows;
        } else {
            request['rows'] = 10;
        }
        const response = await this.privateGetV1AgentAgentSubOverview (request);
        const data = this.safeDict (response, 'data');
        return data;
    }

    /**
     * @method
     * @name bydfi#fetchAgentPartnerUserDeposit
     * @description Check the recharge amount of KOL within one year
     * @see https://developers.bydfi.com/en/agent/#check-the-recharge-amount-of-kol-within-one-year
     * @returns {object} an object of deposit structure
     */
    async fetchAgentPartnerUserDeposit () {
        const response = await this.privateGetV1AgentPartenerUserDeposit ();
        const data = this.safeDict (response, 'data');
        return data;
    }

    /**
     * @method
     * @name bydfi#fetchAgentPartnerUsersData
     * @description Query KOL Subordinate Deposit and Trading Data
     * @see https://developers.bydfi.com/en/agent/#query-kol-subordinate-deposit-and-trading-data
     * @returns {object[]} a list of deposit structure
     */
    async fetchAgentPartnerUsersData () {
        const response = await this.privateGetV1AgentPartenerUsersData ();
        const data = this.safeList (response, 'data');
        return data;
    }

    /**
     * @method
     * @name bydfi#fetchAgentAffiliateUids
     * @description Get Affiliate UIDs Real-time retrieval is required (mandatory), and there should be no restrictions on the retrieval deadline.
     * @see https://developers.bydfi.com/en/agent/#get-affiliate-uids
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.uid] uid
     * @param {number} [params.startTime] start timestamp in UTC
     * @param {number} [params.endTime] end timestamp in UTC,StartTime and endTime cannot exceed 180 days
     * @param {number} [params.page] page number, default 1
     * @param {number} [params.rows] rows per page, default 10
     * @returns {object[]} a list of userinfo structure
     */
    async fetchAgentAffiliateUids (params = {}) {
        const request: Dict = {};
        const uid = this.safeInteger (params, 'uid');
        if (uid) {
            request['uid'] = uid;
        }
        const startTime = this.safeInteger (params, 'startTime');
        if (startTime) {
            request['startTime'] = startTime;
        }
        const endTime = this.safeInteger (params, 'endTime');
        if (endTime) {
            request['endTime'] = endTime;
        }
        const page = this.safeInteger (params, 'page');
        if (page) {
            request['page'] = page;
        } else {
            request['page'] = 1;
        }
        const rows = this.safeInteger (params, 'rows');
        if (rows) {
            request['rows'] = rows;
        } else {
            request['rows'] = 10;
        }
        const response = await this.privateGetV1AgentAffiliateUids (request);
        const data = this.safeList (response, 'data');
        return data;
    }

    /**
     * @method
     * @name bydfi#fetchAgentAffiliateCommission
     * @description Get Affiliate Commission
     * @see https://developers.bydfi.com/en/agent/#get-affiliate-commission
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.uid] uid
     * @param {number} [params.startTime] start timestamp in UTC
     * @param {number} [params.endTime] end timestamp in UTC,StartTime and endTime cannot exceed 180 days
     * @param {number} [params.coin] USDT or BTC...
     * @param {number} [params.productType] SPOT or SWAP...
     * @param {number} [params.page] page number, default 1
     * @param {number} [params.rows] rows per page, default 10
     * @returns {object[]} a list of userinfo structure
     */
    async fetchAgentAffiliateCommission (params = {}) {
        const request: Dict = {};
        const uid = this.safeInteger (params, 'uid');
        if (uid) {
            request['uid'] = uid;
        }
        const startTime = this.safeInteger (params, 'startTime');
        if (startTime) {
            request['startTime'] = startTime;
        }
        const endTime = this.safeInteger (params, 'endTime');
        if (endTime) {
            request['endTime'] = endTime;
        }
        const coin = this.safeString (params, 'coin');
        if (coin) {
            request['coin'] = coin;
        }
        const productType = this.safeString (params, 'productType');
        if (productType) {
            request['productType'] = productType;
        }
        const page = this.safeInteger (params, 'page');
        if (page) {
            request['page'] = page;
        } else {
            request['page'] = 1;
        }
        const rows = this.safeInteger (params, 'rows');
        if (rows) {
            request['rows'] = rows;
        } else {
            request['rows'] = 10;
        }
        const response = await this.privateGetV1AgentAffiliateCommission (request);
        const data = this.safeList (response, 'data');
        return data;
    }

    /**
     * @method
     * @name bydfi#fetchAgentInternalWithdrawalStatus
     * @description Get Internal Withdrawal Status
     * @see https://developers.bydfi.com/en/agent/#get-internal-withdrawal-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {number} [params.withdrawID] withdraw ID
     * @param {number} [params.startTime] start timestamp in UTC
     * @param {number} [params.endTime] end timestamp in UTC,StartTime and endTime cannot exceed 180 days
     * @param {number} [params.coin] USDT or BTC...
     * @param {number} [params.page] page number, default 1
     * @param {number} [params.rows] rows per page, default 10
     * @returns {object[]} a list of userinfo structure
     */
    async fetchAgentInternalWithdrawalStatus (params = {}) {
        const request: Dict = {};
        const withdrawID = this.safeInteger (params, 'withdrawID');
        if (withdrawID) {
            request['withdrawID'] = withdrawID;
        }
        const startTime = this.safeInteger (params, 'startTime');
        if (startTime) {
            request['startTime'] = startTime;
        }
        const endTime = this.safeInteger (params, 'endTime');
        if (endTime) {
            request['endTime'] = endTime;
        }
        const coin = this.safeString (params, 'coin');
        if (coin) {
            request['coin'] = coin;
        }
        const page = this.safeInteger (params, 'page');
        if (page) {
            request['page'] = page;
        } else {
            request['page'] = 1;
        }
        const rows = this.safeInteger (params, 'rows');
        if (rows) {
            request['rows'] = rows;
        } else {
            request['rows'] = 10;
        }
        const response = await this.privateGetV1AgentInternalWithdrawalStatus (request);
        const data = this.safeList (response, 'data');
        return data;
    }

    /**
     * @method
     * @name bydfi#agentInternalWithdrawal
     * @description Internal Withdrawal
     * @see https://developers.bydfi.com/en/agent/#internal-withdrawal
     * @param {string} coin USDT or BTC...
     * @param {number} amount
     * @returns {object} an object of withdrawal structure
     */
    async agentInternalWithdrawal (coin: string, amount: number) {
        if (!coin) {
            throw new BadRequest (this.id + ' agentInternalWithdrawal() requires a coin parameter');
        }
        if (!amount) {
            throw new BadRequest (this.id + ' agentInternalWithdrawal() requires a amount parameter');
        }
        const request: Dict = {
            'coin': coin,
            'amount': amount,
        };
        const response = await this.privatePostV1AgentInternalWithdrawal (request);
        return this.safeBool (response, 'success');
    }

    /**
     * @method
     * @name bydfi#fetchSwapMarketRiskLimit
     * @description Returning risk limits
     * @see https://developers.bydfi.com/en/swap/market#risk-limit
     * @param {string} [symbol] symbol
     * @returns {object[]} a list of risk limit structure
     */
    async fetchSwapMarketRiskLimit (symbol: string) {
        if (!symbol) {
            throw new BadRequest (this.id + ' fetchSwapMarketRiskLimit() requires a symbol parameter');
        }
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.publicGetV1SwapMarketRiskLimit (request);
        const data = this.safeList (response, 'data');
        return data;
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const errorCode = this.safeInteger (response, 'code');
        if (errorCode !== 200) {
            const feedback = this.id + ' ' + body;
            const message = this.safeString2 (response, 'key', 'msg');
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            const status = code.toString ();
            this.throwExactlyMatchedException (this.exceptions['exact'], status, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]) + '/' + path;
        headers = {
            'Content-Type': 'application/json',
        };
        let signBody = body;
        if (method.toUpperCase () !== 'POST') {
            if (Object.keys (params).length) {
                url += '?' + this.rawencode (params);
            }
        } else {
            signBody = JSON.stringify (params);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            const parts = this.rawencode (params).split ('&');
            parts.sort ();
            const parseParams = parts.join ('&');
            let messageString = this.apiKey + timestamp;
            if (method === 'GET') {
                messageString = messageString + parseParams;
            }
            if (signBody) {
                messageString = messageString + signBody;
            }
            const signature = this.hmac (messageString, this.secret, sha256);
            headers['X-API-KEY'] = this.apiKey;
            headers['X-API-TIMESTAMP'] = timestamp;
            headers['X-API-SIGNATURE'] = signature;
        }
        return { 'url': url, 'method': method, 'body': signBody, 'headers': headers };
    }
}

