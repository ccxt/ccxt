using System;

using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class ECDomainParameters
    {
        private readonly ECCurve     curve;
        private readonly byte[] seed;
        private readonly ECPoint g;
        private readonly BigInteger n;
        private readonly BigInteger h;

        private BigInteger hInv;

        public ECDomainParameters(X9ECParameters x9)
            : this(x9.Curve, x9.G, x9.N, x9.H, x9.GetSeed())
        {
        }

        public ECDomainParameters(
            ECCurve     curve,
            ECPoint     g,
            BigInteger  n)
            : this(curve, g, n, BigInteger.One, null)
        {
        }

        public ECDomainParameters(
            ECCurve     curve,
            ECPoint     g,
            BigInteger  n,
            BigInteger  h)
            : this(curve, g, n, h, null)
        {
        }

        public ECDomainParameters(
            ECCurve     curve,
            ECPoint     g,
            BigInteger  n,
            BigInteger  h,
            byte[]      seed)
        {
            if (curve == null)
                throw new ArgumentNullException("curve");
            if (g == null)
                throw new ArgumentNullException("g");
            if (n == null)
                throw new ArgumentNullException("n");
            // we can't check for h == null here as h is optional in X9.62 as it is not required for ECDSA

            this.curve = curve;
            this.g = ValidatePublicPoint(curve, g);
            this.n = n;
            this.h = h;
            this.seed = Arrays.Clone(seed);
        }

        public ECCurve Curve
        {
            get { return curve; }
        }

        public ECPoint G
        {
            get { return g; }
        }

        public BigInteger N
        {
            get { return n; }
        }

        public BigInteger H
        {
            get { return h; }
        }

        public BigInteger HInv
        {
            get
            {
                lock (this)
                {
                    if (hInv == null)
                    {
                        hInv = BigIntegers.ModOddInverseVar(n, h);
                    }
                    return hInv;
                }
            }
        }

        public byte[] GetSeed()
        {
            return Arrays.Clone(seed);
        }

        public override bool Equals(
            object obj)
        {
            if (obj == this)
                return true;

            ECDomainParameters other = obj as ECDomainParameters;

            if (other == null)
                return false;

            return Equals(other);
        }

        protected virtual bool Equals(
            ECDomainParameters other)
        {
            return curve.Equals(other.curve)
                &&	g.Equals(other.g)
                &&	n.Equals(other.n);
        }

        public override int GetHashCode()
        {
            //return Arrays.GetHashCode(new object[]{ curve, g, n });
            int hc = 4;
            hc *= 257;
            hc ^= curve.GetHashCode();
            hc *= 257;
            hc ^= g.GetHashCode();
            hc *= 257;
            hc ^= n.GetHashCode();
            return hc;
        }

        public BigInteger ValidatePrivateScalar(BigInteger d)
        {
            if (null == d)
                throw new ArgumentNullException("d", "Scalar cannot be null");

            if (d.CompareTo(BigInteger.One) < 0 || (d.CompareTo(N) >= 0))
                throw new ArgumentException("Scalar is not in the interval [1, n - 1]", "d");

            return d;
        }

        public ECPoint ValidatePublicPoint(ECPoint q)
        {
            return ValidatePublicPoint(Curve, q);
        }

        internal static ECPoint ValidatePublicPoint(ECCurve c, ECPoint q)
        {
            if (null == q)
                throw new ArgumentNullException("q", "Point cannot be null");

            q = ECAlgorithms.ImportPoint(c, q).Normalize();

            if (q.IsInfinity)
                throw new ArgumentException("Point at infinity", "q");

            if (!q.IsValid())
                throw new ArgumentException("Point not on curve", "q");

            return q;
        }
    }
}
