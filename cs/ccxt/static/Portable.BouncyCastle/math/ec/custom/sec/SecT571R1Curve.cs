using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT571R1Curve
        : AbstractF2mCurve
    {
        private const int SECT571R1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT571R1_FE_LONGS = 9;
        private static readonly ECFieldElement[] SECT571R1_AFFINE_ZS = new ECFieldElement[] { new SecT571FieldElement(BigInteger.One) };

        protected readonly SecT571R1Point m_infinity;

        internal static readonly SecT571FieldElement SecT571R1_B = new SecT571FieldElement(
            new BigInteger(1, Hex.DecodeStrict("02F40E7E2221F295DE297117B7F3D62F5C6A97FFCB8CEFF1CD6BA8CE4A9A18AD84FFABBD8EFA59332BE7AD6756A66E294AFD185A78FF12AA520E4DE739BACA0C7FFEFF7F2955727A")));
        internal static readonly SecT571FieldElement SecT571R1_B_SQRT = (SecT571FieldElement)SecT571R1_B.Sqrt();

        public SecT571R1Curve()
            : base(571, 2, 5, 10)
        {
            this.m_infinity = new SecT571R1Point(this, null, null);

            this.m_a = FromBigInteger(BigInteger.One);
            this.m_b = SecT571R1_B;
            this.m_order = new BigInteger(1, Hex.DecodeStrict("03FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE661CE18FF55987308059B186823851EC7DD9CA1161DE93D5174D66E8382E9BB2FE84E47"));
            this.m_cofactor = BigInteger.Two;

            this.m_coord = SECT571R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT571R1Curve();
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
            get { return 571; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT571FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT571R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT571R1Point(this, x, y, zs);
        }

        public override bool IsKoblitz
        {
            get { return false; }
        }

        public virtual int M
        {
            get { return 571; }
        }

        public virtual bool IsTrinomial
        {
            get { return false; }
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

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            ulong[] table = new ulong[len * SECT571R1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat576.Copy64(((SecT571FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT571R1_FE_LONGS;
                    Nat576.Copy64(((SecT571FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT571R1_FE_LONGS;
                }
            }

            return new SecT571R1LookupTable(this, table, len);
        }

        private class SecT571R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT571R1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT571R1LookupTable(SecT571R1Curve outer, ulong[] table, int size)
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
                ulong[] x = Nat576.Create64(), y = Nat576.Create64();
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    ulong MASK = (ulong)(long)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECT571R1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT571R1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT571R1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat576.Create64(), y = Nat576.Create64();
                int pos = index * SECT571R1_FE_LONGS * 2;

                for (int j = 0; j < SECT571R1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT571R1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT571FieldElement(x), new SecT571FieldElement(y), SECT571R1_AFFINE_ZS);
            }
        }
    }
}
