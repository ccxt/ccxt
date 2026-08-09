# Julia-native runtime layer for CCXT.
#
# The TypeScript source of `Exchange` is built around Node's `fetch`/`undici`
# and the browser `fetch`/`AbortController`/`setTimeout` stack. None of that
# exists in Julia, so the transpiled `loadFetchImplementation`/`fetch` chain
# cannot run as-is. This file installs a Julia HTTP backend (HTTP.jl) and the
# small set of globals the transpiled `handleRestResponse` relies on
# (`text`, `arrayBuffer`). It overrides the auto-generated `loadFetchImplementation`
# so the struct's `fetchImplementation` field points at a working Julia function.
#
# The response object mirrors the shape produced by the undici branch of the
# transpiled `fetch` (a Dict with `:status`, `:statusText`, `:headers`,
# `:text`, `:arrayBuffer` keys) so `handleRestResponse` needs no changes.

using HTTP

# --- response body accessors (TS globals: text(response), arrayBuffer(response)) ---

function text(response)
    if response isa Dict
        fn = get(response, :text, nothing)
        if fn !== nothing
            return fn()
        end
    end
    throw(NotImplemented("text() not available for $(typeof(response))"))
end

function arrayBuffer(response)
    if response isa Dict
        fn = get(response, :arrayBuffer, nothing)
        if fn !== nothing
            return fn()
        end
    end
    throw(NotImplemented("arrayBuffer() not available for $(typeof(response))"))
end

# --- Julia HTTP implementation -------------------------------------------------
#
# Signature matches the transpiled call site:
#     fetchImplementation(url, params)
# where params = Dict(:method, :headers, :body)
#
# Returns a Dict shaped like the undici response consumed by handleRestResponse.

function ccxt_fetch(url::AbstractString, params::Dict)
    method = uppercase(string(get(params, :method, "GET")))
    headers_in = get(params, :headers, Dict())
    body = get(params, :body, nothing)

    # Normalise headers to a Vector of Pair{String,String} for HTTP.jl.
    http_headers = Pair{String,String}[]
    if headers_in isa Dict
        for (k, v) in headers_in
            push!(http_headers, string(k) => string(v))
        end
    end

    # Build the request body.
    request_body = nothing
    if body !== nothing && !(isa(body, AbstractString) && isempty(body))
        request_body = isa(body, AbstractString) ? Vector{UInt8}(codeunits(body)) : body
    end

    # HTTP.jl does not follow redirects by default; ccxt disables redirect
    # following and surfaces a NetworkError itself, so we let HTTP.jl raise
    # and convert below. We pass redirect=false to match that contract.
    response = HTTP.request(
        method,
        url;
        headers = http_headers,
        body = request_body === nothing ? UInt8[] : request_body,
        redirect = false,
        status_exception = false,
        verbose = false,
    )

    status = response.status
    # Header names from HTTP.jl are already capitalised (e.g. "Content-Type").
    resp_headers = Dict{Symbol,Any}()
    for (k, v) in response.headers
        resp_headers[Symbol(k)] = v
    end

    body_bytes = copy(response.body)

    return Dict(
        :status => status,
        :statusText => get(Dict(200 => "OK", 404 => "Not Found", 500 => "Internal Server Error"), status, ""),
        :headers => resp_headers,
        :text => (() -> String(body_bytes)),
        :arrayBuffer => (() -> body_bytes),
    )
end

# --- install the Julia backend into the transpiled loadFetchImplementation ----

function loadFetchImplementation(self::CcxtExchange, )
    # Julia has no node/browser fetch; install the HTTP.jl-backed implementation.
    self.fetchImplementation = ccxt_fetch
    self.fetchIsNative = false
    self.AbortError = NetworkError
    self.FetchError = NetworkError
    self.fetchImplementationLoading = nothing
    return nothing
end

# `fetch` (the transpiled method) calls `Base.fetch(self.loadFetchImplementation())`
# at the top. With our override returning `nothing`, `Base.fetch(nothing)` would
# error, so we also override the public `fetch` entry to skip that bootstrap.
function fetch(self::CcxtExchange, url, method="GET", headers=nothing, body=nothing)
    # Re-run the bootstrap guard without relying on Base.fetch of a Task.
    if functions.ccxtruthy(self.fetchImplementation == nothing)
        loadFetchImplementation(self)
    end
    headers = extend(self.headers, headers)
    proxyUrl = self.checkProxyUrlSettings(url, method, headers, body)
    if functions.ccxtruthy(proxyUrl != nothing)
        url = string(proxyUrl, self.urlEncoderForProxyUrl(url))
    end
    (httpProxy, httpsProxy, socksProxy) = self.checkProxySettings(url, method, headers, body)
    self.checkConflictingProxies(@functions.ccxt_or(@functions.ccxt_or(httpProxy, httpsProxy), socksProxy), proxyUrl)
    userAgent = functions.ccxtruthy((self.userAgent != nothing)) ? self.userAgent : self.user_agent
    if functions.ccxtruthy(@functions.ccxt_and(userAgent, isa(userAgent, AbstractString)))
        headers = extend(Dict(Symbol("User-Agent") => userAgent), headers)
    elseif functions.ccxtruthy(@functions.ccxt_and(self.isDictionary(userAgent), haskey(userAgent, "User-Agent")))
        headers = extend(userAgent, headers)
    end
    headers = self.setHeaders(headers)
    if functions.ccxtruthy(self.verbose)
        self.log("fetch Request:\n", self.id, method, url, "\nRequestHeaders:\n", headers, "\nRequestBody:\n", body, "\n")
    end
    fetchImplementation = self.fetchImplementation
    params = Dict(
        Symbol("method") => method,
        Symbol("headers") => headers,
        Symbol("body") => body,
    )
    response = nothing
    try
        response = fetchImplementation(url, params)
    catch e
        throw(NetworkError(string(self.id, " ", method, " ", url, " fetch failed: ", e)))
    end
    return self.handleRestResponse(response, url, method, headers, body)
end
