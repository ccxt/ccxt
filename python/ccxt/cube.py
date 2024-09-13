from ccxt.base.exchange import Exchange

class cube(Exchange):
    
    def describe(self):
        return self.deep_extend(super(cube, self).describe(), {
            'id': 'cube',
            'name': 'Cube Exchange',
            'countries': ['US'],  # Adjust to actual country
            'rateLimit': 1000,  # Adjust based on Cube API limits
            'has': {
                'fetchMarkets': True,
                'fetchTicker': True,
                'fetchOrderBook': True,
                'fetchTrades': True,
            },
            'urls': {
                'api': {
                    'public': 'https://api.cube.exchange',  # Adjust based on Cube API base URL
                },
                'www': 'https://www.cube.exchange',
                'doc': 'https://docs.cube.exchange',  # Add API documentation URL if available
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

    # Fetch all available markets
    def fetch_markets(self, params={}):
        response = self.publicGetTickersSnapshot(params)
        return self.parse_markets(response['result']['summaries'])
    
    # Helper method to parse market data
    def parse_markets(self, summaries):
        result = []
        for market in summaries:
            id = str(market['marketId'])
            base = market['baseVolumeLo']  # You may need to map this to actual symbols, e.g., BTC or USDT
            quote = market['quoteVolumeLo']
            # Adjust symbol format based on Cube's actual market symbol format
            symbol = f"{base}/{quote}"
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result


    # Fetch ticker data
    def fetch_ticker(self, symbol, params={}):
        market = self.market(symbol)
        response = self.publicGetParsedTickers(params)
        return self.parse_ticker(response['result'][0])  # Assuming result contains the first ticker object
    
    def parse_ticker(self, ticker):
        return {
            'symbol': ticker['ticker_id'],
            'last': ticker['last_price'],
            'high': ticker['high'],
            'low': ticker['low'],
            'bid': ticker['bid'],
            'ask': ticker['ask'],
            'baseVolume': ticker['base_volume'],
            'quoteVolume': ticker['quote_volume'],
            'timestamp': ticker['timestamp'],
            'info': ticker,
        }

    # Fetch order book
    def fetch_order_book(self, symbol, limit=None, params={}):
        market = self.market(symbol)
        response = self.publicGetParsedBookMarketSymbolSnapshot({
            'market_symbol': market['id']
        })
        return self.parse_order_book(response['result'])

    def parse_order_book(self, orderbook):
        return {
            'bids': orderbook['bids'],
            'asks': orderbook['asks'],
            'timestamp': orderbook['timestamp'],
            'info': orderbook,
        }

    # Fetch recent trades
    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        market = self.market(symbol)
        response = self.publicGetParsedBookMarketSymbolRecentTrades({
            'market_symbol': market['id']
        })
        return self.parse_trades(response['result']['trades'])

    def parse_trades(self, trades):
        result = []
        for trade in trades:
            result.append({
                'id': trade['id'],
                'timestamp': trade['ts'],
                'price': trade['p'],
                'amount': trade['q'],
                'side': trade['side'].lower(),
                'info': trade,
            })
        return result
