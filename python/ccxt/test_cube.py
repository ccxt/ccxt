import sys
sys.path.append('/Users/admin/Documents/PROG/Cube/ccxt/python/ccxt')

from cube import cube

# Test the updated cube class
def test_cube():
    exchange = cube()

    try:
        print("Fetching markets...")
        markets = exchange.fetch_markets()
        print("Markets:", markets)

        symbol = 'BTC/USDC'

        print(f"\nFetching ticker for {symbol}...")
        ticker = exchange.fetch_ticker(symbol)
        print("Ticker:", ticker)

        print(f"\nFetching order book for {symbol}...")
        exchange.fetch_order_book(symbol)

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_cube()