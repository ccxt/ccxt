using System;
using System.Globalization;
using System.Numerics;

namespace Nethereum.Util
{
    /// BigNumber based on the original http://uberscraper.blogspot.co.uk/2013/09/c-bigdecimal-class-from-stackoverflow.html
    /// which was inspired by http://stackoverflow.com/a/4524254
    /// Original Author: Jan Christoph Bernack (contact: jc.bernack at googlemail.com)
    /// Changes JB: Added parse, Fix Normalise, Added Floor, New ToString, Change Equals (normalise to validate first), Change Casting to avoid overflows (even if might be slower), Added Normalise Bigger than zero, test on operations, parsing, casting, and other test coverage for ethereum unit conversions
    /// Changes KJ: Added Culture formatting
    /// http://stackoverflow.com/a/13813535/956364" />
    /// <summary>
    ///     Arbitrary precision Decimal.
    ///     All operations are exact, except for division.
    ///     Division never determines more digits than the given precision of 50.
    /// </summary>
    public struct BigDecimal : IComparable, IComparable<BigDecimal>
    {
        /// <summary>
        ///     Sets the maximum precision of division operations.
        ///     If AlwaysTruncate is set to true all operations are affected.
        /// </summary>
        public const int Precision = 50;
        public const decimal PI = 3.14159265358979323846264338327950288419716939937510M;
        public BigDecimal(BigDecimal bigDecimal, bool alwaysTruncate = false) : this(bigDecimal.Mantissa,
            bigDecimal.Exponent, alwaysTruncate)
        {
        }

        public BigDecimal(decimal value, bool alwaysTruncate = false) : this((BigDecimal) value, alwaysTruncate)
        {
        }

        /// <summary>
        /// </summary>
        /// <param name="mantissa"></param>
        /// <param name="exponent">
        ///     The number of decimal units for example (-18). A positive value will be normalised as 10 ^
        ///     exponent
        /// </param>
        /// <param name="alwaysTruncate">
        ///     Specifies whether the significant digits should be truncated to the given precision after
        ///     each operation.
        /// </param>
        public BigDecimal(BigInteger mantissa, int exponent, bool alwaysTruncate = false) : this()
        {
            Mantissa = mantissa;
            Exponent = exponent;
            NormaliseExponentBiggerThanZero();
            Normalize();
            if (alwaysTruncate)
                Truncate();
        }

        public BigInteger Mantissa { get; internal set; }
        public int Exponent { get; internal set; }

        public int CompareTo(object obj)
        {
            if (ReferenceEquals(obj, null) || !(obj is BigDecimal))
                throw new ArgumentException();
            return CompareTo((BigDecimal) obj);
        }

        public int CompareTo(BigDecimal other)
        {
            return this < other ? -1 : (this > other ? 1 : 0);
        }

        public void NormaliseExponentBiggerThanZero()
        {
            if (Exponent > 0)
            {
                Mantissa = Mantissa * BigInteger.Pow(10, Exponent);
                Exponent = 0;
            }
        }

        /// <summary>
        ///     Removes trailing zeros on the mantissa
        /// </summary>
        public void Normalize()
        {
            if (Exponent == 0) return;

            if (Mantissa.IsZero)
            {
                Exponent = 0;
            }
            else
            {
                BigInteger remainder = 0;
                while (remainder == 0)
                {
                    var shortened = BigInteger.DivRem(Mantissa, 10, out remainder);
                    if (remainder != 0)
                        continue;
                    Mantissa = shortened;
                    Exponent++;
                }

                NormaliseExponentBiggerThanZero();
            }
        }

        /// <summary>
        ///     Truncate the number to the given precision by removing the least significant digits.
        /// </summary>
        /// <returns>The truncated number</returns>
        internal BigDecimal Truncate(int precision = Precision)
        {
            //if the precission is 0, 
            if(precision <= 0) throw new ArgumentException("Precision has to bigger than 0");
            // copy this instance (remember its a struct)
            var shortened = this;
            // save some time because the number of digits is not needed to remove trailing zeros
            shortened.Normalize();
            // remove the least significant digits, as long as the number of digits is higher than the given Precision
            while (shortened.Mantissa.NumberOfDigits() > precision)
            {
                shortened.Mantissa /= 10;
                shortened.Exponent++;
            }

            return shortened;
        }

        /// <summary>
        /// Rounds the number to the specified amount of significant digits.
        /// Midpoints (like 0.5 or -0.5) are rounded away from 0 (e.g. to 1 and -1 respectively).
        /// </summary>
        public BigDecimal RoundAwayFromZero(int significantDigits)
        {
            if (significantDigits < 0 || significantDigits > 2_000_000_000)
                throw new ArgumentOutOfRangeException(paramName: nameof(significantDigits));

            if (Exponent >= -significantDigits) return this;

            bool negative = this.Mantissa < 0;
            var shortened = negative ? -this : this;
            shortened.Normalize();

            while (shortened.Exponent < -significantDigits)
            {
                shortened.Mantissa = BigInteger.DivRem(shortened.Mantissa, 10, out var rem);
                shortened.Mantissa += rem >= 5 ? +1 : 0;
                shortened.Exponent++;
            }

            return negative ? -shortened : shortened;
        }

        /// <summary>
        ///     Truncate the number, removing all decimal digits.
        /// </summary>
        /// <returns>The truncated number</returns>
        public BigDecimal Floor()
        {
            var precission = Mantissa.NumberOfDigits() + Exponent;
            if (precission <= 0) return 0;

            return Truncate(precission);
        }

        private static int NumberOfDigits(BigInteger value)
        {
            return value.NumberOfDigits();
        }

        public override string ToString()
        {
            Normalize();
            bool isNegative = Mantissa < 0;

            var s = BigInteger.Abs(Mantissa).ToString();
            if (Exponent != 0)
            {
                var decimalPos = s.Length + Exponent;
                if (decimalPos < s.Length)
                    if (decimalPos >= 0)
                        s = s.Insert(decimalPos, decimalPos == 0 ? "0." : ".");
                    else
                        s = "0." + s.PadLeft(decimalPos * -1 + s.Length, '0');
                else
                    s = s.PadRight(decimalPos, '0');
            }

            return isNegative ? $"-{s}" : s;
        }

        public bool Equals(BigDecimal other)
        {
            var first = this;
            var second = other;
            first.Normalize();
            second.Normalize();
            return second.Mantissa.Equals(first.Mantissa) && second.Exponent == first.Exponent;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj))
                return false;
            return obj is BigDecimal && Equals((BigDecimal) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return (Mantissa.GetHashCode() * 397) ^ Exponent;
            }
        }

        #region Conversions

        public static implicit operator BigDecimal(int value)
        {
            return new BigDecimal(value, 0);
        }

        public static implicit operator BigDecimal(BigInteger value)
        {
            return new BigDecimal(value, 0);
        }

        public static implicit operator BigDecimal(double value)
        {
            return new BigDecimal(Convert.ToDecimal(value));         

        }

        public static implicit operator BigDecimal(decimal value)
        {
            var mantissa = (BigInteger) value;
            var exponent = 0;
            decimal scaleFactor = 1;
            while ((decimal) mantissa != value * scaleFactor)
            {
                exponent -= 1;
                scaleFactor *= 10;
                mantissa = (BigInteger) (value * scaleFactor);
            }

            return new BigDecimal(mantissa, exponent);
        }

        public static explicit operator double(BigDecimal value)
        {
            return double.Parse(value.ToString(), CultureInfo.InvariantCulture);
        }

        public static explicit operator float(BigDecimal value)
        {
            return float.Parse(value.ToString(), CultureInfo.InvariantCulture);
        }

        public static explicit operator decimal(BigDecimal value)
        {
            return decimal.Parse(value.ToString(), CultureInfo.InvariantCulture);
        }

        public static explicit operator int(BigDecimal value)
        {
            return Convert.ToInt32((decimal) value);
        }

        public static explicit operator uint(BigDecimal value)
        {
            return Convert.ToUInt32((decimal) value);
        }

        #endregion

        #region Operators

        public static BigDecimal operator +(BigDecimal value)
        {
            return value;
        }

        public static BigDecimal operator -(BigDecimal value)
        {
            value.Mantissa *= -1;
            return value;
        }

        public static BigDecimal operator ++(BigDecimal value)
        {
            return value + 1;
        }

        public static BigDecimal operator --(BigDecimal value)
        {
            return value - 1;
        }

        public static BigDecimal operator +(BigDecimal left, BigDecimal right)
        {
            return Add(left, right);
        }

        public static BigDecimal operator -(BigDecimal left, BigDecimal right)
        {
            return Add(left, -right);
        }

        private static BigDecimal Add(BigDecimal left, BigDecimal right)
        {
            return left.Exponent > right.Exponent
                ? new BigDecimal(AlignExponent(left, right) + right.Mantissa, right.Exponent)
                : new BigDecimal(AlignExponent(right, left) + left.Mantissa, left.Exponent);
        }

        public static BigDecimal operator *(BigDecimal left, BigDecimal right)
        {
            return new BigDecimal(left.Mantissa * right.Mantissa, left.Exponent + right.Exponent);
        }

        public static BigDecimal operator /(BigDecimal dividend, BigDecimal divisor)
        {
            var exponentChange = Precision - (NumberOfDigits(dividend.Mantissa) - NumberOfDigits(divisor.Mantissa));
            if (exponentChange < 0)
                exponentChange = 0;
            dividend.Mantissa *= BigInteger.Pow(10, exponentChange);
            return new BigDecimal(dividend.Mantissa / divisor.Mantissa,
                dividend.Exponent - divisor.Exponent - exponentChange);
        }

        public static bool operator ==(BigDecimal left, BigDecimal right)
        {
            return left.Exponent == right.Exponent && left.Mantissa == right.Mantissa;
        }

        public static bool operator !=(BigDecimal left, BigDecimal right)
        {
            return left.Exponent != right.Exponent || left.Mantissa != right.Mantissa;
        }

        public static bool operator <(BigDecimal left, BigDecimal right)
        {
            return left.Exponent > right.Exponent
                ? AlignExponent(left, right) < right.Mantissa
                : left.Mantissa < AlignExponent(right, left);
        }

        public static bool operator >(BigDecimal left, BigDecimal right)
        {
            return left.Exponent > right.Exponent
                ? AlignExponent(left, right) > right.Mantissa
                : left.Mantissa > AlignExponent(right, left);
        }

        public static bool operator <=(BigDecimal left, BigDecimal right)
        {
            return left.Exponent > right.Exponent
                ? AlignExponent(left, right) <= right.Mantissa
                : left.Mantissa <= AlignExponent(right, left);
        }

        public static bool operator >=(BigDecimal left, BigDecimal right)
        {
            return left.Exponent > right.Exponent
                ? AlignExponent(left, right) >= right.Mantissa
                : left.Mantissa >= AlignExponent(right, left);
        }

        public static BigDecimal Parse(string value)
        {
            //todo culture format
            var decimalCharacter = ".";
            var indexOfDecimal = value.IndexOf(".");
            var exponent = 0;
            if (indexOfDecimal != -1)
                exponent = (value.Length - (indexOfDecimal + 1)) * -1;
            var mantissa = BigInteger.Parse(value.Replace(decimalCharacter, ""));
            return new BigDecimal(mantissa, exponent);
        }

        /// <summary>
        ///     Returns the mantissa of value, aligned to the exponent of reference.
        ///     Assumes the exponent of value is larger than of value.
        /// </summary>
        private static BigInteger AlignExponent(BigDecimal value, BigDecimal reference)
        {
            return value.Mantissa * BigInteger.Pow(10, value.Exponent - reference.Exponent);
        }

        #endregion

        #region Additional mathematical functions

        public static BigDecimal Exp(double exponent)
        {
            var tmp = (BigDecimal) 1;
            while (Math.Abs(exponent) > 100)
            {
                var diff = exponent > 0 ? 100 : -100;
                tmp *= Math.Exp(diff);
                exponent -= diff;
            }

            return tmp * Math.Exp(exponent);
        }

        public static BigDecimal Pow(BigDecimal value, int exponent)
        {
            if (exponent < 0)
                throw new ArgumentOutOfRangeException("exponent", "exp must be >= 0");
            if (exponent == 0)
                return new BigDecimal(1) ;
            if (exponent == 1)
                return value;

            BigDecimal result = new BigDecimal(1);
            while (exponent != 0)
            {
                if ((exponent & 1) != 0)
                    result = result * value;
                if (exponent == 1)
                    break;

                value = value * value;
                exponent >>= 1;
            }
            return result;
        }

        public static BigDecimal Pow(double basis, double exponent)
        {
            var tmp = (BigDecimal) 1;
            while (Math.Abs(exponent) > 100)
            {
                var diff = exponent > 0 ? 100 : -100;
                tmp *= Math.Pow(basis, diff);
                exponent -= diff;
            }
            
            return tmp * Math.Pow(basis, exponent);
        }

        #endregion

        #region Formatting

        public string ToString(string formatSpecifier, IFormatProvider format)
        {
            char fmt = NumberFormatting.ParseFormatSpecifier(formatSpecifier, out int digits);
            if (fmt != 'c' && fmt != 'C')
                throw new NotImplementedException();

            Normalize();
            if (Exponent == 0)
                return Mantissa.ToString(formatSpecifier, format);

            var numberFormatInfo = NumberFormatInfo.GetInstance(format);
            return BigDecimalFormatter.ToCurrencyString(this, digits, numberFormatInfo);
        }

        #endregion
    }
}
