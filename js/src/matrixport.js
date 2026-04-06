//  ---------------------------------------------------------------------------
import Exchange from './abstract/matrixport.js';
import { ExchangeError, AuthenticationError, BadRequest, ArgumentsRequired, InsufficientFunds, RateLimitExceeded } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
//  ---------------------------------------------------------------------------
/**
 * @class matrixport
 * @augments Exchange
 * @description MatrixPort (bit.com) crypto financial services platform with RFQ-based trading and wallet APIs
 */
export default class matrixport extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'matrixport',
            'name': 'MatrixPort',
            'countries': ['SG'],
            'rateLimit': 1000,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderBook': false,
                'fetchOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': false,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/147515585-1296e91b-7398-45e5-9d32-f6121538533f.jpg',
                'api': {
                    'wallet': 'https://mapi.matrixport.com/mapi/v1/wallet',
                    'trade': 'https://mapi.matrixport.com/trader/v2/api',
                    'dcp': 'https://mapi.matrixport.com/dcp/api/v1',
                    'dcpV2': 'https://mapi.matrixport.com/dcp/api/v2',
                    'balancePlus': 'https://mapi.matrixport.com/flexible/api/v2',
                    'staking': 'https://mapi.matrixport.com/eth-two/api/v2',
                    'fixedIncome': 'https://mapi.matrixport.com/fixed-income/api/v2',
                    'fixedIncomeV3': 'https://mapi.matrixport.com/fixed-income/api/v3',
                    'fixed': 'https://mapi.matrixport.com/fixed/api/v2',
                    'collateralLending': 'https://mapi.matrixport.com/collateral-lending/api/v1',
                    'primeBroker': 'https://mapi.matrixport.com/credit/agency/v1',
                    'strategy': 'https://mapi.matrixport.com/strategy/api/v2',
                    'structure': 'https://mapi.matrixport.com/structured/api/v1',
                    'groupAgency': 'https://mapi.matrixport.com/group/agency/v1',
                },
                'www': 'https://www.matrixport.com',
                'doc': [
                    'https://www.bit.com/docs/en-us/wallet.html',
                    'https://www.bit.com/docs/en-us/trade.html',
                    'https://www.bit.com/docs/en-us/dcp.html',
                    'https://www.bit.com/docs/en-us/fixed_income.html',
                    'https://www.bit.com/docs/en-us/collateral_lending.html',
                    'https://www.bit.com/docs/en-us/balanceplus.html',
                    'https://www.bit.com/docs/en-us/fixed_staking.html',
                    'https://www.bit.com/docs/en-us/prime_broker.html',
                    'https://www.bit.com/docs/en-us/strategy.html',
                    'https://www.bit.com/docs/en-us/structure.html',
                ],
                'referral': 'https://www.matrixport.com',
            },
            'api': {
                'wallet': {
                    'get': [
                        'balance',
                        'currencies',
                        'deposits',
                        'withdrawals',
                        'deposit-address',
                        'bills',
                        'withdraw-fees',
                    ],
                    'post': [
                        'withdraw',
                    ],
                },
                'trade': {
                    'get': [
                        'healthy',
                        'symbols-info',
                        'rfq-price',
                        'order',
                        'orders',
                    ],
                    'post': [
                        'rfq-place',
                    ],
                },
                'dcp': {
                    'get': [
                        'index_price',
                        'available_balance',
                        'cashier/payment_combination',
                        'tenor_config',
                        'trading_exchanges',
                        'product/overview',
                        'product/list',
                        'product/agreement',
                        'quote',
                        'redeem/quote',
                        'orders',
                        'order',
                        'active_order_count',
                        'get-all-invest-currency',
                        'total-positions',
                        'invest-days',
                    ],
                    'post': [
                        'order',
                        'redeem',
                        'redeem/result',
                        'order/coupons',
                    ],
                },
                'dcpV2': {
                    'get': [
                        'pnl',
                    ],
                },
                'balancePlus': {
                    'get': [
                        'app/homepage',
                        'deposit-redeem/currency/detail',
                        'deposit-redeem/user/available-balance',
                        'deposit-redeem',
                        'deposit-redeem/orders',
                        'deposit-redeem/interest/detail',
                        'deposit-redeem/user/redeem-balance',
                        'user/asset/summary',
                    ],
                    'post': [
                        'deposit',
                        'redeem',
                    ],
                },
                'staking': {
                    'get': [
                        'products',
                        'product',
                        'product/quota',
                        'order/result',
                        'orders',
                        'order',
                        'order/redeem/amount',
                        'order/redeem/detail',
                    ],
                    'post': [
                        'order',
                        'order/redeem',
                    ],
                },
                'fixedIncome': {
                    'get': [
                        'products',
                        'product',
                        'product/quota',
                        'product/invest/trial',
                        'order/result',
                        'orders',
                        'order',
                        'order/renew/original_id',
                        'order/redeem/amount',
                        'order/redeem/trail',
                        'order/redeem/detail',
                    ],
                    'post': [
                        'order',
                        'order/redeem',
                    ],
                },
                'fixedIncomeV3': {
                    'get': [
                        'order/interest_withdraw_plan',
                        'user-asset/interest',
                        'user-asset/statistics_usd',
                        'tokenize/loanable_currency',
                        'tokenize/loanable_orders',
                    ],
                    'post': [
                        'order/auto_renew/change',
                        'order/renew_principal_type/change',
                        'order/interest_withdraw_enabled/switch/on',
                        'order/interest_withdraw_enabled/switch/off',
                        'tokenize/loan/calculate',
                        'tokenize/loan',
                        'tokenize/loan/result',
                    ],
                },
                'fixed': {
                    'get': [
                        'order/auto_renew/products',
                        'order/coupons',
                    ],
                    'post': [
                        'order/auto_renew/switch/on',
                        'order/auto_renew/switch/off',
                    ],
                },
                'collateralLending': {
                    'get': [
                        'product',
                        'product/coin-pairs',
                        'product/default-coin-pair',
                        'product/loan-terms',
                        'product/rules',
                        'product/search',
                        'user/balance',
                        'user/loan-stat',
                        'order',
                        'order/status',
                        'order/coins',
                        'order/coin-exchange',
                        'order/cur-ltv',
                        'order/left-loan-quota',
                        'order/pledge-range',
                        'order/pledge-redeem-max',
                        'order/op-records',
                        'order/preorders',
                        'order/trial-loan-amount',
                        'order/trial-pledge-amount',
                        'order/recommend-add-pledge-amount',
                        'order/pledge-result',
                        'order/ordering-coupons',
                        'order/renew',
                        'renew/base-param',
                        'renew/recommend-products',
                        'repay/balance-repay-max',
                        'repay/pledge-repay-range',
                        'repay/balance-repay-result',
                        'repay/pledge-repay-result',
                    ],
                    'post': [
                        'order',
                        'order/add-pledge',
                        'order/redeem-pledge',
                        'order/set-auto-margin-call',
                        'order/set-renew',
                        'order/renew',
                        'order/trial-add-pledge',
                        'order/trial-redeem-pledge',
                        'order/renew/trial',
                        'repay/balance-repay',
                        'repay/pledge-repay',
                        'repay/trial-balance-repay',
                        'repay/trial-pledge-repay',
                        'repay/trial-repay-plan',
                    ],
                    'delete': [
                        'order/renew',
                    ],
                },
                'primeBroker': {
                    'get': [
                        'allocate',
                        'exchange/wallets',
                        'allocate_currencies',
                        'available_chains',
                        'exchange/minimum_amount',
                        'account/balance',
                        'account/flows',
                        'account/funds',
                        'accounts',
                        'dma/bills',
                        'exchange/custody',
                        'exchange/trading_fee/rate',
                        'rcu/accounts',
                        'rcus',
                        'rcu',
                        'bills',
                        'order',
                        'order/margin/records',
                        'order/operations',
                        'orders',
                    ],
                    'post': [
                        'allocate',
                        'user/profit_accrual',
                        'account',
                        'dma/bill/repay',
                        'bill/repay',
                        'order/leading_account',
                        'order/margin',
                        'order/renew',
                        'order/repay',
                    ],
                },
                'strategy': {
                    'get': [
                        'products',
                        'product/range-search',
                        'product',
                        'orders',
                        'order',
                        'order/coupons',
                    ],
                    'post': [
                        'order',
                        'order/redeem',
                    ],
                },
                'structure': {
                    'get': [
                        'index_price',
                        'quote',
                        'available_balance',
                        'cashier/payment_combination',
                        'active_order_count',
                        'get-all-invest-currency',
                        'total-positions',
                        'invest-days',
                        'product/strategy',
                        'product/homepagelist',
                        'product/currency_list',
                        'product/list',
                        'product/detail',
                        'product/agreement',
                        'trading_exchanges',
                        'order/result',
                        'orders',
                        'order/{id}',
                        'order/coupons',
                        'renew_tenor',
                        'renew_price',
                        'renew_params',
                        'order_renew_info',
                        'pnlnew',
                        'all-strategy',
                        'strategy-type',
                    ],
                    'post': [
                        'order',
                        'switchrenew',
                        'skitg',
                    ],
                    'put': [
                        'renew_tenor',
                        'renew_coupon',
                        'renew_price',
                    ],
                },
                'groupAgency': {
                    'post': [
                        'user/bind',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': undefined,
                    'taker': undefined,
                },
            },
            'precisionMode': TICK_SIZE,
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerDirection': false,
                        'triggerPriceType': undefined,
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
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': undefined,
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': undefined,
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': undefined,
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
                    '14000103': AuthenticationError,
                    '14000104': AuthenticationError,
                    '14000105': AuthenticationError,
                    '429': RateLimitExceeded,
                },
                'broad': {
                    'too many requests': RateLimitExceeded,
                    'insufficient': InsufficientFunds,
                    'auth': AuthenticationError,
                    'invalid': BadRequest,
                },
            },
        });
    }
    /**
     * @method
     * @name matrixport#fetchMarkets
     * @description retrieves data on all markets for matrixport
     * @see https://www.bit.com/docs/en-us/trade.html
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Market[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.tradeGetSymbolsInfo(params);
        //
        // { "code": 0, "message": "success", "data": [ { "symbol": "BTC_USDT", ... } ] }
        //
        const data = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = this.parseMarket(data[i]);
            result.push(market);
        }
        return result;
    }
    parseMarket(market) {
        //
        // { "pair": "BTCUSDT", "base_currency": "BTC", "quote_currency": "USDT",
        //   "quote_precision": "2", "base_precision": "4",
        //   "base_min_amount": "0.0005", "base_max_amount": "33",
        //   "quote_min_amount": "20", "quote_max_amount": "2200000" }
        //
        const id = this.safeString(market, 'pair');
        const baseId = this.safeString(market, 'base_currency');
        const quoteId = this.safeString(market, 'quote_currency');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const symbol = base + '/' + quote;
        const basePrecision = this.safeString(market, 'base_precision');
        const quotePrecision = this.safeString(market, 'quote_precision');
        return this.safeMarketStructure({
            'id': id,
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
            'precision': {
                'amount': this.parseNumber(this.parsePrecision(basePrecision)),
                'price': this.parseNumber(this.parsePrecision(quotePrecision)),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'base_min_amount'),
                    'max': this.safeNumber(market, 'base_max_amount'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber(market, 'quote_min_amount'),
                    'max': this.safeNumber(market, 'quote_max_amount'),
                },
            },
            'info': market,
        });
    }
    /**
     * @method
     * @name matrixport#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.walletGetCurrencies(params);
        //
        // { "code": "0", "data": { "currencies": [
        //   { "currency": "PAXG", "chains": ["ERC20"], "networks": [
        //     { "chain": "ERC20", "can_withdraw": true, "can_deposit": true,
        //       "min_deposit_amount": "0.0001", "min_withdraw_amount": "0.0024",
        //       "withdraw_fee": "0.00050481", "decimal": "18" } ] } ] } }
        //
        const data = this.safeDict(response, 'data', {});
        const currencies = this.safeList(data, 'currencies', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const entry = currencies[i];
            const id = this.safeString(entry, 'currency');
            const code = this.safeCurrencyCode(id);
            const networksList = this.safeList(entry, 'networks', []);
            const networks = {};
            let active = false;
            for (let j = 0; j < networksList.length; j++) {
                const network = networksList[j];
                const networkId = this.safeString(network, 'chain');
                const canDeposit = this.safeBool(network, 'can_deposit', false);
                const canWithdraw = this.safeBool(network, 'can_withdraw', false);
                if (canDeposit || canWithdraw) {
                    active = true;
                }
                networks[networkId] = {
                    'id': networkId,
                    'network': networkId,
                    'active': canDeposit || canWithdraw,
                    'deposit': canDeposit,
                    'withdraw': canWithdraw,
                    'fee': this.safeNumber(network, 'withdraw_fee'),
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber(network, 'min_withdraw_amount'),
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.safeNumber(network, 'min_deposit_amount'),
                            'max': undefined,
                        },
                    },
                    'info': network,
                };
            }
            result[code] = this.safeCurrencyStructure({
                'id': id,
                'code': code,
                'name': code,
                'active': active,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
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
                'info': entry,
            });
        }
        return result;
    }
    /**
     * @method
     * @name matrixport#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.bit.com/docs/en-us/trade.html
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'side': 0,
            'qty': this.safeString(market['limits']['amount'], 'min', '0.001'),
        };
        const response = await this.tradeGetRfqPrice(this.extend(request, params));
        //
        // { "code": "0", "data": { "symbol": "BTCUSDT", "price_id": "...",
        //   "price": "...", "expire_ts": ..., "qty": "...", "cash": "..." } }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseTicker(data, market);
    }
    parseTicker(ticker, market = undefined) {
        //
        // { "symbol": "BTCUSDT", "price_id": "...", "price": "68572.53",
        //   "expire_ts": "...", "countdown_ts": "5500", "qty": "0.0005", "cash": "34.28" }
        //
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const last = this.safeString(ticker, 'price');
        const expireTs = this.safeInteger(ticker, 'expire_ts');
        const countdownMs = this.safeInteger(ticker, 'countdown_ts');
        let timestamp = undefined;
        if (expireTs !== undefined && countdownMs !== undefined) {
            timestamp = expireTs - countdownMs;
        }
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': undefined,
            'low': undefined,
            'bid': last,
            'bidVolume': undefined,
            'ask': last,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    parseBalance(response) {
        //
        // { "code": "0", "data": { "items": [
        //   { "available_balance": "0", "balance": "0", "currency": "BTC",
        //     "frozen_balance": "0", "unconfirmed_balance": "0" }, ... ] } }
        //
        const data = this.safeDict(response, 'data', {});
        const items = this.safeList(data, 'items', []);
        const result = { 'info': response };
        for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            const currencyId = this.safeString(entry, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(entry, 'available_balance');
            account['used'] = this.safeString(entry, 'frozen_balance');
            account['total'] = this.safeString(entry, 'balance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    parseBalancePlusBalance(response) {
        //
        // { "code": 0, "message": "", "data": {
        //   "total_balance_amount": "0", "total_interest": "0",
        //   "currencies": [ { "currency": "ETH", "product_type": "flexi_saving",
        //     "subject_type": "flexi_saving", "balance": "0",
        //     "deposit_apy": "0.08", "interest": "0" } ] } }
        //
        const data = this.safeDict(response, 'data', {});
        const currencies = this.safeList(data, 'currencies', []);
        const result = { 'info': response };
        for (let i = 0; i < currencies.length; i++) {
            const entry = currencies[i];
            const currencyId = this.safeString(entry, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['total'] = this.safeString(entry, 'balance');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    parseStakingBalance(response) {
        //
        // { "code": 0, "data": { "count": 2, "items": [
        //   { "id": "...", "currency": "ETH", "amount_dec": "1.5",
        //     "order_status": 1, "hold_profit": "0.01", ... } ] } }
        //
        const data = this.safeDict(response, 'data', {});
        const items = this.safeList(data, 'items', []);
        const result = { 'info': response };
        for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            const currencyId = this.safeString(entry, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            if (!(code in result)) {
                result[code] = this.account();
                result[code]['total'] = '0';
            }
            const amount = this.safeString(entry, 'amount_dec');
            result[code]['total'] = Precise.stringAdd(result[code]['total'], amount);
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name matrixport#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @see https://www.bit.com/docs/en-us/balanceplus.html#currency-list
     * @see https://www.bit.com/docs/en-us/fixed_staking.html#order-list
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] the type of balance to fetch: 'wallet' (default), 'savings' for Balance+ flexible savings, or 'staking' for fixed staking balances
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleOptionAndParams(params, 'fetchBalance', 'type', 'wallet');
        if (type === 'savings') {
            const request = {
                'product_type': 'flexi_saving',
                'subject_type': 'flexi_saving',
            };
            const response = await this.balancePlusGetAppHomepage(this.extend(request, params));
            return this.parseBalancePlusBalance(response);
        }
        else if (type === 'staking') {
            const request = {
                'status_category': 1,
                'offset': 0,
                'limit': 100,
            };
            const response = await this.stakingGetOrders(this.extend(request, params));
            return this.parseStakingBalance(response);
        }
        const response = await this.walletGetBalance(params);
        return this.parseBalance(response);
    }
    /**
     * @method
     * @name matrixport#createOrder
     * @description create a trade order via RFQ (Request for Quote)
     * @see https://www.bit.com/docs/en-us/trade.html
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'market' (RFQ-based exchange)
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] not used for RFQ orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const sideValue = (side === 'buy') ? 0 : 1;
        // RFQ flow: caller must provide 'price_id' from a prior fetchTicker/rfq-price call
        const priceId = this.safeString(params, 'price_id');
        if (priceId === undefined) {
            throw new ArgumentsRequired(this.id + ' createOrder() requires a price_id parameter from a prior rfq-price quote');
        }
        const clientOrderId = this.safeString(params, 'client_order_id', this.uuid());
        const request = {
            'symbol': market['id'],
            'side': sideValue,
            'qty': this.amountToPrecision(symbol, amount),
            'price_id': priceId,
            'client_order_id': clientOrderId,
        };
        params = this.omit(params, ['price_id', 'client_order_id']);
        const response = await this.tradePostRfqPlace(this.extend(request, params));
        //
        // { "code": "0", "data": { "order_id": "...", "client_order_id": "...",
        //   "status": ..., "filled_price": "...", "filled_qty": "...", "filled_cash": "..." } }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    parseOrder(order, market = undefined) {
        //
        // { "order_id": "...", "client_order_id": "...", "create_ts": ...,
        //   "status": 3, "filled_price": "...", "filled_qty": "...", "filled_cash": "..." }
        //
        const id = this.safeString(order, 'order_id');
        const clientOrderId = this.safeString(order, 'client_order_id');
        const symbolId = this.safeString(order, 'symbol');
        market = this.safeMarket(symbolId, market);
        const timestamp = this.safeInteger(order, 'create_ts');
        const sideValue = this.safeInteger(order, 'side');
        let side = undefined;
        if (sideValue === 0) {
            side = 'buy';
        }
        else if (sideValue === 1) {
            side = 'sell';
        }
        const statusCode = this.safeString(order, 'status');
        const status = this.parseOrderStatus(statusCode);
        return this.safeOrder({
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': market['symbol'],
            'type': 'market',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeString(order, 'filled_price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': this.safeString2(order, 'qty', 'filled_qty'),
            'cost': this.safeString(order, 'filled_cash'),
            'average': this.safeString(order, 'filled_price'),
            'filled': this.safeString(order, 'filled_qty'),
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            '101': 'open',
            '2': 'closed',
            '3': 'closed',
            '5': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name matrixport#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.bit.com/docs/en-us/trade.html
     * @param {string} id the order id
     * @param {string} symbol not used by matrixport fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'order_id': id,
        };
        const response = await this.tradeGetOrder(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data);
    }
    /**
     * @method
     * @name matrixport#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://www.bit.com/docs/en-us/trade.html
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        // start_time and end_time are required by the API
        const now = this.milliseconds();
        if (since !== undefined) {
            request['start_time'] = since;
        }
        else {
            // default to 30 days ago
            request['start_time'] = now - 30 * 24 * 60 * 60 * 1000;
        }
        if (this.safeInteger(params, 'end_time') === undefined) {
            request['end_time'] = now;
        }
        const response = await this.tradeGetOrders(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name matrixport#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const chain = this.safeString(params, 'chain');
        if (chain === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchDepositAddress() requires a chain parameter, e.g. { chain: "ERC20" }');
        }
        const request = {
            'currency': currency['id'],
            'chain': chain,
        };
        params = this.omit(params, ['chain']);
        const response = await this.walletGetDepositAddress(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        return this.parseDepositAddress(data, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        // { "address": "13KiFZsCgvJmQ3Cx2PNXpHpjoQMrQPsxkC", "tag": "" }
        //
        const address = this.safeString(depositAddress, 'address');
        const tag = this.safeString(depositAddress, 'tag');
        const currencyId = this.safeString(depositAddress, 'currency');
        return {
            'info': depositAddress,
            'currency': this.safeCurrencyCode(currencyId, currency),
            'network': undefined,
            'address': address,
            'tag': (tag !== undefined && tag.length > 0) ? tag : undefined,
        };
    }
    /**
     * @method
     * @name matrixport#withdraw
     * @description make a withdrawal
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag] a memo/tag for the withdrawal
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        const chain = this.safeString(params, 'chain');
        if (chain === undefined) {
            throw new ArgumentsRequired(this.id + ' withdraw() requires a chain parameter, e.g. { chain: "ERC20" }');
        }
        const request = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
            'address': address,
            'chain': chain,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        params = this.omit(params, ['chain']);
        const response = await this.walletPostWithdraw(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        return this.parseTransaction(data, currency);
    }
    parseTransaction(transaction, currency = undefined) {
        const id = this.safeString2(transaction, 'withdrawal_id', 'deposit_id');
        const txid = this.safeString(transaction, 'tx_id');
        const currencyId = this.safeString(transaction, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        const timestamp = this.safeInteger(transaction, 'created_at');
        const amount = this.safeNumber(transaction, 'amount');
        const status = this.parseTransactionStatus(this.safeString(transaction, 'status'));
        const address = this.safeString(transaction, 'address');
        const tag = this.safeString(transaction, 'memo');
        const fee = this.safeNumber(transaction, 'fee');
        const type = this.safeString(transaction, 'type');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': this.safeString(transaction, 'chain'),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': {
                'currency': code,
                'cost': fee,
                'rate': undefined,
            },
        };
    }
    parseTransactionStatus(status) {
        const statuses = {
            'completed': 'ok',
            'pending': 'pending',
            'failed': 'failed',
            'cancelled': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name matrixport#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchDeposits() requires a code argument');
        }
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.walletGetDeposits(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit, { 'type': 'deposit' });
    }
    /**
     * @method
     * @name matrixport#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchWithdrawals() requires a code argument');
        }
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.walletGetWithdrawals(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit, { 'type': 'withdrawal' });
    }
    /**
     * @method
     * @name matrixport#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.bit.com/docs/en-us/wallet.html
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-structure}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        const response = await this.walletGetBills(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseLedger(data, currency, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        const id = this.safeString(item, 'bill_id');
        const currencyId = this.safeString(item, 'currency');
        const code = this.safeCurrencyCode(currencyId, currency);
        const amount = this.safeNumber(item, 'amount');
        const timestamp = this.safeInteger(item, 'created_at');
        const type = this.safeString(item, 'tx_type');
        const balanceAfter = this.safeNumber(item, 'balance');
        return this.safeLedgerEntry({
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'direction': undefined,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': balanceAfter,
            'status': 'ok',
            'fee': undefined,
        }, currency);
    }
    sign(path, api = 'wallet', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const baseUrl = this.urls['api'][api];
        const implodedPath = this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        this.checkRequiredCredentials();
        const timestamp = this.milliseconds().toString();
        // build the signing path by stripping the hostname from the base URL
        // e.g. 'https://mapi.matrixport.com/mapi/v1/wallet' -> '/mapi/v1/wallet'
        const protocolEnd = baseUrl.indexOf('://');
        const hostEnd = baseUrl.indexOf('/', protocolEnd + 3);
        const basePath = (hostEnd >= 0) ? baseUrl.slice(hostEnd) : '';
        const urlPath = basePath + '/' + implodedPath;
        let url = baseUrl + '/' + implodedPath;
        // V2 auth (headers) for wallet/trade/dcp/dcpV2; V1 auth (query params) for all other APIs
        const useV2 = (api === 'wallet') || (api === 'trade') || (api === 'dcp') || (api === 'dcpV2');
        if (!useV2) {
            // V1 auth: signature and timestamp as query params (GET) or body fields (POST)
            // prehash: api_path + '&' + sorted_params (including timestamp)
            query['timestamp'] = timestamp;
            const sortedParams = this.urlencode(this.keysort(query));
            const auth = urlPath + '&' + sortedParams;
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256);
            headers = {
                'X-MatrixPort-Access-Key': this.apiKey,
            };
            if (method === 'GET') {
                url += '?' + sortedParams + '&signature=' + signature;
            }
            else {
                query['signature'] = signature;
                body = this.json(query);
                headers['Content-Type'] = 'application/json';
            }
        }
        else {
            // V2 auth: signature in headers
            // prehash: timestamp + METHOD + /api/path + '&' + body
            let bodyStr = '';
            if (method === 'GET') {
                if (Object.keys(query).length) {
                    const queryString = this.urlencode(query);
                    url += '?' + queryString;
                    bodyStr = queryString;
                }
            }
            else {
                if (Object.keys(query).length) {
                    body = this.json(query);
                    bodyStr = body;
                }
            }
            const auth = timestamp + method + urlPath + '&' + bodyStr;
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256);
            headers = {
                'X-MatrixPort-Access-Key': this.apiKey,
                'X-Signature': signature,
                'X-Timestamp': timestamp,
                'X-Auth-Version': 'v2',
            };
            if (method !== 'GET') {
                headers['Content-Type'] = 'application/json';
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const code = this.safeString(response, 'code');
        if (code !== undefined && code !== '0') {
            const message = this.safeString(response, 'message', '');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new ExchangeError(feedback);
        }
        return undefined;
    }
}
