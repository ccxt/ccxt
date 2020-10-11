# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library"""

# MIT License
# Copyright (c) 2017 Igor Kroitor
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

# ----------------------------------------------------------------------------

__version__ = '1.36.1'

# ----------------------------------------------------------------------------

from ccxt.base.exchange import Exchange                     # noqa: F401

from ccxt.base.decimal_to_precision import decimal_to_precision  # noqa: F401
from ccxt.base.decimal_to_precision import TRUNCATE              # noqa: F401
from ccxt.base.decimal_to_precision import ROUND                 # noqa: F401
from ccxt.base.decimal_to_precision import DECIMAL_PLACES        # noqa: F401
from ccxt.base.decimal_to_precision import SIGNIFICANT_DIGITS    # noqa: F401
from ccxt.base.decimal_to_precision import TICK_SIZE             # noqa: F401
from ccxt.base.decimal_to_precision import NO_PADDING            # noqa: F401
from ccxt.base.decimal_to_precision import PAD_WITH_ZERO         # noqa: F401

from ccxt.base import errors
from ccxt.base.errors import BaseError                      # noqa: F401
from ccxt.base.errors import ExchangeError                  # noqa: F401
from ccxt.base.errors import AuthenticationError            # noqa: F401
from ccxt.base.errors import PermissionDenied               # noqa: F401
from ccxt.base.errors import AccountSuspended               # noqa: F401
from ccxt.base.errors import ArgumentsRequired              # noqa: F401
from ccxt.base.errors import BadRequest                     # noqa: F401
from ccxt.base.errors import BadSymbol                      # noqa: F401
from ccxt.base.errors import BadResponse                    # noqa: F401
from ccxt.base.errors import NullResponse                   # noqa: F401
from ccxt.base.errors import InsufficientFunds              # noqa: F401
from ccxt.base.errors import InvalidAddress                 # noqa: F401
from ccxt.base.errors import AddressPending                 # noqa: F401
from ccxt.base.errors import InvalidOrder                   # noqa: F401
from ccxt.base.errors import OrderNotFound                  # noqa: F401
from ccxt.base.errors import OrderNotCached                 # noqa: F401
from ccxt.base.errors import CancelPending                  # noqa: F401
from ccxt.base.errors import OrderImmediatelyFillable       # noqa: F401
from ccxt.base.errors import OrderNotFillable               # noqa: F401
from ccxt.base.errors import DuplicateOrderId               # noqa: F401
from ccxt.base.errors import NotSupported                   # noqa: F401
from ccxt.base.errors import NetworkError                   # noqa: F401
from ccxt.base.errors import DDoSProtection                 # noqa: F401
from ccxt.base.errors import RateLimitExceeded              # noqa: F401
from ccxt.base.errors import ExchangeNotAvailable           # noqa: F401
from ccxt.base.errors import OnMaintenance                  # noqa: F401
from ccxt.base.errors import InvalidNonce                   # noqa: F401
from ccxt.base.errors import RequestTimeout                 # noqa: F401
from ccxt.base.errors import error_hierarchy                # noqa: F401

from ccxt.acx import acx                                    # noqa: F401
from ccxt.aofex import aofex                                # noqa: F401
from ccxt.bcex import bcex                                  # noqa: F401
from ccxt.bequant import bequant                            # noqa: F401
from ccxt.bibox import bibox                                # noqa: F401
from ccxt.bigone import bigone                              # noqa: F401
from ccxt.binance import binance                            # noqa: F401
from ccxt.binanceje import binanceje                        # noqa: F401
from ccxt.binanceus import binanceus                        # noqa: F401
from ccxt.bit2c import bit2c                                # noqa: F401
from ccxt.bitbank import bitbank                            # noqa: F401
from ccxt.bitbay import bitbay                              # noqa: F401
from ccxt.bitfinex import bitfinex                          # noqa: F401
from ccxt.bitfinex2 import bitfinex2                        # noqa: F401
from ccxt.bitflyer import bitflyer                          # noqa: F401
from ccxt.bitforex import bitforex                          # noqa: F401
from ccxt.bitget import bitget                              # noqa: F401
from ccxt.bithumb import bithumb                            # noqa: F401
from ccxt.bitkk import bitkk                                # noqa: F401
from ccxt.bitmart import bitmart                            # noqa: F401
from ccxt.bitmax import bitmax                              # noqa: F401
from ccxt.bitmex import bitmex                              # noqa: F401
from ccxt.bitpanda import bitpanda                          # noqa: F401
from ccxt.bitso import bitso                                # noqa: F401
from ccxt.bitstamp import bitstamp                          # noqa: F401
from ccxt.bitstamp1 import bitstamp1                        # noqa: F401
from ccxt.bittrex import bittrex                            # noqa: F401
from ccxt.bitvavo import bitvavo                            # noqa: F401
from ccxt.bitz import bitz                                  # noqa: F401
from ccxt.bl3p import bl3p                                  # noqa: F401
from ccxt.bleutrade import bleutrade                        # noqa: F401
from ccxt.braziliex import braziliex                        # noqa: F401
from ccxt.btcalpha import btcalpha                          # noqa: F401
from ccxt.btcbox import btcbox                              # noqa: F401
from ccxt.btcmarkets import btcmarkets                      # noqa: F401
from ccxt.btctradeua import btctradeua                      # noqa: F401
from ccxt.btcturk import btcturk                            # noqa: F401
from ccxt.buda import buda                                  # noqa: F401
from ccxt.bw import bw                                      # noqa: F401
from ccxt.bybit import bybit                                # noqa: F401
from ccxt.bytetrade import bytetrade                        # noqa: F401
from ccxt.cex import cex                                    # noqa: F401
from ccxt.chilebit import chilebit                          # noqa: F401
from ccxt.coinbase import coinbase                          # noqa: F401
from ccxt.coinbaseprime import coinbaseprime                # noqa: F401
from ccxt.coinbasepro import coinbasepro                    # noqa: F401
from ccxt.coincheck import coincheck                        # noqa: F401
from ccxt.coinegg import coinegg                            # noqa: F401
from ccxt.coinex import coinex                              # noqa: F401
from ccxt.coinfalcon import coinfalcon                      # noqa: F401
from ccxt.coinfloor import coinfloor                        # noqa: F401
from ccxt.coingi import coingi                              # noqa: F401
from ccxt.coinmarketcap import coinmarketcap                # noqa: F401
from ccxt.coinmate import coinmate                          # noqa: F401
from ccxt.coinone import coinone                            # noqa: F401
from ccxt.coinspot import coinspot                          # noqa: F401
from ccxt.coss import coss                                  # noqa: F401
from ccxt.crex24 import crex24                              # noqa: F401
from ccxt.currencycom import currencycom                    # noqa: F401
from ccxt.deribit import deribit                            # noqa: F401
from ccxt.digifinex import digifinex                        # noqa: F401
from ccxt.dsx import dsx                                    # noqa: F401
from ccxt.eterbase import eterbase                          # noqa: F401
from ccxt.exmo import exmo                                  # noqa: F401
from ccxt.exx import exx                                    # noqa: F401
from ccxt.fcoin import fcoin                                # noqa: F401
from ccxt.fcoinjp import fcoinjp                            # noqa: F401
from ccxt.flowbtc import flowbtc                            # noqa: F401
from ccxt.foxbit import foxbit                              # noqa: F401
from ccxt.ftx import ftx                                    # noqa: F401
from ccxt.gateio import gateio                              # noqa: F401
from ccxt.gemini import gemini                              # noqa: F401
from ccxt.hbtc import hbtc                                  # noqa: F401
from ccxt.hitbtc import hitbtc                              # noqa: F401
from ccxt.hollaex import hollaex                            # noqa: F401
from ccxt.huobijp import huobijp                            # noqa: F401
from ccxt.huobipro import huobipro                          # noqa: F401
from ccxt.huobiru import huobiru                            # noqa: F401
from ccxt.ice3x import ice3x                                # noqa: F401
from ccxt.idex import idex                                  # noqa: F401
from ccxt.idex2 import idex2                                # noqa: F401
from ccxt.independentreserve import independentreserve      # noqa: F401
from ccxt.indodax import indodax                            # noqa: F401
from ccxt.itbit import itbit                                # noqa: F401
from ccxt.kraken import kraken                              # noqa: F401
from ccxt.kucoin import kucoin                              # noqa: F401
from ccxt.kuna import kuna                                  # noqa: F401
from ccxt.lakebtc import lakebtc                            # noqa: F401
from ccxt.latoken import latoken                            # noqa: F401
from ccxt.lbank import lbank                                # noqa: F401
from ccxt.liquid import liquid                              # noqa: F401
from ccxt.livecoin import livecoin                          # noqa: F401
from ccxt.luno import luno                                  # noqa: F401
from ccxt.lykke import lykke                                # noqa: F401
from ccxt.mercado import mercado                            # noqa: F401
from ccxt.mixcoins import mixcoins                          # noqa: F401
from ccxt.novadax import novadax                            # noqa: F401
from ccxt.oceanex import oceanex                            # noqa: F401
from ccxt.okcoin import okcoin                              # noqa: F401
from ccxt.okex import okex                                  # noqa: F401
from ccxt.paymium import paymium                            # noqa: F401
from ccxt.phemex import phemex                              # noqa: F401
from ccxt.poloniex import poloniex                          # noqa: F401
from ccxt.probit import probit                              # noqa: F401
from ccxt.qtrade import qtrade                              # noqa: F401
from ccxt.rightbtc import rightbtc                          # noqa: F401
from ccxt.ripio import ripio                                # noqa: F401
from ccxt.southxchange import southxchange                  # noqa: F401
from ccxt.stex import stex                                  # noqa: F401
from ccxt.stronghold import stronghold                      # noqa: F401
from ccxt.surbitcoin import surbitcoin                      # noqa: F401
from ccxt.therock import therock                            # noqa: F401
from ccxt.tidebit import tidebit                            # noqa: F401
from ccxt.tidex import tidex                                # noqa: F401
from ccxt.timex import timex                                # noqa: F401
from ccxt.upbit import upbit                                # noqa: F401
from ccxt.vaultoro import vaultoro                          # noqa: F401
from ccxt.vbtc import vbtc                                  # noqa: F401
from ccxt.wavesexchange import wavesexchange                # noqa: F401
from ccxt.whitebit import whitebit                          # noqa: F401
from ccxt.xbtce import xbtce                                # noqa: F401
from ccxt.xena import xena                                  # noqa: F401
from ccxt.yobit import yobit                                # noqa: F401
from ccxt.zaif import zaif                                  # noqa: F401
from ccxt.zb import zb                                      # noqa: F401

exchanges = [
    'acx',
    'aofex',
    'bcex',
    'bequant',
    'bibox',
    'bigone',
    'binance',
    'binanceje',
    'binanceus',
    'bit2c',
    'bitbank',
    'bitbay',
    'bitfinex',
    'bitfinex2',
    'bitflyer',
    'bitforex',
    'bitget',
    'bithumb',
    'bitkk',
    'bitmart',
    'bitmax',
    'bitmex',
    'bitpanda',
    'bitso',
    'bitstamp',
    'bitstamp1',
    'bittrex',
    'bitvavo',
    'bitz',
    'bl3p',
    'bleutrade',
    'braziliex',
    'btcalpha',
    'btcbox',
    'btcmarkets',
    'btctradeua',
    'btcturk',
    'buda',
    'bw',
    'bybit',
    'bytetrade',
    'cex',
    'chilebit',
    'coinbase',
    'coinbaseprime',
    'coinbasepro',
    'coincheck',
    'coinegg',
    'coinex',
    'coinfalcon',
    'coinfloor',
    'coingi',
    'coinmarketcap',
    'coinmate',
    'coinone',
    'coinspot',
    'coss',
    'crex24',
    'currencycom',
    'deribit',
    'digifinex',
    'dsx',
    'eterbase',
    'exmo',
    'exx',
    'fcoin',
    'fcoinjp',
    'flowbtc',
    'foxbit',
    'ftx',
    'gateio',
    'gemini',
    'hbtc',
    'hitbtc',
    'hollaex',
    'huobijp',
    'huobipro',
    'huobiru',
    'ice3x',
    'idex',
    'idex2',
    'independentreserve',
    'indodax',
    'itbit',
    'kraken',
    'kucoin',
    'kuna',
    'lakebtc',
    'latoken',
    'lbank',
    'liquid',
    'livecoin',
    'luno',
    'lykke',
    'mercado',
    'mixcoins',
    'novadax',
    'oceanex',
    'okcoin',
    'okex',
    'paymium',
    'phemex',
    'poloniex',
    'probit',
    'qtrade',
    'rightbtc',
    'ripio',
    'southxchange',
    'stex',
    'stronghold',
    'surbitcoin',
    'therock',
    'tidebit',
    'tidex',
    'timex',
    'upbit',
    'vaultoro',
    'vbtc',
    'wavesexchange',
    'whitebit',
    'xbtce',
    'xena',
    'yobit',
    'zaif',
    'zb',
]

base = [
    'Exchange',
    'exchanges',
    'decimal_to_precision',
]

__all__ = base + errors.__all__ + exchanges
