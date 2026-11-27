// Text normalization shared by every adapter. Everything that leaves the collector
// (titles, excerpts, bodies, snapshots) goes through these helpers.

export const LIMITS = { title: 200, excerpt: 500, body: 4000 } as const;

const ENTITIES: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ', '#39': '\'', mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
};

export function decodeEntities (s: string): string {
    return s.replace (/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (m, code: string) => {
        const lower = code.toLowerCase ();
        if (lower.startsWith ('#x')) {
            return safeCodePoint (parseInt (lower.slice (2), 16), m);
        }
        if (lower.startsWith ('#')) {
            return safeCodePoint (parseInt (lower.slice (1), 10), m);
        }
        return ENTITIES[lower] ?? m;
    });
}

function safeCodePoint (n: number, fallback: string): string {
    if (!Number.isFinite (n) || n <= 0 || n > 0x10ffff) {
        return fallback;
    }
    return String.fromCodePoint (n);
}

// Multi-line whitespace cleanup: keeps paragraphs, drops trailing spaces and runs of blank lines.
export function normalizeWhitespace (s: string): string {
    return s
        .replace (/\r\n?/g, '\n')
        .replace (/[   ]/g, ' ')
        .replace (ZERO_WIDTH, '')
        .replace (/\t/g, '    ')
        .split ('\n')
        .map ((line) => line.replace (/\s+$/, ''))
        .join ('\n')
        .replace (/\n{3,}/g, '\n\n')
        .trim ();
}

// zero-width space/joiners, word joiner, BOM, soft hyphen
export const ZERO_WIDTH = /[\u200b-\u200d\u2060\ufeff\u00ad]/g;

// Thematic breaks ("---", "***", "___") carry no content.
const SEPARATOR_LINE = /^[ \t]*(?:-[ \t]*){3,}$|^[ \t]*(?:\*[ \t]*){3,}$|^[ \t]*(?:_[ \t]*){3,}$/gm;

export function dropSeparators (s: string): string {
    return s.replace (SEPARATOR_LINE, '');
}

// Inline markdown -> text for one-line strings: blockquote/alert markers ("> [!WARNING]"),
// **bold**, __bold__, *em*, `code`. Single underscores stay (snake_case identifiers).
export function stripInlineMarkdown (s: string): string {
    return s
        .replace (/^\s*(?:>\s*)+/gm, '')
        .replace (/\[!(?:note|tip|important|warning|caution|info|danger)\]\s*/gi, '')
        .replace (/\*\*(\S(?:[^*]*?\S)?)\*\*/g, '$1')
        .replace (/(^|[^\w])__(\S(?:[^_]*?\S)?)__(?!\w)/g, '$1$2')
        .replace (/(^|[^\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![\w*])/g, '$1$2')
        .replace (/`+([^`]*?)`+/g, '$1')
        .replace (/`/g, '');
}

export function oneLine (s: string): string {
    return s.replace (/\s+/g, ' ').trim ();
}

// Footers some doc platforms append for AI agents (GitBook "Agent Instructions" etc.).
// They are third-party instructions, never changelog content: cut from the marker to the end.
const AGENT_FOOTER_MARKERS: RegExp[] = [
    /^\s*(?:#{1,6}\s*)?agent instructions\s*:?\s*$/im,
    /^\s*(?:#{1,6}\s*)?instructions for (?:ai|llm|language model)s?(?: agents?)?\s*:?\s*$/im,
    /^\s*this documentation is published with gitbook\. gitbook is the documentation platform designed so that both humans and ai agents/im,
];

export function stripAgentFooters (s: string): string {
    let out = s;
    for (const re of AGENT_FOOTER_MARKERS) {
        const m = re.exec (out);
        if (m) {
            out = out.slice (0, m.index).replace (/\n\s*(?:-{3,}|\*{3,})\s*$/, '');
        }
    }
    return out;
}

// Removes anything that looks like raw HTML/JSX and control characters.
export function sanitizeText (s: string): string {
    return decodeEntities (s
        .replace (/<!--[\s\S]*?-->/g, '')
        .replace (/<\/?[a-zA-Z][^<>]*>/g, ''))
        .replace (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
}

export function truncate (s: string, max: number): string {
    if (s.length <= max) {
        return s;
    }
    return s.slice (0, max - 1).replace (/\s+\S*$/, '') + '…';
}

// Words a cut summary may not end on ("... to the", "... changes in").
const DANGLING_WORDS = /(?:\s+(?:the|a|an|in|of|to|for|and|or|with|on|at|by|from|into|as|is|are|was|were|its|their|your|this|that|via|per))+$/i;

// One-line summary of at most `max` characters for a title: the text up to the last sentence end
// that fits (when that keeps at least a third of `max`), else cut at a word boundary with "…",
// without a dangling article/preposition or separator before the ellipsis.
export function cutSummary (s: string, max: number): string {
    const text = oneLine (s);
    if (text.length <= max) {
        return text;
    }
    const head = text.slice (0, max);
    // a sentence end: ".", "!" or "?" followed by a space and a capital, digit, quote or backtick
    // (not "e.g. x", "v1.2", "1.5 USDT")
    let end = -1;
    const re = /[.!?](?=\s+["'`(\p{Lu}\d])/gu;
    let m: RegExpExecArray | null;
    while ((m = re.exec (head)) !== null) {
        if (!/\b(?:e\.g|i\.e|etc|vs|approx|incl|no)\.$/i.test (head.slice (0, m.index + 1))) {
            end = m.index;
        }
    }
    if (end >= Math.floor (max / 3)) {
        return head.slice (0, end + 1);
    }
    let words = text.slice (0, max - 1).replace (/\s+\S*$/, '');
    // an opening "(" or "[" whose group the cut leaves unclosed goes when short
    // ("... the current bound (for"); a longer one is closed after the ellipsis ("... (applies to all…)")
    words = words.replace (/\s*[([][^)\]]*$/, (m) => (m.length <= 20 ? '' : m));
    words = words.replace (DANGLING_WORDS, '').replace (/[\s,;:\u2013\u2014-]+$/, '').replace (DANGLING_WORDS, '');
    const open = /([([])[^)\]]*$/.exec (words);
    if (!open) {
        return words + '…';
    }
    if (words.length > max - 2) {
        words = words.replace (/\s+\S*$/, '').replace (DANGLING_WORDS, '');
    }
    return words + '…' + ((open[1] === '(') ? ')' : ']');
}

// Table rows "| a | b |" -> "a · b"; alignment rows ("| :- | --- |") dropped.
export function tableRowsToText (s: string): string {
    return s.split ('\n').map ((line) => {
        if (!/^\s*\|.*\|\s*$/.test (line)) {
            return line;
        }
        if (/^\s*\|[\s:|-]+\|\s*$/.test (line)) {
            return '';
        }
        return line.trim ().replace (/^\|/, '').replace (/\|$/, '').split ('|').map ((c) => c.trim ()).filter ((c) => c.length > 0).join (' · ');
    }).join ('\n');
}

// Light markdown -> plain text for excerpts (drops heading/list/emphasis markers, table pipes and code fences).
export function markdownToPlain (s: string): string {
    return oneLine (stripInlineMarkdown (tableRowsToText (dropSeparators (s))
        .replace (/^\s*(?:```|~~~).*$/gm, '')
        .replace (/^\s*(?:>\s*)+/gm, '')
        .replace (/^\s{0,3}#{1,6}\s+/gm, '')
        .replace (/^\s*[-*+]\s+/gm, '')
        .replace (/^\s*\d+\.\s+/gm, ''))
        .replace (ZERO_WIDTH, ''));
}

// Plain-text title: no HTML, markdown emphasis/code/blockquote markers or zero-width characters.
export function cleanTitle (s: string): string {
    return truncate (oneLine (stripInlineMarkdown (sanitizeText (s).replace (ZERO_WIDTH, ''))).replace (/^#+\s*/, ''), LIMITS.title);
}

export function cleanBody (s: string): string {
    return truncate (normalizeWhitespace (dropSeparators (stripAgentFooters (sanitizeText (s)))), LIMITS.body);
}

// Letter-style openings that say nothing about the change ("Dear developers, this is the Upbit
// Developer Center team.", "안녕하세요. 업비트 개발자센터입니다."): left out of excerpts only.
export const GREETING = /^(?:(?:dear|hello|hi)\s+(?:developers|users|traders|customers|partners|api users)[,.!]?\s*(?:this is (?:the )?[^.]{1,60}\.\s*)?|안녕하세요[.!]?\s*(?:[^.\n]{1,30}입니다\.\s*)?)/i;

// GitHub emoji shortcodes (":warning:", ":rotating_light:") carry no text.
const SHORTCODE = /(?<![\w:/]):[a-z][a-z0-9_+-]*:(?![\w:/])/g;

export function makeExcerpt (body: string): string {
    const plain = oneLine (markdownToPlain (body).replace (SHORTCODE, ''));
    return truncate (plain.replace (GREETING, '') || plain, LIMITS.excerpt);
}
