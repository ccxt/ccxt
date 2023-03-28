using System.Text;
using System.Security.Cryptography;
using System.Globalization;
using System.Linq;

namespace Main;


public partial class Exchange
{
    // first Precise implementation check this later

    public class Precise
    {
        public object decimals = null;

        public float integer = 0;

        public long baseNumber = 10;

        public Precise(object number2, int decimals = -1)
        {
            var number = number2.ToString();
            if (decimals == -1)
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
                this.decimals = (decimalIndex > -1) ? number.Length - decimalIndex - 1 : 0;
                var integerString = number.Replace(".", "");
                this.integer = long.Parse(integerString);
                this.decimals = (int)this.decimals - modified;
            }
            else
            {
                this.integer = float.Parse(number);
                this.decimals = decimals;
            }

        }

        public Precise mul(Precise other)
        {
            var integer = (long)this.integer * (long)other.integer;
            var decimals = (int)this.decimals + (int)other.decimals;
            return new Precise(integer.ToString(), decimals);
        }

        public Precise div(Precise other, int precision = 18)
        {
            var distance = precision - (int)this.decimals + (int)other.decimals;
            object numerator = null;
            if (distance == 0)
            {
                numerator = this.integer;
            }
            else if (distance < 0)
            {
                var exponent = Math.Pow((double)baseNumber, -distance);
                numerator = this.integer / exponent;
            }
            else
            {
                var exponent = Math.Pow((double)baseNumber, distance);
                numerator = this.integer * exponent;
            }
            var result = (double)numerator / (double)other.integer;
            return new Precise(result.ToString(), precision);
        }

        public Precise add(Precise other)
        {
            if (this.decimals == other.decimals)
            {
                var integerResult = (long)this.integer + (long)other.integer;
                return new Precise(integerResult.ToString(), (int)this.decimals);
            }
            else
            {
                Precise smaller = null;
                Precise bigger = null;
                if ((int)this.decimals < (int)other.decimals)
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
                var normalized = (int)smaller.integer * Math.Pow((double)baseNumber, exponent);
                var result = normalized + (int)bigger.integer;
                return new Precise(result.ToString(), (int)bigger.decimals);
            }
        }

        public Precise mod(Precise other)
        {
            var rationizerNumerator = Math.Max(-(int)this.decimals + (int)other.decimals, 0);
            var numerator = this.integer * Math.Pow((double)this.baseNumber, rationizerNumerator);
            var rationizerDenominator = Math.Max(-(int)this.decimals + (int)other.decimals, 0);
            var denominator = (int)other.integer * Math.Pow((double)this.baseNumber, rationizerDenominator);
            var result = numerator % denominator;
            return new Precise(result.ToString(), rationizerDenominator + (int)other.decimals);
        }

        public Precise sub(Precise other)
        {
            var negative = new Precise((-(int)other.integer).ToString(), (int)other.decimals);
            return this.add(negative);
        }

        public Precise neg()
        {
            return new Precise((-this.integer).ToString(), (int)this.decimals);
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
            return (int)sum.integer > 0;
        }

        public bool ge(Precise other)
        {
            var sum = this.sub(other);
            return (int)sum.integer >= 0;
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
            return new Precise(result.ToString(), (int)this.decimals);
        }

        public Precise reduce()
        {

            // var str = this.integer.ToString(); // converting to scientific notation which is a problem
            var str = this.integer.ToString("F99").TrimEnd('0').TrimEnd(','); // is this valid?
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
            for (i = start; i > 0; i--)
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
            this.decimals = (int)this.decimals - difference;
            this.integer = long.Parse(str.Substring(0, i + 1));
            return this;
        }

        public bool equals(Precise other)
        {
            this.reduce();
            other.reduce();
            return this.integer == other.integer && this.decimals == other.decimals;
        }

        public override string ToString()
        {
            this.reduce();
            var sign = "";
            float abs = 0;
            if (this.integer < 0)
            {
                sign = "-";
                abs = -this.integer;
            }
            else
            {
                abs = this.integer;
            }
            var absParsed = abs.ToString("F99").TrimEnd('0').TrimEnd(',');
            var integerArray = absParsed.PadLeft((int)this.decimals, '0').ToString().ToList().Select(x => x.ToString()).ToList();
            var index = integerArray.Count - (int)this.decimals;
            var item = "";
            if (index == 0)
            {
                item = "0.";
            }
            else if ((int)this.decimals < 0)
            {
                item = string.Concat(Enumerable.Repeat("0", -(int)this.decimals));
            }
            else if ((int)this.decimals == 0)
            {
                item = "";
            }
            else
            {
                item = ".";
            }
            integerArray.Insert(index, item);
            return sign + string.Join("", integerArray);
        }


        static public string stringMul(object string1, object string2)
        {
            if (string1 == null || string2 == null)
                return null;
            return (new Precise(string1.ToString()).mul(new Precise(string2.ToString()))).ToString();
        }

        static public string stringDiv(object string1, object string2, object c = null)
        {
            if (string1 == null || string2 == null)
                return null;

            var string2Precise = new Precise(string2.ToString());
            if ((int)string2Precise.integer == 0)
            {
                return null;
            }
            var stringDiv = (new Precise(string1.ToString())).div(string2Precise);
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
            if (a == null)
                return (string)b;
            if (b == null)

                if (stringGt(a, b))
                {
                    return (string)a;
                }
            return (string)b;
        }

        static public string stringEquals(object a, object b)
        {
            if (a == null || b == null)
                return null;
            return (new Precise(a.ToString()).equals(new Precise(b.ToString()))).ToString();
        }

        static public string stringMin(object string1, object string2)
        {
            if (string1 == null || string2 == null)
                return null;
            return (new Precise(string1.ToString()).min(new Precise(string2.ToString()))).ToString();
        }

        static public bool stringLt(object a, object b)
        {
            var first = float.Parse((string)a, CultureInfo.InvariantCulture);
            var second = float.Parse((string)b, CultureInfo.InvariantCulture);
            return first < second;
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

    }

}