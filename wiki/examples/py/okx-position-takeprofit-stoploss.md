- [Okx Position Takeprofit Stoploss](./examples/py/)


 ```python
 import os
import re
import sys
from pprint import pprint
import ccxt
print('CCXT Version:', ccxt.__version__)
exchange = ccxt.okx({
    "apiKey": "YOUR_API_KEY",
    "secret": "YOUR_API_SECRET",
    "password": "YOUR_API_PASSWORD",
})

markets = exchange.load_markets()

symbol = 'ETH/USDT:USDT'

market = exchange.market(symbol)

print('-----------------------------------------------------------------------')

balance = exchange.fetch_free_balance()
print('Available balance:')
pprint(balance)

print('-----------------------------------------------------------------------')

ticker = exchange.fetch_ticker(symbol)
print(symbol, 'ticker:')
pprint(ticker)

print('-----------------------------------------------------------------------')

side = 'buy'  # set it to 'buy' for a long position, 'sell' for a short position
order_type = 'limit'  # set it to 'market' or 'limit'
amount = 1  # how many contracts

last_price = ticker['last']
ask_price = ticker['ask']
bid_price = ticker['bid']

# None for market orders or a limit price for a limit order
price = None if order_type == 'market' else ((ask_price * 1.001) if side == 'sell' else (bid_price * 0.999))

# the following line is not necessary, it's here just for print readability below
price = float(exchange.price_to_precision(symbol, price))

# set stop-loss trigger price to last_price - 1% for a long position
# set stop-loss trigger price to last_price + 1% for a short position
stop_loss_trigger_price = (last_price if order_type == 'market' else price) * (0.999 if side == 'buy' else 1.001)

# stop-loss limit price at i.e. -1% from trigger price for a long position
# stop-loss limit price at i.e. +1% from trigger price for a short position
stop_loss_limit_price = stop_loss_trigger_price * (1.001 if side == 'buy' else 0.999)

# set take-profit trigger price to last_price + 1% for a long position
# set take-profit trigger price to last_price - 1% for a short position
take_profit_trigger_price = (last_price if order_type == 'market' else price) * (1.001 if side == 'buy' else 0.999)

# take-profit limit price at i.e. -1% from trigger price for a long position
# take-profit limit price at i.e. +1% from trigger price for a short position
take_profit_limit_price = take_profit_trigger_price * (1.001 if side == 'buy' else 0.999)

# the following four lines are not necessary, they're here just for pprint() readability
take_profit_trigger_price = float(exchange.price_to_precision(symbol, take_profit_trigger_price))
take_profit_limit_price = float(exchange.price_to_precision(symbol, take_profit_limit_price))
stop_loss_trigger_price = float(exchange.price_to_precision(symbol, stop_loss_trigger_price))
stop_loss_limit_price = float(exchange.price_to_precision(symbol, stop_loss_limit_price))

params = {
    'stopLoss': {
        'triggerPrice': stop_loss_trigger_price,
        # set a price for a stop loss limit order
        # or leave commented for a stop loss market order
        # 'price': stop_loss_limit_price,
    },
    'takeProfit': {
        'triggerPrice': take_profit_trigger_price,
        # set a price for a take profit limit order
        # or leave commented for a take profit market order
        # 'price': take_profit_limit_price,
    }
}

position_value = market['contractSize'] * amount

print('Going to open a', 'long' if side == 'buy' else 'short', 'position',
    'for', amount, 'contracts worth', position_value, market['base'], '~', position_value * last_price, market['settle'])
if order_type == 'market':
    print('with a market', side, 'order at market price using the following params:')
else:
    print('with a limit', side, 'order at price', price, 'using the following params:')
pprint(params)

print('-----------------------------------------------------------------------')

# exchange.verbose = True  # uncomment for debugging purposes if necessary

try:
    created_order = exchange.create_order(symbol, order_type, side, amount, price, params)
    pprint(created_order)
    # uncomment the following lines to cancel a limit order
    # if order_type == 'limit':
    #     canceled_order = exchange.cancel_order(created_order['id'], symbol)
    #     pprint(canceled_order)
except Exception as e:
    print(type(e).__name__, str(e))
 
```