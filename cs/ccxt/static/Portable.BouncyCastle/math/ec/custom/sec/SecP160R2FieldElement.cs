using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP160R2FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73"));

        protected internal readonly uint[] x;

        public SecP160R2FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SecP160R2FieldElement", "x");

            this.x = SecP160R2Field.FromBigInteger(x);
        }

        public SecP160R2FieldElement()
        {
            this.x = Nat160.Create();
        }

        protected internal SecP160R2FieldElement(uint[] x)
        {
            this.x = x;
        }

        public override bool IsZero
        {
            get { return Nat160.IsZero(x); }
        }

        public override bool IsOne
        {
            get { return Nat160.IsOne(x); }
        }

        public override bool TestBitZero()
        {
            return Nat160.GetBit(x, 0) == 1;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat160.ToBigInteger(x);
        }

        public override string FieldName
        {
            get { return "SecP160R2Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat160.Create();
            SecP160R2Field.Add(x, ((SecP160R2FieldElement)b).x, z);
            return new SecP160R2FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat160.Create();
            SecP160R2Field.AddOne(x, z);
            return new SecP160R2FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat160.Create();
            SecP160R2Field.Subtract(x, ((SecP160R2FieldElement)b).x, z);
            return new SecP160R2FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat160.Create();
            SecP160R2Field.Multiply(x, ((SecP160R2FieldElement)b).x, z);
            return new SecP160R2FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
    //        return Multiply(b.invert());
            uint[] z = Nat160.Create();
            SecP160R2Field.Inv(((SecP160R2FieldElement)b).x, z);
            SecP160R2Field.Multiply(z, x, z);
            return new SecP160R2FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat160.Create();
            SecP160R2Field.Negate(x, z);
            return new SecP160R2FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat160.Create();
            SecP160R2Field.Square(x, z);
            return new SecP160R2FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
    //        return new SecP160R2FieldElement(ToBigInteger().modInverse(Q));
            uint[] z = Nat160.Create();
            SecP160R2Field.Inv(x, z);
            return new SecP160R2FieldElement(z);
        }

        // D.1.4 91
        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            /*
             * Raise this element to the exponent 2^158 - 2^30 - 2^12 - 2^10 - 2^7 - 2^6 - 2^5 - 2^1 - 2^0
             * 
             * Breaking up the exponent's binary representation into "repunits", we get: { 127 1s } { 1
             * 0s } { 17 1s } { 1 0s } { 1 1s } { 1 0s } { 2 1s } { 3 0s } { 3 1s } { 1 0s } { 1 1s }
             * 
             * Therefore we need an Addition chain containing 1, 2, 3, 17, 127 (the lengths of the repunits)
             * We use: [1], [2], [3], 4, 7, 14, [17], 31, 62, 124, [127]
             */

            uint[] x1 = this.x;
            if (Nat160.IsZero(x1) || Nat160.IsOne(x1))
            {
                return this;
            }

            uint[] x2 = Nat160.Create();
            SecP160R2Field.Square(x1, x2);
            SecP160R2Field.Multiply(x2, x1, x2);
            uint[] x3 = Nat160.Create();
            SecP160R2Field.Square(x2, x3);
            SecP160R2Field.Multiply(x3, x1, x3);
            uint[] x4 = Nat160.Create();
            SecP160R2Field.Square(x3, x4);
            SecP160R2Field.Multiply(x4, x1, x4);
            uint[] x7 = Nat160.Create();
            SecP160R2Field.SquareN(x4, 3, x7);
            SecP160R2Field.Multiply(x7, x3, x7);
            uint[] x14 = x4;
            SecP160R2Field.SquareN(x7, 7, x14);
            SecP160R2Field.Multiply(x14, x7, x14);
            uint[] x17 = x7;
            SecP160R2Field.SquareN(x14, 3, x17);
            SecP160R2Field.Multiply(x17, x3, x17);
            uint[] x31 = Nat160.Create();
            SecP160R2Field.SquareN(x17, 14, x31);
            SecP160R2Field.Multiply(x31, x14, x31);
            uint[] x62 = x14;
            SecP160R2Field.SquareN(x31, 31, x62);
            SecP160R2Field.Multiply(x62, x31, x62);
            uint[] x124 = x31;
            SecP160R2Field.SquareN(x62, 62, x124);
            SecP160R2Field.Multiply(x124, x62, x124);
            uint[] x127 = x62;
            SecP160R2Field.SquareN(x124, 3, x127);
            SecP160R2Field.Multiply(x127, x3, x127);

            uint[] t1 = x127;
            SecP160R2Field.SquareN(t1, 18, t1);
            SecP160R2Field.Multiply(t1, x17, t1);
            SecP160R2Field.SquareN(t1, 2, t1);
            SecP160R2Field.Multiply(t1, x1, t1);
            SecP160R2Field.SquareN(t1, 3, t1);
            SecP160R2Field.Multiply(t1, x2, t1);
            SecP160R2Field.SquareN(t1, 6, t1);
            SecP160R2Field.Multiply(t1, x3, t1);
            SecP160R2Field.SquareN(t1, 2, t1);
            SecP160R2Field.Multiply(t1, x1, t1);

            uint[] t2 = x2;
            SecP160R2Field.Square(t1, t2);

            return Nat160.Eq(x1, t2) ? new SecP160R2FieldElement(t1) : null;        
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecP160R2FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecP160R2FieldElement);
        }

        public virtual bool Equals(SecP160R2FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat160.Eq(x, other.x);
        }

        public override int GetHashCode()
        {
            return Q.GetHashCode() ^ Arrays.GetHashCode(x, 0, 5);
        }
    }
}
