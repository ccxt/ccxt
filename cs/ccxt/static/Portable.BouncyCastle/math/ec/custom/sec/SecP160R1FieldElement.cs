using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP160R1FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF"));

        protected internal readonly uint[] x;

        public SecP160R1FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SecP160R1FieldElement", "x");

            this.x = SecP160R1Field.FromBigInteger(x);
        }

        public SecP160R1FieldElement()
        {
            this.x = Nat160.Create();
        }

        protected internal SecP160R1FieldElement(uint[] x)
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
            get { return "SecP160R1Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat160.Create();
            SecP160R1Field.Add(x, ((SecP160R1FieldElement)b).x, z);
            return new SecP160R1FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat160.Create();
            SecP160R1Field.AddOne(x, z);
            return new SecP160R1FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat160.Create();
            SecP160R1Field.Subtract(x, ((SecP160R1FieldElement)b).x, z);
            return new SecP160R1FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat160.Create();
            SecP160R1Field.Multiply(x, ((SecP160R1FieldElement)b).x, z);
            return new SecP160R1FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
    //        return multiply(b.invert());
            uint[] z = Nat160.Create();
            SecP160R1Field.Inv(((SecP160R1FieldElement)b).x, z);
            SecP160R1Field.Multiply(z, x, z);
            return new SecP160R1FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat160.Create();
            SecP160R1Field.Negate(x, z);
            return new SecP160R1FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat160.Create();
            SecP160R1Field.Square(x, z);
            return new SecP160R1FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
    //        return new SecP160R1FieldElement(ToBigInteger().modInverse(Q));
            uint[] z = Nat160.Create();
            SecP160R1Field.Inv(x, z);
            return new SecP160R1FieldElement(z);
        }

        // D.1.4 91
        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            /*
             * Raise this element to the exponent 2^158 - 2^29
             * 
             * Breaking up the exponent's binary representation into "repunits", we get:
             *     { 129 1s } { 29 0s }
             * 
             * Therefore we need an addition chain containing 129 (the length of the repunit) We use:
             *     1, 2, 4, 8, 16, 32, 64, 128, [129]
             */

            uint[] x1 = this.x;
            if (Nat160.IsZero(x1) || Nat160.IsOne(x1))
            {
                return this;
            }

            uint[] x2 = Nat160.Create();
            SecP160R1Field.Square(x1, x2);
            SecP160R1Field.Multiply(x2, x1, x2);
            uint[] x4 = Nat160.Create();
            SecP160R1Field.SquareN(x2, 2, x4);
            SecP160R1Field.Multiply(x4, x2, x4);
            uint[] x8 = x2;
            SecP160R1Field.SquareN(x4, 4, x8);
            SecP160R1Field.Multiply(x8, x4, x8);
            uint[] x16 = x4;
            SecP160R1Field.SquareN(x8, 8, x16);
            SecP160R1Field.Multiply(x16, x8, x16);
            uint[] x32 = x8;
            SecP160R1Field.SquareN(x16, 16, x32);
            SecP160R1Field.Multiply(x32, x16, x32);
            uint[] x64 = x16;
            SecP160R1Field.SquareN(x32, 32, x64);
            SecP160R1Field.Multiply(x64, x32, x64);
            uint[] x128 = x32;
            SecP160R1Field.SquareN(x64, 64, x128);
            SecP160R1Field.Multiply(x128, x64, x128);
            uint[] x129 = x64;
            SecP160R1Field.Square(x128, x129);
            SecP160R1Field.Multiply(x129, x1, x129);

            uint[] t1 = x129;
            SecP160R1Field.SquareN(t1, 29, t1);

            uint[] t2 = x128;
            SecP160R1Field.Square(t1, t2);

            return Nat160.Eq(x1, t2) ? new SecP160R1FieldElement(t1) : null;        
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecP160R1FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecP160R1FieldElement);
        }

        public virtual bool Equals(SecP160R1FieldElement other)
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
