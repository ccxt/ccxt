using Test
using Ccxt
function testExtend()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "regirock"
    ));
    obj1 = Dict{Symbol, Any}(
        Symbol("a") => 1,
        Symbol("b") => [1, 2],
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
    obj1SnapshotA = get(obj1, Symbol("a"), nothing);
    obj1SnapshotB0 = get(get(obj1, Symbol("b"), nothing), 1, nothing);
    obj1SnapshotOther1 = get(obj1, Symbol("other1"), nothing);
    obj2SnapshotA = get(obj2, Symbol("a"), nothing);
    obj2SnapshotB0 = get(get(obj2, Symbol("b"), nothing), 1, nothing);
    obj2SnapshotOther2 = get(obj2, Symbol("other2"), nothing);
    extended = extend(exchange, obj1, obj2);
    tbfeCheckExtended(extended, true);
    @test get(obj1, Symbol("a"), nothing) == obj1SnapshotA;
    @test get(get(obj1, Symbol("b"), nothing), 1, nothing) == obj1SnapshotB0;
    @test get(obj1, Symbol("other1"), nothing) == obj1SnapshotOther1;
    @test get(obj2, Symbol("a"), nothing) == obj2SnapshotA;
    @test get(get(obj2, Symbol("b"), nothing), 1, nothing) == obj2SnapshotB0;
    @test get(obj2, Symbol("other2"), nothing) == obj2SnapshotOther2;
    obj3 = Dict{Symbol, Any}(
        Symbol("a") => 3,
        Symbol("b") => [5, 6],
        Symbol("c") => [Dict{Symbol, Any}(
        Symbol("test1") => 3,
        Symbol("test4") => 4
    )],
        Symbol("d") => "step3",
        Symbol("e") => "back_to_string",
        Symbol("other3") => "z"
    );
    extended2 = extend(exchange, extended, obj3);
    @test get(extended2, Symbol("a"), nothing) == 3;
    @test get(get(extended2, Symbol("b"), nothing), 1, nothing) == 5;
    @test get(get(extended2, Symbol("b"), nothing), 2, nothing) == 6;
    @test get(get(get(extended2, Symbol("c"), nothing), 1, nothing), Symbol("test1"), nothing) == 3;
    @test !functions.ccxtruthy((ccxt_in("test2", get(get(extended2, Symbol("c"), nothing), 1, nothing))))
    @test !functions.ccxtruthy((ccxt_in("test3", get(get(extended2, Symbol("c"), nothing), 1, nothing))))
    @test get(get(get(extended2, Symbol("c"), nothing), 1, nothing), Symbol("test4"), nothing) == 4;
    @test get(extended2, Symbol("d"), nothing) == "step3";
    @test get(extended2, Symbol("e"), nothing) == "back_to_string";
    @test get(extended2, Symbol("other1"), nothing) == "x";
    @test get(extended2, Symbol("other2"), nothing) == "y";
    @test get(extended2, Symbol("other3"), nothing) == "z";
    @test get(extended, Symbol("a"), nothing) == 2;
    @test get(get(extended, Symbol("b"), nothing), 1, nothing) == 3;
    @test !functions.ccxtruthy((ccxt_in("other3", extended)))
    base = Dict{Symbol, Any}(
        Symbol("x") => 0,
        Symbol("keep") => "yes"
    );
    patch1 = Dict{Symbol, Any}(
        Symbol("x") => 1,
        Symbol("p1") => true
    );
    patch2 = Dict{Symbol, Any}(
        Symbol("x") => 2,
        Symbol("p2") => true
    );
    patch3 = Dict{Symbol, Any}(
        Symbol("x") => 3,
        Symbol("p3") => true
    );
    r1 = extend(exchange, base, patch1);
    r2 = extend(exchange, r1, patch2);
    r3 = extend(exchange, r2, patch3);
    @test get(r3, Symbol("x"), nothing) == 3
    @test get(r3, Symbol("keep"), nothing) == "yes"
    @test functions.ccxtruthy(get(r3, Symbol("p1"), nothing))
    @test functions.ccxtruthy(get(r3, Symbol("p2"), nothing))
    @test functions.ccxtruthy(get(r3, Symbol("p3"), nothing))
    @test get(base, Symbol("x"), nothing) == 0;
    @test get(r1, Symbol("x"), nothing) == 1;
    @test get(r2, Symbol("x"), nothing) == 2;
    @test !functions.ccxtruthy((ccxt_in("p3", r1)));
    @test !functions.ccxtruthy((ccxt_in("p2", base)));
    withValues = Dict{Symbol, Any}(
        Symbol("keep1") => "A",
        Symbol("keep2") => "B"
    );
    withUndefs = Dict{Symbol, Any}(
        Symbol("keep1") => nothing,
        Symbol("keep2") => nothing,
        Symbol("newKey") => "C"
    );
    extUndef = extend(exchange, withValues, withUndefs);
    @test get(extUndef, Symbol("keep1"), nothing) == nothing
    @test get(extUndef, Symbol("keep2"), nothing) == nothing
    @test get(extUndef, Symbol("newKey"), nothing) == "C"
    @test get(withValues, Symbol("keep1"), nothing) == "A";
    @test get(withValues, Symbol("keep2"), nothing) == "B";
end


function tbfeCheckExtended(extended, hasSub)

    @test get(extended, Symbol("a"), nothing) == 2;
    @test get(get(extended, Symbol("b"), nothing), 1, nothing) == 3;
    @test get(get(extended, Symbol("b"), nothing), 2, nothing) == 4;
    @test get(get(get(extended, Symbol("c"), nothing), 1, nothing), Symbol("test1"), nothing) == 2;
    @test !functions.ccxtruthy((ccxt_in("test2", get(get(extended, Symbol("c"), nothing), 1, nothing))));
    @test get(get(get(extended, Symbol("c"), nothing), 1, nothing), Symbol("test3"), nothing) == 3;
    @test get(extended, Symbol("d"), nothing) == "not_undefined";
    @test get(extended, Symbol("e"), nothing) == nothing;
    @test get(extended, Symbol("other1"), nothing) == "x";
    @test get(extended, Symbol("other2"), nothing) == "y";
    if functions.ccxtruthy(hasSub)
        @test functions.ccxtruthy(ccxt_in("sub", extended));
    end
end
