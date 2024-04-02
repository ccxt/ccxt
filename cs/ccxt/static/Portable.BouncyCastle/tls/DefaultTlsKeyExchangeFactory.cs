using System;

using Org.BouncyCastle.Tls.Crypto;

namespace Org.BouncyCastle.Tls
{
    public class DefaultTlsKeyExchangeFactory
        : AbstractTlsKeyExchangeFactory
    {
        public override TlsKeyExchange CreateDHKeyExchange(int keyExchange)
        {
            return new TlsDHKeyExchange(keyExchange);
        }

        public override TlsKeyExchange CreateDHanonKeyExchangeClient(int keyExchange,
            TlsDHGroupVerifier dhGroupVerifier)
        {
            return new TlsDHanonKeyExchange(keyExchange, dhGroupVerifier);
        }

        public override TlsKeyExchange CreateDHanonKeyExchangeServer(int keyExchange, TlsDHConfig dhConfig)
        {
            return new TlsDHanonKeyExchange(keyExchange, dhConfig);
        }

        public override TlsKeyExchange CreateDheKeyExchangeClient(int keyExchange, TlsDHGroupVerifier dhGroupVerifier)
        {
            return new TlsDheKeyExchange(keyExchange, dhGroupVerifier);
        }

        public override TlsKeyExchange CreateDheKeyExchangeServer(int keyExchange, TlsDHConfig dhConfig)
        {
            return new TlsDheKeyExchange(keyExchange, dhConfig);
        }

        public override TlsKeyExchange CreateECDHKeyExchange(int keyExchange)
        {
            return new TlsECDHKeyExchange(keyExchange);
        }

        public override TlsKeyExchange CreateECDHanonKeyExchangeClient(int keyExchange)
        {
            return new TlsECDHanonKeyExchange(keyExchange);
        }

        public override TlsKeyExchange CreateECDHanonKeyExchangeServer(int keyExchange, TlsECConfig ecConfig)
        {
            return new TlsECDHanonKeyExchange(keyExchange, ecConfig);
        }

        public override TlsKeyExchange CreateECDheKeyExchangeClient(int keyExchange)
        {
            return new TlsECDheKeyExchange(keyExchange);
        }

        public override TlsKeyExchange CreateECDheKeyExchangeServer(int keyExchange, TlsECConfig ecConfig)
        {
            return new TlsECDheKeyExchange(keyExchange, ecConfig);
        }

        public override TlsKeyExchange CreatePskKeyExchangeClient(int keyExchange, TlsPskIdentity pskIdentity,
            TlsDHGroupVerifier dhGroupVerifier)
        {
            return new TlsPskKeyExchange(keyExchange, pskIdentity, dhGroupVerifier);
        }

        public override TlsKeyExchange CreatePskKeyExchangeServer(int keyExchange,
            TlsPskIdentityManager pskIdentityManager, TlsDHConfig dhConfig, TlsECConfig ecConfig)
        {
            return new TlsPskKeyExchange(keyExchange, pskIdentityManager, dhConfig, ecConfig);
        }

        public override TlsKeyExchange CreateRsaKeyExchange(int keyExchange)
        {
            return new TlsRsaKeyExchange(keyExchange);
        }

        public override TlsKeyExchange CreateSrpKeyExchangeClient(int keyExchange, TlsSrpIdentity srpIdentity,
            TlsSrpConfigVerifier srpConfigVerifier)
        {
            return new TlsSrpKeyExchange(keyExchange, srpIdentity, srpConfigVerifier);
        }

        public override TlsKeyExchange CreateSrpKeyExchangeServer(int keyExchange, TlsSrpLoginParameters loginParameters)
        {
            return new TlsSrpKeyExchange(keyExchange, loginParameters);
        }
    }
}
