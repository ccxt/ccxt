# test_cube.py
import sys
import os

# Adjust the path to where `cube.py` is located
sys.path.append('/Users/admin/Documents/PROG/Cube/ccxt/python/ccxt')

from cube import cube

def test_cube_public_ip():
    # Initialize the Cube Exchange instance
    exchange = cube()

    try:
        # Fetch some public data, like the market ticker
        ticker = exchange.fetch_ticker('BTC/USDT')
        print("Ticker:", ticker)

        # Fetch market symbols
        markets = exchange.fetch_markets()
        print("Markets:", markets)

        # Fetch order book
        order_book = exchange.fetch_order_book('BTC/USDT')
        print("Order Book:", order_book)

    except Exception as e:
        print(f"An error occurred: {e}")

def fetch_ticker(self, symbol, params={}):
    market = self.market(symbol)
    print(f"Fetching ticker for market ID: {market['id']}")
    response = self.publicGetTicker(self.extend({'symbol': market['id']}, params))
    print(f"API Response: {response}")
    return self.parse_ticker(response['ticker'])

def fetch_markets(self, params={}):
    try:
        response = self.publicGetMarkets(params)
        return self.parse_markets(response)
    except Exception as e:
        print(f"Error fetching markets: {e}")
        raise




if __name__ == "__main__":
    test_cube_public_ip()
