import { RequestTimeout, NetworkError } from '../errors.js';
import { RecorderError, ReplayUnsupported } from './errors.js';
import { MATCHING_PROFILE, RequestDescriptor, apiToString, canonicalize, descriptorFromUrl, stripQuery } from './canonical.js';
import { SCHEMA_VERSION, PRODUCER_NAME, PRODUCER_VERSION, InstanceInfo, SessionHeader, SessionFooter, SessionEvent, SessionWriter } from './session.js';

type PrivacyProfile = 'local' | 'shareable';
interface RecorderOptions {
    file: string;
    privacy?: PrivacyProfile;
    sessionId?: string;
    maxEvents?: number;
    maxBodyBytes?: number;
    maxQueueBytes?: number;
    onError?: (error: Error) => void;
}
interface RecorderAttachOptions {
    instanceId: string;
    environment?: string;
}
interface RecorderStatus {
    complete: boolean;
    failed: Error | undefined;
    eventCount: number;
    sanitizedEvents: number;
    redactedRequests: number;
}
interface AttachedInstance {
    instanceId: string;
    exchange: any;
    slot: RequestDescriptor | undefined;
    originals: { sign: any, fetch: any, handleRestResponse: any };
    own: { [name: string]: boolean };
}

function restore (exchange: any, name: string, original: any, own: boolean): void {
    if (own) {
        exchange[name] = original;
    } else {
        delete exchange[name];
    }
}
interface RequestContext {
    requestId: string;
    instanceId: string;
    terminal: boolean;
}
const CREDENTIAL_FIELDS = [ 'apiKey', 'secret', 'password', 'uid', 'token', 'privateKey', 'walletAddress', 'login', 'twofa' ];

function headersToObject (headers: any): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    if (headers === undefined || headers === null) {
        return result;
    }
    if (typeof headers.forEach === 'function') {
        headers.forEach ((value: any, key: string) => {
            result[key.toLowerCase ()] = String (value);
        });
        return result;
    }
    const keys = Object.keys (headers);
    for (let i = 0; i < keys.length; i++) {
        const value = headers[keys[i]];
        result[keys[i].toLowerCase ()] = Array.isArray (value) ? value.join (', ') : String (value);
    }
    return result;
}

function isPublicApi (api: string): boolean {
    return api.toLowerCase ().indexOf ('public') !== -1;
}

async function loadAsyncLocalStorage (): Promise<any> {
    try {
        const asyncHooks = await import (/* webpackIgnore: true */ 'async_hooks');
        return asyncHooks.AsyncLocalStorage;
    } catch (error: any) {
        throw new ReplayUnsupported ('recorder needs async_hooks, which this runtime does not provide: ' + error.message);
    }
}

async function installedCcxtVersion (): Promise<string> {
    try {
        const ccxt = await import ('../../../ccxt.js');
        return ccxt.version;
    } catch (error) {
        return 'unknown';
    }
}
class Recorder {
    options: RecorderOptions;
    privacy: PrivacyProfile;
    writer: SessionWriter;
    storage: any;
    startedAt: string;
    t0: number;
    seq: number = 0;
    lastAtUs: number = 0;
    requestCounter: number = 0;
    sanitizedEvents: number = 0;
    redactedRequests: number = 0;
    headerWritten: boolean = false;
    closed: boolean = false;
    instances: InstanceInfo[] = [];
    attached: AttachedInstance[] = [];
    ccxtVersion: string = 'unknown';

    constructor (options: RecorderOptions, writer: SessionWriter, storage: any) {
        this.options = options;
        this.privacy = options.privacy || 'local';
        this.writer = writer;
        this.storage = storage;
        this.startedAt = new Date ().toISOString ();
        this.t0 = performance.now ();
    }

    static async open (options: RecorderOptions): Promise<Recorder> {
        if (options === undefined || typeof options.file !== 'string' || options.file.length === 0) {
            throw new RecorderError ('Recorder.open requires a file path');
        }
        const privacy = options.privacy || 'local';
        if (privacy !== 'local' && privacy !== 'shareable') {
            throw new RecorderError ('unknown privacy profile ' + privacy + ', expected local or shareable');
        }
        const AsyncLocalStorage = await loadAsyncLocalStorage ();
        const writer = new SessionWriter (options.file, {
            'maxEvents': options.maxEvents || 100000,
            'maxBodyBytes': options.maxBodyBytes || 64 * 1024 * 1024,
            'maxQueueBytes': options.maxQueueBytes || 256 * 1024 * 1024,
        }, options.onError);
        const recorder = new Recorder (options, writer, new AsyncLocalStorage ());
        recorder.ccxtVersion = await installedCcxtVersion ();
        await writer.open ();
        return recorder;
    }

    get status (): RecorderStatus {
        return {
            'complete': this.closed && this.writer.failed === undefined,
            'failed': this.writer.failed,
            'eventCount': this.writer.eventCount,
            'sanitizedEvents': this.sanitizedEvents,
            'redactedRequests': this.redactedRequests,
        };
    }

    nowUs (): number {
        const elapsed = Math.round ((performance.now () - this.t0) * 1000);
        this.lastAtUs = Math.max (this.lastAtUs, elapsed);
        return this.lastAtUs;
    }

    header (): SessionHeader {
        return {
            'type': 'session.start',
            'schemaVersion': SCHEMA_VERSION,
            'sessionId': this.options.sessionId || ('session-' + this.startedAt.replace (/[^0-9]/g, '')),
            'startedAt': this.startedAt,
            'producer': { 'name': PRODUCER_NAME, 'version': PRODUCER_VERSION },
            'runtime': { 'language': 'javascript', 'ccxtVersion': this.ccxtVersion },
            'instances': this.instances,
            'matchingProfile': MATCHING_PROFILE,
            'privacyProfile': this.privacy + '-v1',
            'replayability': (this.privacy === 'local') ? 'complete' : 'public-only',
            'clockUnit': 'microseconds',
        };
    }

    ensureHeader (): void {
        if (!this.headerWritten) {
            this.headerWritten = true;
            this.writer.writeHeader (this.header ());
        }
    }

    credentialValues (): string[] {
        const values: string[] = [];
        for (let i = 0; i < this.attached.length; i++) {
            const exchange = this.attached[i].exchange;
            for (let j = 0; j < CREDENTIAL_FIELDS.length; j++) {
                const value = exchange[CREDENTIAL_FIELDS[j]];
                if (typeof value === 'string' && value.length > 0 && values.indexOf (value) === -1) {
                    values.push (value);
                }
            }
        }
        return values;
    }

    scrub (line: string, values: string[]): { line: string, hit: boolean } {
        let hit = false;
        for (let i = 0; i < values.length; i++) {
            const raw = values[i];
            const escaped = JSON.stringify (raw).slice (1, -1);
            const candidates = (escaped === raw) ? [ raw ] : [ escaped, raw ];
            for (let j = 0; j < candidates.length; j++) {
                if (line.indexOf (candidates[j]) !== -1) {
                    hit = true;
                    line = line.split (candidates[j]).join ('[REDACTED]');
                }
            }
        }
        return { line, hit };
    }

    write (event: SessionEvent, bodyBytes: number = 0): void {
        if (this.closed || this.writer.failed !== undefined) {
            return;
        }
        this.ensureHeader ();
        const values = this.credentialValues ();
        let line = JSON.stringify (event);
        const scrubbed = this.scrub (line, values);
        line = scrubbed.line;
        if (scrubbed.hit) {
            event.sanitized = true;
            this.sanitizedEvents += 1;
            line = this.scrub (JSON.stringify (event), values).line;
        }
        this.writer.writeEvent (line, bodyBytes);
    }

    nextEvent (type: string, instanceId: string, requestId: string): SessionEvent {
        this.seq += 1;
        return { type, 'seq': this.seq, 'atUs': this.nowUs (), instanceId, requestId };
    }

    attach (exchange: any, options: RecorderAttachOptions): void {
        if (this.closed) {
            throw new RecorderError ('recorder is closed');
        }
        if (options === undefined || typeof options.instanceId !== 'string' || options.instanceId.length === 0) {
            throw new RecorderError ('attach requires an instanceId');
        }
        for (let i = 0; i < this.attached.length; i++) {
            if (this.attached[i].exchange === exchange) {
                throw new RecorderError ('exchange is already attached as ' + this.attached[i].instanceId);
            }
            if (this.attached[i].instanceId === options.instanceId) {
                throw new RecorderError ('instanceId ' + options.instanceId + ' is already attached');
            }
        }
        if (this.headerWritten) {
            throw new RecorderError ('attach all instances before the first request is recorded');
        }
        let environment = options.environment;
        if (environment === undefined) {
            environment = (exchange.isSandboxModeEnabled === true) ? 'sandbox' : 'live';
        }
        this.instances.push ({ 'instanceId': options.instanceId, 'exchangeId': exchange.id, environment });
        const state: AttachedInstance = {
            'instanceId': options.instanceId,
            exchange,
            'slot': undefined,
            'originals': { 'sign': exchange.sign, 'fetch': exchange.fetch, 'handleRestResponse': exchange.handleRestResponse },
            'own': {
                'sign': Object.prototype.hasOwnProperty.call (exchange, 'sign'),
                'fetch': Object.prototype.hasOwnProperty.call (exchange, 'fetch'),
                'handleRestResponse': Object.prototype.hasOwnProperty.call (exchange, 'handleRestResponse'),
            },
        };
        this.attached.push (state);
        const recorder = this;
        exchange.sign = function sign (path: string, api: any = [ 'public' ], method: string = 'GET', params: any = {}) {
            const snapshot = canonicalize (JSON.parse (JSON.stringify (params === undefined ? {} : params)));
            const request = state.originals.sign.call (exchange, path, api, method, params);
            state.slot = { method, 'api': apiToString (api), path, 'params': snapshot };
            return request;
        };
        exchange.fetch = async function recordedFetch (url: string, method: string = 'GET', headers: any = undefined, body: any = undefined) {
            const descriptor = (state.slot !== undefined) ? state.slot : descriptorFromUrl (method, url);
            state.slot = undefined;
            recorder.requestCounter += 1;
            const requestId = state.instanceId + '-r' + recorder.requestCounter;
            if (recorder.privacy === 'shareable' && !isPublicApi (descriptor.api)) {
                const redacted = recorder.nextEvent ('http.redacted', state.instanceId, requestId);
                redacted.reason = 'non-public route under the shareable privacy profile';
                recorder.redactedRequests += 1;
                recorder.write (redacted);
                return await state.originals.fetch.call (exchange, url, method, headers, body);
            }
            const event = recorder.nextEvent ('http.request', state.instanceId, requestId);
            event.request = {
                'method': descriptor.method,
                'api': descriptor.api,
                'path': descriptor.path,
                'params': descriptor.params,
                'url': stripQuery (url),
            };
            recorder.write (event);
            const context: RequestContext = { requestId, 'instanceId': state.instanceId, 'terminal': false };
            try {
                return await recorder.storage.run (context, () => state.originals.fetch.call (exchange, url, method, headers, body));
            } catch (error: any) {
                if (!context.terminal) {
                    context.terminal = true;
                    const failure = recorder.nextEvent ('http.error', state.instanceId, requestId);
                    if (error instanceof RequestTimeout) {
                        failure.kind = 'timeout';
                    } else if (error instanceof NetworkError) {
                        failure.kind = 'network';
                    } else {
                        failure.kind = 'other';
                    }
                    failure.message = (error !== undefined && error.message !== undefined) ? String (error.message) : String (error);
                    recorder.write (failure);
                }
                throw error;
            }
        };
        exchange.handleRestResponse = function handleRestResponse (response: any, url: string, method: string = 'GET', requestHeaders: any = undefined, requestBody: any = undefined) {
            const context: RequestContext | undefined = recorder.storage.getStore ();
            if (context === undefined || context.terminal) {
                return state.originals.handleRestResponse.call (exchange, response, url, method, requestHeaders, requestBody);
            }
            const responseHeaders = headersToObject (response.headers);
            if (exchange.handleContentTypeApplicationZip && responseHeaders['content-type'] === 'application/zip') {
                context.terminal = true;
                const event = recorder.nextEvent ('http.response', context.instanceId, context.requestId);
                event.status = response.status;
                event.statusText = response.statusText;
                event.headers = responseHeaders;
                event.bodyUnsupported = 'binary';
                recorder.write (event);
                return state.originals.handleRestResponse.call (exchange, response, url, method, requestHeaders, requestBody);
            }
            return response.text ().then ((text: string) => {
                context.terminal = true;
                const event = recorder.nextEvent ('http.response', context.instanceId, context.requestId);
                event.status = response.status;
                event.statusText = response.statusText;
                event.headers = responseHeaders;
                event.bodyText = text;
                recorder.write (event, Buffer.byteLength (text, 'utf8'));
                const replayable = {
                    'status': response.status,
                    'statusText': response.statusText,
                    'headers': response.headers,
                    'text': async () => text,
                };
                return state.originals.handleRestResponse.call (exchange, replayable, url, method, requestHeaders, requestBody);
            });
        };
    }

    detach (exchange: any): void {
        for (let i = 0; i < this.attached.length; i++) {
            const state = this.attached[i];
            if (state.exchange === exchange) {
                restore (exchange, 'sign', state.originals.sign, state.own['sign']);
                restore (exchange, 'fetch', state.originals.fetch, state.own['fetch']);
                restore (exchange, 'handleRestResponse', state.originals.handleRestResponse, state.own['handleRestResponse']);
                this.attached.splice (i, 1);
                return;
            }
        }
    }

    async close (): Promise<void> {
        if (this.closed) {
            return;
        }
        const attached = this.attached.slice ();
        for (let i = 0; i < attached.length; i++) {
            this.detach (attached[i].exchange);
        }
        this.ensureHeader ();
        this.closed = true;
        let footer: SessionFooter | undefined = undefined;
        if (this.writer.failed === undefined) {
            this.seq += 1;
            footer = {
                'type': 'session.end',
                'seq': this.seq,
                'atUs': this.nowUs (),
                'eventCount': this.writer.eventCount,
                'complete': true,
                'sanitizedEvents': this.sanitizedEvents,
                'redactedRequests': this.redactedRequests,
            };
        }
        await this.writer.close (footer);
    }
}

export { Recorder, RecorderOptions, RecorderAttachOptions, RecorderStatus, PrivacyProfile, headersToObject, restore, installedCcxtVersion };
