import ccxt from "./ccxt.js";

(async () => {
  const exchange = new ccxt.drift({
    accountId: "",
    privateKey:
      "",
  });

  // DONE
  // const candles = await exchange.fetchOHLCV("SOL/USDC:USDC", '1m')
  // console.log(candles)
  // await exchange.fetchOrderBook()
  // const marketTrades = await exchange.fetchTrades("SOL/USDC:USDC")
  // console.log(marketTrades[0])
  // const trades = await exchange.fetchMyTrades("SOL/USDC:USDC")
  // console.log(trades[0])
  // const currencies = await exchange.fetchCurrencies()
  // console.log(currencies)
  // const deposits = await exchange.fetchTransactions()
  // console.log(deposits)
  // const ledger = await exchange.fetchLedger()
  // console.log(ledger)
  // const orderbook = await exchange.fetchOrderBook("SOL/USDC:USDC")
  // console.log(orderbook)
  // const ticker = await exchange.fetchTicker("SOL/USDC:USDC")
  // console.log(ticker)
  // const tickers = await exchange.fetchTickers(["SOL/USDC:USDC", "BTC/USDC:USDC"])
  // console.log(tickers)
  // const order =  await exchange.fetchOrder('268')
  // console.log(order)
  // const orders = await exchange.fetchOrders();
  // console.log(orders)
  // const orders = await exchange.fetchOpenOrders()
  // console.log(orders)
  // const balance = await exchange.fetchBalance()
  // console.log(balance)
  // const funding = await exchange.fetchFundingHistory()
  // console.log(funding)
  // const positions = await exchange.fetchPositions(["SOL/USDC:USDC"])
  // console.log(positions)
  // await exchange.createOrder("SOL/USDC:USDC", "limit", "buy", 0.1, 100);
  // await exchange.cancelOrder("118")
  // await exchange.cancelAllOrders()
  // await exchange.deposit("USDC", 1)
  // await exchange.withdraw("USDC", 1)
  
  // TODO
  // await exchange.fetchMarkets()

  // Next up nice to have
  // await exchange.fetchTradingFees()
  // await exchange.fetchFundingLimits()
  // await exchange.fetchTradingLimits
})();
