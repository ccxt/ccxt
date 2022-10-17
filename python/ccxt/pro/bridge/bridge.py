
import ccxt.async_support as ccxt
from ccxt.pro.base.WsConnector import WsConnector

##
##  automatically generated don't change this manually
##

class aaxBridge(ccxt.aax):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class ascendexBridge(ccxt.ascendex):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bequantBridge(ccxt.bequant):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class binanceBridge(ccxt.binance):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class binancecoinmBridge(ccxt.binancecoinm):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class binanceusBridge(ccxt.binanceus):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class binanceusdmBridge(ccxt.binanceusdm):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bitcoincomBridge(ccxt.bitcoincom):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bitfinexBridge(ccxt.bitfinex):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bitfinex2Bridge(ccxt.bitfinex2):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bitmartBridge(ccxt.bitmart):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bitmexBridge(ccxt.bitmex):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bitoproBridge(ccxt.bitopro):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bitstampBridge(ccxt.bitstamp):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bittrexBridge(ccxt.bittrex):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bitvavoBridge(ccxt.bitvavo):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class bybitBridge(ccxt.bybit):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class coinbaseprimeBridge(ccxt.coinbaseprime):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class coinbaseproBridge(ccxt.coinbasepro):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class coinexBridge(ccxt.coinex):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class cryptocomBridge(ccxt.cryptocom):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class currencycomBridge(ccxt.currencycom):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class exmoBridge(ccxt.exmo):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class ftxBridge(ccxt.ftx):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class ftxusBridge(ccxt.ftxus):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class gateBridge(ccxt.gate):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class gateioBridge(ccxt.gateio):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class hitbtcBridge(ccxt.hitbtc):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class hollaexBridge(ccxt.hollaex):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class huobiBridge(ccxt.huobi):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class huobijpBridge(ccxt.huobijp):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class huobiproBridge(ccxt.huobipro):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class idexBridge(ccxt.idex):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class krakenBridge(ccxt.kraken):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class kucoinBridge(ccxt.kucoin):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class mexcBridge(ccxt.mexc):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class ndaxBridge(ccxt.ndax):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class okcoinBridge(ccxt.okcoin):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class okexBridge(ccxt.okex):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class okxBridge(ccxt.okx):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class phemexBridge(ccxt.phemex):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class ripioBridge(ccxt.ripio):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class upbitBridge(ccxt.upbit):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class whitebitBridge(ccxt.whitebit):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class zbBridge(ccxt.zb):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

class zipmexBridge(ccxt.zipmex):
    ws = None
    def __init__(self, config):
        super().__init__(config)
        config['handle_message'] = self.handle_message
        config['enableRateLimit'] = self.enableRateLimit
        config['tokenBucket'] = self.tokenBucket
        config['verbose'] = self.verbose
        config['log'] = self.log
        config['ping'] = self.ping
        config['open'] = self.open
        config['get_session'] = self.get_session
        config['get_loop'] = self.get_event_loop
        self.ws = WsConnector(config)
    
    def handle_message(self, client, message): # stub to override
        return
##---------------------------------------------------------------------

