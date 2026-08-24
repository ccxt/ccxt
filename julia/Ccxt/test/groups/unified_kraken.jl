# Group: unified_kraken — transpiled unified-method tests for kraken, run against
# its recorded response fixtures.
#
# This is where the structure validators actually execute against real parsed
# exchange output. The driver lives in `test/exchange/unified_methods.jl`,
# loaded by the `unified_driver` group.
unified_methods_testset("kraken")
