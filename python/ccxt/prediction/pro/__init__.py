# -*- coding: utf-8 -*-

"""CCXT Prediction: prediction-market exchanges (WebSocket)"""

# ----------------------------------------------------------------------------

__version__ = '4.5.56'

# ----------------------------------------------------------------------------

from ccxt.async_support.base.exchange import Exchange    # noqa: F401

from ccxt.prediction.pro.polymarket import polymarket                           # noqa: F401

exchanges = [
    'polymarket',
]
