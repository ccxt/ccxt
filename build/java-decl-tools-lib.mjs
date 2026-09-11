// DEV TOOL — campaign instrumentation for the Java nested-types typing campaign (JN-24).
// NOT wired into any published build; safe to exclude from release PRs.
//
// Shared helpers for:
//   build/java-local-type-census.mjs   — census of generated Java local declarations by type
//   build/java-decl-paircheck.mjs      — validates that a diff touches declarations only
//   build/java-decl-paircheck-selftest.mjs — proves the paircheck flags injected bad changes
//
// Core idea: a generated Java line is tokenized, and two "forms" are computed:
//   formA: tokens with type expressions collapsed to a single sentinel and checkcast
//          expressions removed. formA equality == the two lines differ ONLY in type
//          spellings and/or inserted/removed casts.
//   formB: formA with receiver parentheses removed, e.g. `((List<Object>) x).get(0)`
//          strips to `( x ).get(0)` while the pre-cast original was `x.get(0)`; the
//          cast insertion legitimately adds those parens, so formB equality is accepted
//          under its own category (counted separately in reports).
//
// Known, deliberate limits (documented for reviewers):
//   * casts are assumed "intended" — a cast that CHANGES runtime semantics (e.g. the
//     `(String) cond ? a : b` precedence bug) is caught only by the dedicated
//     CAST_TERNARY_SUSPECT heuristic, not by formA/formB.
//   * formB (receiver parens) is not sound for pathological operator/precedence edits;
//     run with --strict to require formA-only equality for those pairs.
//   * class-level identifiers that look like type names (capitalized) are treated as
//     types; swapping one class reference for another would be classified as a type
//     change. This cannot occur in the campaign's retype-only diffs.

export const SENTINEL = '\u00abT\u00bb'; // «T»

export const PRIMITIVES = new Set([
  'int', 'long', 'double', 'boolean', 'float', 'short', 'char', 'byte', 'void',
]);

export const WRAPPERS = new Set([
  'Object', 'String', 'Long', 'Double', 'Boolean', 'Integer', 'Number',
  'Float', 'Short', 'Byte', 'Character', 'Void',
]);

// ---------------------------------------------------------------------------
// Lexing
// ---------------------------------------------------------------------------

// Token kinds: string literals (kept verbatim), char literals, dotted names
// (java.util.List, io.github.ccxt.types.Market, Helpers.add), numbers, and any
// other single non-space character (operators/punctuation).
const TOKEN_RE =
  /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[A-Za-z_$]*|[^\s]/g;

export function lex(line) {
  const tokens = [];
  TOKEN_RE.lastIndex = 0;
  let m;
  while ((m = TOKEN_RE.exec(line)) !== null) tokens.push(m[0]);
  return tokens;
}

// Split a raw source line into code part and trailing // comment (outside strings).
export function splitComment(raw) {
  let inStr = false;
  let inChar = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (inStr) {
      if (ch === '\\') i++;
      else if (ch === '"') inStr = false;
    } else if (inChar) {
      if (ch === '\\') i++;
      else if (ch === "'") inChar = false;
    } else if (ch === '"') inStr = true;
    else if (ch === "'") inChar = true;
    else if (ch === '/' && raw[i + 1] === '/') {
      return { code: raw.slice(0, i), comment: raw.slice(i) };
    }
  }
  return { code: raw, comment: '' };
}

// ---------------------------------------------------------------------------
// Type-expression parsing
// ---------------------------------------------------------------------------

const DOTTED_RE = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/;

export function isTypeNameToken(tok) {
  if (tok === undefined) return false;
  if (tok === 'var') return true; // Java `var` locals retyped to explicit types
  if (PRIMITIVES.has(tok) || WRAPPERS.has(tok)) return true;
  if (!DOTTED_RE.test(tok)) return false;
  const segs = tok.split('.');
  const last = segs[segs.length - 1];
  // class-like last segment (java.util.List, io.github.ccxt.types.Market, Market);
  // method-ish dotted names (Helpers.add, java.util.Arrays.asList) are NOT types.
  return /^[A-Z]/.test(last);
}

// If tokens[i] starts a type expression, return the exclusive end index of the
// full expression (name + optional generic group + optional []), else null.
export function parseType(tokens, i) {
  if (!isTypeNameToken(tokens[i])) return null;
  let j = i + 1;
  if (tokens[j] === '<') {
    let depth = 1;
    j++;
    while (j < tokens.length && depth > 0) {
      const s = tokens[j];
      if (s === '<') depth++;
      else if (s === '>') depth--;
      else if (s === ',' || s === '?' || s === '&') {
        // fine inside generics
      } else if (DOTTED_RE.test(s)) {
        // type name / extends / super / ? extends Foo handled leniently
      } else {
        return null; // parens, semicolons, etc: not a generic type group
      }
      j++;
      if (depth === 0) break;
    }
    if (depth !== 0) return null;
  }
  while (tokens[j] === '[' && tokens[j + 1] === ']') j += 2;
  return j;
}

// Collapse every type expression to a single sentinel token.
export function canonTypes(tokens) {
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    if (isTypeNameToken(tokens[i])) {
      out.push(SENTINEL);
      i++;
      if (tokens[i] === '<') {
        const end = parseType(tokens, i - 1); // re-parse from the name
        if (end !== null) i = end;
      }
      while (tokens[i] === '[' && tokens[i + 1] === ']') i += 2;
      continue;
    }
    out.push(tokens[i]);
    i++;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Checkcast stripping (removes intended casts)
// ---------------------------------------------------------------------------

const CAST_PREV_OK = new Set(['(', '=', ',', ':', '?', '!', '&', '|', '+', '-', '*', '/', '%', '<', '>', '[', '{', ';', '~', '^']);

function isCastContext(prev) {
  return prev === undefined || prev === 'return' || prev === 'yield' || CAST_PREV_OK.has(prev);
}

function isValueStart(tok) {
  if (tok === undefined) return false;
  if (tok === '(' || tok === '!' || tok === '~' || tok === '-' || tok === '+') return true;
  if (/^["']/.test(tok) || /^\d/.test(tok)) return true;
  return DOTTED_RE.test(tok); // identifier / class ref / keyword-like token
}

// Remove checkcast expressions `( Type )` found in cast context. When the cast
// operand is itself a parenthesised group that ends the expression unit
// (`(String) (cond ? a : b)` — the correct-form fix for the ternary-cast bug),
// the operand's outer parens are dropped too, so the pair still normalises equal.
export function stripCasts(tokens) {
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t === '(' && isCastContext(out[out.length - 1])) {
      const end = parseType(tokens, i + 1);
      if (end !== null && tokens[end] === ')' && isValueStart(tokens[end + 1])) {
        let next = end + 1;
        // cast operand is a parenthesised group wrapping the whole operand unit?
        if (tokens[next] === '(') {
          const groupEnd = matchingParen(tokens, next);
          if (groupEnd !== -1) {
            const after = tokens[groupEnd + 1];
            if (after === undefined || after === ';' || after === ')' || after === ',' || after === ']' || after === '}') {
              // drop `( Type )` and the operand parens, keep the contents
              const inner = tokens.slice(next + 1, groupEnd);
              for (const tok of stripCasts(inner)) out.push(tok);
              i = groupEnd + 1;
              continue;
            }
          }
        }
        i = next; // drop `( Type )`
        continue;
      }
      // group that BEGINS with a cast and wraps it in extra parens, e.g.
      // `? ((Object) this.parseToInt(x)) : 0` — drop the wrapper parens; the
      // recursive call strips the inner cast.
      if (tokens[i + 1] === '(') {
        const tEnd = parseType(tokens, i + 2);
        if (tEnd !== null && tokens[tEnd] === ')' && isValueStart(tokens[tEnd + 1])) {
          const groupEnd = matchingParen(tokens, i);
          if (groupEnd !== -1) {
            const inner = tokens.slice(i + 1, groupEnd);
            for (const tok of stripCasts(inner)) out.push(tok);
            i = groupEnd + 1;
            continue;
          }
        }
      }
    }
    out.push(t);
    i++;
  }
  return out;
}

function matchingParen(tokens, openIdx) {
  let depth = 0;
  for (let j = openIdx; j < tokens.length; j++) {
    if (tokens[j] === '(') depth++;
    else if (tokens[j] === ')') {
      depth--;
      if (depth === 0) return j;
    }
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Form B: receiver-paren normalisation
// ---------------------------------------------------------------------------

// Remove parentheses that wrap a complete operand — the group must be followed by
// an "operand boundary" token (`.`, `?`, `:`, `;`, `)`, `]`, `,`, `}`, end) AND be
// preceded by an operand-start token (start, `=`, `(`, `,`, `:`, `?`, `return`,
// `!`, `&&`, `||`, `;`, `{`, `}`, `[`). Both bounds are required: `a * (b + c)`
// (preceded by `*`) is NOT unwrapped, so a precedence-changing paren edit
// `a * (b + c)` -> `a * b + c` still compares unequal and is flagged.
export function removeReceiverParens(tokens) {
  const AFTER_OK = new Set(['.', '?', ':', ';', ')', ']', ',', '}']);
  const BEFORE_OK = new Set(['=', '(', ',', ':', '?', '!', '&&', '||', ';', '{', '}', '[', 'return', 'instanceof']);
  let cur = tokens.slice();
  for (let pass = 0; pass < 8; pass++) {
    const next = [];
    let i = 0;
    let changed = false;
    while (i < cur.length) {
      if (cur[i] === '(') {
        let depth = 0;
        let j = i;
        for (; j < cur.length; j++) {
          if (cur[j] === '(') depth++;
          else if (cur[j] === ')') {
            depth--;
            if (depth === 0) break;
          }
        }
        if (j < cur.length) {
          const after = cur[j + 1];
          const before = i === 0 ? undefined : cur[i - 1];
          if ((after === undefined || AFTER_OK.has(after)) && (before === undefined || BEFORE_OK.has(before))) {
            next.push(...removeReceiverParens(cur.slice(i + 1, j)));
            i = j + 1;
            changed = true;
            continue;
          }
        }
      }
      next.push(cur[i]);
      i++;
    }
    cur = next;
    if (!changed) break;
  }
  return cur;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

// Detect the known shipped bug shape: a checkcast in front of a bare identifier
// used as a ternary condition, e.g. `(String) c ? a : b` — the cast binds to the
// CONDITION, not the ternary result. `(Boolean)` casts on a condition are legal
// (auto-unboxing), everything else is flagged.
export function findCastTernarySuspects(tokens) {
  const hits = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] !== '(') continue;
    const end = parseType(tokens, i + 1);
    if (end === null || tokens[end] !== ')') continue;
    const castTypeText = tokens.slice(i + 1, end).join('');
    const next = tokens[end + 1];
    if (next !== undefined && DOTTED_RE.test(next) && /^[a-z_$]/.test(next) && tokens[end + 2] === '?') {
      if (!/^(Boolean|boolean)$/.test(castTypeText)) {
        hits.push({ castType: castTypeText, operand: next, index: i });
      }
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Line normalisation for pair comparison
// ---------------------------------------------------------------------------

// Split merged dotted tokens (`results.add`) into segments (`results` `.` `add`)
// so member-access spellings tokenize identically whether or not a cast/renaming
// broke the dotted run upstream.
export function splitDotted(tokens) {
  const out = [];
  for (const t of tokens) {
    if (/^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)+$/.test(t)) {
      const parts = t.split('.');
      for (let k = 0; k < parts.length; k++) {
        if (k) out.push('.');
        out.push(parts[k]);
      }
    } else {
      out.push(t);
    }
  }
  return out;
}

export function normalizeLine(raw) {
  const { code, comment } = splitComment(raw);
  const tokens = lex(code);
  const stripped = stripCasts(tokens);
  const canonA = splitDotted(canonTypes(stripped));
  const formA = canonA.join(' ');
  const formB = splitDotted(removeReceiverParens(canonA)).join(' ');
  return {
    code,
    comment,
    tokens,
    formA,
    formB,
    castTernary: findCastTernarySuspects(tokens),
  };
}

// ---------------------------------------------------------------------------
// Declaration / signature matching (for the census)
// ---------------------------------------------------------------------------

// Local/field declaration: [final] TYPE NAME ('='|';'|',').
export function matchDecl(tokens) {
  let i = 0;
  if (tokens[i] === 'final') i++;
  const end = parseType(tokens, i);
  if (end === null) return null;
  const name = tokens[end];
  if (name === undefined || !/^[a-z_$][A-Za-z0-9_$]*$/.test(name)) return null;
  const follow = tokens[end + 1];
  if (follow !== '=' && follow !== ';' && follow !== ',') return null;
  return {
    typeText: tokens.slice(i, end).join(''),
    typeTokens: tokens.slice(i, end),
    name,
    modifiers: i > 0 ? ['final'] : [],
  };
}

const MODIFIERS = new Set([
  'public', 'private', 'protected', 'static', 'final', 'abstract', 'synchronized',
  'native', 'default', 'strictfp', 'transient', 'volatile',
]);

// Method signature: MODIFIERS* TYPE NAME '(' — returns declared return type.
export function matchMethodSig(tokens) {
  let i = 0;
  while (tokens[i] !== undefined && MODIFIERS.has(tokens[i])) i++;
  if (i === 0) return null; // require at least one modifier (avoids expressions)
  const end = parseType(tokens, i);
  if (end === null) return null;
  const name = tokens[end];
  if (name === undefined || !/^[a-zA-Z_$][A-Za-z0-9_$]*$/.test(name)) return null;
  if (tokens[end + 1] !== '(') return null;
  return { returnType: tokens.slice(i, end).join(''), name };
}

// Brace-depth scanner: returns per-line depth-before-line, ignoring braces inside
// strings, chars, line comments and (single-line) block comments.
export function braceDepths(lines) {
  const depths = new Array(lines.length);
  let depth = 0;
  let inBlock = false;
  for (let li = 0; li < lines.length; li++) {
    depths[li] = depth;
    const code = stripForBraces(lines[li], { startInBlock: inBlock });
    inBlock = code.inBlock;
    depth += code.opens - code.closes;
  }
  return depths;
}

function stripForBraces(line, { startInBlock }) {
  let inBlock = startInBlock;
  let inStr = false;
  let inChar = false;
  let opens = 0;
  let closes = 0;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const nxt = line[i + 1];
    if (inBlock) {
      if (ch === '*' && nxt === '/') {
        inBlock = false;
        i++;
      }
      continue;
    }
    if (inStr) {
      if (ch === '\\') i++;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (inChar) {
      if (ch === '\\') i++;
      else if (ch === "'") inChar = false;
      continue;
    }
    if (ch === '/' && nxt === '/') break;
    if (ch === '/' && nxt === '*') {
      inBlock = true;
      i++;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "'") inChar = true;
    else if (ch === '{') opens++;
    else if (ch === '}') closes++;
  }
  return { opens, closes, inBlock };
}
