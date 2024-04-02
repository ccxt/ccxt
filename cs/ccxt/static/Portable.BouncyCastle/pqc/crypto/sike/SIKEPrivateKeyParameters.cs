using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
public class SIKEPrivateKeyParameters
    : SIKEKeyParameters
{
    private byte[] privateKey;

    public byte[] GetPrivateKey()
    {
        return Arrays.Clone(privateKey);
    }

    public SIKEPrivateKeyParameters(SIKEParameters param, byte[] privateKey)
    	:base(true, param)
    {
        this.privateKey = Arrays.Clone(privateKey);
    }

    public byte[] GetEncoded()
    {
        return Arrays.Clone(privateKey);
    }
}

}