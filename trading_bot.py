#!/usr/bin/env python3

import ccxt
import os
from dotenv import load_dotenv
import time

# Load environment variables from .env file
load_dotenv()

# Retrieve API credentials
api_key = os.getenv('COINBASE_API_KEY')
api_secret = os.getenv('COINBASE_API_SECRET')
passphrase = os.getenv('COINBASE_API_PASSPHRASE')

# Ensure the API credentials are loaded
if not all([api_key, api_secret, passphrase]):
    raise ValueError("API credentials not found! Check your .env file.")

# Initialize Coinbase Pro exchange
exchange = ccxt.coinbase({
    'apiKey': api_key,
    'secret': api_secret,
    'password': passphrase,
    'enableRateLimit': True,
})

# Define trading parameters
symbol = 'BTC/USD'
amount = 0.001  # Amount in BTC
threshold = 100  # Price change threshold in USD

def fetch_price():
    ticker = exchange.fetch_ticker(symbol)
    return ticker['last']

def place_order(side, amount, price=None):
    if price:
        order = exchange.create_limit_order(symbol, side, amount, price)
    else:
        order = exchange.create_market_order(symbol, side, amount)
    return order

def main():
    last_price = fetch_price()
    while True:
        current_price = fetch_price()
        price_diff = current_price - last_price

        if price_diff >= threshold:
            print(f"Price increased by {price_diff}. Placing sell order.")
            place_order('sell', amount)
            last_price = current_price
        elif price_diff <= -threshold:
            print(f"Price decreased by {price_diff}. Placing buy order.")
            place_order('buy', amount)
            last_price = current_price

        time.sleep(60)  # Wait for 1 minute before next check

if __name__ == "__main__":
    main()

