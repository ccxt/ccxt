//  ---------------------------------------------------------------------------

import Exchange from './abstract/o2exchange.js';
import type { Market, Dict, Currency, Currencies, Ticker, OrderBook, Int, Trade, OHLCV, Str } from './base/types.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';

//  ---------------------------------------------------------------------------

/**
 * @class o2exchange
 * @augments Exchange
 * @description O2 Exchange - Decentralized exchange on Fuel blockchain
 */
export default class o2exchange extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'o2exchange',
            'name': 'O2 Exchange',
            'countries': [ 'US' ],
            'version': 'v1',
            'rateLimit': 100,
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                // Public API
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                // Private API (to implement later)
                'fetchBalance': false,
                'createOrder': false,
                'cancelOrder': false,
                'fetchOpenOrders': false,
                'fetchClosedOrders': false,
                'fetchMyTrades': false,
            },
            'timeframes': {
                '1s': '1s',
                '1m': '1m',
                '2m': '2m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
                '3M': '3M',
            },
            'urls': {
                'logo': 'https://o2.app/logo.png',
                'api': {
                    'public': 'https://api.o2.app',
                    'private': 'https://api.o2.app',
                },
                'test': {
                    'public': 'https://api.testnet.o2.app',
                    'private': 'https://api.testnet.o2.app',
                },
                'www': 'https://o2.app',
                'doc': [
                    'https://docs.o2.app',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'v1/markets': 1,
                        'v1/markets/summary': 1,
                        'v1/markets/ticker': 1,
                        'v1/aggregated/assets': 1,
                        'v1/aggregated/trades': 1,
                        'v1/depth': 1,
                        'v1/trades': 1,
                        'v1/bars': 1,
                        'health': 1,
                    },
                },
                'private': {
                    'get': {
                        'v1/accounts': 1,
                        'v1/balance': 1,
                        'v1/orders': 1,
                    },
                    'post': {
                        'v1/accounts': 1,
                        'v1/session/call': 1,
                    },
                    'put': {
                        'v1/session': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.01'),  // 100 basis points = 1%
                    'taker': this.parseNumber ('0.01'),  // 100 basis points = 1%
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'options': {
                'sandboxMode': false,
            },
        });
    }

    /**
     * @method
     * @name o2exchange#fetchMarkets
     * @description retrieves data on all markets for o2exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV1Markets (params);
        //
        //     {
        //         "books_registry_id": "0x...",
        //         "accounts_registry_id": "0x...",
        //         "trade_account_oracle_id": "0x...",
        //         "markets": [
        //             {
        //                 "contract_id": "0x...",
        //                 "market_id": "0x...",
        //                 "maker_fee": "100",        // basis points (100 = 1%)
        //                 "taker_fee": "100",        // basis points (100 = 1%)
        //                 "min_order": "1000000000", // raw units (divide by 10^decimals)
        //                 "dust": "1000",
        //                 "price_window": "0",
        //                 "base": {
        //                     "symbol": "ETH",
        //                     "asset": "0x...",
        //                     "decimals": 9,
        //                     "max_precision": 3
        //                 },
        //                 "quote": {
        //                     "symbol": "USDC",
        //                     "asset": "0x...",
        //                     "decimals": 9,
        //                     "max_precision": 2
        //                 }
        //             }
        //         ]
        //     }
        //
        const markets = this.safeList (response, 'markets', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            result.push (this.parseMarket (market));
        }
        return result;
    }

    parseMarket (market: Dict): Market {
        const baseInfo = this.safeDict (market, 'base', {});
        const quoteInfo = this.safeDict (market, 'quote', {});
        const baseId = this.safeString (baseInfo, 'symbol');
        const quoteId = this.safeString (quoteInfo, 'symbol');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        const marketId = this.safeString (market, 'market_id');
        const basePrecision = this.safeInteger (baseInfo, 'max_precision', 8);
        const quotePrecision = this.safeInteger (quoteInfo, 'max_precision', 6);
        const baseDecimals = this.safeInteger (baseInfo, 'decimals', 9);
        const makerFeeRaw = this.safeString (market, 'maker_fee', '0');
        const takerFeeRaw = this.safeString (market, 'taker_fee', '0');
        // Fees are in basis points (100 = 1%), convert to decimal
        const makerFee = Precise.stringDiv (makerFeeRaw, '10000');
        const takerFee = Precise.stringDiv (takerFeeRaw, '10000');
        // min_order is in raw units, convert using base decimals
        const minOrderRaw = this.safeString (market, 'min_order', '0');
        const baseDecimalsDivisor = '1' + '0'.repeat (baseDecimals);
        const minOrder = Precise.stringDiv (minOrderRaw, baseDecimalsDivisor);
        return this.safeMarketStructure ({
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': true,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'settle': undefined,
            'settleId': undefined,
            'contractSize': undefined,
            'linear': undefined,
            'inverse': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'taker': this.parseNumber (takerFee),
            'maker': this.parseNumber (makerFee),
            'percentage': true,
            'tierBased': false,
            'feeSide': 'get',
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (basePrecision.toString ())),
                'price': this.parseNumber (this.parsePrecision (quotePrecision.toString ())),
            },
            'limits': {
                'amount': {
                    'min': this.parseNumber (minOrder),
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
                'leverage': {
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
     * @name o2exchange#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const assetsPromise = this.publicGetV1AggregatedAssets (params);
        const marketsPromise = this.publicGetV1Markets (params);
        const [ assetsResponse, marketsResponse ] = await Promise.all ([ assetsPromise, marketsPromise ]);
        //
        // assetsResponse:
        //     {
        //         "ETH": {
        //             "can_deposit": true,
        //             "can_withdraw": true,
        //             "maker_fee": 0.01,
        //             "min_deposit": 0.0,
        //             "min_withdraw": 0.0,
        //             "name": "Ethereum",
        //             "taker_fee": 0.01,
        //             "unified_cryptoasset_id": 1027
        //         }
        //     }
        //
        // Extract decimals from markets
        const decimalsMap: Dict = {};
        const markets = this.safeList (marketsResponse, 'markets', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseInfo = this.safeDict (market, 'base', {});
            const quoteInfo = this.safeDict (market, 'quote', {});
            const baseSymbol = this.safeString (baseInfo, 'symbol');
            const quoteSymbol = this.safeString (quoteInfo, 'symbol');
            if (baseSymbol !== undefined && decimalsMap[baseSymbol] === undefined) {
                decimalsMap[baseSymbol] = this.safeInteger (baseInfo, 'decimals', 9);
            }
            if (quoteSymbol !== undefined && decimalsMap[quoteSymbol] === undefined) {
                decimalsMap[quoteSymbol] = this.safeInteger (quoteInfo, 'decimals', 9);
            }
        }
        const result: Currencies = {};
        const currencyIds = Object.keys (assetsResponse);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const currency = this.safeDict (assetsResponse, currencyId, {});
            const code = this.safeCurrencyCode (currencyId);
            const decimals = this.safeInteger (decimalsMap, currencyId, 9);
            // Add currencyId and decimals to currency dict for parseCurrency
            currency['currencyId'] = currencyId;
            currency['decimals'] = decimals;
            result[code] = this.parseCurrency (currency);
        }
        return result;
    }

    parseCurrency (currency: Dict): Currency {
        //
        //     {
        //         "can_deposit": true,
        //         "can_withdraw": true,
        //         "maker_fee": 0.01,
        //         "min_deposit": 0.0,
        //         "min_withdraw": 0.0,
        //         "name": "Ethereum",
        //         "taker_fee": 0.01,
        //         "unified_cryptoasset_id": 1027,
        //         "currencyId": "ETH",      // added by fetchCurrencies
        //         "decimals": 9             // added by fetchCurrencies
        //     }
        //
        const currencyId = this.safeString (currency, 'currencyId');
        const decimals = this.safeInteger (currency, 'decimals', 9);
        const code = this.safeCurrencyCode (currencyId);
        const name = this.safeString (currency, 'name');
        const canDeposit = this.safeBool (currency, 'can_deposit', true);
        const canWithdraw = this.safeBool (currency, 'can_withdraw', true);
        const minDeposit = this.safeNumber (currency, 'min_deposit');
        const minWithdraw = this.safeNumber (currency, 'min_withdraw');
        const active = canDeposit && canWithdraw;
        return this.safeCurrencyStructure ({
            'id': currencyId,
            'code': code,
            'name': name,
            'active': active,
            'deposit': canDeposit,
            'withdraw': canWithdraw,
            'fee': undefined,
            'precision': this.parseNumber (this.parsePrecision (decimals.toString ())),
            'limits': {
                'deposit': {
                    'min': minDeposit,
                    'max': undefined,
                },
                'withdraw': {
                    'min': minWithdraw,
                    'max': undefined,
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'networks': {},
            'info': currency,
        });
    }

    /**
     * @method
     * @name o2exchange#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market_id': market['id'],
        };
        const response = await this.publicGetV1MarketsTicker (this.extend (request, params));
        //
        //     [
        //         {
        //             "ask": "1646000",
        //             "ask_volume": "6075500000000",
        //             "average": "1663000",
        //             "base_volume": "16316030419374186",
        //             "bid": "1643000",
        //             "bid_volume": "6085400000000",
        //             "change": "-38000",
        //             "close": "1644000",
        //             "high": "1729000",
        //             "last": "1644000",
        //             "low": "1551000",
        //             "open": "1682000",
        //             "percentage": "-2.2592152199762188",
        //             "previous_close": "1682000",
        //             "quote_volume": "27248711015413",
        //             "timestamp": "1769717320000"
        //         }
        //     ]
        //
        const ticker = this.safeDict (response, 0, {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "ask": "1646000",
        //         "ask_volume": "6075500000000",
        //         "average": "1663000",
        //         "base_volume": "16316030419374186",
        //         "bid": "1643000",
        //         "bid_volume": "6085400000000",
        //         "change": "-38000",
        //         "close": "1644000",
        //         "high": "1729000",
        //         "last": "1644000",
        //         "low": "1551000",
        //         "open": "1682000",
        //         "percentage": "-2.2592152199762188",
        //         "previous_close": "1682000",
        //         "quote_volume": "27248711015413",
        //         "timestamp": "1769717320000"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const symbol = this.safeString (market, 'symbol');
        // Get decimals from market info for conversion
        const marketInfo = this.safeDict (market, 'info', {});
        const baseInfo = this.safeDict (marketInfo, 'base', {});
        const quoteInfo = this.safeDict (marketInfo, 'quote', {});
        const baseDecimals = this.safeInteger (baseInfo, 'decimals', 9);
        const quoteDecimals = this.safeInteger (quoteInfo, 'decimals', 9);
        const baseDivisor = '1' + '0'.repeat (baseDecimals);
        const quoteDivisor = '1' + '0'.repeat (quoteDecimals);
        // Convert price values (divide by quote decimals)
        const lastRaw = this.safeString (ticker, 'last');
        const openRaw = this.safeString (ticker, 'open');
        const highRaw = this.safeString (ticker, 'high');
        const lowRaw = this.safeString (ticker, 'low');
        const bidRaw = this.safeString (ticker, 'bid');
        const askRaw = this.safeString (ticker, 'ask');
        const closeRaw = this.safeString (ticker, 'close');
        const averageRaw = this.safeString (ticker, 'average');
        const changeRaw = this.safeString (ticker, 'change');
        const last = this.parseNumber (Precise.stringDiv (lastRaw, quoteDivisor));
        const open = this.parseNumber (Precise.stringDiv (openRaw, quoteDivisor));
        const high = this.parseNumber (Precise.stringDiv (highRaw, quoteDivisor));
        const low = this.parseNumber (Precise.stringDiv (lowRaw, quoteDivisor));
        const bid = this.parseNumber (Precise.stringDiv (bidRaw, quoteDivisor));
        const ask = this.parseNumber (Precise.stringDiv (askRaw, quoteDivisor));
        const close = this.parseNumber (Precise.stringDiv (closeRaw, quoteDivisor));
        const average = this.parseNumber (Precise.stringDiv (averageRaw, quoteDivisor));
        const change = this.parseNumber (Precise.stringDiv (changeRaw, quoteDivisor));
        // Convert volume values
        const baseVolumeRaw = this.safeString (ticker, 'base_volume');
        const quoteVolumeRaw = this.safeString (ticker, 'quote_volume');
        const bidVolumeRaw = this.safeString (ticker, 'bid_volume');
        const askVolumeRaw = this.safeString (ticker, 'ask_volume');
        const baseVolume = this.parseNumber (Precise.stringDiv (baseVolumeRaw, baseDivisor));
        const quoteVolume = this.parseNumber (Precise.stringDiv (quoteVolumeRaw, quoteDivisor));
        const bidVolume = this.parseNumber (Precise.stringDiv (bidVolumeRaw, baseDivisor));
        const askVolume = this.parseNumber (Precise.stringDiv (askVolumeRaw, baseDivisor));
        const percentage = this.safeNumber (ticker, 'percentage');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name o2exchange#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market_id': market['id'],
            'precision': 1,  // required parameter
        };
        const response = await this.publicGetV1Depth (this.extend (request, params));
        //
        //     {
        //         "action": "depth",
        //         "market_id": "3074a3b0290306e78968896e1ea7f91f15bb13da1d2e06cc50d714deb75ea0d2",
        //         "orders": {
        //             "buys": [
        //                 { "price": "1643000", "quantity": "104928000000000" }
        //             ],
        //             "sells": [
        //                 { "price": "1646000", "quantity": "6076200000000" }
        //             ]
        //         }
        //     }
        //
        const orders = this.safeDict (response, 'orders', {});
        const timestamp = this.milliseconds ();
        return this.parseOrderBookCustom (orders, symbol, timestamp, 'buys', 'sells', 'price', 'quantity', market);
    }

    parseOrderBookCustom (orderbook: object, symbol: string, timestamp: Int = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey: string | Int = 0, amountKey: string | Int = 1, market: Market = undefined): OrderBook {
        const bids = this.parseBidsAsksCustom (this.safeList (orderbook, bidsKey, []), priceKey, amountKey, market);
        const asks = this.parseBidsAsksCustom (this.safeList (orderbook, asksKey, []), priceKey, amountKey, market);
        return {
            'symbol': symbol,
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        } as OrderBook;
    }

    parseBidsAsksCustom (bidasks, priceKey: string | Int = 0, amountKey: string | Int = 1, market: Market = undefined) {
        // Get decimals from market info for conversion
        const marketInfo = this.safeDict (market, 'info', {});
        const baseInfo = this.safeDict (marketInfo, 'base', {});
        const quoteInfo = this.safeDict (marketInfo, 'quote', {});
        const baseDecimals = this.safeInteger (baseInfo, 'decimals', 9);
        const quoteDecimals = this.safeInteger (quoteInfo, 'decimals', 9);
        const baseDivisor = '1' + '0'.repeat (baseDecimals);
        const quoteDivisor = '1' + '0'.repeat (quoteDecimals);
        const result = [];
        for (let i = 0; i < bidasks.length; i++) {
            const bidask = bidasks[i];
            const priceRaw = this.safeString (bidask, priceKey);
            const amountRaw = this.safeString (bidask, amountKey);
            const price = this.parseNumber (Precise.stringDiv (priceRaw, quoteDivisor));
            const amount = this.parseNumber (Precise.stringDiv (amountRaw, baseDivisor));
            result.push ([ price, amount ]);
        }
        return result;
    }

    /**
     * @method
     * @name o2exchange#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketPair = market['baseId'] + '_' + market['quoteId'];
        const request: Dict = {
            'market_pair': marketPair,
        };
        const response = await this.publicGetV1AggregatedTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "base_volume": 729.7,
        //             "price": 0.001644,
        //             "quote_volume": 1.1996268,
        //             "timestamp": 1769717894000,
        //             "trade_id": 3888079980029324354,
        //             "type": "sell"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "base_volume": 729.7,
        //         "price": 0.001644,
        //         "quote_volume": 1.1996268,
        //         "timestamp": 1769717894000,
        //         "trade_id": 3888079980029324354,
        //         "type": "sell"
        //     }
        //
        const timestamp = this.safeInteger (trade, 'timestamp');
        const id = this.safeString (trade, 'trade_id');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'base_volume');
        const cost = this.safeNumber (trade, 'quote_volume');
        const sideRaw = this.safeString (trade, 'type');
        const side = (sideRaw === 'buy') ? 'buy' : 'sell';
        const symbol = this.safeString (market, 'symbol');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name o2exchange#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: Str = '1h', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolution = this.safeString (this.timeframes, timeframe, timeframe);
        const now = this.milliseconds ();
        // Default to last 24 hours if since not provided
        const from = (since !== undefined) ? since : (now - 86400000);
        const to = now;
        const request: Dict = {
            'market_id': market['id'],
            'resolution': resolution,
            'from': from.toString (),
            'to': to.toString (),
        };
        const response = await this.publicGetV1Bars (this.extend (request, params));
        //
        //     {
        //         "action": "bars",
        //         "market_id": "0x...",
        //         "bars": [
        //             {
        //                 "open": "1684000",
        //                 "close": "1687000",
        //                 "high": "1693000",
        //                 "low": "1679000",
        //                 "buy_volume": "161832200000000",
        //                 "sell_volume": "79888943294151",
        //                 "timestamp": 1769634000000
        //             }
        //         ]
        //     }
        //
        const bars = this.safeList (response, 'bars', []);
        return this.parseOHLCVs (bars, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //         "open": "1684000",
        //         "close": "1687000",
        //         "high": "1693000",
        //         "low": "1679000",
        //         "buy_volume": "161832200000000",
        //         "sell_volume": "79888943294151",
        //         "timestamp": 1769634000000
        //     }
        //
        // Get decimals from market info for conversion
        const marketInfo = this.safeDict (market, 'info', {});
        const baseInfo = this.safeDict (marketInfo, 'base', {});
        const quoteInfo = this.safeDict (marketInfo, 'quote', {});
        const baseDecimals = this.safeInteger (baseInfo, 'decimals', 9);
        const quoteDecimals = this.safeInteger (quoteInfo, 'decimals', 9);
        const baseDivisor = '1' + '0'.repeat (baseDecimals);
        const quoteDivisor = '1' + '0'.repeat (quoteDecimals);
        // Convert price values
        const openRaw = this.safeString (ohlcv, 'open');
        const highRaw = this.safeString (ohlcv, 'high');
        const lowRaw = this.safeString (ohlcv, 'low');
        const closeRaw = this.safeString (ohlcv, 'close');
        const open = this.parseNumber (Precise.stringDiv (openRaw, quoteDivisor));
        const high = this.parseNumber (Precise.stringDiv (highRaw, quoteDivisor));
        const low = this.parseNumber (Precise.stringDiv (lowRaw, quoteDivisor));
        const close = this.parseNumber (Precise.stringDiv (closeRaw, quoteDivisor));
        // Convert volume (buy_volume + sell_volume)
        const buyVolumeRaw = this.safeString (ohlcv, 'buy_volume', '0');
        const sellVolumeRaw = this.safeString (ohlcv, 'sell_volume', '0');
        const totalVolumeRaw = Precise.stringAdd (buyVolumeRaw, sellVolumeRaw);
        const volume = this.parseNumber (Precise.stringDiv (totalVolumeRaw, baseDivisor));
        const timestamp = this.safeInteger (ohlcv, 'timestamp');
        return [
            timestamp,
            open,
            high,
            low,
            close,
            volume,
        ];
    }

    sign (path: string, api = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]) + '/' + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (method === 'POST' || method === 'PUT') {
            headers = {
                'Content-Type': 'application/json',
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
