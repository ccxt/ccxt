using System;
using System.Collections.Generic;

using Org.BouncyCastle.Math.EC.Abc;
using Org.BouncyCastle.Math.EC.Endo;
using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Math.Field;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math.EC
{
    /// <remarks>Base class for an elliptic curve.</remarks>
    public abstract class ECCurve
    {
        public const int COORD_AFFINE = 0;
        public const int COORD_HOMOGENEOUS = 1;
        public const int COORD_JACOBIAN = 2;
        public const int COORD_JACOBIAN_CHUDNOVSKY = 3;
        public const int COORD_JACOBIAN_MODIFIED = 4;
        public const int COORD_LAMBDA_AFFINE = 5;
        public const int COORD_LAMBDA_PROJECTIVE = 6;
        public const int COORD_SKEWED = 7;

        public static int[] GetAllCoordinateSystems()
        {
            return new int[]{ COORD_AFFINE, COORD_HOMOGENEOUS, COORD_JACOBIAN, COORD_JACOBIAN_CHUDNOVSKY,
                COORD_JACOBIAN_MODIFIED, COORD_LAMBDA_AFFINE, COORD_LAMBDA_PROJECTIVE, COORD_SKEWED };
        }

        public class Config
        {
            protected ECCurve outer;
            protected int coord;
            protected ECEndomorphism endomorphism;
            protected ECMultiplier multiplier;

            internal Config(ECCurve outer, int coord, ECEndomorphism endomorphism, ECMultiplier multiplier)
            {
                this.outer = outer;
                this.coord = coord;
                this.endomorphism = endomorphism;
                this.multiplier = multiplier;
            }

            public Config SetCoordinateSystem(int coord)
            {
                this.coord = coord;
                return this;
            }

            public Config SetEndomorphism(ECEndomorphism endomorphism)
            {
                this.endomorphism = endomorphism;
                return this;
            }

            public Config SetMultiplier(ECMultiplier multiplier)
            {
                this.multiplier = multiplier;
                return this;
            }

            public ECCurve Create()
            {
                if (!outer.SupportsCoordinateSystem(coord))
                {
                    throw new InvalidOperationException("unsupported coordinate system");
                }

                ECCurve c = outer.CloneCurve();
                if (c == outer)
                {
                    throw new InvalidOperationException("implementation returned current curve");
                }

                c.m_coord = coord;
                c.m_endomorphism = endomorphism;
                c.m_multiplier = multiplier;

                return c;
            }
        }

        protected readonly IFiniteField m_field;
        protected ECFieldElement m_a, m_b;
        protected BigInteger m_order, m_cofactor;

        protected int m_coord = COORD_AFFINE;
        protected ECEndomorphism m_endomorphism = null;
        protected ECMultiplier m_multiplier = null;

        protected ECCurve(IFiniteField field)
        {
            this.m_field = field;
        }

        public abstract int FieldSize { get; }
        public abstract ECFieldElement FromBigInteger(BigInteger x);
        public abstract bool IsValidFieldElement(BigInteger x);

        public abstract ECFieldElement RandomFieldElement(SecureRandom r);

        public abstract ECFieldElement RandomFieldElementMult(SecureRandom r);

        public virtual Config Configure()
        {
            return new Config(this, this.m_coord, this.m_endomorphism, this.m_multiplier);
        }

        public virtual ECPoint ValidatePoint(BigInteger x, BigInteger y)
        {
            ECPoint p = CreatePoint(x, y);
            if (!p.IsValid())
                throw new ArgumentException("Invalid point coordinates");

            return p;
        }

        public virtual ECPoint CreatePoint(BigInteger x, BigInteger y)
        {
            return CreateRawPoint(FromBigInteger(x), FromBigInteger(y));
        }

        protected abstract ECCurve CloneCurve();

        protected internal abstract ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y);

        protected internal abstract ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs);

        protected virtual ECMultiplier CreateDefaultMultiplier()
        {
            GlvEndomorphism glvEndomorphism = m_endomorphism as GlvEndomorphism;
            if (glvEndomorphism != null)
            {
                return new GlvMultiplier(this, glvEndomorphism);
            }

            return new WNafL2RMultiplier();
        }

        public virtual bool SupportsCoordinateSystem(int coord)
        {
            return coord == COORD_AFFINE;
        }

        public virtual PreCompInfo GetPreCompInfo(ECPoint point, string name)
        {
            CheckPoint(point);

            IDictionary<string, PreCompInfo> table;
            lock (point)
            {
                table = point.m_preCompTable;
            }

            if (null == table)
                return null;

            lock (table)
            {
                return table.TryGetValue(name, out var preCompInfo) ? preCompInfo : null;
            }
        }

        /**
         * Compute a <code>PreCompInfo</code> for a point on this curve, under a given name. Used by
         * <code>ECMultiplier</code>s to save the precomputation for this <code>ECPoint</code> for use
         * by subsequent multiplication.
         * 
         * @param point
         *            The <code>ECPoint</code> to store precomputations for.
         * @param name
         *            A <code>String</code> used to index precomputations of different types.
         * @param callback
         *            Called to calculate the <code>PreCompInfo</code>.
         */
        public virtual PreCompInfo Precompute(ECPoint point, string name, IPreCompCallback callback)
        {
            CheckPoint(point);

            IDictionary<string, PreCompInfo> table;
            lock (point)
            {
                table = point.m_preCompTable;
                if (null == table)
                {
                    point.m_preCompTable = table = new Dictionary<string, PreCompInfo>();
                }
            }

            lock (table)
            {
                PreCompInfo existing = table.TryGetValue(name, out var preCompInfo) ? preCompInfo : null;
                PreCompInfo result = callback.Precompute(existing);

                if (result != existing)
                {
                    table[name] = result;
                }

                return result;
            }
        }

        public virtual ECPoint ImportPoint(ECPoint p)
        {
            if (this == p.Curve)
            {
                return p;
            }
            if (p.IsInfinity)
            {
                return Infinity;
            }

            // TODO Default behaviour could be improved if the two curves have the same coordinate system by copying any Z coordinates.
            p = p.Normalize();

            return CreatePoint(p.XCoord.ToBigInteger(), p.YCoord.ToBigInteger());
        }

        /**
         * Normalization ensures that any projective coordinate is 1, and therefore that the x, y
         * coordinates reflect those of the equivalent point in an affine coordinate system. Where more
         * than one point is to be normalized, this method will generally be more efficient than
         * normalizing each point separately.
         * 
         * @param points
         *            An array of points that will be updated in place with their normalized versions,
         *            where necessary
         */
        public virtual void NormalizeAll(ECPoint[] points)
        {
            NormalizeAll(points, 0, points.Length, null);
        }

        /**
         * Normalization ensures that any projective coordinate is 1, and therefore that the x, y
         * coordinates reflect those of the equivalent point in an affine coordinate system. Where more
         * than one point is to be normalized, this method will generally be more efficient than
         * normalizing each point separately. An (optional) z-scaling factor can be applied; effectively
         * each z coordinate is scaled by this value prior to normalization (but only one
         * actual multiplication is needed).
         * 
         * @param points
         *            An array of points that will be updated in place with their normalized versions,
         *            where necessary
         * @param off
         *            The start of the range of points to normalize
         * @param len
         *            The length of the range of points to normalize
         * @param iso
         *            The (optional) z-scaling factor - can be null
         */
        public virtual void NormalizeAll(ECPoint[] points, int off, int len, ECFieldElement iso)
        {
            CheckPoints(points, off, len);

            switch (this.CoordinateSystem)
            {
                case ECCurve.COORD_AFFINE:
                case ECCurve.COORD_LAMBDA_AFFINE:
                {
                    if (iso != null)
                        throw new ArgumentException("not valid for affine coordinates", "iso");

                    return;
                }
            }

            /*
             * Figure out which of the points actually need to be normalized
             */
            ECFieldElement[] zs = new ECFieldElement[len];
            int[] indices = new int[len];
            int count = 0;
            for (int i = 0; i < len; ++i)
            {
                ECPoint p = points[off + i];
                if (null != p && (iso != null || !p.IsNormalized()))
                {
                    zs[count] = p.GetZCoord(0);
                    indices[count++] = off + i;
                }
            }

            if (count == 0)
            {
                return;
            }

            ECAlgorithms.MontgomeryTrick(zs, 0, count, iso);

            for (int j = 0; j < count; ++j)
            {
                int index = indices[j];
                points[index] = points[index].Normalize(zs[j]);
            }
        }

        public abstract ECPoint Infinity { get; }

        public virtual IFiniteField Field
        {
            get { return m_field; }
        }

        public virtual ECFieldElement A
        {
            get { return m_a; }
        }

        public virtual ECFieldElement B
        {
            get { return m_b; }
        }

        public virtual BigInteger Order
        {
            get { return m_order; }
        }

        public virtual BigInteger Cofactor
        {
            get { return m_cofactor; }
        }

        public virtual int CoordinateSystem
        {
            get { return m_coord; }
        }

        /**
         * Create a cache-safe lookup table for the specified sequence of points. All the points MUST
         * belong to this <code>ECCurve</code> instance, and MUST already be normalized.
         */
        public virtual ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            int FE_BYTES = (FieldSize + 7) / 8;
            byte[] table = new byte[len * FE_BYTES * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    byte[] px = p.RawXCoord.ToBigInteger().ToByteArray();
                    byte[] py = p.RawYCoord.ToBigInteger().ToByteArray();

                    int pxStart = px.Length > FE_BYTES ? 1 : 0, pxLen = px.Length - pxStart;
                    int pyStart = py.Length > FE_BYTES ? 1 : 0, pyLen = py.Length - pyStart;

                    Array.Copy(px, pxStart, table, pos + FE_BYTES - pxLen, pxLen); pos += FE_BYTES;
                    Array.Copy(py, pyStart, table, pos + FE_BYTES - pyLen, pyLen); pos += FE_BYTES;
                }
            }

            return new DefaultLookupTable(this, table, len);
        }

        protected virtual void CheckPoint(ECPoint point)
        {
            if (null == point || (this != point.Curve))
                throw new ArgumentException("must be non-null and on this curve", "point");
        }

        protected virtual void CheckPoints(ECPoint[] points)
        {
            CheckPoints(points, 0, points.Length);
        }

        protected virtual void CheckPoints(ECPoint[] points, int off, int len)
        {
            if (points == null)
                throw new ArgumentNullException("points");
            if (off < 0 || len < 0 || (off > (points.Length - len)))
                throw new ArgumentException("invalid range specified", "points");

            for (int i = 0; i < len; ++i)
            {
                ECPoint point = points[off + i];
                if (null != point && this != point.Curve)
                    throw new ArgumentException("entries must be null or on this curve", "points");
            }
        }

        public virtual bool Equals(ECCurve other)
        {
            if (this == other)
                return true;
            if (null == other)
                return false;
            return Field.Equals(other.Field)
                && A.ToBigInteger().Equals(other.A.ToBigInteger())
                && B.ToBigInteger().Equals(other.B.ToBigInteger());
        }

        public override bool Equals(object obj) 
        {
            return Equals(obj as ECCurve);
        }

        public override int GetHashCode()
        {
            return Field.GetHashCode()
                ^ Integers.RotateLeft(A.ToBigInteger().GetHashCode(), 8)
                ^ Integers.RotateLeft(B.ToBigInteger().GetHashCode(), 16);
        }

        protected abstract ECPoint DecompressPoint(int yTilde, BigInteger X1);

        public virtual ECEndomorphism GetEndomorphism()
        {
            return m_endomorphism;
        }

        /**
         * Sets the default <code>ECMultiplier</code>, unless already set.
         *
         * We avoid locking for performance reasons, so there is no uniqueness guarantee.
         */
        public virtual ECMultiplier GetMultiplier()
        {
            if (this.m_multiplier == null)
            {
                this.m_multiplier = CreateDefaultMultiplier();
            }
            return this.m_multiplier;
        }

        /**
         * Decode a point on this curve from its ASN.1 encoding. The different
         * encodings are taken account of, including point compression for
         * <code>F<sub>p</sub></code> (X9.62 s 4.2.1 pg 17).
         * @return The decoded point.
         */
        public virtual ECPoint DecodePoint(byte[] encoded)
        {
            ECPoint p = null;
            int expectedLength = (FieldSize + 7) / 8;

            byte type = encoded[0];
            switch (type)
            {
                case 0x00: // infinity
                {
                    if (encoded.Length != 1)
                        throw new ArgumentException("Incorrect length for infinity encoding", "encoded");

                    p = Infinity;
                    break;
                }

                case 0x02: // compressed
                case 0x03: // compressed
                {
                    if (encoded.Length != (expectedLength + 1))
                        throw new ArgumentException("Incorrect length for compressed encoding", "encoded");

                    int yTilde = type & 1;
                    BigInteger X = new BigInteger(1, encoded, 1, expectedLength);

                    p = DecompressPoint(yTilde, X);
                    if (!p.ImplIsValid(true, true))
                        throw new ArgumentException("Invalid point");

                    break;
                }

                case 0x04: // uncompressed
                {
                    if (encoded.Length != (2 * expectedLength + 1))
                        throw new ArgumentException("Incorrect length for uncompressed encoding", "encoded");

                    BigInteger X = new BigInteger(1, encoded, 1, expectedLength);
                    BigInteger Y = new BigInteger(1, encoded, 1 + expectedLength, expectedLength);

                    p = ValidatePoint(X, Y);
                    break;
                }

                case 0x06: // hybrid
                case 0x07: // hybrid
                {
                    if (encoded.Length != (2 * expectedLength + 1))
                        throw new ArgumentException("Incorrect length for hybrid encoding", "encoded");

                    BigInteger X = new BigInteger(1, encoded, 1, expectedLength);
                    BigInteger Y = new BigInteger(1, encoded, 1 + expectedLength, expectedLength);

                    if (Y.TestBit(0) != (type == 0x07))
                        throw new ArgumentException("Inconsistent Y coordinate in hybrid encoding", "encoded");

                    p = ValidatePoint(X, Y);
                    break;
                }

                default:
                    throw new FormatException("Invalid point encoding " + type);
            }

            if (type != 0x00 && p.IsInfinity)
                throw new ArgumentException("Invalid infinity encoding", "encoded");

            return p;
        }

        private class DefaultLookupTable
            : AbstractECLookupTable
        {
            private readonly ECCurve m_outer;
            private readonly byte[] m_table;
            private readonly int m_size;

            internal DefaultLookupTable(ECCurve outer, byte[] table, int size)
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
                int FE_BYTES = (m_outer.FieldSize + 7) / 8;
                byte[] x = new byte[FE_BYTES], y = new byte[FE_BYTES];
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    byte MASK = (byte)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < FE_BYTES; ++j)
                    {
                        x[j] ^= (byte)(m_table[pos + j] & MASK);
                        y[j] ^= (byte)(m_table[pos + FE_BYTES + j] & MASK);
                    }

                    pos += (FE_BYTES * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                int FE_BYTES = (m_outer.FieldSize + 7) / 8;
                byte[] x = new byte[FE_BYTES], y = new byte[FE_BYTES];
                int pos = index * FE_BYTES * 2;

                for (int j = 0; j < FE_BYTES; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + FE_BYTES + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(byte[] x, byte[] y)
            {
                ECFieldElement X = m_outer.FromBigInteger(new BigInteger(1, x));
                ECFieldElement Y = m_outer.FromBigInteger(new BigInteger(1, y));
                return m_outer.CreateRawPoint(X, Y);
            }
        }
    }

    public abstract class AbstractFpCurve
        : ECCurve
    {
        protected AbstractFpCurve(BigInteger q)
            : base(FiniteFields.GetPrimeField(q))
        {
        }

        public override bool IsValidFieldElement(BigInteger x)
        {
            return x != null && x.SignValue >= 0 && x.CompareTo(Field.Characteristic) < 0;
        }

        public override ECFieldElement RandomFieldElement(SecureRandom r)
        {
            /*
             * NOTE: BigInteger comparisons in the rejection sampling are not constant-time, so we
             * use the product of two independent elements to mitigate side-channels.
             */
            BigInteger p = Field.Characteristic;
            ECFieldElement fe1 = FromBigInteger(ImplRandomFieldElement(r, p));
            ECFieldElement fe2 = FromBigInteger(ImplRandomFieldElement(r, p));
            return fe1.Multiply(fe2);
        }

        public override ECFieldElement RandomFieldElementMult(SecureRandom r)
        {
            /*
             * NOTE: BigInteger comparisons in the rejection sampling are not constant-time, so we
             * use the product of two independent elements to mitigate side-channels.
             */
            BigInteger p = Field.Characteristic;
            ECFieldElement fe1 = FromBigInteger(ImplRandomFieldElementMult(r, p));
            ECFieldElement fe2 = FromBigInteger(ImplRandomFieldElementMult(r, p));
            return fe1.Multiply(fe2);
        }

        protected override ECPoint DecompressPoint(int yTilde, BigInteger X1)
        {
            ECFieldElement x = FromBigInteger(X1);
            ECFieldElement rhs = x.Square().Add(A).Multiply(x).Add(B);
            ECFieldElement y = rhs.Sqrt();

            /*
             * If y is not a square, then we haven't got a point on the curve
             */
            if (y == null)
                throw new ArgumentException("Invalid point compression");

            if (y.TestBitZero() != (yTilde == 1))
            {
                // Use the other root
                y = y.Negate();
            }

            return CreateRawPoint(x, y);
        }

        private static BigInteger ImplRandomFieldElement(SecureRandom r, BigInteger p)
        {
            BigInteger x;
            do
            {
                x = BigIntegers.CreateRandomBigInteger(p.BitLength, r);
            }
            while (x.CompareTo(p) >= 0);
            return x;
        }

        private static BigInteger ImplRandomFieldElementMult(SecureRandom r, BigInteger p)
        {
            BigInteger x;
            do
            {
                x = BigIntegers.CreateRandomBigInteger(p.BitLength, r);
            }
            while (x.SignValue <= 0 || x.CompareTo(p) >= 0);
            return x;
        }
    }

    /**
     * Elliptic curve over Fp
     */
    public class FpCurve
        : AbstractFpCurve
    {
        private const int FP_DEFAULT_COORDS = COORD_JACOBIAN_MODIFIED;

        private static readonly HashSet<BigInteger> KnownQs = new HashSet<BigInteger>();
        private static readonly SecureRandom random = new SecureRandom();

        protected readonly BigInteger m_q, m_r;
        protected readonly FpPoint m_infinity;

        [Obsolete("Use constructor taking order/cofactor")]
        public FpCurve(BigInteger q, BigInteger a, BigInteger b)
            : this(q, a, b, null, null)
        {
        }

        public FpCurve(BigInteger q, BigInteger a, BigInteger b, BigInteger order, BigInteger cofactor)
            : this(q, a, b, order, cofactor, false)
        {
        }

        internal FpCurve(BigInteger q, BigInteger a, BigInteger b, BigInteger order, BigInteger cofactor, bool isInternal)
            : base(q)
        {
            if (!isInternal)
            {
                bool unknownQ;
                lock (KnownQs) unknownQ = !KnownQs.Contains(q);

                if (unknownQ)
                {
                    int maxBitLength = AsInteger("Org.BouncyCastle.EC.Fp_MaxSize", 1042); // 2 * 521
                    int certainty = AsInteger("Org.BouncyCastle.EC.Fp_Certainty", 100);

                    int qBitLength = q.BitLength;
                    if (maxBitLength < qBitLength)
                        throw new ArgumentException("Fp q value out of range");

                    if (Primes.HasAnySmallFactors(q) ||
                        !Primes.IsMRProbablePrime(q, random, GetNumberOfIterations(qBitLength, certainty)))
                    {
                        throw new ArgumentException("Fp q value not prime");
                    }
                }
            }

            lock (KnownQs) KnownQs.Add(q);
            this.m_q = q;

            this.m_r = FpFieldElement.CalculateResidue(q);
            this.m_infinity = new FpPoint(this, null, null);

            this.m_a = FromBigInteger(a);
            this.m_b = FromBigInteger(b);
            this.m_order = order;
            this.m_cofactor = cofactor;
            this.m_coord = FP_DEFAULT_COORDS;
        }

        internal FpCurve(BigInteger q, BigInteger r, ECFieldElement a, ECFieldElement b, BigInteger order,
            BigInteger cofactor)
            : base(q)
        {
            this.m_q = q;
            this.m_r = r;
            this.m_infinity = new FpPoint(this, null, null);

            this.m_a = a;
            this.m_b = b;
            this.m_order = order;
            this.m_cofactor = cofactor;
            this.m_coord = FP_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new FpCurve(m_q, m_r, m_a, m_b, m_order, m_cofactor);
        }

        public override bool SupportsCoordinateSystem(int coord)
        {
            switch (coord)
            {
                case COORD_AFFINE:
                case COORD_HOMOGENEOUS:
                case COORD_JACOBIAN:
                case COORD_JACOBIAN_MODIFIED:
                    return true;
                default:
                    return false;
            }
        }

        public virtual BigInteger Q
        {
            get { return m_q; }
        }

        public override ECPoint Infinity
        {
            get { return m_infinity; }
        }

        public override int FieldSize
        {
            get { return m_q.BitLength; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.CompareTo(m_q) >= 0)
                throw new ArgumentException("value invalid for Fp field element", "x");

            return new FpFieldElement(this.m_q, this.m_r, x);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new FpPoint(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new FpPoint(this, x, y, zs);
        }

        public override ECPoint ImportPoint(ECPoint p)
        {
            if (this != p.Curve && this.CoordinateSystem == COORD_JACOBIAN && !p.IsInfinity)
            {
                switch (p.Curve.CoordinateSystem)
                {
                    case COORD_JACOBIAN:
                    case COORD_JACOBIAN_CHUDNOVSKY:
                    case COORD_JACOBIAN_MODIFIED:
                        return new FpPoint(this,
                            FromBigInteger(p.RawXCoord.ToBigInteger()),
                            FromBigInteger(p.RawYCoord.ToBigInteger()),
                            new ECFieldElement[] { FromBigInteger(p.GetZCoord(0).ToBigInteger()) });
                    default:
                        break;
                }
            }

            return base.ImportPoint(p);
        }

        private int GetNumberOfIterations(int bits, int certainty)
        {
            /*
             * NOTE: We enforce a minimum 'certainty' of 100 for bits >= 1024 (else 80). Where the
             * certainty is higher than the FIPS 186-4 tables (C.2/C.3) cater to, extra iterations
             * are added at the "worst case rate" for the excess.
             */
            if (bits >= 1536)
            {
                return  certainty <= 100 ? 3
                    :   certainty <= 128 ? 4
                    :   4 + (certainty - 128 + 1) / 2;
            }
            else if (bits >= 1024)
            {
                return  certainty <= 100 ? 4
                    :   certainty <= 112 ? 5
                    :   5 + (certainty - 112 + 1) / 2;
            }
            else if (bits >= 512)
            {
                return  certainty <= 80  ? 5
                    :   certainty <= 100 ? 7
                    :   7 + (certainty - 100 + 1) / 2;
            }
            else
            {
                return  certainty <= 80  ? 40
                    :   40 + (certainty - 80 + 1) / 2;
            }
        }

        int AsInteger(string envVariable, int defaultValue)
        {
            string v = Platform.GetEnvironmentVariable(envVariable);

            if (v == null)
            {
                return defaultValue;
            }

            return int.Parse(v);
        }
    }

    public abstract class AbstractF2mCurve
        : ECCurve
    {
        public static BigInteger Inverse(int m, int[] ks, BigInteger x)
        {
            return new LongArray(x).ModInverse(m, ks).ToBigInteger();
        }

        /**
         * The auxiliary values <code>s<sub>0</sub></code> and
         * <code>s<sub>1</sub></code> used for partial modular reduction for
         * Koblitz curves.
         */
        private BigInteger[] si = null;

        private static IFiniteField BuildField(int m, int k1, int k2, int k3)
        {
            int[] exponents = (k2 | k3) == 0
                ? new int[]{ 0, k1, m }
                : new int[]{ 0, k1, k2, k3, m };

            return FiniteFields.GetBinaryExtensionField(exponents);
        }

        protected AbstractF2mCurve(int m, int k1, int k2, int k3)
            : base(BuildField(m, k1, k2, k3))
        {
        }

        public override ECPoint CreatePoint(BigInteger x, BigInteger y)
        {
            ECFieldElement X = FromBigInteger(x), Y = FromBigInteger(y);

            switch (this.CoordinateSystem)
            {
                case COORD_LAMBDA_AFFINE:
                case COORD_LAMBDA_PROJECTIVE:
                {
                    if (X.IsZero)
                    {
                        if (!Y.Square().Equals(B))
                            throw new ArgumentException();
                    }
                    else
                    {
                        // Y becomes Lambda (X + Y/X) here
                        Y = Y.Divide(X).Add(X);
                    }
                    break;
                }
                default:
                {
                    break;
                }
            }

            return CreateRawPoint(X, Y);
        }

        public override bool IsValidFieldElement(BigInteger x)
        {
            return x != null && x.SignValue >= 0 && x.BitLength <= FieldSize;
        }

        public override ECFieldElement RandomFieldElement(SecureRandom r)
        {
            int m = FieldSize;
            return FromBigInteger(BigIntegers.CreateRandomBigInteger(m, r));
        }

        public override ECFieldElement RandomFieldElementMult(SecureRandom r)
        {
            /*
             * NOTE: BigInteger comparisons in the rejection sampling are not constant-time, so we
             * use the product of two independent elements to mitigate side-channels.
             */
            int m = FieldSize;
            ECFieldElement fe1 = FromBigInteger(ImplRandomFieldElementMult(r, m));
            ECFieldElement fe2 = FromBigInteger(ImplRandomFieldElementMult(r, m));
            return fe1.Multiply(fe2);
        }

        protected override ECPoint DecompressPoint(int yTilde, BigInteger X1)
        {
            ECFieldElement xp = FromBigInteger(X1), yp = null;
            if (xp.IsZero)
            {
                yp = B.Sqrt();
            }
            else
            {
                ECFieldElement beta = xp.Square().Invert().Multiply(B).Add(A).Add(xp);
                ECFieldElement z = SolveQuadraticEquation(beta);

                if (z != null)
                {
                    if (z.TestBitZero() != (yTilde == 1))
                    {
                        z = z.AddOne();
                    }

                    switch (this.CoordinateSystem)
                    {
                        case COORD_LAMBDA_AFFINE:
                        case COORD_LAMBDA_PROJECTIVE:
                        {
                            yp = z.Add(xp);
                            break;
                        }
                        default:
                        {
                            yp = z.Multiply(xp);
                            break;
                        }
                    }
                }
            }

            if (yp == null)
                throw new ArgumentException("Invalid point compression");

            return CreateRawPoint(xp, yp);
        }

        /**
         * Solves a quadratic equation <code>z<sup>2</sup> + z = beta</code>(X9.62
         * D.1.6) The other solution is <code>z + 1</code>.
         *
         * @param beta
         *            The value to solve the quadratic equation for.
         * @return the solution for <code>z<sup>2</sup> + z = beta</code> or
         *         <code>null</code> if no solution exists.
         */
        internal ECFieldElement SolveQuadraticEquation(ECFieldElement beta)
        {
            AbstractF2mFieldElement betaF2m = (AbstractF2mFieldElement)beta;

            bool fastTrace = betaF2m.HasFastTrace;
            if (fastTrace && 0 != betaF2m.Trace())
                return null;

            int m = FieldSize;

            // For odd m, use the half-trace 
            if (0 != (m & 1))
            {
                ECFieldElement r = betaF2m.HalfTrace();
                if (fastTrace || r.Square().Add(r).Add(beta).IsZero)
                    return r;

                return null;
            }

            if (beta.IsZero)
                return beta;

            ECFieldElement gamma, z, zeroElement = FromBigInteger(BigInteger.Zero);

            do
            {
                ECFieldElement t = FromBigInteger(BigInteger.Arbitrary(m));
                z = zeroElement;
                ECFieldElement w = beta;
                for (int i = 1; i < m; i++)
                {
                    ECFieldElement w2 = w.Square();
                    z = z.Square().Add(w2.Multiply(t));
                    w = w2.Add(beta);
                }
                if (!w.IsZero)
                {
                    return null;
                }
                gamma = z.Square().Add(z);
            }
            while (gamma.IsZero);

            return z;
        }

        /**
         * @return the auxiliary values <code>s<sub>0</sub></code> and
         * <code>s<sub>1</sub></code> used for partial modular reduction for
         * Koblitz curves.
         */
        internal virtual BigInteger[] GetSi()
        {
            if (si == null)
            {
                lock (this)
                {
                    if (si == null)
                    {
                        si = Tnaf.GetSi(this);
                    }
                }
            }
            return si;
        }

        /**
         * Returns true if this is a Koblitz curve (ABC curve).
         * @return true if this is a Koblitz curve (ABC curve), false otherwise
         */
        public virtual bool IsKoblitz
        {
            get
            {
                return m_order != null && m_cofactor != null && m_b.IsOne && (m_a.IsZero || m_a.IsOne);
            }
        }

        private static BigInteger ImplRandomFieldElementMult(SecureRandom r, int m)
        {
            BigInteger x;
            do
            {
                x = BigIntegers.CreateRandomBigInteger(m, r);
            }
            while (x.SignValue <= 0);
            return x;
        }
    }

    /**
     * Elliptic curves over F2m. The Weierstrass equation is given by
     * <code>y<sup>2</sup> + xy = x<sup>3</sup> + ax<sup>2</sup> + b</code>.
     */
    public class F2mCurve
        : AbstractF2mCurve
    {
        private const int F2M_DEFAULT_COORDS = COORD_LAMBDA_PROJECTIVE;

        /**
         * The exponent <code>m</code> of <code>F<sub>2<sup>m</sup></sub></code>.
         */
        private readonly int m;

        /**
         * TPB: The integer <code>k</code> where <code>x<sup>m</sup> +
         * x<sup>k</sup> + 1</code> represents the reduction polynomial
         * <code>f(z)</code>.<br/>
         * PPB: The integer <code>k1</code> where <code>x<sup>m</sup> +
         * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
         * represents the reduction polynomial <code>f(z)</code>.<br/>
         */
        private readonly int k1;

        /**
         * TPB: Always set to <code>0</code><br/>
         * PPB: The integer <code>k2</code> where <code>x<sup>m</sup> +
         * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
         * represents the reduction polynomial <code>f(z)</code>.<br/>
         */
        private readonly int k2;

        /**
         * TPB: Always set to <code>0</code><br/>
         * PPB: The integer <code>k3</code> where <code>x<sup>m</sup> +
         * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
         * represents the reduction polynomial <code>f(z)</code>.<br/>
         */
        private readonly int k3;

        /**
         * The point at infinity on this curve.
         */
        protected readonly F2mPoint m_infinity;

        /**
         * Constructor for Trinomial Polynomial Basis (TPB).
         * @param m  The exponent <code>m</code> of
         * <code>F<sub>2<sup>m</sup></sub></code>.
         * @param k The integer <code>k</code> where <code>x<sup>m</sup> +
         * x<sup>k</sup> + 1</code> represents the reduction
         * polynomial <code>f(z)</code>.
         * @param a The coefficient <code>a</code> in the Weierstrass equation
         * for non-supersingular elliptic curves over
         * <code>F<sub>2<sup>m</sup></sub></code>.
         * @param b The coefficient <code>b</code> in the Weierstrass equation
         * for non-supersingular elliptic curves over
         * <code>F<sub>2<sup>m</sup></sub></code>.
         */
        [Obsolete("Use constructor taking order/cofactor")]
        public F2mCurve(
            int			m,
            int			k,
            BigInteger	a,
            BigInteger	b)
            : this(m, k, 0, 0, a, b, null, null)
        {
        }

        /**
         * Constructor for Trinomial Polynomial Basis (TPB).
         * @param m  The exponent <code>m</code> of
         * <code>F<sub>2<sup>m</sup></sub></code>.
         * @param k The integer <code>k</code> where <code>x<sup>m</sup> +
         * x<sup>k</sup> + 1</code> represents the reduction
         * polynomial <code>f(z)</code>.
         * @param a The coefficient <code>a</code> in the Weierstrass equation
         * for non-supersingular elliptic curves over
         * <code>F<sub>2<sup>m</sup></sub></code>.
         * @param b The coefficient <code>b</code> in the Weierstrass equation
         * for non-supersingular elliptic curves over
         * <code>F<sub>2<sup>m</sup></sub></code>.
         * @param order The order of the main subgroup of the elliptic curve.
         * @param cofactor The cofactor of the elliptic curve, i.e.
         * <code>#E<sub>a</sub>(F<sub>2<sup>m</sup></sub>) = h * n</code>.
         */
        public F2mCurve(
            int			m, 
            int			k, 
            BigInteger	a, 
            BigInteger	b,
            BigInteger	order,
            BigInteger	cofactor)
            : this(m, k, 0, 0, a, b, order, cofactor)
        {
        }

        /**
         * Constructor for Pentanomial Polynomial Basis (PPB).
         * @param m  The exponent <code>m</code> of
         * <code>F<sub>2<sup>m</sup></sub></code>.
         * @param k1 The integer <code>k1</code> where <code>x<sup>m</sup> +
         * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
         * represents the reduction polynomial <code>f(z)</code>.
         * @param k2 The integer <code>k2</code> where <code>x<sup>m</sup> +
         * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
         * represents the reduction polynomial <code>f(z)</code>.
         * @param k3 The integer <code>k3</code> where <code>x<sup>m</sup> +
         * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
         * represents the reduction polynomial <code>f(z)</code>.
         * @param a The coefficient <code>a</code> in the Weierstrass equation
         * for non-supersingular elliptic curves over
         * <code>F<sub>2<sup>m</sup></sub></code>.
         * @param b The coefficient <code>b</code> in the Weierstrass equation
         * for non-supersingular elliptic curves over
         * <code>F<sub>2<sup>m</sup></sub></code>.
         */
        [Obsolete("Use constructor taking order/cofactor")]
        public F2mCurve(
            int			m,
            int			k1,
            int			k2,
            int			k3,
            BigInteger	a,
            BigInteger	b)
            : this(m, k1, k2, k3, a, b, null, null)
        {
        }

        /**
         * Constructor for Pentanomial Polynomial Basis (PPB).
         * @param m  The exponent <code>m</code> of
         * <code>F<sub>2<sup>m</sup></sub></code>.
         * @param k1 The integer <code>k1</code> where <code>x<sup>m</sup> +
         * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
         * represents the reduction polynomial <code>f(z)</code>.
         * @param k2 The integer <code>k2</code> where <code>x<sup>m</sup> +
         * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
         * represents the reduction polynomial <code>f(z)</code>.
         * @param k3 The integer <code>k3</code> where <code>x<sup>m</sup> +
         * x<sup>k3</sup> + x<sup>k2</sup> + x<sup>k1</sup> + 1</code>
         * represents the reduction polynomial <code>f(z)</code>.
         * @param a The coefficient <code>a</code> in the Weierstrass equation
         * for non-supersingular elliptic curves over
         * <code>F<sub>2<sup>m</sup></sub></code>.
         * @param b The coefficient <code>b</code> in the Weierstrass equation
         * for non-supersingular elliptic curves over
         * <code>F<sub>2<sup>m</sup></sub></code>.
         * @param order The order of the main subgroup of the elliptic curve.
         * @param cofactor The cofactor of the elliptic curve, i.e.
         * <code>#E<sub>a</sub>(F<sub>2<sup>m</sup></sub>) = h * n</code>.
         */
        public F2mCurve(int m, int k1, int k2, int k3, BigInteger a, BigInteger b, BigInteger order,
            BigInteger cofactor)
            : base(m, k1, k2, k3)
        {
            this.m = m;
            this.k1 = k1;
            this.k2 = k2;
            this.k3 = k3;
            this.m_order = order;
            this.m_cofactor = cofactor;
            this.m_infinity = new F2mPoint(this, null, null);

            this.m_a = FromBigInteger(a);
            this.m_b = FromBigInteger(b);
            this.m_coord = F2M_DEFAULT_COORDS;
        }

        internal F2mCurve(int m, int k1, int k2, int k3, ECFieldElement a, ECFieldElement b, BigInteger order,
            BigInteger cofactor)
            : base(m, k1, k2, k3)
        {
            this.m = m;
            this.k1 = k1;
            this.k2 = k2;
            this.k3 = k3;
            this.m_order = order;
            this.m_cofactor = cofactor;
            this.m_infinity = new F2mPoint(this, null, null);

            this.m_a = a;
            this.m_b = b;
            this.m_coord = F2M_DEFAULT_COORDS;
        }

        protected override ECCurve CloneCurve()
        {
            return new F2mCurve(m, k1, k2, k3, m_a, m_b, m_order, m_cofactor);
        }

        public override bool SupportsCoordinateSystem(int coord)
        {
            switch (coord)
            {
                case COORD_AFFINE:
                case COORD_HOMOGENEOUS:
                case COORD_LAMBDA_PROJECTIVE:
                    return true;
                default:
                    return false;
            }
        }

        protected override ECMultiplier CreateDefaultMultiplier()
        {
            if (IsKoblitz)
            {
                return new WTauNafMultiplier();
            }

            return base.CreateDefaultMultiplier();
        }

        public override int FieldSize
        {
            get { return m; }
        }

        public override ECFieldElement FromBigInteger(BigInteger x)
        {
            if (x == null || x.SignValue < 0 || x.BitLength > m)
                throw new ArgumentException("value invalid for F2m field element", "x");

            int[] ks = (k2 | k3) == 0
                ? new int[]{ k1 }
                : new int[]{ k1, k2, k3 };

            return new F2mFieldElement(m, ks, new LongArray(x));
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y)
        {
            return new F2mPoint(this, x, y);
        }

        protected internal override ECPoint CreateRawPoint(ECFieldElement x, ECFieldElement y, ECFieldElement[] zs)
        {
            return new F2mPoint(this, x, y, zs);
        }

        public override ECPoint Infinity
        {
            get { return m_infinity; }
        }

        public int M
        {
            get { return m; }
        }

        /**
         * Return true if curve uses a Trinomial basis.
         *
         * @return true if curve Trinomial, false otherwise.
         */
        public bool IsTrinomial()
        {
            return k2 == 0 && k3 == 0;
        }

        public int K1
        {
            get { return k1; }
        }

        public int K2
        {
            get { return k2; }
        }

        public int K3
        {
            get { return k3; }
        }

        public override ECLookupTable CreateCacheSafeLookupTable(ECPoint[] points, int off, int len)
        {
            int FE_LONGS = (m + 63) / 64;

            ulong[] table = new ulong[len * FE_LONGS * 2];
            {
                int pos = 0;
                for (int i = 0; i < len; ++i)
                {
                    ECPoint p = points[off + i];
                    ((F2mFieldElement)p.RawXCoord).x.CopyTo(table, pos); pos += FE_LONGS;
                    ((F2mFieldElement)p.RawYCoord).x.CopyTo(table, pos); pos += FE_LONGS;
                }
            }

            return new DefaultF2mLookupTable(this, table, len);
        }

        private class DefaultF2mLookupTable
            : AbstractECLookupTable
        {
            private readonly F2mCurve m_outer;
            private readonly ulong[] m_table;
            private readonly int m_size;

            internal DefaultF2mLookupTable(F2mCurve outer, ulong[] table, int size)
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
                int FE_LONGS = (m_outer.m + 63) / 64;
                ulong[] x = new ulong[FE_LONGS], y = new ulong[FE_LONGS];
                int pos = 0;

                for (int i = 0; i < m_size; ++i)
                {
                    ulong MASK = (ulong)(long)(((i ^ index) - 1) >> 31);

                    for (int j = 0; j < FE_LONGS; ++j)
                    {
                        x[j] ^= m_table[pos + j] & MASK;
                        y[j] ^= m_table[pos + FE_LONGS + j] & MASK;
                    }

                    pos += (FE_LONGS * 2);
                }

                return CreatePoint(x, y);
            }

            public override ECPoint LookupVar(int index)
            {
                int FE_LONGS = (m_outer.m + 63) / 64;
                ulong[] x = new ulong[FE_LONGS], y = new ulong[FE_LONGS];
                int pos = index * FE_LONGS * 2;

                for (int j = 0; j < FE_LONGS; ++j)
                {
                    x[j] = m_table[pos + j];
                    y[j] = m_table[pos + FE_LONGS + j];
                }

                return CreatePoint(x, y);
            }

            private ECPoint CreatePoint(ulong[] x, ulong[] y)
            {
                int m = m_outer.m;
                int[] ks = m_outer.IsTrinomial()
                    ? new int[]{ m_outer.k1 }
                    : new int[]{ m_outer.k1, m_outer.k2, m_outer.k3 }; 

                ECFieldElement X = new F2mFieldElement(m, ks, new LongArray(x));
                ECFieldElement Y = new F2mFieldElement(m, ks, new LongArray(y));
                return m_outer.CreateRawPoint(X, Y);
            }
        }
    }
}
