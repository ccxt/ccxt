import { readAsset } from '../embedded.js';
import { redact } from '../redact.js';

// The two browser pages as documents: the templates (ui/setup.html, ui/accounts.html, with
// their css/js fragments inlined) and the two substitutions every response makes in them.
// Nothing here knows about sessions or accounts: session.ts decides who is served a page and
// under which headers, accounts.ts decides what goes into its boot block.

export type PageFile = 'setup.html' | 'accounts.html';

const INCLUDE_PATTERN = /\/\*\s*@include\s+([a-z0-9.-]+)\s*\*\//g;
const pageTemplates: Record<string, string> = {};

function loadTemplate (file: PageFile): string {
    if (pageTemplates[file] === undefined) {
        const template = readAsset ('ui/' + file);
        pageTemplates[file] = template.replace (INCLUDE_PATTERN, (_match, include) => readAsset ('ui/' + include));
    }
    return pageTemplates[file];
}

// JSON placed inside a <script> block: "<" must not be able to close the element
function scriptJson (value: any): string {
    return JSON.stringify (value)
        .replace (/</g, '\\u003c')
        .replace (/>/g, '\\u003e')
        .replace (/&/g, '\\u0026')
        .replace (new RegExp (String.fromCharCode (0x2028), 'g'), '\\u2028')
        .replace (new RegExp (String.fromCharCode (0x2029), 'g'), '\\u2029');
}

// One response's document: every inline <script>/<style> of the template carries this
// response's CSP nonce (session.ts sends the matching header), and the boot block is the only
// data the page starts with.
export function renderPage (file: PageFile, nonce: string, boot: Record<string, any>): string {
    // redact (): nothing in a boot block is a credential, and should one ever get there
    // it leaves as a label
    return loadTemplate (file)
        .replace (/__CSP_NONCE__/g, () => nonce)
        .replace ('__BOOT_JSON__', () => redact (scriptJson (boot)));
}
