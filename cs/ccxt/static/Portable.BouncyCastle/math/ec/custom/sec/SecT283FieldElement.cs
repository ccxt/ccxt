using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT283FieldElement
        : AbstractF2mFieldElement
    {
        protected internal readonly ulong[] x;

        public SecT283FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.BitLength > 283)
                throw new ArgumentException("value invalid for SecT283FieldElement", "x");

            this.x = SecT283Field.FromBigInteger(x);
        }

        public SecT283FieldElement()
        {
            this.x = Nat320.Create64();
        }

        protected internal SecT283FieldElement(ulong[] x)
        {
            this.x = x;
        }

        public override bool IsOne
        {
            get { return Nat320.IsOne64(x); }
        }

        public override bool IsZero
        {
            get { return Nat320.IsZero64(x); }
        }

        public override bool TestBitZero()
        {
            return (x[0] & 1UL) != 0UL;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat320.ToBigInteger64(x);
        }

        public override string FieldName
        {
            get { return "SecT283Field"; }
        }

        public override int FieldSize
        {
            get { return 283; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            ulong[] z = Nat320.Create64();
            SecT283Field.Add(x, ((SecT283FieldElement)b).x, z);
            return new SecT283FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            ulong[] z = Nat320.Create64();
            SecT283Field.AddOne(x, z);
            return new SecT283FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            // Addition and subtraction are the same in F2m
            return Add(b);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            ulong[] z = Nat320.Create64();
            SecT283Field.Multiply(x, ((SecT283FieldElement)b).x, z);
            return new SecT283FieldElement(z);
        }

        public override ECFieldElement MultiplyMinusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            return MultiplyPlusProduct(b, x, y);
        }

        public override ECFieldElement MultiplyPlusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x, bx = ((SecT283FieldElement)b).x;
            ulong[] xx = ((SecT283FieldElement)x).x, yx = ((SecT283FieldElement)y).x;

            ulong[] tt = Nat.Create64(9);
            SecT283Field.MultiplyAddToExt(ax, bx, tt);
            SecT283Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat320.Create64();
            SecT283Field.Reduce(tt, z);
            return new SecT283FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
            return Multiply(b.Invert());
        }

        public override ECFieldElement Negate()
        {
            return this;
        }

        public override ECFieldElement Square()
        {
            ulong[] z = Nat320.Create64();
            SecT283Field.Square(x, z);
            return new SecT283FieldElement(z);
        }

        public override ECFieldElement SquareMinusProduct(ECFieldElement x, ECFieldElement y)
        {
            return SquarePlusProduct(x, y);
        }

        public override ECFieldElement SquarePlusProduct(ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x;
            ulong[] xx = ((SecT283FieldElement)x).x, yx = ((SecT283FieldElement)y).x;

            ulong[] tt = Nat.Create64(9);
            SecT283Field.SquareAddToExt(ax, tt);
            SecT283Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat320.Create64();
            SecT283Field.Reduce(tt, z);
            return new SecT283FieldElement(z);
        }

        public override ECFieldElement SquarePow(int pow)
        {
            if (pow < 1)
                return this;

            ulong[] z = Nat320.Create64();
            SecT283Field.SquareN(x, pow, z);
            return new SecT283FieldElement(z);
        }

        public override ECFieldElement HalfTrace()
        {
            ulong[] z = Nat320.Create64();
            SecT283Field.HalfTrace(x, z);
            return new SecT283FieldElement(z);
        }

        public override bool HasFastTrace
        {
            get { return true; }
        }

        public override int Trace()
        {
            return (int)SecT283Field.Trace(x);
        }

        public override ECFieldElement Invert()
        {
            ulong[] z = Nat320.Create64();
            SecT283Field.Invert(x, z);
            return new SecT283FieldElement(z);
        }

        public override ECFieldElement Sqrt()
        {
            ulong[] z = Nat320.Create64();
            SecT283Field.Sqrt(x, z);
            return new SecT283FieldElement(z);
        }

        public virtual int Representation
        {
            get { return F2mFieldElement.Ppb; }
        }

        public virtual int M
        {
            get { return 283; }
        }

        public virtual int K1
        {
            get { return 5; }
        }

        public virtual int K2
        {
            get { return 7; }
        }

        public virtual int K3
        {
            get { return 12; }
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecT283FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecT283FieldElement);
        }

        public virtual bool Equals(SecT283FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat320.Eq64(x, other.x);
        }

        public override int GetHashCode()
        {
            return 2831275 ^ Arrays.GetHashCode(x, 0, 5);
        }
    }
}
