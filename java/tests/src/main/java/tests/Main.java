package tests;

import io.github.ccxt.base.Crypto;
import tests.base.Cryptography;

public class Main {
    public static void main(String[] args) {
        var argsList = java.util.Arrays.asList(args);
        var isBaseTests = argsList.contains("--baseTests");
        var runAll = argsList.contains("--all");
        var isWs = argsList.contains("--ws");

        System.out.println("Running tests...");

        var cryptoClass = new Cryptography();
        cryptoClass.testCryptography();
    }
}