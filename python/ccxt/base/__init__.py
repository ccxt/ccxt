# -*- coding: utf-8 -*-

"""
MIT License

Copyright (c) 2017 Igor Kroitor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

from ccxt.base import errors
from ccxt.base import exchange

from ccxt.base.errors import BaseError             # noqa: F401
from ccxt.base.errors import ExchangeError         # noqa: F401
from ccxt.base.errors import NotSupported          # noqa: F401
from ccxt.base.errors import AuthenticationError   # noqa: F401
from ccxt.base.errors import InvalidNonce          # noqa: F401
from ccxt.base.errors import InsufficientFunds     # noqa: F401
from ccxt.base.errors import InvalidOrder          # noqa: F401
from ccxt.base.errors import OrderNotFound         # noqa: F401
from ccxt.base.errors import OrderNotCached        # noqa: F401
from ccxt.base.errors import CancelPending         # noqa: F401
from ccxt.base.errors import NetworkError          # noqa: F401
from ccxt.base.errors import DDoSProtection        # noqa: F401
from ccxt.base.errors import RequestTimeout        # noqa: F401
from ccxt.base.errors import ExchangeNotAvailable  # noqa: F401

__all__ = exchange.__all__ + errors.__all__  # noqa: F405
