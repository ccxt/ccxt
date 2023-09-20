import Exchange from './abstract/lnmarkets.js';
import { DECIMAL_PLACES, TRUNCATE } from './base/functions/number.js';
import { ArgumentsRequired, BadRequest, BadSymbol, InvalidAddress, InvalidOrder } from './base/errors.js';
import { OrderSide, OrderType } from './base/types.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';

export default class lnmarkets extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lnmarkets',
            'name': 'LN Markets',
            'countries': [ 'FR' ],
            'urls': {
                'api': 'https://api.lnmarkets.com',
                'www': 'https://lnmarkets.com',
                'doc': 'https://docs.lnmarkets.com',
                'test': 'https://api.testnet.lnmarkets.com',
                'status': 'https://status.lnmarkets.com',
            },
            'version': 'v2',
            'api': {
                'public': {
                    'get': [
                        'app/configuration',
                        'app/markets',
                        'futures/market',
                        'futures/ticker',
                        'options/instruments',
                        'options/market',
                        'options/volatility',
                    ],
                },
                'private': {
                    'get': [
                        'futures',
                        'futures/trades/{id}',
                        'options',
                        'options/trades/{id}',
                        'user/bitcoin/address',
                        'user',
                        'user/deposit',
                        'user/deposit/{id}',
                        'user/withdraw',
                        'user/withdrawals/{id}',
                    ],
                    'post': [
                        'futures',
                        'futures/add-margin',
                        'options',
                        'user/deposit',
                        'user/withdraw',
                        'user/bitcoin/address',
                        'user/transfer',
                    ],
                    'put': [
                        'futures',
                        'options',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': true,
                'swap': true,
                'future': false,
                'option': true,
                'createDepositAddress': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTrades': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
            },
            'rateLimit': 500,
            'precisionMode': DECIMAL_PLACES,
        });
    }

    async addMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name lnmarkets#addMargin
         * @description Adds margin to a futures position
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-addMarginToTrade
         * @param {string} symbol - The symbol of the position to add margin to
         * @param {number} amount - The amount of margin to add
         * @param {object} params - Additional parameters
         * @param {string} params.id - The id of the position to add margin to. Mandatory.
         * @returns {Promise<object>} A margin structure
         */
        await this.loadMarkets ();
        if (symbol !== 'BTC/USD:BTC') {
            throw new BadSymbol ('Only BTC/USD:BTC is supported');
        }
        if (!params['id']) {
            throw new ArgumentsRequired ('id must be provided');
        }
        const request = {
            'id': params['id'],
            'amount': this.costToPrecision (symbol, amount),
        };
        const response = await this.privatePostFuturesAddMargin (request);
        return this.parseMargin (response, amount);
    }

    amountAndInvoiceMatch (amount: number, invoice: string) {
        /**
         * @description Checks if the amount and invoice match
         * @param {number} amount - The amount in satoshis
         * @param {string} invoice - The invoice to check
         * @returns {boolean} True if the amount and invoice match, false otherwise
         */
        const scale = this.parseNumber (this.currencies['BTC']['precision']);
        const multipliers = {
            'm': 3,
            'u': 6,
            'n': 9,
            'p': 12,
        };
        const pattern = /^(lnbc|lntb|lntbs|lnbcrt)(\d+)([munp])1/;
        const matches = invoice.match (pattern);
        if (matches === null) {
            return false;
        }
        const invoiceAmount = this.parseNumber (matches[2]);
        const invoiceMultiplier = this.parseNumber (multipliers[matches[3]]);
        return amount === invoiceAmount * Math.pow (10, scale - invoiceMultiplier);
    }

    async createDepositAddress (code = 'BTC', params = {}) {
        /**
         * @method
         * @name lnmarkets#createDepositAddress
         * @description Creates a new deposit address
         * @see https://docs.lnmarkets.com/api/v2#tag/Wallet/operation/wallet-deposit
         * @see https://docs.lnmarkets.com/api/v2#tag/Wallet/operation/wallet-createBitcoinAddress
         * @param {string} code - The currency code of the deposit address to create. Will always be "BTC".
         * @param {object} params - Additional parameters
         * @param {string} params.network - The network to create the deposit address on. Can be either "lightning" or "bitcoin". Defaults to "lightning".
         * @param {number} params.amount - The amount to deposit. Mandatory for lightning deposits.
         * @param {string} [params.format] - The address format to use for bitcoin deposits. Can be either "p2wpkh" or "p2tr". Defaults to "p2wpkh".
         * @returns {Promise<object>} An address structure
         * @throws {BadRequest} If the network is not "lightning" or "bitcoin"
         * @throws {ArgumentsRequired} If the amount is not provided for lightning deposits
         * @throws {BadRequest} If the format is not "p2wpkh" or "p2tr" for on-chain (bitcoin) deposits
         */
        await this.loadMarkets ();
        const network = this.safeString (params, 'network', 'lightning');
        if (network === 'lightning') {
            const amount = this.safeNumber (params, 'amount');
            if (!amount) {
                throw new ArgumentsRequired ('Missing amount parameter');
            }
            params['amount'] = this.currencyToPrecision ('BTC', amount);
            const response = await this.privatePostUserDeposit (params);
            return {
                'currency': 'BTC',
                'network': [ 'lightning' ],
                'address': response.paymentRequest,
                'tag': response.depositId,
                'info': response,
            };
        } else if (network === 'bitcoin') {
            const format = this.safeString (params, 'format', 'p2wpkh');
            if (format !== 'p2wpkh' && format !== 'p2tr') {
                throw new BadRequest ('Only p2wpkh and p2tr address formats are supported');
            }
            const response = await this.privatePostUserBitcoinAddress ({ format });
            return {
                'currency': 'BTC',
                'network': [ 'bitcoin' ],
                'address': response.address,
                'tag': undefined,
                'info': response,
            };
        } else {
            throw new BadRequest ('Network must be either "lightning" or "bitcoin"');
        }
    }

    async createFuturesOrder (type: OrderType, side: OrderSide, leverage, amount = undefined, margin = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#createFuturesOrder
         * @description Creates a new swap order
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-newTrade
         * @param {string} type - The type of the order. Can be either "limit" or "market".
         * @param {string} side - The side of the order. Can be either "buy" or "sell".
         * @param {number} leverage - The leverage of the order. Mandatory.
         * @param {number} amount - The amount of the order. Either amount or margin must be provided.
         * @param {number} margin - The margin of the order. Either amount or margin must be provided.
         * @param {number} price - The price of the order. Mandatory for limit orders.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object>} An order structure
         * @throws {ArgumentsRequired} If the leverage is not provided
         * @throws {ArgumentsRequired} If neither amount nor margin are provided
         */
        if (!leverage) {
            throw new ArgumentsRequired ('Leverage must be provided');
        }
        if (!amount && !margin) {
            throw new ArgumentsRequired ('Either amount or margin must be provided');
        }
        const safeAmount = amount ? this.amountToPrecision ('BTC/USD:BTC', amount) : undefined;
        const safeLeverage = leverage ? this.parseNumber (leverage) : undefined;
        const safeMargin = margin ? this.costToPrecision ('BTC/USD:BTC', margin) : undefined;
        const safePrice = price ? this.priceToPrecision ('BTC/USD:BTC', price) : undefined;
        const request = {
            'type': type === 'limit' ? 'l' : 'm',
            'side': side === 'buy' ? 'b' : 's',
            'quantity': safeAmount,
            'leverage': safeLeverage,
            'margin': safeMargin,
            'price': safePrice,
        };
        const response = await this.privatePostFutures (this.extend (request, params));
        return this.parseOrder (response, 'BTC/USD:BTC');
    }

    async createOptionsOrder (symbol: string, amount, settlement = 'cash', params = {}) {
        /**
         * @method
         * @name lnmarkets#createOptionsOrder
         * @description Creates a new options order
         * @see https://docs.lnmarkets.com/api/v2#tag/Options/operation/options-newTrade
         * @param {string} symbol - The symbol of the order to create.
         * @param {number} amount - The amount of the order. Mandatory.
         * @param {string} [settlement] - The settlement of the order. Can be either "cash" or "physical". Defaults to "cash".
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object>} An order structure
         * @throws {InvalidOrder} If the settlement is not "cash" or "physical"
         */
        if (settlement !== 'cash' && settlement !== 'physical') {
            throw new InvalidOrder ('Only cash and physical settlements are supported');
        }
        const request = {
            'side': 'b',
            'quantity': amount,
            'instrument_name': this.parseInstrumentName (symbol),
        };
        const response = await this.privatePostOptions (this.extend (request, params));
        return this.parseOrder (response, symbol);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#createOrder
         * @description Creates a new order
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-newTrade
         * @see https://docs.lnmarkets.com/api/v2#tag/Options/operation/options-newTrade
         * @param {string} symbol - The symbol of the order to create.
         * @param {string} type - The type of the order. Can be either "limit" or "market".
         * @param {string} side - The side of the order. Can be either "buy" or "sell".
         * @param {number} amount - The amount of the order.
         * @param {number} price - The price of the order. Mandatory for limit orders.
         * @param {object} [params] - Additional parameters
         * @param {number} [params.leverage] - The leverage of the order. Mandatory for futures orders.
         * @param {number} [params.margin] - The margin of the order. Mandatory for futures orders if amount is not provided.
         * @param {string} [params.settlement] - The settlement for options orders. Can be either "cash" or "physical".
         * @returns {Promise<object>} An order structure
         * @throws {BadSymbol} If the symbol is not supported
         */
        await this.loadMarkets ();
        if (!this.symbols.includes (symbol)) {
            throw new BadSymbol ('Symbol ' + symbol + ' is not supported');
        }
        if (symbol === 'BTC/USD:BTC') {
            return this.createFuturesOrder (type, side, params['leverage'], amount, params['margin'], price, params);
        } else {
            return this.createOptionsOrder (symbol, amount, params['settlement'], params);
        }
    }

    // for some reason the super method users price precision instead of cost precision
    costToPrecision (symbol: string, cost: number) {
        /**
         * @method
         * @name lnmarkets#costToPrecision
         * @description Converts a cost from bitcoins to satoshis, with the correct precision
         * @param {string} symbol - The symbol of the cost to convert.
         * @param {number} cost - The cost to convert.
         * @returns {number} The converted cost
         * @example costToPrecision ('BTC/USD:BTC', 0.0001) // 10000
         */
        const market = this.market (symbol);
        const decimalCost = this.decimalToPrecision (cost, TRUNCATE, market['precision']['cost'], this.precisionMode, this.paddingMode);
        return decimalCost * Math.pow (10, this.markets[symbol]['precision']['cost']);
    }

    currencyToPrecision (code: string, fee, networkCode = undefined) {
        /**
         * @method
         * @name lnmarkets#currencyToPrecision
         * @description Converts a currency amount from bitcoins to satoshis, with the correct precision
         * @param {string} code - The currency code of the amount to convert.
         * @param {number} fee - The amount to convert.
         * @param {string} [networkCode] - The network code of the amount to convert.
         * @returns {number} The converted amount
         * @example currencyToPrecision ('BTC', 0.0001) // 10000
         */
        const decimalAmount = super.currencyToPrecision (code, fee, networkCode);
        const scale = this.safeNumber (this.currencies[code], 'precision');
        return parseInt (this.numberToString (decimalAmount * Math.pow (10, scale)));
    }

    async editOrder (id: string, symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#editOrder
         * @description Edits an order
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-updateTrade
         * @see https://docs.lnmarkets.com/api/v2#tag/Options/operation/options-updateTrade
         * @param {string} id - The id of the order to edit.
         * @param {string} symbol - The symbol of the order to edit.
         * @param {string} [type] - The type of the order. Not actually used.
         * @param {string} [side] - The side of the order. Not actually used.
         * @param {number} [amount] - The amount of the order. Not actually used.
         * @param {number} [price] - The price of the order. Not actually used.
         * @param {object} params - Additional parameters
         * @param {string} params.type - Mandatory. The parameter to edit. Can be either "stopLoss" or "takeProfit" for swaps, or "settlement" for options.
         * @param {number} params.value - Mandatory. The new value of the edited parameter.
         * @returns {Promise<object>} An order structure
         * @throws {BadSymbol} If the symbol is not supported
         * @throws {BadRequest} If the type is not "stopLoss", "takeProfit" or "settlement"
         * @throws {ArgumentsRequired} If the new value is not provided
         * @throws {BadRequest} If trying to change settlement value to something else than "cash" or "physical"
         */
        await this.loadMarkets ();
        if (!this.symbols.includes (symbol)) {
            throw new BadSymbol ('Symbol ' + symbol + ' is not supported');
        }
        // in swaps we can edit takeProfit and stopLoss
        if (symbol === 'BTC/USD:BTC') {
            if (params['type'] !== 'stopLoss' && params['type'] !== 'takeProfit') {
                throw new BadRequest ('Can only change stopLoss and takeProfit');
            }
            if (!params['value']) {
                throw new ArgumentsRequired ('Value must be provided');
            }
            const request = {
                id,
                'type': this.unCamelCase (params['type']),
                'value': this.parseNumber (params['value']),
            };
            const response = await this.privatePutFutures (request);
            return this.parseOrder (response, symbol);
        // in options we can only edit the settlement
        } else {
            if (params['type'] !== 'settlement') {
                throw new BadRequest ('Can only change settlement');
            }
            if (params['value'] !== 'cash' && params['value'] !== 'physical') {
                throw new BadRequest ('Only cash and physical settlements are supported');
            }
            const request = {
                id,
                'type': 'settlement',
                'value': params['value'],
            };
            const response = await this.privatePutOptions (request);
            return this.parseOrder (response, symbol);
        }
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchBalance
         * @description Fetches the user's balances
         * @see https://docs.lnmarkets.com/api/v2#tag/User/operation/user-fetch
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object>} A balance structure
         */
        await this.loadMarkets ();
        const response = await this.privateGetUser (params);
        const now = this.now ();
        const { 'balance': balanceString, synthetic_usd_balance, metrics } = response;
        const balance = this.parseNumber (balanceString, 0);
        const usedMargin = this.parseNumber (metrics['futures']['running_margin'], 0)
            + this.parseNumber (metrics['futures']['open_margin'], 0)
            + this.parseNumber (metrics['options']['call']['running_margin'], 0)
            + this.parseNumber (metrics['options']['put']['running_margin'], 0);
        return this.safeBalance ({
            'info': response,
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'total': {
                'BTC': this.precisionToCurrency ('BTC', balance + usedMargin),
                'USD': this.precisionToCurrency ('USD', synthetic_usd_balance),
            },
            'free': {
                'BTC': this.precisionToCurrency ('BTC', balance),
                'USD': this.precisionToCurrency ('USD', synthetic_usd_balance),
            },
            'used': {
                'BTC': this.precisionToCurrency ('BTC', usedMargin),
                'USD': 0,
            },
            'BTC': {
                'total': this.precisionToCurrency ('BTC', balance + usedMargin),
                'free': this.precisionToCurrency ('BTC', balance),
                'used': this.precisionToCurrency ('BTC', usedMargin),
            },
            'USD': {
                'total': this.precisionToCurrency ('USD', synthetic_usd_balance),
                'free': this.precisionToCurrency ('USD', synthetic_usd_balance),
                'used': 0,
            },
        });
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchClosedOrders
         * @description Fetches the user's closed orders
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-getTrades
         * @see https://docs.lnmarkets.com/api/v2#tag/Options/operation/options-getTrades
         * @param {string} [symbol] - The symbol of the orders to fetch. Fetches everything if not provided.
         * @param {number} [since] - The timestamp of the first order to fetch.
         * @param {number} [limit] - The maximum number of orders to fetch.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object[]>} An array of order structures
         */
        await this.loadMarkets ();
        const baseRequest = this.extend ({
            'from': since,
            limit,
        }, params);
        const orders = [];
        if (symbol === 'BTC/USD:BTC' || symbol === undefined) {
            const futuresClosedOrders = await this.privateGetFutures (this.extend (baseRequest, { 'type': 'closed' }));
            for (let i = 0; i < futuresClosedOrders.length; i++) {
                const order = futuresClosedOrders[i];
                orders.push (this.parseOrder (order, symbol, 'closed'));
            }
        }
        if (symbol !== 'BTC/USD:BTC' || symbol === undefined) {
            const optionsClosedOrders = await this.privateGetOptions (this.extend (baseRequest, { 'status': 'closed' }));
            for (let j = 0; j < optionsClosedOrders.length; j++) {
                const order = optionsClosedOrders[j];
                if (symbol !== undefined) {
                    if (symbol === this.optionToSymbol (order['expiry_ts'], order['strike'], order['type'])) {
                        orders.push (this.parseOrder (order, symbol, 'closed'));
                    }
                } else {
                    orders.push (this.parseOrder (order, symbol, 'closed'));
                }
            }
        }
        // return orders.sort ((a, b) => b['timestamp'] - a['timestamp']);
        return orders.sort ((a, b) => a['timestamp'] - b['timestamp']);
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchCurrencies
         * @description Fetches the list of supported currencies
         * @see https://docs.lnmarkets.com/api/v2#tag/App/operation/app-getConfiguration
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object>} An associative array of currency structures
         */
        const unparsedLimits = await this.publicGetAppConfiguration ();
        const limits = this.parseLimits (unparsedLimits);
        return {
            'BTC': {
                'id': 'BTC',
                'code': 'BTC',
                'name': 'Bitcoin',
                'active': true,
                'fee': undefined,
                'precision': 8,
                'deposit': true,
                'withdraw': true,
                'limits': limits,
                'networks': {
                    'BTC': {
                        'id': 'bitcoin',
                        'network': 'BTC',
                        'name': 'Bitcoin Network',
                        'active': true,
                        'fee': undefined,
                        'precision': 8,
                        'deposit': true,
                        'withdraw': false,
                        'limits': limits,
                        'info': 'on-chain',
                    },
                    'LN': {
                        'id': 'lightning',
                        'network': 'LN',
                        'name': 'Lightning Network',
                        'active': true,
                        'fee': undefined,
                        'precision': 8,
                        'deposit': true,
                        'withdraw': true,
                        'limits': limits,
                        'info': 'lightning',
                    },
                },
                'info': unparsedLimits,
            },
            'USD': {
                'id': 'USD',
                'code': 'USD',
                'name': 'US Dollar',
                'active': true,
                'fee': undefined,
                'precision': 2,
                'deposit': false,
                'withdraw': false,
                'limits': {},
                'info': {},
                'networks': {},
            },
        };
    }

    async fetchDeposit (id: string, code = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchDeposit
         * @description Fetches a deposit
         * @param {string} id - The id of the deposit to fetch.
         * @param {string} [code] - The currency code of the deposit to fetch. Unused as only BTC is supported.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object>} A transaction structure
         */
        await this.loadMarkets ();
        const response = await this.privateGetUserDepositId ({ 'id': id });
        return this.parseTransaction (response, undefined);
    }

    async fetchDepositAddress (code = 'BTC', params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchDepositAddress
         * @description Fetches a deposit address
         * @see https://docs.lnmarkets.com/api/v2#tag/Wallet/operation/wallet-fetchBitcoinAddress
         * @param {string} [code] - The currency code of the deposit address to fetch. Will always be "BTC".
         * @param {object} [params] - Additional parameters
         * @param {string} [params.network] - The network of the deposit address to fetch. Can be either "lightning" or "bitcoin". Defaults to "lightning".
         * @returns {Promise<object>} An address structure
         * @throws {BadRequest} If the network is not "lightning" or "bitcoin"
         */
        await this.loadMarkets ();
        const network = this.safeString (params, 'network', 'lightning');
        if (network === 'lightning') {
            return this.createDepositAddress (code, params);
        } else if (network === 'bitcoin') {
            const currentAddressResponse = await this.privateGetUserBitcoinAddress ({ 'current': true });
            const address = currentAddressResponse.address;
            if (!address) {
                return this.createDepositAddress (code, params);
            } else {
                return {
                    'currency': 'BTC',
                    'network': [ 'bitcoin' ],
                    address,
                    'tag': undefined,
                    'info': currentAddressResponse,
                };
            }
        } else {
            throw new BadRequest ('Network must be either "lightning" or "bitcoin"');
        }
    }

    async fetchDeposits (code?: string, since?: number, limit?: number, params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchDeposits
         * @description Fetches the user's deposits
         * @see https://docs.lnmarkets.com/api/v2#tag/Wallet/operation/wallet-fetchDeposit
         * @param {string} [code] - The currency code of the deposits to fetch. Unused as only BTC is supported.
         * @param {number} [since] - The timestamp of the first deposit to fetch.
         * @param {number} [limit] - The maximum number of deposits to fetch.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object[]>} An array of transaction structures
         */
        await this.loadMarkets ();
        // todo: fetch by type or filter to remove transfers
        const response = await this.privateGetUserDeposit (params);
        const deposits = [];
        for (let i = 0; i < response.length; i++) {
            const deposit = response[i];
            deposits.push (this.parseTransaction (deposit, undefined));
        }
        return deposits.sort ((a, b) => a['timestamp'] - b['timestamp']);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchMarkets
         * @description Fetches the list of supported markets
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-getMarket
         * @see https://docs.lnmarkets.com/api/v2#tag/Options/operation/options-getMarket
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object[]>} An array of market structures
         */
        const markets = [];
        const swapMarket = {
            'id': 'btc_usd',
            'symbol': 'BTC/USD:BTC',
            'base': 'BTC',
            'baseId': 'BTC',
            'quote': 'USD',
            'quoteId': 'USD',
            'type': 'swap',
            'spot': false,
            'future': false,
            'swap': true,
            'option': false,
            'contract': true,
            'settle': 'BTC',
            'settleId': 'BTC',
            'contractSize': 1,
            'linear': false,
            'inverse': true,
            'tierBased': true,
            'percentage': true,
            'limits': {},
            'precision': {
                'amount': 0,
                'cost': 8,
                'price': 0,
            },
        };
        const swapMarketDetails = await this.publicGetFuturesMarket ();
        swapMarket['info'] = swapMarketDetails;
        swapMarket['taker'] = this.parseNumber (swapMarketDetails['fees']['trading']['tiers'][0]['fees']);
        swapMarket['maker'] = this.parseNumber (swapMarketDetails['fees']['trading']['tiers'][0]['fees']);
        swapMarket['limits']['cost'] = swapMarketDetails['limits']['margin'];
        swapMarket['active'] = swapMarketDetails['active'];
        markets.push (this.safeMarket ('btc_usd', swapMarket));
        const optionMarketTemplate = {
            'base': 'BTC',
            'baseId': 'BTC',
            'quote': 'USD',
            'quoteId': 'USD',
            'type': 'option',
            'spot': false,
            // 'margin': true,
            'future': false,
            'swap': false,
            'option': true,
            'contract': true,
            'settle': 'BTC',
            'settleId': 'BTC',
            'contractSize': 1,
            'linear': false,
            'inverse': true,
            'percentage': true,
            'tierBased': false,
            'limits': {},
            'precision': {
                'amount': 0,
                'cost': 8,
                'price': 0,
            },
        };
        const optionMarketDetails = await this.publicGetOptionsMarket ();
        optionMarketTemplate['info'] = optionMarketDetails;
        optionMarketTemplate['taker'] = this.parseNumber (optionMarketDetails['fees']['trading']);
        optionMarketTemplate['maker'] = this.parseNumber (optionMarketDetails['fees']['trading']);
        optionMarketTemplate['limits']['amount'] = optionMarketDetails['limits']['quantity'];
        optionMarketTemplate['limits']['cost'] = optionMarketDetails['limits']['margin'];
        optionMarketTemplate['active'] = optionMarketDetails['active'];
        const optionsInstruments = await this.publicGetOptionsInstruments ();
        for (let i = 0; i < optionsInstruments.length; i++) {
            const optionInstrument = optionsInstruments[i];
            const optionMarket = { ...optionMarketTemplate };
            optionMarket['id'] = optionInstrument;
            optionMarket['symbol'] = this.parseSymbol (optionInstrument);
            optionMarket['expiryDatetime'] = this.parseOptionsExpiryDate (optionInstrument);
            optionMarket['expiry'] = this.parse8601 (optionMarket['expiryDatetime']);
            optionMarket['strike'] = this.parseStrike (optionInstrument);
            optionMarket['optionType'] = this.parseOptionType (optionInstrument);
            markets.push (this.safeMarket (optionInstrument, optionMarket));
        }
        return markets;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchOpenOrders
         * @description Fetches the user's open orders (both open limit orders and running orders)
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-getTrades
         * @see https://docs.lnmarkets.com/api/v2#tag/Options/operation/options-getTrades
         * @param {string} [symbol] - The symbol of the orders to fetch. Fetches everything if not provided.
         * @param {number} [since] - The timestamp of the first order to fetch.
         * @param {number} [limit] - The maximum number of orders to fetch.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object[]>} An array of order structures
         */
        await this.loadMarkets ();
        const baseRequest = this.extend ({
            'from': since,
            limit,
        }, params);
        const orders = [];
        if (symbol === 'BTC/USD:BTC' || symbol === undefined) {
            const futuresOpenOrders = await this.privateGetFutures (this.extend (baseRequest, { 'type': 'open' }));
            const futuresRunningOrders = await this.privateGetFutures (this.extend (baseRequest, { 'type': 'running' }));
            const futuresOrders = this.arrayConcat (futuresOpenOrders, futuresRunningOrders);
            for (let i = 0; i < futuresOrders.length; i++) {
                const order = futuresOrders[i];
                orders.push (this.parseOrder (order, symbol, 'open'));
            }
        }
        if (symbol !== 'BTC/USD:BTC' || symbol === undefined) {
            const optionsRunningOrders = await this.privateGetOptions (this.extend (baseRequest, { 'type': 'running' }));
            for (let j = 0; j < optionsRunningOrders.length; j++) {
                const order = optionsRunningOrders[j];
                orders.push (this.parseOrder (order, symbol, 'open'));
            }
        }
        return orders.sort ((a, b) => a['timestamp'] - b['timestamp']);
    }

    async fetchOrder (id: string, symbol = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchOrder
         * @description Fetches an order
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-getTrade
         * @see https://docs.lnmarkets.com/api/v2#tag/Options/operation/options-getTrade
         * @param {string} id - The id of the order to fetch.
         * @param {string} symbol - The symbol of the order to fetch. Mandatory.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object>} An order structure
         * @throws {ArgumentsRequired} If the symbol is not provided
         */
        await this.loadMarkets ();
        if (!symbol) {
            throw new ArgumentsRequired ('Symbol must be provided');
        }
        const response = symbol === 'BTC/USD:BTC'
            ? await this.privateGetFuturesTradesId ({ 'id': id })
            : await this.privateGetOptionsTradesId ({ 'id': id });
        return this.parseOrder (response, symbol);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchOrders
         * @description Fetches the user's orders
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-getTrades
         * @see https://docs.lnmarkets.com/api/v2#tag/Options/operation/options-getTrades
         * @param {string} [symbol] - The symbol of the orders to fetch. Fetches everything if not provided.
         * @param {number} [since] - The timestamp of the first order to fetch.
         * @param {number} [limit] - The maximum number of orders to fetch.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object[]>} An array of order structures
         */
        await this.loadMarkets ();
        const openOrders = await this.fetchOpenOrders (symbol, since, limit, params);
        const closedOrders = await this.fetchClosedOrders (symbol, since, limit, params);
        const orders = this.arrayConcat (openOrders, closedOrders);
        return orders.sort ((a, b) => a['timestamp'] - b['timestamp']);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchPositions
         * @description Fetches the user's positions
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-getTrades
         * @see https://docs.lnmarkets.com/api/v2#tag/Options/operation/options-getTrades
         * @param {string[]} [symbols] - The symbols of the positions to fetch. Defaults to ["BTC/USD:BTC"].
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object[]>} An array of position structures
         */
        await this.loadMarkets ();
        if (symbols === undefined || symbols.length === 0 || !this.isArray (symbols)) {
            symbols = [ 'BTC/USD:BTC' ];
        }
        if (Object.keys (params).length === 0) {
            params['type'] = 'running';
        }
        const positions = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            if (symbol === 'BTC/USD:BTC') {
                const response = await this.privateGetFutures (params);
                for (let j = 0; j < response.length; j++) {
                    const position = response[j];
                    positions.push (this.parsePosition (position, 'BTC/USD:BTC'));
                }
            } else {
                const response = await this.privateGetOptions (params);
                for (let j = 0; j < response.length; j++) {
                    const position = response[j];
                    positions.push (this.parsePosition (position, symbol));
                }
            }
        }
        return positions;
    }

    async fetchStatus (params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchStatus
         * @description Emulated status endpoint
         * @see status.lnmarkets.com
         */
        return {
            'status': 'ok',
            'updated': undefined,
            'eta': undefined,
            'url': 'status.lnmarkets.com',
        };
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchTicker
         * @description Fetches a ticker
         * @see https://docs.lnmarkets.com/api/v2#tag/Futures/operation/futures-getTicker
         * @param {string} symbol - The symbol of the ticker to fetch.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object>} A ticker structure
         */
        await this.loadMarkets ();
        if (symbol === 'BTC/USD:BTC') {
            const response = await this.publicGetFuturesTicker ();
            return this.parseTicker (response, symbol);
        } else {
            const instrumentName = this.parseInstrumentName (symbol);
            const response = await this.publicGetOptionsVolatility ({ 'instrument_name': instrumentName });
            return this.parseTicker (response, symbol);
        }
    }

    async fetchWithdrawal (id: string, code = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchWithdrawal
         * @description Fetches a withdrawal
         * @see https://docs.lnmarkets.com/api/v2#tag/Wallet/operation/wallet-fetchWithdrawal
         * @param {string} id - The id of the withdrawal to fetch.
         * @param {string} [code] - The currency code of the withdrawal to fetch. Unused as only BTC is supported.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object>} A transaction structure
         */
        await this.loadMarkets ();
        const response = await this.privateGetUserWithdrawalsId ({ 'id': id });
        return this.parseTransaction (response, undefined);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#fetchWithdrawals
         * @description Fetches multiple withdrawals
         * @see https://docs.lnmarkets.com/api/v2#tag/Wallet/operation/wallet-fetchWithdrawals
         * @param {string} [code] - The currency code of the withdrawals to fetch. Unused as only BTC is supported.
         * @param {number} [since] - The timestamp of the first withdrawal to fetch.
         * @param {number} [limit] - The maximum number of withdrawals to fetch.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object[]>} An array of transaction structures
         */
        await this.loadMarkets ();
        const response = await this.privateGetUserWithdraw (params);
        const withdrawals = [];
        for (let i = 0; i < response.length; i++) {
            const withdrawal = response[i];
            withdrawals.push (this.parseTransaction (withdrawal, undefined));
        }
        return withdrawals.sort ((a, b) => a['timestamp'] - b['timestamp']);
    }

    instrumentNameToSymbol (instrumentName: string) {
        /**
         * @method
         * Utility to convert LN Markets instrument names to CCXT symbols
         * @param {string} instrumentName - The LN Markets instrument name to convert.
         * @returns {string} A CCXT symbol
         * @example instrumentNameToSymbol ('BTC.2021-03-26.50000.C') => 'BTC/USD:BTC-210326-50000-C'
         */
        const [ , expiryDate, strike, type ] = instrumentName.split ('.');
        const [ year, month, day ] = expiryDate.split ('-');
        return 'BTC/USD:BTC-' + year.slice (-2) + month + day + '-' + strike + '-' + type;
    }

    optionToSymbol (expiry_ts: number, strike: number, type: string) {
        /**
         * @method
         * Utility to derive the CCXT symbol from an option's properties
         * @param {number} expiry_ts - The expiry timestamp of the option.
         * @param {number} strike - The strike price of the option.
         * @param {string} type - The type of the option. Can be either "c" or "p".
         * @returns {string} A CCXT symbol
         * @example optionToSymbol (1616745600000, 50000, 'c') => 'BTC/USD:BTC-210326-50000-C'
         */
        const expiry = this.iso8601 (expiry_ts);
        return 'BTC/USD:BTC-' + expiry.slice (2, 4) + expiry.slice (5, 7) + expiry.slice (8, 10) + '-' + strike + '-' + type.toUpperCase ();
    }

    parseInstrumentName (symbol: string) {
        /**
         * @method
         * Utility to convert CCXT symbols to LN Markets instrument names
         * @param {string} symbol - The CCXT symbol to convert.
         * @returns {string} An LN Markets instrument name
         * @example parseInstrumentName ('BTC/USD:BTC-210326-50000-C') => 'BTC.2021-03-26.50000.C'
         */
        const [ , expiryDate, strike, type ] = symbol.split ('-');
        const [ year, month, day ] = expiryDate.match (/.{2}/g);
        const expiry = '20' + year + '-' + month + '-' + day;
        return 'BTC.' + expiry + '.' + strike + '.' + type.toUpperCase ();
    }

    parseLimits (limits) {
        return {
            'amount': undefined,
            'withdraw': {
                'min': limits['min_withdraw_amount'],
                'max': limits['max_withdraw_amount'],
            },
            'deposit': {
                'min': limits['min_deposit_amount'],
                'max': limits['max_deposit_amount'],
            },
        };
    }

    parseMargin (info, addedAmount) {
        return {
            info,
            'type': 'add',
            'amount': addedAmount,
            'total': info['margin'],
            'code': 'USD',
            'symbol': 'BTC/USD:BTC',
            'status': 'ok',
        };
    }

    parseOptionsExpiryDate (instrument: string) {
        // LN Markets offers a 24H option which doesn't expire at a fixed hours each day
        // But expires 24 hours after the creation of the option
        // How should we include that with CCXT's consistent naming?
        const [ , expiryDate ] = instrument.split ('.');
        if (expiryDate === '24H') {
            return this.iso8601 (this.now () + 24 * 60 * 60 * 1000);
        } else {
            return expiryDate + 'T08:00:00.000Z';
        }
    }

    parseOptionType (instrument: string) {
        const [ , , , optionType ] = instrument.split ('.');
        if (optionType === 'C') {
            return 'call';
        } else if (optionType === 'P') {
            return 'put';
        } else {
            throw new BadRequest ('Unknown option type: ' + optionType);
        }
    }

    parseOrder (info, symbol = undefined, status = 'running') {
        /**
         * @method
         * @name lnmarkets#parseOrder
         * @description Utility to parse an order (either swap or option)
         * @param {object} info - The order to parse.
         * @param {string} symbol - The symbol of the order to parse.
         * @param {string} status - The status of the order to parse. Can be either "open", "running" or "closed".
         */
        let timestamp = 0;
        let price = 0;
        let safeSymbol = 'BTC/USD:BTC';
        if (Object.keys (info).includes ('strike')) {
            safeSymbol = this.optionToSymbol (info['expiry_ts'], info['strike'], info['type']);
        }
        if (safeSymbol === 'BTC/USD:BTC') {
            if (status === 'open') {
                timestamp = this.parseNumber (info.creation_ts);
            } else {
                const filled_ts = this.parseNumber (info.market_filled_ts);
                if (filled_ts) {
                    timestamp = filled_ts;
                } else {
                    timestamp = this.parseNumber (info.closed_ts); // cancelled orders
                }
            }
            price = this.safeNumber (info, 'price');
        } else {
            timestamp = this.parseNumber (info.creation_ts);
            price = this.safeNumber (info, 'forward');
        }
        const id = this.safeString (info, 'id');
        const datetime = this.iso8601 (timestamp);
        const type = this.parseType (info.type);
        const side = this.parseSide (info.side);
        const cost = this.precisionToCost (safeSymbol, this.safeNumber (info, 'margin'));
        const fee = {
            'currency': 'BTC',
            'cost': this.precisionToCost (safeSymbol, this.safeNumber (info, 'opening_fee', 0) + this.safeNumber (info, 'closing_fee', 0) + this.safeNumber (info, 'sum_carry_fees', 0)),
            'rate': undefined,
        };
        const amount = this.safeNumber (info, 'quantity');
        return {
            id,
            'clientOrderId': undefined,
            timestamp,
            datetime,
            'lastTradeTimestamp': undefined,
            status,
            'symbol': safeSymbol,
            type,
            'timeInForce': undefined,
            'postOnly': undefined,
            side,
            price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'average': price,
            amount,
            'filled': amount,
            'remaining': 0,
            cost,
            'trades': [ {
                id,
                timestamp,
                datetime,
                'symbol': safeSymbol,
                'order': id,
                type,
                side,
                'takerOrMaker': 'taker',
                price,
                amount,
                cost,
                fee,
                'fees': [ fee ],
                info,
            } ],
            fee,
            info,
        };
    }

    parsePosition (info, symbol = undefined, status = undefined) {
        /**
         * @method
         * @name lnmarkets#parsePosition
         * @description Utility to parse a position (either swap or option)
         * @param {object} info - The position to parse.
         * @param {string} symbol - The symbol of the position to parse.
         * @param {string} status - The status of the position to parse. Can be either "open", "running" or "closed".
         */
        let timestamp = 0;
        let price = 0;
        let safeSymbol = 'BTC/USD:BTC';
        if (Object.keys (info).includes ('strike')) {
            safeSymbol = this.optionToSymbol (info['expiry_ts'], info['strike'], info['type']);
        }
        if (safeSymbol === 'BTC/USD:BTC') {
            timestamp = status === 'open'
                ? this.parseNumber (info.creation_ts)
                : this.parseNumber (info.market_filled_ts);
            price = this.safeNumber (info, 'price');
        } else {
            timestamp = this.parseNumber (info.creation_ts);
            price = this.safeNumber (info, 'forward');
        }
        const datetime = this.iso8601 (timestamp);
        return {
            info,
            'id': this.safeString (info, 'id'),
            'symbol': safeSymbol,
            timestamp,
            datetime,
            'isolated': true,
            'hedged': false,
            'side': this.parsePositionSide (info.side, info.type),
            'contracts': this.safeNumber (info, 'quantity'),
            'contractSize': 1,
            'entryPrice': price,
            'markPrice': price,
            'notional': undefined,
            'leverage': this.safeNumber (info, 'leverage'),
            'initialMargin': this.precisionToCost (safeSymbol, this.safeNumber (info, 'margin')),
            'maintenanceMargin': this.precisionToCost (safeSymbol, this.safeNumber (info, 'maintenance_margin')),
            'initialMarginPercentage': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': this.precisionToCost (safeSymbol, this.safeNumber (info, 'pl')),
            'liquidationPrice': this.safeNumber (info, 'liquidation'),
            'marginMode': 'isolated',
            'percentage': this.safeNumber (info, 'pnl') / this.safeNumber (info, 'margin') * 100,
        };
    }

    parsePositionSide (side: string, type: string) {
        // buy is always long except when buying a put option
        // sell is always short because options aren't sellable yet
        if (side === 'b') {
            if (type === 'p') {
                return 'short';
            } else {
                return 'long';
            }
        } else if (side === 's') {
            return 'short';
        } else {
            throw new BadRequest ('Unknown side: ' + side);
        }
    }

    parseSide (side: string) {
        return side === 'b' ? 'buy' : 'sell';
    }

    parseStrike (instrument: string) {
        /**
         * @method
         * @name lnmarkets#parseStrike
         * @description Utility to parse the strike price of an option from its instrument name
         * @param {string} instrument - The LN Markets instrument name to parse.
         * @returns {number} The strike price
         * @example parseStrike ('BTC.2021-03-26.50000.C') => 50000
         */
        const [ , , strike ] = instrument.split ('.');
        return this.parseNumber (strike);
    }

    parseSymbol (instrument?: string) {
        /**
         * @method
         * @name lnmarkets#parseSymbol
         * @description Utility to convert LN Markets instrument names to CCXT symbols
         * @param {string} [instrument] - The LN Markets instrument name to convert.
         * @returns {string} A CCXT symbol
         * @example parseSymbol ('BTC.2021-03-26.50000.C') => 'BTC/USD:BTC-210326-50000-C'
         */
        if (instrument === undefined || instrument === 'BTC/USD:BTC') {
            return 'BTC/USD:BTC';
        }
        const [ , expiryDate, strike, type ] = instrument.split ('.');
        const [ year, month, day ] = expiryDate.split ('-');
        return 'BTC/USD:BTC-' + year.slice (-2) + month + day + '-' + strike + '-' + type;
    }

    parseTicker (info, symbol: string) {
        const now = this.now ();
        const price = (symbol === 'BTC/USD:BTC')
            ? this.safeNumber (info, 'lastPrice')
            : this.safeNumber (info, 'volatility');
        return {
            symbol,
            info,
            'timestamp': now,
            'datetime': this.iso8601 (now),
            'high': undefined,
            'low': undefined,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': price,
            'last': price,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
        };
    }

    parseTransaction (transaction, currency = undefined) {
        currency = this.safeCurrency (currency, 'BTC');
        const timestamp = this.safeInteger (transaction, 'ts');
        return {
            'info': transaction,
            'id': transaction['id'],
            'txid': this.parseTxId (transaction),
            timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': transaction['destination'], // only for Lightning withdrawals
            'addressTo': transaction['destination'], // otherwise undefined
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': this.parseTransactionType (transaction),
            'amount': this.precisionToCurrency (currency, transaction['amount']),
            'currency': 'BTC',
            'network': this.safeString (transaction, 'type', 'unknown'),
            'status': this.parseTransactionStatus (transaction),
            'updated': timestamp,
            'comment': undefined,
            'fee': this.parseTransactionFee (transaction),
        };
    }

    parseTransactionFee (transaction) {
        return {
            'currency': 'BTC',
            'cost': this.precisionToCurrency ('BTC', this.safeNumber (transaction, 'fee', 0)),
            'rate': undefined,
        };
    }

    parseTransactionStatus (transaction) {
        if (transaction['type'] === 'lightning' || transaction['type'] === 'internal') {
            return transaction['success'] ? 'ok' : 'failed';
        } else if (transaction['type'] === 'bitcoin') {
            return transaction['is_confirmed'] ? 'ok' : 'pending';
        } else {
            throw new BadRequest ('Unknown transaction type: ' + transaction['type']);
        }
    }

    parseTransactionType (transaction) {
        if (transaction['type'] === 'internal') {
            return transaction['from_username']
                ? 'deposit'
                : 'withdrawal';
        } else {
            return transaction['fee']
                ? 'withdrawal'
                : 'deposit';
        }
    }

    parseTxId (transaction) {
        switch (transaction['type']) {
        case 'bitcoin':
            return transaction['transaction_id'];
        case 'lightning':
            return transaction['payment_hash'];
        default:
            return transaction['id'];
        }
    }

    parseType (type: string) {
        return type === 'l' ? 'limit' : 'market';
    }

    // converts from satoshis to bitcoins
    precisionToCost (symbol: string, cost: number) {
        /**
         * @method
         * @name lnmarkets#precisionToCost
         * @description Utility to convert LN Markets cost to CCXT cost
         * @param {string} symbol - The CCXT symbol of the cost to convert.
         * @param {number} cost - The LN Markets cost to convert.
         * @returns {number} The cost in bitcoins with the appropriate precision
         * @example precisionToCost ('BTC/USD:BTC', 10000000) => 0.1
         */
        // precision defaults to 8 when no symbol is specified
        const market = this.safeValue (this.markets, symbol);
        if (market === undefined) {
            return 8;
        }
        const precision = symbol
            ? this.markets[symbol]['precision']['cost']
            : 8;
        return cost / Math.pow (10, precision);
    }

    precisionToCurrency (code: string, amount: number) {
        /**
         * @method
         * @name lnmarkets#precisionToCurrency
         * @description Utility to convert LN Markets currency amounts to CCXT currency amounts
         * @param {string} code - The CCXT code of the currency to convert.
         * @param {number} amount - The amount to convert.
         * @returns {number} The amount in bitcoin with the appropriate precision
         * @example precisionToCurrency ('BTC', 10000000) => 0.1
         */
        const currency = this.safeValue (this.currencies, code);
        let precision = 8;
        if (currency) {
            precision = this.currencies[code]['precision'];
        }
        return amount / Math.pow (10, precision);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        /**
         * @method
         * @name lnmarkets#sign
         * @description Handles authentication
         * @see https://docs.lnmarkets.com/api/v2#section/REST-API/Authentication
         */
        const implodedParams = this.implodeParams (path, params);
        let url = this.urls['api'] + '/' + this.version + '/' + implodedParams;
        const query = this.omit (params, this.extractParams (path));
        const nonce = this.milliseconds ();
        if (api === 'public') {
            return { url, method, params, headers };
        } else if (api === 'private') {
            let payload = nonce.toString () + method + '/' + this.version + '/' + implodedParams;
            if (method === 'GET' || method === 'DELETE') {
                if (Object.keys (query).length) {
                    payload += this.urlencode (query);
                }
            } else {
                payload += this.json (params);
            }
            const signature = this.hmac (payload, this.secret, sha256, 'base64');
            headers = {
                'LNM-ACCESS-KEY': this.apiKey,
                'LNM-ACCESS-PASSPHRASE': this.password,
                'LNM-ACCESS-TIMESTAMP': nonce,
                'LNM-ACCESS-SIGNATURE': signature,
            };
            if (method === 'GET' || method === 'DELETE') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                headers['Content-Type'] = 'application/json';
                body = this.json (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}) {
        /**
         * @method
         * @name lnmarkets#transfer
         * @description Transfers funds between two users
         * @see https://docs.lnmarkets.com/api/v2#tag/Wallet/operation/wallet-transfert
         * @param {string} code - The currency code of the transfer. Only BTC is supported.
         * @param {number} amount - The amount to transfer.
         * @param {string} fromAccount - Not used.
         * @param {string} toAccount - The username of the recipient.
         * @param {object} [params] - Additional parameters
         */
        await this.loadMarkets ();
        if (code !== 'BTC') {
            throw new BadRequest ('Only BTC transfers are supported');
        }
        const info = await this.privatePostUserTransfer (this.extend ({
            'amount': amount,
            'toUsername': toAccount,
        }, params));
        return {
            info,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'currency': 'BTC',
            'amount': info.amount,
            'fromAccount': undefined,
            'toAccount': info.to,
            'status': 'ok',
        };
    }

    async withdraw (code: string, amount, address: string, tag = undefined, params = {}) {
        /**
         * @method
         * @name lnmarkets#withdraw
         * @description Withdraws funds. Lightning only.
         * @see https://docs.lnmarkets.com/api/v2#tag/Wallet/operation/wallet-withdraw
         * @param {string} code - The currency code of the withdrawal. Only BTC is supported.
         * @param {number} amount - The amount to withdraw.
         * @param {string} address - The Lightning invoice to withdraw to.
         * @param {string} [tag] - Not used.
         * @param {object} [params] - Additional parameters
         * @returns {Promise<object>} A transaction structure
         * @throws {BadRequest} If the currency is not BTC
         * @throws {InvalidAddress} If the amount and invoice do not match
         */
        await this.loadMarkets ();
        if (code !== 'BTC') {
            throw new BadRequest ('Only BTC withdrawals are supported');
        }
        const safeAmount = this.currencyToPrecision (code, amount);
        if (!this.amountAndInvoiceMatch (safeAmount, address)) {
            throw new InvalidAddress ('Amount and invoice do not match');
        }
        const request = {
            'invoice': address,
        };
        const response = await this.privatePostUserWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': response['id'],
            'txid': response['paymentHash'],
            'timestamp': response['successTime'],
            'datetime': this.iso8601 (response['successTime']),
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': 'withdrawal',
            'amount': this.precisionToCurrency (code, response['amount']),
            'currency': 'BTC',
            'status': response['successTime'] ? 'ok' : 'failed',
            'updated': undefined,
            'comment': undefined,
            'fee': {
                'currency': 'BTC',
                'cost': this.precisionToCurrency (code, response['fee']),
                'rate': undefined,
            },
        };
    }
}
