using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP160R1Curve
        : AbstractFpCurve
    {
        public static readonly BigInteger q = SecP160R1FieldElement.Q;

        private const int SECP160R1_DEFAULT_COORDS = COORD_JACOBIAN;
        private const int SECP160R1_FE_INTS = 5;
        private static readonly ECFieldElement[] SECP160R1_AFFINE_ZS = new ECFieldElement[] { new SecP160R1FieldElement(BigInteger.One) }; 

        protected readonly SecP160R1Point m_infinity;

        public SecP160R1Curve()
            : base(q)
        {
            this.m_infinity = new SecP160R1Point(this, null, null);

            this.m_a = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC")));
            this.m_b = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("0100000000000000000001F4C8F927AED3CA752257"));
            this.m_cofactor = BigInteger.One;

            this.m_coord = SECP160R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecP160R1Curve();
        }

        public override  bool SupportsCoordinateSystem(int coord)
        {
            switch (coord)
            {
            case COORD_JACOBIAN:
                return true;
            default:
                return false;
            }
        }

        public virtual BigInteger Q
        {
            get { return q; }
        }

        public override ECPoint Infinity
        {
            get { return m_infinity; }
        }

        public override int FieldSize
        {
            get { return q.BitLength; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecP160R1FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecP160R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecP160R1Point(this, x, y, zs);
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            uint[] table = new uint[len * SECP160R1_FE_INTS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat160.Copy(((SecP160R1FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECP160R1_FE_INTS;
                    Nat160.Copy(((SecP160R1FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECP160R1_FE_INTS;
                }
            }

            return new SecP160R1LookupTable(this, table, len);
        }

        public override ECFieldElement RandomFieldElement(SecureRandom r)
        {
            uint[] x = Nat160.Create();
            SecP160R1Field.Random(r, x);
            return new SecP160R1FieldElement(x);
        }

        public override ECFieldElement RandomFieldElementMult(SecureRandom r)
        {
            uint[] x = Nat160.Create();
            SecP160R1Field.RandomMult(r, x);
            return new SecP160R1FieldElement(x);
        }

        private class SecP160R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecP160R1Curve m_outer;
            private readonly uint[] m_table;
            private readonly int m_size;

            internal SecP160R1LookupTable(SecP160R1Curve outer, uint[] table, int size)
            {
                this.m_outer = outer;
                this.m_table = table;
                this.m_size = size;
            }

            public override int Size
            {
                get { return m_size; }
            }

            public override ECPoint Lookup(int index)
            {
                uint[] x = Nat160.Create(), y = Nat160.Create();
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    uint MASK = (uint)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECP160R1_FE_INTS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECP160R1_FE_INTS + j] & MASK;
                    }

                    pos += (SECP160R1_FE_INTS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                uint[] x = Nat160.Create(), y = Nat160.Create();
                int pos = index * SECP160R1_FE_INTS * 2;

                for (int j = 0; j < SECP160R1_FE_INTS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECP160R1_FE_INTS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(uint[] x, uint[] y)
            {
                return m_outer.CreateRawPoint(new SecP160R1FieldElement(x), new SecP160R1FieldElement(y), SECP160R1_AFFINE_ZS);
            }
        }
    }
}
