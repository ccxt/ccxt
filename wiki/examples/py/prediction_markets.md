```python
# Prediction markets example (async-only)
#
# Prediction-market exchanges live under ccxt.prediction and extend
# PredictionExchange, which adds events/outcomes helpers on top of Exchange.

import asyncio
import ccxt.prediction


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

```
