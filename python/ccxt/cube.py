import requests
from ccxt.base.errors import ExchangeError
from ccxt.base.exchange import Exchange

class cube(Exchange):
    def __init__(self, config={}):
        super().__init__(config)

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
        response = requests.get(url, params=params)
        return response.json()

    def fetch_markets(self, params={}):
        try:
            response = self.request('parsed/tickers', 'GET', params)
            #print(f"Raw API response for markets: {response}")

            if response is None or 'result' not in response:
                raise Exception('Invalid response structure for markets')

            markets = []
            for market in response['result']:
                ticker_id = market.get('ticker_id')
                base = market.get('base_currency', 'UNKNOWN')
                quote = market.get('quote_currency', 'UNKNOWN')
                symbol = f"{base}/{quote}"

                markets.append({
                    'id': ticker_id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'active': True,
                    'spot': True,
                    'info': market,
                    'precision': {
                        'amount': None,
                        'price': None
                    },
                    'limits': {
                        'amount': {
                            'min': None,
                            'max': None
                        },
                        'price': {
                            'min': None,
                            'max': None
                        },
                        'cost': {
                            'min': None,
                            'max': None
                        }
                    }
                })

            self.markets = self.index_by(markets, 'symbol')
            #print(f"Markets loaded: {self.markets}")  # Debug print
            return self.markets

        except Exception as e:
            print(f"Error fetching markets: {e}")
            raise

    def fetch_ticker(self, symbol: str, params={}):
        self.fetch_markets()  # Ensure markets are loaded
        market = self.market(symbol)
        ticker_id = market.get('id', None)
        
        if not ticker_id:
            raise ExchangeError(f'No ticker ID found for symbol {symbol}')
        
        try:
            response = self.request('parsed/tickers', 'GET', params)
            # Explicitly avoid printing raw API response here
            # print(f"Raw API response for tickers: {response}")

            if response is None or 'result' not in response:
                raise Exception('Invalid response structure for tickers')

            ticker_data = None
            for ticker in response['result']:
                if ticker['ticker_id'] == ticker_id:
                    ticker_data = ticker
                    break
            
            if ticker_data is None:
                raise ExchangeError(f'Ticker for {symbol} not found')

            # Set spot explicitly
            ticker_data['spot'] = True
            
            return self.parse_ticker(ticker_data, market)

        except Exception as e:
            print(f"Error fetching ticker: {e}")
            raise

    def parse_ticker(self, ticker, market):
        return {
            'symbol': market['symbol'],
            'timestamp': None,
            'datetime': None,
            'high': self.safe_number(ticker, 'high'),
            'low': self.safe_number(ticker, 'low'),
            'bid': self.safe_number(ticker, 'bid'),
            'bidVolume': self.safe_number(ticker, 'bid_quantity'),
            'ask': self.safe_number(ticker, 'ask'),
            'askVolume': self.safe_number(ticker, 'ask_quantity'),
            'vwap': None,
            'open': self.safe_number(ticker, 'open'),
            'close': self.safe_number(ticker, 'last_price'),
            'last': self.safe_number(ticker, 'last_price'),
            'previousClose': None,
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': self.safe_number(ticker, 'base_volume'),
            'quoteVolume': self.safe_number(ticker, 'quote_volume'),
            'info': ticker,  # Original response
        }

    def fetch_order_book(self, symbol, limit=None, params={}):
        self.fetch_markets()  # Ensure markets are loaded
        market = self.market(symbol)
        if market is None:
            print(f"Market for symbol {symbol} not found.")
            return None
        
        try:
            response = self.request(f'parsed/book/{market["id"]}/snapshot', 'GET', params)
            # Explicitly avoid printing raw API response here
            # print(f"Raw API response for order book: {response}")
            
            if response is None or 'result' not in response:
                raise Exception('Invalid response structure for order book')
            
            order_book_data = response['result']
            formatted_order_book = self.parse_order_book(order_book_data)
            self.print_order_book(formatted_order_book)
       
        except Exception as e:
            print(f"Error fetching order book: {e}")
            return None

    def parse_order_book(self, order_book):
        formatted_order_book = {
            'bids': [self.format_order(level) for level in order_book.get('bids', [])],
            'asks': [self.format_order(level) for level in order_book.get('asks', [])],
            'timestamp': order_book.get('timestamp', 0),
            'info': order_book,
        }
        return formatted_order_book

    def format_order(self, order):
        if order and len(order) == 2:
            price, quantity = order
            return f"Price: {price}, Quantity: {quantity}"
        return "Invalid order"

    def print_order_book(self, order_book):
        print("Order Book:")
        print(f"Timestamp: {order_book['timestamp']}")
        print("Bids:")
        for bid in order_book['bids']:
            print(f"  {bid}")
        print("Asks:")
        for ask in order_book['asks']:
            print(f"  {ask}")

