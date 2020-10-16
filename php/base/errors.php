<?php

namespace ccxt\base;

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
