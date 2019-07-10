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

from ccxt.base.functions import to_camelcase

__all__ = []


def error_factory(dictionary, super_class):
    for key in dictionary:
        __all__.append(key)
        error_class = type(key, (super_class,), {})
        globals()[key] = error_class
        error_factory(dictionary[key], error_class)


class BaseError(Exception):
    def __init__(self, message, exchange_id=None, http_code=None, http_status_text=None, url=None, http_method=None, response_headers=None, response_body=None, response_json=None):
        super(BaseError, self).__init__(message)
        self.exchangeId = exchange_id
        self.httpCode = http_code
        self.httpStatusText = http_status_text
        self.url = url
        self.httpMethod = http_method
        self.responseHeaders = response_headers
        self.responseBody = response_body
        self.responseJson = response_json

    def __getattr__(self, item):
        # __getattr__ is called for attributes that are not found on the object
        camelcase = to_camelcase(item)
        if item == camelcase:
            raise AttributeError("{} object has no attribute {}".format(type(self).__name__, item))
        return getattr(self, camelcase)

    def __str__(self):
        return ' '.join(i for i in [self.exchangeId, self.url, self.httpCode, self.httpStatusText, self.args[0]] if isinstance(i, str))


error_factory(error_hierarchy['BaseError'], BaseError)
