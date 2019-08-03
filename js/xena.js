'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, DDoSProtection, InvalidOrder, AuthenticationError } = require ('./base/errors');

module.exports = class liqui extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'xena',
            'name': 'Xena Exchange',
            'countries': [ 'UA' ],
            'rateLimit': 3000,
            'version': '3',
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': false,
                'fetchOrderBook': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTrades': false,
                'createOrder': false,
                'createMarketOrder': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg',
                'api': {
                    'public': 'https://trading.xena.exchange/api',
                    'private': 'https://api.xena.exchange',
                },
                'www': 'https://xena.exchange/',
                'doc': 'https://support.xena.exchange/support/solutions/articles/44000222066-introduction-to-xena-api',
                'fees': 'https://trading.xena.exchange/en/platform-specification/fee-schedule',
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
            'api': {
                'public': {
                    'get': [
                        'market-data/candles/{marketId}/{timeframe}',
                        'common/currencies',
                        'common/instruments',
                        'common/features',
                        'common/commissions',
                        'common/news',
                    ],
                },
                'private': {
                    'get': [
                        'trading/accounts',
                        'trading/accounts/{accountId}/balance',
                        'trading/accounts/{accountId}/trade-history',
                        'trading/accounts/{accountId}/trade-history?symbol=BTC/USDT&client_order_id=EMBB8Veke&trade_id=220143254',
                        'transfers/accounts',
                        'transfers/accounts/{accountId}',
                        'transfers/accounts/{accountId}/deposit-address/{currency}',
                        'transfers/accounts/{accountId}/deposits',
                        'transfers/accounts/{accountId}/trusted-addresses',
                        'transfers/accounts/{accountId}/withdrawals',
                        'transfers/accounts/{accountId}/balance-history?currency={currency}&from={time}&to={time}&kind={kind}&kind={kind}',
                        'transfers/accounts/{accountId}/balance-history?page={page}&limit={limit}',
                        'transfers/accounts/{accountId}/balance-history?txid=3e1db982c4eed2d6355e276c5bae01a52a27c9cef61574b0e8c67ee05fc26ccf',
                    ],
                    'post': [
                        'transfers/accounts/{accountId}/withdrawals',
                        'transfers/accounts/{accountId}/deposit-address/{currency}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0005,
                    'taker': 0.001,
                    'tierBased': true,
                    'percentage': true,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'options': {
                'defaultType': 'spot', // 'margin',
                'accountId': undefined, // '1012838157',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCommonInstruments (params);
        //
        //     [
        //         {
        //             "id":"100",
        //             "type":"Spot",
        //             "symbol":"BTC/USDT",
        //             "baseCurrency":"BTC",
        //             "quoteCurrency":"USDT",
        //             "settlCurrency":"USDT",
        //             "tickSize":1,
        //             "minOrderQuantity":"0.001",
        //             "orderQtyStep":"0.001",
        //             "limitOrderMaxDistance":"0",
        //             "priceInputMask":"00000.0",
        //             "enabled":true
        //         },
        //         {
        //             "id":"1000",
        //             "type":"Margin",
        //             "symbol":"XBTUSD",
        //             "baseCurrency":"BTC",
        //             "quoteCurrency":"USD",
        //             "settlCurrency":"BTC",
        //             "tickSize":1,
        //             "minOrderQuantity":"1",
        //             "orderQtyStep":"1",
        //             "limitOrderMaxDistance":"10",
        //             "priceInputMask":"00000.0",
        //             "indexes":[".BTC3_TWAP"],
        //             "enabled":true,
        //             "liquidationMaxDistance":"0.01",
        //             "contractValue":"1",
        //             "contractCurrency":"USD",
        //             "lotSize":"1",
        //             "tickValue":"0",
        //             "maxOrderQty":"500000",
        //             "maxPosVolume":"10000000",
        //             "mark":".BTC3_TWAP",
        //             "floatingPL":"BidAsk",
        //             "addUvmToFreeMargin":"ProfitAndLoss",
        //             "minLeverage":"0",
        //             "maxLeverage":"20",
        //             "margin":{
        //                 "netting":"PositionsAndOrders",
        //                 "rates":[
        //                     { "maxVolume":"500000", "initialRate":"0.05", "maintenanceRate":"0.0125"},
        //                     { "maxVolume":"1000000", "initialRate":"0.1", "maintenanceRate":"0.025"},
        //                     { "maxVolume":"1500000", "initialRate":"0.2", "maintenanceRate":"0.05"},
        //                     { "maxVolume":"2000000", "initialRate":"0.3", "maintenanceRate":"0.075"},
        //                     { "maxVolume":"3000000", "initialRate":"0.4", "maintenanceRate":"0.1"},
        //                     { "maxVolume":"4000000", "initialRate":"0.5", "maintenanceRate":"0.125"},
        //                     { "maxVolume":"5000000", "initialRate":"1", "maintenanceRate":"0.25"}
        //                 ],
        //                 "rateMultipliers":{
        //                     "LimitBuy":"1",
        //                     "LimitSell":"1",
        //                     "Long":"1",
        //                     "MarketBuy":"1",
        //                     "MarketSell":"1",
        //                     "Short":"1",
        //                     "StopBuy":"0",
        //                     "StopSell":"0"
        //                 }
        //             },
        //             "clearing":{ "enabled":true, "index":".BTC3_TWAP"},
        //             "premium":{ "enabled":true, "index":".XBTUSD_Premium_IR_Corrected"},
        //             "riskAdjustment":{ "enabled":true, "index":".RiskAdjustment_IR"},
        //             "pricePrecision":2,
        //             "priceRange":{
        //                 "enabled":true,
        //                 "distance":"0.2",
        //                 "movingBoundary":"0.2",
        //                 "movingTime":60000000000,
        //                 "lowIndex":".XBTUSD_LOWRANGE",
        //                 "highIndex":".XBTUSD_HIGHRANGE"
        //             },
        //             "priceLimits":{ "enabled":true, "distance":"0.2", "lowIndex":".XBTUSD_LOWLIMIT", "highIndex":".XBTUSD_HIGHLIMIT" },
        //             "inverse":true,
        //             "tradingStartDate":"0001-01-01 00:00:00",
        //             "expiryDate":"0001-01-01 00:00:00"
        //         },
        //         { "type":"Index", "symbol":".ETHUSD_Asks", "tickSize":3, "enabled":true, "basis":365},
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            let type = this.safeString (market, 'type');
            if (type !== undefined) {
                type = type.toLowerCase ();
            }
            const margin = (type === 'margin');
            const spot = (type === 'spot');
            if (spot || margin) {
                const id = this.safeString (market, 'symbol');
                const numericId = this.safeInteger (market, 'id');
                const baseId = this.safeString (market, 'baseCurrency');
                const quoteId = this.safeString (market, 'quoteCurrency');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                const symbol = (base && quote) ? (base + '/' + quote) : id;
                const maxCost = this.safeFloat (market, 'maxOrderQty');
                const minCost = this.safeFloat (market, 'minOrderQuantity');
                const pricePrecision = this.safeInteger2 (market, 'tickSize', 'pricePrecision');
                const tickValue = this.safeString (market, 'orderQtyStep');
                const amountPrecision = (tickValue === undefined) ? undefined : this.precisionFromString (tickValue);
                const precision = {
                    'price': pricePrecision,
                    'amount': amountPrecision,
                };
                const limits = {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': minCost,
                        'max': maxCost,
                    },
                };
                const active = this.safeValue (market, 'enabled');
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'numericId': numericId,
                    'active': active,
                    'type': type,
                    'spot': spot,
                    'margin': margin,
                    'precision': precision,
                    'limits': limits,
                    'info': market,
                });
            }
        }
        return result;
    }

    async fetchAccounts (params = {}) {
        const response = await this.privateGetTradingAccounts (params);
        //
        //     {
        //         "accounts": [
        //             { "id":8273231, "kind": "Spot" },
        //             { "id":10012833469, "kind": "Margin", "currency": "BTC" }
        //         ]
        //     }
        //
        const accounts = this.safeValue (response, 'accounts');
        const result = [];
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const accountId = this.safeString (account, 'id');
            const currencyId = this.safeString (account, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            let type = this.safeString (account, 'kind');
            if (type !== undefined) {
                type = type.toLowerCase ();
            }
            result.push ({
                'id': accountId,
                'type': type,
                'currency': code,
                'info': account,
            });
        }
        return result;
    }

    async findAccountByType (type) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountsByType = this.groupBy (this.accounts, 'type');
        const accounts = this.safeValue (accountsByType, type);
        if (accounts === undefined) {
            throw new ExchangeError (this.id + " findAccountByType() could not find an accountId with type " + type + ", specify the 'accountId' parameter instead"); // eslint-disable-line quotes
        }
        const numAccounts = accounts.length;
        if (numAccounts > 1) {
            throw new ExchangeError (this.id + " findAccountByType() found more than one accountId with type " + type + ", specify the 'accountId' parameter instead"); // eslint-disable-line quotes
        }
        return accounts[0];
    }

    async getAccountId (params) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const defaultAccountId = this.safeString (this.options, 'accountId');
        const accountId = this.safeString (params, 'accountId', defaultAccountId);
        if (accountId !== undefined) {
            return accountId;
        }
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + " fetchBalance() requires an 'accountId' parameter or a 'type' parameter ('spot' or 'margin')");
        }
        const account = await this.findAccountByType (type);
        return account['id'];
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const request = {
            'accountId': accountId,
        };
        const response = await this.privateGetTradingAccountsAccountIdBalance (this.extend (request, params));
        //
        //     {
        //         "balances": [
        //             {"available":"0","onHold":"0","settled":"0","equity":"0","currency":"BAB","lastUpdated":1564811790485125345},
        //             {"available":"0","onHold":"0","settled":"0","equity":"0","currency":"BSV","lastUpdated":1564811790485125345},
        //             {"available":"0","onHold":"0","settled":"0","equity":"0","currency":"BTC","lastUpdated":1564811790485125345},
        //         ]
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeValue (response, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'onHold');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseTrade (trade, market) {
        const id = this.safeString (trade, 'tid');
        let timestamp = this.safeFloat (trade, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp) * 1000;
        }
        const type = undefined;
        let side = this.safeString (trade, 'type');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        const orderId = this.safeString (trade, 'order_id');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let fee = undefined;
        if ('fee_amount' in trade) {
            const feeCost = -this.safeFloat (trade, 'fee_amount');
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': type,
            'order': orderId,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        const accountId = await this.getAccountId (params);
        const request = {
            'accountId': accountId,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetTradingAccountsAccountIdTradeHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "account":8263118,
        //             "clOrdId":"Kw9664m22",
        //             "orderId":"7aa7f445-89be-47ec-b649-e0671e238609",
        //             "symbol":"BTC/USDT",
        //             "ordType":"Limit",
        //             "price":"8000",
        //             "transactTime":1557916859727908000,
        //             "execId":"9aa20f1f-5c73-408d-909d-07f74f04edfd",
        //             "tradeId":"220143240",
        //             "side":"Sell",
        //             "orderQty":"1",
        //             "leavesQty":"0",
        //             "cumQty":"1",
        //             "lastQty":"1",
        //             "lastPx":"8000",
        //             "avgPx":"0",
        //             "calculatedCcyLastQty":"8000",
        //             "netMoney":"8000",
        //             "commission":"0",
        //             "commCurrency":"USDT",
        //             "positionEffect":"UnknownPositionEffect"
        //         },
        //         {
        //             "account":8263118,
        //             "clOrdId":"8yk33JO4b",
        //             "orderId":"fcd4d7c2-31c9-4e4b-96bc-bb241ddb392d",
        //             "symbol":"BTC/USDT",
        //             "ordType":"Limit",
        //             "price":"8000",
        //             "transactTime":1557912994901110000,
        //             "execId":"cef664d4-f438-4ad5-a7ad-279f725380d3",
        //             "tradeId":"220143239",
        //             "side":"Sell",
        //             "orderQty":"1",
        //             "leavesQty":"0",
        //             "cumQty":"1",
        //             "lastQty":"1",
        //             "lastPx":"8000",
        //             "avgPx":"0",
        //             "calculatedCcyLastQty":"8000",
        //             "netMoney":"8000",
        //             "commission":"0",
        //             "commCurrency":"USDT",
        //             "positionEffect":"UnknownPositionEffect"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        let timestamp = this.safeInteger (ohlcv, '60');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp / 1e6);
        }
        return [
            timestamp,
            this.safeFloat (ohlcv, '31'),
            this.safeFloat (ohlcv, '332'),
            this.safeFloat (ohlcv, '333'),
            this.safeFloat (ohlcv, '1025'),
            this.safeFloat (ohlcv, '330'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['from'] = since * 1e6;
        }
        const response = await this.publicGetMarketDataCandlesMarketIdTimeframe (this.extend (request, params));
        const candles = this.safeValue (response, '268', []);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'side': side,
            'amount': this.amountToPrecision (symbol, amount),
            'type': this.safeString (this.options['orderTypes'], type, type),
            'ocoorder': false,
            'buy_price_oco': 0,
            'sell_price_oco': 0,
        };
        if (type === 'market') {
            request['price'] = this.nonce ().toString ();
        } else {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrderNew (this.extend (request, params));
        return this.parseOrder (response);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const order = {
            'order_id': id,
        };
        if (price !== undefined) {
            order['price'] = this.priceToPrecision (symbol, price);
        }
        if (amount !== undefined) {
            order['amount'] = this.numberToString (amount);
        }
        if (symbol !== undefined) {
            order['symbol'] = this.marketId (symbol);
        }
        if (side !== undefined) {
            order['side'] = side;
        }
        if (type !== undefined) {
            order['type'] = this.safeString (this.options['orderTypes'], type, type);
        }
        const response = await this.privatePostOrderCancelReplace (this.extend (order, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        return await this.privatePostOrderCancelAll (params);
    }

    parseOrder (order, market = undefined) {
        const side = this.safeString (order, 'side');
        const open = this.safeValue (order, 'is_live');
        const canceled = this.safeValue (order, 'is_cancelled');
        let status = undefined;
        if (open) {
            status = 'open';
        } else if (canceled) {
            status = 'canceled';
        } else {
            status = 'closed';
        }
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (order, 'symbol');
            if (marketId !== undefined) {
                marketId = marketId.toUpperCase ();
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                }
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let orderType = order['type'];
        const exchange = orderType.indexOf ('exchange ') >= 0;
        if (exchange) {
            const parts = order['type'].split (' ');
            orderType = parts[1];
        }
        let timestamp = this.safeFloat (order, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp) * 1000;
        }
        const id = this.safeString (order, 'id');
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'average': this.safeFloat (order, 'avg_execution_price'),
            'amount': this.safeFloat (order, 'original_amount'),
            'remaining': this.safeFloat (order, 'remaining_amount'),
            'filled': this.safeFloat (order, 'executed_amount'),
            'status': status,
            'fee': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            if (!(symbol in this.markets)) {
                throw new ExchangeError (this.id + ' has no symbol ' + symbol);
            }
        }
        const response = await this.privatePostOrders (params);
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostOrdersHist (this.extend (request, params));
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        orders = this.filterByArray (orders, 'status', [ 'closed', 'canceled' ], false);
        return orders;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        return this.parseOrder (response);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const request = {
            'renew': 1,
        };
        const response = await this.fetchDepositAddress (code, this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'info': response['info'],
            'currency': code,
            'address': address,
            'tag': undefined,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const name = this.getCurrencyName (code);
        const request = {
            'method': name,
            'wallet_name': 'exchange',
            'renew': 0, // a value of 1 will generate a new address
        };
        const response = await this.privatePostDepositNew (this.extend (request, params));
        let address = this.safeValue (response, 'address');
        let tag = undefined;
        if ('address_pool' in response) {
            tag = address;
            address = response['address_pool'];
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a currency `code` argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const response = await this.privatePostHistoryMovements (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":581183,
        //             "txid": 123456,
        //             "currency":"BTC",
        //             "method":"BITCOIN",
        //             "type":"WITHDRAWAL",
        //             "amount":".01",
        //             "description":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ, offchain transfer ",
        //             "address":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ",
        //             "status":"COMPLETED",
        //             "timestamp":"1443833327.0",
        //             "timestamp_created": "1443833327.1",
        //             "fee": 0.1,
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // crypto
        //
        //     {
        //         "id": 12042490,
        //         "fee": "-0.02",
        //         "txid": "EA5B5A66000B66855865EFF2494D7C8D1921FCBE996482157EBD749F2C85E13D",
        //         "type": "DEPOSIT",
        //         "amount": "2099.849999",
        //         "method": "RIPPLE",
        //         "status": "COMPLETED",
        //         "address": "2505189261",
        //         "currency": "XRP",
        //         "timestamp": "1551730524.0",
        //         "description": "EA5B5A66000B66855865EFF2494D7C8D1921FCBE996482157EBD749F2C85E13D",
        //         "timestamp_created": "1551730523.0"
        //     }
        //
        // fiat
        //
        //     {
        //         "id": 12725095,
        //         "fee": "-60.0",
        //         "txid": null,
        //         "type": "WITHDRAWAL",
        //         "amount": "9943.0",
        //         "method": "WIRE",
        //         "status": "SENDING",
        //         "address": null,
        //         "currency": "EUR",
        //         "timestamp": "1561802484.0",
        //         "description": "Name: bob, AccountAddress: some address, Account: someaccountno, Bank: bank address, SWIFT: foo, Country: UK, Details of Payment: withdrawal name, Intermediary Bank Name: , Intermediary Bank Address: , Intermediary Bank City: , Intermediary Bank Country: , Intermediary Bank Account: , Intermediary Bank SWIFT: , Fee: -60.0",
        //         "timestamp_created": "1561716066.0"
        //     }
        //
        let timestamp = this.safeFloat (transaction, 'timestamp_created');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        let updated = this.safeFloat (transaction, 'timestamp');
        if (updated !== undefined) {
            updated = parseInt (updated * 1000);
        }
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        let type = this.safeString (transaction, 'type'); // DEPOSIT or WITHDRAWAL
        if (type !== undefined) {
            type = type.toLowerCase ();
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'address'), // todo: this is actually the tag for XRP transfers (the address is missing)
            'tag': undefined, // refix it properly for the tag from description
            'type': type,
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': {
                'currency': code,
                'cost': feeCost,
                'rate': undefined,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'SENDING': 'pending',
            'CANCELED': 'canceled',
            'ZEROCONFIRMED': 'failed', // ZEROCONFIRMED happens e.g. in a double spend attempt (I had one in my movements!)
            'COMPLETED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        const name = this.getCurrencyName (code);
        const request = {
            'withdraw_type': name,
            'walletselected': 'exchange',
            'amount': amount.toString (),
            'address': address,
        };
        if (tag !== undefined) {
            request['payment_id'] = tag;
        }
        const responses = await this.privatePostWithdraw (this.extend (request, params));
        const response = responses[0];
        const id = this.safeString (response, 'withdrawal_id');
        const message = this.safeString (response, 'message');
        const errorMessage = this.findBroadlyMatchedKey (this.exceptions['broad'], message);
        if (id === 0) {
            if (errorMessage !== undefined) {
                const ExceptionClass = this.exceptions['broad'][errorMessage];
                throw new ExceptionClass (this.id + ' ' + message);
            }
            throw new ExchangeError (this.id + ' withdraw returned an id of zero: ' + this.json (response));
        }
        return {
            'info': response,
            'id': id,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    ecdsa (message, secret) {
        const EC = require ('elliptic').ec;
        const ecdsa = new EC ('p256');
        const privateKey = secret.slice (14, 78);
        const signature = ecdsa.sign (message, privateKey, { 'canonical': true });
        const sig = signature.r.toString (16) + signature.s.toString (16);
        return sig;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            nonce *= 1e6;
            nonce = nonce.toString ();
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (method === 'POST') {
                query = this.extend ({
                    'nonce': nonce.toString (),
                    'request': query,
                }, query);
                body = this.json (query);
                query = this.encode (body);
            }
            const payload = 'AUTH' + nonce;
            const hash = this.hash (this.encode (payload), 'sha256');
            const signature = this.ecdsa (this.encode (hash), this.encode (this.secret));
            headers = {
                'X-AUTH-API-KEY': this.apiKey,
                'X-AUTH-API-PAYLOAD': payload,
                'X-AUTH-API-SIGNATURE': signature,
                'X-AUTH-API-NONCE': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        if (code >= 400) {
            if (body[0] === '{') {
                const feedback = this.id + ' ' + this.json (response);
                let message = undefined;
                if ('message' in response) {
                    message = response['message'];
                } else if ('error' in response) {
                    message = response['error'];
                } else {
                    throw new ExchangeError (feedback); // malformed (to our knowledge) response
                }
                const exact = this.exceptions['exact'];
                if (message in exact) {
                    throw new exact[message] (feedback);
                }
                const broad = this.exceptions['broad'];
                const broadKey = this.findBroadlyMatchedKey (broad, message);
                if (broadKey !== undefined) {
                    throw new broad[broadKey] (feedback);
                }
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
