// SS-06 bytecode probe A — every consumer call made with String-typed arguments.
// run.sh diffs the javap of this class against CallSiteObject: the invocation
// descriptors must be identical, proving String-vs-Object arguments bind the same method.
import io.github.ccxt.Helpers;
import io.github.ccxt.base.SafeMethods;

import java.util.Map;

public class CallSiteString {

    public static boolean cmp (String a, String b) {
        return Helpers.isEqual (a, b);
    }

    public static boolean truthy (String value) {
        return Helpers.isTrue (value);
    }

    public static boolean contains (Map<String, Object> target, String key) {
        return Helpers.inOp (target, key);
    }

    public static Object get (Map<String, Object> target, String key) {
        return SafeMethods.safeValue (target, key);
    }
}
