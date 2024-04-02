using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
public class SIKEKeyParameters
    : AsymmetricKeyParameter
{
    private SIKEParameters param;

    public SIKEKeyParameters(
            bool isPrivate,
            SIKEParameters param
    )
    	:base(isPrivate)
    {
        this.param = param;
    }

    public SIKEParameters GetParameters()
    {
        return param;
    }
}

}