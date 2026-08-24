using Test
using Ccxt
function testCapitalize()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    @test capitalize(exchange, "hello") == "Hello";
    @test capitalize(exchange, "fooBar") == "FooBar";
    @test capitalize(exchange, "helloWorld") == "HelloWorld";
    @test capitalize(exchange, "Hello") == "Hello";
    @test capitalize(exchange, "hELLO") == "HELLO";
    @test capitalize(exchange, "a") == "A";
    @test capitalize(exchange, "A") == "A";
    @test capitalize(exchange, "") == "";
    @test capitalize(exchange, "123abc") == "123abc";
    @test capitalize(exchange, "hello world") == "Hello world";
    @test capitalize(exchange, "foo_bar_baz") == "Foo_bar_baz";
    @test capitalize(exchange, "aBC") == "ABC";
end
