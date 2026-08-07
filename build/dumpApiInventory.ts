// Dumps, for every exchange, the implicit-API endpoints together with the
// api-tree path they live at and the exchange's official documentation URLs.
// Used to drive the docs-based classification of return shapes.
//
//     npx tsx build/dumpApiInventory.ts > /tmp/inventory.json

import ccxt from '../ts/ccxt.js';
import fs from 'fs';

const capitalize = (s: string): string => {
    return s.length ? (s.charAt (0).toUpperCase () + s.slice (1)) : s;
};

function lowercaseFirstLetter (s: string): string {
    return s.charAt (0).toLowerCase () + s.slice (1);
}

function isHttpMethod (method: string): boolean {
    return [ 'get', 'post', 'put', 'delete', 'patch' ].includes (method);
}

type Endpoint = {
    'method': string;
    'verb': string;
    'path': string;
    'apiPath': string[];
    'leaf': string;
};

function walk (api: any, out: Endpoint[], paths: string[] = []) {
    for (const key of Object.keys (api)) {
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
                const pattern = /[^a-zA-Z0-9]/g;
                const result = paths.concat (key).concat (endpoint.split (pattern)).filter ((r) => r.length > 0);
                const method = lowercaseFirstLetter (result.map (capitalize).join (''));
                out.push ({
                    'method': method,
                    'verb': key.toUpperCase (),
                    'path': endpoint,
                    'apiPath': paths.concat (key),
                    'leaf': Array.isArray (value) ? 'array' : (typeof value[endpoint]),
                });
            }
        } else {
            walk (value, out, paths.concat ([ key ]));
        }
    }
}

const result: any = {};
const namespaces: any[] = [ [ ccxt, '' ], [ (ccxt as any).prediction, 'prediction/' ] ];
for (const [ namespace, prefix ] of namespaces) {
    const ids = namespace.exchanges || Object.keys (namespace);
    for (const id of ids) {
        if (typeof namespace[id] !== 'function') {
            continue;
        }
        let instance: any;
        try {
            instance = new namespace[id] ();
        } catch (e) {
            continue;
        }
        const endpoints: Endpoint[] = [];
        walk (instance.api || {}, endpoints);
        const urls = instance.urls || {};
        const parent = Object.getPrototypeOf (Object.getPrototypeOf (instance)).constructor.name;
        result[prefix + id] = {
            'doc': urls['doc'],
            'www': urls['www'],
            'parent': parent,
            'endpoints': endpoints,
        };
    }
}
process.stdout.write (JSON.stringify (result));
