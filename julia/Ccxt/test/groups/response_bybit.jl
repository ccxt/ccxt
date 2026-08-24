# Group: response_bybit — static response fixtures for bybit.
#
# Replays each recorded raw payload through the exchange's own parsers and
# compares the unified structure field by field against the stored one. The
# driver lives in `test/fixtures/static_response.jl`, loaded by the
# `static_drivers` group.
static_response_testset("bybit")
