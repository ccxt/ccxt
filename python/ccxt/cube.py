import sys
sys.path.append('/Users/admin/Documents/PROG/Cube/ccxt/python/ccxt')

from ccxt.base.exchange import Exchange

class cube(Exchange):

    def describe(self):
        return self.deep_extend(super(cube, self).describe(), {
            'id': 'cube',
            'name': 'Cube Exchange',
            'countries': ['US'],
            'rateLimit': 1000,
            'has': {
                'fetchMarkets': True,
                'fetchTicker': True,
                'fetchOrderBook': True,
            },
            'urls': {
                'api': {
                    'public': 'https://api.cube.exchange/md/v0',
                },
                'www': 'https://www.cube.exchange',
                'doc': 'https://docs.cube.exchange',
            },
            'api': {
                'public': {
                    'get': [
                        'book/{market_id}/snapshot',
                        'tickers/snapshot',
                        'parsed/tickers',
                        'parsed/book/{market_symbol}/snapshot',
                        'parsed/book/{market_symbol}/recent-trades',
                    ],
                },
            },
        })

    def request(self, endpoint, method='GET', params={}):
        url = self.urls['api']['public'] + '/' + endpoint
        response = self.fetch(url, method, params)
        return response

    def fetch_markets(self, params={}):
        try:
            response = self.request('tickers/snapshot', 'GET', params)
            print(f"Raw API response for markets: {response}")  # Debugging line to see raw API output

            if response is None or 'result' not in response or 'tops' not in response['result']:
                raise Exception('Invalid response structure for markets')

            self.markets = self.parse_markets(response['result']['tops'])
            return self.markets
        except Exception as e:
            print(f"Error fetching markets: {e}")
            raise

    def parse_markets(self, tops):
        result = []
        for market in tops:
            id = str(market.get('marketId', 'UNKNOWN'))
            base = market.get('base', 'UNKNOWN')  # Update as per actual data fields
            quote = market.get('quote', 'UNKNOWN') # Update as per actual data fields
            symbol = f"{base}/{quote}"  # Construct symbol if available
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_ticker(self, symbol, params={}):
        if not hasattr(self, 'markets') or not self.markets:
            raise Exception('Markets not loaded')
        
        try:
            # Ensure markets are loaded
            self.load_markets()
            
            market = self.market(symbol)
            if market is None:
                raise Exception(f'Market for symbol {symbol} not found')

            # Fetch the tickers data
            response = self.request('parsed/tickers', 'GET', params)
            print(f"Raw ticker response: {response}")

            # Check if response is valid
            if response is None:
                raise Exception('Received None from API')
            if 'result' not in response:
                raise Exception('Response does not contain result')
    
            # Safe access to ticker data
            ticker_info = next((item for item in response['result'] if item['ticker_id'] == market['id']), None)
            if ticker_info is None:
                raise Exception(f'Ticker information for {symbol} not found')

            return self.parse_ticker(ticker_info)

        except Exception as e:
            print(f"Error fetching ticker: {e}")
            raise

    def parse_ticker(self, ticker):
        if ticker is None:
            return {
                'symbol': 'UNKNOWN',
                'last': 0,
                'high': 0,
                'low': 0,
                'bid': 0,
                'ask': 0,
                'baseVolume': 0,
                'quoteVolume': 0,
                'timestamp': 0,
                'info': {},
            }
        
        return {
            'symbol': ticker.get('ticker_id', 'UNKNOWN'),
            'last': ticker.get('last_price', 0),
            'high': ticker.get('high', 0),
            'low': ticker.get('low', 0),
            'bid': ticker.get('bid', 0),
            'ask': ticker.get('ask', 0),
            'baseVolume': ticker.get('base_volume', 0),
            'quoteVolume': ticker.get('quote_volume', 0),
            'timestamp': ticker.get('timestamp', 0),
            'info': ticker,
        }


    def fetch_order_book(self, symbol, limit=None, params={}):
        if not hasattr(self, 'markets') or not self.markets:
            raise Exception('Markets not loaded')
        market = self.market(symbol)
        if market is None:
            raise Exception(f'Market for symbol {symbol} not found')
        response = self.request(f'book/{market["id"]}/snapshot', 'GET', params)
        return self.parse_order_book(response.get('result', {}))

    def parse_order_book(self, orderbook):
        if orderbook is None:
            return {
                'bids': [],
                'asks': [],
                'timestamp': 0,
                'info': {},
            }
        return {
            'bids': [level for level in orderbook.get('bids', [])],
            'asks': [level for level in orderbook.get('asks', [])],
            'timestamp': orderbook.get('timestamp', 0),
            'info': orderbook,
        }

# Test the updated cube class
def test_cube():
    exchange = cube()

    try:
        # Fetch markets
        print("Fetching markets...")
        markets = exchange.fetch_markets()
        print("Markets:", markets)

        # Assuming BTC/USDT is available in the market data
        symbol = 'BTC/USDT'

        # Fetch ticker
        print(f"\nFetching ticker for {symbol}...")
        ticker = exchange.fetch_ticker(symbol)
        print("Ticker:", ticker)

        # Fetch order book
        print(f"\nFetching order book for {symbol}...")
        order_book = exchange.fetch_order_book(symbol)
        print("Order Book:", order_book)

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_cube()
