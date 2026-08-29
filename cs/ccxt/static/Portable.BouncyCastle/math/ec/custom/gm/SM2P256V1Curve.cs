using System;

using Org.BouncyCastle.Math.Raw;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Math.EC.Custom.GM
{
    internal class SM2P256V1Curve
        : AbstractFpCurve
    {
        public static readonly BigInteger q = SM2P256V1FieldElement.Q;

        private const int SM2P256V1_DEFAULT_COORDS = COORD_JACOBIAN;
        private const int SM2P256V1_FE_INTS = 8;
        private static readonly ECFieldElement[] SM2P256V1_AFFINE_ZS = new ECFieldElement[] { new SM2P256V1FieldElement(BigInteger.One) }; 

        protected readonly SM2P256V1Point m_infinity;

        public SM2P256V1Curve()
            : base(q)
        {
            this.m_infinity = new SM2P256V1Point(this, null, null);

            this.m_a = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC")));
            this.m_b = FromBigInteger(new BigInteger(1,
                Hex.DecodeStrict("28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93")));
            this.m_order = new BigInteger(1, Hex.DecodeStrict("FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123"));
            this.m_cofactor = BigInteger.One;
            this.m_coord = SM2P256V1_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new SM2P256V1Curve();
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
            return new SM2P256V1FieldElement(x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new SM2P256V1Point(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new SM2P256V1Point(this, x, y, zs);
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            uint[] table = new uint[len * SM2P256V1_FE_INTS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    Nat256.Copy(((SM2P256V1FieldElement)p.RawXCoord).x, 0, table, pos); pos += SM2P256V1_FE_INTS;
                    Nat256.Copy(((SM2P256V1FieldElement)p.RawYCoord).x, 0, table, pos); pos += SM2P256V1_FE_INTS;
                }
            }

            return new SM2P256V1LookupTable(this, table, len);
        }

        public override ECFieldElement RandomFieldElement(SecureRandom r)
        {
            uint[] x = Nat256.Create();
            SM2P256V1Field.Random(r, x);
            return new SM2P256V1FieldElement(x);
        }

        public override ECFieldElement RandomFieldElementMult(SecureRandom r)
        {
            uint[] x = Nat256.Create();
            SM2P256V1Field.RandomMult(r, x);
            return new SM2P256V1FieldElement(x);
        }

        private class SM2P256V1LookupTable
            : AbstractECLookupTable
        {
            private readonly SM2P256V1Curve m_outer;
            private readonly uint[] m_table;
            private readonly int m_size;

            internal SM2P256V1LookupTable(SM2P256V1Curve outer, uint[] table, int size)
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

                    for (int j = 0; j < SM2P256V1_FE_INTS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + SM2P256V1_FE_INTS + j] & MASK;
                    }

                    pos += (SM2P256V1_FE_INTS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                uint[] x = Nat256.Create(), y = Nat256.Create();
                int pos = index * SM2P256V1_FE_INTS * 2;

                for (int j = 0; j < SM2P256V1_FE_INTS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + SM2P256V1_FE_INTS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(uint[] x, uint[] y)
            {
                return m_outer.CreateRawPoint(new SM2P256V1FieldElement(x), new SM2P256V1FieldElement(y), SM2P256V1_AFFINE_ZS);
            }
        }
    }
}
