# CCXT Julia test suite.
#
# The suite is split into independently runnable groups so a single area can be
# iterated on without paying for the whole run, and so the run can be sharded
# across several processes:
#
#     julia --project test/runtests.jl                    # every group, one process
#     julia --project test/runtests.jl --jobs 4           # every group, 4 processes
#     julia --project test/runtests.jl base_number        # one group
#     julia --project test/runtests.jl base_crypto ws     # several groups
#     julia --project test/runtests.jl request            # an alias for a family
#     julia --project test/runtests.jl unified_binance    # one exchange's slice
#     julia --project test/runtests.jl --list             # show groups and costs
#
# Under `Pkg.test` the same selection works via `test_args`:
#
#     Pkg.test("Ccxt"; test_args = ["base_number"])
#     Pkg.test("Ccxt"; test_args = ["--jobs", "4"])
#
# Groups live in `test/groups/*.jl`; `test/setup.jl` holds the shared preamble
# (module aliases, imports and the transpiler `self`-dropping shims) that every
# group assumes is already loaded.
#
# ---------------------------------------------------------------------------
# Why the groups are shaped the way they are
# ---------------------------------------------------------------------------
#
# Roughly 25 seconds of every run is fixed cost: `using Ccxt` deserialises a
# very large package (~18 s) and `setup.jl` then warms up the timer and
# `loadMarkets` call graphs so the latency-sensitive base tests measure what
# they mean to. That cost is paid once per process and cannot be sharded away,
# so groups are sized to make the *remaining* ~77 seconds divide evenly.
#
# The three fixture-driven layers dominate that remainder, and each one is a
# loop over the same five exchanges. They are therefore registered one group
# per exchange (`request_binance`, `response_okx`, `unified_kraken`, …) rather
# than one group per layer. That both shards well — binance alone carries 338
# of the 748 request fixtures — and makes the natural debugging request ("re-run
# just kraken's response fixtures") a first-class command.
#
# Groups whose only job is to *define* functions (`validators`,
# `exchange_methods`, `static_drivers`, `unified_driver`) are listed as
# dependencies rather than folded into their consumers, so a shard loads only
# the definitions it actually needs.
#
# Measured on a 20-core machine, all runs reporting the same 8122 passing and 3
# broken assertions:
#
#     --jobs 1   103 s      --jobs 4    64 s
#     --jobs 6    57 s      --jobs 8    53 s
#
# Four shards is the sweet spot; past that every extra process pays the full
# 25-second startup to absorb only a few seconds of work. The narrowest useful
# slice is a single exchange (`kraken`: 39 s, of which 25 s is startup).

# ---------------------------------------------------------------------------
# Group table
# ---------------------------------------------------------------------------
#
# name => (dependencies, approximate seconds, one-line summary)
#
# Dependencies are other groups whose definitions must be loaded first; they are
# loaded, not re-run. The cost is measured wall time *excluding* the fixed
# per-process startup, and is used only to balance shards — being a little stale
# costs a slightly uneven split, nothing more.

struct Group
    deps::Vector{String}
    cost::Float64
    summary::String
end

# The exchanges the static fixtures cover, heaviest first.
#
# This duplicates `FIXTURE_EXCHANGES` in `test/fixtures/static_init_offline.jl`,
# which is the authoritative registry but names exchange *classes* and so cannot
# be read without loading `Ccxt` — an 18-second cost this file exists to avoid
# paying before it knows what to run. The `exchange_stubs` group asserts the two
# agree, so a registry entry missing here fails the suite instead of silently
# going unrun.
const FIXTURE_IDS = ["binance", "bybit", "okx", "kraken", "coinbase"]

const GROUPS = Pair{String,Group}[
    "base_utils" => Group(String[], 3.3,
        "base utility helpers (number/string/collection functions)"),
    "base_number" => Group(String[], 3.5,
        "Precise arithmetic and decimal-to-precision rounding"),
    "base_encoding" => Group(String[], 1.4,
        "base16/58/64, URL and JSON encoding"),
    "base_crypto" => Group(String[], 1.1,
        "hmac, hash, jwt, ecdsa, totp"),
    "base_datetime" => Group(String[], 1.4,
        "ISO 8601 parsing, timeframes and timestamps"),
    "base_exchange" => Group(String[], 5.3,
        "Exchange base class: safe* accessors, markets, networks, construction"),
    "ws" => Group(String[], 3.5,
        "Pro WebSocket base: caches, order book, futures"),

    # Definition-only groups. Cheap, and never worth sharding on their own.
    "validators" => Group(String[], 0.2,
        "[definitions] unified-structure validators (testTicker, testOrder, …)"),
    "fixtures_init" => Group(String[], 0.3,
        "[definitions] offline exchange constructor and fixture JSON loaders"),
    "exchange_methods" => Group(["validators"], 0.2,
        "[definitions] transpiled unified-method tests (testFetchTicker, …)"),
    "static_drivers" => Group(["fixtures_init"], 0.2,
        "[definitions] static request/response fixture drivers"),
    "unified_driver" => Group(["validators", "exchange_methods", "fixtures_init"], 0.2,
        "[definitions] driver running unified-method tests against fixtures"),

    "validators_pass" => Group(["validators", "fixtures_init"], 6.0,
        "unified-structure validators against synthetic parsed data"),
    "validators_shared" => Group(["validators", "fixtures_init"], 1.5,
        "shared assert primitives (test.sharedMethods, file #25) against real data"),
    "exchange_stubs" => Group(["fixtures_init"], 0.3,
        "every generated exchange module loads; manifest and fixture registry match"),
    # The single heaviest group: 104 exchange constructions, each running a
    # full `describe()`. Listed at its measured cost so the shard balancer puts
    # it first and builds the other shards around it.
    "load_all" => Group(["fixtures_init"], 29.0,
        "every generated exchange constructs, indexes recorded markets and resolves a symbol"),
    "sandbox" => Group(String[], 0.5,
        "setSandboxMode swaps api <-> test URLs and refuses where no testnet exists"),
    # Offline unit tests for the live sandbox harness's credential resolver
    # (test/live/credentials.jl). No keys, no network — it only checks that
    # deep-merge + credential application land on the parent Exchange (incl.
    # composed aliases). The actual authenticated calls live in
    # test/live/sandbox_harness.jl and run only when keys.local.json is present.
    "live_resolver" => Group(String[], 0.2,
        "credential resolver deep-merge + parent-bound application (offline, no keys)"),
    "live_public" => Group(String[], 12.0,
        "live public endpoints (real network, no keys): loadMarkets/fetchTicker/fetchOHLCV/fetchOrderBook"),
]

# The three fixture layers, one group per exchange. Generated rather than
# spelled out so a new fixture exchange is added in exactly one place
# (`FIXTURE_EXCHANGES` in `test/fixtures/static_init_offline.jl`, mirrored by
# `FIXTURE_IDS` above).
#
# Per-exchange costs are proportional to the recorded fixture counts, which
# differ by more than an order of magnitude across the five, so they are listed
# individually rather than assumed equal.
const REQUEST_COSTS  = Dict("binance" => 15.0, "bybit" => 7.0, "okx" => 7.0,
                            "kraken" => 3.0, "coinbase" => 2.5)
const RESPONSE_COSTS = Dict("binance" => 4.5, "bybit" => 4.0, "okx" => 3.0,
                            "kraken" => 1.5, "coinbase" => 1.0)
const UNIFIED_COSTS  = Dict("binance" => 8.0, "bybit" => 7.5, "okx" => 4.5,
                            "kraken" => 3.5, "coinbase" => 2.5)

for id in FIXTURE_IDS
    push!(GROUPS, "request_$id" => Group(["static_drivers"], REQUEST_COSTS[id],
        "static request fixtures for $id (signing, params, URL construction)"))
end
for id in FIXTURE_IDS
    push!(GROUPS, "response_$id" => Group(["static_drivers"], RESPONSE_COSTS[id],
        "static response fixtures for $id (parsers vs recorded output)"))
end
for id in FIXTURE_IDS
    push!(GROUPS, "unified_$id" => Group(["unified_driver", "static_drivers"], UNIFIED_COSTS[id],
        "unified-method tests for $id against recorded responses"))
end

const GROUP_TABLE = Dict(GROUPS)
const GROUP_ORDER = first.(GROUPS)

# Convenience names for whole families, so the common selections stay short.
# `all` is the default. Each expands to groups in `GROUP_ORDER`, deduplicated
# and re-sorted into canonical order before running.
const ALIASES = Dict{String,Vector{String}}(
    "all"      => GROUP_ORDER,
    "base"     => ["base_utils", "base_number", "base_encoding", "base_crypto",
                   "base_datetime", "base_exchange"],
    "request"  => ["request_$id" for id in FIXTURE_IDS],
    "response" => ["response_$id" for id in FIXTURE_IDS],
    "unified"  => ["unified_$id" for id in FIXTURE_IDS],
    "static"   => vcat(["request_$id" for id in FIXTURE_IDS],
                       ["response_$id" for id in FIXTURE_IDS]),
    "fixtures" => vcat(["request_$id" for id in FIXTURE_IDS],
                       ["response_$id" for id in FIXTURE_IDS],
                       ["exchange_stubs"]),
)
for id in FIXTURE_IDS
    ALIASES[id] = ["request_$id", "response_$id", "unified_$id"]
end

"""
    expand_selection(args) -> Vector{String}

Resolve group names and aliases into a canonically ordered, deduplicated list
of groups to run. Errors on an unknown name rather than silently running less
than asked for.
"""
function expand_selection(args::Vector{String})
    wanted = Set{String}()
    for a in args
        if haskey(ALIASES, a)
            union!(wanted, ALIASES[a])
        elseif haskey(GROUP_TABLE, a)
            push!(wanted, a)
        else
            error("unknown test group or alias `$a`.\n" *
                  "Groups:  " * join(GROUP_ORDER, ", ") * "\n" *
                  "Aliases: " * join(sort(collect(keys(ALIASES))), ", ") * "\n" *
                  "Run with --list for a description of each.")
        end
    end
    return [g for g in GROUP_ORDER if g in wanted]
end

function print_group_list()
    println("Test groups (cost excludes the ~25 s fixed startup every process pays):\n")
    width = maximum(length, GROUP_ORDER)
    for name in GROUP_ORDER
        g = GROUP_TABLE[name]
        pad = " "^(width - length(name))
        printstyled("  ", name, pad; bold = true)
        println("  ", lpad(string(round(g.cost; digits = 1)), 5), "s  ", g.summary)
    end
    println("\nAliases:\n")
    awidth = maximum(length, keys(ALIASES))
    for name in sort(collect(keys(ALIASES)))
        pad = " "^(awidth - length(name))
        printstyled("  ", name, pad; bold = true)
        println("  ", join(ALIASES[name], " "))
    end
    println("""

    Examples:
      julia --project test/runtests.jl --jobs 4        # whole suite, sharded
      julia --project test/runtests.jl kraken          # kraken's three layers
      julia --project test/runtests.jl base ws         # the offline base tests
    """)
end

# ---------------------------------------------------------------------------
# Argument parsing
#
# Deliberately ahead of `include("setup.jl")`: `--list` and the parallel parent
# must not pay the 25-second preamble, and the parent in particular has no use
# for it — it only spawns workers.
# ---------------------------------------------------------------------------

function parse_jobs(v)
    n = tryparse(Int, v)
    n === nothing && error("--jobs expects an integer, got `$v`")
    n >= 1 || error("--jobs must be at least 1, got $n")
    return n
end

"""
    parse_args(argv) -> (jobs, groups)

Split the command line into a process count and a canonically ordered group
list. `--list` prints the table and exits from here, before anything expensive
has been loaded.
"""
function parse_args(argv)
    jobs = 1
    selection = String[]
    i = 1
    while i <= length(argv)
        a = argv[i]
        if a == "--list" || a == "-l"
            print_group_list()
            exit(0)
        elseif a == "--jobs" || a == "-j"
            i < length(argv) || error("--jobs needs a number, e.g. `--jobs 4`")
            jobs = parse_jobs(argv[i + 1])
            i += 1
        elseif startswith(a, "--jobs=")
            jobs = parse_jobs(split(a, '='; limit = 2)[2])
        elseif startswith(a, "-")
            error("unknown option `$a`; supported: --jobs N, --list")
        else
            push!(selection, a)
        end
        i += 1
    end
    return jobs, expand_selection(isempty(selection) ? ["all"] : selection)
end

const JOBS, SELECTED = parse_args(ARGS)

# ---------------------------------------------------------------------------
# Parallel path
#
# Each worker is a plain recursive invocation of this file with an explicit
# group list and `--jobs 1`, so a sharded run executes exactly the same code as
# a sequential one — there is no separate parallel code path to keep in sync.
#
# Shards are balanced by the cost column using longest-processing-time-first,
# which is the standard greedy makespan heuristic and is good enough here: the
# fixed startup dominates any residual imbalance.
#
# Worker output is buffered to a file and replayed in shard order once
# everything finishes. Interleaving live output from several processes would
# scramble the `Test Summary:` blocks, which are two-line and order-dependent.
# ---------------------------------------------------------------------------

"""
    balance_shards(groups, n) -> Vector{Vector{String}}

Split `groups` into at most `n` shards of roughly equal cost, heaviest first.
Dependencies are not considered: they are definition-only loads that each shard
resolves for itself, so no shard can depend on another's work.
"""
function balance_shards(groups::Vector{String}, n::Int)
    n = min(n, length(groups))
    n <= 1 && return [groups]
    shards = [String[] for _ in 1:n]
    loads = zeros(Float64, n)
    for name in sort(groups; by = g -> -GROUP_TABLE[g].cost)
        i = argmin(loads)
        push!(shards[i], name)
        loads[i] += GROUP_TABLE[name].cost
    end
    # Restore canonical order inside each shard so its output reads normally.
    for s in shards
        sort!(s; by = g -> findfirst(==(g), GROUP_ORDER))
    end
    return filter(!isempty, shards)
end

function run_sharded(groups::Vector{String}, n::Int)
    shards = balance_shards(groups, n)
    println("Running $(length(groups)) group(s) across $(length(shards)) process(es).")
    for (i, s) in enumerate(shards)
        cost = sum(GROUP_TABLE[g].cost for g in s)
        println("  shard $i (~$(round(cost; digits = 1))s): ", join(s, " "))
    end
    println()
    logs = [tempname() * ".log" for _ in shards]
    procs = map(zip(shards, logs)) do (shard, log)
        cmd = `$(Base.julia_cmd()) --project=$(Base.active_project()) $(@__FILE__) $shard`
        open(log, "w") do io
            run(pipeline(ignorestatus(cmd); stdout = io, stderr = io); wait = false)
        end
    end
    procs = collect(procs)
    # `wait` on each in turn: they run concurrently, so total time is the
    # slowest shard, not the sum.
    for p in procs
        wait(p)
    end
    failed = Int[]
    for (i, (p, log)) in enumerate(zip(procs, logs))
        println("=== shard $i (", join(shards[i], " "), ") ===")
        print(read(log, String))
        rm(log; force = true)
        success(p) || push!(failed, i)
    end
    if !isempty(failed)
        println()
        error("shard(s) $(join(failed, ", ")) failed; see their output above")
    end
    println("\nAll $(length(shards)) shard(s) passed.")
end

if JOBS > 1 && length(SELECTED) > 1
    run_sharded(SELECTED, JOBS)
    exit(0)
end

# ---------------------------------------------------------------------------
# Sequential path
# ---------------------------------------------------------------------------

include("setup.jl")

const _loaded = Set{String}()
function run_group(name::String)
    name in _loaded && return
    push!(_loaded, name)
    for dep in GROUP_TABLE[name].deps
        run_group(dep)
    end
    include(joinpath(@__DIR__, "groups", name * ".jl"))
end

for name in SELECTED
    run_group(name)
end
