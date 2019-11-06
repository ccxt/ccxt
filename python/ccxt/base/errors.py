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
import json  # noqa


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
    camel_case = {
        'exchangeId': 'exchange_id',
        'errorMessage': 'error_message',
        'httpCode': 'http_code',
        'httpStatusText': 'http_status_text',
        'httpMethod': 'http_method',
        'responseHeaders': 'response_headers',
        'responseBody': 'response_body',
        'responseJson': 'response_json',
    }

    def __init__(self, error_message, exchange=None, http_code=None, http_status_text=None, url=None, http_method=None, response_headers=None, response_body=None, response_json=None):
        super(BaseError, self).__init__(error_message, exchange, http_code, http_status_text, url, http_method, response_headers, response_body, response_json)
        if exchange:
            self.verbose = exchange.verbose
            self.exchange_id = exchange.id
        else:
            self.verbose = True
            self.exchange_id = None
        self.error_message = error_message
        self.http_code = http_code
        self.http_status_text = http_status_text
        self.url = url
        self.http_method = http_method
        self.response_headers = response_headers
        self.response_body = response_body
        self.response_json = response_json

    def __getattr__(self, item):
        # __getattr__ is called for attributes that are not found on the object
        item = BaseError.camel_case.get(item, item)
        return super(BaseError, self).__getattribute__(item)

    def __setattr__(self, key, value):
        key = BaseError.camel_case.get(key, key)
        return super(BaseError, self).__setattr__(key, value)

    def __str__(self):
        message = ' '.join(str(i) for i in [self.exchange_id, self.http_method, self.url, self.http_code,
                                            self.http_status_text, self.error_message] if i is not None)
        if self.verbose:
            if self.response_headers:
                message += '\n' + json.dumps(self.response_headers, indent=2)
            if self.response_json:
                message += '\n' + json.dumps(self.response_json, indent=2)
            elif self.response_body:
                message += '\n' + self.response_body
        return message


error_factory(error_hierarchy['BaseError'], BaseError)
