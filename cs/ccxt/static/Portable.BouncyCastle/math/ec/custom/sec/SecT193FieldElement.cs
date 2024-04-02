using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT193FieldElement
        : AbstractF2mFieldElement
    {
        protected internal readonly ulong[] x;

        public SecT193FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.BitLength > 193)
                throw new ArgumentException("value invalid for SecT193FieldElement", "x");

            this.x = SecT193Field.FromBigInteger(x);
        }

        public SecT193FieldElement()
        {
            this.x = Nat256.Create64();
        }

        protected internal SecT193FieldElement(ulong[] x)
        {
            this.x = x;
        }

        public override bool IsOne
        {
            get { return Nat256.IsOne64(x); }
        }

        public override bool IsZero
        {
            get { return Nat256.IsZero64(x); }
        }

        public override bool TestBitZero()
        {
            return (x[0] & 1UL) != 0UL;
        }

        public override BigInteger ToBigInteger()
        {
            return Nat256.ToBigInteger64(x);
        }

        public override string FieldName
        {
            get { return "SecT193Field"; }
        }

        public override int FieldSize
        {
            get { return 193; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            ulong[] z = Nat256.Create64();
            SecT193Field.Add(x, ((SecT193FieldElement)b).x, z);
            return new SecT193FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            ulong[] z = Nat256.Create64();
            SecT193Field.AddOne(x, z);
            return new SecT193FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            // Addition and Subtraction are the same in F2m
            return Add(b);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            ulong[] z = Nat256.Create64();
            SecT193Field.Multiply(x, ((SecT193FieldElement)b).x, z);
            return new SecT193FieldElement(z);
        }

        public override ECFieldElement MultiplyMinusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            return MultiplyPlusProduct(b, x, y);
        }

        public override ECFieldElement MultiplyPlusProduct(ECFieldElement b, ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x, bx = ((SecT193FieldElement)b).x;
            ulong[] xx = ((SecT193FieldElement)x).x, yx = ((SecT193FieldElement)y).x;

            ulong[] tt = Nat256.CreateExt64();
            SecT193Field.MultiplyAddToExt(ax, bx, tt);
            SecT193Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat256.Create64();
            SecT193Field.Reduce(tt, z);
            return new SecT193FieldElement(z);
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
            ulong[] z = Nat256.Create64();
            SecT193Field.Square(x, z);
            return new SecT193FieldElement(z);
        }

        public override ECFieldElement SquareMinusProduct(ECFieldElement x, ECFieldElement y)
        {
            return SquarePlusProduct(x, y);
        }

        public override ECFieldElement SquarePlusProduct(ECFieldElement x, ECFieldElement y)
        {
            ulong[] ax = this.x;
            ulong[] xx = ((SecT193FieldElement)x).x, yx = ((SecT193FieldElement)y).x;

            ulong[] tt = Nat256.CreateExt64();
            SecT193Field.SquareAddToExt(ax, tt);
            SecT193Field.MultiplyAddToExt(xx, yx, tt);

            ulong[] z = Nat256.Create64();
            SecT193Field.Reduce(tt, z);
            return new SecT193FieldElement(z);
        }

        public override ECFieldElement SquarePow(int pow)
        {
            if (pow < 1)
                return this;

            ulong[] z = Nat256.Create64();
            SecT193Field.SquareN(x, pow, z);
            return new SecT193FieldElement(z);
        }

        public override ECFieldElement HalfTrace()
        {
            ulong[] z = Nat256.Create64();
            SecT193Field.HalfTrace(x, z);
            return new SecT193FieldElement(z);
        }

        public override bool HasFastTrace
        {
            get { return true; }
        }

        public override int Trace()
        {
            return (int)SecT193Field.Trace(x);
        }

        public override ECFieldElement Invert()
        {
            ulong[] z = Nat256.Create64();
            SecT193Field.Invert(x, z);
            return new SecT193FieldElement(z);
        }

        public override ECFieldElement Sqrt()
        {
            ulong[] z = Nat256.Create64();
            SecT193Field.Sqrt(x, z);
            return new SecT193FieldElement(z);
        }

        public virtual int Representation
        {
            get { return F2mFieldElement.Tpb; }
        }

        public virtual int M
        {
            get { return 193; }
        }

        public virtual int K1
        {
            get { return 15; }
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
            return Equals(obj as SecT193FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SecT193FieldElement);
        }

        public virtual bool Equals(SecT193FieldElement other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Nat256.Eq64(x, other.x);
        }

        public override int GetHashCode()
        {
            return 1930015 ^ Arrays.GetHashCode(x, 0, 4);
        }
    }
}
