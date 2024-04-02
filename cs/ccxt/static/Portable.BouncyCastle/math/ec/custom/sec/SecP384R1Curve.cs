using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP384R1Curve
        : AbstractFpCurve
    {
        public static readonly BigInteger q = SecP384R1FieldElement.Q;

        private const int SECP384R1_DEFAULT_COORDS = COORD_JACOBIAN;
        private const int SECP384R1_FE_INTS = 12;
        private static readonly ECFieldElement[] SECP384R1_AFFINE_ZS = new ECFieldElement[] { new SecP384R1FieldElement(BigInteger.One) };

        protected readonly SecP384R1Point m_infinity;

        public SecP384R1Curve()
            : base(q)
        {
            this.m_infinity = new SecP384R1Point(this, null, null);

            this.m_a = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC")));
            this.m_b = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7634D81F4372DDF581A0DB248B0A77AECEC196ACCC52973"));
            this.m_cofactor = BigInteger.One;
            this.m_coord = SECP384R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecP384R1Curve();
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
            return new SecP384R1FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecP384R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecP384R1Point(this, x, y, zs);
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            uint[] table = new uint[len * SECP384R1_FE_INTS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat.Copy(SECP384R1_FE_INTS, ((SecP384R1FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECP384R1_FE_INTS;
                    Nat.Copy(SECP384R1_FE_INTS, ((SecP384R1FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECP384R1_FE_INTS;
                }
            }

            return new SecP384R1LookupTable(this, table, len);
        }

        public override ECFieldElement RandomFieldElement(SecureRandom r)
        {
            uint[] x = Nat.Create(12);
            SecP384R1Field.Random(r, x);
            return new SecP384R1FieldElement(x);
        }

        public override ECFieldElement RandomFieldElementMult(SecureRandom r)
        {
            uint[] x = Nat.Create(12);
            SecP384R1Field.RandomMult(r, x);
            return new SecP384R1FieldElement(x);
        }

        private class SecP384R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecP384R1Curve m_outer;
            private readonly uint[] m_table;
            private readonly int m_size;

            internal SecP384R1LookupTable(SecP384R1Curve outer, uint[] table, int size)
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
                uint[] x = Nat.Create(SECP384R1_FE_INTS), y = Nat.Create(SECP384R1_FE_INTS);
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    uint MASK = (uint)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECP384R1_FE_INTS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECP384R1_FE_INTS + j] & MASK;
                    }

                    pos += (SECP384R1_FE_INTS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                uint[] x = Nat.Create(SECP384R1_FE_INTS), y = Nat.Create(SECP384R1_FE_INTS);
                int pos = index * SECP384R1_FE_INTS * 2;

                for (int j = 0; j < SECP384R1_FE_INTS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECP384R1_FE_INTS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(uint[] x, uint[] y)
            {
                return m_outer.CreateRawPoint(new SecP384R1FieldElement(x), new SecP384R1FieldElement(y), SECP384R1_AFFINE_ZS);
            }
        }
    }
}
