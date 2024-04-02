using System;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    public class NtruLPRimePrivateKeyParameters : NtruLPRimeKeyParameters
    {
        internal byte[] privKey;

        public byte[] GetPrivateKey()
        {
            return Arrays.Clone(privKey);
        }

        public NtruLPRimePrivateKeyParameters(NtruLPRimeParameters primeParameters, byte[] privKey) : base(true, primeParameters)
        {
            this.privKey = Arrays.Clone(privKey);
        }
        
        public byte[] GetEncoded()
        {
            return GetPrivateKey();
        }
    }
}
