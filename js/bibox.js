'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AccountSuspended, ArgumentsRequired, AuthenticationError, DDoSProtection, ExchangeNotAvailable, InvalidOrder, OrderNotFound, PermissionDenied, InsufficientFunds, BadSymbol, RateLimitExceeded, BadRequest } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bibox extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bibox',
            'name': 'Bibox',
            'countries': [ 'CN', 'US', 'KR' ],
            'version': 'v1',
            'hostname': 'bibox.com',
            'has': {
                'cancelOrder': true,
                'CORS': undefined,
                'createMarketOrder': undefined, // or they will return https://github.com/ccxt/ccxt/issues/2338
                'createOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': 'day',
                '1w': 'week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/77257418-3262b000-6c85-11ea-8fb8-20bdf20b3592.jpg',
                'api': 'https://api.{hostname}',
                'www': 'https://www.bibox365.com',
                'doc': [
                    'https://biboxcom.github.io/en/',
                ],
                'fees': 'https://bibox.zendesk.com/hc/en-us/articles/360002336133',
                'referral': 'https://w2.bibox365.com/login/register?invite_code=05Kj3I',
            },
            'api': {
                'public': {
                    'post': [
                        // TODO: rework for full endpoint/cmd paths here
                        'mdata',
                    ],
                    'get': [
                        'cquery',
                        'mdata',
                        'cdata',
                        'orderpending',
                    ],
                },
                'private': {
                    'post': [
                        'cquery',
                        'ctrade',
                        'user',
                        'orderpending',
                        'transfer',
                    ],
                },
                'v2private': {
                    'post': [
                        'assets/transfer/spot',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.0008'),
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'exceptions': {
                '2011': AccountSuspended, // Account is locked
                '2015': AuthenticationError, // Google authenticator is wrong
                '2021': InsufficientFunds, // Insufficient balance available for withdrawal
                '2027': InsufficientFunds, // Insufficient balance available (for trade)
                '2033': OrderNotFound, // operation failed! Orders have been completed or revoked
                '2065': InvalidOrder, // Precatory price is exorbitant, please reset
                '2066': InvalidOrder, // Precatory price is low, please reset
                '2067': InvalidOrder, // Does not support market orders
                '2068': InvalidOrder, // The number of orders can not be less than
                '2078': InvalidOrder, // unvalid order price
                '2085': InvalidOrder, // Order quantity is too small
                '2091': RateLimitExceeded, // request is too frequency, please try again later
                '2092': InvalidOrder, // Minimum amount not met
                '2131': InvalidOrder, // The order quantity cannot be greater than
                '3000': BadRequest, // Requested parameter incorrect
                '3002': BadRequest, // Parameter cannot be null
                '3012': AuthenticationError, // invalid apiKey
                '3016': BadSymbol, // Trading pair error
                '3024': PermissionDenied, // wrong apikey permissions
                '3025': AuthenticationError, // signature failed
                '4000': ExchangeNotAvailable, // current network is unstable
                '4003': DDoSProtection, // server busy please try again later
            },
            'commonCurrencies': {
                'APENFT(NFT)': 'NFT',
                'BOX': 'DefiBox',
                'BPT': 'BlockPool Token',
                'GTC': 'Game.com',
                'KEY': 'Bihu',
                'MTC': 'MTC Mesh Network', // conflict with MTC Docademic doc.com Token https://github.com/ccxt/ccxt/issues/6081 https://github.com/ccxt/ccxt/issues/3025
                'NFT': 'NFT Protocol',
                'PAI': 'PCHAIN',
                'REVO': 'Revo Network',
                'TERN': 'Ternio-ERC20',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const request = {
            'cmd': 'pairList',
        };
        const response = await this.publicGetMdata (this.extend (request, params));
        //
        //     {
        //         "result": [
        //             {
        //                 "id":1,
        //                 "pair":"BIX_BTC",
        //                 "pair_type":0,
        //                 "area_id":7,
        //                 "is_hide":0,
        //                 "decimal":8,
        //                 "amount_scale":4
        //             }
        //         ],
        //         "cmd":"pairList",
        //         "ver":"1.1"
        //     }
        //
        const markets = this.safeValue (response, 'result');
        const request2 = {
            'cmd': 'tradeLimit',
        };
        const response2 = await this.publicGetOrderpending (this.extend (request2, params));
        //
        //    {
        //         result: {
        //             min_trade_price: { default: '0.00000001', USDT: '0.0001', DAI: '0.0001' },
        //             min_trade_amount: { default: '0.0001' },
        //             min_trade_money: {
        //                 USDT: '1',
        //                 USDC: '1',
        //                 DAI: '1',
        //                 GUSD: '1',
        //                 BIX: '3',
        //                 BTC: '0.0002',
        //                 ETH: '0.005'
        //             }
        //         },
        //         cmd: 'tradeLimit'
        //     }
        //
        const result2 = this.safeValue (response2, 'result', {});
        const minCosts = this.safeValue (result2, 'min_trade_money', {});
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const numericId = this.safeInteger (market, 'id');
            const id = this.safeString (market, 'pair');
            let baseId = undefined;
            let quoteId = undefined;
            if (id !== undefined) {
                const parts = id.split ('_');
                baseId = this.safeString (parts, 0);
                quoteId = this.safeString (parts, 1);
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            let type = 'spot';
            let spot = true;
            const areaId = this.safeInteger (market, 'area_id');
            if (areaId === 16) {
                type = undefined;
                spot = false;
            }
            const precision = {
                'amount': this.safeNumber (market, 'amount_scale'),
                'price': this.safeNumber (market, 'decimal'),
            };
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': type,
                'spot': spot,
                'active': true,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (minCosts, quoteId),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        // we don't set values that are not defined by the exchange
        const timestamp = this.safeInteger (ticker, 'timestamp');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            const baseId = this.safeString (ticker, 'coin_symbol');
            const quoteId = this.safeString (ticker, 'currency_symbol');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        const last = this.safeNumber (ticker, 'last');
        const change = this.safeNumber (ticker, 'change');
        const baseVolume = this.safeNumber2 (ticker, 'vol', 'vol24H');
        let percentage = this.safeString (ticker, 'percent');
        if (percentage !== undefined) {
            percentage = percentage.replace ('%', '');
            percentage = this.parseNumber (percentage);
        }
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'sell'),
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
            'quoteVolume': this.safeNumber (ticker, 'amount'),
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'cmd': 'ticker',
            'pair': market['id'],
        };
        const response = await this.publicGetMdata (this.extend (request, params));
        return this.parseTicker (response['result'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const request = {
            'cmd': 'marketAll',
        };
        const response = await this.publicGetMdata (this.extend (request, params));
        const tickers = this.parseTickers (response['result'], symbols);
        const result = this.indexBy (tickers, 'symbol');
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger2 (trade, 'time', 'createdAt');
        let side = this.safeInteger2 (trade, 'side', 'order_side');
        side = (side === 1) ? 'buy' : 'sell';
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (trade, 'pair');
            if (marketId === undefined) {
                const baseId = this.safeString (trade, 'coin_symbol');
                const quoteId = this.safeString (trade, 'currency_symbol');
                if ((baseId !== undefined) && (quoteId !== undefined)) {
                    marketId = baseId + '_' + quoteId;
                }
            }
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let fee = undefined;
        const feeCostString = this.safeString (trade, 'fee');
        let feeCurrency = this.safeString (trade, 'fee_symbol');
        if (feeCurrency !== undefined) {
            if (feeCurrency in this.currencies_by_id) {
                feeCurrency = this.currencies_by_id[feeCurrency]['code'];
            } else {
                feeCurrency = this.safeCurrencyCode (feeCurrency);
            }
        }
        const feeRate = undefined; // todo: deduce from market if market is defined
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        if (feeCostString !== undefined) {
            fee = {
                'cost': Precise.stringNeg (feeCostString),
                'currency': feeCurrency,
                'rate': feeRate,
            };
        }
        const id = this.safeString (trade, 'id');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': undefined, // Bibox does not have it (documented) yet
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'takerOrMaker': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'cmd': 'deals',
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // default = 200
        }
        const response = await this.publicGetMdata (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'cmd': 'depth',
            'pair': market['id'],
        };
        if (limit !== undefined) {
            request['size'] = limit; // default = 200
        }
        const response = await this.publicGetMdata (this.extend (request, params));
        return this.parseOrderBook (response['result'], symbol, this.safeNumber (response['result'], 'update_time'), 'bids', 'asks', 'price', 'volume');
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "time":1591448220000,
        //         "open":"0.02507029",
        //         "high":"0.02507029",
        //         "low":"0.02506349",
        //         "close":"0.02506349",
        //         "vol":"5.92000000"
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'vol'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'cmd': 'kline',
            'pair': market['id'],
            'period': this.timeframes[timeframe],
            'size': limit,
        };
        const response = await this.publicGetMdata (this.extend (request, params));
        //
        //     {
        //         "result":[
        //             {"time":1591448220000,"open":"0.02507029","high":"0.02507029","low":"0.02506349","close":"0.02506349","vol":"5.92000000"},
        //             {"time":1591448280000,"open":"0.02506449","high":"0.02506975","low":"0.02506108","close":"0.02506843","vol":"5.72000000"},
        //             {"time":1591448340000,"open":"0.02506698","high":"0.02506698","low":"0.02506452","close":"0.02506519","vol":"4.86000000"},
        //         ],
        //         "cmd":"kline",
        //         "ver":"1.1"
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async fetchCurrencies (params = {}) {
        if (this.checkRequiredCredentials (false)) {
            return await this.fetchCurrenciesPrivate (params);
        } else {
            return await this.fetchCurrenciesPublic (params);
        }
    }

    async fetchCurrenciesPublic (params = {}) {
        const request = {
            'cmd': 'currencies',
        };
        const response = await this.publicGetCdata (this.extend (request, params));
        //
        // publicGetCdata
        //
        //     {
        //         "result":[
        //             {
        //                 "symbol":"BTC",
        //                 "name":"BTC",
        //                 "valid_decimals":8,
        //                 "original_decimals":8,
        //                 "is_erc20":0,
        //                 "enable_withdraw":1,
        //                 "enable_deposit":1,
        //                 "withdraw_min":0.005,
        //                 "describe_summary":"[{\"lang\":\"zh-cn\",\"text\":\"Bitcoin 比特币的概念最初由中本聪在2009年提出，是点对点的基于 SHA-256 算法的一种P2P形式的数字货币，点对点的传输意味着一个去中心化的支付系统。\"},{\"lang\":\"en-ww\",\"text\":\"Bitcoin is a digital asset and a payment system invented by Satoshi Nakamoto who published a related paper in 2008 and released it as open-source software in 2009. The system featured as peer-to-peer; users can transact directly without an intermediary.\"}]"
        //             }
        //         ],
        //         "cmd":"currencies"
        //     }
        //
        const currencies = this.safeValue (response, 'result');
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'symbol');
            const name = this.safeString (currency, 'name'); // contains hieroglyphs causing python ASCII bug
            const code = this.safeCurrencyCode (id);
            const precision = this.safeInteger (currency, 'valid_decimals');
            const deposit = this.safeValue (currency, 'enable_deposit');
            const withdraw = this.safeValue (currency, 'enable_withdraw');
            const active = (deposit && withdraw);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'withdraw_min'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchCurrenciesPrivate (params = {}) {
        if (!this.checkRequiredCredentials (false)) {
            throw new AuthenticationError (this.id + " fetchCurrencies is an authenticated endpoint, therefore it requires 'apiKey' and 'secret' credentials. If you don't need currency details, set exchange.has['fetchCurrencies'] = false before calling its methods.");
        }
        const request = {
            'cmd': 'transfer/coinList',
            'body': {},
        };
        const response = await this.privatePostTransfer (this.extend (request, params));
        //
        //     {
        //         "result":[
        //             {
        //                 "result":[
        //                     {
        //                         "totalBalance":"14.60987476",
        //                         "balance":"14.60987476",
        //                         "freeze":"0.00000000",
        //                         "id":60,
        //                         "symbol":"USDT",
        //                         "icon_url":"/appimg/USDT_icon.png",
        //                         "describe_url":"[{\"lang\":\"zh-cn\",\"link\":\"https://bibox.zendesk.com/hc/zh-cn/articles/115004798234\"},{\"lang\":\"en-ww\",\"link\":\"https://bibox.zendesk.com/hc/en-us/articles/115004798234\"}]",
        //                         "name":"USDT",
        //                         "enable_withdraw":1,
        //                         "enable_deposit":1,
        //                         "enable_transfer":1,
        //                         "confirm_count":2,
        //                         "is_erc20":1,
        //                         "forbid_info":null,
        //                         "describe_summary":"[{\"lang\":\"zh-cn\",\"text\":\"USDT 是 Tether 公司推出的基于稳定价值货币美元（USD）的代币 Tether USD（简称USDT），1USDT=1美元，用户可以随时使用 USDT 与 USD 进行1:1的兑换。\"},{\"lang\":\"en-ww\",\"text\":\"USDT is a cryptocurrency asset issued on the Bitcoin blockchain via the Omni Layer Protocol. Each USDT unit is backed by a U.S Dollar held in the reserves of the Tether Limited and can be redeemed through the Tether Platform.\"}]",
        //                         "total_amount":4776930644,
        //                         "supply_amount":4642367414,
        //                         "price":"--",
        //                         "contract_father":"OMNI",
        //                         "supply_time":"--",
        //                         "comment":null,
        //                         "chain_type":"OMNI",
        //                         "general_name":"USDT",
        //                         "contract":"31",
        //                         "original_decimals":8,
        //                         "deposit_type":0,
        //                         "hasCobo":0,
        //                         "BTCValue":"0.00027116",
        //                         "CNYValue":"90.36087919",
        //                         "USDValue":"14.61090236",
        //                         "children":[
        //                             {"type":"ERC20","symbol":"eUSDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":13},
        //                             {"type":"TRC20","symbol":"tUSDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":20},
        //                             {"type":"OMNI","symbol":"USDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":2},
        //                             {"type":"HECO","symbol":"hUSDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":12},
        //                             {"type":"BSC(BEP20)","symbol":"bUSDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":5},
        //                             {"type":"HPB","symbol":"pUSDT","enable_deposit":1,"enable_withdraw":1,"confirm_count":20}
        //                         ]
        //                     }
        //                 ],
        //                 "cmd":"transfer/coinList"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const currencies = this.safeValue (firstResult, 'result');
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'symbol');
            const name = currency['name']; // contains hieroglyphs causing python ASCII bug
            const code = this.safeCurrencyCode (id);
            const precision = 8;
            const deposit = this.safeValue (currency, 'enable_deposit');
            const withdraw = this.safeValue (currency, 'enable_withdraw');
            const active = (deposit && withdraw);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const type = this.safeString (params, 'type', 'assets');
        params = this.omit (params, 'type');
        const request = {
            'cmd': 'transfer/' + type, // assets, mainAssets
            'body': this.extend ({
                'select': 1, // return full info
            }, params),
        };
        const response = await this.privatePostTransfer (request);
        //
        //     {
        //         "result":[
        //             {
        //                 "result":{
        //                     "total_btc":"0.00000298",
        //                     "total_cny":"0.99",
        //                     "total_usd":"0.16",
        //                     "assets_list":[
        //                         {"coin_symbol":"BTC","BTCValue":"0.00000252","CNYValue":"0.84","USDValue":"0.14","balance":"0.00000252","freeze":"0.00000000"},
        //                         {"coin_symbol":"LTC","BTCValue":"0.00000023","CNYValue":"0.07","USDValue":"0.01","balance":"0.00006765","freeze":"0.00000000"},
        //                         {"coin_symbol":"USDT","BTCValue":"0.00000023","CNYValue":"0.08","USDValue":"0.01","balance":"0.01252100","freeze":"0.00000000"}
        //                     ]
        //                 },
        //                 "cmd":"transfer/assets"
        //             }
        //         ]
        //     }
        //
        const outerResult = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResult, 0, {});
        const innerResult = this.safeValue (firstResult, 'result');
        const result = { 'info': response };
        const assetsList = this.safeValue (innerResult, 'assets_list', []);
        for (let i = 0; i < assetsList.length; i++) {
            const balance = assetsList[i];
            const currencyId = this.safeString (balance, 'coin_symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'freeze');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'page': 1,
            'size': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['symbol'] = currency['id'];
        }
        const response = await this.privatePostTransfer ({
            'cmd': 'transfer/transferInList',
            'body': this.extend (request, params),
        });
        //
        //     {
        //         "result":[
        //             {
        //                 "result":{
        //                     "count":2,
        //                     "page":1,
        //                     "items":[
        //                         {
        //                             "coin_symbol":"ETH",                        // token
        //                             "to_address":"xxxxxxxxxxxxxxxxxxxxxxxxxx",  // address
        //                             "amount":"1.00000000",                      // amount
        //                             "confirmCount":"15",                        // the acknowledgment number
        //                             "createdAt":1540641511000,
        //                             "status":2                                 // status,  1-deposit is in process，2-deposit finished，3-deposit failed
        //                         },
        //                         {
        //                             "coin_symbol":"BIX",
        //                             "to_address":"xxxxxxxxxxxxxxxxxxxxxxxxxx",
        //                             "amount":"1.00000000",
        //                             "confirmCount":"15",
        //                             "createdAt":1540622460000,
        //                             "status":2
        //                         }
        //                     ]
        //                 },
        //                 "cmd":"transfer/transferInList"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const innerResult = this.safeValue (firstResult, 'result', {});
        const deposits = this.safeValue (innerResult, 'items', []);
        for (let i = 0; i < deposits.length; i++) {
            deposits[i]['type'] = 'deposit';
        }
        return this.parseTransactions (deposits, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'page': 1,
            'size': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['symbol'] = currency['id'];
        }
        const response = await this.privatePostTransfer ({
            'cmd': 'transfer/transferOutList',
            'body': this.extend (request, params),
        });
        //
        //     {
        //         "result":[
        //             {
        //                 "result":{
        //                     "count":1,
        //                     "page":1,
        //                     "items":[
        //                         {
        //                             "id":612867,
        //                             "coin_symbol":"ETH",
        //                             "chain_type":"ETH",
        //                             "to_address":"0xd41de7a88ab5fc59edc6669f54873576be95bff1",
        //                             "tx_id":"0xc60950596227af3f27c3a1b5911ea1c79bae53bdce67274e48a0ce87a5ef2df8",
        //                             "addr_remark":"binance",
        //                             "amount":"2.34550946",
        //                             "fee":"0.00600000",
        //                             "createdAt":1561339330000,
        //                             "memo":"",
        //                             "status":3
        //                         }
        //                     ]
        //                 },
        //                 "cmd":"transfer/transferOutList"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const innerResult = this.safeValue (firstResult, 'result', {});
        const withdrawals = this.safeValue (innerResult, 'items', []);
        for (let i = 0; i < withdrawals.length; i++) {
            withdrawals[i]['type'] = 'withdrawal';
        }
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         'id': 1023291,
        //         'coin_symbol': 'ETH',
        //         'to_address': '0x7263....',
        //         'amount': '0.49170000',
        //         'confirmCount': '16',
        //         'createdAt': 1553123867000,
        //         'status': 2
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         'id': 521844,
        //         'coin_symbol': 'ETH',
        //         'to_address': '0xfd4e....',
        //         'addr_remark': '',
        //         'amount': '0.39452750',
        //         'fee': '0.00600000',
        //         'createdAt': 1553226906000,
        //         'memo': '',
        //         'status': 3
        //     }
        //
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'to_address');
        const currencyId = this.safeString (transaction, 'coin_symbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeString (transaction, 'createdAt');
        let tag = this.safeString (transaction, 'addr_remark');
        const type = this.safeString (transaction, 'type');
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        const amount = this.safeNumber (transaction, 'amount');
        let feeCost = this.safeNumber (transaction, 'fee');
        if (type === 'deposit') {
            feeCost = 0;
            tag = undefined;
        }
        const fee = {
            'cost': feeCost,
            'currency': code,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatusByType (status, type = undefined) {
        const statuses = {
            'deposit': {
                '1': 'pending',
                '2': 'ok',
            },
            'withdrawal': {
                '0': 'pending',
                '3': 'ok',
            },
        };
        return this.safeString (this.safeValue (statuses, type, {}), status, status);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = (type === 'limit') ? 2 : 1;
        const orderSide = (side === 'buy') ? 1 : 2;
        const request = {
            'cmd': 'orderpending/trade',
            'body': this.extend ({
                'pair': market['id'],
                'account_type': 0,
                'order_type': orderType,
                'order_side': orderSide,
                'pay_bix': 0,
                'amount': amount,
                'price': price,
            }, params),
        };
        const response = await this.privatePostOrderpending (request);
        //
        //     {
        //         "result":[
        //             {
        //                 "result": "100055558128036", // order id
        //                 "index": 12345, // random index, specific one in a batch
        //                 "cmd":"orderpending/trade"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const id = this.safeValue (firstResult, 'result');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'cmd': 'orderpending/cancelTrade',
            'body': this.extend ({
                'orders_id': id,
            }, params),
        };
        const response = await this.privatePostOrderpending (request);
        //
        //     {
        //         "result":[
        //             {
        //                 "result":"OK", // only indicates if the server received the cancelling request, and the cancelling result can be obtained from the order record
        //                 "index": 12345, // random index, specific one in a batch
        //                 "cmd":"orderpending/cancelTrade"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        return firstResult;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'cmd': 'orderpending/order',
            'body': this.extend ({
                'id': id.toString (),
                'account_type': 0, // 0 = spot account
            }, params),
        };
        const response = await this.privatePostOrderpending (request);
        //
        //     {
        //         "result":[
        //             {
        //                 "result":{
        //                     "id":"100055558128036",
        //                     "createdAt": 1512756997000,
        //                     "account_type":0,
        //                     "coin_symbol":"LTC",        // Trading Token
        //                     "currency_symbol":"BTC",    // Pricing Token
        //                     "order_side":2,             // Trading side 1-Buy, 2-Sell
        //                     "order_type":2,             // 2-limit order
        //                     "price":"0.00900000",       // order price
        //                     "amount":"1.00000000",      // order amount
        //                     "money":"0.00900000",       // currency amount (price * amount)
        //                     "deal_amount":"0.00000000", // deal amount
        //                     "deal_percent":"0.00%",     // deal percentage
        //                     "unexecuted":"0.00000000",  // unexecuted amount
        //                     "status":3                  // Status, -1-fail, 0,1-to be dealt, 2-dealt partly, 3-dealt totally, 4- cancelled partly, 5-cancelled totally, 6-to be cancelled
        //                 },
        //                 "cmd":"orderpending/order"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const order = this.safeValue (firstResult, 'result');
        if (this.isEmpty (order)) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (order);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market === undefined) {
            let marketId = undefined;
            const baseId = this.safeString (order, 'coin_symbol');
            const quoteId = this.safeString (order, 'currency_symbol');
            if ((baseId !== undefined) && (quoteId !== undefined)) {
                marketId = baseId + '_' + quoteId;
            }
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const rawType = this.safeString (order, 'order_type');
        const type = (rawType === '1') ? 'market' : 'limit';
        const timestamp = this.safeInteger (order, 'createdAt');
        const price = this.safeString (order, 'price');
        const average = this.safeString (order, 'deal_price');
        const filled = this.safeString (order, 'deal_amount');
        const amount = this.safeString (order, 'amount');
        const cost = this.safeString2 (order, 'deal_money', 'money');
        const rawSide = this.safeString (order, 'order_side');
        const side = (rawSide === '1') ? 'buy' : 'sell';
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'id');
        const feeCost = this.safeNumber (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': undefined,
            };
        }
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            // original comments from bibox:
            '1': 'open', // pending
            '2': 'open', // part completed
            '3': 'closed', // completed
            '4': 'canceled', // part canceled
            '5': 'canceled', // canceled
            '6': 'canceled', // canceling
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let pair = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            pair = market['id'];
        }
        const size = limit ? limit : 200;
        const request = {
            'cmd': 'orderpending/orderPendingList',
            'body': this.extend ({
                'pair': pair,
                'account_type': 0, // 0 - regular, 1 - margin
                'page': 1,
                'size': size,
            }, params),
        };
        const response = await this.privatePostOrderpending (request);
        //
        //     {
        //         "result":[
        //             {
        //                 "result":{
        //                     "count":1,
        //                     "page":1,
        //                     "items":[
        //                         {
        //                             "id":"100055558128036",
        //                             "createdAt": 1512756997000,
        //                             "account_type":0,
        //                             "coin_symbol":"LTC",        // Trading Token
        //                             "currency_symbol":"BTC",    // Pricing Token
        //                             "order_side":2,             // Trading side 1-Buy, 2-Sell
        //                             "order_type":2,             // 2-limit order
        //                             "price":"0.00900000",       // order price
        //                             "amount":"1.00000000",      // order amount
        //                             "money":"0.00900000",       // currency amount (price * amount)
        //                             "deal_amount":"0.00000000", // deal amount
        //                             "deal_percent":"0.00%",     // deal percentage
        //                             "unexecuted":"0.00000000",  // unexecuted amount
        //                             "status":1                  // Status,-1-fail, 0,1-to be dealt, 2-dealt partly, 3-dealt totally, 4- cancelled partly, 5-cancelled totally, 6-to be cancelled
        //                         }
        //                     ]
        //                 },
        //                 "cmd":"orderpending/orderPendingList"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const innerResult = this.safeValue (firstResult, 'result', {});
        const orders = this.safeValue (innerResult, 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 200, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'cmd': 'orderpending/pendingHistoryList',
            'body': this.extend ({
                'pair': market['id'],
                'account_type': 0, // 0 - regular, 1 - margin
                'page': 1,
                'size': limit,
            }, params),
        };
        const response = await this.privatePostOrderpending (request);
        //
        //     {
        //         "result":[
        //             {
        //                 "result":{
        //                     "count":1,
        //                     "page":1,
        //                     "items":[
        //                         {
        //                             "id":"100055558128036",
        //                             "createdAt": 1512756997000,
        //                             "account_type":0,
        //                             "coin_symbol":"LTC",        // Trading Token
        //                             "currency_symbol":"BTC",    // Pricing Token
        //                             "order_side":2,             // Trading side 1-Buy, 2-Sell
        //                             "order_type":2,             // 2-limit order
        //                             "price":"0.00900000",       // order price
        //                             "amount":"1.00000000",      // order amount
        //                             "money":"0.00900000",       // currency amount (price * amount)
        //                             "deal_amount":"0.00000000", // deal amount
        //                             "deal_percent":"0.00%",     // deal percentage
        //                             "unexecuted":"0.00000000",  // unexecuted amount
        //                             "status":3                  // Status,-1-fail, 0,1-to be dealt, 2-dealt partly, 3-dealt totally, 4- cancelled partly, 5-cancelled totally, 6-to be cancelled
        //                         }
        //                     ]
        //                 },
        //                 "cmd":"orderpending/pendingHistoryList"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const innerResult = this.safeValue (firstResult, 'result', {});
        const orders = this.safeValue (innerResult, 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const size = limit ? limit : 200;
        const request = {
            'cmd': 'orderpending/orderHistoryList',
            'body': this.extend ({
                'pair': market['id'],
                'account_type': 0, // 0 - regular, 1 - margin
                'page': 1,
                'size': size,
                'coin_symbol': market['baseId'],
                'currency_symbol': market['quoteId'],
            }, params),
        };
        const response = await this.privatePostOrderpending (request);
        //
        //     {
        //         "result":[
        //             {
        //                 "result":{
        //                     "count":1,
        //                     "page":1,
        //                     "items":[
        //                         {
        //                             "id":"100055558128033",
        //                             "createdAt": 1512756997000,
        //                             "account_type":0,
        //                             "coin_symbol":"LTC",
        //                             "currency_symbol":"BTC",
        //                             "order_side":2,
        //                             "order_type":2,
        //                             "price":"0.00886500",
        //                             "amount":"1.00000000",
        //                             "money":"0.00886500",
        //                             "fee":0
        //                         }
        //                     ]
        //                 },
        //                 "cmd":"orderpending/orderHistoryList"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const innerResult = this.safeValue (firstResult, 'result', {});
        const trades = this.safeValue (innerResult, 'items', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'cmd': 'transfer/transferIn',
            'body': this.extend ({
                'coin_symbol': currency['id'],
            }, params),
        };
        const response = await this.privatePostTransfer (request);
        //
        //     {
        //         "result":[
        //             {
        //                 "result":"3Jx6RZ9TNMsAoy9NUzBwZf68QBppDruSKW",
        //                 "cmd":"transfer/transferIn"
        //             }
        //         ]
        //     }
        //
        //     {
        //         "result":[
        //             {
        //                 "result":"{\"account\":\"PERSONALLY OMITTED\",\"memo\":\"PERSONALLY OMITTED\"}",
        //                 "cmd":"transfer/transferIn"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const innerResult = this.safeValue (firstResult, 'result');
        let address = innerResult;
        let tag = undefined;
        if (this.isJsonEncodedObject (innerResult)) {
            const parsed = JSON.parse (innerResult);
            address = this.safeString (parsed, 'account');
            tag = this.safeString (parsed, 'memo');
        }
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (this.password === undefined) {
            if (!('trade_pwd' in params)) {
                throw new ExchangeError (this.id + ' withdraw() requires this.password set on the exchange instance or a trade_pwd parameter');
            }
        }
        if (!('totp_code' in params)) {
            throw new ExchangeError (this.id + ' withdraw() requires a totp_code parameter for 2FA authentication');
        }
        const request = {
            'trade_pwd': this.password,
            'coin_symbol': currency['id'],
            'amount': amount,
            'addr': address,
        };
        if (tag !== undefined) {
            request['address_remark'] = tag;
        }
        const response = await this.privatePostTransfer ({
            'cmd': 'transfer/transferOut',
            'body': this.extend (request, params),
        });
        //
        //     {
        //         "result":[
        //             {
        //                 "result": 228, // withdrawal id
        //                 "cmd":"transfer/transferOut"
        //             }
        //         ]
        //     }
        //
        const outerResults = this.safeValue (response, 'result');
        const firstResult = this.safeValue (outerResults, 0, {});
        const id = this.safeValue (firstResult, 'result');
        return {
            'info': response,
            'id': id,
        };
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        // by default it will try load withdrawal fees of all currencies (with separate requests)
        // however if you define codes = [ 'ETH', 'BTC' ] in args it will only load those
        await this.loadMarkets ();
        const withdrawFees = {};
        const info = {};
        if (codes === undefined) {
            codes = Object.keys (this.currencies);
        }
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const request = {
                'cmd': 'transfer/coinConfig',
                'body': this.extend ({
                    'coin_symbol': currency['id'],
                }, params),
            };
            const response = await this.privatePostTransfer (request);
            //     {
            //         "result":[
            //             {
            //                 "result":[
            //                     {
            //                         "coin_symbol":"ETH",
            //                         "is_active":1,
            //                         "original_decimals":18,
            //                         "enable_deposit":1,
            //                         "enable_withdraw":1,
            //                         "withdraw_fee":0.008,
            //                         "withdraw_min":0.05,
            //                         "deposit_avg_spent":173700,
            //                         "withdraw_avg_spent":322600
            //                     }
            //                 ],
            //                 "cmd":"transfer/coinConfig"
            //             }
            //         ]
            //     }
            //
            const outerResults = this.safeValue (response, 'result', []);
            const firstOuterResult = this.safeValue (outerResults, 0, {});
            const innerResults = this.safeValue (firstOuterResult, 'result', []);
            const firstInnerResult = this.safeValue (innerResults, 0, {});
            info[code] = firstInnerResult;
            withdrawFees[code] = this.safeNumber (firstInnerResult, 'withdraw_fee');
        }
        return {
            'info': info,
            'withdraw': withdrawFees,
            'deposit': {},
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api']) + '/' + this.version + '/' + path;
        const cmds = this.json ([ params ]);
        if (api === 'public') {
            if (method !== 'GET') {
                body = { 'cmds': cmds };
            } else if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else if (api === 'v2private') {
            this.checkRequiredCredentials ();
            url = this.implodeHostname (this.urls['api']) + '/v2/' + path;
            const json_params = this.json (params);
            body = {
                'body': json_params,
                'apikey': this.apiKey,
                'sign': this.hmac (this.encode (json_params), this.encode (this.secret), 'md5'),
            };
        } else {
            this.checkRequiredCredentials ();
            body = {
                'cmds': cmds,
                'apikey': this.apiKey,
                'sign': this.hmac (this.encode (cmds), this.encode (this.secret), 'md5'),
            };
        }
        if (body !== undefined) {
            body = this.json (body, { 'convertArraysToObjects': true });
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if ('error' in response) {
            if ('code' in response['error']) {
                const code = this.safeString (response['error'], 'code');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions, code, feedback);
                throw new ExchangeError (feedback);
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
        if (!('result' in response)) {
            throw new ExchangeError (this.id + ' ' + body);
        }
    }
};
