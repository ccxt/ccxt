import asyncio
import os, sys
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')


import ccxt.pro # noqa: E402


def describe(update):
    # summarize whatever a watch*ForSymbols call returned
    if isinstance(update, dict) and 'bids' in update:  # order book
        return update['symbol'] + ' bid ' + str(update['bids'][0]) + ' ask ' + str(update['asks'][0])
    if isinstance(update, dict):  # watch_ohlcv_for_symbols -> {symbol: {timeframe: candles}}
        symbol = list(update.keys())[0]
        timeframe = list(update[symbol].keys())[0]
        candle = update[symbol][timeframe][-1]
        return symbol + ' ' + timeframe + ' candle ' + str(candle)
    trade = update[0]  # trades -> list of trade structures
    return trade['symbol'] + ' ' + trade['side'] + ' ' + str(trade['amount']) + ' @ ' + str(trade['price'])


async def watch_for(exchange, watch, args, seconds):
    deadline = exchange.milliseconds() + seconds * 1000
    while exchange.milliseconds() < deadline:
        update = await watch(*args)
        print(exchange.iso8601(exchange.milliseconds()), describe(update))


async def test_cycle(exchange, name, watch, un_watch, args):
    print('\n========== ' + name + ' ==========')
    # 1. subscribe
    print('--- subscribing ---')
    await watch_for(exchange, watch, args, 8)
    # 2. unsubscribe
    print('--- unsubscribing ---')
    await un_watch(*args)
    print('unsubscribed, sleeping 5s (no updates expected)')
    await asyncio.sleep(5)
    # 3. subscribe again
    print('--- subscribing again ---')
    await watch_for(exchange, watch, args, 8)
    print(name + ' done')


async def main():
    exchange = ccxt.pro.bitvavo()
    try:
        await exchange.load_markets()
        symbols = ['BTC/EUR', 'ETH/EUR']
        symbols_and_timeframes = [['BTC/EUR', '1m'], ['ETH/EUR', '1m']]
        await test_cycle(exchange, 'watchOrderBookForSymbols',
                         exchange.watch_order_book_for_symbols, exchange.un_watch_order_book_for_symbols, [symbols])
        await test_cycle(exchange, 'watchTradesForSymbols',
                         exchange.watch_trades_for_symbols, exchange.un_watch_trades_for_symbols, [symbols])
        await test_cycle(exchange, 'watchOHLCVForSymbols',
                         exchange.watch_ohlcv_for_symbols, exchange.un_watch_ohlcv_for_symbols, [symbols_and_timeframes])
        print('\nall done')
    finally:
        await exchange.close()


asyncio.run(main())
