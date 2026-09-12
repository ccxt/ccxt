import io.github.ccxt.base.SafeMethods;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * SS-13: standalone javac probe (not JUnit) that replays the exact case matrix of
 * build/ss13-ts-groundtruth.ts through the *compiled* SafeMethods and prints
 * "section<TAB>case<TAB>result" lines. build/ss13-compare.py diffs the output
 * against the TS reference run.
 *
 * Build/run (from the repo root):
 *   javac -cp java/lib/build/classes/java/main -d /tmp/ss13probe build/ss13-java-probe/Probe.java
 *   java -cp java/lib/build/classes/java/main:/tmp/ss13probe Probe
 */
public class Probe {

    private static Map<String, Object> map(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) {
            m.put((String) kv[i], kv[i + 1]);
        }
        return m;
    }

    private static List<Object> keys(Object... ks) {
        return new ArrayList<>(Arrays.asList(ks));
    }

    private static String show(Object r) {
        if (r == null) return "<undefined>";
        if (r instanceof String s) return "S:" + s;
        return "T:" + r.getClass().getSimpleName() + ":" + String.valueOf(r);
    }

    private static String label(Object[] d) {
        if (d.length == 0) return "no-default";
        Object v = d[0];
        if (v instanceof String s) return "default=\"" + s + "\"";
        return "default=" + String.valueOf(v);
    }

    private static void emit(String section, String key, String value) {
        System.out.println(section + "\t" + key + "\t" + value);
    }

    public static void main(String[] args) {
        Map<String, Object> absent = map("other", 1);
        Object[][] cases = {
                { "absent", absent, "k" },
                { "null", map("k", null), "k" },
                { "empty-string", map("k", ""), "k" },
                { "string-abc", map("k", "abc"), "k" },
                { "string-0", map("k", "0"), "k" },
                { "int-1", map("k", 1), "k" },
                { "float-1.0", map("k", 1.0d), "k" },
                { "float-1.5", map("k", 1.5d), "k" },
                { "int-0", map("k", 0), "k" },
                { "neg-1.5", map("k", -1.5d), "k" },
                { "big-1e21", map("k", 1e21d), "k" },
                { "float-0.1", map("k", 0.1d), "k" },
                { "bool-true", map("k", true), "k" },
                { "bool-false", map("k", false), "k" },
                { "empty-array", map("k", List.of()), "k" },
                { "array", map("k", List.of(1, 2)), "k" },
                { "empty-dict", map("k", map()), "k" },
                { "dict", map("k", map("a", 1)), "k" },
                { "nan", map("k", Double.NaN), "k" },
                { "inf", map("k", Double.POSITIVE_INFINITY), "k" },
                { "undefined-value", map("k", null), "k" },
                { "null-key", map("k", "v"), null },
                { "undefined-key", map("k", "v"), null },
                { "null-obj", null, "k" },
                { "undefined-obj", null, "k" },
        };
        Object[][] defaults = { {}, { "DEF" }, { "" } };
        for (Object[] c : cases) {
            for (Object[] d : defaults) {
                String suffix = "|" + label(d);
                String name = (String) c[0];
                emit("safeString", name + suffix, show(SafeMethods.safeString(c[1], c[2], d)));
                emit("safeStringLower", name + suffix, show(SafeMethods.safeStringLower(c[1], c[2], d)));
                emit("safeStringUpper", name + suffix, show(SafeMethods.safeStringUpper(c[1], c[2], d)));
            }
        }

        Object[][] twoKey = {
                { "k1-hit", map("k1", "a", "k2", "b") },
                { "k1-absent-k2-hit", map("k2", "b") },
                { "k1-null-k2-hit", map("k1", null, "k2", "b") },
                { "k1-empty-k2-hit", map("k1", "", "k2", "b") },
                { "k1-bool-k2-hit", map("k1", true, "k2", "b") },
                { "k1-array-k2-hit", map("k1", List.of(1), "k2", "b") },
                { "k1-0-k2-hit", map("k1", 0, "k2", "b") },
                { "both-absent", map("other", 1) },
                { "k1-num-k2-hit", map("k1", 1.0d, "k2", "b") },
        };
        for (Object[] c : twoKey) {
            for (Object[] d : defaults) {
                String suffix = "|" + label(d);
                emit("safeString2", c[0] + suffix, show(SafeMethods.safeString2(c[1], "k1", "k2", d)));
            }
        }

        Object[][] nKey = {
                { "first-hit", map("a", "A", "b", "B"), keys("a", "b") },
                { "first-absent-second-hit", map("b", "B"), keys("a", "b") },
                { "first-empty-second-hit", map("a", "", "b", "B"), keys("a", "b") },
                { "first-null-second-hit", map("a", null, "b", "B"), keys("a", "b") },
                { "first-bool-second-hit", map("a", true, "b", "B"), keys("a", "b") },
                { "none", map("c", 1), keys("a", "b") },
                { "num-first", map("a", 1.0d, "b", "B"), keys("a", "b") },
                { "null-keys-entry", map("a", 1), keys(null, "a") },
        };
        for (Object[] c : nKey) {
            for (Object[] d : defaults) {
                String suffix = "|" + label(d);
                emit("safeStringN", c[0] + suffix, show(SafeMethods.safeStringN(c[1], c[2], d)));
            }
        }

        List<Object> list = List.of("", "B", "C");
        List<Object> listNoEmpty = List.of("A", "");
        List<Object> listHi2 = List.of("Hi", 2);
        emit("listCases", "list-first-empty|safeString[0]", show(SafeMethods.safeString(list, 0)));
        emit("listCases", "list-first-empty|safeString[0]|default", show(SafeMethods.safeString(list, 0, "DEF")));
        emit("listCases", "list-first-empty|safeString2(0,1)", show(SafeMethods.safeString2(list, 0, 1)));
        emit("listCases", "list-first-empty|safeString2(0,1)|default", show(SafeMethods.safeString2(list, 0, 1, "DEF")));
        emit("listCases", "list-first-empty|safeStringN[0,1,2]", show(SafeMethods.safeStringN(list, keys(0, 1, 2))));
        emit("listCases", "list-first-empty|safeStringN[0,1,2]|default", show(SafeMethods.safeStringN(list, keys(0, 1, 2), "DEF")));
        emit("listCases", "list-first-empty|safeValueN[0,1,2]", show(SafeMethods.safeValueN(list, keys(0, 1, 2))));
        emit("listCases", "list-empty-second|safeStringN[0,1]", show(SafeMethods.safeStringN(listNoEmpty, keys(0, 1))));
        emit("listCases", "list-empty-second|safeValueN[0,1]", show(SafeMethods.safeValueN(listNoEmpty, keys(0, 1))));
        emit("listCases", "list-hi-2|safeStringN[3,2,0]", show(SafeMethods.safeStringN(listHi2, keys(3, 2, 0))));
        emit("listCases", "list-hi-2|safeString2(2,0)", show(SafeMethods.safeString2(listHi2, 2, 0)));
        emit("listCases", "list-out-of-bounds|safeString[5]", show(SafeMethods.safeString(listHi2, 5)));
        emit("listCases", "list-out-of-bounds|safeString[5]|default", show(SafeMethods.safeString(listHi2, 5, "DEF")));
    }
}
