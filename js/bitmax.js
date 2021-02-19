'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, ExchangeError, InsufficientFunds, InvalidOrder, BadSymbol, PermissionDenied, BadRequest } = require ('./base/errors');
const { ROUND, TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitmax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmax',
            'name': 'BitMax',
            'countries': [ 'CN' ], // China
            'rateLimit': 500,
            // new metainfo interface
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchTrades': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
                'fetchDepositAddress': true,
                'fetchTransactions': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
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
                '1d': '1d',
                '1w': '1w',
                '1M': '1m',
            },
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/66820319-19710880-ef49-11e9-8fbe-16be62a11992.jpg',
                'api': 'https://bitmax.io',
                'test': 'https://bitmax-test.io',
                'www': 'https://bitmax.io',
                'doc': [
                    'https://bitmax-exchange.github.io/bitmax-pro-api/#bitmax-pro-api-documentation',
                ],
                'fees': 'https://bitmax.io/#/feeRate/tradeRate',
                'referral': 'https://bitmax.io/#/register?inviteCode=EL6BXBQM',
            },
            'api': {
                'public': {
                    'get': [
                        'assets',
                        'products',
                        'ticker',
                        'barhist/info',
                        'barhist',
                        'depth',
                        'trades',
                        'cash/assets', // not documented
                        'cash/products', // not documented
                        'margin/assets', // not documented
                        'margin/products', // not documented
                        'futures/collateral',
                        'futures/contracts',
                        'futures/ref-px',
                        'futures/market-data',
                        'futures/funding-rates',
                    ],
                },
                'accountCategory': {
                    'get': [
                        'balance',
                        'order/open',
                        'order/status',
                        'order/hist/current',
                        'risk',
                    ],
                    'post': [
                        'order',
                        'order/batch',
                    ],
                    'delete': [
                        'order',
                        'order/all',
                        'order/batch',
                    ],
                },
                'accountGroup': {
                    'get': [
                        'cash/balance',
                        'margin/balance',
                        'margin/risk',
                        'transfer',
                        'futures/collateral-balance',
                        'futures/position',
                        'futures/risk',
                        'futures/funding-payments',
                        'order/hist',
                    ],
                    'post': [
                        'futures/transfer/deposit',
                        'futures/transfer/withdraw',
                    ],
                },
                'private': {
                    'get': [
                        'info',
                        'wallet/transactions',
                        'wallet/deposit/address', // not documented
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'account-category': 'cash', // 'cash'/'margin'/'futures'
                'account-group': undefined,
                'fetchClosedOrders': {
                    'method': 'accountGroupGetOrderHist', // 'accountGroupGetAccountCategoryOrderHistCurrent'
                },
            },
            'exceptions': {
                'exact': {
                    // not documented
                    '1900': BadRequest, // {"code":1900,"message":"Invalid Http Request Input"}
                    '2100': AuthenticationError, // {"code":2100,"message":"ApiKeyFailure"}
                    '5002': BadSymbol, // {"code":5002,"message":"Invalid Symbol"}
                    '6001': BadSymbol, // {"code":6001,"message":"Trading is disabled on symbol."}
                    '6010': InsufficientFunds, // {'code': 6010, 'message': 'Not enough balance.'}
                    '60060': InvalidOrder, // { 'code': 60060, 'message': 'The order is already filled or canceled.' }
                    '600503': InvalidOrder, // {"code":600503,"message":"Notional is too small."}
                    // documented
                    '100001': BadRequest, // INVALID_HTTP_INPUT Http request is invalid
                    '100002': BadRequest, // DATA_NOT_AVAILABLE Some required data is missing
                    '100003': BadRequest, // KEY_CONFLICT The same key exists already
                    '100004': BadRequest, // INVALID_REQUEST_DATA The HTTP request contains invalid field or argument
                    '100005': BadRequest, // INVALID_WS_REQUEST_DATA Websocket request contains invalid field or argument
                    '100006': BadRequest, // INVALID_ARGUMENT The arugment is invalid
                    '100007': BadRequest, // ENCRYPTION_ERROR Something wrong with data encryption
                    '100008': BadSymbol, // SYMBOL_ERROR Symbol does not exist or not valid for the request
                    '100009': AuthenticationError, // AUTHORIZATION_NEEDED Authorization is require for the API access or request
                    '100010': BadRequest, // INVALID_OPERATION The action is invalid or not allowed for the account
                    '100011': BadRequest, // INVALID_TIMESTAMP Not a valid timestamp
                    '100012': BadRequest, // INVALID_STR_FORMAT String format does not
                    '100013': BadRequest, // INVALID_NUM_FORMAT Invalid number input
                    '100101': ExchangeError, // UNKNOWN_ERROR Some unknown error
                    '150001': BadRequest, // INVALID_JSON_FORMAT Require a valid json object
                    '200001': AuthenticationError, // AUTHENTICATION_FAILED Authorization failed
                    '200002': ExchangeError, // TOO_MANY_ATTEMPTS Tried and failed too many times
                    '200003': ExchangeError, // ACCOUNT_NOT_FOUND Account not exist
                    '200004': ExchangeError, // ACCOUNT_NOT_SETUP Account not setup properly
                    '200005': ExchangeError, // ACCOUNT_ALREADY_EXIST Account already exist
                    '200006': ExchangeError, // ACCOUNT_ERROR Some error related with error
                    '200007': ExchangeError, // CODE_NOT_FOUND
                    '200008': ExchangeError, // CODE_EXPIRED Code expired
                    '200009': ExchangeError, // CODE_MISMATCH Code does not match
                    '200010': AuthenticationError, // PASSWORD_ERROR Wrong assword
                    '200011': ExchangeError, // CODE_GEN_FAILED Do not generate required code promptly
                    '200012': ExchangeError, // FAKE_COKE_VERIFY
                    '200013': ExchangeError, // SECURITY_ALERT Provide security alert message
                    '200014': PermissionDenied, // RESTRICTED_ACCOUNT Account is restricted for certain activity, such as trading, or withdraw.
                    '200015': PermissionDenied, // PERMISSION_DENIED No enough permission for the operation
                    '300001': InvalidOrder, // INVALID_PRICE Order price is invalid
                    '300002': InvalidOrder, // INVALID_QTY Order size is invalid
                    '300003': InvalidOrder, // INVALID_SIDE Order side is invalid
                    '300004': InvalidOrder, // INVALID_NOTIONAL Notional is too small or too large
                    '300005': InvalidOrder, // INVALID_TYPE Order typs is invalid
                    '300006': InvalidOrder, // INVALID_ORDER_ID Order id is invalid
                    '300007': InvalidOrder, // INVALID_TIME_IN_FORCE Time In Force in order request is invalid
                    '300008': InvalidOrder, // INVALID_ORDER_PARAMETER Some order parameter is invalid
                    '300009': InvalidOrder, // TRADING_VIOLATION Trading violation on account or asset
                    '300011': InsufficientFunds, // INVALID_BALANCE No enough account or asset balance for the trading
                    '300012': BadSymbol, // INVALID_PRODUCT Not a valid product supported by exchange
                    '300013': InvalidOrder, // INVALID_BATCH_ORDER Some or all orders are invalid in batch order request
                    '300020': InvalidOrder, // TRADING_RESTRICTED There is some trading restriction on account or asset
                    '300021': InvalidOrder, // TRADING_DISABLED Trading is disabled on account or asset
                    '300031': InvalidOrder, // NO_MARKET_PRICE No market price for market type order trading
                    '310001': InsufficientFunds, // INVALID_MARGIN_BALANCE No enough margin balance
                    '310002': InvalidOrder, // INVALID_MARGIN_ACCOUNT Not a valid account for margin trading
                    '310003': InvalidOrder, // MARGIN_TOO_RISKY Leverage is too high
                    '310004': BadSymbol, // INVALID_MARGIN_ASSET This asset does not support margin trading
                    '310005': InvalidOrder, // INVALID_REFERENCE_PRICE There is no valid reference price
                    '510001': ExchangeError, // SERVER_ERROR Something wrong with server.
                    '900001': ExchangeError, // HUMAN_CHALLENGE Human change do not pass
                },
                'broad': {},
            },
            'commonCurrencies': {
                'BTCBEAR': 'BEAR',
                'BTCBULL': 'BULL',
            },
        });
    }

    getAccount (params = {}) {
        // get current or provided bitmax sub-account
        const account = this.safeValue (params, 'account', this.options['account']);
        return account.toLowerCase ().capitalize ();
    }

    async fetchCurrencies (params = {}) {
        const assets = await this.publicGetAssets (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "assetCode" : "LTCBULL",
        //                 "assetName" : "3X Long LTC Token",
        //                 "precisionScale" : 9,
        //                 "nativeScale" : 4,
        //                 "withdrawalFee" : "0.2",
        //                 "minWithdrawalAmt" : "1.0",
        //                 "status" : "Normal"
        //             },
        //         ]
        //     }
        //
        const margin = await this.publicGetMarginAssets (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "assetCode":"BTT",
        //                 "borrowAssetCode":"BTT-B",
        //                 "interestAssetCode":"BTT-I",
        //                 "nativeScale":0,
        //                 "numConfirmations":1,
        //                 "withdrawFee":"100.0",
        //                 "minWithdrawalAmt":"1000.0",
        //                 "statusCode":"Normal",
        //                 "statusMessage":"",
        //                 "interestRate":"0.001"
        //             }
        //         ]
        //     }
        //
        const cash = await this.publicGetCashAssets (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "assetCode":"LTCBULL",
        //                 "nativeScale":4,
        //                 "numConfirmations":20,
        //                 "withdrawFee":"0.2",
        //                 "minWithdrawalAmt":"1.0",
        //                 "statusCode":"Normal",
        //                 "statusMessage":""
        //             }
        //         ]
        //     }
        //
        const assetsData = this.safeValue (assets, 'data', []);
        const marginData = this.safeValue (margin, 'data', []);
        const cashData = this.safeValue (cash, 'data', []);
        const assetsById = this.indexBy (assetsData, 'assetCode');
        const marginById = this.indexBy (marginData, 'assetCode');
        const cashById = this.indexBy (cashData, 'assetCode');
        const dataById = this.deepExtend (assetsById, marginById, cashById);
        const ids = Object.keys (dataById);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const currency = dataById[id];
            const code = this.safeCurrencyCode (id);
            const precision = this.safeInteger2 (currency, 'precisionScale', 'nativeScale');
            // why would the exchange API have different names for the same field
            const fee = this.safeFloat2 (currency, 'withdrawFee', 'withdrawalFee');
            const status = this.safeString2 (currency, 'status', 'statusCode');
            const active = (status === 'Normal');
            const margin = ('borrowAssetCode' in currency);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'margin': margin,
                'name': this.safeString (currency, 'assetName'),
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdrawalAmt'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const products = await this.publicGetProducts (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"LBA/BTC",
        //                 "baseAsset":"LBA",
        //                 "quoteAsset":"BTC",
        //                 "status":"Normal",
        //                 "minNotional":"0.000625",
        //                 "maxNotional":"6.25",
        //                 "marginTradable":false,
        //                 "commissionType":"Quote",
        //                 "commissionReserveRate":"0.001",
        //                 "tickSize":"0.000000001",
        //                 "lotSize":"1"
        //             },
        //         ]
        //     }
        //
        const cash = await this.publicGetCashProducts (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"QTUM/BTC",
        //                 "domain":"BTC",
        //                 "tradingStartTime":1569506400000,
        //                 "collapseDecimals":"0.0001,0.000001,0.00000001",
        //                 "minQty":"0.000000001",
        //                 "maxQty":"1000000000",
        //                 "minNotional":"0.000625",
        //                 "maxNotional":"12.5",
        //                 "statusCode":"Normal",
        //                 "statusMessage":"",
        //                 "tickSize":"0.00000001",
        //                 "useTick":false,
        //                 "lotSize":"0.1",
        //                 "useLot":false,
        //                 "commissionType":"Quote",
        //                 "commissionReserveRate":"0.001",
        //                 "qtyScale":1,
        //                 "priceScale":8,
        //                 "notionalScale":4
        //             }
        //         ]
        //     }
        //
        const futures = await this.publicGetFuturesContracts (params);
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"BTC-PERP",
        //                 "tradingStartTime":1579701600000,
        //                 "collapseDecimals":"1,0.1,0.01",
        //                 "minQty":"0.000000001",
        //                 "maxQty":"1000000000",
        //                 "minNotional":"5",
        //                 "maxNotional":"1000000",
        //                 "statusCode":"Normal",
        //                 "statusMessage":"",
        //                 "tickSize":"0.25",
        //                 "lotSize":"0.0001",
        //                 "priceScale":2,
        //                 "qtyScale":4,
        //                 "notionalScale":2
        //             }
        //         ]
        //     }
        //
        const productsData = this.safeValue (products, 'data', []);
        const productsById = this.indexBy (productsData, 'symbol');
        const cashData = this.safeValue (cash, 'data', []);
        const futuresData = this.safeValue (futures, 'data', []);
        const cashAndFuturesData = this.arrayConcat (cashData, futuresData);
        const cashAndFuturesById = this.indexBy (cashAndFuturesData, 'symbol');
        const dataById = this.deepExtend (productsById, cashAndFuturesById);
        const ids = Object.keys (dataById);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = dataById[id];
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const precision = {
                'amount': this.safeFloat (market, 'lotSize'),
                'price': this.safeFloat (market, 'tickSize'),
            };
            const status = this.safeString (market, 'status');
            const active = (status === 'Normal');
            const type = ('useLot' in market) ? 'spot' : 'future';
            const spot = (type === 'spot');
            const future = (type === 'future');
            let symbol = id;
            if (!future) {
                symbol = base + '/' + quote;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'type': type,
                'spot': spot,
                'future': future,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minQty'),
                        'max': this.safeFloat (market, 'maxQty'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'tickSize'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'minNotional'),
                        'max': this.safeFloat (market, 'maxNotional'),
                    },
                },
            });
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        // TODO: fee calculation here is incorrect, we need to support tiered fee calculation.
        const market = this.markets[symbol];
        let key = 'quote';
        const rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async fetchAccounts (params = {}) {
        let accountGroup = this.safeString (this.options, 'account-group');
        let response = undefined;
        if (accountGroup === undefined) {
            response = await this.privateGetInfo (params);
            //
            //     {
            //         "code":0,
            //         "data":{
            //             "email":"igor.kroitor@gmail.com",
            //             "accountGroup":8,
            //             "viewPermission":true,
            //             "tradePermission":true,
            //             "transferPermission":true,
            //             "cashAccount":["cshrHKLZCjlZ2ejqkmvIHHtPmLYqdnda"],
            //             "marginAccount":["martXoh1v1N3EMQC5FDtSj5VHso8aI2Z"],
            //             "futuresAccount":["futc9r7UmFJAyBY2rE3beA2JFxav2XFF"],
            //             "userUID":"U6491137460"
            //         }
            //     }
            //
            const data = this.safeValue (response, 'data', {});
            accountGroup = this.safeString (data, 'accountGroup');
            this.options['account-group'] = accountGroup;
        }
        return [
            {
                'id': accountGroup,
                'type': undefined,
                'currency': undefined,
                'info': response,
            },
        ];
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountCategory = this.safeString (this.options, 'account-category', 'cash');
        const options = this.safeValue (this.options, 'fetchBalance', {});
        let accountCategory = this.safeString (options, 'account-category', defaultAccountCategory);
        accountCategory = this.safeString (params, 'account-category', accountCategory);
        params = this.omit (params, 'account-category');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeString (account, 'id');
        const request = {
            'account-group': accountGroup,
        };
        let method = 'accountCategoryGetBalance';
        if (accountCategory === 'futures') {
            method = 'accountGroupGetFuturesCollateralBalance';
        } else {
            request['account-category'] = accountCategory;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // cash
        //
        //     {
        //         'code': 0,
        //         'data': [
        //             {
        //                 'asset': 'BCHSV',
        //                 'totalBalance': '64.298000048',
        //                 'availableBalance': '64.298000048',
        //             },
        //         ]
        //     }
        //
        // margin
        //
        //     {
        //         'code': 0,
        //         'data': [
        //             {
        //                 'asset': 'BCHSV',
        //                 'totalBalance': '64.298000048',
        //                 'availableBalance': '64.298000048',
        //                 'borrowed': '0',
        //                 'interest': '0',
        //             },
        //         ]
        //     }
        //
        // futures
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {"asset":"BTC","totalBalance":"0","availableBalance":"0","maxTransferrable":"0","priceInUSDT":"9456.59"},
        //             {"asset":"ETH","totalBalance":"0","availableBalance":"0","maxTransferrable":"0","priceInUSDT":"235.95"},
        //             {"asset":"USDT","totalBalance":"0","availableBalance":"0","maxTransferrable":"0","priceInUSDT":"1"},
        //             {"asset":"USDC","totalBalance":"0","availableBalance":"0","maxTransferrable":"0","priceInUSDT":"1.00035"},
        //             {"asset":"PAX","totalBalance":"0","availableBalance":"0","maxTransferrable":"0","priceInUSDT":"1.00045"},
        //             {"asset":"USDTR","totalBalance":"0","availableBalance":"0","maxTransferrable":"0","priceInUSDT":"1"}
        //         ]
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'asset'));
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'availableBalance');
            account['total'] = this.safeFloat (balance, 'totalBalance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetDepth (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "m":"depth-snapshot",
        //             "symbol":"BTC-PERP",
        //             "data":{
        //                 "ts":1590223998202,
        //                 "seqnum":115444921,
        //                 "asks":[
        //                     ["9207.5","18.2383"],
        //                     ["9207.75","18.8235"],
        //                     ["9208","10.7873"],
        //                 ],
        //                 "bids":[
        //                     ["9207.25","0.4009"],
        //                     ["9207","0.003"],
        //                     ["9206.5","0.003"],
        //                 ]
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orderbook = this.safeValue (data, 'data', {});
        const timestamp = this.safeInteger (orderbook, 'ts');
        const result = this.parseOrderBook (orderbook, timestamp);
        result['nonce'] = this.safeInteger (orderbook, 'seqnum');
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "symbol":"QTUM/BTC",
        //         "open":"0.00016537",
        //         "close":"0.00019077",
        //         "high":"0.000192",
        //         "low":"0.00016537",
        //         "volume":"846.6",
        //         "ask":["0.00018698","26.2"],
        //         "bid":["0.00018408","503.7"],
        //         "type":"spot"
        //     }
        //
        const timestamp = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else if (marketId !== undefined) {
            const type = this.safeString (ticker, 'type');
            if (type === 'spot') {
                const [ baseId, quoteId ] = marketId.split ('/');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const close = this.safeFloat (ticker, 'close');
        const bid = this.safeValue (ticker, 'bid', []);
        const ask = this.safeValue (ticker, 'ask', []);
        const open = this.safeFloat (ticker, 'open');
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if ((open !== undefined) && (close !== undefined)) {
            change = close - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
            average = this.sum (open, close) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (bid, 0),
            'bidVolume': this.safeFloat (bid, 1),
            'ask': this.safeFloat (ask, 0),
            'askVolume': this.safeFloat (ask, 1),
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined, // previous day close
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "symbol":"BTC-PERP", // or "BTC/USDT"
        //             "open":"9073",
        //             "close":"9185.75",
        //             "high":"9185.75",
        //             "low":"9185.75",
        //             "volume":"576.8334",
        //             "ask":["9185.75","15.5863"],
        //             "bid":["9185.5","0.003"],
        //             "type":"derivatives", // or "spot"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            request['symbol'] = marketIds.join (',');
        }
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"QTUM/BTC",
        //                 "open":"0.00016537",
        //                 "close":"0.00019077",
        //                 "high":"0.000192",
        //                 "low":"0.00016537",
        //                 "volume":"846.6",
        //                 "ask":["0.00018698","26.2"],
        //                 "bid":["0.00018408","503.7"],
        //                 "type":"spot"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "m":"bar",
        //         "s":"BTC/USDT",
        //         "data":{
        //             "i":"1",
        //             "ts":1590228000000,
        //             "o":"9139.59",
        //             "c":"9131.94",
        //             "h":"9139.99",
        //             "l":"9121.71",
        //             "v":"25.20648"
        //         }
        //     }
        //
        const data = this.safeValue (ohlcv, 'data', {});
        return [
            this.safeInteger (data, 'ts'),
            this.safeFloat (data, 'o'),
            this.safeFloat (data, 'h'),
            this.safeFloat (data, 'l'),
            this.safeFloat (data, 'c'),
            this.safeFloat (data, 'v'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        // if since and limit are not specified
        // the exchange will return just 1 last candle by default
        const duration = this.parseTimeframe (timeframe);
        const options = this.safeValue (this.options, 'fetchOHLCV', {});
        const defaultLimit = this.safeInteger (options, 'limit', 500);
        if (since !== undefined) {
            request['from'] = since;
            if (limit === undefined) {
                limit = defaultLimit;
            } else {
                limit = Math.min (limit, defaultLimit);
            }
            request['to'] = this.sum (since, limit * duration * 1000, 1);
        } else if (limit !== undefined) {
            request['n'] = limit; // max 500
        }
        const response = await this.publicGetBarhist (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":[
        //             {
        //                 "m":"bar",
        //                 "s":"BTC/USDT",
        //                 "data":{
        //                     "i":"1",
        //                     "ts":1590228000000,
        //                     "o":"9139.59",
        //                     "c":"9131.94",
        //                     "h":"9139.99",
        //                     "l":"9121.71",
        //                     "v":"25.20648"
        //                 }
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "p":"9128.5", // price
        //         "q":"0.0030", // quantity
        //         "ts":1590229002385, // timestamp
        //         "bm":false, // if true, the buyer is the market maker, we only use this field to "define the side" of a public trade
        //         "seqnum":180143985289898554
        //     }
        //
        const timestamp = this.safeInteger (trade, 'ts');
        const price = this.safeFloat2 (trade, 'price', 'p');
        const amount = this.safeFloat (trade, 'q');
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        const buyerIsMaker = this.safeValue (trade, 'bm', false);
        const makerOrTaker = buyerIsMaker ? 'maker' : 'taker';
        const side = buyerIsMaker ? 'buy' : 'sell';
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': makerOrTaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['n'] = limit; // max 100
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "m":"trades",
        //             "symbol":"BTC-PERP",
        //             "data":[
        //                 {"p":"9128.5","q":"0.0030","ts":1590229002385,"bm":false,"seqnum":180143985289898554},
        //                 {"p":"9129","q":"0.0030","ts":1590229002642,"bm":false,"seqnum":180143985289898587},
        //                 {"p":"9129.5","q":"0.0030","ts":1590229021306,"bm":false,"seqnum":180143985289899043}
        //             ]
        //         }
        //     }
        //
        const records = this.safeValue (response, 'data', []);
        const trades = this.safeValue (records, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'PendingNew': 'open',
            'New': 'open',
            'PartiallyFilled': 'open',
            'Filled': 'closed',
            'Canceled': 'canceled',
            'Rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "id": "16e607e2b83a8bXHbAwwoqDo55c166fa",
        //         "orderId": "16e85b4d9b9a8bXHbAwwoqDoc3d66830",
        //         "orderType": "Market",
        //         "symbol": "BTC/USDT",
        //         "timestamp": 1573576916201
        //     }
        //
        // fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "symbol":       "BTC/USDT",
        //         "price":        "8131.22",
        //         "orderQty":     "0.00082",
        //         "orderType":    "Market",
        //         "avgPx":        "7392.02",
        //         "cumFee":       "0.005152238",
        //         "cumFilledQty": "0.00082",
        //         "errorCode":    "",
        //         "feeAsset":     "USDT",
        //         "lastExecTime": 1575953151764,
        //         "orderId":      "a16eee20b6750866943712zWEDdAjt3",
        //         "seqNum":       2623469,
        //         "side":         "Buy",
        //         "status":       "Filled",
        //         "stopPrice":    "",
        //         "execInst":     "NULL_VAL"
        //     }
        //
        //     {
        //         "ac": "FUTURES",
        //         "accountId": "testabcdefg",
        //         "avgPx": "0",
        //         "cumFee": "0",
        //         "cumQty": "0",
        //         "errorCode": "NULL_VAL",
        //         "execInst": "NULL_VAL",
        //         "feeAsset": "USDT",
        //         "lastExecTime": 1584072844085,
        //         "orderId": "r170d21956dd5450276356bbtcpKa74",
        //         "orderQty": "1.1499",
        //         "orderType": "Limit",
        //         "price": "4000",
        //         "sendingTime": 1584072841033,
        //         "seqNum": 24105338,
        //         "side": "Buy",
        //         "status": "Canceled",
        //         "stopPrice": "",
        //         "symbol": "BTC-PERP"
        //     },
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '/');
        let timestamp = this.safeInteger2 (order, 'timestamp', 'sendingTime');
        let lastTradeTimestamp = this.safeInteger (order, 'lastExecTime');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'orderQty');
        const average = this.safeFloat (order, 'avgPx');
        const filled = this.safeFloat2 (order, 'cumFilledQty', 'cumQty');
        let remaining = undefined;
        if (filled !== undefined) {
            if (filled === 0) {
                timestamp = lastTradeTimestamp;
                lastTradeTimestamp = undefined;
            }
            if (amount !== undefined) {
                remaining = Math.max (0, amount - filled);
            }
        }
        let cost = undefined;
        if ((average !== undefined) && (filled !== undefined)) {
            cost = average * filled;
        }
        const id = this.safeString (order, 'orderId');
        let clientOrderId = this.safeString (order, 'id');
        if (clientOrderId !== undefined) {
            if (clientOrderId.length < 1) {
                clientOrderId = undefined;
            }
        }
        const type = this.safeStringLower (order, 'orderType');
        const side = this.safeStringLower (order, 'side');
        const feeCost = this.safeFloat (order, 'cumFee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (order, 'feeAsset');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const stopPrice = this.safeFloat (order, 'stopPrice');
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const defaultAccountCategory = this.safeString (this.options, 'account-category', 'cash');
        const options = this.safeValue (this.options, 'createOrder', {});
        let accountCategory = this.safeString (options, 'account-category', defaultAccountCategory);
        accountCategory = this.safeString (params, 'account-category', accountCategory);
        params = this.omit (params, 'account-category');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'id');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
            'symbol': market['id'],
            'time': this.milliseconds (),
            'orderQty': this.amountToPrecision (symbol, amount),
            'orderType': type, // "limit", "market", "stop_market", "stop_limit"
            'side': side, // "buy" or "sell"
            // 'orderPrice': this.priceToPrecision (symbol, price),
            // 'stopPrice': this.priceToPrecision (symbol, stopPrice), // required for stop orders
            // 'postOnly': 'false', // 'false', 'true'
            // 'timeInForce': 'GTC', // GTC, IOC, FOK
            // 'respInst': 'ACK', // ACK, 'ACCEPT, DONE
        };
        if (clientOrderId !== undefined) {
            request['id'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'id' ]);
        }
        if ((type === 'limit') || (type === 'stop_limit')) {
            request['orderPrice'] = this.priceToPrecision (symbol, price);
        }
        if ((type === 'stop_limit') || (type === 'stop_market')) {
            const stopPrice = this.safeFloat (params, 'stopPrice');
            if (stopPrice === undefined) {
                throw new InvalidOrder (this.id + ' createOrder() requires a stopPrice parameter for ' + type + ' orders');
            } else {
                request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
                params = this.omit (params, 'stopPrice');
            }
        }
        const response = await this.accountCategoryPostOrder (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "ac": "MARGIN",
        //             "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //             "action": "place-order",
        //             "info": {
        //                 "id": "16e607e2b83a8bXHbAwwoqDo55c166fa",
        //                 "orderId": "16e85b4d9b9a8bXHbAwwoqDoc3d66830",
        //                 "orderType": "Market",
        //                 "symbol": "BTC/USDT",
        //                 "timestamp": 1573576916201
        //             },
        //             "status": "Ack"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const info = this.safeValue (data, 'info', {});
        return this.parseOrder (info, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountCategory = this.safeString (this.options, 'account-category', 'cash');
        const options = this.safeValue (this.options, 'fetchOrder', {});
        let accountCategory = this.safeString (options, 'account-category', defaultAccountCategory);
        accountCategory = this.safeString (params, 'account-category', accountCategory);
        params = this.omit (params, 'account-category');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
            'orderId': id,
        };
        const response = await this.accountCategoryGetOrderStatus (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "accountCategory": "CASH",
        //         "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //         "data": [
        //             {
        //                 "symbol":       "BTC/USDT",
        //                 "price":        "8131.22",
        //                 "orderQty":     "0.00082",
        //                 "orderType":    "Market",
        //                 "avgPx":        "7392.02",
        //                 "cumFee":       "0.005152238",
        //                 "cumFilledQty": "0.00082",
        //                 "errorCode":    "",
        //                 "feeAsset":     "USDT",
        //                 "lastExecTime": 1575953151764,
        //                 "orderId":      "a16eee20b6750866943712zWEDdAjt3",
        //                 "seqNum":       2623469,
        //                 "side":         "Buy",
        //                 "status":       "Filled",
        //                 "stopPrice":    "",
        //                 "execInst":     "NULL_VAL"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const defaultAccountCategory = this.safeString (this.options, 'account-category', 'cash');
        const options = this.safeValue (this.options, 'fetchOpenOrders', {});
        let accountCategory = this.safeString (options, 'account-category', defaultAccountCategory);
        accountCategory = this.safeString (params, 'account-category', accountCategory);
        params = this.omit (params, 'account-category');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
        };
        const response = await this.accountCategoryGetOrderOpen (this.extend (request, params));
        //
        //     {
        //         "ac": "CASH",
        //         "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //         "code": 0,
        //         "data": [
        //             {
        //                 "avgPx": "0",         // Average filled price of the order
        //                 "cumFee": "0",       // cumulative fee paid for this order
        //                 "cumFilledQty": "0", // cumulative filled quantity
        //                 "errorCode": "",     // error code; could be empty
        //                 "feeAsset": "USDT",  // fee asset
        //                 "lastExecTime": 1576019723550, //  The last execution time of the order
        //                 "orderId": "s16ef21882ea0866943712034f36d83", // server provided orderId
        //                 "orderQty": "0.0083",  // order quantity
        //                 "orderType": "Limit",  // order type
        //                 "price": "7105",       // order price
        //                 "seqNum": 8193258,     // sequence number
        //                 "side": "Buy",         // order side
        //                 "status": "New",       // order status on matching engine
        //                 "stopPrice": "",       // only available for stop market and stop limit orders; otherwise empty
        //                 "symbol": "BTC/USDT",
        //                 "execInst": "NULL_VAL" // execution instruction
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        if (accountCategory === 'futures') {
            return this.parseOrders (data, market, since, limit);
        }
        // a workaround for https://github.com/ccxt/ccxt/issues/7187
        const orders = [];
        for (let i = 0; i < data.length; i++) {
            const order = this.parseOrder (data[i], market);
            orders.push (order);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const defaultAccountCategory = this.safeString (this.options, 'account-category');
        const options = this.safeValue (this.options, 'fetchClosedOrders', {});
        let accountCategory = this.safeString (options, 'account-category', defaultAccountCategory);
        accountCategory = this.safeString (params, 'account-category', accountCategory);
        params = this.omit (params, 'account-category');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {
            'account-group': accountGroup,
            // 'category': accountCategory,
            // 'symbol': market['id'],
            // 'orderType': 'market', // optional, string
            // 'side': 'buy', // or 'sell', optional, case insensitive.
            // 'status': 'Filled', // "Filled", "Canceled", or "Rejected"
            // 'startTime': exchange.milliseconds (),
            // 'endTime': exchange.milliseconds (),
            // 'page': 1,
            // 'pageSize': 100,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const method = this.safeValue (options, 'method', 'accountGroupGetOrderHist');
        if (method === 'accountGroupGetOrderHist') {
            if (accountCategory !== undefined) {
                request['category'] = accountCategory;
            }
        } else {
            request['account-category'] = accountCategory;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // accountCategoryGetOrderHistCurrent
        //
        //     {
        //         "code":0,
        //         "accountId":"cshrHKLZCjlZ2ejqkmvIHHtPmLYqdnda",
        //         "ac":"CASH",
        //         "data":[
        //             {
        //                 "seqNum":15561826728,
        //                 "orderId":"a17294d305c0U6491137460bethu7kw9",
        //                 "symbol":"ETH/USDT",
        //                 "orderType":"Limit",
        //                 "lastExecTime":1591635618200,
        //                 "price":"200",
        //                 "orderQty":"0.1",
        //                 "side":"Buy",
        //                 "status":"Canceled",
        //                 "avgPx":"0",
        //                 "cumFilledQty":"0",
        //                 "stopPrice":"",
        //                 "errorCode":"",
        //                 "cumFee":"0",
        //                 "feeAsset":"USDT",
        //                 "execInst":"NULL_VAL"
        //             }
        //         ]
        //     }
        //
        // accountGroupGetOrderHist
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "data": [
        //                 {
        //                     "ac": "FUTURES",
        //                     "accountId": "testabcdefg",
        //                     "avgPx": "0",
        //                     "cumFee": "0",
        //                     "cumQty": "0",
        //                     "errorCode": "NULL_VAL",
        //                     "execInst": "NULL_VAL",
        //                     "feeAsset": "USDT",
        //                     "lastExecTime": 1584072844085,
        //                     "orderId": "r170d21956dd5450276356bbtcpKa74",
        //                     "orderQty": "1.1499",
        //                     "orderType": "Limit",
        //                     "price": "4000",
        //                     "sendingTime": 1584072841033,
        //                     "seqNum": 24105338,
        //                     "side": "Buy",
        //                     "status": "Canceled",
        //                     "stopPrice": "",
        //                     "symbol": "BTC-PERP"
        //                 },
        //             ],
        //             "hasNext": False,
        //             "limit": 500,
        //             "page": 1,
        //             "pageSize": 20
        //         }
        //     }
        //
        let data = this.safeValue (response, 'data');
        const isArray = Array.isArray (data);
        if (!isArray) {
            data = this.safeValue (data, 'data', []);
        }
        return this.parseOrders (data, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadAccounts ();
        const market = this.market (symbol);
        const defaultAccountCategory = this.safeString (this.options, 'account-category', 'cash');
        const options = this.safeValue (this.options, 'cancelOrder', {});
        let accountCategory = this.safeString (options, 'account-category', defaultAccountCategory);
        accountCategory = this.safeString (params, 'account-category', accountCategory);
        params = this.omit (params, 'account-category');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'id');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
            'symbol': market['id'],
            'time': this.milliseconds (),
            'id': 'foobar',
        };
        if (clientOrderId === undefined) {
            request['orderId'] = id;
        } else {
            request['id'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'id' ]);
        }
        const response = await this.accountCategoryDeleteOrder (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //             "ac": "CASH",
        //             "action": "cancel-order",
        //             "status": "Ack",
        //             "info": {
        //                 "id":        "wv8QGquoeamhssvQBeHOHGQCGlcBjj23",
        //                 "orderId":   "16e6198afb4s8bXHbAwwoqDo2ebc19dc",
        //                 "orderType": "", // could be empty
        //                 "symbol":    "ETH/USDT",
        //                 "timestamp":  1573594877822
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const info = this.safeValue (data, 'info', {});
        return this.parseOrder (info, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountCategory = this.safeString (this.options, 'account-category', 'cash');
        const options = this.safeValue (this.options, 'cancelAllOrders', {});
        let accountCategory = this.safeString (options, 'account-category', defaultAccountCategory);
        accountCategory = this.safeString (params, 'account-category', accountCategory);
        params = this.omit (params, 'account-category');
        const account = this.safeValue (this.accounts, 0, {});
        const accountGroup = this.safeValue (account, 'id');
        const request = {
            'account-group': accountGroup,
            'account-category': accountCategory,
            'time': this.milliseconds (),
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.accountCategoryDeleteOrderAll (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "ac": "CASH",
        //             "accountId": "cshQtyfq8XLAA9kcf19h8bXHbAwwoqDo",
        //             "action": "cancel-all",
        //             "info": {
        //                 "id":  "2bmYvi7lyTrneMzpcJcf2D7Pe9V1P9wy",
        //                 "orderId": "",
        //                 "orderType": "NULL_VAL",
        //                 "symbol": "",
        //                 "timestamp": 1574118495462
        //             },
        //             "status": "Ack"
        //         }
        //     }
        //
        return response;
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         address: "0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722",
        //         destTag: "",
        //         tagType: "",
        //         tagId: "",
        //         chainName: "ERC20",
        //         numConfirmations: 20,
        //         withdrawalFee: 1,
        //         nativeScale: 4,
        //         tips: []
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        const tagId = this.safeString (depositAddress, 'tagId');
        const tag = this.safeString (depositAddress, tagId);
        this.checkAddress (address);
        const code = (currency === undefined) ? undefined : currency['code'];
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const chainName = this.safeString (params, 'chainName');
        params = this.omit (params, 'chainName');
        const request = {
            'asset': currency['id'],
        };
        const response = await this.privateGetWalletDepositAddress (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":{
        //             "asset":"USDT",
        //             "assetName":"Tether",
        //             "address":[
        //                 {
        //                     "address":"1N22odLHXnLPCjC8kwBJPTayarr9RtPod6",
        //                     "destTag":"",
        //                     "tagType":"",
        //                     "tagId":"",
        //                     "chainName":"Omni",
        //                     "numConfirmations":3,
        //                     "withdrawalFee":4.7,
        //                     "nativeScale":4,
        //                     "tips":[]
        //                 },
        //                 {
        //                     "address":"0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722",
        //                     "destTag":"",
        //                     "tagType":"",
        //                     "tagId":"",
        //                     "chainName":"ERC20",
        //                     "numConfirmations":20,
        //                     "withdrawalFee":1.0,
        //                     "nativeScale":4,
        //                     "tips":[]
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const addresses = this.safeValue (data, 'address', []);
        const numAddresses = addresses.length;
        let address = undefined;
        if (numAddresses > 1) {
            const addressesByChainName = this.indexBy (addresses, 'chainName');
            if (chainName === undefined) {
                const chainNames = Object.keys (addressesByChainName);
                const chains = chainNames.join (', ');
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress returned more than one address, a chainName parameter is required, one of ' + chains);
            }
            address = this.safeValue (addressesByChainName, chainName, {});
        } else {
            // first address
            address = this.safeValue (addresses, 0, {});
        }
        const result = this.parseDepositAddress (address, currency);
        return this.extend (result, {
            'info': response,
        });
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'txType': 'deposit',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'txType': 'withdrawal',
        };
        return await this.fetchTransactions (code, since, limit, this.extend (request, params));
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'asset': currency['id'],
            // 'page': 1,
            // 'pageSize': 20,
            // 'startTs': this.milliseconds (),
            // 'endTs': this.milliseconds (),
            // 'txType': undefned, // deposit, withdrawal
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTs'] = since;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.privateGetWalletTransactions (this.extend (request, params));
        //
        //     {
        //         code: 0,
        //         data: {
        //             data: [
        //                 {
        //                     requestId: "wuzd1Ojsqtz4bCA3UXwtUnnJDmU8PiyB",
        //                     time: 1591606166000,
        //                     asset: "USDT",
        //                     transactionType: "deposit",
        //                     amount: "25",
        //                     commission: "0",
        //                     networkTransactionId: "0xbc4eabdce92f14dbcc01d799a5f8ca1f02f4a3a804b6350ea202be4d3c738fce",
        //                     status: "pending",
        //                     numConfirmed: 8,
        //                     numConfirmations: 20,
        //                     destAddress: { address: "0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722" }
        //                 }
        //             ],
        //             page: 1,
        //             pageSize: 20,
        //             hasNext: false
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const transactions = this.safeValue (data, 'data', []);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'reviewing': 'pending',
            'pending': 'pending',
            'confirmed': 'ok',
            'rejected': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         requestId: "wuzd1Ojsqtz4bCA3UXwtUnnJDmU8PiyB",
        //         time: 1591606166000,
        //         asset: "USDT",
        //         transactionType: "deposit",
        //         amount: "25",
        //         commission: "0",
        //         networkTransactionId: "0xbc4eabdce92f14dbcc01d799a5f8ca1f02f4a3a804b6350ea202be4d3c738fce",
        //         status: "pending",
        //         numConfirmed: 8,
        //         numConfirmations: 20,
        //         destAddress: {
        //             address: "0xe7c70b4e73b6b450ee46c3b5c0f5fb127ca55722",
        //             destTag: "..." // for currencies that have it
        //         }
        //     }
        //
        const id = this.safeString (transaction, 'requestId');
        const amount = this.safeFloat (transaction, 'amount');
        const destAddress = this.safeValue (transaction, 'destAddress', {});
        const address = this.safeString (destAddress, 'address');
        const tag = this.safeString (destAddress, 'destTag');
        const txid = this.safeString (transaction, 'networkTransactionId');
        const type = this.safeString (transaction, 'transactionType');
        const timestamp = this.safeInteger (transaction, 'time');
        const currencyId = this.safeString (transaction, 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeFloat (transaction, 'commission');
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '';
        let query = params;
        const accountCategory = (api === 'accountCategory');
        if (accountCategory || (api === 'accountGroup')) {
            url += this.implodeParams ('/{account-group}', params);
            query = this.omit (params, 'account-group');
        }
        const request = this.implodeParams (path, query);
        url += '/api/pro/' + this.version;
        if (accountCategory) {
            url += this.implodeParams ('/{account-category}', query);
            query = this.omit (query, 'account-category');
        }
        url += '/' + request;
        query = this.omit (query, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            const payload = timestamp + '+' + request;
            const hmac = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
            headers = {
                'x-auth-key': this.apiKey,
                'x-auth-timestamp': timestamp,
                'x-auth-signature': hmac,
            };
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                headers['Content-Type'] = 'application/json';
                body = this.json (query);
            }
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {'code': 6010, 'message': 'Not enough balance.'}
        //     {'code': 60060, 'message': 'The order is already filled or canceled.'}
        //     {"code":2100,"message":"ApiKeyFailure"}
        //     {"code":300001,"message":"Price is too low from market price.","reason":"INVALID_PRICE","accountId":"cshrHKLZCjlZ2ejqkmvIHHtPmLYqdnda","ac":"CASH","action":"place-order","status":"Err","info":{"symbol":"BTC/USDT"}}
        //
        const code = this.safeString (response, 'code');
        const message = this.safeString (response, 'message');
        const error = (code !== undefined) && (code !== '0');
        if (error || (message !== undefined)) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
