using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP224R1FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001"));

        protected internal readonly uint[] x;

        public SecP224R1FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SecP224R1FieldElement", "x");

            this.x = SecP224R1Field.FromBigInteger(x);
        }

        public SecP224R1FieldElement()
        {
            this.x = Nat224.Create();
        }

        protected internal SecP224R1FieldElement(uint[] x)
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
            get { return "SecP224R1Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat224.Create();
            SecP224R1Field.Add(x, ((SecP224R1FieldElement)b).x, z);
            return new SecP224R1FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat224.Create();
            SecP224R1Field.AddOne(x, z);
            return new SecP224R1FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat224.Create();
            SecP224R1Field.Subtract(x, ((SecP224R1FieldElement)b).x, z);
            return new SecP224R1FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat224.Create();
            SecP224R1Field.Multiply(x, ((SecP224R1FieldElement)b).x, z);
            return new SecP224R1FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
            //return Multiply(b.Invert());
            uint[] z = Nat224.Create();
            SecP224R1Field.Inv(((SecP224R1FieldElement)b).x, z);
            SecP224R1Field.Multiply(z, x, z);
            return new SecP224R1FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat224.Create();
            SecP224R1Field.Negate(x, z);
            return new SecP224R1FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat224.Create();
            SecP224R1Field.Square(x, z);
            return new SecP224R1FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
            //return new SecP224R1FieldElement(ToBigInteger().ModInverse(Q));
            uint[] z = Nat224.Create();
            SecP224R1Field.Inv(x, z);
            return new SecP224R1FieldElement(z);
        }

        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            uint[] c = this.x;
            if (Nat224.IsZero(c) || Nat224.IsOne(c))
                return this;

            uint[] nc = Nat224.Create();
            SecP224R1Field.Negate(c, nc);

            uint[] r = Mod.Random(SecP224R1Field.P);
            uint[] t = Nat224.Create();

            if (!IsSquare(c))
                return null;

            while (!TrySqrt(nc, r, t))
            {
                SecP224R1Field.AddOne(r, r);
            }

            SecP224R1Field.Square(t, r);

            return Nat224.Eq(c, r) ? new SecP224R1FieldElement(t) : null;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecP224R1FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecP224R1FieldElement);
        }

        public virtual bool Equals(SecP224R1FieldElement other)
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

        private static bool IsSquare(uint[] x)
        {
            uint[] t1 = Nat224.Create();
            uint[] t2 = Nat224.Create();
            Nat224.Copy(x, t1);

            for (int i = 0; i < 7; ++i)
            {
                Nat224.Copy(t1, t2);
                SecP224R1Field.SquareN(t1, 1 << i, t1);
                SecP224R1Field.Multiply(t1, t2, t1);
            }

            SecP224R1Field.SquareN(t1, 95, t1);
            return Nat224.IsOne(t1);
        }

        private static void RM(uint[] nc, uint[] d0, uint[] e0, uint[] d1, uint[] e1, uint[] f1, uint[] t)
        {
            SecP224R1Field.Multiply(e1, e0, t);
            SecP224R1Field.Multiply(t, nc, t);
            SecP224R1Field.Multiply(d1, d0, f1);
            SecP224R1Field.Add(f1, t, f1);
            SecP224R1Field.Multiply(d1, e0, t);
            Nat224.Copy(f1, d1);
            SecP224R1Field.Multiply(e1, d0, e1);
            SecP224R1Field.Add(e1, t, e1);
            SecP224R1Field.Square(e1, f1);
            SecP224R1Field.Multiply(f1, nc, f1);
        }

        private static void RP(uint[] nc, uint[] d1, uint[] e1, uint[] f1, uint[] t)
        {
            Nat224.Copy(nc, f1);

            uint[] d0 = Nat224.Create();
            uint[] e0 = Nat224.Create();

            for (int i = 0; i < 7; ++i)
            {
                Nat224.Copy(d1, d0);
                Nat224.Copy(e1, e0);

                int j = 1 << i;
                while (--j >= 0)
                {
                    RS(d1, e1, f1, t);
                }

                RM(nc, d0, e0, d1, e1, f1, t);
            }
        }

        private static void RS(uint[] d, uint[] e, uint[] f, uint[] t)
        {
            SecP224R1Field.Multiply(e, d, e);
            SecP224R1Field.Twice(e, e);
            SecP224R1Field.Square(d, t);
            SecP224R1Field.Add(f, t, d);
            SecP224R1Field.Multiply(f, t, f);
            uint c = Nat.ShiftUpBits(7, f, 2, 0);
            SecP224R1Field.Reduce32(c, f);
        }

        private static bool TrySqrt(uint[] nc, uint[] r, uint[] t)
        {
            uint[] d1 = Nat224.Create();
            Nat224.Copy(r, d1);
            uint[] e1 = Nat224.Create();
            e1[0] = 1;
            uint[] f1 = Nat224.Create();
            RP(nc, d1, e1, f1, t);

            uint[] d0 = Nat224.Create();
            uint[] e0 = Nat224.Create();

            for (int k = 1; k < 96; ++k)
            {
                Nat224.Copy(d1, d0);
                Nat224.Copy(e1, e0);

                RS(d1, e1, f1, t);

                if (Nat224.IsZero(d1))
                {
                    SecP224R1Field.Inv(e0, t);
                    SecP224R1Field.Multiply(t, d0, t);
                    return true;
                }
            }

            return false;
        }
    }
}
