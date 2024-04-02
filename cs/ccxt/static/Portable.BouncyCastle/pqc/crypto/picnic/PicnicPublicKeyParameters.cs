
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Picnic
{
    public class PicnicPublicKeyParameters
        : PicnicKeyParameters
    {

    private byte[] publicKey;

    public PicnicPublicKeyParameters(PicnicParameters parameters, byte[] pkEncoded)
        : base(false, parameters)
    {
        publicKey = Arrays.Clone(pkEncoded);
    }

    public byte[] GetEncoded()
    {
        return Arrays.Clone(publicKey);
    }

    }
}