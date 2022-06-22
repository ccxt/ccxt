import ccxt  # noqa: E402

exchange = ccxt.blockchaincom({
})

symbol = 'BTC/USDT'

market = exchange.fetch_markets()
print(market)

print("\n")

l2 = exchange.fetch_l2_order_book(symbol)
print(l2)

print("\n")

l3 = exchange.fetch_l3_order_book(symbol)
print(l3)

print("\n")

orders = exchange.fetch_order_book(symbol)
print(orders)

print("\n")

ticker = exchange.fetch_ticker(symbol)
print(ticker)

print("\n")

tickers = exchange.fetch_tickers()
print(tickers[symbol])