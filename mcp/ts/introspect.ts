import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ccxt } from './ccxt-loader.js';

// signature introspection ported from cli/ts/helpers.ts getArgsWithOptionality
export function getArgsWithOptionality (func: any): { requiredArgs: string[], optionalArgs: string[], error: boolean } {
    const funcStr = func.toString ();
    if (funcStr.includes ('[native code]') || funcStr.length < 20) {
        return { 'requiredArgs': [], 'optionalArgs': [], 'error': true };
    }
    const cleaned = funcStr.replace (/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    const argsMatch = cleaned.match (/^[\s\S]*?\(([^)]*)\)/);
    if (!argsMatch) {
        return { 'requiredArgs': [], 'optionalArgs': [], 'error': true };
    }
    const rawArgs = argsMatch[1].split (',').map ((arg: string) => arg.trim ()).filter (Boolean);
    const requiredArgs: string[] = [];
    const optionalArgs: string[] = [];
    rawArgs.forEach ((arg: string, index: number) => {
        const isOptional = arg.includes ('=') || index >= func.length;
        const name = arg.split ('=')[0].trim ();
        if (isOptional) {
            optionalArgs.push (name);
        } else {
            requiredArgs.push (name);
        }
    });
    return { requiredArgs, optionalArgs, 'error': false };
}

export const PARAM_INFO: Record<string, { description: string, example?: string }> = {
    'symbol': { 'description': 'unified market symbol — "BTC/USDT" for spot, "BTC/USDT:USDT" for a linear swap/perpetual, "BTC/USD:BTC" for inverse; an outcome handle on prediction exchanges. Derivatives-only methods (funding rate, open interest, positions) need the :SETTLE form', 'example': 'BTC/USDT or BTC/USDT:USDT' },
    'symbols': { 'description': 'array of unified market symbols', 'example': '["BTC/USDT", "ETH/USDT"]' },
    'outcome': { 'description': 'prediction outcome handle', 'example': 'TRUMP_WIN_2024:YES' },
    'outcomes': { 'description': 'array of prediction outcome handles' },
    'since': { 'description': 'timestamp in ms (or ISO8601 string) of the earliest entry to fetch', 'example': '1672531200000' },
    'limit': { 'description': 'maximum number of entries to return', 'example': '100' },
    'timeframe': { 'description': 'candlestick interval', 'example': '1h' },
    'params': { 'description': 'extra exchange-specific parameters — discover supported keys with describe_method', 'example': '{ "until": 1673000000000 }' },
    'id': { 'description': 'order id', 'example': '1234567890' },
    'code': { 'description': 'unified currency code', 'example': 'USDT' },
    'price': { 'description': 'price per unit', 'example': '26000.5' },
    'side': { 'description': 'order side: buy or sell' },
    'type': { 'description': 'order type, usually limit or market' },
    'amount': { 'description': 'amount of base currency (contracts on derivatives, shares on prediction markets)' },
};

export interface MethodSignature {
    method: string;
    usage: string;
    args: { name: string, required: boolean, description: string, example?: string }[];
    error?: string;
}

export function methodSignature (exchange: any, methodName: string): MethodSignature {
    const fn = exchange[methodName];
    if (typeof fn !== 'function') {
        return { 'method': methodName, 'usage': '', 'args': [], 'error': 'not a function' };
    }
    const { requiredArgs, optionalArgs, error } = getArgsWithOptionality (fn);
    if (error) {
        return { 'method': methodName, 'usage': methodName + ' (introspection unavailable)', 'args': [] };
    }
    const usage = methodName + ' ' + requiredArgs.map ((arg) => '<' + arg + '>').concat (optionalArgs.map ((arg) => '[' + arg + ']')).join (' ');
    const describeArg = (name: string, required: boolean) => {
        const info = PARAM_INFO[name] ?? { 'description': '' };
        return { name, required, 'description': info.description, 'example': info.example };
    };
    return {
        'method': methodName,
        usage,
        'args': requiredArgs.map ((arg) => describeArg (arg, true)).concat (optionalArgs.map ((arg) => describeArg (arg, false))),
    };
}

export function unifiedMethods (exchange: any): string[] {
    return Object.keys (exchange.has ?? {}).filter ((method) => exchange.has[method]);
}

// implicit method names are built by defineRestApi as <section><Verb><CamelPath>
// (e.g. sapiGetCapitalConfigGetall) — the FIRST camel-boundary verb token is the HTTP verb
const VERB_PATTERN = /(Get|Post|Put|Delete|Patch)(?=[A-Z0-9]|$)/;

export function implicitVerb (methodName: string): string | undefined {
    const match = VERB_PATTERN.exec (methodName);
    return match ? match[1] : undefined;
}

export function isImplicitMethod (exchange: any, methodName: string): boolean {
    // implicit endpoints are OWN instance properties assigned by defineRestApi — the
    // own-property guard keeps base prototype helpers with verb-shaped names
    // (handlePostOnly, ethGetAddressFromPrivateKey, …) out of the callable surface
    if (!Object.prototype.hasOwnProperty.call (exchange, methodName)) {
        return false;
    }
    if (typeof exchange[methodName] !== 'function') {
        return false;
    }
    if (implicitVerb (methodName) === undefined) {
        return false;
    }
    // unified methods never carry a camel verb token, but keep them excluded explicitly
    return exchange.has?.[methodName] === undefined;
}

export function listImplicitMethods (exchange: any, verb?: string): string[] {
    const names = new Set<string> ();
    for (const key of Object.keys (exchange)) {
        if (isImplicitMethod (exchange, key) && (verb === undefined || implicitVerb (key) === verb)) {
            names.add (key);
        }
    }
    return [ ...names ].sort ();
}

// optional build-time JSDoc manifest (scripts/build-doc-manifest.mjs); when absent,
// describe_method falls back to runtime signature introspection
export interface DocManifestEntry {
    description?: string;
    params?: { name: string, type?: string, optional?: boolean, description?: string }[];
    returns?: string;
    see?: string[];
}

let docManifest: { base?: Record<string, DocManifestEntry>, exchanges?: Record<string, Record<string, DocManifestEntry>> } | undefined;
let docManifestLoaded = false;

export function loadDocManifest (): typeof docManifest {
    if (docManifestLoaded) {
        return docManifest;
    }
    docManifestLoaded = true;
    try {
        const here = path.dirname (fileURLToPath (import.meta.url));
        const manifestPath = path.join (here, 'data', 'method-docs.json');
        if (fs.existsSync (manifestPath)) {
            docManifest = JSON.parse (fs.readFileSync (manifestPath).toString ());
        }
    } catch (e) {
        docManifest = undefined;
    }
    return docManifest;
}

export function methodDocs (exchangeId: string | undefined, methodName: string): DocManifestEntry | undefined {
    const manifest = loadDocManifest ();
    if (manifest === undefined) {
        return undefined;
    }
    if (exchangeId !== undefined) {
        const perExchange = manifest.exchanges?.[exchangeId]?.[methodName];
        if (perExchange !== undefined) {
            return perExchange;
        }
    }
    // base Exchange.ts documents few methods directly; binance is the most completely
    // documented implementation, so it serves as the generic reference when no
    // exchange-specific doclet exists
    return manifest.base?.[methodName] ?? manifest.exchanges?.['binance']?.[methodName];
}

// per-exchange, per-method feature support slice from exchange.features
export function featuresSlice (exchange: any, methodName: string): any {
    const features = exchange.features;
    if (features === null || features === undefined) {
        return undefined;
    }
    const result: Record<string, any> = {};
    for (const [ marketType, block ] of Object.entries (features)) {
        if (block === null || typeof block !== 'object') {
            continue;
        }
        if ((block as any)[methodName] !== undefined) {
            result[marketType] = (block as any)[methodName];
        } else {
            // derivatives are nested one level deeper: features.swap.linear.createOrder
            for (const [ subType, subBlock ] of Object.entries (block as any)) {
                if (subBlock !== null && typeof subBlock === 'object' && (subBlock as any)[methodName] !== undefined) {
                    result[marketType + '.' + subType] = (subBlock as any)[methodName];
                }
            }
        }
    }
    return (Object.keys (result).length > 0) ? result : undefined;
}

export function baseExchangeInstance (): any {
    return new ccxt.Exchange ();
}
