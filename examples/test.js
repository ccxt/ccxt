import ccxt from '../js/ccxt.js';



const binance = new ccxt.binance({});

async function t(){
    while (true) {
        const t1 = new Date().getTime();
        // await binance.sleep(50); // neither adding this "tricks" throttler
        const ts = await binance.fetchTrades('BNB/USDT:USDT');
        console.log("FETCH ELAPSED", new Date().getTime() - t1);
    }
}

t();
