'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidAddress, InsufficientFunds, InvalidNonce, InvalidOrder, OrderNotFound, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class cobinhood extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cobinhood',
            'name': 'COBINHOOD',
            'countries': [ 'TW' ],
            'rateLimit': 1000 / 10,
            'version': 'v1',
            'has': {
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrderTrades': true,
                'fetchOrder': true,
                'fetchDepositAddress': true,
                'createDepositAddress': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'withdraw': true,
                'fetchMyTrades': true,
                'editOrder': true,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'timeframes': {
                // the first two don't seem to work at all
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'referral': 'https://cobinhood.com?referrerId=a9d57842-99bb-4d7c-b668-0479a15a458b',
                'logo': 'https://user-images.githubusercontent.com/1294454/35755576-dee02e5c-0878-11e8-989f-1595d80ba47f.jpg',
                'api': 'https://api.cobinhood.com',
                'www': 'https://cobinhood.com',
                'doc': 'https://cobinhood.github.io/api-public',
            },
            'api': {
                'system': {
                    'get': [
                        'info',
                        'time',
                        'messages',
                        'messages/{message_id}',
                    ],
                },
                'admin': {
                    'get': [
                        'system/messages',
                        'system/messages/{message_id}',
                    ],
                    'post': [
                        'system/messages',
                    ],
                    'patch': [
                        'system/messages/{message_id}',
                    ],
                    'delete': [
                        'system/messages/{message_id}',
                    ],
                },
                'public': {
                    'get': [
                        'market/fundingbook/precisions/{currency_id}',
                        'market/fundingbooks/{currency_id}',
                        'market/tickers',
                        'market/currencies',
                        'market/quote_currencies',
                        'market/trading_pairs',
                        'market/orderbook/precisions/{trading_pair_id}',
                        'market/orderbooks/{trading_pair_id}',
                        'market/stats',
                        'market/tickers', // fetchTickers
                        'market/tickers/{trading_pair_id}',
                        'market/trades/{trading_pair_id}',
                        'market/trades_history/{trading_pair_id}',
                        'market/trading_pairs',
                        'chart/candles/{trading_pair_id}',
                        'system/time',
                    ],
                },
                'private': {
                    'get': [
                        'funding/auto_offerings',
                        'funding/auto_offerings/{currency_id}',
                        'funding/funding_history',
                        'funding/fundings',
                        'funding/loans',
                        'funding/loans/{loan_id}',
                        'trading/orders/{order_id}',
                        'trading/orders/{order_id}/trades',
                        'trading/orders',
                        'trading/order_history',
                        'trading/positions',
                        'trading/positions/{trading_pair_id}',
                        'trading/positions/{trading_pair_id}/claimable_size',
                        'trading/trades',
                        'trading/trades/{trade_id}',
                        'trading/volume',
                        'wallet/balances',
                        'wallet/ledger',
                        'wallet/limits/withdrawal',
                        'wallet/generic_deposits',
                        'wallet/generic_deposits/{generic_deposit_id}',
                        'wallet/generic_withdrawals',
                        'wallet/generic_withdrawals/{generic_withdrawal_id}',
                        // older endpoints
                        'wallet/deposit_addresses',
                        'wallet/deposit_addresses/iota',
                        'wallet/withdrawal_addresses',
                        'wallet/withdrawal_frozen',
                        'wallet/withdrawals/{withdrawal_id}',
                        'wallet/withdrawals',
                        'wallet/deposits/{deposit_id}',
                        'wallet/deposits',
                    ],
                    'patch': [
                        'trading/positions/{trading_pair_id}',
                    ],
                    'post': [
                        'funding/auto_offerings',
                        'funding/fundings',
                        'trading/check_order',
                        'trading/orders',
                        // older endpoints
                        'wallet/deposit_addresses',
                        'wallet/transfer',
                        'wallet/withdrawal_addresses',
                        'wallet/withdrawals',
                        'wallet/withdrawals/fee',
                    ],
                    'put': [
                        'funding/fundings/{funding_id}',
                        'trading/orders/{order_id}',
                    ],
                    'delete': [
                        'funding/auto_offerings/{currency_id}',
                        'funding/fundings/{funding_id}',
                        'funding/loans/{loan_id}',
                        'trading/orders/{order_id}',
                        'trading/positions/{trading_pair_id}',
                        'wallet/generic_withdrawals/{generic_withdrawal_id}',
                        'wallet/withdrawal_addresses/{wallet_id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0,
                    'taker': 0.0,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'exceptions': {
                'insufficient_balance': InsufficientFunds,
                'invalid_order_size': InvalidOrder,
                'invalid_nonce': InvalidNonce,
                'unauthorized_scope': PermissionDenied,
                'invalid_address': InvalidAddress,
                'parameter_error': OrderNotFound,
            },
            'commonCurrencies': {
                'SMT': 'SocialMedia.Market',
                'MTN': 'Motion Token',
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetMarketCurrencies (params);
        const currencies = response['result']['currencies'];
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'currency');
            const name = this.safeString (currency, 'name');
            const code = this.safeCurrencyCode (id);
            const minUnit = this.safeFloat (currency, 'min_unit');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': true,
                'fiat': false,
                'precision': this.precisionFromString (currency['min_unit']),
                'limits': {
                    'amount': {
                        'min': minUnit,
                        'max': undefined,
                    },
                    'price': {
                        'min': minUnit,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': minUnit,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': minUnit,
                        'max': undefined,
                    },
                },
                'funding': {
                    'withdraw': {
                        'fee': this.safeFloat (currency, 'withdrawal_fee'),
                    },
                    'deposit': {
                        'fee': this.safeFloat (currency, 'deposit_fee'),
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarketTradingPairs (params);
        const markets = this.safeValue (response['result'], 'trading_pairs');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const [ baseId, quoteId ] = id.split ('-');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': 8,
                'price': this.precisionFromString (market['quote_increment']),
            };
            const active = this.safeValue (market, 'is_active', true);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'base_min_size'),
                        'max': this.safeFloat (market, 'base_max_size'),
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

    parseTicker (ticker, market = undefined) {
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (ticker, 'trading_pair_id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeFloat (ticker, 'last_trade_price');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, '24h_high'),
            'low': this.safeFloat (ticker, '24h_low'),
            'bid': this.safeFloat (ticker, 'highest_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowest_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'percentChanged24hr'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, '24h_volume'),
            'quoteVolume': this.safeFloat (ticker, 'quote_volume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'trading_pair_id': market['id'],
        };
        const response = await this.publicGetMarketTickersTradingPairId (this.extend (request, params));
        const ticker = this.safeValue (response['result'], 'ticker');
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketTickers (params);
        const tickers = this.safeValue (response['result'], 'tickers');
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.indexBy (result, 'symbol');
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'trading_pair_id': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit'] = limit; // 100
        }
        const response = await this.publicGetMarketOrderbooksTradingPairId (this.extend (request, params));
        return this.parseOrderBook (response['result']['orderbook'], undefined, 'bids', 'asks', 0, 2);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (trade, 'timestamp');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        // you can't determine your side from maker/taker side and vice versa
        // you can't determine if your order/trade was a maker or a taker based
        // on just the side of your order/trade
        // https://github.com/ccxt/ccxt/issues/4300
        // let side = (trade['maker_side'] === 'bid') ? 'sell' : 'buy';
        const side = undefined;
        const id = this.safeString (trade, 'id');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'trading_pair_id': market['id'],
            'limit': limit, // default 20, but that seems too little
        };
        const response = await this.publicGetMarketTradesTradingPairId (this.extend (request, params));
        const trades = this.safeValue (response['result'], 'trades');
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            // they say that timestamps are Unix Timestamps in seconds, but in fact those are milliseconds
            ohlcv['timestamp'],
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['high']),
            parseFloat (ohlcv['low']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['volume']),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        //
        // they say in their docs that end_time defaults to current server time
        // but if you don't specify it, their range limits does not allow you to query anything
        //
        // they also say that start_time defaults to 0,
        // but most calls fail if you do not specify any of end_time
        //
        // to make things worse, their docs say it should be a Unix Timestamp
        // but with seconds it fails, so we set milliseconds (somehow it works that way)
        //
        const endTime = this.milliseconds ();
        const request = {
            'trading_pair_id': market['id'],
            'timeframe': this.timeframes[timeframe],
            'end_time': endTime,
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        const response = await this.publicGetChartCandlesTradingPairId (this.extend (request, params));
        const ohlcv = this.safeValue (response['result'], 'candles');
        return this.parseOHLCVs (ohlcv, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWalletBalances (params);
        const result = { 'info': response };
        const balances = this.safeValue (response['result'], 'balances');
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeFloat (balance, 'on_order');
            account['total'] = this.safeFloat (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'filled': 'closed',
            'rejected': 'closed',
            'partially_filled': 'open',
            'pending_cancellation': 'open',
            'pending_modification': 'open',
            'open': 'open',
            'new': 'open',
            'queued': 'open',
            'cancelled': 'canceled',
            'triggered': 'triggered',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         'completed_at': None,
        //         'eq_price': '0',
        //         'filled': '0',
        //         'id': '88426800-beae-4407-b4a1-f65cef693542',
        //         'price': '0.00000507',
        //         'side': 'bid',
        //         'size': '3503.6489',
        //         'source': 'exchange',
        //         'state': 'open',
        //         'timestamp': 1535258403597,
        //         'trading_pair_id': 'ACT-BTC',
        //         'type': 'limit',
        //     }
        //
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString2 (order, 'trading_pair', 'trading_pair_id');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (order, 'timestamp');
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'eq_price');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'filled');
        let remaining = undefined;
        let cost = undefined;
        if (filled !== undefined && average !== undefined) {
            cost = average * filled;
        } else if (average !== undefined) {
            cost = average * amount;
        }
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = amount - filled;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        let side = this.safeString (order, 'side');
        if (side === 'bid') {
            side = 'buy';
        } else if (side === 'ask') {
            side = 'sell';
        }
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': this.safeString (order, 'type'), // market, limit, stop, stop_limit, trailing_stop, fill_or_kill
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        side = (side === 'sell') ? 'ask' : 'bid';
        const request = {
            'trading_pair_id': market['id'],
            'type': type, // market, limit, stop, stop_limit
            'side': side,
            'size': this.amountToPrecision (symbol, amount),
        };
        if (type !== 'market') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostTradingOrders (this.extend (request, params));
        const order = this.parseOrder (response['result']['order'], market);
        const id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async editOrder (id, symbol, type, side, amount, price, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
            'price': this.priceToPrecision (symbol, price),
            'size': this.amountToPrecision (symbol, amount),
        };
        const response = await this.privatePutTradingOrdersOrderId (this.extend (request, params));
        return this.parseOrder (this.extend (response, {
            'id': id,
        }));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateDeleteTradingOrdersOrderId (this.extend (request, params));
        return this.parseOrder (this.extend (response, {
            'id': id,
        }));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id.toString (),
        };
        const response = await this.privateGetTradingOrdersOrderId (this.extend (request, params));
        return this.parseOrder (response['result']['order']);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const result = await this.privateGetTradingOrders (params);
        const orders = this.parseOrders (result['result']['orders'], undefined, since, limit);
        if (symbol !== undefined) {
            return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
        }
        return this.filterBySinceLimit (orders, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['trading_pair_id'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 50, max 100
        }
        const response = await this.privateGetTradingOrderHistory (this.extend (request, params));
        const orders = this.parseOrders (response['result']['orders'], market, since, limit);
        if (symbol !== undefined) {
            return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
        }
        return this.filterBySinceLimit (orders, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetTradingOrdersOrderIdTrades (this.extend (request, params));
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        return this.parseTrades (response['result']['trades'], market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        if (symbol !== undefined) {
            request['trading_pair_id'] = market['id'];
        }
        const response = await this.privateGetTradingTrades (this.extend (request, params));
        return this.parseTrades (response['result']['trades'], market, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        // 'ledger_type' is required, see: https://cobinhood.github.io/api-public/#create-new-deposit-address
        const ledgerType = this.safeString (params, 'ledger_type', 'exchange');
        const request = {
            'currency': currency['id'],
            'ledger_type': ledgerType,
        };
        const response = await this.privatePostWalletDepositAddresses (this.extend (request, params));
        const address = this.safeString (response['result']['deposit_address'], 'address');
        const tag = this.safeString (response['result']['deposit_address'], 'memo');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetWalletDepositAddresses (this.extend (request, params));
        //
        //     { success:    true,
        //        result: { deposit_addresses: [ {       address: "abcdefg",
        //                                         blockchain_id: "eosio",
        //                                            created_at:  1536768050235,
        //                                              currency: "EOS",
        //                                                  memo: "12345678",
        //                                                  type: "exchange"      } ] } }
        //
        const addresses = this.safeValue (response['result'], 'deposit_addresses', []);
        let address = undefined;
        let tag = undefined;
        if (addresses.length > 0) {
            address = this.safeString (addresses[0], 'address');
            tag = this.safeString2 (addresses[0], 'memo', 'tag');
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privatePostWalletWithdrawals (this.extend (request, params));
        return {
            'id': undefined,
            'info': response,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (code === undefined) {
            throw new ExchangeError (this.id + ' fetchDeposits() requires a currency code argument');
        }
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetWalletDeposits (this.extend (request, params));
        return this.parseTransactions (response['result']['deposits'], currency);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (code === undefined) {
            throw new ExchangeError (this.id + ' fetchWithdrawals() requires a currency code argument');
        }
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetWalletWithdrawals (this.extend (request, params));
        return this.parseTransactions (response['result']['withdrawals'], currency);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'tx_pending_two_factor_auth': 'pending',
            'tx_pending_email_auth': 'pending',
            'tx_pending_approval': 'pending',
            'tx_approved': 'pending',
            'tx_processing': 'pending',
            'tx_pending': 'pending',
            'tx_sent': 'pending',
            'tx_cancelled': 'canceled',
            'tx_timeout': 'failed',
            'tx_invalid': 'failed',
            'tx_rejected': 'failed',
            'tx_confirmed': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        const timestamp = this.safeInteger (transaction, 'created_at');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        let id = undefined;
        const withdrawalId = this.safeString (transaction, 'withdrawal_id');
        const depositId = this.safeString (transaction, 'deposit_id');
        let type = undefined;
        let address = undefined;
        if (withdrawalId !== undefined) {
            type = 'withdrawal';
            id = withdrawalId;
            address = this.safeString (transaction, 'to_address');
        } else if (depositId !== undefined) {
            type = 'deposit';
            id = depositId;
            address = this.safeString (transaction, 'from_address');
        }
        const additionalInfo = this.safeValue (transaction, 'additional_info', {});
        const tag = this.safeString (additionalInfo, 'memo');
        return {
            'info': transaction,
            'id': id,
            'txid': this.safeString (transaction, 'txhash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': tag, // refix it properly
            'type': type,
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': code,
            'status': this.parseTransactionStatus (transaction['status']),
            'updated': undefined,
            'fee': {
                'cost': this.safeFloat (transaction, 'fee'),
                'rate': undefined,
            },
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        headers = {};
        if (api === 'private') {
            this.checkRequiredCredentials ();
            // headers['device_id'] = this.apiKey;
            headers['nonce'] = this.nonce ().toString ();
            headers['Authorization'] = this.apiKey;
        }
        if (method === 'GET') {
            query = this.urlencode (query);
            if (query.length) {
                url += '?' + query;
            }
        } else {
            headers['Content-type'] = 'application/json; charset=UTF-8';
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (code < 400 || code >= 600) {
            return;
        }
        if (body[0] !== '{') {
            throw new ExchangeError (this.id + ' ' + body);
        }
        const feedback = this.id + ' ' + this.json (response);
        const errorCode = this.safeValue (response['error'], 'error_code');
        if (method === 'DELETE' || method === 'GET') {
            if (errorCode === 'parameter_error') {
                if (url.indexOf ('trading/orders/') >= 0) {
                    // Cobinhood returns vague "parameter_error" on fetchOrder() and cancelOrder() calls
                    // for invalid order IDs as well as orders that are not "open"
                    throw new InvalidOrder (feedback);
                }
            }
        }
        const exceptions = this.exceptions;
        if (errorCode in exceptions) {
            throw new exceptions[errorCode] (feedback);
        }
        throw new ExchangeError (feedback);
    }

    nonce () {
        return this.milliseconds ();
    }
};
