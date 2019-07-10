<?php

namespace ccxt;

use Exception;
use Throwable;

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

class BaseError extends Exception {
    public $exchangeId;
    public $httpCode;
    public $httpStatusText;
    public $url;
    public $httpMethod;
    public $responseHeaders;
    public $responseBody;
    public $responseJson;


    public function __construct($message = "", $exchangeId = null, $httpCode = null, $httpStatusText = null, $url = null, $httpMethod = null, $responseHeaders = null, $responseBody = null, $responseJson = null, $code = 0, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
        $this->exchangeId = $exchangeId;
        $this->httpCode = $httpCode;
        $this->httpStatusText = $httpStatusText;
        $this->url = $url;
        $this->httpMethod = $httpMethod;
        $this->responseHeaders = $responseHeaders;
        $this->responseBody = $responseBody;
        $this->responseJson = $responseJson;
    }

    public function __toString() {
        return implode(' ', array_filter(array($this->exchangeId, $this->url, $this->httpCode, $this->httpStatusText, $this->getMessage()), 'is_string'));
    }

};

error_factory($error_hierarchy['BaseError'], 'BaseError');
