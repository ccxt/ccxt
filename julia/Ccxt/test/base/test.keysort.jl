using Test
using Ccxt
function testKeysort()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    if functions.ccxtruthy(functions.ccxt_gt(milliseconds(exchange), 0))
            return 
    end
    unsortedDict1 = Dict{Symbol, Any}(
        Symbol("c") => 3,
        Symbol("a") => 1,
        Symbol("b") => 2
    );
    expectedSorted1 = Dict{Symbol, Any}(
        Symbol("a") => 1,
        Symbol("b") => 2,
        Symbol("c") => 3
    );
    result1 = keysort(exchange, unsortedDict1);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testKeysort", objectKeys(result1), objectKeys(expectedSorted1));
    unsortedDict2 = Dict{Symbol, Any}(
        Symbol("alpha") => "first",
        Symbol("beta") => "second",
        Symbol("gamma") => "third"
    );
    expectedSorted2 = Dict{Symbol, Any}(
        Symbol("alpha") => "first",
        Symbol("beta") => "second",
        Symbol("gamma") => "third"
    );
    result2 = keysort(exchange, unsortedDict2);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testKeysort", objectKeys(result2), objectKeys(expectedSorted2));
    unsortedDict3 = Dict{Symbol, Any}(
        Symbol("z") => "last",
        Symbol("n") => "middle",
        Symbol("a") => "first"
    );
    expectedSorted3 = Dict{Symbol, Any}(
        Symbol("a") => "first",
        Symbol("n") => "middle",
        Symbol("z") => "last"
    );
    result3 = keysort(exchange, unsortedDict3);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testKeysort", objectKeys(result3), objectKeys(expectedSorted3));
    unsortedDict4 = Dict{Symbol, Any}();
    expectedSorted4 = Dict{Symbol, Any}();
    result4 = keysort(exchange, unsortedDict4);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testKeysort", objectKeys(result4), objectKeys(expectedSorted4));
    unsortedDict5 = Dict{Symbol, Any}(
        Symbol("only") => "one"
    );
    expectedSorted5 = Dict{Symbol, Any}(
        Symbol("only") => "one"
    );
    result5 = keysort(exchange, unsortedDict5);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testKeysort", objectKeys(result5), objectKeys(expectedSorted5));
    unsortedDict6 = Dict{Symbol, Any}(
        Symbol("10") => "ten",
        Symbol("2") => "two",
        Symbol("1") => "one"
    );
    expectedSorted6 = Dict{Symbol, Any}(
        Symbol("1") => "one",
        Symbol("10") => "ten",
        Symbol("2") => "two"
    );
    result6 = keysort(exchange, unsortedDict6);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testKeysort", objectKeys(result6), objectKeys(expectedSorted6));
    unsortedDict7 = Dict{Symbol, Any}(
        Symbol("Banana") => 1,
        Symbol("apple") => 2,
        Symbol("Cherry") => 3
    );
    expectedSorted7 = Dict{Symbol, Any}(
        Symbol("Banana") => 1,
        Symbol("Cherry") => 3,
        Symbol("apple") => 2
    );
    result7 = keysort(exchange, unsortedDict7);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testKeysort", objectKeys(result7), objectKeys(expectedSorted7));
end
