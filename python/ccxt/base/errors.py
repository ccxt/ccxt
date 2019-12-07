error_hierarchy = {
    'BaseError': {
        'ExchangeError': {
            'AuthenticationError': {
                'PermissionDenied': {},
                'AccountSuspended': {},
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
            },
            'NotSupported': {},
        },
        'NetworkError': {
            'DDoSProtection': {
                'RateLimitExceeded': {},
            },
            'ExchangeNotAvailable': {
                'OnMaintenance': {},
            },
            'InvalidNonce': {},
            'RequestTimeout': {},
        },
    },
}

ExchangeError = None
AuthenticationError = None
PermissionDenied = None
AccountSuspended = None
ArgumentsRequired = None
BadRequest = None
BadSymbol = None
BadResponse = None
NullResponse = None
InsufficientFunds = None
InvalidAddress = None
AddressPending = None
InvalidOrder = None
OrderNotFound = None
OrderNotCached = None
CancelPending = None
OrderImmediatelyFillable = None
OrderNotFillable = None
DuplicateOrderId = None
NotSupported = None
NetworkError = None
DDoSProtection = None
RateLimitExceeded = None
ExchangeNotAvailable = None
OnMaintenance = None
InvalidNonce = None
RequestTimeout = None
BaseError = None
ExchangeError = None
AuthenticationError = None
PermissionDenied = None
AccountSuspended = None
ArgumentsRequired = None
BadRequest = None
BadSymbol = None
BadResponse = None
NullResponse = None
InsufficientFunds = None
InvalidAddress = None
AddressPending = None
InvalidOrder = None
OrderNotFound = None
OrderNotCached = None
CancelPending = None
OrderImmediatelyFillable = None
OrderNotFillable = None
DuplicateOrderId = None
NotSupported = None
NetworkError = None
DDoSProtection = None
RateLimitExceeded = None
ExchangeNotAvailable = None
OnMaintenance = None
InvalidNonce = None
RequestTimeout = None

# -----------------------------------------------------------------------------

__all__ = []


def error_factory(dictionary, super_class):
    for key in dictionary:
        __all__.append(key)
        error_class = type(key, (super_class,), {})
        globals()[key] = error_class
        error_factory(dictionary[key], error_class)


class BaseError(Exception):
    def __init__(self, message):
        super(BaseError, self).__init__(message)
        pass


error_factory(error_hierarchy['BaseError'], BaseError)
