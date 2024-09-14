import sys
sys.path.append('/Users/admin/Documents/PROG/Cube/ccxt/python/ccxt')

from cube import cube

def test_fetch_ticker():
    exchange = cube()
    try:
        print("Fetching markets...")
        markets = exchange.fetch_markets()
        print("Markets:", markets)

        symbol = 'BTC/USDT'
        print(f"\nFetching ticker for {symbol}...")
        ticker = exchange.fetch_ticker(symbol)
        print("Ticker:", ticker)
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_fetch_ticker()
