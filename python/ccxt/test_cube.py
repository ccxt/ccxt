import base64
from cube import cube

# Test the updated cube class
# Fill out api_key and secret of account to fetch 

def test_cube():
    # Initialize the cube exchange with appropriate API keys and secret
    api_key = 'APIKEY'
    secret = 'APISECRET'
    exchange = cube({
        'apiKey': api_key,
        'secret': secret
    })
    try:

# PUBLIC ENDPOINT FUNCTIONS

        # Print all markets
        print("Fetching markets...")
        markets = exchange.fetch_markets()
        print("Markets:", markets)

        # Fetch market for specific symbol
        symbol = 'BTC'
        print("Fetching markets...")
        markets_data, symbol_provided = exchange.fetch_markets(symbol)  # Get the market data
        exchange.print_markets_structure(markets_data,symbol_provided)  # Print the structured market data

        # Fetch recent trades for a specific symbol, e.g., 'ETHUSDC'
        symbol = 'ETHUSDC'
        print(f"Fetching book snapshot for {symbol}...")
        recent_trades = exchange.fetch_book_snapshot(symbol)
        print(recent_trades)

        # Fetch tickers snapshot
        print("Fetching ticker snapshot")
        ticker_snapshot = exchange.fetch_tickers_snapshot()
        print ("Ticker Snapshot:", ticker_snapshot)

        # Test fetching klines
        marketId = 100004  # Replace with the actual symbol you want to test
        interval = '1h'
        start_time = 1710940000  # Example start time in UNIX timestamp
        end_time = 1710945000    # Example end time in UNIX timestamp
        limit = 2
        print("\nFetching klines...")
        klines = exchange.fetch_klines(marketId, interval=interval, startTime=start_time, endTime=end_time, limit=limit)
        print("Klines:", klines)

# ------------------- Working on market function relationship ------------------------- #
        # Fetch ticker (parsed)
        # print(f"\nFetching ticker for {symbol}...")
        # ticker = exchange.fetch_ticker(symbol)
        # print("Ticker:", ticker)

        # Fetching oderbook
        # print(f"\nFetching order book for {symbol}...")
        # exchange.fetch_order_book(symbol)
#-------------------------------------------------------------------------------------- #

# PRIVATE / AUTHENTICATED REQUESTS 

        #Fetching users
        print("\nChecking user...")
        user_info = exchange.check_user()
        print("User Info:", user_info)

        #Getting user subaccounts
        print('Getting user Subaccounts...')
        exchange.get_user_subaccounts()

#-------Use subaccount ID as an argument for following functions-----#

        #Getting info on user Subacccount
        print('Fetching user Subaccount...')
        exchange.fetch_user_subaccount()

        #Fetching Subaccount positions
        exchange.fetch_user_subaccount_positions()

        #Fetching Subaccount deposits
        exchange.fetch_user_subaccount_deposits()

        #Fetch Subaccounts orders
        exchange.fetch_user_subaccount_orders()
        
        #Fetch Subaccount fills
        exchange.fetch_user_subaccount_fills()

        #Fetching Subaccount Withdrawls
        exchange.fetch_user_subaccount_withdrawals()
        
        #Fetch user adresses
        exchange.fetch_user_addresses()

        #Fetch user adresses settings
        exchange.fetch_user_address_settings()

#----------------------------------------------------------------#

        #Post Fee-Stimates: Call the function with specific parameters
        market_id = 100004  # Replace with the actual market ID
        subaccount_id = 8  # Replace with the actual subaccount ID
        side = 'Bid'  # Enum value for side (e.g., 'Bid' or 'Ask')
        post_only = 'Enabled'  # Enum value for postOnly (e.g., 'Disabled' or 'Enabled')
        quantity = 1000  # Quantity for the estimate
        price = 500000  # Price for the estimate
        exchange.estimate_fees(market_id, subaccount_id, side, post_only, quantity, price)

        # Call the function to make a withdrawal
        exchange.withdraw(
            subaccount_id=12345,
            asset_id=1,
            amount=100000000,  # Example amount in the smallest unit
            destination='destination_address_here',
            timestamp=1688786474000,  # Example timestamp
            verification_key=base64.b64encode(b'public_key').decode('utf-8'),
            signature=base64.b64encode(b'signature').decode('utf-8')
        )

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_cube()
