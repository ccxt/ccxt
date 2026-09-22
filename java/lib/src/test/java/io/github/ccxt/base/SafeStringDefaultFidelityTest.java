package io.github.ccxt.base;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

/**
 * SS-13: DEFAULT-VALUE fidelity harness for the generated-Java safeString family.
 *
 * <p>Every expectation below was produced by running the reference implementation
 * {@code ts/src/base/functions/type.ts} (safeString / safeString2 / safeStringN /
 * safeValueN) under node — see {@code build/ss13-ts-groundtruth.ts} — and, where
 * they differ, the python port ({@code python/ccxt/base/exchange.py safe_string}).
 * The probes required by SS-13 are: absent key, null value, numeric value
 * (1 -> "1", 1.0 -> ?), boolean, empty string, default given / not given.</p>
 *
 * <pre>
 * value at key "k"        TS                          python                    this port
 * ----------------------  --------------------------  ------------------------  -----------
 * absent                  $default (undefined)        default_value             default/null
 * null                    $default                    default_value             default/null
 * ""                      $default  (prop skips '')   default_value             default/null
 * "abc"                   "abc"   (passthrough)       "abc"                     "abc"
 * 1                       "1"                         "1"                       "1"
 * 1.0 (JS number 1)       "1"   (String(1.0))        "1.0" (str(1.0))          "1"
 * 1.5                     "1.5"                       "1.5"                     "1.5"
 * 0                       "0"                         "0"                       "0"
 * true / false            $default                    default_value             default/null
 * [..] / {..}             $default                    default_value             default/null
 * NaN / Infinity          $default  (isFinite fails)  "nan" / "inf" *            default/null
 * no default given        undefined                   None                      null
 * default "DEF"           "DEF"                       "DEF"                     "DEF"
 * default 0 (non-String)  0 (returned as-is)          not tested                 null **
 * </pre>
 *
 * <p>* python's {@code str (NaN)} is "nan", which no transport can reach through
 * JSON, so this port follows TS and returns the default.</p>
 *
 * <p>** the TS test file comments these assertions out as "the below fails in
 * other langs" (ts/src/test/base/test.safeMethods.ts) — the typed Java/C# ports
 * return a String or null, so only String defaults survive; this test pins that
 * documented divergence instead of pretending it matches TS.</p>
 *
 * <p>The harness runs against the compiled library classes (gradle {@code :lib:test}),
 * i.e. the real SafeMethods the generated exchanges call.</p>
 */
class SafeStringDefaultFidelityTest {

    // null-friendly map builder (Map.of rejects nulls)
    private static Map<String, Object> map(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i + 1 < kv.length; i += 2) {
            m.put((String) kv[i], kv[i + 1]);
        }
        return m;
    }

    private static List<Object> keys(Object... ks) {
        List<Object> l = new ArrayList<>();
        l.addAll(Arrays.asList(ks));
        return l;
    }

    // ==================================================================
    // safeString (obj, key, default) — the SS-13 probe matrix
    // ==================================================================

    @Test
    void absentKey() {
        Map<String, Object> m = map("other", 1);
        assertNull(SafeMethods.safeString(m, "k"), "TS: undefined, python: None");
        assertNull(SafeMethods.SafeString(m, "k"), "SafeString alias must agree");
        assertEquals("DEF", SafeMethods.safeString(m, "k", "DEF"));
        assertEquals("", SafeMethods.safeString(m, "k", ""));
        assertEquals("DEF", SafeMethods.SafeStringTyped(m, "k", "DEF"), "typed entry point must agree");
    }

    @Test
    void nullValue() {
        Map<String, Object> m = map("k", null);
        assertNull(SafeMethods.safeString(m, "k"), "TS prop () skips null");
        assertEquals("DEF", SafeMethods.safeString(m, "k", "DEF"));
    }

    @Test
    void emptyStringValue() {
        Map<String, Object> m = map("k", "");
        // TS prop () returns undefined for '' -> $default (both with and without a default)
        assertNull(SafeMethods.safeString(m, "k"));
        assertEquals("DEF", SafeMethods.safeString(m, "k", "DEF"));
        assertEquals("", SafeMethods.safeString(m, "k", ""));
    }

    @Test
    void stringPassesThroughRegardlessOfDefault() {
        assertEquals("abc", SafeMethods.safeString(map("k", "abc"), "k"));
        assertEquals("abc", SafeMethods.safeString(map("k", "abc"), "k", "DEF"));
        assertEquals("0", SafeMethods.safeString(map("k", "0"), "k"), "string zero is not numeric");
        assertEquals("heLlo", SafeMethods.safeString(map("k", "heLlo"), "k", "DEF"));
    }

    @Test
    void integerValues() {
        assertEquals("1", SafeMethods.safeString(map("k", 1), "k"), "TS: String (1)");
        assertEquals("0", SafeMethods.safeString(map("k", 0), "k"), "TS test: zeroNumeric -> '0'");
        assertEquals("42", SafeMethods.safeString(map("k", 42L), "k"));
        assertEquals("123456789012345", SafeMethods.safeString(map("k", 123456789012345L), "k"),
                "TS test: longInt -> '123456789012345'");
        assertEquals("1", SafeMethods.safeString(map("k", 1), "k", "DEF"), "default not used on a hit");
    }

    @Test
    void integralDoublesCollapseLikeJsNumbers() {
        // JS cannot tell 1 and 1.0 apart: String (1.0) === "1".
        // The Java JSON parser yields a Double for "1.0"; python would give str (1.0) == "1.0".
        assertEquals("1", SafeMethods.safeString(map("k", 1.0d), "k"), "TS: String (1.0) == '1'");
        assertEquals("1", SafeMethods.safeString(map("k", 1.0d), "k", "DEF"));
        assertEquals("0", SafeMethods.safeString(map("k", 0.0d), "k"), "TS: String (0.0) == '0'");
        assertEquals("100", SafeMethods.safeString(map("k", 100.0d), "k"), "JS: String (100.0) == '100'");
        assertEquals("-7", SafeMethods.safeString(map("k", -7.0d), "k"));
        assertEquals("123456789012345", SafeMethods.safeString(map("k", 123456789012345.0d), "k"));
    }

    @Test
    void fractionalDoubles() {
        assertEquals("1.5", SafeMethods.safeString(map("k", 1.5d), "k"));
        assertEquals("-1.5", SafeMethods.safeString(map("k", -1.5d), "k"));
        assertEquals("0.123", SafeMethods.safeString(map("k", 0.123d), "k"),
                "TS test: floatNumeric 0.123 -> '0.123'");
    }

    @Test
    void floatValues() {
        // The JSON parser produces Double, not Float; these pin the degenerate paths anyway
        assertEquals("1", SafeMethods.safeString(map("k", 1.0f), "k"));
        assertEquals("0.123", SafeMethods.safeString(map("k", 0.123f), "k"));
    }

    @Test
    void booleansAreNotStringCoercible() {
        // TS test: safeString (inputDict, 'bool') === undefined; python returns default_value
        assertNull(SafeMethods.safeString(map("k", true), "k"));
        assertNull(SafeMethods.safeString(map("k", false), "k"));
        assertEquals("DEF", SafeMethods.safeString(map("k", true), "k", "DEF"));
        assertEquals("DEF", SafeMethods.safeString(map("k", false), "k", "DEF"));
    }

    @Test
    void listsAndDictsAreNotStringCoercible() {
        // TS test: safeString (inputDict, 'list'/'dict') === undefined
        assertNull(SafeMethods.safeString(map("k", List.of(1, 2, 3)), "k"));
        assertNull(SafeMethods.safeString(map("k", map("a", 1)), "k"));
        assertEquals("DEF", SafeMethods.safeString(map("k", List.of(1, 2, 3)), "k", "DEF"));
        assertEquals("DEF", SafeMethods.safeString(map("k", map("a", 1)), "k", "DEF"));
    }

    @Test
    void nonFiniteNumbersFallBackToTheDefault() {
        // TS: Number.isFinite (NaN/Infinity) is false -> $default
        assertNull(SafeMethods.safeString(map("k", Double.NaN), "k"));
        assertNull(SafeMethods.safeString(map("k", Double.POSITIVE_INFINITY), "k"));
        assertNull(SafeMethods.safeString(map("k", Double.NEGATIVE_INFINITY), "k"));
        assertEquals("DEF", SafeMethods.safeString(map("k", Double.NaN), "k", "DEF"));
        assertEquals("DEF", SafeMethods.safeString(map("k", Double.POSITIVE_INFINITY), "k", "DEF"));
    }

    @Test
    void nullContainerOrNullKey() {
        assertNull(SafeMethods.safeString(null, "k"));
        assertEquals("DEF", SafeMethods.safeString(null, "k", "DEF"));
        assertNull(SafeMethods.safeString(map("k", "v"), null));
        assertEquals("DEF", SafeMethods.safeString(map("k", "v"), null, "DEF"));
    }

    @Test
    void nonStringDefaultsAreNotRepresentable() {
        // TS returns the default as-is (0 / true / 0.2); the typed ports cannot, and the TS
        // test suite comments those assertions out as "the below fails in other langs".
        assertNull(SafeMethods.safeString(map("other", 1), "k", 0));
        assertNull(SafeMethods.safeString(map("other", 1), "k", true));
        assertNull(SafeMethods.safeString(map("other", 1), "k", 0.2d));
    }

    // ==================================================================
    // safeString2 — TS prop2 order: first non-missing value wins
    // ==================================================================

    @Test
    void safeString2PicksFirstKey() {
        Map<String, Object> m = map("k1", "a", "k2", "b");
        assertEquals("a", SafeMethods.safeString2(m, "k1", "k2"));
        assertEquals("a", SafeMethods.safeString2(m, "k1", "k2", "DEF"));
    }

    @Test
    void safeString2FallsThroughOnlyWhenFirstIsMissing() {
        assertEquals("b", SafeMethods.safeString2(map("k2", "b"), "k1", "k2"), "absent");
        assertEquals("b", SafeMethods.safeString2(map("k1", null, "k2", "b"), "k1", "k2"), "null");
        assertEquals("b", SafeMethods.safeString2(map("k1", "", "k2", "b"), "k1", "k2"), "'' skipped by prop2");
        assertEquals("0", SafeMethods.safeString2(map("k1", 0, "k2", "b"), "k1", "k2"), "0 is present");
        assertEquals("1", SafeMethods.safeString2(map("k1", 1.0d, "k2", "b"), "k1", "k2"));
    }

    @Test
    void safeString2DoesNotFallThroughOnPresentNonCoercibleValues() {
        // TS ground truth: safeString2 ({k1: true, k2: 'b'}) === undefined, k2 is NOT consulted
        Map<String, Object> boolFirst = map("k1", true, "k2", "b");
        assertNull(SafeMethods.safeString2(boolFirst, "k1", "k2"));
        assertEquals("DEF", SafeMethods.safeString2(boolFirst, "k1", "k2", "DEF"));
        Map<String, Object> listFirst = map("k1", List.of(1), "k2", "b");
        assertNull(SafeMethods.safeString2(listFirst, "k1", "k2"));
        assertEquals("DEF", SafeMethods.safeString2(listFirst, "k1", "k2", "DEF"));
        assertNull(SafeMethods.safeString2(map("other", 1), "k1", "k2"), "both absent");
        assertEquals("DEF", SafeMethods.safeString2(map("other", 1), "k1", "k2", "DEF"));
    }

    @Test
    void safeString2OverLists() {
        // TS: safeString2 (['', 'B', 'C'], 0, 1) === 'B' (prop2 skips the empty string)
        assertEquals("B", SafeMethods.safeString2(List.of("", "B", "C"), 0, 1));
        // TS test: safeString2 (['Hi', 2], 2, 0) === 'Hi' (out of bounds is missing)
        assertEquals("Hi", SafeMethods.safeString2(List.of("Hi", 2), 2, 0));
    }

    // ==================================================================
    // safeStringN — TS getValueFromKeysInArray: first non-missing value wins
    // ==================================================================

    @Test
    void safeStringNPicksFirstPresentKey() {
        Map<String, Object> m = map("a", "A", "b", "B");
        assertEquals("A", SafeMethods.safeStringN(m, keys("a", "b")));
        assertEquals("A", SafeMethods.safeStringN(m, keys("a", "b"), "DEF"));
    }

    @Test
    void safeStringNSkipsMissingValues() {
        assertEquals("B", SafeMethods.safeStringN(map("b", "B"), keys("a", "b")), "absent");
        assertEquals("B", SafeMethods.safeStringN(map("a", null, "b", "B"), keys("a", "b")), "null");
        assertEquals("B", SafeMethods.safeStringN(map("a", "", "b", "B"), keys("a", "b")), "'' skipped");
        assertEquals("A", SafeMethods.safeStringN(map("a", "A"), keys(null, "a")), "null key entry ignored");
        assertEquals("1", SafeMethods.safeStringN(map("a", 1.0d, "b", "B"), keys("a", "b")));
    }

    @Test
    void safeStringNDoesNotFallThroughOnPresentNonCoercibleValues() {
        // TS ground truth: safeStringN ({a: true, b: 'B'}, ['a','b']) === undefined
        assertNull(SafeMethods.safeStringN(map("a", true, "b", "B"), keys("a", "b")));
        assertEquals("DEF", SafeMethods.safeStringN(map("a", true, "b", "B"), keys("a", "b"), "DEF"));
    }

    @Test
    void safeStringNAllKeysMissing() {
        assertNull(SafeMethods.safeStringN(map("c", 1), keys("a", "b")));
        assertEquals("DEF", SafeMethods.safeStringN(map("c", 1), keys("a", "b"), "DEF"));
        assertEquals("MiXed_Case", SafeMethods.safeStringN(map("c", 1), keys("a", "b", "nonexistent"), "MiXed_Case"),
                "TS test: safeStringN with default");
    }

    @Test
    void safeStringNOverLists() {
        // TS: safeStringN (['Hi', 2], [3, 2, 0]) === 'Hi'
        assertEquals("Hi", SafeMethods.safeStringN(List.of("Hi", 2), keys(3, 2, 0)));
        // TS: safeStringN (['', 'B', 'C'], [0, 1, 2]) === 'B'
        assertEquals("B", SafeMethods.safeStringN(List.of("", "B", "C"), keys(0, 1, 2)));
        // TS: safeStringN (['A', ''], [0, 1]) === 'A'
        assertEquals("A", SafeMethods.safeStringN(List.of("A", ""), keys(0, 1)));
    }

    // ==================================================================
    // aliases / entry points used by the generated exchanges
    // ==================================================================

    @Test
    void everyEntryPointAgreesOnTheMatrix() {
        assertEntryPointsAgree(map("k", "abc"), "abc");
        assertEntryPointsAgree(map("k", 1), "1");
        assertEntryPointsAgree(map("k", 1.0d), "1");
        assertEntryPointsAgree(map("k", true), null);
        assertEntryPointsAgree(map("k", ""), null);
        assertEntryPointsAgree(map("other", 1), null);
    }

    private static void assertEntryPointsAgree(Map<String, Object> m, String expected) {
        assertEquals(expected, SafeMethods.safeString(m, "k"), "safeString");
        assertEquals(expected, SafeMethods.SafeString(m, "k"), "SafeString");
        assertEquals(expected, SafeMethods.SafeStringTyped(m, "k"), "SafeStringTyped");
    }
}
