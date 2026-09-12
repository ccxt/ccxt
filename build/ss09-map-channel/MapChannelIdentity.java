// SS-09 probe: the map put/get helpers take a `String` with ZERO casts.
//
// The generated code stores safeString results into maps through
//   Helpers.addElementToObject(map, key, value)   /   HashMap.put(key, value)
// and reads them back through
//   Helpers.GetValue(map, key)                    /   this.safeString(map, key)
//
// Every one of those helpers is DECLARED with `Object` parameters, and there is
// exactly ONE declaration per name (see build/ss09-map-channel-census.py section B):
//
//   Helpers.addElementToObject(Object target, Object... args)
//   Helpers.GetValue(Object value2, Object key)
//   BaseExchange.safeString*(Object obj, Object key, Object... defaultValue)
//
// Java's widening conversion passes a String argument to an Object parameter with no
// cast, so a String-typed operand needs no checkcast — and because no String-typed
// overload exists, there is no overload a String could rebind to either. This probe
// runs the SAME operations twice — once with String-declared operands (the generated
// shape after the SS-09 cast drops), once with Object-declared operands (the old
// shape) — and asserts that the observable results are identical. It is compiled
// against the built classes:
//
//     cd /root/worktrees/ss-09
//     javac -cp java/lib/build/classes/java/main -d /tmp/ss09-map-channel \
//         build/ss09-map-channel/MapChannelIdentity.java
//     java -cp /tmp/ss09-map-channel:java/lib/build/classes/java/main MapChannelIdentity
//
// Verified separately with `javap -c`: both variants call the very same
// `Helpers.addElementToObject:(Ljava/lang/Object;[Ljava/lang/Object;)V` and
// `Helpers.GetValue:(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;`
// (descriptor identity — the static type of the operand cannot change dispatch).
import io.github.ccxt.Helpers;

import java.util.HashMap;
import java.util.Map;

public final class MapChannelIdentity {

    // ---- the generated shape: String-declared operands, zero casts ----
    static String runString() {
        StringBuilder log = new StringBuilder();
        String symbol = "BTC/USDT";
        String value = "7";
        Map<String, Object> map = new HashMap<>();
        // put: String key + String value, no cast anywhere
        Helpers.addElementToObject(map, "symbol", symbol);
        Helpers.addElementToObject(map, symbol, value);
        map.put(symbol + "#2", value);
        // null value: a plain HashMap keeps the entry (TS `map[k] = null`)
        Helpers.addElementToObject(map, "n", (String) null);
        // get / read back: String key, no cast
        log.append(Helpers.GetValue(map, "symbol")).append('|');
        log.append(Helpers.GetValue(map, symbol)).append('|');
        log.append(map.get(symbol + "#2")).append('|');
        log.append(map.containsKey("n")).append(':').append(map.get("n")).append('|');
        // checkcast of a String-declared local is a no-op: same reference, no throw
        String s = symbol;
        Object viaCast = (String) s;
        log.append(viaCast == s).append('|');
        // a null String keeps the checkcast a no-op too
        String n = null;
        Object viaNull = (String) n;
        log.append(viaNull == null);
        return log.toString();
    }

    // ---- the pre-SS-09 shape: Object-declared operands (casts included) ----
    static String runObject() {
        StringBuilder log = new StringBuilder();
        Object symbol = "BTC/USDT";
        Object value = "7";
        Map<String, Object> map = new HashMap<>();
        Helpers.addElementToObject(map, "symbol", (Object) symbol);
        Helpers.addElementToObject(map, (Object) symbol, (Object) value);
        map.put(((String) symbol) + "#2", (Object) value);
        Helpers.addElementToObject(map, "n", (String) null);
        log.append(Helpers.GetValue(map, "symbol")).append('|');
        log.append(Helpers.GetValue(map, (Object) symbol)).append('|');
        log.append(map.get(((String) symbol) + "#2")).append('|');
        log.append(map.containsKey("n")).append(':').append(map.get("n")).append('|');
        Object s = symbol;
        Object viaCast = (String) s;
        log.append(viaCast == s).append('|');
        Object n = null;
        Object viaNull = (String) n;
        log.append(viaNull == null);
        return log.toString();
    }

    public static void main(String[] args) {
        String a = runString();
        String b = runObject();
        if (!a.equals(b)) {
            throw new AssertionError("String-operand and Object-operand results differ:\n  "
                    + a + "\n  " + b);
        }
        System.out.println("SS09 map-channel identity: OK [" + a + "]");
    }
}
