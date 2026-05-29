package io.github.ccxt.base;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

public class Precise {

    public Object decimals = -1;
    public BigInteger integer = BigInteger.ZERO;
    public long baseNumber = 10;

    // -------- ctor ----------
    public Precise(Object number2) {
        this(number2, null);
    }

    public Precise(Object number2, Object dec2) {
        int dec = (dec2 != null) ? toInt(dec2) : Integer.MIN_VALUE;
        String number = String.valueOf(number2);

        if (dec == Integer.MIN_VALUE) {
            int modified = 0;
            String numberLowerCase = number.toLowerCase();
            if (numberLowerCase.indexOf('e') > -1) {
                String[] parts = numberLowerCase.split("e");
                number = parts[0];
                modified = Integer.parseInt(parts[1].trim());
            }
            int decimalIndex = number.indexOf('.');
            int newDecimals = (decimalIndex > -1) ? (number.length() - decimalIndex - 1) : 0;
            this.decimals = newDecimals;
            String integerString = number.replace(".", "");
            this.integer = new BigInteger(integerString);
            this.decimals = toInt(this.decimals) - modified;
        } else {
            this.integer = new BigInteger(number);
            this.decimals = dec;
        }
    }

    // ---------- ops ----------
    public Precise mul(Precise other) {
        BigInteger integer = this.integer.multiply(other.integer);
        int decimals = toInt(this.decimals) + toInt(other.decimals);
        return new Precise(integer.toString(), decimals);
    }

    public Precise div(Precise other) {
        return div(other, 18);
    }

    public Precise div(Precise other, Object precision2) {
        int precision = (precision2 == null) ? 18 : toInt(precision2);
        int distance = precision - toInt(this.decimals) + toInt(other.decimals);

        BigInteger numerator;
        if (distance == 0) {
            numerator = this.integer;
        } else if (distance < 0) {
            BigInteger exponent = BigInteger.valueOf(baseNumber).pow(-distance);
            numerator = this.integer.divide(exponent);
        } else {
            BigInteger exponent = BigInteger.valueOf(baseNumber).pow(distance);
            numerator = this.integer.multiply(exponent);
        }
        BigInteger result = numerator.divide(other.integer);
        return new Precise(result.toString(), precision);
    }

    public Precise add(Precise other) {
        if (this.decimals == other.decimals) {
            BigInteger integerResult = this.integer.add(other.integer);
            return new Precise(integerResult.toString(), this.decimals);
        } else {
            Precise smaller;
            Precise bigger;
            if (toInt(this.decimals) < toInt(other.decimals)) {
                smaller = this;
                bigger = other;
            } else {
                smaller = other;
                bigger = this;
            }
            int exponent = toInt(bigger.decimals) - toInt(smaller.decimals);
            BigInteger factor = BigInteger.valueOf(baseNumber).pow(exponent);
            BigInteger normalized = smaller.integer.multiply(factor);
            BigInteger result = normalized.add(bigger.integer);
            return new Precise(result.toString(), bigger.decimals);
        }
    }

    public Precise mod(Precise other) {
        int rationizerNumerator = Math.max(-toInt(this.decimals) + toInt(other.decimals), 0);
        BigInteger numerator = this.integer.multiply(BigInteger.valueOf(this.baseNumber).pow(rationizerNumerator));
        int rationizerDenominator = Math.max(-toInt(other.decimals) + toInt(this.decimals), 0);
        BigInteger denominator = other.integer.multiply(BigInteger.valueOf(this.baseNumber).pow(rationizerDenominator));
        BigInteger result = numerator.remainder(denominator);
        return new Precise(result.toString(), rationizerDenominator + toInt(other.decimals));
    }

    public Precise sub(Precise other) {
        Precise negative = new Precise(other.integer.negate().toString(), other.decimals);
        return this.add(negative);
    }

    public Precise or(Precise other) {
        BigInteger integer = this.integer.or(other.integer);
        int decimals = toInt(this.decimals) + toInt(other.decimals);
        return new Precise(integer.toString(), decimals);
    }

    public Precise neg() {
        return new Precise(this.integer.negate().toString(), this.decimals);
    }

    public Precise min(Precise other) {
        return this.lt(other) ? this : other;
    }

    public Precise max(Precise other) {
        return this.gt(other) ? this : other;
    }

    public boolean gt(Precise other) {
        Precise sum = this.sub(other);
        return sum.integer.compareTo(BigInteger.ZERO) > 0;
    }

    public boolean ge(Precise other) {
        Precise sum = this.sub(other);
        return sum.integer.compareTo(BigInteger.ZERO) >= 0;
    }

    public boolean lt(Precise other) {
        return other.gt(this);
    }

    public boolean le(Precise other) {
        return other.ge(this);
    }

    public Precise abs() {
        BigInteger result = (this.integer.compareTo(BigInteger.ZERO) < 0)
                ? this.integer.negate()
                : this.integer;
        return new Precise(result.toString(), this.decimals);
    }

    public Precise reduce() {
        String str = this.integer.toString();
        int start = str.length() - 1;
        if (start == 0) {
            if (str.equals("0")) {
                this.decimals = 0;
            }
            return this;
        }
        int i;
        for (i = start; i >= 0; i--) {
            if (str.charAt(i) != '0') {
                break;
            }
        }
        int difference = start - i;
        if (difference == 0) {
            return this;
        }
        this.decimals = toInt(this.decimals) - difference;
        this.integer = new BigInteger(str.substring(0, i + 1));
        return this;
    }

    public boolean equals(Precise other) {
        this.reduce();
        other.reduce();
        return this.integer.equals(other.integer) && this.decimals == other.decimals;
    }

    @Override
    public String toString() {
        this.reduce();
        String sign = "";
        BigInteger abs;
        if (this.integer.compareTo(BigInteger.ZERO) < 0) {
            sign = "-";
            abs = this.integer.negate();
        } else {
            abs = this.integer;
        }
        String absParsed = abs.toString();

        int padSize = Math.max(toInt(this.decimals), 0);
        String padded = leftPad(absParsed, Math.max(padSize, absParsed.length()), '0');

        List<String> integerArray = new ArrayList<>(padded.length());
        for (int i = 0; i < padded.length(); i++) {
            integerArray.add(String.valueOf(padded.charAt(i)));
        }

        int index = integerArray.size() - toInt(this.decimals);

        String item;
        if (index == 0) {
            item = "0.";
        } else if (toInt(this.decimals) < 0) {
            item = repeat('0', -toInt(this.decimals));
        } else if (toInt(this.decimals) == 0) {
            item = "";
        } else {
            item = ".";
        }

        int arrayIndex = Math.min(index, integerArray.size());
        integerArray.add(arrayIndex, item);

        StringBuilder sb = new StringBuilder(sign);
        for (String s : integerArray) sb.append(s);
        return sb.toString();
    }

    // -------- static string ops --------
    public static String stringMul(Object string1, Object string2) {
        if (string1 == null || string2 == null) return null;
        return new Precise(String.valueOf(string1))
                .mul(new Precise(String.valueOf(string2)))
                .toString();
    }

    public static String stringDiv(Object string1, Object string2) {
        return stringDiv(string1, string2, 18);
    }

    public static String stringDiv(Object string1, Object string2, Object precision) {
        if (string1 == null || string2 == null) return null;
        Precise string2Precise = new Precise(String.valueOf(string2));
        if (string2Precise.integer.equals(BigInteger.ZERO)) {
            return null;
        }
        Precise stringDiv = new Precise(String.valueOf(string1)).div(string2Precise, precision);
        return stringDiv.toString();
    }

    public static String stringSub(Object string1, Object string2) {
        if (string1 == null || string2 == null) return null;
        return new Precise(String.valueOf(string1))
                .sub(new Precise(String.valueOf(string2)))
                .toString();
    }

    public static String stringAdd(Object string1, Object string2) {
        if (string1 == null && string2 == null) return null;
        if (string1 == null) return String.valueOf(string2);
        if (string2 == null) return String.valueOf(string1);
        return new Precise(String.valueOf(string1))
                .add(new Precise(String.valueOf(string2)))
                .toString();
    }

    public static String stringOr(Object string1, Object string2) {
        if (string1 == null || string2 == null) return null;
        return new Precise(String.valueOf(string1))
                .or(new Precise(String.valueOf(string2)))
                .toString();
    }

    public static boolean stringGt(Object a, Object b) {
        if (a == null || b == null) return false;
        return new Precise(String.valueOf(a)).gt(new Precise(String.valueOf(b)));
    }

    public static boolean stringEq(Object a, Object b) {
        if (a == null || b == null) return false;
        return new Precise(String.valueOf(a)).equals(new Precise(String.valueOf(b)));
    }

    public static String stringMax(Object a, Object b) {
        if (a == null || b == null) return null;
        return new Precise(a).max(new Precise(b)).toString();
    }

    public static boolean stringEquals(Object a, Object b) {
        if (a == null || b == null) return false;
        return new Precise(String.valueOf(a)).equals(new Precise(String.valueOf(b)));
    }

    public static String stringMin(Object string1, Object string2) {
        if (string1 == null || string2 == null) return null;
        return new Precise(String.valueOf(string1))
                .min(new Precise(String.valueOf(string2)))
                .toString();
    }

    public static boolean stringLt(Object a, Object b) {
        if (a == null || b == null) return false;
        return new Precise(a).lt(new Precise(b));
    }

    public static String stringAbs(Object a) {
        if (a == null) return null;
        return new Precise((String) a).abs().toString();
    }

    public static String stringNeg(Object a) {
        if (a == null) return null;
        return new Precise((String) a).neg().toString();
    }

    public static boolean stringLe(Object a, Object b) {
        if (a == null || b == null) return false;
        return new Precise(String.valueOf(a)).le(new Precise(String.valueOf(b)));
    }

    public static boolean stringGe(Object a, Object b) {
        if (a == null || b == null) return false;
        return new Precise(String.valueOf(a)).ge(new Precise(String.valueOf(b)));
    }

    public static String stringMod(Object a, Object b) {
        if (a == null || b == null) return null;
        return new Precise(a).mod(new Precise(b)).toString();
    }

    // -------- utilities --------
    private static int toInt(Object o) {
        if (o instanceof Integer) return (Integer) o;
        if (o instanceof Long) return ((Long) o).intValue();
        if (o instanceof String) return Integer.parseInt(((String) o).trim());
        throw new IllegalArgumentException("Cannot convert to int: " + o);
    }

    private static String leftPad(String s, int size, char ch) {
        if (s.length() >= size) return s;
        StringBuilder sb = new StringBuilder(size);
        for (int i = s.length(); i < size; i++) sb.append(ch);
        sb.append(s);
        return sb.toString();
    }

    private static String repeat(char ch, int n) {
        if (n <= 0) return "";
        StringBuilder sb = new StringBuilder(n);
        for (int i = 0; i < n; i++) sb.append(ch);
        return sb.toString();
    }
}
