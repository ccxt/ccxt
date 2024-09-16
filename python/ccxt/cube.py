import requests
import hmac
import hashlib
import time
import struct
import base64
import json
from abstract.cube import cube_api_definitions
from ccxt.base.errors import ExchangeError, AuthenticationError
from ccxt.base.exchange import Exchange

class cube(Exchange):
    def __init__(self, config={}):
        super().__init__(config)
        self.apiKey = config.get('apiKey', None)
        self.secret = config.get('secret', None)
        self.urls = {
            'api': {
                'public': 'https://api.cube.exchange/ir/v0', 
                'private': 'https://api.cube.exchange/ir/v0', 
                'market_data': 'https://api.cube.exchange/md/v0' 
            }
        }
        self.cache = {
            'markets': None,
            'cache_time': None
        }
        self.cache_duration = 300      
        if not self.apiKey or not self.secret:
            raise AuthenticationError("API Key and Secret are required for private API requests.")

    def sign(self, path, method='GET', params={}):
            if self.apiKey is None or self.secret is None:
                raise AuthenticationError('API Key and Secret are required for this request')
            timestamp = int(time.time())
            payload_str = 'cube.xyz'.encode('utf-8')
            timestamp_bytes = struct.pack('<Q', timestamp)  # 8-byte little-endian array
            payload = payload_str + timestamp_bytes
            secret_bytes = bytes.fromhex(self.secret)
            signature = hmac.new(secret_bytes, payload, hashlib.sha256).digest()
            signature_base64 = base64.b64encode(signature).decode('utf-8')
            headers = {
                'x-api-key': self.apiKey,
                'x-api-signature': signature_base64,
                'x-api-timestamp': str(timestamp),
            }
            return headers
    
    def request(self, endpoint, method='GET', params={}, headers=None):
        if endpoint.startswith('http'):
            url = endpoint
            base_url = None 
        else:
            if '/tickers' in endpoint or '/parsed' in endpoint or '/book' in endpoint:
                base_url = self.urls['api'].get('market_data')
            elif 'users' in endpoint or 'subaccounts' in endpoint:
                base_url = self.urls['api'].get('private')
            else:
                base_url = self.urls['api'].get('public')
            if base_url is None:
                raise ExchangeError("Base URL is None. Check that API URLs are properly configured.")
            url = f'{base_url}/{endpoint.lstrip("/")}'  
        if base_url == self.urls['api']['private'] and headers is None:
            headers = self.sign(endpoint, method, params)

        try:
            if method == 'GET':
                response = requests.get(url, params=params, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=params, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            if response.status_code != 200:
                raise ExchangeError(f'Unexpected response status: {response.status_code}, {response.text}')
            return response.json()
        except Exception as e:
            raise ExchangeError(f"Error making request: {e}")
# Private 
    def check_user(self, params={}):
        try:
            headers = self.sign('users/check', 'GET', params)
            response = self.request('users/check', 'GET', params, headers=headers)
            if 'result' not in response:
                raise ExchangeError('Invalid response structure for user check')
            return response['result']
        except Exception as e:
            print(f"Error checking user: {e}")
            raise    

    def fetch_balance(self, params={}):
        try:
            headers = self.sign('users/subaccounts', 'GET', params)
            response = self.request('users/subaccounts', 'GET', params, headers=headers)
            if 'result' not in response:
                raise ExchangeError('Invalid response structure for balance')
            balances = response['result']
            return {
                'info': response,
                'total': balances,
            }
        except Exception as e:
            print(f"Error fetching balance: {e}")
            raise

    def create_order(self, symbol, order_type, side, amount, price=None, params={}):
        try:
            market = self.fetch_markets(symbol)
            if 'id' not in market:
                raise ExchangeError(f"Market details not found for symbol: {symbol}")
            order = {
                'market': market['id'],
                'type': order_type,
                'side': side,
                'amount': amount,
            }
            if price is not None:
                order['price'] = price
            headers = self.sign('orders/create', 'POST', order)
            response = self.request('orders/create', 'POST', order, headers=headers)
            if 'result' not in response:
                raise ExchangeError('Invalid response structure for order creation')
            return response['result']
        except Exception as e:
            print(f"Error creating order: {e}")
            raise

    def cancel_order(self, order_id, params={}):
        try:
            response = self.request(f'orders/cancel/{order_id}', 'POST', params, api='private')
            return response['result']
        except Exception as e:
            print(f"Error canceling order: {e}")
            raise

    def fetch_subaccounts(self, params={}):
        try:
            headers = self.sign('users/subaccounts', 'GET', params)
            response = self.request('users/subaccounts', 'GET', params, headers=headers)
            print(f"Full response: {response}")
            if 'result' not in response:
                raise ExchangeError('Invalid response structure for subaccounts')
            print(f"Result: {response['result']}")
            ids = response['result'].get('ids', [])
            print(f"Subaccount IDs: {ids}")
            return {
                'info': response,
                'subaccounts': ids,
            }
        except Exception as e:
            print(f"Error fetching subaccounts: {e}")
            raise

# Public 
    def fetch_market_definitions(self):
        try:
            response = self.request('markets', 'GET')
            return response['result']
        except Exception as e:
            print(f"Error fetching market definitions: {e}")
            raise

    def fetch_markets(self, params={}):
        current_time = time.time()
        if self.cache['markets'] is not None and self.cache['cache_time'] is not None:
            if current_time - self.cache['cache_time'] < self.cache_duration:
                return self.cache['markets']
        market_definitions = self.fetch_market_definitions()
        all_markets = []
        for market_info in market_definitions['markets']:
            all_markets.append({
                'id': market_info['marketId'],
                'symbol': market_info['symbol'],
                'base_asset': market_info['baseAssetId'],
                'quote_asset': market_info['quoteAssetId'],
                'base_lot_size': market_info['baseLotSize'],
                'quote_lot_size': market_info['quoteLotSize'],
                'min_order_qty': market_info.get('minOrderQty', None),
                'price_display_decimals': market_info.get('priceDisplayDecimals', None),
                'price_tick_size': market_info.get('priceTickSize', None),
                'quantity_tick_size': market_info.get('quantityTickSize', None),
                'price_band_ask_pct': market_info.get('priceBandAskPct', None),
                'price_band_bid_pct': market_info.get('priceBandBidPct', None),
                'is_primary': market_info.get('isPrimary', None),
                'is_implied': market_info.get('isImplied', None),
                'fee_table_id': market_info.get('feeTableId', None),
                'protection_price_levels': market_info.get('protectionPriceLevels', None),
                'status': market_info.get('status', None),
                'base_market_ids': market_info.get('baseMarketIds', []),
                'fee_tiers': self.fetch_fee_tiers(market_info.get('feeTableId'))
            })
        self.cache['markets'] = all_markets
        self.cache['cache_time'] = current_time
        return all_markets

    def fetch_fee_tiers(self, fee_table_id):
        market_definitions = self.fetch_market_definitions()
        for fee_table in market_definitions.get('feeTables', []):
            if fee_table['feeTableId'] == fee_table_id:
                return fee_table.get('feeTiers', [])
        return []

    def fetch_ticker(self, symbol: str = None, params={}):
        self.fetch_markets()
        if symbol:
            market = self.market(symbol)
            ticker_id = market.get('id', None)
            if not ticker_id:
                raise ExchangeError(f'No ticker ID found for symbol {symbol}')
            params.update({'ticker_id': ticker_id})
        try:
            base_url = self.urls['api']['market_data']
            route = '/tickers/snapshot'
            full_url = f'{base_url}{route}'
            response = self.request(full_url, 'GET', params)
            if response is None or 'result' not in response:
                raise Exception('Invalid response structure for tickers')
            if not symbol:
                print("Fetching all tickers...")
                print(json.dumps(response['result'], indent=4))
                return response['result']
            ticker_data = None
            for ticker in response['result']:
                if ticker['ticker_id'] == ticker_id:
                    ticker_data = ticker
                    break
            if ticker_data is None:
                raise ExchangeError(f'Ticker for {symbol} not found')
            print(f"Fetching ticker for {symbol}...")
            print(json.dumps(ticker_data, indent=4))
            return ticker_data
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
            if response is None or 'result' not in response:
                raise Exception('Invalid response structure for order book')
            
            order_book_data = response['result']
            formatted_order_book = self.parse_order_book(order_book_data)
            self.print_order_book(formatted_order_book)
       
        except Exception as e:
            print(f"Error fetching order book: {e}")
            return None

    def parse_order_book(self, order_book):
        return {
            'bids': [self.format_order(level) for level in order_book.get('bids', [])],
            'asks': [self.format_order(level) for level in order_book.get('asks', [])],
            'timestamp': order_book.get('timestamp', 0),
            'info': order_book,
        }

    def format_order(self, order):
        if order and len(order) == 2:
            price = order[0] if order[0] is not None else 'N/A'
            quantity = order[1] if order[1] is not None else 'N/A'
            return f"Price: {price}, Quantity: {quantity}"
        return "Invalid order"

    def print_order_book(self, order_book):
        print("Order Book:")
        print("Bids:")
        for bid in order_book['bids']:
            print(bid)
        print("Asks:")
        for ask in order_book['asks']:
            print(ask)
        print(f"Timestamp: {order_book.get('timestamp', 'N/A')}")


