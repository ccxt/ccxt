
//  ---------------------------------------------------------------------------

import Exchange from './abstract/digitra.js';
import { ExchangeError } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, OrderSide, OrderType } from './base/types.js';
import { Precise } from './base/Precise.js';

//  ---------------------------------------------------------------------------

/**
 * @class digitra
 * @extends Exchange
 */
export default class digitra extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'digitra',
            'name': 'Digitra',
            'countries': [ 'BR' ], // Brazil
            // Digitra hasn't defined a rate limit yet, but after talking w/
            // their tech team, they've decided to set this to 10 req/sec per IP.
            // Until each endpoint has it's own rate limit.
            'rateLimit': 100,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': 'emulated',
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'withdraw': false,
            },
            'timeframes': {
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/2773294/258158555-bb4fef73-1030-4b34-8725-0405645276af.png',
                'api': {
                    'public': {
                        'base': 'https://api.digitra.com',
                        'path': '/v1',
                    },
                    'private': {
                        'base': 'https://api.digitra.com',
                        'path': '/v1',
                    },
                },
                'www': 'https://www.digitra.com/',
                'doc': [
                    'https://digitracom.stoplight.io/docs/rest-api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/{market_id}/orderbook',
                        'markets/{market_id}/prices',
                        'markets/{market_id}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'wallet/assets',
                        'wallet/balances',
                        'wallet/deposits',
                        'wallet/deposit-addresses',
                        'wallet/withdrawal-fees',
                        'trade/orders',
                        'trade/orders/{order_id}',
                        'trade/fills',
                    ],
                    'post': [
                        'trade/orders',
                    ],
                    'delete': [
                        'trade/orders/{order_id}',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    // Their trading fee is free for now, but they plan to change
                    // once they release their fee schedule, we will update this.
                    'taker': this.parseNumber ('0.00'),
                    'maker': this.parseNumber ('0.00'),
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name digitra#fetchMarkets
         * @description retrieves data on all markets for digitra
         * @see https://digitracom.stoplight.io/docs/rest-api/c1380799c1a2d-list-markets
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetMarkets (params);
        // {
        //     "result": [
        //         {
        //             "id": "BTC-BRL",
        //             "base_currency": "BTC",
        //             "quote_currency": "BRL",
        //             "minimum_order_size": "0.00001",
        //             "increment_size": "0.000000001",
        //             "price_increment_size": "0.01",
        //             "market_order_tolerance": "10",
        //             "enabled": true
        //         },
        //         ...
        //     ]
        // }
        const result = [];
        const data = this.safeValue (response, 'result', []);
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const enabled = this.safeValue (market, 'enabled', false);
            result.push ({
                'id': this.safeString (market, 'id'),
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
                'active': enabled === true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber (this.safeString (market, 'increment_size')),
                    'price': this.parseNumber (this.safeString (market, 'price_increment_size')),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minimum_order_size'),
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
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name digitra#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        // We need to use the "wallet/assets" endpoint to get the list of currencies
        // avaiable for withdrawal/deposit for the current account to build this method.
        // Therefore we check the keys here, and fallback to generating the currencies from the markets.
        if (!this.checkRequiredCredentials (false)) {
            return undefined;
        }
        if (params['limit'] === undefined) {
            params['limit'] = 200;
        }
        const response = await this.privateGetWalletAssets (params);
        //
        // {
        //     "result": [
        //         {
        //             "id": "USDT",
        //             "name": "USD Theter",
        //             "asset_group": "USD",
        //             "networks": [
        //                 {
        //                     "name": "Ethereum",
        //                     "min_confirmations": 1,
        //                     "blockchain_tag_name": null,
        //                     "address_enabled": true,
        //                     "deposit_enabled": true,
        //                     "withdrawal_enabled": true,
        //                     "withdrawal_min_usd": "10.0",
        //                     "withdrawal_max_usd": "100000.0",
        //                     "withdrawal_fee_rate": "0.2",
        //                     "withdrawal_max_interval": 24
        //                 }
        //             ]
        //         }
        //     ]
        // }
        //
        const assets = this.safeValue (response, 'result', []);
        const currencies = {};
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const id = this.safeString (asset, 'id');
            const name = this.safeString (asset, 'name');
            const code = this.safeCurrencyCode (id);
            let isWithdrawEnabled = false;
            let isDepositEnabled = false;
            const fees = {};
            const networks = this.safeValue (asset, 'networks', []);
            for (let j = 0; j < networks.length; j++) {
                const item = networks[j];
                const network = this.safeString (item, 'network');
                const withdrawFee = this.safeNumber (item, 'withdrawal_fee_rate');
                const depositEnable = this.safeValue (item, 'deposit_enabled', false);
                const withdrawEnable = this.safeValue (item, 'withdrawal_enabled', false);
                isDepositEnabled = isDepositEnabled || depositEnable;
                isWithdrawEnabled = isWithdrawEnabled || withdrawEnable;
                fees[network] = withdrawFee;
            }
            const active = (isWithdrawEnabled || isDepositEnabled);
            currencies[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': undefined,
                'info': asset,
                'active': active,
                'deposit': isDepositEnabled,
                'withdraw': isWithdrawEnabled,
                'networks': networks,
                'fee': undefined,
                'fees': fees,
                'limits': undefined,
            };
        }
        return currencies;
    }

    parseTimestamp (data, key) {
        const timestampMicro = this.safeInteger (data, key);
        return Math.floor (timestampMicro / 1000);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name digitra#fetchOrderBook
         * @description fetches volume on each price level of the orderbook (depth data)
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
        };
        if (limit !== undefined) {
            request['max_depth'] = limit;
        }
        const response = await this.publicGetMarketsMarketIdOrderbook (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const timestamp = this.parseTimestamp (result, 'updated_at');
        return this.parseOrderBook (result, market['symbol'], timestamp, 'bids', 'asks', 'price', 'size');
    }

    async fetchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name digitra#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
        };
        const response = await this.publicGetMarketsMarketIdPrices (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseTicker (result, market);
    }

    async fetchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name digitra#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the binance api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const request = {
            'expand': 'PRICES',
        };
        const response = await this.publicGetMarkets (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        const prices = {};
        for (let i = 0; i < result.length; i++) {
            const price = this.safeValue (result[i], 'prices', {});
            const marketId = this.safeString (result[i], 'id');
            prices[marketId] = price;
        }
        return this.parseTickers (prices, symbols);
    }

    parseTicker (ticker, market = undefined) {
        //
        //    {
        //        "price": "27400",
        //        "bid": "27400",
        //        "ask": "27643.71",
        //        "base_volume_24h": "0.1067496",
        //        "quote_volume_24h": "2953.1230320534",
        //        "high_24h": "30000",
        //        "low_24h": "27202.01",
        //        "price_change_percent_24h": "-8.66"
        //    }
        //
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'last');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'high_24h'),
            'low': this.safeString (ticker, 'low_24h'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'price_change_percent_24h'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'base_volume_24h'),
            'quoteVolume': this.safeString (ticker, 'quote_volume_24h'),
            'info': ticker,
        }, market);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name digitra#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the api endpoint
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string|undefined} params.cursor trade id to fetch from, this is used for pagination, to fetch trades from the given cursor backwards
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketsMarketIdTrades (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseTrades (result, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // {
        //     "id": "5762572869863580",
        //     "time": 1687219130687129,
        //     "price": "128820.15",
        //     "size": "0.00001",
        //     "quote_size": "1.2882015",
        //     "side": "BUY"
        // }
        //
        const id = this.safeString (trade, 'id');
        const timestamp = this.parseTimestamp (trade, 'time');
        const side = this.safeStringLower (trade, 'side');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'size');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': {
                'cost': undefined,
                'currency': undefined,
            },
        }, market);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name digitra#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const response = await this.privateGetWalletBalances (params);
        return this.parseBalance (response);
    }

    parseBalance (response) {
        const balances = this.safeValue (response, 'result', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const asset = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (asset);
            const available = this.safeString (balance, 'amount');
            const locked = this.safeString (balance, 'amount_orders');
            const total = Precise.stringAdd (available, locked);
            const account = this.account ();
            account['free'] = available;
            account['total'] = total;
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name digitra#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset': currency['id'],
        };
        const response = await this.privateGetWalletDepositAddresses (this.extend (request, params));
        // {
        //   "result": [
        //     {
        //       "id": "412578523698005",
        //       "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //       "asset": "USDT",
        //       "network": "ETHEREUM",
        //       "destination_tag": "",
        //       "memo": "A78910",
        //       "created_at": 1675804212789654
        //     }
        //   ]
        // }
        //
        const addresses = this.safeValue (response, 'result', []);
        const address = this.safeValue (addresses, 0);
        return this.parseDepositAddress (address);
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        /**
         * @method
         * @name digitra#fetchDepositAddresses
         * @description fetch deposit addresses for multiple currencies and chain types
         * @param {[string]|undefined} codes list of unified currency codes, default is undefined
         * @param {object} params extra parameters specific to the coinone api endpoint
         * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        const request = {
            // Increase limit to get max amount of addresses, since we are filtering on our side by currency codes
            'limit': 200,
        };
        const response = await this.privateGetWalletDepositAddresses (this.extend (request, params));
        // {
        //   "result": [
        //     {
        //       "id": "412578523698005",
        //       "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //       "asset": "USDT",
        //       "network": "ETHEREUM",
        //       "destination_tag": "",
        //       "memo": "A78910",
        //       "created_at": 1675804212789654
        //     },
        //     {
        //       "id": "458631258977260",
        //       "address": "0x95aDSdsadsadsadsadsadsadsadsdasdsa",
        //       "asset": "USDT",
        //       "network": "SOLANA",
        //       "destination_tag": "",
        //       "memo": "B65410",
        //       "created_at": 1675804212123456
        //     }
        //   ]
        // }
        //
        const addresses = this.safeValue (response, 'result', []);
        return this.parseDepositAddresses (addresses, codes);
    }

    parseDepositAddress (address, codes = undefined) {
        const asset = this.safeString (address, 'asset');
        const code = this.safeCurrencyCode (asset);
        const depositAddress = this.safeString (address, 'address');
        const network = this.safeString (address, 'network');
        let tag = this.safeString (address, 'memo');
        if (tag === '') {
            tag = this.safeString (address, 'destination_tag');
        }
        this.checkAddress (depositAddress);
        return {
            'currency': code,
            'address': depositAddress,
            'network': network,
            'tag': tag,
            'info': address,
        };
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name digitra#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'price': this.priceToPrecision (symbol, price),
            'size': this.amountToPrecision (symbol, amount),
            'time_in_force': 'GTC', // GTC, IOC, FOK, GTX
        };
        if (type === 'market') {
            request['type'] = 'MARKET';
        } else {
            request['type'] = 'LIMIT';
        }
        if (side === 'buy') {
            request['side'] = 'BUY';
        } else if (side === 'sell') {
            request['side'] = 'SELL';
        }
        if (params['time_in_force'] !== undefined) {
            request['time_in_force'] = this.timeInForceToAPI (params['time_in_force']);
        }
        const response = await this.privatePostTradeOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name digitra#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'order_id': id,
        };
        await this.privateDeleteTradeOrdersOrderId (this.extend (request, params));
        return this.safeOrder ({
            'id': id,
        });
    }

    parseOrderStatus (status) {
        const statuses = {
            'SUBMITTING': 'closed',
            'PENDING_BALANCE': 'closed',
            'OPEN': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'PENDING_CANCELING': 'open',
            'CANCELED': 'canceled',
            'CANCELED_PENDING_BALANCE': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (orderType) {
        const orderTypes = {
            'LIMIT': 'limit',
            'MARKET': 'market',
        };
        return this.safeString (orderTypes, orderType, orderType);
    }

    parseTimeInForce (timeInForce) {
        if (timeInForce === '-') {
            return undefined;
        }
        const timeInForces = {
            'GTC': 'good_til_cancelled',
            'FOK': 'fill_or_kill',
            'IOC': 'immediate_or_cancel',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    timeInForceToAPI (timeInForce) {
        const timeInForces = {
            'good_til_cancelled': 'GTC',
            'fill_or_kill': 'FOK',
            'immediate_or_cancel': 'IOC',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrder (order, market = undefined) {
        //
        // {
        //   "id": "446866913146962177",
        //   "market": "BTC-USD",
        //   "side": "BUY",
        //   "type": "LIMIT",
        //   "status": "OPEN",
        //   "time_in_force": "GTC",
        //   "price": "23250.0",
        //   "size": "0.01",
        //   "fee": "0",
        //   "filled": "0",
        //   "filled_weighted_price": "0",
        //   "custom_id": "7766052b-16a5-49a3-a572-d75d6f5484d2",
        //   "created_at": 1675893837458805,
        //   "updated_at": 1675893844084384
        // }
        //
        const id = this.safeString (order, 'id');
        const custom_id = this.safeString (order, 'custom_id');
        const order_type = this.parseOrderType (this.safeString (order, 'type'));
        const time_in_force = this.parseTimeInForce (this.safeString (order, 'time_in_force'));
        const side = this.safeString (order, 'side');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'size');
        const marketId = this.safeString (order, 'market');
        if (market === undefined) {
            market = this.safeMarket (marketId, market);
        } else if (marketId !== market['id']) {
            throw new ExchangeError (this.id + ' market [' + market['id'] + '] mismatch from market [' + marketId + '] in parseOrder()');
        }
        const timestamp = this.parseTimestamp (order, 'created_at');
        const fee = {
            'cost': this.safeString (order, 'fee'),
            'currency': this.safeString (order, 'fee_currency'),
        };
        const filled = this.safeString (order, 'filled');
        const average_price = this.safeString (order, 'filled_weighted_price');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': custom_id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': order_type,
            'timeInForce': time_in_force,
            'side': side,
            'price': price,
            'average': average_price,
            'amount': amount,
            'filled': filled,
            'status': status,
            'fee': fee,
        }, market);
    }

    async fetchOrder (id: string, symbol: string = undefined, params = {}) {
        /**
         * @method
         * @name digitra#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetTradeOrdersOrderId (request);
        const order = this.safeValue (response, 'result');
        return this.parseOrder (order);
    }

    timestampToMicroseconds (timestampMilli) {
        return timestampMilli * 1000;
    }

    async fetchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name digitra#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            await this.loadMarkets ();
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['created_at.gte'] = this.timestampToMicroseconds (since);
        }
        const response = await this.privateGetTradeOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'result', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name digitra#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch open orders for
         * @param {int|undefined} limit the maximum number of  open orders structures to retrieve
         * @param {object} params extra parameters specific to the api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const openOrders = await this.fetchOrdersByStatus ('OPEN', symbol, since, limit, params);
        const partiallyFilledOrders = await this.fetchOrdersByStatus ('PARTIALLY_FILLED', symbol, since, limit, params);
        return this.arrayConcat (openOrders, partiallyFilledOrders);
    }

    async fetchOrdersByStatus (_status: string, symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'status': _status,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetTradeOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'result', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name digitra#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradeFills (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        const fills = this.parseFills (result);
        return this.filterBySinceLimit (fills, since, limit);
    }

    parseFills (fills) {
        // [{
        //   id: '466890895749310878',
        //   time: '1687818257460168',
        //   price: '4.785',
        //   size: '9.351',
        //   side: 'BUY',
        //   order_id: '466890698935779214',
        //   order_custom_id: '90ed2a02-100b-44bd-ad5a-f8eda69f43a5',
        //   market: 'USD-BRL'
        // }]
        //
        const result = [];
        for (let i = 0; i < fills.length; i++) {
            const fill = fills[i];
            const timestamp = this.parseTimestamp (fill, 'time');
            const marketSymbol = this.safeString (fill, 'market');
            const market = this.market (marketSymbol);
            const trade = this.safeTrade ({
                'info': fill,
                'id': this.safeString (fill, 'id'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'side': this.safeStringLower (fill, 'side'),
                'price': this.safeFloat (fill, 'price'),
                'amount': this.safeFloat (fill, 'size'),
                'order': this.safeString (fill, 'order_id'),
                'symbol': market['symbol'],
            });
            result.push (trade);
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const baseUrl = this.urls['api'][api]['base'];
        const basePath = this.urls['api'][api]['path'];
        const query = this.omit (params, this.extractParams (path));
        let reqPath = basePath + '/' + this.implodeParams (path, params);
        if (Object.keys (query).length) {
            if (method === 'GET') {
                reqPath += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
            }
        }
        const reqUrl = baseUrl + reqPath;
        headers = {
            'Content-Type': 'application/json',
        };
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const apiKey = this.apiKey;
            const secret = this.secret;
            const timestamp = this.microseconds ();
            let signData = timestamp.toString () + method + reqPath;
            if (body !== undefined) {
                signData += body;
            }
            const signature = this.hmac (this.encode (signData), this.encode (secret), sha256);
            headers['digitra-api-key'] = apiKey;
            headers['digitra-timestamp'] = timestamp.toString ();
            headers['digitra-signature'] = signature;
        }
        return { 'url': reqUrl, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const errors = this.safeValue (response, 'errors', []);
        const errorsLength = errors.length;
        if (errorsLength > 0) {
            throw new ExchangeError (this.id + ' error response ' + this.json (response));
        }
        if (httpCode < 200 || httpCode > 204) {
            throw new ExchangeError (this.id + ' http status code error ' + httpCode + ' response body ' + response);
        }
        return undefined;
    }
}
