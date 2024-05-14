# -*- coding: utf-8 -*-

import asyncio
import os
from random import randint
import sys
from pprint import pprint
import time

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402

print('CCXT Version:', ccxt.__version__)

####################################################################################
# Simple arbitrage bot that will look for arbitrage opportunities on spot markets ##
# and execute them using market orders.                                           ##
#                                                                                 ##                 
# Disclaimer: this bot is for educational purposes only. Use at your own risk.    ##
####################################################################################

# bot options
wait_time = 5 # seconds to wait between each check
paper_trading = True # set to false to actually execute trades

# exchanges you want to use to look for arbitrage opportunities
exchanges = [
    ccxt.okx(),
    ccxt.bybit({"options":{"defaultType":"spot"}}),
    ccxt.binance(),
    ccxt.kucoin(),
    ccxt.bitmart(),
    ccxt.gate()
]

# symbols you want to trade
symbols = [
    "BTC/USDT",
    "LTC/USDT",
    "DOGE/USDT",
    "SHIB/USDT",
    "SOL/USDT",
    "ETH/USDT",
    "ADA/USDT",
    "DOT/USDT",
    "UNI/USDT",
    "LINK/USDT",
]

# order sizes for each symbol, adjust it to your liking
order_sizes = {
    "BTC/USDT": 0.001,
    "LTC/USDT": 0.01,
    "DOGE/USDT": 100,
    "SHIB/USDT": 1000000,
    "SOL/USDT": 0.1,
    "ETH/USDT": 0.01,
    "ADA/USDT": 1,
    "DOT/USDT": 0.1,
    "UNI/USDT": 0.1,
    "LINK/USDT": 0.1,
}

async def get_last_prices():
    tasks = [ exchange.fetch_tickers(symbols) for exchange in exchanges ]
    results = await asyncio.gather(*tasks)
    return results

async def bot():
    prices = await get_last_prices()
    for symbol in symbols:
        ms = int(time.time() * 1000)

        symbol_prices = [ exchange_prices[symbol]['last'] for exchange_prices in prices ]

        min_price = min(symbol_prices)
        max_price = max(symbol_prices)

        order_size = order_sizes[symbol]

        min_exchange = exchanges[symbol_prices.index(min_price)]
        max_exchange = exchanges[symbol_prices.index(max_price)]

        # calculate min exchange taker fee
        # warning: you need to manually check if there are special campaign fees 
        min_exchange_fee = min_exchange.fees['trading']['taker']
        min_fee = order_size * min_price * min_exchange_fee

        # calculate max exchange taker fee
        # warning: you need to manually check if there are special campaign fees 
        max_exchange_fee = max_exchange.fees['trading']['taker']
        max_fee = order_size * max_price * max_exchange_fee

        price_profit = max_price - min_price
        profit = (price_profit * order_size) - (min_fee) - (max_fee)

        if (profit > 0): # not taking into account slippage or order book depth
            print(ms, symbol, "profit:", profit, "Buy", min_exchange.id, min_price, "Sell", max_exchange.id, max_price)
            
            if not paper_trading:
                buy_min = min_exchange.create_market_buy_order(symbol, order_size)
                sell_max = max_exchange.create_market_sell_order(symbol, order_size)
                orders = await asyncio.gather(buy_min, sell_max) # execute them "simultaneously"
                print("Orders executed successfully")
        else:
            print(str(ms), symbol, "no arbitrage opportunity")

async def check_requirements():
    print("Checking if exchanges support fetchTickers and the symbols we want to trade")
    for exchange in exchanges:
        if not exchange.has['fetchTickers']:
            print(exchange.id, "does not support fetchTickers")
            sys.exit()
        await exchange.load_markets()
        
        for symbol in symbols:
            if symbol not in exchange.markets:
                print(exchange.id, "does not support", symbol)
                sys.exit()

async def main():
    await check_requirements()
    print("Starting bot")
    while True:
        try:
            await bot()
        except e:
            print("Exception: ", e)
        await asyncio.sleep(wait_time)

asyncio.run(main())



