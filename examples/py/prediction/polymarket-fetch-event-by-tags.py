# -*- coding: utf-8 -*-

# fetch polymarket events by tag — human-readable labels ("Fed Rates") or
# slugs ("fed-rates") both work; multiple tags match ANY of them

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root + '/python')

import ccxt.prediction  # noqa: E402


async def main():
    exchange = ccxt.prediction.polymarket()
    try:
        events = await exchange.fetch_events({'tags': ['Fed Rates'], 'limit': 5})
        for event in events:
            print(event['title'], '| tags:', event['tags'])
            for market in event['markets']:
                for outcome in market['outcomes']:
                    print('   ', outcome['outcome'], '->', outcome['price'])
    finally:
        await exchange.close()


asyncio.run(main())
