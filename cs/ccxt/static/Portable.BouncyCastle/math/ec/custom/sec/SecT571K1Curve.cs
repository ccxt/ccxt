using System;

using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT571K1Curve
        : AbstractF2mCurve
    {
        private const int SECT571K1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT571K1_FE_LONGS = 9;
        private static readonly ECFieldElement[] SECT571K1_AFFINE_ZS = new ECFieldElement[] { new SecT571FieldElement(BigInteger.One) };

        protected readonly SecT571K1Point m_infinity;

        public SecT571K1Curve()
            : base(571, 2, 5, 10)
        {
            this.m_infinity = new SecT571K1Point(this, null, null);

            this.m_a = FromBigInteger(BigInteger.Zero);
            this.m_b = FromBigInteger(BigInteger.One);
            this.m_order = new BigInteger(1, Hex.DecodeStrict("020000000000000000000000000000000000000000000000000000000000000000000000131850E1F19A63E4B391A8DB917F4138B630D84BE5D639381E91DEB45CFE778F637C1001"));
            this.m_cofactor = BigInteger.ValueOf(4);

            this.m_coord = SECT571K1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT571K1Curve();
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
            get { return 571; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT571FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT571K1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT571K1Point(this, x, y, zs);
        }

        public override bool IsKoblitz
        {
            get { return true; }
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
            ulong[] table = new ulong[len * SECT571K1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat576.Copy64(((SecT571FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT571K1_FE_LONGS;
                    Nat576.Copy64(((SecT571FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT571K1_FE_LONGS;
                }
            }

            return new SecT571K1LookupTable(this, table, len);
        }

        private class SecT571K1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT571K1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT571K1LookupTable(SecT571K1Curve outer, ulong[] table, int size)
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

                    for (int j = 0; j < SECT571K1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT571K1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT571K1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat576.Create64(), y = Nat576.Create64();
                int pos = index * SECT571K1_FE_LONGS * 2;

                for (int j = 0; j < SECT571K1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT571K1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT571FieldElement(x), new SecT571FieldElement(y), SECT571K1_AFFINE_ZS);
            }
        }
    }
}
