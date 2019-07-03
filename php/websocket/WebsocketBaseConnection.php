<?php

namespace ccxt;

include 'CcxtEventEmitter.php';

abstract class WebsocketBaseConnection extends CcxtEventEmitter {


    public function __construct () {
        parent::__construct();
    }

    abstract public function connect ();

    abstract public function close ();

    abstract public function send ($data);

    public function sendJson ($data) {
        $this->send (json_encode ($data));
    }
}