using Test
using Ccxt
function testClone()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    obj1 = Dict{Symbol, Any}(
        Symbol("a") => 1,
        Symbol("b") => [1, 2, 3],
        Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 1,
        Symbol("test2") => 1
    )],
        Symbol("d") => nothing,
        Symbol("e") => "not_undefined",
        Symbol("sub") => Dict{Symbol, Any}(
            Symbol("a") => 1,
            Symbol("b") => [1, 2],
            Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 1,
        Symbol("test2") => 2
    )],
            Symbol("d") => nothing,
            Symbol("e") => "not_undefined",
            Symbol("other1") => "x"
        ),
        Symbol("other1") => "x"
    );
    obj2 = Dict{Symbol, Any}(
        Symbol("a") => 2,
        Symbol("b") => [3, 4],
        Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 2,
        Symbol("test3") => 3
    )],
        Symbol("d") => "not_undefined",
        Symbol("e") => nothing,
        Symbol("sub") => Dict{Symbol, Any}(
            Symbol("a") => 2,
            Symbol("b") => [3, 4],
            Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 2,
        Symbol("test3") => 3
    )],
            Symbol("d") => "not_undefined",
            Symbol("e") => nothing,
            Symbol("other2") => "y"
        ),
        Symbol("other2") => "y"
    );
    deepExtended = deepExtend(exchange, obj1, obj2);
    compareTo = Dict{Symbol, Any}(
        Symbol("a") => 2,
        Symbol("b") => [3, 4],
        Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 2,
        Symbol("test3") => 3
    )],
        Symbol("d") => "not_undefined",
        Symbol("e") => nothing,
        Symbol("sub") => Dict{Symbol, Any}(
            Symbol("a") => 2,
            Symbol("b") => [3, 4],
            Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 2,
        Symbol("test3") => 3
    )],
            Symbol("d") => "not_undefined",
            Symbol("e") => nothing,
            Symbol("other1") => "x",
            Symbol("other2") => "y"
        ),
        Symbol("other1") => "x",
        Symbol("other2") => "y"
    );
    assertDeepEqual(testSharedMethods, exchange, nothing, "testDeepExtend", deepExtended, compareTo);
    simpleOrig = Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("y") => "hello",
        Symbol("z") => nothing
    );
    simpleClone = clone(exchange, simpleOrig);
    @test get(simpleClone, Symbol("x"), nothing) == 1;
    @test get(simpleClone, Symbol("y"), nothing) == "hello";
    @test get(simpleClone, Symbol("z"), nothing) == nothing;
    simpleClone[Symbol("x")] = 999;
    simpleClone[Symbol("y")] = "mutated";
    @test get(simpleOrig, Symbol("x"), nothing) == 1
    @test get(simpleOrig, Symbol("y"), nothing) == "hello"
    simpleOrig[Symbol("x")] = 42;
    @test get(simpleClone, Symbol("x"), nothing) == 999
    nestedOrig = Dict{Symbol, Any}(
        Symbol("top") => "original",
        Symbol("arr") => [10, 20, 30],
        Symbol("sub") => Dict{Symbol, Any}(
            Symbol("inner") => "original"
        )
    );
    nestedClone = clone(exchange, nestedOrig);
    nestedClone[Symbol("top")] = "cloned";
    @test get(nestedOrig, Symbol("top"), nothing) == "original";
    @test get(nestedClone, Symbol("top"), nothing) == "cloned";
    nestedOrig[Symbol("top")] = "changed_orig";
    @test get(nestedClone, Symbol("top"), nothing) == "cloned"
    emptyClone = clone(exchange, Dict{Symbol, Any}());
    @test length(objectKeys(emptyClone)) == 0;
    emptyClone[Symbol("newKey")] = "injected";
    @test get(emptyClone, Symbol("newKey"), nothing) == "injected";
    withUndef = Dict{Symbol, Any}(
        Symbol("present") => "yes",
        Symbol("absent") => nothing
    );
    undefClone = clone(exchange, withUndef);
    @test functions.ccxtruthy(ccxt_in("present", undefClone))
    @test get(undefClone, Symbol("present"), nothing) == "yes";
    @test functions.ccxtruthy(ccxt_in("absent", undefClone))
    @test get(undefClone, Symbol("absent"), nothing) == nothing;
    undefClone[Symbol("present")] = "no";
    @test get(withUndef, Symbol("present"), nothing) == "yes"
    masterOrig = Dict{Symbol, Any}(
        Symbol("a") => 1,
        Symbol("b") => 2,
        Symbol("c") => 3
    );
    clone1 = clone(exchange, masterOrig);
    clone1[Symbol("a")] = 100;
    clone1[Symbol("d")] = 999;
    @test get(masterOrig, Symbol("a"), nothing) == 1;
    @test !functions.ccxtruthy((ccxt_in("d", masterOrig)))
    clone2 = clone(exchange, masterOrig);
    @test get(clone2, Symbol("a"), nothing) == 1;
    @test !functions.ccxtruthy((ccxt_in("d", clone2)))
    clone2[Symbol("b")] = 200;
    @test get(clone1, Symbol("b"), nothing) == 2;
    @test get(masterOrig, Symbol("b"), nothing) == 2;
end
