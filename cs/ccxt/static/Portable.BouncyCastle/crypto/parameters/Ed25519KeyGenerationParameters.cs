using System;

using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class Ed25519KeyGenerationParameters
        : KeyGenerationParameters
    {
        public Ed25519KeyGenerationParameters(SecureRandom random)
            : base(random, 256)
        {
        }
    }
}
