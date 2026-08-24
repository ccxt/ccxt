# Live credential resolver for the Julia CCXT sandbox harness.
#
# Mirrors the CCXT runner's three-source resolution (committed `keys.json` ->
# gitignored `keys.local.json` -> environment variables), but only fills
# credentials that the exchange actually declares in `requiredCredentials`,
# and only when `load_keys=true` is passed for the env-var tier (so that merely
# having env vars set never surprises a test that did not ask for them).
#
# The resolver never reads a file outside the package, never sets HOME, and
# never falls back to any network. It is a thin, auditable helper so the live
# smoke test drives the SHIPPED exchange code with real (sandbox) credentials.
#
# This file is hand-written test infrastructure, not a transpiled output.

using JSON3

const _CRED_ROOT = @__DIR__              # .../test/live
const _PKG_ROOT  = joinpath(_CRED_ROOT, "..", "..")
const _KEYS_JSON = joinpath(_PKG_ROOT, "keys.json")          # committed, non-secret defaults
const _KEYS_LOCAL = joinpath(_PKG_ROOT, "keys.local.json")    # gitignored, your real keys

# Credential field name -> environment variable suffix (uppercased id + suffix).
const _CRED_ENV = Dict(
    "apiKey"       => "APIKEY",
    "secret"       => "SECRET",
    "password"     => "PASSWORD",
    "uid"          => "UID",
    "walletAddress"=> "WALLETADDRESS",
    "privateKey"   => "PRIVATEKEY",
    "token"        => "TOKEN",
    "twofa"        => "TWOFA",
    "login"        => "LOGIN",
    "accountId"    => "ACCOUNTID",
)

# Recursively deep-merge `src` into `dst` (dicts merge, scalars/arrays replace).
# Mirrors the JS `deepExtend` contract used by CCXT's own loader.
function _deep_extend!(dst::AbstractDict, src::AbstractDict)
    for (k, v) in src
        ks = k isa Symbol ? k : Symbol(k)
        if haskey(dst, ks) && dst[ks] isa AbstractDict && v isa AbstractDict
            _deep_extend!(dst[ks], v)
        else
            dst[ks] = v
        end
    end
    return dst
end

_stringify_keys(d::AbstractDict) = Dict{Symbol,Any}(Symbol(k) => _stringify_keys(v) for (k,v) in d)
_stringify_keys(v::AbstractVector) = Any[_stringify_keys(x) for x in v]
_stringify_keys(v) = v

# Load the merged credential config: keys.local.json deep-extends keys.json.
# Returns Dict{String,Any} keyed by lowercase exchange id.
function load_credential_config()
    cfg = Dict{String,Any}()
    if isfile(_KEYS_JSON)
        cfg = _stringify_keys(JSON3.read(read(_KEYS_JSON, String), Dict{String,Any}))
    end
    if isfile(_KEYS_LOCAL)
        local_cfg = _stringify_keys(JSON3.read(read(_KEYS_LOCAL, String), Dict{String,Any}))
        _deep_extend!(cfg, local_cfg)
    end
    return cfg
end

# Resolve credentials for one exchange id, applying env-var fallback only when
# `load_keys` is true and the field is still missing. Returns a Dict{Symbol,Any}
# of the credential fields to set, restricted to what `ex.requiredCredentials`
# marks as used.
function resolve_credentials(ex, load_keys::Bool=false)
    id = ex.id
    cfg = load_credential_config()
    entry = get(cfg, id, Dict{Symbol,Any}())

    out = Dict{Symbol,Any}()
    for (cred, used) in ex.requiredCredentials
        cred_s = string(cred)
        # 1. keys.local.json (already merged over keys.json)
        val = get(entry, Symbol(cred_s), nothing)
        # 2. env var, only when explicitly asked and still missing
        if val === nothing && load_keys && haskey(_CRED_ENV, cred_s)
            envkey = uppercase(id) * "_" * _CRED_ENV[cred_s]
            if haskey(ENV, envkey)
                val = ENV[envkey]
            end
        end
        if val !== nothing
            out[Symbol(cred_s)] = val
        end
    end
    return out
end

# Apply resolved credentials to an exchange instance. Credential fields live
# on the parent `Exchange` struct, so we assign via `setproperty!` (the dot
# form `ex.apiKey = v`), which `CCXTBase.jl` routes to the parent — NOT via
# `ex[key] = v`, which would write a stray dict entry on the alias struct and
# never reach the credential field. Options (defaultType, sandbox flags, ...)
# are deep-merged onto the instance options.
function apply_credentials!(ex, creds::AbstractDict; load_keys::Bool=false)
    for (k, v) in creds
        setproperty!(ex, Symbol(k), v)
    end
    # options from the config entry (e.g. defaultType, sandbox testnet flags)
    cfg = load_credential_config()
    entry = get(cfg, ex.id, Dict{Symbol,Any}())
    if haskey(entry, :options) && entry[:options] isa AbstractDict
        for (ok, ov) in entry[:options]
            ex.options[Symbol(ok)] = ov
        end
    end
    return ex
end

# Convenience: build an exchange, apply credentials, return it (or nothing if
# the exchange declares no credentials / none resolved and `require` is false).
function authenticated_instance(id::AbstractString, load_keys::Bool=false; require::Bool=false)
    cls = getproperty(Ccxt, Symbol(uppercasefirst(id)))
    ex = cls()
    creds = resolve_credentials(ex, load_keys)
    if require && isempty(creds)
        return nothing
    end
    apply_credentials!(ex, creds; load_keys=load_keys)
    return ex
end
