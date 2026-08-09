import Transpiler from '../node_modules/ast-transpiler/src/transpiler.js';
import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve('.');
const FUNC_SRC = path.join(REPO_ROOT, 'ts', 'src', 'base', 'functions');
const JULIA_SRC = path.join(REPO_ROOT, 'julia', 'Ccxt', 'src');

const SKIP: Record<string, boolean> = { 'crypto.ts': true, 'totp.ts': true };

function stripTrailingComment(line: string): string {
  let inStr = false;
  let quote = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === quote) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = true; quote = c; continue; }
    if (c === '/' && line[i + 1] === '/') {
      return line.slice(0, i).replace(/\s+$/, '');
    }
  }
  return line;
}
function normalizeJuliaComments(input: string): string {
  const lines = input.split('\n');
  const out: string[] = [];
  let inBlockComment = false;
  let seenCode = false;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
    const trimmed = line.trim();
    if (inBlockComment) {
      if (trimmed.endsWith('*/')) inBlockComment = false;
      continue;
    }
    if (trimmed.startsWith('/*')) {
      if (!trimmed.endsWith('*/')) inBlockComment = true;
      continue;
    }
    if (/^\/\//.test(trimmed)) {
      if (!seenCode) continue;
      const rest = trimmed.slice(2).trimStart();
      out.push(rest.length === 0 ? '#' : '# ' + rest);
      continue;
    }
    if (trimmed.length > 0) {
      seenCode = true;
      line = stripTrailingComment(line);
    }
    out.push(line);
  }
  return out.join('\n');
}

async function main() {
  const transpiler = new Transpiler({ julia: {} });
  const files = fs.readdirSync(FUNC_SRC).filter((f) => f.endsWith('.ts') && !SKIP[f]);
  const parts: string[] = [];
  for (const f of files) {
    const fp = path.join(FUNC_SRC, f);
    const result = transpiler.transpileJuliaByPath(fp);
    const content = normalizeJuliaComments(result.content ?? '');
    parts.push(`# ===== ${f} =====\n` + content);
  }
  const helpers = `
# --- hand-written Julia helpers (no direct TS equivalent / Object.* mappings) ---
# Type aliases referenced by transpiled helpers (mirror TypeAliases.jl in the
# outer Ccxt module; the functions module is separate and cannot see them).
const ConstructorArgs = Any
# Object.getOwnPropertyNames(obj) -> own property names as strings.
# Structs: their field names. Dicts: their keys. Dispatches on the arg type.
ccxt_getOwnPropertyNames(obj::Dict) = collect(string(k) for k in keys(obj))
ccxt_getOwnPropertyNames(obj) = collect(string(k) for k in fieldnames(typeof(obj)))
# snake_case -> camelCase (reverse of unCamelCase), used for property access
# fallback so both api_key and apiKey resolve to the same struct field.
function camelCase(s::AbstractString)
    parts = split(s, "_")
    isempty(parts) && return s
    return string(lowercase(parts[1]), join(uppercasefirst(lowercase(p)) for p in parts[2:end]))
end
# JS Object constructor sentinel (used by constructor()/isObject checks).
# Matches the transpiled 'const Object = :__js_Object__' so that
# 'constructor(x) == ccxt_Object' identifies plain Dicts, and
# 'get(ccxt_Object, :prototype, nothing)' yields nothing (Object.prototype).
const ccxt_Object = :__js_Object__
Base.get(s::Symbol, k::Symbol, default) = (s === :__js_Object__) ? nothing : default
const ccxt_Object_prototype = nothing
# JS Array/string concat: concat(a, b, ...) -> vcat for arrays, string join for strings.
function concat(args...)
    if length(args) == 0
        return []
    end
    if all(a -> a isa AbstractString, args)
        return string(args...)
    end
    result = []
    for a in args
        if a isa AbstractArray
            append!(result, a)
        else
            push!(result, a)
        end
    end
    return result
end
# JS Promise continuation: p.then(onResolve, onReject).
# p may be a Task (from @async) or an already-resolved value.
# Returns a new Task mirroring the JS Promise chain.
function ccxt_then(p, onResolve=nothing, onReject=nothing)
    return @async begin
        local value
        try
            if p isa Task
                value = Base.fetch(p)
            else
                value = p
            end
            if onResolve !== nothing
                onResolve(value)
            else
                value
            end
        catch err
            if onReject !== nothing
                onReject(err)
            else
                rethrow(err)
            end
        end
    end
end
# --- JS-truthiness emulation (required by the Julia transpiler) ---
# Julia's if/&&/|| demand a real Bool; JS uses truthiness (false for
# undefined/null/false/0/""/NaN). ccxtruthy reproduces JS semantics so the
# transpiler can wrap every condition in functions.ccxtruthy(...).
function ccxtruthy(x)
    return (x !== nothing) && (x !== false) && !(isa(x, Number) && (x == 0)) && !(isa(x, AbstractString) && (x == ""))
end
macro ccxt_or(a, b)
    return :(let _a = $(esc(a)); ccxtruthy(_a) ? _a : $(esc(b)); end)
end
macro ccxt_and(a, b)
    return :(let _a = $(esc(a)); ccxtruthy(_a) ? $(esc(b)) : _a; end)
end
function objectAssign(target, sources...)
    for src in sources
        if src isa Dict
            for (k, v) in src
                target[k] = v
            end
        end
    end
    return target
end
function objectKeys(obj)
    return collect(string(k) for k in Base.keys(obj))
end
function objectValues(obj)
    return collect(v for v in Base.values(obj))
end
function objectEntries(obj)
    return collect(p for p in Base.pairs(obj))
end
function utf8encode(s::AbstractString)
    return Vector{UInt8}(s)
end
function utf8decode(b::AbstractVector{UInt8})
    return String(b)
end
function base16encode(b::AbstractVector{UInt8})
    return bytes2hex(b)
end
function base16decode(s::AbstractString)
    return hex2bytes(s)
end
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
function base58encode(data::AbstractVector{UInt8})
    zeros = 0
    i = 1
    while i <= length(data) && data[i] == 0x00
        zeros += 1
        i += 1
    end
    digits = BigInt(0)
    for b in data
        digits = digits * 256 + Int(b)
    end
    result = ""
    while digits > 0
        digits, rem = divrem(digits, 58)
        result = BASE58_ALPHABET[rem + 1] * result
    end
    return "1"^zeros * result
end
function base58decode(s::AbstractString)
    zeros = 0
    i = 1
    while i <= length(s) && s[i] == '1'
        zeros += 1
        i += 1
    end
    num = BigInt(0)
    for c in s
        idx = findfirst(==(c), BASE58_ALPHABET)
        isnothing(idx) && error("invalid base58 character: " * string(c))
        num = num * 58 + (idx - 1)
    end
    bytes = UInt8[]
    while num > 0
        num, rem = divrem(num, 256)
        push!(bytes, UInt8(rem))
    end
    reverse!(bytes)
    return vcat(fill(0x00, zeros), bytes)
end

# --- crypto-dependent helpers (crypto.ts is skipped by the transpiler) ---
# --- Julia platform globals (window/process do not exist in Julia) ---
window = nothing
process = nothing
isBrowser = false
isWebWorker = false
isDeno = false
isElectron = false
isBun = false
isNode = false
isWeb = false
self = nothing
WorkerGlobalScope = nothing
Deno = nothing

# --- Date (port of the JS Date object used throughout CCXT) ---
struct Date
    ms::Int
end
Date() = Date(Int(round(Dates.datetime2unix(Dates.now()) * 1000)))
Date(ts::Real) = Date(Int(ts))
_dt(d::Date) = Dates.unix2datetime(d.ms / 1000)
function Base.getproperty(::Type{Date}, name::Symbol)
    if name === :now
        return () -> Date(Int(round(Dates.datetime2unix(Dates.now()) * 1000)))
    elseif name === :parse
        return (x) -> parse(Date, x)
    elseif name === :UTC
        return (y, m, d, h=0, mi=0, s=0, ms=0) ->
            Date(Int(round(Dates.datetime2unix(Dates.DateTime(y, m, d, h, mi, s)) * 1000)) + Int(ms))
    else
        return nothing
    end
end
function Base.parse(::Type{Date}, x)
    dt = try Dates.DateTime(s) catch; Dates.DateTime(replace(s, "T" => " ")) end
    return Date(Int(round(Dates.datetime2unix(dt) * 1000)))
end
function getTime(d::Date)
    return d.ms
end
function getUTCDate(d::Date)
    return Dates.day(_dt(d))
end
function getUTCFullYear(d::Date)
    return Dates.year(_dt(d))
end
function getUTCMonth(d::Date)
    return Dates.month(_dt(d)) - 1
end
function getUTCDay(d::Date)
    return Dates.dayofweek(_dt(d)) % 7
end
function getUTCHours(d::Date)
    return Dates.hour(_dt(d))
end
function getUTCMinutes(d::Date)
    return Dates.minute(_dt(d))
end
function getUTCSeconds(d::Date)
    return Dates.second(_dt(d))
end
function toISOString(d::Date)
    return Dates.format(_dt(d), "yyyy-mm-ddTHH:MM:SS.sssZ")
end

# --- Timers (synchronous Julia port of the JS timer helpers) ---
setTimeout(f, ms) = (sleep(Float64(ms) / 1000.0); f())
clearTimeout(_) = nothing

# --- JS Error base type ---
const Error = ErrorException

ccxt_isArray(x) = x isa AbstractArray

# --- JS Number.* semantics: return false (not error) for non-numeric inputs ---
Base.isfinite(x::Any) = false
Base.isnan(x::Any) = false
Base.isinteger(x::Any) = false


ccxt_toNumber(x) = x isa AbstractString ? parse(Float64, x) : (x isa Number ? x : Float64(x))

# --- JS Object / constructor plain-object check ---
const Object = :__js_Object__
constructor(x) = isa(x, AbstractDict) ? Object : nothing







concatBytes(args...) = reduce(vcat, Vector{UInt8}[Vector{UInt8}(a) for a in args]; init=UInt8[])


using SHA
function _ccxt_sha(algo::AbstractString, data)
    d = data isa AbstractString ? Vector{UInt8}(codeunits(data)) : Vector{UInt8}(data)
    if algo == "sha1"; return sha1(d)
    elseif algo == "sha256"; return sha256(d)
    elseif algo == "sha384"; return sha384(d)
    elseif algo == "sha512"; return sha512(d)
    elseif algo == "md5"; return md5(d)
    elseif algo == "sha3-224"; return sha3_224(d)
    elseif algo == "sha3-256"; return sha3_256(d)
    elseif algo == "sha3-384"; return sha3_384(d)
    elseif algo == "sha3-512"; return sha3_512(d)
    else; error("unsupported hash algorithm: " * algo)
    end
end
function hash(request, algo="sha256", digest="hex")
    h = _ccxt_sha(algo, request)
    if digest == "hex"; return bytes2hex(h)
    elseif digest == "base64"; return base64encode(h)
    else; return h
    end
end
function hmac(request, secret, algo="sha256", digest="hex")
    key = secret isa AbstractString ? Vector{UInt8}(codeunits(secret)) : Vector{UInt8}(secret)
    msg = request isa AbstractString ? Vector{UInt8}(codeunits(request)) : Vector{UInt8}(request)
    if algo == "sha1"; h = HMAC.sha1(key, msg)
    elseif algo == "sha256"; h = HMAC.sha256(key, msg)
    elseif algo == "sha384"; h = HMAC.sha384(key, msg)
    elseif algo == "sha512"; h = HMAC.sha512(key, msg)
    else; error("unsupported hmac algorithm: " * algo)
    end
    if digest == "hex"; return bytes2hex(h)
    elseif digest == "base64"; return base64encode(h)
    else; return h
    end
end
function crc32(data)
    crc = 0xffffffff
    for b in (data isa AbstractString ? codeunits(data) : data)
        crc = crc ⊻ UInt32(b)
        for _ in 1:8
            if crc & 1 != 0; crc = (crc >> 1) ⊻ 0xedb88320
            else; crc = crc >> 1
            end
        end
    end
    return crc ⊻ 0xffffffff
end
`;
  const tail = `# --- Julia runtime overrides (transpiled platform detection is Node-centric) ---
isNode = false
isBrowser = false
isWebWorker = false
isDeno = false
isElectron = false
isBun = false
`;
  const moduleBody = helpers + "\n\n" + parts.join("\n\n") + "\n\n" + tail;
  const out = `module functions\n\nusing Base64\n\n${moduleBody}\n\nend # module functions\n`;
  const outFile = path.join(JULIA_SRC, 'functions.jl');
  fs.writeFileSync(outFile, out, 'utf8');
  console.log(`functions.jl written -> ${outFile} (${files.length} files)`);
}

main().catch(console.error);
