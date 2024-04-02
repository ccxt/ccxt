
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Picnic
{
    public class PicnicPrivateKeyParameters
        : PicnicKeyParameters
    {
        private byte[] privateKey;

        public PicnicPrivateKeyParameters(PicnicParameters parameters, byte[] skEncoded)
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