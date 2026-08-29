package io.github.ccxt.base;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collection;
import java.util.Map;

@SuppressWarnings({"unchecked"})
public class NumberHelpers {

    // precisionConstants
    public static final int ROUND = 1;                // rounding mode
    public static final int TRUNCATE = 0;
    public static final int ROUND_UP = 2;
    public static final int ROUND_DOWN = 3;
    public static final int DECIMAL_PLACES = 2;       // digits counting mode
    public static final int SIGNIFICANT_DIGITS = 3;
    public static final int TICK_SIZE = 4;
    public static final int NO_PADDING = 5;           // zero-padding mode
    public static final int PAD_WITH_ZERO = 6;

    public static final Map<String, Integer> precisionConstants = Map.of(
            "ROUND", ROUND,
            "TRUNCATE", TRUNCATE,
            "ROUND_UP", ROUND_UP,
            "ROUND_DOWN", ROUND_DOWN,
            "DECIMAL_PLACES", DECIMAL_PLACES,
            "SIGNIFICANT_DIGITS", SIGNIFICANT_DIGITS,
            "TICK_SIZE", TICK_SIZE,
            "NO_PADDING", NO_PADDING,
            "PAD_WITH_ZERO", PAD_WITH_ZERO
    );

    // -----------------------------
    // Public API (names mirror C#)
    // -----------------------------

    public static String decimalToPrecision(Object x, Object roundingMode2, Object numPrecisionDigits2) {
        return DecimalToPrecision(x, roundingMode2, numPrecisionDigits2, DECIMAL_PLACES, NO_PADDING);
    }

    public static String decimalToPrecision(Object x, Object roundingMode2, Object numPrecisionDigits2, Object countmode2, Object paddingMode) {
        return DecimalToPrecision(x, roundingMode2, numPrecisionDigits2, countmode2, paddingMode);
    }


    public static double trunc(double value) {
        return value<0 ? Math.ceil(value) : Math.floor(value);
    }

    public static String DecimalToPrecision(Object x, Object roundingMode2, Object numPrecisionDigits2, Object countmode2, Object paddingMode) {
        int countMode = (countmode2 == null) ? DECIMAL_PLACES : toInt(countmode2);
        int roundingMode = toInt(roundingMode2);
        int padMode = (paddingMode == null) ? NO_PADDING : toInt(paddingMode);

        double numPrecisionDigits = toDouble(numPrecisionDigits2);

        if (countMode == TICK_SIZE) {
            if (numPrecisionDigits <= 0) {
                throw new IllegalArgumentException("TICK_SIZE cant be used with negative or zero numPrecisionDigits");
            }
        }

        double parsedX = toDouble(x);

        // negative precision: scale to power of 10
        if (numPrecisionDigits < 0) {
            double toNearest = Math.pow(10, Math.abs((int) (-numPrecisionDigits)));
            if (roundingMode == ROUND) {
                String res = DecimalToPrecision(parsedX / toNearest, ROUND, 0, DECIMAL_PLACES, padMode);
                double r = toDouble(res);
                return NumberToString2(toNearest * r);
            }
            if (roundingMode == TRUNCATE) {
                double v = parsedX - (parsedX % toNearest);
                return NumberToString2(v);
            }
        }

        // Tick-size mode
        if (countMode == TICK_SIZE) {
            int newNumPrecisionDigits = tickPrecision(numPrecisionDigits);
            if (newNumPrecisionDigits < 0) {
                String precisionDigitsString = DecimalToPrecision(numPrecisionDigits, ROUND, 22, DECIMAL_PLACES, NO_PADDING);
                newNumPrecisionDigits = PrecisionFromString(precisionDigitsString);
            }

            if (roundingMode == TRUNCATE) {
                String xStr = NumberToString2(parsedX);
                String truncatedX = TruncateToString(xStr, Math.max(0, newNumPrecisionDigits));
                parsedX = toDouble(truncatedX);

                double scale = Math.pow(10, newNumPrecisionDigits);
                long xScaled = Math.round(parsedX * scale);
                long tickScaled = Math.round(numPrecisionDigits * scale);
                long ticks = (long) trunc((double) xScaled / (double) tickScaled);
                parsedX = (ticks * (double) tickScaled) / scale;

                if (padMode == NO_PADDING) {
                    String result = String.format(java.util.Locale.ROOT, "%." + newNumPrecisionDigits + "f", parsedX);
                    return stripTrailingZeros(result);
                }
                return DecimalToPrecision(parsedX, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, padMode);
            }

            double missing = parsedX % numPrecisionDigits;
            missing = toDouble(DecimalToPrecision(missing, ROUND, 8, DECIMAL_PLACES, NO_PADDING));
            String fpError = DecimalToPrecision(missing / numPrecisionDigits, ROUND, Math.max(newNumPrecisionDigits, 8), DECIMAL_PLACES, NO_PADDING);
            int fpErrorResult = PrecisionFromString(fpError);

            if (fpErrorResult != 0) {
                if (roundingMode == ROUND) {
                    if (parsedX > 0) {
                        if (missing >= numPrecisionDigits / 2) {
                            parsedX = parsedX - missing + numPrecisionDigits;
                        } else {
                            parsedX = parsedX - missing;
                        }
                    } else {
                        if (missing >= numPrecisionDigits / 2) {
                            parsedX = parsedX - missing;
                        } else {
                            parsedX = parsedX - missing - numPrecisionDigits;
                        }
                    }
                } else if (roundingMode == TRUNCATE) {
                    parsedX = parsedX - missing;
                }
            }
            return DecimalToPrecision(parsedX, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, padMode);
        }

        // String-based rounding/truncation, ported from C#
        String str = NumberToString(x);
        if (str == null) return null;

        boolean isNegative = str.charAt(0) == '-';
        int strStart = isNegative ? 1 : 0;
        int strEnd = str.length();

        // find dot
        int strDot = str.indexOf('.');
        boolean hasDot = (strDot >= 0);
        if (!hasDot) strDot = strEnd;

        // char codes
        final int MINUS = 45;
        final int DOT = 46;
        final int ZERO = 48;
        final int ONE = ZERO + 1;
        final int FIVE = ZERO + 5;
        final int NINE = ZERO + 9;

        // For -123.4567, chars will hold 01234567 (leading zero for carry)
        int arraySize = (strEnd - strStart) + (hasDot ? 0 : 1);
        byte[] chars = new byte[arraySize];
        chars[0] = ZERO;

        int afterDot = arraySize;
        int digitsStart = -1;
        int digitsEnd = -1;

        for (int i = 1, j = strStart; j < strEnd; i++, j++) {
            char value = str.charAt(j);
            int c = (int) value;
            if ((c >= ZERO) && (c <= NINE)) {
                chars[i] = (byte) c;
                if ((c != ZERO) && (digitsStart < 0)) {
                    digitsStart = i;
                }
            } else if (c == DOT) {
                afterDot = i--;
            } else {
                throw new IllegalArgumentException(str + ": invalid number (contains an illegal character '" + value + "')");
            }
        }
        if (digitsStart < 0) digitsStart = 1;

        int precisionStart = (countMode == DECIMAL_PLACES) ? afterDot : digitsStart;
        int precisionEnd = precisionStart + (int) Math.round(numPrecisionDigits);

        // rounding/truncation from tail to head
        boolean allZeros = true;
        boolean signNeeded = isNegative;

        // integer cut equivalent to the per-digit test i >= precisionStart + numPrecisionDigits
        double cutoff = precisionStart + numPrecisionDigits;
        int cut = Integer.MAX_VALUE;
        if (cutoff <= 0) {
            cut = 0;
        } else if (cutoff <= arraySize) {
            cut = (int) Math.ceil(cutoff);
        }
        int i = arraySize - 1;
        int memo = 0;
        int from = (cut < 1) ? 1 : cut;
        if (from <= i) {
            // digits at/after the cut all become '0'; only chars[from] can carry out
            if ((roundingMode == ROUND) && (chars[from] >= FIVE)) memo = 1;
            Arrays.fill(chars, from, arraySize, (byte) ZERO);
            i = from - 1;
        }
        for (; i >= 0; i--) {
            int c = chars[i];
            if (i != 0) {
                c += memo;
                if (c > NINE) {
                    c = ZERO;
                    memo = 1;
                } else {
                    memo = 0;
                }
            } else if (memo != 0) {
                c = ONE; // leading extra digit
            }
            chars[i] = (byte) c;
            if (c != ZERO) {
                allZeros = false;
                digitsStart = i;
                digitsEnd = (digitsEnd < 0) ? (i + 1) : digitsEnd;
            }
        }

        if (countMode == SIGNIFICANT_DIGITS) {
            precisionStart = digitsStart;
            precisionEnd = precisionStart + (int) Math.round(numPrecisionDigits);
        }
        if (allZeros) {
            signNeeded = false;
        }

        int readStart = ((digitsStart >= afterDot) || allZeros) ? (afterDot - 1) : digitsStart;
        int readEnd = (digitsEnd < afterDot) ? (afterDot) : digitsEnd;

        int nSign = (signNeeded ? 1 : 0);
        int nBeforeDot = (nSign + (afterDot - readStart));
        int nAfterDot = Math.max(readEnd - afterDot, 0);
        int actualLength = (readEnd - readStart);
        int desiredLength = (padMode == NO_PADDING) ? (actualLength) : (precisionEnd - readStart);
        int pad = Math.max(desiredLength - actualLength, 0);
        int padStart = (nBeforeDot + 1 + nAfterDot);
        int padEnd = (padStart + pad);
        boolean isInteger = (nAfterDot + pad) == 0;

        int outLen = (nBeforeDot + (isInteger ? 0 : 1) + nAfterDot + pad);
        byte[] outArray = new byte[outLen];

        if (signNeeded) outArray[0] = MINUS;
        System.arraycopy(chars, readStart, outArray, nSign, nBeforeDot - nSign);
        if (!isInteger) {
            outArray[nBeforeDot] = DOT;
            System.arraycopy(chars, afterDot, outArray, nBeforeDot + 1, nAfterDot);
            Arrays.fill(outArray, padStart, padEnd, (byte) ZERO);
        }
        return new String(outArray, StandardCharsets.ISO_8859_1);
    }

    public static int precisionFromString(Object value2) {
        return PrecisionFromString(value2);
    }

    public static int PrecisionFromString(Object value2) {
        if (value2 == null) return 0;
        String value = (value2 instanceof String) ? (String) value2 : String.valueOf(value2);

        int ePos = Math.max(value.indexOf('e'), value.indexOf('E'));
        if (ePos >= 0) {
            // exponent part after e/E, trimmed in place to avoid a substring copy
            int start = ePos + 1;
            int end = value.length();
            while (start < end && value.charAt(start) <= ' ') start++;
            while (end > start && value.charAt(end - 1) <= ' ') end--;
            // allow +/-
            try {
                int exponent = Integer.parseInt(value, start, end, 10);
                return (-exponent);
            } catch (NumberFormatException ignored) {
                return 0;
            }
        }

        // trim trailing zeros after decimal
        int dot = value.indexOf('.');
        if (dot < 0) return 0;
        int i = value.length();
        while (i > 0 && value.charAt(i - 1) == '0') i--;
        if (i > 0 && value.charAt(i - 1) == '.') i--;
        return (i > dot) ? (i - dot - 1) : 0;
    }

    public static String TruncateToString(Object num, int precision) {
        String numStr = NumberToString(num);
        if (numStr == null) return null;

        if (precision > 0) {
            // manual scan equivalent to find() on ([-]*\d+\.\d{precision})(\d)
            int len = numStr.length();
            for (int i = 0; i + precision + 2 < len; i++) {
                int j = i;
                while (j < len && numStr.charAt(j) == '-') j++;
                int k = j;
                while (k < len && numStr.charAt(k) >= '0' && numStr.charAt(k) <= '9') k++;
                if (k == j || k >= len || numStr.charAt(k) != '.') continue;
                int end = k + 1 + precision;
                if (end >= len) continue;
                int d = k + 1;
                while (d <= end && numStr.charAt(d) >= '0' && numStr.charAt(d) <= '9') d++;
                if (d > end) return numStr.substring(i, end);
            }
            return numStr;
        }

        int dot = numStr.indexOf('.');
        if (dot >= 0) {
            return numStr.substring(0, dot);
        }
        return numStr;
    }

    public static String numberToString(Object number) {
        return NumberToString(number);
    }

    public static String NumberToString(Object number) {
        if (number == null) return null;

        if (number instanceof String) {
            return (String) number;
        }

        if (number instanceof Double) {
            return doubleToPlain((Double) number);
        }

        if (number instanceof Integer || number instanceof Long) {
            return String.valueOf(number);
        }

        if (number instanceof BigDecimal) {
            return ((BigDecimal) number)
                    .stripTrailingZeros()
                    .toPlainString();
        }

        if (number instanceof Number) {
            return doubleToPlain(((Number) number).doubleValue());
        }

        return String.valueOf(number);
    }

    // same bytes as BigDecimal.valueOf(v).stripTrailingZeros().toPlainString(), without BigDecimal
    private static String doubleToPlain(double v) {
        if (v == 0.0) return "0";
        long l = (long) v;
        if ((double) l == v && l < 9007199254740992L && l > -9007199254740992L) return Long.toString(l);
        if (Double.isNaN(v) || Double.isInfinite(v)) {
            return BigDecimal.valueOf(v).stripTrailingZeros().toPlainString();
        }
        String s = Double.toString(v);
        int ePos = s.indexOf('E');
        if (ePos < 0) {
            int end = s.length();
            while (s.charAt(end - 1) == '0') end--;
            if (s.charAt(end - 1) == '.') end--;
            return (end == s.length()) ? s : s.substring(0, end);
        }
        return expandSci(s, ePos);
    }

    private static String expandSci(String s, int ePos) {
        int sign = (s.charAt(0) == '-') ? 1 : 0;
        int i = ePos + 1;
        boolean negExp = s.charAt(i) == '-';
        if (negExp || s.charAt(i) == '+') i++;
        int exp = 0;
        int len = s.length();
        while (i < len) exp = exp * 10 + (s.charAt(i++) - '0');
        if (negExp) exp = -exp;
        int digEnd = ePos;
        while (s.charAt(digEnd - 1) == '0') digEnd--;
        int nd = digEnd - sign - 1;
        int pow = exp - nd + 1;
        int outLen;
        int intLen = nd + pow;
        if (pow >= 0) {
            outLen = sign + nd + pow;
        } else if (intLen > 0) {
            outLen = sign + nd + 1;
        } else {
            outLen = sign + 2 - pow;
        }
        char[] out = new char[outLen];
        int k = 0;
        if (sign == 1) out[k++] = '-';
        if (pow < 0 && intLen <= 0) {
            out[k++] = '0';
            out[k++] = '.';
            for (int z = -intLen; z > 0; z--) out[k++] = '0';
        }
        for (int j = 0; j < nd; j++) {
            if (pow < 0 && intLen > 0 && j == intLen) out[k++] = '.';
            out[k++] = (j == 0) ? s.charAt(sign) : s.charAt(sign + 1 + j);
        }
        for (int z = pow; z > 0; z--) out[k++] = '0';
        return new String(out);
    }

    public static String NumberToString2(Object number) {
        return NumberToString(number);
        // if (number == null) return null;

        // if (number instanceof Integer || number instanceof Long) {
        //     return String.valueOf(number);
        // }
        // if (number instanceof String) {
        //     return (String) number;
        // }

        // // Prefer BigDecimal plain string (covers both small and large exponents cleanly)
        // if (number instanceof java.lang.Number) {
        //     return BigDecimal.valueOf(((java.lang.Number) number).doubleValue()).toPlainString();
        // }
        // return String.valueOf(number);
    }

    // -----------------------------
    // Helpers
    // -----------------------------

    private static final double[] POW10 = {
            1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11,
            1e12, 1e13, 1e14, 1e15, 1e16, 1e17, 1e18, 1e19, 1e20, 1e21, 1e22
    };

    // decimal places of the tick's shortest repr; -1 means "fall back to the generic path"
    private static int tickPrecision(double tick) {
        if (tick > 1e-15 && tick < 1e15) {
            for (int n = 0; n < 16; n++) {
                double m = Math.rint(tick * POW10[n]);
                if (Math.abs(m) < 1e15 && m / POW10[n] == tick) return n;
            }
        }
        return -1;
    }

    private static boolean isTrue(Object o) {
        if (o == null) return false;
        if (o instanceof Boolean) return (Boolean) o;
        if (o instanceof Number) return ((Number) o).intValue() != 0;
        if (o instanceof String) return !((String) o).isEmpty();
        if (o instanceof Collection<?>) return !((Collection<?>) o).isEmpty();
        if (o instanceof Map<?, ?>) return true;
        return true; // fallback truthy
    }

    private static int toInt(Object o) {
        if (o instanceof Integer) return (Integer) o;
        if (o instanceof Long) return ((Long) o).intValue();
        if (o instanceof Double) return ((Double) o).intValue();
        if (o instanceof Float) return ((Float) o).intValue();
        if (o instanceof String) return Integer.parseInt(((String) o).trim());
        if (o instanceof java.math.BigDecimal) return ((BigDecimal) o).intValue();
        throw new IllegalArgumentException("Cannot convert to int: " + o);
    }

    private static double toDouble(Object o) {
        if (o instanceof Double) return (Double) o;
        if (o instanceof Float) return ((Float) o).doubleValue();
        if (o instanceof Long) return ((Long) o).doubleValue();
        if (o instanceof Integer) return ((Integer) o).doubleValue();
        if (o instanceof String) return Double.parseDouble(((String) o).trim());
        if (o instanceof BigDecimal) return ((BigDecimal) o).doubleValue();
        throw new IllegalArgumentException("Cannot convert to double: " + o);
    }

    private static String toPlainString(double v) {
        return BigDecimal.valueOf(v).toPlainString();
    }

    private static String stripTrailingZeros(String s) {
        if (s == null) return null;
        if (s.indexOf('.') < 0) return s;
        // remove trailing zeros and possible trailing dot
        int i = s.length();
        while (i > 0 && s.charAt(i - 1) == '0') i--;
        if (i > 0 && s.charAt(i - 1) == '.') i--;
        return (i == s.length()) ? s : s.substring(0, i);
    }
}
