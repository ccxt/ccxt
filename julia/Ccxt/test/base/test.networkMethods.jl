using Test
using Ccxt
function helperTestNetworkCodeToId(networksMap)

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange",
        Symbol("options") => Dict{Symbol, Any}(
            Symbol("networks") => networksMap
        )
    ));
    exchange.currencies = mapToSafeMap(exchange, Dict{Symbol, Any}());
    @test networkCodeToId(exchange, "ETH") == "Ether";
    @test networkCodeToId(exchange, "ERC20") == "Ether";
    @test networkCodeToId(exchange, "ETH", "USDC") == "Ether";
    @test networkCodeToId(exchange, "ETH", "ETH") == "Ether";
    @test networkCodeToId(exchange, "ERC20", "USDC") == "Ether";
    @test networkCodeToId(exchange, "ERC20", "ETH") == "Ether";
    @test networkCodeToId(exchange, "TRX") == "Tron";
    @test networkCodeToId(exchange, "TRC20") == "Tron";
    @test networkCodeToId(exchange, "TRX", "USDC") == "Tron";
    @test networkCodeToId(exchange, "TRX", "TRX") == "Tron";
    @test networkCodeToId(exchange, "TRC20", "USDC") == "Tron";
    @test networkCodeToId(exchange, "TRC20", "TRX") == "Tron";
    @test networkCodeToId(exchange, "BTC") == "Bitcoin";
    @test networkCodeToId(exchange, "BRC20") == "Brc_20";
    @test networkCodeToId(exchange, "BTC", "USDC") == "Brc_20";
    @test networkCodeToId(exchange, "BTC", "BTC") == "Bitcoin";
    @test networkCodeToId(exchange, "BRC20", "USDC") == "Brc_20";
    @test networkCodeToId(exchange, "BRC20", "BTC") == "Bitcoin";
    @test networkCodeToId(exchange, "Xyz") == "Xyz";
    @test networkCodeToId(exchange, "Xyz", "SAMPLECOIN") == "Xyz";
end


function helperTestNetworkIdToCode(networksMap)

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange",
        Symbol("options") => Dict{Symbol, Any}(
            Symbol("networks") => networksMap
        )
    ));
    exchange.currencies = mapToSafeMap(exchange, Dict{Symbol, Any}());
    @test networkIdToCode(exchange, "Ether") == "ERC20";
    @test networkIdToCode(exchange, "Ether", "USDC") == "ERC20";
    @test networkIdToCode(exchange, "Ether", "ETH") == "ETH";
    @test networkIdToCode(exchange, "Tron") == "TRC20";
    @test networkIdToCode(exchange, "Tron", "USDC") == "TRC20";
    @test networkIdToCode(exchange, "Tron", "TRX") == "TRX";
    @test networkIdToCode(exchange, "Bitcoin") == "BTC";
    @test networkIdToCode(exchange, "Brc_20") == "BRC20";
    @test networkIdToCode(exchange, "Bitcoin", "USDC") == "BRC20";
    @test networkIdToCode(exchange, "Bitcoin", "BTC") == "BTC";
    @test networkIdToCode(exchange, "Brc_20", "USDC") == "BRC20";
    @test networkIdToCode(exchange, "Brc_20", "BTC") == "BTC";
    @test networkIdToCode(exchange, "Xyz") == "Xyz";
    @test networkIdToCode(exchange, "Xyz", "SAMPLECOIN") == "Xyz";
end


function helperBatchNetworkTests()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    defaultNetworkCodeReplacements = get(get(exchange, Symbol("options"), nothing), Symbol("defaultNetworkCodeReplacements"), nothing);
    allNetworkCodes = ["ETH", "ERC20", "TRON", "TRX", "TRC20", "SOL", "BSC", "BEP20", "ARBONE", "AVAXC", "POL", "BASE", "SUI", "OPTIMISM", "OP", "NEAR", "CRO", "CRONOS", "BTC", "APT", "SCR", "KAVA", "TON", "Cardano", "ADA", "HECO", "HT", "MNT", "ALGO", "RUNE", "OSMO", "CELO", "HBAR", "FTM", "zkSync", "EraZK", "KLAY", "ACA", "STX", "XTZ", "NEO", "METIS"];
    allCurrencyCodes = ["Bitcoin", "BTC", "Ethereum", "ETH", "Tether", "USDT", "BNB", "BNB", "XRP", "XRP", "USDC", "USDC", "Solana", "SOL", "TRON", "TRX", "Dogecoin", "DOGE", "Hyperliquid", "HYPE", "Bitcoin Cash", "BCH", "Cardano", "ADA", "LEO", "Chainlink", "LINK", "Ethena", "USDe", "USDe", "Monero", "XMR", "Stellar", "XLM", "Dai", "DAI", "Litecoin", "LTC", "PayPal", "USD", "PYUSD", "Hedera", "HBAR", "Avalanche", "AVAX", "Zcash", "ZEC", "Bittensor", "TAO", "Sui", "SUI", "Shiba Inu", "SHIB", "Cronos", "CRO", "Toncoin", "TON", "WLFI", "Tether", "Gold", "XAUt", "", "PAX", "Gold", "PAXG", "Mantle", "MNT", "Uniswap", "UNI", "Polkadot", "DOT", "USDG", "OKB", "OKB", "Aster", "ASTER", "Aave", "AAVE", "NEAR", "NEAR", "Ripple", "USD", "RLUSD", "Polygon", "POL"];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(allNetworkCodes)))
        randomNetworkCode = get(allNetworkCodes, i + 1, nothing);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(allCurrencyCodes)))
            randomCurrencyCode = get(allCurrencyCodes, j + 1, nothing);
            result = networkIdToCode(exchange, randomNetworkCode, randomCurrencyCode);
            keys_var = objectKeys(defaultNetworkCodeReplacements);
            k = 0
            while functions.ccxtruthy(functions.ccxt_lt(k, length(keys_var)))
                chainBaseCoin = get(keys_var, k + 1, nothing);
                chainMapping = get(defaultNetworkCodeReplacements, Symbol(chainBaseCoin), nothing);
                primaryNetworkCode = get(chainMapping, Symbol("primary"), nothing);
                secondaryNetworkCode = get(chainMapping, Symbol("secondary"), nothing);
                msg = string("network protocol test failed for networkCode:", randomNetworkCode, " & currencyCode: ", randomCurrencyCode, ", result: ", result, ", expected: ");
                if functions.ccxtruthy(randomNetworkCode == primaryNetworkCode)
                    if functions.ccxtruthy(randomCurrencyCode == chainBaseCoin)
                        @test result == primaryNetworkCode
                    else
                        @test result == secondaryNetworkCode
                    end
                elseif functions.ccxtruthy(randomNetworkCode == secondaryNetworkCode)
                    if functions.ccxtruthy(randomCurrencyCode == chainBaseCoin)
                        @test result == primaryNetworkCode
                    else
                        @test result == secondaryNetworkCode
                    end
                end
                k += 1
            end
            j += 1
        end
        i += 1
    end
end


function testNetworkMethods()

    dict1 = Dict{Symbol, Any}(
        Symbol("BTC") => "Bitcoin",
        Symbol("BRC20") => "Brc_20",
        Symbol("TRC20") => "Tron",
        Symbol("ETH") => "Ether"
    );
    dict2 = Dict{Symbol, Any}(
        Symbol("BTC") => "Bitcoin",
        Symbol("BRC20") => "Brc_20",
        Symbol("TRC20") => "Tron",
        Symbol("ERC20") => "Ether"
    );
    helperTestNetworkCodeToId(dict1);
    helperTestNetworkCodeToId(dict2);
    helperTestNetworkIdToCode(dict1);
    helperTestNetworkIdToCode(dict2);
    helperBatchNetworkTests();
end
