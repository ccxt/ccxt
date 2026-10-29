package io.github.ccxt.base;

// String-typed twins of Helpers.parseInt/parseFloat(Object): same results for a String operand.
public final class JsParse {

    private JsParse() {}

    public static Long parseInt(String s) {
        try {
            return Long.parseLong(s);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    public static Double parseFloat(String s) {
        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException | NullPointerException ignored) {
            return 0.0;
        }
    }
}
