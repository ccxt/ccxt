
//  ---------------------------------------------------------------------------

import Exchange from './abstract/dreamdex.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, NotSupported, OrderNotFound, PermissionDenied, RateLimitExceeded } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type { Dict, int, Int, Str, Strings, Num, Market, Currencies, Order, OrderType, OrderSide, Balances, OrderBook, Ticker, Tickers, Trade, OHLCV } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class dreamdex
 * @augments Exchange
 * @description dreamDEX - a non-custodial decentralized exchange on the Somnia network (chain ID 5031)
 */
export default class dreamdex extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'dreamdex',
            'name': 'dreamDEX',
            'countries': [],
            'version': 'v0',
            'rateLimit': 200,
            'certified': false,
            'pro': true,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelWithdraw': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopLossOrder': false,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': true,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrice': false,
                'fetchMarkPrices': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
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
                'setPositionMode': false,
                'signIn': true,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://dreamdex.io/favicon.ico',
                'api': {
                    'rest': 'https://api.dreamdex.io',
                },
                'www': 'https://dreamdex.io',
                'doc': [
                    'https://api.dreamdex.io/.well-known/oapi.json',
                    'https://api.dreamdex.io/.well-known/async.json',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'v0/currencies': 1,
                        'v0/markets': 1,
                        'v0/markets/{symbol}/tickers': 1,
                        'v0/markets/{symbol}/trades': 1,
                        'v0/markets/{symbol}/candles': 1,
                        'v0/orderbooks': 1,
                        'v0/tickers': 1,
                        'v0/auth/nonce': 1,
                        'v0/markets/{symbol}/builder/max-fee': 1,
                    },
                    'post': {
                        'v0/auth/login': 1,
                    },
                },
                'private': {
                    'get': {
                        'v0/orders': 1,
                        'v0/markets/{symbol}/orders': 1,
                        'v0/markets/{symbol}/orders/{id}': 1,
                        'v0/markets/{symbol}/trades/mine': 1,
                        'v0/markets/{symbol}/vault/balance': 1,
                        'v0/markets/{symbol}/stop-orders': 1,
                        'v0/markets/{symbol}/builder/approval': 1,
                    },
                    'post': {
                        'v0/markets/{symbol}/orders': 1,
                        'v0/markets/{symbol}/vault/deposit': 1,
                        'v0/markets/{symbol}/vault/withdraw': 1,
                        'v0/markets/{symbol}/vault/approve': 1,
                        'v0/markets/{symbol}/stop-orders': 1,
                        'v0/markets/{symbol}/builder/approve': 1,
                    },
                    'patch': {
                        'v0/markets/{symbol}/orders/{id}/reduce': 1,
                    },
                    'delete': {
                        'v0/markets/{symbol}/orders/{id}': 1,
                        'v0/markets/{symbol}/stop-orders/{id}': 1,
                    },
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': true,
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
                        'leverage': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': false,
                        'selfTradePrevention': true,
                        'trailing': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'commonCurrencies': {},
            'precisionMode': TICK_SIZE,
            'options': {
                'authToken': undefined,
                'authTokenExpires': undefined,
                'chainId': 5031,
                'builderFee': true,
                'builder': '0x000000000000000000000000000000000000dEaD', // TODO(maintainers): replace placeholder builder wallet before merge
                'builderFeeBpsTimes1k': 1000, // 1 bps (unit: 1000 = 1 bps)
            },
            'exceptions': {
                'exact': {
                    'not_implemented': NotSupported,
                    'invalid_order_id': BadRequest,
                    'order_not_found': OrderNotFound,
                    'insufficient_balance': InsufficientFunds,
                    'invalid_amount': InvalidOrder,
                    'invalid_price': InvalidOrder,
                    'invalid_market': BadSymbol,
                    'market_not_found': BadSymbol,
                    'rate_limit_exceeded': RateLimitExceeded,
                    'permission_denied': PermissionDenied,
                },
                'broad': {
                    'authorization failed': AuthenticationError,
                    'insufficient': InsufficientFunds,
                    'not found': OrderNotFound,
                },
            },
        });
    }

    /**
     * @method
     * @name dreamdex#fetchCurrencies
     * @description fetches all available currencies on the exchange
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetV0Currencies (params);
        //
        //     {
        //         "currencies": [
        //             { "id": "0x28f34...", "code": "SOMI", "name": "Somnia Token", "decimals": 18 },
        //             { "id": "0x00000...", "code": "USDso", "name": "USD Somnia", "decimals": 18 }
        //         ]
        //     }
        //
        const currencies = this.safeList (response, 'currencies', []);
        const result: Dict = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const decimals = this.safeInteger (currency, 'decimals');
            let precision = undefined;
            if (decimals !== undefined) {
                precision = this.parseNumber (this.parsePrecision (this.numberToString (decimals)));
            }
            result[code] = this.safeCurrencyStructure ({
                'id': id,
                'code': code,
                'name': name,
                'type': 'crypto',
                'active': true,
                'deposit': true,
                'withdraw': true,
                'fee': undefined,
                'precision': precision,
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
                'networks': {},
                'info': currency,
            });
        }
        return result;
    }

    /**
     * @method
     * @name dreamdex#fetchMarkets
     * @description retrieves data on all markets for dreamDEX
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Market[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV0Markets (params);
        //
        //     {
        //         "markets": [
        //             {
        //                 "symbol": "SOMI:USDso",
        //                 "base": "0x7747128FAF46b8dC3F2f64Bbad80242534D2f042",
        //                 "quote": "0xB4AFC6030660AFE516A79cA578AED32903A2C440",
        //                 "baseDecimals": 18,
        //                 "quoteDecimals": 6,
        //                 "contract": "0x914eDb19d187403F6e2b061CD92FF68CC795EA71",
        //                 "tickSize": "0.00001",
        //                 "lotSize": "0.000001"
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList (response, 'markets', []);
        return this.parseMarkets (markets);
    }

    parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'symbol');
        // symbol is "BASE:QUOTE" using exchange currency codes (e.g. "SOMI:USDso")
        // market.base/quote hold on-chain token contract addresses (preserved in info)
        // info.contract holds the pool/market contract address
        const parts = id.split (':');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.parseNumber ('0'),
            'maker': this.parseNumber ('0'),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (market, 'lotSize', this.parseNumber (this.parsePrecision (this.safeString (market, 'baseDecimals')))),
                'price': this.safeNumber (market, 'tickSize', this.parseNumber (this.parsePrecision (this.safeString (market, 'quoteDecimals')))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'minQuantity'),
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
     * @name dreamdex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbols': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetV0Orderbooks (this.extend (request, params));
        //
        //     {
        //         "orderbooks": [
        //             {
        //                 "symbol": "SOMI:USDso",
        //                 "timestamp": 1765534169841,
        //                 "bids": [ { "price": "1.24", "quantity": "500" } ],
        //                 "asks": [ { "price": "1.26", "quantity": "300" } ],
        //                 "nonce": 42
        //             }
        //         ]
        //     }
        //
        const orderbooks = this.safeList (response, 'orderbooks', []);
        const data = this.safeDict (orderbooks, 0, {});
        const timestamp = this.safeInteger (data, 'timestamp');
        const orderbook = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'quantity');
        orderbook['nonce'] = this.safeInteger (data, 'nonce');
        return orderbook;
    }

    /**
     * @method
     * @name dreamdex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information for a specific market
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV0MarketsSymbolTickers (this.extend (request, params));
        //
        //     {
        //         "symbols": [
        //             { "symbol": "SOMI:USDso", "timestamp": 1765534169841, "open": "1.20", "high": "1.30", "low": "1.18", "close": "1.25", "volume": "1000" }
        //         ]
        //     }
        //
        const symbols = this.safeList (response, 'symbols', []);
        const ticker = this.safeDict (symbols, 0, {});
        return this.parseTicker (ticker, market);
    }

    /**
     * @method
     * @name dreamdex#fetchTickers
     * @description fetches price tickers for multiple markets
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string[]|undefined} [symbols] unified market symbols to fetch tickers for, all tickers are returned if not specified
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request: Dict = {};
        if (symbols !== undefined) {
            const marketIds = [];
            for (let i = 0; i < symbols.length; i++) {
                const market = this.market (symbols[i]);
                marketIds.push (market['id']);
            }
            request['symbols'] = marketIds.join (',');
        }
        const response = await this.publicGetV0Tickers (this.extend (request, params));
        //
        //     {
        //         "symbols": [
        //             { "symbol": "SOMI:USDso", "timestamp": 1765534169841, "open": "1.20", "high": "1.30", "low": "1.18", "close": "1.25", "volume": "1000" }
        //         ]
        //     }
        //
        const tickers = this.safeList (response, 'symbols', []);
        return this.parseTickers (tickers, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "symbol": "SOMI:USDso",
        //         "timestamp": 1765534169841,
        //         "open": "1.20",
        //         "high": "1.30",
        //         "low": "1.18",
        //         "close": "1.25",
        //         "volume": "1000"
        //     }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market, ':');
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const close = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open'),
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name dreamdex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV0MarketsSymbolTrades (this.extend (request, params));
        //
        //     {
        //         "symbol": "SOMI:USDso",
        //         "trades": [
        //             { "id": "t1", "timestamp": 1765534169841, "symbol": "SOMI:USDso", "side": "buy", "price": "1.25", "amount": "100", "cost": "125" }
        //         ]
        //     }
        //
        const trades = this.safeList (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    /**
     * @method
     * @name dreamdex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol, required for dreamDEX
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV0MarketsSymbolTradesMine (this.extend (request, params));
        //
        //     {
        //         "symbol": "SOMI:USDso",
        //         "trades": [
        //             { "id": "123:456", "timestamp": 1765534169841, "symbol": "SOMI:USDso", "side": "buy", "price": "1.25", "amount": "100", "cost": "125" }
        //         ]
        //     }
        //
        const trades = this.safeList (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // public (fetchTrades)
        //
        //     { "id": "t1", "timestamp": 1765534169841, "symbol": "SOMI:USDso", "side": "buy", "price": "1.25", "amount": "100", "cost": "125" }
        //
        // private (fetchMyTrades), id is "orderId:tradeIndex"
        //
        //     { "id": "123:456", "timestamp": 1765534169841, "symbol": "SOMI:USDso", "side": "buy", "price": "1.25", "amount": "100", "cost": "125" }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market, ':');
        const timestamp = this.safeInteger (trade, 'timestamp');
        return this.safeTrade ({
            'id': this.safeString (trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': this.safeString (trade, 'cost'),
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name dreamdex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol
     * @param {string} [timeframe] the length of time each candle represents, default '1m'
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV0MarketsSymbolCandles (this.extend (request, params));
        //
        //     {
        //         "symbol": "SOMI:USDso",
        //         "interval": "1m",
        //         "candles": [
        //             { "timestamp": 1765534140000, "open": "1.24", "high": "1.26", "low": "1.23", "close": "1.25", "volume": "1000" }
        //         ]
        //     }
        //
        const candles = this.safeList (response, 'candles', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name dreamdex#fetchBalance
     * @description query for balance in a specific market vault. dreamDEX uses per-market vaults rather than a single exchange-wide wallet, so params.symbol is required. The API does not distinguish between free and locked (in-order) balances, so all balance is reported as free.
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.symbol unified market symbol (required — vault is per-market)
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.signIn ();
        await this.loadMarkets ();
        const symbol = this.safeString (params, 'symbol');
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchBalance() requires a params.symbol argument (vault is per-market)');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'walletAddress': this.walletAddress,
        };
        params = this.omit (params, 'symbol');
        const response = await this.privateGetV0MarketsSymbolVaultBalance (this.extend (request, params));
        //
        //     {
        //         "balances": [
        //             { "currency": "SOMI", "amount": "1000.5" },
        //             { "currency": "USDso", "amount": "500.25" }
        //         ]
        //     }
        //
        const balances = this.safeList (response, 'balances', []);
        return this.parseBalance (balances);
    }

    parseBalance (response): Balances {
        const result: Dict = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = this.safeDict (response, i, {});
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const total = this.safeString (balance, 'amount');
            account['total'] = total;
            account['free'] = total;
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name dreamdex#vaultApprove
     * @description generates an unsigned ERC-20 approve transaction, or returns undefined for native tokens
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol identifying the vault
     * @param {string} currency currency code to approve (e.g. 'SOMI' or 'USDso')
     * @param {float} amount the amount to approve for spending
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.walletAddress] the wallet address (defaults to this.walletAddress)
     * @returns {object|undefined} an unsigned EVM transaction or undefined if no approval is required
     */
    async vaultApprove (symbol: string, currency: string, amount: Num, params = {}): Promise<any> {
        return await this.vaultAction ('approve', symbol, currency, amount, params);
    }

    /**
     * @method
     * @name dreamdex#vaultDeposit
     * @description generates an unsigned EVM transaction for depositing tokens into a per-market vault
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol identifying the vault
     * @param {string} currency currency code to deposit (e.g. 'SOMI' or 'USDso')
     * @param {float} amount the amount to deposit
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.walletAddress] the wallet address (defaults to this.walletAddress)
     * @returns {object} an unsigned EVM transaction { to, data, value, chainId, gasLimit, nonce }
     */
    async vaultDeposit (symbol: string, currency: string, amount: Num, params = {}): Promise<Dict> {
        const response = await this.vaultAction ('deposit', symbol, currency, amount, params);
        return response as Dict;
    }

    /**
     * @method
     * @name dreamdex#vaultWithdraw
     * @description generates an unsigned EVM transaction for withdrawing tokens from a per-market vault
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol identifying the vault
     * @param {string} currency currency code to withdraw (e.g. 'SOMI' or 'USDso')
     * @param {float} amount the amount to withdraw
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.walletAddress] the wallet address (defaults to this.walletAddress)
     * @returns {object} an unsigned EVM transaction { to, data, value, chainId, gasLimit, nonce }
     */
    async vaultWithdraw (symbol: string, currency: string, amount: Num, params = {}): Promise<Dict> {
        const response = await this.vaultAction ('withdraw', symbol, currency, amount, params);
        return response as Dict;
    }

    async vaultAction (action: string, symbol: string, currency: string, amount: Num, params = {}): Promise<any> {
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const walletAddress = this.safeString (params, 'walletAddress', this.walletAddress);
        params = this.omit (params, 'walletAddress');
        const currencyObj = this.currency (currency);
        const request: Dict = {
            'symbol': market['id'],
            'walletAddress': walletAddress,
            'currency': currencyObj['id'],
            'amount': this.numberToString (amount),
        };
        let response = undefined;
        if (action === 'approve') {
            response = await this.privatePostV0MarketsSymbolVaultApprove (this.extend (request, params));
        } else if (action === 'deposit') {
            response = await this.privatePostV0MarketsSymbolVaultDeposit (this.extend (request, params));
        } else if (action === 'withdraw') {
            response = await this.privatePostV0MarketsSymbolVaultWithdraw (this.extend (request, params));
        }
        //
        //     {
        //         "to": "0xcee4c19f4518A10FBeF92390FE6d9e7B18A4070c",
        //         "data": "0x80702f83...",
        //         "value": "0",
        //         "chainId": "5031",
        //         "gasLimit": "250000",
        //         "nonce": "42"
        //     }
        //
        // The approve endpoint responds with JSON null when no approval is required
        // (e.g. native-token currencies). Normalize to undefined so callers can truthy-check.
        if (response === null) {
            return undefined;
        }
        return response;
    }

    /**
     * @method
     * @name dreamdex#fetchBuilderMaxFee
     * @description fetches the protocol-wide cap on builder fees for a market (a value of zero disables builder codes)
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a structure containing maxFeeBpsTimes1k in BPS_TIMES_1K units (1000 = 1 bps)
     */
    async fetchBuilderMaxFee (symbol: string, params = {}): Promise<Dict> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV0MarketsSymbolBuilderMaxFee (this.extend (request, params));
        //
        //     {
        //         "maxFeeBpsTimes1k": "100000"
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name dreamdex#fetchBuilderApproval
     * @description fetches a wallet's on-chain builder approval for a market
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.builder] builder wallet address to query (defaults to options.builder)
     * @param {string} [params.walletAddress] the order owner's wallet address (defaults to this.walletAddress)
     * @returns {object} a structure with builder, approved, effective and protocolMaxFee in BPS_TIMES_1K units (1000 = 1 bps)
     */
    async fetchBuilderApproval (symbol: string, params = {}): Promise<Dict> {
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const walletAddress = this.safeString (params, 'walletAddress', this.walletAddress);
        const builder = this.safeStringLower (params, 'builder', this.safeStringLower (this.options, 'builder'));
        params = this.omit (params, [ 'walletAddress', 'builder' ]);
        const request: Dict = {
            'symbol': market['id'],
            'walletAddress': walletAddress,
            'builder': builder,
        };
        const response = await this.privateGetV0MarketsSymbolBuilderApproval (this.extend (request, params));
        //
        //     {
        //         "builder": "0x6530512A6c89C7cfCEbC3BA7fcD9aDa5f30827a6",
        //         "approved": "100000",
        //         "effective": "100000",
        //         "protocolMaxFee": "100000"
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name dreamdex#approveBuilder
     * @description generates an unsigned EVM transaction approving a builder to charge a per-order fee up to maxFeeBpsTimes1k
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol
     * @param {int} maxFeeBpsTimes1k maximum per-order builder fee in BPS_TIMES_1K units (1000 = 1 bps)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.builder] builder wallet address to approve (defaults to options.builder)
     * @param {string} [params.walletAddress] the order owner's wallet address (defaults to this.walletAddress)
     * @returns {object} an unsigned EVM transaction { to, data, value, chainId }
     */
    async approveBuilder (symbol: string, maxFeeBpsTimes1k: Int, params = {}): Promise<Dict> {
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const walletAddress = this.safeString (params, 'walletAddress', this.walletAddress);
        const builder = this.safeStringLower (params, 'builder', this.safeStringLower (this.options, 'builder'));
        params = this.omit (params, [ 'walletAddress', 'builder' ]);
        const request: Dict = {
            'symbol': market['id'],
            'walletAddress': walletAddress,
            'builder': builder,
            'maxFeeBpsTimes1k': maxFeeBpsTimes1k,
        };
        const response = await this.privatePostV0MarketsSymbolBuilderApprove (this.extend (request, params));
        //
        //     {
        //         "to": "0xcee4c19f4518A10FBeF92390FE6d9e7B18A4070c",
        //         "data": "0x80702f83...",
        //         "value": "0",
        //         "chainId": "5031"
        //     }
        //
        return response;
    }

    /**
     * @method
     * @name dreamdex#createOrder
     * @description creates an order by returning an unsigned EVM transaction for the user to sign and broadcast on-chain.
     * The order is not placed until the transaction is submitted to the Somnia network (chain ID 5031).
     * The returned order structure has the unsigned transaction payload in the info field.
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} symbol unified market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.walletAddress] the wallet address to place the order from (defaults to this.walletAddress)
     * @param {float} [params.triggerPrice] the price at which a stop order is triggered - routes to the stop-orders endpoint
     * @param {float} [params.stopPrice] alias for triggerPrice
     * @param {string} [params.triggerOperator] 'gte' or 'lte' - trigger condition (default: 'lte' for sell, 'gte' for buy)
     * @param {string} [params.timeInForce] 'IOC', 'FOK', or 'PO' - maps to API orderType (immediateOrCancel, fillOrKill, postOnly)
     * @param {bool} [params.postOnly] true to create a post-only order (alternative to timeInForce 'PO')
     * @param {string} [params.fundingSource] 'wallet' or 'vault' - where to source tokens (default is 'wallet', 'vault' uses pre-deposited balance)
     * @param {string} [params.selfMatchingOption] 'cancelTaker' or 'cancelMaker' - self-trade prevention behavior
     * @param {string} [params.builder] builder wallet address that receives the per-order builder fee (defaults to options.builder; set options.builderFee=false to disable). Not supported for stop orders.
     * @param {int} [params.builderFeeBpsTimes1k] builder fee rate in BPS_TIMES_1K units (1000 = 1 bps), must be greater than zero when builder is set (defaults to options.builderFeeBpsTimes1k)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure} with the unsigned EVM transaction in the info field
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const walletAddress = this.safeString (params, 'walletAddress', this.walletAddress);
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        if (triggerPrice !== undefined) {
            let triggerOperator = this.safeString (params, 'triggerOperator');
            if (triggerOperator === undefined) {
                triggerOperator = (side === 'sell') ? 'lte' : 'gte';
            }
            params = this.omit (params, [ 'walletAddress', 'triggerPrice', 'stopPrice', 'triggerOperator' ]);
            const isMarket = (type === 'market');
            if (!isMarket && price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for stop limit orders');
            }
            const stopRequest: Dict = {
                'symbol': market['id'],
                'walletAddress': walletAddress,
                'type': type,
                'side': side,
                'amount': this.amountToPrecision (symbol, amount),
                'triggerPrice': this.priceToPrecision (symbol, triggerPrice),
                'triggerOperator': triggerOperator,
            };
            if (!isMarket) {
                stopRequest['price'] = this.priceToPrecision (symbol, price);
            }
            const stopResponse = await this.privatePostV0MarketsSymbolStopOrders (this.extend (stopRequest, params));
            //
            //     {
            //         "to": "0x1489eA81CBEDd53a8Eb1a95E99AF8EB5683b3330",
            //         "data": "0x...",
            //         "value": "100000000000000000",
            //         "chainId": "5031"
            //     }
            //
            return this.safeOrder ({
                'id': undefined,
                'clientOrderId': undefined,
                'timestamp': undefined,
                'datetime': undefined,
                'lastTradeTimestamp': undefined,
                'status': undefined,
                'symbol': market['symbol'],
                'type': type,
                'side': side,
                'price': price,
                'amount': amount,
                'filled': undefined,
                'remaining': undefined,
                'average': undefined,
                'cost': undefined,
                'triggerPrice': this.parseNumber (triggerPrice),
                'trades': undefined,
                'fee': undefined,
                'info': stopResponse,
            }, market);
        }
        params = this.omit (params, 'walletAddress');
        const isMarketOrder = (type === 'market');
        if (!isMarketOrder && price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
        }
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, false, params);
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        params = this.omit (params, 'timeInForce');
        const request: Dict = {
            'symbol': market['id'],
            'walletAddress': walletAddress,
            'type': type,
            'side': side,
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (!isMarketOrder) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (postOnly) {
            request['orderType'] = 'postOnly';
        } else if (timeInForce === 'IOC') {
            request['orderType'] = 'immediateOrCancel';
        } else if (timeInForce === 'FOK') {
            request['orderType'] = 'fillOrKill';
        }
        const builderFeeEnabled = this.safeBool (this.options, 'builderFee', true);
        const builder = this.safeStringLower (params, 'builder', builderFeeEnabled ? this.safeStringLower (this.options, 'builder') : undefined);
        const builderFee = this.safeInteger (params, 'builderFeeBpsTimes1k', builderFeeEnabled ? this.safeInteger (this.options, 'builderFeeBpsTimes1k') : undefined);
        if ((builder !== undefined) && (builderFee !== undefined) && (builderFee > 0)) {
            request['builder'] = builder;
            request['builderFeeBpsTimes1k'] = builderFee;
        }
        params = this.omit (params, [ 'builder', 'builderFeeBpsTimes1k' ]);
        const response = await this.privatePostV0MarketsSymbolOrders (this.extend (request, params));
        //
        //     {
        //         "chainId": "5031",
        //         "data": "0x80702f83...",
        //         "to": "0xcee4c19f4518A10FBeF92390FE6d9e7B18A4070c",
        //         "value": "0"
        //     }
        //
        return this.safeOrder ({
            'id': undefined,
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'average': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': response,
        }, market);
    }

    /**
     * @method
     * @name dreamdex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} id the order id
     * @param {string} symbol unified market symbol, required for dreamDEX
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'id': id,
        };
        const response = await this.privateGetV0MarketsSymbolOrdersId (this.extend (request, params));
        //
        //     {
        //         "id": "01KC1F8N2NBP5GEYKE66CRJ34A",
        //         "status": "open",
        //         "createdAt": 1765534169841,
        //         "symbol": "SOMI:USDso",
        //         "side": "buy",
        //         "price": "1.25",
        //         "amount": "500",
        //         "filled": "150",
        //         "remaining": "350",
        //         "walletAddress": "0x1234...",
        //         "txHash": "0xabc..."
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name dreamdex#fetchOrders
     * @description fetches a list of orders placed by the user
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} [symbol] unified market symbol; when omitted returns orders across all markets
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] the maximum number of orders to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.status] order status to filter by: 'open', 'closed', 'canceled', 'expired', 'rejected' (or 'pending', 'triggered', 'canceled', 'failed' for stop orders)
     * @param {bool} [params.trigger] set to true to fetch stop orders instead of regular orders (requires symbol)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.signIn ();
        await this.loadMarkets ();
        const stop = this.safeBool2 (params, 'stop', 'trigger');
        if (symbol === undefined) {
            if (stop) {
                throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument for stop orders');
            }
            const allResponse = await this.privateGetV0Orders (params);
            const allOrders = this.safeList (allResponse, 'orders', []);
            return this.parseOrders (allOrders, undefined, since, limit);
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (stop) {
            params = this.omit (params, [ 'stop', 'trigger' ]);
            const stopResponse = await this.privateGetV0MarketsSymbolStopOrders (this.extend (request, params));
            const stopOrders = this.safeList (stopResponse, 'stopOrders', []);
            return this.parseOrders (stopOrders, market, since, limit);
        }
        const response = await this.privateGetV0MarketsSymbolOrders (this.extend (request, params));
        const orders = this.safeList (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name dreamdex#fetchOpenOrders
     * @description fetches a list of open orders placed by the user
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} [symbol] unified market symbol; when omitted returns open orders across all markets
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] the maximum number of orders to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] set to true to fetch pending stop orders (requires symbol)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const stop = this.safeBool2 (params, 'stop', 'trigger');
        const request: Dict = {
            'status': (stop) ? 'pending' : 'open',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name dreamdex#cancelOrder
     * @description cancels an open order
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} id order id
     * @param {string} symbol unified market symbol, required for dreamDEX
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] set to true to cancel a stop order (returns unsigned EVM transaction)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const stop = this.safeBool2 (params, 'stop', 'trigger');
        const request: Dict = {
            'symbol': market['id'],
            'id': id,
        };
        if (stop) {
            params = this.omit (params, [ 'stop', 'trigger' ]);
            const stopResponse = await this.privateDeleteV0MarketsSymbolStopOrdersId (this.extend (request, params));
            // stop order cancel returns unsigned EVM transaction, not an order object
            return this.safeOrder ({
                'id': id,
                'clientOrderId': undefined,
                'timestamp': undefined,
                'datetime': undefined,
                'lastTradeTimestamp': undefined,
                'status': undefined,
                'symbol': market['symbol'],
                'type': undefined,
                'side': undefined,
                'price': undefined,
                'amount': undefined,
                'filled': undefined,
                'remaining': undefined,
                'average': undefined,
                'cost': undefined,
                'trades': undefined,
                'fee': undefined,
                'info': stopResponse,
            }, market);
        }
        const response = await this.privateDeleteV0MarketsSymbolOrdersId (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name dreamdex#editOrder
     * @description reduces the remaining quantity of an open order (the only edit the API supports)
     * @see https://api.dreamdex.io/.well-known/oapi.json
     * @param {string} id order id
     * @param {string} symbol unified market symbol, required for dreamDEX
     * @param {string} type not used, kept for CCXT unified signature
     * @param {string} side not used, kept for CCXT unified signature
     * @param {float} amount the new remaining quantity (must be less than current remaining)
     * @param {float} [price] not supported -- will throw if provided
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure} with the unsigned EVM transaction in the info field
     */
    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a symbol argument');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an amount argument (newQuantityRemaining)');
        }
        if (price !== undefined) {
            throw new NotSupported (this.id + ' editOrder() does not support changing price, only reducing quantity');
        }
        await this.signIn ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'id': id,
            'newQuantityRemaining': this.amountToPrecision (symbol, amount),
        };
        const response = await this.privatePatchV0MarketsSymbolOrdersIdReduce (this.extend (request, params));
        //
        //     {
        //         "to": "0x914eDb19d187403F6e2b061CD92FF68CC795EA71",
        //         "data": "0x...",
        //         "value": "0",
        //         "chainId": "5031"
        //     }
        //
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': amount,
            'average': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': response,
        }, market);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        const rawTriggerPrice = this.safeString (order, 'triggerPrice');
        if (rawTriggerPrice !== undefined) {
            return this.parseStopOrder (order, market);
        }
        //
        //     {
        //         "id": "01KC1F8N2NBP5GEYKE66CRJ34A",
        //         "status": "open",
        //         "createdAt": 1765534169841,
        //         "symbol": "SOMI:USDso",
        //         "side": "buy",
        //         "price": "1.25",
        //         "amount": "500",
        //         "filled": "150",
        //         "remaining": "350",
        //         "walletAddress": "0x1234...",
        //         "txHash": "0xabc..."
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market, ':');
        const timestamp = this.safeInteger (order, 'createdAt');
        const price = this.safeNumber (order, 'price');
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': market['symbol'],
            'type': this.safeString (order, 'type'),
            'side': this.safeString (order, 'side'),
            'price': price,
            'amount': this.safeNumber (order, 'amount'),
            'filled': this.safeNumber (order, 'filled'),
            'remaining': this.safeNumber (order, 'remaining'),
            'average': price,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'open': 'open',
            'closed': 'closed',
            'canceled': 'canceled',
            'expired': 'expired',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseStopOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "id": "01KC3B1P4RDS7IGAMH88ETL56C",
        //         "status": "pending",
        //         "createdAt": 1765534169841,
        //         "symbol": "SOMI:USDso",
        //         "type": "market",
        //         "side": "sell",
        //         "amount": "100",
        //         "triggerPrice": "1.00",
        //         "triggerOperator": "lte",
        //         "spotOrderId": "01KC4C2Q5SES8JBBNJ99FUM67D",
        //         "walletAddress": "0x1234..."
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market, ':');
        const timestamp = this.safeInteger (order, 'createdAt');
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseStopOrderStatus (this.safeString (order, 'status')),
            'symbol': market['symbol'],
            'type': this.safeString (order, 'type'),
            'side': this.safeString (order, 'side'),
            'price': undefined,
            'amount': this.safeNumber (order, 'amount'),
            'filled': undefined,
            'remaining': undefined,
            'average': undefined,
            'cost': undefined,
            'triggerPrice': this.safeNumber (order, 'triggerPrice'),
            'trades': undefined,
            'fee': undefined,
            'info': order,
        }, market);
    }

    parseStopOrderStatus (status: Str) {
        const statuses: Dict = {
            'pending': 'open',
            'triggered': 'closed',
            'canceled': 'canceled',
            'failed': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    hashMessage (message) {
        const binaryMessage = this.encode (message);
        const binaryMessageLength = this.binaryLength (binaryMessage);
        const x19 = this.base16ToBinary ('19');
        const newline = this.base16ToBinary ('0a');
        const prefix = this.binaryConcat (x19, this.encode ('Ethereum Signed Message:'), newline, this.encode (this.numberToString (binaryMessageLength)));
        return '0x' + this.hash (this.binaryConcat (prefix, binaryMessage), keccak, 'hex');
    }

    signHash (hash, privateKey) {
        this.checkRequiredCredentials ();
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        const v = this.intToBase16 (this.sum (27, signature['v']));
        return '0x' + r.padStart (64, '0') + s.padStart (64, '0') + v;
    }

    async signIn (params = {}) {
        const cachedToken = this.safeString (this.options, 'authToken');
        const cachedExpires = this.safeInteger (this.options, 'authTokenExpires');
        const now = this.milliseconds ();
        if ((cachedToken !== undefined) && (cachedExpires !== undefined) && (now < cachedExpires)) {
            return cachedToken;
        }
        const nonceResponse = await this.publicGetV0AuthNonce (params);
        const nonce = this.safeString (nonceResponse, 'nonce');
        const issuedAt = this.iso8601 (now);
        const url = this.safeString (this.urls['api'], 'rest');
        const message = url + ' wants you to sign in with your Ethereum account:' + "\n" + this.walletAddress + "\n" + "\n" + 'Sign in to dreamDEX' + "\n" + "\n" + 'URI: ' + url + "\n" + 'Version: 1' + "\n" + 'Chain ID: 5031' + "\n" + 'Nonce: ' + nonce + "\n" + 'Issued At: ' + issuedAt; // eslint-disable-line quotes
        const hash = this.hashMessage (message);
        const sig = this.signHash (hash, this.privateKey);
        const loginRequest: Dict = {
            'message': message,
            'signature': sig,
        };
        const loginResponse = await this.publicPostV0AuthLogin (loginRequest);
        //
        //     { "token": "eyJhbGciOi...", "expiresAt": 1765537769841 }
        //
        const token = this.safeString (loginResponse, 'token');
        const expiresAt = this.safeInteger (loginResponse, 'expiresAt');
        this.options['authToken'] = token;
        this.options['authTokenExpires'] = expiresAt;
        return token;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.safeString (this.urls['api'], 'rest') + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            const token = this.safeString (this.options, 'authToken');
            headers = {
                'Authorization': 'Bearer ' + token,
            };
            if ((method === 'POST') || (method === 'PATCH')) {
                headers['Content-Type'] = 'application/json';
                body = this.json (query);
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        } else {
            if (method === 'POST') {
                headers = {
                    'Content-Type': 'application/json',
                };
                body = this.json (query);
            } else {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const errorName = this.safeString (response, 'name');
        if (errorName !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorName, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            if (httpCode >= 400) {
                throw new ExchangeError (feedback);
            }
        }
        return undefined;
    }
}
