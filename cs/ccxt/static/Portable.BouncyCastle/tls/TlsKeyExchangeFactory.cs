using System;
using System.IO;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Interface for a key exchange factory offering a variety of specific algorithms.</summary>
    public interface TlsKeyExchangeFactory
    {
        /// <exception cref="IOException"/>
        TlsKeyExchange CreateDHKeyExchange(int keyExchange);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateDHanonKeyExchangeClient(int keyExchange, TlsDHGroupVerifier dhGroupVerifier);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateDHanonKeyExchangeServer(int keyExchange, TlsDHConfig dhConfig);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateDheKeyExchangeClient(int keyExchange, TlsDHGroupVerifier dhGroupVerifier);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateDheKeyExchangeServer(int keyExchange, TlsDHConfig dhConfig);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateECDHKeyExchange(int keyExchange);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateECDHanonKeyExchangeClient(int keyExchange);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateECDHanonKeyExchangeServer(int keyExchange, TlsECConfig ecConfig);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateECDheKeyExchangeClient(int keyExchange);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateECDheKeyExchangeServer(int keyExchange, TlsECConfig ecConfig);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreatePskKeyExchangeClient(int keyExchange, TlsPskIdentity pskIdentity,
            TlsDHGroupVerifier dhGroupVerifier);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreatePskKeyExchangeServer(int keyExchange, TlsPskIdentityManager pskIdentityManager,
            TlsDHConfig dhConfig, TlsECConfig ecConfig);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateRsaKeyExchange(int keyExchange);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateSrpKeyExchangeClient(int keyExchange, TlsSrpIdentity srpIdentity,
            TlsSrpConfigVerifier srpConfigVerifier);

        /// <exception cref="IOException"/>
        TlsKeyExchange CreateSrpKeyExchangeServer(int keyExchange, TlsSrpLoginParameters loginParameters);
    }
}
