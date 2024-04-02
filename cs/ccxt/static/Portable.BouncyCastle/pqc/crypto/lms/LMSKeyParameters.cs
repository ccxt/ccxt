

using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public abstract class LMSKeyParameters
        : AsymmetricKeyParameter, IEncodable
    {
        protected LMSKeyParameters(bool isPrivateKey)
            : base(isPrivateKey) { }

        public abstract byte[] GetEncoded();
    }
    
}