# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Async)"""

# ----------------------------------------------------------------------------

__version__ = '4.4.61'

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
from ccxt.pro.bitfinex1 import bitfinex1                                  # noqa: F401
from ccxt.pro.bitget import bitget                                        # noqa: F401
from ccxt.pro.bithumb import bithumb                                      # noqa: F401
from ccxt.pro.bitmart import bitmart                                      # noqa: F401
from ccxt.pro.bitmex import bitmex                                        # noqa: F401
from ccxt.pro.bitopro import bitopro                                      # noqa: F401
from ccxt.pro.bitpanda import bitpanda                                    # noqa: F401
from ccxt.pro.bitrue import bitrue                                        # noqa: F401
from ccxt.pro.bitstamp import bitstamp                                    # noqa: F401
from ccxt.pro.bitvavo import bitvavo                                      # noqa: F401
from ccxt.pro.blockchaincom import blockchaincom                          # noqa: F401
from ccxt.pro.blofin import blofin                                        # noqa: F401
from ccxt.pro.bybit import bybit                                          # noqa: F401
from ccxt.pro.cex import cex                                              # noqa: F401
from ccxt.pro.coinbase import coinbase                                    # noqa: F401
from ccxt.pro.coinbaseadvanced import coinbaseadvanced                    # noqa: F401
from ccxt.pro.coinbaseexchange import coinbaseexchange                    # noqa: F401
from ccxt.pro.coinbaseinternational import coinbaseinternational          # noqa: F401
from ccxt.pro.coincatch import coincatch                                  # noqa: F401
from ccxt.pro.coincheck import coincheck                                  # noqa: F401
from ccxt.pro.coinex import coinex                                        # noqa: F401
from ccxt.pro.coinone import coinone                                      # noqa: F401
from ccxt.pro.cryptocom import cryptocom                                  # noqa: F401
from ccxt.pro.currencycom import currencycom                              # noqa: F401
from ccxt.pro.defx import defx                                            # noqa: F401
from ccxt.pro.deribit import deribit                                      # noqa: F401
from ccxt.pro.exmo import exmo                                            # noqa: F401
from ccxt.pro.gate import gate                                            # noqa: F401
from ccxt.pro.gateio import gateio                                        # noqa: F401
from ccxt.pro.gemini import gemini                                        # noqa: F401
from ccxt.pro.hashkey import hashkey                                      # noqa: F401
from ccxt.pro.hitbtc import hitbtc                                        # noqa: F401
from ccxt.pro.hollaex import hollaex                                      # noqa: F401
from ccxt.pro.htx import htx                                              # noqa: F401
from ccxt.pro.huobi import huobi                                          # noqa: F401
from ccxt.pro.huobijp import huobijp                                      # noqa: F401
from ccxt.pro.hyperliquid import hyperliquid                              # noqa: F401
from ccxt.pro.idex import idex                                            # noqa: F401
from ccxt.pro.independentreserve import independentreserve                # noqa: F401
from ccxt.pro.kraken import kraken                                        # noqa: F401
from ccxt.pro.krakenfutures import krakenfutures                          # noqa: F401
from ccxt.pro.kucoin import kucoin                                        # noqa: F401
from ccxt.pro.kucoinfutures import kucoinfutures                          # noqa: F401
from ccxt.pro.lbank import lbank                                          # noqa: F401
from ccxt.pro.luno import luno                                            # noqa: F401
from ccxt.pro.mexc import mexc                                            # noqa: F401
from ccxt.pro.myokx import myokx                                          # noqa: F401
from ccxt.pro.ndax import ndax                                            # noqa: F401
from ccxt.pro.okcoin import okcoin                                        # noqa: F401
from ccxt.pro.okx import okx                                              # noqa: F401
from ccxt.pro.onetrading import onetrading                                # noqa: F401
from ccxt.pro.oxfun import oxfun                                          # noqa: F401
from ccxt.pro.p2b import p2b                                              # noqa: F401
from ccxt.pro.paradex import paradex                                      # noqa: F401
from ccxt.pro.phemex import phemex                                        # noqa: F401
from ccxt.pro.poloniex import poloniex                                    # noqa: F401
from ccxt.pro.poloniexfutures import poloniexfutures                      # noqa: F401
from ccxt.pro.probit import probit                                        # noqa: F401
from ccxt.pro.upbit import upbit                                          # noqa: F401
from ccxt.pro.vertex import vertex                                        # noqa: F401
from ccxt.pro.whitebit import whitebit                                    # noqa: F401
from ccxt.pro.woo import woo                                              # noqa: F401
from ccxt.pro.woofipro import woofipro                                    # noqa: F401
from ccxt.pro.xt import xt                                                # noqa: F401

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
    'bitfinex1',
    'bitget',
    'bithumb',
    'bitmart',
    'bitmex',
    'bitopro',
    'bitpanda',
    'bitrue',
    'bitstamp',
    'bitvavo',
    'blockchaincom',
    'blofin',
    'bybit',
    'cex',
    'coinbase',
    'coinbaseadvanced',
    'coinbaseexchange',
    'coinbaseinternational',
    'coincatch',
    'coincheck',
    'coinex',
    'coinone',
    'cryptocom',
    'currencycom',
    'defx',
    'deribit',
    'exmo',
    'gate',
    'gateio',
    'gemini',
    'hashkey',
    'hitbtc',
    'hollaex',
    'htx',
    'huobi',
    'huobijp',
    'hyperliquid',
    'idex',
    'independentreserve',
    'kraken',
    'krakenfutures',
    'kucoin',
    'kucoinfutures',
    'lbank',
    'luno',
    'mexc',
    'myokx',
    'ndax',
    'okcoin',
    'okx',
    'onetrading',
    'oxfun',
    'p2b',
    'paradex',
    'phemex',
    'poloniex',
    'poloniexfutures',
    'probit',
    'upbit',
    'vertex',
    'whitebit',
    'woo',
    'woofipro',
    'xt',
]
