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
            'BadRequest' => array (
                'BadSymbol' => array(),
            ),
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
            'ExchangeNotAvailable' => array (
                'OnMaintenance' => array(),
            ),
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


function un_camel_case($string) {
    if (preg_match('/^[A-Z-9_]+$/', $string)) {
        return $string;
    }
    $first = preg_replace('/([a-z0-9])([A-Z])/', '$1_$2', $string);
    $second = preg_replace('/([A-Z0-9])([A-Z0-9][a-z])/', '$1_$2', $first);
    return strtolower($second);
}


class BaseError extends Exception {
    public $message;
    public $error_message;
    public $exchange_id;
    public $http_code;
    public $http_status_text;
    public $url;
    public $http_method;
    public $response_headers;
    public $response_body;
    public $response_json;
    public static $verbose = False;

    public function __construct($error_message = "", $exchange_id = null, $http_code = null, $http_status_text = null, $url = null, $http_method = null, $response_headers = null, $response_body = null, $response_json = null) {
        $message = implode(' ', array_map('strval', array_filter(array($exchange_id, $http_method, $url, $http_code, $http_status_text, $error_message), 'is_string')));
        if (static::$verbose) {
            if ($response_headers) {
                $message .= "\n" . print_r($response_headers, true);
            }
            if ($response_json) {
                $message .= "\n" . print_r($response_json, true);
            } else if ($response_body) {
                $message .= "\n" . $response_body;
            }
        }
        parent::__construct($message, 0, null);
        $this->error_message = $error_message;
        $this->exchange_id = $exchange_id;
        $this->http_code = $http_code;
        $this->http_status_text = $http_status_text;
        $this->url = $url;
        $this->http_method = $http_method;
        $this->response_headers = $response_headers;
        $this->response_body = $response_body;
        $this->response_json = $response_json;
    }

    public function __toString() {
        return $this->getMessage();
    }

    public function __get($name) {
        // called for properties that do not exist in class, i.e. camelCase
        $underscore = un_camel_case($name);
        return $this->$underscore;
    }

    public function __set($name, $value) {
        $underscore = un_camel_case($value);
        if (property_exists($this, $underscore)) {
            $this->$underscore = $value;
        } else {
            throw new \InvalidArgumentException('Cannot set $name');
        }
    }
};

error_factory($error_hierarchy['BaseError'], 'BaseError');
