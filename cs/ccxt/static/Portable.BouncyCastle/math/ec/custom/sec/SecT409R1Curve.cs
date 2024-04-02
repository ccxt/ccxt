using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT409R1Curve
        : AbstractF2mCurve
    {
        private const int SECT409R1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT409R1_FE_LONGS = 7;
        private static readonly ECFieldElement[] SECT409R1_AFFINE_ZS = new ECFieldElement[] { new SecT409FieldElement(BigInteger.One) };

        protected readonly SecT409R1Point m_infinity;

        public SecT409R1Curve()
            : base(409, 87, 0, 0)
        {
            this.m_infinity = new SecT409R1Point(this, null, null);

            this.m_a = FromBigInteger(BigInteger.One);
            this.m_b = FromBigInteger(new BigInteger(1, Hex.DecodeStrict("0021A5C2C8EE9FEB5C4B9A753B7B476B7FD6422EF1F3DD674761FA99D6AC27C8A9A197B272822F6CD57A55AA4F50AE317B13545F")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("010000000000000000000000000000000000000000000000000001E2AAD6A612F33307BE5FA47C3C9E052F838164CD37D9A21173"));
            this.m_cofactor = BigInteger.Two;

            this.m_coord = SECT409R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT409R1Curve();
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
            get { return 409; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT409FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT409R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT409R1Point(this, x, y, zs);
        }

        public override bool IsKoblitz
        {
            get { return false; }
        }

        public virtual int M
        {
            get { return 409; }
        }

        public virtual bool IsTrinomial
        {
            get { return true; }
        }

        public virtual int K1
        {
            get { return 87; }
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
            ulong[] table = new ulong[len * SECT409R1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat448.Copy64(((SecT409FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT409R1_FE_LONGS;
                    Nat448.Copy64(((SecT409FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT409R1_FE_LONGS;
                }
            }

            return new SecT409R1LookupTable(this, table, len);
        }

        private class SecT409R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT409R1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT409R1LookupTable(SecT409R1Curve outer, ulong[] table, int size)
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
                ulong[] x = Nat448.Create64(), y = Nat448.Create64();
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    ulong MASK = (ulong)(long)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECT409R1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT409R1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT409R1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat448.Create64(), y = Nat448.Create64();
                int pos = index * SECT409R1_FE_LONGS * 2;

                for (int j = 0; j < SECT409R1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT409R1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT409FieldElement(x), new SecT409FieldElement(y), SECT409R1_AFFINE_ZS);
            }
        }
    }
}
