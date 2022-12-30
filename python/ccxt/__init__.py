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

__version__ = '2.4.79'

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

from ccxt.alpaca import alpaca                                        # noqa: F401
from ccxt.ascendex import ascendex                                    # noqa: F401
from ccxt.bequant import bequant                                      # noqa: F401
from ccxt.bigone import bigone                                        # noqa: F401
from ccxt.binance import binance                                      # noqa: F401
from ccxt.binancecoinm import binancecoinm                            # noqa: F401
from ccxt.binanceus import binanceus                                  # noqa: F401
from ccxt.binanceusdm import binanceusdm                              # noqa: F401
from ccxt.bit2c import bit2c                                          # noqa: F401
from ccxt.bitbank import bitbank                                      # noqa: F401
from ccxt.bitbay import bitbay                                        # noqa: F401
from ccxt.bitbns import bitbns                                        # noqa: F401
from ccxt.bitcoincom import bitcoincom                                # noqa: F401
from ccxt.bitfinex import bitfinex                                    # noqa: F401
from ccxt.bitfinex2 import bitfinex2                                  # noqa: F401
from ccxt.bitflyer import bitflyer                                    # noqa: F401
from ccxt.bitforex import bitforex                                    # noqa: F401
from ccxt.bitget import bitget                                        # noqa: F401
from ccxt.bithumb import bithumb                                      # noqa: F401
from ccxt.bitmart import bitmart                                      # noqa: F401
from ccxt.bitmex import bitmex                                        # noqa: F401
from ccxt.bitopro import bitopro                                      # noqa: F401
from ccxt.bitpanda import bitpanda                                    # noqa: F401
from ccxt.bitrue import bitrue                                        # noqa: F401
from ccxt.bitso import bitso                                          # noqa: F401
from ccxt.bitstamp import bitstamp                                    # noqa: F401
from ccxt.bitstamp1 import bitstamp1                                  # noqa: F401
from ccxt.bittrex import bittrex                                      # noqa: F401
from ccxt.bitvavo import bitvavo                                      # noqa: F401
from ccxt.bkex import bkex                                            # noqa: F401
from ccxt.bl3p import bl3p                                            # noqa: F401
from ccxt.blockchaincom import blockchaincom                          # noqa: F401
from ccxt.btcalpha import btcalpha                                    # noqa: F401
from ccxt.btcbox import btcbox                                        # noqa: F401
from ccxt.btcex import btcex                                          # noqa: F401
from ccxt.btcmarkets import btcmarkets                                # noqa: F401
from ccxt.btctradeua import btctradeua                                # noqa: F401
from ccxt.btcturk import btcturk                                      # noqa: F401
from ccxt.buda import buda                                            # noqa: F401
from ccxt.bybit import bybit                                          # noqa: F401
from ccxt.cex import cex                                              # noqa: F401
from ccxt.coinbase import coinbase                                    # noqa: F401
from ccxt.coinbaseprime import coinbaseprime                          # noqa: F401
from ccxt.coinbasepro import coinbasepro                              # noqa: F401
from ccxt.coincheck import coincheck                                  # noqa: F401
from ccxt.coinex import coinex                                        # noqa: F401
from ccxt.coinfalcon import coinfalcon                                # noqa: F401
from ccxt.coinmate import coinmate                                    # noqa: F401
from ccxt.coinone import coinone                                      # noqa: F401
from ccxt.coinspot import coinspot                                    # noqa: F401
from ccxt.cryptocom import cryptocom                                  # noqa: F401
from ccxt.currencycom import currencycom                              # noqa: F401
from ccxt.delta import delta                                          # noqa: F401
from ccxt.deribit import deribit                                      # noqa: F401
from ccxt.digifinex import digifinex                                  # noqa: F401
from ccxt.exmo import exmo                                            # noqa: F401
from ccxt.flowbtc import flowbtc                                      # noqa: F401
from ccxt.fmfwio import fmfwio                                        # noqa: F401
from ccxt.gate import gate                                            # noqa: F401
from ccxt.gateio import gateio                                        # noqa: F401
from ccxt.gemini import gemini                                        # noqa: F401
from ccxt.hitbtc import hitbtc                                        # noqa: F401
from ccxt.hitbtc3 import hitbtc3                                      # noqa: F401
from ccxt.hollaex import hollaex                                      # noqa: F401
from ccxt.huobi import huobi                                          # noqa: F401
from ccxt.huobijp import huobijp                                      # noqa: F401
from ccxt.huobipro import huobipro                                    # noqa: F401
from ccxt.idex import idex                                            # noqa: F401
from ccxt.independentreserve import independentreserve                # noqa: F401
from ccxt.indodax import indodax                                      # noqa: F401
from ccxt.itbit import itbit                                          # noqa: F401
from ccxt.kraken import kraken                                        # noqa: F401
from ccxt.kucoin import kucoin                                        # noqa: F401
from ccxt.kucoinfutures import kucoinfutures                          # noqa: F401
from ccxt.kuna import kuna                                            # noqa: F401
from ccxt.latoken import latoken                                      # noqa: F401
from ccxt.lbank import lbank                                          # noqa: F401
from ccxt.lbank2 import lbank2                                        # noqa: F401
from ccxt.luno import luno                                            # noqa: F401
from ccxt.lykke import lykke                                          # noqa: F401
from ccxt.mercado import mercado                                      # noqa: F401
from ccxt.mexc import mexc                                            # noqa: F401
from ccxt.mexc3 import mexc3                                          # noqa: F401
from ccxt.ndax import ndax                                            # noqa: F401
from ccxt.novadax import novadax                                      # noqa: F401
from ccxt.oceanex import oceanex                                      # noqa: F401
from ccxt.okcoin import okcoin                                        # noqa: F401
from ccxt.okex import okex                                            # noqa: F401
from ccxt.okex5 import okex5                                          # noqa: F401
from ccxt.okx import okx                                              # noqa: F401
from ccxt.paymium import paymium                                      # noqa: F401
from ccxt.phemex import phemex                                        # noqa: F401
from ccxt.poloniex import poloniex                                    # noqa: F401
from ccxt.probit import probit                                        # noqa: F401
from ccxt.ripio import ripio                                          # noqa: F401
from ccxt.stex import stex                                            # noqa: F401
from ccxt.therock import therock                                      # noqa: F401
from ccxt.tidex import tidex                                          # noqa: F401
from ccxt.timex import timex                                          # noqa: F401
from ccxt.tokocrypto import tokocrypto                                # noqa: F401
from ccxt.upbit import upbit                                          # noqa: F401
from ccxt.wavesexchange import wavesexchange                          # noqa: F401
from ccxt.wazirx import wazirx                                        # noqa: F401
from ccxt.whitebit import whitebit                                    # noqa: F401
from ccxt.woo import woo                                              # noqa: F401
from ccxt.yobit import yobit                                          # noqa: F401
from ccxt.zaif import zaif                                            # noqa: F401
from ccxt.zb import zb                                                # noqa: F401
from ccxt.zipmex import zipmex                                        # noqa: F401
from ccxt.zonda import zonda                                          # noqa: F401

exchanges = [
    'alpaca',
    'ascendex',
    'bequant',
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
    'bybit',
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
    'cryptocom',
    'currencycom',
    'delta',
    'deribit',
    'digifinex',
    'exmo',
    'flowbtc',
    'fmfwio',
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
    'ripio',
    'stex',
    'therock',
    'tidex',
    'timex',
    'tokocrypto',
    'upbit',
    'wavesexchange',
    'wazirx',
    'whitebit',
    'woo',
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
