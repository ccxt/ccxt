
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Picnic
{
    public class PicnicKeyParameters
        : AsymmetricKeyParameter
    {

        PicnicParameters parameters;

        public PicnicKeyParameters(bool isPrivate, PicnicParameters parameters)
            : base(isPrivate)
        {
            this.parameters = parameters;
        }

        public PicnicParameters Parameters => parameters;
    }
}