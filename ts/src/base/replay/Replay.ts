import { RequestTimeout, NetworkError } from '../errors.js';
import { ReplayError, ReplayMismatch, ReplayExhausted, ReplayDeadlock, ReplayIncomplete, ReplayUnsupported } from './errors.js';
import { MATCHING_PROFILE, RequestDescriptor, apiToString, canonicalize, canonicalDescriptor, requestKey, firstDifference, descriptorFromUrl } from './canonical.js';
import { Session, SessionEvent, readSession, validateSession, inspectSession } from './session.js';
import { restore, installedCcxtVersion } from './Recorder.js';

type ClockMode = 'virtual' | 'realtime';
interface ReplayOptions {
    file: string;
    matching?: 'strict';
    clock?: ClockMode;
    speed?: number;
    deadlockTimeoutMs?: number;
    allowIncomplete?: boolean;
    ignoreParams?: string[];
}
interface ReplayAttachOptions {
    instanceId: string;
    ignoreParams?: string[];
}
interface PendingRequest {
    requestId: string;
    instanceId: string;
    descriptor: RequestDescriptor;
    resolve: (response: SessionEvent) => void;
    reject: (error: Error) => void;
}
interface ReplayInstance {
    instanceId: string;
    exchange: any;
    slot: RequestDescriptor | undefined;
    ignoreParams: string[];
    originals: { [name: string]: any };
    own: { [name: string]: boolean };
}
interface ReplayReport {
    file: string;
    sessionId: string;
    clock: ClockMode;
    consumed: number;
    remaining: number;
    mismatches: string[];
    virtualElapsedUs: number;
    recordedCcxtVersion: string;
    installedCcxtVersion: string;
    versionMismatch: boolean;
    networkBlocked: boolean;
    warnings: string[];
}

function describe (instanceId: string, descriptor: RequestDescriptor): string {
    return instanceId + ' ' + descriptor.method + ' ' + descriptor.api + ' ' + descriptor.path + ' ' + JSON.stringify (descriptor.params);
}
class Replay {
    options: ReplayOptions;
    session: Session;
    clock: ClockMode;
    speed: number;
    deadlockTimeoutMs: number;
    warnings: string[];
    installedVersion: string = 'unknown';
    cursor: number = 0;
    nextRequestIndex: number = 0;
    consumedRequests: number = 0;
    totalRequests: number = 0;
    virtualNowUs: number = 0;
    pending: PendingRequest[] = [];
    mismatches: string[] = [];
    matchedKeys: { [key: string]: number } = {};
    instances: ReplayInstance[] = [];
    watchdog: any = undefined;
    pumping: boolean = false;
    pumpRequested: boolean = false;
    closed: boolean = false;

    constructor (options: ReplayOptions, session: Session, warnings: string[]) {
        this.options = options;
        this.session = session;
        this.clock = options.clock || 'virtual';
        this.speed = (options.speed !== undefined && options.speed > 0) ? options.speed : 1;
        this.deadlockTimeoutMs = (options.deadlockTimeoutMs !== undefined) ? options.deadlockTimeoutMs : 5000;
        this.warnings = warnings;
        for (let i = 0; i < session.events.length; i++) {
            if (session.events[i].type === 'http.request') {
                this.totalRequests += 1;
            }
        }
    }

    static async open (options: ReplayOptions): Promise<Replay> {
        if (options === undefined || typeof options.file !== 'string' || options.file.length === 0) {
            throw new ReplayError ('Replay.open requires a file path');
        }
        if (options.matching !== undefined && options.matching !== 'strict') {
            throw new ReplayUnsupported ('matching mode ' + options.matching + ' is not supported, only strict');
        }
        if (options.clock !== undefined && options.clock !== 'virtual' && options.clock !== 'realtime') {
            throw new ReplayUnsupported ('clock mode ' + options.clock + ' is not supported, use virtual or realtime');
        }
        const session = await readSession (options.file);
        const validation = validateSession (session);
        const warnings = validation.warnings.slice ();
        if (!validation.replayable) {
            const reasons = validation.errors.concat (validation.valid ? validation.warnings : []);
            if (options.allowIncomplete !== true) {
                throw new ReplayIncomplete ('replay session ' + options.file + ' is not fully replayable: ' + reasons.join ('; ') + ' (pass allowIncomplete to replay what was recorded)');
            }
            for (let i = 0; i < validation.errors.length; i++) {
                warnings.push (validation.errors[i]);
            }
        }
        if (session.header.matchingProfile !== MATCHING_PROFILE) {
            throw new ReplayUnsupported ('replay session uses matching profile ' + session.header.matchingProfile + ', this build supports ' + MATCHING_PROFILE);
        }
        const replay = new Replay (options, session, warnings);
        replay.installedVersion = await installedCcxtVersion ();
        const recorded = session.header.runtime ? session.header.runtime.ccxtVersion : undefined;
        if (recorded !== replay.installedVersion) {
            replay.warnings.push ('recorded with ccxt ' + recorded + ', replaying with ' + replay.installedVersion);
        }
        return replay;
    }

    static async inspect (file: string): Promise<any> {
        return inspectSession (await readSession (file));
    }

    static async validate (file: string): Promise<any> {
        return validateSession (await readSession (file));
    }

    attach (exchange: any, options: ReplayAttachOptions): void {
        if (this.closed) {
            throw new ReplayError ('replay is closed');
        }
        if (options === undefined || typeof options.instanceId !== 'string' || options.instanceId.length === 0) {
            throw new ReplayError ('attach requires an instanceId');
        }
        let known = false;
        for (let i = 0; i < this.session.header.instances.length; i++) {
            if (this.session.header.instances[i].instanceId === options.instanceId) {
                known = true;
            }
        }
        if (!known) {
            throw new ReplayError ('instanceId ' + options.instanceId + ' is not part of the recorded session');
        }
        for (let i = 0; i < this.instances.length; i++) {
            if (this.instances[i].exchange === exchange || this.instances[i].instanceId === options.instanceId) {
                throw new ReplayError ('exchange or instanceId ' + options.instanceId + ' is already attached');
            }
        }
        const names = [ 'sign', 'fetch', 'sleep', 'fetchImplementation', 'fetchImplementationLoading', 'client' ];
        const state: ReplayInstance = {
            'instanceId': options.instanceId,
            exchange,
            'slot': undefined,
            'ignoreParams': (options.ignoreParams || this.options.ignoreParams || []).slice (),
            'originals': {},
            'own': {},
        };
        for (let i = 0; i < names.length; i++) {
            state.originals[names[i]] = exchange[names[i]];
            state.own[names[i]] = Object.prototype.hasOwnProperty.call (exchange, names[i]);
        }
        this.instances.push (state);
        const replay = this;
        exchange.sign = function sign (path: string, api: any = [ 'public' ], method: string = 'GET', params: any = {}) {
            state.slot = { method, 'api': apiToString (api), path, 'params': canonicalize (JSON.parse (JSON.stringify (params === undefined ? {} : params))) };
            return { 'url': '', method, 'headers': {}, 'body': undefined };
        };
        exchange.fetch = async function replayedFetch (url: string, method: string = 'GET', headers: any = undefined, body: any = undefined) {
            const descriptor = (state.slot !== undefined) ? state.slot : descriptorFromUrl (method, url);
            state.slot = undefined;
            return await replay.handleFetch (state, descriptor);
        };
        if (this.clock === 'virtual') {
            exchange.sleep = async function sleep (milliseconds: number) {
                replay.virtualNowUs += Math.max (0, Math.round (milliseconds * 1000));
            };
        }
        exchange.fetchImplementation = function blockedFetch () {
            throw new ReplayUnsupported ('replay blocks live networking: ' + options.instanceId + ' tried to reach the network');
        };
        exchange.fetchImplementationLoading = Promise.resolve (exchange.fetchImplementation);
        if (typeof exchange.client === 'function') {
            exchange.client = function blockedClient (url: string) {
                throw new ReplayUnsupported ('replay does not support websocket connections yet: ' + options.instanceId + ' tried to open ' + url);
            };
        }
    }

    detach (exchange: any): void {
        for (let i = 0; i < this.instances.length; i++) {
            const state = this.instances[i];
            if (state.exchange === exchange) {
                const names = Object.keys (state.originals);
                for (let j = 0; j < names.length; j++) {
                    restore (exchange, names[j], state.originals[names[j]], state.own[names[j]]);
                }
                this.instances.splice (i, 1);
                return;
            }
        }
    }

    async handleFetch (state: ReplayInstance, descriptor: RequestDescriptor): Promise<any> {
        const event = this.matchRequest (state, descriptor);
        const terminal = await new Promise<SessionEvent> ((resolve, reject) => {
            this.pending.push ({ 'requestId': event.requestId, 'instanceId': state.instanceId, descriptor, resolve, reject });
            this.pump ();
        });
        if (terminal.type === 'http.error') {
            const message = terminal.message || '';
            if (terminal.kind === 'timeout') {
                throw new RequestTimeout (message);
            }
            if (terminal.kind === 'network') {
                throw new NetworkError (message);
            }
            throw new NetworkError (message);
        }
        if (terminal.bodyUnsupported !== undefined) {
            throw new ReplayUnsupported ('recorded response ' + terminal.requestId + ' has an unsupported body encoding: ' + terminal.bodyUnsupported);
        }
        const response = {
            'status': terminal.status,
            'statusText': terminal.statusText || '',
            'headers': terminal.headers || {},
            'text': async () => terminal.bodyText,
        };
        const request = event.request as { url: string, method: string };
        return await state.exchange.handleRestResponse (response, request.url, request.method, {}, undefined);
    }

    matchRequest (state: ReplayInstance, descriptor: RequestDescriptor): SessionEvent {
        const events = this.session.events;
        while (this.nextRequestIndex < events.length && events[this.nextRequestIndex].type !== 'http.request' && events[this.nextRequestIndex].type !== 'http.redacted') {
            this.nextRequestIndex += 1;
        }
        const key = requestKey (state.instanceId, descriptor, state.ignoreParams);
        const actual = { 'instanceId': state.instanceId, ...canonicalDescriptor (descriptor, state.ignoreParams) };
        if (this.nextRequestIndex >= events.length) {
            const matched = this.matchedKeys[key] || 0;
            const message = 'ReplayExhausted: no unused request matches\n' + 'request: ' + describe (state.instanceId, descriptor) + '\nmatched occurrences: ' + matched + '\nreceived occurrences: ' + (matched + 1);
            this.mismatches.push (message);
            throw new ReplayExhausted (message);
        }
        const expectedEvent = events[this.nextRequestIndex];
        if (expectedEvent.type === 'http.redacted') {
            const message = 'next recorded request ' + expectedEvent.requestId + ' was redacted at recording time and cannot be replayed';
            this.mismatches.push (message);
            throw new ReplayUnsupported (message);
        }
        const recorded = expectedEvent.request as { method: string, api: string, path: string, params: any };
        const expectedDescriptor: RequestDescriptor = { 'method': recorded.method, 'api': recorded.api, 'path': recorded.path, 'params': recorded.params };
        const expectedKey = requestKey (expectedEvent.instanceId, expectedDescriptor, state.ignoreParams);
        if (expectedKey !== key) {
            const expected = { 'instanceId': expectedEvent.instanceId, ...canonicalDescriptor (expectedDescriptor, state.ignoreParams) };
            const field = firstDifference (expected, actual) || '(root)';
            const message = 'ReplayMismatch: request does not match the next recorded request ' + expectedEvent.requestId + '\nexpected: ' + describe (expectedEvent.instanceId, expectedDescriptor) + '\nactual:   ' + describe (state.instanceId, descriptor) + '\nfirst difference: ' + field;
            this.mismatches.push (message);
            throw new ReplayMismatch (message, expected, actual, field);
        }
        this.matchedKeys[key] = (this.matchedKeys[key] || 0) + 1;
        this.nextRequestIndex += 1;
        this.consumedRequests += 1;
        this.virtualNowUs = Math.max (this.virtualNowUs, expectedEvent.atUs);
        return expectedEvent;
    }

    pump (): void {
        this.pumpRequested = true;
        if (this.pumping) {
            return;
        }
        this.pumping = true;
        const run = async () => {
            try {
                while (this.pumpRequested) {
                    this.pumpRequested = false;
                    await this.pumpLoop ();
                }
            } catch (error: any) {
                this.rejectAll (error);
            } finally {
                this.pumping = false;
                if (this.pending.length > 0 && this.watchdog === undefined) {
                    this.armWatchdog ();
                }
            }
        };
        run ();
    }

    async pumpLoop (): Promise<void> {
        const events = this.session.events;
        while (this.cursor < events.length) {
            const event = events[this.cursor];
            if (event.type === 'http.request' || event.type === 'http.redacted') {
                if (this.cursor < this.nextRequestIndex) {
                    this.cursor += 1;
                    continue;
                }
                return;
            }
            let index = -1;
            for (let i = 0; i < this.pending.length; i++) {
                if (this.pending[i].requestId === event.requestId) {
                    index = i;
                }
            }
            if (index === -1) {
                return;
            }
            this.disarmWatchdog ();
            if (this.clock === 'realtime') {
                const delayUs = event.atUs - this.virtualNowUs;
                if (delayUs > 0) {
                    await new Promise<void> ((resolve) => setTimeout (resolve, delayUs / 1000 / this.speed));
                }
            }
            this.virtualNowUs = Math.max (this.virtualNowUs, event.atUs);
            const waiter = this.pending[index];
            this.pending.splice (index, 1);
            this.cursor += 1;
            waiter.resolve (event);
        }
    }

    armWatchdog (): void {
        if (this.deadlockTimeoutMs <= 0) {
            return;
        }
        this.watchdog = setTimeout (() => {
            this.watchdog = undefined;
            if (this.pending.length === 0) {
                return;
            }
            const events = this.session.events;
            const awaited = (this.cursor < events.length) ? events[this.cursor] : undefined;
            let awaitedText = 'end of session';
            if (awaited !== undefined) {
                awaitedText = awaited.type + ' ' + awaited.requestId;
                if (awaited.request !== undefined) {
                    awaitedText += ' ' + describe (awaited.instanceId, awaited.request);
                }
            }
            const pendingText = this.pending.map ((item) => item.requestId + ' ' + describe (item.instanceId, item.descriptor)).join ('\n  ');
            const message = 'ReplayDeadlock: no progress for ' + this.deadlockTimeoutMs + ' ms\nawaiting: ' + awaitedText + '\npending operations:\n  ' + pendingText;
            this.mismatches.push (message);
            this.rejectAll (new ReplayDeadlock (message));
        }, this.deadlockTimeoutMs);
        if (this.watchdog.unref) {
            this.watchdog.unref ();
        }
    }

    disarmWatchdog (): void {
        if (this.watchdog !== undefined) {
            clearTimeout (this.watchdog);
            this.watchdog = undefined;
        }
    }

    rejectAll (error: Error): void {
        this.disarmWatchdog ();
        const pending = this.pending;
        this.pending = [];
        for (let i = 0; i < pending.length; i++) {
            pending[i].reject (error);
        }
    }

    now (): number {
        return this.virtualNowUs;
    }

    remaining (): SessionEvent[] {
        const result = [];
        for (let i = this.nextRequestIndex; i < this.session.events.length; i++) {
            const event = this.session.events[i];
            if (event.type === 'http.request' || event.type === 'http.redacted') {
                result.push (event);
            }
        }
        return result;
    }

    async assertConsumed (): Promise<void> {
        const remaining = this.remaining ();
        if (remaining.length > 0) {
            const lines = remaining.map ((event) => event.requestId + ((event.request !== undefined) ? (' ' + describe (event.instanceId, event.request)) : ' (redacted)'));
            throw new ReplayError ('replay has ' + remaining.length + ' unconsumed request(s):\n  ' + lines.join ('\n  '));
        }
        if (this.pending.length > 0) {
            throw new ReplayError ('replay has ' + this.pending.length + ' request(s) still waiting for a recorded response');
        }
    }

    report (): ReplayReport {
        const recorded = this.session.header.runtime ? this.session.header.runtime.ccxtVersion : 'unknown';
        return {
            'file': this.session.file,
            'sessionId': this.session.header.sessionId,
            'clock': this.clock,
            'consumed': this.consumedRequests,
            'remaining': this.totalRequests - this.consumedRequests,
            'mismatches': this.mismatches.slice (),
            'virtualElapsedUs': this.virtualNowUs,
            'recordedCcxtVersion': recorded,
            'installedCcxtVersion': this.installedVersion,
            'versionMismatch': recorded !== this.installedVersion,
            'networkBlocked': true,
            'warnings': this.warnings.slice (),
        };
    }

    async close (): Promise<void> {
        if (this.closed) {
            return;
        }
        this.closed = true;
        this.disarmWatchdog ();
        this.rejectAll (new ReplayError ('replay closed while requests were pending'));
        const instances = this.instances.slice ();
        for (let i = 0; i < instances.length; i++) {
            this.detach (instances[i].exchange);
        }
    }
}

export { Replay, ReplayOptions, ReplayAttachOptions, ReplayReport, ClockMode };
