using Org.BouncyCastle.Crypto;


namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    public class FalconKeyParameters 
        : AsymmetricKeyParameter
    {
        private FalconParameters parameters;

        public FalconKeyParameters(bool isprivate, FalconParameters parameters)
            : base(isprivate)
        {
            this.parameters = parameters;
        }

        public FalconParameters Parameters
        {
            get { return parameters; }
        }
    }
}
