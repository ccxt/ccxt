package tests;

import tests.base.TestInit;
import tests.exchange.TestMain;

public class Main {

    public static String[] args = {};

    public static void main(String[] args) {
        Main.args = args;
        var argsList = java.util.Arrays.asList(args);
        var isBaseTests = argsList.contains("--baseTests");
        var runAll = argsList.contains("--all");
        var isWs = argsList.contains("--ws");

        var argsWithoutFlags = argsList.stream().filter(arg -> !arg.startsWith("--")).toArray(String[]::new);
        String exchangeId = null;
        String symbol = null;
        String methodName = null;
        if (argsWithoutFlags.length > 0) {
            exchangeId = argsWithoutFlags[0];
            symbol = (argsWithoutFlags.length > 1) ? argsWithoutFlags[1] : null;
            methodName = (argsWithoutFlags.length > 2) ? argsWithoutFlags[2] : null;
        }
        System.out.println("Running tests...");

        if (isBaseTests) {
            System.out.println("Running base tests...");
            var baseTests = new TestInit();
            baseTests.baseTestsInit().join();
            return;
        }
        var testsClass = new TestMain();
        testsClass.init(exchangeId, symbol, methodName).join();
    }
}