import sys
sys.path.append('/Users/admin/Documents/PROG/Cube/ccxt/python/ccxt')
from cube import cube

if __name__ == "__main__":
    config = {
        'apiKey': 'key',
        'secret': 'secret',
    }

    symbol = 'USDC'

    # Initialize the Cube Exchange class
    cube_exchange = cube(config)

    check_user = cube_exchange.check_user()
    print("Check user:", check_user)

    # Fetching markets (public)
    markets = cube_exchange.fetch_markets('USDT')
    print("Markets:", markets)

    # Fetching ticker (public)
    # ticker = cube_exchange.fetch_ticker()
    # print("Ticker:", ticker)

    # Fetch order book
    # print(f"\nFetching order book for {symbol}...")
    # order_book = cube_exchange.fetch_order_book(symbol)
    # print("Orderbook:", order_book)

#     # Placing an order (private)
#     order_response = cube_exchange.create_order('BTC/USDC', 'limit', 'buy', 0.01, 60000)
#     print("Order Response:", order_response)

#     # Cancelling an order (private)
#     #cancel_response = cube_exchange.cancel_order('123456')
#     #print("Cancel Order Response:", cancel_response)

#     # Fetching balance (private)
#     balance = cube_exchange.fetch_balance()
#     print("Account Balance:", balance)

#     # Fetching subaccounts
#     sub = cube_exchange.fetch_subaccounts()
#     print("Sub Accounts:", sub)


# def test_create_order():
#     # Define the order parameters
#     symbol = 'USDT'  # The trading pair symbol
#     order_type = 'limit'  # 'limit' or 'market'
#     side = 'buy'          # 'buy' or 'sell'
#     amount = 1     # Amount of BTC to buy
#     price = 1      # The price at which to buy (only for limit orders)

#     # Try to create the order and print the result
#     try:
#         result = cube_exchange.create_order(symbol, order_type, side, amount, price)
#         print(f"Order created successfully: {result}")
#     except Exception as e:
#         print(f"Failed to create order: {e}")

# # Run the test function
# if __name__ == '__main__':
#     config = {
#         'apiKey': '7ae921d3-8c56-ed0c-bc2e-0143ff90bf50',
#         'secret': '55f0d8d49971631141d7576d68a22ad219440d34bb09dc5e69ec6f94a0955a98',
#     }

#     # Initialize the Cube Exchange class
#     cube_exchange = cube(config)
#     test_create_order()

# 0.00001
