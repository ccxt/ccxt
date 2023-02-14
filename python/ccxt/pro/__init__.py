# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Async)"""

# ----------------------------------------------------------------------------

__version__ = '2.7.94'

# ----------------------------------------------------------------------------

# Pro Exchange

from ccxt.pro.base.exchange import Exchange  # noqa: F401

# CCXT Pro exchanges (now this is mainly used for importing exchanges in WS tests)

from ccxt.pro.alpaca import alpaca                                        # noqa: F401
from ccxt.pro.ascendex import ascendex                                    # noqa: F401
from ccxt.pro.bequant import bequant                                      # noqa: F401
from ccxt.pro.binance import binance                                      # noqa: F401
from ccxt.pro.binancecoinm import binancecoinm                            # noqa: F401
from ccxt.pro.binanceus import binanceus                                  # noqa: F401
from ccxt.pro.binanceusdm import binanceusdm                              # noqa: F401
from ccxt.pro.bitcoincom import bitcoincom                                # noqa: F401
from ccxt.pro.bitfinex import bitfinex                                    # noqa: F401
from ccxt.pro.bitfinex2 import bitfinex2                                  # noqa: F401
from ccxt.pro.bitget import bitget                                        # noqa: F401
from ccxt.pro.bitmart import bitmart                                      # noqa: F401
from ccxt.pro.bitmex import bitmex                                        # noqa: F401
from ccxt.pro.bitopro import bitopro                                      # noqa: F401
from ccxt.pro.bitrue import bitrue                                        # noqa: F401
from ccxt.pro.bitstamp import bitstamp                                    # noqa: F401
from ccxt.pro.bittrex import bittrex                                      # noqa: F401
from ccxt.pro.bitvavo import bitvavo                                      # noqa: F401
from ccxt.pro.btcex import btcex                                          # noqa: F401
from ccxt.pro.bybit import bybit                                          # noqa: F401
from ccxt.pro.cex import cex                                              # noqa: F401
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
from ccxt.pro.huobi import huobi                                          # noqa: F401
from ccxt.pro.huobijp import huobijp                                      # noqa: F401
from ccxt.pro.huobipro import huobipro                                    # noqa: F401
from ccxt.pro.idex import idex                                            # noqa: F401
from ccxt.pro.kraken import kraken                                        # noqa: F401
from ccxt.pro.kucoin import kucoin                                        # noqa: F401
from ccxt.pro.kucoinfutures import kucoinfutures                          # noqa: F401
from ccxt.pro.luno import luno                                            # noqa: F401
from ccxt.pro.mexc import mexc                                            # noqa: F401
from ccxt.pro.ndax import ndax                                            # noqa: F401
from ccxt.pro.okcoin import okcoin                                        # noqa: F401
from ccxt.pro.okex import okex                                            # noqa: F401
from ccxt.pro.okx import okx                                              # noqa: F401
from ccxt.pro.phemex import phemex                                        # noqa: F401
from ccxt.pro.ripio import ripio                                          # noqa: F401
from ccxt.pro.upbit import upbit                                          # noqa: F401
from ccxt.pro.wazirx import wazirx                                        # noqa: F401
from ccxt.pro.whitebit import whitebit                                    # noqa: F401
from ccxt.pro.woo import woo                                              # noqa: F401
from ccxt.pro.zb import zb                                                # noqa: F401

exchanges = [
    'alpaca',
    'ascendex',
    'bequant',
    'binance',
    'binancecoinm',
    'binanceus',
    'binanceusdm',
    'bitcoincom',
    'bitfinex',
    'bitfinex2',
    'bitget',
    'bitmart',
    'bitmex',
    'bitopro',
    'bitrue',
    'bitstamp',
    'bittrex',
    'bitvavo',
    'btcex',
    'bybit',
    'cex',
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
    'huobi',
    'huobijp',
    'huobipro',
    'idex',
    'kraken',
    'kucoin',
    'kucoinfutures',
    'luno',
    'mexc',
    'ndax',
    'okcoin',
    'okex',
    'okx',
    'phemex',
    'ripio',
    'upbit',
    'wazirx',
    'whitebit',
    'woo',
    'zb',
]
