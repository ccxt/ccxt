using System;
using System.Diagnostics;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP192K1FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37"));

        protected internal readonly uint[] x;

        public SecP192K1FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SecP192K1FieldElement", "x");

            this.x = SecP192K1Field.FromBigInteger(x);
        }

        public SecP192K1FieldElement()
        {
            this.x = Nat192.Create();
        }

        protected internal SecP192K1FieldElement(uint[] x)
        {
            this.x = x;
        }

        public override bool IsZero
        {
            get { return Nat192.IsZero(x); }
        }

        public override bool IsOne
        {
            get { return Nat192.IsOne(x); }
        }

        public override bool TestBitZero()
        {
            return Nat192.GetBit(x, 0) == 1;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat192.ToBigInteger(x);
        }

        public override string FieldName
        {
            get { return "SecP192K1Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat192.Create();
            SecP192K1Field.Add(x, ((SecP192K1FieldElement)b).x, z);
            return new SecP192K1FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat192.Create();
            SecP192K1Field.AddOne(x, z);
            return new SecP192K1FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat192.Create();
            SecP192K1Field.Subtract(x, ((SecP192K1FieldElement)b).x, z);
            return new SecP192K1FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat192.Create();
            SecP192K1Field.Multiply(x, ((SecP192K1FieldElement)b).x, z);
            return new SecP192K1FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
            //return Multiply(b.Invert());
            uint[] z = Nat192.Create();
            SecP192K1Field.Inv(((SecP192K1FieldElement)b).x, z);
            SecP192K1Field.Multiply(z, x, z);
            return new SecP192K1FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat192.Create();
            SecP192K1Field.Negate(x, z);
            return new SecP192K1FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat192.Create();
            SecP192K1Field.Square(x, z);
            return new SecP192K1FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
            //return new SecP192K1FieldElement(ToBigInteger().ModInverse(Q));
            uint[] z = Nat192.Create();
            SecP192K1Field.Inv(x, z);
            return new SecP192K1FieldElement(z);
        }

        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            /*
             * Raise this element to the exponent 2^190 - 2^30 - 2^10 - 2^6 - 2^5 - 2^4 - 2^1
             * 
             * Breaking up the exponent's binary representation into "repunits", we get:
             * { 159 1s } { 1 0s } { 19 1s } { 1 0s } { 3 1s } { 3 0s } { 3 1s } { 1 0s }
             * 
             * Therefore we need an addition chain containing 3, 19, 159 (the lengths of the repunits)
             * We use: 1, 2, [3], 6, 8, 16, [19], 35, 70, 140, [159]
             */

            uint[] x1 = this.x;
            if (Nat192.IsZero(x1) || Nat192.IsOne(x1))
                return this;

            uint[] x2 = Nat192.Create();
            SecP192K1Field.Square(x1, x2);
            SecP192K1Field.Multiply(x2, x1, x2);
            uint[] x3 = Nat192.Create();
            SecP192K1Field.Square(x2, x3);
            SecP192K1Field.Multiply(x3, x1, x3);
            uint[] x6 = Nat192.Create();
            SecP192K1Field.SquareN(x3, 3, x6);
            SecP192K1Field.Multiply(x6, x3, x6);
            uint[] x8 = x6;
            SecP192K1Field.SquareN(x6, 2, x8);
            SecP192K1Field.Multiply(x8, x2, x8);
            uint[] x16 = x2;
            SecP192K1Field.SquareN(x8, 8, x16);
            SecP192K1Field.Multiply(x16, x8, x16);
            uint[] x19 = x8;
            SecP192K1Field.SquareN(x16, 3, x19);
            SecP192K1Field.Multiply(x19, x3, x19);
            uint[] x35 = Nat192.Create();
            SecP192K1Field.SquareN(x19, 16, x35);
            SecP192K1Field.Multiply(x35, x16, x35);
            uint[] x70 = x16;
            SecP192K1Field.SquareN(x35, 35, x70);
            SecP192K1Field.Multiply(x70, x35, x70);
            uint[] x140 = x35;
            SecP192K1Field.SquareN(x70, 70, x140);
            SecP192K1Field.Multiply(x140, x70, x140);
            uint[] x159 = x70;
            SecP192K1Field.SquareN(x140, 19, x159);
            SecP192K1Field.Multiply(x159, x19, x159);

            uint[] t1 = x159;
            SecP192K1Field.SquareN(t1, 20, t1);
            SecP192K1Field.Multiply(t1, x19, t1);
            SecP192K1Field.SquareN(t1, 4, t1);
            SecP192K1Field.Multiply(t1, x3, t1);
            SecP192K1Field.SquareN(t1, 6, t1);
            SecP192K1Field.Multiply(t1, x3, t1);
            SecP192K1Field.Square(t1, t1);

            uint[] t2 = x3;
            SecP192K1Field.Square(t1, t2);

            return Nat192.Eq(x1, t2) ? new SecP192K1FieldElement(t1) : null;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecP192K1FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecP192K1FieldElement);
        }

        public virtual bool Equals(SecP192K1FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat192.Eq(x, other.x);
        }

        public override int GetHashCode()
        {
            return Q.GetHashCode() ^ Arrays.GetHashCode(x, 0, 6);
        }
    }
}
