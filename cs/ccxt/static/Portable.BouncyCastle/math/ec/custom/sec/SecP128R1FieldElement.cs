using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP128R1FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF"));

        protected internal readonly uint[] x;

        public SecP128R1FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SecP128R1FieldElement", "x");

            this.x = SecP128R1Field.FromBigInteger(x);
        }

        public SecP128R1FieldElement()
        {
            this.x = Nat128.Create();
        }

        protected internal SecP128R1FieldElement(uint[] x)
        {
            this.x = x;
        }

        public override bool IsZero
        {
            get { return Nat128.IsZero(x); }
        }

        public override bool IsOne
        {
            get { return Nat128.IsOne(x); }
        }

        public override bool TestBitZero()
        {
            return Nat128.GetBit(x, 0) == 1;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat128.ToBigInteger(x);
        }

        public override string FieldName
        {
            get { return "SecP128R1Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat128.Create();
            SecP128R1Field.Add(x, ((SecP128R1FieldElement)b).x, z);
            return new SecP128R1FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat128.Create();
            SecP128R1Field.AddOne(x, z);
            return new SecP128R1FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat128.Create();
            SecP128R1Field.Subtract(x, ((SecP128R1FieldElement)b).x, z);
            return new SecP128R1FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat128.Create();
            SecP128R1Field.Multiply(x, ((SecP128R1FieldElement)b).x, z);
            return new SecP128R1FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
    //        return multiply(b.invert());
            uint[] z = Nat128.Create();
            SecP128R1Field.Inv(((SecP128R1FieldElement)b).x, z);
            SecP128R1Field.Multiply(z, x, z);
            return new SecP128R1FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat128.Create();
            SecP128R1Field.Negate(x, z);
            return new SecP128R1FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat128.Create();
            SecP128R1Field.Square(x, z);
            return new SecP128R1FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
    //        return new SecP128R1FieldElement(toBigInteger().modInverse(Q));
            uint[] z = Nat128.Create();
            SecP128R1Field.Inv(x, z);
            return new SecP128R1FieldElement(z);
        }

        // D.1.4 91
        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            /*
             * Raise this element to the exponent 2^126 - 2^95
             * 
             * Breaking up the exponent's binary representation into "repunits", we get:
             *     { 31 1s } { 95 0s }
             * 
             * Therefore we need an addition chain containing 31 (the length of the repunit) We use:
             *     1, 2, 4, 8, 10, 20, 30, [31] 
             */

            uint[] x1 = this.x;
            if (Nat128.IsZero(x1) || Nat128.IsOne(x1))
                return this;

            uint[] x2 = Nat128.Create();
            SecP128R1Field.Square(x1, x2);
            SecP128R1Field.Multiply(x2, x1, x2);
            uint[] x4 = Nat128.Create();
            SecP128R1Field.SquareN(x2, 2, x4);
            SecP128R1Field.Multiply(x4, x2, x4);
            uint[] x8 = Nat128.Create();
            SecP128R1Field.SquareN(x4, 4, x8);
            SecP128R1Field.Multiply(x8, x4, x8);
            uint[] x10 = x4;
            SecP128R1Field.SquareN(x8, 2, x10);
            SecP128R1Field.Multiply(x10, x2, x10);
            uint[] x20 = x2;
            SecP128R1Field.SquareN(x10, 10, x20);
            SecP128R1Field.Multiply(x20, x10, x20);
            uint[] x30 = x8;
            SecP128R1Field.SquareN(x20, 10, x30);
            SecP128R1Field.Multiply(x30, x10, x30);
            uint[] x31 = x10;
            SecP128R1Field.Square(x30, x31);
            SecP128R1Field.Multiply(x31, x1, x31);

            uint[] t1 = x31;
            SecP128R1Field.SquareN(t1, 95, t1);

            uint[] t2 = x30;
            SecP128R1Field.Square(t1, t2);

            return Nat128.Eq(x1, t2) ? new SecP128R1FieldElement(t1) : null;        
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecP128R1FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecP128R1FieldElement);
        }

        public virtual bool Equals(SecP128R1FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat128.Eq(x, other.x);
        }

        public override int GetHashCode()
        {
            return Q.GetHashCode() ^ Arrays.GetHashCode(x, 0, 4);
        }
    }
}
