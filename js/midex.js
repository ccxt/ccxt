'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported, DDoSProtection, AuthenticationError, PermissionDenied, ArgumentsRequired, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, InvalidNonce } = require ('./base/errors');
const { SIGNIFICANT_DIGITS } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

// 2cb741f1f0fdd4afb6146aabdb51edeb687c2f85be246e577c20f39bf8c112b408ced47c1b6c11af

module.exports = class midex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'midex',
            'name': 'Midex',
            'countries': [ 'US' ],
            'version': 'v1',
            'rateLimit': 1500,
            'certified': true,
            // new metainfo interface
            'has': {
                'CORS': true,
                'createMarketOrder': false,
                'fetchDepositAddress': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchMyTrades': 'emulated',
                'fetchOHLCV': false,
                'fetchOrder': false,
                'fetchOpenOrders': false,
                'fetchTickers': false,
                'withdraw': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchTransactions': false,
            },
            'timeframes': {
                '1m': 'oneMin',
                '5m': 'fiveMin',
                '30m': 'thirtyMin',
                '1h': 'hour',
                '1d': 'day',
            },
            'hostname': 'robot.midex.com',
            'urls': {
                'logo': 'https://images.golos.io/DQmcu4oRXrJ8KzQEcV4rCoQZMYQb68bZK9ZX3GXAtNp8xEv/U5drkXyC288r955NcfXvZXPV1wj2ZEf_1680x8400.jpeg',
                'api': {
                    'public': 'https://{hostname}',
                    'account': 'https://{hostname}',
                    'market': 'https://{hostname}',
                    'v1': 'https://{hostname}/v1',
                },
                'www': 'https://en.midex.com',
                'doc': [
                    'https://en.midex.com/tools/api'
                ]
            },
            'api': {
                'v1': {
                    'get': [
                        'currency_pairs',
                        'currency_pair/{symbol}/order_book',
                        'currency_pair/{symbol}/ticker',
                        'currency_pair/{symbol}/trades',
                        'account/orders/{symbol}',
                        'account/transactions/{symbol}',
                        'account/balance',
                    ],
                    'post': [
                        'account/order'
                    ],
                    'delete': [
                        'account/order/{id}'
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                        'LTC': 0.01,
                        'DOGE': 2,
                        'VTC': 0.02,
                        'PPC': 0.02,
                        'FTC': 0.2,
                        'RDD': 2,
                        'NXT': 2,
                        'DASH': 0.002,
                        'POT': 0.002,
                    },
                    'deposit': {
                        'BTC': 0,
                        'LTC': 0,
                        'DOGE': 0,
                        'VTC': 0,
                        'PPC': 0,
                        'FTC': 0,
                        'RDD': 0,
                        'NXT': 0,
                        'DASH': 0,
                        'POT': 0,
                    },
                },
            },
            'exceptions': {
                // 'Call to Cancel was throttled. Try again in 60 seconds.': DDoSProtection,
                // 'Call to GetBalances was throttled. Try again in 60 seconds.': DDoSProtection,
                'APISIGN_NOT_PROVIDED': AuthenticationError,
                'INVALID_SIGNATURE': AuthenticationError,
                'INVALID_CURRENCY': ExchangeError,
                'INVALID_PERMISSION': AuthenticationError,
                'INSUFFICIENT_FUNDS': InsufficientFunds,
                'QUANTITY_NOT_PROVIDED': InvalidOrder,
                'MIN_TRADE_REQUIREMENT_NOT_MET': InvalidOrder,
                'ORDER_NOT_OPEN': OrderNotFound,
                'INVALID_ORDER': InvalidOrder,
                'UUID_INVALID': OrderNotFound,
                'RATE_NOT_PROVIDED': InvalidOrder, // createLimitBuyOrder ('ETH/BTC', 1, 0)
                'WHITELIST_VIOLATION_IP': PermissionDenied,
            },
            'options': {
                // price precision by quote currency code
                'pricePrecisionByCode': {
                    'USD': 3,
                },
                'parseOrderStatus': false,
                'hasAlreadyAuthenticatedSuccessfully': false, // a workaround for APIKEY_INVALID
                'symbolSeparator': '-',
                // With certain currencies, like
                // AEON, BTS, GXS, NXT, SBD, STEEM, STR, XEM, XLM, XMR, XRP
                // an additional tag / memo / payment id is usually required by exchanges.
                // With Bittrex some currencies imply the "base address + tag" logic.
                // The base address for depositing is stored on this.currencies[code]
                // The base address identifies the exchange as the recipient
                // while the tag identifies the user account within the exchange
                // and the tag is retrieved with fetchDepositAddress.
                'tag': {
                    'NXT': true, // NXT, BURST
                    'CRYPTO_NOTE_PAYMENTID': true, // AEON, XMR
                    'BITSHAREX': true, // BTS
                    'RIPPLE': true, // XRP
                    'NEM': true, // XEM
                    'STELLAR': true, // XLM
                    'STEEM': true, // SBD, GOLOS
                    'LISK': true, // LSK
                },
            },
            'commonCurrencies': {
                // 'BITS': 'SWIFT',
                // 'CPC': 'CapriCoin',
            },
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.v1GetCurrencyPairs (params);
        const currencies = response
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'name');
            let baseId = id.split('_')[0]
            let quoteId = id.split('_')[1]
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            const code = base + '/' + quote;
            const precision = 8; // default precision, todo: fix "magic constants"
            const address = false
            const fee = false
            result[code] = {
                'id': id,
                'code': code,
                'address': address,
                'info': currency,
                'type': false,
                'name': code,
                'active': true,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': fee,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.v1GetCurrencyPairs ();
        const result = [];
        const markets = response;
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            let id = market['name'];
            let baseId = id.split('_')[0]
            let quoteId = id.split('_')[1]
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            '{symbol}': this.marketId (symbol)
        }
        let response = await this.v1GetCurrencyPairSymbolOrderBook (this.extend (request, params))
        let orderbook = response;
        if ('type' in params) {
          orderbook = {
              'buy': response['buy'],
              'sell': response['sell'],
          };
        }
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'price', 'volume');
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            '{symbol}': market.id
        }
        let ticker = await this.v1GetCurrencyPairSymbolTicker (this.extend (request, params));
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': parseFloat(ticker.high),
            'low': parseFloat(ticker.low),
            'bid': parseFloat(ticker.buy_price),
            'bidVolume': undefined,
            'ask': parseFloat(ticker.sell_price),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': undefined,
            'previousClose': undefined,
            'change': parseFloat(ticker.change24),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat(ticker.volume),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            '{symbol}': market.id
        }
        let trades = await this.v1GetCurrencyPairSymbolTrades (this.extend (request, params));
        console.log(trades)
        let result = []
        for (var i = 0; i <= trades.length; i++) {
          if(i == trades.length){
            return result
          }else{
            result.push({
              info: trades[i],
              timestamp: trades[i].date,
              datetime: new Date(trades[i].date),
              symbol: symbol,
              id: trades[i].id,
              order: undefined,
              type: undefined,
              takerOrMaker: undefined,
              side: trades[i].side,
              price: parseFloat(trades[i].price),
              cost: undefined,
              amount: parseFloat(trades[i].amount),
              fee: undefined
            })
          }
        }
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.v1GetAccountBalance (params);
        let balances = response;
        let result = { 'info': balances };
        let indexed = this.indexBy (balances, 'currency');
        let keys = Object.keys (indexed);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let currency = this.commonCurrencyCode (id);
            let account = this.account ();
            let balance = indexed[id];
            let free = this.safeFloat (balance, 'free', 0);
            let total = undefined;
            let used = this.safeFloat (balance, 'in_orders', 0);
            if (used !== undefined) {
                if (free !== undefined) {
                    total = free + used;
                }
            }
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            '{symbol}': market.id
        }
        let response = await this.v1GetAccountOrdersSymbol (this.extend (request, params));
        let orders = []
        for (var i = 0; i <= response.length; i++) {
          if(i == response.length){
            return orders
          }else{
            orders.push({
              amount: response[i].quantity,
              cost: 0,
              datetime: null,
              filled: 0,
              id: response[i].id,
              info: response[i],
              lastTradeTimestamp: null,
              price: parseFloat(response[i].price),
              remaining: null,
              side: response[i].side,
              status: "open",
              timestamp: null,
              type: "limit",
            })
          }
        }
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
          '{id}': id
        };
        let response = await this.v1DeleteAccountOrderId (this.extend (request, params));
        return {
          'id': id
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        amount = parseFloat(amount)
        amount = amount.toFixed(8)
        price = parseFloat(price)
        price = price.toFixed(8)
        let order = {
            'pair': market['id'],
            'quantity': amount,
            'price': price,
            'side': side,
        };
        console.log('===========');
        console.log(`price ${price}`)
        console.log(order);
        console.log('===========');
        let response = await this.v1PostAccountOrder (this.extend (order, params));
        let result = {
            'info': response,
            'id': response.id,
            'symbol': symbol,
            'type': 'limit',
            'side': response.side,
            'status': 'open',
        };
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        }) + '/';
        if (api === 'v1') {
            url += path;
            if (Object.keys (params).length)
                url = url.replace(Object.keys (params)[0], params[Object.keys (params)])
            if (url.indexOf('account') >= 0)
                this.checkRequiredCredentials ();
                headers = { 'X-KEY': this.apiKey };
            if(typeof params['side'] === 'string') {
                this.checkRequiredCredentials ();
                headers = {
                  'Content-Type': 'application/json',
                  'X-KEY': this.apiKey,
                };
                body = this.json({ 'side': params['side'], 'pair': params['pair'], 'price': params['price'], 'quantity': params['quantity'] });
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        const feedback = this.id + ' ' + this.json (response);
        if(url.indexOf('order_book') >= 0 || url.indexOf('ticker') >= 0|| url.indexOf('account') >= 0){
          // throw new ExchangeError (feedback);
        }else{
          if (body[0] === '{') {
              // { success: false, message: "message" }
              let success = this.safeValue (response, 'success');
              if (success === undefined)
                  throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
              if (typeof success === 'string') {
                  // bleutrade uses string instead of boolean
                  success = (success === 'true') ? true : false;
              }
              if (!success) {
                  const message = this.safeString (response, 'message');
                  const exceptions = this.exceptions;
                  if (message === 'APIKEY_INVALID') {
                      if (this.options['hasAlreadyAuthenticatedSuccessfully']) {
                          throw new DDoSProtection (feedback);
                      } else {
                          throw new AuthenticationError (feedback);
                      }
                  }
                  if (message === 'DUST_TRADE_DISALLOWED_MIN_VALUE_50K_SAT')
                      throw new InvalidOrder (this.id + ' order cost should be over 50k satoshi ' + this.json (response));
                  if (message === 'INVALID_ORDER') {
                      // Bittrex will return an ambiguous INVALID_ORDER message
                      // upon canceling already-canceled and closed orders
                      // therefore this special case for cancelOrder
                      // let url = 'https://bittrex.com/api/v1.1/market/cancel?apikey=API_KEY&uuid=ORDER_UUID'
                      let cancel = 'cancel';
                      let indexOfCancel = url.indexOf (cancel);
                      if (indexOfCancel >= 0) {
                          let parts = url.split ('&');
                          let orderId = undefined;
                          for (let i = 0; i < parts.length; i++) {
                              let part = parts[i];
                              let keyValue = part.split ('=');
                              if (keyValue[0] === 'uuid') {
                                  orderId = keyValue[1];
                                  break;
                              }
                          }
                          if (orderId !== undefined)
                              throw new OrderNotFound (this.id + ' cancelOrder ' + orderId + ' ' + this.json (response));
                          else
                              throw new OrderNotFound (this.id + ' cancelOrder ' + this.json (response));
                      }
                  }
                  if (message in exceptions)
                      throw new exceptions[message] (feedback);
                  if (message !== undefined) {
                      if (message.indexOf ('throttled. Try again') >= 0)
                          throw new DDoSProtection (feedback);
                      if (message.indexOf ('problem') >= 0)
                          throw new ExchangeNotAvailable (feedback); // 'There was a problem processing your request.  If this problem persists, please contact...')
                  }
                  throw new ExchangeError (feedback);
              }
          }
        }
    }
};
