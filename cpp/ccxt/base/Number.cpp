#include "Number.h"

#include "Errors.h"
#include "helpers.h"

#include <algorithm>
#include <charconv>
#include <cmath>
#include <cstdio>
#include <stdexcept>
#include <vector>

namespace ccxt {

namespace {

// the mode constants, as plain ints (helpers.h exposes them boxed in std::any)
constexpr int MODE_TRUNCATE           = 0;
constexpr int MODE_ROUND              = 1;
constexpr int MODE_DECIMAL_PLACES     = 2;
constexpr int MODE_SIGNIFICANT_DIGITS = 3;
constexpr int MODE_TICK_SIZE          = 4;
constexpr int MODE_NO_PADDING         = 5;
constexpr int MODE_PAD_WITH_ZERO      = 6;

double toNumber (const std::any& value) {
    if (isNum (value)) {
        return toDouble (value);
    }
    const std::string text = numberToText (value);
    try {
        std::size_t consumed = 0;
        const double parsed = std::stod (text, &consumed);
        return (consumed == 0) ? 0.0 : parsed;
    } catch (const std::exception&) {
        return 0.0;
    }
}

} // namespace

// ---------------------------------------------------------------------------
// numberToText
// ---------------------------------------------------------------------------

std::string numberToText (const std::any& value) {
    if (!value.has_value ()) {
        return std::string ();
    }
    if (isStr (value)) {
        return std::any_cast<std::string> (value);
    }
    if (isBoolean (value)) {
        return std::any_cast<bool> (value) ? "true" : "false";
    }
    if (isInt (value)) {
        return std::to_string (toLong (value));
    }
    if (!isNum (value)) {
        return str (value);
    }
    const double x = toDouble (value);
    if (!std::isfinite (x)) {
        return str (value);
    }
    char buffer[64];
    const auto converted = std::to_chars (buffer, buffer + sizeof (buffer), x);
    if (converted.ec != std::errc ()) {
        return str (value);
    }
    std::string text (buffer, converted.ptr);
    const std::size_t at = text.find_first_of ("eE");
    if (at == std::string::npos) {
        return text;
    }
    int exponent = 0;
    try {
        exponent = std::stoi (text.substr (at + 1));
    } catch (const std::exception&) {
        return text;
    }
    std::string mantissa = text.substr (0, at);
    std::string sign;
    if (!mantissa.empty () && (mantissa[0] == '-' || mantissa[0] == '+')) {
        sign = (mantissa[0] == '-') ? "-" : "";
        mantissa = mantissa.substr (1);
    }
    int pointAt = static_cast<int> (mantissa.size ());
    const std::size_t dot = mantissa.find ('.');
    if (dot != std::string::npos) {
        pointAt = static_cast<int> (dot);
        mantissa.erase (dot, 1);
    }
    const int target = pointAt + exponent;
    const int length = static_cast<int> (mantissa.size ());
    if (target <= 0) {
        return sign + "0." + std::string (static_cast<std::size_t> (-target), '0') + mantissa;
    }
    if (target >= length) {
        return sign + mantissa + std::string (static_cast<std::size_t> (target - length), '0');
    }
    return sign + mantissa.substr (0, static_cast<std::size_t> (target))
         + "." + mantissa.substr (static_cast<std::size_t> (target));
}

// ---------------------------------------------------------------------------
// precisionFromText / truncateToString
// ---------------------------------------------------------------------------

int precisionFromText (const std::string& value) {
    if (value.find ('e') != std::string::npos || value.find ('E') != std::string::npos) {
        const std::size_t at = value.find_first_of ("eE");
        try {
            return -std::stoi (value.substr (at + 1));
        } catch (const std::exception&) {
            return 0;
        }
    }
    int dot = -1;
    int secondDot = -1;
    int lastNonZero = -1;
    for (int i = 0; i < static_cast<int> (value.size ()); i++) {
        const char c = value[static_cast<std::size_t> (i)];
        if (c != '0') {
            lastNonZero = i;
            if (c == '.') {
                if (dot < 0) {
                    dot = i;
                } else if (secondDot < 0) {
                    secondDot = i;
                }
            }
        }
    }
    if (dot < 0) {
        return 0;
    }
    return ((secondDot < 0) ? (lastNonZero + 1) : secondDot) - dot - 1;
}

std::string truncateToString (const std::any& value, int precision) {
    const std::string text = numberToText (value);
    if (precision > 0) {
        const std::size_t dot = text.find ('.');
        if (dot == std::string::npos) {
            return text;   // the TS regex does not match, so the input comes back as-is
        }
        // keep exactly `precision` fractional digits, and only when at least one more
        // digit follows -- that is what the TS capture group requires to match at all
        if (text.size () <= dot + 1 + static_cast<std::size_t> (precision)) {
            return text;
        }
        return text.substr (0, dot + 1 + static_cast<std::size_t> (precision));
    }
    // precision 0: TS does parseInt(num).toString(), i.e. drop the fraction entirely
    const std::size_t dot = text.find ('.');
    const std::string whole = (dot == std::string::npos) ? text : text.substr (0, dot);
    if (whole.empty () || whole == "-") {
        return "0";
    }
    try {
        return std::to_string (std::stoll (whole));
    } catch (const std::exception&) {
        return whole;
    }
}

// ---------------------------------------------------------------------------
// decimalToPrecision
// ---------------------------------------------------------------------------

std::string decimalToPrecisionText (const std::any& xValue, int roundingMode,
                                    const std::any& numPrecisionDigitsValue,
                                    int countingMode, int paddingMode) {
    if (!numPrecisionDigitsValue.has_value ()) {
        throw BaseError ("numPrecisionDigits should not be undefined");
    }
    const double numPrecisionDigits = toNumber (numPrecisionDigitsValue);
    if (!std::isfinite (numPrecisionDigits)) {
        throw BaseError ("numPrecisionDigits has an invalid number");
    }
    if (countingMode == MODE_TICK_SIZE) {
        if (!(numPrecisionDigits > 0)) {
            throw BaseError ("negative or zero numPrecisionDigits can not be used with TICK_SIZE precisionMode");
        }
    } else if (numPrecisionDigits != std::floor (numPrecisionDigits)) {
        throw BaseError ("numPrecisionDigits must be an integer with DECIMAL_PLACES or SIGNIFICANT_DIGITS precisionMode");
    }
    if ((roundingMode != MODE_ROUND) && (roundingMode != MODE_TRUNCATE)) {
        throw BaseError ("invalid roundingMode provided");
    }
    if ((countingMode != MODE_DECIMAL_PLACES) && (countingMode != MODE_SIGNIFICANT_DIGITS)
        && (countingMode != MODE_TICK_SIZE)) {
        throw BaseError ("invalid countingMode provided");
    }
    if ((paddingMode != MODE_NO_PADDING) && (paddingMode != MODE_PAD_WITH_ZERO)) {
        throw BaseError ("invalid paddingMode provided");
    }

    // -- negative precision: round or truncate to a power of ten ----------------------
    if (numPrecisionDigits < 0) {
        const double toNearest = std::pow (10.0, -numPrecisionDigits);
        if (roundingMode == MODE_ROUND) {
            const std::string inner = decimalToPrecisionText (
                std::any (toNumber (xValue) / toNearest), roundingMode, std::any (0),
                countingMode, paddingMode);
            double parsed = 0.0;
            try {
                parsed = std::stod (inner);
            } catch (const std::exception&) {
                parsed = 0.0;
            }
            return numberToText (std::any (toNearest * parsed));
        }
        const double x = toNumber (xValue);
        return numberToText (std::any (x - std::fmod (x, toNearest)));
    }

    // -- tick size --------------------------------------------------------------------
    if (countingMode == MODE_TICK_SIZE) {
        const std::string precisionDigitsString = decimalToPrecisionText (
            std::any (numPrecisionDigits), MODE_ROUND, std::any (22),
            MODE_DECIMAL_PLACES, MODE_NO_PADDING);
        const int newNumPrecisionDigits = precisionFromText (precisionDigitsString);
        if (roundingMode == MODE_TRUNCATE) {
            // truncate the decimal string FIRST: a float artefact in the low digits
            // would otherwise push the value onto the wrong tick
            const std::string truncated = truncateToString (
                xValue, std::max (0, newNumPrecisionDigits));
            double xNum = 0.0;
            try {
                xNum = std::stod (truncated);
            } catch (const std::exception&) {
                xNum = 0.0;
            }
            const double scale = std::pow (10.0, newNumPrecisionDigits);
            const double xScaled = std::round (xNum * scale);
            const double tickScaled = std::round (numPrecisionDigits * scale);
            const double ticks = std::trunc (xScaled / tickScaled);
            const double x = (ticks * tickScaled) / scale;
            if (paddingMode == MODE_NO_PADDING) {
                char buffer[64];
                std::snprintf (buffer, sizeof (buffer), "%.*f",
                               std::max (0, newNumPrecisionDigits), x);
                // TS wraps this in String(Number(...)), which drops trailing zeros
                double reparsed = x;
                try {
                    reparsed = std::stod (buffer);
                } catch (const std::exception&) {
                    reparsed = x;
                }
                return numberToText (std::any (reparsed));
            }
            return decimalToPrecisionText (std::any (x), MODE_ROUND,
                                           std::any (newNumPrecisionDigits),
                                           MODE_DECIMAL_PLACES, paddingMode);
        }
        double x = toNumber (xValue);
        double missing = std::fmod (x, numPrecisionDigits);
        const std::string missingText = decimalToPrecisionText (
            std::any (missing), MODE_ROUND, std::any (8), MODE_DECIMAL_PLACES, MODE_NO_PADDING);
        try {
            missing = std::stod (missingText);
        } catch (const std::exception&) {
            missing = 0.0;
        }
        const std::string fpError = decimalToPrecisionText (
            std::any (missing / numPrecisionDigits), MODE_ROUND,
            std::any (std::max (newNumPrecisionDigits, 8)), MODE_DECIMAL_PLACES, MODE_NO_PADDING);
        if (precisionFromText (fpError) != 0) {
            if (x > 0) {
                x = (missing >= numPrecisionDigits / 2)
                    ? (x - missing + numPrecisionDigits)
                    : (x - missing);
            } else {
                x = (missing >= numPrecisionDigits / 2)
                    ? (x - missing)
                    : (x - missing - numPrecisionDigits);
            }
        }
        return decimalToPrecisionText (std::any (x), MODE_ROUND,
                                       std::any (newNumPrecisionDigits),
                                       MODE_DECIMAL_PLACES, paddingMode);
    }

    // -- the digit-buffer algorithm ---------------------------------------------------
    const std::string text = numberToText (xValue);
    const int digits = static_cast<int> (numPrecisionDigits);
    const bool isNegative = !text.empty () && (text[0] == '-');
    const int strStart = isNegative ? 1 : 0;
    const int strEnd = static_cast<int> (text.size ());

    int strDot = 0;
    for (; strDot < strEnd; strDot++) {
        if (text[static_cast<std::size_t> (strDot)] == '.') {
            break;
        }
    }
    const bool hasDot = strDot < strEnd;

    constexpr unsigned char DOT  = 46;
    constexpr unsigned char ZERO = 48;
    constexpr unsigned char ONE  = ZERO + 1;
    constexpr unsigned char FIVE = ZERO + 5;
    constexpr unsigned char NINE = ZERO + 9;

    // one leading slot is reserved so a carry out of the top digit (099 -> 100) has
    // somewhere to land
    std::vector<unsigned char> chars (
        static_cast<std::size_t> (std::max (1, (strEnd - strStart) + (hasDot ? 0 : 1))), 0);
    chars[0] = ZERO;

    int afterDot = static_cast<int> (chars.size ());
    int digitsStart = -1;
    int digitsEnd = -1;
    for (int i = 1, j = strStart; j < strEnd; j++, i++) {
        const unsigned char c = static_cast<unsigned char> (text[static_cast<std::size_t> (j)]);
        if (c == DOT) {
            afterDot = i--;
        } else if ((c < ZERO) || (c > NINE)) {
            throw BaseError (text + ": invalid number (contains an illegal character)");
        } else {
            chars[static_cast<std::size_t> (i)] = c;
            if ((c != ZERO) && (digitsStart < 0)) {
                digitsStart = i;
            }
        }
    }
    if (digitsStart < 0) {
        digitsStart = 1;
    }

    int precisionStart = (countingMode == MODE_DECIMAL_PLACES) ? afterDot : digitsStart;
    int precisionEnd = precisionStart + digits;

    digitsEnd = -1;
    bool allZeros = true;
    bool signNeeded = isNegative;
    for (int i = static_cast<int> (chars.size ()) - 1, memo = 0; i >= 0; i--) {
        int c = chars[static_cast<std::size_t> (i)];
        if (i != 0) {
            c += memo;
            if (i >= (precisionStart + digits)) {
                // `!(c == FIVE && memo)` is what stops 1.45 rounding to 2: a five that
                // only became a five because of a carry must not itself round up
                const bool ceil = (roundingMode == MODE_ROUND) && (c >= FIVE)
                                  && !((c == FIVE) && memo);
                c = ceil ? (NINE + 1) : ZERO;
            }
            if (c > NINE) {
                c = ZERO;
                memo = 1;
            } else {
                memo = 0;
            }
        } else if (memo) {
            c = ONE;
        }
        chars[static_cast<std::size_t> (i)] = static_cast<unsigned char> (c);
        if (c != ZERO) {
            allZeros = false;
            digitsStart = i;
            digitsEnd = (digitsEnd < 0) ? (i + 1) : digitsEnd;
        }
    }

    if (countingMode == MODE_SIGNIFICANT_DIGITS) {
        precisionStart = digitsStart;
        precisionEnd = precisionStart + digits;
    }
    if (allZeros) {
        signNeeded = false;
    }

    const int readStart = ((digitsStart >= afterDot) || allZeros) ? (afterDot - 1) : digitsStart;
    const int readEnd = (digitsEnd < afterDot) ? afterDot : digitsEnd;

    const int nSign = signNeeded ? 1 : 0;
    const int nBeforeDot = nSign + (afterDot - readStart);
    const int nAfterDot = std::max (readEnd - afterDot, 0);
    const int actualLength = readEnd - readStart;
    const int desiredLength = (paddingMode == MODE_NO_PADDING)
        ? actualLength
        : (precisionEnd - readStart);
    const int pad = std::max (desiredLength - actualLength, 0);
    const int padStart = nBeforeDot + 1 + nAfterDot;
    const int padEnd = padStart + pad;
    const bool isInteger = (nAfterDot + pad) == 0;

    const int limit = static_cast<int> (chars.size ());
    std::string out = signNeeded ? "-" : "";
    for (int i = nSign, j = readStart; i < nBeforeDot; i++, j++) {
        if (j >= 0 && j < limit) {
            out += static_cast<char> (chars[static_cast<std::size_t> (j)]);
        }
    }
    if (!isInteger) {
        out += '.';
    }
    for (int i = nBeforeDot + 1, j = afterDot; i < padStart; i++, j++) {
        if (j >= 0 && j < limit) {
            out += static_cast<char> (chars[static_cast<std::size_t> (j)]);
        }
    }
    for (int i = padStart; i < padEnd; i++) {
        out += '0';
    }
    return out;
}

} // namespace ccxt
