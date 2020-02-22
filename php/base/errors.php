<?php

namespace ccxt;

use Exception;

$error_hierarchy = array(
    'BaseError' => array(
        'ExchangeError' => array(
            'AuthenticationError' => array(
                'PermissionDenied' => array(),
                'AccountSuspended' => array(),
            ),
            'ArgumentsRequired' => array(),
            'BadRequest' => array(
                'BadSymbol' => array(),
            ),
            'BadResponse' => array(
                'NullResponse' => array(),
            ),
            'InsufficientFunds' => array(),
            'InvalidAddress' => array(
                'AddressPending' => array(),
            ),
            'InvalidOrder' => array(
                'OrderNotFound' => array(),
                'OrderNotCached' => array(),
                'CancelPending' => array(),
                'OrderImmediatelyFillable' => array(),
                'OrderNotFillable' => array(),
                'DuplicateOrderId' => array(),
            ),
            'NotSupported' => array(),
        ),
        'NetworkError' => array(
            'DDoSProtection' => array(
                'RateLimitExceeded' => array(),
            ),
            'ExchangeNotAvailable' => array(
                'OnMaintenance' => array(),
            ),
            'InvalidNonce' => array(),
            'RequestTimeout' => array(),
        ),
    ),
);

class BaseError extends Exception {};
class ExchangeError extends BaseError {};
class AuthenticationError extends ExchangeError {};
class PermissionDenied extends AuthenticationError {};
class AccountSuspended extends AuthenticationError {};
class ArgumentsRequired extends ExchangeError {};
class BadRequest extends ExchangeError {};
class BadSymbol extends BadRequest {};
class BadResponse extends ExchangeError {};
class NullResponse extends BadResponse {};
class InsufficientFunds extends ExchangeError {};
class InvalidAddress extends ExchangeError {};
class AddressPending extends InvalidAddress {};
class InvalidOrder extends ExchangeError {};
class OrderNotFound extends InvalidOrder {};
class OrderNotCached extends InvalidOrder {};
class CancelPending extends InvalidOrder {};
class OrderImmediatelyFillable extends InvalidOrder {};
class OrderNotFillable extends InvalidOrder {};
class DuplicateOrderId extends InvalidOrder {};
class NotSupported extends ExchangeError {};
class NetworkError extends BaseError {};
class DDoSProtection extends NetworkError {};
class RateLimitExceeded extends DDoSProtection {};
class ExchangeNotAvailable extends NetworkError {};
class OnMaintenance extends ExchangeNotAvailable {};
class InvalidNonce extends NetworkError {};
class RequestTimeout extends NetworkError {};