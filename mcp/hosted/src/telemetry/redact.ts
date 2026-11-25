// Pure helpers that decide what may leave the process. They run on top of the PostHog
// SDK's own sanitizer, which its docs say "cannot detect every secret": this layer is the
// one we control and test. Every function returns a new value and never throws on odd
// input (cycles, getters that throw, non-JSON values), because a failure here must not
// turn into a crash or into an unredacted event.

export const REDACTED = '[redacted]';

// Credential-like argument names, compared after lower-casing and dropping everything but
// letters and digits, so apiKey, api_key, API-KEY and x-api-key all match. Covers every
// name in ccxt's requiredCredentials (apiKey, secret, uid, login, password, twofa,
// privateKey, walletAddress, token) plus the usual HTTP and wallet spellings.
const SECRET_KEY_PARTS: readonly string[] = [
    'apikey', 'apisecret', 'secret', 'password', 'passwd', 'passphrase', 'privatekey',
    'accesstoken', 'refreshtoken', 'token', 'twofa', 'totp', 'walletaddress', 'mnemonic',
    'seedphrase', 'signature', 'authorization', 'cookie', 'credential', 'bearer',
];
// short names that are only credentials when they are the whole name ("uid" must not
// redact "guid", "key" must not redact "monkey")
const SECRET_KEY_EXACT: ReadonlySet<string> = new Set ([
    'uid', 'login', 'otp', 'key', 'pk', 'sk', 'jwt', 'auth', 'pin', 'seed', 'wallet', 'pass', 'pwd',
]);

export function isSecretKey (key: string): boolean {
    const normalized = String (key).toLowerCase ().replace (/[^a-z0-9]/g, '');
    if (SECRET_KEY_EXACT.has (normalized)) {
        return true;
    }
    return SECRET_KEY_PARTS.some ((part) => normalized.includes (part));
}

// Values that are secrets whatever key holds them. Best effort, by shape, so a key the
// user pastes into the chat (and the model copies into an argument or into `context`) is
// caught in the formats exchanges actually issue:
// - PostHog and OpenAI-style keys, PEM headers, bearer values, JWTs (with signature);
// - a credential word followed by a value ("my api key is X", "password: X", "apiKey=X");
// - 32+ character tokens mixing upper case, lower case and digits, base64 or url-safe
//   (Binance keys, Kraken/Bitstamp/Coinbase secrets) — a checksummed EVM wallet address
//   (0x + 40 hex) is public and stays;
// - 32+ hex characters (OKX secrets, HMAC keys, a 32-byte EVM private key);
// - UUIDs (OKX and KuCoin API keys).
// Every pattern stays within one token or the words right before it, so redaction can
// replace just the match inside free text.
const TOKEN_CHAR = 'A-Za-z0-9+\\/=_-';
const SECRET_VALUE_SOURCES: readonly (readonly [ string, string ])[] = [
    [ '\\bph[cxs]_[A-Za-z0-9]{16,}', '' ],
    [ '\\bsk-[A-Za-z0-9_-]{8,}', '' ],
    [ '-----BEGIN [A-Z ]*(?:PRIVATE KEY|CERTIFICATE)-----', '' ],
    [ '\\bbearer\\s+[A-Za-z0-9._~+\\/-]{8,}=*', 'i' ],
    [ '\\beyJ[A-Za-z0-9_-]{8,}\\.eyJ[A-Za-z0-9_-]{8,}(?:\\.[A-Za-z0-9_-]+)?', '' ],
    [ '\\b(?:api[\\s_-]?(?:key|secret)|secret(?:[\\s_-]?key)?|passw(?:or)?d|pass[\\s_-]?phrase|private[\\s_-]?key|mnemonic|seed[\\s_-]?phrase)\\b[\\s:=]{0,3}(?:is[\\s:]{1,3})?["\']?[^\\s"\'<>,;]{6,}', 'i' ],
    [ '(?<![' + TOKEN_CHAR + '])(?!0x[0-9a-fA-F]{40}(?![' + TOKEN_CHAR + ']))(?=[' + TOKEN_CHAR + ']*[A-Z])(?=[' + TOKEN_CHAR + ']*[a-z])(?=[' + TOKEN_CHAR + ']*[0-9])[' + TOKEN_CHAR + ']{32,}', '' ],
    [ '(?<![A-Za-z0-9])(?:0x)?[0-9a-fA-F]{32,}(?![A-Za-z0-9])(?<!0x[0-9a-fA-F]{40})', '' ],
    [ '\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\b', '' ],
];
const SECRET_VALUE_PATTERNS: readonly RegExp[] = SECRET_VALUE_SOURCES.map (([ source, flags ]) => new RegExp (source, flags));
const SECRET_VALUE_PATTERNS_GLOBAL: readonly RegExp[] = SECRET_VALUE_SOURCES.map (([ source, flags ]) => new RegExp (source, flags + 'g'));

export function looksLikeSecret (text: string): boolean {
    return SECRET_VALUE_PATTERNS.some ((pattern) => pattern.test (text));
}

// replaces only the secret-shaped parts of free text (error messages echo the caller's
// arguments, `context` is the model's own words), so the rest stays readable
export function redactSecretsInText (text: string): string {
    let out = String (text);
    for (const pattern of SECRET_VALUE_PATTERNS_GLOBAL) {
        pattern.lastIndex = 0;
        out = out.replace (pattern, REDACTED);
    }
    return out;
}

export interface ScrubLimits {
    maxString: number;
    maxArray: number;
    maxKeys: number;
    maxDepth: number;
}

export const PARAMETER_LIMITS: ScrubLimits = { 'maxString': 256, 'maxArray': 20, 'maxKeys': 50, 'maxDepth': 6 };

export function truncateString (text: string, max: number): string {
    return (text.length > max) ? (text.slice (0, max) + '…[truncated ' + (text.length - max) + ' chars]') : text;
}

function scrubAt (value: unknown, limits: ScrubLimits, depth: number, seen: WeakSet<object>): unknown {
    if (typeof value === 'string') {
        return truncateString (redactSecretsInText (value), limits.maxString);
    }
    if (value === null || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'bigint') {
        return String (value);
    }
    if (typeof value !== 'object') {
        // functions, symbols, undefined: not data
        return undefined;
    }
    if (seen.has (value as object)) {
        return '[cycle]';
    }
    if (depth >= limits.maxDepth) {
        return '[depth]';
    }
    seen.add (value as object);
    if (Array.isArray (value)) {
        const out: unknown[] = value.slice (0, limits.maxArray).map ((item) => scrubAt (item, limits, depth + 1, seen));
        if (value.length > limits.maxArray) {
            out.push ('[' + (value.length - limits.maxArray) + ' more]');
        }
        return out;
    }
    const out: Record<string, unknown> = {};
    let keys: string[] = [];
    try {
        keys = Object.keys (value as object);
    } catch (e) {
        return '[unreadable]';
    }
    for (const key of keys.slice (0, limits.maxKeys)) {
        if (isSecretKey (key)) {
            out[key] = REDACTED;
            continue;
        }
        let item: unknown;
        try {
            item = (value as Record<string, unknown>)[key];
        } catch (e) {
            item = '[unreadable]';
        }
        const scrubbed = scrubAt (item, limits, depth + 1, seen);
        if (scrubbed !== undefined) {
            out[key] = scrubbed;
        }
    }
    if (keys.length > limits.maxKeys) {
        out['$more_keys'] = keys.length - limits.maxKeys;
    }
    return out;
}

// Redacts credential-like keys anywhere (nested objects, arrays), replaces secret-looking
// values and caps strings, arrays, key counts and depth.
export function scrub (value: unknown, limits: ScrubLimits = PARAMETER_LIMITS): unknown {
    return scrubAt (value, limits, 0, new WeakSet ());
}

export function jsonSize (value: unknown): number {
    try {
        const json = JSON.stringify (value);
        return (json === undefined) ? 0 : Buffer.byteLength (json, 'utf8');
    } catch (e) {
        return 0;
    }
}

// Keeps a value whole when its JSON fits in maxBytes, otherwise a marker with its size and
// a prefix of its (already scrubbed) JSON.
export function capJson (value: unknown, maxBytes: number): unknown {
    let json: string | undefined;
    try {
        json = JSON.stringify (value);
    } catch (e) {
        return '[unserializable]';
    }
    if (json === undefined || Buffer.byteLength (json, 'utf8') <= maxBytes) {
        return value;
    }
    return { '$truncated': true, 'bytes': Buffer.byteLength (json, 'utf8'), 'preview': json.slice (0, maxBytes) };
}

// The JSON-RPC request the SDK records as $mcp_parameters, made safe to send: the request's
// _meta goes (it can carry per-user host identifiers such as openai/subject), the rest is
// scrubbed and the whole is capped.
export function sanitizeParameters (parameters: unknown, maxBytes: number): unknown {
    let value = parameters;
    const request = (value as any)?.request;
    if (request !== undefined && request !== null && typeof request === 'object' && request.params !== undefined && request.params !== null && typeof request.params === 'object' && '_meta' in request.params) {
        const params = { ...request.params };
        delete params['_meta'];
        value = { ...(value as object), 'request': { ...request, params } };
    }
    return capJson (scrub (value), maxBytes);
}

// "/srv/app/node_modules/x/y.js" -> "node_modules/x/y.js"; a path under appRoot becomes
// relative to it; any other absolute path keeps only its file name. The deployment's
// directory layout (and a user name in a home directory) never reaches Error Tracking.
export function relativizePath (filename: string, appRoot: string): string {
    let path = String (filename);
    if (path.startsWith ('file://')) {
        path = path.slice ('file://'.length);
    }
    const isAbsolute = path.startsWith ('/') || /^[A-Za-z]:[\\/]/.test (path);
    if (!isAbsolute) {
        return path;
    }
    path = path.replace (/\\/g, '/');
    const modules = path.lastIndexOf ('/node_modules/');
    if (modules !== -1) {
        return path.slice (modules + 1);
    }
    const root = appRoot.replace (/\\/g, '/').replace (/\/+$/, '') + '/';
    if (root.length > 1 && path.startsWith (root)) {
        return path.slice (root.length);
    }
    const slash = path.lastIndexOf ('/');
    return path.slice (slash + 1);
}

// absolute paths inside free text (error messages): "/home/u/app/x.ts:3" -> "x.ts:3". The
// lookbehind keeps URLs ("https://host/a/b") intact.
const ABSOLUTE_PATH_IN_TEXT = /(?<![\w:/.~-])(?:file:\/\/)?\/(?:[^\s/'"()<>:]+\/)+([^\s/'"()<>:]+)/g;

export function stripPathsInText (text: string): string {
    return String (text).replace (ABSOLUTE_PATH_IN_TEXT, '$1');
}

// stripPathsInText on every string of an (already scrubbed, so acyclic and bounded) value
export function stripPathsDeep (value: unknown): unknown {
    if (typeof value === 'string') {
        return stripPathsInText (value);
    }
    if (Array.isArray (value)) {
        return value.map (stripPathsDeep);
    }
    if (value !== null && typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const [ key, item ] of Object.entries (value as Record<string, unknown>)) {
            out[key] = stripPathsDeep (item);
        }
        return out;
    }
    return value;
}
