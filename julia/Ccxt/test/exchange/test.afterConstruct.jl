using Test
using Ccxt
function testAfterConstruct(exchange, skippedProperties)

    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("networks", skippedProperties))))
        testOptionsNetworks(exchange, skippedProperties);
    end
    return true
end


function testOptionsNetworks(exchange, skippedProperties)

    if functions.ccxtruthy(!functions.ccxtruthy((ccxt_in("networks", skippedProperties))))
        allowedUnifiedAliases = ["BTC", "ERC20", "ETH", "TRX", "TRC20", "BRC20", "CRONOS", "CRC20", "CRO", "BEP20", "BSC", "HECO", "HRC20", "HT", "OP", "OPTIMISM", "SOL", "POLYGON", "MATIC", "CARDANO", "ADA", "ATOM", "COSMOS"];
        networks = safeDict(exchange, get(exchange, Symbol("options"), nothing), "networks");
        if functions.ccxtruthy(networks == nothing)
                return 
        end
        @test functions.ccxtruthy(isDictionary(exchange, networks))
        if functions.ccxtruthy(length(objectKeys(networks)) == 0)
                return 
        end
        @test functions.ccxtruthy(ccxt_in("networksById", get(exchange, Symbol("options"), nothing)))
        @test functions.ccxtruthy(isDictionary(exchange, get(get(exchange, Symbol("options"), nothing), Symbol("networksById"), nothing)))
        networkCodes = objectKeys(get(get(exchange, Symbol("options"), nothing), Symbol("networks"), nothing));
        collectedNetworkIds = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(networkCodes)))
            networkCode = get(networkCodes, i + 1, nothing);
            networkId = get(get(get(exchange, Symbol("options"), nothing), Symbol("networks"), nothing), Symbol(networkCode), nothing);
            if functions.ccxtruthy(!functions.ccxtruthy(inArray(exchange, networkCode, allowedUnifiedAliases)))
                @test !functions.ccxtruthy(inArray(exchange, networkId, collectedNetworkIds))
            end
            push!(collectedNetworkIds, networkId);
            i += 1
        end

        collectedNetworkCodes = [];
        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(networkCodes)))
            networkCodeLower = lowercase((get(networkCodes, i + 1, nothing)));
            @test !functions.ccxtruthy(inArray(exchange, networkCodeLower, collectedNetworkCodes))
            push!(collectedNetworkCodes, networkCodeLower);
            i += 1
        end

        i = 0
        while functions.ccxtruthy(functions.ccxt_lt(i, length(networkCodes)))
            networkCode = get(networkCodes, i + 1, nothing);
            networkId = get(get(get(exchange, Symbol("options"), nothing), Symbol("networks"), nothing), Symbol(networkCode), nothing);
            networkIdConverted = networkCodeToId(exchange, networkCode);
            @test networkId == networkIdConverted
            @test functions.ccxtruthy(ccxt_in(networkId, get(get(exchange, Symbol("options"), nothing), Symbol("networksById"), nothing)))
            if functions.ccxtruthy(!functions.ccxtruthy(inArray(exchange, networkCode, allowedUnifiedAliases)))
                @test get(get(get(exchange, Symbol("options"), nothing), Symbol("networksById"), nothing), Symbol(networkId), nothing) == networkCode
                networkCodeConverted = networkIdToCode(exchange, networkId);
                @test networkCode == networkCodeConverted
            end
            i += 1
        end

    end
end
