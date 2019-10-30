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
            'DDoSProtection': {},
            'ExchangeNotAvailable': {
                'OnMaintenance': {},
            },
            'InvalidNonce': {},
            'RequestTimeout': {},
        },
    },
}

# -----------------------------------------------------------------------------

__all__ = []

import re  # noqa
import json # noqa


def un_camel_case(string):
    if re.match(r'^[A-Z0-9_]+$', string):
        return string
    first = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', string)
    second = re.sub(r'([A-Z0-9])([A-Z0-9][a-z])', r'\1_\2', first)
    return second.lower()


def error_factory(dictionary, super_class):
    for key in dictionary:
        __all__.append(key)
        error_class = type(key, (super_class,), {})
        globals()[key] = error_class
        error_factory(dictionary[key], error_class)


class BaseError(Exception):
    def __init__(self, error_message, exchange=None, http_code=None, http_status_text=None, url=None, http_method=None, response_headers=None, response_body=None, response_json=None):
        super(BaseError, self).__init__()
        if exchange:
            self.__dict__['verbose'] = exchange.verbose
            self.__dict__['exchange_id'] = exchange.id
        else:
            self.__dict__['verbose'] = True
            self.__dict__['exchange_id'] = None
        self.__dict__['error_message'] = error_message
        self.__dict__['http_code'] = http_code
        self.__dict__['http_status_text'] = http_status_text
        self.__dict__['url'] = url
        self.__dict__['http_method'] = http_method
        self.__dict__['response_headers'] = response_headers
        self.__dict__['response_body'] = response_body
        self.__dict__['response_json'] = response_json

    def __getattr__(self, item):
        # __getattr__ is called for attributes that are not found on the object
        underscore = un_camel_case(item)
        if item == underscore:
            raise AttributeError("{} object has no attribute {}".format(type(self).__name__, item))
        return getattr(self, underscore)

    def __setattr__(self, key, value):
        underscore = un_camel_case(key)
        if hasattr(self, underscore):
            return super(BaseError, self).__setattr__(underscore, value)
        else:
            raise AttributeError('Cannot set attribute ' + key)

    @property
    def args(self):
        message = ' '.join(str(i) for i in [self.exchange_id, self.http_method, self.url, self.http_code,
                                            self.http_status_text, self.error_message] if i is not None)
        if self.verbose:
            if self.response_headers:
                message += '\n' + json.dumps(self.response_headers, indent=2)
            if self.response_json:
                message += '\n' + json.dumps(self.response_json, indent=2)
            elif self.response_body:
                message += '\n' + self.response_body
        return (message,)

    def __str__(self):
        return self.args[0]


error_factory(error_hierarchy['BaseError'], BaseError)
