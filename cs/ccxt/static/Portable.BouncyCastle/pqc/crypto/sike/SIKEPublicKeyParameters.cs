using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
public class SIKEPublicKeyParameters
    : SIKEKeyParameters
{
    public byte[] publicKey;

    public byte[] GetPublicKey()
    {
        return Arrays.Clone(publicKey);
    }

    public byte[] GetEncoded()
    {
        return GetPublicKey();
    }

    public SIKEPublicKeyParameters(SIKEParameters param, byte[] publicKey)
    	: base(false, param)
    {
        this.publicKey = Arrays.Clone(publicKey);
    }
}

}