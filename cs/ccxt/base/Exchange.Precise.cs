using System.Numerics;

namespace ccxt
{


    public class Precise
    {
        public object decimals { get; set; } = -1;

        public BigInteger integer { get; set; } = 0;

        public long baseNumber { get; set; } = 10;

        public Precise(object number2, object dec2 = null)
        {
            var dec = (dec2 != null) ? Convert.ToInt32(dec2) : Int32.MinValue;
            var number = number2.ToString();
            if (dec == Int32.MinValue)
            {
                var modified = 0;
                var numberLowerCase = ((string)number).ToLower();
                if (numberLowerCase.IndexOf('e') > -1)
                {
                    var parts = numberLowerCase.Split('e');
                    number = parts[0];
                    modified = int.Parse(parts[1]);
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

        public Precise mul(Precise other)
        {
            var integer = this.integer * other.integer;
            var decimals = Convert.ToInt32(this.decimals) + Convert.ToInt32(other.decimals);
            return new Precise(integer.ToString(), decimals);
        }

        public Precise div(Precise other, object precision2 = null)
        {
            precision2 = precision2 ?? 18;
            var precision = Convert.ToInt32(precision2);
            var distance = precision - Convert.ToInt32(this.decimals) + Convert.ToInt32(other.decimals);
            BigInteger numerator = 0;
            if (distance == 0)
            {
                numerator = this.integer;
            }
            else if (distance < 0)
            {
                var exponent = BigInteger.Pow(baseNumber, -distance);
                numerator = this.integer / exponent;
            }
            else
            {
                var exponent = BigInteger.Pow(baseNumber, distance);
                numerator = this.integer * exponent;
            }
            var result = numerator / other.integer;
            return new Precise(result.ToString(), precision);
        }

        public Precise add(Precise other)
        {
            if (this.decimals == other.decimals)
            {
                var integerResult = (long)this.integer + (long)other.integer;
                return new Precise(integerResult.ToString(), Convert.ToInt32(this.decimals));
            }
            else
            {
                Precise smaller = null;
                Precise bigger = null;
                if (Convert.ToInt32(this.decimals) < Convert.ToInt32(other.decimals))
                {
                    smaller = this;
                    bigger = other;
                }
                else
                {
                    smaller = other;
                    bigger = this;
                }
                var exponent = (int)bigger.decimals - (int)smaller.decimals;
                var normalized = smaller.integer * new BigInteger(Math.Pow((double)baseNumber, exponent));
                var result = normalized + bigger.integer;
                return new Precise(result.ToString(), (int)bigger.decimals);
            }
        }

        public Precise mod(Precise other)
        {
            var rationizerNumerator = Math.Max(-Convert.ToInt32(this.decimals) + Convert.ToInt32(other.decimals), 0);
            var numerator = this.integer * BigInteger.Pow(this.baseNumber, rationizerNumerator);
            var rationizerDenominator = Math.Max(-Convert.ToInt32(other.decimals) + Convert.ToInt32(this.decimals), 0);
            var denominator = other.integer * BigInteger.Pow(this.baseNumber, rationizerDenominator);
            var result = BigInteger.Remainder(numerator, denominator);
            return new Precise(result.ToString(), rationizerDenominator + Convert.ToInt32(other.decimals));
        }

        public Precise sub(Precise other)
        {
            var negative = new Precise((-other.integer).ToString(), Convert.ToInt32(other.decimals));
            return this.add(negative);
        }

        public Precise neg()
        {
            return new Precise((-this.integer).ToString(), Convert.ToInt32(this.decimals));
        }

        public Precise min(Precise other)
        {
            return this.lt(other) ? this : other;
        }

        public Precise max(Precise other)
        {
            return this.gt(other) ? this : other;
        }

        public bool gt(Precise other)
        {
            var sum = this.sub(other);
            return sum.integer > 0;
        }

        public bool ge(Precise other)
        {
            var sum = this.sub(other);
            return sum.integer >= 0;
        }

        public bool lt(Precise other)
        {
            return other.gt(this);
        }

        public bool le(Precise other)
        {
            return other.ge(this);
        }

        public Precise abs()
        {
            var result = this.integer < 0 ? this.integer * -1 : this.integer;
            return new Precise(result.ToString(), Convert.ToInt32(this.decimals));
        }

        public Precise reduce()
        {
            // var decimalValue = Convert.ToDouble(this.integer, CultureInfo.InvariantCulture);
            // var str = decimalValue.ToString(CultureInfo.InvariantCulture);
            var str = this.integer.ToString();
            var start = str.Length - 1;
            if (start == 0)
            {
                if (str == "0")
                {
                    this.decimals = 0;
                }
                return this;
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
                return this;
            }
            this.decimals = Convert.ToInt32(this.decimals) - difference;
            this.integer = BigInteger.Parse((str.Substring(0, i + 1)));
            return this;
        }

        public bool equals(Precise other)
        {
            this.reduce();
            other.reduce();
            return this.integer == other.integer && Convert.ToInt32(this.decimals) == Convert.ToInt32(other.decimals);
        }

        // public string ToString()
        // {
        //     return this.reduce().ToString();
        // }

        public override string ToString()
        {
            this.reduce();
            var sign = "";
            BigInteger abs = 0;
            if (this.integer < 0)
            {
                sign = "-";
                abs = -this.integer;
            }
            else
            {
                abs = this.integer;
            }
            // var decimalValue = Convert.ToDecimal(abs, CultureInfo.InvariantCulture);
            // var absParsed = decimalValue.ToString(CultureInfo.InvariantCulture);
            var absParsed = abs.ToString();
            var padSize = (Convert.ToInt32(this.decimals) > 0) ? Convert.ToInt32(this.decimals) : 0;
            var integerArray = absParsed.PadLeft(padSize, '0').ToString().ToList().Select(x => x.ToString()).ToList();
            var index = integerArray.Count - Convert.ToInt32(this.decimals);
            var item = "";
            if (index == 0)
            {
                item = "0.";
            }
            else if (Convert.ToInt32(this.decimals) < 0)
            {
                item = string.Concat(Enumerable.Repeat("0", -Convert.ToInt32(this.decimals)));
            }
            else if (Convert.ToInt32(this.decimals) == 0)
            {
                item = "";
            }
            else
            {
                item = ".";
            }
            var arrayIndex = index > integerArray.Count ? integerArray.Count : index;
            integerArray.Insert(arrayIndex, item);
            return sign + string.Join("", integerArray);
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
            if (string1 == null && string2 == null)
                return null;
            if (string1 == null)
                return string2.ToString();
            if (string2 == null)
                return string1.ToString();

            return (new Precise(string1.ToString()).add(new Precise(string2.ToString()))).ToString();
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