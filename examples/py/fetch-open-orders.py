import ccxt
from pprint import pprint


print('CCXT Version:', ccxt.__version__)


exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})


markets = exchange.load_markets()
# exchange.verbose = True  # uncomment for debugging purposes if necessary

symbol = 'BTC/USDT'  # says itself

# the since argument must be an integer in milliseconds throughout the lib
since = exchange.parse8601('2021-06-20T00:00:00')  # parse it from ISO8601 datetime string

# how many orders to return, max integer or None to use the exchanges' defaults
limit = None

# your params-overrides here if necessary
params = {
    # https://github.com/ccxt/ccxt/wiki/Manual#overriding-unified-api-params
}

try:
    # https://github.com/ccxt/ccxt/wiki/Manual#querying-orders
    orders = exchange.fetch_open_orders(symbol, since, limit, params)
    pprint(orders)
except Exception as e:
    print(type(e).__name__, str(e))
