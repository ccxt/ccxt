using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    public sealed class PskIdentity
    {
        private readonly byte[] m_identity;
        private readonly long m_obfuscatedTicketAge;

        public PskIdentity(byte[] identity, long obfuscatedTicketAge)
        {
            if (null == identity)
                throw new ArgumentNullException("identity");
            if (identity.Length < 1 || !TlsUtilities.IsValidUint16(identity.Length))
                throw new ArgumentException("should have length from 1 to 65535", "identity");
            if (!TlsUtilities.IsValidUint32(obfuscatedTicketAge))
                throw new ArgumentException("should be a uint32", "obfuscatedTicketAge");

            this.m_identity = identity;
            this.m_obfuscatedTicketAge = obfuscatedTicketAge;
        }

        public int GetEncodedLength()
        {
            return 6 + m_identity.Length;
        }

        public byte[] Identity
        {
            get { return m_identity; }
        }

        public long ObfuscatedTicketAge
        {
            get { return m_obfuscatedTicketAge; }
        }

        public void Encode(Stream output)
        {
            TlsUtilities.WriteOpaque16(Identity, output);
            TlsUtilities.WriteUint32(ObfuscatedTicketAge, output);
        }

        public static PskIdentity Parse(Stream input)
        {
            byte[] identity = TlsUtilities.ReadOpaque16(input, 1);
            long obfuscatedTicketAge = TlsUtilities.ReadUint32(input);
            return new PskIdentity(identity, obfuscatedTicketAge);
        }

        public override bool Equals(object obj)
        {
            PskIdentity that = obj as PskIdentity;
            if (null == that)
                return false;

            return this.m_obfuscatedTicketAge == that.m_obfuscatedTicketAge
                && Arrays.ConstantTimeAreEqual(this.m_identity, that.m_identity);
        }

        public override int GetHashCode()
        {
            return Arrays.GetHashCode(m_identity) ^ m_obfuscatedTicketAge.GetHashCode();
        }
    }
}
