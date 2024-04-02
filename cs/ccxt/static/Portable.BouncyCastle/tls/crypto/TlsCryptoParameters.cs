using System;

namespace Org.BouncyCastle.Tls.Crypto
{
    // TODO[tls-port] Would rather this be sealed
    /// <summary>Carrier class for context-related parameters needed for creating secrets and ciphers.</summary>
    public class TlsCryptoParameters
    {
        private readonly TlsContext m_context;

        /// <summary>Base constructor.</summary>
        /// <param name="context">the context for this parameters object.</param>
        public TlsCryptoParameters(TlsContext context)
        {
            this.m_context = context;
        }

        public SecurityParameters SecurityParameters
        {
            get { return m_context.SecurityParameters; }
        }

        public ProtocolVersion ClientVersion
        {
            get { return m_context.ClientVersion; }
        }

        public ProtocolVersion RsaPreMasterSecretVersion
        {
            get { return m_context.RsaPreMasterSecretVersion; }
        }

        // TODO[tls-port] Would rather this be non-virtual
        public virtual ProtocolVersion ServerVersion
        {
            get { return m_context.ServerVersion; }
        }

        public bool IsServer
        {
            get { return m_context.IsServer; }
        }

        public TlsNonceGenerator NonceGenerator
        {
            get { return m_context.NonceGenerator; }
        }
    }
}
