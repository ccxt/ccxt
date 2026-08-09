// Shared splicing helpers for the base-type emitters.
//
// The port type files are NOT pure generated dumps: they interleave hand-written support
// code (the C# `Helper` class, Go's `Safe*Typed` helpers / `GetTicker` / `String()` methods,
// Python's `Entry` class and `ConstructorArgs`). Emitting whole files would drop that code.
//
// Instead each emitter produces one source block per type and splices it over the block that
// is already there, matched by its declaration anchor. Everything outside the anchors is
// preserved byte-for-byte, so the resulting diff is exactly the drift against
// ts/src/base/types.ts and nothing else.

export interface EmittedBlock {
    /** type name, used for reporting */
    name: string;
    /** regex matching the first line of the existing declaration (must be anchored to ^) */
    anchor: RegExp;
    /** the replacement source, without a trailing newline */
    source: string;
}

export interface SpliceResult {
    text: string;
    replaced: string[];
    appended: string[];
    unchanged: string[];
}

/**
 * Finds the end of a brace-delimited block that starts on `startLine`, counting braces
 * outside of string/char literals and comments. Returns the index of the closing line.
 * Used for C# / Go / Java declarations.
 */
export function findBraceBlockEnd (lines: string[], startLine: number): number {
    let depth = 0;
    let started = false;
    for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];
        let inString = false;
        let inChar = false;
        for (let j = 0; j < line.length; j++) {
            const ch = line[j];
            const prev = j > 0 ? line[j - 1] : '';
            if (inString) {
                if (ch === '"' && prev !== '\\') {
                    inString = false;
                }
                continue;
            }
            if (inChar) {
                if (ch === "'" && prev !== '\\') {
                    inChar = false;
                }
                continue;
            }
            if (ch === '/' && j + 1 < line.length && line[j + 1] === '/') {
                break;
            }
            if (ch === '"') {
                inString = true;
                continue;
            }
            if (ch === "'") {
                inChar = true;
                continue;
            }
            if (ch === '{') {
                depth += 1;
                started = true;
            } else if (ch === '}') {
                depth -= 1;
                if (started && depth === 0) {
                    return i;
                }
            }
        }
    }
    return -1;
}

/**
 * Finds the end of an indentation-delimited Python block starting at `startLine`
 * (the `class X(...)` line). Returns the index of the last line that belongs to it.
 */
export function findIndentBlockEnd (lines: string[], startLine: number): number {
    let last = startLine;
    for (let i = startLine + 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') {
            continue;
        }
        if (/^\s/.test (line)) {
            last = i;
        } else {
            break;
        }
    }
    return last;
}

export type BlockEndFinder = (lines: string[], startLine: number) => number;

/**
 * Splices `blocks` into `text`. A block whose anchor matches an existing declaration
 * replaces that declaration in place; a block with no match is appended via `appendWith`.
 */
export function spliceBlocks (text: string, blocks: EmittedBlock[], findEnd: BlockEndFinder, appendWith?: (block: EmittedBlock) => string): SpliceResult {
    let lines = text.split ('\n');
    const replaced: string[] = [];
    const appended: string[] = [];
    const unchanged: string[] = [];
    for (let b = 0; b < blocks.length; b++) {
        const block = blocks[b];
        let found = -1;
        for (let i = 0; i < lines.length; i++) {
            if (block.anchor.test (lines[i])) {
                found = i;
                break;
            }
        }
        if (found < 0) {
            if (appendWith !== undefined) {
                const tail = appendWith (block);
                lines = lines.concat (tail.split ('\n'));
                appended.push (block.name);
            }
            continue;
        }
        const end = findEnd (lines, found);
        if (end < 0) {
            throw new Error ('unterminated block for ' + block.name + ' at line ' + (found + 1).toString ());
        }
        const existing = lines.slice (found, end + 1).join ('\n');
        const replacement = block.source;
        if (existing === replacement) {
            unchanged.push (block.name);
            continue;
        }
        lines = lines.slice (0, found).concat (replacement.split ('\n')).concat (lines.slice (end + 1));
        replaced.push (block.name);
    }
    return { 'text': lines.join ('\n'), 'replaced': replaced, 'appended': appended, 'unchanged': unchanged };
}

export default spliceBlocks;
