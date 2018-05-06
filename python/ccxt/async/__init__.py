# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Async)"""

# -----------------------------------------------------------------------------

__version__ = '1.13.95'

# -----------------------------------------------------------------------------

from ccxt.async.base.exchange import Exchange                   # noqa: F401

from ccxt.base.decimal_to_precision import decimal_to_precision  # noqa: F401
from ccxt.base.decimal_to_precision import TRUNCATE              # noqa: F401
from ccxt.base.decimal_to_precision import ROUND                 # noqa: F401
from ccxt.base.decimal_to_precision import DECIMAL_PLACES        # noqa: F401
from ccxt.base.decimal_to_precision import SIGNIFICANT_DIGITS    # noqa: F401
from ccxt.base.decimal_to_precision import NO_PADDING            # noqa: F401
from ccxt.base.decimal_to_precision import PAD_WITH_ZERO         # noqa: F401

from ccxt.base import errors                                    # noqa: F401
from ccxt.base.errors import BaseError                          # noqa: F401
from ccxt.base.errors import ExchangeError                      # noqa: F401
from ccxt.base.errors import NotSupported                       # noqa: F401
from ccxt.base.errors import AuthenticationError                # noqa: F401
from ccxt.base.errors import PermissionDenied                   # noqa: F401
from ccxt.base.errors import InvalidNonce                       # noqa: F401
from ccxt.base.errors import InsufficientFunds                  # noqa: F401
from ccxt.base.errors import InvalidOrder                       # noqa: F401
from ccxt.base.errors import OrderNotFound                      # noqa: F401
from ccxt.base.errors import OrderNotCached                     # noqa: F401
from ccxt.base.errors import CancelPending                      # noqa: F401
from ccxt.base.errors import NetworkError                       # noqa: F401
from ccxt.base.errors import DDoSProtection                     # noqa: F401
from ccxt.base.errors import RequestTimeout                     # noqa: F401
from ccxt.base.errors import ExchangeNotAvailable               # noqa: F401
from ccxt.base.errors import InvalidAddress                     # noqa: F401

from ccxt.async._1broker import _1broker                        # noqa: F401
from ccxt.async._1btcxe import _1btcxe                          # noqa: F401
from ccxt.async.acx import acx                                  # noqa: F401
from ccxt.async.allcoin import allcoin                          # noqa: F401
from ccxt.async.anxpro import anxpro                            # noqa: F401
from ccxt.async.bibox import bibox                              # noqa: F401
from ccxt.async.binance import binance                          # noqa: F401
from ccxt.async.bit2c import bit2c                              # noqa: F401
from ccxt.async.bitbank import bitbank                          # noqa: F401
from ccxt.async.bitbay import bitbay                            # noqa: F401
from ccxt.async.bitfinex import bitfinex                        # noqa: F401
from ccxt.async.bitfinex2 import bitfinex2                      # noqa: F401
from ccxt.async.bitflyer import bitflyer                        # noqa: F401
from ccxt.async.bithumb import bithumb                          # noqa: F401
from ccxt.async.bitkk import bitkk                              # noqa: F401
from ccxt.async.bitlish import bitlish                          # noqa: F401
from ccxt.async.bitmarket import bitmarket                      # noqa: F401
from ccxt.async.bitmex import bitmex                            # noqa: F401
from ccxt.async.bitso import bitso                              # noqa: F401
from ccxt.async.bitstamp import bitstamp                        # noqa: F401
from ccxt.async.bitstamp1 import bitstamp1                      # noqa: F401
from ccxt.async.bittrex import bittrex                          # noqa: F401
from ccxt.async.bitz import bitz                                # noqa: F401
from ccxt.async.bl3p import bl3p                                # noqa: F401
from ccxt.async.bleutrade import bleutrade                      # noqa: F401
from ccxt.async.braziliex import braziliex                      # noqa: F401
from ccxt.async.btcbox import btcbox                            # noqa: F401
from ccxt.async.btcchina import btcchina                        # noqa: F401
from ccxt.async.btcexchange import btcexchange                  # noqa: F401
from ccxt.async.btcmarkets import btcmarkets                    # noqa: F401
from ccxt.async.btctradeim import btctradeim                    # noqa: F401
from ccxt.async.btctradeua import btctradeua                    # noqa: F401
from ccxt.async.btcturk import btcturk                          # noqa: F401
from ccxt.async.btcx import btcx                                # noqa: F401
from ccxt.async.bxinth import bxinth                            # noqa: F401
from ccxt.async.ccex import ccex                                # noqa: F401
from ccxt.async.cex import cex                                  # noqa: F401
from ccxt.async.chbtc import chbtc                              # noqa: F401
from ccxt.async.chilebit import chilebit                        # noqa: F401
from ccxt.async.cobinhood import cobinhood                      # noqa: F401
from ccxt.async.coincheck import coincheck                      # noqa: F401
from ccxt.async.coinegg import coinegg                          # noqa: F401
from ccxt.async.coinex import coinex                            # noqa: F401
from ccxt.async.coinexchange import coinexchange                # noqa: F401
from ccxt.async.coinfloor import coinfloor                      # noqa: F401
from ccxt.async.coingi import coingi                            # noqa: F401
from ccxt.async.coinmarketcap import coinmarketcap              # noqa: F401
from ccxt.async.coinmate import coinmate                        # noqa: F401
from ccxt.async.coinnest import coinnest                        # noqa: F401
from ccxt.async.coinone import coinone                          # noqa: F401
from ccxt.async.coinsecure import coinsecure                    # noqa: F401
from ccxt.async.coinspot import coinspot                        # noqa: F401
from ccxt.async.coolcoin import coolcoin                        # noqa: F401
from ccxt.async.cryptopia import cryptopia                      # noqa: F401
from ccxt.async.dsx import dsx                                  # noqa: F401
from ccxt.async.ethfinex import ethfinex                        # noqa: F401
from ccxt.async.exmo import exmo                                # noqa: F401
from ccxt.async.exx import exx                                  # noqa: F401
from ccxt.async.flowbtc import flowbtc                          # noqa: F401
from ccxt.async.foxbit import foxbit                            # noqa: F401
from ccxt.async.fybse import fybse                              # noqa: F401
from ccxt.async.fybsg import fybsg                              # noqa: F401
from ccxt.async.gatecoin import gatecoin                        # noqa: F401
from ccxt.async.gateio import gateio                            # noqa: F401
from ccxt.async.gdax import gdax                                # noqa: F401
from ccxt.async.gemini import gemini                            # noqa: F401
from ccxt.async.getbtc import getbtc                            # noqa: F401
from ccxt.async.hadax import hadax                              # noqa: F401
from ccxt.async.hitbtc import hitbtc                            # noqa: F401
from ccxt.async.hitbtc2 import hitbtc2                          # noqa: F401
from ccxt.async.huobi import huobi                              # noqa: F401
from ccxt.async.huobicny import huobicny                        # noqa: F401
from ccxt.async.huobipro import huobipro                        # noqa: F401
from ccxt.async.ice3x import ice3x                              # noqa: F401
from ccxt.async.independentreserve import independentreserve    # noqa: F401
from ccxt.async.indodax import indodax                          # noqa: F401
from ccxt.async.itbit import itbit                              # noqa: F401
from ccxt.async.jubi import jubi                                # noqa: F401
from ccxt.async.kraken import kraken                            # noqa: F401
from ccxt.async.kucoin import kucoin                            # noqa: F401
from ccxt.async.kuna import kuna                                # noqa: F401
from ccxt.async.lakebtc import lakebtc                          # noqa: F401
from ccxt.async.lbank import lbank                              # noqa: F401
from ccxt.async.liqui import liqui                              # noqa: F401
from ccxt.async.livecoin import livecoin                        # noqa: F401
from ccxt.async.luno import luno                                # noqa: F401
from ccxt.async.lykke import lykke                              # noqa: F401
from ccxt.async.mercado import mercado                          # noqa: F401
from ccxt.async.mixcoins import mixcoins                        # noqa: F401
from ccxt.async.negociecoins import negociecoins                # noqa: F401
from ccxt.async.nova import nova                                # noqa: F401
from ccxt.async.okcoincny import okcoincny                      # noqa: F401
from ccxt.async.okcoinusd import okcoinusd                      # noqa: F401
from ccxt.async.okex import okex                                # noqa: F401
from ccxt.async.paymium import paymium                          # noqa: F401
from ccxt.async.poloniex import poloniex                        # noqa: F401
from ccxt.async.qryptos import qryptos                          # noqa: F401
from ccxt.async.quadrigacx import quadrigacx                    # noqa: F401
from ccxt.async.quoinex import quoinex                          # noqa: F401
from ccxt.async.southxchange import southxchange                # noqa: F401
from ccxt.async.surbitcoin import surbitcoin                    # noqa: F401
from ccxt.async.therock import therock                          # noqa: F401
from ccxt.async.tidebit import tidebit                          # noqa: F401
from ccxt.async.tidex import tidex                              # noqa: F401
from ccxt.async.urdubit import urdubit                          # noqa: F401
from ccxt.async.vaultoro import vaultoro                        # noqa: F401
from ccxt.async.vbtc import vbtc                                # noqa: F401
from ccxt.async.virwox import virwox                            # noqa: F401
from ccxt.async.wex import wex                                  # noqa: F401
from ccxt.async.xbtce import xbtce                              # noqa: F401
from ccxt.async.yobit import yobit                              # noqa: F401
from ccxt.async.yunbi import yunbi                              # noqa: F401
from ccxt.async.zaif import zaif                                # noqa: F401
from ccxt.async.zb import zb                                    # noqa: F401

exchanges = [
    '_1broker',
    '_1btcxe',
    'acx',
    'allcoin',
    'anxpro',
    'bibox',
    'binance',
    'bit2c',
    'bitbank',
    'bitbay',
    'bitfinex',
    'bitfinex2',
    'bitflyer',
    'bithumb',
    'bitkk',
    'bitlish',
    'bitmarket',
    'bitmex',
    'bitso',
    'bitstamp',
    'bitstamp1',
    'bittrex',
    'bitz',
    'bl3p',
    'bleutrade',
    'braziliex',
    'btcbox',
    'btcchina',
    'btcexchange',
    'btcmarkets',
    'btctradeim',
    'btctradeua',
    'btcturk',
    'btcx',
    'bxinth',
    'ccex',
    'cex',
    'chbtc',
    'chilebit',
    'cobinhood',
    'coincheck',
    'coinegg',
    'coinex',
    'coinexchange',
    'coinfloor',
    'coingi',
    'coinmarketcap',
    'coinmate',
    'coinnest',
    'coinone',
    'coinsecure',
    'coinspot',
    'coolcoin',
    'cryptopia',
    'dsx',
    'ethfinex',
    'exmo',
    'exx',
    'flowbtc',
    'foxbit',
    'fybse',
    'fybsg',
    'gatecoin',
    'gateio',
    'gdax',
    'gemini',
    'getbtc',
    'hadax',
    'hitbtc',
    'hitbtc2',
    'huobi',
    'huobicny',
    'huobipro',
    'ice3x',
    'independentreserve',
    'indodax',
    'itbit',
    'jubi',
    'kraken',
    'kucoin',
    'kuna',
    'lakebtc',
    'lbank',
    'liqui',
    'livecoin',
    'luno',
    'lykke',
    'mercado',
    'mixcoins',
    'negociecoins',
    'nova',
    'okcoincny',
    'okcoinusd',
    'okex',
    'paymium',
    'poloniex',
    'qryptos',
    'quadrigacx',
    'quoinex',
    'southxchange',
    'surbitcoin',
    'therock',
    'tidebit',
    'tidex',
    'urdubit',
    'vaultoro',
    'vbtc',
    'virwox',
    'wex',
    'xbtce',
    'yobit',
    'yunbi',
    'zaif',
    'zb',
]

base = [
    'Exchange',
    'exchanges',
    'decimal_to_precision',
]

__all__ = base + errors.__all__ + exchanges
