# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library"""

# ----------------------------------------------------------------------------

__version__ = '1.9.287'

# ----------------------------------------------------------------------------

from ccxt.base.exchange import Exchange            # noqa: F401

from ccxt.base import errors                       # noqa: F401
from ccxt.base.errors import BaseError             # noqa: F401
from ccxt.base.errors import ExchangeError         # noqa: F401
from ccxt.base.errors import NotSupported          # noqa: F401
from ccxt.base.errors import AuthenticationError   # noqa: F401
from ccxt.base.errors import InsufficientFunds     # noqa: F401
from ccxt.base.errors import InvalidOrder          # noqa: F401
from ccxt.base.errors import OrderNotFound         # noqa: F401
from ccxt.base.errors import OrderNotCached        # noqa: F401
from ccxt.base.errors import NetworkError          # noqa: F401
from ccxt.base.errors import DDoSProtection        # noqa: F401
from ccxt.base.errors import RequestTimeout        # noqa: F401
from ccxt.base.errors import ExchangeNotAvailable  # noqa: F401

from ccxt._1broker import _1broker
from ccxt._1btcxe import _1btcxe
from ccxt.acx import acx
from ccxt.allcoin import allcoin
from ccxt.anxpro import anxpro
from ccxt.binance import binance
from ccxt.bit2c import bit2c
from ccxt.bitbay import bitbay
from ccxt.bitcoincoid import bitcoincoid
from ccxt.bitfinex import bitfinex
from ccxt.bitfinex2 import bitfinex2
from ccxt.bitflyer import bitflyer
from ccxt.bithumb import bithumb
from ccxt.bitlish import bitlish
from ccxt.bitmarket import bitmarket
from ccxt.bitmex import bitmex
from ccxt.bitso import bitso
from ccxt.bitstamp1 import bitstamp1
from ccxt.bitstamp import bitstamp
from ccxt.bittrex import bittrex
from ccxt.bl3p import bl3p
from ccxt.bleutrade import bleutrade
from ccxt.btcbox import btcbox
from ccxt.btcchina import btcchina
from ccxt.btcmarkets import btcmarkets
from ccxt.btctradeua import btctradeua
from ccxt.btcturk import btcturk
from ccxt.btcx import btcx
from ccxt.bter import bter
from ccxt.bxinth import bxinth
from ccxt.ccex import ccex
from ccxt.cex import cex
from ccxt.chbtc import chbtc
from ccxt.chilebit import chilebit
from ccxt.coincheck import coincheck
from ccxt.coinfloor import coinfloor
from ccxt.coingi import coingi
from ccxt.coinmarketcap import coinmarketcap
from ccxt.coinmate import coinmate
from ccxt.coinsecure import coinsecure
from ccxt.coinspot import coinspot
from ccxt.cryptopia import cryptopia
from ccxt.dsx import dsx
from ccxt.exmo import exmo
from ccxt.flowbtc import flowbtc
from ccxt.foxbit import foxbit
from ccxt.fybse import fybse
from ccxt.fybsg import fybsg
from ccxt.gatecoin import gatecoin
from ccxt.gateio import gateio
from ccxt.gdax import gdax
from ccxt.gemini import gemini
from ccxt.hitbtc import hitbtc
from ccxt.hitbtc2 import hitbtc2
from ccxt.huobi import huobi
from ccxt.huobicny import huobicny
from ccxt.huobipro import huobipro
from ccxt.independentreserve import independentreserve
from ccxt.itbit import itbit
from ccxt.jubi import jubi
from ccxt.kraken import kraken
from ccxt.kuna import kuna
from ccxt.lakebtc import lakebtc
from ccxt.livecoin import livecoin
from ccxt.liqui import liqui
from ccxt.luno import luno
from ccxt.mercado import mercado
from ccxt.mixcoins import mixcoins
from ccxt.nova import nova
from ccxt.okcoincny import okcoincny
from ccxt.okcoinusd import okcoinusd
from ccxt.okex import okex
from ccxt.paymium import paymium
from ccxt.poloniex import poloniex
from ccxt.quadrigacx import quadrigacx
from ccxt.qryptos import qryptos
from ccxt.quoine import quoine
from ccxt.southxchange import southxchange
from ccxt.surbitcoin import surbitcoin
from ccxt.tidex import tidex
from ccxt.therock import therock
from ccxt.urdubit import urdubit
from ccxt.vaultoro import vaultoro
from ccxt.vbtc import vbtc
from ccxt.virwox import virwox
from ccxt.wex import wex
from ccxt.xbtce import xbtce
from ccxt.yobit import yobit
from ccxt.yunbi import yunbi
from ccxt.zaif import zaif

exchanges = [
    '_1broker',
    '_1btcxe',
    'acx',
    'allcoin',
    'anxpro',
    'binance',
    'bit2c',
    'bitbay',
    'bitcoincoid',
    'bitfinex',
    'bitfinex2',
    'bitflyer',
    'bithumb',
    'bitlish',
    'bitmarket',
    'bitmex',
    'bitso',
    'bitstamp1',
    'bitstamp',
    'bittrex',
    'bl3p',
    'bleutrade',
    'btcbox',
    'btcchina',
    'btcmarkets',
    'btctradeua',
    'btcturk',
    'btcx',
    'bter',
    'bxinth',
    'ccex',
    'cex',
    'chbtc',
    'chilebit',
    'coincheck',
    'coinfloor',
    'coingi',
    'coinmarketcap',
    'coinmate',
    'coinsecure',
    'coinspot',
    'cryptopia',
    'dsx',
    'exmo',
    'flowbtc',
    'foxbit',
    'fybse',
    'fybsg',
    'gatecoin',
    'gateio',
    'gdax',
    'gemini',
    'hitbtc',
    'hitbtc2',
    'huobi',
    'huobicny',
    'huobipro',
    'independentreserve',
    'itbit',
    'jubi',
    'kraken',
    'kuna',
    'lakebtc',
    'livecoin',
    'liqui',
    'luno',
    'mercado',
    'mixcoins',
    'nova',
    'okcoincny',
    'okcoinusd',
    'okex',
    'paymium',
    'poloniex',
    'quadrigacx',
    'qryptos',
    'quoine',
    'southxchange',
    'surbitcoin',
    'tidex',
    'therock',
    'urdubit',
    'vaultoro',
    'vbtc',
    'virwox',
    'wex',
    'xbtce',
    'yobit',
    'yunbi',
    'zaif',
]

base = [
    'Exchange',
    'exchanges',
]

__all__ = base + errors.__all__ + exchanges