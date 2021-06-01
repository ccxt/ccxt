'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

// ----------------------------------------------------------------------------

module.exports = class dydx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'dydx',
            'name': 'dYdX',
            'countries': [ 'US'],
            'rateLimit': 100,
            'version': 'v3',
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelOrder': true,
                'createDepositAddress': false,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': false,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1h': 1,
                '1d': 2,
            },
            'urls': {
                'logo': 'https://camo.githubusercontent.com/8e8a96263dd0fa6946bd010ccf0e3379d35a3e577068d683e09002804a39c323/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f647964782d6173736574732f6c6f676f5f6c617267655f77686974652e706e67',
                'test': {
                    'public': 'https://api.dydx.exchange',
                    'private': 'https://api.dydx.exchange',
                },
                'api': {
                    'public': 'https://api.stage.dydx.exchange',
                    'private': 'https://api.stage.dydx.exchange',
                },
                'www': 'https://trade.dydx.exchange/',
                'doc': [
                    'https://docs.dydx.exchange/',
                ],
                'referral': 'https://trade.dydx.exchange/',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'orderbook',
                        'trades',
                        'fast-withdrawals',
                        'stats',
                        'historical-funding',
                        'candles',
                        'users/exists',
                        'usernames',
                        'time',
                        'config', // Get default maker and taker fees.
                    ],
                },
                'private': {
                    'get': [
                        'registration',
                        'api-keys',
                        'users',
                        'accounts',
                        'positions',
                        'transfers',
                        'orders',
                        'orders/client',
                        'fills',
                        'funding',
                        'historical-pnl',
                    ],
                    'post': [
                        'api-keys',
                        'accounts',
                        'withdrawals',
                        'fast-withdrawals',
                        'orders',
                    ],
                    'delete': [
                        'api-keys',
                        'orders',
                    ],
                    'put': [
                        'users',
                    ],
                },
            },
            'requiredCredentials': {
                'ethereumAddress': true,
                'privateKey': true, // Ethereum Key Authentication
                'apiKey': true, // API Key Authentication
                'secret': true, // API Key Authentication
                'passPhrase': true, // API Key Authentication
                'starkKeyYCoordinate': true, // STARK Key Authentication
                'starkKey': true, // STARK Key Authentication
            },
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        // https://docs.dydx.exchange/?json#cancel-an-order
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': parseInt (id),
        };
        const response = await this.privateDeleteOrders (this.extend (request, params));
        //
        //     {}
        //
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        // https://docs.dydx.exchange/?json#create-a-new-order
        await this.loadMarkets ();
        const market = this.market (symbol);
        const size = this.safeValue (amount);
        const postOnly = false;
        const limitFee = undefined;
        const expiration = undefined;
        const accountDetails = await this.privateGetAccounts (this.ethereumAddress);
        // {
        //   "account": {
        //     "starkKey": "180913017c740260fea4b2c62828a4008ca8b0d6e4",
        //     "positionId": "1812",
        //     "equity": "10000",
        //     "freeCollateral": "10000",
        //     "quoteBalance": "10000",
        //     "pendingDeposits": "0",
        //     "pendingWithdrawals": "0",
        //     "openPositions": {
        //       "BTC-USD": {
        //         "market": "BTC-USD",
        //         "status": "OPEN",
        //         "side": "LONG",
        //         "size": "1000",
        //         "maxSize": "1050",
        //         "entryPrice": "100",
        //         "exitPrice": null,
        //         "unrealizedPnl": "50",
        //         "realizedPnl": "100",
        //         "createdAt": "2021-01-04T23:44:59.690Z",
        //         "closedAt": null,
        //         "netFunding": "500"
        //       }
        //     },
        //     "accountNumber": "5",
        //     "id": "id"
        //   }
        // }
        const data = this.safeValue (accountDetails, 'account');
        const positionId = this.safeValue (data, 'positionId');
        const request = {
            'positionId': positionId,
            'market': market['id'],
            'side': side,
            'type': type,
            'postOnly': postOnly,
            'size': size,
            'price': price,
            'limitFee': limitFee,
            'expiration': expiration,
        };
        // {
        //   "order": {
        //     "id": "foo",
        //     "clientId": "foo",
        //     "accountId": "afoo",
        //     "market": "BTC-USD",
        //     "side": "SELL",
        //     "price": "18000",
        //     "triggerPrice": null,
        //     "trailingPercent": null,
        //     "size": "100",
        //     "remainingSize": "100",
        //     "type": "LIMIT",
        //     "createdAt": "2021-01-04T23:44:59.690Z",
        //     "unfillableAt": null,
        //     "expiresAt": "2022-12-21T21:30:20.200Z",
        //     "status": "PENDING",
        //     "timeInForce": "GTT",
        //     "postOnly": false,
        //     "cancelReason": null
        //   }
        // }
        const response = await this.privatePostOrders (request);
        return this.parseOrder (response, market);
    }

    parseOrderType (type) {
        const types = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'STOP_LIMIT': 'stop-limit',
            'TRAILING_STOP': 'trailing-stop',
            'TAKE_PROFIT': 'take-profit',
        };
        return this.safeString (types, type, type);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetAccounts (params);
        //
        // {
        //   "account": {
        //     "starkKey": "180913017c740260fea4b2c62828a4008ca8b0d6e4",
        //     "positionId": "1812",
        //     "equity": "10000",
        //     "freeCollateral": "10000",
        //     "quoteBalance": "10000",
        //     "pendingDeposits": "0",
        //     "pendingWithdrawals": "0",
        //     "openPositions": {
        //       "BTC-USD": {
        //         "market": "BTC-USD",
        //         "status": "OPEN",
        //         "side": "LONG",
        //         "size": "1000",
        //         "maxSize": "1050",
        //         "entryPrice": "100",
        //         "exitPrice": null,
        //         "unrealizedPnl": "50",
        //         "realizedPnl": "100",
        //         "createdAt": "2021-01-04T23:44:59.690Z",
        //         "closedAt": null,
        //         "netFunding": "500"
        //       }
        //     },
        //     "accountNumber": "5",
        //     "id": "id"
        //   }
        // }
        //
        const result = {
            'info': balances,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const data = this.safeValue (balances, 'account');
        const account = this.account ();
        account['free'] = this.safeString (data, 'freeCollateral');
        account['total'] = this.safeString (data, 'equity');
        result['code'] = account;
        return this.parseBalance (account, false);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'CANCELED',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'FILLED',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.PrivateGetUsers (this.extend (request, params));
        // {
        //   "user": {
        //     "ethereumAddress": "0x0913017c740260fea4b2c62828a4008ca8b0d6e4",
        //     "isjs/ed": true,
        //     "email": "email@dydx.exchange",
        //     "username": "supersam15o",
        //     "referredByAffiliateLink": null,
        //     "makerFeeRate": "0.01",
        //     "takerFeeRate": "0.01",
        //     "makerVolume30D": "1000.00",
        //     "takerVolume30D": "1000.00",
        //     "fees30D": "00.50",
        //     "userData": {}
        //   }
        // }
        const user = this.safeValue (response, 'user');
        return this.parseDepositAddress (this.safeString (user, 'ethereumAddress'), currency);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const timestamp = this.seconds ().toString ();
        const request = {
            'transferType': 'DEPOSIT',
            'createdBeforeOrAt': timestamp, // Latest that the transfers could have been created.
        };
        if (limit === undefined || limit > 100) {
            limit = 100;
        }
        if (limit !== undefined) {
            request['size'] = limit; // max 100
        }
        const response = await this.privateGetTransfers (this.extend (request, params));
        //
        // {
        //   "transfers": [{
        //     "id": "foo",
        //     "type": "DEPOSIT",
        //     "debitAsset": "USDC",
        //     "creditAsset": "USDT",
        //     "debitAmount": "3000",
        //     "creditAmount": "2800",
        //     "transactionHash": "hash",
        //     "status": "PENDING",
        //     "createdAt": "2021-01-04T23:44:59.690Z",
        //     "confirmedAt": null,
        //     "clientId": "foo",
        //     "fromAddress": "0x0913017c740260fea4b2c62828a4008ca8b0d6e4",
        //     "toAddress": null
        //   }]
        // }
        //
        return this.parseTransactions (response['transfers'], currency, since, limit);
    }

    async fetchMarkets (params = {}) {
        const configResponse = await this.publicGetConfig ();
        //
        // {
        //   "maxFastWithdrawalAmount":"200000",
        //   "defaultMakerFee":"0.0005",
        //   "defaultTakerFee":"0.002",
        //   "exchangeAddress":"0xD54f502e184B6B739d7D27a6410a67dc462D69c8",
        //   "collateralTokenAddress":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        //   "collateralAssetId":"0x02893294412a4c8f915f75892b395ebbf6859ec246ec365c3b1f56f47c3a0a5d"
        // }
        //
        const maker = this.safeValue (configResponse, 'defaultMakerFee');
        const taker = this.safeValue (configResponse, 'defaultTakerFee');
        const response = await this.publicGetMarkets (params);
        //
        // {
        //   "markets": {
        //     "LINK-USD": {
        //     "market": "LINK-USD",
        //     "status": "ONLINE",
        //     "baseAsset": "LINK",
        //     "quoteAsset": "USD",
        //     "stepSize": "0.1",
        //     "tickSize": "0.01",
        //     "indexPrice": "12",
        //     "oraclePrice": "101",
        //     "priceChange24H": "0",
        //     "nextFundingRate": "0.0000125000",
        //     "nextFundingAt": "2021-03-01T18:00:00.000Z",
        //     "minOrderSize": "1",
        //     "type": "PERPETUAL",
        //     "initialMarginFraction": "0.10",
        //     "maintenanceMarginFraction": "0.05",
        //     "baselinePositionSize": "1000",
        //     "incrementalPositionSize": "1000",
        //     "incrementalInitialMarginFraction": "0.2",
        //     "volume24H": "0",
        //     "trades24H": "0",
        //     "openInterest": "0",
        //     "maxPositionSize": "10000"
        //   },
        //   ...
        // }
        //
        const result = [];
        const res = Object.values (response['markets']);
        for (let i = 0; i < res.length; i++) {
            const value = res[i];
            const id = value['market'];
            const minOrderSize = value['minOrderSize'];
            const baseId = value['baseAsset'];
            const quoteId = value['quoteAsset'];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const active = (value['status'] === 'ONLINE');
            result.push ({
                'id': id,
                'symbol': id,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'percentage': true,
                'tierBased': false,
                'maker': maker,
                'taker': taker,
                'precision': {
                    'price': undefined,
                    'amount': undefined,
                    'cost': undefined,
                },
                'limits': {
                    'amount': {
                        'min': minOrderSize,
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
                'info': value,
            });
        }
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1h', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'limit': limit, // if set counts from now into the past
            'market': market['id'],
            'resolution': timeframe,
            'fromISO': since,
            'toISO': undefined,
            'limit': limit,
        };
        const response = await this.publicGetCandles (this.extend (request, params));
        //
        // "candles": [
        //   {
        //     "startedAt": "2021-01-05T00:00:00.000Z",
        //     "market": "BTC-USD",
        //     "resolution": "1DAY",
        //     "low": "40000",
        //     "high": "45000",
        //     "open": "45000",
        //     "close": "40000",
        //     "baseTokenVolume": "1.002",
        //     "trades": "3",
        //     "usdVolume": "45085",
        //     "startingOpenInterest": "28"
        //   },
        //   ...
        // ]
        //
        const data = this.safeValue (response, 'candles', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': parseInt (id),
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        // {
        //   "order": {
        //     "id": "foo",
        //     "clientId": "foo",
        //     "accountId": "afoo",
        //     "market": "BTC-USD",
        //     "side": "SELL",
        //     "price": "29000",
        //     "triggerPrice": null,
        //     "trailingPercent": null,
        //     "size": "0.500",
        //     "remainingSize": "0.500",
        //     "type": "LIMIT",
        //     "createdAt": "2021-01-04T23:44:59.690Z",
        //     "unfillableAt": null,
        //     "expiresAt": "2021-02-04T23:44:59.690Z",
        //     "status": "OPEN",
        //     "timeInForce": "GTT",
        //     "postOnly": false,
        //     "cancelReason": null
        //   }
        // }
        //
        return this.parseOrder (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        //
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //
        // {
        //   "bids": [
        //     {
        //       "price": "29000",
        //       "size": "1"
        //     },
        //     ...
        //   ],
        //   "asks": [
        //     {
        //       "price": "29500",
        //       "size": "0.499"
        //     },
        //     ...
        //   ]
        // }
        //
        const timestamp = this.safeInteger (response, 't'); // need unix type
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'limit': limit,
            'createdBeforeOrAt': since,
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        // {
        //   "order": {
        //     "id": "foo",
        //     "clientId": "foo",
        //     "accountId": "afoo",
        //     "market": "BTC-USD",
        //     "side": "SELL",
        //     "price": "29000",
        //     "triggerPrice": null,
        //     "trailingPercent": null,
        //     "size": "0.500",
        //     "remainingSize": "0.500",
        //     "type": "LIMIT",
        //     "createdAt": "2021-01-04T23:44:59.690Z",
        //     "unfillableAt": null,
        //     "expiresAt": "2021-02-04T23:44:59.690Z",
        //     "status": "OPEN",
        //     "timeInForce": "GTT",
        //     "postOnly": false,
        //     "cancelReason": null
        //   }
        // }
        //
        return this.parseOrder (response);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['startingBeforeOrAt'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        // {
        //   "trades": [
        //     {
        //       "side": "BUY",
        //       "size": "0.001",
        //       "price": "29000",
        //       "createdAt": "2021-01-05T16:33:43.163Z"
        //     },
        //     ...
        //   ]
        // }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    async fetchTradingFees (params = {}) {
        const configResponse = await this.publicGetConfig (); // Get maker and taker fees
        // {
        //   "maxFastWithdrawalAmount":"200000",
        //   "defaultMakerFee":"0.0005",
        //   "defaultTakerFee":"0.002",
        //   "exchangeAddress":"0xD54f502e184B6B739d7D27a6410a67dc462D69c8",
        //   "collateralTokenAddress":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        //   "collateralAssetId":"0x02893294412a4c8f915f75892b395ebbf6859ec246ec365c3b1f56f47c3a0a5d"
        // }
        const maker = this.safeValue (configResponse, 'defaultMakerFee');
        const taker = this.safeValue (configResponse, 'defaultTakerFee');
        return {
            'percentage': true,
            'tierBased': true,
            'maker': maker,
            'taker': taker,
        };
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['transferType'] = 'WITHDRAWAL';
        }
        if (since !== undefined) {
            request['createdBeforeOrAt'] = this.safeValue (since);
        }
        if (limit !== undefined) {
            request['createdBeforeOrAt'] = this.safeValue (since);
        }
        const response = await this.privateGetTransfers (this.extend (request, params));
        //
        // {
        //   "transfers": [{
        //     "id": "foo",
        //     "type": "DEPOSIT",
        //     "debitAsset": "USDC",
        //     "creditAsset": "USDT",
        //     "debitAmount": "3000",
        //     "creditAmount": "2800",
        //     "transactionHash": "hash",
        //     "status": "PENDING",
        //     "createdAt": "2021-01-04T23:44:59.690Z",
        //     "confirmedAt": null,
        //     "clientId": "foo",
        //     "fromAddress": "0x0913017c740260fea4b2c62828a4008ca8b0d6e4",
        //     "toAddress": null
        //   }]
        // }
        //
        const withdrawals = this.safeValue (response, 'transfers', []);
        return this.parseTransfers (withdrawals, currency, since, limit, { 'type': 'WITHDRAWAL' });
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const accountDetails = await this.privateGetAccounts (address);
        //
        // {
        //   "account": {
        //     "starkKey": "180913017c740260fea4b2c62828a4008ca8b0d6e4",
        //     "positionId": "1812",
        //     "equity": "10000",
        //     "freeCollateral": "10000",
        //     "quoteBalance": "10000",
        //     "pendingDeposits": "0",
        //     "pendingWithdrawals": "0",
        //     "openPositions": {
        //       "BTC-USD": {
        //         "market": "BTC-USD",
        //         "status": "OPEN",
        //         "side": "LONG",
        //         "size": "1000",
        //         "maxSize": "1050",
        //         "entryPrice": "100",
        //         "exitPrice": null,
        //         "unrealizedPnl": "50",
        //         "realizedPnl": "100",
        //         "createdAt": "2021-01-04T23:44:59.690Z",
        //         "closedAt": null,
        //         "netFunding": "500"
        //       }
        //     },
        //     "accountNumber": "5",
        //     "id": "id"
        //   }
        // }
        //
        const data = this.safeValue (accountDetails, 'account');
        const id = this.safeValue (data, 'id');
        const positionId = this.safeValue (data, 'positionId');
        const currency = this.currency (code);
        const expiration = undefined;
        const request = {
            'positionId': positionId,
            'asset': currency['id'],
            'amount': amount,
            'address': address,
            'expiration': expiration,
            'id': id,
        };
        const response = await this.privatePostWithdrawals (this.extend (request, params));
        //
        // {
        //   "withdrawal": {
        //     "id": "foo",
        //     "type": "WITHDRAWAL",
        //     "debitAsset": "USDC",
        //     "creditAsset": "USDC",
        //     "debitAmount": "3000",
        //     "creditAmount": "2800",
        //     "transactionHash": "hash",
        //     "status": "PENDING",
        //     "createdAt": "2021-01-04T23:44:59.690Z",
        //     "confirmedAt": null,
        //     "clientId": "foo",
        //     "fromAddress": "0x0913017c740260fea4b2c62828a4008ca8b0d6e4",
        //     "toAddress": null
        //   }
        // }
        //
        return {
            'info': response,
            'id': this.safeString (response, 'withdrawal', 'transactionHash'),
        };
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //
        // {
        //     "id": "foo",
        //     "type": "WITHDRAWAL",
        //     "debitAsset": "USDC",
        //     "creditAsset": "USDC",
        //     "debitAmount": "3000",
        //     "creditAmount": "2800",
        //     "transactionHash": "hash",
        //     "status": "PENDING",
        //     "createdAt": "2021-01-04T23:44:59.690Z",
        //     "confirmedAt": null,
        //     "clientId": "foo",
        //     "fromAddress": "0x0913017c740260fea4b2c62828a4008ca8b0d6e4",
        //     "toAddress": null
        // }
        //
        const id = this.safeString (transaction, 'id');
        const fromAddress = this.safeString (transaction, 'fromAddress');
        const address = this.safeString (transaction, 'toAddress');
        let code = this.safeString (transaction, 'creditAsset');
        if (code === undefined) {
            code = this.safeString (transaction, 'debitAsset');
        }
        const type = this.safeStringLower (transaction, 'type');
        const amount = this.safeNumber (transaction, 'debitAmount');
        const status = this.safeStringLower (transaction, 'status');
        const timestamp = this.safeTimestamp2 (transaction, 'timestamp', 'createdAt');
        const updated = this.safeTimestamp (transaction, 'confirmedAt');
        const txid = this.safeString (transaction, 'transactionHash');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': fromAddress,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': undefined,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'PENDING': 'open',
            'OPEN': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'UNTRIGGERED': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // {
        //   "order": {
        //     "id": "foo",
        //     "clientId": "foo",
        //     "accountId": "afoo",
        //     "market": "BTC-USD",
        //     "side": "SELL",
        //     "price": "18000",
        //     "triggerPrice": null,
        //     "trailingPercent": null,
        //     "size": "100",
        //     "remainingSize": "100",
        //     "type": "LIMIT",
        //     "createdAt": "2021-01-04T23:44:59.690Z",
        //     "unfillableAt": null,
        //     "expiresAt": "2022-12-21T21:30:20.200Z",
        //     "status": "PENDING",
        //     "timeInForce": "GTT",
        //     "postOnly": false,
        //     "cancelReason": null
        //   }
        // }
        //
        const id = this.safeString (order, 'id');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const symbol = this.safeString (order, 'market');
        const clientId = this.safeString (order, 'clientId');
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'initial_amount');
        const filled = this.safeNumber (order, 'processed_amount');
        const remaining = this.safeString (order, 'remainingSize');
        const cost = undefined;
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const timeInForce = this.safeString (order, 'timeInForce');
        const stopPrice = this.safeNumber (order, 'trigger_price');
        const result = {
            'info': order,
            'id': id,
            'clientOrderId': clientId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'trades': undefined,
        };
        return result;
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        const address = this.safeString (depositAddress, 'address');
        const currencyId = this.safeString (depositAddress, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        return {
            'info': depositAddress,
            'code': code,
            'address': address,
        };
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // {
        //   "startedAt": "2021-01-05T00:00:00.000Z",
        //   "market": "BTC-USD",
        //   "resolution": "1DAY",
        //   "low": "40000",
        //   "high": "45000",
        //   "open": "45000",
        //   "close": "40000",
        //   "baseTokenVolume": "1.002",
        //   "trades": "3",
        //   "usdVolume": "45085",
        //   "startingOpenInterest": "28"
        // },
        //
        const timestamp = this.safeInteger (ohlcv, 'startedAt');
        const open = this.safeNumber (ohlcv, 'open');
        const high = this.safeNumber (ohlcv, 'high');
        const low = this.safeNumber (ohlcv, 'low');
        const close = this.safeNumber (ohlcv, 'close');
        const volume = this.safeNumber (ohlcv, 'usdVolume');
        return [ timestamp, open, high, low, close, volume ];
    }

    sign (path, api = 'private', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.safeString (this.options, 'version', 'v3');
        let url = this.urls['api']['private'] + '/' + version + '/' + path;
        let payload = undefined;
        headers = {
            'Content-Type': 'application/json',
        };
        let query = undefined;
        if (method === 'GET') {
            query = this.urlencode (params);
            url = url + '?' + query;
        } else {
            body = this.json (params);
        }
        const timestamp = this.milliseconds ();
        if (api === 'private') {
            if (method === 'GET') {
                payload = query;
            } else {
                payload = body;
            }
            if (path === 'onboarding') {
                if (method === 'POST') {
                    // onboarding endpoint: POST /v3/onboarding
                    headers['DYDX-ETHEREUM-ADDRESS'] = this.ethereumAddress;
                    payload['action'] = 'DYDX-ONBOARDING';
                    payload['onlySignOn'] = 'https://trade.dydx.exchange';
                    const signature = this.hmac (this.encode (payload), this.encode (this.secret));
                    headers['DYDX-SIGNATURE'] = signature; // EIP-712-compliant Ethereum signature
                }
            } else if (method === 'DELETE') {
                if (path === 'api-keys') {
                    // Ethereum Key Private Endpoints: POST, DELETE /v3/api-keys
                    headers['DYDX-TIMESTAMP'] = timestamp;
                    headers['DYDX-ETHEREUM-ADDRESS'] = this.ethereumAddress;
                    payload['method'] = 'GET|POST';
                    payload['requestPath'] = '/v3/api-keys';
                    payload['body'] = ''; // empty for GET and DELETE
                    payload['timestamp'] = timestamp;
                    const signature = this.hmac (this.encode (payload), this.encode (this.secret));
                    headers['DYDX-SIGNATURE'] = signature; // EIP-712-compliant Ethereum signature
                }
            } else {
                // All other API Key Private Endpoints
                headers['DYDX-TIMESTAMP'] = timestamp;
                headers['DYDX-ETHEREUM-ADDRESS'] = this.ethereumAddress;
                headers['DYDX-PASSPHRASE'] = this.passPhrase;
                const signature = this.hmac (this.encode (payload), this.encode (this.secret));
                headers['DYDX-SIGNATURE'] = signature; // SHA-256 HMAC produced as described below, and encoded as a Base64 string
            }
        }
        return { 'url': url, 'method': method, 'body': payload, 'headers': headers };
    }
};
