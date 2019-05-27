module Ccxt
  class Bitmex < Exchange
    def describe
      return self.class.deep_extend(super, {
        'id' => 'bitmex',
        'name' => 'BitMEX',
        'countries' => [ 'SC' ], ## Seychelles
        'version' => 'v1',
        'userAgent' => nil,
        'rateLimit' => 2000,
        'has' => {
            'CORS' => false,
            'fetchOHLCV' => true,
            'withdraw' => true,
            'editOrder' => true,
            'fetchOrder' => true,
            'fetchOrders' => true,
            'fetchOpenOrders' => true,
            'fetchClosedOrders' => true,
        },
        'timeframes' => {
            '1m' => '1m',
            '5m' => '5m',
            '1h' => '1h',
            '1d' => '1d',
        },
        'urls' => {
            'test' => 'https://testnet.bitmex.com',
            'logo' => 'https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg',
            'api' => 'https://www.bitmex.com',
            'www' => 'https://www.bitmex.com',
            'doc' => [
                'https://www.bitmex.com/app/apiOverview',
                'https://github.com/BitMEX/api-connectors/tree/master/official-http',
            ],
            'fees' => 'https://www.bitmex.com/app/fees',
            'referral' => 'https://www.bitmex.com/register/rm3C16',
        },
        'api' => {
            'public' => {
                'get' => [
                    'announcement',
                    'announcement/urgent',
                    'funding',
                    'instrument',
                    'instrument/active',
                    'instrument/activeAndIndices',
                    'instrument/activeIntervals',
                    'instrument/compositeIndex',
                    'instrument/indices',
                    'insurance',
                    'leaderboard',
                    'liquidation',
                    'orderBook',
                    'orderBook/L2',
                    'quote',
                    'quote/bucketed',
                    'schema',
                    'schema/websocketHelp',
                    'settlement',
                    'stats',
                    'stats/history',
                    'trade',
                    'trade/bucketed',
                ],
            },
            'private' => {
                'get' => [
                    'apiKey',
                    'chat',
                    'chat/channels',
                    'chat/connected',
                    'execution',
                    'execution/tradeHistory',
                    'notification',
                    'order',
                    'position',
                    'user',
                    'user/affiliateStatus',
                    'user/checkReferralCode',
                    'user/commission',
                    'user/depositAddress',
                    'user/margin',
                    'user/minWithdrawalFee',
                    'user/wallet',
                    'user/walletHistory',
                    'user/walletSummary',
                ],
                'post' => [
                    'apiKey',
                    'apiKey/disable',
                    'apiKey/enable',
                    'chat',
                    'order',
                    'order/bulk',
                    'order/cancelAllAfter',
                    'order/closePosition',
                    'position/isolate',
                    'position/leverage',
                    'position/riskLimit',
                    'position/transferMargin',
                    'user/cancelWithdrawal',
                    'user/confirmEmail',
                    'user/confirmEnableTFA',
                    'user/confirmWithdrawal',
                    'user/disableTFA',
                    'user/logout',
                    'user/logoutAll',
                    'user/preferences',
                    'user/requestEnableTFA',
                    'user/requestWithdrawal',
                ],
                'put' => [
                    'order',
                    'order/bulk',
                    'user',
                ],
                'delete' => [
                    'apiKey',
                    'order',
                    'order/all',
                ],
            },
        },
        'exceptions' => {
            'Invalid API Key.' => 'AuthenticationError',
            'Access Denied' => 'PermissionDenied',
        },
        'options' => {
            'fetchTickerQuotes' => false,
        }
      })
    end

    def fetch_markets(params)
      response = self.publicGetInstrumentActiveAndIndices(params)
      result = []
      for i in (0 ... response.length)
        market = response[i]
        active = (market['state'] != 'Unlisted')
        id = market['symbol']
        baseId = market['underlying']
        quoteId = market['quoteCurrency']
        basequote = baseId + quoteId
        base = self.common_currency_code(baseId)
        quote = self.common_currency_code(quoteId)
        swap = (id == basequote)
        # 'positionCurrency' may be empty("", as Bitmex currently returns for ETHUSD)
        # so let's take the quote currency first and then adjust if needed
        positionId = self.class.safe_string_2(market, 'positionCurrency', 'quoteCurrency')
        type = nil
        future = false
        prediction = false
        position = self.common_currency_code(positionId)
        symbol = id
        if swap
          type = 'swap'
          symbol = base + '/' + quote
        elsif id.index('B_')
          prediction = true
          type = 'prediction'
        else
          future = true
          type = 'future'
        end
        precision = {
          'amount' => nil,
          'price' => nil,
        }
        lotSize = self.class.safe_float(market, 'lotSize')
        tickSize = self.class.safe_float(market, 'tickSize')
        if lotSize != nil
          precision['amount'] = self.precision_from_string(self.class.truncate_to_string(lotSize, 16))
        end
        if tickSize != nil
          precision['price'] = self.precision_from_string(self.class.truncate_to_string(tickSize, 16))
        end
        limits = {
          'amount' => {
            'min' => nil,
            'max' => nil,
          },
          'price' => {
              'min' => tickSize,
              'max'=> self.class.safe_float(market, 'maxPrice'),
          },
          'cost'=> {
              'min' => nil,
              'max'=> nil,
          },
        }
        limitField = (position === quote) ? 'cost' : 'amount'
        limits[limitField] = {
          'min'=> lotSize,
          'max'=> self.class.safe_float(market, 'maxOrderQty'),
        }
        result.push({
          'id'=> id,
          'symbol'=> symbol,
          'base'=> base,
          'quote'=> quote,
          'baseId'=> baseId,
          'quoteId'=> quoteId,
          'active'=> active,
          'precision'=> precision,
          'limits'=> limits,
          'taker'=> market['takerFee'],
          'maker'=> market['makerFee'],
          'type'=> type,
          'spot'=> false,
          'swap'=> swap,
          'future'=> future,
          'prediction'=> prediction,
          'info'=> market,
        })
      end
      return result
    end


    def fetch_balance(params={})
      self.load_markets()
      request = {'currency': 'all'}
      response = self.privateGetUserMargin(request.merge params)
      result = {'info': response}
      for b in (0 ... response.length)
        balance = response[b]
        currencyId = self.class.safe_string(balance, 'currency')
        currencyId = currencyId.upper()
        code = self.common_currency_code(currencyId)
        account = {
          'free': balance['availableMargin'],
          'used': 0.0,
          'total': balance['marginBalance'],
        }
        if code == 'BTC'
          account['free'] = account['free'] * 0.00000001
          account['total'] = account['total'] * 0.00000001
        end
        account['used'] = account['total'] - account['free']
        result[code] = account
      end
      return self.parse_balance(result)
    end

    def fetch_order_book(symbol, limit=nil, params={})
      self.load_markets()
      market = self.market(symbol)
      request = {
          'symbol': market['id'],
      }
      if limit != nil
        request['depth'] = limit
      end
      orderbook = self.publicGetOrderBookL2(request.merge params)
      result = {
        'bids': [],
        'asks': [],
        'timestamp': nil,
        'datetime': nil,
        'nonce': nil,
      }
      for o in (0 ... orderbook.length)
        order = orderbook[o]
        side = (order['side'] == 'Sell') ? 'asks' : 'bids'
        amount = self.class.safe_float(order, 'size')
        price = self.class.safe_float(order, 'price')
        # https://github.com/ccxt/ccxt/issues/4926
        # https://github.com/ccxt/ccxt/issues/4927
        # the exchange sometimes returns null price in the orderbook
        if price != nil
          result[side].append([price, amount])
        end
      end
      result['bids'] = self.class.sort_by(result['bids'], 0, true)
      result['asks'] = self.class.sort_by(result['asks'], 0)
      return result
    end

    def fetch_order(id, symbol=nil, params={})
      filter = {'filter': {'orderID': id}}
      result = self.fetch_orders(symbol, nil, nil, self.class.deep_extend(filter, params))
      numResults = result.length
      if numResults == 1
        return result[0]
      end
      raise OrderNotFound, self.id + ': The order ' + id + ' not found.'
    end

    def fetch_orders(symbol=nil, since=nil, limit=nil, params={})
      self.load_markets()
      market = nil
      request = {}
      if symbol != nil
        market = self.market(symbol)
        request['symbol'] = market['id']
      end
      if since != nil
        request['startTime'] = self.class.iso8601(since)
      end
      if limit != nil
        request['count'] = limit
      end
      request = self.class.deep_extend(request, params)
      # why the hassle? urlencode in python is kinda broken for nested dicts.
      # E.g. self.class.urlencode({"filter": {"open": true}}) will return "filter={'open':+true}"
      # Bitmex doesn't like that. Hence resorting to self hack.
      if request.include?('filter')
        request['filter'] = self.class.json(request['filter'])
      end
      response = self.privateGetOrder(request)
      return self.parse_orders(response, market, since, limit)
    end

    def fetch_open_orders(symbol=nil, since=nil, limit=nil, params={})
      filter_params = {'filter': {'open': true}}
      return self.fetch_orders(symbol, since, limit, self.class.deep_extend(filter_params, params))
    end

    def fetch_closed_orders(symbol=nil, since=nil, limit=nil, params={})
      # Bitmex barfs if you set 'open': false in the filter ...
      orders = self.fetch_orders(symbol, since, limit, params)
      return self.class.filter_by(orders, 'status', 'closed')
    end

    def fetch_my_trades(symbol=nil, since=nil, limit=nil, params={})
      self.load_markets()
      market = nil
      request = {}
      if symbol != nil
        market = self.market(symbol)
        request['symbol'] = market['id']
      end
      if since != nil
        request['startTime'] = self.class.iso8601(since)
      end
      if limit != nil
        request['count'] = limit
      end
      request = self.class.deep_extend(request, params)
      # why the hassle? urlencode in python is kinda broken for nested dicts.
      # E.g. self.class.urlencode({"filter": {"open": true}}) will return "filter={'open':+true}"
      # Bitmex doesn't like that. Hence resorting to self hack.
      if request.include?('filter')
        request['filter'] = self.class.json(request['filter'])
      end
      response = self.privateGetExecutionTradeHistory(request)
      #
      #     [
      #         {
      #             "execID": "string",
      #             "orderID": "string",
      #             "clOrdID": "string",
      #             "clOrdLinkID": "string",
      #             "account": 0,
      #             "symbol": "string",
      #             "side": "string",
      #             "lastQty": 0,
      #             "lastPx": 0,
      #             "underlyingLastPx": 0,
      #             "lastMkt": "string",
      #             "lastLiquidityInd": "string",
      #             "simpleOrderQty": 0,
      #             "orderQty": 0,
      #             "price": 0,
      #             "displayQty": 0,
      #             "stopPx": 0,
      #             "pegOffsetValue": 0,
      #             "pegPriceType": "string",
      #             "currency": "string",
      #             "settlCurrency": "string",
      #             "execType": "string",
      #             "ordType": "string",
      #             "timeInForce": "string",
      #             "execInst": "string",
      #             "contingencyType": "string",
      #             "exDestination": "string",
      #             "ordStatus": "string",
      #             "triggered": "string",
      #             "workingIndicator": true,
      #             "ordRejReason": "string",
      #             "simpleLeavesQty": 0,
      #             "leavesQty": 0,
      #             "simpleCumQty": 0,
      #             "cumQty": 0,
      #             "avgPx": 0,
      #             "commission": 0,
      #             "tradePublishIndicator": "string",
      #             "multiLegReportingType": "string",
      #             "text": "string",
      #             "trdMatchID": "string",
      #             "execCost": 0,
      #             "execComm": 0,
      #             "homeNotional": 0,
      #             "foreignNotional": 0,
      #             "transactTime": "2019-03-05T12:47:02.762Z",
      #             "timestamp": "2019-03-05T12:47:02.762Z"
      #         }
      #     ]
      #
      return self.parse_trades(response, market, since, limit)
    end

    # def fetch_ticker(self, symbol, params={}):
    #     self.load_markets()
    #     market = self.market(symbol)
    #     if not market['active']:
    #         raise ExchangeError(self.id + ': symbol ' + symbol + ' is delisted')
    #     tickers = self.fetch_tickers([symbol], params)
    #     ticker = self.class.safe_value(tickers, symbol)
    #     if ticker is None:
    #         raise ExchangeError(self.id + ' ticker symbol ' + symbol + ' not found')
    #     return ticker

    def fetch_ticker(symbol, params={})
      self.load_markets()
      market = self.market(symbol)
      if not market['active']
        raise ExchangeError, self.id + ': symbol ' + symbol + ' is delisted'
      end
      # why the extra call here?
      tickers = self.fetch_tickers([symbol], params)
      ticker = self.class.safe_value(tickers, symbol)
      if ticker.nil?
        raise ExchangeError, self.id + ' ticker symbol ' + symbol + ' not found'
      end
      return ticker
    end

    def fetch_tickers(symbols=nil, params={})
      self.load_markets()
      response = self.publicGetInstrumentActiveAndIndices(params)
      result = {}
      for i in (0 ... response.length)
        ticker = self.parse_ticker(response[i])
        symbol = self.class.safe_string(ticker, 'symbol')
        if symbol != nil
          result[symbol] = ticker
        end
      end
      return result
    end

    def parse_ticker(ticker, market=nil)
      #
      #     {                        symbol: "ETHH19",
      #                           rootSymbol: "ETH",
      #                                state: "Open",
      #                                  typ: "FFCCSX",
      #                              listing: "2018-12-17T04:00:00.000Z",
      #                                front: "2019-02-22T12:00:00.000Z",
      #                               expiry: "2019-03-29T12:00:00.000Z",
      #                               settle: "2019-03-29T12:00:00.000Z",
      #                       relistInterval:  null,
      #                           inverseLeg: "",
      #                              sellLeg: "",
      #                               buyLeg: "",
      #                     optionStrikePcnt:  null,
      #                    optionStrikeRound:  null,
      #                    optionStrikePrice:  null,
      #                     optionMultiplier:  null,
      #                     positionCurrency: "ETH",
      #                           underlying: "ETH",
      #                        quoteCurrency: "XBT",
      #                     underlyingSymbol: "ETHXBT=",
      #                            reference: "BMEX",
      #                      referenceSymbol: ".BETHXBT30M",
      #                         calcInterval:  null,
      #                      publishInterval:  null,
      #                          publishTime:  null,
      #                          maxOrderQty:  100000000,
      #                             maxPrice:  10,
      #                              lotSize:  1,
      #                             tickSize:  0.00001,
      #                           multiplier:  100000000,
      #                        settlCurrency: "XBt",
      #       underlyingToPositionMultiplier:  1,
      #         underlyingToSettleMultiplier:  null,
      #              quoteToSettleMultiplier:  100000000,
      #                             isQuanto:  false,
      #                            isInverse:  false,
      #                           initMargin:  0.02,
      #                          maintMargin:  0.01,
      #                            riskLimit:  5000000000,
      #                             riskStep:  5000000000,
      #                                limit:  null,
      #                               capped:  false,
      #                                taxed:  true,
      #                           deleverage:  true,
      #                             makerFee:  -0.0005,
      #                             takerFee:  0.0025,
      #                        settlementFee:  0,
      #                         insuranceFee:  0,
      #                    fundingBaseSymbol: "",
      #                   fundingQuoteSymbol: "",
      #                 fundingPremiumSymbol: "",
      #                     fundingTimestamp:  null,
      #                      fundingInterval:  null,
      #                          fundingRate:  null,
      #                indicativeFundingRate:  null,
      #                   rebalanceTimestamp:  null,
      #                    rebalanceInterval:  null,
      #                     openingTimestamp: "2019-02-13T08:00:00.000Z",
      #                     closingTimestamp: "2019-02-13T09:00:00.000Z",
      #                      sessionInterval: "2000-01-01T01:00:00.000Z",
      #                       prevClosePrice:  0.03347,
      #                       limitDownPrice:  null,
      #                         limitUpPrice:  null,
      #               bankruptLimitDownPrice:  null,
      #                 bankruptLimitUpPrice:  null,
      #                      prevTotalVolume:  1386531,
      #                          totalVolume:  1387062,
      #                               volume:  531,
      #                            volume24h:  17118,
      #                    prevTotalTurnover:  4741294246000,
      #                        totalTurnover:  4743103466000,
      #                             turnover:  1809220000,
      #                          turnover24h:  57919845000,
      #                      homeNotional24h:  17118,
      #                   foreignNotional24h:  579.19845,
      #                         prevPrice24h:  0.03349,
      #                                 vwap:  0.03383564,
      #                            highPrice:  0.03458,
      #                             lowPrice:  0.03329,
      #                            lastPrice:  0.03406,
      #                   lastPriceProtected:  0.03406,
      #                    lastTickDirection: "ZeroMinusTick",
      #                       lastChangePcnt:  0.017,
      #                             bidPrice:  0.03406,
      #                             midPrice:  0.034065,
      #                             askPrice:  0.03407,
      #                       impactBidPrice:  0.03406,
      #                       impactMidPrice:  0.034065,
      #                       impactAskPrice:  0.03407,
      #                         hasLiquidity:  true,
      #                         openInterest:  83679,
      #                            openValue:  285010674000,
      #                           fairMethod: "ImpactMidPrice",
      #                        fairBasisRate:  0,
      #                            fairBasis:  0,
      #                            fairPrice:  0.03406,
      #                           markMethod: "FairPrice",
      #                            markPrice:  0.03406,
      #                    indicativeTaxRate:  0,
      #                indicativeSettlePrice:  0.03406,
      #                optionUnderlyingPrice:  null,
      #                         settledPrice:  null,
      #                            timestamp: "2019-02-13T08:40:30.000Z",
      #     }
      #
      symbol = nil
      marketId = self.class.safe_string(ticker, 'symbol')
      market = self.class.safe_value(self.markets_by_id, marketId, market)
      if market != nil
        symbol = market['symbol']
      end
      timestamp = self.class.parse8601(self.class.safe_string(ticker, 'timestamp'))
      open = self.class.safe_float(ticker, 'prevPrice24h')
      last = self.class.safe_float(ticker, 'lastPrice')
      change = nil
      percentage = nil
      if last != nil and open != nil
        change = last - open
        if open > 0
          percentage = change / open * 100
        end
      end
      return {
        'symbol' =>  symbol,
        'timestamp' =>  timestamp,
        'datetime' =>  self.class.iso8601(timestamp),
        'high' =>  self.class.safe_float(ticker, 'highPrice'),
        'low' =>  self.class.safe_float(ticker, 'lowPrice'),
        'bid' =>  self.class.safe_float(ticker, 'bidPrice'),
        'bidVolume' =>  nil,
        'ask' =>  self.class.safe_float(ticker, 'askPrice'),
        'askVolume' =>  nil,
        'vwap' =>  self.class.safe_float(ticker, 'vwap'),
        'open' =>  open,
        'close' =>  last,
        'last' =>  last,
        'previousClose' =>  nil,
        'change' =>  change,
        'percentage' =>  percentage,
        'average' =>  self.class.sum(open, last) / 2,
        'baseVolume' =>  self.class.safe_float(ticker, 'homeNotional24h'),
        'quoteVolume' =>  self.class.safe_float(ticker, 'foreignNotional24h'),
        'info' =>  ticker,
      }
    end

    def parse_ohlcv(ohlcv, market=nil, timeframe='1m', since=nil, limit=nil)
      puts "OHLCV: #{ohlcv}"
      timestamp = self.class.parse8601(ohlcv['timestamp'])
      return [
          timestamp,
          self.class.safe_float(ohlcv, 'open'),
          self.class.safe_float(ohlcv, 'high'),
          self.class.safe_float(ohlcv, 'low'),
          self.class.safe_float(ohlcv, 'close'),
          self.class.safe_float(ohlcv, 'volume'),
      ]
    end

    def fetch_ohlcv(symbol, timeframe='1m', since=nil, limit=nil, params={})
      self.load_markets()
      # send JSON key/value pairs, such as {"key": "value"}
      # filter by individual fields and do advanced queries on timestamps
      # filter = {'key': 'value'}
      # send a bare series(e.g. XBU) to nearest expiring contract in that series
      # you can also send a timeframe, e.g. XBU:monthly
      # timeframes: daily, weekly, monthly, quarterly, and biquarterly
      market = self.market(symbol)
      request = {
          'symbol' => market['id'],
          'binSize' => self.timeframes[timeframe],
          'partial' => true,     # true == include yet-incomplete current bins
          # 'filter': filter,  # filter by individual fields and do advanced queries
          # 'columns': [],    # will return all columns if omitted
          # 'start': 0,       # starting point for results(wtf?)
          # 'reverse': false,  # true == newest first
          # 'endTime': '',    # ending date filter for results
      }
      if limit != nil
        request['count'] = limit  # default 100, max 500
      end
      # if since is not set, they will return candles starting from 2017-01-01
      if since != nil
        ymdhms = self.class.ymdhms(since)
        request['startTime'] = ymdhms  # starting date filter for results
      end
      response = self.publicGetTradeBucketed(request.merge params)
      return self.parse_ohlcvs(response, market, timeframe, since, limit)
    end

    def parse_trade(trade, market=nil)
      #
      # fetchTrades(public)
      #
      #     {
      #         timestamp: '2018-08-28T00:00:02.735Z',
      #         symbol: 'XBTUSD',
      #         side: 'Buy',
      #         size: 2000,
      #         price: 6906.5,
      #         tickDirection: 'PlusTick',
      #         trdMatchID: 'b9a42432-0a46-6a2f-5ecc-c32e9ca4baf8',
      #         grossValue: 28958000,
      #         homeNotional: 0.28958,
      #         foreignNotional: 2000
      #     }
      #
      # fetchMyTrades(private)
      #
      #     {
      #         "execID": "string",
      #         "orderID": "string",
      #         "clOrdID": "string",
      #         "clOrdLinkID": "string",
      #         "account": 0,
      #         "symbol": "string",
      #         "side": "string",
      #         "lastQty": 0,
      #         "lastPx": 0,
      #         "underlyingLastPx": 0,
      #         "lastMkt": "string",
      #         "lastLiquidityInd": "string",
      #         "simpleOrderQty": 0,
      #         "orderQty": 0,
      #         "price": 0,
      #         "displayQty": 0,
      #         "stopPx": 0,
      #         "pegOffsetValue": 0,
      #         "pegPriceType": "string",
      #         "currency": "string",
      #         "settlCurrency": "string",
      #         "execType": "string",
      #         "ordType": "string",
      #         "timeInForce": "string",
      #         "execInst": "string",
      #         "contingencyType": "string",
      #         "exDestination": "string",
      #         "ordStatus": "string",
      #         "triggered": "string",
      #         "workingIndicator": true,
      #         "ordRejReason": "string",
      #         "simpleLeavesQty": 0,
      #         "leavesQty": 0,
      #         "simpleCumQty": 0,
      #         "cumQty": 0,
      #         "avgPx": 0,
      #         "commission": 0,
      #         "tradePublishIndicator": "string",
      #         "multiLegReportingType": "string",
      #         "text": "string",
      #         "trdMatchID": "string",
      #         "execCost": 0,
      #         "execComm": 0,
      #         "homeNotional": 0,
      #         "foreignNotional": 0,
      #         "transactTime": "2019-03-05T12:47:02.762Z",
      #         "timestamp": "2019-03-05T12:47:02.762Z"
      #     }
      #
      timestamp = self.class.parse8601(self.class.safe_string(trade, 'timestamp'))
      price = self.class.safe_float(trade, 'price')
      amount = self.class.safe_float_2(trade, 'size', 'lastQty')
      id = self.class.safe_string(trade, 'trdMatchID')
      order = self.class.safe_string(trade, 'orderID')
      side = self.class.safe_string(trade, 'side').downcase
      # price * amount doesn't work for all symbols(e.g. XBT, ETH)
      cost = self.class.safe_float(trade, 'execCost')
      if cost != nil
        cost = abs(cost) / 100000000
      end
      fee = nil
      if trade.include?('execComm')
        feeCost = self.class.safe_float(trade, 'execComm')
        feeCost = feeCost / 100000000
        currencyId = self.class.safe_string(trade, 'currency')
        currencyId = currencyId.upcase
        feeCurrency = self.common_currency_code(currencyId)
        feeRate = self.class.safe_float(trade, 'commission')
        fee = {
            'cost': feeCost,
            'currency': feeCurrency,
            'rate': feeRate,
        }
      end
      takerOrMaker = nil
      if fee != nil
        takerOrMaker = fee['cost'] < 0 ? 'maker' : 'taker'
      end
      symbol = nil
      marketId = self.class.safe_string(trade, 'symbol')
      if marketId != nil
        if self.markets_by_id.include?(marketId)
          market = self.markets_by_id[marketId]
          symbol = market['symbol']
        else
          symbol = marketId
        end
      end
      return {
        'info' => trade,
        'timestamp' => timestamp,
        'datetime' => self.class.iso8601(timestamp),
        'symbol' => symbol,
        'id' => id,
        'order' => order,
        'type' => nil,
        'takerOrMaker' => takerOrMaker,
        'side' => side,
        'price' => price,
        'cost' => cost,
        'amount' => amount,
        'fee' => fee,
      }
    end

    def parse_order_status(status)
      statuses = {
        'New': 'open',
        'PartiallyFilled': 'open',
        'Filled': 'closed',
        'DoneForDay': 'open',
        'Canceled': 'canceled',
        'PendingCancel': 'open',
        'PendingNew': 'open',
        'Rejected': 'rejected',
        'Expired': 'expired',
        'Stopped': 'open',
        'Untriggered': 'open',
        'Triggered': 'open',
      }
      return self.class.safe_string(statuses, status, status)
    end

    def parse_order(order, market=nil)
      status = self.parse_order_status(self.class.safe_string(order, 'ordStatus'))
      symbol = nil
      if market != nil
        symbol = market['symbol']
      else
        id = order['symbol']
        if self.markets_by_id.include?(id)
          market = self.markets_by_id[id]
          symbol = market['symbol']
        end
      end
      timestamp = self.class.parse8601(self.class.safe_string(order, 'timestamp'))
      lastTradeTimestamp = self.class.parse8601(self.class.safe_string(order, 'transactTime'))
      price = self.class.safe_float(order, 'price')
      amount = self.class.safe_float(order, 'orderQty')
      filled = self.class.safe_float(order, 'cumQty', 0.0)
      remaining = nil
      if amount != nil
        if filled != nil
          remaining = max(amount - filled, 0.0)
        end
      end
      average = self.class.safe_float(order, 'avgPx')
      cost = nil
      if filled != nil
        if average != nil
          cost = average * filled
        elsif price != nil
          cost = price * filled
        end
      end
      result = {
        'info': order,
        'id': str(order['orderID']),
        'timestamp': timestamp,
        'datetime': self.class.iso8601(timestamp),
        'lastTradeTimestamp': lastTradeTimestamp,
        'symbol': symbol,
        'type': order['ordType'].lower(),
        'side': order['side'].lower(),
        'price': price,
        'amount': amount,
        'cost': cost,
        'average': average,
        'filled': filled,
        'remaining': remaining,
        'status': status,
        'fee': nil,
      }
      return result
    end

    def fetch_trades(symbol, since=nil, limit=nil, params={})
      self.load_markets()
      market = self.market(symbol)
      request = {
          'symbol' => market['id'],
      }
      # puts "#{request}"
      if since != nil
        request['startTime'] = self.class.iso8601(since)
      end
      if limit != nil
        request['count'] = limit
      end
      response = self.publicGetTrade(request.merge params)
      #
      #     [
      #         {
      #             timestamp: '2018-08-28T00:00:02.735Z',
      #             symbol: 'XBTUSD',
      #             side: 'Buy',
      #             size: 2000,
      #             price: 6906.5,
      #             tickDirection: 'PlusTick',
      #             trdMatchID: 'b9a42432-0a46-6a2f-5ecc-c32e9ca4baf8',
      #             grossValue: 28958000,
      #             homeNotional: 0.28958,
      #             foreignNotional: 2000
      #         },
      #         {
      #             timestamp: '2018-08-28T00:00:03.778Z',
      #             symbol: 'XBTUSD',
      #             side: 'Sell',
      #             size: 1000,
      #             price: 6906,
      #             tickDirection: 'MinusTick',
      #             trdMatchID: '0d4f1682-5270-a800-569b-4a0eb92db97c',
      #             grossValue: 14480000,
      #             homeNotional: 0.1448,
      #             foreignNotional: 1000
      #         },
      #     ]
      #
      # puts "Response: #{response}"
      return self.parse_trades(response, market, since, limit)
    end

    def create_order(symbol, type, side, amount, price=nil, params={})
      self.load_markets()
      request = {
          'symbol' => self.market_id(symbol),
          'side' => self.class.capitalize(side),
          'orderQty' => amount,
          'ordType' => self.class.capitalize(type),
      }
      if price != nil
        request['price'] = price
      end
      response = self.privatePostOrder(request.merge params)
      order = self.parse_order(response)
      id = order['id']
      self.orders[id] = order
      return {'info': response}.merge order
    end

    def edit_order(id, symbol, type, side, amount=nil, price=nil, params={})
      self.load_markets()
      request = {
          'orderID': id,
      }
      if amount != nil
        request['orderQty'] = amount
      end
      if price != nil
        request['price'] = price
      end
      response = self.privatePutOrder(request.merge params)
      order = self.parse_order(response)
      self.orders[order['id']] = order
      return {'info': response}.merge order
    end

    def cancel_order(id, symbol=nil, params={})
      self.load_markets()
      response = self.privateDeleteOrder({'orderID': id}.merge params)
      order = response[0]
      error = self.class.safe_string(order, 'error')
      if error != nil
        if error.index('Unable to cancel order due to existing state')
          raise OrderNotFound, self.id + ' cancelOrder() failed: ' + error
        end
      end
      order = self.parse_order(order)
      self.orders[order['id']] = order
      return {'info': response}.merge order
    end

    def is_fiat(currency)
      if currency == 'EUR'
        return true
      end
      if currency == 'PLN'
        return true
      end
      return false
    end

    def withdraw(code, amount, address, tag=nil, params={})
      self.check_address(address)
      self.load_markets()
      # currency = self.currency(code)
      if code != 'BTC'
        raise ExchangeError, self.id + ' supports BTC withdrawals only, other currencies coming soon ... '
      end
      request = {
        'currency': 'XBt',  # temporarily
        'amount': amount,
        'address': address,
        # 'otpToken': '123456',  # requires if two-factor auth(OTP) is enabled
        # 'fee': 0.001,  # bitcoin network fee
      }
      response = self.privatePostUserRequestWithdrawal(request.merge params)
      return {
        'info': response,
        'id': response['transactID'],
      }
    end

    def handle_errors(code, reason, url, method, headers, body, response)
      if code == 429
        raise DDoSProtection, self.id + ' ' + body
      end
      if code >= 400
        if body
          if body[0] == '{'
            error = self.class.safe_value(response, 'error', {})
            message = self.class.safe_string(error, 'message')
            feedback = self.id + ' ' + body
            exact = self.exceptions['exact']
            if exact.include?(message)
              raise Exchange::exact[message], feedback
            end
            broad = self.exceptions['broad']
            broadKey = self.findBroadlyMatchedKey(broad, message)
            if broadKey != nil
              raise Exchange::broad[broadKey], feedback
            end
            if code == 400
              raise BadRequest, feedback
            end
            raise ExchangeError, feedback  # unknown message
          end
        end
      end
    end

    def nonce
      return self.class.milliseconds
    end

    def sign(path, api='public', method='GET', params={}, headers=nil, body=nil)
      query = '/api/' + self.version + '/' + path
      if method != 'PUT'
        if params
          query += '?' + self.class.urlencode(params)
        end
      end
      url = self.urls['api'] + query
      if api == 'private'
        self.check_required_credentials()
        auth = method + query
        expires = self.class.safe_integer(self.options, 'api-expires')
        headers = {
            'Content-Type': 'application/json',
            'api-key': self.apiKey,
        }
        expires = self.class.sum(self.class.seconds(), expires)
        expires = expires.to_s
        auth += expires
        headers['api-expires'] = expires
        if method == 'POST' or method == 'PUT'
          if params
            body = self.class.json(params)
            auth += body
          end
        end
        headers['api-signature'] = self.class.hmac(self.class.encode(auth), self.class.encode(self.secret))
      end
      return {'url' => url, 'method' => method, 'body' => body, 'headers' => headers}
    end
  end
end
