using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP256K1FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F"));

        protected internal readonly uint[] x;

        public SecP256K1FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SecP256K1FieldElement", "x");

            this.x = SecP256K1Field.FromBigInteger(x);
        }

        public SecP256K1FieldElement()
        {
            this.x = Nat256.Create();
        }

        protected internal SecP256K1FieldElement(uint[] x)
        {
            this.x = x;
        }

        public override bool IsZero
        {
            get { return Nat256.IsZero(x); }
        }

        public override bool IsOne
        {
            get { return Nat256.IsOne(x); }
        }

        public override bool TestBitZero()
        {
            return Nat256.GetBit(x, 0) == 1;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat256.ToBigInteger(x);
        }

        public override string FieldName
        {
            get { return "SecP256K1Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat256.Create();
            SecP256K1Field.Add(x, ((SecP256K1FieldElement)b).x, z);
            return new SecP256K1FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat256.Create();
            SecP256K1Field.AddOne(x, z);
            return new SecP256K1FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat256.Create();
            SecP256K1Field.Subtract(x, ((SecP256K1FieldElement)b).x, z);
            return new SecP256K1FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat256.Create();
            SecP256K1Field.Multiply(x, ((SecP256K1FieldElement)b).x, z);
            return new SecP256K1FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
            //return Multiply(b.Invert());
            uint[] z = Nat256.Create();
            SecP256K1Field.Inv(((SecP256K1FieldElement)b).x, z);
            SecP256K1Field.Multiply(z, x, z);
            return new SecP256K1FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat256.Create();
            SecP256K1Field.Negate(x, z);
            return new SecP256K1FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat256.Create();
            SecP256K1Field.Square(x, z);
            return new SecP256K1FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
            //return new SecP256K1FieldElement(ToBigInteger().ModInverse(Q));
            uint[] z = Nat256.Create();
            SecP256K1Field.Inv(x, z);
            return new SecP256K1FieldElement(z);
        }

        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            /*
             * Raise this element to the exponent 2^254 - 2^30 - 2^7 - 2^6 - 2^5 - 2^4 - 2^2
             * 
             * Breaking up the exponent's binary representation into "repunits", we get:
             * { 223 1s } { 1 0s } { 22 1s } { 4 0s } { 2 1s } { 2 0s}
             * 
             * Therefore we need an addition chain containing 2, 22, 223 (the lengths of the repunits)
             * We use: 1, [2], 3, 6, 9, 11, [22], 44, 88, 176, 220, [223]
             */

            uint[] x1 = this.x;
            if (Nat256.IsZero(x1) || Nat256.IsOne(x1))
                return this;

            uint[] tt0 = Nat256.CreateExt();

            uint[] x2 = Nat256.Create();
            SecP256K1Field.Square(x1, x2, tt0);
            SecP256K1Field.Multiply(x2, x1, x2, tt0);
            uint[] x3 = Nat256.Create();
            SecP256K1Field.Square(x2, x3, tt0);
            SecP256K1Field.Multiply(x3, x1, x3, tt0);
            uint[] x6 = Nat256.Create();
            SecP256K1Field.SquareN(x3, 3, x6, tt0);
            SecP256K1Field.Multiply(x6, x3, x6, tt0);
            uint[] x9 = x6;
            SecP256K1Field.SquareN(x6, 3, x9, tt0);
            SecP256K1Field.Multiply(x9, x3, x9, tt0);
            uint[] x11 = x9;
            SecP256K1Field.SquareN(x9, 2, x11, tt0);
            SecP256K1Field.Multiply(x11, x2, x11, tt0);
            uint[] x22 = Nat256.Create();
            SecP256K1Field.SquareN(x11, 11, x22, tt0);
            SecP256K1Field.Multiply(x22, x11, x22, tt0);
            uint[] x44 = x11;
            SecP256K1Field.SquareN(x22, 22, x44, tt0);
            SecP256K1Field.Multiply(x44, x22, x44, tt0);
            uint[] x88 = Nat256.Create();
            SecP256K1Field.SquareN(x44, 44, x88, tt0);
            SecP256K1Field.Multiply(x88, x44, x88, tt0);
            uint[] x176 = Nat256.Create();
            SecP256K1Field.SquareN(x88, 88, x176, tt0);
            SecP256K1Field.Multiply(x176, x88, x176, tt0);
            uint[] x220 = x88;
            SecP256K1Field.SquareN(x176, 44, x220, tt0);
            SecP256K1Field.Multiply(x220, x44, x220, tt0);
            uint[] x223 = x44;
            SecP256K1Field.SquareN(x220, 3, x223, tt0);
            SecP256K1Field.Multiply(x223, x3, x223, tt0);

            uint[] t1 = x223;
            SecP256K1Field.SquareN(t1, 23, t1, tt0);
            SecP256K1Field.Multiply(t1, x22, t1, tt0);
            SecP256K1Field.SquareN(t1, 6, t1, tt0);
            SecP256K1Field.Multiply(t1, x2, t1, tt0);
            SecP256K1Field.SquareN(t1, 2, t1, tt0);

            uint[] t2 = x2;
            SecP256K1Field.Square(t1, t2, tt0);

            return Nat256.Eq(x1, t2) ? new SecP256K1FieldElement(t1) : null;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecP256K1FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecP256K1FieldElement);
        }

        public virtual bool Equals(SecP256K1FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat256.Eq(x, other.x);
        }

        public override int GetHashCode()
        {
            return Q.GetHashCode() ^ Arrays.GetHashCode(x, 0, 8);
        }
    }
}
