
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Frodo
{
    public class FrodoKeyParameters
        : AsymmetricKeyParameter
    {
        private FrodoParameters parameters;

        public FrodoKeyParameters(
            bool isPrivate,
            FrodoParameters parameters)
            : base(isPrivate)
        {
            this.parameters = parameters;
        }

        public FrodoParameters Parameters => parameters;

    }
}