using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    /// <summary>Basic config for Diffie-Hellman.</summary>
    public class TlsDHConfig
    {
        protected readonly DHGroup m_explicitGroup;
        protected readonly int m_namedGroup;
        protected readonly bool m_padded;

        public TlsDHConfig(DHGroup explicitGroup)
        {
            this.m_explicitGroup = explicitGroup;
            this.m_namedGroup = -1;
            this.m_padded = false;
        }

        public TlsDHConfig(int namedGroup, bool padded)
        {
            this.m_explicitGroup = null;
            this.m_namedGroup = namedGroup;
            this.m_padded = padded;
        }

        public virtual DHGroup ExplicitGroup
        {
            get { return m_explicitGroup; }
        }

        public virtual int NamedGroup
        {
            get { return m_namedGroup; }
        }

        public virtual bool IsPadded
        {
            get { return m_padded; }
        }
    }
}
