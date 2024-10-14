
//  ---------------------------------------------------------------------------

import Exchange from './abstract/cex.js';
import { ExchangeError, ArgumentsRequired, AuthenticationError, NullResponse, InvalidOrder, InsufficientFunds, InvalidNonce, OrderNotFound, RateLimitExceeded, DDoSProtection, BadSymbol } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Currency, Currencies, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, TradingFeeInterface, int, Account, Balances } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class cex
 * @augments Exchange
 */
export default class cex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cex',
            'name': 'CEX.IO',
            'countries': [ 'GB', 'EU', 'CY', 'RU' ],
            'rateLimit': 1666,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false, // has, but not through api
                'swap': false,
                'future': false,
                'option': false,
                'fetchTime': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchOrderBook': true,
                'fetchOHLCV': true,
                'fetchTradingFees': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
                'api': {
                    // 'rest': 'https://cex.io/api',
                    'public': 'https://trade.cex.io/api/spot/rest-public',
                    'private': 'https://trade.cex.io/api/spot/rest',
                },
                'www': 'https://cex.io',
                'doc': 'https://trade.cex.io/docs/',
                'fees': [
                    'https://cex.io/fee-schedule',
                    'https://cex.io/limits-commissions',
                ],
                'referral': 'https://cex.io/r/0/up105393824/0/',
            },
            'api': {
                'public': {
                    'get': {

                    },
                    'post': {
                        'get_server_time': 1,
                        'get_pairs_info': 1,
                        'get_currencies_info': 1,
                        'get_processing_info': 10,
                        'get_ticker': 1,
                        'get_trade_history': 1,
                        'get_order_book': 1,
                        'get_candles': 1,
                    },
                },
                'private': {
                    'get': {

                    },
                    'post': {
                        'get_my_current_fee': 5,
                        'get_fee_strategy': 1,
                        'get_my_volume': 5,
                        'do_create_account': 1,
                        'get_my_account_status_v3': 5,
                        'get_my_wallet_balance': 5,
                        'get_my_orders': 5,
                        'do_my_new_order': 1,
                        'do_cancel_my_order': 1,
                        'do_cancel_all_orders': 5,
                        'get_order_book': 1,
                        'get_candles': 1,
                        'get_trade_history': 1,
                        'get_my_transaction_history': 1,
                        'get_my_funding_history': 5,
                        'do_my_internal_transfer': 1,
                        'get_processing_info': 10,
                        'get_deposit_address': 5,
                        'do_deposit_funds_from_wallet': 1,
                        'do_withdrawal_funds_to_wallet': 1,
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {},
                'broad': {
                },
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '1d': '1d',
            },
            'options': {
                'networks': {
                    'BTC': 'bitcoin',
                    'ERC20': 'ERC20',
                    'BSC20': 'binancesmartchain',
                    'DOGE': 'dogecoin',
                    'ALGO': 'algorand',
                    'XLM': 'stellar',
                    'ATOM': 'cosmos',
                    'LTC': 'litecoin',
                    'XRP': 'ripple',
                    'FTM': 'fantom',
                    'MINA': 'mina',
                    'THETA': 'theta',
                    'XTZ': 'tezos',
                    'TIA': 'celestia',
                    'CRONOS': 'cronos', //
                    'MATIC': 'polygon',
                    'TON': 'ton',
                    'TRC20': 'tron',
                    'SOLANA': 'solana',
                    'SGB': 'songbird',
                    'DYDX': 'dydx',
                    'DASH': 'dash',
                    'ZIL': 'zilliqa',
                    'EOS': 'eos',
                    'AVALANCHEC': 'avalanche',
                    'ETHPOW': 'ethereumpow',
                    'NEAR': 'near',
                    'ARB': 'arbitrum',
                    'DOT': 'polkadot',
                    'OPT': 'optimism',
                    'INJ': 'injective',
                    'ADA': 'cardano',
                    'ONT': 'ontology',
                    'ICP': 'icp',
                    'KAVA': 'kava',
                    'KSM': 'kusama',
                    'SEI': 'sei',
                    // 'OSM': 'osmosis',
                    'NEO': 'neo',
                    'NEO3': 'neo3',
                    // 'TERRAOLD': 'terra', // tbd
                    // 'TERRA': 'terra2', // tbd
                    // 'EVER': 'everscale', // tbd
                    'XDC': 'xdc',
                },
            },
        });
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name cex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://trade.cex.io/docs/#rest-public-api-calls-currencies-info
         * @param {dict} [params] extra parameters specific to the exchange API endpoint
         * @returns {dict} an associative dictionary of currencies
         */
        const promise1 = this.publicPostGetCurrenciesInfo (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "currency": "ZAP",
        //                "fiat": false,
        //                "precision": "8",
        //                "walletPrecision": "6",
        //                "walletDeposit": true,
        //                "walletWithdrawal": true
        //            },
        //            ...
        //
        const promise2 = this.publicPostGetProcessingInfo (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "ADA": {
        //                "name": "Cardano",
        //                "blockchains": {
        //                    "cardano": {
        //                        "type": "coin",
        //                        "deposit": "enabled",
        //                        "minDeposit": "1",
        //                        "withdrawal": "enabled",
        //                        "minWithdrawal": "5",
        //                        "withdrawalFee": "1",
        //                        "withdrawalFeePercent": "0",
        //                        "depositConfirmations": "15"
        //                    }
        //                }
        //            },
        //            ...
        //
        const responses = await Promise.all ([ promise1, promise2 ]);
        const dataCurrencies = this.safeList (responses[0], 'data', []);
        const dataNetworks = this.safeDict (responses[1], 'data', {});
        const currenciesIndexed = this.indexBy (dataCurrencies, 'currency');
        const data = this.deepExtend (currenciesIndexed, dataNetworks);
        return this.parseCurrencies (this.values (data));
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const id = this.safeString (rawCurrency, 'currency');
        const code = this.safeCurrencyCode (id);
        const type = this.safeBool (rawCurrency, 'fiat') ? 'fiat' : 'crypto';
        const currencyDepositEnabled = this.safeBool (rawCurrency, 'walletDeposit');
        const currencyWithdrawEnabled = this.safeBool (rawCurrency, 'walletWithdrawal');
        const currencyPrecision = this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'precision')));
        const networks: Dict = {};
        const rawNetworks = this.safeDict (rawCurrency, 'blockchains', {});
        const keys = Object.keys (rawNetworks);
        for (let j = 0; j < keys.length; j++) {
            const networkId = keys[j];
            const rawNetwork = rawNetworks[networkId];
            const networkCode = this.networkIdToCode (networkId);
            const deposit = this.safeString (rawNetwork, 'deposit') === 'enabled';
            const withdraw = this.safeString (rawNetwork, 'withdrawal') === 'enabled';
            networks[networkCode] = {
                'id': networkId,
                'network': networkCode,
                'margin': undefined,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': this.safeNumber (rawNetwork, 'withdrawalFee'),
                'precision': currencyPrecision,
                'limits': {
                    'deposit': {
                        'min': this.safeNumber (rawNetwork, 'minDeposit'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (rawNetwork, 'minWithdrawal'),
                        'max': undefined,
                    },
                },
                'info': rawNetwork,
            };
        }
        return this.safeCurrencyStructure ({
            'id': id,
            'code': code,
            'name': undefined,
            'type': type,
            'active': undefined,
            'deposit': currencyDepositEnabled,
            'withdraw': currencyWithdrawEnabled,
            'fee': undefined,
            'precision': currencyPrecision,
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
            'networks': networks,
            'info': rawCurrency,
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name cex#fetchMarkets
         * @description retrieves data on all markets for ace
         * @see https://trade.cex.io/docs/#rest-public-api-calls-pairs-info
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicPostGetPairsInfo (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "base": "AI",
        //                "quote": "USD",
        //                "baseMin": "30",
        //                "baseMax": "2516000",
        //                "baseLotSize": "0.000001",
        //                "quoteMin": "10",
        //                "quoteMax": "1000000",
        //                "quoteLotSize": "0.01000000",
        //                "basePrecision": "6",
        //                "quotePrecision": "8",
        //                "pricePrecision": "4",
        //                "minPrice": "0.0377",
        //                "maxPrice": "19.5000"
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        const baseId = this.safeString (market, 'base');
        const base = this.safeCurrencyCode (baseId);
        const quoteId = this.safeString (market, 'quote');
        const quote = this.safeCurrencyCode (quoteId);
        const id = base + '-' + quote; // not actual id, but for this exchange we can use this abbreviation, because e.g. tickers have hyphen in between
        const symbol = base + '/' + quote;
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'baseId': baseId,
            'quote': quote,
            'quoteId': quoteId,
            'settle': undefined,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'limits': {
                'amount': {
                    'min': this.safeNumber (market, 'baseMin'),
                    'max': this.safeNumber (market, 'baseMax'),
                },
                'price': {
                    'min': this.safeNumber (market, 'minPrice'),
                    'max': this.safeNumber (market, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'quoteMin'),
                    'max': this.safeNumber (market, 'quoteMax'),
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': this.safeString (market, 'baseLotSize'),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision'))),
                // 'cost': this.parseNumber (this.parsePrecision (this.safeString (market, 'quoteLotSize'))), // buggy, doesn't reflect their documentation
                'base': this.parseNumber (this.parsePrecision (this.safeString (market, 'basePrecision'))),
                'quote': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
            },
            'active': undefined,
            'created': undefined,
            'info': market,
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name cex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicPostGetServerTime (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "timestamp": "1728472063472",
        //            "ISODate": "2024-10-09T11:07:43.472Z"
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data');
        const timestamp = this.safeInteger (data, 'timestamp');
        return timestamp;
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name cex#fetchTicker
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://trade.cex.io/docs/#rest-public-api-calls-ticker
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.fetchTickers ([ symbol ], params);
        return this.safeDict (response, symbol, {}) as Ticker;
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name cex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://trade.cex.io/docs/#rest-public-api-calls-ticker
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            request['pairs'] = this.marketIds (symbols);
        }
        const response = await this.publicPostGetTicker (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "AI-USD": {
        //                "bestBid": "0.3917",
        //                "bestAsk": "0.3949",
        //                "bestBidChange": "0.0035",
        //                "bestBidChangePercentage": "0.90",
        //                "bestAskChange": "0.0038",
        //                "bestAskChangePercentage": "0.97",
        //                "low": "0.3787",
        //                "high": "0.3925",
        //                "volume30d": "2945.722277",
        //                "lastTradeDateISO": "2024-10-11T06:18:42.077Z",
        //                "volume": "120.736000",
        //                "quoteVolume": "46.65654070",
        //                "lastTradeVolume": "67.914000",
        //                "volumeUSD": "46.65",
        //                "last": "0.3949",
        //                "lastTradePrice": "0.3925",
        //                "priceChange": "0.0038",
        //                "priceChangePercentage": "0.97"
        //            },
        //            ...
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseTickers (data, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'id');
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'bestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'lastTradePrice'),
            'previousClose': undefined,
            'change': this.safeNumber (ticker, 'priceChange'),
            'percentage': this.safeNumber (ticker, 'priceChangePercentage'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name cex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://trade.cex.io/docs/#rest-public-api-calls-trade-history
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['fromDateISO'] = this.iso8601 (since);
        }
        let until = undefined;
        [ until, params ] = this.handleParamInteger2 (params, 'until', 'till');
        if (until !== undefined) {
            request['toDateISO'] = this.iso8601 (until);
        }
        if (limit !== undefined) {
            request['pageSize'] = Math.min (limit, 10000); // has a bug, still returns more trades
        }
        const response = await this.publicPostGetTradeHistory (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "pageSize": "10",
        //            "trades": [
        //                {
        //                    "tradeId": "1728630559823-0",
        //                    "dateISO": "2024-10-11T07:09:19.823Z",
        //                    "side": "SELL",
        //                    "price": "60879.5",
        //                    "amount": "0.00165962"
        //                },
        //                ... followed by older trades
        //
        const data = this.safeDict (response, 'data', {});
        const trades = this.safeList (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // public fetchTrades
        //
        //                {
        //                    "tradeId": "1728630559823-0",
        //                    "dateISO": "2024-10-11T07:09:19.823Z",
        //                    "side": "SELL",
        //                    "price": "60879.5",
        //                    "amount": "0.00165962"
        //                },
        //
        const dateStr = this.safeString (trade, 'dateISO');
        const timestamp = this.parse8601 (dateStr);
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': this.safeString (trade, 'tradeId'),
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name cex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://trade.cex.io/docs/#rest-public-api-calls-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
        };
        const response = await this.publicPostGetOrderBook (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "timestamp": "1728636922648",
        //            "currency1": "BTC",
        //            "currency2": "USDT",
        //            "bids": [
        //                [
        //                    "60694.1",
        //                    "13.12849761"
        //                ],
        //                [
        //                    "60694.0",
        //                    "0.71829244"
        //                ],
        //                ...
        //
        const orderBook = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (orderBook, 'timestamp');
        return this.parseOrderBook (orderBook, market['symbol'], timestamp);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name cex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://trade.cex.io/docs/#rest-public-api-calls-candles
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const dataType = this.safeString (params, 'dataType');
        if (dataType === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a parameter "dataType" to be either "bestBid" or "bestAsk"');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'pair': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['fromISO'] = this.iso8601 (since);
        }
        let until = undefined;
        [ until, params ] = this.handleParamInteger2 (params, 'until', 'till');
        if (until !== undefined) {
            request['toISO'] = this.iso8601 (until);
        } else if (since === undefined) {
            // exchange still requires that we provide one of them
            request['toISO'] = this.iso8601 (this.milliseconds ());
        }
        if (since !== undefined && until !== undefined && limit !== undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV does not support fetching candles with both a limit and since/until');
        } else if ((since !== undefined || until !== undefined) && limit === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOHLCV requires a limit parameter when fetching candles with since or until');
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicPostGetCandles (this.extend (request, params));
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "timestamp": "1728643320000",
        //                "open": "61061",
        //                "high": "61095.1",
        //                "low": "61048.5",
        //                "close": "61087.8",
        //                "volume": "0",
        //                "resolution": "1m",
        //                "isClosed": true,
        //                "timestampISO": "2024-10-11T10:42:00.000Z"
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
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

    async fetchTradingFees (params = {}): Promise<TradingFees> {
        /**
         * @method
         * @name cex#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @see https://trade.cex.io/docs/#rest-public-api-calls-candles
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privatePostGetMyCurrentFee (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "tradingFee": {
        //                "AI-USD": {
        //                    "percent": "0.25"
        //                },
        //                ...
        //
        const data = this.safeDict (response, 'data', {});
        const fees = this.safeDict (data, 'tradingFee', {});
        return this.parseTradingFees (fees, true);
    }

    parseTradingFees (response, useKeyAsId = false): TradingFees {
        const result: Dict = {};
        const keys = this.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            let market = undefined;
            if (useKeyAsId) {
                market = this.safeMarket (key);
            }
            const parsed = this.parseTradingFee (response[key], market);
            result[parsed['symbol']] = parsed;
        }
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            if (!(symbol in result)) {
                const market = this.market (symbol);
                result[symbol] = this.parseTradingFee (response, market);
            }
        }
        return result;
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        return {
            'info': fee,
            'symbol': this.safeString (market, 'symbol'),
            'maker': this.safeNumber (fee, 'percent'),
            'taker': this.safeNumber (fee, 'percent'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }

    async fetchAccounts (params = {}): Promise<Account[]> {
        await this.loadMarkets ();
        const response = await this.privatePostGetMyAccountStatusV3 (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "convertedCurrency": "USD",
        //            "balancesPerAccounts": {
        //                "": {
        //                    "AI": {
        //                        "balance": "0.000000",
        //                        "balanceOnHold": "0.000000"
        //                    },
        //                    "USDT": {
        //                        "balance": "0.00000000",
        //                        "balanceOnHold": "0.00000000"
        //                    }
        //                }
        //            }
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        const balances = this.safeDict (data, 'balancesPerAccounts', {});
        const arrays = this.toArray (balances);
        return this.parseAccounts (arrays, params);
    }

    parseAccount (account: Dict): Account {
        return {
            'id': undefined,
            'type': undefined,
            'code': undefined,
            'info': account,
        };
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name cex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://trade.cex.io/docs/#rest-private-api-calls-account-status-v3
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {object} [params.method] 'privatePostGetMyWalletBalance' or 'privatePostGetMyAccountStatusV3'
         * @param {object} [params.account]  in case 'privatePostGetMyAccountStatusV3' is chosen, this can specify the account name (default is empty string)
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        let accountName = undefined;
        [ accountName, params ] = this.handleParamString (params, 'account', ''); // default is empty string
        let method = undefined;
        [ method, params ] = this.handleParamString (params, 'method', 'privatePostGetMyWalletBalance');
        let accountBalance = undefined;
        if (method === 'privatePostGetMyAccountStatusV3') {
            const response = await this.privatePostGetMyAccountStatusV3 (params);
            //
            //    {
            //        "ok": "ok",
            //        "data": {
            //            "convertedCurrency": "USD",
            //            "balancesPerAccounts": {
            //                "": {
            //                    "AI": {
            //                        "balance": "0.000000",
            //                        "balanceOnHold": "0.000000"
            //                    },
            //                    ....
            //
            const data = this.safeDict (response, 'data', {});
            const balances = this.safeDict (data, 'balancesPerAccounts', {});
            accountBalance = this.safeDict (balances, accountName, {});
        } else {
            const response = await this.privatePostGetMyWalletBalance (params);
            //
            //    {
            //        "ok": "ok",
            //        "data": {
            //            "AI": {
            //                "balance": "25.606429"
            //            },
            //            "USDT": {
            //                "balance": "7.935449"
            //            },
            //            ...
            //
            accountBalance = this.safeDict (response, 'data', {});
        }
        return this.parseBalance (accountBalance);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        const keys = this.keys (response);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const balance = this.safeDict (response, key, {});
            const code = this.safeCurrencyCode (key);
            const account: Dict = {
                'used': this.safeString (balance, 'balanceOnHold'),
                'free': this.safeString (balance, 'balance'),
            };
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchOrdersByStatus (status: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name cex#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://trade.cex.io/docs/#rest-private-api-calls-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        const isClosedOrders = (status === 'closed');
        if (isClosedOrders) {
            request['archived'] = true;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['serverCreateTimestampFrom'] = since;
        } else if (isClosedOrders) {
            // exchange requires a `since` parameter for closed orders, so set default to allowed 365
            request['serverCreateTimestampFrom'] = this.milliseconds () - 364 * 24 * 60 * 60 * 1000;
        }
        let until = undefined;
        [ until, params ] = this.handleParamInteger2 (params, 'until', 'till');
        if (until !== undefined) {
            request['serverCreateTimestampTo'] = until;
        }
        const response = await this.privatePostGetMyOrders (this.extend (request, params));
        //
        // if called without `pair`
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "orderId": "1313003",
        //                "clientOrderId": "037F0AFEB93A",
        //                "clientId": "up132245425",
        //                "accountId": null,
        //                "status": "FILLED",
        //                "statusIsFinal": true,
        //                "currency1": "AI",
        //                "currency2": "USDT",
        //                "side": "BUY",
        //                "orderType": "Market",
        //                "timeInForce": "IOC",
        //                "comment": null,
        //                "rejectCode": null,
        //                "rejectReason": null,
        //                "initialOnHoldAmountCcy1": null,
        //                "initialOnHoldAmountCcy2": "10.23456700",
        //                "executedAmountCcy1": "25.606429",
        //                "executedAmountCcy2": "10.20904439",
        //                "requestedAmountCcy1": null,
        //                "requestedAmountCcy2": "10.20904439",
        //                "originalAmountCcy2": "10.23456700",
        //                "feeAmount": "0.02552261",
        //                "feeCurrency": "USDT",
        //                "price": null,
        //                "averagePrice": "0.3986",
        //                "clientCreateTimestamp": "1728474625320",
        //                "serverCreateTimestamp": "1728474624956",
        //                "lastUpdateTimestamp": "1728474628015",
        //                "expireTime": null,
        //                "effectiveTime": null
        //            },
        //            ...
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cex#fetchClosedOrders
         * @description fetches information on multiple canceled orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] timestamp in ms of the earliest order, default is undefined
         * @param {int} [limit] max number of orders to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersByStatus ('closed', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name cex#fetchOpenOrders
         * @description fetches information on multiple canceled orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] timestamp in ms of the earliest order, default is undefined
         * @param {int} [limit] max number of orders to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'FILLED': 'closed',
            'CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, undefined);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        //                "orderId": "1313003",
        //                "clientOrderId": "037F0AFEB93A",
        //                "clientId": "up132245425",
        //                "accountId": null,
        //                "status": "FILLED",
        //                "statusIsFinal": true,
        //                "currency1": "AI",
        //                "currency2": "USDT",
        //                "side": "BUY",
        //                "orderType": "Market",
        //                "timeInForce": "IOC",
        //                "comment": null,
        //                "rejectCode": null,
        //                "rejectReason": null,
        //                "initialOnHoldAmountCcy1": null,
        //                "initialOnHoldAmountCcy2": "10.23456700",
        //                "executedAmountCcy1": "25.606429",
        //                "executedAmountCcy2": "10.20904439",
        //                "requestedAmountCcy1": null,
        //                "requestedAmountCcy2": "10.20904439",
        //                "originalAmountCcy2": "10.23456700",
        //                "feeAmount": "0.02552261",
        //                "feeCurrency": "USDT",
        //                "price": null,
        //                "averagePrice": "0.3986",
        //                "clientCreateTimestamp": "1728474625320",
        //                "serverCreateTimestamp": "1728474624956",
        //                "lastUpdateTimestamp": "1728474628015",
        //                "expireTime": null,
        //                "effectiveTime": null
        //
        const currency1 = this.safeString (order, 'currency1');
        const currency2 = this.safeString (order, 'currency2');
        const marketId = currency1 + '-' + currency2;
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const fee = {};
        const feeAmount = this.safeNumber (order, 'feeAmount');
        if (feeAmount !== undefined) {
            const currencyId = this.safeString (order, 'feeCurrency');
            const feeCode = this.safeCurrencyCode (currencyId);
            fee['currency'] = feeCode;
            fee['fee'] = feeAmount;
        }
        const timestamp = this.safeInteger (order, 'serverCreateTimestamp');
        const requestedBase = this.safeNumber (order, 'requestedAmountCcy1');
        const executedBase = this.safeNumber (order, 'executedAmountCcy1');
        // const requestedQuote = this.safeNumber (order, 'requestedAmountCcy2');
        const executedQuote = this.safeNumber (order, 'executedAmountCcy2');
        return this.safeOrder ({
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': this.safeInteger (order, 'lastUpdateTimestamp'),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': this.safeStringLower (order, 'orderType'),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': undefined,
            'side': this.safeStringLower (order, 'side'),
            'price': this.safeNumber (order, 'price'),
            'stopPrice': undefined,
            'amount': requestedBase,
            'cost': executedQuote,
            'average': this.safeNumber (order, 'averagePrice'),
            'filled': executedBase,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
            'info': order,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                body = this.json (query);
                headers = {
                    'Content-Type': 'application/json',
                };
            }
        } else {
            this.checkRequiredCredentials ();
            const seconds = this.seconds ().toString ();
            body = this.json (query);
            const auth = path + seconds + body;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'base64');
            headers = {
                'Content-Type': 'application/json',
                'X-AGGR-KEY': this.apiKey,
                'X-AGGR-TIMESTAMP': seconds,
                'X-AGGR-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        // if (Array.isArray (response)) {
        //     return response; // public endpoints may return []-arrays
        // }
        // if (body === 'true') {
        //     return undefined;
        // }
        // if (response === undefined) {
        //     throw new NullResponse (this.id + ' returned ' + this.json (response));
        // }
        // if ('e' in response) {
        //     if ('ok' in response) {
        //         if (response['ok'] === 'ok') {
        //             return undefined;
        //         }
        //     }
        // }
        // if ('error' in response) {
        //     const message = this.safeString (response, 'error');
        //     const feedback = this.id + ' ' + body;
        //     this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        //     this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        //     throw new ExchangeError (feedback);
        // }
        // return undefined;
    }
}
