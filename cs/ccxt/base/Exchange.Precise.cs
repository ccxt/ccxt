using System.Numerics;

namespace ccxt
{


    public class Precise
    {
        public object decimals { get; set; } = -1;

        public BigInteger integer { get; set; } = 0;

        public long baseNumber { get; set; } = 10;

        // static bounded lookup table for 10^n, n in [0, 128] — every exponent
        // arising from a decimals difference or division precision in practice
        // hits this table; only pathological inputs fall back to BigInteger.Pow
        private static readonly BigInteger[] powersOfTen = BuildPowersOfTen(128);

        private static BigInteger[] BuildPowersOfTen(int max)
        {
            var table = new BigInteger[max + 1];
            table[0] = BigInteger.One;
            for (var i = 1; i <= max; i++)
            {
                table[i] = table[i - 1] * 10;
            }
            return table;
        }

        private static BigInteger powerOfTen(int exponent)
        {
            return (exponent >= 0 && exponent < powersOfTen.Length) ? powersOfTen[exponent] : BigInteger.Pow(10, exponent);
        }

        public Precise(object number2, object dec2 = null)
        {
            var dec = (dec2 != null) ? Convert.ToInt32(dec2) : Int32.MinValue;
            var number = number2.ToString();
            if (dec == Int32.MinValue)
            {
                var modified = 0;
                // scientific notation is rare — only search for/split on an
                // exponent marker when one is present, instead of always
                // lowercasing the whole (potentially large) input string
                var eIndex = number.IndexOf('e');
                if (eIndex == -1)
                {
                    eIndex = number.IndexOf('E');
                }
                if (eIndex > -1)
                {
                    modified = int.Parse(number.Substring(eIndex + 1));
                    number = number.Substring(0, eIndex);
                }
                var decimalIndex = number.IndexOf('.');
                var newDecimals = (decimalIndex > -1) ? number.Length - decimalIndex - 1 : 0;
                this.decimals = newDecimals;
                var integerString = number.Replace(".", "");
                this.integer = BigInteger.Parse(integerString);
                this.decimals = Convert.ToInt32(this.decimals) - modified;
            }
            else
            {
                this.integer = BigInteger.Parse(number);
                this.decimals = dec;
            }
        }

        // fast internal constructor: skips the ToString()/BigInteger.Parse()
        // round-trip the public (object, object) constructor requires, used
        // by every arithmetic method below to build its result
        private Precise(BigInteger integerValue, int decimalsValue)
        {
            this.integer = integerValue;
            this.decimals = decimalsValue;
        }

        public Precise mul(Precise other)
        {
            var integer = this.integer * other.integer;
            var decimals = Convert.ToInt32(this.decimals) + Convert.ToInt32(other.decimals);
            return new Precise(integer, decimals);
        }

        public Precise div(Precise other, object precision2 = null)
        {
            precision2 = precision2 ?? 18;
            var precision = Convert.ToInt32(precision2);
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
            else
            {
                BigInteger smallerInteger;
                BigInteger biggerInteger;
                int smallerDecimals;
                int biggerDecimals;
                if (thisDecimals < otherDecimals)
                {
                    smallerInteger = this.integer;
                    smallerDecimals = thisDecimals;
                    biggerInteger = other.integer;
                    biggerDecimals = otherDecimals;
                }
                else
                {
                    smallerInteger = other.integer;
                    smallerDecimals = otherDecimals;
                    biggerInteger = this.integer;
                    biggerDecimals = thisDecimals;
                }
                var exponent = biggerDecimals - smallerDecimals;
                var normalized = smallerInteger * powerOfTen(exponent);
                var result = normalized + biggerInteger;
                return new Precise(result, biggerDecimals);
            }
        }

        public Precise mod(Precise other)
        {
            var thisDecimals = Convert.ToInt32(this.decimals);
            var otherDecimals = Convert.ToInt32(other.decimals);
            var rationizerNumerator = Math.Max(-thisDecimals + otherDecimals, 0);
            var numerator = this.integer * powerOfTen(rationizerNumerator);
            var rationizerDenominator = Math.Max(-otherDecimals + thisDecimals, 0);
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
            var thisIsBigger = thisDecimals > otherDecimals;
            var smallerInteger = thisIsBigger ? other.integer : this.integer;
            var biggerInteger = thisIsBigger ? this.integer : other.integer;
            var biggerDecimals = thisIsBigger ? thisDecimals : otherDecimals;
            var smallerDecimals = thisIsBigger ? otherDecimals : thisDecimals;
            var normalized = smallerInteger * powerOfTen(biggerDecimals - smallerDecimals);
            var result = thisIsBigger ? (biggerInteger - normalized) : (normalized - biggerInteger);
            return new Precise(result, biggerDecimals);
        }

        public Precise or(Precise other)
        {
            var integer = this.integer | other.integer;
            var decimals = Convert.ToInt32(this.decimals) + Convert.ToInt32(other.decimals);
            return new Precise(integer, decimals);
        }

        public Precise neg()
        {
            return new Precise(-this.integer, Convert.ToInt32(this.decimals));
        }

        public Precise min(Precise other)
        {
            return this.lt(other) ? this : other;
        }

        public Precise max(Precise other)
        {
            return this.gt(other) ? this : other;
        }

        // aligned comparison without an intermediate Precise allocation: aligns
        // the operand with fewer decimals by multiplying its integer by
        // 10^difference, then compares the scaled integers directly
        public int compare(Precise other)
        {
            var thisDecimals = Convert.ToInt32(this.decimals);
            var otherDecimals = Convert.ToInt32(other.decimals);
            if (thisDecimals == otherDecimals)
            {
                return this.integer.CompareTo(other.integer);
            }
            if (thisDecimals > otherDecimals)
            {
                var scaledOther = other.integer * powerOfTen(thisDecimals - otherDecimals);
                return this.integer.CompareTo(scaledOther);
            }
            var scaledThis = this.integer * powerOfTen(otherDecimals - thisDecimals);
            return scaledThis.CompareTo(other.integer);
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
            var result = this.integer < 0 ? -this.integer : this.integer;
            return new Precise(result, Convert.ToInt32(this.decimals));
        }

        // strips trailing zero digits from the integer representation and
        // returns the reduced digit string (sign included), so callers that
        // immediately stringify (ToString ()) avoid a second integer-to-string
        // conversion
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
            var i = 0;
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
            if (digits.Length > 0 && digits[0] == '-')
            {
                sign = "-";
                digits = digits.Substring(1);
            }
            var decimals = Convert.ToInt32(this.decimals);
            if (decimals <= 0)
            {
                return sign + digits + new string('0', -decimals);
            }
            if (digits.Length <= decimals)
            {
                return sign + "0." + digits.PadLeft(decimals, '0');
            }
            var index = digits.Length - decimals;
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

    // }

}