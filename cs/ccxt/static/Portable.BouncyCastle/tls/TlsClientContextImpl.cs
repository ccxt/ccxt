using System;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    internal class TlsClientContextImpl
        : AbstractTlsContext, TlsClientContext
    {
        internal TlsClientContextImpl(TlsCrypto crypto)
            : base(crypto, ConnectionEnd.client)
        {
        }

        public override bool IsServer
        {
            get { return false; }
        }
    }
}
