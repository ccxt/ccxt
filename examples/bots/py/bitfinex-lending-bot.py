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
# Simple lending bot that will look for lending opportunities on bitfinex markets ##
# and execute them using market orders.                                           ##
#                                                                                 ##                 
# Disclaimer: this bot is for educational purposes only. Use at your own risk.    ##
####################################################################################

# bot options
wait_time = 5 # seconds to wait between each check
paper_trading = True # set to false to actually execute trades

# exchange you want to use to look for lending opportunities
exchange = ccxt.bitfinex2()

# currencies you want to lend
currencies = [
    "fUST",
]

# order sizes for each currency, adjust it to your liking
order_sizes = {
    "fUST": 100,
}

async def get_last_funding_infos():
    tasks = [ exchange.public_get_funding_stats_symbol_hist({ 'symbol': currency, 'limit': 1 }) for currency in currencies ]
    results = await asyncio.gather(*tasks)
    fundingInfos = {}
    # parse results
    for i in range(0, len(currencies)):
        currency = currencies[i]
        data = results[i][0]
        fundingInfos[currency] = {
            'rate': exchange.safe_number(data, 3),
            'rateDay': exchange.safe_number(data, 3) * 100 * 365,
            'rateYear': exchange.safe_number(data, 3) * 100 * 365 * 365,
            'averagePeriod': exchange.safe_number(data, 4),
            'amount': exchange.safe_number(data, 7),
            'amountUsed': exchange.safe_number(data, 8),
            'timestamp': exchange.safe_number(data, 0),
        }
    return fundingInfos

async def bot():
    fundingInfos = await get_last_funding_infos()
    for currency in currencies:
        ms = int(time.time() * 1000)

        order_size = order_sizes[currency]
        fundingInfo = fundingInfos[currency]

        profit = (fundingInfo['averagePeriod'] * fundingInfo['rateDay'] * order_size) - order_size

        if (profit > 0): # not taking into account slippage or order book depth
            print(ms, currency, "profit:", profit, "lend:", currency, "rate:", fundingInfo['rate'], "period (day):", fundingInfo['averagePeriod'])
            
            if not paper_trading:
                order = await exchange.private_post_auth_w_funding_offer_submit({
                    'type': 'LIMIT',
                    'symbol': currency,
                    'amount': str(order_size),
                    'rate': str(fundingInfo['rate']),
                    'period': 2,
                    'flags': 0
                })
        else:
            print(str(ms), symbol, "no lending opportunity")

async def check_requirements():
    print("Checking if exchange support the currency we want to lend")
    await exchange.load_markets()
    
    for currency in currencies:
        if currency not in exchange.currencies_by_id:
            print(exchange.id, "does not support", currency)
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



