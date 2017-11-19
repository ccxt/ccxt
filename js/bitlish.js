"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { NotSupported } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class bitlish extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitlish',
            'name': 'bitlish',
            'countries': [ 'GB', 'EU', 'RU' ],
            'rateLimit': 1500,
            'version': 'v1',
            'hasCORS': false,
            'hasFetchTickers': true,
            'hasFetchOHLCV': true,
            'hasWithdraw': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg',
                'api': 'https://bitlish.com/api',
                'www': 'https://bitlish.com',
                'doc': 'https://bitlish.com/api',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'public': {
                    'get': [
                        'instruments',
                        'ohlcv',
                        'pairs',
                        'tickers',
                        'trades_depth',
                        'trades_history',
                    ],
                    'post': [
                        'instruments',
                        'ohlcv',
                        'pairs',
                        'tickers',
                        'trades_depth',
                        'trades_history',
                    ],
                },
                'private': {
                    'post': [
                        'accounts_operations',
                        'balance',
                        'cancel_trade',
                        'cancel_trades_by_ids',
                        'cancel_all_trades',
                        'create_bcode',
                        'create_template_wallet',
                        'create_trade',
                        'deposit',
                        'list_accounts_operations_from_ts',
                        'list_active_trades',
                        'list_bcodes',
                        'list_my_matches_from_ts',
                        'list_my_trades',
                        'list_my_trads_from_ts',
                        'list_payment_methods',
                        'list_payments',
                        'redeem_code',
                        'resign',
                        'signin',
                        'signout',
                        'trade_details',
                        'trade_options',
                        'withdraw',
                        'withdraw_by_id',
                    ],
                },
            },
        });
    }

    commonCurrencyCode (currency) {
        if (!this.substituteCommonCurrencyCodes)
            return currency;
        if (currency == 'XBT')
            return 'BTC';
        if (currency == 'BCC')
            return 'BCH';
        if (currency == 'DRK')
            return 'DASH';
        if (currency == 'DSH')
            currency = 'DASH';
        return currency;
    }

    async fetchMarkets () {
        let markets = await this.publicGetPairs ();
        let result = [];
        let keys = Object.keys (markets);
        for (let p = 0; p < keys.length; p++) {
            let market = markets[keys[p]];
            let id = market['id'];
            let symbol = market['name'];
            let [ base, quote ] = symbol.split ('/');
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'high': this.safeFloat (ticker, 'max'),
            'low': this.safeFloat (ticker, 'min'),
            'bid': undefined,
            'ask': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': this.safeFloat (ticker, 'first'),
            'last': this.safeFloat (ticker, 'last'),
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'prc'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'sum'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let tickers = await this.publicGetTickers (params);
        let ticker = tickers[market['id']];
        return this.parseTicker (ticker, market);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // let market = this.market (symbol);
        let now = this.seconds ();
        let start = now - 86400 * 30; // last 30 days
        let interval = [ start.toString (), undefined ];
        return await this.publicPostOhlcv (this.extend ({
            'time_range': interval,
        }, params));
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetTradesDepth (this.extend ({
            'pair_id': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (parseInt (orderbook['last']) / 1000);
        return this.parseOrderBook (orderbook, timestamp, 'bid', 'ask', 'price', 'volume');
    }

    parseTrade (trade, market = undefined) {
        let side = (trade['dir'] == 'bid') ? 'buy' : 'sell';
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = parseInt (trade['created'] / 1000);
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesHistory (this.extend ({
            'pair_id': market['id'],
        }, params));
        return this.parseTrades (response['list'], market);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostBalance ();
        let result = { 'info': response };
        let currencies = Object.keys (response);
        let balance = {};
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let account = response[currency];
            currency = currency.toUpperCase ();
            // issue #4 bitlish names Dash as DSH, instead of DASH
            if (currency == 'DSH')
                currency = 'DASH';
            balance[currency] = account;
        }
        for (let c = 0; c < this.currencies.length; c++) {
            let currency = this.currencies[c];
            let account = this.account ();
            if (currency in balance) {
                account['free'] = parseFloat (balance[currency]['funds']);
                account['used'] = parseFloat (balance[currency]['holded']);
                account['total'] = this.sum (account['free'], account['used']);
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    signIn () {
        return this.privatePostSignin ({
            'login': this.login,
            'passwd': this.password,
        });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'pair_id': this.marketId (symbol),
            'dir': (side == 'buy') ? 'bid' : 'ask',
            'amount': amount,
        };
        if (type == 'limit')
            order['price'] = price;
        let result = await this.privatePostCreateTrade (this.extend (order, params));
        return {
            'info': result,
            'id': result['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelTrade ({ 'id': id });
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        if (currency != 'BTC') {
            // they did not document other types...
            throw new NotSupported (this.id + ' currently supports BTC withdrawals only, until they document other currencies...');
        }
        let response = await this.privatePostWithdraw (this.extend ({
            'currency': currency.toLowerCase (),
            'amount': parseFloat (amount),
            'account': address,
            'payment_method': 'bitcoin', // they did not document other types...
        }, params));
        return {
            'info': response,
            'id': response['message_id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        if (api == 'public') {
            if (method == 'GET') {
                if (Object.keys (params).length)
                    url += '?' + this.urlencode (params);
            }
            else {
                body = this.json (params);
                headers = { 'Content-Type': 'application/json' };
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.json (this.extend ({ 'token': this.apiKey }, params));
            headers = { 'Content-Type': 'application/json' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
