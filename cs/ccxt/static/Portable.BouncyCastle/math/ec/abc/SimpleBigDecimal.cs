using System;
using System.Text;

namespace Org.BouncyCastle.Math.EC.Abc
{
	/**
	* Class representing a simple version of a big decimal. A
	* <code>SimpleBigDecimal</code> is basically a
	* {@link java.math.BigInteger BigInteger} with a few digits on the right of
	* the decimal point. The number of (binary) digits on the right of the decimal
	* point is called the <code>scale</code> of the <code>SimpleBigDecimal</code>.
	* Unlike in {@link java.math.BigDecimal BigDecimal}, the scale is not adjusted
	* automatically, but must be set manually. All <code>SimpleBigDecimal</code>s
	* taking part in the same arithmetic operation must have equal scale. The
	* result of a multiplication of two <code>SimpleBigDecimal</code>s returns a
	* <code>SimpleBigDecimal</code> with double scale.
	*/
	internal class SimpleBigDecimal
		//	: Number
	{
		//	private static final long serialVersionUID = 1L;

		private readonly BigInteger	bigInt;
		private readonly int		scale;

		/**
		* Returns a <code>SimpleBigDecimal</code> representing the same numerical
		* value as <code>value</code>.
		* @param value The value of the <code>SimpleBigDecimal</code> to be
		* created. 
		* @param scale The scale of the <code>SimpleBigDecimal</code> to be
		* created. 
		* @return The such created <code>SimpleBigDecimal</code>.
		*/
		public static SimpleBigDecimal GetInstance(BigInteger val, int scale)
		{
			return new SimpleBigDecimal(val.ShiftLeft(scale), scale);
		}

		/**
		* Constructor for <code>SimpleBigDecimal</code>. The value of the
		* constructed <code>SimpleBigDecimal</code> Equals <code>bigInt / 
		* 2<sup>scale</sup></code>.
		* @param bigInt The <code>bigInt</code> value parameter.
		* @param scale The scale of the constructed <code>SimpleBigDecimal</code>.
		*/
		public SimpleBigDecimal(BigInteger bigInt, int scale)
		{
			if (scale < 0)
				throw new ArgumentException("scale may not be negative");

			this.bigInt = bigInt;
			this.scale = scale;
		}

		private SimpleBigDecimal(SimpleBigDecimal limBigDec)
		{
			bigInt = limBigDec.bigInt;
			scale = limBigDec.scale;
		}

		private void CheckScale(SimpleBigDecimal b)
		{
			if (scale != b.scale)
				throw new ArgumentException("Only SimpleBigDecimal of same scale allowed in arithmetic operations");
		}

		public SimpleBigDecimal AdjustScale(int newScale)
		{
			if (newScale < 0)
				throw new ArgumentException("scale may not be negative");

			if (newScale == scale)
				return this;

			return new SimpleBigDecimal(bigInt.ShiftLeft(newScale - scale), newScale);
		}

		public SimpleBigDecimal Add(SimpleBigDecimal b)
		{
			CheckScale(b);
			return new SimpleBigDecimal(bigInt.Add(b.bigInt), scale);
		}

		public SimpleBigDecimal Add(BigInteger b)
		{
			return new SimpleBigDecimal(bigInt.Add(b.ShiftLeft(scale)), scale);
		}

		public SimpleBigDecimal Negate()
		{
			return new SimpleBigDecimal(bigInt.Negate(), scale);
		}

		public SimpleBigDecimal Subtract(SimpleBigDecimal b)
		{
			return Add(b.Negate());
		}

		public SimpleBigDecimal Subtract(BigInteger b)
		{
			return new SimpleBigDecimal(bigInt.Subtract(b.ShiftLeft(scale)), scale);
		}

		public SimpleBigDecimal Multiply(SimpleBigDecimal b)
		{
			CheckScale(b);
			return new SimpleBigDecimal(bigInt.Multiply(b.bigInt), scale + scale);
		}

		public SimpleBigDecimal Multiply(BigInteger b)
		{
			return new SimpleBigDecimal(bigInt.Multiply(b), scale);
		}

		public SimpleBigDecimal Divide(SimpleBigDecimal b)
		{
			CheckScale(b);
			BigInteger dividend = bigInt.ShiftLeft(scale);
			return new SimpleBigDecimal(dividend.Divide(b.bigInt), scale);
		}

		public SimpleBigDecimal Divide(BigInteger b)
		{
			return new SimpleBigDecimal(bigInt.Divide(b), scale);
		}

		public SimpleBigDecimal ShiftLeft(int n)
		{
			return new SimpleBigDecimal(bigInt.ShiftLeft(n), scale);
		}

		public int CompareTo(SimpleBigDecimal val)
		{
			CheckScale(val);
			return bigInt.CompareTo(val.bigInt);
		}

		public int CompareTo(BigInteger val)
		{
			return bigInt.CompareTo(val.ShiftLeft(scale));
		}

		public BigInteger Floor()
		{
			return bigInt.ShiftRight(scale);
		}

		public BigInteger Round()
		{
			SimpleBigDecimal oneHalf = new SimpleBigDecimal(BigInteger.One, 1);
			return Add(oneHalf.AdjustScale(scale)).Floor();
		}

		public int IntValue
		{
			get { return Floor().IntValue; }
		}

		public long LongValue
		{
			get { return Floor().LongValue; }
		}

//		public double doubleValue()
//		{
//			return new Double(ToString()).doubleValue();
//		}
//
//		public float floatValue()
//		{
//			return new Float(ToString()).floatValue();
//		}

		public int Scale
		{
			get { return scale; }
		}

		public override string ToString()
		{
			if (scale == 0)
				return bigInt.ToString();

			BigInteger floorBigInt = Floor();
	        
			BigInteger fract = bigInt.Subtract(floorBigInt.ShiftLeft(scale));
			if (bigInt.SignValue < 0)
			{
				fract = BigInteger.One.ShiftLeft(scale).Subtract(fract);
			}

			if ((floorBigInt.SignValue == -1) && (!(fract.Equals(BigInteger.Zero))))
			{
				floorBigInt = floorBigInt.Add(BigInteger.One);
			}
			string leftOfPoint = floorBigInt.ToString();

			char[] fractCharArr = new char[scale];
				string fractStr = fract.ToString(2);
			int fractLen = fractStr.Length;
			int zeroes = scale - fractLen;
			for (int i = 0; i < zeroes; i++)
			{
				fractCharArr[i] = '0';
			}
			for (int j = 0; j < fractLen; j++)
			{
				fractCharArr[zeroes + j] = fractStr[j];
			}
			string rightOfPoint = new string(fractCharArr);

			StringBuilder sb = new StringBuilder(leftOfPoint);
			sb.Append(".");
			sb.Append(rightOfPoint);

			return sb.ToString();
		}

		public override bool Equals(
			object obj)
		{
			if (this == obj)
				return true;

			SimpleBigDecimal other = obj as SimpleBigDecimal;

			if (other == null)
				return false;

			return bigInt.Equals(other.bigInt)
				&& scale == other.scale;
		}

		public override int GetHashCode()
		{
			return bigInt.GetHashCode() ^ scale;
		}

	}
}
