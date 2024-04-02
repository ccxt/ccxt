using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecT283R1Curve
        : AbstractF2mCurve
    {
        private const int SECT283R1_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;
        private const int SECT283R1_FE_LONGS = 5;
        private static readonly ECFieldElement[] SECT283R1_AFFINE_ZS = new ECFieldElement[] { new SecT283FieldElement(BigInteger.One) };

        protected readonly SecT283R1Point m_infinity;

        public SecT283R1Curve()
            : base(283, 5, 7, 12)
        {
            this.m_infinity = new SecT283R1Point(this, null, null);

            this.m_a = FromBigInteger(BigInteger.One);
            this.m_b = FromBigInteger(new BigInteger(1, Hex.DecodeStrict("027B680AC8B8596DA5A4AF8A19A0303FCA97FD7645309FA2A581485AF6263E313B79A2F5")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("03FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEF90399660FC938A90165B042A7CEFADB307"));
            this.m_cofactor = BigInteger.Two;

            this.m_coord = SECT283R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecT283R1Curve();
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
            get { return 283; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecT283FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecT283R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecT283R1Point(this, x, y, zs);
        }

        public override bool IsKoblitz
        {
            get { return false; }
        }

        public virtual int M
        {
            get { return 283; }
        }

        public virtual bool IsTrinomial
        {
            get { return false; }
        }

        public virtual int K1
        {
            get { return 5; }
        }

        public virtual int K2
        {
            get { return 7; }
        }

        public virtual int K3
        {
            get { return 12; }
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            ulong[] table = new ulong[len * SECT283R1_FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat320.Copy64(((SecT283FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECT283R1_FE_LONGS;
                    Nat320.Copy64(((SecT283FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECT283R1_FE_LONGS;
                }
            }

            return new SecT283R1LookupTable(this, table, len);
        }

        private class SecT283R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecT283R1Curve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal SecT283R1LookupTable(SecT283R1Curve outer, ulong[] table, int size)
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
                ulong[] x = Nat320.Create64(), y = Nat320.Create64();
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    ulong MASK = (ulong)(long)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECT283R1_FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECT283R1_FE_LONGS + j] & MASK;
                    }

                    pos += (SECT283R1_FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                ulong[] x = Nat320.Create64(), y = Nat320.Create64();
                int pos = index * SECT283R1_FE_LONGS * 2;

                for (int j = 0; j < SECT283R1_FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECT283R1_FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                return m_outer.CreateRawPoint(new SecT283FieldElement(x), new SecT283FieldElement(y), SECT283R1_AFFINE_ZS);
            }
        }
    }
}
