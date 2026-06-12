# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Prediction Markets, WebSockets)"""

# ----------------------------------------------------------------------------

__version__ = '4.5.58'

# ----------------------------------------------------------------------------

from ccxt.async_support.base.exchange import Exchange                  # noqa: F401
from ccxt.base.errors import BaseError                                 # noqa: F401
from ccxt.base.errors import ExchangeError                             # noqa: F401
from ccxt.base.errors import NotSupported                              # noqa: F401

from ccxt.prediction.pro.polymarket import polymarket                           # noqa: F401

exchanges = [
    'polymarket',
]

base = [
    'Exchange',
    'exchanges',
]

__all__ = base + exchanges
