//  ---------------------------------------------------------------------------

import Exchange from './abstract/interactivebrokers.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, OrderNotFound, RateLimitExceeded } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Account, Balances, Dict, Endpoint, List, NullableDict, Str, int } from './base/types.js';
import { rsa } from './base/functions/rsa.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { sha1 } from '@noble/hashes/legacy.js';

//  ---------------------------------------------------------------------------

/**
 * @class interactivebrokers
 * @augments Exchange
 */
export default class interactivebrokers extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'interactivebrokers',
            'name': 'Interactive Brokers',
            'countries': [ 'US' ],
            'version': 'v1',
            'rateLimit': 100, // the client portal gateway allows ~10 requests per second
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
                'cancelOrder': false,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': true,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1min',
            },
            'urls': {
                'logo': '',
                'api': {
                    'oauth': 'https://api.ibkr.com/v1/api',
                    'private': 'https://api.ibkr.com/v1/api',
                },
                'www': 'https://www.interactivebrokers.com/',
                'referral': '',
                'doc': [
                    'https://www.interactivebrokers.com/docs/web-api/introduction',
                    'https://github.com/Voyz/ibind/blob/master/docs/oauth/oauth_1a.md#enabling_oauth1a',
                    'https://ndcdyn.interactivebrokers.com/oauth/?loginType=1&action=OAUTH&clt=0&RL=1&ip2loc=US#/configuration',
                    'https://ndcdyn.interactivebrokers.com/sso/Login?action=OAUTH&RL=1&ip2loc=US',
                ],
                'fees': 'https://www.interactivebrokers.com/en/index.php?f=1590&p=crypto',
            },
            'api': {
                'oauth': {
                    'post': {
                        'oauth/live_session_token': { 'cost': 1 } as Endpoint<Dict>, // diffie-hellman exchange for the live session token, signed with RSA-SHA256
                    },
                },
                'private': {
                    'get': {
                        // informational
                        'trsrv/secdef/schedule': { 'cost': 1 } as Endpoint<List>, // trading schedule up to a month for the requested contract
                        'trsrv/futures': { 'cost': 1 } as Endpoint<Dict>, // non-expired future contracts (conid) for given symbol(s)
                        'trsrv/stocks': { 'cost': 1 } as Endpoint<Dict>, // stock contracts (conid) for given symbol(s)
                        // iserver
                        'iserver/account/trades': { 'cost': 1 } as Endpoint<List>,
                        'iserver/account/{accountId}/alerts': { 'cost': 1 } as Endpoint<List>,
                        'iserver/account/alert/{id}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/mta': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/order/status/{orderId}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/pnl/partitioned': { 'cost': 1 } as Endpoint<Dict>,
                        // must be called before modifying an order or querying open orders
                        // 'iserver' endpoints do not work on free-trial accounts
                        'iserver/accounts': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/marketdata/snapshot': { 'cost': 1 } as Endpoint<List>, // requires conids
                        'iserver/marketdata/{conid}/unsubscribe': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/marketdata/unsubscribeall': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/marketdata/history': { 'cost': 1 } as Endpoint<Dict>, // requires conid
                        'iserver/contract/{conid}/info': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/secdef/strikes': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/secdef/info': { 'cost': 1 } as Endpoint<List>,
                        'iserver/contract/{conid}/algos': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/contract/{conid}/info-and-rules': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/scanner/params': { 'cost': 1 } as Endpoint<Dict>,
                        // portfolio
                        // in non-tiered account structures, portfolio/accounts must be called prior to other /portfolio endpoints
                        'portfolio/accounts': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/subaccounts': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/{accountId}/meta': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/{accountId}/allocation': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/{accountId}/positions/{pageId}': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/{accountId}/position/{conid}': { 'cost': 1 } as Endpoint<List>,
                        'portfolio/{accountId}/summary': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/{accountId}/ledger': { 'cost': 1 } as Endpoint<Dict>,
                        'portfolio/positions/{conid}': { 'cost': 1 } as Endpoint<Dict>,
                        // fyi
                        'fyi/unreadnumber': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/settings': { 'cost': 1 } as Endpoint<List>,
                        'fyi/disclaimer/{typecode}': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/deliveryoptions': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/notifications': { 'cost': 1 } as Endpoint<List>,
                        'fyi/notifications/more': { 'cost': 1 } as Endpoint<List>,
                        // others
                        'ibcust/entity/info': { 'cost': 1 } as Endpoint<Dict>,
                        'portal/sso/validate': { 'cost': 1 } as Endpoint<Dict>, // extends active session
                        'sso/Dispatcher': { 'cost': 1 } as Endpoint<Dict>, // undocumented: validates the login
                    },
                    'post': {
                        // iserver
                        'iserver/auth/ssodh/init': { 'cost': 1 } as Endpoint<Dict>, // opens the brokerage session
                        'iserver/auth/status': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/reauthenticate': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account': { 'cost': 1 } as Endpoint<Dict>, // switch account
                        'iserver/account/{accountId}/alert': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/alert/activate': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/orders': { 'cost': 1 } as Endpoint<List>,
                        'iserver/account/orders/{faGroup}': { 'cost': 1 } as Endpoint<List>, // financial advisor orders
                        'iserver/reply/{replyid}': { 'cost': 1 } as Endpoint<List>, // order reply confirmation
                        'iserver/account/{accountId}/orders/whatif': { 'cost': 1 } as Endpoint<Dict>, // order preview with commission info
                        'iserver/account/{accountId}/order/{orderId}': { 'cost': 1 } as Endpoint<List>, // modify order
                        'iserver/secdef/search': { 'cost': 1 } as Endpoint<List>, // search by symbol or company name
                        'iserver/scanner/run': { 'cost': 1 } as Endpoint<Dict>,
                        // portfolio
                        'portfolio/allocation': { 'cost': 1 } as Endpoint<Dict>, // consolidated view of all accounts returned by /portfolio/accounts
                        'portfolio/{accountId}/positions/invalidate': { 'cost': 1 } as Endpoint<Dict>,
                        // fyi
                        'fyi/settings/{typecode}': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/deliveryoptions/device': { 'cost': 1 } as Endpoint<Dict>,
                        // others
                        'pa/performance': { 'cost': 1 } as Endpoint<Dict>,
                        'pa/summary': { 'cost': 1 } as Endpoint<Dict>,
                        'pa/transactions': { 'cost': 1 } as Endpoint<Dict>,
                        'ws': { 'cost': 1 } as Endpoint<Dict>,
                        'tickle': { 'cost': 1 } as Endpoint<Dict>, // validates the session
                        'logout': { 'cost': 1 } as Endpoint<Dict>,
                        'trsrv/secdef': { 'cost': 1 } as Endpoint<Dict>, // requires conids
                    },
                    'put': {
                        'fyi/disclaimer/{typecode}': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/deliveryoptions/email': { 'cost': 1 } as Endpoint<Dict>,
                        'fyi/notifications/{notificationId}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'delete': {
                        'fyi/deliveryoptions/{deviceId}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/alert/{alertId}': { 'cost': 1 } as Endpoint<Dict>,
                        'iserver/account/{accountId}/order/{orderId}': { 'cost': 1 } as Endpoint<Dict>, // cancel order
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.002'),
                    'maker': this.parseNumber ('0.002'),
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                // oauth 1.0a credentials
                'apiKey': true, // access token
                'secret': true, // encrypted access token secret
                'uid': true, // consumer key
            },
            'options': {
                'accountId': undefined, // default account used by private methods, filled by fetchAccounts
                'accounts': [],
                'fetchPortfolioAccounts': {
                    'method': 'privateGetPortfolioAccounts', // or 'privateGetPortfolioSubaccounts'
                },
                // oauth 1.0a
                'realm': 'limited_poa',
                'signaturePemPath': undefined, // private signature key, signs the live session token request
                'encryptionPemPath': undefined, // private encryption key, decrypts the access token secret
                'dhParamPemPath': undefined, // diffie-hellman parameters
                'dhGen': this.convertToBigInt ('2'), // diffie-hellman generator
                'liveSessionToken': undefined, // filled by signIn ()
                'liveSessionTokenExpiration': undefined, // filled by signIn ()
                'accessTokenSecretHex': undefined, // decrypted access token secret, filled by signIn ()
                'liveSessionTokenRefreshMargin': 60000, // re-sign in when the token expires within this many ms
                'signInInitRequest': {
                    'publish': true,
                    'compete': true,
                },
            },
            'features': {
                'default': {
                    'sandbox': false,
                },
                'spot': {
                    'extends': 'default',
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
            'exceptions': {
                'exact': {
                    '401': AuthenticationError,
                    '429': RateLimitExceeded,
                },
                'broad': {
                    'Conid(s) missing': ArgumentsRequired, // {"error":"Bad Request: Conid(s) missing","statusCode":400}
                    'not authenticated': AuthenticationError,
                    'Invalid symbol': BadSymbol,
                    'Order not found': OrderNotFound,
                    'Bad Request': BadRequest,
                },
            },
            'commonCurrencies': {},
        });
    }

    /**
     * @method
     * @name interactivebrokers#isConnected
     * @description checks whether the client portal gateway session is authenticated
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#tickle
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true if the brokerage session is authenticated
     */
    async isConnected (params: Dict = {}): Promise<boolean> {
        await this.authenticate ();
        const response = await this.privatePostTickle (params);
        //
        //     {
        //         "session": "140a9b1902d27e94x236dc142ce933a6",
        //         "ssoExpires": 483732,
        //         "collission": false,
        //         "userId": 46130428,
        //         "iserver": {
        //             "authStatus": {
        //                 "authenticated": true,
        //                 "competing": false,
        //                 "connected": true,
        //                 "message": "",
        //                 "MAC": "F4:03:43:E4:EF:C0",
        //                 "serverInfo": {
        //                     "serverName": "JieZ46418",
        //                     "serverVersion": "Build 10.14.0l, Mar 1, 2022 5:28:08 PM"
        //                 }
        //             }
        //         }
        //     }
        //
        const iserver = this.safeDict (response, 'iserver', {});
        const authStatus = this.safeDict (iserver, 'authStatus', {});
        const authenticated = this.safeBool (authStatus, 'authenticated', false);
        const connected = this.safeBool (authStatus, 'connected', false);
        return authenticated && connected;
    }

    /**
     * @method
     * @name interactivebrokers#signIn
     * @description obtains a live session token via the oauth 1.0a diffie-hellman exchange and opens the brokerage session, must be called prior to using other authenticated methods (called automatically by authenticate)
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#oauth-lst
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#ssodh-init
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    override async signIn (params: Dict = {}): Promise<Dict> {
        this.checkRequiredCredentials ();
        await this.initFileSystem ();
        const encryptionKey = this.readFile (this.options['encryptionPemPath']) as string;
        const dhPrime = this.convertToBigInt ('0x' + this.readDhParam (this.options['dhParamPemPath']));
        // the access token secret is encrypted with the consumer's public encryption key
        const decrypted = this.decryptPrivateKey (encryptionKey, this.secret);
        const accessTokenSecretHex = this.binaryToBase16 (decrypted);
        this.options['accessTokenSecretHex'] = accessTokenSecretHex; // prepended to the signature base string in sign ()
        const dhRandom = this.convertToBigInt ('0x' + this.randomBytes (32));
        const dhChallenge = this.modPow (this.options['dhGen'], dhRandom, dhPrime);
        const request: Dict = {
            'diffie_hellman_challenge': this.intToBase16 (dhChallenge),
        };
        const response = await this.oauthPostOauthLiveSessionToken (this.extend (request, params));
        //
        //     {
        //         "diffie_hellman_response": "1d9c...",
        //         "live_session_token_signature": "9a7e...",
        //         "live_session_token_expiration": 1714661586311
        //     }
        //
        const dhResponse = this.safeString (response, 'diffie_hellman_response');
        const sharedSecret = this.modPow (this.convertToBigInt ('0x' + dhResponse), dhRandom, dhPrime);
        const liveSessionToken = this.hmac (this.base16ToBinary (accessTokenSecretHex), this.bigToBytes (sharedSecret), sha1, 'base64');
        const check = this.hmac (this.encode (this.uid), this.base64ToBinary (liveSessionToken), sha1, 'hex');
        if (check !== this.safeString (response, 'live_session_token_signature')) {
            throw new AuthenticationError (this.id + ' signIn() live session token validation failed');
        }
        this.options['liveSessionToken'] = liveSessionToken;
        this.options['liveSessionTokenExpiration'] = this.safeInteger (response, 'live_session_token_expiration');
        // open the brokerage session
        const initRequest = this.safeDict (this.options, 'signInInitRequest', {});
        await this.privatePostIserverAuthSsodhInit (initRequest);
        return response;
    }

    /**
     * @method
     * @name interactivebrokers#authenticate
     * @description signs in when there is no live session token yet or the current one is about to expire
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {string} the live session token
     */
    async authenticate (params: Dict = {}): Promise<Str> {
        const liveSessionToken = this.safeString (this.options, 'liveSessionToken');
        const expiration = this.safeInteger (this.options, 'liveSessionTokenExpiration');
        const refreshMargin = this.safeInteger (this.options, 'liveSessionTokenRefreshMargin', 60000);
        let expired = false;
        if (expiration !== undefined) {
            expired = (this.milliseconds () + refreshMargin) >= expiration;
        }
        if ((liveSessionToken === undefined) || expired) {
            await this.signIn (params);
        }
        return this.safeString (this.options, 'liveSessionToken');
    }

    /**
     * @method
     * @name interactivebrokers#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-all-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'privateGetPortfolioAccounts' (default) or 'privateGetPortfolioSubaccounts'
     * @returns {object[]} a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
     */
    override async fetchAccounts (params: Dict = {}): Promise<Account[]> {
        // as required by IBKR, iserver/accounts must be called at least once before any other trading endpoint
        const serviceAccountsPromise = this.fetchServiceAccounts (params);
        const portfolioAccountsPromise = this.fetchPortfolioAccounts (params);
        const [ serviceAccounts, portfolioAccounts ] = await Promise.all ([ serviceAccountsPromise, portfolioAccountsPromise ]);
        const accountIds = Object.keys (this.indexBy (portfolioAccounts, 'accountId'));
        const length = accountIds.length;
        if (length === 0) {
            throw new ExchangeError ('No tradingaccount IDs found for the user');
        }
        if (this.safeString (this.options, 'accountId') === undefined) {
            if (length === 1) {
                this.options['accountId'] = accountIds[0];
            } else {
                throw new ExchangeError ('Multiple account IDs found, please set .options["accountId"] to desired one from: ' + accountIds.join(', '));
            }
        }
        const accounts: Account[] = [];
        for (let i = 0; i < portfolioAccounts.length; i++) {
            accounts.push (this.parseAccount (portfolioAccounts[i]));
        }
        return accounts;
    }

    override parseAccount (account: Dict): Account {
        //
        //     {
        //         "id": "U3449298",
        //         "accountId": "U3449298",
        //         "accountVan": "U3449298",
        //         "accountTitle": "John Doe",
        //         "displayName": "John Doe",
        //         "accountAlias": null,
        //         "accountStatus": "1646607600000",
        //         "currency": "USD",
        //         "type": "INDIVIDUAL",
        //         "tradingType": "STKNOPT",
        //         ...
        //     }
        //
        const currencyId = this.safeString (account, 'currency');
        return {
            'id': this.safeString2 (account, 'accountId', 'id'),
            'type': this.safeStringLower (account, 'type'),
            'code': this.safeCurrencyCode (currencyId),
            'info': account,
            'name': this.safeString (account, 'accountTitle'),
        };
    }

    /**
     * @method
     * @name interactivebrokers#fetchServiceAccounts
     * @description fetch the accounts the user has trading access to, must be called before modifying an order or querying open orders
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#accounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response from the exchange
     */
    async fetchServiceAccounts (params: Dict = {}): Promise<Dict> {
        await this.authenticate ();
        const response = await this.privateGetIserverAccounts (params);
        //
        //    {
        //        "accounts": [
        //            "U3448645"
        //        ],
        //        "acctProps": {
        //            "U3448645": {
        //                "hasChildAccounts": false,
        //                "supportsCashQty": true,
        //                "liteUnderPro": false,
        //                "noFXConv": false,
        //                "isProp": false,
        //                "supportsFractions": true,
        //                "allowCustomerTime": false,
        //                "autoFx": false
        //            }
        //        },
        //        "aliases": {
        //            "U3448645": "U3448645"
        //        },
        //        "allowFeatures": {
        //            "showGFIS": true,
        //            "showEUCostReport": false,
        //            "allowEventContract": true,
        //            "allowFXConv": true,
        //            "allowFinancialLens": false,
        //            "allowMTA": true,
        //            "allowTypeAhead": true,
        //            "allowEventTrading": true,
        //            "snapshotRefreshTimeout": 30,
        //            "liteUser": false,
        //            "showWebNews": true,
        //            "research": true,
        //            "debugPnl": true,
        //            "showTaxOpt": true,
        //            "showImpactDashboard": true,
        //            "allowDynAccount": false,
        //            "allowCrypto": false,
        //            "allowFA": false,
        //            "allowLiteUnderPro": false,
        //            "allowedAssetTypes": "STK,CFD,OPT,FOP,WAR,FUT,BAG,PDC,CASH,IND,BOND,BILL,FUND,SLB,News,CMDTY,IOPT,ICU,ICS,PHYSS,CRYPTO",
        //            "restrictTradeSubscription": false,
        //            "showUkUserLabels": true,
        //            "sideBySide": true
        //        },
        //        "chartPeriods": {
        //            "STK": [ "*" ],
        //            "CFD": [ "*" ],
        //            "OPT": [ "2h", "1d", "2d", "1w", "1m" ],
        //            "FOP": [ "2h", "1d", "2d", "1w", "1m" ],
        //            "WAR": [ "*" ],
        //            "IOPT": [ "*" ],
        //            "FUT": [ "*" ],
        //            "CASH": [ "*" ],
        //            "IND": [ "*" ],
        //            "BOND": [ "*" ],
        //            "FUND": [ "*" ],
        //            "CMDTY": [ "*" ],
        //            "PHYSS": [ "*" ],
        //            "CRYPTO": [ "*" ]
        //        },
        //        "groups": [],
        //        "profiles": [],
        //        "selectedAccount": "U3448645",
        //        "serverInfo": {
        //            "serverName": "JifZ26071",
        //            "serverVersion": "Build 10.50.1a, Sep 23, 2026 1:23:38 PM"
        //        },
        //        "sessionId": "6ac5c713.0000037a",
        //        "isFT": false,
        //        "isPaper": false
        //    }
        //
        return response;
    }

    /**
     * @method
     * @name interactivebrokers#fetchPortfolioAccounts
     * @description fetch the accounts for which the user can view position and account information
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#portfolio-accounts
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#portfolio-subaccounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'privateGetPortfolioAccounts' (default) or 'privateGetPortfolioSubaccounts'
     * @returns {object[]} the raw response from the exchange
     */
    async fetchPortfolioAccounts (params: Dict = {}): Promise<Dict[]> {
        await this.authenticate ();
        const [ method, query ] = this.handleOptionAndParams (params, 'fetchPortfolioAccounts', 'method', 'privateGetPortfolioAccounts');
        let response = undefined;
        if (method === 'privateGetPortfolioSubaccounts') {
            response = await this.privateGetPortfolioSubaccounts (query);
        } else {
            response = await this.privateGetPortfolioAccounts (query);
            //
            //    [
            //        {
            //            "id": "U3448645",
            //            "PrepaidCrypto-Z": false,
            //            "PrepaidCrypto-P": true,
            //            "brokerageAccess": true,
            //            "accountId": "U3448645",
            //            "accountVan": "U3448645",
            //            "accountTitle": "Toma Todua",
            //            "displayName": "Toma Todua",
            //            "accountAlias": null,
            //            "accountStatus": 1646607600000,
            //            "currency": "USD",
            //            "type": "INDIVIDUAL",
            //            "tradingType": "STKNOPT",
            //            "businessType": "INDEPENDENT",
            //            "category": "",
            //            "ibEntity": "IBLLC-US",
            //            "faclient": false,
            //            "clearingStatus": "O",
            //            "covestor": false,
            //            "noClientTrading": false,
            //            "trackVirtualFXPortfolio": true,
            //            "acctCustType": "INDIVIDUAL",
            //            "parent": {
            //                "mmc": [],
            //                "accountId": "",
            //                "isMParent": false,
            //                "isMChild": false,
            //                "isMultiplex": false
            //            },
            //            "desc": "U3448645"
            //        }
            //    ]
            //
        }
        return response;
    }

    /**
     * @method
     * @name interactivebrokers#switchToAccount
     * @description switch the active account (for users with multiple accounts)
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#switch-account
     * @ignore
     * @param {string} accountId the account id to switch to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response from the exchange
     */
    async switchToAccount (accountId: string, params: Dict = {}): Promise<Dict> {
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' switchToAccount() requires an accountId argument');
        }
        const request: Dict = {
            'acctId': accountId,
        };
        await this.authenticate ();
        const response = await this.privatePostIserverAccount (this.extend (request, params));
        //
        //     {
        //         "set": true,
        //         "acctId": "U3449298"
        //     }
        //
        // if the account is already selected, the gateway responds with http 501 instead
        //
        this.options['accountId'] = accountId;
        return response;
    }

    /**
     * @method
     * @name interactivebrokers#loadAccountId
     * @description returns the account id from params, options, or the first account returned by fetchAccounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id to use
     * @returns {Array} the account id and the params without accountId
     */
    async loadAccountId (params: Dict = {}): Promise<any[]> {
        const [ accountIdFromParams, query ] = this.handleOptionAndParams (params, 'loadAccountId', 'accountId');
        let accountId: Str = accountIdFromParams;
        if (accountId === undefined) {
            await this.fetchAccounts ();
            accountId = this.safeString (this.options, 'accountId');
        }
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' requires an accountId in params["accountId"] or options["accountId"], fetchAccounts() returned no accounts');
        }
        return [ accountId, query ];
    }

    /**
     * @method
     * @name interactivebrokers#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#portfolio-ledger
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"] or the selected account
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        await this.authenticate ();
        const [ accountId, query ] = await this.loadAccountId (params);
        const request: Dict = {
            'accountId': accountId,
        };
        const response = await this.privateGetPortfolioAccountIdLedger (this.extend (request, query));
        //
        //     {
        //         "USD": {
        //             "commoditymarketvalue": 0.0,
        //             "futuremarketvalue": 0.0,
        //             "settledcash": 214716688.0,
        //             "exchangerate": 1,
        //             "sessionid": 1,
        //             "cashbalance": 214716688.0,
        //             "corporatebondsmarketvalue": 0.0,
        //             "netliquidationvalue": 215335840.0,
        //             "interest": 305569.94,
        //             "unrealizedpnl": 39695.82,
        //             "stockmarketvalue": 314123.88,
        //             "currency": "USD",
        //             "realizedpnl": 0.0,
        //             "acctcode": "U1234567",
        //             "key": "LedgerList",
        //             "timestamp": 1702582321,
        //             "secondkey": "USD",
        //             ...
        //         },
        //         "BASE": { ... }
        //     }
        //
        return this.parseBalance (response);
    }

    override parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
        };
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            if (currencyId === 'BASE') {
                continue; // aggregated entry in the account base currency
            }
            const balance = this.safeDict (response, currencyId, {});
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'cashbalance');
            result[code as string] = account;
        }
        const timestamp = this.safeTimestamp (this.safeDict (response, 'BASE', {}), 'timestamp');
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601 (timestamp);
        return this.safeBalance (result);
    }

    ibkrEncrypt (value: string): string {
        // RFC 3986 percent-encoding (also escapes !'()*), as required by the oauth 1.0a signature base string
        const encoded = this.urlencode ({ 'v': value });
        return encoded.slice (2); // strip the 'v=' prefix
    }

    ibkrBaseString (method: string, url: string, params: Dict, prepend: string = ''): string {
        const query = this.rawencode (this.keysort (params));
        return prepend + method + '&' + this.ibkrEncrypt (url) + '&' + this.ibkrEncrypt (query);
    }

    ibkrAuthHeader (params: Dict): string {
        const sorted = this.keysort (params);
        const keys = Object.keys (sorted);
        const parts: string[] = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            parts.push (key + '="' + sorted[key] + '"');
        }
        return 'OAuth realm="' + this.options['realm'] + '", ' + parts.join (', ');
    }

    ibkrOauthBase (consumerKey: string, consumerAccessToken: string): Dict {
        return {
            'oauth_consumer_key': consumerKey,
            'oauth_nonce': this.randomBytes (16),
            'oauth_timestamp': this.seconds ().toString (),
            'oauth_token': consumerAccessToken,
        };
    }

    override sign (path: string, api = 'private', method = 'GET', params: Dict = {}, headers: NullableDict = undefined, body: Str = undefined): Dict {
        const baseUrl = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let url = baseUrl;
        const query = this.omit (params, this.extractParams (path));
        const hasQuery = Object.keys (query).length > 0;
        const isGetOrDelete = (method === 'GET') || (method === 'DELETE');
        let requestBody: Str = body;
        let requestHeaders: NullableDict = headers;
        this.checkRequiredCredentials ();
        const oauthParams = this.ibkrOauthBase (this.uid, this.apiKey);
        if (api === 'oauth') {
            // the live session token request is signed with RSA-SHA256,
            // its parameters (diffie_hellman_challenge) are sent as oauth parameters in the Authorization header
            const accessTokenSecretHex = this.safeString (this.options, 'accessTokenSecretHex', '');
            const signatureKey = this.readFile (this.options['signaturePemPath']) as string;
            oauthParams['oauth_signature_method'] = 'RSA-SHA256';
            const authParams = this.extend (oauthParams, query);
            const auth = this.ibkrBaseString (method, baseUrl, authParams, accessTokenSecretHex);
            const signature = rsa (auth, signatureKey, sha256);
            authParams['oauth_signature'] = this.ibkrEncrypt (signature);
            requestHeaders = {
                'Authorization': this.ibkrAuthHeader (authParams),
                'User-Agent': 'ccxt',
            };
        } else {
            // private requests are signed with HMAC-SHA256 using the live session token obtained by signIn ()
            const liveSessionToken = this.safeString (this.options, 'liveSessionToken');
            if (liveSessionToken === undefined) {
                throw new AuthenticationError (this.id + ' requires a live session token, call signIn() first');
            }
            oauthParams['oauth_signature_method'] = 'HMAC-SHA256';
            let signingParams = oauthParams;
            if (isGetOrDelete) {
                if (hasQuery) {
                    url += '?' + this.urlencode (query);
                    // the query-string params are part of the signature base string too
                    signingParams = this.extend (oauthParams, query);
                }
            } else if (hasQuery) {
                requestBody = this.json (query);
            }
            const auth = this.ibkrBaseString (method, baseUrl, signingParams);
            const signature = this.hmac (this.encode (auth), this.base64ToBinary (liveSessionToken), sha256, 'base64');
            oauthParams['oauth_signature'] = this.ibkrEncrypt (signature);
            requestHeaders = {
                'Authorization': this.ibkrAuthHeader (oauthParams),
                'Content-Type': 'application/json',
                'User-Agent': 'ccxt',
            };
        }
        return { 'url': url, 'method': method, 'body': requestBody, 'headers': requestHeaders };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //     {
        //         "error": "Bad Request: Conid(s) missing",
        //         "statusCode": 400
        //     }
        //
        const errorMessage = this.safeString (response, 'error');
        if (errorMessage !== undefined) {
            const feedback = this.id + ' ' + body;
            const statusCode = this.safeString (response, 'statusCode');
            this.throwExactlyMatchedException (this.exceptions['exact'], statusCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
