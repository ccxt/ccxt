using System.Numerics;

namespace ccxt
{


    public class Precise
    {
        public object decimals { get; set; } = -1;

        public BigInteger integer { get; set; } = 0;

        public long baseNumber { get; set; } = 10;

        // static bounded lookup table for 10^n, n in [0, 128] — mirrors the TS
        // implementation; never invalidated, uniform O(1) cost for any input
        // (falls back to exponentiation for exponents beyond the table)
        private static readonly BigInteger[] powersOfTen = BuildPowersOfTen();

        private static BigInteger[] BuildPowersOfTen()
        {
            var powers = new BigInteger[129];
            powers[0] = 1;
            for (var i = 1; i <= 128; i++)
            {
                powers[i] = powers[i - 1] * 10;
            }
            return powers;
        }

        // returns 10 raised to the given non-negative exponent, from the static
        // bounded lookup table with an exponentiation fallback past its end
        private static BigInteger powerOfTen(int exponent)
        {
            return (exponent < powersOfTen.Length) ? powersOfTen[exponent] : BigInteger.Pow(10, exponent);
        }

        // fast internal constructor used by the arithmetic methods — accepts the
        // already-computed integer directly, avoiding a ToString/Parse round-trip
        // per operation (the public object constructor keeps its exact signature)
        internal Precise(BigInteger number, int dec)
        {
            this.integer = number;
            this.decimals = dec;
        }

        public Precise(object number2, object dec2 = null)
        {
            var dec = (dec2 != null) ? Convert.ToInt32(dec2) : Int32.MinValue;
            var number = number2.ToString();
            if (dec == Int32.MinValue)
            {
                var modified = 0;
                // scientific notation is rare — only locate an exponent marker
                // when one is present, instead of lowercasing every input
                var str = number;
                var eIndex = str.IndexOf('e');
                if (eIndex < 0)
                {
                    eIndex = str.IndexOf('E');
                }
                if (eIndex > -1)
                {
                    modified = int.Parse(str.Substring(eIndex + 1));
                    str = str.Substring(0, eIndex);
                }
                var decimalIndex = str.IndexOf('.');
                if (decimalIndex > -1)
                {
                    this.decimals = str.Length - decimalIndex - 1 - modified;
                    this.integer = BigInteger.Parse(str.Substring(0, decimalIndex) + str.Substring(decimalIndex + 1));
                }
                else
                {
                    this.decimals = -modified;
                    this.integer = BigInteger.Parse(str);
                }
            }
            else
            {
                this.integer = BigInteger.Parse(number);
                this.decimals = dec;
            }
        }

        public Precise mul(Precise other)
        {
            var integer = this.integer * other.integer;
            var decimals = Convert.ToInt32(this.decimals) + Convert.ToInt32(other.decimals);
            return new Precise(integer, decimals);
        }

        public Precise div(Precise other, object precision2 = null)
        {
            var precision = (precision2 != null) ? Convert.ToInt32(precision2) : 18;
            var distance = precision - Convert.ToInt32(this.decimals) + Convert.ToInt32(other.decimals);
            BigInteger numerator;
            if (distance == 0)
            {
                numerator = this.integer;
            }
            else if (distance < 0)
            {
                numerator = this.integer / powerOfTen(-distance);
            }
            else
            {
                numerator = this.integer * powerOfTen(distance);
            }
            var result = numerator / other.integer;
            return new Precise(result, precision);
        }

        public Precise add(Precise other)
        {
            var thisDecimals = Convert.ToInt32(this.decimals);
            var otherDecimals = Convert.ToInt32(other.decimals);
            if (thisDecimals == otherDecimals)
            {
                return new Precise(this.integer + other.integer, thisDecimals);
            }
            if (thisDecimals > otherDecimals)
            {
                var scaledOther = other.integer * powerOfTen(thisDecimals - otherDecimals);
                return new Precise(scaledOther + this.integer, thisDecimals);
            }
            var scaledThis = this.integer * powerOfTen(otherDecimals - thisDecimals);
            return new Precise(scaledThis + other.integer, otherDecimals);
        }

        public Precise mod(Precise other)
        {
            var thisDecimals = Convert.ToInt32(this.decimals);
            var otherDecimals = Convert.ToInt32(other.decimals);
            var rationizerNumerator = Math.Max(otherDecimals - thisDecimals, 0);
            var numerator = this.integer * powerOfTen(rationizerNumerator);
            var rationizerDenominator = Math.Max(thisDecimals - otherDecimals, 0);
            var denominator = other.integer * powerOfTen(rationizerDenominator);
            var result = BigInteger.Remainder(numerator, denominator);
            return new Precise(result, rationizerDenominator + otherDecimals);
        }

        public Precise sub(Precise other)
        {
            var thisDecimals = Convert.ToInt32(this.decimals);
            var otherDecimals = Convert.ToInt32(other.decimals);
            if (thisDecimals == otherDecimals)
            {
                return new Precise(this.integer - other.integer, thisDecimals);
            }
            // inline of add (this, neg (other)) without the intermediate instance
            if (thisDecimals > otherDecimals)
            {
                var scaledOther = other.integer * powerOfTen(thisDecimals - otherDecimals);
                return new Precise(this.integer - scaledOther, thisDecimals);
            }
            var scaledThis = this.integer * powerOfTen(otherDecimals - thisDecimals);
            return new Precise(scaledThis - other.integer, otherDecimals);
        }

        public Precise or(Precise other)
        {
            var integer = this.integer | other.integer;
            var decimals = Convert.ToInt32(this.decimals) + Convert.ToInt32(other.decimals);
            return new Precise(integer, decimals);
        }

        public Precise neg()
        {
            return new Precise(BigInteger.Negate(this.integer), Convert.ToInt32(this.decimals));
        }

        public Precise min(Precise other)
        {
            return this.lt(other) ? this : other;
        }

        public Precise max(Precise other)
        {
            return this.gt(other) ? this : other;
        }

        // aligned comparison without intermediate instance allocation:
        // aligns the operand with fewer decimals by multiplying its integer
        // by 10^difference, then compares the scaled integers
        public int compare(Precise other)
        {
            var thisDecimals = Convert.ToInt32(this.decimals);
            var otherDecimals = Convert.ToInt32(other.decimals);
            if (thisDecimals == otherDecimals)
            {
                if (this.integer == other.integer)
                {
                    return 0;
                }
                return (this.integer < other.integer) ? -1 : 1;
            }
            if (thisDecimals > otherDecimals)
            {
                var scaledOther = other.integer * powerOfTen(thisDecimals - otherDecimals);
                if (this.integer == scaledOther)
                {
                    return 0;
                }
                return (this.integer < scaledOther) ? -1 : 1;
            }
            var scaledThis = this.integer * powerOfTen(otherDecimals - thisDecimals);
            if (scaledThis == other.integer)
            {
                return 0;
            }
            return (scaledThis < other.integer) ? -1 : 1;
        }

        public bool gt(Precise other)
        {
            return this.compare(other) > 0;
        }

        public bool ge(Precise other)
        {
            return this.compare(other) >= 0;
        }

        public bool lt(Precise other)
        {
            return this.compare(other) < 0;
        }

        public bool le(Precise other)
        {
            return this.compare(other) <= 0;
        }

        public Precise abs()
        {
            var result = this.integer < 0 ? BigInteger.Negate(this.integer) : this.integer;
            return new Precise(result, Convert.ToInt32(this.decimals));
        }

        // internal: strips trailing zero digits from the integer representation
        // and returns the reduced digit string (sign included) so callers that
        // immediately stringify avoid a second integer-to-string conversion
        private string reduceDigits()
        {
            var str = this.integer.ToString();
            var start = str.Length - 1;
            if (start == 0)
            {
                if (str == "0")
                {
                    this.decimals = 0;
                }
                return str;
            }
            int i;
            for (i = start; i >= 0; i--)
            {
                if (str[i] != '0')
                {
                    break;
                }
            }
            var difference = start - i;
            if (difference == 0)
            {
                return str;
            }
            this.decimals = Convert.ToInt32(this.decimals) - difference;
            var reduced = str.Substring(0, i + 1);
            this.integer = BigInteger.Parse(reduced);
            return reduced;
        }

        // reduces the representation in place, returns the instance so calls
        // can be chained (precise.reduce().ToString())
        public Precise reduce()
        {
            this.reduceDigits();
            return this;
        }

        public bool equals(Precise other)
        {
            this.reduce();
            other.reduce();
            return this.integer == other.integer && Convert.ToInt32(this.decimals) == Convert.ToInt32(other.decimals);
        }

        public override string ToString()
        {
            var digits = this.reduceDigits();
            var sign = "";
            if (digits[0] == '-')
            {
                sign = "-";
                digits = digits.Substring(1);
            }
            var dec = Convert.ToInt32(this.decimals);
            if (dec <= 0)
            {
                return (dec == 0) ? sign + digits : sign + digits + new string('0', -dec);
            }
            if (digits.Length <= dec)
            {
                return sign + "0." + new string('0', dec - digits.Length) + digits;
            }
            var index = digits.Length - dec;
            return sign + digits.Substring(0, index) + "." + digits.Substring(index);
        }

        static public string stringMul(object string1, object string2)
        {
            if (string1 == null || string2 == null)
                return null;
            return (new Precise(string1.ToString()).mul(new Precise(string2.ToString()))).ToString();
        }

        static public string stringDiv(object string1, object string2, object precision = null)
        {
            if (string1 == null || string2 == null)
                return null;

            var string2Precise = new Precise(string2.ToString());
            if (string2Precise.integer == 0)
            {
                return null;
            }
            var stringDiv = (new Precise(string1.ToString())).div(string2Precise, precision);
            return stringDiv.ToString();
        }

        static public string stringSub(object string1, object string2)
        {
            if (string1 == null || string2 == null)
                return null;
            return (new Precise(string1.ToString()).sub(new Precise(string2.ToString()))).ToString();
        }
        static public string stringAdd(object string1, object string2)
        {
            if (string1 == null || string2 == null)
                return null;

            return (new Precise(string1.ToString()).add(new Precise(string2.ToString()))).ToString();
        }

        static public string stringOr(object string1, object string2)
        {
            if (string1 == null || string2 == null)
                return null;
            return (new Precise(string1.ToString()).or(new Precise(string2.ToString()))).ToString();
        }

        static public bool stringGt(object a, object b)
        {
            if (a == null || b == null)
                return false;
            return (new Precise(a.ToString()).gt(new Precise(b.ToString())));
        }

        static public bool stringEq(object a, object b)
        {
            if (a == null || b == null)
                return false;
            return (new Precise(a.ToString()).equals(new Precise(b.ToString())));
        }

        static public string stringMax(object a, object b)
        {
            if (a == null || b == null)
                return null;
            return (new Precise(a)).max(new Precise(b)).ToString();
        }

        static public bool stringEquals(object a, object b)
        {
            if (a == null || b == null)
                return false;
            return (new Precise(a.ToString()).equals(new Precise(b.ToString())));
        }

        static public string stringMin(object string1, object string2)
        {
            if (string1 == null || string2 == null)
                return null;
            return (new Precise(string1.ToString()).min(new Precise(string2.ToString()))).ToString();
        }

        static public bool stringLt(object a, object b)
        {
            if (a == null || b == null)
                return false;
            return (new Precise(a)).lt(new Precise(b));
        }

        static public string stringAbs(object a)
        {
            if (a == null)
                return null;
            return (new Precise((string)a)).abs().ToString();
        }

        static public string stringNeg(object a)
        {
            if (a == null)
                return null;
            return (new Precise((string)a)).neg().ToString();
        }

        static public bool stringLe(object a, object b)
        {
            if (a == null || b == null)
                return false;
            return (new Precise(a.ToString()).le(new Precise(b.ToString())));
        }

        static public bool stringGe(object a, object b)
        {
            if (a == null || b == null)
                return false;
            return (new Precise(a.ToString()).ge(new Precise(b.ToString())));
        }

        static public string stringMod(object a, object b)
        {
            if (a == null || b == null)
                return null;
            return (new Precise(a)).mod(new Precise(b)).ToString();
        }

    }

}
