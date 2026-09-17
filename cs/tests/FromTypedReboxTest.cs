using System;
using System.Collections.Generic;

namespace Tests;

using ccxt;

public partial class BaseTest
{
    public void testFromTypedRebox()
    {
        // a typed core declared as Task<List<Dictionary<string, object>>> (the return-type map
        // in build/csharpTranspiler.ts) hands its result to the untyped pipeline through
        // FromTyped when the task goes through promiseAll / a dynamic call. List<T> is
        // invariant, so the generated safeList's (List<object>) cast throws unless FromTyped
        // reboxes the rows - this pins the rebox so the myriad fetchEvents crash cannot return
        var row = new Dictionary<string, object>() { { "id", "1" } };
        var typedList = new List<Dictionary<string, object>>() { row };
        var reboxed = ccxt.BaseExchange.FromTyped(typedList);
        Assert(reboxed is List<object>, "FromTyped should rebox List<Dictionary<string, object>> into a List<object>, got: " + reboxed.GetType().FullName);
        var reboxedList = (List<object>)reboxed;
        Assert(reboxedList.Count == 1, "the reboxed list should keep its rows");
        Assert(ReferenceEquals(reboxedList[0], row), "the rebox must keep the row references, not copy the rows");
        // the original crash path: safeList over a container holding the reboxed rows
        var exchange = new ccxt.Exchange();
        var container = new Dictionary<string, object>() { { "rows", reboxed } };
        var viaSafeList = exchange.safeList(container, "rows");
        Assert(viaSafeList != null && viaSafeList.Count == 1, "safeList must read the reboxed rows without an InvalidCastException");
        // the healthy path stays copy-free: an already-untyped list passes through unchanged
        var plain = new List<object>() { row };
        Assert(ReferenceEquals(ccxt.BaseExchange.FromTyped(plain), plain), "an already-untyped List<object> must pass through FromTyped unchanged");
        Assert(ReferenceEquals(ccxt.BaseExchange.FromDictList(plain), plain), "an already-untyped List<object> must pass through FromDictList unchanged");
    }
}
