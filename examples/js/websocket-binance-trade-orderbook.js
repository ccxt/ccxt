
/**
 * refer to https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md
 * @author Thomas Muhm <tom.muhm+github@gmail.com>
 */
const ccxt = require('../../ccxt.js');

class WSHandler {

  // do not call directly!, use: `await WSHandler.create(exchange);`
  constructor(exchange) {
    this.exchange = exchange;

    this.subscriptions = { 
      trade: {},
      ob: {},
    }
    
    this.exchange.on('err', (err, conxid) => {
      try {
        console.log(err);
        this.exchange.websocketClose(conxid);
      } catch (ex) {
        console.log(ex);
      }
    });
  }

  // use this instead of constructor! -- required to load markets 
  static async create(exchange) {
    await exchange.loadMarkets();
    return new WSHandler(exchange);
  }

  tradeResult(trade) {
    console.log(`tradeResult - ${logS(this.exchange.name, trade.symbol)}`);
    console.log(JSON.stringify(trade));
  }

  orderBookResult(symbol, orderbook) {
    console.log(`orderBookResult - ${logS(this.exchange.name, symbol)}`);
    console.log(JSON.stringify(orderbook));
  }

  async startTrades(symbol) {
    console.log(`startTrades - ${logS(this.exchange.name, symbol)}`);

    if (this.subscriptions.trade[symbol]) {
      logger.warn(`startTrades - active subscription found - ${logS(this.exchange.name, symbol)}`);
      return;
    }

    this.subscriptions.trade[symbol] = this.tradeResult.bind(this);
    await this.exchange.on('trade', this.subscriptions.trade[symbol]);
    await this.exchange.websocketSubscribe('trade', symbol);

    console.log(`startTrades - subscribed - ${logS(this.exchange.name, symbol)}`);
  }

  async stopTrades(symbol) {
    console.log(`stopTrades - ${logS(this.exchange.name, symbol)}`);

    if (!this.subscriptions.trade[symbol]) {
      logger.warn(`startTrades - no subscription found - ${logS(this.exchange.name, symbol)}`);
      return;
    }

    await this.exchange.off('trade', this.subscriptions.trade[symbol])
    delete this.subscriptions.trade[symbol];
    await this.exchange.websocketUnsubscribe('trade', symbol);

    console.log(`stopTrades - unsubscribed - ${logS(this.exchange.name, symbol)}`);
  }

  async startOrderBook(symbol, limit) {
    console.log(`startOrderBook - ${logS(this.exchange.name, symbol)}`);

    if (this.subscriptions.ob[symbol]) {
      logger.warn(`startOrderBook - active subscription found - ${logS(this.exchange.name, symbol)}`);
      return;
    }

    this.subscriptions.ob[symbol] = this.orderBookResult.bind(this);
    await this.exchange.on('ob', this.subscriptions.ob[symbol]);
    await this.exchange.websocketSubscribe('ob', symbol, { 'limit': limit });

    console.log(`startOrderBook - subscribed - ${logS(this.exchange.name, symbol)}`);
  }

  async stopOrderBook(symbol) {
    console.log(`stopOrderBook - ${logS(this.exchange.name, symbol)}`);

    if (!this.subscriptions.ob[symbol]) {
      logger.warn(`stopOrderBook - no subscription found - ${logS(this.exchange.name, symbol)}`);
      return;
    }

    await this.exchange.off('ob', this.subscriptions.ob[symbol])
    delete this.subscriptions.ob[symbol];
    await this.exchange.websocketUnsubscribe('ob', symbol);

    console.log(`stopOrderBook - unsubscribed - ${logS(this.exchange.name, symbol)}`);
  }
  
  async testOrderBook(symbol) {
    try {
      await this.startOrderBook(symbol, 10);
      await sleep(15*1000);
      await this.stopOrderBook(symbol);
    } catch (ex) {
      console.log('Error:', ex);
      console.log(ex.stack);
      this.exchange.websocketClose();
    }
  }

  async testTrades(symbol) {
    try {
      await this.startTrades(symbol);
      await sleep(15*1000);
      await this.stopTrades(symbol);
    } catch (ex) {
      console.log('Error:', ex);
      console.log(ex.stack);
      this.exchange.websocketClose();
    }
  }

}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logS = (exchange, symbol) => `exchange: ${exchange}, symbol: ${symbol}`;


async function run() {
  const exchange = new ccxt.binance();
  const wsHandler = await WSHandler.create(exchange);
  
  await wsHandler.testOrderBook('BTC/USDT');
  await wsHandler.testTrades('ETH/BTC');
}

run();