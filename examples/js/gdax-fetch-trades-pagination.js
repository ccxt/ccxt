import ccxt from '../../js/ccxt.js';
import ololog from 'ololog';

const { noLocate } = ololog;
const log = noLocate;

const exchange = new ccxt.coinbasepro ()

;(async () => {

    const symbol = 'ETH/BTC'
    const params = {}
    await exchange.loadMarkets ()
    while (true) {
        const trades = await exchange.fetchTrades (symbol, undefined, undefined, params)
        if (trades.length) {
            const firstTrade = trades[0]
            const lastTrade = trades[trades.length - 1]
            log.yellow ('Fetched', trades.length, symbol, 'trades from', firstTrade['datetime'], 'to', lastTrade['datetime'])
            if ('Cb-After' in exchange.last_response_headers) {
                params['after'] = exchange.last_response_headers['Cb-After'];
            }
        } else {
            log.green ('Done.')
            break;
        }
    }

}) ()
