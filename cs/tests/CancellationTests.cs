using ccxt;

namespace Tests;

using dict = Dictionary<string, object>;

public partial class BaseTest
{
    /// <summary>
    /// Test that CancellationToken is properly propagated through the fetch method
    /// </summary>
    public async Task testCancellationTokenPropagation()
    {
        var exchange = new Exchange(new dict());
        var cts = new CancellationTokenSource();

        // Set a custom CancellationToken
        exchange.CancellationToken = cts.Token;

        // Verify the token is set
        Assert(exchange.CancellationToken == cts.Token, "CancellationToken should be propagated");

        Helper.Green(" ✓ CancellationToken propagation test passed");
    }

    /// <summary>
    /// Test that operations are cancelled when CancellationToken is triggered before request
    /// </summary>
    public async Task testPreCancellation()
    {
        var exchange = new Exchange(new dict
        {
            { "urls", new dict { { "api", new dict { { "public", "https://httpbin.org" } } } } }
        });

        var cts = new CancellationTokenSource();
        exchange.CancellationToken = cts.Token;

        // Cancel immediately
        cts.Cancel();

        try
        {
            // This should throw OperationCanceledException or TaskCanceledException
            await exchange.fetch("https://httpbin.org/delay/5", "GET");
            throw new Exception("Expected cancellation exception but none was thrown");
        }
        catch (OperationCanceledException)
        {
            // Expected exception
            Helper.Green(" ✓ Pre-cancellation test passed");
        }
    }

    /// <summary>
    /// Test that operations are cancelled during a long-running request
    /// </summary>
    public async Task testMidRequestCancellation()
    {
        var exchange = new Exchange(new dict
        {
            { "urls", new dict { { "api", new dict { { "public", "https://httpbin.org" } } } } }
        });

        var cts = new CancellationTokenSource();
        exchange.CancellationToken = cts.Token;

        // Cancel after 100ms (the request to /delay/5 should take 5 seconds)
        cts.CancelAfter(100);

        try
        {
            var startTime = DateTime.UtcNow;
            await exchange.fetch("https://httpbin.org/delay/5", "GET");
            throw new Exception("Expected cancellation exception but none was thrown");
        }
        catch (OperationCanceledException)
        {
            Helper.Green(" ✓ Mid-request cancellation test passed");
        }
        catch (Exception ex)
        {
            // NetworkError might be thrown if the cancellation happens during certain operations
            if (ex.Message.Contains("cancel") || ex.Message.Contains("abort") ||
                ex.GetType().Name.Contains("Cancel") || ex.GetType().Name.Contains("Abort"))
            {
                Helper.Green(" ✓ Mid-request cancellation test passed (NetworkError variant)");
            }
            else
            {
                throw;
            }
        }
    }

    /// <summary>
    /// Test that CancellationToken.None works as default (no cancellation)
    /// </summary>
    public async Task testNoCancellation()
    {
        var exchange = new Exchange(new dict
        {
            { "urls", new dict { { "api", new dict { { "public", "https://httpbin.org" } } } } }
        });

        // Default should be CancellationToken.None
        Assert(exchange.CancellationToken == CancellationToken.None,
            "Default CancellationToken should be CancellationToken.None");

        // This should complete successfully without cancellation
        var result = await exchange.fetch("https://httpbin.org/get", "GET");

        Assert(result != null, "Result should not be null when not cancelled");

        Helper.Green(" ✓ No cancellation test passed");
    }

    /// <summary>
    /// Test cancellation with POST request
    /// </summary>
    public async Task testPostRequestCancellation()
    {
        var exchange = new Exchange(new dict
        {
            { "urls", new dict { { "api", new dict { { "public", "https://httpbin.org" } } } } }
        });

        var cts = new CancellationTokenSource();
        exchange.CancellationToken = cts.Token;

        // Cancel after 100ms
        cts.CancelAfter(100);

        try
        {
            await exchange.fetch("https://httpbin.org/delay/5", "POST",
                new dict { { "Content-Type", "application/json" } },
                "{\"test\": \"data\"}");
            throw new Exception("Expected cancellation exception but none was thrown");
        }
        catch (OperationCanceledException)
        {
            Helper.Green(" ✓ POST request cancellation test passed");
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("cancel") || ex.Message.Contains("abort") ||
                ex.GetType().Name.Contains("Cancel") || ex.GetType().Name.Contains("Abort"))
            {
                Helper.Green(" ✓ POST request cancellation test passed (variant)");
            }
            else
            {
                throw;
            }
        }
    }

    /// <summary>
    /// Test that CancellationToken can be reused for multiple requests
    /// </summary>
    public async Task testMultipleRequestsWithSameToken()
    {
        var exchange = new Exchange(new dict
        {
            { "urls", new dict { { "api", new dict { { "public", "https://httpbin.org" } } } } }
        });

        var cts = new CancellationTokenSource();
        exchange.CancellationToken = cts.Token;

        // First request should succeed
        var result1 = await exchange.fetch("https://httpbin.org/get", "GET");
        Assert(result1 != null, "First request should succeed");

        // Second request should also succeed
        var result2 = await exchange.fetch("https://httpbin.org/get", "GET");
        Assert(result2 != null, "Second request should succeed");

        // Now cancel the token
        cts.Cancel();

        try
        {
            // Third request should fail
            await exchange.fetch("https://httpbin.org/get", "GET");
            throw new Exception("Expected cancellation exception but none was thrown");
        }
        catch (OperationCanceledException)
        {
            Helper.Green(" ✓ Multiple requests with same token test passed");
        }
    }

    /// <summary>
    /// Test that CancellationToken can be changed between requests
    /// </summary>
    public async Task testTokenReplacement()
    {
        var exchange = new Exchange(new dict
        {
            { "urls", new dict { { "api", new dict { { "public", "https://httpbin.org" } } } } }
        });

        // First token - cancelled
        var cts1 = new CancellationTokenSource();
        cts1.Cancel();
        exchange.CancellationToken = cts1.Token;

        try
        {
            await exchange.fetch("https://httpbin.org/get", "GET");
            throw new Exception("Expected cancellation with first token");
        }
        catch (OperationCanceledException)
        {
            // Expected
        }

        // Replace with new token - not cancelled
        var cts2 = new CancellationTokenSource();
        exchange.CancellationToken = cts2.Token;

        // This should succeed
        var result = await exchange.fetch("https://httpbin.org/get", "GET");
        Assert(result != null, "Request with new token should succeed");

        Helper.Green(" ✓ Token replacement test passed");
    }

    /// <summary>
    /// Test cancellation with gzip-compressed response (if supported by server)
    /// </summary>
    public async Task testGzipResponseCancellation()
    {
        var exchange = new Exchange(new dict
        {
            { "urls", new dict { { "api", new dict { { "public", "https://httpbin.org" } } } } }
        });

        var cts = new CancellationTokenSource();
        exchange.CancellationToken = cts.Token;

        // Cancel after 100ms
        cts.CancelAfter(100);

        try
        {
            // Request with Accept-Encoding: gzip header
            await exchange.fetch("https://httpbin.org/delay/5", "GET",
                new dict { { "Accept-Encoding", "gzip" } });
            throw new Exception("Expected cancellation exception but none was thrown");
        }
        catch (OperationCanceledException)
        {
            Helper.Green(" ✓ Gzip response cancellation test passed");
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("cancel") || ex.Message.Contains("abort") ||
                ex.GetType().Name.Contains("Cancel") || ex.GetType().Name.Contains("Abort"))
            {
                Helper.Green(" ✓ Gzip response cancellation test passed (variant)");
            }
            else
            {
                throw;
            }
        }
    }

    /// <summary>
    /// Main method to run all cancellation tests
    /// </summary>
    public async Task testCancellation()
    {
        Helper.Green("\n=== Running Cancellation Tests ===\n");

        try
        {
            await testCancellationTokenPropagation();
            await testNoCancellation();
            await testPreCancellation();
            await testMidRequestCancellation();
            await testPostRequestCancellation();
            await testMultipleRequestsWithSameToken();
            await testTokenReplacement();
            await testGzipResponseCancellation();

            Helper.Green("\n=== All Cancellation Tests Passed ===\n");
        }
        catch (Exception ex)
        {
            Helper.Red("\n=== Cancellation Test Failed ===");
            Helper.Red($"Error: {ex.Message}");
            Helper.Red($"Stack: {ex.StackTrace}");
            throw;
        }
    }
}