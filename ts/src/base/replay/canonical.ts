const MATCHING_PROFILE = 'ccxt-http-v1';
interface RequestDescriptor {
    method: string;
    api: string;
    path: string;
    params: any;
}

function apiToString (api: any): string {
    if (Array.isArray (api)) {
        return api.join ('/');
    }
    if (api === undefined || api === null) {
        return '';
    }
    return String (api);
}

function canonicalize (value: any): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null || typeof value !== 'object') {
        return value;
    }
    if (Array.isArray (value)) {
        const items = [];
        for (let i = 0; i < value.length; i++) {
            const item = canonicalize (value[i]);
            items.push ((item === undefined) ? null : item);
        }
        return items;
    }
    const keys = Object.keys (value).sort ();
    const result: any = {};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const item = canonicalize (value[key]);
        if (item !== undefined) {
            result[key] = item;
        }
    }
    return result;
}

function canonicalDescriptor (descriptor: RequestDescriptor, ignoreParams: string[] = []): RequestDescriptor {
    let params = descriptor.params;
    if (params !== null && typeof params === 'object' && !Array.isArray (params) && ignoreParams.length > 0) {
        params = { ...params };
        for (let i = 0; i < ignoreParams.length; i++) {
            delete params[ignoreParams[i]];
        }
    }
    return {
        'method': String (descriptor.method).toUpperCase (),
        'api': apiToString (descriptor.api),
        'path': descriptor.path,
        'params': canonicalize (params),
    };
}

function requestKey (instanceId: string, descriptor: RequestDescriptor, ignoreParams: string[] = []): string {
    return JSON.stringify ({ 'instanceId': instanceId, ...canonicalDescriptor (descriptor, ignoreParams) });
}

function firstDifference (expected: any, actual: any, prefix: string = ''): string | undefined {
    const typeE = (expected === null) ? 'null' : typeof expected;
    const typeA = (actual === null) ? 'null' : typeof actual;
    if (typeE !== typeA) {
        return prefix || '(root)';
    }
    if (typeE !== 'object') {
        return (expected === actual) ? undefined : (prefix || '(root)');
    }
    if (Array.isArray (expected) !== Array.isArray (actual)) {
        return prefix || '(root)';
    }
    if (Array.isArray (expected)) {
        const length = Math.max (expected.length, actual.length);
        for (let i = 0; i < length; i++) {
            const diff = firstDifference (expected[i], actual[i], prefix + '[' + i + ']');
            if (diff !== undefined) {
                return diff;
            }
        }
        return undefined;
    }
    const keys = Array.from (new Set ([ ...Object.keys (expected), ...Object.keys (actual) ])).sort ();
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const diff = firstDifference (expected[key], actual[key], prefix ? (prefix + '.' + key) : key);
        if (diff !== undefined) {
            return diff;
        }
    }
    return undefined;
}

function descriptorFromUrl (method: string, url: string): RequestDescriptor {
    let path = url;
    const params: any = {};
    const queryIndex = url.indexOf ('?');
    if (queryIndex !== -1) {
        path = url.slice (0, queryIndex);
        const search = new URLSearchParams (url.slice (queryIndex + 1));
        search.forEach ((value, key) => {
            params[key] = value;
        });
    }
    return { 'method': method, 'api': 'raw', 'path': path, 'params': params };
}

function stripQuery (url: string): string {
    const queryIndex = url.indexOf ('?');
    return (queryIndex === -1) ? url : url.slice (0, queryIndex);
}

export { MATCHING_PROFILE, RequestDescriptor, apiToString, canonicalize, canonicalDescriptor, requestKey, firstDifference, descriptorFromUrl, stripQuery };
