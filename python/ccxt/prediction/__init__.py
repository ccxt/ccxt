# -*- coding: utf-8 -*-

"""CCXT Prediction: prediction-market exchanges (async)"""

# ----------------------------------------------------------------------------

__version__ = '4.5.59'

# ----------------------------------------------------------------------------

from ccxt.async_support.base.exchange import Exchange    # noqa: F401
from ccxt.base.precise import Precise                    # noqa: F401
from ccxt.base import errors                             # noqa: F401
from ccxt.base.errors import error_hierarchy             # noqa: F401

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
