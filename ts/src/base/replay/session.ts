import { ReplayIncomplete, RecorderError, ReplayUnsupported } from './errors.js';

async function loadFs (): Promise<any> {
    try {
        const fsModule = await import (/* webpackIgnore: true */ 'fs');
        return fsModule.default || fsModule;
    } catch (error: any) {
        throw new ReplayUnsupported ('record/replay needs a filesystem, which this runtime does not provide: ' + error.message);
    }
}
const SCHEMA_VERSION = '1.0';
const SCHEMA_MAJOR = 1;
const PRODUCER_NAME = 'ccxt-recorder';
const PRODUCER_VERSION = '0.1.0';
const EVENT_TYPES = [ 'http.request', 'http.response', 'http.error', 'http.redacted' ];
interface InstanceInfo {
    instanceId: string;
    exchangeId: string;
    environment: string;
}
interface SessionHeader {
    type: 'session.start';
    schemaVersion: string;
    sessionId: string;
    startedAt: string;
    producer: { name: string, version: string };
    runtime: { language: string, ccxtVersion: string };
    instances: InstanceInfo[];
    matchingProfile: string;
    privacyProfile: string;
    replayability: string;
    clockUnit: string;
}
interface SessionFooter {
    type: 'session.end';
    seq: number;
    atUs: number;
    eventCount: number;
    complete: boolean;
    sanitizedEvents: number;
    redactedRequests: number;
}
interface SessionEvent {
    type: string;
    seq: number;
    atUs: number;
    instanceId: string;
    requestId: string;
    request?: { method: string, api: string, path: string, params: any, url: string };
    status?: number;
    statusText?: string;
    headers?: { [key: string]: string };
    bodyText?: string;
    bodyUnsupported?: string;
    kind?: string;
    message?: string;
    reason?: string;
    sanitized?: boolean;
}
interface WriterLimits {
    maxEvents: number;
    maxBodyBytes: number;
    maxQueueBytes: number;
}
interface Session {
    header: SessionHeader;
    events: SessionEvent[];
    footer: SessionFooter | undefined;
    truncatedLine: number | undefined;
    file: string;
}
interface ValidationResult {
    valid: boolean;
    replayable: boolean;
    errors: string[];
    warnings: string[];
}
class SessionWriter {
    file: string;
    limits: WriterLimits;
    onError: ((error: Error) => void) | undefined;
    stream: any = undefined;
    failed: Error | undefined = undefined;
    eventCount: number = 0;
    pendingBytes: number = 0;
    closed: boolean = false;

    constructor (file: string, limits: WriterLimits, onError: ((error: Error) => void) | undefined) {
        this.file = file;
        this.limits = limits;
        this.onError = onError;
    }

    async open (): Promise<void> {
        const fs = await loadFs ();
        const stream = fs.createWriteStream (this.file, { 'flags': 'w', 'encoding': 'utf8' });
        this.stream = stream;
        await new Promise<void> ((resolve, reject) => {
            stream.once ('open', () => resolve ());
            stream.once ('error', (error: any) => reject (new RecorderError ('recorder could not open ' + this.file + ': ' + error.message)));
        });
        stream.on ('error', (error: any) => this.fail (new RecorderError ('recorder write failed: ' + error.message)));
    }

    writeHeader (header: SessionHeader): void {
        this.writeLine (JSON.stringify (header));
    }

    fail (error: Error): void {
        if (this.failed !== undefined) {
            return;
        }
        this.failed = error;
        if (this.onError !== undefined) {
            this.onError (error);
        }
    }

    writeLine (line: string): void {
        if (this.failed !== undefined || this.stream === undefined || this.closed) {
            return;
        }
        const bytes = Buffer.byteLength (line, 'utf8') + 1;
        if (this.pendingBytes + bytes > this.limits.maxQueueBytes) {
            this.fail (new RecorderError ('recorder queue overflow: ' + (this.pendingBytes + bytes) + ' bytes queued, limit ' + this.limits.maxQueueBytes));
            return;
        }
        this.pendingBytes += bytes;
        this.stream.write (line + '\n', () => {
            this.pendingBytes -= bytes;
        });
    }

    writeEvent (line: string, bodyBytes: number): boolean {
        if (this.failed !== undefined) {
            return false;
        }
        if (this.eventCount + 1 > this.limits.maxEvents) {
            this.fail (new RecorderError ('recorder event limit reached: ' + this.limits.maxEvents));
            return false;
        }
        if (bodyBytes > this.limits.maxBodyBytes) {
            this.fail (new RecorderError ('recorder body limit exceeded: ' + bodyBytes + ' bytes, limit ' + this.limits.maxBodyBytes));
            return false;
        }
        this.eventCount += 1;
        this.writeLine (line);
        return this.failed === undefined;
    }

    async close (footer: SessionFooter | undefined): Promise<void> {
        if (this.closed || this.stream === undefined) {
            return;
        }
        this.closed = true;
        const stream = this.stream;
        if (footer !== undefined && this.failed === undefined) {
            this.closed = false;
            this.writeLine (JSON.stringify (footer));
            this.closed = true;
        }
        await new Promise<void> ((resolve) => {
            stream.end (() => resolve ());
        });
    }
}

async function readSession (file: string): Promise<Session> {
    const fs = await loadFs ();
    let content: string;
    try {
        content = await fs.promises.readFile (file, 'utf8');
    } catch (error: any) {
        throw new ReplayIncomplete ('replay could not read ' + file + ': ' + error.message);
    }
    const lines = content.split ('\n');
    const trailing = lines.pop ();
    let truncatedLine: number | undefined = undefined;
    if (trailing !== undefined && trailing.length > 0) {
        truncatedLine = lines.length + 1;
    }
    if (lines.length === 0) {
        throw new ReplayIncomplete ('replay session ' + file + ' is empty');
    }
    const records: any[] = [];
    for (let i = 0; i < lines.length; i++) {
        try {
            records.push (JSON.parse (lines[i]));
        } catch (error: any) {
            throw new ReplayIncomplete ('replay session ' + file + ' has an unparseable line ' + (i + 1) + ': ' + error.message);
        }
    }
    const header = records[0];
    if (header === undefined || header['type'] !== 'session.start') {
        throw new ReplayIncomplete ('replay session ' + file + ' does not start with session.start');
    }
    const major = parseInt (String (header['schemaVersion']).split ('.')[0], 10);
    if (major !== SCHEMA_MAJOR) {
        throw new ReplayIncomplete ('replay session ' + file + ' has unsupported schemaVersion ' + header['schemaVersion'] + ', supported major version is ' + SCHEMA_MAJOR);
    }
    let footer: SessionFooter | undefined = undefined;
    const events: SessionEvent[] = [];
    for (let i = 1; i < records.length; i++) {
        const record = records[i];
        if (record['type'] === 'session.end') {
            footer = record;
        } else {
            events.push (record);
        }
    }
    return { header, events, footer, truncatedLine, file };
}

function validateSession (session: Session): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const header = session.header;
    if (header.matchingProfile === undefined) {
        errors.push ('header is missing matchingProfile');
    }
    if (!Array.isArray (header.instances) || header.instances.length === 0) {
        errors.push ('header declares no instances');
    }
    if (header.clockUnit !== 'microseconds') {
        errors.push ('unsupported clockUnit ' + header.clockUnit);
    }
    const instanceIds = new Set ((header.instances || []).map ((instance) => instance.instanceId));
    const requests: { [requestId: string]: SessionEvent } = {};
    const terminals: { [requestId: string]: number } = {};
    let lastSeq = 0;
    let lastAtUs = -1;
    let redacted = 0;
    let unsupportedBodies = 0;
    for (let i = 0; i < session.events.length; i++) {
        const event = session.events[i];
        const where = 'event ' + (i + 1) + ' (seq ' + event.seq + ')';
        if (EVENT_TYPES.indexOf (event.type) === -1) {
            errors.push (where + ': unknown type ' + event.type);
            continue;
        }
        if (typeof event.seq !== 'number' || event.seq <= lastSeq) {
            errors.push (where + ': seq is not strictly increasing');
        } else {
            lastSeq = event.seq;
        }
        if (typeof event.atUs !== 'number' || event.atUs < 0 || event.atUs < lastAtUs) {
            errors.push (where + ': atUs is not nondecreasing');
        } else {
            lastAtUs = event.atUs;
        }
        if (!instanceIds.has (event.instanceId)) {
            errors.push (where + ': unknown instanceId ' + event.instanceId);
        }
        if (event.type === 'http.request' || event.type === 'http.redacted') {
            if (event.requestId in requests) {
                errors.push (where + ': duplicate requestId ' + event.requestId);
            }
            requests[event.requestId] = event;
            if (event.type === 'http.redacted') {
                redacted += 1;
            } else if (event.request === undefined) {
                errors.push (where + ': http.request without request descriptor');
            }
        } else {
            const request = requests[event.requestId];
            if (request === undefined) {
                errors.push (where + ': terminal for unknown requestId ' + event.requestId);
            } else if (request.type === 'http.redacted') {
                errors.push (where + ': terminal for redacted requestId ' + event.requestId);
            }
            if (event.requestId in terminals) {
                errors.push (where + ': second terminal for requestId ' + event.requestId);
            }
            terminals[event.requestId] = i;
            if (event.type === 'http.response') {
                if (typeof event.status !== 'number') {
                    errors.push (where + ': http.response without numeric status');
                }
                if (event.bodyUnsupported !== undefined) {
                    unsupportedBodies += 1;
                } else if (typeof event.bodyText !== 'string') {
                    errors.push (where + ': http.response without bodyText');
                }
            } else if (typeof event.kind !== 'string') {
                errors.push (where + ': http.error without kind');
            }
        }
    }
    const requestIds = Object.keys (requests);
    const openRequests = [];
    for (let i = 0; i < requestIds.length; i++) {
        const requestId = requestIds[i];
        if (requests[requestId].type === 'http.request' && !(requestId in terminals)) {
            openRequests.push (requestId);
        }
    }
    if (openRequests.length > 0) {
        warnings.push ('requests without a terminal event: ' + openRequests.join (', '));
    }
    if (session.truncatedLine !== undefined) {
        errors.push ('line ' + session.truncatedLine + ' is truncated');
    }
    if (session.footer === undefined) {
        errors.push ('session.end footer is missing, the recording did not close cleanly');
    } else {
        if (session.footer.complete !== true) {
            errors.push ('session.end reports an incomplete recording');
        }
        if (session.footer.eventCount !== session.events.length) {
            errors.push ('session.end eventCount ' + session.footer.eventCount + ' does not match ' + session.events.length + ' events');
        }
    }
    if (redacted > 0) {
        warnings.push (redacted + ' request(s) were redacted under privacy profile ' + header.privacyProfile + ' and cannot be replayed');
    }
    if (unsupportedBodies > 0) {
        warnings.push (unsupportedBodies + ' response(s) carry an unsupported body encoding and cannot be replayed');
    }
    return {
        'valid': errors.length === 0,
        'replayable': errors.length === 0 && redacted === 0 && unsupportedBodies === 0,
        errors,
        warnings,
    };
}

function inspectSession (session: Session): any {
    const validation = validateSession (session);
    let requests = 0;
    let responses = 0;
    let transportErrors = 0;
    let redacted = 0;
    let sanitized = 0;
    let lastAtUs = 0;
    const byInstance: { [instanceId: string]: number } = {};
    for (let i = 0; i < session.events.length; i++) {
        const event = session.events[i];
        if (event.type === 'http.request') {
            requests += 1;
            byInstance[event.instanceId] = (byInstance[event.instanceId] || 0) + 1;
        } else if (event.type === 'http.response') {
            responses += 1;
        } else if (event.type === 'http.error') {
            transportErrors += 1;
        } else if (event.type === 'http.redacted') {
            redacted += 1;
        }
        if (event.sanitized === true) {
            sanitized += 1;
        }
        if (typeof event.atUs === 'number' && event.atUs > lastAtUs) {
            lastAtUs = event.atUs;
        }
    }
    return {
        'file': session.file,
        'sessionId': session.header.sessionId,
        'schemaVersion': session.header.schemaVersion,
        'ccxtVersion': session.header.runtime ? session.header.runtime.ccxtVersion : undefined,
        'privacyProfile': session.header.privacyProfile,
        'matchingProfile': session.header.matchingProfile,
        'instances': session.header.instances,
        'events': session.events.length,
        'requests': requests,
        'requestsByInstance': byInstance,
        'responses': responses,
        'transportErrors': transportErrors,
        'redactedRequests': redacted,
        'sanitizedEvents': sanitized,
        'durationUs': lastAtUs,
        'complete': session.footer !== undefined && session.footer.complete === true && session.truncatedLine === undefined,
        'replayable': validation.replayable,
        'errors': validation.errors,
        'warnings': validation.warnings,
    };
}

export {
    SCHEMA_VERSION,
    PRODUCER_NAME,
    PRODUCER_VERSION,
    InstanceInfo,
    SessionHeader,
    SessionFooter,
    SessionEvent,
    WriterLimits,
    Session,
    ValidationResult,
    SessionWriter,
    readSession,
    validateSession,
    inspectSession,
    loadFs,
};
