package io.github.ccxt.base;

import java.math.BigInteger;

public class Precise {

    public Object decimals = -1;
    public BigInteger integer = BigInteger.ZERO;
    // kept for API compatibility; never actually consulted (mirrors the dead
    // `base` field on the TS/JS Precise class) — all power-of-ten math below
    // is fixed to base 10 via the POWERS_OF_TEN cache
    public long baseNumber = 10;

    // static bounded lookup table for 10^n, n in [0, 128] — order-independent,
    // never invalidated, uniform O(1) cost for any input (falls back to
    // BigInteger.pow for exponents beyond the table)
    private static final BigInteger[] POWERS_OF_TEN = buildPowersOfTen();

    private static BigInteger[] buildPowersOfTen() {
        BigInteger[] table = new BigInteger[129];
        table[0] = BigInteger.ONE;
        for (int i = 1; i < table.length; i++) {
            table[i] = table[i - 1].multiply(BigInteger.TEN);
        }
        return table;
    }

    private static BigInteger powerOfTen(int exponent) {
        return (exponent < POWERS_OF_TEN.length) ? POWERS_OF_TEN[exponent] : BigInteger.TEN.pow(exponent);
    }

    // -------- ctor ----------

    // internal fast path: builds directly from an already-computed BigInteger
    // and int decimals, skipping the BigInteger -> String -> BigInteger
    // round-trip that every op previously paid on every intermediate result
    private Precise(BigInteger integer, int decimals) {
        this.integer = integer;
        this.decimals = decimals;
    }

    public Precise(Object number2) {
        this(number2, null);
    }

    public Precise(Object number2, Object dec2) {
        if (dec2 == null) {
            String number = String.valueOf(number2);
            int modified = 0;
            // scientific notation is rare -- only locate an exponent marker
            // when one is present, instead of lowercasing every input
            int eIndex = number.indexOf('e');
            if (eIndex == -1) {
                eIndex = number.indexOf('E');
            }
            if (eIndex > -1) {
                modified = Integer.parseInt(number.substring(eIndex + 1).trim());
                number = number.substring(0, eIndex);
            }
            int decimalIndex = number.indexOf('.');
            String integerString;
            int newDecimals;
            if (decimalIndex > -1) {
                newDecimals = number.length() - decimalIndex - 1;
                integerString = number.substring(0, decimalIndex) + number.substring(decimalIndex + 1);
            } else {
                newDecimals = 0;
                integerString = number;
            }
            this.integer = new BigInteger(integerString);
            this.decimals = newDecimals - modified;
        } else if (number2 instanceof BigInteger) {
            this.integer = (BigInteger) number2;
            this.decimals = toInt(dec2);
        } else {
            this.integer = new BigInteger(String.valueOf(number2));
            this.decimals = toInt(dec2);
        }
    }

    // ---------- ops ----------
    public Precise mul(Precise other) {
        int decimals = toInt(this.decimals) + toInt(other.decimals);
        return new Precise(this.integer.multiply(other.integer), decimals);
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
            numerator = this.integer.divide(powerOfTen(-distance));
        } else {
            numerator = this.integer.multiply(powerOfTen(distance));
        }
        BigInteger result = numerator.divide(other.integer);
        return new Precise(result, precision);
    }

    public Precise add(Precise other) {
        int thisDecimals = toInt(this.decimals);
        int otherDecimals = toInt(other.decimals);
        if (thisDecimals == otherDecimals) {
            return new Precise(this.integer.add(other.integer), thisDecimals);
        }
        int diff = thisDecimals - otherDecimals;
        if (diff > 0) {
            BigInteger scaledOther = other.integer.multiply(powerOfTen(diff));
            return new Precise(scaledOther.add(this.integer), thisDecimals);
        }
        BigInteger scaledThis = this.integer.multiply(powerOfTen(-diff));
        return new Precise(scaledThis.add(other.integer), otherDecimals);
    }

    public Precise mod(Precise other) {
        int thisDecimals = toInt(this.decimals);
        int otherDecimals = toInt(other.decimals);
        int rationizerNumerator = Math.max(-thisDecimals + otherDecimals, 0);
        BigInteger numerator = this.integer.multiply(powerOfTen(rationizerNumerator));
        int rationizerDenominator = Math.max(-otherDecimals + thisDecimals, 0);
        BigInteger denominator = other.integer.multiply(powerOfTen(rationizerDenominator));
        BigInteger result = numerator.remainder(denominator);
        return new Precise(result, rationizerDenominator + otherDecimals);
    }

    public Precise sub(Precise other) {
        int thisDecimals = toInt(this.decimals);
        int otherDecimals = toInt(other.decimals);
        if (thisDecimals == otherDecimals) {
            return new Precise(this.integer.subtract(other.integer), thisDecimals);
        }
        // inline of add (this, neg (other)) without the intermediate instance
        boolean thisIsBigger = thisDecimals > otherDecimals;
        BigInteger smallerInteger = thisIsBigger ? other.integer : this.integer;
        BigInteger biggerInteger = thisIsBigger ? this.integer : other.integer;
        int biggerDecimals = thisIsBigger ? thisDecimals : otherDecimals;
        int smallerDecimals = thisIsBigger ? otherDecimals : thisDecimals;
        BigInteger normalised = smallerInteger.multiply(powerOfTen(biggerDecimals - smallerDecimals));
        BigInteger result = thisIsBigger ? biggerInteger.subtract(normalised) : normalised.subtract(biggerInteger);
        return new Precise(result, biggerDecimals);
    }

    public Precise or(Precise other) {
        return new Precise(this.integer.or(other.integer), toInt(this.decimals));
    }

    public Precise neg() {
        return new Precise(this.integer.negate(), toInt(this.decimals));
    }

    public Precise min(Precise other) {
        return this.lt(other) ? this : other;
    }

    public Precise max(Precise other) {
        return this.gt(other) ? this : other;
    }

    // aligned comparison without intermediate instance allocation: aligns the
    // operand with fewer decimals by multiplying its integer by 10^difference,
    // then compares the scaled integers directly (used by gt/ge/lt/le below,
    // replacing the previous sub(other) + new Precise(...) + compareTo chain)
    private int compare(Precise other) {
        int thisDecimals = toInt(this.decimals);
        int otherDecimals = toInt(other.decimals);
        if (thisDecimals == otherDecimals) {
            return this.integer.compareTo(other.integer);
        }
        int diff = thisDecimals - otherDecimals;
        if (diff > 0) {
            BigInteger scaledOther = other.integer.multiply(powerOfTen(diff));
            return this.integer.compareTo(scaledOther);
        }
        BigInteger scaledThis = this.integer.multiply(powerOfTen(-diff));
        return scaledThis.compareTo(other.integer);
    }

    public boolean gt(Precise other) {
        return this.compare(other) > 0;
    }

    public boolean ge(Precise other) {
        return this.compare(other) >= 0;
    }

    public boolean lt(Precise other) {
        return this.compare(other) < 0;
    }

    public boolean le(Precise other) {
        return this.compare(other) <= 0;
    }

    public Precise abs() {
        BigInteger result = (this.integer.signum() < 0) ? this.integer.negate() : this.integer;
        return new Precise(result, toInt(this.decimals));
    }

    // internal: strips trailing zero digits from the integer representation
    // and returns the reduced digit string (sign included) so callers that
    // immediately stringify (toString) avoid a second integer-to-string
    // conversion
    private String reduceDigits() {
        String str = this.integer.toString();
        int start = str.length() - 1;
        if (start == 0) {
            if (str.equals("0")) {
                this.decimals = 0;
            }
            return str;
        }
        int i;
        for (i = start; i >= 0; i--) {
            if (str.charAt(i) != '0') {
                break;
            }
        }
        int difference = start - i;
        if (difference == 0) {
            return str;
        }
        this.decimals = toInt(this.decimals) - difference;
        String reduced = str.substring(0, i + 1);
        this.integer = new BigInteger(reduced);
        return reduced;
    }

    // reduces the representation in place, returns the instance so calls can
    // be chained (precise.reduce().toString())
    public Precise reduce() {
        this.reduceDigits();
        return this;
    }

    public boolean equals(Precise other) {
        this.reduce();
        other.reduce();
        return this.integer.equals(other.integer) && (toInt(this.decimals) == toInt(other.decimals));
    }

    @Override
    public String toString() {
        String digits = this.reduceDigits();
        String sign = "";
        if (!digits.isEmpty() && digits.charAt(0) == '-') {
            sign = "-";
            digits = digits.substring(1);
        }
        int decimals = toInt(this.decimals);
        if (decimals <= 0) {
            return sign + digits + repeat('0', -decimals);
        }
        if (digits.length() <= decimals) {
            return sign + "0." + leftPad(digits, decimals, '0');
        }
        int index = digits.length() - decimals;
        return sign + digits.substring(0, index) + "." + digits.substring(index);
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
        if (string2Precise.integer.signum() == 0) {
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
        if (string1 == null || string2 == null) return null;
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
