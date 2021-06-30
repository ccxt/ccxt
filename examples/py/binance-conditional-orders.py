import ccxt
from pprint import pprint

print('CCXT Version:', ccxt.__version__)

exchange = ccxt.binance({
    'enableRateLimit': True,
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'options': {
        'defaultType': 'future',
    },
})

print('Loading markets from', exchange.id)
exchange.load_markets()
print('Loaded markets from', exchange.id)

exchange.verbose = True

symbol = 'ETH/USDT'
type = 'market'
side = 'buy'  # long
amount = 10

order1 = exchange.create_order(symbol, 'market', 'buy', amount)

order1_price = order1['price']
if order1_price is None:
    order1_price = order1['average']
if order1_price is None:
    cumulative_quote = float(order1['info']['cumQuote'])
    executed_quantity = float(order1['info']['executedQty'])
    order1_price = cumulative_quote / executed_quantity

pprint(order1)

print('---------------------------------------------------------------------')

stop_loss_params = {'stopPrice': order1_price * 0.9}
order2 = exchange.create_order(symbol, 'stop_market', 'sell', amount, None, stop_loss_params)
pprint(order2)

print('---------------------------------------------------------------------')

take_profit_params = {'stopPrice': order1_price * 1.6}
order3 = exchange.create_order(symbol, 'take_profit_market', 'sell', amount, None, take_profit_params)
pprint(order3)
