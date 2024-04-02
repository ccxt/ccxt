using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP192R1FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF"));

        protected internal readonly uint[] x;

        public SecP192R1FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SecP192R1FieldElement", "x");

            this.x = SecP192R1Field.FromBigInteger(x);
        }

        public SecP192R1FieldElement()
        {
            this.x = Nat192.Create();
        }

        protected internal SecP192R1FieldElement(uint[] x)
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
            get { return "SecP192R1Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat192.Create();
            SecP192R1Field.Add(x, ((SecP192R1FieldElement)b).x, z);
            return new SecP192R1FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat192.Create();
            SecP192R1Field.AddOne(x, z);
            return new SecP192R1FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat192.Create();
            SecP192R1Field.Subtract(x, ((SecP192R1FieldElement)b).x, z);
            return new SecP192R1FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat192.Create();
            SecP192R1Field.Multiply(x, ((SecP192R1FieldElement)b).x, z);
            return new SecP192R1FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
            //return Multiply(b.Invert());
            uint[] z = Nat192.Create();
            SecP192R1Field.Inv(((SecP192R1FieldElement)b).x, z);
            SecP192R1Field.Multiply(z, x, z);
            return new SecP192R1FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat192.Create();
            SecP192R1Field.Negate(x, z);
            return new SecP192R1FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat192.Create();
            SecP192R1Field.Square(x, z);
            return new SecP192R1FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
            //return new SecP192R1FieldElement(ToBigInteger().ModInverse(Q));
            uint[] z = Nat192.Create();
            SecP192R1Field.Inv(x, z);
            return new SecP192R1FieldElement(z);
        }

        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            // Raise this element to the exponent 2^190 - 2^62

            uint[] x1 = this.x;
            if (Nat192.IsZero(x1) || Nat192.IsOne(x1))
                return this;

            uint[] t1 = Nat192.Create();
            uint[] t2 = Nat192.Create();

            SecP192R1Field.Square(x1, t1);
            SecP192R1Field.Multiply(t1, x1, t1);

            SecP192R1Field.SquareN(t1, 2, t2);
            SecP192R1Field.Multiply(t2, t1, t2);

            SecP192R1Field.SquareN(t2, 4, t1);
            SecP192R1Field.Multiply(t1, t2, t1);

            SecP192R1Field.SquareN(t1, 8, t2);
            SecP192R1Field.Multiply(t2, t1, t2);

            SecP192R1Field.SquareN(t2, 16, t1);
            SecP192R1Field.Multiply(t1, t2, t1);

            SecP192R1Field.SquareN(t1, 32, t2);
            SecP192R1Field.Multiply(t2, t1, t2);

            SecP192R1Field.SquareN(t2, 64, t1);
            SecP192R1Field.Multiply(t1, t2, t1);

            SecP192R1Field.SquareN(t1, 62, t1);
            SecP192R1Field.Square(t1, t2);

            return Nat192.Eq(x1, t2) ? new SecP192R1FieldElement(t1) : null;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecP192R1FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecP192R1FieldElement);
        }

        public virtual bool Equals(SecP192R1FieldElement other)
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
