package ccxt

type Bitbank struct {
   *bitbank
   Core *bitbank
}

func NewBitbank(userConfig map[string]interface{}) Bitbank {
   p := &bitbank{}
   p.Init(userConfig)
   return Bitbank{
       bitbank: p,
       Core:  p,
   }
}

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code


/**
 * @method
 * @name bitbank#fetchMarkets
 * @description retrieves data on all markets for bitbank
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#get-all-pairs-info
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object[]} an array of objects representing market data
 */
func (this *Bitbank) FetchMarkets(params ...interface{}) ([]MarketInterface, error) {
    res := <- this.Core.FetchMarkets(params...)
    if IsError(res) {
        return nil, CreateReturnError(res)
    }
    return NewMarketInterfaceArray(res), nil
}
/**
 * @method
 * @name bitbank#fetchTicker
 * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/public-api.md#ticker
 * @param {string} symbol unified symbol of the market to fetch the ticker for
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
 */
func (this *Bitbank) FetchTicker(symbol string, options ...FetchTickerOptions) (Ticker, error) {

    opts := FetchTickerOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.FetchTicker(symbol, params)
    if IsError(res) {
        return Ticker{}, CreateReturnError(res)
    }
    return NewTicker(res), nil
}
/**
 * @method
 * @name bitbank#fetchOrderBook
 * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/public-api.md#depth
 * @param {string} symbol unified symbol of the market to fetch the order book for
 * @param {int} [limit] the maximum amount of order book entries to return
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
 */
func (this *Bitbank) FetchOrderBook(symbol string, options ...FetchOrderBookOptions) (OrderBook, error) {

    opts := FetchOrderBookOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var limit interface{} = nil
    if opts.Limit != nil {
        limit = *opts.Limit
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.FetchOrderBook(symbol, limit, params)
    if IsError(res) {
        return OrderBook{}, CreateReturnError(res)
    }
    return NewOrderBook(res), nil
}
/**
 * @method
 * @name bitbank#fetchTrades
 * @description get the list of most recent trades for a particular symbol
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/public-api.md#transactions
 * @param {string} symbol unified symbol of the market to fetch trades for
 * @param {int} [since] timestamp in ms of the earliest trade to fetch
 * @param {int} [limit] the maximum amount of trades to fetch
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
 */
func (this *Bitbank) FetchTrades(symbol string, options ...FetchTradesOptions) ([]Trade, error) {

    opts := FetchTradesOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var since interface{} = nil
    if opts.Since != nil {
        since = *opts.Since
    }

    var limit interface{} = nil
    if opts.Limit != nil {
        limit = *opts.Limit
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.FetchTrades(symbol, since, limit, params)
    if IsError(res) {
        return nil, CreateReturnError(res)
    }
    return NewTradeArray(res), nil
}
/**
 * @method
 * @name bitbank#fetchTradingFees
 * @description fetch the trading fees for multiple markets
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#get-all-pairs-info
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
 */
func (this *Bitbank) FetchTradingFees(params ...interface{}) (TradingFees, error) {
    res := <- this.Core.FetchTradingFees(params...)
    if IsError(res) {
        return TradingFees{}, CreateReturnError(res)
    }
    return NewTradingFees(res), nil
}
/**
 * @method
 * @name bitbank#fetchOHLCV
 * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/public-api.md#candlestick
 * @param {string} symbol unified symbol of the market to fetch OHLCV data for
 * @param {string} timeframe the length of time each candle represents
 * @param {int} [since] timestamp in ms of the earliest candle to fetch
 * @param {int} [limit] the maximum amount of candles to fetch
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
 */
func (this *Bitbank) FetchOHLCV(symbol string, options ...FetchOHLCVOptions) ([]OHLCV, error) {

    opts := FetchOHLCVOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var timeframe interface{} = nil
    if opts.Timeframe != nil {
        timeframe = *opts.Timeframe
    }

    var since interface{} = nil
    if opts.Since != nil {
        since = *opts.Since
    }

    var limit interface{} = nil
    if opts.Limit != nil {
        limit = *opts.Limit
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.FetchOHLCV(symbol, timeframe, since, limit, params)
    if IsError(res) {
        return nil, CreateReturnError(res)
    }
    return NewOHLCVArray(res), nil
}
/**
 * @method
 * @name bitbank#fetchBalance
 * @description query for balance and get the amount of funds available for trading or funds locked in orders
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#assets
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
 */
func (this *Bitbank) FetchBalance(params ...interface{}) (Balances, error) {
    res := <- this.Core.FetchBalance(params...)
    if IsError(res) {
        return Balances{}, CreateReturnError(res)
    }
    return NewBalances(res), nil
}
/**
 * @method
 * @name bitbank#createOrder
 * @description create a trade order
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#create-new-order
 * @param {string} symbol unified symbol of the market to create an order in
 * @param {string} type 'market' or 'limit'
 * @param {string} side 'buy' or 'sell'
 * @param {float} amount how much of currency you want to trade in units of base currency
 * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
 */
func (this *Bitbank) CreateOrder(symbol string, typeVar string, side string, amount float64, options ...CreateOrderOptions) (Order, error) {

    opts := CreateOrderOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var price interface{} = nil
    if opts.Price != nil {
        price = *opts.Price
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.CreateOrder(symbol, typeVar, side, amount, price, params)
    if IsError(res) {
        return Order{}, CreateReturnError(res)
    }
    return NewOrder(res), nil
}
/**
 * @method
 * @name bitbank#cancelOrder
 * @description cancels an open order
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#cancel-order
 * @param {string} id order id
 * @param {string} symbol unified symbol of the market the order was made in
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
 */
func (this *Bitbank) CancelOrder(id string, options ...CancelOrderOptions) (Order, error) {

    opts := CancelOrderOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var symbol interface{} = nil
    if opts.Symbol != nil {
        symbol = *opts.Symbol
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.CancelOrder(id, symbol, params)
    if IsError(res) {
        return Order{}, CreateReturnError(res)
    }
    return NewOrder(res), nil
}
/**
 * @method
 * @name bitbank#fetchOrder
 * @description fetches information on an order made by the user
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#fetch-order-information
 * @param {string} id the order id
 * @param {string} symbol unified symbol of the market the order was made in
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
 */
func (this *Bitbank) FetchOrder(id string, options ...FetchOrderOptions) (Order, error) {

    opts := FetchOrderOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var symbol interface{} = nil
    if opts.Symbol != nil {
        symbol = *opts.Symbol
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.FetchOrder(id, symbol, params)
    if IsError(res) {
        return Order{}, CreateReturnError(res)
    }
    return NewOrder(res), nil
}
/**
 * @method
 * @name bitbank#fetchOpenOrders
 * @description fetch all unfilled currently open orders
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#fetch-active-orders
 * @param {string} symbol unified market symbol
 * @param {int} [since] the earliest time in ms to fetch open orders for
 * @param {int} [limit] the maximum number of  open orders structures to retrieve
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
 */
func (this *Bitbank) FetchOpenOrders(options ...FetchOpenOrdersOptions) ([]Order, error) {

    opts := FetchOpenOrdersOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var symbol interface{} = nil
    if opts.Symbol != nil {
        symbol = *opts.Symbol
    }

    var since interface{} = nil
    if opts.Since != nil {
        since = *opts.Since
    }

    var limit interface{} = nil
    if opts.Limit != nil {
        limit = *opts.Limit
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.FetchOpenOrders(symbol, since, limit, params)
    if IsError(res) {
        return nil, CreateReturnError(res)
    }
    return NewOrderArray(res), nil
}
/**
 * @method
 * @name bitbank#fetchMyTrades
 * @description fetch all trades made by the user
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#fetch-trade-history
 * @param {string} symbol unified market symbol
 * @param {int} [since] the earliest time in ms to fetch trades for
 * @param {int} [limit] the maximum number of trades structures to retrieve
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
 */
func (this *Bitbank) FetchMyTrades(options ...FetchMyTradesOptions) ([]Trade, error) {

    opts := FetchMyTradesOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var symbol interface{} = nil
    if opts.Symbol != nil {
        symbol = *opts.Symbol
    }

    var since interface{} = nil
    if opts.Since != nil {
        since = *opts.Since
    }

    var limit interface{} = nil
    if opts.Limit != nil {
        limit = *opts.Limit
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.FetchMyTrades(symbol, since, limit, params)
    if IsError(res) {
        return nil, CreateReturnError(res)
    }
    return NewTradeArray(res), nil
}
/**
 * @method
 * @name bitbank#fetchDepositAddress
 * @description fetch the deposit address for a currency associated with this account
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#get-withdrawal-accounts
 * @param {string} code unified currency code
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
 */
func (this *Bitbank) FetchDepositAddress(code string, options ...FetchDepositAddressOptions) (DepositAddress, error) {

    opts := FetchDepositAddressOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.FetchDepositAddress(code, params)
    if IsError(res) {
        return DepositAddress{}, CreateReturnError(res)
    }
    return NewDepositAddress(res), nil
}
/**
 * @method
 * @name bitbank#withdraw
 * @description make a withdrawal
 * @see https://github.com/bitbankinc/bitbank-api-docs/blob/38d6d7c6f486c793872fd4b4087a0d090a04cd0a/rest-api.md#new-withdrawal-request
 * @param {string} code unified currency code
 * @param {float} amount the amount to withdraw
 * @param {string} address the address to withdraw to
 * @param {string} tag
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
 */
func (this *Bitbank) Withdraw(code string, amount float64, address string, options ...WithdrawOptions) (Transaction, error) {

    opts := WithdrawOptionsStruct{}

    for _, opt := range options {
        opt(&opts)
    }

    var tag interface{} = nil
    if opts.Tag != nil {
        tag = *opts.Tag
    }

    var params interface{} = nil
    if opts.Params != nil {
        params = *opts.Params
    }
    res := <- this.Core.Withdraw(code, amount, address, tag, params)
    if IsError(res) {
        return Transaction{}, CreateReturnError(res)
    }
    return NewTransaction(res), nil
}