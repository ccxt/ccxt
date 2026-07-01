# Prediction markets example (async-only)
#
# Prediction-market exchanges live under ccxt.prediction and extend
# PredictionExchange, which adds events/outcomes helpers on top of Exchange.

import asyncio
import os
import sys

# use this repo's python/ (which has ccxt.prediction) rather than a pip-installed ccxt
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'python'))
import ccxt.prediction  # noqa: E402


async def main():
    exchange = ccxt.prediction.polymarket()
    print('id:', exchange.id)
    print('isPrediction:', exchange.isPrediction())
    try:
        markets = await exchange.fetch_markets()
        print('fetched markets:', len(markets))
    except Exception as e:
        print('fetchMarkets skipped (offline/geo):', type(e).__name__)
    finally:
        await exchange.close()


asyncio.run(main())
