using System;

using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT239K1Curve
        : AbstractF2mCurve
    {
        private const int SECT239K1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT239K1_FE_LONGS = 4;
        private static readonly ECFieldElement[] SECT239K1_AFFINE_ZS = new ECFieldElement[] { new SecT239FieldElement(BigInteger.One) };

        protected readonly SecT239K1Point m_infinity;

        public SecT239K1Curve()
            : base(239, 158, 0, 0)
        {
            this.m_infinity = new SecT239K1Point(this, null, null);

            this.m_a = FromBigInteger(BigInteger.Zero);
            this.m_b = FromBigInteger(BigInteger.One);
            this.m_order = new BigInteger(1, Hex.DecodeStrict("2000000000000000000000000000005A79FEC67CB6E91F1C1DA800E478A5"));
            this.m_cofactor = BigInteger.ValueOf(4);

            this.m_coord = SECT239K1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT239K1Curve();
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
            get { return 239; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT239FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT239K1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT239K1Point(this, x, y, zs);
        }

        public override bool IsKoblitz
        {
            get { return true; }
        }

        public virtual int M
        {
            get { return 239; }
        }

        public virtual bool IsTrinomial
        {
            get { return true; }
        }

        public virtual int K1
        {
            get { return 158; }
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
            ulong[] table = new ulong[len * SECT239K1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat256.Copy64(((SecT239FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT239K1_FE_LONGS;
                    Nat256.Copy64(((SecT239FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT239K1_FE_LONGS;
                }
            }

            return new SecT239K1LookupTable(this, table, len);
        }

        private class SecT239K1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT239K1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT239K1LookupTable(SecT239K1Curve outer, ulong[] table, int size)
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

                    for (int j = 0; j < SECT239K1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT239K1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT239K1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat256.Create64(), y = Nat256.Create64();
                int pos = index * SECT239K1_FE_LONGS * 2;

                for (int j = 0; j < SECT239K1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT239K1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT239FieldElement(x), new SecT239FieldElement(y), SECT239K1_AFFINE_ZS);
            }
        }
    }
}
