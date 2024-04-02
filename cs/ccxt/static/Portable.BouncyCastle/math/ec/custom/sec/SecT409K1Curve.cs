using System;

using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT409K1Curve
        : AbstractF2mCurve
    {
        private const int SECT409K1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT409K1_FE_LONGS = 7;
        private static readonly ECFieldElement[] SECT409K1_AFFINE_ZS = new ECFieldElement[] { new SecT409FieldElement(BigInteger.One) };

        protected readonly SecT409K1Point m_infinity;

        public SecT409K1Curve()
            : base(409, 87, 0, 0)
        {
            this.m_infinity = new SecT409K1Point(this, null, null);

            this.m_a = FromBigInteger(BigInteger.Zero);
            this.m_b = FromBigInteger(BigInteger.One);
            this.m_order = new BigInteger(1, Hex.DecodeStrict("7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE5F83B2D4EA20400EC4557D5ED3E3E7CA5B4B5C83B8E01E5FCF"));
            this.m_cofactor = BigInteger.ValueOf(4);

            this.m_coord = SECT409K1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT409K1Curve();
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
            get { return 409; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT409FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT409K1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT409K1Point(this, x, y, zs);
        }

        public override bool IsKoblitz
        {
            get { return true; }
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
            ulong[] table = new ulong[len * SECT409K1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat448.Copy64(((SecT409FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT409K1_FE_LONGS;
                    Nat448.Copy64(((SecT409FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT409K1_FE_LONGS;
                }
            }

            return new SecT409K1LookupTable(this, table, len);
        }

        private class SecT409K1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT409K1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT409K1LookupTable(SecT409K1Curve outer, ulong[] table, int size)
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

                    for (int j = 0; j < SECT409K1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT409K1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT409K1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat448.Create64(), y = Nat448.Create64();
                int pos = index * SECT409K1_FE_LONGS * 2;

                for (int j = 0; j < SECT409K1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT409K1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT409FieldElement(x), new SecT409FieldElement(y), SECT409K1_AFFINE_ZS);
            }
        }
    }
}
