
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    public class DilithiumPublicKeyParameters
        : DilithiumKeyParameters
    {

    private byte[] publicKey;

    public DilithiumPublicKeyParameters(DilithiumParameters parameters, byte[] pkEncoded)
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
