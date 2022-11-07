import { throttle, safeValue, extend } from '../../base/functions.js';
import WsClient from './WsClient.js';
import { OrderBook, IndexedOrderBook, CountedOrderBook } from './OrderBook.js';
import { inflate64, inflate, gunzip } from './functions.js';;

export default class WsConnector  {
    
    newUpdates = true
    options = {}
    log = undefined
    ping = undefined
    verbose = undefined
    clients = {}
    // timeframes = undefined
    tokenBucket = undefined
    handleMessage = undefined
    streaming = undefined
    getVerboseMode = undefined
    getTokenBucket = undefined
    getKeepAlive = undefined
    getInflate = undefined
    getGunzip = undefined
    getEnableRateLimit = undefined
    getCost = undefined

    constructor (options = {}) {
        this.newUpdates = (options as any).newUpdates || true;
        this.log = (options as any).log || this.log;
        this.getVerboseMode = (options as any).getVerboseMode;
        this.handleMessage = (options as any).handleMessage || this.handleMessage;
        this.newUpdates = true;
        this.options = {};
        this.log = (options as any).log;
        this.ping = (options as any).ping;
        this.getTokenBucket = (options as any).getTokenBucket;
        this.getKeepAlive = (options as any).getKeepAlive;
        this.getInflate = (options as any).getInflate;
        this.getGunzip = (options as any).getGunzip;
        this.getEnableRateLimit = (options as any).getEnableRateLimit; 
        this.getCost = (options as any).getCost;
        this.clients = {};
    }

};

export {
    WsConnector,
};
