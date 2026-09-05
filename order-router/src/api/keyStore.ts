import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync, openSync, fsyncSync, closeSync, statSync, unlinkSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Logger } from 'pino';
import { DEV_API_KEY } from './auth.js';

export interface ApiKeyRecord {
    // The human-readable display id ('k_…'). Kept as `id` so every existing consumer — the rate
    // limiter's bucket key, the WS connection map, every log line — is unchanged.
    id: string;
    // The database primary key. Never appears in a log line; used to attribute request rows.
    keyUuid?: string;
    userId?: string;
    name: string;
    hash: string;
    last4: string;
    createdAt: string;
    createdBy: string;
    revokedAt: string | null;
    lastUsedAt: string | null;
    note: string;
    // Per-key overrides of the service defaults. null means "use the global setting".
    rateLimitMax: number | null;
    wsMaxConnections: number | null;
}

export interface KeyFile {
    version: number;
    keys: ApiKeyRecord[];
}

export const KEY_FILE_VERSION = 1;
export const KEY_PATTERN = /^or_(live|test)_[A-Za-z0-9_-]{43}$/;
export const LEGACY_KEY_ID = 'k_legacy';
export const DEV_KEY_ID = 'k_dev';

// 32 CSPRNG bytes, base64url so the value is safe unescaped in a header, a URL, a shell argument
// and a JSON string. The `or_live_` prefix is not decoration: secret scanners (gitleaks,
// trufflehog, GitHub push protection) match on distinctive literal prefixes, and a bare 43-char
// base64 blob is indistinguishable from a hash or a nonce and will never be caught. The realistic
// leak is a key pasted into a repo or a chat message, not a breach of this file.
export function generateKey (): string {
    return `or_live_${randomBytes(32).toString('base64url')}`;
}

export function hashKey (key: string): string {
    return createHash('sha256').update(key, 'utf8').digest('hex');
}

// Bare unsalted SHA-256, no KDF — deliberate, and the reasoning belongs next to the code because it
// looks wrong to password-storage instincts. The secret is 256 bits from a CSPRNG, not a
// human-chosen password: there is no dictionary and no reuse, so the offline-guessing attack a KDF
// defends against does not exist. bcrypt/argon2 would cost milliseconds per request against a
// ~300µs route computation. And a per-key salt would be actively harmful here: salted hashes cannot
// be looked up, forcing an O(N) loop that reintroduces a "which key matched" timing signal and
// hands an attacker a CPU-amplification lever. Unsalted digests are exactly what makes the O(1)
// lookup below constant-time by construction.
export class ApiKeyStore {
    // hex digest -> record. Revoked keys are absent rather than flagged, so revocation is a
    // load-time filter rather than a branch on every request.
    private byHash = new Map<string, ApiKeyRecord>();
    private all: ApiKeyRecord[] = [];
    private lastMtimeMs = -1;
    private pollTimer: NodeJS.Timeout | undefined;
    // Counts digests and map hits so a test can assert the lookup is O(1) by construction rather
    // than by timing it. The O(N)-iteration mistake is then caught structurally.
    lookupOps = { digests: 0, mapGets: 0 };
    private reloadListeners: (() => void)[] = [];
    // Key ids that are currently active, for consumers that hold an id rather than a secret —
    // notably open WebSockets, which authenticated once at upgrade and must be closed on revoke.
    private activeIds = new Set<string>();

    constructor (
        private readonly path: string,
        private readonly logger: Logger,
        // The well-known development key is OPT-IN, and off by default. It used to install itself
        // whenever the active key set was empty, which meant the single most security-critical
        // operation in the system — revoking a compromised key — silently replaced a secret
        // credential with one published in this repository. Making it explicit means no deployment
        // can arrive at it by accident, and the MCP process (which asserts a strictly stronger
        // fail-closed contract) simply never passes it.
        private readonly allowDevFallback = false,
    ) {}

    // Throws on a malformed file. Callers at boot let it propagate (refusing to start beats running
    // with an unknown key set); reload() catches and keeps the previous snapshot.
    load (): void {
        this.swap(this.build());
    }

    private swap (built: { byHash: Map<string, ApiKeyRecord>; all: ApiKeyRecord[] }): void {
        // A single assignment of a freshly-built Map, so no request can observe a half-built one.
        this.byHash = built.byHash;
        this.all = built.all;
        this.activeIds = new Set([...built.byHash.values()].map((r) => r.id));
    }

    onReload (listener: () => void): void {
        this.reloadListeners.push(listener);
    }

    hasActiveId (id: string): boolean {
        return this.activeIds.has(id);
    }

    private build (): { byHash: Map<string, ApiKeyRecord>; all: ApiKeyRecord[] } {
        const byHash = new Map<string, ApiKeyRecord>();
        let all: ApiKeyRecord[] = [];
        let raw: string | undefined;
        let fileExists = true;
        try {
            raw = readFileSync(this.path, 'utf8');
            this.lastMtimeMs = statSync(this.path).mtimeMs;
        } catch (err) {
            fileExists = false;
            const code = (err as NodeJS.ErrnoException).code;
            if (code !== 'ENOENT') throw err;
            // Missing at boot must NOT be fatal, or deploying the code before creating the file
            // bricks startup. A malformed file is a different matter — see reload().
            this.logger.warn({ path: this.path }, 'no API key file; only the env/dev bridge will authenticate');
        }

        if (raw !== undefined) {
            const parsed = JSON.parse(raw) as KeyFile;
            if (parsed.version !== KEY_FILE_VERSION) {
                throw new Error(`unsupported key file version ${parsed.version}, expected ${KEY_FILE_VERSION}`);
            }
            if (!Array.isArray(parsed.keys)) throw new Error('key file has no keys array');
            for (const record of parsed.keys) {
                // A stored-but-unenforced field is a footgun: an operator sets scopes, assumes they
                // are enforced, and they are not. Reject rather than ignore.
                if ('scopes' in (record as object)) {
                    throw new Error(`key ${record.id} declares scopes, which version ${KEY_FILE_VERSION} does not enforce`);
                }
                if (typeof record.id !== 'string' || typeof record.hash !== 'string') {
                    throw new Error('key file contains a row without an id or hash');
                }
            }
            all = parsed.keys;
        }

        const tombstoned = new Set(all.filter((r) => r.revokedAt !== null).map((r) => r.id));
        for (const record of all) {
            if (record.revokedAt !== null) continue;
            byHash.set(record.hash, record);
        }

        // Migration bridge: the existing shared env key is loaded as a synthetic record, so the old
        // and new schemes are valid simultaneously and no client has to change in lockstep with a
        // deploy. A revoked k_legacy row in the file kills it on the next 10s poll — which is what
        // lets the shared key be retired WITHOUT the restart this whole design exists to avoid.
        //
        // That row cannot come from the projection: k_legacy is synthetic, built from the
        // environment, and has no row in api_keys for the projector to select. It is written by
        // hand (see README § Retiring the shared key), and projectKeys carries it across its
        // rewrites — without which the projector erased the tombstone within seconds and this
        // paragraph described something that could not happen.
        // The literals below are what an unset variable looks like after shell or compose
        // interpolation; accepting one as a credential would make a misconfiguration authenticate.
        const envRaw = process.env['ORDER_ROUTER_API_KEY'];
        const envKey = (envRaw === undefined || envRaw.trim().length === 0
            || envRaw === 'undefined' || envRaw === 'null')
            ? undefined
            : envRaw;
        // The dev literal is PUBLISHED in this repository, so it is not a credential wherever it
        // comes from. It used to be reachable here rather than through the dev fallback below,
        // which meant it authenticated with none of that path's gating and none of its warnings —
        // a compose file defaulting the variable to it (as ours did) silently produced a live
        // service anyone could call. Refuse it on this path unless the dev fallback is explicitly
        // permitted, in which case the block below owns it and says so loudly.
        if (envKey === DEV_API_KEY && !this.allowDevFallback) {
            this.logger.error(
                'ORDER_ROUTER_API_KEY is set to the published development key. Refusing to load '
                + 'it as a credential — set a real key.',
            );
        } else if (envKey !== undefined && !tombstoned.has(LEGACY_KEY_ID)) {
            byHash.set(hashKey(envKey), syntheticRecord(LEGACY_KEY_ID, 'legacy-shared-key', envKey));
        }

        // Dev fallback. Gated on CONFIGURATION — no key file on disk at all, and no env var — and
        // never on how many keys survived revocation. That distinction is the whole point: gating
        // on the active set meant that revoking the last key, which is exactly what an operator
        // does when a key leaks, emptied the map and installed `dev-local-key-change-me` as a live
        // credential within one 10s poll. The operator believes they have cut off all access; they
        // have in fact swapped a secret credential for a public one, and activeCount() still reads
        // 1 so nothing looks wrong. It also has to be explicitly permitted by the caller, so a
        // production process cannot reach it however the files on disk end up.
        if (this.allowDevFallback && !fileExists && envKey === undefined && !tombstoned.has(DEV_KEY_ID)) {
            this.logger.warn(
                'USING THE INSECURE DEFAULT DEV API KEY. Set ORDER_ROUTER_API_KEY or create a key '
                + 'with `npm run keys:create` before exposing this service.',
            );
            byHash.set(hashKey(DEV_API_KEY), syntheticRecord(DEV_KEY_ID, 'insecure-dev-key', DEV_API_KEY));
        }

        return { byHash, all };
    }

    // One digest, one Map hit. Never iterates: a loop calling timingSafeEqual per record would be
    // O(N) AND would leak the matching key's position through runtime, which is a real oracle plus
    // a CPU-amplification lever for an attacker sending long garbage keys.
    lookup (presented: string): ApiKeyRecord | undefined {
        this.lookupOps.digests += 1;
        const digest = hashKey(presented);
        this.lookupOps.mapGets += 1;
        const record = this.byHash.get(digest);
        // In memory only. Persisting on every request would put a disk write on a ~0.3ms path and
        // make the file a contended read-write resource; a periodic flusher merges it instead.
        if (record !== undefined) record.lastUsedAt = new Date().toISOString();
        return record;
    }

    activeCount (): number {
        return this.byHash.size;
    }

    listAll (): ApiKeyRecord[] {
        return this.all;
    }

    // Never throws. A fat-fingered edit must not wipe the live store — that would turn a typo into
    // a total outage — so a failed parse keeps the previous snapshot and logs loudly.
    reload (): boolean {
        try {
            this.swap(this.build());
            for (const listener of this.reloadListeners) {
                try {
                    listener();
                } catch (err) {
                    this.logger.error({ err }, 'a key reload listener threw');
                }
            }
            return true;
        } catch (err) {
            this.logger.error({ err, path: this.path }, 'API key file failed to reload; keeping the previous key set');
            return false;
        }
    }

    // An mtime poll, not fs.watch: atomic-rename writes make fs.watch fire inconsistently across
    // platforms (reporting on an inode we no longer hold, double-firing, or missing entirely). Ten
    // syscalls a minute is free, and it removes the dangerous failure — an operator revoking a
    // compromised key, forgetting the reload, and the key working indefinitely with no error
    // anywhere. A revocation that silently does not revoke is a security bug, not an inconvenience.
    startPolling (intervalMs: number): void {
        if (this.pollTimer !== undefined) return;
        this.pollTimer = setInterval(() => {
            let mtimeMs: number;
            try {
                mtimeMs = statSync(this.path).mtimeMs;
            } catch {
                return;
            }
            if (mtimeMs === this.lastMtimeMs) return;
            this.lastMtimeMs = mtimeMs;
            if (this.reload()) {
                this.logger.info({ activeKeys: this.byHash.size }, 'API key file reloaded');
            }
        }, intervalMs);
        this.pollTimer.unref();
    }

    // There is deliberately NO lastUsedAt flusher. Persisting it meant a periodic whole-file
    // read-modify-write racing the CLI, which can lose whatever the CLI wrote in between — and the
    // thing the CLI writes is a revocation. A background task that can silently un-revoke a killed
    // key is not worth a convenience field. "Which key is unused and can be revoked?" is answered
    // better by the access log, which carries keyId on every request with a real timestamp:
    //   jq -r 'select(.event=="request") | .keyName' router.log | sort | uniq -c
    // lastUsedAt stays in the record as an in-memory-only hint and is never written back.

    stop (): void {
        if (this.pollTimer !== undefined) clearInterval(this.pollTimer);
        this.pollTimer = undefined;
    }
}

function syntheticRecord (id: string, name: string, plaintext: string): ApiKeyRecord {
    return {
        id, name,
        hash: hashKey(plaintext),
        last4: plaintext.slice(-4),
        createdAt: new Date(0).toISOString(),
        createdBy: 'environment',
        revokedAt: null,
        lastUsedAt: null,
        note: 'synthetic record; not stored in the key file',
        rateLimitMax: null,
        wsMaxConnections: null,
    };
}

export function readKeyFile (path: string): KeyFile {
    try {
        const parsed = JSON.parse(readFileSync(path, 'utf8')) as KeyFile;
        if (parsed.version !== KEY_FILE_VERSION) {
            throw new Error(`unsupported key file version ${parsed.version}`);
        }
        return parsed;
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            return { version: KEY_FILE_VERSION, keys: [] };
        }
        throw err;
    }
}

// Write to a temp file in the same directory, fsync, then rename. rename() within a filesystem is
// atomic, so a concurrent reader sees either the whole old file or the whole new one — never a
// truncation. chmod happens before any content is written, so the digests never briefly exist
// world-readable.
// Returns true when the file's contents actually changed. The projection runs every few seconds
// and almost never has news; without this it would rewrite and log on every tick.
export function writeKeyFile (path: string, file: KeyFile): boolean {
    // The very first `keys create` on a fresh box runs before the directory exists — which is step
    // 2 of the documented migration, so an uncaught ENOENT here would break the rollout at its
    // first command.
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    const next = `${JSON.stringify(file, null, 2)}\n`;
    try {
        if (readFileSync(path, 'utf8') === next) return false;
    } catch {
        // Missing or unreadable: fall through and write it.
    }
    const tmp = `${path}.tmp.${process.pid}`;
    writeFileSync(tmp, '', { mode: 0o600 });
    writeFileSync(tmp, next, { mode: 0o600 });
    const fd = openSync(tmp, 'r');
    try {
        fsyncSync(fd);
    } finally {
        closeSync(fd);
    }
    try {
        renameSync(tmp, path);
    } catch (err) {
        try { unlinkSync(tmp); } catch { /* best effort */ }
        throw err;
    }
    return true;
}
