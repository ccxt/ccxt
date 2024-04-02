using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT113R1Curve
        : AbstractF2mCurve
    {
        private const int SECT113R1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT113R1_FE_LONGS = 2;
        private static readonly ECFieldElement[] SECT113R1_AFFINE_ZS = new ECFieldElement[] { new SecT113FieldElement(BigInteger.One) };

        protected readonly SecT113R1Point m_infinity;

        public SecT113R1Curve()
            : base(113, 9, 0, 0)
        {
            this.m_infinity = new SecT113R1Point(this, null, null);

            this.m_a = FromBigInteger(new BigInteger(1, Hex.DecodeStrict("003088250CA6E7C7FE649CE85820F7")));
            this.m_b = FromBigInteger(new BigInteger(1, Hex.DecodeStrict("00E8BEE4D3E2260744188BE0E9C723")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("0100000000000000D9CCEC8A39E56F"));
            this.m_cofactor = BigInteger.Two;

            this.m_coord = SECT113R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT113R1Curve();
        }

        public override bool SupportsCoordinateSystem(int coord)
        {
            switch (coord)
            {
            case COORD_LAMBDA_PROJECTIVE:
                return true;
            default:
                return false;
            }
        }

        public override ECPoint Infinity
        {
            get { return m_infinity; }
        }

        public override int FieldSize
        {
            get { return 113; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT113FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT113R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT113R1Point(this, x, y, zs);
        }

        public override bool IsKoblitz
        {
            get { return false; }
        }

        public virtual int M
        {
            get { return 113; }
        }

        public virtual bool IsTrinomial
        {
            get { return true; }
        }

        public virtual int K1
        {
            get { return 9; }
        }

        public virtual int K2
        {
            get { return 0; }
        }

        public virtual int K3
        {
            get { return 0; }
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            ulong[] table = new ulong[len * SECT113R1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat128.Copy64(((SecT113FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT113R1_FE_LONGS;
                    Nat128.Copy64(((SecT113FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT113R1_FE_LONGS;
                }
            }

            return new SecT113R1LookupTable(this, table, len);
        }

        private class SecT113R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT113R1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT113R1LookupTable(SecT113R1Curve outer, ulong[] table, int size)
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
                ulong[] x = Nat128.Create64(), y = Nat128.Create64();
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    ulong MASK = (ulong)(long)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECT113R1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT113R1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT113R1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat128.Create64(), y = Nat128.Create64();
                int pos = index * SECT113R1_FE_LONGS * 2;

                for (int j = 0; j < SECT113R1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT113R1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT113FieldElement(x), new SecT113FieldElement(y), SECT113R1_AFFINE_ZS);
            }
        }
    }
}
