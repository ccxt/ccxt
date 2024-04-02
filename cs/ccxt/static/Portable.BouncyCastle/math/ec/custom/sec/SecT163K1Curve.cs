using System;

using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT163K1Curve
        : AbstractF2mCurve
    {
        private const int SECT163K1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT163K1_FE_LONGS = 3;
        private static readonly ECFieldElement[] SECT163K1_AFFINE_ZS = new ECFieldElement[] { new SecT163FieldElement(BigInteger.One) };

        protected readonly SecT163K1Point m_infinity;

        public SecT163K1Curve()
            : base(163, 3, 6, 7)
        {
            this.m_infinity = new SecT163K1Point(this, null, null);

            this.m_a = FromBigInteger(BigInteger.One);
            this.m_b = this.m_a;
            this.m_order = new BigInteger(1, Hex.DecodeStrict("04000000000000000000020108A2E0CC0D99F8A5EF"));
            this.m_cofactor = BigInteger.Two;

            this.m_coord = SECT163K1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT163K1Curve();
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

        protected override ECMultiplier CreateDefaultMultiplier()
        {
            return new WTauNafMultiplier();
        }

        public override ECPoint Infinity
        {
            get { return m_infinity; }
        }

        public override int FieldSize
        {
            get { return 163; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT163FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT163K1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT163K1Point(this, x, y, zs);
        }

        public override bool IsKoblitz
        {
            get { return true; }
        }

        public virtual int M
        {
            get { return 163; }
        }

        public virtual bool IsTrinomial
        {
            get { return false; }
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

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            ulong[] table = new ulong[len * SECT163K1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat192.Copy64(((SecT163FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT163K1_FE_LONGS;
                    Nat192.Copy64(((SecT163FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT163K1_FE_LONGS;
                }
            }

            return new SecT163K1LookupTable(this, table, len);
        }

        private class SecT163K1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT163K1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT163K1LookupTable(SecT163K1Curve outer, ulong[] table, int size)
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
                ulong[] x = Nat192.Create64(), y = Nat192.Create64();
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    ulong MASK = (ulong)(long)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECT163K1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT163K1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT163K1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat192.Create64(), y = Nat192.Create64();
                int pos = index * SECT163K1_FE_LONGS * 2;

                for (int j = 0; j < SECT163K1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT163K1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT163FieldElement(x), new SecT163FieldElement(y), SECT163K1_AFFINE_ZS);
            }
        }
    }
}
