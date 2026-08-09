using Test
using Ccxt
function testSignIn(exchange, skippedProperties)

    method = "signIn";
    if functions.ccxtruthy(get(get(exchange, Symbol("has"), nothing), Symbol(method), nothing))
        Base.fetch(signIn(exchange));
    end
    return true
end
