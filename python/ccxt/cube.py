import requests
import time
import hmac
import hashlib
import base64
import struct
import json
from ccxt.base.errors import ExchangeError, AuthenticationError
from ccxt.base.exchange import Exchange
from abstract.cube import ImplicitAPI

class cube(Exchange):
    def __init__(self, config={}):
        super().__init__(config)
        self.api_key = config.get('apiKey')
        self.secret_key = config.get('secret') 

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
                'fetchBalance': True,
                'createOrder': True,
                'cancelOrder': True,
                'fetchOpenOrders': True,
                'fetchClosedOrders': True,
                'fetchWithdrawals': True,
                'fetchDeposits': True,
                'fetchMyTrades': True,
                'checkUser': True,
                'fetchTickersSnapshot': True,
                'fetchBookSnapshot': True,
                'fetchSubaccounts': True,
                'createSubaccount': False,  # Ensure this is set if it's not implemented yet
                'fetchSubaccountDetails': True,
                'fetchSubaccountPositions': True,
                'fetchSubaccountDeposits': True,
                'fetchSubaccountWithdrawals': True,
                'fetchSubaccountOrders': True,
                'fetchSubaccountFills': True,
                'estimateFees': True,
                'fetchUserAddress': True,
                'fetchUserAddressSettings': True,
                'withdraw': True
            },
            'urls': {
                'api': {
                    'public': 'https://api.cube.exchange/md/v0',
                    'private': 'https://api.cube.exchange/ir/v0',
                },
                'www': 'https://www.cube.exchange',
                'doc': 'https://docs.cube.exchange',
            },
            'api': {
                'public': {
                    'get': [
                        'tickers/snapshot',
                        'parsed/tickers',
                        'parsed/book/{market_id}/snapshot',
                        'parsed/book/{market_id}/recent-trades',
                        'book/{market_id}/recent-trades',                      
                    ],
                },
                'private': {
                    'get': [
                        '/markets',
                        'history/klines',
                        'users/me',
                        'users/subaccounts',
                        'users/subaccount/{subaccount_id}',
                        'users/subaccount/{subaccount_id}/positions',
                        'users/subaccount/{subaccount_id}/deposits',
                        'users/subaccount/{subaccount_id}/withdrawals',
                        'users/subaccount/{subaccount_id}/orders',
                        'users/subaccount/{subaccount_id}/fills',
                        'users/check',
                        'users/address',
                        'users/address/settings',
                    ],
                    'post': [
                        'orders',
                        'users/withdraw',
                        'users/subaccounts',
                        'users/fee-estimates',
                    ],
                    'delete': [
                        'orders/{order_id}',
                    ],
                },
            },
        })

    def request(self, endpoint, method='GET', params={}, headers=None):
        # Determine whether it's a public or private API request
        public_endpoints = ['markets', 'history/klines', 'parsed/book', 'parsed/tickers', 'tickers/snapshot']
        # Check if the request is for public data
        if any(public_endpoint in endpoint for public_endpoint in public_endpoints):
            # Use the private base URL if necessary for these specific public endpoints
            base_url = self.urls['api']['private'] if endpoint in ['markets', 'history/klines'] else self.urls['api']['public']
            # Ignore headers even if they are passed, since public data does not need them
            headers = None
        elif self.api_key and self.secret_key:
            # For private authenticated requests, use private base URL and include signed headers
            base_url = self.urls['api']['private']
            if headers is None:  # Only sign if headers are not manually provided
                headers = self.sign(endpoint, method, params)
        else:
            # Default to public base URL for all other requests
            base_url = self.urls['api']['public']

        # Construct the full URL
        url = f'{base_url}/{endpoint.lstrip("/")}'

        try:
            # Handle HTTP methods
            if method == 'GET':
                response = requests.get(url, params=params, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=params, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                raise ExchangeError(f"Unsupported HTTP method: {method}")

            # Check for a successful response
            if response.status_code != 200:
                raise ExchangeError(f'Unexpected response status: {response.status_code}, {response.text}')
            
            # Return the JSON response
            return response.json()

        except Exception as e:
            raise ExchangeError(f"Error making request: {e}")

    #Authentification
    def sign(self, path, method='GET', params={}):
        if self.api_key is None or self.secret_key is None:
            raise AuthenticationError('API Key and Secret are required for this request')    
        timestamp = int(time.time())
        payload_str = 'cube.xyz'.encode('utf-8')
        timestamp_bytes = struct.pack('<Q', timestamp)
        payload = payload_str + timestamp_bytes
        secret_bytes = bytes.fromhex(self.secret_key)
        signature = hmac.new(secret_bytes, payload, hashlib.sha256).digest()
        signature_base64 = base64.b64encode(signature).decode('utf-8')
        headers = {
            'x-api-key': self.api_key,
            'x-api-signature': signature_base64,
            'x-api-timestamp': str(timestamp),
        }
        return headers
    #Private Endpoints
    def check_user(self, params={}):
        try:
            response = self.request('users/check', 'GET', params)
            if 'result' not in response:
                raise ExchangeError('Invalid response structure for user check')
            return response['result']
        except Exception as e:
            print(f"Error checking user: {e}")
            raise
   
    def get_user_subaccounts(self):
        try:
            response = self.request('users/subaccounts', 'GET')
            
            if response is None or 'result' not in response:
                raise Exception("Invalid response structure for subaccounts")

            # Extract the relevant data (subaccount IDs)
            subaccount_ids = response['result'].get('ids', [])

            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "ids": subaccount_ids
                }
            }

            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))

        except Exception as e:
            print(f"Error fetching user subaccounts: {e}")
            raise

    def create_user_subaccount(self, name, account_type):
        # Prepare the request body with the required parameters
        body = {
            "name": name,
            "accountType": account_type
        }
        # Make the POST request using the request method
        try:
            response = self.request('users/subaccounts', 'POST', params=body)
            if response is None or 'result' not in response:
                raise Exception("Invalid response structure for subaccount creation")
            # Extract the subaccount ID from the response
            subaccount_id = response['result'].get('id')
            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "id": subaccount_id
                }
            }
            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))
        except Exception as e:
            print(f"Error creating subaccount: {e}")
            raise
   
    def fetch_user_subaccount(self, subaccount_id):
        # Define the endpoint with the subaccount_id in the path
        endpoint = f'users/subaccount/{subaccount_id}'
        # Make the GET request using the request method
        try:
            response = self.request(endpoint, 'GET')         
            if response is None or 'result' not in response:
                raise Exception(f"Invalid response structure for subaccount {subaccount_id}")        
            # Extract the relevant data from the response
            addresses = response['result'].get('addresses', {})
            has_order_history = response['result'].get('hasOrderHistory', False)
            subaccount_id = response['result'].get('id', subaccount_id)
            name = response['result'].get('name', '')
            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "addresses": addresses,
                    "hasOrderHistory": has_order_history,
                    "id": subaccount_id,
                    "name": name
                }
            }
            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))
        except Exception as e:
            print(f"Error fetching subaccount with ID {subaccount_id}: {e}")
            raise
   
    def fetch_user_subaccount_positions(self, subaccount_id):
        # Define the endpoint with the subaccount_id in the path
        endpoint = f'users/subaccount/{subaccount_id}/positions'
        # Make the GET request using the request method
        try:
            response = self.request(endpoint, 'GET')
            
            if response is None or 'result' not in response:
                raise Exception(f"Invalid response structure for subaccount positions {subaccount_id}")
            
            # Extract the relevant data from the response
            positions = response['result']
            
            # Structure the result in the desired format
            structured_response = {
                "result": positions
            }

            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))
            
        except Exception as e:
            print(f"Error fetching positions for subaccount with ID {subaccount_id}: {e}")
            raise

    def fetch_user_subaccount_deposits(self, subaccount_id):
        # Define the endpoint with the subaccount_id in the path
        endpoint = f'users/subaccount/{subaccount_id}/deposits'      
        # Make the GET request using the request method
        try:
            response = self.request(endpoint, 'GET')          
            if response is None or 'result' not in response:
                raise Exception(f"Invalid response structure for subaccount deposits {subaccount_id}")      
            # Extract the relevant data from the response
            deposits = response['result'].get('inner', [])
            account_name = response['result'].get('name', '')
            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "inner": deposits,
                    "name": account_name
                }
            }
            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))
        except Exception as e:
            print(f"Error fetching deposits for subaccount with ID {subaccount_id}: {e}")
            raise

    def fetch_user_subaccount_withdrawals(self, subaccount_id):
        # Define the endpoint with the subaccount_id in the path
        endpoint = f'users/subaccount/{subaccount_id}/withdrawals'       
        # Make the GET request using the request method
        try:
            response = self.request(endpoint, 'GET')           
            if response is None or 'result' not in response:
                raise Exception(f"Invalid response structure for subaccount withdrawals {subaccount_id}")            
            # Extract the relevant data from the response
            withdrawals = response['result'].get(str(subaccount_id), {}).get('inner', [])
            account_name = response['result'].get(str(subaccount_id), {}).get('name', '')
            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "inner": withdrawals,
                    "name": account_name
                }
            }
            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))        
        except Exception as e:
            print(f"Error fetching withdrawals for subaccount with ID {subaccount_id}: {e}")
            raise

    def fetch_user_subaccount_orders(self, subaccount_id):
        # Construct the endpoint with the provided subaccount_id
        endpoint = f'users/subaccount/{subaccount_id}/orders'      
        # Make the GET request using the request method
        try:
            response = self.request(endpoint, 'GET')           
            if response is None or 'result' not in response:
                raise Exception(f"Invalid response structure for subaccount {subaccount_id}")   
            # Extract the relevant data
            orders = response['result'].get('orders', [])
            name = response['result'].get('name', 'Unknown')
            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "name": name,
                    "orders": orders
                }
            }
            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))
        except Exception as e:
            print(f"Error fetching orders for subaccount {subaccount_id}: {e}")
            raise

    def fetch_user_subaccount_fills(self, subaccount_id):
        # Construct the endpoint with the provided subaccount_id
        endpoint = f'users/subaccount/{subaccount_id}/fills'
        
        # Make the GET request using the request method
        try:
            response = self.request(endpoint, 'GET')
            
            if response is None or 'result' not in response:
                raise Exception(f"Invalid response structure for subaccount {subaccount_id}")
            
            # Extract the relevant data
            fills = response['result'].get('fills', [])
            name = response['result'].get('name', 'Unknown')

            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "name": name,
                    "fills": fills
                }
            }

            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))
            
        except Exception as e:
            print(f"Error fetching fills for subaccount {subaccount_id}: {e}")
            raise

    def fetch_user_addresses(self):
        # Construct the endpoint for fetching user addresses
        endpoint = 'users/address'
        
        # Make the GET request using the request method
        try:
            response = self.request(endpoint, 'GET')
            
            if response is None or 'result' not in response:
                raise Exception("Invalid response structure for user addresses")
            
            # Extract the relevant data
            addresses = response['result'].get('addresses', [])
            settings = response['result'].get('settings', {})

            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "addresses": addresses,
                    "settings": settings
                }
            }

            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))
            
        except Exception as e:
            print(f"Error fetching user addresses: {e}")
            raise

    def fetch_user_address_settings(self):
        # Construct the endpoint for fetching user address settings
        endpoint = 'users/address/settings'        
        # Make the GET request using the request method
        try:
            response = self.request(endpoint, 'GET')            
            if response is None or 'result' not in response:
                raise Exception("Invalid response structure for address settings")           
            # Extract the relevant data
            settings = response['result'].get('whitelistStatus', None)
            whitelisted = response['result'].get('whitelisted', None)
            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "whitelistStatus": settings,
                    "whitelisted": whitelisted
                }
            }
            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))           
        except Exception as e:
            print(f"Error fetching user address settings: {e}")
            raise

    def estimate_fees(self, market_id, subaccount_id, side, post_only, quantity, price):
        # Construct the endpoint for fee estimates
        endpoint = 'users/fee-estimates'  
        # Construct the request body
        body = {
            "marketId": market_id,
            "subaccountId": subaccount_id,
            "side": side,
            "postOnly": post_only,
            "quantity": quantity,
            "price": price
        }    
        # Make the POST request using the request method
        try:
            response = self.request(endpoint, 'POST', params=body)            
            if response is None or 'result' not in response:
                raise Exception("Invalid response structure for fee estimates")            
            # Extract the relevant data
            estimated_fees = response['result'].get('estimatedFees', [])
            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "estimatedFees": estimated_fees
                }
            }
            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))           
        except Exception as e:
            print(f"Error estimating fees: {e}")
            raise

    def withdraw(self, subaccount_id, asset_id, amount, destination, timestamp, verification_key, signature):
            # Construct the endpoint for making a withdrawal
            endpoint = 'users/withdraw'            
            # Construct the request body
            body = {
                'subaccountId': subaccount_id,
                'assetId': asset_id,
                'amount': amount,
                'destination': destination,
                'timestamp': timestamp,
                'verificationKey': verification_key,
                'signature': signature
            }
            # Make the POST request using the request method
            try:
                headers = self.sign(endpoint, 'POST', body)
                response = self.request(endpoint, 'POST', headers=headers, body=json.dumps(body))                
                if response is None or 'result' not in response:
                    raise Exception("Invalid response structure for withdrawal request")
                # Extract the relevant data
                approved = response['result'].get('approved', None)
                status = response['result'].get('status', None)
                # Structure the result in the desired format
                structured_response = {
                    "result": {
                        "approved": approved,
                        "status": status
                    }
                }
                # Print the structured response as formatted JSON
                print(json.dumps(structured_response, indent=2))                
            except Exception as e:
                print(f"Error making withdrawal request: {e}")
                raise
   #Public endpoint 
    def fetch_markets(self, symbol=None, params={}):
        symbol_provided = False  # Flag to signal if a symbol was passed
        try:
            response = self.request('markets', 'GET', params)
            if response is None or 'result' not in response:
                raise Exception('Invalid response structure for markets')
            
            markets = {}
            if symbol:
                symbol_provided = True  # Set the flag since we are fetching for a specific symbol

            # Look for the symbol in assets
            assets = response['result'].get('assets', [])
            asset_found = next((asset for asset in assets if asset['symbol'] == symbol), None)
            
            if asset_found:
                for market in response['result']['markets']:
                    symbol_name = market.get('symbol')                    
                    # Continue if it's not a matching market for the symbol
                    if symbol and asset_found['symbol'] not in symbol_name:
                        continue
                    
                    fee_table_id = market.get('feeTableId')
                    fee_table = next((ft for ft in response['result'].get('feeTables', []) if ft['feeTableId'] == fee_table_id), {})
                    maker_fee = fee_table.get('makerFee', 0.0016)  # Default values if not found
                    taker_fee = fee_table.get('takerFee', 0.002)
                    
                    markets[symbol_name] = {
                        'id': market.get('marketId'),
                        'symbol': symbol_name,
                        'base': market.get('baseAssetId'),
                        'quote': market.get('quoteAssetId'),
                        'active': market.get('status') == 1,
                        'spot': True,
                        'maker': maker_fee,
                        'taker': taker_fee,
                        'tierBased': fee_table.get('tierBased', False),  # Assume a flag if tiered fees are present
                        'percentage': True,  # Assuming fees are in percentages
                        'feeTableId': fee_table_id,
                        'info': market
                    }
                    # Break after finding the specific symbol to avoid extra looping
                    if symbol:
                        break
                
                # Filter only relevant assets and feeTables
                assets = [asset_found]  # Only the found asset
                feeTables = [fee_table]
            else:
                # If no specific symbol was provided or it wasn't found in assets
                markets = {market['symbol']: market for market in response['result']['markets']}
                assets = response['result'].get('assets', [])
                feeTables = response['result'].get('feeTables', [])
            
            result_data = {
                'markets': markets,
                'assets': assets,
                'feeTables': feeTables
            }
            return result_data, symbol_provided  # Return both the data and the flag
        except Exception as e:
            print(f"Error fetching markets: {e}")
            raise

    def print_markets_structure(self, markets_data, symbol_provided=False):
        # Check if the market data is valid
        if not isinstance(markets_data, dict) or 'markets' not in markets_data:
            print("Invalid market data format")
            return
        
        if symbol_provided:
            print("Market details for the provided symbol:")
            if markets_data['markets']:
                relevant_market = list(markets_data['markets'].values())[0]  # Get the single market
                relevant_assets = markets_data['assets'][0]  # Get the single asset
                relevant_feeTables = markets_data['feeTables']  # Get fee tables
                structured_response = {
                    "result": {
                        "asset": relevant_assets,
                        "market": relevant_market,
                        "feeTables": relevant_feeTables
                    }
                }
                print(json.dumps(structured_response, indent=2))
            else:
                print("No market data available for the symbol.")
            return
        # If no symbol was provided, print all market data
        markets = markets_data['markets']
        assets = markets_data.get('assets', [])
        sources = markets_data.get('sources', [])
        feeTables = markets_data.get('feeTables', [])

        markets_list = []

        for symbol_key, data in markets.items():
            market_info = data['info']
            markets_list.append({
                "baseAssetId": market_info.get("baseAssetId"),
                "baseLotSize": market_info.get("baseLotSize"),
                "baseMarketIds": market_info.get("baseMarketIds", []),
                "feeTableId": market_info.get("feeTableId"),
                "impliedScheme": market_info.get("impliedScheme"),
                "isImplied": market_info.get("isImplied"),
                "isPrimary": market_info.get("isPrimary"),
                "marketId": market_info.get("marketId"),
                "minOrderQty": market_info.get("minOrderQty"),
                "priceBandAskPct": market_info.get("priceBandAskPct"),
                "priceBandBidPct": market_info.get("priceBandBidPct"),
                "priceDisplayDecimals": market_info.get("priceDisplayDecimals"),
                "priceTickSize": market_info.get("priceTickSize"),
                "protectionPriceLevels": market_info.get("protectionPriceLevels"),
                "quantityTickSize": market_info.get("quantityTickSize"),
                "quoteAssetId": market_info.get("quoteAssetId"),
                "quoteLotSize": market_info.get("quoteLotSize"),
                "status": market_info.get("status"),
                "symbol": market_info.get("symbol")
            })

        structured_response = {
            "result": {
                # "assets": assets,
                "sources": sources,
                "markets": markets_list,
                "feeTables": feeTables
            }
        }

        # Print the structured data for all markets
        print("All market details:")
        print(json.dumps(structured_response, indent=2))

    def get_market_id_by_symbol(self, symbol):
        try:
            # Fetch market data
            markets_data, _ = self.fetch_markets(symbol)
            # Print the fetched market data for debugging
            print("Fetched market data:", json.dumps(markets_data, indent=2))
            # Ensure 'markets' is a dictionary
            if isinstance(markets_data, dict) and 'markets' in markets_data:
                markets = markets_data['markets']
                # Iterate through the markets to find the matching symbol
                for market_key, market_details in markets.items():
                    if market_details.get('symbol') == symbol:
                        # Return the marketId if symbol matches
                        return market_details['id']               
                print(f"Market data for symbol {symbol} not found in markets.")
                return None
            else:
                print("Invalid market data structure.")
                return None
        except Exception as e:
            print(f"Error getting marketId for symbol {symbol}: {e}")
            return None
    
    def fetch_recent_trades(self):
        try:
            # Get the marketId for the given symbol
            market_id = 100004
            # Fetch recent trades for the marketId
            endpoint = f'book/{market_id}/recent-trades'
            response = self.request(endpoint, 'GET')
            if response is None or 'result' not in response:
                raise Exception('Invalid response structure for recent trades')
            # Process and return the recent trades data
            return response['result']
        except Exception as e:
            print(f"Error fetching recent trades: {e}")
            return None  

    def fetch_ticker(self, symbol: str, params={}):
        # Ensure markets are loaded
        result_data, symbol_provided = self.fetch_markets()  # Get markets data
        market = result_data['markets'].get(symbol)
        
        if market is None:
            raise ExchangeError(f'No market found for symbol {symbol}')
        
        ticker_id = market.get('id')
        if not ticker_id:
            raise ExchangeError(f'No ticker ID found for symbol {symbol}')
        
        try:
            response = self.request('parsed/tickers', 'GET', params)
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

    def fetch_tickers_snapshot(self):
        try:
            response = self.request('tickers/snapshot', 'GET')
            if 'result' not in response:
                raise ExchangeError('Invalid response structure for tickers snapshot')
            return response['result']
        except Exception as e:
            print(f"Error fetching tickers snapshot: {e}")
            raise

    def fetch_book_snapshot(self, market_symbol):
        # Construct the endpoint with the provided market symbol
        endpoint = f'parsed/book/{market_symbol}/snapshot'   
        # Make the GET request using the request method
        try:
            response = self.request(endpoint, 'GET')    
            if response is None or 'result' not in response:
                raise Exception(f"Invalid response structure for book snapshot of {market_symbol}")    
            # Extract the relevant data
            asks = response['result'].get('asks', [])
            bids = response['result'].get('bids', [])
            ticker_id = response['result'].get('ticker_id', market_symbol)
            timestamp = response['result'].get('timestamp')
            # Structure the result in the desired format
            structured_response = {
                "result": {
                    "asks": asks,
                    "bids": bids,
                    "ticker_id": ticker_id,
                    "timestamp": timestamp
                }
            }
            # Print the structured response as formatted JSON
            print(json.dumps(structured_response, indent=2))
        except Exception as e:
            print(f"Error fetching book snapshot for {market_symbol}: {e}")
            raise

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

    def print_order_book(self, order_book):
        print("Order Book:")
        print(f"Timestamp: {order_book['timestamp']}")
        print("Bids:")
        for bid in order_book['bids']:
            print(f"  {bid}")
        print("Asks:")
        for ask in order_book['asks']:
            print(f"  {ask}")

    def fetch_klines(self, marketId, interval='1h', startTime=None, endTime=None, limit=None):
        """
        Fetches historical klines data for a given symbol.
        
        :param symbol: Optional; The trading pair symbol, e.g., 'BTC/USDT'.
        :param interval: Optional; The interval for the klines, e.g., '1m', '1h'.
        :param startTime: Optional; Start time for the data in UNIX timestamp (milliseconds).
        :param endTime: Optional; End time for the data in UNIX timestamp (milliseconds).
        :param limit: Optional; The maximum number of klines to return.
        :return: List of klines.
        """
        try:
            params = {
                'marketId': marketId,
                'interval': interval,
                'startTime': startTime,
                'endTime': endTime,
                'limit': limit
            }
            # if symbol:
            #     market_id = self.get_market_id(symbol)  # Method to get market_id from symbol
            #     params['marketId'] = market_id      
            response = self.request('history/klines', 'GET', params)
            if 'result' not in response:
                raise ExchangeError('Invalid response structure for klines')    
            return response['result']
        except Exception as e:
            print(f"Error fetching klines: {e}")
            raise

    def format_order(self, order):
        if order and len(order) == 2:
            price, quantity = order
            return f"Price: {price}, Quantity: {quantity}"
        return "Invalid order"

