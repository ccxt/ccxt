# -*- coding: utf-8 -*-

from ccxt.base import errors

# -----------------------------------------------------------------------------

from ccxt.base import decimal_to_precision

from ccxt import BaseError                  # noqa: F401
from ccxt import ExchangeError              # noqa: F401
from ccxt import NotSupported               # noqa: F401
from ccxt import AuthenticationError        # noqa: F401
from ccxt import PermissionDenied           # noqa: F401
from ccxt import AccountSuspended           # noqa: F401
from ccxt import InvalidNonce               # noqa: F401
from ccxt import InsufficientFunds          # noqa: F401
from ccxt import InvalidOrder               # noqa: F401
from ccxt import OrderNotFound              # noqa: F401
from ccxt import OrderNotCached             # noqa: F401
from ccxt import DuplicateOrderId           # noqa: F401
from ccxt import CancelPending              # noqa: F401
from ccxt import NetworkError               # noqa: F401
from ccxt import DDoSProtection             # noqa: F401
from ccxt import RateLimitExceeded          # noqa: F401
from ccxt import RequestTimeout             # noqa: F401
from ccxt import ExchangeNotAvailable       # noqa: F401
from ccxt import OnMaintenance              # noqa: F401
from ccxt import InvalidAddress             # noqa: F401
from ccxt import AddressPending             # noqa: F401
from ccxt import ArgumentsRequired          # noqa: F401
from ccxt import BadRequest                 # noqa: F401
from ccxt import BadResponse                # noqa: F401
from ccxt import NullResponse               # noqa: F401
from ccxt import OrderImmediatelyFillable   # noqa: F401
from ccxt import OrderNotFillable           # noqa: F401


__all__ = decimal_to_precision.__all__ + errors.__all__  # noqa: F405
