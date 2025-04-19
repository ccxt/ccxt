import * as ccxt from 'ccxt';

import {
  wsConnecting,
  wsMsgsReceived,
  wsProcessing,
  wsDisconnects,
  wsSessionDuration,
} from './metrics';

const watchMethodDefaults: Record<string, any[]> = {
  watchOHLCV: ['BTC/USDT', '1m'],
  watchOrderBook: ['BTC/USDT'],
  watchTicker: ['BTC/USDT'],
  // watchTickers: [],
  watchTrades: ['BTC/USDT'],
  //watchBalance: [],
};

export async function benchmarkWatchMethod(exchange: any, methodName: string, args: any[]) {
  console.log(exchange.id, methodName, args);
  const labels = { exchange: exchange.id, method: methodName, language: 'TS'};

  async function executeMethod(sessionStart: number) {
    const start = Date.now();
    try {
      const data = await exchange[methodName](...args);
      const duration = (Date.now() - start) / 1000;
      wsMsgsReceived.labels(labels.exchange, labels.method, labels.language).inc();
      wsProcessing.labels(labels.exchange, labels.method, labels.language).observe(duration);
      return data;
    } catch (error) {
      wsDisconnects.labels(labels.exchange, labels.method, labels.language).inc();
      wsSessionDuration.labels(labels.exchange, labels.method, labels.language)
        .observe((Date.now() - sessionStart) / 1000);
      console.error(`[${labels.exchange}] ${labels.method} error:`, error);
      throw error;
    }
  }

  let sessionStart = Date.now();
  // Continuous monitoring
  while (true) {
    try {
      await executeMethod(sessionStart);
    } catch (error) {
      console.log('error', error);
      sessionStart = Date.now();
    }
  }
}

export function startBenchmarks() {
  //const exchanges = ccxt.exchanges;
  const exchanges = ["binance", "kucoin", "poloniex", "kraken"];
  const CCXT = ccxt as any; // Hack!
  Object.values(exchanges).forEach((exchangeName) => {
    console.log (exchangeName);
    try {
        // @ts-ignore
        const exchange = new CCXT.pro[exchangeName]({}) as ccxt.Exchange
        Object.keys(exchange.has)
        .filter((key) => key.startsWith('watch') && exchange.has[key])
        .forEach((method) => {
            if (watchMethodDefaults[method]) {
              benchmarkWatchMethod(exchange, method, watchMethodDefaults[method]);
            } else {
              console.warn(`No defaults for ${exchange.id} ${method}`);
            }
        });
    } catch (e) {
        console.log (e);
    }
   });
}
