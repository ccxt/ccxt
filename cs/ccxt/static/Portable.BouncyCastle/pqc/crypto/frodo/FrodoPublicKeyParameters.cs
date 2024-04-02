using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Frodo
{
    public class FrodoPublicKeyParameters
        : FrodoKeyParameters
    {
        private readonly byte[] m_publicKey;

        public byte[] PublicKey => Arrays.Clone(m_publicKey);

        public byte[] GetEncoded()
        {
            return PublicKey;
        }

        public FrodoPublicKeyParameters(FrodoParameters parameters, byte[] publicKey)
            : base(false, parameters)
        {
            m_publicKey = Arrays.Clone(publicKey);
        }
    }
}
