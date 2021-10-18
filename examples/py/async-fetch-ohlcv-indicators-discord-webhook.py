from asyncio import get_event_loop, gather, ensure_future
import os
import sys
import pandas_ta as ta
import pandas as pd

# -----------------------------------------------------------------------------

this_folder = os.path.dirname(os.path.abspath(__file__))
root_folder = os.path.dirname(os.path.dirname(this_folder))
sys.path.append(root_folder + '/python')
sys.path.append(this_folder)

# -----------------------------------------------------------------------------

import ccxt.async_support as ccxt  # noqa: E402

# -----------------------------------------------------------------------------

print('CCXT Version:', ccxt.__version__)

# -----------------------------------------------------------------------------


async def send_discord_webhook_messsage(exchange, symbol, message):
    payload = {
        "username": "Kj Bot Top 10 Coins 15 Min TF",
        "content" : message
    }
    url = 'https://discord.com/api/webhooks/894679855755558952/8bb6noZjAOEv0-lnws1wLAxCU0yVmogNxbuiz_N8w7Wx9mKf05U4WmXXKr4ds5sh1fVw'
    method = 'POST'
    headers = {'Content-Type': 'application/json'}
    body = exchange.json(payload)
    try:
        await exchange.fetch(url, method, headers, body)
    except Exception as e:
        print(type(e).__name__, str(e))


async def run_ohlcv_loop(exchange, symbol, timeframe, limit):
    since = None
    while True:
        try:
            ohlcv = await exchange.fetch_ohlcv(symbol, timeframe, since, limit)
            if len(ohlcv):
                df = pd.DataFrame(ohlcv, columns=['time', 'open', 'high', 'low', 'close', 'volume'])
                rsi = df.ta.rsi()
                df = pd.concat([df,rsi], axis=1)
                last_row = df.iloc[-1]
                previous_row = df.iloc[-2]
                if last_row['RSI_14'] and previous_row['RSI_14']:
                    now = exchange.milliseconds()
                    iso8601 = exchange.iso8601(now)
                    print(iso8601, timeframe, symbol, '\tRSI_14 =', last_row['RSI_14'])
                    rsienterob = previous_row['RSI_14'] < 70 and last_row['RSI_14'] > 70
                    if rsienterob:
                        message =  iso8601 + ' ' + timeframe + ' ' + symbol + ' is entering overbought zone'
                        print(message)
                        ensure_future(send_discord_webhook_messsage(exchange, symbol, message))
        except Exception as e:
            print(type(e).__name__, str(e))


async def main():
    exchange = ccxt.binance()
    timeframe = '1m'
    limit = 50
    symbols = [ 'BTC/USDT', 'ETH/USDT' ]
    loops = [run_ohlcv_loop(exchange, symbol, timeframe, limit) for symbol in symbols]
    await gather(*loops)
    await exchange.close()


loop = get_event_loop()
loop.run_until_complete(main())