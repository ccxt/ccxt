using Test
using Ccxt
function testSortBy1()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    arr = [Dict{Symbol, Any}(
        Symbol("x") => 5
    ), Dict{Symbol, Any}(
        Symbol("x") => 2
    ), Dict{Symbol, Any}(
        Symbol("x") => 4
    ), Dict{Symbol, Any}(
        Symbol("x") => 0
    ), Dict{Symbol, Any}(
        Symbol("x") => 1
    ), Dict{Symbol, Any}(
        Symbol("x") => 3
    )];
    newArray = sortBy(exchange, arr, "x");
    assertDeepEqual(testSharedMethods, exchange, nothing, "sortBy", newArray, [Dict{Symbol, Any}(
    Symbol("x") => 0
), Dict{Symbol, Any}(
    Symbol("x") => 1
), Dict{Symbol, Any}(
    Symbol("x") => 2
), Dict{Symbol, Any}(
    Symbol("x") => 3
), Dict{Symbol, Any}(
    Symbol("x") => 4
), Dict{Symbol, Any}(
    Symbol("x") => 5
)]);
    newArrayDescending = sortBy(exchange, arr, "x", true);
    assertDeepEqual(testSharedMethods, exchange, nothing, "sortBy", newArrayDescending, [Dict{Symbol, Any}(
    Symbol("x") => 5
), Dict{Symbol, Any}(
    Symbol("x") => 4
), Dict{Symbol, Any}(
    Symbol("x") => 3
), Dict{Symbol, Any}(
    Symbol("x") => 2
), Dict{Symbol, Any}(
    Symbol("x") => 1
), Dict{Symbol, Any}(
    Symbol("x") => 0
)]);
    emptyArray = sortBy(exchange, [], "x");
    assertDeepEqual(testSharedMethods, exchange, nothing, "sortBy", emptyArray, []);
end


function testSortBy2()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    arr = [Dict{Symbol, Any}(
        Symbol("x") => 3,
        Symbol("y") => 1
    ), Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 2
    ), Dict{Symbol, Any}(
        Symbol("x") => 2,
        Symbol("y") => 3
    ), Dict{Symbol, Any}(
        Symbol("x") => 0,
        Symbol("y") => 4
    )];
    sorted = sortBy2(exchange, arr, "x", "y");
    assertDeepEqual(testSharedMethods, exchange, nothing, "sortBy2", sorted, [Dict{Symbol, Any}(
    Symbol("x") => 0,
    Symbol("y") => 4
), Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 2
), Dict{Symbol, Any}(
    Symbol("x") => 2,
    Symbol("y") => 3
), Dict{Symbol, Any}(
    Symbol("x") => 3,
    Symbol("y") => 1
)]);
    arr2 = [Dict{Symbol, Any}(
        Symbol("x") => 3,
        Symbol("y") => 1
    ), Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 2
    ), Dict{Symbol, Any}(
        Symbol("x") => 2,
        Symbol("y") => 3
    ), Dict{Symbol, Any}(
        Symbol("x") => 0,
        Symbol("y") => 4
    )];
    sortedDescending = sortBy2(exchange, arr2, "x", "y", true);
    assertDeepEqual(testSharedMethods, exchange, nothing, "sortBy2", sortedDescending, [Dict{Symbol, Any}(
    Symbol("x") => 3,
    Symbol("y") => 1
), Dict{Symbol, Any}(
    Symbol("x") => 2,
    Symbol("y") => 3
), Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 2
), Dict{Symbol, Any}(
    Symbol("x") => 0,
    Symbol("y") => 4
)]);
    arr3 = [Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 5
    ), Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 2
    ), Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 9
    ), Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 1
    )];
    sortedByKey2 = sortBy2(exchange, arr3, "x", "y");
    assertDeepEqual(testSharedMethods, exchange, nothing, "sortBy2", sortedByKey2, [Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 1
), Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 2
), Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 5
), Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 9
)]);
    arr4 = [Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 5
    ), Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 2
    ), Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 9
    ), Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 1
    )];
    sortedByKey2Descending = sortBy2(exchange, arr4, "x", "y", true);
    assertDeepEqual(testSharedMethods, exchange, nothing, "sortBy2", sortedByKey2Descending, [Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 9
), Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 5
), Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 2
), Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 1
)]);
    arr5 = [Dict{Symbol, Any}(
        Symbol("x") => 2,
        Symbol("y") => 3
    ), Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 5
    ), Dict{Symbol, Any}(
        Symbol("x") => 2,
        Symbol("y") => 1
    ), Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => 2
    ), Dict{Symbol, Any}(
        Symbol("x") => 2,
        Symbol("y") => 2
    )];
    sortedMixed = sortBy2(exchange, arr5, "x", "y");
    assertDeepEqual(testSharedMethods, exchange, nothing, "sortBy2", sortedMixed, [Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 2
), Dict{Symbol, Any}(
    Symbol("x") => 1,
    Symbol("y") => 5
), Dict{Symbol, Any}(
    Symbol("x") => 2,
    Symbol("y") => 1
), Dict{Symbol, Any}(
    Symbol("x") => 2,
    Symbol("y") => 2
), Dict{Symbol, Any}(
    Symbol("x") => 2,
    Symbol("y") => 3
)]);
    emptyArray = sortBy2(exchange, [], "x", "y");
    assertDeepEqual(testSharedMethods, exchange, nothing, "sortBy2", emptyArray, []);
end


function testSortBy()

    testSortBy1();
    testSortBy2();
end
