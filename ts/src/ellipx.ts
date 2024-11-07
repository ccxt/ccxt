
// ---------------------------------------------------------------------------

import Exchange from './abstract/ellipx.js';
import { AuthenticationError, BadRequest, DDoSProtection, ExchangeError, PermissionDenied } from './base/errors.js';
// import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
// import type { Account, Balances, Bool, Currencies, Currency, Dict, FundingRateHistory, LastPrice, LastPrices, Leverage, LeverageTier, LeverageTiers, Int, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, TransferEntry } from './base/types.js';
import { Dict, Market, Ticker } from '../ccxt.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';
import { eddsa } from './base/functions/crypto.js';
// ---------------------------------------------------------------------------

/**
 * @class ellipx
 * @augments Exchange
 */
export default class ellipx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ellipx',
            'name': 'Ellipx',
            'countries': [ 'PL' ],
            'rateLimit': 200, // todo check
            'version': 'v1',
            'certified': false,
            'pro': false,
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
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': true,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrderWithTakeProfitAndStopLoss': false,
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
                'fetchBalance': true,
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
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
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
                'fetchOHLCV': false,
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
                'fetchPositionsForSymbol': false,
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
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '10m': '10m',
                '1h': '1h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'public': 'https://data.ellipx.com',
                    'private': 'https://app.ellipx.com/_rest',
                    '_rest': 'https://app.ellipx.com/_rest',
                },
                'www': 'https://www.ellipx.com',
                'doc': 'https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM',
                'fees': 'https://www.ellipx.com/pages/pricing',
                'referral': '', // todo
            },
            'api': {
                '_rest': {
                    'get': {
                        'Market': 1,
                        'Market/{currencyPair}': 1,
                    },
                },
                'public': {
                    'get': {
                        'Market/{currencyPair}:getDepth': 1,
                        'Market/{currencyPair}:ticker': 1,
                        'Market/{currencyPair}:getTrades': 1,
                        'Market/{currencyPair}:getGraph': 1,
                        'CMC:summary': 1,
                        'CMC/{currencyPair}:ticker': 1,
                    },
                },
                'private': {
                    'get': {
                        'User/Wallet': 1,
                        'Market/{currencyPair}/Order': 1,
                        'Market/TradeFee:query': 1,
                        'Unit/{currency}': 1,
                        'Crypto/Token/{currency}': 1,
                        'Crypto/Token/{currency}:chains': 1,
                        'Crypto/Token/Info': 1,
                    },
                    'post': {
                        'Market/{currencyPair}/Order': 1,
                        'Crypto/Address:fetch': 1,
                        'Crypto/Disbursement:withdraw': 1,
                    },
                    'delete': {
                        'Market/Order/{orderUuid}': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'feeSide': 'get',
                    'percentage': true,
                    'maker': this.parseNumber ('0.0025'),  // default 25bps
                    'taker': this.parseNumber ('0.0030'),  // default 30bps
                    'tiers': {
                        // volume in USDT
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0025') ],     // 0-10k: 25bps
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0020') ], // 10k-50k: 20bps
                            [ this.parseNumber ('50000'), this.parseNumber ('0.0015') ], // 50k-100k: 15bps
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0010') ], // 100k-1M: 10bps
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0008') ], // 1M-5M: 8bps
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0003') ], // 5M-15M: 3bps
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.0000') ], // 15M-75M: 0bps
                            [ this.parseNumber ('75000000'), this.parseNumber ('0.0000') ], // 75M-100M: 0bps
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.0000') ], // 100M+: 0bps
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0030') ],     // 0-10k: 30bps
                            [ this.parseNumber ('10000'), this.parseNumber ('0.0025') ], // 10k-50k: 25bps
                            [ this.parseNumber ('50000'), this.parseNumber ('0.0020') ], // 50k-100k: 20bps
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0015') ], // 100k-1M: 15bps
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0012') ], // 1M-5M: 12bps
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0010') ], // 5M-15M: 10bps
                            [ this.parseNumber ('15000000'), this.parseNumber ('0.0008') ], // 15M-75M: 8bps
                            [ this.parseNumber ('75000000'), this.parseNumber ('0.0005') ], // 75M-100M: 5bps
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.0003') ], // 100M+: 3bps
                        ],
                    },
                },
                'stablecoin': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0000'),  // 0%
                    'taker': this.parseNumber ('0.000015'), // 0.0015%
                },
            },
            'options': {
                'defaultType': 'spot',
                'recvWindow': 5 * 1000,
                'broker': 'CCXT',
                'networks': {
                    // todo
                },
                'networksById': {
                    // todo
                },
                'defaultNetwork': 'ERC20',
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    // todo
                    '400': BadRequest,
                    '401': AuthenticationError,
                    '403': PermissionDenied,
                    '404': BadRequest,
                    '429': DDoSProtection,
                    '418': PermissionDenied,
                    '500': ExchangeError,
                    '504': ExchangeError,
                },
                'broad': {},
            },
            'precisionMode': TICK_SIZE,
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const authentication = api;
        let url = undefined;
        if (authentication === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.uuid ();
            const timestamp = this.seconds ().toString ();
            params = this.extend ({
                '_key': this.apiKey,
                '_time': timestamp,
                '_nonce': nonce,
            }, params);
            const query = this.urlencode (params);
            if (body === undefined) {
                body = '';
            } else {
                body = this.json (body);
            }
            const bodyHash = this.hash (this.encode (body), sha256);
            const elements = [
                method,
                path,
                query,
                bodyHash,
            ];
            const signString = elements.join ('\x00');
            const signature = this.urlencodeBase64 (eddsa (this.encode (signString), this.encode (this.secret).slice (-32), ed25519));
            params['_sign'] = signature;
            url = this.urls['api'][api] + '/' + path;
            if (method === 'GET' && Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            } else {
                body = this.json (params);
                headers = {
                    'Content-Type': 'application/json',
                };
            }
        } else {
            url = this.urls['api'][api] + '/' + path;
            if (method === 'GET') {
                if (path.includes ('{currencyPair}') && params['currencyPair']) {
                    url = url.replace ('{currencyPair}', params['currencyPair']);
                    delete params['currencyPair'];
                }
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            } else {
                body = this.json (params);
                headers = {
                    'Content-Type': 'application/json',
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        /**
         * Fetches market information from the exchange.
         * @see https://docs.ccxt.com/en/latest/manual.html#markets
         * @param {object} [params={}] - Extra parameters specific to the exchange API endpoint
         * @returns {Promise<object[]>} An array of market structures, each containing:
         *    - {string} id - The market ID in the exchange-specific format
         *    - {string} symbol - The unified market symbol (e.g., 'BTC/USD')
         *    - {string} base - The base currency
         *    - {string} quote - The quote currency
         *    - {object} limits - The trading limits { amount, price, cost }
         *    - {object} precision - The price precision by market { amount, price }
         *    - {boolean} active - True if the market is active, false otherwise
         * @throws {ExchangeError} If the exchange API request fails or returns error response
         */
        const response = await this._restGetMarket (params);
        const request_id = this.safeString (response, 'request_id');
        if (response.result !== 'success') {
            throw new ExchangeError ('Failed to fetch markets: ' + request_id);
        }
        return this.parseMarkets (response.data);
    }

    parseMarkets (markets): Market[] {
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            result.push (this.parseMarket (markets[i]));
        }
        return result;
    }

    parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'Market__');
        const baseId = this.safeString (market, 'Primary_Unit__');
        const quoteId = this.safeString (market, 'Secondary_Unit__');
        const base = this.safeString (market['Primary'], 'Key');
        const quote = this.safeString (market['Secondary'], 'Key');
        const status = this.safeString (market, 'Status') === 'active';
        const created = this.safeInteger (market['Created'], 'unix');
        const amountPrecision = this.safeInteger (market['Primary'], 'Decimals');
        const pricePrecision = this.safeInteger (market['Secondary'], 'Decimals');
        return {
            'id': id,
            'symbol': base + '/' + quote,
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
            'active': status,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amountPrecision,
                'price': pricePrecision,
            },
            'limits': {
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
            'info': market,
            'created': created,
        };
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name ellipx#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketSymbol = market['symbol'].replace ('/', '_'); // Convert BTC/USDC to BTC_USDC
        const request = {
            'currencyPair': marketSymbol,
        };
        const response = await this.publicGetMarketCurrencyPairTicker (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "market": "BTC_USDC",
        //             "ticker": {
        //                 "time": 1730814600,
        //                 "count": 2135,
        //                 "high": {
        //                     "v": "74766990000",
        //                     "e": 6,
        //                     "f": 74766.99
        //                 },
        //                 "low": {
        //                     "v": "68734020000",
        //                     "e": 6,
        //                     "f": 68734.02
        //                 },
        //                 "avg": {
        //                     "v": "72347941430",
        //                     "e": 6,
        //                     "f": 72347.94143
        //                 },
        //                 "vwap": {
        //                     "v": "73050064447",
        //                     "e": 6,
        //                     "f": 73050.064447
        //                 },
        //                 "vol": {
        //                     "v": "4885361",
        //                     "e": 8,
        //                     "f": 0.04885361
        //                 },
        //                 "secvol": {
        //                     "v": "3568759346",
        //                     "e": 6,
        //                     "f": 3568.759346
        //                 },
        //                 "open": {
        //                     "v": "68784020000",
        //                     "e": 6,
        //                     "f": 68784.02
        //                 },
        //                 "close": {
        //                     "v": "73955570000",
        //                     "e": 6,
        //                     "f": 73955.57
        //                 }
        //             }
        //         },
        //         "request_id": "cbf183e0-7a62-4674-838c-6693031fa240",
        //         "result": "success",
        //         "time": 0.015463566
        //     }
        //
        if (response['result'] !== 'success') {
            throw new ExchangeError (this.id + ' fetchTicker() failed: ' + this.json (response));
        }
        const ticker = this.safeValue (response['data'], 'ticker', {});
        return this.parseTicker (ticker, market);
    }

    parseAmount (amount: Dict): number {
        const v = this.safeString (amount, 'v');
        const e = this.safeInteger (amount, 'e');
        const v_int = parseInt (v);
        return v_int * Math.pow (10, -e);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const timestamp = this.safeInteger (ticker, 'time') * 1000;
        const high = this.parseAmount (this.safeValue (ticker, 'high', {}));
        const low = this.parseAmount (this.safeValue (ticker, 'low', {}));
        const avg = this.parseAmount (this.safeValue (ticker, 'avg', {}));
        const vwap = this.parseAmount (this.safeValue (ticker, 'vwap', {}));
        const baseVolume = this.parseAmount (this.safeValue (ticker, 'vol', {}));
        const quoteVolume = this.parseAmount (this.safeValue (ticker, 'secvol', {}));
        const open = this.parseAmount (this.safeValue (ticker, 'open', {}));
        const close = this.parseAmount (this.safeValue (ticker, 'close', {}));
        // const count = this.safeInteger(ticker, 'count'); not used
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': avg,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
}
