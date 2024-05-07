'use strict';

var wavesexchange$1 = require('./abstract/wavesexchange.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var ed25519 = require('./static_dependencies/noble-curves/ed25519.js');
var number = require('./base/functions/number.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class wavesexchange
 * @augments Exchange
 */
class wavesexchange extends wavesexchange$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'wavesexchange',
            'name': 'Waves.Exchange',
            'countries': ['CH'],
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
                'cancelOrder': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchDepositAddress': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': false,
                'sandbox': true,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': true,
                'transfer': false,
                'withdraw': true,
                'ws': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '3h': '3h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/84547058-5fb27d80-ad0b-11ea-8711-78ac8b3c7f31.jpg',
                'test': {
                    'matcher': 'https://matcher-testnet.wx.network',
                    'node': 'https://nodes-testnet.wavesnodes.com',
                    'public': 'https://api-testnet.wavesplatform.com/v0',
                    'private': 'https://api-testnet.wx.network/v1',
                    'forward': 'https://testnet.wx.network/api/v1/forward/matcher',
                    'market': 'https://testnet.wx.network/api/v1/forward/marketdata/api/v1',
                },
                'api': {
                    'matcher': 'https://matcher.wx.network',
                    'node': 'https://nodes.wx.network',
                    'public': 'https://api.wavesplatform.com/v0',
                    'private': 'https://api.wx.network/v1',
                    'forward': 'https://wx.network/api/v1/forward/matcher',
                    'market': 'https://wx.network/api/v1/forward/marketdata/api/v1',
                },
                'doc': 'https://docs.wx.network',
                'www': 'https://wx.network',
            },
            'api': {
                'matcher': {
                    'get': [
                        'matcher',
                        'matcher/settings',
                        'matcher/settings/rates',
                        'matcher/balance/reserved/{publicKey}',
                        'matcher/debug/allSnashotOffsets',
                        'matcher/debug/currentOffset',
                        'matcher/debug/lastOffset',
                        'matcher/debug/oldestSnapshotOffset',
                        'matcher/debug/config',
                        'matcher/debug/address/{address}',
                        'matcher/debug/status',
                        'matcher/debug/address/{address}/check',
                        'matcher/orderbook',
                        'matcher/orderbook/{baseId}/{quoteId}',
                        'matcher/orderbook/{baseId}/{quoteId}/publicKey/{publicKey}',
                        'matcher/orderbook/{baseId}/{quoteId}/{orderId}',
                        'matcher/orderbook/{baseId}/{quoteId}/info',
                        'matcher/orderbook/{baseId}/{quoteId}/status',
                        'matcher/orderbook/{baseId}/{quoteId}/tradableBalance/{address}',
                        'matcher/orderbook/{publicKey}',
                        'matcher/orderbook/{publicKey}/{orderId}',
                        'matcher/orders/{address}',
                        'matcher/orders/{address}/{orderId}',
                        'matcher/transactions/{orderId}',
                        'api/v1/orderbook/{baseId}/{quoteId}',
                    ],
                    'post': [
                        'matcher/orderbook',
                        'matcher/orderbook/market',
                        'matcher/orderbook/cancel',
                        'matcher/orderbook/{baseId}/{quoteId}/cancel',
                        'matcher/orderbook/{baseId}/{quoteId}/calculateFee',
                        'matcher/orderbook/{baseId}/{quoteId}/delete',
                        'matcher/orderbook/{baseId}/{quoteId}/cancelAll',
                        'matcher/debug/saveSnapshots',
                        'matcher/orders/{address}/cancel',
                        'matcher/orders/cancel/{orderId}',
                        'matcher/orders/serialize',
                    ],
                    'delete': [
                        'matcher/orderbook/{baseId}/{quoteId}',
                        'matcher/settings/rates/{assetId}',
                    ],
                    'put': [
                        'matcher/settings/rates/{assetId}',
                    ],
                },
                'node': {
                    'get': [
                        'addresses',
                        'addresses/balance/{address}',
                        'addresses/balance/{address}/{confirmations}',
                        'addresses/balance/details/{address}',
                        'addresses/data/{address}',
                        'addresses/data/{address}/{key}',
                        'addresses/effectiveBalance/{address}',
                        'addresses/effectiveBalance/{address}/{confirmations}',
                        'addresses/publicKey/{publicKey}',
                        'addresses/scriptInfo/{address}',
                        'addresses/scriptInfo/{address}/meta',
                        'addresses/seed/{address}',
                        'addresses/seq/{from}/{to}',
                        'addresses/validate/{address}',
                        'alias/by-address/{address}',
                        'alias/by-alias/{alias}',
                        'assets/{assetId}/distribution/{height}/{limit}',
                        'assets/balance/{address}',
                        'assets/balance/{address}/{assetId}',
                        'assets/details/{assetId}',
                        'assets/nft/{address}/limit/{limit}',
                        'blockchain/rewards',
                        'blockchain/rewards/height',
                        'blocks/address/{address}/{from}/{to}/',
                        'blocks/at/{height}',
                        'blocks/delay/{signature}/{blockNum}',
                        'blocks/first',
                        'blocks/headers/last',
                        'blocks/headers/seq/{from}/{to}',
                        'blocks/height',
                        'blocks/height/{signature}',
                        'blocks/last',
                        'blocks/seq/{from}/{to}',
                        'blocks/signature/{signature}',
                        'consensus/algo',
                        'consensus/basetarget',
                        'consensus/basetarget/{blockId}',
                        'consensus/{generatingbalance}/address',
                        'consensus/generationsignature',
                        'consensus/generationsignature/{blockId}',
                        'debug/balances/history/{address}',
                        'debug/blocks/{howMany}',
                        'debug/configInfo',
                        'debug/historyInfo',
                        'debug/info',
                        'debug/minerInfo',
                        'debug/portfolios/{address}',
                        'debug/state',
                        'debug/stateChanges/address/{address}',
                        'debug/stateChanges/info/{id}',
                        'debug/stateWaves/{height}',
                        'leasing/active/{address}',
                        'node/state',
                        'node/version',
                        'peers/all',
                        'peers/blacklisted',
                        'peers/connected',
                        'peers/suspended',
                        'transactions/address/{address}/limit/{limit}',
                        'transactions/info/{id}',
                        'transactions/status',
                        'transactions/unconfirmed',
                        'transactions/unconfirmed/info/{id}',
                        'transactions/unconfirmed/size',
                        'utils/seed',
                        'utils/seed/{length}',
                        'utils/time',
                        'wallet/seed',
                    ],
                    'post': [
                        'addresses',
                        'addresses/data/{address}',
                        'addresses/sign/{address}',
                        'addresses/signText/{address}',
                        'addresses/verify/{address}',
                        'addresses/verifyText/{address}',
                        'debug/blacklist',
                        'debug/print',
                        'debug/rollback',
                        'debug/validate',
                        'node/stop',
                        'peers/clearblacklist',
                        'peers/connect',
                        'transactions/broadcast',
                        'transactions/calculateFee',
                        'tranasctions/sign',
                        'transactions/sign/{signerAddress}',
                        'tranasctions/status',
                        'utils/hash/fast',
                        'utils/hash/secure',
                        'utils/script/compileCode',
                        'utils/script/compileWithImports',
                        'utils/script/decompile',
                        'utils/script/estimate',
                        'utils/sign/{privateKey}',
                        'utils/transactionsSerialize',
                    ],
                    'delete': [
                        'addresses/{address}',
                        'debug/rollback-to/{signature}',
                    ],
                },
                'public': {
                    'get': [
                        'assets',
                        'pairs',
                        'candles/{baseId}/{quoteId}',
                        'transactions/exchange',
                    ],
                },
                'private': {
                    'get': [
                        'deposit/addresses/{currency}',
                        'deposit/addresses/{currency}/{platform}',
                        'platforms',
                        'deposit/currencies',
                        'withdraw/currencies',
                        'withdraw/addresses/{currency}/{address}',
                    ],
                    'post': [
                        'oauth2/token',
                    ],
                },
                'forward': {
                    'get': [
                        'matcher/orders/{address}',
                        'matcher/orders/{address}/{orderId}',
                    ],
                    'post': [
                        'matcher/orders/{wavesAddress}/cancel',
                    ],
                },
                'market': {
                    'get': [
                        'tickers',
                    ],
                },
            },
            'currencies': {
                'WX': this.safeCurrencyStructure({ 'id': 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc', 'numericId': undefined, 'code': 'WX', 'precision': this.parseToInt('8') }),
            },
            'precisionMode': number.DECIMAL_PLACES,
            'options': {
                'allowedCandles': 1440,
                'accessToken': undefined,
                'createMarketBuyOrderRequiresPrice': true,
                'matcherPublicKey': undefined,
                'quotes': undefined,
                'createOrderDefaultExpiry': 2419200000,
                'wavesAddress': undefined,
                'withdrawFeeUSDN': 7420,
                'withdrawFeeWAVES': 100000,
                'wavesPrecision': 8,
                'messagePrefix': 'W',
                'networks': {
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                },
            },
            'commonCurrencies': {
                'EGG': 'Waves Ducks',
            },
            'requiresEddsa': true,
            'exceptions': {
                '3147270': errors.InsufficientFunds,
                '112': errors.InsufficientFunds,
                '4': errors.ExchangeError,
                '13': errors.ExchangeNotAvailable,
                '14': errors.ExchangeNotAvailable,
                '3145733': errors.AccountSuspended,
                '3148040': errors.DuplicateOrderId,
                '3148801': errors.AuthenticationError,
                '9440512': errors.AuthenticationError,
                '9440771': errors.BadSymbol,
                '9441026': errors.InvalidOrder,
                '9441282': errors.InvalidOrder,
                '9441286': errors.InvalidOrder,
                '9441295': errors.InvalidOrder,
                '9441540': errors.InvalidOrder,
                '9441542': errors.InvalidOrder,
                '106954752': errors.AuthenticationError,
                '106954769': errors.AuthenticationError,
                '106957828': errors.AuthenticationError,
                '106960131': errors.AuthenticationError,
                '106981137': errors.AuthenticationError,
                '9437184': errors.BadRequest,
                '9437193': errors.OrderNotFound,
                '1048577': errors.BadRequest,
                '1051904': errors.AuthenticationError,
            },
        });
    }
    setSandboxMode(enabled) {
        this.options['messagePrefix'] = enabled ? 'T' : 'W';
        this.options['sandboxMode'] = enabled;
        super.setSandboxMode(enabled);
    }
    async getFeesForAsset(symbol, side, amount, price, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        amount = this.customAmountToPrecision(symbol, amount);
        price = this.customPriceToPrecision(symbol, price);
        const request = this.extend({
            'baseId': market['baseId'],
            'quoteId': market['quoteId'],
            'orderType': side,
            'amount': amount,
            'price': price,
        }, params);
        return await this.matcherPostMatcherOrderbookBaseIdQuoteIdCalculateFee(request);
    }
    async customCalculateFee(symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const response = await this.getFeesForAsset(symbol, side, amount, price);
        // {
        //     "base":{
        //        "feeAssetId":"WAVES",
        //        "matcherFee":"1000000"
        //     },
        //     "discount":{
        //        "feeAssetId":"EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc",
        //        "matcherFee":"4077612"
        //     }
        //  }
        const isDiscountFee = this.safeBool(params, 'isDiscountFee', false);
        let mode = undefined;
        if (isDiscountFee) {
            mode = this.safeValue(response, 'discount');
        }
        else {
            mode = this.safeValue(response, 'base');
        }
        const matcherFee = this.safeString(mode, 'matcherFee');
        const feeAssetId = this.safeString(mode, 'feeAssetId');
        const feeAsset = this.safeCurrencyCode(feeAssetId);
        const adjustedMatcherFee = this.currencyFromPrecision(feeAsset, matcherFee);
        const amountAsString = this.numberToString(amount);
        const priceAsString = this.numberToString(price);
        const feeCost = this.feeToPrecision(symbol, this.parseNumber(adjustedMatcherFee));
        const feeRate = Precise["default"].stringDiv(adjustedMatcherFee, Precise["default"].stringMul(amountAsString, priceAsString));
        return {
            'type': takerOrMaker,
            'currency': feeAsset,
            'rate': this.parseNumber(feeRate),
            'cost': this.parseNumber(feeCost),
        };
    }
    async getQuotes() {
        let quotes = this.safeValue(this.options, 'quotes');
        if (quotes) {
            return quotes;
        }
        else {
            // currencies can have any name because you can create you own token
            // as a result someone can create a fake token called BTC
            // we use this mapping to determine the real tokens
            // https://docs.wx.network/en/waves-matcher/matcher-api#asset-pair
            const response = await this.matcherGetMatcherSettings();
            // {
            //   "orderVersions": [
            //     1,
            //     2,
            //     3
            //   ],
            //   "success": true,
            //   "matcherPublicKey": "9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
            //   "orderFee": {
            //     "dynamic": {
            //       "baseFee": 300000,
            //       "rates": {
            //         "34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ": 1.22639597,
            //         "62LyMjcr2DtiyF5yVXFhoQ2q414VPPJXjsNYp72SuDCH": 0.00989643,
            //         "HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk": 0.0395674,
            //         "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS": 0.00018814,
            //         "4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8": 26.19721262,
            //         "474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu": 0.00752978,
            //         "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p": 1.84575,
            //         "B3uGHFRpSUuGEDWjqB9LWWxafQj8VTvpMucEyoxzws5H": 0.02330273,
            //         "zMFqXuoyrn5w17PFurTqxB7GsS71fp9dfk6XFwxbPCy": 0.00721412,
            //         "5WvPKSJXzVE2orvbkJ8wsQmmQKqTv9sGBPksV4adViw3": 0.02659103,
            //         "WAVES": 1,
            //         "BrjUWjndUanm5VsJkbUip8VRYy6LWJePtxya3FNv4TQa": 0.03433583
            //       }
            //     }
            //   },
            //   "networkByte": 87,
            //   "matcherVersion": "2.1.3.5",
            //   "status": "SimpleResponse",
            //   "priceAssets": [
            //     "Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck",
            //     "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
            //     "34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ",
            //     "Gtb1WRznfchDnTh37ezoDTJ4wcoKaRsKqKjJjy7nm2zU",
            //     "2mX5DzVKWrAJw8iwdJnV2qtoeVG9h5nTDpTqC1wb1WEN",
            //     "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS",
            //     "WAVES",
            //     "474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu",
            //     "zMFqXuoyrn5w17PFurTqxB7GsS71fp9dfk6XFwxbPCy",
            //     "62LyMjcr2DtiyF5yVXFhoQ2q414VPPJXjsNYp72SuDCH",
            //     "HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk",
            //     "B3uGHFRpSUuGEDWjqB9LWWxafQj8VTvpMucEyoxzws5H",
            //     "5WvPKSJXzVE2orvbkJ8wsQmmQKqTv9sGBPksV4adViw3",
            //     "BrjUWjndUanm5VsJkbUip8VRYy6LWJePtxya3FNv4TQa",
            //     "4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8"
            //   ]
            // }
            quotes = {};
            const priceAssets = this.safeValue(response, 'priceAssets');
            for (let i = 0; i < priceAssets.length; i++) {
                quotes[priceAssets[i]] = true;
            }
            this.options['quotes'] = quotes;
            return quotes;
        }
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchMarkets
         * @description retrieves data on all markets for wavesexchange
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.marketGetTickers();
        //
        //   [
        //       {
        //           "symbol": "WAVES/BTC",
        //           "amountAssetID": "WAVES",
        //           "amountAssetName": "Waves",
        //           "amountAssetDecimals": 8,
        //           "amountAssetTotalSupply": "106908766.00000000",
        //           "amountAssetMaxSupply": "106908766.00000000",
        //           "amountAssetCirculatingSupply": "106908766.00000000",
        //           "priceAssetID": "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS",
        //           "priceAssetName": "WBTC",
        //           "priceAssetDecimals": 8,
        //           "priceAssetTotalSupply": "20999999.96007507",
        //           "priceAssetMaxSupply": "20999999.96007507",
        //           "priceAssetCirculatingSupply": "20999999.66019601",
        //           "24h_open": "0.00032688",
        //           "24h_high": "0.00033508",
        //           "24h_low": "0.00032443",
        //           "24h_close": "0.00032806",
        //           "24h_vwap": "0.00032988",
        //           "24h_volume": "42349.69440104",
        //           "24h_priceVolume": "13.97037207",
        //           "timestamp":1640232379124
        //       }
        //       ...
        //   ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const baseId = this.safeString(entry, 'amountAssetID');
            const quoteId = this.safeString(entry, 'priceAssetID');
            const id = baseId + '/' + quoteId;
            const marketId = this.safeString(entry, 'symbol');
            let [base, quote] = marketId.split('/');
            base = this.safeCurrencyCode(base);
            quote = this.safeCurrencyCode(quote);
            const symbol = base + '/' + quote;
            result.push({
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
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeInteger(entry, 'amountAssetDecimals'),
                    'price': this.safeInteger(entry, 'priceAssetDecimals'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
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
                'info': entry,
            });
        }
        return result;
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = this.extend({
            'baseId': market['baseId'],
            'quoteId': market['quoteId'],
        }, params);
        const response = await this.matcherGetMatcherOrderbookBaseIdQuoteId(request);
        const timestamp = this.safeInteger(response, 'timestamp');
        const bids = this.parseOrderBookSide(this.safeValue(response, 'bids'), market, limit);
        const asks = this.parseOrderBookSide(this.safeValue(response, 'asks'), market, limit);
        return {
            'symbol': symbol,
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'nonce': undefined,
        };
    }
    parseOrderBookSide(bookSide, market = undefined, limit = undefined) {
        const precision = market['precision'];
        const wavesPrecision = this.safeString(this.options, 'wavesPrecision', '8');
        const amountPrecision = '1e' + this.numberToString(precision['amount']);
        const amountPrecisionString = this.numberToString(precision['amount']);
        const pricePrecisionString = this.numberToString(precision['price']);
        const difference = Precise["default"].stringSub(amountPrecisionString, pricePrecisionString);
        const pricePrecision = '1e' + Precise["default"].stringSub(wavesPrecision, difference);
        const result = [];
        for (let i = 0; i < bookSide.length; i++) {
            const entry = bookSide[i];
            const entryPrice = this.safeString(entry, 'price', '0');
            const entryAmount = this.safeString(entry, 'amount', '0');
            let price = undefined;
            let amount = undefined;
            if ((pricePrecision !== undefined) && (entryPrice !== undefined)) {
                price = Precise["default"].stringDiv(entryPrice, pricePrecision);
            }
            if ((amountPrecision !== undefined) && (entryAmount !== undefined)) {
                amount = Precise["default"].stringDiv(entryAmount, amountPrecision);
            }
            if ((limit !== undefined) && (i > limit)) {
                break;
            }
            result.push([
                this.parseNumber(price),
                this.parseNumber(amount),
            ]);
        }
        return result;
    }
    checkRequiredKeys() {
        if (this.apiKey === undefined) {
            throw new errors.AuthenticationError(this.id + ' requires apiKey credential');
        }
        if (this.secret === undefined) {
            throw new errors.AuthenticationError(this.id + ' requires secret credential');
        }
        let apiKeyBytes = undefined;
        let secretKeyBytes = undefined;
        try {
            apiKeyBytes = this.base58ToBinary(this.apiKey);
        }
        catch (e) {
            throw new errors.AuthenticationError(this.id + ' apiKey must be a base58 encoded public key');
        }
        try {
            secretKeyBytes = this.base58ToBinary(this.secret);
        }
        catch (e) {
            throw new errors.AuthenticationError(this.id + ' secret must be a base58 encoded private key');
        }
        const hexApiKeyBytes = this.binaryToBase16(apiKeyBytes);
        const hexSecretKeyBytes = this.binaryToBase16(secretKeyBytes);
        if (hexApiKeyBytes.length !== 64) {
            throw new errors.AuthenticationError(this.id + ' apiKey must be a base58 encoded public key');
        }
        if (hexSecretKeyBytes.length !== 64) {
            throw new errors.AuthenticationError(this.id + ' secret must be a base58 encoded private key');
        }
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        const isCancelOrder = path === 'matcher/orders/{wavesAddress}/cancel';
        path = this.implodeParams(path, params);
        let url = this.urls['api'][api] + '/' + path;
        let queryString = this.urlencodeWithArrayRepeat(query);
        if ((api === 'private') || (api === 'forward')) {
            headers = {
                'Accept': 'application/json',
            };
            const accessToken = this.safeString(this.options, 'accessToken');
            if (accessToken) {
                headers['Authorization'] = 'Bearer ' + accessToken;
            }
            if (method === 'POST') {
                headers['content-type'] = 'application/json';
            }
            else {
                headers['content-type'] = 'application/x-www-form-urlencoded';
            }
            if (isCancelOrder) {
                body = this.json([query['orderId']]);
                queryString = '';
            }
            if (queryString.length > 0) {
                url += '?' + queryString;
            }
        }
        else if (api === 'matcher') {
            if (method === 'POST') {
                headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                };
                body = this.json(query);
            }
            else {
                headers = query;
            }
        }
        else {
            if (method === 'POST') {
                headers = {
                    'content-type': 'application/json',
                };
                body = this.json(query);
            }
            else {
                headers = {
                    'content-type': 'application/x-www-form-urlencoded',
                };
                if (queryString.length > 0) {
                    url += '?' + queryString;
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    async signIn(params = {}) {
        /**
         * @method
         * @name wavesexchange#signIn
         * @description sign in, must be called prior to using other authenticated methods
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns response from exchange
         */
        if (!this.safeString(this.options, 'accessToken')) {
            const prefix = 'ffffff01';
            const expiresDelta = 60 * 60 * 24 * 7;
            let seconds = this.sum(this.seconds(), expiresDelta);
            seconds = seconds.toString();
            const clientId = 'wx.network';
            // W for production, T for testnet
            const defaultMessagePrefix = this.safeString(this.options, 'messagePrefix', 'W');
            const message = defaultMessagePrefix + ':' + clientId + ':' + seconds;
            const messageHex = this.binaryToBase16(this.encode(message));
            const payload = prefix + messageHex;
            const hexKey = this.binaryToBase16(this.base58ToBinary(this.secret));
            const signature = this.axolotl(payload, hexKey, ed25519.ed25519);
            const request = {
                'grant_type': 'password',
                'scope': 'general',
                'username': this.apiKey,
                'password': seconds + ':' + signature,
                'client_id': clientId,
            };
            const response = await this.privatePostOauth2Token(request);
            // { access_token: "eyJhbGciOXJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWciOiJiaTZiMVhMQlo0M1Q4QmRTSlVSejJBZGlQdVlpaFZQYVhhVjc4ZGVIOEpTM3M3NUdSeEU1VkZVOE5LRUI0UXViNkFHaUhpVFpuZ3pzcnhXdExUclRvZTgiLCJhIjoiM1A4VnpMU2EyM0VXNUNWY2tIYlY3ZDVCb043NWZGMWhoRkgiLCJuYiI6IlciLCJ1c2VyX25hbWUiOiJBSFhuOG5CQTRTZkxRRjdoTFFpU24xNmt4eWVoaml6QkdXMVRkcm1TWjFnRiIsInNjb3BlIjpbImdlbmVyYWwiXSwibHQiOjYwNDc5OSwicGsiOiJBSFhuOG5CQTRTZkxRRjdoTFFpU24xNmt4eWVoaml6QkdXMVRkcm1TWjFnRiIsImV4cCI6MTU5MTk3NTA1NywiZXhwMCI6MTU5MTk3NTA1NywianRpIjoiN2JhOTUxMTMtOGI2MS00NjEzLTlkZmYtNTEwYTc0NjlkOWI5IiwiY2lkIjoid2F2ZXMuZXhjaGFuZ2UifQ.B-XwexBnUAzbWknVN68RKT0ZP5w6Qk1SKJ8usL3OIwDEzCUUX9PjW-5TQHmiCRcA4oft8lqXEiCwEoNfsblCo_jTpRo518a1vZkIbHQk0-13Dm1K5ewGxfxAwBk0g49odcbKdjl64TN1yM_PO1VtLVuiTeZP-XF-S42Uj-7fcO-r7AulyQLuTE0uo-Qdep8HDCk47rduZwtJOmhFbCCnSgnLYvKWy3CVTeldsR77qxUY-vy8q9McqeP7Id-_MWnsob8vWXpkeJxaEsw1Fke1dxApJaJam09VU8EB3ZJWpkT7V8PdafIrQGeexx3jhKKxo7rRb4hDV8kfpVoCgkvFan",
            //   "token_type": "bearer",
            //   "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWciOiJiaTZiMVhMQlo0M1Q4QmRTSlVSejJBZGlQdVlpaFZQYVhhVjc4ZGVIOEpTM3M3NUdSeEU1VkZVOE5LRUI0UXViNkFHaUhpVFpuZ3pzcnhXdExUclRvZTgiLCJhIjoiM1A4VnpMU2EyM0VXNUNWY2tIYlY3ZDVCb043NWZGMWhoRkgiLCJuYiI6IlciLCJ1c2VyX25hbWUiOiJBSFhuOG5CQTRTZkxRRjdoTFFpU24xNmt4eWVoaml6QkdXMVRkcm1TWjFnRiIsInNjb3BlIjpbImdlbmVyYWwiXSwiYXRpIjoiN2JhOTUxMTMtOGI2MS00NjEzLTlkZmYtNTEwYTc0NjlkXWI5IiwibHQiOjYwNDc5OSwicGsiOiJBSFhuOG5CQTRTZkxRRjdoTFFpU24xNmt4eWVoaml6QkdXMVRkcm1TWjFnRiIsImV4cCI6MTU5Mzk2MjI1OCwiZXhwMCI6MTU5MTk3NTA1NywianRpIjoiM2MzZWRlMTktNjI5My00MTNlLWJmMWUtZTRlZDZlYzUzZTgzIiwiY2lkIjoid2F2ZXMuZXhjaGFuZ2UifQ.gD1Qj0jfqayfZpBvNY0t3ccMyK5hdbT7dY-_5L6LxwV0Knan4ndEtvygxlTOczmJUKtnA4T1r5GBFgNMZTvtViKZIbqZNysEg2OY8UxwDaF4VPeGJLg_QXEnn8wBeBQdyMafh9UQdwD2ci7x-saM4tOAGmncAygfTDxy80201gwDhfAkAGerb9kL00oWzSJScldxu--pNLDBUEHZt52MSEel10HGrzvZkkvvSh67vcQo5TOGb5KG6nh65UdJCwr41AVz4fbQPP-N2Nkxqy0TE_bqVzZxExXgvcS8TS0Z82T3ijJa_ct7B9wblpylBnvmyj3VycUzufD6uy8MUGq32D",
            //   "expires_in": 604798,
            //   "scope": "general" }
            this.options['accessToken'] = this.safeString(response, 'access_token');
            return this.options['accessToken'];
        }
        return undefined;
    }
    parseTicker(ticker, market = undefined) {
        //
        //       {
        //           "symbol": "WAVES/BTC",
        //           "amountAssetID": "WAVES",
        //           "amountAssetName": "Waves",
        //           "amountAssetDecimals": 8,
        //           "amountAssetTotalSupply": "106908766.00000000",
        //           "amountAssetMaxSupply": "106908766.00000000",
        //           "amountAssetCirculatingSupply": "106908766.00000000",
        //           "priceAssetID": "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS",
        //           "priceAssetName": "WBTC",
        //           "priceAssetDecimals": 8,
        //           "priceAssetTotalSupply": "20999999.96007507",
        //           "priceAssetMaxSupply": "20999999.96007507",
        //           "priceAssetCirculatingSupply": "20999999.66019601",
        //           "24h_open": "0.00032688",
        //           "24h_high": "0.00033508",
        //           "24h_low": "0.00032443",
        //           "24h_close": "0.00032806",
        //           "24h_vwap": "0.00032988",
        //           "24h_volume": "42349.69440104",
        //           "24h_priceVolume": "13.97037207",
        //           "timestamp":1640232379124
        //       }
        //
        //  fetch ticker
        //
        //       {
        //           "firstPrice": "21749",
        //           "lastPrice": "22000",
        //           "volume": "0.73747149",
        //           "quoteVolume": "16409.44564928645471",
        //           "high": "23589.999941",
        //           "low": "21010.000845",
        //           "weightedAveragePrice": "22250.955964",
        //           "txsCount": "148",
        //           "volumeWaves": "0.0000000000680511203072"
        //       }
        //
        const timestamp = this.safeInteger(ticker, 'timestamp');
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market, '/');
        const symbol = market['symbol'];
        const last = this.safeString2(ticker, '24h_close', 'lastPrice');
        const low = this.safeString2(ticker, '24h_low', 'low');
        const high = this.safeString2(ticker, '24h_high', 'high');
        const vwap = this.safeString2(ticker, '24h_vwap', 'weightedAveragePrice');
        const baseVolume = this.safeString2(ticker, '24h_volume', 'volume');
        const quoteVolume = this.safeString2(ticker, '24h_priceVolume', 'quoteVolume');
        const open = this.safeString2(ticker, '24h_open', 'firstPrice');
        return this.safeTicker({
            'symbol': symbol,
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
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pairs': market['id'],
        };
        const response = await this.publicGetPairs(this.extend(request, params));
        //
        //     {
        //         "__type":"list",
        //         "data":[
        //             {
        //                 "__type":"pair",
        //                 "data":{
        //                     "firstPrice":0.00012512,
        //                     "lastPrice":0.00012441,
        //                     "low":0.00012167,
        //                     "high":0.00012768,
        //                     "weightedAveragePrice":0.000124710697407246,
        //                     "volume":209554.26356614,
        //                     "quoteVolume":26.1336583539951,
        //                     "volumeWaves":209554.26356614,
        //                     "txsCount":6655
        //                 },
        //                 "amountAsset":"WAVES",
        //                 "priceAsset":"8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const ticker = this.safeValue(data, 0, {});
        const dataTicker = this.safeDict(ticker, 'data', {});
        return this.parseTicker(dataTicker, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const response = await this.marketGetTickers(params);
        //
        //   [
        //       {
        //           "symbol": "WAVES/BTC",
        //           "amountAssetID": "WAVES",
        //           "amountAssetName": "Waves",
        //           "amountAssetDecimals": 8,
        //           "amountAssetTotalSupply": "106908766.00000000",
        //           "amountAssetMaxSupply": "106908766.00000000",
        //           "amountAssetCirculatingSupply": "106908766.00000000",
        //           "priceAssetID": "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS",
        //           "priceAssetName": "WBTC",
        //           "priceAssetDecimals": 8,
        //           "priceAssetTotalSupply": "20999999.96007507",
        //           "priceAssetMaxSupply": "20999999.96007507",
        //           "priceAssetCirculatingSupply": "20999999.66019601",
        //           "24h_open": "0.00032688",
        //           "24h_high": "0.00033508",
        //           "24h_low": "0.00032443",
        //           "24h_close": "0.00032806",
        //           "24h_vwap": "0.00032988",
        //           "24h_volume": "42349.69440104",
        //           "24h_priceVolume": "13.97037207",
        //           "timestamp":1640232379124
        //       }
        //       ...
        //   ]
        //
        return this.parseTickers(response, symbols);
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'baseId': market['baseId'],
            'quoteId': market['quoteId'],
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
        };
        const allowedCandles = this.safeInteger(this.options, 'allowedCandles', 1440);
        if (limit === undefined) {
            limit = allowedCandles;
        }
        limit = Math.min(allowedCandles, limit);
        const duration = this.parseTimeframe(timeframe) * 1000;
        if (since === undefined) {
            const durationRoundedTimestamp = this.parseToInt(this.milliseconds() / duration) * duration;
            const delta = (limit - 1) * duration;
            const timeStart = durationRoundedTimestamp - delta;
            request['timeStart'] = timeStart.toString();
        }
        else {
            request['timeStart'] = since.toString();
            const timeEnd = this.sum(since, duration * limit);
            request['timeEnd'] = timeEnd.toString();
        }
        const response = await this.publicGetCandlesBaseIdQuoteId(this.extend(request, params));
        //
        //     {
        //         "__type": "list",
        //         "data": [
        //             {
        //                 "__type": "candle",
        //                 "data": {
        //                     "time": "2020-06-09T14:47:00.000Z",
        //                     "open": 0.0250385,
        //                     "close": 0.0250385,
        //                     "high": 0.0250385,
        //                     "low": 0.0250385,
        //                     "volume": 0.01033012,
        //                     "quoteVolume": 0.00025865,
        //                     "weightedAveragePrice": 0.0250385,
        //                     "maxHeight": 2099399,
        //                     "txsCount": 5,
        //                     "timeClose": "2020-06-09T14:47:59.999Z"
        //                 }
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        let result = this.parseOHLCVs(data, market, timeframe, since, limit);
        result = this.filterFutureCandles(result);
        let lastClose = undefined;
        const length = result.length;
        for (let i = 0; i < result.length; i++) {
            const j = length - i - 1;
            const entry = result[j];
            const open = entry[1];
            if (open === undefined) {
                entry[1] = lastClose;
                entry[2] = lastClose;
                entry[3] = lastClose;
                entry[4] = lastClose;
                result[j] = entry;
            }
            lastClose = entry[4];
        }
        return result;
    }
    filterFutureCandles(ohlcvs) {
        const result = [];
        const timestamp = this.milliseconds();
        for (let i = 0; i < ohlcvs.length; i++) {
            if (ohlcvs[i][0] > timestamp) {
                // stop when getting data from the future
                break;
            }
            result.push(ohlcvs[i]);
        }
        return result;
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "__type": "candle",
        //         "data": {
        //             "time": "2020-06-05T20:46:00.000Z",
        //             "open": 240.573975,
        //             "close": 240.573975,
        //             "high": 240.573975,
        //             "low": 240.573975,
        //             "volume": 0.01278413,
        //             "quoteVolume": 3.075528,
        //             "weightedAveragePrice": 240.573975,
        //             "maxHeight": 2093895,
        //             "txsCount": 5,
        //             "timeClose": "2020-06-05T20:46:59.999Z"
        //         }
        //     }
        //
        const data = this.safeValue(ohlcv, 'data', {});
        return [
            this.parse8601(this.safeString(data, 'time')),
            this.safeNumber(data, 'open'),
            this.safeNumber(data, 'high'),
            this.safeNumber(data, 'low'),
            this.safeNumber(data, 'close'),
            this.safeNumber(data, 'volume', 0),
        ];
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.signIn();
        const networks = this.safeValue(this.options, 'networks', {});
        const rawNetwork = this.safeStringUpper(params, 'network');
        const network = this.safeString(networks, rawNetwork, rawNetwork);
        params = this.omit(params, ['network']);
        const supportedCurrencies = await this.privateGetPlatforms();
        //
        //     {
        //       "type": "list",
        //       "page_info": {
        //         "has_next_page": false,
        //         "last_cursor": null
        //       },
        //       "items": [
        //         {
        //           "type": "platform",
        //           "id": "ETH",
        //           "name": "Ethereum",
        //           "currencies": [
        //             "BAG",
        //             "BNT",
        //             "CRV",
        //             "EGG",
        //             "ETH",
        //             "EURN",
        //             "FL",
        //             "NSBT",
        //             "USDAP",
        //             "USDC",
        //             "USDFL",
        //             "USDN",
        //             "USDT",
        //             "WAVES"
        //           ]
        //         }
        //       ]
        //     }
        //
        const currencies = {};
        const networksByCurrency = {};
        const items = this.safeValue(supportedCurrencies, 'items', []);
        for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            const currencyId = this.safeString(entry, 'id');
            const innerCurrencies = this.safeValue(entry, 'currencies', []);
            for (let j = 0; j < innerCurrencies.length; j++) {
                const currencyCode = this.safeString(innerCurrencies, j);
                currencies[currencyCode] = true;
                if (!(currencyCode in networksByCurrency)) {
                    networksByCurrency[currencyCode] = {};
                }
                networksByCurrency[currencyCode][currencyId] = true;
            }
        }
        if (!(code in currencies)) {
            const codes = Object.keys(currencies);
            throw new errors.ExchangeError(this.id + ' fetchDepositAddress() ' + code + ' not supported. Currency code must be one of ' + codes.join(', '));
        }
        let response = undefined;
        if (network === undefined) {
            const request = {
                'currency': code,
            };
            response = await this.privateGetDepositAddressesCurrency(this.extend(request, params));
        }
        else {
            const supportedNetworks = networksByCurrency[code];
            if (!(network in supportedNetworks)) {
                const supportedNetworkKeys = Object.keys(supportedNetworks);
                throw new errors.ExchangeError(this.id + ' ' + network + ' network ' + code + ' deposit address not supported. Network must be one of ' + supportedNetworkKeys.join(', '));
            }
            if (network === 'WAVES') {
                const request = {
                    'publicKey': this.apiKey,
                };
                const responseInner = await this.nodeGetAddressesPublicKeyPublicKey(this.extend(request, request));
                const addressInner = this.safeString(response, 'address');
                return {
                    'address': addressInner,
                    'code': code,
                    'currency': code,
                    'network': network,
                    'tag': undefined,
                    'info': responseInner,
                };
            }
            else {
                const request = {
                    'currency': code,
                    'platform': network,
                };
                response = await this.privateGetDepositAddressesCurrencyPlatform(this.extend(request, params));
            }
        }
        //
        // {
        //   "type": "deposit_addresses",
        //   "currency": {
        //     "type": "deposit_currency",
        //     "id": "ERGO",
        //     "waves_asset_id": "5dJj4Hn9t2Ve3tRpNGirUHy4yBK6qdJRAJYV21yPPuGz",
        //     "platform_id": "BSC",
        //     "decimals": 9,
        //     "status": "active",
        //     "allowed_amount": {
        //       "min": 0.001,
        //       "max": 100000
        //     },
        //     "fees": {
        //       "flat": 0,
        //       "rate": 0
        //     }
        //   },
        //   "deposit_addresses": [
        //     "9fRAAQjF8Yqg7qicQCL884zjimsRnuwsSavsM1rUdDaoG8mThku"
        //   ]
        // }
        const currency = this.safeValue(response, 'currency');
        const networkId = this.safeString(currency, 'platform_id');
        const networkByIds = this.safeValue(this.options, 'networkByIds', {});
        const unifiedNetwork = this.safeString(networkByIds, networkId, networkId);
        const addresses = this.safeValue(response, 'deposit_addresses');
        const address = this.safeString(addresses, 0);
        return {
            'address': address,
            'code': code,
            'currency': code,
            'tag': undefined,
            'network': unifiedNetwork,
            'info': response,
        };
    }
    async getMatcherPublicKey() {
        // this method returns a single string
        const matcherPublicKey = this.safeString(this.options, 'matcherPublicKey');
        if (matcherPublicKey) {
            return matcherPublicKey;
        }
        else {
            const response = await this.matcherGetMatcher();
            // remove trailing quotes from string response
            this.options['matcherPublicKey'] = response.slice(1, response.length - 1);
            return this.options['matcherPublicKey'];
        }
    }
    getAssetBytes(currencyId) {
        if (currencyId === 'WAVES') {
            return this.numberToBE(0, 1);
        }
        else {
            return this.binaryConcat(this.numberToBE(1, 1), this.base58ToBinary(currencyId));
        }
    }
    getAssetId(currencyId) {
        if (currencyId === 'WAVES') {
            return '';
        }
        return currencyId;
    }
    customPriceToPrecision(symbol, price) {
        const market = this.markets[symbol];
        const wavesPrecision = this.safeString(this.options, 'wavesPrecision', '8');
        const amount = this.numberToString(market['precision']['amount']);
        const precisionPrice = this.numberToString(market['precision']['price']);
        const difference = Precise["default"].stringSub(amount, precisionPrice);
        const precision = Precise["default"].stringSub(wavesPrecision, difference);
        const pricePrecision = this.toPrecision(price, precision).toString();
        return this.parseToInt(parseFloat(pricePrecision));
    }
    customAmountToPrecision(symbol, amount) {
        const amountPrecision = this.numberToString(this.toPrecision(amount, this.numberToString(this.markets[symbol]['precision']['amount'])));
        return this.parseToInt(parseFloat(amountPrecision));
    }
    customCurrencyToPrecision(code, amount, networkCode = undefined) {
        const amountPrecision = this.numberToString(this.toPrecision(amount, this.currencies[code]['precision']));
        return this.parseToInt(parseFloat(amountPrecision));
    }
    fromPrecision(amount, scale) {
        if (amount === undefined) {
            return undefined;
        }
        const precise = new Precise["default"](amount);
        precise.decimals = this.sum(precise.decimals, scale);
        precise.reduce();
        return precise.toString();
    }
    toPrecision(amount, scale) {
        const amountString = this.numberToString(amount);
        const precise = new Precise["default"](amountString);
        // precise.decimals should be integer
        precise.decimals = this.parseToInt(Precise["default"].stringSub(this.numberToString(precise.decimals), this.numberToString(scale)));
        precise.reduce();
        const stringValue = precise.toString();
        return stringValue;
    }
    currencyFromPrecision(currency, amount) {
        const scale = this.currencies[currency]['precision'];
        return this.fromPrecision(amount, scale);
    }
    priceFromPrecision(symbol, price) {
        const market = this.markets[symbol];
        const wavesPrecision = this.safeInteger(this.options, 'wavesPrecision', 8);
        const scale = this.sum(wavesPrecision, market['precision']['price']) - market['precision']['amount'];
        return this.fromPrecision(price, scale);
    }
    safeGetDynamic(settings) {
        const orderFee = this.safeValue(settings, 'orderFee');
        if ('dynamic' in orderFee) {
            return this.safeValue(orderFee, 'dynamic');
        }
        else {
            return this.safeValue(orderFee['composite']['default'], 'dynamic');
        }
    }
    safeGetRates(dynamic) {
        const rates = this.safeValue(dynamic, 'rates');
        if (rates === undefined) {
            return { 'WAVES': 1 };
        }
        return rates;
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.stopPrice] The price at which a stop order is triggered at
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredDependencies();
        this.checkRequiredKeys();
        await this.loadMarkets();
        const market = this.market(symbol);
        const matcherPublicKey = await this.getMatcherPublicKey();
        const amountAsset = this.getAssetId(market['baseId']);
        const priceAsset = this.getAssetId(market['quoteId']);
        const isMarketOrder = (type === 'market');
        const stopPrice = this.safeFloat2(params, 'triggerPrice', 'stopPrice');
        const isStopOrder = (stopPrice !== undefined);
        if ((isMarketOrder) && (price === undefined)) {
            throw new errors.InvalidOrder(this.id + ' createOrder() requires a price argument for ' + type + ' orders to determine the max price for buy and the min price for sell');
        }
        const timestamp = this.milliseconds();
        const defaultExpiryDelta = this.safeInteger(this.options, 'createOrderDefaultExpiry', 2419200000);
        const expiration = this.sum(timestamp, defaultExpiryDelta);
        const matcherFees = await this.getFeesForAsset(symbol, side, amount, price);
        // {
        //     "base":{
        //        "feeAssetId":"WAVES", // varies depending on the trading pair
        //        "matcherFee":"1000000"
        //     },
        //     "discount":{
        //        "feeAssetId":"EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc",
        //        "matcherFee":"4077612"
        //     }
        //  }
        const base = this.safeValue2(matcherFees, 'base', 'discount');
        const baseFeeAssetId = this.safeString(base, 'feeAssetId');
        const baseFeeAsset = this.safeCurrencyCode(baseFeeAssetId);
        const baseMatcherFee = this.safeString(base, 'matcherFee');
        const discount = this.safeValue(matcherFees, 'discount');
        const discountFeeAssetId = this.safeString(discount, 'feeAssetId');
        const discountFeeAsset = this.safeCurrencyCode(discountFeeAssetId);
        const discountMatcherFee = this.safeString(discount, 'matcherFee');
        let matcherFeeAssetId = undefined;
        let matcherFee = undefined;
        // check first if user supplied asset fee is valid
        if (('feeAsset' in params) || ('feeAsset' in this.options)) {
            const feeAsset = this.safeString(params, 'feeAsset', this.safeString(this.options, 'feeAsset'));
            const feeCurrency = this.currency(feeAsset);
            matcherFeeAssetId = this.safeString(feeCurrency, 'id');
        }
        const balances = await this.fetchBalance();
        if (matcherFeeAssetId !== undefined) {
            if (baseFeeAssetId !== matcherFeeAssetId && discountFeeAssetId !== matcherFeeAssetId) {
                throw new errors.InvalidOrder(this.id + ' asset fee must be ' + baseFeeAsset + ' or ' + discountFeeAsset);
            }
            const matcherFeeAsset = this.safeCurrencyCode(matcherFeeAssetId);
            const rawMatcherFee = (matcherFeeAssetId === baseFeeAssetId) ? baseMatcherFee : discountMatcherFee;
            const floatMatcherFee = parseFloat(this.currencyFromPrecision(matcherFeeAsset, rawMatcherFee));
            if ((matcherFeeAsset in balances) && (balances[matcherFeeAsset]['free'] >= floatMatcherFee)) {
                matcherFee = parseInt(rawMatcherFee);
            }
            else {
                throw new errors.InsufficientFunds(this.id + ' not enough funds of the selected asset fee');
            }
        }
        if (matcherFeeAssetId === undefined) {
            // try to the pay the fee using the base first then discount asset
            const floatBaseMatcherFee = parseFloat(this.currencyFromPrecision(baseFeeAsset, baseMatcherFee));
            if ((baseFeeAsset in balances) && (balances[baseFeeAsset]['free'] >= floatBaseMatcherFee)) {
                matcherFeeAssetId = baseFeeAssetId;
                matcherFee = parseInt(baseMatcherFee);
            }
            else {
                const floatDiscountMatcherFee = parseFloat(this.currencyFromPrecision(discountFeeAsset, discountMatcherFee));
                if ((discountFeeAsset in balances) && (balances[discountFeeAsset]['free'] >= floatDiscountMatcherFee)) {
                    matcherFeeAssetId = discountFeeAssetId;
                    matcherFee = parseInt(discountMatcherFee);
                }
            }
        }
        if (matcherFeeAssetId === undefined) {
            throw new errors.InsufficientFunds(this.id + ' not enough funds on none of the eligible asset fees');
        }
        amount = this.customAmountToPrecision(symbol, amount);
        price = this.customPriceToPrecision(symbol, price);
        const assetPair = {
            'amountAsset': amountAsset,
            'priceAsset': priceAsset,
        };
        const sandboxMode = this.safeBool(this.options, 'sandboxMode', false);
        const chainId = (sandboxMode) ? 84 : 87;
        const body = {
            'senderPublicKey': this.apiKey,
            'matcherPublicKey': matcherPublicKey,
            'assetPair': assetPair,
            'orderType': side,
            'price': price,
            'amount': amount,
            'timestamp': timestamp,
            'expiration': expiration,
            'matcherFee': parseInt(matcherFee),
            'priceMode': 'assetDecimals',
            'version': 4,
            'chainId': chainId,
        };
        if (isStopOrder) {
            //
            // {
            //     "v": 1, // version (int)
            //     "c": { // condition (object)
            //         "t": "sp", // condition type. for now only "stop-price" (string)
            //         "v": { // value (object)
            //             "p": "123", // price (long)
            //         },
            //     },
            // }
            //
            const attachment = {
                'v': 1,
                'c': {
                    't': 'sp',
                    'v': {
                        'p': this.customPriceToPrecision(symbol, stopPrice),
                    },
                },
            };
            body['attachment'] = this.binaryToBase58(this.encode(JSON.stringify(attachment)));
        }
        if (matcherFeeAssetId !== 'WAVES') {
            body['matcherFeeAssetId'] = matcherFeeAssetId;
        }
        let serializedOrder = await this.matcherPostMatcherOrdersSerialize(body);
        if ((serializedOrder[0] === '"') && (serializedOrder[(serializedOrder.length - 1)] === '"')) {
            serializedOrder = serializedOrder.slice(1, serializedOrder.length - 1);
        }
        const signature = this.axolotl(this.binaryToBase16(this.base58ToBinary(serializedOrder)), this.binaryToBase16(this.base58ToBinary(this.secret)), ed25519.ed25519);
        body['signature'] = signature;
        //
        //     {
        //         "success": true,
        //         "message": {
        //           "version": 4,
        //           "id": "8VR49dLZFaYcVwzx9TqVMTAZCSUoyB74kLUHrEPCSJgN",
        //           "sender": "3MpEdBXtsRHRj2TvZURSb8uLDxzneVbYczW",
        //           "senderPublicKey": "8aUTNqHGCBiubySBRhcS1N6NC5jLczhVcndRfMAuwtkY",
        //           "matcherPublicKey": "8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy",
        //           "assetPair": {
        //             "amountAsset": "EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc",
        //             "priceAsset": "25FEqEjRkqK6yCkiT7Lz6SAYz7gUFCtxfCChnrVFD5AT"
        //           },
        //           "orderType": "sell",
        //           "amount": 100000,
        //           "price": 480000,
        //           "timestamp": 1690852043772,
        //           "expiration": 1693271243772,
        //           "matcherFee": 83327570,
        //           "signature": "3QYDWQVSP4kdqpTLodCuboh8bpWd6GW5s1pQyKdce1JBDwX6t4kH5Xtuq35pqo94gxjo3cfG6k6Xuic2JaYLubkK",
        //           "proofs": [
        //             "3QYDWQVSP4kdqpTLodCuboh8bpWd6GW5s1pQyKdce1JBDwX6t4kH5Xtuq35pqo94gxjo3cfG6k6Xuic2JaYLubkK"
        //           ],
        //           "matcherFeeAssetId": "EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc",
        //           "eip712Signature": null,
        //           "priceMode": "assetDecimals",
        //           "attachment": "2PQ4akZHnMSZrQissuu5uudoXbgsipeDnFcRtXtjVgkdm1gUWEgGzp"
        //         },
        //         "status": "OrderAccepted"
        //     }
        //
        if (isMarketOrder) {
            const response = await this.matcherPostMatcherOrderbookMarket(body);
            const value = this.safeDict(response, 'message');
            return this.parseOrder(value, market);
        }
        else {
            const response = await this.matcherPostMatcherOrderbook(body);
            const value = this.safeDict(response, 'message');
            return this.parseOrder(value, market);
        }
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredDependencies();
        this.checkRequiredKeys();
        await this.signIn();
        const wavesAddress = await this.getWavesAddress();
        const response = await this.forwardPostMatcherOrdersWavesAddressCancel({
            'wavesAddress': wavesAddress,
            'orderId': id,
        });
        //  {
        //    "success":true,
        //    "message":[[{"orderId":"EBpJeGM36KKFz5gTJAUKDBm89V8wqxKipSFBdU35AN3c","success":true,"status":"OrderCanceled"}]],
        //    "status":"BatchCancelCompleted"
        //  }
        const message = this.safeValue(response, 'message');
        const firstMessage = this.safeValue(message, 0);
        const firstOrder = this.safeValue(firstMessage, 0);
        const returnedId = this.safeString(firstOrder, 'orderId');
        return {
            'info': response,
            'id': returnedId,
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
        };
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredDependencies();
        this.checkRequiredKeys();
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const timestamp = this.milliseconds();
        const byteArray = [
            this.base58ToBinary(this.apiKey),
            this.numberToBE(timestamp, 8),
        ];
        const binary = this.binaryConcatArray(byteArray);
        const hexSecret = this.binaryToBase16(this.base58ToBinary(this.secret));
        const signature = this.axolotl(this.binaryToBase16(binary), hexSecret, ed25519.ed25519);
        const request = {
            'Timestamp': timestamp.toString(),
            'Signature': signature,
            'publicKey': this.apiKey,
            'orderId': id,
        };
        const response = await this.matcherGetMatcherOrderbookPublicKeyOrderId(this.extend(request, params));
        return this.parseOrder(response, market);
    }
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredDependencies();
        this.checkRequiredKeys();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const timestamp = this.milliseconds();
        const byteArray = [
            this.base58ToBinary(this.apiKey),
            this.numberToBE(timestamp, 8),
        ];
        const binary = this.binaryConcatArray(byteArray);
        const hexSecret = this.binaryToBase16(this.base58ToBinary(this.secret));
        const signature = this.axolotl(this.binaryToBase16(binary), hexSecret, ed25519.ed25519);
        const request = {
            'Accept': 'application/json',
            'Timestamp': timestamp.toString(),
            'Signature': signature,
            'publicKey': this.apiKey,
            'baseId': market['baseId'],
            'quoteId': market['quoteId'],
        };
        const response = await this.matcherGetMatcherOrderbookBaseIdQuoteIdPublicKeyPublicKey(this.extend(request, params));
        // [ { id: "3KicDeWayY2mdrRoYdCkP3gUAoUZUNT1AA6GAtWuPLfa",
        //     "type": "sell",
        //     "orderType": "limit",
        //     "amount": 1,
        //     "fee": 300000,
        //     "price": 100000000,
        //     "timestamp": 1591651254076,
        //     "filled": 0,
        //     "filledFee": 0,
        //     "feeAsset": "WAVES",
        //     "status": "Accepted",
        //     "assetPair":
        //      { amountAsset: null,
        //        "priceAsset": "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS" },
        //     "avgWeighedPrice": 0 }, ... ]
        return this.parseOrders(response, market, since, limit);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        await this.signIn();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const address = await this.getWavesAddress();
        const request = {
            'address': address,
            'activeOnly': true,
        };
        const response = await this.forwardGetMatcherOrdersAddress(request);
        return this.parseOrders(response, market, since, limit);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        await this.signIn();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const address = await this.getWavesAddress();
        const request = {
            'address': address,
            'closedOnly': true,
        };
        const response = await this.forwardGetMatcherOrdersAddress(request);
        // [
        //   {
        //     "id": "9aXcxvXai73jbAm7tQNnqaQ2PwUjdmWuyjvRTKAHsw4f",
        //     "type": "buy",
        //     "orderType": "limit",
        //     "amount": 23738330,
        //     "fee": 300000,
        //     "price": 3828348334,
        //     "timestamp": 1591926905636,
        //     "filled": 23738330,
        //     "filledFee": 300000,
        //     "feeAsset": "WAVES",
        //     "status": "Filled",
        //     "assetPair": {
        //       "amountAsset": "HZk1mbfuJpmxU1Fs4AX5MWLVYtctsNcg6e2C6VKqK8zk",
        //       "priceAsset": null
        //     },
        //     "avgWeighedPrice": 3828348334
        //   }, ...
        // ]
        return this.parseOrders(response, market, since, limit);
    }
    parseOrderStatus(status) {
        const statuses = {
            'Cancelled': 'canceled',
            'Accepted': 'open',
            'Filled': 'closed',
            'PartiallyFilled': 'open',
        };
        return this.safeString(statuses, status, status);
    }
    getSymbolFromAssetPair(assetPair) {
        // a blank string or null can indicate WAVES
        const baseId = this.safeString(assetPair, 'amountAsset', 'WAVES');
        const quoteId = this.safeString(assetPair, 'priceAsset', 'WAVES');
        return this.safeCurrencyCode(baseId) + '/' + this.safeCurrencyCode(quoteId);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "version": 4,
        //         "id": "BshyeHXDfJmTnjTdBYt371jD4yWaT3JTP6KpjpsiZepS",
        //         "sender": "3P8VzLSa23EW5CVckHbV7d5BoN75fF1hhFH",
        //         "senderPublicKey": "AHXn8nBA4SfLQF7hLQiSn16kxyehjizBGW1TdrmSZ1gF",
        //         "matcherPublicKey": "9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
        //         "assetPair": {
        //             "amountAsset": "474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu",
        //             "priceAsset": "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        //         },
        //         "orderType": "buy",
        //         "amount": 10000,
        //         "price": 400000000,
        //         "timestamp": 1599848586891,
        //         "expiration": 1602267786891,
        //         "matcherFee": 3008,
        //         "matcherFeeAssetId": "474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu",
        //         "signature": "3D2h8ubrhuWkXbVn4qJ3dvjmZQxLoRNfjTqb9uNpnLxUuwm4fGW2qGH6yKFe2SQPrcbgkS3bDVe7SNtMuatEJ7qy",
        //         "proofs": [
        //             "3D2h8ubrhuWkXbVn4qJ3dvjmZQxLoRNfjTqb9uNpnLxUuwm4fGW2qGH6yKFe2SQPrcbgkS3bDVe7SNtMuatEJ7qy",
        //         ],
        //         "attachment":"77rnoyFX5BDr15hqZiUtgXKSN46zsbHHQjVNrTMLZcLz62mmFKr39FJ"
        //     }
        //
        //
        // fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "id": "81D9uKk2NfmZzfG7uaJsDtxqWFbJXZmjYvrL88h15fk8",
        //         "type": "buy",
        //         "orderType": "limit",
        //         "amount": 30000000000,
        //         "filled": 0,
        //         "price": 1000000,
        //         "fee": 300000,
        //         "filledFee": 0,
        //         "feeAsset": "WAVES",
        //         "timestamp": 1594303779322,
        //         "status": "Cancelled",
        //         "assetPair": {
        //             "amountAsset": "474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu",
        //             "priceAsset": "WAVES"
        //         },
        //         "avgWeighedPrice": 0,
        //         "version": 4,
        //         "totalExecutedPriceAssets": 0,  // in fetchOpenOrder/s
        //         "attachment":"77rnoyFX5BDr15hqZiUtgXKSN46zsbHHQjVNrTMLZcLz62mmFKr39FJ"
        //     }
        //
        const timestamp = this.safeInteger(order, 'timestamp');
        const side = this.safeString2(order, 'type', 'orderType');
        let type = 'limit';
        if ('type' in order) {
            // fetchOrders
            type = this.safeString(order, 'orderType', type);
        }
        const id = this.safeString(order, 'id');
        const filledString = this.safeString(order, 'filled');
        const priceString = this.safeString(order, 'price');
        const amountString = this.safeString(order, 'amount');
        const assetPair = this.safeValue(order, 'assetPair');
        let symbol = undefined;
        if (assetPair !== undefined) {
            symbol = this.getSymbolFromAssetPair(assetPair);
        }
        else if (market !== undefined) {
            symbol = market['symbol'];
        }
        const amountCurrency = this.safeCurrencyCode(this.safeString(assetPair, 'amountAsset', 'WAVES'));
        const price = this.priceFromPrecision(symbol, priceString);
        const amount = this.currencyFromPrecision(amountCurrency, amountString);
        const filled = this.currencyFromPrecision(amountCurrency, filledString);
        const average = this.priceFromPrecision(symbol, this.safeString(order, 'avgWeighedPrice'));
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        let fee = undefined;
        if ('type' in order) {
            const currency = this.safeCurrencyCode(this.safeString(order, 'feeAsset'));
            fee = {
                'currency': currency,
                'fee': this.parseNumber(this.currencyFromPrecision(currency, this.safeString(order, 'filledFee'))),
            };
        }
        else {
            const currency = this.safeCurrencyCode(this.safeString(order, 'matcherFeeAssetId', 'WAVES'));
            fee = {
                'currency': currency,
                'fee': this.parseNumber(this.currencyFromPrecision(currency, this.safeString(order, 'matcherFee'))),
            };
        }
        let triggerPrice = undefined;
        const attachment = this.safeString(order, 'attachment');
        if (attachment !== undefined) {
            const decodedAttachment = this.parseJson(this.decode(this.base58ToBinary(attachment)));
            if (decodedAttachment !== undefined) {
                const c = this.safeValue(decodedAttachment, 'c');
                if (c !== undefined) {
                    const v = this.safeValue(c, 'v');
                    if (v !== undefined) {
                        triggerPrice = this.safeString(v, 'p');
                    }
                }
            }
        }
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }
    async getWavesAddress() {
        const cachedAddreess = this.safeString(this.options, 'wavesAddress');
        if (cachedAddreess === undefined) {
            const request = {
                'publicKey': this.apiKey,
            };
            const response = await this.nodeGetAddressesPublicKeyPublicKey(request);
            this.options['wavesAddress'] = this.safeString(response, 'address');
            return this.options['wavesAddress'];
        }
        else {
            return cachedAddreess;
        }
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        // makes a lot of different requests to get all the data
        // in particular:
        // fetchMarkets, getWavesAddress,
        // getTotalBalance (doesn't include waves), getReservedBalance (doesn't include waves)
        // getReservedBalance (includes WAVES)
        // I couldn't find another way to get all the data
        this.checkRequiredDependencies();
        this.checkRequiredKeys();
        await this.loadMarkets();
        const wavesAddress = await this.getWavesAddress();
        const request = {
            'address': wavesAddress,
        };
        const totalBalance = await this.nodeGetAssetsBalanceAddress(request);
        // {
        //   "address": "3P8VzLSa23EW5CVckHbV7d5BoN75fF1hhFH",
        //   "balances": [
        //     {
        //       "assetId": "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        //       "balance": 1177200,
        //       "reissuable": false,
        //       "minSponsoredAssetFee": 7420,
        //       "sponsorBalance": 47492147189709,
        //       "quantity": 999999999775381400,
        //       "issueTransaction": {
        //         "senderPublicKey": "BRnVwSVctnV8pge5vRpsJdWnkjWEJspFb6QvrmZvu3Ht",
        //         "quantity": 1000000000000000000,
        //         "fee": 100400000,
        //         "description": "Neutrino USD",
        //         "type": 3,
        //         "version": 2,
        //         "reissuable": false,
        //         "script": null,
        //         "sender": "3PC9BfRwJWWiw9AREE2B3eWzCks3CYtg4yo",
        //         "feeAssetId": null,
        //         "chainId": 87,
        //         "proofs": [
        //           "3HNpbVkgP69NWSeb9hGYauiQDaXrRXh3tXFzNsGwsAAXnFrA29SYGbLtziW9JLpXEq7qW1uytv5Fnm5XTUMB2BxU"
        //         ],
        //         "assetId": "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        //         "decimals": 6,
        //         "name": "USD-N",
        //         "id": "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        //         "timestamp": 1574429393962
        //       }
        //     }
        //   ]
        // }
        const balances = this.safeValue(totalBalance, 'balances', []);
        const result = {};
        let timestamp = undefined;
        const assetIds = [];
        const nonStandardBalances = [];
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const entryTimestamp = this.safeInteger(entry, 'timestamp');
            timestamp = (timestamp === undefined) ? entryTimestamp : Math.max(timestamp, entryTimestamp);
            const issueTransaction = this.safeValue(entry, 'issueTransaction');
            const currencyId = this.safeString(entry, 'assetId');
            const balance = this.safeString(entry, 'balance');
            if (issueTransaction === undefined) {
                assetIds.push(currencyId);
                nonStandardBalances.push(balance);
                continue;
            }
            const decimals = this.safeInteger(issueTransaction, 'decimals');
            let code = undefined;
            if (currencyId in this.currencies_by_id) {
                code = this.safeCurrencyCode(currencyId);
                result[code] = this.account();
                result[code]['total'] = this.fromPrecision(balance, decimals);
            }
        }
        const nonStandardAssets = assetIds.length;
        if (nonStandardAssets) {
            const requestInner = {
                'ids': assetIds,
            };
            const response = await this.publicGetAssets(requestInner);
            const data = this.safeValue(response, 'data', []);
            for (let i = 0; i < data.length; i++) {
                const entry = data[i];
                const balance = nonStandardBalances[i];
                const inner = this.safeValue(entry, 'data');
                const decimals = this.safeInteger(inner, 'precision');
                const ticker = this.safeString(inner, 'ticker');
                const code = this.safeCurrencyCode(ticker);
                result[code] = this.account();
                result[code]['total'] = this.fromPrecision(balance, decimals);
            }
        }
        const currentTimestamp = this.milliseconds();
        const byteArray = [
            this.base58ToBinary(this.apiKey),
            this.numberToBE(currentTimestamp, 8),
        ];
        const binary = this.binaryConcatArray(byteArray);
        const hexSecret = this.binaryToBase16(this.base58ToBinary(this.secret));
        const signature = this.axolotl(this.binaryToBase16(binary), hexSecret, ed25519.ed25519);
        const matcherRequest = {
            'publicKey': this.apiKey,
            'signature': signature,
            'timestamp': currentTimestamp.toString(),
        };
        const reservedBalance = await this.matcherGetMatcherBalanceReservedPublicKey(matcherRequest);
        // { WAVES: 200300000 }
        const reservedKeys = Object.keys(reservedBalance);
        for (let i = 0; i < reservedKeys.length; i++) {
            const currencyId = reservedKeys[i];
            const code = this.safeCurrencyCode(currencyId);
            if (!(code in result)) {
                result[code] = this.account();
            }
            const amount = this.safeString(reservedBalance, currencyId);
            if (code in this.currencies) {
                result[code]['used'] = this.currencyFromPrecision(code, amount);
            }
            else {
                result[code]['used'] = amount;
            }
        }
        const wavesRequest = {
            'address': wavesAddress,
        };
        const wavesTotal = await this.nodeGetAddressesBalanceAddress(wavesRequest);
        // {
        //   "address": "3P8VzLSa23EW5CVckHbV7d5BoN75fF1hhFH",
        //   "confirmations": 0,
        //   "balance": 909085978
        // }
        result['WAVES'] = this.safeValue(result, 'WAVES', {});
        result['WAVES']['total'] = this.currencyFromPrecision('WAVES', this.safeString(wavesTotal, 'balance'));
        const codes = Object.keys(result);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            if (this.safeValue(result[code], 'used') === undefined) {
                result[code]['used'] = '0';
            }
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601(timestamp);
        return this.safeBalance(result);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        const address = await this.getWavesAddress();
        const request = {
            'sender': address,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['amountAsset'] = market['baseId'];
            request['priceAsset'] = market['quoteId'];
        }
        const response = await this.publicGetTransactionsExchange(request);
        const data = this.safeValue(response, 'data');
        //
        //      {
        //          "__type":"list",
        //          "isLastPage":true,
        //          "lastCursor":"MzA2MjQ0MzAwMDI5OjpkZXNj",
        //          "data": [
        //              {
        //                  "__type":"transaction",
        //                  "data": {
        //                      "id":"GbjPqco2wRP5QSrY5LimFrUyJaM535K9nhK5zaQ7J7Tx",
        //                      "timestamp":"2022-04-06T19:56:31.479Z",
        //                      "height":3062443,
        //                      "type":7,
        //                      "version":2,
        //                      "proofs":[
        //                          "57mYrANw61eiArCTv2eYwzXm71jYC2KpZ5AeM9zHEstuRaYSAWSuSE7njAJYJu8zap6DMCm3nzqc6es3wQFDpRCN"
        //                      ],
        //                      "fee":0.003,
        //                      "applicationStatus":"succeeded",
        //                      "sender":"3PEjHv3JGjcWNpYEEkif2w8NXV4kbhnoGgu",
        //                      "senderPublicKey":"9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
        //                      "buyMatcherFee":0,
        //                      "sellMatcherFee":0.00141728,
        //                      "price":215.7431,
        //                      "amount":0.09,
        //                      "order1": {
        //                          "id":"49qiuQj5frdZ6zpTCEpMuKPMAh1EimwXpXWB4BeCw33h",
        //                          "senderPublicKey":"CjUfoH3dsDZsf5UuAjqqzpWHXgvKzBZpVG9YixF7L48K",
        //                          "matcherPublicKey":"9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
        //                          "assetPair": {
        //                              "amountAsset":"7TMu26hAs7B2oW6c5sfx45KSZT7GQA3TZNYuCav8Dcqt",
        //                              "priceAsset":"DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p"
        //                          },
        //                          "orderType":"buy",
        //                          "price":215.7431,
        //                          "sender":"3PR9WmaHV5ueVw2Wr9xsiCG3t4ySXzkkGLy",
        //                          "amount":0.36265477,
        //                          "timestamp":"2022-04-06T19:55:06.832Z",
        //                          "expiration":"2022-05-05T19:55:06.832Z",
        //                          "matcherFee":3.000334,
        //                          "signature":"2rBWhdeuRJNpQfXfTFtcR8x8Lpic8FUHPdLML9uxABRUuxe48YRJcZxbncwWAh9LWFCEUZiztv7RZBZfGMWfFxTs",
        //                          "matcherFeeAssetId":"DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p"
        //                      },
        //                      "order2": {
        //                          "id":"AkxiJqCuv6wm8K41TUSgFNwShZMnCbMDT78MqrcWpQ53",
        //                          "senderPublicKey":"72o7qNKyne5hthB1Ww6famE7uHrk5vTVB2ZfUMBEqL3Y",
        //                          "matcherPublicKey":"9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
        //                          "assetPair": {
        //                              "amountAsset":"7TMu26hAs7B2oW6c5sfx45KSZT7GQA3TZNYuCav8Dcqt",
        //                              "priceAsset":"DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p"
        //                          },
        //                          "orderType":"sell",
        //                          "price":210,
        //                          "sender":"3P3CzbjGgiqEyUBeKZYfgZtyaZfMG8fjoUD",
        //                          "amount":0.09,
        //                          "timestamp":"2022-04-06T19:56:18.535Z",
        //                          "expiration":"2022-05-04T19:56:18.535Z",
        //                          "matcherFee":0.00141728,
        //                          "signature":"5BZCjYn6QzVkMXBFDBnzcAUBdCZqhq9hQfRXFHfLUQCsbis4zeriw4sUqLa1BZRT2isC6iY4Z4HtekikPqZ461PT",
        //                          "matcherFeeAssetId":"7TMu26hAs7B2oW6c5sfx45KSZT7GQA3TZNYuCav8Dcqt"
        //                      }
        //                  }
        //              },...
        //          ]
        //      }
        //
        return this.parseTrades(data, market, since, limit);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'amountAsset': market['baseId'],
            'priceAsset': market['quoteId'],
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 100);
        }
        if (since !== undefined) {
            request['timeStart'] = since;
        }
        const response = await this.publicGetTransactionsExchange(request);
        const data = this.safeValue(response, 'data');
        //
        //      {
        //          "__type":"list",
        //          "isLastPage":false,
        //          "lastCursor":"MzA2MjM2MTAwMDU0OjpkZXNj",
        //          "data": [
        //              {
        //                  "__type":"transaction",
        //                  "data": {
        //                      "id":"F42WsvSsyEzvpPLFjVhQKkSNuopooP4zMkjSUs47NeML",
        //                      "timestamp":"2022-04-06T18:39:49.145Z",
        //                      "height":3062361,
        //                      "type":7,
        //                      "version":2,
        //                      "proofs": [
        //                          "39iJv82kFi4pyuBxYeZpP45NXXjbrCXdVsHPAAvj32UMLmTXLjMTfV43PcmZDSAuS93HKSDo1aKJrin8UvkeE9Bs"
        //                      ],
        //                      "fee":0.003,
        //                      "applicationStatus":"succeeded",
        //                      "sender":"3PEjHv3JGjcWNpYEEkif2w8NXV4kbhnoGgu",
        //                      "senderPublicKey":"9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
        //                      "buyMatcherFee":0.02314421,
        //                      "sellMatcherFee":0,
        //                      "price":217.3893,
        //                      "amount":0.34523025,
        //                      "order1": {
        //                          "id":"HkM36PHGaeeZdDKT1mYgZXhaU9PRZ54RZiJc2K4YMT3Q",
        //                          "senderPublicKey":"7wYCaDcc6GX1Jx2uS7QgLHBypBKvrezTS1HfiW6Xe4Bk",
        //                          "matcherPublicKey":"9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
        //                          "assetPair": {
        //                              "amountAsset":"7TMu26hAs7B2oW6c5sfx45KSZT7GQA3TZNYuCav8Dcqt",
        //                              "priceAsset":"DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p"
        //                          },
        //                          "orderType":"buy",
        //                          "price":225.2693,
        //                          "sender":"3PLPc8f4DGYaF9C9bwJ2uVmHqRv3NCjg5VQ",
        //                          "amount":2.529,
        //                          "timestamp":"2022-04-06T18:39:48.796Z",
        //                          "expiration":"2022-05-05T18:39:48.796Z",
        //                          "matcherFee":0.17584444,
        //                          "signature":"2yQfJoomv86evQDw36fg1uiRkHvPDZtRp3qvxqTBWPvz4JLTHGQtEHJF5NGTvym6U93CtgNprngzmD9ecHBjxf6U",
        //                          "matcherFeeAssetId":"Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on"
        //                      },
        //                      "order2": {
        //                          "id":"F7HKmeuzwWdk3wKitHLnVx5MuD4wBWPpphQ8kUGx4tT9",
        //                          "senderPublicKey":"CjUfoH3dsDZsf5UuAjqqzpWHXgvKzBZpVG9YixF7L48K",
        //                          "matcherPublicKey":"9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
        //                          "assetPair": {
        //                              "amountAsset":"7TMu26hAs7B2oW6c5sfx45KSZT7GQA3TZNYuCav8Dcqt",
        //                              "priceAsset":"DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p"
        //                          },
        //                          "orderType":"sell",
        //                          "price":217.3893,
        //                          "sender":"3PR9WmaHV5ueVw2Wr9xsiCG3t4ySXzkkGLy",
        //                          "amount":0.35767793,
        //                          "timestamp":"2022-04-06T18:32:01.390Z",
        //                          "expiration":"2022-05-05T18:32:01.390Z",
        //                          "matcherFee":0.0139168,
        //                          "signature":"34HgWVLPgeYWkiSvAc5ChVepGTYDQDug2dMTSincs6idEyoM7AtaZuH3mqQ5RJG2fcxxH2QSB723Qq3dgLQwQmKf",
        //                          "matcherFeeAssetId":"7TMu26hAs7B2oW6c5sfx45KSZT7GQA3TZNYuCav8Dcqt"
        //                      }
        //                  }
        //              }, ...
        //          ]
        //      }
        //
        return this.parseTrades(data, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // { __type: "transaction",
        //   "data":
        //    { id: "HSdruioHqvYHeyn9hhyoHdRWPB2bFA8ujeCPZMK6992c",
        //      "timestamp": "2020-06-09T19:34:51.897Z",
        //      "height": 2099684,
        //      "type": 7,
        //      "version": 2,
        //      "proofs":
        //       [ "26teDHERQgwjjHqEn4REcDotNG8M21xjou3X42XuDuCvrRkQo6aPyrswByH3UrkWG8v27ZAaVNzoxDg4teNcLtde" ],
        //      "fee": 0.003,
        //      "sender": "3PEjHv3JGjcWNpYEEkif2w8NXV4kbhnoGgu",
        //      "senderPublicKey": "9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
        //      "buyMatcherFee": 0.00299999,
        //      "sellMatcherFee": 0.00299999,
        //      "price": 0.00012003,
        //      "amount": 60.80421562,
        //      "order1":
        //       { id: "CBRwP3ar4oMvvpUiGyfxc1syh41488SDi2GkrjuBDegv",
        //         "senderPublicKey": "DBXSHBz96NFsMu7xh4fi2eT9ZnyxefAHXsMxUayzgC6a",
        //         "matcherPublicKey": "9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
        //         "assetPair": [Object],
        //         "orderType": "buy",
        //         "price": 0.00012003,
        //         "sender": "3PJfFRgVuJ47UY4ckb74EGzEBzkHXtmG1LA",
        //         "amount": 60.80424773,
        //         "timestamp": "2020-06-09T19:34:51.885Z",
        //         "expiration": "2020-06-10T12:31:31.885Z",
        //         "matcherFee": 0.003,
        //         "signature": "4cA3ZAb3XAEEXaFG7caqpto5TRbpR5PkhZpxoNQZ9ZReNvjuJQs5a3THnumv7rcqmVUiVtuHAgk2f67ANcqtKyJ8",
        //         "matcherFeeAssetId": null },
        //      "order2":
        //       { id: "CHJSLQ6dfSPs6gu2mAegrMUcRiDEDqaj2GKfvptMjS3M",
        //         "senderPublicKey": "3RUC4NGFZm9H8VJhSSjJyFLdiE42qNiUagDcZPwjgDf8",
        //         "matcherPublicKey": "9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5",
        //         "assetPair": [Object],
        //         "orderType": "sell",
        //         "price": 0.00012003,
        //         "sender": "3P9vKoQpMZtaSkHKpNh977YY9ZPzTuntLAq",
        //         "amount": 60.80424773,
        //         "timestamp": "2020-06-09T19:34:51.887Z",
        //         "expiration": "2020-06-10T12:31:31.887Z",
        //         "matcherFee": 0.003,
        //         "signature": "3SFyrcqzou2ddZyNisnLYaGhLt5qRjKxH8Nw3s4T5U7CEKGX9DDo8dS27RgThPVGbYF1rYET1FwrWoQ2UFZ6SMTR",
        //         "matcherFeeAssetId": null } } }
        //
        const data = this.safeValue(trade, 'data');
        const datetime = this.safeString(data, 'timestamp');
        const timestamp = this.parse8601(datetime);
        const id = this.safeString(data, 'id');
        const priceString = this.safeString(data, 'price');
        const amountString = this.safeString(data, 'amount');
        const order1 = this.safeValue(data, 'order1');
        const order2 = this.safeValue(data, 'order2');
        let order = undefined;
        // order2 arrived after order1
        if (this.safeString(order1, 'senderPublicKey') === this.apiKey) {
            order = order1;
        }
        else {
            order = order2;
        }
        let symbol = undefined;
        const assetPair = this.safeValue(order, 'assetPair');
        if (assetPair !== undefined) {
            symbol = this.getSymbolFromAssetPair(assetPair);
        }
        else if (market !== undefined) {
            symbol = market['symbol'];
        }
        const side = this.safeString(order, 'orderType');
        const orderId = this.safeString(order, 'id');
        const fee = {
            'cost': this.safeString(order, 'matcherFee'),
            'currency': this.safeCurrencyCode(this.safeString(order, 'matcherFeeAssetId', 'WAVES')),
        };
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    parseDepositWithdrawFees(response, codes = undefined, currencyIdKey = undefined) {
        const depositWithdrawFees = {};
        codes = this.marketCodes(codes);
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const dictionary = entry;
            const currencyId = this.safeString(dictionary, currencyIdKey);
            const currency = this.safeValue(this.currencies_by_id, currencyId);
            const code = this.safeString(currency, 'code', currencyId);
            if ((codes === undefined) || (this.inArray(code, codes))) {
                let depositWithdrawFee = this.safeValue(depositWithdrawFees, code);
                if (depositWithdrawFee === undefined) {
                    depositWithdrawFee = {
                        'info': [dictionary],
                        'withdraw': {
                            'fee': undefined,
                            'percentage': undefined,
                        },
                        'deposit': {
                            'fee': undefined,
                            'percentage': undefined,
                        },
                        'networks': {},
                    };
                }
                else {
                    depositWithdrawFee = depositWithdrawFees[code];
                    depositWithdrawFee['info'] = this.arrayConcat(depositWithdrawFee['info'], [dictionary]);
                }
                const networkId = this.safeString(dictionary, 'platform_id');
                const currencyCode = this.safeString(currency, 'code');
                const networkCode = this.networkIdToCode(networkId, currencyCode);
                let network = this.safeValue(depositWithdrawFee['networks'], networkCode);
                if (network === undefined) {
                    network = {
                        'withdraw': {
                            'fee': undefined,
                            'percentage': undefined,
                        },
                        'deposit': {
                            'fee': undefined,
                            'percentage': undefined,
                        },
                    };
                }
                const feeType = this.safeString(dictionary, 'type');
                const fees = this.safeValue(dictionary, 'fees');
                let networkKey = 'deposit';
                if (feeType === 'withdrawal_currency') {
                    networkKey = 'withdraw';
                }
                network[networkKey] = { 'fee': this.safeNumber(fees, 'flat'), 'percentage': false };
                depositWithdrawFee['networks'][networkCode] = network;
                depositWithdrawFees[code] = depositWithdrawFee;
            }
        }
        const depositWithdrawFeesKeys = Object.keys(depositWithdrawFees);
        for (let i = 0; i < depositWithdrawFeesKeys.length; i++) {
            const code = depositWithdrawFeesKeys[i];
            const entry = depositWithdrawFees[code];
            const networks = this.safeValue(entry, 'networks');
            const networkKeys = Object.keys(networks);
            const networkKeysLength = networkKeys.length;
            if (networkKeysLength === 1) {
                const network = this.safeValue(networks, networkKeys[0]);
                depositWithdrawFees[code]['withdraw'] = this.safeValue(network, 'withdraw');
                depositWithdrawFees[code]['deposit'] = this.safeValue(network, 'deposit');
            }
        }
        return depositWithdrawFees;
    }
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://docs.wx.network/en/api/gateways/deposit/currencies
         * @see https://docs.wx.network/en/api/gateways/withdraw/currencies
         * @param {string[]|undefined} codes list of unified currency codes
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        let data = [];
        let promises = [];
        promises.push(this.privateGetDepositCurrencies(params));
        promises.push(this.privateGetWithdrawCurrencies(params));
        promises = await Promise.all(promises);
        //
        //    {
        //        "type": "list",
        //        "page_info": {
        //          "has_next_page": false,
        //          "last_cursor": null
        //        },
        //        "items": [
        //          {
        //            "type": "deposit_currency",
        //            "id": "WEST",
        //            "platform_id": "WEST",
        //            "waves_asset_id": "4LHHvYGNKJUg5hj65aGD5vgScvCBmLpdRFtjokvCjSL8",
        //            "platform_asset_id": "WEST",
        //            "decimals": 8,
        //            "status": "active",
        //            "allowed_amount": {
        //              "min": 0.1,
        //              "max": 2000000
        //            },
        //            "fees": {
        //              "flat": 0,
        //              "rate": 0
        //            }
        //          },
        //        ]
        //    }
        //
        //
        //    {
        //        "type": "list",
        //        "page_info": {
        //          "has_next_page": false,
        //          "last_cursor": null
        //        },
        //        "items": [
        //          {
        //            "type": "withdrawal_currency",
        //            "id": "BTC",
        //            "platform_id": "BTC",
        //            "waves_asset_id": "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS",
        //            "platform_asset_id": "BTC",
        //            "decimals": 8,
        //            "status": "inactive",
        //            "allowed_amount": {
        //              "min": 0.001,
        //              "max": 10
        //            },
        //            "fees": {
        //              "flat": 0.001,
        //              "rate": 0
        //            }
        //          },
        //        ]
        //    }
        //
        for (let i = 0; i < promises.length; i++) {
            const items = this.safeValue(promises[i], 'items');
            data = this.arrayConcat(data, items);
        }
        return this.parseDepositWithdrawFees(data, codes, 'id');
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        const errorCode = this.safeString(response, 'error');
        const success = this.safeBool(response, 'success', true);
        const Exception = this.safeValue(this.exceptions, errorCode);
        if (Exception !== undefined) {
            const messageInner = this.safeString(response, 'message');
            throw new Exception(this.id + ' ' + messageInner);
        }
        const message = this.safeString(response, 'message');
        if (message === 'Validation Error') {
            throw new errors.BadRequest(this.id + ' ' + body);
        }
        if (!success) {
            throw new errors.ExchangeError(this.id + ' ' + body);
        }
        return undefined;
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name wavesexchange#withdraw
         * @description make a withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        // currently only works for BTC and WAVES
        if (code !== 'WAVES') {
            const supportedCurrencies = await this.privateGetWithdrawCurrencies();
            const currencies = {};
            const items = this.safeValue(supportedCurrencies, 'items', []);
            for (let i = 0; i < items.length; i++) {
                const entry = items[i];
                const currencyCode = this.safeString(entry, 'id');
                currencies[currencyCode] = true;
            }
            if (!(code in currencies)) {
                const codes = Object.keys(currencies);
                throw new errors.ExchangeError(this.id + ' withdraw() ' + code + ' not supported. Currency code must be one of ' + codes.toString());
            }
        }
        await this.loadMarkets();
        const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
        const set = {};
        for (let i = 0; i < hexChars.length; i++) {
            const key = hexChars[i];
            set[key] = true;
        }
        let isErc20 = true;
        const noPrefix = this.remove0xPrefix(address);
        const lower = noPrefix.toLowerCase();
        const stringLength = lower.length * 1;
        for (let i = 0; i < stringLength; i++) {
            const character = lower[i];
            if (!(character in set)) {
                isErc20 = false;
                break;
            }
        }
        await this.signIn();
        let proxyAddress = undefined;
        if (code === 'WAVES' && !isErc20) {
            proxyAddress = address;
        }
        else {
            const withdrawAddressRequest = {
                'address': address,
                'currency': code,
            };
            const withdrawAddress = await this.privateGetWithdrawAddressesCurrencyAddress(withdrawAddressRequest);
            const currencyInner = this.safeValue(withdrawAddress, 'currency');
            const allowedAmount = this.safeValue(currencyInner, 'allowed_amount');
            const minimum = this.safeNumber(allowedAmount, 'min');
            if (amount <= minimum) {
                throw new errors.BadRequest(this.id + ' ' + code + ' withdraw failed, amount ' + amount.toString() + ' must be greater than the minimum allowed amount of ' + minimum.toString());
            }
            // {
            //   "type": "withdrawal_addresses",
            //   "currency": {
            //     "type": "withdrawal_currency",
            //     "id": "BTC",
            //     "waves_asset_id": "8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS",
            //     "decimals": 8,
            //     "status": "active",
            //     "allowed_amount": {
            //       "min": 0.001,
            //       "max": 20
            //     },
            //     "fees": {
            //       "flat": 0.001,
            //       "rate": 0
            //     }
            //   },
            //   "proxy_addresses": [
            //     "3P3qqmkiLwNHB7x1FeoE8bvkRtULwGpo9ga"
            //   ]
            // }
            const proxyAddresses = this.safeValue(withdrawAddress, 'proxy_addresses', []);
            proxyAddress = this.safeString(proxyAddresses, 0);
        }
        const fee = this.safeInteger(this.options, 'withdrawFeeWAVES', 100000); // 0.001 WAVES
        const feeAssetId = 'WAVES';
        const type = 4; // transfer
        const version = 2;
        const amountInteger = this.customCurrencyToPrecision(code, amount);
        const currency = this.currency(code);
        const timestamp = this.milliseconds();
        const byteArray = [
            this.numberToBE(4, 1),
            this.numberToBE(2, 1),
            this.base58ToBinary(this.apiKey),
            this.getAssetBytes(currency['id']),
            this.getAssetBytes(feeAssetId),
            this.numberToBE(timestamp, 8),
            this.numberToBE(amountInteger, 8),
            this.numberToBE(fee, 8),
            this.base58ToBinary(proxyAddress),
            this.numberToBE(0, 2),
        ];
        const binary = this.binaryConcatArray(byteArray);
        const hexSecret = this.binaryToBase16(this.base58ToBinary(this.secret));
        const signature = this.axolotl(this.binaryToBase16(binary), hexSecret, ed25519.ed25519);
        const request = {
            'senderPublicKey': this.apiKey,
            'amount': amountInteger,
            'fee': fee,
            'type': type,
            'version': version,
            'attachment': '',
            'feeAssetId': this.getAssetId(feeAssetId),
            'proofs': [
                signature,
            ],
            'assetId': this.getAssetId(currency['id']),
            'recipient': proxyAddress,
            'timestamp': timestamp,
            'signature': signature,
        };
        const result = await this.nodePostTransactionsBroadcast(request);
        //
        //     {
        //         "id": "string",
        //         "signature": "string",
        //         "fee": 0,
        //         "timestamp": 1460678400000,
        //         "recipient": "3P274YB5qseSE9DTTL3bpSjosZrYBPDpJ8k",
        //         "amount": 0
        //     }
        //
        return this.parseTransaction(result, currency);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "id": "string",
        //         "signature": "string",
        //         "fee": 0,
        //         "timestamp": 1460678400000,
        //         "recipient": "3P274YB5qseSE9DTTL3bpSjosZrYBPDpJ8k",
        //         "amount": 0
        //     }
        //
        currency = this.safeCurrency(undefined, currency);
        return {
            'id': undefined,
            'txid': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'network': undefined,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'amount': undefined,
            'type': undefined,
            'currency': currency['code'],
            'status': undefined,
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'internal': undefined,
            'fee': undefined,
            'info': transaction,
        };
    }
}

module.exports = wavesexchange;
