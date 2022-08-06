# -*- coding: utf-8 -*-

import asyncio
import os
from random import randint
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.coinex({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET_KEY',
})

exchange = ccxt.coinex({
    'apiKey': '5B7130AEDA97403C8AB75ACE6EA7F910',
    'secret': '23547B89097F6B8135A9E6A202F473458F1A13B4DFE116ED',
})

# Example 1 :: Swap : fetch balance, create a limit swap order with leverage
async def example_1():
    exchange.options['defaultType'] = 'swap'
    markets = await exchange.load_markets()

    # fetch swap balance
    balance = await exchange.fetch_balance()
    print(balance)
    
    # set the desired leverage (has to be made before placing the order and for a specific symbol)
    leverage = 6
    symbol = 'LTC/USDT:USDT'
    leverage_response = await exchange.set_leverage(symbol, leverage)

    # create limit order
    symbol = 'LTC/USDT:USDT'
    type = 'limit'
    side = 'buy'
    amount = 50
    price = 0.3
    create_order = await exchange.create_order(symbol, type, side, amount, price)
    print('Create order id:', create_order['id'])

# ------------------------------------------------------------------------------------------
async def main():
    await example_1()

asyncio.run(main())


