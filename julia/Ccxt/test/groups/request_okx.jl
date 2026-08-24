# Group: request_okx — static request fixtures for okx.
#
# One exchange per group: the five together are the single heaviest block in
# the suite, and binance alone carries 338 of the 748 recorded entries. Sharding
# them is what keeps a parallel run balanced, and it makes "re-run just okx's
# request fixtures" a one-word command. The driver lives in
# `test/fixtures/static_request.jl`, loaded by the `static_drivers` group.
static_request_testset("okx")
