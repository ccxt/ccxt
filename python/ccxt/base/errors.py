error_hierarchy = {
    'BaseError': {
        'ExchangeError': {
            'AuthenticationError': {
                'PermissionDenied': {},
                'AccountSuspended': {},
            },
            'ArgumentsRequired': {},
            'BadRequest': {},
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
            'DDoSProtection': {},
            'ExchangeNotAvailable': {},
            'InvalidNonce': {},
            'RequestTimeout': {},
        },
    },
}

# -----------------------------------------------------------------------------

__all__ = []


def error_factory(dictionary, super_class):
    for key in dictionary:
        __all__.append(key)
        error_class = type(key, (super_class,), {})
        globals()[key] = error_class
        error_factory(dictionary[key], error_class)


class BaseError(Exception):
    def __init__(self, message, http_code=None, http_status_text=None, url=None, http_method=None, response_headers=None, response_body=None, response_json=None):
        super(BaseError, self).__init__(message)
        self.http_code = http_code
        self.http_status_text = http_status_text
        self.url = url
        self.http_method = http_method
        self.response_headers = response_headers
        self.response_body = response_body
        self.response_json = response_json


error_factory(error_hierarchy['BaseError'], BaseError)
