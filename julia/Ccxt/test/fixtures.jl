# Auto-generated fixture loader - DO NOT EDIT
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
