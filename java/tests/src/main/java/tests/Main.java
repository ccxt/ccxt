package tests;

import tests.base.TestInit;

public class Main {
    public static void main(String[] args) {
        var argsList = java.util.Arrays.asList(args);
        var isBaseTests = argsList.contains("--baseTests");
        var runAll = argsList.contains("--all");
        var isWs = argsList.contains("--ws");

        System.out.println("Running tests...");

        if (isBaseTests) {
            System.out.println("Running base tests...");
            var baseTests = new TestInit();
            baseTests.baseTestsInit().join();
        }
    }
}