from dotenv import load_dotenv
import ccxt
import math
import os
import time

# Define the trading symbol
symbol = "BTC/BUSD"

# Define the minimum profit margin as a multiplier
# Remeber to set it higher than the trading fees
profit_margin = 1.00001

# define the sleep time between each iteration
sleep_time_seconds = 60 * 30

# Load the .env file
load_dotenv()

# Initiate the exchange
exchange = ccxt.binance({
    "apiKey": os.getenv("API_KEY"),
    "secret": os.getenv("API_SECRET")
})

# Load the market
market = exchange.load_markets()[symbol]

min_cost = market['limits']['cost']['min']
min_amount = market['limits']['amount']['min']

print(f"The minimum cost: {min_cost} {market['quote']}")
print(f"The minimum amount: {min_amount} {market['base']}")

print("Starting the bot...")
print("Press Ctrl+C to stop the bot")


# Start the main loop
while True:
    
    try:

        # print current date with seconds
        print ("Current time:", time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))

        price = exchange.fetch_ticker(symbol)["last"]
        print("The current price:", price)

        # Calculate the minimum order amount
        min_order_amount = math.ceil(
            min_cost / price / min_amount) * min_amount
        print("The minimum order amount :", min_order_amount)
        
        # Place the market buy order
        buy_order = exchange.create_order(
            symbol=symbol, type="market", side="buy", amount=min_order_amount
        )
        print(
            f"Filled market buy order for {buy_order['filled']} {market['base']} at {buy_order['price']} {market['quote']} for a total cost of {buy_order['cost']} {market['quote']}")

        # Calculate the sell price
        sell_price = buy_order["price"] * profit_margin

        # Place the limit sell order
        sell_order = exchange.create_order(
            symbol=symbol, type="limit", side="sell", amount=min_order_amount, price=sell_price
        )

        profit = (sell_order["price"] - buy_order["price"]) * buy_order["filled"]

        print(
            f"Created limit sell order for {sell_order['amount']} {market['base']} at {sell_order['price']} {market['quote']} for a profit of {profit} {market['quote']}")

    except ccxt.errors.InsufficientFunds:
        print("Insufficient funds for market buy")

    print("sleeping for:", sleep_time_seconds)
    time.sleep(sleep_time_seconds)
