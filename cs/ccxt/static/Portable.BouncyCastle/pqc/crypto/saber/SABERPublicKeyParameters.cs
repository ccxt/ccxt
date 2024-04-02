using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Saber
{
    public class SABERPublicKeyParameters
        : SABERKeyParameters
    {
        public byte[] publicKey;

        public byte[] PublicKey => Arrays.Clone(publicKey);

        public byte[] GetEncoded()
        {
            return PublicKey;
        }

        public SABERPublicKeyParameters(SABERParameters parameters, byte[] publicKey)
            : base(false, parameters)
        {
            this.publicKey = Arrays.Clone(publicKey);
        }
    }
}