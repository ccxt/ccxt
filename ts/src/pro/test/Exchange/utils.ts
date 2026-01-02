import ccxt, { Exchange } from '../../../../ccxt.js';

async function createOrderAfterDelay (exchange: Exchange) {
    await exchange.sleep (3000);
    await exchange.createOrder ('BTC/USDT', 'market', 'buy', 0.001);
}

async function createFutureOrderAfterDelay (exchange: Exchange) {
    await exchange.sleep (3000);
    await exchange.createOrder ('BTC/USDT:USDT', 'market', 'buy', 0.001);
}

export default createOrderAfterDelay;
export { createFutureOrderAfterDelay };
