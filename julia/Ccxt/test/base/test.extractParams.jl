using Test
using Ccxt
function testExtractParams()

    exchange = get(ccxt, Symbol("Exchange"), nothing)(Dict{Symbol, Any}(
        Symbol("id") => "sampleexchange"
    ));
    result1 = extractParams(exchange, "/users/{id}");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result1, ["id"]);
    result2 = extractParams(exchange, "/users/{user_id}/orders/{order_id}");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result2, ["user_id", "order_id"]);
    result3 = extractParams(exchange, "/api/health");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result3, []);
    result4 = extractParams(exchange, "/api/{resource-name}/{resource-id}");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result4, ["resource-name", "resource-id"]);
    result5 = extractParams(exchange, "/v1/{version}/users/{user_id}/profile");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result5, ["version", "user_id"]);
    result6 = extractParams(exchange, "");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result6, []);
    result7 = extractParams(exchange, "/api/{org}/{repo}/pulls/{pull_number}/comments/{comment_id}");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result7, ["org", "repo", "pull_number", "comment_id"]);
    result8 = extractParams(exchange, "{start}/middle/{end}");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result8, ["start", "end"]);
    result9 = extractParams(exchange, "{a}{b}{c}");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result9, ["a", "b", "c"]);
    result10 = extractParams(exchange, "/api/{my_param_name}");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result10, ["my_param_name"]);
    result11 = extractParams(exchange, "/api/{x}");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result11, ["x"]);
    result12 = extractParams(exchange, "/api/v1/users/orders/items");
    assertDeepEqual(testSharedMethods, exchange, nothing, "testExtractParams", result12, []);
end
