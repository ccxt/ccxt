# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library"""

from ccxt.base import Exchange  # noqa: F401
from ccxt.base import errors

__version__ = '1.9.285'

base = [
    'Exchange',
    'exchanges',
]

exchanges = [
    '_1broker',
    'zaif',
]

__all__ = base + errors + exchanges
