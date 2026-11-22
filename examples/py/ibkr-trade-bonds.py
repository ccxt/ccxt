# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402

# Compare US treasury prices and yields on InteractiveBrokers through the Client Portal Gateway.
# (you can alternatively use oauth 1.0 if your account allows it)
#
# Every bond of an issuer has the same IBKR ticker (US-T), so each one is a separate market with the coupon and the maturity in the symbol:
# US-T-4.125-270131.SMART/USD (a 4.125% note maturing on 2027-01-31), US-T-270114.SMART/USD (a bill, no coupon), ...
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


def parse_yield(value):
    # "3.652%" -> 3.652
    try:
        return float(value.replace('%', ''))
    except Exception:
        return None


async def example():
    exchange = ccxt.interactivebrokers({
        'verify': False,  # the gateway serves a self-signed certificate
        'options': {
            'useGateway': True,
            'gatewayUrl': 'https://localhost:5001',
            'gatewayKeepAlive': False,  # a one-off script, no need for the background keep-alive loop
            'fetchMarkets': {
                'types': ['bond'],  # only load bonds (skip stocks/crypto/forex/futures), bonds are not loaded by default
                'bondSymbols': ['US-T'],  # the issuers to look up, US-T = US treasuries
                # narrow the (1000+) treasuries down, the keys are the column ids of iserver/secdef/bond-filters:
                # 29 = type (Bills, Notes, Bonds, ...), 27 = maturity month (YYYYMM), 28 = issue date (YYYYMMDD), 25 = coupon
                'bondFilters': {
                    '29': 'Notes',
                },
            },
        },
    })
    try:
        markets = await exchange.load_markets()
        # keep the notes maturing within the next two years, sorted by maturity
        now = exchange.milliseconds()
        two_years = 2 * 365 * 24 * 60 * 60 * 1000
        bonds = []
        for market in markets.values():
            if market['info']['assetClass'] != 'BOND':
                continue
            maturity_date = market['info']['maturityDate']  # 20270131
            maturity = exchange.parse8601(maturity_date[0:4] + '-' + maturity_date[4:6] + '-' + maturity_date[6:8] + 'T00:00:00Z')
            if (maturity > now) and (maturity < now + two_years):
                bonds.append({'symbol': market['symbol'], 'maturity': maturity, 'info': market['info']})
        bonds.sort(key=lambda bond: bond['maturity'])
        print('Loaded', len(markets), 'bond markets,', len(bonds), 'maturing within two years')
        # a market data snapshot is limited in the number of conids, keep the 30 nearest maturities
        bonds = bonds[0:30]
        symbols = [bond['symbol'] for bond in bonds]
        # on top of the default fields: 7698 last yield, 7699 bid yield, 7720 ask yield
        fields = exchange.options['fetchTickers']['fields'] + ['7698', '7699', '7720']
        tickers = await exchange.fetch_tickers(symbols, {'fields': fields})
        rows = []
        for bond in bonds:
            ticker = tickers.get(bond['symbol'])
            if ticker is None:
                continue
            bid = ticker['bid']
            ask = ticker['ask']
            has_bid_ask = (bid is not None) and (ask is not None)
            # bond prices are quoted as a percentage of the principal (99.5 = 995 USD for a 1000 USD principal)
            # without a market data subscription, IBKR only returns the mark price (no bid/ask/last)
            mark = ticker['markPrice'] if ticker['markPrice'] is not None else ticker['last']
            price = (bid + ask) / 2 if has_bid_ask else mark
            rows.append({
                'symbol': bond['symbol'],
                'name': bond['info']['fullName'],
                'coupon %': float(bond['info']['coupon']),
                'maturity': exchange.iso8601(bond['maturity'])[0:10],
                'bid': bid,
                'ask': ask,
                'price': price,  # mid price when quoted, the mark price otherwise
                'ask yield %': parse_yield(ticker['info'].get('7720')),  # the yield to maturity when buying at the ask, e.g. "3.652%"
            })
        print_table(rows)
        yielding = [row for row in rows if row['ask yield %'] is not None]
        if len(yielding) < 2:
            print('not enough notes with a yield to compare (market data subscription required?)')
            return
        lowest = min(yielding, key=lambda row: row['ask yield %'])
        highest = max(yielding, key=lambda row: row['ask yield %'])
        print('lowest yield: ', lowest['symbol'], '@', str(lowest['ask yield %']) + '%', '- matures', lowest['maturity'])
        print('highest yield:', highest['symbol'], '@', str(highest['ask yield %']) + '%', '- matures', highest['maturity'])
        # the cheapest note relative to its principal has the lowest ask
        quoted = [row for row in rows if row['ask'] is not None]
        if len(quoted) >= 2:
            cheapest = min(quoted, key=lambda row: row['ask'])
            print('lowest ask:   ', cheapest['symbol'], '@', cheapest['ask'])
    finally:
        await exchange.close()


asyncio.run(example())
