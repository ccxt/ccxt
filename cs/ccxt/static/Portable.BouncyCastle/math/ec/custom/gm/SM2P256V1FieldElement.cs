using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.GM
{
    internal class SM2P256V1FieldElement
        : AbstractFpFieldElement
    {
        public static readonly BigInteger Q = new BigInteger(1,
            Hex.DecodeStrict("FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF"));

        protected internal readonly uint[] x;

        public SM2P256V1FieldElement(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(Q) >= 0)
                throw new ArgumentException("value invalid for SM2P256V1FieldElement", "x");

            this.x = SM2P256V1Field.FromBigInteger(x);
        }

        public SM2P256V1FieldElement()
        {
            this.x = Nat256.Create();
        }

        protected internal SM2P256V1FieldElement(uint[] x)
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
            get { return "SM2P256V1Field"; }
        }

        public override int FieldSize
        {
            get { return Q.BitLength; }
        }

        public override ECFieldElement Add(ECFieldElement b)
        {
            uint[] z = Nat256.Create();
            SM2P256V1Field.Add(x, ((SM2P256V1FieldElement)b).x, z);
            return new SM2P256V1FieldElement(z);
        }

        public override ECFieldElement AddOne()
        {
            uint[] z = Nat256.Create();
            SM2P256V1Field.AddOne(x, z);
            return new SM2P256V1FieldElement(z);
        }

        public override ECFieldElement Subtract(ECFieldElement b)
        {
            uint[] z = Nat256.Create();
            SM2P256V1Field.Subtract(x, ((SM2P256V1FieldElement)b).x, z);
            return new SM2P256V1FieldElement(z);
        }

        public override ECFieldElement Multiply(ECFieldElement b)
        {
            uint[] z = Nat256.Create();
            SM2P256V1Field.Multiply(x, ((SM2P256V1FieldElement)b).x, z);
            return new SM2P256V1FieldElement(z);
        }

        public override ECFieldElement Divide(ECFieldElement b)
        {
            //return Multiply(b.Invert());
            uint[] z = Nat256.Create();
            SM2P256V1Field.Inv(((SM2P256V1FieldElement)b).x, z);
            SM2P256V1Field.Multiply(z, x, z);
            return new SM2P256V1FieldElement(z);
        }

        public override ECFieldElement Negate()
        {
            uint[] z = Nat256.Create();
            SM2P256V1Field.Negate(x, z);
            return new SM2P256V1FieldElement(z);
        }

        public override ECFieldElement Square()
        {
            uint[] z = Nat256.Create();
            SM2P256V1Field.Square(x, z);
            return new SM2P256V1FieldElement(z);
        }

        public override ECFieldElement Invert()
        {
            //return new SM2P256V1FieldElement(ToBigInteger().ModInverse(Q));
            uint[] z = Nat256.Create();
            SM2P256V1Field.Inv(x, z);
            return new SM2P256V1FieldElement(z);
        }

        /**
         * return a sqrt root - the routine verifies that the calculation returns the right value - if
         * none exists it returns null.
         */
        public override ECFieldElement Sqrt()
        {
            /*
             * Raise this element to the exponent 2^254 - 2^222 - 2^94 + 2^62
             *
             * Breaking up the exponent's binary representation into "repunits", we get:
             * { 31 1s } { 1 0s } { 128 1s } { 31 0s } { 1 1s } { 62 0s }
             *
             * We use an addition chain for the beginning: [1], 2, 3, 6, 12, [24], 30, [31] 
             */

            uint[] x1 = this.x;
            if (Nat256.IsZero(x1) || Nat256.IsOne(x1))
            {
                return this;
            }

            uint[] x2 = Nat256.Create();
            SM2P256V1Field.Square(x1, x2);
            SM2P256V1Field.Multiply(x2, x1, x2);
            uint[] x4 = Nat256.Create();
            SM2P256V1Field.SquareN(x2, 2, x4);
            SM2P256V1Field.Multiply(x4, x2, x4);
            uint[] x6 = Nat256.Create();
            SM2P256V1Field.SquareN(x4, 2, x6);
            SM2P256V1Field.Multiply(x6, x2, x6);
            uint[] x12 = x2;
            SM2P256V1Field.SquareN(x6, 6, x12);
            SM2P256V1Field.Multiply(x12, x6, x12);
            uint[] x24 = Nat256.Create();
            SM2P256V1Field.SquareN(x12, 12, x24);
            SM2P256V1Field.Multiply(x24, x12, x24);
            uint[] x30 = x12;
            SM2P256V1Field.SquareN(x24, 6, x30);
            SM2P256V1Field.Multiply(x30, x6, x30);
            uint[] x31 = x6;
            SM2P256V1Field.Square(x30, x31);
            SM2P256V1Field.Multiply(x31, x1, x31);

            uint[] t1 = x24;
            SM2P256V1Field.SquareN(x31, 31, t1);

            uint[] x62 = x30;
            SM2P256V1Field.Multiply(t1, x31, x62);

            SM2P256V1Field.SquareN(t1, 32, t1);
            SM2P256V1Field.Multiply(t1, x62, t1);
            SM2P256V1Field.SquareN(t1, 62, t1);
            SM2P256V1Field.Multiply(t1, x62, t1);
            SM2P256V1Field.SquareN(t1, 4, t1);
            SM2P256V1Field.Multiply(t1, x4, t1);
            SM2P256V1Field.SquareN(t1, 32, t1);
            SM2P256V1Field.Multiply(t1, x1, t1);
            SM2P256V1Field.SquareN(t1, 62, t1);

            uint[] t2 = x4;
            SM2P256V1Field.Square(t1, t2);

            return Nat256.Eq(x1, t2) ? new SM2P256V1FieldElement(t1) : null;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as SM2P256V1FieldElement);
        }

        public override bool Equals(ECFieldElement other)
        {
            return Equals(other as SM2P256V1FieldElement);
        }

        public virtual bool Equals(SM2P256V1FieldElement other)
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
