import ccxt
from pprint import pprint


def load_exchange(exchange):
    return exchange.load_markets(True)

print('CCXT Version:', ccxt.__version__)


exchange = ccxt.b2c2({
    'apiKey': ''
})


markets = load_exchange(exchange)
# pprint(markets)

# currencies = exchange.fetch_currencies();
# pprint(currencies)

ledger = exchange.fetch_ledger('ETH');
pprint(ledger)