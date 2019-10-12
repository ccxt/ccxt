//
// https://www.garik.site
//
'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, InvalidAddress } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

const fs = require('fs');
const request = require("request");
const iconv = require("iconv-lite");
const crypto = require('crypto');
const md5 = require('md5');
let APISECRET = ''
fs.readFile('/root/rsa_private_key.pem', 'utf8', (err, rsa_private_key) => {
  APISECRET = rsa_private_key
});


const getLoginToken = (login, password) => {
  return new Promise((resolve, reject) => {

    setTimeout(() => {

      let ts = new Date()
      let timestamp = ts.toISOString()

      const signature = crypto.createSign('sha256');
      signature.write(timestamp.toString());
      signature.end()

      let sign = signature.sign(APISECRET, 'hex')

      const salt = 'dig?F*ckDang5PaSsWOrd&%(12lian0160630).'
      let pwd = md5(password + salt)

      let options = {
        method: 'POST',
        url: 'https://www.chaoex.com/unique/user/signLogin',
        headers:
         { Accept: '*/*',
           'User-Agent': 'MarketMaker/2.10.0',
           'Content-Type': 'application/x-www-form-urlencoded' },
        form:
         { timestamp: timestamp,
           email: login,
           pwd: pwd,
           sign: sign } };

      request(options, function (error, response, body) {
        if (error) reject(error);
        body = JSON.parse(body);
        resolve(body['attachment'])
      });

    }, 500)

  });
}

module.exports = class chaoex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'chaoex',
            'name': 'chaoex',
            'rateLimit': 500,
            'certified': true,
            'has': {
                'fetchDepositAddress': true,
                'CORS': false,
                'fetchBidsAsks': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
                'fetchFundingFees': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'web': 'https://www.chaoex.com',
                    'wapi': 'https://api.chaoex.com/wapi/v3',
                    'public': 'https://www.chaoex.com/unique/coin',
                    'v3': 'https://api.chaoex.com/api/v3',
                    'v1': 'https://www.chaoex.com/unique/coin',
                    'private': 'https://www.chaoex.com/unique/coin',
                    'quote': 'https://www.chaoex.com/unique/quote',
                    'quoteV2': 'https://www.chaoex.com/unique/quote/v2',
                    'user': 'https://www.chaoex.com/unique/user'
                },
                'www': 'https://www.chaoex.com',
                'referral': 'https://www.chaoex.com/?ref=10205187',
                'doc': 'https://github.com/chaoex-exchange/chaoex-official-api-docs/blob/master/rest-api.md',
                'fees': 'https://www.chaoex.com/en/fee/schedule',
            },
            'api': {
                'web': {
                    'get': [
                        'exchange/public/product',
                        'assetWithdraw/getAllAsset.html',
                    ],
                },
                'wapi': {
                    'post': [
                        'withdraw',
                        'sub-account/transfer',
                    ],
                    'get': [
                        'depositHistory',
                        'withdrawHistory',
                        'depositAddress',
                        'accountStatus',
                        'systemStatus',
                        'apiTradingStatus',
                        'userAssetDribbletLog',
                        'tradeFee',
                        'assetDetail',
                        'sub-account/list',
                        'sub-account/transfer/history',
                        'sub-account/assets',
                    ],
                },
                'v3': {
                    'get': [
                        'ticker/price',
                        'ticker/bookTicker',
                    ],
                },
                'quote': {
                    'get': [
                      'tradeDeepin',
                      'tradeHistory'
                    ]
                },
                'quoteV2': {
                    'get': [
                      'allRealTime'
                    ]
                },
                'user': {
                  'post': [
                    'signLogin'
                  ]
                },
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'depth',
                        'trades',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                        'ticker/allPrices',
                        'ticker/allBookTickers',
                        'ticker/price',
                        'ticker/bookTicker',
                        'allCurrencyRelations',
                        'tradeDeepin'
                    ],
                    'put': [ 'userDataStream' ],
                    'post': [ 'userDataStream' ],
                    'delete': [ 'userDataStream' ],
                },
                'private': {
                    'get': [
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades'
                    ],
                    'post': [
                        'order',
                        'order/test',
                        'customerCoinAccount'
                    ],
                    'delete': [
                        'order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.001,
                },
                // should be deleted, these are outdated and inaccurate
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'ADA': 1.0,
                        'ADX': 4.7,
                        'AION': 1.9,
                        'AMB': 11.4,
                        'APPC': 6.5,
                        'ARK': 0.1,
                        'ARN': 3.1,
                        'AST': 10.0,
                        'BAT': 18.0,
                        'BCD': 1.0,
                        'BCH': 0.001,
                        'BCPT': 10.2,
                        'BCX': 1.0,
                        'BNB': 0.7,
                        'BNT': 1.5,
                        'BQX': 1.6,
                        'BRD': 6.4,
                        'BTC': 0.001,
                        'BTG': 0.001,
                        'BTM': 5.0,
                        'BTS': 1.0,
                        'CDT': 67.0,
                        'CMT': 37.0,
                        'CND': 47.0,
                        'CTR': 5.4,
                        'DASH': 0.002,
                        'DGD': 0.06,
                        'DLT': 11.7,
                        'DNT': 51.0,
                        'EDO': 2.5,
                        'ELF': 6.5,
                        'ENG': 2.1,
                        'ENJ': 42.0,
                        'EOS': 1.0,
                        'ETC': 0.01,
                        'ETF': 1.0,
                        'ETH': 0.01,
                        'EVX': 2.5,
                        'FUEL': 45.0,
                        'FUN': 85.0,
                        'GAS': 0,
                        'GTO': 20.0,
                        'GVT': 0.53,
                        'GXS': 0.3,
                        'HCC': 0.0005,
                        'HSR': 0.0001,
                        'ICN': 3.5,
                        'ICX': 1.3,
                        'INS': 1.5,
                        'IOTA': 0.5,
                        'KMD': 0.002,
                        'KNC': 2.6,
                        'LEND': 54.0,
                        'LINK': 12.8,
                        'LLT': 54.0,
                        'LRC': 9.1,
                        'LSK': 0.1,
                        'LTC': 0.01,
                        'LUN': 0.29,
                        'MANA': 74.0,
                        'MCO': 0.86,
                        'MDA': 4.7,
                        'MOD': 2.0,
                        'MTH': 34.0,
                        'MTL': 1.9,
                        'NAV': 0.2,
                        'NEBL': 0.01,
                        'NEO': 0.0,
                        'NULS': 2.1,
                        'OAX': 8.3,
                        'OMG': 0.57,
                        'OST': 17.0,
                        'POE': 88.0,
                        'POWR': 8.6,
                        'PPT': 0.25,
                        'QSP': 21.0,
                        'QTUM': 0.01,
                        'RCN': 35.0,
                        'RDN': 2.2,
                        'REQ': 18.1,
                        'RLC': 4.1,
                        'SALT': 1.3,
                        'SBTC': 1.0,
                        'SNGLS': 42,
                        'SNM': 29.0,
                        'SNT': 32.0,
                        'STORJ': 5.9,
                        'STRAT': 0.1,
                        'SUB': 7.4,
                        'TNB': 82.0,
                        'TNT': 47.0,
                        'TRIG': 6.7,
                        'TRX': 129.0,
                        'USDT': 23.0,
                        'VEN': 1.8,
                        'VIB': 28.0,
                        'VIBE': 7.2,
                        'WABI': 3.5,
                        'WAVES': 0.002,
                        'WINGS': 9.3,
                        'WTC': 0.5,
                        'XLM': 0.01,
                        'XMR': 0.04,
                        'XRP': 0.25,
                        'XVG': 0.1,
                        'XZC': 0.02,
                        'YOYOW': 39.0,
                        'ZEC': 0.005,
                        'ZRX': 5.7,
                    },
                    'deposit': {},
                },
            },
            'commonCurrencies': {
                'BCC': 'BCC', // kept for backward-compatibility https://github.com/ccxt/ccxt/issues/4848
                'YOYO': 'YOYOW',
            },
            // exchange-specific options
            'options': {
                'fetchTradesMethod': 'publicGetAggTrades',
                'fetchTickersMethod': 'publicGetTicker24hr',
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                'defaultLimitOrderType': 'limit', // or 'limit_maker'
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'recvWindow': 5 * 1000, // 5 sec, chaoex default
                'timeDifference': 0, // the difference between system clock and chaoex clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'parseOrderToPrecision': false, // force amounts and costs in parseOrder to precision
                'newOrderRespType': {
                    'market': 'FULL', // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
                    'limit': 'RESULT', // we change it from 'ACK' by default to 'RESULT'
                },
            },
            'exceptions': {
                'API key does not exist': AuthenticationError,
                'Order would trigger immediately.': InvalidOrder,
                'Account has insufficient balance for requested action.': InsufficientFunds,
                'Rest API trading is not enabled.': ExchangeNotAvailable,
                '-1000': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                '-1013': InvalidOrder, // createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL
                '-1021': InvalidNonce, // 'your time is ahead of server'
                '-1022': AuthenticationError, // {"code":-1022,"msg":"Signature for this request is not valid."}
                '-1100': InvalidOrder, // createOrder(symbol, 1, asdf) -> 'Illegal characters found in parameter 'price'
                '-1104': ExchangeError, // Not all sent parameters were read, read 8 parameters but was sent 9
                '-1128': ExchangeError, // {"code":-1128,"msg":"Combination of optional parameters invalid."}
                '-2010': ExchangeError, // generic error code for createOrder -> 'Account has insufficient balance for requested action.', {"code":-2010,"msg":"Rest API trading is not enabled."}, etc...
                '-2011': OrderNotFound, // cancelOrder(1, 'BTC/USDT') -> 'UNKNOWN_ORDER'
                '-2013': OrderNotFound, // fetchOrder (1, 'BTC/USDT') -> 'Order does not exist'
                '-2014': AuthenticationError, // { "code":-2014, "msg": "API-key format invalid." }
                '-2015': AuthenticationError, // "Invalid API-key, IP, or permissions for action."
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async loadTimeDifference () {
        const response = await this.publicGetTime ();
        const after = this.milliseconds ();
        this.options['timeDifference'] = parseInt (after - response['serverTime']);
        return this.options['timeDifference'];
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetAllCurrencyRelations ();
        let markets = response['attachment'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['baseCurrencyId']+'/'+market['tradeCurrencyId'];
            let baseId = market['baseCurrencyNameEn'];
            let quoteId = market['tradeCurrencyNameEn'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'base': market['baseAssetPrecision'],
                'quote': market['quotePrecision'],
                'amount': market['baseAssetPrecision'],
                'price': market['quotePrecision'],
            };
            let entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                // 'active': active,
                // 'precision': precision,
                // 'limits': {
                //     'amount': {
                //         'min': Math.pow (10, -precision['amount']),
                //         'max': undefined,
                //     },
                //     'price': {
                //         'min': undefined,
                //         'max': undefined,
                //     },
                //     'cost': {
                //         'min': -1 * Math.log10 (precision['amount']),
                //         'max': undefined,
                //     },
                // },
            };
            result.push (entry);
        }
        return result;
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let key = 'quote';
        let rate = market[takerOrMaker];
        let cost = amount * rate;
        let precision = market['precision']['price'];
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
            precision = market['precision']['amount'];
        }
        cost = this.decimalToPrecision (cost, ROUND, precision, this.precisionMode);
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (cost),
        };
    }

    async fetchOrderBook (symbol, limit = 10, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketid = market['id'].split('/')
        let request = {
            'baseCurrencyId': parseInt(marketid[0]),
            'tradeCurrencyId': parseInt(marketid[1]),
            'limit': parseInt(limit)
        };
        if (limit !== undefined)
            request['limit'] = limit; // default = maximum = 100
        let response = await this.quoteGetTradeDeepin (this.extend (request, params));
        let bids = []
        let asks = []
        let countFor = 0
        if(response['attachment']['asks'].length > response['attachment']['bids'].length){
          countFor = response['attachment']['asks'].length
        }else{
          countFor = response['attachment']['bids'].length
        }
        for (let i = 0; i <= countFor; i++) {
          if(i == countFor){
            let orderbook = {
              bids: bids,
              asks: asks,
              timestamp: undefined,
              datetime: undefined,
              nonce: undefined
            };
            orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
            return orderbook;
          }else{
            if(typeof response['attachment']['bids'][i] !== 'undefined') bids.push([parseFloat(response['attachment']['bids'][i][0]), parseFloat(response['attachment']['bids'][i][1])])
            if(typeof response['attachment']['asks'][i] !== 'undefined') asks.push([parseFloat(response['attachment']['asks'][i][0]), parseFloat(response['attachment']['asks'][i][1])])
          }
        }
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketid = market['id'].split('/')
        let request = {
            'baseCurrencyId': marketid[0],
            'tradeCurrencyId': marketid[1],
            'limit': 1
        };
        let response = await this.quoteGetTradeDeepin (this.extend (request, params));


        return { symbol: market['symbol'],
        timestamp: undefined,
        datetime: '2019-05-07T01:09:47.197Z',
        high: undefined,
        low: undefined,
        bid: parseFloat(response['attachment']['bids'][0][0]),
        bidVolume: parseFloat(response['attachment']['bids'][0][1]),
        ask: parseFloat(response['attachment']['asks'][0][0]),
        askVolume: parseFloat(response['attachment']['asks'][0][1]),
        vwap: undefined,
        open: undefined,
        close: undefined,
        last: undefined,
        previousClose: undefined,
        change: undefined,
        percentage: undefined,
        average: undefined,
        baseVolume: undefined,
        quoteVolume: undefined,
        info: response };

    }

    async fetchBidsAsks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let rawTickers = await this.publicGetTickerBookTicker (params);
        return this.parseTickers (rawTickers, symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
      await this.loadMarkets ();
      let req = await this.quoteV2GetAllRealTime();

      let ret = []

      req = req['attachment']

      for (let i = 0; i <= req.length; i++) {
        if(i == req.length){
          return ret
        }else{
          let symbol = `${req[i]['baseCurrencyName']}/${req[i]['tradeCurrencyName']}`
          let timestamp = ``
          let datetime = ``
          let high = req[i]['high']
          let low = req[i]['low']
          let bid = req[i]['buy']
          let ask = req[i]['sell']
          let last = req[i]['last']
          let quoteVolume = req[i]['vol']
          let change = req[i]['changeRate']
          let baseVolume = req[i]['vol'] * low
          ret[symbol] = {
            symbol: symbol,
            timestamp: undefined,
            datetime: undefined,
            high: high,
            low: low,
            bid: bid,
            bidVolume: undefined,
            ask: ask,
            askVolume: undefined,
            vwap: undefined,
            open: undefined,
            close: undefined,
            last: last,
            previousClose: undefined,
            change: change,
            percentage: undefined,
            average: undefined,
            baseVolume: baseVolume,
            quoteVolume: quoteVolume,
            info: req[i]
          };
        }
      }
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default == max == 500
        }
        const response = await this.publicGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        if ('isDustTrade' in trade) {
            return this.parseDustTrade (trade, market);
        }
        //
        // aggregate trades
        // https://github.com/chaoex-exchange/chaoex-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
        //
        //     {
        //         "a": 26129,         // Aggregate tradeId
        //         "p": "0.01633102",  // Price
        //         "q": "4.70443515",  // Quantity
        //         "f": 27781,         // First tradeId
        //         "l": 27781,         // Last tradeId
        //         "T": 1498793709153, // Timestamp
        //         "m": true,          // Was the buyer the maker?
        //         "M": true           // Was the trade the best price match?
        //     }
        //
        // recent public trades and old public trades
        // https://github.com/chaoex-exchange/chaoex-official-api-docs/blob/master/rest-api.md#recent-trades-list
        // https://github.com/chaoex-exchange/chaoex-official-api-docs/blob/master/rest-api.md#old-trade-lookup-market_data
        //
        //     {
        //         "id": 28457,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "time": 1499865549590,
        //         "isBuyerMaker": true,
        //         "isBestMatch": true
        //     }
        //
        // private trades
        // https://github.com/chaoex-exchange/chaoex-official-api-docs/blob/master/rest-api.md#account-trade-list-user_data
        //
        //     {
        //         "symbol": "BNBBTC",
        //         "id": 28457,
        //         "orderId": 100234,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "commission": "10.10000000",
        //         "commissionAsset": "BNB",
        //         "time": 1499865549590,
        //         "isBuyer": true,
        //         "isMaker": false,
        //         "isBestMatch": true
        //     }
        //
        let timestamp = this.safeInteger2 (trade, 'T', 'time');
        let price = this.safeFloat2 (trade, 'p', 'price');
        let amount = this.safeFloat2 (trade, 'q', 'qty');
        let id = this.safeString2 (trade, 'a', 'id');
        let side = undefined;
        let order = this.safeString (trade, 'orderId');
        if ('m' in trade) {
            side = trade['m'] ? 'sell' : 'buy'; // this is reversed intentionally
        } else if ('isBuyerMaker' in trade) {
            side = trade['isBuyerMaker'] ? 'sell' : 'buy';
        } else {
            if ('isBuyer' in trade)
                side = (trade['isBuyer']) ? 'buy' : 'sell'; // this is a true side
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': this.safeFloat (trade, 'commission'),
                'currency': this.commonCurrencyCode (trade['commissionAsset']),
            };
        }
        let takerOrMaker = undefined;
        if ('isMaker' in trade)
            takerOrMaker = trade['isMaker'] ? 'maker' : 'taker';
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (trade, 'symbol');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 10, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketid = market['id'].split('/')
        let request = {
            'baseCurrencyId': marketid[0],
            'tradeCurrencyId': marketid[1],
            'limit': limit
        };
        let response = await this.quoteGetTradeHistory (this.extend (request, params));

        let ret = []

        for (let i = 0; i <= response['attachment'].length; i++) {

          if(i == response['attachment'].length){
            return ret;
          }else{
            let timestamp = parseInt(response['attachment'][i]['date'])
            let datetime = timestamp/1000
            datetime = this.iso8601 (datetime)
            ret.push({ info: response['attachment'][i],
              timestamp: timestamp,
              datetime: datetime,
              symbol: market['symbol'],
              id: response['attachment'][i]['tid'],
              order: undefined,
              type: 'limit',
              takerOrMaker: undefined,
              side: response['attachment'][i]['type'],
              price: response['attachment'][i]['price'],
              amount: response['attachment'][i]['amount'],
              cost: undefined,
              fee: undefined });
          }
        }

    }

    parseOrder (order, market = undefined) {
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        let timestamp = undefined;
        if ('time' in order)
            timestamp = order['time'];
        else if ('transactTime' in order)
            timestamp = order['transactTime'];
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'origQty');
        let filled = this.safeFloat (order, 'executedQty');
        let remaining = undefined;
        let cost = this.safeFloat (order, 'cummulativeQuoteQty');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
                if (this.options['parseOrderToPrecision']) {
                    remaining = parseFloat (this.amountToPrecision (symbol, remaining));
                }
                remaining = Math.max (remaining, 0.0);
            }
            if (price !== undefined) {
                if (cost === undefined) {
                    cost = price * filled;
                }
            }
        }
        let id = this.safeString (order, 'orderId');
        let type = this.safeString (order, 'type');
        if (type !== undefined) {
            type = type.toLowerCase ();
            if (type === 'market') {
                if (price === 0.0) {
                    if ((cost !== undefined) && (filled !== undefined)) {
                        if ((cost > 0) && (filled > 0)) {
                            price = cost / filled;
                        }
                    }
                }
            }
        }
        let side = this.safeString (order, 'side');
        if (side !== undefined)
            side = side.toLowerCase ();
        let fee = undefined;
        let trades = undefined;
        const fills = this.safeValue (order, 'fills');
        if (fills !== undefined) {
            trades = this.parseTrades (fills, market);
            let numTrades = trades.length;
            if (numTrades > 0) {
                cost = trades[0]['cost'];
                fee = {
                    'cost': trades[0]['fee']['cost'],
                    'currency': trades[0]['fee']['currency'],
                };
                for (let i = 1; i < trades.length; i++) {
                    cost = this.sum (cost, trades[i]['cost']);
                    fee['cost'] = this.sum (fee['cost'], trades[i]['fee']['cost']);
                }
            }
        }
        let average = undefined;
        if (cost !== undefined) {
            if (filled) {
                average = cost / filled;
            }
            if (this.options['parseOrderToPrecision']) {
                cost = parseFloat (this.costToPrecision (symbol, cost));
            }
        }
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
        return result;
    }

    createOrder (pair, type, side, amount, price = undefined, params = {}) {

      return new Promise((resolve, reject) => {

        this.loadMarkets().then(markets => {

          let symbol = markets[pair]['id'].split('/')

          getLoginToken (this.apiKey, this.secret).then(auth => {

            if(auth === null){
              reject('err auth')
            }else{

              let ts = new Date()
              let timestamp = ts.toISOString()

              if(side == 'buy'){
                side = 1
              }else{
                side = 2
              }

              let options = {
                method: 'POST',
                url: 'https://www.chaoex.com/unique/order/order',
                headers:
                 { Accept: '*/*',
                   'User-Agent': 'MarketMaker/2.10.0',
                   'Content-Type': 'application/x-www-form-urlencoded' },
                form:
                 { token: auth['token'],
                   uid: auth['uid'],
                   local: 'en_US',
                   timestamp: timestamp,
                   buyOrSell: side,
                   baseCurrencyId: parseFloat(symbol[0]),
                   currencyId: parseFloat(symbol[1]),
                   fdPassword: '',
                   num: parseFloat(amount).toFixed(8),
                   price: parseFloat(price).toFixed(8),
                   source: 5,
                   type: 1 }
                 };

                 console.log(options);

              request(options, function (error, response, body) {
                if (error) reject(error);
                body = JSON.parse(body)
                // console.log(body);
                // { attachment: '15581732286991492021341121766415',
                //   message: null,
                //   status: 200 }
                let result = {
                    'info': body,
                    'id': body.attachment,
                    'symbol': pair,
                    'type': 'limit',
                    'side': side,
                    'status': 'open',
                };
                resolve (result);
              });

            }

          }, err => reject(err))

        }, err => console.log(err))

      });

    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let origClientOrderId = this.safeValue (params, 'origClientOrderId');
        let request = {
            'symbol': market['id'],
        };
        if (origClientOrderId !== undefined)
            request['origClientOrderId'] = origClientOrderId;
        else
            request['orderId'] = parseInt (id);
        let response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this.privateGetAllOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "LTCBTC",
        //             "orderId": 1,
        //             "clientOrderId": "myOrder1",
        //             "price": "0.1",
        //             "origQty": "1.0",
        //             "executedQty": "0.0",
        //             "cummulativeQuoteQty": "0.0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "icebergQty": "0.0",
        //             "time": 1499827319559,
        //             "updateTime": 1499827319559,
        //             "isWorking": true
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed');
    }

    cancelOrder (id, pair = undefined, params = {}) {

      return new Promise((resolve, reject) => {

        let ts = new Date()
        let timestamp = ts.toISOString()

        this.loadMarkets().then(markets => {

          let symbol = markets[pair]['id'].split('/')

          getLoginToken (this.apiKey, this.secret).then(auth => {

            if(auth === null){
              reject('err auth')
            }else{

              let options = {
                method: 'POST',
                url: 'https://www.chaoex.com/unique/order/cancel',
                headers:
                 { Accept: '*/*',
                   'User-Agent': 'MarketMaker/2.10.0',
                   'Content-Type': 'application/x-www-form-urlencoded' },
                form:
                 { token: auth['token'],
                   uid: auth['uid'],
                   local: 'en_US',
                   timestamp: timestamp,
                   currencyId: parseFloat(symbol[1]),
                   orderNo: id,
                   source: 1,
                   fdPassword: ''
                  } };

              request(options, function (error, response, body) {
                if (error) reject(error);
                body = JSON.parse(body)
                resolve ({
                  'id': id,
                  'info': body
                });
              });

            }

          }, err => reject(err))

        }, err => reject(err))

      });

    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
        };
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.privateGetMyTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "BNBBTC",
        //             "id": 28457,
        //             "orderId": 100234,
        //             "price": "4.00000100",
        //             "qty": "12.00000000",
        //             "commission": "10.10000000",
        //             "commissionAsset": "BNB",
        //             "time": 1499865549590,
        //             "isBuyer": true,
        //             "isMaker": false,
        //             "isBestMatch": true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyDustTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        //
        // Bianance provides an opportunity to trade insignificant (i.e. non-tradable and non-withdrawable)
        // token leftovers (of any asset) into `BNB` coin which in turn can be used to pay trading fees with it.
        // The corresponding trades history is called the `Dust Log` and can be requested via the following end-point:
        // https://github.com/chaoex-exchange/chaoex-official-api-docs/blob/master/wapi-api.md#dustlog-user_data
        //
        let request = this.extend ({}, params);
        let response = await this.wapiGetUserAssetDribbletLog (request);
        // { success:    true,
        //   results: { total:    1,
        //               rows: [ {     transfered_total: "1.06468458",
        //                         service_charge_total: "0.02172826",
        //                                      tran_id: 2701371634,
        //                                         logs: [ {              tranId:  2701371634,
        //                                                   serviceChargeAmount: "0.00012819",
        //                                                                   uid: "35103861",
        //                                                                amount: "0.8012",
        //                                                           operateTime: "2018-10-07 17:56:07",
        //                                                      transferedAmount: "0.00628141",
        //                                                             fromAsset: "ADA"                  } ],
        //                                 operate_time: "2018-10-07 17:56:06"                                } ] } }
        let rows = response['results']['rows'];
        let data = [];
        for (let i = 0; i < rows.length; i++) {
            let logs = rows[i]['logs'];
            for (let j = 0; j < logs.length; j++) {
                logs[j]['isDustTrade'] = true;
                data.push (logs[j]);
            }
        }
        const trades = this.parseTrades (data, undefined, since, limit);
        return this.filterBySinceLimit (trades, since, limit);
    }

    parseDustTrade (trade, market = undefined) {
        // {              tranId:  2701371634,
        //   serviceChargeAmount: "0.00012819",
        //                   uid: "35103861",
        //                amount: "0.8012",
        //           operateTime: "2018-10-07 17:56:07",
        //      transferedAmount: "0.00628141",
        //             fromAsset: "ADA"                  },
        let order = this.safeString (trade, 'tranId');
        let time = this.safeString (trade, 'operateTime');
        let timestamp = this.parse8601 (time);
        let datetime = this.iso8601 (timestamp);
        let tradedCurrency = this.safeCurrencyCode (trade, 'fromAsset');
        let earnedCurrency = this.currency ('BNB')['code'];
        let applicantSymbol = earnedCurrency + '/' + tradedCurrency;
        let tradedCurrencyIsQuote = false;
        if (applicantSymbol in this.markets) {
            tradedCurrencyIsQuote = true;
        }
        //
        // Warning
        // chaoex dust trade `fee` is already excluded from the `BNB` earning reported in the `Dust Log`.
        // So the parser should either set the `fee.cost` to `0` or add it on top of the earned
        // BNB `amount` (or `cost` depending on the trade `side`). The second of the above options
        // is much more illustrative and therefore preferable.
        //
        let fee = {
            'currency': earnedCurrency,
            'cost': this.safeFloat (trade, 'serviceChargeAmount'),
        };
        let symbol = undefined;
        let amount = undefined;
        let cost = undefined;
        let side = undefined;
        if (tradedCurrencyIsQuote) {
            symbol = applicantSymbol;
            amount = this.sum (this.safeFloat (trade, 'transferedAmount'), fee['cost']);
            cost = this.safeFloat (trade, 'amount');
            side = 'buy';
        } else {
            symbol = tradedCurrency + '/' + earnedCurrency;
            amount = this.safeFloat (trade, 'amount');
            cost = this.sum (this.safeFloat (trade, 'transferedAmount'), fee['cost']);
            side = 'sell';
        }
        let price = cost / amount;
        let id = undefined;
        let type = undefined;
        let takerOrMaker = undefined;
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'amount': amount,
            'price': price,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let response = await this.wapiGetDepositHistory (this.extend (request, params));
        //
        //     {     success:    true,
        //       depositList: [ { insertTime:  1517425007000,
        //                            amount:  0.3,
        //                           address: "0x0123456789abcdef",
        //                        addressTag: "",
        //                              txId: "0x0123456789abcdef",
        //                             asset: "ETH",
        //                            status:  1                                                                    } ] }
        //
        return this.parseTransactions (response['depositList'], currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let response = await this.wapiGetWithdrawHistory (this.extend (request, params));
        //
        //     { withdrawList: [ {      amount:  14,
        //                             address: "0x0123456789abcdef...",
        //                         successTime:  1514489710000,
        //                          addressTag: "",
        //                                txId: "0x0123456789abcdef...",
        //                                  id: "0123456789abcdef...",
        //                               asset: "ETH",
        //                           applyTime:  1514488724000,
        //                              status:  6                       },
        //                       {      amount:  7600,
        //                             address: "0x0123456789abcdef...",
        //                         successTime:  1515323226000,
        //                          addressTag: "",
        //                                txId: "0x0123456789abcdef...",
        //                                  id: "0123456789abcdef...",
        //                               asset: "ICN",
        //                           applyTime:  1515322539000,
        //                              status:  6                       }  ],
        //            success:    true                                         }
        //
        return this.parseTransactions (response['withdrawList'], currency, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        if (type === undefined) {
            return status;
        }
        let statuses = {
            'deposit': {
                '0': 'pending',
                '1': 'ok',
            },
            'withdrawal': {
                '0': 'pending', // Email Sent
                '1': 'canceled', // Cancelled (different from 1 = ok in deposits)
                '2': 'pending', // Awaiting Approval
                '3': 'failed', // Rejected
                '4': 'pending', // Processing
                '5': 'failed', // Failure
                '6': 'ok', // Completed
            },
        };
        return (status in statuses[type]) ? statuses[type][status] : status;
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //      { insertTime:  1517425007000,
        //            amount:  0.3,
        //           address: "0x0123456789abcdef",
        //        addressTag: "",
        //              txId: "0x0123456789abcdef",
        //             asset: "ETH",
        //            status:  1                                                                    }
        //
        // fetchWithdrawals
        //
        //       {      amount:  14,
        //             address: "0x0123456789abcdef...",
        //         successTime:  1514489710000,
        //          addressTag: "",
        //                txId: "0x0123456789abcdef...",
        //                  id: "0123456789abcdef...",
        //               asset: "ETH",
        //           applyTime:  1514488724000,
        //              status:  6                       }
        //
        let id = this.safeString (transaction, 'id');
        let address = this.safeString (transaction, 'address');
        let tag = this.safeString (transaction, 'addressTag'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let txid = this.safeValue (transaction, 'txId');
        let code = undefined;
        let currencyId = this.safeString (transaction, 'asset');
        if (currencyId in this.currencies_by_id) {
            currency = this.currencies_by_id[currencyId];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        if (currency !== undefined) {
            code = currency['code'];
        }
        let timestamp = undefined;
        let insertTime = this.safeInteger (transaction, 'insertTime');
        let applyTime = this.safeInteger (transaction, 'applyTime');
        let type = this.safeString (transaction, 'type');
        if (type === undefined) {
            if ((insertTime !== undefined) && (applyTime === undefined)) {
                type = 'deposit';
                timestamp = insertTime;
            } else if ((insertTime === undefined) && (applyTime !== undefined)) {
                type = 'withdrawal';
                timestamp = applyTime;
            }
        }
        let status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        let amount = this.safeFloat (transaction, 'amount');
        const feeCost = undefined;
        let fee = {
            'cost': feeCost,
            'currency': code,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
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

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.wapiGetDepositAddress (this.extend ({
            'asset': currency['id'],
        }, params));
        const success = this.safeValue (response, 'success');
        if (success === undefined || !success) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress returned an empty response – create the deposit address in the user settings first.');
        }
        const address = this.safeString (response, 'address');
        const tag = this.safeString (response, 'addressTag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
            'info': response,
        };
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        let response = await this.wapiGetAssetDetail ();
        //
        //     {
        //         "success": true,
        //         "assetDetail": {
        //             "CTR": {
        //                 "minWithdrawAmount": "70.00000000", //min withdraw amount
        //                 "depositStatus": false,//deposit status
        //                 "withdrawFee": 35, // withdraw fee
        //                 "withdrawStatus": true, //withdraw status
        //                 "depositTip": "Delisted, Deposit Suspended" //reason
        //             },
        //             "SKY": {
        //                 "minWithdrawAmount": "0.02000000",
        //                 "depositStatus": true,
        //                 "withdrawFee": 0.01,
        //                 "withdrawStatus": true
        //             }
        //         }
        //     }
        //
        let detail = this.safeValue (response, 'assetDetail');
        let ids = Object.keys (detail);
        let withdrawFees = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let code = this.commonCurrencyCode (id);
            withdrawFees[code] = this.safeFloat (detail[id], 'withdrawFee');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let name = address.slice (0, 20);
        let request = {
            'asset': currency['id'],
            'address': address,
            'amount': parseFloat (amount),
            'name': name,
        };
        if (tag)
            request['addressTag'] = tag;
        let response = await this.wapiPostWithdraw (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    fetchBalance (params = {}) {

      return new Promise((resolve, reject) => {

        let ts = new Date()
        let timestamp = ts.toISOString()

        getLoginToken (this.apiKey, this.secret).then(auth => {

          if(auth === null){
            reject('err auth')
          }else{

            let options = {
              method: 'POST',
              url: 'https://www.chaoex.com/unique/coin/customerCoinAccount',
              headers:
               { Accept: '*/*',
                 'User-Agent': 'MarketMaker/2.10.0',
                 'Content-Type': 'application/x-www-form-urlencoded' },
              form:
               { token: auth['token'],
                 uid: auth['uid'],
                 local: 'en_US',
                 timestamp: timestamp } };

            request(options, function (error, response, body) {
              if (error) reject(error);
              body = JSON.parse(body)
              if(typeof body['attachment']['coinList'] === 'undefined') reject('err')
              let balance = body['attachment']['coinList']
              let ret = {}
              let free = {}
              let used = {}
              let total = {}
              ret['info'] = body
              for (var i = 0; i <= balance.length; i++) {
                if(i == balance.length){
                  ret['free'] = free
                  ret['used'] = used
                  ret['total'] = total
                  resolve(ret)
                }else{
                  ret[balance[i]['currencyNameEn']] = {
                    free: parseFloat(balance[i]['freezeAmount']),
                    used: parseFloat(balance[i]['lockAmount']),
                    total: parseFloat(balance[i]['amount'])
                  }
                  free[balance[i]['currencyNameEn']] = parseFloat(balance[i]['freezeAmount'])
                  used[balance[i]['currencyNameEn']] = parseFloat(balance[i]['lockAmount'])
                  total[balance[i]['currencyNameEn']] = parseFloat(balance[i]['amount'])
                }
              }
            });

          }

        }, err => reject(err))

      });

    }

    fetchOpenOrders (params = {}) {

      return new Promise((resolve, reject) => {

        this.loadMarkets().then(markets => {

          let symbol = markets[params]['id'].split('/')

          getLoginToken (this.apiKey, this.secret).then(auth => {

            if(auth === null){
              reject('err auth')
            }else{

              let ts = new Date()
              let timestamp = ts.toISOString()

              let options = {
                method: 'POST',
                url: 'https://www.chaoex.com/unique/user/trOrderListByCustomer',
                headers:
                 { Accept: '*/*',
                   'User-Agent': 'MarketMaker/2.10.0',
                   'Content-Type': 'application/x-www-form-urlencoded' },
                form:
                 { token: auth['token'],
                   uid: auth['uid'],
                   local: 'en_US',
                   timestamp: timestamp,
                   status: 11,
                   baseCurrencyId: symbol[0],
                   currencyId: symbol[1],
                   buyOrSell: 0,
                   size: 20,
                   beginTime: '2018-04-25',
                   endTime: '2118-04-26',
                   start: 1}
                 };

              request(options, function (error, response, body) {
                if (error) reject(error);
                body = JSON.parse(body)
                // [ { currencyNameEn: 'ORGT',
                //     remainNum: '1000.000000',
                //     orderNo: '15581732286991492021341121766415',
                //     dealAmount: 0,
                //     fee: '0.000000',
                //     num: '1000.000000',
                //     tradeNum: '0.000000',
                //     baseCurrencyId: 1,
                //     baseCurrencyName: 'organictoken',
                //     baseCurrencyNameEn: 'ORGT',
                //     buyOrSell: 2,
                //     orderTime: '2019-05-18 17:53:49',
                //     currencyName: 'organictoken',
                //     price: '0.100000',
                //     averagePrice: '0.000000',
                //     status: 0 } ]
                let orders = []
                if(typeof body['attachment']['list'] === 'undefined') reject('err')
                for (var i = 0; i <= body['attachment']['list'].length; i++) {
                  if(i == body['attachment']['list'].length){
                    resolve(orders)
                  }else{
                    let side = 'buy'
                    if(body['attachment']['list'][i].buyOrSell == 2){
                      side = 'sell'
                    }
                    orders.push({
                      amount: parseFloat(body['attachment']['list'][i].num),
                      cost: 0,
                      datetime: null,
                      filled: 0,
                      id: body['attachment']['list'][i].orderNo,
                      info: body['attachment']['list'][i],
                      lastTradeTimestamp: null,
                      price: parseFloat(body['attachment']['list'][i].price),
                      remaining: null,
                      side: side,
                      status: "open",
                      timestamp: null,
                      type: "limit",
                    })
                  }
                }
              });

            }

          }, err => reject(err))

        }, err => console.log(err))

      });

    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {

        let url = this.urls['api'][api];
        url += '/' + path;

        if (Object.keys (params).length)
            url += '?' + this.urlencode (params);

        return { 'url': url, 'method': method, 'body': body, 'headers': headers };


    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if ((code === 418) || (code === 429))
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf ('Price * QTY is zero or less') >= 0)
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            if (body.indexOf ('LOT_SIZE') >= 0)
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size ' + body);
            if (body.indexOf ('PRICE_FILTER') >= 0)
                throw new InvalidOrder (this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid float value in general, use this.priceToPrecision (symbol, amount) ' + body);
        }
        if (body.length > 0) {
            if (body[0] === '{') {
                // check success value for wapi endpoints
                // response in format {'msg': 'The coin does not exist.', 'success': true/false}
                let success = this.safeValue (response, 'success', true);
                if (!success) {
                    let message = this.safeString (response, 'msg');
                    let parsedMessage = undefined;
                    if (message !== undefined) {
                        try {
                            parsedMessage = JSON.parse (message);
                        } catch (e) {
                            // do nothing
                            parsedMessage = undefined;
                        }
                        if (parsedMessage !== undefined) {
                            response = parsedMessage;
                        }
                    }
                }
                const exceptions = this.exceptions;
                const message = this.safeString (response, 'msg');
                if (message in exceptions) {
                    const ExceptionClass = exceptions[message];
                    throw new ExceptionClass (this.id + ' ' + message);
                }
                // checks against error codes
                let error = this.safeString (response, 'code');
                if (error !== undefined) {
                    if (error in exceptions) {
                        // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
                        // despite that their message is very confusing, it is raised by chaoex
                        // on a temporary ban (the API key is valid, but disabled for a while)
                        if ((error === '-2015') && this.options['hasAlreadyAuthenticatedSuccessfully']) {
                            throw new DDoSProtection (this.id + ' temporary banned: ' + body);
                        }
                        throw new exceptions[error] (this.id + ' ' + body);
                    } else {
                        throw new ExchangeError (this.id + ' ' + body);
                    }
                }
                if (!success) {
                    throw new ExchangeError (this.id + ' ' + body);
                }
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }
};
