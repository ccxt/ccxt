
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    public class DilithiumPrivateKeyParameters
        : DilithiumKeyParameters
    {
        private byte[] privateKey;

        public DilithiumPrivateKeyParameters(DilithiumParameters parameters, byte[] skEncoded)
            : base(true, parameters)
        {
            privateKey = Arrays.Clone(skEncoded);
        }

        public byte[] GetEncoded()
        {
            return Arrays.Clone(privateKey);
        }
    }
}
