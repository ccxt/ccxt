import { AsyncLocalStorage } from 'async_hooks';

export interface ToolCallRecord {
    tool: string | undefined;
    exchange: string | undefined;
    ok: boolean;
    code: string | undefined; // error code when ok is false
    ms: number;
}

export interface HtmlServedRecord {
    uri: string; // the ui:// resource that was asked for
    file: string; // the file on disk it was read from
    bytes: number;
    via: 'resource' | 'tool'; // resources/read, or the read_market_widget tool
}

export interface RequestContext {
    requestId: string;
    ip: string | undefined;
    onToolCall: (record: ToolCallRecord) => void;
    onHtmlServed: (record: HtmlServedRecord) => void;
}

// Set by the hosted HTTP entry for the lifetime of one request, so the shared tool wrapper
// can report each call against the request that made it. Unset under stdio — there the
// wrapper logs nothing.
export const requestContext = new AsyncLocalStorage<RequestContext> ();
