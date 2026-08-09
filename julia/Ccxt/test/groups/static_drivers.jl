# Group: static_drivers — definitions only, no assertions.
#
# Loads the static request/response fixture drivers so the per-exchange groups
# (`request_<id>`, `response_<id>`) have `static_request_testset` and
# `static_response_testset` in scope. Splitting the definitions out of the
# running groups is what lets one exchange be run without paying for the other
# four; see the group table in `test/runtests.jl`.
include("../fixtures/static_request.jl")
include("../fixtures/static_response.jl")
