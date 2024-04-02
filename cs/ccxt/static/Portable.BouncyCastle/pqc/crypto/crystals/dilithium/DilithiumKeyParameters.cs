
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    public class DilithiumKeyParameters
        : AsymmetricKeyParameter
    {
        DilithiumParameters parameters;

        public DilithiumKeyParameters(bool isPrivate, DilithiumParameters parameters) : base(isPrivate)
        {
            this.parameters = parameters;
        }

        public DilithiumParameters Parameters => parameters;
    }
}
