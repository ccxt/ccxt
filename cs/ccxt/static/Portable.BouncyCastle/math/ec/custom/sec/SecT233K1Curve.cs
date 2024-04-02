using System;

using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT233K1Curve
        : AbstractF2mCurve
    {
        private const int SECT233K1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT233K1_FE_LONGS = 4;
        private static readonly ECFieldElement[] SECT233K1_AFFINE_ZS = new ECFieldElement[] { new SecT233FieldElement(BigInteger.One) };

        protected readonly SecT233K1Point m_infinity;

        public SecT233K1Curve()
            : base(233, 74, 0, 0)
        {
            this.m_infinity = new SecT233K1Point(this, null, null);

            this.m_a = FromBigInteger(BigInteger.Zero);
            this.m_b = FromBigInteger(BigInteger.One);
            this.m_order = new BigInteger(1, Hex.DecodeStrict("8000000000000000000000000000069D5BB915BCD46EFB1AD5F173ABDF"));
            this.m_cofactor = BigInteger.ValueOf(4);

            this.m_coord = SECT233K1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT233K1Curve();
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

        public override int FieldSize
        {
            get { return 233; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT233FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT233K1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT233K1Point(this, x, y, zs);
        }

        public override ECPoint Infinity
        {
            get { return m_infinity; }
        }

        public override bool IsKoblitz
        {
            get { return true; }
        }

        public virtual int M
        {
            get { return 233; }
        }

        public virtual bool IsTrinomial
        {
            get { return true; }
        }

        public virtual int K1
        {
            get { return 74; }
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
            ulong[] table = new ulong[len * SECT233K1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat256.Copy64(((SecT233FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT233K1_FE_LONGS;
                    Nat256.Copy64(((SecT233FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT233K1_FE_LONGS;
                }
            }

            return new SecT233K1LookupTable(this, table, len);
        }

        private class SecT233K1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT233K1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT233K1LookupTable(SecT233K1Curve outer, ulong[] table, int size)
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
                ulong[] x = Nat256.Create64(), y = Nat256.Create64();
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    ulong MASK = (ulong)(long)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECT233K1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT233K1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT233K1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat256.Create64(), y = Nat256.Create64();
                int pos = index * SECT233K1_FE_LONGS * 2;

                for (int j = 0; j < SECT233K1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT233K1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT233FieldElement(x), new SecT233FieldElement(y), SECT233K1_AFFINE_ZS);
            }
        }
    }
}
