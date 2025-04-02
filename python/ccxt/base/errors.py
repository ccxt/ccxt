error_hierarchy = {
    'BaseError': {
        'ExchangeError': {
            'AuthenticationError': {
                'PermissionDenied': {
                    'AccountNotEnabled': {},
                },
                'AccountSuspended': {},
                'AccountNotVerified': {},
            },
            'ArgumentsRequired': {},
            'BadRequest': {
                'BadSymbol': {},
            },
            'BadResponse': {
                'NullResponse': {},
            },
            'InsufficientFunds': {},
            'InvalidAddress': {
                'AddressPending': {},
            },
            'InvalidOrder': {
                'OrderNotFound': {},
                'OrderNotCached': {},
                'CancelPending': {},
                'OrderImmediatelyFillable': {},
                'OrderNotFillable': {},
                'DuplicateOrderId': {},
                'TradesNotFound': {}
            },
            'NotSupported': {},
        },
        'NetworkError': {
            'DDoSProtection': {
                'RateLimitExceeded': {
                    'AccountRateLimitExceeded': {}
                },
            },
            'ExchangeNotAvailable': {
                'OnMaintenance': {},
            },
            'InvalidNonce': {},
            'RequestTimeout': {},
        },
    },
}


class BaseError(Exception):
    pass


class ExchangeError(BaseError):
    pass


class AuthenticationError(ExchangeError):
    pass


class PermissionDenied(AuthenticationError):
    pass


class AccountNotEnabled(PermissionDenied):
    pass


class AccountSuspended(AuthenticationError):
    pass


class AccountNotVerified(AuthenticationError):
    pass


class ArgumentsRequired(ExchangeError):
    pass


class BadRequest(ExchangeError):
    pass


class BadSymbol(BadRequest):
    pass


class BadResponse(ExchangeError):
    pass


class NullResponse(BadResponse):
    pass


class InsufficientFunds(ExchangeError):
    pass


class InvalidAddress(ExchangeError):
    pass


class AddressPending(InvalidAddress):
    pass


class InvalidOrder(ExchangeError):
    pass


class OrderNotFound(InvalidOrder):
    pass


class TradesNotFound(InvalidOrder):
    pass


class OrderNotCached(InvalidOrder):
    pass


class CancelPending(InvalidOrder):
    pass


class OrderImmediatelyFillable(InvalidOrder):
    pass


class OrderNotFillable(InvalidOrder):
    pass


class DuplicateOrderId(InvalidOrder):
    pass


class NotSupported(ExchangeError):
    pass


class OperationFailed(BaseError):
    pass


class NetworkError(BaseError):
    pass


class DDoSProtection(NetworkError):
    pass


class RateLimitExceeded(DDoSProtection):
    pass


class AccountRateLimitExceeded(RateLimitExceeded):
    pass


class SameLeverage(ExchangeError):
    pass


class ExchangeNotAvailable(NetworkError):
    pass


class OnMaintenance(ExchangeNotAvailable):
    pass


class InvalidNonce(NetworkError):
    pass


class RequestTimeout(NetworkError):
    pass


class OrderCancelled(InvalidOrder):
    """Raised when you are trying to fetch or cancel a non-existent order"""
    pass


class MaxStopAllowed(ExchangeError):
    """"Raised when an exchange server replies with an error in JSON"""
    pass


class PositionNotFound(ExchangeError):
    pass


class NotChanged(BaseError):
    pass


__all__ = [
    'error_hierarchy',
    'ExchangeError',
    'SameLeverage',
    'AuthenticationError',
    'PermissionDenied',
    'AccountNotEnabled',
    'AccountSuspended',
    'AccountNotVerified',
    'ArgumentsRequired',
    'BadRequest',
    'BadSymbol',
    'BadResponse',
    'NullResponse',
    'InsufficientFunds',
    'InvalidAddress',
    'AddressPending',
    'InvalidOrder',
    'OrderNotFound',
    'TradesNotFound',
    'OrderNotCached',
    'CancelPending',
    'OrderImmediatelyFillable',
    'OrderNotFillable',
    'DuplicateOrderId',
    'NotSupported',
    'NetworkError',
    'DDoSProtection',
    'RateLimitExceeded',
    'AccountRateLimitExceeded',
    'ExchangeNotAvailable',
    'OnMaintenance',
    'InvalidNonce',
    'RequestTimeout',
    'OrderCancelled',
    'MaxStopAllowed',
    'PositionNotFound',
    'NotChanged'
]
