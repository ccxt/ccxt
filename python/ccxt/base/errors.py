# -*- coding: utf-8 -*-

# MIT License
# Copyright (c) 2017 Igor Kroitor
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

# -----------------------------------------------------------------------------

__all__ = [
    'BaseError',
    'ExchangeError',
    'NotSupported',
    'AuthenticationError',
    'PermissionDenied',
    'InsufficientFunds',
    'InvalidOrder',
    'OrderNotFound',
    'OrderNotCached',
    'NetworkError',
    'DDoSProtection',
    'RequestTimeout',
    'ExchangeNotAvailable',
    'InvalidNonce',
    'InvalidAddress',
    'BadResponse',
    'NullResponse',
]

# -----------------------------------------------------------------------------


class BaseError(Exception):
    """Base class for all exceptions"""
    pass


class ExchangeError(BaseError):
    """"Raised when an exchange server replies with an error in JSON"""
    pass


class NotSupported(ExchangeError):
    """Raised if the endpoint is not offered/not yet supported by the exchange API"""
    pass


class BadResponse(ExchangeError):
    """Raised if the endpoint returns a bad response from the exchange API"""
    pass


class NullResponse(BadResponse):
    """Raised if the endpoint returns a null response from the exchange API"""
    pass


class AuthenticationError(ExchangeError):
    """Raised when API credentials are required but missing or wrong"""
    pass


class PermissionDenied(AuthenticationError):
    """Raised when API credentials are required but missing or wrong"""
    pass


class InsufficientFunds(ExchangeError):
    """Raised when you don't have enough currency on your account balance to place an order"""
    pass


class InvalidOrder(ExchangeError):
    """"Base class for all exceptions related to the unified order API"""
    pass


class InvalidAddress(ExchangeError):
    """Raised on invalid funding address"""
    pass


class OrderNotFound(InvalidOrder):
    """Raised when you are trying to fetch or cancel a non-existent order"""
    pass


class OrderNotCached(InvalidOrder):
    """Raised when the order is not found in local cache (where applicable)"""
    pass


class CancelPending(InvalidOrder):
    """Raised when an order that is already pending cancel is being canceled again"""
    pass


class NetworkError(BaseError):
    """Base class for all errors related to networking"""
    pass


class DDoSProtection(NetworkError):
    """Raised whenever DDoS protection restrictions are enforced per user or region/location"""
    pass


class RequestTimeout(NetworkError):
    """Raised when the exchange fails to reply in .timeout time"""
    pass


class ExchangeNotAvailable(NetworkError):
    """Raised if a reply from an exchange contains keywords related to maintenance or downtime"""
    pass


class InvalidNonce(NetworkError):
    """Raised in case of a wrong or conflicting nonce number in private requests"""
    pass


# =============================================================================
