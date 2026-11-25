import { defaultViewCatalog, type ViewName } from '../../ts/ui.js';

// A DOM to EXECUTE the browser code in (the views and their shared includes), which the other
// tests only parse. happy-dom runs the pages' own inline scripts
// unmodified; what it does not have is layout (every size is 0) and a canvas, so nothing here
// can say anything about geometry: the chart and depth plots, column hiding by width and the
// size reported to the host are covered by the Playwright preview, not by these tests.
//
// Writing tests against it: compare nodes with `assert.ok (a === b)`, never assert.equal (a, b)
// — when such an assertion fails, node:assert prints both values, and printing a DOM node
// walks the whole window (the test process then dies of memory instead of reporting).
//
// happy-dom 20+ needs Node 20, the server's own minimum; DOM_SKIP guards a run on an older
// Node anyway, so the suite reports a skip instead of failing at import.
export const DOM_SKIP: string | false = (Number (process.versions.node.split ('.')[0]) >= 20) ? false : 'the DOM tests need Node 20+ (happy-dom)';

export interface Page {
    window: any;
    document: any;
    // uncaught errors and console.error calls of the page's own scripts
    errors: string[];
    // lets pending promise callbacks and zero-delay timers of the page run
    settle: () => Promise<void>;
    close: () => Promise<void>;
}

export interface PageOptions {
    url?: string;
    // runs after the window exists and before any of the page's scripts
    before?: (window: any) => void;
}

// What happy-dom lacks, or gets wrong, and the pages use. Kept to the DOM's own definition of
// each member.
function shim (window: any): void {
    const section = window.HTMLTableSectionElement.prototype;
    if (!('rows' in section)) {
        // tbody.rows: the section's own <tr> children, in order
        Object.defineProperty (section, 'rows', {
            'configurable': true,
            get (this: any) {
                return Array.from (this.children).filter ((child: any) => child.tagName === 'TR');
            },
        });
    }
}

export async function openPage (html: string, options: PageOptions = {}): Promise<Page> {
    const { Window } = await import ('happy-dom');
    const window: any = new Window ({
        'url': options.url ?? 'http://localhost/',
        'settings': {
            // the code under test is this repository's own, read from disk
            'enableJavaScriptEvaluation': true,
            'suppressInsecureJavaScriptEnvironmentWarning': true,
            'disableJavaScriptFileLoading': true,
            'disableCSSFileLoading': true,
        },
    } as any);
    const errors: string[] = [];
    window.addEventListener ('error', (event: any) => errors.push (String (event?.error?.stack ?? event?.message ?? event)));
    const consoleError = window.console.error.bind (window.console);
    window.console.error = (...args: any[]) => {
        errors.push (args.map ((arg) => String (arg?.stack ?? arg)).join (' '));
        consoleError (...args);
    };
    shim (window);
    options.before?.(window);
    window.document.write (html);
    const settle = async () => {
        for (let round = 0; round < 3; round++) {
            await new Promise ((resolve) => setTimeout (resolve, 0));
        }
    };
    await settle ();
    return {
        window,
        'document': window.document,
        errors,
        settle,
        'close': async () => {
            await window.happyDOM.abort ();
            window.close ();
        },
    };
}

// The HOST side of MCP Apps, as far as a view can tell: a parent window that records what the
// view posts and whose messages the view accepts (it checks event.source against its parent).
export interface Host extends Page {
    // every JSON-RPC message the view posted to its parent, in order
    sent: any[];
    requests: (method: string) => any[];
    // host -> view
    post: (message: any) => Promise<void>;
    notify: (method: string, params?: any) => Promise<void>;
    respond: (request: any, result: any) => Promise<void>;
    fail: (request: any, message: string) => Promise<void>;
    // answers the pending ui/initialize; serverTools decides whether the view may call tools
    initialize: (hostContext?: Record<string, any>, hostCapabilities?: Record<string, any>) => Promise<void>;
    // tool-input + tool-result, as a host sends them after the handshake
    deliver: (args: Record<string, any>, structuredContent: Record<string, any>) => Promise<void>;
}

export interface HostOptions extends PageOptions {
    // false: the view is opened directly, with no host around it
    embedded?: boolean;
    // a window.openai object for the hosts that only have that
    openai?: Record<string, any>;
}

export async function openView (html: string, options: HostOptions = {}): Promise<Host> {
    const sent: any[] = [];
    const parent = { 'postMessage': (message: any) => { sent.push (JSON.parse (JSON.stringify (message))); } };
    const page = await openPage (html, {
        ...options,
        'before': (window) => {
            if (options.embedded !== false) {
                Object.defineProperty (window, 'parent', { 'value': parent, 'configurable': true });
            }
            if (options.openai !== undefined) {
                window.openai = options.openai;
            }
            options.before?.(window);
        },
    });
    const post = async (message: any) => {
        page.window.dispatchEvent (new page.window.MessageEvent ('message', { 'data': message, 'source': parent }));
        await page.settle ();
    };
    const requests = (method: string) => sent.filter ((message) => message.method === method);
    const host: Host = {
        ...page,
        sent,
        requests,
        post,
        'notify': (method, params = {}) => post ({ 'jsonrpc': '2.0', method, params }),
        'respond': (request, result) => post ({ 'jsonrpc': '2.0', 'id': request.id, result }),
        'fail': (request, message) => post ({ 'jsonrpc': '2.0', 'id': request.id, 'error': { 'code': -32000, message } }),
        'initialize': async (hostContext = { 'theme': 'light', 'locale': 'en-US', 'timeZone': 'UTC' }, hostCapabilities = { 'serverTools': {} }) => {
            const request = requests ('ui/initialize').at (-1);
            if (request === undefined) {
                throw new Error ('the view never sent ui/initialize');
            }
            await host.respond (request, { 'protocolVersion': '2026-01-26', 'hostInfo': { 'name': 'dom-test', 'version': '0' }, hostCapabilities, hostContext });
        },
        'deliver': async (args, structuredContent) => {
            await host.notify ('ui/notifications/tool-input', { 'arguments': args });
            await host.notify ('ui/notifications/tool-result', { 'content': [ { 'type': 'text', 'text': '{}' } ], structuredContent });
        },
    };
    return host;
}

// An object made by a page's script belongs to the page's own realm: it never deep-equals one
// made here (different Object.prototype), so values are compared as plain data.
export function plain<T> (value: T): T {
    return JSON.parse (JSON.stringify (value));
}

// one of the three MCP Apps views, exactly as resources/read serves it
export function viewHtml (name: string): string {
    return defaultViewCatalog ()[name as ViewName].html;
}

// a view with a host that has answered the handshake and delivered one tool result
export async function openViewWith (name: string, args: Record<string, any>, payload: Record<string, any>, options: HostOptions = {}): Promise<Host> {
    const host = await openView (viewHtml (name), options);
    await host.initialize ();
    await host.deliver (args, payload);
    return host;
}

// the visible text of a node: happy-dom has no layout, so `hidden` is what "not shown" means here
export function visibleText (node: any): string {
    if (node.nodeType === 3) {
        return node.textContent;
    }
    if (node.nodeType !== 1 || node.hidden || [ 'SCRIPT', 'STYLE', 'CAPTION' ].includes (node.tagName)) {
        return '';
    }
    let text = '';
    for (const child of node.childNodes) {
        text += visibleText (child);
    }
    return text + ' ';
}

export function rowsOf (document: any): any[] {
    return Array.from (document.querySelectorAll ('tbody tr'));
}

// the first cell's text of every row, top to bottom: the order the table is in
export function firstColumn (document: any): string[] {
    return rowsOf (document).map ((row: any) => row.cells[0].textContent.trim ());
}

export function headerButton (document: any, label: string): any {
    const found = Array.from (document.querySelectorAll ('thead th')).find ((cell: any) => cell.textContent.includes (label)) as any;
    if (found === undefined) {
        throw new Error ('no column "' + label + '"');
    }
    return found.querySelector ('button');
}

export function press (window: any, target: any, key: string): any {
    const event = new window.KeyboardEvent ('keydown', { key, 'bubbles': true, 'cancelable': true });
    target.dispatchEvent (event);
    return event;
}
