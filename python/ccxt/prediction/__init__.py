# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Prediction Markets)"""

# ----------------------------------------------------------------------------

__version__ = '4.5.58'

# ----------------------------------------------------------------------------

from ccxt.base.exchange import Exchange                                # noqa: F401
from ccxt.base.precise import Precise                                  # noqa: F401
from ccxt.base.decimal_to_precision import decimal_to_precision        # noqa: F401

from ccxt.base.errors import BaseError                                 # noqa: F401
from ccxt.base.errors import ExchangeError                             # noqa: F401
from ccxt.base.errors import NotSupported                              # noqa: F401
from ccxt.base.errors import error_hierarchy                           # noqa: F401

from ccxt.prediction.hyperliquid import hyperliquid                             # noqa: F401
from ccxt.prediction.kalshi import kalshi                                       # noqa: F401
from ccxt.prediction.limitless import limitless                                 # noqa: F401
from ccxt.prediction.myriad import myriad                                       # noqa: F401
from ccxt.prediction.polymarket import polymarket                               # noqa: F401

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
