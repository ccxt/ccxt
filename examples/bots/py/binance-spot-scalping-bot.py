import ccxt
import math
import time

print('CCXT Version:', ccxt.__version__)

####################################################################################
# Simple implementation of a trading bot using a scalping strategy. Periodically  ##
# buys a product using a market buy for the minimum amount allowed by the         ##
# exchange on the selected market pair and immidietaly places a limit sell order  ##
# for a slightly higher price.                                                    ##
#                                                                                 ##
# Disclaimer: this bot is for educational purposes only. Use at your own risk.    ##
####################################################################################

# SET THE PARAMETERS HERE

# Initiate the exchange
exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

# Define the trading symbol
symbol = "BTC/BUSD"

# Define the profit margin as a price multiplier
profit_margin = 1.003

# Define the sleep time between each iteration
sleep_time_seconds = 60 * 30

# END OF PARAMETERS

# Fetch the maker and taker trading fees
fees = exchange.fetch_trading_fee(symbol=symbol)
taker_fee = fees['taker']
maker_fee = fees['maker']

print("Fees for symbol:", symbol, "Taker:", taker_fee, "Maker:", maker_fee)

# Calculate the minimum profit margin to cover for the market buy and limit sell fees
min_profit_margin = 1 / (1 - taker_fee) / (1 - maker_fee)
assert profit_margin >= min_profit_margin, f"The profit margin is too low. The minimum profit margin to not incur losses is: {min_profit_margin}"

# Load the market
market = exchange.load_markets()[symbol]
min_cost = market['limits']['cost']['min']
min_amount = market['limits']['amount']['min']
print(f"The minimum cost: {min_cost} {market['quote']}")
print(f"The minimum amount: {min_amount} {market['base']}")

print("Starting the bot...")

# Start the main loop
while True:

    try:
        # Print current time
        print("Current time:", time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))

        # Fetch the current price
        price = exchange.fetch_ticker(symbol)["last"]
        print("The current price:", price)

        # Recalculate the minimum order amount and round it up to the nearest multiple of min_amount
        min_order_amount = math.ceil(min_cost / price / min_amount) * min_amount
        print("The minimum order amount :", min_order_amount)

        # Place the market buy order
        buy_order = exchange.create_order(symbol=symbol, type="market", side="buy", amount=min_order_amount)
        print(f"Filled market buy order for {buy_order['filled']} {market['base']} at {buy_order['price']} {market['quote']} for a total cost of {buy_order['cost']} {market['quote']}")

        # Calculate the sell price
        sell_price = buy_order["price"] * profit_margin

        # Place the limit sell order
        sell_order = exchange.create_order(symbol=symbol, type="limit", side="sell", amount=min_order_amount, price=sell_price)

        # Calculate the profit earned after the sell order is filled
        profit = (sell_order["price"] - buy_order["price"]) * buy_order["filled"]
        print(f"Created limit sell order for {sell_order['amount']} {market['base']} at {sell_order['price']} {market['quote']} for a profit of {profit} {market['quote']}")

    except ccxt.errors.InsufficientFunds:
        print("Insufficient funds for market buy")

    print("sleeping for:", sleep_time_seconds)
    time.sleep(sleep_time_seconds)
