using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP521R1FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("01FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));

        protected internal readonly uint[] x;

        public SecP521R1FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SecP521R1FieldElement", "x");

            this.x = SecP521R1Field.FromBigInteger(x);
        }

        public SecP521R1FieldElement()
        {
            this.x = Nat.Create(17);
        }

        protected internal SecP521R1FieldElement(uint[] x)
        {
            this.x = x;
        }

        public override bool IsZero
        {
            get { return Nat.IsZero(17, x); }
        }

        public override bool IsOne
        {
            get { return Nat.IsOne(17, x); }
        }

        public override bool TestBitZero()
        {
            return Nat.GetBit(x, 0) == 1;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat.ToBigInteger(17, x);
        }

        public override string FieldName
        {
            get { return "SecP521R1Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat.Create(17);
            SecP521R1Field.Add(x, ((SecP521R1FieldElement)b).x, z);
            return new SecP521R1FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat.Create(17);
            SecP521R1Field.AddOne(x, z);
            return new SecP521R1FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat.Create(17);
            SecP521R1Field.Subtract(x, ((SecP521R1FieldElement)b).x, z);
            return new SecP521R1FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat.Create(17);
            SecP521R1Field.Multiply(x, ((SecP521R1FieldElement)b).x, z);
            return new SecP521R1FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
            //return Multiply(b.Invert());
            uint[] z = Nat.Create(17);
            SecP521R1Field.Inv(((SecP521R1FieldElement)b).x, z);
            SecP521R1Field.Multiply(z, x, z);
            return new SecP521R1FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat.Create(17);
            SecP521R1Field.Negate(x, z);
            return new SecP521R1FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat.Create(17);
            SecP521R1Field.Square(x, z);
            return new SecP521R1FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
            //return new SecP521R1FieldElement(ToBigInteger().ModInverse(Q));
            uint[] z = Nat.Create(17);
            SecP521R1Field.Inv(x, z);
            return new SecP521R1FieldElement(z);
        }

        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            // Raise this element to the exponent 2^519

            uint[] x1 = this.x;
            if (Nat.IsZero(17, x1) || Nat.IsOne(17, x1))
                return this;

            uint[] tt0 = Nat.Create(33);
            uint[] t1 = Nat.Create(17);
            uint[] t2 = Nat.Create(17);

            SecP521R1Field.SquareN(x1, 519, t1, tt0);
            SecP521R1Field.Square(t1, t2, tt0);

            return Nat.Eq(17, x1, t2) ? new SecP521R1FieldElement(t1) : null;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecP521R1FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecP521R1FieldElement);
        }

        public virtual bool Equals(SecP521R1FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat.Eq(17, x, other.x);
        }

        public override int GetHashCode()
        {
            return Q.GetHashCode() ^ Arrays.GetHashCode(x, 0, 17);
        }
    }
}
