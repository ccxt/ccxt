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
import { WsConnector } from '../base/WsConnector.js';

//
//  automatically generated don't change this manually
//

export class aaxBridge extends aaxRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class ascendexBridge extends ascendexRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bequantBridge extends bequantRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class binanceBridge extends binanceRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class binancecoinmBridge extends binancecoinmRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class binanceusBridge extends binanceusRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class binanceusdmBridge extends binanceusdmRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitcoincomBridge extends bitcoincomRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitfinexBridge extends bitfinexRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitfinex2Bridge extends bitfinex2Rest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitmartBridge extends bitmartRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitmexBridge extends bitmexRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitoproBridge extends bitoproRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitstampBridge extends bitstampRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bittrexBridge extends bittrexRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bitvavoBridge extends bitvavoRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class bybitBridge extends bybitRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class coinbaseprimeBridge extends coinbaseprimeRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class coinbaseproBridge extends coinbaseproRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class coinexBridge extends coinexRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class cryptocomBridge extends cryptocomRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class currencycomBridge extends currencycomRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class exmoBridge extends exmoRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class ftxBridge extends ftxRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class ftxusBridge extends ftxusRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class gateBridge extends gateRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class gateioBridge extends gateioRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class hitbtcBridge extends hitbtcRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class hollaexBridge extends hollaexRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class huobiBridge extends huobiRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class huobijpBridge extends huobijpRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class huobiproBridge extends huobiproRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class idexBridge extends idexRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class krakenBridge extends krakenRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class kucoinBridge extends kucoinRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class mexcBridge extends mexcRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class ndaxBridge extends ndaxRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class okcoinBridge extends okcoinRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class okexBridge extends okexRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class okxBridge extends okxRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class phemexBridge extends phemexRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class ripioBridge extends ripioRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class upbitBridge extends upbitRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class whitebitBridge extends whitebitRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class zbBridge extends zbRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

export class zipmexBridge extends zipmexRest {
    ws: WsConnector;
    constructor (config = {}) {
        super (config);
        (config as any).handleMessage = this.handleMessage.bind(this);
        (config as any).getEnableRateLimit = this.getEnableRateLimit.bind (this);
        (config as any).getKeepAlive = this.getKeepAlive.bind (this);
        (config as any).getTokenBucket = this.getTokenBucket.bind (this);
        (config as any).isInflate = this.isInflate.bind (this);
        (config as any).isGunzip = this.isGunzip.bind (this);
        (config as any).isVerboseMode = this.isVerboseMode.bind (this);
        (config as any).log = this.log;
        (config as any).ping =  (this as any).ping ? (this as any).ping.bind(this) : undefined;
        this.ws = new WsConnector (config);
    }
    handleMessage (client, message) {} // stub to override
    }
//---------------------------------------------------------------------

