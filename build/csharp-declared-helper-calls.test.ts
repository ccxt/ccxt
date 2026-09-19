// Emission checks for build/csharpTranspiler.ts#nativeDeclaredHelperCalls — the text-pass rule
// that turns `getArrayLength(x)` / `inOp(x, k)` into the member the C# helper's own runtime
// branch performs, when the EMITTED signature / declarations type the receiver.
//
//   npx tsx build/csharp-declared-helper-calls.test.ts
//
// The positive cases fail on a tree where the rule is not installed (the helper call is returned
// unchanged); the negative cases must pass on both.
import { nativeDeclaredHelperCalls } from './csharpTranspiler.js';

let failures = 0;
const check = (name: string, source: string, expected: string) => {
    const output: string = nativeDeclaredHelperCalls (source);
    const ok = output === expected;
    console.log ((ok ? 'ok   ' : 'FAIL ') + name);
    if (!ok) {
        failures++;
        console.log ('  source:   ' + JSON.stringify (source));
        console.log ('  expected: ' + JSON.stringify (expected));
        console.log ('  actual:   ' + JSON.stringify (output));
    }
};

// ---- getArrayLength ----

check ('parameter narrowed to string by the emitted signature',
    '    public virtual object getDelistedMarketById(string id)\n    {\n        if ((getArrayLength(id) == 8))\n        {\n            return id;\n        }\n        return null;\n    }',
    '    public virtual object getDelistedMarketById(string id)\n    {\n        if (((id?.Length ?? 0) == 8))\n        {\n            return id;\n        }\n        return null;\n    }');

check ('local declared List<object> before the read',
    '    public virtual object f(object a)\n    {\n        List<object> symbols = new List<object>() {};\n        for (int i = 0; i < getArrayLength(symbols); i++)\n        {\n            object s = symbols[i];\n        }\n        return a;\n    }',
    '    public virtual object f(object a)\n    {\n        List<object> symbols = new List<object>() {};\n        for (int i = 0; i < (symbols?.Count ?? 0); i++)\n        {\n            object s = symbols[i];\n        }\n        return a;\n    }');

check ('parameter typed IDictionary keeps the helper for getArrayLength',
    '    public virtual object f(IDictionary<string, object> result)\n    {\n        int n = getArrayLength(result);\n        return n;\n    }',
    '    public virtual object f(IDictionary<string, object> result)\n    {\n        int n = (result?.Count ?? 0);\n        return n;\n    }');

check ('byte[] parameter reads Length',
    '    public virtual object f(byte[] data)\n    {\n        return getArrayLength(data);\n    }',
    '    public virtual object f(byte[] data)\n    {\n        return (data?.Length ?? 0);\n    }');

check ('object receiver keeps the helper',
    '    public virtual object f(object trades)\n    {\n        return getArrayLength(trades);\n    }',
    '    public virtual object f(object trades)\n    {\n        return getArrayLength(trades);\n    }');

check ('receiver declared with two different types in one method keeps the helper',
    '    public virtual object f(object a)\n    {\n        List<object> xs = new List<object>() {};\n        {\n            object xs = a;\n            return getArrayLength(xs);\n        }\n    }',
    '    public virtual object f(object a)\n    {\n        List<object> xs = new List<object>() {};\n        {\n            object xs = a;\n            return getArrayLength(xs);\n        }\n    }');

check ('receiver declared with a multi-line `new` initializer is non-null',
    '    public virtual object f(object message)\n    {\n        Dictionary<string, object> methods = new Dictionary<string, object>() {\n            { "a", 1 },\n        };\n        string channel = "x";\n        if (inOp(methods, channel))\n        {\n            return message;\n        }\n        return null;\n    }',
    '    public virtual object f(object message)\n    {\n        Dictionary<string, object> methods = new Dictionary<string, object>() {\n            { "a", 1 },\n        };\n        string channel = "x";\n        if (methods.ContainsKey(channel))\n        {\n            return message;\n        }\n        return null;\n    }');

check ('receiver reassigned from a nullable producer keeps the null-safe Count form',
    '    public virtual object f(object a)\n    {\n        List<object> xs = new List<object>() {};\n        xs = a;\n        return getArrayLength(xs);\n    }',
    '    public virtual object f(object a)\n    {\n        List<object> xs = new List<object>() {};\n        xs = a;\n        return (xs?.Count ?? 0);\n    }');

check ('receiver named in a comment or a string keeps the helper',
    '    public virtual object f(object a)\n    {\n        // getArrayLength(symbols)\n        string s = "getArrayLength(symbols)";\n        return s;\n    }',
    '    public virtual object f(object a)\n    {\n        // getArrayLength(symbols)\n        string s = "getArrayLength(symbols)";\n        return s;\n    }');

// ---- inOp ----

check ('dict local + string local key',
    '    public virtual object removeRepeated(object input)\n    {\n        Dictionary<string, object> uniqueResult = new Dictionary<string, object>() {};\n        string id = "x";\n        if (!(inOp(uniqueResult, id)))\n        {\n            ((IDictionary<string,object>)uniqueResult)[(string)id] = input;\n        }\n        return input;\n    }',
    '    public virtual object removeRepeated(object input)\n    {\n        Dictionary<string, object> uniqueResult = new Dictionary<string, object>() {};\n        string id = "x";\n        if (!(uniqueResult.ContainsKey(id)))\n        {\n            ((IDictionary<string,object>)uniqueResult)[(string)id] = input;\n        }\n        return input;\n    }');

check ('dict local from a nullable producer gets the null test',
    '    public virtual object f(object response, string id)\n    {\n        IDictionary<string, object> result = this.safeDict(response, "result", new List<object>() {});\n        if (!(inOp(result, id)))\n        {\n            throw new OrderNotFound ("missing");\n        }\n        return result;\n    }',
    '    public virtual object f(object response, string id)\n    {\n        IDictionary<string, object> result = this.safeDict(response, "result", new List<object>() {});\n        if (!((result != null && result.ContainsKey(id))))\n        {\n            throw new OrderNotFound ("missing");\n        }\n        return result;\n    }');

check ('dict parameter with a literal key gets the null test',
    '    public virtual object parseFee(object fee, IDictionary<string, object> parameters)\n    {\n        if (inOp(parameters, "rate"))\n        {\n            return fee;\n        }\n        return null;\n    }',
    '    public virtual object parseFee(object fee, IDictionary<string, object> parameters)\n    {\n        if ((parameters != null && parameters.ContainsKey("rate")))\n        {\n            return fee;\n        }\n        return null;\n    }');

check ('params-bag parameter needs no null test',
    '    public virtual object f(IDictionary<string, object> parameters)\n    {\n        parameters ??= new Dictionary<string, object>();\n        if (inOp(parameters, "rate"))\n        {\n            return parameters;\n        }\n        return null;\n    }',
    '    public virtual object f(IDictionary<string, object> parameters)\n    {\n        parameters ??= new Dictionary<string, object>();\n        if (parameters.ContainsKey("rate"))\n        {\n            return parameters;\n        }\n        return null;\n    }');

check ('nullable string key keeps the helper',
    '    public virtual object f(Dictionary<string, object> uniqueResult, object entry)\n    {\n        string? id = this.safeString(entry, "id");\n        if (!(inOp(uniqueResult, id)))\n        {\n            return id;\n        }\n        return null;\n    }',
    '    public virtual object f(Dictionary<string, object> uniqueResult, object entry)\n    {\n        string? id = this.safeString(entry, "id");\n        if (!(inOp(uniqueResult, id)))\n        {\n            return id;\n        }\n        return null;\n    }');

check ('object dict receiver keeps the helper',
    '    public virtual object f(object networks, string code)\n    {\n        if (inOp(networks, code))\n        {\n            return networks;\n        }\n        return null;\n    }',
    '    public virtual object f(object networks, string code)\n    {\n        if (inOp(networks, code))\n        {\n            return networks;\n        }\n        return null;\n    }');

check ('List<object> receiver with a non-null key -> Contains',
    '    public virtual object f(object eventVar)\n    {\n        List<object> marketIds = new List<object>() {};\n        string marketId = "x";\n        if (!(inOp(marketIds, marketId)))\n        {\n            ((IList<object>)marketIds).Add(marketId);\n        }\n        return eventVar;\n    }',
    '    public virtual object f(object eventVar)\n    {\n        List<object> marketIds = new List<object>() {};\n        string marketId = "x";\n        if (!(marketIds.Contains(marketId)))\n        {\n            ((IList<object>)marketIds).Add(marketId);\n        }\n        return eventVar;\n    }');

check ('three-argument inOp keeps the helper (inner getValue converts)',
    '    public virtual object f(object a, object b)\n    {\n        IDictionary<string, object> m = new Dictionary<string, object>() {};\n        return inOp(getValue(m, "x"), b);\n    }',
    '    public virtual object f(object a, object b)\n    {\n        IDictionary<string, object> m = new Dictionary<string, object>() {};\n        return inOp((m != null && m.ContainsKey("x") ? m["x"] : null), b);\n    }');

// ---- getValue ----

check ('dict parameter + literal key (D-17/D-18 typed param) -> key-tested read',
    '    public virtual object parseFee(object fee, Dictionary<string, object> parameters)\n    {\n        object rate = getValue(parameters, "rate");\n        return fee;\n    }',
    '    public virtual object parseFee(object fee, Dictionary<string, object> parameters)\n    {\n        object rate = (parameters != null && parameters.ContainsKey("rate") ? parameters["rate"] : null);\n        return fee;\n    }');

check ('dict parameter + string local key -> key-tested read',
    '    public virtual object f(IDictionary<string, object> market)\n    {\n        string symbol = "BTC/USDT";\n        return getValue(market, symbol);\n    }',
    '    public virtual object f(IDictionary<string, object> market)\n    {\n        string symbol = "BTC/USDT";\n        return (market != null && market.ContainsKey(symbol) ? market[symbol] : null);\n    }');

check ('cast-wrapped getValue keeps the cast',
    '    public virtual object f(Dictionary<string, object> parsed)\n    {\n        string? code = ((string)getValue(parsed, "code"));\n        return code;\n    }',
    '    public virtual object f(Dictionary<string, object> parsed)\n    {\n        string? code = ((string)(parsed != null && parsed.ContainsKey("code") ? parsed["code"] : null));\n        return code;\n    }');

check ('dict local from a nullable producer gets the null test',
    '    public virtual object f(object response)\n    {\n        IDictionary<string, object> networks = this.safeDict(response, "networks", new Dictionary<string, object>() {});\n        return getValue(networks, "info");\n    }',
    '    public virtual object f(object response)\n    {\n        IDictionary<string, object> networks = this.safeDict(response, "networks", new Dictionary<string, object>() {});\n        return (networks != null && networks.ContainsKey("info") ? networks["info"] : null);\n    }');

check ('object receiver keeps the helper',
    '    public virtual object f(object response)\n    {\n        return getValue(response, "code");\n    }',
    '    public virtual object f(object response)\n    {\n        return getValue(response, "code");\n    }');

check ('nullable string key keeps the helper',
    '    public virtual object f(Dictionary<string, object> row, object entry)\n    {\n        string? id = this.safeString(entry, "id");\n        return getValue(row, id);\n    }',
    '    public virtual object f(Dictionary<string, object> row, object entry)\n    {\n        string? id = this.safeString(entry, "id");\n        return getValue(row, id);\n    }');

check ('numeric key keeps the helper (the helper index-converts it)',
    '    public virtual object f(List<object> fees, int i)\n    {\n        return getValue(fees, i);\n    }',
    '    public virtual object f(List<object> fees, int i)\n    {\n        return getValue(fees, i);\n    }');

check ('value-typed dictionary keeps the helper (no null branch binds)',
    '    public virtual object f(Dictionary<string, int> counts)\n    {\n        return getValue(counts, "code");\n    }',
    '    public virtual object f(Dictionary<string, int> counts)\n    {\n        return getValue(counts, "code");\n    }');

check ('this.<field> receiver keeps the helper',
    '    public virtual object f()\n    {\n        return getValue(this.options, "code");\n    }',
    '    public virtual object f()\n    {\n        return getValue(this.options, "code");\n    }');

check ('list receiver keeps the helper',
    '    public virtual object f(object a)\n    {\n        List<object> chains = new List<object>() {};\n        return getValue(chains, "x");\n    }',
    '    public virtual object f(object a)\n    {\n        List<object> chains = new List<object>() {};\n        return getValue(chains, "x");\n    }');

check ('a nullable-return signature starts its own region (no parameter drift)',
    '    public virtual void handleBalance(WebSocketClient client, Dictionary<string, object> message)\n    {\n        return;\n    }\n    public virtual bool? handleErrorMessage(WebSocketClient client, object message)\n    {\n        if (!(inOp(message, "success")))\n        {\n            return false;\n        }\n        return true;\n    }',
    '    public virtual void handleBalance(WebSocketClient client, Dictionary<string, object> message)\n    {\n        return;\n    }\n    public virtual bool? handleErrorMessage(WebSocketClient client, object message)\n    {\n        if (!(inOp(message, "success")))\n        {\n            return false;\n        }\n        return true;\n    }');

console.log (failures === 0 ? 'all passed' : (failures + ' failure(s)'));
process.exit (failures === 0 ? 0 : 1);