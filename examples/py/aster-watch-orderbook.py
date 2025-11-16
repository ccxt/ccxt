import ccxt.pro as ccxtpro
import asyncio
import sys
import os

# Add parent directory to path for local development
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

async def main():
    exchange = ccxtpro.aster({
        'enableRateLimit': True,
    })
    symbol = sys.argv[1] if len(sys.argv) > 1 else 'BTC/USDT:USDT'
    print(f'Watching order book for {symbol} on Aster DEX...')
    print('Press Ctrl+C to exit\n')
    try:
        while True:
            orderbook = await exchange.watch_order_book(symbol)
            print(f'{exchange.iso8601(exchange.milliseconds())} {symbol} orderbook:')
            if len(orderbook['bids']) > 0:
                print(f'  Best bid: {orderbook["bids"][0][0]} @ {orderbook["bids"][0][1]}')
            if len(orderbook['asks']) > 0:
                print(f'  Best ask: {orderbook["asks"][0][0]} @ {orderbook["asks"][0][1]}')
            if len(orderbook['bids']) > 0 and len(orderbook['asks']) > 0:
                spread = orderbook['asks'][0][0] - orderbook['bids'][0][0]
                print(f'  Spread: {spread}')
            print()
    except KeyboardInterrupt:
        print('\nExiting...')
    except Exception as e:
        print(f'Error: {type(e).__name__}: {str(e)}')
        import traceback
        traceback.print_exc()
    finally:
        await exchange.close()

if __name__ == '__main__':
    asyncio.run(main())
