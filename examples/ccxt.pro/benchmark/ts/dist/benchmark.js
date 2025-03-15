"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.benchmarkWatchMethod = benchmarkWatchMethod;
exports.startBenchmarks = startBenchmarks;
const ccxt = __importStar(require("ccxt"));
const metrics_1 = require("./metrics");
const watchMethodDefaults = {
    watchOHLCV: ['BTC/USDT', '1m'],
    watchOrderBook: ['BTC/USDT'],
    watchTicker: ['BTC/USDT'],
    watchTickers: [],
    watchTrades: ['BTC/USDT'],
    //watchBalance: [],
};
async function benchmarkWatchMethod(exchange, methodName, args) {
    const sessionStart = Date.now();
    const labels = { exchange: exchange.id, method: methodName, language: 'TS' };
    async function executeMethod() {
        const start = Date.now();
        try {
            const data = await exchange[methodName](...args);
            const duration = (Date.now() - start) / 1000;
            metrics_1.wsMsgsReceived.labels(labels.exchange, labels.method, labels.language).inc();
            metrics_1.wsProcessing.labels(labels.exchange, labels.method, labels.language).observe(duration);
            console.log(`[${labels.exchange}] ${labels.method}`);
            return data;
        }
        catch (error) {
            metrics_1.wsDisconnects.labels(labels.exchange, labels.method, labels.language).inc();
            metrics_1.wsSessionDuration.labels(labels.exchange, labels.method, labels.language)
                .observe((Date.now() - sessionStart) / 1000);
            console.error(`[${labels.exchange}] ${labels.method} error:`, error);
            throw error;
        }
    }
    // Initial connection
    try {
        await executeMethod();
    }
    catch (error) {
        return;
    }
    // Continuous monitoring
    while (true) {
        await executeMethod().catch(() => { });
    }
}
function startBenchmarks() {
    //const exchanges = ccxt.exchanges;
    const exchanges = ["binance", "kucoin", "poloniex", "kraken"];
    const CCXT = ccxt; // Hack!
    Object.values(exchanges).slice(0, 25).forEach((exchangeName) => {
        console.log(exchangeName);
        try {
            // @ts-ignore
            const exchange = new CCXT.pro[exchangeName]({});
            Object.keys(exchange.has)
                .filter((key) => key.startsWith('watch') && exchange.has[key])
                .forEach((method) => {
                if (watchMethodDefaults[method]) {
                    benchmarkWatchMethod(exchange, method, watchMethodDefaults[method]);
                }
                else {
                    console.warn(`No defaults for ${exchange.id} ${method}`);
                }
            });
        }
        catch (e) {
            console.log(e);
        }
    });
}
