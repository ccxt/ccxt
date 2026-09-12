// SS-06 javac harness — String-vs-Object dispatch and value identity for the four
// consumer calls (Helpers.isEqual / isTrue / inOp and SafeMethods.safeValue*).
//
// The campaign question this answers: at the ~107 `Helpers.isEqual(this.safeString…)`
// sites (and the isTrue/inOp/safeValue ones), a `safeString` result — a String or null —
// is passed into a helper whose parameters are declared `Object`. Is letting the consumer
// take that String DIRECTLY (no `((String)x)` checkcast) value-identical to passing it
// wrapped in a String cast?
//
// Three independent proofs, all executed by run.sh:
//   1. REFLECTION: each consumer name declares exactly ONE method and every parameter is
//      Object / Object[] — there is no String-typed overload for javac to prefer, so the
//      call site binds the same method for a String- or an Object-typed argument.
//   2. BYTECODE: CallSiteString (String-typed arguments) and CallSiteObject (Object-typed
//      arguments) compile to the same invocation descriptors — javap -c diff in run.sh.
//   3. VALUES: the case table below calls each consumer through a String-typed variable,
//      an Object-typed variable, and explicit casts of both kinds, asserting identical
//      results for null, empty, numeric-string, mixed-type and collection cases.
//
// Compile/run against the BUILT classes (java/lib/build/classes/java/main + Jackson):
//     build/ss06-dispatch-identity/run.sh

import io.github.ccxt.Helpers;
import io.github.ccxt.base.SafeMethods;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class DispatchIdentity {

    static int checks = 0;
    static int failures = 0;

    static void check (String label, Object a, Object b) {
        checks++;
        if (!Objects.equals (a, b)) {
            failures++;
            System.out.println ("  FAIL  " + label + "\n        a=" + a + "  b=" + b);
        }
    }

    static void section (String name) {
        System.out.println ("\n== " + name);
    }

    // ------------------------------------------------------------------ reflection

    static Method[] namedMethods (Class<?> owner, String name) {
        List<Method> found = new ArrayList<> ();
        for (Method m : owner.getDeclaredMethods ()) {
            if (m.getName ().equals (name)) {
                found.add (m);
            }
        }
        return found.toArray (new Method[0]);
    }

    static void reflectionCheck (Class<?> owner, String name) {
        Method[] methods = namedMethods (owner, name);
        System.out.print ("  " + owner.getSimpleName () + "." + name + ": " + methods.length + " declaration(s)");
        for (Method m : methods) {
            StringBuilder signature = new StringBuilder ("  (" );
            Parameter[] parameters = m.getParameters ();
            for (int i = 0; i < parameters.length; i++) {
                signature.append (parameters[i].getType ().getSimpleName ());
                if (i + 1 < parameters.length) {
                    signature.append (", ");
                }
            }
            signature.append (") -> ").append (m.getReturnType ().getSimpleName ());
            System.out.print (signature);
        }
        System.out.println ();
        check (owner.getSimpleName () + "." + name + " has exactly one declaration", methods.length, 1);
        for (Method m : methods) {
            for (Class<?> type : m.getParameterTypes ()) {
                boolean objectish = type == Object.class || (type.isArray () && type.getComponentType () == Object.class);
                check (owner.getSimpleName () + "." + name + " parameter is Object/Object[]", objectish, true);
            }
        }
    }

    static void reflection () {
        section ("reflection: one Object-typed declaration per consumer (no String overload)");
        reflectionCheck (Helpers.class, "isEqual");
        reflectionCheck (Helpers.class, "isTrue");
        reflectionCheck (Helpers.class, "inOp");
        reflectionCheck (Helpers.class, "InOp");
        reflectionCheck (SafeMethods.class, "safeValue");
        reflectionCheck (SafeMethods.class, "safeValue2");
        reflectionCheck (SafeMethods.class, "safeValueN");
        System.out.println ("  -> a String argument can only bind the Object parameter: there is no"
                + " String-vs-Object dispatch to differ about.");
    }

    // ------------------------------------------------------------------ value table

    // every isEqual call shape for the same runtime boxes must agree.
    // A String-typed view exists only when the box IS a String or null — casting a Long
    // view to String would change the VALUE, not just the static type, and prove nothing.
    static void isEqualCase (Object a, Object b) {
        Boolean boxed = Helpers.isEqual (a, b);                  // Object, Object — the emitted shape
        String label = "isEqual(" + show (a) + ", " + show (b) + ")";
        if (a == null || a instanceof String) {
            String as = (String) a;
            check (label + " String-vs-Object", Helpers.isEqual (as, b), boxed);
            check (label + " (String)cast-vs-Object", Helpers.isEqual ((String) as, b), boxed);
            if (b == null || b instanceof String) {
                String bs = (String) b;
                check (label + " String-vs-String", Helpers.isEqual (as, bs), boxed);
                check (label + " (Object)cast-vs-(String)cast", Helpers.isEqual ((Object) as, (String) bs), boxed);
            }
        }
        if (b == null || b instanceof String) {
            String bs = (String) b;
            check (label + " Object-vs-String", Helpers.isEqual (a, bs), boxed);
        }
    }

    static String show (Object value) {
        if (value == null) {
            return "null";
        }
        return value.getClass ().getSimpleName () + "(" + value + ")";
    }

    static void isEqualTable () {
        section ("value identity: isEqual through String-typed / Object-typed / cast arguments");
        isEqualCase (null, null);
        isEqualCase (null, "x");
        isEqualCase ("x", null);
        isEqualCase ("x", "x");
        isEqualCase ("x", "y");
        isEqualCase ("", "");
        isEqualCase ("", null);
        isEqualCase ("1", 1L);
        isEqualCase ("1.0", 1.0d);
        isEqualCase ("1.0", 1L);
        isEqualCase ("0", 0L);
        isEqualCase ("abc", 1L);
        isEqualCase ("abc", "abc");
        isEqualCase ("true", true);
        isEqualCase (1L, 1);
        // explicit casts both ways are the same binding too
        String s = "42";
        Object o = s;
        check ("isEqual((String)s, (String)\"42\")", Helpers.isEqual ((String) s, (String) "42"), Helpers.isEqual (o, "42"));
        check ("isEqual((Object)s, \"42\")", Helpers.isEqual ((Object) s, "42"), Helpers.isEqual (s, "42"));
    }

    static void isTrueTable () {
        section ("value identity: isTrue through String-typed / Object-typed / cast arguments");
        String[] stringCases = { null, "", "x", "0", "false", " " };
        for (String value : stringCases) {
            String stringTyped = value;
            Object objectTyped = value;
            check ("isTrue(" + show (value) + ")", Helpers.isTrue (stringTyped), Helpers.isTrue (objectTyped));
            check ("isTrue((String)" + show (value) + ")", Helpers.isTrue ((String) stringTyped), Helpers.isTrue ((Object) stringTyped));
        }
        check ("isTrue(String \"1\") vs Long 1", Helpers.isTrue ("1"), Helpers.isTrue (1L));
        check ("isTrue(Object \"1\") vs Long 1", Helpers.isTrue ((Object) "1"), Helpers.isTrue (1L));
    }

    static void inOpTable () {
        section ("value identity: inOp through String-typed / Object-typed / cast keys");
        Map<String, Object> map = new HashMap<> ();
        map.put ("BTC/USDT", "spot");
        map.put ("plain", 7);
        String present = "BTC/USDT";
        Object presentObject = present;
        String absent = "ETH/USDT";
        Object absentObject = absent;
        check ("inOp(map, present) String-vs-Object", Helpers.inOp (map, present), Helpers.inOp (map, presentObject));
        check ("inOp(map, absent) String-vs-Object", Helpers.inOp (map, absent), Helpers.inOp (map, absentObject));
        check ("inOp(map, null)", Helpers.inOp (map, null), Helpers.inOp (map, (Object) null));
        check ("inOp(map, (String)present)", Helpers.inOp (map, (String) present), Helpers.inOp (map, presentObject));
        List<Object> list = new ArrayList<> ();
        list.add ("a");
        check ("inOp(list, \"a\") String-vs-Object", Helpers.inOp (list, "a"), Helpers.inOp (list, (Object) "a"));
        check ("inOp(list, \"b\") String-vs-Object", Helpers.inOp (list, "b"), Helpers.inOp (list, (Object) "b"));
    }

    static void safeValueTable () {
        section ("value identity: SafeMethods.safeValue through String-typed / Object-typed keys");
        Map<String, Object> map = new HashMap<> ();
        map.put ("symbol", "BTC/USDT");
        map.put ("missing", null);
        String key = "symbol";
        Object keyObject = key;
        check ("safeValue(map, key)", SafeMethods.safeValue (map, key), SafeMethods.safeValue (map, keyObject));
        check ("safeValue(map, (String)key)", SafeMethods.safeValue (map, (String) key), SafeMethods.safeValue (map, keyObject));
        String missing = "unknown";
        Object missingObject = missing;
        check ("safeValue(map, missing-key)", SafeMethods.safeValue (map, missing), SafeMethods.safeValue (map, missingObject));
        check ("safeValue(map, missing-key, default)",
                SafeMethods.safeValue (map, missing, "fallback"), SafeMethods.safeValue (map, missingObject, "fallback"));
        String nullKey = null;
        Object nullKeyObject = nullKey;
        check ("safeValue(map, null-key)", SafeMethods.safeValue (map, nullKey), SafeMethods.safeValue (map, nullKeyObject));
    }

    // ------------------------------------------------------------------ entry

    public static void main (String[] args) {
        System.out.println ("SS-06 dispatch/value-identity harness (Helpers + SafeMethods)");
        reflection ();
        isEqualTable ();
        isTrueTable ();
        inOpTable ();
        safeValueTable ();
        System.out.println ("\nchecks: " + checks + ", failures: " + failures);
        if (failures > 0) {
            System.out.println ("RESULT: FAIL");
            System.exit (1);
        }
        System.out.println ("RESULT: PASS — every consumer takes the String directly, with identical values");
    }
}
