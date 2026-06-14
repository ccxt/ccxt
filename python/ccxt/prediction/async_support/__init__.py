# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Prediction Markets, Async)"""

# ----------------------------------------------------------------------------

__version__ = '4.5.58'

# ----------------------------------------------------------------------------

from ccxt.async_support.base.exchange import Exchange                  # noqa: F401
from ccxt.base.precise import Precise                                  # noqa: F401
from ccxt.base.decimal_to_precision import decimal_to_precision        # noqa: F401

from ccxt.base.errors import BaseError                                 # noqa: F401
from ccxt.base.errors import ExchangeError                             # noqa: F401
from ccxt.base.errors import NotSupported                              # noqa: F401
from ccxt.base.errors import error_hierarchy                           # noqa: F401

from ccxt.prediction.async_support.hyperliquid import hyperliquid                         # noqa: F401
from ccxt.prediction.async_support.kalshi import kalshi                                   # noqa: F401
from ccxt.prediction.async_support.limitless import limitless                             # noqa: F401
from ccxt.prediction.async_support.myriad import myriad                                   # noqa: F401
from ccxt.prediction.async_support.polymarket import polymarket                           # noqa: F401

exchanges = [
    'hyperliquid',
    'kalshi',
    'limitless',
    'myriad',
    'polymarket',
]

base = [
    'Exchange',
    'Precise',
    'exchanges',
    'decimal_to_precision',
]

__all__ = base + exchanges
