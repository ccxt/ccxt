using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru
{
    public abstract class NtruKeyParameters : AsymmetricKeyParameter
    {
        public NtruParameters Parameters { get; }

        public NtruKeyParameters(bool privateKey, NtruParameters parameters) : base(privateKey)
        {
            Parameters = parameters;
        }

        public abstract byte[] GetEncoded();

        public NtruParameters GetParameters()
        {
            return Parameters;
        }
    }
}