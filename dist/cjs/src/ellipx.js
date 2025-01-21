'use strict';

var ellipx$1 = require('./abstract/ellipx.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
require('../ccxt.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var ed25519 = require('./static_dependencies/noble-curves/ed25519.js');
var crypto = require('./base/functions/crypto.js');
var Precise = require('./base/Precise.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
/**
 * @class ellipx
 * @augments Exchange
 */
class ellipx extends ellipx$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'ellipx',
            'name': 'Ellipx',
            'countries': ['PL'],
            'rateLimit': 200,
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
                'createDepositAddress': false,
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
                'fetchDepositAddress': true,
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
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': true,
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
                'logo': 'https://github.com/user-attachments/assets/e07c3f40-281c-4cdf-bacf-fa1c58218a2c',
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
                        'Crypto/Token/Info': 1,
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
                        'Market/Order/{orderUuid}': 1,
                        'Market/{currencyPair}/Trade': 1,
                        'Market/TradeFee:query': 1,
                        'Unit/{currency}': 1,
                        'Crypto/Token/{currency}': 1,
                        'Crypto/Token/{currency}:chains': 1,
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
                    'maker': this.parseNumber('0.0025'),
                    'taker': this.parseNumber('0.0030'),
                    'tiers': {
                        // volume in USDT
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.0025')],
                            [this.parseNumber('10000'), this.parseNumber('0.0020')],
                            [this.parseNumber('50000'), this.parseNumber('0.0015')],
                            [this.parseNumber('100000'), this.parseNumber('0.0010')],
                            [this.parseNumber('1000000'), this.parseNumber('0.0008')],
                            [this.parseNumber('5000000'), this.parseNumber('0.0003')],
                            [this.parseNumber('15000000'), this.parseNumber('0.0000')],
                            [this.parseNumber('75000000'), this.parseNumber('0.0000')],
                            [this.parseNumber('100000000'), this.parseNumber('0.0000')], // 100M+: 0bps
                        ],
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.0030')],
                            [this.parseNumber('10000'), this.parseNumber('0.0025')],
                            [this.parseNumber('50000'), this.parseNumber('0.0020')],
                            [this.parseNumber('100000'), this.parseNumber('0.0015')],
                            [this.parseNumber('1000000'), this.parseNumber('0.0012')],
                            [this.parseNumber('5000000'), this.parseNumber('0.0010')],
                            [this.parseNumber('15000000'), this.parseNumber('0.0008')],
                            [this.parseNumber('75000000'), this.parseNumber('0.0005')],
                            [this.parseNumber('100000000'), this.parseNumber('0.0003')], // 100M+: 3bps
                        ],
                    },
                },
                'stablecoin': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber('0.0000'),
                    'taker': this.parseNumber('0.000015'), // 0.0015%
                },
            },
            'options': {
                'defaultType': 'spot',
                'recvWindow': 5 * 1000,
                'broker': 'CCXT',
                'networks': {
                    'Bitcoin': 'Bitcoin',
                    'Ethereum': 'ERC20',
                },
                'defaultNetwork': 'defaultNetwork',
                'defaultNetworkCodeReplacements': {
                    'BTC': 'Bitcoin',
                    'ETH': 'Ethereum',
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'selfTradePrevention': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': undefined,
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 100,
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
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    // todo
                    '400': errors.BadRequest,
                    '401': errors.AuthenticationError,
                    '403': errors.PermissionDenied,
                    '404': errors.BadRequest,
                    '429': errors.DDoSProtection,
                    '418': errors.PermissionDenied,
                    '500': errors.ExchangeError,
                    '504': errors.ExchangeError,
                },
                'broad': {},
            },
            'precisionMode': number.TICK_SIZE,
        });
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams(path, params);
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials();
            const nonce = this.uuid();
            const timestamp = this.seconds().toString();
            if (method === 'GET') {
                body = '';
            }
            else {
                body = this.json(params);
            }
            params = this.extend({
                '_key': this.apiKey,
                '_time': timestamp,
                '_nonce': nonce,
            }, params);
            const query = this.urlencode(params);
            const bodyHash = this.hash(this.encode(body), sha256.sha256);
            // Create sign string components
            const bodyHashBytes = this.base16ToBinary(bodyHash);
            const nulByte = this.numberToBE(0, 1);
            const components = [
                this.encode(method),
                nulByte,
                this.encode(path),
                nulByte,
                this.encode(query),
                nulByte,
                bodyHashBytes,
            ];
            // Join with null byte separator using encode
            const signString = this.binaryConcatArray(components);
            const sec = this.secret;
            const remainder = this.calculateMod(sec.length, 4);
            const paddingLength = remainder ? 4 - remainder : 0;
            let secretWithPadding = this.secret.replaceAll('-', '+');
            secretWithPadding = secretWithPadding.replaceAll('_', '/');
            secretWithPadding = secretWithPadding.padEnd(this.secret.length + paddingLength, '=');
            const secretBytes = this.base64ToBinary(secretWithPadding);
            const seed = this.arraySlice(secretBytes, 0, 32); // Extract first 32 bytes as seed
            const signature = crypto.eddsa(signString, seed, ed25519.ed25519);
            params['_sign'] = signature;
        }
        if (Object.keys(params).length) {
            url += '?' + this.urlencode(params);
        }
        if (method === 'GET') {
            body = undefined;
        }
        else {
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    calculateMod(a, b) {
        // trick to fix php transpiling error
        return a % b;
    }
    /**
     * @method
     * @name ellipx#fetchMarkets
     * @description Fetches market information from the exchange.
     * @see https://docs.ccxt.com/en/latest/manual.html#markets
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.1a1t05wpgfof
     * @param {object} [params] - Extra parameters specific to the exchange API endpoint
     * @returns {Promise<Market[]>} An array of market structures.
     */
    async fetchMarkets(params = {}) {
        const response = await this._restGetMarket(params);
        // {
        //     Market__: "mkt-lrnp2e-eaor-eobj-ua73-75j6sjxe",
        //     Primary_Unit__: "unit-aebkye-u35b-e5zm-zt22-2qvwhsqa",
        //     Secondary_Unit__: "unit-jcevlk-soxf-fepb-yjwm-b32q5bom",
        //     Primary_Step: null,
        //     Secondary_Step: null,
        //     Status: "active",
        //     Default_Scale: "5",
        //     Priority: "100",
        //     Created: {
        //       unix: "1728113809",
        //       us: "0",
        //       iso: "2024-10-05 07:36:49.000000",
        //       tz: "UTC",
        //       full: "1728113809000000",
        //       unixms: "1728113809000",
        //     },
        //     Start: {
        //       unix: "1728295200",
        //       us: "0",
        //       iso: "2024-10-07 10:00:00.000000",
        //       tz: "UTC",
        //       full: "1728295200000000",
        //       unixms: "1728295200000",
        //     },
        //     Key: "BTC_USDC",
        //     Primary: {
        //       Unit__: "unit-aebkye-u35b-e5zm-zt22-2qvwhsqa",
        //       Currency__: "BTC",
        //       Crypto_Token__: "crtok-c5v3mh-grfn-hl5d-lmel-fvggbf4i",
        //       Key: "BTC",
        //       Symbol: "BTC",
        //       Symbol_Position: "after",
        //       Name: "Bitcoin",
        //       Decimals: "8",
        //       Display_Decimals: "8",
        //       Legacy_Decimals: null,
        //       Type: "crypto_token",
        //       Visible: "Y",
        //       Created: {
        //         unix: "1495247415",
        //         us: "0",
        //         iso: "2017-05-20 02:30:15.000000",
        //         tz: "UTC",
        //         full: "1495247415000000",
        //         unixms: "1495247415000",
        //       },
        //     },
        //     Secondary: {
        //       Unit__: "unit-jcevlk-soxf-fepb-yjwm-b32q5bom",
        //       Currency__: null,
        //       Crypto_Token__: "crtok-ptabkh-ra4r-anbd-cqra-bqfbtnba",
        //       Key: "USDC",
        //       Symbol: null,
        //       Symbol_Position: "before",
        //       Name: "Circle USD",
        //       Decimals: "6",
        //       Display_Decimals: "6",
        //       Legacy_Decimals: null,
        //       Type: "crypto_token",
        //       Visible: "Y",
        //       Created: {
        //         unix: "1694859829",
        //         us: "0",
        //         iso: "2023-09-16 10:23:49.000000",
        //         tz: "UTC",
        //         full: "1694859829000000",
        //         unixms: "1694859829000",
        //       },
        //     },
        //   }
        const markets = this.safeValue(response, 'data', []);
        return this.parseMarkets(markets);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'Key');
        const base = this.safeString(market['Primary'], 'Key');
        const quote = this.safeString(market['Secondary'], 'Key');
        const baseId = this.safeString(market['Primary'], 'Crypto_Token__');
        const quoteId = this.safeString(market['Secondary'], 'Crypto_Token__');
        const status = this.safeString(market, 'Status') === 'active';
        const created = this.safeTimestamp(market['Created'], 'unix');
        const amountPrecision = this.parseNumber(this.parsePrecision(this.safeString(market['Primary'], 'Decimals')));
        const pricePrecision = this.parseNumber(this.parsePrecision(this.safeString(market['Secondary'], 'Decimals')));
        const fees = this.fees; // should use fetchTradingFees
        return this.safeMarketStructure({
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
            'taker': fees['trading']['taker'],
            'maker': fees['trading']['maker'],
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
        });
    }
    /**
     * @method
     * @name ellipx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.d2jylz4u6pmu
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const marketId = market['id'];
        const request = {
            'currencyPair': marketId,
        };
        const response = await this.publicGetMarketCurrencyPairTicker(this.extend(request, params));
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
        const ticker = this.safeValue(response['data'], 'ticker', {});
        return this.parseTicker(ticker, market);
    }
    parseTicker(ticker, market = undefined) {
        const timestamp = this.safeIntegerProduct(ticker, 'time', 1000);
        const open = this.parseAmount(this.safeValue(ticker, 'open'));
        const high = this.parseAmount(this.safeValue(ticker, 'high'));
        const low = this.parseAmount(this.safeValue(ticker, 'low'));
        const close = this.parseAmount(this.safeValue(ticker, 'close'));
        const avg = this.parseAmount(this.safeValue(ticker, 'avg'));
        const vwap = this.parseAmount(this.safeValue(ticker, 'vwap'));
        const baseVolume = this.parseAmount(this.safeValue(ticker, 'vol'));
        const quoteVolume = this.parseAmount(this.safeValue(ticker, 'secvol'));
        // const count = this.safeInteger(ticker, 'count'); not used
        return this.safeTicker({
            'symbol': this.safeSymbol(undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
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
    /**
     * @method
     * @name ellipx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.bqmucewhkpdz
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return the exchange not supported yet.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const marketId = market['id'];
        const request = {
            'currencyPair': marketId,
        };
        const response = await this.publicGetMarketCurrencyPairGetDepth(this.extend(request, params));
        // {
        //     "data": {
        //         "asks": [
        //             {
        //                 "price": {
        //                     "v": "74941875231",
        //                     "e": 6,
        //                     "f": 74941.875231
        //                 },
        //                 "amount": {
        //                     "v": "149",
        //                     "e": 8,
        //                     "f": 0.00000149
        //                 }
        //             },
        //             {
        //                 "price": {
        //                     "v": "75063426037",
        //                     "e": 6,
        //                     "f": 75063.426037
        //                 },
        //                 "amount": {
        //                     "v": "335",
        //                     "e": 8,
        //                     "f": 0.00000335
        //                 }
        //             }
        //         ],
        //         "bids": [
        //             {
        //                 "price": {
        //                     "v": "64518711040",
        //                     "e": 6,
        //                     "f": 64518.71104
        //                 },
        //                 "amount": {
        //                     "v": "132",
        //                     "e": 8,
        //                     "f": 0.00000132
        //                 }
        //             },
        //             {
        //                 "price": {
        //                     "v": "64263569273",
        //                     "e": 6,
        //                     "f": 64263.569273
        //                 },
        //                 "amount": {
        //                     "v": "210",
        //                     "e": 8,
        //                     "f": 0.0000021
        //                 }
        //             }
        //         ],
        //         "market": "BTC_USDC"
        //     },
        //     "request_id": "71b7dffc-3120-4e46-a0bb-49ece5aea7e1",
        //     "result": "success",
        //     "time": 0.000074661
        // }
        const data = this.safeValue(response, 'data', {}); // exchange specific v e f params
        const timestamp = this.milliseconds(); // the exchange does not provide timestamp for this.
        const dataBidsLength = data['bids'].length;
        const dataAsksLength = data['asks'].length;
        for (let i = 0; i < dataBidsLength; i++) {
            data['bids'][i]['price'] = this.parseAmount(data['bids'][i]['price']);
            data['bids'][i]['amount'] = this.parseAmount(data['bids'][i]['amount']);
        }
        for (let i = 0; i < dataAsksLength; i++) {
            data['asks'][i]['price'] = this.parseAmount(data['asks'][i]['price']);
            data['asks'][i]['amount'] = this.parseAmount(data['asks'][i]['amount']);
        }
        return this.parseOrderBook(data, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
    }
    /**
     * @method
     * @name ellipx#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market, default will return the last 24h period.
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.w65baeuhxwt8
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the API endpoint
     * @param {int} [params.until] timestamp in ms of the earliest candle to fetch
     * @returns {OHLCV[]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const methodName = 'fetchOHLCV';
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, methodName, 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 1000);
        }
        const market = this.market(symbol);
        const marketId = market['id'];
        const time_frame = this.safeString(this.timeframes, timeframe, undefined);
        const request = {
            'currencyPair': marketId,
            'interval': time_frame,
        };
        if (since !== undefined) {
            request['start'] = Math.floor(since / 1000);
        }
        let until = undefined;
        [until, params] = this.handleOptionAndParams(params, methodName, 'until');
        if (until !== undefined) {
            request['end'] = until;
        }
        // {
        //     "data": {
        //         "market": "BTC_USDC",
        //         "real_end": 1730970780,
        //         "requested_end": 1730970784,
        //         "start": 1730884200,
        //         "stats": [
        //             {
        //                 "time": 1730884200,
        //                 "count": 48,
        //                 "high": {"v": "73898950000", "e": 6, "f": 73898.95},
        //                 "low": {"v": "73642930000", "e": 6, "f": 73642.93},
        //                 "open": {"v": "73830990000", "e": 6, "f": 73830.99},
        //                 "close": {"v": "73682510000", "e": 6, "f": 73682.51},
        //                 "vol": {"v": "88159", "e": 8, "f": 0.00088159}
        //             }
        //         ]
        //     }
        // }
        // No limit parameter supported by the API
        const response = await this.publicGetMarketCurrencyPairGetGraph(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        const ohlcv = this.safeList(data, 'stats', []);
        return this.parseOHLCVs(ohlcv, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        return [
            this.safeInteger(ohlcv, 'time') * 1000,
            this.parseNumber(this.parseAmount(this.safeDict(ohlcv, 'open'))),
            this.parseNumber(this.parseAmount(this.safeDict(ohlcv, 'high'))),
            this.parseNumber(this.parseAmount(this.safeDict(ohlcv, 'low'))),
            this.parseNumber(this.parseAmount(this.safeDict(ohlcv, 'close'))),
            this.parseNumber(this.parseAmount(this.safeDict(ohlcv, 'vol'))), // volume
        ];
    }
    /**
     * @method
     * @name ellipx#fetchCurrencies
     * @description fetches information on all currencies from the exchange, including deposit/withdrawal details and available chains
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.x65f9s9j74jf
     * @param {object} [params] extra parameters specific to the ellipx API endpoint
     * @param {string} [params.Can_Deposit] filter currencies by deposit availability, Y for available
     * @param {number} [params.results_per_page] number of results per page, default 100
     * @param {string} [params._expand] additional fields to expand in response, default '/Crypto_Token,/Crypto_Chain'
     * @returns {Promise<Currencies>} An object of currency structures indexed by currency codes
     */
    async fetchCurrencies(params = {}) {
        const response = await this._restGetCryptoTokenInfo(this.extend({
            'Can_Deposit': 'Y',
            'results_per_page': 100,
            '_expand': '/Crypto_Token,/Crypto_Chain',
        }, params));
        const currencies = {};
        const data = this.safeValue(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const currency = this.parseCurrency(data[i]);
            const code = this.safeString(currency, 'code');
            if (code !== undefined) {
                currencies[code] = currency;
            }
        }
        return currencies;
    }
    parseCurrency(currency) {
        const id = this.safeString(currency, 'Crypto_Token__');
        const token = this.safeValue(currency, 'Crypto_Token', {});
        const code = this.safeCurrencyCode(this.safeString(token, 'Symbol'));
        const name = this.safeString(token, 'Name');
        const active = this.safeString(currency, 'Status') === 'valid';
        const deposit = this.safeString(currency, 'Can_Deposit') === 'Y';
        const withdraw = this.safeString(currency, 'Status') === 'valid';
        let fee = undefined;
        if (currency['Withdraw_Fee'] !== undefined) {
            fee = this.parseNumber(this.parseAmount(currency['Withdraw_Fee']));
        }
        const precision = this.parseNumber(this.parsePrecision(this.safeString(token, 'Decimals')));
        let minDeposit = undefined;
        if (currency['Minimum_Deposit'] !== undefined) {
            minDeposit = this.parseAmount(currency['Minimum_Deposit']);
        }
        let minWithdraw = undefined;
        if (currency['Minimum_Withdraw'] !== undefined) {
            minWithdraw = this.parseAmount(currency['Minimum_Withdraw']);
        }
        const networkId = this.safeString(currency, 'Crypto_Chain__');
        const networkData = this.safeValue(currency, 'Crypto_Chain', {});
        const networkCode = this.safeString(networkData, 'Type', 'default');
        const networks = {
            'string': undefined,
            'info': networkCode === 'default' ? {} : networkData,
            'id': networkId || id || '',
            'network': networkCode,
            'active': active,
            'deposit': deposit,
            'withdraw': withdraw,
            'fee': fee,
            'precision': precision,
            'limits': {
                'deposit': {
                    'min': minDeposit,
                    'max': undefined,
                },
                'withdraw': {
                    'min': minWithdraw,
                    'max': undefined,
                },
            },
        };
        const result = {
            'info': currency,
            'id': id,
            'code': code,
            'name': name,
            'active': active,
            'deposit': deposit,
            'withdraw': withdraw,
            'fee': fee,
            'precision': precision,
            'type': undefined,
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': minWithdraw,
                    'max': undefined,
                },
            },
            'networks': networks,
        };
        return result;
    }
    /**
     * @method
     * @name ellipx#fetchTrades
     * @description fetches all completed trades for a particular market/symbol
     * @param {string} symbol unified market symbol (e.g. 'BTC/USDT')
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the EllipX API endpoint
     * @param {string} [params.before] get trades before the given trade ID
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const marketId = market['id'];
        const request = {
            'currencyPair': marketId,
        };
        // endpoint support before trade id.
        // The actual endpoint URL will be: https://data.ellipx.com/Market/{currencyPair}:getTrades
        // {
        //     "id": "BTC_USDC:1731053859:914141972:0",
        //     "pair": [
        //         "BTC",
        //         "USDC"
        //     ],
        //     "bid": {
        //         "id": "mktor-swishf-uv6n-hrzj-63ye-bdqnk33q",
        //         "iss": "ellipx:beta",
        //         "uniq": "order:1731053859:914141972:0"
        //     },
        //     "ask": {
        //         "id": "mktor-p3ozvt-qurz-gmzo-bf5n-g4rcuy6u",
        //         "iss": "ellipx:beta",
        //         "uniq": "order:1731053859:874659786:0"
        //     },
        //     "type": "bid",
        //     "amount": {
        //         "v": "412",
        //         "e": 8,
        //         "f": 0.00000412
        //     },
        //     "price": {
        //         "v": "75878090000",
        //         "e": 6,
        //         "f": 75878.09
        //     },
        //     "date": "2024-11-08T08:17:39.914141972Z"
        // }
        const response = await this.publicGetMarketCurrencyPairGetTrades(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        const trades = this.safeList(data, 'trades', []);
        return this.parseTrades(trades, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        // Format of trade ID: "BTC_USDC:1731053859:914141972:0"
        const id = this.safeString(trade, 'id');
        // fetchTrades and fetchMyTrades return different trade structures
        const date = this.safeDict(trade, 'date');
        let timestamp = undefined;
        if (date === undefined) {
            timestamp = this.parse8601(this.safeString(trade, 'date'));
        }
        else {
            timestamp = this.safeInteger(date, 'unixms');
        }
        const type = this.safeString(trade, 'type');
        const side = (type === 'bid') ? 'buy' : 'sell';
        const amount = this.safeDict(trade, 'amount');
        const price = this.safeDict(trade, 'price');
        const amountFloat = this.parseAmount(amount);
        const priceFloat = this.parseAmount(price);
        // fetchTrades and fetchMyTrades return different trade structures
        const pair = this.safeList(trade, 'pair');
        let marketSymbol = undefined;
        if (pair === undefined) {
            const symbol = this.safeString(trade, 'pair');
            const [base, quote] = symbol.split('_');
            marketSymbol = base + '/' + quote;
        }
        else {
            marketSymbol = this.safeString(pair, 0) + '/' + this.safeString(pair, 1);
        }
        const bidOrder = this.safeDict(trade, 'bid');
        const askOrder = this.safeDict(trade, 'ask');
        const isBuy = (side === 'buy');
        const orderId = isBuy ? this.safeString(bidOrder, 'id') : this.safeString(askOrder, 'id');
        return this.safeTrade({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': marketSymbol,
            'type': undefined,
            'side': side,
            'order': orderId,
            'takerOrMaker': undefined,
            'price': priceFloat,
            'amount': amountFloat,
            'cost': undefined,
            'fee': undefined,
        });
    }
    /**
     * @method
     * @name ellipx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.ihrjov144txg
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetUserWallet(params);
        // {
        //     "User_Wallet__": "usw-vv7hzo-qel5-gupk-neqi-7f3wz5pq",
        //     "User__": "usr-...",
        //     "Realm__": "usrr-cb3c7n-qvxv-fdrb-uc2q-gpja2foi",
        //     "Unit__": "unit-aebkye-u35b-e5zm-zt22-2qvwhsqa",
        //     "Balance": {
        //         "value": "0.00006394",
        //         "value_int": "6394",
        //         "value_disp": "0.00006394",
        //         "value_xint": {
        //             "v": "6394",
        //             "e": 8,
        //             "f": 0.00006394
        //         },
        //         "display": "0.00006394BTC",
        //         "display_short": "0.00006394BTC",
        //         "currency": "BTC",
        //         "unit": "BTC",
        //         "has_vat": false,
        //         "tax_profile": null
        //     },
        //     "Balance_Date": {
        //         "unix": 1731128270,
        //         "us": 426208,
        //         "iso": "2024-11-09 04:57:50.426208",
        //         "tz": "UTC",
        //         "full": "1731128270426208",
        //         "unixms": "1731128270426"
        //     },
        //     "Liabilities": {
        //         "value": "0.00000000",
        //         "value_int": "0",
        //         "value_disp": "0.00000000",
        //         "value_xint": {
        //             "v": "0",
        //             "e": 8,
        //             "f": 0
        //         },
        //         "display": "0.00000000BTC",
        //         "display_short": "0.00000000BTC",
        //         "currency": "BTC",
        //         "unit": "BTC",
        //         "has_vat": false,
        //         "tax_profile": null
        //     },
        //     "Index": "5",
        //     "Backend": "virtual",
        //     "Disable_Limits": "N",
        //     "Unencumbered_Balance": {
        //         "value": "0.00006394",
        //         "value_int": "6394",
        //         "value_disp": "0.00006394",
        //         "value_xint": {
        //             "v": "6394",
        //             "e": 8,
        //             "f": 0.00006394
        //         },
        //         "display": "0.00006394BTC",
        //         "display_short": "0.00006394BTC",
        //         "currency": "BTC",
        //         "unit": "BTC",
        //         "has_vat": false,
        //         "tax_profile": null
        //     }
        // }
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const dataArray = this.safeList(response, 'data', []);
        // Use first item's timestamp if available
        const dataArrayLength = dataArray.length;
        if (dataArrayLength > 0) {
            const firstItem = dataArray[0];
            const balanceDate = this.safeDict(firstItem, 'Balance_Date', {});
            result['timestamp'] = this.safeInteger(balanceDate, 'unixms');
            result['datetime'] = this.iso8601(result['timestamp']);
        }
        // Process each balance entry
        for (let i = 0; i < dataArray.length; i++) {
            const entry = dataArray[i];
            const balance = this.safeDict(entry, 'Balance', {});
            const currency = this.safeString(balance, 'currency');
            if (currency !== undefined) {
                const account = {
                    'free': this.parseAmount(entry['Unencumbered_Balance']['value_xint']),
                    'used': this.parseAmount(entry['Liabilities']['value_xint']),
                    'total': this.parseAmount(balance['value_xint']),
                };
                result[currency] = account;
            }
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name ellipx#createOrder
     * @description create a new order in a market
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.yzfak2n2bwpo
     * @param {string} symbol unified market symbol (e.g. 'BTC/USDT')
     * @param {string} type order type - the exchange automatically sets type to 'limit' if price defined, 'market' if undefined
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] amount of base currency to trade (can be undefined if using Spend_Limit)
     * @param {float} [price] price per unit of base currency for limit orders
     * @param {object} [params] extra parameters specific to the EllipX API endpoint
     * @param {float} [params.cost] maximum amount to spend in quote currency (required for market orders if amount undefined)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        // the exchange automatically sets the type to 'limit' if the price is defined and to 'market' if it is not
        const marketId = market['id'];
        let orderType = 'bid';
        if (side === 'buy') {
            orderType = 'bid';
        }
        else {
            orderType = 'ask';
        }
        const request = {
            'currencyPair': marketId,
            'Type': orderType,
        };
        if (amount !== undefined) {
            request['Amount'] = this.amountToPrecision(symbol, amount);
        }
        if (price !== undefined) {
            request['Price'] = this.priceToPrecision(symbol, price);
        }
        const cost = this.safeString(params, 'cost');
        if (cost !== undefined) {
            params = this.omit(params, 'cost');
            request['Spend_Limit'] = this.priceToPrecision(symbol, cost);
        }
        const response = await this.privatePostMarketCurrencyPairOrder(this.extend(request, params));
        // {
        //     "result": "success",
        //     "data": {
        //         "Market_Order__": "mktor-x2grmu-zwo5-fyxc-4gue-vd4ouvsa",
        //         "Market__": "mkt-lrnp2e-eaor-eobj-ua73-75j6sjxe",
        //         "User__": "usr-...",
        //         "Uniq": "order:1728719021:583795548:0",
        //         "Type": "bid",
        //         "Status": "pending",
        //         "Flags": {},
        //         "Amount": {
        //             "v": "100000000",
        //             "e": 8,
        //             "f": 1
        //         },
        //         "Price": null,
        //         "Spend_Limit": {
        //             "v": "1000000",
        //             "e": 6,
        //             "f": 1
        //         },
        //         "Executed": {
        //             "v": "0",
        //             "e": 0,
        //             "f": 0
        //         },
        //         "Secured": {
        //             "v": "1000000",
        //             "e": 6,
        //             "f": 1
        //         },
        //         "Version": "0",
        //         "Created": {
        //             "unix": 1728719020,
        //             "us": 315195,
        //             "iso": "2024-10-12 07:43:40.315195",
        //             "tz": "UTC",
        //             "full": "1728719020315195",
        //             "unixms": "1728719020315"
        //         },
        //         "Updated": {
        //             "unix": 1728719020,
        //             "us": 315195,
        //             "iso": "2024-10-12 07:43:40.315195",
        //             "tz": "UTC",
        //             "full": "1728719020315195",
        //             "unixms": "1728719020315"
        //         }
        //     }
        // }
        const order = this.safeDict(response, 'data', {});
        return this.parseOrder(order, market);
    }
    /**
     * @method
     * @name ellipx#fetchOrder
     * @description fetches information on an order made by the user
     * @param {string} id the order ID as returned by createOrder or fetchOrders
     * @param {string|undefined} symbol not used by ellipx.fetchOrder
     * @param {object} [params] extra parameters specific to the EllipX API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderUuid': id,
        };
        const response = await this.privateGetMarketOrderOrderUuid(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, undefined);
    }
    /**
     * @method
     * @name ellipx#fetchOrdersByStatus
     * @description fetches a list of orders placed on the exchange
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.5z2nh2b5s81n
     * @param {string} status 'open' or 'closed', omit for all orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum amount of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            const marketId = market['id'];
            request['currencyPair'] = marketId;
        }
        if (status !== undefined) {
            request['Status'] = status;
        }
        const response = await this.privateGetMarketCurrencyPairOrder(this.extend(request, params));
        // {
        //     "result": "success",
        //     "data": [
        //         {
        //             "Market_Order__": "mktor-aglvd2-iy5v-enbj-nwrb-scqsnosa",
        //             "Market__": "mkt-lrnp2e-eaor-eobj-ua73-75j6sjxe",
        //             "User__": "usr-...",
        //             "Uniq": "order:1728712511:964332600:0",
        //             "Type": "ask",
        //             "Status": "open",
        //             "Flags": {},
        //             "Amount": {
        //                 "v": "1",
        //                 "e": 8,
        //                 "f": 1.0e-8
        //             },
        //             "Price": {
        //                 "v": "63041306872",
        //                 "e": 6,
        //                 "f": 63041.306872
        //             },
        //             "Spend_Limit": null,
        //             "Executed": {
        //                 "v": "892",
        //                 "e": 8,
        //                 "f": 8.92e-6
        //             },
        //             "Secured": null,
        //             "Version": "3",
        //             "Created": {
        //                 "unix": 1728712510,
        //                 "us": 669096,
        //                 "iso": "2024-10-12 05:55:10.669096",
        //                 "tz": "UTC",
        //                 "full": "1728712510669096",
        //                 "unixms": "1728712510669"
        //             },
        //             "Updated": {
        //                 "unix": 1728712510,
        //                 "us": 669096,
        //                 "iso": "2024-10-12 05:55:10.669096",
        //                 "tz": "UTC",
        //                 "full": "1728712510669096",
        //                 "unixms": "1728712510669"
        //             }
        //         }
        //     ],
        //     "paging": {
        //         "page_no": 1,
        //         "count": "1",
        //         "page_max": 1,
        //         "results_per_page": 20
        //     }
        // }
        const data = this.safeValue(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name ellipx#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.5z2nh2b5s81n
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} since timestamp in ms of the earliest order
     * @param {int|undefined} limit the maximum amount of orders to fetch
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrders requires a symbol parameter');
        }
        return await this.fetchOrdersByStatus(undefined, symbol, since, limit, params);
    }
    /**
     * @method
     * @name ellipx#fetchOpenOrders
     * @description fetches information on open orders made by the user
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.5z2nh2b5s81n
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int|undefined} since timestamp in ms of the earliest order
     * @param {int|undefined} limit the maximum amount of orders to fetch
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrders requires a symbol parameter');
        }
        return await this.fetchOrdersByStatus('open', symbol, since, limit, params);
    }
    parseOrder(order, market = undefined) {
        const id = this.safeString(order, 'Market_Order__');
        const timestamp = this.safeInteger(this.safeDict(order, 'Created'), 'unixms');
        const orderType = this.safeString(order, 'Type');
        let side = 'sell';
        if (orderType === 'bid') {
            side = 'buy';
        }
        const status = this.parseOrderStatus(this.safeString(order, 'Status'));
        const amount = this.parseNumber(this.parseAmount(this.safeDict(order, 'Amount')));
        const price = this.parseNumber(this.parseAmount(this.safeDict(order, 'Price')));
        const type = (price === undefined) ? 'market' : 'limit';
        const executed = this.parseNumber(this.parseAmount(this.safeDict(order, 'Executed')));
        const filled = executed;
        const remaining = this.parseNumber(this.parseAmount(this.safeDict(order, 'Secured')));
        const cost = this.parseNumber(this.parseAmount(this.safeDict(order, 'Total_Spent')));
        const symbol = market ? market['symbol'] : undefined;
        const clientOrderId = undefined;
        const timeInForce = 'GTC'; // default to Good Till Cancelled
        const postOnly = false;
        const updated = this.safeDict(order, 'Updated', {});
        const lastTradeTimestamp = this.safeInteger(updated, 'unixms', undefined);
        return this.safeOrder({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': this.parseOrderStatus(status),
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'average': undefined,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    /**
     * @method
     * @name ellipx#cancelOrder
     * @description Cancels an open order on the exchange
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.f1qu1pb1rebn
     * @param {string} id - The order ID to cancel (format: mktor-xxxxx-xxxx-xxxx-xxxx-xxxxxxxx)
     * @param {string} [symbol] - ellipx.cancelOrder does not use the symbol parameter
     * @param {object} [params] - Extra parameters specific to the exchange API
     * @returns {Promise<object>} A Promise that resolves to the canceled order info
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderUuid': id,
        };
        const response = await this.privateDeleteMarketOrderOrderUuid(this.extend(request, params));
        // {
        //     result: "success",
        //     request_id: "887dba33-d11b-43f0-8034-dd7890882cc5",
        //     time: "0.8975801467895508",
        //     data: true,
        //     access: {
        //       "mktor-rf5k5b-5fhf-dmde-wxqj-3y23jeii": {
        //         required: "A",
        //         available: "O",
        //       },
        //     },
        //   }
        // this endpoint always returns true and a warning message if the order cancelled before.
        const warningResponse = this.safeValue(response, 'warning', undefined);
        const statusResponse = this.safeBool(response, 'data');
        let status = 'canceled';
        if (statusResponse !== true || warningResponse !== undefined) {
            status = 'closed';
        }
        return this.safeOrder({
            'id': id,
            'clientOrderId': undefined,
            'info': this.json(response),
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': undefined,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': undefined,
            'price': undefined,
            'triggerPrice': undefined,
            'average': undefined,
            'cost': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'fee': undefined,
            'trades': undefined,
        }, undefined);
    }
    /**
     * @method
     * @name ellipx#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired('fetchMyTrades requires a symbol parameter');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const currencyPair = market['id'];
        const request = {
            'Market_Order__': id,
            'currencyPair': currencyPair,
        };
        const response = await this.privateGetMarketCurrencyPairTrade(this.extend(request, params));
        // {
        //     "result": "success",
        //     "request_id": "fc5be99d-d085-46f8-9228-e46d0996f112",
        //     "time": 0.030913114547729492,
        //     "data": [
        //         {
        //             "id": "DOGE_USDC:1731505789:911642994:0",
        //             "pair": "DOGE_USDC",
        //             "bid": {
        //                 "id": "mktor-xb3ne5-emm5-fx7e-xggk-fyfoiye4"
        //             },
        //             "ask": {
        //                 "id": "mktor-oxmac4-mtkf-gi3o-mamg-u2cboqe4"
        //             },
        //             "type": "bid",
        //             "amount": {
        //                 "v": "334609419",
        //                 "e": 8,
        //                 "f": 3.34609419
        //             },
        //             "price": {
        //                 "v": "410673",
        //                 "e": 6,
        //                 "f": 0.410673
        //             },
        //             "date": {
        //                 "unix": 1731505789,
        //                 "us": 911642,
        //                 "iso": "2024-11-13 13:49:49.911642",
        //                 "tz": "UTC",
        //                 "full": "1731505789911642",
        //                 "unixms": "1731505789911"
        //             }
        //         },
        //         {
        //             "id": "DOGE_USDC:1731505789:911642994:4",
        //             "pair": "DOGE_USDC",
        //             "bid": {
        //                 "id": "mktor-xb3ne5-emm5-fx7e-xggk-fyfoiye4"
        //             },
        //             "ask": {
        //                 "id": "mktor-cmtztk-3z3n-gupp-uqdg-74g4wjfq"
        //             },
        //             "type": "bid",
        //             "amount": {
        //                 "v": "145453950",
        //                 "e": 8,
        //                 "f": 1.4545395
        //             },
        //             "price": {
        //                 "v": "412589",
        //                 "e": 6,
        //                 "f": 0.412589
        //             },
        //             "date": {
        //                 "unix": 1731505789,
        //                 "us": 911642,
        //                 "iso": "2024-11-13 13:49:49.911642",
        //                 "tz": "UTC",
        //                 "full": "1731505789911642",
        //                 "unixms": "1731505789911"
        //             }
        //         },
        //         {
        //             "id": "DOGE_USDC:1731505789:911642994:2",
        //             "pair": "DOGE_USDC",
        //             "bid": {
        //                 "id": "mktor-xb3ne5-emm5-fx7e-xggk-fyfoiye4"
        //             },
        //             "ask": {
        //                 "id": "mktor-6tyslh-b33b-flnm-2ata-acjkco4y"
        //             },
        //             "type": "bid",
        //             "amount": {
        //                 "v": "587627076",
        //                 "e": 8,
        //                 "f": 5.87627076
        //             },
        //             "price": {
        //                 "v": "411005",
        //                 "e": 6,
        //                 "f": 0.411005
        //             },
        //             "date": {
        //                 "unix": 1731505789,
        //                 "us": 911642,
        //                 "iso": "2024-11-13 13:49:49.911642",
        //                 "tz": "UTC",
        //                 "full": "1731505789911642",
        //                 "unixms": "1731505789911"
        //             }
        //         },
        //         {
        //             "id": "DOGE_USDC:1731505789:911642994:1",
        //             "pair": "DOGE_USDC",
        //             "bid": {
        //                 "id": "mktor-xb3ne5-emm5-fx7e-xggk-fyfoiye4"
        //             },
        //             "ask": {
        //                 "id": "mktor-ihpjlj-5ufj-dm5l-fmud-oftkqcgu"
        //             },
        //             "type": "bid",
        //             "amount": {
        //                 "v": "475845734",
        //                 "e": 8,
        //                 "f": 4.75845734
        //             },
        //             "price": {
        //                 "v": "410830",
        //                 "e": 6,
        //                 "f": 0.41083
        //             },
        //             "date": {
        //                 "unix": 1731505789,
        //                 "us": 911642,
        //                 "iso": "2024-11-13 13:49:49.911642",
        //                 "tz": "UTC",
        //                 "full": "1731505789911642",
        //                 "unixms": "1731505789911"
        //             }
        //         },
        //         {
        //             "id": "DOGE_USDC:1731505789:911642994:3",
        //             "pair": "DOGE_USDC",
        //             "bid": {
        //                 "id": "mktor-xb3ne5-emm5-fx7e-xggk-fyfoiye4"
        //             },
        //             "ask": {
        //                 "id": "mktor-d2uyb3-nzsj-aevn-dikr-tq3sxhre"
        //             },
        //             "type": "bid",
        //             "amount": {
        //                 "v": "641013461",
        //                 "e": 8,
        //                 "f": 6.41013461
        //             },
        //             "price": {
        //                 "v": "411846",
        //                 "e": 6,
        //                 "f": 0.411846
        //             },
        //             "date": {
        //                 "unix": 1731505789,
        //                 "us": 911642,
        //                 "iso": "2024-11-13 13:49:49.911642",
        //                 "tz": "UTC",
        //                 "full": "1731505789911642",
        //                 "unixms": "1731505789911"
        //             }
        //         }
        //     ],
        //     "access": {
        //         "mkt-xrkg5l-akjz-cxxl-3a2e-mul5gfo4": {
        //             "required": "r",
        //             "available": "?"
        //         },
        //         "mktor-xb3ne5-emm5-fx7e-xggk-fyfoiye4": {
        //             "required": "R",
        //             "available": "O"
        //         }
        //     },
        //     "paging": {
        //         "page_no": 1,
        //         "count": "5",
        //         "page_max": 1,
        //         "results_per_page": 20
        //     }
        // }
        const data = this.safeList(response, 'data');
        return this.parseTrades(data, market, since, limit);
    }
    /**
     * @method
     * @name ellipx#fetchDepositAddress
     * @description fetches a crypto deposit address for a specific currency
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.k7qe5aricayh
     * @param {string} code unified currency code (e.g. "BTC", "ETH", "USDT")
     * @param {object} [params] extra parameters specific to the EllipX API endpoint
     * @returns {object} an address structure {
     *     'currency': string, // unified currency code
     *     'address': string, // the address for deposits
     *     'tag': string|undefined, // tag/memo for deposits if needed
     *     'network': object, // network object from currency info
     *     'info': object // raw response from exchange
     * }
     * @throws {ExchangeError} if currency does not support deposits
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const network = this.safeValue(currency['info'], 'Crypto_Chain', undefined);
        const request = {
            'Crypto_Token__': this.safeString(network, 'Crypto_Token__'),
            'Crypto_Chain__': this.safeString(network, 'Crypto_Chain__'),
        };
        const response = await this.privatePostCryptoAddressFetch(this.extend(request, params));
        const data = this.safeValue(response, 'data', {});
        const address = this.safeString(data, 'Address');
        const tag = this.safeString(data, 'memo');
        this.checkAddress(address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': network,
            'info': response,
        };
    }
    /**
     * @method
     * @name ellipx#fetchTradingFee
     * @description Fetches the current trading fees (maker and taker) applicable to the user.
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.kki5jay2c8it
     * @param {string} [symbol] Not used by EllipX as fees are not symbol-specific.
     * @param {object} [params] Extra parameters specific to the EllipX API endpoint.
     * @returns {Promise<object>} A promise resolving to a unified trading fee structure:
     * {
     *     'info': object,        // the raw response from the exchange
     *     'symbol': undefined,   // symbol is not used for this exchange
     *     'maker': number,       // maker fee rate in decimal form
     *     'taker': number,       // taker fee rate in decimal form
     *     'percentage': true,    // indicates fees are in percentage
     *     'tierBased': false,    // indicates fees do not vary by volume tiers
     * }
     */
    async fetchTradingFee(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetMarketTradeFeeQuery(params);
        //
        // Example response:
        // {
        //     "result": "success",
        //     "data": {
        //         "maker": 15.0,      // in basis points
        //         "taker": 25.0,      // in basis points
        //         "volume": 123456.78,
        //         "promo": {
        //             // promotional discounts if any
        //         }
        //     }
        // }
        //
        const data = this.safeValue(response, 'data', {});
        const maker = this.safeNumber(data, 'maker'); // in basis points
        const taker = this.safeNumber(data, 'taker'); // in basis points
        const makerFee = (maker !== undefined) ? maker / 10000 : undefined;
        const takerFee = (taker !== undefined) ? taker / 10000 : undefined;
        return {
            'info': response,
            'symbol': undefined,
            'maker': makerFee,
            'taker': takerFee,
            'percentage': true,
            'tierBased': true, // fees can vary based on volume tiers
        };
    }
    /**
     * @method
     * @name ellipx#withdraw
     * @description Make a withdrawal request
     * @see https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.zegupoa8g4t9
     * @param {string} code Currency code
     * @param {number} amount Amount to withdraw
     * @param {string} address Destination wallet address
     * @param {string} [tag] Additional tag/memo for currencies that require it
     * @param {object} params Extra parameters specific to the EllipX API endpoint (Crypto_Chain__, Unit__)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        const networks = this.safeValue(currency, 'networks');
        if (networks === undefined) {
            throw new errors.NotSupported(this.id + ' withdraw() for ' + code + ' is not supported');
        }
        const chainsResponse = await this.privateGetUnitCurrency({ 'currency': currency['code'] }); // fetch Unit__ params for currency
        const chainsData = this.safeValue(chainsResponse, 'data', []);
        const unit = this.safeString(chainsData, 'Unit__');
        // check params again and omit params
        this.omit(params, 'Unit__');
        this.omit(params, 'Crypto_Chain__');
        const amountString = amount.toString();
        const request = {
            'Unit__': unit,
            'amount': amountString,
            'address': address,
            'Crypto_Chain__': networks['id'],
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privatePostCryptoDisbursementWithdraw(this.extend(request, params));
        // {
        //     Crypto_Disbursement__: "crdsb-4pw3kg-ipn5-amvb-da4n-6xncy4r4",
        //     Crypto_Token__: "crtok-dnehz4-wbgv-bunf-iyd3-m7gtsz2q",
        //     Crypto_Chain__: "chain-kjfvwn-l2xn-eclc-ul5d-mb6fu5hm",
        //     User__: "usr-5oint6-ozpr-alfp-2wxi-zgbm4osy",
        //     Value: {
        //       v: "1000000000",
        //       e: "8",
        //       f: "10",
        //     },
        //     Value_USD: "4.08723",
        //     Address: "D6z62LUwyNBi3QbPkzW8C4m7VDAgu9wb2Z",
        //     Status: "pending",
        //     Transaction: null,
        //     Requested: {
        //       unix: "1731570982",
        //       us: "203569",
        //       iso: "2024-11-14 07:56:22.203569",
        //       tz: "UTC",
        //       full: "1731570982203569",
        //       unixms: "1731570982203",
        //     },
        //     Scheduled: null,
        //     Processed: null,
        //     Amount: {
        //       value: "10.00000000",
        //       value_int: "1000000000",
        //       value_disp: "10.00000000",
        //       value_xint: {
        //         v: "1000000000",
        //         e: "8",
        //         f: "10",
        //       },
        //       display: "10.00000000DOGE",
        //       display_short: "10.00000000DOGE",
        //       currency: "DOGE",
        //       unit: "DOGE",
        //       has_vat: false,
        //       tax_profile: null,
        //       raw: {
        //         value: "10.00000000",
        //         value_int: "1000000000",
        //         value_disp: "10.00000000",
        //         value_xint: {
        //           v: "1000000000",
        //           e: "8",
        //           f: "10",
        //         },
        //         display: "10.00000000DOGE",
        //         display_short: "10.00000000DOGE",
        //         currency: "DOGE",
        //         unit: "DOGE",
        //         has_vat: false,
        //         tax_profile: null,
        //       },
        //       tax: {
        //         value: "10.00000000",
        //         value_int: "1000000000",
        //         value_disp: "10.00000000",
        //         value_xint: {
        //           v: "1000000000",
        //           e: "8",
        //           f: "10",
        //         },
        //         display: "10.00000000DOGE",
        //         display_short: "10.00000000DOGE",
        //         currency: "DOGE",
        //         unit: "DOGE",
        //         has_vat: true,
        //         tax_profile: null,
        //       },
        //       tax_only: {
        //         value: "0.000",
        //         value_int: "0",
        //         value_disp: "0",
        //         value_xint: {
        //           v: "0",
        //           e: "3",
        //           f: "0",
        //         },
        //         display: "¥0",
        //         display_short: "¥0",
        //         currency: "JPY",
        //         unit: "JPY",
        //         has_vat: false,
        //         tax_profile: null,
        //       },
        //       tax_rate: "0",
        //     },
        //   }
        const data = this.safeDict(response, 'data');
        const amountResponse = this.safeDict(data, 'Amount');
        const requested = this.safeDict(data, 'Requested');
        const processed = this.safeDict(data, 'Processed');
        const withdrawId = this.safeString(data, 'Crypto_Disbursement__');
        const timestamp = this.safeInteger(requested, 'unixms');
        return {
            'info': response,
            'id': withdrawId,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': this.safeString(data, 'Crypto_Chain__'),
            'address': this.safeString(data, 'Address'),
            'addressTo': this.safeString(data, 'Address'),
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': 'withdrawal',
            'amount': this.safeNumber(amountResponse, 'value'),
            'currency': code,
            'status': this.parseTransactionStatus(this.safeString(data, 'Status')),
            'updated': this.safeTimestamp(processed, 'unix'),
            'internal': false,
            'comment': undefined,
            'fee': {
                'currency': code,
                'cost': undefined,
                'rate': undefined,
            },
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'pending': 'pending',
            'completed': 'ok',
            'failed': 'failed',
            'cancelled': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderStatus(status) {
        const statuses = {
            'pending': 'open',
            'running': 'open',
            'post-pending': 'open',
            'open': 'open',
            'stop': 'open',
            'invalid': 'rejected',
            'done': 'closed',
            'cancel': 'canceled',
            'canceled': 'canceled', // alternative spelling
        };
        return this.safeString(statuses, status, status);
    }
    parseAmount(amount) {
        const v = this.safeString(amount, 'v', undefined);
        const e = this.safeInteger(amount, 'e', undefined);
        if (v === undefined || e === undefined) {
            return undefined;
        }
        const preciseAmount = new Precise["default"](v);
        preciseAmount.decimals = e;
        preciseAmount.reduce();
        return preciseAmount.toString();
    }
    toAmount(amount, precision) {
        const v = amount.toString();
        const e = precision;
        return {
            'v': v,
            'e': e,
        };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        // {
        //     "code": 404,
        //     "error": "Not Found: Crypto\\Token(US)",
        //     "exception": "Exception\\NotFound",
        //     "message": "[I18N:error_not_found]",
        //     "request": "cc83738a-2438-4f53-ae44-f15306c07f32",
        //     "result": "error",
        //     "time": 0.0089569091796875,
        //     "token": "error_not_found"
        // }
        const errorCode = this.safeString(response, 'code');
        const message = this.safeString(response, 'message');
        if (errorCode !== undefined) {
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, message);
            throw new errors.ExchangeError(this.id + ' ' + message);
        }
        return undefined;
    }
}

module.exports = ellipx;
