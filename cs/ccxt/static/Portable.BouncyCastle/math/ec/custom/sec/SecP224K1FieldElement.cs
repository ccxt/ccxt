using System;
using System.Diagnostics;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP224K1FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFE56D"));

        // Calculated as BigInteger.Two.ModPow(Q.ShiftRight(2), Q)
        private static readonly uint[] PRECOMP_POW2 = new uint[]{ 0x33bfd202, 0xdcfad133, 0x2287624a, 0xc3811ba8,
            0xa85558fc, 0x1eaef5d7, 0x8edf154c };

        protected internal readonly uint[] x;

        public SecP224K1FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SecP224K1FieldElement", "x");

            this.x = SecP224K1Field.FromBigInteger(x);
        }

        public SecP224K1FieldElement()
        {
            this.x = Nat224.Create();
        }

        protected internal SecP224K1FieldElement(uint[] x)
        {
            this.x = x;
        }

        public override bool IsZero
        {
            get { return Nat224.IsZero(x); }
        }

        public override bool IsOne
        {
            get { return Nat224.IsOne(x); }
        }

        public override bool TestBitZero()
        {
            return Nat224.GetBit(x, 0) == 1;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat224.ToBigInteger(x);
        }

        public override string FieldName
        {
            get { return "SecP224K1Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat224.Create();
            SecP224K1Field.Add(x, ((SecP224K1FieldElement)b).x, z);
            return new SecP224K1FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat224.Create();
            SecP224K1Field.AddOne(x, z);
            return new SecP224K1FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat224.Create();
            SecP224K1Field.Subtract(x, ((SecP224K1FieldElement)b).x, z);
            return new SecP224K1FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat224.Create();
            SecP224K1Field.Multiply(x, ((SecP224K1FieldElement)b).x, z);
            return new SecP224K1FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
            //return Multiply(b.Invert());
            uint[] z = Nat224.Create();
            SecP224K1Field.Inv(((SecP224K1FieldElement)b).x, z);
            SecP224K1Field.Multiply(z, x, z);
            return new SecP224K1FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat224.Create();
            SecP224K1Field.Negate(x, z);
            return new SecP224K1FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat224.Create();
            SecP224K1Field.Square(x, z);
            return new SecP224K1FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
            //return new SecP224K1FieldElement(ToBigInteger().ModInverse(Q));
            uint[] z = Nat224.Create();
            SecP224K1Field.Inv(x, z);
            return new SecP224K1FieldElement(z);
        }

        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            /*
             * Q == 8m + 5, so we use Pocklington's method for this case.
             *
             * First, raise this element to the exponent 2^221 - 2^29 - 2^9 - 2^8 - 2^6 - 2^4 - 2^1 (i.e. m + 1)
             * 
             * Breaking up the exponent's binary representation into "repunits", we get:
             * { 191 1s } { 1 0s } { 19 1s } { 2 0s } { 1 1s } { 1 0s } { 1 1s } { 1 0s } { 3 1s } { 1 0s }
             * 
             * Therefore we need an addition chain containing 1, 3, 19, 191 (the lengths of the repunits)
             * We use: [1], 2, [3], 4, 8, 11, [19], 23, 42, 84, 107, [191]
             */

            uint[] x1 = this.x;
            if (Nat224.IsZero(x1) || Nat224.IsOne(x1))
                return this;

            uint[] x2 = Nat224.Create();
            SecP224K1Field.Square(x1, x2);
            SecP224K1Field.Multiply(x2, x1, x2);
            uint[] x3 = x2;
            SecP224K1Field.Square(x2, x3);
            SecP224K1Field.Multiply(x3, x1, x3);
            uint[] x4 = Nat224.Create();
            SecP224K1Field.Square(x3, x4);
            SecP224K1Field.Multiply(x4, x1, x4);
            uint[] x8 = Nat224.Create();
            SecP224K1Field.SquareN(x4, 4, x8);
            SecP224K1Field.Multiply(x8, x4, x8);
            uint[] x11 = Nat224.Create();
            SecP224K1Field.SquareN(x8, 3, x11);
            SecP224K1Field.Multiply(x11, x3, x11);
            uint[] x19 = x11;
            SecP224K1Field.SquareN(x11, 8, x19);
            SecP224K1Field.Multiply(x19, x8, x19);
            uint[] x23 = x8;
            SecP224K1Field.SquareN(x19, 4, x23);
            SecP224K1Field.Multiply(x23, x4, x23);
            uint[] x42 = x4;
            SecP224K1Field.SquareN(x23, 19, x42);
            SecP224K1Field.Multiply(x42, x19, x42);
            uint[] x84 = Nat224.Create();
            SecP224K1Field.SquareN(x42, 42, x84);
            SecP224K1Field.Multiply(x84, x42, x84);
            uint[] x107 = x42;
            SecP224K1Field.SquareN(x84, 23, x107);
            SecP224K1Field.Multiply(x107, x23, x107);
            uint[] x191 = x23;
            SecP224K1Field.SquareN(x107, 84, x191);
            SecP224K1Field.Multiply(x191, x84, x191);

            uint[] t1 = x191;
            SecP224K1Field.SquareN(t1, 20, t1);
            SecP224K1Field.Multiply(t1, x19, t1);
            SecP224K1Field.SquareN(t1, 3, t1);
            SecP224K1Field.Multiply(t1, x1, t1);
            SecP224K1Field.SquareN(t1, 2, t1);
            SecP224K1Field.Multiply(t1, x1, t1);
            SecP224K1Field.SquareN(t1, 4, t1);
            SecP224K1Field.Multiply(t1, x3, t1);
            SecP224K1Field.Square(t1, t1);

            uint[] t2 = x84;
            SecP224K1Field.Square(t1, t2);

            if (Nat224.Eq(x1, t2))
            {
                return new SecP224K1FieldElement(t1);
            }

            /*
             * If the first guess is incorrect, we multiply by a precomputed power of 2 to get the second guess,
             * which is ((4x)^(m + 1))/2 mod Q
             */
            SecP224K1Field.Multiply(t1, PRECOMP_POW2, t1);

            SecP224K1Field.Square(t1, t2);

            if (Nat224.Eq(x1, t2))
            {
                return new SecP224K1FieldElement(t1);
            }

            return null;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecP224K1FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecP224K1FieldElement);
        }

        public virtual bool Equals(SecP224K1FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat224.Eq(x, other.x);
        }

        public override int GetHashCode()
        {
            return Q.GetHashCode() ^ Arrays.GetHashCode(x, 0, 7);
        }
    }
}
