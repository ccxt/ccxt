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

__version__ = '1.93.91'

# ----------------------------------------------------------------------------

from ccxt.base.exchange import Exchange                     # noqa: F401
from ccxt.base.precise import Precise                       # noqa: F401

from ccxt.base.decimal_to_precision import decimal_to_precision  # noqa: F401
from ccxt.base.decimal_to_precision import TRUNCATE              # noqa: F401
from ccxt.base.decimal_to_precision import ROUND                 # noqa: F401
from ccxt.base.decimal_to_precision import ROUND_UP              # noqa: F401
from ccxt.base.decimal_to_precision import ROUND_DOWN            # noqa: F401
from ccxt.base.decimal_to_precision import DECIMAL_PLACES        # noqa: F401
from ccxt.base.decimal_to_precision import SIGNIFICANT_DIGITS    # noqa: F401
from ccxt.base.decimal_to_precision import TICK_SIZE             # noqa: F401
from ccxt.base.decimal_to_precision import NO_PADDING            # noqa: F401
from ccxt.base.decimal_to_precision import PAD_WITH_ZERO         # noqa: F401

from ccxt.base import errors
from ccxt.base.errors import BaseError                                # noqa: F401
from ccxt.base.errors import ExchangeError                            # noqa: F401
from ccxt.base.errors import AuthenticationError                      # noqa: F401
from ccxt.base.errors import PermissionDenied                         # noqa: F401
from ccxt.base.errors import AccountNotEnabled                        # noqa: F401
from ccxt.base.errors import AccountSuspended                         # noqa: F401
from ccxt.base.errors import ArgumentsRequired                        # noqa: F401
from ccxt.base.errors import BadRequest                               # noqa: F401
from ccxt.base.errors import BadSymbol                                # noqa: F401
from ccxt.base.errors import MarginModeAlreadySet                     # noqa: F401
from ccxt.base.errors import BadResponse                              # noqa: F401
from ccxt.base.errors import NullResponse                             # noqa: F401
from ccxt.base.errors import InsufficientFunds                        # noqa: F401
from ccxt.base.errors import InvalidAddress                           # noqa: F401
from ccxt.base.errors import AddressPending                           # noqa: F401
from ccxt.base.errors import InvalidOrder                             # noqa: F401
from ccxt.base.errors import OrderNotFound                            # noqa: F401
from ccxt.base.errors import OrderNotCached                           # noqa: F401
from ccxt.base.errors import CancelPending                            # noqa: F401
from ccxt.base.errors import OrderImmediatelyFillable                 # noqa: F401
from ccxt.base.errors import OrderNotFillable                         # noqa: F401
from ccxt.base.errors import DuplicateOrderId                         # noqa: F401
from ccxt.base.errors import NotSupported                             # noqa: F401
from ccxt.base.errors import NetworkError                             # noqa: F401
from ccxt.base.errors import DDoSProtection                           # noqa: F401
from ccxt.base.errors import RateLimitExceeded                        # noqa: F401
from ccxt.base.errors import ExchangeNotAvailable                     # noqa: F401
from ccxt.base.errors import OnMaintenance                            # noqa: F401
from ccxt.base.errors import InvalidNonce                             # noqa: F401
from ccxt.base.errors import RequestTimeout                           # noqa: F401
from ccxt.base.errors import error_hierarchy                          # noqa: F401

from ccxt.rest.aax import aax                                         # noqa: F401
from ccxt.rest.alpaca import alpaca                                   # noqa: F401
from ccxt.rest.ascendex import ascendex                               # noqa: F401
from ccxt.rest.bequant import bequant                                 # noqa: F401
from ccxt.rest.bibox import bibox                                     # noqa: F401
from ccxt.rest.bigone import bigone                                   # noqa: F401
from ccxt.rest.binance import binance                                 # noqa: F401
from ccxt.rest.binancecoinm import binancecoinm                       # noqa: F401
from ccxt.rest.binanceus import binanceus                             # noqa: F401
from ccxt.rest.binanceusdm import binanceusdm                         # noqa: F401
from ccxt.rest.bit2c import bit2c                                     # noqa: F401
from ccxt.rest.bitbank import bitbank                                 # noqa: F401
from ccxt.rest.bitbay import bitbay                                   # noqa: F401
from ccxt.rest.bitbns import bitbns                                   # noqa: F401
from ccxt.rest.bitcoincom import bitcoincom                           # noqa: F401
from ccxt.rest.bitfinex import bitfinex                               # noqa: F401
from ccxt.rest.bitfinex2 import bitfinex2                             # noqa: F401
from ccxt.rest.bitflyer import bitflyer                               # noqa: F401
from ccxt.rest.bitforex import bitforex                               # noqa: F401
from ccxt.rest.bitget import bitget                                   # noqa: F401
from ccxt.rest.bithumb import bithumb                                 # noqa: F401
from ccxt.rest.bitmart import bitmart                                 # noqa: F401
from ccxt.rest.bitmex import bitmex                                   # noqa: F401
from ccxt.rest.bitopro import bitopro                                 # noqa: F401
from ccxt.rest.bitpanda import bitpanda                               # noqa: F401
from ccxt.rest.bitrue import bitrue                                   # noqa: F401
from ccxt.rest.bitso import bitso                                     # noqa: F401
from ccxt.rest.bitstamp import bitstamp                               # noqa: F401
from ccxt.rest.bitstamp1 import bitstamp1                             # noqa: F401
from ccxt.rest.bittrex import bittrex                                 # noqa: F401
from ccxt.rest.bitvavo import bitvavo                                 # noqa: F401
from ccxt.rest.bkex import bkex                                       # noqa: F401
from ccxt.rest.bl3p import bl3p                                       # noqa: F401
from ccxt.rest.blockchaincom import blockchaincom                     # noqa: F401
from ccxt.rest.btcalpha import btcalpha                               # noqa: F401
from ccxt.rest.btcbox import btcbox                                   # noqa: F401
from ccxt.rest.btcex import btcex                                     # noqa: F401
from ccxt.rest.btcmarkets import btcmarkets                           # noqa: F401
from ccxt.rest.btctradeua import btctradeua                           # noqa: F401
from ccxt.rest.btcturk import btcturk                                 # noqa: F401
from ccxt.rest.buda import buda                                       # noqa: F401
from ccxt.rest.bw import bw                                           # noqa: F401
from ccxt.rest.bybit import bybit                                     # noqa: F401
from ccxt.rest.bytetrade import bytetrade                             # noqa: F401
from ccxt.rest.cdax import cdax                                       # noqa: F401
from ccxt.rest.cex import cex                                         # noqa: F401
from ccxt.rest.coinbase import coinbase                               # noqa: F401
from ccxt.rest.coinbaseprime import coinbaseprime                     # noqa: F401
from ccxt.rest.coinbasepro import coinbasepro                         # noqa: F401
from ccxt.rest.coincheck import coincheck                             # noqa: F401
from ccxt.rest.coinex import coinex                                   # noqa: F401
from ccxt.rest.coinfalcon import coinfalcon                           # noqa: F401
from ccxt.rest.coinmate import coinmate                               # noqa: F401
from ccxt.rest.coinone import coinone                                 # noqa: F401
from ccxt.rest.coinspot import coinspot                               # noqa: F401
from ccxt.rest.crex24 import crex24                                   # noqa: F401
from ccxt.rest.cryptocom import cryptocom                             # noqa: F401
from ccxt.rest.currencycom import currencycom                         # noqa: F401
from ccxt.rest.delta import delta                                     # noqa: F401
from ccxt.rest.deribit import deribit                                 # noqa: F401
from ccxt.rest.digifinex import digifinex                             # noqa: F401
from ccxt.rest.eqonex import eqonex                                   # noqa: F401
from ccxt.rest.exmo import exmo                                       # noqa: F401
from ccxt.rest.flowbtc import flowbtc                                 # noqa: F401
from ccxt.rest.fmfwio import fmfwio                                   # noqa: F401
from ccxt.rest.ftx import ftx                                         # noqa: F401
from ccxt.rest.ftxus import ftxus                                     # noqa: F401
from ccxt.rest.gate import gate                                       # noqa: F401
from ccxt.rest.gateio import gateio                                   # noqa: F401
from ccxt.rest.gemini import gemini                                   # noqa: F401
from ccxt.rest.hitbtc import hitbtc                                   # noqa: F401
from ccxt.rest.hitbtc3 import hitbtc3                                 # noqa: F401
from ccxt.rest.hollaex import hollaex                                 # noqa: F401
from ccxt.rest.huobi import huobi                                     # noqa: F401
from ccxt.rest.huobijp import huobijp                                 # noqa: F401
from ccxt.rest.huobipro import huobipro                               # noqa: F401
from ccxt.rest.idex import idex                                       # noqa: F401
from ccxt.rest.independentreserve import independentreserve           # noqa: F401
from ccxt.rest.indodax import indodax                                 # noqa: F401
from ccxt.rest.itbit import itbit                                     # noqa: F401
from ccxt.rest.kraken import kraken                                   # noqa: F401
from ccxt.rest.kucoin import kucoin                                   # noqa: F401
from ccxt.rest.kucoinfutures import kucoinfutures                     # noqa: F401
from ccxt.rest.kuna import kuna                                       # noqa: F401
from ccxt.rest.latoken import latoken                                 # noqa: F401
from ccxt.rest.lbank import lbank                                     # noqa: F401
from ccxt.rest.lbank2 import lbank2                                   # noqa: F401
from ccxt.rest.liquid import liquid                                   # noqa: F401
from ccxt.rest.luno import luno                                       # noqa: F401
from ccxt.rest.lykke import lykke                                     # noqa: F401
from ccxt.rest.mercado import mercado                                 # noqa: F401
from ccxt.rest.mexc import mexc                                       # noqa: F401
from ccxt.rest.mexc3 import mexc3                                     # noqa: F401
from ccxt.rest.ndax import ndax                                       # noqa: F401
from ccxt.rest.novadax import novadax                                 # noqa: F401
from ccxt.rest.oceanex import oceanex                                 # noqa: F401
from ccxt.rest.okcoin import okcoin                                   # noqa: F401
from ccxt.rest.okex import okex                                       # noqa: F401
from ccxt.rest.okex5 import okex5                                     # noqa: F401
from ccxt.rest.okx import okx                                         # noqa: F401
from ccxt.rest.paymium import paymium                                 # noqa: F401
from ccxt.rest.phemex import phemex                                   # noqa: F401
from ccxt.rest.poloniex import poloniex                               # noqa: F401
from ccxt.rest.probit import probit                                   # noqa: F401
from ccxt.rest.qtrade import qtrade                                   # noqa: F401
from ccxt.rest.ripio import ripio                                     # noqa: F401
from ccxt.rest.stex import stex                                       # noqa: F401
from ccxt.rest.therock import therock                                 # noqa: F401
from ccxt.rest.tidebit import tidebit                                 # noqa: F401
from ccxt.rest.tidex import tidex                                     # noqa: F401
from ccxt.rest.timex import timex                                     # noqa: F401
from ccxt.rest.tokocrypto import tokocrypto                           # noqa: F401
from ccxt.rest.upbit import upbit                                     # noqa: F401
from ccxt.rest.wavesexchange import wavesexchange                     # noqa: F401
from ccxt.rest.wazirx import wazirx                                   # noqa: F401
from ccxt.rest.whitebit import whitebit                               # noqa: F401
from ccxt.rest.woo import woo                                         # noqa: F401
from ccxt.rest.xena import xena                                       # noqa: F401
from ccxt.rest.yobit import yobit                                     # noqa: F401
from ccxt.rest.zaif import zaif                                       # noqa: F401
from ccxt.rest.zb import zb                                           # noqa: F401
from ccxt.rest.zipmex import zipmex                                   # noqa: F401
from ccxt.rest.zonda import zonda                                     # noqa: F401

exchanges = [
    'aax',
    'alpaca',
    'ascendex',
    'bequant',
    'bibox',
    'bigone',
    'binance',
    'binancecoinm',
    'binanceus',
    'binanceusdm',
    'bit2c',
    'bitbank',
    'bitbay',
    'bitbns',
    'bitcoincom',
    'bitfinex',
    'bitfinex2',
    'bitflyer',
    'bitforex',
    'bitget',
    'bithumb',
    'bitmart',
    'bitmex',
    'bitopro',
    'bitpanda',
    'bitrue',
    'bitso',
    'bitstamp',
    'bitstamp1',
    'bittrex',
    'bitvavo',
    'bkex',
    'bl3p',
    'blockchaincom',
    'btcalpha',
    'btcbox',
    'btcex',
    'btcmarkets',
    'btctradeua',
    'btcturk',
    'buda',
    'bw',
    'bybit',
    'bytetrade',
    'cdax',
    'cex',
    'coinbase',
    'coinbaseprime',
    'coinbasepro',
    'coincheck',
    'coinex',
    'coinfalcon',
    'coinmate',
    'coinone',
    'coinspot',
    'crex24',
    'cryptocom',
    'currencycom',
    'delta',
    'deribit',
    'digifinex',
    'eqonex',
    'exmo',
    'flowbtc',
    'fmfwio',
    'ftx',
    'ftxus',
    'gate',
    'gateio',
    'gemini',
    'hitbtc',
    'hitbtc3',
    'hollaex',
    'huobi',
    'huobijp',
    'huobipro',
    'idex',
    'independentreserve',
    'indodax',
    'itbit',
    'kraken',
    'kucoin',
    'kucoinfutures',
    'kuna',
    'latoken',
    'lbank',
    'lbank2',
    'liquid',
    'luno',
    'lykke',
    'mercado',
    'mexc',
    'mexc3',
    'ndax',
    'novadax',
    'oceanex',
    'okcoin',
    'okex',
    'okex5',
    'okx',
    'paymium',
    'phemex',
    'poloniex',
    'probit',
    'qtrade',
    'ripio',
    'stex',
    'therock',
    'tidebit',
    'tidex',
    'timex',
    'tokocrypto',
    'upbit',
    'wavesexchange',
    'wazirx',
    'whitebit',
    'woo',
    'xena',
    'yobit',
    'zaif',
    'zb',
    'zipmex',
    'zonda',
]

base = [
    'Exchange',
    'Precise',
    'exchanges',
    'decimal_to_precision',
]

__all__ = base + errors.__all__ + exchanges
