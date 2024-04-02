using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT193R1Curve
        : AbstractF2mCurve
    {
        private const int SECT193R1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT193R1_FE_LONGS = 4;
        private static readonly ECFieldElement[] SECT193R1_AFFINE_ZS = new ECFieldElement[] { new SecT193FieldElement(BigInteger.One) };

        protected readonly SecT193R1Point m_infinity;

        public SecT193R1Curve()
            : base(193, 15, 0, 0)
        {
            this.m_infinity = new SecT193R1Point(this, null, null);

            this.m_a = FromBigInteger(new BigInteger(1, Hex.DecodeStrict("0017858FEB7A98975169E171F77B4087DE098AC8A911DF7B01")));
            this.m_b = FromBigInteger(new BigInteger(1, Hex.DecodeStrict("00FDFB49BFE6C3A89FACADAA7A1E5BBC7CC1C2E5D831478814")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("01000000000000000000000000C7F34A778F443ACC920EBA49"));
            this.m_cofactor = BigInteger.Two;

            this.m_coord = SECT193R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT193R1Curve();
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
            get { return 193; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT193FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT193R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT193R1Point(this, x, y, zs);
        }

        public override bool IsKoblitz
        {
            get { return false; }
        }

        public virtual int M
        {
            get { return 193; }
        }

        public virtual bool IsTrinomial
        {
            get { return true; }
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

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            ulong[] table = new ulong[len * SECT193R1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat256.Copy64(((SecT193FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT193R1_FE_LONGS;
                    Nat256.Copy64(((SecT193FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT193R1_FE_LONGS;
                }
            }

            return new SecT193R1LookupTable(this, table, len);
        }

        private class SecT193R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT193R1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT193R1LookupTable(SecT193R1Curve outer, ulong[] table, int size)
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

                    for (int j = 0; j < SECT193R1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT193R1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT193R1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat256.Create64(), y = Nat256.Create64();
                int pos = index * SECT193R1_FE_LONGS * 2;

                for (int j = 0; j < SECT193R1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT193R1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT193FieldElement(x), new SecT193FieldElement(y), SECT193R1_AFFINE_ZS);
            }
        }
    }
}
