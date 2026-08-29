using System;

using Org.BouncyCastle.Crypto.Prng.Drbg;

namespace Org.BouncyCastle.Crypto.Prng
{
    internal interface IDrbgProvider
    {
        ISP80090Drbg Get(IEntropySource entropySource);
    }
}
