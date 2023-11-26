# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Async)"""

# ----------------------------------------------------------------------------

__version__ = '4.1.66'

# ----------------------------------------------------------------------------

from ccxt.async_support.base.exchange import Exchange  # noqa: F401

# CCXT Pro exchanges (now this is mainly used for importing exchanges in WS tests)

from ccxt.pro.alpaca import alpaca                                        # noqa: F401
from ccxt.pro.ascendex import ascendex                                    # noqa: F401
from ccxt.pro.bequant import bequant                                      # noqa: F401
from ccxt.pro.binance import binance                                      # noqa: F401
from ccxt.pro.binancecoinm import binancecoinm                            # noqa: F401
from ccxt.pro.binanceus import binanceus                                  # noqa: F401
from ccxt.pro.binanceusdm import binanceusdm                              # noqa: F401
from ccxt.pro.bingx import bingx                                          # noqa: F401
from ccxt.pro.bitcoincom import bitcoincom                                # noqa: F401
from ccxt.pro.bitfinex import bitfinex                                    # noqa: F401
from ccxt.pro.bitfinex2 import bitfinex2                                  # noqa: F401
from ccxt.pro.bitget import bitget                                        # noqa: F401
from ccxt.pro.bitmart import bitmart                                      # noqa: F401
from ccxt.pro.bitmex import bitmex                                        # noqa: F401
from ccxt.pro.bitopro import bitopro                                      # noqa: F401
from ccxt.pro.bitpanda import bitpanda                                    # noqa: F401
from ccxt.pro.bitrue import bitrue                                        # noqa: F401
from ccxt.pro.bitstamp import bitstamp                                    # noqa: F401
from ccxt.pro.bittrex import bittrex                                      # noqa: F401
from ccxt.pro.bitvavo import bitvavo                                      # noqa: F401
from ccxt.pro.blockchaincom import blockchaincom                          # noqa: F401
from ccxt.pro.bybit import bybit                                          # noqa: F401
from ccxt.pro.cex import cex                                              # noqa: F401
from ccxt.pro.coinbase import coinbase                                    # noqa: F401
from ccxt.pro.coinbaseprime import coinbaseprime                          # noqa: F401
from ccxt.pro.coinbasepro import coinbasepro                              # noqa: F401
from ccxt.pro.coinex import coinex                                        # noqa: F401
from ccxt.pro.cryptocom import cryptocom                                  # noqa: F401
from ccxt.pro.currencycom import currencycom                              # noqa: F401
from ccxt.pro.deribit import deribit                                      # noqa: F401
from ccxt.pro.exmo import exmo                                            # noqa: F401
from ccxt.pro.gate import gate                                            # noqa: F401
from ccxt.pro.gateio import gateio                                        # noqa: F401
from ccxt.pro.gemini import gemini                                        # noqa: F401
from ccxt.pro.hitbtc import hitbtc                                        # noqa: F401
from ccxt.pro.hollaex import hollaex                                      # noqa: F401
from ccxt.pro.htx import htx                                              # noqa: F401
from ccxt.pro.huobi import huobi                                          # noqa: F401
from ccxt.pro.huobijp import huobijp                                      # noqa: F401
from ccxt.pro.idex import idex                                            # noqa: F401
from ccxt.pro.independentreserve import independentreserve                # noqa: F401
from ccxt.pro.kraken import kraken                                        # noqa: F401
from ccxt.pro.krakenfutures import krakenfutures                          # noqa: F401
from ccxt.pro.kucoin import kucoin                                        # noqa: F401
from ccxt.pro.kucoinfutures import kucoinfutures                          # noqa: F401
from ccxt.pro.luno import luno                                            # noqa: F401
from ccxt.pro.mexc import mexc                                            # noqa: F401
from ccxt.pro.ndax import ndax                                            # noqa: F401
from ccxt.pro.okcoin import okcoin                                        # noqa: F401
from ccxt.pro.okx import okx                                              # noqa: F401
from ccxt.pro.phemex import phemex                                        # noqa: F401
from ccxt.pro.poloniex import poloniex                                    # noqa: F401
from ccxt.pro.poloniexfutures import poloniexfutures                      # noqa: F401
from ccxt.pro.probit import probit                                        # noqa: F401
from ccxt.pro.upbit import upbit                                          # noqa: F401
from ccxt.pro.wazirx import wazirx                                        # noqa: F401
from ccxt.pro.whitebit import whitebit                                    # noqa: F401
from ccxt.pro.woo import woo                                              # noqa: F401

exchanges = [
    'alpaca',
    'ascendex',
    'bequant',
    'binance',
    'binancecoinm',
    'binanceus',
    'binanceusdm',
    'bingx',
    'bitcoincom',
    'bitfinex',
    'bitfinex2',
    'bitget',
    'bitmart',
    'bitmex',
    'bitopro',
    'bitpanda',
    'bitrue',
    'bitstamp',
    'bittrex',
    'bitvavo',
    'blockchaincom',
    'bybit',
    'cex',
    'coinbase',
    'coinbaseprime',
    'coinbasepro',
    'coinex',
    'cryptocom',
    'currencycom',
    'deribit',
    'exmo',
    'gate',
    'gateio',
    'gemini',
    'hitbtc',
    'hollaex',
    'htx',
    'huobi',
    'huobijp',
    'idex',
    'independentreserve',
    'kraken',
    'krakenfutures',
    'kucoin',
    'kucoinfutures',
    'luno',
    'mexc',
    'ndax',
    'okcoin',
    'okx',
    'phemex',
    'poloniex',
    'poloniexfutures',
    'probit',
    'upbit',
    'wazirx',
    'whitebit',
    'woo',
]
