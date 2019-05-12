# -*- coding: utf-8 -*-
require 'rest-client'
require 'json'
require 'base64'
require 'securerandom'
require 'openssl'
require 'time'
require "addressable/uri"
require 'bigdecimal'
require 'ccxt/base/errors'
require 'ccxt/base/decimal_to_precision'

module Ccxt
  # base class for the exchange
  class Exchange
    attr_accessor :id, :version, :certified, :enableRateLimit
    attr_accessor :rateLimit, :timeout, :asyncio_loop, :aiohttp_proxy
    attr_accessor :session, :logger, :userAgent
    attr_accessor :verbose, :markets, :symbols, :fees
    attr_accessor :ids, :tickers, :api, :parseJsonResponse
    attr_accessor :proxy, :origin, :proxies, :apiKey
    attr_accessor :secret, :password, :uid, :privateKey
    attr_accessor :walletAddress, :twofa, :marketsById, :markets_by_id
    attr_accessor :currencies_by_id, :precision, :limits, :exceptions
    attr_accessor :headers, :balance, :orderbooks, :orders
    attr_accessor :trades, :transactions, :currencies, :options
    attr_accessor :requiredCredentials, :has, :precisionMode, :minFundingAddressLength
    attr_accessor :substituteCommonCurrencyCodes, :lastRestRequestTimestamp, :lastRestPollTimestamp, :restRequestQueue
    attr_accessor :restPollerLoopIsRunning, :rateLimitTokens, :rateLimitMaxTokens, :rateLimitUpdateTime
    attr_accessor :enableLastHttpResponse, :enableLastJsonResponse, :enableLastResponseHeaders
    attr_accessor :last_http_response, :last_json_response, :last_response_headers, :web3
    attr_accessor :commonCurrencies, :name, :countries, :timeframes, :urls
    attr_accessor :tokenBucket

    def initialize(config = {})
      @id = nil
      @version = nil
      @certified = false

      # rate limiter settings
      @enableRateLimit = false
      @rateLimit = 2000  # milliseconds = seconds * 1000
      @timeout = 10000   # milliseconds = seconds * 1000
      @asyncio_loop = nil
      @aiohttp_proxy = nil
      @aiohttp_trust_env = false
      @session = nil
      @logger = nil
      @userAgent = nil
      @userAgents = {
        'chrome' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'chrome39' => 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
      }
      @verbose = false
      @markets = nil
      @symbols = nil
      @fees = {
        'trading' => {
          'fee_loaded' => false,
          'percentage' => true,
        },
        'funding' => {
          'fee_loaded' => false,
          'withdraw' => {},
          'deposit' => {},
        },
      }
      @ids = nil
      @tickers = nil
      @api = nil
      @parseJsonResponse = true
      @proxy = ''
      @origin = '*'  # CORS origin
      @proxies = nil
      @hostname = nil # in case of inaccessibility of the "main" domain
      @apiKey = ''
      @secret = ''
      @password = ''
      @uid = ''
      @privateKey = ''  # a "0x"-prefixed hexstring private key for a wallet
      @walletAddress = ''  # the wallet address "0x"-prefixed hexstring
      @twofa = nil
      @marketsById = nil
      @markets_by_id = nil
      @currencies_by_id = nil

      @precision = {}
      @limits = {}
      @exceptions = {}
      @headers = {}
      @balance = {}
      @orderbooks = {}
      @orders = {}
      @trades = {}
      @transactions = {}
      @currencies = {}
      @options = {}
      @accounts = {}

      @requiredCredentials = {
        'apiKey' => true,
        'secret' => true,
        'uid' => false,
        'login' => false,
        'password' => false,
        'twofa' => false,  # 2-factor authentication (one-time password key)
        'privateKey' => false,  # a "0x"-prefixed hexstring private key for a wallet
        'walletAddress' => false,  # the wallet address "0x"-prefixed hexstring
      }

      # API method metainfo
      @has = {
        'publicAPI' => true,
        'privateAPI' => true,
        'CORS' => false,
        'cancelOrder' => true,
        'cancelOrders' => false,
        'createDepositAddress' => false,
        'createOrder' => true,
        'createMarketOrder' => true,
        'createLimitOrder' => true,
        'deposit' => false,
        'editOrder' => 'emulated',
        'fetchBalance' => true,
        'fetchClosedOrders' => false,
        'fetchCurrencies' => false,
        'fetchDepositAddress' => false,
        'fetchDeposits' => false,
        'fetchFundingFees' => false,
        'fetchL2OrderBook' => true,
        'fetchMarkets' => true,
        'fetchMyTrades' => false,
        'fetchOHLCV' => 'emulated',
        'fetchOpenOrders' => false,
        'fetchOrder' => false,
        'fetchOrderBook' => true,
        'fetchOrderBooks' => false,
        'fetchOrders' => false,
        'fetchTicker' => true,
        'fetchTickers' => false,
        'fetchTrades' => true,
        'fetchTradingFees' => false,
        'fetchTradingLimits' => false,
        'fetchTransactions' => false,
        'fetchWithdrawals' => false,
        'withdraw' => false,
      }

      @precisionMode = DECIMAL_PLACES
      @minFundingAddressLength = 1  # used in check_address
      @substituteCommonCurrencyCodes = true
      @lastRestRequestTimestamp = 0
      @lastRestPollTimestamp = 0
      @restRequestQueue = nil
      @restPollerLoopIsRunning = false
      @rateLimitTokens = 16
      @rateLimitMaxTokens = 16
      @rateLimitUpdateTime = 0

      @enableLastHttpResponse = true
      @enableLastJsonResponse = true
      @enableLastResponseHeaders = true

      @last_http_response = nil
      @last_json_response = nil
      @last_response_headers = nil

      @requiresWeb3 = false
      @web3 = nil

      @commonCurrencies = {
        'XBT' => 'BTC',
        'BCC' => 'BCH',
        'DRK' => 'DASH',
        'BCHABC' => 'BCH',
        'BCHSV'=> 'BSV',
      }

      settings = self.deep_extend(self.describe(), config)
      settings.each do |key, value|
        if self.instance_variable_defined?("@#{key}") && self.instance_variable_get("@#{key}").is_a?(Hash)
            self.instance_variable_set("@#{key}", self.deep_extend(self.send(key), value))
        else
          send "#{key}=", value
        end
      end

      if self.api
        define_rest_api('request') if self.api
      end

      if self.markets
        self.set_markets(self.markets)
      end

      self.tokenBucket = {
        'refillRate' => 1.0 / self.rateLimit,
        'delay' => 0.001,
        'capacity' => 1.0,
        'defaultCost' => 1.0,
      }
    end

    def describe
      return {}
    end

    ### API

    # PUBLIC
    # loadMarkets
    # fetchMarkets
    # fetchCurrencies
    # fetchTicker
    # fetchTickers
    # fetchOrderBook
    # fetchOHLCV
    # fetchTrades

    # PRIVATE
    # fetchBalance
    # createOrder
    # cancelOrder
    # fetchOrder
    # fetchOrders
    # fetchOpenOrders
    # fetchClosedOrders
    # fetchMyTrades
    # deposit
    # withdraw

    ## PUBLIC

    def load_markets(reload = false, params = {})
      if (not reload) && self.markets
        puts "load_markets: already set." if verbose
        if not self.markets_by_id
          return self.set_markets(markets)
        end
        return self.markets
      end
      puts "load_markets: loading markets." if verbose
      currencies = fetch_currencies() if has['fetchCurrencies']
      markets = self.fetch_markets(params)
      return set_markets(markets, currencies)
    end

    def load_accounts(reload=false, params = {})
      if reload
        self.accounts = self.fetch_accounts(params)
      else
        if self.accounts
          return self.accounts
        else
          self.accounts = self.fetch_accounts(params)
        end
      end
      self.accountsById = self.index_by(self.accounts, 'id')
      return self.accounts
    end

    def load_fees(reload=false)
      if !reload
        if self.loaded_fees != Exchange.loaded_fees
          return self.loaded_fees
        end
      end
      self.loaded_fees = self.deep_extend(self.loaded_fees, self.fetch_fees())
      return self.loaded_fees
    end

    def fetch_markets(params = {})
      return self.markets.to_a
    end

    def fetch_currencies(params = {})
      return self.currencies
    end

    def fetch_ticker(symbol = nil, params = {})
      raise NotSupported, 'fetch_ticker is not supported yet.'
    end

    def fetch_tickers(symbols = nil, params = {})
      raise NotSupported, 'API does not allow to fetch all tickers at once with a single call to fetch_tickers() for now'
    end

    def fetch_order_book()
      raise NotSupported, 'fetch_order_book is not supported yet.'
    end

    def fetch_OHLCV(symbol, timeframe = '1m', since = nil, limit = nil, params = {})
      raise(NotSupported, 'fetch_ohlcv() is not supported yet.') unless self.has['fetchTrades']
      self.load_markets()
      trades = self.fetch_trades(symbol, since, limit, params)
      return self.build_ohlcv(trades, timeframe, since, limit)
    end

    def fetch_fees
      trading = {}
      funding = {}
      if self.has['fetchTradingFees']
        trading = self.fetch_trading_fees()
      end
      if self.has['fetchFundingFees']
        funding = self.fetch_funding_fees()
      end
      return {
        'trading' => trading,
        'funding' => funding,
      }
    end

    def parse_balance(balance)
      currencies = self.omit(balance, 'info').keys
      ['free', 'used', 'total'].each do |account|
        balance[account] = {}
        currencies.each do |currency|
          balance[account][currency] = balance[currency][account]
        end
      end
      return balance
    end

    def fetch_partial_balance(part, params = {})
      balance = self.fetch_balance(params)
      return balance[part]
    end

    def fetch_free_balance(params = {})
      return self.fetch_partial_balance('free', params)
    end

    def fetch_used_balance(params = {})
      return self.fetch_partial_balance('used', params)
    end

    def fetch_total_balance(params = {})
      return self.fetch_partial_balance('total', params)
    end

    def fetch_trading_fees(symbol, params = {})
      self.raise_error(NotSupported, 'fetch_trading_fees() not supported yet')
    end

    def fetch_trading_fee(symbol, params = {})
      self.raise_error(NotSupported, 'fetch_trading_fee() not supported yet') unless self.has['fetchTradingFees']
      return self.fetch_trading_fees(params)
    end

    def fetch_funding_fees(params = {})
      self.raise_error(NotSupported, 'fetch_funding_fees() not supported yet')
    end

    def fetch_funding_fee(code, params = {})
      self.raise_error(NotSupported, 'fetch_funding_fee() not supported yet') unless self.has['fetchFundingFees']
      return self.fetch_funding_fees(params)
    end

    def load_trading_limits(symbols = nil, reload = false, params = {})
      if self.has['fetchTradingLimits']
        if reload or not(self.options.keys.include?('limitsLoaded'))
          response = self.fetch_trading_limits(symbols)
          symbols.each do |symbol|
            self.markets[symbol] = self.deep_extend(self.markets[symbol], response[symbol])
          end
          self.options['limitsLoaded'] = self.milliseconds
        end
      end
      return self.markets
    end

    def nonce
      return Exchange.milliseconds()
    end


    def parse_timeframe(timeframe)
      amount = timeframe[0..-1].to_i
      unit = timeframe[-1]
      case unit
      when 'y'
        scale = 60 * 60 * 24 * 365
      when 'M'
        scale = 60 * 60 * 24 * 30
      when 'w'
        scale = 60 * 60 * 24 * 7
      when 'd'
        scale = 60 * 60 * 24
      when 'h'
        scale = 60 * 60
      else
        scale = 60  # 1m by default
      end
      return amount * scale
    end

    ## PRIVATE

    def fetch_balance
      raise NotSupported, 'fetch_balance is not supported yet.'
    end

    def create_order(symbol, type, side, amount, price = nil, params = {})
      raise NotSupported, 'create_order is not supported yet.'
    end

    def cancel_order(id, symbol = nil, params = {})
      raise NotSupported, 'cancel_order is not supported yet.'
    end

    def fetch_order(id, symbol = nil, params = {})
      raise NotSupported, 'fetch_order is not supported yet.'
    end

    def fetch_orders(symbol = nil, since = nil, limit = nil, params = {})
      raise NotSupported, 'fetch_orders() is not supported yet'
    end

    def fetch_open_orders(symbol = nil, since = nil, limit = nil, params = {})
      raise NotSupported, 'fetch_open_orders() is not supported yet'
    end

    def fetch_closed_orders(symbol = nil, since = nil, limit = nil, params = {})
      raise NotSupported, 'fetch_closed_orders() is not supported yet'
    end

    def fetch_order_status(id, symbol = nil, params = {})
      order = self.fetch_order(id, symbol, params)
      return order['status']
    end

    def fetch_order_trades(id, symbol = nil, params = {})
      raise NotSupported, 'fetch_order_trades() is not supported yet'
    end

    def purge_cached_orders(before)
      orders = self.to_array(self.orders)
      orders = orders.select{|order| (order['status'] == 'open') || (order['timestamp'] >= before)}
      self.orders = self.index_by(orders, 'id')
      return self.orders
    end

    def fetch_my_trades(symbol = nil, since = nil, limit = nil, params = {})
      raise NotSupported, 'fetch_my_trades() is not supported yet'
    end

    def deposit
      raise NotSupported, 'deposit() is not supported yet'
    end

    def withdrawal
      raise NotSupported, 'withdrawal() is not supported yet'
    end

    def fetch_transactions
      raise NotSupported, 'fetch_transactions() is not supported yet'
    end

    def fetch_deposits
      raise NotSupported, 'fetch_deposits() is not supported yet'
    end

    def fetch_withdrawals(symbol = nil, since = nil, limit = nil, params = {})
      raise NotSupported, 'fetch_withdrawals() is not supported yet'
    end

    def parse_ohlcv(ohlcv, market = nil, timeframe = '1m', since = nil, limit = nil)
      return ohlcv.is_a?(Array) ? ohlcv[0..6] : ohlcv
    end

    def parse_ohlcvs(ohlcvs, market = nil, timeframe = '1m', since = nil, limit = nil)
      result = []

      ohlcvs.each do |o|
        break if limit && result.size >= limit

        ohlcv = self.parse_ohlcv(o, market, timeframe, since, limit)
        continue if since and (ohlcv[0] < since)
        result.push(ohlcv)
      end
      return self.sort_by(result, 0)
    end

    def parse_trading_view_ohlcv(ohlcvs, market=nil, timeframe='1m', since=nil, limit=nil)
      result = self.convert_trading_view_to_ohlcv(ohlcvs)
      return self.parse_ohlcvs(result, market, timeframe, since, limit)
    end

    def parse_bid_ask(bidask, price_key = 0, amount_key = 0)
      return [bidask[price_key].to_f, bidask[amount_key].to_f]
    end

    def parse_bids_asks(bidasks, price_key = 0, amount_key = 1)
      result = []
      if bidasks
        case bidasks[0]
        when Array
          bidasks.each do |bidask|
            if bidask[price_key] and bidask[amount_key]
              result << self.parse_bid_ask(bidask, price_key, amount_key)
            end
          end
        when Hash
          bidasks.each do |bidask|
            if bidask[price_key] and bidask[amount_key]
              result << self.parse_bid_ask(bidask, price_key, amount_key)
            end
          end
        else
          self.raise_error ExchangeError, "unrecognized bidask format: #{bidasks[0].inspect}"
        end
      end
      return result
    end

    def fetch_l2_order_book(symbol, limit = nil, params = {})
      orderbook = self.fetch_order_book(symbol, limit, params)
      orderbook.merge(
        'bids' => self.sort_by(self.aggregate(orderbook['bids']), 0, true),
        'asks' => self.sort_by(self.aggregate(orderbook['asks']), 0),
      )
    end

    def parse_order_book(orderbook, timestamp = nil, bids_key = 'bids', asks_key = 'asks', price_key = 0, amount_key = 1)
      bids = if orderbook[bids_key] && orderbook[bids_key].is_a?(Array)
        self.parse_bids_asks(orderbook[bids_key], price_key, amount_key)
      else [] end
      bids = self.sort_by(bids, 0, true)
      asks = if orderbook[asks_key] && orderbook[asks_key].is_a?(Array)
        self.parse_bids_asks(orderbook[asks_key], price_key, amount_key)
      else [] end
      asks = self.sort_by(asks, 0)
      {
        'bids' => bids,
        'asks' => asks,
        'timestamp' => timestamp,
        'datetime' => timestamp ? self.iso8601(timestamp) : nil,
        'nonce' => nil,
      }
    end

    def fetch_bids_asks(symbols = nil, params = {})
      raise NotSupported, 'API does not allow to fetch all prices at once with a single call to fetch_bids_asks() for now'
    end

    def set_sandbox_mode(enabled)
      if enabled
        if self.urls.include? 'test'
          self.urls['api_backup'] = self.urls['api']
          self.urls['api'] = self.urls['test']
        else
          raise NotSupported, self.id + ' does not have a sandbox URL'
        end
      elsif self.urls.include? 'api_backup'
        self.urls['api'] = self.urls['api_backup']
        self.urls.delete['api_backup']
      end
    end

    def set_markets(markets_to_set, currencies_to_set = nil)
      values = markets_to_set.is_a?(Hash) ? markets_to_set.values : markets_to_set
      values.length.times do |i|
        defaults = self.fees['trading'].merge 'precision' => self.precision, 'limits' => self.limits
        values[i] = defaults.merge values[i]
      end
      self.markets = self.index_by(values, 'symbol')
      self.markets_by_id = self.index_by(values, 'id')
      self.marketsById = self.markets_by_id
      self.symbols = self.markets.keys.sort
      self.ids = self.markets_by_id.keys.sort
      if currencies_to_set
        self.currencies = self.deep_extend(currencies_to_set, self.currencies)
      else
        base_currencies = values.select {|market| market['base']}.map do |market|
          {
            'id' => market['baseId'] || market['base'],
            'numericId' => market['baseNumericId'],
            'code' => market['base'],
            'precision' => (market['precision'] && market['precision']['base']) ||
              (market['precision'] && market['precision']['amount']) || 8,
          }
        end
        quote_currencies = values.select {|market| market['quote']}.map do |market|
          {
            'id' => market['quoteId'] || market['quote'],
            'numericId' => market['quoteNumericId'],
            'code' => market['quote'],
            'precision' => (market['precision'] && market['precision']['quote']) ||
              (market['precision'] && market['precision']['amount']) || 8,
          }
        end
        currencies_to_set = self.sort_by(base_currencies + quote_currencies, 'code')
        self.currencies = self.deep_extend(self.index_by(currencies_to_set, 'code'), self.currencies)
      end
      self.currencies_by_id = self.index_by(self.currencies.values, 'id')
      return self.markets
    end

    def build_ohlcv(trades, timeframe = '1m', since = nil, limit = nil)
      ms = self.parse_timeframe(timeframe) * 1000
      ohlcvs = []
      high, low, close, volume = [2, 3, 4, 5]
      num_trades = trades.size
      oldest = limit.nil? ? (num_trades - 1) : min(num_trades - 1, limit)
      [0..oldest].each do |i|
        trade = trades[i]
        next if since && (trade['timestamp'] < since )

        opening_time = (math.floor(trade['timestamp'] / ms) * ms).to_i  # Shift the edge of the m/h/d (but not M)
        j = ohlcvs.size
        if (j == 0) or opening_time >= ohlcvs[j - 1][0] + ms
          # moved to a new timeframe -> create a new candle from opening trade
          ohlcvs.append([
            opening_time,
            trade['price'],
            trade['price'],
            trade['price'],
            trade['price'],
            trade['amount'],
          ])
        else
          # still processing the same timeframe -> update opening trade
          ohlcvs[j - 1][high] = [ohlcvs[j - 1][high], trade['price']].max
          ohlcvs[j - 1][low] = [ohlcvs[j - 1][low], trade['price']].min
          ohlcvs[j - 1][close] = trade['price']
          ohlcvs[j - 1][volume] += trade['amount']
        end
        return ohlcvs
      end
    end

    def convert_trading_view_to_ohlcv(ohlcvs)
      # ohlcvs contains lists of t, o, h, l, c, v.
      # method assumes that all have the same length
      results = []
      entries = ohlcvs['t'].size

      for i in 0..entries do
        results << {
          't' => ohlcvs['t'][i],
          'o' => ohlcvs['o'][i],
          'h' => ohlcvs['h'][i],
          'l' => ohlcvs['l'][i],
          'c' => ohlcvs['c'][i],
          'v' => ohlcvs['v'][i],
        }
      end
      return results
    end

    def convert_ohlcv_to_trading_view(ohlcvs)
      result = {
        't' => [],
        'o' => [],
        'h' => [],
        'l' => [],
        'c' => [],
        'v' => []
      }
      ohlcvs.each do |o|
        result['t'] << o[0].to_i / 1000 # timestamp
        result['o'] << o[1]
        result['h'] << o[2]
        result['l'] << o[3]
        result['c'] << o[4]
        result['v'] << o[5]
      end
      return result
    end

    ###
    # REQUEST METHODS
    ###

    def prepare_request_headers(headers = {})
      headers.update(self.headers)
      if self.userAgent
        if self.userAgent.is_a?(String)
          headers.update({'User-Agent' => self.userAgent})
        elsif self.userAgent.is_a?(Hash) && self.userAgent.include?('User-Agent')
          headers.update(self.userAgent)
        end
      end
      headers.update({'Origin' => self.origin}) unless self.proxy.empty?
      headers.update({'Accept-Encoding' => 'gzip, deflate'})
      headers
    end

    def fetch2(path, api = 'public', method = 'GET', params = {}, headers = nil, body = nil)
      throttle if enableRateLimit
      self.lastRestRequestTimestamp = milliseconds
      request = sign(path, api, method, params, headers, body)
      return fetch(request['url'], request['method'], request['headers'], request['body'])
    end

    def fetch(path, method = 'GET', request_headers = {}, payload = {})
      request_headers = prepare_request_headers(request_headers || {})

      puts "\nRequest:\nmethod: #{method.inspect}\npath: #{path.inspect}\nheaders: #{request_headers.inspect}\npayload: #{payload.inspect}" if self.verbose

      # RestClient::Request expects a symbol for a method, but #sign is implemented by individual exchanges in JS.
      # Therefore, fetch converts the method from a string to a symbol here.
      response = nil
      http_response = nil
      json_response = nil
      begin
        response = RestClient::Request.execute(
          method: method.downcase.to_sym,
          url: path,
          headers: request_headers,
          payload: payload
        )
        http_response = response.body
        json_response = self.is_json_encoded_object(http_response) ? JSON.parse(http_response) : nil
        headers = response.headers

        self.last_http_response = http_response if self.enableLastHttpResponse
        self.last_json_response = json_response if self.enableLastJsonResponse
        self.last_response_headers = headers if self.enableLastResponseHeaders
        puts "\nResponse:\nmethod: #{method.inspect}\npath: #{path.inspect}\nstatus: #{response.code.inspect}\nheaders: #{headers.inspect}\nhttp_response: #{http_response}" if self.verbose

        # rescue Timeout
        #    except Timeout as e:
        #        self.raise_error(RequestTimeout, method, url, e)
      rescue RestClient::RequestTimeout => e
        self.raise_error(RequestTimeout, method, url, e)

        #    except TooManyRedirects as e:
        #        self.raise_error(ExchangeError, url, method, e)
        #

        # RestClient throws a normal exception for TooManyRedirectors
        #    except SSLError as e:
        #        self.raise_error(ExchangeError, url, method, e)

        # RestClient::SSLCertificateNotVerified is raised when HTTPS validation fails. Other OpenSSL::SSL::SSLError errors are raised as is.

     #    except HTTPError as e:
     #        self.handle_errors(response.status_code, response.reason, url, method, headers, http_response)
     #        self.handle_rest_errors(e, response.status_code, http_response, url, method)
     #        self.raise_error(ExchangeError, url, method, e, http_response)
     #
     #    except RequestException as e:  # base exception class
     #        error_string = str(e)
     #        if ('ECONNRESET' in error_string) or ('Connection aborted.' in error_string):
     #            self.raise_error(NetworkError, url, method, e)
     #        else:
     #            self.raise_error(ExchangeError, url, method, e)
     #
      rescue RestClient::ExceptionWithResponse => e
        raise e, response.inspect
        return e
      end

      handle_errors(response.code, response.body, path, method, headers, http_response, json_response)
      handle_rest_response(http_response, json_response, path, method, headers, payload)
      if json_response != nil
        return json_response
      end
      return http_response
    end

    # def handle_errors(code, reason, url, method, headers, body, response):
    #       pass
    def handle_errors(code, reason, url, method, headers, body, response); end

    def handle_rest_response(response, json_response, url, method = 'GET', headers = nil, body = nil)
      if self.is_json_encoded_object(response) && json_response.nil?
        ddos_protection = response =~ /(cloudflare|incapsula|overload|ddos)/i
        exchange_not_available = response =~ /(offline|busy|retry|wait|unavailable|maintain|maintenance|maintenancing)/i
        if ddos_protection
          self.raise_error(DDoSProtection, method, url, nil, response)
        end
        if exchange_not_available
          message = response + ' exchange downtime, exchange closed for maintenance or offline, DDoS protection or rate-limiting in effect'
          self.raise_error(ExchangeNotAvailable, method, url, nil, message)
        end
        self.raise_error(ExchangeError, method, url, ValueError('failed to decode json'), response)
      end
    end

    def sign(path, api = 'public', method = 'GET', params = {}, headers = nil, body = nil)
      raise NotSupported "#{self.id}: sign() pure method must be redefined in derived classes"
    end

    # request is the main function for define_rest_api()
    def request(path, api = 'public', method = 'GET', params = {}, headers = nil, body = nil )
      return fetch2(path, api, method, params, headers, body)
    end

    def define_rest_api(method_name, options = {})
      delimiters = Regexp.compile('[^a-zA-Z0-9]')
      self.api.each do |api_type, methods|
        methods.each do |http_method, urls|
          urls.each do |u|
            url = u.strip
            split_path = url.split(delimiters)
            uppercase_method = http_method.upcase
            lowercase_method = http_method.downcase
            camelcase_method = capitalize(lowercase_method)
            camelcase_suffix = split_path.map{|p| capitalize(p)}.join('')
            underscore_suffix = split_path.map{|p| p.strip.downcase}.join('_')

            camelcase = api_type + camelcase_method + camelcase_suffix
            underscore = api_type + '_' + lowercase_method + '_' + underscore_suffix

            if options.include? 'suffixes'
              if options['suffixes'].include 'camelcase'
                camelcase += options['suffixes']['camelcase']
              end
              if options['suffixes'].include 'underscore'
                camelcase += options['suffixes']['underscore']
              end
            end

            proc = self.method(:request).curry
            self.class.send(:define_method, underscore) do |*args|
              proc.call(url, api_type, uppercase_method, *args)
            end
            self.class.class_eval {alias_method camelcase, underscore}
          end
        end
      end
    end

  #  class << self

      ### THESE ARE REQUIRED TO TRANSPILE THE JAVASCRIPT FILES

      ### CRYPTO FUNCTIONS

      def hash(request, algorithm = 'md5', digest = 'hex')
        h = OpenSSL::Digest.new(algorithm, request)
        case digest
        when 'hex'
          h.hexdigest
        when 'base64'
          h.base64digest
        else
          h.digest
        end
      end

      def hmac(request, secret, algorithm = 'md5', digest = 'hex')
        ssl_digest = OpenSSL::Digest.new(algorithm)
        h = OpenSSL::HMAC.new(secret, ssl_digest)
        h.update request
        case digest
        when 'hex'
          h.hexdigest
        when 'base64'
          Base64.strict_encode64(h.digest)
        else
          h.digest
        end
      end

      def jwt(request, secret, algorithm = nil)
        header = Exchange.encode(Exchange.json({
          'alg'=> alg,
          'typ' => 'JWT'
          }))
        encodedHeader = Exchange.base64urlencode(header)
        encodedData = Exchange.base64urlencode(Exchange.encode(Exchange.json(request)))
        token = encodedHeader + '.' + encodedData
        hmac = Exchange.hmac(Exchange.encode(token), Exchange.encode(secret), algorithm, 'binary')
        signature = Exchange.base64urlencode(hmac)
        return token + '.' + signature
      end

      # def totp(key):
      #     def dec_to_bytes(n):
      #         if n > 0:
      #             return dec_to_bytes(n // 256) + bytes([n % 256])
      #         else:
      #             return b''
      #
      #     def hex_to_dec(n):
      #         return int(n, base = 16)
      #
      #     def base32_to_bytes(n):
      #         missing_padding = len(n) % 8
      #         padding = 8 - missing_padding if missing_padding > 0 else 0
      #         padded = n.upper() + ('=' * padding)
      #         return base64.b32decode(padded)  # throws an error if the key is invalid
      #
      #     epoch = int(time.time()) // 30
      #     hmac_res = Exchange.hmac(dec_to_bytes(epoch).rjust(8, b'\x00'), base32_to_bytes(key.replace(' ', '')), hashlib.sha1, 'hex')
      #     offset = hex_to_dec(hmac_res[-1]) * 2
      #     otp = str(hex_to_dec(hmac_res[offset: offset + 8]) & 0x7fffffff)
      #     return otp[-6:]

      def totp(key)
        raise NotSupported, "TOTP: Not implemented yet."
      end

      ### ENCODE

      def json(data, params = nil)
        return JSON.dump(data)
      end

      def unjson(input)
        return JSON.load(input)
      end

      def binary_concat(*args)
        return args.reduce{|a, b| a + b }
      end

      def binary_to_string(string)
        return string.encode('ascii')
      end

      #
      # Encode a query for a URL, but not encoding special characters.
      #
      # @staticmethod
      # def rawencode(params = {}):
      #     return _urlencode.unquote(Exchange.urlencode(params))

      def rawencode(params = {})
        return Addressable::URI.encode_component(params, /./)
      end

      def base64urlencode(s)
        return Exchange.decode(Base64.urlsafe_encode64(s, padding:false))
      end

      ### GENERIC

      def aggregate(bidasks)
        ordered = {}
        bidasks.each do |price, volume|
          if volume > 0
            value = ordered.has_key?(price) ? ordered[price] : 0
            ordered[price] = value + volume
          end
        end
        ordered.sort
      end

      def array_concat(a, b)
        return a+b
      end

      def deep_extend(*args)
        result = nil
        args.each do |arg|
          if arg.is_a?(Hash)
            result = {} if not result.is_a?(Hash)
            arg.keys.each do |k|
              target = result.has_key?(k) ? result[k] : nil
              result[k] = self.deep_extend(target, arg[k])
            end
          else
            result = arg
          end
        end
        return result
      end

      def encode(string)
        return string.encode
      end

      def decode(string)
        return string.unpack('M*')
      end

      def encode_uri_component(uri)
        return URI.encode_www_form_component(uri)
      end

      def extract_params(string)
        string.scan(/{([\w-]+)}/)
      end

      def implode_params(string, params)
        params.keys.each do |key|
          string = string.gsub('{#{key}}', params[key].to_s)
        end
        return string
      end

      def filterBy(array, key, value = nil)
        return Exchange.filter_by(array, key, value)
      end

      def filter_by(array, key, value = nil)
        if value
          grouped = Exchange.group_by(array, key)
          return grouped[value] if grouped.has_key? value
          return []
        else
          return array
        end
      end

      def groupBy(array, key)
        return Exchange.group_by(array, key)
      end

      def group_by(array, key)
        result = {}
    #    array = self.to_array(array)
        array = array.collect{|entry| entry.has_key?(key) ? entry : nil}.compact
        array.each do |entry|
          result[entry[key]] = [] unless result.has_key?(entry[key])
          result[entry[key]] << entry
        end
        return result
      end

      # def has_web3
      # end

      def in_array(needle, haystack)
        return haystack.include?(needle)
      end

      def index_by(array, key)
        result = {}
        array = self.keysort(array).values if array.is_a?(Hash)
        array.each do |element|
          if element.has_key?(key) and element[key] != nil
            k = element[key]
            result[k] = element
          end
        end
        result
      end

      def is_empty(object)
        return object.empty?
      end

      def is_json_encoded_object(input)
        return (input.is_a?(String) and
               (input.length >= 2) and
               ((input[0] == '{') or (input[0] == '[')))
      end

      def keysort(hash)
        return hash.sort_by{|k,v| k}.to_h
      end

      def omit(d, *args)
        result = d.dup
        args.each do |arg|
          if arg.is_a?(Array)
            arg.each do |key|
              result.delete(key) if result.has_key? key
            end
          else
            result.delete(arg) if result.has_key? arg
          end
        end
        return result
      end

      def ordered(array)
        return Hash(array)
      end

      def pluck(array, key)
        return array.delete_if{|a| not a.has_key?(key)}.map{|a| a[key]}
      end

      def safe_either(method, hash, key1, key2, default_value = nil)
        value = method.call(hash, key1)
        if value
          return value
        else
          return method.call(hash, key2, default_value)
        end
      end

      def safe_float(hash, key, default_value = nil)
        if hash.is_a?(Hash) && hash.has_key?(key)
          value = hash[key] ? hash[key].to_f : nil
        else
          value = default_value
        end
        return value
      end

      def safe_float_2(hash, key1, key2, default_value = nil)
        return self.safe_either(method(:safe_float), hash, key1, key2, default_value)
      end

      def safe_integer(hash, key, default_value = nil)
        if hash.is_a?(Hash) && hash.has_key?(key)
          value = hash[key] ? hash[key].to_i : nil
        else
          value = default_value
        end
        return value
      end

      def safe_integer_2(hash, key1, key2, default_value = nil)
        return self.safe_either(method(:safe_integer), hash, key1, key2, default_value)
      end

      def safe_string(hash, key, default_value = nil)
        if hash.is_a?(Hash) && hash.has_key?(key)
          value = hash[key].to_s
        else
          value = default_value
        end
        return value
      end

      def safe_string_2(hash, key1, key2, default_value = nil)
        return self.safe_either(method(:safe_string), hash, key1, key2, default_value)
      end

      def safe_value(hash, key, default_value = nil)
        if hash.is_a?(Hash) && hash.has_key?(key)
          value = hash[key]
        else
          value = default_value
        end
        return value
      end

      def safe_value_2(hash, key1, key2, default_value = nil)
        return self.safe_either(method(:safe_string), hash, key1, key2, default_value)
      end

      def safe_currency_code(data, key, currency=nil)
        code = nil
        currency_id = self.safe_string(data, key)
        if self.currencies_by_id.include?(currency_id)
          currency = self.currencies_by_id[currency_id]
        else
          code = self.common_currency_code(currency_id)
        end
        if !currency.nil?
          code = currency['code']
        end
        return code
      end

      def sort_by(array, key, descending = false)
        # return sorted(array, key = lambda k: k[key] if k[key] is not nil else "", reverse = descending)
        result = array.sort_by!{|k| k[key] ? k[key] : "" }
        descending ? result.reverse : result
      end

      def sum(*args)
        array = args.delete_if{|c| not(c.is_a?(Integer) or c.is_a?(Float))}.compact
        return nil if array.empty?
        return array.sum
      end

      def to_array(value)
        return value.values if value.is_a?(Hash)
        return value
      end

      # Deprecated, use decimal_to_precision instead
      def truncate( num, precision = 0)
        return num.truncate(precision)
      end

      # Deprecated, todo: remove references from subclasses
      def truncate_to_string(num, precision = 0)
        return num.truncate(precision).to_s
      end

      def unique(array)
        return array.uniq
      end

      def url(path, params = {})
        result = Exchange.implode_params(path, params)
        query = Exchange.omit(params, Exchange.extract_params(path))
        if query
          result += '?' + RestClient::Utils.encode_query_string(query)
        end
        return result
      end

      #
      # Encode a query for a URL, encoding special characters as necessary.
      #
      def urlencode(params = {})
        if params.is_a?(Hash)
          return RestClient::Utils.encode_query_string(params)
        else
          return params
        end
      end

      ### TIME

      def sec
        self.seconds
      end

      def seconds
        return Time.now.to_i
      end

      def usec
        self.microseconds
      end

      def uuid
        return SecureRandom::uuid
      end

      def microseconds
        return (Time.now.to_f * 1000000.0).to_i
      end

      def milliseconds
        return (Time.now.to_f * 1000.0).to_i
      end

      def msec
        return self.milliseconds
      end

      def iso8601(timestamp = nil)
        return nil unless timestamp.is_a?(Integer)
        return nil if timestamp.to_i < 0

        return Time.at(timestamp / 1000.0).round(3).utc.iso8601(3)
      end

      def dmy(timestamp, infix='-')
        utc_datetime = Time.at(timestamp.to_i).utc
        return utc_datetime.strftime('%m' + infix + '%d' + infix + "%Y")
      end

      def parse8601(timestamp)
        return DateTime.iso8601(timestamp).strftime('%Q').to_i rescue nil
      end

      def parse_date(timestamp = nil)
        return nil unless timestamp.is_a?(String)
        return DateTime.parse(timestamp).strftime('%Q').to_i rescue nil
      end

      def ymd(timestamp)
        utc_datetime = Time.at(timestamp.to_i).utc
        return utc_datetime.strftime('%Y' + infix + '%m' + infix + "%d")
      end

      def ymdhms(timestamp)
        utc_datetime = Time.at(timestamp.to_i).utc
        return utc_datetime.strftime('%Y-%m-%d' + infix + '%H:%M:%S')
      end

      def raise_error( exception, url = nil, method = nil, error = nil, details = nil)
        output = ' ' + self.id + [url, method, error, details].compact.join(' ')
        raise exception(output)
      end

      # Ruby default capitalize will capitalize the first letter and lower the others.
      def capitalize(string)
        if string.length > 1
          return (string[0].upcase + string[1..-1])
        else
          return string.upcase
        end
      end

      def throttle
        now = milliseconds
        elapsed = now - lastRestRequestTimestamp
        if elapsed < rateLimit
          delay = rateLimit - elapsed
          sleep(delay / 1000.0)
        end
      end
  #  end

    def common_currency_code(currency)
      if not self.substituteCommonCurrencyCodes
        return currency
      end
      return self.safe_string(self.commonCurrencies, currency, currency)
    end

    def currency_id(commonCode)
      if self.currencies && self.currencies.include?(commonCode)
        return self.currencies[commonCode]['id']
      end
      currencyIds = self.commonCurrencies.invert
      return self.safe_string(currencyIds, commonCode, commonCode)
    end

    def precision_from_string(string)
      parts = string.sub(/0+$/, '').split('.')
      return (parts.size > 1 ) ? parts[1].size : 0
    end

    def cost_to_precision(symbol, cost)
      return self.decimal_to_precision(cost, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode)
    end

    def price_to_precision(symbol, price)
      return self.decimal_to_precision(price, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode)
    end

    def amount_to_precision(symbol, amount)
      return self.decimal_to_precision(amount, TRUNCATE, self.markets[symbol]['precision']['amount'], self.precisionMode)
    end

    def fee_to_precision(symbol, fee)
      return self.decimal_to_precision(fee, ROUND, self.markets[symbol]['precision']['price'], self.precisionMode)
    end

    def currency_to_precision(currency, fee)
      return self.decimal_to_precision(fee, ROUND, self.currencies[currency]['precision'], self.precisionMode)
    end

    def find_broadly_matched_key(broad, string)
      # A helper method for matching error strings exactly vs broadly
      keys = board.keys
      keys.each do |k|
        return key if string.include?(key)
      end
      return nil
    end

    def check_required_credentials(error = true)
      self.requiredCredentials.keys.each do |key|
        if self.requiredCredentials[key] && (not self.instance_variable_get("@#{key}"))
          if error
            raise AuthenticationError, "#{self.id} requires #{key}."
          else
            return error
          end
        end
      end
    end

    def check_address(address)
      # Checks an address is not the same character repeated or an empty sequence
      if address.nil?
        raise InvalidAddress, '#{self.id} address is nil'
      end

      ## check the address is not the same letter like 'aaaaa' nor too short nor has a space
      if (address.chars.uniq.length == 1) or
        (address.length < self.minFundingAddressLength) or
        (address.include?(' '))
        raise InvalidAddress, "#{self.id} address is invalid or has less than #{self.fminFundingAddressLength} characters: #{address.to_json}"
      end
      return address
    end

    def account
      return {
        'free' => 0.0,
        'used' => 0.0,
        'total' => 0.0,
      }
    end

    def find_market(string)
      if not self.markets
        raise ExchangeError "#{self.id} markets not loaded."
      end
      if string.is_a?(String)
        if self.markets_by_id.has_key?(string)
          return self.markets_by_id[string]
        end
        if self.markets.include?(string)
          return self.markets[string]
        end
      end
      return string
    end

    def find_symbol(string, market = nil)
      if market.nil?
        market = self.find_market(string)
      end
      if market.is_a?(Hash)
        return market['symbol']
      end
      return string
    end

    def market(symbol)
      if not self.markets
        raise ExchangeError, "#{self.id}: Markets not loaded"
      end
      if symbol.is_a?(String) and (self.markets.include?(symbol))
        return self.markets[symbol]
      end
      raise ExchangeError, "#{self.id}: No market symbol #{symbol}"
    end

    def market_ids(symbols)
      return symbols.map{|symbol| self.market_id(symbol)}
    end

    def market_id(symbol)
      market = self.market(symbol)
      return market ? market['id'] : symbol
    end

    def calculate_fee(symbol, type, side, amount, price, takerOrMaker = 'taker', params = {})
      market = self.markets[symbol]
      rate = market[takerOrMaker]
      cost = self.cost_to_precision(symbol, amount * price).to_f
      return {
        'rate' => rate,
        'type' => takerOrMaker,
        'currency' => market['quote'],
        'cost' => self.fee_to_precision(symbol, rate * cost).to_f,
      }
    end

    def edit_limit_buy_order(id, symbol, *args)
      return self.edit_limit_order(id, symbol, 'buy', *args)
    end

    def edit_limit_sell_order(id, symbol, *args)
      return self.edit_limit_order(id, symbol, 'sell', *args)
    end

    def edit_limit_order(id, symbol, *args)
      return self.edit_order(id, symbol, 'limit', *args)
    end

    def edit_order(id, symbol, *args)
      if not self.enableRateLimit
        raise ExchangeError "#{self.id}: edit_order() requires enableRateLimit = true'"
      end
      self.cancel_order(id, symbol)
      return self.create_order(symbol, *args)
    end

    def create_limit_order(symbol, *args)
      return self.create_order(symbol, 'limit', *args)
    end

    def create_market_order(symbol, *args)
      return self.create_order(symbol, 'market', *args)
    end

    def create_limit_buy_order(symbol, *args)
      return self.create_order(symbol, 'limit', 'buy', *args)
    end

    def create_limit_sell_order(symbol, *args)
      return self.create_order(symbol, 'limit', 'sell', *args)
    end

    def create_market_buy_order(symbol, amount, params = {})
      return self.create_order(symbol, 'market', 'buy', amount, nil, params)
    end

    def create_market_sell_order(symbol, amount, params = {})
      return self.create_order(symbol, 'market', 'sell', amount, nil, params)
    end

    def parse_trades(trades, market = nil, since = nil, limit = nil)
      array = trades.collect{ |trade| self.parse_trade(trade, market)}
      array = self.sort_by(array, 'timestamp')
      symbol = market ? market['symbol'] : nil
      return self.filter_by_symbol_since_limit(array, symbol, since, limit)
    end

    def parse_ledger(data, currency = nil, since = nil, limit = nil)
      array = data.collect{ |item| self.parse_ledger_entry(item, currency)}
      array = self.sort_by(array, 'timestamp')
      code = currency ? currency['code'] : nil
      return self.filter_by_currency_since_limit(array, code, since, limit)
    end

    def parse_transactions(transactions, currency = nil, since = nil, limit = nil, params = {})
      array = transactions.collect{|transaction| self.parse_transaction(transaction, currency)}
      array = self.sort_by(array, 'timestamp')
      code = currency ? currency['code'] : nil
      return self.filter_by_currency_since_limit(array, code, since, limit)
    end

    def parse_orders(orders, market = nil, since = nil, limit = nil)
      array = orders.collect{|order| self.parse_order(order, market)}
      array = self.sort_by(array, 'timestamp')
      symbol = market ? market['symbol'] : nil
      return self.filter_by_symbol_since_limit(array, symbol, since, limit)
    end

    def filter_by_value_since_limit(array, field, value = nil, since = nil, limit = nil)
      if value
        array = array.select{|entry| entry[field] == value}
      end
      if since
        array = array.select{|entry| entry['timestamp'] >= since}
      end
      if limit
        array = array[0...limit]
      end
      return array
    end

    def filter_by_symbol_since_limit(array, symbol = nil, since = nil, limit = nil)
      return self.filter_by_value_since_limit(array, 'symbol', symbol, since, limit)
    end

    def filter_by_currency_since_limit(array, code = nil, since = nil, limit = nil)
      return self.filter_by_value_since_limit(array, 'currency', code, since, limit)
    end

    def filter_by_since_limit(array, since = nil, limit = nil)
      if since
        array = array.select{|entry| entry['timestamp'] >= since}
      end
      if limit
        array = array[0...limit]
      end
      return array
    end

    def filter_by_symbol(array, symbol = nil)
      array = self.to_array(array)
      if symbol
        return array.select{|entry| entry['symbol'] == symbol}
      end
      return array
    end

    def filter_by_array(objects, key, values = nil, indexed = true)
      # return all of them if no values were passed in
      if values.nil?
        return indexed ? self.index_by(objects, key) : objects
      end

      result = []
      objects.each do |object|
        value = object.has_key?(key) ? object[key] : nil
        if values.include?(value)
          result.append(objects[i])
        end
      end
      return indexed ? self.index_by(result, key) : result
    end

    def currency(code)
      unless self.currencies
        raise Exchange::ExchangeError, 'Currencies not loaded.'
      end
      if code.is_a?(String) && self.currencies.include?(code)
        return self.currencies[code]
      end
      raise Exchange::ExchangeError, 'Does not have currency code ' + code
    end

    # Ethereum accepts three types of keys: private key, account or address, and UTC JSON keystore.

    # Creates an account object from a private key.
    #   private_key: The private key hex string beginning with 0x.
    def decrypt_account_from_private_key(private_key)
      raise Exchange::ExchangeError, "Not implemented yet."
      return nil
    end

    # Creates an account object from an account/address
    def decrypt_account(value, password)
      return Eth::key.decrypt(value, password)
    end

    # Creates an account object from a UTC JSON keystore
    def decrypt_account_from_json(value, password)
      value_to_decrypt = value.is_a?(String) ? JSON.load(value) : value
      return self.decrypt_account(value_to_decrypt, password)
    end

    # TODO: find a reliable web3/ethereum library for Ruby.

    # def decryptAccount(key, password):
    #     return self.web3.eth.accounts.decrypt(key, password)
    #
    # def decryptAccountFromPrivateKey(privateKey):
    #     return self.web3.eth.accounts.privateKeyToAccount(privateKey)
    #

    def eth_decimals(unit = 'ether')
      units = {
        'wei'=> 0,          # 1
        'kwei'=> 3,         # 1000
        'babbage'=> 3,      # 1000
        'femtoether'=> 3,   # 1000
        'mwei'=> 6,         # 1000000
        'lovelace'=> 6,     # 1000000
        'picoether'=> 6,    # 1000000
        'gwei'=> 9,         # 1000000000
        'shannon'=> 9,      # 1000000000
        'nanoether'=> 9,    # 1000000000
        'nano'=> 9,         # 1000000000
        'szabo'=> 12,       # 1000000000000
        'microether'=> 12,  # 1000000000000
        'micro'=> 12,       # 1000000000000
        'finney'=> 15,      # 1000000000000000
        'milliether'=> 15,  # 1000000000000000
        'milli'=> 15,       # 1000000000000000
        'ether'=> 18,       # 1000000000000000000
        'kether'=> 21,      # 1000000000000000000000
        'grand'=> 21,       # 1000000000000000000000
        'mether'=> 24,      # 1000000000000000000000000
        'gether'=> 27,      # 1000000000000000000000000000
        'tether'=> 30,      # 1000000000000000000000000000000
      }
      return self.safe_value(units, unit)
    end

    def eth_unit(decimals = 18)
      units = {
        0=> 'wei',      # 1000000000000000000
        3=> 'kwei',     # 1000000000000000
        6=> 'mwei',     # 1000000000000
        9=> 'gwei',     # 1000000000
        12=> 'szabo',   # 1000000
        15=> 'finney',  # 1000
        18=> 'ether',   # 1
        21=> 'kether',  # 0.001
        24=> 'mether',  # 0.000001
        27=> 'gether',  # 0.000000001
        30=> 'tether',  # 0.000000000001
      }
      return self.safe_value(units, decimals)
    end

    def fromWei(amount, unit = 'ether', decimals = 18)
      raise ExchangeError, "Not implemented."
    end

    def toWei(amount, unit = 'ether', decimals = 18)
      raise ExchangeError, "Not implemented."
    end
  end
end
