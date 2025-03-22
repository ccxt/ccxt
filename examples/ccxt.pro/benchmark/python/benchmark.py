import asyncio
import ccxt.pro as ccxtpro
import time
from metrics import *

watch_method_defaults = {
    'watchOHLCV': ['BTC/USDT', '1m'],
    'watchOrderBook': ['BTC/USDT'],
    'watchTicker': ['BTC/USDT'],
    'watchTrades': ['BTC/USDT'],
}

async def benchmark_watch_method(exchange, method_name, args):
    print(exchange.id, method_name, args)
    labels = {'exchange': exchange.id, 'method': method_name, 'language': 'Python'}

    async def execute_method(session_start):
        start = time.time()
        try:
            data = await getattr(exchange, method_name)(*args)
            duration = time.time() - start
            ws_msgs_received.labels(**labels).inc()
            ws_processing.labels(**labels).observe(duration)
            return data
        except Exception as error:
            ws_disconnects.labels(**labels).inc()
            ws_session_duration.labels(**labels).observe(time.time() - session_start)
            print(f"[{labels['exchange']}] {labels['method']} error:", error)
            raise error

    while True:  # Outer loop for session restart
        session_start = time.time()
        try:
            while True:  # Inner loop for continuous monitoring
                await execute_method(session_start)
        except Exception as error:
            print('error, restarting session', error)
            await asyncio.sleep(1)  # Wait 1s before restart

async def start_benchmarks():
    exchanges = list(ccxtpro.exchanges)[:5]  # Start with 5 exchanges
    exchanges = ["binance", "kucoin", "poloniex", "kraken"]
    for exchange_name in exchanges:
        try:
            exchange = getattr(ccxtpro, exchange_name)()
            methods = [
                method for method in dir(exchange)
                if method.startswith('watch') and callable(getattr(exchange, method))
            ]
            
            for method in methods:
                if method in watch_method_defaults:
                    await benchmark_watch_method(
                        exchange,
                        method,
                        watch_method_defaults[method]
                    )
                else:
                    print(f"No defaults for {exchange.id} {method}")
        except Exception as e:
            print(e)
