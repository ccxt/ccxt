using System;
using System.Collections.Generic;

namespace Tests;

using ccxt;

public partial class BaseTest
{
    // a present option of the wrong type throws BadRequest in C# (JS/Python/PHP pass it through)
    public void testOptionTypes()
    {
        var exchange = new ccxt.Exchange(new Dictionary<string, object>() {
            { "id", "sampleexchange" },
            { "options", new Dictionary<string, object>() {
                { "fetchX", new Dictionary<string, object>() {
                    { "wrongBool", "yes" },
                    { "wrongString", 5 },
                    { "wrongInteger", "5" },
                    { "fractionInteger", 1.5 },
                    { "integralDouble", 2.0 },
                } },
            } },
        });
        assertOptionThrows(() => exchange.handleOptionBoolAndParams(new Dictionary<string, object>(), "fetchX", "wrongBool", false), "fetchX() option wrongBool must be a boolean");
        assertOptionThrows(() => exchange.handleOptionStringAndParams(new Dictionary<string, object>(), "fetchX", "wrongString", "x"), "fetchX() option wrongString must be a string");
        assertOptionThrows(() => exchange.handleOptionIntegerAndParams(new Dictionary<string, object>(), "fetchX", "wrongInteger", 1), "fetchX() option wrongInteger must be an integer");
        assertOptionThrows(() => exchange.handleOptionIntegerAndParams(new Dictionary<string, object>(), "fetchX", "fractionInteger", 1), "fetchX() option fractionInteger must be an integer");
        Assert(Equals(exchange.handleOptionIntegerAndParams(new Dictionary<string, object>(), "fetchX", "integralDouble", 1).Item1, (Int64)2), "an integral double option reads as Int64");
        assertOptionThrows(() => exchange.handleMarginModeAndParams("fetchX", new Dictionary<string, object>() { { "marginMode", false } }), "fetchX() option marginMode must be a string");
    }

    static void assertOptionThrows(Action call, string message)
    {
        try
        {
            call();
        }
        catch (BadRequest e)
        {
            Assert(e.Message.Contains(message), "unexpected BadRequest message for: " + message);
            return;
        }
        Assert(false, "expected a BadRequest: " + message);
    }
}
