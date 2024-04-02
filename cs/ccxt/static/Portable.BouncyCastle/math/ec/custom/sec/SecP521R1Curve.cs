using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP521R1Curve
        : AbstractFpCurve
    {
        public static readonly BigInteger q = SecP521R1FieldElement.Q;

        private const int SECP521R1_DEFAULT_COORDS = COORD_JACOBIAN;
        private const int SECP521R1_FE_INTS = 17;
        private static readonly ECFieldElement[] SECP521R1_AFFINE_ZS = new ECFieldElement[] { new SecP521R1FieldElement(BigInteger.One) };

        protected readonly SecP521R1Point m_infinity;

        public SecP521R1Curve()
            : base(q)
        {
            this.m_infinity = new SecP521R1Point(this, null, null);

            this.m_a = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("01FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC")));
            this.m_b = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("0051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("01FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409"));
            this.m_cofactor = BigInteger.One;
            this.m_coord = SECP521R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecP521R1Curve();
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
            return new SecP521R1FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecP521R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecP521R1Point(this, x, y, zs);
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            uint[] table = new uint[len * SECP521R1_FE_INTS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat.Copy(SECP521R1_FE_INTS, ((SecP521R1FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECP521R1_FE_INTS;
                    Nat.Copy(SECP521R1_FE_INTS, ((SecP521R1FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECP521R1_FE_INTS;
                }
            }

            return new SecP521R1LookupTable(this, table, len);
        }

        public override ECFieldElement RandomFieldElement(SecureRandom r)
        {
            uint[] x = Nat.Create(17);
            SecP521R1Field.Random(r, x);
            return new SecP521R1FieldElement(x);
        }

        public override ECFieldElement RandomFieldElementMult(SecureRandom r)
        {
            uint[] x = Nat.Create(17);
            SecP521R1Field.RandomMult(r, x);
            return new SecP521R1FieldElement(x);
        }

        private class SecP521R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecP521R1Curve m_outer;
            private readonly uint[] m_table;
            private readonly int m_size;

            internal SecP521R1LookupTable(SecP521R1Curve outer, uint[] table, int size)
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
                uint[] x = Nat.Create(SECP521R1_FE_INTS), y = Nat.Create(SECP521R1_FE_INTS);
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    uint MASK = (uint)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECP521R1_FE_INTS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECP521R1_FE_INTS + j] & MASK;
                    }

                    pos += (SECP521R1_FE_INTS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                uint[] x = Nat.Create(SECP521R1_FE_INTS), y = Nat.Create(SECP521R1_FE_INTS);
                int pos = index * SECP521R1_FE_INTS * 2;

                for (int j = 0; j < SECP521R1_FE_INTS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECP521R1_FE_INTS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(uint[] x, uint[] y)
            {
                return m_outer.CreateRawPoint(new SecP521R1FieldElement(x), new SecP521R1FieldElement(y), SECP521R1_AFFINE_ZS);
            }
        }
    }
}
