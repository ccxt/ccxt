# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Async)"""

# ----------------------------------------------------------------------------

__version__ = '4.5.6'

# ----------------------------------------------------------------------------

from ccxt.async_support.base.exchange import Exchange  # noqa: F401

# CCXT Pro exchanges (now this is mainly used for importing exchanges in WS tests)

# DO_NOT_REMOVE__ERROR_IMPORTS_START
from ccxt.base.errors import BaseError                                # noqa: F401
from ccxt.base.errors import ExchangeError                            # noqa: F401
from ccxt.base.errors import AuthenticationError                      # noqa: F401
from ccxt.base.errors import PermissionDenied                         # noqa: F401
from ccxt.base.errors import AccountNotEnabled                        # noqa: F401
from ccxt.base.errors import AccountSuspended                         # noqa: F401
from ccxt.base.errors import ArgumentsRequired                        # noqa: F401
from ccxt.base.errors import BadRequest                               # noqa: F401
from ccxt.base.errors import BadSymbol                                # noqa: F401
from ccxt.base.errors import OperationRejected                        # noqa: F401
from ccxt.base.errors import NoChange                                 # noqa: F401
from ccxt.base.errors import MarginModeAlreadySet                     # noqa: F401
from ccxt.base.errors import MarketClosed                             # noqa: F401
from ccxt.base.errors import ManualInteractionNeeded                  # noqa: F401
from ccxt.base.errors import RestrictedLocation                       # noqa: F401
from ccxt.base.errors import InsufficientFunds                        # noqa: F401
from ccxt.base.errors import InvalidAddress                           # noqa: F401
from ccxt.base.errors import AddressPending                           # noqa: F401
from ccxt.base.errors import InvalidOrder                             # noqa: F401
from ccxt.base.errors import OrderNotFound                            # noqa: F401
from ccxt.base.errors import OrderNotCached                           # noqa: F401
from ccxt.base.errors import OrderImmediatelyFillable                 # noqa: F401
from ccxt.base.errors import OrderNotFillable                         # noqa: F401
from ccxt.base.errors import DuplicateOrderId                         # noqa: F401
from ccxt.base.errors import ContractUnavailable                      # noqa: F401
from ccxt.base.errors import NotSupported                             # noqa: F401
from ccxt.base.errors import InvalidProxySettings                     # noqa: F401
from ccxt.base.errors import ExchangeClosedByUser                     # noqa: F401
from ccxt.base.errors import OperationFailed                          # noqa: F401
from ccxt.base.errors import NetworkError                             # noqa: F401
from ccxt.base.errors import DDoSProtection                           # noqa: F401
from ccxt.base.errors import RateLimitExceeded                        # noqa: F401
from ccxt.base.errors import ExchangeNotAvailable                     # noqa: F401
from ccxt.base.errors import OnMaintenance                            # noqa: F401
from ccxt.base.errors import InvalidNonce                             # noqa: F401
from ccxt.base.errors import ChecksumError                            # noqa: F401
from ccxt.base.errors import RequestTimeout                           # noqa: F401
from ccxt.base.errors import BadResponse                              # noqa: F401
from ccxt.base.errors import NullResponse                             # noqa: F401
from ccxt.base.errors import CancelPending                            # noqa: F401
from ccxt.base.errors import UnsubscribeError                         # noqa: F401
from ccxt.base.errors import error_hierarchy                          # noqa: F401
# DO_NOT_REMOVE__ERROR_IMPORTS_END

from ccxt.pro.alpaca import alpaca                                        # noqa: F401
from ccxt.pro.apex import apex                                            # noqa: F401
from ccxt.pro.ascendex import ascendex                                    # noqa: F401
from ccxt.pro.backpack import backpack                                    # noqa: F401
from ccxt.pro.bequant import bequant                                      # noqa: F401
from ccxt.pro.binance import binance                                      # noqa: F401
from ccxt.pro.binancecoinm import binancecoinm                            # noqa: F401
from ccxt.pro.binanceus import binanceus                                  # noqa: F401
from ccxt.pro.binanceusdm import binanceusdm                              # noqa: F401
from ccxt.pro.bingx import bingx                                          # noqa: F401
from ccxt.pro.bitfinex import bitfinex                                    # noqa: F401
from ccxt.pro.bitget import bitget                                        # noqa: F401
from ccxt.pro.bithumb import bithumb                                      # noqa: F401
from ccxt.pro.bitmart import bitmart                                      # noqa: F401
from ccxt.pro.bitmex import bitmex                                        # noqa: F401
from ccxt.pro.bitopro import bitopro                                      # noqa: F401
from ccxt.pro.bitrue import bitrue                                        # noqa: F401
from ccxt.pro.bitstamp import bitstamp                                    # noqa: F401
from ccxt.pro.bittrade import bittrade                                    # noqa: F401
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
from ccxt.pro.defx import defx                                            # noqa: F401
from ccxt.pro.deribit import deribit                                      # noqa: F401
from ccxt.pro.derive import derive                                        # noqa: F401
from ccxt.pro.exmo import exmo                                            # noqa: F401
from ccxt.pro.gate import gate                                            # noqa: F401
from ccxt.pro.gateio import gateio                                        # noqa: F401
from ccxt.pro.gemini import gemini                                        # noqa: F401
from ccxt.pro.hashkey import hashkey                                      # noqa: F401
from ccxt.pro.hitbtc import hitbtc                                        # noqa: F401
from ccxt.pro.hollaex import hollaex                                      # noqa: F401
from ccxt.pro.htx import htx                                              # noqa: F401
from ccxt.pro.huobi import huobi                                          # noqa: F401
from ccxt.pro.hyperliquid import hyperliquid                              # noqa: F401
from ccxt.pro.independentreserve import independentreserve                # noqa: F401
from ccxt.pro.kraken import kraken                                        # noqa: F401
from ccxt.pro.krakenfutures import krakenfutures                          # noqa: F401
from ccxt.pro.kucoin import kucoin                                        # noqa: F401
from ccxt.pro.kucoinfutures import kucoinfutures                          # noqa: F401
from ccxt.pro.lbank import lbank                                          # noqa: F401
from ccxt.pro.luno import luno                                            # noqa: F401
from ccxt.pro.mexc import mexc                                            # noqa: F401
from ccxt.pro.modetrade import modetrade                                  # noqa: F401
from ccxt.pro.myokx import myokx                                          # noqa: F401
from ccxt.pro.ndax import ndax                                            # noqa: F401
from ccxt.pro.okcoin import okcoin                                        # noqa: F401
from ccxt.pro.okx import okx                                              # noqa: F401
from ccxt.pro.okxus import okxus                                          # noqa: F401
from ccxt.pro.onetrading import onetrading                                # noqa: F401
from ccxt.pro.oxfun import oxfun                                          # noqa: F401
from ccxt.pro.p2b import p2b                                              # noqa: F401
from ccxt.pro.paradex import paradex                                      # noqa: F401
from ccxt.pro.phemex import phemex                                        # noqa: F401
from ccxt.pro.poloniex import poloniex                                    # noqa: F401
from ccxt.pro.probit import probit                                        # noqa: F401
from ccxt.pro.toobit import toobit                                        # noqa: F401
from ccxt.pro.upbit import upbit                                          # noqa: F401
from ccxt.pro.whitebit import whitebit                                    # noqa: F401
from ccxt.pro.woo import woo                                              # noqa: F401
from ccxt.pro.woofipro import woofipro                                    # noqa: F401
from ccxt.pro.xt import xt                                                # noqa: F401

exchanges = [
    'alpaca',
    'apex',
    'ascendex',
    'backpack',
    'bequant',
    'binance',
    'binancecoinm',
    'binanceus',
    'binanceusdm',
    'bingx',
    'bitfinex',
    'bitget',
    'bithumb',
    'bitmart',
    'bitmex',
    'bitopro',
    'bitrue',
    'bitstamp',
    'bittrade',
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
    'defx',
    'deribit',
    'derive',
    'exmo',
    'gate',
    'gateio',
    'gemini',
    'hashkey',
    'hitbtc',
    'hollaex',
    'htx',
    'huobi',
    'hyperliquid',
    'independentreserve',
    'kraken',
    'krakenfutures',
    'kucoin',
    'kucoinfutures',
    'lbank',
    'luno',
    'mexc',
    'modetrade',
    'myokx',
    'ndax',
    'okcoin',
    'okx',
    'okxus',
    'onetrading',
    'oxfun',
    'p2b',
    'paradex',
    'phemex',
    'poloniex',
    'probit',
    'toobit',
    'upbit',
    'whitebit',
    'woo',
    'woofipro',
    'xt',
]
