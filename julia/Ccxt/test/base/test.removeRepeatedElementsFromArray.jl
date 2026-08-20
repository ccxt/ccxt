using Test
using Ccxt
function testRemoveRepeatedElementsFromArray()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    array1 = [Dict{Symbol, Any}(
        Symbol("id") => "a",
        Symbol("timestamp") => 1,
        Symbol("uniq") => "x1"
    ), Dict{Symbol, Any}(
        Symbol("id") => "b",
        Symbol("timestamp") => 2,
        Symbol("uniq") => "x2"
    ), Dict{Symbol, Any}(
        Symbol("id") => "a",
        Symbol("timestamp") => 3,
        Symbol("uniq") => "x3"
    ), Dict{Symbol, Any}(
        Symbol("id") => "c",
        Symbol("timestamp") => 1,
        Symbol("uniq") => "x4"
    )];
    res1 = removeRepeatedElementsFromArray(exchange, array1, false);
    res1Length = length(res1);
    @test res1Length == 3;
    @test get(get(res1, 1, nothing), Symbol("uniq"), nothing) == "x1";
    @test get(get(res1, 2, nothing), Symbol("uniq"), nothing) == "x2";
    @test get(get(res1, 3, nothing), Symbol("uniq"), nothing) == "x4";
    array2 = [Dict{Symbol, Any}(
        Symbol("id") => nothing,
        Symbol("timestamp") => 1,
        Symbol("uniq") => "x1"
    ), Dict{Symbol, Any}(
        Symbol("id") => nothing,
        Symbol("timestamp") => 2,
        Symbol("uniq") => "x2"
    ), Dict{Symbol, Any}(
        Symbol("id") => nothing,
        Symbol("timestamp") => 1,
        Symbol("uniq") => "x3"
    ), Dict{Symbol, Any}(
        Symbol("id") => nothing,
        Symbol("timestamp") => 3,
        Symbol("uniq") => "x4"
    )];
    res2 = removeRepeatedElementsFromArray(exchange, array2, true);
    res2Length = length(res2);
    @test res2Length == 3;
    @test get(get(res2, 1, nothing), Symbol("uniq"), nothing) == "x1";
    @test get(get(res2, 2, nothing), Symbol("uniq"), nothing) == "x2";
    @test get(get(res2, 3, nothing), Symbol("uniq"), nothing) == "x4";
    array3 = [[555, 1, 1, "x1"], [666, 1, 1, "x2"], [555, 1, 1, "x3"]];
    res3 = removeRepeatedElementsFromArray(exchange, array3, true);
    @test length(res3) == 2;
    @test get(get(res3, 1, nothing), 4, nothing) == "x1";
    @test get(get(res3, 2, nothing), 4, nothing) == "x2";
end
