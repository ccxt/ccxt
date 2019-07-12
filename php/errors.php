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

    public function __construct($message = "", $exchangeId = null, $httpCode = null, $httpStatusText = null, $url = null, $httpMethod = null, $responseHeaders = null, $responseBody = null, $responseJson = null) {
        parent::__construct($message, 0, null);
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

    public function __get($name) {
        $camelcase = preg_replace_callback('/_(\w)/', function ($x) {return strtoupper($x[1]); }, $name);
        if ($camelcase === $name) {
            $trace = debug_backtrace();
            trigger_error(
                'Undefined property via __get(): ' . $name .
                ' in ' . $trace[0]['file'] .
                ' on line ' . $trace[0]['line'],
                E_USER_NOTICE);
            return null;
        }
        return $this->$camelcase;
    }

    public function __set($name, $value) {
        $camelcase = preg_replace_callback('/_(\w)/', function ($x) {return strtoupper($x[1]); }, $name);
        if (property_exists($this, $camelcase)) {
            $this->$camelcase = $value;
        } else {
            throw new \InvalidArgumentException('Cannot set $name');
        }
    }
};

error_factory($error_hierarchy['BaseError'], 'BaseError');
