import ccxt from '../js/ccxt.js';
import fs from 'fs';

async function main () {
    const k = JSON.parse (fs.readFileSync ('keys.local.json', 'utf8')).limitless;
    const ex = new (ccxt as any).prediction.limitless ({ 'apiKey': k.apiKey, 'secret': k.secret, 'walletAddress': k.walletAddress });
    await ex.loadMarkets ();
    // outcomes registered?
    const outcomeKeys = Object.keys (ex.outcomes);
    const byIdKeys = Object.keys (ex.outcomes_by_id);
    console.log ('outcomes registered:', outcomeKeys.length, '| by id:', byIdKeys.length);
    // pick a CLOB outcome
    let handle = undefined; let mkt = undefined;
    for (const m of Object.values (ex.markets) as any[]) {
        if (m.info && m.info.venue && m.info.venue.exchange && m.outcomes && m.outcomes.length) { handle = m.outcomes[0].outcome; mkt = m; break; }
    }
    console.log ('sample market: symbol=', mkt.symbol, '| marketType=', mkt.marketType, '| executionModel=', mkt.executionModel, '| collateral=', mkt.collateral);
    const oc = mkt.outcomes[0];
    console.log ('sample outcome keys:', Object.keys (oc).join (','), '| outcome=', oc.outcome, '| outcomeId=', String (oc.outcomeId).slice (0, 12) + '…', '| market=', oc.market, '| label=', oc.label);
    // resolve
    const resolved = ex.outcome (handle);
    console.log ('ex.outcome(handle) resolves:', resolved !== undefined);
    // fetchTicker exposes outcome not symbol
    const t = await ex.fetchTicker (handle);
    console.log ('fetchTicker: outcome=', t.outcome, '| has symbol key?', ('symbol' in t) && t.symbol !== undefined, '| last=', t.last);
    // fetchOrderBook
    const ob = await ex.fetchOrderBook (handle);
    console.log ('fetchOrderBook: symbol(value)=', ob.symbol, '| bids=', ob.bids.length, '| asks=', ob.asks.length);
    // positions use safePredictionPosition
    const pos = await ex.fetchPositions ();
    console.log ('fetchPositions:', pos.length, pos.length ? ('first.outcome=' + pos[0].outcome) : '(none)');
}

main ().catch ((e) => { console.error ('ERR', e.constructor.name, e.message); process.exit (1); });
