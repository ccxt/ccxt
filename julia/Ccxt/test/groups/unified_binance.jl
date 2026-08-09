# Group: unified_binance — transpiled unified-method tests for binance, run against
# its recorded response fixtures.
#
# This is where the structure validators actually execute against real parsed
# exchange output. The driver lives in `test/exchange/unified_methods.jl`,
# loaded by the `unified_driver` group.
unified_methods_testset("binance")
