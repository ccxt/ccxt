using System.Reflection;
using ccxt;

namespace Tests;

public partial class BaseTest
{
    private const string retirementUrl = "ws://localhost:1234/retirement-race";

    private static BaseExchange.WebSocketClient makeSeededClient(string seed)
    {
        var client = new BaseExchange.WebSocketClient(retirementUrl, null, (c, m) => { });
        client.keepAlive = null;
        client.future(seed + "-pending");
        client.subscriptions[seed + "-subscription"] = new object();
        client.reject(new NetworkError(seed + "-rejection"), seed + "-orphan-hash");
        return client;
    }

    private static void assertRetired(BaseExchange.WebSocketClient client, string who)
    {
        Assert(client.futures.Count == 0, who + ": retirement must clear futures");
        Assert(client.subscriptions.Count == 0, who + ": retirement must clear subscriptions");
        Assert(client.rejections.Count == 0, who + ": retirement must clear rejections");
        Assert(client.webSocket.State != System.Net.WebSockets.WebSocketState.Open, who + ": retirement must terminate transport");
    }

    public async Task testWsClientRetirementReplacementRace()
    {
        var exchange = new BaseExchange();
        var callerClient = makeSeededClient("caller");
        var callerFuture = callerClient.futures["caller-pending"];
        var replacementClient = makeSeededClient("replacement");
        var replacementFuture = replacementClient.futures["replacement-pending"];
        exchange.clients[retirementUrl] = replacementClient;
        exchange.CleanupClients(callerClient, new NetworkError("simulated reconnect failure"));
        assertRetired(callerClient, "caller");
        Assert(callerFuture.task.IsCompleted, "caller: pending future must be settled by cleanup");
        await AssertRejectedWith<NetworkError>(callerFuture, "caller: pending future must reject with the cleanup error");
        Assert(exchange.clients.Count == 1 && ReferenceEquals(exchange.clients[retirementUrl], replacementClient), "replacement: must keep its registry slot");
        Assert(replacementClient.futures.Count == 1 && !replacementFuture.task.IsCompleted, "replacement: pending future must stay pending");
        Assert(replacementClient.subscriptions.Count == 1, "replacement: subscriptions must stay");
        Assert(replacementClient.rejections.Count == 1, "replacement: rejections must stay");
        Assert(replacementClient.webSocket.State != System.Net.WebSockets.WebSocketState.Aborted, "replacement: transport must stay usable");
    }

    public async Task testWsClientRetirementSameReference()
    {
        var exchange = new BaseExchange();
        var client = makeSeededClient("solo");
        var future = client.futures["solo-pending"];
        exchange.clients[retirementUrl] = client;
        exchange.CleanupClients(client, new NetworkError("transport error"));
        assertRetired(client, "solo");
        await AssertRejectedWith<NetworkError>(future, "solo: pending future must reject with the cleanup error");
        Assert(exchange.clients.Count == 0, "solo: registry must be empty after cleanup");
    }

    public async Task testWsClientCloseRetiresReplacedClient()
    {
        var exchange = new BaseExchange();
        var snapshotClient = makeSeededClient("snapshot");
        var replacementClient = makeSeededClient("late");
        var lateFuture = replacementClient.futures["late-pending"];
        exchange.clients[retirementUrl] = replacementClient;
        var closeClient = typeof(BaseExchange).GetMethod("closeClient", BindingFlags.Instance | BindingFlags.NonPublic);
        Assert(closeClient != null, "closeClient must exist on BaseExchange");
        await (Task)closeClient.Invoke(exchange, new object[] { retirementUrl, snapshotClient });
        assertRetired(snapshotClient, "snapshot");
        Assert(exchange.clients.Count == 1 && ReferenceEquals(exchange.clients[retirementUrl], replacementClient), "close: replacement must remain registered");
        Assert(replacementClient.futures.Count == 1 && !lateFuture.task.IsCompleted, "close: replacement future must stay pending");
        Assert(replacementClient.subscriptions.Count == 1, "close: replacement subscriptions must stay");
    }

    public async Task testWsClientRetireIsIdempotent()
    {
        var client = makeSeededClient("twice");
        var future = client.futures["twice-pending"];
        await client.retire(new NetworkError("first"));
        await client.retire(new NetworkError("second"));
        await client.Close();
        client.reject(new NetworkError("late"), "late-hash");
        assertRetired(client, "twice");
        await AssertRejectedWith<NetworkError>(future, "twice: the first retirement must win the settlement");
    }

    private static async Task AssertRejectedWith<T>(BaseExchange.Future future, string message) where T : Exception
    {
        try
        {
            await future.task;
            Assert(false, message + " (future resolved instead of rejecting)");
        }
        catch (T)
        {
        }
        catch (Exception e)
        {
            Assert(false, message + " (got " + e.GetType().Name + ": " + e.Message + ")");
        }
    }
}
