using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT131R1Curve
        : AbstractF2mCurve
    {
        private const int SECT131R1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT131R1_FE_LONGS = 3;
        private static readonly ECFieldElement[] SECT131R1_AFFINE_ZS = new ECFieldElement[] { new SecT131FieldElement(BigInteger.One) };

        protected readonly SecT131R1Point m_infinity;

        public SecT131R1Curve()
            : base(131, 2, 3, 8)
        {
            this.m_infinity = new SecT131R1Point(this, null, null);

            this.m_a = FromBigInteger(new BigInteger(1, Hex.DecodeStrict("07A11B09A76B562144418FF3FF8C2570B8")));
            this.m_b = FromBigInteger(new BigInteger(1, Hex.DecodeStrict("0217C05610884B63B9C6C7291678F9D341")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("0400000000000000023123953A9464B54D"));
            this.m_cofactor = BigInteger.Two;

            this.m_coord = SECT131R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT131R1Curve();
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
            get { return 131; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT131FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT131R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT131R1Point(this, x, y, zs);
        }

        public override bool IsKoblitz
        {
            get { return false; }
        }

        public virtual int M
        {
            get { return 131; }
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
            get { return 3; }
        }

        public virtual int K3
        {
            get { return 8; }
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            ulong[] table = new ulong[len * SECT131R1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat192.Copy64(((SecT131FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT131R1_FE_LONGS;
                    Nat192.Copy64(((SecT131FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT131R1_FE_LONGS;
                }
            }

            return new SecT131R1LookupTable(this, table, len);
        }

        private class SecT131R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT131R1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT131R1LookupTable(SecT131R1Curve outer, ulong[] table, int size)
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

                    for (int j = 0; j < SECT131R1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT131R1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT131R1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat192.Create64(), y = Nat192.Create64();
                int pos = index * SECT131R1_FE_LONGS * 2;

                for (int j = 0; j < SECT131R1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT131R1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT131FieldElement(x), new SecT131FieldElement(y), SECT131R1_AFFINE_ZS);
            }
        }
    }
}
