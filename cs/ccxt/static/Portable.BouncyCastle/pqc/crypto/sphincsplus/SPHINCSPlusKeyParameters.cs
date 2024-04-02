using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    public class SPHINCSPlusKeyParameters
        : AsymmetricKeyParameter
    {
        SPHINCSPlusParameters parameters;

        protected SPHINCSPlusKeyParameters(bool isPrivate, SPHINCSPlusParameters parameters)
            : base(isPrivate)
        {
            this.parameters = parameters;
        }

        public SPHINCSPlusParameters GetParameters()
        {
            return parameters;
        }
    }
}