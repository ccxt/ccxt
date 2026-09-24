using System.Collections.Generic;
using System.Threading.Tasks;

namespace Tests;

using ccxt;

public partial class BaseTest
{
    // A typed core declared as Task<List<Dictionary<string, object>>> (the return-type map in
    // build/csharpTranspiler.ts) loses its static type on the reflective await path: promiseAll
    // and callDynamically go through AsTaskOfObject -> AwaitAsObject, which hands the result to
    // the untyped pipeline. List<T> is invariant, so the generated safeList's (List<object>)
    // cast throws unless that seam reboxes the rows - the myriad fetchEvents crash.
    //
    // The rebox cannot live in FromTyped: that switch is emitted by
    // build/generateTypedCoreHelpers.py from the struct families, so a hand-added
    // List<Dictionary<string, object>> case is deleted by the next regeneration. This test
    // therefore exercises the hand-written seam and the generated safeList, not the switch.
    public async Task testFromTypedRebox()
    {
        var row = new Dictionary<string, object>() { { "id", "1" } };
        var exchange = new ccxt.Exchange();

        // the direct-await call sites: generated code wraps the core in FromDictList
        var reboxed = ccxt.BaseExchange.FromDictList(new List<Dictionary<string, object>>() { row });
        Assert(reboxed is List<object>, "FromDictList should rebox List<Dictionary<string, object>> into a List<object>, got: " + reboxed.GetType().FullName);
        Assert(ReferenceEquals(((List<object>)reboxed)[0], row), "the rebox must keep the row references, not copy the rows");

        // the crash path: a typed task awaited reflectively, then read back through safeList
        var typedTask = Task.FromResult(new List<Dictionary<string, object>>() { row });
        var awaited = await ccxt.BaseExchange.AsTaskOfObject(typedTask);
        Assert(awaited is List<object>, "the reflective await must rebox a typed dict list into a List<object>, got: " + awaited.GetType().FullName);
        var container = new Dictionary<string, object>() { { "rows", awaited } };
        var viaSafeList = exchange.safeList(container, "rows");
        Assert(viaSafeList != null && viaSafeList.Count == 1, "safeList must read the reflectively-awaited rows without an InvalidCastException");

        // the reported repro: Promise.all of two typed cores, then safeList over a result
        var gathered = await ccxt.BaseExchange.PromiseAll(new List<object>() {
            Task.FromResult(new List<Dictionary<string, object>>() { row }),
            Task.FromResult(new List<Dictionary<string, object>>() { row }),
        });
        Assert(gathered.Count == 2, "promiseAll should return one result per task");
        var gatheredContainer = new Dictionary<string, object>() { { "rows", gathered[0] } };
        var gatheredRows = exchange.safeList(gatheredContainer, "rows");
        Assert(gatheredRows != null && gatheredRows.Count == 1, "safeList must read rows gathered through promiseAll");

        // the healthy paths stay copy-free: an already-untyped list is passed through, not cloned
        var plain = new List<object>() { row };
        Assert(ReferenceEquals(ccxt.BaseExchange.FromDictList(plain), plain), "an already-untyped List<object> must pass through FromDictList unchanged");
        Assert(ReferenceEquals(await ccxt.BaseExchange.AsTaskOfObject(Task.FromResult(plain)), plain), "an already-untyped List<object> must pass through the reflective await unchanged");

        // Network fees contain separate deposit/withdraw leaves, not a single fee.
        var networkFees = new Dictionary<string, object>() {
            { "deposit", new Dictionary<string, object>() { { "fee", null }, { "percentage", null } } },
            { "withdraw", new Dictionary<string, object>() { { "fee", 3.0 }, { "percentage", false } } },
        };
        var feeData = new Dictionary<string, object>() {
            { "info", new Dictionary<string, object>() },
            { "deposit", networkFees["deposit"] },
            { "withdraw", networkFees["withdraw"] },
            { "networks", new Dictionary<string, object>() { { "BEP20", networkFees } } },
        };
        var typedFee = new DepositWithdrawFee(feeData);
        Assert(typedFee.networks["BEP20"].withdraw?.fee == 3.0, "the typed network must retain its withdrawal fee");
        Assert(typedFee.networks["BEP20"].withdraw?.percentage == false, "the typed network must retain false percentage");
        Assert(typedFee.networks["BEP20"].deposit.HasValue && typedFee.networks["BEP20"].deposit?.fee == null, "an unknown deposit fee must remain null");
        var restored = (Dictionary<string, object>)ccxt.BaseExchange.FromDepositWithdrawFee(typedFee);
        var restoredNetworks = (Dictionary<string, object>)restored["networks"];
        var restoredNetwork = (Dictionary<string, object>)restoredNetworks["BEP20"];
        var restoredWithdrawal = (Dictionary<string, object>)restoredNetwork["withdraw"];
        Assert((double)restoredWithdrawal["fee"] == 3.0, "production conversion must retain the nested withdrawal fee");
        var projected = (Dictionary<string, object>)testMainClass.detypeForComparison(typedFee);
        Assert(projected.ContainsKey("networks") && !projected.ContainsKey("BEP20"), "comparison must keep networks nested");
        var projectedNetworks = (Dictionary<string, object>)projected["networks"];
        var projectedNetwork = (Dictionary<string, object>)projectedNetworks["BEP20"];
        var projectedDeposit = (Dictionary<string, object>)projectedNetwork["deposit"];
        Assert(projectedDeposit.ContainsKey("fee") && projectedDeposit["fee"] == null, "comparison must retain explicit null fees");
        var fees = new DepositWithdrawFees(new Dictionary<string, object>() { { "ACE", feeData } });
        var projectedFees = (Dictionary<string, object>)testMainClass.detypeForComparison(fees);
        Assert(projectedFees.ContainsKey("ACE"), "the top-level currency container must still unwrap");
        var projectedFee = (Dictionary<string, object>)projectedFees["ACE"];
        Assert(projectedFee.ContainsKey("networks") && !projectedFee.ContainsKey("BEP20"), "nested networks must survive the fee container");
    }
}
