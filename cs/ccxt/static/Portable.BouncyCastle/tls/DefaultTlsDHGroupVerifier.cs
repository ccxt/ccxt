using System;
using System.Collections.Generic;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    public class DefaultTlsDHGroupVerifier
        : TlsDHGroupVerifier
    {
        public static readonly int DefaultMinimumPrimeBits = 2048;

        private static readonly List<DHGroup> DefaultGroups = new List<DHGroup>();

        private static void AddDefaultGroup(DHGroup dhGroup)
        {
            DefaultGroups.Add(dhGroup);
        }

        static DefaultTlsDHGroupVerifier()
        {
            /*
             * These 10 standard groups are those specified in NIST SP 800-56A Rev. 3 Appendix D. Make
             * sure to consider the impact on BCJSSE's FIPS mode and/or usage with the BCFIPS provider
             * before modifying this list.
             */

            AddDefaultGroup(DHStandardGroups.rfc3526_2048);
            AddDefaultGroup(DHStandardGroups.rfc3526_3072);
            AddDefaultGroup(DHStandardGroups.rfc3526_4096);
            AddDefaultGroup(DHStandardGroups.rfc3526_6144);
            AddDefaultGroup(DHStandardGroups.rfc3526_8192);

            AddDefaultGroup(DHStandardGroups.rfc7919_ffdhe2048);
            AddDefaultGroup(DHStandardGroups.rfc7919_ffdhe3072);
            AddDefaultGroup(DHStandardGroups.rfc7919_ffdhe4096);
            AddDefaultGroup(DHStandardGroups.rfc7919_ffdhe6144);
            AddDefaultGroup(DHStandardGroups.rfc7919_ffdhe8192);
        }

        // IList is (DHGroup)
        protected readonly IList<DHGroup> m_groups;
        protected readonly int m_minimumPrimeBits;

        /// <summary>Accept named groups and various standard DH groups with 'P' at least
        /// <see cref="DefaultMinimumPrimeBits"/> bits.</summary>
        public DefaultTlsDHGroupVerifier()
            : this(DefaultMinimumPrimeBits)
        {
        }

        /// <summary>Accept named groups and various standard DH groups with 'P' at least the specified number of bits.
        /// </summary>
        /// <param name="minimumPrimeBits">the minimum bitlength of 'P'.</param>
        public DefaultTlsDHGroupVerifier(int minimumPrimeBits)
            : this(DefaultGroups, minimumPrimeBits)
        {
        }

        /// <summary>Accept named groups and a custom set of group parameters, subject to a minimum bitlength for 'P'.
        /// </summary>
        /// <param name="groups">a <see cref="IList{T}">list</see> of acceptable <see cref="DHGroup"/>s.</param>
        /// <param name="minimumPrimeBits">the minimum bitlength of 'P'.</param>
        public DefaultTlsDHGroupVerifier(IList<DHGroup> groups, int minimumPrimeBits)
        {
            this.m_groups = new List<DHGroup>(groups);
            this.m_minimumPrimeBits = minimumPrimeBits;
        }

        public virtual bool Accept(DHGroup dhGroup)
        {
            return CheckMinimumPrimeBits(dhGroup) && CheckGroup(dhGroup);
        }

        public virtual int MinimumPrimeBits
        {
            get { return m_minimumPrimeBits; }
        }

        protected virtual bool AreGroupsEqual(DHGroup a, DHGroup b)
        {
            return a == b || (AreParametersEqual(a.P, b.P) && AreParametersEqual(a.G, b.G));
        }

        protected virtual bool AreParametersEqual(BigInteger a, BigInteger b)
        {
            return a == b || a.Equals(b);
        }

        protected virtual bool CheckGroup(DHGroup dhGroup)
        {
            foreach (DHGroup group in m_groups)
            {
                if (AreGroupsEqual(dhGroup, group))
                    return true;
            }
            return false;
        }

        protected virtual bool CheckMinimumPrimeBits(DHGroup dhGroup)
        {
            return dhGroup.P.BitLength >= MinimumPrimeBits;
        }
    }
}
