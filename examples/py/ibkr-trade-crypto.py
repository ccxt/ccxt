# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402

# Compare crypto prices across the InteractiveBrokers crypto providers (PAXOS, ZEROHASH, ...) through the Client Portal Gateway.
# (you can alternatively use oauth 1.0 if your account allows it)
#
# IBKR lists the same coin once per provider, so each one is a separate market with the provider in the symbol:
# BTC.PAXOS/USD, BTC.ZEROHASH/USD, ...
#
# Prerequisites:
# 1. download and run the client portal gateway locally
#    https://www.interactivebrokers.com/en/trading/ib-api.php#client-portal
# 2. log in at https://localhost:5000 (or any other port) in a browser (the session is reused by ccxt)


def print_table(rows):
    if len(rows) == 0:
        return
    columns = list(rows[0].keys())
    widths = [max(len(column), max(len(str(row[column])) for row in rows)) for column in columns]
    print('  '.join(column.ljust(width) for column, width in zip(columns, widths)))
    for row in rows:
        print('  '.join(str(row[column]).ljust(width) for column, width in zip(columns, widths)))


async def example():
    exchange = ccxt.interactivebrokers({
        'verify': False,  # the gateway serves a self-signed certificate
        'options': {
            'useGateway': True,
            'gatewayUrl': 'https://localhost:5001',
            'gatewayKeepAlive': False,  # a one-off script, no need for the background keep-alive loop
            'fetchMarkets': {
                'types': ['crypto'],  # only load crypto (skip stocks/forex/futures) for a faster load_markets
                'cryptoSpotSymbols': ['BTC', 'ETH', 'SOL', 'LTC'],  # the coins to look up, on every provider
            },
        },
    })
    try:
        markets = await exchange.load_markets()
        # group the markets by coin: {'BTC/USD': {'PAXOS': 'BTC.PAXOS/USD', 'ZEROHASH': 'BTC.ZEROHASH/USD'}}
        symbols_by_pair = {}
        symbols = []
        for market in markets.values():
            if not market['spot'] or market['info']['assetClass'] != 'CRYPTO':
                continue
            provider = market['info']['listingExchange']
            pair = market['base'] + '/' + market['quote']
            if pair not in symbols_by_pair:
                symbols_by_pair[pair] = {}
            symbols_by_pair[pair][provider] = market['symbol']
            symbols.append(market['symbol'])
        print('Loaded', len(symbols), 'crypto markets:', ', '.join(symbols))
        tickers = await exchange.fetch_tickers(symbols)
        for pair, providers in symbols_by_pair.items():
            rows = []
            for provider, symbol in providers.items():
                ticker = tickers.get(symbol)
                if ticker is None:
                    continue
                bid = ticker['bid']
                ask = ticker['ask']
                has_bid_ask = (bid is not None) and (ask is not None)
                # without a market data subscription for the provider, IBKR only returns the mark price (no bid/ask/last)
                mark = ticker['markPrice'] if ticker['markPrice'] is not None else ticker['last']
                price = (bid + ask) / 2 if has_bid_ask else mark
                rows.append({
                    'provider': provider,
                    'symbol': symbol,
                    'bid': bid,
                    'ask': ask,
                    'last': ticker['last'],
                    'mark': ticker['markPrice'],
                    'spread %': round((ask - bid) / ask * 100, 4) if has_bid_ask else None,
                    'price': price,  # mid price when quoted, the mark price otherwise
                })
            print('\n' + pair)
            print_table(rows)
            priced = [row for row in rows if row['price'] is not None]
            if len(priced) < 2:
                print('not enough providers pricing', pair, 'to compare')
                continue
            lowest = min(priced, key=lambda row: row['price'])
            highest = max(priced, key=lambda row: row['price'])
            difference = (highest['price'] - lowest['price']) / lowest['price'] * 100
            print('lowest price: ', lowest['provider'], '@', lowest['price'])
            print('highest price:', highest['provider'], '@', highest['price'])
            print('difference between providers:', '{:.4f}%'.format(difference))
            # with bid/ask available, the best place to buy has the lowest ask and the best place to sell has the highest bid
            quoted = [row for row in rows if (row['bid'] is not None) and (row['ask'] is not None)]
            if len(quoted) >= 2:
                best_ask = min(quoted, key=lambda row: row['ask'])
                best_bid = max(quoted, key=lambda row: row['bid'])
                print('best ask (buy): ', best_ask['provider'], '@', best_ask['ask'])
                print('best bid (sell):', best_bid['provider'], '@', best_bid['bid'])
    finally:
        await exchange.close()


asyncio.run(example())
