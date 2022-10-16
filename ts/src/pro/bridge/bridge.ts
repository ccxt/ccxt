import aaxRest from  '../../aax.js'
import ascendexRest from  '../../ascendex.js'
import bequantRest from  '../../bequant.js'
import binanceRest from  '../../binance.js'
import binancecoinmRest from  '../../binancecoinm.js'
import binanceusRest from  '../../binanceus.js'
import binanceusdmRest from  '../../binanceusdm.js'
import bitcoincomRest from  '../../bitcoincom.js'
import bitfinexRest from  '../../bitfinex.js'
import bitfinex2Rest from  '../../bitfinex2.js'
import bitmartRest from  '../../bitmart.js'
import bitmexRest from  '../../bitmex.js'
import bitoproRest from  '../../bitopro.js'
import bitstampRest from  '../../bitstamp.js'
import bittrexRest from  '../../bittrex.js'
import bitvavoRest from  '../../bitvavo.js'
import bybitRest from  '../../bybit.js'
import coinbaseprimeRest from  '../../coinbaseprime.js'
import coinbaseproRest from  '../../coinbasepro.js'
import coinexRest from  '../../coinex.js'
import cryptocomRest from  '../../cryptocom.js'
import currencycomRest from  '../../currencycom.js'
import exmoRest from  '../../exmo.js'
import ftxRest from  '../../ftx.js'
import ftxusRest from  '../../ftxus.js'
import gateRest from  '../../gate.js'
import gateioRest from  '../../gateio.js'
import hitbtcRest from  '../../hitbtc.js'
import hollaexRest from  '../../hollaex.js'
import huobiRest from  '../../huobi.js'
import huobijpRest from  '../../huobijp.js'
import huobiproRest from  '../../huobipro.js'
import idexRest from  '../../idex.js'
import krakenRest from  '../../kraken.js'
import kucoinRest from  '../../kucoin.js'
import mexcRest from  '../../mexc.js'
import ndaxRest from  '../../ndax.js'
import okcoinRest from  '../../okcoin.js'
import okexRest from  '../../okex.js'
import okxRest from  '../../okx.js'
import phemexRest from  '../../phemex.js'
import ripioRest from  '../../ripio.js'
import upbitRest from  '../../upbit.js'
import whitebitRest from  '../../whitebit.js'
import zbRest from  '../../zb.js'
import zipmexRest from  '../../zipmex.js'
import { Exchange as WSConnector } from '../base/Exchange.js';

//
//  automatically generated don't change this manually
//

export class aaxBridge extends aaxRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class ascendexBridge extends ascendexRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bequantBridge extends bequantRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class binanceBridge extends binanceRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class binancecoinmBridge extends binancecoinmRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class binanceusBridge extends binanceusRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class binanceusdmBridge extends binanceusdmRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitcoincomBridge extends bitcoincomRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitfinexBridge extends bitfinexRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitfinex2Bridge extends bitfinex2Rest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitmartBridge extends bitmartRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitmexBridge extends bitmexRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitoproBridge extends bitoproRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitstampBridge extends bitstampRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bittrexBridge extends bittrexRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitvavoBridge extends bitvavoRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bybitBridge extends bybitRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class coinbaseprimeBridge extends coinbaseprimeRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class coinbaseproBridge extends coinbaseproRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class coinexBridge extends coinexRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class cryptocomBridge extends cryptocomRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class currencycomBridge extends currencycomRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class exmoBridge extends exmoRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class ftxBridge extends ftxRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class ftxusBridge extends ftxusRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class gateBridge extends gateRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class gateioBridge extends gateioRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class hitbtcBridge extends hitbtcRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class hollaexBridge extends hollaexRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class huobiBridge extends huobiRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class huobijpBridge extends huobijpRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class huobiproBridge extends huobiproRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class idexBridge extends idexRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class krakenBridge extends krakenRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class kucoinBridge extends kucoinRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class mexcBridge extends mexcRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class ndaxBridge extends ndaxRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class okcoinBridge extends okcoinRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class okexBridge extends okexRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class okxBridge extends okxRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class phemexBridge extends phemexRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class ripioBridge extends ripioRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class upbitBridge extends upbitRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class whitebitBridge extends whitebitRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class zbBridge extends zbRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class zipmexBridge extends zipmexRest {
    ws: WSConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage;
        (config as any).tokenBucket = this.tokenBucket;
        (config as any).enableRateLimit = this.enableRateLimit;
        this.ws = new WSConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

