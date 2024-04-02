using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
public class SIKEKeyGenerationParameters
    : KeyGenerationParameters
{
    private SIKEParameters param;

    public SIKEKeyGenerationParameters(
            SecureRandom random,
            SIKEParameters sikeParameters
    )
    	: base(random, 256)
    {
        this.param = sikeParameters;
    }
    public SIKEParameters GetParameters()
    {
        return param;
    }
}

}