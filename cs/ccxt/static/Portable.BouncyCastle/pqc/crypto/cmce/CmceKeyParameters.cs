using System;

using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{
    public class CmceKeyParameters
        : AsymmetricKeyParameter
    {
        private CmceParameters parameters;

        public CmceKeyParameters(
            bool isPrivate,
            CmceParameters parameters)
            : base(isPrivate)
        {
            this.parameters = parameters;
        }

        public CmceParameters Parameters => parameters;
    }
}
