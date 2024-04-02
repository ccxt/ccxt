using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT131FieldElement
        : AbstractF2mFieldElement
    {
        protected internal readonly ulong[] x;

        public SecT131FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.BitLength > 131)
                throw new ArgumentException("value invalid for SecT131FieldElement", "x");

            this.x = SecT131Field.FromBigInteger(x);
        }

        public SecT131FieldElement()
        {
            this.x = Nat192.Create64();
        }

        protected internal SecT131FieldElement(ulong[] x)
        {
            this.x = x;
        }

        public override bool IsOne
        {
            get { return Nat192.IsOne64(x); }
        }

        public override bool IsZero
        {
            get { return Nat192.IsZero64(x); }
        }

        public override bool TestBitZero()
        {
            return (x[0] & 1UL) != 0UL;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat192.ToBigInteger64(x);
        }

        public override string FieldName
        {
            get { return "SecT131Field"; }
        }

        public override int FieldSize
        {
            get { return 131; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            ulong[] z = Nat192.Create64();
            SecT131Field.Add(x, ((SecT131FieldElement)b).x, z);
            return new SecT131FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            ulong[] z = Nat192.Create64();
            SecT131Field.AddOne(x, z);
            return new SecT131FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            // Addition and Subtraction are the same in F2m
            return Add(b);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            ulong[] z = Nat192.Create64();
            SecT131Field.Multiply(x, ((SecT131FieldElement)b).x, z);
            return new SecT131FieldElement(z);
        }

        public override ECFieldElement MultiplyMinusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            return MultiplyPlusProduct(b, x, y);
        }

        public override ECFieldElement MultiplyPlusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x, bx = ((SecT131FieldElement)b).x;
            ulong[] xx = ((SecT131FieldElement)x).x, yx = ((SecT131FieldElement)y).x;

            ulong[] tt = Nat.Create64(5);
            SecT131Field.MultiplyAddToExt(ax, bx, tt);
            SecT131Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat192.Create64();
            SecT131Field.Reduce(tt, z);
            return new SecT131FieldElement(z);
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
            ulong[] z = Nat192.Create64();
            SecT131Field.Square(x, z);
            return new SecT131FieldElement(z);
        }

        public override ECFieldElement SquareMinusProduct(ECFieldElement x, ECFieldElement y)
        {
            return SquarePlusProduct(x, y);
        }

        public override ECFieldElement SquarePlusProduct(ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x;
            ulong[] xx = ((SecT131FieldElement)x).x, yx = ((SecT131FieldElement)y).x;

            ulong[] tt = Nat.Create64(5);
            SecT131Field.SquareAddToExt(ax, tt);
            SecT131Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat192.Create64();
            SecT131Field.Reduce(tt, z);
            return new SecT131FieldElement(z);
        }

        public override ECFieldElement SquarePow(int pow)
        {
            if (pow < 1)
                return this;

            ulong[] z = Nat192.Create64();
            SecT131Field.SquareN(x, pow, z);
            return new SecT131FieldElement(z);
        }

        public override ECFieldElement HalfTrace()
        {
            ulong[] z = Nat192.Create64();
            SecT131Field.HalfTrace(x, z);
            return new SecT131FieldElement(z);
        }

        public override bool HasFastTrace
        {
            get { return true; }
        }

        public override int Trace()
        {
            return (int)SecT131Field.Trace(x);
        }

        public override ECFieldElement Invert()
        {
            ulong[] z = Nat192.Create64();
            SecT131Field.Invert(x, z);
            return new SecT131FieldElement(z);
        }

        public override ECFieldElement Sqrt()
        {
            ulong[] z = Nat192.Create64();
            SecT131Field.Sqrt(x, z);
            return new SecT131FieldElement(z);
        }

        public virtual int Representation
        {
            get { return F2mFieldElement.Ppb; }
        }

        public virtual int M
        {
            get { return 131; }
        }

        public virtual int K1
        {
            get { return 2; }
        }

        public virtual int K2
        {
            get { return 3; }
        }

        public virtual int K3
        {
            get { return 8; }
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecT131FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecT131FieldElement);
        }

        public virtual bool Equals(SecT131FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat192.Eq64(x, other.x);
        }

        public override int GetHashCode()
        {
            return 131832 ^ Arrays.GetHashCode(x, 0, 3);
        }
    }
}
