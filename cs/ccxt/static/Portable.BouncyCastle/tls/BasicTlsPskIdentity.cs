using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls
{
    /// <summary>A basic PSK Identity holder.</summary>
    public class BasicTlsPskIdentity
        : TlsPskIdentity
    {
        protected readonly byte[] m_identity;
        protected readonly byte[] m_psk;

        public BasicTlsPskIdentity(byte[] identity, byte[] psk)
        {
            this.m_identity = Arrays.Clone(identity);
            this.m_psk = Arrays.Clone(psk);
        }

        public BasicTlsPskIdentity(string identity, byte[] psk)
        {
            this.m_identity = Strings.ToUtf8ByteArray(identity);
            this.m_psk = Arrays.Clone(psk);
        }

        public virtual void SkipIdentityHint()
        {
        }

        public virtual void NotifyIdentityHint(byte[] psk_identity_hint)
        {
        }

        public virtual byte[] GetPskIdentity()
        {
            return m_identity;
        }

        public byte[] GetPsk()
        {
            return Arrays.Clone(m_psk);
        }
    }
}
