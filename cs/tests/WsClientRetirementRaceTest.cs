using System.Reflection;
using ccxt;

namespace Tests;

// native cs test, hand-written - pins the retirement half of the ws client
// lifecycle (https://github.com/ccxt/ccxt/issues/30463): cleanup used to treat
// "the client" and "the registry entry under client.url" as the same object,
// but a concurrent reconnect can install a replacement client under the same
// url between a transport event and the cleanup that follows it. Retirement
// must be tied to the reference that actually errored/closed - reject and
// clear its pending futures, subscriptions and rejections, and stop its
// transport - while a replacement found under the same key must either stay
// untouched (error path, CleanupClients) or be closed as well (user path,
// closeClient). All tests are offline: the clients never connect, the url is
// synthetic, mirroring the reproducer posted on the issue.

public partial class BaseTest
{
    private const string retirementUrl = "ws://localhost:1234/retirement-race";

    private static BaseExchange.WebSocketClient makeSeededClient(string seed)
    {
        var client = new BaseExchange.WebSocketClient(retirementUrl, null, (c, m) => { });
        client.keepAlive = null; // no ping loop in offline tests
        client.future(seed + "-pending");
        client.subscriptions[seed + "-subscription"] = new object();
        client.reject(new NetworkError(seed + "-rejection"), seed + "-orphan-hash"); // lands in rejections: no future under that hash
        return client;
    }

    private static void assertRetired(BaseExchange.WebSocketClient client, string who)
    {
        Assert(client.futures.Count == 0, who + ": retirement must clear futures");
        Assert(client.subscriptions.Count == 0, who + ": retirement must clear subscriptions");
        Assert(client.rejections.Count == 0, who + ": retirement must clear rejections");
        Assert(client.webSocket.State != System.Net.WebSockets.WebSocketState.Open, who + ": retirement must terminate the transport");
    }

    public async Task testWsClientRetirementReplacementRace()
    {
        // error path: the caller's client retires, the replacement under the
        // same url keeps its state and its registry slot
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
        // error path, no race: the registered client itself errors - retired
        // and removed, nothing left behind (the released 4.5.77 cleanup left
        // rejections behind even here, see the reproducer on the issue)
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
        // user path: closeClient(key, client) races a reconnect that installed
        // a replacement under the same key - both references must end retired
        var exchange = new BaseExchange();
        var snapshotClient = makeSeededClient("snapshot");
        var replacementClient = makeSeededClient("late");
        var lateFuture = replacementClient.futures["late-pending"];
        exchange.clients[retirementUrl] = replacementClient;
        var closeClient = typeof(BaseExchange).GetMethod("closeClient", BindingFlags.Instance | BindingFlags.NonPublic);
        Assert(closeClient != null, "closeClient must exist on BaseExchange");
        await (Task)closeClient.Invoke(exchange, new object[] { retirementUrl, snapshotClient });
        assertRetired(snapshotClient, "snapshot");
        assertRetired(replacementClient, "late");
        await AssertRejectedWith<ExchangeClosedByUser>(lateFuture, "late: replacement future must reject as closed-by-user");
        Assert(exchange.clients.Count == 0, "close: registry must be empty");
    }

    public async Task testWsClientRetireIsIdempotent()
    {
        // onError, a late onClose and Close() may all race into retire - the
        // consumer sees exactly one settlement, and every caller receives the
        // same memoized retirement task (a repeat caller awaiting it awaits
        // the actual teardown, not a bare "someone else started it")
        var client = makeSeededClient("twice");
        var future = client.futures["twice-pending"];
        var firstRetirement = client.retire(new NetworkError("first"));
        var secondRetirement = client.retire(new NetworkError("second"));
        Assert(ReferenceEquals(firstRetirement, secondRetirement), "twice: repeat retire must return the same in-flight retirement task");
        await firstRetirement;
        await client.Close(); // third path into retire
        assertRetired(client, "twice");
        await AssertRejectedWith<NetworkError>(future, "twice: the first retirement must win the settlement");
    }

    public async Task testWsClientRetiredClientShedsLateTraffic()
    {
        // a watch() that read this client out of the registry just before
        // cleanup detached it can still talk to it after retirement - a late
        // future() must come back already rejected with the retirement error
        // instead of parking forever, and a late per-hash reject must not
        // repopulate the rejections dictionary retire() just cleared
        var client = makeSeededClient("late");
        await client.retire(new NetworkError("retired"));
        var lateFuture = client.future("post-retirement-hash");
        await AssertRejectedWith<NetworkError>(lateFuture, "late: post-retirement future must reject immediately");
        Assert(client.futures.Count == 0, "late: post-retirement future must not be parked");
        client.reject(new NetworkError("straggler"), "straggler-hash");
        Assert(client.rejections.Count == 0, "late: post-retirement reject must not repopulate rejections");
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
            // expected
        }
        catch (Exception e)
        {
            Assert(false, message + " (got " + e.GetType().Name + ": " + e.Message + ")");
        }
    }
}
