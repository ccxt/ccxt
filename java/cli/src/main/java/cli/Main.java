package cli;

import java.io.IOException;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;


import com.fasterxml.jackson.core.util.DefaultIndenter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.core.util.Separators;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import io.github.ccxt.errors.AuthenticationError;

// import io.github.ccxt.wrappers.Binance;
import io.github.ccxt.Exchange;
import io.github.ccxt.BaseExchange;
import io.github.ccxt.Helpers;
import io.github.ccxt.MetaData;
import io.github.ccxt.Version;


class PrettyPrinter {

    // "key": value spacing and one array element per line
    private static final ObjectWriter writer = new ObjectMapper()
            .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS)
            .writer(new DefaultPrettyPrinter(Separators.createDefaultInstance()
                    .withObjectFieldValueSpacing(Separators.Spacing.AFTER))
                    .withArrayIndenter(DefaultIndenter.SYSTEM_LINEFEED_INSTANCE));

    static void prettyPrintData(Object data) {
        try {
            String json = writer.writeValueAsString(data);
            System.out.println(json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}


public class Main {

    public static boolean verbose = false;
    public static boolean sandbox = false;
    public static boolean demo = false;
    public static boolean noKeys = false;

    public static ArrayList<String> exchangeIds = new ArrayList<String>();

    public static String exchangesPath = FileSystems.getDefault().getPath("").toAbsolutePath() + "../../../../.." + "/exchanges.json";


    public static void InitOptions(BaseExchange instance, String[] args) {

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


    public static void setCredentials(BaseExchange instance) throws IllegalArgumentException, IllegalAccessException, IOException {
        var basePath = FileSystems.getDefault().getPath("").toAbsolutePath().toString();
        var prefix = (basePath.endsWith("cli")) ? "/../../" : "/../";
        // later files override earlier ones (keys.local.json deep-extends keys.json)
        String[] keysFileNames = { "keys.json", "keys.local.json" };

        Map<String, Object> keysJsonContent = null;
        for (String keysFileName : keysFileNames) {
            var keysJsonPath = basePath + prefix + keysFileName;
            if (!FileSystems.getDefault().getPath(keysJsonPath).toFile().exists()) {
                continue;
            }
            System.out.println("Loading credentials from: " + keysJsonPath);
            String content = new String(Files.readAllBytes(Paths.get(keysJsonPath)));
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> fileContent = mapper.readValue(content, Map.class);
                keysJsonContent = (keysJsonContent == null) ? fileContent : deepExtend(keysJsonContent, fileContent);
            } catch (Exception e) {
                System.out.println("Error parsing " + keysFileName + ": " + e.getMessage());
            }
        }

        // apply per-exchange "options" (non-secret config, e.g. defaultType) from keys files
        if (keysJsonContent != null && keysJsonContent.get(instance.id) instanceof Map) {
            Map<String, Object> exchangeConfig = (Map<String, Object>) keysJsonContent.get(instance.id);
            Object fileOptions = exchangeConfig.get("options");
            if (fileOptions instanceof Map) {
                System.out.println("Setting options from keys files: " + instance.id + ".options");
                // deep-merge here, extendExchangeOptions only does a shallow extend
                instance.extendExchangeOptions(deepExtend(instance.options, (Map<String, Object>) fileOptions));
            }
        }

        Map<String, Boolean> credentials = (Map<String, Boolean>)instance.requiredCredentials;
        if (noKeys || credentials == null) {
            return;
        }

        for (Map.Entry<String, Boolean> entry : credentials.entrySet()) {
            String key = entry.getKey();
            // attempt every declared credential, not only required ones: some exchanges (e.g.
            // polymarket) mark all credentials optional and validate at call time, but still need
            // them set from keys.json / env to function

            String instanceIdKey = instance.id;
            String credentialValue = null;

            if (keysJsonContent != null && keysJsonContent.containsKey(instanceIdKey)) {
                Map<String, Object> instanceCredentials = (Map<String, Object>)keysJsonContent.get(instanceIdKey);
                if (instanceCredentials.containsKey(key)) {
                    credentialValue = instanceCredentials.get(key).toString();
                    System.out.println("Setting credential from keys .json: " + instanceIdKey + "." + key);
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

    @SuppressWarnings("unchecked")
    private static Map<String, Object> deepExtend(Map<String, Object> target, Map<String, Object> source) {
        Map<String, Object> result = new java.util.LinkedHashMap<>(target);
        for (Map.Entry<String, Object> entry : source.entrySet()) {
            Object existing = result.get(entry.getKey());
            Object incoming = entry.getValue();
            if (existing instanceof Map && incoming instanceof Map) {
                result.put(entry.getKey(), deepExtend((Map<String, Object>) existing, (Map<String, Object>) incoming));
            } else {
                result.put(entry.getKey(), incoming);
            }
        }
        return result;
    }

    private static void setProperty(BaseExchange instance, String key, String value)
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

    // every exchange method has one typed signature: resolve it by name, omitted trailing args padded
    public static Object callDynamic(Object instance, String methodName, Object... args) {
        try {
            return Helpers.callDynamically(instance, methodName, args);
        } catch (Exception e) {
            throw new RuntimeException("Error calling method: " + methodName, e);
        }
    }



//     public static void Main2() {
//         var second = new Second();
//         var res = second.createOrder(1,2,4);
// //        var exchange = new Binance();
// //        exchange.apiKey = "HEREHjhMFvuF1veWQVdUbLIy7TiCYe9fj4W6sEukmddD8TM9kPVRHMK6nS2SdV5mwE5u";
// //        exchange.secret = "Suu9pWcO9zbvVuc6cSQsVuiiw2DmmA8DgHrUfePF9s2RtaHa0zxK3eAF4MfIk7Pd";
// //        exchange.enableDemoTrading(true);
//         try {
// //            var balance = exchange.fetchBalance();
// //            System.out.println(balance);
//         } catch (Exception e) {
//             Throwable cause = e.getCause();
//             if (cause instanceof io.github.ccxt.errors.ExchangeError ae) {
//                 // throw ae; // or handle it
//                 System.out.println("Working Authentication error: " + ae.getMessage());
//             }
//             // if (e instanceof AuthenticationError) {
//             //     System.out.println("Authentication error: " + e.getMessage());
//             // } else {
//             //     System.out.println("Error fetching balance: " + e.getMessage());
//             // }
//         }
//     }

    public static void main(String[] args) throws IOException, InterruptedException {
        System.out.println("[java][" + Version.VERSION +"] CCXT CLI");
        // System.out.println("User Directory: " + userDirectory);

        // -p / --prediction forces the prediction namespace for ids that exist in both
        // (e.g. hyperliquid); prediction-only ids resolve there automatically as a fallback.
        // strip the flag so it is not mistaken for a positional method argument
        var forcePrediction = false;
        ArrayList<String> positionalArgs = new ArrayList<String>();
        for (String arg : args) {
            if (arg.equals("-p") || arg.equals("--prediction")) {
                forcePrediction = true;
            } else {
                positionalArgs.add(arg);
            }
        }
        args = positionalArgs.toArray(new String[0]);

        if (args.length < 2) {
            System.out.println("Usage: java -cp <classpath> cli.Main [--verbose] [--sandbox] [-p|--prediction] <exchange-id> [arg1 arg2 ...]");
            return;
        }

        var exchangeName = args[0];
        var methodName = args[1];

        var isWsMethod = methodName.startsWith("watch");

        var params = getParamsFromArgs(args);

        var isProExchange = MetaData.ProExchanges.contains(exchangeName);

        var instance = Exchange.dynamicallyCreateInstance(exchangeName,  null, isProExchange, forcePrediction);

        var callExpressionString = instance.id + "." + methodName + "(" + java.util.Arrays.toString(params) + ")";
        System.out.println(callExpressionString);

        try {
            InitOptions(instance, args);
            setCredentials(instance);

            if (Main.verbose) {
                instance.verbose = true;
            }
            instance.loadMarkets(false, new java.util.HashMap<String, Object>()).get();

            while (true) {
                var f = callDynamic(instance, methodName, params);
                Object response;
                if (f instanceof CompletableFuture) {
                    response =  ((CompletableFuture<?>) f).get();
                } else {
                    response = f;
                }
                PrettyPrinter.prettyPrintData(response);

                if (!isWsMethod) {
                    break;
                }
            }
       } catch (Exception e) {
        	System.out.println(e);
        }
    }
}