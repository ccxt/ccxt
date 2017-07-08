# Always prefer setuptools over distutils
from setuptools import setup, find_packages
# To use a consistent encoding
from codecs import open
from os import path
import json
import sys

here = path.abspath (path.dirname (__file__))

# Get the long description from the README file
with open (path.join (here, 'README.rst'), encoding='utf-8') as f:
    long_description = f.read()

# Get the version number and other params from package.json    
with open (path.join (here, 'package.json'), encoding = 'utf-8') as f:
    package = json.load (f)

setup (

    name = package['name'],
    version = package['version'],
    
    description = package['description'],
    long_description = long_description,
    
    url = package['homepage'],
    
    author = package['author']['name'],
    author_email = package['author']['email'],
    
    license = package['license'],

    classifiers = [
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Intended Audience :: Financial and Insurance Industry',
        'Intended Audience :: Information Technology',
        'Topic :: Software Development :: Build Tools',
        'Topic :: Office/Business :: Financial :: Investment',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: JavaScript',
        'Programming Language :: PHP',
        'Operating System :: OS Independent',
        'Environment :: Console'
    ],

    keywords = 'algotrading altcoin altcoins api arbitrage backtesting bitcoin bot btc crypto cryptocurrency currency market darkcoin dash digital doge dogecoin e-commerce eth ether ethereum exchange exchanges framework invest investing investor library light litecoin ltc marketdata merchandise merchant minimal order orderbook book price pricedata pricefeed private public ripple strategy toolkit trade trader trading volume xbt xrp zec zerocoin 1Broker 1BTCXE ANX ANXPro bit2c.co.il Bit2C BitBay BitBays Bitcoin.co.id Bitfinex bitlish BitMarket BitMEX Bitso Bitstamp Bittrex BTCC BTCChina BTC-e BTCe btc-trade.com.ua BTCTradeUA BTCX btc-x bter Bter.com BX.in.th ccex C-CEX cex CEX.IO coincheck CoinMate Coinsecure EXMO FYB-SE FYB-SG GDAX Gemini HitBTC Huobi itBit jubi.com Kraken LiveCoin Liqui liqui.io luno mercado MercadoBitcoin mercadobitcoin.br OKCoin OKCoin.com OKCoin.cn Paymium Poloniex QuadrigaCX QUOINE SouthXchange TheRockTrading Vaultoro VirWoX YoBit Zaif',

    packages = find_packages ()
)