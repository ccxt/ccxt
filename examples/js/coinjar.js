"use strict";

const ccxt       = require ('../../ccxt.js')
const log        = require ('ololog').configure ({ locate: false })

//-----------------------------------------------------------------------------

;(async function main () {
    const exchange = new ccxt.coinjar ({
      'token': 'xxx',
      'verbose': false,
      'urls': {
          'api': {
              'public': 'https://data.exchange.coinjar-sandbox.com', // sandbox environment, not needed for production
              'private': 'https://api.exchange.coinjar-sandbox.com', // sandbox environment, not needed for production
          }
        }
    });

    const markets = await exchange.loadMarkets ();
    log.yellow (markets);

    try {
      const accounts = await exchange.fetchAccounts ();
      log.yellow (accounts);
    } catch (e) {
      console.log (e);
    }

    const balance = await exchange.fetchBalance ();
    log.yellow (balance);

    const btc_aud_ticker = await exchange.fetchTicker ('BTC/AUD');
    log.yellow (btc_aud_ticker);

    const btc_aud_order_book_level_3 = await exchange.fetchOrderBook ('BTC/AUD');
    log.yellow (btc_aud_order_book_level_3);

    const all_orders = await exchange.fetchOrders (undefined, 0);
    log.yellow (all_orders);

    const all_open_orders = await exchange.fetchOpenOrders (undefined, 0);
    log.yellow (all_open_orders);

    const first_oid = all_orders[0].id;
    const first_order = await exchange.fetchOrder (first_oid);
    log.yellow (first_order);

    const created_order = await exchange.createOrder ('BTC/AUD', 'LMT', 'buy', '0.001', '12990');
    log.yellow (created_order);

    const cancelled_order = await exchange.cancelOrder (created_order.id);
    log.yellow (cancelled_order);

    const cancelled_all_order = await exchange.cancelAllOrders ();
    log.yellow (cancelled_all_order);

    const my_trades = await exchange.fetchMyTrades ();
    log.yellow (my_trades);

    const now = Math.floor(Date.now() / 1000);
    const tenMinutes = 10 * 60;
    const ohlcv = await exchange.fetchOHLCV ('BTC/AUD', '1m', now - tenMinutes, now);
    log.yellow (ohlcv);
}) ()
