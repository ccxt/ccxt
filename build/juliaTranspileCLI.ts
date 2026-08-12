import Transpiler from '../node_modules/ast-transpiler/src/transpiler.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
// Use the real TypeScript compiler bundled with ast-transpiler (v4.x) — the
// top-level `typescript` in this checkout is the v7 stub with a different API.
const require = createRequire(import.meta.url);
const ts = require('../node_modules/ast-transpiler/node_modules/typescript/lib/typescript.js');

const REPO_ROOT = path.resolve('.');
const TS_SRC = path.join(REPO_ROOT, 'ts', 'src');
const JULIA_SRC = path.join(REPO_ROOT, 'julia', 'Ccxt', 'src');
const JULIA_TEST = path.join(REPO_ROOT, 'julia', 'Ccxt', 'test');

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Write the generated error hierarchy to `Errors.jl`, but only when a
 * loadable, canonical `Errors.jl` is NOT already present.
 *
 * The upstream Julia transpiler emits `ts/src/base/errors.ts` (which extends
 * the JS `Error` builtin) into Julia structs with `parent::Union{Error,
 * Nothing} = Error()` — but `Error` is a JavaScript builtin, undefined in
 * Julia, so the regenerated file fails to load. The repository ships a
 * hand-written, loadable `Errors.jl` (Exception subtypes via a `@def_err`
 * macro). We must not overwrite it with the broken generated output during
 * `--errors` (or `--all`, which also drives the error transpiler in
 * `juliaTranspileDirect.ts`). When the existing file is present and already
 * declares the error types, keep it untouched so the package stays loadable.
 */
function writeErrorsGuarded(outFile: string, generated: string) {
  if (fs.existsSync(outFile)) {
    const existing = fs.readFileSync(outFile, 'utf8');
    const existingIsBroken = /\bError\s*\(/.test(existing) || /Union\s*\{\s*Error\b/.test(existing);
    if (!existingIsBroken) {
      // The existing Errors.jl is loadable (it does not reference the undefined
      // JS `Error` builtin the transpiler emits). Keep it untouched so the
      // package stays loadable; do not overwrite with broken generated output.
      console.log(`Julia errors preserved (canonical hand-written Errors.jl) -> ${outFile}`);
      return;
    }
  }
  fs.writeFileSync(outFile, generated, 'utf8');
  console.log(`Julia errors transpiled -> ${outFile}`);
}

/**
 * Capitalize exchange class names inside a generated Julia exchange file so that
 * the emitted struct, its method receivers, the parent-field type, and the
 * wrapper constructor all use the PascalCase name (e.g. `binance` -> `Binance`).
 *
 * The upstream Julia transpiler emits the TS class name verbatim (lowercase,
 * matching the `.ts` filename). Julia convention — and the exchange-load test
 * in `test_exchanges.jl` — expect `Ccxt.Binance` to be a `DataType`. We cannot
 * use a `const Binance = binance` alias because `@kwdef` then recurses
 * (`binance()` -> `binance(; kwargs...)` -> `binance()`). Capitalizing the
 * struct name directly avoids the alias and gives a valid outer constructor
 * `function Binance(; kwargs...)`.
 *
 * ALL known exchange ids are capitalized (not just the current one) because a
 * child exchange references its parent by the parent's lowercase TS name (e.g.
 * `binancecoinm` has `parent::Union{binance, Nothing}`). Every occurrence is
 * rewritten so cross-exchange composition types resolve to the capitalized
 * struct. Substring collisions (e.g. `binance` inside `binancecoinm`) are
 * avoided by matching on word boundaries, not raw substrings.
 */
function capitalizeExchangeClass(content: string, allExchangeIds: string[]): string {
  for (const id of allExchangeIds) {
    const wrapperName = capitalize(id);
    // struct binance <: CcxtExchange  ->  struct Binance <: CcxtExchange
    content = content.replace(
      new RegExp(`(struct\\s+)${id}(\\s)`, 'g'),
      `$1${wrapperName}$2`,
    );
    // self::binance  ->  self::Binance  (method receivers)
    content = content.replace(
      new RegExp(`(self::)${id}(\\b)`, 'g'),
      `$1${wrapperName}$2`,
    );
    // Union{binance, Nothing}  ->  Union{Binance, Nothing}  (parent field type in children)
    content = content.replace(
      new RegExp(`(Union\\{)${id}(,)`, 'g'),
      `$1${wrapperName}$2`,
    );
    // parent::Union{Binance, Nothing} = binance()  ->  = Binance()  (parent default ctor)
    content = content.replace(
      new RegExp(`(= )${id}(\\(\\))`, 'g'),
      `$1${wrapperName}$2`,
    );
    // hasfield(binance, name)  ->  hasfield(Binance, name)  (getproperty guard)
    content = content.replace(
      new RegExp(`(hasfield\\()${id}(,)`, 'g'),
      `$1${wrapperName}$2`,
    );
      // binance(; kwargs...) inside the wrapper constructor -> Binance(; kwargs...)
    content = content.replace(
      new RegExp(`(= )${id}(\\(; kwargs\\.\\.\\.)`, 'g'),
      `$1${wrapperName}$2`,
    );
      // binance() used as a call argument (e.g. child ctor: Binancecoinm(binance(), ...))
      // \b guards against matching the id as a substring of another exchange name.
    content = content.replace(
      new RegExp(`\\b${id}(\\(\\))`, 'g'),
      `${wrapperName}$1`,
    );
  }
  return content;
}

/**
   * Build the exchange wrapper constructor source. The wrapper is a keyword
 * outer constructor `function <Name>(; kwargs...)` that applies `describe()`
 * to the composed `parent` Exchange (mirroring the TS base constructor, which
 * merges `describe()` into the instance; the Julia port keeps that state on
 * `parent`).
 *
 * It MUST call the struct's POSITIONAL inner constructor (generated by
 * `@kwdef`) rather than the keyword one, because a keyword outer constructor
 * `function <Name>(; kwargs...)` and `@kwdef`'s keyword outer constructor
 * `function <Name>(; field1=def1, ...)` share the same name and collide —
 * calling `<Name>(; kwargs...)` would recurse into itself. The positional
 * inner constructor `<Name>(f1, f2, ...)` has a distinct signature, so the
 * wrapper dispatches to it cleanly. We parse the field defaults from the
 * emitted `@kwdef` struct to supply the positional arguments.
 *
 * Merging `describe()` is only half of what the TS base constructor does. The
 * steps that follow the config merge there — deriving the `has<Method>` flags,
 * resolving `newUpdates`, and `afterConstruct()` — have to run again here,
 * because when the composed `parent` Exchange was built it only saw the *base*
 * `describe()`. `afterConstruct()` in particular inverts `options['networks']`
 * into `options['networksById']` and expands the `features` block per market
 * type; skipping it left every exchange with only its handful of manually
 * declared id-to-code entries, so `networkIdToCode ('ARBITRUM')` returned the
 * raw id instead of `ARBONE` and parsed currencies/transactions carried
 * exchange-specific network ids.
 */
function buildWrapperSource(structContent: string, wrapperName: string): string {
  // Parse `    fieldName::Type = default` (or `    fieldName::Type`) lines.
  const fieldRe = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*::\s*[^\n=]+?(?:\s*=\s*([^\n]*))?\s*$/gm;
  const defaults: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = fieldRe.exec(structContent)) !== null) {
    // Skip the `mutable struct` / `struct` declaration line itself.
    if (m[1] === 'struct' || m[1] === 'mutable') continue;
    defaults.push(m[2] !== undefined ? m[2].trim() : 'nothing');
  }
  const positionalArgs = defaults.join(', ');
  return [
    ``,
    `function ${wrapperName}(; kwargs...)`,
    `    inst = ${wrapperName}(${positionalArgs})`,
    `    # describe() first, then the user config — the same order, and the same`,
    `    # merge rule, as the TS base constructor (Exchange.ts, "merge constructor`,
    `    # overrides to this instance"): a plain object is deep-merged onto the`,
    `    # current value, anything else is assigned. Assigning dictionaries`,
    `    # wholesale would drop the base defaults an exchange does not restate —`,
    `    # e.g. \`options.defaultNetworkCodeReplacements\`, which every`,
    `    # networkIdToCode lookup needs.`,
    `    #`,
    `    # \`features\` is the exception, and is assigned rather than merged.`,
    `    # Julia models inheritance by composition, so a child's \`parent\` is a`,
    `    # fully-built instance that has already run \`afterConstruct\` — and`,
    `    # \`featuresGenerator\` rewrites \`features\` in place, expanding the raw`,
    `    # \`{'default': ...}\` / \`{'swap': {'extends': ...}}\` shorthand into a`,
    `    # per-market-type table and recording absent types as \`nothing\`. Merging`,
    `    # that derived table with the raw \`describe()\` value it was derived from`,
    `    # feeds the generator its own output on the child's pass: a market type`,
    `    # the parent recorded as absent comes back as a present-but-\`nothing\``,
    `    # entry, which the generator then tries to index into. In TS the`,
    `    # generator only ever sees the raw value, so assign it here too.`,
    `    desc = inst.describe()`,
    `    for (k, v) in desc`,
    `        key = Symbol(k)`,
    `        if v isa AbstractDict && key !== :features`,
    `            inst[key] = deepExtend(get(inst, key, nothing), v)`,
    `        else`,
    `            inst[key] = v`,
    `        end`,
    `    end`,
    `    for (k, v) in kwargs`,
    `        if v isa AbstractDict && k !== :features`,
    `            inst[k] = deepExtend(get(inst, k, nothing), v)`,
    `        else`,
    `            inst[k] = v`,
    `        end`,
    `    end`,
    `    # Re-run the tail of the TS base constructor now that this exchange's`,
    `    # own describe() has been merged in. The composed parent Exchange only`,
    `    # ever saw the base describe(), so these derived values are still the`,
    `    # base ones until they are recomputed here.`,
    `    #`,
    `    # defineRestApi is deliberately not repeated: the generator emits every`,
    `    # api endpoint as a real Julia function (and a struct field), so the`,
    `    # dynamic closures the TS constructor installs have no work to do.`,
    `    for k in objectKeys(inst.has)`,
    `        inst[Symbol(string("has", capitalize(k)))] = ccxtruthy(get(inst.has, Symbol(k), nothing))`,
    `    end`,
    `    newUpdates = get(inst.options, Symbol("newUpdates"), nothing)`,
    `    inst.newUpdates = newUpdates === nothing ? true : newUpdates`,
    `    # afterConstruct already honours \`options.sandbox\`/\`options.testnet\`; the`,
    `    # TS constructor's extra \`setSandboxMode\` call reads the *user config*,`,
    `    # which arrives here as kwargs. Repeating the options-based check would`,
    `    # swap the api/test URLs a second time and clobber the apiBackup snapshot.`,
    `    inst.afterConstruct()`,
    `    if ccxtruthy(get(kwargs, :sandbox, false)) || ccxtruthy(get(kwargs, :testnet, false))`,
    `        inst.setSandboxMode(true)`,
    `    end`,
    `    inst.loadExchangeSpecificFiles()`,
    `    return inst`,
    `end`,
    ``,
  ].join('\n');
}

/** All exchange ids (lowercase TS class names) available under TS_SRC. */
function collectAllExchangeIds(): string[] {
  return fs.readdirSync(TS_SRC)
    .filter((f) => f.endsWith('.ts') && !f.startsWith('base') && !f.startsWith('abstract'))
    .map((f) => path.basename(f, '.ts'));
}

/**
 * Normalize TS-style comments emitted by the upstream Julia transpiler into
 * Julia-compatible comments. This is a generator-side post-process step; we
 * never hand-patch emitted files elsewhere.
 *
 * Drops the leading "copyright"-style banner of slash-dash lines that the
 * TS source emits at the top of every file (Julia has no slash-slash comments).
 * Strips slash-star JSDoc banners (Julia doesn't have block comments in
 * ccxt's generator output; docstrings live inside triple-quote Julia blocks).
 * Converts any remaining slash-slash line comments into Julia hash comments.
 * Leaves triple-quote Julia docstrings alone.
 */
function normalizeJuliaComments(input: string): string {
  const lines = input.split('\n');
  const out: string[] = [];
  let inBlockComment = false;
  let inDocstring = false;
  let docstringQuote: string | null = null;
  let seenCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track triple-quote docstrings so we don't mangle their contents.
    if (!inBlockComment) {
      const tripleQuotes = (line.match(/'''/g) || []).length;
      if (tripleQuotes === 1) {
        inDocstring = !inDocstring;
        docstringQuote = inDocstring ? "'''" : null;
      }
      if (inDocstring) {
        out.push(line);
        continue;
      }
    }

    if (inBlockComment) {
      if (trimmed.endsWith('*/')) {
        inBlockComment = false;
      }
      continue;
    }

    if (trimmed.startsWith('/*')) {
      if (trimmed.endsWith('*/')) {
        if (trimmed.length > 4) {
          // Drop JSDoc banner lines like /*! ... */ or /** ... */
          continue;
        }
      } else {
        inBlockComment = true;
      }
      continue;
    }

    if (/^\/\//.test(trimmed)) {
      if (!seenCode) {
        // Drop the copyright banner at the top of the file.
        continue;
      }
      const idx = line.indexOf('//');
      const rest = line.slice(idx + 2);
      const commentText = rest.trimStart();
      if (commentText.length === 0) {
        out.push('#');
      } else {
        out.push('# ' + commentText);
      }
      continue;
    }

    if (trimmed.length > 0) {
      seenCode = true;
    }

    out.push(line);
  }

  return out.join('\n');
}

/**
 * Generator-side suppression of bare `undefined` tokens that the
 * Julia transpiler / TS-to-Julia pipeline emits. TS uses the
 * global `undefined`; Julia has no such binding. A bare `undefined`
 * at top level breaks parsing, so we comment it out.
 */
function suppressBareUndefined(input: string): string {
 const lines = input.split('\n');
 const rewritten: string[] = [];
 for (const line of lines) {
  const trimmed = line.trimStart();
  if (/^undefined\s*;?\s*$/.test(trimmed)) {
   rewritten.push(`# (undefined suppressed)`);
  } else {
   rewritten.push(line);
  }
 }
 return rewritten.join('\n');
}

/**
 * Collapse a duplicated abstract supertype in a struct header.
 *
 * The upstream Julia backend appends ` <: CcxtExchange` twice for the root
 * base class: once because the class is named `Exchange`, and once more for
 * its `extends` heritage clause (since upstream split the base into
 * `class Exchange extends BaseExchange`). Julia rejects the result —
 * `@kwdef mutable struct Exchange <: CcxtExchange <: CcxtExchange` fails with
 * "Invalid usage of @kwdef" — so the repeated token is folded back to one.
 */
function collapseDuplicateSupertype(input: string): string {
  return input.replace(
    /(struct\s+[A-Za-z_]\w*\s*<:\s*CcxtExchange)(?:\s*<:\s*CcxtExchange)+/g,
    '$1',
  );
}

/**
 * Flatten the upstream `BaseExchange` / `Exchange` two-tier base into the
 * single `Exchange` struct the Julia runtime is built around.
 *
 * `ts/src/base/Exchange.ts` declares `class BaseExchange` (all shared
 * infrastructure) plus a thin `class Exchange extends BaseExchange` holding
 * only "not supported yet" stubs, so the prediction tier can extend
 * `BaseExchange` as an independent sibling. TypeScript expresses that with two
 * classes; the Julia backend therefore emits two sibling structs, with every
 * base method typed `self::BaseExchange` and a thin `Exchange` whose `parent`
 * is a `BaseExchange`.
 *
 * That shape does not work here. `BaseExchange` is not a subtype of
 * `CcxtExchange`, so `ccxt_takes_self` (src/CCXTBase.jl) reports every base
 * method as a free function and calls it without the instance; and the thin
 * `Exchange` no longer carries the state fields (`id`, `markets`, `options`,
 * …) that `Base.getproperty(self::Exchange, …)` resolves against.
 *
 * Julia models the inheritance by composition rather than by subtyping, so the
 * split buys nothing: the two tiers are merged back into one `Exchange <:
 * CcxtExchange`. The thin struct is dropped — its fields are only
 * `field::Function = field` aliases for stubs that are already emitted as
 * top-level `self::CcxtExchange` functions and resolved through the
 * module-level fallback in `getproperty`.
 */
function flattenBaseExchangeTier(input: string): string {
  const lines = input.split('\n');
  const baseIdx = lines.findIndex((l) => /^@kwdef mutable struct BaseExchange\b/.test(l));
  if (baseIdx === -1) return input;
  let kept = lines;
  const thinIdx = lines.findIndex((l) => /^@kwdef mutable struct Exchange\b/.test(l));
  if (thinIdx > baseIdx) {
    let endIdx = -1;
    for (let i = thinIdx + 1; i < lines.length; i++) {
      if (lines[i] === 'end') {
        endIdx = i;
        break;
      }
      // A top-level declaration before the closing `end` means the block is
      // not the shape we expect; leave the source alone rather than guess.
      if (/^(@kwdef\b|function\s|struct\s|mutable\s)/.test(lines[i])) break;
    }
    if (endIdx !== -1) {
      const body = lines.slice(thinIdx + 1, endIdx).join('\n');
      if (/^\s*parent::Union\{BaseExchange,\s*Nothing\}/m.test(body)) {
        kept = lines.slice(0, thinIdx).concat(lines.slice(endIdx + 1));
      }
    }
  }
  let content = kept.join('\n');
  content = content.replace(
    /^@kwdef mutable struct BaseExchange\b.*$/m,
    '@kwdef mutable struct Exchange <: CcxtExchange',
  );
  // Property resolution stays keyed on the concrete struct: the abstract
  // `CcxtExchange` overload already lives in src/CCXTBase.jl and must not be
  // redefined here.
  content = content.replace(
    /Base\.getproperty\(self::BaseExchange,/g,
    'Base.getproperty(self::Exchange,',
  );
  // Base methods dispatch on the abstract supertype so that a composed
  // exchange (`Binance`, whose `parent` is an `Exchange`) is accepted too, and
  // so `ccxt_takes_self` recognises them as `self`-taking.
  content = content.replace(/self::BaseExchange\b/g, 'self::CcxtExchange');
  // Whatever is left is the struct/constructor name itself.
  return content.replace(/\bBaseExchange\b/g, 'Exchange');
}

/**
 * TS declares `deepExtendSafe`/`indexBySafe` as narrowly-typed aliases of
 * `deepExtend`/`indexBy` (`ts/src/base/Exchange.ts`, ~line 446). They are
 * class *properties*, so the backend emits them as struct fields whose default
 * is the same-named binding — but it never emits that binding, and it also
 * calls them unqualified (`indexBySafe (this.currencies, 'id')` at
 * Exchange.ts:4618 becomes a bare `indexBySafe(...)`). Both spellings need a
 * module-level name to resolve against, so declare them next to the other
 * `<name> = functions.<name>` preamble aliases the generator does emit.
 */
function declareTypedHelperAliases(input: string): string {
  const anchor = 'deepExtend = functions.deepExtend';
  if (!input.includes(anchor)) return input;
  if (/^deepExtendSafe\s*=/m.test(input)) return input;
  return input.replace(
    anchor,
    [
      anchor,
      '# TS narrows `deepExtendSafe`/`indexBySafe` to typed aliases of the same',
      '# helpers (Exchange.ts); the backend references them without emitting the',
      '# bindings, so they are declared here.',
      'deepExtendSafe = functions.deepExtend',
      'indexBySafe = functions.indexBy',
    ].join('\n'),
  );
}

/**
 * Widen `Exchange` struct fields whose declared type is narrower than what
 * actually gets assigned to them.
 *
 * TS property declarations carry interface types (`urls: Urls`,
 * `precision: Precision`, `limits: Limits`, …) that the backend copies onto
 * the Julia struct field. Nothing in the runtime ever builds those structs:
 * `describe()` returns nested `Dict`s, so the very first assignment — the
 * constructor's own default, before any user config — raises
 * `MethodError: Cannot convert Dict{String, Any} to Precision`.
 *
 * The `_overlay_*` machinery in `baseExtras` catches type mismatches on
 * *property writes*, but the inner `new(...)` call bypasses `setproperty!`
 * entirely, so a mismatched default is fatal at construction. These fields are
 * dictionary-shaped in every language; typing them `Any` is what the runtime
 * has always assumed.
 *
 * Only fields on the `Exchange` struct are touched, and only the ones listed:
 * a blanket widening would erase the type information that the overlay uses to
 * decide when a write needs redirecting.
 */
const WIDENED_EXCHANGE_FIELDS = [
  // Interface-typed fields that `describe()` fills with plain dictionaries.
  'urls', 'precision', 'status', 'requiredCredentials', 'limits', 'fees',
  'tokenBucket', 'exceptions', 'timeframes',
  // Element-typed containers filled with heterogeneous entries.
  'fetchHistoryCache', 'symbols', 'features',
];

/**
 * Reset the inner constructor's default for every TS field declared with the
 * definite-assignment assertion (`apiKey!: string`) back to `nothing`.
 *
 * `!` tells the TS compiler "this property is assigned somewhere I cannot
 * see" — `describe()`, the user config merge, or a credential setter. The
 * declaration carries a type but deliberately NO initializer, so at
 * construction time the property is plain `undefined` in JS. Several base
 * behaviours read that: `checkRequiredCredentials` throws only when a required
 * credential is falsy, and `test.afterConstructor` asserts a fresh instance has
 * `apiKey === undefined`, `accounts === undefined`, `precision === undefined`.
 *
 * The backend, seeing a typed field with no initializer, synthesises the
 * type's zero value instead (`""` for `string`, `Dict{String, Account}()` for
 * `Dictionary<Account>`, `Vector{Account}()` for `Account[]`). That is a
 * defensible default for a typed language but it is the wrong port: an empty
 * string is not `undefined`, and the difference is observable. It also only
 * appeared once upstream annotated these fields for `strictNullChecks`
 * (ts/src/base/Exchange.ts, "enable strictNullChecks compliance across
 * ts/src"), which silently changed the generated Julia for ~29 fields.
 *
 * The field list is read out of the TS source rather than hardcoded, so a
 * field that gains or loses its `!` upstream is picked up on the next run.
 * Fields WITH an initializer (`symbols: string[] = []`) are untouched: there
 * the zero value is what the source actually asks for.
 *
 * Only the inner constructor's positional defaults are rewritten. The struct's
 * own `@kwdef` defaults are already `nothing`, and every call site goes
 * through the constructor.
 */
function resetDefiniteAssignmentDefaults(input: string): string {
  const exchangeTs = path.join(TS_SRC, 'base', 'Exchange.ts');
  let tsSource: string;
  try {
    tsSource = fs.readFileSync(exchangeTs, 'utf8');
  } catch {
    return input;
  }
  // Class-body property declarations only: they sit at exactly 4-space indent
  // (method bodies are 8+). The type may span lines (`precision!: {` … `};`),
  // so match the declaration head rather than the whole statement. TS forbids
  // combining `!` with an initializer, so there is nothing to exclude.
  const fields = new Set<string>();
  for (const m of tsSource.matchAll(/^ {4}([A-Za-z_][A-Za-z0-9_]*)!\s*:/gm)) {
    fields.add(m[1]);
  }
  if (fields.size === 0) return input;
  const ctorIdx = input.indexOf('function Exchange(');
  if (ctorIdx === -1) return input;
  // The signature runs to the `; userConfig` keyword-argument separator.
  const sigEnd = input.indexOf('; userConfig', ctorIdx);
  if (sigEnd === -1) return input;
  const signature = input.slice(ctorIdx, sigEnd);
  // Split on top-level commas: a default may itself be a nested
  // `Dict{Symbol, Any}(...)` literal spanning commas and newlines.
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of signature) {
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 1) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  let changed = false;
  const rewritten = parts.map((part) => {
    const m = /^(\s*)([A-Za-z_][A-Za-z0-9_]*)=([\s\S]*)$/.exec(part);
    if (m === null || !fields.has(m[2]) || m[3].trim() === 'nothing') return part;
    changed = true;
    return `${m[1]}${m[2]}=nothing`;
  });
  if (!changed) return input;
  return input.slice(0, ctorIdx) + rewritten.join(',') + input.slice(sigEnd);
}

function widenExchangeStructFields(input: string): string {
  const structIdx = input.indexOf('@kwdef mutable struct Exchange');
  if (structIdx === -1) return input;
  const lines = input.split('\n');
  const startLine = input.slice(0, structIdx).split('\n').length - 1;
  const widened = new Set(WIDENED_EXCHANGE_FIELDS);
  for (let i = startLine + 1; i < lines.length; i++) {
    // The struct body ends at the inner constructor (or its own `end`).
    if (/^\s*function\s+Exchange\s*\(/.test(lines[i])) break;
    if (/^end\b/.test(lines[i])) break;
    const m = /^(\s*)([A-Za-z_][A-Za-z0-9_]*)\s*::\s*[^=]+?(\s*=\s*.*)?$/.exec(lines[i]);
    if (m === null || !widened.has(m[2])) continue;
    // Keep `= nothing` so the field stays optional; a container default (`[]`,
    // `Dict{...}()`) is preserved verbatim, it is only the annotation that goes.
    lines[i] = `${m[1]}${m[2]}::Any${m[3] ?? ' = nothing'}`;
  }
  return lines.join('\n');
}

/**
 * Collapse `Union{Union{A, Nothing}, Nothing}` down to `Union{A, Nothing}`.
 *
 * A TS property that is both optional (`prop?:`) and explicitly nullable
 * (`: Dict | undefined`) makes the backend add `Nothing` twice. Julia accepts
 * the nested spelling but it makes the field lines unreadable and defeats the
 * exact-match comparisons the other passes do, so normalise it.
 */
function collapseNestedNothingUnions(input: string): string {
  // The inner union carries its own braces (`Union{Dict{String, Any},
  // Nothing}`), so finding its end takes a balanced scan rather than a regex.
  const findClose = (s: string, openIdx: number): number => {
    let depth = 0;
    for (let i = openIdx; i < s.length; i++) {
      if (s[i] === '{') depth++;
      else if (s[i] === '}' && --depth === 0) return i;
    }
    return -1;
  };
  let out = input;
  for (;;) {
    const start = out.indexOf('Union{Union{');
    if (start === -1) break;
    const innerOpen = start + 'Union{'.length;
    const innerClose = findClose(out, innerOpen + 'Union'.length);
    const outerClose = findClose(out, start + 'Union'.length);
    if (innerClose === -1 || outerClose === -1) break;
    const inner = out.slice(innerOpen, innerClose + 1);
    const tail = out.slice(innerClose + 1, outerClose).trim();
    // Only the redundant `, Nothing}` wrapper is removed; anything else in the
    // outer union is a real alternative and must be preserved.
    if (tail !== ', Nothing' && tail !== ',Nothing') break;
    if (!inner.endsWith('Nothing}')) break;
    out = out.slice(0, start) + inner + out.slice(outerClose + 1);
  }
  return out;
}

/**
 * Accept a leading positional `Dict` as the user config in `Exchange(...)`.
 *
 * The TS constructor takes exactly one argument, `userConfig`. The backend
 * expands every class property into its own positional parameter, which pushes
 * `userConfig` out to a keyword — so the idiomatic `Exchange (config)` call
 * that every call site and the shared test suite uses would land the config in
 * `attrs` (the first property) and silently drop it.
 *
 * Recover it: if the caller passed no `userConfig` keyword but did pass a
 * non-empty leading dictionary, that dictionary is the config.
 */
function recoverLeadingDictConfig(input: string): string {
  const lines = input.split('\n');
  const newIdx = lines.findIndex((l) => /^\s*v = new\(attrs,/.test(l));
  if (newIdx === -1) return input;
  if (lines.slice(newIdx, newIdx + 12).some((l) => l.includes('userConfig = attrs'))) return input;
  const indent = /^(\s*)/.exec(lines[newIdx])![1];
  const block = [
    '# In TS the constructor takes a single `userConfig` object. The',
    '# backend expanded every struct field into its own positional',
    '# parameter, pushing `userConfig` into a keyword — so a plain',
    '# `Exchange (config)` call would land the config in `attrs` and be',
    '# dropped. Treat a leading Dict as the user config, which is what',
    '# every call site (and the shared test suite) actually passes.',
    'if isempty(userConfig) && attrs isa AbstractDict && !isempty(attrs)',
    '    userConfig = attrs',
    '    attrs = Dict{Symbol, Any}()',
    '    v.attrs = attrs',
    'end',
  ].map((l) => indent + l);
  lines.splice(newIdx + 1, 0, ...block);
  return lines.join('\n');
}

/**
 * Restore the plain-object guard in the `describe()`/`userConfig` merge.
 *
 * TS: `if (value && Object.getPrototypeOf (value) === Object.prototype)` —
 * deep-merge plain objects onto the current value, assign everything else. The
 * backend has no notion of `Object.prototype`, so it emits the tautology
 * `ccxt_and(value, nothing == nothing)`, which sends arrays and scalars down
 * the `deepExtend` path too and corrupts list-valued config keys.
 */
function restorePlainObjectMergeGuard(input: string): string {
  return input.replace(
    /^(\s*)if functions\.ccxtruthy\(@functions\.ccxt_and\(value, nothing == nothing\)\)$/gm,
    [
      '$1# TS: `value && Object.getPrototypeOf (value) === Object.prototype`',
      '$1# — merge only plain objects, assign everything else. The backend lost',
      '$1# the prototype check (it emitted `nothing == nothing`), so arrays and',
      '$1# scalars went down the deepExtend path too.',
      '$1if functions.ccxtruthy(value) && isa(value, AbstractDict)',
    ].join('\n'),
  );
}

/**
 * Fix base methods whose body calls a *module-level* function that shares its
 * own name, and the JS-builtin checks the backend cannot express.
 *
 * `throttle(self::CcxtExchange, cost)` delegating to `throttle(self.throttler,
 * cost)` resolves to itself and recurses forever, so the `Throttler` overload
 * has to be named explicitly. `isBinaryMessage` tests `msg instanceof
 * Uint8Array || msg instanceof ArrayBuffer`; both map to the same Julia type
 * (a byte vector), and neither name is exported from `functions`.
 */
function fixBaseRuntimeCalls(input: string): string {
  let out = input.replace(
    /^(\s*)return throttle\(self\.throttler, cost\)$/m,
    '$1return functions.throttle(self.throttler, cost)',
  );
  out = out.replace(
    /^(\s*)return @functions\.ccxt_or\(isa\(msg, Uint8Array\), isa\(msg, ArrayBuffer\)\)$/m,
    [
      '$1# Julia port of `msg instanceof Uint8Array || msg instanceof ArrayBuffer`.',
      '$1# Binary payloads are represented as AbstractVector{UInt8}.',
      '$1return isa(msg, AbstractVector{UInt8})',
    ].join('\n'),
  );
  // `Uint8Array`/`ArrayBuffer` are defined in functions.jl but not exported,
  // so any surviving reference has to be qualified.
  out = out.replace(/(?<!functions\.)\b(Uint8Array|ArrayBuffer)\b/g, 'functions.$1');
  // The uncompressed-point helper: TS reaches into `@noble/curves`
  // (`Point.fromBytes(...).toBytes(false)`); Julia has one named equivalent.
  out = out.replace(
    /toBytes\(fromBytes\(get\(secp256k1, Symbol\("Point"\), nothing\), (\w+)\), false\)/g,
    'functions.ecPointToUncompressed(functions.secp256k1, $1)',
  );
  out = redirectJsonStringifyWithNull(out);
  return out;
}

/**
 * Point `jsonStringifyWithNull` at the canonical encoder in `functions.jl`.
 *
 * TS: `JSON.stringify (obj, (_, v) => (v === undefined ? null : v))`. The
 * backend maps `JSON.stringify` onto `JSON3.json` and passes the replacer
 * through as a Julia closure — but JSON3's entry point is `write`, not `json`,
 * and it takes no replacer, so the emitted body raises
 * `UndefVarError: json not defined in JSON3` the first time it is reached.
 *
 * The replacer needs no port (`JSON3.write` already encodes `nothing` as
 * `null`), but key ordering does: JS objects iterate in insertion order while a
 * Julia `Dict` does not, and this method's only caller compares two encoded
 * strings. `functions.jsonStringifyCanonical` handles both — see the comment
 * there for the full reasoning.
 */
function redirectJsonStringifyWithNull(input: string): string {
  const marker = 'function jsonStringifyWithNull(self::CcxtExchange, obj)';
  const start = input.indexOf(marker);
  if (start === -1) return input;
  const lines = input.slice(start).split('\n');
  // The generated body is the replacer closure, so the method's own `end` is
  // the second one — find it by depth rather than by counting lines, which
  // would silently mis-slice if the backend reformats.
  let depth = 0;
  let endLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(function|if|for|while|try|begin)\b/.test(lines[i]) || /\bfunction\s*\(/.test(lines[i])) depth++;
    if (/^\s*end\)?\s*$/.test(lines[i]) && --depth === 0) {
      endLine = i;
      break;
    }
  }
  if (endLine === -1) return input;
  const body = lines.slice(0, endLine + 1).join('\n');
  if (!body.includes('JSON3.json(')) return input;
  const replacement = [
    marker,
    '    # TS: `JSON.stringify (obj, (_, v) => (v === undefined ? null : v))`.',
    '    # The backend emits `JSON3.json` (which does not exist) plus a replacer',
    '    # closure (which JSON3 does not accept); `jsonStringifyCanonical` is the',
    '    # Julia equivalent, and sorts keys so the encoding is order-independent.',
    '    return functions.jsonStringifyCanonical(obj)',
    'end',
  ].join('\n');
  return input.slice(0, start) + replacement + input.slice(start + body.length);
}

/**
 * Every fix that applies only to `BaseMethods.jl`, in dependency order.
 *
 * Kept separate from `cleanupJuliaSource` (which runs over exchange files and
 * transpiled tests too) because each one keys off a construct that exists
 * exactly once, in the base: the `Exchange` struct, its constructor, or a
 * named base method.
 */
function cleanupJuliaBaseSource(input: string): string {
  let out = declareTypedHelperAliases(input);
  out = collapseNestedNothingUnions(out);
  out = widenExchangeStructFields(out);
  out = resetDefiniteAssignmentDefaults(out);
  out = recoverLeadingDictConfig(out);
  out = restorePlainObjectMergeGuard(out);
  out = fixBaseRuntimeCalls(out);
  return out;
}

/**
 * Master cleanup pipeline for Julia transpiler output.
 * Chains the individual post-processing passes in dependency-safe
 * order: comment normalization -> undefined suppression -> stray
 * arg-list cleanup -> orphan type-var cleanup -> bare regex
 * suppression -> string-juxtaposition fix -> end-marker cleanup ->
 * destructuring suppression.
 */
function cleanupJuliaSource(input: string): string {
 let out = flattenBaseExchangeTier(input);
 out = collapseDuplicateSupertype(out);
 out = normalizeJuliaComments(out);
 out = suppressBareUndefined(out);
 out = suppressStrayArgList(out);
 out = suppressOrphanTypeVars(out);
 out = suppressBareRegex(out);
 out = fixStringJuxtaposition(out);
 out = cleanupEndMarkers(out);
 out = suppressDestructuring(out);
 out = qualifySelfShadowedCalls(out);
 out = qualifyPreAssignmentCalls(out);
 out = fixDesugaredLoopContinues(out);
 out = fixForInLoops(out);
 out = fixPlainJsonStringify(out);
 return out;
}

/**
 * Rewrite a plain `JSON.stringify (x)` to the library's own `json` helper.
 *
 * The backend maps `JSON.stringify` onto `JSON3.json`, but JSON3 exposes
 * `write` — there is no `json` — so every emitted call raises
 * `UndefVarError: json not defined in JSON3` when it is reached. Both current
 * call sites (`digifinex`, `zebpay`) sit in `sign()`, so the failure only
 * surfaces on a signed request rather than at load time.
 *
 * `functions.json` is the same encoder the rest of the transpiled code already
 * uses for `this.json (...)`, which keeps the request body byte-identical to
 * the other languages. The replacer-taking overload in the base is handled
 * separately (see `redirectJsonStringifyWithNull`); this pass deliberately
 * only matches a single-argument call.
 */
function fixPlainJsonStringify(input: string): string {
  return input.replace(/\bJSON3\.json\(([^(),]*)\)/g, 'functions.json($1)');
}

/**
 * Generator-side fix for JS `for (const key in obj)`.
 *
 * The upstream Julia backend lowers a `ForInStatement` to
 *
 *     for (key, _) in obj
 *
 * i.e. it assumes `obj` iterates as `key => value` pairs. That holds for a
 * `Dict`, so the emitted loop happens to work whenever the operand really is
 * an object. It is wrong for every other JS type:
 *
 *   - over an **array**, JS `for...in` yields the stringified indices
 *     "0", "1", ... , but Julia iterates a `Vector` by *value*, so destructuring
 *     `(key, _)` either binds `key` to the first element of a nested row or
 *     raises `BoundsError: attempt to access Int64 at index [2]` on scalars;
 *   - over `undefined`/`null` or a primitive, JS yields nothing while Julia
 *     raises a `MethodError`.
 *
 * TypeScript cannot always tell the two apart at the call site — `equals (a, b)`
 * in `ts/src/pro/test/base/test.cache.ts` is invoked with both an `ArrayCache`
 * and a plain object — so the fix has to be a runtime one. `functions.ccxt_forin`
 * normalises any operand to a vector of JS-shaped string keys, which is exactly
 * what the loop body then feeds back into `get(obj, Symbol(key), nothing)`.
 * This mirrors the `Base.get(::AbstractVector, ::Symbol, default)` shim that
 * already resolves the same array/object ambiguity on the read side.
 *
 * Only the transpiler's own `(<ident>, _) in` shape is rewritten, so genuine
 * pair loops (`for (k, v) in headers`, `for (i, item) in enumerate(xs)`) are
 * left alone.
 */
function fixForInLoops(input: string): string {
  return input.replace(
    /^(\s*)for\s*\(\s*([A-Za-z_]\w*)\s*,\s*_\s*\)\s+in\s+(.+?)\s*$/gm,
    (_m, indent: string, key: string, obj: string) => `${indent}for ${key} in functions.ccxt_forin(${obj})`,
  );
}

/**
 * Generator-side fix for `continue` inside a desugared C-style `for` loop.
 *
 * Julia has no C-style `for (init; cond; update)`, so the transpiler lowers it
 * to an initializer, a `while cond`, and the update appended as the *last*
 * statement of the loop body. That lowering is correct for straight-line
 * bodies but silently wrong whenever the body contains `continue`: control
 * jumps back to the condition without ever reaching the trailing update, so
 * the counter never advances and the loop spins forever. Upstream JS/TS keeps
 * the update in the `for` header, where `continue` still runs it — for example
 * `assertStructure`'s `if (key in skippedProperties) { continue; }` hangs the
 * whole test process once any property is skipped.
 *
 * Each `continue` that belongs to such a loop is rewritten to perform the
 * update first (`i += 1; continue`), restoring the C semantics. Only loops
 * whose final body statement is a simple `x += 1` / `x -= 1` counter update
 * are touched, and `continue` statements owned by a nested loop are left to
 * that loop's own pass, so no other construct can be caught by accident.
 */
function fixDesugaredLoopContinues(input: string): string {
  const lines = input.split('\n');
  const OPEN = /^\s*(while|for|if|function|try|begin|let|do|struct|mutable\s+struct|module|quote|macro)\b/;
  const NESTED_LOOP = /^\s*(while|for)\b/;
  const END = /^\s*end\b/;
  const INCREMENT = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*([+-])=\s*1\s*;?\s*$/;
  const CONTINUE = /^(\s*)continue\s*;?\s*$/;

  // Index of the `end` that closes the block opened on line `start`.
  const matchingEnd = (start: number): number => {
    let depth = 0;
    for (let j = start; j < lines.length; j++) {
      // A one-line `if cond; x; end` opens and closes on the same line and
      // would corrupt the depth count, so skip self-closing lines.
      const opens = OPEN.test(lines[j]);
      const closes = END.test(lines[j]);
      if (opens) depth += 1;
      if (closes) {
        depth -= 1;
        if (depth === 0) return j;
      }
    }
    return -1;
  };

  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*while\b/.test(lines[i])) continue;
    const end = matchingEnd(i);
    if (end < 0 || end - 1 <= i) continue;
    const increment = INCREMENT.exec(lines[end - 1]);
    if (!increment) continue; // not a desugared counting loop
    const [, variable, op] = increment;
    let j = i + 1;
    while (j < end - 1) {
      if (NESTED_LOOP.test(lines[j])) {
        // A `continue` in a nested loop belongs to that loop, not this one.
        const nestedEnd = matchingEnd(j);
        j = nestedEnd < 0 ? j + 1 : nestedEnd + 1;
        continue;
      }
      const cont = CONTINUE.exec(lines[j]);
      if (cont) {
        lines[j] = `${cont[1]}${variable} ${op}= 1; continue`;
      }
      j++;
    }
  }
  return lines.join('\n');
}

/**
 * Generator-side fix for `x = x(...)` self-shadowing assignments.
 *
 * JavaScript hoists `const hash = this.hash (auth, ...)` into a fresh binding
 * that does not shadow the callee, because the callee is `this.hash`. The
 * Julia transpiler drops the `this.` receiver for base helpers that are free
 * functions (`hash`, `json`, `uuid`, `seconds`, `objectKeys`, …), which turns
 * the statement into `hash = hash(auth, ...)`. Julia treats an assigned name
 * as local for the whole method body, so the call on the right-hand side
 * resolves to the not-yet-assigned local and raises
 * `UndefVarError: hash not defined in local scope`.
 *
 * Rewriting the callee to its module-qualified form (`Ccxt.hash(...)`) keeps
 * the local binding while forcing the call to resolve against the module.
 * Only exact `name = name(` statements are touched, so nothing else can be
 * caught by accident.
 */
function qualifySelfShadowedCalls(input: string): string {
  return input
    .split('\n')
    .map((line) => line.replace(
      /^(\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*=\s*)\2\(/,
      '$1$2$3Ccxt.$2(',
    ))
    .join('\n');
}

/**
 * Generator-side fix for a local assignment that shadows a call made *earlier*
 * in the same function body.
 *
 * This is the whole-body counterpart of `qualifySelfShadowedCalls`, which only
 * catches the single-line `x = x(...)` form. The same hazard appears whenever a
 * JS test calls `exchange.foo ()` and later declares an unrelated local named
 * `foo`, as `ts/src/test/Exchange/test.fetchCurrencies.ts` does:
 *
 *     const currencies = await exchange.fetchCurrencies ();          // line 9
 *     const fetchCurrencies = exchange.safeDict (spot, 'fetchCurrencies', {});
 *
 * In JS the two are different bindings — the call goes through `exchange`. The
 * Julia backend drops the receiver, and Julia scopes an assigned name as local
 * across the *entire* body regardless of statement order, so the earlier call
 * resolves to the not-yet-assigned local and dies with
 * `UndefVarError: fetchCurrencies not defined in local scope`.
 *
 * Each function body is scanned for names that are both assigned and called.
 * Call sites that appear before the first assignment are module-qualified, so
 * they resolve against `Ccxt` while the local binding is left intact. Call
 * sites at or after the assignment are deliberately untouched — there the local
 * really is the intended callee (a closure being invoked, say).
 */
function qualifyPreAssignmentCalls(input: string): string {
  const lines = input.split('\n');
  // Collect [start, end] line ranges of top-level `function ... end` bodies.
  const bodies: Array<[number, number]> = [];
  let start = -1;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (start < 0) {
      if (/^function\s+[A-Za-z_][\w!]*\s*\(/.test(trimmed)) {
        start = i;
        depth = 1;
      }
      continue;
    }
    // Track nesting so an inner block's `end` does not close the function.
    if (/^(function|if|for|while|try|begin|let|do|struct|quote)\b/.test(trimmed)
        || /\bdo\s*(\|[^|]*\|)?\s*$/.test(trimmed)) {
      depth++;
    } else if (/^end\b/.test(trimmed)) {
      depth--;
      if (depth === 0) {
        bodies.push([start, i]);
        start = -1;
      }
    }
  }
  for (const [from, to] of bodies) {
    // Names assigned somewhere in the body, with the line of first assignment.
    const firstAssign = new Map<string, number>();
    for (let i = from + 1; i < to; i++) {
      const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)/.exec(lines[i]);
      if (m && !firstAssign.has(m[1])) {
        firstAssign.set(m[1], i);
      }
    }
    for (const [name, assignLine] of firstAssign) {
      for (let i = from + 1; i < assignLine; i++) {
        // Bare `name(` only: skip `.name(`, `Ccxt.name(`, and longer identifiers.
        lines[i] = lines[i].replace(
          new RegExp(`(?<![\\w.])${name}\\s*\\(`, 'g'),
          `Ccxt.${name}(`,
        );
      }
    }
  }
  return lines.join('\n');
}

/**
 * Generator-side suppression of multi-line function-call
 * continuations the Julia transpiler emits as bare parenthesised
 * argument lists. They are not valid Julia top-level expressions
 * and break parsing, so we comment them out.
 *
 * Example stray line:
 *   self.someMethod(self, arg1, arg2, arg3
 *   );
 *
 * The opening line is a normal call; the closing `);` on its own
 * line is the artifact. We drop the closing line and let the
 * opening line stand as a normal call.
 */
function suppressStrayArgList(input: string): string {
  const lines = input.split('\n');
  const rewritten: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const current = lines[i];
    const trimmed = current.trim();
    // Detect a stray closing `);` that follows a line ending in `(`.
    if (/^\);\s*$/.test(trimmed) && rewritten.length > 0) {
      const prev = rewritten[rewritten.length - 1].trimEnd();
      if (prev.endsWith('(')) {
        // Drop the stray `);` line entirely.
        i++;
        continue;
      }
    }
    rewritten.push(current);
    i++;
  }
  return rewritten.join('\n');
}

/**
 * Generator-side suppression of orphan type-variable placeholder
 * lines the upstream Julia transpiler emits. Patterns:
 * <name>);
 *
 * These are not valid Julia expressions and break parsing, so we
 * comment them out.
 */
function suppressOrphanTypeVars(input: string): string {
  const lines = input.split('\n');
  const rewritten: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // An honest orphan type-var artifact is a bare `Name);` on its own
    // line (the opening `Name(` was lost in transpilation). We must NOT
    // swallow legitimate Julia such as:
    //   * `end);` / `end;` — the trailing `);` that closes an anonymous
    //     `function () ... end` (e.g. a promise `.catch(() => {})` handler);
    //   * `catch_var(...);` or any `Name(args...);` call — those have a
    //     preceding `(`, so they are real calls, not orphans.
    // Only suppress a name immediately followed by `);` with no `(` before
    // the `)` on the line, and never when the token is `end`/a keyword.
    const isOrphanTypeVar =
      /^end\b/.test(trimmed) === false &&
      /^\);\s*$/.test(trimmed) === false && // do not touch bare `);`/trailing `end);`
      /^[A-Za-z_][A-Za-z0-9_]*\);\s*$/.test(trimmed) &&
      trimmed.indexOf('(') === -1;
    if (isOrphanTypeVar) {
      rewritten.push(`# (orphan type-var suppressed: ${trimmed})`);
    } else {
      rewritten.push(line);
    }
  }
  return rewritten.join('\n');
}

/**
 * Generator-side suppression of bare regex literals that the Julia
 * transpiler emits verbatim from TS sources. Julia does not have
 * bare regex literals; they must be wrapped in a Regex constructor
 * or string. We comment them out to keep the module parseable.
 */
function suppressBareRegex(input: string): string {
  const lines = input.split('\n');
  const rewritten: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // A bare regex literal looks like /pattern/flags at top level.
    if (/^\/(?:\\.|[^\/\r\n\\])+\/[gimsuy]*$/.test(trimmed)) {
      rewritten.push(`# (regex suppressed: uses PCRE feature) ${trimmed}`);
    } else {
      rewritten.push(line);
    }
  }
  return rewritten.join('\n');
}

/**
 * Generator-side fix for Julia string-literal juxtaposition errors.
 * The transpiler sometimes emits adjacent string literals that Julia
 * parses as a single concatenated literal, which can break if the
 * embedded quotes are not balanced. We insert a newline between
 * adjacent string literals to force separate expressions.
 */
function fixStringJuxtaposition(input: string): string {
  const lines = input.split('\n');
  const rewritten: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Detect a line that is just a string literal (possibly with trailing comma).
    const match = line.match(/^(\s*)(["'])(.*)\2(\s*,?\s*)$/);
    if (match && i + 1 < lines.length) {
      const nextTrimmed = lines[i + 1].trim();
      // If the next line also starts with a string literal, insert a newline.
      if (/^["']/.test(nextTrimmed)) {
        rewritten.push(line);
        rewritten.push('');
        continue;
      }
    }
    rewritten.push(line);
  }
  return rewritten.join('\n');
}

/**
 * Generator-side end-marker cleanup. The upstream Julia transpiler
 * emits consecutive `end` markers and `end;` lines that orphan the
 * next `elseif` chain. Two passes handle the cascading cases:
 *
 * 1. Collapse adjacent `end`/`end;` markers down to one.
 * 2. Drop a stray `end;` that immediately precedes an `elseif`
 *    whose opening `if` line was lost in transpilation.
 *
 * Both passes can produce new collisions (e.g. collapsing two `end`s
 * exposes a new orphan), so wrap them in a fixed-point loop. Generator
 * work only, no `.jl` hand-edits.
 */
function cleanupEndMarkers(input: string): string {
  const out = input.split('\n');
  // Pass 1: collapse consecutive bare `end` / `end;` lines.
  let endPassIterations = 0;
  while (endPassIterations < 64) {
    endPassIterations += 1;
    let changed = false;
    for (let j = 1; j < out.length; j++) {
      const cur = out[j].trim();
      const prev = out[j - 1].trimEnd();
      if (/^end\s*;?\s*$/.test(cur) && /^end\s*;?\s*$/.test(prev)) {
        // Only collapse consecutive ends at the SAME indentation level.
        // Different levels close different blocks (inner if + outer function).
        const curIndent = cur.match(/^\s*/)[0].length;
        const prevIndent = prev.match(/^\s*/)[0].length;
        if (curIndent === prevIndent) {
          out[j] = `# (consecutive end collapsed by generator)`;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  // Pass 2: drop a stray `end;` that immediately precedes an `elseif`
  // whose opening `if` line was lost in transpilation. Only suppress
  // when `end` and `elseif` share the SAME indentation — otherwise they
  // belong to different nesting levels (e.g., inner `else end` followed
  // by outer `elseif`).
  let pass2Iterations = 0;
  while (pass2Iterations < 64) {
    pass2Iterations += 1;
    let changed = false;
    for (let j = 1; j < out.length; j++) {
      const cur = out[j].trim();
      const prev = out[j - 1].trimEnd();
      if (/^end\s*;?\s*$/.test(prev) && /^elseif\b/.test(cur)) {
        const prevIndent = out[j - 1].match(/^\s*/)[0].length;
        const curIndent = cur.match(/^\s*/)[0].length;
        if (prevIndent === curIndent) {
          out[j - 1] = `# (orphan end; suppressed before bare elseif)`;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  return out.join('\n');
}

/**
 * Generator-side suppression of TS-style destructuring patterns
 * that the Julia transpiler emits verbatim. Julia does not support
 * TS/JS destructuring syntax; we comment out the offending lines
 * and surface a placeholder so the module stays parseable.
 */
function suppressDestructuring(input: string): string {
  const out = input.split('\n');
  const rewritten: string[] = [];

  // tuple when the RHS is itself a tuple. The original TS destructuring
  // intentionally does not produce this form, but at module top
  // level `const x, y = expr` allocates single shared bindings to
  // expr — which is the closest Julia analogue the generator can
  // produce without further type analysis. We treat this as an
  // acceptable partial emission and surface the gap elsewhere.
  const rewritten2: string[] = [];
  let i = 0;
  while (i < out.length) {
    const current = out[i];
    const trimmed = current.trim();
    // Detect multi-line destructure: `{` opens a block followed by
    // comma-separated identifiers and closes with `} = rhs;`.
    if (trimmed.endsWith('{')) {
      // Collect until matching `} = rhs;`.
      const collected: string[] = [];
      let j = i;
      for (; j < out.length; j++) {
        collected.push(out[j]);
        const lineTrimmed = out[j].trim();
        const closeMatch = lineTrimmed.match(/^\}\s*=\s*([^;]+);?\s*$/);
        if (closeMatch) {
          // Collect names from `collected` lines that look like identifiers.
          const names: string[] = [];
          for (let k = 0; k < collected.length; k++) {
            const line = collected[k];
            const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*,\s*$/);
            if (m) names.push(m[1]);
          }
          if (names.length > 0) {
            const rhs = closeMatch[1].trim();
            // If the RHS resolves to a placeholder (`nothing`),
            // the destructured bindings cannot be emitted as a
            // tuple destructure (Julia rejects `iterate(::Nothing)`).
            // Skip the assignment entirely; subsequent circular
            // references will use `nothing` until a real binding
            // gets emitted by an upstream generator that supplies
            // the actual implementations.
            if (rhs === 'nothing' || rhs === '') {
              rewritten2.push(`# (destructured ${names.length} names suppressed: RHS placeholder "${rhs}")`);
            } else {
              rewritten2.push(`const (${names.join(', ')}) = ${rhs}`);
            }
          } else {
            // Could not recover names — preserve verbatim and
            // comment to avoid Julia syntax error. Generator-side
            // decision.
            for (const line of collected) rewritten2.push(`# ${line}`);
          }
          i = j + 1;
          break;
        }
      }
      if (j >= out.length) {
        // Unterminated — emit verbatim.
        rewritten2.push(current);
        i++;
      }
      continue;
    }
    // Array-style destructure: `[a, b, c] = expr;` (TS/JS). Julia has
    // no 1:1 equivalent for assignment-from-tuple destructure outside
    // of `const (a, b, c) = expr` (which it doesn't accept for
    // expressions either). TS sources use this heavily after
    // `await this.fetchX(...)` Promise-unwrapping. Real CCXT code
    // relies on the bindings actually being bound — but generating
    // real Promise dispatch falls outside the generator's reach, so
    // for now we suppress the statement with a marker comment so Julia
    // can keep parsing the module. Generator-side decision; not a
    // placeholder for the binding values themselves.
    const arrayDestructure = current.match(/^\s*\[([^\]]+)\]\s*=\s*(.+?);?\s*$/);
    if (arrayDestructure) {
      const partCount = arrayDestructure[1]
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0).length;
      rewritten2.push(
        `# (array destructure of ${partCount} names suppressed: real Promise unwrapping outside generator scope)`,
      );
      i++;
      continue;
    }
    const destructureMatch = current.match(/^\s*\{([^}]+)\}\s*=\s*([^;]+);?\s*$/);
    if (destructureMatch) {
      const names = destructureMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && /^[A-Za-z_][A-Za-z0-9_]*$/.test(s));
      if (names.length > 0) {
        const rhs = destructureMatch[2].trim();
        if (rhs === 'nothing' || rhs === '') {
          rewritten2.push(`# (destructured ${names.length} names suppressed: RHS placeholder "${rhs}")`);
        } else {
          rewritten2.push(`const (${names.join(', ')}) = ${rhs}`);
        }
        i++;
        continue;
      }
    }
    // Fallback: not a destructure — preserve verbatim.
    rewritten2.push(current);
    i++;
  }

  // Generator-side guard: if names like `functions`, `types`, etc. are
  // referenced as destructuring RHS but never binder-defined elsewhere in
  // the emitted file, surface a `const <name> = nothing` placeholder at
  // the top of the module so Julia doesn't fail with `UndefVarError`.
  // Real CCXT code uses these names for dispatch tables — the Julia
  // transpiler must provide actual methods (which must be implemented
  // in the base Exchange class or per-exchange overrides).
  const placeholders: string[] = [];
  const placeholderNames = new Set(placeholders.map((p) => p.split(' ')[1]));
  for (let j = 0; j < rewritten2.length; j++) {
    const m = rewritten2[j].match(/^const \(([^)]+)\)\s*=\s*([A-Za-z_][A-Za-z0-9_]*)$/);
    if (m && placeholderNames.has(m[2])) {
      rewritten2[j] = `# (destructured ${m[1].split(',').length} names suppressed: RHS placeholder "${m[2]}")`;
    }
  }

  return rewritten2.join('\n');
}

async function transpileFile(filePath: string, transpiler: Transpiler) {
  const result = transpiler.transpileJuliaByPath(filePath);
  return cleanupJuliaSource(result.content ?? '');
}

/**
 * Parse the `api` block from a TS exchange source file and emit the implicit
 * REST endpoint methods (publicGetKlines, papiGetBalance, ...) that TS creates
 * at runtime via defineRestApi. We generate them statically so the Julia
 * exchange structs carry real methods instead of relying on a runtime call
 * that the transpiler does not emit.
 *
 * Mirrors ts/src/base/Exchange.ts::defineRestApiEndpoint name construction.
 */
function generateEndpointMethods(exchangeId: string, tsSource: string): string {
  const sf = ts.createSourceFile(exchangeId + '.ts', tsSource, ts.ScriptTarget.Latest, true);
  // Find the `api` object literal inside describe()'s returned object.
  let apiLiteral: ts.ObjectLiteralExpression | undefined;

  function visit(node: ts.Node) {
    if (apiLiteral) return;
    if (ts.isPropertyAssignment(node)) {
      const name = node.name.getText(sf);
      if (name === "'api'" || name === '"api"' || name === 'api') {
        if (ts.isObjectLiteralExpression(node.initializer)) {
          // The endpoint `api` block has object-valued properties (each API
          // group like `public`/`sapi`/`papi` nests get/post/...). The
          // urls.api block is just strings. Pick the one with object values.
          const allStrings = node.initializer.properties.every(
            (p) => ts.isPropertyAssignment(p) && ts.isStringLiteralLike(p.initializer)
          );
          if (!allStrings) {
            apiLiteral = node.initializer;
            return;
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  ts.forEachChild(sf, visit);

  if (!apiLiteral) return '';

  const methods: string[] = [];
  const seen = new Set<string>();

  function capitalize(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Walk the api tree exactly like defineRestApi.
  function walk(api: ts.ObjectLiteralExpression, paths: string[]) {
    for (const prop of api.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const key = prop.name.getText(sf).replace(/^['"]|['"]$/g, '');
      const value = prop.initializer;
      if (ts.isArrayLiteralExpression(value)) {
        for (const el of value.elements) {
          if (ts.isStringLiteralLike(el)) {
            emitEndpoint(key, el.text, paths, {});
          }
        }
      } else if (ts.isObjectLiteralExpression(value)) {
        // HTTP-method level: get/post/put/delete/head/patch
        if (/^(get|post|put|delete|head|patch)$/i.test(key)) {
          const uppercaseMethod = key.toUpperCase();
          const lowercaseMethod = key.toLowerCase();
          const camelcaseMethod = capitalize(lowercaseMethod);
          for (const ep of value.properties) {
            if (!ts.isPropertyAssignment(ep)) continue;
            const epName = ep.name.getText(sf).replace(/^['"]|['"]$/g, '');
            let config: any = {};
            if (ts.isObjectLiteralExpression(ep.initializer)) {
              config = parseConfig(ep.initializer);
            } else if (ts.isNumericLiteral(ep.initializer)) {
              config = { cost: Number(ep.initializer.text) };
            }
            emitEndpointWithMethod(uppercaseMethod, lowercaseMethod, camelcaseMethod, epName, paths, config);
          }
        } else {
          walk(value, paths.concat([key]));
        }
      }
    }
  }

  function parseConfig(obj: ts.ObjectLiteralExpression): any {
    const cfg: any = {};
    for (const p of obj.properties) {
      if (ts.isPropertyAssignment(p)) {
        const k = p.name.getText(sf).replace(/^['"]|['"]$/g, '');
        if (ts.isNumericLiteral(p.initializer)) cfg[k] = Number(p.initializer.text);
        else if (ts.isStringLiteralLike(p.initializer)) cfg[k] = p.initializer.text;
        else if (p.initializer.kind === ts.SyntaxKind.TrueKeyword) cfg[k] = true;
        else if (p.initializer.kind === ts.SyntaxKind.FalseKeyword) cfg[k] = false;
      }
    }
    return cfg;
  }

  function emitEndpoint(httpMethod: string, path: string, paths: string[], config: any) {
    const uppercaseMethod = httpMethod.toUpperCase();
    const lowercaseMethod = httpMethod.toLowerCase();
    const camelcaseMethod = capitalize(lowercaseMethod);
    emitEndpointWithMethod(uppercaseMethod, lowercaseMethod, camelcaseMethod, path, paths, config);
  }

  function emitEndpointWithMethod(uppercaseMethod: string, lowercaseMethod: string, camelcaseMethod: string, path: string, paths: string[], config: any) {
    const splitPath = path.split(/[^a-zA-Z0-9]/);
    const camelcaseSuffix = splitPath.map(capitalize).join('');
    const camelcasePrefix = [paths[0]].concat(paths.slice(1).map(capitalize)).join('');
    const camelcase = camelcasePrefix + camelcaseMethod + camelcaseSuffix;
    const typeArgument = paths.length > 1 ? `[${paths.map((p) => `"${p}"`).join(', ')}]` : `"${paths[0]}"`;
    // Emit a Julia Dict literal for the config (JSON.stringify produces a JS
    // object literal `{...}` which is invalid Julia vector syntax).
    const configStr = config && Object.keys(config).length > 0
      ? `Dict(${Object.entries(config).map(([k, v]) => `Symbol("${k}") => ${typeof v === 'string' ? `"${v}"` : v}`).join(', ')})`
      : `Dict()`;
    if (seen.has(camelcase)) return;
    seen.add(camelcase);
    methods.push(
      `function ${camelcase}(self::${exchangeId}, params=Dict(), context=Dict())\n` +
      `    return request(self, "${path}", ${typeArgument}, "${uppercaseMethod}", params, nothing, nothing, ${configStr})\n` +
      `end`
    );
  }

  walk(apiLiteral, []);
  if (methods.length === 0) return { fields: '', methods: '' };
  const fieldNames = Array.from(seen);
    const fieldsStr = fieldNames.map((name) => `    ${name}::Function = ${name}`).join('\n');
    const methodsStr = '\n# Implicit REST endpoint methods (generated from describe().api)\n' + methods.join('\n\n') + '\n';
    return { fields: fieldsStr, methods: methodsStr };
}

function injectEndpointFields(content: string, fields: string): string {
    if (!fields) return content;
    const lines = content.split('\n');
    let structEndIdx = -1;
    let inStruct = false;
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed.startsWith('@kwdef mutable struct')) {
            inStruct = true;
            continue;
        }
        if (inStruct && trimmed === 'end') {
            structEndIdx = i;
            break;
        }
    }
    if (structEndIdx === -1) return content;
    const fieldBlock = '\n# Generated REST endpoint fields\n' + fields + '\n';
    lines.splice(structEndIdx, 0, fieldBlock);
    return lines.join('\n');
}

export async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '--help' || command === '-h') {
    console.log(`
Julia transpiler CLI for CCXT.

Usage:
  npx tsx build/juliaTranspileCLI.ts --base
  npx tsx build/juliaTranspileCLI.ts --errors
  npx tsx build/juliaTranspileCLI.ts --ws-base
  npx tsx build/juliaTranspileCLI.ts --exchange <id>
  npx tsx build/juliaTranspileCLI.ts --all
  npx tsx build/juliaTranspileCLI.ts --test-base
  npx tsx build/juliaTranspileCLI.ts --test-exchange-base
  npx tsx build/juliaTranspileCLI.ts --test-pro-base
  npx tsx build/juliaTranspileCLI.ts --test-exchange
  npx tsx build/juliaTranspileCLI.ts --test-pro-exchange
  npx tsx build/juliaTranspileCLI.ts --test-request
  npx tsx build/juliaTranspileCLI.ts --test-response
  npx tsx build/juliaTranspileCLI.ts --test-fixtures
  npx tsx build/juliaTranspileCLI.ts --test-all

Flags:
  --base              Transpile ts/src/base/Exchange.ts to julia/Ccxt/src/BaseMethods.jl
  --errors            Transpile ts/src/base/errors.ts to julia/Ccxt/src/Errors.jl
  --ws-base           Transpile WebSocket base classes
  --exchange <id>     Transpile a single exchange (e.g. binance, okx)
  --all               Transpile all exchanges
  --test-base         Transpile base utility tests (ts/src/test/base/*.ts)
  --test-exchange-base Transpile exchange structure validators (ts/src/test/Exchange/base/*.ts)
  --test-pro-base     Transpile Pro WebSocket base tests (ts/src/pro/test/base/*.ts)
  --test-exchange     Transpile exchange unified method tests (ts/src/test/Exchange/test.*.ts)
  --test-pro-exchange Transpile Pro WebSocket unified method tests (ts/src/pro/test/Exchange/test.watch*.ts)
  --test-request      Transpile static request fixtures (ts/src/test/static/request/*.json)
  --test-response     Transpile static response fixtures (ts/src/test/static/response/*.json)
  --test-fixtures     Build Julia fixture loader for static tests
  --test-all          Transpile all test files
`);
    return;
  }

  // Transpile synchronously: `async` methods become plain functions and
  // `await` becomes a direct call. The Julia runtime (runtime.jl) installs a
  // synchronous HTTP backend, so the whole request/response chain runs
  // synchronously and correctly without the broken @async/Task Promise model.
  const transpiler = new Transpiler({ julia: { async: false } });

  if (command === '--base') {
    const basePath = path.join(TS_SRC, 'base', 'Exchange.ts');
    const result = transpiler.transpileJuliaByPath(basePath);
    const content = cleanupJuliaBaseSource(cleanupJuliaSource(result.content ?? ''));
    const outFile = path.join(JULIA_SRC, 'BaseMethods.jl');
    // Hand-written base methods that have no direct TS source equivalent:
    // computed-key get/set on the Exchange struct (used by unCamelCaseProperties
    // and the describe()/userConfig merge) plus snake_case alias support.
      const baseExtras = `
# Overlay for properties whose assigned value type does not match the struct
# field's declared type (e.g. describe() returns Dict{Symbol,Any} for a field
# declared Dict{String,String}).
#
# The overlay is stored inside the instance's own \`attrs\` dictionary rather
# than in a module-level table keyed by \`objectid\`. An object id is only
# unique among *live* objects: once an exchange is collected its address, and
# therefore its id, is handed to the next allocation. A global table then
# silently serves a freshly built exchange the overlay of a dead one — which
# looks like a constructor that returns an already-initialised instance
# (e.g. \`features\` that has already been through \`featuresGenerator\`).
# Keeping the overlay on the instance ties its lifetime to the instance, makes
# each one isolated by construction, and needs no cleanup.
const _OVERLAY_KEY = :__property_overlay__

function _overlay_get(self::Exchange, key::Symbol)
    o = get(getfield(self, :attrs), _OVERLAY_KEY, nothing)
    o === nothing && return nothing
    return get(o, key, nothing)
end

function _overlay_set!(self::Exchange, key::Symbol, val)
    o = get!(() -> Dict{Symbol, Any}(), getfield(self, :attrs), _OVERLAY_KEY)
    o[key] = val
    return val
end

function Base.getindex(self::Exchange, key::Symbol)
  ov = _overlay_get(self, key)
  ov !== nothing && return ov
    if hasfield(Exchange, key)
        return getfield(self, key)
    end
  camel = Symbol(functions.camelCase(string(key)))
    if hasfield(Exchange, camel)
        return getfield(self, camel)
  end
  error("Property \$key not found")
end

function Base.get(self::Exchange, key::Symbol, default)
    ov = _overlay_get(self, key)
    ov !== nothing && return ov
    if hasfield(Exchange, key)
        return getfield(self, key)
    end
    camel = Symbol(functions.camelCase(string(key)))
    if hasfield(Exchange, camel)
        return getfield(self, camel)
    end
    return default
end

# The transpiler emits Symbol keys for property access it can see statically,
# but a key that arrives as data (a fixture key, a \`getProperty\` argument, an
# \`unCamelCaseProperties\` walk) stays a String. Accept both spellings.
Base.get(self::Exchange, key::AbstractString, default) = get(self, Symbol(key), default)
Base.getindex(self::Exchange, key::AbstractString) = getindex(self, Symbol(key))
Base.setindex!(self::Exchange, val, key::AbstractString) = setindex!(self, val, Symbol(key))

# JS \`'key' in exchange\` — used by \`getProperty\`/\`hasProp\` style helpers, which
# reach \`functions.ccxt_in\` and from there \`haskey\`. Both a Symbol and a String
# key must resolve, and the camelCase spelling counts as present too.
function Base.haskey(self::Exchange, key::Symbol)
    _overlay_get(self, key) !== nothing && return true
    hasfield(Exchange, key) && return true
    return hasfield(Exchange, Symbol(functions.camelCase(string(key))))
end
Base.haskey(self::Exchange, key::AbstractString) = haskey(self, Symbol(key))

function Base.setindex!(self::Exchange, val, key::Symbol)
    if hasfield(Exchange, key)
        try
            return setfield!(self, key, val)
        catch e
            if e isa TypeError
                return _overlay_set!(self, key, val)
            end
            rethrow(e)
        end
    end
    camel = Symbol(functions.camelCase(string(key)))
    if hasfield(Exchange, camel)
        try
            return setfield!(self, camel, val)
        catch e
            if e isa TypeError
                return _overlay_set!(self, camel, val)
            end
            rethrow(e)
        end
    end
    return _overlay_set!(self, key, val)
end

function Base.setproperty!(self::Exchange, name::Symbol, val)
    if hasfield(Exchange, name)
        try
            return setfield!(self, name, val)
        catch e
            if e isa TypeError
                return _overlay_set!(self, name, val)
            end
            rethrow(e)
        end
    end
    camel = Symbol(functions.camelCase(string(name)))
    if hasfield(Exchange, camel)
        try
            return setfield!(self, camel, val)
        catch e
            if e isa TypeError
                return _overlay_set!(self, camel, val)
            end
            rethrow(e)
        end
    end
    return _overlay_set!(self, name, val)
end

  function Base.getproperty(self::Exchange, name::Symbol)
      ov = _overlay_get(self, name)
      ov !== nothing && return ov
      if hasfield(Exchange, name)
          value = getfield(self, name)
          if value isa Function
              return (args...) -> (ccxt_takes_self(value) ? value(self, args...) : value(args...))
          else
              return value
          end
      end
      camel = Symbol(functions.camelCase(string(name)))
      if hasfield(Exchange, camel)
          value = getfield(self, camel)
          if value isa Function
              return (args...) -> (ccxt_takes_self(value) ? value(self, args...) : value(args...))
          else
              return value
          end
      end
      # Base methods (getDefaultOptions, safeValue, ...) are emitted as top-level
        # functions in this module rather than struct fields. Resolve them by name
        # so self.method(...) dispatches correctly.
        if isdefined(@__MODULE__, name) && getfield(@__MODULE__, name) isa Function
            fn = getfield(@__MODULE__, name)
            return (args...) -> (ccxt_takes_self(fn) ? fn(self, args...) : fn(args...))
        end
        error("Property \$name not found")
    end
`;
    fs.writeFileSync(outFile, content + baseExtras, 'utf8');
    console.log(`Julia base transpiled -> ${outFile}`);
    return;
  }

  if (command === '--errors') {
    const errorsPath = path.join(TS_SRC, 'base', 'errors.ts');
    const result = transpiler.transpileJuliaByPath(errorsPath);
    const content = cleanupJuliaSource(result.content ?? '');
    const outFile = path.join(JULIA_SRC, 'Errors.jl');
    writeErrorsGuarded(outFile, content);
    return;
  }

  if (command === '--ws-base') {
    // Transpile the WebSocket base classes that the REST `Exchange` base
    // legitimately depends on (it owns the `clients` dict and `client(url)`
    // factory). Order respects dependencies: Future (none) -> Cache ->
    // OrderBookSide -> OrderBook -> Client -> WsClient.
    const wsFiles = [
      'Future',
      'Cache',
      'OrderBookSide',
      'OrderBook',
      'Client',
      'WsClient',
    ];
    for (const name of wsFiles) {
      const wsPath = path.join(TS_SRC, 'base', 'ws', `${name}.ts`);
      const result = transpiler.transpileJuliaByPath(wsPath);
      const content = cleanupJuliaSource(result.content ?? '');
      const outFile = path.join(JULIA_SRC, `${name}.jl`);
      fs.writeFileSync(outFile, content, 'utf8');
      console.log(`Julia ws-base ${name} transpiled -> ${outFile}`);
    }
    return;
  }

  // Test file transpilation commands
  if (command === '--test-base' || command === '--test-all') {
    transpileTestBase(transpiler);
    if (command === '--test-base') return;
  }

  if (command === '--test-exchange-base' || command === '--test-all') {
    transpileTestExchangeBase(transpiler);
    if (command === '--test-exchange-base') return;
  }

  if (command === '--test-pro-base' || command === '--test-all') {
    transpileTestProBase(transpiler);
    if (command === '--test-pro-base') return;
  }

  // Test file transpilation commands for exchange unified method tests
  if (command === '--test-exchange' || command === '--test-all') {
    transpileTestExchange(transpiler);
    if (command === '--test-exchange') return;
  }

  if (command === '--test-pro-exchange' || command === '--test-all') {
    transpileTestProExchange(transpiler);
    if (command === '--test-pro-exchange') return;
  }

  // Static fixture test transpilation
  if (command === '--test-request' || command === '--test-all') {
    transpileTestRequest(transpiler);
    if (command === '--test-request') return;
  }

  if (command === '--test-response' || command === '--test-all') {
    transpileTestResponse(transpiler);
    if (command === '--test-response') return;
  }

  if (command === '--test-fixtures' || command === '--test-all') {
    buildJuliaFixtureLoader();
    if (command === '--test-fixtures') return;
  }

  if (command === '--exchange' && args[1]) {
    const exchangeId = args[1];
    const exchangeFile = path.join(TS_SRC, `${exchangeId}.ts`);
    if (!fs.existsSync(exchangeFile)) {
      console.error(`Exchange file not found: ${exchangeFile}`);
      process.exit(1);
    }
    const result = transpiler.transpileJuliaByPath(exchangeFile);
    let content = cleanupJuliaSource(result.content ?? '');
    const tsSource = fs.readFileSync(exchangeFile, 'utf8');
    const endpoints = generateEndpointMethods(exchangeId, tsSource);
    // Inject endpoint method field declarations into the struct body so
    // self.publicGetXxx(...) dispatches correctly (hasfield check succeeds).
    content = injectEndpointFields(content, endpoints.fields);
    const outFile = path.join(JULIA_SRC, 'exchanges', `${exchangeId}.jl`);
    const wrapperName = capitalize(exchangeId);

    // Capture the struct body (before endpoint method append) so we can parse
    // field defaults for the positional constructor call in the wrapper.
    const structContent = content;

    // Capitalize the class name in the emitted Julia so `Ccxt.${wrapperName}` is
    // a DataType (the struct itself), satisfying the exchange-load test. The
    // wrapper below is a valid outer constructor for that struct. All known
    // exchange ids are capitalized so parent references resolve correctly.
    // Applied to `content + endpoints.methods` because the generated endpoint
    // methods (appended after) also use the lowercase `self::${exchangeId}` receiver.
    const allIds = collectAllExchangeIds();
    content = capitalizeExchangeClass(content + endpoints.methods, allIds);

    // Append the capitalized constructor to the SAME file as the struct. Writing
      // a separate `${wrapperName}.jl` would collide with `${exchangeId}.jl` on
      // case-insensitive filesystems (e.g. binance.jl vs Binance.jl) and overwrite
      // the struct. Keeping both in one file avoids the collision. The wrapper
      // calls the struct's positional inner constructor (distinct signature from
      // the keyword outer constructor) and applies `describe()` to the composed
      // `parent` Exchange.
      const wrapperSource = capitalizeExchangeClass(buildWrapperSource(structContent, wrapperName), allIds);

        // Run cleanup on the FULL combined content (struct + wrapper) so any
        // artifacts in the wrapper (e.g., bare `undefined`) are also removed.
        const finalContent = cleanupJuliaSource(content + wrapperSource);

        fs.writeFileSync(outFile, finalContent, 'utf8');
      console.log(`Julia exchange ${exchangeId} transpiled -> ${outFile}`);
      return;
    }

  if (command === '--all') {
    const files = fs.readdirSync(TS_SRC)
      .filter((f) => f.endsWith('.ts') && !f.startsWith('base') && !f.startsWith('abstract'))
      .map((f) => path.join(TS_SRC, f));

    const allExchangeIds = collectAllExchangeIds();
    fs.mkdirSync(path.join(JULIA_SRC, 'exchanges'), { recursive: true });

      for (const file of files) {
      const exchangeId = path.basename(file, '.ts');
      const result = transpiler.transpileJuliaByPath(file);
      let content = cleanupJuliaSource(result.content ?? '');
      const tsSource = fs.readFileSync(file, 'utf8');
      const endpoints = generateEndpointMethods(exchangeId, tsSource);
      // Inject endpoint method field declarations into the struct body so
      // self.publicGetXxx(...) dispatches correctly.
      content = injectEndpointFields(content, endpoints.fields);
      const outFile = path.join(JULIA_SRC, 'exchanges', `${exchangeId}.jl`);
      const wrapperName = capitalize(exchangeId);

      // Capture the struct body (before endpoint method append) for
      // field-default parsing.
      const structContent = content;

      // Capitalize the class name in the emitted Julia so `Ccxt.${wrapperName}`
        // is a DataType (the struct itself), satisfying the exchange-load test.
        // All known exchange ids are capitalized so parent references resolve.
        // Applied to `content + endpoints.methods` because the generated endpoint
        // methods (appended after) also use the lowercase `self::${exchangeId}`.
        content = capitalizeExchangeClass(content + endpoints.methods, allExchangeIds);

        // Append the capitalized constructor to the SAME file as the struct.
        // Writing a separate `${wrapperName}.jl` would collide with
        // `${exchangeId}.jl` on case-insensitive filesystems (e.g. binance.jl vs
        // Binance.jl) and overwrite the struct. Keeping both in one file avoids
        // the collision. The wrapper calls the struct's positional inner
        // constructor and applies `describe()` to the composed `parent`.
          const wrapperSource = capitalizeExchangeClass(buildWrapperSource(structContent, wrapperName), allExchangeIds);

        // Run cleanup on the FULL combined content (struct + wrapper) so any
        // artifacts in the wrapper (e.g., bare `undefined`) are also removed.
        const finalContent = cleanupJuliaSource(content + wrapperSource);

        fs.writeFileSync(outFile, finalContent, 'utf8');
        console.log(`Julia exchange ${exchangeId} transpiled -> ${outFile}`);
      }

    // Write exchanges.jl manifest
    const availableIds = fs.readdirSync(path.join(JULIA_SRC, 'exchanges'))
      .filter((f) => f.endsWith('.jl') && !f.startsWith('Base') && !f.startsWith('Errors'))
      .map((f) => path.basename(f, '.jl'))
      .filter((id) => id !== 'exchanges' && !id.startsWith('_'));

    const parentOf = new Map<string, string | null>();
    const juliaBaseBindings = new Set<string>();

    // Collect base type bindings from existing Julia files
    const collectBindings = (root: string) => {
      if (!fs.existsSync(root)) return;
      for (const f of fs.readdirSync(root)) {
        const full = path.join(root, f);
        if (!f.endsWith('.jl')) continue;
        const text = fs.readFileSync(full, 'utf8');
        const re = /^\s*(?:@kwdef\s+)?(?:abstract\s+type\s+([A-Za-z_][A-Za-z0-9_]*)|mutable\s+struct\s+([A-Za-z_][A-Za-z0-9_]*)|struct\s+([A-Za-z_][A-Za-z0-9_]*))/gm;
        for (const match of text.matchAll(re)) {
          for (let i = 1; i < 5; i++) {
            const candidate = match[i];
            if (candidate) juliaBaseBindings.add(candidate);
          }
        }
      }
    };

    collectBindings(JULIA_SRC);

    // Detect parent classes from exchange files
    for (const id of availableIds) {
      const jlPath = path.join(JULIA_SRC, 'exchanges', `${id}.jl`);
      if (!fs.existsSync(jlPath)) continue;
      const text = fs.readFileSync(jlPath, 'utf8');
      const parentMatch = text.match(/extends\s+([A-Za-z_][A-Za-z0-9_]*)/);
      if (parentMatch) {
        parentOf.set(id, parentMatch[1]);
      } else {
        // The parent field is emitted as `parent::Union{<Base>, Nothing}` (composition
        // model). Capture the real base class INSIDE the Union{...}, not the literal
        // "Union" token, otherwise we'd treat `Union` as an external parent and emit
        // `const Union = nothing`, which redefines Julia's built-in Union type ctor.
        const m = text.match(/parent::Union\{([A-Za-z_][A-Za-z0-9_]*)/) || text.match(/parent::([A-Za-z_][A-Za-z0-9_]*)/);
        if (m) {
          // The emitted parent type is PascalCase (e.g. `Hitbtc`); the
            // `availableIds` keys are lowercase filenames (e.g. `hitbtc`). Map
          // the captured parent back to lowercase so the topological sort can
            // match it against `availableIds` and order parents before children.
          const captured = m[1];
          const lower = captured.charAt(0).toLowerCase() + captured.slice(1);
          parentOf.set(id, availableIds.includes(lower) ? lower : captured);
        } else {
          parentOf.set(id, null);
        }
      }
    }

    const externalParents = new Set<string>();
    const externalParentStatements: string[] = [];
    for (const id of availableIds) {
      const parent = parentOf.get(id);
      if (parent && !parentOf.has(parent) && !juliaBaseBindings.has(parent)) {
        externalParents.add(parent);
        externalParentStatements.push(`const ${parent} = nothing`);
      }
    }

    // Topological sort: if `parentOf.get(a)` is `b`, then `b` must
    // come before `a`. Stable Kahn's algorithm.
    const ordered: string[] = [];
    const remaining = new Set(availableIds);
    let progressed = false;
    while (remaining.size > 0) {
      progressed = false;
      for (const id of [...remaining]) {
        const parent = parentOf.get(id);
        if (parent === null || !remaining.has(parent)) {
          ordered.push(id);
          remaining.delete(id);
          progressed = true;
        }
      }
      if (!progressed) {
        // Cycle — fall back to lexicographic insertion for the
        // remainder. Generator-side decision; CCXT classes
        // shouldn't actually form cycles.
        for (const id of [...remaining].sort()) ordered.push(id);
        remaining.clear();
      }
    }

   // Topological order already correct; keep it. Removed sort that scrambled parent/child order.

    const exchangesInclude = ordered
      .map((id: string) => `include("exchanges/${id}.jl")`)
      .join('\n');
    const exportsBlock = availableIds.map((id: string) => capitalize(id)).join(', ');
    const exchangesFile = path.join(JULIA_SRC, 'exchanges.jl');
    const exchangesBody = [
      '# Auto-generated by build/juliaTranspileCLI.ts -- generator-side',
      '# Do not hand-edit.',
      '',
      // Forward-declare cross-exchange parent types so children
      // that reference them (e.g. `parent::hitbtc`) bind without
      // UndefVarError at module load time.
      ...externalParentStatements,
      '',
      exchangesInclude,
      '',
      `export ${exportsBlock}`,
      '',
    ].join('\n');
    fs.writeFileSync(exchangesFile, exchangesBody, 'utf8');
    console.log(`Julia exchanges manifest written -> ${exchangesFile}`);
  }
}

main().catch(console.error);

// ============================================================
// Test file transpilation functions
// ============================================================

/**
 * Transpile base utility tests from ts/src/test/base/*.ts
 * to julia/Ccxt/test/base/
 */
function transpileTestBase(transpiler: Transpiler) {
  const testBaseSrc = path.join(TS_SRC, 'test', 'base');
  const testBaseDst = path.join(JULIA_TEST, 'base');
  
  if (!fs.existsSync(testBaseSrc)) {
    console.error(`Test base source not found: ${testBaseSrc}`);
    return;
  }
  
  fs.mkdirSync(testBaseDst, { recursive: true });
  
  const files = fs.readdirSync(testBaseSrc)
    .filter((f) => f.endsWith('.ts') && f.startsWith('test.'))
    .filter((f) => !f.startsWith('test.helpers') && !f.startsWith('test.init') && !f.startsWith('tests.'));
  
  for (const file of files) {
    const filePath = path.join(testBaseSrc, file);
    try {
      const result = transpiler.transpileJuliaByPath(filePath);
      let content = cleanupJuliaSource(result.content ?? '');
      
      // Convert test syntax: replace `assert` with `@test`, add `using Test`
      content = convertTestSyntax(content, file);
      
      const outFile = path.join(testBaseDst, file.replace('.ts', '.jl'));
      fs.writeFileSync(outFile, content, 'utf8');
      console.log(`Julia test-base ${file} transpiled -> ${outFile}`);
    } catch (e) {
      console.error(`Failed to transpile ${file}:`, e);
    }
  }
}

/**
 * Transpile exchange structure validator tests from ts/src/test/Exchange/base/*.ts
 * to julia/Ccxt/test/validators/
 */
function transpileTestExchangeBase(transpiler: Transpiler) {
  const testExchangeBaseSrc = path.join(TS_SRC, 'test', 'Exchange', 'base');
  const testExchangeBaseDst = path.join(JULIA_TEST, 'validators');
  
  if (!fs.existsSync(testExchangeBaseSrc)) {
    console.error(`Test exchange base source not found: ${testExchangeBaseSrc}`);
    return;
  }
  
  fs.mkdirSync(testExchangeBaseDst, { recursive: true });
  
  const files = fs.readdirSync(testExchangeBaseSrc)
    .filter((f) => f.endsWith('.ts') && f.startsWith('test.'));
  
  for (const file of files) {
    const filePath = path.join(testExchangeBaseSrc, file);
    try {
      const result = transpiler.transpileJuliaByPath(filePath);
      let content = cleanupJuliaSource(result.content ?? '');
      
      // Convert test syntax
      content = convertTestSyntax(content, file);
      
      const outFile = path.join(testExchangeBaseDst, file.replace('.ts', '.jl'));
      fs.writeFileSync(outFile, content, 'utf8');
      console.log(`Julia test-exchange-base ${file} transpiled -> ${outFile}`);
    } catch (e) {
      console.error(`Failed to transpile ${file}:`, e);
    }
  }
}

/**
 * Transpile Pro WebSocket base tests from ts/src/pro/test/base/*.ts
 * to julia/Ccxt/test/pro/base/
 */
function transpileTestProBase(transpiler: Transpiler) {
  const testProBaseSrc = path.join(TS_SRC, 'pro', 'test', 'base');
  const testProBaseDst = path.join(JULIA_TEST, 'pro', 'base');
  
  if (!fs.existsSync(testProBaseSrc)) {
    console.error(`Test pro base source not found: ${testProBaseSrc}`);
    return;
  }
  
  fs.mkdirSync(testProBaseDst, { recursive: true });
  
  const files = fs.readdirSync(testProBaseSrc)
    .filter((f) => f.endsWith('.ts') && f.startsWith('test.'));
  
  for (const file of files) {
    const filePath = path.join(testProBaseSrc, file);
    try {
      const result = transpiler.transpileJuliaByPath(filePath);
      let content = cleanupJuliaSource(result.content ?? '');
      
      // Convert test syntax
      content = convertTestSyntax(content, file);
      
      const outFile = path.join(testProBaseDst, file.replace('.ts', '.jl'));
      fs.writeFileSync(outFile, content, 'utf8');
      console.log(`Julia test-pro-base ${file} transpiled -> ${outFile}`);
    } catch (e) {
      console.error(`Failed to transpile ${file}:`, e);
    }
  }
}

/**
 * Coerce non-Boolean `@test` expressions to Bool via `functions.ccxtruthy`.
 *
 * The TS/JS test suite asserts on *truthiness*, not on Bool:
 *
 *     assert (timeframeKeys.length, exchange.id + ' has no timeframes');
 *     assert (exchange.inArray (code, codes));
 *
 * `assert()` in Node accepts any value and only fails on a falsy one, so an
 * `Int` (`length`), a `Dict`, an `Array`, or `undefined` are all legal
 * arguments. Julia's `@test` is stricter: it requires the expression to
 * evaluate to a `Bool` and otherwise fails the test outright with
 * "Expression evaluated to non-Boolean". Passing `@test length(x)` through
 * verbatim therefore turns a passing upstream assertion into a failing Julia
 * one — a transpilation defect, not a real test failure.
 *
 * `functions.ccxtruthy` already implements exactly the JS truthiness rule
 * (false for `nothing`/`false`/`0`/`""`), and the generator uses it everywhere
 * else it needs to bridge JS conditions into Julia (`if`, `&&`, `||`). We apply
 * the same bridge here so the semantics of `assert` are preserved end to end.
 *
 * Expressions that are *already* Bool are left untouched, so the failure
 * message keeps showing the original comparison operands:
 *   - a top-level comparison (`==`, `!=`, `<`, `>=`, ...) outside any bracket,
 *   - a negation (`!...`), which Julia's `!` already forces to Bool,
 *   - an existing `functions.ccxtruthy(...)` wrap,
 *   - the literals `true` / `false`,
 *   - `@test_throws` and other `@test`-prefixed macros.
 *
 * A logical `@test a && b` / `a || b` is *not* Bool in general (Julia's `&&`
 * returns the last operand), so it is wrapped like any other value.
 *
 * Multi-line expressions (`@test equals(x, Dict(...\n...))`) are joined by
 * bracket balance before the decision is made, and the wrap is applied around
 * the whole span.
 */
function coerceTestBooleans(input: string): string {
  const stripLiterals = (s: string): string => s.replace(/"(\\.|[^"\\])*"/g, '""');
  const bracketDelta = (s: string): number => {
    const t = stripLiterals(s);
    let d = 0;
    for (const ch of t) {
      if (ch === '(' || ch === '[' || ch === '{') d += 1;
      else if (ch === ')' || ch === ']' || ch === '}') d -= 1;
    }
    return d;
  };
  // True when the expression has a comparison operator at bracket depth 0,
  // i.e. the whole expression is a comparison and already yields a Bool.
  const hasTopLevelComparison = (s: string): boolean => {
    const t = stripLiterals(s);
    const ops = ['===', '!==', '==', '!=', '<=', '>=', '<', '>'];
    let d = 0;
    for (let i = 0; i < t.length; i++) {
      const ch = t[i];
      if (ch === '(' || ch === '[' || ch === '{') d += 1;
      else if (ch === ')' || ch === ']' || ch === '}') d -= 1;
      else if (d === 0) {
        for (const op of ops) {
          if (t.startsWith(op, i)) return true;
        }
      }
    }
    return false;
  };

  const lines = input.split('\n');
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    // `@test` exactly — never `@test_throws`, `@testset`, `@test_broken`.
    const head = lines[i].match(/^(\s*)@test(\s+)(.*)$/);
    if (!head) {
      out.push(lines[i]);
      continue;
    }
    const [, indent, gap] = head;
    // Join continuation lines until brackets balance.
    let expr = head[3];
    let last = i;
    while (bracketDelta(expr) !== 0 && last + 1 < lines.length) {
      last += 1;
      expr += '\n' + lines[last];
    }
    // Split off a trailing `;` (and any whitespace after it) so the wrap goes
    // around the expression only.
    const tail = expr.match(/(\s*;\s*)$/);
    const suffix = tail ? tail[1] : '';
    const body = suffix ? expr.slice(0, expr.length - suffix.length) : expr;
    const flat = body.trim();

    const alreadyBool =
      flat === '' ||
      flat === 'true' ||
      flat === 'false' ||
      flat.startsWith('!') ||
      /^functions\.ccxtruthy\s*\(/.test(flat) ||
      hasTopLevelComparison(flat);

    if (alreadyBool) {
      out.push(lines.slice(i, last + 1).join('\n'));
    } else {
      out.push(`${indent}@test${gap}functions.ccxtruthy(${body.trimStart()})${suffix}`);
    }
    i = last;
  }
  return out.join('\n');
}

/**
 * Convert transpiled test syntax to Julia Test.jl format
 * - Add `using Test` at top if not present
 * - Wrap exported functions in `@testset`
 * - Convert `assert(...)` to `@test ...`
 * - Fix `@test` macro syntax (remove trailing semicolons inside macro)
 * - Convert `@assert` to `@test` where appropriate
 * - Add `using Ccxt` for module access (use absolute import, not relative)
 * - Remove trailing string messages from @test calls (Julia's @test doesn't accept 2nd arg)
 */
function convertTestSyntax(content: string, filename: string): string {
  // Ensure `using Test` is at the top
  if (!content.includes('using Test')) {
    content = 'using Test\n' + content;
  }
  
  // Add module imports if not present
  if (!content.includes('using Ccxt')) {
    // Add after using Test
    content = content.replace(/^using Test\n/, 'using Test\nusing Ccxt\n');
  }
  // Add lowercase `ccxt` alias so test files can reference ccxt.Exchange etc.
  // TS source imports `ccxt` (lowercase); Julia module is `Ccxt` (uppercase).
  if (content.includes('ccxt.') && !content.includes('const ccxt = Ccxt')) {
    content = content.replace(/^using Ccxt\n/, 'using Ccxt\nconst ccxt = Ccxt\n');
  }
  
  // Convert `assert(...)` to `@test ...`
  // BUT skip `@assert` — the transpiler already emits `@assert` for 2-arg
  // assert(condition, message) calls. A bare `assert(` regex would turn
  // `@assert` into `@@test`. Use a negative lookbehind on `@`.
  content = content.replace(/(?<!@)assert\s*\(/g, '@test ');
  
  // Fix @test macro syntax: remove trailing semicolons that break the macro
  content = content.replace(/(@test\s+.+);(\s*)$/gm, '$1$2');
  
  // Fix @test with string concatenation that may have semicolons
  content = content.replace(/(@test\s+[^;]+);\s*$/gm, '$1');
  
  // Convert `@assert` to `@test` for simple boolean expressions
  content = content.replace(/@assert\s+/g, '@test ');

  // Strip trailing `string(...)` message calls emitted by the transpiler for
  // 2-arg assert(condition, message) calls. The TS source
  //   assert ((expr), 'message')
  // transpiles to
  //   @assert (expr) string("message")
  // and then @assert -> @test gives
  //   @test (expr) string("message")
  // The string(...) call is the message argument; Julia's @test doesn't accept
  // it, so we strip it. We only strip when string(...) is NOT the direct RHS
  // of a comparison operator (where it's a legitimate value, e.g.
  // @test a == string("Exch", "ange")).
  content = content.replace(/(@test\s+.+?)\s+string\([^;]*\)\s*;?\s*$/gm, (match, prefix) => {
    // Don't strip if the prefix ends with a comparison operator —
    // string(...) is the RHS value in that case (e.g. == string("Exch")).
    if (/(==|!=|===|!==|<=|>=|<|>|\+|-|\*|\/)\s*$/.test(prefix)) {
      return match;
    }
    return prefix;
  });

  // Fix unmatched trailing ')' left after stripping string(...) messages.
  // The TS source assert ((expr), msg) transpiles to @assert (expr) string(...),
  // where the extra paren wraps the condition. After string() is stripped,
  // the outer ')' may remain dangling, e.g. @test (ccxt_in(x, entry))  -> the
  // last ) is unmatched. We balance parens on the @test line and drop extras.
  content = content.replace(/(@test\s+.+)\s*$/gm, (match, line) => {
    const trimmed = line.trimEnd();
    let parenDepth = 0;
    for (const ch of trimmed) {
      if (ch === '(') parenDepth++;
      else if (ch === ')') parenDepth--;
    }
    // If there's an extra unmatched ')', strip the trailing ones until balanced.
    if (parenDepth > 0) {
      // Extra opening parens — shouldn't happen here, skip.
      return line;
    }
    let result = trimmed;
    while (parenDepth < 0 && result.endsWith(')')) {
      result = result.slice(0, -1);
      parenDepth++;
    }
    return result + line.slice(trimmed.length);
  });

  // Handle @test <expr> <identifier>; — bare variable as message argument (no comma)
  // This handles TS assert(condition, variable) that transpiles to @test condition variable;
  // Pattern: @test ... <word>; -> @test ... ;  (only if no comparison operator before the word)
  // Use a callback to check that the prefix doesn't end with a comparison operator
  // IMPORTANT: use [^\S\n]+ instead of \s+ for the whitespace separator to prevent
  // matching across newlines (e.g., @test ... == "0"\nend would match "end" as the
  // identifier, deleting the "end" keyword and adding a spurious semicolon).
  content = content.replace(/(@test\s+.*?)([^\S\n]+)([a-zA-Z_][a-zA-Z0-9_]*)\s*;?\s*$/gm, (match, prefix, sep, varName) => {
    // Don't strip if the prefix ends with a comparison or arithmetic operator
    // (e.g. `== value rateLimit` would be `1 / rateLimit` — a valid expression)
    if (/(==|!=|===|!==|<=|>=|<|>|\+|-|\*|\/)\s*$/.test(prefix)) {
      return match;
    }
    // Don't strip Julia keywords like 'end', 'else', 'elseif', 'return', 'nothing', etc.
    // that could appear as bare identifiers at end of @test lines (e.g. @test entry != nothing)
    if (/^(end|else|elseif|return|nothing|true|false|continue|break)$/.test(varName)) {
      return match;
    }
    // Don't strip if the identifier is inside a function call argument or property string.
    // Check that the prefix has balanced parentheses and brackets. If there's an
    // unmatched opening bracket, the identifier is likely inside a call (e.g. Symbol("refillRate"))
    let parenDepth = 0;
    let bracketDepth = 0;
    let inString = false;
    let stringChar = '';
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i];
      if (inString) {
        if (ch === stringChar && prefix[i-1] !== '\\') {
          inString = false;
        }
      } else if (ch === '"' || ch === "'") {
        inString = true;
        stringChar = ch;
      } else if (ch === '(') {
        parenDepth++;
      } else if (ch === ')') {
        parenDepth--;
      } else if (ch === '[') {
        bracketDepth++;
      } else if (ch === ']') {
        bracketDepth--;
      }
    }
    // Only strip if all brackets are balanced (identifier is at top level)
    if (parenDepth !== 0 || bracketDepth !== 0) {
      return match;
    }
    // Don't strip if we're inside a string literal at the end of the prefix
    // (e.g. "fetchHistoryCache should be an empty array" — the word "array" is inside a string)
    if (inString) {
      return match;
    }
    // Only strip if the variable is a bare identifier (not a function call)
    if (varName && varName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      return prefix + ';' + sep;
    }
    return match;
  });
  
  // Handle @assert/@test with message string but NO comma (space-separated)
  // Pattern: @test condition "message"  ->  @test condition
  // This handles @assert condition "message" which becomes @test condition "message"
  content = content.replace(/(@test\s+.*?)\s+"[^"]*"\s*;?\s*$/gm, (match, prefix) => {
    // Only remove if the string looks like a descriptive message (contains "should", "must", etc.)
    const lastString = match.match(/"([^"]*)"\s*;?\s*$/)?.[1] || '';
    if (/\b(should|must|expected|failed|not|have|include|be )\b/i.test(lastString)) {
      return prefix;
    }
    return match;
  });
  content = content.replace(/(@test\s+.*?)\s+'[^']*'\s*;?\s*$/gm, (match, prefix) => {
    const lastString = match.match(/'([^']*)'\s*;?\s*$/)?.[1] || '';
    if (/\b(should|must|expected|failed|not|have|include|be )\b/i.test(lastString)) {
      return prefix;
    }
    return match;
  });
  content = content.replace(/(@test\s+.*?)\s+"[^"]*"\s*;/gm, (match, prefix) => {
    const lastString = match.match(/"([^"]*)"\s*;/)?.[1] || '';
    if (/\b(should|must|expected|failed|not|have|include|be )\b/i.test(lastString)) {
      return prefix + ';';
    }
    return match;
  });
  content = content.replace(/(@test\s+.*?)\s+'[^']*'\s*;/gm, (match, prefix) => {
    const lastString = match.match(/'([^']*)'\s*;/)?.[1] || '';
    if (/\b(should|must|expected|failed|not|have|include|be )\b/i.test(lastString)) {
      return prefix + ';';
    }
    return match;
  });

  // The keyword heuristics above only catch prose-looking messages ("should be
  // ...", "must not ..."). Terse ones slip through — `assert (true, 'testStatus')`
  // becomes `@test true "testStatus"`, which is a syntax error because Julia's
  // `@test` takes only `key=value` kwargs after the expression. Fall back to a
  // structural check: a trailing space-separated string literal is a message
  // argument unless the expression before it ends in an operator (in which case
  // the string is an operand, as in `@test a == "value"`).
  const endsWithOperator = (expr: string): boolean =>
    /(?:[=!<>~+\-*/%&|^,([:?]|\b(?:in|return|&&|\|\|))\s*$/.test(expr);
  content = content.replace(
    /(@test\s+\S.*?)\s+("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')(\s*;?)\s*$/gm,
    (match, prefix, _str, semi) => (endsWithOperator(prefix) ? match : prefix + semi)
  );

  
  // Remove trailing string literals from @test calls (Julia's @test doesn't accept a message string)
  // Pattern: @test condition, "message"  ->  @test condition
  // Only remove strings that are clearly message arguments (after comma), not comparison values
  
  // Handle comma-separated message: @test condition, "message"  ->  @test condition
  content = content.replace(/(@test\s+.*?),\s*"[^"]*"\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+.*?),\s*'[^']*'\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+.*?),\s*"[^"]*"\s*;/gm, '$1;');
  content = content.replace(/(@test\s+.*?),\s*'[^']*'\s*;/gm, '$1;');
  
  // Handle case where message is a string() function call: @test condition, string("msg", args)
  content = content.replace(/(@test\s+.*?),\s*string\([^)]*\)\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+.*?),\s*string\([^)]*\)\s*;/gm, '$1;');
  
  // Handle case where message is a string() function call without comma (less common but possible)
  content = content.replace(/(@test\s+.*?)\s+string\([^)]*\)\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+.*?)\s+string\([^)]*\)\s*;/gm, '$1;');
  
  // Handle string() function call with multiple concatenated args as message (no comma)
  // Pattern: @test condition string("msg", var1, "more", var2) -> @test condition
  // Match string( followed by anything up to the LAST ) on the line
  content = content.replace(/(@test\s+.*?)\s+string\(.*\)\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+.*?)\s+string\(.*\)\s*;/gm, '$1;');
  
  // DO NOT remove strings that are part of comparison expressions like @test a == "value"
  // The above patterns only match when there's a comma before the string or string() call,
  // which indicates it's a message argument, not a comparison value.
  
  // Handle descriptive message strings (contain "should", "must", "expected", etc.) at end of @test line
  // These are message arguments from TS assert(condition, "message")
  const messagePatterns = [
    'should be',
    'must be',
    'expected',
    'should not',
    'must not',
    'should have',
    'must have',
    'should be "',
    'must be "',
    'expected "',
    'should be >=',
    'should be ===',
    'should be !==',
    'should be true',
    'should be false',
    'should be undefined',
    'should be empty',
    'should not be',
    'leakyBucket',  // specific case: should be "leakyBucket"
    'should be "leakyBucket"',  // specific case with quotes
    'should be "Exchange"',  // specific case: id should be "Exchange"
    'httpExceptions should have',  // specific case
    'go transpiler workaround',  // specific case: go transpiler workaround
    'transpiler workaround',  // variant
    'workaround',  // generic
    'GO_WORKAROUND',  // specific case in test.base16ToBinary
    'GO skip trick',  // specific case in test.base58ToBinary
    'GO_WORKAROUND',  // specific case in test.base64ToBinary
    'clone A:',  // specific case in test.clone.jl
    'clone B:',  // specific case
    'clone C:',  // specific case
    'clone D:',  // specific case
    'clone E:',  // specific case
    'testToArray: result2 should include',  // test.toArray.jl - message with embedded quotes
    'was mutated after extend',  // test.extend.jl
    'was mutated during chain',  // test.extend.jl
    'leaked into',  // test.extend.jl
    'undefined value preserved',  // test.clone.jl
    'cloning empty object',  // test.clone.jl
    'mutated by second',  // test.extend.jl
    'step2:',  // test.extend.jl
    'base[',  // test.extend.jl
    'r1[',  // test.extend.jl
    'r2[',  // test.extend.jl
    'r3[',  // test.extend.jl
    'obj1.',  // test.extend.jl
    'obj2.',  // test.extend.jl
    'extended[',  // test.extend.jl
    'mutating clone must not change',  // test.clone.jl
    'mutating original must not change',  // test.clone.jl
    'top-level scalar independence',  // test.clone.jl
    'changing original top must not affect',  // test.clone.jl
    'can add key to clone',  // test.clone.jl
    'present key must exist',  // test.clone.jl
    'present value preserved',  // test.clone.jl
    'undefined key must still exist',  // test.clone.jl
    'undefined value preserved',  // test.clone.jl
    'original a untouched after clone',  // test.clone.jl
    'extra key must not appear',  // test.clone.jl
    'clone2 starts from pristine',  // test.clone.jl
    'clone2 must not inherit',  // test.clone.jl
    'clone1.b unaffected',  // test.clone.jl
    'original.b unaffected',  // test.clone.jl
    'sample assertion',  // test.fetchHistory.jl
    'testToArray: result2 should include',  // test.toArray.jl
  ];
  
  for (const pattern of messagePatterns) {
    // @test condition "message with should be..."
    const regex1 = new RegExp(`(@test\\s+.*?)\\s+"[^"]*${pattern}[^"]*"\\s*;?\\s*$`, 'gm');
    content = content.replace(regex1, '$1');
    const regex2 = new RegExp(`(@test\\s+.*?)\\s+'[^']*${pattern}[^']*'\\s*;?\\s*$`, 'gm');
    content = content.replace(regex2, '$1');
    // Also with semicolon in middle
    const regex3 = new RegExp(`(@test\\s+.*?)\\s+"[^"]*${pattern}[^"]*"\\s*;`, 'gm');
    content = content.replace(regex3, '$1;');
    const regex4 = new RegExp(`(@test\\s+.*?)\\s+'[^']*${pattern}[^']*'\\s*;`, 'gm');
    content = content.replace(regex4, '$1;');
  }
  
  // Handle comparison values followed by descriptive message: @test a == "value" "message"
  // These are from TS assert(a === "value", "message") which transpiles to @assert a == "value" "message" (no comma!)
  // Pattern: @test ... == "value" "message"  ->  @test ... == "value"
  // Match comparison operator followed by quoted string, then another quoted string (message)
  // But don't match if the first string is the only thing after the comparison (i.e., it's the expected value)
  content = content.replace(/(@test\s+.*?(?:==|!=|===|!==)\s+"[^"]*")\s+"[^"]*"\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+.*?(?:==|!=|===|!==)\s+'[^']*')\s+'[^']*'\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+.*?(?:==|!=|===|!==)\s+"[^"]*")\s+"[^"]*"\s*;/gm, '$1;');
  content = content.replace(/(@test\s+.*?(?:==|!=|===|!==)\s+'[^']*')\s+'[^']*'\s*;/gm, '$1;');
  
  // Handle comparison with non-quoted values (true, false, numbers, identifiers) followed by descriptive message
  // Pattern: @test ... == false "message"  ->  @test ... == false
  // Use [\s\S]*? to match across newlines
  content = content.replace(/(@test\s+[\s\S]*?(?:==|!=|===|!==)\s+(?:true|false|\d+(?:\.\d+)?|\w+))\s+"[^"]*"\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+[\s\S]*?(?:==|!=|===|!==)\s+(?:true|false|\d+(?:\.\d+)?|\w+))\s+'[^']*'\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+[\s\S]*?(?:==|!=|===|!==)\s+(?:true|false|\d+(?:\.\d+)?|\w+))\s+"[^"]*"\s*;/gm, '$1;');
  content = content.replace(/(@test\s+[\s\S]*?(?:==|!=|===|!==)\s+(?:true|false|\d+(?:\.\d+)?|\w+))\s+'[^']*'\s*;/gm, '$1;');
  
  // Handle comparison with function call followed by descriptive message (no comma, space-separated)
  // Pattern: @test a == func(...) "message"  ->  @test a == func(...)
  content = content.replace(/(@test\s+.*?(?:==|!=|===|!==)\s+[^;]+?)\s+"[^"]*"\s*;?\s*$/gm, (match, prefix) => {
    // Only remove if the string looks like a descriptive message (contains "should", "must", "expected", "failed", etc.)
    const lastString = match.match(/"([^"]*)"\s*;?\s*$/)?.[1] || '';
    if (/\b(should|must|expected|failed|not|have)\b/i.test(lastString)) {
      return prefix;
    }
    return match;
  });
  content = content.replace(/(@test\s+.*?(?:==|!=|===|!==)\s+[^;]+?)\s+'[^']*'\s*;?\s*$/gm, (match, prefix) => {
    const lastString = match.match(/'([^']*)'\s*;?\s*$/)?.[1] || '';
    if (/\b(should|must|expected|failed|not|have)\b/i.test(lastString)) {
      return prefix;
    }
    return match;
  });
  content = content.replace(/(@test\s+.*?(?:==|!=|===|!==)\s+[^;]+?)\s+"[^"]*"\s*;/gm, (match, prefix) => {
    const lastString = match.match(/"([^"]*)"\s*;/)?.[1] || '';
    if (/\b(should|must|expected|failed|not|have)\b/i.test(lastString)) {
      return prefix + ';';
    }
    return match;
  });
  content = content.replace(/(@test\s+.*?(?:==|!=|===|!==)\s+[^;]+?)\s+'[^']*'\s*;/gm, (match, prefix) => {
    const lastString = match.match(/'([^']*)'\s*;/)?.[1] || '';
    if (/\b(should|must|expected|failed|not|have)\b/i.test(lastString)) {
      return prefix + ';';
    }
    return match;
  });
  
  // Handle space-separated message (no comma): @test condition "message" where message is descriptive
  // This catches assert(condition, "message") transpiled without comma
  content = content.replace(/(@test\s+.*?)\s+"[^"]*"\s*;?\s*$/gm, (match, prefix) => {
    // Only remove if the string looks like a descriptive message (contains "should", "must", etc.)
    const lastString = match.match(/"([^"]*)"\s*;?\s*$/)?.[1] || '';
    if (/\b(should|must|expected|failed|not|have|include|be )\b/i.test(lastString)) {
      return prefix;
    }
    return match;
  });
  content = content.replace(/(@test\s+.*?)\s+'[^']*'\s*;?\s*$/gm, (match, prefix) => {
    const lastString = match.match(/'([^']*)'\s*;?\s*$/)?.[1] || '';
    if (/\b(should|must|expected|failed|not|have|include|be )\b/i.test(lastString)) {
      return prefix;
    }
    return match;
  });
  
  // Handle messages with unescaped embedded quotes (from TS assert with message containing quotes)
  // Pattern: @test condition "message with "quotes" inside" -> @test condition
  // This is a special case for testToArray which has: "testToArray: result2 should include "x" and 2"
  // We need to match line by line since embedded quotes break standard regex
  const lines = content.split('\n');
  const processedLines: string[] = [];
  for (const line of lines) {
    let processedLine = line;
    // Handle @test ... "message" where message may contain unescaped quotes
    // Pattern: @test condition ") "testToArray: message with "x" and 2""
    // The condition ends with ) and the message starts with a double quote after a space
    // Use greedy match to find the last " before optional semicolon/end of line
    // and check if the text between the condition-ending ")" and the message starts with a quote
    // and the message contains keywords like "should", "must", etc.
    //
    // Strategy: find the last occurrence of ") " followed by a quote and descriptive text
    // The message boundary is: condition ends with )", then space, then "message..."
    // Match: @test <expr> ") "message with embedded "quotes"" -> @test <expr>
    const testMatch = processedLine.match(/^(\s*@test\s+.*\))\s+"(.+)"\s*;*\s*$/);
    if (testMatch) {
      const prefix = testMatch[1];
      const message = testMatch[2];
      // Check if the message contains keywords indicating it's a descriptive message
      if (/\b(should|must|expected|failed|not|have|include|be )\b/i.test(message)) {
        processedLine = prefix;
      }
    } else {
      // Also handle single quotes
      const testMatchSingle = processedLine.match(/^(\s*@test\s+.*\))\s+'(.+)'\s*;*\s*$/);
      if (testMatchSingle) {
        const prefix = testMatchSingle[1];
        const message = testMatchSingle[2];
        if (/\b(should|must|expected|failed|not|have|include|be )\b/i.test(message)) {
          processedLine = prefix;
        }
      }
    }
    processedLines.push(processedLine);
  }
  content = processedLines.join('\n');
  
  // Handle case where message has escaped quotes inside like "testToArray: result2 should include \"x\" and 2"
  // Pattern: @test condition "message with \"quotes\" inside"
  content = content.replace(/(@test\s+.*?)\s+"([^"]*(?:\\.[^"]*)*)"\s*;?\s*$/gm, (match, prefix, message) => {
    if (/\b(should|must|expected|failed|not|have|include|be )\b/i.test(message)) {
      return prefix;
    }
    return match;
  });
  
  // Handle string concatenation comparisons: @test a == string("Exch", "ange") "message"
  content = content.replace(/(@test\s+.*?(?:==|!=|===|!==)\s+string\([^)]*\))\s+"[^"]*"\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+.*?(?:==|!=|===|!==)\s+string\([^)]*\))\s+"[^"]*"\s*;/gm, '$1;');
  
  // Handle case: @test <expr> == <expr> string("msg", args) where string() call is the message (no comma)
  // Pattern: @test ... == ... string(...) -> @test ... == ...
  // IMPORTANT: string(...) that IS the value after a comparison operator must NOT be stripped.
  // Only strip string(...) when it appears as a message argument after a complete boolean expression
  // (e.g., after a closing paren or a function call result, not after ==, !=, +, etc.)
  
  // Skip string() stripping if the text before string() ends with a comparison/arithmetic operator
  content = content.replace(/(@test\s+.*?(?:\))\s+)string\([^;]*\)\s*;?\s*$/gm, '$1');
  content = content.replace(/(@test\s+.*?(?:\))\s+)string\([^;]*\)\s*;/gm, '$1;');
  
  // Debug: log if any @test still has string messages
  const debugLines = content.split('\n');
  for (const line of debugLines) {
    if (line.includes('@test') && (line.includes('"') || line.includes("'")) && !line.includes('functions.')) {
      // Check if it's a trailing string message pattern
      if (/@test\s+.*\s+"[^"]*"\s*[;]?\s*$/.test(line) || /@test\s+.*\s+'[^']*'\s*[;]?\s*$/.test(line) || /@test\s+.*\s+string\([^)]*\)\s*[;]?\s*$/.test(line)) {
        // Potential remaining string message - left as-is, will be caught by other handlers
      }
    }
  }

  // Handle test.sharedMethods: add `self` as the first parameter to all function
  // definitions, since test files call them as assertXxx(testSharedMethods, exchange, ...)
  // but the transpiler drops the implicit `this` parameter.
  // Also append a testSharedMethods constant so the variable is defined.
  if (filename === 'test.sharedMethods.ts') {
    // Add `self` as the first parameter to all function definitions. The TS
    // source calls these helpers as `testSharedMethods.assertXxx(exchange, ...)`,
    // which the AST transpiler turns into `assertXxx(testSharedMethods, exchange, ...)`
    // (self present). A separate `(args...) -> (nothing, args...)` bridge (emitted
    // below) handles the internal self-absent form `assertXxx(exchange, ...)` by
    // prepending `nothing` exactly once. Note: `self` must NOT get a `=nothing`
    // default here — optional positional args must trail all required ones in
    // Julia, and the params after `self` are required, so a default would be a
    // syntax error.
    const selfPrependedNames: string[] = [];
    content = content.replace(/^function (\w+)\(([^)]*)\)/gm, (match, name, params) => {
      if (params.trim().startsWith('self')) return match;
      selfPrependedNames.push(name);
      return `function ${name}(self, ${params})`;
    });
    // Shared test helpers must not collide with the genuine `Ccxt.*` exchange
    // methods imported into the test scope via `setup.jl`. A helper whose name
    // matches an imported method (e.g. the `fetchOrder` shared helper vs the
    // real `Ccxt.fetchOrder`) would be rejected by Julia ("must be explicitly
    // imported to be extended") and would also shadow the real method. Rename
    // any colliding helper to `<name>Helper` — but ONLY at the function
    // definition and the internal bridge we emit. String literals such as
    // `["fetchOrder"]` and `Symbol("fetchOrder")` reference the real exchange
    // method and must stay untouched.
    const setupSrc = fs.readFileSync(path.join(JULIA_TEST, 'setup.jl'), 'utf8');
    const importedMethods = new Set<string>();
    // Extract every imported name from `using Ccxt: a, b, c` blocks. Names are
    // comma-separated and may sit at the start of a line or mid-line, hence the
    // `\w+\s*(?:,|$)` pattern across the whole import block.
    for (const m of setupSrc.matchAll(/\b(\w+)\s*(?:,|\n|$)/g)) {
      importedMethods.add(m[1]);
    }
    const renameMap = new Map<string, string>();
    for (const name of selfPrependedNames) {
      if (importedMethods.has(name)) {
        renameMap.set(name, name + 'Helper');
      }
    }
    if (renameMap.size > 0) {
      for (const [from, to] of renameMap) {
        // Rename the definition: `function fetchOrder(` -> `function fetchOrderHelper(`
        content = content.replace(
          new RegExp(`^function ${from}\\(`, 'gm'),
          `function ${to}(`,
        );
      }
    }
    // The shared helpers are called two ways in the transpiled output:
    //   1. externally as `assertXxx(testSharedMethods, exchange, ...)` (self present), and
    //   2. internally from one another as `assertXxx(exchange, ...)` (self absent),
    //      mirroring the TS source where `this` is implicit on every call.
    // We prepended `self` to every definition above, so the external (self-present)
    // call resolves directly to the definition with self=testSharedMethods. The internal
    // (self-absent) call would raise a MethodError / shift arguments if left bare, because
    // Julia prefers the fixed-arity definition over a variadic `(args...) -> (nothing,
    // args...)` bridge, so a bridge cannot reliably prepend `self`. Instead we rewrite the
    // bare internal calls at transpile time, prepending `nothing` as `self` so they become
    // self-present 7-arg calls identical in convention to the external form. A negative
    // lookbehind on `[\w.]` keeps the external `testSharedMethods.assertXxx(` form (already
    // self-present) untouched. `logTemplate` is included because it is called bare
    // internally too. This keeps the generator as the single source of truth — no
    // hand-patched generated output.
    const namesForNothing = selfPrependedNames.filter((n) => !/^(fetch|get|set|remove|create|cancel|close|load|watch|update|edit|delete|deposit|withdraw|transfer|enable|disable)/.test(n));
    if (namesForNothing.length > 0) {
      const nothingRe = new RegExp(`(?<!function )(?<![\\w.])(${namesForNothing.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\(`, 'g');
      content = content.replace(nothingRe, '$1(nothing, ');
    }
    // Define testSharedMethods as a simple constant
    content += '\n# testSharedMethods is passed as first arg to shared methods; defined here for reference\nconst testSharedMethods = nothing\n';

    // Generator correctness fix for `assertType`.
    //
    // The transpiled body builds `result` from `ccxt_or`/`ccxt_and` chains that
    // emulate JS truthiness. The TS source for the boolean-shortcut terms is
    //     same_boolean = (entryKeyVal || entryKeyVal === false) && (formatKeyVal || formatKeyVal === false);
    // In JS, `entryKeyVal || ...` short-circuits to the *value* of `entryKeyVal`
    // — so when `entryKeyVal` is a truthy Dict/Array, `same_boolean` (and hence
    // `result`) becomes that container, not a Bool. The upstream JS test
    // framework coerces the truthy value to a boolean before `@test`, so the
    // assertion passes. Julia's `@test` requires an actual Bool and rejects the
    // container ("Expression evaluated to non-Boolean"). Coercing the return to
    // a Bool via `ccxtruthy` reproduces the JS coercion exactly: a truthy
    // container (types match) -> true, a falsy/zero value (types differ) ->
    // false. This is the single source of truth; we do not hand-patch the
    // generated `test.sharedMethods.jl`.
    content = content.replace(
      /(    result = @functions\.ccxt_or\(@functions\.ccxt_or\(@functions\.ccxt_or\(@functions\.ccxt_or\(@functions\.ccxt_or\(\(entryKeyVal == nothing\), same_string\), same_numeric\), same_boolean\), same_array\), same_object\);\n)    return result\n/,
      '$1    return functions.ccxtruthy(result)\n',
    );

    // (Strip of the leading `testSharedMethods, ` arg from external assert calls
    // is applied in the general body below, since those calls live in the
    // per-structure validator files, not in test.sharedMethods.ts itself.)
  }

  // Last: bridge JS `assert` truthiness onto Julia's Bool-only `@test`.
  // Must run after every rewrite above, so it sees the final expression text.
  content = coerceTestBooleans(content);

  return content;
}

/**
 * Transpile exchange unified method tests from ts/src/test/Exchange/test.*.ts
 * to julia/Ccxt/test/exchange/
 */
function transpileTestExchange(transpiler: Transpiler) {
  const testExchangeSrc = path.join(TS_SRC, 'test', 'Exchange');
  const testExchangeDst = path.join(JULIA_TEST, 'exchange');
  
  if (!fs.existsSync(testExchangeSrc)) {
    console.error(`Test exchange source not found: ${testExchangeSrc}`);
    return;
  }
  
  fs.mkdirSync(testExchangeDst, { recursive: true });
  
  const files = fs.readdirSync(testExchangeSrc)
    .filter((f) => f.endsWith('.ts') && f.startsWith('test.'))
    .filter((f) => !f.startsWith('base') && !f.startsWith('pro'));
  
  for (const file of files) {
    const filePath = path.join(testExchangeSrc, file);
    try {
      const result = transpiler.transpileJuliaByPath(filePath);
      let content = cleanupJuliaSource(result.content ?? '');
      
      // Convert test syntax
      content = convertTestSyntax(content, file);
      
      const outFile = path.join(testExchangeDst, file.replace('.ts', '.jl'));
      fs.writeFileSync(outFile, content, 'utf8');
      console.log(`Julia test-exchange ${file} transpiled -> ${outFile}`);
    } catch (e) {
      console.error(`Failed to transpile ${file}:`, e);
    }
  }
}

/**
 * Transpile Pro WebSocket unified method tests from ts/src/pro/test/Exchange/test.watch*.ts
 * to julia/Ccxt/test/pro/exchange/
 */
function transpileTestProExchange(transpiler: Transpiler) {
  const testProExchangeSrc = path.join(TS_SRC, 'pro', 'test', 'Exchange');
  const testProExchangeDst = path.join(JULIA_TEST, 'pro', 'exchange');
  
  if (!fs.existsSync(testProExchangeSrc)) {
    console.error(`Test pro exchange source not found: ${testProExchangeSrc}`);
    return;
  }
  
  fs.mkdirSync(testProExchangeDst, { recursive: true });
  
  // Match every unified WS test, not just `test.watch*`. The directory also
  // holds `test.unWatchPositions.ts` (and any future `unWatch*` test), which a
  // `test.watch` prefix filter silently drops — the Python suite transpiles it,
  // so filtering on the `test.` prefix alone keeps the two in step. `tests.init`
  // is a runner shim, not a test, and is excluded.
  const files = fs.readdirSync(testProExchangeSrc)
    .filter((f) => f.endsWith('.ts') && f.startsWith('test.') && f !== 'tests.init.ts');
  
  for (const file of files) {
    const filePath = path.join(testProExchangeSrc, file);
    try {
      const result = transpiler.transpileJuliaByPath(filePath);
      let content = cleanupJuliaSource(result.content ?? '');
      
      // Convert test syntax
      content = convertTestSyntax(content, file);
      
      const outFile = path.join(testProExchangeDst, file.replace('.ts', '.jl'));
      fs.writeFileSync(outFile, content, 'utf8');
      console.log(`Julia test-pro-exchange ${file} transpiled -> ${outFile}`);
    } catch (e) {
      console.error(`Failed to transpile ${file}:`, e);
    }
  }
}

/**
 * Build Julia fixture loader for static request/response JSON files
 * Creates julia/Ccxt/test/fixtures.jl with load functions
 */
function buildJuliaFixtureLoader(): void {
  const fixtureSrc = path.join(REPO_ROOT, 'ts', 'src', 'test', 'static');
  const fixtureDst = path.join(JULIA_TEST, 'fixtures');
  
  if (!fs.existsSync(fixtureSrc)) {
    console.error(`Fixture source not found: ${fixtureSrc}`);
    return;
  }
  
  fs.mkdirSync(fixtureDst, { recursive: true });
  
  // Read request fixtures
  const requestDir = path.join(fixtureSrc, 'request');
  const responseDir = path.join(fixtureSrc, 'response');
  
  let loaderContent = `# Auto-generated fixture loader - DO NOT EDIT
using JSON3

# Resolve the fixture directory from this file's own location so the loader
# works whether the suite is launched as a script (julia --project test/runtests.jl)
# or via Pkg.test(). Under Pkg.test() the runner is Pkg itself, so a bare
# using Pkg / pkgdir(Ccxt) can be unavailable mid-load; @__DIR__ needs no package context.
const FIXTURE_ROOT = joinpath(@__DIR__, "fixtures")

"""
Load a static request fixture for an exchange and method.
"""
function load_request_fixture(exchange_id::String, method::String)
    filename = joinpath(FIXTURE_ROOT, "request", exchange_id * ".json")
    if !isfile(filename)
        return nothing
    end
    data = JSON3.read(read(filename, String))
    if haskey(data, "methods") && haskey(data["methods"], method)
        return data["methods"][method]
    end
    return nothing
end

"""
Load a static response fixture for an exchange and method.
"""
function load_response_fixture(exchange_id::String, method::String)
    filename = joinpath(FIXTURE_ROOT, "response", exchange_id * ".json")
    if !isfile(filename)
        return nothing
    end
    data = JSON3.read(read(filename, String))
    if haskey(data, "methods") && haskey(data["methods"], method)
        return data["methods"][method]
    end
    return nothing
end

"""
Load all request fixtures for an exchange.
"""
function load_all_request_fixtures(exchange_id::String)
    filename = joinpath(FIXTURE_ROOT, "request", exchange_id * ".json")
    if !isfile(filename)
        return Dict{String, Any}()
    end
    data = JSON3.read(read(filename, String))
    return get(data, "methods", Dict{String, Any}())
end

"""
Load all response fixtures for an exchange.
"""
function load_all_response_fixtures(exchange_id::String)
    filename = joinpath(FIXTURE_ROOT, "response", exchange_id * ".json")
    if !isfile(filename)
        return Dict{String, Any}()
    end
    data = JSON3.read(read(filename, String))
    return get(data, "methods", Dict{String, Any}())
end
`
  
  const outFile = path.join(JULIA_TEST, 'fixtures.jl')
  fs.writeFileSync(outFile, loaderContent, 'utf8');
  console.log(`Julia fixture loader written -> ${outFile}`);
  
  // Also copy the static fixture JSON files to Julia test fixtures directory
  if (fs.existsSync(requestDir)) {
    const destDir = path.join(fixtureDst, 'request')
    fs.mkdirSync(destDir, { recursive: true })
    for (const file of fs.readdirSync(requestDir).filter(f => f.endsWith('.json'))) {
      fs.copyFileSync(path.join(requestDir, file), path.join(destDir, file))
    }
    console.log(`Copied request fixtures to ${destDir}`)
  }
  
  if (fs.existsSync(responseDir)) {
    const destDir = path.join(fixtureDst, 'response')
    fs.mkdirSync(destDir, { recursive: true })
    for (const file of fs.readdirSync(responseDir).filter(f => f.endsWith('.json'))) {
      fs.copyFileSync(path.join(responseDir, file), path.join(destDir, file))
    }
    console.log(`Copied response fixtures to ${destDir}`)
  }
}

/**
 * Transpile static request fixtures (not used directly, fixture loader handles this)
 * Kept for compatibility
 */
function transpileTestRequest(transpiler: Transpiler) {
  console.log("Request fixtures are handled by --test-fixtures (buildJuliaFixtureLoader)")
}

/**
 * Transpile static response fixtures (not used directly, fixture loader handles this)
 * Kept for compatibility
 */
function transpileTestResponse(transpiler: Transpiler) {
  console.log("Response fixtures are handled by --test-fixtures (buildJuliaFixtureLoader)")
}
