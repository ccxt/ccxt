using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP384R1FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFF"));

        protected internal readonly uint[] x;

        public SecP384R1FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SecP384R1FieldElement", "x");

            this.x = SecP384R1Field.FromBigInteger(x);
        }

        public SecP384R1FieldElement()
        {
            this.x = Nat.Create(12);
        }

        protected internal SecP384R1FieldElement(uint[] x)
        {
            this.x = x;
        }

        public override bool IsZero
        {
            get { return Nat.IsZero(12, x); }
        }

        public override bool IsOne
        {
            get { return Nat.IsOne(12, x); }
        }

        public override bool TestBitZero()
        {
            return Nat.GetBit(x, 0) == 1;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat.ToBigInteger(12, x);
        }

        public override string FieldName
        {
            get { return "SecP384R1Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat.Create(12);
            SecP384R1Field.Add(x, ((SecP384R1FieldElement)b).x, z);
            return new SecP384R1FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat.Create(12);
            SecP384R1Field.AddOne(x, z);
            return new SecP384R1FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat.Create(12);
            SecP384R1Field.Subtract(x, ((SecP384R1FieldElement)b).x, z);
            return new SecP384R1FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat.Create(12);
            SecP384R1Field.Multiply(x, ((SecP384R1FieldElement)b).x, z);
            return new SecP384R1FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
            //return Multiply(b.Invert());
            uint[] z = Nat.Create(12);
            SecP384R1Field.Inv(((SecP384R1FieldElement)b).x, z);
            SecP384R1Field.Multiply(z, x, z);
            return new SecP384R1FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat.Create(12);
            SecP384R1Field.Negate(x, z);
            return new SecP384R1FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat.Create(12);
            SecP384R1Field.Square(x, z);
            return new SecP384R1FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
            //return new SecP384R1FieldElement(ToBigInteger().ModInverse(Q));
            uint[] z = Nat.Create(12);
            SecP384R1Field.Inv(x, z);
            return new SecP384R1FieldElement(z);
        }

        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            // Raise this element to the exponent 2^382 - 2^126 - 2^94 + 2^30

            uint[] x1 = this.x;
            if (Nat.IsZero(12, x1) || Nat.IsOne(12, x1))
                return this;

            uint[] tt0 = Nat.Create(24);
            uint[] t1 = Nat.Create(12);
            uint[] t2 = Nat.Create(12);
            uint[] t3 = Nat.Create(12);
            uint[] t4 = Nat.Create(12);

            SecP384R1Field.Square(x1, t1, tt0);
            SecP384R1Field.Multiply(t1, x1, t1, tt0);

            SecP384R1Field.SquareN(t1, 2, t2, tt0);
            SecP384R1Field.Multiply(t2, t1, t2, tt0);

            SecP384R1Field.Square(t2, t2, tt0);
            SecP384R1Field.Multiply(t2, x1, t2, tt0);

            SecP384R1Field.SquareN(t2, 5, t3, tt0);
            SecP384R1Field.Multiply(t3, t2, t3, tt0);

            SecP384R1Field.SquareN(t3, 5, t4, tt0);
            SecP384R1Field.Multiply(t4, t2, t4, tt0);

            SecP384R1Field.SquareN(t4, 15, t2, tt0);
            SecP384R1Field.Multiply(t2, t4, t2, tt0);

            SecP384R1Field.SquareN(t2, 2, t3, tt0);
            SecP384R1Field.Multiply(t1, t3, t1, tt0);

            SecP384R1Field.SquareN(t3, 28, t3, tt0);
            SecP384R1Field.Multiply(t2, t3, t2, tt0);

            SecP384R1Field.SquareN(t2, 60, t3, tt0);
            SecP384R1Field.Multiply(t3, t2, t3, tt0);

            uint[] r = t2;

            SecP384R1Field.SquareN(t3, 120, r, tt0);
            SecP384R1Field.Multiply(r, t3, r, tt0);

            SecP384R1Field.SquareN(r, 15, r, tt0);
            SecP384R1Field.Multiply(r, t4, r, tt0);

            SecP384R1Field.SquareN(r, 33, r, tt0);
            SecP384R1Field.Multiply(r, t1, r, tt0);

            SecP384R1Field.SquareN(r, 64, r, tt0);
            SecP384R1Field.Multiply(r, x1, r, tt0);

            SecP384R1Field.SquareN(r, 30, t1, tt0);
            SecP384R1Field.Square(t1, t2, tt0);

            return Nat.Eq(12, x1, t2) ? new SecP384R1FieldElement(t1) : null;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecP384R1FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecP384R1FieldElement);
        }

        public virtual bool Equals(SecP384R1FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat.Eq(12, x, other.x);
        }

        public override int GetHashCode()
        {
            return Q.GetHashCode() ^ Arrays.GetHashCode(x, 0, 12);
        }
    }
}
