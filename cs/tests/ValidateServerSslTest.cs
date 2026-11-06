using System.Diagnostics;
using ccxt;

namespace Tests;

// native cs test, hand-written - validateServerSsl = false must let both REST and WS
// connect to a server whose certificate is self-signed, expired and issued for another
// hostname, while the default (true) must reject it. the shared server lives in
// ts/src/test/static/ssl/server.cjs (requires node on PATH)

public partial class BaseTest
{
    private static (Process, int) startSslTestServer()
    {
        var script = Path.GetFullPath(Path.Combine(Tests.ccxtBaseDir, "ts", "src", "test", "static", "ssl", "server.cjs"));
        var startInfo = new ProcessStartInfo("node", "\"" + script + "\"")
        {
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            UseShellExecute = false,
        };
        var process = Process.Start(startInfo);
        var line = process.StandardOutput.ReadLine();
        Assert(int.TryParse(line?.Trim(), out var port), "ssl test server did not report its port: " + line);
        return (process, port);
    }

    private static async Task<object> sslTestWs(Exchange exchange, string url)
    {
        var received = new TaskCompletionSource<object>(TaskCreationOptions.RunContinuationsAsynchronously);
        var client = exchange.client(url);
        client.handleMessage = (c, message) => received.TrySetResult(message);
        try
        {
            await client.connect().WaitAsync(TimeSpan.FromSeconds(10));
            return await received.Task.WaitAsync(TimeSpan.FromSeconds(10));
        }
        finally
        {
            await exchange.close();
        }
    }

    private static async Task<bool> sslTestFails(Func<Task> action)
    {
        try
        {
            await action();
        }
        catch (TimeoutException)
        {
            throw;
        }
        catch (Exception)
        {
            return true;
        }
        return false;
    }

    public async Task testValidateServerSsl()
    {
        var (process, port) = startSslTestServer();
        var restUrl = "https://127.0.0.1:" + port + "/ping";
        var wsUrl = "wss://127.0.0.1:" + port + "/ws";
        try
        {
            var strict = new Exchange(new Dictionary<string, object>() { { "timeout", 5000 } });
            Assert(strict.validateServerSsl, "validateServerSsl must default to true");
            Assert(await sslTestFails(() => strict.fetch(restUrl, "GET")), "REST must fail against an invalid certificate by default");
            Assert(await sslTestFails(() => sslTestWs(new Exchange(), wsUrl)), "WS must fail against an invalid certificate by default");

            var laxConfig = new Dictionary<string, object>() { { "timeout", 5000 }, { "validateServerSsl", false } };
            var lax = new Exchange(laxConfig);
            Assert(!lax.validateServerSsl, "validateServerSsl: false must be read from the config");
            var response = await lax.fetch(restUrl, "GET") as Dictionary<string, object>;
            Assert(response != null && Equals(response["ok"], true), "REST must succeed with validateServerSsl = false");
            var message = await sslTestWs(new Exchange(laxConfig), wsUrl) as Dictionary<string, object>;
            Assert(message != null && Equals(message["ok"], true), "WS must succeed with validateServerSsl = false");

            // flipping the property after construction must rebuild the http client
            var flipped = new Exchange();
            Assert(await sslTestFails(() => flipped.fetch(restUrl, "GET")), "REST must fail before the flag is flipped");
            flipped.validateServerSsl = false;
            var flippedResponse = await flipped.fetch(restUrl, "GET") as Dictionary<string, object>;
            Assert(flippedResponse != null && Equals(flippedResponse["ok"], true), "REST must honor validateServerSsl set after construction");
        }
        finally
        {
            try
            {
                process.StandardInput.Close();
                process.Kill();
            }
            catch (Exception) { }
            process.Dispose();
        }
    }
}
