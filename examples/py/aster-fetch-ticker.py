import ccxt
import sys
import os

# Add parent directory to path for local development
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

def main():
    exchange = ccxt.aster({
        'enableRateLimit': True,
    })
    try:
        print('Fetching markets from Aster DEX...')
        markets = exchange.fetch_markets()
        print(f'Total markets: {len(markets)}')

        print('\nFetching tickers...')
        tickers = exchange.fetch_tickers()
        print(f'Total tickers: {len(tickers)}')

        # Display first 5 tickers
        print('\nFirst 5 tickers:')
        for i, symbol in enumerate(list(tickers.keys())[:5]):
            ticker = tickers[symbol]
            print(f'  {symbol}: last={ticker["last"]}, volume={ticker["baseVolume"]}')

        # Fetch trades for first market
        if len(markets) > 0:
            symbol = markets[0]['symbol']
            print(f'\nFetching recent trades for {symbol}...')
            trades = exchange.fetch_trades(symbol, limit=5)
            print(f'Recent trades count: {len(trades)}')
            for trade in trades:
                print(f'  {trade["datetime"]} - {trade["side"]} {trade["amount"]} @ {trade["price"]}')

    except Exception as e:
        print(f'Error: {type(e).__name__}: {str(e)}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
