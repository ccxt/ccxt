using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{
    public class CmceKeyGenerationParameters
        : KeyGenerationParameters
    {
        private CmceParameters parameters;

        public CmceKeyGenerationParameters(
            SecureRandom random,
            CmceParameters CmceParams)
            : base(random, 256)
        {
            this.parameters = CmceParams;
        }

        public CmceParameters Parameters => parameters;
    }
}
