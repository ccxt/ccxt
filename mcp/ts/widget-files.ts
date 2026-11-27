import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const widgetsRoot = new URL ('../widgets/', import.meta.url);
const STYLESHEET = /<link rel="stylesheet" href="([^"]+)">/g;
const SCRIPT = /<script src="([^"]+)"( defer)?><\/script>/g;

export function widgetFile (name: string): URL {
    return new URL (name, widgetsRoot);
}

function isWidgetAsset (reference: string): boolean {
    return !reference.startsWith ('/') && !reference.includes ('..') && !/^[a-z][a-z0-9+.-]*:/i.test (reference);
}

async function readAsset (reference: string): Promise<string> {
    const text = await readFile (widgetFile (reference), 'utf8');
    if (/<\/(script|style)/i.test (text)) {
        throw new Error ('widget asset ' + reference + ' contains a closing tag and cannot be inlined');
    }
    return text.trimEnd ();
}

async function replaceAssets (html: string, pattern: RegExp, render: (reference: string, text: string) => string): Promise<string> {
    const references = [ ...html.matchAll (pattern) ].map ((match) => match[1]).filter (isWidgetAsset);
    const texts = new Map<string, string> ();
    for (const reference of new Set (references)) {
        texts.set (reference, await readAsset (reference));
    }
    return html.replace (pattern, (tag: string, reference: string) => {
        const text = texts.get (reference);
        return (text === undefined) ? tag : render (reference, text);
    });
}

function inlineStyles (html: string): Promise<string> {
    return replaceAssets (html, STYLESHEET, (_reference, text) => '<style>\n' + text + '\n</style>');
}

export async function readWidgetHtml (file: URL): Promise<string> {
    const html = await inlineStyles (await readFile (file, 'utf8'));
    return replaceAssets (html, SCRIPT, (_reference, text) => '<script>\n' + text + '\n</script>');
}

export async function readWidgetPage (file: URL, scriptUrl: string): Promise<{ html: string; script: string }> {
    const scripts: string[] = [];
    let html = await inlineStyles (await readFile (file, 'utf8'));
    html = await replaceAssets (html, SCRIPT, (_reference, text) => {
        scripts.push (text);
        return (scripts.length === 1) ? '<script src="' + scriptUrl + '" defer></script>' : '';
    });
    return { html, 'script': scripts.join ('\n') + '\n' };
}

export function widgetPath (file: URL): string {
    return fileURLToPath (file);
}
