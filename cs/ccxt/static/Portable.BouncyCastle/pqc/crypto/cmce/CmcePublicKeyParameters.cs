using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{
    public class CmcePublicKeyParameters
        : CmceKeyParameters
    {
        private byte[] publicKey;

        public byte[] PublicKey => Arrays.Clone(publicKey);

        public byte[] GetEncoded()
        {
            return PublicKey;
        }

        public CmcePublicKeyParameters(CmceParameters parameters, byte[] publicKey)
            : base(false,  parameters)
        {
            this.publicKey = Arrays.Clone(publicKey);
        }
    }
}
