'use strict';

const asTable = require('as-table'),
	log = require('ololog').noLocate,
	ansi = require('ansicolor').nice,
	ccxt = require('../../ccxt.js'),
	cex = require('../../js/cex');



let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let exchange;
async function fetchOrderBook(id, apiKey, secret, limit, symbol, params) {
	exchange = new ccxt[id]({
		apiKey: apiKey,
		secret: secret,
		enableRateLimit: true,
		verbose: false,
	});
	exchange.on('err', (err, conxid) => {
		try {
			console.log(err);
			exchange.websocketClose(conxid);
			return
		} catch (ex) {
			console.log(ex);
		}
	});
	exchange.on('ob', (market, ob) => {
		console.log(' ');
		console.log('ob updated: ', market, ob);
	});
	await exchange.loadMarkets();

	console.log('subscribe: ' + symbol);
	await exchange.websocketSubscribe('ob', symbol, params);
	console.log('subscribed: ' + symbol);

	await exchange.websocketFetchOrderBook(symbol, limit);
	
	await sleep(15 * 1000);

	console.log('unsubscribe: ' + symbol);
	await exchange.websocketUnsubscribe('ob', symbol, params);
	console.log('unsubscribed: ' + symbol);
}

(async function main() {
	try {
		const id = 'poloniex';
		const apiKey = 'do not care';
		const secret = 'do not care';
		const limit = 2;
		const obDeltaCacheSizeMax = 10
		const symbols = 'ETH/BTC';

		const ob = await fetchOrderBook(id, apiKey, secret, limit, symbols, {
			// contract_type: 'next_week',
			'limit': limit,
			'obDeltaCacheSizeMax': obDeltaCacheSizeMax,
		});
	} catch (ex) {
		console.log('MAIN() EXCEPTION: ')
		log('Error:'.red, ex);
		log(ex.stack);
		exchange.websocketClose();
	}
})();
