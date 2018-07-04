<?php

namespace ccxt;

class AsyncSymbolContext {
    public function __construct ($conxid){
        $this->conxid = $conxid;
        $this->subscribed = FALSE;
        $this->subscribing = FALSE;
        $this->data = array();
    }
    
    public function reset () {
        $this->subscribed = FALSE;
        $this->subscribing = FALSE;
        $this->data = array();
    }
}