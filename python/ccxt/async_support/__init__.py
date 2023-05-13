# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Async)"""

# -----------------------------------------------------------------------------

__version__ = '3.0.102'

# -----------------------------------------------------------------------------

from ccxt.async_support.base.exchange import Exchange                   # noqa: F401

from ccxt.base.decimal_to_precision import decimal_to_precision  # noqa: F401
from ccxt.base.decimal_to_precision import TRUNCATE              # noqa: F401
from ccxt.base.decimal_to_precision import ROUND                 # noqa: F401
from ccxt.base.decimal_to_precision import TICK_SIZE             # noqa: F401
from ccxt.base.decimal_to_precision import DECIMAL_PLACES        # noqa: F401
from ccxt.base.decimal_to_precision import SIGNIFICANT_DIGITS    # noqa: F401
from ccxt.base.decimal_to_precision import NO_PADDING            # noqa: F401
from ccxt.base.decimal_to_precision import PAD_WITH_ZERO         # noqa: F401

from ccxt.base import errors                                # noqa: F401
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


from ccxt.async_support.ace import ace                                          # noqa: F401
from ccxt.async_support.alpaca import alpaca                                    # noqa: F401
from ccxt.async_support.ascendex import ascendex                                # noqa: F401
from ccxt.async_support.bequant import bequant                                  # noqa: F401
from ccxt.async_support.bigone import bigone                                    # noqa: F401
from ccxt.async_support.binance import binance                                  # noqa: F401
from ccxt.async_support.binancecoinm import binancecoinm                        # noqa: F401
from ccxt.async_support.binanceus import binanceus                              # noqa: F401
from ccxt.async_support.binanceusdm import binanceusdm                          # noqa: F401
from ccxt.async_support.bit2c import bit2c                                      # noqa: F401
from ccxt.async_support.bitbank import bitbank                                  # noqa: F401
from ccxt.async_support.bitbay import bitbay                                    # noqa: F401
from ccxt.async_support.bitbns import bitbns                                    # noqa: F401
from ccxt.async_support.bitcoincom import bitcoincom                            # noqa: F401
from ccxt.async_support.bitfinex import bitfinex                                # noqa: F401
from ccxt.async_support.bitfinex2 import bitfinex2                              # noqa: F401
from ccxt.async_support.bitflyer import bitflyer                                # noqa: F401
from ccxt.async_support.bitforex import bitforex                                # noqa: F401
from ccxt.async_support.bitget import bitget                                    # noqa: F401
from ccxt.async_support.bithumb import bithumb                                  # noqa: F401
from ccxt.async_support.bitmart import bitmart                                  # noqa: F401
from ccxt.async_support.bitmex import bitmex                                    # noqa: F401
from ccxt.async_support.bitopro import bitopro                                  # noqa: F401
from ccxt.async_support.bitpanda import bitpanda                                # noqa: F401
from ccxt.async_support.bitrue import bitrue                                    # noqa: F401
from ccxt.async_support.bitso import bitso                                      # noqa: F401
from ccxt.async_support.bitstamp import bitstamp                                # noqa: F401
from ccxt.async_support.bitstamp1 import bitstamp1                              # noqa: F401
from ccxt.async_support.bittrex import bittrex                                  # noqa: F401
from ccxt.async_support.bitvavo import bitvavo                                  # noqa: F401
from ccxt.async_support.bkex import bkex                                        # noqa: F401
from ccxt.async_support.bl3p import bl3p                                        # noqa: F401
from ccxt.async_support.blockchaincom import blockchaincom                      # noqa: F401
from ccxt.async_support.btcalpha import btcalpha                                # noqa: F401
from ccxt.async_support.btcbox import btcbox                                    # noqa: F401
from ccxt.async_support.btcex import btcex                                      # noqa: F401
from ccxt.async_support.btcmarkets import btcmarkets                            # noqa: F401
from ccxt.async_support.btctradeua import btctradeua                            # noqa: F401
from ccxt.async_support.btcturk import btcturk                                  # noqa: F401
from ccxt.async_support.bybit import bybit                                      # noqa: F401
from ccxt.async_support.cex import cex                                          # noqa: F401
from ccxt.async_support.coinbase import coinbase                                # noqa: F401
from ccxt.async_support.coinbaseprime import coinbaseprime                      # noqa: F401
from ccxt.async_support.coinbasepro import coinbasepro                          # noqa: F401
from ccxt.async_support.coincheck import coincheck                              # noqa: F401
from ccxt.async_support.coinex import coinex                                    # noqa: F401
from ccxt.async_support.coinfalcon import coinfalcon                            # noqa: F401
from ccxt.async_support.coinmate import coinmate                                # noqa: F401
from ccxt.async_support.coinone import coinone                                  # noqa: F401
from ccxt.async_support.coinsph import coinsph                                  # noqa: F401
from ccxt.async_support.coinspot import coinspot                                # noqa: F401
from ccxt.async_support.cryptocom import cryptocom                              # noqa: F401
from ccxt.async_support.currencycom import currencycom                          # noqa: F401
from ccxt.async_support.delta import delta                                      # noqa: F401
from ccxt.async_support.deribit import deribit                                  # noqa: F401
from ccxt.async_support.digifinex import digifinex                              # noqa: F401
from ccxt.async_support.exmo import exmo                                        # noqa: F401
from ccxt.async_support.fmfwio import fmfwio                                    # noqa: F401
from ccxt.async_support.gate import gate                                        # noqa: F401
from ccxt.async_support.gateio import gateio                                    # noqa: F401
from ccxt.async_support.gemini import gemini                                    # noqa: F401
from ccxt.async_support.hitbtc import hitbtc                                    # noqa: F401
from ccxt.async_support.hitbtc3 import hitbtc3                                  # noqa: F401
from ccxt.async_support.hollaex import hollaex                                  # noqa: F401
from ccxt.async_support.huobi import huobi                                      # noqa: F401
from ccxt.async_support.huobijp import huobijp                                  # noqa: F401
from ccxt.async_support.huobipro import huobipro                                # noqa: F401
from ccxt.async_support.idex import idex                                        # noqa: F401
from ccxt.async_support.independentreserve import independentreserve            # noqa: F401
from ccxt.async_support.indodax import indodax                                  # noqa: F401
from ccxt.async_support.kraken import kraken                                    # noqa: F401
from ccxt.async_support.krakenfutures import krakenfutures                      # noqa: F401
from ccxt.async_support.kucoin import kucoin                                    # noqa: F401
from ccxt.async_support.kucoinfutures import kucoinfutures                      # noqa: F401
from ccxt.async_support.kuna import kuna                                        # noqa: F401
from ccxt.async_support.latoken import latoken                                  # noqa: F401
from ccxt.async_support.lbank import lbank                                      # noqa: F401
from ccxt.async_support.lbank2 import lbank2                                    # noqa: F401
from ccxt.async_support.luno import luno                                        # noqa: F401
from ccxt.async_support.lykke import lykke                                      # noqa: F401
from ccxt.async_support.mercado import mercado                                  # noqa: F401
from ccxt.async_support.mexc import mexc                                        # noqa: F401
from ccxt.async_support.mexc3 import mexc3                                      # noqa: F401
from ccxt.async_support.ndax import ndax                                        # noqa: F401
from ccxt.async_support.novadax import novadax                                  # noqa: F401
from ccxt.async_support.oceanex import oceanex                                  # noqa: F401
from ccxt.async_support.okcoin import okcoin                                    # noqa: F401
from ccxt.async_support.okex import okex                                        # noqa: F401
from ccxt.async_support.okex5 import okex5                                      # noqa: F401
from ccxt.async_support.okx import okx                                          # noqa: F401
from ccxt.async_support.paymium import paymium                                  # noqa: F401
from ccxt.async_support.phemex import phemex                                    # noqa: F401
from ccxt.async_support.poloniex import poloniex                                # noqa: F401
from ccxt.async_support.poloniexfutures import poloniexfutures                  # noqa: F401
from ccxt.async_support.probit import probit                                    # noqa: F401
from ccxt.async_support.stex import stex                                        # noqa: F401
from ccxt.async_support.tidex import tidex                                      # noqa: F401
from ccxt.async_support.timex import timex                                      # noqa: F401
from ccxt.async_support.tokocrypto import tokocrypto                            # noqa: F401
from ccxt.async_support.upbit import upbit                                      # noqa: F401
from ccxt.async_support.wavesexchange import wavesexchange                      # noqa: F401
from ccxt.async_support.wazirx import wazirx                                    # noqa: F401
from ccxt.async_support.whitebit import whitebit                                # noqa: F401
from ccxt.async_support.woo import woo                                          # noqa: F401
from ccxt.async_support.xt import xt                                            # noqa: F401
from ccxt.async_support.yobit import yobit                                      # noqa: F401
from ccxt.async_support.zaif import zaif                                        # noqa: F401
from ccxt.async_support.zonda import zonda                                      # noqa: F401

exchanges = [
    'ace',
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
    'coinsph',
    'coinspot',
    'cryptocom',
    'currencycom',
    'delta',
    'deribit',
    'digifinex',
    'exmo',
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
    'kraken',
    'krakenfutures',
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
    'poloniexfutures',
    'probit',
    'stex',
    'tidex',
    'timex',
    'tokocrypto',
    'upbit',
    'wavesexchange',
    'wazirx',
    'whitebit',
    'woo',
    'xt',
    'yobit',
    'zaif',
    'zonda',
]

base = [
    'Exchange',
    'exchanges',
    'decimal_to_precision',
]

__all__ = base + errors.__all__ + exchanges
