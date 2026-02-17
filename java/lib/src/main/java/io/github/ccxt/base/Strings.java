package io.github.ccxt.base;

import java.util.UUID;

public class Strings {

    private Strings() {}

    // uuid without dashes
    public static String BaseUID() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    // uuid with dashes
    public static String uuid2() {
        return UUID.randomUUID().toString();
    }

    public static String uuid() {
        return uuid2();
    }

    public static String uuid16() {
        String base = BaseUID(); // 32 hex chars, so substring(0,16) is safe
        return base.substring(0, 16);
    }

    public static String uuid22() {
        String base = BaseUID(); // 32 hex chars
        return base.substring(0, 22);
    }

    // accept Object, convert to string, then trim
    public static Object strip(Object str) {
        if (str == null) return null;
        return String.valueOf(str).trim();
    }

    // accept Object, convert to string, capitalize first char
    public static String capitalize(Object str2) {
        if (str2 == null) return null;
        String s = String.valueOf(str2);
        if (s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}