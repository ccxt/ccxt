<?php

namespace ccxt;

use Exception;

$error_hierarchy = array (
    'BaseError' => array (
        'ExchangeError' => array (
            'AuthenticationError' => array (
                'PermissionDenied' => array(),
                'AccountSuspended' => array(),
            ),
            'ArgumentsRequired' => array(),
            'BadRequest' => array(),
            'BadResponse' => array (
                'NullResponse' => array(),
            ),
            'InsufficientFunds' => array(),
            'InvalidAddress' => array (
                'AddressPending' => array(),
            ),
            'InvalidOrder' => array (
                'OrderNotFound' => array(),
                'OrderNotCached' => array(),
                'CancelPending' => array(),
                'OrderImmediatelyFillable' => array(),
                'OrderNotFillable' => array(),
                'DuplicateOrderId' => array(),
            ),
            'NotSupported' => array(),
        ),
        'NetworkError' => array (
            'DDoSProtection' => array(),
            'ExchangeNotAvailable' => array(),
            'InvalidNonce' => array(),
            'RequestTimeout' => array(),
        ),
    ),
);

/*  ------------------------------------------------------------------------ */

function error_factory($array, $parent) {
    foreach ($array as $error => $subclasses) {
        eval("namespace ccxt; class $error extends $parent {};");
        error_factory($subclasses, $error);
    }
}

class BaseError extends Exception {};

error_factory($error_hierarchy['BaseError'], 'BaseError');
