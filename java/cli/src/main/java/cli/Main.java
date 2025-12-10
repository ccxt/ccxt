package cli;

import java.io.IOException;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

// import io.github.ccxt.exchanges.Binance;
import io.github.ccxt.Exchange;

public class Main {

    public static boolean verbose = false;
    public static boolean sandbox = false;
    public static boolean demo = false;
    public static boolean noKeys = false;

    public static ArrayList<String> exchangeIds = new ArrayList<String>();

    public static String exchangesPath = FileSystems.getDefault().getPath("").toAbsolutePath() + "../../../../.." + "/exchanges.json";


    public static void InitOptions(Exchange instance, String[] args) {

        if (args.length > 0) {
            for (String arg : args) {
                if (arg.equals("--verbose")) {
                    verbose = true;
                    // instance.verbose = true;
                } else if (arg.equals("--sandbox")) {
                    sandbox = true;
                    instance.setSandboxMode(true);
                } else if (arg.equals("--demo")) {
                    demo = true;
                    // instance.setDemoMode(true);
                    instance.enableDemoTrading(true);
                } else if (arg.equals("--no-keys")) {
                    noKeys = true;
                }
            }
        }
    }

    public static Object[] getParamsFromArgs(String[] args) {
        ArrayList<Object> params = new ArrayList<Object>();
        if (args.length > 2) {
            for (int i = 2; i < args.length; i++) {
                var arg = args[i];
                if (arg.startsWith("{") || arg.startsWith("[")) {
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        Object json = mapper.readValue(arg, Object.class);
                        params.add(json);
                    } catch (Exception e) {
                        params.add(arg);
                    }
                } else if (arg.equals("true") || arg.equals("false")) {
                    params.add(Boolean.parseBoolean(arg));
               } else if (arg.equals("null")) {
                    params.add(null);
               } else if (arg.matches("-?\\d+")) {
                    params.add(Integer.parseInt(arg));
                } else if (arg.matches("-?\\d+\\.\\d+")) {
                    params.add(Double.parseDouble(arg));
                }
                else {
                    params.add(arg);
               }

            }
        }
        return params.toArray();
    }


    public static void setCredentials(Exchange instance) throws IllegalArgumentException, IllegalAccessException, IOException {
        var basePath = FileSystems.getDefault().getPath("").toAbsolutePath().toString();
        var prefix = (basePath.endsWith("cli")) ? "/../../" : "/../";
        var keysJsonPath = basePath + prefix + "keys.json";

//        System.out.println("Looking for keys.json at: " + keysJsonPath);

        Map<String, Object> keysJsonContent = null;
        if (FileSystems.getDefault().getPath(keysJsonPath).toFile().exists()) {
            System.out.println("Loading credentials from: " + keysJsonPath);
//            var content = FileUtils.readFileAsString(keysJsonPath);
            String content = new String(Files.readAllBytes(Paths.get(keysJsonPath)));

            try {
                ObjectMapper mapper = new ObjectMapper();
                keysJsonContent = mapper.readValue(content, Map.class);
            } catch (Exception e) {
                System.out.println("Error parsing keys.json: " + e.getMessage());
            }
        }

        Map<String, Boolean> credentials = (Map<String, Boolean>)instance.requiredCredentials;
        if (noKeys || credentials == null) {
            return;
        }

        for (Map.Entry<String, Boolean> entry : credentials.entrySet()) {
            String key = entry.getKey();
            Boolean required = entry.getValue();

            if (!Boolean.TRUE.equals(required)) {
                continue;
            }

            String instanceIdKey = instance.id;
            String credentialValue = null;

            if (keysJsonContent != null && keysJsonContent.containsKey(instanceIdKey)) {
                Map<String, Object> instanceCredentials = (Map<String, Object>)keysJsonContent.get(instanceIdKey);
                if (instanceCredentials.containsKey(key)) {
                    credentialValue = instanceCredentials.get(key).toString();
                    System.out.println("Setting credential from keys.json: " + instanceIdKey + "." + key);
                    setProperty(instance, key, credentialValue);
                    continue;
                }
            }
            String envKey = instanceIdKey.toUpperCase() + "_" + key.toUpperCase();
            credentialValue = System.getenv(envKey);

            if (credentialValue != null && credentialValue.startsWith("-----BEGIN")) {
                credentialValue = credentialValue.replace("\\n", "\n");
            }

            if (credentialValue != null) {
                System.out.println("Setting credential from ENV: " + envKey);
                setProperty(instance, key, credentialValue);
            }
        }
    }

    private static void setProperty(Exchange instance, String key, String value)
            throws IllegalArgumentException, IllegalAccessException {

        Class<?> clazz = instance.getClass();
        Field field = null;

        // look for the field in this class and its superclasses
        while (clazz != null) {
            try {
                field = clazz.getDeclaredField(key);
                break; // found it
            } catch (NoSuchFieldException e) {
                clazz = clazz.getSuperclass(); // go up the hierarchy
            }
        }

        if (field != null) {
            field.setAccessible(true);
            field.set(instance, value);
        } else {
            System.out.println("No field or setter found for credential: " + key);
        }
    }

    public static Object callDynamic(Object instance, String methodName, Object... args) {
        Class<?> clazz = instance.getClass();

        try {
            Class<?>[] paramTypes = Arrays.stream(args)
                                        .map(a -> a == null ? null : a.getClass())
                                        .toArray(Class<?>[]::new);

            try {
                Method m = clazz.getMethod(methodName, paramTypes);
                return m.invoke(instance, args);
            } catch (NoSuchMethodException ignore) {
                // Try matching a varargs method
            }

            // Try varargs method: (Object, Object[])
            for (Method m : clazz.getMethods()) {
                if (!m.getName().equals(methodName)) continue;

                if (m.isVarArgs()) {
                    Class<?>[] types = m.getParameterTypes();

                    int fixedCount = types.length - 1;

                    if (args.length < fixedCount) continue;

                    Object[] invokeArgs = new Object[types.length];

                    for (int i = 0; i < fixedCount; i++) {
                        invokeArgs[i] = args[i];
                    }

                    // Build the varargs array
                    Class<?> varType = types[fixedCount].getComponentType();
                    int varCount = args.length - fixedCount;

                    Object varArray = Array.newInstance(varType, varCount);
                    for (int i = 0; i < varCount; i++) {
                        Array.set(varArray, i, args[fixedCount + i]);
                    }

                    invokeArgs[fixedCount] = varArray;

                    return m.invoke(instance, invokeArgs);
                }
            }

            throw new NoSuchMethodException("Method " + methodName + " not found");

        } catch (Exception e) {
            throw new RuntimeException("Error calling method: " + methodName, e);
        }
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        System.out.println("[java] CCXT CLI");



        // System.out.println("User Directory: " + userDirectory);

        if (args.length < 2) {
            System.out.println("Usage: java -cp <classpath> cli.Main [--verbose] [--sandbox] <exchange-id> [arg1 arg2 ...]");
            return;
        }

       var exchangeName = args[0];
        //  var exchangeName = "binance";
       var methodName = args[1];
        //  var methodName = "fetchBalance";

        var params = getParamsFromArgs(args);

        var instance = Exchange.dynamicallyCreateInstance(exchangeName, null);

        var callExpressionString = instance.id + "." + methodName + "(" + java.util.Arrays.toString(params) + ")";
        System.out.println(callExpressionString);

        try {
            InitOptions(instance, args);
            setCredentials(instance);

            if (Main.verbose) {
                instance.verbose = true;
            }
            // instance.enableDemoTrading(true); // tmp remove
//            var currencies = instance.fetchCurrencies().get();
//            System.out.println("Currencies: " + currencies);
            instance.loadMarkets().get();
            // instance.verbose = true;
            CompletableFuture<?> f = (CompletableFuture<?>) callDynamic(instance, methodName, params);
            var response = f.get();
            System.out.println(response);
        } catch (Exception e) {
        	System.out.println(e);
        }
    }
}