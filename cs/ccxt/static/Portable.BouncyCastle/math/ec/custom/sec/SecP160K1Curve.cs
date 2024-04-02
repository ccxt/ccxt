using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP160K1Curve
        : AbstractFpCurve
    {
        public static readonly BigInteger q = SecP160R2FieldElement.Q;

        private const int SECP160K1_DEFAULT_COORDS = COORD_JACOBIAN;
        private const int SECP160K1_FE_INTS = 5;
        private static readonly ECFieldElement[] SECP160K1_AFFINE_ZS = new ECFieldElement[] { new SecP160R2FieldElement(BigInteger.One) };

        protected readonly SecP160K1Point m_infinity;

        public SecP160K1Curve()
            : base(q)
        {
            this.m_infinity = new SecP160K1Point(this, null, null);

            this.m_a = FromBigInteger(BigInteger.Zero);
            this.m_b = FromBigInteger(BigInteger.ValueOf(7));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("0100000000000000000001B8FA16DFAB9ACA16B6B3"));
            this.m_cofactor = BigInteger.One;
            this.m_coord = SECP160K1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecP160K1Curve();
        }

        public override bool SupportsCoordinateSystem(int coord)
        {
            switch (coord)
            {
            case COORD_JACOBIAN:
                return true;
            default:
                return false;
            }
        }

        public virtual BigInteger Q
        {
            get { return q; }
        }

        public override ECPoint Infinity
        {
            get { return m_infinity; }
        }

        public override int FieldSize
        {
            get { return q.BitLength; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            return new SecP160R2FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecP160K1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecP160K1Point(this, x, y, zs);
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            uint[] table = new uint[len * SECP160K1_FE_INTS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat160.Copy(((SecP160R2FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECP160K1_FE_INTS;
                    Nat160.Copy(((SecP160R2FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECP160K1_FE_INTS;
                }
            }

            return new SecP160K1LookupTable(this, table, len);
        }

        public override ECFieldElement RandomFieldElement(SecureRandom r)
        {
            uint[] x = Nat160.Create();
            SecP160R2Field.Random(r, x);
            return new SecP160R2FieldElement(x);
        }

        public override ECFieldElement RandomFieldElementMult(SecureRandom r)
        {
            uint[] x = Nat160.Create();
            SecP160R2Field.RandomMult(r, x);
            return new SecP160R2FieldElement(x);
        }

        private class SecP160K1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecP160K1Curve m_outer;
            private readonly uint[] m_table;
            private readonly int m_size;

            internal SecP160K1LookupTable(SecP160K1Curve outer, uint[] table, int size)
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
                uint[] x = Nat256.Create(), y = Nat256.Create();
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    uint MASK = (uint)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECP160K1_FE_INTS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECP160K1_FE_INTS + j] & MASK;
                    }

                    pos += (SECP160K1_FE_INTS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                uint[] x = Nat256.Create(), y = Nat256.Create();
                int pos = index * SECP160K1_FE_INTS * 2;

                for (int j = 0; j < SECP160K1_FE_INTS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECP160K1_FE_INTS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(uint[] x, uint[] y)
            {
                return m_outer.CreateRawPoint(new SecP160R2FieldElement(x), new SecP160R2FieldElement(y), SECP160K1_AFFINE_ZS);
            }
        }
    }
}
