# import base64
# import hashlib
# import math
# from ccxt.base.errors import ExchangeError
# from ccxt.base.errors import AuthenticationError
# from ccxt.base.errors import PermissionDenied
# from ccxt.base.errors import ArgumentsRequired
# from ccxt.base.errors import InsufficientFunds
# from ccxt.base.errors import InvalidAddress
# from ccxt.base.errors import InvalidOrder
# from ccxt.base.errors import OrderNotFound
# from ccxt.base.errors import CancelPending
# from ccxt.base.errors import DDoSProtection
# from ccxt.base.errors import ExchangeNotAvailable
# from ccxt.base.errors import InvalidNonce
# from ccxt.base.decimal_to_precision import TRUNCATE
# from ccxt.base.decimal_to_precision import DECIMAL_PLACES

module Ccxt
  class Kraken < Exchange
    attr_accessor :marketsByAltname

    def describe()
      return self.deep_extend(super, {
        'id' => 'kraken',
        'name' => 'Kraken',
        'countries' => ['US'],
        'version' => '0',
        'rateLimit' => 3000,
        'certified' => true,
        'has' => {
          'createDepositAddress' => true,
          'fetchDepositAddress' => true,
          'fetchTradingFee' => true,
          'fetchTradingFees' => true,
          'CORS' => false,
          'fetchCurrencies' => true,
          'fetchTickers' => true,
          'fetchOHLCV' => true,
          'fetchOrder' => true,
          'fetchOpenOrders' => true,
          'fetchClosedOrders' => true,
          'fetchMyTrades' => true,
          'fetchWithdrawals' => true,
          'fetchDeposits' => true,
          'withdraw' => true,
          'fetchLedgerEntry' => true,
          'fetchLedger' => true,
        },
        'marketsByAltname' => {},
        'timeframes' => {
          '1m' => '1',
          '5m' => '5',
          '15m' => '15',
          '30m' => '30',
          '1h' => '60',
          '4h' => '240',
          '1d' => '1440',
          '1w' => '10080',
          '2w' => '21600',
        },
        'urls' => {
          'logo' => 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
          'api' => {
            'public' => 'https://api.kraken.com',
            'private' => 'https://api.kraken.com',
            'zendesk' => 'https://support.kraken.com/hc/en-us/articles/',
          },
          'www' => 'https://www.kraken.com',
          'doc' => [
            'https://www.kraken.com/en-us/help/api',
            'https://github.com/nothingisdead/npm-kraken-api',
          ],
          'fees' => 'https://www.kraken.com/en-us/help/fees',
        },
        'fees' => {
          'trading' => {
            'tierBased' => true,
            'percentage' => true,
            'taker' => 0.26 / 100,
            'maker' => 0.16 / 100,
            'tiers' => {
              'taker' => [
                [0, 0.0026],
                [50000, 0.0024],
                [100000, 0.0022],
                [250000, 0.0020],
                [500000, 0.0018],
                [1000000, 0.0016],
                [2500000, 0.0014],
                [5000000, 0.0012],
                [10000000, 0.0001],
              ],
              'maker' => [
                [0, 0.0016],
                [50000, 0.0014],
                [100000, 0.0012],
                [250000, 0.0010],
                [500000, 0.0008],
                [1000000, 0.0006],
                [2500000, 0.0004],
                [5000000, 0.0002],
                [10000000, 0.0],
              ],
            },
          },
          # self is a bad way of hardcoding fees that change on daily basis
          # hardcoding is now considered obsolete, we will remove all of it eventually
          'funding' => {
            'tierBased' => false,
            'percentage' => false,
            'withdraw' => {
              'BTC' => 0.001,
              'ETH' => 0.005,
              'XRP' => 0.02,
              'XLM' => 0.00002,
              'LTC' => 0.02,
              'DOGE' => 2,
              'ZEC' => 0.00010,
              'ICN' => 0.02,
              'REP' => 0.01,
              'ETC' => 0.005,
              'MLN' => 0.003,
              'XMR' => 0.05,
              'DASH' => 0.005,
              'GNO' => 0.01,
              'EOS' => 0.5,
              'BCH' => 0.001,
              'XTZ' => 0.05,
              'USD' => 5,  # if domestic wire
              'EUR' => 5,  # if domestic wire
              'CAD' => 10,  # CAD EFT Withdrawal
              'JPY' => 300,  # if domestic wire
            },
            'deposit' => {
              'BTC' => 0,
              'ETH' => 0,
              'XRP' => 0,
              'XLM' => 0,
              'LTC' => 0,
              'DOGE' => 0,
              'ZEC' => 0,
              'ICN' => 0,
              'REP' => 0,
              'ETC' => 0,
              'MLN' => 0,
              'XMR' => 0,
              'DASH' => 0,
              'GNO' => 0,
              'EOS' => 0,
              'BCH' => 0,
              'XTZ' => 0.05,
              'USD' => 5,  # if domestic wire
              'EUR' => 0,  # free deposit if EUR SEPA Deposit
              'CAD' => 5,  # if domestic wire
              'JPY' => 0,  # Domestic Deposit(Free, ¥5,000 deposit minimum)
            },
          },
        },
        'api' => {
          'zendesk' => {
            'get' => [
              # we should really refrain from putting fixed fee numbers and stop hardcoding
              # we will be using their web APIs to scrape all numbers from these articles
              '205893708-What-is-the-minimum-order-size-',
              '201396777-What-are-the-deposit-fees-',
              '201893608-What-are-the-withdrawal-fees-',
            ],
          },
          'public' => {
            'get' => [
              'Assets',
              'AssetPairs',
              'Depth',
              'OHLC',
              'Spread',
              'Ticker',
              'Time',
              'Trades',
            ],
          },
          'private' => {
            'post' => [
              'AddOrder',
              'AddExport',
              'Balance',
              'CancelOrder',
              'ClosedOrders',
              'DepositAddresses',
              'DepositMethods',
              'DepositStatus',
              'ExportStatus',
              'Ledgers',
              'OpenOrders',
              'OpenPositions',
              'QueryLedgers',
              'QueryOrders',
              'QueryTrades',
              'RetrieveExport',
              'RemoveExport',
              'TradeBalance',
              'TradesHistory',
              'TradeVolume',
              'Withdraw',
              'WithdrawCancel',
              'WithdrawInfo',
              'WithdrawStatus',
            ],
          },
        },
        'commonCurrencies' => {
          'XDG' => 'DOGE',
        },
        'options' => {
          'cacheDepositMethodsOnFetchDepositAddress' => true,  # will issue up to two calls in fetchDepositAddress
          'depositMethods' => {},
          'delistedMarketsById' => {},
          # cannot withdraw/deposit these
          'inactiveCurrencies' => ['CAD', 'USD', 'JPY', 'GBP'],
        },
        'exceptions' => {
          'EAPI:Invalid key' => AuthenticationError,
          'EFunding:Unknown withdraw key' => ExchangeError,
          'EFunding:Invalid amount' => InsufficientFunds,
          'EService:Unavailable' => ExchangeNotAvailable,
          'EDatabase:Internal error' => ExchangeNotAvailable,
          'EService:Busy' => ExchangeNotAvailable,
          'EQuery:Unknown asset' => ExchangeError,
          'EAPI:Rate limit exceeded' => DDoSProtection,
          'EOrder:Rate limit exceeded' => DDoSProtection,
          'EGeneral:Internal error' => ExchangeNotAvailable,
          'EGeneral:Temporary lockout' => DDoSProtection,
          'EGeneral:Permission denied' => PermissionDenied,
        },
      })
    end

    def cost_to_precision(symbol, cost)
      return self.decimal_to_precision(cost, TRUNCATE, self.markets[symbol]['precision']['price'], DECIMAL_PLACES)
    end

    def fee_to_precision(symbol, fee)
      return self.decimal_to_precision(fee, TRUNCATE, self.markets[symbol]['precision']['amount'], DECIMAL_PLACES)
    end

    def fetch_min_order_amounts()
      html = self.zendeskGet205893708WhatIsTheMinimumOrderSize()
      parts = html.split('<td class="wysiwyg-text-align-right">')
      numParts = parts.length
      if numParts < 3
        raise ExchangeError, self.id + ' fetchMinOrderAmounts HTML page markup has changed: https://support.kraken.com/hc/en-us/articles/205893708-What-is-the-minimum-order-size-'
      end
      result = {}
      # skip the part before the header and the header itself
      parts.each do |part|
        chunks = part.split('</td>')
        amountAndCode = chunks[0]
        if !['To Be Announced', '<strong>Order minimum</strong>'].include?(amountAndCode)
          pieces = amountAndCode.split(' ')
          numPieces = pieces.length
          if numPieces == 2
            amount = pieces[0].to_f
            code = self.common_currency_code(pieces[1])
            result[code] = amount
          end
        end
      end

      return result
    end

    def fetch_markets(params = {})
      markets = self.publicGetAssetPairs()
      limits = self.fetch_min_order_amounts()
      keys = markets['result'].keys
      result = []
      keys.each do |id|
        market = markets['result'][id]
        baseId = market['base']
        quoteId = market['quote']
        base = baseId
        quote = quoteId
        if base.length > 3
          if (base[0] == 'X') or (base[0] == 'Z')
            base = base[1..-1]
          end
        end
        if quote.length > 3
          if (quote[0] == 'X') or (quote[0] == 'Z')
            quote = quote[1..-1]
          end
        end
        base = self.common_currency_code(base)
        quote = self.common_currency_code(quote)
        darkpool = id.end_with?('.d')
        symbol = darkpool ? market['altname'] : (base + '/' + quote)
        maker = nil
        if market['fees_maker']
          maker = market['fees_maker'][0][1].to_f / 100
        end
        precision = {
          'amount' => market['lot_decimals'],
          'price' => market['pair_decimals'],
        }
        minAmount = 10 ** -precision['amount']
        if limits[base]
          minAmount = limits[base]
        end
        result << {
          'id' => id,
          'symbol' => symbol,
          'base' => base,
          'quote' => quote,
          'baseId' => baseId,
          'quoteId' => quoteId,
          'darkpool' => darkpool,
          'info' => market,
          'altname' => market['altname'],
          'maker' => maker,
          'taker' => market['fees'][0][1].to_f / 100,
          'active' => true,
          'precision' => precision,
          'limits' => {
            'amount' => {
              'min' => minAmount,
              'max' => 10 ** precision['amount'],
            },
            'price' => {
              'min' => 10 ** -precision['price'],
              'max' => nil,
            },
            'cost' => {
              'min' => 0,
              'max' => nil,
            },
          },
        }
      end
      result = self.append_inactive_markets(result)
      self.marketsByAltname = self.index_by(result, 'altname')
      return result
    end

    def append_inactive_markets(result)
      # result should be an array to append to
      precision = {'amount' => 8, 'price' => 8}
      costLimits = {'min' => 0, 'max' => nil}
      priceLimits = {'min' => 10 ** -precision['price'], 'max' => nil}
      amountLimits = {'min' => 10 ** -precision['amount'], 'max' => 10 ** precision['amount']}
      limits = {'amount' => amountLimits, 'price' => priceLimits, 'cost' => costLimits}
      defaults = {
        'darkpool' => false,
        'info' => nil,
        'maker' => nil,
        'taker' => nil,
        'active' => false,
        'precision' => precision,
        'limits' => limits,
      }
      markets = [
        # {'id' => 'XXLMZEUR', 'symbol' => 'XLM/EUR', 'base' => 'XLM', 'quote' => 'EUR', 'altname' => 'XLMEUR'},
      ]
      markets.each do |market|
        result << defaults.merge(market)
      end
      return result
    end

    def fetch_currencies(params = {})
      response = self.publicGetAssets(params)
      #
      #     {
      #         "error": [],
      #         "result": {
      #             "ADA": {"aclass": "currency", "altname": "ADA", "decimals": 8, "display_decimals": 6},
      #             "BCH": {"aclass": "currency", "altname": "BCH", "decimals": 10, "display_decimals": 5},
      #             ...
      #         },
      #     }
      #
      currencies = self.safe_value(response, 'result')
      ids = currencies.keys
      result = {}
      ids.each do |id|
        currency = currencies[id]
        # todo: will need to rethink the fees
        # see: https://support.kraken.com/hc/en-us/articles/201893608-What-are-the-withdrawal-fees-
        # to add support for multiple withdrawal/deposit methods and
        # differentiated fees for each particular method
        code = self.common_currency_code(self.safe_string(currency, 'altname'))
        precision = self.safe_integer(currency, 'decimals')
        # assumes all currencies are active except those listed above
        active = !self.options['inactiveCurrencies'].include?(code)
        result[code] = {
          'id' => id,
          'code' => code,
          'info' => currency,
          'name' => code,
          'active' => active,
          'fee' => nil,
          'precision' => precision,
          'limits' => {
            'amount' => {
              'min' => 10 ** -precision,
              'max' => 10 ** precision,
            },
            'price' => {
              'min' => 10 ** -precision,
              'max' => 10 ** precision,
            },
            'cost' => {
              'min' => nil,
              'max' => nil,
            },
            'withdraw' => {
              'min' => nil,
              'max' => 10 ** precision,
            },
          },
        }
      end
      return result
    end

    def fetch_trading_fees(params = {})
      self.load_markets()
      self.check_required_credentials()
      response = self.privatePostTradeVolume(params)
      tradedVolume = self.safe_float(response['result'], 'volume')
      tiers = self.fees['trading']['tiers']
      taker = tiers['taker'][1]
      maker = tiers['maker'][1]
      tiers['taker'].each do |taker_fees|
        if tradedVolume >= taker_fees[0]
          taker = taker_fees[1]
        end
      end
      tiers['maker'].each do |maker_fees|
        if tradedVolume >= maker_fees[0]
          maker = maker_fees[1]
        end
      end

      return {
        'info' => response,
        'maker' => maker,
        'taker' => taker,
      }
    end

    def fetch_order_book(symbol, limit = nil, params = {})
      self.load_markets()
      market = self.market(symbol)
      if market['darkpool']
        raise ExchangeError, self.id + ' does not provide an order book for darkpool symbol ' + symbol
      end

      request = {
        'pair' => market['id'],
      }
      request['count'] = limit if limit # 100
      response = self.publicGetDepth(request.merge(params))
      orderbook = response['result'][market['id']]
      return self.parse_order_book(orderbook)
    end

    def parse_ticker(ticker, market = nil)
      timestamp = self.milliseconds()
      symbol = nil
      symbol = market['symbol'] if market
      baseVolume = ticker['v'][1].to_f
      vwap = ticker['p'][1].to_f
      quoteVolume = nil
      quoteVolume = baseVolume * vwap if baseVolume && vwap
      last = ticker['c'][0].to_f
      return {
        'symbol' => symbol,
        'timestamp' => timestamp,
        'datetime' => self.iso8601(timestamp),
        'high' => ticker['h'][1].to_f,
        'low' => ticker['l'][1].to_f,
        'bid' => ticker['b'][0].to_f,
        'bidVolume' => nil,
        'ask' => ticker['a'][0].to_f,
        'askVolume' => nil,
        'vwap' => vwap,
        'open' => self.safe_float(ticker, 'o'),
        'close' => last,
        'last' => last,
        'previousClose' => nil,
        'change' => nil,
        'percentage' => nil,
        'average' => nil,
        'baseVolume' => baseVolume,
        'quoteVolume' => quoteVolume,
        'info' => ticker,
      }
    end

    def fetch_tickers(symbols = nil, params = {})
      self.load_markets()
      pairs = []
      self.symbols.each do |symbol|
        market = self.markets[symbol]
        if market['active'] && !market['darkpool']
          pairs << market['id']
        end
      end
      filter = pairs.join ','
      response = self.publicGetTicker({'pair' => filter}.merge params)
      tickers = response['result']
      ids = tickers.keys
      result = {}
      ids.each do |id|
        market = self.markets_by_id[id]
        symbol = market['symbol']
        ticker = tickers[id]
        result[symbol] = self.parse_ticker(ticker, market)
      end
      return result
    end

    def fetch_ticker(symbol, params = {})
      self.load_markets()
      darkpool = symbol.end_with?('.d')
      if darkpool
        raise ExchangeError, self.id + ' does not provide a ticker for darkpool symbol ' + symbol
      end
      market = self.market(symbol)
      response = self.publicGetTicker({'pair' => market['id']}.merge params)
      ticker = response['result'][market['id']]
      return self.parse_ticker(ticker, market)
    end

    def parse_ohlcv(ohlcv, market = nil, timeframe = '1m', since = nil, limit = nil)
      return [
        ohlcv[0] * 1000,
        ohlcv[1].to_f,
        ohlcv[2].to_f,
        ohlcv[3].to_f,
        ohlcv[4].to_f,
        ohlcv[6].to_f,
      ]
    end

    def fetch_ohlcv(symbol, timeframe = '1m', since = nil, limit = nil, params = {})
      self.load_markets()
      market = self.market(symbol)
      request = {
        'pair' => market['id'],
        'interval' => self.timeframes[timeframe],
      }
      if since
        request['since'] = int((since - 1) / 1000)
      end
      response = self.publicGetOHLC(request.merge(params))
      ohlcvs = response['result'][market['id']]
      return self.parse_ohlcvs(ohlcvs, market, timeframe, since, limit)
    end

    def parse_ledger_entry_type(type)
      types = {
        'trade' => 'trade',
        'withdrawal' => 'transaction',
        'deposit' => 'transaction',
        'transfer' => 'transfer',
        'margin' => 'margin',
      }
      return self.safe_string(types, type, type)
    end

    def parse_ledger_entry(item, currency = nil)
      # {'LTFK7F-N2CUX-PNY4SX' => {  refid: "TSJTGT-DT7WN-GPPQMJ",
      #                               time:  1520102320.555,
      #                               type: "trade",
      #                             aclass: "currency",
      #                              asset: "XETH",
      #                             amount: "0.1087194600",
      #                                fee: "0.0000000000",
      #                            balance: "0.2855851000"         }, ...}
      id = self.safe_string(item, 'id')
      direction = nil
      account = nil
      referenceId = self.safe_string(item, 'refid')
      referenceAccount = nil
      type = self.parse_ledger_entry_type(self.safe_string(item, 'type'))
      code = self.safeCurrencyCode(item, 'asset', currency)
      amount = self.safe_float(item, 'amount')
      if amount < 0
        direction = 'out'
        amount = abs(amount)
      else
        direction = 'in'
      end
      time = self.safe_float(item, 'time')
      timestamp = nil
      datetime = nil
      if time
        timestamp = int(time * 1000)
        datetime = self.iso8601(timestamp)
      end
      fee = {
        'cost' => self.safe_float(item, 'fee'),
        'currency' => code,
      }
      before = nil
      after = self.safe_float(item, 'balance')
      return {
        'info' => item,
        'id' => id,
        'direction' => direction,
        'account' => account,
        'referenceId' => referenceId,
        'referenceAccount' => referenceAccount,
        'type' => type,
        'currency' => code,
        'amount' => amount,
        'before' => before,
        'after' => after,
        'timestamp' => timestamp,
        'datetime' => datetime,
        'fee' => fee,
      }
    end

    def fetch_ledger(code = nil, since = nil, limit = nil, params = {})
      # https://www.kraken.com/features/api#get-ledgers-info
      self.load_markets()
      request = {}
      currency = nil
      if code
        currency = self.currency(code)
        request['asset'] = currency['id']
      end
      if since
        request['start'] = (since / 1000).to_i
      end
      response = self.privatePostLedgers(request.merge(params))
      # { error: [],
      #   result: {ledger: {'LPUAIB-TS774-UKHP7X' => {  refid: "A2B4HBV-L4MDIE-JU4N3N",
      #                                                   time:  1520103488.314,
      #                                                   type: "withdrawal",
      #                                                 aclass: "currency",
      #                                                  asset: "XETH",
      #                                                 amount: "-0.2805800000",
      #                                                    fee: "0.0050000000",
      #                                                balance: "0.0000051000"           },
      result = self.safe_value(response, 'result', {})
      ledger = self.safe_value(result, 'ledger', {})
      keys = ledger.keys
      items = []
      keys.each do |key|
        value = ledger[key]
        value['id'] = key
        items << value
      end
      return self.parse_ledger(items, currency, since, limit)
    end

    def fetch_ledger_entries_by_ids(ids, code = nil, params = {})
      # https://www.kraken.com/features/api#query-ledgers
      self.load_markets()
      ids = ','.join(ids)
      request = {'id' => ids}.merge params
      response = self.privatePostQueryLedgers(request)
      # { error: [],
      #   result: {'LPUAIB-TS774-UKHP7X' => {  refid: "A2B4HBV-L4MDIE-JU4N3N",
      #                                         time:  1520103488.314,
      #                                         type: "withdrawal",
      #                                       aclass: "currency",
      #                                        asset: "XETH",
      #                                       amount: "-0.2805800000",
      #                                          fee: "0.0050000000",
      #                                      balance: "0.0000051000"           }} }
      result = response['result']
      keys = result.keys
      items = []
      keys.each do |key|
        value = result[key]
        value['id'] = key
        items << value
      end
      return self.parse_ledger(items)
    end

    def fetch_ledger_entry(id, code = nil, params = {})
      items = self.fetchLedgerEntrysByIds([id], code, params)
      return items[0]
    end

    def parse_trade(trade, market = nil)
      timestamp = nil
      side = nil
      type = nil
      price = nil
      amount = nil
      id = nil
      order = nil
      fee = nil
      marketId = self.safe_string(trade, 'pair')
      foundMarket = self.find_market_by_altname_or_id(marketId)
      symbol = nil
      if foundMarket
        market = foundMarket
      elsif marketId
        # delisted market ids go here
        market = self.get_delisted_market_by_id(marketId)
      end
      symbol = market['symbol'] if market
      if trade['ordertxid']
        order = trade['ordertxid']
        id = self.safe_string_2(trade, 'id', 'postxid')
        timestamp = (trade['time'] * 1000).to_i
        side = trade['type']
        type = trade['ordertype']
        price = self.safe_float(trade, 'price')
        amount = self.safe_float(trade, 'vol')
        if trade['fee']
          currency = nil
          currency = market['quote'] if market
          fee = {
            'cost' => self.safe_float(trade, 'fee'),
            'currency' => currency,
          }
        end
      else
        timestamp = (trade[2] * 1000).to_i
        side = (trade[3] == 's') ? 'sell' : 'buy'
        type =  (trade[4] == 'l') ? 'limit' : 'market'
        price = trade[0].to_f
        amount = trade[1].to_f
        tradeLength = trade.length
        if tradeLength > 6
          id = trade[6]  # artificially added as per  #1794
        end
      end
      return {
        'id' => id,
        'order' => order,
        'info' => trade,
        'timestamp' => timestamp,
        'datetime' => self.iso8601(timestamp),
        'symbol' => symbol,
        'type' => type,
        'side' => side,
        'price' => price,
        'amount' => amount,
        'cost' => price * amount,
        'fee' => fee,
      }
    end

    def fetch_trades(symbol, since = nil, limit = nil, params = {})
      self.load_markets()
      market = self.market(symbol)
      id = market['id']
      response = self.publicGetTrades({'pair' => id}.merge params)
      #
      #     {
      #         "error": [],
      #         "result": {
      #             "XETHXXBT": [
      #                 ["0.032310","4.28169434",1541390792.763,"s","l",""]
      #             ],
      #             "last": "1541439421200678657"
      #         }
      #     }
      #
      result = response['result']
      trades = result[id]
      # trades is a sorted array: last(most recent trade) goes last
      length = trades.length
      return [] if length <= 0
      lastTrade = trades[length - 1]
      lastTradeId = self.safe_string(result, 'last')
      lastTrade << lastTradeId
      return self.parse_trades(trades, market, since, limit)
    end

    def fetch_balance(params = {})
      self.load_markets()
      response = self.privatePostBalance(params)
      balances = self.safe_value(response, 'result')
      if balances.nil?
        raise ExchangeNotAvailable, self.id + ' fetchBalance failed due to a malformed response ' + self.json(response)
      end
      result = {'info' => balances}
      currencies = balances.keys
      currencies.each do |currency|
        code = currency
        if self.currencies_by_id[code]
          code = self.currencies_by_id[code]['code']
        else
          # X-ISO4217-A3 standard currency codes
          if code[0] == 'X'
            code = code[1..-1]
          elsif code[0] == 'Z'
            code = code[1..-1]
          end
          code = self.common_currency_code(code)
        end
        balance = balances[currency].to_f
        account = {
          'free' => balance,
          'used' => 0.0,
          'total' => balance,
        }
        result[code] = account
      end
      return self.parse_balance(result)
    end

    def create_order(symbol, type, side, amount, price = nil, params = {})
      self.load_markets()
      market = self.market(symbol)
      order = {
        'pair' => market['id'],
        'type' => side,
        'ordertype' => type,
        'volume' => self.amount_to_precision(symbol, amount),
      }
      priceIsDefined = !!price
      marketOrder = (type == 'market')
      limitOrder = (type == 'limit')
      shouldIncludePrice = limitOrder || (!marketOrder && priceIsDefined)
      if shouldIncludePrice
        order['price'] = self.price_to_precision(symbol, price)
      end
      response = self.privatePostAddOrder(order.merge params)
      id = self.safe_value(response['result'], 'txid')
      if id && id.is_a?(Array)
        id = id.length > 1 ? id : id[0]
      end
      return {
        'id' => id,
        'info' => response,
        'timestamp' => nil,
        'datetime' => nil,
        'lastTradeTimestamp' => nil,
        'symbol' => symbol,
        'type' => type,
        'side' => side,
        'price' => price,
        'amount' => amount,
        'cost' => nil,
        'average' => nil,
        'filled' => nil,
        'remaining' => nil,
        'status' => nil,
        'fee' => nil,
        'trades' => nil,
      }
    end

    def find_market_by_altname_or_id(id)
      if self.marketsByAltname.include?(id)
        return self.marketsByAltname[id]
      elsif self.markets_by_id.include?(id)
        return self.markets_by_id[id]
      end
      return nil
    end

    def get_delisted_market_by_id(id)
      return unless id

      market = self.safe_value(self.options['delistedMarketsById'], id)

      return market if market

      baseIdStart = 0
      baseIdEnd = 3
      quoteIdStart = 3
      quoteIdEnd = 6
      if id.length == 8
        baseIdEnd = 4
        quoteIdStart = 4
        quoteIdEnd = 8
      elsif id.length == 7
        baseIdEnd = 4
        quoteIdStart = 4
        quoteIdEnd = 7
      end
      baseId = id[baseIdStart, baseIdEnd]
      quoteId = id[quoteIdStart, quoteIdEnd]
      base = baseId
      quote = quoteId
      if base.length > 3
        if (base[0] == 'X') or (base[0] == 'Z')
          base = base[1..-1]
        end
      end
      if quote.length > 3
        if (quote[0] == 'X') or (quote[0] == 'Z')
          quote = quote[1..-1]
        end
      end
      base = self.common_currency_code(base)
      quote = self.common_currency_code(quote)
      symbol = base + '/' + quote
      market = {
        'symbol' => symbol,
        'base' => base,
        'quote' => quote,
        'baseId' => baseId,
        'quoteId' => quoteId,
      }
      self.options['delistedMarketsById'][id] = market
      return market
    end

    def parse_order_status(status)
      statuses = {
        'pending' => 'open',  # order pending book entry
        'open' => 'open',
        'closed' => 'closed',
        'canceled' => 'canceled',
        'expired' => 'expired',
      }
      return self.safe_string(statuses, status, status)
    end

    def parse_order(order, market = nil)
      description = order['descr']
      side = description['type']
      type = description['ordertype']
      marketId = self.safe_string(description, 'pair')
      foundMarket = self.find_market_by_altname_or_id(marketId)
      symbol = nil
      if foundMarket
        market = foundMarket
      elsif marketId
        # delisted market ids go here
        market = self.get_delisted_market_by_id(marketId)
      end
      timestamp = int(order['opentm'] * 1000)
      amount = self.safe_float(order, 'vol')
      filled = self.safe_float(order, 'vol_exec')
      remaining = amount - filled
      fee = nil
      cost = self.safe_float(order, 'cost')
      price = self.safe_float(description, 'price')
      if (price.nil?) || (price == 0)
        price = self.safe_float(description, 'price2')
      end
      if (price.nil?) || (price == 0)
        price = self.safe_float(order, 'price', price)
      end
      average = self.safe_float(order, 'price')
      if market
        symbol = market['symbol']
        if order['fee']
          flags = order['oflags']
          feeCost = self.safe_float(order, 'fee')
          fee = {
            'cost' => feeCost,
            'rate' => nil,
          }
          if flags.match('fciq')
            fee['currency'] = market['quote']
          elsif flags.match('fcib')
            fee['currency'] = market['base']
          end
        end
      end
      status = self.parse_order_status(self.safe_string(order, 'status'))
      return {
        'id' => order['id'],
        'info' => order,
        'timestamp' => timestamp,
        'datetime' => self.iso8601(timestamp),
        'lastTradeTimestamp' => nil,
        'status' => status,
        'symbol' => symbol,
        'type' => type,
        'side' => side,
        'price' => price,
        'cost' => cost,
        'amount' => amount,
        'filled' => filled,
        'average' => average,
        'remaining' => remaining,
        'fee' => fee,
        # 'trades' => self.parse_trades(order['trades'], market),
      }
    end

    def parse_orders(orders, market = nil, since = nil, limit = nil)
      result = []
      ids = orders.keys
      ids.each do |id|
        order = {'id' => id}.merge orders[id]
        result << self.parse_order(order, market)
      end
      return self.filter_by_since_limit(result, since, limit)
    end

    def fetch_order(id, symbol = nil, params = {})
      self.load_markets()
      response = self.privatePostQueryOrders({
        'trades' => true,  # whether or not to include trades in output(optional, default false)
        'txid' => id,  # do not comma separate a list of ids - use fetchOrdersByIds instead
        # 'userref' => 'optional',  # restrict results to given user reference id(optional)
      }.merge params)
      orders = response['result']
      order = self.parse_order({'id' => id}.merge orders[id])
      return {'info' => response}.merge order
    end

    def fetch_orders_by_ids(ids, symbol = nil, params = {})
      self.load_markets()
      response = self.privatePostQueryOrders({
        'trades' => true,  # whether or not to include trades in output(optional, default false)
        'txid' => ids.join(','),  # comma delimited list of transaction ids to query info about(20 maximum)
      }.merge params)
      result = self.safe_value(response, 'result', {})
      orders = []
      orderIds = result.keys
      orderIds.each do |id|
        item = result[id]
        order = self.parse_order({'id' => id}.merge item)
        orders << order
      end
      return orders
    end

    def fetch_my_trades(symbol = nil, since = nil, limit = nil, params = {})
      self.load_markets()
      request = {
        # 'type' => 'all',  # any position, closed position, closing position, no position
        # 'trades' => false,  # whether or not to include trades related to position in output
        # 'start' => 1234567890,  # starting unix timestamp or trade tx id of results(exclusive)
        # 'end' => 1234567890,  # ending unix timestamp or trade tx id of results(inclusive)
        # 'ofs' = result offset
      }
      if since
        request['start'] = int(since / 1000)
      end
      response = self.privatePostTradesHistory(request.merge(params))
      #
      #     {
      #         "error": [],
      #         "result": {
      #             "trades": {
      #                 "GJ3NYQ-XJRTF-THZABF": {
      #                     "ordertxid": "TKH2SE-ZIF5E-CFI7LT",
      #                     "postxid": "OEN3VX-M7IF5-JNBJAM",
      #                     "pair": "XICNXETH",
      #                     "time": 1527213229.4491,
      #                     "type": "sell",
      #                     "ordertype": "limit",
      #                     "price": "0.001612",
      #                     "cost": "0.025792",
      #                     "fee": "0.000026",
      #                     "vol": "16.00000000",
      #                     "margin": "0.000000",
      #                     "misc": ""
      #                 },
      #                 ...
      #             },
      #             "count": 9760,
      #         },
      #     }
      #
      trades = response['result']['trades']
      ids = trades.keys
      ids.each do |id|
        trades[id]['id'] = id
      end
      result = self.parse_trades(trades, nil, since, limit)

      return result if symbol.nil?

      return self.filter_by_symbol(result, symbol)
    end

    def cancel_order(id, symbol = nil, params = {})
      self.load_markets()
      response = nil
      begin
        response = self.privatePostCancelOrder({'txid' => id}.merge params)
      rescue => ex
        if self.last_http_response &&
          self.last_http_response.match('EOrder:Unknown order')

          raise OrderNotFound, self.id + ' cancelOrder() error ' + self.last_http_response
        end
        raise ex
      end
      return response
    end

    def fetch_open_orders(symbol = nil, since = nil, limit = nil, params = {})
      self.load_markets()
      request = {}
      if since
        request['start'] = (since / 1000).to_i
      end
      response = self.privatePostOpenOrders(request.merge(params))
      orders = self.parse_orders(response['result']['open'], nil, since, limit)

      return orders if symbol.nil?
      return self.filter_by_symbol(orders, symbol)
    end

    def fetch_closed_orders(symbol = nil, since = nil, limit = nil, params = {})
      self.load_markets()
      request = {}
      if since
        request['start'] = (since / 1000).to_i
      end
      response = self.privatePostClosedOrders(request.merge(params))
      orders = self.parse_orders(response['result']['closed'], nil, since, limit)

      return orders if symbol.nil?
      return self.filter_by_symbol(orders, symbol)
    end

    def fetch_deposit_methods(code, params = {})
      self.load_markets()
      currency = self.currency(code)
      response = self.privatePostDepositMethods({'asset' => currency['id']}.merge params)
      return response['result']
    end

    def parse_transaction_status(status)
      # IFEX transaction states
      statuses = {
        'Initial' => 'pending',
        'Pending' => 'pending',
        'Success' => 'ok',
        'Settled' => 'ok',
        'Failure' => 'failed',
        'Partial' => 'ok',
      }
      return self.safe_string(statuses, status, status)
    end

    def parse_transaction(transaction, currency = nil)
      #
      # fetchDeposits
      #
      #     {method: "Ether(Hex)",
      #       aclass: "currency",
      #        asset: "XETH",
      #        refid: "Q2CANKL-LBFVEE-U4Y2WQ",
      #         txid: "0x57fd704dab1a73c20e24c8696099b695d596924b401b261513cfdab23…",
      #         info: "0x615f9ba7a9575b0ab4d571b2b36b1b324bd83290",
      #       amount: "7.9999257900",
      #          fee: "0.0000000000",
      #         time:  1529223212,
      #       status: "Success"                                                       }
      #
      # fetchWithdrawals
      #
      #     {method: "Ether",
      #       aclass: "currency",
      #        asset: "XETH",
      #        refid: "A2BF34S-O7LBNQ-UE4Y4O",
      #         txid: "0x288b83c6b0904d8400ef44e1c9e2187b5c8f7ea3d838222d53f701a15b5c274d",
      #         info: "0x7cb275a5e07ba943fee972e165d80daa67cb2dd0",
      #       amount: "9.9950000000",
      #          fee: "0.0050000000",
      #         time:  1530481750,
      #       status: "Success"                                                             }
      #
      id = self.safe_string(transaction, 'refid')
      txid = self.safe_string(transaction, 'txid')
      timestamp = self.safe_integer(transaction, 'time')
      timestamp = timestamp * 1000 if timestamp
      code = nil
      currencyId = self.safe_string(transaction, 'asset')
      currency = self.safe_value(self.currencies_by_id, currencyId)
      if currency
        code = currency['code']
      else
        code = self.common_currency_code(currencyId)
      end
      address = self.safe_string(transaction, 'info')
      amount = self.safe_float(transaction, 'amount')
      status = self.parse_transaction_status(self.safe_string(transaction, 'status'))
      type = self.safe_string(transaction, 'type')  # injected from the outside
      feeCost = self.safe_float(transaction, 'fee')
      if feeCost.nil? && type == 'deposit'
        feeCost = 0
      end
      return {
        'info' => transaction,
        'id' => id,
        'currency' => code,
        'amount' => amount,
        'address' => address,
        'tag' => nil,
        'status' => status,
        'type' => type,
        'updated' => nil,
        'txid' => txid,
        'timestamp' => timestamp,
        'datetime' => self.iso8601(timestamp),
        'fee' => {
          'currency' => code,
          'cost' => feeCost,
        },
      }
    end

    def parse_transactions_by_type(type, transactions, code = nil, since = nil, limit = nil)
      result = []
      transactions.each do |transaction|
        parsed_tx = self.parse_transaction({'type' => type}.merge transaction)
        result << parsed_tx
      end
      return self.filterByCurrencySinceLimit(result, code, since, limit)
    end

    def fetch_deposits(code = nil, since = nil, limit = nil, params = {})
      self.load_markets()
      # https://www.kraken.com/en-us/help/api#deposit-status
      if code.nil?
        raise ArgumentsRequired, self.id + ' fetchDeposits requires a currency code argument'
      end
      currency = self.currency(code)
      request = {
        'asset' => currency['id'],
      }
      response = self.privatePostDepositStatus(request.merge(params))
      #
      #     { error: [],
      #       result: [{method: "Ether(Hex)",
      #                   aclass: "currency",
      #                    asset: "XETH",
      #                    refid: "Q2CANKL-LBFVEE-U4Y2WQ",
      #                     txid: "0x57fd704dab1a73c20e24c8696099b695d596924b401b261513cfdab23…",
      #                     info: "0x615f9ba7a9575b0ab4d571b2b36b1b324bd83290",
      #                   amount: "7.9999257900",
      #                      fee: "0.0000000000",
      #                     time:  1529223212,
      #                   status: "Success"                                                       }]}
      #
      return self.parse_transactions_by_type('deposit', response['result'], code, since, limit)
    end

    def fetch_withdrawals(code = nil, since = nil, limit = nil, params = {})
      self.load_markets()
      # https://www.kraken.com/en-us/help/api#withdraw-status
      if code.nil?
        raise ArgumentsRequired, self.id + ' fetchWithdrawals requires a currency code argument'
      end
      currency = self.currency(code)
      request = {
        'asset' => currency['id'],
      }
      response = self.privatePostWithdrawStatus(request.merge(params))
      #
      #     { error: [],
      #       result: [{method: "Ether",
      #                   aclass: "currency",
      #                    asset: "XETH",
      #                    refid: "A2BF34S-O7LBNQ-UE4Y4O",
      #                     txid: "0x298c83c7b0904d8400ef43e1c9e2287b518f7ea3d838822d53f704a1565c274d",
      #                     info: "0x7cb275a5e07ba943fee972e165d80daa67cb2dd0",
      #                   amount: "9.9950000000",
      #                      fee: "0.0050000000",
      #                     time:  1530481750,
      #                   status: "Success"                                                             }]}
      #
      return self.parse_transactions_by_type('withdrawal', response['result'], code, since, limit)
    end

    def create_deposit_address(code, params = {})
      request = {
        'new' => 'true',
      }
      response = self.fetch_deposit_address(code, request.merge(params))
      address = self.safe_string(response, 'address')
      self.check_address(address)
      return {
        'currency' => code,
        'address' => address,
        'info' => response,
      }
    end

    def fetch_deposit_address(code, params = {})
      self.load_markets()
      currency = self.currency(code)
      # eslint-disable-next-line quotes
      deposit_method = self.safe_string(params, 'method')
      if deposit_method.nil?
        if self.options['cacheDepositMethodsOnFetchDepositAddress']
          # cache depositMethods
          if !(self.options['depositMethods'].keys.include? code)
            self.options['depositMethods'][code] = self.fetch_deposit_methods(code)
          end
          deposit_method = self.options['depositMethods'][code][0]['method']
        else
          raise ExchangeError, self.id + ' fetchDepositAddress() requires an extra `method` parameter. Use fetchDepositMethods("' + code + '") to get a list of available deposit methods or enable the exchange property .options["cacheDepositMethodsOnFetchDepositAddress"] = true'
        end
      end
      request = {
        'asset' => currency['id'],
        'method' => deposit_method,
      }
      response = self.privatePostDepositAddresses(request.merge(params))  # overwrite methods
      result = response['result']
      numResults = result.length
      if numResults < 1
        raise InvalidAddress, self.id + ' privatePostDepositAddresses() returned no addresses'
      end
      address = self.safe_string(result[0], 'address')
      tag = self.safe_string_2(result[0], 'tag', 'memo')
      self.check_address(address)
      return {
        'currency' => code,
        'address' => address,
        'tag' => tag,
        'info' => response,
      }
    end

    def withdraw(code, amount, address, tag = nil, params = {})
      self.check_address(address)
      if params['key']
        self.load_markets()
        currency = self.currency(code)
        response = self.privatePostWithdraw({
          'asset' => currency['id'],
          'amount' => amount,
          # 'address' => address,  # they don't allow withdrawals to direct addresses
        }.merge params)
        return {
          'info' => response,
          'id' => response['result'],
        }
      end
      raise ExchangeError, self.id + " withdraw requires a 'key' parameter(withdrawal key name, as set up on your account)"
    end

    def sign(path, api = 'public', method = 'GET', params = {}, headers = nil, body = nil)
      url = '/' + self.version + '/' + api + '/' + path
      if api == 'public'
        if params
          url += '?' + self.urlencode(params)
        end
      elsif api == 'private'
        self.check_required_credentials()
        nonce = str(self.nonce())
        body = self.urlencode({'nonce' => nonce}.merge params)
        auth = self.encode(nonce + body)
        hash = self.hash(auth, 'sha256', 'binary')
        binary = self.encode(url)
        binhash = self.binary_concat(binary, hash)
        secret = base64.b64decode(self.secret)
        signature = self.hmac(binhash, secret, hashlib.sha512, 'base64')
        headers = {
          'API-Key' => self.apiKey,
          'API-Sign' => self.decode(signature),
          'Content-Type' => 'application/x-www-form-urlencoded',
        }
      else
        url = '/' + path
      end
      url = self.urls['api'][api] + url
      return {'url' => url, 'method' => method, 'body' => body, 'headers' => headers}
    end

    def nonce()
      return self.milliseconds()
    end

    def handle_errors(code, reason, url, method, headers, body, response)
      case
      when code == 520
        raise ExchangeNotAvailable, self.id + ' ' + str(code) + ' ' + reason
      when body.match('Invalid order')
        raise InvalidOrder, self.id + ' ' + body
      when body.match('Invalid nonce')
        raise InvalidNonce, self.id + ' ' + body
      when body.match('Insufficient funds')
        raise InsufficientFunds, self.id + ' ' + body
      when body.match('Cancel pending')
        raise CancelPending, self.id + ' ' + body
      when body.match('Invalid arguments:volume')
        raise InvalidOrder, self.id + ' ' + body
      when body[0] == '{'
        if !response.is_a?(String) &&
          response['error'] &&
          !response['error'].empty?

          message = self.id + ' ' + self.json(response)
          response['error'].each do |error|
            if self.exceptions[error]
              raise self.exceptions[error], message
            end
          end
          raise ExchangeError, message
        end
      end
    end
  end
end

