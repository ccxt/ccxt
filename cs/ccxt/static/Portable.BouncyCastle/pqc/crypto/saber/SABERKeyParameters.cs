
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Saber
{
    public class SABERKeyParameters
        : AsymmetricKeyParameter
    {
        private SABERParameters parameters;

        public SABERKeyParameters(
            bool isPrivate,
            SABERParameters parameters)
            : base(isPrivate)
        {
            this.parameters = parameters;
        }

        public SABERParameters GetParameters()
        {
            return parameters;
        }
    }
}