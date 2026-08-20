# WebSocket base classes (Cache, OrderBookSide, OrderBook) ported from
# `ts/src/base/ws/{Cache,OrderBookSide,OrderBook}.ts`. These are the data
# structures exercised by the offline Pro WS base tests (test.cache.jl,
# test.orderBook.jl). Only the pure data-structure behaviour is ported — no
# live WebSocket transport is involved, so this file carries no network code.
#
# The structures are implemented as subtypes of `AbstractVector{Any}` so that
# `length`, indexing and mutation behave like JS arrays, and so that the
# transpiled test `equals(a, b)` helper (which does
#   for (prop, _) in a; if a[prop] != b[prop] ...; end
# i.e. `get(a, Symbol(prop), nothing)` with numeric-string keys) works against
# both these caches and plain Julia vectors (the existing
# `Base.get(::AbstractVector, ::Symbol, default)` shim in functions.jl already
# handles numeric-string keys on plain vectors).

abstract type WsArray <: AbstractVector{Any} end

# Shared accessors for the WsArray family. `data` holds the rows; `hashmap`
# mirrors the JS `hashmap` property used by the symbol/id-keyed caches.
Base.size(a::WsArray) = (length(a.data),)
Base.length(a::WsArray) = length(a.data)
Base.getindex(a::WsArray, i::Int) = a.data[i]
Base.setindex!(a::WsArray, v, i::Int) = (a.data[i] = v)
Base.push!(a::WsArray, v) = push!(a.data, v)

# Iteration yields (string-index, value) pairs so `for (prop, _) in a`
# binds `prop` to "0", "1", ... exactly like JS `for (const prop in array)`.
function Base.iterate(a::WsArray)
    isempty(a.data) && return nothing
    return ((string(0), a.data[1]), 1)
end
function Base.iterate(a::WsArray, i::Int)
    i > length(a.data) && return nothing
    return ((string(i - 1), a.data[i]), i + 1)
end
# Numeric-string key reads an element; "hashmap" returns the side hashmap.
function Base.get(a::WsArray, k::Symbol, default)
    if k === :hashmap
        return a.hashmap
    end
    s = string(k)
    m = match(r"^\d+$", s)
    if m !== nothing
        idx = parse(Int, s) + 1
        return idx <= length(a.data) ? a.data[idx] : default
    end
    return get(a.hashmap, k, default)
end

# JS object keys are always strings, so the transpiled tests read cache
# hashmaps with `get(hashmap, Symbol("BTC/USDT"), nothing)`. Normalise every
# string-ish hashmap key to a Symbol so those reads resolve; non-string keys
# (the Int timestamps used by ArrayCacheByTimestamp) are kept as-is.
_wskey(k) = k isa AbstractString ? Symbol(k) : k

# Copy every own property of `src` onto `dst` in place, mirroring the JS
# `for (const prop in item) reference[prop] = item[prop]`. `item` may be an
# object (merge by key) or an array (OHLCV rows — merge by position).
function _wsmerge!(dst, src)
    if src isa AbstractVector || src isa WsArray
        for i in 1:length(src)
            if i <= length(dst)
                dst[i] = src[i]
            else
                push!(dst, src[i])
            end
        end
    else
        for k in objectKeys(src)
            dst[Symbol(k)] = get(src, Symbol(k), nothing)
        end
    end
    return dst
end

# --- Cache family -----------------------------------------------------------
# BaseCache mirrors TS `class BaseCache extends Array` with an invisible
# `maxSize` property.
mutable struct BaseCache <: WsArray
    data::Vector{Any}
    maxSize::Union{Int, Nothing}
    hashmap::Dict{Any, Any}
    BaseCache(maxSize::Union{Int, Nothing} = nothing) = new(Any[], maxSize, Dict{Symbol, Any}())
end
function clear(cache::BaseCache)
    empty!(cache.data)
    return nothing
end
function clear(cache::WsArray)
    empty!(cache.data)
    if hasfield(typeof(cache), :hashmap)
        empty!(cache.hashmap)
    end
    return nothing
end

# ArrayCache — simple append/replace queue.
mutable struct ArrayCache <: WsArray
    data::Vector{Any}
    maxSize::Union{Int, Nothing}
    hashmap::Dict{Any, Any}
    nestedNewUpdatesBySymbol::Bool
    newUpdatesBySymbol::Dict{Any, Any}
    clearUpdatesBySymbol::Dict{Any, Any}
    allNewUpdates::Int
    clearAllUpdates::Bool
    ArrayCache(maxSize::Union{Int, Nothing} = nothing) = new(
        Any[], maxSize, Dict{Symbol, Any}(),
        false, Dict{Any, Any}(), Dict{Any, Any}(), 0, false)
end
function append(cache::ArrayCache, item)
    if cache.maxSize !== nothing && cache.maxSize != 0 && length(cache.data) == cache.maxSize
        popfirst!(cache.data)
    end
    push!(cache.data, item)
    if cache.clearAllUpdates
        cache.clearAllUpdates = false
        cache.clearUpdatesBySymbol = Dict{Any, Any}()
        cache.allNewUpdates = 0
        cache.newUpdatesBySymbol = Dict{Any, Any}()
    end
    sym = get(item, Symbol("symbol"), nothing)
    if sym !== nothing
        if cache.clearUpdatesBySymbol != nothing && get(cache.clearUpdatesBySymbol, sym, false) == true
            cache.clearUpdatesBySymbol[sym] = false
            cache.newUpdatesBySymbol[sym] = 0
        end
        prev = get(cache.newUpdatesBySymbol, sym, 0)
        cache.newUpdatesBySymbol[sym] = prev + 1
        cache.allNewUpdates = cache.allNewUpdates + 1
    end
    return nothing
end
# Shared `getLimit` for the three symbol-keyed caches (ArrayCache and its two
# subclasses), mirroring `ArrayCache.getLimit` in ts/src/base/ws/Cache.ts.
# When `nestedNewUpdatesBySymbol` is set the per-symbol counter is a Set of ids
# (or sides) rather than a plain integer, so its cardinality is the count.
# `Base.min` is qualified because `Ccxt` also re-exports a `min` from `PreciseArith`.
function _getLimitBySymbol(cache, symbol, limit)
    local newUpdatesValue
    if symbol === nothing
        newUpdatesValue = cache.allNewUpdates
        cache.clearAllUpdates = true
    else
        newUpdatesValue = get(cache.newUpdatesBySymbol, symbol, nothing)
        if newUpdatesValue !== nothing && cache.nestedNewUpdatesBySymbol
            newUpdatesValue = length(newUpdatesValue)
        end
        cache.clearUpdatesBySymbol[symbol] = true
    end
    if newUpdatesValue === nothing
        return limit
    elseif limit !== nothing
        return Base.min(newUpdatesValue, limit)
    else
        return newUpdatesValue
    end
end
function getLimit(cache::ArrayCache, symbol, limit)
    return _getLimitBySymbol(cache, symbol, limit)
end

# ArrayCacheByTimestamp — keyed by the first element of each row.
mutable struct ArrayCacheByTimestamp <: WsArray
    data::Vector{Any}
    maxSize::Union{Int, Nothing}
    hashmap::Dict{Any, Any}
    sizeTracker::Set{Any}
    newUpdates::Int
    clearUpdates::Bool
    ArrayCacheByTimestamp(maxSize::Union{Int, Nothing} = nothing) = new(
        Any[], maxSize, Dict{Symbol, Any}(), Set{Any}(), 0, false)
end
function append(cache::ArrayCacheByTimestamp, item)
    key = item[1]
    if haskey(cache.hashmap, key)
        reference = cache.hashmap[key]
        if reference !== item
            _wsmerge!(reference, item)
        end
    else
        cache.hashmap[key] = item
        if cache.maxSize !== nothing && length(cache.data) == cache.maxSize
            deleted = popfirst!(cache.data)
            delete!(cache.hashmap, deleted[1])
        end
        push!(cache.data, item)
    end
    if cache.clearUpdates
        cache.clearUpdates = false
        empty!(cache.sizeTracker)
    end
    push!(cache.sizeTracker, key)
    cache.newUpdates = length(cache.sizeTracker)
    return nothing
end
function getLimit(cache::ArrayCacheByTimestamp, symbol, limit)
    cache.clearUpdates = true
    if limit === nothing
        return cache.newUpdates
    end
    return Base.min(cache.newUpdates, limit)
end

# ArrayCacheBySymbolById — keyed by symbol then id; re-appending an existing
# (symbol, id) merges in place and moves the row to the end of the array.
mutable struct ArrayCacheBySymbolById <: WsArray
    data::Vector{Any}
    maxSize::Union{Int, Nothing}
    hashmap::Dict{Any, Any}
    nestedNewUpdatesBySymbol::Bool
    newUpdatesBySymbol::Dict{Any, Any}
    clearUpdatesBySymbol::Dict{Any, Any}
    allNewUpdates::Int
    clearAllUpdates::Bool
    ArrayCacheBySymbolById(maxSize::Union{Int, Nothing} = nothing) = new(
        Any[], maxSize, Dict{Symbol, Any}(),
        true, Dict{Any, Any}(), Dict{Any, Any}(), 0, false)
end
function append(cache::ArrayCacheBySymbolById, item)
    sym = get(item, Symbol("symbol"), nothing)
    id = get(item, Symbol("id"), nothing)
    # `*Key` variants address the hashmap (Symbol-keyed, mirroring JS string
    # object keys); the raw values stay for comparisons against row contents.
    byId = get!(cache.hashmap, _wskey(sym), Dict{Any, Any}())
    idKey = _wskey(id)
    if haskey(byId, idKey)
        reference = byId[idKey]
        if reference !== item
            _wsmerge!(reference, item)
        end
        item = reference
        idx = nothing
        for i in 1:length(cache.data)
            if get(cache.data[i], Symbol("id"), nothing) == id
                idx = i
                break
            end
        end
        if idx !== nothing
            deleteat!(cache.data, idx)
        end
    else
        byId[idKey] = item
    end
    if cache.maxSize !== nothing && cache.maxSize != 0 && length(cache.data) == cache.maxSize
        deleted = popfirst!(cache.data)
        symDel = _wskey(get(deleted, Symbol("symbol"), nothing))
        idDel = _wskey(get(deleted, Symbol("id"), nothing))
        if haskey(cache.hashmap, symDel)
            delete!(cache.hashmap[symDel], idDel)
        end
    end
    push!(cache.data, item)
    if cache.clearAllUpdates
        cache.clearAllUpdates = false
        cache.clearUpdatesBySymbol = Dict{Any, Any}()
        cache.allNewUpdates = 0
        cache.newUpdatesBySymbol = Dict{Any, Any}()
    end
    if !haskey(cache.newUpdatesBySymbol, sym)
        cache.newUpdatesBySymbol[sym] = Set{Any}()
    end
    if get(cache.clearUpdatesBySymbol, sym, false) == true
        cache.clearUpdatesBySymbol[sym] = false
        empty!(cache.newUpdatesBySymbol[sym])
    end
    before = length(cache.newUpdatesBySymbol[sym])
    push!(cache.newUpdatesBySymbol[sym], id)
    after = length(cache.newUpdatesBySymbol[sym])
    cache.allNewUpdates = cache.allNewUpdates + (after - before)
    return nothing
end
function getLimit(cache::ArrayCacheBySymbolById, symbol, limit)
    return _getLimitBySymbol(cache, symbol, limit)
end

# ArrayCacheBySymbolBySide — keyed by symbol then side.
mutable struct ArrayCacheBySymbolBySide <: WsArray
    data::Vector{Any}
    maxSize::Union{Int, Nothing}
    hashmap::Dict{Any, Any}
    nestedNewUpdatesBySymbol::Bool
    newUpdatesBySymbol::Dict{Any, Any}
    clearUpdatesBySymbol::Dict{Any, Any}
    allNewUpdates::Int
    clearAllUpdates::Bool
    ArrayCacheBySymbolBySide() = new(
        Any[], nothing, Dict{Symbol, Any}(),
        true, Dict{Any, Any}(), Dict{Any, Any}(), 0, false)
end
function append(cache::ArrayCacheBySymbolBySide, item)
    sym = get(item, Symbol("symbol"), nothing)
    side = get(item, Symbol("side"), nothing)
    # `sideKey` addresses the hashmap (Symbol-keyed, mirroring JS string object
    # keys); `side` itself stays raw so it still compares equal to row contents.
    bySide = get!(cache.hashmap, _wskey(sym), Dict{Any, Any}())
    sideKey = _wskey(side)
    if haskey(bySide, sideKey)
        reference = bySide[sideKey]
        if reference !== item
            _wsmerge!(reference, item)
        end
        item = reference
        idx = nothing
        for i in 1:length(cache.data)
            d = cache.data[i]
            if get(d, Symbol("symbol"), nothing) == sym && get(d, Symbol("side"), nothing) == side
                idx = i
                break
            end
        end
        if idx !== nothing
            deleteat!(cache.data, idx)
        end
    else
        bySide[sideKey] = item
    end
    push!(cache.data, item)
    if cache.clearAllUpdates
        cache.clearAllUpdates = false
        cache.clearUpdatesBySymbol = Dict{Any, Any}()
        cache.allNewUpdates = 0
        cache.newUpdatesBySymbol = Dict{Any, Any}()
    end
    if !haskey(cache.newUpdatesBySymbol, sym)
        cache.newUpdatesBySymbol[sym] = Set{Any}()
    end
    if get(cache.clearUpdatesBySymbol, sym, false) == true
        cache.clearUpdatesBySymbol[sym] = false
        empty!(cache.newUpdatesBySymbol[sym])
    end
    before = length(cache.newUpdatesBySymbol[sym])
    push!(cache.newUpdatesBySymbol[sym], side)
    after = length(cache.newUpdatesBySymbol[sym])
    cache.allNewUpdates = cache.allNewUpdates + (after - before)
    return nothing
end
function getLimit(cache::ArrayCacheBySymbolBySide, symbol, limit)
    return _getLimitBySymbol(cache, symbol, limit)
end

# --- OrderBookSide family ---------------------------------------------------
# OrderBookSide is a sorted array of [price, size] (or [price, size, extra])
# rows kept in ascending/descending price order depending on `side`. It is
# implemented directly on a `data` vector with a parallel `index` vector of
# price keys, mirroring the TS `storeArray` bisect/insert/delete logic.
mutable struct OrderBookSide <: WsArray
    data::Vector{Any}
    index::Vector{Float64}
    depth::Int
    side::Bool
    hashmap::Dict{Any, Any}
    OrderBookSide(deltas::Any = Any[], depth::Union{Int, Nothing} = nothing; side::Bool = false) = begin
        d = depth === nothing ? typemax(Int) : Int(depth)
        o = new(Any[], Float64[], d, side, Dict{Symbol, Any}())
        for delta in deltas
            storeArray(o, collect(Any, delta))
        end
        o
    end
end
function bisectLeft(arr::Vector{Float64}, x::Float64)
    low = 1
    high = length(arr)
    while low <= high
        mid = (low + high) ÷ 2
        if arr[mid] - x < 0
            low = mid + 1
        else
            high = mid - 1
        end
    end
    return low
end
function storeArray(self::OrderBookSide, delta)
    price = delta[1]
    size = delta[2]
    index_price = self.side ? -Float64(price) : Float64(price)
    idx = bisectLeft(self.index, index_price)
    if size != 0
        if idx <= length(self.index) && self.index[idx] == index_price
            self.data[idx][2] = size
        else
            insert!(self.index, idx, index_price)
            insert!(self.data, idx, delta)
        end
    elseif idx <= length(self.index) && self.index[idx] == index_price
        deleteat!(self.index, idx)
        deleteat!(self.data, idx)
    end
    return nothing
end
store(self::OrderBookSide, price, size) = storeArray(self, Any[price, size])
function limit(self::OrderBookSide)
    if length(self.data) > self.depth
        # mark trimmed index slots as +Inf and truncate both arrays
        for i in (self.depth + 1):length(self.index)
            self.index[i] = Inf
        end
        resize!(self.data, self.depth)
        resize!(self.index, self.depth)
    end
    return self
end

mutable struct Asks <: WsArray
    data::Vector{Any}; index::Vector{Float64}; depth::Int; side::Bool; hashmap::Dict{Any, Any}
    Asks(deltas::Any = Any[], depth::Union{Int, Nothing} = nothing) =
        _new_side(Asks, deltas, depth, false)
    Asks(d::Vector{Any}, i::Vector{Float64}, dp::Int, s::Bool, h::Dict{Symbol, Any}) = new(d, i, dp, s, h)
end
mutable struct Bids <: WsArray
    data::Vector{Any}; index::Vector{Float64}; depth::Int; side::Bool; hashmap::Dict{Any, Any}
    Bids(deltas::Any = Any[], depth::Union{Int, Nothing} = nothing) =
        _new_side(Bids, deltas, depth, true)
    Bids(d::Vector{Any}, i::Vector{Float64}, dp::Int, s::Bool, h::Dict{Symbol, Any}) = new(d, i, dp, s, h)
end
mutable struct CountedAsks <: WsArray
    data::Vector{Any}; index::Vector{Float64}; depth::Int; side::Bool; hashmap::Dict{Any, Any}
    CountedAsks(deltas::Any = Any[], depth::Union{Int, Nothing} = nothing) =
        _new_side(CountedAsks, deltas, depth, false)
    CountedAsks(d::Vector{Any}, i::Vector{Float64}, dp::Int, s::Bool, h::Dict{Symbol, Any}) = new(d, i, dp, s, h)
end
mutable struct CountedBids <: WsArray
    data::Vector{Any}; index::Vector{Float64}; depth::Int; side::Bool; hashmap::Dict{Any, Any}
    CountedBids(deltas::Any = Any[], depth::Union{Int, Nothing} = nothing) =
        _new_side(CountedBids, deltas, depth, true)
    CountedBids(d::Vector{Any}, i::Vector{Float64}, dp::Int, s::Bool, h::Dict{Symbol, Any}) = new(d, i, dp, s, h)
end
mutable struct IndexedAsks <: WsArray
    data::Vector{Any}; index::Vector{Float64}; depth::Int; side::Bool; hashmap::Dict{Any, Any}
    IndexedAsks(deltas::Any = Any[], depth::Union{Int, Nothing} = nothing) =
        _new_side(IndexedAsks, deltas, depth, false)
    IndexedAsks(d::Vector{Any}, i::Vector{Float64}, dp::Int, s::Bool, h::Dict{Symbol, Any}) = new(d, i, dp, s, h)
end
mutable struct IndexedBids <: WsArray
    data::Vector{Any}; index::Vector{Float64}; depth::Int; side::Bool; hashmap::Dict{Any, Any}
    IndexedBids(deltas::Any = Any[], depth::Union{Int, Nothing} = nothing) =
        _new_side(IndexedBids, deltas, depth, true)
    IndexedBids(d::Vector{Any}, i::Vector{Float64}, dp::Int, s::Bool, h::Dict{Symbol, Any}) = new(d, i, dp, s, h)
end

# Build a side instance and replay its initial deltas through `storeArray`
# (which dispatches to the right subclass method).
function _new_side(::Type{T}, deltas::Any, depth::Union{Int, Nothing}, side::Bool) where T <: WsArray
    inst = T(Any[], Float64[], depth === nothing ? typemax(Int) : Int(depth), side, Dict{Symbol, Any}())
    for delta in deltas
        storeArray(inst, collect(Any, delta))
    end
    return inst
end

# Store/limit wiring for the side subclasses (they share OrderBookSide's logic
# but keep their own type so `OrderBook` can wrap plain arrays into the right
# subclass). We forward to a private OrderBookSide-shaped view.
for T in (:Asks, :Bids, :CountedAsks, :CountedBids, :IndexedAsks, :IndexedBids)
    @eval begin
        function storeArray(self::$T, delta)
            price = delta[1]
            size = delta[2]
            index_price = self.side ? -Float64(price) : Float64(price)
            idx = bisectLeft(self.index, index_price)
            if size != 0
                if idx <= length(self.index) && self.index[idx] == index_price
                    self.data[idx][2] = size
                else
                    insert!(self.index, idx, index_price)
                    insert!(self.data, idx, delta)
                end
            elseif idx <= length(self.index) && self.index[idx] == index_price
                deleteat!(self.index, idx)
                deleteat!(self.data, idx)
            end
            return nothing
        end
        store(self::$T, price, size) = storeArray(self, Any[price, size])
        function limit(self::$T)
            if length(self.data) > self.depth
                for i in (self.depth + 1):length(self.index)
                    self.index[i] = Inf
                end
                resize!(self.data, self.depth)
                resize!(self.index, self.depth)
            end
            return self
        end
    end
end

# CountedOrderBookSide adds a count (3rd element) gate: a row is stored only
# when both size and count are truthy; otherwise an existing price level is
# deleted.
for T in (:CountedAsks, :CountedBids)
    @eval begin
        function storeArray(self::$T, delta)
            price = delta[1]
            size = delta[2]
            count = length(delta) >= 3 ? delta[3] : 0
            index_price = self.side ? -Float64(price) : Float64(price)
            idx = bisectLeft(self.index, index_price)
            if size != 0 && count != 0
                if idx <= length(self.index) && self.index[idx] == index_price
                    self.data[idx][2] = size
                    self.data[idx][3] = count
                else
                    insert!(self.index, idx, index_price)
                    insert!(self.data, idx, delta)
                end
            elseif idx <= length(self.index) && self.index[idx] == index_price
                deleteat!(self.index, idx)
                deleteat!(self.data, idx)
            end
            return nothing
        end
    end
end

# IndexedOrderBookSide keys rows by id (3rd element); price moves are tracked.
# Locate the row carrying `id`, starting the scan at the bisect position for
# `price` and advancing (several ids can share a price level), mirroring the
# `while (this[index][2] !== id) index++` walk in the TS implementation.
function _indexOfId(self, price, id)
    # `bisectLeft` here already returns a 1-based insertion point.
    i = bisectLeft(self.index, price)
    i < 1 && (i = 1)
    while i <= length(self.data)
        if self.data[i][3] == id
            return i
        end
        i += 1
    end
    return nothing
end

for T in (:IndexedAsks, :IndexedBids)
    @eval begin
        function storeArray(self::$T, delta)
            price = delta[1]
            size = delta[2]
            id = delta[3]
            index_price = price === nothing ? nothing : (self.side ? -Float64(price) : Float64(price))
            if size !== nothing && size != 0
                if haskey(self.hashmap, id)
                    old_price = self.hashmap[id]
                    # `index_price || old_price` in TS — a missing or zero
                    # price means "keep the level, only the size changed".
                    if index_price === nothing || index_price == 0.0
                        index_price = old_price
                    end
                    delta[1] = Base.abs(index_price)
                    if index_price == old_price
                        idx = _indexOfId(self, index_price, id)
                        if idx !== nothing
                            self.index[idx] = index_price
                            self.data[idx] = delta
                        end
                        return nothing
                    else
                        # the order moved to a different price: drop the old level
                        old_idx = _indexOfId(self, old_price, id)
                        if old_idx !== nothing
                            deleteat!(self.index, old_idx)
                            deleteat!(self.data, old_idx)
                        end
                    end
                end
                self.hashmap[id] = index_price
                idx = bisectLeft(self.index, index_price)
                # ties on price are broken by id, so the ordering is stable
                while idx <= length(self.data) && self.index[idx] == index_price && self.data[idx][3] < id
                    idx += 1
                end
                insert!(self.index, idx, index_price)
                insert!(self.data, idx, delta)
            elseif haskey(self.hashmap, id)
                # zero size deletes the order
                old_price = self.hashmap[id]
                idx = _indexOfId(self, old_price, id)
                if idx !== nothing
                    deleteat!(self.index, idx)
                    deleteat!(self.data, idx)
                end
                delete!(self.hashmap, id)
            end
            return nothing
        end
    end
end

# --- OrderBook family -------------------------------------------------------
# OrderBook mirrors TS `class OrderBook` — a Dict-like holding bids/asks
# (OrderBookSide instances) plus timestamp/datetime/nonce/symbol. The `cache`
# property is intentionally NOT stored, because the transpiled `equals` helper
# skips `prop == "cache"` via a string comparison (which only matches when
# `prop` is a String); omitting it keeps the dict/array `equals` symmetric
# with the TS target objects (which also lack `cache`).
mutable struct OrderBook <: AbstractDict{Symbol, Any}
    dict::Dict{Symbol, Any}
    OrderBook(snapshot::Any = Dict{Symbol, Any}(), depth::Union{Int, Nothing} = nothing) = begin
        d = Dict{Symbol, Any}()
        depthVal = depth === nothing ? typemax(Int) : Int(depth)
        defaults = Dict{Symbol, Any}(
            Symbol("bids") => Any[],
            Symbol("asks") => Any[],
            Symbol("timestamp") => nothing,
            Symbol("datetime") => nothing,
            Symbol("nonce") => nothing,
            Symbol("symbol") => nothing,
        )
        for (k, v) in defaults
            d[k] = v
        end
        for (k, v) in snapshot
            d[Symbol(k)] = v
        end
        # wrap plain arrays in Asks/Bids
        if isa(d[Symbol("bids")], AbstractArray)
            d[Symbol("bids")] = Bids(d[Symbol("bids")], depthVal)
        end
        if isa(d[Symbol("asks")], AbstractArray)
            d[Symbol("asks")] = Asks(d[Symbol("asks")], depthVal)
        end
        if d[Symbol("timestamp")] !== nothing
            d[Symbol("datetime")] = iso8601(d[Symbol("timestamp")])
        end
        new(d)
    end
end
Base.get(o::OrderBook, k, default) = get(o.dict, k, default)
Base.getindex(o::OrderBook, k) = o.dict[k]
Base.setindex!(o::OrderBook, v, k) = (o.dict[k] = v)
Base.iterate(o::OrderBook) = iterate(o.dict)
Base.iterate(o::OrderBook, s) = iterate(o.dict, s)
Base.length(o::OrderBook) = length(o.dict)
Base.keys(o::OrderBook) = keys(o.dict)
Base.haskey(o::OrderBook, k) = haskey(o.dict, k)

mutable struct CountedOrderBook <: AbstractDict{Symbol, Any}
    dict::Dict{Symbol, Any}
    CountedOrderBook(snapshot::Any = Dict{Symbol, Any}(), depth::Union{Int, Nothing} = nothing) = begin
        d = Dict{Symbol, Any}()
        depthVal = depth === nothing ? typemax(Int) : Int(depth)
        defaults = Dict{Symbol, Any}(
            Symbol("bids") => Any[], Symbol("asks") => Any[],
            Symbol("timestamp") => nothing, Symbol("datetime") => nothing,
            Symbol("nonce") => nothing, Symbol("symbol") => nothing)
        for (k, v) in defaults
            d[k] = v
        end
        for (k, v) in snapshot
            d[Symbol(k)] = v
        end
        if isa(d[Symbol("bids")], AbstractArray)
            d[Symbol("bids")] = CountedBids(d[Symbol("bids")], depthVal)
        end
        if isa(d[Symbol("asks")], AbstractArray)
            d[Symbol("asks")] = CountedAsks(d[Symbol("asks")], depthVal)
        end
        if d[Symbol("timestamp")] !== nothing
            d[Symbol("datetime")] = iso8601(d[Symbol("timestamp")])
        end
        new(d)
    end
end
Base.get(o::CountedOrderBook, k, default) = get(o.dict, k, default)
Base.getindex(o::CountedOrderBook, k) = o.dict[k]
Base.setindex!(o::CountedOrderBook, v, k) = (o.dict[k] = v)
Base.iterate(o::CountedOrderBook) = iterate(o.dict)
Base.iterate(o::CountedOrderBook, s) = iterate(o.dict, s)
Base.length(o::CountedOrderBook) = length(o.dict)
Base.keys(o::CountedOrderBook) = keys(o.dict)
Base.haskey(o::CountedOrderBook, k) = haskey(o.dict, k)

mutable struct IndexedOrderBook <: AbstractDict{Symbol, Any}
    dict::Dict{Symbol, Any}
    IndexedOrderBook(snapshot::Any = Dict{Symbol, Any}(), depth::Union{Int, Nothing} = nothing) = begin
        d = Dict{Symbol, Any}()
        depthVal = depth === nothing ? typemax(Int) : Int(depth)
        defaults = Dict{Symbol, Any}(
            Symbol("bids") => Any[], Symbol("asks") => Any[],
            Symbol("timestamp") => nothing, Symbol("datetime") => nothing,
            Symbol("nonce") => nothing, Symbol("symbol") => nothing)
        for (k, v) in defaults
            d[k] = v
        end
        for (k, v) in snapshot
            d[Symbol(k)] = v
        end
        if isa(d[Symbol("bids")], AbstractArray)
            d[Symbol("bids")] = IndexedBids(d[Symbol("bids")], depthVal)
        end
        if isa(d[Symbol("asks")], AbstractArray)
            d[Symbol("asks")] = IndexedAsks(d[Symbol("asks")], depthVal)
        end
        if d[Symbol("timestamp")] !== nothing
            d[Symbol("datetime")] = iso8601(d[Symbol("timestamp")])
        end
        new(d)
    end
end
Base.get(o::IndexedOrderBook, k, default) = get(o.dict, k, default)
Base.getindex(o::IndexedOrderBook, k) = o.dict[k]
Base.setindex!(o::IndexedOrderBook, v, k) = (o.dict[k] = v)
Base.iterate(o::IndexedOrderBook) = iterate(o.dict)
Base.iterate(o::IndexedOrderBook, s) = iterate(o.dict, s)
Base.length(o::IndexedOrderBook) = length(o.dict)
Base.keys(o::IndexedOrderBook) = keys(o.dict)
Base.haskey(o::IndexedOrderBook, k) = haskey(o.dict, k)

function limit(book::Union{OrderBook, CountedOrderBook, IndexedOrderBook})
    limit(book.dict[Symbol("asks")])
    limit(book.dict[Symbol("bids")])
    return book
end
function reset(book::Union{OrderBook, CountedOrderBook, IndexedOrderBook}, snapshot::Any = Dict{Symbol, Any}())
    asks = book.dict[Symbol("asks")]
    bids = book.dict[Symbol("bids")]
    for i in length(asks.data):-1:1
        deleteat!(asks.data, i)
    end
    empty!(asks.index)
    for i in length(bids.data):-1:1
        deleteat!(bids.data, i)
    end
    empty!(bids.index)
    if haskey(snapshot, Symbol("asks"))
        for row in snapshot[Symbol("asks")]
            storeArray(asks, collect(Any, row))
        end
    end
    if haskey(snapshot, Symbol("bids"))
        for row in snapshot[Symbol("bids")]
            storeArray(bids, collect(Any, row))
        end
    end
    book.dict[Symbol("nonce")] = get(snapshot, Symbol("nonce"), nothing)
    book.dict[Symbol("timestamp")] = get(snapshot, Symbol("timestamp"), nothing)
    if book.dict[Symbol("timestamp")] !== nothing
        book.dict[Symbol("datetime")] = iso8601(book.dict[Symbol("timestamp")])
    end
    book.dict[Symbol("symbol")] = get(snapshot, Symbol("symbol"), nothing)
    return book
end

# Shared `equals` helper matching the transpiled test semantics. The TS source
# iterates `for (const prop in a)` and compares `a[prop]` with `b[prop]`; the
# Julia transpiler turns this into `for (prop, _) in a` followed by
# `get(a, Symbol(prop), nothing)`. Plain Julia vectors only support numeric
# `getindex`, so we special-case Vector rows here (mirroring the Python port,
# which compares element-by-element). This is the canonical equality used by
# both test.cache.jl and test.orderBook.jl.
function ws_equals(a, b)
    if a isa AbstractVector || a isa WsArray
        if length(a) != length(b)
            return false
        end
        for i in 1:length(a)
            if !ws_equals(a[i], b[i])
                return false
            end
        end
        return true
    elseif isa(a, AbstractDict)
        if length(a) != length(b)
            return false
        end
        for (prop, _) in a
            if prop == "cache" || prop == :cache
                continue
            end
            if !ws_equals(get(a, Symbol(prop), nothing), get(b, Symbol(prop), nothing))
                return false
            end
        end
        return true
    else
        return a == b
    end
end

# --- Future ------------------------------------------------------------------
#
# Port of `ts/src/base/ws/Future.ts`. A `Future` is a promise that the producer
# settles explicitly (`resolve`/`reject`/`cancel`) rather than by running a body,
# which is how every WS subscription hands a message to the awaiting caller.
#
# The JS original returns a `Promise` decorated with `resolve`, `reject` and a
# synchronous `subscribe`. Julia has no promise type, so the state is held in a
# mutable struct guarded by a `Condition`: waiters block in `Base.fetch`, and a
# settle wakes all of them in the same task switch. `subscribe` keeps the
# synchronous-notification path the TS version added to avoid an extra microtask
# hop per delivered message, and returns an unsubscribe closure so a repeatedly
# raced future does not accumulate dead handlers.
#
# Three settled states mirror the three ways a subscription ends, matching the
# Python port (`python/ccxt/async_support/base/ws/future.py`), which the Python
# WS suite exercises through `test_future.py`:
#   :pending -> :fulfilled (resolve) | :rejected (reject) | :cancelled (cancel)
# Settling is idempotent — the first call wins and later ones are ignored, so a
# race can safely settle its losers.
mutable struct Future
    state::Symbol
    value::Any
    handlers::Vector{Any}
    cond::Threads.Condition
    Future() = new(:pending, nothing, Any[], Threads.Condition())
end

"""
    CancelledError

Raised by `Base.fetch` on a cancelled `Future`, mirroring Python's
`asyncio.CancelledError` (the exception `test_future.py` asserts on).
"""
struct CancelledError <: Exception end
Base.showerror(io::IO, ::CancelledError) = print(io, "CancelledError")

isPending(f::Future) = f.state === :pending
isDone(f::Future) = f.state !== :pending
isCancelled(f::Future) = f.state === :cancelled

# Settle once, then hand the outcome to every synchronous subscriber and wake
# every blocked `fetch`. Returns whether this call was the one that settled.
function _settle!(f::Future, state::Symbol, value)
    local handlers
    lock(f.cond)
    try
        f.state === :pending || return false
        f.state = state
        f.value = value
        handlers = f.handlers
        f.handlers = Any[]
        notify(f.cond; all = true)
    finally
        unlock(f.cond)
    end
    for h in handlers
        if state === :fulfilled
            h.onFulfil(value)
        else
            h.onReject(state === :cancelled ? CancelledError() : value)
        end
    end
    return true
end

resolve(f::Future, value = nothing) = (_settle!(f, :fulfilled, value); nothing)
reject(f::Future, reason = nothing) = (_settle!(f, :rejected, reason); nothing)
cancel(f::Future) = (_settle!(f, :cancelled, nothing); nothing)

# Register synchronous settlement callbacks; returns an unsubscribe closure. An
# already-settled future fires the matching callback before `subscribe` returns,
# exactly as in the TS source.
function subscribe(f::Future, onFulfil, onReject)
    handler = (onFulfil = onFulfil, onReject = onReject)
    lock(f.cond)
    try
        if f.state === :pending
            push!(f.handlers, handler)
            return () -> begin
                lock(f.cond)
                try
                    i = findfirst(h -> h === handler, f.handlers)
                    i === nothing || deleteat!(f.handlers, i)
                finally
                    unlock(f.cond)
                end
                nothing
            end
        end
    finally
        unlock(f.cond)
    end
    if f.state === :fulfilled
        onFulfil(f.value)
    elseif f.state === :cancelled
        onReject(CancelledError())
    else
        onReject(f.value)
    end
    return () -> nothing
end

# Block until settled, then return the value or throw. Mirrors `await future`.
function Base.fetch(f::Future)
    lock(f.cond)
    try
        while f.state === :pending
            wait(f.cond)
        end
    finally
        unlock(f.cond)
    end
    f.state === :fulfilled && return f.value
    f.state === :cancelled && throw(CancelledError())
    throw(f.value isa Exception ? f.value : ErrorException(string(f.value)))
end
Base.wait(f::Future) = (Base.fetch(f); nothing)

"""
    race(futures) -> Future

Settle with the first input to settle. Subscription is synchronous, so the
raced future settles in the same task switch as its winner, and every loser is
unsubscribed as soon as a winner appears — the leak-safety the TS version calls
out for futures that are raced repeatedly.
"""
function race(futures)
    out = Future()
    unsubscribers = Any[]
    done = Ref(false)
    detach() = (foreach(u -> u(), unsubscribers); empty!(unsubscribers))
    settleWith(settler) = function (value)
        done[] && return nothing
        done[] = true
        detach()
        settler(value)
        return nothing
    end
    onFulfil = settleWith(v -> resolve(out, v))
    onReject = settleWith(e -> (e isa CancelledError ? cancel(out) : reject(out, e)))
    for fut in futures
        push!(unsubscribers, subscribe(fut, onFulfil, onReject))
        # An already-settled input wins synchronously; stop subscribing.
        done[] && break
    end
    return out
end

export BaseCache, ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById,
    ArrayCacheBySymbolBySide, OrderBookSide, Asks, Bids, CountedAsks, CountedBids,
    IndexedAsks, IndexedBids, OrderBook, CountedOrderBook, IndexedOrderBook,
    append, clear, getLimit, store, storeArray, limit, reset, ws_equals,
    Future, CancelledError, resolve, reject, cancel, subscribe, race,
    isPending, isDone, isCancelled
