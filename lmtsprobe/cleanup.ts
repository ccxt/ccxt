import ccxt from '../js/ccxt.js';
import fs from 'fs';

async function main () {
    const k = JSON.parse (fs.readFileSync ('keys.local.json', 'utf8')).limitless;
    const ex = new (ccxt as any).prediction.limitless ({ 'apiKey': k.apiKey, 'secret': k.secret, 'walletAddress': k.walletAddress });
    await ex.loadMarkets ();
    const clob = (Object.values (ex.markets) as any[]).filter ((m) => m.info && m.info.venue && m.info.venue.exchange && m.info.slug);
    let canceled = 0;
    let checked = 0;
    for (const m of clob) {
        checked++;
        if (checked > 60) break;
        try {
            const orders = await ex.limitlessPrivateGetMarketsSlugUserOrders ({ 'slug': m.info.slug, 'statuses': [ 'LIVE' ] });
            for (const o of orders) {
                try { await ex.limitlessPrivateDeleteOrdersOrderId ({ 'order_id': o.id }); console.log ('canceled', o.id, 'on', m.info.slug); canceled++; } catch (e) { /* ignore */ }
            }
        } catch (e) { /* ignore */ }
    }
    console.log ('checked', checked, 'markets, canceled', canceled, 'stray order(s)');
}

main ().catch ((e) => { console.error ('ERR', e.message); process.exit (1); });
