using Test
using Ccxt
function testProxies(exchange, skippedProperties)

    Base.fetch(testProxyUrl(exchange, skippedProperties));
    Base.fetch(testHttpProxy(exchange, skippedProperties));
    Base.fetch(testProxyForExceptions(exchange, skippedProperties));
    return true
end


function testProxyUrl(exchange, skippedProperties)

    method = "proxyUrl";
    proxyServerIp = "5.75.153.75";
    (proxyUrl, httpProxy, httpsProxy, socksProxy) = removeProxyOptions(testSharedMethods, exchange, skippedProperties);
    exchange.proxyUrl = string("http://", proxyServerIp, ":8090/proxy_url.php?caller=https://ccxt.com&url=");
    encodedColon = "%3A";
    encodedSlash = "%2F";
    ipCheckUrl = string("https", encodedColon, encodedSlash, encodedSlash, "api.ipify.org");
    response = Base.fetch(fetch(exchange, ipCheckUrl));
    @test response == proxyServerIp
    setProxyOptions(testSharedMethods, exchange, skippedProperties, proxyUrl, httpProxy, httpsProxy, socksProxy);
    return true
end


function testHttpProxy(exchange, skippedProperties)

    method = "httpProxy";
    proxyServerIp = "5.75.153.75";
    (proxyUrl, httpProxy, httpsProxy, socksProxy) = removeProxyOptions(testSharedMethods, exchange, skippedProperties);
    exchange.httpProxy = string("http://", proxyServerIp, ":8911");
    ipCheckUrl = "https://api.ipify.org/";
    response = Base.fetch(fetch(exchange, ipCheckUrl));
    @test response == proxyServerIp
    setProxyOptions(testSharedMethods, exchange, skippedProperties, proxyUrl, httpProxy, httpsProxy, socksProxy);
    return true
end


function testProxyForExceptions(exchange, skippedProperties)

    method = "testProxyForExceptions";
    (proxyUrl, httpProxy, httpsProxy, socksProxy) = removeProxyOptions(testSharedMethods, exchange, skippedProperties);
    possibleOptionsArray = ["proxyUrl", "proxyUrlCallback", "proxy_url", "proxy_url_callback", "httpProxy", "httpProxyCallback", "http_proxy", "http_proxy_callback", "httpsProxy", "httpsProxyCallback", "https_proxy", "https_proxy_callback", "socksProxy", "socksProxyCallback", "socks_proxy", "socks_proxy_callback"];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(possibleOptionsArray)))
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(possibleOptionsArray)))
            if functions.ccxtruthy(j != i)
                proxyFirst = get(possibleOptionsArray, i + 1, nothing);
                proxySecond = get(possibleOptionsArray, j + 1, nothing);
                setProperty(exchange, exchange, proxyFirst, "0.0.0.0");
                setProperty(exchange, exchange, proxySecond, "0.0.0.0");
                exceptionCaught = false;
                try
                    Base.fetch(fetch(exchange, "http://example.com"));
                catch e
                    exceptionCaught = true;

                end
                @test functions.ccxtruthy(exceptionCaught)
                setProperty(exchange, exchange, proxyFirst, nothing);
                setProperty(exchange, exchange, proxySecond, nothing);
            end
            j += 1
        end
        i += 1
    end
    setProxyOptions(testSharedMethods, exchange, skippedProperties, proxyUrl, httpProxy, httpsProxy, socksProxy);
    return true
end
