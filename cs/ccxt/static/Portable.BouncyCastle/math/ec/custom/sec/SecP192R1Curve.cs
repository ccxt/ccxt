using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.Sec
{
    internal class SecP192R1Curve
        : AbstractFpCurve
    {
        public static readonly BigInteger q = SecP192R1FieldElement.Q;

        private const int SECP192R1_DEFAULT_COORDS = COORD_JACOBIAN;
        private const int SECP192R1_FE_INTS = 6;
        private static readonly ECFieldElement[] SECP192R1_AFFINE_ZS = new ECFieldElement[] { new SecP192R1FieldElement(BigInteger.One) };

        protected readonly SecP192R1Point m_infinity;

        public SecP192R1Curve()
            : base(q)
        {
            this.m_infinity = new SecP192R1Point(this, null, null);

            this.m_a = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC")));
            this.m_b = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831"));
            this.m_cofactor = BigInteger.One;

            this.m_coord = SECP192R1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SecP192R1Curve();
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
            return new SecP192R1FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SecP192R1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SecP192R1Point(this, x, y, zs);
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            uint[] table = new uint[len * SECP192R1_FE_INTS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat192.Copy(((SecP192R1FieldElement)p.RawXCoord).x, 0, table, pos); pos += SECP192R1_FE_INTS;
                    Nat192.Copy(((SecP192R1FieldElement)p.RawYCoord).x, 0, table, pos); pos += SECP192R1_FE_INTS;
                }
            }

            return new SecP192R1LookupTable(this, table, len);
        }

        public override ECFieldElement RandomFieldElement(SecureRandom r)
        {
            uint[] x = Nat192.Create();
            SecP192R1Field.Random(r, x);
            return new SecP192R1FieldElement(x);
        }

        public override ECFieldElement RandomFieldElementMult(SecureRandom r)
        {
            uint[] x = Nat192.Create();
            SecP192R1Field.RandomMult(r, x);
            return new SecP192R1FieldElement(x);
        }

        private class SecP192R1LookupTable
            : AbstractECLookupTable
        {
            private readonly SecP192R1Curve m_outer;
            private readonly uint[] m_table;
            private readonly int m_size;

            internal SecP192R1LookupTable(SecP192R1Curve outer, uint[] table, int size)
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
                uint[] x = Nat192.Create(), y = Nat192.Create();
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    uint MASK = (uint)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < SECP192R1_FE_INTS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SECP192R1_FE_INTS + j] & MASK;
                    }

                    pos += (SECP192R1_FE_INTS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                uint[] x = Nat192.Create(), y = Nat192.Create();
                int pos = index * SECP192R1_FE_INTS * 2;

                for (int j = 0; j < SECP192R1_FE_INTS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SECP192R1_FE_INTS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(uint[] x, uint[] y)
            {
                return m_outer.CreateRawPoint(new SecP192R1FieldElement(x), new SecP192R1FieldElement(y), SECP192R1_AFFINE_ZS);
            }
        }
    }
}
