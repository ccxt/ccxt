#pragma once

// Arbitrary-precision decimal arithmetic on strings.
//
// ccxt does money arithmetic through Precise rather than doubles, because a double
// cannot hold an exchange's amounts and prices exactly. The generated code calls the
// static string* entry points; the instance representation is
// sign * digits * 10^-decimals with `digits` an unbounded decimal integer.

#include "helpers.h"

#include <algorithm>
#include <any>
#include <cctype>
#include <string>
#include <vector>

namespace ccxt {

class Precise {
public:
    // -- unsigned decimal-string primitives ----------------------------------------

    static std::string stripLeadingZeros (const std::string& digits) {
        std::size_t at = 0;
        while (at + 1 < digits.size () && digits[at] == '0') {
            at++;
        }
        return digits.substr (at);
    }

    static int compareDigits (const std::string& a, const std::string& b) {
        const std::string left = stripLeadingZeros (a);
        const std::string right = stripLeadingZeros (b);
        if (left.size () != right.size ()) {
            return (left.size () < right.size ()) ? -1 : 1;
        }
        if (left == right) {
            return 0;
        }
        return (left < right) ? -1 : 1;
    }

    static std::string addDigits (const std::string& a, const std::string& b) {
        std::string out;
        int carry = 0;
        long i = static_cast<long> (a.size ()) - 1;
        long j = static_cast<long> (b.size ()) - 1;
        while (i >= 0 || j >= 0 || carry) {
            const int left  = (i >= 0) ? a[static_cast<std::size_t> (i)] - '0' : 0;
            const int right = (j >= 0) ? b[static_cast<std::size_t> (j)] - '0' : 0;
            const int sum = left + right + carry;
            out += static_cast<char> ('0' + (sum % 10));
            carry = sum / 10;
            i--;
            j--;
        }
        std::reverse (out.begin (), out.end ());
        return stripLeadingZeros (out);
    }

    // requires a >= b
    static std::string subtractDigits (const std::string& a, const std::string& b) {
        std::string out;
        int borrow = 0;
        long i = static_cast<long> (a.size ()) - 1;
        long j = static_cast<long> (b.size ()) - 1;
        while (i >= 0) {
            const int left  = a[static_cast<std::size_t> (i)] - '0' - borrow;
            const int right = (j >= 0) ? b[static_cast<std::size_t> (j)] - '0' : 0;
            int diff = left - right;
            borrow = 0;
            if (diff < 0) {
                diff += 10;
                borrow = 1;
            }
            out += static_cast<char> ('0' + diff);
            i--;
            j--;
        }
        std::reverse (out.begin (), out.end ());
        return stripLeadingZeros (out);
    }

    static std::string multiplyDigits (const std::string& a, const std::string& b) {
        if (stripLeadingZeros (a) == "0" || stripLeadingZeros (b) == "0") {
            return "0";
        }
        std::vector<int> product (a.size () + b.size (), 0);
        for (long i = static_cast<long> (a.size ()) - 1; i >= 0; i--) {
            for (long j = static_cast<long> (b.size ()) - 1; j >= 0; j--) {
                const int mul = (a[static_cast<std::size_t> (i)] - '0') * (b[static_cast<std::size_t> (j)] - '0');
                const std::size_t low = static_cast<std::size_t> (i + j + 1);
                const int sum = mul + product[low];
                product[low] = sum % 10;
                product[low - 1] += sum / 10;
            }
        }
        std::string out;
        for (int digit : product) {
            out += static_cast<char> ('0' + digit);
        }
        return stripLeadingZeros (out);
    }

    // long division; returns the quotient and leaves the remainder in `remainder`
    static std::string divideDigits (const std::string& a, const std::string& b, std::string& remainder) {
        std::string quotient;
        std::string current = "0";
        for (char c : a) {
            current = stripLeadingZeros (current + std::string (1, c));
            int count = 0;
            while (compareDigits (current, b) >= 0) {
                current = subtractDigits (current, b);
                count++;
            }
            quotient += static_cast<char> ('0' + count);
        }
        remainder = current;
        return stripLeadingZeros (quotient);
    }

    // -- parsing and formatting -----------------------------------------------------

    bool negative = false;
    std::string digits = "0";   // unsigned integer
    int decimals = 0;           // value = digits * 10^-decimals

    Precise () = default;

    // generated code writes `Precise(add(a, b))`, and every value there is a std::any
    explicit Precise (const std::any& input)
        : Precise (input.has_value () ? std::any_cast<std::string> (::toString (input))
                                      : std::string ()) {}

    explicit Precise (const std::string& input) {
        std::string text = input;
        // strip whitespace so values straight off the wire parse
        text.erase (std::remove_if (text.begin (), text.end (),
                                    [] (unsigned char c) { return std::isspace (c) != 0; }),
                    text.end ());
        if (text.empty ()) {
            return;
        }
        if (text[0] == '-') {
            this->negative = true;
            text = text.substr (1);
        } else if (text[0] == '+') {
            text = text.substr (1);
        }
        // scientific notation appears in exchange payloads often enough to matter
        int exponent = 0;
        const std::size_t e = text.find_first_of ("eE");
        if (e != std::string::npos) {
            try {
                exponent = std::stoi (text.substr (e + 1));
            } catch (const std::exception&) {
                exponent = 0;
            }
            text = text.substr (0, e);
        }
        const std::size_t dot = text.find ('.');
        if (dot == std::string::npos) {
            this->digits = text.empty () ? "0" : text;
            this->decimals = 0;
        } else {
            const std::string fraction = text.substr (dot + 1);
            this->digits = text.substr (0, dot) + fraction;
            this->decimals = static_cast<int> (fraction.size ());
        }
        if (this->digits.empty ()) {
            this->digits = "0";
        }
        this->decimals -= exponent;
        if (this->decimals < 0) {
            this->digits += std::string (static_cast<std::size_t> (-this->decimals), '0');
            this->decimals = 0;
        }
        this->digits = stripLeadingZeros (this->digits);
        this->reduce ();
    }

    bool isZero () const { return stripLeadingZeros (this->digits) == "0"; }

    // drop trailing fractional zeros so 1.50 and 1.5 compare and print alike
    void reduce () {
        while (this->decimals > 0 && this->digits.size () > 1 && this->digits.back () == '0') {
            this->digits.pop_back ();
            this->decimals--;
        }
        if (this->isZero ()) {
            this->negative = false;
            this->digits = "0";
            this->decimals = 0;
        }
    }

    std::string toString () const {
        std::string out = this->digits;
        if (this->decimals > 0) {
            while (out.size () <= static_cast<std::size_t> (this->decimals)) {
                out = "0" + out;
            }
            out.insert (out.size () - static_cast<std::size_t> (this->decimals), ".");
        } else if (this->decimals < 0) {
            // value = digits * 10^-decimals, so a negative `decimals` scales UP. The
            // constructor normalises this away, but divText sets decimals straight
            // from a caller-supplied precision, which ccxt does pass negative:
            // divText('69696900000', '1e8', -1) is '690', not '69'.
            out += std::string (static_cast<std::size_t> (-this->decimals), '0');
        }
        return (this->negative && !this->isZero ()) ? "-" + out : out;
    }

    // scale both operands to a common number of decimals
    static void align (Precise& a, Precise& b) {
        while (a.decimals < b.decimals) {
            a.digits += "0";
            a.decimals++;
        }
        while (b.decimals < a.decimals) {
            b.digits += "0";
            b.decimals++;
        }
    }

private:

    // -- the string-level engine ------------------------------------------------------
    //
    // PRIVATE on purpose. Generated code writes `Precise::divText(std::string("1"),
    // std::string("0"))`, and a public std::string overload would be an exact match and
    // win over the std::any one -- returning "" where ccxt means undefined, because a
    // std::string cannot represent absence. Hiding these forces every outside call
    // through the std::any API below, which can.

    static std::string addText (const std::string& x, const std::string& y) {
        Precise a (x);
        Precise b (y);
        align (a, b);
        Precise out;
        out.decimals = a.decimals;
        if (a.negative == b.negative) {
            out.digits = addDigits (a.digits, b.digits);
            out.negative = a.negative;
        } else if (compareDigits (a.digits, b.digits) >= 0) {
            out.digits = subtractDigits (a.digits, b.digits);
            out.negative = a.negative;
        } else {
            out.digits = subtractDigits (b.digits, a.digits);
            out.negative = b.negative;
        }
        out.reduce ();
        return out.toString ();
    }

    static std::string subText (const std::string& x, const std::string& y) {
        Precise b (y);
        b.negative = !b.negative;
        return addText (x, b.toString ());
    }

    static std::string mulText (const std::string& x, const std::string& y) {
        const Precise a (x);
        const Precise b (y);
        Precise out;
        out.digits = multiplyDigits (a.digits, b.digits);
        out.decimals = a.decimals + b.decimals;
        out.negative = (a.negative != b.negative);
        out.reduce ();
        return out.toString ();
    }

    // ccxt's default precision for division is 18 decimal places
    static std::string divText (const std::string& x, const std::string& y, int precision = 18) {
        const Precise a (x);
        const Precise b (y);
        if (b.isZero ()) {
            return std::string ();   // ccxt returns undefined for division by zero
        }
        // scale the numerator so the quotient carries `precision` decimals
        const int shift = precision + b.decimals - a.decimals;
        std::string numerator = a.digits;
        std::string denominator = b.digits;
        if (shift >= 0) {
            numerator += std::string (static_cast<std::size_t> (shift), '0');
        } else {
            denominator += std::string (static_cast<std::size_t> (-shift), '0');
        }
        std::string remainder;
        Precise out;
        out.digits = divideDigits (numerator, denominator, remainder);
        out.decimals = precision;
        out.negative = (a.negative != b.negative);
        out.reduce ();
        return out.toString ();
    }

    static int compare (const std::string& x, const std::string& y) {
        Precise a (x);
        Precise b (y);
        if (a.isZero () && b.isZero ()) {
            return 0;
        }
        if (a.negative != b.negative) {
            return a.negative ? -1 : 1;
        }
        align (a, b);
        const int sign = compareDigits (a.digits, b.digits);
        return a.negative ? -sign : sign;
    }

    static bool gtText (const std::string& x, const std::string& y) { return compare (x, y) > 0; }
    static bool geText (const std::string& x, const std::string& y) { return compare (x, y) >= 0; }
    static bool ltText (const std::string& x, const std::string& y) { return compare (x, y) < 0; }
    static bool leText (const std::string& x, const std::string& y) { return compare (x, y) <= 0; }
    static bool equalsText (const std::string& x, const std::string& y) { return compare (x, y) == 0; }
    static bool eqText (const std::string& x, const std::string& y) { return compare (x, y) == 0; }

    static std::string absText (const std::string& x) {
        Precise a (x);
        a.negative = false;
        return a.toString ();
    }

    static std::string negText (const std::string& x) {
        Precise a (x);
        a.negative = !a.negative;
        a.reduce ();
        return a.toString ();
    }

    // TS returns the winning *Precise*, so the result comes back normalised:
    // minText('1.0000', '2') is '1', not '1.0000'. Returning the raw input would
    // leak the caller's formatting into arithmetic that is supposed to be canonical.
    static std::string minText (const std::string& x, const std::string& y) {
        return Precise (ltText (x, y) ? x : y).toString ();
    }

    static std::string maxText (const std::string& x, const std::string& y) {
        return Precise (gtText (x, y) ? x : y).toString ();
    }

    static std::string modText (const std::string& x, const std::string& y) {
        Precise a (x);
        Precise b (y);
        if (b.isZero ()) {
            return std::string ();
        }
        align (a, b);
        std::string remainder;
        divideDigits (a.digits, b.digits, remainder);
        Precise out;
        out.digits = remainder;
        out.decimals = a.decimals;
        out.negative = a.negative;
        out.reduce ();
        return out.toString ();
    }
    // -- bitwise ---------------------------------------------------------------------
    //
    // TS does this as `this.integer | other.integer` on BigInts. The digits here are
    // base 10, so convert to binary, OR, and convert back. Both conversions are O(n^2)
    // in the digit count, which is irrelevant at the magnitudes ccxt deals in and keeps
    // the result exact for arbitrarily long operands.

    static std::vector<bool> digitsToBits (const std::string& digits) {
        std::string value = stripLeadingZeros (digits);
        std::vector<bool> bits;
        while (!(value.size () == 1 && value[0] == '0')) {
            // one long division by two, remainder is the next bit
            std::string quotient;
            int remainder = 0;
            for (char c : value) {
                const int current = remainder * 10 + (c - '0');
                quotient += static_cast<char> ('0' + (current / 2));
                remainder = current % 2;
            }
            bits.push_back (remainder != 0);
            value = stripLeadingZeros (quotient);
        }
        return bits;
    }

    static std::string bitsToDigits (const std::vector<bool>& bits) {
        std::string out = "0";
        for (std::size_t i = bits.size (); i > 0; i--) {
            out = addDigits (out, out);                 // shift left by one
            if (bits[i - 1]) {
                out = addDigits (out, std::string ("1"));
            }
        }
        return out;
    }

    static std::string orDigits (const std::string& a, const std::string& b) {
        const std::vector<bool> left = digitsToBits (a);
        const std::vector<bool> right = digitsToBits (b);
        const std::size_t width = std::max (left.size (), right.size ());
        std::vector<bool> bits (width, false);
        for (std::size_t i = 0; i < width; i++) {
            const bool l = (i < left.size ()) && left[i];
            const bool r = (i < right.size ()) && right[i];
            bits[i] = l || r;
        }
        return bitsToDigits (bits);
    }

public:

// -- std::any overloads ---------------------------------------------------------
    //
    // Every value in generated code is a std::any, so these are what the transpiled
    // call sites actually bind to. `::toString` is qualified because the member
    // toString() above would otherwise hide the global helper.

    static std::string asText (const std::any& v) {
        return v.has_value () ? std::any_cast<std::string> (::toString (v)) : std::string ();
    }

    // Every TS static guards its operands first: the value-returning ones propagate
    // undefined, the comparisons collapse to false. Without this, asText() turns an
    // absent operand into "" and Precise("") reads as 0, so stringMul(undefined, '1')
    // would quietly be '0' instead of undefined -- a wrong number rather than a
    // missing one, which is far worse in an amount or a price.
    static bool anyUndefined (const std::any& x, const std::any& y) {
        return !x.has_value () || !y.has_value ();
    }

    static std::any stringAdd (const std::any& x, const std::any& y) {
        if (anyUndefined (x, y)) return std::any {};
        return std::any (addText (asText (x), asText (y)));
    }
    static std::any stringSub (const std::any& x, const std::any& y) {
        if (anyUndefined (x, y)) return std::any {};
        return std::any (subText (asText (x), asText (y)));
    }
    static std::any stringMul (const std::any& x, const std::any& y) {
        if (anyUndefined (x, y)) return std::any {};
        return std::any (mulText (asText (x), asText (y)));
    }
    static std::any stringDiv (const std::any& x, const std::any& y) {
        if (anyUndefined (x, y)) return std::any {};
        const std::string out = divText (asText (x), asText (y));
        return out.empty () ? std::any {} : std::any (out);
    }
    static std::any stringDiv (const std::any& x, const std::any& y, const std::any& precision) {
        if (anyUndefined (x, y)) return std::any {};
        const int places = precision.has_value () ? static_cast<int> (toLong (precision)) : 18;
        const std::string out = divText (asText (x), asText (y), places);
        return out.empty () ? std::any {} : std::any (out);
    }
    static bool stringGt (const std::any& x, const std::any& y) {
        return anyUndefined (x, y) ? false : gtText (asText (x), asText (y));
    }
    static bool stringGe (const std::any& x, const std::any& y) {
        return anyUndefined (x, y) ? false : geText (asText (x), asText (y));
    }
    static bool stringLt (const std::any& x, const std::any& y) {
        return anyUndefined (x, y) ? false : ltText (asText (x), asText (y));
    }
    static bool stringLe (const std::any& x, const std::any& y) {
        return anyUndefined (x, y) ? false : leText (asText (x), asText (y));
    }
    static bool stringEquals (const std::any& x, const std::any& y) {
        return anyUndefined (x, y) ? false : equalsText (asText (x), asText (y));
    }
    static bool stringEq (const std::any& x, const std::any& y) {
        return anyUndefined (x, y) ? false : eqText (asText (x), asText (y));
    }
    static std::any stringAbs (const std::any& x) {
        if (!x.has_value ()) return std::any {};
        return std::any (absText (asText (x)));
    }
    static std::any stringNeg (const std::any& x) {
        if (!x.has_value ()) return std::any {};
        return std::any (negText (asText (x)));
    }
    static std::any stringMin (const std::any& x, const std::any& y) {
        if (anyUndefined (x, y)) return std::any {};
        return std::any (minText (asText (x), asText (y)));
    }
    static std::any stringMax (const std::any& x, const std::any& y) {
        if (anyUndefined (x, y)) return std::any {};
        return std::any (maxText (asText (x), asText (y)));
    }
    static std::any stringMod (const std::any& x, const std::any& y) {
        if (anyUndefined (x, y)) return std::any {};
        return std::any (modText (asText (x), asText (y)));
    }

    // TS keeps the left operand's `decimals` and never aligns, so a fractional operand
    // is already meaningless there; mirror that by operating on the integer digits.
    static std::any stringOr (const std::any& x, const std::any& y) {
        if (!x.has_value () || !y.has_value ()) {
            return std::any {};
        }
        const Precise a (asText (x));
        const Precise b (asText (y));
        Precise out;
        out.digits = orDigits (a.digits, b.digits);
        out.decimals = a.decimals;
        out.negative = false;
        out.reduce ();
        return std::any (out.toString ());
    }
};

} // namespace ccxt
