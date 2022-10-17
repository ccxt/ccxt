<?php

namespace ccxt\pro;

//
//  automatically generated don't change this manually
//

class aaxBridge extends \ccxt\async\aax {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class ascendexBridge extends \ccxt\async\ascendex {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bequantBridge extends \ccxt\async\bequant {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class binanceBridge extends \ccxt\async\binance {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class binancecoinmBridge extends \ccxt\async\binancecoinm {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class binanceusBridge extends \ccxt\async\binanceus {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class binanceusdmBridge extends \ccxt\async\binanceusdm {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bitcoincomBridge extends \ccxt\async\bitcoincom {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bitfinexBridge extends \ccxt\async\bitfinex {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bitfinex2Bridge extends \ccxt\async\bitfinex2 {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bitmartBridge extends \ccxt\async\bitmart {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bitmexBridge extends \ccxt\async\bitmex {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bitoproBridge extends \ccxt\async\bitopro {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bitstampBridge extends \ccxt\async\bitstamp {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bittrexBridge extends \ccxt\async\bittrex {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bitvavoBridge extends \ccxt\async\bitvavo {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class bybitBridge extends \ccxt\async\bybit {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class coinbaseprimeBridge extends \ccxt\async\coinbaseprime {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class coinbaseproBridge extends \ccxt\async\coinbasepro {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class coinexBridge extends \ccxt\async\coinex {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class cryptocomBridge extends \ccxt\async\cryptocom {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class currencycomBridge extends \ccxt\async\currencycom {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class exmoBridge extends \ccxt\async\exmo {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class ftxBridge extends \ccxt\async\ftx {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class ftxusBridge extends \ccxt\async\ftxus {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class gateBridge extends \ccxt\async\gate {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class gateioBridge extends \ccxt\async\gateio {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class hitbtcBridge extends \ccxt\async\hitbtc {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class hollaexBridge extends \ccxt\async\hollaex {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class huobiBridge extends \ccxt\async\huobi {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class huobijpBridge extends \ccxt\async\huobijp {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class huobiproBridge extends \ccxt\async\huobipro {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class idexBridge extends \ccxt\async\idex {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class krakenBridge extends \ccxt\async\kraken {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class kucoinBridge extends \ccxt\async\kucoin {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class mexcBridge extends \ccxt\async\mexc {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class ndaxBridge extends \ccxt\async\ndax {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class okcoinBridge extends \ccxt\async\okcoin {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class okexBridge extends \ccxt\async\okex {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class okxBridge extends \ccxt\async\okx {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class phemexBridge extends \ccxt\async\phemex {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class ripioBridge extends \ccxt\async\ripio {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class upbitBridge extends \ccxt\async\upbit {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class whitebitBridge extends \ccxt\async\whitebit {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class zbBridge extends \ccxt\async\zb {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

class zipmexBridge extends \ccxt\async\zipmex {
    public WsConnector $ws;
    public function __construct($options = array()) {
        parent::__construct($options);
        $options['handle_message'] = array($this, 'handle_message');
        $options['log'] = array($this, 'log');
        $options['enableRateLimit'] = $this->enableRateLimit;
        $options['tokenBucket'] = $this->tokenBucket;
        $options['verbose'] = $this->verbose;
        $this->ws = new WsConnector($options);
    }
    public function handle_message ($client, $message) {} // stub to override
}
//---------------------------------------------------------------------

?>