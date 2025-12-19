package tests;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;

import io.github.ccxt.Exchange;
import io.github.ccxt.Helpers;
import io.github.ccxt.base.Crypto;
import io.github.ccxt.base.Functions;
import io.github.ccxt.base.JsonHelper;
import io.github.ccxt.base.NumberHelpers;

public class BaseTest {

    public int TRUNCATE = Exchange.TRUNCATE;
    public int DECIMAL_PLACES = Exchange.DECIMAL_PLACES;
    public int ROUND = Exchange.ROUND;
    public int ROUND_UP = Exchange.ROUND_UP;
    public int ROUND_DOWN = Exchange.ROUND_DOWN;
    public int SIGNIFICANT_DIGITS = Exchange.SIGNIFICANT_DIGITS;
    public int TICK_SIZE = Exchange.TICK_SIZE;
    public int NO_PADDING = Exchange.NO_PADDING;
    public int PAD_WITH_ZERO = Exchange.PAD_WITH_ZERO;

    public static String sha1() {
        return "sha1";
    }

    public static String sha256() {
        return "sha256";
    }

    public static String sha384() {
        return "sha384";
    }

    public static String sha512() {
        return "sha512";
    }

    public static String md5() {
        return "md5";
    }

    public static String ed25519() {
        return "ed25519";
    }

    public static String keccak() {
        return "keccak";
    }

    public static String secp256k1() {
        return "secp256k1";
    }

    public static void Assert(Object condition2, Object message2) {
        boolean condition = true;

        if (condition2 == null) {
            condition = false;
        } else if (condition2 instanceof Boolean) {
            condition = (Boolean) condition2;
        }

        String message = (message2 != null) ? message2.toString() : null;

        if (!condition) {
            String errorMessage = "Assertion failed";
            if (message != null) {
                errorMessage += ": " + message;
            } else {
                // errorMessage += ".";
            }
            throw new RuntimeException(errorMessage);
        }
    }

    public static void Assert(Object condition2) {
        Assert(condition2, null);
    }

    public static boolean equals(Object a, Object b) {
        if (a == b) return true;
        // one null, one not
        if (a == null || b == null) return false;

        // List deep compare
        if (a instanceof List<?> list1) {
            if (!(b instanceof List<?> list2)) return false;
            if (list1.size() != list2.size()) return false;

            for (int i = 0; i < list1.size(); i++) {
                Object item1 = list1.get(i);
                Object item2 = list2.get(i);
                if (!equals(item1, item2)) return false; // recursive
            }
            return true;
        }

        if (a instanceof Map<?, ?> map1) {
            if (!(b instanceof Map<?, ?> map2)) return false;

            for (Map.Entry<?, ?> e : map1.entrySet()) {
                Object key = e.getKey();
                if (!(key instanceof String)) {
                    return false;
                }
                if (!map2.containsKey(key)) return false;
                if (!equals(e.getValue(), map2.get(key))) return false;
            }
            return true;
        }

        return isEqual(a, b);
    }

    public static Object mod(Object a, Object b) {
        return Helpers.mod(a, b);
    }

    public static CompletableFuture<List<Object>> promiseAll(Object a) {
        return Helpers.promiseAll(a);
    }

    public static Object getValue(Object a, Object b) {
        return Helpers.GetValue(a, b);
    }

    public static boolean inOp(Object a, Object b) {
        return Helpers.inOp(a, b);
    }

    public static int getIndexOf(Object a, Object b) {
        return Helpers.getIndexOf(a, b);
    }

    public static Object getArrayLength(Object a) {
        return Helpers.getArrayLength(a);
    }

    public static boolean isLessThan(Object a, Object b) {
        return Helpers.isLessThan(a, b);
    }

    public static boolean isGreaterThan(Object a, Object b) {
        return Helpers.isGreaterThan(a, b);
    }

    public static boolean isGreaterThanOrEqual(Object a, Object b) {
        return Helpers.isGreaterThanOrEqual(a, b);
    }

    public static boolean isLessThanOrEqual(Object a, Object b) {
        return Helpers.isLessThanOrEqual(a, b);
    }

    public static Object mathMax(Object a, Object b) {
        return Helpers.mathMax(a, b);
    }

    public static Object add(Object a, Object b) {
        return Helpers.add(a, b);
    }

    public static Object multiply(Object a, Object b) {
        return Helpers.multiply(a, b);
    }

    public static Object subtract(Object a, Object b) {
        return Helpers.subtract(a, b);
    }

    public static Object divide(Object a, Object b) {
        return Helpers.divide(a, b);
    }

    public static String toStringOrNull(Object a) {
        return Helpers.toStringOrNull(a);
    }

    public static boolean isEqual(Object a, Object b) {
        return Helpers.isEqual(a, b);
    }

    public static boolean isTrue(Object a) {
        return Helpers.isTrue(a);
    }

    public static Object encode(Object a) {
        return a;
    }

    // hash/hmac/rsa/ecdsa/jwt/crc32
    public static Object hash(Object request, Object algorithm, Object digest) {
        return Crypto.hash(request, algorithm, digest);
    }

    public static Object hash(Object request) {
        return Crypto.hash(request, null, null);
    }

    public static Object hash(Object request, Object algorithm) {
        return Crypto.hash(request, algorithm, null);
    }

    public static String hmac(
        Object request,
        Object secret,
        Object algorithm,
        String digest
    ) {
        return Crypto.hmac(request, secret, algorithm, digest);
    }

    public static String hmac(Object request, Object secret) {
        return Crypto.hmac(request, secret, null, "hex");
    }

    public static String hmac(Object request, Object secret, Object algorithm) {
        return Crypto.hmac(request, secret, algorithm, "hex");
    }

    public static String rsa(Object request, Object secret, Object alg) {
        return Crypto.rsa(request, secret, alg);
    }

    public static String rsa(Object request, Object secret) {
        return Crypto.rsa(request, secret, null);
    }

    public static Object ecdsa(
        Object request,
        Object secret,
        Object alg,
        Object stub
    ) {
        return Crypto.Ecdsa(request, secret, alg, stub);
    }

    public static Object ecdsa(Object request, Object secret) {
        return Crypto.Ecdsa(request, secret, null, null);
    }

    public static Object ecdsa(Object request, Object secret, Object alg) {
        return Crypto.Ecdsa(request, secret, alg, null);
    }

    public String jwt(Object data, Object secret, Object alg, boolean isRsa) {
        return Crypto.Jwt(data, secret, alg, isRsa, null);
    }

    public String jwt(Object data, Object secret) {
        return Crypto.Jwt(data, secret, null, false, null);
    }

    public String jwt(Object data, Object secret, Object alg) {
        return Crypto.Jwt(data, secret, alg, false, null);
    }

    public static Object crc32(Object str, Object signed) {
        return Crypto.Crc32(str, signed);
    }

    public static Object crc32(Object str) {
        return Crypto.Crc32(str, null);
    }

    // --- instance passthroughs ---

    public String decimalToPrecision(
        Object a,
        Object b,
        Object c,
        Object d,
        Object e
    ) {
        return NumberHelpers.decimalToPrecision(a, b, c, d, e);
    }

    public String decimalToPrecision(Object a, Object b) {
        return NumberHelpers.decimalToPrecision(a, b, null, null, null);
    }

    public String decimalToPrecision(Object a, Object b, Object c) {
        return NumberHelpers.decimalToPrecision(a, b, c, null, null);
    }

    public String decimalToPrecision(Object a, Object b, Object c, Object d) {
        return NumberHelpers.decimalToPrecision(a, b, c, d, null);
    }

    public String numberToString(Object number) {
        return NumberHelpers.numberToString(number);
    }

    // Equal methods

    public static Object deepEqual(Object a, Object b) {
        return Helpers.isEqual(Functions.json(a), Functions.json(b));
    }

    public static void AssertDeepEqual(
        Exchange exchange,
        Object skippedProperties,
        Object method,
        Object a,
        Object b
    ) {
        Assert(
            deepEqual(a, b),
            Helpers.add(
                Helpers.add(
                    Helpers.add(
                        Helpers.add(
                            "two dicts do not match: ",
                            Functions.json(a)
                        ),
                        " != "
                    ),
                    Functions.json(b)
                ),
                method
            )
        );
    }

    // TestMain helpers

    public static boolean getCliArgValue(Object option) {
        String optionStr = (String) option;
        String[] args = Main.args;
        for (String arg : args) {
            if (arg.equals(optionStr)) {
                return true;
            }
        }
        return false;
    }

    public static void dump(Object... messObjects) {
        StringBuilder sb = new StringBuilder();
        for (Object obj : messObjects) {
            sb.append(Helpers.toStringOrNull(obj));
        }
        System.out.println(sb.toString());
    }

    public static void exitScript(int code) {
        System.exit(code);
    }

    public boolean isSync() {
        return false;
    }

    public String exceptionMessage(Object e) {
        return ((Exception) e).getMessage();
    }

    public static CompletableFuture<Void> close(Object exchange) {
        // do nothing
        return CompletableFuture.completedFuture(null);
    }

    public static boolean isNullValue(Object value) {
        return value == null;
    }

    public static Object convertAscii(Object data) {
        return data; // stub for now todo check
    }

    public static Object jsonStringify(Object data) {
        return Functions.json(data);
    }

    public static Exchange setFetchResponse(Object exchange2, Object response) {
        var exchange = (Exchange) exchange2;
        exchange.setFetchResponse(response);
        return exchange;
    }

    @SuppressWarnings("unchecked")
    public static CompletableFuture<Object> callExchangeMethodDynamicallySync(
        Object exchange,
        Object methodName2,
        Object... args
    ) throws Exception {
        throw new Exception("Not implemented");
    }

    @SuppressWarnings("unchecked")
    public static CompletableFuture<Object> callExchangeMethodDynamically(
        Object exchange,
        Object methodName2,
        Object... args
    ) throws Exception {
        var methodName = (String) methodName2;
        List<Object> realArgs;
        if (args.length == 0) {
            realArgs = new ArrayList<>();
        } else {
            realArgs = (List<Object>) args[0];
        }

        Method method = null;
        Class<?> clazz = exchange.getClass();

        for (Method m : clazz.getDeclaredMethods()) {
            if (m.getName().equals(methodName)) {
                method = m;
                break;
            }
        }

        if (method == null) {
            throw new NoSuchMethodException(methodName);
        }

        method.setAccessible(true);

        Class<?>[] parameterTypes = method.getParameterTypes();
        Object[] newArgs = new Object[parameterTypes.length];

        for (int i = 0; i < parameterTypes.length; i++) {
            if (i < realArgs.size()) {
                newArgs[i] = realArgs.get(i);
            } else {
                newArgs[i] = null;
            }
        }

        Object result = method.invoke(exchange, newArgs);

        if (result instanceof CompletableFuture<?>) {
            return (CompletableFuture<Object>) result;
        }

        return CompletableFuture.completedFuture(result);
    }

    public static Exception getRootException(Exception exc) {
        if (exc == null) {
            return null;
        }
        Throwable cause = exc.getCause();
        if (cause instanceof Exception) {
            return (Exception) cause;
        }
        return exc;
    }

    public static Object jsonParse(Object jsonString) {
        return JsonHelper.deserialize((String) jsonString);
    }

    public static Object getExchangeProp(Object exchange, Object prop) {
        return getExchangeProp(exchange, prop, null);
    }

    public static Object getExchangeProp(Object exchange, Object prop, Object defaultValue) {
        if (exchange == null || !(prop instanceof String)) {
            return defaultValue;
        }

        String propName = (String) prop;

        try {
            // 2) Try public field
            try {
                Field field = exchange.getClass().getField(propName);
                Object value = field.get(exchange);
                return (value != null) ? value : defaultValue;
            } catch (NoSuchFieldException ignored) {
                // fall through
            }

        } catch (Exception ignored) {
        }

        return defaultValue;
    }

    public static void setExchangeProp(Object exchange, Object prop, Object value) {
        if (exchange == null || !(prop instanceof String)) {
            return;
        }

        String propName = (String) prop;

        try {

            try {
                Field field = exchange.getClass().getField(propName);
                field.set(exchange, value);
            } catch (NoSuchFieldException ignored) {
            }

        } catch (Exception ignored) {
            // do nothing
        }
    }

    public static String getRootDir() {
        var prefix =FileSystems.getDefault().getPath("").toAbsolutePath();
//        var res = prefix + "/../../../../../" ;
//        return res;
        if (prefix.endsWith("java")) {
            return prefix + "/../";
        } else if (prefix.endsWith("tests")) {
            return prefix + "/../../";
        }
        return prefix +  "/../../../../../";
    }

        public static Object ioFileRead(Object path2) {
        if (!(path2 instanceof String)) {
            return null;
        }

        String path = (String) path2;

        try {
            String text = Files.readString(Path.of(path), StandardCharsets.UTF_8);
            return JsonHelper.deserialize(text);
        } catch (Exception e) {
            return null;
        }
    }

    public static boolean ioFileExists(Object path2) {
        if (!(path2 instanceof String)) {
            return false;
        }

        String path = (String) path2;

        try {
            return Files.exists(Path.of(path));
        } catch (Exception e) {
            return false;
        }
    }

    public static Object ioDirRead(Object path2) {
        if (!(path2 instanceof String)) {
            return null;
        }

        String path = (String) path2;

        try (Stream<Path> stream = Files.list(Path.of(path))) {
            List<String> fileNameOnly = new ArrayList<>();

            stream
                .filter(Files::isRegularFile)
                .forEach(p -> fileNameOnly.add(p.getFileName().toString()));

            return fileNameOnly;
        } catch (Exception e) {
            return null;
        }
    }

    public static Exchange initExchange(Object exchangeId, Object exchangeArgs, boolean isWs) {
        if (!(exchangeId instanceof String)) {
            return null;
        }

        String id = (String) exchangeId;

        // if (isWs) {
        //     id = "ccxt.pro." + id;
        // }

        return Exchange.dynamicallyCreateInstance(id, exchangeArgs, false);
    }

    public static Exchange initExchange(Object exchangeId, Object exchangeArgs) {
        return initExchange(exchangeId, exchangeArgs, false);
    }

    public static Object getEnvVars() {
        return System.getenv();
    }

    public String getLang() {
        return "java";
    }

    public String getExt() {
        return ".java";
    }

    public static CompletableFuture<Map<String, Object>> getTestFiles (Object properties, Object tests) {
        throw new RuntimeException("Not implemented");
    }

    public static Map<String, Object> getTestFilesSync (Object properties, Object tests) {
        throw new RuntimeException("Not implemented");
    }

    public static Object callMethodSync(Object testFiles2, Object methodName, Object exchange, Object... args)
    {
        throw new RuntimeException("Not implemented");
    }

    public static CompletableFuture<Object> callMethod(Object testFiles2, Object methodName, Object exchange, Object... args)
    {
        throw new RuntimeException("Not implemented");
    }

}