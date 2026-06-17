import ccxt from '../js/ccxt.js';
import fs from 'fs';
async function main () {
    const keys = JSON.parse (fs.readFileSync ('keys.local.json', 'utf8')).limitless;
    const ex = new (ccxt as any).prediction.limitless ({ 'apiKey': keys.apiKey, 'secret': keys.secret });
    await ex.loadMarkets ();
    let outcome = undefined;
    for (const m of Object.values (ex.markets) as any[]) {
        if (m.info && m.info.venue && m.info.venue.exchange && m.outcomes && m.outcomes.length) { outcome = m.outcomes[0].symbol; break; }
    }
    for (const fn of [
        async () => ex.cancelOrder ('11111111-1111-4111-8111-111111111111', outcome),
        async () => ex.cancelOrders ([ '11111111-1111-4111-8111-111111111111' ], outcome),
    ]) {
        try { await fn (); console.log ('OK'); } catch (e) { console.log ('ERR', e.message); }
    }
}
main ().catch ((e) => console.error (e.message));
