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


import ccxt  # noqa


def error_factory(dictionary, super_class):
    for key in dictionary:
        __all__.append(key)
        error_class = type(key, (super_class,), {})
        globals()[key] = error_class
        error_factory(dictionary[key], error_class)


class BaseError(Exception):
    def __init__(self, message, exchange_id=None, http_method=None, http_code=None, http_status_text=None, url=None, response_headers=None, response_body=None, response_json=None):
        super(BaseError, self).__init__(message)
        self.__dict__['exchangeId'] = exchange_id
        self.__dict__['httpMethod'] = http_method
        self.__dict__['httpCode'] = http_code
        self.__dict__['httpStatusText'] = http_status_text
        self.__dict__['url'] = url
        self.__dict__['responseHeaders'] = response_headers
        self.__dict__['responseBody'] = response_body
        self.__dict__['responseJson'] = response_json

    def __getattr__(self, item):
        # __getattr__ is called for attributes that are not found on the object
        parts = item.split('_')
        camelcase = parts[0] + ''.join(ccxt.Exchange.capitalize(i) for i in parts[1:])
        if item == camelcase:
            raise AttributeError("{} object has no attribute {}".format(type(self).__name__, item))
        return getattr(self, camelcase)

    def __setattr__(self, key, value):
        parts = key.split('_')
        camelcase = parts[0] + ''.join(ccxt.Exchange.capitalize(i) for i in parts[1:])
        if hasattr(self, camelcase):
            return super(BaseError, self).__setattr__(camelcase, value)
        else:
            raise AttributeError('Cannot set attribute ' + key)

    def __str__(self):
        return ' '.join(str(i) for i in [self.exchangeId, self.httpMethod, self.url, self.httpCode, self.httpStatusText, self.args[0]] if i is not None)


error_factory(error_hierarchy['BaseError'], BaseError)
