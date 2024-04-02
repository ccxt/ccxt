using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP224R1Curve
        : AbstractFpCurve
    {
        public static readonly BigInteger q = SecP224R1FieldElement.Q;

        private const int SECP224R1_DEFAULT_COORDS = COORD_JACOBIAN;
        private const int SECP224R1_FE_INTS = 7;
        private static readonly ECFieldElement[] SECP224R1_AFFINE_ZS = new ECFieldElement[] { new SecP224R1FieldElement(BigInteger.One) };

        protected readonly SecP224R1Point m_infinity;

        public SecP224R1Curve()
            : base(q)
        {
            this.m_infinity = new SecP224R1Point(this, null, null);

            this.m_a = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE")));
            this.m_b = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D"));
            this.m_cofactor = BigInteger.One;

            this.m_coord = SECP224R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecP224R1Curve();
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
            return new SecP224R1FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecP224R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecP224R1Point(this, x, y, zs);
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            uint[] table = new uint[len * SECP224R1_FE_INTS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat224.Copy(((SecP224R1FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECP224R1_FE_INTS;
                    Nat224.Copy(((SecP224R1FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECP224R1_FE_INTS;
                }
            }

            return new SecP224R1LookupTable(this, table, len);
        }

        public override ECFieldElement RandomFieldElement(SecureRandom r)
        {
            uint[] x = Nat224.Create();
            SecP224R1Field.Random(r, x);
            return new SecP224R1FieldElement(x);
        }

        public override ECFieldElement RandomFieldElementMult(SecureRandom r)
        {
            uint[] x = Nat224.Create();
            SecP224R1Field.RandomMult(r, x);
            return new SecP224R1FieldElement(x);
        }

        private class SecP224R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecP224R1Curve m_outer;
            private readonly uint[] m_table;
            private readonly int m_size;

            internal SecP224R1LookupTable(SecP224R1Curve outer, uint[] table, int size)
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
                uint[] x = Nat224.Create(), y = Nat224.Create();
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    uint MASK = (uint)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECP224R1_FE_INTS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECP224R1_FE_INTS + j] & MASK;
                    }

                    pos += (SECP224R1_FE_INTS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                uint[] x = Nat224.Create(), y = Nat224.Create();
                int pos = index * SECP224R1_FE_INTS * 2;

                for (int j = 0; j < SECP224R1_FE_INTS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECP224R1_FE_INTS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(uint[] x, uint[] y)
            {
                return m_outer.CreateRawPoint(new SecP224R1FieldElement(x), new SecP224R1FieldElement(y), SECP224R1_AFFINE_ZS);
            }
        }
    }
}
