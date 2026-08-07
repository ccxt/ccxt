// dump every implicit-API endpoint's rate limit cost, exactly as the throttler
// would see it, so a before/after diff proves no rate limit moved
import ccxt from '../ts/ccxt.js';
import fs from 'fs';

function isHttpMethod (m: string): boolean {
    return [ 'get', 'post', 'put', 'delete', 'patch' ].includes (m);
}

const capitalize = (s: string): string => (s.length ? (s.charAt (0).toUpperCase () + s.slice (1)) : s);

function walk (api: any, out: any, paths: string[] = []) {
    for (const key of Object.keys (api || {})) {
        const value = api[key];
        if (isHttpMethod (key)) {
            let endpoints: string[] = [];
            if (Array.isArray (value)) {
                for (const item of value) {
                    endpoints.push (Array.isArray (item) ? item[0] : item);
                }
            } else if (value) {
                endpoints = Object.keys (value);
            }
            for (const endpoint of endpoints) {
                const parts = paths.concat ([ key ]).concat (endpoint.split (/[^a-zA-Z0-9]/)).filter ((p) => p.length > 0);
                const camel = parts.map (capitalize).join ('');
                const name = camel.charAt (0).toLowerCase () + camel.slice (1);
                let config: any = Array.isArray (value) ? {} : value[endpoint];
                if (typeof config === 'number') {
                    config = { 'cost': config };
                }
                // the whole leaf, so any extra key (byLimit, byType, noSymbol...)
                // that reaches the request path is compared too
                out[name] = JSON.stringify (config);
            }
        } else if (value && typeof value === 'object') {
            walk (value, out, paths.concat ([ key ]));
        }
    }
}

const all = JSON.parse (fs.readFileSync ('./exchanges.json', 'utf8'));
const result: any = {};
for (const id of all.ids) {
    const instance = new (ccxt as any)[id] ();
    let api = instance.api;
    if (id in (ccxt as any).pro) {
        api = new (ccxt as any).pro[id] ().api;
    }
    const out: any = {};
    walk (api, out);
    result[id] = out;
}
for (const id of (all.prediction || [])) {
    const instance = new (ccxt as any).prediction[id] ();
    const out: any = {};
    walk (instance.api, out);
    result['prediction/' + id] = out;
}
process.stdout.write (JSON.stringify (result, null, 1) + '\n');
