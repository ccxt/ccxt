using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT409FieldElement
        : AbstractF2mFieldElement
    {
        protected internal readonly ulong[] x;

        public SecT409FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.BitLength > 409)
                throw new ArgumentException("value invalid for SecT409FieldElement", "x");

            this.x = SecT409Field.FromBigInteger(x);
        }

        public SecT409FieldElement()
        {
            this.x = Nat448.Create64();
        }

        protected internal SecT409FieldElement(ulong[] x)
        {
            this.x = x;
        }

        public override bool IsOne
        {
            get { return Nat448.IsOne64(x); }
        }

        public override bool IsZero
        {
            get { return Nat448.IsZero64(x); }
        }

        public override bool TestBitZero()
        {
            return (x[0] & 1UL) != 0UL;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat448.ToBigInteger64(x);
        }

        public override string FieldName
        {
            get { return "SecT409Field"; }
        }

        public override int FieldSize
        {
            get { return 409; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            ulong[] z = Nat448.Create64();
            SecT409Field.Add(x, ((SecT409FieldElement)b).x, z);
            return new SecT409FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            ulong[] z = Nat448.Create64();
            SecT409Field.AddOne(x, z);
            return new SecT409FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            // Addition and subtraction are the same in F2m
            return Add(b);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            ulong[] z = Nat448.Create64();
            SecT409Field.Multiply(x, ((SecT409FieldElement)b).x, z);
            return new SecT409FieldElement(z);
        }

        public override ECFieldElement MultiplyMinusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            return MultiplyPlusProduct(b, x, y);
        }

        public override ECFieldElement MultiplyPlusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x, bx = ((SecT409FieldElement)b).x;
            ulong[] xx = ((SecT409FieldElement)x).x, yx = ((SecT409FieldElement)y).x;

            ulong[] tt = Nat.Create64(13);
            SecT409Field.MultiplyAddToExt(ax, bx, tt);
            SecT409Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat448.Create64();
            SecT409Field.Reduce(tt, z);
            return new SecT409FieldElement(z);
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
            ulong[] z = Nat448.Create64();
            SecT409Field.Square(x, z);
            return new SecT409FieldElement(z);
        }

        public override ECFieldElement SquareMinusProduct(ECFieldElement x, ECFieldElement y)
        {
            return SquarePlusProduct(x, y);
        }

        public override ECFieldElement SquarePlusProduct(ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x;
            ulong[] xx = ((SecT409FieldElement)x).x, yx = ((SecT409FieldElement)y).x;

            ulong[] tt = Nat.Create64(13);
            SecT409Field.SquareAddToExt(ax, tt);
            SecT409Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat448.Create64();
            SecT409Field.Reduce(tt, z);
            return new SecT409FieldElement(z);
        }

        public override ECFieldElement SquarePow(int pow)
        {
            if (pow < 1)
                return this;

            ulong[] z = Nat448.Create64();
            SecT409Field.SquareN(x, pow, z);
            return new SecT409FieldElement(z);
        }

        public override ECFieldElement HalfTrace()
        {
            ulong[] z = Nat448.Create64();
            SecT409Field.HalfTrace(x, z);
            return new SecT409FieldElement(z);
        }

        public override bool HasFastTrace
        {
            get { return true; }
        }

        public override int Trace()
        {
            return (int)SecT409Field.Trace(x);
        }

        public override ECFieldElement Invert()
        {
            ulong[] z = Nat448.Create64();
            SecT409Field.Invert(x, z);
            return new SecT409FieldElement(z);
        }

        public override ECFieldElement Sqrt()
        {
            ulong[] z = Nat448.Create64();
            SecT409Field.Sqrt(x, z);
            return new SecT409FieldElement(z);
        }

        public virtual int Representation
        {
            get { return F2mFieldElement.Tpb; }
        }

        public virtual int M
        {
            get { return 409; }
        }

        public virtual int K1
        {
            get { return 87; }
        }

        public virtual int K2
        {
            get { return 0; }
        }

        public virtual int K3
        {
            get { return 0; }
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecT409FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecT409FieldElement);
        }

        public virtual bool Equals(SecT409FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat448.Eq64(x, other.x);
        }

        public override int GetHashCode()
        {
            return 4090087 ^ Arrays.GetHashCode(x, 0, 7);
        }
    }
}
