using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT571FieldElement
        : AbstractF2mFieldElement
    {
        protected internal readonly ulong[] x;

        public SecT571FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.BitLength > 571)
                throw new ArgumentException("value invalid for SecT571FieldElement", "x");

            this.x = SecT571Field.FromBigInteger(x);
        }

        public SecT571FieldElement()
        {
            this.x = Nat576.Create64();
        }

        protected internal SecT571FieldElement(ulong[] x)
        {
            this.x = x;
        }

        public override bool IsOne
        {
            get { return Nat576.IsOne64(x); }
        }

        public override bool IsZero
        {
            get { return Nat576.IsZero64(x); }
        }

        public override bool TestBitZero()
        {
            return (x[0] & 1UL) != 0UL;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat576.ToBigInteger64(x);
        }

        public override string FieldName
        {
            get { return "SecT571Field"; }
        }

        public override int FieldSize
        {
            get { return 571; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            ulong[] z = Nat576.Create64();
            SecT571Field.Add(x, ((SecT571FieldElement)b).x, z);
            return new SecT571FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            ulong[] z = Nat576.Create64();
            SecT571Field.AddOne(x, z);
            return new SecT571FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            // Addition and subtraction are the same in F2m
            return Add(b);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            ulong[] z = Nat576.Create64();
            SecT571Field.Multiply(x, ((SecT571FieldElement)b).x, z);
            return new SecT571FieldElement(z);
        }

        public override ECFieldElement MultiplyMinusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            return MultiplyPlusProduct(b, x, y);
        }

        public override ECFieldElement MultiplyPlusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x, bx = ((SecT571FieldElement)b).x;
            ulong[] xx = ((SecT571FieldElement)x).x, yx = ((SecT571FieldElement)y).x;

            ulong[] tt = Nat576.CreateExt64();
            SecT571Field.MultiplyAddToExt(ax, bx, tt);
            SecT571Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat576.Create64();
            SecT571Field.Reduce(tt, z);
            return new SecT571FieldElement(z);
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
            ulong[] z = Nat576.Create64();
            SecT571Field.Square(x, z);
            return new SecT571FieldElement(z);
        }

        public override ECFieldElement SquareMinusProduct(ECFieldElement x, ECFieldElement y)
        {
            return SquarePlusProduct(x, y);
        }

        public override ECFieldElement SquarePlusProduct(ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x;
            ulong[] xx = ((SecT571FieldElement)x).x, yx = ((SecT571FieldElement)y).x;

            ulong[] tt = Nat576.CreateExt64();
            SecT571Field.SquareAddToExt(ax, tt);
            SecT571Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat576.Create64();
            SecT571Field.Reduce(tt, z);
            return new SecT571FieldElement(z);
        }

        public override ECFieldElement SquarePow(int pow)
        {
            if (pow < 1)
                return this;

            ulong[] z = Nat576.Create64();
            SecT571Field.SquareN(x, pow, z);
            return new SecT571FieldElement(z);
        }

        public override ECFieldElement HalfTrace()
        {
            ulong[] z = Nat576.Create64();
            SecT571Field.HalfTrace(x, z);
            return new SecT571FieldElement(z);
        }

        public override bool HasFastTrace
        {
            get { return true; }
        }

        public override int Trace()
        {
            return (int)SecT571Field.Trace(x);
        }

        public override ECFieldElement Invert()
        {
            ulong[] z = Nat576.Create64();
            SecT571Field.Invert(x, z);
            return new SecT571FieldElement(z);
        }

        public override ECFieldElement Sqrt()
        {
            ulong[] z = Nat576.Create64();
            SecT571Field.Sqrt(x, z);
            return new SecT571FieldElement(z);
        }

        public virtual int Representation
        {
            get { return F2mFieldElement.Ppb; }
        }

        public virtual int M
        {
            get { return 571; }
        }

        public virtual int K1
        {
            get { return 2; }
        }

        public virtual int K2
        {
            get { return 5; }
        }

        public virtual int K3
        {
            get { return 10; }
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SecT571FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecT571FieldElement);
        }

        public virtual bool Equals(SecT571FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat576.Eq64(x, other.x);
        }

        public override int GetHashCode()
        {
            return 5711052 ^ Arrays.GetHashCode(x, 0, 9);
        }
    }
}
