# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Async)"""

# -----------------------------------------------------------------------------

__version__ = '1.9.287'

# -----------------------------------------------------------------------------

from ccxt.async.base import Exchange        # noqa: F401

from ccxt.base import errors                # noqa: F401
from ccxt.base import BaseError             # noqa: F401
from ccxt.base import ExchangeError         # noqa: F401
from ccxt.base import NotSupported          # noqa: F401
from ccxt.base import AuthenticationError   # noqa: F401
from ccxt.base import InsufficientFunds     # noqa: F401
from ccxt.base import InvalidOrder          # noqa: F401
from ccxt.base import OrderNotFound         # noqa: F401
from ccxt.base import OrderNotCached        # noqa: F401
from ccxt.base import NetworkError          # noqa: F401
from ccxt.base import DDoSProtection        # noqa: F401
from ccxt.base import RequestTimeout        # noqa: F401
from ccxt.base import ExchangeNotAvailable  # noqa: F401

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
