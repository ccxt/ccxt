// Single choke point for secret redaction. Holds every credential value loaded from
// config/env/keychain and replaces exact occurrences in any outbound text (tool results,
// error messages, log lines, journal records). Secrets shorter than MIN_SECRET_LENGTH are
// not registered — replacing e.g. a 2-char string would mangle unrelated output, and no
// real exchange credential is that short.

const MIN_SECRET_LENGTH = 6;

const secrets = new Map<string, string> (); // value -> label

// returns true only when this call ADDED the value — a caller that registers something
// provisionally (the setup form, for values that may never be saved) uses that to know which
// registrations are its own to take back
export function registerSecret (value: string | undefined, label: string): boolean {
    if (typeof value !== 'string' || value.length < MIN_SECRET_LENGTH) {
        return false;
    }
    const added = !secrets.has (value);
    secrets.set (value, label);
    return added;
}

// Takes back a provisional registration. Only for values that were never put to use (a
// connection test that was not followed by a save): a value left registered forever would keep
// rewriting unrelated output — someone who pasted "BTC/USDT" into a key field by mistake would
// see every later result mangled. Never call it for a value an account is using.
export function unregisterSecret (value: string | undefined): void {
    if (typeof value === 'string') {
        secrets.delete (value);
    }
}

export function clearSecrets (): void {
    secrets.clear ();
}

export function redact (text: string): string {
    if (typeof text !== 'string' || text.length === 0 || secrets.size === 0) {
        return text;
    }
    let result = text;
    for (const [ value, label ] of secrets) {
        if (result.includes (value)) {
            result = result.split (value).join ('[redacted:' + label + ']');
        }
        // secrets can also appear URI-encoded inside signed URLs echoed by exchange errors
        const encoded = encodeURIComponent (value);
        if (encoded !== value && result.includes (encoded)) {
            result = result.split (encoded).join ('[redacted:' + label + ']');
        }
    }
    return result;
}

export function redactObject<T> (value: T): T {
    if (secrets.size === 0) {
        return value;
    }
    const json = JSON.stringify (value, (k, v) => ((v === undefined) ? null : v));
    if (json === undefined) {
        return value;
    }
    return JSON.parse (redact (json));
}
