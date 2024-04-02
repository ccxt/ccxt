using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru
{
    public class NtruKeyGenerationParameters : KeyGenerationParameters
    {
        internal NtruParameters NtruParameters { get; }

        // We won't be using strength as the key length differs between public & private key
        public NtruKeyGenerationParameters(SecureRandom random, NtruParameters ntruParameters) : base(random, 1)
        {
            NtruParameters = ntruParameters;
        }

        public NtruParameters GetParameters()
        {
            return NtruParameters;
        }
    }
}