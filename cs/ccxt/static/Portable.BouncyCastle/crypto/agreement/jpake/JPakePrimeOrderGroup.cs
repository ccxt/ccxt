using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Crypto.Agreement.JPake
{
    /// <summary>
    /// A pre-computed prime order group for use during a J-PAKE exchange.
    ///
    /// Typically a Schnorr group is used.  In general, J-PAKE can use any prime order group
    /// that is suitable for public key cryptography, including elliptic curve cryptography.
    ///
    /// See JPakePrimeOrderGroups for convenient standard groups.
    ///
    /// NIST <a href="http://csrc.nist.gov/groups/ST/toolkit/documents/Examples/DSA2_All.pdf">publishes</a>
    /// many groups that can be used for the desired level of security.
    /// </summary>
    public class JPakePrimeOrderGroup
    {
        private readonly BigInteger p;
        private readonly BigInteger q;
        private readonly BigInteger g;

        /// <summary>
        /// Constructs a new JPakePrimeOrderGroup.
        ///
        /// In general, you should use one of the pre-approved groups from
        /// JPakePrimeOrderGroups, rather than manually constructing one.
        ///
        /// The following basic checks are performed:
        ///
        /// p-1 must be evenly divisible by q
        /// g must be in [2, p-1]
        /// g^q mod p must equal 1
        /// p must be prime (within reasonably certainty)
        /// q must be prime (within reasonably certainty)
        ///
        /// The prime checks are performed using BigInteger#isProbablePrime(int),
        /// and are therefore subject to the same probability guarantees.
        ///
        /// These checks prevent trivial mistakes.
        /// However, due to the small uncertainties if p and q are not prime,
        /// advanced attacks are not prevented.
        /// Use it at your own risk.
        /// 
        /// Throws NullReferenceException if any argument is null. Throws
        /// InvalidOperationException is any of the above validations fail.
        /// </summary>
        public JPakePrimeOrderGroup(BigInteger p, BigInteger q, BigInteger g)
            : this(p, q, g, false)
        {
             // Don't skip the checks on user-specified groups.
        }

        /// <summary>
        /// Constructor used by the pre-approved groups in JPakePrimeOrderGroups.
        /// These pre-approved groups can avoid the expensive checks.
        /// User-specified groups should not use this constructor.
        /// </summary>
        public JPakePrimeOrderGroup(BigInteger p, BigInteger q, BigInteger g, bool skipChecks)
        {
            JPakeUtilities.ValidateNotNull(p, "p");
            JPakeUtilities.ValidateNotNull(q, "q");
            JPakeUtilities.ValidateNotNull(g, "g");

            if (!skipChecks)
            {
                if (!p.Subtract(JPakeUtilities.One).Mod(q).Equals(JPakeUtilities.Zero))
                    throw new ArgumentException("p-1 must be evenly divisible by q");
                if (g.CompareTo(BigInteger.Two) == -1 || g.CompareTo(p.Subtract(JPakeUtilities.One)) == 1)
                    throw new ArgumentException("g must be in [2, p-1]");
                if (!g.ModPow(q, p).Equals(JPakeUtilities.One))
                    throw new ArgumentException("g^q mod p must equal 1");

                // Note these checks do not guarantee that p and q are prime.
                // We just have reasonable certainty that they are prime.
                if (!p.IsProbablePrime(20))
                    throw new ArgumentException("p must be prime");
                if (!q.IsProbablePrime(20))
                    throw new ArgumentException("q must be prime");
            }

            this.p = p;
            this.q = q;
            this.g = g;
        }

        public virtual BigInteger P
        {
            get { return p; }
        }

        public virtual BigInteger Q
        {
            get { return q; }
        }

        public virtual BigInteger G
        {
            get { return g; }
        }
    }
}
