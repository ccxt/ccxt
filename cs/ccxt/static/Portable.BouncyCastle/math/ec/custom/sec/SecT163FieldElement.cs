using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT163FieldElement
        : AbstractF2mFieldElement
    {
        protected internal readonly ulong[] x;

        public SecT163FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.BitLength > 163)
                throw new ArgumentException("value invalid for SecT163FieldElement", "x");

            this.x = SecT163Field.FromBigInteger(x);
        }

        public SecT163FieldElement()
        {
            this.x = Nat192.Create64();
        }

        protected internal SecT163FieldElement(ulong[] x)
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
            return (x[0] & 1L) != 0L;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat192.ToBigInteger64(x);
        }

        public override string FieldName
        {
            get { return "SecT163Field"; }
        }

        public override int FieldSize
        {
            get { return 163; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            ulong[] z = Nat192.Create64();
            SecT163Field.Add(x, ((SecT163FieldElement)b).x, z);
            return new SecT163FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            ulong[] z = Nat192.Create64();
            SecT163Field.AddOne(x, z);
            return new SecT163FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            // Addition and subtraction are the same in F2m
            return Add(b);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            ulong[] z = Nat192.Create64();
            SecT163Field.Multiply(x, ((SecT163FieldElement)b).x, z);
            return new SecT163FieldElement(z);
        }

        public override ECFieldElement MultiplyMinusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            return MultiplyPlusProduct(b, x, y);
        }

        public override ECFieldElement MultiplyPlusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x, bx = ((SecT163FieldElement)b).x;
            ulong[] xx = ((SecT163FieldElement)x).x, yx = ((SecT163FieldElement)y).x;

            ulong[] tt = Nat192.CreateExt64();
            SecT163Field.MultiplyAddToExt(ax, bx, tt);
            SecT163Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat192.Create64();
            SecT163Field.Reduce(tt, z);
            return new SecT163FieldElement(z);
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
            SecT163Field.Square(x, z);
            return new SecT163FieldElement(z);
        }

        public override ECFieldElement SquareMinusProduct(ECFieldElement x, ECFieldElement y)
        {
            return SquarePlusProduct(x, y);
        }

        public override ECFieldElement SquarePlusProduct(ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x;
            ulong[] xx = ((SecT163FieldElement)x).x, yx = ((SecT163FieldElement)y).x;

            ulong[] tt = Nat192.CreateExt64();
            SecT163Field.SquareAddToExt(ax, tt);
            SecT163Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat192.Create64();
            SecT163Field.Reduce(tt, z);
            return new SecT163FieldElement(z);
        }

        public override ECFieldElement SquarePow(int pow)
        {
            if (pow < 1)
                return this;

            ulong[] z = Nat192.Create64();
            SecT163Field.SquareN(x, pow, z);
            return new SecT163FieldElement(z);
        }

        public override ECFieldElement HalfTrace()
        {
            ulong[] z = Nat192.Create64();
            SecT163Field.HalfTrace(x, z);
            return new SecT163FieldElement(z);
        }

        public override bool HasFastTrace
        {
            get { return true; }
        }

        public override int Trace()
        {
            return (int)SecT163Field.Trace(x);
        }

        public override ECFieldElement Invert()
        {
            ulong[] z = Nat192.Create64();
            SecT163Field.Invert(x, z);
            return new SecT163FieldElement(z);
        }

        public override ECFieldElement Sqrt()
        {
            ulong[] z = Nat192.Create64();
            SecT163Field.Sqrt(x, z);
            return new SecT163FieldElement(z);
        }

        public virtual int Representation
        {
            get { return F2mFieldElement.Ppb; }
        }

        public virtual int M
        {
            get { return 163; }
        }

        public virtual int K1
        {
            get { return 3; }
        }

        public virtual int K2
        {
            get { return 6; }
        }

        public virtual int K3
        {
            get { return 7; }
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecT163FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecT163FieldElement);
        }

        public virtual bool Equals(SecT163FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat192.Eq64(x, other.x);
        }

        public override int GetHashCode()
        {
            return 163763 ^ Arrays.GetHashCode(x, 0, 3);
        }
    }
}
