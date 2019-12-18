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

/*  ------------------------------------------------------------------------ */

if (!function_exists('ccxt\error_factory')) {
    function error_factory($array, $parent) {
        foreach ($array as $error => $subclasses) {
            if (!class_exists('ccxt\\'.$error, false)) {
                eval("namespace ccxt; class $error extends $parent {};");
                error_factory($subclasses, $error);
            }
        }
    }
}

if (!class_exists('ccxt\BaseError', false)) {
    class BaseError extends Exception {};
}

error_factory($error_hierarchy['BaseError'], 'BaseError');
