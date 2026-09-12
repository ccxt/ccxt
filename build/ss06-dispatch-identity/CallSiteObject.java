// SS-06 bytecode probe B — the same four consumer calls with Object-typed arguments.
// run.sh diffs the javap of this class against CallSiteString: the invocation
// descriptors must be identical, proving String-vs-Object arguments bind the same method.
import io.github.ccxt.Helpers;
import io.github.ccxt.base.SafeMethods;

import java.util.Map;

public class CallSiteObject {

    public static boolean cmp (Object a, Object b) {
        return Helpers.isEqual (a, b);
    }

    public static boolean truthy (Object value) {
        return Helpers.isTrue (value);
    }

    public static boolean contains (Map<String, Object> target, Object key) {
        return Helpers.inOp (target, key);
    }

    public static Object get (Map<String, Object> target, Object key) {
        return SafeMethods.safeValue (target, key);
    }
}
