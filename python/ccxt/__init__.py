# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library"""

# ----------------------------------------------------------------------------

__version__ = '1.9.285'

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
    'btcx',
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
