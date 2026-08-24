using Test
using Ccxt
function testIndexBy()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    input1 = [Dict{Symbol, Any}(
        Symbol("id") => "a",
        Symbol("val") => 1
    ), Dict{Symbol, Any}(
        Symbol("id") => "b",
        Symbol("val") => 2
    ), Dict{Symbol, Any}(
        Symbol("id") => "c",
        Symbol("val") => 3
    )];
    expected1 = Dict{Symbol, Any}(
        Symbol("a") => Dict{Symbol, Any}(
            Symbol("id") => "a",
            Symbol("val") => 1
        ),
        Symbol("b") => Dict{Symbol, Any}(
            Symbol("id") => "b",
            Symbol("val") => 2
        ),
        Symbol("c") => Dict{Symbol, Any}(
            Symbol("id") => "c",
            Symbol("val") => 3
        )
    );
    result1 = indexBy(exchange, input1, "id");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testIndexBy", result1, expected1);
    input2 = [Dict{Symbol, Any}(
        Symbol("id") => "a",
        Symbol("val") => 1
    ), Dict{Symbol, Any}(
        Symbol("id") => "b",
        Symbol("val") => 3
    )];
    expected2 = Dict{Symbol, Any}(
        Symbol("a") => Dict{Symbol, Any}(
            Symbol("id") => "a",
            Symbol("val") => 1
        ),
        Symbol("b") => Dict{Symbol, Any}(
            Symbol("id") => "b",
            Symbol("val") => 3
        )
    );
    result2 = indexBy(exchange, input2, "id");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testIndexBy", result2, expected2);
    input3 = [Dict{Symbol, Any}(
        Symbol("id") => "a",
        Symbol("val") => 1
    ), Dict{Symbol, Any}(
        Symbol("val") => 2
    ), Dict{Symbol, Any}(
        Symbol("id") => "b",
        Symbol("val") => 3
    )];
    expected3 = Dict{Symbol, Any}(
        Symbol("a") => Dict{Symbol, Any}(
            Symbol("id") => "a",
            Symbol("val") => 1
        ),
        Symbol("b") => Dict{Symbol, Any}(
            Symbol("id") => "b",
            Symbol("val") => 3
        )
    );
    result3 = indexBy(exchange, input3, "id");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testIndexBy", result3, expected3);
    input4 = [];
    expected4 = Dict{Symbol, Any}();
    result4 = indexBy(exchange, input4, "id");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testIndexBy", result4, expected4);
    input5 = [Dict{Symbol, Any}(
        Symbol("id") => "a",
        Symbol("val") => 1
    ), Dict{Symbol, Any}(
        Symbol("id") => "a",
        Symbol("val") => 2
    ), Dict{Symbol, Any}(
        Symbol("id") => "a",
        Symbol("val") => 3
    )];
    expected5 = Dict{Symbol, Any}(
        Symbol("a") => Dict{Symbol, Any}(
            Symbol("id") => "a",
            Symbol("val") => 3
        )
    );
    result5 = indexBy(exchange, input5, "id");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testIndexBy", result5, expected5);
    input6 = [Dict{Symbol, Any}(
        Symbol("code") => 1,
        Symbol("name") => "one"
    ), Dict{Symbol, Any}(
        Symbol("code") => 2,
        Symbol("name") => "two"
    ), Dict{Symbol, Any}(
        Symbol("code") => 3,
        Symbol("name") => "three"
    )];
    expected6 = Dict{Symbol, Any}(
        Symbol("1") => Dict{Symbol, Any}(
            Symbol("code") => 1,
            Symbol("name") => "one"
        ),
        Symbol("2") => Dict{Symbol, Any}(
            Symbol("code") => 2,
            Symbol("name") => "two"
        ),
        Symbol("3") => Dict{Symbol, Any}(
            Symbol("code") => 3,
            Symbol("name") => "three"
        )
    );
    result6 = indexBy(exchange, input6, "code");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testIndexBy", result6, expected6);
    input7 = [["a", 1], ["b", 2], ["c", 3]];
    expected7 = Dict{Symbol, Any}(
        Symbol("a") => ["a", 1],
        Symbol("b") => ["b", 2],
        Symbol("c") => ["c", 3]
    );
    result7 = indexBy(exchange, input7, 0);
    assertDeepEqual(testSharedMethods, exchange, nothing, "testIndexBy", result7, expected7);
    input8 = [Dict{Symbol, Any}(
        Symbol("id") => "only",
        Symbol("val") => 42
    )];
    expected8 = Dict{Symbol, Any}(
        Symbol("only") => Dict{Symbol, Any}(
            Symbol("id") => "only",
            Symbol("val") => 42
        )
    );
    result8 = indexBy(exchange, input8, "id");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testIndexBy", result8, expected8);
end
