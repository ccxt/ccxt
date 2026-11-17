// HTML -> light markdown. Keeps headings, lists, code and table rows; links become their text.
// Raw HTML never survives: only text nodes are emitted.
import * as cheerio from 'cheerio';
import { decodeEntities, normalizeWhitespace } from './normalize.ts';

// Minimal structural view of a domhandler node (avoids a direct dependency on domhandler).
export interface DomNode {
    type: string;
    name?: string;
    data?: string;
    attribs?: Record<string, string>;
    children?: DomNode[];
}

const DROP = new Set ([ 'script', 'style', 'noscript', 'template', 'svg', 'iframe', 'button', 'input', 'select', 'textarea', 'form', 'img', 'picture', 'video', 'audio', 'canvas', 'head', 'meta', 'link' ]);
const BLOCK = new Set ([ 'p', 'div', 'section', 'article', 'main', 'header', 'footer', 'aside', 'blockquote', 'figure', 'figcaption', 'dl', 'dt', 'dd', 'details', 'summary', 'hr', 'body', 'html', 'center' ]);

// Mintlify renders paragraphs as <span data-as="p">: an element whose data-as names a block
// element is a block.
function isBlock (node: DomNode): boolean {
    const name = (node.name ?? '').toLowerCase ();
    const as = (node.attribs?.['data-as'] ?? '').toLowerCase ();
    return BLOCK.has (name) || name === 'li' || BLOCK.has (as) || as === 'li';
}

function inlineText (node: DomNode): string {
    if (node.type === 'text') {
        return decodeEntities (node.data ?? '');
    }
    if (node.type !== 'tag' || DROP.has (node.name ?? '')) {
        return '';
    }
    // a line break inside a table cell or heading separates words ("descriptions.<br>Additional")
    if ((node.name ?? '').toLowerCase () === 'br') {
        return ' ';
    }
    return (node.children ?? []).map (inlineText).join ('');
}

function rowText (tr: DomNode): string {
    const cells = (tr.children ?? []).filter ((x) => x.type === 'tag' && (x.name === 'td' || x.name === 'th'))
        .map ((x) => inlineText (x).replace (/\s+/g, ' ').trim ());
    return '| ' + cells.join (' | ') + ' |';
}

function render (node: DomNode, out: string[]): void {
    if (node.type === 'text') {
        out.push (decodeEntities (node.data ?? '').replace (/\s+/g, ' '));
        return;
    }
    if (node.type === 'root') {
        for (const child of node.children ?? []) {
            render (child, out);
        }
        return;
    }
    if (node.type !== 'tag') {
        return;
    }
    const name = (node.name ?? '').toLowerCase ();
    if (DROP.has (name)) {
        return;
    }
    const children = node.children ?? [];
    const headingMatch = /^h([1-6])$/.exec (name);
    if (headingMatch) {
        out.push ('\n\n' + '#'.repeat (Number (headingMatch[1])) + ' ' + inlineText (node).replace (/\s+/g, ' ').trim () + '\n\n');
        return;
    }
    if (name === 'br') {
        out.push ('\n');
        return;
    }
    if (name === 'pre') {
        out.push ('\n\n```\n' + inlineText (node).replace (/\n+$/, '') + '\n```\n\n');
        return;
    }
    if (name === 'code') {
        const text = inlineText (node).replace (/\s+/g, ' ');
        out.push (text.length ? '`' + text + '`' : '');
        return;
    }
    if (name === 'ul' || name === 'ol') {
        // nested lists render at depth 0 and are indented by their parent item
        const items: string[] = [];
        for (const child of children) {
            if (child.type === 'tag' && child.name === 'li') {
                const inner: string[] = [];
                for (const c of child.children ?? []) {
                    render (c, inner);
                }
                const marker = (name === 'ol') ? `${items.length + 1}.` : '-';
                const text = normalizeWhitespace (inner.join ('')).replace (/\n+/g, '\n').replace (/\n/g, '\n  ');
                items.push (marker + ' ' + text);
            }
        }
        out.push ('\n\n' + items.join ('\n') + '\n\n');
        return;
    }
    if (name === 'table') {
        const rows: string[] = [];
        const collect = (n: DomNode) => {
            for (const c of n.children ?? []) {
                if (c.type !== 'tag' || c.name === 'table') {
                    continue;
                }
                if (c.name === 'tr') {
                    rows.push (rowText (c));
                } else {
                    collect (c);
                }
            }
        };
        collect (node);
        out.push ('\n\n' + rows.join ('\n') + '\n\n');
        return;
    }
    if (name === 'tr') {
        out.push ('\n' + rowText (node) + '\n');
        return;
    }
    const block = isBlock (node);
    if (block) {
        out.push ('\n\n');
    }
    for (const child of children) {
        render (child, out);
    }
    if (block) {
        out.push ('\n\n');
    }
}

export function nodesToText (nodes: DomNode[]): string {
    const out: string[] = [];
    for (const node of nodes) {
        render (node, out);
    }
    return normalizeWhitespace (out.join ('').split ('\n').map ((l) => l.replace (/^(\s*)(.*)$/, (_m, ind: string, rest: string) => ind + rest.replace (/ {2,}/g, ' '))).join ('\n'));
}

export function htmlToText (html: string): string {
    const $ = cheerio.load (html, null, false);
    return nodesToText ($.root ().toArray () as unknown as DomNode[]);
}
