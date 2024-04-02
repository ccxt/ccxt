using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT193R2Curve
        : AbstractF2mCurve
    {
        private const int SECT193R2_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT193R2_FE_LONGS = 4;
        private static readonly ECFieldElement[] SECT193R2_AFFINE_ZS = new ECFieldElement[] { new SecT193FieldElement(BigInteger.One) };

        protected readonly SecT193R2Point m_infinity;

        public SecT193R2Curve()
            : base(193, 15, 0, 0)
        {
            this.m_infinity = new SecT193R2Point(this, null, null);

            this.m_a = FromBigInteger(new BigInteger(1, Hex.DecodeStrict("0163F35A5137C2CE3EA6ED8667190B0BC43ECD69977702709B")));
            this.m_b = FromBigInteger(new BigInteger(1, Hex.DecodeStrict("00C9BB9E8927D4D64C377E2AB2856A5B16E3EFB7F61D4316AE")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("010000000000000000000000015AAB561B005413CCD4EE99D5"));
            this.m_cofactor = BigInteger.Two;

            this.m_coord = SECT193R2_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT193R2Curve();
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
            return new SecT193R2Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT193R2Point(this, x, y, zs);
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
            ulong[] table = new ulong[len * SECT193R2_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat256.Copy64(((SecT193FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT193R2_FE_LONGS;
                    Nat256.Copy64(((SecT193FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT193R2_FE_LONGS;
                }
            }

            return new SecT193R2LookupTable(this, table, len);
        }

        private class SecT193R2LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT193R2Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT193R2LookupTable(SecT193R2Curve outer, ulong[] table, int size)
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

                    for (int j = 0; j < SECT193R2_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT193R2_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT193R2_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat256.Create64(), y = Nat256.Create64();
                int pos = index * SECT193R2_FE_LONGS * 2;

                for (int j = 0; j < SECT193R2_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT193R2_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT193FieldElement(x), new SecT193FieldElement(y), SECT193R2_AFFINE_ZS);
            }
        }
    }
}
