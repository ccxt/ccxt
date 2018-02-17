# -*- coding: utf-8 -*-

"""CCXT: CryptoCurrency eXchange Trading Library (Async)"""

# -----------------------------------------------------------------------------

__version__ = '1.10.63'

# -----------------------------------------------------------------------------

from ccxt.base import errors                                    # noqa: F401
from ccxt.base.errors import BaseError                          # noqa: F401
from ccxt.base.errors import ExchangeError                      # noqa: F401
from ccxt.base.errors import NotSupported                       # noqa: F401
from ccxt.base.errors import AuthenticationError                # noqa: F401
from ccxt.base.errors import InvalidNonce                       # noqa: F401
from ccxt.base.errors import InsufficientFunds                  # noqa: F401
from ccxt.base.errors import InvalidOrder                       # noqa: F401
from ccxt.base.errors import OrderNotFound                      # noqa: F401
from ccxt.base.errors import OrderNotCached                     # noqa: F401
from ccxt.base.errors import NetworkError                       # noqa: F401
from ccxt.base.errors import DDoSProtection                     # noqa: F401
from ccxt.base.errors import RequestTimeout                     # noqa: F401
from ccxt.base.errors import ExchangeNotAvailable               # noqa: F401

from ccxt.async.ws.bitfinex import bitfinex                        # noqa: F401

exchanges = ['bitfinex']
